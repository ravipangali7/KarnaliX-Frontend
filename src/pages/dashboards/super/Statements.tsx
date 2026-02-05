import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from 'lucide-react';
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
      const response = await apiClient.getSuperAccountStatement(params);
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

  const typeColors: Record<string, string> = {
    DEPOSIT: 'text-green-400',
    WITHDRAWAL: 'text-red-400',
    BET: 'text-orange-400',
    WIN: 'text-green-400',
    BONUS: 'text-purple-400',
    ADJUSTMENT: 'text-blue-400',
  };

  const columns: Column<Transaction>[] = [
    { key: 'created_at', header: 'Date', sortable: true, render: (item) => new Date(item.created_at).toLocaleString() },
    { key: 'user', header: 'User', render: (item) => <span className="text-blue-400">{item.user?.username}</span> },
    { key: 'type', header: 'Type', render: (item) => <span className={typeColors[item.type] || 'text-gray-400'}>{item.type}</span> },
    { 
      key: 'amount', 
      header: 'Amount',
      sortable: true,
      render: (item) => {
        const isCredit = ['DEPOSIT', 'WIN', 'BONUS'].includes(item.type);
        return <span className={isCredit ? 'text-green-400' : 'text-red-400'}>{isCredit ? '+' : '-'}₹{item.amount}</span>;
      }
    },
    { key: 'balance_before', header: 'Before', render: (item) => `₹${item.balance_before}` },
    { key: 'balance_after', header: 'After', render: (item) => `₹${item.balance_after}` },
    { key: 'description', header: 'Description' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Account Statement</h1>

      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="pt-6">
          <div className="flex items-end gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">From Date</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="bg-gray-700 border-gray-600 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">To Date</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="bg-gray-700 border-gray-600 text-white" />
            </div>
            <Button onClick={fetchData} className="bg-blue-600 hover:bg-blue-700">
              <Calendar className="h-4 w-4 mr-2" /> Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      <DataTable data={data} columns={columns} loading={loading} searchKeys={['user.username', 'description']} searchPlaceholder="Search..." />
    </div>
  );
};

interface Bonus {
  id: string;
  user: { username: string };
  amount: string;
  bonus_type: string;
  status: string;
  created_at: string;
}

export const BonusStatement: React.FC = () => {
  const [data, setData] = useState<Bonus[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.getSuperBonusStatement();
        setData(response.results || response.bonuses || []);
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to fetch bonus statement', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const columns: Column<Bonus>[] = [
    { key: 'created_at', header: 'Date', sortable: true, render: (item) => new Date(item.created_at).toLocaleDateString() },
    { key: 'user', header: 'User', render: (item) => <span className="text-blue-400">{item.user?.username}</span> },
    { key: 'amount', header: 'Amount', sortable: true, render: (item) => <span className="text-green-400">₹{item.amount}</span> },
    { key: 'bonus_type', header: 'Type', render: (item) => <StatusBadge status={item.bonus_type} /> },
    { key: 'status', header: 'Status', render: (item) => <StatusBadge status={item.status} /> },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Bonus Statement</h1>
      <DataTable data={data} columns={columns} loading={loading} searchKeys={['user.username']} searchPlaceholder="Search by username..." />
    </div>
  );
};

export default AccountStatement;
