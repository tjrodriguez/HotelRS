<?php

namespace App\Models;

use App\Enums\ReservationStatus;
use App\Enums\RoomStatus;
use Database\Factories\RoomFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Room extends Model
{
    /** @use HasFactory<RoomFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = ['room_number', 'room_type_id', 'status', 'floor', 'description', 'amenities'];

    protected function casts(): array
    {
        return [
            'status' => RoomStatus::class,
            'amenities' => 'array',
        ];
    }

    public function roomType(): BelongsTo
    {
        return $this->belongsTo(RoomType::class);
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    public function scopeAvailable(Builder $query): Builder
    {
        return $query->where('status', RoomStatus::Available);
    }

    public function isAvailable($checkIn, $checkOut): bool
    {
        return ! $this->reservations()
            ->where(function ($query) use ($checkIn, $checkOut) {
                $query->whereBetween('check_in_date', [$checkIn, $checkOut])
                    ->orWhereBetween('check_out_date', [$checkIn, $checkOut])
                    ->orWhere(function ($q) use ($checkIn, $checkOut) {
                        $q->where('check_in_date', '<=', $checkIn)
                            ->where('check_out_date', '>=', $checkOut);
                    });
            })
            ->whereIn('status', [ReservationStatus::Confirmed->value, ReservationStatus::Pending->value, ReservationStatus::CheckedIn->value])
            ->exists();
    }

    public function refreshDerivedStatus(): void
    {
        $hasActive = $this->reservations()
            ->whereIn('status', [ReservationStatus::Pending, ReservationStatus::Confirmed, ReservationStatus::CheckedIn])
            ->where('check_in_date', '<=', now())
            ->where('check_out_date', '>=', now())
            ->exists();

        $this->update([
            'status' => $hasActive ? RoomStatus::Occupied : RoomStatus::Available,
        ]);
    }
}
