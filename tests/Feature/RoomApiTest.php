<?php

namespace Tests\Feature;

use App\Enums\RoomStatus;
use App\Models\Room;
use App\Models\RoomType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoomApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_list_rooms(): void
    {
        $guest = User::factory()->guest()->create();
        RoomType::factory()->create();
        Room::factory()->count(3)->create();

        $response = $this->actingAs($guest, 'sanctum')->getJson('/api/rooms');

        $response->assertOk();
        $response->assertJsonCount(3, 'data');
    }

    public function test_admin_can_create_room(): void
    {
        $admin = User::factory()->admin()->create();
        $roomType = RoomType::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/rooms', [
            'room_number' => '999',
            'room_type_id' => $roomType->id,
            'floor' => 9,
            'status' => RoomStatus::Available->value,
            'description' => 'Test room',
            'amenities' => ['wifi', 'tv'],
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('rooms', ['room_number' => '999']);
    }

    public function test_guest_cannot_create_room(): void
    {
        $guest = User::factory()->guest()->create();
        $roomType = RoomType::factory()->create();

        $response = $this->actingAs($guest, 'sanctum')->postJson('/api/rooms', [
            'room_number' => '999',
            'room_type_id' => $roomType->id,
            'floor' => 9,
        ]);

        $response->assertForbidden();
    }

    public function test_admin_can_update_room_status(): void
    {
        $admin = User::factory()->admin()->create();
        $room = Room::factory()->create(['status' => RoomStatus::Available]);

        $response = $this->actingAs($admin, 'sanctum')->putJson("/api/rooms/{$room->id}", [
            'status' => RoomStatus::Maintenance->value,
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('rooms', [
            'id' => $room->id,
            'status' => RoomStatus::Maintenance->value,
        ]);
    }

    public function test_admin_can_delete_room(): void
    {
        $admin = User::factory()->admin()->create();
        $room = Room::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')->deleteJson("/api/rooms/{$room->id}");

        $response->assertNoContent();
        $this->assertSoftDeleted('rooms', ['id' => $room->id]);
    }
}
