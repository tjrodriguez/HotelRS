<?php

namespace Database\Seeders;

use App\Enums\RoomStatus;
use App\Models\Room;
use App\Models\RoomType;
use Illuminate\Database\Seeder;

class RoomsSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure room types exist
        $types = RoomType::all()->keyBy('name');

        if ($types->isEmpty()) {
            $this->call(RoomTypesSeeder::class);
            $types = RoomType::all()->keyBy('name');
        }

        $rooms = [
            ['room_number' => '101', 'type' => 'Single', 'floor' => 1, 'description' => 'A compact single room with essential amenities.', 'amenities' => json_encode(['WiFi', 'TV', 'Air Conditioning'])],
            ['room_number' => '102', 'type' => 'Double', 'floor' => 1, 'description' => 'Comfortable double room ideal for couples.', 'amenities' => json_encode(['WiFi', 'TV', 'Mini Fridge'])],
            ['room_number' => '201', 'type' => 'Deluxe', 'floor' => 2, 'description' => 'Deluxe room with extra space and views.', 'amenities' => json_encode(['WiFi', 'TV', 'Mini Fridge', 'Balcony'])],
            ['room_number' => '301', 'type' => 'Suite', 'floor' => 3, 'description' => 'Suite with separate living area and premium features.', 'amenities' => json_encode(['WiFi', 'TV', 'Mini Fridge', 'Balcony', 'Jacuzzi'])],
            ['room_number' => '401', 'type' => 'Family', 'floor' => 4, 'description' => 'Family room with multiple beds and roomy layout.', 'amenities' => json_encode(['WiFi', 'TV', 'Extra Bed', 'Kitchenette'])],
        ];

        foreach ($rooms as $r) {
            $type = $types->get($r['type']);
            if (! $type) {
                continue;
            }

            Room::updateOrCreate(
                ['room_number' => $r['room_number']],
                [
                    'room_type_id' => $type->id,
                    'status' => RoomStatus::Available,
                    'floor' => $r['floor'],
                    'description' => $r['description'],
                    'amenities' => json_decode($r['amenities'], true),
                ]
            );
        }
    }
}
