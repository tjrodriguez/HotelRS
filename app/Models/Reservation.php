<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Reservation extends Model
{
    protected $fillable = [
        'guest_id',
        'user_id',
        'room_id',
        'promotion_id',
        'check_in_date',
        'check_out_date',
        'check_in',
        'check_out',
        'status',
        'number_of_guests',
        'total_price',
        'discount_amount',
        'special_requests',
    ];

    protected $casts = [
        'check_in_date' => 'date',
        'check_out_date' => 'date',
        'total_price' => 'decimal:2',
        'discount_amount' => 'decimal:2',
    ];

    public function guest(): BelongsTo
    {
        return $this->belongsTo(User::class, 'guest_id');
    }

    public function user(): BelongsTo
    {
        return $this->guest();
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function promotion(): BelongsTo
    {
        return $this->belongsTo(Promotion::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function calculateNights(): int
    {
        if (! $this->check_in_date || ! $this->check_out_date) {
            return 0;
        }

        return $this->check_in_date->diffInDays($this->check_out_date);
    }

    public function calculatePrice(): array
    {
        $nights = $this->calculateNights();
        $nightlyRate = $this->room?->roomType?->price_per_night
            ?? $this->room?->roomType?->base_price
            ?? $this->room?->price_per_night
            ?? 0;

        $basePrice = $nightlyRate * $nights;
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

    public function getUserIdAttribute(): ?int
    {
        return $this->guest_id;
    }

    public function setUserIdAttribute(?int $value): void
    {
        $this->attributes['guest_id'] = $value;
    }

    public function getCheckInAttribute(): mixed
    {
        return $this->check_in_date;
    }

    public function setCheckInAttribute(mixed $value): void
    {
        $this->attributes['check_in_date'] = $value;
    }

    public function getCheckOutAttribute(): mixed
    {
        return $this->check_out_date;
    }

    public function setCheckOutAttribute(mixed $value): void
    {
        $this->attributes['check_out_date'] = $value;
    }
}
