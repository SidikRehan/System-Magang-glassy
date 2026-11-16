<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SheetGlass;
use App\Models\Supplier;
use App\Models\Accessory;
use App\Models\Tool;
use App\Models\ToolBorrow;
use App\Models\Supply;
use App\Models\SupplyUsage;
use App\Models\SupplyRestock;
use App\Models\FinanceTransaction;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class InventoryMasterController extends Controller
{
    // ==========================================
    // 1. KACA LEMBARAN (SHEET GLASSES)
    // ==========================================
    public function storeSheetGlass(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'length_cm' => 'required|numeric|min:1',
            'width_cm' => 'required|numeric|min:1',
            'thickness_mm' => 'required|integer|min:1',
            'buy_price' => 'nullable|numeric|min:0',
            'sell_price' => 'required|numeric|min:0',
            'rate_gm' => 'nullable|numeric|min:0',
            'rate_ht' => 'nullable|numeric|min:0',
            'rate_bv' => 'nullable|numeric|min:0',
            'rate_etsa' => 'nullable|numeric|min:0',
            'qty' => 'required|integer|min:0',
            'unit' => 'nullable|string|max:50',
            'supplier_name' => 'nullable|string|max:255',
            'supplier_phone' => 'nullable|string|max:50',
            'supplier_pic' => 'nullable|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        $nextId = (SheetGlass::max('id') ?? 0) + 1;
        $itemCode = 'BRG-' . str_pad($nextId, 3, '0', STR_PAD_LEFT);
        while (SheetGlass::where('item_code', $itemCode)->exists()) {
            $nextId++;
            $itemCode = 'BRG-' . str_pad($nextId, 3, '0', STR_PAD_LEFT);
        }
        $size = "{$validated['length_cm']} x {$validated['width_cm']} cm";
        $qty = (int) $validated['qty'];
        $status = $qty > 10 ? 'Aman' : ($qty > 0 ? 'Menipis' : 'Habis');

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('glasses', 'public');
        }

        SheetGlass::create([
            'item_code' => $itemCode,
            'name' => $validated['name'],
            'image_path' => $imagePath,
            'category' => $validated['category'],
            'length_cm' => $validated['length_cm'],
            'width_cm' => $validated['width_cm'],
            'size' => $size,
            'thickness_mm' => $validated['thickness_mm'],
            'buy_price' => $validated['buy_price'] ?? 0,
            'sell_price' => $validated['sell_price'],
            'rate_gm' => $validated['rate_gm'] ?? 10000,
            'rate_ht' => $validated['rate_ht'] ?? 1000,
            'rate_bv' => $validated['rate_bv'] ?? 15000,
            'rate_etsa' => $validated['rate_etsa'] ?? 50000,
            'qty' => $qty,
            'unit' => $validated['unit'] ?? 'Lembar',
            'supplier_name' => $validated['supplier_name'] ?? null,
            'supplier_phone' => $validated['supplier_phone'] ?? null,
            'supplier_pic' => $validated['supplier_pic'] ?? null,
            'last_restock' => now(),
            'status' => $status,
        ]);

        return redirect()->back()->with('success', "Katalog kaca {$validated['name']} berhasil ditambahkan ke database!");
    }

    public function updateSheetGlass(Request $request, $id)
    {
        $glass = SheetGlass::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'length_cm' => 'required|numeric|min:1',
            'width_cm' => 'required|numeric|min:1',
            'thickness_mm' => 'required|integer|min:1',
            'buy_price' => 'nullable|numeric|min:0',
            'sell_price' => 'required|numeric|min:0',
            'rate_gm' => 'nullable|numeric|min:0',
            'rate_ht' => 'nullable|numeric|min:0',
            'rate_bv' => 'nullable|numeric|min:0',
            'rate_etsa' => 'nullable|numeric|min:0',
            'qty' => 'required|integer|min:0',
            'unit' => 'nullable|string|max:50',
            'supplier_name' => 'nullable|string|max:255',
            'supplier_phone' => 'nullable|string|max:50',
            'supplier_pic' => 'nullable|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        $size = "{$validated['length_cm']} x {$validated['width_cm']} cm";
        $qty = (int) $validated['qty'];
        $status = $qty > 10 ? 'Aman' : ($qty > 0 ? 'Menipis' : 'Habis');

        $imagePath = $glass->image_path;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('glasses', 'public');
        }

        $glass->update([
            'name' => $validated['name'],
            'image_path' => $imagePath,
            'category' => $validated['category'],
            'length_cm' => $validated['length_cm'],
            'width_cm' => $validated['width_cm'],
            'size' => $size,
            'thickness_mm' => $validated['thickness_mm'],
            'buy_price' => $validated['buy_price'] ?? $glass->buy_price,
            'sell_price' => $validated['sell_price'],
            'rate_gm' => $validated['rate_gm'] ?? $glass->rate_gm,
            'rate_ht' => $validated['rate_ht'] ?? $glass->rate_ht,
            'rate_bv' => $validated['rate_bv'] ?? $glass->rate_bv,
            'rate_etsa' => $validated['rate_etsa'] ?? $glass->rate_etsa,
            'qty' => $qty,
            'unit' => $validated['unit'] ?? $glass->unit,
            'supplier_name' => $validated['supplier_name'] ?? $glass->supplier_name,
            'supplier_phone' => $validated['supplier_phone'] ?? $glass->supplier_phone,
            'supplier_pic' => $validated['supplier_pic'] ?? $glass->supplier_pic,
            'status' => $status,
        ]);

        return redirect()->back()->with('success', "Data kaca {$glass->name} berhasil diperbarui!");
    }

    public function restockSheetGlass(Request $request, $id)
    {
        $glass = SheetGlass::findOrFail($id);

        $validated = $request->validate([
            'add_qty' => 'required|integer|min:1',
            'buy_price' => 'nullable|numeric|min:0',
            'supplier_name' => 'nullable|string|max:255',
            'supplier_phone' => 'nullable|string|max:50',
            'supplier_pic' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:500',
        ]);

        $addQty = (int) $validated['add_qty'];
        $buyPrice = isset($validated['buy_price']) && (float) $validated['buy_price'] > 0
            ? (float) $validated['buy_price']
            : (float) ($glass->buy_price ?? 0);
        $totalCost = $addQty * $buyPrice;
        $supplierName = $validated['supplier_name'] ?? $glass->supplier_name ?? 'Supplier Kaca Lembaran';
        $supplierPhone = $validated['supplier_phone'] ?? $glass->supplier_phone ?? null;

        $glass->update([
            'status' => 'Pengajuan Proses Restock',
            'buy_price' => $buyPrice > 0 ? $buyPrice : $glass->buy_price,
            'supplier_name' => $supplierName,
            'supplier_phone' => $supplierPhone,
            'supplier_pic' => $validated['supplier_pic'] ?? $glass->supplier_pic,
        ]);

        $prefix = 'PO-BB';
        $period = date('Ym');
        $count = FinanceTransaction::where('transaction_code', 'like', $prefix . '-' . $period . '-%')->count() + 1;
        $trxCode = sprintf('%s-%s-%03d', $prefix, $period, $count);
        while (FinanceTransaction::where('transaction_code', $trxCode)->exists()) {
            $count++;
            $trxCode = sprintf('%s-%s-%03d', $prefix, $period, $count);
        }

        $metaTag = "[RESTOCK_GLASS_ID:{$glass->id}|QTY:{$addQty}|CODE:{$glass->item_code}|PHONE:" . ($supplierPhone ?? '') . "]";
        $cleanNotes = !empty($validated['notes']) ? trim($validated['notes']) : 'Pengajuan restok bahan kaca produksi ke Finance untuk disetujui dan dipesan ke supplier.';

        FinanceTransaction::create([
            'transaction_code' => $trxCode,
            'type' => 'pembelian_bahan',
            'category' => 'Bahan Baku Kaca Lembaran',
            'title' => 'Pengajuan Restok Bahan Produksi: ' . $glass->name . ' (+' . $addQty . ' ' . ($glass->unit ?? 'Lembar') . ')',
            'amount' => $totalCost,
            'supplier_name' => $supplierName,
            'payment_method' => 'Menunggu Realisasi Finance',
            'payment_status' => 'Tempo',
            'approval_status' => 'pending',
            'source_role' => Auth::user()?->role ?? 'admin_toko',
            'transaction_date' => now()->toDateString(),
            'notes' => "{$metaTag} {$cleanNotes} (Ukuran: {$glass->size} • Sisa Stok: {$glass->qty} " . ($glass->unit ?? 'Lembar') . " • Estimasi @ Rp " . number_format($buyPrice, 0, ',', '.') . ")",
            'user_id' => Auth::id(),
        ]);

        return redirect()->back()->with('success', "Pengajuan restok bahan produksi {$glass->name} (+{$addQty} {$glass->unit}) berhasil dikirim ke Finance untuk disetujui & dipesan!");
    }

    public function destroySheetGlass($id)
    {
        $glass = SheetGlass::findOrFail($id);
        $name = $glass->name;
        $glass->delete();

        return redirect()->back()->with('success', "Kaca {$name} berhasil dihapus dari database.");
    }

    public function requestRestockSheetGlass($id)
    {
        $glass = SheetGlass::findOrFail($id);
        $glass->update(['status' => 'Pengajuan Proses Restock']);

        // Cek apakah sudah ada pengajuan pending untuk kaca ini di FinanceTransaction
        $existingPending = FinanceTransaction::where('approval_status', 'pending')
            ->where(function ($q) use ($glass) {
                $q->where('notes', 'like', "%[RESTOCK_GLASS_ID:{$glass->id}|%")
                  ->orWhere('title', 'like', "%{$glass->name}%");
            })
            ->first();

        if (!$existingPending) {
            $addQty = 10;
            $buyPrice = (float) ($glass->buy_price ?? 0);
            $totalCost = $addQty * $buyPrice;
            $supplierName = $glass->supplier_name ?? 'PT Asahimas Flat Glass Tbk';
            $supplierPhone = $glass->supplier_phone ?? null;

            $prefix = 'PO-BB';
            $period = date('Ym');
            $count = FinanceTransaction::where('transaction_code', 'like', $prefix . '-' . $period . '-%')->count() + 1;
            $trxCode = sprintf('%s-%s-%03d', $prefix, $period, $count);
            while (FinanceTransaction::where('transaction_code', $trxCode)->exists()) {
                $count++;
                $trxCode = sprintf('%s-%s-%03d', $prefix, $period, $count);
            }

            $metaTag = "[RESTOCK_GLASS_ID:{$glass->id}|QTY:{$addQty}|CODE:{$glass->item_code}|PHONE:" . ($supplierPhone ?? '') . "]";
            FinanceTransaction::create([
                'transaction_code' => $trxCode,
                'type' => 'pembelian_bahan',
                'category' => 'Bahan Baku Kaca Lembaran',
                'title' => 'Pengajuan Restok Bahan Produksi: ' . $glass->name . ' (+' . $addQty . ' ' . ($glass->unit ?? 'Lembar') . ')',
                'amount' => $totalCost,
                'supplier_name' => $supplierName,
                'payment_method' => 'Menunggu Realisasi Finance',
                'payment_status' => 'Tempo',
                'approval_status' => 'pending',
                'source_role' => Auth::user()?->role ?? 'admin_gudang',
                'transaction_date' => now()->toDateString(),
                'notes' => "{$metaTag} Pengajuan restok stok kaca habis/menipis oleh Admin Gudang ke bagian Finance. (Ukuran: {$glass->size} • Sisa Stok: {$glass->qty} " . ($glass->unit ?? 'Lembar') . ")",
                'user_id' => Auth::id(),
            ]);
        }

        return redirect()->back()->with('success', "Pengajuan restok kaca {$glass->name} berhasil dikirim ke bagian Finance untuk dipesan ke supplier!");
    }

    public function cancelRequestRestockSheetGlass($id)
    {
        $glass = SheetGlass::findOrFail($id);
        $status = $glass->qty > 10 ? 'Aman' : ($glass->qty > 0 ? 'Menipis' : 'Habis');
        $glass->update(['status' => $status]);

        FinanceTransaction::where('approval_status', 'pending')
            ->where('notes', 'like', "%[RESTOCK_GLASS_ID:{$glass->id}|%")
            ->delete();

        return redirect()->back()->with('success', "Pengajuan restok {$glass->name} dibatalkan.");
    }

    // ==========================================
    // 2. MITRA SUPPLIER (SUPPLIERS)
    // ==========================================
    public function storeSupplier(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'phone' => 'required|string|max:50',
            'pic' => 'required|string|max:255',
            'address' => 'nullable|string|max:500',
            'status' => 'nullable|string|max:50',
        ]);

        Supplier::create([
            'name' => $validated['name'],
            'category' => $validated['category'],
            'phone' => $validated['phone'],
            'pic' => $validated['pic'],
            'address' => $validated['address'] ?? null,
            'status' => $validated['status'] ?? 'Mitra Aktif',
        ]);

        return redirect()->back()->with('success', "Mitra supplier {$validated['name']} berhasil ditambahkan!");
    }

    public function updateSupplier(Request $request, $id)
    {
        $supplier = Supplier::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'phone' => 'required|string|max:50',
            'pic' => 'required|string|max:255',
            'address' => 'nullable|string|max:500',
            'status' => 'nullable|string|max:50',
        ]);

        $supplier->update($validated);

        return redirect()->back()->with('success', "Data supplier {$supplier->name} berhasil diperbarui!");
    }

    public function destroySupplier($id)
    {
        $supplier = Supplier::findOrFail($id);
        $name = $supplier->name;
        $supplier->delete();

        return redirect()->back()->with('success', "Supplier {$name} berhasil dihapus.");
    }

    // ==========================================
    // 3. AKSESORIS (ACCESSORIES)
    // ==========================================
    public function storeAccessory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'buy_price' => 'nullable|numeric|min:0',
            'sell_price' => 'required|numeric|min:0',
            'qty' => 'required|integer|min:0',
            'unit' => 'nullable|string|max:50',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        $nextId = (Accessory::max('id') ?? 0) + 1;
        $accCode = 'ACC-' . str_pad($nextId, 3, '0', STR_PAD_LEFT);
        while (Accessory::where('acc_code', $accCode)->exists()) {
            $nextId++;
            $accCode = 'ACC-' . str_pad($nextId, 3, '0', STR_PAD_LEFT);
        }
        $qty = (int) $validated['qty'];
        $status = $qty > 20 ? 'Aman' : ($qty > 0 ? 'Menipis' : 'Habis');

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('accessories', 'public');
        }

        Accessory::create([
            'acc_code' => $accCode,
            'name' => $validated['name'],
            'image_path' => $imagePath,
            'buy_price' => $validated['buy_price'] ?? 0,
            'sell_price' => $validated['sell_price'],
            'qty' => $qty,
            'unit' => $validated['unit'] ?? 'Pcs',
            'status' => $status,
        ]);

        return redirect()->back()->with('success', "Aksesoris {$validated['name']} berhasil ditambahkan!");
    }

    public function updateAccessory(Request $request, $id)
    {
        $acc = Accessory::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'buy_price' => 'nullable|numeric|min:0',
            'sell_price' => 'required|numeric|min:0',
            'qty' => 'required|integer|min:0',
            'unit' => 'nullable|string|max:50',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        $qty = (int) $validated['qty'];
        $status = $qty > 20 ? 'Aman' : ($qty > 0 ? 'Menipis' : 'Habis');

        $imagePath = $acc->image_path;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('accessories', 'public');
        }

        $acc->update([
            'name' => $validated['name'],
            'image_path' => $imagePath,
            'buy_price' => $validated['buy_price'] ?? $acc->buy_price,
            'sell_price' => $validated['sell_price'],
            'qty' => $qty,
            'unit' => $validated['unit'] ?? $acc->unit,
            'status' => $status,
        ]);

        return redirect()->back()->with('success', "Data aksesoris {$acc->name} berhasil diperbarui!");
    }

    public function restockAccessory(Request $request, $id)
    {
        return $this->requestRestockAccessory($request, $id);
    }

    public function requestRestockAccessory(Request $request, $id)
    {
        $acc = Accessory::findOrFail($id);

        $validated = $request->validate([
            'add_qty' => 'nullable|integer|min:1',
            'buy_price' => 'nullable|numeric|min:0',
            'supplier_name' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:500',
        ]);

        $addQty = isset($validated['add_qty']) && (int) $validated['add_qty'] > 0 ? (int) $validated['add_qty'] : 10;
        $unitBuyPrice = isset($validated['buy_price']) && (float) $validated['buy_price'] > 0
            ? (float) $validated['buy_price']
            : (float) ($acc->buy_price ?? 0);
        $estimatedTotal = $addQty * $unitBuyPrice;

        $acc->update([
            'status' => 'Pengajuan Restock',
            'buy_price' => $unitBuyPrice > 0 ? $unitBuyPrice : $acc->buy_price,
        ]);

        $prefix = 'PO-ACC';
        $period = date('Ym');
        $count = FinanceTransaction::where('transaction_code', 'like', $prefix . '-' . $period . '-%')->count() + 1;
        $trxCode = sprintf('%s-%s-%03d', $prefix, $period, $count);
        while (FinanceTransaction::where('transaction_code', $trxCode)->exists()) {
            $count++;
            $trxCode = sprintf('%s-%s-%03d', $prefix, $period, $count);
        }

        $metaTag = "[RESTOCK_ACC_ID:{$acc->id}|QTY:{$addQty}|CODE:{$acc->acc_code}]";
        $cleanNotes = !empty($validated['notes']) ? trim($validated['notes']) : 'Pengajuan restok stok aksesoris konsumen oleh Admin Toko.';

        FinanceTransaction::create([
            'transaction_code' => $trxCode,
            'type' => 'pembelian_aksesoris',
            'category' => 'Restock Aksesoris & Hardware',
            'title' => "Pengajuan Restok Aksesoris: {$acc->name} (+{$addQty} " . ($acc->unit ?? 'Pcs') . ")",
            'amount' => $estimatedTotal,
            'supplier_name' => $validated['supplier_name'] ?? 'Toko Hardware / Supplier Aksesoris',
            'payment_method' => 'Menunggu Realisasi Finance',
            'payment_status' => 'Tempo',
            'approval_status' => 'pending',
            'source_role' => Auth::user()?->role ?? 'admin_toko',
            'transaction_date' => now()->toDateString(),
            'notes' => "{$metaTag} {$cleanNotes} (Stok saat ini: {$acc->qty} " . ($acc->unit ?? 'Pcs') . " • Estimasi @ Rp " . number_format($unitBuyPrice, 0, ',', '.') . ")",
            'user_id' => Auth::id(),
        ]);

        return redirect()->back()->with('success', "Pengajuan restok aksesoris {$acc->name} (+{$addQty} " . ($acc->unit ?? 'Pcs') . ") berhasil dikirim ke Finance untuk disetujui & dibayarkan!");
    }

    public function destroyAccessory($id)
    {
        $acc = Accessory::findOrFail($id);
        $name = $acc->name;
        $acc->delete();

        return redirect()->back()->with('success', "Aksesoris {$name} berhasil dihapus.");
    }

    // ==========================================
    // 4. ALAT & MESIN (TOOLS & BORROWS)
    // ==========================================
    public function storeTool(Request $request)
    {
        if ($request->user()?->role === 'admin_toko') {
            return redirect()->back()->with('error', 'Admin toko hanya memiliki akses lihat. Pengelolaan alat dilakukan oleh Admin Gudang.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'condition' => 'nullable|string|max:50',
            'location' => 'nullable|string|max:100',
            'total_qty' => 'required|integer|min:1',
            'estimated_price' => 'nullable|numeric|min:0',
            'supplier_name' => 'nullable|string|max:255',
            'supplier_phone' => 'nullable|string|max:50',
            'notes' => 'nullable|string|max:500',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        $nextId = (Tool::max('id') ?? 0) + 1;
        $toolCode = 'ALT-' . str_pad($nextId, 3, '0', STR_PAD_LEFT);
        while (Tool::where('tool_code', $toolCode)->exists()) {
            $nextId++;
            $toolCode = 'ALT-' . str_pad($nextId, 3, '0', STR_PAD_LEFT);
        }
        $requestedQty = (int) $validated['total_qty'];
        $unitPrice = isset($validated['estimated_price']) && (float) $validated['estimated_price'] > 0
            ? (float) $validated['estimated_price']
            : 250000;
        $estimatedTotal = $requestedQty * $unitPrice;
        $supplierName = !empty($validated['supplier_name']) ? $validated['supplier_name'] : 'Toko Teknik & Mesin Industri';
        $supplierPhone = !empty($validated['supplier_phone']) ? $validated['supplier_phone'] : null;

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('tools', 'public');
        }

        $tool = Tool::create([
            'tool_code' => $toolCode,
            'name' => $validated['name'],
            'image_path' => $imagePath,
            'category' => $validated['category'],
            'condition' => 'Pengajuan Pembelian',
            'location' => $validated['location'] ?? 'Gudang Utama',
            'total_qty' => 0,
            'available_qty' => 0,
            'notes' => "[Pengajuan Pembelian {$requestedQty} Unit ke Finance] " . ($validated['notes'] ?? ''),
        ]);

        $prefix = 'PO-ALT';
        $period = date('Ym');
        $count = FinanceTransaction::where('transaction_code', 'like', $prefix . '-' . $period . '-%')->count() + 1;
        $trxCode = sprintf('%s-%s-%03d', $prefix, $period, $count);
        while (FinanceTransaction::where('transaction_code', $trxCode)->exists()) {
            $count++;
            $trxCode = sprintf('%s-%s-%03d', $prefix, $period, $count);
        }

        $metaTag = "[RESTOCK_TOOL_ID:{$tool->id}|QTY:{$requestedQty}|CODE:{$tool->tool_code}|PHONE:" . ($supplierPhone ?? '') . "]";
        $cleanNotes = !empty($validated['notes']) ? trim($validated['notes']) : 'Pengajuan pembelian alat penunjang / mesin baru.';

        FinanceTransaction::create([
            'transaction_code' => $trxCode,
            'type' => 'pembelian_alat',
            'category' => 'Alat & Mesin Produksi',
            'title' => "Pengajuan Pembelian Alat Baru: {$tool->name} (+{$requestedQty} Unit)",
            'amount' => $estimatedTotal,
            'supplier_name' => $supplierName,
            'payment_method' => 'Menunggu Realisasi Finance',
            'payment_status' => 'Tempo',
            'approval_status' => 'pending',
            'source_role' => Auth::user()?->role ?? 'admin_gudang',
            'transaction_date' => now()->toDateString(),
            'notes' => "{$metaTag} {$cleanNotes} (Kategori: {$tool->category} • Lokasi: {$tool->location} • Estimasi @ Rp " . number_format($unitPrice, 0, ',', '.') . ")",
            'user_id' => Auth::id(),
        ]);

        return redirect()->back()->with('success', "Pengajuan pembelian alat baru {$validated['name']} (+{$requestedQty} Unit) berhasil dikirim ke bagian Finance untuk disetujui & dipesan!");
    }

    public function updateTool(Request $request, $id)
    {
        if ($request->user()?->role === 'admin_toko') {
            return redirect()->back()->with('error', 'Admin toko hanya memiliki akses lihat. Pengelolaan alat dilakukan oleh Admin Gudang.');
        }

        $tool = Tool::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'condition' => 'nullable|string|max:50',
            'damaged_qty' => 'nullable|integer|min:0',
            'lost_qty' => 'nullable|integer|min:0',
            'location' => 'nullable|string|max:100',
            'total_qty' => 'required|integer|min:1',
            'notes' => 'nullable|string|max:500',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        $condition = $validated['condition'] ?? $tool->condition ?? 'Baik';
        $totalQty = (int) $validated['total_qty'];

        if ($condition === 'Baik' || $condition === 'Bagus') {
            $damagedQty = 0;
            $lostQty = 0;
        } elseif ($condition === 'Hilang') {
            $damagedQty = isset($validated['damaged_qty']) ? min((int) $validated['damaged_qty'], $totalQty) : (int) ($tool->damaged_qty ?? 0);
            $requestedLost = isset($validated['lost_qty']) ? (int) $validated['lost_qty'] : max(1, (int) ($tool->lost_qty ?? 1));
            $lostQty = min(max(1, $requestedLost), max(0, $totalQty - $damagedQty));
        } else {
            $requestedDamaged = isset($validated['damaged_qty']) ? (int) $validated['damaged_qty'] : 1;
            $damagedQty = min(max(1, $requestedDamaged), $totalQty);
            $lostQty = isset($validated['lost_qty']) ? min((int) $validated['lost_qty'], max(0, $totalQty - $damagedQty)) : (int) ($tool->lost_qty ?? 0);
        }

        $borrowedQty = ToolBorrow::where('tool_id', $tool->id)->where('status', 'Dipinjam')->sum('qty');
        $newAvailable = max(0, $totalQty - $borrowedQty - $damagedQty - $lostQty);

        $imagePath = $tool->image_path;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('tools', 'public');
        }

        $tool->update([
            'name' => $validated['name'],
            'image_path' => $imagePath,
            'category' => $validated['category'] ?? $tool->category ?? 'Mesin Bor & Potong',
            'condition' => $condition,
            'damaged_qty' => $damagedQty,
            'lost_qty' => $lostQty,
            'location' => $validated['location'] ?? $tool->location,
            'total_qty' => $totalQty,
            'available_qty' => $newAvailable,
            'notes' => $validated['notes'] ?? $tool->notes,
        ]);

        return redirect()->back()->with('success', "Data alat {$tool->name} berhasil diperbarui!");
    }

    public function borrowTool(Request $request, $id)
    {
        if ($request->user()?->role === 'admin_toko') {
            return redirect()->back()->with('error', 'Admin toko hanya memiliki akses lihat. Pencatatan peminjaman alat dilakukan oleh Admin Gudang.');
        }

        $validated = $request->validate([
            'borrower_name' => 'required|string|max:255',
            'qty' => 'nullable|integer|min:1',
            'notes' => 'nullable|string|max:500',
            'items' => 'nullable|array',
        ]);

        $items = $request->input('items', []);
        if (empty($items)) {
            $mainTool = Tool::findOrFail($id);
            $items = [['tool_id' => $mainTool->id, 'qty' => (int)($validated['qty'] ?? 1)]];
        }

        DB::transaction(function () use ($validated, $items) {
            foreach ($items as $it) {
                $toolId = $it['tool_id'] ?? null;
                $tQty = (int)($it['qty'] ?? 1);
                if (!$toolId || $tQty < 1) continue;

                $tool = Tool::findOrFail($toolId);
                ToolBorrow::create([
                    'tool_id' => $tool->id,
                    'borrower_name' => $validated['borrower_name'],
                    'borrow_date' => now(),
                    'qty' => $tQty,
                    'status' => 'Dipinjam',
                    'notes' => $validated['notes'] ?? null,
                ]);

                $tool->decrement('available_qty', $tQty);
            }
        });

        return redirect()->back()->with('success', "Peminjaman alat oleh {$validated['borrower_name']} berhasil dicatat!");
    }

    public function returnTool(Request $request, $borrowId)
    {
        if ($request->user()?->role === 'admin_toko') {
            return redirect()->back()->with('error', 'Admin toko hanya memiliki akses lihat. Pengembalian alat dikelola oleh Admin Gudang.');
        }

        $borrow = ToolBorrow::findOrFail($borrowId);

        if ($borrow->status === 'Dikembalikan') {
            return redirect()->back()->with('error', 'Alat ini sudah dikembalikan sebelumnya.');
        }

        $validated = $request->validate([
            'return_condition' => 'nullable|string|in:Baik,Perlu Servis,Rusak,Hilang',
            'damaged_qty' => 'nullable|integer|min:0',
            'lost_qty' => 'nullable|integer|min:0',
            'return_notes' => 'nullable|string|max:1000',
        ]);

        $borrowedQty = max(1, (int) $borrow->qty);
        $returnCondition = $validated['return_condition'] ?? 'Baik';

        $damagedQty = isset($validated['damaged_qty']) ? min((int) $validated['damaged_qty'], $borrowedQty) : 0;
        $lostQty = isset($validated['lost_qty']) ? min((int) $validated['lost_qty'], max(0, $borrowedQty - $damagedQty)) : 0;

        if (($returnCondition === 'Rusak' || $returnCondition === 'Perlu Servis') && $damagedQty <= 0 && $lostQty <= 0) {
            $damagedQty = $borrowedQty;
        } elseif ($returnCondition === 'Hilang' && $lostQty <= 0 && $damagedQty <= 0) {
            $lostQty = $borrowedQty;
        } elseif ($returnCondition === 'Baik' && $damagedQty <= 0 && $lostQty <= 0) {
            $damagedQty = 0;
            $lostQty = 0;
        }

        if ($damagedQty > 0 && $lostQty === 0 && $returnCondition === 'Baik') {
            $returnCondition = 'Rusak';
        } elseif ($lostQty > 0 && $damagedQty === 0 && $returnCondition === 'Baik') {
            $returnCondition = 'Hilang';
        }

        $goodReturnedQty = max(0, $borrowedQty - $damagedQty - $lostQty);
        $returnNotes = !empty($validated['return_notes']) ? trim($validated['return_notes']) : null;

        DB::transaction(function () use ($borrow, $returnCondition, $damagedQty, $lostQty, $goodReturnedQty, $returnNotes) {
            $borrow->update([
                'return_date' => now(),
                'status' => 'Dikembalikan',
                'return_condition' => $returnCondition,
                'damaged_qty' => $damagedQty,
                'lost_qty' => $lostQty,
                'return_notes' => $returnNotes,
            ]);

            $tool = $borrow->tool;
            if ($tool) {
                $newDamagedTotal = min((int) $tool->total_qty, (int) ($tool->damaged_qty ?? 0) + $damagedQty);
                $newLostTotal = min(max(0, (int) $tool->total_qty - $newDamagedTotal), (int) ($tool->lost_qty ?? 0) + $lostQty);

                $activeBorrowedQty = ToolBorrow::where('tool_id', $tool->id)
                    ->where('status', 'Dipinjam')
                    ->where('id', '!=', $borrow->id)
                    ->sum('qty');

                $newAvailable = max(0, (int) $tool->total_qty - (int) $activeBorrowedQty - $newDamagedTotal - $newLostTotal);

                $newToolCondition = $tool->condition;
                if ($damagedQty > 0) {
                    $newToolCondition = $returnCondition === 'Perlu Servis' ? 'Perlu Servis' : 'Rusak';
                } elseif ($lostQty > 0 && $newDamagedTotal === 0) {
                    $newToolCondition = 'Hilang';
                }

                $updatedToolNotes = $tool->notes;
                if ($damagedQty > 0 || $lostQty > 0 || !empty($returnNotes)) {
                    $dateStr = now()->format('Y-m-d');
                    $statusParts = [];
                    if ($damagedQty > 0) {
                        $statusParts[] = "{$returnCondition}: {$damagedQty} unit";
                    }
                    if ($lostQty > 0) {
                        $statusParts[] = "Hilang: {$lostQty} unit";
                    }
                    if (empty($statusParts)) {
                        $statusParts[] = "Kondisi: {$returnCondition}";
                    }
                    $summary = implode(', ', $statusParts);
                    $noteDetail = $returnNotes ? " — {$returnNotes}" : '';
                    $updatedToolNotes = "[Pengembalian {$dateStr} oleh {$borrow->borrower_name}] {$summary}{$noteDetail}";
                }

                $tool->update([
                    'available_qty' => $newAvailable,
                    'damaged_qty' => $newDamagedTotal,
                    'lost_qty' => $newLostTotal,
                    'condition' => $newToolCondition,
                    'notes' => $updatedToolNotes,
                ]);
            }
        });

        $extraMsg = '';
        if ($damagedQty > 0 || $lostQty > 0) {
            $extraMsg = " Kondisi alat otomatis diperbarui ({$returnCondition}) dan tercatat di Log Perbaikan & Hilang.";
        }

        return redirect()->back()->with('success', "Pengembalian alat {$borrow->tool->name} berhasil diverifikasi!{$extraMsg}");
    }

    public function repairTool(Request $request, $id)
    {
        if ($request->user()?->role === 'admin_toko') {
            return redirect()->back()->with('error', 'Admin toko hanya memiliki akses lihat. Perbaikan alat dikelola oleh Admin Gudang.');
        }

        $tool = Tool::findOrFail($id);

        $validated = $request->validate([
            'condition' => 'required|string|in:Baik,Perlu Servis,Rusak',
            'notes' => 'nullable|string|max:500',
        ]);

        $newCondition = $validated['condition'];
        $updateData = [
            'condition' => $newCondition,
            'notes' => $validated['notes'] ?? $tool->notes,
        ];

        if ($newCondition === 'Baik') {
            $borrowedQty = ToolBorrow::where('tool_id', $tool->id)->where('status', 'Dipinjam')->sum('qty');
            $lostQty = (int) ($tool->lost_qty ?? 0);
            $updateData['damaged_qty'] = 0;
            $updateData['available_qty'] = max(0, (int) $tool->total_qty - (int) $borrowedQty - $lostQty);
        }

        $tool->update($updateData);

        return redirect()->back()->with('success', "Status kondisi {$tool->name} diperbarui menjadi {$validated['condition']}!");
    }

    public function destroyTool(Request $request, $id)
    {
        if ($request->user()?->role === 'admin_toko') {
            return redirect()->back()->with('error', 'Admin toko hanya memiliki akses lihat. Pengapusan alat dikelola oleh Admin Gudang.');
        }

        $tool = Tool::findOrFail($id);
        $name = $tool->name;
        $tool->delete();

        return redirect()->back()->with('success', "Alat {$name} berhasil dihapus.");
    }

    // ==========================================
    // 5. PERLENGKAPAN & KONSUMABEL (SUPPLIES)
    // ==========================================
    public function storeSupply(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'qty' => 'required|integer|min:0',
            'unit' => 'nullable|string|max:50',
            'min_stock' => 'nullable|integer|min:1',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        $nextId = (Supply::max('id') ?? 0) + 1;
        $itemCode = 'SUP-' . str_pad($nextId, 3, '0', STR_PAD_LEFT);
        while (Supply::where('item_code', $itemCode)->exists()) {
            $nextId++;
            $itemCode = 'SUP-' . str_pad($nextId, 3, '0', STR_PAD_LEFT);
        }
        $qty = (int) $validated['qty'];
        $min = (int) ($validated['min_stock'] ?? 5);
        $status = $qty > $min ? 'Aman' : ($qty > 0 ? 'Menipis' : 'Habis');

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('supplies', 'public');
        }

        Supply::create([
            'item_code' => $itemCode,
            'name' => $validated['name'],
            'image_path' => $imagePath,
            'category' => $validated['category'],
            'qty' => $qty,
            'unit' => $validated['unit'] ?? 'Pcs',
            'min_stock' => $min,
            'status' => $status,
        ]);

        return redirect()->back()->with('success', "Perlengkapan {$validated['name']} berhasil ditambahkan!");
    }

    public function updateSupply(Request $request, $id)
    {
        $supply = Supply::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'qty' => 'required|integer|min:0',
            'unit' => 'nullable|string|max:50',
            'min_stock' => 'nullable|integer|min:1',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        $qty = (int) $validated['qty'];
        $min = (int) ($validated['min_stock'] ?? $supply->min_stock);
        $status = $qty > $min ? 'Aman' : ($qty > 0 ? 'Menipis' : 'Habis');

        $imagePath = $supply->image_path;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('supplies', 'public');
        }

        $supply->update([
            'name' => $validated['name'],
            'image_path' => $imagePath,
            'category' => $validated['category'],
            'qty' => $qty,
            'unit' => $validated['unit'] ?? $supply->unit,
            'min_stock' => $min,
            'status' => $status,
        ]);

        return redirect()->back()->with('success', "Data perlengkapan {$supply->name} berhasil diperbarui!");
    }

    public function useSupply(Request $request, $id)
    {
        $supply = Supply::findOrFail($id);

        $validated = $request->validate([
            'user_name' => 'required|string|max:255',
            'qty' => 'required|integer|min:1|max:' . $supply->qty,
            'division' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($supply, $validated) {
            SupplyUsage::create([
                'supply_id' => $supply->id,
                'user_name' => $validated['user_name'],
                'qty' => $validated['qty'],
                'division' => $validated['division'] ?? 'HT (Potong)',
                'notes' => $validated['notes'] ?? null,
            ]);

            $newQty = max(0, $supply->qty - (int) $validated['qty']);
            $status = $newQty > $supply->min_stock ? 'Aman' : ($newQty > 0 ? 'Menipis' : 'Habis');

            $supply->update([
                'qty' => $newQty,
                'status' => $status,
            ]);
        });

        return redirect()->back()->with('success', "Penggunaan {$validated['qty']} {$supply->unit} {$supply->name} berhasil dicatat!");
    }

    public function batchUseSupplies(Request $request)
    {
        if ($request->user()?->role === 'admin_toko') {
            return redirect()->back()->with('error', 'Admin toko hanya memiliki akses lihat. Catat pemakaian dilakukan oleh Admin Gudang.');
        }

        $validated = $request->validate([
            'user_name' => 'required|string|max:255',
            'division' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:500',
            'items' => 'required|array|min:1',
            'items.*.supply_id' => 'required|exists:supplies,id',
            'items.*.qty' => 'required|integer|min:1',
        ]);

        DB::transaction(function () use ($validated) {
            foreach ($validated['items'] as $item) {
                $supply = Supply::findOrFail($item['supply_id']);
                $qtyToUse = (int) $item['qty'];

                if ($qtyToUse > $supply->qty) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'items' => ["Stok {$supply->name} tidak mencukupi! Sisa stok: {$supply->qty}"]
                    ]);
                }

                SupplyUsage::create([
                    'supply_id' => $supply->id,
                    'user_name' => $validated['user_name'],
                    'qty' => $qtyToUse,
                    'division' => $validated['division'] ?? 'HT (Potong)',
                    'notes' => $validated['notes'] ?? null,
                ]);

                $newQty = max(0, $supply->qty - $qtyToUse);
                $status = $newQty > $supply->min_stock ? 'Aman' : ($newQty > 0 ? 'Menipis' : 'Habis');

                $supply->update([
                    'qty' => $newQty,
                    'status' => $status,
                ]);
            }
        });

        return redirect()->back()->with('success', "Log pemakaian " . count($validated['items']) . " item perlengkapan berhasil dicatat!");
    }

    public function requestRestockSupply(Request $request, $id)
    {
        $supply = Supply::findOrFail($id);

        $validated = $request->validate([
            'request_qty' => 'required|integer|min:1',
            'estimated_price' => 'nullable|numeric|min:0',
            'supplier_name' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:500',
        ]);

        $reqQty = (int) $validated['request_qty'];
        $unitPrice = isset($validated['estimated_price']) && (float) $validated['estimated_price'] > 0
            ? (float) $validated['estimated_price']
            : 50000;
        $estimatedTotal = $reqQty * $unitPrice;
        $supplierName = !empty($validated['supplier_name']) ? $validated['supplier_name'] : 'Toko Teknik & Sparepart Pabrik';

        $restock = SupplyRestock::create([
            'supply_id' => $supply->id,
            'request_qty' => $reqQty,
            'notes' => $validated['notes'] ?? null,
            'status' => 'Menunggu Persetujuan Finance',
        ]);

        $prefix = 'PO-ALT';
        $period = date('Ym');
        $count = FinanceTransaction::where('transaction_code', 'like', $prefix . '-' . $period . '-%')->count() + 1;
        $trxCode = sprintf('%s-%s-%03d', $prefix, $period, $count);
        while (FinanceTransaction::where('transaction_code', $trxCode)->exists()) {
            $count++;
            $trxCode = sprintf('%s-%s-%03d', $prefix, $period, $count);
        }

        $metaTag = "[RESTOCK_SUPPLY_ID:{$supply->id}|QTY:{$reqQty}|REQ_ID:{$restock->id}|CODE:{$supply->item_code}]";
        $cleanNotes = !empty($validated['notes']) ? trim($validated['notes']) : 'Pengajuan pembelian sparepart / perlengkapan produksi.';

        FinanceTransaction::create([
            'transaction_code' => $trxCode,
            'type' => 'pembelian_alat',
            'category' => 'Sparepart & Perlengkapan Produksi',
            'title' => "Pengajuan Sparepart/Inventaris: {$supply->name} (+{$reqQty} " . ($supply->unit ?? 'Pcs') . ")",
            'amount' => $estimatedTotal,
            'supplier_name' => $supplierName,
            'payment_method' => 'Menunggu Realisasi Finance',
            'payment_status' => 'Tempo',
            'approval_status' => 'pending',
            'source_role' => Auth::user()?->role ?? 'admin_toko',
            'transaction_date' => now()->toDateString(),
            'notes' => "{$metaTag} {$cleanNotes} (Sisa Stok Gudang: {$supply->qty} " . ($supply->unit ?? 'Pcs') . ")",
            'user_id' => Auth::id(),
        ]);

        return redirect()->back()->with('success', "Pengajuan pembelian sparepart/perlengkapan {$supply->name} (+{$reqQty} {$supply->unit}) berhasil dikirim ke Finance untuk disetujui & dipesan!");
    }

    public function approveRestockSupply(Request $request, $restockId)
    {
        $restock = SupplyRestock::findOrFail($restockId);

        if ($restock->status === 'Selesai Restok') {
            return redirect()->back()->with('error', 'Permintaan ini sudah selesai diproses.');
        }

        $supply = $restock->supply;
        $reqQty = (int) $restock->request_qty;

        // Jika masih berstatus Menunggu Persetujuan Admin Toko, teruskan ke Finance jika belum ada di FinanceTransaction
        $existingPendingTrx = FinanceTransaction::where('notes', 'like', "%[RESTOCK_SUPPLY_ID:{$supply->id}|QTY:{$reqQty}|REQ_ID:{$restock->id}%")->first();
        if (!$existingPendingTrx && !in_array(Auth::user()?->role, ['owner', 'finance', 'admin_finance'])) {
            $restock->update(['status' => 'Menunggu Persetujuan Finance']);

            $prefix = 'PO-ALT';
            $period = date('Ym');
            $count = FinanceTransaction::where('transaction_code', 'like', $prefix . '-' . $period . '-%')->count() + 1;
            $trxCode = sprintf('%s-%s-%03d', $prefix, $period, $count);
            while (FinanceTransaction::where('transaction_code', $trxCode)->exists()) {
                $count++;
                $trxCode = sprintf('%s-%s-%03d', $prefix, $period, $count);
            }

            $metaTag = "[RESTOCK_SUPPLY_ID:{$supply->id}|QTY:{$reqQty}|REQ_ID:{$restock->id}|CODE:{$supply->item_code}]";
            FinanceTransaction::create([
                'transaction_code' => $trxCode,
                'type' => 'pembelian_alat',
                'category' => 'Sparepart & Perlengkapan Produksi',
                'title' => "Pengajuan Sparepart/Inventaris: {$supply->name} (+{$reqQty} " . ($supply->unit ?? 'Pcs') . ")",
                'amount' => $reqQty * 50000,
                'supplier_name' => 'Toko Teknik & Sparepart Pabrik',
                'payment_method' => 'Menunggu Realisasi Finance',
                'payment_status' => 'Tempo',
                'approval_status' => 'pending',
                'source_role' => Auth::user()?->role ?? 'admin_toko',
                'transaction_date' => now()->toDateString(),
                'notes' => "{$metaTag} " . ($restock->notes ?? 'Pengajuan pembelian sparepart/inventaris produksi.'),
                'user_id' => Auth::id(),
            ]);

            return redirect()->back()->with('success', "Pengajuan restok {$supply->name} diteruskan ke Finance untuk disetujui & dipesan!");
        }

        DB::transaction(function () use ($restock, $supply) {
            $newQty = $supply->qty + $restock->request_qty;
            $status = $newQty > $supply->min_stock ? 'Aman' : ($newQty > 0 ? 'Menipis' : 'Habis');

            $supply->update([
                'qty' => $newQty,
                'status' => $status,
            ]);

            $restock->update([
                'status' => 'Selesai Restok',
            ]);
        });

        return redirect()->back()->with('success', "Restok perlengkapan {$restock->supply->name} berhasil disetujui dan ditambahkan ke gudang!");
    }

    public function cancelRestockSupply(Request $request, $restockId)
    {
        $restock = SupplyRestock::findOrFail($restockId);

        if ($restock->status === 'Selesai Restok') {
            return redirect()->back()->with('error', 'Permintaan ini sudah selesai diproses dan tidak dapat dibatalkan.');
        }

        $itemName = $restock->supply?->name ?? 'Perlengkapan';
        $restock->delete();

        return redirect()->back()->with('success', "Pengajuan restok untuk {$itemName} berhasil dibatalkan.");
    }

    public function destroySupply($id)
    {
        $supply = Supply::findOrFail($id);
        $name = $supply->name;
        $supply->delete();

        return redirect()->back()->with('success', "Perlengkapan {$name} berhasil dihapus.");
    }
}
