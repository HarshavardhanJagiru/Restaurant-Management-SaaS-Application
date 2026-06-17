import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes middleware
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devsecretkeyforrestaurantmanagementsystemsaas123456');

      // Get user from token (exclude password)
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user || !req.user.active) {
        res.status(401);
        return next(new Error('Not authorized, user inactive or not found'));
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      next(new Error('Not authorized, token failed'));
    }
  }

  if (!token) {
    res.status(401);
    next(new Error('Not authorized, no token provided'));
  }
};

// Role-based authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error(`Role ${req.user ? req.user.role : 'Guest'} is not authorized to access this resource`));
    }
    next();
  };
};
