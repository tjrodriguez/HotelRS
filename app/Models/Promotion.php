<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Promotion extends Model {
    protected $fillable = [
        'code',
        'description',
        'discount_type',
        'discount_value',
        'valid_from',
        'valid_until',
        'max_uses',
        'current_uses',
        'is_active',
    ];

    protected $casts = [
        'valid_from' => 'date',
        'valid_until' => 'date',
    ];

    public function reservations(): HasMany {
        return $this->hasMany(Reservation::class);
    }

    public function isValid(): bool {
        $now = now()->toDateString();
        return $this->is_active
            && $now >= $this->valid_from->toDateString()
            && $now <= $this->valid_until->toDateString()
            && ($this->max_uses === null || $this->current_uses < $this->max_uses);
    }

    public function calculateDiscount($amount): float {
        if (!$this->isValid()) {
            return 0;
        }

        if ($this->discount_type === 'percentage') {
            return ($amount * $this->discount_value) / 100;
        }

        return (float) $this->discount_value;
    }
}
