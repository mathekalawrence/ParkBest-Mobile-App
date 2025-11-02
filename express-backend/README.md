# ParkBest Backend API

## Setup Instructions

### 1. Install Dependencies
```bash
cd express-backend
npm install
```

### 2. Environment Configuration
Update `.env` file with your actual credentials:
- Get Supabase service key from your project settings
- Configure M-Pesa credentials for payments
- Set Google Maps API key for location services

### 3. Database Setup
Run the SQL schema in your Supabase SQL editor:
```sql
-- Copy contents from database/schema.sql
```

### 4. Start Development Server
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Parking
- `GET /api/parking/zones` - Get available parking zones
- `GET /api/parking/zones/:zoneId/spots` - Get available spots
- `POST /api/parking/book` - Book a parking spot
- `GET /api/parking/bookings` - Get user bookings

### Payments
- `POST /api/payments/mpesa/stkpush` - Initiate M-Pesa payment
- `POST /api/payments/mpesa/callback` - M-Pesa callback handler
- `GET /api/payments/status/:checkoutRequestId` - Check payment status

### Admin
- `GET /api/admin/dashboard` - Dashboard analytics
- `GET /api/admin/bookings` - All bookings with pagination
- `POST /api/admin/zones` - Create parking zone
- `PUT /api/admin/zones/:zoneId/pricing` - Update zone pricing
- `GET /api/admin/reports/revenue` - Revenue reports

## Architecture

This backend serves as a middleware layer between your React Native app and Supabase, handling:

1. **Business Logic** - Complex operations not suitable for client-side
2. **External Integrations** - M-Pesa payments, Google Maps
3. **Security** - Server-side validation and authentication
4. **Analytics** - Data processing and reporting

## Next Steps

1. Install dependencies: `npm install`
2. Configure environment variables
3. Set up database schema in Supabase
4. Test API endpoints with Postman
5. Integrate with your React Native app