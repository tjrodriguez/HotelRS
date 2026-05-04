<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoomResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'room_number' => $this->room_number,
            'room_type_id' => $this->room_type_id,
            'floor' => $this->floor,
            'status' => $this->status?->value,
            'description' => $this->description,
            'amenities' => $this->amenities,
            'price_per_night' => $this->roomType?->price_per_night,
            'room_type' => new RoomTypeResource($this->whenLoaded('roomType')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
