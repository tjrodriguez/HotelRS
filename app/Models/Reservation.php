<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Reservation extends Model {
    protected $fillable = [
        'user_id',
        'room_id',
        'promotion_id',
        'check_in',
        'check_out',
        'status',
        'number_of_guests',
        'total_price',
        'discount_amount',
        'special_requests',
    ];

    protected $casts = [
        'check_in' => 'datetime',
        'check_out' => 'datetime',
    ];

    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }

    public function room(): BelongsTo {
        return $this->belongsTo(Room::class);
    }

    public function promotion(): BelongsTo {
        return $this->belongsTo(Promotion::class)->withDefault();
    }

    public function payments(): HasMany {
        return $this->hasMany(Payment::class);
    }

    public function calculateNights(): int {
        return $this->check_out->diffInDays($this->check_in);
    }

    public function calculatePrice(): array {
        $nights = $this->calculateNights();
        $basePrice = $this->room->roomType->base_price * $nights;
        $discountAmount = 0;

        if ($this->promotion) {
            $discountAmount = $this->promotion->calculateDiscount($basePrice);
        }

        $totalPrice = $basePrice - $discountAmount;

        return [
            'base_price' => $basePrice,
            'discount_amount' => $discountAmount,
            'total_price' => $totalPrice,
        ];
    }
}
