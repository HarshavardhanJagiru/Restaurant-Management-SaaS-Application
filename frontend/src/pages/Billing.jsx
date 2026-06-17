import React, { useEffect, useState } from 'react';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import API from '../services/api';
import useSocket from '../hooks/useSocket';
import { FileText, CreditCard, DollarSign, Smartphone, Printer, ShieldAlert, Check } from 'lucide-react';

const Billing = () => {
  const socket = useSocket();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const fetchOrders = async () => {
    try {
      const { data } = await API.get('/orders');
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    if (socket) {
      const handleOrderStatusUpdate = () => fetchOrders();
      const handlePaymentProcessed = () => fetchOrders();
      
      socket.on('order-status-update', handleOrderStatusUpdate);
      socket.on('payment-processed', handlePaymentProcessed);

      return () => {
        socket.off('order-status-update', handleOrderStatusUpdate);
        socket.off('payment-processed', handlePaymentProcessed);
      };
    }
  }, [socket]);

  const handleSettleBill = async (method) => {
    if (!selectedOrder) return;
    try {
      await API.post('/payments/mock', {
        orderId: selectedOrder._id,
        paymentMethod: method
      });

      setShowPaymentModal(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Error settling bill');
    }
  };

  const activeBillingOrders = orders.filter(o => o.paymentStatus === 'pending' && o.status !== 'cancelled');
  const settledOrders = orders.filter(o => o.paymentStatus === 'paid');

  return (
    <div className="min-h-screen pl-64 bg-darkBg text-slate-100 flex flex-col">
      <Sidebar />
      <Navbar title="Billing & POS Desk" />

      <main className="flex-1 p-8 mt-16 space-y-8 overflow-y-auto">
        
        {/* Title row */}
        <div className="flex justify-between items-center border-b border-darkBorder pb-6">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Billing Settlements</h1>
            <p className="text-sm text-slate-400">Generate table invoice bills, apply GST audits, and capture transactions</p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center"><span className="w-8 h-8 rounded-full border-4 border-indigo-500/25 border-t-indigo-500 animate-spin"></span></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* COLUMN 1 & 2: Active Billing and Settled Bills list */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Active unpaid list */}
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-slate-200">Active Tables Billing</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeBillingOrders.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-8 col-span-full text-center bg-slate-950/20 rounded-2xl border border-darkBorder/40">No pending bills to settle</p>
                  ) : (
                    activeBillingOrders.map(order => (
                      <div 
                        key={order._id}
                        onClick={() => setSelectedOrder(order)}
                        className={`glass-panel p-4.5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                          selectedOrder?._id === order._id ? 'border-indigo-500 bg-indigo-500/[0.03]' : 'border-darkBorder hover:border-slate-800'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] text-indigo-400 font-bold block">{order.orderNumber}</span>
                            <span className="text-base font-black text-slate-100">{order.table ? `Table ${order.table.tableNumber}` : 'Takeaway'}</span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                            order.status === 'served' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {order.status}
                          </span>
                        </div>

                        <div className="mt-4 flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-semibold">{order.items.length} items ordered</span>
                          <span className="font-black text-white text-base">₹{order.grandTotal}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Settled bills history list */}
              <div className="space-y-4 pt-4">
                <h3 className="font-bold text-lg text-slate-200">Settled Transactions</h3>
                
                <div className="glass-panel rounded-2xl border border-darkBorder overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-darkBorder bg-slate-900/40 text-slate-400 font-bold">
                        <th className="p-4">Invoice ID</th>
                        <th className="p-4">Table / Channel</th>
                        <th className="p-4">Billing Status</th>
                        <th className="p-4">Settled Amount</th>
                        <th className="p-4">Paid Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-darkBorder/50">
                      {settledOrders.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="p-6 text-center text-slate-500 italic">No settled orders logged today</td>
                        </tr>
                      ) : (
                        settledOrders.map(order => (
                          <tr key={order._id} className="hover:bg-slate-950/20 text-slate-300">
                            <td className="p-4 font-bold text-indigo-400">{order.orderNumber}</td>
                            <td className="p-4 font-semibold text-slate-200">{order.table ? `Table ${order.table.tableNumber}` : 'Takeaway'}</td>
                            <td className="p-4">
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[9px] uppercase border border-emerald-500/25">Paid</span>
                            </td>
                            <td className="p-4 font-bold text-slate-200">₹{order.grandTotal}</td>
                            <td className="p-4 text-slate-400">{new Date(order.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* COLUMN 3: Active selected Order invoice review details */}
            <div className="space-y-6">
              <h3 className="font-bold text-lg text-slate-200">Invoice Generator</h3>
              
              {selectedOrder ? (
                <div className="glass-panel p-6 rounded-2xl border border-darkBorder flex flex-col justify-between h-[520px] shadow-2xl relative">
                  
                  {/* Bill paper wrapper layout */}
                  <div className="space-y-5 flex-1 overflow-y-auto pr-1 scrollbar-thin">
                    <div className="text-center border-b border-darkBorder pb-4">
                      <h4 className="font-extrabold text-sm text-slate-200 uppercase tracking-widest">Devidasa Restaurant</h4>
                      <p className="text-[10px] text-slate-400 mt-1">Receipt Invoice Statement</p>
                      <span className="text-[10px] text-indigo-400 font-bold block mt-2">{selectedOrder.orderNumber}</span>
                    </div>

                    {/* Meta info */}
                    <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-darkBorder/40 pb-3">
                      <span>Dining Area: <span className="font-bold text-slate-200">{selectedOrder.table ? `Table ${selectedOrder.table.tableNumber}` : 'Takeaway'}</span></span>
                      <span>Time: <span className="font-semibold text-slate-300">{new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></span>
                    </div>

                    {/* Table items list */}
                    <div className="space-y-3 pt-2">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[11px] text-slate-300">
                          <div>
                            <span className="font-bold text-slate-200">{item.menuItem?.name}</span>
                            <span className="text-indigo-400 text-[10px] ml-1">x{item.quantity}</span>
                          </div>
                          <span className="font-bold text-slate-400">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Cost ledger list */}
                    <div className="border-t border-darkBorder/50 pt-4 space-y-2 text-[11px] text-slate-400">
                      <div className="flex justify-between">
                        <span>Items Subtotal</span>
                        <span className="font-bold text-slate-300">₹{selectedOrder.totalAmount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>GST Tax Charges (18%)</span>
                        <span className="font-bold text-slate-300">₹{selectedOrder.taxAmount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Service Charge (5%)</span>
                        <span className="font-bold text-slate-300">₹{selectedOrder.serviceCharge}</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold text-slate-200 border-t border-darkBorder/30 pt-2">
                        <span>Grand Total</span>
                        <span className="text-sm font-extrabold text-white">₹{selectedOrder.grandTotal}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="pt-4 border-t border-darkBorder/50 mt-auto flex gap-2">
                    <button
                      onClick={() => window.print()}
                      className="px-4 py-3 rounded-xl bg-slate-900 border border-darkBorder hover:bg-slate-950 text-slate-300 transition-all cursor-pointer flex items-center justify-center"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs uppercase shadow-md transition-all cursor-pointer text-center"
                    >
                      Process Settlement
                    </button>
                  </div>

                </div>
              ) : (
                <div className="glass-panel p-12 rounded-2xl border border-darkBorder flex items-center justify-center h-[520px] text-slate-500 italic text-center">
                  <p className="text-xs">Select a pending billing ticket to compile invoice slip</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Modal: Process Settlement Selection */}
        {showPaymentModal && selectedOrder && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm glass-panel p-6 rounded-2xl border border-darkBorder shadow-2xl relative text-center space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white">Choose Settlement Method</h2>
                <p className="text-xs text-slate-400 mt-1">Order {selectedOrder.orderNumber} • Amount: ₹{selectedOrder.grandTotal}</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleSettleBill('cash')}
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900 border border-darkBorder hover:border-indigo-500/40 text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  <DollarSign className="w-6 h-6 text-indigo-400 mb-2" />
                  <span className="text-[10px] font-bold uppercase">Cash</span>
                </button>
                <button
                  onClick={() => handleSettleBill('card')}
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900 border border-darkBorder hover:border-indigo-500/40 text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  <CreditCard className="w-6 h-6 text-indigo-400 mb-2" />
                  <span className="text-[10px] font-bold uppercase">Card</span>
                </button>
                <button
                  onClick={() => handleSettleBill('upi')}
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900 border border-darkBorder hover:border-indigo-500/40 text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  <Smartphone className="w-6 h-6 text-indigo-400 mb-2" />
                  <span className="text-[10px] font-bold uppercase">UPI</span>
                </button>
              </div>

              <div className="flex gap-2 justify-center pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 border border-darkBorder text-xs text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Billing;
