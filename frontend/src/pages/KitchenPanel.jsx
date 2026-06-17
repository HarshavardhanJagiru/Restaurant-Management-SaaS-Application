import React, { useEffect, useState } from 'react';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import API from '../services/api';
import useSocket from '../hooks/useSocket';
import { ChefHat, Clock, AlertTriangle, ArrowRight, Play, Check } from 'lucide-react';

const KitchenPanel = () => {
  const socket = useSocket();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Play audio alarm on new order arrival
  const playAlertSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 note
      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      setTimeout(() => oscillator.stop(), 180);
      
      setTimeout(() => {
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
        gain2.gain.setValueAtTime(0.15, audioCtx.currentTime);
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.start();
        setTimeout(() => osc2.stop(), 280);
      }, 200);

    } catch (e) {
      console.warn("Audio Context alert blocked by browser autoplay policy.");
    }
  };

  const fetchKitchenOrders = async () => {
    try {
      const { data } = await API.get('/orders');
      // Kitchen only cares about Placed & Preparing orders
      setOrders(data.filter(o => ['placed', 'preparing'].includes(o.status)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchenOrders();

    if (socket) {
      const handleNewOrder = (order) => {
        setOrders(prev => [order, ...prev]);
        playAlertSound();
      };

      const handleStatusUpdated = (updatedOrder) => {
        if (['ready', 'served', 'cancelled'].includes(updatedOrder.status)) {
          // Remove from KDS active screens
          setOrders(prev => prev.filter(o => o._id !== updatedOrder._id));
        } else {
          setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
        }
      };

      socket.on('order-placed', handleNewOrder);
      socket.on('order-status-update', handleStatusUpdated);

      return () => {
        socket.off('order-placed', handleNewOrder);
        socket.off('order-status-update', handleStatusUpdated);
      };
    }
  }, [socket]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/${orderId}/status`, { status: newStatus });
      fetchKitchenOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating order');
    }
  };

  // Helper: compute how long ago the order was created
  const getElapsedTime = (createdAt) => {
    const elapsedMs = Date.now() - new Date(createdAt).getTime();
    return Math.floor(elapsedMs / 60000); // return in minutes
  };

  // Priority indicator border matching elapsed prep times
  const getPriorityClass = (createdAt) => {
    const mins = getElapsedTime(createdAt);
    if (mins >= 25) {
      return 'border-rose-500/50 shadow-lg shadow-rose-500/5'; // red alerts
    }
    if (mins >= 15) {
      return 'border-amber-500/50 shadow-lg shadow-amber-500/5'; // orange alerts
    }
    return 'border-indigo-500/20';
  };

  // Filter columns
  const placedOrders = orders.filter(o => o.status === 'placed');
  const preparingOrders = orders.filter(o => o.status === 'preparing');

  return (
    <div className="min-h-screen pl-64 bg-darkBg text-slate-100 flex flex-col">
      <Sidebar />
      <Navbar title="Kitchen Display System (KDS)" />

      <main className="flex-1 p-8 mt-16 flex flex-col overflow-hidden h-[calc(100vh-64px)]">
        {/* Title row */}
        <div className="flex justify-between items-center pb-5 border-b border-darkBorder flex-shrink-0">
          <div>
            <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
              <ChefHat className="w-6 h-6 text-indigo-400" />
              <span>KDS Screen</span>
            </h1>
            <p className="text-xs text-slate-400">Incoming tickets and preparation status lanes</p>
          </div>
          
          <div className="flex gap-4 text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></span> New: {placedOrders.length}</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span> Cooking: {preparingOrders.length}</span>
          </div>
        </div>

        {/* Double Column grid layout */}
        {loading ? (
          <div className="py-20 flex-1 flex justify-center items-center"><span className="w-8 h-8 rounded-full border-4 border-indigo-500/25 border-t-indigo-500 animate-spin"></span></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 mt-6 overflow-hidden pb-4">
            
            {/* COLUMN 1: PLACED */}
            <div className="flex flex-col h-full bg-slate-950/20 border border-darkBorder/40 rounded-2xl overflow-hidden p-4 space-y-4">
              <div className="flex justify-between items-center border-b border-darkBorder/30 pb-3 flex-shrink-0">
                <h3 className="font-extrabold text-sm text-slate-200">Incoming Queue ({placedOrders.length})</h3>
                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">NEW TICKETS</span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
                {placedOrders.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center py-12">No new orders placed</p>
                ) : (
                  placedOrders.map(order => (
                    <div 
                      key={order._id} 
                      className={`glass-panel p-4.5 rounded-2xl border flex flex-col justify-between ${getPriorityClass(order.createdAt)}`}
                    >
                      <div className="flex justify-between items-start border-b border-darkBorder/40 pb-2 mb-3">
                        <div>
                          <span className="text-[10px] text-indigo-400 font-bold block">{order.orderNumber}</span>
                          <span className="text-base font-black text-slate-100">{order.table ? `Table ${order.table.tableNumber}` : 'Takeaway'}</span>
                        </div>
                        <span className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold bg-slate-900 border border-darkBorder px-2 py-0.5 rounded-md">
                          <Clock className="w-3 h-3 text-indigo-400" />
                          <span>{getElapsedTime(order.createdAt)}m ago</span>
                        </span>
                      </div>

                      {/* Items */}
                      <div className="space-y-2.5 my-1 flex-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-xs text-slate-300">
                            <span className="font-bold text-slate-200">{item.menuItem?.name} <span className="text-indigo-400">x{item.quantity}</span></span>
                            {item.notes && <p className="text-[10px] text-amber-400 italic mt-0.5">Note: "{item.notes}"</p>}
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <button
                        onClick={() => updateStatus(order._id, 'preparing')}
                        className="w-full mt-4 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold uppercase cursor-pointer transition-all"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Accept & Cook</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* COLUMN 2: PREPARING */}
            <div className="flex flex-col h-full bg-slate-950/20 border border-darkBorder/40 rounded-2xl overflow-hidden p-4 space-y-4">
              <div className="flex justify-between items-center border-b border-darkBorder/30 pb-3 flex-shrink-0">
                <h3 className="font-extrabold text-sm text-slate-200">Active Cooking ({preparingOrders.length})</h3>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">IN KITCHEN</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
                {preparingOrders.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center py-12">No orders in preparation status</p>
                ) : (
                  preparingOrders.map(order => (
                    <div 
                      key={order._id} 
                      className={`glass-panel p-4.5 rounded-2xl border flex flex-col justify-between ${getPriorityClass(order.createdAt)}`}
                    >
                      <div className="flex justify-between items-start border-b border-darkBorder/40 pb-2 mb-3">
                        <div>
                          <span className="text-[10px] text-indigo-400 font-bold block">{order.orderNumber}</span>
                          <span className="text-base font-black text-slate-100">{order.table ? `Table ${order.table.tableNumber}` : 'Takeaway'}</span>
                        </div>
                        <span className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold bg-slate-900 border border-darkBorder px-2 py-0.5 rounded-md">
                          <Clock className="w-3 h-3 text-indigo-400" />
                          <span>{getElapsedTime(order.createdAt)}m ago</span>
                        </span>
                      </div>

                      {/* Items */}
                      <div className="space-y-2.5 my-1 flex-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-xs text-slate-300">
                            <span className="font-bold text-slate-200">{item.menuItem?.name} <span className="text-indigo-400">x{item.quantity}</span></span>
                            {item.notes && <p className="text-[10px] text-amber-400 italic mt-0.5">Note: "{item.notes}"</p>}
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <button
                        onClick={() => updateStatus(order._id, 'ready')}
                        className="w-full mt-4 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold uppercase cursor-pointer transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Ready to Serve</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
};

export default KitchenPanel;
