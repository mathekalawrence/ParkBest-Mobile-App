# Test Backend Connection

## 1. Check if backend is running:
```bash
cd express-backend
npm run dev
```

## 2. Test registration endpoint:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\",\"full_name\":\"Test User\",\"phone\":\"+254700000000\"}"
```

## 3. Check database after registration:
```bash
psql -U postgres -d parkbest_db -c "SELECT * FROM users;"
```

## 4. Test login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

## Issues Fixed:
- ✅ Booking button now uses correct variables (`plate` instead of `vehiclePlate`)
- ✅ Button disabled state fixed
- ✅ Cost display shows 0 if no cost calculated

## If users aren't saving:
1. Backend server not running
2. Database connection issue
3. API calls not reaching backend

Check backend console for error messages.