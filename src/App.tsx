import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SignupVerifyOtp from "./pages/SignupVerifyOtp";
import RefRedirect from "./pages/RefRedirect";
import Games from "./pages/Games";
import GameDetail from "./pages/GameDetail";
import Dashboard from "./pages/Dashboard";
import Affiliate from "./pages/Affiliate";
import Deposit from "./pages/Deposit";
import MasterAdminPanel from "./pages/MasterAdminPanel";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";
import Faq from "./pages/Faq";
import About from "./pages/About";
import Careers from "./pages/Careers";
import Blog from "./pages/Blog";
import Guides from "./pages/Guides";
import ResponsibleGaming from "./pages/ResponsibleGaming";
import Kyc from "./pages/Kyc";
import Refunds from "./pages/Refunds";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";

// Role-based dashboards
import PowerhouseDashboard from "./pages/dashboards/PowerhouseDashboard";
import SuperDashboard from "./pages/dashboards/SuperDashboard";
import MasterDashboard from "./pages/dashboards/MasterDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/signup/verify-otp" element={<SignupVerifyOtp />} />
            <Route path="/ref/:referralCode" element={<RefRedirect />} />
            <Route path="/games" element={<Games />} />
            <Route path="/games/:category" element={<Games />} />
            <Route path="/game/:id" element={<GameDetail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/affiliate" element={<Affiliate />} />
            <Route path="/deposit" element={<Deposit />} />
            <Route path="/sports" element={<Games />} />
            <Route path="/live-casino" element={<Games />} />
            <Route path="/promotions" element={<Index />} />
            <Route path="/tournaments" element={<Index />} />
            <Route path="/master-admin" element={<MasterAdminPanel />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/help" element={<Faq />} />
            <Route path="/about" element={<About />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/guides" element={<Guides />} />
            <Route path="/responsible-gaming" element={<ResponsibleGaming />} />
            <Route path="/kyc" element={<Kyc />} />
            <Route path="/refunds" element={<Refunds />} />
            <Route path="/chat" element={<Chat />} />
            
            {/* Role-based Dashboard Routes */}
            <Route path="/powerhouse/*" element={<PowerhouseDashboard />} />
            <Route path="/super/*" element={<SuperDashboard />} />
            <Route path="/master/*" element={<MasterDashboard />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
