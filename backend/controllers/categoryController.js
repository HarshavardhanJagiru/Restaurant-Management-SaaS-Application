import Category from '../models/Category.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      res.status(400);
      return next(new Error('Category name is required'));
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const categoryExists = await Category.findOne({ slug });

    if (categoryExists) {
      res.status(400);
      return next(new Error('Category already exists'));
    }

    const category = await Category.create({
      name,
      slug,
      description,
    });

    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (category) {
      await Category.deleteOne({ _id: req.params.id });
      res.json({ message: 'Category removed' });
    } else {
      res.status(404);
      next(new Error('Category not found'));
    }
  } catch (error) {
    next(error);
  }
};
