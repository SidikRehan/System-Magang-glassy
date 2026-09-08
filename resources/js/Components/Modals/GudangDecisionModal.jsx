import React from 'react';

export default function GudangDecisionModal({
    show,
    onClose,
    selectedComplaintOrder,
    onResolveComplaint
}) {
    if (!show || !selectedComplaintOrder) return null;

    return (
        <div className="fixed inset-0 z-[70] bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-5 shadow-[0_0_50px_rgba(245,158,11,0.18)] relative my-auto">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3.5">
                    <div className="flex items-center gap-2.5">
                        <span className="text-2xl">⚖️</span>
                        <div>
                            <h3 className="font-extrabold text-white text-base">Keputusan Admin Gudang - Komplain Kaca</h3>
                            <p className="text-xs text-slate-400 font-mono">SPO #{selectedComplaintOrder.spo_number} — Pelapor: Divisi {selectedComplaintOrder.complaint_data?.reporting_division?.replace('divisi_', '').toUpperCase() || ''}</p>
                        </div>
                    </div>
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full w-8 h-8 flex items-center justify-center transition border border-slate-700 text-lg font-bold"
                    >
                        &times;
                    </button>
                </div>

                <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
                    <div className="space-y-1">
                        <div className="text-slate-400">Pelanggan: <strong className="text-slate-200">{selectedComplaintOrder.customer_name}</strong></div>
                        <div className="text-slate-400">Alasan Komplain: <strong className="text-rose-400 font-bold">{selectedComplaintOrder.complaint_data?.reason || 'Kaca Cacat / Baret'}</strong></div>
                        {selectedComplaintOrder.complaint_data?.notes && (
                            <div className="text-slate-400">Catatan Pekerja: <span className="text-amber-200 italic font-mono">"{selectedComplaintOrder.complaint_data.notes}"</span></div>
                        )}
                        <div className="text-slate-400 text-[10px] pt-1">Dilaporkan pada: <span className="text-cyan-300 font-mono">{selectedComplaintOrder.complaint_data?.reported_at || '-'}</span></div>
                    </div>

                    {selectedComplaintOrder.complaint_data?.photo_path && (
                        <div className="space-y-1 pt-1">
                            <span className="text-[11px] font-bold text-slate-300">Foto Bukti Kaca Cacat:</span>
                            <div className="rounded-xl overflow-hidden border border-slate-700 max-h-48">
                                <img src={`/storage/${selectedComplaintOrder.complaint_data.photo_path}`} alt="Bukti Cacat Kaca" className="w-full h-full object-contain bg-black" />
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-300">Pilih Langkah Konfirmasi Admin Gudang:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => onResolveComplaint(selectedComplaintOrder.id, 'continue')}
                            className="p-3.5 bg-slate-950 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-500/60 rounded-2xl text-left space-y-1 group transition shadow-md cursor-pointer"
                        >
                            <div className="font-extrabold text-emerald-400 text-xs flex items-center gap-1.5 group-hover:underline">
                                <span>✅ Lanjutkan Pengerjaan</span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-tight">
                                Lanjutkan di divisi asal tanpa ganti kaca (kaca dinilai masih layak pakai).
                            </p>
                        </button>

                        <button
                            type="button"
                            onClick={() => onResolveComplaint(selectedComplaintOrder.id, 'replace_glass')}
                            className="p-3.5 bg-slate-950 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-500/60 rounded-2xl text-left space-y-1 group transition shadow-md cursor-pointer"
                        >
                            <div className="font-extrabold text-rose-400 text-xs flex items-center gap-1.5 group-hover:underline">
                                <span>🚨 Setujui Ganti Kaca (Potong Ulang)</span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-tight">
                                SPO dikembalikan ke <strong>Divisi Potong (HT)</strong> untuk dipotong ulang lembaran baru.
                            </p>
                        </button>
                    </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-800">
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs transition"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
