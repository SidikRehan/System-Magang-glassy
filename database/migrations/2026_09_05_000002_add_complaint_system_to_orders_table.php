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
        Schema::table('orders', function (Blueprint $table) {
            $table->string('complaint_status')->default('none')->after('revision_history'); // none, pending_gudang, re_cut_needed, resolved
            $table->json('complaint_data')->nullable()->after('complaint_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['complaint_status', 'complaint_data']);
        });
    }
};
