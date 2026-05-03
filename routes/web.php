<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome', [
        'appName' => config('app.name'),
    ]);
});

Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');
