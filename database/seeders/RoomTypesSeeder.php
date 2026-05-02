<?php

namespace Database\Seeders;

use App\Models\RoomType;
use Illuminate\Database\Seeder;

class RoomTypesSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['name' => 'Single', 'description' => 'Cozy room for one guest.', 'capacity' => 1, 'price_per_night' => 49.99],
            ['name' => 'Double', 'description' => 'Comfortable room for two guests.', 'capacity' => 2, 'price_per_night' => 69.99],
            ['name' => 'Deluxe', 'description' => 'Spacious room with premium amenities.', 'capacity' => 2, 'price_per_night' => 119.00],
            ['name' => 'Suite', 'description' => 'Large suite with living area.', 'capacity' => 4, 'price_per_night' => 199.00],
            ['name' => 'Family', 'description' => 'Room suitable for families, up to 4 guests.', 'capacity' => 4, 'price_per_night' => 149.50],
        ];

        foreach ($types as $type) {
            RoomType::updateOrCreate(['name' => $type['name']], $type);
        }
    }
}
