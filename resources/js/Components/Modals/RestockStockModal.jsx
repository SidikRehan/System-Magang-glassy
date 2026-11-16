import React, { useState, useEffect } from 'react';
import { Send, X, Boxes, CheckCircle2, Calculator, Store, FileText } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function RestockStockModal({
    show,
    onClose,
    selectedStockItem = null,
    sheetGlasses = [],
    onRestockSuccess
}) {
    const isFocused = !!selectedStockItem;
    const [selectedId, setSelectedId] = useState(selectedStockItem ? String(selectedStockItem.id) : '');
    const [addQty, setAddQty] = useState(10);
    const [buyPrice, setBuyPrice] = useState(0);
    const [supplierName, setSupplierName] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (selectedStockItem) {
            setSelectedId(String(selectedStockItem.id));
            setAddQty(10);
            setBuyPrice(Number(selectedStockItem.buy_price) || 0);
            setSupplierName(selectedStockItem.supplier_name || 'PT Asahimas Flat Glass Tbk');
            setNotes('');
        } else {
            setSelectedId('');
            setAddQty(10);
            setBuyPrice(0);
            setSupplierName('');
            setNotes('');
        }
    }, [selectedStockItem, show]);

    if (!show) return null;

    const activeItem = isFocused 
        ? selectedStockItem 
        : sheetGlasses.find(g => String(g.id) === String(selectedId)) || null;

    const handleSelectGlass = (idVal) => {
        setSelectedId(idVal);
        const found = sheetGlasses.find(g => String(g.id) === String(idVal));
        if (found) {
            setBuyPrice(Number(found.buy_price) || 0);
            setSupplierName(found.supplier_name || 'PT Asahimas Flat Glass Tbk');
        }
    };

    const estimatedTotal = (parseInt(addQty) || 0) * (parseFloat(buyPrice) || 0);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!activeItem) {
            alert('Silakan pilih jenis kaca yang ingin diajukan restok terlebih dahulu!');
            return;
        }

        const qtyNum = parseInt(addQty);
        if (isNaN(qtyNum) || qtyNum < 1) {
            alert('Masukkan jumlah pengajuan restok minimal 1!');
            return;
        }

        setIsSubmitting(true);
        router.post(route('inventory.sheet_glasses.restock', activeItem.id), {
            add_qty: qtyNum,
            buy_price: parseFloat(buyPrice) || 0,
            supplier_name: supplierName || activeItem.supplier_name || 'PT Asahimas Flat Glass Tbk',
            supplier_phone: activeItem.supplier_phone || null,
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
                        <div className="w-10 h-10 rounded-2xl bg-[#1b68b0]/10 flex items-center justify-center shrink-0 text-[#1b68b0]">
                            <Send className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-[#242222] text-base">
                                    Ajukan Restok Bahan Kaca ke Finance
                                </h3>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                    isFocused 
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                        : 'bg-blue-50 text-[#1b68b0] border-blue-200'
                                }`}>
                                    {isFocused ? 'Barang Terpilih' : 'Pilih dari Daftar'}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">
                                {isFocused 
                                    ? `Kode: ${activeItem?.item_code} • ${activeItem?.name}` 
                                    : 'Kirim pengajuan pembelian kaca produksi ke bagian Finance'}
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
                            <span className="font-bold">Mode Fokus Barang Terpilih:</span> Pengajuan restok terkunci langsung pada jenis kaca ini untuk diteruskan ke Finance.
                        </div>
                    </div>
                ) : (
                    <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-3 text-xs text-[#1b68b0] flex items-center gap-2.5">
                        <Boxes className="w-4 h-4 text-[#1b68b0] shrink-0" />
                        <div>
                            <span className="font-bold">Pilih Bahan Produksi:</span> Silakan pilih jenis kaca lembaran yang ingin diajukan pembeliannya ke Finance.
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    {!isFocused && (
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold">Pilih Jenis Kaca Lembaran:*</label>
                            <select
                                value={selectedId}
                                onChange={e => handleSelectGlass(e.target.value)}
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-[#1b68b0] focus:bg-white cursor-pointer"
                            >
                                <option value="">-- Pilih Jenis Kaca yang Ingin Diajukan Restok --</option>
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
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Kode Kaca:</span>
                                <strong className="text-[#1b68b0] font-mono text-xs">{activeItem.item_code}</strong>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Nama Barang:</span>
                                <strong className="text-slate-800 text-right max-w-xs">{activeItem.name}</strong>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Ukuran Standard:</span>
                                <strong className="text-slate-800 font-mono">
                                    {activeItem.size || `${activeItem.length_cm} x ${activeItem.width_cm} cm`}
                                </strong>
                            </div>
                            <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                                <span className="text-slate-500">Sisa Stok Saat Ini:</span>
                                <strong className="text-amber-700 font-mono font-bold text-sm">
                                    {activeItem.qty} {activeItem.unit || 'Lembar'}
                                </strong>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-center text-slate-500">
                            Pilih salah satu kaca lembaran dari dropdown di atas untuk melihat detail stok.
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="text-slate-700 block mb-1 font-bold">
                                Jumlah Lembar Diajukan (+) <span className="text-rose-500">*</span>
                            </label>
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

                        <div>
                            <label className="text-slate-700 block mb-1 font-bold">
                                Estimasi Harga Beli / Lembar (Rp)
                            </label>
                            <input
                                type="number"
                                min="0"
                                disabled={!activeItem}
                                value={buyPrice}
                                onChange={e => setBuyPrice(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm text-slate-800 font-mono font-bold focus:border-[#1b68b0] focus:bg-white disabled:opacity-50"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[#1b68b0] font-bold">
                            <Calculator className="w-4 h-4 shrink-0" />
                            <span>Estimasi Total Pembelian Bahan:</span>
                        </div>
                        <span className="font-mono font-black text-sm text-[#1b68b0]">
                            Rp {Number(estimatedTotal).toLocaleString('id-ID')}
                        </span>
                    </div>

                    <div>
                        <label className="text-slate-700 block mb-1 font-bold flex items-center gap-1.5">
                            <Store className="w-3.5 h-3.5 text-[#1b68b0]" />
                            <span>Supplier / Pabrik Kaca Tujuan:</span>
                        </label>
                        <input
                            type="text"
                            disabled={!activeItem}
                            value={supplierName}
                            onChange={e => setSupplierName(e.target.value)}
                            placeholder="Contoh: PT Asahimas Flat Glass Tbk"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:border-[#1b68b0] focus:bg-white disabled:opacity-50"
                        />
                    </div>

                    <div>
                        <label className="text-slate-700 block mb-1 font-bold flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-[#1b68b0]" />
                            <span>Catatan Pengajuan ke Finance (Opsional):</span>
                        </label>
                        <input
                            type="text"
                            disabled={!activeItem}
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="e.g. Kebutuhan produksi order prioritas minggu ini"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:border-[#1b68b0] focus:bg-white disabled:opacity-50"
                        />
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-[11px] text-amber-800 leading-relaxed">
                        Pengajuan ini akan langsung muncul di antrean <strong>Finance</strong>. Bagian Finance yang akan menyetujui, memesan ke supplier, dan mengunggah <strong>Nota Bukti Pembayaran</strong> hingga stok otomatis bertambah.
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
                            className="bg-[#1b68b0] hover:bg-[#15528c] text-white font-bold px-5 py-2.5 rounded-xl transition shadow-xs flex items-center gap-1.5 text-xs cursor-pointer disabled:opacity-50"
                        >
                            <Send className="w-3.5 h-3.5" />
                            <span>{isSubmitting ? 'Mengirim Pengajuan...' : 'Kirim Pengajuan ke Finance'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
