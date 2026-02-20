import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Paperclip, Image as ImageIcon } from "lucide-react";
import { getMediaUrl } from "@/lib/api";

/** API message shape from backend (MessageSerializer). */
export interface ApiMessage {
  id: number;
  sender: number;
  receiver: number;
  message: string;
  created_at: string;
  sender_username?: string;
  receiver_username?: string;
  file?: string | null;
  image?: string | null;
}

export interface ChatMessage {
  id: string | number;
  from: string;
  to: string;
  message: string;
  timestamp: string;
  read?: boolean;
  file?: string | null;
  image?: string | null;
}

export interface SendAttachments {
  file?: File;
  image?: File;
}

function normalizeMessage(m: ApiMessage, currentUserId: number): ChatMessage & { isFromMe: boolean } {
  const isFromMe = Number(m.sender) === Number(currentUserId);
  return {
    id: m.id,
    from: String(m.sender),
    to: String(m.receiver),
    message: m.message || "",
    timestamp: m.created_at,
    isFromMe,
    file: m.file ?? null,
    image: m.image ?? null,
  };
}

interface ChatInterfaceProps {
  currentUserId: number;
  partnerId: number | null;
  messages: ApiMessage[];
  /** (text, attachments?) - parent may use FormData when attachments present. */
  onSend: (message: string, attachments?: SendAttachments) => Promise<void>;
  sending?: boolean;
}

export const ChatInterface = ({ currentUserId, partnerId, messages, onSend, sending = false }: ChatInterfaceProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
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

  const hasContent = newMessage.trim() || pendingFile || pendingImage;
  const handleSend = async () => {
    if (!hasContent || sending || partnerId == null) return;
    const text = newMessage.trim();
    const attachments: SendAttachments = {};
    if (pendingFile) attachments.file = pendingFile;
    if (pendingImage) attachments.image = pendingImage;
    setNewMessage("");
    setPendingFile(null);
    setPendingImage(null);
    await onSend(text, Object.keys(attachments).length ? attachments : undefined);
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
              {msg.image && (
                <a href={getMediaUrl(msg.image)} target="_blank" rel="noopener noreferrer" className="block mb-1">
                  <img src={getMediaUrl(msg.image)} alt="" className="max-w-full max-h-48 rounded-lg object-contain" />
                </a>
              )}
              {msg.file && (
                <a
                  href={getMediaUrl(msg.file)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block text-xs underline mb-1 ${msg.isFromMe ? "text-primary-foreground/90" : "text-foreground"}`}
                >
                  File attachment
                </a>
              )}
              {msg.message ? <p>{msg.message}</p> : null}
              <p className={`text-[10px] mt-1 ${msg.isFromMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="*/*"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) setPendingFile(f);
          e.target.value = "";
        }}
      />
      <input
        ref={imageInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) setPendingImage(f);
          e.target.value = "";
        }}
      />
      <div className="border-t border-border p-3 flex gap-2 flex-wrap items-center">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 flex-shrink-0 text-muted-foreground"
          type="button"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 flex-shrink-0 text-muted-foreground"
          type="button"
          onClick={() => imageInputRef.current?.click()}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        {(pendingFile || pendingImage) && (
          <span className="text-xs text-muted-foreground">
            {[pendingFile?.name, pendingImage?.name].filter(Boolean).join(", ")}
          </span>
        )}
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="h-10 flex-1 min-w-0"
          disabled={partnerId == null || sending}
        />
        <Button
          onClick={handleSend}
          size="icon"
          className="gold-gradient text-primary-foreground h-10 w-10 neon-glow-sm flex-shrink-0"
          disabled={!hasContent || partnerId == null || sending}
          type="button"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
