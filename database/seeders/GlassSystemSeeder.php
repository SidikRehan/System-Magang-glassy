<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\ScrapGlass;
use App\Models\Delivery;

class GlassSystemSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Order SPO Sample 1: Pengerjaan di Divisi GM (Gosok Mesin)
        $order1 = Order::create([
            'order_date' => now()->subDays(3)->toDateString(),
            'spo_number' => 'SPO-0128',
            'customer_name' => 'Pak Sidik',
            'customer_phone' => '0812-3456-7890',
            'customer_address' => 'Jl. Sunda No. 45, Bandung',
            'glass_type' => 'Kaca Cermin 5 mm polos',
            'length_cm' => 150.5,
            'width_cm' => 120.0,
            'thickness_mm' => 5,
            'processes' => ['HT', 'GM', 'BV'],
            'accessories' => [
                ['name' => 'Aksesoris alumunium', 'price' => 75000, 'qty' => 2],
                ['name' => 'Lem pcs', 'price' => 35000, 'qty' => 1]
            ],
            'items' => [
                [
                    'glass_type' => 'Kaca Cermin 5 mm polos',
                    'length_cm' => 150.5,
                    'width_cm' => 120.0,
                    'thickness_mm' => 5,
                    'qty' => 1,
                    'processes' => ['HT', 'GM', 'BV'],
                    'subtotal' => 950000
                ]
            ],
            'description' => 'Gosok halus pinggir, sudut coak R10.',
            'priority_status' => 'Biasa',
            'deadline_date' => now()->addDays(2)->toDateString(),
            'subtotal' => 950000,
            'priority_fee' => 0,
            'custom_fee' => 0,
            'total_price' => 1135000,
            'paid_amount' => 600000,
            'payment_status' => 'DP (53%)',
            'status' => 'pengerjaan',
            'current_division' => 'divisi_gm',
            'division_progress' => [
                'HT' => 'Selesai',
                'GM' => 'Sedang Dikerjakan',
                'BV' => 'Belum',
                'Etsa' => 'N/A'
            ],
            'division_timestamps' => [
                'HT' => ['started_at' => now()->subDays(3)->addHours(2)->toDateTimeString(), 'completed_at' => now()->subDays(2)->addHours(4)->toDateTimeString()],
                'GM' => ['started_at' => now()->subDays(2)->addHours(5)->toDateTimeString(), 'completed_at' => null],
                'BV' => ['started_at' => null, 'completed_at' => null],
                'Etsa' => ['started_at' => null, 'completed_at' => null],
            ],
            'used_scrap_rak' => 'Rak F7',
            'gudang_released_at' => now()->subDays(3)->addHours(2),
        ]);

        // 2. Order SPO Sample 2: Siap Kirim (QC Ready)
        $order2 = Order::create([
            'order_date' => now()->subDays(5)->toDateString(),
            'spo_number' => 'SPO-0129',
            'customer_name' => 'Ibu Ratna (Villa Dago)',
            'customer_phone' => '0813-9876-5432',
            'customer_address' => 'Jl. Dago Pakar No. 88, Bandung',
            'glass_type' => 'Kaca 12 mm Polos Tempered',
            'length_cm' => 300.0,
            'width_cm' => 200.0,
            'thickness_mm' => 12,
            'processes' => ['HT', 'GM', 'Bor'],
            'accessories' => [
                ['name' => 'Handle pintu stainless', 'price' => 250000, 'qty' => 1],
                ['name' => 'Lem pcs', 'price' => 35000, 'qty' => 2]
            ],
            'items' => [
                [
                    'glass_type' => 'Kaca 12 mm Polos Tempered',
                    'length_cm' => 300.0,
                    'width_cm' => 200.0,
                    'thickness_mm' => 12,
                    'qty' => 1,
                    'processes' => ['HT', 'GM', 'Bor'],
                    'subtotal' => 2800000
                ]
            ],
            'description' => 'Untuk pintu sekat shower bathroom villa.',
            'priority_status' => 'Prioritas',
            'deadline_date' => now()->toDateString(),
            'subtotal' => 2800000,
            'priority_fee' => 150000,
            'custom_fee' => 0,
            'total_price' => 3270000,
            'paid_amount' => 3270000,
            'payment_status' => 'Lunas',
            'status' => 'pengiriman',
            'current_division' => 'QC_Ready',
            'division_progress' => [
                'HT' => 'Selesai',
                'GM' => 'Selesai',
                'BV' => 'N/A',
                'Etsa' => 'N/A'
            ],
            'division_timestamps' => [
                'HT' => ['started_at' => now()->subDays(5)->addHours(1)->toDateTimeString(), 'completed_at' => now()->subDays(3)->addHours(3)->toDateTimeString()],
                'GM' => ['started_at' => now()->subDays(3)->addHours(4)->toDateTimeString(), 'completed_at' => now()->subDays(1)->addHours(4)->toDateTimeString()],
                'BV' => ['started_at' => null, 'completed_at' => null],
                'Etsa' => ['started_at' => null, 'completed_at' => null],
            ],
            'gudang_released_at' => now()->subDays(5)->addHours(1),
            'execution_completed_at' => now()->subDays(1)->addHours(4),
        ]);

        // 3. Order SPO Sample 3: Draft (Admin Toko)
        $order3 = Order::create([
            'order_date' => now()->toDateString(),
            'spo_number' => 'SPO-0130',
            'customer_name' => 'PT Arsitek Indonesia',
            'customer_phone' => '0811-2233-4455',
            'customer_address' => 'Gedung Wisma Millenium Lt. 4, Jakarta',
            'glass_type' => 'Kaca Cermin Grey 5 mm (+ 1 item lainnya)',
            'length_cm' => 120.0,
            'width_cm' => 100.0,
            'thickness_mm' => 5,
            'processes' => ['HT', 'BV', 'Etsa'],
            'accessories' => [
                ['name' => 'Aksesoris alumunium', 'price' => 50000, 'qty' => 2]
            ],
            'items' => [
                [
                    'glass_type' => 'Kaca Cermin Grey 5 mm',
                    'length_cm' => 120.0,
                    'width_cm' => 100.0,
                    'thickness_mm' => 5,
                    'qty' => 2,
                    'processes' => ['HT', 'BV', 'Etsa'],
                    'subtotal' => 1200000
                ],
                [
                    'glass_type' => 'Kaca Bening 8 mm polos',
                    'length_cm' => 100.0,
                    'width_cm' => 50.0,
                    'thickness_mm' => 8,
                    'qty' => 1,
                    'processes' => ['HT', 'GM'],
                    'subtotal' => 250000
                ]
            ],
            'description' => 'Sandblast logo kantor pusat pada item cermin.',
            'priority_status' => 'Biasa',
            'deadline_date' => now()->addDays(5)->toDateString(),
            'subtotal' => 1450000,
            'priority_fee' => 0,
            'custom_fee' => 50000,
            'total_price' => 1600000,
            'paid_amount' => 0,
            'payment_status' => 'Belum Lunas',
            'status' => 'draft',
            'current_division' => 'admin_toko',
            'division_progress' => [
                'HT' => 'Belum',
                'GM' => 'Belum',
                'BV' => 'Belum',
                'Etsa' => 'Belum'
            ],
            'division_timestamps' => [
                'HT' => ['started_at' => null, 'completed_at' => null],
                'GM' => ['started_at' => null, 'completed_at' => null],
                'BV' => ['started_at' => null, 'completed_at' => null],
                'Etsa' => ['started_at' => null, 'completed_at' => null],
            ]
        ]);

        // 4. Order SPO Sample 4: Pengerjaan di Divisi HT (Potong / Pemotongan)
        $order4 = Order::create([
            'order_date' => now()->subDays(1)->toDateString(),
            'spo_number' => 'SPO-0131',
            'customer_name' => 'Toko Kaca Jaya Mulia',
            'customer_phone' => '0857-1122-3344',
            'customer_address' => 'Jl. Soekarno Hatta No. 210, Bandung',
            'glass_type' => 'Kaca Bening 10 mm Tempered (+ 1 item lainnya)',
            'length_cm' => 210.0,
            'width_cm' => 150.0,
            'thickness_mm' => 10,
            'processes' => ['HT', 'GM'],
            'accessories' => [],
            'items' => [
                [
                    'glass_type' => 'Kaca Bening 10 mm Tempered',
                    'length_cm' => 210.0,
                    'width_cm' => 150.0,
                    'thickness_mm' => 10,
                    'qty' => 2,
                    'processes' => ['HT', 'GM'],
                    'subtotal' => 3150000
                ],
                [
                    'glass_type' => 'Kaca Cermin Bronze 5 mm',
                    'length_cm' => 180.0,
                    'width_cm' => 90.0,
                    'thickness_mm' => 5,
                    'qty' => 1,
                    'processes' => ['HT', 'BV'],
                    'subtotal' => 850000
                ]
            ],
            'description' => 'Potongan presisi tinggi untuk sekat toko.',
            'priority_status' => 'Prioritas',
            'deadline_date' => now()->addDays(1)->toDateString(),
            'subtotal' => 4000000,
            'priority_fee' => 150000,
            'custom_fee' => 0,
            'total_price' => 4150000,
            'paid_amount' => 2000000,
            'payment_status' => 'DP (48%)',
            'status' => 'pengerjaan',
            'current_division' => 'divisi_ht',
            'division_progress' => [
                'HT' => 'Sedang Dikerjakan',
                'GM' => 'Belum',
                'BV' => 'Belum',
                'Etsa' => 'N/A'
            ],
            'division_timestamps' => [
                'HT' => ['started_at' => now()->subHours(3)->toDateTimeString(), 'completed_at' => null],
                'GM' => ['started_at' => null, 'completed_at' => null],
                'BV' => ['started_at' => null, 'completed_at' => null],
                'Etsa' => ['started_at' => null, 'completed_at' => null],
            ],
            'used_scrap_rak' => 'Rak A09',
            'gudang_released_at' => now()->subDays(1)->addHours(3),
        ]);

        // 5. Order SPO Sample 5: Pengerjaan di Divisi BV (Beveling)
        $order5 = Order::create([
            'order_date' => now()->subDays(2)->toDateString(),
            'spo_number' => 'SPO-0132',
            'customer_name' => 'CV Interior Elegant',
            'customer_phone' => '0821-9988-7766',
            'customer_address' => 'Kawasan Industri Cimahi Blok C5, Bandung',
            'glass_type' => 'Kaca Cermin 5 mm Bevel 3 cm',
            'length_cm' => 180.0,
            'width_cm' => 120.0,
            'thickness_mm' => 5,
            'processes' => ['HT', 'GM', 'BV'],
            'accessories' => [
                ['name' => 'Aksesoris alumunium', 'price' => 120000, 'qty' => 2]
            ],
            'items' => [
                [
                    'glass_type' => 'Kaca Cermin 5 mm Bevel 3 cm',
                    'length_cm' => 180.0,
                    'width_cm' => 120.0,
                    'thickness_mm' => 5,
                    'qty' => 4,
                    'processes' => ['HT', 'GM', 'BV'],
                    'bevel_width_cm' => 3,
                    'subtotal' => 2400000
                ]
            ],
            'description' => 'Bevel 3 cm sekeliling cermin dinding lobby.',
            'priority_status' => 'Biasa',
            'deadline_date' => now()->addDays(3)->toDateString(),
            'subtotal' => 2400000,
            'priority_fee' => 0,
            'custom_fee' => 0,
            'total_price' => 2640000,
            'paid_amount' => 1320000,
            'payment_status' => 'DP (50%)',
            'status' => 'pengerjaan',
            'current_division' => 'divisi_bv',
            'division_progress' => [
                'HT' => 'Selesai',
                'GM' => 'Selesai',
                'BV' => 'Sedang Dikerjakan',
                'Etsa' => 'N/A'
            ],
            'division_timestamps' => [
                'HT' => ['started_at' => now()->subDays(2)->addHours(1)->toDateTimeString(), 'completed_at' => now()->subDays(1)->addHours(2)->toDateTimeString()],
                'GM' => ['started_at' => now()->subDays(1)->addHours(3)->toDateTimeString(), 'completed_at' => now()->subDays(1)->addHours(6)->toDateTimeString()],
                'BV' => ['started_at' => now()->subHours(2)->toDateTimeString(), 'completed_at' => null],
                'Etsa' => ['started_at' => null, 'completed_at' => null],
            ],
            'used_scrap_rak' => 'Rak B03',
            'gudang_released_at' => now()->subDays(2)->addHours(1),
        ]);

        // 6. Order SPO Sample 6: Pengerjaan di Divisi Etsa (Sandblast)
        $order6 = Order::create([
            'order_date' => now()->subDays(2)->toDateString(),
            'spo_number' => 'SPO-0133',
            'customer_name' => 'Bapak Hendra (Ruko Paskal)',
            'customer_phone' => '0818-4455-6677',
            'customer_address' => 'Ruko Paskal Hyper Square B-12, Bandung',
            'glass_type' => 'Kaca Bening 10 mm Etsa Sandblast Custom',
            'length_cm' => 200.0,
            'width_cm' => 100.0,
            'thickness_mm' => 10,
            'processes' => ['HT', 'GM', 'Etsa'],
            'accessories' => [
                ['name' => 'Lem pcs', 'price' => 35000, 'qty' => 2]
            ],
            'items' => [
                [
                    'glass_type' => 'Kaca Bening 10 mm Etsa Sandblast Custom',
                    'length_cm' => 200.0,
                    'width_cm' => 100.0,
                    'thickness_mm' => 10,
                    'qty' => 1,
                    'processes' => ['HT', 'GM', 'Etsa'],
                    'etsa_length_cm' => 200,
                    'etsa_width_cm' => 50,
                    'subtotal' => 1750000
                ]
            ],
            'description' => 'Etsa bermotif garis horizontal 50 cm di tengah kaca.',
            'priority_status' => 'Prioritas',
            'deadline_date' => now()->addDays(1)->toDateString(),
            'subtotal' => 1750000,
            'priority_fee' => 150000,
            'custom_fee' => 50000,
            'total_price' => 2020000,
            'paid_amount' => 1000000,
            'payment_status' => 'DP (50%)',
            'status' => 'pengerjaan',
            'current_division' => 'divisi_etsa',
            'division_progress' => [
                'HT' => 'Selesai',
                'GM' => 'Selesai',
                'BV' => 'N/A',
                'Etsa' => 'Sedang Dikerjakan'
            ],
            'division_timestamps' => [
                'HT' => ['started_at' => now()->subDays(2)->addHours(2)->toDateTimeString(), 'completed_at' => now()->subDays(1)->addHours(4)->toDateTimeString()],
                'GM' => ['started_at' => now()->subDays(1)->addHours(5)->toDateTimeString(), 'completed_at' => now()->subHours(4)->toDateTimeString()],
                'BV' => ['started_at' => null, 'completed_at' => null],
                'Etsa' => ['started_at' => now()->subHours(3)->toDateTimeString(), 'completed_at' => null],
            ],
            'gudang_released_at' => now()->subDays(2)->addHours(2),
        ]);

        // 7. Order SPO Sample 7: Dalam Pengiriman Armada (Waybill Merah)
        $order7 = Order::create([
            'order_date' => now()->subDays(4)->toDateString(),
            'spo_number' => 'SPO-0134',
            'customer_name' => 'Hotel Grand Merdeka',
            'customer_phone' => '0812-7788-9900',
            'customer_address' => 'Jl. Merdeka No. 10, Bandung',
            'glass_type' => 'Kaca Tempered 12 mm Polos',
            'length_cm' => 240.0,
            'width_cm' => 180.0,
            'thickness_mm' => 12,
            'processes' => ['HT', 'GM', 'Bor'],
            'accessories' => [
                ['name' => 'Handle pintu stainless', 'price' => 300000, 'qty' => 2],
                ['name' => 'Aksesoris alumunium', 'price' => 150000, 'qty' => 1]
            ],
            'items' => [
                [
                    'glass_type' => 'Kaca Tempered 12 mm Polos',
                    'length_cm' => 240.0,
                    'width_cm' => 180.0,
                    'thickness_mm' => 12,
                    'qty' => 2,
                    'processes' => ['HT', 'GM', 'Bor'],
                    'subtotal' => 4500000
                ]
            ],
            'description' => 'Pintu utama ballroom hotel. Pengiriman cepat.',
            'priority_status' => 'Prioritas',
            'deadline_date' => now()->toDateString(),
            'subtotal' => 4500000,
            'priority_fee' => 150000,
            'custom_fee' => 100000,
            'total_price' => 5500000,
            'paid_amount' => 5500000,
            'payment_status' => 'Lunas',
            'status' => 'pengiriman',
            'current_division' => 'QC_Ready',
            'division_progress' => [
                'HT' => 'Selesai',
                'GM' => 'Selesai',
                'BV' => 'N/A',
                'Etsa' => 'N/A'
            ],
            'division_timestamps' => [
                'HT' => ['started_at' => now()->subDays(4)->addHours(1)->toDateTimeString(), 'completed_at' => now()->subDays(2)->addHours(3)->toDateTimeString()],
                'GM' => ['started_at' => now()->subDays(2)->addHours(4)->toDateTimeString(), 'completed_at' => now()->subDays(1)->addHours(5)->toDateTimeString()],
                'BV' => ['started_at' => null, 'completed_at' => null],
                'Etsa' => ['started_at' => null, 'completed_at' => null],
            ],
            'gudang_released_at' => now()->subDays(4)->addHours(1),
            'execution_completed_at' => now()->subDays(1)->addHours(5),
        ]);

        // 8. Order SPO Sample 8: Selesai Terkirim (Waybill Kuning)
        $order8 = Order::create([
            'order_date' => now()->subDays(7)->toDateString(),
            'spo_number' => 'SPO-0135',
            'customer_name' => 'Apt. Parahyangan Residences',
            'customer_phone' => '0813-1122-3344',
            'customer_address' => 'Jl. Ciumbuleuit No. 42 Tower B, Bandung',
            'glass_type' => 'Kaca Cermin 5 mm Bevel 2 cm',
            'length_cm' => 160.0,
            'width_cm' => 100.0,
            'thickness_mm' => 5,
            'processes' => ['HT', 'GM', 'BV'],
            'accessories' => [
                ['name' => 'Lem pcs', 'price' => 35000, 'qty' => 4]
            ],
            'items' => [
                [
                    'glass_type' => 'Kaca Cermin 5 mm Bevel 2 cm',
                    'length_cm' => 160.0,
                    'width_cm' => 100.0,
                    'thickness_mm' => 5,
                    'qty' => 2,
                    'processes' => ['HT', 'GM', 'BV'],
                    'subtotal' => 1800000
                ]
            ],
            'description' => 'Cermin hias dinding ruang keluarga unit 12A.',
            'priority_status' => 'Biasa',
            'deadline_date' => now()->subDays(1)->toDateString(),
            'subtotal' => 1800000,
            'priority_fee' => 0,
            'custom_fee' => 0,
            'total_price' => 1940000,
            'paid_amount' => 1940000,
            'payment_status' => 'Lunas',
            'status' => 'selesai',
            'current_division' => 'QC_Ready',
            'division_progress' => [
                'HT' => 'Selesai',
                'GM' => 'Selesai',
                'BV' => 'Selesai',
                'Etsa' => 'N/A'
            ],
            'division_timestamps' => [
                'HT' => ['started_at' => now()->subDays(7)->addHours(2)->toDateTimeString(), 'completed_at' => now()->subDays(5)->addHours(1)->toDateTimeString()],
                'GM' => ['started_at' => now()->subDays(5)->addHours(2)->toDateTimeString(), 'completed_at' => now()->subDays(4)->addHours(3)->toDateTimeString()],
                'BV' => ['started_at' => now()->subDays(4)->addHours(4)->toDateTimeString(), 'completed_at' => now()->subDays(3)->addHours(6)->toDateTimeString()],
                'Etsa' => ['started_at' => null, 'completed_at' => null],
            ],
            'gudang_released_at' => now()->subDays(7)->addHours(2),
            'execution_completed_at' => now()->subDays(3)->addHours(6),
        ]);

        // 9. Order SPO Sample 9: Draft Baru (Admin Toko - Kaca Riben 6mm Canopy Ruko)
        $order9 = Order::create([
            'order_date' => now()->toDateString(),
            'spo_number' => 'SPO-0136',
            'customer_name' => 'Bapak Rudi Hartono',
            'customer_phone' => '0822-5566-7788',
            'customer_address' => 'Komp. Setiabudi Regency C-12, Bandung',
            'glass_type' => 'Kaca Riben 6 mm Dark',
            'length_cm' => 220.0,
            'width_cm' => 110.0,
            'thickness_mm' => 6,
            'processes' => ['HT', 'GM'],
            'accessories' => [
                ['name' => 'Aksesoris alumunium', 'price' => 85000, 'qty' => 4],
                ['name' => 'Lem pcs', 'price' => 35000, 'qty' => 2]
            ],
            'items' => [
                [
                    'glass_type' => 'Kaca Riben 6 mm Dark',
                    'length_cm' => 220.0,
                    'width_cm' => 110.0,
                    'thickness_mm' => 6,
                    'qty' => 3,
                    'processes' => ['HT', 'GM'],
                    'subtotal' => 2100000
                ]
            ],
            'description' => 'Kanopi ruko lantai 2, sudut coak R5.',
            'priority_status' => 'Biasa',
            'deadline_date' => now()->addDays(4)->toDateString(),
            'subtotal' => 2100000,
            'priority_fee' => 0,
            'custom_fee' => 0,
            'total_price' => 2510000,
            'paid_amount' => 0,
            'payment_status' => 'Belum Lunas',
            'status' => 'draft',
            'current_division' => 'admin_toko',
            'division_progress' => [
                'HT' => 'Belum',
                'GM' => 'Belum',
                'BV' => 'N/A',
                'Etsa' => 'N/A'
            ],
            'division_timestamps' => [
                'HT' => ['started_at' => null, 'completed_at' => null],
                'GM' => ['started_at' => null, 'completed_at' => null],
                'BV' => ['started_at' => null, 'completed_at' => null],
                'Etsa' => ['started_at' => null, 'completed_at' => null],
            ]
        ]);

        // 10. Order SPO Sample 10: Antrean Disposisi Admin Gudang (Kaca Tempered 10mm Pintu Sekat)
        $order10 = Order::create([
            'order_date' => now()->toDateString(),
            'spo_number' => 'SPO-0137',
            'customer_name' => 'Toko Kaca Sentosa',
            'customer_phone' => '0817-6677-8899',
            'customer_address' => 'Jl. Buah Batu No. 105, Bandung',
            'glass_type' => 'Kaca Tempered 10 mm Polos',
            'length_cm' => 210.0,
            'width_cm' => 90.0,
            'thickness_mm' => 10,
            'processes' => ['HT', 'GM', 'Bor'],
            'accessories' => [
                ['name' => 'Handle pintu stainless', 'price' => 220000, 'qty' => 1]
            ],
            'items' => [
                [
                    'glass_type' => 'Kaca Tempered 10 mm Polos',
                    'length_cm' => 210.0,
                    'width_cm' => 90.0,
                    'thickness_mm' => 10,
                    'qty' => 2,
                    'processes' => ['HT', 'GM', 'Bor'],
                    'subtotal' => 2400000
                ]
            ],
            'description' => 'Bor 2 lubang engkol pintu sekat kantor.',
            'priority_status' => 'Prioritas',
            'deadline_date' => now()->addDays(2)->toDateString(),
            'subtotal' => 2400000,
            'priority_fee' => 150000,
            'custom_fee' => 0,
            'total_price' => 2770000,
            'paid_amount' => 1400000,
            'payment_status' => 'DP (51%)',
            'status' => 'pengerjaan',
            'current_division' => 'admin_gudang',
            'division_progress' => [
                'HT' => 'Belum',
                'GM' => 'Belum',
                'BV' => 'N/A',
                'Etsa' => 'N/A'
            ],
            'division_timestamps' => [
                'HT' => ['started_at' => null, 'completed_at' => null],
                'GM' => ['started_at' => null, 'completed_at' => null],
                'BV' => ['started_at' => null, 'completed_at' => null],
                'Etsa' => ['started_at' => null, 'completed_at' => null],
            ],
            'gudang_released_at' => now(),
        ]);

        // 11. Order SPO Sample 11: QC Ready (Lolos QC Siap Kirim - Resto Seafood Paskal)
        $order11 = Order::create([
            'order_date' => now()->subDays(3)->toDateString(),
            'spo_number' => 'SPO-0138',
            'customer_name' => 'Resto Seafood Paskal',
            'customer_phone' => '0812-9900-1122',
            'customer_address' => 'Paskal Food Market Stand 45, Bandung',
            'glass_type' => 'Kaca Cermin 5 mm Bevel 3 cm (+ 1 item)',
            'length_cm' => 150.0,
            'width_cm' => 80.0,
            'thickness_mm' => 5,
            'processes' => ['HT', 'GM', 'BV'],
            'accessories' => [
                ['name' => 'Lem pcs', 'price' => 35000, 'qty' => 3]
            ],
            'items' => [
                [
                    'glass_type' => 'Kaca Cermin 5 mm Bevel 3 cm',
                    'length_cm' => 150.0,
                    'width_cm' => 80.0,
                    'thickness_mm' => 5,
                    'qty' => 2,
                    'processes' => ['HT', 'GM', 'BV'],
                    'subtotal' => 1600000
                ]
            ],
            'description' => 'Bevel 3 cm sekeliling, pengiriman sore ini.',
            'priority_status' => 'Prioritas',
            'deadline_date' => now()->toDateString(),
            'subtotal' => 1600000,
            'priority_fee' => 150000,
            'custom_fee' => 0,
            'total_price' => 1855000,
            'paid_amount' => 1855000,
            'payment_status' => 'Lunas',
            'status' => 'pengiriman',
            'current_division' => 'QC_Ready',
            'division_progress' => [
                'HT' => 'Selesai',
                'GM' => 'Selesai',
                'BV' => 'Selesai',
                'Etsa' => 'N/A'
            ],
            'division_timestamps' => [
                'HT' => ['started_at' => now()->subDays(3)->addHours(1)->toDateTimeString(), 'completed_at' => now()->subDays(2)->addHours(2)->toDateTimeString()],
                'GM' => ['started_at' => now()->subDays(2)->addHours(3)->toDateTimeString(), 'completed_at' => now()->subDays(1)->addHours(4)->toDateTimeString()],
                'BV' => ['started_at' => now()->subDays(1)->addHours(5)->toDateTimeString(), 'completed_at' => now()->subHours(2)->toDateTimeString()],
                'Etsa' => ['started_at' => null, 'completed_at' => null],
            ],
            'gudang_released_at' => now()->subDays(3)->addHours(1),
            'execution_completed_at' => now()->subHours(2),
        ]);


        // 2. Seed Scrap Glass (Stok Kaca Sisa di Rak Manufaktur)
        ScrapGlass::create([
            'scrap_code' => 'SCRAP-001',
            'glass_type' => 'Kaca Cermin 5mm Polos',
            'length_cm' => 30.0,
            'width_cm' => 40.0,
            'rak_location' => 'Rak A09',
            'status' => 'Layak Pakai'
        ]);

        ScrapGlass::create([
            'scrap_code' => 'SCRAP-002',
            'glass_type' => 'Kaca Cermin 5mm Polos',
            'length_cm' => 155.0,
            'width_cm' => 125.0,
            'rak_location' => 'Rak F7',
            'status' => 'Layak Pakai'
        ]);

        ScrapGlass::create([
            'scrap_code' => 'SCRAP-003',
            'glass_type' => 'Kaca Bening 8mm',
            'length_cm' => 80.0,
            'width_cm' => 60.0,
            'rak_location' => 'Rak B03',
            'status' => 'Layak Pakai'
        ]);

        ScrapGlass::create([
            'scrap_code' => 'SCRAP-004',
            'glass_type' => 'Kaca Tempered 10mm',
            'length_cm' => 120.0,
            'width_cm' => 90.0,
            'rak_location' => 'RAK-TEMPERED-01',
            'status' => 'Layak Pakai'
        ]);

        ScrapGlass::create([
            'scrap_code' => 'SCRAP-005',
            'glass_type' => 'Kaca Cermin Bronze 5mm',
            'length_cm' => 50.0,
            'width_cm' => 70.0,
            'rak_location' => 'Rak C02',
            'status' => 'Layak Pakai'
        ]);

        ScrapGlass::create([
            'scrap_code' => 'SCRAP-006',
            'glass_type' => 'Kaca Riben 6mm Dark',
            'length_cm' => 100.0,
            'width_cm' => 40.0,
            'rak_location' => 'Rak A01',
            'status' => 'Layak Pakai'
        ]);

        ScrapGlass::create([
            'scrap_code' => 'SCRAP-007',
            'glass_type' => 'Kaca Bening 12mm Polos',
            'length_cm' => 200.0,
            'width_cm' => 85.0,
            'rak_location' => 'Rak D05',
            'status' => 'Layak Pakai'
        ]);

        ScrapGlass::create([
            'scrap_code' => 'SCRAP-008',
            'glass_type' => 'Kaca Cermin Grey 5mm',
            'length_cm' => 95.0,
            'width_cm' => 45.0,
            'rak_location' => 'Rak E02',
            'status' => 'Layak Pakai'
        ]);


        // 3. Seed Deliveries (Surat Jalan 4 Warna Terhubung ke Order ID)
        // Surat Jalan 1: Untuk SPO-0129 (Ibu Ratna) - Selesai Terkirim (Lembar Putih)
        Delivery::create([
            'waybill_number' => 'SJ-2026-001',
            'order_id' => $order2->id,
            'driver_name' => 'Pak Budi (Supir DC)',
            'vehicle_plate' => 'Engkel Box (D 8472 AB)',
            'waybill_color' => 'Putih',
            'delivery_status' => 'Selesai Terkirim',
            'proof_photo_path' => 'proofs/sample_ttd.jpg'
        ]);

        // Surat Jalan 2: Untuk SPO-0134 (Hotel Grand Merdeka) - Dalam Pengiriman (Lembar Merah)
        Delivery::create([
            'waybill_number' => 'SJ-2026-002',
            'order_id' => $order7->id,
            'driver_name' => 'Pak Budi (Supir DC)',
            'vehicle_plate' => 'Pickup Grand Max (D 8129 CZ)',
            'waybill_color' => 'Merah',
            'delivery_status' => 'Dalam Pengiriman',
            'proof_photo_path' => null
        ]);

        // Surat Jalan 3: Untuk SPO-0135 (Apt. Parahyangan Residences) - Selesai Terkirim (Lembar Kuning)
        Delivery::create([
            'waybill_number' => 'SJ-2026-003',
            'order_id' => $order8->id,
            'driver_name' => 'Pak Budi (Supir DC)',
            'vehicle_plate' => 'Engkel Box (D 8472 AB)',
            'waybill_color' => 'Kuning',
            'delivery_status' => 'Selesai Terkirim',
            'proof_photo_path' => 'proofs/sample_ttd_parahyangan.jpg'
        ]);

        // Surat Jalan 4: Untuk SPO-0138 (Resto Seafood Paskal) - Dalam Pengiriman (Lembar Hijau)
        Delivery::create([
            'waybill_number' => 'SJ-2026-004',
            'order_id' => $order11->id,
            'driver_name' => 'Pak Agus (Supir Armadas)',
            'vehicle_plate' => 'Engkel Box (D 8472 AB)',
            'waybill_color' => 'Kuning',
            'delivery_status' => 'Dalam Pengiriman',
            'proof_photo_path' => null
        ]);
    }
}
