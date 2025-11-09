# ParkBest Admin Portal

React.js admin portal for managing the ParkBest smart parking system.

## Setup

1. Install dependencies:
```bash
npm install axios
```

2. Configure environment variables in `.env`:
```
REACT_APP_API_BASE_URL=http://localhost:3001/api
REACT_APP_ADMIN_API_URL=http://localhost:3001/api/admin
```

3. Start the development server:
```bash
npm start
```

## Backend Integration

The admin portal connects to your PostgreSQL backend via REST API endpoints:

- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/users` - User management
- `GET /api/admin/parking-spots` - Parking spot management
- `GET /api/admin/attendants` - Attendant management
- `GET /api/admin/bookings` - Booking management

## Required Backend Endpoints

Your Node.js backend should implement these endpoints to work with the admin portal:

```javascript
// Example backend routes
app.post('/api/admin/login', adminController.login);
app.get('/api/admin/dashboard/stats', adminController.getDashboardStats);
app.get('/api/admin/users', adminController.getUsers);
app.get('/api/admin/parking-spots', adminController.getParkingSpots);
app.get('/api/admin/attendants', adminController.getAttendants);
app.get('/api/admin/bookings', adminController.getBookings);
```

## Database Schema

Ensure your PostgreSQL database has an `admins` table:

```sql
CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```