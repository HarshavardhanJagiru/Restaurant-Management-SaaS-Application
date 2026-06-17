import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema({
  tableNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
  },
  status: {
    type: String,
    enum: ['free', 'occupied', 'reserved'],
    default: 'free',
  },
  currentOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null,
  },
  qrCodeUrl: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

export default mongoose.model('Table', tableSchema);
