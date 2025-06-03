
import React from 'react';
import { Transaction, User, TransactionStatus } from '../types';
import { formatCurrency, formatDate, EyeIcon } from '../constants';
import StatusBadge from './StatusBadge';
import ActionButton from './ActionButton';

interface TransactionListItemProps {
  transaction: Transaction;
  currentUser: User;
  onViewDetails: (transaction: Transaction) => void;
}

const TransactionListItem: React.FC<TransactionListItemProps> = ({ transaction, currentUser, onViewDetails }) => {
  const isSeller = transaction.seller.id === currentUser.id;
  
  let otherPartyName = 'N/A';
  let otherPartyAvatar = `https://ui-avatars.com/api/?name=N+A&background=random`;

  if (transaction.status === TransactionStatus.AWAITING_BUYER_CLAIM) {
    otherPartyName = transaction.buyerNameForInvite || 'Pembeli Diundang';
    otherPartyAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(otherPartyName)}&background=random&color=fff&length=1`;
  } else if (transaction.buyer) {
    const otherUser = isSeller ? transaction.buyer : transaction.seller;
    otherPartyName = otherUser.name;
    otherPartyAvatar = otherUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.name)}&background=random`;
  } else if (isSeller && !transaction.buyer && !transaction.buyerNameForInvite) {
    otherPartyName = "Pembeli Belum Ada"; // Should not happen often with AWAITING_BUYER_CLAIM
  } else if (!isSeller && transaction.buyerId === currentUser.id && transaction.buyer) { // Current user is buyer
    otherPartyName = transaction.seller.name;
    otherPartyAvatar = transaction.seller.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(transaction.seller.name)}&background=random`;
  }


  return (
    <li className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h3 className="text-xl font-semibold text-slate-800 mb-2 sm:mb-0 truncate" title={transaction.itemName}>
            {transaction.itemName}
          </h3>
          <StatusBadge status={transaction.status} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600 mb-4">
          <div>
            <p className="font-medium text-slate-500">ID Transaksi:</p>
            <p className="truncate" title={transaction.id}>{transaction.id}</p>
          </div>
          <div>
            <p className="font-medium text-slate-500">{isSeller ? "Pembeli" : "Penjual"}:</p>
             <p className="flex items-center">
                <img src={otherPartyAvatar} alt={otherPartyName} className="w-6 h-6 rounded-full mr-2 object-cover" />
                {otherPartyName}
                {transaction.status === TransactionStatus.AWAITING_BUYER_CLAIM && isSeller && (
                  <span className="ml-1 text-xs text-yellow-600">(Diundang)</span>
                )}
            </p>
          </div>
          <div>
            <p className="font-medium text-slate-500">Total:</p>
            <p className="font-semibold text-slate-700">{formatCurrency(transaction.totalAmount)}</p>
          </div>
        </div>
        
        <div className="text-xs text-slate-500 mb-5">
          <p>Dibuat: {formatDate(transaction.createdAt)}</p>
          <p>Diperbarui: {formatDate(transaction.updatedAt)}</p>
        </div>

        <div className="flex justify-end">
          <ActionButton onClick={() => onViewDetails(transaction)} variant="primary" size="sm" icon={<EyeIcon />}>
            Lihat Detail
          </ActionButton>
        </div>
      </div>
       <div className={`h-2 ${
            transaction.status === TransactionStatus.COMPLETED ? 'bg-green-500' :
            transaction.status === TransactionStatus.DISPUTED || transaction.status === TransactionStatus.CANCELLED ? 'bg-red-500' :
            transaction.status === TransactionStatus.PENDING_BUYER_ACCEPTANCE || transaction.status === TransactionStatus.AWAITING_PAYMENT || transaction.status === TransactionStatus.AWAITING_BUYER_CLAIM ? 'bg-yellow-500' :
            'bg-blue-500'
        }`}></div>
    </li>
  );
};

export default TransactionListItem;
