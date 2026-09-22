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
        if (Schema::hasTable('sheet_glasses') && !Schema::hasColumn('sheet_glasses', 'image_path')) {
            Schema::table('sheet_glasses', function (Blueprint $table) {
                $table->string('image_path')->nullable()->after('name');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('sheet_glasses') && Schema::hasColumn('sheet_glasses', 'image_path')) {
            Schema::table('sheet_glasses', function (Blueprint $table) {
                $table->dropColumn('image_path');
            });
        }
    }
};
