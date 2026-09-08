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
        $complaintData = [
            'reporting_division' => $order->current_division,
            'reason' => $request->input('reason'),
            'notes' => !empty($rawNotes) ? $rawNotes : '-',
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
            $reason = $complaintData['reason'] ?? 'Kaca Cacat / Baret';

            $complaintData['gudang_decision'] = 'replace_glass';
            $complaintData['resolved_at'] = now()->toDateTimeString();

            // Update history of reporting division to reflect replaced glass
            $progress = (array) ($order->division_progress ?? []);
            if ($reportingDivKey) {
                $progress[$reportingDivKey] = 'Kaca Diganti & Dikembalikan ke Potong (HT)';
            }
            // Mark HT as requiring re-cutting
            $progress['HT'] = 'Potong Ulang (Ganti Kaca dari ' . $reportingDivKey . ')';

            $order->complaint_status = 're_cut_needed';
            $order->complaint_data = $complaintData;
            $order->current_division = 'divisi_ht';
            $order->division_progress = $progress;
            $order->save();

            return redirect()->back()->with('message', '🚨 Permintaan Ganti Kaca Disetujui! SPO #' . $order->spo_number . ' telah dikembalikan ke Divisi Potong (HT) untuk dipotong ulang.');
        }

        return redirect()->back()->with('message', '⚠️ Keputusan tidak valid!');
    }
}
