<?php

namespace App\Listeners;

use App\Events\ReservationStatusChanged;
use App\Models\ActivityLog;
use App\Models\Reservation;

class LogReservationChange
{
    public function handle(ReservationStatusChanged $event): void
    {
        $reservation = $event->reservation;

        ActivityLog::create([
            'user_id' => request()->user()?->id,
            'action' => 'reservation_status_changed',
            'entity_type' => Reservation::class,
            'entity_id' => $reservation->id,
            'changes' => [
                'previous_status' => $event->previousStatus,
                'current_status' => $reservation->status->value,
            ],
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
