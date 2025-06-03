
export interface User {
  id: string;
  name: string;
  email: string; // Added: Email for login, should be unique
  password?: string; // Added: Password for login (optional for existing data, required for new)
  avatar?: string; // URL to avatar image
}

export enum TransactionStatus {
  PENDING_BUYER_ACCEPTANCE = 'Menunggu Persetujuan Pembeli',
  AWAITING_PAYMENT = 'Menunggu Pembayaran',
  PAYMENT_VERIFICATION = 'Verifikasi Pembayaran',
  FUNDS_HELD = 'Dana Ditahan - Menunggu Pengiriman',
  ITEM_SHIPPED = 'Barang Dikirim - Menunggu Konfirmasi',
  COMPLETED = 'Selesai',
  DISPUTED = 'Dalam Sengketa',
  CANCELLED = 'Dibatalkan',
  PAYMENT_REJECTED = 'Pembayaran Ditolak',
  REFUNDED = 'Dana Dikembalikan',
  AWAITING_BUYER_CLAIM = 'Menunggu Pembeli Bergabung' // New status
}

export interface Transaction {
  id: string;
  seller: User;
  buyerId: string | null; // Can be null if buyer is invited
  buyer?: User | null; // Populated when buyer is known or claims invite
  buyerNameForInvite?: string; // Name provided by seller for an invited buyer
  inviteToken?: string; // Token for invited buyer to claim the transaction
  itemName: string;
  itemDescription: string;
  price: number;
  escrowFee: number; // Calculated fee
  totalAmount: number; // price + escrowFee
  status: TransactionStatus;
  createdAt: Date;
  updatedAt: Date;
  trackingInfo?: string;
  disputeReason?: string;
  paymentProof?: string; // URL or identifier for payment proof
  resolutionDetails?: string;
}

export type TransactionUpdatePayload = Partial<Omit<Transaction, 'id' | 'seller' | 'createdAt' | 'escrowFee' | 'totalAmount'>>;

export interface ChatMessage {
  id: string;
  transactionId: string;
  senderId: string;
  senderName: string; // For easier display, denormalized
  messageText: string;
  timestamp: Date;
}
