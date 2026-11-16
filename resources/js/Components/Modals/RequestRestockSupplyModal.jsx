import React, { useState, useEffect } from 'react';
import { Send, X, Boxes, CheckCircle2, MapPin, Calculator, Store } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function RequestRestockSupplyModal({
    show,
    onClose,
    suppliesList = [],
    prefillSupply = null,
    onSuccess
}) {
    const isFocused = !!prefillSupply;
    const [supplyId, setSupplyId] = useState(prefillSupply ? String(prefillSupply.id) : '');
    const [requestQty, setRequestQty] = useState(
        prefillSupply ? Math.max(10, ((prefillSupply.min_stock || 5) * 2)) : 10
    );
    const [estimatedPrice, setEstimatedPrice] = useState(50000);
    const [supplierName, setSupplierName] = useState('Toko Teknik & Sparepart Pabrik');
    const [priority, setPriority] = useState(
        prefillSupply?.status === 'Habis' ? 'Mendesak / Stok Habis' : 'Mendesak / Stok Menipis'
    );
    const [notes, setNotes] = useState(
        prefillSupply 
            ? `Stok sisa ${prefillSupply.stock_qty ?? prefillSupply.qty ?? 0} ${prefillSupply.unit || 'unit'} (Lokasi: ${prefillSupply.location || 'Gudang'}). Mohon disetujui & dipesankan.` 
            : ''
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (prefillSupply) {
            setSupplyId(String(prefillSupply.id));
            setRequestQty(Math.max(10, ((prefillSupply.min_stock || 5) * 2)));
            setEstimatedPrice(50000);
            setSupplierName('Toko Teknik & Sparepart Pabrik');
            setPriority(prefillSupply.status === 'Habis' ? 'Mendesak / Stok Habis' : 'Mendesak / Stok Menipis');
            setNotes(`Stok sisa ${prefillSupply.stock_qty ?? prefillSupply.qty ?? 0} ${prefillSupply.unit || 'unit'} (Lokasi: ${prefillSupply.location || 'Gudang'}). Mohon disetujui & dipesankan.`);
        } else {
            setSupplyId('');
            setRequestQty(10);
            setEstimatedPrice(50000);
            setSupplierName('Toko Teknik & Sparepart Pabrik');
            setPriority('Mendesak / Stok Menipis');
            setNotes('');
        }
    }, [prefillSupply, show]);

    if (!show) return null;

    const activeSupply = isFocused 
        ? prefillSupply 
        : suppliesList.find(s => String(s.id) === String(supplyId)) || null;

    const estimatedTotal = (parseInt(requestQty) || 0) * (parseFloat(estimatedPrice) || 0);

    const handleSubmit = (e) => {
        e.preventDefault();
        const targetId = activeSupply ? activeSupply.id : supplyId;
        if (!targetId) {
            alert('Pilih sparepart / perlengkapan yang ingin diajukan restok!');
            return;
        }

        const qtyNum = parseInt(requestQty);
        if (isNaN(qtyNum) || qtyNum < 1) {
            alert('Masukkan jumlah pengajuan restok minimal 1!');
            return;
        }

        setIsSubmitting(true);
        router.post(route('inventory.supplies.restock_request', targetId), {
            request_qty: qtyNum,
            estimated_price: parseFloat(estimatedPrice) || 0,
            supplier_name: supplierName || 'Toko Teknik & Sparepart Pabrik',
            notes: `[Prioritas: ${priority}] ${notes || '-'}`
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
                {/* HEADER MODAL */}
                <div className="flex justify-between items-center border-b border-slate-200 pb-3.5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-[#1b68b0]/10 flex items-center justify-center shrink-0 text-[#1b68b0]">
                            <Send className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-[#242222] text-base">
                                    Ajukan Pembelian Sparepart / Inventaris
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
                                    ? `Kode: ${activeSupply?.item_code} • ${activeSupply?.name}` 
                                    : 'Kirim pengajuan pembelian sparepart & perlengkapan ke Finance'}
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
                            <span className="font-bold">Mode Fokus Barang Terpilih:</span> Pengajuan pembelian terkunci pada item ini dan akan dikirim ke antrean Finance.
                        </div>
                    </div>
                ) : (
                    <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-3 text-xs text-[#1b68b0] flex items-center gap-2.5">
                        <Boxes className="w-4 h-4 text-[#1b68b0] shrink-0" />
                        <div>
                            <span className="font-bold">Mode Pengajuan Bebas:</span> Silakan pilih sparepart / perlengkapan dari daftar di bawah.
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    {!isFocused && (
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold">Pilih Sparepart / Perlengkapan:*</label>
                            <select
                                value={supplyId}
                                onChange={e => {
                                    setSupplyId(e.target.value);
                                    const found = suppliesList.find(s => String(s.id) === String(e.target.value));
                                    if (found) {
                                        setRequestQty(Math.max(10, ((found.min_stock || 5) * 2)));
                                        setPriority(found.status === 'Habis' ? 'Mendesak / Stok Habis' : 'Mendesak / Stok Menipis');
                                        setNotes(`Stok sisa ${found.stock_qty ?? found.qty ?? 0} ${found.unit || 'unit'} (Lokasi: ${found.location || 'Gudang'}). Mohon disetujui & dipesankan.`);
                                    }
                                }}
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-[#1b68b0] focus:bg-white cursor-pointer"
                            >
                                <option value="">-- Pilih Barang Perlengkapan / Sparepart --</option>
                                {suppliesList.map(s => (
                                    <option key={s.id} value={s.id}>
                                        [{s.item_code}] {s.name} (Sisa Stok: {s.stock_qty ?? s.qty ?? 0} {s.unit} - Status: {s.status})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* DETAIL ITEM YANG TERPILIH */}
                    {activeSupply && (
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Kode Barang:</span>
                                <strong className="text-[#1b68b0] font-mono text-xs">{activeSupply.item_code}</strong>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Nama Barang:</span>
                                <strong className="text-slate-800 text-right max-w-xs">{activeSupply.name}</strong>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Kategori:</span>
                                <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[11px] font-bold text-slate-700">
                                    {activeSupply.category || 'Perlengkapan'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-slate-400" />
                                    <span>Lokasi Simpan:</span>
                                </span>
                                <strong className="text-slate-700 font-mono text-xs">{activeSupply.location || '-'}</strong>
                            </div>
                            <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                                <span className="text-slate-500">Sisa Stok Gudang:</span>
                                <span className="font-extrabold font-mono text-xs text-amber-700">
                                    {activeSupply.stock_qty ?? activeSupply.qty ?? 0} {activeSupply.unit || 'unit'}
                                    <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-sans font-bold border border-slate-200 bg-white text-slate-600">
                                        Status: {activeSupply.status}
                                    </span>
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="text-slate-700 block mb-1 font-bold">Jumlah Diajukan:*</label>
                            <input
                                type="number"
                                min="1"
                                value={requestQty}
                                onChange={e => setRequestQty(e.target.value)}
                                required
                                autoFocus={isFocused}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-amber-700 font-mono font-bold focus:border-[#1b68b0] focus:bg-white"
                            />
                        </div>
                        <div>
                            <label className="text-slate-700 block mb-1 font-bold">Est. Harga Satuan (Rp):</label>
                            <input
                                type="number"
                                min="0"
                                value={estimatedPrice}
                                onChange={e => setEstimatedPrice(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-mono font-bold focus:border-[#1b68b0] focus:bg-white"
                            />
                        </div>
                        <div>
                            <label className="text-slate-700 block mb-1 font-bold">Prioritas:</label>
                            <select
                                value={priority}
                                onChange={e => setPriority(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-[#1b68b0] focus:bg-white cursor-pointer"
                            >
                                <option value="Biasa">Biasa (Rutin)</option>
                                <option value="Mendesak / Stok Menipis">Mendesak / Menipis</option>
                                <option value="Mendesak / Stok Habis">CRITICAL: Habis</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[#1b68b0] font-bold">
                            <Calculator className="w-4 h-4 shrink-0" />
                            <span>Estimasi Total Anggaran Pembelian:</span>
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
                            placeholder="Contoh: Toko Teknik & Sparepart Pabrik"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:border-[#1b68b0] focus:bg-white"
                        />
                    </div>

                    <div>
                        <label className="text-slate-700 block mb-1 font-bold">Catatan & Alasan Pengajuan ke Finance:</label>
                        <textarea
                            rows="2"
                            placeholder="Contoh: Stok sisa sedikit, dibutuhkan untuk pengerjaan mesin potong dan beveling."
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:border-[#1b68b0] focus:bg-white"
                        />
                    </div>

                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-[11px] text-amber-900">
                        <span className="font-bold block mb-0.5">Alur Persetujuan & Pemesanan Finance:</span>
                        <p>Pengajuan ini otomatis masuk ke antrean <strong>Finance</strong>. Bagian Finance yang akan menyetujui, memesan barang ke supplier, dan mengunggah <strong>Nota Bukti Pembayaran</strong>.</p>
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
                            <Send className="w-4 h-4" />
                            <span>{isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan ke Finance'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
