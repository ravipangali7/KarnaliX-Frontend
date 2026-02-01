import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Crown,
  Users,
  Wallet,
  ArrowLeft,
  RefreshCw,
  UserPlus,
  TrendingUp,
  Ban,
  CheckCircle,
  Settings,
  ArrowDownToLine,
  ArrowUpFromLine,
  Key,
  History,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Crown },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'deposits', label: 'Deposit for Users', icon: ArrowDownToLine },
  { id: 'withdrawals', label: 'Withdraw for Users', icon: ArrowUpFromLine },
];

export default function MasterPanel() {
  const { user, logout, isMaster, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!isMaster) {
      navigate('/login');
      return;
    }
    loadDashboardData();
  }, [isMaster, navigate, authLoading]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData] = await Promise.all([
        apiClient.getMasterStats().catch(() => null),
        apiClient.getMasterUsers().catch(() => []),
      ]);

      if (statsData) setStats(statsData);
      setUsers(usersData);
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
      if (section === 'users') {
        const usersData = await apiClient.getMasterUsers();
        setUsers(usersData);
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
          <p className="text-muted-foreground">Loading Master panel...</p>
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
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Master Panel</h2>
              <p className="text-xs text-muted-foreground">Agent/Operator</p>
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
                      ? 'bg-green-500 text-white'
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
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <Crown className="w-4 h-4 text-green-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.username}</p>
              <p className="text-xs text-green-500">Master</p>
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
              users={users}
              onRefresh={loadDashboardData}
              refreshing={refreshing}
              formatCurrency={formatCurrency}
            />
          )}

          {activeSection === 'users' && (
            <UserManagementSection
              users={users}
              onRefresh={() => loadSectionData('users')}
              refreshing={refreshing}
              formatCurrency={formatCurrency}
            />
          )}

          {activeSection === 'deposits' && (
            <DepositSection
              users={users}
              onRefresh={loadDashboardData}
              formatCurrency={formatCurrency}
            />
          )}

          {activeSection === 'withdrawals' && (
            <WithdrawalSection
              users={users}
              onRefresh={loadDashboardData}
              formatCurrency={formatCurrency}
            />
          )}
        </div>
      </main>
    </div>
  );
}

function DashboardSection({ stats, users, onRefresh, refreshing, formatCurrency }: any) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Master Dashboard</h1>
          <p className="text-muted-foreground">Manage your users and their activities</p>
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
                <p className="text-sm text-muted-foreground">Total User Balance</p>
                <p className="text-2xl font-bold">{formatCurrency(stats?.finances?.total_user_balance)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today's Bets</p>
                <p className="text-2xl font-bold">{formatCurrency(stats?.today?.bet_volume)}</p>
                <p className="text-xs text-muted-foreground">{stats?.today?.bet_count || 0} bets</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <ArrowUpFromLine className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today's Activity</p>
                <p className="text-lg font-bold text-green-500">+{formatCurrency(stats?.today?.deposits)}</p>
                <p className="text-sm font-bold text-red-500">-{formatCurrency(stats?.today?.withdrawals)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Betting Limit</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.slice(0, 5).map((u: any) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.username}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{formatCurrency(u.wallet_balance)}</TableCell>
                  <TableCell>{u.betting_limit ? formatCurrency(u.betting_limit) : 'No limit'}</TableCell>
                  <TableCell>
                    <Badge variant={u.status === 'active' ? 'default' : 'destructive'}>
                      {u.status}
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

function UserManagementSection({ users, onRefresh, refreshing, formatCurrency }: any) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showLimitsDialog, setShowLimitsDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showBetsDialog, setShowBetsDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newUser, setNewUser] = useState({
    email: '', username: '', password: '', full_name: '', betting_limit: ''
  });
  const [newLimit, setNewLimit] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [userBets, setUserBets] = useState<any[]>([]);

  const filteredUsers = users.filter((u: any) =>
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateUser = async () => {
    setLoading(true);
    try {
      await apiClient.createUserAccount({
        ...newUser,
        betting_limit: newUser.betting_limit ? Number(newUser.betting_limit) : undefined,
      });
      toast.success('User created successfully!');
      setShowCreateDialog(false);
      setNewUser({ email: '', username: '', password: '', full_name: '', betting_limit: '' });
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleSetBettingLimit = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      await apiClient.setUserBettingLimit(selectedUser.id, newLimit ? Number(newLimit) : null);
      toast.success('Betting limit updated!');
      setShowLimitsDialog(false);
      setNewLimit('');
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update limit');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) return;
    setLoading(true);
    try {
      await apiClient.resetUserPassword(selectedUser.id, newPassword);
      toast.success('Password reset successfully!');
      setShowPasswordDialog(false);
      setNewPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (userId: string, username: string, currentlySuspended: boolean) => {
    try {
      await apiClient.masterSuspendUser(userId, !currentlySuspended);
      toast.success(`${username} ${currentlySuspended ? 'activated' : 'suspended'}`);
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleViewBets = async (userId: string) => {
    try {
      const data = await apiClient.getUserBetHistory(userId, { limit: 50 });
      setUserBets(data.bets || []);
      setShowBetsDialog(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load bet history');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Create and manage user accounts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-green-500 hover:bg-green-600">
                <UserPlus className="w-4 h-4 mr-2" />
                Create User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>Add a new player to your network</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Username</Label>
                    <Input
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Password</Label>
                    <Input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Full Name</Label>
                    <Input
                      value={newUser.full_name}
                      onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Betting Limit (Optional)</Label>
                  <Input
                    type="number"
                    value={newUser.betting_limit}
                    onChange={(e) => setNewUser({ ...newUser, betting_limit: e.target.value })}
                    placeholder="Leave empty for no limit"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                <Button onClick={handleCreateUser} disabled={loading} className="bg-green-500 hover:bg-green-600">
                  {loading ? 'Creating...' : 'Create User'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Betting Limit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((u: any) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.username}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{formatCurrency(u.wallet_balance)}</TableCell>
                  <TableCell>{u.betting_limit ? formatCurrency(u.betting_limit) : 'No limit'}</TableCell>
                  <TableCell>
                    <Badge variant={u.status === 'active' ? 'default' : 'destructive'}>
                      {u.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(u);
                          handleViewBets(u.id);
                        }}
                        title="View Bets"
                      >
                        <History className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(u);
                          setNewLimit(u.betting_limit || '');
                          setShowLimitsDialog(true);
                        }}
                        title="Set Betting Limit"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(u);
                          setShowPasswordDialog(true);
                        }}
                        title="Reset Password"
                      >
                        <Key className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSuspend(u.id, u.username, u.status === 'suspended')}
                        title={u.status === 'suspended' ? 'Activate' : 'Suspend'}
                      >
                        {u.status === 'suspended' ? (
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

      {/* Betting Limit Dialog */}
      <Dialog open={showLimitsDialog} onOpenChange={setShowLimitsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Betting Limit</DialogTitle>
            <DialogDescription>
              Set betting limit for {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Maximum Bet Amount</Label>
            <Input
              type="number"
              value={newLimit}
              onChange={(e) => setNewLimit(e.target.value)}
              placeholder="Leave empty for no limit"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLimitsDialog(false)}>Cancel</Button>
            <Button onClick={handleSetBettingLimit} disabled={loading}>
              {loading ? 'Saving...' : 'Save Limit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Reset Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Reset password for {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>New Password</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min 6 characters)"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>Cancel</Button>
            <Button onClick={handleResetPassword} disabled={loading || newPassword.length < 6}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bet History Dialog */}
      <Dialog open={showBetsDialog} onOpenChange={setShowBetsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Bet History - {selectedUser?.username}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Game</TableHead>
                  <TableHead>Bet</TableHead>
                  <TableHead>Win</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userBets.map((bet: any) => (
                  <TableRow key={bet.id}>
                    <TableCell>{bet.game_name}</TableCell>
                    <TableCell>{formatCurrency(bet.bet_amount)}</TableCell>
                    <TableCell className={bet.status === 'won' ? 'text-green-500' : ''}>
                      {formatCurrency(bet.win_amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        bet.status === 'won' ? 'default' :
                        bet.status === 'lost' ? 'destructive' : 'secondary'
                      }>
                        {bet.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(bet.bet_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DepositSection({ users, onRefresh, formatCurrency }: any) {
  const [loading, setLoading] = useState(false);
  const [depositForm, setDepositForm] = useState({ user_id: '', amount: '', description: '' });

  const handleDeposit = async () => {
    setLoading(true);
    try {
      await apiClient.depositForUser(
        depositForm.user_id,
        Number(depositForm.amount),
        depositForm.description
      );
      toast.success(`${depositForm.amount} deposited successfully!`);
      setDepositForm({ user_id: '', amount: '', description: '' });
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to deposit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Deposit for Users</h1>
          <p className="text-muted-foreground">Add funds to user wallets</p>
        </div>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowDownToLine className="w-5 h-5 text-green-500" />
            Make Deposit
          </CardTitle>
          <CardDescription>
            Transfer coins from your wallet to a user's wallet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Select User</Label>
            <select
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
              value={depositForm.user_id}
              onChange={(e) => setDepositForm({ ...depositForm, user_id: e.target.value })}
            >
              <option value="">Select a user</option>
              {users.map((u: any) => (
                <option key={u.id} value={u.id}>
                  {u.username} - Balance: {formatCurrency(u.wallet_balance || 0)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Amount</Label>
            <Input
              type="number"
              min="1"
              value={depositForm.amount}
              onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })}
              placeholder="Enter amount"
            />
          </div>
          <div>
            <Label>Description (Optional)</Label>
            <Input
              value={depositForm.description}
              onChange={(e) => setDepositForm({ ...depositForm, description: e.target.value })}
              placeholder="e.g., Initial deposit"
            />
          </div>
          <Button
            onClick={handleDeposit}
            disabled={loading || !depositForm.user_id || !depositForm.amount}
            className="w-full bg-green-500 hover:bg-green-600"
          >
            {loading ? 'Processing...' : 'Deposit'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function WithdrawalSection({ users, onRefresh, formatCurrency }: any) {
  const [loading, setLoading] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({ user_id: '', amount: '', description: '' });

  const handleWithdraw = async () => {
    setLoading(true);
    try {
      await apiClient.withdrawForUser(
        withdrawForm.user_id,
        Number(withdrawForm.amount),
        withdrawForm.description
      );
      toast.success(`${withdrawForm.amount} withdrawn successfully!`);
      setWithdrawForm({ user_id: '', amount: '', description: '' });
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to withdraw');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Withdraw for Users</h1>
          <p className="text-muted-foreground">Withdraw funds from user wallets</p>
        </div>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpFromLine className="w-5 h-5 text-red-500" />
            Make Withdrawal
          </CardTitle>
          <CardDescription>
            Withdraw coins from a user's wallet to your wallet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Select User</Label>
            <select
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
              value={withdrawForm.user_id}
              onChange={(e) => setWithdrawForm({ ...withdrawForm, user_id: e.target.value })}
            >
              <option value="">Select a user</option>
              {users.map((u: any) => (
                <option key={u.id} value={u.id}>
                  {u.username} - Balance: {formatCurrency(u.wallet_balance || 0)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Amount</Label>
            <Input
              type="number"
              min="1"
              value={withdrawForm.amount}
              onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
              placeholder="Enter amount"
            />
          </div>
          <div>
            <Label>Description (Optional)</Label>
            <Input
              value={withdrawForm.description}
              onChange={(e) => setWithdrawForm({ ...withdrawForm, description: e.target.value })}
              placeholder="e.g., Payout"
            />
          </div>
          <Button
            onClick={handleWithdraw}
            disabled={loading || !withdrawForm.user_id || !withdrawForm.amount}
            className="w-full bg-red-500 hover:bg-red-600"
          >
            {loading ? 'Processing...' : 'Withdraw'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
