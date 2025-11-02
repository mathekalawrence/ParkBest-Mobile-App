const express = require('express');
const router = express.Router();
const db = require('../config/database');
const axios = require('axios');

// M-Pesa STK Push
router.post('/mpesa/stkpush', async (req, res) => {
  try {
    const { phone, amount, booking_id } = req.body;

    // Get M-Pesa access token
    const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
    
    const tokenResponse = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });

    const accessToken = tokenResponse.data.access_token;

    // Generate timestamp
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    
    // Generate password
    const password = Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`).toString('base64');

    // STK Push request
    const stkResponse = await axios.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phone,
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: `${process.env.BASE_URL}/api/payments/mpesa/callback`,
      AccountReference: `PARKBEST-${booking_id}`,
      TransactionDesc: 'ParkBest Parking Payment'
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    // Store payment request
    await db.query(
      'INSERT INTO payments (booking_id, amount, phone, checkout_request_id, status) VALUES ($1, $2, $3, $4, $5)',
      [booking_id, amount, phone, stkResponse.data.CheckoutRequestID, 'pending']
    );

    res.json({
      message: 'Payment request sent',
      checkout_request_id: stkResponse.data.CheckoutRequestID
    });
  } catch (error) {
    console.error('M-Pesa STK Push error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Payment request failed' });
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

      // Update payment status
      const paymentResult = await db.query(
        'UPDATE payments SET status = $1, mpesa_receipt = $2, completed_at = NOW() WHERE checkout_request_id = $3 RETURNING *',
        ['completed', mpesaReceiptNumber, checkoutRequestId]
      );
      const payment = paymentResult.rows[0];

      // Update booking status
      await db.query(
        'UPDATE bookings SET payment_status = $1 WHERE id = $2',
        ['paid', payment.booking_id]
      );

      // Send payment confirmation SMS
      const NotificationService = require('../utils/notifications');
      const bookingResult = await db.query(`
        SELECT u.phone, b.*, ps.spot_number, pz.name as zone_name
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN parking_spots ps ON b.parking_spot_id = ps.id
        JOIN parking_zones pz ON ps.parking_zone_id = pz.id
        WHERE b.id = $1
      `, [payment.booking_id]);

      if (bookingResult.rows.length > 0) {
        const booking = bookingResult.rows[0];
        await NotificationService.sendPaymentConfirmation(booking.phone, {
          amount: payment.amount,
          mpesa_receipt: mpesaReceiptNumber
        });
      }

    } else {
      // Payment failed
      await db.query(
        'UPDATE payments SET status = $1 WHERE checkout_request_id = $2',
        ['failed', checkoutRequestId]
      );
    }

    res.json({ message: 'Callback processed' });
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    res.status(500).json({ error: 'Callback processing failed' });
  }
});

// Check payment status
router.get('/status/:checkoutRequestId', async (req, res) => {
  try {
    const { checkoutRequestId } = req.params;

    const result = await db.query(
      'SELECT * FROM payments WHERE checkout_request_id = $1',
      [checkoutRequestId]
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