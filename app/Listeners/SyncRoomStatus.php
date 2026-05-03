<?php

namespace App\Listeners;

use App\Events\ReservationStatusChanged;

class SyncRoomStatus
{
    public function handle(ReservationStatusChanged $event): void
    {
        $reservation = $event->reservation;
        $room = $reservation->room;

        if (! $room) {
            return;
        }

        $room->refreshDerivedStatus();
    }
}
