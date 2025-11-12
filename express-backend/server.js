require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 8080;
console.log('🔧 Environment PORT:', process.env.PORT);
console.log('🔧 Using PORT:', PORT);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/parking', require('./routes/parking'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/realtime', require('./routes/realtime'));
app.use('/api/maps', require('./routes/maps'));
app.use('/api/reports', require('./routes/reports'));

// Start scheduled tasks
const { startScheduledTasks } = require('./utils/scheduler');
startScheduledTasks();

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'ParkBest API Server Running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ParkBest Backend Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Server accessible at: http://localhost:${PORT}`);
  console.log(`🌐 Network access: http://192.168.100.4:${PORT}`);
});

module.exports = { app, db };