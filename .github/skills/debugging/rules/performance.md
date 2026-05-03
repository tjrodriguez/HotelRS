# Performance

## Lazy Loading Prevention

Enable `preventLazyLoading()` in `AppServiceProvider::boot()` during development:
```php
use Illuminate\Database\Eloquent\Model;

public function boot(): void
{
    Model::preventLazyLoading(! app()->isProduction());
}
```

This throws a `LazyLoadingViolationException` if any code accesses an unloaded relationship.

## N+1 Detection

Count queries per request:
```php
DB::enableQueryLog();
// ... perform action ...
$queries = DB::getQueryLog();
dd(count($queries));
```

Key scenarios to audit:
1. Room listing with availability status — should be ≤2 queries (rooms + room_types)
2. Reservation listing with guest/room/promotion/payments — should be ≤5 queries
3. Dashboard stats — should be ≤5 queries (not per-stat queries in a loop)

## Pagination Verification

Every list endpoint should paginate. Verify in tests:
```php
$response->assertJsonStructure(['data', 'links', 'meta']);
$this->assertLessThanOrEqual(20, count($response->json('data')));
```

## EXPLAIN on Slow Queries

Run `EXPLAIN` on the availability check query (most critical):
```sql
EXPLAIN SELECT * FROM reservations
WHERE room_id = 1
  AND status IN ('pending', 'confirmed')
  AND check_in_date <= '2026-06-10'
  AND check_out_date >= '2026-06-01';
```

Expected plan:
- `type`: `range`
- `key`: `reservations_room_id_status_check_in_date_check_out_date_index`
- `rows`: small (< 10 ideally)
- `Extra`: no `Using filesort`, no `Using temporary`

## Dashboard Stats Optimization

The dashboard stats endpoint (`GET /api/dashboard/stats`) should use optimized aggregated queries, not loop over collections:

```php
// Optimized
$occupancy = Room::where('status', RoomStatus::Occupied)->count() / Room::count();
$revenueToday = Payment::where('status', 'completed')
    ->whereDate('paid_at', today())
    ->sum('amount');

// Avoid (N+1 per stat)
$rooms->each(fn ($room) => $room->currentReservation()); // loads per room
```

Cache dashboard stats for 60 seconds:
```php
Cache::remember('dashboard:stats', 60, function () {
    return BuildDashboardStats::make()->handle();
});
```

## Event Listener Efficiency

`SyncRoomStatus` listener should execute 1-2 queries maximum:

```php
// Efficient: single query
public function handle(ReservationCreated $event): void
{
    $room = $event->reservation->room;
    $hasActive = $room->reservations()
        ->active()
        ->where('check_in_date', '<=', now())
        ->where('check_out_date', '>=', now())
        ->exists();

    $room->update([
        'status' => $hasActive ? RoomStatus::Occupied : RoomStatus::Available,
    ]);
}
```

Avoid looping over reservations or loading all rooms:
```php
// Avoid: N+1
foreach (Room::all() as $room) {
    $room->syncStatus(); // queries per room
}
```

## Query Count in Tests

```php
DB::enableQueryLog();
$this->getJson('/api/rooms');
$count = count(DB::getQueryLog());
$this->assertLessThan(5, $count, 'Too many queries for room listing');
```

## Memory Profiling

For large datasets, use `chunk()` instead of `all()`:
```php
Room::chunk(200, function ($rooms) {
    foreach ($rooms as $room) {
        // process
    }
});
```

## Cache Strategy

- Room types: cache for hours (rarely change)
- Dashboard stats: cache for 60 seconds (frequently accessed, slightly stale acceptable)
- Availability for date range: cache for 30 seconds (hotels change frequently)
- User auth: no caching needed (Sanctum handles token validation)

Invalidate on model update:
```php
RoomType::updated(function ($roomType) {
    Cache::forget('room_types');
});
```

## Queue Considerations

If `SyncRoomStatus` listener becomes heavy (e.g., triggering notifications to external systems), move it to a queued listener:
```php
class SyncRoomStatus implements ShouldQueue
{
    use InteractsWithQueue;
    public $queue = 'listeners';
}
```

For now, the hotel system runs synchronously — queue only if performance profiling shows it as a bottleneck.

## Browser Performance

Frontend checks:
- React components re-rendering too much? Use React DevTools profiler
- Large lists not virtualized? Only paginate (20 items/page) — no need for virtualization
- Images not optimized? Use appropriate sizing for room photos
- Bundle size too large? Check `npm run build` output

## Monitoring in Production

Use Laravel Telescope or similar to monitor:
- Slow queries (> 100ms)
- High query count endpoints (> 10 queries)
- Exception rate
- Queue job processing time
