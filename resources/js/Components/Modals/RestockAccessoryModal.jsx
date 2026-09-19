import React, { useState } from 'react';
import { RotateCcw, X, Check } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function RestockAccessoryModal({
    show,
    onClose,
    selectedAccItem,
    onSuccess
}) {
    if (!show || !selectedAccItem) return null;

    const [addQty, setAddQty] = useState(10);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        const qtyNum = parseInt(addQty);
        if (isNaN(qtyNum) || qtyNum < 1) {
            alert('Masukkan jumlah restok minimal 1!');
            return;
        }

        setIsSubmitting(true);
        router.post(route('inventory.accessories.restock', selectedAccItem.id), {
            add_qty: qtyNum,
            notes: notes || null
        }, {
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
                        <div className="w-10 h-10 rounded-2xl bg-[#70b03c]/10 flex items-center justify-center text-[#5f9733]">
                            <RotateCcw className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#242222] text-base">
                                Restock Aksesoris Masuk
                            </h3>
                            <p className="text-xs text-slate-500 font-mono">Penerimaan stok aksesoris ke gudang</p>
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
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">Kode Aksesoris:</span>
                            <strong className="text-[#1b68b0] font-mono font-bold">{selectedAccItem.acc_code}</strong>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">Nama Aksesoris:</span>
                            <strong className="text-slate-800 font-semibold">{selectedAccItem.name}</strong>
                        </div>
                        <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                            <span className="text-slate-500">Stok Saat Ini:</span>
                            <strong className="text-[#5f9733] font-mono font-bold">{selectedAccItem.qty} {selectedAccItem.unit || 'Pcs'}</strong>
                        </div>
                    </div>

                    <div>
                        <label className="text-slate-700 block mb-1 font-semibold">Jumlah Restock Masuk (+):</label>
                        <input
                            type="number"
                            min="1"
                            required
                            value={addQty}
                            onChange={e => setAddQty(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm text-slate-800 font-mono font-bold focus:border-[#1b68b0] focus:bg-white"
                            placeholder="e.g. 10"
                        />
                    </div>

                    <div>
                        <label className="text-slate-700 block mb-1 font-semibold">Catatan (Opsional):</label>
                        <input
                            type="text"
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="e.g. Pembelian dari Toko Hardware"
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
                            <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Restock'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
