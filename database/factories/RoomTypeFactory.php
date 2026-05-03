<?php

namespace Database\Factories;

use App\Models\RoomType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RoomType>
 */
class RoomTypeFactory extends Factory
{
    protected $model = RoomType::class;

    public function definition(): array
    {
        return [
            'name' => fake()->unique()->randomElement(['Standard', 'Deluxe', 'Suite', 'Presidential', 'Family', 'Economy']),
            'description' => fake()->sentence(),
            'capacity' => fake()->numberBetween(1, 6),
            'price_per_night' => fake()->numberBetween(1500, 15000),
        ];
    }
}
