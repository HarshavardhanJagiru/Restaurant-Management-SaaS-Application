import React, { useEffect, useState, useContext } from 'react';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import SalesChart from '../components/dashboard/SalesChart';
import PopularDishes from '../components/dashboard/PopularDishes';
import LiveFeed from '../components/dashboard/LiveFeed';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { 
  TrendingUp, 
  ShoppingBag, 
  Table, 
  AlertTriangle,
  ArrowUpRight 
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    occupiedTablesCount: 0,
    activeKitchenTickets: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersRes, tablesRes] = await Promise.all([
          API.get('/orders'),
          API.get('/tables')
        ]);

        const orders = ordersRes.data;
        const tables = tablesRes.data;

        // Compute Metrics
        const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
        const revenue = paidOrders.reduce((sum, o) => sum + o.grandTotal, 0);
        const occupied = tables.filter(t => t.status === 'occupied').length;
        const activeKds = orders.filter(o => ['placed', 'preparing', 'ready'].includes(o.status)).length;

        setStats({
          totalOrders: orders.length,
          totalRevenue: Math.round(revenue),
          occupiedTablesCount: occupied,
          activeKitchenTickets: activeKds
        });
      } catch (error) {
        console.error('Error fetching dashboard statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen pl-64 bg-darkBg text-slate-100 flex flex-col">
      <Sidebar />
      <Navbar title="Dashboard Analytics" />

      {/* Main Page Body */}
      <main className="flex-1 p-8 mt-16 space-y-8 overflow-y-auto">
        
        {/* Welcome Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-100">Operational Overview</h1>
            <p className="text-sm text-slate-400">Real-time statistics & business diagnostics</p>
          </div>
          <div className="flex gap-2">
            <span className="text-xs font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5">
              Role: <span className="uppercase text-slate-200">{user?.role}</span>
            </span>
          </div>
        </div>

        {/* 4 Metrics Card Rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Revenue */}
          <div className="glass-panel p-6 rounded-2xl glass-panel-hover glow-border flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Revenue</span>
              <p className="text-3xl font-extrabold text-white">₹{stats.totalRevenue.toLocaleString()}</p>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                <TrendingUp className="w-3 h-3" />
                <span>+12.4% vs yesterday</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <ArrowUpRight className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Orders */}
          <div className="glass-panel p-6 rounded-2xl glass-panel-hover glow-border flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Tickets</span>
              <p className="text-3xl font-extrabold text-white">{stats.totalOrders}</p>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400">
                <ShoppingBag className="w-3 h-3" />
                <span>All channels logged</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Tables Occupied */}
          <div className="glass-panel p-6 rounded-2xl glass-panel-hover glow-border flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tables Seated</span>
              <p className="text-3xl font-extrabold text-white">{stats.occupiedTablesCount}</p>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                <span>Active occupancy load</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Table className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Active KDS Tickets */}
          <div className="glass-panel p-6 rounded-2xl glass-panel-hover glow-border flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active KDS load</span>
              <p className="text-3xl font-extrabold text-white">{stats.activeKitchenTickets}</p>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-400">
                <AlertTriangle className="w-3 h-3" />
                <span>Needs preparation</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

        </div>

        {/* Dashboard Area Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sales chart (Large) */}
          <div className="glass-panel p-6 rounded-2xl lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between border-b border-darkBorder pb-4">
              <div>
                <h3 className="font-bold text-lg text-slate-200">Revenue Velocity</h3>
                <p className="text-xs text-slate-400">Sales velocity track for the active operating week</p>
              </div>
            </div>
            <SalesChart />
          </div>

          {/* Popular dishes progress panels */}
          <div className="glass-panel p-6 rounded-2xl space-y-6">
            <div className="border-b border-darkBorder pb-4">
              <h3 className="font-bold text-lg text-slate-200">Top Performing Dishes</h3>
              <p className="text-xs text-slate-400">Most preferred menu categories by volume</p>
            </div>
            <PopularDishes />
          </div>
        </div>

        {/* Activity feed and fast action links */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Live WS activities ticker */}
          <div className="glass-panel p-6 rounded-2xl lg:col-span-2 space-y-4">
            <div className="border-b border-darkBorder pb-4">
              <h3 className="font-bold text-lg text-slate-200">Live Activity Feed</h3>
              <p className="text-xs text-slate-400">WS-orchestrated system logs and floor triggers</p>
            </div>
            <LiveFeed />
          </div>

          {/* Quick Operations Actions panel */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg text-slate-200 border-b border-darkBorder pb-4 mb-4">Fast Operations</h3>
              <p className="text-xs text-slate-400 mb-6">Shortcuts to trigger operational workflow segments</p>
              
              <div className="space-y-3">
                <a href="/orders" className="w-full text-center block py-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500 text-indigo-300 hover:text-white border border-indigo-500/20 text-xs font-bold transition-all">
                  Launch Seating Order Builder
                </a>
                <a href="/kitchen" className="w-full text-center block py-3 rounded-xl bg-purple-500/10 hover:bg-purple-500 text-purple-300 hover:text-white border border-purple-500/20 text-xs font-bold transition-all">
                  Open Kitchen Monitor Screen
                </a>
                <a href="/tables" className="w-full text-center block py-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-darkBorder text-slate-300 text-xs font-bold transition-all">
                  Check Dining Grid
                </a>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-darkBorder text-center text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              SAAS Engine version 1.0.0
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;
