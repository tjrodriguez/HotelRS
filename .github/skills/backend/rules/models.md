# Models

## Canonical Column Names — No Aliases

Models reference only their canonical column. Accessor/mutator aliases were removed during the refactor.

| Model | Canonical | Removed (do NOT add back) |
|-------|-----------|---------------------------|
| `RoomType` | `name`, `description`, `capacity`, `price_per_night` | `type_name`, `max_capacity`, `base_price` |
| `Promotion` | `code`, `description`, `discount_type`, `discount_percentage`, `valid_from`, `valid_until`, `max_uses`, `current_uses`, `is_active` | `discount_value`, `discount_percent` |
| `Reservation` | `guest_id`, `room_id`, `promotion_id`, `check_in_date`, `check_out_date`, `checked_in_at`, `checked_out_at`, `status`, `number_of_guests`, `total_price`, `discount_amount`, `special_requests` | `user_id`, `check_in`, `check_out` |
| `Room` | `room_number`, `room_type_id`, `status`, `floor`, `description`, `amenities` | `room_status_id`, `price_per_night` |

## Room Status: Enum Column, Not FK

The `room_statuses` table no longer exists. `rooms.status` is a string enum column with cases backed by `App\Enums\RoomStatus`:

```php
enum RoomStatus: string
{
    case Available = 'available';
    case Occupied = 'occupied';
    case Maintenance = 'maintenance';
    case Reserved = 'reserved';
}
```

Cast on the model:
```php
protected function casts(): array
{
    return [
        'status' => RoomStatus::class,
        'amenities' => 'array',
    ];
}
```

## Casts via `casts()` Method

Use the `casts()` method (not `$casts` property) — Laravel 12 convention:

```php
protected function casts(): array
{
    return [
        'check_in_date' => 'date',
        'check_out_date' => 'date',
        'checked_in_at' => 'datetime',
        'checked_out_at' => 'datetime',
        'total_price' => 'decimal:2',
        'discount_amount' => 'decimal:2',
    ];
}
```

## Relationships with Return Types

```php
public function guest(): BelongsTo
{
    return $this->belongsTo(User::class, 'guest_id');
}

public function payments(): HasMany
{
    return $this->hasMany(Payment::class);
}
```

## Local Scopes for Reusable Queries

```php
// Reservation
public function scopeForGuest(Builder $query, User $guest): Builder
{
    return $query->where('guest_id', $guest->id);
}

public function scopeActive(Builder $query): Builder
{
    return $query->whereIn('status', ['pending', 'confirmed']);
}

// Room
public function scopeAvailable(Builder $query): Builder
{
    return $query->where('status', RoomStatus::Available);
}

// Promotion
public function scopeValidToday(Builder $query): Builder
{
    return $query->where('is_active', true)
        ->where('valid_from', '<=', now())
        ->where('valid_until', '>=', now());
}
```

## Soft Deletes

`User`, `Reservation`, `Room` use `SoftDeletes`:

```php
use Illuminate\Database\Eloquent\SoftDeletes;

class Reservation extends Model
{
    use SoftDeletes;
}
```

## Factory + States

Every model has a factory in `database/factories/`. Each factory exposes domain-meaningful states:

```php
class UserFactory extends Factory
{
    public function definition(): array { /* ... */ }

    public function admin(): static
    {
        return $this->state(fn () => ['role' => 'admin']);
    }

    public function guest(): static
    {
        return $this->state(fn () => ['role' => 'guest']);
    }
}

class ReservationFactory extends Factory
{
    public function confirmed(): static
    {
        return $this->state(fn () => ['status' => 'confirmed']);
    }

    public function cancelled(): static
    {
        return $this->state(fn () => ['status' => 'cancelled']);
    }
}
```

## Mass Assignment

Use `$fillable`. Never `$guarded = []`.

## No Hardcoded Table Names

```php
// Correct
DB::table((new RoomType)->getTable())->...

// Better — use Eloquent
RoomType::query()->...
```

Exception: migrations may use `DB::table('table_name')` for DML.
