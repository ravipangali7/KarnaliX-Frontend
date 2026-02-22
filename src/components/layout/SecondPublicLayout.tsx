import { ReactNode } from "react";
import { SecondPublicHeader } from "./SecondPublicHeader";
import { PublicFooter } from "./PublicFooter";

export const SecondPublicLayout = ({ children }: { children: ReactNode }) => (
  <div className="second-home min-h-screen flex flex-col bg-background">
    <SecondPublicHeader />
    <main className="flex-1 overflow-auto flex flex-col">{children}</main>
    <PublicFooter />
  </div>
);
