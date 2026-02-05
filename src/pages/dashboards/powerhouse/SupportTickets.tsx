import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '@/components/shared/DataTable';
import { FormModal } from '@/components/shared/FormModal';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, MessageSquare, XCircle, UserPlus, Send } from 'lucide-react';
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
  assigned_to?: { id: string; username: string };
  messages?: SupportMessage[];
  created_at: string;
  updated_at: string;
}

interface StaffUser {
  id: string;
  username: string;
}

export const SupportTickets: React.FC = () => {
  const [data, setData] = useState<SupportTicket[]>([]);
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [assignTo, setAssignTo] = useState('');
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getPowerhouseTickets();
      setData(response.results || response || []);
      // Fetch staff for assignment - in real app you'd have an API for this
      setStaff([]);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch support tickets', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReply = async () => {
    if (!selectedTicket || !replyText) return;
    setActionLoading(true);
    try {
      await apiClient.replyPowerhouseTicket(selectedTicket.id, { message: replyText });
      toast({ title: 'Success', description: 'Reply sent successfully' });
      setReplyText('');
      // Refresh ticket details
      const details = await apiClient.getPowerhouseTicketDetails(selectedTicket.id);
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
      await apiClient.closePowerhouseTicket(selectedTicket.id);
      toast({ title: 'Success', description: 'Ticket closed successfully' });
      setDetailsOpen(false);
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to close ticket', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedTicket || !assignTo) return;
    setActionLoading(true);
    try {
      await apiClient.assignPowerhouseTicket(selectedTicket.id, { assigned_to: Number(assignTo) || assignTo });
      toast({ title: 'Success', description: 'Ticket assigned successfully' });
      setAssignOpen(false);
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to assign ticket', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const viewTicketDetails = async (ticket: SupportTicket) => {
    try {
      const details = await apiClient.getPowerhouseTicketDetails(ticket.id);
      setSelectedTicket(details);
      setDetailsOpen(true);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load ticket details', variant: 'destructive' });
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
    { 
      key: 'user', 
      header: 'User',
      sortable: true,
      render: (item) => <span className="text-blue-400">{item.user?.username}</span>
    },
    { key: 'subject', header: 'Subject', sortable: true },
    { 
      key: 'priority', 
      header: 'Priority',
      render: (item) => <span className={priorityColors[item.priority] || 'text-gray-400'}>{item.priority}</span>
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />
    },
    { 
      key: 'assigned_to', 
      header: 'Assigned To',
      render: (item) => item.assigned_to?.username || <span className="text-gray-500">Unassigned</span>
    },
    { 
      key: 'created_at', 
      header: 'Created',
      sortable: true,
      render: (item) => new Date(item.created_at).toLocaleDateString()
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex gap-2">
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
          {item.status !== 'RESOLVED' && (
            <Button
              size="sm"
              variant="outline"
              className="border-blue-600 text-blue-400 hover:bg-blue-600/20"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTicket(item);
                setAssignOpen(true);
              }}
            >
              <UserPlus className="h-4 w-4" />
            </Button>
          )}
        </div>
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

      {/* Details Modal */}
      <FormModal
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        title={`Ticket: ${selectedTicket?.subject}`}
        size="lg"
      >
        {selectedTicket && (
          <div className="space-y-4 py-4">
            {/* Ticket Info */}
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

            {/* Messages */}
            <div className="space-y-2">
              <p className="text-gray-400 text-sm">Conversation</p>
              <div className="bg-gray-700 rounded-lg p-4 max-h-[300px] overflow-y-auto space-y-3">
                {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                  selectedTicket.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-lg ${
                        msg.is_staff 
                          ? 'bg-blue-900/50 ml-8' 
                          : 'bg-gray-600 mr-8'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white">
                          {msg.sender?.username}
                          {msg.is_staff && <span className="text-blue-400 ml-2">(Staff)</span>}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(msg.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">{msg.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center">No messages yet</p>
                )}
              </div>
            </div>

            {/* Reply */}
            {selectedTicket.status !== 'RESOLVED' && (
              <div className="space-y-2">
                <Label className="text-gray-300">Reply</Label>
                <div className="flex gap-2">
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white flex-1"
                    placeholder="Type your reply..."
                    rows={2}
                  />
                  <Button
                    onClick={handleReply}
                    disabled={actionLoading || !replyText}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Actions */}
            {selectedTicket.status !== 'RESOLVED' && (
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 border-red-600 text-red-400 hover:bg-red-600/20"
                  onClick={handleClose}
                  disabled={actionLoading}
                >
                  <XCircle className="h-4 w-4 mr-2" /> Close Ticket
                </Button>
              </div>
            )}
          </div>
        )}
      </FormModal>

      {/* Assign Modal */}
      <FormModal
        open={assignOpen}
        onOpenChange={setAssignOpen}
        title="Assign Ticket"
      >
        <div className="space-y-4 py-4">
          <p className="text-gray-300">
            Assign ticket <span className="text-white font-medium">"{selectedTicket?.subject}"</span> to a staff member.
          </p>
          <div className="space-y-2">
            <Label className="text-gray-300">Staff Member</Label>
            <Select value={assignTo} onValueChange={setAssignTo}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {staff.length > 0 ? (
                  staff.map((s) => (
                    <SelectItem key={s.id} value={s.id} className="text-white hover:bg-gray-600">
                      {s.username}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="self" className="text-white hover:bg-gray-600">
                    Assign to myself
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setAssignOpen(false)}
              className="flex-1 border-gray-600 text-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={actionLoading || !assignTo}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {actionLoading ? 'Assigning...' : 'Assign'}
            </Button>
          </div>
        </div>
      </FormModal>
    </div>
  );
};

export default SupportTickets;
