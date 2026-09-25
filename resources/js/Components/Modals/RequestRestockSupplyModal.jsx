import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Check, Boxes, CheckCircle2, Package, MapPin } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function RequestRestockSupplyModal({
    show,
    onClose,
    suppliesList = [],
    prefillSupply = null,
    onSuccess
}) {
    if (!show) return null;

    const isFocused = !!prefillSupply;
    const [supplyId, setSupplyId] = useState(prefillSupply ? String(prefillSupply.id) : '');
    const [requestQty, setRequestQty] = useState(
        prefillSupply ? Math.max(10, ((prefillSupply.min_stock || 5) * 2)) : 10
    );
    const [priority, setPriority] = useState(
        prefillSupply?.status === 'Habis' ? 'Mendesak / Stok Habis' : 'Mendesak / Stok Menipis'
    );
    const [notes, setNotes] = useState(
        prefillSupply 
            ? `Stok sisa ${prefillSupply.stock_qty ?? prefillSupply.qty ?? 0} ${prefillSupply.unit || 'unit'} (Lokasi: ${prefillSupply.location || 'Gudang'}). Mohon restok segera.` 
            : ''
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Sync form values when modal opens or prefill changes
    useEffect(() => {
        if (prefillSupply) {
            setSupplyId(String(prefillSupply.id));
            setRequestQty(Math.max(10, ((prefillSupply.min_stock || 5) * 2)));
            setPriority(prefillSupply.status === 'Habis' ? 'Mendesak / Stok Habis' : 'Mendesak / Stok Menipis');
            setNotes(`Stok sisa ${prefillSupply.stock_qty ?? prefillSupply.qty ?? 0} ${prefillSupply.unit || 'unit'} (Lokasi: ${prefillSupply.location || 'Gudang'}). Mohon restok segera.`);
        } else {
            setSupplyId('');
            setRequestQty(10);
            setPriority('Mendesak / Stok Menipis');
            setNotes('');
        }
    }, [prefillSupply, show]);

    const activeSupply = isFocused 
        ? prefillSupply 
        : suppliesList.find(s => String(s.id) === String(supplyId)) || null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const targetId = activeSupply ? activeSupply.id : supplyId;
        if (!targetId) {
            alert('Pilih perlengkapan yang ingin diajukan restok!');
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
            notes: `[Prioritas: ${priority}] ${notes || '-'}`
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
                if (activeSupply && confirm(`Pengajuan restok "${activeSupply.name}" (${qtyNum} ${activeSupply.unit || 'unit'}) BERHASIL dikirim!\n\nBuka chat WhatsApp ke Admin Toko?`)) {
                    const currentStock = activeSupply.stock_qty ?? activeSupply.qty ?? 0;
                    const waMsg = `Halo Admin Toko SYP Glass,%0A%0AMeminta pengajuan RESTOK PERLENGKAPAN GUDANG:%0A• Kode: [${activeSupply.item_code}] ${activeSupply.name}%0A• Sisa Stok: ${currentStock} ${activeSupply.unit || 'unit'}%0A• Jumlah Pengajuan: ${qtyNum} ${activeSupply.unit || 'unit'}%0A• Prioritas: ${priority}%0A• Lokasi: ${activeSupply.location || '-' } %0A• Catatan: ${notes || '-'}`;
                    window.open(`https://api.whatsapp.com/send?text=${waMsg}`, '_blank');
                }
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
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                            isFocused ? 'bg-amber-500/10 text-amber-600 border border-amber-200' : 'bg-[#1b68b0]/10 text-[#1b68b0]'
                        }`}>
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-[#242222] text-base">
                                    {isFocused ? 'Pengajuan Restok Barang Terpilih' : 'Form Pengajuan Restok Perlengkapan'}
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
                                    ? `Kode: ${activeSupply?.item_code} • ${activeSupply?.name}` 
                                    : 'Ajukan permintaan pembelian perlengkapan baru ke Admin Toko'}
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
                            <span className="font-bold">Mode Fokus Barang Terpilih:</span> Pengajuan restok terkunci langsung pada perlengkapan ini. Anda tidak perlu memilih barang lagi.
                        </div>
                    </div>
                ) : (
                    <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-3 text-xs text-[#1b68b0] flex items-center gap-2.5">
                        <Boxes className="w-4 h-4 text-[#1b68b0] shrink-0" />
                        <div>
                            <span className="font-bold">Mode Pengajuan Bebas:</span> Silakan pilih barang perlengkapan dari daftar di bawah.
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    {/* DROPDOWN HANYA DITAMPILKAN JIKA DIBUKA DARI CARD ATAS (BUKAN DARI BARIS TABEL) */}
                    {!isFocused && (
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold">Pilih Barang Perlengkapan:*</label>
                            <select
                                value={supplyId}
                                onChange={e => {
                                    setSupplyId(e.target.value);
                                    const found = suppliesList.find(s => String(s.id) === String(e.target.value));
                                    if (found) {
                                        setRequestQty(Math.max(10, ((found.min_stock || 5) * 2)));
                                        setPriority(found.status === 'Habis' ? 'Mendesak / Stok Habis' : 'Mendesak / Stok Menipis');
                                        setNotes(`Stok sisa ${found.stock_qty ?? found.qty ?? 0} ${found.unit || 'unit'} (Lokasi: ${found.location || 'Gudang'}). Mohon restok segera.`);
                                    }
                                }}
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-[#1b68b0] focus:bg-white cursor-pointer"
                            >
                                <option value="">-- Pilih Barang Perlengkapan --</option>
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
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
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

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold">Jumlah Pengajuan Restok:*</label>
                            <input
                                type="number"
                                min="1"
                                value={requestQty}
                                onChange={e => setRequestQty(e.target.value)}
                                required
                                autoFocus={isFocused}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-amber-700 font-mono font-bold focus:border-amber-500 focus:bg-white"
                            />
                        </div>
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold">Tingkat Prioritas:</label>
                            <select
                                value={priority}
                                onChange={e => setPriority(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-[#1b68b0] focus:bg-white cursor-pointer"
                            >
                                <option value="Biasa">Biasa (Persediaan Rutin)</option>
                                <option value="Mendesak / Stok Menipis">Mendesak / Stok Menipis</option>
                                <option value="Mendesak / Stok Habis">CRITICAL: Stok Habis</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-slate-700 block mb-1 font-semibold">Catatan & Alasan Pengajuan ke Admin Toko:</label>
                        <textarea
                            rows="3"
                            placeholder="Contoh: Stok sisa sedikit, dibutuhkan untuk pengerjaan finishing proyek."
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:border-[#1b68b0] focus:bg-white"
                        />
                    </div>

                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-2xl text-[11px] text-blue-900">
                        <span className="text-[#1b68b0] font-bold block mb-0.5">Informasi Pengajuan:</span>
                        <p>Pengajuan tercatat di database dan dapat diteruskan langsung ke WhatsApp Admin Toko.</p>
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
                            <span>{isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan Restok'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
