<?php

namespace Tests\Feature;

use App\Enums\ReservationStatus;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\RoomType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ReservationCheckInOutTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function guest_can_check_in_confirmed_reservation()
    {
        $guest = User::factory()->create(['role' => 'guest']);
        $roomType = RoomType::factory()->create();
        $room = Room::factory()->create(['room_type_id' => $roomType->id, 'status' => 'available']);
        $reservation = Reservation::factory()->create([
            'guest_id' => $guest->id,
            'room_id' => $room->id,
            'status' => ReservationStatus::Confirmed,
            'check_in_date' => today(),
            'check_out_date' => today()->addDay(),
        ]);

        $response = $this->actingAs($guest)->putJson("/api/reservations/{$reservation->id}/check-in");
        $response->assertOk()
            ->assertJsonPath('checked_in_at', fn ($value) => $value !== null);

        $this->assertDatabaseHas('reservations', [
            'id' => $reservation->id,
            'status' => ReservationStatus::CheckedIn->value,
        ]);
    }

    #[Test]
    public function guest_can_check_out_checked_in_reservation()
    {
        $guest = User::factory()->create(['role' => 'guest']);
        $roomType = RoomType::factory()->create();
        $room = Room::factory()->create(['room_type_id' => $roomType->id, 'status' => 'occupied']);
        $reservation = Reservation::factory()->create([
            'guest_id' => $guest->id,
            'room_id' => $room->id,
            'status' => ReservationStatus::CheckedIn,
            'checked_in_at' => now(),
            'check_in_date' => today(),
            'check_out_date' => today()->addDay(),
        ]);

        $response = $this->actingAs($guest)->putJson("/api/reservations/{$reservation->id}/check-out");
        $response->assertOk();

        $this->assertDatabaseHas('reservations', [
            'id' => $reservation->id,
            'status' => ReservationStatus::Completed->value,
        ]);

        $updated = Reservation::find($reservation->id);
        $this->assertNotNull($updated->checked_out_at);
    }

    #[Test]
    public function cannot_check_in_pending_reservation()
    {
        $guest = User::factory()->create(['role' => 'guest']);
        $roomType = RoomType::factory()->create();
        $room = Room::factory()->create(['room_type_id' => $roomType->id]);
        $reservation = Reservation::factory()->create([
            'guest_id' => $guest->id,
            'room_id' => $room->id,
            'status' => ReservationStatus::Pending,
            'check_in_date' => today(),
            'check_out_date' => today()->addDay(),
        ]);

        $response = $this->actingAs($guest)->putJson("/api/reservations/{$reservation->id}/check-in");
        $response->assertStatus(422);
    }

    #[Test]
    public function unauthorized_user_cannot_check_in_another_guests_reservation()
    {
        $guest = User::factory()->create(['role' => 'guest']);
        $other = User::factory()->create(['role' => 'guest']);
        $roomType = RoomType::factory()->create();
        $room = Room::factory()->create(['room_type_id' => $roomType->id]);
        $reservation = Reservation::factory()->create([
            'guest_id' => $guest->id,
            'room_id' => $room->id,
            'status' => ReservationStatus::Confirmed,
            'check_in_date' => today(),
            'check_out_date' => today()->addDay(),
        ]);

        $response = $this->actingAs($other)->putJson("/api/reservations/{$reservation->id}/check-in");
        $response->assertForbidden();
    }
}
