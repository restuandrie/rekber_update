
import { Transaction, TransactionStatus, User, TransactionUpdatePayload, ChatMessage } from '../types';
import { INITIAL_TRANSACTIONS, INITIAL_USERS, calculateEscrowFee, INITIAL_CHAT_MESSAGES } from '../constants';

// Simulate a mutable user database, initialized with INITIAL_USERS
let usersDB: User[] = JSON.parse(JSON.stringify(INITIAL_USERS)); // Deep copy
let transactionsStore: Transaction[] = JSON.parse(JSON.stringify(INITIAL_TRANSACTIONS.map(tx => ({...tx, buyer: usersDB.find(u => u.id === tx.buyerId) || null })))); // Deep copy with buyer object populated
let chatMessagesStore: ChatMessage[] = JSON.parse(JSON.stringify(INITIAL_CHAT_MESSAGES)); // Deep copy for chat messages


const simulateDelay = <T,>(data: T, delay = 500): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(data), delay));

const generateToken = () => `token_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

// --- Auth Service Functions ---
export const authService = {
  async registerUser(name: string, email: string, password_plaintext: string): Promise<User> {
    await simulateDelay(null, 200); // Simulate network latency
    if (usersDB.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Email sudah terdaftar.');
    }
    const newUser: User = {
      id: `user${Date.now()}${Math.random().toString(16).slice(2)}`,
      name,
      email: email.toLowerCase(),
      password: password_plaintext, 
      avatar: `https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=random&color=fff`,
    };
    usersDB.push(newUser);
    return newUser;
  },

  async loginUser(email: string, password_plaintext: string): Promise<User> {
    await simulateDelay(null, 200);
    const user = usersDB.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error('Email tidak ditemukan.');
    }
    if (user.password !== password_plaintext) {
      throw new Error('Password salah.');
    }
    return user;
  },

  async signInWithGoogleMock(): Promise<User> {
    await simulateDelay(null, 300);
    const googleEmail = window.prompt("Simulasi Google Sign-In:\nMasukkan alamat email Google Anda:");
    if (!googleEmail) {
      throw new Error("Login dengan Google dibatalkan.");
    }
    let user = usersDB.find(u => u.email.toLowerCase() === googleEmail.toLowerCase());
    if (user) {
      // Simulate Google login for existing user
      if (!user.password) { // If user was created via Google before, they might not have a password
        user.password = "google_mock_password"; // Assign a mock password
      }
      return user;
    } else {
      // Simulate new user registration via Google
      const nameFromEmail = googleEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const newUser: User = {
        id: `user${Date.now()}${Math.random().toString(16).slice(2)}`,
        name: nameFromEmail || "Pengguna Google",
        email: googleEmail.toLowerCase(),
        password: "google_mock_password", // Mock password for internal consistency
        avatar: `https://ui-avatars.com/api/?name=${(nameFromEmail || "G").replace(' ', '+')}&background=random&color=fff&length=2`,
      };
      usersDB.push(newUser);
      return newUser;
    }
  },

  async getUserById(userId: string): Promise<User | undefined> {
    await simulateDelay(null, 100);
    return usersDB.find(u => u.id === userId);
  },
  
  async getAllOtherUsers(currentUserId: string): Promise<User[]> {
    await simulateDelay(null,100);
    return usersDB.filter(u => u.id !== currentUserId);
  },

  async deleteUser(userIdToDelete: string): Promise<void> {
    await simulateDelay(null, 300);
    const isUserInvolvedAsBuyerOrSeller = transactionsStore.some(
      tx => (tx.buyerId === userIdToDelete) || tx.seller.id === userIdToDelete
    );

    if (isUserInvolvedAsBuyerOrSeller) {
      throw new Error('Pengguna tidak dapat dihapus karena terlibat dalam transaksi aktif atau sebelumnya sebagai pembeli atau penjual.');
    }
    
    const initialLength = usersDB.length;
    usersDB = usersDB.filter(user => user.id !== userIdToDelete);

    if (usersDB.length === initialLength) {
        throw new Error('Pengguna tidak ditemukan atau tidak dapat dihapus.');
    }
  }
};

// --- Transaction Service Functions ---
export const transactionService = {
  async getTransactionsForUser(userId: string): Promise<Transaction[]> {
    const userTransactions = transactionsStore.filter(
      tx => tx.seller.id === userId || tx.buyerId === userId
    ).map(tx => ({
      ...tx,
      buyer: tx.buyerId ? usersDB.find(u => u.id === tx.buyerId) || null : null,
    }));
    return simulateDelay(userTransactions.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  },

  async getTransactionById(id: string): Promise<Transaction | undefined> {
    let transaction = transactionsStore.find(tx => tx.id === id);
    if (transaction && transaction.buyerId && !transaction.buyer) {
        transaction.buyer = usersDB.find(u => u.id === transaction.buyerId) || null;
    }
    return simulateDelay(transaction);
  },
  
  async createTransaction(
    sellerId: string,
    buyerId: string | null, 
    buyerNameForInvite: string | undefined,
    itemName: string,
    itemDescription: string,
    price: number
  ): Promise<Transaction> {
    const seller = await authService.getUserById(sellerId);
    if (!seller) {
      throw new Error('Penjual tidak ditemukan.');
    }

    const escrowFee = calculateEscrowFee(price);
    const totalAmount = price + escrowFee;
    let newTransaction: Transaction;

    if (buyerId) { // Existing buyer selected
        const buyer = await authService.getUserById(buyerId);
        if (!buyer) {
            throw new Error('Pembeli tidak ditemukan.');
        }
        if (seller.id === buyer.id) {
            throw new Error('Penjual dan Pembeli tidak boleh orang yang sama.');
        }
        newTransaction = {
            id: `txn${Date.now()}${Math.random().toString(16).slice(2)}`,
            seller,
            buyerId: buyer.id,
            buyer,
            itemName,
            itemDescription,
            price,
            escrowFee,
            totalAmount,
            status: TransactionStatus.PENDING_BUYER_ACCEPTANCE,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    } else if (buyerNameForInvite) { // New buyer invited
        newTransaction = {
            id: `txn${Date.now()}${Math.random().toString(16).slice(2)}`,
            seller,
            buyerId: null, // Buyer not yet known/claimed
            buyer: null,
            buyerNameForInvite,
            inviteToken: generateToken(),
            itemName,
            itemDescription,
            price,
            escrowFee,
            totalAmount,
            status: TransactionStatus.AWAITING_BUYER_CLAIM,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    } else {
        throw new Error("Informasi pembeli tidak lengkap untuk membuat transaksi.");
    }

    transactionsStore.unshift(newTransaction);
    return simulateDelay(newTransaction);
  },
  
  async claimTransactionInvite(inviteToken: string, claimingUserId: string): Promise<Transaction> {
    const transactionIndex = transactionsStore.findIndex(
        tx => tx.inviteToken === inviteToken && tx.status === TransactionStatus.AWAITING_BUYER_CLAIM && tx.buyerId === null
    );
    if (transactionIndex === -1) {
        throw new Error('Undangan transaksi tidak valid, sudah diklaim, atau kedaluwarsa.');
    }
    const claimingUser = await authService.getUserById(claimingUserId);
    if (!claimingUser) {
        throw new Error('Pengguna yang mencoba mengklaim tidak ditemukan.');
    }
    if (transactionsStore[transactionIndex].seller.id === claimingUserId) {
        throw new Error('Anda tidak dapat mengklaim undangan transaksi yang Anda buat sendiri.');
    }

    transactionsStore[transactionIndex] = {
        ...transactionsStore[transactionIndex],
        buyerId: claimingUser.id,
        buyer: claimingUser,
        status: TransactionStatus.PENDING_BUYER_ACCEPTANCE,
        inviteToken: undefined, // Clear token after claim
        buyerNameForInvite: undefined, // Clear invite name
        updatedAt: new Date(),
    };
    return simulateDelay({...transactionsStore[transactionIndex]});
  },

  async updateTransaction(id: string, payload: TransactionUpdatePayload): Promise<Transaction> {
    const index = transactionsStore.findIndex(tx => tx.id === id);
    if (index === -1) {
      throw new Error('Transaksi tidak ditemukan.');
    }
    
    // If buyerId is in payload, ensure buyer object is also updated/fetched
    if (payload.buyerId && !payload.buyer) {
        const buyerUser = await authService.getUserById(payload.buyerId);
        if (!buyerUser) throw new Error("Buyer user not found for update.");
        payload.buyer = buyerUser;
    }


    transactionsStore[index] = {
      ...transactionsStore[index],
      ...payload,
      updatedAt: new Date(),
    };
    return simulateDelay({...transactionsStore[index]}); // Return a copy
  },
  
  async acceptTransaction(transactionId: string, userId: string): Promise<Transaction> {
    const tx = await this.getTransactionById(transactionId);
    if (!tx || tx.buyerId !== userId || tx.status !== TransactionStatus.PENDING_BUYER_ACCEPTANCE) {
      throw new Error('Tidak dapat menyetujui transaksi. Pengguna, status, atau transaksi tidak valid.');
    }
    return this.updateTransaction(transactionId, { status: TransactionStatus.AWAITING_PAYMENT });
  },

  async makePayment(transactionId: string, userId: string, paymentProof: string): Promise<Transaction> {
    const txInitial = await this.getTransactionById(transactionId);
    if (!txInitial || txInitial.buyerId !== userId || txInitial.status !== TransactionStatus.AWAITING_PAYMENT) {
      throw new Error('Tidak dapat melakukan pembayaran untuk transaksi ini pada status saat ini.');
    }

    await this.updateTransaction(transactionId, { status: TransactionStatus.PAYMENT_VERIFICATION, paymentProof });
    
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const currentTx = await this.getTransactionById(transactionId);
          if (currentTx && currentTx.status === TransactionStatus.PAYMENT_VERIFICATION) {
             const verifiedTx = await this.updateTransaction(transactionId, { status: TransactionStatus.FUNDS_HELD });
             resolve(verifiedTx);
          } else if (currentTx) { 
            resolve(currentTx); 
          } else {
            throw new Error("Transaksi tidak ditemukan saat verifikasi pembayaran.");
          }
        } catch (error) {
          console.error("Error during payment verification timeout:", error);
          try {
            // Attempt to revert or mark as rejected only if it's still in PAYMENT_VERIFICATION
            const txToReject = await this.getTransactionById(transactionId);
            if (txToReject && txToReject.status === TransactionStatus.PAYMENT_VERIFICATION) {
                 const rejectedTx = await this.updateTransaction(transactionId, { status: TransactionStatus.PAYMENT_REJECTED, resolutionDetails: "Verifikasi otomatis gagal." });
                 resolve(rejectedTx);
            } else if (txToReject) { // If status changed by another action, resolve with current
                resolve(txToReject);
            } else {
                 reject(error); // If transaction somehow disappeared
            }
          } catch (revertError) {
            console.error("Error trying to set payment as rejected:", revertError);
            reject(error); 
          }
        }
      }, 2000); 
    });
  },

  async markAsShipped(transactionId: string, userId: string, trackingInfo: string): Promise<Transaction> {
    const tx = await this.getTransactionById(transactionId);
    if (!tx || tx.seller.id !== userId || tx.status !== TransactionStatus.FUNDS_HELD) {
      throw new Error('Tidak dapat menandai sebagai terkirim. Pengguna, status, atau transaksi tidak valid.');
    }
    return this.updateTransaction(transactionId, { status: TransactionStatus.ITEM_SHIPPED, trackingInfo });
  },

  async confirmReceipt(transactionId: string, userId: string): Promise<Transaction> {
    const tx = await this.getTransactionById(transactionId);
    if (!tx || tx.buyerId !== userId || tx.status !== TransactionStatus.ITEM_SHIPPED) {
      throw new Error('Tidak dapat mengkonfirmasi penerimaan. Pengguna, status, atau transaksi tidak valid.');
    }
    return this.updateTransaction(transactionId, { status: TransactionStatus.COMPLETED });
  },

  async cancelTransaction(transactionId: string, userId: string): Promise<Transaction> {
    const tx = await this.getTransactionById(transactionId);
    if (!tx) throw new Error('Transaksi tidak ditemukan.');
    
    // Seller can cancel if AWAITING_BUYER_CLAIM or PENDING_BUYER_ACCEPTANCE or AWAITING_PAYMENT
    // Buyer can cancel if PENDING_BUYER_ACCEPTANCE or AWAITING_PAYMENT (if they are the buyer)
    let canCancel = false;
    if (tx.seller.id === userId && 
        (tx.status === TransactionStatus.AWAITING_BUYER_CLAIM || 
         tx.status === TransactionStatus.PENDING_BUYER_ACCEPTANCE || 
         tx.status === TransactionStatus.AWAITING_PAYMENT)) {
        canCancel = true;
    } else if (tx.buyerId === userId && 
        (tx.status === TransactionStatus.PENDING_BUYER_ACCEPTANCE || 
         tx.status === TransactionStatus.AWAITING_PAYMENT)) {
        canCancel = true;
    }

    if (!canCancel) {
         throw new Error(`Transaksi dalam status '${tx.status}' tidak dapat dibatalkan oleh Anda pada tahap ini.`);
    }
    return this.updateTransaction(transactionId, { status: TransactionStatus.CANCELLED });
  },

  async raiseDispute(transactionId: string, userId: string, reason: string): Promise<Transaction> {
    const tx = await this.getTransactionById(transactionId);
    if (!tx) throw new Error('Transaksi tidak ditemukan.');
    if (tx.buyerId !== userId) { 
        throw new Error('Hanya pembeli yang dapat mengajukan sengketa untuk transaksi ini saat ini.');
    }
    if (tx.status !== TransactionStatus.ITEM_SHIPPED && tx.status !== TransactionStatus.FUNDS_HELD && tx.status !== TransactionStatus.COMPLETED) {
        throw new Error(`Tidak dapat mengajukan sengketa untuk transaksi dalam status '${tx.status}'.`);
    }
    if (!reason.trim()) {
        throw new Error('Alasan harus diberikan untuk sengketa.');
    }
    return this.updateTransaction(transactionId, { status: TransactionStatus.DISPUTED, disputeReason: reason });
  },
};

// --- Chat Service Functions ---
export const chatService = {
  async getChatMessages(transactionId: string): Promise<ChatMessage[]> {
    const messages = chatMessagesStore.filter(msg => msg.transactionId === transactionId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    return simulateDelay(messages, 200);
  },

  async sendChatMessage(transactionId: string, senderId: string, messageText: string): Promise<ChatMessage> {
    if (!messageText.trim()) {
      throw new Error('Pesan tidak boleh kosong.');
    }
    const sender = await authService.getUserById(senderId);
    if (!sender) {
      throw new Error('Pengirim tidak ditemukan.');
    }
    
    const transaction = await transactionService.getTransactionById(transactionId);
    if (!transaction) {
      throw new Error('Transaksi tidak ditemukan untuk chat ini.');
    }
    // Allow chat if status is not cancelled, completed, or if current user is part of transaction
    if (transaction.status === TransactionStatus.CANCELLED || transaction.status === TransactionStatus.COMPLETED) {
        if (transaction.seller.id !== senderId && transaction.buyerId !== senderId) {
             throw new Error('Chat untuk transaksi ini sudah ditutup.');
        }
    }


    const newMessage: ChatMessage = {
      id: `chatmsg${Date.now()}${Math.random().toString(16).slice(2)}`,
      transactionId,
      senderId,
      senderName: sender.name, 
      messageText: messageText.trim(),
      timestamp: new Date(),
    };
    chatMessagesStore.push(newMessage);
    return simulateDelay(newMessage, 150);
  }
};


export const escrowService = { ...authService, ...transactionService, ...chatService };
