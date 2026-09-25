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
        if (Schema::hasTable('tools') && !Schema::hasColumn('tools', 'damaged_qty')) {
            Schema::table('tools', function (Blueprint $table) {
                $table->integer('damaged_qty')->default(0)->after('available_qty');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('tools') && Schema::hasColumn('tools', 'damaged_qty')) {
            Schema::table('tools', function (Blueprint $table) {
                $table->dropColumn('damaged_qty');
            });
        }
    }
};
