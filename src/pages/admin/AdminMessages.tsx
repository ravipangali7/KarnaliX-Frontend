import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { ChatInterface } from "@/components/shared/ChatInterface";
import { Card, CardContent } from "@/components/ui/card";
import { getMessages } from "@/api/admin";

interface AdminMessagesProps {
  role: "master" | "super" | "powerhouse";
}

const AdminMessages = ({ role }: AdminMessagesProps) => {
  const { data: messagesData = [] } = useQuery({ queryKey: ["admin-messages", role], queryFn: () => getMessages(role) });
  const contactList = (messagesData as { id: number; username?: string; name?: string; last_message?: string }[]).map((m) => ({
    id: String(m.id ?? m.username ?? ""),
    name: String(m.name ?? m.username ?? "User"),
    lastMessage: String(m.last_message ?? ""),
    unread: 0,
  }));
  const [selectedContact, setSelectedContact] = useState<string | null>(null);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row">
      {/* Contact list */}
      <div className={`${selectedContact ? "hidden md:block" : ""} md:w-72 border-r border-border overflow-y-auto`}>
        <div className="p-3 border-b border-border">
          <h3 className="font-display font-semibold text-sm">Messages</h3>
        </div>
        {contactList.map((c) => (
          <div
            key={c.id}
            onClick={() => setSelectedContact(c.id)}
            className={`p-3 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${selectedContact === c.id ? "bg-muted" : ""}`}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{c.name}</p>
              {c.unread > 0 && (
                <span className="h-5 w-5 rounded-full gold-gradient text-[10px] font-bold flex items-center justify-center text-primary-foreground">{c.unread}</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">{c.lastMessage}</p>
          </div>
        ))}
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            <div className="p-3 border-b border-border flex items-center gap-2 md:hidden">
              <button onClick={() => setSelectedContact(null)} className="text-sm text-primary">← Back</button>
              <span className="font-display font-semibold text-sm">{contactList.find((c) => c.id === selectedContact)?.name}</span>
            </div>
            <div className="flex-1">
              <ChatInterface currentUser={role + "1"} otherUser={selectedContact} />
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
