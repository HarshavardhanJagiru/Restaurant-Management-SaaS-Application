import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Utensils,
  Table2,
  Receipt,
  ChefHat,
  FileText,
  LogOut,
  Activity
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['admin'],
    },
    {
      name: 'Table Manager',
      path: '/tables',
      icon: Table2,
      roles: ['admin', 'waiter'],
    },
    {
      name: 'Menu Manager',
      path: '/menu',
      icon: Utensils,
      roles: ['admin'],
    },

    {
      name: 'Order Manager',
      path: '/orders',
      icon: Receipt,
      roles: ['admin', 'waiter'],
    },
    {
      name: 'Kitchen Display',
      path: '/kitchen',
      icon: ChefHat,
      roles: ['admin', 'kitchen_staff'],
    },
    {
      name: 'Billing Settlement',
      path: '/billing',
      icon: FileText,
      roles: ['admin'],
    },
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <aside className="w-64 glass-panel border-r border-darkBorder flex flex-col h-screen fixed left-0 top-0 z-30">
      {/* Brand Header */}
      <div className="p-6 border-b border-darkBorder flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Activity className="w-6 h-6 text-white animate-pulse" />
        </div>
        <div>
          <h1 className="font-extrabold text-lg bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent leading-none">DEVIDASA</h1>
          <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Restaurant SaaS</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group
                ${isActive
                  ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/5 text-indigo-300 border-l-4 border-indigo-500 pl-3'
                  : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-100'}
              `}
            >
              <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer User Widget */}
      <div className="p-4 border-t border-darkBorder bg-slate-950/40">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-slate-200 uppercase glow-border">
            {user?.name?.slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-slate-200">{user?.name}</p>
            <p className="text-xs text-indigo-400 font-medium capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition-all duration-300 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
