<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reservation' => new ReservationResource($this->whenLoaded('reservation')),
            'amount' => (float) $this->amount,
            'status' => $this->status?->value,
            'payment_method' => $this->payment_method?->value,
            'transaction_id' => $this->transaction_id,
            'payment_details' => $this->payment_details,
            'paid_at' => $this->paid_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
