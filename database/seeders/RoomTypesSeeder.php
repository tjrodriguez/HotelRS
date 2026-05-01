<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\RoomType;

class RoomTypesSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['name' => 'Single', 'description' => 'Cozy room for one guest.'],
            ['name' => 'Double', 'description' => 'Comfortable room for two guests.'],
            ['name' => 'Deluxe', 'description' => 'Spacious room with premium amenities.'],
            ['name' => 'Suite', 'description' => 'Large suite with living area.'],
            ['name' => 'Family', 'description' => 'Room suitable for families, up to 4 guests.'],
        ];

        foreach ($types as $t) {
            RoomType::updateOrCreate(['name' => $t['name']], $t);
        }
    }
}
