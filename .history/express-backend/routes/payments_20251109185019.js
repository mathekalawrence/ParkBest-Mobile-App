const express = require('express');
const router = express.Router();
const db = require('../config/database');
const mpesaService = require('../services/mpesaService');
const authenticateToken = require('../middleware/auth');

// Initiate M-Pesa payment
router.post('/mpesa/initiate', authenticateToken, async (req, res) => {
  try {
    const { booking_id, phone_number } = req.body;

    // Get booking details
    const bookingResult = await db.query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
      [booking_id, req.user.id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];
    const amount = Math.round(booking.total_amount);

    // Initiate STK Push
    const stkResponse = await mpesaService.initiateSTKPush(
      phone_number,
      amount,
      `PB${booking_id}`,
      `ParkBest Parking Payment`
    );

    // Save payment record
    await db.query(
      `INSERT INTO payments (booking_id, user_id, amount, payment_method, mpesa_checkout_request_id, status)
       VALUES ($1, $2, $3, 'mpesa', $4, 'pending')`,
      [booking_id, req.user.id, amount, stkResponse.CheckoutRequestID]
    );

    res.json({
      success: true,
      message: 'Payment initiated. Check your phone for M-Pesa prompt.',
      checkout_request_id: stkResponse.CheckoutRequestID
    });

  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ error: 'Payment initiation failed' });
  }
});

// M-Pesa callback
router.post('/mpesa/callback', async (req, res) => {
  try {
    const { Body } = req.body;
    const { stkCallback } = Body;
    
    const checkoutRequestId = stkCallback.CheckoutRequestID;
    const resultCode = stkCallback.ResultCode;

    if (resultCode === 0) {
      // Payment successful
      const mpesaReceiptNumber = stkCallback.CallbackMetadata.Item.find(
        item => item.Name === 'MpesaReceiptNumber'
      ).Value;

      await db.query(
        `UPDATE payments SET status = 'completed', mpesa_receipt_number = $1, completed_at = NOW()
         WHERE mpesa_checkout_request_id = $2`,
        [mpesaReceiptNumber, checkoutRequestId]
      );

      // Update booking status
      await db.query(
        `UPDATE bookings SET status = 'confirmed' 
         WHERE id = (SELECT booking_id FROM payments WHERE mpesa_checkout_request_id = $1)`,
        [checkoutRequestId]
      );
    } else {
      // Payment failed
      await db.query(
        `UPDATE payments SET status = 'failed' WHERE mpesa_checkout_request_id = $1`,
        [checkoutRequestId]
      );
    }

    res.json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (error) {
    console.error('Callback error:', error);
    res.json({ ResultCode: 1, ResultDesc: 'Error' });
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

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to check payment status' });
  }
});

module.exports = router;