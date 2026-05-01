# Hotel Reservation System - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### 1. Install Migrations & Seed Data

```bash
# Run migrations to create database tables
php artisan migrate

# (Optional) Create seeders for sample data
php artisan make:seeder RoomTypeSeeder
php artisan make:seeder RoomStatusSeeder
php artisan make:seeder RoomSeeder
php artisan make:seeder UserSeeder
```

### 2. Build Frontend Assets

```bash
# Compile React components and CSS
npm run build

# Or for development with hot reload
npm run dev
```

### 3. Start Application

**Development Mode:**
```bash
# Terminal 1 - Start Laravel server
php artisan serve

# Terminal 2 - Watch and recompile assets (if not using hot reload)
npm run dev
```

Access the application at: `http://localhost:8000`

### 4. Create Your First Admin Account

**Option A - Via Database**
```sql
INSERT INTO users (name, email, password, role, created_at, updated_at) 
VALUES ('Admin', 'admin@hotel.local', '$2y$12$...hashed_password...', 'admin', NOW(), NOW());
```

**Option B - Register then update**
1. Register a new account via UI
2. Run: `php artisan tinker`
3. Execute:
```php
$user = User::where('email', 'your@email.com')->first();
$user->role = 'admin';
$user->save();
```

### 5. Setup Sample Data

Login as admin and:
1. **Create Room Types** (Admin → Room Types)
   - Example: "Single Room", "Double Room", "Suite"
   - Set max capacity and base price

2. **Create Room Statuses** (Admin → Room Statuses)
   - Default statuses: Available, Occupied, Maintenance, Reserved

3. **Create Rooms** (Admin → Rooms)
   - Assign room numbers, types, floors

4. **Create Promotions** (Admin → Promotions)
   - Set discount codes for guests to use

### 6. Test as Guest

1. Create a new account (or logout from admin)
2. Go to "Browse & Book"
3. Select dates and search for rooms
4. Click "Book Now" and complete reservation
5. Check "My Bookings" tab

## 📋 Admin Dashboard Quick Reference

| Module | Purpose |
|--------|---------|
| 👥 Users | Manage all users, assign roles |
| 🛏️ Rooms | Create/edit rooms, set floor, amenities |
| 🏷️ Room Types | Define room categories and pricing |
| 🎯 Room Statuses | Track room availability status |
| 📅 Reservations | View and confirm bookings |
| 💳 Payments | Process and refund payments |
| 🎁 Promotions | Create discount codes |
| 📝 Activity Logs | View system audit trail |

## 🛠️ Common Tasks

### Add a New Admin
```
1. Admin → Users → Add User
2. Set role to "Admin"
3. Save
```

### Enable a Promo Code
```
1. Admin → Promotions → Add Promotion
2. Set code (e.g., "SUMMER20")
3. Set discount type & value
4. Set valid dates
5. Save
```

### Check Reservation Status
```
1. Admin → Reservations
2. Click on reservation
3. Status: pending, confirmed, completed, cancelled
4. Click "Confirm" to accept pending bookings
```

### View User Activity
```
1. Admin → Activity Logs
2. View all system actions
3. Filter by user or action type
```

## 🆘 Troubleshooting

### "Migrations failed"
```bash
# Reset and try again
php artisan migrate:refresh
php artisan migrate
```

### "Assets not loading"
```bash
# Rebuild assets
npm run build

# or for development
npm run dev
```

### "CORS errors"
Check `.env` - ensure `APP_URL` is correct (usually `http://localhost:8000`)

### "Can't login"
- Verify user exists in database
- Check token in browser localStorage
- Verify API endpoint: `http://localhost:8000/api/status`

## 📊 API Testing

Test API with curl:

```bash
# Registration
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Guest","email":"guest@hotel.local","password":"password","password_confirmation":"password"}'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"guest@hotel.local","password":"password"}'

# Get available rooms (with token)
curl -X POST http://localhost:8000/api/rooms/check-availability \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "room_type_id":1,
    "check_in":"2024-06-20 14:00",
    "check_out":"2024-06-22 11:00",
    "number_of_guests":2
  }'
```

## 📱 Key Features to Try

1. **Date Range Booking** - Try booking overlapping dates (should be blocked)
2. **Promo Codes** - Apply discount and see price change
3. **Multiple Payments** - Complete payment in different methods
4. **Cancellations** - Cancel booking and see status update
5. **Admin Controls** - Confirm pending reservations
6. **Activity Logs** - Track all admin actions

## 🔐 Default Security

- **Passwords**: Min 8 characters, bcrypt hashed
- **Tokens**: Sanctum personal access tokens
- **Roles**: Admin (full access) vs Guest (limited access)
- **CSRF**: Not required for API (token-based auth)

## 📚 Documentation

- Full guide: See `IMPLEMENTATION_GUIDE.md`
- API endpoints: Listed in `IMPLEMENTATION_GUIDE.md`
- Database schema: Listed in `IMPLEMENTATION_GUIDE.md`

## 🎯 Next Steps

1. ✅ Run migrations
2. ✅ Build assets
3. ✅ Create admin account
4. ✅ Add sample data
5. ✅ Test booking flow
6. ✅ Deploy to production

**Need help?** Check the implementation guide or server logs with:
```bash
php artisan tinker
tail -f storage/logs/laravel.log
```

Happy booking! 🏨
