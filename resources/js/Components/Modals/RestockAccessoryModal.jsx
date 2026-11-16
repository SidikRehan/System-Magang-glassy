import React, { useState, useEffect } from 'react';
import { Send, X, Calculator, Store, FileText } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function RestockAccessoryModal({
    show,
    onClose,
    selectedAccItem,
    onSuccess
}) {
    const [addQty, setAddQty] = useState(10);
    const [buyPrice, setBuyPrice] = useState(0);
    const [supplierName, setSupplierName] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (selectedAccItem) {
            setAddQty(10);
            setBuyPrice(Number(selectedAccItem.buy_price) || 0);
            setSupplierName('Toko Hardware & Aksesoris Kaca');
            setNotes('');
        }
    }, [selectedAccItem, show]);

    if (!show || !selectedAccItem) return null;

    const estimatedTotal = (parseInt(addQty) || 0) * (parseFloat(buyPrice) || 0);

    const handleSubmit = (e) => {
        e.preventDefault();
        const qtyNum = parseInt(addQty);
        if (isNaN(qtyNum) || qtyNum < 1) {
            alert('Masukkan jumlah pengajuan restok minimal 1!');
            return;
        }

        setIsSubmitting(true);
        router.post(route('inventory.accessories.request_restock', selectedAccItem.id), {
            add_qty: qtyNum,
            buy_price: parseFloat(buyPrice) || 0,
            supplier_name: supplierName || 'Toko Hardware & Aksesoris Kaca',
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
                        <div className="w-10 h-10 rounded-2xl bg-[#1b68b0]/10 flex items-center justify-center text-[#1b68b0]">
                            <Send className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#242222] text-base">
                                Ajukan Restok Aksesoris
                            </h3>
                            <p className="text-xs text-slate-500">Kirim pengajuan restok ke bagian Finance untuk disetujui</p>
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
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">Kode Aksesoris:</span>
                            <strong className="text-[#1b68b0] font-mono font-bold">{selectedAccItem.acc_code}</strong>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">Nama Barang:</span>
                            <strong className="text-[#242222] font-bold text-right">{selectedAccItem.name}</strong>
                        </div>
                        <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                            <span className="text-slate-500">Sisa Stok Saat Ini:</span>
                            <strong className="text-amber-700 font-mono font-bold">{selectedAccItem.qty} {selectedAccItem.unit || 'Pcs'}</strong>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="text-slate-700 block mb-1 font-bold">
                                Jumlah Unit Diajukan (+) <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    value={addQty}
                                    onChange={e => setAddQty(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 pr-12 text-sm text-slate-800 font-mono font-bold focus:border-[#1b68b0] focus:bg-white focus:outline-none"
                                    placeholder="10"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                                    {selectedAccItem.unit || 'Pcs'}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="text-slate-700 block mb-1 font-bold">
                                Estimasi Harga Beli / {selectedAccItem.unit || 'Pcs'} (Rp)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={buyPrice}
                                onChange={e => setBuyPrice(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm text-slate-800 font-mono font-bold focus:border-[#1b68b0] focus:bg-white focus:outline-none"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[#1b68b0] font-bold">
                            <Calculator className="w-4 h-4 shrink-0" />
                            <span>Estimasi Total Anggaran Restok:</span>
                        </div>
                        <span className="font-mono font-black text-sm text-[#1b68b0]">
                            Rp {Number(estimatedTotal).toLocaleString('id-ID')}
                        </span>
                    </div>

                    <div>
                        <label className="text-slate-700 block mb-1 font-bold flex items-center gap-1.5">
                            <Store className="w-3.5 h-3.5 text-[#1b68b0]" />
                            <span>Toko / Supplier Tujuan Pembelian:</span>
                        </label>
                        <input
                            type="text"
                            value={supplierName}
                            onChange={e => setSupplierName(e.target.value)}
                            placeholder="Contoh: Toko Hardware & Fitting Kaca Bandung"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:border-[#1b68b0] focus:bg-white focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="text-slate-700 block mb-1 font-bold flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-[#1b68b0]" />
                            <span>Catatan Kebutuhan Restok (Opsional):</span>
                        </label>
                        <input
                            type="text"
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Contoh: Stok menipis untuk kebutuhan pesanan proyek minggu ini"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:border-[#1b68b0] focus:bg-white focus:outline-none"
                        />
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-[11px] text-amber-800 leading-relaxed">
                        Pengajuan ini akan langsung muncul di antrean <strong>Finance</strong>. Stok aksesoris akan otomatis bertambah setelah Finance menyetujui dan mengunggah <strong>Nota Bukti Pembayaran</strong>.
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
                            <Send className="w-3.5 h-3.5" />
                            <span>{isSubmitting ? 'Mengirim Pengajuan...' : 'Kirim Pengajuan ke Finance'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
