<?php

namespace App\Models;

use App\Enums\PaymentStatus;
use App\Enums\ReservationStatus;
use Database\Factories\ReservationFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Reservation extends Model
{
    /** @use HasFactory<ReservationFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'guest_id',
        'room_id',
        'promotion_id',
        'check_in_date',
        'check_out_date',
        'checked_in_at',
        'checked_out_at',
        'status',
        'number_of_guests',
        'total_price',
        'discount_amount',
        'special_requests',
    ];

    protected $appends = ['paid_amount', 'balance_due'];

    protected function casts(): array
    {
        return [
            'check_in_date' => 'date',
            'check_out_date' => 'date',
            'checked_in_at' => 'datetime',
            'checked_out_at' => 'datetime',
            'total_price' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'status' => ReservationStatus::class,
        ];
    }

    public function guest(): BelongsTo
    {
        return $this->belongsTo(User::class, 'guest_id');
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
        $nightlyRate = (float) ($this->room?->roomType?->price_per_night ?? 0);

        $basePrice = $nightlyRate * $nights;
        $discountAmount = 0;

        if ($this->promotion) {
            $discountAmount = $this->promotion->calculateDiscount($basePrice);
        }

        $totalPrice = $basePrice - $discountAmount;

        return [
            'base_price' => round($basePrice, 2),
            'discount_amount' => round($discountAmount, 2),
            'total_price' => round($totalPrice, 2),
            'nights' => $nights,
        ];
    }

    public function scopeForGuest(Builder $query, User $guest): Builder
    {
        return $query->where('guest_id', $guest->id);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->whereIn('status', [
            ReservationStatus::Pending,
            ReservationStatus::Confirmed,
        ]);
    }

    public function getPaidAmountAttribute(): float
    {
        return (float) $this->payments()
            ->where('status', PaymentStatus::Completed->value)
            ->sum('amount');
    }

    public function getBalanceDueAttribute(): float
    {
        return max(0, (float) $this->total_price - $this->getPaidAmountAttribute());
    }
}
