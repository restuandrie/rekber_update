
import React from 'react';
import { TransactionStatus } from '../types';

interface StatusBadgeProps {
  status: TransactionStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusColors: Record<TransactionStatus, string> = {
    [TransactionStatus.PENDING_BUYER_ACCEPTANCE]: 'bg-yellow-100 text-yellow-800',
    [TransactionStatus.AWAITING_PAYMENT]: 'bg-blue-100 text-blue-800',
    [TransactionStatus.PAYMENT_VERIFICATION]: 'bg-indigo-100 text-indigo-800',
    [TransactionStatus.FUNDS_HELD]: 'bg-purple-100 text-purple-800',
    [TransactionStatus.ITEM_SHIPPED]: 'bg-cyan-100 text-cyan-800',
    [TransactionStatus.COMPLETED]: 'bg-green-100 text-green-800',
    [TransactionStatus.DISPUTED]: 'bg-red-100 text-red-800',
    [TransactionStatus.CANCELLED]: 'bg-slate-100 text-slate-800',
    [TransactionStatus.PAYMENT_REJECTED]: 'bg-pink-100 text-pink-800',
    [TransactionStatus.REFUNDED]: 'bg-orange-100 text-orange-800',
    [TransactionStatus.AWAITING_BUYER_CLAIM]: 'bg-teal-100 text-teal-800', // New Color
  };

  return (
    <span
      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
