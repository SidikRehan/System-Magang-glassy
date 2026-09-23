<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Order;
use App\Models\ScrapGlass;
use App\Models\Delivery;
use App\Models\User;
use App\Models\ActivityLog;
use App\Models\FinanceTransaction;
use App\Models\SheetGlass;
use App\Models\Supplier;
use App\Models\Accessory;
use App\Models\Tool;
use App\Models\Supply;
use Illuminate\Support\Facades\Hash;

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
            // ── Props yang sering berubah: dibungkus closure agar partial reload
            //    hanya mengevaluasi query yang diminta oleh klien. ─────────────
            'orders'              => fn() => Order::orderBy('id', 'desc')->get(),
            'metrics'             => fn() => $this->computeDashboardMetrics(),

            // ── Props data pendukung: lazy — hanya di-load saat diminta ───────
            'scrapGlasses'        => Inertia::optional(fn() => ScrapGlass::latest()->get()),
            'deliveries'          => Inertia::optional(fn() => Delivery::with('order')->latest()->get()),
            'users'               => Inertia::optional(fn() => User::select('id', 'name', 'email', 'role', 'created_at')->orderBy('id', 'desc')->get()),
            'activityLogs'        => Inertia::optional(fn() => ActivityLog::latest()->take(100)->get()),
            'financeTransactions' => Inertia::optional(fn() => FinanceTransaction::with(['user', 'approver'])->orderBy('transaction_date', 'desc')->orderBy('id', 'desc')->get()),
            'sheetGlasses'        => Inertia::optional(fn() => SheetGlass::orderBy('id', 'desc')->get()),
            'suppliers'           => Inertia::optional(fn() => Supplier::orderBy('id', 'desc')->get()),
            'accessories'         => Inertia::optional(fn() => Accessory::orderBy('id', 'desc')->get()),
            'tools'               => Inertia::optional(fn() => Tool::with(['borrows' => fn($q) => $q->latest()])->orderBy('id', 'desc')->get()),
            'supplies'            => Inertia::optional(fn() => Supply::with(['usages' => fn($q) => $q->latest(), 'restocks' => fn($q) => $q->latest()])->orderBy('id', 'desc')->get()),
        ]);
    }

    /**
     * Hitung semua metrik dashboard dalam satu metode terpusat.
     * Dipanggil via closure sehingga hanya berjalan saat prop 'metrics' diminta.
     */
    private function computeDashboardMetrics(): array
    {
        $otherRevenue       = (float) FinanceTransaction::where('approval_status', 'approved')->where('type', 'pemasukan_lain')->sum('amount');
        $totalRevenue       = (float) Order::sum('total_price') + $otherRevenue;
        $paidRevenue        = (float) Order::sum('paid_amount') + $otherRevenue;
        $pendingCODTotal    = (float) Order::where('payment_status', '!=', 'Lunas')->sum('total_price');
        $pendingCODPaid     = (float) Order::where('payment_status', '!=', 'Lunas')->sum('paid_amount');
        $pendingCOD         = ($pendingCODTotal - $pendingCODPaid) > 0
                                ? ($pendingCODTotal - $pendingCODPaid)
                                : $pendingCODTotal;

        $cogsPurchases      = (float) FinanceTransaction::where('approval_status', 'approved')->whereIn('type', ['pembelian_bahan', 'pembelian_aksesoris'])->sum('amount');
        $opexExpenses       = (float) FinanceTransaction::where('approval_status', 'approved')->whereIn('type', ['biaya_operasional', 'pembelian_alat'])->sum('amount');
        $totalExpenses      = $cogsPurchases + $opexExpenses;
        $grossProfit        = $totalRevenue - $cogsPurchases;
        $netProfit          = $totalRevenue - $totalExpenses;
        $scrapGlassLoss     = (float) ScrapGlass::where('status', 'Layak Pakai')->count() * 125000;
        $pendingApprovalCount = FinanceTransaction::where('approval_status', 'pending')->count();

        return [
            'totalOrders'          => Order::count(),
            'inProcess'            => Order::where('status', 'pengerjaan')->count(),
            'readyShip'            => Order::where('status', 'pengiriman')->count(),
            'scrapCount'           => ScrapGlass::count(),
            'scrapGlassLoss'       => $scrapGlassLoss,
            'pendingApprovalCount' => $pendingApprovalCount,
            'totalRevenue'         => $totalRevenue,
            'otherRevenue'         => $otherRevenue,
            'paidRevenue'          => $paidRevenue,
            'pendingCOD'           => $pendingCOD,
            'cogsPurchases'        => $cogsPurchases,
            'opexExpenses'         => $opexExpenses,
            'totalExpenses'        => $totalExpenses,
            'grossProfit'          => $grossProfit,
            'netProfit'            => $netProfit,
            'grossMarginPct'       => $totalRevenue > 0 ? round(($grossProfit / $totalRevenue) * 100, 1) : 0,
            'netMarginPct'         => $totalRevenue > 0 ? round(($netProfit  / $totalRevenue) * 100, 1) : 0,
        ];
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
            $dimensionErr = $this->validateItemGlassDimensions($rawItems);
            if ($dimensionErr) {
                return redirect()->back()->withErrors(['message' => $dimensionErr]);
            }
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
            'customer_name' => !empty(trim($validated['customer_name'] ?? '')) ? $validated['customer_name'] : '-',
            'customer_phone' => !empty(trim($validated['customer_phone'] ?? '')) ? $validated['customer_phone'] : '-',
            'customer_address' => !empty(trim($validated['customer_address'] ?? '')) ? $validated['customer_address'] : '-',
            'glass_type' => $summaryGlassType,
            'length_cm' => $primaryItem['length_cm'],
            'width_cm' => $primaryItem['width_cm'],
            'thickness_mm' => $primaryItem['thickness_mm'],
            'processes' => $primaryItem['processes'],
            'accessories' => $validated['accessories'] ?? [],
            'items' => $items,
            'description' => !empty(trim($validated['description'] ?? '')) ? $validated['description'] : '-',
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
            'gudang_released_at' => $isDraft ? null : now(),
            'division_progress' => $this->buildDivisionProgress($items, $validated['processes'] ?? []),
            'used_scrap_rak' => !empty(trim($validated['used_scrap_rak'] ?? '')) ? $validated['used_scrap_rak'] : '-',
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
            'revision_notes' => 'nullable|string',
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
            $dimensionErr = $this->validateItemGlassDimensions($rawItems);
            if ($dimensionErr) {
                return redirect()->back()->withErrors(['message' => $dimensionErr]);
            }
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
        $isRevisionUpdate = ($order->status === 'pengerjaan' && !$isPromoted);

        if ($isRevisionUpdate && empty(trim($validated['revision_notes'] ?? ''))) {
            return redirect()->back()->withErrors([
                'revision_notes' => 'Catatan / alasan revisi wajib diisi untuk menginfokan divisi produksi & gudang.'
            ]);
        }

        $paymentOption = $request->input('payment_option', 'dp');
        $dpPercent = (float)$request->input('dp_percent', 50);

        $order->order_date = $validated['order_date'] ?? $order->order_date;
        $order->customer_name = !empty(trim($validated['customer_name'] ?? '')) ? $validated['customer_name'] : '-';
        $order->customer_phone = !empty(trim($validated['customer_phone'] ?? '')) ? $validated['customer_phone'] : '-';
        $order->customer_address = !empty(trim($validated['customer_address'] ?? '')) ? $validated['customer_address'] : '-';
        $order->glass_type = $summaryGlassType;
        $order->length_cm = $primaryItem['length_cm'];
        $order->width_cm = $primaryItem['width_cm'];
        $order->thickness_mm = $primaryItem['thickness_mm'];
        $order->processes = $primaryItem['processes'];
        $order->accessories = $validated['accessories'] ?? [];
        $order->items = $items;
        $order->description = !empty(trim($validated['description'] ?? '')) ? $validated['description'] : '-';
        $order->priority_status = $validated['priority_status'];
        $order->deadline_date = $validated['deadline_date'] ?? $order->deadline_date;
        $order->subtotal = $subtotal;
        $order->priority_fee = $priorityFee;
        $order->custom_fee = $customFee;
        $order->total_price = $totalPrice;

        if ($isRevisionUpdate) {
            $order->is_revised = true;
            $order->revision_count = ($order->revision_count ?? 0) + 1;
            
            $rawRevNotes = trim($request->input('revision_notes', ''));

            // Calculate automatic detailed diffs
            $diffs = [];

            // 1. Qty comparison
            $oldTotalQty = 0;
            if (!empty($order->items) && is_array($order->items)) {
                foreach ($order->items as $it) {
                    $oldTotalQty += max(1, (int)($it['qty'] ?? 1));
                }
            } else {
                $oldTotalQty = max(1, (int)($order->qty ?? 1));
            }

            $newTotalQty = 0;
            foreach ($items as $it) {
                $newTotalQty += max(1, (int)($it['qty'] ?? 1));
            }

            if ($oldTotalQty !== $newTotalQty) {
                $diffs[] = "Total Qty Kaca: diubah dari {$oldTotalQty} pcs ➔ {$newTotalQty} pcs";
            }

            // 2. Glass type / summary comparison
            if ($order->glass_type !== $summaryGlassType) {
                $diffs[] = "Jenis Kaca: diubah dari '{$order->glass_type}' ➔ '{$summaryGlassType}'";
            }

            // 3. Dimensions comparison
            $oldLen = (float)$order->length_cm;
            $oldWid = (float)$order->width_cm;
            $newLen = (float)$primaryItem['length_cm'];
            $newWid = (float)$primaryItem['width_cm'];
            if ($oldLen !== $newLen || $oldWid !== $newWid) {
                $diffs[] = "Ukuran Kaca Utama: diubah dari {$oldLen}x{$oldWid} cm ➔ {$newLen}x{$newWid} cm";
            }

            // 4. Customer Address comparison
            $newAddress = !empty(trim($validated['customer_address'] ?? '')) ? $validated['customer_address'] : '-';
            if ($order->customer_address !== $newAddress) {
                $diffs[] = "Alamat Pengiriman: diubah dari '{$order->customer_address}' ➔ '{$newAddress}'";
            }

            // 5. Custom notes typed by Toko
            if (!empty($rawRevNotes) && $rawRevNotes !== '-') {
                $diffs[] = "Catatan Toko: \"{$rawRevNotes}\"";
            }

            $autoDiffText = !empty($diffs) 
                ? implode(' | ', $diffs) 
                : (!empty($rawRevNotes) ? $rawRevNotes : 'Revisi spesifikasi/desain dari Admin Toko.');

            $order->revision_notes = $autoDiffText;
            
            if ($order->current_division === 'admin_gudang') {
                $order->revision_status = 'pending_gudang';
            } else {
                $order->revision_status = 'pending_division';
            }

            $history = (array) ($order->revision_history ?? []);
            $history[] = [
                'revision_number' => $order->revision_count,
                'revised_at' => now()->toDateTimeString(),
                'revised_by' => auth()->user()->name ?? 'Admin Toko',
                'notes' => $autoDiffText,
                'user_notes' => $rawRevNotes,
                'changes_list' => $diffs,
                'glass_summary' => $summaryGlassType,
                'old_qty' => $oldTotalQty,
                'new_qty' => $newTotalQty,
            ];
            $order->revision_history = $history;
        }

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
                $order->gudang_released_at = $order->gudang_released_at ?? now();
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

        if ($isRevisionUpdate) {
            $destTarget = ($order->current_division === 'admin_gudang') ? 'Admin Gudang' : 'Seluruh Divisi Produksi';
            $message = 'Revisi Order #' . $order->spo_number . ' Berhasil Disimpan & Peringatan Terkirim ke ' . $destTarget . '!';
        } else {
            $message = $isPromoted 
                ? 'Draf Order #' . $order->spo_number . ' Berhasil Didealkan & Diterbitkan ke Admin Gudang!' 
                : 'Perubahan Draf Order #' . $order->spo_number . ' Berhasil Diperbarui!';
        }

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
        $order->gudang_released_at = $order->gudang_released_at ?? now();
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
            'target_division' => 'nullable|string', // e.g. divisi_ht, divisi_gm, divisi_bv, divisi_etsa
        ]);

        $order = Order::findOrFail($id);

        if ($order->revision_status === 'pending_gudang') {
            $order->revision_status = 'pending_division';
        }

        // Determine all required processes/divisions for this order
        $procs = (array) ($order->processes ?? []);
        if (is_array($order->items)) {
            foreach ($order->items as $it) {
                if (isset($it['processes']) && is_array($it['processes'])) {
                    foreach ($it['processes'] as $p) {
                        if (!in_array($p, $procs)) {
                            $procs[] = $p;
                        }
                    }
                }
            }
        }
        if (empty($procs)) {
            $procs = ['HT'];
        }
        if (!in_array('HT', $procs)) {
            array_unshift($procs, 'HT');
        }

        $targetDiv = $validated['target_division'] ?? ('divisi_' . strtolower($procs[0]));
        $order->current_division = $targetDiv;
        $order->gudang_released_at = $order->gudang_released_at ?? now();
        
        $currentDivKey = strtoupper(str_replace('divisi_', '', $targetDiv));
        $progress = (array) ($order->division_progress ?? []);

        // Ensure all required divisions are set in progress tracker
        $divCodes = ['HT', 'GM', 'BV', 'Etsa'];
        foreach ($divCodes as $code) {
            if (in_array($code, $procs)) {
                if (!isset($progress[$code]) || $progress[$code] === 'N/A') {
                    $progress[$code] = 'Belum';
                }
            }
        }
        $progress[$currentDivKey] = 'Menunggu Pengerjaan';

        $timestamps = (array) ($order->division_timestamps ?? []);
        if (!isset($timestamps[$currentDivKey]) || !is_array($timestamps[$currentDivKey])) {
            $timestamps[$currentDivKey] = ['started_at' => null, 'completed_at' => null];
        }

        $order->division_progress = $progress;
        $order->division_timestamps = $timestamps;
        $order->save();

        $divNames = array_map(function($p) {
            $labels = [
                'HT' => 'Divisi HT (Potong)',
                'GM' => 'Divisi GM (Gosok)',
                'BV' => 'Divisi BV (Bevel)',
                'Etsa' => 'Divisi Etsa (Blur)',
            ];
            return $labels[$p] ?? ('Divisi ' . $p);
        }, $procs);

        return redirect()->back()->with('message', '🚀 Order #' . $order->spo_number . ' Berhasil Dikirim ke Divisi Bersangkutan: ' . implode(', ', $divNames) . '!');
    }

    /**
     * Complete Order Delivery (Pengiriman -> Selesai)
     */
    public function completeDelivery(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        $order->status = 'selesai';
        $order->current_division = 'selesai';
        $order->delivered_at = $order->delivered_at ?? now();

        if ($request->boolean('mark_lunas') || $request->input('payment_status') === 'Lunas') {
            $order->payment_status = 'Lunas';
            $order->paid_amount = $order->total_price;
        }

        $order->save();

        Delivery::where('order_id', $order->id)->update([
            'delivery_status' => 'Selesai Terkirim'
        ]);

        return redirect()->back()->with('message', '✅ Order #' . $order->spo_number . ' Berhasil Dikonfirmasi Selesai Terkirim ke Konsumen!');
    }

    /**
     * Check if an order has completely finished execution through all required divisions
     */
    protected function isOrderExecutionFinished(Order $order): bool
    {
        if ($order->status === 'selesai') {
            return true;
        }

        if ($order->status === 'draft') {
            return false;
        }

        // Active production and internal prep divisions mean it is still being worked on
        $workingDivisions = ['admin_toko', 'admin_gudang', 'divisi_ht', 'divisi_gm', 'divisi_bv', 'divisi_etsa'];
        if (in_array($order->current_division, $workingDivisions)) {
            return false;
        }

        if ($order->status === 'pengerjaan') {
            return false;
        }

        // Check division_progress array
        $progress = (array) ($order->division_progress ?? []);
        if (!empty($progress)) {
            foreach ($progress as $divCode => $status) {
                if ($status === 'N/A') {
                    continue;
                }
                if ($status !== 'Selesai') {
                    return false;
                }
            }
        }

        return $order->status === 'pengiriman' || in_array($order->current_division, ['QC_Ready', 'pengiriman']);
    }

    /**
     * Assign Batch Multi-Address Delivery to Vehicle and Driver
     */
    public function assignBatchDelivery(Request $request)
    {
        $validated = $request->validate([
            'order_ids' => 'required|array|min:1',
            'order_ids.*' => 'required|exists:orders,id',
            'driver_name' => 'required|string',
            'vehicle_plate' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        $tripCode = 'TRIP-' . date('Ymd') . '-' . rand(1000, 9999);
        $driverName = $validated['driver_name'];
        $vehiclePlate = $validated['vehicle_plate'];
        $notes = $validated['notes'] ?? null;

        $orders = Order::whereIn('id', $validated['order_ids'])->get();

        // Strict Validation: Ensure all selected orders have completely finished execution through the last division
        $unreadyOrders = [];
        foreach ($orders as $order) {
            if (!$this->isOrderExecutionFinished($order)) {
                $unreadyOrders[] = 'SPO #' . ($order->spo_number ?? $order->id);
            }
        }

        if (!empty($unreadyOrders)) {
            return redirect()->back()->withErrors([
                'message' => '⚠️ Gagal Mengatur Pengiriman: Order ' . implode(', ', $unreadyOrders) . ' belum selesai dieksekusi oleh divisi terakhir!'
            ])->with('error', '⚠️ Gagal Mengatur Pengiriman: Order ' . implode(', ', $unreadyOrders) . ' belum selesai dieksekusi oleh divisi terakhir!');
        }

        foreach ($orders as $index => $order) {
            $stopOrder = $index + 1;

            $order->assigned_driver = $driverName;
            $order->assigned_vehicle = $vehiclePlate;
            $order->trip_code = $tripCode;
            if ($order->status !== 'selesai') {
                $order->status = 'pengiriman';
                $order->current_division = 'pengiriman';
            }
            $order->shipped_at = $order->shipped_at ?? now();
            $order->save();

            $waybillColor = $order->payment_status === 'Lunas' ? 'Putih' : 'Merah';
            Delivery::updateOrCreate(
                ['order_id' => $order->id],
                [
                    'waybill_number' => 'SJ-' . ($order->spo_number ?? $order->id),
                    'trip_code' => $tripCode,
                    'stop_order' => $stopOrder,
                    'driver_name' => $driverName,
                    'vehicle_plate' => $vehiclePlate,
                    'waybill_color' => $waybillColor,
                    'delivery_status' => 'Dalam Pengiriman',
                    'notes' => $notes,
                ]
            );
        }

        return redirect()->back()->with('message', '🚚 Rute Pengiriman Armada #' . $tripCode . ' Berhasil Ditetapkan (' . $driverName . ' — ' . $vehiclePlate . ')! Otomatis masuk ke Admin Gudang (Siap Cetak SJ 4 Warna & Gate Pass) & terbit di Tugas Pengiriman Divisi Supir.');
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
     * Lock order for Admin Gudang & Divisions when Admin Toko opens edit/revision modal
     */
    public function lockRevisionEdit(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        if ($order->status === 'pengerjaan') {
            $order->revision_status = 'editing';
            $order->save();
        }
        return redirect()->back();
    }

    /**
     * Cancel revision edit lock if Admin Toko closes edit modal without saving
     */
    public function cancelRevisionLock(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        if ($order->revision_status === 'editing') {
            $order->revision_status = $order->is_revised ? 'acknowledged' : 'none';
            $order->save();
        }
        return redirect()->back();
    }

    /**
     * Submit Revision from Admin Toko
     */
    public function submitRevision(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        $notes = $request->input('notes', 'Revisi ukuran & spesifikasi dari Admin Toko.');
        $order->is_revised = true;
        $order->revision_count = ($order->revision_count ?? 0) + 1;
        $order->revision_notes = $notes;
        $order->revision_status = ($order->current_division === 'admin_gudang') ? 'pending_gudang' : 'pending_division';

        $history = (array) ($order->revision_history ?? []);
        $history[] = [
            'revised_at' => now()->toDateTimeString(),
            'revised_by' => auth()->user()->name ?? 'Admin Toko',
            'notes' => $notes,
            'glass_summary' => $order->glass_type,
        ];
        $order->revision_history = $history;
        $order->save();

        return redirect()->back()->with('message', 'Peringatan Revisi Order ' . $order->spo_number . ' Berhasil Dikirim!');
    }

    /**
     * Acknowledge / Accept Revision (Admin Gudang or Division Worker like Divisi Potong HT)
     */
    public function acknowledgeRevision(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        if ($order->revision_status === 'pending_gudang') {
            $order->revision_status = 'acknowledged';
            $order->save();
            return redirect()->back()->with('message', '✅ Revisi Order #' . $order->spo_number . ' Berhasil Dikonfirmasi Admin Gudang! SPO siap didisposisi.');
        }

        if ($order->revision_status === 'pending_division') {
            $order->revision_status = 'acknowledged';
            $order->save();
            return redirect()->back()->with('message', '🔄 Revisi SPO #' . $order->spo_number . ' Berhasil Diterima & Disetujui Pekerja Divisi! Silakan lanjutkan pekerjaan.');
        }

        $order->revision_status = 'acknowledged';
        $order->save();

        return redirect()->back()->with('message', 'Status revisi SPO #' . $order->spo_number . ' Berhasil Dikonfirmasi.');
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

        if ($order->revision_status === 'pending_division') {
            return redirect()->back()->with('message', '⚠️ Akses Ditolak: Orderan #' . $order->spo_number . ' sedang memiliki revisian dari Admin Toko! Harap klik button Terima & Eksekusi Revisi SPO terlebih dahulu.');
        }

        if ($order->complaint_status === 'pending_gudang') {
            return redirect()->back()->with('message', '⚠️ Akses Ditolak: Orderan #' . $order->spo_number . ' sedang dalam proses pelaporan kaca cacat/baret ke Admin Gudang!');
        }

        $currentDiv = $order->current_division;
        $currentDivKey = strtoupper(str_replace('divisi_', '', $currentDiv));
        $progress = (array) ($order->division_progress ?? []);
        $timestamps = (array) ($order->division_timestamps ?? []);

        if ($currentDivKey) {
            $progress[$currentDivKey] = 'Sedang Dikerjakan';
            if (!isset($timestamps[$currentDivKey]) || !is_array($timestamps[$currentDivKey])) {
                $timestamps[$currentDivKey] = ['started_at' => null, 'completed_at' => null];
            }
            if (empty($timestamps[$currentDivKey]['started_at'])) {
                $timestamps[$currentDivKey]['started_at'] = now()->toDateTimeString();
            }
        }

        $order->division_progress = $progress;
        $order->division_timestamps = $timestamps;
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

        // Strict Authorization: Only assigned division staff, admin_gudang, owner, or admin_toko can execute
        if ($userRole !== $order->current_division && $userRole !== 'admin_gudang' && $userRole !== 'owner' && $userRole !== 'admin_toko') {
            return redirect()->back()->with('message', '⚠️ Akses Ditolak: Anda hanya memiliki izin untuk mengeksekusi pekerjaan pada divisi Anda sendiri!');
        }

        if ($order->revision_status === 'pending_division') {
            return redirect()->back()->with('message', '⚠️ Akses Ditolak: Orderan #' . $order->spo_number . ' sedang memiliki revisian yang belum dikonfirmasi! Harap klik button Terima & Eksekusi Revisi SPO terlebih dahulu sebelum menyelesaikan pekerjaan.');
        }

        if ($order->complaint_status === 'pending_gudang') {
            return redirect()->back()->with('message', '⚠️ Akses Ditolak: Orderan #' . $order->spo_number . ' sedang dalam proses pelaporan kaca cacat/baret ke Admin Gudang!');
        }

        $currentDiv = $order->current_division;
        $nextDiv = $request->input('next_division', 'QC_Ready');

        $currentDivKey = strtoupper(str_replace('divisi_', '', $currentDiv));
        $progress = (array) ($order->division_progress ?? []);
        $timestamps = (array) ($order->division_timestamps ?? []);

        if ($currentDivKey) {
            $progress[$currentDivKey] = 'Selesai';
            if (!isset($timestamps[$currentDivKey]) || !is_array($timestamps[$currentDivKey])) {
                $timestamps[$currentDivKey] = ['started_at' => null, 'completed_at' => null];
            }
            if (empty($timestamps[$currentDivKey]['started_at'])) {
                $timestamps[$currentDivKey]['started_at'] = now()->toDateTimeString();
            }
            $timestamps[$currentDivKey]['completed_at'] = now()->toDateTimeString();
        }

        if ($order->is_revised) {
            $order->revision_status = 'resolved';
        }

        if ($order->complaint_status === 're_cut_needed' && $currentDiv === 'divisi_ht') {
            $order->complaint_status = 'resolved';
        }

        if ($nextDiv === 'QC_Ready' || $nextDiv === 'pengiriman') {
            $order->status = 'pengiriman';
            $order->current_division = 'QC_Ready';
            $order->execution_completed_at = $order->execution_completed_at ?? now();
            $order->shipped_at = $order->shipped_at ?? now();
            $order->division_progress = $progress;
            $order->division_timestamps = $timestamps;
            $order->save();
            $msg = 'Pekerjaan Divisi untuk #' . $order->spo_number . ' Selesai & Lolos QC! Siap Dikirim ke Driver.';
        } else {
            $nextDivKey = strtoupper(str_replace('divisi_', '', $nextDiv));
            $progress[$nextDivKey] = 'Menunggu Pengerjaan';
            if (!isset($timestamps[$nextDivKey]) || !is_array($timestamps[$nextDivKey])) {
                $timestamps[$nextDivKey] = ['started_at' => null, 'completed_at' => null];
            }

            $order->status = 'pengerjaan';
            $order->current_division = $nextDiv;
            $order->division_progress = $progress;
            $order->division_timestamps = $timestamps;
            $order->save();

            $nextDivLabel = strtoupper(str_replace('_', ' ', $nextDiv));
            $msg = 'Pekerjaan #' . $order->spo_number . ' Selesai di ' . $currentDivKey . ' & Berhasil Diteruskan ke ' . $nextDivLabel . '!';
        }

        return redirect()->back()->with('message', $msg);
    }

    /**
     * Record Raw Material (Sheet Glass) Usage for Order (Divisi HT Potong)
     */
    public function recordRawMaterialUsage(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        $userRole = auth()->user()->role ?? '';

        if ($userRole !== 'divisi_ht' && $userRole !== 'admin_gudang' && $userRole !== 'owner') {
            return redirect()->back()->with('message', '⚠️ Akses Ditolak: Hanya Divisi Potong (HT) atau Admin Gudang yang dapat mencatat pemakaian bahan lembaran!');
        }

        $validated = $request->validate([
            'glass_type' => 'required|string',
            'sheets_used' => 'required|numeric|min:1',
            'notes' => 'nullable|string',
        ]);

        $rawUsage = (array) ($order->raw_materials_used ?? []);
        $rawUsage[] = [
            'id' => time() . rand(100, 999),
            'glass_type' => $validated['glass_type'],
            'sheets_used' => (int) $validated['sheets_used'],
            'notes' => $validated['notes'] ?? 'Pemotongan bahan lembaran baru Divisi HT',
            'recorded_by' => auth()->user()->name ?? 'Pekerja Divisi HT',
            'recorded_at' => now()->toDateTimeString(),
        ];

        $order->raw_materials_used = $rawUsage;
        $order->save();

        ActivityLog::create([
            'user_id' => auth()->id(),
            'admin_name' => auth()->user()->name ?? 'Pekerja Divisi HT',
            'action_type' => 'CATAT_BAHAN_KACA',
            'target_user_name' => $order->spo_number,
            'description' => 'Mencatat pemakaian ' . $validated['sheets_used'] . ' lembar bahan kaca (' . $validated['glass_type'] . ') untuk SPO ' . $order->spo_number,
            'created_at' => now(),
        ]);

        return redirect()->back()->with('message', '✅ Pemakaian ' . $validated['sheets_used'] . ' lembar bahan kaca (' . $validated['glass_type'] . ') berhasil dicatat untuk SPO ' . $order->spo_number . '!');
    }

    /**
     * Use / Accept Scrap Recommendation by Divisi HT (Potong)
     */
    public function useScrapRecommendation(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        $userRole = auth()->user()->role ?? '';

        if ($userRole !== 'divisi_ht' && $userRole !== 'admin_gudang' && $userRole !== 'owner') {
            return redirect()->back()->with('message', '⚠️ Akses Ditolak: Hanya Divisi Potong (HT) atau Admin Gudang yang dapat mengonfirmasi pemakaian kaca sisa!');
        }

        $scrapStr = $order->used_scrap_rak ?: '';
        
        preg_match('/SCRAP-\d+/', $scrapStr, $matches);
        $scrapCode = $matches[0] ?? null;

        if ($scrapCode) {
            $scrapItem = ScrapGlass::where('scrap_code', $scrapCode)->first();
            if ($scrapItem) {
                $scrapItem->update([
                    'status' => 'Terpakai'
                ]);
            }
        }

        $usedStr = '✅ [TERPAKAI DIVISI HT] ' . ($scrapCode ? ('Kaca Sisa ' . $scrapCode) : $scrapStr) . ' (Diambil dari stok rak & dipotong untuk SPO-' . $order->spo_number . ')';
        $order->used_scrap_rak = $usedStr;
        $order->save();

        ActivityLog::create([
            'user_id' => auth()->id(),
            'admin_name' => auth()->user()->name ?? 'Pekerja Divisi HT',
            'action_type' => 'PAKAI_SCRAP',
            'target_user_name' => $order->spo_number,
            'description' => 'Divisi HT Menggunakan kaca sisa ' . ($scrapCode ?: $scrapStr) . ' untuk pengerjaan SPO #' . $order->spo_number . '. Stok kaca sisa diperbarui menjadi Terpakai.',
            'created_at' => now(),
        ]);

        return redirect()->back()->with('message', '✅ Pemakaian kaca sisa untuk SPO ' . $order->spo_number . ' berhasil dikonfirmasi! Stok sisa telah diperbarui menjadi Terpakai.');
    }

    /**
     * Reject Scrap Recommendation by Divisi HT (Kaca Baret / Ukuran Tidak Cukup / Rusak + Potong Ulang Sisa Utuh)
     */
    public function rejectScrapRecommendation(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        $userRole = auth()->user()->role ?? '';

        if ($userRole !== 'divisi_ht' && $userRole !== 'admin_gudang' && $userRole !== 'owner') {
            return redirect()->back()->with('message', '⚠️ Akses Ditolak: Hanya Divisi Potong (HT) atau Admin Gudang yang dapat menolak rekomendasi kaca sisa!');
        }

        $validated = $request->validate([
            'reason_type' => 'required|string',
            'notes' => 'nullable|string',
            'resize_scrap' => 'nullable|boolean',
            'new_length_cm' => 'nullable|numeric|min:0',
            'new_width_cm' => 'nullable|numeric|min:0',
            'scrap_id' => 'nullable|exists:scrap_glasses,id',
        ]);

        $reasonLabels = [
            'baret_cacat' => 'Kaca Baret / Cacat / Retak Fisik',
            'ukuran_kurang' => 'Ukuran Fisik Kaca Sisa Tidak Cukup',
            'tidak_ditemukan' => 'Kaca Tidak Ditemukan di Rak Storage',
            'alasan_lain' => 'Alasan Lainnya',
        ];

        $label = $reasonLabels[$validated['reason_type']] ?? $validated['reason_type'];
        $notesStr = !empty(trim($validated['notes'] ?? '')) ? ' ("' . trim($validated['notes']) . '")' : '';

        $oldScrapStr = $order->used_scrap_rak ?: '-';
        preg_match('/SCRAP-\d+/', $oldScrapStr, $matches);
        $scrapCode = $matches[0] ?? null;

        $scrapItem = null;
        if (!empty($validated['scrap_id'])) {
            $scrapItem = ScrapGlass::find($validated['scrap_id']);
        } elseif ($scrapCode) {
            $scrapItem = ScrapGlass::where('scrap_code', $scrapCode)->first();
        }

        $resizeStr = '';
        if ($scrapItem && !empty($validated['resize_scrap']) && !empty($validated['new_length_cm']) && !empty($validated['new_width_cm'])) {
            $oldDim = "{$scrapItem->length_cm}x{$scrapItem->width_cm} cm";
            $scrapItem->update([
                'length_cm' => $validated['new_length_cm'],
                'width_cm' => $validated['new_width_cm'],
                'status' => 'Layak Pakai',
            ]);
            $newDim = "{$validated['new_length_cm']}x{$validated['new_width_cm']} cm";
            $resizeStr = " | ✂️ [DIPOTONG ULANG] Dimensi {$scrapItem->scrap_code} disesuaikan dari {$oldDim} menjadi {$newDim}";

            ActivityLog::create([
                'user_id' => auth()->id(),
                'admin_name' => auth()->user()->name ?? 'Pekerja Divisi HT',
                'action_type' => 'POTONG_ULANG_SCRAP',
                'target_user_name' => $scrapItem->scrap_code,
                'description' => 'Memotong ulang sisa utuh kaca ' . $scrapItem->scrap_code . ' dari ' . $oldDim . ' menjadi ' . $newDim . ' (karena baret/cacat pada penolakan SPO #' . $order->spo_number . ').',
                'created_at' => now(),
            ]);
        } elseif ($scrapItem && $validated['reason_type'] === 'baret_cacat' && empty($validated['resize_scrap'])) {
            $scrapItem->update(['status' => 'Afval/Baret']);
        }

        $rejectionStr = '❌ [DITOLAK DIVISI HT] ' . $label . $notesStr . $resizeStr . ' | (Rekomendasi Toko Semula: ' . $oldScrapStr . ')';

        $order->used_scrap_rak = $rejectionStr;
        $order->save();

        ActivityLog::create([
            'user_id' => auth()->id(),
            'admin_name' => auth()->user()->name ?? 'Pekerja Divisi HT',
            'action_type' => 'TOLAK_SCRAP',
            'target_user_name' => $order->spo_number,
            'description' => 'Divisi HT Menolak rekomendasi penggunaan kaca sisa pada SPO #' . $order->spo_number . '. Alasan: ' . $label . $notesStr . '.' . $resizeStr,
            'created_at' => now(),
        ]);

        return redirect()->back()->with('message', '❌ Penolakan penggunaan kaca sisa untuk SPO ' . $order->spo_number . ' berhasil dicatat!');
    }

    /**
     * Submit Glass Defect / Scratch Complaint from Division
     */
    public function submitGlassComplaint(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        $userRole = auth()->user()->role ?? '';

        if ($userRole !== $order->current_division && $userRole !== 'admin_gudang' && $userRole !== 'owner') {
            return redirect()->back()->with('message', '⚠️ Akses Ditolak: Anda hanya memiliki izin untuk mengajukan komplain pada divisi Anda sendiri!');
        }

        $request->validate([
            'reason' => 'required|string',
            'notes' => 'nullable|string',
            'photo' => 'nullable|image|max:5120',
        ]);

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('complaints', 'public');
        }

        $rawNotes = trim($request->input('notes', ''));
        $rawDefective = $request->input('defective_items');
        $defectiveItems = [];
        if (is_string($rawDefective)) {
            $defectiveItems = json_decode($rawDefective, true) ?? [];
        } elseif (is_array($rawDefective)) {
            $defectiveItems = $rawDefective;
        }

        $complaintData = [
            'reporting_division' => $order->current_division,
            'reason' => $request->input('reason'),
            'notes' => !empty($rawNotes) ? $rawNotes : '-',
            'defective_items' => $defectiveItems,
            'photo_path' => $photoPath,
            'reported_at' => now()->toDateTimeString(),
            'resolved_at' => null,
            'gudang_decision' => null,
        ];

        $order->complaint_status = 'pending_gudang';
        $order->complaint_data = $complaintData;
        $order->save();

        $divLabel = strtoupper(str_replace('divisi_', '', $order->current_division));
        return redirect()->back()->with('message', '⚠️ Komplain Kaca Cacat/Baret dari Divisi ' . $divLabel . ' untuk SPO #' . $order->spo_number . ' Berhasil Dikirim ke Admin Gudang!');
    }

    /**
     * Resolve Glass Defect Complaint by Admin Gudang (Continue vs Replace Glass)
     */
    public function resolveGlassComplaint(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        $userRole = auth()->user()->role ?? '';

        if ($userRole !== 'admin_gudang' && $userRole !== 'owner') {
            return redirect()->back()->with('message', '⚠️ Akses Ditolak: Hanya Admin Gudang atau Owner yang dapat mengonfirmasi keputusan komplain kaca!');
        }

        $action = $request->input('action'); // 'continue' or 'replace_glass'
        $complaintData = (array) ($order->complaint_data ?? []);

        if ($action === 'continue') {
            $complaintData['gudang_decision'] = 'continue';
            $complaintData['resolved_at'] = now()->toDateTimeString();

            $order->complaint_status = 'resolved';
            $order->complaint_data = $complaintData;
            $order->save();

            return redirect()->back()->with('message', '✅ Keputusan Admin Gudang: Pengerjaan SPO #' . $order->spo_number . ' Dilanjutkan di divisi asal.');
        } elseif ($action === 'replace_glass') {
            $reportingDiv = $order->current_division;
            $reportingDivKey = strtoupper(str_replace('divisi_', '', $reportingDiv));

            $complaintData['gudang_decision'] = 'replace_glass';
            $complaintData['resolved_at'] = now()->toDateTimeString();

            // Update history of reporting division to reflect replaced glass
            $progress = (array) ($order->division_progress ?? []);
            if ($reportingDivKey) {
                $progress[$reportingDivKey] = 'Kaca Diganti Gudang & Dikembalikan ke Potong (HT)';
            }
            // Mark HT as requiring re-cutting for replacement
            $progress['HT'] = 'Potong Ulang (Orderan Ulang Ganti Kaca dari ' . $reportingDivKey . ')';

            $order->complaint_status = 're_cut_needed';
            $order->complaint_data = $complaintData;
            $order->current_division = 'divisi_ht';
            $order->division_progress = $progress;
            $order->save();

            return redirect()->back()->with('message', '🚨 Permintaan Ganti Barang Kaca Disetujui! SPO #' . $order->spo_number . ' telah masuk sebagai Order Ulang Ganti Barang dan dikembalikan ke Divisi Potong (HT).');
        }

        return redirect()->back()->with('message', '⚠️ Keputusan tidak valid!');
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

        // 2. Harga Dasar Kaca (per m2 proporsional sesuai katalog jenis kaca)
        $pricePerM2 = (float)($it['price_per_m2'] ?? 0);
        if ($pricePerM2 <= 0) {
            if ($t >= 12) $pricePerM2 = 950000;
            elseif ($t >= 10) $pricePerM2 = 720000;
            elseif ($t >= 8) $pricePerM2 = 450000;
            else $pricePerM2 = 380000;
        }
        $rawBasePrice = round($areaM2 * $pricePerM2);
        // Harga dasar kaca murni proporsional luas area m2
        $baseGlassPrice = $rawBasePrice * $q;

        // 3. Biaya GM, HT, BV, Etsa dengan tarif kustom per jenis kaca (dengan fallback default)
        $rateGM = (float)($it['rate_gm'] ?? 10000);
        $rateHT = (float)($it['rate_ht'] ?? 1000);
        $rateBV = (float)($it['rate_bv'] ?? 15000);
        $rateEtsa = (float)($it['rate_etsa'] ?? 50000);

        // 3. Biaya GM (Gosok Mesin)
        $feeGM = in_array('GM', $procs) ? round($perimeterM * $rateGM) * $q : 0;

        // 4. Biaya HT (Gosok HT / Halus Tepi)
        $feeHT = in_array('HT', $procs) ? round($perimeterM * $rateHT) * $q : 0;

        // 5. Biaya BV (Beveling)
        $bevelWidthCm = (float)str_replace(',', '.', (string)($it['bevel_width_cm'] ?? 1));
        $feeBV = in_array('BV', $procs) ? round(($perimeterM * $rateBV) + ($bevelWidthCm * 10000)) * $q : 0;

        // 6. Biaya Bor (Coakan): Keliling ruas lubang cm * Rp 2.500 * jumlah lubang (Mendukung multi-lubang)
        $feeBor = 0;
        $holesSpecs = [];
        if (in_array('Bor', $procs)) {
            if (isset($it['holes']) && is_array($it['holes']) && count($it['holes']) > 0) {
                foreach ($it['holes'] as $h) {
                    $hl = (float)str_replace(',', '.', (string)($h['hole_length_cm'] ?? $h['length_cm'] ?? 2));
                    $hw = (float)str_replace(',', '.', (string)($h['hole_width_cm'] ?? $h['width_cm'] ?? 2));
                    $hq = max(1, (int)($h['hole_qty'] ?? $h['qty'] ?? 1));
                    $ruas = 2 * ($hl + $hw);
                    $feeBor += round($ruas * 2500) * $hq * $q;
                    $holesSpecs[] = [
                        'hole_length_cm' => $hl,
                        'hole_width_cm' => $hw,
                        'hole_qty' => $hq,
                    ];
                }
            } else {
                $holeLCm = (float)str_replace(',', '.', (string)($it['hole_length_cm'] ?? 2));
                $holeWCm = (float)str_replace(',', '.', (string)($it['hole_width_cm'] ?? 2));
                $holeQty = max(1, (int)($it['hole_qty'] ?? 1));
                $holeRuasCm = 2 * ($holeLCm + $holeWCm);
                $feeBor = round($holeRuasCm * 2500) * $holeQty * $q;
                $holesSpecs[] = [
                    'hole_length_cm' => $holeLCm,
                    'hole_width_cm' => $holeWCm,
                    'hole_qty' => $holeQty,
                ];
            }
        }
        $primaryHoleL = $holesSpecs[0]['hole_length_cm'] ?? 2;
        $primaryHoleW = $holesSpecs[0]['hole_width_cm'] ?? 2;
        $primaryHoleQ = $holesSpecs[0]['hole_qty'] ?? 1;

        // 7. Biaya Etsa (Sandblast): Langsung dihitung dari Luas Area Etsa (m2)
        $etsaLCm = (float)str_replace(',', '.', (string)($it['etsa_length_cm'] ?? $l));
        $etsaWCm = (float)str_replace(',', '.', (string)($it['etsa_width_cm'] ?? $w));
        $etsaQty = max(1, (int)($it['etsa_qty'] ?? 1));
        $etsaAreaM2 = ($etsaLCm * $etsaWCm) / 10000;

        $feeEtsa = 0;
        if (in_array('Etsa', $procs)) {
            $feeEtsa = round($etsaAreaM2 * $etsaQty * $rateEtsa) * $q;
            // Batas minimum biaya etsa (setengah tarif per m2) per unit
            $feeEtsa = max(($rateEtsa / 2) * $q, $feeEtsa);
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
            'holes' => $holesSpecs,
            'hole_length_cm' => $primaryHoleL,
            'hole_width_cm' => $primaryHoleW,
            'hole_qty' => $primaryHoleQ,
            'etsa_length_cm' => $etsaLCm,
            'etsa_width_cm' => $etsaWCm,
            'etsa_qty' => $etsaQty,
            'etsa_area_m2' => $etsaAreaM2,
            'base_glass_price' => $baseGlassPrice,
            'price_per_m2' => $pricePerM2,
            'rate_gm' => $rateGM,
            'rate_ht' => $rateHT,
            'rate_bv' => $rateBV,
            'rate_etsa' => $rateEtsa,
            'fee_gm' => $feeGM,
            'fee_ht' => $feeHT,
            'fee_bv' => $feeBV,
            'fee_bor' => $feeBor,
            'fee_etsa' => $feeEtsa,
            'subtotal' => $itemSubtotal
        ];
    }

    /**
     * Helper to dynamically generate division_progress array based on required item processes
     */
    protected function buildDivisionProgress($items = [], $processes = [])
    {
        $req = [];
        if (is_array($processes)) {
            foreach ($processes as $p) {
                $req[strtoupper((string)$p)] = true;
            }
        }
        if (is_array($items)) {
            foreach ($items as $it) {
                if (isset($it['processes']) && is_array($it['processes'])) {
                    foreach ($it['processes'] as $p) {
                        $req[strtoupper((string)$p)] = true;
                    }
                }
            }
        }

        $divKeys = ['HT', 'GM', 'BV', 'Etsa'];
        $progress = [];
        foreach ($divKeys as $code) {
            $upperCode = strtoupper($code);
            // HT (Potong) is ALWAYS mandatory for every order (potong kaca lembaran)
            if ($upperCode === 'HT' || isset($req[$upperCode])) {
                $progress[$code] = 'Belum';
            } else {
                $progress[$code] = 'N/A';
            }
        }
        return $progress;
    }

    /**
     * Store New Employee Account (HRD / Owner Only)
     */
    public function storeUser(Request $request)
    {
        $currentUserRole = auth()->user()->role ?? 'staff';

        if ($currentUserRole !== 'owner' && $currentUserRole !== 'hrd') {
            return redirect()->back()->withErrors(['message' => 'Akses ditolak: Pengelolaan akun karyawan hanya dapat dilakukan oleh Staff HRD & Personalia dan Owner.']);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'role' => 'required|string|in:admin_toko,admin_gudang,divisi_ht,divisi_gm,divisi_bv,divisi_etsa,driver,owner,hrd,finance',
            'password' => 'required|string|min:6',
        ]);

        $managementRoles = ['owner', 'finance', 'hrd'];
        if ($currentUserRole !== 'owner' && in_array($validated['role'], $managementRoles)) {
            return redirect()->back()->withErrors(['role' => 'Akun level manajemen/keuangan (Owner, Admin Finance, HRD) hanya dapat didaftarkan oleh Owner!']);
        }

        $newUser = User::create([
            'name' => $validated['name'],
            'email' => strtolower(trim($validated['email'])),
            'role' => $validated['role'],
            'password' => Hash::make($validated['password']),
        ]);

        // Record Audit Activity Log
        ActivityLog::create([
            'user_id' => auth()->id(),
            'admin_name' => auth()->user()->name ?? 'Admin System',
            'action_type' => 'BUAT_AKUN',
            'target_user_name' => $newUser->name,
            'description' => 'Membuat akun karyawan baru (' . $newUser->name . ' - ' . $newUser->email . ') dengan peran ' . strtoupper($newUser->role),
        ]);

        return redirect()->back()->with('message', 'Akun karyawan baru (' . $validated['name'] . ') berhasil dibuat!');
    }

    /**
     * Update Employee Account Info or Password
     */
    public function updateUser(Request $request, $id)
    {
        $currentUserRole = auth()->user()->role ?? 'staff';

        if ($currentUserRole !== 'owner' && $currentUserRole !== 'hrd') {
            return redirect()->back()->withErrors(['message' => 'Akses ditolak: Pengelolaan akun karyawan hanya dapat dilakukan oleh Staff HRD & Personalia dan Owner.']);
        }

        $user = User::findOrFail($id);

        $managementRoles = ['owner', 'finance', 'hrd'];
        if ($currentUserRole !== 'owner' && (in_array($user->role, $managementRoles) || in_array($request->input('role'), $managementRoles))) {
            return redirect()->back()->withErrors(['message' => 'Akun level manajemen/keuangan (Owner, Admin Finance, HRD) terlindung dan hanya dapat diubah oleh Owner!']);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $id,
            'role' => 'required|string|in:admin_toko,admin_gudang,divisi_ht,divisi_gm,divisi_bv,divisi_etsa,driver,owner,hrd,finance',
            'password' => 'nullable|string|min:6',
        ]);

        $updateData = [
            'name' => $validated['name'],
            'email' => strtolower(trim($validated['email'])),
            'role' => $validated['role'],
        ];

        $isPasswordChanged = !empty($validated['password']);
        if ($isPasswordChanged) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        // Record Audit Activity Log
        $actionType = $isPasswordChanged ? 'RESET_PASSWORD' : 'EDIT_AKUN';
        $logDesc = $isPasswordChanged 
            ? 'Melakukan reset/pembaruan password & data untuk karyawan (' . $user->name . ' - ' . $user->email . ')'
            : 'Memperbarui informasi profil/peran karyawan (' . $user->name . ' - peran: ' . strtoupper($user->role) . ')';

        ActivityLog::create([
            'user_id' => auth()->id(),
            'admin_name' => auth()->user()->name ?? 'Admin System',
            'action_type' => $actionType,
            'target_user_name' => $user->name,
            'description' => $logDesc,
        ]);

        return redirect()->back()->with('message', 'Data karyawan (' . $user->name . ') berhasil diperbarui!');
    }

    /**
     * Delete / Deactivate Employee Account
     */
    public function destroyUser(Request $request, $id)
    {
        $currentUserRole = auth()->user()->role ?? 'staff';

        if ($currentUserRole !== 'owner' && $currentUserRole !== 'hrd') {
            return redirect()->back()->withErrors(['message' => 'Akses ditolak: Pengelolaan akun karyawan hanya dapat dilakukan oleh Staff HRD & Personalia dan Owner.']);
        }

        if (auth()->id() == $id) {
            return redirect()->back()->withErrors(['message' => 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan!']);
        }

        $user = User::findOrFail($id);

        $managementRoles = ['owner', 'finance', 'hrd'];
        if ($currentUserRole !== 'owner' && in_array($user->role, $managementRoles)) {
            return redirect()->back()->withErrors(['message' => 'Akun level manajemen/keuangan (Owner, Admin Finance, HRD) terlindung dan hanya dapat dihapus/dinonaktifkan oleh Owner!']);
        }

        $deletedName = $user->name;
        $deletedEmail = $user->email;
        $deletedRole = $user->role;
        $user->delete();

        // Record Audit Activity Log
        ActivityLog::create([
            'user_id' => auth()->id(),
            'admin_name' => auth()->user()->name ?? 'Admin System',
            'action_type' => 'HAPUS_AKUN',
            'target_user_name' => $deletedName,
            'description' => 'Menghapus/menonaktifkan akun karyawan (' . $deletedName . ' - ' . $deletedEmail . ' - peran: ' . strtoupper($deletedRole) . ')',
        ]);

        return redirect()->back()->with('message', 'Akun karyawan (' . $deletedName . ') berhasil dihapus/dinonaktifkan dari sistem.');
    }

    /**
     * Store New Financial Transaction (Pembelian Bahan, Alat, Aksesoris, Beban Operasional)
     */
    public function storeFinanceTransaction(Request $request)
    {
        $user = auth()->user();
        $isDriver = ($user && $user->role === 'driver') || $request->input('source_role') === 'driver';

        $validated = $request->validate([
            'type' => 'required|string|in:pembelian_bahan,pembelian_aksesoris,pembelian_alat,biaya_operasional,pemasukan_lain',
            'category' => 'required|string|max:255',
            'title' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'supplier_name' => 'nullable|string|max:255',
            'invoice_number' => 'nullable|string|max:255',
            'payment_method' => 'nullable|string|max:255',
            'payment_status' => 'nullable|string|in:Lunas,Tempo,DP',
            'transaction_date' => 'required|date',
            'due_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'vehicle_plate' => 'nullable|string|max:255',
            'source_role' => 'nullable|string|max:50',
            'approval_status' => 'nullable|string|in:approved,pending,rejected',
            'receipt_photo' => 'nullable|image|max:5120',
            'receipt_photos' => 'nullable|array',
            'receipt_photos.*' => 'nullable|image|max:5120',
        ]);

        $storedPhotoPaths = [];
        if ($request->hasFile('receipt_photos')) {
            foreach ($request->file('receipt_photos') as $file) {
                if ($file->isValid()) {
                    $storedPhotoPaths[] = $file->store('receipts', 'public');
                }
            }
        } elseif ($request->hasFile('receipt_photo')) {
            $storedPhotoPaths[] = $request->file('receipt_photo')->store('receipts', 'public');
        }

        $receiptPhotoPath = null;
        if (count($storedPhotoPaths) === 1) {
            $receiptPhotoPath = $storedPhotoPaths[0];
        } elseif (count($storedPhotoPaths) > 1) {
            $receiptPhotoPath = json_encode($storedPhotoPaths);
        }

        $prefixMap = [
            'pembelian_bahan' => 'PO-BB',
            'pembelian_aksesoris' => 'PO-ACC',
            'pembelian_alat' => 'PO-ALT',
            'biaya_operasional' => $isDriver ? 'KLM-DRV' : 'EXP',
            'pemasukan_lain' => 'REV-ADD',
        ];

        $prefix = $prefixMap[$validated['type']] ?? 'TRX';
        $period = date('Ym', strtotime($validated['transaction_date']));
        $count = FinanceTransaction::where('transaction_code', 'like', $prefix . '-' . $period . '-%')->count() + 1;
        $trxCode = sprintf('%s-%s-%03d', $prefix, $period, $count);

        $approvalStatus = $isDriver ? 'pending' : ($validated['approval_status'] ?? 'approved');
        $sourceRole = $validated['source_role'] ?? ($user ? $user->role : 'admin_toko');

        $trx = FinanceTransaction::create([
            'transaction_code' => $trxCode,
            'type' => $validated['type'],
            'category' => $validated['category'],
            'title' => $validated['title'],
            'amount' => $validated['amount'],
            'supplier_name' => $validated['supplier_name'] ?? null,
            'invoice_number' => $validated['invoice_number'] ?? null,
            'payment_method' => $validated['payment_method'] ?? 'Kas Tunai',
            'payment_status' => $validated['payment_status'] ?? 'Lunas',
            'approval_status' => $approvalStatus,
            'source_role' => $sourceRole,
            'vehicle_plate' => $validated['vehicle_plate'] ?? null,
            'transaction_date' => $validated['transaction_date'],
            'due_date' => $validated['due_date'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'receipt_photo_path' => $receiptPhotoPath,
            'user_id' => auth()->id(),
            'approved_by_user_id' => $approvalStatus === 'approved' ? auth()->id() : null,
            'approved_at' => $approvalStatus === 'approved' ? now() : null,
        ]);

        $logDesc = $isDriver
            ? 'Supir (' . ($user->name ?? 'Driver') . ') mengajukan klaim biaya armada ' . $trx->title . ' sebesar Rp ' . number_format($trx->amount, 0, ',', '.') . ' (Status: Menunggu Persetujuan)'
            : 'Mencatat transaksi ' . strtoupper(str_replace('_', ' ', $trx->type)) . ' (' . $trx->title . ') sebesar Rp ' . number_format($trx->amount, 0, ',', '.') . ' (' . $trx->payment_method . ')';

        ActivityLog::create([
            'user_id' => auth()->id(),
            'admin_name' => auth()->user()->name ?? 'Staff Operasional',
            'action_type' => $isDriver ? 'KLAIM_ARMADA_DRIVER' : 'TRANSAKSI_FINANCE',
            'target_user_name' => $trx->transaction_code,
            'description' => $logDesc,
            'created_at' => now(),
        ]);

        $msg = $isDriver
            ? '✅ Klaim biaya armada #' . $trx->transaction_code . ' berhasil diajukan! Menunggu persetujuan Tim Akuntan / Owner.'
            : '✅ Transaksi keuangan #' . $trx->transaction_code . ' (' . $trx->title . ') berhasil dicatat!';

        return redirect()->back()->with('message', $msg);
    }

    /**
     * Approve Finance Transaction (Owner & Admin Toko)
     */
    public function approveFinanceTransaction(Request $request, $id)
    {
        $trx = FinanceTransaction::findOrFail($id);
        $trx->update([
            'approval_status' => 'approved',
            'approved_by_user_id' => auth()->id(),
            'approved_at' => now(),
        ]);

        ActivityLog::create([
            'user_id' => auth()->id(),
            'admin_name' => auth()->user()->name ?? 'Owner & Akuntan',
            'action_type' => 'APPROVE_KLAIM_FINANCE',
            'target_user_name' => $trx->transaction_code,
            'description' => 'Menyetujui klaim ' . $trx->transaction_code . ' (' . $trx->title . ') sebesar Rp ' . number_format($trx->amount, 0, ',', '.') . ' untuk dibayarkan dari kas operasional.',
            'created_at' => now(),
        ]);

        return redirect()->back()->with('message', '✅ Klaim biaya #' . $trx->transaction_code . ' berhasil DISETUJUI dan langsung dibukukan ke Laporan Keuangan!');
    }

    /**
     * Reject Finance Transaction (Owner & Admin Toko)
     */
    public function rejectFinanceTransaction(Request $request, $id)
    {
        $trx = FinanceTransaction::findOrFail($id);
        $reason = $request->input('rejection_reason', 'Klaim ditolak oleh verifikator');
        
        $trx->update([
            'approval_status' => 'rejected',
            'rejection_reason' => $reason,
        ]);

        ActivityLog::create([
            'user_id' => auth()->id(),
            'admin_name' => auth()->user()->name ?? 'Owner & Akuntan',
            'action_type' => 'TOLAK_KLAIM_FINANCE',
            'target_user_name' => $trx->transaction_code,
            'description' => 'Menolak klaim ' . $trx->transaction_code . ' (' . $trx->title . '). Alasan: ' . $reason,
            'created_at' => now(),
        ]);

        return redirect()->back()->with('message', '⚠️ Klaim biaya #' . $trx->transaction_code . ' telah DITOLAK.');
    }

    /**
     * Settle COD Payment Handover from Driver to Cashier
     */
    public function settleCodHandover(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        $sisaCod = max(0, (float)($order->total_price - $order->paid_amount));

        $order->payment_status = 'Lunas';
        $order->paid_amount = $order->total_price;
        $order->save();

        ActivityLog::create([
            'user_id' => auth()->id(),
            'admin_name' => auth()->user()->name ?? 'Kasir & Finance',
            'action_type' => 'SETORAN_COD_DITERIMA',
            'target_user_name' => $order->spo_number,
            'description' => 'Konfirmasi serah terima uang kas pelunasan COD Surat Jalan Merah Order #' . $order->spo_number . ' sebesar Rp ' . number_format($sisaCod, 0, ',', '.') . ' (' . $order->customer_name . ') disetorkan ke Kasir.',
            'created_at' => now(),
        ]);

        return redirect()->back()->with('message', '🎉 Serah terima uang kas COD Order #' . $order->spo_number . ' (Rp ' . number_format($sisaCod, 0, ',', '.') . ') BERHASIL dikonfirmasi masuk ke Kas Toko!');
    }

    /**
     * Delete Financial Transaction
     */
    public function destroyFinanceTransaction(Request $request, $id)
    {
        $trx = FinanceTransaction::findOrFail($id);
        $code = $trx->transaction_code;
        $title = $trx->title;
        $amount = $trx->amount;
        $trx->delete();

        ActivityLog::create([
            'user_id' => auth()->id(),
            'admin_name' => auth()->user()->name ?? 'Owner & Akuntan',
            'action_type' => 'HAPUS_TRANSAKSI_FINANCE',
            'target_user_name' => $code,
            'description' => 'Menghapus transaksi keuangan ' . $code . ' (' . $title . ') sebesar Rp ' . number_format($amount, 0, ',', '.'),
            'created_at' => now(),
        ]);

        return redirect()->back()->with('message', 'Transaksi keuangan #' . $code . ' berhasil dihapus.');
    }

    /**
     * Helper validation to prevent order glass cut sizes from exceeding stock sheet glass dimensions
     */
    private function validateItemGlassDimensions(array $items)
    {
        foreach ($items as $it) {
            $l = (float)($it['length_cm'] ?? 0);
            $w = (float)($it['width_cm'] ?? 0);
            $glassType = trim($it['glass_type'] ?? '');

            if ($l <= 0 || $w <= 0) continue;

            $matchedSheet = null;
            if (!empty($glassType)) {
                $matchedSheet = SheetGlass::where('name', $glassType)
                    ->orWhere('name', 'like', '%' . $glassType . '%')
                    ->first();
            }

            if ($matchedSheet && (float)$matchedSheet->length_cm > 0 && (float)$matchedSheet->width_cm > 0) {
                $sheetLen = (float)$matchedSheet->length_cm;
                $sheetWid = (float)$matchedSheet->width_cm;
            } else {
                $maxLen = (float)SheetGlass::max('length_cm');
                $maxWid = (float)SheetGlass::max('width_cm');
                $sheetLen = $maxLen > 0 ? $maxLen : 366.0;
                $sheetWid = $maxWid > 0 ? $maxWid : 244.0;
            }

            $maxDim = max($sheetLen, $sheetWid);
            $minDim = min($sheetLen, $sheetWid);

            $itemMax = max($l, $w);
            $itemMin = min($l, $w);

            if ($itemMax > $maxDim || $itemMin > $minDim) {
                return "Ukuran potongan kaca {$l} x {$w} cm pada item '{$glassType}' melebihi batas lembaran kaca yang tersedia di gudang (Maksimal Lembaran: {$maxDim} x {$minDim} cm)!";
            }
        }
        return null;
    }
}

