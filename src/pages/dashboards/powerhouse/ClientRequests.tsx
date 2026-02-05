import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '@/components/shared/DataTable';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, Eye } from 'lucide-react';
import { FormModal } from '@/components/shared/FormModal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import apiClient from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface ClientRequest {
  id: string;
  user: { id: string; username: string };
  type: string;
  amount: string;
  status: string;
  payment_mode?: { name: string; type: string };
  reference_id?: string;
  remarks?: string;
  created_at: string;
}

interface RequestsProps {
  type: 'deposit' | 'withdraw';
}

export const ClientRequests: React.FC<RequestsProps> = ({ type }) => {
  const [data, setData] = useState<ClientRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ClientRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = type === 'deposit' 
        ? await apiClient.getPowerhouseDeposits()
        : await apiClient.getPowerhouseWithdrawals();
      setData(response.results || response || []);
    } catch (error) {
      toast({ title: 'Error', description: `Failed to fetch ${type} requests`, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [type]);

  const handleAction = async () => {
    if (!selectedRequest) return;
    setActionLoading(true);
    try {
      if (actionType === 'approve') {
        await apiClient.approveRequest(selectedRequest.id, undefined, 'powerhouse');
        toast({ title: 'Success', description: 'Request approved successfully' });
      } else {
        await apiClient.rejectRequest(selectedRequest.id, rejectRemarks, 'powerhouse');
        toast({ title: 'Success', description: 'Request rejected successfully' });
      }
      setConfirmOpen(false);
      setRejectRemarks('');
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Action failed', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const columns: Column<ClientRequest>[] = [
    { key: 'id', header: 'ID', render: (item) => <span className="text-gray-400">#{String(item.id).slice(0, 8)}</span> },
    { 
      key: 'user', 
      header: 'User',
      sortable: true,
      render: (item) => <span className="text-blue-400">{item.user?.username}</span>
    },
    { 
      key: 'amount', 
      header: 'Amount', 
      sortable: true,
      render: (item) => (
        <span className={type === 'deposit' ? 'text-green-400' : 'text-red-400'}>
          {type === 'deposit' ? '+' : '-'}₹{item.amount}
        </span>
      )
    },
    { 
      key: 'payment_mode', 
      header: 'Payment Mode',
      render: (item) => item.payment_mode?.name || '-'
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />
    },
    { 
      key: 'created_at', 
      header: 'Date',
      sortable: true,
      render: (item) => new Date(item.created_at).toLocaleDateString()
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-gray-600 text-gray-400 hover:bg-gray-600/20"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedRequest(item);
              setDetailsOpen(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {item.status === 'PENDING' && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="border-green-600 text-green-400 hover:bg-green-600/20"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRequest(item);
                  setActionType('approve');
                  setConfirmOpen(true);
                }}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-red-600 text-red-400 hover:bg-red-600/20"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRequest(item);
                  setActionType('reject');
                  setConfirmOpen(true);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white capitalize">{type} Requests</h1>

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        searchKeys={['user.username', 'reference_id']}
        searchPlaceholder="Search by username or reference..."
      />

      {/* Details Modal */}
      <FormModal
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        title={`${type.charAt(0).toUpperCase() + type.slice(1)} Request Details`}
      >
        {selectedRequest && (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-700 rounded-lg">
                <p className="text-gray-400 text-sm">User</p>
                <p className="text-white font-medium">{selectedRequest.user?.username}</p>
              </div>
              <div className="p-3 bg-gray-700 rounded-lg">
                <p className="text-gray-400 text-sm">Amount</p>
                <p className={`font-medium ${type === 'deposit' ? 'text-green-400' : 'text-red-400'}`}>
                  ₹{selectedRequest.amount}
                </p>
              </div>
              <div className="p-3 bg-gray-700 rounded-lg">
                <p className="text-gray-400 text-sm">Status</p>
                <StatusBadge status={selectedRequest.status} />
              </div>
              <div className="p-3 bg-gray-700 rounded-lg">
                <p className="text-gray-400 text-sm">Payment Mode</p>
                <p className="text-white">{selectedRequest.payment_mode?.name || '-'}</p>
              </div>
              <div className="p-3 bg-gray-700 rounded-lg col-span-2">
                <p className="text-gray-400 text-sm">Reference ID</p>
                <p className="text-white">{selectedRequest.reference_id || '-'}</p>
              </div>
              <div className="p-3 bg-gray-700 rounded-lg col-span-2">
                <p className="text-gray-400 text-sm">Remarks</p>
                <p className="text-white">{selectedRequest.remarks || '-'}</p>
              </div>
              <div className="p-3 bg-gray-700 rounded-lg col-span-2">
                <p className="text-gray-400 text-sm">Created At</p>
                <p className="text-white">{new Date(selectedRequest.created_at).toLocaleString()}</p>
              </div>
            </div>
            {selectedRequest.status === 'PENDING' && (
              <div className="flex gap-3 pt-4">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setDetailsOpen(false);
                    setActionType('approve');
                    setConfirmOpen(true);
                  }}
                >
                  <Check className="h-4 w-4 mr-2" /> Approve
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-red-600 text-red-400 hover:bg-red-600/20"
                  onClick={() => {
                    setDetailsOpen(false);
                    setActionType('reject');
                    setConfirmOpen(true);
                  }}
                >
                  <X className="h-4 w-4 mr-2" /> Reject
                </Button>
              </div>
            )}
          </div>
        )}
      </FormModal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(open) => { setConfirmOpen(open); if (!open) setRejectRemarks(''); }}
        title={actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
        description={`Are you sure you want to ${actionType} this ${type} request for ₹${selectedRequest?.amount}?`}
        confirmText={actionType === 'approve' ? 'Approve' : 'Reject'}
        variant={actionType === 'reject' ? 'destructive' : 'default'}
        loading={actionLoading}
        onConfirm={handleAction}
      >
        {actionType === 'reject' && (
          <div className="space-y-2">
            <Label className="text-gray-300">Remarks (optional)</Label>
            <Input
              value={rejectRemarks}
              onChange={(e) => setRejectRemarks(e.target.value)}
              placeholder="Reason for rejection"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
};

// Summary Stats Component
export const TotalDW: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.getPowerhouseTotalDW();
        setStats(response);
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to fetch stats', variant: 'destructive' });
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
      <h1 className="text-2xl font-bold text-white">Total Deposits / Withdrawals</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Deposits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">₹{stats?.total_deposits || '0'}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Withdrawals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">₹{stats?.total_withdrawals || '0'}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Pending Deposits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">{stats?.pending_deposits || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Pending Withdrawals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">{stats?.pending_withdrawals || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Net Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400">
              ₹{((parseFloat(stats?.total_deposits || '0')) - (parseFloat(stats?.total_withdrawals || '0'))).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Today's Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-400">{stats?.today_count || 0}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Super Master DW Component
export const SuperMasterDW: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.getPowerhouseSuperMasterDW();
        setData(response.results || response || []);
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to fetch data', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const columns: Column<any>[] = [
    { key: 'username', header: 'Username', sortable: true },
    { key: 'role', header: 'Role', render: (item) => <StatusBadge status={item.role} /> },
    { 
      key: 'total_deposits', 
      header: 'Deposits',
      sortable: true,
      render: (item) => <span className="text-green-400">₹{item.total_deposits || '0'}</span>
    },
    { 
      key: 'total_withdrawals', 
      header: 'Withdrawals',
      sortable: true,
      render: (item) => <span className="text-red-400">₹{item.total_withdrawals || '0'}</span>
    },
    { 
      key: 'net_balance', 
      header: 'Net',
      render: (item) => {
        const net = (parseFloat(item.total_deposits || '0') - parseFloat(item.total_withdrawals || '0'));
        return <span className={net >= 0 ? 'text-green-400' : 'text-red-400'}>₹{net.toFixed(2)}</span>;
      }
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Super / Master D/W Breakdown</h1>
      
      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        searchKeys={['username']}
        searchPlaceholder="Search by username..."
      />
    </div>
  );
};

export default ClientRequests;
