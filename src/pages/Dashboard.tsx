import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { WalletSection } from "@/components/dashboard/WalletSection";
import { BetHistory } from "@/components/dashboard/BetHistory";
import { BonusesSection } from "@/components/dashboard/BonusesSection";
import { ProfileSection } from "@/components/dashboard/ProfileSection";
import { SettingsSection } from "@/components/dashboard/SettingsSection";
import { ReferralSection } from "@/components/dashboard/ReferralSection";
import { SupportSection } from "@/components/dashboard/SupportSection";
import { WithdrawModal } from "@/components/dashboard/WithdrawModal";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/lib/api";
import { 
  Wallet, 
  Gamepad2,
  Gift,
  User,
  Settings,
  History,
  Users,
  Headphones,
  Menu,
  X,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch wallet balance on mount
  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const data = await apiClient.getMyBalance();
        setWalletBalance(parseFloat(data.balance) || 0);
      } catch (error) {
        console.error('Failed to fetch wallet balance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWalletBalance();
  }, []);

  // Get user display name and initials
  const displayName = user?.full_name || user?.username || 'User';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: Gamepad2 },
    { id: "wallet", label: "Wallet", icon: Wallet },
    { id: "history", label: "Bet History", icon: History },
    { id: "bonuses", label: "Bonuses", icon: Gift },
    { id: "referrals", label: "Referrals", icon: Users },
    { id: "profile", label: "Profile", icon: User },
    { id: "support", label: "Support", icon: Headphones },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <DashboardOverview walletBalance={walletBalance} onTabChange={setActiveTab} />;
      case "wallet":
        return <WalletSection walletBalance={walletBalance} onRequestWithdraw={() => setShowWithdrawModal(true)} />;
      case "history":
        return <BetHistory />;
      case "bonuses":
        return <BonusesSection />;
      case "referrals":
        return <ReferralSection />;
      case "profile":
        return <ProfileSection />;
      case "support":
        return <SupportSection />;
      case "settings":
        return <SettingsSection />;
      default:
        return <DashboardOverview walletBalance={walletBalance} />;
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
                    {initials}
                  </div>
                  <div>
                    <p className="font-semibold text-sm sm:text-base">{displayName}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user?.role || 'Member'}</p>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
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
