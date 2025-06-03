
import { useState, useEffect, useCallback } from 'react';
import { Transaction, User, TransactionStatus, TransactionUpdatePayload } from '../types';
import { transactionService, authService } from '../services/escrowService';

interface UseEscrowReturn {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  fetchTransactions: (userId: string) => Promise<void>;
  createTransaction: (
    sellerId: string,
    buyerId: string | null,
    buyerNameForInvite: string | undefined,
    itemName: string,
    itemDescription: string,
    price: number
  ) => Promise<Transaction | null>;
  updateTransactionStatus: ( 
    transactionId: string,
    newStatus: TransactionStatus,
    userId: string,
    details?: Partial<TransactionUpdatePayload>
  ) => Promise<Transaction | null>;
  acceptTxn: (transactionId: string, userId: string) => Promise<Transaction | null>;
  payTxn: (transactionId: string, userId: string, paymentProof: string) => Promise<Transaction | null>;
  shipTxn: (transactionId: string, userId: string, trackingInfo: string) => Promise<Transaction | null>;
  confirmReceiptTxn: (transactionId: string, userId: string) => Promise<Transaction | null>;
  cancelTxn: (transactionId: string, userId: string) => Promise<Transaction | null>;
  disputeTxn: (transactionId: string, userId: string, reason: string) => Promise<Transaction | null>;
  claimInvite: (inviteToken: string, claimingUserId: string) => Promise<Transaction | null>;
  refreshTransaction: (transactionId: string) => Promise<void>; 
}

export function useEscrow(currentUser?: User): UseEscrowReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async (userId: string) => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await transactionService.getTransactionsForUser(userId);
      // Ensure buyer object is populated for display if buyerId exists
      const populatedData = await Promise.all(data.map(async tx => {
        if (tx.buyerId && !tx.buyer) {
          const buyerUser = await authService.getUserById(tx.buyerId);
          return { ...tx, buyer: buyerUser || null };
        }
        return tx;
      }));
      setTransactions(populatedData);
    } catch (e: any) {
      setError(e.message || 'Gagal mengambil data transaksi.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchTransactions(currentUser.id);
    } else {
      setTransactions([]); 
    }
  }, [currentUser, fetchTransactions]);

  const handleServiceCall = async <T,>(
    serviceFn: () => Promise<T>
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await serviceFn();
      if (currentUser) { // Refresh full list after any action
        await fetchTransactions(currentUser.id); 
      }
      return result;
    } catch (e: any) {
      setError(e.message || 'Terjadi sebuah kesalahan.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const refreshTransaction = useCallback(async (transactionId: string) => {
    setIsLoading(true);
    try {
        const updatedTx = await transactionService.getTransactionById(transactionId);
        if (updatedTx) {
            // Ensure buyer object is populated for display if buyerId exists
            let finalTx = updatedTx;
            if (updatedTx.buyerId && !updatedTx.buyer) {
                const buyerUser = await authService.getUserById(updatedTx.buyerId);
                finalTx = { ...updatedTx, buyer: buyerUser || null };
            }
            setTransactions(prev => prev.map(tx => tx.id === transactionId ? finalTx : tx));
        }
    } catch (e: any) {
        setError(e.message || 'Gagal menyegarkan detail transaksi.');
    } finally {
        setIsLoading(false);
    }
  }, []); 

  const createTransaction = async (
    sellerId: string,
    buyerId: string | null,
    buyerNameForInvite: string | undefined,
    itemName: string,
    itemDescription: string,
    price: number
  ) => {
    return handleServiceCall(() => 
      transactionService.createTransaction(sellerId, buyerId, buyerNameForInvite, itemName, itemDescription, price)
    );
  };
  
  const claimInvite = async (inviteToken: string, claimingUserId: string) => {
    return handleServiceCall(() => transactionService.claimTransactionInvite(inviteToken, claimingUserId));
  };

  const updateTransactionStatus = async (
    transactionId: string,
    newStatus: TransactionStatus,
    userId: string, 
    details?: Partial<TransactionUpdatePayload>
  ) => {
    return handleServiceCall(() => 
      transactionService.updateTransaction(transactionId, { status: newStatus, ...details })
    );
  };
  
  const acceptTxn = async (transactionId: string, userId: string) => {
    return handleServiceCall(() => transactionService.acceptTransaction(transactionId, userId));
  };

  const payTxn = async (transactionId: string, userId: string, paymentProof: string) => {
     return handleServiceCall(() => transactionService.makePayment(transactionId, userId, paymentProof));
  };
  
  const shipTxn = async (transactionId: string, userId: string, trackingInfo: string) => {
    return handleServiceCall(() => transactionService.markAsShipped(transactionId, userId, trackingInfo));
  };

  const confirmReceiptTxn = async (transactionId: string, userId: string) => {
    return handleServiceCall(() => transactionService.confirmReceipt(transactionId, userId));
  };
  
  const cancelTxn = async (transactionId: string, userId: string) => {
    return handleServiceCall(() => transactionService.cancelTransaction(transactionId, userId));
  };
  
  const disputeTxn = async (transactionId: string, userId: string, reason: string) => {
    return handleServiceCall(() => transactionService.raiseDispute(transactionId, userId, reason));
  };

  return {
    transactions,
    isLoading,
    error,
    fetchTransactions,
    createTransaction,
    updateTransactionStatus,
    acceptTxn,
    payTxn,
    shipTxn,
    confirmReceiptTxn,
    cancelTxn,
    disputeTxn,
    claimInvite,
    refreshTransaction,
  };
}
