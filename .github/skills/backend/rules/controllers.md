# Controllers

## Namespace & Location

All API controllers in `App\Http\Controllers\Api\`. They do not extend a base controller — Laravel 12 controllers are POPOs by default.

## Thin Controllers

Methods should be ~10 lines. Anything longer → extract to an Action class.

## Example: Thin Controller

```php
class ReservationController
{
    public function index(IndexReservationRequest $request): ResourceCollection
    {
        $reservations = Reservation::query()
            ->with(['guest', 'room.roomType', 'promotion', 'payments'])
            ->when($request->user()->isGuest(), fn ($q) => $q->forGuest($request->user()))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->latest()
            ->paginate(20);

        return ReservationResource::collection($reservations);
    }

    public function show(Reservation $reservation): ReservationResource
    {
        $this->authorize('view', $reservation);
        return new ReservationResource($reservation->load(['guest', 'room.roomType', 'promotion', 'payments']));
    }

    public function store(StoreReservationRequest $request, CreateReservation $action): ReservationResource
    {
        $reservation = $action->handle($request->user(), $request->validated());
        return new ReservationResource($reservation);
    }

    public function cancel(Reservation $reservation, CancelReservation $action): ReservationResource
    {
        $this->authorize('cancel', $reservation);
        return new ReservationResource($action->handle($reservation));
    }
}
```

## Validation: Form Requests Only

Never inline `$request->validate()` or `Validator::make()`. Always type-hint a Form Request:

- `StoreReservationRequest`, `UpdateReservationRequest`
- `StoreRoomRequest`, `UpdateRoomRequest`
- `StoreRoomTypeRequest`, `UpdateRoomTypeRequest`
- `StorePromotionRequest`, `UpdatePromotionRequest`
- `StorePaymentRequest`
- `UpdateUserRequest`
- `LoginRequest`, `RegisterRequest`

## Authorization: Policies

Replace inline `if ($request->user()->isGuest())` checks with `$this->authorize()`:

```php
public function cancel(Reservation $reservation): ReservationResource
{
    $this->authorize('cancel', $reservation);
    // ...
}
```

The controller must use the `AuthorizesRequests` trait — Laravel 12 doesn't provide a base controller, so use it manually:

```php
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ReservationController
{
    use AuthorizesRequests;
    // ...
}
```

## Business Logic in Actions

Extract any non-trivial logic to an Action class in `App\Actions\{Domain}\`:

- `App\Actions\Reservations\CreateReservation`
- `App\Actions\Reservations\CancelReservation`
- `App\Actions\Reservations\ConfirmReservation`
- `App\Actions\Reservations\CalculateReservationPricing`
- `App\Actions\Payments\ProcessPayment`
- `App\Actions\Payments\RefundPayment`

Inject via constructor or method:

```php
public function store(StoreReservationRequest $request, CreateReservation $action)
```

## Eager Load Relationships

Every list/show endpoint specifies `with()` so the API Resource doesn't trigger N+1:

```php
Reservation::with(['guest', 'room.roomType', 'promotion', 'payments'])->paginate(20);
```

## Default Sort

Use `latest()` (= `orderBy('created_at', 'desc')`) when no explicit order is needed.

## No Side Effects

Controllers don't sync room status, send notifications, or write activity logs directly. Those are handled by:
- Action classes (atomic operations)
- Domain events + listeners (`SyncRoomStatus` listens to `ReservationCreated`/`Cancelled`/`Confirmed`)
