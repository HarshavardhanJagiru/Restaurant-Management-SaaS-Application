import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import Table from '../models/Table.js';

// @desc    Process a mock payment
// @route   POST /api/payments/mock
// @access  Public (so QR customers or waiters can trigger settlements)
export const processMockPayment = async (req, res, next) => {
  try {
    const { orderId, paymentMethod } = req.body;

    if (!orderId || !paymentMethod) {
      res.status(400);
      return next(new Error('Order ID and Payment Method are required'));
    }

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404);
      return next(new Error('Order not found'));
    }

    if (order.paymentStatus === 'paid') {
      res.status(400);
      return next(new Error('Order has already been settled'));
    }

    // Process mock transaction ID
    const transactionId = `TXN-${Date.now().toString().slice(-8)}`;

    const payment = await Payment.create({
      order: orderId,
      paymentMethod,
      amountPaid: order.grandTotal,
      transactionId,
      status: 'success',
    });

    // Mark Order as paid and served
    order.paymentStatus = 'paid';
    order.status = 'served';
    await order.save();

    // Release table
    if (order.table) {
      const table = await Table.findById(order.table);
      if (table) {
        table.status = 'free';
        table.currentOrder = null;
        await table.save();

        // Broadcast table change
        if (req.app.get('socketio')) {
          req.app.get('socketio').emit('table-status-changed', table);
        }
      }
    }

    // Broadcast payment and order state shift
    if (req.app.get('socketio')) {
      req.app.get('socketio').emit('payment-processed', {
        orderId,
        payment,
      });
      req.app.get('socketio').emit('order-status-update', order);
    }

    res.status(201).json({
      message: 'Payment settled successfully',
      payment,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private/Admin
export const getPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({})
      .populate({
        path: 'order',
        populate: { path: 'table', select: 'tableNumber' }
      })
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    next(error);
  }
};
