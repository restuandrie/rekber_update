import React from 'react';
import { User } from '../types';
import { APP_NAME, AppLogoIcon, ArrowRightOnRectangleIcon, UserPlusIcon } from '../constants'; // UserSwitcher removed, AppLogoIcon added
import ActionButton from './ActionButton';


interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
  onShowLogin: () => void;
  onShowRegister: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentUser, onLogout, onShowLogin, onShowRegister }) => {
  return (
    <nav className="bg-gradient-to-r from-slate-800 to-slate-900 shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <AppLogoIcon className="h-10 w-10 text-blue-400" /> {/* Changed to AppLogoIcon */}
            <span className="ml-3 text-3xl font-bold text-white tracking-tight">{APP_NAME}</span>
          </div>
          <div className="flex items-center space-x-3">
            {currentUser ? (
              <>
                <div className="flex items-center">
                   <img 
                      className="h-10 w-10 rounded-full border-2 border-blue-400 object-cover" 
                      src={currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=random`}
                      alt={currentUser.name}
                    />
                  <span className="ml-3 text-slate-200 font-medium hidden sm:block">{currentUser.name}</span>
                </div>
                <ActionButton
                    onClick={onLogout}
                    variant="ghost"
                    size="sm"
                    className="text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                    Logout
                </ActionButton>
              </>
            ) : (
              <>
                <ActionButton
                    onClick={onShowLogin}
                    variant="primary"
                    size="sm"
                    icon={<ArrowRightOnRectangleIcon className="w-5 h-5"/>}
                >
                    Login
                </ActionButton>
                <ActionButton
                    onClick={onShowRegister}
                    variant="ghost"
                    size="sm"
                    icon={<UserPlusIcon className="w-5 h-5"/>}
                     className="text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                    Daftar
                </ActionButton>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;