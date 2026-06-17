import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      return next(new Error('Please provide email and password'));
    }

    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      if (!user.active) {
        res.status(401);
        return next(new Error('Account is disabled. Please contact the administrator.'));
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      next(new Error('Invalid email or password'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new staff member
// @route   POST /api/auth/register
// @access  Private/Admin
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      res.status(400);
      return next(new Error('Please fill all required fields'));
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      return next(new Error('User already exists with this email'));
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(400);
      next(new Error('Invalid user data'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404);
      next(new Error('User not found'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all staff members
// @route   GET /api/auth/users
// @access  Private/Admin
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active status
// @route   PUT /api/auth/users/:id/active
// @access  Private/Admin
export const toggleUserActive = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      if (user._id.toString() === req.user._id.toString()) {
        res.status(400);
        return next(new Error('You cannot deactivate your own admin account'));
      }
      user.active = !user.active;
      await user.save();
      res.json({ message: `User status changed to ${user.active ? 'active' : 'inactive'}`, user });
    } else {
      res.status(404);
      next(new Error('User not found'));
    }
  } catch (error) {
    next(error);
  }
};
