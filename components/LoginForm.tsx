
import React, { useState } from 'react';
import Modal from './Modal';
import ActionButton from './ActionButton';
import Alert from './Alert';
import { ArrowRightOnRectangleIcon, GoogleIcon } from '../constants';

interface LoginFormProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSubmit: (email: string, password_plaintext: string) => Promise<void>;
  onGoogleSignIn: () => Promise<void>;
  isAuthLoading: boolean;
  authError: string | null;
  onSwitchToRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ 
    isOpen, onClose, onLoginSubmit, onGoogleSignIn, isAuthLoading, authError, onSwitchToRegister 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
        return; 
    }
    onLoginSubmit(email, password);
  };

  const handleGoogleClick = async () => {
    await onGoogleSignIn();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Login ke REKBERAN">
      <form onSubmit={handleSubmit} className="space-y-6">
        {authError && <Alert type="error" message={authError} />}
        
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            type="email"
            id="login-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
            autoComplete="email"
            disabled={isAuthLoading}
          />
        </div>

        <div>
          <label htmlFor="login-password" className="block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            type="password"
            id="login-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
            autoComplete="current-password"
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
            Masuk dengan Google
        </ActionButton>
        
        <div className="flex items-center justify-between pt-4">
          <ActionButton 
            type="button" 
            variant="ghost" 
            onClick={onSwitchToRegister}
            disabled={isAuthLoading}
            className="text-sm text-blue-600 hover:text-blue-700 p-0"
          >
            Belum punya akun? Daftar
          </ActionButton>
          <div className="flex space-x-3">
            <ActionButton type="button" variant="ghost" onClick={onClose} disabled={isAuthLoading}>
                Batal
            </ActionButton>
            <ActionButton 
                type="submit" 
                variant="primary" 
                isLoading={isAuthLoading} 
                disabled={isAuthLoading || !email || !password}
                icon={<ArrowRightOnRectangleIcon className="w-5 h-5" />}
            >
                Login
            </ActionButton>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default LoginForm;
