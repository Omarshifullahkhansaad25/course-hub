
import React from 'react';
import { User, Role } from '../types';
import { UserIcon } from './icons/UserIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { LogoutIcon } from './icons/LogoutIcon';

interface HeaderProps {
  user: User;
  role: Role;
  setRole: (role: Role) => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, role, setRole, onLogout }) => {
  const handleToggle = () => {
    setRole(role === 'student' ? 'teacher' : 'student');
  };

  return (
    <header className="bg-brand-blue text-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-4">
            <BookOpenIcon className="h-8 w-8 text-brand-secondary" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              North Western University <span className="hidden sm:inline">- Course Hub</span>
            </h1>
          </div>

          <div className="flex items-center space-x-4 sm:space-x-6">
            <div className="flex items-center space-x-3">
               <div className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={role === 'teacher'} onChange={handleToggle} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-400 rounded-full peer peer-focus:ring-2 peer-focus:ring-brand-secondary peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-secondary"></div>
                <span className="ml-3 text-sm font-medium text-gray-200">{role === 'student' ? 'Student View' : 'Teacher View'}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 border-l border-blue-500 pl-4 sm:pl-6">
              <div className="p-2 bg-blue-800 rounded-full">
                <UserIcon className="h-6 w-6" />
              </div>
              <div className="hidden sm:block">
                <p className="font-semibold text-sm">{user.name}</p>
                <p className="text-xs text-gray-300">{user.id} - {user.details}</p>
              </div>
              <button
                onClick={onLogout}
                title="Logout"
                className="p-2 rounded-full hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-blue focus:ring-white"
                aria-label="Logout"
              >
                <LogoutIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
