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
            if (!Schema::hasColumn('orders', 'proof_photo_path')) {
                $table->string('proof_photo_path')->nullable()->after('delivered_at');
            }
            if (!Schema::hasColumn('orders', 'recipient_name')) {
                $table->string('recipient_name')->nullable()->after('proof_photo_path');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'proof_photo_path')) {
                $table->dropColumn('proof_photo_path');
            }
            if (Schema::hasColumn('orders', 'recipient_name')) {
                $table->dropColumn('recipient_name');
            }
        });
    }
};
