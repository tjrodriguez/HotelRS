# ERD & Schema

## Refactored Entity Model

```
users
  id, name, email, password, role[admin|guest], phone, address
  created_at, updated_at, deleted_at
  hasMany → reservations (as guest)
  hasMany → activity_logs

room_types
  id, name, description, capacity, price_per_night
  hasMany → rooms

rooms
  id, room_number, room_type_id FK, status[available|occupied|maintenance|reserved], floor, description, amenities JSON
  created_at, updated_at, deleted_at
  hasMany → reservations
  belongsTo → room_type

promotions
  id, code, description, discount_type[percentage|fixed], discount_percentage, valid_from, valid_until, max_uses, current_uses, is_active
  hasMany → reservations

reservations
  id, guest_id FK→users, room_id FK→rooms, promotion_id FK→promotions nullable
  check_in_date, check_out_date, checked_in_at, checked_out_at
  status[pending|confirmed|cancelled|completed]
  number_of_guests, total_price, discount_amount, special_requests
  created_at, updated_at, deleted_at
  belongsTo → guest (User)
  belongsTo → room
  belongsTo → promotion
  hasMany → payments

payments
  id, reservation_id FK
  amount, status[pending|completed|failed|refunded], payment_method[credit_card|debit_card|bank_transfer|cash]
  transaction_id, payment_details JSON, paid_at
  created_at, updated_at
  belongsTo → reservation

activity_logs
  id, user_id FK
  action, entity_type, entity_id, changes JSON
  ip_address, user_agent
  created_at, updated_at
  belongsTo → user
```

## Single Source of Truth

- **Price**: only on `room_types.price_per_night`. `rooms` does NOT have `price_per_night`.
- **Room status**: only on `rooms.status` as string enum. No `room_statuses` table, no `room_status_id` FK.
- **Reservation columns**: only `guest_id`, `check_in_date`, `check_out_date`. No `user_id`, `check_in`, `check_out` aliases.

## PHP Enums

```php
// app/Enums/RoomStatus.php
enum RoomStatus: string
{
    case Available = 'available';
    case Occupied = 'occupied';
    case Maintenance = 'maintenance';
    case Reserved = 'reserved';
}

// app/Enums/ReservationStatus.php
enum ReservationStatus: string
{
    case Pending = 'pending';
    case Confirmed = 'confirmed';
    case Cancelled = 'cancelled';
    case Completed = 'completed';
}

// app/Enums/PaymentStatus.php
enum PaymentStatus: string
{
    case Pending = 'pending';
    case Completed = 'completed';
    case Failed = 'failed';
    case Refunded = 'refunded';
}

// app/Enums/PaymentMethod.php
enum PaymentMethod: string
{
    case CreditCard = 'credit_card';
    case DebitCard = 'debit_card';
    case BankTransfer = 'bank_transfer';
    case Cash = 'cash';
}
```

## Indexes

```php
// On rooms
$table->index(['status', 'room_type_id']);

// On reservations
$table->index(['room_id', 'status', 'check_in_date', 'check_out_date']);
$table->index('guest_id');

// On payments
$table->index(['reservation_id', 'status']);

// On activity_logs
$table->index(['user_id', 'created_at']);
```

## Migration Conventions

- One concern per migration — never mix DDL and DML
- Use `constrained()` for FKs
- Add indexes in the same migration as table creation when possible
- Never modify a migration that has already run in production — create forward-fix migrations
- Column defaults should be mirrored in model `$attributes`
- Reversible `down()` by default

## Casting

All date/datetime columns should be cast in the model's `casts()` method:

```php
protected function casts(): array
{
    return [
        'status' => RoomStatus::class,
        'amenities' => 'array',
        'check_in_date' => 'date',
        'check_out_date' => 'date',
        'checked_in_at' => 'datetime',
        'checked_out_at' => 'datetime',
        'total_price' => 'decimal:2',
        'discount_amount' => 'decimal:2',
    ];
}
```

## Avoid

- Aliases for the same concept across models (e.g., `user_id` vs `guest_id`)
- Storing derived data that could be calculated (e.g., storing `nights` when it is `check_out_date - check_in_date`)
- Lookup tables for fixed-value enums (use native enums or enum columns)
- Data in multiple places (price on both rooms and room_types)
