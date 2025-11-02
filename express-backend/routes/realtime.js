const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Update spot occupancy (for enforcement officers)
router.put('/spots/:spotId/occupancy', async (req, res) => {
  try {
    const { spotId } = req.params;
    const { is_occupied } = req.body;

    await db.query(
      'UPDATE parking_spots SET is_occupied = $1, updated_at = NOW() WHERE id = $2',
      [is_occupied, spotId]
    );

    // If spot becomes vacant, clear reservation
    if (!is_occupied) {
      await db.query(
        'UPDATE parking_spots SET is_reserved = false WHERE id = $1',
        [spotId]
      );
    }

    res.json({ message: 'Spot status updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update spot status' });
  }
});

// Check-in to parking spot
router.post('/checkin', async (req, res) => {
  try {
    const { booking_id } = req.body;
    const user_id = req.user.id;

    // Verify booking belongs to user
    const booking = await db.query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
      [booking_id, user_id]
    );

    if (booking.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Update booking and spot status
    await db.query('BEGIN');
    
    await db.query(
      'UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2',
      ['active', booking_id]
    );

    await db.query(
      'UPDATE parking_spots SET is_occupied = true, is_reserved = false WHERE id = $1',
      [booking.rows[0].parking_spot_id]
    );

    await db.query('COMMIT');

    res.json({ message: 'Checked in successfully' });
  } catch (error) {
    await db.query('ROLLBACK');
    res.status(500).json({ error: 'Check-in failed' });
  }
});

// Check-out from parking spot
router.post('/checkout', async (req, res) => {
  try {
    const { booking_id } = req.body;
    const user_id = req.user.id;

    const booking = await db.query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
      [booking_id, user_id]
    );

    if (booking.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    await db.query('BEGIN');

    await db.query(
      'UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2',
      ['completed', booking_id]
    );

    await db.query(
      'UPDATE parking_spots SET is_occupied = false WHERE id = $1',
      [booking.rows[0].parking_spot_id]
    );

    await db.query('COMMIT');

    res.json({ message: 'Checked out successfully' });
  } catch (error) {
    await db.query('ROLLBACK');
    res.status(500).json({ error: 'Check-out failed' });
  }
});

module.exports = router;