import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi'],
    required: true,
  },
  amountPaid: {
    type: Number,
    required: true,
  },
  transactionId: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

export default mongoose.model('Payment', paymentSchema);
