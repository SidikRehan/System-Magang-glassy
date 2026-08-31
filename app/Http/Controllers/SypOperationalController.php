<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Order;
use App\Models\ScrapGlass;
use App\Models\Delivery;

class SypOperationalController extends Controller
{
    /**
     * Public Landing Page View with Glass Simulator & Cost Estimator
     */
    public function welcome()
    {
        return Inertia::render('Welcome', [
            'scrapCount' => ScrapGlass::where('status', 'Layak Pakai')->count(),
            'totalOrders' => Order::count(),
        ]);
    }

    /**
     * Syp Dashboard Utama
     */
    public function dashboard()
    {
        return Inertia::render('Dashboard', [
            'orders' => Order::latest()->get(),
            'scrapGlasses' => ScrapGlass::latest()->get(),
            'deliveries' => Delivery::with('order')->latest()->get(),
            'metrics' => [
                'totalOrders' => Order::count(),
                'inProcess' => Order::where('status', 'pengerjaan')->count(),
                'readyShip' => Order::where('status', 'pengiriman')->count(),
                'scrapCount' => ScrapGlass::count(),
                'totalRevenue' => Order::sum('total_price'),
                'pendingCOD' => Order::where('payment_status', '!=', 'Lunas')->sum('total_price'),
            ]
        ]);
    }

    /**
     * Store New Order (Admin Toko - Multi Item Kaca Specification)
     */
    public function storeOrder(Request $request)
    {
        $validated = $request->validate([
            'order_date' => 'nullable|date',
            'customer_name' => 'required|string',
            'customer_phone' => 'required|string',
            'customer_address' => 'required|string',
            'glass_type' => 'nullable|string',
            'length_cm' => 'nullable',
            'width_cm' => 'nullable',
            'thickness_mm' => 'nullable',
            'processes' => 'nullable|array',
            'items' => 'nullable|array',
            'accessories' => 'nullable|array',
            'description' => 'nullable|string',
            'sketch_photo' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'priority_status' => 'required|string',
            'priority_fee' => 'nullable|numeric',
            'custom_fee' => 'nullable|numeric',
            'deadline_date' => 'nullable|date',
            'used_scrap_rak' => 'nullable|string',
            'status' => 'nullable|string|in:draft,pengerjaan',
        ]);

        $targetStatus = $validated['status'] ?? 'pengerjaan';
        $isDraft = ($targetStatus === 'draft');

        $latestOrder = Order::orderBy('id', 'desc')->first();
        $nextId = $latestOrder ? ($latestOrder->id + 1) : 1;
        $spoNumber = 'SPO-' . str_pad($nextId, 4, '0', STR_PAD_LEFT);

        $rawItems = $request->input('items');
        $items = [];
        $subtotal = 0;

        if (is_array($rawItems) && count($rawItems) > 0) {
            foreach ($rawItems as $it) {
                $calc = $this->calculateItemPricing($it);
                $subtotal += $calc['subtotal'];
                $items[] = $calc;
            }
        } else {
            $defaultIt = [
                'glass_type' => $validated['glass_type'] ?? 'Kaca Cermin 5 mm polos',
                'length_cm' => $validated['length_cm'] ?? 150,
                'width_cm' => $validated['width_cm'] ?? 120,
                'thickness_mm' => $validated['thickness_mm'] ?? 5,
                'qty' => 1,
                'processes' => $validated['processes'] ?? ['HT']
            ];
            $calc = $this->calculateItemPricing($defaultIt);
            $subtotal = $calc['subtotal'];
            $items[] = $calc;
        }

        $priorityFee = $validated['priority_status'] === 'Prioritas' 
            ? (float) $request->input('priority_fee', 0) 
            : 0;

        $customFee = $request->filled('custom_fee') ? (float) $request->input('custom_fee') : 0;
        
        // Calculate dynamic accessory costs
        $accessoryFee = 0;
        $rawAccessories = $request->input('accessories', []);
        if (is_array($rawAccessories)) {
            foreach ($rawAccessories as $acc) {
                if (is_array($acc)) {
                    $accPrice = (float)($acc['price'] ?? 0);
                    $accQty = max(1, (int)($acc['qty'] ?? 1));
                    $accessoryFee += ($accPrice * $accQty);
                }
            }
        }

        $totalPrice = $subtotal + $accessoryFee + $priorityFee + $customFee;

        // Summary glass_type for primary view
        $primaryItem = $items[0];
        $summaryGlassType = count($items) > 1 
            ? $primaryItem['glass_type'] . ' (+ ' . (count($items) - 1) . ' item lainnya)'
            : $primaryItem['glass_type'];

        $sketchPath = null;
        if ($request->hasFile('sketch_photo')) {
            $sketchPath = $request->file('sketch_photo')->store('sketches', 'public');
        }

        // Handle flexible payment selection (Cash, Transfer, QRIS with Auto DP / Lunas)
        $paymentMethod = $request->input('payment_method', 'cash');
        $rawPaid = $request->input('custom_paid_amount', $request->input('paid_amount', null));

        if ($isDraft) {
            $paidAmount = (float)($rawPaid ?? 0);
            $paymentStatus = 'Belum Lunas';
        } else {
            $paidAmount = $request->filled('custom_paid_amount') ? (float)$rawPaid : round(($totalPrice * (float)$request->input('dp_percent', 50)) / 100);
            if ($paidAmount >= $totalPrice && $totalPrice > 0) {
                $paidAmount = $totalPrice;
                $paymentStatus = 'Lunas';
            } else if ($paidAmount > 0) {
                $calcPct = round(($paidAmount / max(1, $totalPrice)) * 100);
                $paymentStatus = 'DP (' . $calcPct . '%)';
            } else {
                $paymentStatus = 'Belum Lunas';
            }
        }

        $order = Order::create([
            'order_date' => $validated['order_date'] ?? now()->toDateString(),
            'spo_number' => $spoNumber,
            'customer_name' => $validated['customer_name'],
            'customer_phone' => $validated['customer_phone'],
            'customer_address' => $validated['customer_address'],
            'glass_type' => $summaryGlassType,
            'length_cm' => $primaryItem['length_cm'],
            'width_cm' => $primaryItem['width_cm'],
            'thickness_mm' => $primaryItem['thickness_mm'],
            'processes' => $primaryItem['processes'],
            'accessories' => $validated['accessories'] ?? [],
            'items' => $items,
            'description' => $validated['description'] ?? null,
            'sketch_photo_path' => $sketchPath,
            'priority_status' => $validated['priority_status'],
            'deadline_date' => $validated['deadline_date'] ?? now()->addDays(3)->toDateString(),
            'subtotal' => $subtotal,
            'priority_fee' => $priorityFee,
            'custom_fee' => $customFee,
            'total_price' => $totalPrice,
            'paid_amount' => $paidAmount,
            'payment_status' => $paymentStatus,
            'status' => $targetStatus,
            'current_division' => $isDraft ? 'admin_toko' : 'admin_gudang',
            'division_progress' => [
                'HT' => $isDraft ? 'N/A' : 'Menunggu Dispatch',
                'GM' => 'Belum',
                'BV' => 'N/A',
                'Etsa' => 'N/A'
            ],
            'used_scrap_rak' => $validated['used_scrap_rak'] ?? null,
        ]);

        $message = $isDraft 
            ? 'Draft Order #' . $spoNumber . ' Berhasil Disimpan!' 
            : 'SPO Orderan Baru #' . $spoNumber . ' (' . $paymentStatus . ') Berhasil Diterbitkan ke Admin Gudang!';

        return redirect()->back()->with('message', $message);
    }

    /**
     * Update Draft / Active Order (Admin Toko - Multi Item Kaca Edit & Flexible Payment)
     */
    public function updateOrder(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'order_date' => 'nullable|date',
            'customer_name' => 'required|string',
            'customer_phone' => 'required|string',
            'customer_address' => 'required|string',
            'glass_type' => 'nullable|string',
            'length_cm' => 'nullable',
            'width_cm' => 'nullable',
            'thickness_mm' => 'nullable',
            'processes' => 'nullable|array',
            'items' => 'nullable|array',
            'accessories' => 'nullable|array',
            'description' => 'nullable|string',
            'sketch_photo' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'priority_status' => 'required|string',
            'priority_fee' => 'nullable|numeric',
            'custom_fee' => 'nullable|numeric',
            'deadline_date' => 'nullable|date',
            'used_scrap_rak' => 'nullable|string',
            'status' => 'nullable|string|in:draft,pengerjaan',
            'payment_option' => 'nullable|string',
            'dp_percent' => 'nullable|numeric',
            'custom_paid_amount' => 'nullable|numeric',
        ]);

        $rawItems = $request->input('items');
        $items = [];
        $subtotal = 0;

        if (is_array($rawItems) && count($rawItems) > 0) {
            foreach ($rawItems as $it) {
                $calc = $this->calculateItemPricing($it);
                $subtotal += $calc['subtotal'];
                $items[] = $calc;
            }
        } else {
            $defaultIt = [
                'glass_type' => $validated['glass_type'] ?? 'Kaca Cermin 5 mm polos',
                'length_cm' => $validated['length_cm'] ?? 150,
                'width_cm' => $validated['width_cm'] ?? 120,
                'thickness_mm' => $validated['thickness_mm'] ?? 5,
                'qty' => 1,
                'processes' => $validated['processes'] ?? ['HT']
            ];
            $calc = $this->calculateItemPricing($defaultIt);
            $subtotal = $calc['subtotal'];
            $items[] = $calc;
        }

        $priorityFee = $validated['priority_status'] === 'Prioritas' 
            ? (float) $request->input('priority_fee', 0) 
            : 0;

        $customFee = $request->filled('custom_fee') ? (float) $request->input('custom_fee') : 0;

        // Calculate dynamic accessory costs
        $accessoryFee = 0;
        $rawAccessories = $request->input('accessories', []);
        if (is_array($rawAccessories)) {
            foreach ($rawAccessories as $acc) {
                if (is_array($acc)) {
                    $accPrice = (float)($acc['price'] ?? 0);
                    $accQty = max(1, (int)($acc['qty'] ?? 1));
                    $accessoryFee += ($accPrice * $accQty);
                }
            }
        }

        $totalPrice = $subtotal + $accessoryFee + $priorityFee + $customFee;

        $primaryItem = $items[0];
        $summaryGlassType = count($items) > 1 
            ? $primaryItem['glass_type'] . ' (+ ' . (count($items) - 1) . ' item lainnya)'
            : $primaryItem['glass_type'];

        if ($request->hasFile('sketch_photo')) {
            $order->sketch_photo_path = $request->file('sketch_photo')->store('sketches', 'public');
        }

        $targetStatus = $request->input('status', $order->status);
        $isPromoted = ($order->status === 'draft' && $targetStatus === 'pengerjaan');

        $paymentOption = $request->input('payment_option', 'dp');
        $dpPercent = (float)$request->input('dp_percent', 50);

        $order->order_date = $validated['order_date'] ?? $order->order_date;
        $order->customer_name = $validated['customer_name'];
        $order->customer_phone = $validated['customer_phone'];
        $order->customer_address = $validated['customer_address'];
        $order->glass_type = $summaryGlassType;
        $order->length_cm = $primaryItem['length_cm'];
        $order->width_cm = $primaryItem['width_cm'];
        $order->thickness_mm = $primaryItem['thickness_mm'];
        $order->processes = $primaryItem['processes'];
        $order->accessories = $validated['accessories'] ?? [];
        $order->items = $items;
        $order->description = $validated['description'] ?? null;
        $order->priority_status = $validated['priority_status'];
        $order->deadline_date = $validated['deadline_date'] ?? $order->deadline_date;
        $order->subtotal = $subtotal;
        $order->priority_fee = $priorityFee;
        $order->custom_fee = $customFee;
        $order->total_price = $totalPrice;

        if ($isPromoted || $targetStatus === 'pengerjaan') {
            $order->status = 'pengerjaan';
            $rawPaid = $request->input('custom_paid_amount', $request->input('paid_amount', null));
            $paidAmount = $request->filled('custom_paid_amount') ? (float)$rawPaid : round(($totalPrice * (float)$request->input('dp_percent', 50)) / 100);

            if ($paidAmount >= $totalPrice && $totalPrice > 0) {
                $order->paid_amount = $totalPrice;
                $order->payment_status = 'Lunas';
            } else if ($paidAmount > 0) {
                $order->paid_amount = $paidAmount;
                $calcPct = round(($paidAmount / max(1, $totalPrice)) * 100);
                $order->payment_status = 'DP (' . $calcPct . '%)';
            } else {
                $order->paid_amount = 0;
                $order->payment_status = 'Belum Lunas';
            }

            if ($isPromoted) {
                $order->current_division = 'admin_gudang';
                $order->division_progress = [
                    'HT' => 'Menunggu Dispatch',
                    'GM' => 'Belum',
                    'BV' => 'N/A',
                    'Etsa' => 'N/A'
                ];
            }
        } else if ($order->status === 'draft') {
            $order->paid_amount = $request->filled('custom_paid_amount') ? (float)$request->input('custom_paid_amount') : 0;
            $order->payment_status = 'Belum Lunas';
        }

        $order->save();

        $message = $isPromoted 
            ? 'Draf Order #' . $order->spo_number . ' Berhasil Didealkan & Diterbitkan ke Admin Gudang!' 
            : 'Perubahan Draf Order #' . $order->spo_number . ' Berhasil Diperbarui!';

        return redirect()->back()->with('message', $message);
    }

    /**
     * Promote Draft Order to Pengerjaan (Admin Toko / Sales)
     */
    public function promoteDraftToPengerjaan(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        
        $paymentOption = $request->input('payment_option', 'dp');
        $dpPercent = (float)$request->input('dp_percent', 50);
        $totalPrice = (float)$order->total_price;

        if ($paymentOption === 'lunas') {
            $paidAmount = $totalPrice;
            $paymentStatus = 'Lunas';
        } else {
            if ($paymentOption === 'custom' && $request->filled('custom_paid_amount') && (float)$request->input('custom_paid_amount') > 0) {
                $paidAmount = (float)$request->input('custom_paid_amount');
                $calcPct = round(($paidAmount / max(1, $totalPrice)) * 100);
                $paymentStatus = 'DP (' . $calcPct . '%)';
            } else {
                $paidAmount = round(($totalPrice * $dpPercent) / 100);
                $paymentStatus = 'DP (' . round($dpPercent) . '%)';
            }
        }

        $order->status = 'pengerjaan';
        $order->payment_status = $paymentStatus;
        $order->paid_amount = $paidAmount;
        $order->current_division = 'admin_gudang';
        $order->division_progress = array_merge((array)$order->division_progress, [
            'HT' => 'Menunggu Dispatch Admin Gudang'
        ]);
        $order->save();

        return redirect()->back()->with('message', 'Order Draft #' . $order->spo_number . ' Berhasil Deal (' . $paymentStatus . ') & Dikirim ke Admin Gudang!');
    }

    /**
     * Dispatch Order to Division (Admin Gudang / Kepala Produksi)
     */
    public function dispatchOrderToDivision(Request $request, $id)
    {
        $validated = $request->validate([
            'target_division' => 'required|string', // e.g. divisi_ht, divisi_gm, divisi_bv, divisi_etsa
        ]);

        $order = Order::findOrFail($id);
        $targetDiv = $validated['target_division'];
        $order->current_division = $targetDiv;
        
        $divNameKey = strtoupper(str_replace('divisi_', '', $targetDiv));
        $progress = (array) ($order->division_progress ?? []);
        $progress[$divNameKey] = 'Sedang Dikerjakan';

        $order->division_progress = $progress;
        $order->save();

        return redirect()->back()->with('message', 'Order #' . $order->spo_number . ' Berhasil Dikirim ke ' . strtoupper(str_replace('_', ' ', $targetDiv)) . '!');
    }

    /**
     * Store Scrap Glass (Divisi HT)
     */
    public function storeScrap(Request $request)
    {
        $validated = $request->validate([
            'glass_type' => 'required|string',
            'length_cm' => 'required|numeric',
            'width_cm' => 'required|numeric',
            'rak_location' => 'required|string',
        ]);

        $code = 'SCRAP-00' . (ScrapGlass::count() + 1);

        ScrapGlass::create([
            'scrap_code' => $code,
            'glass_type' => $validated['glass_type'],
            'length_cm' => $validated['length_cm'],
            'width_cm' => $validated['width_cm'],
            'rak_location' => $validated['rak_location'],
            'status' => 'Layak Pakai',
        ]);

        return redirect()->back()->with('message', 'Kaca Sisa ' . $code . ' Berhasil Disimpan di ' . $validated['rak_location']);
    }

    /**
     * Submit Revision
     */
    public function submitRevision(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        $order->revision_notes = $request->input('notes', 'Revisi ukuran & spesifikasi dari Admin Toko.');
        $order->save();

        return redirect()->back()->with('message', 'Revisi Order ' . $order->spo_number . ' Berhasil Dikirim ke Divisi!');
    }

    /**
     * Start Working on Division Job (Menunggu -> Sedang Dikerjakan)
     */
    public function startDivisionJob(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        $userRole = auth()->user()->role ?? '';

        if ($userRole !== $order->current_division && $userRole !== 'admin_gudang' && $userRole !== 'owner') {
            return redirect()->back()->with('message', '⚠️ Akses Ditolak: Anda hanya memiliki izin untuk memulai pengerjaan pada divisi Anda sendiri!');
        }

        $currentDiv = $order->current_division;
        $currentDivKey = strtoupper(str_replace('divisi_', '', $currentDiv));
        $progress = (array) ($order->division_progress ?? []);
        if ($currentDivKey) {
            $progress[$currentDivKey] = 'Sedang Dikerjakan';
        }

        $order->division_progress = $progress;
        $order->save();

        return redirect()->back()->with('message', 'Order #' . $order->spo_number . ' Berhasil Dimulai! Status saat ini: Sedang Dikerjakan di Divisi ' . $currentDivKey);
    }

    /**
     * Complete Division Work or Transfer to Next Division
     */
    public function finishDivisionJob(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        $userRole = auth()->user()->role ?? '';

        // Strict Authorization: Only assigned division staff, admin_gudang, or owner can execute
        if ($userRole !== $order->current_division && $userRole !== 'admin_gudang' && $userRole !== 'owner') {
            return redirect()->back()->with('message', '⚠️ Akses Ditolak: Anda hanya memiliki izin untuk mengeksekusi pekerjaan pada divisi Anda sendiri!');
        }

        $currentDiv = $order->current_division;
        $nextDiv = $request->input('next_division', 'QC_Ready');

        $currentDivKey = strtoupper(str_replace('divisi_', '', $currentDiv));
        $progress = (array) ($order->division_progress ?? []);
        if ($currentDivKey) {
            $progress[$currentDivKey] = 'Selesai';
        }

        if ($nextDiv === 'QC_Ready' || $nextDiv === 'pengiriman') {
            $order->status = 'pengiriman';
            $order->current_division = 'QC_Ready';
            $order->division_progress = $progress;
            $order->save();
            $msg = 'Pekerjaan Divisi untuk #' . $order->spo_number . ' Selesai & Lolos QC! Siap Dikirim ke Driver.';
        } else {
            $nextDivKey = strtoupper(str_replace('divisi_', '', $nextDiv));
            $progress[$nextDivKey] = 'Sedang Dikerjakan';
            $order->status = 'pengerjaan';
            $order->current_division = $nextDiv;
            $order->division_progress = $progress;
            $order->save();

            $nextDivLabel = strtoupper(str_replace('_', ' ', $nextDiv));
            $msg = 'Pekerjaan #' . $order->spo_number . ' Selesai di ' . $currentDivKey . ' & Berhasil Diteruskan ke ' . $nextDivLabel . '!';
        }

        return redirect()->back()->with('message', $msg);
    }

    /**
     * Calculate Item Glass & Process Option Pricing
     */
    private function calculateItemPricing(array $it): array
    {
        $lRaw = str_replace(',', '.', (string)($it['length_cm'] ?? 100));
        $wRaw = str_replace(',', '.', (string)($it['width_cm'] ?? 100));
        $l = (float)$lRaw;
        $w = (float)$wRaw;

        $gt = $it['glass_type'] ?? 'Kaca Cermin 5 mm polos';
        
        // Auto extract thickness from glass_type if present (e.g. 5, 8, 12)
        $t = 5;
        if (preg_match('/(\d+)\s*(?:mm|mili)/i', $gt, $matches)) {
            $t = (int)$matches[1];
        } elseif (isset($it['thickness_mm']) && (int)$it['thickness_mm'] > 0) {
            $t = (int)$it['thickness_mm'];
        }

        $q = max(1, (int)($it['qty'] ?? 1));
        $procs = is_array($it['processes'] ?? null) ? $it['processes'] : ['HT'];

        // 1. Luas & Keliling
        $areaM2 = ($l * $w) / 10000;
        $perimeterM = (2 * ($l + $w)) / 100;

        // 2. Harga Dasar Kaca (per m2)
        $baseGlassPrice = max(250000, round($areaM2 * 500000)) * $q;

        // 3. Biaya GM (Gosok Mesin): Rp 10.000 / meter keliling
        $feeGM = in_array('GM', $procs) ? round($perimeterM * 10000) * $q : 0;

        // 4. Biaya HT (Gosok HT): Rp 1.000 / meter keliling
        $feeHT = in_array('HT', $procs) ? round($perimeterM * 1000) * $q : 0;

        // 5. Biaya BV (Beveling): Rp 15.000/m keliling + Lebar Bevel cm * Rp 10.000
        $bevelWidthCm = (float)str_replace(',', '.', (string)($it['bevel_width_cm'] ?? 1));
        $feeBV = in_array('BV', $procs) ? round(($perimeterM * 15000) + ($bevelWidthCm * 10000)) * $q : 0;

        // 6. Biaya Bor (Coakan): Keliling ruas lubang cm * Rp 2.500 * jumlah lubang
        $holeLCm = (float)str_replace(',', '.', (string)($it['hole_length_cm'] ?? 2));
        $holeWCm = (float)str_replace(',', '.', (string)($it['hole_width_cm'] ?? 2));
        $holeQty = max(1, (int)($it['hole_qty'] ?? 1));
        $holeRuasCm = 2 * ($holeLCm + $holeWCm);
        $feeBor = in_array('Bor', $procs) ? round($holeRuasCm * 2500) * $holeQty * $q : 0;

        // 7. Biaya Etsa (Sandblast): Langsung dihitung dari Luas Area Etsa (m2)
        $etsaLCm = (float)str_replace(',', '.', (string)($it['etsa_length_cm'] ?? $l));
        $etsaWCm = (float)str_replace(',', '.', (string)($it['etsa_width_cm'] ?? $w));
        $etsaQty = max(1, (int)($it['etsa_qty'] ?? 1));
        $etsaAreaM2 = ($etsaLCm * $etsaWCm) / 10000;

        $feeEtsa = 0;
        if (in_array('Etsa', $procs)) {
            $feeEtsa = round($etsaAreaM2 * $etsaQty * 50000) * $q;
            // Batas minimum biaya etsa Rp 25.000 per unit
            $feeEtsa = max(25000 * $q, $feeEtsa);
        }

        // Total Item Subtotal
        $itemSubtotal = $baseGlassPrice + $feeGM + $feeHT + $feeBV + $feeBor + $feeEtsa;

        return [
            'glass_type' => $gt,
            'length_cm' => $l,
            'width_cm' => $w,
            'thickness_mm' => $t,
            'qty' => $q,
            'processes' => $procs,
            'bevel_width_cm' => $bevelWidthCm,
            'hole_length_cm' => $holeLCm,
            'hole_width_cm' => $holeWCm,
            'hole_qty' => $holeQty,
            'etsa_length_cm' => $etsaLCm,
            'etsa_width_cm' => $etsaWCm,
            'etsa_qty' => $etsaQty,
            'etsa_area_m2' => $etsaAreaM2,
            'base_glass_price' => $baseGlassPrice,
            'fee_gm' => $feeGM,
            'fee_ht' => $feeHT,
            'fee_bv' => $feeBV,
            'fee_bor' => $feeBor,
            'fee_etsa' => $feeEtsa,
            'subtotal' => $itemSubtotal
        ];
    }
}
