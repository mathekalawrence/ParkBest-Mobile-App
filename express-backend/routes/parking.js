const express = require('express');
const router = express.Router();
const db = require('../config/database');
const Joi = require('joi');

// Validation schemas
const bookingSchema = Joi.object({
  parking_zone_id: Joi.string().required(),
  vehicle_plate: Joi.string().required(),
  duration_hours: Joi.number().min(1).max(24).required(),
  start_time: Joi.date().iso().required()
});

// Get available parking zones
router.get('/zones', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        pz.*,
        COUNT(ps.id) as total_spots,
        COUNT(ps.id) FILTER (WHERE NOT ps.is_occupied AND NOT ps.is_reserved) as available_spots
      FROM parking_zones pz
      LEFT JOIN parking_spots ps ON pz.id = ps.parking_zone_id
      WHERE pz.is_active = true
      GROUP BY pz.id
      ORDER BY pz.name
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch parking zones' });
  }
});

// Get available spots in a specific zone
router.get('/zones/:zoneId/spots', async (req, res) => {
  try {
    const { zoneId } = req.params;

    const result = await db.query(
      'SELECT * FROM parking_spots WHERE parking_zone_id = $1 AND is_occupied = false AND is_reserved = false',
      [zoneId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch available spots' });
  }
});

// Book a parking spot
router.post('/book', async (req, res) => {
  try {
    const { error: validationError } = bookingSchema.validate(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError.details[0].message });
    }

    const { parking_zone_id, vehicle_plate, duration_hours, start_time } = req.body;
    const user_id = req.user?.id; // Assuming auth middleware sets req.user

    // Calculate end time and total cost
    const startDateTime = new Date(start_time);
    const endDateTime = new Date(startDateTime.getTime() + (duration_hours * 60 * 60 * 1000));

    // Get zone pricing
    const zoneResult = await db.query(
      'SELECT hourly_rate FROM parking_zones WHERE id = $1',
      [parking_zone_id]
    );

    if (zoneResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid parking zone' });
    }

    const zone = zoneResult.rows[0];

    const total_cost = zone.hourly_rate * duration_hours;

    // Find available spot
    const spotResult = await db.query(
      'SELECT id FROM parking_spots WHERE parking_zone_id = $1 AND is_occupied = false AND is_reserved = false LIMIT 1',
      [parking_zone_id]
    );

    if (spotResult.rows.length === 0) {
      return res.status(400).json({ error: 'No available spots in this zone' });
    }

    const availableSpot = spotResult.rows[0];

    await db.query('BEGIN');

    // Create booking
    const bookingResult = await db.query(
      'INSERT INTO bookings (user_id, parking_spot_id, vehicle_plate, start_time, end_time, total_cost, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [user_id, availableSpot.id, vehicle_plate, startDateTime.toISOString(), endDateTime.toISOString(), total_cost, 'confirmed']
    );

    const booking = bookingResult.rows[0];

    // Reserve the spot
    await db.query(
      'UPDATE parking_spots SET is_reserved = true WHERE id = $1',
      [availableSpot.id]
    );

    await db.query('COMMIT');

    res.status(201).json({
      message: 'Parking spot booked successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ error: 'Booking failed' });
  }
});

// Get user bookings
router.get('/bookings', async (req, res) => {
  try {
    const user_id = req.user?.id;

    const result = await db.query(`
      SELECT 
        b.*,
        ps.spot_number,
        pz.name as zone_name,
        pz.location as zone_location
      FROM bookings b
      JOIN parking_spots ps ON b.parking_spot_id = ps.id
      JOIN parking_zones pz ON ps.parking_zone_id = pz.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `, [user_id]);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

module.exports = router;