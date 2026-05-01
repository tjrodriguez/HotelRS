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
        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@hotel.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        // Create guest user
        User::factory()->create([
            'name' => 'Guest User',
            'email' => 'guest@hotel.com',
            'password' => bcrypt('password'),
            'role' => 'guest',
        ]);

        // Seed room types and rooms
        $this->call([\Database\Seeders\RoomTypesSeeder::class, \Database\Seeders\RoomsSeeder::class]);
    }
}
