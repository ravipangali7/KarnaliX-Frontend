import { Outlet } from "react-router-dom";
import { PublicHeader } from "./PublicHeader";
import { PublicFooter } from "./PublicFooter";

/**
 * Player dashboard wrapped in the same site header and footer as the public site.
 * Renders PublicHeader, then Outlet (which renders PlayerLayout + child routes), then PublicFooter.
 */
export const PlayerSiteLayout = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <PublicHeader />
    <div className="flex-1 flex flex-col">
      <Outlet />
    </div>
    <PublicFooter />
  </div>
);
