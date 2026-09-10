<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ScrapGlass;

class ScrapController extends Controller
{
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

        \App\Models\ActivityLog::create([
            'user_id' => auth()->id(),
            'admin_name' => auth()->user()->name ?? 'Pekerja Divisi HT',
            'action_type' => 'INPUT_SCRAP',
            'target_user_name' => $code,
            'description' => 'Mencatat pecahan sisa potongan kaca baru ' . $code . ' (' . $validated['glass_type'] . ', ' . $validated['length_cm'] . 'x' . $validated['width_cm'] . ' cm) ke ' . $validated['rak_location'] . '.',
        ]);

        return redirect()->back()->with('message', 'Kaca Sisa ' . $code . ' Berhasil Disimpan di ' . $validated['rak_location']);
    }

    /**
     * Update / Potong Ulang Scrap Glass (Divisi HT & Gudang)
     */
    public function updateScrap(Request $request, $id)
    {
        $scrap = ScrapGlass::findOrFail($id);

        $validated = $request->validate([
            'length_cm' => 'required|numeric|min:0',
            'width_cm' => 'required|numeric|min:0',
            'rak_location' => 'required|string',
            'status' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        $oldInfo = "{$scrap->length_cm}x{$scrap->width_cm} cm di {$scrap->rak_location} ({$scrap->status})";

        $scrap->update([
            'length_cm' => $validated['length_cm'],
            'width_cm' => $validated['width_cm'],
            'rak_location' => $validated['rak_location'],
            'status' => $validated['status'],
        ]);

        $newInfo = "{$validated['length_cm']}x{$validated['width_cm']} cm di {$validated['rak_location']} ({$validated['status']})";
        $notesStr = !empty(trim($validated['notes'] ?? '')) ? ' Catatan: ' . trim($validated['notes']) : '';

        \App\Models\ActivityLog::create([
            'user_id' => auth()->id(),
            'admin_name' => auth()->user()->name ?? 'Divisi Potong (HT)',
            'action_type' => 'EDIT_SCRAP',
            'target_user_name' => $scrap->scrap_code,
            'description' => 'Memotong/mengubah ukuran kaca sisa ' . $scrap->scrap_code . ' (' . $scrap->glass_type . ') dari ' . $oldInfo . ' menjadi ' . $newInfo . '.' . $notesStr,
        ]);

        return redirect()->back()->with('message', '✅ Kaca Sisa ' . $scrap->scrap_code . ' berhasil diperbarui dan disimpan kembali di ' . $validated['rak_location'] . '!');
    }
}
