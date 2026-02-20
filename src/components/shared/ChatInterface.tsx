import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Paperclip, Image as ImageIcon } from "lucide-react";

/** API message shape from backend (MessageSerializer). */
export interface ApiMessage {
  id: number;
  sender: number;
  receiver: number;
  message: string;
  created_at: string;
  sender_username?: string;
  receiver_username?: string;
}

export interface ChatMessage {
  id: string | number;
  from: string;
  to: string;
  message: string;
  timestamp: string;
  read?: boolean;
}

function normalizeMessage(m: ApiMessage, currentUserId: number): ChatMessage & { isFromMe: boolean } {
  const isFromMe = Number(m.sender) === Number(currentUserId);
  return {
    id: m.id,
    from: String(m.sender),
    to: String(m.receiver),
    message: m.message,
    timestamp: m.created_at,
    isFromMe,
  };
}

interface ChatInterfaceProps {
  /** Current user's ID (number) for comparing sender. */
  currentUserId: number;
  /** Partner user ID (number). */
  partnerId: number | null;
  /** Messages from API (sender, receiver, message, created_at, ...). */
  messages: ApiMessage[];
  /** Callback when user sends a message; parent should call API then refetch. */
  onSend: (message: string) => Promise<void>;
  /** Optional: loading state to disable send. */
  sending?: boolean;
}

export const ChatInterface = ({ currentUserId, partnerId, messages, onSend, sending = false }: ChatInterfaceProps) => {
  const [newMessage, setNewMessage] = useState("");
  const messageList = Array.isArray(messages) ? messages : [];

  const list = messageList
    .filter(
      (m) =>
        (Number(m.sender) === Number(currentUserId) && Number(m.receiver) === Number(partnerId)) ||
        (Number(m.receiver) === Number(currentUserId) && Number(m.sender) === Number(partnerId))
    )
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    .map((m) => normalizeMessage(m, currentUserId));

  const handleSend = async () => {
    const text = newMessage.trim();
    if (!text || sending || partnerId == null) return;
    setNewMessage("");
    await onSend(text);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {list.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">No messages yet. Start the conversation!</p>
        )}
        {list.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isFromMe ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                msg.isFromMe
                  ? "gold-gradient text-primary-foreground rounded-br-md"
                  : "bg-muted rounded-bl-md"
              }`}
            >
              <p>{msg.message}</p>
              <p className={`text-[10px] mt-1 ${msg.isFromMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border p-3 flex gap-2">
        <Button variant="ghost" size="icon" className="h-10 w-10 flex-shrink-0 text-muted-foreground" type="button">
          <Paperclip className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-10 w-10 flex-shrink-0 text-muted-foreground" type="button">
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="h-10"
          disabled={partnerId == null || sending}
        />
        <Button
          onClick={handleSend}
          size="icon"
          className="gold-gradient text-primary-foreground h-10 w-10 neon-glow-sm flex-shrink-0"
          disabled={!newMessage.trim() || partnerId == null || sending}
          type="button"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
