import express from 'express';
import {
  getReservations,
  createReservation,
  updateReservationStatus,
} from '../controllers/reservationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getReservations)
  .post(protect, authorize('admin', 'waiter'), createReservation);

router.route('/:id/status')
  .put(protect, authorize('admin', 'waiter'), updateReservationStatus);

export default router;
