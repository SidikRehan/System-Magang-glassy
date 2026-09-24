<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Supply;
use App\Models\Tool;
use Illuminate\Support\Facades\DB;

class SparepartSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $spareparts = [
            [
                'item_code' => 'PLK-010',
                'name' => 'Mata Bor Kaca Diamond Drill Bit 10mm',
                'category' => 'Sparepart & Komponen Mesin',
                'qty' => 12,
                'unit' => 'Pcs',
                'min_stock' => 4,
                'status' => 'Aman',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'item_code' => 'PLK-011',
                'name' => 'Mata Bor Kaca Diamond Drill Bit 12mm Heavy Duty',
                'category' => 'Sparepart & Komponen Mesin',
                'qty' => 8,
                'unit' => 'Pcs',
                'min_stock' => 3,
                'status' => 'Aman',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'item_code' => 'PLK-012',
                'name' => 'Carbon Brush Motor Elektrik Mesin Polisher',
                'category' => 'Sparepart & Komponen Mesin',
                'qty' => 15,
                'unit' => 'Set',
                'min_stock' => 5,
                'status' => 'Aman',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'item_code' => 'PLK-013',
                'name' => 'Diamond Wheel Roda Intan Mesin Bevel & GM',
                'category' => 'Sparepart & Komponen Mesin',
                'qty' => 5,
                'unit' => 'Pcs',
                'min_stock' => 2,
                'status' => 'Aman',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'item_code' => 'PLK-014',
                'name' => 'Pad Polishing Felt Wool Roda Pemoles Cerium Oxide',
                'category' => 'Sparepart & Komponen Mesin',
                'qty' => 10,
                'unit' => 'Pcs',
                'min_stock' => 3,
                'status' => 'Aman',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'item_code' => 'PLK-015',
                'name' => 'Selang Pendingin Water Cooling & Nozzle Spray Mesin Bor',
                'category' => 'Sparepart & Komponen Mesin',
                'qty' => 6,
                'unit' => 'Set',
                'min_stock' => 2,
                'status' => 'Aman',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'item_code' => 'PLK-016',
                'name' => 'V-Belt Sabuk Transmisi Mesin Beveling & Edging',
                'category' => 'Sparepart & Komponen Mesin',
                'qty' => 4,
                'unit' => 'Pcs',
                'min_stock' => 2,
                'status' => 'Aman',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'item_code' => 'PLK-017',
                'name' => 'Bearing High-Speed Roda Table Potong Kaca Automatic',
                'category' => 'Sparepart & Komponen Mesin',
                'qty' => 20,
                'unit' => 'Pcs',
                'min_stock' => 5,
                'status' => 'Aman',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'item_code' => 'PLK-018',
                'name' => 'Pisau Potong Tungsten Carbide Mesin Auto-Cutter',
                'category' => 'Sparepart & Komponen Mesin',
                'qty' => 10,
                'unit' => 'Pcs',
                'min_stock' => 3,
                'status' => 'Aman',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'item_code' => 'PLK-019',
                'name' => 'Seal Kit O-Ring & Packing Hidrolik Mesin Lifter Kaca',
                'category' => 'Sparepart & Komponen Mesin',
                'qty' => 3,
                'unit' => 'Set',
                'min_stock' => 2,
                'status' => 'Aman',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'item_code' => 'PLK-020',
                'name' => 'Filter Udara & Filter Oli Mesin Kompresor Angin Workshop',
                'category' => 'Sparepart & Komponen Mesin',
                'qty' => 4,
                'unit' => 'Set',
                'min_stock' => 2,
                'status' => 'Aman',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        foreach ($spareparts as $item) {
            Supply::updateOrCreate(
                ['item_code' => $item['item_code']],
                $item
            );
        }

        // Additional machine tools in tools table
        $machineTools = [
            [
                'tool_code' => 'ALT-006',
                'name' => 'Mesin Potong Kaca Automatic Glass Cutting Table CNC',
                'category' => 'Mesin Utama Pabrik',
                'condition' => 'Baik',
                'location' => 'Area HT / Cutting Table',
                'total_qty' => 2,
                'available_qty' => 2,
                'notes' => 'Mesin potong otomatis presisi tinggi',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'tool_code' => 'ALT-007',
                'name' => 'Mesin Bevel Kaca Straight-Line Edging Machine 9 Spindle',
                'category' => 'Mesin Utama Pabrik',
                'condition' => 'Baik',
                'location' => 'Area Beveling & GM',
                'total_qty' => 1,
                'available_qty' => 1,
                'notes' => 'Mesin gosok bevel & polis pinggir',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'tool_code' => 'ALT-008',
                'name' => 'Mesin Wash & Dry Cuci Kaca Industrial Horizontal',
                'category' => 'Mesin Utama Pabrik',
                'condition' => 'Baik',
                'location' => 'Area Washing & Packing',
                'total_qty' => 1,
                'available_qty' => 1,
                'notes' => 'Mesin pencuci & pengering lembaran kaca',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        foreach ($machineTools as $tool) {
            Tool::updateOrCreate(
                ['tool_code' => $tool['tool_code']],
                $tool
            );
        }
    }
}
