<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RoomType extends Model
{
    protected $fillable = [
        'name',
        'type_name',
        'description',
        'capacity',
        'max_capacity',
        'price_per_night',
        'base_price',
    ];

    protected $casts = [
        'capacity' => 'integer',
        'price_per_night' => 'decimal:2',
    ];

    public function rooms(): HasMany
    {
        return $this->hasMany(Room::class);
    }

    public function getTypeNameAttribute(): string
    {
        return $this->name;
    }

    public function setTypeNameAttribute(string $value): void
    {
        $this->attributes['name'] = $value;
    }

    public function getMaxCapacityAttribute(): ?int
    {
        return $this->capacity;
    }

    public function setMaxCapacityAttribute(int $value): void
    {
        $this->attributes['capacity'] = $value;
    }

    public function getBasePriceAttribute(): float
    {
        return (float) ($this->attributes['price_per_night'] ?? 0);
    }

    public function setBasePriceAttribute($value): void
    {
        $this->attributes['price_per_night'] = $value;
    }
}
