import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  LayoutDashboard,
  Users,
  Gamepad2,
  Wallet,
  Settings,
  HelpCircle,
  FileCheck,
  Gift,
  TrendingUp,
  ArrowLeft,
  Plus,
  Search,
  RefreshCw,
  Coins,
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  Edit,
  Ban,
  UserPlus,
  DollarSign,
  Percent,
  Trophy,
  Activity,
  Server,
  Shield,
  MoreHorizontal,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

// Types
interface DashboardStats {
  users: { total: number; admins: number; agents: number; users: number; active: number; new_today: number; new_this_week: number };
  coins: { total_supply: number; bonus_pool: number; locked: number; total_minted: number };
  bets: { total: number; pending: number; won: number; lost: number; total_volume: number; today_volume: number };
  deposits: { total: number; pending: number; total_amount: number };
  withdrawals: { total: number; pending: number; total_amount: number };
  kyc: { total: number; pending: number; approved: number; rejected: number };
  support: { total: number; open: number; in_progress: number };
  games: { total: number; active: number; providers: number; active_providers: number };
}

// Sidebar Navigation
const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'games', label: 'Games & Providers', icon: Gamepad2 },
  { id: 'financials', label: 'Financials', icon: Wallet },
  { id: 'kyc', label: 'KYC Management', icon: FileCheck },
  { id: 'bets', label: 'Bet Management', icon: Trophy },
  { id: 'bonuses', label: 'Bonuses & Promos', icon: Gift },
  { id: 'support', label: 'Support Tickets', icon: HelpCircle },
  { id: 'settings', label: 'System Settings', icon: Settings },
];

export default function MasterAdminPanel() {
  const { user, logout, isMasterAdmin, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Data states
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [kycDocs, setKycDocs] = useState<any[]>([]);
  const [bets, setBets] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [bonusRules, setBonusRules] = useState<any[]>([]);

  useEffect(() => {
    // Wait for auth to load before checking permissions
    if (authLoading) return;
    
    if (!isMasterAdmin && !isAdmin) {
      navigate('/login');
      return;
    }
    loadAllData();
  }, [isMasterAdmin, isAdmin, navigate, authLoading]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, gamesData] = await Promise.all([
        apiClient.getAdminDashboardStats().catch(() => null),
        apiClient.getUsers().catch(() => []),
        apiClient.getGames().catch(() => []),
      ]);
      
      if (statsData) setStats(statsData);
      setUsers(usersData);
      setGames(gamesData);
      
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadSectionData = async (section: string) => {
    setRefreshing(true);
    try {
      switch (section) {
        case 'users':
          const usersData = await apiClient.getUsers();
          setUsers(usersData);
          break;
        case 'games':
          const [gamesData, providersData] = await Promise.all([
            apiClient.getAllGames().catch(() => apiClient.getGames()),
            apiClient.getGameProviders().catch(() => []),
          ]);
          setGames(gamesData);
          setProviders(providersData);
          break;
        case 'financials':
          const [depositsData, withdrawalsData, txnData] = await Promise.all([
            apiClient.getDeposits(),
            apiClient.getWithdrawals(),
            apiClient.getTransactions(),
          ]);
          setDeposits(depositsData);
          setWithdrawals(withdrawalsData);
          setTransactions(txnData);
          break;
        case 'kyc':
          const kycData = await apiClient.getAllKYC().catch(() => []);
          setKycDocs(kycData);
          break;
        case 'bets':
          const betsData = await apiClient.getAllBets();
          setBets(betsData);
          break;
        case 'support':
          const ticketsData = await apiClient.getTickets();
          setTickets(ticketsData);
          break;
        case 'bonuses':
          const bonusData = await apiClient.getBonusRules().catch(() => []);
          setBonusRules(bonusData);
          break;
      }
    } catch (error) {
      console.error(`Failed to load ${section} data:`, error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    loadSectionData(section);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const formatCurrency = (amount: number) => `₹${amount?.toLocaleString() || '0'}`;
  const formatDate = (date: string | Date) => new Date(date).toLocaleDateString('en-IN', { 
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card/50 flex flex-col">
        <div className="p-4 border-b border-border">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="w-full justify-start mb-3">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Platform
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">KarnaliX</h2>
              <p className="text-xs text-muted-foreground">Master Admin</p>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <nav className="p-3 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSectionChange(item.id)}
                  data-testid={`nav-${item.id}`}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.id === 'kyc' && stats?.kyc?.pending && stats.kyc.pending > 0 && (
                    <Badge variant="destructive" className="ml-auto">{stats.kyc.pending}</Badge>
                  )}
                  {item.id === 'support' && stats?.support?.open && stats.support.open > 0 && (
                    <Badge variant="secondary" className="ml-auto">{stats.support.open}</Badge>
                  )}
                </button>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <span className="text-sm font-bold">{user?.username?.[0]?.toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.username}</p>
              <p className="text-xs text-muted-foreground">{user?.role}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="w-full">
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Dashboard Section */}
          {activeSection === 'dashboard' && (
            <DashboardSection 
              stats={stats} 
              onRefresh={loadAllData} 
              refreshing={refreshing}
              formatCurrency={formatCurrency}
            />
          )}

          {/* User Management Section */}
          {activeSection === 'users' && (
            <UserManagementSection 
              users={users}
              onRefresh={() => loadSectionData('users')}
              refreshing={refreshing}
              formatCurrency={formatCurrency}
            />
          )}

          {/* Games Section */}
          {activeSection === 'games' && (
            <GamesSection 
              games={games}
              providers={providers}
              onRefresh={() => loadSectionData('games')}
              refreshing={refreshing}
            />
          )}

          {/* Financials Section */}
          {activeSection === 'financials' && (
            <FinancialsSection 
              users={users}
              deposits={deposits}
              withdrawals={withdrawals}
              transactions={transactions}
              onRefresh={() => loadSectionData('financials')}
              refreshing={refreshing}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              stats={stats}
            />
          )}

          {/* KYC Section */}
          {activeSection === 'kyc' && (
            <KYCSection 
              kycDocs={kycDocs}
              onRefresh={() => loadSectionData('kyc')}
              refreshing={refreshing}
              formatDate={formatDate}
            />
          )}

          {/* Bets Section */}
          {activeSection === 'bets' && (
            <BetsSection 
              bets={bets}
              onRefresh={() => loadSectionData('bets')}
              refreshing={refreshing}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />
          )}

          {/* Bonuses Section */}
          {activeSection === 'bonuses' && (
            <BonusesSection 
              bonusRules={bonusRules}
              onRefresh={() => loadSectionData('bonuses')}
              refreshing={refreshing}
            />
          )}

          {/* Support Section */}
          {activeSection === 'support' && (
            <SupportSection 
              tickets={tickets}
              onRefresh={() => loadSectionData('support')}
              refreshing={refreshing}
              formatDate={formatDate}
            />
          )}

          {/* Settings Section */}
          {activeSection === 'settings' && (
            <SettingsSection />
          )}
        </div>
      </main>
    </div>
  );
}

// ============= DASHBOARD SECTION =============
function DashboardSection({ stats, onRefresh, refreshing, formatCurrency }: any) {
  return (
    <div data-testid="dashboard-section">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Overview</h1>
          <p className="text-muted-foreground">Platform statistics and metrics</p>
        </div>
        <Button variant="outline" onClick={onRefresh} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Users"
          value={stats?.users?.total || 0}
          subtitle={`+${stats?.users?.new_today || 0} today`}
          icon={Users}
          color="primary"
        />
        <StatsCard
          title="Total Coin Supply"
          value={formatCurrency(stats?.coins?.total_supply || 0)}
          subtitle={`${formatCurrency(stats?.coins?.total_minted || 0)} minted`}
          icon={Coins}
          color="gold"
        />
        <StatsCard
          title="Total Bet Volume"
          value={formatCurrency(stats?.bets?.total_volume || 0)}
          subtitle={`${stats?.bets?.total || 0} total bets`}
          icon={Trophy}
          color="purple"
        />
        <StatsCard
          title="Pending Actions"
          value={(stats?.kyc?.pending || 0) + (stats?.deposits?.pending || 0) + (stats?.withdrawals?.pending || 0)}
          subtitle="KYC, Deposits, Withdrawals"
          icon={Clock}
          color="warning"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <MiniStatCard label="Admins" value={stats?.users?.admins || 0} />
        <MiniStatCard label="Agents" value={stats?.users?.agents || 0} />
        <MiniStatCard label="Players" value={stats?.users?.users || 0} />
        <MiniStatCard label="Active Games" value={stats?.games?.active || 0} />
        <MiniStatCard label="Pending KYC" value={stats?.kyc?.pending || 0} trend="warning" />
        <MiniStatCard label="Open Tickets" value={stats?.support?.open || 0} trend="warning" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Financial Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Financial Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-neon-green/20 flex items-center justify-center">
                    <ArrowDownToLine className="w-5 h-5 text-neon-green" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Deposits</p>
                    <p className="font-bold">{formatCurrency(stats?.deposits?.total_amount || 0)}</p>
                  </div>
                </div>
                <Badge variant="outline">{stats?.deposits?.pending || 0} pending</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-neon-red/20 flex items-center justify-center">
                    <ArrowUpFromLine className="w-5 h-5 text-neon-red" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Withdrawals</p>
                    <p className="font-bold">{formatCurrency(stats?.withdrawals?.total_amount || 0)}</p>
                  </div>
                </div>
                <Badge variant="outline">{stats?.withdrawals?.pending || 0} pending</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Today's Bet Volume</p>
                    <p className="font-bold">{formatCurrency(stats?.bets?.today_volume || 0)}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bet Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Bet Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-3xl font-bold text-neon-green">{stats?.bets?.won || 0}</p>
                <p className="text-sm text-muted-foreground">Won Bets</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-3xl font-bold text-neon-red">{stats?.bets?.lost || 0}</p>
                <p className="text-sm text-muted-foreground">Lost Bets</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-3xl font-bold text-neon-gold">{stats?.bets?.pending || 0}</p>
                <p className="text-sm text-muted-foreground">Pending Bets</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-3xl font-bold">{stats?.bets?.total || 0}</p>
                <p className="text-sm text-muted-foreground">Total Bets</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KYC & Games */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5" />
              KYC Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Pending</span>
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">{stats?.kyc?.pending || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Approved</span>
                <Badge variant="outline" className="bg-green-500/10 text-green-500">{stats?.kyc?.approved || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Rejected</span>
                <Badge variant="outline" className="bg-red-500/10 text-red-500">{stats?.kyc?.rejected || 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="w-5 h-5" />
              Games Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Games</span>
                <Badge variant="outline">{stats?.games?.total || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Active Games</span>
                <Badge variant="outline" className="bg-green-500/10 text-green-500">{stats?.games?.active || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Game Providers</span>
                <Badge variant="outline">{stats?.games?.providers || 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============= USER MANAGEMENT SECTION =============
function UserManagementSection({ users, onRefresh, refreshing, formatCurrency }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showMintDialog, setShowMintDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [newUser, setNewUser] = useState({
    email: '', username: '', password: '', full_name: '', role: 'admin'
  });
  const [mintAmount, setMintAmount] = useState('');
  const [mintDescription, setMintDescription] = useState('');

  const filteredUsers = users.filter((u: any) => {
    const matchesSearch = u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleCreateUser = async () => {
    setLoading(true);
    try {
      await apiClient.createUser(newUser);
      toast.success('User created successfully!');
      setShowCreateDialog(false);
      setNewUser({ email: '', username: '', password: '', full_name: '', role: 'admin' });
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleMintCoins = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      await apiClient.mintCoins(selectedUser.id, parseFloat(mintAmount), mintDescription);
      toast.success(`${mintAmount} coins minted to ${selectedUser.username}`);
      setShowMintDialog(false);
      setMintAmount('');
      setMintDescription('');
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to mint coins');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async (userId: string, username: string) => {
    try {
      await apiClient.suspendUser(userId);
      toast.success(`User ${username} status toggled`);
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to suspend user');
    }
  };

  return (
    <div data-testid="users-section">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage admins, agents, and users</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button data-testid="create-user-btn">
                <UserPlus className="w-4 h-4 mr-2" />
                Create User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>Add a new admin, agent, or user to the platform</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <Input 
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      data-testid="new-user-email"
                    />
                  </div>
                  <div>
                    <Label>Username</Label>
                    <Input 
                      value={newUser.username}
                      onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                      data-testid="new-user-username"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Password</Label>
                    <Input 
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      data-testid="new-user-password"
                    />
                  </div>
                  <div>
                    <Label>Full Name</Label>
                    <Input 
                      value={newUser.full_name}
                      onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label>Role</Label>
                  <Select value={newUser.role} onValueChange={(v) => setNewUser({...newUser, role: v})}>
                    <SelectTrigger data-testid="new-user-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="agent">Agent</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                <Button onClick={handleCreateUser} disabled={loading} data-testid="submit-create-user">
                  {loading ? 'Creating...' : 'Create User'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search users..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="user-search"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40" data-testid="role-filter">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="master_admin">Master Admin</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="agent">Agent</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>KYC Status</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((u: any) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        {u.username?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{u.username}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.role === 'master_admin' ? 'default' : 'outline'}>
                      {u.role?.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatCurrency(u.wallet_balance || 0)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      u.kyc_status === 'approved' ? 'default' :
                      u.kyc_status === 'pending' ? 'secondary' : 'destructive'
                    }>
                      {u.kyc_status || 'pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {u.is_active ? (
                      <Badge className="bg-neon-green/20 text-neon-green">Active</Badge>
                    ) : (
                      <Badge variant="destructive">Suspended</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => { setSelectedUser(u); setShowMintDialog(true); }}
                        title="Mint Coins"
                        data-testid={`mint-${u.id}`}
                      >
                        <Coins className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleSuspendUser(u.id, u.username)}
                        title={u.is_active ? 'Suspend' : 'Activate'}
                        data-testid={`suspend-${u.id}`}
                      >
                        <Ban className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Mint Dialog */}
      <Dialog open={showMintDialog} onOpenChange={setShowMintDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mint Coins</DialogTitle>
            <DialogDescription>
              Mint coins to {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Amount</Label>
              <Input 
                type="number"
                min="1"
                value={mintAmount}
                onChange={(e) => setMintAmount(e.target.value)}
                placeholder="Enter amount"
                data-testid="mint-amount"
              />
            </div>
            <div>
              <Label>Description (Optional)</Label>
              <Input 
                value={mintDescription}
                onChange={(e) => setMintDescription(e.target.value)}
                placeholder="e.g., Initial allocation"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMintDialog(false)}>Cancel</Button>
            <Button onClick={handleMintCoins} disabled={loading || !mintAmount} data-testid="submit-mint">
              {loading ? 'Minting...' : 'Mint Coins'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============= GAMES SECTION =============
function GamesSection({ games, providers, onRefresh, refreshing }: any) {
  const [activeTab, setActiveTab] = useState('games');

  return (
    <div data-testid="games-section">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Games & Providers</h1>
          <p className="text-muted-foreground">Manage games and API providers</p>
        </div>
        <Button variant="outline" onClick={onRefresh} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="games">Games ({games.length})</TabsTrigger>
          <TabsTrigger value="providers">Providers ({providers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="games">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.map((game: any) => (
              <Card key={game.id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{game.name}</CardTitle>
                      <CardDescription className="capitalize">{game.category}</CardDescription>
                    </div>
                    <Badge variant={game.is_active ? 'default' : 'secondary'}>
                      {game.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Min Bet</span>
                      <span className="font-mono">₹{game.min_bet}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Bet</span>
                      <span className="font-mono">₹{game.max_bet}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">RTP</span>
                      <span className="font-mono">{game.rtp}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {games.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Gamepad2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No games found</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="providers">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.map((provider: any) => (
              <Card key={provider.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Server className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle>{provider.name}</CardTitle>
                        <CardDescription>{provider.api_base_url}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={provider.is_active ? 'default' : 'secondary'}>
                      {provider.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
            {providers.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Server className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No providers found</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============= FINANCIALS SECTION =============
function FinancialsSection({ users, deposits, withdrawals, transactions, onRefresh, refreshing, formatCurrency, formatDate, stats }: any) {
  const [activeTab, setActiveTab] = useState('mint');
  const [mintForm, setMintForm] = useState({ to_user_id: '', amount: '', description: '' });
  const [loading, setLoading] = useState(false);

  const handleMint = async () => {
    setLoading(true);
    try {
      await apiClient.mintCoins(mintForm.to_user_id, parseFloat(mintForm.amount), mintForm.description);
      toast.success('Coins minted successfully!');
      setMintForm({ to_user_id: '', amount: '', description: '' });
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to mint coins');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDeposit = async (depositId: string) => {
    try {
      await apiClient.approveDeposit(depositId);
      toast.success('Deposit approved!');
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve deposit');
    }
  };

  const handleRejectDeposit = async (depositId: string) => {
    try {
      await apiClient.rejectDeposit(depositId, 'Rejected by admin');
      toast.success('Deposit rejected');
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject deposit');
    }
  };

  const handleApproveWithdrawal = async (withdrawalId: string) => {
    try {
      await apiClient.approveWithdrawal(withdrawalId);
      toast.success('Withdrawal approved!');
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve withdrawal');
    }
  };

  return (
    <div data-testid="financials-section">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Financials</h1>
          <p className="text-muted-foreground">Manage coins, deposits, and withdrawals</p>
        </div>
        <Button variant="outline" onClick={onRefresh} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-neon-gold/20 flex items-center justify-center">
                <Coins className="w-5 h-5 text-neon-gold" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Supply</p>
                <p className="font-bold">{formatCurrency(stats?.coins?.total_supply || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-neon-green/20 flex items-center justify-center">
                <ArrowDownToLine className="w-5 h-5 text-neon-green" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Deposits</p>
                <p className="font-bold">{stats?.deposits?.pending || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-neon-red/20 flex items-center justify-center">
                <ArrowUpFromLine className="w-5 h-5 text-neon-red" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Withdrawals</p>
                <p className="font-bold">{stats?.withdrawals?.pending || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Minted</p>
                <p className="font-bold">{formatCurrency(stats?.coins?.total_minted || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="mint">Mint Coins</TabsTrigger>
          <TabsTrigger value="deposits">Deposits ({deposits.length})</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals ({withdrawals.length})</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="mint">
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-neon-gold" />
                Mint New Coins
              </CardTitle>
              <CardDescription>Create and allocate coins to users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Select User</Label>
                <Select value={mintForm.to_user_id} onValueChange={(v) => setMintForm({...mintForm, to_user_id: v})}>
                  <SelectTrigger data-testid="mint-user-select">
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u: any) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.username} ({u.role}) - {formatCurrency(u.wallet_balance || 0)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Amount</Label>
                <Input 
                  type="number"
                  min="1"
                  value={mintForm.amount}
                  onChange={(e) => setMintForm({...mintForm, amount: e.target.value})}
                  placeholder="Enter amount"
                  data-testid="mint-amount-input"
                />
              </div>
              <div>
                <Label>Description (Optional)</Label>
                <Input 
                  value={mintForm.description}
                  onChange={(e) => setMintForm({...mintForm, description: e.target.value})}
                  placeholder="e.g., Initial allocation"
                />
              </div>
              <Button 
                onClick={handleMint} 
                disabled={loading || !mintForm.to_user_id || !mintForm.amount}
                className="w-full"
                data-testid="submit-mint-btn"
              >
                {loading ? 'Minting...' : 'Mint Coins'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deposits">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deposits.map((d: any) => (
                    <TableRow key={d.id}>
                      <TableCell>{d.user_id?.slice(0, 8)}...</TableCell>
                      <TableCell className="font-mono">{formatCurrency(d.amount)}</TableCell>
                      <TableCell>{d.payment_method}</TableCell>
                      <TableCell className="font-mono text-xs">{d.reference_number || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={
                          d.status === 'approved' ? 'default' :
                          d.status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {d.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(d.created_at)}</TableCell>
                      <TableCell className="text-right">
                        {d.status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleApproveDeposit(d.id)}
                              data-testid={`approve-deposit-${d.id}`}
                            >
                              <CheckCircle className="w-4 h-4 text-neon-green" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleRejectDeposit(d.id)}
                            >
                              <XCircle className="w-4 h-4 text-neon-red" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {deposits.length === 0 && (
                <div className="text-center py-12">
                  <ArrowDownToLine className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No deposits found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.map((w: any) => (
                    <TableRow key={w.id}>
                      <TableCell>{w.user_id?.slice(0, 8)}...</TableCell>
                      <TableCell className="font-mono">{formatCurrency(w.amount)}</TableCell>
                      <TableCell>{w.payment_method}</TableCell>
                      <TableCell className="font-mono text-xs">{w.account_number || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={
                          w.status === 'approved' ? 'default' :
                          w.status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {w.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(w.created_at)}</TableCell>
                      <TableCell className="text-right">
                        {w.status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleApproveWithdrawal(w.id)}
                              data-testid={`approve-withdrawal-${w.id}`}
                            >
                              <CheckCircle className="w-4 h-4 text-neon-green" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {withdrawals.length === 0 && (
                <div className="text-center py-12">
                  <ArrowUpFromLine className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No withdrawals found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.slice(0, 50).map((t: any) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        <Badge variant="outline">{t.transaction_type}</Badge>
                      </TableCell>
                      <TableCell className="font-mono">{formatCurrency(t.amount)}</TableCell>
                      <TableCell className="text-xs">{t.from_user_id?.slice(0, 8) || 'System'}...</TableCell>
                      <TableCell className="text-xs">{t.to_user_id?.slice(0, 8)}...</TableCell>
                      <TableCell className="max-w-xs truncate">{t.description}</TableCell>
                      <TableCell className="text-sm">{formatDate(t.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {transactions.length === 0 && (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No transactions found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============= KYC SECTION =============
function KYCSection({ kycDocs, onRefresh, refreshing, formatDate }: any) {
  const handleApprove = async (kycId: string) => {
    try {
      await apiClient.approveKYC(kycId);
      toast.success('KYC approved!');
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve KYC');
    }
  };

  const handleReject = async (kycId: string) => {
    try {
      await apiClient.rejectKYC(kycId, 'Documents not valid');
      toast.success('KYC rejected');
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject KYC');
    }
  };

  return (
    <div data-testid="kyc-section">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">KYC Management</h1>
          <p className="text-muted-foreground">Review and approve user verification documents</p>
        </div>
        <Button variant="outline" onClick={onRefresh} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Document Type</TableHead>
                <TableHead>Document Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kycDocs.map((kyc: any) => (
                <TableRow key={kyc.id}>
                  <TableCell className="font-mono text-xs">{kyc.user_id?.slice(0, 8)}...</TableCell>
                  <TableCell className="capitalize">{kyc.document_type?.replace('_', ' ')}</TableCell>
                  <TableCell className="font-mono">{kyc.document_number || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={
                      kyc.status === 'approved' ? 'default' :
                      kyc.status === 'pending' ? 'secondary' : 'destructive'
                    }>
                      {kyc.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(kyc.created_at)}</TableCell>
                  <TableCell className="text-right">
                    {kyc.status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleApprove(kyc.id)}
                          data-testid={`approve-kyc-${kyc.id}`}
                        >
                          <CheckCircle className="w-4 h-4 text-neon-green" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleReject(kyc.id)}
                        >
                          <XCircle className="w-4 h-4 text-neon-red" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {kycDocs.length === 0 && (
            <div className="text-center py-12">
              <FileCheck className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No pending KYC documents</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============= BETS SECTION =============
function BetsSection({ bets, onRefresh, refreshing, formatCurrency, formatDate }: any) {
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredBets = bets.filter((b: any) => 
    statusFilter === 'all' || b.status === statusFilter
  );

  const handleSettleBet = async (betId: string, result: 'won' | 'lost') => {
    try {
      await apiClient.settleBet(betId, result, result === 'won' ? 100 : 0);
      toast.success(`Bet settled as ${result}!`);
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to settle bet');
    }
  };

  const handleCancelBet = async (betId: string) => {
    try {
      await apiClient.cancelBet(betId, 'Cancelled by admin');
      toast.success('Bet cancelled and refunded');
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel bet');
    }
  };

  return (
    <div data-testid="bets-section">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Bet Management</h1>
          <p className="text-muted-foreground">Monitor and manage user bets</p>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bets</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="won">Won</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={onRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Game</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Potential Win</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBets.map((bet: any) => (
                <TableRow key={bet.id}>
                  <TableCell className="font-mono text-xs">{bet.user_id?.slice(0, 8)}...</TableCell>
                  <TableCell>{bet.game_id?.slice(0, 8)}...</TableCell>
                  <TableCell className="font-mono">{formatCurrency(bet.amount)}</TableCell>
                  <TableCell className="font-mono text-neon-gold">{formatCurrency(bet.potential_win || 0)}</TableCell>
                  <TableCell>
                    <Badge variant={
                      bet.status === 'won' ? 'default' :
                      bet.status === 'lost' ? 'destructive' :
                      bet.status === 'pending' ? 'secondary' : 'outline'
                    }>
                      {bet.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(bet.created_at)}</TableCell>
                  <TableCell className="text-right">
                    {bet.status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleSettleBet(bet.id, 'won')}
                          title="Mark as Won"
                          data-testid={`settle-won-${bet.id}`}
                        >
                          <CheckCircle className="w-4 h-4 text-neon-green" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleSettleBet(bet.id, 'lost')}
                          title="Mark as Lost"
                        >
                          <XCircle className="w-4 h-4 text-neon-red" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleCancelBet(bet.id)}
                          title="Cancel & Refund"
                        >
                          <Ban className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredBets.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No bets found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============= BONUSES SECTION =============
function BonusesSection({ bonusRules, onRefresh, refreshing }: any) {
  return (
    <div data-testid="bonuses-section">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Bonuses & Promotions</h1>
          <p className="text-muted-foreground">Manage bonus rules and promotional campaigns</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Bonus
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bonusRules.map((rule: any) => (
          <Card key={rule.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{rule.name}</CardTitle>
                <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                  {rule.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <CardDescription>{rule.bonus_type}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Percentage</span>
                  <span className="font-mono">{rule.percentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max Bonus</span>
                  <span className="font-mono">₹{rule.max_bonus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Min Deposit</span>
                  <span className="font-mono">₹{rule.min_deposit}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {bonusRules.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No bonus rules configured</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============= SUPPORT SECTION =============
function SupportSection({ tickets, onRefresh, refreshing, formatDate }: any) {
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredTickets = tickets.filter((t: any) => 
    statusFilter === 'all' || t.status === statusFilter
  );

  const handleCloseTicket = async (ticketId: string) => {
    try {
      await apiClient.closeTicket(ticketId);
      toast.success('Ticket closed');
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to close ticket');
    }
  };

  return (
    <div data-testid="support-section">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Support Tickets</h1>
          <p className="text-muted-foreground">Manage user support requests</p>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tickets</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={onRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map((ticket: any) => (
                <TableRow key={ticket.id}>
                  <TableCell className="max-w-xs truncate">{ticket.subject}</TableCell>
                  <TableCell className="font-mono text-xs">{ticket.user_id?.slice(0, 8)}...</TableCell>
                  <TableCell className="capitalize">{ticket.category}</TableCell>
                  <TableCell>
                    <Badge variant={
                      ticket.priority === 'high' ? 'destructive' :
                      ticket.priority === 'medium' ? 'secondary' : 'outline'
                    }>
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      ticket.status === 'open' ? 'default' :
                      ticket.status === 'in_progress' ? 'secondary' : 'outline'
                    }>
                      {ticket.status?.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(ticket.created_at)}</TableCell>
                  <TableCell className="text-right">
                    {ticket.status !== 'closed' && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleCloseTicket(ticket.id)}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredTickets.length === 0 && (
            <div className="text-center py-12">
              <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No tickets found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============= SETTINGS SECTION =============
function SettingsSection() {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<Record<string, any>>({});

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await apiClient.getSystemConfig();
      setConfig(data);
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  };

  return (
    <div data-testid="settings-section">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">Configure platform settings and parameters</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Platform Configuration</CardTitle>
            <CardDescription>Basic platform settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Platform Name</Label>
              <Input defaultValue={config.platform_name || 'KarnaliX'} />
            </div>
            <div>
              <Label>Support Email</Label>
              <Input defaultValue={config.support_email || 'support@karnalix.com'} />
            </div>
            <div>
              <Label>Maintenance Mode</Label>
              <div className="flex items-center gap-2 mt-2">
                <Switch defaultChecked={config.maintenance_mode === 'true'} />
                <span className="text-sm text-muted-foreground">Enable maintenance mode</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Limits</CardTitle>
            <CardDescription>Set deposit and withdrawal limits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min Deposit</Label>
                <Input type="number" defaultValue={config.min_deposit || 100} />
              </div>
              <div>
                <Label>Max Deposit</Label>
                <Input type="number" defaultValue={config.max_deposit || 100000} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min Withdrawal</Label>
                <Input type="number" defaultValue={config.min_withdrawal || 500} />
              </div>
              <div>
                <Label>Max Withdrawal</Label>
                <Input type="number" defaultValue={config.max_withdrawal || 50000} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Referral Settings</CardTitle>
            <CardDescription>Configure referral program</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Referral Bonus (%)</Label>
              <Input type="number" defaultValue={config.referral_bonus_percent || 5} />
            </div>
            <div>
              <Label>Min Referral Deposit</Label>
              <Input type="number" defaultValue={config.min_referral_deposit || 1000} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>KYC Settings</CardTitle>
            <CardDescription>KYC verification requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>KYC Required for Withdrawal</Label>
                <p className="text-xs text-muted-foreground">Users must complete KYC before withdrawing</p>
              </div>
              <Switch defaultChecked={true} />
            </div>
            <div>
              <Label>KYC Document Types</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge>Aadhaar</Badge>
                <Badge>PAN Card</Badge>
                <Badge>Passport</Badge>
                <Badge>Driving License</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============= HELPER COMPONENTS =============
function StatsCard({ title, value, subtitle, icon: Icon, color }: any) {
  const colorClasses = {
    primary: 'bg-primary/20 text-primary',
    gold: 'bg-neon-gold/20 text-neon-gold',
    purple: 'bg-neon-purple/20 text-neon-purple',
    warning: 'bg-yellow-500/20 text-yellow-500',
    success: 'bg-neon-green/20 text-neon-green',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses]}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniStatCard({ label, value, trend }: { label: string; value: number; trend?: string }) {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <p className={`text-2xl font-bold ${trend === 'warning' ? 'text-yellow-500' : ''}`}>{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
