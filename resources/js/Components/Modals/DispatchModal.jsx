import React from 'react';

export default function DispatchModal({
    show,
    onClose,
    selectedDispatchOrder,
    targetDivChoice,
    setTargetDivChoice,
    handleDispatchOrderSubmit
}) {
    if (!show || !selectedDispatchOrder) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                        📤 Disposisi Order Admin Gudang
                    </h3>
                    <button onClick={() => onClose()} className="text-slate-400 hover:text-white text-xl">&times;</button>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5">
                    <div className="text-cyan-400 font-bold">{selectedDispatchOrder.spo_number} - {selectedDispatchOrder.customer_name}</div>
                    <div className="text-slate-300">Kaca: {selectedDispatchOrder.glass_type} ({selectedDispatchOrder.length_cm} x {selectedDispatchOrder.width_cm} cm)</div>
                    {selectedDispatchOrder.used_scrap_rak && selectedDispatchOrder.used_scrap_rak !== '-' && selectedDispatchOrder.used_scrap_rak.trim() !== '' && (
                        <div className="bg-amber-950/80 border border-amber-500/50 rounded-lg p-2 text-amber-300 font-mono text-[11px] space-y-0.5">
                            <span className="font-extrabold text-amber-400 block">🧩 Rekomendasi Scrap Toko:</span>
                            <span className="text-slate-100 font-bold block">{selectedDispatchOrder.used_scrap_rak}</span>
                        </div>
                    )}
                </div>

                <form onSubmit={handleDispatchOrderSubmit} className="space-y-4 text-xs">
                    <div>
                        <label className="text-slate-400 block mb-1.5 font-semibold">Pilih Divisi Tujuan Eksekusi:</label>
                        <select 
                            value={targetDivChoice} 
                            onChange={e => setTargetDivChoice(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-semibold focus:border-cyan-400"
                        >
                            <option value="divisi_ht">✂️ Divisi HT (Cutting & Tempering)</option>
                            <option value="divisi_gm">✨ Divisi GM (Gosok Mesin)</option>
                            <option value="divisi_bv">💎 Divisi BV (Beveling)</option>
                            <option value="divisi_etsa">🌫️ Divisi Etsa (Sandblast Blur)</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                        <button type="button" onClick={() => onClose()} className="px-4 py-2 bg-slate-800 rounded text-slate-300 font-semibold">Batal</button>
                        <button type="submit" className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 font-bold text-slate-950 rounded shadow-md">
                            Kirim Ke Divisi →
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
