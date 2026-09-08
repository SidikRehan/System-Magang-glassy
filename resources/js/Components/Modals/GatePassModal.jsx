import React from 'react';

export default function GatePassModal({
    show,
    onClose,
    selectedBarangKeluarData,
    userName
}) {
    if (!show || !selectedBarangKeluarData) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">📋</span>
                        <h3 className="font-extrabold text-slate-100 text-base">
                            Surat Barang Keluar / Gate Pass Gudang
                        </h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl font-bold">&times;</button>
                </div>

                {/* DOKUMEN CETAK DENGAN EMBEDDED PRINT LAYOUT */}
                <div className="bg-white text-slate-900 p-6 rounded-xl space-y-4 font-sans border-2 border-slate-400">
                    {/* HEADER KOP DOKUMEN */}
                    <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3">
                        <div>
                            <h2 className="font-black text-lg tracking-wider text-slate-950">CV CAHYA KARUNIA JAYA</h2>
                            <p className="text-xs text-slate-700">SYP GLASS OPERATIONAL - FABRIKASI & DISTRIBUSI KACA</p>
                            <p className="text-[11px] text-slate-600">Jl. Raya Industri Kaca No. 88, Bandung | WA: 0812-3456-7890</p>
                        </div>
                        <div className="text-right">
                            <span className="bg-slate-950 text-white px-3 py-1 rounded text-xs font-black tracking-widest block uppercase mb-1">
                                SURAT BARANG KELUAR
                            </span>
                            <div className="text-xs font-mono font-bold">No: {selectedBarangKeluarData.sbk_number}</div>
                            <div className="text-[11px] text-slate-600">Tanggal: {selectedBarangKeluarData.date}</div>
                        </div>
                    </div>

                    {/* DETAIL TUJUAN & ARMADA */}
                    <div className="grid grid-cols-2 gap-4 text-xs bg-slate-100 p-3 rounded-lg border border-slate-300">
                        <div className="space-y-1">
                            <div><strong>No. Referensi SPO:</strong> <span className="font-mono text-blue-700 font-bold">{selectedBarangKeluarData.order.spo_number}</span></div>
                            <div><strong>Nama Customer:</strong> {selectedBarangKeluarData.order.customer_name} ({selectedBarangKeluarData.order.customer_phone})</div>
                            <div><strong>Alamat Pengiriman:</strong> {selectedBarangKeluarData.order.customer_address}</div>
                        </div>
                        <div className="space-y-1 border-l border-slate-300 pl-3">
                            <div><strong>Supir / Driver:</strong> <span className="font-bold">{selectedBarangKeluarData.driver}</span></div>
                            <div><strong>Kendaraan & Plat:</strong> <span className="font-bold">{selectedBarangKeluarData.vehicle}</span></div>
                            <div><strong>Status Tagihan:</strong> <span className="font-mono font-bold text-emerald-700">{selectedBarangKeluarData.order.payment_status}</span></div>
                        </div>
                    </div>

                    {/* TABEL ITEM BARANG KELUAR GUDANG */}
                    <div>
                        <h4 className="font-bold text-xs uppercase mb-1">Rincian Fisik Barang Kaca Keluar dari Pabrik/Gudang:</h4>
                        <table className="w-full text-xs text-left border-collapse border border-slate-400">
                            <thead className="bg-slate-200 uppercase font-bold text-[11px]">
                                <tr>
                                    <th className="border border-slate-400 p-2">No</th>
                                    <th className="border border-slate-400 p-2">Spesifikasi Kaca / Item</th>
                                    <th className="border border-slate-400 p-2 text-center">Ukuran (P x L)</th>
                                    <th className="border border-slate-400 p-2 text-center">Tebal</th>
                                    <th className="border border-slate-400 p-2 text-center">Qty</th>
                                    <th className="border border-slate-400 p-2 text-center">Status QC Gudang</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(Array.isArray(selectedBarangKeluarData.order.items) && selectedBarangKeluarData.order.items.length > 0 
                                    ? selectedBarangKeluarData.order.items 
                                    : [{
                                        glass_type: selectedBarangKeluarData.order.glass_type,
                                        length_cm: selectedBarangKeluarData.order.length_cm,
                                        width_cm: selectedBarangKeluarData.order.width_cm,
                                        thickness_mm: selectedBarangKeluarData.order.thickness_mm,
                                        qty: selectedBarangKeluarData.order.qty || 1
                                      }]
                                ).map((it, idx) => (
                                    <tr key={idx} className="border-b border-slate-300">
                                        <td className="border border-slate-400 p-2 text-center font-mono">{idx + 1}</td>
                                        <td className="border border-slate-400 p-2 font-bold">{it.glass_type}</td>
                                        <td className="border border-slate-400 p-2 text-center font-mono font-bold">{it.length_cm} x {it.width_cm} cm</td>
                                        <td className="border border-slate-400 p-2 text-center font-mono">{it.thickness_mm || 5} mm</td>
                                        <td className="border border-slate-400 p-2 text-center font-mono font-bold text-blue-700">{it.qty || 1} Pcs/Lembar</td>
                                        <td className="border border-slate-400 p-2 text-center text-emerald-700 font-bold">✓ OK (Lolos QC)</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* 4 KOTAK TANDA TANGAN VERIFIKASI RESMI */}
                    <div className="grid grid-cols-4 gap-2 text-center text-[10px] pt-4">
                        <div className="border border-slate-400 p-2 rounded">
                            <div className="font-bold mb-8">Disetujui Admin Toko:</div>
                            <div className="border-t border-slate-400 pt-1 font-bold">( {userName} )</div>
                        </div>
                        <div className="border border-slate-400 p-2 rounded">
                            <div className="font-bold mb-8">Dikeluarkan Gudang:</div>
                            <div className="border-t border-slate-400 pt-1 font-bold">( Ka. Gudang Pabrik )</div>
                        </div>
                        <div className="border border-slate-400 p-2 rounded">
                            <div className="font-bold mb-8">Diterima Supir/Driver:</div>
                            <div className="border-t border-slate-400 pt-1 font-bold">( {selectedBarangKeluarData.driver} )</div>
                        </div>
                        <div className="border border-slate-400 p-2 rounded">
                            <div className="font-bold mb-8">Verifikasi Pos Security:</div>
                            <div className="border-t border-slate-400 pt-1 font-bold">( Petugas Satpam Gate )</div>
                        </div>
                    </div>
                </div>

                {/* ACTION PRINT BUTTON */}
                <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-lg transition text-xs"
                    >
                        Tutup
                    </button>
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-5 py-2 rounded-lg transition shadow-lg shadow-emerald-500/20 text-xs flex items-center gap-1.5"
                    >
                        🖨️ Cetak Surat Barang Keluar (PDF/Print)
                    </button>
                </div>
            </div>
        </div>
    );
}
