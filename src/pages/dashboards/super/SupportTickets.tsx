import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '@/components/shared/DataTable';
import { FormModal } from '@/components/shared/FormModal';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Eye, XCircle, Send } from 'lucide-react';
import apiClient from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface SupportMessage {
  id: string;
  sender: { username: string };
  message: string;
  is_staff: boolean;
  created_at: string;
}

interface SupportTicket {
  id: string;
  user: { id: string; username: string; email: string };
  subject: string;
  status: string;
  priority: string;
  messages?: SupportMessage[];
  created_at: string;
}

export const SupportTickets: React.FC = () => {
  const [data, setData] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getSuperTickets();
      setData(response.results || response || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch tickets', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const viewTicketDetails = async (ticket: SupportTicket) => {
    try {
      const details = await apiClient.getSuperTicketDetails(ticket.id);
      setSelectedTicket(details);
      setDetailsOpen(true);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load ticket details', variant: 'destructive' });
    }
  };

  const handleReply = async () => {
    if (!selectedTicket || !replyText) return;
    setActionLoading(true);
    try {
      await apiClient.replySuperTicket(selectedTicket.id, { message: replyText });
      toast({ title: 'Success', description: 'Reply sent successfully' });
      setReplyText('');
      const details = await apiClient.getSuperTicketDetails(selectedTicket.id);
      setSelectedTicket(details);
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to send reply', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleClose = async () => {
    if (!selectedTicket) return;
    setActionLoading(true);
    try {
      await apiClient.closeSuperTicket(selectedTicket.id);
      toast({ title: 'Success', description: 'Ticket closed successfully' });
      setDetailsOpen(false);
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to close ticket', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const priorityColors: Record<string, string> = {
    LOW: 'text-gray-400',
    MEDIUM: 'text-yellow-400',
    HIGH: 'text-orange-400',
    URGENT: 'text-red-400',
  };

  const columns: Column<SupportTicket>[] = [
    { key: 'id', header: 'ID', render: (item) => <span className="text-gray-400">#{String(item.id).slice(0, 8)}</span> },
    { key: 'user', header: 'User', render: (item) => <span className="text-blue-400">{item.user?.username}</span> },
    { key: 'subject', header: 'Subject', sortable: true },
    { key: 'priority', header: 'Priority', render: (item) => <span className={priorityColors[item.priority]}>{item.priority}</span> },
    { key: 'status', header: 'Status', render: (item) => <StatusBadge status={item.status} /> },
    { key: 'created_at', header: 'Created', sortable: true, render: (item) => new Date(item.created_at).toLocaleDateString() },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <Button
          size="sm"
          variant="outline"
          className="border-gray-600 text-gray-400 hover:bg-gray-600/20"
          onClick={(e) => {
            e.stopPropagation();
            viewTicketDetails(item);
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Support Tickets</h1>

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        searchKeys={['user.username', 'subject']}
        searchPlaceholder="Search by username or subject..."
      />

      <FormModal
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        title={`Ticket: ${selectedTicket?.subject}`}
        size="lg"
      >
        {selectedTicket && (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-gray-700 rounded-lg">
                <p className="text-gray-400 text-sm">User</p>
                <p className="text-white">{selectedTicket.user?.username}</p>
              </div>
              <div className="p-3 bg-gray-700 rounded-lg">
                <p className="text-gray-400 text-sm">Status</p>
                <StatusBadge status={selectedTicket.status} />
              </div>
              <div className="p-3 bg-gray-700 rounded-lg">
                <p className="text-gray-400 text-sm">Priority</p>
                <span className={priorityColors[selectedTicket.priority]}>{selectedTicket.priority}</span>
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-4 max-h-[300px] overflow-y-auto space-y-3">
              {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                selectedTicket.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-lg ${msg.is_staff ? 'bg-blue-900/50 ml-8' : 'bg-gray-600 mr-8'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white">
                        {msg.sender?.username}
                        {msg.is_staff && <span className="text-blue-400 ml-2">(Staff)</span>}
                      </span>
                      <span className="text-xs text-gray-400">{new Date(msg.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-300 text-sm">{msg.message}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center">No messages yet</p>
              )}
            </div>

            {selectedTicket.status !== 'RESOLVED' && (
              <>
                <div className="flex gap-2">
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white flex-1"
                    placeholder="Type your reply..."
                    rows={2}
                  />
                  <Button onClick={handleReply} disabled={actionLoading || !replyText} className="bg-blue-600 hover:bg-blue-700">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  className="w-full border-red-600 text-red-400 hover:bg-red-600/20"
                  onClick={handleClose}
                  disabled={actionLoading}
                >
                  <XCircle className="h-4 w-4 mr-2" /> Close Ticket
                </Button>
              </>
            )}
          </div>
        )}
      </FormModal>
    </div>
  );
};

export default SupportTickets;
