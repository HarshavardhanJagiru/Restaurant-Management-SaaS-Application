import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Middlewares
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import tableRoutes from './routes/tableRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

// Models for Dev Seeding
import User from './models/User.js';
import Category from './models/Category.js';
import MenuItem from './models/MenuItem.js';
import Table from './models/Table.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS settings
const io = new Server(server, {
  cors: {
    origin: '*', // for development ease
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Store socket instance for controllers access
app.set('socketio', io);

// Express Parser & CORS
app.use(cors());
app.use(express.json());

// Database Connection
connectDB();

// API Route Bindings
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

// Dev Seed Route for bootstrapping database easily
app.get('/api/seed', async (req, res, next) => {
  try {
    // 1. Seed Staff Users
    await User.deleteMany({});
    const admin = await User.create({
      name: 'Chef Admin',
      email: 'admin@restaurant.com',
      password: 'admin123',
      role: 'admin',
    });
    const waiter = await User.create({
      name: 'James Waiter',
      email: 'waiter@restaurant.com',
      password: 'waiter123',
      role: 'waiter',
    });
    const kitchen = await User.create({
      name: 'Elena Kitchen',
      email: 'kitchen@restaurant.com',
      password: 'kitchen123',
      role: 'kitchen_staff',
    });

    // 2. Seed Categories
    await Category.deleteMany({});
    const beverages = await Category.create({ name: 'Beverages', slug: 'beverages', description: 'Soft drinks, milkshakes, and hot drinks' });
    const starters = await Category.create({ name: 'Starters', slug: 'starters', description: 'Crispy and savory appetizers' });
    const mains = await Category.create({ name: 'Mains', slug: 'mains', description: 'Signature core dishes and curries' });
    const desserts = await Category.create({ name: 'Desserts', slug: 'desserts', description: 'Sweet ending treats' });

    // 3. Seed MenuItems
    await MenuItem.deleteMany({});
    await MenuItem.create([
      { name: 'Fresh Mint Mojito', description: 'Refreshing lime, cooling mint, and club soda', price: 180, category: beverages._id, dietType: 'veg', preparationTime: 5 },
      { name: 'Cold Brew Coffee', description: '24-hour steeped iced coffee blend', price: 210, category: beverages._id, dietType: 'veg', preparationTime: 5 },
      { name: 'Crispy Spring Rolls', description: 'Deep-fried golden pastry sheets stuffed with minced vegetables', price: 280, category: starters._id, dietType: 'veg', preparationTime: 12 },
      { name: 'Tandoori Paneer Tikka', description: 'Paneer cubes marinated in yogurt spices, grilled in clay tandoor oven', price: 340, category: starters._id, dietType: 'veg', preparationTime: 15 },
      { name: 'Chilli Chicken Dry', description: 'Diced chicken tossed with fresh bell peppers, onions, and dark soy sauce', price: 380, category: starters._id, dietType: 'non_veg', preparationTime: 15 },
      { name: 'Paneer Butter Masala', description: 'Cottage cheese chunks cooked in rich creamy sweet tomato cashew gravy', price: 420, category: mains._id, dietType: 'veg', preparationTime: 20 },
      { name: 'Butter Chicken Signature', description: 'Clay-oven baked shredded chicken in premium spiced velvety buttery tomato sauce', price: 480, category: mains._id, dietType: 'non_veg', preparationTime: 20 },
      { name: 'Classic Sizzling Brownie', description: 'Rich chocolate walnut brownie on sizzling iron skillet with vanilla ice cream', price: 260, category: desserts._id, dietType: 'egg', preparationTime: 8 },
    ]);

    // 4. Seed Tables
    const QRCode = (await import('qrcode')).default;
    await Table.deleteMany({});
    const tablesData = [
      { tableNumber: 1, capacity: 2 },
      { tableNumber: 2, capacity: 2 },
      { tableNumber: 3, capacity: 4 },
      { tableNumber: 4, capacity: 4 },
      { tableNumber: 5, capacity: 6 },
      { tableNumber: 6, capacity: 8 },
    ];

    for (const t of tablesData) {
      const table = new Table(t);
      const origin = process.env.FRONTEND_URL || 'http://localhost:5173';
      const customerOrderUrl = `${origin}/customer-order/table/${table._id}`;
      table.qrCodeUrl = await QRCode.toDataURL(customerOrderUrl, { width: 300 });
      await table.save();
    }

    res.json({
      message: 'Database seeded successfully with default values!',
      staff: {
        admin: 'admin@restaurant.com / admin123',
        waiter: 'waiter@restaurant.com / waiter123',
        kitchen: 'kitchen@restaurant.com / kitchen123'
      }
    });
  } catch (error) {
    next(error);
  }
});

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  console.log(`Socket Client Connected: ${socket.id}`);

  // Client joins rooms for specific notifications
  socket.on('join-room', (roomName) => {
    socket.join(roomName);
    console.log(`Socket ${socket.id} joined room: ${roomName}`);
  });

  socket.on('disconnect', () => {
    console.log(`Socket Client Disconnected: ${socket.id}`);
  });
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', time: new Date() });
});

// Catch 404 & Central Errors
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
