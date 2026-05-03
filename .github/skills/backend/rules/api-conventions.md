# API Conventions

## Always Return API Resources

Never return raw Eloquent models or use `setAttribute()` to inject computed fields.

Incorrect:
```php
$reservation->setAttribute('balance_due', $balance);
return response()->json($reservation);
```

Correct:
```php
return new ReservationResource($reservation);
```

## Resources for the Hotel System

- `UserResource`
- `RoomResource` (includes `room_type`, `availability_status`)
- `RoomTypeResource`
- `ReservationResource` (includes `guest`, `room`, `payments`, `calculated_total_price`, `paid_amount`, `balance_due`)
- `PaymentResource`
- `PromotionResource`
- `ActivityLogResource`

## Computed Fields Live in Resources

```php
class ReservationResource extends JsonResource
{
    public function toArray($request): array
    {
        $pricing = $this->calculatePrice();
        $paid = (float) $this->payments->where('status', 'completed')->sum('amount');
        $total = (float) ($this->total_price ?? $pricing['total_price']);

        return [
            'id' => $this->id,
            'status' => $this->status,
            'check_in_date' => $this->check_in_date?->toDateString(),
            'check_out_date' => $this->check_out_date?->toDateString(),
            'number_of_guests' => $this->number_of_guests,
            'total_price' => (float) $this->total_price,
            'discount_amount' => (float) $this->discount_amount,
            'calculated_total_price' => round($total, 2),
            'paid_amount' => round($paid, 2),
            'balance_due' => round(max(0, $total - $paid), 2),
            'guest' => UserResource::make($this->whenLoaded('guest')),
            'room' => RoomResource::make($this->whenLoaded('room')),
            'promotion' => PromotionResource::make($this->whenLoaded('promotion')),
            'payments' => PaymentResource::collection($this->whenLoaded('payments')),
        ];
    }
}
```

## Pagination via ResourceCollection

```php
return ReservationResource::collection($query->paginate(20));
```

Auto-wraps in `{ data: [...], links: {...}, meta: {...} }`.

## Error Response Shape

Laravel's default validation response already matches `{ message, errors }`. Do not customize unless required.

For business-rule errors:
```php
return response()->json([
    'message' => 'Cannot cancel a completed reservation.',
], 422);
```

## Route Model Binding

Always type-hint models — never `find($id)` + null-check:

Incorrect:
```php
public function show($id) {
    $room = Room::find($id);
    if (! $room) return response()->json(['message' => 'Not found'], 404);
    return response()->json($room);
}
```

Correct:
```php
public function show(Room $room) {
    return new RoomResource($room->load('roomType'));
}
```

Laravel returns 404 automatically when binding fails.

## Use `apiResource` for Standard CRUD

```php
Route::apiResource('rooms', RoomController::class);
```

Add custom routes as needed:
```php
Route::post('rooms/check-availability', [RoomController::class, 'checkAvailability']);
```

## HTTP Status Codes

- `200` GET, PUT, PATCH success
- `201` POST create success
- `204` DELETE success (no body)
- `401` Unauthenticated
- `403` Authenticated but unauthorized (Policy denial)
- `404` Resource not found
- `422` Validation failed or business rule violation
- `500` Server error
