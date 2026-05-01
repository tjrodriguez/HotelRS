# Hotel Reservation System - Full Stack Implementation

## Overview

This is a complete Hotel Reservation System built with Laravel (backend API) and React (frontend). The system includes two main interfaces:

- **Admin Dashboard**: Comprehensive management system for hotel operations
- **Guest Booking Interface**: Modern, user-friendly booking platform

## System Architecture

### Backend (Laravel + Sanctum)

#### Database Models
- **User**: Registered users with two roles (admin/guest)
- **RoomType**: Define room categories with capacity and base pricing
- **RoomStatus**: Track room status (Available, Occupied, Maintenance, Reserved)
- **Room**: Individual rooms with type, floor, and description
- **Reservation**: Guest bookings linked to users and rooms
- **Promotion**: Discount codes for promotional campaigns
- **Payment**: Payment records for reservations
- **ActivityLog**: System audit trail

#### API Endpoints

**Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

**Room Management (Admin)**
- `POST /api/rooms` - Create room
- `GET /api/rooms` - List rooms (with pagination)
- `GET /api/rooms/{id}` - Get room details
- `PUT /api/rooms/{id}` - Update room
- `DELETE /api/rooms/{id}` - Delete room
- `POST /api/rooms/check-availability` - Check availability for date range

**Room Types (Admin)**
- `GET /api/room-types` - List room types
- `POST /api/room-types` - Create room type
- `PUT /api/room-types/{id}` - Update room type
- `DELETE /api/room-types/{id}` - Delete room type

**Room Statuses (Admin)**
- `GET /api/room-statuses` - List statuses
- `POST /api/room-statuses` - Create status
- `PUT /api/room-statuses/{id}` - Update status
- `DELETE /api/room-statuses/{id}` - Delete status

**Reservations**
- `GET /api/reservations` - List user's reservations (guest) or all (admin)
- `POST /api/reservations` - Create new reservation
- `PUT /api/reservations/{id}/cancel` - Cancel reservation
- `PUT /api/reservations/{id}/confirm` - Confirm reservation (admin)

**Payments**
- `GET /api/payments` - List payments
- `POST /api/payments` - Create payment
- `PUT /api/payments/{id}/refund` - Refund payment (admin)

**Promotions**
- `GET /api/promotions` - List promotions
- `POST /api/promotions/validate` - Validate promo code
- `POST /api/promotions` - Create promotion (admin)
- `PUT /api/promotions/{id}` - Update promotion (admin)
- `DELETE /api/promotions/{id}` - Delete promotion (admin)

**Users (Admin)**
- `GET /api/users` - List users
- `GET /api/users/{id}` - Get user details
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

**Activity Logs (Admin)**
- `GET /api/activity-logs` - List activity logs
- `GET /api/activity-logs/{id}` - Get log details

### Frontend (React)

#### Directory Structure
```
resources/js/
├── App.jsx                 # Main component
├── app.js                  # Entry point
├── contexts/
│   └── AuthContext.jsx     # Authentication context
├── services/
│   └── apiClient.js        # API client service
├── pages/
│   ├── Auth.jsx            # Login/Register page
│   ├── AdminDashboard.jsx  # Admin interface
│   └── GuestBooking.jsx    # Guest booking interface
├── components/
│   ├── Modal.jsx           # Generic modal component
│   ├── admin/              # Admin-specific components
│   │   ├── AdminSidebar.jsx
│   │   ├── DataTable.jsx
│   │   ├── UsersManagement.jsx
│   │   ├── RoomsManagement.jsx
│   │   ├── RoomTypesManagement.jsx
│   │   ├── RoomStatusesManagement.jsx
│   │   ├── ReservationsManagement.jsx
│   │   ├── PaymentsManagement.jsx
│   │   ├── PromotionsManagement.jsx
│   │   └── ActivityLogsManagement.jsx
│   └── guest/              # Guest-specific components
│       ├── RoomBrowser.jsx
│       ├── RoomCard.jsx
│       ├── BookingModal.jsx
│       └── BookingHistory.jsx
└── styles/
    ├── index.css           # Global styles
    ├── auth.css            # Auth page styles
    ├── admin-dashboard.css # Admin styles
    └── guest-booking.css   # Guest styles
```

#### Features

**Admin Dashboard**
- Sidebar navigation with 9 management modules
- User management with role assignment
- Room management with type and status
- Reservation management with confirmation
- Payment processing and refund capabilities
- Promotion code management
- Activity log tracking
- Responsive data tables with edit/delete actions

**Guest Booking Interface**
- Modern room search with filters
- Date range selection with calendar
- Room type and capacity filtering
- Real-time availability checking
- Card-based room display with pricing
- Promo code application
- Payment method selection
- Booking confirmation
- Booking history with cancellation option

## Installation & Setup

### Prerequisites
- PHP 8.3+
- Node.js 16+
- npm or yarn
- Composer

### Backend Setup

1. **Install PHP dependencies**
   ```bash
   composer install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. **Run migrations**
   ```bash
   php artisan migrate
   ```

4. **Start development server**
   ```bash
   php artisan serve
   ```

### Frontend Setup

1. **Install Node dependencies**
   ```bash
   npm install
   ```

2. **For development**
   ```bash
   npm run dev
   ```

3. **For production**
   ```bash
   npm run build
   ```

## Running the Application

### Development Mode
```bash
# Terminal 1 - Start Laravel server
composer run dev

# Terminal 2 - Start Vite/webpack dev server (if using Vite)
npm run dev
```

Or use the Laravel Mix setup:
```bash
php artisan serve
npm run dev  # Watch and compile assets
```

### Production Mode
```bash
npm run build
php artisan serve
```

## User Roles & Permissions

### Admin Role
- Full access to all system features
- Can manage users, rooms, pricing, promotions
- Can confirm/manage reservations and payments
- Can view activity logs

### Guest Role
- Can browse available rooms
- Can create reservations
- Can apply promo codes
- Can make payments
- Can view only their own reservations
- Can cancel their own reservations (if not completed)

## Key Features Implementation

### Room Availability Logic
- Rooms are checked against existing reservations
- Overlapping date ranges prevent booking
- Automatic status updates based on reservations
- Multi-night pricing calculation

### Promo Code System
- Percentage-based and fixed amount discounts
- Validation date ranges (valid_from/valid_until)
- Usage limit tracking (max_uses)
- One-time application per reservation

### Payment Processing
- Multiple payment methods supported
- Automatic payment processing on booking
- Refund capability (admin)
- Transaction ID tracking

### Activity Logging
- All admin actions logged
- User identification and timestamps
- IP address and user agent tracking
- Changes to models

## Database Schema

### users
- id, name, email, password, role (admin/guest), phone, address, created_at, updated_at

### room_types
- id, name, description, max_capacity, base_price, created_at, updated_at

### room_statuses
- id, name, color, created_at, updated_at

### rooms
- id, room_number, room_type_id, room_status_id, floor, description, amenities (JSON), created_at, updated_at

### reservations
- id, user_id, room_id, promotion_id, check_in, check_out, status, number_of_guests, total_price, discount_amount, special_requests, created_at, updated_at

### promotions
- id, code, description, discount_type, discount_value, valid_from, valid_until, max_uses, current_uses, is_active, created_at, updated_at

### payments
- id, reservation_id, amount, status, payment_method, transaction_id, payment_details (JSON), paid_at, created_at, updated_at

### activity_logs
- id, user_id, action, model_type, model_id, changes (JSON), ip_address, user_agent, created_at, updated_at

## Testing Workflow

### 1. Create Admin Account
- Register with admin email
- Manually set role to 'admin' in database or use admin seeder

### 2. Setup Room Data
- Admin: Create Room Types (e.g., Single, Double, Suite)
- Admin: Create Room Statuses
- Admin: Create Rooms and assign types

### 3. Test Guest Booking
- Register as guest user
- Search rooms for dates
- Create reservation
- Apply promo code
- Complete payment

### 4. Admin Management
- Confirm pending reservations
- View all bookings
- Process refunds
- Manage promotions

## Performance Considerations

- Pagination implemented for large data sets (20-50 items per page)
- Lazy loading of relationships in API responses
- Client-side filtering for real-time search
- Efficient date range queries for availability

## Security Features

- Sanctum token-based authentication
- Role-based access control via middleware
- CORS protection
- Validation on all API endpoints
- Password hashing with bcrypt
- Authorization checks for sensitive operations

## Future Enhancements

- Email notifications for reservations
- SMS confirmations
- Advanced analytics dashboard
- Multi-language support
- Payment gateway integration (Stripe, PayPal)
- Review/rating system
- Room images and galleries
- Email invoice generation
- Bulk booking management

## Support & Troubleshooting

### Common Issues

**Frontend not updating after changes**
- Run `npm run build` or `npm run dev`
- Clear browser cache
- Ensure Laravel Mix is watching files

**Can't login/register**
- Check API endpoint availability
- Verify Sanctum is installed and configured
- Check browser console for CORS errors

**Database errors**
- Run migrations: `php artisan migrate`
- Check .env database configuration
- Verify database exists and is accessible

## License

MIT License - See LICENSE file for details
