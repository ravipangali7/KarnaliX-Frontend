import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api';
import { 
  LayoutDashboard, Users, UserCheck, FileText, Gift, 
  ArrowDownCircle, ChevronDown, ChevronRight,
  ShieldCheck, MessageSquare, MessageCircle, CreditCard, LogOut, Menu, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Import CRUD components
import {
  ListMasters,
  ListUsers,
  ClientRequests,
  TotalDW,
  MasterDW,
  KYCManagement,
  SupportTickets,
  PaymentModes,
  AccountStatement,
  BonusStatement,
} from './super';

// Dashboard Overview Component
const DashboardOverview = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiClient.getSuperDashboard();
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
      <h1 className="text-2xl font-bold text-white">Super Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">New This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.users?.new_this_week || 0}</div>
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
    </div>
  );
};

// Navigation items
const navItems = [
  { path: '', label: 'Dashboard', icon: LayoutDashboard },
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
      { path: 'requests/master-dw', label: 'Master D/W' },
    ]
  },
  { path: 'kyc', label: 'KYC Management', icon: ShieldCheck },
  { path: 'payment-modes', label: 'Payment Mode', icon: CreditCard },
  { path: 'tickets', label: 'Support Ticket', icon: MessageSquare },
  { path: '/chat', label: 'Live Chat', icon: MessageCircle },
];

const SuperDashboard: React.FC = () => {
  const { user, logout, isSuper, isPowerhouse } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  // Allow both Super and Powerhouse (Powerhouse can access all)
  if (!isSuper) {
    return <Navigate to="/login" replace />;
  }

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev => 
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  const isActive = (path: string) => {
    const fullPath = `/super/${path}`;
    return location.pathname === fullPath || (path === '' && location.pathname === '/super');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0 md:w-16'} bg-blue-950 text-white transition-all duration-300 flex flex-col`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-blue-900">
          {sidebarOpen && <span className="text-xl font-bold text-blue-400">KarnaliX</span>}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white hover:bg-blue-900"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {navItems.map((item, index) => (
            <div key={index}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={`w-full flex items-center px-4 py-3 text-blue-200 hover:bg-blue-900 hover:text-white transition-colors`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {expandedMenus.includes(item.label) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </>
                    )}
                  </button>
                  {sidebarOpen && expandedMenus.includes(item.label) && (
                    <div className="bg-blue-900/50 py-2">
                      {item.children.map((child, childIndex) => (
                        <Link
                          key={childIndex}
                          to={child.path}
                          className={`block pl-12 pr-4 py-2 text-sm text-blue-300 hover:text-white hover:bg-blue-900 transition-colors ${isActive(child.path) ? 'bg-blue-800 text-white' : ''}`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-blue-200 hover:bg-blue-900 hover:text-white transition-colors ${isActive(item.path) ? 'bg-blue-600 text-white' : ''}`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {sidebarOpen && (
          <div className="border-t border-blue-900 p-4">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{user?.username}</p>
                <p className="text-xs text-blue-300">{user?.role}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full border-blue-700 text-blue-200 hover:bg-blue-900" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <Routes>
            <Route index element={<DashboardOverview />} />
            <Route path="masters" element={<ListMasters />} />
            <Route path="users" element={<ListUsers />} />
            <Route path="account-statement" element={<AccountStatement />} />
            <Route path="bonus-statement" element={<BonusStatement />} />
            <Route path="requests/deposit" element={<ClientRequests type="deposit" />} />
            <Route path="requests/withdraw" element={<ClientRequests type="withdraw" />} />
            <Route path="requests/total-dw" element={<TotalDW />} />
            <Route path="requests/master-dw" element={<MasterDW />} />
            <Route path="kyc" element={<KYCManagement />} />
            <Route path="payment-modes" element={<PaymentModes />} />
            <Route path="tickets" element={<SupportTickets />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default SuperDashboard;
