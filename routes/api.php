<?php

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