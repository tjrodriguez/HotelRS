# Common Issues

## "Vite manifest" Error

This project uses **Laravel Mix**, not Vite. If you see:
```
Illuminate\Foundation\ViteException: Unable to locate file in Vite manifest
```

Fix: Ensure `webpack.mix.js` is the build config and run:
```bash
npm run build
```

Or for dev:
```bash
composer run dev
```

## 401 on API Requests

1. Check token in `localStorage` and `apiClient.token`
2. Verify `auth:sanctum` middleware is on the route
3. Check Sanctum config: `config/sanctum.php` stateful domains match your URL
4. Verify CORS allows your frontend origin

## Room Status Out of Sync

After the refactor, room status is event-driven. If `rooms.status` doesn't match expectations:
1. Check `ReservationCreated`/`Confirmed`/`Cancelled` events are dispatched from Action classes
2. Verify `SyncRoomStatus` listener is registered in `AppServiceProvider::boot()`
3. Use `php artisan event:list` to confirm the mapping
4. Check `php artisan pail --filter="SyncRoomStatus"` for listener logs

## CORS Issues

Check `config/cors.php`:
```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:3000')],
```

## Migration Failures

- `Column not found` during migration → check column dependencies. Room `status` enum migration must run after removing `room_status_id` FK
- `Duplicate column` → a previous migration already added it; the new migration should only add missing columns
- `Cannot add foreign key` → referenced table doesn't exist yet; reorder migration timestamps
- **Never modify a migration that ran in production** — create forward-fix migrations instead

## "Column not found" After Refactor

The refactored schema removed several alias columns. If you see:
```
SQLSTATE[42S22]: Column not found: 1054 Unknown column 'user_id' in 'field list'
```

→ Model is using the removed alias column. Use the **canonical column name** only:
| Removed | Use Instead |
|---------|-------------|
| `user_id` on reservations | `guest_id` |
| `check_in` / `check_out` on reservations | `check_in_date` / `check_out_date` |
| `price_per_night` on rooms | `room_type.price_per_night` |
| `room_status_id` on rooms | `rooms.status` enum |
| `type_name` on room_types | `name` |
| `max_capacity` on room_types | `capacity` |
| `base_price` on room_types | `price_per_night` |
| `discount_value` on promotions | `discount_percentage` |
| `discount_percent` on promotions | `discount_percentage` |

## Policy "Unauthorized"

1. Verify policy class exists in `app/Policies/`
2. Verify it is registered (Laravel 12 auto-discovery should handle this)
3. Check `before()` method returns `true` for admins, `null` otherwise
4. Verify `EnsureAdmin` middleware is applied on the route
5. Check `$this->authorize('action', $model)` matches the policy method name

## API Resource Missing Field

Computed fields (`balance_due`, `paid_amount`, etc.) belong in the Resource class, NOT the model.

If a field is missing from the API response:
1. Check the relevant `App\Http\Resources\*Resource` file
2. Add it to `toArray()` method
3. Do NOT use `$model->setAttribute()` to inject computed data
4. Use `$this->whenLoaded()` for relationships to avoid N+1

## "Class not found" Errors

- `Class "App\Enums\RoomStatus" not found` → ensure `app/Enums/RoomStatus.php` exists and the namespace is correct
- `Class "App\Actions\Reservations\CreateReservation" not found` → ensure the class exists and is autoloaded (`composer dump-autoload`)
- `Class "App\Listeners\SyncRoomStatus" not found` → same as above

## Soft Delete Not Working

1. Verify `SoftDeletes` trait is on the model
2. Verify `deleted_at` column exists in the migration
3. If querying with `->find()` returns null unexpectedly, check if the record was soft-deleted
4. Use `->withTrashed()` to include soft-deleted records when needed

## Laravel Mix Compilation Errors

```bash
npm run build
```

Check:
- Node version matches `package.json` engines
- All SCSS imports exist (no missing partials)
- No TypeScript errors in `.js` files (React 19 doesn't use TS in this project)
- `public/js/app.js` and `public/css/app.css` exist after build

## React Router Refresh 404

When deep-linking to `/admin/rooms` and refreshing, Laravel must serve the SPA shell:
```php
Route::get('/{any}', fn () => view('welcome'))
    ->where('any', '^(?!api).*$');
```

If this route is missing, Laravel returns 404 because it doesn't know about client-side routes.

## npm / Node Issues

If `npm install` or `npm run build` fails:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

Check `package.json` for correct React and React Router versions.
