require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('Hashed password:', hashedPassword);
    
    // Delete existing admin and create new one
    await pool.query('DELETE FROM admin_users WHERE username = $1', ['admin']);
    
    const result = await pool.query(
      'INSERT INTO admin_users (username, password, role) VALUES ($1, $2, $3) RETURNING *',
      ['admin', hashedPassword, 'admin']
    );
    
    console.log('✅ Admin user created:', result.rows[0]);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createAdmin();