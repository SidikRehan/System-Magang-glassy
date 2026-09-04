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
            $table->boolean('is_revised')->default(false)->after('revision_notes');
            $table->string('revision_status')->default('none')->after('is_revised'); // none, pending_gudang, pending_division, acknowledged, resolved
            $table->integer('revision_count')->default(0)->after('revision_status');
            $table->json('revision_history')->nullable()->after('revision_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['is_revised', 'revision_status', 'revision_count', 'revision_history']);
        });
    }
};
