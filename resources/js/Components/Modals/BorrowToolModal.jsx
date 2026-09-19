import React, { useState } from 'react';
import { Layers, X, Check } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function BorrowToolModal({
    show,
    onClose,
    toolsList = [],
    onSuccess
}) {
    if (!show) return null;

    const [toolId, setToolId] = useState('');
    const [qty, setQty] = useState(1);
    const [borrowerName, setBorrowerName] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!toolId || !borrowerName) {
            alert('Pilih alat dan masukkan nama peminjam!');
            return;
        }

        const selectedTool = toolsList.find(t => t.id === parseInt(toolId));
        const qtyNum = parseInt(qty);
        if (selectedTool && qtyNum > selectedTool.available_qty) {
            alert(`Stok alat tidak mencukupi! Tersedia: ${selectedTool.available_qty}`);
            return;
        }

        setIsSubmitting(true);
        router.post(route('inventory.tools.borrow', toolId), {
            borrower_name: borrowerName,
            qty: qtyNum,
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
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-800">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3.5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-[#1b68b0]/10 flex items-center justify-center text-[#1b68b0]">
                            <Layers className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#242222] text-base">
                                Form Peminjaman Alat Kerja
                            </h3>
                            <p className="text-xs text-slate-500 font-mono">Pencatatan peminjaman inventaris alat oleh teknisi</p>
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
                        <label className="text-slate-700 block mb-1 font-semibold">Pilih Alat / Mesin:*</label>
                        <select
                            required
                            value={toolId}
                            onChange={e => setToolId(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-[#1b68b0] focus:bg-white cursor-pointer"
                        >
                            <option value="">-- Pilih Alat Dari Inventory --</option>
                            {toolsList.map(t => (
                                <option key={t.id} value={t.id} disabled={t.available_qty <= 0}>
                                    [{t.tool_code}] {t.name} (Tersedia: {t.available_qty})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold">Jumlah Unit Dipinjam:*</label>
                            <input
                                type="number"
                                min="1"
                                required
                                value={qty}
                                onChange={e => setQty(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-amber-700 font-mono font-bold focus:border-amber-500 focus:bg-white"
                            />
                        </div>
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold">Nama Peminjam / Teknisi:*</label>
                            <input
                                type="text"
                                required
                                placeholder="Contoh: Teknisi Asep"
                                value={borrowerName}
                                onChange={e => setBorrowerName(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:border-[#1b68b0] focus:bg-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-slate-700 block mb-1 font-semibold">Keperluan Pekerjaan / Catatan:</label>
                        <textarea
                            rows="2"
                            placeholder="Contoh: Pengeboran lubang engsel sekat kaca tempered SPO-0129"
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
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
                            className="bg-[#1b68b0] hover:bg-[#15528c] text-white font-bold px-5 py-2.5 rounded-xl transition shadow-xs flex items-center gap-1.5 text-xs cursor-pointer disabled:opacity-50"
                        >
                            <Check className="w-4 h-4" />
                            <span>{isSubmitting ? 'Menyimpan...' : 'Catat Peminjaman'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
