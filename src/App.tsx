import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { AuthProvider } from "@/contexts/AuthContext";
import { RoleGuard } from "@/components/guards/RoleGuard";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Games from "./pages/Games";
import GameDetail from "./pages/GameDetail";
import Dashboard from "./pages/Dashboard";
import Affiliate from "./pages/Affiliate";
import Deposit from "./pages/Deposit";
import MasterAdminPanel from "./pages/MasterAdminPanel";
import NotFound from "./pages/NotFound";
// Role-specific panels
import PowerHousePanel from "./pages/PowerHousePanel";
import SuperAdminPanel from "./pages/SuperAdminPanel";
import MasterPanel from "./pages/MasterPanel";

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
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/games" element={<Games />} />
            <Route path="/games/:category" element={<Games />} />
            <Route path="/game/:id" element={<GameDetail />} />
            <Route path="/affiliate" element={<Affiliate />} />
            <Route path="/deposit" element={<Deposit />} />
            <Route path="/sports" element={<Games />} />
            <Route path="/live-casino" element={<Games />} />
            <Route path="/promotions" element={<Index />} />
            
            {/* Role-Based Panel Routes */}
            <Route 
              path="/powerhouse" 
              element={
                <RoleGuard allowedRoles={['powerhouse']}>
                  <PowerHousePanel />
                </RoleGuard>
              } 
            />
            <Route 
              path="/superadmin" 
              element={
                <RoleGuard allowedRoles={['powerhouse', 'super_admin']}>
                  <SuperAdminPanel />
                </RoleGuard>
              } 
            />
            <Route 
              path="/master" 
              element={
                <RoleGuard allowedRoles={['powerhouse', 'super_admin', 'master']}>
                  <MasterPanel />
                </RoleGuard>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <RoleGuard allowedRoles={['powerhouse', 'super_admin', 'master', 'user']}>
                  <Dashboard />
                </RoleGuard>
              } 
            />
            
            {/* Legacy Admin Route (protected, redirects unauthorized users) */}
            <Route 
              path="/master-admin" 
              element={
                <RoleGuard allowedRoles={['powerhouse', 'super_admin']} showAccessDenied={false}>
                  <MasterAdminPanel />
                </RoleGuard>
              } 
            />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
