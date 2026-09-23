<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tambah index pada kolom yang sering di-filter di dashboard query.
     * Sebelumnya seluruh tabel di-scan penuh (full table scan) untuk setiap
     * query aggregate sum/count yang dijalankan di computeDashboardMetrics().
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Dipakai di: WHERE status = 'pengerjaan', WHERE status = 'pengiriman'
            $table->index('status', 'idx_orders_status');

            // Dipakai di: WHERE payment_status != 'Lunas' (sum pendingCOD)
            $table->index('payment_status', 'idx_orders_payment_status');
        });

        Schema::table('finance_transactions', function (Blueprint $table) {
            // Dipakai di: WHERE approval_status = 'approved' / 'pending'
            $table->index('approval_status', 'idx_fin_approval_status');

            // Dipakai di: WHERE type IN ('pembelian_bahan', ...) atau WHERE type = 'pemasukan_lain'
            $table->index('type', 'idx_fin_type');

            // Composite index untuk query yang sering gabungkan approval_status + type
            $table->index(['approval_status', 'type'], 'idx_fin_approval_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('idx_orders_status');
            $table->dropIndex('idx_orders_payment_status');
        });

        Schema::table('finance_transactions', function (Blueprint $table) {
            $table->dropIndex('idx_fin_approval_status');
            $table->dropIndex('idx_fin_type');
            $table->dropIndex('idx_fin_approval_type');
        });
    }
};
