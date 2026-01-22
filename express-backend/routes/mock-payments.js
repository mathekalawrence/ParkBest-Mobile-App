const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authenticateToken = require('../middleware/auth');

// Mock M-Pesa STK Push for testing
router.post('/mpesa/initiate', authenticateToken, async (req, res) => {
  try {
    const { booking_id, phone_number } = req.body;
    console.log('🔄 Mock M-Pesa payment initiated');
    console.log('📱 Phone:', phone_number);
    console.log('📋 Booking ID:', booking_id);

    // Get booking details
    const bookingResult = await db.query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
      [booking_id, req.user.id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];
    const amount = Math.round(booking.total_cost);
    
    // Generate mock checkout request ID
    const checkoutRequestId = `ws_CO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Save payment record
    await db.query(
      `INSERT INTO payments (booking_id, user_id, amount, payment_method, mpesa_checkout_request_id, status)
       VALUES ($1, $2, $3, 'mpesa', $4, 'pending')`,
      [booking_id, req.user.id, amount, checkoutRequestId]
    );

    console.log('✅ Mock payment record created');

    // Simulate successful payment after 3 seconds
    setTimeout(async () => {
      try {
        await db.query(
          `UPDATE payments SET status = 'completed', mpesa_receipt_number = $1, completed_at = NOW()
           WHERE mpesa_checkout_request_id = $2`,
          [`MOCK${Date.now()}`, checkoutRequestId]
        );

        await db.query(
          `UPDATE bookings SET status = 'confirmed' WHERE id = $1`,
          [booking_id]
        );

        console.log('✅ Mock payment completed automatically');
      } catch (error) {
        console.error('❌ Mock payment completion error:', error);
      }
    }, 3000);

    res.json({
      success: true,
      message: 'Mock payment initiated. Will complete automatically in 3 seconds.',
      checkout_request_id: checkoutRequestId
    });

  } catch (error) {
    console.error('❌ Mock payment error:', error);
    res.status(500).json({ error: 'Payment initiation failed' });
  }
});

// Check payment status
router.get('/status/:checkout_request_id', authenticateToken, async (req, res) => {
  try {
    const { checkout_request_id } = req.params;

    const result = await db.query(
      'SELECT status, mpesa_receipt_number FROM payments WHERE mpesa_checkout_request_id = $1',
      [checkout_request_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    console.log('📊 Payment status check:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Status check error:', error);
    res.status(500).json({ error: 'Failed to check payment status' });
  }
});

module.exports = router;