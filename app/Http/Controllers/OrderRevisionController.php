<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;

class OrderRevisionController extends Controller
{
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
}
