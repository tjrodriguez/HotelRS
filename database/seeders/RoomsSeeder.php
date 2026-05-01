<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Room;
use App\Models\RoomType;
use Illuminate\Support\Facades\DB;

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

        // Find 'Available' status id from room_statuses table
        $availableStatus = DB::table('room_statuses')->where('status_name', 'Available')->first();
        $statusId = $availableStatus ? $availableStatus->id : 1;

        $rooms = [
            ['room_number' => '101', 'type' => 'Single', 'floor' => 1, 'price_per_night' => 49.99, 'description' => 'A compact single room with essential amenities.', 'amenities' => json_encode(['WiFi','TV','Air Conditioning'])],
            ['room_number' => '102', 'type' => 'Double', 'floor' => 1, 'price_per_night' => 69.99, 'description' => 'Comfortable double room ideal for couples.', 'amenities' => json_encode(['WiFi','TV','Mini Fridge'])],
            ['room_number' => '201', 'type' => 'Deluxe', 'floor' => 2, 'price_per_night' => 119.00, 'description' => 'Deluxe room with extra space and views.', 'amenities' => json_encode(['WiFi','TV','Mini Fridge','Balcony'])],
            ['room_number' => '301', 'type' => 'Suite', 'floor' => 3, 'price_per_night' => 199.00, 'description' => 'Suite with separate living area and premium features.', 'amenities' => json_encode(['WiFi','TV','Mini Fridge','Balcony','Jacuzzi'])],
            ['room_number' => '401', 'type' => 'Family', 'floor' => 4, 'price_per_night' => 149.50, 'description' => 'Family room with multiple beds and roomy layout.', 'amenities' => json_encode(['WiFi','TV','Extra Bed','Kitchenette'])],
        ];

        foreach ($rooms as $r) {
            $type = $types->get($r['type']);
            if (!$type) continue;

            Room::updateOrCreate(
                ['room_number' => $r['room_number']],
                [
                    'room_type_id' => $type->id,
                    'room_status_id' => $statusId,
                    'floor' => $r['floor'],
                    'price_per_night' => $r['price_per_night'],
                    'description' => $r['description'],
                    'amenities' => json_decode($r['amenities'], true),
                ]
            );
        }
    }
}
