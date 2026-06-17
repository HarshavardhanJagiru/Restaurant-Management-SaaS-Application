import MenuItem from '../models/MenuItem.js';

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
export const getMenuItems = async (req, res, next) => {
  try {
    const { category, search, dietType, availability } = req.query;
    const query = {};

    if (category) {
      query.category = category;
    }

    if (dietType) {
      query.dietType = dietType;
    }

    if (availability) {
      query.availability = availability;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const items = await MenuItem.find(query).populate('category', 'name slug');
    res.json(items);
  } catch (error) {
    next(error);
  }
};

// @desc    Create menu item
// @route   POST /api/menu
// @access  Private/Admin
export const createMenuItem = async (req, res, next) => {
  try {
    const { name, description, price, category, imageUrl, preparationTime, dietType } = req.body;

    if (!name || !description || price === undefined || !category || !dietType) {
      res.status(400);
      return next(new Error('Please fill in all required fields'));
    }

    const menuItemExists = await MenuItem.findOne({ name });

    if (menuItemExists) {
      res.status(400);
      return next(new Error('Menu item with this name already exists'));
    }

    const item = await MenuItem.create({
      name,
      description,
      price,
      category,
      imageUrl,
      preparationTime,
      dietType,
    });

    const populatedItem = await MenuItem.findById(item._id).populate('category', 'name slug');
    res.status(201).json(populatedItem);
  } catch (error) {
    next(error);
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Private/Admin
export const updateMenuItem = async (req, res, next) => {
  try {
    const { name, description, price, category, imageUrl, preparationTime, dietType, availability } = req.body;

    const item = await MenuItem.findById(req.params.id);

    if (item) {
      item.name = name || item.name;
      item.description = description || item.description;
      item.price = price !== undefined ? price : item.price;
      item.category = category || item.category;
      item.imageUrl = imageUrl !== undefined ? imageUrl : item.imageUrl;
      item.preparationTime = preparationTime !== undefined ? preparationTime : item.preparationTime;
      item.dietType = dietType || item.dietType;
      item.availability = availability || item.availability;

      const updatedItem = await item.save();
      const populatedItem = await MenuItem.findById(updatedItem._id).populate('category', 'name slug');
      res.json(populatedItem);
    } else {
      res.status(404);
      next(new Error('Menu item not found'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle menu item availability
// @route   PUT /api/menu/:id/availability
// @access  Private/Admin/Kitchen
export const toggleAvailability = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (item) {
      item.availability = item.availability === 'available' ? 'out_of_stock' : 'available';
      const updatedItem = await item.save();
      const populatedItem = await MenuItem.findById(updatedItem._id).populate('category', 'name slug');
      res.json(populatedItem);
    } else {
      res.status(404);
      next(new Error('Menu item not found'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Private/Admin
export const deleteMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (item) {
      await MenuItem.deleteOne({ _id: req.params.id });
      res.json({ message: 'Menu item removed' });
    } else {
      res.status(404);
      next(new Error('Menu item not found'));
    }
  } catch (error) {
    next(error);
  }
};
