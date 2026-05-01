<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('room_number')->unique();
            $table->foreignId('room_type_id')->constrained('room_types')->onDelete('restrict');
            $table->foreignId('room_status_id')->constrained('room_statuses')->onDelete('restrict');
            $table->integer('floor');
            $table->decimal('price_per_night', 10, 2);
            $table->text('description')->nullable();
            $table->json('amenities')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('rooms');
    }
};
