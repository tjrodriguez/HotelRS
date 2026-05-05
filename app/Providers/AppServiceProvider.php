<?php

namespace App\Providers;

use App\Events\ReservationCreated;
use App\Events\ReservationStatusChanged;
use App\Listeners\LogReservationChange;
use App\Listeners\NotifyAdminOnReservationCreated;
use App\Listeners\SyncRoomStatus;
use App\Models\Payment;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;
use App\Policies\PaymentPolicy;
use App\Policies\ReservationPolicy;
use App\Policies\RoomPolicy;
use App\Policies\UserPolicy;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Event::listen(
            ReservationStatusChanged::class,
            SyncRoomStatus::class,
        );

        Event::listen(
            ReservationStatusChanged::class,
            LogReservationChange::class,
        );

        Event::listen(
            ReservationCreated::class,
            NotifyAdminOnReservationCreated::class,
        );
    }

    protected $policies = [
        Reservation::class => ReservationPolicy::class,
        Room::class => RoomPolicy::class,
        Payment::class => PaymentPolicy::class,
        User::class => UserPolicy::class,
    ];
}
