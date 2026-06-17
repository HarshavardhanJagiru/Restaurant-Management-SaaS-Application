import React, { useEffect, useState } from 'react';
import useSocket from '../../hooks/useSocket';
import { ShoppingBag, CheckCircle, Receipt, HelpCircle, XCircle } from 'lucide-react';

const LiveFeed = () => {
  const socket = useSocket();
  const [activities, setActivities] = useState([
    { id: '1', type: 'system', text: 'System booted successfully. Real-time synchronization active.', time: 'Just now' },
    { id: '2', type: 'payment', text: 'Table 3 settled order ORD-1002 (₹1,240 via UPI)', time: '5 mins ago' },
    { id: '3', type: 'served', text: 'Order ORD-1002 served to Table 3', time: '10 mins ago' },
  ]);

  useEffect(() => {
    if (socket) {
      // Listen for placed orders
      const handleOrderPlaced = (order) => {
        const tableStr = order.table ? `Table ${order.table.tableNumber}` : 'Takeaway';
        addActivity({
          id: `placed-${Date.now()}`,
          type: 'placed',
          text: `New order ${order.orderNumber} placed for ${tableStr} (${order.items.length} items)`,
          time: 'Just now',
        });
      };

      // Listen for status updates
      const handleOrderStatusUpdate = (order) => {
        const tableStr = order.table ? `Table ${order.table.tableNumber}` : 'Takeaway';
        let text = `Order ${order.orderNumber} (${tableStr}) changed status to ${order.status}`;
        if (order.status === 'preparing') {
          text = `Kitchen started preparing order ${order.orderNumber} (${tableStr})`;
        } else if (order.status === 'ready') {
          text = `Order ${order.orderNumber} (${tableStr}) is ready to serve!`;
        } else if (order.status === 'served') {
          text = `Order ${order.orderNumber} (${tableStr}) has been served`;
        } else if (order.status === 'cancelled') {
          text = `Order ${order.orderNumber} (${tableStr}) has been cancelled`;
        }

        addActivity({
          id: `status-${order._id}-${Date.now()}`,
          type: order.status,
          text,
          time: 'Just now',
        });
      };

      // Listen for payment settlements
      const handlePaymentProcessed = ({ orderId, payment }) => {
        addActivity({
          id: `payment-${payment._id}-${Date.now()}`,
          type: 'payment',
          text: `Payment settled for order (₹${payment.amountPaid} via ${payment.paymentMethod.toUpperCase()})`,
          time: 'Just now',
        });
      };

      socket.on('order-placed', handleOrderPlaced);
      socket.on('order-status-update', handleOrderStatusUpdate);
      socket.on('payment-processed', handlePaymentProcessed);

      // Join rooms if needed
      socket.emit('join-room', 'admin');

      return () => {
        socket.off('order-placed', handleOrderPlaced);
        socket.off('order-status-update', handleOrderStatusUpdate);
        socket.off('payment-processed', handlePaymentProcessed);
      };
    }
  }, [socket]);

  const addActivity = (item) => {
    setActivities((prev) => [item, ...prev.slice(0, 9)]);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'placed':
        return <ShoppingBag className="w-4 h-4 text-indigo-400" />;
      case 'preparing':
        return <HelpCircle className="w-4 h-4 text-amber-400 animate-spin" />;
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-emerald-400 animate-bounce" />;
      case 'served':
        return <CheckCircle className="w-4 h-4 text-blue-400" />;
      case 'payment':
        return <Receipt className="w-4 h-4 text-teal-400" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-rose-400" />;
      default:
        return <CheckCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  const getBg = (type) => {
    switch (type) {
      case 'placed': return 'bg-indigo-500/10 border-indigo-500/20';
      case 'preparing': return 'bg-amber-500/10 border-amber-500/20';
      case 'ready': return 'bg-emerald-500/10 border-emerald-500/20';
      case 'served': return 'bg-blue-500/10 border-blue-500/20';
      case 'payment': return 'bg-teal-500/10 border-teal-500/20';
      case 'cancelled': return 'bg-rose-500/10 border-rose-500/20';
      default: return 'bg-slate-800/20 border-slate-700/20';
    }
  };

  return (
    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
      {activities.map((act) => (
        <div 
          key={act.id} 
          className={`flex gap-3.5 p-3 rounded-xl border ${getBg(act.type)} transition-all duration-300 hover:translate-x-1`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {getIcon(act.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 leading-tight">{act.text}</p>
            <span className="text-[10px] text-slate-400 font-medium">{act.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LiveFeed;
