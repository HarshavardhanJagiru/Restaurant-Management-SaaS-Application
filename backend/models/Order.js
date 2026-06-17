import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  }, // Snapshotted price at order time
  notes: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['placed', 'preparing', 'ready', 'served'],
    default: 'placed',
  },
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  table: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    default: null, // null for takeaway/delivery
  },
  customerPhone: {
    type: String,
    default: '',
  },
  items: [orderItemSchema],
  status: {
    type: String,
    enum: ['placed', 'preparing', 'ready', 'served', 'cancelled'],
    default: 'placed',
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  taxAmount: {
    type: Number,
    required: true,
    default: 0,
  }, // 18% GST
  serviceCharge: {
    type: Number,
    required: true,
    default: 0,
  }, // 5% Service Charge
  grandTotal: {
    type: Number,
    required: true,
    default: 0,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending',
  },
  waiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  kitchenStaff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, {
  timestamps: true,
});

// Auto-calculate bill values before save
orderSchema.pre('save', function(next) {
  this.totalAmount = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  this.taxAmount = parseFloat((this.totalAmount * 0.18).toFixed(2));
  this.serviceCharge = parseFloat((this.totalAmount * 0.05).toFixed(2));
  this.grandTotal = parseFloat((this.totalAmount + this.taxAmount + this.serviceCharge).toFixed(2));
  next();
});

export default mongoose.model('Order', orderSchema);
