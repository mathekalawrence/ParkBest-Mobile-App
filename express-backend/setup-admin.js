const bcrypt = require('bcryptjs');
const db = require('./config/database');

async function setupAdmin() {
  try {
    console.log('🔧 Setting up admin account...');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Insert admin account
    const result = await db.query(`
      INSERT INTO admins (username, email, password, full_name, role) 
      VALUES ($1, $2, $3, $4, $5) 
      ON CONFLICT (username) DO NOTHING
      RETURNING id, username, email, full_name
    `, ['admin', 'admin@parkbest.com', hashedPassword, 'System Administrator', 'admin']);
    
    if (result.rows.length > 0) {
      console.log('✅ Default admin account created successfully:');
      console.log('   Username: admin');
      console.log('   Password: admin123');
      console.log('   Email: admin@parkbest.com');
    } else {
      console.log('ℹ️  Default admin account already exists');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up admin:', error);
    process.exit(1);
  }
}

setupAdmin();