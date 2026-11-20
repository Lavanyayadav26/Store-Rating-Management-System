import React from 'react';
import { Menu, User, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const Navbar = ({ setIsMobileOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Mobile toggle button */}
      <button
        type="button"
        onClick={() => setIsMobileOpen((prev) => !prev)}
        className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 lg:hidden focus:outline-none"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Empty space or breadcrumb */}
      <div className="hidden lg:flex items-center space-x-2 text-sm text-slate-500">
        <span className="font-medium text-slate-700">Store Rating Management Portal</span>
      </div>

      {/* Right profile info & logout */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3 text-right">
          <div className="hidden sm:block">
            <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[200px]" title={user?.name}>
              {user?.name}
            </p>
            <p className="text-[11px] text-slate-500 truncate max-w-[200px]" title={user?.email}>
              {user?.email}
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold text-sm">
            <User className="w-4 h-4" />
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Sign out"
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
