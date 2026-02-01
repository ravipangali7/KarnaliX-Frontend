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
import { Switch } from '@/components/ui/switch';
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
  Zap,
  Users,
  Wallet,
  Shield,
  Settings,
  ArrowLeft,
  Plus,
  Search,
  RefreshCw,
  Coins,
  AlertTriangle,
  FileText,
  Ban,
  UserPlus,
  TrendingUp,
  Activity,
  Globe,
  Power,
  CheckCircle,
  XCircle,
  Gamepad2,
  Building2,
  IdCard,
  Dices,
  Headphones,
  Wrench,
  Edit,
  Trash2,
  Eye,
  X,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface PowerHouseStats {
  users: {
    total: number;
    by_role: Record<string, number>;
    active: number;
    suspended: number;
  };
  finances: {
    total_wallet_balance: string;
    total_deposits: string;
    total_withdrawals: string;
    net_deposits: string;
  };
  betting: {
    total_bets: number;
    total_volume: string;
    total_wins_paid: string;
    house_edge: string;
  };
  platform: {
    is_suspended: boolean;
  };
}

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Zap },
  { id: 'superadmins', label: 'SuperAdmin Management', icon: Shield },
  { id: 'games', label: 'Games Management', icon: Gamepad2 },
  { id: 'providers', label: 'Providers', icon: Building2 },
  { id: 'kyc', label: 'KYC Management', icon: IdCard },
  { id: 'bets', label: 'Bet Management', icon: Dices },
  { id: 'support', label: 'Support Tickets', icon: Headphones },
  { id: 'mint', label: 'Coin Minting', icon: Coins },
  { id: 'wallets', label: 'Global Wallets', icon: Wallet },
  { id: 'audit', label: 'Audit Logs', icon: FileText },
  { id: 'config', label: 'System Config', icon: Wrench },
  { id: 'platform', label: 'Platform Controls', icon: Settings },
];

export default function PowerHousePanel() {
  const { user, logout, isPowerHouse, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [stats, setStats] = useState<PowerHouseStats | null>(null);
  const [superAdmins, setSuperAdmins] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [platformSuspended, setPlatformSuspended] = useState(false);
  const [games, setGames] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [kycRequests, setKycRequests] = useState<any[]>([]);
  const [bets, setBets] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [systemConfig, setSystemConfig] = useState<any[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!isPowerHouse) {
      navigate('/login');
      return;
    }
    loadDashboardData();
  }, [isPowerHouse, navigate, authLoading]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, superAdminsData, usersData] = await Promise.all([
        apiClient.getPowerHouseStats().catch(() => null),
        apiClient.getPowerHouseSuperAdmins().catch(() => []),
        apiClient.getUsers().catch(() => []),
      ]);

      if (statsData) {
        setStats(statsData);
        setPlatformSuspended(statsData.platform?.is_suspended || false);
      }
      setSuperAdmins(superAdminsData);
      setAllUsers(usersData);
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
        case 'superadmins':
          const superAdminsData = await apiClient.getPowerHouseSuperAdmins();
          setSuperAdmins(superAdminsData);
          break;
        case 'wallets':
          const walletsData = await apiClient.getGlobalWallets();
          setWallets(walletsData.wallets || []);
          break;
        case 'audit':
          const logsData = await apiClient.getAuditLogs({ limit: 100 });
          setAuditLogs(logsData.logs || []);
          break;
        case 'games':
          const [gamesData, providersData, categoriesData] = await Promise.all([
            apiClient.getAllGames().catch(() => []),
            apiClient.getAllProviders().catch(() => []),
            apiClient.getAllCategories().catch(() => []),
          ]);
          setGames(gamesData || []);
          setProviders(providersData || []);
          setCategories(categoriesData || []);
          break;
        case 'providers':
          const allProvidersData = await apiClient.getAllProviders();
          setProviders(allProvidersData || []);
          break;
        case 'kyc':
          const kycData = await apiClient.getAllKYC();
          setKycRequests(kycData || []);
          break;
        case 'bets':
          const betsData = await apiClient.getAllBets();
          setBets(betsData || []);
          break;
        case 'support':
          const ticketsData = await apiClient.getTickets();
          setTickets(ticketsData.tickets || []);
          break;
        case 'config':
          const configData = await apiClient.getSystemConfig();
          setSystemConfig(configData || []);
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

  const formatCurrency = (amount: string | number) => `₹${Number(amount || 0).toLocaleString()}`;
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading PowerHouse panel...</p>
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
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">PowerHouse</h2>
              <p className="text-xs text-muted-foreground">Platform Owner</p>
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
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    isActive
                      ? 'bg-yellow-500 text-black'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-yellow-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.username}</p>
              <p className="text-xs text-yellow-500">PowerHouse</p>
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
          {activeSection === 'dashboard' && (
            <DashboardSection
              stats={stats}
              superAdmins={superAdmins}
              onRefresh={loadDashboardData}
              refreshing={refreshing}
              formatCurrency={formatCurrency}
            />
          )}

          {activeSection === 'superadmins' && (
            <SuperAdminManagementSection
              superAdmins={superAdmins}
              onRefresh={() => loadSectionData('superadmins')}
              refreshing={refreshing}
              formatCurrency={formatCurrency}
            />
          )}

          {activeSection === 'mint' && (
            <MintingSection
              users={allUsers}
              onRefresh={loadDashboardData}
              formatCurrency={formatCurrency}
            />
          )}

          {activeSection === 'wallets' && (
            <GlobalWalletsSection
              wallets={wallets}
              onRefresh={() => loadSectionData('wallets')}
              refreshing={refreshing}
              formatCurrency={formatCurrency}
            />
          )}

          {activeSection === 'audit' && (
            <AuditLogsSection
              logs={auditLogs}
              onRefresh={() => loadSectionData('audit')}
              refreshing={refreshing}
              formatDate={formatDate}
            />
          )}

          {activeSection === 'games' && (
            <GamesManagementSection
              games={games}
              providers={providers}
              categories={categories}
              onRefresh={() => loadSectionData('games')}
              refreshing={refreshing}
            />
          )}

          {activeSection === 'providers' && (
            <ProvidersManagementSection
              providers={providers}
              onRefresh={() => loadSectionData('providers')}
              refreshing={refreshing}
            />
          )}

          {activeSection === 'kyc' && (
            <KYCManagementSection
              kycRequests={kycRequests}
              onRefresh={() => loadSectionData('kyc')}
              refreshing={refreshing}
            />
          )}

          {activeSection === 'bets' && (
            <BetManagementSection
              bets={bets}
              onRefresh={() => loadSectionData('bets')}
              refreshing={refreshing}
              formatCurrency={formatCurrency}
            />
          )}

          {activeSection === 'support' && (
            <SupportTicketsSection
              tickets={tickets}
              onRefresh={() => loadSectionData('support')}
              refreshing={refreshing}
            />
          )}

          {activeSection === 'config' && (
            <SystemConfigSection
              config={systemConfig}
              onRefresh={() => loadSectionData('config')}
              refreshing={refreshing}
            />
          )}

          {activeSection === 'platform' && (
            <PlatformControlsSection
              isSuspended={platformSuspended}
              onSuspendChange={setPlatformSuspended}
            />
          )}
        </div>
      </main>
    </div>
  );
}

// Dashboard Section
function DashboardSection({ stats, superAdmins, onRefresh, refreshing, formatCurrency }: any) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">PowerHouse Dashboard</h1>
          <p className="text-muted-foreground">Global platform overview and controls</p>
        </div>
        <Button variant="outline" onClick={onRefresh} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-yellow-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats?.users?.total || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {stats?.users?.active || 0} active
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <p className="text-2xl font-bold">{formatCurrency(stats?.finances?.total_wallet_balance)}</p>
                <p className="text-xs text-muted-foreground">All wallets</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bet Volume</p>
                <p className="text-2xl font-bold">{formatCurrency(stats?.betting?.total_volume)}</p>
                <p className="text-xs text-muted-foreground">{stats?.betting?.total_bets || 0} bets</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">House Edge</p>
                <p className="text-2xl font-bold">{formatCurrency(stats?.betting?.house_edge)}</p>
                <p className="text-xs text-muted-foreground">Net profit</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>User Distribution by Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats?.users?.by_role || {}).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between">
                  <span className="capitalize">{role.replace('_', ' ')}</span>
                  <Badge variant="outline">{count as number}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Deposits</span>
                <span className="font-bold text-green-500">
                  {formatCurrency(stats?.finances?.total_deposits)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Withdrawals</span>
                <span className="font-bold text-red-500">
                  {formatCurrency(stats?.finances?.total_withdrawals)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t pt-4">
                <span className="text-muted-foreground">Net Deposits</span>
                <span className="font-bold">
                  {formatCurrency(stats?.finances?.net_deposits)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SuperAdmins Quick View */}
      <Card>
        <CardHeader>
          <CardTitle>SuperAdmins ({superAdmins.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Masters</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {superAdmins.slice(0, 5).map((sa: any) => (
                <TableRow key={sa.id}>
                  <TableCell className="font-medium">{sa.username}</TableCell>
                  <TableCell>{sa.email}</TableCell>
                  <TableCell>{formatCurrency(sa.wallet_balance)}</TableCell>
                  <TableCell>{sa.masters_count || 0}</TableCell>
                  <TableCell>
                    <Badge variant={sa.status === 'active' ? 'default' : 'destructive'}>
                      {sa.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// SuperAdmin Management Section
function SuperAdminManagementSection({ superAdmins, onRefresh, refreshing, formatCurrency }: any) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newSuperAdmin, setNewSuperAdmin] = useState({
    email: '', username: '', password: '', full_name: '', transfer_limit: ''
  });

  const handleCreateSuperAdmin = async () => {
    setLoading(true);
    try {
      await apiClient.createSuperAdmin({
        ...newSuperAdmin,
        transfer_limit: newSuperAdmin.transfer_limit ? Number(newSuperAdmin.transfer_limit) : undefined,
      });
      toast.success('SuperAdmin created successfully!');
      setShowCreateDialog(false);
      setNewSuperAdmin({ email: '', username: '', password: '', full_name: '', transfer_limit: '' });
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create SuperAdmin');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (userId: string, username: string, currentlySuspended: boolean) => {
    try {
      await apiClient.powerHouseSuspendUser(userId, !currentlySuspended);
      toast.success(`${username} ${currentlySuspended ? 'activated' : 'suspended'}`);
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user status');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">SuperAdmin Management</h1>
          <p className="text-muted-foreground">Create and manage SuperAdmin accounts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
                <UserPlus className="w-4 h-4 mr-2" />
                Create SuperAdmin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New SuperAdmin</DialogTitle>
                <DialogDescription>Add a new SuperAdmin to manage the platform</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={newSuperAdmin.email}
                      onChange={(e) => setNewSuperAdmin({ ...newSuperAdmin, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Username</Label>
                    <Input
                      value={newSuperAdmin.username}
                      onChange={(e) => setNewSuperAdmin({ ...newSuperAdmin, username: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Password</Label>
                    <Input
                      type="password"
                      value={newSuperAdmin.password}
                      onChange={(e) => setNewSuperAdmin({ ...newSuperAdmin, password: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Full Name</Label>
                    <Input
                      value={newSuperAdmin.full_name}
                      onChange={(e) => setNewSuperAdmin({ ...newSuperAdmin, full_name: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Transfer Limit (Optional)</Label>
                  <Input
                    type="number"
                    value={newSuperAdmin.transfer_limit}
                    onChange={(e) => setNewSuperAdmin({ ...newSuperAdmin, transfer_limit: e.target.value })}
                    placeholder="Leave empty for unlimited"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                <Button onClick={handleCreateSuperAdmin} disabled={loading} className="bg-yellow-500 hover:bg-yellow-600 text-black">
                  {loading ? 'Creating...' : 'Create SuperAdmin'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Transfer Limit</TableHead>
                <TableHead>Masters</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {superAdmins.map((sa: any) => (
                <TableRow key={sa.id}>
                  <TableCell className="font-medium">{sa.username}</TableCell>
                  <TableCell>{sa.email}</TableCell>
                  <TableCell>{sa.full_name}</TableCell>
                  <TableCell>{formatCurrency(sa.wallet_balance)}</TableCell>
                  <TableCell>{sa.transfer_limit ? formatCurrency(sa.transfer_limit) : 'Unlimited'}</TableCell>
                  <TableCell>{sa.masters_count || 0}</TableCell>
                  <TableCell>
                    <Badge variant={sa.status === 'active' ? 'default' : 'destructive'}>
                      {sa.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{new Date(sa.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSuspend(sa.id, sa.username, sa.status === 'suspended')}
                    >
                      {sa.status === 'suspended' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Ban className="w-4 h-4 text-red-500" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Minting Section
function MintingSection({ users, onRefresh, formatCurrency }: any) {
  const [loading, setLoading] = useState(false);
  const [mintForm, setMintForm] = useState({ to_user_id: '', amount: '', description: '' });

  const handleMint = async () => {
    setLoading(true);
    try {
      await apiClient.powerHouseMint(mintForm.to_user_id, Number(mintForm.amount), mintForm.description);
      toast.success(`${mintForm.amount} coins minted successfully!`);
      setMintForm({ to_user_id: '', amount: '', description: '' });
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to mint coins');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Coin Minting</h1>
          <p className="text-muted-foreground">Generate new coins and allocate to users</p>
        </div>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-yellow-500" />
            Mint New Coins
          </CardTitle>
          <CardDescription>
            As PowerHouse, you have root-level access to generate new coins
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Select User</Label>
            <Select value={mintForm.to_user_id} onValueChange={(v) => setMintForm({ ...mintForm, to_user_id: v })}>
              <SelectTrigger>
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
              onChange={(e) => setMintForm({ ...mintForm, amount: e.target.value })}
              placeholder="Enter amount to mint"
            />
          </div>
          <div>
            <Label>Description (Optional)</Label>
            <Input
              value={mintForm.description}
              onChange={(e) => setMintForm({ ...mintForm, description: e.target.value })}
              placeholder="e.g., Initial allocation, Bonus, etc."
            />
          </div>
          <Button
            onClick={handleMint}
            disabled={loading || !mintForm.to_user_id || !mintForm.amount}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
          >
            {loading ? 'Minting...' : 'Mint Coins'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Global Wallets Section
function GlobalWalletsSection({ wallets, onRefresh, refreshing, formatCurrency }: any) {
  const [roleFilter, setRoleFilter] = useState('all');

  const filteredWallets = wallets.filter((w: any) =>
    roleFilter === 'all' || w.role === roleFilter
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Global Wallets</h1>
          <p className="text-muted-foreground">View all wallet balances across the platform</p>
        </div>
        <div className="flex gap-2">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="powerhouse">PowerHouse</SelectItem>
              <SelectItem value="super_admin">SuperAdmin</SelectItem>
              <SelectItem value="master">Master</SelectItem>
              <SelectItem value="user">User</SelectItem>
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
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWallets.map((w: any) => (
                <TableRow key={w.user_id}>
                  <TableCell className="font-medium">{w.username}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {w.role?.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono">{formatCurrency(w.balance)}</TableCell>
                  <TableCell>{w.currency}</TableCell>
                  <TableCell>
                    <Badge variant={w.status === 'active' ? 'default' : 'destructive'}>
                      {w.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Audit Logs Section
function AuditLogsSection({ logs, onRefresh, refreshing, formatDate }: any) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground">Complete history of all admin actions</p>
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
                <TableHead>Admin</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log: any) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.admin_user || 'System'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.action}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">{log.entity_type}</span>
                    <span className="mx-1">/</span>
                    <span className="font-mono text-xs">{log.entity_id}</span>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{log.ip_address || '-'}</TableCell>
                  <TableCell className="text-sm">{formatDate(log.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Platform Controls Section
function PlatformControlsSection({ isSuspended, onSuspendChange }: any) {
  const [loading, setLoading] = useState(false);

  const handleToggleSuspend = async () => {
    setLoading(true);
    try {
      await apiClient.emergencySuspend(!isSuspended);
      onSuspendChange(!isSuspended);
      toast.success(`Platform ${!isSuspended ? 'suspended' : 'resumed'}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update platform status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Platform Controls</h1>
          <p className="text-muted-foreground">Emergency controls and system settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className={isSuspended ? 'border-red-500/50' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className={`w-5 h-5 ${isSuspended ? 'text-red-500' : 'text-yellow-500'}`} />
              Emergency Platform Suspend
            </CardTitle>
            <CardDescription>
              Suspend all platform operations. Only PowerHouse will have access during suspension.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">Platform Status</p>
                <p className="text-sm text-muted-foreground">
                  {isSuspended ? 'Currently SUSPENDED' : 'Currently ACTIVE'}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={isSuspended ? 'destructive' : 'default'}>
                  {isSuspended ? 'SUSPENDED' : 'ACTIVE'}
                </Badge>
                <Switch
                  checked={isSuspended}
                  onCheckedChange={handleToggleSuspend}
                  disabled={loading}
                />
              </div>
            </div>
            {isSuspended && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-500 text-sm">
                  <AlertTriangle className="w-4 h-4 inline mr-2" />
                  Platform is currently suspended. All users except PowerHouse are blocked from accessing the system.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-500" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Platform Version</span>
                <Badge variant="outline">v1.0.0</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Database</span>
                <Badge variant="outline">SQLite</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Backend</span>
                <Badge variant="outline">Django</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Frontend</span>
                <Badge variant="outline">React + Vite</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Games Management Section
function GamesManagementSection({ games, providers, categories, onRefresh, refreshing }: any) {
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingGame, setEditingGame] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [gameForm, setGameForm] = useState({
    name: '', slug: '', description: '', image: '', category_id: '', provider_id: '',
    min_bet: '10', max_bet: '10000', is_active: true, is_hot: false, is_new: false, sort_order: 0
  });

  const resetForm = () => {
    setGameForm({
      name: '', slug: '', description: '', image: '', category_id: '', provider_id: '',
      min_bet: '10', max_bet: '10000', is_active: true, is_hot: false, is_new: false, sort_order: 0
    });
    setEditingGame(null);
  };

  const handleEdit = (game: any) => {
    setEditingGame(game);
    setGameForm({
      name: game.name || '',
      slug: game.slug || '',
      description: game.description || '',
      image: game.image || '',
      category_id: game.category?.id?.toString() || '',
      provider_id: game.provider?.id?.toString() || '',
      min_bet: game.min_bet?.toString() || '10',
      max_bet: game.max_bet?.toString() || '10000',
      is_active: game.is_active ?? true,
      is_hot: game.is_hot ?? false,
      is_new: game.is_new ?? false,
      sort_order: game.sort_order ?? 0
    });
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data = {
        ...gameForm,
        category_id: gameForm.category_id ? Number(gameForm.category_id) : null,
        provider_id: gameForm.provider_id ? Number(gameForm.provider_id) : null,
        min_bet: Number(gameForm.min_bet),
        max_bet: Number(gameForm.max_bet),
      };
      
      if (editingGame) {
        await apiClient.updateGame(editingGame.id, data);
        toast.success('Game updated successfully!');
      } else {
        await apiClient.createGame(data);
        toast.success('Game created successfully!');
      }
      setShowDialog(false);
      resetForm();
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save game');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (gameId: string) => {
    if (!confirm('Are you sure you want to delete this game?')) return;
    try {
      await apiClient.deleteGame(gameId);
      toast.success('Game deleted!');
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete game');
    }
  };

  const handleToggleActive = async (game: any) => {
    try {
      await apiClient.updateGame(game.id, { is_active: !game.is_active });
      toast.success(`Game ${game.is_active ? 'deactivated' : 'activated'}`);
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update game');
    }
  };

  const filteredGames = games.filter((g: any) =>
    g.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.slug?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Games Management</h1>
          <p className="text-muted-foreground">Manage all games on the platform</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Button variant="outline" onClick={onRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
                <Plus className="w-4 h-4 mr-2" />
                Add Game
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingGame ? 'Edit Game' : 'Create New Game'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name *</Label>
                    <Input value={gameForm.name} onChange={(e) => setGameForm({ ...gameForm, name: e.target.value })} />
                  </div>
                  <div>
                    <Label>Slug</Label>
                    <Input value={gameForm.slug} onChange={(e) => setGameForm({ ...gameForm, slug: e.target.value })} placeholder="Auto-generated if empty" />
                  </div>
                </div>
                <div>
                  <Label>Image URL</Label>
                  <Input value={gameForm.image} onChange={(e) => setGameForm({ ...gameForm, image: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select value={gameForm.category_id} onValueChange={(v) => setGameForm({ ...gameForm, category_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {categories.map((c: any) => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Provider</Label>
                    <Select value={gameForm.provider_id} onValueChange={(v) => setGameForm({ ...gameForm, provider_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
                      <SelectContent>
                        {providers.map((p: any) => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Min Bet</Label>
                    <Input type="number" value={gameForm.min_bet} onChange={(e) => setGameForm({ ...gameForm, min_bet: e.target.value })} />
                  </div>
                  <div>
                    <Label>Max Bet</Label>
                    <Input type="number" value={gameForm.max_bet} onChange={(e) => setGameForm({ ...gameForm, max_bet: e.target.value })} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <Switch checked={gameForm.is_active} onCheckedChange={(c) => setGameForm({ ...gameForm, is_active: c })} />
                    <Label>Active</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={gameForm.is_hot} onCheckedChange={(c) => setGameForm({ ...gameForm, is_hot: c })} />
                    <Label>Hot</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={gameForm.is_new} onCheckedChange={(c) => setGameForm({ ...gameForm, is_new: c })} />
                    <Label>New</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setShowDialog(false); resetForm(); }}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={loading || !gameForm.name} className="bg-yellow-500 hover:bg-yellow-600 text-black">
                  {loading ? 'Saving...' : editingGame ? 'Update Game' : 'Create Game'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Bet Range</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Flags</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGames.map((game: any) => (
                <TableRow key={game.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {game.image && <img src={game.image} alt={game.name} className="w-8 h-8 rounded object-cover" />}
                      {game.name}
                    </div>
                  </TableCell>
                  <TableCell>{game.category?.name || '-'}</TableCell>
                  <TableCell>{game.provider?.name || '-'}</TableCell>
                  <TableCell>₹{game.min_bet} - ₹{game.max_bet}</TableCell>
                  <TableCell>
                    <Badge variant={game.is_active ? 'default' : 'secondary'}>{game.is_active ? 'Active' : 'Inactive'}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {game.is_hot && <Badge variant="outline" className="text-orange-500 border-orange-500">Hot</Badge>}
                      {game.is_new && <Badge variant="outline" className="text-green-500 border-green-500">New</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleToggleActive(game)}>
                        {game.is_active ? <XCircle className="w-4 h-4 text-red-500" /> : <CheckCircle className="w-4 h-4 text-green-500" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(game)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(game.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Providers Management Section
function ProvidersManagementSection({ providers, onRefresh, refreshing }: any) {
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingProvider, setEditingProvider] = useState<any>(null);
  const [providerForm, setProviderForm] = useState({
    name: '', logo: '', description: '', website_url: '', is_active: true, sort_order: 0
  });

  const resetForm = () => {
    setProviderForm({ name: '', logo: '', description: '', website_url: '', is_active: true, sort_order: 0 });
    setEditingProvider(null);
  };

  const handleEdit = (provider: any) => {
    setEditingProvider(provider);
    setProviderForm({
      name: provider.name || '',
      logo: provider.logo || '',
      description: provider.description || '',
      website_url: provider.website_url || '',
      is_active: provider.is_active ?? true,
      sort_order: provider.sort_order ?? 0
    });
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (editingProvider) {
        await apiClient.updateProvider(editingProvider.id, providerForm);
        toast.success('Provider updated!');
      } else {
        await apiClient.createProvider(providerForm);
        toast.success('Provider created!');
      }
      setShowDialog(false);
      resetForm();
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save provider');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (providerId: string) => {
    if (!confirm('Delete this provider?')) return;
    try {
      await apiClient.deleteProvider(providerId);
      toast.success('Provider deleted!');
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete');
    }
  };

  const handleToggleActive = async (provider: any) => {
    try {
      await apiClient.updateProvider(provider.id, { is_active: !provider.is_active });
      toast.success(`Provider ${provider.is_active ? 'deactivated' : 'activated'}`);
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Providers Management</h1>
          <p className="text-muted-foreground">Manage game providers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
                <Plus className="w-4 h-4 mr-2" />
                Add Provider
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingProvider ? 'Edit Provider' : 'Create Provider'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Name *</Label>
                  <Input value={providerForm.name} onChange={(e) => setProviderForm({ ...providerForm, name: e.target.value })} />
                </div>
                <div>
                  <Label>Logo URL</Label>
                  <Input value={providerForm.logo} onChange={(e) => setProviderForm({ ...providerForm, logo: e.target.value })} />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input value={providerForm.description} onChange={(e) => setProviderForm({ ...providerForm, description: e.target.value })} />
                </div>
                <div>
                  <Label>Website URL</Label>
                  <Input value={providerForm.website_url} onChange={(e) => setProviderForm({ ...providerForm, website_url: e.target.value })} />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={providerForm.is_active} onCheckedChange={(c) => setProviderForm({ ...providerForm, is_active: c })} />
                  <Label>Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setShowDialog(false); resetForm(); }}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={loading || !providerForm.name} className="bg-yellow-500 hover:bg-yellow-600 text-black">
                  {loading ? 'Saving...' : editingProvider ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Website</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {providers.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {p.logo && <img src={p.logo} alt={p.name} className="w-8 h-8 rounded object-cover" />}
                      {p.name}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{p.description || '-'}</TableCell>
                  <TableCell>{p.website_url ? <a href={p.website_url} target="_blank" className="text-primary hover:underline">Link</a> : '-'}</TableCell>
                  <TableCell>
                    <Badge variant={p.is_active ? 'default' : 'secondary'}>{p.is_active ? 'Active' : 'Inactive'}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleToggleActive(p)}>
                        {p.is_active ? <XCircle className="w-4 h-4 text-red-500" /> : <CheckCircle className="w-4 h-4 text-green-500" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(p)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// KYC Management Section
function KYCManagementSection({ kycRequests, onRefresh, refreshing }: any) {
  const [loading, setLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState('pending');

  const handleApprove = async (kycId: string) => {
    setLoading(kycId);
    try {
      await apiClient.approveKYC(kycId);
      toast.success('KYC approved!');
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve');
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async (kycId: string) => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    setLoading(kycId);
    try {
      await apiClient.rejectKYC(kycId, reason);
      toast.success('KYC rejected');
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject');
    } finally {
      setLoading(null);
    }
  };

  const filteredKYC = kycRequests.filter((k: any) => filter === 'all' || k.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">KYC Management</h1>
          <p className="text-muted-foreground">Review and approve KYC verifications</p>
        </div>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="all">All</SelectItem>
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
                <TableHead>Document Type</TableHead>
                <TableHead>Document #</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredKYC.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No KYC requests found</TableCell>
                </TableRow>
              ) : filteredKYC.map((kyc: any) => (
                <TableRow key={kyc.id}>
                  <TableCell className="font-medium">{kyc.user?.username || kyc.username || 'Unknown'}</TableCell>
                  <TableCell className="capitalize">{kyc.document_type?.replace('_', ' ') || '-'}</TableCell>
                  <TableCell className="font-mono">{kyc.document_number || '-'}</TableCell>
                  <TableCell>{kyc.submitted_at ? new Date(kyc.submitted_at).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>
                    <Badge variant={kyc.status === 'approved' ? 'default' : kyc.status === 'rejected' ? 'destructive' : 'secondary'}>
                      {kyc.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {kyc.status === 'pending' && (
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleApprove(kyc.id)} disabled={loading === kyc.id}>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleReject(kyc.id)} disabled={loading === kyc.id}>
                          <XCircle className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Bet Management Section
function BetManagementSection({ bets, onRefresh, refreshing, formatCurrency }: any) {
  const [loading, setLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  const handleSettle = async (betId: string, result: 'won' | 'lost') => {
    const winAmount = result === 'won' ? prompt('Win amount:', '0') : '0';
    if (winAmount === null) return;
    setLoading(betId);
    try {
      await apiClient.settleBet(betId, result, Number(winAmount));
      toast.success(`Bet settled as ${result}`);
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to settle');
    } finally {
      setLoading(null);
    }
  };

  const handleCancel = async (betId: string) => {
    const reason = prompt('Cancellation reason:');
    if (!reason) return;
    setLoading(betId);
    try {
      await apiClient.cancelBet(betId, reason);
      toast.success('Bet cancelled and refunded');
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel');
    } finally {
      setLoading(null);
    }
  };

  const filteredBets = bets.filter((b: any) => filter === 'all' || b.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Bet Management</h1>
          <p className="text-muted-foreground">Settle and manage all bets</p>
        </div>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
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
                <TableHead>Bet Amount</TableHead>
                <TableHead>Win Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No bets found</TableCell>
                </TableRow>
              ) : filteredBets.slice(0, 50).map((bet: any) => (
                <TableRow key={bet.id}>
                  <TableCell className="font-medium">{bet.user?.username || bet.username || 'Unknown'}</TableCell>
                  <TableCell>{bet.game_name || bet.game?.name || '-'}</TableCell>
                  <TableCell className="font-mono">{formatCurrency(bet.bet_amount)}</TableCell>
                  <TableCell className="font-mono text-green-500">{formatCurrency(bet.win_amount || 0)}</TableCell>
                  <TableCell>
                    <Badge variant={bet.status === 'won' ? 'default' : bet.status === 'lost' ? 'destructive' : 'secondary'}>
                      {bet.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{bet.bet_at ? new Date(bet.bet_at).toLocaleDateString() : '-'}</TableCell>
                  <TableCell className="text-right">
                    {bet.status === 'pending' && (
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleSettle(bet.id, 'won')} disabled={loading === bet.id}>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleSettle(bet.id, 'lost')} disabled={loading === bet.id}>
                          <XCircle className="w-4 h-4 text-red-500" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleCancel(bet.id)} disabled={loading === bet.id}>
                          <Ban className="w-4 h-4 text-yellow-500" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Support Tickets Section
function SupportTicketsSection({ tickets, onRefresh, refreshing }: any) {
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('open');

  const handleReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;
    setLoading(true);
    try {
      await apiClient.replyToTicket(selectedTicket.id, replyMessage);
      toast.success('Reply sent!');
      setReplyMessage('');
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reply');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async (ticketId: string) => {
    try {
      await apiClient.closeTicket(ticketId);
      toast.success('Ticket closed');
      setSelectedTicket(null);
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to close ticket');
    }
  };

  const filteredTickets = tickets.filter((t: any) => filter === 'all' || t.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Support Tickets</h1>
          <p className="text-muted-foreground">Manage user support requests</p>
        </div>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={onRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Tickets ({filteredTickets.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {filteredTickets.map((ticket: any) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${selectedTicket?.id === ticket.id ? 'bg-muted' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium truncate">{ticket.subject}</span>
                    <Badge variant={ticket.status === 'open' ? 'default' : ticket.status === 'resolved' ? 'outline' : 'secondary'} className="ml-2 shrink-0">
                      {ticket.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{ticket.user?.username || 'Unknown'}</p>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          {selectedTicket ? (
            <>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedTicket.subject}</CardTitle>
                    <CardDescription>From: {selectedTicket.user?.username || 'Unknown'} | {selectedTicket.category}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {selectedTicket.status !== 'closed' && (
                      <Button variant="outline" size="sm" onClick={() => handleClose(selectedTicket.id)}>
                        Close Ticket
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] mb-4 p-4 border rounded-lg">
                  {(selectedTicket.messages || []).map((msg: any, idx: number) => (
                    <div key={idx} className={`mb-4 ${msg.is_staff ? 'text-right' : ''}`}>
                      <div className={`inline-block p-3 rounded-lg max-w-[80%] ${msg.is_staff ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs opacity-70 mt-1">{msg.username} - {new Date(msg.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
                {selectedTicket.status !== 'closed' && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your reply..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                    />
                    <Button onClick={handleReply} disabled={loading || !replyMessage.trim()}>
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-[500px] text-muted-foreground">
              Select a ticket to view details
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}

// System Config Section
function SystemConfigSection({ config, onRefresh, refreshing }: any) {
  const [loading, setLoading] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleSave = async (item: any) => {
    setLoading(true);
    try {
      await apiClient.updateSystemConfig(item.key, editValue, item.value_type || 'string', item.category || 'general', item.description);
      toast.success('Config updated!');
      setEditingKey(null);
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  // Group config by category
  const groupedConfig = config.reduce((acc: any, item: any) => {
    const cat = item.category || 'general';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">System Configuration</h1>
          <p className="text-muted-foreground">Manage platform settings</p>
        </div>
        <Button variant="outline" onClick={onRefresh} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedConfig).map(([category, items]: [string, any]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="capitalize">{category.replace(/_/g, ' ')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item: any) => (
                  <div key={item.key} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.key}</p>
                      <p className="text-sm text-muted-foreground">{item.description || 'No description'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {editingKey === item.key ? (
                        <>
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-48"
                          />
                          <Button size="sm" onClick={() => handleSave(item)} disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingKey(null)}>Cancel</Button>
                        </>
                      ) : (
                        <>
                          <Badge variant="outline" className="font-mono">{item.value}</Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => { setEditingKey(item.key); setEditValue(item.value); }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        {Object.keys(groupedConfig).length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No configuration items found
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
