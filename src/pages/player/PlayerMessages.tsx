import { ChatInterface } from "@/components/shared/ChatInterface";
import { MessageCircle } from "lucide-react";

const PlayerMessages = () => {
  return (
    <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] flex flex-col max-w-3xl mx-auto">
      <div className="p-4 border-b border-border gaming-card">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full gold-gradient flex items-center justify-center neon-glow-sm">
            <MessageCircle className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-display font-semibold">Chat with Master</h2>
            <p className="text-xs text-success flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> master1 • Online
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1">
        <ChatInterface currentUser="player1" otherUser="master1" />
      </div>
    </div>
  );
};

export default PlayerMessages;
