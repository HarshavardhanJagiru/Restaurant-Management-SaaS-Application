import Reservation from '../models/Reservation.js';
import Table from '../models/Table.js';

// @desc    Get all reservations
// @route   GET /api/reservations
// @access  Private
export const getReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find({}).populate('table', 'tableNumber capacity');
    res.json(reservations);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a reservation
// @route   POST /api/reservations
// @access  Private/Admin/Waiter
export const createReservation = async (req, res, next) => {
  try {
    const { customerName, customerPhone, customerEmail, table, guestsCount, reservationTime, specialRequests } = req.body;

    if (!customerName || !customerPhone || !table || !guestsCount || !reservationTime) {
      res.status(400);
      return next(new Error('Please fill in all required fields'));
    }

    const selectedTable = await Table.findById(table);
    if (!selectedTable) {
      res.status(404);
      return next(new Error('Table not found'));
    }

    if (selectedTable.capacity < guestsCount) {
      res.status(400);
      return next(new Error(`Table capacity (${selectedTable.capacity}) is too small for ${guestsCount} guests`));
    }

    const reservation = await Reservation.create({
      customerName,
      customerPhone,
      customerEmail,
      table,
      guestsCount,
      reservationTime,
      specialRequests,
      status: 'confirmed',
    });

    const populatedRes = await Reservation.findById(reservation._id).populate('table', 'tableNumber capacity');
    res.status(201).json(populatedRes);
  } catch (error) {
    next(error);
  }
};

// @desc    Update reservation status
// @route   PUT /api/reservations/:id/status
// @access  Private/Admin/Waiter
export const updateReservationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const reservation = await Reservation.findById(req.params.id);

    if (reservation) {
      reservation.status = status || reservation.status;
      await reservation.save();

      // If status is 'seated', occupy the table
      if (status === 'seated') {
        const table = await Table.findById(reservation.table);
        if (table) {
          table.status = 'occupied';
          await table.save();
          
          if (req.app.get('socketio')) {
            req.app.get('socketio').emit('table-status-changed', table);
          }
        }
      }

      const populatedRes = await Reservation.findById(reservation._id).populate('table', 'tableNumber capacity');
      res.json(populatedRes);
    } else {
      res.status(404);
      next(new Error('Reservation not found'));
    }
  } catch (error) {
    next(error);
  }
};
