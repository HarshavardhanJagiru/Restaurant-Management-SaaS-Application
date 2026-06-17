import express from 'express';
import {
  getTables,
  getTableById,
  createTable,
  updateTableStatus,
  deleteTable,
} from '../controllers/tableController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getTables)
  .post(protect, authorize('admin'), createTable);

router.route('/:id')
  .get(getTableById) // Public GET route for scanning customers
  .delete(protect, authorize('admin'), deleteTable);

router.route('/:id/status')
  .put(protect, authorize('admin', 'waiter'), updateTableStatus);

export default router;

