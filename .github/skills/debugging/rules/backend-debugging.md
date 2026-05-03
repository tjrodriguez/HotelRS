# Backend Debugging

## Real-Time Logs

```bash
php artisan pail
```

Use `pail` to watch real-time logs during development. Filter for relevant strings:
```bash
php artisan pail --filter="Reservation"
```

## Last Exception

Use the `last-error` MCP tool to quickly retrieve the latest exception.

## Database Inspection

Use the `database-query` MCP tool for read-only data inspection. Never run writes through tinker in production.

```sql
SELECT r.id, r.status, r.check_in_date, r.room_id, rm.status AS room_status
FROM reservations r
JOIN rooms rm ON r.room_id = rm.id
WHERE r.status = 'confirmed'
  AND r.check_in_date <= CURDATE()
  AND r.check_out_date >= CURDATE();
```

## Ad-Hoc Testing

```bash
php artisan tinker --execute 'User::factory()->admin()->create();'
```

Always use single quotes to prevent shell expansion:
```bash
php artisan tinker --execute 'App\Models\Reservation::with("room.roomType")->first();'
```

## Query Profiling

Enable query logging temporarily:
```php
use Illuminate\Support\Facades\DB;

DB::listen(function ($query) {
    Log::info($query->sql, $query->bindings);
});
```

Or check total query count in a test:
```php
DB::enableQueryLog();
// ... action ...
dd(DB::getQueryLog());
```

## EXPLAIN Plans

Check index usage on slow queries:
```sql
EXPLAIN SELECT * FROM reservations WHERE room_id = 1 AND status IN ('pending', 'confirmed');
```

Verify:
- `type` is `ref` or `range` (not `ALL`)
- `key` shows the expected index name
- `Extra` does not contain `Using filesort` or `Using temporary`

## Event & Listener Registration

```bash
php artisan event:list
```

Verify `ReservationCreated → SyncRoomStatus` and other pairs are listed. If not, check:
1. Events exist in `app/Events/`
2. Listeners exist in `app/Listeners/`
3. Registration in `AppServiceProvider::boot()`:
   ```php
   Event::listen(ReservationCreated::class, [SyncRoomStatus::class, 'handle']);
   ```
4. Laravel 12 uses event discovery by default — class names must match naming convention

## Route Registration

```bash
php artisan route:list --path=api
```

Look for:
- Admin-only routes have `auth:sanctum, admin` middleware
- No orphaned routes (methods that don't exist)
- Correct HTTP methods (GET for lists, POST for creates)

## Middleware

Check middleware registration in `bootstrap/app.php`:
```bash
php artisan route:list --path=api | grep admin
```

## Environment Check

```bash
php artisan config:show app.name
php artisan config:show database.default
```

Read `.env` directly for sensitive values.

## Model Casts

Verify `casts()` returns the expected types:
```bash
php artisan tinker --execute 'dd((new App\Models\Reservation)->getCasts());'
```

## Common Gotchas

- `Class "RoomStatus" not found` → check `app/Enums/RoomStatus.php` exists and is autoloaded
- `Method SyncRoomStatus::handle not found` → listener class must have a public `handle` method
- `Non-static method should not be called statically` on event dispatch → use `ReservationCreated::dispatch($reservation)` not `::handle()`
- `Cannot add foreign key constraint` → check the referenced table exists before the FK migration
