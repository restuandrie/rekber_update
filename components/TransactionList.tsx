
import React from 'react';
import { Transaction, User } from '../types';
import TransactionListItem from './TransactionListItem';
import LoadingSpinner from './LoadingSpinner';
import Alert from './Alert';

interface TransactionListProps {
  transactions: Transaction[];
  currentUser: User;
  isLoading: boolean;
  error: string | null;
  onViewDetails: (transaction: Transaction) => void;
  onRefresh: () => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, currentUser, isLoading, error, onViewDetails, onRefresh }) => {
  if (isLoading) {
    return <LoadingSpinner text="Memuat transaksi..." />;
  }

  if (error) {
    return <Alert type="error" message={error} onClose={onRefresh} />;
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-slate-900">Tidak ada transaksi</h3>
        <p className="mt-1 text-sm text-slate-500">
          Anda belum memiliki transaksi. Buat transaksi baru untuk memulai.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-6">
      {transactions.map((transaction) => (
        <TransactionListItem
          key={transaction.id}
          transaction={transaction}
          currentUser={currentUser}
          onViewDetails={onViewDetails}
        />
      ))}
    </ul>
  );
};

export default TransactionList;
    