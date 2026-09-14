import React from 'react';

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
        bg: 'bg-rose-500/10 text-rose-300 border-rose-500/30'
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
                {/* MODAL HEADER */}
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                        📤 Disposisi Order Admin Gudang
                    </h3>
                    <button onClick={() => onClose()} className="text-slate-400 hover:text-white text-xl cursor-pointer">&times;</button>
                </div>

                {/* ORDER INFO CARD */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2">
                    <div className="flex justify-between items-start">
                        <div className="text-cyan-400 font-bold text-sm">
                            {selectedDispatchOrder.spo_number} - {selectedDispatchOrder.customer_name}
                        </div>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono border border-slate-700">
                            {selectedDispatchOrder.status}
                        </span>
                    </div>

                    <div className="text-slate-300">
                        Kaca: <strong>{selectedDispatchOrder.glass_type}</strong> ({selectedDispatchOrder.length_cm} x {selectedDispatchOrder.width_cm} cm)
                    </div>

                    {selectedDispatchOrder.used_scrap_rak && selectedDispatchOrder.used_scrap_rak !== '-' && selectedDispatchOrder.used_scrap_rak.trim() !== '' && (
                        <div className="bg-amber-950/80 border border-amber-500/50 rounded-lg p-2 text-amber-300 font-mono text-[11px] space-y-0.5">
                            <span className="font-extrabold text-amber-400 block">🧩 Rekomendasi Scrap Toko:</span>
                            <span className="text-slate-100 font-bold block">{selectedDispatchOrder.used_scrap_rak}</span>
                        </div>
                    )}

                    {selectedDispatchOrder.revision_notes && (
                        <div className="bg-amber-950/90 border-2 border-amber-500/60 rounded-lg p-2.5 text-amber-200 text-xs space-y-1 shadow-md">
                            <span className="font-extrabold text-amber-300 flex items-center gap-1">
                                📝 PERINCIAN REVISI DARI ADMIN TOKO:
                            </span>
                            <p className="text-slate-100 font-bold leading-relaxed whitespace-pre-line">
                                {selectedDispatchOrder.revision_notes}
                            </p>
                        </div>
                    )}
                </div>

                {/* AUTOMATIC PRODUCTION PIPELINE FLOW DISPLAY */}
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2">
                    <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                        <span>📍 Alur Rangkaian Divisi Eksekusi (Otomatis Sesuai Proses Kaca):</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {relevantDivisions.map((div, idx) => (
                            <React.Fragment key={div.key}>
                                {idx > 0 && <span className="text-slate-600 font-bold text-xs">➔</span>}
                                <span className={`px-2 py-1 rounded-lg text-xs font-bold border flex items-center gap-1 ${div.key === currentDivObj.key ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 ring-2 ring-cyan-500/30' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>
                                    <span>{div.icon}</span>
                                    <span>{div.code}</span>
                                </span>
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* TARGET DIVISION SELECTION CARD */}
                <form onSubmit={handleDispatchOrderSubmit} className="space-y-4 text-xs">
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-cyan-500/40 space-y-2">
                        <label className="text-slate-300 block font-bold text-xs flex items-center gap-1">
                            🎯 Divisi Tujuan Eksekusi Utama (Tujuan Pertama):
                        </label>

                        {/* SELECTOR / DISPLAY */}
                        {relevantDivisions.length > 1 ? (
                            <select 
                                value={targetDivChoice} 
                                onChange={e => setTargetDivChoice(e.target.value)}
                                className="w-full bg-slate-900 border border-cyan-500/50 rounded-xl p-2.5 text-cyan-300 font-bold text-sm focus:border-cyan-400 cursor-pointer"
                            >
                                {relevantDivisions.map(div => (
                                    <option key={div.key} value={div.key}>
                                        {div.icon} {div.name}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-700 flex items-center gap-2 text-cyan-300 font-bold text-sm">
                                <span>{currentDivObj.icon}</span>
                                <span>{currentDivObj.name}</span>
                            </div>
                        )}
                        <p className="text-[10px] text-slate-400 leading-normal">
                            *Orderan otomatis diset ke divisi pertama ({currentDivObj.name}) sesuai inputan spesifikasi kaca oleh Admin Toko.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                        <button type="button" onClick={() => onClose()} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 font-semibold cursor-pointer">
                            Batal
                        </button>
                        <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-extrabold text-slate-950 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 cursor-pointer">
                            🚀 Kirim Ke {currentDivObj.code || 'Divisi'} →
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
