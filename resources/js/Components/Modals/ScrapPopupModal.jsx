import React from 'react';
import { Layers, Save, X } from 'lucide-react';

export default function ScrapPopupModal({
    show,
    onClose,
    form,
    setForm,
    onSubmit
}) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[60] flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 relative my-auto text-slate-800">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3.5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                            <Layers className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-base">
                                Input Kaca Sisa Potongan (Rak Storage)
                            </h3>
                            <p className="text-xs text-slate-500">Pencatatan sisa potongan kaca layak pakai</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl p-1.5 transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-4 text-xs">
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
                        <span className="text-[11px] text-slate-500 block font-semibold">Jenis Kaca Kategori Potongan:</span>
                        <input 
                            type="text" 
                            required 
                            value={form.glass_type} 
                            onChange={e => setForm(s => ({ ...s, glass_type: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-[#1b68b0] font-bold focus:border-[#1b68b0] text-sm" 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-slate-700 font-bold block">Panjang Sisa (cm):</label>
                            <input 
                                type="number" 
                                step="0.1" 
                                required 
                                placeholder="cth: 40.5"
                                value={form.length_cm} 
                                onChange={e => setForm(s => ({ ...s, length_cm: e.target.value }))}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-mono font-bold text-lg focus:border-[#1b68b0] focus:bg-white" 
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-slate-700 font-bold block">Lebar Sisa (cm):</label>
                            <input 
                                type="number" 
                                step="0.1" 
                                required 
                                placeholder="cth: 30.0"
                                value={form.width_cm} 
                                onChange={e => setForm(s => ({ ...s, width_cm: e.target.value }))}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-mono font-bold text-lg focus:border-[#1b68b0] focus:bg-white" 
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-slate-700 font-bold block">Lokasi Rak Penyimpanan Sisa:</label>
                        <input 
                            type="text" 
                            required 
                            placeholder="cth: Rak A02"
                            value={form.rak_location} 
                            onChange={e => setForm(s => ({ ...s, rak_location: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-mono font-semibold focus:border-[#1b68b0] focus:bg-white text-sm" 
                        />
                    </div>

                    {/* RINGKASAN STOK RAK TERSIMPAN */}
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-[11px] space-y-1.5">
                        <div className="text-slate-600 font-bold flex justify-between">
                            <span>Pilih Lokasi Rak Cepat:</span>
                            <span className="text-amber-800 font-mono">Format Sisa Layak Pakai</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {['Rak A01', 'Rak A02', 'Rak B01', 'Rak B02', 'Lantai Gudang'].map(rak => (
                                <button
                                    key={rak}
                                    type="button"
                                    onClick={() => setForm(s => ({ ...s, rak_location: rak }))}
                                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                                        form.rak_location === rak 
                                        ? 'bg-amber-500 border-amber-600 text-slate-950 font-bold shadow-xs' 
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                    }`}
                                >
                                    {rak}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition text-xs cursor-pointer"
                        >
                            Batal
                        </button>
                        <button 
                            type="submit" 
                            className="px-6 py-2.5 bg-[#70b03c] hover:bg-[#5f9733] text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center gap-2 cursor-pointer"
                        >
                            <Save className="w-4 h-4" />
                            <span>Simpan Kaca ke Rak</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
