<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Promotion extends Model
{
    protected $fillable = [
        'code',
        'description',
        'discount_percent',
        'discount_value',
        'discount_percentage',
        'valid_from',
        'valid_until',
        'max_uses',
        'current_uses',
        'is_active',
    ];

    protected $casts = [
        'valid_from' => 'date',
        'valid_until' => 'date',
        'is_active' => 'boolean',
    ];

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    public function isValid(): bool
    {
        $now = now()->toDateString();

        return $this->is_active
            && $now >= $this->valid_from->toDateString()
            && $now <= $this->valid_until->toDateString()
            && ($this->max_uses === null || $this->current_uses < $this->max_uses);
    }

    public function calculateDiscount($amount): float
    {
        if (! $this->isValid()) {
            return 0;
        }

        return ($amount * $this->discountPercentage()) / 100;
    }

    public function discountPercentage(): float
    {
        return (float) ($this->discount_percentage ?? $this->discount_value ?? $this->discount_percent ?? 0);
    }

    public function getDiscountValueAttribute(): float
    {
        return $this->discountPercentage();
    }

    public function setDiscountValueAttribute($value): void
    {
        $this->attributes['discount_percentage'] = $value;
    }

    public function getDiscountPercentAttribute(): float
    {
        return $this->discountPercentage();
    }

    public function setDiscountPercentAttribute($value): void
    {
        $this->attributes['discount_percentage'] = $value;
    }
}
