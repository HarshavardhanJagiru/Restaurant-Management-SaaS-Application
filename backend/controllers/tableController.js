import Table from '../models/Table.js';
import QRCode from 'qrcode';

// @desc    Get all tables
// @route   GET /api/tables
// @access  Private
export const getTables = async (req, res, next) => {
  try {
    const tables = await Table.find({}).populate('currentOrder');
    res.json(tables);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new table
// @route   POST /api/tables
// @access  Private/Admin
export const createTable = async (req, res, next) => {
  try {
    const { tableNumber, capacity } = req.body;

    if (!tableNumber || !capacity) {
      res.status(400);
      return next(new Error('Table number and capacity are required'));
    }

    const tableExists = await Table.findOne({ tableNumber });

    if (tableExists) {
      res.status(400);
      return next(new Error('Table number already exists'));
    }

    const table = new Table({
      tableNumber,
      capacity,
    });

    // Generate QR Code URL referencing the frontend mobile order portal
    // Assuming Vite dev server runs on http://localhost:5173
    const origin = process.env.FRONTEND_URL || 'http://localhost:5173';
    const customerOrderUrl = `${origin}/customer-order/table/${table._id}`;
    
    // Generate QR code as a base64 Data URL
    const qrCodeDataUrl = await QRCode.toDataURL(customerOrderUrl, {
      color: {
        dark: '#0f172a',  // slate-900
        light: '#ffffff', // transparent/white background
      },
      width: 300,
    });

    table.qrCodeUrl = qrCodeDataUrl;
    await table.save();

    res.status(201).json(table);
  } catch (error) {
    next(error);
  }
};

// @desc    Update table status
// @route   PUT /api/tables/:id/status
// @access  Private/Admin/Waiter
export const updateTableStatus = async (req, res, next) => {
  try {
    const { status, currentOrder } = req.body;
    const table = await Table.findById(req.params.id);

    if (table) {
      table.status = status || table.status;
      if (currentOrder !== undefined) {
        table.currentOrder = currentOrder;
      }
      
      const updatedTable = await table.save();
      
      // Notify client side via sockets (will hook this in server.js)
      if (req.app.get('socketio')) {
        req.app.get('socketio').emit('table-status-changed', updatedTable);
      }

      res.json(updatedTable);
    } else {
      res.status(404);
      next(new Error('Table not found'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a table
// @route   DELETE /api/tables/:id
// @access  Private/Admin
export const deleteTable = async (req, res, next) => {
  try {
    const table = await Table.findById(req.params.id);

    if (table) {
      await Table.deleteOne({ _id: req.params.id });
      res.json({ message: 'Table removed' });
    } else {
      res.status(404);
      next(new Error('Table not found'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get single table
// @route   GET /api/tables/:id
// @access  Public
export const getTableById = async (req, res, next) => {
  try {
    const table = await Table.findById(req.params.id);
    if (table) {
      res.json(table);
    } else {
      res.status(404);
      next(new Error('Table not found'));
    }
  } catch (error) {
    next(error);
  }
};
