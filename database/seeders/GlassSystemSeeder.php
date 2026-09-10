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
        // Truncate tables for fresh clean dataset
        Delivery::query()->delete();
        Order::query()->delete();
        ScrapGlass::query()->delete();

        $customers = [
            ['name' => 'Pak Sidik', 'phone' => '0812-3456-7890', 'address' => 'Jl. Sunda No. 45, Sumur Bandung, Bandung'],
            ['name' => 'Ibu Ratna (Villa Dago)', 'phone' => '0813-9876-5432', 'address' => 'Jl. Dago Pakar No. 88, Cidadap, Bandung'],
            ['name' => 'PT Artha Buana Steel', 'phone' => '0811-2233-4455', 'address' => 'Jl. Asia Afrika No. 120, Lengkong, Bandung'],
            ['name' => 'Bpk. Hendra Wijaya', 'phone' => '0817-6543-2109', 'address' => 'Komplek Setiabudi Regency Blok C3 No. 12, Bandung'],
            ['name' => 'Toko Kaca Harapan Baru', 'phone' => '0818-0912-3456', 'address' => 'Jl. Ahmad Yani No. 340, Cibeunying Kidul, Bandung'],
            ['name' => 'CV Karya Utama Glass', 'phone' => '0812-9988-7766', 'address' => 'Jl. Soekarno Hatta No. 512, Buahbatu, Bandung'],
            ['name' => 'Hotel Merdeka Plaza', 'phone' => '0813-1122-3344', 'address' => 'Jl. Merdeka No. 15, Sumur Bandung, Bandung'],
            ['name' => 'Apt. Parahyangan Residences', 'phone' => '0815-4433-2211', 'address' => 'Jl. Ciumbuleuit No. 42 Unit 12B, Cidadap, Bandung'],
            ['name' => 'Resto Seafood Paskal', 'phone' => '0819-7766-5544', 'address' => 'Paskal Hyper Square Blok D-18, Andir, Bandung'],
            ['name' => 'Ibu Maya Melati', 'phone' => '0812-3344-5566', 'address' => 'Perumahan Batununggal Indah Blok 7 No. 9, Bandung'],
            ['name' => 'Arsitek Studio Archiluxe', 'phone' => '0816-9900-1122', 'address' => 'Jl. Ir. H. Juanda (Dago) No. 204, Coblong, Bandung'],
            ['name' => 'Bpk. Bambang Sukoco', 'phone' => '0813-8877-6655', 'address' => 'Jl. Terusan Pasirkoja No. 98, Astanaanyar, Bandung'],
            ['name' => 'Cafe & Lounge Skylight', 'phone' => '0818-5544-3322', 'address' => 'Jl. Riau (LLRE Martadinata) No. 76, Bandung Wetan'],
            ['name' => 'PT Mitra Konstruksi Utama', 'phone' => '0812-6677-8899', 'address' => 'Jl. Rajawali Barat No. 64, Andir, Bandung'],
            ['name' => 'Ibu Siska Lestarini', 'phone' => '0813-4455-6677', 'address' => 'Komplek Singgasana Pradana Blok G No. 14, Bandung'],
            ['name' => 'Bpk. Irwan Santoso', 'phone' => '0819-1122-3344', 'address' => 'Jl. Buah Batu No. 210, Lengkong, Bandung'],
            ['name' => 'Ruko Sentra Bisnis Surapati', 'phone' => '0811-3344-5566', 'address' => 'Jl. Surapati No. 155, Cibeunying Kaler, Bandung'],
            ['name' => 'PT Surya Mas Abadi', 'phone' => '0817-2233-4455', 'address' => 'Kawasan Industri Cimareme Blok B-4, Padalarang'],
            ['name' => 'Ibu Fitri Kurniati', 'phone' => '0818-6677-8899', 'address' => 'Jl. Gegerkalong Hilir No. 33, Sukasari, Bandung'],
            ['name' => 'Bpk. Teddy Kusuma', 'phone' => '0812-5544-3322', 'address' => 'Komplek Kopo Permai II Blok 18D No. 5, Margahayu'],
            ['name' => 'Klinik Utama Medika', 'phone' => '0813-7788-9900', 'address' => 'Jl. Pajajaran No. 89, Cicendo, Bandung'],
            ['name' => 'Bpk. Antonius Rahmat', 'phone' => '0815-2233-4455', 'address' => 'Jl. Gatot Subroto No. 177, Batununggal, Bandung'],
            ['name' => 'Ibu Dewi Sartika', 'phone' => '0816-8899-0011', 'address' => 'Komplek Margahayu Raya Blok J-2 No. 8, Buahbatu'],
            ['name' => 'PT Global Interior Indo', 'phone' => '0811-9900-1122', 'address' => 'Jl. Pasteur No. 48, Sukajadi, Bandung'],
            ['name' => 'Bpk. Roni Wijaya', 'phone' => '0817-4455-6677', 'address' => 'Jl. Jamika No. 112, Babakan Ciparay, Bandung'],
            ['name' => 'Apt. Gateway Ahmad Yani', 'phone' => '0818-3344-5566', 'address' => 'Jl. Jend. Ahmad Yani No. 669 Unit B-08, Cibeunying Kidul'],
            ['name' => 'Toko Aluminium Sejahtera', 'phone' => '0812-7788-9900', 'address' => 'Jl. Gardujati No. 52, Andir, Bandung'],
            ['name' => 'Bpk. Rudy Hermawan', 'phone' => '0813-2233-4455', 'address' => 'Komplek Mekar Wangi Jl. Mekar Utama No. 23, Bandung'],
            ['name' => 'Ibu Yenny Fransisca', 'phone' => '0819-8899-0011', 'address' => 'Jl. Proprogo No. 10, Bandung Wetan, Bandung'],
            ['name' => 'PT Prima Karya Bangun', 'phone' => '0811-5544-3322', 'address' => 'Jl. Caringin No. 205, Babakan Ciparay, Bandung'],
            ['name' => 'Bpk. Haryanto Tan', 'phone' => '0816-3344-5566', 'address' => 'Komplek Taman Kopo Indah III Blok F No. 17, Margaasih'],
            ['name' => 'Ibu Nita Anggraini', 'phone' => '0817-7788-9900', 'address' => 'Jl. Lengkong Kecil No. 28, Panyileukan, Bandung'],
            ['name' => 'Cafe Rustic Wood & Glass', 'phone' => '0818-1122-3344', 'address' => 'Jl. Progo No. 14, Bandung Wetan, Bandung'],
            ['name' => 'Bpk. Farhan Syahputra', 'phone' => '0812-4455-6677', 'address' => 'Komplek Arcamanik Endah Blok E No. 6, Arcamanik'],
            ['name' => 'PT Cahaya Interindo', 'phone' => '0813-6677-8899', 'address' => 'Jl. Moch. Toha No. 310, Bandung Selatan'],
            ['name' => 'Ibu Christine Nathalia', 'phone' => '0815-9900-1122', 'address' => 'Jl. Kiputih No. 18, Ciumbuleuit, Bandung'],
        ];

        $glassTypes = [
            ['type' => 'Kaca Cermin 5 mm polos', 'price_m2' => 380000, 'thick' => 5],
            ['type' => 'Kaca 8 mm Polos Tempered', 'price_m2' => 450000, 'thick' => 8],
            ['type' => 'Kaca 10 mm Polos Tempered', 'price_m2' => 580000, 'thick' => 10],
            ['type' => 'Kaca 12 mm Polos Tempered', 'price_m2' => 750000, 'thick' => 12],
            ['type' => 'Kaca Cermin Bevel Decorative 5 mm', 'price_m2' => 520000, 'thick' => 5],
            ['type' => 'Kaca Laminated 5+5 mm Bening', 'price_m2' => 850000, 'thick' => 10],
            ['type' => 'Kaca Riben 6 mm Dark Grey', 'price_m2' => 420000, 'thick' => 6],
            ['type' => 'Kaca Frosting/Etsa 8 mm Line', 'price_m2' => 620000, 'thick' => 8],
            ['type' => 'Kaca Cermin Bronze Decorative 5 mm', 'price_m2' => 590000, 'thick' => 5],
            ['type' => 'Kaca Cermin Grey Decorative 5 mm', 'price_m2' => 590000, 'thick' => 5],
        ];

        $drivers = [
            ['name' => 'Pak Budi (Supir Utama DC)', 'vehicle' => 'Engkel Box (D 8472 AB)'],
            ['name' => 'Pak Mulyadi (Driver Engkel)', 'vehicle' => 'Truck Engkel Long (D 8011 GH)'],
            ['name' => 'Pak Asep (Driver L300)', 'vehicle' => 'Pick Up L300 (D 8192 XY)'],
            ['name' => 'Pak Hendra (Driver Subcon)', 'vehicle' => 'Armada Subcon (B 9920 FK)'],
        ];

        $trips = [
            ['code' => 'TRIP-20260908-1001', 'driver' => 'Pak Budi (Supir Utama DC)', 'vehicle' => 'Engkel Box (D 8472 AB)'],
            ['code' => 'TRIP-20260908-1002', 'driver' => 'Pak Mulyadi (Driver Engkel)', 'vehicle' => 'Truck Engkel Long (D 8011 GH)'],
            ['code' => 'TRIP-20260909-2045', 'driver' => 'Pak Asep (Driver L300)', 'vehicle' => 'Pick Up L300 (D 8192 XY)'],
            ['code' => 'TRIP-20260909-3091', 'driver' => 'Pak Hendra (Driver Subcon)', 'vehicle' => 'Armada Subcon (B 9920 FK)'],
            ['code' => 'TRIP-20260910-4110', 'driver' => 'Pak Budi (Supir Utama DC)', 'vehicle' => 'Engkel Box (D 8472 AB)'],
        ];

        $statuses = [
            'draft', 'draft', 'draft', 'draft', 'draft',
            'pengerjaan', 'pengerjaan', 'pengerjaan', 'pengerjaan', 'pengerjaan', 'pengerjaan', 'pengerjaan', 'pengerjaan', 'pengerjaan', 'pengerjaan',
            'pengiriman', 'pengiriman', 'pengiriman', 'pengiriman', 'pengiriman', 'pengiriman', 'pengiriman', 'pengiriman', 'pengiriman', 'pengiriman', 'pengiriman', 'pengiriman',
            'selesai', 'selesai', 'selesai', 'selesai', 'selesai', 'selesai', 'selesai', 'selesai', 'selesai'
        ];

        $createdOrders = [];

        foreach ($customers as $index => $cust) {
            $spoNum = 'SPO-' . str_pad($index + 1, 4, '0', STR_PAD_LEFT);
            $status = $statuses[$index % count($statuses)];
            $glass = $glassTypes[$index % count($glassTypes)];

            $len = rand(120, 300);
            $wid = rand(80, 200);
            $qty = rand(1, 4);

            $areaM2 = ($len * $wid / 10000) * $qty;
            $subtotal = round($areaM2 * $glass['price_m2']);
            $priorityFee = ($index % 5 === 0) ? 150000 : 0;
            $customFee = ($index % 7 === 0) ? 75000 : 0;
            $totalPrice = $subtotal + $priorityFee + $customFee;

            $paidRatio = match($status) {
                'draft' => 0.0,
                'pengerjaan' => 0.5,
                'pengiriman' => ($index % 2 === 0 ? 0.5 : 1.0),
                'selesai' => 1.0,
            };

            $paidAmount = round($totalPrice * $paidRatio);
            $paymentStatus = match(true) {
                $paidRatio >= 1.0 => 'Lunas',
                $paidRatio > 0 => 'DP (50%)',
                default => 'Belum Lunas',
            };

            $procs = ['HT'];
            if ($index % 2 === 0) $procs[] = 'GM';
            if ($index % 3 === 0) $procs[] = 'BV';
            if ($index % 4 === 0) $procs[] = 'Etsa';

            $division = match($status) {
                'draft' => 'admin_toko',
                'pengerjaan' => 'divisi_' . strtolower($procs[count($procs) - 1]),
                'pengiriman' => 'pengiriman',
                'selesai' => 'selesai',
            };

            $assignedTrip = null;
            $assignedDriver = null;
            $assignedVehicle = null;

            if ($status === 'pengiriman' || $status === 'selesai') {
                $tripObj = $trips[$index % count($trips)];
                $assignedTrip = $tripObj['code'];
                $assignedDriver = $tripObj['driver'];
                $assignedVehicle = $tripObj['vehicle'];
            }

            $order = Order::create([
                'order_date' => now()->subDays(rand(1, 15))->toDateString(),
                'spo_number' => $spoNum,
                'customer_name' => $cust['name'],
                'customer_phone' => $cust['phone'],
                'customer_address' => $cust['address'],
                'glass_type' => $glass['type'],
                'length_cm' => $len,
                'width_cm' => $wid,
                'thickness_mm' => $glass['thick'],
                'processes' => $procs,
                'accessories' => [
                    ['name' => 'Lem Kaca Heavy Duty', 'price' => 35000, 'qty' => rand(1, 2)],
                    ['name' => 'Spigot Stainless/Bracket', 'price' => 75000, 'qty' => rand(1, 4)]
                ],
                'items' => [
                    [
                        'glass_type' => $glass['type'],
                        'length_cm' => $len,
                        'width_cm' => $wid,
                        'thickness_mm' => $glass['thick'],
                        'qty' => $qty,
                        'processes' => $procs,
                        'subtotal' => $subtotal
                    ]
                ],
                'description' => 'Pesanan proyek ' . $cust['name'] . '. Spesifikasi potongan presisi CNC.',
                'priority_status' => $priorityFee > 0 ? 'Prioritas' : 'Biasa',
                'deadline_date' => now()->addDays(rand(2, 7))->toDateString(),
                'subtotal' => $subtotal,
                'priority_fee' => $priorityFee,
                'custom_fee' => $customFee,
                'total_price' => $totalPrice,
                'paid_amount' => $paidAmount,
                'payment_status' => $paymentStatus,
                'status' => $status,
                'assigned_driver' => $assignedDriver,
                'assigned_vehicle' => $assignedVehicle,
                'trip_code' => $assignedTrip,
                'current_division' => $division,
                'division_progress' => [
                    'HT' => $status === 'draft' ? 'Belum' : 'Selesai',
                    'GM' => in_array('GM', $procs) ? ($status === 'selesai' || $status === 'pengiriman' ? 'Selesai' : 'Sedang Dikerjakan') : 'N/A',
                    'BV' => in_array('BV', $procs) ? ($status === 'selesai' || $status === 'pengiriman' ? 'Selesai' : 'Belum') : 'N/A',
                    'Etsa' => in_array('Etsa', $procs) ? ($status === 'selesai' || $status === 'pengiriman' ? 'Selesai' : 'Belum') : 'N/A',
                ],
                'used_scrap_rak' => 'Rak ' . chr(65 + ($index % 6)) . rand(1, 9),
                'gudang_released_at' => now()->subDays(rand(1, 10)),
                'shipped_at' => ($status === 'pengiriman' || $status === 'selesai') ? now()->subDays(rand(1, 3)) : null,
                'delivered_at' => ($status === 'selesai') ? now()->subDays(rand(0, 2)) : null,
            ]);

            $createdOrders[] = $order;

            // Generate Delivery records for pengiriman & selesai orders
            if ($status === 'pengiriman' || $status === 'selesai') {
                Delivery::create([
                    'waybill_number' => 'SJ-' . $spoNum,
                    'trip_code' => $assignedTrip,
                    'stop_order' => rand(1, 4),
                    'order_id' => $order->id,
                    'driver_name' => $assignedDriver,
                    'vehicle_plate' => $assignedVehicle,
                    'waybill_color' => $paymentStatus === 'Lunas' ? 'Putih' : 'Merah',
                    'delivery_status' => $status === 'selesai' ? 'Selesai Terkirim' : 'Dalam Pengiriman',
                    'proof_photo_path' => $status === 'selesai' ? 'proofs/ttd_sample.jpg' : null,
                    'notes' => 'Tolong serahkan lembar ' . ($paymentStatus === 'Lunas' ? 'Putih' : 'Merah COD') . ' ke customer.',
                ]);
            }
        }

        // 2. Seed Scrap Glasses (Stok Sisa Rak)
        $scraps = [
            ['code' => 'SCRAP-001', 'type' => 'Kaca Cermin Polos 5mm', 'len' => 110.0, 'wid' => 85.0, 'rak' => 'Rak F7'],
            ['code' => 'SCRAP-002', 'type' => 'Kaca Tempered 12mm', 'len' => 210.0, 'wid' => 95.0, 'rak' => 'Rak A03'],
            ['code' => 'SCRAP-003', 'type' => 'Kaca Laminated 5+5mm', 'len' => 150.0, 'wid' => 100.0, 'rak' => 'Rak B12'],
            ['code' => 'SCRAP-004', 'type' => 'Kaca Tempered 10mm', 'len' => 120.0, 'wid' => 90.0, 'rak' => 'RAK-TEMPERED-01'],
            ['code' => 'SCRAP-005', 'type' => 'Kaca Cermin Bronze 5mm', 'len' => 50.0, 'wid' => 70.0, 'rak' => 'Rak C02'],
            ['code' => 'SCRAP-006', 'type' => 'Kaca Riben 6mm Dark', 'len' => 100.0, 'wid' => 40.0, 'rak' => 'Rak A01'],
            ['code' => 'SCRAP-007', 'type' => 'Kaca Bening 12mm Polos', 'len' => 200.0, 'wid' => 85.0, 'rak' => 'Rak D05'],
            ['code' => 'SCRAP-008', 'type' => 'Kaca Cermin Grey 5mm', 'len' => 95.0, 'wid' => 45.0, 'rak' => 'Rak E02'],
            ['code' => 'SCRAP-009', 'type' => 'Kaca Frosting 8mm Line', 'len' => 140.0, 'wid' => 60.0, 'rak' => 'Rak E08'],
            ['code' => 'SCRAP-010', 'type' => 'Kaca Tempered 8mm Bening', 'len' => 180.0, 'wid' => 75.0, 'rak' => 'Rak F02'],
            ['code' => 'SCRAP-011', 'type' => 'Kaca Cermin Bevel 5mm', 'len' => 130.0, 'wid' => 80.0, 'rak' => 'Rak C05'],
            ['code' => 'SCRAP-012', 'type' => 'Kaca Bening 5mm Polos', 'len' => 160.0, 'wid' => 90.0, 'rak' => 'Rak A09'],
        ];

        foreach ($scraps as $sc) {
            ScrapGlass::create([
                'scrap_code' => $sc['code'],
                'glass_type' => $sc['type'],
                'length_cm' => $sc['len'],
                'width_cm' => $sc['wid'],
                'rak_location' => $sc['rak'],
                'status' => 'Layak Pakai',
            ]);
        }
    }
}
