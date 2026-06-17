import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../services/api';
import useSocket from '../hooks/useSocket';
import { ShoppingCart, Plus, Minus, CheckCircle, Clock, ChefHat, Heart, Search } from 'lucide-react';

const CustomerOrder = () => {
  const { tableId } = useParams();
  const socket = useSocket();

  const [table, setTable] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [search, setSearch] = useState('');
  
  // Cart state
  const [cart, setCart] = useState([]);
  
  // Placed order tracking state
  const [placedOrder, setPlacedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Fetch table info
      const tableRes = await API.get(`/tables/${tableId}`);
      setTable(tableRes.data);


      const [menuRes, catRes] = await Promise.all([
        API.get('/menu'),
        API.get('/categories')
      ]);
      setMenuItems(menuRes.data.filter(item => item.availability === 'available'));
      setCategories(catRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    if (socket) {
      // Connect to table updates room
      socket.emit('join-room', `table-${tableId}`);

      const handleOrderStatusChange = (updatedOrder) => {
        if (placedOrder && updatedOrder._id === placedOrder._id) {
          setPlacedOrder(updatedOrder);
        }
      };

      socket.on('order-status-update', handleOrderStatusChange);

      return () => {
        socket.off('order-status-update', handleOrderStatusChange);
      };
    }
  }, [socket, tableId, placedOrder]);

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(c => c.menuItem === item._id);
      if (existing) {
        return prev.map(c => c.menuItem === item._id ? { ...c, quantity: c.quantity + 1 } : c);
      } else {
        return [...prev, { menuItem: item._id, name: item.name, price: item.price, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (itemId, change) => {
    setCart(prev => 
      prev.map(c => {
        if (c.menuItem === itemId) {
          const qty = c.quantity + change;
          return qty > 0 ? { ...c, quantity: qty } : null;
        }
        return c;
      }).filter(Boolean)
    );
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      const payload = {
        tableId,
        items: cart.map(c => ({
          menuItem: c.menuItem,
          quantity: c.quantity,
        })),
      };

      const { data } = await API.post('/orders', payload);
      setPlacedOrder(data);
      setCart([]);
      
      // Hook this customer room socket subscription
      if (socket) {
        socket.emit('join-room', `order-${data._id}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error placing order');
    }
  };

  const getSubtotal = () => cart.reduce((sum, c) => sum + (c.price * c.quantity), 0);

  const getProgressWidth = (status) => {
    switch (status) {
      case 'placed': return 'w-1/3';
      case 'preparing': return 'w-2/3';
      case 'ready': return 'w-full';
      case 'served': return 'w-full';
      default: return 'w-0';
    }
  };

  // Local filter
  const filteredItems = menuItems.filter(item => {
    const matchesCat = activeCategory ? item.category?._id === activeCategory : true;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg text-slate-100 flex items-center justify-center">
        <span className="w-8 h-8 rounded-full border-4 border-indigo-500/25 border-t-indigo-500 animate-spin"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darkBg text-slate-100 max-w-md mx-auto flex flex-col justify-between pb-24 border-x border-darkBorder/40">
      
      {/* Upper header */}
      <header className="p-5 border-b border-darkBorder bg-slate-900/60 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-extrabold text-lg bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent">
              DEVIDASA BITES
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              {table ? `Dining Room Table ${table.tableNumber}` : 'QR Ordering'}
            </p>
          </div>
          <span className="w-9 h-9 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center font-bold text-xs uppercase glow-border">
            T{table?.tableNumber || '?'}
          </span>
        </div>
      </header>

      {placedOrder ? (
        /* Live progression tracker layout */
        <div className="p-6 flex-1 flex flex-col justify-center items-center text-center space-y-8 animate-fadeIn">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/20 glow-border">
            <ChefHat className="w-10 h-10 text-white animate-bounce" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-white">Order Sent to Chef!</h2>
            <p className="text-xs text-slate-400">Order ID: <span className="font-bold text-indigo-400">{placedOrder.orderNumber}</span></p>
            <p className="text-xs text-slate-300 max-w-xs mx-auto">Your order is being synced directly with the kitchen monitors in real time.</p>
          </div>

          {/* Progress Timeline bar */}
          <div className="w-full space-y-6 pt-6">
            <div className="relative">
              {/* background lane */}
              <div className="w-full bg-slate-950/60 h-2 rounded-full border border-darkBorder"></div>
              {/* progressive overlay */}
              <div className={`absolute left-0 top-0 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ${getProgressWidth(placedOrder.status)}`}></div>
            </div>

            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span className={placedOrder.status === 'placed' ? 'text-indigo-400' : 'text-slate-500'}>Placed</span>
              <span className={placedOrder.status === 'preparing' ? 'text-indigo-400' : 'text-slate-500'}>Preparing</span>
              <span className={['ready', 'served'].includes(placedOrder.status) ? 'text-indigo-400' : 'text-slate-500'}>Ready</span>
            </div>
          </div>

          {/* Recipt summary items */}
          <div className="w-full bg-slate-900/40 border border-darkBorder/40 p-4 rounded-2xl text-left space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase border-b border-darkBorder pb-2 block">Order Items</span>
            
            <div className="space-y-2 max-h-[160px] overflow-y-auto scrollbar-thin">
              {placedOrder.items.map((item, index) => (
                <div key={index} className="flex justify-between text-xs text-slate-300">
                  <span>{item.menuItem?.name} <span className="text-indigo-400">x{item.quantity}</span></span>
                  <span className="font-bold text-slate-400">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-darkBorder/40 pt-3 flex justify-between items-center text-xs font-bold text-slate-200">
              <span>Bill total</span>
              <span className="text-base text-white font-extrabold">₹{placedOrder.grandTotal}</span>
            </div>
          </div>

          {/* Trigger to place another order */}
          <button
            onClick={() => setPlacedOrder(null)}
            className="text-xs font-bold text-indigo-400 hover:underline pt-4"
          >
            Order more items
          </button>
        </div>
      ) : (
        /* Regular mobile catalog ordering layout */
        <div className="p-5 flex-1 space-y-6">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search dishes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-darkBorder text-xs text-slate-200 focus:outline-none"
            />
          </div>

          {/* Scrolling category Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveCategory('')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory === '' ? 'bg-indigo-500 text-white' : 'bg-slate-900 text-slate-400'
              }`}
            >
              All Items
            </button>
            {categories.map(c => (
              <button
                key={c._id}
                onClick={() => setActiveCategory(c._id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeCategory === c._id ? 'bg-indigo-500 text-white' : 'bg-slate-900 text-slate-400'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Food items card stack */}
          <div className="space-y-4">
            {filteredItems.map(item => (
              <div 
                key={item._id}
                className="glass-panel p-3.5 rounded-2xl border border-darkBorder/60 flex gap-4 items-center"
              >
                <img 
                  src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'} 
                  alt={item.name} 
                  className="w-20 h-20 rounded-xl object-cover"
                />
                
                <div className="flex-1 min-w-0 flex flex-col justify-between h-20">
                  <div className="flex justify-between items-start gap-1">
                    <span className="font-bold text-sm text-slate-100 truncate">{item.name}</span>
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${item.dietType === 'veg' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                  </div>
                  
                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-snug">{item.description}</p>
                  
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm font-extrabold text-white">₹{item.price}</span>
                    
                    {cart.find(c => c.menuItem === item._id) ? (
                      <div className="flex items-center bg-slate-900 border border-darkBorder rounded-lg p-0.5">
                        <button onClick={() => updateQuantity(item._id, -1)} className="p-1 text-slate-400 hover:text-white"><Minus className="w-3.5 h-3.5" /></button>
                        <span className="px-2 text-xs font-bold text-slate-200">{cart.find(c => c.menuItem === item._id).quantity}</span>
                        <button onClick={() => addToCart(item)} className="p-1 text-slate-400 hover:text-white"><Plus className="w-3.5 h-3.5" /></button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(item)}
                        className="px-3 py-1 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-bold uppercase cursor-pointer"
                      >
                        Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating cart panel footer */}
      {cart.length > 0 && !placedOrder && (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-slate-900/90 border-t border-darkBorder backdrop-blur-md z-30 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Basket Details</p>
            <span className="text-base font-extrabold text-white">₹{getSubtotal()}</span>
            <span className="text-xs text-slate-400 ml-1">({cart.reduce((s, c) => s + c.quantity, 0)} items)</span>
          </div>

          <button
            onClick={handleCheckout}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold uppercase shadow-lg shadow-indigo-500/10 flex items-center gap-1.5 cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Place Order</span>
          </button>
        </div>
      )}

    </div>
  );
};

export default CustomerOrder;
