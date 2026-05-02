<?php

namespace App\Actions\Reservations;

use App\Models\Promotion;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CreateReservation
{
    public function __construct(private CalculateReservationPricing $calculateReservationPricing) {}

    public function handle(User $guest, array $data): Reservation
    {
        return DB::transaction(function () use ($guest, $data): Reservation {
            $room = Room::with('roomType')->findOrFail($data['room_id']);

            if (! $room->isAvailable($data['check_in'], $data['check_out'])) {
                throw ValidationException::withMessages([
                    'room_id' => ['Room not available for selected dates.'],
                ]);
            }

            $promotion = null;

            if (! empty($data['promotion_code'])) {
                $promotion = Promotion::where('code', $data['promotion_code'])->first();

                if (! $promotion || ! $promotion->isValid()) {
                    throw ValidationException::withMessages([
                        'promotion_code' => ['Invalid or expired promotion code.'],
                    ]);
                }
            }

            $pricing = $this->calculateReservationPricing->handle(
                $room,
                $data['check_in'],
                $data['check_out'],
                $promotion,
            );

            $reservation = Reservation::create([
                'guest_id' => $guest->id,
                'room_id' => $room->id,
                'promotion_id' => $promotion?->id,
                'check_in_date' => $data['check_in'],
                'check_out_date' => $data['check_out'],
                'number_of_guests' => $data['number_of_guests'],
                'special_requests' => $data['special_requests'] ?? null,
                'status' => 'pending',
                'total_price' => $pricing['total_price'],
                'discount_amount' => $pricing['discount_amount'],
            ]);

            if ($promotion) {
                $promotion->increment('current_uses');
            }

            return $reservation->load(['guest', 'room.roomType', 'promotion', 'payments']);
        });
    }
}
