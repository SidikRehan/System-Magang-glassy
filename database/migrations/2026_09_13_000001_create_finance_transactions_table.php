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
        Schema::create('finance_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_code')->unique();
            $table->string('type'); // pembelian_bahan, pembelian_aksesoris, pembelian_alat, biaya_operasional, pemasukan_lain
            $table->string('category');
            $table->string('title');
            $table->decimal('amount', 15, 2);
            $table->string('supplier_name')->nullable();
            $table->string('invoice_number')->nullable();
            $table->string('payment_method')->default('Transfer Bank BCA');
            $table->string('payment_status')->default('Lunas'); // Lunas, Tempo, DP
            $table->date('transaction_date');
            $table->date('due_date')->nullable();
            $table->text('notes')->nullable();
            $table->string('receipt_photo_path')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('finance_transactions');
    }
};
