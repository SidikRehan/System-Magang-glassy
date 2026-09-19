import React from 'react';
import { Send, X, ArrowRight, Layers, FileText, CheckCircle2 } from 'lucide-react';

export default function DispatchModal({
    show,
    onClose,
    selectedDispatchOrder,
    targetDivChoice,
    setTargetDivChoice,
    relevantDivisions = [],
    handleDispatchOrderSubmit
}) {
    if (!show || !selectedDispatchOrder) return null;

    const currentDivObj = relevantDivisions.find(d => d.key === targetDivChoice) || relevantDivisions[0] || {
        key: 'divisi_ht',
        code: 'HT',
        name: 'Divisi Potong (HT & Bor)',
        icon: '✂️',
        bg: 'bg-rose-50 text-rose-700 border-rose-200'
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl space-y-4 text-slate-800">
                {/* MODAL HEADER */}
                <div className="flex justify-between items-center border-b border-slate-200 pb-3.5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-[#1b68b0]/10 flex items-center justify-center text-[#1b68b0]">
                            <Send className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-base">
                                Disposisi Order Admin Gudang
                            </h3>
                            <p className="text-xs text-slate-500 font-mono">Pilih Divisi Produksi Pertama</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => onClose()} 
                        className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl p-1.5 transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* ORDER INFO CARD */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-2">
                    <div className="flex justify-between items-start">
                        <div className="text-[#1b68b0] font-bold text-sm">
                            {selectedDispatchOrder.spo_number} - {selectedDispatchOrder.customer_name}
                        </div>
                        <span className="text-[10px] bg-white text-slate-700 font-bold px-2 py-0.5 rounded-md font-mono border border-slate-200 shadow-2xs">
                            {selectedDispatchOrder.status}
                        </span>
                    </div>

                    <div className="text-slate-700">
                        Kaca: <strong className="text-slate-900">{selectedDispatchOrder.glass_type}</strong> ({selectedDispatchOrder.length_cm} x {selectedDispatchOrder.width_cm} cm)
                    </div>

                    {selectedDispatchOrder.used_scrap_rak && selectedDispatchOrder.used_scrap_rak !== '-' && selectedDispatchOrder.used_scrap_rak.trim() !== '' && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-amber-900 font-mono text-[11px] space-y-0.5">
                            <span className="font-bold text-amber-800 block">Rekomendasi Scrap Toko:</span>
                            <span className="text-slate-900 font-bold block">{selectedDispatchOrder.used_scrap_rak}</span>
                        </div>
                    )}

                    {selectedDispatchOrder.revision_notes && (
                        <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-amber-900 text-xs space-y-1">
                            <span className="font-bold text-amber-800 flex items-center gap-1">
                                Perincian Revisi Dari Admin Toko:
                            </span>
                            <p className="text-slate-800 leading-relaxed whitespace-pre-line font-medium">
                                {selectedDispatchOrder.revision_notes}
                            </p>
                        </div>
                    )}
                </div>

                {/* AUTOMATIC PRODUCTION PIPELINE FLOW DISPLAY */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                    <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-[#1b68b0]" />
                        <span>Alur Rangkaian Divisi Eksekusi:</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {relevantDivisions.map((div, idx) => (
                            <React.Fragment key={div.key}>
                                {idx > 0 && <span className="text-slate-400 font-bold text-xs">→</span>}
                                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${div.key === currentDivObj.key ? 'bg-[#1b68b0]/10 text-[#1b68b0] border-[#1b68b0]/40 ring-1 ring-[#1b68b0]/30' : 'bg-white text-slate-500 border-slate-200'}`}>
                                    <span>{div.code}</span>
                                </span>
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* TARGET DIVISION SELECTION CARD */}
                <form onSubmit={handleDispatchOrderSubmit} className="space-y-4 text-xs">
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                        <label className="text-slate-700 block font-bold text-xs">
                            Divisi Tujuan Eksekusi Pertama:
                        </label>

                        {/* SELECTOR / DISPLAY */}
                        {relevantDivisions.length > 1 ? (
                            <select 
                                value={targetDivChoice} 
                                onChange={e => setTargetDivChoice(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-[#1b68b0] font-bold text-sm focus:border-[#1b68b0] cursor-pointer"
                            >
                                {relevantDivisions.map(div => (
                                    <option key={div.key} value={div.key}>
                                        {div.code} - {div.name}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center gap-2 text-[#1b68b0] font-bold text-sm">
                                <span>{currentDivObj.name}</span>
                            </div>
                        )}
                        <p className="text-[11px] text-slate-500 leading-normal">
                            *Orderan otomatis diarahkan ke divisi pertama ({currentDivObj.name}) sesuai proses kaca yang dipesan.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                        <button type="button" onClick={() => onClose()} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-semibold cursor-pointer text-xs transition">
                            Batal
                        </button>
                        <button type="submit" className="px-5 py-2.5 bg-[#70b03c] hover:bg-[#5f9733] font-bold text-white rounded-xl text-xs flex items-center gap-2 shadow-xs cursor-pointer transition">
                            <span>Kirim Ke {currentDivObj.code || 'Divisi'}</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
