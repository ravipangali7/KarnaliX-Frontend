import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api';
import { 
  LayoutDashboard, Users, FileText, Gift, ArrowDownCircle,
  TrendingUp, Activity, User, CreditCard, ChevronDown, ChevronRight,
  LogOut, Menu, X, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Import CRUD components
import {
  ListUsers,
  ClientRequests,
  TotalDW,
  PaymentModes,
  Profile,
  PLSports,
  PLClient,
  TopWinners,
  ClientActivityLog,
  AccountStatement,
  BonusStatement,
} from './master';

const DashboardOverview = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiClient.getMasterDashboard();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Master Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-400">Total Users</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-white">{stats?.users?.total_users || 0}</div></CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-400">Active Users</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-white">{stats?.users?.active_users || 0}</div></CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-400">Own Balance</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-400">₹{stats?.financial?.own_balance || '0'}</div></CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-400">Profit/Loss</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-blue-400">₹{stats?.bets?.profit_loss || '0'}</div></CardContent>
        </Card>
      </div>
    </div>
  );
};

const navItems = [
  { path: '', label: 'Dashboard', icon: LayoutDashboard },
  { path: 'users', label: 'List of User', icon: Users },
  { path: 'account-statement', label: 'Account Statement', icon: FileText },
  { path: 'bonus-statement', label: 'Bonus Statement', icon: Gift },
  { label: 'Client Request', icon: ArrowDownCircle, children: [
    { path: 'requests/deposit', label: 'Deposit' },
    { path: 'requests/withdraw', label: 'Withdraw' },
    { path: 'requests/total-dw', label: 'Total D/W' },
  ]},
  { label: 'Profit Loss', icon: TrendingUp, children: [
    { path: 'profit-loss/sports', label: 'P/L Sports' },
    { path: 'profit-loss/client', label: 'P/L Client' },
    { path: 'profit-loss/winners', label: 'Top Winners' },
  ]},
  { path: 'activity', label: 'Client Activity Log', icon: Activity },
  { path: 'profile', label: 'Profile', icon: User },
  { path: 'payment-modes', label: 'Payment Mode', icon: CreditCard },
  { path: '/chat', label: 'Live Chat', icon: MessageSquare, external: true },
];

const MasterDashboard: React.FC = () => {
  const { user, logout, isMaster } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  if (!isMaster) return <Navigate to="/login" replace />;

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev => prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]);
  };

  const isActive = (path: string) => {
    const fullPath = `/master/${path}`;
    return location.pathname === fullPath || (path === '' && location.pathname === '/master');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0 md:w-16'} bg-emerald-950 text-white transition-all duration-300 flex flex-col`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-emerald-900">
          {sidebarOpen && <span className="text-xl font-bold text-emerald-400">KarnaliX</span>}
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white hover:bg-emerald-900">
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          {navItems.map((item, index) => (
            <div key={index}>
              {item.children ? (
                <div>
                  <button onClick={() => toggleMenu(item.label)} className="w-full flex items-center px-4 py-3 text-emerald-200 hover:bg-emerald-900">
                    <item.icon className="h-5 w-5 mr-3" />
                    {sidebarOpen && <><span className="flex-1 text-left">{item.label}</span>{expandedMenus.includes(item.label) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</>}
                  </button>
                  {sidebarOpen && expandedMenus.includes(item.label) && (
                    <div className="bg-emerald-900/50 py-2">
                      {item.children.map((child, childIndex) => (
                        <Link key={childIndex} to={child.path} className={`block pl-12 pr-4 py-2 text-sm text-emerald-300 hover:text-white hover:bg-emerald-900 ${isActive(child.path) ? 'bg-emerald-800 text-white' : ''}`}>
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                (item as { external?: boolean }).external ? (
                  <Link to={item.path} className="flex items-center px-4 py-3 text-emerald-200 hover:bg-emerald-900">
                    <item.icon className="h-5 w-5 mr-3" />{sidebarOpen && <span>{item.label}</span>}
                  </Link>
                ) : (
                  <Link to={item.path} className={`flex items-center px-4 py-3 text-emerald-200 hover:bg-emerald-900 ${isActive(item.path) ? 'bg-emerald-600 text-white' : ''}`}>
                    <item.icon className="h-5 w-5 mr-3" />{sidebarOpen && <span>{item.label}</span>}
                  </Link>
                )
              )}
            </div>
          ))}
        </nav>
        {sidebarOpen && (
          <div className="border-t border-emerald-900 p-4">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">{user?.username?.charAt(0).toUpperCase()}</div>
              <div className="ml-3"><p className="text-sm font-medium">{user?.username}</p><p className="text-xs text-emerald-300">{user?.role}</p></div>
            </div>
            <Button variant="outline" size="sm" className="w-full border-emerald-700 text-emerald-200 hover:bg-emerald-900" onClick={logout}><LogOut className="h-4 w-4 mr-2" /> Logout</Button>
          </div>
        )}
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <Routes>
            <Route index element={<DashboardOverview />} />
            <Route path="users" element={<ListUsers />} />
            <Route path="account-statement" element={<AccountStatement />} />
            <Route path="bonus-statement" element={<BonusStatement />} />
            <Route path="requests/deposit" element={<ClientRequests type="deposit" />} />
            <Route path="requests/withdraw" element={<ClientRequests type="withdraw" />} />
            <Route path="requests/total-dw" element={<TotalDW />} />
            <Route path="profit-loss/sports" element={<PLSports />} />
            <Route path="profit-loss/client" element={<PLClient />} />
            <Route path="profit-loss/winners" element={<TopWinners />} />
            <Route path="activity" element={<ClientActivityLog />} />
            <Route path="profile" element={<Profile />} />
            <Route path="payment-modes" element={<PaymentModes />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default MasterDashboard;
