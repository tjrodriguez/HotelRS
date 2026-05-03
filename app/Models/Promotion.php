<?php

namespace App\Models;

use Database\Factories\PromotionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Promotion extends Model
{
    /** @use HasFactory<PromotionFactory> */
    use HasFactory;

    protected $fillable = [
        'code',
        'description',
        'discount_type',
        'discount_percentage',
        'valid_from',
        'valid_until',
        'max_uses',
        'current_uses',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'discount_type' => 'string',
            'valid_from' => 'date',
            'valid_until' => 'date',
            'is_active' => 'boolean',
        ];
    }

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

    public function calculateDiscount(float $amount): float
    {
        if (! $this->isValid()) {
            return 0;
        }

        if ($this->discount_type === 'fixed') {
            return min($amount, (float) $this->discount_percentage);
        }

        return round(($amount * (float) $this->discount_percentage) / 100, 2);
    }

    public function scopeValidToday($query)
    {
        return $query->where('is_active', true)
            ->where('valid_from', '<=', now())
            ->where('valid_until', '>=', now());
    }
}
