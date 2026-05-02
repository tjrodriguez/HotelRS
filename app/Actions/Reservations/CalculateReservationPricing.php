<?php

namespace App\Actions\Reservations;

use App\Models\Promotion;
use App\Models\Room;
use Carbon\Carbon;

class CalculateReservationPricing
{
    public function handle(Room $room, string $checkIn, string $checkOut, ?Promotion $promotion = null): array
    {
        $checkInDate = Carbon::parse($checkIn);
        $checkOutDate = Carbon::parse($checkOut);
        $nights = $checkInDate->diffInDays($checkOutDate);
        $nightlyRate = $room->roomType?->price_per_night
            ?? $room->roomType?->base_price
            ?? $room->price_per_night
            ?? 0;

        $basePrice = $nightlyRate * $nights;
        $discountAmount = $promotion?->calculateDiscount($basePrice) ?? 0;

        return [
            'nights' => $nights,
            'base_price' => $basePrice,
            'discount_amount' => $discountAmount,
            'total_price' => $basePrice - $discountAmount,
        ];
    }
}
