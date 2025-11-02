const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Dashboard analytics
router.get('/dashboard', async (req, res) => {
  try {
    // Get dashboard metrics
    const metrics = await db.query(`
      SELECT 
        (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'completed') as total_revenue,
        (SELECT COUNT(*) FROM bookings WHERE status = 'active') as active_bookings,
        (SELECT COUNT(*) FROM parking_zones WHERE is_active = true) as total_zones,
        (SELECT COUNT(*) FROM parking_spots) as total_spots,
        (SELECT COUNT(*) FROM parking_spots WHERE is_occupied = true) as occupied_spots
    `);

    const data = metrics.rows[0];
    const occupancyRate = data.total_spots > 0 ? (data.occupied_spots / data.total_spots) * 100 : 0;

    res.json({
      totalRevenue: parseFloat(data.total_revenue),
      activeBookings: parseInt(data.active_bookings),
      totalZones: parseInt(data.total_zones),
      occupancyRate: Math.round(occupancyRate * 100) / 100
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get all bookings with pagination
router.get('/bookings', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await db.query('SELECT COUNT(*) FROM bookings');
    const total = parseInt(countResult.rows[0].count);

    // Get bookings with pagination
    const result = await db.query(`
      SELECT 
        b.*,
        u.full_name,
        u.email,
        ps.spot_number,
        pz.name as zone_name,
        pz.location as zone_location,
        p.status as payment_status,
        p.amount as payment_amount,
        p.mpesa_receipt
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN parking_spots ps ON b.parking_spot_id = ps.id
      JOIN parking_zones pz ON ps.parking_zone_id = pz.id
      LEFT JOIN payments p ON b.id = p.booking_id
      ORDER BY b.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    res.json({
      bookings: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Manage parking zones
router.post('/zones', async (req, res) => {
  try {
    const { name, location, hourly_rate, total_spots } = req.body;

    const result = await db.query(
      'INSERT INTO parking_zones (name, location, hourly_rate, total_spots, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, location, hourly_rate, total_spots, true]
    );

    const data = result.rows[0];

    res.status(201).json({
      message: 'Parking zone created successfully',
      zone: data
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create parking zone' });
  }
});

// Update zone pricing
router.put('/zones/:zoneId/pricing', async (req, res) => {
  try {
    const { zoneId } = req.params;
    const { hourly_rate } = req.body;

    const result = await db.query(
      'UPDATE parking_zones SET hourly_rate = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [hourly_rate, zoneId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Zone not found' });
    }

    const data = result.rows[0];

    res.json({
      message: 'Pricing updated successfully',
      zone: data
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update pricing' });
  }
});

// Revenue reports
router.get('/reports/revenue', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let query = `
      SELECT 
        p.amount,
        p.completed_at,
        pz.name as zone_name
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN parking_spots ps ON b.parking_spot_id = ps.id
      JOIN parking_zones pz ON ps.parking_zone_id = pz.id
      WHERE p.status = 'completed'
    `;

    const params = [];
    if (start_date) {
      params.push(start_date);
      query += ` AND p.completed_at >= $${params.length}`;
    }
    if (end_date) {
      params.push(end_date);
      query += ` AND p.completed_at <= $${params.length}`;
    }

    const result = await db.query(query, params);
    const data = result.rows;

    // Group by zone
    const revenueByZone = data.reduce((acc, payment) => {
      const zoneName = payment.zone_name || 'Unknown';
      acc[zoneName] = (acc[zoneName] || 0) + parseFloat(payment.amount);
      return acc;
    }, {});

    const totalRevenue = data.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

    res.json({
      totalRevenue,
      revenueByZone,
      totalTransactions: data.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate revenue report' });
  }
});

module.exports = router;