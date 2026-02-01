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
  Shield,
  Users,
  Wallet,
  ArrowLeft,
  RefreshCw,
  Coins,
  UserPlus,
  TrendingUp,
  FileText,
  Ban,
  CheckCircle,
  Settings,
  ArrowUpDown,
  IdCard,
  Dices,
  DollarSign,
  XCircle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Shield },
  { id: 'masters', label: 'Master Management', icon: Users },
  { id: 'transfer', label: 'Coin Transfer', icon: Coins },
  { id: 'kyc', label: 'KYC Management', icon: IdCard },
  { id: 'bets', label: 'Bet Management', icon: Dices },
  { id: 'deposits', label: 'Deposits', icon: DollarSign },
  { id: 'withdrawals', label: 'Withdrawal Approvals', icon: Wallet },
  { id: 'reports', label: 'Reports', icon: FileText },
];

export default function SuperAdminPanel() {
  const { user, logout, isSuperAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState<any>(null);
  const [masters, setMasters] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [reports, setReports] = useState<any>(null);
  const [kycRequests, setKycRequests] = useState<any[]>([]);
  const [bets, setBets] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<any[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!isSuperAdmin) {
      navigate('/login');
      return;
    }
    loadDashboardData();
  }, [isSuperAdmin, navigate, authLoading]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, mastersData, usersData] = await Promise.all([
        apiClient.getSuperAdminStats().catch(() => null),
        apiClient.getSuperAdminMasters().catch(() => []),
        apiClient.getUsers().catch(() => []),
      ]);

      if (statsData) setStats(statsData);
      setMasters(mastersData);
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
        case 'masters':
          const mastersData = await apiClient.getSuperAdminMasters();
          setMasters(mastersData);
          break;
        case 'withdrawals':
          const withdrawalsData = await apiClient.getWithdrawals({ status: 'pending' });
          setWithdrawals(withdrawalsData);
          break;
        case 'reports':
          const reportsData = await apiClient.getSuperAdminReports();
          setReports(reportsData);
          break;
        case 'kyc':
          const kycData = await apiClient.getAllKYC();
          setKycRequests(kycData || []);
          break;
        case 'bets':
          const betsData = await apiClient.getAllBets();
          setBets(betsData || []);
          break;
        case 'deposits':
          const depositsData = await apiClient.getDeposits();
          setDeposits(depositsData || []);
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading SuperAdmin panel...</p>
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
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">SuperAdmin</h2>
              <p className="text-xs text-muted-foreground">Platform Management</p>
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
                      ? 'bg-blue-500 text-white'
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
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.username}</p>
              <p className="text-xs text-blue-500">SuperAdmin</p>
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
              masters={masters}
              onRefresh={loadDashboardData}
              refreshing={refreshing}
              formatCurrency={formatCurrency}
            />
          )}

          {activeSection === 'masters' && (
            <MasterManagementSection
              masters={masters}
              onRefresh={() => loadSectionData('masters')}
              refreshing={refreshing}
              formatCurrency={formatCurrency}
            />
          )}

          {activeSection === 'transfer' && (
            <TransferSection
              users={allUsers}
              onRefresh={loadDashboardData}
              formatCurrency={formatCurrency}
            />
          )}

          {activeSection === 'reports' && (
            <ReportsSection
              reports={reports}
              onRefresh={() => loadSectionData('reports')}
              refreshing={refreshing}
              formatCurrency={formatCurrency}
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

          {activeSection === 'deposits' && (
            <DepositsManagementSection
              deposits={deposits}
              onRefresh={() => loadSectionData('deposits')}
              refreshing={refreshing}
              formatCurrency={formatCurrency}
            />
          )}

          {activeSection === 'withdrawals' && (
            <WithdrawalApprovalsSection
              withdrawals={withdrawals}
              onRefresh={() => loadSectionData('withdrawals')}
              refreshing={refreshing}
              formatCurrency={formatCurrency}
            />
          )}
        </div>
      </main>
    </div>
  );
}

function DashboardSection({ stats, masters, onRefresh, refreshing, formatCurrency }: any) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">SuperAdmin Dashboard</h1>
          <p className="text-muted-foreground">Platform management overview</p>
        </div>
        <Button variant="outline" onClick={onRefresh} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Masters</p>
                <p className="text-2xl font-bold">{stats?.masters?.total || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {stats?.masters?.active || 0} active
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-green-500" />
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

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">User Balance</p>
                <p className="text-2xl font-bold">{formatCurrency(stats?.finances?.total_user_balance)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Withdrawals</p>
                <p className="text-2xl font-bold">{stats?.finances?.pending_withdrawals_count || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(stats?.finances?.pending_withdrawals_amount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Masters Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Transfer Limit</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {masters.slice(0, 5).map((m: any) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.username}</TableCell>
                  <TableCell>{formatCurrency(m.wallet_balance)}</TableCell>
                  <TableCell>{m.transfer_limit ? formatCurrency(m.transfer_limit) : 'Unlimited'}</TableCell>
                  <TableCell>{m.users_count || 0}</TableCell>
                  <TableCell>
                    <Badge variant={m.status === 'active' ? 'default' : 'destructive'}>
                      {m.status}
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

function MasterManagementSection({ masters, onRefresh, refreshing, formatCurrency }: any) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showLimitsDialog, setShowLimitsDialog] = useState(false);
  const [selectedMaster, setSelectedMaster] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [newMaster, setNewMaster] = useState({
    email: '', username: '', password: '', full_name: '', transfer_limit: ''
  });
  const [newLimit, setNewLimit] = useState('');

  const handleCreateMaster = async () => {
    setLoading(true);
    try {
      await apiClient.createMaster({
        ...newMaster,
        transfer_limit: newMaster.transfer_limit ? Number(newMaster.transfer_limit) : undefined,
      });
      toast.success('Master created successfully!');
      setShowCreateDialog(false);
      setNewMaster({ email: '', username: '', password: '', full_name: '', transfer_limit: '' });
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create Master');
    } finally {
      setLoading(false);
    }
  };

  const handleSetLimits = async () => {
    if (!selectedMaster) return;
    setLoading(true);
    try {
      await apiClient.setMasterLimits(selectedMaster.id, newLimit ? Number(newLimit) : null);
      toast.success('Limits updated successfully!');
      setShowLimitsDialog(false);
      setNewLimit('');
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update limits');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (masterId: string, username: string, currentlySuspended: boolean) => {
    try {
      await apiClient.suspendMaster(masterId, !currentlySuspended);
      toast.success(`${username} ${currentlySuspended ? 'activated' : 'suspended'}`);
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Master Management</h1>
          <p className="text-muted-foreground">Create and manage Master accounts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-500 hover:bg-blue-600">
                <UserPlus className="w-4 h-4 mr-2" />
                Create Master
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Master</DialogTitle>
                <DialogDescription>Add a new Master to manage users</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={newMaster.email}
                      onChange={(e) => setNewMaster({ ...newMaster, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Username</Label>
                    <Input
                      value={newMaster.username}
                      onChange={(e) => setNewMaster({ ...newMaster, username: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Password</Label>
                    <Input
                      type="password"
                      value={newMaster.password}
                      onChange={(e) => setNewMaster({ ...newMaster, password: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Full Name</Label>
                    <Input
                      value={newMaster.full_name}
                      onChange={(e) => setNewMaster({ ...newMaster, full_name: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Transfer Limit (Optional)</Label>
                  <Input
                    type="number"
                    value={newMaster.transfer_limit}
                    onChange={(e) => setNewMaster({ ...newMaster, transfer_limit: e.target.value })}
                    placeholder="Leave empty for unlimited"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                <Button onClick={handleCreateMaster} disabled={loading} className="bg-blue-500 hover:bg-blue-600">
                  {loading ? 'Creating...' : 'Create Master'}
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
                <TableHead>Balance</TableHead>
                <TableHead>Transfer Limit</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {masters.map((m: any) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.username}</TableCell>
                  <TableCell>{m.email}</TableCell>
                  <TableCell>{formatCurrency(m.wallet_balance)}</TableCell>
                  <TableCell>{m.transfer_limit ? formatCurrency(m.transfer_limit) : 'Unlimited'}</TableCell>
                  <TableCell>{m.users_count || 0}</TableCell>
                  <TableCell>
                    <Badge variant={m.status === 'active' ? 'default' : 'destructive'}>
                      {m.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedMaster(m);
                          setNewLimit(m.transfer_limit || '');
                          setShowLimitsDialog(true);
                        }}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSuspend(m.id, m.username, m.status === 'suspended')}
                      >
                        {m.status === 'suspended' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Ban className="w-4 h-4 text-red-500" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Limits Dialog */}
      <Dialog open={showLimitsDialog} onOpenChange={setShowLimitsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Transfer Limit</DialogTitle>
            <DialogDescription>
              Set transfer limit for {selectedMaster?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Transfer Limit</Label>
            <Input
              type="number"
              value={newLimit}
              onChange={(e) => setNewLimit(e.target.value)}
              placeholder="Leave empty for unlimited"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLimitsDialog(false)}>Cancel</Button>
            <Button onClick={handleSetLimits} disabled={loading}>
              {loading ? 'Saving...' : 'Save Limits'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TransferSection({ users, onRefresh, formatCurrency }: any) {
  const [loading, setLoading] = useState(false);
  const [transferForm, setTransferForm] = useState({ to_user_id: '', amount: '', description: '' });

  const handleTransfer = async () => {
    setLoading(true);
    try {
      await apiClient.superAdminTransfer(
        transferForm.to_user_id,
        Number(transferForm.amount),
        transferForm.description
      );
      toast.success(`${transferForm.amount} coins transferred successfully!`);
      setTransferForm({ to_user_id: '', amount: '', description: '' });
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to transfer coins');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Coin Transfer</h1>
          <p className="text-muted-foreground">Transfer coins to users within your limit</p>
        </div>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="w-5 h-5 text-blue-500" />
            Transfer Coins
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Select Recipient</Label>
            <Select value={transferForm.to_user_id} onValueChange={(v) => setTransferForm({ ...transferForm, to_user_id: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((u: any) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.username} ({u.role})
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
              value={transferForm.amount}
              onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
              placeholder="Enter amount"
            />
          </div>
          <div>
            <Label>Description (Optional)</Label>
            <Input
              value={transferForm.description}
              onChange={(e) => setTransferForm({ ...transferForm, description: e.target.value })}
              placeholder="e.g., Initial allocation"
            />
          </div>
          <Button
            onClick={handleTransfer}
            disabled={loading || !transferForm.to_user_id || !transferForm.amount}
            className="w-full bg-blue-500 hover:bg-blue-600"
          >
            {loading ? 'Transferring...' : 'Transfer Coins'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function ReportsSection({ reports, onRefresh, refreshing, formatCurrency }: any) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Platform analytics and reports</p>
        </div>
        <Button variant="outline" onClick={onRefresh} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Deposits</CardTitle>
            <CardDescription>
              {reports?.period?.start_date} - {reports?.period?.end_date}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-bold">{formatCurrency(reports?.deposits?.total_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Approved</span>
                <span className="font-bold text-green-500">{formatCurrency(reports?.deposits?.approved_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Count</span>
                <span>{reports?.deposits?.count || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Withdrawals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-bold">{formatCurrency(reports?.withdrawals?.total_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Approved</span>
                <span className="font-bold text-red-500">{formatCurrency(reports?.withdrawals?.approved_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Count</span>
                <span>{reports?.withdrawals?.count || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Volume</span>
                <span className="font-bold">{formatCurrency(reports?.bets?.total_volume)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Wins</span>
                <span className="font-bold">{formatCurrency(reports?.bets?.total_wins)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Won / Lost</span>
                <span>{reports?.bets?.won_count || 0} / {reports?.bets?.lost_count || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function WithdrawalApprovalsSection({ withdrawals, onRefresh, refreshing, formatCurrency }: any) {
  const handleApprove = async (withdrawalId: string) => {
    try {
      await apiClient.approveWithdrawal(withdrawalId);
      toast.success('Withdrawal approved!');
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve withdrawal');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Withdrawal Approvals</h1>
          <p className="text-muted-foreground">Pending withdrawal requests</p>
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
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.map((w: any) => (
                <TableRow key={w.id}>
                  <TableCell>{w.user?.username || w.user_id}</TableCell>
                  <TableCell className="font-bold">{formatCurrency(w.amount)}</TableCell>
                  <TableCell>{w.payment_method?.name || w.payment_method}</TableCell>
                  <TableCell className="font-mono text-xs">{w.account_number || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{w.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {w.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleApprove(w.id)}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {withdrawals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No pending withdrawals
                  </TableCell>
                </TableRow>
              )}
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
                          {loading === kyc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 text-green-500" />}
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
          <p className="text-muted-foreground">Settle and manage bets</p>
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

// Deposits Management Section
function DepositsManagementSection({ deposits, onRefresh, refreshing, formatCurrency }: any) {
  const [loading, setLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState('pending');

  const handleApprove = async (depositId: string) => {
    setLoading(depositId);
    try {
      await apiClient.approveDeposit(depositId);
      toast.success('Deposit approved!');
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve');
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async (depositId: string) => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    setLoading(depositId);
    try {
      await apiClient.rejectDeposit(depositId, reason);
      toast.success('Deposit rejected');
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject');
    } finally {
      setLoading(null);
    }
  };

  const filteredDeposits = deposits.filter((d: any) => filter === 'all' || d.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Deposits Management</h1>
          <p className="text-muted-foreground">Review and approve deposit requests</p>
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
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeposits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No deposits found</TableCell>
                </TableRow>
              ) : filteredDeposits.map((deposit: any) => (
                <TableRow key={deposit.id}>
                  <TableCell className="font-medium">{deposit.user?.username || deposit.username || 'Unknown'}</TableCell>
                  <TableCell className="font-mono font-bold">{formatCurrency(deposit.amount)}</TableCell>
                  <TableCell>{deposit.payment_method?.name || deposit.payment_method || '-'}</TableCell>
                  <TableCell className="font-mono text-xs">{deposit.transaction_ref || deposit.reference || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={deposit.status === 'approved' ? 'default' : deposit.status === 'rejected' ? 'destructive' : 'secondary'}>
                      {deposit.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{deposit.created_at ? new Date(deposit.created_at).toLocaleDateString() : '-'}</TableCell>
                  <TableCell className="text-right">
                    {deposit.status === 'pending' && (
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleApprove(deposit.id)} disabled={loading === deposit.id}>
                          {loading === deposit.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 text-green-500" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleReject(deposit.id)} disabled={loading === deposit.id}>
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
