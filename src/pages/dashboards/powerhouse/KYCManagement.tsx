import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '@/components/shared/DataTable';
import { FormModal } from '@/components/shared/FormModal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Check, X, Eye, FileText } from 'lucide-react';
import apiClient from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface KYCVerification {
  id: string;
  user: { id: string; username: string; email: string };
  document_type: string;
  document_number: string;
  document_front?: string;
  document_back?: string;
  status: string;
  remarks?: string;
  verified_by?: { username: string };
  created_at: string;
  verified_at?: string;
}

export const KYCManagement: React.FC = () => {
  const [data, setData] = useState<KYCVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedKYC, setSelectedKYC] = useState<KYCVerification | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getPowerhouseKYC();
      setData(response.results || response || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch KYC verifications', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async () => {
    if (!selectedKYC) return;
    setActionLoading(true);
    try {
      await apiClient.approvePowerhouseKYC(selectedKYC.id);
      toast({ title: 'Success', description: 'KYC approved successfully' });
      setConfirmOpen(false);
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to approve KYC', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedKYC) return;
    setActionLoading(true);
    try {
      await apiClient.rejectPowerhouseKYC(selectedKYC.id, { remarks: rejectReason });
      toast({ title: 'Success', description: 'KYC rejected successfully' });
      setConfirmOpen(false);
      setRejectReason('');
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to reject KYC', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const columns: Column<KYCVerification>[] = [
    { 
      key: 'user', 
      header: 'User',
      sortable: true,
      render: (item) => (
        <div>
          <p className="text-white">{item.user?.username}</p>
          <p className="text-gray-400 text-sm">{item.user?.email}</p>
        </div>
      )
    },
    { key: 'document_type', header: 'Document Type', render: (item) => <StatusBadge status={item.document_type} /> },
    { key: 'document_number', header: 'Document No.' },
    { 
      key: 'status', 
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />
    },
    { 
      key: 'created_at', 
      header: 'Submitted',
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
              setSelectedKYC(item);
              setDetailsOpen(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {item.status === 'PENDING' && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="border-green-600 text-green-400 hover:bg-green-600/20"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedKYC(item);
                  setActionType('approve');
                  setConfirmOpen(true);
                }}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-red-600 text-red-400 hover:bg-red-600/20"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedKYC(item);
                  setActionType('reject');
                  setConfirmOpen(true);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">KYC Management</h1>

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        searchKeys={['user.username', 'document_number']}
        searchPlaceholder="Search by username or document number..."
      />

      {/* Details Modal */}
      <FormModal
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        title="KYC Verification Details"
        size="lg"
      >
        {selectedKYC && (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-700 rounded-lg">
                <p className="text-gray-400 text-sm">User</p>
                <p className="text-white font-medium">{selectedKYC.user?.username}</p>
                <p className="text-gray-400 text-sm">{selectedKYC.user?.email}</p>
              </div>
              <div className="p-3 bg-gray-700 rounded-lg">
                <p className="text-gray-400 text-sm">Status</p>
                <StatusBadge status={selectedKYC.status} />
              </div>
              <div className="p-3 bg-gray-700 rounded-lg">
                <p className="text-gray-400 text-sm">Document Type</p>
                <p className="text-white">{selectedKYC.document_type}</p>
              </div>
              <div className="p-3 bg-gray-700 rounded-lg">
                <p className="text-gray-400 text-sm">Document Number</p>
                <p className="text-white">{selectedKYC.document_number}</p>
              </div>
            </div>

            {/* Document Images */}
            <div className="space-y-2">
              <p className="text-gray-400 text-sm">Documents</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-700 rounded-lg flex flex-col items-center justify-center min-h-[150px]">
                  {selectedKYC.document_front ? (
                    <img 
                      src={selectedKYC.document_front} 
                      alt="Document Front" 
                      className="max-h-[200px] object-contain rounded"
                    />
                  ) : (
                    <div className="text-center">
                      <FileText className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">Front not uploaded</p>
                    </div>
                  )}
                  <p className="text-gray-400 text-sm mt-2">Front</p>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg flex flex-col items-center justify-center min-h-[150px]">
                  {selectedKYC.document_back ? (
                    <img 
                      src={selectedKYC.document_back} 
                      alt="Document Back" 
                      className="max-h-[200px] object-contain rounded"
                    />
                  ) : (
                    <div className="text-center">
                      <FileText className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">Back not uploaded</p>
                    </div>
                  )}
                  <p className="text-gray-400 text-sm mt-2">Back</p>
                </div>
              </div>
            </div>

            {selectedKYC.remarks && (
              <div className="p-3 bg-gray-700 rounded-lg">
                <p className="text-gray-400 text-sm">Remarks</p>
                <p className="text-white">{selectedKYC.remarks}</p>
              </div>
            )}

            {selectedKYC.verified_by && (
              <div className="p-3 bg-gray-700 rounded-lg">
                <p className="text-gray-400 text-sm">Verified By</p>
                <p className="text-white">{selectedKYC.verified_by.username}</p>
                <p className="text-gray-400 text-sm">
                  {selectedKYC.verified_at && new Date(selectedKYC.verified_at).toLocaleString()}
                </p>
              </div>
            )}

            {selectedKYC.status === 'PENDING' && (
              <div className="flex gap-3 pt-4">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setDetailsOpen(false);
                    setActionType('approve');
                    setConfirmOpen(true);
                  }}
                >
                  <Check className="h-4 w-4 mr-2" /> Approve
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-red-600 text-red-400 hover:bg-red-600/20"
                  onClick={() => {
                    setDetailsOpen(false);
                    setActionType('reject');
                    setConfirmOpen(true);
                  }}
                >
                  <X className="h-4 w-4 mr-2" /> Reject
                </Button>
              </div>
            )}
          </div>
        )}
      </FormModal>

      {/* Confirm Dialog */}
      <FormModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={actionType === 'approve' ? 'Approve KYC' : 'Reject KYC'}
      >
        <div className="space-y-4 py-4">
          {actionType === 'approve' ? (
            <p className="text-gray-300">
              Are you sure you want to approve the KYC verification for{' '}
              <span className="text-white font-medium">{selectedKYC?.user?.username}</span>?
            </p>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-300">
                Please provide a reason for rejecting the KYC verification for{' '}
                <span className="text-white font-medium">{selectedKYC?.user?.username}</span>.
              </p>
              <div className="space-y-2">
                <Label className="text-gray-300">Rejection Reason</Label>
                <Textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Enter reason for rejection..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              className="flex-1 border-gray-600 text-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={actionType === 'approve' ? handleApprove : handleReject}
              disabled={actionLoading || (actionType === 'reject' && !rejectReason)}
              className={`flex-1 ${actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
            >
              {actionLoading ? 'Processing...' : actionType === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </div>
        </div>
      </FormModal>
    </div>
  );
};

export default KYCManagement;
