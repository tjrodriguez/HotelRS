# Auth & Authorization

## Sanctum Token Authentication

All API endpoints (except `/auth/login`, `/auth/register`) require `auth:sanctum` middleware.

```php
Route::middleware('auth:sanctum')->group(function () {
    // ...
});
```

Token issued in `AuthController::login` / `register`:
```php
$token = $user->createToken('auth_token')->plainTextToken;
return response()->json(['user' => new UserResource($user), 'token' => $token]);
```

## EnsureAdmin Middleware

Admin-only routes nest inside the `admin` middleware:

```php
Route::middleware('auth:sanctum')->group(function () {
    // ... guest + shared routes

    Route::middleware('admin')->group(function () {
        Route::apiResource('rooms', RoomController::class)->except(['index', 'show']);
        Route::apiResource('users', UserController::class)->except(['store']);
        // ...
    });
});
```

Registered in `bootstrap/app.php`:
```php
$middleware->alias(['admin' => \App\Http\Middleware\EnsureAdmin::class]);
```

## Policies

Resource-level authorization via Policy classes (auto-discovered in Laravel 12):

- `ReservationPolicy` — `viewAny`, `view`, `create`, `cancel`, `confirm`, `decline`, `checkIn`, `checkOut`
- `PaymentPolicy` — `viewAny`, `view`, `create`, `refund`
- `RoomPolicy` — `viewAny`, `view`, `create`, `update`, `delete`
- `PromotionPolicy` — `viewAny`, `view`, `validate`, `create`, `update`, `delete`
- `UserPolicy` — `viewAny`, `view`, `update`, `delete`

## Admin Bypass via `before()`

```php
class ReservationPolicy
{
    public function before(User $user): ?bool
    {
        return $user->isAdmin() ? true : null;
    }

    public function view(User $user, Reservation $reservation): bool
    {
        return $reservation->guest_id === $user->id;
    }

    public function cancel(User $user, Reservation $reservation): bool
    {
        return $reservation->guest_id === $user->id
            && in_array($reservation->status, ['pending', 'confirmed'], true);
    }
}
```

## Calling Policies from Controllers

```php
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ReservationController
{
    use AuthorizesRequests;

    public function show(Reservation $reservation): ReservationResource
    {
        $this->authorize('view', $reservation);
        return new ReservationResource($reservation->load(...));
    }
}
```

A 403 response is returned automatically when the policy denies.

## Calling Policies from Form Requests

```php
class StoreReservationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null && Gate::allows('create', Reservation::class);
    }
}
```

## Password Hashing

Never call `bcrypt()`. The `User::casts()` method returns `'password' => 'hashed'`, so plain values are hashed automatically:

```php
$user = User::create([
    'name' => $data['name'],
    'email' => $data['email'],
    'password' => $data['password'], // auto-hashed
    'role' => 'guest',
]);
```

## Login Validation via Form Requests

```php
class LoginRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ];
    }
}
```

## Rate Limiting

Apply `throttle:6,1` to auth endpoints to slow brute-force attempts:

```php
Route::middleware('throttle:6,1')->group(function () {
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/register', [AuthController::class, 'register']);
});
```

## Token Revocation

Logout deletes the current access token:
```php
$request->user()->currentAccessToken()->delete();
```

For full logout (all devices): `$request->user()->tokens()->delete()`.
