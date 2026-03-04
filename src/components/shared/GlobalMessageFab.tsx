import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/contexts/AuthContext";
import { getPlayerMessages, getPlayerUnreadMessageCount, sendPlayerMessage, sendPlayerMessageForm } from "@/api/player";
import { getUnreadMessageCount } from "@/api/admin";
import { useMessageSocket } from "@/hooks/useMessageSocket";
import { ChatInterface, type ApiMessage, type SendPayload } from "@/components/shared/ChatInterface";
import AdminMessages from "@/pages/admin/AdminMessages";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";

const POLL_INTERVAL_MS = 4000;

const FAB_COLORS: Record<UserRole, string> = {
  player: "#25D366",
  powerhouse: "#7c3aed",
  super: "#2563eb",
  master: "#f59e0b",
};

/**
 * Floating message button for any logged-in user (player, powerhouse, super, master).
 * Shown across the whole site with role-specific color. Opens bottom sheet chat.
 */
export const GlobalMessageFab = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const role = user?.role ?? null;
  const partnerId = role === "player" ? (user?.parent ?? null) : null;
  const adminRole = role === "powerhouse" || role === "super" || role === "master" ? role : null;

  const { data: playerUnread = 0 } = useQuery({
    queryKey: ["player-messages-unread"],
    queryFn: getPlayerUnreadMessageCount,
    enabled: role === "player",
  });
  const { data: adminUnread = 0 } = useQuery({
    queryKey: ["admin-messages-unread", adminRole],
    queryFn: () => getUnreadMessageCount(adminRole!),
    enabled: adminRole != null,
  });
  const unread = role === "player" ? Number(playerUnread) || 0 : Number(adminUnread) || 0;

  const { connected } = useMessageSocket((msg) => {
    if (role === "player" && partnerId != null) {
      if (Number(msg.sender) === Number(partnerId) || Number(msg.receiver) === Number(partnerId)) {
        queryClient.invalidateQueries({ queryKey: ["player-messages", partnerId] });
        queryClient.invalidateQueries({ queryKey: ["player-messages-unread"] });
      }
    } else if (adminRole != null) {
      queryClient.invalidateQueries({ queryKey: ["admin-messages-unread", adminRole] });
      queryClient.invalidateQueries({ queryKey: ["admin-messages", adminRole] });
    }
  });

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["player-messages", partnerId],
    queryFn: () => getPlayerMessages(partnerId ?? undefined),
    enabled: role === "player" && open && partnerId != null,
    refetchInterval: connected ? false : open && partnerId != null ? POLL_INTERVAL_MS : false,
  });

  const [sending, setSending] = useState(false);

  const handlePlayerSend = async (messageOrPayload: string | SendPayload) => {
    if (partnerId == null) return;
    setSending(true);
    try {
      if (typeof messageOrPayload === "string") {
        await sendPlayerMessage({ receiver: partnerId, message: messageOrPayload });
      } else {
        const { message, file, image } = messageOrPayload;
        const formData = new FormData();
        formData.append("receiver", String(partnerId));
        formData.append("message", message);
        if (file) formData.append("file", file);
        if (image) formData.append("image", image);
        await sendPlayerMessageForm(formData);
      }
      await queryClient.invalidateQueries({ queryKey: ["player-messages", partnerId] });
      await queryClient.invalidateQueries({ queryKey: ["player-messages-unread"] });
    } catch (e) {
      const err = e as { detail?: string };
      toast.error(err?.detail ?? "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next && role === "player") queryClient.invalidateQueries({ queryKey: ["player-messages-unread"] });
    if (next && adminRole) queryClient.invalidateQueries({ queryKey: ["admin-messages-unread", adminRole] });
  };

  if (!user || !role) return null;

  const fabColor = FAB_COLORS[role];
  const isPlayer = role === "player";
  const showPlayerSheet = isPlayer && partnerId != null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-40 md:bottom-6 h-14 w-14 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
        style={{ backgroundColor: fabColor }}
        aria-label="Open messages"
      >
        <MessageCircle className="h-7 w-7" />
        {unread > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-gray-400 border-2 border-white"
            style={{ borderColor: fabColor }}
          />
        )}
      </button>

      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent side="bottom" className="h-[85vh] max-h-[85vh] flex flex-col p-0 rounded-t-2xl">
          {showPlayerSheet ? (
            <>
              <SheetHeader className="p-4 border-b border-border flex-shrink-0">
                <SheetTitle className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full gold-gradient flex items-center justify-center neon-glow-sm">
                    <MessageCircle className="h-4 w-4 text-primary-foreground" />
                  </div>
                  Chat with Master
                </SheetTitle>
              </SheetHeader>
              <div className="flex-1 min-h-0 flex flex-col">
                {isLoading ? (
                  <p className="text-center text-sm text-muted-foreground py-8">Loading messages…</p>
                ) : (
                  <ChatInterface
                    currentUserId={user.id}
                    partnerId={partnerId}
                    messages={messages as ApiMessage[]}
                    onSend={handlePlayerSend}
                    sending={sending}
                  />
                )}
              </div>
            </>
          ) : isPlayer ? (
            <div className="flex-1 flex items-center justify-center p-8 text-muted-foreground text-sm">
              No master assigned. Contact support.
            </div>
          ) : adminRole ? (
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <SheetHeader className="p-4 border-b border-border flex-shrink-0">
                <SheetTitle className="flex items-center gap-3">
                  <div
                    className="h-9 w-9 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: fabColor }}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  Messages
                </SheetTitle>
              </SheetHeader>
              <div className="flex-1 min-h-0 overflow-hidden">
                <AdminMessages role={adminRole} />
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
};
