<?php

namespace App\Actions\Reservations;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Events\ReservationCreated;
use App\Models\Payment;
use App\Models\Promotion;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class CreateReservation
{
    public function __construct(private CalculateReservationPricing $calculateReservationPricing) {}

    public function handle(User $guest, array $data): Reservation
    {
        $reservation = DB::transaction(function () use ($guest, $data): Reservation {
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

            // If the guest requested to use wallet, attempt deduction and create payment
            if (! empty($data['use_wallet'])) {
                $wallet = $guest->wallet;
                if (! $wallet || $wallet->balance < $pricing['total_price']) {
                    throw ValidationException::withMessages([
                        'wallet' => ['Insufficient wallet balance.'],
                    ]);
                }

                $wallet->balance = $wallet->balance - $pricing['total_price'];
                $wallet->save();

                Payment::create([
                    'reservation_id' => $reservation->id,
                    'amount' => $pricing['total_price'],
                    'payment_method' => PaymentMethod::EWallet,
                    'status' => PaymentStatus::Completed,
                    'paid_at' => now(),
                ]);
            }

            return $reservation->load(['guest', 'room.roomType', 'promotion', 'payments']);
        });

        // Reload relationships for event dispatch to prevent null access
        $reservation->load(['guest', 'room']);

        // Dispatch event but don't let it break the response
        try {
            ReservationCreated::dispatch($reservation);
        } catch (\Throwable $e) {
            // Log the error but don't fail the request
            Log::error('ReservationCreated event error: '.$e->getMessage());
        }

        return $reservation;
    }
}
