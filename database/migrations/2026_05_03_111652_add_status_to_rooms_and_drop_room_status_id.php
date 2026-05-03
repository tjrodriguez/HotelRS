<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add status column (nullable initially for safe data migration)
        Schema::table('rooms', function (Blueprint $table) {
            $table->string('status', 20)->nullable()->after('room_type_id');
        });

        // Migrate data: map room_status_id to status string
        $statusMap = DB::table('room_statuses')->pluck('status_name', 'id');
        foreach ($statusMap as $id => $statusName) {
            $status = match (strtolower($statusName)) {
                'available' => 'available',
                'occupied' => 'occupied',
                'maintenance' => 'maintenance',
                'reserved' => 'reserved',
                default => 'available',
            };

            DB::table('rooms')
                ->where('room_status_id', $id)
                ->update(['status' => $status]);
        }

        // Set default for any rooms without a match
        DB::table('rooms')->whereNull('status')->update(['status' => 'available']);

        // Make status non-nullable and drop old FK + column
        Schema::table('rooms', function (Blueprint $table) {
            $table->string('status', 20)->default('available')->change();
            $table->dropForeign(['room_status_id']);
            $table->dropColumn('room_status_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            $table->foreignId('room_status_id')->constrained('room_statuses');
            $table->dropColumn('status');
        });
    }
};
