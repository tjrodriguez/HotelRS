<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void {
        Schema::create('room_statuses', function (Blueprint $table) {
            $table->id();
            $table->string('status_name')->unique();
            $table->string('color')->default('gray');
            $table->timestamps();
        });

        // Insert default statuses
        DB::table('room_statuses')->insert([
            ['status_name' => 'Available', 'color' => 'green'],
            ['status_name' => 'Occupied', 'color' => 'red'],
            ['status_name' => 'Maintenance', 'color' => 'yellow'],
            ['status_name' => 'Reserved', 'color' => 'blue'],
        ]);
    }

    public function down(): void {
        Schema::dropIfExists('room_statuses');
    }
};
