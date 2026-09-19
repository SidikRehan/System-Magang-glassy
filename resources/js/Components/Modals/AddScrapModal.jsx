import React from 'react';
import { Layers, Check, X, Ruler, MapPin, Sparkles } from 'lucide-react';

export default function AddScrapModal({
    show,
    onClose,
    scrapForm,
    setScrapForm,
    handleCreateScrap,
    sheetGlasses = []
}) {
    if (!show) return null;

    const l = parseFloat(scrapForm.length_cm) || 0;
    const w = parseFloat(scrapForm.width_cm) || 0;
    const areaM2 = (l > 0 && w > 0) ? ((l * w) / 10000).toFixed(4) : '0.0000';

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-800">
                {/* Header */}
                <div className="flex justify-between items-center border-b border-slate-200 pb-3.5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-[#1b68b0]/10 flex items-center justify-center text-[#1b68b0]">
                            <Layers className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#242222] text-base">
                                Tambah Kaca Sisa Potong / Scrap
                            </h3>
                            <p className="text-xs text-slate-500 font-mono">WMS Rak Kaca Sisa Layak Pakai</p>
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

                <form onSubmit={handleCreateScrap} className="space-y-4 text-xs">
                    {/* Jenis Kaca */}
                    <div className="space-y-1.5">
                        <label className="text-slate-700 font-semibold block flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#1b68b0]" />
                            <span>Pilih Jenis Kaca:</span>
                        </label>
                        <select
                            required
                            value={scrapForm.glass_type || ''}
                            onChange={e => setScrapForm('glass_type', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-[#1b68b0] focus:bg-white text-xs cursor-pointer"
                        >
                            <option value="">-- Pilih Jenis Kaca Sisa --</option>
                            {sheetGlasses.map(g => (
                                <option key={g.id || g.item_code} value={g.name}>
                                    {g.name} ({g.category || 'Kaca'} - {g.thickness_mm || 5}mm)
                                </option>
                            ))}
                            <option value="Kaca Cermin 5 mm polos">Kaca Cermin 5 mm polos</option>
                            <option value="Kaca Bening 5 mm polos">Kaca Bening 5 mm polos</option>
                            <option value="Kaca Bening 8 mm polos">Kaca Bening 8 mm polos</option>
                            <option value="Kaca Tempered 10 mm">Kaca Tempered 10 mm</option>
                            <option value="Kaca Tempered 12 mm">Kaca Tempered 12 mm</option>
                        </select>
                    </div>

                    {/* Dimensi Kaca Sisa: Panjang & Lebar Terpisah */}
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                            <label className="text-slate-800 font-bold block flex items-center gap-1.5">
                                <Ruler className="w-4 h-4 text-[#1b68b0]" />
                                <span>Dimensi Potongan Sisa (cm):</span>
                            </label>
                            <span className="text-[11px] font-mono text-[#1b68b0] bg-[#1b68b0]/10 px-2 py-0.5 rounded-md font-bold">
                                Luas: {areaM2} m²
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-slate-600 block mb-1 font-semibold text-[11px]">Panjang (cm):</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="1"
                                    required
                                    placeholder="e.g. 80"
                                    value={scrapForm.length_cm || ''}
                                    onChange={e => setScrapForm('length_cm', e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono font-bold text-sm focus:border-[#1b68b0] focus:ring-2 focus:ring-[#1b68b0]/15"
                                />
                            </div>
                            <div>
                                <label className="text-slate-600 block mb-1 font-semibold text-[11px]">Lebar (cm):</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="1"
                                    required
                                    placeholder="e.g. 50"
                                    value={scrapForm.width_cm || ''}
                                    onChange={e => setScrapForm('width_cm', e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono font-bold text-sm focus:border-[#1b68b0] focus:ring-2 focus:ring-[#1b68b0]/15"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Lokasi Rak Penyimpanan */}
                    <div className="space-y-2">
                        <label className="text-slate-700 font-semibold block flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-amber-600" />
                            <span>Lokasi Rak Penyimpanan:</span>
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Rak A01"
                            value={scrapForm.rak_location || ''}
                            onChange={e => setScrapForm('rak_location', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-mono font-bold focus:border-[#1b68b0] focus:bg-white text-xs"
                        />
                        <div className="flex flex-wrap gap-1.5">
                            {['Rak A01', 'Rak A02', 'Rak B01', 'Rak B02', 'Rak C01', 'Rak F07'].map(rak => (
                                <button
                                    key={rak}
                                    type="button"
                                    onClick={() => setScrapForm('rak_location', rak)}
                                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition cursor-pointer ${
                                        scrapForm.rak_location === rak
                                            ? 'bg-[#1b68b0] border-[#1b68b0] text-white font-bold shadow-xs'
                                            : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {rak}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 flex justify-end gap-2.5 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl transition text-xs cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="bg-[#70b03c] hover:bg-[#5f9733] text-white font-bold px-5 py-2.5 rounded-xl transition shadow-xs flex items-center gap-1.5 text-xs cursor-pointer"
                        >
                            <Check className="w-4 h-4" />
                            <span>Simpan Kaca ke Rak</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
