<?php

namespace Tests\Feature;

use App\Enums\ReservationStatus;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReservationAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_view_own_reservation(): void
    {
        $guest = User::factory()->guest()->create();
        $reservation = Reservation::factory()->create(['guest_id' => $guest->id]);

        $response = $this->actingAs($guest, 'sanctum')->getJson("/api/reservations/{$reservation->id}");

        $response->assertOk();
        $response->assertJsonFragment(['id' => $reservation->id]);
    }

    public function test_guest_cannot_view_other_guest_reservation(): void
    {
        $guest = User::factory()->guest()->create();
        $otherGuest = User::factory()->guest()->create();
        $reservation = Reservation::factory()->create(['guest_id' => $otherGuest->id]);

        $response = $this->actingAs($guest, 'sanctum')->getJson("/api/reservations/{$reservation->id}");

        $response->assertForbidden();
    }

    public function test_admin_can_view_any_reservation(): void
    {
        $admin = User::factory()->admin()->create();
        $guest = User::factory()->guest()->create();
        $reservation = Reservation::factory()->create(['guest_id' => $guest->id]);

        $response = $this->actingAs($admin, 'sanctum')->getJson("/api/reservations/{$reservation->id}");

        $response->assertOk();
    }

    public function test_guest_can_cancel_own_reservation(): void
    {
        $guest = User::factory()->guest()->create();
        $reservation = Reservation::factory()->create([
            'guest_id' => $guest->id,
            'status' => ReservationStatus::Pending,
        ]);

        $response = $this->actingAs($guest, 'sanctum')->putJson("/api/reservations/{$reservation->id}/cancel");

        $response->assertOk();
        $this->assertDatabaseHas('reservations', [
            'id' => $reservation->id,
            'status' => ReservationStatus::Cancelled->value,
        ]);
    }

    public function test_admin_can_confirm_reservation(): void
    {
        $admin = User::factory()->admin()->create();
        $guest = User::factory()->guest()->create();
        $reservation = Reservation::factory()->create([
            'guest_id' => $guest->id,
            'status' => ReservationStatus::Pending,
        ]);

        $response = $this->actingAs($admin, 'sanctum')->putJson("/api/reservations/{$reservation->id}/confirm");

        $response->assertOk();
        $this->assertDatabaseHas('reservations', [
            'id' => $reservation->id,
            'status' => ReservationStatus::Confirmed->value,
        ]);
    }
}
