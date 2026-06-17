import express from 'express';
import {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  toggleAvailability,
  deleteMenuItem,
} from '../controllers/menuController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getMenuItems)
  .post(protect, authorize('admin'), createMenuItem);

router.route('/:id')
  .put(protect, authorize('admin'), updateMenuItem)
  .delete(protect, authorize('admin'), deleteMenuItem);

router.route('/:id/availability')
  .put(protect, authorize('admin', 'kitchen_staff'), toggleAvailability);

export default router;
