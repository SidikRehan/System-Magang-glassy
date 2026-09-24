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

        $itemCode = 'BRG-' . str_pad(SheetGlass::count() + 1, 3, '0', STR_PAD_LEFT);
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
            'supplier_name' => 'nullable|string|max:255',
            'supplier_phone' => 'nullable|string|max:50',
            'supplier_pic' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:500',
        ]);

        $newQty = $glass->qty + (int) $validated['add_qty'];
        $status = $newQty > 10 ? 'Aman' : ($newQty > 0 ? 'Menipis' : 'Habis');

        $glass->update([
            'qty' => $newQty,
            'last_restock' => now(),
            'status' => $status,
            'supplier_name' => $validated['supplier_name'] ?? $glass->supplier_name,
            'supplier_phone' => $validated['supplier_phone'] ?? $glass->supplier_phone,
            'supplier_pic' => $validated['supplier_pic'] ?? $glass->supplier_pic,
        ]);

        return redirect()->back()->with('success', "Stok kaca {$glass->name} berhasil ditambah sebanyak {$validated['add_qty']} {$glass->unit}!");
    }

    public function destroySheetGlass($id)
    {
        $glass = SheetGlass::findOrFail($id);
        $name = $glass->name;
        $glass->delete();

        return redirect()->back()->with('success', "Kaca {$name} berhasil dihapus dari database.");
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

        $accCode = 'ACC-' . str_pad(Accessory::count() + 1, 3, '0', STR_PAD_LEFT);
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
        $acc = Accessory::findOrFail($id);

        $validated = $request->validate([
            'add_qty' => 'required|integer|min:1',
            'notes' => 'nullable|string|max:500',
        ]);

        $newQty = $acc->qty + (int) $validated['add_qty'];
        $status = $newQty > 20 ? 'Aman' : ($newQty > 0 ? 'Menipis' : 'Habis');

        $acc->update([
            'qty' => $newQty,
            'status' => $status,
        ]);

        return redirect()->back()->with('success', "Stok aksesoris {$acc->name} bertambah {$validated['add_qty']} {$acc->unit}!");
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
            'notes' => 'nullable|string|max:500',
        ]);

        $toolCode = 'ALT-' . str_pad(Tool::count() + 1, 3, '0', STR_PAD_LEFT);
        $totalQty = (int) $validated['total_qty'];

        Tool::create([
            'tool_code' => $toolCode,
            'name' => $validated['name'],
            'category' => $validated['category'],
            'condition' => $validated['condition'] ?? 'Baik',
            'location' => $validated['location'] ?? 'Gudang Utama',
            'total_qty' => $totalQty,
            'available_qty' => $totalQty,
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->back()->with('success', "Alat penunjang {$validated['name']} berhasil didaftarkan!");
    }

    public function updateTool(Request $request, $id)
    {
        if ($request->user()?->role === 'admin_toko') {
            return redirect()->back()->with('error', 'Admin toko hanya memiliki akses lihat. Pengelolaan alat dilakukan oleh Admin Gudang.');
        }

        $tool = Tool::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'condition' => 'nullable|string|max:50',
            'location' => 'nullable|string|max:100',
            'total_qty' => 'required|integer|min:1',
            'notes' => 'nullable|string|max:500',
        ]);

        // Hitung selisih total_qty
        $diff = (int) $validated['total_qty'] - $tool->total_qty;
        $newAvailable = max(0, $tool->available_qty + $diff);

        $tool->update([
            'name' => $validated['name'],
            'category' => $validated['category'],
            'condition' => $validated['condition'] ?? $tool->condition,
            'location' => $validated['location'] ?? $tool->location,
            'total_qty' => $validated['total_qty'],
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

        $tool = Tool::findOrFail($id);

        $validated = $request->validate([
            'borrower_name' => 'required|string|max:255',
            'qty' => 'required|integer|min:1|max:' . $tool->available_qty,
            'notes' => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($tool, $validated) {
            ToolBorrow::create([
                'tool_id' => $tool->id,
                'borrower_name' => $validated['borrower_name'],
                'borrow_date' => now(),
                'qty' => $validated['qty'],
                'status' => 'Dipinjam',
                'notes' => $validated['notes'] ?? null,
            ]);

            $tool->decrement('available_qty', (int) $validated['qty']);
        });

        return redirect()->back()->with('success', "Peminjaman {$tool->name} oleh {$validated['borrower_name']} berhasil dicatat!");
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

        DB::transaction(function () use ($borrow) {
            $borrow->update([
                'return_date' => now(),
                'status' => 'Dikembalikan',
            ]);

            $borrow->tool->increment('available_qty', $borrow->qty);
        });

        return redirect()->back()->with('success', "Pengembalian alat {$borrow->tool->name} berhasil diverifikasi!");
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

        $tool->update([
            'condition' => $validated['condition'],
            'notes' => $validated['notes'] ?? $tool->notes,
        ]);

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
        ]);

        $itemCode = 'SUP-' . str_pad(Supply::count() + 1, 3, '0', STR_PAD_LEFT);
        $qty = (int) $validated['qty'];
        $min = (int) ($validated['min_stock'] ?? 5);
        $status = $qty > $min ? 'Aman' : ($qty > 0 ? 'Menipis' : 'Habis');

        Supply::create([
            'item_code' => $itemCode,
            'name' => $validated['name'],
            'category' => $validated['category'],
            'qty' => $qty,
            'unit' => $validated['unit'] ?? 'Pcs',
            'min_stock' => $min,
            'status' => $status,
        ]);

        return redirect()->back()->with('success', "Perlengkapan {$validated['name']} berhasil ditambahkan!");
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
            'notes' => 'nullable|string|max:500',
        ]);

        SupplyRestock::create([
            'supply_id' => $supply->id,
            'request_qty' => $validated['request_qty'],
            'notes' => $validated['notes'] ?? null,
            'status' => 'Menunggu Persetujuan',
        ]);

        return redirect()->back()->with('success', "Permintaan restok {$validated['request_qty']} {$supply->unit} {$supply->name} diajukan ke manajemen!");
    }

    public function approveRestockSupply(Request $request, $restockId)
    {
        $restock = SupplyRestock::findOrFail($restockId);

        if ($restock->status === 'Selesai Restok') {
            return redirect()->back()->with('error', 'Permintaan ini sudah selesai diproses.');
        }

        DB::transaction(function () use ($restock) {
            $supply = $restock->supply;
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

    public function destroySupply($id)
    {
        $supply = Supply::findOrFail($id);
        $name = $supply->name;
        $supply->delete();

        return redirect()->back()->with('success', "Perlengkapan {$name} berhasil dihapus.");
    }
}
