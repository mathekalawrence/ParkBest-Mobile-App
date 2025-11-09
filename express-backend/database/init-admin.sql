-- Insert default admin account for testing
-- Password: admin123 (hashed with bcrypt)
INSERT INTO admins (username, email, password, full_name, role) 
VALUES (
  'admin', 
  'admin@parkbest.com', 
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
  'System Administrator', 
  'admin'
) ON CONFLICT (username) DO NOTHING;