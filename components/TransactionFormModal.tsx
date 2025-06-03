
import React, { useState, useEffect, useCallback } from 'react';
import { User, Transaction, TransactionStatus } from '../types';
import { calculateEscrowFee, formatCurrency, ESCROW_FEE_PERCENTAGE, MIN_ESCROW_FEE, MAX_ESCROW_FEE, APP_NAME, WhatsAppIcon } from '../constants';
import { authService } from '../services/escrowService'; 
import Modal from './Modal';
import ActionButton from './ActionButton';
import Alert from './Alert';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onCreateTransaction: (
    sellerId: string,
    buyerId: string | null, // Can be null if inviting
    buyerNameForInvite: string | undefined, // Name for invite
    itemName: string,
    itemDescription: string,
    price: number
  ) => Promise<Transaction | null>;
}

type BuyerMode = 'select_existing' | 'invite_new';

const TransactionFormModal: React.FC<TransactionFormModalProps> = ({ isOpen, onClose, currentUser, onCreateTransaction }) => {
  const [buyerMode, setBuyerMode] = useState<BuyerMode>('select_existing');
  const [selectedBuyerId, setSelectedBuyerId] = useState('');
  const [invitedBuyerName, setInvitedBuyerName] = useState('');

  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [price, setPrice] = useState('');
  const [escrowFee, setEscrowFee] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  
  const [error, setError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [availableBuyers, setAvailableBuyers] = useState<User[]>([]);

  // For sharing invite
  const [showShareSection, setShowShareSection] = useState(false);
  const [shareableLink, setShareableLink] = useState('');
  const [whatsAppMessage, setWhatsAppMessage] = useState('');
  const [createdTransactionId, setCreatedTransactionId] = useState<string | null>(null);


  const resetFormState = useCallback(() => {
    setBuyerMode('select_existing');
    setSelectedBuyerId('');
    setInvitedBuyerName('');
    setItemName('');
    setItemDescription('');
    setPrice('');
    setError(null);
    setShowShareSection(false);
    setShareableLink('');
    setWhatsAppMessage('');
    setCreatedTransactionId(null);
    // escrowFee and totalAmount will reset based on price
  }, []);

  const fetchAvailableBuyers = useCallback(async () => {
    if (currentUser) {
      setFormLoading(true); // Consider a more specific loading for buyer list
      try {
        const users = await authService.getAllOtherUsers(currentUser.id);
        setAvailableBuyers(users);
      } catch (err) {
        console.error("Failed to fetch buyers:", err);
        setError("Gagal memuat daftar pembeli.");
      } finally {
        setFormLoading(false);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (isOpen) {
      resetFormState();
      fetchAvailableBuyers();
    }
  }, [isOpen, fetchAvailableBuyers, resetFormState]);

  useEffect(() => {
    if (price) {
      const numPrice = parseFloat(price);
      if (!isNaN(numPrice) && numPrice > 0) {
        const fee = calculateEscrowFee(numPrice);
        setEscrowFee(fee);
        setTotalAmount(numPrice + fee);
      } else {
        setEscrowFee(0);
        setTotalAmount(0);
      }
    } else {
      setEscrowFee(0);
      setTotalAmount(0);
    }
  }, [price]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShowShareSection(false);
    
    const numPrice = parseFloat(price);
    if (buyerMode === 'select_existing' && !selectedBuyerId) {
      setError('Harap pilih pembeli dari daftar.');
      return;
    }
    if (buyerMode === 'invite_new' && !invitedBuyerName.trim()) {
      setError('Harap masukkan nama pembeli untuk undangan.');
      return;
    }
    if (!itemName.trim() || !itemDescription.trim() || isNaN(numPrice) || numPrice <= 0) {
      setError('Harap isi nama barang/jasa, deskripsi, dan harga dengan benar. Harga harus lebih dari 0.');
      return;
    }

    setFormLoading(true);
    const buyerIdToSubmit = buyerMode === 'select_existing' ? selectedBuyerId : null;
    const buyerNameToSubmit = buyerMode === 'invite_new' ? invitedBuyerName.trim() : undefined;

    const result = await onCreateTransaction(
        currentUser.id, 
        buyerIdToSubmit, 
        buyerNameToSubmit, 
        itemName.trim(), 
        itemDescription.trim(), 
        numPrice
    );
    setFormLoading(false);

    if (result) {
      setCreatedTransactionId(result.id);
      if (result.status === TransactionStatus.AWAITING_BUYER_CLAIM && result.inviteToken && result.buyerNameForInvite) {
        const appBaseUrl = window.location.origin;
        const link = `${appBaseUrl}/?inviteToken=${result.inviteToken}`;
        setShareableLink(link);
        const message = `Halo ${result.buyerNameForInvite},\n\n${currentUser.name} telah mengundang Anda untuk melakukan transaksi aman di ${APP_NAME} untuk barang/jasa "${result.itemName}".\n\nKlik tautan ini untuk melihat detail dan melanjutkan: ${link}\n\nTerima kasih!`;
        setWhatsAppMessage(encodeURIComponent(message));
        setShowShareSection(true);
        // Don't close modal, show share section instead
      } else {
        onClose(); // Close for non-invite transactions or if invite setup failed to return token
      }
    }
    // Errors from onCreateTransaction will be handled by useEscrow hook and displayed in App.tsx
  };
  
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) { // Allow only numbers and a single decimal point
        setPrice(value);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(shareableLink)
      .then(() => alert('Tautan berhasil disalin!'))
      .catch(err => console.error('Gagal menyalin tautan: ', err));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={showShareSection ? "Bagikan Undangan Transaksi" : "Buat Transaksi Baru"} size="lg">
      {!showShareSection ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mode Pembeli</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input type="radio" name="buyerMode" value="select_existing" checked={buyerMode === 'select_existing'} onChange={() => setBuyerMode('select_existing')} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-slate-300"/>
                <span className="ml-2 text-sm text-slate-700">Pilih Pembeli Terdaftar</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="buyerMode" value="invite_new" checked={buyerMode === 'invite_new'} onChange={() => setBuyerMode('invite_new')} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-slate-300"/>
                <span className="ml-2 text-sm text-slate-700">Undang Pembeli Baru</span>
              </label>
            </div>
          </div>

          {buyerMode === 'select_existing' && (
            <div>
              <label htmlFor="selectedBuyerId" className="block text-sm font-medium text-slate-700 mb-1">
                Pembeli Terdaftar
              </label>
              <select
                id="selectedBuyerId"
                value={selectedBuyerId}
                onChange={(e) => setSelectedBuyerId(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required={buyerMode === 'select_existing'}
                disabled={formLoading && availableBuyers.length === 0}
              >
                <option value="" disabled>Pilih Pembeli</option>
                {availableBuyers.map(user => (
                  <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                ))}
                {availableBuyers.length === 0 && <option disabled>Tidak ada pengguna lain terdaftar</option>}
              </select>
            </div>
          )}

          {buyerMode === 'invite_new' && (
            <div>
              <label htmlFor="invitedBuyerName" className="block text-sm font-medium text-slate-700">
                Nama Pembeli (untuk Undangan)
              </label>
              <input
                type="text"
                id="invitedBuyerName"
                value={invitedBuyerName}
                onChange={(e) => setInvitedBuyerName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Nama yang akan muncul di undangan"
                required={buyerMode === 'invite_new'}
                maxLength={100}
              />
               <p className="text-xs text-slate-500 mt-1">Pembeli akan diminta mendaftar atau login saat membuka tautan undangan.</p>
            </div>
          )}

          <div>
            <label htmlFor="itemName" className="block text-sm font-medium text-slate-700">
              Nama Barang/Jasa
            </label>
            <input
              type="text"
              id="itemName"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
              maxLength={100}
            />
          </div>

          <div>
            <label htmlFor="itemDescription" className="block text-sm font-medium text-slate-700">
              Deskripsi Barang/Jasa
            </label>
            <textarea
              id="itemDescription"
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
              maxLength={500}
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-slate-700">
              Harga Barang/Jasa (IDR)
            </label>
            <input
              type="text" 
              id="price"
              value={price}
              onChange={handlePriceChange}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Contoh: 1000000"
              required
              pattern="^\d*\.?\d*$"
            />
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm">
              <p>Biaya Escrow ({ESCROW_FEE_PERCENTAGE*100}%): <span className="font-semibold">{formatCurrency(escrowFee)}</span></p>
              <p className="text-xs text-slate-500">(Min: {formatCurrency(MIN_ESCROW_FEE)}, Maks: {formatCurrency(MAX_ESCROW_FEE)})</p>
              <p className="mt-1 text-base font-bold">Total yang akan dibayar Pembeli: <span className="text-blue-600">{formatCurrency(totalAmount)}</span></p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <ActionButton type="button" variant="ghost" onClick={onClose} disabled={formLoading}>
              Batal
            </ActionButton>
            <ActionButton 
              type="submit" 
              variant="primary" 
              isLoading={formLoading} 
              disabled={formLoading || totalAmount <= 0 || (buyerMode === 'select_existing' && !selectedBuyerId) || (buyerMode === 'invite_new' && !invitedBuyerName.trim())}
            >
              {buyerMode === 'invite_new' ? 'Buat & Dapatkan Tautan Undangan' : 'Buat Transaksi'}
            </ActionButton>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
            <Alert type="success" message={`Transaksi (ID: ${createdTransactionId || 'N/A'}) untuk "${itemName}" telah berhasil dibuat dan menunggu pembeli bergabung.`}/>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tautan Undangan untuk Pembeli:</label>
                <div className="flex items-center space-x-2">
                    <input 
                        type="text" 
                        readOnly 
                        value={shareableLink} 
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm bg-slate-50 sm:text-sm"
                    />
                    <ActionButton variant="secondary" size="sm" onClick={handleCopyToClipboard}>Salin</ActionButton>
                </div>
            </div>
            <div>
                <ActionButton
                    href={`https://wa.me/?text=${whatsAppMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="success"
                    icon={<WhatsAppIcon />}
                    className="w-full"
                >
                    Bagikan ke WhatsApp
                </ActionButton>
            </div>
            <p className="text-sm text-slate-600">
                Bagikan tautan di atas kepada <strong>{invitedBuyerName}</strong>. Mereka akan diminta untuk mendaftar atau login ke {APP_NAME} untuk melihat dan menerima transaksi ini.
            </p>
             <div className="flex justify-end pt-4">
                <ActionButton variant="primary" onClick={onClose}>
                    Selesai & Tutup
                </ActionButton>
            </div>
        </div>
      )}
    </Modal>
  );
};

export default TransactionFormModal;
