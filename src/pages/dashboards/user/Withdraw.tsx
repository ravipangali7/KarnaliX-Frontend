import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '@/components/shared/DataTable';
import { FormModal } from '@/components/shared/FormModal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, ArrowUpCircle, Trash2, CreditCard } from 'lucide-react';
import apiClient from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface WithdrawRequest {
  id: string;
  amount: string;
  status: string;
  payment_mode?: { id: string; name: string; type: string };
  created_at: string;
}

interface PaymentMode {
  id: string;
  name: string;
  type: string;
  account_number?: string;
  account_name?: string;
  bank_name?: string;
  ifsc_code?: string;
  upi_id?: string;
}

export const Withdraw: React.FC = () => {
  const { user } = useAuth();
  const [withdrawals, setWithdrawals] = useState<WithdrawRequest[]>([]);
  const [paymentModes, setPaymentModes] = useState<PaymentMode[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [addModeModalOpen, setAddModeModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<PaymentMode | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [withdrawData, setWithdrawData] = useState({ amount: '', payment_mode_id: '', remarks: '' });
  const [modeData, setModeData] = useState({ name: '', type: 'BANK', account_number: '', account_name: '', bank_name: '', ifsc_code: '', upi_id: '' });
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [wRes, mRes] = await Promise.all([apiClient.getUserWithdrawals(), apiClient.getUserWithdrawPaymentModes()]);
      setWithdrawals(wRes.results || wRes || []);
      setPaymentModes(mRes.results || mRes || []);
    } catch (error) { toast({ title: 'Error', description: 'Failed to fetch', variant: 'destructive' }); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleWithdraw = async () => {
    if (!withdrawData.amount || !withdrawData.payment_mode_id) { toast({ title: 'Error', description: 'Required fields missing', variant: 'destructive' }); return; }
    setActionLoading(true);
    try {
      await apiClient.createUserWithdrawal(withdrawData);
      toast({ title: 'Success', description: 'Withdrawal submitted' });
      setWithdrawModalOpen(false);
      setWithdrawData({ amount: '', payment_mode_id: '', remarks: '' });
      fetchData();
    } catch (error: any) { toast({ title: 'Error', description: error.message || 'Failed', variant: 'destructive' }); }
    finally { setActionLoading(false); }
  };

  const handleAddMode = async () => {
    setActionLoading(true);
    try {
      await apiClient.createUserPaymentMode(modeData);
      toast({ title: 'Success', description: 'Payment mode added' });
      setAddModeModalOpen(false);
      setModeData({ name: '', type: 'BANK', account_number: '', account_name: '', bank_name: '', ifsc_code: '', upi_id: '' });
      fetchData();
    } catch (error: any) { toast({ title: 'Error', description: error.message || 'Failed', variant: 'destructive' }); }
    finally { setActionLoading(false); }
  };

  const handleDeleteMode = async () => {
    if (!selectedMode) return;
    setActionLoading(true);
    try { await apiClient.deleteUserPaymentMode(selectedMode.id); toast({ title: 'Success', description: 'Deleted' }); setDeleteConfirmOpen(false); fetchData(); }
    catch (error: any) { toast({ title: 'Error', description: error.message || 'Failed', variant: 'destructive' }); }
    finally { setActionLoading(false); }
  };

  const columns: Column<WithdrawRequest>[] = [
    { key: 'id', header: 'ID', render: (item) => <span className="text-gray-400">#{String(item.id).slice(0, 8)}</span> },
    { key: 'amount', header: 'Amount', sortable: true, render: (item) => <span className="text-red-400 font-bold">-₹{item.amount}</span> },
    { key: 'payment_mode', header: 'Mode', render: (item) => item.payment_mode?.name || '-' },
    { key: 'status', header: 'Status', render: (item) => <StatusBadge status={item.status} /> },
    { key: 'created_at', header: 'Date', sortable: true, render: (item) => new Date(item.created_at).toLocaleString() },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Withdraw</h1>
        <div className="flex gap-2">
          <Button onClick={() => setAddModeModalOpen(true)} variant="outline" className="border-purple-600 text-purple-400 hover:bg-purple-600/20"><CreditCard className="h-4 w-4 mr-2" /> Add Mode</Button>
          <Button onClick={() => setWithdrawModalOpen(true)} className="bg-red-600 hover:bg-red-700"><Plus className="h-4 w-4 mr-2" /> Withdraw</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-purple-600 to-purple-800 text-white border-purple-700">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-purple-200">Balance</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">₹{user?.wallet_balance || '0'}</div></CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-400">Pending</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-yellow-400">{withdrawals.filter(w => w.status === 'PENDING').length}</div></CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-400">Approved</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-400">{withdrawals.filter(w => w.status === 'APPROVED').length}</div></CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-400">My Modes</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-purple-400">{paymentModes.length}</div></CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader><CardTitle className="text-white flex items-center gap-2"><CreditCard className="h-5 w-5" /> Payment Modes</CardTitle></CardHeader>
        <CardContent>
          {paymentModes.length === 0 ? <p className="text-gray-400 text-center py-4">No payment modes. Add one first.</p> : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {paymentModes.map((m) => (
                <div key={m.id} className="p-4 bg-gray-700 rounded-lg relative">
                  <Button size="icon" variant="ghost" className="absolute top-2 right-2 text-red-400 hover:bg-red-600/20" onClick={() => { setSelectedMode(m); setDeleteConfirmOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                  <p className="text-white font-medium">{m.name}</p>
                  <StatusBadge status={m.type} />
                  <div className="mt-2 text-sm text-gray-400">{m.type === 'UPI' ? <p>UPI: {m.upi_id}</p> : <><p>{m.bank_name}</p><p>A/C: {m.account_number}</p></>}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <DataTable data={withdrawals} columns={columns} loading={loading} />

      <FormModal open={withdrawModalOpen} onOpenChange={setWithdrawModalOpen} title="New Withdrawal">
        <div className="space-y-4 py-4">
          <div className="p-4 bg-gray-700 rounded-lg"><p className="text-gray-400 text-sm">Balance</p><p className="text-2xl font-bold text-green-400">₹{user?.wallet_balance || '0'}</p></div>
          <div className="space-y-2"><Label className="text-gray-300">Amount</Label><Input type="number" value={withdrawData.amount} onChange={(e) => setWithdrawData({ ...withdrawData, amount: e.target.value })} className="bg-gray-700 border-gray-600 text-white" /></div>
          <div className="space-y-2"><Label className="text-gray-300">Payment Mode</Label><Select value={withdrawData.payment_mode_id} onValueChange={(v) => setWithdrawData({ ...withdrawData, payment_mode_id: v })}><SelectTrigger className="bg-gray-700 border-gray-600 text-white"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent className="bg-gray-700 border-gray-600">{paymentModes.map((m) => (<SelectItem key={m.id} value={m.id} className="text-white hover:bg-gray-600">{m.name}</SelectItem>))}</SelectContent></Select></div>
          <div className="space-y-2"><Label className="text-gray-300">Remarks</Label><Textarea value={withdrawData.remarks} onChange={(e) => setWithdrawData({ ...withdrawData, remarks: e.target.value })} className="bg-gray-700 border-gray-600 text-white" rows={2} /></div>
          <div className="flex justify-end gap-3 pt-4"><Button variant="outline" onClick={() => setWithdrawModalOpen(false)} className="border-gray-600 text-gray-300">Cancel</Button><Button onClick={handleWithdraw} disabled={actionLoading} className="bg-red-600 hover:bg-red-700"><ArrowUpCircle className="h-4 w-4 mr-2" /> {actionLoading ? 'Submitting...' : 'Withdraw'}</Button></div>
        </div>
      </FormModal>

      <FormModal open={addModeModalOpen} onOpenChange={setAddModeModalOpen} title="Add Payment Mode">
        <div className="space-y-4 py-4">
          <div className="space-y-2"><Label className="text-gray-300">Name</Label><Input value={modeData.name} onChange={(e) => setModeData({ ...modeData, name: e.target.value })} className="bg-gray-700 border-gray-600 text-white" /></div>
          <div className="space-y-2"><Label className="text-gray-300">Type</Label><Select value={modeData.type} onValueChange={(v) => setModeData({ ...modeData, type: v })}><SelectTrigger className="bg-gray-700 border-gray-600 text-white"><SelectValue /></SelectTrigger><SelectContent className="bg-gray-700 border-gray-600"><SelectItem value="BANK" className="text-white hover:bg-gray-600">Bank</SelectItem><SelectItem value="UPI" className="text-white hover:bg-gray-600">UPI</SelectItem></SelectContent></Select></div>
          {modeData.type === 'BANK' && (<><div className="space-y-2"><Label className="text-gray-300">Bank</Label><Input value={modeData.bank_name} onChange={(e) => setModeData({ ...modeData, bank_name: e.target.value })} className="bg-gray-700 border-gray-600 text-white" /></div><div className="space-y-2"><Label className="text-gray-300">Account</Label><Input value={modeData.account_number} onChange={(e) => setModeData({ ...modeData, account_number: e.target.value })} className="bg-gray-700 border-gray-600 text-white" /></div><div className="space-y-2"><Label className="text-gray-300">Name</Label><Input value={modeData.account_name} onChange={(e) => setModeData({ ...modeData, account_name: e.target.value })} className="bg-gray-700 border-gray-600 text-white" /></div><div className="space-y-2"><Label className="text-gray-300">IFSC</Label><Input value={modeData.ifsc_code} onChange={(e) => setModeData({ ...modeData, ifsc_code: e.target.value })} className="bg-gray-700 border-gray-600 text-white" /></div></>)}
          {modeData.type === 'UPI' && (<div className="space-y-2"><Label className="text-gray-300">UPI ID</Label><Input value={modeData.upi_id} onChange={(e) => setModeData({ ...modeData, upi_id: e.target.value })} className="bg-gray-700 border-gray-600 text-white" /></div>)}
          <div className="flex justify-end gap-3 pt-4"><Button variant="outline" onClick={() => setAddModeModalOpen(false)} className="border-gray-600 text-gray-300">Cancel</Button><Button onClick={handleAddMode} disabled={actionLoading} className="bg-purple-600 hover:bg-purple-700">{actionLoading ? 'Adding...' : 'Add'}</Button></div>
        </div>
      </FormModal>

      <ConfirmDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen} title="Delete" description={`Delete ${selectedMode?.name}?`} confirmText="Delete" variant="destructive" loading={actionLoading} onConfirm={handleDeleteMode} />
    </div>
  );
};

export default Withdraw;
