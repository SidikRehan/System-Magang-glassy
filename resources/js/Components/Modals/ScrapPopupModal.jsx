import React from 'react';

export default function ScrapPopupModal({
    show,
    onClose,
    form,
    setForm,
    onSubmit
}) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xl z-[60] flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-[0_0_50px_rgba(245,158,11,0.18)] space-y-5 relative overflow-hidden my-auto">
                
                <div className="flex justify-between items-center border-b border-slate-800 pb-3.5">
                    <h3 className="font-extrabold text-base text-amber-400 flex items-center gap-2">
                        🧩 Input Kaca Sisa Potongan (Rak Storage)
                    </h3>
                    <button 
                        onClick={onClose} 
                        className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full w-8 h-8 flex items-center justify-center transition border border-slate-700 text-lg font-bold"
                    >&times;</button>
                </div>

                <form onSubmit={onSubmit} className="space-y-4 text-xs">
                    <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                        <span className="text-[11px] text-slate-400 block font-semibold">Jenis Kaca Kategori Potongan:</span>
                        <input 
                            type="text" 
                            required 
                            value={form.glass_type} 
                            onChange={e => setForm(s => ({ ...s, glass_type: e.target.value }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-cyan-300 font-extrabold focus:border-amber-400 text-sm" 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-slate-300 font-bold block">Panjang Sisa (cm):</label>
                            <input 
                                type="number" 
                                step="0.1" 
                                required 
                                placeholder="cth: 40.5"
                                value={form.length_cm} 
                                onChange={e => setForm(s => ({ ...s, length_cm: e.target.value }))}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-amber-300 font-mono font-bold text-lg focus:border-amber-400" 
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-slate-300 font-bold block">Lebar Sisa (cm):</label>
                            <input 
                                type="number" 
                                step="0.1" 
                                required 
                                placeholder="cth: 30.0"
                                value={form.width_cm} 
                                onChange={e => setForm(s => ({ ...s, width_cm: e.target.value }))}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-amber-300 font-mono font-bold text-lg focus:border-amber-400" 
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-slate-300 font-bold block">Lokasi Rak Penimpanan Sisa:</label>
                        <input 
                            type="text" 
                            required 
                            placeholder="cth: Rak A02"
                            value={form.rak_location} 
                            onChange={e => setForm(s => ({ ...s, rak_location: e.target.value }))}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-mono font-bold focus:border-amber-400 text-sm" 
                        />
                    </div>

                    {/* RINGKASAN STOK RAK TERSIMPAN */}
                    <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-[11px] space-y-1.5">
                        <div className="text-slate-400 font-bold flex justify-between">
                            <span>📦 Pilih Lokasi Rak Cepat:</span>
                            <span className="text-amber-400 font-mono">Format Sisa Layak Pakai</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {['Rak A01', 'Rak A02', 'Rak B01', 'Rak B02', 'Lantai Gudang'].map(rak => (
                                <button
                                    key={rak}
                                    type="button"
                                    onClick={() => setForm(s => ({ ...s, rak_location: rak }))}
                                    className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                                        form.rak_location === rak 
                                        ? 'bg-amber-500 border-amber-400 text-slate-950' 
                                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:border-slate-600'
                                    }`}
                                >
                                    {rak}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition text-xs"
                        >Batal</button>
                        <button 
                            type="submit" 
                            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition shadow-[0_0_15px_rgba(245,158,11,0.3)] flex items-center gap-1.5"
                        >
                            <span>💾 Simpan Kaca ke Rak</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
