import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  imageUrl: {
    type: String,
    default: '',
  },
  availability: {
    type: String,
    enum: ['available', 'out_of_stock'],
    default: 'available',
  },
  preparationTime: {
    type: Number,
    default: 15, // estimated time in minutes
  },
  dietType: {
    type: String,
    enum: ['veg', 'non_veg', 'egg'],
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model('MenuItem', menuItemSchema);
