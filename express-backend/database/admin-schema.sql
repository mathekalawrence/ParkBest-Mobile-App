-- Admin users table for admin portal authentication
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add created_by column to parking_zones for tracking
ALTER TABLE parking_zones 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES admin_users(id);

-- Create default admin user (password: admin123)
INSERT INTO admin_users (username, password, role) 
VALUES ('admin', '$2a$10$8K1p/a0dCVWHxqRtd8EmBOxjy9Cxgnf3RXn/b9s1L0B1Y2Z3A4B5C', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_parking_spots_zone_id ON parking_spots(parking_zone_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(type);