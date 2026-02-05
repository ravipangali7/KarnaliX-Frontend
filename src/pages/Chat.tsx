import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useLiveChat, type ChatMessage, type ChatPartner } from "@/hooks/useLiveChat";
import { MessageSquare, Send, Loader2, UserCircle } from "lucide-react";

function MessageBubble({ msg, isMine }: { msg: ChatMessage; isMine: boolean }) {
  const time = new Date(msg.created_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
          isMine ? "bg-primary text-primary-foreground" : "glass border border-border"
        }`}
      >
        {!isMine && (
          <p className="text-xs font-medium text-muted-foreground mb-0.5">
            {msg.sender_username} ({msg.sender_role})
          </p>
        )}
        <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
        <p className={`text-xs mt-1 ${isMine ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{time}</p>
      </div>
    </div>
  );
}

export default function Chat() {
  const { user, isAuthenticated } = useAuth();
  const {
    connectionStatus,
    partners,
    currentOtherUserId,
    currentMessages,
    openConversation,
    sendMessage,
    currentUserId,
    fetchPartners,
  } = useLiveChat();
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentMessages]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const currentPartner = partners.find((p) => p.id === currentOtherUserId);
  const canChat = ["USER", "MASTER", "SUPER", "POWERHOUSE"].includes(user?.role ?? "");

  if (!canChat) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 container mx-auto px-4 py-8">
          <div className="glass rounded-xl p-8 text-center text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Live chat is available for User, Master, and Super accounts.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      <main className="pt-24 sm:pt-28 pb-20 md:pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-primary" />
            Live Chat
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-12rem)] min-h-[400px]">
            {/* Partners sidebar */}
            <div className="glass rounded-xl p-4 flex flex-col md:col-span-1">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">Contacts</span>
                {connectionStatus === "connected" && (
                  <span className="text-xs text-neon-green flex items-center gap-1">
                    <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
                    Online
                  </span>
                )}
                {connectionStatus === "connecting" && (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                )}
              </div>
              <ScrollArea className="flex-1 -mx-2">
                {partners.length === 0 && connectionStatus !== "connecting" && (
                  <p className="text-sm text-muted-foreground py-4 px-2">
                    {user?.role === "USER" ? "No support contact assigned. Use support tickets for help." : "No contacts yet."}
                  </p>
                )}
                {partners.map((p) => (
                  <PartnerRow
                    key={p.id}
                    partner={p}
                    isActive={currentOtherUserId === p.id}
                    onClick={() => {
                      openConversation(p.id);
                    }}
                  />
                ))}
              </ScrollArea>
            </div>

            {/* Conversation pane */}
            <div className="glass rounded-xl flex flex-col md:col-span-2 overflow-hidden">
              {!currentPartner ? (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <UserCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Select a contact to start chatting</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-3 border-b border-border flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-semibold text-primary">
                      {currentPartner.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{currentPartner.username}</p>
                      <p className="text-xs text-muted-foreground">{currentPartner.role}</p>
                    </div>
                  </div>
                  <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto min-h-0">
                    {currentMessages.map((msg) => (
                      <MessageBubble
                        key={msg.id}
                        msg={msg}
                        isMine={currentUserId != null && msg.sender_id === currentUserId}
                      />
                    ))}
                  </div>
                  <div className="p-3 border-t border-border flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          if (inputText.trim() && currentOtherUserId != null) {
                            sendMessage(currentOtherUserId, inputText.trim());
                            setInputText("");
                          }
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => {
                        if (inputText.trim() && currentOtherUserId != null) {
                          sendMessage(currentOtherUserId, inputText.trim());
                          setInputText("");
                        }
                      }}
                      disabled={!inputText.trim() || connectionStatus !== "connected"}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function PartnerRow({
  partner,
  isActive,
  onClick,
}: {
  partner: ChatPartner;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
        isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
      }`}
    >
      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-semibold text-primary flex-shrink-0">
        {partner.username.slice(0, 2).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm truncate">{partner.username}</p>
        <p className="text-xs text-muted-foreground truncate">{partner.role}</p>
      </div>
    </button>
  );
}
