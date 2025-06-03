import React from 'react';
import { User, Transaction, TransactionStatus, ChatMessage } from './types';

export const APP_NAME = "REKBERAN";

// --- New App Logo Icon ---
export const AppLogoIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    {/* Shield Shape (base from original ShieldCheckIcon, but without the checkmark path explicitly here) */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.598 6A11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    {/* Simplified Money Symbol (Coin with vertical lines) */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5v1.5m0 6v1.5" />
  </svg>
);

// --- IKON TETAP SAMA ---
export const ShieldCheckIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
  </svg>
);

export const UsersIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-3.741-5.15M12 15.75a3 3 0 0 1-3-3A3 3 0 0 1 12 9.75v1.5a1.5 1.5 0 0 1-3 0m-3-3A3 3 0 0 1 6 3.75m0 0A3 3 0 0 1 3 6.75M12 3v13.5m0-13.5A3 3 0 0 1 9 6.75M12 3a3 3 0 0 0-3 3.75m9-.75a3 3 0 0 1-3 3A3 3 0 0 1 12 9.75M15 3.75A3 3 0 0 0 12 6.75m0 0v1.5m0 0a3 3 0 0 0 3 3m0 0M12 9.75v1.5" />
  </svg>
);

export const ArrowPathIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

export const PlusCircleIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

export const EyeIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

export const XCircleIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

export const CheckCircleIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

export const ExclamationTriangleIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.008v.008H12v-.008Z" />
  </svg>
);

export const PaperAirplaneIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
</svg>
);

export const CreditCardIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
  </svg>
);

export const ArrowRightOnRectangleIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => ( // Login Icon
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
  </svg>
);

export const UserPlusIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => ( // Register Icon
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3.375 19.5h17.25c.621 0 1.125-.504 1.125-1.125V6.375c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125Z" />
  </svg>
);

export const ChatBubbleLeftEllipsisIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-3.861 8.25-8.625 8.25C7.861 20.25 4 16.556 4 12s3.861-8.25 8.625-8.25C17.139 3.75 21 7.444 21 12Z" />
  </svg>
);

export const GoogleIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    <path d="M1 1h22v22H1z" fill="none"/>
  </svg>
);

export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.33 3.43 16.79L2 22L7.32 20.61C8.75 21.38 10.36 21.82 12.04 21.82C17.5 21.82 21.95 17.37 21.95 11.91C21.95 6.45 17.5 2 12.04 2ZM16.64 14.87C16.41 15.39 15.36 16.01 14.99 16.08C14.61 16.14 14.13 16.21 12.04 15.4C10.43 14.78 9.08 13.33 8.94 13.13C8.8 12.92 7.94 11.8 7.94 10.86C7.94 9.92 8.41 9.48 8.63 9.26C8.84 9.04 9.11 8.99 9.31 8.99C9.51 8.99 9.68 8.99 9.83 9.01C9.99 9.04 10.11 9.03 10.26 9.34C10.45 9.71 10.92 10.91 10.99 11.03C11.06 11.15 11.11 11.23 11.01 11.36C10.91 11.49 10.85 11.54 10.68 11.71C10.52 11.87 10.37 12.01 10.24 12.11C10.11 12.21 9.96 12.31 10.07 12.5C10.18 12.69 10.75 13.46 11.51 14.12C12.49 14.98 13.31 15.24 13.53 15.34C13.75 15.44 13.98 15.43 14.16 15.21C14.36 15 14.72 14.45 14.93 14.13C15.13 13.81 15.37 13.76 15.62 13.86C15.87 13.95 17.11 14.57 17.35 14.69C17.59 14.81 17.75 14.86 17.81 14.95C17.88 15.04 17.88 15.43 17.64 15.87L16.64 14.87Z"/>
  </svg>
);


export const PlusIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

export const TrashIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c1.153 0 2.242.078 3.223.225m6.937 0c-.6.166-1.243.29-1.888.397M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c1.153 0 2.242.078 3.223.225m6.937 0c-.6.166-1.243.29-1.888.397" />
  </svg>
);

export const ArrowUpTrayIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
  </svg>
);

export const PhotoIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
  </svg>
);


// NOTE: Passwords are in plaintext for simulation ONLY. In production, use hashed passwords.
export const INITIAL_USERS: User[] = [
  { id: 'user1', name: 'Budi Martami', email: 'budi@example.com', password: 'password123', avatar: 'https://picsum.photos/seed/user1/100/100' },
  { id: 'user2', name: 'Siti Aminah', email: 'siti@example.com', password: 'password123', avatar: 'https://picsum.photos/seed/user2/100/100' },
  { id: 'user3', name: 'Agus Wibowo', email: 'agus@example.com', password: 'password123', avatar: 'https://picsum.photos/seed/user3/100/100' },
  { id: 'user4', name: 'Dewi Lestari', email: 'dewi@example.com', password: 'password123', avatar: 'https://picsum.photos/seed/user4/100/100' },
];

export const calculateEscrowFee = (price: number): number => {
  const fee = price * 0.025;
  return Math.max(5000, Math.min(fee, 100000));
};


export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'txn1',
    seller: INITIAL_USERS[0], // Budi
    buyerId: INITIAL_USERS[1].id,  // Siti
    buyer: INITIAL_USERS[1],
    itemName: 'Laptop Gaming High-End',
    itemDescription: 'Laptop gaming dengan spesifikasi terbaru, RTX 4080, Intel i9, RAM 32GB.',
    price: 25000000,
    escrowFee: calculateEscrowFee(25000000),
    totalAmount: 25000000 + calculateEscrowFee(25000000),
    status: TransactionStatus.PENDING_BUYER_ACCEPTANCE,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'txn2',
    seller: INITIAL_USERS[2], // Agus
    buyerId: INITIAL_USERS[0].id,  // Budi
    buyer: INITIAL_USERS[0],
    itemName: 'Kamera Mirrorless Pro',
    itemDescription: 'Kamera Sony Alpha A7IV, kondisi mulus, lengkap dengan lensa kit.',
    price: 18000000,
    escrowFee: calculateEscrowFee(18000000),
    totalAmount: 18000000 + calculateEscrowFee(18000000),
    status: TransactionStatus.AWAITING_PAYMENT,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'txn3',
    seller: INITIAL_USERS[1], // Siti
    buyerId: INITIAL_USERS[3].id,  // Dewi
    buyer: INITIAL_USERS[3],
    itemName: 'Jasa Desain Logo Profesional',
    itemDescription: 'Pembuatan desain logo untuk perusahaan startup, termasuk 3 revisi.',
    price: 1500000,
    escrowFee: calculateEscrowFee(1500000),
    totalAmount: 1500000 + calculateEscrowFee(1500000),
    status: TransactionStatus.FUNDS_HELD,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
   {
    id: 'txn4',
    seller: INITIAL_USERS[3], // Dewi
    buyerId: INITIAL_USERS[0].id,  // Budi
    buyer: INITIAL_USERS[0],
    itemName: 'Smartphone Bekas Flagship',
    itemDescription: 'Samsung Galaxy S22 Ultra, 256GB, warna hitam, garansi resmi sisa 3 bulan.',
    price: 9500000,
    escrowFee: calculateEscrowFee(9500000),
    totalAmount: 9500000 + calculateEscrowFee(9500000),
    status: TransactionStatus.ITEM_SHIPPED,
    trackingInfo: "JNEXPRESS-123456789", // This will now be an image data URL after user uploads
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), 
  },
  {
    id: 'txn5',
    seller: INITIAL_USERS[0], // Budi
    buyerId: INITIAL_USERS[2].id,  // Agus
    buyer: INITIAL_USERS[2],
    itemName: 'Konsultasi Strategi Marketing',
    itemDescription: 'Sesi konsultasi 2 jam untuk strategi marketing digital.',
    price: 2000000,
    escrowFee: calculateEscrowFee(2000000),
    totalAmount: 2000000 + calculateEscrowFee(2000000),
    status: TransactionStatus.COMPLETED,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 
    updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
  },
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
    {
        id: 'chatmsg1',
        transactionId: 'txn1', // For Laptop Gaming High-End
        senderId: 'user1', // Budi (Seller)
        senderName: 'Budi Martami',
        messageText: 'Halo Siti, barang sudah siap saya kirim ya. Apakah alamatnya sudah sesuai?',
        timestamp: new Date(Date.now() - (2 * 24 * 60 * 60 * 1000) + (1 * 60 * 60 * 1000)), // 1 hour after txn created
    },
    {
        id: 'chatmsg2',
        transactionId: 'txn1',
        senderId: 'user2', // Siti (Buyer)
        senderName: 'Siti Aminah',
        messageText: 'Halo Budi, iya alamat sudah benar. Ditunggu ya!',
        timestamp: new Date(Date.now() - (2 * 24 * 60 * 60 * 1000) + (2 * 60 * 60 * 1000)), // 2 hours after txn created
    }
];


export const ESCROW_FEE_PERCENTAGE = 0.025; // 2.5%
export const MIN_ESCROW_FEE = 5000;
export const MAX_ESCROW_FEE = 100000;

export function formatCurrency(amount: number, currency = 'IDR') {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string, includeTime = true) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  return d.toLocaleDateString('id-ID', options);
}


export const ESCROW_ACCOUNT_INFO = {
  bankName: "BCA",
  accountNumber: "6760308500",
  accountHolder: "Restu Andrie Julian"
};
