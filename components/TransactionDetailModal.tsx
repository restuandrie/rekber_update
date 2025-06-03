import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Transaction, User, TransactionStatus, TransactionUpdatePayload, ChatMessage } from '../types';
import { 
    formatCurrency, formatDate, CheckCircleIcon, CreditCardIcon, PaperAirplaneIcon, 
    ExclamationTriangleIcon, XCircleIcon as CancelIcon, ChatBubbleLeftEllipsisIcon, APP_NAME, WhatsAppIcon,
    ESCROW_ACCOUNT_INFO, ArrowUpTrayIcon, PhotoIcon, TrashIcon // Added ESCROW_ACCOUNT_INFO and upload icons
} from '../constants';
import Modal from './Modal';
import ActionButton from './ActionButton';
import StatusBadge from './StatusBadge';
import Alert from './Alert';
import { chatService } from '../services/escrowService'; 
import LoadingSpinner from './LoadingSpinner';


interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  currentUser: User;
  onUpdateTransaction: ( 
    transactionId: string,
    newStatus: TransactionStatus,
    userId: string,
    details?: Partial<TransactionUpdatePayload>
  ) => Promise<Transaction | null>;
  onAccept: (transactionId: string, userId: string) => Promise<Transaction | null>;
  onPay: (transactionId: string, userId: string, paymentProof: string) => Promise<Transaction | null>;
  onShip: (transactionId: string, userId: string, trackingInfo: string) => Promise<Transaction | null>;
  onConfirmReceipt: (transactionId: string, userId: string) => Promise<Transaction | null>;
  onCancel: (transactionId: string, userId: string) => Promise<Transaction | null>;
  onDispute: (transactionId: string, userId: string, reason: string) => Promise<Transaction | null>;
  refreshTransaction: (transactionId: string) => Promise<void>;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  isOpen,
  onClose,
  transaction: initialTransaction, 
  currentUser,
  onAccept,
  onPay,
  onShip,
  onConfirmReceipt,
  onCancel,
  onDispute,
}) => {
  const [localTransaction, setLocalTransaction] = useState<Transaction | null>(initialTransaction);
  const [actionLoading, setActionLoading] = useState(false);
  
  // For image uploads
  const [selectedPaymentProofFile, setSelectedPaymentProofFile] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
  const [selectedShippingReceiptFile, setSelectedShippingReceiptFile] = useState<File | null>(null);
  const [shippingReceiptPreview, setShippingReceiptPreview] = useState<string | null>(null);
  
  const [disputeReason, setDisputeReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [chatMessages]);

  const fetchChatMessages = useCallback(async (txId: string) => {
    if (!txId || (localTransaction?.status === TransactionStatus.AWAITING_BUYER_CLAIM && !localTransaction?.buyerId)) {
        setChatMessages([]); 
        return;
    }
    setChatLoading(true);
    setChatError(null);
    try {
      const messages = await chatService.getChatMessages(txId);
      setChatMessages(messages);
    } catch (e: any) {
      setChatError(e.message || 'Gagal memuat pesan chat.');
    } finally {
      setChatLoading(false);
    }
  }, [localTransaction?.status, localTransaction?.buyerId]);

  useEffect(() => {
    setLocalTransaction(initialTransaction);
    if (initialTransaction) {
        setPaymentProofPreview(initialTransaction.paymentProof || null);
        setSelectedPaymentProofFile(null);
        setShippingReceiptPreview(initialTransaction.trackingInfo || null); // trackingInfo is now shipping receipt image
        setSelectedShippingReceiptFile(null);
        setDisputeReason(initialTransaction.disputeReason || '');
        fetchChatMessages(initialTransaction.id); 
    } else {
        setChatMessages([]); 
        setPaymentProofPreview(null);
        setSelectedPaymentProofFile(null);
        setShippingReceiptPreview(null);
        setSelectedShippingReceiptFile(null);
    }
    setError(null); 
    setChatError(null);
    setNewChatMessage('');
  }, [initialTransaction, isOpen, fetchChatMessages]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'payment' | 'shipping') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'payment') {
          setPaymentProofPreview(reader.result as string);
          setSelectedPaymentProofFile(file);
        } else if (type === 'shipping') {
          setShippingReceiptPreview(reader.result as string);
          setSelectedShippingReceiptFile(file);
        }
      };
      reader.readAsDataURL(file);
    } else {
      if (type === 'payment') {
        setPaymentProofPreview(localTransaction?.paymentProof || null); // Revert to original if exists
        setSelectedPaymentProofFile(null);
      } else if (type === 'shipping') {
        setShippingReceiptPreview(localTransaction?.trackingInfo || null); // Revert to original if exists
        setSelectedShippingReceiptFile(null);
      }
    }
  };

  const removeImagePreview = (type: 'payment' | 'shipping') => {
    if (type === 'payment') {
      setPaymentProofPreview(null);
      setSelectedPaymentProofFile(null);
       // Clear file input value if needed, by giving it an ID and using document.getElementById
      const fileInput = document.getElementById('paymentProofUpload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } else if (type === 'shipping') {
      setShippingReceiptPreview(null);
      setSelectedShippingReceiptFile(null);
      const fileInput = document.getElementById('shippingReceiptUpload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  const handleAction = async (actionFn: () => Promise<Transaction | null>) => {
    setActionLoading(true);
    setError(null); 
    try {
      const resultTx = await actionFn();
      if (resultTx) {
        setLocalTransaction(resultTx);
        // After successful payment or shipping, clear the selected file as it's now part of localTransaction
        if (resultTx.paymentProof) setSelectedPaymentProofFile(null);
        if (resultTx.trackingInfo) setSelectedShippingReceiptFile(null);
      }
    } catch (e: any) {
      console.error("Error directly in modal handleAction:", e);
      setError(e.message || "Terjadi kesalahan tak terduga di modal.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendChatMessage = async () => {
    if (!localTransaction || !newChatMessage.trim() || !localTransaction.buyerId) return;
    setChatLoading(true); 
    setChatError(null);
    try {
      await chatService.sendChatMessage(localTransaction.id, currentUser.id, newChatMessage);
      setNewChatMessage('');
      await fetchChatMessages(localTransaction.id); 
    } catch (e: any) {
      setChatError(e.message || 'Gagal mengirim pesan.');
    } finally {
      setChatLoading(false);
    }
  };

  if (!localTransaction) return null;

  const isSeller = localTransaction.seller.id === currentUser.id;
  const isBuyer = localTransaction.buyerId === currentUser.id && localTransaction.status !== TransactionStatus.AWAITING_BUYER_CLAIM;

  const canAccept = isBuyer && localTransaction.status === TransactionStatus.PENDING_BUYER_ACCEPTANCE;
  const canPay = isBuyer && localTransaction.status === TransactionStatus.AWAITING_PAYMENT;
  const canShip = isSeller && localTransaction.status === TransactionStatus.FUNDS_HELD;
  const canConfirmReceipt = isBuyer && localTransaction.status === TransactionStatus.ITEM_SHIPPED;
  
  let canCancelUser = false;
  if (isSeller && (localTransaction.status === TransactionStatus.AWAITING_BUYER_CLAIM || localTransaction.status === TransactionStatus.PENDING_BUYER_ACCEPTANCE || localTransaction.status === TransactionStatus.AWAITING_PAYMENT)) {
    canCancelUser = true;
  } else if (isBuyer && (localTransaction.status === TransactionStatus.PENDING_BUYER_ACCEPTANCE || localTransaction.status === TransactionStatus.AWAITING_PAYMENT)) {
    canCancelUser = true;
  }
  
  const canDispute = isBuyer && (localTransaction.status === TransactionStatus.FUNDS_HELD || localTransaction.status === TransactionStatus.ITEM_SHIPPED);

  const renderPartyInfo = (user: User | null | undefined, role: string) => {
    if (role === "Pembeli" && localTransaction?.status === TransactionStatus.AWAITING_BUYER_CLAIM) {
        return (
            <div>
                <p className="text-xs text-slate-500">{role}</p>
                <div className="flex items-center mt-1">
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(localTransaction.buyerNameForInvite || 'P')}&background=random&color=fff&length=1`} alt={localTransaction.buyerNameForInvite} className="w-8 h-8 rounded-full mr-2 object-cover" />
                <p className="text-slate-700 font-medium">{localTransaction.buyerNameForInvite || 'Pembeli Diundang'} <span className="text-yellow-600 text-xs">(Menunggu bergabung)</span></p>
                </div>
            </div>
        );
    }
    if (!user) {
        return (
             <div>
                <p className="text-xs text-slate-500">{role}</p>
                <p className="text-slate-500 font-medium mt-1">Informasi tidak tersedia</p>
            </div>
        );
    }
    return (
        <div>
        <p className="text-xs text-slate-500">{role}</p>
        <div className="flex items-center mt-1">
            <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&background=random`} alt={user.name} className="w-8 h-8 rounded-full mr-2 object-cover" />
            <p className="text-slate-700 font-medium">{user.name}</p>
        </div>
        </div>
    );
  };
  
  const getWhatsAppShareLink = () => {
    if (localTransaction?.status === TransactionStatus.AWAITING_BUYER_CLAIM && localTransaction.inviteToken && localTransaction.buyerNameForInvite && isSeller) {
        const appBaseUrl = window.location.origin;
        const link = `${appBaseUrl}/?inviteToken=${localTransaction.inviteToken}`;
        const message = `Halo ${localTransaction.buyerNameForInvite},\n\n${currentUser.name} telah mengundang Anda untuk melakukan transaksi aman di ${APP_NAME} untuk barang/jasa "${localTransaction.itemName}".\n\nKlik tautan ini untuk melihat detail dan melanjutkan: ${link}\n\nTerima kasih!`;
        return `https://wa.me/?text=${encodeURIComponent(message)}`;
    }
    return null;
  }
  const whatsAppShareUrl = getWhatsAppShareLink();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Transaksi" size="xl"> 
      <div className="space-y-6">
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
        
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-lg font-semibold text-slate-800">{localTransaction.itemName}</h4>
            <StatusBadge status={localTransaction.status} />
          </div>
          <p className="text-sm text-slate-600 mb-4">{localTransaction.itemDescription}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
            {renderPartyInfo(localTransaction.seller, "Penjual")}
            {renderPartyInfo(localTransaction.buyer, "Pembeli")}
          </div>

          {localTransaction.status === TransactionStatus.AWAITING_BUYER_CLAIM && isSeller && whatsAppShareUrl && (
            <div className="my-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-700">Pembeli belum bergabung. Anda dapat membagikan ulang tautan undangan:</p>
                 <input 
                    type="text" 
                    readOnly 
                    value={`${window.location.origin}/?inviteToken=${localTransaction.inviteToken}`} 
                    className="mt-2 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm bg-slate-100 sm:text-sm"
                />
                <ActionButton
                    href={whatsAppShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="success"
                    icon={<WhatsAppIcon />}
                    className="w-full mt-2"
                    size="sm"
                >
                    Bagikan Ulang ke WhatsApp
                </ActionButton>
            </div>
          )}

          <div className="space-y-1 text-sm">
            <p>ID Transaksi: <span className="font-mono text-xs text-slate-500">{localTransaction.id}</span></p>
            <p>Harga Barang: <span className="font-semibold">{formatCurrency(localTransaction.price)}</span></p>
            <p>Biaya Escrow: <span className="font-semibold">{formatCurrency(localTransaction.escrowFee)}</span></p>
            <p className="text-base font-bold">Total: <span className="text-blue-600">{formatCurrency(localTransaction.totalAmount)}</span></p>
          </div>

           {localTransaction.trackingInfo && (localTransaction.status === TransactionStatus.ITEM_SHIPPED || localTransaction.status === TransactionStatus.COMPLETED || localTransaction.status === TransactionStatus.DISPUTED ) && (
            <div className="mt-3">
              <p className="text-sm font-medium text-slate-700">Bukti Resi Pengiriman:</p>
              {localTransaction.trackingInfo.startsWith('data:image') ? (
                <img src={localTransaction.trackingInfo} alt="Resi Pengiriman" className="mt-1 rounded-md border border-slate-300 max-w-xs max-h-48 object-contain" />
              ) : (
                <p className="text-sm text-blue-600">{localTransaction.trackingInfo}</p> // Fallback for old text data
              )}
            </div>
          )}
          {localTransaction.paymentProof && localTransaction.status !== TransactionStatus.AWAITING_PAYMENT && localTransaction.status !== TransactionStatus.PENDING_BUYER_ACCEPTANCE && (
            <div className="mt-3">
              <p className="text-sm font-medium text-slate-700">Bukti Pembayaran:</p>
               {localTransaction.paymentProof.startsWith('data:image') ? (
                <img src={localTransaction.paymentProof} alt="Bukti Pembayaran" className="mt-1 rounded-md border border-slate-300 max-w-xs max-h-48 object-contain" />
              ) : (
                 <p className="text-sm text-green-600">{localTransaction.paymentProof} (Data Teks Lama)</p> // Fallback for old text data
              )}
            </div>
          )}
          {localTransaction.disputeReason && localTransaction.status === TransactionStatus.DISPUTED && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm font-medium text-red-700">Alasan Sengketa:</p>
                <p className="text-sm text-red-600">{localTransaction.disputeReason}</p>
            </div>
          )}
           <div className="text-xs text-slate-500 mt-3">
                <p>Dibuat: {formatDate(localTransaction.createdAt)}</p>
                <p>Diperbarui: {formatDate(localTransaction.updatedAt)}</p>
            </div>
        </div>

        {canPay && (
          <div className="p-4 border-t border-slate-200">
            <h5 className="font-semibold mb-2 text-slate-700">Lakukan Pembayaran</h5>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md mb-4">
                <p className="text-sm font-medium text-blue-800">Informasi Rekening Escrow {APP_NAME}:</p>
                <ul className="list-disc list-inside text-sm text-blue-700 mt-1">
                    <li>Bank: <strong>{ESCROW_ACCOUNT_INFO.bankName}</strong></li>
                    <li>Nomor Rekening: <strong>{ESCROW_ACCOUNT_INFO.accountNumber}</strong></li>
                    <li>Atas Nama: <strong>{ESCROW_ACCOUNT_INFO.accountHolder}</strong></li>
                </ul>
                <p className="text-sm text-red-600 font-semibold mt-2">
                    Mohon transfer sejumlah: <strong>{formatCurrency(localTransaction.totalAmount)}</strong>.
                </p>
                <p className="text-xs text-blue-700 mt-1">Pastikan jumlah transfer sesuai hingga digit terakhir untuk mempercepat proses verifikasi.</p>
            </div>

            <div className="mb-3">
                <label htmlFor="paymentProofUpload" className="block text-sm font-medium text-slate-700 mb-1">Upload Bukti Pembayaran (Wajib Gambar)</label>
                <input
                    type="file"
                    accept="image/*"
                    id="paymentProofUpload"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, 'payment')}
                    disabled={actionLoading}
                />
                <ActionButton
                    variant="ghost"
                    size="sm"
                    onClick={() => document.getElementById('paymentProofUpload')?.click()}
                    icon={<ArrowUpTrayIcon />}
                    className="w-full sm:w-auto"
                    disabled={actionLoading}
                >
                    Pilih Gambar Bukti Bayar
                </ActionButton>
                 {selectedPaymentProofFile && <span className="ml-2 text-sm text-slate-500 truncate max-w-[200px] inline-block align-middle">{selectedPaymentProofFile.name}</span>}
            </div>
            {paymentProofPreview && (
                <div className="mb-3 relative group w-fit">
                    <img src={paymentProofPreview} alt="Preview Bukti Bayar" className="rounded-md border border-slate-300 max-w-xs max-h-48 object-contain" />
                    <ActionButton
                        size="sm"
                        variant="danger"
                        onClick={() => removeImagePreview('payment')}
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity !p-1"
                        icon={<TrashIcon className="w-4 h-4"/>}
                        aria-label="Hapus bukti pembayaran"
                    />
                </div>
            )}
             <p className="text-xs text-slate-500 mb-3">Simulasi: Verifikasi akan otomatis setelah beberapa saat setelah Anda mengkonfirmasi.</p>
            <ActionButton 
                onClick={() => handleAction(() => onPay(localTransaction.id, currentUser.id, paymentProofPreview || ''))} 
                isLoading={actionLoading} 
                disabled={actionLoading || !paymentProofPreview} 
                icon={<CreditCardIcon/>}
            >
              Konfirmasi Pembayaran
            </ActionButton>
          </div>
        )}
        {canShip && (
          <div className="p-4 border-t border-slate-200">
            <h5 className="font-semibold mb-2 text-slate-700">Upload Bukti Resi Pengiriman (Wajib Gambar)</h5>
             <div className="mb-3">
                <label htmlFor="shippingReceiptUpload" className="block text-sm font-medium text-slate-700 mb-1 sr-only">Upload Resi Pengiriman</label>
                <input
                    type="file"
                    accept="image/*"
                    id="shippingReceiptUpload"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, 'shipping')}
                    disabled={actionLoading}
                />
                <ActionButton
                    variant="ghost"
                    size="sm"
                    onClick={() => document.getElementById('shippingReceiptUpload')?.click()}
                    icon={<ArrowUpTrayIcon />}
                    className="w-full sm:w-auto"
                    disabled={actionLoading}
                >
                    Pilih Gambar Resi
                </ActionButton>
                {selectedShippingReceiptFile && <span className="ml-2 text-sm text-slate-500 truncate max-w-[200px] inline-block align-middle">{selectedShippingReceiptFile.name}</span>}
            </div>
            {shippingReceiptPreview && (
                <div className="mb-3 relative group w-fit">
                    <img src={shippingReceiptPreview} alt="Preview Resi Pengiriman" className="rounded-md border border-slate-300 max-w-xs max-h-48 object-contain" />
                     <ActionButton
                        size="sm"
                        variant="danger"
                        onClick={() => removeImagePreview('shipping')}
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity !p-1"
                        icon={<TrashIcon className="w-4 h-4"/>}
                        aria-label="Hapus resi pengiriman"
                    />
                </div>
            )}
            <ActionButton 
                onClick={() => handleAction(() => onShip(localTransaction.id, currentUser.id, shippingReceiptPreview || ''))} 
                isLoading={actionLoading} 
                disabled={actionLoading || !shippingReceiptPreview} 
                icon={<PaperAirplaneIcon/>}
            >
              Kirim Barang & Simpan Resi
            </ActionButton>
          </div>
        )}
        {canDispute && (
          <div className="p-4 border-t border-slate-200">
            <h5 className="font-semibold mb-2 text-slate-700">Ajukan Sengketa</h5>
            <textarea
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="Jelaskan alasan sengketa Anda..."
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-2"
              disabled={actionLoading}
            />
            <ActionButton variant="warning" onClick={() => handleAction(() => onDispute(localTransaction.id, currentUser.id, disputeReason))} isLoading={actionLoading} disabled={actionLoading || !disputeReason.trim()} icon={<ExclamationTriangleIcon />}>
              Ajukan Sengketa
            </ActionButton>
          </div>
        )}

        {localTransaction.buyerId && localTransaction.status !== TransactionStatus.AWAITING_BUYER_CLAIM && (
            <div className="border-t border-slate-200 pt-4">
                <h5 className="font-semibold text-slate-700 mb-3 flex items-center">
                    <ChatBubbleLeftEllipsisIcon className="w-6 h-6 mr-2 text-blue-600"/>
                    Chat Transaksi
                </h5>
                {chatError && <Alert type="error" message={chatError} onClose={() => setChatError(null)} />}
                
                <div className="h-64 overflow-y-auto bg-slate-100 p-3 rounded-md border border-slate-200 mb-3 space-y-3">
                    {chatLoading && chatMessages.length === 0 && <LoadingSpinner size="sm" text="Memuat pesan..." />}
                    {!chatLoading && chatMessages.length === 0 && <p className="text-sm text-slate-500 text-center py-4">Belum ada pesan dalam transaksi ini.</p>}
                    {chatMessages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] p-3 rounded-lg shadow ${msg.senderId === currentUser.id ? 'bg-blue-500 text-white' : 'bg-white text-slate-700'}`}>
                                <p className="text-xs font-semibold mb-1">
                                    {msg.senderId === currentUser.id ? 'Anda' : msg.senderName}
                                </p>
                                <p className="text-sm whitespace-pre-wrap">{msg.messageText}</p>
                                <p className={`text-xs mt-1 ${msg.senderId === currentUser.id ? 'text-blue-200' : 'text-slate-400'} text-right`}>
                                    {formatDate(msg.timestamp)}
                                </p>
                            </div>
                        </div>
                    ))}
                    <div ref={chatMessagesEndRef} />
                </div>

                <div className="flex items-start space-x-2">
                    <textarea
                        value={newChatMessage}
                        onChange={(e) => setNewChatMessage(e.target.value)}
                        placeholder="Ketik pesan Anda..."
                        rows={2}
                        className="flex-grow mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        disabled={chatLoading || actionLoading}
                    />
                    <ActionButton
                        onClick={handleSendChatMessage}
                        isLoading={chatLoading && newChatMessage !== ""} 
                        disabled={chatLoading || actionLoading || !newChatMessage.trim()}
                        icon={<PaperAirplaneIcon />}
                        className="mt-1"
                    >
                        Kirim
                    </ActionButton>
                </div>
            </div>
        )}
        {localTransaction.status === TransactionStatus.AWAITING_BUYER_CLAIM && (
             <div className="border-t border-slate-200 pt-4 text-center text-slate-500">
                <ChatBubbleLeftEllipsisIcon className="w-8 h-8 mx-auto mb-2 text-slate-400"/>
                Fitur chat akan tersedia setelah pembeli bergabung dan menerima transaksi.
            </div>
        )}

        <div className="flex flex-wrap justify-end gap-3 pt-6 border-t border-slate-200">
          {canAccept && (
            <ActionButton variant="success" onClick={() => handleAction(() => onAccept(localTransaction.id, currentUser.id))} isLoading={actionLoading} disabled={actionLoading} icon={<CheckCircleIcon />}>
              Setujui Transaksi
            </ActionButton>
          )}
          {canConfirmReceipt && (
            <ActionButton variant="success" onClick={() => handleAction(() => onConfirmReceipt(localTransaction.id, currentUser.id))} isLoading={actionLoading} disabled={actionLoading} icon={<CheckCircleIcon />}>
              Konfirmasi Penerimaan
            </ActionButton>
          )}
          {canCancelUser && (
             <ActionButton variant="danger" onClick={() => handleAction(() => onCancel(localTransaction.id, currentUser.id))} isLoading={actionLoading} disabled={actionLoading} icon={<CancelIcon />}>
              Batalkan Transaksi
            </ActionButton>
          )}
          <ActionButton variant="ghost" onClick={onClose} disabled={actionLoading}>
            Tutup
          </ActionButton>
        </div>
      </div>
    </Modal>
  );
};

export default TransactionDetailModal;