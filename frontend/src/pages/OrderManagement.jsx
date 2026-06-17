import React, { useEffect, useState } from 'react';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import API from '../services/api';
import useSocket from '../hooks/useSocket';
import { ShoppingCart, Plus, Minus, FileText, ChevronRight, X, Clock, HelpCircle, AlertCircle } from 'lucide-react';

const OrderManagement = () => {
  const socket = useSocket();
  const [menuItems, setMenuItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  
  // Tabs: 'track' or 'create'
  const [activeTab, setActiveTab] = useState('track');

  // Cart state for order creation
  const [cart, setCart] = useState([]);
  const [selectedTableId, setSelectedTableId] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const [loading, setLoading] = useState(true);

  const fetchOrderData = async () => {
    try {
      const [menuRes, tablesRes, ordersRes] = await Promise.all([
        API.get('/menu'),
        API.get('/tables'),
        API.get('/orders')
      ]);
      setMenuItems(menuRes.data.filter(item => item.availability === 'available'));
      setTables(tablesRes.data);
      // Only track active running tickets in Order Manager
      setActiveOrders(ordersRes.data.filter(o => ['placed', 'preparing', 'ready'].includes(o.status)));
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderData();

    if (socket) {
      const handleOrderPlaced = (newOrder) => {
        setActiveOrders(prev => [newOrder, ...prev]);
      };

      const handleOrderStatusUpdate = (updatedOrder) => {
        if (['served', 'cancelled'].includes(updatedOrder.status)) {
          // Remove from active tracking column
          setActiveOrders(prev => prev.filter(o => o._id !== updatedOrder._id));
        } else {
          setActiveOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
        }
      };

      socket.on('order-placed', handleOrderPlaced);
      socket.on('order-status-update', handleOrderStatusUpdate);

      return () => {
        socket.off('order-placed', handleOrderPlaced);
        socket.off('order-status-update', handleOrderStatusUpdate);
      };
    }
  }, [socket]);

  // Cart Handlers
  const addToCart = (item) => {
    setCart(prevCart => {
      const existing = prevCart.find(c => c.menuItem === item._id);
      if (existing) {
        return prevCart.map(c => c.menuItem === item._id ? { ...c, quantity: c.quantity + 1 } : c);
      } else {
        return [...prevCart, { menuItem: item._id, name: item.name, price: item.price, quantity: 1, notes: '' }];
      }
    });
  };

  const updateQuantity = (itemId, change) => {
    setCart(prevCart => 
      prevCart.map(c => {
        if (c.menuItem === itemId) {
          const newQty = c.quantity + change;
          return newQty > 0 ? { ...c, quantity: newQty } : null;
        }
        return c;
      }).filter(Boolean)
    );
  };

  const updateCartNotes = (itemId, notes) => {
    setCart(prevCart => 
      prevCart.map(c => c.menuItem === itemId ? { ...c, notes } : c)
    );
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return alert('Your cart is empty');

    try {
      const payload = {
        tableId: selectedTableId || null,
        customerPhone,
        items: cart.map(c => ({
          menuItem: c.menuItem,
          quantity: c.quantity,
          notes: c.notes,
        })),
      };

      await API.post('/orders', payload);
      
      // Clear cart & variables
      setCart([]);
      setSelectedTableId('');
      setCustomerPhone('');
      setActiveTab('track');
      fetchOrderData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating order');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrderData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating order');
    }
  };

  const getStatusBorder = (status) => {
    switch (status) {
      case 'placed': return 'border-indigo-500/30 bg-indigo-500/[0.02]';
      case 'preparing': return 'border-amber-500/30 bg-amber-500/[0.02]';
      case 'ready': return 'border-emerald-500/30 bg-emerald-500/[0.02]';
      default: return 'border-slate-800 bg-slate-900/40';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'placed': return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25';
      case 'preparing': return 'bg-amber-500/10 text-amber-400 border border-amber-500/25 animate-pulse';
      case 'ready': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25';
      default: return 'bg-slate-800 text-slate-400';
    }
  };

  const computeCartSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  return (
    <div className="min-h-screen pl-64 bg-darkBg text-slate-100 flex flex-col">
      <Sidebar />
      <Navbar title="Order Desk & Operations" />

      <main className="flex-1 p-8 mt-16 space-y-6 overflow-y-auto">
        
        {/* Toggle tabs and description header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-darkBorder pb-5">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Order Management</h1>
            <p className="text-sm text-slate-400">Launch order builders, review ticket logs, and track status flow</p>
          </div>
          
          <div className="flex bg-slate-950/60 p-1.5 rounded-xl border border-darkBorder">
            <button
              onClick={() => setActiveTab('track')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'track' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Active Tickets ({activeOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'create' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Order Builder
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center"><span className="w-8 h-8 rounded-full border-4 border-indigo-500/25 border-t-indigo-500 animate-spin"></span></div>
        ) : activeTab === 'track' ? (
          /* Live orders tracker list layout */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {activeOrders.length === 0 ? (
              <div className="col-span-full py-20 flex flex-col items-center text-slate-500">
                <HelpCircle className="w-12 h-12 text-slate-600 mb-2 animate-bounce" />
                <p className="text-sm italic font-medium">No active kitchen tickets at this time</p>
              </div>
            ) : (
              activeOrders.map(order => (
                <div 
                  key={order._id} 
                  className={`glass-panel p-5 rounded-2xl border flex flex-col justify-between h-[450px] shadow-lg ${getStatusBorder(order.status)}`}
                >
                  {/* Header: ID, Table status */}
                  <div className="flex justify-between items-start border-b border-darkBorder/50 pb-3">
                    <div>
                      <span className="text-xs text-indigo-400 font-bold tracking-wider uppercase">{order.orderNumber}</span>
                      <h3 className="text-lg font-black text-slate-100 mt-0.5">
                        {order.table ? `Table ${order.table.tableNumber}` : 'Takeaway'}
                      </h3>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  {/* Body: Items list scroll */}
                  <div className="flex-1 my-4 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start text-xs border-b border-slate-900/40 pb-2">
                        <div className="flex-1 pr-2">
                          <span className="font-bold text-slate-200">{item.menuItem?.name} <span className="text-indigo-400">x{item.quantity}</span></span>
                          {item.notes && <p className="text-[10px] text-amber-400 italic mt-0.5">Note: "{item.notes}"</p>}
                        </div>
                        <span className="font-bold text-slate-400">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Summary amount */}
                  <div className="border-t border-darkBorder/50 pt-3 space-y-4">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-400">Total Bill (inc. GST)</span>
                      <span className="text-base font-extrabold text-white">₹{order.grandTotal}</span>
                    </div>

                    {/* Step control button */}
                    <div className="flex gap-2">
                      {order.status === 'placed' && (
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'preparing')}
                          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase cursor-pointer"
                        >
                          Start Preparing
                        </button>
                      )}
                      {order.status === 'preparing' && (
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'ready')}
                          className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase cursor-pointer"
                        >
                          Mark Ready to Serve
                        </button>
                      )}
                      {order.status === 'ready' && (
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'served')}
                          className="w-full py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs uppercase cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>Deliver & Close</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Create Order Cart Panel */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Catalog Grid */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="font-bold text-lg text-slate-200">Catalog Selection</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {menuItems.map(item => (
                  <div 
                    key={item._id}
                    onClick={() => addToCart(item)}
                    className="glass-panel p-4 rounded-xl border border-darkBorder hover:border-indigo-500/30 cursor-pointer flex flex-col justify-between h-40 transition-all hover:scale-[1.01]"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="font-bold text-sm text-slate-200 line-clamp-1">{item.name}</h4>
                        <span className={`text-[8px] font-extrabold uppercase px-1 py-0.5 rounded border flex-shrink-0 ${
                          item.dietType === 'veg' ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' : 'border-rose-500/20 text-rose-400 bg-rose-500/5'
                        }`}>
                          {item.dietType}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{item.description}</p>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <span className="text-sm font-black text-white">₹{item.price}</span>
                      <span className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                        <Plus className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shopping Cart details builder */}
            <div className="glass-panel p-6 rounded-2xl border border-darkBorder space-y-5">
              <div className="flex items-center gap-2 border-b border-darkBorder pb-4">
                <ShoppingCart className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-lg text-slate-200">Basket</h3>
              </div>

              {cart.length === 0 ? (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <AlertCircle className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs italic">Select items to begin booking</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Cart items list */}
                  <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                    {cart.map((c, idx) => (
                      <div key={idx} className="bg-slate-950/40 p-3 rounded-xl border border-darkBorder/40 space-y-2.5">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs font-bold text-slate-200">{c.name}</span>
                            <p className="text-[10px] text-slate-400">₹{c.price} each</p>
                          </div>
                          
                          {/* Stepper */}
                          <div className="flex items-center bg-slate-900 border border-darkBorder rounded-lg p-0.5">
                            <button 
                              type="button" 
                              onClick={() => updateQuantity(c.menuItem, -1)}
                              className="p-1 text-slate-400 hover:text-white"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-2.5 text-xs font-bold text-slate-200">{c.quantity}</span>
                            <button 
                              type="button" 
                              onClick={() => updateQuantity(c.menuItem, 1)}
                              className="p-1 text-slate-400 hover:text-white"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Note builder */}
                        <input
                          type="text"
                          value={c.notes}
                          onChange={(e) => updateCartNotes(c.menuItem, e.target.value)}
                          placeholder="Chef notes: e.g. Extra spicy..."
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-darkBorder text-[10px] text-slate-300 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Settings: Table Selection & Phone */}
                  <form onSubmit={handlePlaceOrder} className="space-y-3 pt-3 border-t border-darkBorder/50">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Seated Table</label>
                      <select
                        value={selectedTableId}
                        onChange={(e) => setSelectedTableId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-darkBorder text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        required
                      >
                        <option value="">Select Dining Table</option>
                        {tables.map(t => (
                          <option key={t._id} value={t._id} disabled={t.status === 'occupied'}>
                            T - {t.tableNumber} ({t.status === 'occupied' ? 'Occupied' : 'Free'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Customer Phone</label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Phone Number"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-darkBorder text-xs text-slate-200 focus:outline-none"
                      />
                    </div>

                    <div className="pt-3 border-t border-darkBorder/40">
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-400 mb-4">
                        <span>Cart Subtotal</span>
                        <span className="text-sm font-extrabold text-white">₹{computeCartSubtotal()}</span>
                      </div>
                      
                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xs uppercase shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-[0.98] transition-all cursor-pointer"
                      >
                        Send to Kitchen
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

          </div>
        )}

      </main>
    </div>
  );
};

export default OrderManagement;
