<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReservationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'guest' => new UserResource($this->whenLoaded('guest')),
            'room' => new RoomResource($this->whenLoaded('room')),
            'promotion' => new PromotionResource($this->whenLoaded('promotion')),
            'check_in_date' => $this->check_in_date?->toDateString(),
            'check_out_date' => $this->check_out_date?->toDateString(),
            'checked_in_at' => $this->checked_in_at?->toIso8601String(),
            'checked_out_at' => $this->checked_out_at?->toIso8601String(),
            'status' => $this->status?->value,
            'number_of_guests' => $this->number_of_guests,
            'total_price' => (float) $this->total_price,
            'discount_amount' => (float) $this->discount_amount,
            'special_requests' => $this->special_requests,
            'calculated_total_price' => $this->whenHas('calculated_total_price', fn () => (float) $this->calculated_total_price),
            'paid_amount' => $this->whenHas('paid_amount', fn () => (float) $this->paid_amount),
            'balance_due' => $this->whenHas('balance_due', fn () => (float) $this->balance_due),
            'payments' => PaymentResource::collection($this->whenLoaded('payments')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
