import React from 'react';
import { Scale, CheckCircle2, RotateCcw, X, AlertTriangle } from 'lucide-react';

export default function GudangDecisionModal({
    show,
    onClose,
    selectedComplaintOrder,
    onResolveComplaint
}) {
    if (!show || !selectedComplaintOrder) return null;

    return (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 max-w-lg w-full space-y-4 shadow-2xl relative my-auto text-slate-800">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3.5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-700 border border-amber-200">
                            <Scale className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-base">Keputusan Admin Gudang - Komplain Kaca</h3>
                            <p className="text-xs text-slate-500 font-mono">SPO #{selectedComplaintOrder.spo_number} — Pelapor: Divisi {selectedComplaintOrder.complaint_data?.reporting_division?.replace('divisi_', '').toUpperCase() || ''}</p>
                        </div>
                    </div>
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl p-1.5 transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                    <div className="space-y-1">
                        <div className="text-slate-600">Pelanggan: <strong className="text-slate-900">{selectedComplaintOrder.customer_name}</strong></div>
                        <div className="text-slate-600">Alasan Komplain: <strong className="text-rose-600 font-bold">{selectedComplaintOrder.complaint_data?.reason || 'Kaca Cacat / Baret'}</strong></div>
                        {selectedComplaintOrder.complaint_data?.notes && (
                            <div className="text-slate-600">Catatan Pekerja: <span className="text-slate-800 italic font-mono bg-white px-2 py-0.5 rounded border border-slate-200 inline-block mt-0.5">"{selectedComplaintOrder.complaint_data.notes}"</span></div>
                        )}
                        <div className="text-slate-500 text-[11px] pt-1">Dilaporkan pada: <span className="text-slate-700 font-mono font-medium">{selectedComplaintOrder.complaint_data?.reported_at || '-'}</span></div>
                    </div>

                    {/* RINCIAN ITEM KACA CACAT / BARET YANG DILAPORKAN */}
                    {Array.isArray(selectedComplaintOrder.complaint_data?.defective_items) && selectedComplaintOrder.complaint_data.defective_items.length > 0 && (
                        <div className="space-y-1.5 pt-2 border-t border-slate-200">
                            <span className="text-[11px] font-bold text-rose-700 flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>Rincian Item Kaca Cacat / Baret Dilaporkan:</span>
                            </span>
                            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                                {selectedComplaintOrder.complaint_data.defective_items.map((def, idx) => (
                                    <div key={idx} className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl flex justify-between items-center text-xs">
                                        <div>
                                            <strong className="text-slate-900 block font-bold">#{def.item_index + 1}. {def.glass_type}</strong>
                                            <span className="text-[11px] text-slate-500 font-mono">{def.width} × {def.height} cm ({def.thickness}mm) — Total Order: {def.quantity} Pcs</span>
                                        </div>
                                        <div className="bg-rose-600 text-white font-bold px-2.5 py-1 rounded-lg text-xs font-mono shadow-xs whitespace-nowrap">
                                            {def.qty_defective} Lembar Rusak
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedComplaintOrder.complaint_data?.photo_path && (
                        <div className="space-y-1 pt-1 border-t border-slate-200">
                            <span className="text-[11px] font-bold text-slate-700">Foto Bukti Kaca Cacat:</span>
                            <div className="rounded-xl overflow-hidden border border-slate-200 max-h-48 bg-slate-100">
                                <img src={`/storage/${selectedComplaintOrder.complaint_data.photo_path}`} alt="Bukti Cacat Kaca" className="w-full h-full object-contain" />
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-700">Pilih Langkah Konfirmasi Admin Gudang:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => onResolveComplaint(selectedComplaintOrder.id, 'continue')}
                            className="p-3.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-2xl text-left space-y-1 group transition shadow-2xs cursor-pointer"
                        >
                            <div className="font-bold text-emerald-700 text-xs flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>Lanjutkan Pengerjaan</span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-tight">
                                Lanjutkan di divisi asal tanpa ganti kaca (kaca dinilai masih layak pakai).
                            </p>
                        </button>

                        <button
                            type="button"
                            onClick={() => onResolveComplaint(selectedComplaintOrder.id, 'replace_glass')}
                            className="p-3.5 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 rounded-2xl text-left space-y-1 group transition shadow-2xs cursor-pointer"
                        >
                            <div className="font-bold text-rose-700 text-xs flex items-center gap-1.5">
                                <RotateCcw className="w-4 h-4 text-rose-600" />
                                <span>Setujui Ganti Kaca (Potong Ulang)</span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-tight">
                                SPO dikembalikan ke <strong>Divisi Potong (HT)</strong> untuk dipotong ulang lembaran baru.
                            </p>
                        </button>
                    </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-200">
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition cursor-pointer"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
