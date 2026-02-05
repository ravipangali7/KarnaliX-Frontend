import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusType = 
  | 'ACTIVE' | 'SUSPENDED' | 'CLOSED'  // User status
  | 'PENDING' | 'APPROVED' | 'REJECTED'  // Request/KYC status
  | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'  // Ticket status
  | 'WON' | 'LOST' | 'VOID' | 'SETTLED'  // Bet status
  | 'COMPLETED' | 'FAILED' | 'CANCELLED'  // Transaction status
  | string;

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusStyles: Record<string, string> = {
  // Success states
  ACTIVE: 'bg-green-500/20 text-green-400 border-green-500/30',
  APPROVED: 'bg-green-500/20 text-green-400 border-green-500/30',
  COMPLETED: 'bg-green-500/20 text-green-400 border-green-500/30',
  RESOLVED: 'bg-green-500/20 text-green-400 border-green-500/30',
  WON: 'bg-green-500/20 text-green-400 border-green-500/30',
  SETTLED: 'bg-green-500/20 text-green-400 border-green-500/30',
  
  // Warning states
  PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  IN_PROGRESS: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  OPEN: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  
  // Danger states
  SUSPENDED: 'bg-red-500/20 text-red-400 border-red-500/30',
  CLOSED: 'bg-red-500/20 text-red-400 border-red-500/30',
  REJECTED: 'bg-red-500/20 text-red-400 border-red-500/30',
  FAILED: 'bg-red-500/20 text-red-400 border-red-500/30',
  CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
  LOST: 'bg-red-500/20 text-red-400 border-red-500/30',
  VOID: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const style = statusStyles[status?.toUpperCase()] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  
  return (
    <Badge 
      variant="outline" 
      className={cn('font-medium', style, className)}
    >
      {status}
    </Badge>
  );
};

export default StatusBadge;
