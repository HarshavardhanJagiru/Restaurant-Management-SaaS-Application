import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import useSocket from '../../hooks/useSocket';
import { Bell, Wifi, WifiOff, Calendar } from 'lucide-react';

const Navbar = ({ title }) => {
  const { user } = useContext(AuthContext);
  const socket = useSocket();
  const [connected, setConnected] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    if (socket) {
      setConnected(socket.connected);
      
      const onConnect = () => setConnected(true);
      const onDisconnect = () => setConnected(false);

      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);

      return () => {
        socket.off('connect', onConnect);
        socket.off('disconnect', onDisconnect);
      };
    }
  }, [socket]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 glass-panel border-b border-darkBorder fixed top-0 right-0 left-64 z-20 flex items-center justify-between px-8">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent capitalize">{title || 'Dashboard'}</h2>
      </div>

      {/* Right Tools */}
      <div className="flex items-center gap-6">
        {/* Time Widget */}
        <div className="flex items-center gap-2 text-slate-400 text-sm border-r border-darkBorder pr-6 hidden md:flex">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <span>{time.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          <span className="font-semibold text-slate-300 ml-1">{time.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>

        {/* Network Connection Indicator */}
        <div className="flex items-center gap-2">
          {connected ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <Wifi className="w-3.5 h-3.5" />
              <span>Live Sync</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20 animate-pulse">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Offline</span>
            </span>
          )}
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-darkBorder text-slate-300 hover:text-indigo-400 transition-all cursor-pointer">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span>
        </button>

        {/* Small Profile Banner */}
        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-300 capitalize">{user?.name}</p>
            <p className="text-[10px] text-indigo-400 font-semibold uppercase">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
