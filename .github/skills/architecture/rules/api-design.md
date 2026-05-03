# API Design

## RESTful Naming

Resources are plural nouns:
- `GET /api/rooms` — list
- `POST /api/rooms` — create
- `GET /api/rooms/{id}` — show
- `PUT /api/rooms/{id}` — update
- `DELETE /api/rooms/{id}` — delete
- `GET /api/rooms/availability` — custom action (verb not noun)

## Nested Resources

```
GET /api/rooms/{id}/reservations   → reservations for a specific room
GET /api/users/{id}/reservations   → reservations for a specific guest
GET /api/reservations/{id}/payments → payments for a reservation
```

## Admin Routes

Grouped under `auth:sanctum` + `admin` middleware:

```php
Route::middleware('auth:sanctum')->group(function () {
    // Guest + admin can list / view rooms
    Route::get('/rooms', [RoomController::class, 'index']);
    Route::get('/rooms/{room}', [RoomController::class, 'show']);

    Route::middleware('admin')->group(function () {
        Route::post('/rooms', [RoomController::class, 'store']);
        Route::put('/rooms/{room}', [RoomController::class, 'update']);
        Route::delete('/rooms/{room}', [RoomController::class, 'destroy']);
        // ... other admin-only endpoints
    });
});
```

## Custom Actions

Non-CRUD operations use explicit action endpoints:
```
POST /api/reservations/{id}/cancel
POST /api/reservations/{id}/confirm
POST /api/reservations/{id}/decline
POST /api/reservations/{id}/check-in
POST /api/reservations/{id}/check-out
POST /api/payments/{id}/refund
POST /api/promotions/validate         → validate a promo code
```

## Dashboard Stats

Admin-only endpoint returning real aggregated data:
```
GET /api/dashboard/stats

Response:
{
  "data": {
    "occupancy": {
      "percent": 73.33,
      "occupied": 22,
      "total": 30,
      "trend": 4.2
    },
    "revenue_today": {
      "amount": 48200.00,
      "trend_pct": 12
    },
    "check_ins_today": {
      "count": 7,
      "pending": 3
    },
    "active_promotions": {
      "count": 4,
      "expiring_soon": 2
    }
  }
}
```

## Filtering

Query parameters on list endpoints:
```
GET /api/reservations?status=confirmed&check_in=2026-06-01&check_out=2026-06-10
GET /api/rooms?status=available&room_type_id=1
GET /api/payments?status=completed&reservation_id=42
GET /api/users?role=guest&search=john
```

Use `when()` for optional filters:
```php
Reservation::query()
    ->when($request->status, fn ($q, $status) => $q->where('status', $status))
    ->when($request->check_in, fn ($q) => $q->where('check_in_date', '>=', $request->check_in))
    ->latest()
    ->paginate(20);
```

## Sorting

Single query param with optional `-` prefix for descending:
```
GET /api/reservations?sort=-created_at
GET /api/rooms?sort=room_number
```

## Pagination

Every list endpoint MUST paginate (20 per page default):
```php
return RoomResource::collection($query->paginate(20));
```

Response shape via `ResourceCollection`:
```json
{
  "data": [...],
  "links": { "first": "...", "last": "...", "prev": null, "next": "..." },
  "meta": { "current_page": 1, "last_page": 5, "per_page": 20, "total": 100 }
}
```

## Avoid

- Mixing route model binding for different entity types in the same route segment
- Allowing unbounded list responses (always paginate)
- Returning arrays at top level (always wrap in object with `data`)
- Deep nesting (>2 levels): prefer query params for filtering over deeply nested resources
