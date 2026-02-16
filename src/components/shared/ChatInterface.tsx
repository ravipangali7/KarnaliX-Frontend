import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Paperclip, Image as ImageIcon } from "lucide-react";

export interface ChatMessage {
  id: string;
  from: string;
  to: string;
  message: string;
  timestamp: string;
  read?: boolean;
}

interface ChatInterfaceProps {
  currentUser: string;
  otherUser: string;
  initialMessages?: ChatMessage[];
}

export const ChatInterface = ({ currentUser, otherUser, initialMessages = [] }: ChatInterfaceProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(
    initialMessages.filter(
      (m) =>
        (m.from === currentUser && m.to === otherUser) ||
        (m.from === otherUser && m.to === currentUser)
    )
  );

  const handleSend = () => {
    if (!newMessage.trim()) return;
    setChatMessages([
      ...chatMessages,
      {
        id: `msg-${Date.now()}`,
        from: currentUser,
        to: otherUser,
        message: newMessage,
        timestamp: new Date().toISOString(),
        read: false,
      },
    ]);
    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {chatMessages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">No messages yet. Start the conversation!</p>
        )}
        {chatMessages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.from === currentUser ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                msg.from === currentUser
                  ? "gold-gradient text-primary-foreground rounded-br-md"
                  : "bg-muted rounded-bl-md"
              }`}
            >
              <p>{msg.message}</p>
              <p className={`text-[10px] mt-1 ${msg.from === currentUser ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border p-3 flex gap-2">
        <Button variant="ghost" size="icon" className="h-10 w-10 flex-shrink-0 text-muted-foreground">
          <Paperclip className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-10 w-10 flex-shrink-0 text-muted-foreground">
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="h-10"
        />
        <Button onClick={handleSend} size="icon" className="gold-gradient text-primary-foreground h-10 w-10 neon-glow-sm flex-shrink-0">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
