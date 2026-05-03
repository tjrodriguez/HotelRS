<?php

namespace Database\Factories;

use App\Models\Promotion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Promotion>
 */
class PromotionFactory extends Factory
{
    protected $model = Promotion::class;

    public function definition(): array
    {
        $start = fake()->dateTimeBetween('-1 month', '+1 month');
        $end = fake()->dateTimeBetween($start, '+3 months');

        return [
            'code' => strtoupper(fake()->bothify('???###')),
            'description' => fake()->sentence(),
            'discount_type' => 'percentage',
            'discount_percentage' => fake()->numberBetween(5, 50),
            'valid_from' => $start,
            'valid_until' => $end,
            'max_uses' => fake()->numberBetween(10, 100),
            'current_uses' => 0,
            'is_active' => true,
        ];
    }
}
