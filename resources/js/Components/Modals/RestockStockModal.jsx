import React, { useState, useEffect } from 'react';
import { RotateCcw, X, Check, Boxes, CheckCircle2, AlertCircle } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function RestockStockModal({
    show,
    onClose,
    selectedStockItem = null,
    sheetGlasses = [],
    onRestockSuccess
}) {
    if (!show) return null;

    const isFocused = !!selectedStockItem;
    const [selectedId, setSelectedId] = useState(selectedStockItem ? String(selectedStockItem.id) : '');
    const [addQty, setAddQty] = useState(10);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Sync selected item saat modal dibuka atau selectedStockItem berubah
    useEffect(() => {
        if (selectedStockItem) {
            setSelectedId(String(selectedStockItem.id));
            setAddQty(10);
            setNotes('');
        } else {
            setSelectedId('');
            setAddQty(10);
            setNotes('');
        }
    }, [selectedStockItem, show]);

    const activeItem = isFocused 
        ? selectedStockItem 
        : sheetGlasses.find(g => String(g.id) === String(selectedId)) || null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!activeItem) {
            alert('Silakan pilih jenis kaca yang ingin direstock terlebih dahulu!');
            return;
        }

        const qtyNum = parseInt(addQty);
        if (isNaN(qtyNum) || qtyNum < 1) {
            alert('Masukkan jumlah restok minimal 1!');
            return;
        }

        setIsSubmitting(true);
        router.post(route('inventory.sheet_glasses.restock', activeItem.id), {
            add_qty: qtyNum,
            notes: notes || null
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
                if (onRestockSuccess) onRestockSuccess(activeItem.id, qtyNum);
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
                {/* HEADER MODAL */}
                <div className="flex justify-between items-center border-b border-slate-200 pb-3.5">
                    <div className="flex items-center gap-2.5">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                            isFocused ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-[#1b68b0]/10 text-[#1b68b0]'
                        }`}>
                            <RotateCcw className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-[#242222] text-base">
                                    {isFocused ? 'Restock Kaca Terpilih' : 'Restock Kaca Lembaran'}
                                </h3>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                    isFocused 
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                        : 'bg-blue-50 text-[#1b68b0] border-blue-200'
                                }`}>
                                    {isFocused ? 'Fokus Barang Tabel' : 'Pilih dari Daftar'}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">
                                {isFocused 
                                    ? `Kode: ${activeItem?.item_code} • ${activeItem?.name}` 
                                    : 'Pilih jenis kaca dari seluruh stok lembaran baru di gudang'}
                            </p>
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

                {/* BANNER NOTIFIKASI MODE FOKUS / BEBAS */}
                {isFocused ? (
                    <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-800 flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                            <span className="font-bold">Mode Fokus Barang Terpilih:</span> Restock terkunci langsung pada item ini. Anda tidak perlu memilih barang lagi.
                        </div>
                    </div>
                ) : (
                    <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-3 text-xs text-[#1b68b0] flex items-center gap-2.5">
                        <Boxes className="w-4 h-4 text-[#1b68b0] shrink-0" />
                        <div>
                            <span className="font-bold">Mode Restock Bebas:</span> Silakan pilih jenis kaca yang ingin ditambah stoknya dari dropdown di bawah.
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    {/* DROPDOWN HANYA DITAMPILKAN JIKA DIBUKA DARI CARD ATAS (BUKAN DARI BARIS TABEL) */}
                    {!isFocused && (
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold">Pilih Jenis Kaca Lembaran:*</label>
                            <select
                                value={selectedId}
                                onChange={e => setSelectedId(e.target.value)}
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-[#1b68b0] focus:bg-white cursor-pointer"
                            >
                                <option value="">-- Pilih Jenis Kaca yang Ingin Direstock --</option>
                                {sheetGlasses.map(g => (
                                    <option key={g.id} value={g.id}>
                                        [{g.item_code}] {g.name} — Sisa: {g.qty} {g.unit || 'Lembar'} ({g.status})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* DETAIL KACA YANG TERPILIH */}
                    {activeItem ? (
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Kode Kaca:</span>
                                <strong className="text-[#1b68b0] font-mono text-xs">{activeItem.item_code}</strong>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Nama Barang:</span>
                                <strong className="text-slate-800 text-right max-w-xs">{activeItem.name}</strong>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Kategori / Jenis:</span>
                                <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[11px] font-bold text-slate-700">
                                    {activeItem.category || activeItem.glass_type || '-'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Ukuran Standard:</span>
                                <strong className="text-slate-800 font-mono">
                                    {activeItem.size || `${activeItem.length_cm} x ${activeItem.width_cm} cm`}
                                </strong>
                            </div>
                            <div className="flex justify-between items-center border-t border-slate-200 pt-2.5">
                                <span className="text-slate-500">Stok Saat Ini di Rak:</span>
                                <strong className="text-[#70b03c] font-mono font-bold text-sm">
                                    {activeItem.qty} {activeItem.unit || 'Lembar'}
                                </strong>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-center text-slate-500">
                            Pilih salah satu kaca lembaran dari dropdown di atas untuk melihat detail stok.
                        </div>
                    )}

                    {/* INPUT JUMLAH RESTOK */}
                    <div>
                        <label className="text-slate-700 block mb-1 font-semibold">Jumlah Lembar Masuk / Restock (+):*</label>
                        <input
                            type="number"
                            min="1"
                            required
                            disabled={!activeItem}
                            value={addQty}
                            onChange={e => setAddQty(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm text-slate-800 font-mono font-bold focus:border-[#1b68b0] focus:bg-white disabled:opacity-50"
                            placeholder="e.g. 10"
                            autoFocus={isFocused}
                        />
                    </div>

                    {/* INPUT CATATAN RESTOK */}
                    <div>
                        <label className="text-slate-700 block mb-1 font-semibold">Catatan Restock (Opsional):</label>
                        <input
                            type="text"
                            disabled={!activeItem}
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="e.g. Kiriman PO batch #25 dari supplier Asahimas"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:border-[#1b68b0] focus:bg-white disabled:opacity-50"
                        />
                    </div>

                    {/* FOOTER ACTIONS */}
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
                            disabled={isSubmitting || !activeItem}
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
