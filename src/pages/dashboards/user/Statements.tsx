import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import apiClient from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface Transaction {
  id: string;
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
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.getUserAccountStatement();
        setData(response.results || response.transactions || []);
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to fetch', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const typeColors: Record<string, string> = {
    DEPOSIT: 'text-green-400', WITHDRAWAL: 'text-red-400', BET: 'text-orange-400',
    WIN: 'text-green-400', BONUS: 'text-purple-400', ADJUSTMENT: 'text-blue-400',
  };

  const columns: Column<Transaction>[] = [
    { key: 'created_at', header: 'Date', sortable: true, render: (item) => new Date(item.created_at).toLocaleString() },
    { key: 'type', header: 'Type', render: (item) => <span className={typeColors[item.type] || 'text-gray-400'}>{item.type}</span> },
    { key: 'amount', header: 'Amount', sortable: true, render: (item) => {
      const isCredit = ['DEPOSIT', 'WIN', 'BONUS'].includes(item.type);
      return <span className={isCredit ? 'text-green-400' : 'text-red-400'}>{isCredit ? '+' : '-'}₹{item.amount}</span>;
    }},
    { key: 'balance_before', header: 'Before', render: (item) => `₹${item.balance_before}` },
    { key: 'balance_after', header: 'After', render: (item) => `₹${item.balance_after}` },
    { key: 'description', header: 'Description' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Account Statement</h1>
      <DataTable data={data} columns={columns} loading={loading} searchKeys={['description']} />
    </div>
  );
};

interface Bet {
  id: string;
  game: { name: string };
  amount: string;
  potential_win: string;
  status: string;
  result?: string;
  created_at: string;
}

export const MyBets: React.FC = () => {
  const [data, setData] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.getUserBets();
        setData(response.results || response || []);
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to fetch', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const columns: Column<Bet>[] = [
    { key: 'created_at', header: 'Date', sortable: true, render: (item) => new Date(item.created_at).toLocaleString() },
    { key: 'game', header: 'Game', render: (item) => <span className="text-purple-400">{item.game?.name}</span> },
    { key: 'amount', header: 'Stake', sortable: true, render: (item) => `₹${item.amount}` },
    { key: 'potential_win', header: 'Potential Win', render: (item) => <span className="text-green-400">₹{item.potential_win}</span> },
    { key: 'status', header: 'Status', render: (item) => <StatusBadge status={item.status} /> },
    { key: 'result', header: 'Result', render: (item) => item.result ? <StatusBadge status={item.result} /> : '-' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">My Bets</h1>
      <DataTable data={data} columns={columns} loading={loading} searchKeys={['game.name']} />
    </div>
  );
};

export const ProfitLoss: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.getUserProfitLoss();
        setStats(response);
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to fetch', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Profit / Loss</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-400">Total Bets</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-white">{stats?.total_bets || 0}</div></CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-400">Total Stake</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-orange-400">₹{stats?.total_stake || '0'}</div></CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-400">Total Winnings</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-400">₹{stats?.total_winnings || '0'}</div></CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-400">Net P/L</CardTitle></CardHeader>
          <CardContent><div className={`text-2xl font-bold ${parseFloat(stats?.profit_loss || '0') >= 0 ? 'text-green-400' : 'text-red-400'}`}>₹{stats?.profit_loss || '0'}</div></CardContent>
        </Card>
      </div>
    </div>
  );
};

export const ActivityLog: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.getUserActivity();
        setData(response.results || response || []);
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to fetch', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const columns: Column<any>[] = [
    { key: 'created_at', header: 'Time', sortable: true, render: (item) => new Date(item.created_at).toLocaleString() },
    { key: 'action', header: 'Action', render: (item) => <span className="text-blue-400">{item.action?.replace(/_/g, ' ')}</span> },
    { key: 'description', header: 'Description' },
    { key: 'ip_address', header: 'IP', render: (item) => <span className="text-gray-400 font-mono text-sm">{item.ip_address}</span> },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Activity Log</h1>
      <DataTable data={data} columns={columns} loading={loading} searchKeys={['action', 'description']} />
    </div>
  );
};

export const Results: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.getUserResults();
        setData(response.results || response || []);
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to fetch', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const columns: Column<any>[] = [
    { key: 'created_at', header: 'Date', sortable: true, render: (item) => new Date(item.created_at).toLocaleString() },
    { key: 'game', header: 'Game', render: (item) => <span className="text-purple-400">{item.game?.name}</span> },
    { key: 'result', header: 'Result', render: (item) => <StatusBadge status={item.result} /> },
    { key: 'amount_won', header: 'Won', render: (item) => <span className="text-green-400">₹{item.amount_won || '0'}</span> },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Results</h1>
      <DataTable data={data} columns={columns} loading={loading} searchKeys={['game.name']} />
    </div>
  );
};

export const Transactions: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.getUserTransactions();
        setData(response.results || response || []);
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to fetch', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const columns: Column<any>[] = [
    { key: 'created_at', header: 'Date', sortable: true, render: (item) => new Date(item.created_at).toLocaleString() },
    { key: 'type', header: 'Type', render: (item) => <StatusBadge status={item.type} /> },
    { key: 'amount', header: 'Amount', render: (item) => {
      const isCredit = ['DEPOSIT', 'WIN', 'BONUS'].includes(item.type);
      return <span className={isCredit ? 'text-green-400' : 'text-red-400'}>{isCredit ? '+' : '-'}₹{item.amount}</span>;
    }},
    { key: 'status', header: 'Status', render: (item) => <StatusBadge status={item.status} /> },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Transactions</h1>
      <DataTable data={data} columns={columns} loading={loading} searchKeys={['type']} />
    </div>
  );
};

export default AccountStatement;
