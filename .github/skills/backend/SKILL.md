---
name: backend
description: "Apply this skill whenever writing, reviewing, or refactoring backend code in `app/`, `routes/`, or `database/`. Triggers for controllers, models, migrations, factories, Form Requests, API Resources, Policies, Actions, events, listeners, and seeders. Stack: Laravel 12 + Sanctum 4 + PHPUnit 11. Encodes the post-refactor backend architecture for the Hotel Reservation System."
license: MIT
metadata:
  author: hotel-rs
---

# Backend Skill — Hotel Reservation System

Project-specific Laravel API rules. Complements the existing `laravel-best-practices` skill — those are general best practices, these are the hotel system's specific decisions.

## Stack

- **PHP 8.3**
- **Laravel 12** (streamlined structure: middleware in `bootstrap/app.php`, no `app/Http/Kernel.php`)
- **Sanctum 4** (token auth)
- **PHPUnit 11** (no Pest)
- **Pint** for formatting (`vendor/bin/pint --dirty --format agent`)

## Consistency First

Always check sibling controllers/models/requests for established patterns before introducing new ones. The `laravel-best-practices` skill applies as a baseline.

## Quick Reference

### 1. API Conventions → `rules/api-conventions.md`
- All responses through API Resources, never raw models
- `ResourceCollection` for paginated lists
- Error shape: `{ message, errors }`
- Route model binding, never `find($id)`

### 2. Controllers → `rules/controllers.md`
- Namespace `App\Http\Controllers\Api\`
- Thin (~10 lines per method)
- Type-hint Form Requests for validation
- Delegate business logic to Action classes
- Authorize via `$this->authorize()` + Policies

### 3. Models → `rules/models.md`
- Canonical column names only — no accessor aliases
- `casts()` method, return-typed relationships
- Local scopes for reusable queries
- `SoftDeletes` on `User`, `Reservation`, `Room`
- Factory + states for every model

### 4. Services / Actions → `rules/services.md`
- Action classes in `App\Actions\{Domain}\`
- Single `handle()` method
- DB transactions for multi-model writes
- Domain events for side effects (no inline `syncRoomStatus`)
- `Cache::lock()` to prevent double-booking

### 5. Auth & Authorization → `rules/auth-authorization.md`
- Sanctum tokens, `auth:sanctum` middleware
- `EnsureAdmin` middleware for admin route group
- Policies: `ReservationPolicy`, `PaymentPolicy`, `RoomPolicy`, `PromotionPolicy`
- `before()` admin bypass
- Password via `hashed` cast — never `bcrypt()`

## How to Apply

1. Identify the layer you're touching
2. Read the matching rule file
3. Run `vendor/bin/pint --dirty --format agent` after PHP edits
4. Run the matching test: `php artisan test --compact --filter=...`
