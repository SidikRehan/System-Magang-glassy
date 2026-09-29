<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;

class ComplaintController extends Controller
{
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

            $items = $order->items ?? [];
            $defectiveItemsList = $complaintData['defective_items'] ?? [];
            $newOrderItems = [];

            foreach ($defectiveItemsList as $defItem) {
                $idx = (int) ($defItem['item_index'] ?? -1);
                $qtyDefective = (int) ($defItem['qty_defective'] ?? 0);

                if ($idx >= 0 && isset($items[$idx]) && $qtyDefective > 0) {
                    // 1. Kurangi Qty dari Order Induk
                    $originalQty = (int) $items[$idx]['qty'];
                    $newQty = max(0, $originalQty - $qtyDefective);
                    $items[$idx]['qty'] = $newQty;
                    // Note: Harga total tidak diubah agar tagihan kustomer tetap sesuai pesanan awal.

                    // 2. Siapkan item untuk Order Baru (Ganti Kaca)
                    $newItem = $items[$idx];
                    $newItem['qty'] = $qtyDefective;
                    $newItem['base_glass_price'] = 0;
                    $newItem['subtotal'] = 0;
                    $newItem['fee_gm'] = 0;
                    $newItem['fee_ht'] = 0;
                    $newItem['fee_bv'] = 0;
                    $newItem['fee_bor'] = 0;
                    $newItem['fee_etsa'] = 0;
                    $newOrderItems[] = $newItem;

                    // 3. Masukkan potongan rusak ke tabel Scrap (Sisa Kaca Rak)
                    for ($i = 0; $i < $qtyDefective; $i++) {
                        \App\Models\ScrapGlass::create([
                            'scrap_code' => 'SCR-' . date('ymd') . '-' . rand(1000, 9999),
                            'glass_type' => $defItem['glass_type'] ?? '-',
                            'length_cm' => $defItem['height'] ?? $defItem['length_cm'] ?? 0,
                            'width_cm' => $defItem['width'] ?? $defItem['width_cm'] ?? 0,
                            'rak_location' => 'Rak Titip (Ex. ' . $reportingDivKey . ' Baret)',
                            'status' => 'Baret / Cacat'
                        ]);
                    }
                }
            }

            // Simpan pembaruan Order Induk (Melanjutkan proses dengan sisa qty)
            $order->items = $items;
            $order->complaint_status = 'resolved';
            $order->complaint_data = $complaintData;
            $order->save();

            // 4. Buat Order Baru (Khusus Kaca Ganti)
            if (count($newOrderItems) > 0) {
                $newOrder = $order->replicate();
                $newOrder->spo_number = $order->spo_number . '-GANTI';
                $newOrder->items = $newOrderItems;
                $newOrder->subtotal = 0;
                $newOrder->total_price = 0;
                $newOrder->paid_amount = 0;
                $newOrder->payment_status = 'Lunas (Ganti/Retur)';
                $newOrder->priority_fee = 0;
                $newOrder->custom_fee = 0;
                
                $newOrder->status = 'pengerjaan';
                $newOrder->current_division = 'divisi_ht';
                $newOrder->division_progress = ['HT' => 'Menunggu Pengerjaan'];
                $newOrder->division_timestamps = ['HT' => ['started_at' => null, 'completed_at' => null]];
                
                $newOrder->complaint_status = 're_cut_needed';
                $newOrder->complaint_data = $complaintData;
                $newOrder->description = "Order Ulang Ganti Kaca dari SPO Induk: " . $order->spo_number . ". Alasan: " . ($complaintData['reason'] ?? 'Cacat');
                $newOrder->created_at = now();
                $newOrder->updated_at = now();
                
                $newOrder->save();
            }

            return redirect()->back()->with('message', '🚨 Permintaan Ganti Kaca Diproses! Kaca cacat masuk ke Scrap. Order Ganti (Potong Ulang) telah dibuat untuk Divisi Potong, dan sisa Order Induk dilanjutkan.');
        }

        return redirect()->back()->with('message', '⚠️ Keputusan tidak valid!');
    }
}
