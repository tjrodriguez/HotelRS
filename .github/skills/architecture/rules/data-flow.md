# Data Flow

## Backend Request Lifecycle

```
HTTP Request
    ↓
Middleware (auth:sanctum, admin, throttle)
    ↓
Form Request (validation + lightweight authorization checks)
    ↓
Controller (type-hints model, delegates to Action, calls Policy via $this->authorize())
    ↓
Action Class (business logic, DB transaction, dispatches domain event)
    ↓
Model (persistence, relationships, accessors for presentation)
    ↓
Domain Event Fired (ReservationCreated, ReservationConfirmed, etc.)
    ↓
Listener (SyncRoomStatus, LogActivity)
    ↓
API Resource (transforms model + loaded relations to JSON)
    ↓
JSON Response
```

## Controller Example

```php
class ReservationController
{
    use AuthorizesRequests;

    public function __construct(
        private CreateReservation $create,
        private CancelReservation $cancel,
    ) {}

    public function store(StoreReservationRequest $request): ReservationResource
    {
        $reservation = $this->create->handle($request->user(), $request->validated());
        return new ReservationResource($reservation);
    }

    public function cancel(Reservation $reservation): ReservationResource
    {
        $this->authorize('cancel', $reservation);
        return new ReservationResource($this->cancel->handle($reservation));
    }
}
```

## Action Example

```php
class CreateReservation
{
    public function __construct(
        private CalculateReservationPricing $pricing,
    ) {}

    public function handle(User $guest, array $data): Reservation
    {
        return DB::transaction(function () use ($guest, $data) {
            $room = Room::with('roomType')->lockForUpdate()->findOrFail($data['room_id']);

            // ... validation, creation, promotion increment ...

            ReservationCreated::dispatch($reservation);

            return $reservation->load(['guest', 'room.roomType', 'promotion', 'payments']);
        });
    }
}
```

## Event → Listener

```php
class SyncRoomStatus
{
    public function handle(object $event): void
    {
        $room = $event->reservation->room;
        $room->refreshDerivedStatus();
    }
}
```

Register in `AppServiceProvider::boot()`:
```php
Event::listen(ReservationCreated::class, [SyncRoomStatus::class, 'handle']);
Event::listen(ReservationConfirmed::class, [SyncRoomStatus::class, 'handle']);
Event::listen(ReservationCancelled::class, [SyncRoomStatus::class, 'handle']);
```

## Activity Logging

`LogActivity` listener captures user actions for auditing:
```php
class LogActivity
{
    public function handle(object $event): void
    {
        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => class_basename($event),
            'entity_type' => $event->reservation->getMorphClass(),
            'entity_id' => $event->reservation->id,
            'changes' => $event->changes ?? null,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
```

## Frontend Data Flow

```
User Action (click, submit, filter change)
    ↓
React Component State (local useState, useCallback)
    ↓
apiClient.method() (single API layer)
    ↓
HTTP Request to /api/* endpoint
    ↓
Response JSON → update component state
    ↓
React re-renders
```

```js
const [rooms, setRooms] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiClient.getRooms({ status: 'available' })
        .then(res => { if (!cancelled) setRooms(res.data); })
        .catch(err => { if (!cancelled) setError(err); })
        .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
}, []);
```

## No Side Effects in Controllers

Controllers never:
- Sync room status directly (use `SyncRoomStatus` listener)
- Write activity logs directly (use `LogActivity` listener)
- Send notifications directly (use listeners/jobs)

Controllers return responses. Everything else is dispatched to the event bus.

## No Side Effects in Models

Models never:
- Update related models' status
- Send notifications
- Write activity logs

Models store data and expose relationships. Business logic lives in Actions, side effects in listeners.
