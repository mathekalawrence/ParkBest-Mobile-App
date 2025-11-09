const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

// Admin authentication middleware
const adminAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Admin token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const result = await db.query(
      'SELECT id, username, role FROM admin_users WHERE id = $1',
      [decoded.adminId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid admin token' });
    }

    req.admin = result.rows[0];
    next();
  } catch (error) {
    res.status(401).json({ error: 'Admin authentication failed' });
  }
};

// Validation schemas
const adminLoginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

const adminRegisterSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string().min(6).required()
});

const zoneSchema = Joi.object({
  name: Joi.string().required(),
  location: Joi.string().required(),
  hourly_rate: Joi.number().positive().required(),
  total_spots: Joi.number().integer().positive().required(),
  description: Joi.string().allow('').optional(),
  zone_type: Joi.string().optional(),
  features: Joi.array().optional()
});

// Admin registration
router.post('/register', async (req, res) => {
  try {
    const { error: validationError } = adminRegisterSchema.validate(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError.details[0].message });
    }

    const { username, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await db.query(
      'SELECT id FROM admin_users WHERE username = $1',
      [username]
    );

    if (existingAdmin.rows.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const result = await db.query(
      'INSERT INTO admin_users (username, password) VALUES ($1, $2) RETURNING id, username, role, created_at',
      [username, hashedPassword]
    );

    const admin = result.rows[0];

    res.status(201).json({
      message: 'Admin account created successfully',
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        created_at: admin.created_at
      }
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { error: validationError } = adminLoginSchema.validate(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError.details[0].message });
    }

    const { username, password } = req.body;

    const result = await db.query('SELECT * FROM admin_users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const admin = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { adminId: admin.id, username: admin.username, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Admin login successful',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get all users (registrations)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        id, email, full_name, phone, created_at,
        (SELECT COUNT(*) FROM bookings WHERE user_id = users.id) as total_bookings
      FROM users 
      ORDER BY created_at DESC
    `);

    res.json({ users: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user details with bookings
router.get('/users/:userId', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const bookingsResult = await db.query(`
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
    `, [userId]);

    res.json({
      user: userResult.rows[0],
      bookings: bookingsResult.rows
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

// Get all parking zones
router.get('/zones', adminAuth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        pz.*,
        COUNT(ps.id) as total_spots,
        COUNT(ps.id) FILTER (WHERE NOT ps.is_occupied AND NOT ps.is_reserved) as available_spots,
        COUNT(b.id) as total_bookings,
        COALESCE(SUM(b.total_cost), 0) as total_revenue
      FROM parking_zones pz
      LEFT JOIN parking_spots ps ON pz.id = ps.parking_zone_id
      LEFT JOIN bookings b ON ps.id = b.parking_spot_id
      GROUP BY pz.id
      ORDER BY pz.created_at DESC
    `);

    res.json({ zones: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch zones' });
  }
});

// Create parking zone
router.post('/zones', adminAuth, async (req, res) => {
  try {
    const { error: validationError } = zoneSchema.validate(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError.details[0].message });
    }

    const { name, location, hourly_rate, total_spots } = req.body;

    await db.query('BEGIN');

    // Create zone
    const zoneResult = await db.query(
      'INSERT INTO parking_zones (name, location, hourly_rate, total_spots) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, location, hourly_rate, total_spots]
    );

    const zone = zoneResult.rows[0];

    // Create parking spots
    for (let i = 1; i <= total_spots; i++) {
      await db.query(
        'INSERT INTO parking_spots (parking_zone_id, spot_number) VALUES ($1, $2)',
        [zone.id, i.toString().padStart(3, '0')]
      );
    }

    await db.query('COMMIT');

    res.status(201).json({
      message: 'Parking zone created successfully',
      zone
    });
  } catch (error) {
    await db.query('ROLLBACK');
    res.status(500).json({ error: 'Failed to create zone' });
  }
});

// Update parking zone
router.put('/zones/:zoneId', adminAuth, async (req, res) => {
  try {
    const { zoneId } = req.params;
    const { name, location, hourly_rate, is_active } = req.body;

    const result = await db.query(
      'UPDATE parking_zones SET name = $1, location = $2, hourly_rate = $3, is_active = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
      [name, location, hourly_rate, is_active, zoneId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Zone not found' });
    }

    res.json({
      message: 'Zone updated successfully',
      zone: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update zone' });
  }
});

// Get zone spots
router.get('/zones/:zoneId/spots', adminAuth, async (req, res) => {
  try {
    const { zoneId } = req.params;

    const result = await db.query(`
      SELECT 
        ps.*,
        b.id as booking_id,
        b.vehicle_plate,
        b.start_time,
        b.end_time,
        b.status as booking_status,
        u.full_name as user_name
      FROM parking_spots ps
      LEFT JOIN bookings b ON ps.id = b.parking_spot_id AND b.status IN ('confirmed', 'active')
      LEFT JOIN users u ON b.user_id = u.id
      WHERE ps.parking_zone_id = $1
      ORDER BY ps.spot_number
    `, [zoneId]);

    res.json({ spots: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch spots' });
  }
});

// Get all bookings
router.get('/bookings', adminAuth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        b.*,
        u.full_name as user_name,
        u.email as user_email,
        u.phone as user_phone,
        ps.spot_number,
        pz.name as zone_name,
        pz.location as zone_location
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN parking_spots ps ON b.parking_spot_id = ps.id
      JOIN parking_zones pz ON ps.parking_zone_id = pz.id
      ORDER BY b.created_at DESC
    `);

    res.json({ bookings: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get all payments
router.get('/payments', adminAuth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        p.*,
        b.id as booking_id,
        u.full_name as user_name,
        u.email as user_email,
        ps.spot_number,
        pz.name as zone_name,
        b.vehicle_plate
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN users u ON b.user_id = u.id
      JOIN parking_spots ps ON b.parking_spot_id = ps.id
      JOIN parking_zones pz ON ps.parking_zone_id = pz.id
      ORDER BY p.created_at DESC
    `);

    res.json({ payments: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Get all reports
router.get('/reports', adminAuth, async (req, res) => {
  try {
    console.log('📊 Fetching reports...');
    const result = await db.query(`
      SELECT * FROM admin_reports 
      ORDER BY created_at DESC
    `);
    console.log('📊 Reports found:', result.rows.length);
    res.json({ reports: result.rows });
  } catch (error) {
    console.error('❌ Reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Generate new report
router.post('/reports/generate', adminAuth, async (req, res) => {
  try {
    console.log('📊 Generating report:', req.body);
    const { report_type } = req.body;
    
    const reportName = `${report_type.charAt(0).toUpperCase() + report_type.slice(1)} Report - ${new Date().toLocaleDateString()}`;
    const fileName = `${report_type}_report_${Date.now()}.pdf`;
    
    const result = await db.query(
      'INSERT INTO admin_reports (report_name, report_type, description, file_name, status, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [reportName, report_type, `Generated ${report_type} report`, fileName, 'processing', req.admin.id]
    );
    console.log('📊 Report created:', result.rows[0]);

    // Simulate report generation (in real app, this would be async)
    setTimeout(async () => {
      await db.query(
        'UPDATE admin_reports SET status = $1, file_size = $2 WHERE id = $3',
        ['ready', '2.5 MB', result.rows[0].id]
      );
    }, 3000);

    res.status(201).json({
      message: 'Report generation started',
      report: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Generate report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Get dashboard analytics
router.get('/analytics', adminAuth, async (req, res) => {
  try {
    const totalUsers = await db.query('SELECT COUNT(*) as count FROM users');
    const totalZones = await db.query('SELECT COUNT(*) as count FROM parking_zones WHERE is_active = true');
    const totalSpots = await db.query('SELECT COUNT(*) as count FROM parking_spots');
    const activeBookings = await db.query('SELECT COUNT(*) as count FROM bookings WHERE status IN (\'confirmed\', \'active\')');
    const totalRevenue = await db.query('SELECT COALESCE(SUM(total_cost), 0) as total FROM bookings WHERE payment_status = \'paid\'');

    const recentBookings = await db.query(`
      SELECT 
        b.*,
        u.full_name,
        ps.spot_number,
        pz.name as zone_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN parking_spots ps ON b.parking_spot_id = ps.id
      JOIN parking_zones pz ON ps.parking_zone_id = pz.id
      ORDER BY b.created_at DESC
      LIMIT 10
    `);

    res.json({
      stats: {
        totalUsers: parseInt(totalUsers.rows[0].count),
        totalZones: parseInt(totalZones.rows[0].count),
        totalSpots: parseInt(totalSpots.rows[0].count),
        activeBookings: parseInt(activeBookings.rows[0].count),
        totalRevenue: parseFloat(totalRevenue.rows[0].total)
      },
      recentBookings: recentBookings.rows
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;