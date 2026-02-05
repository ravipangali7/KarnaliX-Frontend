import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '@/components/shared/DataTable';
import { FormModal } from '@/components/shared/FormModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Edit } from 'lucide-react';
import apiClient from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface SuperSetting {
  id: string;
  user: { id: string; username: string };
  username?: string;
  commission_rate: string;
  max_credit_limit: string;
  bet_limit: string;
  status: string;
  updated_at: string;
}

export const SuperSettings: React.FC = () => {
  const [data, setData] = useState<SuperSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<SuperSetting | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    commission_rate: '5.00',
    max_credit_limit: '0',
    bet_limit: '0',
    status: 'ACTIVE',
  });
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getPowerhouseSettings();
      setData(response.results || response || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch settings', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (setting: SuperSetting) => {
    setSelectedSetting(setting);
    setFormData({
      commission_rate: String(setting.commission_rate ?? '0'),
      max_credit_limit: String(setting.max_credit_limit ?? '0'),
      bet_limit: String(setting.bet_limit ?? '0'),
      status: setting.status || 'ACTIVE',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedSetting) return;
    setActionLoading(true);
    try {
      await apiClient.updatePowerhouseSettings(selectedSetting.user.id, {
        commission_rate: formData.commission_rate,
        max_credit_limit: formData.max_credit_limit,
        bet_limit: formData.bet_limit,
        status: formData.status,
      });
      toast({ title: 'Success', description: 'Settings updated successfully' });
      setModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update settings', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const columns: Column<SuperSetting>[] = [
    {
      key: 'user',
      header: 'Super User',
      sortable: true,
      render: (item) => <span className="text-blue-400 font-medium">{item.username ?? item.user?.username}</span>,
    },
    {
      key: 'commission_rate',
      header: 'Commission (%)',
      sortable: true,
      render: (item) => <span className="text-green-400">{item.commission_rate}%</span>,
    },
    {
      key: 'max_credit_limit',
      header: 'Max Credit Limit',
      render: (item) => <span className="text-gray-300">₹{item.max_credit_limit}</span>,
    },
    {
      key: 'bet_limit',
      header: 'Bet Limit',
      render: (item) => <span className="text-gray-300">₹{item.bet_limit}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <span className={item.status === 'ACTIVE' ? 'text-green-400' : 'text-gray-500'}>{item.status}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <Button
          size="sm"
          variant="outline"
          className="border-blue-600 text-blue-400 hover:bg-blue-600/20"
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(item);
          }}
        >
          <Edit className="h-4 w-4 mr-1" /> Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Super Settings</h1>
      </div>

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        searchKeys={['user.username', 'username']}
        searchPlaceholder="Search by username..."
      />

      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={`Settings for ${selectedSetting?.username ?? selectedSetting?.user?.username}`}
        description="Configure commission, limits and status for this super user"
      >
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <h3 className="text-white font-medium flex items-center gap-2">
              <Settings className="h-4 w-4" /> Limits & Commission
            </h3>
            <div className="space-y-2">
              <Label className="text-gray-300">Commission Rate (%)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.commission_rate}
                onChange={(e) => setFormData({ ...formData, commission_rate: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Max Credit Limit (₹)</Label>
              <Input
                type="number"
                value={formData.max_credit_limit}
                onChange={(e) => setFormData({ ...formData, max_credit_limit: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Bet Limit (₹)</Label>
              <Input
                type="number"
                value={formData.bet_limit}
                onChange={(e) => setFormData({ ...formData, bet_limit: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Status</Label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full h-10 px-3 rounded-lg bg-gray-700 border border-gray-600 text-white"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              className="flex-1 border-gray-600 text-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={actionLoading}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700"
            >
              {actionLoading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </FormModal>
    </div>
  );
};

export default SuperSettings;
