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
        if (Schema::hasTable('supplies') && !Schema::hasColumn('supplies', 'image_path')) {
            Schema::table('supplies', function (Blueprint $table) {
                $table->string('image_path')->nullable()->after('name');
            });
        }

        if (Schema::hasTable('tools') && !Schema::hasColumn('tools', 'image_path')) {
            Schema::table('tools', function (Blueprint $table) {
                $table->string('image_path')->nullable()->after('name');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('supplies') && Schema::hasColumn('supplies', 'image_path')) {
            Schema::table('supplies', function (Blueprint $table) {
                $table->dropColumn('image_path');
            });
        }

        if (Schema::hasTable('tools') && Schema::hasColumn('tools', 'image_path')) {
            Schema::table('tools', function (Blueprint $table) {
                $table->dropColumn('image_path');
            });
        }
    }
};
