# Testing Debug

## Run Single Test

```bash
php artisan test --compact --filter=testMethodName
```

Or by file:
```bash
php artisan test --compact tests/Feature/ReservationBookingTest.php
```

## Run Entire Suite

```bash
php artisan test --compact
```

## Refresh Database

Feature tests use `RefreshDatabase` (or `LazilyRefreshDatabase` for speed):

```php
class ReservationBookingTest extends TestCase
{
    use LazilyRefreshDatabase;
}
```

Note: Call `Event::fake()` **after** factory setup, not before.

## Factory Setup Order

Dependencies must be created before dependent factories:

```php
// 1. Create room type (no dependencies)
$roomType = RoomType::factory()->create();

// 2. Create room (needs room type)
$room = Room::factory()->for($roomType)->create();

// 3. Create reservation (needs room + guest)
$reservation = Reservation::factory()
    ->for($room)
    ->for($guest, 'guest')
    ->create();
```

## Assert Response Shape

Verify API Resource output:
```php
$response->assertJsonStructure([
    'data' => [
        'id',
        'status',
        'check_in_date',
        'check_out_date',
        'total_price',
        'calculated_total_price',
        'paid_amount',
        'balance_due',
        'guest' => ['id', 'name', 'email'],
        'room' => ['id', 'room_number', 'room_type'],
    ],
]);
```

## Inspect Response

```php
$response->assertOk();
dd($response->json()); // inspect full response
```

## Disable Exception Handling

To see the full stack trace instead of generic error response:
```php
$response = $this->withoutExceptionHandling()->postJson('/api/reservations', $data);
```

## Model Assertions

Use model assertions over raw database assertions:
```php
// Correct
$this->assertModelExists($reservation);

// Less preferred
$this->assertDatabaseHas('reservations', ['id' => $reservation->id]);
```

## Factory States

Use states for readable test setup:
```php
$user = User::factory()->admin()->create();
$guest = User::factory()->guest()->create();
$reservation = Reservation::factory()->confirmed()->create();
$room = Room::factory()->available()->create();
```

## Auth in Tests

```php
// As admin
$admin = User::factory()->admin()->create();
$this->actingAs($admin, 'sanctum');

// As guest
$guest = User::factory()->guest()->create();
$this->actingAs($guest, 'sanctum');
```

## Testing Authorization

```php
// Guest cannot access admin-only endpoints
$guest = User::factory()->guest()->create();
$response = $this->actingAs($guest, 'sanctum')
    ->getJson('/api/rooms'); // admin-only index

$response->assertForbidden(); // 403
```

## Faking Events

```php
use Illuminate\Support\Facades\Event;

// After factory setup
Event::fake([ReservationCreated::class]);

// Action triggers event
CreateReservation::make()->handle($guest, $data);

// Assert event dispatched
Event::assertDispatched(ReservationCreated::class);
```

## Testing Policies

```php
use App\Policies\ReservationPolicy;

$policy = new ReservationPolicy();
$this->assertTrue($policy->view($guest, $reservation)); // guest owns it
$this->assertTrue($policy->view($admin, $reservation)); // admin via before()
$this->assertFalse($policy->view($otherGuest, $reservation));
```

## Testing Actions

```php
$action = app(CreateReservation::class);
$reservation = $action->handle($guest, $data);

$this->assertDatabaseHas('reservations', [
    'guest_id' => $guest->id,
    'room_id' => $room->id,
]);
```

## Test Naming

Use descriptive names:
```php
public function testGuestCanCreateReservationWithValidPromo()
public function testGuestCannotBookUnavailableRoom()
public function testAdminCanConfirmAnyReservation()
public function testDoubleBookingIsPreventedByLock()
public function testCancelledReservationRestoresRoomAvailability()
```

## Debugging Failing Tests

1. Run with `--filter` for the specific test
2. Add `dd($response->json())` or `dd($model->toArray())` to inspect state
3. Use `withoutExceptionHandling()` for full traces
4. Check factory setup order — missing relationships cause failures
5. Check if the test uses `RefreshDatabase` (tests share state otherwise)
6. Check if `Event::fake()` was called before factory setup (breaks UUID generation)
7. Verify API Resource shape with `assertJsonStructure`

## Performance Testing in Tests

```php
DB::enableQueryLog();
// ... perform action ...
$queries = DB::getQueryLog();
$this->assertLessThan(10, count($queries), 'Too many queries — likely N+1');
```
