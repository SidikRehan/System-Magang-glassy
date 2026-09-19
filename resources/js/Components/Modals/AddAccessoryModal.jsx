import React, { useState } from 'react';
import { Plug, X, Check } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function AddAccessoryModal({
    show,
    onClose,
    onSuccess
}) {
    if (!show) return null;

    const [form, setForm] = useState({
        name: '',
        buy_price: '',
        sell_price: '',
        qty: 0,
        unit: 'Pcs'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name || form.sell_price === '') {
            alert('Lengkapi nama aksesoris dan harga jual!');
            return;
        }

        setIsSubmitting(true);
        router.post(route('inventory.accessories.store'), form, {
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
                            <Plug className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#242222] text-base">
                                Tambah Aksesoris / Hardware Kaca
                            </h3>
                            <p className="text-xs text-slate-500 font-mono">Registrasi komponen dan aksesoris perlengkapan baru</p>
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
                        <label className="text-slate-700 block mb-1 font-semibold">Nama Aksesoris Kaca Baru:*</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Lem Silikon Bening Glass Sealant"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:border-[#1b68b0] focus:bg-white"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold">Harga Beli Supplier (Rp):</label>
                            <input
                                type="number"
                                min="0"
                                placeholder="e.g. 25000"
                                value={form.buy_price}
                                onChange={e => setForm({ ...form, buy_price: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-amber-700 font-mono font-bold focus:border-amber-500 focus:bg-white"
                            />
                        </div>
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold">Harga Jual Customer (Rp):*</label>
                            <input
                                type="number"
                                min="0"
                                required
                                placeholder="e.g. 45000"
                                value={form.sell_price}
                                onChange={e => setForm({ ...form, sell_price: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[#5f9733] font-mono font-bold focus:border-[#70b03c] focus:bg-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold">Stok Awal (Qty):*</label>
                            <input
                                type="number"
                                min="0"
                                required
                                value={form.qty}
                                onChange={e => setForm({ ...form, qty: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-mono font-bold focus:border-[#1b68b0] focus:bg-white"
                            />
                        </div>
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold">Satuan Unit:</label>
                            <select
                                value={form.unit}
                                onChange={e => setForm({ ...form, unit: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-[#1b68b0] focus:bg-white cursor-pointer"
                            >
                                <option value="Pcs">Pcs</option>
                                <option value="Set">Set</option>
                                <option value="Pasang">Pasang</option>
                                <option value="Batang">Batang</option>
                                <option value="Meter">Meter</option>
                                <option value="Box">Box</option>
                                <option value="Roll">Roll</option>
                            </select>
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
                            <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Aksesoris'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
