<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Table Kaca Lembaran (Master Catalog Sheet Glass)
        Schema::create('sheet_glasses', function (Blueprint $table) {
            $table->id();
            $table->string('item_code')->unique();
            $table->string('name');
            $table->string('category')->default('Kaca Cermin');
            $table->decimal('length_cm', 8, 2)->default(183);
            $table->decimal('width_cm', 8, 2)->default(244);
            $table->string('size')->default('183 x 244 cm');
            $table->integer('thickness_mm')->default(5);
            $table->decimal('buy_price', 12, 2)->default(0);
            $table->decimal('sell_price', 12, 2)->default(0); // Harga jual dasar per m2
            $table->decimal('rate_gm', 10, 2)->default(10000);
            $table->decimal('rate_ht', 10, 2)->default(1000);
            $table->decimal('rate_bv', 10, 2)->default(15000);
            $table->decimal('rate_etsa', 10, 2)->default(50000);
            $table->integer('qty')->default(0);
            $table->string('unit')->default('Lembar');
            $table->string('supplier_name')->nullable();
            $table->string('supplier_phone')->nullable();
            $table->string('supplier_pic')->nullable();
            $table->date('last_restock')->nullable();
            $table->string('status')->default('Aman');
            $table->timestamps();
        });

        // 2. Table Mitra Supplier
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category')->default('Kaca Cermin & Bening');
            $table->string('phone');
            $table->string('pic');
            $table->text('address')->nullable();
            $table->string('status')->default('Mitra Aktif');
            $table->timestamps();
        });

        // 3. Table Aksesoris & Hardware Kaca
        Schema::create('accessories', function (Blueprint $table) {
            $table->id();
            $table->string('acc_code')->unique();
            $table->string('name');
            $table->decimal('buy_price', 12, 2)->default(0);
            $table->decimal('sell_price', 12, 2)->default(0);
            $table->integer('qty')->default(0);
            $table->string('unit')->default('Pcs');
            $table->string('status')->default('Aman');
            $table->timestamps();
        });

        // 4. Table Alat Penunjang & Mesin
        Schema::create('tools', function (Blueprint $table) {
            $table->id();
            $table->string('tool_code')->unique();
            $table->string('name');
            $table->string('category')->default('Alat Potong Manual');
            $table->string('condition')->default('Baik'); // Baik, Perlu Servis, Rusak
            $table->string('location')->default('Gudang Utama');
            $table->integer('total_qty')->default(1);
            $table->integer('available_qty')->default(1);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 5. Table Peminjaman Alat
        Schema::create('tool_borrows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tool_id')->constrained('tools')->onDelete('cascade');
            $table->string('borrower_name');
            $table->dateTime('borrow_date');
            $table->dateTime('return_date')->nullable();
            $table->integer('qty')->default(1);
            $table->string('status')->default('Dipinjam'); // Dipinjam, Dikembalikan
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 6. Table Perlengkapan & Bahan Habis Pakai (Supplies)
        Schema::create('supplies', function (Blueprint $table) {
            $table->id();
            $table->string('item_code')->unique();
            $table->string('name');
            $table->string('category')->default('Konsumabel Pemotongan');
            $table->integer('qty')->default(0);
            $table->string('unit')->default('Pcs');
            $table->integer('min_stock')->default(5);
            $table->string('status')->default('Aman'); // Aman, Menipis, Habis
            $table->timestamps();
        });

        // 7. Table Log Pemakaian Perlengkapan
        Schema::create('supply_usages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supply_id')->constrained('supplies')->onDelete('cascade');
            $table->string('user_name');
            $table->integer('qty');
            $table->string('division')->default('HT (Potong)');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 8. Table Pengajuan Restock Perlengkapan
        Schema::create('supply_restocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supply_id')->constrained('supplies')->onDelete('cascade');
            $table->integer('request_qty');
            $table->text('notes')->nullable();
            $table->string('status')->default('Menunggu Persetujuan'); // Menunggu Persetujuan, Disetujui, Selesai Restok, Ditolak
            $table->timestamps();
        });

        // Seeding Data Bawaan (Initial Data Seeding)
        $now = now();

        // Seed Sheet Glasses
        DB::table('sheet_glasses')->insert([
            [
                'item_code' => 'BRG-001',
                'name' => 'Kaca Cermin Polos 5 mm Standard',
                'category' => 'Kaca Cermin',
                'length_cm' => 183,
                'width_cm' => 244,
                'size' => '183 x 244 cm',
                'thickness_mm' => 5,
                'buy_price' => 280000,
                'sell_price' => 380000,
                'rate_gm' => 10000,
                'rate_ht' => 1000,
                'rate_bv' => 15000,
                'rate_etsa' => 50000,
                'qty' => 25,
                'unit' => 'Lembar',
                'supplier_name' => 'PT Asahimas Flat Glass Tbk (Divisi Cermin)',
                'supplier_phone' => '6281234567890',
                'supplier_pic' => 'Pak Gunawan',
                'last_restock' => '2026-08-25',
                'status' => 'Aman',
                'created_at' => $now,
                'updated_at' => $now
            ],
            [
                'item_code' => 'BRG-002',
                'name' => 'Kaca Bening Polos 8 mm Float Glass',
                'category' => 'Kaca Bening / Clear',
                'length_cm' => 214,
                'width_cm' => 305,
                'size' => '214 x 305 cm',
                'thickness_mm' => 8,
                'buy_price' => 320000,
                'sell_price' => 450000,
                'rate_gm' => 10000,
                'rate_ht' => 1000,
                'rate_bv' => 15000,
                'rate_etsa' => 50000,
                'qty' => 18,
                'unit' => 'Lembar',
                'supplier_name' => 'PT Mulia Glass Float & Mirror',
                'supplier_phone' => '6281398765432',
                'supplier_pic' => 'Ibu Siska',
                'last_restock' => '2026-08-22',
                'status' => 'Aman',
                'created_at' => $now,
                'updated_at' => $now
            ],
            [
                'item_code' => 'BRG-003',
                'name' => 'Kaca Bening Polos 10 mm Tempered Raw',
                'category' => 'Kaca Tempered',
                'length_cm' => 244,
                'width_cm' => 366,
                'size' => '244 x 366 cm',
                'thickness_mm' => 10,
                'buy_price' => 520000,
                'sell_price' => 720000,
                'rate_gm' => 10000,
                'rate_ht' => 1000,
                'rate_bv' => 15000,
                'rate_etsa' => 50000,
                'qty' => 8,
                'unit' => 'Lembar',
                'supplier_name' => 'PT Kaca Tempered Nusantara',
                'supplier_phone' => '6281908070605',
                'supplier_pic' => 'Pak Irwan',
                'last_restock' => '2026-08-18',
                'status' => 'Menipis',
                'created_at' => $now,
                'updated_at' => $now
            ],
            [
                'item_code' => 'BRG-004',
                'name' => 'Kaca Bening Polos 12 mm Architectural',
                'category' => 'Kaca Tempered',
                'length_cm' => 244,
                'width_cm' => 366,
                'size' => '244 x 366 cm',
                'thickness_mm' => 12,
                'buy_price' => 680000,
                'sell_price' => 950000,
                'rate_gm' => 10000,
                'rate_ht' => 1000,
                'rate_bv' => 15000,
                'rate_etsa' => 50000,
                'qty' => 4,
                'unit' => 'Lembar',
                'supplier_name' => 'PT Kaca Tempered Nusantara',
                'supplier_phone' => '6281908070605',
                'supplier_pic' => 'Pak Irwan',
                'last_restock' => '2026-08-15',
                'status' => 'Pengajuan Proses Restock',
                'created_at' => $now,
                'updated_at' => $now
            ],
            [
                'item_code' => 'BRG-005',
                'name' => 'Kaca Cermin Bronze 5 mm Luxury',
                'category' => 'Kaca Cermin',
                'length_cm' => 183,
                'width_cm' => 244,
                'size' => '183 x 244 cm',
                'thickness_mm' => 5,
                'buy_price' => 390000,
                'sell_price' => 540000,
                'rate_gm' => 10000,
                'rate_ht' => 1000,
                'rate_bv' => 15000,
                'rate_etsa' => 50000,
                'qty' => 15,
                'unit' => 'Lembar',
                'supplier_name' => 'PT Asahimas Flat Glass Tbk (Divisi Cermin)',
                'supplier_phone' => '6281234567890',
                'supplier_pic' => 'Pak Gunawan',
                'last_restock' => '2026-08-26',
                'status' => 'Aman',
                'created_at' => $now,
                'updated_at' => $now
            ],
            [
                'item_code' => 'BRG-006',
                'name' => 'Kaca Cermin Grey 5 mm Modern',
                'category' => 'Kaca Cermin',
                'length_cm' => 183,
                'width_cm' => 244,
                'size' => '183 x 244 cm',
                'thickness_mm' => 5,
                'buy_price' => 385000,
                'sell_price' => 530000,
                'rate_gm' => 10000,
                'rate_ht' => 1000,
                'rate_bv' => 15000,
                'rate_etsa' => 50000,
                'qty' => 12,
                'unit' => 'Lembar',
                'supplier_name' => 'PT Asahimas Flat Glass Tbk (Divisi Cermin)',
                'supplier_phone' => '6281234567890',
                'supplier_pic' => 'Pak Gunawan',
                'last_restock' => '2026-08-20',
                'status' => 'Aman',
                'created_at' => $now,
                'updated_at' => $now
            ],
            [
                'item_code' => 'BRG-007',
                'name' => 'Kaca Riben / Tinted Dark Grey 6 mm',
                'category' => 'Kaca Tinted / Riben',
                'length_cm' => 183,
                'width_cm' => 244,
                'size' => '183 x 244 cm',
                'thickness_mm' => 6,
                'buy_price' => 310000,
                'sell_price' => 430000,
                'rate_gm' => 10000,
                'rate_ht' => 1000,
                'rate_bv' => 15000,
                'rate_etsa' => 50000,
                'qty' => 6,
                'unit' => 'Lembar',
                'supplier_name' => 'PT Global Tinted Glass Import',
                'supplier_phone' => '6281577889900',
                'supplier_pic' => 'Pak Budianto',
                'last_restock' => '2026-08-10',
                'status' => 'Menipis',
                'created_at' => $now,
                'updated_at' => $now
            ],
            [
                'item_code' => 'BRG-008',
                'name' => 'Kaca Acid Etsa Frosted 5 mm',
                'category' => 'Kaca Etsa / Sandblast',
                'length_cm' => 183,
                'width_cm' => 244,
                'size' => '183 x 244 cm',
                'thickness_mm' => 5,
                'buy_price' => 350000,
                'sell_price' => 480000,
                'rate_gm' => 10000,
                'rate_ht' => 1000,
                'rate_bv' => 15000,
                'rate_etsa' => 50000,
                'qty' => 20,
                'unit' => 'Lembar',
                'supplier_name' => 'CV ArtGlass Dekoratif Etsa',
                'supplier_phone' => '6281288990011',
                'supplier_pic' => 'Pak Rudy',
                'last_restock' => '2026-08-24',
                'status' => 'Aman',
                'created_at' => $now,
                'updated_at' => $now
            ],
            [
                'item_code' => 'BRG-009',
                'name' => 'Kaca Laminated 5+5 mm Bening Safety',
                'category' => 'Kaca Laminated',
                'length_cm' => 214,
                'width_cm' => 305,
                'size' => '214 x 305 cm',
                'thickness_mm' => 10,
                'buy_price' => 620000,
                'sell_price' => 850000,
                'rate_gm' => 10000,
                'rate_ht' => 1000,
                'rate_bv' => 15000,
                'rate_etsa' => 50000,
                'qty' => 12,
                'unit' => 'Lembar',
                'supplier_name' => 'PT Kaca Tempered Nusantara',
                'supplier_phone' => '6281908070605',
                'supplier_pic' => 'Pak Irwan',
                'last_restock' => '2026-08-28',
                'status' => 'Aman',
                'created_at' => $now,
                'updated_at' => $now
            ]
        ]);

        // Seed Suppliers
        DB::table('suppliers')->insert([
            ['name' => 'PT Asahimas Flat Glass Tbk (Divisi Cermin)', 'category' => 'Kaca Cermin & Bening', 'phone' => '6281234567890', 'pic' => 'Pak Gunawan', 'address' => 'Kawasan Industri Ancol, Jakarta Utara', 'status' => 'Mitra Utama', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'PT Mulia Glass Float & Mirror', 'category' => 'Kaca Float & Cermin Grey', 'phone' => '6281398765432', 'pic' => 'Ibu Siska', 'address' => 'Jl. Raya Lemahabang, Cikarang', 'status' => 'Mitra Aktif', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'PT Kaca Tempered Nusantara', 'category' => 'Kaca Tempered & Laminated', 'phone' => '6281908070605', 'pic' => 'Pak Irwan', 'address' => 'Kawasan Industri Jababeka, Bekasi', 'status' => 'Mitra Aktif', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'PT Global Tinted Glass Import', 'category' => 'Kaca Tinted & Dark Grey', 'phone' => '6281577889900', 'pic' => 'Pak Budianto', 'address' => 'Kawasan Industri MM2100, Cibitung', 'status' => 'Mitra Impor', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'CV ArtGlass Dekoratif Etsa', 'category' => 'Kaca Etsa & Sandblast', 'phone' => '6281288990011', 'pic' => 'Pak Rudy', 'address' => 'Jl. Soekarno Hatta, Bandung', 'status' => 'Mitra Lokal', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // Seed Accessories
        DB::table('accessories')->insert([
            ['acc_code' => 'ACC-001', 'name' => 'Spigot Stainless Steel 304 Balustrade', 'buy_price' => 110000, 'sell_price' => 165000, 'qty' => 45, 'unit' => 'Pcs', 'status' => 'Aman', 'created_at' => $now, 'updated_at' => $now],
            ['acc_code' => 'ACC-002', 'name' => 'Engsel Glass-to-Glass Heavy Duty', 'buy_price' => 175000, 'sell_price' => 240000, 'qty' => 24, 'unit' => 'Set', 'status' => 'Aman', 'created_at' => $now, 'updated_at' => $now],
            ['acc_code' => 'ACC-003', 'name' => 'Bracket Clamp Stainless Steel', 'buy_price' => 42000, 'sell_price' => 65000, 'qty' => 60, 'unit' => 'Pcs', 'status' => 'Aman', 'created_at' => $now, 'updated_at' => $now],
            ['acc_code' => 'ACC-004', 'name' => 'Silicone Sealant Neutral High Grade', 'buy_price' => 32000, 'sell_price' => 45000, 'qty' => 15, 'unit' => 'Tube', 'status' => 'Aman', 'created_at' => $now, 'updated_at' => $now],
            ['acc_code' => 'ACC-005', 'name' => 'Handle Pintu Stainless Tubular 40cm', 'buy_price' => 220000, 'sell_price' => 320000, 'qty' => 12, 'unit' => 'Pasang', 'status' => 'Aman', 'created_at' => $now, 'updated_at' => $now],
            ['acc_code' => 'ACC-006', 'name' => 'Floor Hinge Heavy Duty Dorma Style', 'buy_price' => 620000, 'sell_price' => 850000, 'qty' => 5, 'unit' => 'Unit', 'status' => 'Menipis', 'created_at' => $now, 'updated_at' => $now],
            ['acc_code' => 'ACC-007', 'name' => 'Slot Kunci Kaca Stainless', 'buy_price' => 95000, 'sell_price' => 145000, 'qty' => 18, 'unit' => 'Pcs', 'status' => 'Aman', 'created_at' => $now, 'updated_at' => $now],
            ['acc_code' => 'ACC-008', 'name' => 'List Alumunium U-Channel Profile', 'buy_price' => 75000, 'sell_price' => 110000, 'qty' => 35, 'unit' => 'Batang', 'status' => 'Aman', 'created_at' => $now, 'updated_at' => $now],
            ['acc_code' => 'ACC-009', 'name' => 'Karet Lis Gasket Weatherstrip', 'buy_price' => 8500, 'sell_price' => 15000, 'qty' => 100, 'unit' => 'Meter', 'status' => 'Aman', 'created_at' => $now, 'updated_at' => $now],
            ['acc_code' => 'ACC-010', 'name' => 'Patch Fitting Door Lock Set', 'buy_price' => 380000, 'sell_price' => 550000, 'qty' => 0, 'unit' => 'Set', 'status' => 'Habis', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // Seed Tools
        DB::table('tools')->insert([
            ['tool_code' => 'ALT-001', 'name' => 'Glass Cutter Toyo TC-17 Original', 'category' => 'Alat Potong Manual', 'condition' => 'Baik', 'location' => 'Meja Potong HT', 'total_qty' => 6, 'available_qty' => 4, 'notes' => 'Mata pisau intan tajam', 'created_at' => $now, 'updated_at' => $now],
            ['tool_code' => 'ALT-002', 'name' => 'Suction Cup Vacuum Lifter 3 Cakar', 'category' => 'Alat Angkat / Handling', 'condition' => 'Baik', 'location' => 'Area Loading Gudang', 'total_qty' => 8, 'available_qty' => 6, 'notes' => 'Karet suction prima', 'created_at' => $now, 'updated_at' => $now],
            ['tool_code' => 'ALT-003', 'name' => 'Mesin Bor Kaca Portable Diamond Drill', 'category' => 'Mesin Pengeboran', 'condition' => 'Baik', 'location' => 'Meja Bor Workshop', 'total_qty' => 3, 'available_qty' => 2, 'notes' => 'Water cooling jalan', 'created_at' => $now, 'updated_at' => $now],
            ['tool_code' => 'ALT-004', 'name' => 'Hand Polisher / Mesin Gosok Tepi', 'category' => 'Mesin Finishing', 'condition' => 'Perlu Servis', 'location' => 'Area Servis Mesin', 'total_qty' => 2, 'available_qty' => 0, 'notes' => 'Carbon brush aus', 'created_at' => $now, 'updated_at' => $now],
            ['tool_code' => 'ALT-005', 'name' => 'Diamond Wheel Grinding Beveling', 'category' => 'Mata Pisau & Asahan', 'condition' => 'Baik', 'location' => 'Loker Alat Khusus', 'total_qty' => 10, 'available_qty' => 10, 'notes' => 'Cadangan roda gosok', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // Seed Supplies
        DB::table('supplies')->insert([
            ['item_code' => 'PLK-001', 'name' => 'Minyak Tanah / Kerosene Pelumas Potong', 'category' => 'Konsumabel Pemotongan', 'qty' => 40, 'unit' => 'Liter', 'min_stock' => 10, 'status' => 'Aman', 'created_at' => $now, 'updated_at' => $now],
            ['item_code' => 'PLK-002', 'name' => 'Cerium Oxide Glass Polishing Powder', 'category' => 'Bahan Gosok Mesin', 'qty' => 15, 'unit' => 'Kg', 'min_stock' => 5, 'status' => 'Aman', 'created_at' => $now, 'updated_at' => $now],
            ['item_code' => 'PLK-003', 'name' => 'Sarung Tangan Kevlar Anti Sayat Kaca', 'category' => 'K3 & Safety Karyawan', 'qty' => 6, 'unit' => 'Pasang', 'min_stock' => 10, 'status' => 'Menipis', 'created_at' => $now, 'updated_at' => $now],
            ['item_code' => 'PLK-004', 'name' => 'Lakban Kertas Masking Tape Etsa 2 Inch', 'category' => 'Konsumabel Sandblast', 'qty' => 28, 'unit' => 'Roll', 'min_stock' => 10, 'status' => 'Aman', 'created_at' => $now, 'updated_at' => $now],
            ['item_code' => 'PLK-005', 'name' => 'Pasir Silika Sandblast Extra Fine Mesh', 'category' => 'Konsumabel Sandblast', 'qty' => 3, 'unit' => 'Karung (25kg)', 'min_stock' => 5, 'status' => 'Menipis', 'created_at' => $now, 'updated_at' => $now],
            ['item_code' => 'PLK-006', 'name' => 'Kertas Koran Pembungkus Kaca Pengiriman', 'category' => 'Packing & Ekspedisi', 'qty' => 85, 'unit' => 'Kg', 'min_stock' => 20, 'status' => 'Aman', 'created_at' => $now, 'updated_at' => $now],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('supply_restocks');
        Schema::dropIfExists('supply_usages');
        Schema::dropIfExists('supplies');
        Schema::dropIfExists('tool_borrows');
        Schema::dropIfExists('tools');
        Schema::dropIfExists('accessories');
        Schema::dropIfExists('suppliers');
        Schema::dropIfExists('sheet_glasses');
    }
};
