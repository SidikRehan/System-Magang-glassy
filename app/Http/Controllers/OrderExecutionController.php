<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;

class OrderExecutionController extends Controller
{
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
            'target_division' => 'required|string', // e.g. divisi_ht, divisi_gm, divisi_bv, divisi_etsa
        ]);

        $order = Order::findOrFail($id);

        if ($order->revision_status === 'pending_gudang') {
            $order->revision_status = 'pending_division';
        }

        $targetDiv = $validated['target_division'];
        $order->current_division = $targetDiv;
        $order->gudang_released_at = $order->gudang_released_at ?? now();
        
        $divNameKey = strtoupper(str_replace('divisi_', '', $targetDiv));
        $progress = (array) ($order->division_progress ?? []);
        $progress[$divNameKey] = 'Sedang Dikerjakan';

        $timestamps = (array) ($order->division_timestamps ?? []);
        if (!isset($timestamps[$divNameKey]) || !is_array($timestamps[$divNameKey])) {
            $timestamps[$divNameKey] = ['started_at' => null, 'completed_at' => null];
        }
        if (empty($timestamps[$divNameKey]['started_at'])) {
            $timestamps[$divNameKey]['started_at'] = now()->toDateTimeString();
        }

        $order->division_progress = $progress;
        $order->division_timestamps = $timestamps;
        $order->save();

        return redirect()->back()->with('message', 'Order #' . $order->spo_number . ' Berhasil Dikirim ke ' . strtoupper(str_replace('_', ' ', $targetDiv)) . '!');
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

        // Strict Authorization: Only assigned division staff, admin_gudang, or owner can execute
        if ($userRole !== $order->current_division && $userRole !== 'admin_gudang' && $userRole !== 'owner') {
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
            $order->execution_completed_at = now();
            $order->division_progress = $progress;
            $order->division_timestamps = $timestamps;
            $order->save();
            $msg = 'Pekerjaan Divisi untuk #' . $order->spo_number . ' Selesai & Lolos QC! Siap Dikirim ke Driver.';
        } else {
            $nextDivKey = strtoupper(str_replace('divisi_', '', $nextDiv));
            $progress[$nextDivKey] = 'Sedang Dikerjakan';
            if (!isset($timestamps[$nextDivKey]) || !is_array($timestamps[$nextDivKey])) {
                $timestamps[$nextDivKey] = ['started_at' => null, 'completed_at' => null];
            }
            if (empty($timestamps[$nextDivKey]['started_at'])) {
                $timestamps[$nextDivKey]['started_at'] = now()->toDateTimeString();
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
}
