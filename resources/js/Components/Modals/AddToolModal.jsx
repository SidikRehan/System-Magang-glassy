import React, { useState } from 'react';
import { Wrench, X, Check } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function AddToolModal({
    show,
    onClose,
    onSuccess
}) {
    if (!show) return null;

    const [form, setForm] = useState({
        name: '',
        category: 'Mesin Bor & Potong',
        total_qty: 1,
        condition: 'Baik',
        location: 'Rak Utama',
        notes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name) {
            alert('Masukkan nama alat / mesin!');
            return;
        }

        setIsSubmitting(true);
        router.post(route('inventory.tools.store'), form, {
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
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-800">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3.5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-[#1b68b0]/10 flex items-center justify-center text-[#1b68b0]">
                            <Wrench className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#242222] text-base">
                                Tambah Alat Penunjang / Mesin Baru
                            </h3>
                            <p className="text-xs text-slate-500 font-mono">Registrasi mesin potong, bor, atau handtool ke inventaris</p>
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
                    <div>
                        <label className="text-slate-700 block mb-1 font-semibold">Kategori Alat / Mesin:</label>
                        <select
                            value={form.category}
                            onChange={e => setForm({ ...form, category: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-[#1b68b0] focus:bg-white cursor-pointer"
                        >
                            <option value="Mesin Bor & Potong">Mesin Bor & Potong (Kaca/Mesin)</option>
                            <option value="Mata Bor & Mata Potong">Mata Bor & Mata Potong Diamond</option>
                            <option value="Mesin & Alat Vakum">Mesin Suction Cup & Vakum Kaca</option>
                            <option value="Handtool & Kunci">Handtool, Obeng & Kunci L</option>
                            <option value="Peralatan Lapangan">Peralatan Lapangan (Tangga, dsb)</option>
                            <option value="Peralatan Umum & Kebersihan">Peralatan Umum & Kebersihan (Cangkul, Rumput)</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-slate-700 block mb-1 font-semibold">Nama Alat / Mesin Penunjang:*</label>
                        <input
                            type="text"
                            required
                            placeholder="Contoh: Mesin Bor Kaca Portable / Tangga Alumunium 4m"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:border-[#1b68b0] focus:bg-white"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold">Total Jumlah Unit:*</label>
                            <input
                                type="number"
                                min="1"
                                required
                                value={form.total_qty}
                                onChange={e => setForm({ ...form, total_qty: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[#5f9733] font-mono font-bold focus:border-[#70b03c] focus:bg-white"
                            />
                        </div>
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold">Kondisi Alat Awal:</label>
                            <select
                                value={form.condition}
                                onChange={e => setForm({ ...form, condition: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-[#1b68b0] focus:bg-white cursor-pointer"
                            >
                                <option value="Baik">Baik & Siap Pakai</option>
                                <option value="Perlu Servis">Perlu Servis</option>
                                <option value="Rusak">Rusak</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-slate-700 block mb-1 font-semibold">Lokasi Penyimpanan / Rak Storage:</label>
                        <input
                            type="text"
                            placeholder="Contoh: Rak Alat A1 / Gudang Belakang"
                            value={form.location}
                            onChange={e => setForm({ ...form, location: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:border-[#1b68b0] focus:bg-white"
                        />
                    </div>

                    <div>
                        <label className="text-slate-700 block mb-1 font-semibold">Catatan / Keterangan (Opsional):</label>
                        <textarea
                            rows="2"
                            placeholder="Catatan nomor seri, kelengkapan, dll."
                            value={form.notes}
                            onChange={e => setForm({ ...form, notes: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:border-[#1b68b0] focus:bg-white"
                        />
                    </div>

                    <div className="pt-2 flex justify-end gap-2.5 border-t border-slate-200">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl transition text-xs cursor-pointer"
                        >
                            Batal
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="bg-[#70b03c] hover:bg-[#5f9733] text-white font-bold px-5 py-2.5 rounded-xl transition shadow-xs flex items-center gap-1.5 text-xs cursor-pointer disabled:opacity-50"
                        >
                            <Check className="w-4 h-4" />
                            <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Alat'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
