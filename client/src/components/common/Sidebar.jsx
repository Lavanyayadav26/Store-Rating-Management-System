import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  Users,
  Star,
  KeyRound,
  LogOut,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Define nav links based on role
  let links = [];

  if (user?.role === 'SYSTEM_ADMIN') {
    links = [
      { name: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Manage Stores', to: '/admin/stores', icon: Store },
      { name: 'Manage Users', to: '/admin/users', icon: Users },
      { name: 'Change Password', to: '/change-password', icon: KeyRound },
    ];
  } else if (user?.role === 'NORMAL_USER') {
    links = [
      { name: 'Dashboard', to: '/user/dashboard', icon: LayoutDashboard },
      { name: 'Browse Stores', to: '/user/stores', icon: Store },
      { name: 'My Ratings', to: '/user/my-ratings', icon: Star },
      { name: 'Change Password', to: '/change-password', icon: KeyRound },
    ];
  } else if (user?.role === 'STORE_OWNER') {
    links = [
      { name: 'Dashboard', to: '/owner/dashboard', icon: LayoutDashboard },
      { name: 'My Store Ratings', to: '/owner/ratings', icon: Star },
      { name: 'Change Password', to: '/change-password', icon: KeyRound },
    ];
  }

  const roleLabel = {
    SYSTEM_ADMIN: 'Administrator',
    NORMAL_USER: 'Customer User',
    STORE_OWNER: 'Store Owner',
  }[user?.role] || 'User';

  const roleBadgeColor = {
    SYSTEM_ADMIN: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    NORMAL_USER: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    STORE_OWNER: 'bg-amber-50 text-amber-700 border-amber-200',
  }[user?.role] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="h-16 flex items-center px-6 border-b border-slate-100 space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 tracking-tight text-base leading-tight">
                RateSphere
              </h1>
              <p className="text-[11px] font-medium text-slate-400">Store Rating System</p>
            </div>
          </div>

          {/* User Role Card */}
          <div className="px-4 py-4 mx-3 my-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-900 truncate" title={user?.name}>
                  {user?.name}
                </p>
                <span
                  className={`inline-block px-2 py-0.5 mt-1 text-[10px] font-semibold rounded-full border ${roleBadgeColor}`}
                >
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-2 space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Logout */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-3.5 py-2.5 rounded-xl font-medium text-sm text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
