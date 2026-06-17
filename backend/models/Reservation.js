import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
  },
  customerPhone: {
    type: String,
    required: true,
  },
  customerEmail: {
    type: String,
    default: '',
  },
  table: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: true,
  },
  guestsCount: {
    type: Number,
    required: true,
    min: 1,
  },
  reservationTime: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'seated'],
    default: 'pending',
  },
  specialRequests: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

export default mongoose.model('Reservation', reservationSchema);
