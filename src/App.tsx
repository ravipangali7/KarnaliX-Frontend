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
import { PlayerSiteLayout } from "@/components/layout/PlayerSiteLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";

// Public Pages
import GamesPage from "@/pages/public/GamesPage";
import GameDetailPage from "@/pages/public/GameDetailPage";
import BonusPage from "@/pages/public/BonusPage";
import WalletPage from "@/pages/public/WalletPage";
import LoginPage from "@/pages/public/LoginPage";
import RegisterPage from "@/pages/public/RegisterPage";
import ForgotPasswordPage from "@/pages/public/ForgotPasswordPage";

// Player Pages
import PlayerDashboard from "@/pages/player/PlayerDashboard";
import PlayerMessages from "@/pages/player/PlayerMessages";
import PlayerWallet from "@/pages/player/PlayerWallet";
import PlayerTransactions from "@/pages/player/PlayerTransactions";
import PlayerGameResults from "@/pages/player/PlayerGameResults";
import PlayerGameLogDetail from "@/pages/player/PlayerGameLogDetail";
import PlayerPaymentModes from "@/pages/player/PlayerPaymentModes";
import PlayerChangePassword from "@/pages/player/PlayerChangePassword";
import PlayerProfile from "@/pages/player/PlayerProfile";
import PlayerReferralPage from "@/pages/player/PlayerReferralPage";

// Admin Pages (shared across roles)
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminMessages from "@/pages/admin/AdminMessages";
import AdminPlayers from "@/pages/admin/AdminPlayers";
import AdminMasters from "@/pages/admin/AdminMasters";
import AdminSupers from "@/pages/admin/AdminSupers";
import AdminDeposits from "@/pages/admin/AdminDeposits";
import AdminWithdrawals from "@/pages/admin/AdminWithdrawals";
import AdminGameLog from "@/pages/admin/AdminGameLog";
import AdminGameLogDetail from "@/pages/admin/AdminGameLogDetail";
import AdminTransactions from "@/pages/admin/AdminTransactions";
import AdminActivityLog from "@/pages/admin/AdminActivityLog";
import MasterPaymentModes from "@/pages/admin/MasterPaymentModes";
import AdminPaymentModeVerification from "@/pages/admin/AdminPaymentModeVerification";
import AdminProfile from "@/pages/admin/AdminProfile";
import AdminChangePassword from "@/pages/admin/AdminChangePassword";
import AdminPlayerReport from "@/pages/admin/AdminPlayerReport";
import AdminAccounting from "@/pages/admin/AdminAccounting";

// Powerhouse-only Pages
import PowerhouseCategories from "@/pages/admin/PowerhouseCategories";
import PowerhouseProviders from "@/pages/admin/PowerhouseProviders";
import PowerhouseGames from "@/pages/admin/PowerhouseGames";
import PowerhouseBonusRules from "@/pages/admin/PowerhouseBonusRules";
import PowerhouseSuperSettings from "@/pages/admin/PowerhouseSuperSettings";
import PowerhouseSiteSettings from "@/pages/admin/PowerhouseSiteSettings";
import PowerhouseSlider from "@/pages/admin/PowerhouseSlider";
import PowerhouseCMS from "@/pages/admin/PowerhouseCMS";
import PowerhouseTestimonials from "@/pages/admin/PowerhouseTestimonials";

import NotFound from "@/pages/NotFound";
import { HOME_PAGE_VARIANT } from "@/config";
import FirstHomePage from "@/pages/public/FirstHomePage";
import SecondHomePage from "@/pages/public/SecondHomePage";
import HomeDesignPage from "@/pages/public/HomeDesignPage";
import { SecondPublicLayout } from "@/components/layout/SecondPublicLayout";
import { HomeDesignLayout } from "@/components/layout/HomeDesignLayout";
import { GamePlayLayout } from "@/components/layout/GamePlayLayout";
import GamePlayPage from "@/pages/public/GamePlayPage";

const queryClient = new QueryClient();

function HomePageSwitch() {
  if (HOME_PAGE_VARIANT === "second") {
    return (
      <SecondPublicLayout>
        <SecondHomePage />
      </SecondPublicLayout>
    );
  }
  return (
    <HomeDesignLayout>
      <HomeDesignPage />
    </HomeDesignLayout>
  );
}

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
            <Route path="/" element={<HomePageSwitch />} />
            <Route element={<PublicLayout />}>
              <Route path="/games" element={<GamesPage />} />
              <Route path="/games/:id" element={<GameDetailPage />} />
            <Route path="/bonus" element={<BonusPage />} />
            <Route path="/wallet" element={<WalletPage />} />
            </Route>

            {/* In-app game play (header + iframe + footer), player only */}
            <Route path="/games/:id/play" element={<ProtectedRoute allowedRole="player"><GamePlayLayout><GamePlayPage /></GamePlayLayout></ProtectedRoute>} />

            {/* Auth (no layout) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Player Dashboard (inside site header/footer) */}
            <Route element={<ProtectedRoute allowedRole="player"><PlayerSiteLayout /></ProtectedRoute>}>
              <Route path="/player" element={<PlayerLayout />}>
                <Route index element={<PlayerDashboard />} />
                <Route path="messages" element={<PlayerMessages />} />
                <Route path="wallet" element={<PlayerWallet />} />
                <Route path="transactions" element={<PlayerTransactions />} />
                <Route path="game-results" element={<PlayerGameResults />} />
                <Route path="game-results/:id" element={<PlayerGameLogDetail />} />
                <Route path="payment-modes" element={<PlayerPaymentModes />} />
                <Route path="change-password" element={<PlayerChangePassword />} />
                <Route path="profile" element={<PlayerProfile />} />
                <Route path="referral" element={<PlayerReferralPage />} />
              </Route>
            </Route>

            {/* Master Dashboard */}
            <Route element={<ProtectedRoute allowedRole="master"><AdminLayout role="master" /></ProtectedRoute>}>
              <Route path="/master" element={<AdminDashboard role="master" />} />
              <Route path="/master/messages" element={<AdminMessages role="master" />} />
              <Route path="/master/players" element={<AdminPlayers />} />
              <Route path="/master/players/:id/report" element={<AdminPlayerReport />} />
              <Route path="/master/payment-modes" element={<MasterPaymentModes />} />
              <Route path="/master/payment-mode-verification" element={<AdminPaymentModeVerification />} />
              <Route path="/master/deposits" element={<AdminDeposits />} />
              <Route path="/master/withdrawals" element={<AdminWithdrawals />} />
              <Route path="/master/game-log" element={<AdminGameLog />} />
              <Route path="/master/game-log/:id" element={<AdminGameLogDetail />} />
              <Route path="/master/transactions" element={<AdminTransactions />} />
              <Route path="/master/accounting" element={<AdminAccounting />} />
              <Route path="/master/activity" element={<AdminActivityLog />} />
              <Route path="/master/profile" element={<AdminProfile />} />
              <Route path="/master/change-password" element={<AdminChangePassword />} />
            </Route>

            {/* Super Dashboard */}
            <Route element={<ProtectedRoute allowedRole="super"><AdminLayout role="super" /></ProtectedRoute>}>
              <Route path="/super" element={<AdminDashboard role="super" />} />
              <Route path="/super/messages" element={<AdminMessages role="super" />} />
              <Route path="/super/masters" element={<AdminMasters />} />
              <Route path="/super/players" element={<AdminPlayers />} />
              <Route path="/super/players/:id/report" element={<AdminPlayerReport />} />
              <Route path="/super/payment-mode-verification" element={<AdminPaymentModeVerification />} />
              <Route path="/super/deposits" element={<AdminDeposits />} />
              <Route path="/super/withdrawals" element={<AdminWithdrawals />} />
              <Route path="/super/game-log" element={<AdminGameLog />} />
              <Route path="/super/game-log/:id" element={<AdminGameLogDetail />} />
              <Route path="/super/transactions" element={<AdminTransactions />} />
              <Route path="/super/accounting" element={<AdminAccounting />} />
              <Route path="/super/activity" element={<AdminActivityLog />} />
              <Route path="/super/profile" element={<AdminProfile />} />
              <Route path="/super/change-password" element={<AdminChangePassword />} />
            </Route>

            {/* Powerhouse Dashboard */}
            <Route element={<ProtectedRoute allowedRole="powerhouse"><AdminLayout role="powerhouse" /></ProtectedRoute>}>
              <Route path="/powerhouse" element={<AdminDashboard role="powerhouse" />} />
              <Route path="/powerhouse/messages" element={<AdminMessages role="powerhouse" />} />
              <Route path="/powerhouse/supers" element={<AdminSupers />} />
              <Route path="/powerhouse/masters" element={<AdminMasters />} />
              <Route path="/powerhouse/players" element={<AdminPlayers />} />
              <Route path="/powerhouse/players/:id/report" element={<AdminPlayerReport />} />
              <Route path="/powerhouse/payment-mode-verification" element={<AdminPaymentModeVerification />} />
              <Route path="/powerhouse/deposits" element={<AdminDeposits />} />
              <Route path="/powerhouse/withdrawals" element={<AdminWithdrawals />} />
              <Route path="/powerhouse/categories" element={<PowerhouseCategories />} />
              <Route path="/powerhouse/providers" element={<PowerhouseProviders />} />
              <Route path="/powerhouse/games" element={<PowerhouseGames />} />
              <Route path="/powerhouse/slider" element={<PowerhouseSlider />} />
              <Route path="/powerhouse/bonus-rules" element={<PowerhouseBonusRules />} />
              <Route path="/powerhouse/game-log" element={<AdminGameLog />} />
              <Route path="/powerhouse/game-log/:id" element={<AdminGameLogDetail />} />
              <Route path="/powerhouse/transactions" element={<AdminTransactions />} />
              <Route path="/powerhouse/activity" element={<AdminActivityLog />} />
              <Route path="/powerhouse/super-settings" element={<PowerhouseSuperSettings />} />
              <Route path="/powerhouse/site-settings" element={<PowerhouseSiteSettings />} />
              <Route path="/powerhouse/cms" element={<PowerhouseCMS />} />
              <Route path="/powerhouse/testimonials" element={<PowerhouseTestimonials />} />
              <Route path="/powerhouse/profile" element={<AdminProfile />} />
              <Route path="/powerhouse/change-password" element={<AdminChangePassword />} />
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
