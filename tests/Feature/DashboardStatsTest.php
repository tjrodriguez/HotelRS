<?php

namespace Tests\Feature;

use App\Models\Promotion;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\RoomType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class DashboardStatsTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function admin_can_fetch_dashboard_stats()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $roomType = RoomType::factory()->create();
        $room = Room::factory()->create(['room_type_id' => $roomType->id, 'status' => 'occupied']);
        $guest = User::factory()->create(['role' => 'guest']);
        Reservation::factory()->create([
            'guest_id' => $guest->id,
            'room_id' => $room->id,
            'status' => 'confirmed',
            'total_price' => 200,
            'check_in_date' => today(),
            'check_out_date' => today()->addDay(),
        ]);
        Promotion::factory()->create(['is_active' => true]);

        $response = $this->actingAs($admin)->getJson('/api/dashboard/stats');
        $response->assertOk()
            ->assertJsonStructure([
                'stats' => [
                    'occupancy_rate',
                    'today_revenue',
                    'check_ins_today',
                    'check_outs_today',
                    'active_promotions',
                ],
                'weekly_revenue' => ['labels', 'values'],
                'recent_activity',
            ]);
    }

    #[Test]
    public function guest_cannot_access_dashboard_stats()
    {
        $guest = User::factory()->create(['role' => 'guest']);
        $response = $this->actingAs($guest)->getJson('/api/dashboard/stats');
        $response->assertForbidden();
    }
}
