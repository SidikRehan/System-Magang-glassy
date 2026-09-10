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
            if (!Schema::hasColumn('deliveries', 'trip_code')) {
                $table->string('trip_code')->nullable()->after('waybill_number');
            }
            if (!Schema::hasColumn('deliveries', 'stop_order')) {
                $table->integer('stop_order')->default(1)->after('trip_code');
            }
            if (!Schema::hasColumn('deliveries', 'notes')) {
                $table->text('notes')->nullable()->after('proof_photo_path');
            }
        });

        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'assigned_driver')) {
                $table->string('assigned_driver')->nullable()->after('status');
            }
            if (!Schema::hasColumn('orders', 'assigned_vehicle')) {
                $table->string('assigned_vehicle')->nullable()->after('assigned_driver');
            }
            if (!Schema::hasColumn('orders', 'trip_code')) {
                $table->string('trip_code')->nullable()->after('assigned_vehicle');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('deliveries', function (Blueprint $table) {
            $table->dropColumn(['trip_code', 'stop_order', 'notes']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['assigned_driver', 'assigned_vehicle', 'trip_code']);
        });
    }
};
