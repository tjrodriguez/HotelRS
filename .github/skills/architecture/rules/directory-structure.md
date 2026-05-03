# Directory Structure

## Backend

```
app/
├── Actions/
│   ├── Reservations/
│   │   ├── CreateReservation.php
│   │   ├── CancelReservation.php
│   │   ├── ConfirmReservation.php
│   │   ├── DeclineReservation.php
│   │   ├── CheckInReservation.php
│   │   ├── CheckOutReservation.php
│   │   └── CalculateReservationPricing.php
│   ├── Payments/
│   │   ├── ProcessPayment.php
│   │   └── RefundPayment.php
│   └── Dashboard/
│       └── BuildDashboardStats.php
├── Enums/
│   ├── RoomStatus.php
│   ├── ReservationStatus.php
│   ├── PaymentStatus.php
│   └── PaymentMethod.php
├── Events/
│   ├── ReservationCreated.php
│   ├── ReservationConfirmed.php
│   ├── ReservationCancelled.php
│   └── ReservationCheckedOut.php
├── Http/
│   ├── Controllers/
│   │   └── Api/
│   │       ├── AuthController.php
│   │       ├── RoomController.php
│   │       ├── RoomTypeController.php
│   │       ├── ReservationController.php
│   │       ├── PaymentController.php
│   │       ├── PromotionController.php
│   │       ├── UserController.php
│   │       └── DashboardController.php
│   ├── Middleware/
│   │   └── EnsureAdmin.php
│   ├── Requests/
│   │   └── Api/
│   │       ├── LoginRequest.php
│   │       ├── RegisterRequest.php
│   │       ├── StoreReservationRequest.php
│   │       ├── StoreRoomRequest.php
│   │       ├── StoreRoomTypeRequest.php
│   │       ├── StorePromotionRequest.php
│   │       ├── StorePaymentRequest.php
│   │       └── UpdateUserRequest.php
│   └── Resources/
│       ├── UserResource.php
│       ├── RoomResource.php
│       ├── RoomTypeResource.php
│       ├── ReservationResource.php
│       ├── PaymentResource.php
│       ├── PromotionResource.php
│       └── ActivityLogResource.php
├── Listeners/
│   ├── SyncRoomStatus.php
│   └── LogActivity.php
├── Models/
│   ├── User.php
│   ├── Room.php
│   ├── RoomType.php
│   ├── Reservation.php
│   ├── Payment.php
│   ├── Promotion.php
│   └── ActivityLog.php
├── Policies/
│   ├── ReservationPolicy.php
│   ├── PaymentPolicy.php
│   ├── RoomPolicy.php
│   ├── RoomTypePolicy.php
│   ├── PromotionPolicy.php
│   └── UserPolicy.php
└── Providers/
    └── AppServiceProvider.php
```

## Frontend

```
resources/js/
├── app.js                  # Entry: mount AppMain with BrowserRouter + AuthProvider
├── AppMain.js              # Route tree (Routes + Route + Outlet)
├── layouts/
│   ├── AdminLayout.js      # Sidebar + header + Outlet
│   └── GuestLayout.js      # Sticky header + tabs + Outlet
├── pages/
│   ├── Login.js
│   ├── Register.js
│   ├── AdminDashboardHome.js
│   ├── RoomsManagement.js
│   ├── RoomTypesManagement.js
│   ├── ReservationsManagement.js
│   ├── PaymentsManagement.js
│   ├── PromotionsManagement.js
│   ├── UsersManagement.js
│   ├── ActivityLogsManagement.js
│   ├── RoomBrowser.js
│   └── BookingHistory.js
├── components/
│   ├── admin/
│   │   ├── AdminSidebar.js
│   │   └── AdminHeader.js
│   ├── guest/
│   │   ├── RoomCard.js
│   │   ├── BookingModal.js
│   │   └── ReservationCard.js
│   └── shared/
│       ├── LoadingSpinner.js
│       ├── ErrorMessage.js
│       ├── EmptyState.js
│       ├── FormErrors.js
│       ├── Modal.js
│       ├── DataTable.js
│       ├── StatusBadge.js
│       ├── AuthGuard.js
│       └── AdminGuard.js
├── contexts/
│   └── AuthContext.js
└── services/
    └── apiClient.js
```

## SCSS

```
resources/scss/
├── app.scss                # Entry point
├── abstracts/
│   ├── _variables.scss     # Colors, spacing, breakpoints, fonts
│   └── _mixins.scss
├── base/
│   ├── _reset.scss         # Normalize / reset
│   ├── _typography.scss
│   └── _global.scss
├── components/
│   ├── shared/
│   │   ├── _modal.scss
│   │   ├── _data-table.scss
│   │   ├── _status-badge.scss
│   │   ├── _form-errors.scss
│   │   └── _loading-spinner.scss
│   ├── admin/
│   │   ├── _admin-layout.scss
│   │   ├── _sidebar.scss
│   │   ├── _header.scss
│   │   └── _stat-card.scss
│   ├── guest/
│   │   ├── _guest-layout.scss
│   │   ├── _room-card.scss
│   │   └── _booking-modal.scss
│   └── pages/
│       ├── _admin-dashboard.scss
│       ├── _rooms-management.scss
│       ├── _reservations-management.scss
│       ├── _login.scss
│       └── _room-browser.scss
└── ...
```

## Tests

```
tests/
├── Feature/
│   ├── AuthTest.php
│   ├── ReservationBookingTest.php
│   ├── ReservationCancellationTest.php
│   ├── ReservationAdminTest.php
│   ├── RoomManagementTest.php
│   ├── PromotionTest.php
│   ├── PaymentTest.php
│   ├── DashboardStatsTest.php
│   └── AuthorizationTest.php
└── Unit/
    ├── ReservationTest.php
    ├── PromotionTest.php
    ├── RoomTest.php
    └── PricingTest.php
```

## Adding a New Feature

Follow the directory structure:
1. Migration + Model + Factory + Seeder (if new entity)
2. Form Request (if create/update)
3. Policy (if authorization needed)
4. Action classes (if business logic is complex)
5. Controller method using Action + Policy + Request
6. API Resource (if new entity type)
7. Frontend component + page
8. SCSS partial
9. Feature test
10. Run Pint, then run tests
