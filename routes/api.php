<?php

use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PromotionController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\RoomTypeController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WalletController;
use Illuminate\Support\Facades\Route;

Route::get('/status', function () {
    return response()->json([
        'message' => 'Laravel API is online.',
        'app_name' => config('app.name'),
        'laravel_version' => app()->version(),
        'php_version' => PHP_VERSION,
        'timestamp' => now()->toIso8601String(),
    ]);
});

// Public auth routes
Route::middleware('throttle:5,1')->group(function () {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
});

// Protected routes
Route::middleware(['auth:sanctum', 'throttle:20,1'])->group(function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::put('/auth/me', [AuthController::class, 'updateProfile']);
    Route::put('/auth/password', [AuthController::class, 'changePassword']);

    // Password reset (public)
    Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

    // Public endpoints (accessible to all authenticated users)
    Route::get('/rooms', [RoomController::class, 'index']);
    Route::get('/rooms/{id}', [RoomController::class, 'show']);
    Route::get('/rooms/{id}/reservations', [ReservationController::class, 'getRoomReservations']);
    Route::post('/rooms/check-availability', [RoomController::class, 'checkAvailability']);
    Route::get('/rooms/availability-calendar', [RoomController::class, 'availabilityCalendar']);
    Route::get('/room-types', [RoomTypeController::class, 'index']);
    Route::get('/room-types/{id}', [RoomTypeController::class, 'show']);
    Route::get('/promotions', [PromotionController::class, 'index']);
    Route::get('/promotions/{id}', [PromotionController::class, 'show']);
    Route::post('/promotions/validate', [PromotionController::class, 'validate']);

    // Guest reservations
    Route::get('/reservations', [ReservationController::class, 'index']);
    Route::get('/reservations/{id}', [ReservationController::class, 'show']);
    Route::post('/reservations', [ReservationController::class, 'store']);
    Route::put('/reservations/{id}/cancel', [ReservationController::class, 'cancel']);
    Route::put('/reservations/{id}/check-in', [ReservationController::class, 'checkIn']);
    Route::put('/reservations/{id}/check-out', [ReservationController::class, 'checkOut']);

    // Guest payments
    Route::get('/payments', [PaymentController::class, 'index']);
    Route::get('/payments/{id}', [PaymentController::class, 'show']);
    Route::post('/payments', [PaymentController::class, 'store']);

    Route::get('/wallet', [WalletController::class, 'show']);
    Route::post('/wallet/top-up', [WalletController::class, 'topUp']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);

    // Admin-only routes
    Route::middleware('admin')->group(function () {
        // Dashboard
        Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

        // Room Types
        Route::post('/room-types', [RoomTypeController::class, 'store']);
        Route::put('/room-types/{id}', [RoomTypeController::class, 'update']);
        Route::delete('/room-types/{id}', [RoomTypeController::class, 'destroy']);

        // Room Statuses API removed; statuses are managed via Rooms UI and DB

        // Rooms
        Route::post('/rooms', [RoomController::class, 'store']);
        Route::put('/rooms/{id}', [RoomController::class, 'update']);
        Route::delete('/rooms/{id}', [RoomController::class, 'destroy']);

        // Promotions
        Route::post('/promotions', [PromotionController::class, 'store']);
        Route::put('/promotions/{id}', [PromotionController::class, 'update']);
        Route::delete('/promotions/{id}', [PromotionController::class, 'destroy']);

        // Reservations Management
        Route::put('/reservations/{id}/confirm', [ReservationController::class, 'confirm']);
        Route::put('/reservations/{id}/decline', [ReservationController::class, 'decline']);

        // Payments Management
        Route::put('/payments/{id}/refund', [PaymentController::class, 'refund']);

        // Users
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/{id}', [UserController::class, 'show']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);

        // Activity Logs
        Route::get('/activity-logs', [ActivityLogController::class, 'index']);
        Route::get('/activity-logs/{id}', [ActivityLogController::class, 'show']);
    });
});
