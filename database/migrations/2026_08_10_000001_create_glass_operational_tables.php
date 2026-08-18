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
        // Table Order / SPO (CV Cahya Karunia Jaya PRD)
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->date('order_date')->default(now());
            $table->string('spo_number')->unique();
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->text('customer_address');
            $table->string('glass_type');
            $table->decimal('length_cm', 8, 2);
            $table->decimal('width_cm', 8, 2);
            $table->integer('thickness_mm');
            $table->json('processes'); // ['HT', 'GM', 'BV', 'Etsa', 'Bor']
            $table->json('accessories')->nullable(); // ['Lem pcs', 'Aksesoris alumunium', 'Handle pintu', 'Tambahan proses']
            $table->json('items')->nullable(); // Multi-item glass list [{glass_type, length_cm, width_cm, thickness_mm, qty, processes}]
            $table->text('description')->nullable();
            $table->string('sketch_photo_path')->nullable();
            $table->enum('priority_status', ['Biasa', 'Prioritas'])->default('Biasa');
            $table->date('deadline_date')->nullable();
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('priority_fee', 12, 2)->default(0);
            $table->decimal('custom_fee', 12, 2)->default(0);
            $table->decimal('total_price', 12, 2)->default(0);
            $table->decimal('paid_amount', 12, 2)->default(0);
            $table->string('payment_status')->default('Belum Lunas'); // Belum Lunas, DP (30%), DP (50%), Lunas, etc.
            $table->enum('status', ['draft', 'pengerjaan', 'pengiriman', 'pembayaran', 'selesai'])->default('draft');
            $table->string('current_division')->default('admin_toko');
            $table->json('division_progress')->nullable();
            $table->string('used_scrap_rak')->nullable();
            $table->text('revision_notes')->nullable();
            $table->timestamps();
        });

        // Table Stok Kaca Sisa di Rak (Scrap Glass)
        Schema::create('scrap_glasses', function (Blueprint $table) {
            $table->id();
            $table->string('scrap_code')->unique();
            $table->string('glass_type');
            $table->decimal('length_cm', 8, 2);
            $table->decimal('width_cm', 8, 2);
            $table->string('rak_location'); // e.g. Rak F7, Rak A09
            $table->string('status')->default('Layak Pakai');
            $table->timestamps();
        });

        // Table Pengiriman & Surat Jalan 4 Warna
        Schema::create('deliveries', function (Blueprint $table) {
            $table->id();
            $table->string('waybill_number')->unique();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->string('driver_name');
            $table->string('vehicle_plate');
            $table->enum('waybill_color', ['Putih', 'Merah', 'Kuning'])->default('Putih');
            $table->enum('delivery_status', ['Dalam Pengiriman', 'Selesai Terkirim', 'Dibatalkan'])->default('Dalam Pengiriman');
            $table->string('proof_photo_path')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deliveries');
        Schema::dropIfExists('scrap_glasses');
        Schema::dropIfExists('orders');
    }
};
