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

        return redirect()->back()->with('message', 'Kaca Sisa ' . $code . ' Berhasil Disimpan di ' . $validated['rak_location']);
    }
}
