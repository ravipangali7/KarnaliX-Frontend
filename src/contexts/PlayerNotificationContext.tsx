import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getPlayerMessageContacts,
  getPlayerMessages,
  getPlayerNotifications,
  sendPlayerMessage,
  sendPlayerMessageForm,
} from "@/api/player";
import { useMessageSocket } from "@/hooks/useMessageSocket";
import { ChatInterface, type ApiMessage, type SendPayload } from "@/components/shared/ChatInterface";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type PlayerNotificationContextValue = {
  isOpen: boolean;
  openModal: () => void;
  openChat: (contactId?: number) => void;
  closeModal: () => void;
};

const PlayerNotificationContext = createContext<PlayerNotificationContextValue | null>(null);

export function usePlayerNotification() {
  const ctx = useContext(PlayerNotificationContext);
  return ctx;
}

function formatTimeAgo(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const sec = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (sec < 60) return "Just now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  if (sec < 604800) return `${Math.floor(sec / 86400)}d ago`;
  return d.toLocaleDateString();
}

export function PlayerNotificationProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"notifications" | "chat">("notifications");
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isPlayer = user?.role === "player";
  const parentId = user?.parent ?? null;

  const openModal = useCallback(() => {
    setActiveTab("notifications");
    setSelectedContactId(null);
    setIsOpen(true);
  }, []);
  const openChat = useCallback((contactId?: number) => {
    setActiveTab("chat");
    if (typeof contactId === "number" && !Number.isNaN(contactId)) {
      setSelectedContactId(contactId);
    } else {
      setSelectedContactId(parentId);
    }
    setIsOpen(true);
  }, [parentId]);
  const closeModal = useCallback(() => setIsOpen(false), []);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["player-notifications"],
    queryFn: getPlayerNotifications,
    enabled: isOpen && isPlayer,
  });

  const { connected } = useMessageSocket((msg) => {
    const sender = Number(msg.sender);
    const receiver = Number(msg.receiver);
    if (selectedContactId != null && (sender === selectedContactId || receiver === selectedContactId)) {
      queryClient.invalidateQueries({ queryKey: ["player-messages", selectedContactId] });
    }
    queryClient.invalidateQueries({ queryKey: ["player-message-contacts"] });
    queryClient.invalidateQueries({ queryKey: ["player-messages-unread"] });
    queryClient.invalidateQueries({ queryKey: ["player-notifications"] });
  });

  const { data: contactsData = [] } = useQuery({
    queryKey: ["player-message-contacts"],
    queryFn: getPlayerMessageContacts,
    enabled: isOpen && isPlayer && activeTab === "chat",
  });

  const contacts = useMemo(() => (Array.isArray(contactsData) ? contactsData : []), [contactsData]);

  const effectiveContactId = selectedContactId ?? parentId;

  const { data: messagesData = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ["player-messages", effectiveContactId],
    queryFn: () => getPlayerMessages(effectiveContactId ?? undefined),
    enabled: isOpen && isPlayer && activeTab === "chat" && effectiveContactId != null,
    refetchInterval: connected ? false : isOpen && effectiveContactId != null ? 4000 : false,
  });

  const messages = Array.isArray(messagesData) ? (messagesData as ApiMessage[]) : [];

  const handleSend = async (messageOrPayload: string | SendPayload) => {
    if (effectiveContactId == null || effectiveContactId !== parentId) return;
    setSending(true);
    try {
      if (typeof messageOrPayload === "string") {
        await sendPlayerMessage({ receiver: effectiveContactId, message: messageOrPayload });
      } else {
        const formData = new FormData();
        formData.append("receiver", String(effectiveContactId));
        formData.append("message", messageOrPayload.message);
        if (messageOrPayload.file) formData.append("file", messageOrPayload.file);
        if (messageOrPayload.image) formData.append("image", messageOrPayload.image);
        await sendPlayerMessageForm(formData);
      }
      await queryClient.invalidateQueries({ queryKey: ["player-messages", effectiveContactId] });
      await queryClient.invalidateQueries({ queryKey: ["player-message-contacts"] });
      await queryClient.invalidateQueries({ queryKey: ["player-messages-unread"] });
      await queryClient.invalidateQueries({ queryKey: ["player-notifications"] });
    } catch (e) {
      const err = e as { detail?: string };
      toast.error(err?.detail ?? "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleNotificationClick = (senderId: number) => {
    setActiveTab("chat");
    setSelectedContactId(senderId);
    queryClient.invalidateQueries({ queryKey: ["player-messages-unread"] });
    queryClient.invalidateQueries({ queryKey: ["player-message-contacts"] });
    queryClient.invalidateQueries({ queryKey: ["player-notifications"] });
  };

  const handleViewAllMessages = () => {
    setActiveTab("chat");
    setSelectedContactId(parentId);
    queryClient.invalidateQueries({ queryKey: ["player-messages-unread"] });
  };

  const value: PlayerNotificationContextValue = { isOpen, openModal, openChat, closeModal };
  const selectedContact = contacts.find((c) => c.id === effectiveContactId);
  const canSend = effectiveContactId != null && effectiveContactId === parentId;

  return (
    <PlayerNotificationContext.Provider value={value}>
      {children}
      {isPlayer && (
        <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
          <DialogContent className="left-0 top-auto bottom-0 translate-x-0 translate-y-0 w-screen max-w-none max-h-[96vh] rounded-t-2xl sm:rounded-t-2xl sm:rounded-b-none flex flex-col p-0 gap-0 overflow-hidden">
            <DialogHeader className="p-4 border-b border-border flex-shrink-0">
              <DialogTitle className="flex items-center gap-3 justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full gold-gradient flex items-center justify-center neon-glow-sm">
                    <MessageCircle className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span>Messages</span>
                </div>
                <div className="inline-flex rounded-md border border-border p-1 bg-muted/30">
                  <Button
                    type="button"
                    variant={activeTab === "notifications" ? "default" : "ghost"}
                    size="sm"
                    className="h-8"
                    onClick={() => setActiveTab("notifications")}
                  >
                    Notifications
                  </Button>
                  <Button
                    type="button"
                    variant={activeTab === "chat" ? "default" : "ghost"}
                    size="sm"
                    className="h-8"
                    onClick={() => {
                      setActiveTab("chat");
                      if (selectedContactId == null) setSelectedContactId(parentId);
                    }}
                  >
                    Chat
                  </Button>
                </div>
              </DialogTitle>
            </DialogHeader>
            {activeTab === "notifications" ? (
              <>
                <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
                  {isLoading ? (
                    <p className="p-4 text-center text-sm text-muted-foreground">Loading…</p>
                  ) : notifications.length === 0 ? (
                    <p className="p-4 text-center text-sm text-muted-foreground">No new notifications</p>
                  ) : (
                    <ul className="divide-y divide-border">
                      {notifications.map((n) => (
                        <li key={n.id}>
                          <button
                            type="button"
                            onClick={() => handleNotificationClick(n.sender_id)}
                            className="w-full text-left p-4 hover:bg-muted/50 transition-colors flex flex-col gap-1"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium text-sm truncate">
                                {n.sender_name || n.sender_username || "User"}
                              </span>
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                {formatTimeAgo(n.created_at)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{n.message || "-"}</p>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="p-3 border-t border-border flex-shrink-0">
                  <Button variant="outline" className="w-full" onClick={handleViewAllMessages}>
                    View all messages
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[260px_minmax(0,1fr)]">
                <div className="border-r border-border overflow-y-auto min-h-0">
                  {contacts.length === 0 && parentId == null ? (
                    <p className="p-4 text-sm text-muted-foreground">No master assigned. Contact support.</p>
                  ) : (
                    <>
                      {contacts.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setSelectedContactId(c.id);
                            queryClient.invalidateQueries({ queryKey: ["player-message-contacts"] });
                            queryClient.invalidateQueries({ queryKey: ["player-messages-unread"] });
                          }}
                          className={`w-full text-left p-3 border-b border-border hover:bg-muted/50 transition-colors ${effectiveContactId === c.id ? "bg-muted/40" : ""}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{c.name || c.username}</p>
                              <p className="text-xs text-muted-foreground capitalize">{c.role}</p>
                            </div>
                            {(c.unread_count ?? 0) > 0 && (
                              <Badge variant="destructive" className="text-[10px] min-w-5 h-5 justify-center px-1">
                                {(c.unread_count ?? 0) > 99 ? "99+" : c.unread_count}
                              </Badge>
                            )}
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                </div>
                <div className="flex flex-col min-h-0">
                  <div className="px-3 py-2 border-b border-border text-sm font-medium truncate">
                    {selectedContact?.name ?? selectedContact?.username ?? "Select a conversation"}
                    {!canSend && effectiveContactId != null && (
                      <span className="text-xs text-muted-foreground ml-2">(read-only)</span>
                    )}
                  </div>
                  <div className="flex-1 min-h-0">
                    {effectiveContactId == null ? (
                      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                        Select a conversation
                      </div>
                    ) : isLoadingMessages ? (
                      <p className="text-center text-sm text-muted-foreground py-8">Loading…</p>
                    ) : (
                      <ChatInterface
                        currentUserId={user?.id ?? 0}
                        partnerId={effectiveContactId}
                        messages={messages}
                        onSend={handleSend}
                        sending={sending}
                        readOnly={!canSend}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </PlayerNotificationContext.Provider>
  );
}
