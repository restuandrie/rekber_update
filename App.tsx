import React, { useState, useEffect, useCallback } from 'react';
import { User, Transaction, TransactionStatus } from './types';
import { INITIAL_USERS, PlusCircleIcon, APP_NAME, ArrowPathIcon, AppLogoIcon, GoogleIcon } from './constants'; // Changed ShieldCheckIcon to AppLogoIcon
import { useEscrow } from './hooks/useEscrow';
import { authService, transactionService } from './services/escrowService';
import Navbar from './components/Navbar';
import TransactionList from './components/TransactionList';
import TransactionFormModal from './components/TransactionFormModal';
import TransactionDetailModal from './components/TransactionDetailModal';
import ActionButton from './components/ActionButton';
import Alert from './components/Alert'; 
import LoadingSpinner from './components/LoadingSpinner';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Modal from './components/Modal'; // For invite prompt

const LOGGED_IN_USER_ID_KEY = 'rekberanLoggedInUserId';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const { 
    transactions, 
    isLoading: escrowLoading, 
    error: escrowError, 
    fetchTransactions, 
    createTransaction: createEscrowTransaction, // Renamed to avoid conflict
    acceptTxn,
    payTxn,
    shipTxn,
    confirmReceiptTxn,
    cancelTxn,
    disputeTxn,
    claimInvite,
  } = useEscrow(currentUser || undefined); 

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [globalMessage, setGlobalMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
  const [pendingInviteTokenFromUrl, setPendingInviteTokenFromUrl] = useState<string | null>(null);
  const [showInvitePromptModal, setShowInvitePromptModal] = useState(false);


  const processInviteToken = useCallback(async (token: string, user: User) => {
    setGlobalMessage(null);
    setIsAuthLoading(true); // Use auth loading for this process
    try {
      const claimedTx = await claimInvite(token, user.id);
      if (claimedTx) {
        setGlobalMessage({ type: 'success', text: `Anda berhasil bergabung ke transaksi "${claimedTx.itemName}"!` });
        setSelectedTransaction(claimedTx); // Open detail modal for the claimed transaction
        // URL should be cleared of the token by now, or do it manually if needed:
        if (window.history.replaceState) {
          const url = new URL(window.location.href);
          url.searchParams.delete('inviteToken');
          window.history.replaceState({ path: url.toString() }, '', url.toString());
        }
      }
    } catch (err: any) {
      setGlobalMessage({ type: 'error', text: err.message || "Gagal mengklaim undangan transaksi." });
    } finally {
      setPendingInviteTokenFromUrl(null); // Clear token after attempt
      setShowInvitePromptModal(false);
      setIsAuthLoading(false);
    }
  }, [claimInvite]);


  // Check for invite token in URL on initial load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('inviteToken');
    if (token) {
      setPendingInviteTokenFromUrl(token);
    }
  }, []);


  // Attempt to restore session or handle pending invite token
  useEffect(() => {
    const initializeApp = async () => {
      setIsAuthLoading(true);
      const storedUserId = localStorage.getItem(LOGGED_IN_USER_ID_KEY);
      let userFromSession: User | null = null;

      if (storedUserId) {
        try {
          const user = await authService.getUserById(storedUserId);
          if (user) {
            setCurrentUser(user);
            userFromSession = user;
          } else {
            localStorage.removeItem(LOGGED_IN_USER_ID_KEY);
          }
        } catch (error) {
          console.error("Failed to restore session:", error);
          localStorage.removeItem(LOGGED_IN_USER_ID_KEY);
        }
      }

      if (pendingInviteTokenFromUrl) {
        if (userFromSession) {
          await processInviteToken(pendingInviteTokenFromUrl, userFromSession);
        } else {
          // Not logged in, but have an invite token. Prompt to login/register.
          setShowInvitePromptModal(true);
        }
      }
      setIsAuthLoading(false);
    };
    initializeApp();
  }, [pendingInviteTokenFromUrl, processInviteToken]);


  const handleAuthenticationSuccess = async (user: User) => {
    setCurrentUser(user);
    localStorage.setItem(LOGGED_IN_USER_ID_KEY, user.id);
    handleCloseAuthModals();
    setGlobalMessage({type: 'success', text: `Selamat datang, ${user.name}!`});
    
    // If there was a pending invite token when user was not logged in
    if (pendingInviteTokenFromUrl && !showInvitePromptModal) { 
        // This condition implies token was from URL, and now user is logged in.
        // showInvitePromptModal would be false if login/register was initiated *after* token was detected
        // and user was not logged in.
         await processInviteToken(pendingInviteTokenFromUrl, user);
    } else if (showInvitePromptModal && pendingInviteTokenFromUrl) {
        // This case covers when the invite prompt modal was shown, and user chose to login/register from it
        await processInviteToken(pendingInviteTokenFromUrl, user);
    }
  };

  const handleLoginSubmit = async (email: string, password_plaintext: string) => {
    setIsAuthLoading(true);
    setAuthError(null);
    setGlobalMessage(null);
    try {
      const user = await authService.loginUser(email, password_plaintext);
      await handleAuthenticationSuccess(user);
    } catch (err: any) {
      setAuthError(err.message || "Login gagal. Silakan coba lagi.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleRegisterSubmit = async (name: string, email: string, password_plaintext: string) => {
    setIsAuthLoading(true);
    setAuthError(null);
    setGlobalMessage(null);
    try {
      const newUser = await authService.registerUser(name, email, password_plaintext);
      await handleAuthenticationSuccess(newUser);
    } catch (err: any) {
      setAuthError(err.message || "Pendaftaran gagal. Silakan coba lagi.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsAuthLoading(true);
    setAuthError(null);
    setGlobalMessage(null);
    try {
        const user = await authService.signInWithGoogleMock();
        await handleAuthenticationSuccess(user);
    } catch (err: any) {
        setAuthError(err.message || "Login dengan Google gagal. Pastikan Anda memasukkan email pada prompt atau coba lagi.");
    } finally {
        setIsAuthLoading(false);
    }
  };
  
  const handleShowLogin = () => { setLoginModalOpen(true); setRegisterModalOpen(false); setAuthError(null); };
  const handleShowRegister = () => { setRegisterModalOpen(true); setLoginModalOpen(false); setAuthError(null);};
  const handleCloseAuthModals = () => { setLoginModalOpen(false); setRegisterModalOpen(false); setAuthError(null); setShowInvitePromptModal(false); };


  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(LOGGED_IN_USER_ID_KEY);
    setGlobalMessage({type: 'success', text: 'Anda telah berhasil logout.'});
    setSelectedTransaction(null); 
  };

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  const handleCloseDetailModal = () => {
    setSelectedTransaction(null);
  };
  
  const handleCreateTransaction = async (
    sellerId: string,
    buyerId: string | null,
    buyerNameForInvite: string | undefined,
    itemName: string,
    itemDescription: string,
    price: number
  ) => {
    setGlobalMessage(null);
    const newTx = await createEscrowTransaction(sellerId, buyerId, buyerNameForInvite, itemName, itemDescription, price);
    if (newTx) {
      if (newTx.status === TransactionStatus.AWAITING_BUYER_CLAIM) {
        // Message for invite is handled by the modal itself showing share options
        setGlobalMessage({type: 'success', text: `Transaksi undangan untuk "${newTx.itemName}" telah dibuat. Bagikan tautannya kepada pembeli.`});
      } else {
        setGlobalMessage({type: 'success', text: `Transaksi "${newTx.itemName}" berhasil dibuat!`});
      }
      return newTx; // Return for TransactionFormModal to handle share section
    }
    return null;
  };
  
  const wrapActionWithFeedback = useCallback(<T extends Transaction | null, Args extends any[]>(
    actionFn: (...args: Args) => Promise<T | null>,
    successMessage: string
  ) => {
    return async (...args: Args): Promise<T | null> => {
        setGlobalMessage(null);
        const result = await actionFn(...args); 
        if (result) {
            setGlobalMessage({ type: 'success', text: successMessage });
            if (selectedTransaction && result.id === selectedTransaction.id) {
                setSelectedTransaction(result as Transaction); 
            }
        }
        return result;
    };
  }, [selectedTransaction]); 
  
  const handleAccept = wrapActionWithFeedback(acceptTxn, "Transaksi berhasil disetujui!");
  const handlePay = wrapActionWithFeedback(payTxn, "Pembayaran berhasil dikonfirmasi dan sedang diverifikasi!");
  const handleShip = wrapActionWithFeedback(shipTxn, "Status pengiriman berhasil diperbarui!");
  const handleConfirmReceipt = wrapActionWithFeedback(confirmReceiptTxn, "Penerimaan barang berhasil dikonfirmasi! Transaksi selesai.");
  const handleCancel = wrapActionWithFeedback(cancelTxn, "Transaksi berhasil dibatalkan.");
  const handleDispute = wrapActionWithFeedback(disputeTxn, "Sengketa berhasil diajukan.");

  const refreshData = useCallback(() => {
    if (currentUser) {
      setGlobalMessage(null);
      fetchTransactions(currentUser.id) 
        .then(() => setGlobalMessage({type: 'success', text: 'Data transaksi berhasil diperbarui.'}))
        .catch(() => setGlobalMessage({type: 'error', text: 'Gagal memperbarui data.'}));
    }
  }, [currentUser, fetchTransactions]);

  const refreshDetailModalTransaction = useCallback(async (transactionId: string) => {
    try {
        const updatedTx = await transactionService.getTransactionById(transactionId);
        if (updatedTx) {
            setSelectedTransaction(updatedTx);
        }
    } catch (error) {
        console.error("Failed to refresh transaction detail:", error);
        setGlobalMessage({type: 'error', text: 'Gagal memuat detail transaksi terbaru.'});
    }
  }, []);

  if (isAuthLoading && !currentUser && !showInvitePromptModal) { 
    return <div className="flex justify-center items-center min-h-screen bg-slate-100"><LoadingSpinner text="Memuat sesi..." /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar 
        currentUser={currentUser} 
        onLogout={handleLogout}
        onShowLogin={handleShowLogin}
        onShowRegister={handleShowRegister}
      />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        {globalMessage && (
            <Alert type={globalMessage.type} message={globalMessage.text} onClose={() => setGlobalMessage(null)} />
        )}
        {escrowError && !globalMessage && ( 
            <Alert type="error" message={escrowError} onClose={() => { setGlobalMessage(null); refreshData(); }} />
        )}

        {!currentUser && !showInvitePromptModal && (
          <div className="text-center py-16 bg-white shadow-xl rounded-lg">
            <AppLogoIcon className="mx-auto h-20 w-20 text-blue-500" /> {/* Changed to AppLogoIcon */}
            <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-800">Selamat Datang di {APP_NAME}</h1>
            <p className="mt-3 text-lg text-slate-600">
              Platform escrow terpercaya untuk transaksi aman dan nyaman.
            </p>
            <p className="mt-4 text-slate-500">Silakan login untuk melanjutkan atau daftar jika Anda pengguna baru.</p>
            <div className="mt-8 flex justify-center space-x-4">
                <ActionButton variant="primary" size="lg" onClick={handleShowLogin}>Login</ActionButton>
                <ActionButton variant="ghost" size="lg" onClick={handleShowRegister} className="text-slate-700 border-slate-400 hover:bg-slate-200">Daftar</ActionButton>
            </div>
          </div>
        )}

        {currentUser && (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800">Transaksi Saya</h2>
              <div className="flex space-x-3">
                <ActionButton onClick={refreshData} variant="ghost" size="md" icon={<ArrowPathIcon />} disabled={escrowLoading && transactions.length > 0}>
                    {escrowLoading && transactions.length > 0 ? 'Menyegarkan...' : 'Segarkan'}
                </ActionButton>
                <ActionButton onClick={() => setCreateModalOpen(true)} variant="primary" size="md" icon={<PlusCircleIcon />}>
                  Buat Transaksi
                </ActionButton>
              </div>
            </div>
            
            {escrowLoading && transactions.length === 0 ? ( 
                 <LoadingSpinner text="Memuat transaksi Anda..." />
            ) : (
                <TransactionList
                    transactions={transactions}
                    currentUser={currentUser}
                    isLoading={escrowLoading && transactions.length > 0} 
                    error={null} 
                    onViewDetails={handleViewDetails}
                    onRefresh={refreshData}
                />
            )}
          </>
        )}
      </main>

      <footer className="bg-slate-800 text-center py-6">
        <p className="text-sm text-slate-400">&copy; {new Date().getFullYear()} {APP_NAME}. Sistem Escrow Aman.</p>
      </footer>

      {currentUser && (
        <TransactionFormModal
          isOpen={isCreateModalOpen}
          onClose={() => setCreateModalOpen(false)}
          currentUser={currentUser}
          onCreateTransaction={handleCreateTransaction}
        />
      )}

      {selectedTransaction && currentUser && ( 
        <TransactionDetailModal
          isOpen={!!selectedTransaction}
          onClose={handleCloseDetailModal}
          transaction={selectedTransaction} 
          currentUser={currentUser}
          onUpdateTransaction={async () => null} 
          onAccept={handleAccept}
          onPay={handlePay}
          onShip={handleShip}
          onConfirmReceipt={handleConfirmReceipt}
          onCancel={handleCancel}
          onDispute={handleDispute}
          refreshTransaction={refreshDetailModalTransaction} 
        />
      )}
      
      {/* Auth Modals: Login & Register */}
      {!currentUser && (
        <>
            <LoginForm 
                isOpen={isLoginModalOpen && !showInvitePromptModal} // Don't show if invite prompt is up
                onClose={handleCloseAuthModals}
                onLoginSubmit={handleLoginSubmit}
                onGoogleSignIn={handleGoogleSignIn}
                isAuthLoading={isAuthLoading}
                authError={authError}
                onSwitchToRegister={() => { handleCloseAuthModals(); handleShowRegister(); }}
            />
            <RegisterForm
                isOpen={isRegisterModalOpen && !showInvitePromptModal} // Don't show if invite prompt is up
                onClose={handleCloseAuthModals}
                onRegisterSubmit={handleRegisterSubmit}
                onGoogleSignIn={handleGoogleSignIn}
                isAuthLoading={isAuthLoading}
                authError={authError}
                onSwitchToLogin={() => { handleCloseAuthModals(); handleShowLogin(); }}
            />
        </>
      )}

      {/* Invite Prompt Modal */}
      {showInvitePromptModal && !currentUser && (
        <Modal 
            isOpen={showInvitePromptModal} 
            onClose={() => {
                setShowInvitePromptModal(false); 
                setPendingInviteTokenFromUrl(null); // User closed prompt, clear token
                 if (window.history.replaceState) {
                    const url = new URL(window.location.href);
                    url.searchParams.delete('inviteToken');
                    window.history.replaceState({ path: url.toString() }, '', url.toString());
                }
            }} 
            title="Anda Diundang ke Transaksi!"
        >
            <div className="text-center space-y-4">
                <AppLogoIcon className="mx-auto h-16 w-16 text-blue-500" /> {/* Changed to AppLogoIcon */}
                <p className="text-lg">Anda telah diundang untuk bergabung dalam transaksi di {APP_NAME}.</p>
                <p>Silakan login atau daftar untuk melihat detail dan melanjutkan.</p>
                {authError && <Alert type="error" message={authError} />}
                <div className="flex flex-col space-y-3 pt-4">
                     <ActionButton 
                        variant="primary" 
                        onClick={() => { /*setShowInvitePromptModal(false);*/ handleShowLogin(); }} // Keep invite prompt logic active
                        isLoading={isAuthLoading}
                        disabled={isAuthLoading}
                    >
                        Login
                    </ActionButton>
                    <ActionButton 
                        variant="secondary" 
                        onClick={() => { /*setShowInvitePromptModal(false);*/ handleShowRegister(); }}
                        isLoading={isAuthLoading}
                        disabled={isAuthLoading}
                    >
                        Daftar Akun Baru
                    </ActionButton>
                     <ActionButton
                        variant="ghost"
                        onClick={handleGoogleSignIn} // Google Sign In will then trigger claim if token exists
                        isLoading={isAuthLoading}
                        disabled={isAuthLoading}
                        icon={<GoogleIcon />} 
                        className="border-slate-300 hover:bg-slate-100 text-slate-700"
                    >
                        Masuk atau Daftar dengan Google
                    </ActionButton>
                </div>
            </div>
        </Modal>
      )}

    </div>
  );
};

export default App;