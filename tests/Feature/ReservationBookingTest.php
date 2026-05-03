<?php

namespace Tests\Feature;

use App\Enums\RoomStatus;
use App\Models\Promotion;
use App\Models\Room;
use App\Models\RoomType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReservationBookingTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_create_a_reservation_with_pricing_and_promotion(): void
    {
        $guest = User::factory()->guest()->create();

        $roomType = RoomType::factory()->create([
            'name' => 'Suite',
            'price_per_night' => 150,
        ]);

        $room = Room::factory()->create([
            'room_number' => '501',
            'room_type_id' => $roomType->id,
            'status' => RoomStatus::Available,
            'floor' => 5,
            'description' => 'Premium suite.',
        ]);

        $promotion = Promotion::factory()->create([
            'code' => 'SAVE10',
            'discount_percentage' => 10,
            'valid_from' => now()->subDay()->toDateString(),
            'valid_until' => now()->addDay()->toDateString(),
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
        $response->assertJsonFragment(['id' => $guest->id], 'guest');
        $response->assertJsonFragment(['id' => $room->id], 'room');
        $response->assertJsonFragment(['total_price' => 405.00]);
        $response->assertJsonFragment(['discount_amount' => 45.00]);

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
