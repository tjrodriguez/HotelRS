<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        User::factory()->admin()->create([
            'name' => 'Admin User',
            'email' => 'admin@hotel.com',
            'password' => 'password',
        ]);

        // Create guest user
        User::factory()->guest()->create([
            'name' => 'Guest User',
            'email' => 'guest@hotel.com',
            'password' => 'password',
        ]);

        // Seed room types and rooms
        $this->call([RoomTypesSeeder::class, RoomsSeeder::class]);
    }
}
