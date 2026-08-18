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
        // Seed Order SPO Sample (PRD Alur Multi-Item)
        $order1 = Order::create([
            'order_date' => now()->toDateString(),
            'spo_number' => 'SPO-0128',
            'customer_name' => 'Pak Sidik',
            'customer_phone' => '0812-3456-7890',
            'customer_address' => 'Jl. Sunda No. 45, Bandung',
            'glass_type' => 'Kaca Cermin 5 mm polos',
            'length_cm' => 150.5,
            'width_cm' => 120.0,
            'thickness_mm' => 5,
            'processes' => ['HT', 'GM', 'BV'],
            'accessories' => ['Aksesoris alumunium', 'Lem pcs'],
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
            'deadline_date' => '2026-08-15',
            'subtotal' => 950000,
            'priority_fee' => 0,
            'custom_fee' => 0,
            'total_price' => 950000,
            'paid_amount' => 500000,
            'payment_status' => 'DP (50%)',
            'status' => 'pengerjaan',
            'current_division' => 'divisi_gm',
            'division_progress' => [
                'HT' => 'Selesai',
                'GM' => 'Sedang Dikerjakan',
                'BV' => 'Belum',
                'Etsa' => 'N/A'
            ],
            'used_scrap_rak' => 'F7'
        ]);

        $order2 = Order::create([
            'order_date' => now()->toDateString(),
            'spo_number' => 'SPO-0129',
            'customer_name' => 'Ibu Ratna (Villa Dago)',
            'customer_phone' => '0813-9876-5432',
            'customer_address' => 'Jl. Dago Pakar No. 88, Bandung',
            'glass_type' => 'Kaca 12 mm Polos Tempered',
            'length_cm' => 300.0,
            'width_cm' => 200.0,
            'thickness_mm' => 12,
            'processes' => ['HT', 'GM', 'Bor'],
            'accessories' => ['Handle pintu', 'Lem pcs'],
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
            'deadline_date' => '2026-08-12',
            'subtotal' => 2800000,
            'priority_fee' => 150000,
            'custom_fee' => 0,
            'total_price' => 2950000,
            'paid_amount' => 2950000,
            'payment_status' => 'Lunas',
            'status' => 'pengiriman',
            'current_division' => 'QC_Ready',
            'division_progress' => [
                'HT' => 'Selesai',
                'GM' => 'Selesai',
                'BV' => 'N/A',
                'Etsa' => 'N/A'
            ]
        ]);

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
            'accessories' => ['Tambahan proses'],
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
            'deadline_date' => '2026-08-18',
            'subtotal' => 1450000,
            'priority_fee' => 0,
            'custom_fee' => 50000,
            'total_price' => 1500000,
            'paid_amount' => 0,
            'payment_status' => 'Belum Lunas',
            'status' => 'draft',
            'current_division' => 'admin_toko',
            'division_progress' => [
                'HT' => 'Belum',
                'GM' => 'N/A',
                'BV' => 'Belum',
                'Etsa' => 'N/A'
            ]
        ]);

        // Seed Scrap Glass
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

        // Seed Delivery
        Delivery::create([
            'waybill_number' => 'SJ-2026-001',
            'order_id' => $order2->id,
            'driver_name' => 'Pak Budi (Supir DC)',
            'vehicle_plate' => 'Engkel Box (D 8472 AB)',
            'waybill_color' => 'Putih',
            'delivery_status' => 'Selesai Terkirim',
            'proof_photo_path' => 'proofs/sample_ttd.jpg'
        ]);
    }
}
