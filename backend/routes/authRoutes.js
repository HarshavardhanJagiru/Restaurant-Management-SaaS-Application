import express from 'express';
import {
  loginUser,
  registerUser,
  getMe,
  getUsers,
  toggleUserActive,
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', protect, authorize('admin'), registerUser);
router.get('/me', protect, getMe);
router.get('/users', protect, authorize('admin'), getUsers);
router.put('/users/:id/active', protect, authorize('admin'), toggleUserActive);

export default router;
