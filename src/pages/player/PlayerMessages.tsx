import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChatInterface, type ApiMessage } from "@/components/shared/ChatInterface";
import { MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getPlayerMessages, sendPlayerMessage } from "@/api/player";
import { useMessageSocket } from "@/hooks/useMessageSocket";
import { toast } from "sonner";

const POLL_INTERVAL_MS = 4000;

const PlayerMessages = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const partnerId = user?.parent ?? null;

  const { connected } = useMessageSocket((msg) => {
    if (partnerId == null) return;
    if (Number(msg.sender) === Number(partnerId) || Number(msg.receiver) === Number(partnerId)) {
      queryClient.invalidateQueries({ queryKey: ["player-messages", partnerId] });
    }
  });

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["player-messages", partnerId],
    queryFn: () => getPlayerMessages(partnerId ?? undefined),
    enabled: partnerId != null,
    refetchInterval: connected ? false : partnerId != null ? POLL_INTERVAL_MS : false,
  });

  const [sending, setSending] = useState(false);

  const handleSend = async (message: string) => {
    if (partnerId == null) return;
    setSending(true);
    try {
      const created = (await sendPlayerMessage({ receiver: partnerId, message })) as ApiMessage | undefined;
      if (created && typeof created === "object" && "id" in created) {
        queryClient.setQueryData<ApiMessage[]>(
          ["player-messages", partnerId],
          (prev = []) => [...prev, created as ApiMessage]
        );
      }
      await queryClient.invalidateQueries({ queryKey: ["player-messages", partnerId] });
    } catch (e) {
      const err = e as { detail?: string };
      toast.error(err?.detail ?? "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const apiMessages = messages as ApiMessage[];

  return (
    <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] flex flex-col max-w-3xl mx-auto">
      <div className="p-4 border-b border-border gaming-card">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full gold-gradient flex items-center justify-center neon-glow-sm">
            <MessageCircle className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-display font-semibold">Chat with Master</h2>
            <p className="text-xs text-muted-foreground">
              {partnerId != null
                ? "Messages sync automatically"
                : "You are not assigned to a master."}
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        {partnerId == null ? (
          <p className="text-center text-sm text-muted-foreground py-8">No master assigned. Contact support.</p>
        ) : isLoading ? (
          <p className="text-center text-sm text-muted-foreground py-8">Loading messages…</p>
        ) : (
          <ChatInterface
            currentUserId={user?.id ?? 0}
            partnerId={partnerId}
            messages={apiMessages}
            onSend={handleSend}
            sending={sending}
          />
        )}
      </div>
    </div>
  );
};

export default PlayerMessages;
