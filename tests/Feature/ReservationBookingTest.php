<?php

namespace Tests\Feature;

use App\Models\Promotion;
use App\Models\Room;
use App\Models\RoomStatus;
use App\Models\RoomType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReservationBookingTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_create_a_reservation_with_pricing_and_promotion(): void
    {
        $guest = User::factory()->create([
            'role' => 'guest',
        ]);

        $availableStatus = RoomStatus::firstOrCreate([
            'status_name' => 'Available',
        ], [
            'color' => 'green',
        ]);

        $roomType = RoomType::create([
            'name' => 'Suite',
            'description' => 'Spacious room with premium amenities.',
            'capacity' => 4,
            'price_per_night' => 150,
        ]);

        $room = Room::create([
            'room_number' => '501',
            'room_type_id' => $roomType->id,
            'room_status_id' => $availableStatus->id,
            'floor' => 5,
            'price_per_night' => 175,
            'description' => 'Premium suite.',
        ]);

        $promotion = Promotion::create([
            'code' => 'SAVE10',
            'description' => 'Ten percent off',
            'discount_percentage' => 10,
            'valid_from' => now()->subDay()->toDateString(),
            'valid_until' => now()->addDay()->toDateString(),
            'max_uses' => null,
            'current_uses' => 0,
            'is_active' => true,
        ]);

        $response = $this->actingAs($guest, 'sanctum')->postJson('/api/reservations', [
            'room_id' => $room->id,
            'check_in_date' => now()->addDay()->toDateString(),
            'check_out_date' => now()->addDays(4)->toDateString(),
            'number_of_guests' => 2,
            'promotion_code' => $promotion->code,
            'special_requests' => 'Late arrival',
        ]);

        $response->assertCreated();
        $response->assertJsonPath('guest_id', $guest->id);
        $response->assertJsonPath('room_id', $room->id);
        $response->assertJsonPath('total_price', '405.00');
        $response->assertJsonPath('discount_amount', '45.00');

        $this->assertDatabaseHas('reservations', [
            'guest_id' => $guest->id,
            'room_id' => $room->id,
            'promotion_id' => $promotion->id,
            'status' => 'pending',
            'total_price' => 405,
            'discount_amount' => 45,
        ]);
    }
}
