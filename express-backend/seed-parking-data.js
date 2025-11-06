require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function seedParkingData() {
  try {
    console.log('Seeding parking data...');
    
    // Insert parking zones
    const zones = [
      { name: 'CBD Zone A', location: 'Kenyatta Avenue, Nairobi', hourly_rate: 100.00, total_spots: 20 },
      { name: 'CBD Zone B', location: 'Moi Avenue, Nairobi', hourly_rate: 80.00, total_spots: 15 },
      { name: 'Westlands Mall', location: 'Westlands Shopping Mall', hourly_rate: 60.00, total_spots: 30 }
    ];

    for (const zone of zones) {
      const zoneResult = await pool.query(
        'INSERT INTO parking_zones (name, location, hourly_rate, total_spots) VALUES ($1, $2, $3, $4) RETURNING id',
        [zone.name, zone.location, zone.hourly_rate, zone.total_spots]
      );
      
      const zoneId = zoneResult.rows[0].id;
      console.log(`✅ Created zone: ${zone.name} (ID: ${zoneId})`);
      
      // Create parking spots for this zone
      for (let i = 1; i <= zone.total_spots; i++) {
        await pool.query(
          'INSERT INTO parking_spots (parking_zone_id, spot_number, is_occupied, is_reserved) VALUES ($1, $2, $3, $4)',
          [zoneId, `${i.toString().padStart(3, '0')}`, false, false]
        );
      }
      
      console.log(`✅ Created ${zone.total_spots} spots for ${zone.name}`);
    }
    
    console.log('🎉 Parking data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedParkingData();