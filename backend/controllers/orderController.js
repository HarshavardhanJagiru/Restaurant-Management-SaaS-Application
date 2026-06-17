import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import Table from '../models/Table.js';

// Helper to get socket.io instance
const getIO = (req) => req.app.get('socketio');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
export const getOrders = async (req, res, next) => {
  try {
    const { status, limit } = req.query;
    const query = {};
    if (status) {
      query.status = status;
    }

    let queryBuilder = Order.find(query)
      .populate('table', 'tableNumber status')
      .populate('items.menuItem', 'name price imageUrl dietType')
      .populate('waiter', 'name')
      .sort({ createdAt: -1 });

    if (limit) {
      queryBuilder = queryBuilder.limit(parseInt(limit));
    }

    const orders = await queryBuilder;
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private/Customer
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('table', 'tableNumber status')
      .populate('items.menuItem', 'name price imageUrl dietType')
      .populate('waiter', 'name');

    if (order) {
      res.json(order);
    } else {
      res.status(404);
      next(new Error('Order not found'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new order (Waiter or QR Customer)
// @route   POST /api/orders
// @access  Public (so QR codes can order without credentials)
export const createOrder = async (req, res, next) => {
  try {
    const { tableId, items, customerPhone } = req.body;

    if (!items || items.length === 0) {
      res.status(400);
      return next(new Error('No items selected for order'));
    }

    // Resolve menu items from database to prevent price forgery
    const orderItems = [];
    for (const item of items) {
      const dbMenuItem = await MenuItem.findById(item.menuItem);
      if (!dbMenuItem) {
        res.status(404);
        return next(new Error(`Menu item not found: ${item.menuItem}`));
      }
      if (dbMenuItem.availability === 'out_of_stock') {
        res.status(400);
        return next(new Error(`Item ${dbMenuItem.name} is currently out of stock`));
      }

      orderItems.push({
        menuItem: item.menuItem,
        quantity: item.quantity,
        price: dbMenuItem.price, // Snapshotted price
        notes: item.notes || '',
        status: 'placed',
      });
    }

    // Auto-generate readable order number
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

    // Create the order
    const order = new Order({
      orderNumber,
      customerPhone,
      items: orderItems,
      status: 'placed',
      paymentStatus: 'pending',
    });

    if (tableId) {
      const table = await Table.findById(tableId);
      if (!table) {
        res.status(404);
        return next(new Error('Table not found'));
      }
      order.table = tableId;

      // Update Table state
      table.status = 'occupied';
      table.currentOrder = order._id;
      await table.save();
    }

    // If request has authenticated user, link it as waiter
    if (req.user) {
      order.waiter = req.user._id;
    }

    await order.save();

    // Populate order data for WebSocket emit
    const populatedOrder = await Order.findById(order._id)
      .populate('table', 'tableNumber status')
      .populate('items.menuItem', 'name price imageUrl dietType')
      .populate('waiter', 'name');

    // Notify kitchen panel & waiter dashboards
    const io = getIO(req);
    if (io) {
      io.emit('order-placed', populatedOrder);
      // If table status updated, notify too
      if (tableId) {
        const refreshedTable = await Table.findById(tableId).populate('currentOrder');
        io.emit('table-status-changed', refreshedTable);
      }
    }

    res.status(201).json(populatedOrder);
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Placed -> Preparing -> Ready -> Served)
// @route   PUT /api/orders/:id/status
// @access  Private (Waiter / Kitchen Staff)
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      return next(new Error('Order not found'));
    }

    order.status = status;

    // Track kitchen staff link
    if (status === 'preparing' && req.user && req.user.role === 'kitchen_staff') {
      order.kitchenStaff = req.user._id;
    }

    // Propagate status change to item levels if updating whole order status
    order.items.forEach(item => {
      if (status === 'preparing' && item.status === 'placed') item.status = 'preparing';
      if (status === 'ready' && (item.status === 'placed' || item.status === 'preparing')) item.status = 'ready';
      if (status === 'served') item.status = 'served';
    });

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('table', 'tableNumber status')
      .populate('items.menuItem', 'name price imageUrl dietType')
      .populate('waiter', 'name');

    // Socket Event Dispatch
    const io = getIO(req);
    if (io) {
      io.emit('order-status-update', populatedOrder);
    }

    res.json(populatedOrder);
  } catch (error) {
    next(error);
  }
};

// @desc    Update single order item status (useful for dish-by-dish preparing)
// @route   PUT /api/orders/:id/items/:itemId/status
// @access  Private (Kitchen Staff / Waiter)
export const updateOrderItemStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      return next(new Error('Order not found'));
    }

    const item = order.items.id(req.params.itemId);
    if (!item) {
      res.status(404);
      return next(new Error('Order item not found'));
    }

    item.status = status;

    // Auto-update parent order state depending on overall item completion
    const allStatuses = order.items.map(i => i.status);
    if (allStatuses.every(s => s === 'served')) {
      order.status = 'served';
    } else if (allStatuses.every(s => s === 'ready' || s === 'served')) {
      order.status = 'ready';
    } else if (allStatuses.some(s => s === 'preparing' || s === 'ready')) {
      order.status = 'preparing';
    }

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('table', 'tableNumber status')
      .populate('items.menuItem', 'name price imageUrl dietType')
      .populate('waiter', 'name');

    const io = getIO(req);
    if (io) {
      io.emit('order-status-update', populatedOrder);
    }

    res.json(populatedOrder);
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private (Waiter / Admin)
export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      return next(new Error('Order not found'));
    }

    order.status = 'cancelled';
    await order.save();

    // Release table
    if (order.table) {
      const table = await Table.findById(order.table);
      if (table) {
        table.status = 'free';
        table.currentOrder = null;
        await table.save();

        const io = getIO(req);
        if (io) {
          io.emit('table-status-changed', table);
        }
      }
    }

    const populatedOrder = await Order.findById(order._id)
      .populate('table', 'tableNumber status')
      .populate('items.menuItem', 'name price imageUrl dietType')
      .populate('waiter', 'name');

    const io = getIO(req);
    if (io) {
      io.emit('order-status-update', populatedOrder);
    }

    res.json(populatedOrder);
  } catch (error) {
    next(error);
  }
};
