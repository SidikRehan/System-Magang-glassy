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
        if (Schema::hasTable('tools') && !Schema::hasColumn('tools', 'lost_qty')) {
            Schema::table('tools', function (Blueprint $table) {
                $table->integer('lost_qty')->default(0)->after('damaged_qty');
            });
        }

        if (Schema::hasTable('tool_borrows')) {
            Schema::table('tool_borrows', function (Blueprint $table) {
                if (!Schema::hasColumn('tool_borrows', 'return_condition')) {
                    $table->string('return_condition')->default('Baik')->after('status');
                }
                if (!Schema::hasColumn('tool_borrows', 'damaged_qty')) {
                    $table->integer('damaged_qty')->default(0)->after('return_condition');
                }
                if (!Schema::hasColumn('tool_borrows', 'lost_qty')) {
                    $table->integer('lost_qty')->default(0)->after('damaged_qty');
                }
                if (!Schema::hasColumn('tool_borrows', 'return_notes')) {
                    $table->text('return_notes')->nullable()->after('notes');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('tools') && Schema::hasColumn('tools', 'lost_qty')) {
            Schema::table('tools', function (Blueprint $table) {
                $table->dropColumn('lost_qty');
            });
        }

        if (Schema::hasTable('tool_borrows')) {
            Schema::table('tool_borrows', function (Blueprint $table) {
                $cols = [];
                foreach (['return_condition', 'damaged_qty', 'lost_qty', 'return_notes'] as $col) {
                    if (Schema::hasColumn('tool_borrows', $col)) {
                        $cols[] = $col;
                    }
                }
                if (!empty($cols)) {
                    $table->dropColumn($cols);
                }
            });
        }
    }
};

