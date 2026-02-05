import { useState, useEffect } from "react";
import { Navigate, useLocation, useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { WalletSection } from "@/components/dashboard/WalletSection";
import { BonusesSection } from "@/components/dashboard/BonusesSection";
import { ProfileSection } from "@/components/dashboard/ProfileSection";
import { ReferralSection } from "@/components/dashboard/ReferralSection";
import { WithdrawModal } from "@/components/dashboard/WithdrawModal";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/lib/api";
import { MyBets, ChangePassword } from "@/pages/dashboards/user";
import {
  Wallet,
  Gamepad2,
  Gift,
  User,
  Users,
  Menu,
  X,
  Dices,
  KeyRound,
  MessageSquare,
} from "lucide-react";

export default function Dashboard() {
  const { user, isAuthenticated, getDashboardRoute } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  // Open tab from navigation state (e.g. from Affiliate "View All")
  useEffect(() => {
    const tab = (location.state as { tab?: string } | null)?.tab;
    if (tab && ["overview", "wallet", "bets", "bonuses", "referrals", "profile", "change-password"].includes(tab)) {
      setActiveTab(tab);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  // Redirect role-based users (POWERHOUSE, SUPER, MASTER) to their dashboard
  const roleDashboardRoute = getDashboardRoute();
  if (isAuthenticated && roleDashboardRoute !== "/dashboard") {
    return <Navigate to={roleDashboardRoute} replace />;
  }

  useEffect(() => {
    if (!isAuthenticated) {
      setDashboardLoading(false);
      return;
    }
    const fetchDashboard = async () => {
      try {
        const data = await apiClient.getUserDashboard();
        setDashboardStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard:", error);
      } finally {
        setDashboardLoading(false);
      }
    };
    fetchDashboard();
  }, [isAuthenticated]);

  const walletBalance = parseFloat(dashboardStats?.wallet?.balance ?? "0") || 0;
  const walletExposure = parseFloat(dashboardStats?.wallet?.exposure ?? "0") || 0;
  const walletAvailable = parseFloat(dashboardStats?.wallet?.available ?? "0") || 0;

  if (!dashboardLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: Gamepad2 },
    { id: "wallet", label: "Wallet", icon: Wallet },
    { id: "bets", label: "My Bets", icon: Dices },
    { id: "bonuses", label: "Bonus", icon: Gift },
    { id: "referrals", label: "Referral", icon: Users },
    { id: "chats", label: "Live Chat", icon: MessageSquare, link: "/chat" as const },
    { id: "profile", label: "Profile", icon: User },
    { id: "change-password", label: "Password", icon: KeyRound },
  ];

  const totalDeposit = dashboardStats?.transactions?.total_deposit ?? "0";
  const totalWithdraw = dashboardStats?.transactions?.total_withdraw ?? "0";

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <DashboardOverview
            walletBalance={walletBalance}
            dashboardStats={dashboardStats}
            loading={dashboardLoading}
            userName={user?.username}
            setActiveTab={setActiveTab}
          />
        );
      case "wallet":
        return (
          <WalletSection
            walletBalance={walletBalance}
            totalDeposit={totalDeposit}
            totalWithdraw={totalWithdraw}
            onRequestWithdraw={() => setShowWithdrawModal(true)}
          />
        );
      case "bets":
        return <MyBets />;
      case "bonuses":
        return <BonusesSection vipLevel={dashboardStats?.vip_level ?? "Gold"} />;
      case "referrals":
        return <ReferralSection />;
      case "profile":
        return <ProfileSection />;
      case "change-password":
        return <ChangePassword />;
      default:
        return (
          <DashboardOverview
            walletBalance={walletBalance}
            dashboardStats={dashboardStats}
            loading={dashboardLoading}
            userName={user?.username}
            setActiveTab={setActiveTab}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      
      <main className="pt-24 sm:pt-28 pb-20 md:pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
            {/* Mobile Sidebar Toggle */}
            <button
              onClick={() => setShowMobileSidebar(!showMobileSidebar)}
              className="lg:hidden flex items-center gap-2 px-4 py-3 glass rounded-xl"
            >
              {showMobileSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              <span className="font-medium">{sidebarItems.find(i => i.id === activeTab)?.label}</span>
            </button>

            {/* Sidebar */}
            <div className={`lg:w-56 flex-shrink-0 ${showMobileSidebar ? 'block' : 'hidden lg:block'}`}>
              <div className="glass rounded-xl p-3 sm:p-4 lg:sticky lg:top-28">
                {/* User Info */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm sm:text-lg font-bold text-primary-foreground">
                    {user?.username ? user.username.slice(0, 2).toUpperCase() : "?"}
                  </div>
                  <div>
                    <p className="font-semibold text-sm sm:text-base">{user?.username ?? "User"}</p>
                    <p className="text-xs text-muted-foreground">{user?.role ?? "Member"}</p>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    const link = "link" in item ? (item as { link?: string }).link : undefined;
                    if (link) {
                      return (
                        <Link
                          key={item.id}
                          to={link}
                          onClick={() => setShowMobileSidebar(false)}
                          className="w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-colors text-sm hover:bg-muted text-muted-foreground hover:text-foreground"
                        >
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                          {item.label}
                        </Link>
                      );
                    }
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setShowMobileSidebar(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-colors text-sm ${
                          activeTab === item.id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {renderContent()}
            </div>
          </div>
        </div>
      </main>

      <WithdrawModal 
        isOpen={showWithdrawModal} 
        onClose={() => setShowWithdrawModal(false)}
        walletBalance={walletBalance}
      />

      <Footer />
      <MobileNav />
      <WhatsAppButton />
    </div>
  );
}
