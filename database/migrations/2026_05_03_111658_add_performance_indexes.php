<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            $table->index(['status', 'room_type_id']);
        });

        Schema::table('reservations', function (Blueprint $table) {
            $table->index(['room_id', 'status', 'check_in_date', 'check_out_date']);
            $table->index('guest_id');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->index(['reservation_id', 'status']);
        });

        Schema::table('activity_logs', function (Blueprint $table) {
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            $table->dropIndex(['status', 'room_type_id']);
        });

        Schema::table('reservations', function (Blueprint $table) {
            $table->dropIndex(['room_id', 'status', 'check_in_date', 'check_out_date']);
            $table->dropIndex(['guest_id']);
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex(['reservation_id', 'status']);
        });

        Schema::table('activity_logs', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'created_at']);
        });
    }
};
