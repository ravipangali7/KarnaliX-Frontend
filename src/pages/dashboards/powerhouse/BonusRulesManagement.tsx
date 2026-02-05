import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '@/components/shared/DataTable';
import { FormModal } from '@/components/shared/FormModal';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Power, Edit, Trash2, Gift } from 'lucide-react';
import apiClient from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface BonusRule {
  id: string;
  name: string;
  bonus_type: string;
  percentage: string;
  max_bonus: string;
  min_deposit: string;
  rollover_multiplier: string;
  is_active: boolean;
  valid_from: string | null;
  valid_until: string | null;
  created_at: string;
}

const BONUS_TYPES = [
  { value: 'WELCOME', label: 'Welcome Bonus' },
  { value: 'DEPOSIT', label: 'Deposit Bonus' },
  { value: 'CASHBACK', label: 'Cashback' },
  { value: 'REFERRAL', label: 'Referral Bonus' },
];

export const BonusRulesManagement: React.FC = () => {
  const [data, setData] = useState<BonusRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<BonusRule | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bonus_type: 'WELCOME',
    percentage: '10',
    max_bonus: '1000',
    min_deposit: '500',
    rollover_multiplier: '1',
    is_active: true,
  });
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getPowerhouseBonusRules();
      setData(response.results || response || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch bonus rules', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditingRule(null);
    setFormData({
      name: '',
      bonus_type: 'WELCOME',
      percentage: '10',
      max_bonus: '1000',
      min_deposit: '500',
      rollover_multiplier: '1',
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEdit = (rule: BonusRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      bonus_type: rule.bonus_type,
      percentage: String(rule.percentage),
      max_bonus: String(rule.max_bonus),
      min_deposit: String(rule.min_deposit),
      rollover_multiplier: String(rule.rollover_multiplier),
      is_active: rule.is_active,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setActionLoading(true);
    try {
      const payload = {
        name: formData.name,
        bonus_type: formData.bonus_type,
        percentage: formData.percentage,
        max_bonus: formData.max_bonus,
        min_deposit: formData.min_deposit,
        rollover_multiplier: formData.rollover_multiplier,
        is_active: formData.is_active,
      };
      if (editingRule) {
        await apiClient.updatePowerhouseBonusRule(editingRule.id, payload);
        toast({ title: 'Success', description: 'Bonus rule updated' });
      } else {
        await apiClient.createPowerhouseBonusRule(payload);
        toast({ title: 'Success', description: 'Bonus rule created' });
      }
      setModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to save', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggle = async (rule: BonusRule) => {
    try {
      await apiClient.togglePowerhouseBonusRule(rule.id);
      toast({ title: 'Success', description: `Rule ${rule.is_active ? 'deactivated' : 'activated'}` });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to toggle', variant: 'destructive' });
    }
  };

  const handleDelete = async (rule: BonusRule) => {
    if (!confirm(`Delete bonus rule "${rule.name}"?`)) return;
    try {
      await apiClient.deletePowerhouseBonusRule(rule.id);
      toast({ title: 'Success', description: 'Bonus rule deleted' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to delete', variant: 'destructive' });
    }
  };

  const columns: Column<BonusRule>[] = [
    { key: 'name', header: 'Name', sortable: true },
    {
      key: 'bonus_type',
      header: 'Type',
      render: (item) => <span className="text-blue-400">{item.bonus_type}</span>,
    },
    {
      key: 'percentage',
      header: '%',
      render: (item) => <span className="text-green-400">{item.percentage}%</span>,
    },
    { key: 'max_bonus', header: 'Max Bonus', render: (item) => `₹${item.max_bonus}` },
    { key: 'min_deposit', header: 'Min Deposit', render: (item) => `₹${item.min_deposit}` },
    {
      key: 'is_active',
      header: 'Status',
      render: (item) => <StatusBadge status={item.is_active ? 'ACTIVE' : 'INACTIVE'} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/20"
            onClick={(e) => {
              e.stopPropagation();
              openEdit(item);
            }}
          >
            <Edit className="h-4 w-4 mr-1" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className={item.is_active ? 'border-red-600 text-red-400' : 'border-green-600 text-green-400'}
            onClick={(e) => {
              e.stopPropagation();
              handleToggle(item);
            }}
          >
            <Power className="h-4 w-4 mr-1" /> {item.is_active ? 'Deactivate' : 'Activate'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-gray-500 text-gray-400 hover:bg-red-600/20"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(item);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Gift className="h-6 w-6 text-yellow-500" /> Bonus Rules
        </h1>
        <Button onClick={openCreate} className="bg-yellow-600 hover:bg-yellow-700">
          <Plus className="h-4 w-4 mr-2" /> Add Rule
        </Button>
      </div>

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        searchKeys={['name', 'bonus_type']}
        searchPlaceholder="Search by name or type..."
      />

      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editingRule ? 'Edit Bonus Rule' : 'Add Bonus Rule'}
        description={editingRule ? 'Update bonus rule settings' : 'Create a new bonus rule'}
      >
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="e.g. Welcome 10%"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Bonus Type</Label>
            <select
              value={formData.bonus_type}
              onChange={(e) => setFormData({ ...formData, bonus_type: e.target.value })}
              className="w-full h-10 px-3 rounded-lg bg-gray-700 border border-gray-600 text-white"
            >
              {BONUS_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Percentage (%)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.percentage}
                onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Max Bonus (₹)</Label>
              <Input
                type="number"
                value={formData.max_bonus}
                onChange={(e) => setFormData({ ...formData, max_bonus: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Min Deposit (₹)</Label>
              <Input
                type="number"
                value={formData.min_deposit}
                onChange={(e) => setFormData({ ...formData, min_deposit: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Rollover Multiplier</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.rollover_multiplier}
                onChange={(e) => setFormData({ ...formData, rollover_multiplier: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>
          {editingRule && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded bg-gray-700 border-gray-600"
              />
              <Label htmlFor="is_active" className="text-gray-300">Active</Label>
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1 border-gray-600 text-gray-300">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={actionLoading} className="flex-1 bg-yellow-600 hover:bg-yellow-700">
              {actionLoading ? 'Saving...' : editingRule ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </FormModal>
    </div>
  );
};

export default BonusRulesManagement;
