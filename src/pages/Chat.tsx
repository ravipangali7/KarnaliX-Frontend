import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useLiveChat, type ChatMessage, type ChatPartner } from "@/hooks/useLiveChat";
import { MessageSquare, Send, Loader2, UserCircle } from "lucide-react";

type DashboardTheme = "powerhouse" | "super" | "master";

function getDashboardThemeClasses(theme: DashboardTheme) {
  const map = {
    powerhouse: {
      accent: "text-yellow-500",
      accentBg: "bg-yellow-600",
      accentBgHover: "hover:bg-yellow-700",
      accentBgMuted: "bg-yellow-600/20",
      accentText: "text-yellow-400",
      accentDot: "bg-yellow-400",
    },
    super: {
      accent: "text-blue-400",
      accentBg: "bg-blue-600",
      accentBgHover: "hover:bg-blue-700",
      accentBgMuted: "bg-blue-600/20",
      accentText: "text-blue-400",
      accentDot: "bg-blue-400",
    },
    master: {
      accent: "text-emerald-400",
      accentBg: "bg-emerald-600",
      accentBgHover: "hover:bg-emerald-700",
      accentBgMuted: "bg-emerald-600/20",
      accentText: "text-emerald-400",
      accentDot: "bg-emerald-400",
    },
  };
  return { ...map[theme], card: "bg-gray-800 border border-gray-700", border: "border-gray-700", text: "text-white", textMuted: "text-gray-400" };
}

function parseDashboardTheme(pathname: string): DashboardTheme | null {
  if (pathname === "/powerhouse/chat") return "powerhouse";
  if (pathname === "/super/chat") return "super";
  if (pathname === "/master/chat") return "master";
  return null;
}

function MessageBubble({
  msg,
  isMine,
  dashboardTheme,
}: {
  msg: ChatMessage;
  isMine: boolean;
  dashboardTheme?: DashboardTheme | null;
}) {
  const time = new Date(msg.created_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  const theme = dashboardTheme ? getDashboardThemeClasses(dashboardTheme) : null;
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
          theme
            ? isMine
              ? `${theme.accentBg} ${theme.text}`
              : "bg-gray-700 border border-gray-600 text-gray-300"
            : isMine
              ? "bg-primary text-primary-foreground"
              : "glass border border-border"
        }`}
      >
        {!isMine && (
          <p className={`text-xs font-medium mb-0.5 ${theme ? "text-gray-400" : "text-muted-foreground"}`}>
            {msg.sender_username} ({msg.sender_role})
          </p>
        )}
        <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
        <p className={`text-xs mt-1 ${theme ? (isMine ? "text-white/80" : "text-gray-400") : isMine ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{time}</p>
      </div>
    </div>
  );
}

export default function Chat() {
  const location = useLocation();
  const dashboardTheme = parseDashboardTheme(location.pathname);
  const themeClasses = dashboardTheme ? getDashboardThemeClasses(dashboardTheme) : null;

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
    if (dashboardTheme && themeClasses) {
      return (
        <div>
          <div className={`${themeClasses.card} rounded-xl p-8 text-center ${themeClasses.textMuted}`}>
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Live chat is available for User, Master, and Super accounts.</p>
          </div>
        </div>
      );
    }
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

  const isDashboard = dashboardTheme != null;
  const wrapperClass = isDashboard ? "" : "min-h-screen bg-background pb-16 md:pb-0";
  const mainClass = isDashboard ? "pb-4" : "pt-24 sm:pt-28 pb-20 md:pb-16";
  const gridHeight = isDashboard ? "h-[calc(100vh-8rem)]" : "h-[calc(100vh-12rem)]";
  const sidebarPanelClass = themeClasses ? `${themeClasses.card} rounded-xl p-4 flex flex-col md:col-span-1` : "glass rounded-xl p-4 flex flex-col md:col-span-1";
  const conversationPanelClass = themeClasses ? `${themeClasses.card} rounded-xl flex flex-col md:col-span-2 overflow-hidden` : "glass rounded-xl flex flex-col md:col-span-2 overflow-hidden";

  return (
    <div className={wrapperClass}>
      {!isDashboard && <Header />}
      <main className={mainClass}>
        <div className={isDashboard ? "" : "container mx-auto px-4"}>
          <h1 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${themeClasses ? themeClasses.text : ""}`}>
            <MessageSquare className={`w-7 h-7 ${themeClasses ? themeClasses.accent : "text-primary"}`} />
            Live Chat
          </h1>
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${gridHeight} min-h-[400px]`}>
            {/* Partners sidebar */}
            <div className={sidebarPanelClass}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-sm font-medium ${themeClasses ? themeClasses.textMuted : "text-muted-foreground"}`}>Contacts</span>
                {connectionStatus === "connected" && themeClasses && (
                  <span className={`text-xs ${themeClasses.accentText} flex items-center gap-1`}>
                    <span className={`w-2 h-2 ${themeClasses.accentDot} rounded-full animate-pulse`} />
                    Online
                  </span>
                )}
                {connectionStatus === "connected" && !themeClasses && (
                  <span className="text-xs text-neon-green flex items-center gap-1">
                    <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
                    Online
                  </span>
                )}
                {connectionStatus === "connecting" && (
                  <Loader2 className={`w-4 h-4 animate-spin ${themeClasses ? themeClasses.textMuted : "text-muted-foreground"}`} />
                )}
              </div>
              <ScrollArea className="flex-1 -mx-2">
                {partners.length === 0 && connectionStatus !== "connecting" && (
                  <p className={`text-sm py-4 px-2 ${themeClasses ? themeClasses.textMuted : "text-muted-foreground"}`}>
                    {user?.role === "USER" ? "No support contact assigned. Use support tickets for help." : "No contacts yet."}
                  </p>
                )}
                {partners.map((p) => (
                  <PartnerRow
                    key={p.id}
                    partner={p}
                    isActive={currentOtherUserId === p.id}
                    onClick={() => openConversation(p.id)}
                    dashboardTheme={dashboardTheme}
                  />
                ))}
              </ScrollArea>
            </div>

            {/* Conversation pane */}
            <div className={conversationPanelClass}>
              {!currentPartner ? (
                <div className={`flex-1 flex items-center justify-center ${themeClasses ? themeClasses.textMuted : "text-muted-foreground"}`}>
                  <div className="text-center">
                    <UserCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Select a contact to start chatting</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className={`p-3 border-b ${themeClasses ? themeClasses.border : "border-border"} flex items-center gap-2`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold flex-shrink-0 ${themeClasses ? `${themeClasses.accentBgMuted} ${themeClasses.accentText}` : "bg-primary/20 text-primary"}`}>
                      {currentPartner.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className={`font-medium ${themeClasses ? themeClasses.text : ""}`}>{currentPartner.username}</p>
                      <p className={`text-xs ${themeClasses ? themeClasses.textMuted : "text-muted-foreground"}`}>{currentPartner.role}</p>
                    </div>
                  </div>
                  <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto min-h-0">
                    {currentMessages.map((msg) => (
                      <MessageBubble
                        key={msg.id}
                        msg={msg}
                        isMine={currentUserId != null && msg.sender_id === currentUserId}
                        dashboardTheme={dashboardTheme}
                      />
                    ))}
                  </div>
                  <div className={`p-3 border-t ${themeClasses ? themeClasses.border : "border-border"} flex gap-2`}>
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
                      className={themeClasses ? `flex-1 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400` : "flex-1"}
                    />
                    <Button
                      onClick={() => {
                        if (inputText.trim() && currentOtherUserId != null) {
                          sendMessage(currentOtherUserId, inputText.trim());
                          setInputText("");
                        }
                      }}
                      disabled={!inputText.trim() || connectionStatus !== "connected"}
                      className={themeClasses ? `${themeClasses.accentBg} ${themeClasses.accentBgHover} ${themeClasses.text}` : ""}
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
      {!isDashboard && <Footer />}
    </div>
  );
}

function PartnerRow({
  partner,
  isActive,
  onClick,
  dashboardTheme,
}: {
  partner: ChatPartner;
  isActive: boolean;
  onClick: () => void;
  dashboardTheme?: DashboardTheme | null;
}) {
  const theme = dashboardTheme ? getDashboardThemeClasses(dashboardTheme) : null;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
        theme
          ? isActive
            ? `${theme.accentBg} ${theme.text}`
            : "hover:bg-gray-700 text-white"
          : isActive
            ? "bg-primary text-primary-foreground"
            : "hover:bg-muted"
      }`}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold flex-shrink-0 ${
          theme ? `${theme.accentBgMuted} ${theme.accentText}` : "bg-primary/20 text-primary"
        }`}
      >
        {partner.username.slice(0, 2).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm truncate">{partner.username}</p>
        <p className={`text-xs truncate ${theme ? theme.textMuted : "text-muted-foreground"}`}>{partner.role}</p>
      </div>
    </button>
  );
}
