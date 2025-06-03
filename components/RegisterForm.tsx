
import React, { useState } from 'react';
import Modal from './Modal';
import ActionButton from './ActionButton';
import Alert from './Alert';
import { UserPlusIcon, GoogleIcon } from '../constants';

interface RegisterFormProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSubmit: (name: string, email: string, password_plaintext: string) => Promise<void>;
  onGoogleSignIn: () => Promise<void>;
  isAuthLoading: boolean;
  authError: string | null;
  onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ 
    isOpen, onClose, onRegisterSubmit, onGoogleSignIn, isAuthLoading, authError, onSwitchToLogin
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!name || !email || !password || !confirmPassword) {
      setLocalError("Semua field wajib diisi.");
      return;
    }
    if (password !== confirmPassword) {
      setLocalError("Password dan konfirmasi password tidak cocok.");
      return;
    }
    if (password.length < 6) {
      setLocalError("Password minimal 6 karakter.");
      return;
    }
    onRegisterSubmit(name, email, password);
  };

  const handleGoogleClick = async () => {
    await onGoogleSignIn();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Daftar Akun REKBERAN">
      <form onSubmit={handleSubmit} className="space-y-5">
        {authError && <Alert type="error" message={authError} onClose={() => { /* App state handles this */ }} />}
        {localError && !authError && <Alert type="error" message={localError} onClose={() => setLocalError(null)} />}
        
        <div>
          <label htmlFor="register-name" className="block text-sm font-medium text-slate-700">
            Nama Lengkap
          </label>
          <input
            type="text"
            id="register-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
            autoComplete="name"
            disabled={isAuthLoading}
          />
        </div>

        <div>
          <label htmlFor="register-email" className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            type="email"
            id="register-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
            autoComplete="email"
            disabled={isAuthLoading}
          />
        </div>

        <div>
          <label htmlFor="register-password" className="block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            type="password"
            id="register-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
            autoComplete="new-password"
            disabled={isAuthLoading}
          />
           <p className="text-xs text-slate-500 mt-1">Minimal 6 karakter.</p>
        </div>
        
        <div>
          <label htmlFor="register-confirm-password" className="block text-sm font-medium text-slate-700">
            Konfirmasi Password
          </label>
          <input
            type="password"
            id="register-confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
            autoComplete="new-password"
            disabled={isAuthLoading}
          />
        </div>

        <ActionButton
            type="button"
            variant="ghost"
            onClick={handleGoogleClick}
            isLoading={isAuthLoading}
            disabled={isAuthLoading}
            icon={<GoogleIcon className="w-5 h-5" />}
            className="w-full border-slate-300 hover:bg-slate-100 text-slate-700"
        >
            Daftar dengan Google
        </ActionButton>
        
        <div className="flex items-center justify-between pt-4">
           <ActionButton 
            type="button" 
            variant="ghost" 
            onClick={onSwitchToLogin}
            disabled={isAuthLoading}
            className="text-sm text-blue-600 hover:text-blue-700 p-0"
          >
            Sudah punya akun? Login
          </ActionButton>
          <div className="flex space-x-3">
            <ActionButton type="button" variant="ghost" onClick={onClose} disabled={isAuthLoading}>
                Batal
            </ActionButton>
            <ActionButton 
                type="submit" 
                variant="primary" 
                isLoading={isAuthLoading} 
                disabled={isAuthLoading || !name || !email || !password || !confirmPassword || (password !== confirmPassword)}
                icon={<UserPlusIcon className="w-5 h-5"/>}
            >
                Daftar
            </ActionButton>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default RegisterForm;
