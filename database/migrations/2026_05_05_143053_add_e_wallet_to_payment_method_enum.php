<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // SQLite doesn't support enum, so nothing needs to be done
        // The payment_method column is already a TEXT column that accepts any value
        // Just ensure the enum values are consistent with the PaymentMethod enum
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
