<?php

namespace Database\Factories;

use App\Enums\RoomStatus;
use App\Models\Room;
use App\Models\RoomType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Room>
 */
class RoomFactory extends Factory
{
    protected $model = Room::class;

    public function definition(): array
    {
        return [
            'room_number' => fake()->unique()->numberBetween(101, 999),
            'room_type_id' => RoomType::factory(),
            'status' => RoomStatus::Available,
            'floor' => fake()->numberBetween(1, 10),
            'description' => fake()->sentence(),
            'amenities' => fake()->randomElements(['wifi', 'tv', 'ac', 'minibar', 'balcony'], fake()->numberBetween(1, 5)),
        ];
    }

    public function occupied(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => RoomStatus::Occupied,
        ]);
    }

    public function maintenance(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => RoomStatus::Maintenance,
        ]);
    }
}
