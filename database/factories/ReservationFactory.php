<?php

namespace Database\Factories;

use App\Enums\ReservationStatus;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Reservation>
 */
class ReservationFactory extends Factory
{
    protected $model = Reservation::class;

    public function definition(): array
    {
        $checkIn = fake()->dateTimeBetween('+1 day', '+2 months');
        $checkOut = fake()->dateTimeBetween(
            (clone $checkIn)->modify('+1 day'),
            (clone $checkIn)->modify('+14 days')
        );
        $nights = (int) $checkIn->diff($checkOut)->format('%a');

        return [
            'guest_id' => User::factory()->guest(),
            'room_id' => Room::factory(),
            'promotion_id' => null,
            'check_in_date' => $checkIn,
            'check_out_date' => $checkOut,
            'checked_in_at' => null,
            'checked_out_at' => null,
            'status' => ReservationStatus::Pending,
            'number_of_guests' => fake()->numberBetween(1, 4),
            'total_price' => fake()->numberBetween(1500, 50000) * $nights,
            'discount_amount' => 0,
            'special_requests' => fake()->optional()->sentence(),
        ];
    }

    public function confirmed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ReservationStatus::Confirmed,
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ReservationStatus::Cancelled,
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ReservationStatus::Completed,
        ]);
    }

    public function checkedIn(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ReservationStatus::Confirmed,
            'checked_in_at' => now()->subDay(),
        ]);
    }

    public function checkedOut(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ReservationStatus::Completed,
            'checked_in_at' => now()->subDays(3),
            'checked_out_at' => now()->subDay(),
        ]);
    }
}
