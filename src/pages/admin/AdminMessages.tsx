import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { ChatInterface, type ApiMessage } from "@/components/shared/ChatInterface";
import { getMessages, getMessageContacts, sendMessage, sendMessageForm } from "@/api/admin";
import { useMessageSocket } from "@/hooks/useMessageSocket";
import { toast } from "sonner";

const POLL_INTERVAL_MS = 4000;

interface AdminMessagesProps {
  role: "master" | "super" | "powerhouse";
}

const AdminMessages = ({ role }: AdminMessagesProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null);

  const { connected } = useMessageSocket((msg) => {
    if (selectedContactId == null) return;
    if (msg.sender === selectedContactId || msg.receiver === selectedContactId) {
      queryClient.invalidateQueries({ queryKey: ["admin-messages", role, selectedContactId] });
    }
  });

  const { data: contactsData } = useQuery({
    queryKey: ["admin-message-contacts", role],
    queryFn: () => getMessageContacts(role),
  });

  const { data: messagesData, isLoading } = useQuery({
    queryKey: ["admin-messages", role, selectedContactId],
    queryFn: () => getMessages(role, selectedContactId ?? undefined),
    enabled: selectedContactId != null,
    refetchInterval: connected ? false : selectedContactId != null ? POLL_INTERVAL_MS : false,
  });

  const contacts = Array.isArray(contactsData) ? contactsData : [];
  const messages = Array.isArray(messagesData) ? messagesData : [];

  const [sending, setSending] = useState(false);

  const handleSend = async (
    message: string,
    attachments?: { file?: File; image?: File }
  ) => {
    if (selectedContactId == null) return;
    setSending(true);
    try {
      if (attachments?.file ?? attachments?.image) {
        const formData = new FormData();
        formData.append("receiver", String(selectedContactId));
        formData.append("message", message);
        if (attachments.file) formData.append("file", attachments.file);
        if (attachments.image) formData.append("image", attachments.image);
        await sendMessageForm(formData, role);
      } else {
        await sendMessage({ receiver: selectedContactId, message }, role);
      }
      await queryClient.invalidateQueries({ queryKey: ["admin-messages", role, selectedContactId] });
    } catch (e) {
      const err = e as { detail?: string };
      toast.error(err?.detail ?? "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const selectedContact = contacts.find((c) => c.id === selectedContactId);
  const apiMessages = messages as ApiMessage[];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row">
      {/* Contact list */}
      <div className={`${selectedContactId != null ? "hidden md:block" : ""} md:w-72 border-r border-border overflow-y-auto flex-shrink-0`}>
        <div className="p-3 border-b border-border">
          <h3 className="font-display font-semibold text-sm">Messages</h3>
        </div>
        {contacts.map((c) => (
          <div
            key={c.id}
            onClick={() => setSelectedContactId(c.id)}
            className={`p-3 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${selectedContactId === c.id ? "bg-muted" : ""}`}
          >
            <p className="text-sm font-medium">{c.name || c.username}</p>
            <p className="text-xs text-muted-foreground capitalize">{c.role}</p>
          </div>
        ))}
        {contacts.length === 0 && (
          <p className="p-3 text-xs text-muted-foreground">No contacts</p>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedContactId != null ? (
          <>
            <div className="p-3 border-b border-border flex items-center gap-2 md:hidden flex-shrink-0">
              <button
                type="button"
                onClick={() => setSelectedContactId(null)}
                className="text-sm text-primary"
              >
                ← Back
              </button>
              <span className="font-display font-semibold text-sm truncate">
                {selectedContact?.name ?? selectedContact?.username ?? "User"}
              </span>
            </div>
            <div className="flex-1 min-h-0">
              {isLoading ? (
                <p className="text-center text-sm text-muted-foreground py-8">Loading…</p>
              ) : (
                <ChatInterface
                  currentUserId={user?.id ?? 0}
                  partnerId={selectedContactId}
                  messages={apiMessages}
                  onSend={handleSend}
                  sending={sending}
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            Select a conversation
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMessages;
