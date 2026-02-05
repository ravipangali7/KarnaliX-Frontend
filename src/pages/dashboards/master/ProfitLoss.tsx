import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '@/components/shared/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import apiClient from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Trophy } from 'lucide-react';

interface PLData {
  category: string;
  total_bets: number;
  total_stake: string;
  total_winnings: string;
  profit_loss: string;
}

interface ClientPL {
  user: { id: string; username: string };
  total_bets: number;
  total_stake: string;
  total_winnings: string;
  profit_loss: string;
}

interface TopWinner {
  user: { id: string; username: string };
  total_winnings: string;
  total_bets: number;
  win_rate: string;
}

export const PLSports: React.FC = () => {
  const [data, setData] = useState<PLData[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.getMasterProfitLossSports();
        setData(response.breakdown || response.results || []);
        setSummary(response.summary || response);
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to fetch data', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const columns: Column<PLData>[] = [
    { key: 'category', header: 'Category', sortable: true },
    { key: 'total_bets', header: 'Total Bets', sortable: true },
    { key: 'total_stake', header: 'Total Stake', sortable: true, render: (item) => `₹${item.total_stake}` },
    { key: 'total_winnings', header: 'Winnings', sortable: true, render: (item) => `₹${item.total_winnings}` },
    { 
      key: 'profit_loss', 
      header: 'P/L',
      sortable: true,
      render: (item) => {
        const pl = parseFloat(item.profit_loss);
        return <span className={pl >= 0 ? 'text-green-400' : 'text-red-400'}>₹{item.profit_loss}</span>;
      }
    },
  ];

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">P/L Sports</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-400">Total Stake</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-white">₹{summary?.total_stake || '0'}</div></CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-400">Total Winnings</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-400">₹{summary?.total_winnings || '0'}</div></CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-400">Net P/L</CardTitle></CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${parseFloat(summary?.profit_loss || '0') >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ₹{summary?.profit_loss || '0'}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-400">Total Bets</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-blue-400">{summary?.total_bets || 0}</div></CardContent>
        </Card>
      </div>

      <DataTable data={data} columns={columns} loading={loading} searchKeys={['category']} searchPlaceholder="Search..." />
    </div>
  );
};

export const PLClient: React.FC = () => {
  const [data, setData] = useState<ClientPL[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.getMasterProfitLossClient();
        setData(response.results || response || []);
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to fetch data', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const columns: Column<ClientPL>[] = [
    { key: 'user', header: 'Client', sortable: true, render: (item) => <span className="text-emerald-400">{item.user?.username}</span> },
    { key: 'total_bets', header: 'Total Bets', sortable: true },
    { key: 'total_stake', header: 'Stake', sortable: true, render: (item) => `₹${item.total_stake}` },
    { key: 'total_winnings', header: 'Winnings', sortable: true, render: (item) => `₹${item.total_winnings}` },
    { 
      key: 'profit_loss', 
      header: 'P/L',
      sortable: true,
      render: (item) => {
        const pl = parseFloat(item.profit_loss);
        return <span className={pl >= 0 ? 'text-green-400' : 'text-red-400'}>₹{item.profit_loss}</span>;
      }
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">P/L by Client</h1>
      <DataTable data={data} columns={columns} loading={loading} searchKeys={['user.username']} searchPlaceholder="Search..." />
    </div>
  );
};

export const TopWinners: React.FC = () => {
  const [data, setData] = useState<TopWinner[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.getMasterTopWinners();
        setData(response.results || response || []);
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to fetch data', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const columns: Column<TopWinner>[] = [
    { key: 'user', header: 'User', sortable: true, render: (item) => <span className="text-emerald-400 font-medium">{item.user?.username}</span> },
    { key: 'total_winnings', header: 'Winnings', sortable: true, render: (item) => <span className="text-green-400 font-bold">₹{item.total_winnings}</span> },
    { key: 'total_bets', header: 'Bets', sortable: true },
    { key: 'win_rate', header: 'Win Rate', sortable: true, render: (item) => <span className="text-blue-400">{item.win_rate}%</span> },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        <Trophy className="h-6 w-6 text-yellow-400" /> Top Winners
      </h1>
      <DataTable data={data} columns={columns} loading={loading} searchKeys={['user.username']} searchPlaceholder="Search..." />
    </div>
  );
};

export default PLSports;
