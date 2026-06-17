import express from 'express';
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  updateOrderItemStatus,
  cancelOrder,
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getOrders)
  .post(createOrder); // Open for QR-Based Order placements

router.route('/:id')
  .get(getOrderById); // Open for live customer tracking

router.route('/:id/status')
  .put(protect, authorize('admin', 'waiter', 'kitchen_staff'), updateOrderStatus);

router.route('/:id/items/:itemId/status')
  .put(protect, authorize('admin', 'waiter', 'kitchen_staff'), updateOrderItemStatus);

router.route('/:id/cancel')
  .put(protect, authorize('admin', 'waiter'), cancelOrder);

export default router;
