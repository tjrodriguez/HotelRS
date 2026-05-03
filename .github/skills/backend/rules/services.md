# Services / Action Classes

## Action Classes

Single-purpose business operations live in `App\Actions\{Domain}\`. Naming: imperative verb + noun.

```
app/Actions/
├── Reservations/
│   ├── CreateReservation.php
│   ├── CancelReservation.php
│   ├── ConfirmReservation.php
│   ├── DeclineReservation.php
│   ├── CheckInReservation.php
│   ├── CheckOutReservation.php
│   └── CalculateReservationPricing.php
├── Payments/
│   ├── ProcessPayment.php
│   └── RefundPayment.php
└── Dashboard/
    └── BuildDashboardStats.php
```

## Single `handle()` Method

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

            if (! $room->isAvailable($data['check_in_date'], $data['check_out_date'])) {
                throw ValidationException::withMessages([
                    'room_id' => ['Room not available for selected dates.'],
                ]);
            }

            $promotion = $this->resolvePromotion($data['promotion_code'] ?? null);
            $pricing = $this->pricing->handle($room, $data['check_in_date'], $data['check_out_date'], $promotion);

            $reservation = Reservation::create([
                'guest_id' => $guest->id,
                'room_id' => $room->id,
                'promotion_id' => $promotion?->id,
                'check_in_date' => $data['check_in_date'],
                'check_out_date' => $data['check_out_date'],
                'number_of_guests' => $data['number_of_guests'],
                'special_requests' => $data['special_requests'] ?? null,
                'status' => 'pending',
                'total_price' => $pricing['total_price'],
                'discount_amount' => $pricing['discount_amount'],
            ]);

            $promotion?->increment('current_uses');

            ReservationCreated::dispatch($reservation);

            return $reservation->load(['guest', 'room.roomType', 'promotion', 'payments']);
        });
    }
}
```

## DB Transactions

Wrap multi-model writes in `DB::transaction()`. Throw exceptions to roll back.

## Atomic Locks for Race Conditions

Prevent double-booking via `lockForUpdate()` (row lock) or `Cache::lock()` (named lock):

```php
$room = Room::lockForUpdate()->findOrFail($id);
```

Or for finer-grained logic:
```php
Cache::lock("reservation-room-{$roomId}", 10)->block(5, function () use ($roomId) {
    // create reservation
});
```

## Domain Events for Side Effects

Controllers and Actions dispatch events; listeners handle side effects.

```php
// app/Events/ReservationCreated.php
class ReservationCreated
{
    use Dispatchable, SerializesModels;

    public function __construct(public Reservation $reservation) {}
}
```

```php
// app/Listeners/SyncRoomStatus.php
class SyncRoomStatus
{
    public function handle(object $event): void
    {
        $room = $event->reservation->room;
        $room->refreshDerivedStatus(); // method on Room model
    }
}
```

Register listeners in `AppServiceProvider::boot()`:
```php
Event::listen(ReservationCreated::class, [SyncRoomStatus::class, 'handle']);
Event::listen(ReservationConfirmed::class, [SyncRoomStatus::class, 'handle']);
Event::listen(ReservationCancelled::class, [SyncRoomStatus::class, 'handle']);
```

## Pricing — Single Source

`CalculateReservationPricing` uses **only** `$room->roomType->price_per_night`. No fallback chain.

```php
class CalculateReservationPricing
{
    public function handle(Room $room, string $checkIn, string $checkOut, ?Promotion $promotion): array
    {
        $nights = max(1, Carbon::parse($checkIn)->diffInDays(Carbon::parse($checkOut)));
        $base = $nights * (float) $room->roomType->price_per_night;
        $discount = $promotion ? $promotion->calculateDiscount($base) : 0.0;

        return [
            'nights' => $nights,
            'base_price' => round($base, 2),
            'discount_amount' => round($discount, 2),
            'total_price' => round($base - $discount, 2),
        ];
    }
}
```

## Constructor Injection

Always inject dependencies via the constructor. Never `app()` or `resolve()`:

```php
public function __construct(private CalculateReservationPricing $pricing) {}
```

## No Static Methods

Actions are first-class injectable services, not static utility classes.
