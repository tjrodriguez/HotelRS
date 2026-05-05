<?php

namespace App\Listeners;

use App\Events\ReservationCreated;
use App\Models\Reservation;
use App\Models\User;
use App\Notifications\RoleAlertNotification;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

class NotifyAdminOnReservationCreated
{
    public function handle(ReservationCreated $event): void
    {
        try {
            // Reload the reservation with fresh relationships from the database
            $reservation = Reservation::with(['guest', 'room'])
                ->findOrFail($event->reservation->id);

            $guest = $reservation->guest;
            if (! $guest) {
                return; // Safety check
            }

            $roomNumber = $reservation->room?->room_number ?? $reservation->room_id;

            $message = sprintf(
                '%s booked %s from %s to %s. Total: $%.2f. Balance due: $%.2f.',
                $guest->name,
                "Room $roomNumber",
                $reservation->check_in_date->format('M d'),
                $reservation->check_out_date->format('M d'),
                (float) ($reservation->total_price ?? 0),
                (float) ($reservation->balance_due ?? $reservation->total_price ?? 0),
            );

            $notification = new RoleAlertNotification(
                title: 'New Booking Request',
                message: $message,
                type: 'reservation_created',
                meta: [
                    'reservation_id' => $reservation->id,
                    'guest_id' => $reservation->guest_id,
                    'room_id' => $reservation->room_id,
                ],
            );

            $adminUsers = User::query()->where('role', 'admin')->get();

            if ($adminUsers->isNotEmpty()) {
                Notification::send($adminUsers, $notification);
            }
        } catch (\Throwable $e) {
            // Log but don't throw - don't break the reservation creation
            Log::error('NotifyAdminOnReservationCreated listener error: '.$e->getMessage());
        }
    }
}
