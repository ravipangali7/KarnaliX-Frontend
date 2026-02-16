import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Layouts
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PlayerLayout } from "@/components/layout/PlayerLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";

// Public Pages
import HomePage from "@/pages/public/HomePage";
import GamesPage from "@/pages/public/GamesPage";
import GameDetailPage from "@/pages/public/GameDetailPage";
import BonusPage from "@/pages/public/BonusPage";
import WalletPage from "@/pages/public/WalletPage";
import LoginPage from "@/pages/public/LoginPage";
import RegisterPage from "@/pages/public/RegisterPage";

// Player Pages
import PlayerDashboard from "@/pages/player/PlayerDashboard";
import PlayerMessages from "@/pages/player/PlayerMessages";
import PlayerKYC from "@/pages/player/PlayerKYC";
import PlayerWallet from "@/pages/player/PlayerWallet";
import PlayerTransactions from "@/pages/player/PlayerTransactions";
import PlayerGameResults from "@/pages/player/PlayerGameResults";
import PlayerPaymentModes from "@/pages/player/PlayerPaymentModes";
import PlayerChangePassword from "@/pages/player/PlayerChangePassword";
import PlayerProfile from "@/pages/player/PlayerProfile";

// Admin Pages (shared across roles)
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminMessages from "@/pages/admin/AdminMessages";
import AdminPlayers from "@/pages/admin/AdminPlayers";
import AdminMasters from "@/pages/admin/AdminMasters";
import AdminSupers from "@/pages/admin/AdminSupers";
import AdminDeposits from "@/pages/admin/AdminDeposits";
import AdminWithdrawals from "@/pages/admin/AdminWithdrawals";
import AdminKYC from "@/pages/admin/AdminKYC";
import AdminGameLog from "@/pages/admin/AdminGameLog";
import AdminTransactions from "@/pages/admin/AdminTransactions";
import AdminActivityLog from "@/pages/admin/AdminActivityLog";
import MasterPaymentModes from "@/pages/admin/MasterPaymentModes";

// Powerhouse-only Pages
import PowerhouseCategories from "@/pages/admin/PowerhouseCategories";
import PowerhouseProviders from "@/pages/admin/PowerhouseProviders";
import PowerhouseGames from "@/pages/admin/PowerhouseGames";
import PowerhouseBonusRules from "@/pages/admin/PowerhouseBonusRules";
import PowerhouseSuperSettings from "@/pages/admin/PowerhouseSuperSettings";
import PowerhouseSiteSettings from "@/pages/admin/PowerhouseSiteSettings";
import PowerhouseCMS from "@/pages/admin/PowerhouseCMS";
import PowerhouseTestimonials from "@/pages/admin/PowerhouseTestimonials";

import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
            {/* Public Website */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/games" element={<GamesPage />} />
              <Route path="/games/:id" element={<GameDetailPage />} />
              <Route path="/bonus" element={<BonusPage />} />
              <Route path="/wallet" element={<WalletPage />} />
            </Route>

            {/* Auth (no layout) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Player Dashboard */}
            <Route element={<ProtectedRoute allowedRole="player"><PlayerLayout /></ProtectedRoute>}>
              <Route path="/player" element={<PlayerDashboard />} />
              <Route path="/player/messages" element={<PlayerMessages />} />
              <Route path="/player/kyc" element={<PlayerKYC />} />
              <Route path="/player/wallet" element={<PlayerWallet />} />
              <Route path="/player/transactions" element={<PlayerTransactions />} />
              <Route path="/player/game-results" element={<PlayerGameResults />} />
              <Route path="/player/payment-modes" element={<PlayerPaymentModes />} />
              <Route path="/player/change-password" element={<PlayerChangePassword />} />
              <Route path="/player/profile" element={<PlayerProfile />} />
            </Route>

            {/* Master Dashboard */}
            <Route element={<ProtectedRoute allowedRole="master"><AdminLayout role="master" /></ProtectedRoute>}>
              <Route path="/master" element={<AdminDashboard role="master" />} />
              <Route path="/master/messages" element={<AdminMessages role="master" />} />
              <Route path="/master/players" element={<AdminPlayers />} />
              <Route path="/master/payment-modes" element={<MasterPaymentModes />} />
              <Route path="/master/deposits" element={<AdminDeposits />} />
              <Route path="/master/withdrawals" element={<AdminWithdrawals />} />
              <Route path="/master/kyc" element={<AdminKYC />} />
              <Route path="/master/game-log" element={<AdminGameLog />} />
              <Route path="/master/transactions" element={<AdminTransactions />} />
              <Route path="/master/activity" element={<AdminActivityLog />} />
            </Route>

            {/* Super Dashboard */}
            <Route element={<ProtectedRoute allowedRole="super"><AdminLayout role="super" /></ProtectedRoute>}>
              <Route path="/super" element={<AdminDashboard role="super" />} />
              <Route path="/super/messages" element={<AdminMessages role="super" />} />
              <Route path="/super/masters" element={<AdminMasters />} />
              <Route path="/super/players" element={<AdminPlayers />} />
              <Route path="/super/deposits" element={<AdminDeposits />} />
              <Route path="/super/withdrawals" element={<AdminWithdrawals />} />
              <Route path="/super/kyc" element={<AdminKYC />} />
              <Route path="/super/game-log" element={<AdminGameLog />} />
              <Route path="/super/transactions" element={<AdminTransactions />} />
              <Route path="/super/activity" element={<AdminActivityLog />} />
            </Route>

            {/* Powerhouse Dashboard */}
            <Route element={<ProtectedRoute allowedRole="powerhouse"><AdminLayout role="powerhouse" /></ProtectedRoute>}>
              <Route path="/powerhouse" element={<AdminDashboard role="powerhouse" />} />
              <Route path="/powerhouse/messages" element={<AdminMessages role="powerhouse" />} />
              <Route path="/powerhouse/supers" element={<AdminSupers />} />
              <Route path="/powerhouse/masters" element={<AdminMasters />} />
              <Route path="/powerhouse/players" element={<AdminPlayers />} />
              <Route path="/powerhouse/kyc" element={<AdminKYC />} />
              <Route path="/powerhouse/deposits" element={<AdminDeposits />} />
              <Route path="/powerhouse/withdrawals" element={<AdminWithdrawals />} />
              <Route path="/powerhouse/categories" element={<PowerhouseCategories />} />
              <Route path="/powerhouse/providers" element={<PowerhouseProviders />} />
              <Route path="/powerhouse/games" element={<PowerhouseGames />} />
              <Route path="/powerhouse/bonus-rules" element={<PowerhouseBonusRules />} />
              <Route path="/powerhouse/game-log" element={<AdminGameLog />} />
              <Route path="/powerhouse/transactions" element={<AdminTransactions />} />
              <Route path="/powerhouse/activity" element={<AdminActivityLog />} />
              <Route path="/powerhouse/super-settings" element={<PowerhouseSuperSettings />} />
              <Route path="/powerhouse/site-settings" element={<PowerhouseSiteSettings />} />
              <Route path="/powerhouse/cms" element={<PowerhouseCMS />} />
              <Route path="/powerhouse/testimonials" element={<PowerhouseTestimonials />} />
            </Route>

            <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
