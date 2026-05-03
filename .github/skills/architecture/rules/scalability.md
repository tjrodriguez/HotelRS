# Scalability

## Pagination

Every list endpoint MUST paginate:
```php
return RoomResource::collection($query->paginate(20));
```

20 items per page default. Configurable via `?per_page=50` (max 100).

No endpoint should return unbounded result sets.

## Eager Loading

Always specify `with()` in controllers:
```php
$reservations = Reservation::with(['guest', 'room.roomType', 'promotion', 'payments'])
    ->latest()
    ->paginate(20);
```

Enable `Model::preventLazyLoading()` in `AppServiceProvider::boot()` during development:
```php
public function boot(): void
{
    Model::preventLazyLoading(! app()->isProduction());
}
```

## N+1 Prevention

Before the refactor, `syncRoomsToReservationState` looped over all rooms and queried reservations per room — O(n) queries for n rooms. This is now replaced by:

- **Event-driven sync**: single query triggered by listener on `ReservationCreated`/`Confirmed`/`Cancelled`
- **Composite index**: `(room_id, status, check_in_date, check_out_date)` for fast availability checks
- **Pre-computed status**: `rooms.status` enum stores the derived state instead of computing on every request

## Indexes

Critical composite indexes:

| Table | Index | Purpose |
|-------|-------|---------|
| `rooms` | `status, room_type_id` | Filter by availability and type |
| `reservations` | `room_id, status, check_in_date, check_out_date` | Availability collision check |
| `reservations` | `guest_id` | Guest reservation lookup |
| `payments` | `reservation_id, status` | Payment summary per reservation |
| `activity_logs` | `user_id, created_at` | Recent activity per user |

Add indexes in the same migration where the table is created or altered. For existing tables, create a dedicated migration.

## Atomicity

Multi-model writes must use `DB::transaction()`:
```php
DB::transaction(function () {
    $reservation = Reservation::create([...]);
    $promotion->increment('current_uses');
    ReservationCreated::dispatch($reservation);
    return $reservation;
});
```

## Race Condition Prevention

Double-booking prevention via `lockForUpdate()` on the room row:
```php
$room = Room::lockForUpdate()->findOrFail($roomId);
```

For higher concurrency, use `Cache::lock()`:
```php
Cache::lock("reservation-room-{$roomId}", 10)->block(5, function () use ($roomId) {
    // create reservation
});
```

## Query Optimization Checklist

1. Run `EXPLAIN SELECT` on key queries (availability check, reservation listing, payment summary)
2. Verify `type = range` or `ref` (not `ALL`) in the explain plan
3. Ensure `key` column shows the expected index name
4. `rows` should be small relative to table size
5. `extra` should not contain `Using where; Using temporary; Using filesort` on large datasets

## Caching

- Cache dashboard stats for 60 seconds (`Cache::remember('dashboard:stats', 60, ...)`)
- Cache expensive availability calculations for short windows
- Cache room types list for longer (they change rarely)
- Invalidate on model update events

## Memory Efficiency

For batch operations (e.g., room status audit):
```php
Room::chunk(200, function ($rooms) {
    foreach ($rooms as $room) {
        $room->refreshDerivedStatus();
    }
});
```

Never load entire tables into memory:
```php
// Avoid
$rooms = Room::all(); // for large tables
foreach ($rooms as $room) { ... }
```

## Soft Deletes

`SoftDeletes` on `User`, `Reservation`, `Room`:
- Preserves referential integrity (payments and logs stay valid)
- Enables data recovery and audit trails
- Does not cascade — related records handle deletion gracefully via policy checks

## Load Testing

Before production, run benchmarks:
```bash
php artisan serve &
# Use curl/Apache Bench to test availability check endpoint under concurrent load
```
