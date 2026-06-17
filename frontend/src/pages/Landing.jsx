import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Users, ChefHat, LogOut, ArrowRight, UserCheck, Sparkles, Shield, Compass } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Landing = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const handleSelect = (role) => {
    // Navigate to login page with role pre-selection via query param
    navigate(`/login?role=${role}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-darkBg text-slate-100 relative overflow-hidden px-4 py-12">
      {/* Background radial glow accents matching the premium theme */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '12s' }} />

      {/* Mesh grid background overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl p-8 rounded-3xl glass-panel shadow-2xl border border-white/5 space-y-8 animate-fadeIn">
        {/* Sparkle badge header */}
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest live-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Restaurant OS</span>
          </span>
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase">
            DEVIDASA <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-300 bg-clip-text text-transparent">BITES</span>
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Select a specialized terminal interface to access operational control grids, manage menus, and monitor floor telemetry.
          </p>
        </div>

        {/* User Session Widget */}
        {user ? (
          <div className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/15 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all hover:bg-indigo-500/10">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20 glow-border">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Active Identity</p>
                <p className="text-base font-bold text-slate-200">{user.name}</p>
                <p className="text-xs text-slate-400 font-medium capitalize mt-0.5">Role: {user.role?.replace('_', ' ')}</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (user.role === 'kitchen_staff') {
                  navigate('/kitchen');
                } else {
                  navigate('/dashboard');
                }
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold uppercase shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer"
            >
              <span>Access Terminal Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : null}

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Admin card */}
          <button
            onClick={() => handleSelect('admin')}
            className="group relative flex flex-col items-center text-center p-6 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 border border-white/5 hover:border-indigo-500/40 shadow-xl hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_15px_30px_rgba(99,102,241,0.1)] cursor-pointer"
          >
            {/* Glowing spot behind icon */}
            <div className="absolute top-10 w-12 h-12 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/30 transition-all" />

            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 shadow-md">
              <Shield className="w-6 h-6" />
            </div>

            <span className="font-extrabold text-base text-slate-200 group-hover:text-white transition-colors">Admin Console</span>
            <p className="text-[10px] text-slate-500 mt-2 leading-normal">
              Manage menus, register dining tables, configure systems, and view sales velocity metrics.
            </p>
          </button>

          {/* Waiter card */}
          <button
            onClick={() => handleSelect('waiter')}
            className="group relative flex flex-col items-center text-center p-6 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 border border-white/5 hover:border-purple-500/40 shadow-xl hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_15px_30px_rgba(168,85,247,0.1)] cursor-pointer"
          >
            <div className="absolute top-10 w-12 h-12 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/30 transition-all" />

            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300 shadow-md">
              <Users className="w-6 h-6" />
            </div>

            <span className="font-extrabold text-base text-slate-200 group-hover:text-white transition-colors">Waiter Desk</span>
            <p className="text-[10px] text-slate-500 mt-2 leading-normal">
              Seat customers, coordinate reservations, take orders, and generate bills at checkout.
            </p>
          </button>

          {/* Kitchen card */}
          <button
            onClick={() => handleSelect('kitchen')}
            className="group relative flex flex-col items-center text-center p-6 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 border border-white/5 hover:border-amber-500/40 shadow-xl hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_15px_30px_rgba(245,158,11,0.1)] cursor-pointer"
          >
            <div className="absolute top-10 w-12 h-12 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/30 transition-all" />

            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 shadow-md">
              <ChefHat className="w-6 h-6" />
            </div>

            <span className="font-extrabold text-base text-slate-200 group-hover:text-white transition-colors">Kitchen Monitor</span>
            <p className="text-[10px] text-slate-500 mt-2 leading-normal">
              Track active food preparation queues, update item statuses, and signal serving waiters.
            </p>
          </button>
        </div>

        {/* Session log out option */}
        {user ? (
          <div className="pt-6 border-t border-white/5 flex justify-center">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-rose-500/20 hover:border-rose-500/40 text-rose-400 hover:bg-rose-500/5 text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer w-full max-w-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Terminate Session</span>
            </button>
          </div>
        ) : (
          <div className="text-center pt-4 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
            Devidasa bites terminal v1.0.0
          </div>
        )}
      </div>
    </div>
  );
};

export default Landing;
