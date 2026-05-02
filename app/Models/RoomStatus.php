<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RoomStatus extends Model
{
    protected $fillable = ['status_name', 'name', 'color'];

    public function rooms(): HasMany
    {
        return $this->hasMany(Room::class);
    }

    public function getNameAttribute(): string
    {
        return $this->status_name;
    }

    public function setNameAttribute(string $value): void
    {
        $this->attributes['status_name'] = $value;
    }
}
