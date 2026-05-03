<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('room_statuses');
    }

    public function down(): void
    {
        Schema::create('room_statuses', function (Blueprint $table) {
            $table->id();
            $table->string('status_name');
            $table->string('color')->nullable();
            $table->timestamps();
        });

        DB::table('room_statuses')->insert([
            ['status_name' => 'Available', 'color' => '#16a34a'],
            ['status_name' => 'Occupied', 'color' => '#dc2626'],
            ['status_name' => 'Maintenance', 'color' => '#ca8a04'],
            ['status_name' => 'Reserved', 'color' => '#2563eb'],
        ]);
    }
};
