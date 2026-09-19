import React, { useState } from 'react';
import { Archive, X, Check } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function AddSupplyModal({
    show,
    onClose,
    onSuccess
}) {
    if (!show) return null;

    const [form, setForm] = useState({
        name: '',
        category: 'APD & Keselamatan Kerja',
        qty: 10,
        min_stock: 5,
        unit: 'Pcs'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name) {
            alert('Masukkan nama perlengkapan!');
            return;
        }

        setIsSubmitting(true);
        router.post(route('inventory.supplies.store'), form, {
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
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-800">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3.5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-[#1b68b0]/10 flex items-center justify-center text-[#1b68b0]">
                            <Archive className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#242222] text-base">
                                Tambah Perlengkapan Gudang Baru
                            </h3>
                            <p className="text-xs text-slate-500 font-mono">Registrasi barang perlengkapan operasional & consumables gudang</p>
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
                        <label className="text-slate-700 block mb-1 font-semibold">Kategori Perlengkapan:</label>
                        <select
                            value={form.category}
                            onChange={e => setForm({ ...form, category: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-[#1b68b0] focus:bg-white cursor-pointer"
                        >
                            <option value="APD & Keselamatan Kerja">APD & Keselamatan Kerja (Sarung Tangan, Kacamata)</option>
                            <option value="Perkakas Tangan Habis Pakai">Perkakas Tangan Habis Pakai (Cutter, Pisau)</option>
                            <option value="Peralatan Packaging & Pengiriman">Packaging & Pengiriman (Lakban, Plastik)</option>
                            <option value="Bahan Kimia & Kebersihan Kaca">Bahan Kimia & Cleaning (Pembersih Kaca, Spiritus)</option>
                            <option value="Consumables Mesin Potong & Gosok">Consumables Mesin (Amplas, Pad)</option>
                            <option value="Perawatan Mesin & Pelumas">Pelumas & Maintenance (Oli, Penetran)</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-slate-700 block mb-1 font-semibold">Nama Perlengkapan / Barang Habis Pakai:*</label>
                        <input
                            type="text"
                            placeholder="Contoh: Sarung Tangan Safety Antigores / Lakban Bening"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:border-[#1b68b0] focus:bg-white"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold">Stok Awal:*</label>
                            <input
                                type="number"
                                min="0"
                                value={form.qty}
                                onChange={e => setForm({ ...form, qty: e.target.value })}
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-mono font-bold focus:border-[#1b68b0] focus:bg-white"
                            />
                        </div>
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold">Min. Stok (Alert):</label>
                            <input
                                type="number"
                                min="1"
                                value={form.min_stock}
                                onChange={e => setForm({ ...form, min_stock: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-amber-700 font-mono font-bold focus:border-amber-500 focus:bg-white"
                            />
                        </div>
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold">Satuan Unit:</label>
                            <input
                                type="text"
                                placeholder="Pcs/Pasang/Roll/Box"
                                value={form.unit}
                                onChange={e => setForm({ ...form, unit: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:border-[#1b68b0] focus:bg-white"
                            />
                        </div>
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
                            <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Barang Baru'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
