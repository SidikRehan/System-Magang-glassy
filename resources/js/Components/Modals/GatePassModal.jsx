import React from 'react';
import { FileText, Printer, X } from 'lucide-react';

export default function GatePassModal({
    show,
    onClose,
    selectedBarangKeluarData,
    userName
}) {
    if (!show || !selectedBarangKeluarData) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto text-slate-800">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3.5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-[#1b68b0]/10 flex items-center justify-center text-[#1b68b0]">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-base">
                                Surat Barang Keluar / Gate Pass Gudang
                            </h3>
                            <p className="text-xs text-slate-500 font-mono">No: {selectedBarangKeluarData.sbk_number}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl p-1.5 transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* DOKUMEN CETAK DENGAN EMBEDDED PRINT LAYOUT */}
                <div className="bg-white text-slate-900 p-6 rounded-2xl space-y-4 font-sans border border-slate-300 shadow-xs">
                    {/* HEADER KOP DOKUMEN */}
                    <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3">
                        <div>
                            <h2 className="font-black text-lg tracking-wider text-slate-950">CV CAHYA KARUNIA JAYA</h2>
                            <p className="text-xs text-slate-700">SYP GLASS OPERATIONAL - FABRIKASI & DISTRIBUSI KACA</p>
                            <p className="text-[11px] text-slate-600">Jl. Raya Industri Kaca No. 88, Bandung | WA: 0812-3456-7890</p>
                        </div>
                        <div className="text-right">
                            <span className="bg-slate-900 text-white px-3 py-1 rounded-md text-xs font-bold tracking-widest block uppercase mb-1">
                                SURAT BARANG KELUAR
                            </span>
                            <div className="text-xs font-mono font-bold">No: {selectedBarangKeluarData.sbk_number}</div>
                            <div className="text-[11px] text-slate-600">Tanggal: {selectedBarangKeluarData.date}</div>
                        </div>
                    </div>

                    {/* DETAIL TUJUAN & ARMADA */}
                    <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <div className="space-y-1">
                            <div><strong>No. Referensi SPO:</strong> <span className="font-mono text-[#1b68b0] font-bold">{selectedBarangKeluarData.orders ? selectedBarangKeluarData.orders.map(o => o.spo_number || o.id).join(', ') : selectedBarangKeluarData.order?.spo_number}</span></div>
                            <div><strong>Jumlah Tujuan:</strong> <span className="font-bold">{selectedBarangKeluarData.orders ? selectedBarangKeluarData.orders.length + ' Alamat Tujuan' : selectedBarangKeluarData.order?.customer_name}</span></div>
                            <div><strong>Alamat Tujuan:</strong> {selectedBarangKeluarData.orders ? selectedBarangKeluarData.orders.map(o => o.customer_name + ' (' + (o.customer_address || '-') + ')').join('; ') : selectedBarangKeluarData.order?.customer_address}</div>
                        </div>
                        <div className="space-y-1 border-l border-slate-200 pl-3">
                            <div><strong>Supir / Driver:</strong> <span className="font-bold">{selectedBarangKeluarData.driver}</span></div>
                            <div><strong>Kendaraan & Plat:</strong> <span className="font-bold">{selectedBarangKeluarData.vehicle}</span></div>
                            <div><strong>Kode Trip:</strong> <span className="font-mono font-bold text-[#1b68b0]">{selectedBarangKeluarData.trip_code || '-'}</span></div>
                        </div>
                    </div>

                    {/* TABEL ITEM BARANG KELUAR GUDANG */}
                    <div>
                        <h4 className="font-bold text-xs uppercase mb-1.5 text-slate-700">Rincian Fisik Barang Kaca Keluar dari Pabrik/Gudang (Total Muatan Mobil):</h4>
                        <table className="w-full text-xs text-left border-collapse border border-slate-300 rounded-lg overflow-hidden">
                            <thead className="bg-slate-100 uppercase font-bold text-[11px] text-slate-700">
                                <tr>
                                    <th className="border border-slate-300 p-2 text-center">No</th>
                                    <th className="border border-slate-300 p-2">Tujuan / SPO</th>
                                    <th className="border border-slate-300 p-2">Spesifikasi Kaca / Item</th>
                                    <th className="border border-slate-300 p-2 text-center">Ukuran (P x L)</th>
                                    <th className="border border-slate-300 p-2 text-center">Tebal</th>
                                    <th className="border border-slate-300 p-2 text-center">Qty</th>
                                    <th className="border border-slate-300 p-2 text-center">Status QC</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(selectedBarangKeluarData.orders ? selectedBarangKeluarData.orders.flatMap(ord => {
                                    const items = Array.isArray(ord.items) && ord.items.length > 0
                                        ? ord.items
                                        : [{
                                            glass_type: ord.glass_type,
                                            length_cm: ord.length_cm,
                                            width_cm: ord.width_cm,
                                            thickness_mm: ord.thickness_mm,
                                            qty: ord.qty || 1
                                        }];
                                    return items.map(it => ({ ...it, spo_number: ord.spo_number, customer_name: ord.customer_name }));
                                }) : (Array.isArray(selectedBarangKeluarData.order?.items) && selectedBarangKeluarData.order.items.length > 0 
                                    ? selectedBarangKeluarData.order.items.map(it => ({ ...it, spo_number: selectedBarangKeluarData.order.spo_number, customer_name: selectedBarangKeluarData.order.customer_name }))
                                    : [{
                                        spo_number: selectedBarangKeluarData.order?.spo_number,
                                        customer_name: selectedBarangKeluarData.order?.customer_name,
                                        glass_type: selectedBarangKeluarData.order?.glass_type,
                                        length_cm: selectedBarangKeluarData.order?.length_cm,
                                        width_cm: selectedBarangKeluarData.order?.width_cm,
                                        thickness_mm: selectedBarangKeluarData.order?.thickness_mm,
                                        qty: selectedBarangKeluarData.order?.qty || 1
                                      }]
                                )).map((it, idx) => (
                                    <tr key={idx} className="border-b border-slate-200">
                                        <td className="border border-slate-300 p-2 text-center font-mono">{idx + 1}</td>
                                        <td className="border border-slate-300 p-2 font-mono text-[11px]">
                                            <strong className="text-[#1b68b0]">{it.spo_number}</strong>
                                            <div className="text-[10px] text-slate-500">{it.customer_name}</div>
                                        </td>
                                        <td className="border border-slate-300 p-2 font-bold">{it.glass_type}</td>
                                        <td className="border border-slate-300 p-2 text-center font-mono font-bold">{it.length_cm} x {it.width_cm} cm</td>
                                        <td className="border border-slate-300 p-2 text-center font-mono">{it.thickness_mm || 5} mm</td>
                                        <td className="border border-slate-300 p-2 text-center font-mono font-bold text-[#1b68b0]">{it.qty || 1} Pcs</td>
                                        <td className="border border-slate-300 p-2 text-center text-emerald-700 font-bold">✓ OK (QC)</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* 4 KOTAK TANDA TANGAN VERIFIKASI RESMI */}
                    <div className="grid grid-cols-4 gap-2.5 text-center text-[10px] pt-3">
                        <div className="border border-slate-300 p-2.5 rounded-xl bg-white">
                            <div className="font-bold mb-8 text-slate-700">Disetujui Admin Toko:</div>
                            <div className="border-t border-slate-300 pt-1 font-bold">( {userName} )</div>
                        </div>
                        <div className="border border-slate-300 p-2.5 rounded-xl bg-white">
                            <div className="font-bold mb-8 text-slate-700">Dikeluarkan Gudang:</div>
                            <div className="border-t border-slate-300 pt-1 font-bold">( Ka. Gudang Pabrik )</div>
                        </div>
                        <div className="border border-slate-300 p-2.5 rounded-xl bg-white">
                            <div className="font-bold mb-8 text-slate-700">Diterima Supir/Driver:</div>
                            <div className="border-t border-slate-300 pt-1 font-bold">( {selectedBarangKeluarData.driver} )</div>
                        </div>
                        <div className="border border-slate-300 p-2.5 rounded-xl bg-white">
                            <div className="font-bold mb-8 text-slate-700">Verifikasi Pos Security:</div>
                            <div className="border-t border-slate-300 pt-1 font-bold">( Petugas Satpam Gate )</div>
                        </div>
                    </div>
                </div>

                {/* ACTION PRINT BUTTON */}
                <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl transition text-xs cursor-pointer"
                    >
                        Tutup
                    </button>
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="bg-[#70b03c] hover:bg-[#5f9733] text-white font-bold px-5 py-2.5 rounded-xl transition shadow-xs text-xs flex items-center gap-2 cursor-pointer"
                    >
                        <Printer className="w-4 h-4" />
                        <span>Cetak Surat Barang Keluar</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
