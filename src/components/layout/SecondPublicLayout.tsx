import { ReactNode } from "react";
import { HomeHeader } from "./HomeHeader";
import { HomeFooter } from "./HomeFooter";
import { MobileNav } from "./MobileNav";
import { WhatsAppButton } from "./WhatsAppButton";

export const SecondPublicLayout = ({ children }: { children: ReactNode }) => (
  <div className="home-design min-h-screen flex flex-col bg-background">
    <HomeHeader />
    <main className="flex-1 overflow-auto flex flex-col pt-[calc(3.5rem+2.25rem)] md:pt-[calc(3.5rem+2.25rem)] pb-20 md:pb-0">
      {children}
    </main>
    <HomeFooter />
    <MobileNav />
    <WhatsAppButton />
  </div>
);
