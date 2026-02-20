import { Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PublicHeader } from "./PublicHeader";
import { PublicFooter } from "./PublicFooter";
import { MessageCircle } from "lucide-react";
import { getSiteSetting } from "@/api/site";
import { ReactNode } from "react";

interface PublicLayoutProps {
  children?: ReactNode;
}

export const PublicLayout = ({ children }: PublicLayoutProps) => {
  const { data: siteSetting } = useQuery({ queryKey: ["siteSetting"], queryFn: getSiteSetting });
  const whatsapp = (siteSetting as { whatsapp_number?: string } | undefined)?.whatsapp_number ?? "";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />
      <main className="flex-1">
        {children ?? <Outlet />}
      </main>
      <PublicFooter />

      {/* Floating buttons */}
      <div className="fixed bottom-20 right-4 z-40 flex flex-col gap-2 md:bottom-6">
        <a
          href={`https://wa.me/${String(whatsapp).replace(/[^0-9]/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="h-12 w-12 rounded-full bg-success flex items-center justify-center shadow-lg animate-pulse-neon"
        >
          <span className="text-xl">💬</span>
        </a>
        <button className="h-12 w-12 rounded-full gold-gradient flex items-center justify-center shadow-lg text-primary-foreground neon-glow-sm">
          <MessageCircle className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
