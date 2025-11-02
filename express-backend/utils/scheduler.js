const cron = require('node-cron');
const db = require('../config/database');

// Clean up expired bookings every 5 minutes
const cleanupExpiredBookings = cron.schedule('*/5 * * * *', async () => {
  try {
    console.log('🧹 Running booking cleanup...');

    // Find expired bookings
    const expiredBookings = await db.query(`
      SELECT id, parking_spot_id 
      FROM bookings 
      WHERE status IN ('confirmed', 'active') 
      AND end_time < NOW()
    `);

    if (expiredBookings.rows.length > 0) {
      await db.query('BEGIN');

      // Update expired bookings
      await db.query(`
        UPDATE bookings 
        SET status = 'completed', updated_at = NOW() 
        WHERE status IN ('confirmed', 'active') 
        AND end_time < NOW()
      `);

      // Free up parking spots
      const spotIds = expiredBookings.rows.map(b => b.parking_spot_id);
      await db.query(`
        UPDATE parking_spots 
        SET is_occupied = false, is_reserved = false 
        WHERE id = ANY($1)
      `, [spotIds]);

      await db.query('COMMIT');

      console.log(`✅ Cleaned up ${expiredBookings.rows.length} expired bookings`);
    }
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('❌ Booking cleanup failed:', error);
  }
}, {
  scheduled: false
});

// Clean up pending payments older than 10 minutes
const cleanupPendingPayments = cron.schedule('*/10 * * * *', async () => {
  try {
    console.log('💳 Cleaning up pending payments...');

    const result = await db.query(`
      UPDATE payments 
      SET status = 'failed' 
      WHERE status = 'pending' 
      AND created_at < NOW() - INTERVAL '10 minutes'
      RETURNING id
    `);

    if (result.rows.length > 0) {
      console.log(`✅ Marked ${result.rows.length} payments as failed`);
    }
  } catch (error) {
    console.error('❌ Payment cleanup failed:', error);
  }
}, {
  scheduled: false
});

module.exports = {
  startScheduledTasks: () => {
    cleanupExpiredBookings.start();
    cleanupPendingPayments.start();
    console.log('⏰ Scheduled tasks started');
  },
  stopScheduledTasks: () => {
    cleanupExpiredBookings.stop();
    cleanupPendingPayments.stop();
    console.log('⏰ Scheduled tasks stopped');
  }
};