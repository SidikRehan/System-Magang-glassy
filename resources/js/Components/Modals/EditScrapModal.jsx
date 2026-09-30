import React, { useState, useEffect } from 'react';
import { Layers, X, Check, Loader2 } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function EditScrapModal({
    show,
    onClose,
    scrap,
    onSuccess
}) {
    if (!show || !scrap) return null;

    const [form, setForm] = useState({
        length_cm: scrap.length_cm || '',
        width_cm: scrap.width_cm || '',
        rak_location: scrap.rak_location || 'Rak A01',
        status: scrap.status || 'Layak Pakai',
        notes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (scrap) {
            setForm({
                length_cm: scrap.length_cm || '',
                width_cm: scrap.width_cm || '',
                rak_location: scrap.rak_location || 'Rak A01',
                status: scrap.status || 'Layak Pakai',
                notes: ''
            });
        }
    }, [scrap]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.length_cm || !form.width_cm) {
            alert('Mohon lengkapi ukuran Panjang (cm) dan Lebar (cm)!');
            return;
        }

        setIsSubmitting(true);
        router.post(route('scrap.update', scrap.id), form, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
                if (onSuccess) onSuccess();
                onClose();
            },
            onError: () => {
                setIsSubmitting(false);
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-800">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3.5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-[#1b68b0]/10 flex items-center justify-center text-[#1b68b0]">
                            <Layers className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#242222] text-base">
                                Edit Kaca Sisa (Scrap)
                            </h3>
                            <p className="text-xs text-slate-500 font-mono">Kode Sisa: {scrap.scrap_code} • {scrap.glass_type}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl p-1.5 transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Jenis Kaca</span>
                        <div className="font-bold text-[#242222] text-sm">{scrap.glass_type}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold">Panjang (cm):</label>
                            <input
                                type="number"
                                step="any"
                                min="1"
                                required
                                value={form.length_cm}
                                onChange={e => setForm({ ...form, length_cm: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-mono font-bold focus:border-[#1b68b0] focus:bg-white"
                            />
                        </div>
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold">Lebar (cm):</label>
                            <input
                                type="number"
                                step="any"
                                min="1"
                                required
                                value={form.width_cm}
                                onChange={e => setForm({ ...form, width_cm: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-mono font-bold focus:border-[#1b68b0] focus:bg-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold">Lokasi Rak:</label>
                            <input
                                type="text"
                                required
                                value={form.rak_location}
                                onChange={e => setForm({ ...form, rak_location: e.target.value })}
                                placeholder="cth: Rak A01, Rak B02"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-mono font-bold focus:border-[#1b68b0] focus:bg-white"
                            />
                        </div>
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold">Status Kondisi:</label>
                            <select
                                value={form.status}
                                onChange={e => setForm({ ...form, status: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-[#1b68b0] focus:bg-white cursor-pointer"
                            >
                                <option value="Layak Pakai">Layak Pakai</option>
                                <option value="Baret/Cacat">Baret / Cacat</option>
                                <option value="Afval/Pecah">Afval / Pecah</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-slate-700 block mb-1 font-semibold">Catatan / Alasan Perubahan (Opsional):</label>
                        <input
                            type="text"
                            value={form.notes}
                            onChange={e => setForm({ ...form, notes: e.target.value })}
                            placeholder="cth: Dipotong ulang pinggirannya karena baret..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:border-[#1b68b0] focus:bg-white"
                        />
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2.5 rounded-xl bg-[#70b03c] hover:bg-[#5f9733] text-white font-bold transition flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4" />
                                    <span>Simpan Perubahan</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
