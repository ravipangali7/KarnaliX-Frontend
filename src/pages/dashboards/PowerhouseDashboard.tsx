import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api';
import { 
  LayoutDashboard, Users, UserCog, UserCheck, FileText, Gift, 
  ArrowDownCircle, ArrowUpCircle, Calculator, Gamepad2, Settings2,
  ShieldCheck, MessageSquare, MessageCircle, CreditCard, Settings, ChevronDown, ChevronRight,
  LogOut, Menu, X, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Import CRUD components
import {
  ListSupers,
  ListMasters,
  ListUsers,
  ClientRequests,
  TotalDW,
  SuperMasterDW,
  GameProviders,
  Games,
  KYCManagement,
  PaymentModes,
  SupportTickets,
  SuperSettings,
  SiteContentManagement,
  BonusRulesManagement,
  AccountStatement,
  BonusStatement,
} from './powerhouse';
import Chat from '../Chat';

// Dashboard Overview Component
const DashboardOverview = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiClient.getPowerhouseDashboard();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Powerhouse Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Supers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.users?.total_supers || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Masters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.users?.total_masters || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.users?.total_users || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.users?.active_users || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Deposits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">₹{stats?.financial?.total_deposits || '0'}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Withdrawals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">₹{stats?.financial?.total_withdrawals || '0'}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">₹{stats?.financial?.total_balance || '0'}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Profit/Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">₹{stats?.bets?.profit_loss || '0'}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Pending Deposits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-400">{stats?.financial?.pending_deposits || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Pending KYC</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-400">{stats?.pending?.kyc || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Open Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-400">{stats?.pending?.support_tickets || 0}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Navigation items
const navItems = [
  { path: '', label: 'Dashboard', icon: LayoutDashboard },
  { path: 'supers', label: 'List of Super', icon: UserCog },
  { path: 'masters', label: 'List of Master', icon: UserCheck },
  { path: 'users', label: 'List of User', icon: Users },
  { path: 'account-statement', label: 'Account Statement', icon: FileText },
  { path: 'bonus-statement', label: 'Bonus Statement', icon: Gift },
  { 
    label: 'Client Request', 
    icon: ArrowDownCircle,
    children: [
      { path: 'requests/deposit', label: 'Deposit' },
      { path: 'requests/withdraw', label: 'Withdraw' },
      { path: 'requests/total-dw', label: 'Total D/W' },
      { path: 'requests/super-master-dw', label: 'Super Master D/W' },
    ]
  },
  { path: 'providers', label: 'Game Provider', icon: Gamepad2 },
  { path: 'games', label: 'Game Management', icon: Settings2 },
  { path: 'kyc', label: 'KYC Management', icon: ShieldCheck },
  { path: 'tickets', label: 'Support Ticket', icon: MessageSquare },
  { path: 'payment-modes', label: 'Payment Mode', icon: CreditCard },
  { path: 'chat', label: 'Live Chat', icon: MessageCircle },
  { path: 'settings', label: 'Super Setting', icon: Settings },
  { path: 'content', label: 'Website Content', icon: Globe },
  { path: 'bonus-rules', label: 'Bonus Rules', icon: Gift },
];

const PowerhouseDashboard: React.FC = () => {
  const { user, logout, isPowerhouse } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  // Redirect if not powerhouse
  if (!isPowerhouse) {
    return <Navigate to="/login" replace />;
  }

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev => 
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  const isActive = (path: string) => {
    const fullPath = `/powerhouse/${path}`;
    return location.pathname === fullPath || (path === '' && location.pathname === '/powerhouse');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0 md:w-16'} bg-gray-950 text-white transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
          {sidebarOpen && <span className="text-xl font-bold text-yellow-500">KarnaliX</span>}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white hover:bg-gray-800"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navItems.map((item, index) => (
            <div key={index}>
              {item.children ? (
                // Expandable menu
                <div>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={`w-full flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors ${
                      expandedMenus.includes(item.label) ? 'bg-gray-800' : ''
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {expandedMenus.includes(item.label) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </>
                    )}
                  </button>
                  {sidebarOpen && expandedMenus.includes(item.label) && (
                    <div className="bg-gray-900 py-2">
                      {item.children.map((child, childIndex) => (
                        <Link
                          key={childIndex}
                          to={child.path}
                          className={`block pl-12 pr-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors ${
                            isActive(child.path) ? 'bg-gray-800 text-white' : ''
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Regular menu item
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors ${
                    isActive(item.path) ? 'bg-yellow-600 text-white' : ''
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* User Info */}
        {sidebarOpen && (
          <div className="border-t border-gray-800 p-4">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-yellow-600 flex items-center justify-center text-white font-bold">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{user?.username}</p>
                <p className="text-xs text-gray-400">{user?.role}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <Routes>
            <Route index element={<DashboardOverview />} />
            <Route path="supers" element={<ListSupers />} />
            <Route path="masters" element={<ListMasters />} />
            <Route path="users" element={<ListUsers />} />
            <Route path="account-statement" element={<AccountStatement />} />
            <Route path="bonus-statement" element={<BonusStatement />} />
            <Route path="requests/deposit" element={<ClientRequests type="deposit" />} />
            <Route path="requests/withdraw" element={<ClientRequests type="withdraw" />} />
            <Route path="requests/total-dw" element={<TotalDW />} />
            <Route path="requests/super-master-dw" element={<SuperMasterDW />} />
            <Route path="providers" element={<GameProviders />} />
            <Route path="games" element={<Games />} />
            <Route path="kyc" element={<KYCManagement />} />
            <Route path="payment-modes" element={<PaymentModes />} />
            <Route path="tickets" element={<SupportTickets />} />
            <Route path="chat" element={<Chat />} />
            <Route path="settings" element={<SuperSettings />} />
            <Route path="content" element={<SiteContentManagement />} />
            <Route path="bonus-rules" element={<BonusRulesManagement />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default PowerhouseDashboard;
