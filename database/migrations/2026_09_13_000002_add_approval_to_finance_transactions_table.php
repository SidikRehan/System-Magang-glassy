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
        Schema::table('finance_transactions', function (Blueprint $table) {
            $table->string('approval_status')->default('approved')->after('payment_status'); // approved, pending, rejected
            $table->string('source_role')->nullable()->after('approval_status'); // driver, admin_toko, admin_gudang, owner
            $table->string('vehicle_plate')->nullable()->after('source_role'); // for driver fleet fuel/toll claims
            $table->foreignId('approved_by_user_id')->nullable()->after('user_id')->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable()->after('approved_by_user_id');
            $table->string('rejection_reason')->nullable()->after('approved_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('finance_transactions', function (Blueprint $table) {
            $table->dropForeign(['approved_by_user_id']);
            $table->dropColumn([
                'approval_status',
                'source_role',
                'vehicle_plate',
                'approved_by_user_id',
                'approved_at',
                'rejection_reason',
            ]);
        });
    }
};
