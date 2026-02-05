import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '@/components/shared/DataTable';
import { FormModal } from '@/components/shared/FormModal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, UserX, UserCheck } from 'lucide-react';
import apiClient from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface MasterUser {
  id: string;
  username: string;
  email: string;
  phone: string;
  status: string;
  wallet_balance: string;
  children_count: number;
  parent?: { id: string; username: string };
  created_at: string;
}

interface SuperUser {
  id: string;
  username: string;
}

export const ListMasters: React.FC = () => {
  const [data, setData] = useState<MasterUser[]>([]);
  const [supers, setSupers] = useState<SuperUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<MasterUser | null>(null);
  const [actionType, setActionType] = useState<'suspend' | 'activate'>('suspend');
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    parent_id: '',
  });
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mastersRes, supersRes] = await Promise.all([
        apiClient.getPowerhouseMasters(),
        apiClient.getPowerhouseSupers(),
      ]);
      setData(mastersRes.results || mastersRes || []);
      setSupers(supersRes.results || supersRes || []);
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
      await apiClient.createPowerhouseMaster(formData);
      toast({ title: 'Success', description: 'Master user created successfully' });
      setModalOpen(false);
      setFormData({ username: '', email: '', phone: '', password: '', parent_id: '' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to create master user', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      if (actionType === 'suspend') {
        await apiClient.suspendPowerhouseMaster(selectedUser.id);
        toast({ title: 'Success', description: 'User suspended successfully' });
      } else {
        await apiClient.activatePowerhouseMaster(selectedUser.id);
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

  const columns: Column<MasterUser>[] = [
    { key: 'username', header: 'Username', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'phone', header: 'Phone' },
    { 
      key: 'parent', 
      header: 'Super',
      render: (item) => <span className="text-blue-400">{item.parent?.username || '-'}</span>
    },
    { 
      key: 'wallet_balance', 
      header: 'Balance', 
      sortable: true,
      render: (item) => <span className="text-green-400">₹{item.wallet_balance}</span>
    },
    { 
      key: 'children_count', 
      header: 'Users',
      render: (item) => <span>{item.children_count || 0}</span>
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
              <UserX className="h-4 w-4 mr-1" /> Suspend
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
              <UserCheck className="h-4 w-4 mr-1" /> Activate
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">List of Master Users</h1>
        <Button onClick={() => setModalOpen(true)} className="bg-yellow-600 hover:bg-yellow-700">
          <Plus className="h-4 w-4 mr-2" /> Add Master
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
        title="Create Master User"
        description="Add a new master user to the system"
      >
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="parent" className="text-gray-300">Parent Super</Label>
            <Select value={formData.parent_id} onValueChange={(v) => setFormData({ ...formData, parent_id: v })}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select super user" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {supers.map((s) => (
                  <SelectItem key={s.id} value={s.id} className="text-white hover:bg-gray-600">
                    {s.username}
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
              {actionLoading ? 'Creating...' : 'Create Master'}
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

export default ListMasters;
