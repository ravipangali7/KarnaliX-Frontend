import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '@/components/shared/DataTable';
import { FormModal } from '@/components/shared/FormModal';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Calendar } from 'lucide-react';
import apiClient from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface Transaction {
  id: string;
  user: { username: string };
  type: string;
  amount: string;
  balance_before: string;
  balance_after: string;
  description: string;
  created_at: string;
}

// Account Statement Component
export const AccountStatement: React.FC = () => {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      const response = await apiClient.getPowerhouseAccountStatement(params);
      setData(response.results || response.transactions || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch account statement', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilter = () => {
    fetchData();
  };

  const typeColors: Record<string, string> = {
    DEPOSIT: 'text-green-400',
    WITHDRAWAL: 'text-red-400',
    BET: 'text-orange-400',
    WIN: 'text-green-400',
    BONUS: 'text-purple-400',
    ADJUSTMENT: 'text-blue-400',
  };

  const columns: Column<Transaction>[] = [
    { 
      key: 'created_at', 
      header: 'Date',
      sortable: true,
      render: (item) => new Date(item.created_at).toLocaleString()
    },
    { 
      key: 'user', 
      header: 'User',
      render: (item) => <span className="text-blue-400">{item.user?.username}</span>
    },
    { 
      key: 'type', 
      header: 'Type',
      render: (item) => <span className={typeColors[item.type] || 'text-gray-400'}>{item.type}</span>
    },
    { 
      key: 'amount', 
      header: 'Amount',
      sortable: true,
      render: (item) => {
        const isCredit = ['DEPOSIT', 'WIN', 'BONUS'].includes(item.type);
        return (
          <span className={isCredit ? 'text-green-400' : 'text-red-400'}>
            {isCredit ? '+' : '-'}₹{item.amount}
          </span>
        );
      }
    },
    { key: 'balance_before', header: 'Before', render: (item) => `₹${item.balance_before}` },
    { key: 'balance_after', header: 'After', render: (item) => `₹${item.balance_after}` },
    { key: 'description', header: 'Description' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Account Statement</h1>

      {/* Filters */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="pt-6">
          <div className="flex items-end gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">From Date</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">To Date</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <Button onClick={handleFilter} className="bg-yellow-600 hover:bg-yellow-700">
              <Calendar className="h-4 w-4 mr-2" /> Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        searchKeys={['user.username', 'description']}
        searchPlaceholder="Search by username or description..."
      />
    </div>
  );
};

// Bonus Statement Component
interface Bonus {
  id: string;
  user: { id: string; username: string };
  amount: string;
  bonus_type: string;
  rule?: { name: string };
  status: string;
  expires_at?: string;
  created_at: string;
  granted_by?: { username: string };
}

interface User {
  id: string;
  username: string;
}

export const BonusStatement: React.FC = () => {
  const [data, setData] = useState<Bonus[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [grantOpen, setGrantOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    user_id: '',
    amount: '',
    bonus_type: 'MANUAL',
    description: '',
  });
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bonusRes, usersRes] = await Promise.all([
        apiClient.getPowerhouseBonusStatement(),
        apiClient.getPowerhouseUsers(),
      ]);
      setData(bonusRes.results || bonusRes.bonuses || []);
      setUsers(usersRes.results || usersRes || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch bonus statement', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGrant = async () => {
    setActionLoading(true);
    try {
      await apiClient.grantPowerhouseBonus(formData);
      toast({ title: 'Success', description: 'Bonus granted successfully' });
      setGrantOpen(false);
      setFormData({ user_id: '', amount: '', bonus_type: 'MANUAL', description: '' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to grant bonus', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const columns: Column<Bonus>[] = [
    { 
      key: 'created_at', 
      header: 'Date',
      sortable: true,
      render: (item) => new Date(item.created_at).toLocaleDateString()
    },
    { 
      key: 'user', 
      header: 'User',
      render: (item) => <span className="text-blue-400">{item.user?.username}</span>
    },
    { 
      key: 'amount', 
      header: 'Amount',
      sortable: true,
      render: (item) => <span className="text-green-400">₹{item.amount}</span>
    },
    { key: 'bonus_type', header: 'Type', render: (item) => <StatusBadge status={item.bonus_type} /> },
    { key: 'rule', header: 'Rule', render: (item) => item.rule?.name || '-' },
    { key: 'status', header: 'Status', render: (item) => <StatusBadge status={item.status} /> },
    { 
      key: 'granted_by', 
      header: 'Granted By',
      render: (item) => item.granted_by?.username || '-'
    },
    { 
      key: 'expires_at', 
      header: 'Expires',
      render: (item) => item.expires_at ? new Date(item.expires_at).toLocaleDateString() : '-'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Bonus Statement</h1>
        <Button onClick={() => setGrantOpen(true)} className="bg-purple-600 hover:bg-purple-700">
          <Gift className="h-4 w-4 mr-2" /> Grant Bonus
        </Button>
      </div>

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        searchKeys={['user.username']}
        searchPlaceholder="Search by username..."
      />

      {/* Grant Bonus Modal */}
      <FormModal
        open={grantOpen}
        onOpenChange={setGrantOpen}
        title="Grant Bonus"
        description="Grant a bonus to a user"
      >
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-gray-300">User</Label>
            <Select value={formData.user_id} onValueChange={(v) => setFormData({ ...formData, user_id: v })}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600 max-h-[200px]">
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id} className="text-white hover:bg-gray-600">
                    {u.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Amount</Label>
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="Enter bonus amount"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Bonus Type</Label>
            <Select value={formData.bonus_type} onValueChange={(v) => setFormData({ ...formData, bonus_type: v })}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="MANUAL" className="text-white hover:bg-gray-600">Manual</SelectItem>
                <SelectItem value="WELCOME" className="text-white hover:bg-gray-600">Welcome</SelectItem>
                <SelectItem value="DEPOSIT" className="text-white hover:bg-gray-600">Deposit</SelectItem>
                <SelectItem value="CASHBACK" className="text-white hover:bg-gray-600">Cashback</SelectItem>
                <SelectItem value="REFERRAL" className="text-white hover:bg-gray-600">Referral</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Description</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="Enter description (optional)"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setGrantOpen(false)}
              className="flex-1 border-gray-600 text-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleGrant}
              disabled={actionLoading || !formData.user_id || !formData.amount}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {actionLoading ? 'Granting...' : 'Grant Bonus'}
            </Button>
          </div>
        </div>
      </FormModal>
    </div>
  );
};

export default AccountStatement;
