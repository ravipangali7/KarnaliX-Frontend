import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  LayoutDashboard,
  Users, 
  Gamepad2, 
  DollarSign,
  Gift,
  UserCog,
  Bell,
  Settings,
  LifeBuoy,
  FileText,
  ArrowLeft,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Check,
  X,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function MasterAdminDashboard() {
  const { user, logout, isMasterAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [bonuses, setBonuses] = useState<any[]>([]);
  const [kycQueue, setKycQueue] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({});

  useEffect(() => {
    if (!isMasterAdmin) {
      navigate('/');
      return;
    }
    loadData();
  }, [isMasterAdmin, navigate, activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load data based on active tab
      switch (activeTab) {
        case 'dashboard':
          await loadDashboardData();
          break;
        case 'users':
          await loadUsers();
          break;
        case 'games':
          await loadGames();
          break;
        case 'financial':
          await loadFinancialData();
          break;
        case 'bonuses':
          await loadBonuses();
          break;
        case 'support':
          await loadTickets();
          break;
        case 'settings':
          await loadConfig();
          break;
      }
    } catch (error: any) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    const [usersData, gamesData, depositsData, withdrawalsData] = await Promise.all([
      apiClient.getUsers(),
      apiClient.getGames(),
      apiClient.getDeposits({ status: 'pending' }),
      apiClient.getWithdrawals({ status: 'pending' })
    ]);
    
    setUsers(usersData);
    setGames(gamesData);
    setDeposits(depositsData);
    setWithdrawals(withdrawalsData);
    
    // Calculate stats
    const totalUsers = usersData.length;
    const activeUsers = usersData.filter((u: any) => u.is_active).length;
    const totalGames = gamesData.length;
    const activeGames = gamesData.filter((g: any) => g.is_active).length;
    
    setStats({
      totalUsers,
      activeUsers,
      totalGames,
      activeGames,
      pendingDeposits: depositsData.length,
      pendingWithdrawals: withdrawalsData.length
    });
  };

  const loadUsers = async () => {
    const data = await apiClient.getUsers();
    setUsers(data);
  };

  const loadGames = async () => {
    const data = await apiClient.getGames();
    setGames(data);
  };

  const loadFinancialData = async () => {
    const [depositsData, withdrawalsData] = await Promise.all([
      apiClient.getDeposits(),
      apiClient.getWithdrawals()
    ]);
    setDeposits(depositsData);
    setWithdrawals(withdrawalsData);
  };

  const loadBonuses = async () => {
    const data = await apiClient.request('/config/bonus-rules');
    setBonuses(data);
  };

  const loadTickets = async () => {
    const data = await apiClient.getTickets();
    setTickets(data);
  };

  const loadConfig = async () => {
    const data = await apiClient.request('/config/system');
    setConfig(data);
  };

  const handleApproveDeposit = async (depositId: string) => {
    try {
      await apiClient.approveDeposit(depositId, 'Approved by Master Admin');
      toast.success('Deposit approved successfully');
      loadFinancialData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve deposit');
    }
  };

  const handleRejectDeposit = async (depositId: string) => {
    try {
      await apiClient.rejectDeposit(depositId, 'Rejected by Master Admin');
      toast.success('Deposit rejected');
      loadFinancialData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject deposit');
    }
  };

  const handleApproveWithdrawal = async (withdrawalId: string) => {
    try {
      await apiClient.approveWithdrawal(withdrawalId, 'Approved by Master Admin');
      toast.success('Withdrawal approved successfully');
      loadFinancialData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve withdrawal');
    }
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      await apiClient.suspendUser(userId);
      toast.success('User status updated');
      loadUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user');
    }
  };

  const handleRejectWithdrawal = async (withdrawalId: string) => {
    try {
      await apiClient.rejectWithdrawal(withdrawalId, 'Rejected by admin');
      toast.success('Withdrawal rejected');
      loadFinancialData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject withdrawal');
    }
  };

  const handleViewUser = (userId: string) => {
    const selectedUser = users.find(u => u.id === userId);
    if (selectedUser) {
      toast.info(`User: ${selectedUser.username}\nEmail: ${selectedUser.email}\nRole: ${selectedUser.role}\nBalance: ₹${selectedUser.wallet_balance || 0}`);
    }
  };

  const handleEditUser = (userId: string) => {
    toast.info('User edit dialog coming soon. Use PowerHouse panel for full user management.');
  };

  const handleExportUsers = async () => {
    try {
      // Create CSV from users data
      const headers = ['Username', 'Email', 'Role', 'Balance', 'Status', 'KYC Status'];
      const csvContent = [
        headers.join(','),
        ...users.map(u => [
          u.username,
          u.email,
          u.role,
          u.wallet_balance || 0,
          u.is_active ? 'Active' : 'Suspended',
          u.kyc_status || 'pending'
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'users_export.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Users exported successfully');
    } catch (error) {
      toast.error('Failed to export users');
    }
  };

  const handleFilterUsers = () => {
    toast.info('Filter options: Use the search box to filter by username or email');
  };

  const handleAddGame = () => {
    toast.info('Game creation coming soon. Use PowerHouse panel for full game management.');
  };

  const handleEditGame = (gameId: string) => {
    toast.info('Game edit dialog coming soon. Use PowerHouse panel for full game management.');
  };

  const handleViewGame = (gameId: string) => {
    const game = games.find(g => g.id === gameId);
    if (game) {
      toast.info(`Game: ${game.name}\nCategory: ${game.category}\nMin Bet: ₹${game.min_bet}\nMax Bet: ₹${game.max_bet}\nRTP: ${game.rtp}%`);
    }
  };

  const handleUpdateSettings = () => {
    toast.info('Settings are read-only in this view. Use PowerHouse panel for system configuration.');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'financial', label: 'Financial', icon: DollarSign },
    { id: 'bonuses', label: 'Bonuses', icon: Gift },
    { id: 'agents', label: 'Agents', icon: UserCog },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'support', label: 'Support', icon: LifeBuoy },
    { id: 'logs', label: 'Audit Logs', icon: FileText }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Exit Admin
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Master Admin Panel</h1>
                <p className="text-sm text-muted-foreground">
                  {user?.full_name || user?.username} | {user?.email}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                onClick={() => setActiveTab(tab.id)}
                className="gap-2 whitespace-nowrap"
                size="sm"
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </Button>
            );
          })}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-neon-green" />
                </div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold">{stats.totalUsers || 0}</p>
                <p className="text-xs text-neon-green mt-1">
                  {stats.activeUsers || 0} active
                </p>
              </div>

              <div className="glass rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-lg bg-neon-green/20 flex items-center justify-center">
                    <Gamepad2 className="w-6 h-6 text-neon-green" />
                  </div>
                  <Activity className="w-5 h-5 text-neon-green" />
                </div>
                <p className="text-sm text-muted-foreground">Total Games</p>
                <p className="text-3xl font-bold">{stats.totalGames || 0}</p>
                <p className="text-xs text-neon-green mt-1">
                  {stats.activeGames || 0} active
                </p>
              </div>

              <div className="glass rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-accent" />
                  </div>
                  <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-500 rounded">
                    Pending
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Deposits</p>
                <p className="text-3xl font-bold">{stats.pendingDeposits || 0}</p>
                <p className="text-xs text-orange-500 mt-1">Awaiting approval</p>
              </div>

              <div className="glass rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-red-500" />
                  </div>
                  <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-500 rounded">
                    Pending
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Withdrawals</p>
                <p className="text-3xl font-bold">{stats.pendingWithdrawals || 0}</p>
                <p className="text-xs text-orange-500 mt-1">Awaiting approval</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4">User Growth</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[
                    { name: 'Mon', users: 10 },
                    { name: 'Tue', users: 15 },
                    { name: 'Wed', users: 12 },
                    { name: 'Thu', users: 18 },
                    { name: 'Fri', users: 22 },
                    { name: 'Sat', users: 28 },
                    { name: 'Sun', users: 25 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="users" stroke="#8B5CF6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4">User Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Active', value: stats.activeUsers || 0 },
                        { name: 'Inactive', value: (stats.totalUsers || 0) - (stats.activeUsers || 0) }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[0, 1].map((index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <Button className="h-auto py-6 flex-col" onClick={() => setActiveTab('users')}>
                  <Users className="w-8 h-8 mb-2" />
                  <span className="text-lg">Manage Users</span>
                  <span className="text-xs text-muted-foreground">{stats.totalUsers || 0} users</span>
                </Button>
                <Button className="h-auto py-6 flex-col" onClick={() => setActiveTab('financial')}>
                  <DollarSign className="w-8 h-8 mb-2" />
                  <span className="text-lg">Financial</span>
                  <span className="text-xs text-muted-foreground">
                    {(stats.pendingDeposits || 0) + (stats.pendingWithdrawals || 0)} pending
                  </span>
                </Button>
                <Button className="h-auto py-6 flex-col" onClick={() => setActiveTab('games')}>
                  <Gamepad2 className="w-8 h-8 mb-2" />
                  <span className="text-lg">Games</span>
                  <span className="text-xs text-muted-foreground">{stats.totalGames || 0} games</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">User Management</h2>
              <div className="flex gap-2">
                <Input placeholder="Search users..." className="w-64" />
                <Button variant="outline" size="icon" onClick={handleFilterUsers}>
                  <Filter className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleExportUsers}>
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4">User</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Role</th>
                    <th className="text-left py-3 px-4">Balance</th>
                    <th className="text-left py-3 px-4">KYC</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{u.username}</p>
                          <p className="text-xs text-muted-foreground">{u.full_name}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{u.email}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded ${
                          u.role === 'master_admin' ? 'bg-accent/20 text-accent' :
                          u.role === 'admin' ? 'bg-primary/20 text-primary' :
                          u.role === 'agent' ? 'bg-secondary/20 text-secondary' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono">₹{u.wallet_balance?.toFixed(2) || '0.00'}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded ${
                          u.kyc_status === 'approved' ? 'bg-neon-green/20 text-neon-green' :
                          u.kyc_status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                          'bg-orange-500/20 text-orange-500'
                        }`}>
                          {u.kyc_status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded ${
                          u.is_active ? 'bg-neon-green/20 text-neon-green' : 'bg-red-500/20 text-red-500'
                        }`}>
                          {u.is_active ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button size="icon" variant="ghost" onClick={() => handleSuspendUser(u.id)}>
                            {u.is_active ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleViewUser(u.id)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleEditUser(u.id)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Financial Tab */}
        {activeTab === 'financial' && (
          <div className="space-y-6">
            {/* Pending Deposits */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-neon-green" />
                Pending Deposits ({deposits.filter(d => d.status === 'pending').length})
              </h3>
              <div className="space-y-3">
                {deposits.filter(d => d.status === 'pending').map((deposit) => (
                  <div key={deposit.id} className="p-4 bg-muted/50 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium">₹{deposit.amount}</p>
                      <p className="text-sm text-muted-foreground">
                        {deposit.payment_method} • {deposit.transaction_code}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        User ID: {deposit.user_id}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="default" onClick={() => handleApproveDeposit(deposit.id)}>
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleRejectDeposit(deposit.id)}>
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
                {deposits.filter(d => d.status === 'pending').length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No pending deposits</p>
                )}
              </div>
            </div>

            {/* Pending Withdrawals */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <TrendingDown className="w-6 h-6 text-red-500" />
                Pending Withdrawals ({withdrawals.filter(w => w.status === 'pending').length})
              </h3>
              <div className="space-y-3">
                {withdrawals.filter(w => w.status === 'pending').map((withdrawal) => (
                  <div key={withdrawal.id} className="p-4 bg-muted/50 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium">₹{withdrawal.amount}</p>
                      <p className="text-sm text-muted-foreground">
                        {withdrawal.payment_method} • {withdrawal.account_details}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        User ID: {withdrawal.user_id}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="default" onClick={() => handleApproveWithdrawal(withdrawal.id)}>
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleRejectWithdrawal(withdrawal.id)}>
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
                {withdrawals.filter(w => w.status === 'pending').length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No pending withdrawals</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Games Tab */}
        {activeTab === 'games' && (
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Games Management</h2>
              <Button onClick={handleAddGame}>
                <Plus className="w-4 h-4 mr-2" />
                Add Game
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {games.map((game) => (
                <div key={game.id} className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{game.name}</h3>
                      <p className="text-sm text-muted-foreground capitalize">{game.category}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      game.is_active ? 'bg-neon-green/20 text-neon-green' : 'bg-red-500/20 text-red-500'
                    }`}>
                      {game.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Min Bet:</span>
                      <span className="font-mono">₹{game.min_bet}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Bet:</span>
                      <span className="font-mono">₹{game.max_bet}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">RTP:</span>
                      <span className="font-mono">{game.rtp}%</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEditGame(game.id)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleViewGame(game.id)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="glass rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6">System Settings</h2>
            <div className="space-y-6 max-w-2xl">
              <div>
                <Label>Platform Name</Label>
                <Input value={config.platform_name || ''} readOnly />
              </div>
              <div>
                <Label>Support WhatsApp</Label>
                <Input value={config.support_whatsapp || ''} readOnly />
              </div>
              <div>
                <Label>Minimum Deposit (₹)</Label>
                <Input type="number" value={config.min_deposit || 0} readOnly />
              </div>
              <div>
                <Label>Maximum Deposit (₹)</Label>
                <Input type="number" value={config.max_deposit || 0} readOnly />
              </div>
              <div>
                <Label>Welcome Bonus (%)</Label>
                <Input type="number" value={config.welcome_bonus_percentage || 0} readOnly />
              </div>
              <Button className="w-full" onClick={handleUpdateSettings}>
                <Settings className="w-4 h-4 mr-2" />
                Update Settings
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
      </div>
    </div>
  );
}
