<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model {
    protected $fillable = [
        'reservation_id',
        'amount',
        'status',
        'payment_method',
        'transaction_id',
        'payment_details',
        'paid_at',
    ];

    protected $casts = [
        'payment_details' => 'array',
        'paid_at' => 'datetime',
    ];

    public function reservation(): BelongsTo {
        return $this->belongsTo(Reservation::class);
    }
}
