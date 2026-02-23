import { ReactNode } from "react";
import { PublicHeader } from "./PublicHeader";
import { PublicFooter } from "./PublicFooter";

/** Layout for in-app game play: site header + full-height content + footer. */
export const GamePlayLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen flex flex-col bg-background">
    <PublicHeader />
    <main className="flex-1 flex flex-col min-h-0">
      {children}
    </main>
    <PublicFooter />
  </div>
);
