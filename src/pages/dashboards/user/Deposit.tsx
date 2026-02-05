import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '@/components/shared/DataTable';
import { FormModal } from '@/components/shared/FormModal';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, ArrowDownCircle } from 'lucide-react';
import apiClient from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface DepositRequest {
  id: string;
  amount: string;
  status: string;
  payment_mode?: { name: string };
  reference_id?: string;
  created_at: string;
}

interface PaymentMode {
  id: string;
  name?: string;
  wallet_holder_name?: string;
  type: string;
  owner_role?: string;
}

export const Deposit: React.FC = () => {
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [paymentModes, setPaymentModes] = useState<PaymentMode[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({ amount: '', payment_mode_id: '', reference_id: '' });
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dRes, mRes] = await Promise.all([
        apiClient.getUserDeposits(),
        apiClient.getAvailablePaymentModes(),
      ]);
      setDeposits(dRes.results || dRes || []);
      setPaymentModes(mRes.results || mRes || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    if (!formData.amount || !formData.payment_mode_id) {
      toast({ title: 'Error', description: 'Required fields', variant: 'destructive' });
      return;
    }
    setActionLoading(true);
    try {
      await apiClient.createUserDeposit(formData);
      toast({ title: 'Success', description: 'Deposit submitted' });
      setModalOpen(false);
      setFormData({ amount: '', payment_mode_id: '', reference_id: '' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const columns: Column<DepositRequest>[] = [
    { key: 'id', header: 'ID', render: (item) => <span className="text-gray-400">#{String(item.id).slice(0, 8)}</span> },
    { key: 'amount', header: 'Amount', sortable: true, render: (item) => <span className="text-green-400 font-bold">+{item.amount}</span> },
    { key: 'payment_mode', header: 'Mode', render: (item) => item.payment_mode?.name || '-' },
    { key: 'reference_id', header: 'Ref', render: (item) => item.reference_id || '-' },
    { key: 'status', header: 'Status', render: (item) => <StatusBadge status={item.status} /> },
    { key: 'created_at', header: 'Date', sortable: true, render: (item) => new Date(item.created_at).toLocaleString() },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Deposit</h1>
        <Button onClick={() => setModalOpen(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" /> New Deposit
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-400">Pending</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-yellow-400">{deposits.filter(d => d.status === 'PENDING').length}</div></CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-400">Approved</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-400">{deposits.filter(d => d.status === 'APPROVED').length}</div></CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-400">Total</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-white">{deposits.length}</div></CardContent>
        </Card>
      </div>

      <DataTable data={deposits} columns={columns} loading={loading} searchKeys={['reference_id']} />

      <FormModal open={modalOpen} onOpenChange={setModalOpen} title="New Deposit">
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Amount</Label>
            <Input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="bg-gray-700 border-gray-600 text-white" placeholder="Amount" />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Payment Mode</Label>
            <Select value={formData.payment_mode_id} onValueChange={(v) => setFormData({ ...formData, payment_mode_id: v })}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {paymentModes.map((m) => {
                  const label = m.wallet_holder_name ?? m.name ?? '-';
                  const ownerLabel = m.owner_role ? `${m.owner_role} – ` : '';
                  return (<SelectItem key={m.id} value={String(m.id)} className="text-white hover:bg-gray-600">{ownerLabel}{label}</SelectItem>);
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Reference/UTR</Label>
            <Input value={formData.reference_id} onChange={(e) => setFormData({ ...formData, reference_id: e.target.value })} className="bg-gray-700 border-gray-600 text-white" placeholder="Transaction ID" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="border-gray-600 text-gray-300">Cancel</Button>
            <Button onClick={handleSubmit} disabled={actionLoading} className="bg-green-600 hover:bg-green-700">
              <ArrowDownCircle className="h-4 w-4 mr-2" /> {actionLoading ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </div>
      </FormModal>
    </div>
  );
};

export default Deposit;
