<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('deliveries', function (Blueprint $table) {
            $table->unsignedBigInteger('gate_checked_by')->nullable()->after('delivery_status');
            $table->timestamp('gate_checked_at')->nullable()->after('gate_checked_by');
            
            $table->foreign('gate_checked_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('deliveries', function (Blueprint $table) {
            $table->dropForeign(['gate_checked_by']);
            $table->dropColumn(['gate_checked_by', 'gate_checked_at']);
        });
    }
};
