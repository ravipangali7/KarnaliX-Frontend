import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '@/components/shared/DataTable';
import { FormModal } from '@/components/shared/FormModal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, UserX, UserCheck, Wallet } from 'lucide-react';
import apiClient from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  status: string;
  wallet_balance: string;
  parent?: { id: string; username: string };
  created_at: string;
}

interface MasterUser {
  id: string;
  username: string;
}

export const ListUsers: React.FC = () => {
  const [data, setData] = useState<User[]>([]);
  const [masters, setMasters] = useState<MasterUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [balanceModalOpen, setBalanceModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<'suspend' | 'activate'>('suspend');
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    parent_id: '',
  });
  const [balanceData, setBalanceData] = useState({
    amount: '',
    type: 'add',
    remarks: '',
  });
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, mastersRes] = await Promise.all([
        apiClient.getPowerhouseUsers(),
        apiClient.getPowerhouseMasters(),
      ]);
      setData(usersRes.results || usersRes || []);
      setMasters(mastersRes.results || mastersRes || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async () => {
    setActionLoading(true);
    try {
      await apiClient.createPowerhouseUser(formData);
      toast({ title: 'Success', description: 'User created successfully' });
      setModalOpen(false);
      setFormData({ username: '', email: '', phone: '', password: '', parent_id: '' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to create user', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      if (actionType === 'suspend') {
        await apiClient.suspendPowerhouseUser(selectedUser.id);
        toast({ title: 'Success', description: 'User suspended successfully' });
      } else {
        await apiClient.activatePowerhouseUser(selectedUser.id);
        toast({ title: 'Success', description: 'User activated successfully' });
      }
      setConfirmOpen(false);
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Action failed', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdjustBalance = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await apiClient.adjustPowerhouseUserBalance(selectedUser.id, {
        amount: parseFloat(balanceData.amount),
        type: balanceData.type,
        remarks: balanceData.remarks,
      });
      toast({ title: 'Success', description: 'Balance adjusted successfully' });
      setBalanceModalOpen(false);
      setBalanceData({ amount: '', type: 'add', remarks: '' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to adjust balance', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const columns: Column<User>[] = [
    { key: 'username', header: 'Username', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'phone', header: 'Phone' },
    { 
      key: 'parent', 
      header: 'Master',
      render: (item) => <span className="text-green-400">{item.parent?.username || '-'}</span>
    },
    { 
      key: 'wallet_balance', 
      header: 'Balance', 
      sortable: true,
      render: (item) => <span className="text-green-400">₹{item.wallet_balance}</span>
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-blue-600 text-blue-400 hover:bg-blue-600/20"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedUser(item);
              setBalanceModalOpen(true);
            }}
          >
            <Wallet className="h-4 w-4" />
          </Button>
          {item.status === 'ACTIVE' ? (
            <Button
              size="sm"
              variant="outline"
              className="border-red-600 text-red-400 hover:bg-red-600/20"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedUser(item);
                setActionType('suspend');
                setConfirmOpen(true);
              }}
            >
              <UserX className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="border-green-600 text-green-400 hover:bg-green-600/20"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedUser(item);
                setActionType('activate');
                setConfirmOpen(true);
              }}
            >
              <UserCheck className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">List of Users</h1>
        <Button onClick={() => setModalOpen(true)} className="bg-yellow-600 hover:bg-yellow-700">
          <Plus className="h-4 w-4 mr-2" /> Add User
        </Button>
      </div>

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        searchKeys={['username', 'email', 'phone']}
        searchPlaceholder="Search by username, email, or phone..."
      />

      {/* Create Modal */}
      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Create User"
        description="Add a new user to the system"
      >
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="parent" className="text-gray-300">Parent Master</Label>
            <Select value={formData.parent_id} onValueChange={(v) => setFormData({ ...formData, parent_id: v })}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select master user" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {masters.map((m) => (
                  <SelectItem key={m.id} value={m.id} className="text-white hover:bg-gray-600">
                    {m.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="username" className="text-gray-300">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="Enter username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="Enter email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-gray-300">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="Enter phone number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="Enter password"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="border-gray-600 text-gray-300">
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={actionLoading} className="bg-yellow-600 hover:bg-yellow-700">
              {actionLoading ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </div>
      </FormModal>

      {/* Adjust Balance Modal */}
      <FormModal
        open={balanceModalOpen}
        onOpenChange={setBalanceModalOpen}
        title="Adjust Balance"
        description={`Adjust wallet balance for ${selectedUser?.username}`}
      >
        <div className="space-y-4 py-4">
          <div className="p-4 bg-gray-700 rounded-lg">
            <p className="text-gray-400 text-sm">Current Balance</p>
            <p className="text-2xl font-bold text-green-400">₹{selectedUser?.wallet_balance}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Type</Label>
            <Select value={balanceData.type} onValueChange={(v) => setBalanceData({ ...balanceData, type: v })}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="add" className="text-white hover:bg-gray-600">Add (Credit)</SelectItem>
                <SelectItem value="subtract" className="text-white hover:bg-gray-600">Subtract (Debit)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Amount</Label>
            <Input
              type="number"
              value={balanceData.amount}
              onChange={(e) => setBalanceData({ ...balanceData, amount: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="Enter amount"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Remarks</Label>
            <Input
              value={balanceData.remarks}
              onChange={(e) => setBalanceData({ ...balanceData, remarks: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="Enter remarks"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setBalanceModalOpen(false)} className="border-gray-600 text-gray-300">
              Cancel
            </Button>
            <Button onClick={handleAdjustBalance} disabled={actionLoading} className="bg-blue-600 hover:bg-blue-700">
              {actionLoading ? 'Processing...' : 'Adjust Balance'}
            </Button>
          </div>
        </div>
      </FormModal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={actionType === 'suspend' ? 'Suspend User' : 'Activate User'}
        description={`Are you sure you want to ${actionType} ${selectedUser?.username}?`}
        confirmText={actionType === 'suspend' ? 'Suspend' : 'Activate'}
        variant={actionType === 'suspend' ? 'destructive' : 'default'}
        loading={actionLoading}
        onConfirm={handleAction}
      />
    </div>
  );
};

export default ListUsers;
