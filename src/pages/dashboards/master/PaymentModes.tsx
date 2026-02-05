import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '@/components/shared/DataTable';
import { FormModal } from '@/components/shared/FormModal';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Power } from 'lucide-react';
import apiClient from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface PaymentMode {
  id: string;
  wallet_holder_name: string;
  type: string;
  wallet_phone?: string;
  account_details?: {
    bank_name?: string;
    account_number?: string;
    account_name?: string;
    ifsc_code?: string;
    upi_id?: string;
    wallet_phone?: string;
  };
  status: string;
  created_at: string;
}

export const PaymentModes: React.FC = () => {
  const [data, setData] = useState<PaymentMode[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'BANK',
    account_number: '',
    account_name: '',
    bank_name: '',
    ifsc_code: '',
    upi_id: '',
    wallet_phone: '',
  });
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getMasterPaymentModes();
      setData(response.results || response || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch payment modes', variant: 'destructive' });
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
      // Map frontend fields to backend expected names
      const payload: any = {
        wallet_holder_name: formData.name,
        type: formData.type,
        wallet_phone: formData.wallet_phone || formData.upi_id || '',
        account_details: {},
      };
      
      // Build account_details based on payment type
      if (formData.type === 'BANK') {
        payload.account_details = {
          bank_name: formData.bank_name,
          account_number: formData.account_number,
          account_name: formData.account_name,
          ifsc_code: formData.ifsc_code,
        };
      } else if (formData.type === 'UPI') {
        payload.account_details = { upi_id: formData.upi_id };
        payload.wallet_phone = formData.upi_id;
      } else if (formData.type === 'EWALLET') {
        payload.account_details = { wallet_phone: formData.wallet_phone };
      }
      
      await apiClient.createMasterPaymentMode(payload);
      toast({ title: 'Success', description: 'Payment mode created successfully' });
      setModalOpen(false);
      setFormData({ name: '', type: 'BANK', account_number: '', account_name: '', bank_name: '', ifsc_code: '', upi_id: '', wallet_phone: '' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to create payment mode', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggle = async (mode: PaymentMode) => {
    try {
      await apiClient.toggleMasterPaymentMode(mode.id);
      toast({ title: 'Success', description: `Payment mode ${mode.status === 'ACTIVE' ? 'disabled' : 'enabled'}` });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to toggle', variant: 'destructive' });
    }
  };

  const columns: Column<PaymentMode>[] = [
    { key: 'wallet_holder_name', header: 'Name', sortable: true },
    { key: 'type', header: 'Type', render: (item) => <StatusBadge status={item.type} /> },
    { 
      key: 'details', 
      header: 'Details',
      render: (item) => {
        if (item.type === 'UPI') return <span className="text-gray-300">{item.account_details?.upi_id || item.wallet_phone}</span>;
        if (item.type === 'BANK') return <span className="text-gray-300">{item.account_details?.bank_name} - {item.account_details?.account_number}</span>;
        if (item.type === 'EWALLET') return <span className="text-gray-300">{item.wallet_phone}</span>;
        return <span className="text-gray-300">-</span>;
      }
    },
    { key: 'status', header: 'Status', render: (item) => <StatusBadge status={item.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <Button
          size="sm"
          variant="outline"
          className={item.status === 'ACTIVE' ? 'border-red-600 text-red-400 hover:bg-red-600/20' : 'border-green-600 text-green-400 hover:bg-green-600/20'}
          onClick={(e) => {
            e.stopPropagation();
            handleToggle(item);
          }}
        >
          <Power className="h-4 w-4 mr-1" /> {item.status === 'ACTIVE' ? 'Disable' : 'Enable'}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Payment Modes</h1>
        <Button onClick={() => setModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" /> Add Payment Mode
        </Button>
      </div>

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        searchKeys={['wallet_holder_name']}
        searchPlaceholder="Search by name..."
      />

      <FormModal open={modalOpen} onOpenChange={setModalOpen} title="Add Payment Mode" description="Add a new payment method">
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="e.g., My SBI Account"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Type</Label>
            <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="BANK" className="text-white hover:bg-gray-600">Bank Transfer</SelectItem>
                <SelectItem value="UPI" className="text-white hover:bg-gray-600">UPI</SelectItem>
                <SelectItem value="EWALLET" className="text-white hover:bg-gray-600">E-Wallet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.type === 'BANK' && (
            <>
              <div className="space-y-2">
                <Label className="text-gray-300">Bank Name</Label>
                <Input value={formData.bank_name} onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })} className="bg-gray-700 border-gray-600 text-white" placeholder="State Bank of India" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Account Number</Label>
                <Input value={formData.account_number} onChange={(e) => setFormData({ ...formData, account_number: e.target.value })} className="bg-gray-700 border-gray-600 text-white" placeholder="1234567890" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Account Name</Label>
                <Input value={formData.account_name} onChange={(e) => setFormData({ ...formData, account_name: e.target.value })} className="bg-gray-700 border-gray-600 text-white" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">IFSC Code</Label>
                <Input value={formData.ifsc_code} onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value })} className="bg-gray-700 border-gray-600 text-white" placeholder="SBIN0001234" />
              </div>
            </>
          )}

          {formData.type === 'UPI' && (
            <div className="space-y-2">
              <Label className="text-gray-300">UPI ID</Label>
              <Input value={formData.upi_id} onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })} className="bg-gray-700 border-gray-600 text-white" placeholder="yourname@upi" />
            </div>
          )}

          {formData.type === 'EWALLET' && (
            <div className="space-y-2">
              <Label className="text-gray-300">Wallet Phone Number</Label>
              <Input value={formData.wallet_phone} onChange={(e) => setFormData({ ...formData, wallet_phone: e.target.value })} className="bg-gray-700 border-gray-600 text-white" placeholder="9876543210" />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="border-gray-600 text-gray-300">Cancel</Button>
            <Button onClick={handleCreate} disabled={actionLoading} className="bg-emerald-600 hover:bg-emerald-700">
              {actionLoading ? 'Creating...' : 'Add Payment Mode'}
            </Button>
          </div>
        </div>
      </FormModal>
    </div>
  );
};

export default PaymentModes;
