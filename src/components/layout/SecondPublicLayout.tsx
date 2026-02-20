import { ReactNode } from "react";
import { SecondPublicHeader } from "./SecondPublicHeader";
import { SecondPublicSidebar } from "./SecondPublicSidebar";
import { PublicFooter } from "./PublicFooter";

export const SecondPublicLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen flex flex-col bg-background">
    <SecondPublicHeader />
    <div className="flex flex-1">
      <SecondPublicSidebar />
      <main className="flex-1 overflow-auto flex flex-col">{children}</main>
    </div>
    <PublicFooter />
  </div>
);
