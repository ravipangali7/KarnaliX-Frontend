import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import apiClient from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface ActivityLog {
  id: string;
  user: { id: string; username: string };
  action: string;
  description: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export const ClientActivityLog: React.FC = () => {
  const [data, setData] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.getMasterActivityLog();
        setData(response.results || response || []);
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to fetch activity logs', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const actionColors: Record<string, string> = {
    LOGIN: 'text-green-400',
    LOGOUT: 'text-gray-400',
    BET_PLACED: 'text-blue-400',
    DEPOSIT: 'text-green-400',
    WITHDRAWAL: 'text-red-400',
    PASSWORD_CHANGE: 'text-orange-400',
    PROFILE_UPDATE: 'text-purple-400',
  };

  const columns: Column<ActivityLog>[] = [
    { 
      key: 'created_at', 
      header: 'Time',
      sortable: true,
      render: (item) => new Date(item.created_at).toLocaleString()
    },
    { 
      key: 'user', 
      header: 'User',
      sortable: true,
      render: (item) => <span className="text-emerald-400">{item.user?.username}</span>
    },
    { 
      key: 'action', 
      header: 'Action',
      render: (item) => <span className={actionColors[item.action] || 'text-gray-400'}>{item.action.replace(/_/g, ' ')}</span>
    },
    { key: 'description', header: 'Description' },
    { 
      key: 'ip_address', 
      header: 'IP Address',
      render: (item) => <span className="text-gray-400 font-mono text-sm">{item.ip_address}</span>
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Client Activity Log</h1>

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        searchKeys={['user.username', 'action', 'description']}
        searchPlaceholder="Search by user, action, or description..."
      />
    </div>
  );
};

export default ClientActivityLog;
