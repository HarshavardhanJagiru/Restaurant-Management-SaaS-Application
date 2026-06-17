import React, { useEffect, useState } from 'react';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import API from '../services/api';
import useSocket from '../hooks/useSocket';
import { Table, QrCode, User, Calendar, Plus, CheckCircle, RefreshCcw } from 'lucide-react';

const TableManagement = () => {
  const socket = useSocket();
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  
  // Modals state
  const [selectedTable, setSelectedTable] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);

  // Reservation form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [selectedTableId, setSelectedTableId] = useState('');
  const [guestsCount, setGuestsCount] = useState('2');
  const [resTime, setResTime] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [tablesRes, resRes] = await Promise.all([
        API.get('/tables'),
        API.get('/reservations'),
      ]);
      setTables(tablesRes.data);
      setReservations(resRes.data);
    } catch (err) {
      console.error('Error fetching table data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    if (socket) {
      const handleTableStatusChanged = (updatedTable) => {
        setTables((prevTables) =>
          prevTables.map((t) => (t._id === updatedTable._id ? { ...t, ...updatedTable } : t))
        );
      };

      socket.on('table-status-changed', handleTableStatusChanged);
      return () => {
        socket.off('table-status-changed', handleTableStatusChanged);
      };
    }
  }, [socket]);

  const handleCreateReservation = async (e) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !selectedTableId || !resTime) return;

    try {
      await API.post('/reservations', {
        customerName,
        customerPhone,
        customerEmail,
        table: selectedTableId,
        guestsCount: parseInt(guestsCount),
        reservationTime: new Date(resTime),
        specialRequests,
      });

      // Clear form & close
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setSelectedTableId('');
      setGuestsCount('2');
      setResTime('');
      setSpecialRequests('');
      setShowReservationModal(false);

      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating reservation');
    }
  };

  const handleSeatReservation = async (resId) => {
    try {
      await API.put(`/reservations/${resId}/status`, { status: 'seated' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error seating guests');
    }
  };

  const handleFreeTable = async (tableId) => {
    try {
      await API.put(`/tables/${tableId}/status`, { status: 'free', currentOrder: null });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'free': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      case 'occupied': return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
      case 'reserved': return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
      default: return 'bg-slate-800/10 border-slate-700/20 text-slate-400';
    }
  };

  return (
    <div className="min-h-screen pl-64 bg-darkBg text-slate-100 flex flex-col">
      <Sidebar />
      <Navbar title="Seating & Reservatios Planner" />

      <main className="flex-1 p-8 mt-16 space-y-8 overflow-y-auto">
        {/* Title row */}
        <div className="flex justify-between items-center border-b border-darkBorder pb-6">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Table & Floor Map</h1>
            <p className="text-sm text-slate-400">View real-time layout status, assign guests, and manage QR links</p>
          </div>
          <button
            onClick={() => setShowReservationModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-semibold text-xs text-white shadow-lg flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Reservation</span>
          </button>
        </div>

        {/* Dynamic floor layout grid */}
        {loading ? (
          <div className="py-20 flex justify-center"><span className="w-8 h-8 rounded-full border-4 border-indigo-500/25 border-t-indigo-500 animate-spin"></span></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Table layout blocks */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="font-bold text-lg text-slate-200">Dining Room Layout</h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {tables.map(t => (
                  <div 
                    key={t._id} 
                    className={`glass-panel p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between h-48 border transition-all duration-300 ${
                      t.status === 'occupied' ? 'border-rose-500/20' : 'border-darkBorder hover:border-indigo-500/20'
                    }`}
                  >
                    {/* Header: Table details */}
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-2xl font-black text-white">T - {t.tableNumber}</span>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">{t.capacity} Seats capacity</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize border ${getStatusBg(t.status)}`}>
                        {t.status}
                      </span>
                    </div>

                    {/* Table orders metadata details */}
                    <div className="mt-4 space-y-1">
                      {t.currentOrder ? (
                        <div className="text-xs text-slate-300">
                          <span className="font-bold block text-indigo-400">Order: {t.currentOrder.orderNumber}</span>
                          <span className="text-[10px] text-slate-400">Status: <span className="capitalize text-slate-200">{t.currentOrder.status}</span></span>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">No active order</p>
                      )}
                    </div>

                    {/* Footer: actions */}
                    <div className="flex gap-2 pt-4 border-t border-darkBorder/40 mt-auto">
                      <button
                        onClick={() => { setSelectedTable(t); setShowQRModal(true); }}
                        title="Display Table QR Code"
                        className="p-2 rounded-xl bg-slate-900 hover:bg-slate-950 border border-darkBorder text-slate-400 hover:text-indigo-400 transition-all cursor-pointer"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                      
                      {t.status === 'occupied' && (
                        <button
                          onClick={() => handleFreeTable(t._id)}
                          className="flex-1 py-1.5 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 text-[10px] font-bold uppercase transition-all cursor-pointer"
                        >
                          Release Table
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reservations Queue */}
            <div className="space-y-6">
              <h2 className="font-bold text-lg text-slate-200">Reservation Log</h2>
              
              <div className="glass-panel p-5 rounded-2xl border border-darkBorder space-y-4 max-h-[500px] overflow-y-auto">
                {reservations.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center py-8">No reservations logged today</p>
                ) : (
                  reservations.map(res => (
                    <div 
                      key={res._id} 
                      className={`p-3.5 rounded-xl border ${
                        res.status === 'seated' 
                          ? 'border-darkBorder bg-slate-950/20 opacity-60' 
                          : 'border-indigo-500/10 bg-indigo-500/[0.02]'
                      } space-y-3`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-bold text-slate-200">{res.customerName}</p>
                          <span className="text-[10px] text-slate-400">{res.customerPhone}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          res.status === 'seated' ? 'bg-slate-800 text-slate-400' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        }`}>
                          {res.status}
                        </span>
                      </div>

                      {/* Info lines */}
                      <div className="text-[11px] text-slate-300 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Table className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Table {res.table?.tableNumber} ({res.guestsCount} Guests)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{new Date(res.reservationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {res.specialRequests && (
                          <p className="italic text-slate-400 text-[10px]">Note: "{res.specialRequests}"</p>
                        )}
                      </div>

                      {res.status === 'confirmed' && (
                        <button
                          onClick={() => handleSeatReservation(res._id)}
                          className="w-full flex justify-center items-center gap-1.5 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-bold uppercase transition-all cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Seat Guest</span>
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* Modal: QR Viewer code display */}
        {showQRModal && selectedTable && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm glass-panel p-6 rounded-2xl border border-darkBorder shadow-2xl relative text-center space-y-4">
              <h2 className="text-lg font-bold text-white">Table {selectedTable.tableNumber} QR Code</h2>
              <p className="text-xs text-slate-400">Scan code to open Customer Ordering Portal</p>
              
              <div className="p-4 bg-white rounded-xl inline-block shadow-lg mx-auto">
                <img 
                  src={selectedTable.qrCodeUrl} 
                  alt={`QR code for Table ${selectedTable.tableNumber}`} 
                  className="w-56 h-56 mx-auto"
                />
              </div>

              <div className="text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 py-2.5 px-4 rounded-xl break-all">
                {`http://localhost:5173/customer-order/table/${selectedTable._id}`}
              </div>

              <div className="flex gap-2 justify-center pt-2">
                <button
                  type="button"
                  onClick={() => { setShowQRModal(false); setSelectedTable(null); }}
                  className="px-5 py-2 rounded-xl bg-slate-900 border border-darkBorder text-xs text-slate-300 font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Reservation Builder Form */}
        {showReservationModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-darkBorder shadow-2xl relative">
              <h2 className="text-lg font-bold text-white mb-4">Add Table Booking</h2>
              
              <form onSubmit={handleCreateReservation} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Customer Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Guest Full Name"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-darkBorder text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Phone Number</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+91 999..."
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-darkBorder text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Seating Table</label>
                    <select
                      value={selectedTableId}
                      onChange={(e) => setSelectedTableId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-darkBorder text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                      required
                    >
                      <option value="">Select Table</option>
                      {tables.map(t => (
                        <option key={t._id} value={t._id}>T - {t.tableNumber} (Cap: {t.capacity})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Co-Guests</label>
                    <input
                      type="number"
                      value={guestsCount}
                      onChange={(e) => setGuestsCount(e.target.value)}
                      placeholder="2"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-darkBorder text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                      required
                      min="1"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Schedule Time</label>
                    <input
                      type="datetime-local"
                      value={resTime}
                      onChange={(e) => setResTime(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-darkBorder text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Special Requests</label>
                  <textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="e.g. Window side, birthday cake..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-darkBorder text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    rows="2"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReservationModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 border border-darkBorder text-xs text-slate-300 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
                  >
                    Reserve Table
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default TableManagement;
