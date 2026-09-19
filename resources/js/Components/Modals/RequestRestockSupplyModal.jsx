import React, { useState } from 'react';
import { AlertTriangle, X, Check } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function RequestRestockSupplyModal({
    show,
    onClose,
    suppliesList = [],
    prefillSupply = null,
    onSuccess
}) {
    if (!show) return null;

    const [supplyId, setSupplyId] = useState(prefillSupply ? prefillSupply.id : '');
    const [requestQty, setRequestQty] = useState(prefillSupply ? Math.max(10, prefillSupply.min_stock * 2) : 10);
    const [priority, setPriority] = useState('Mendesak / Stok Menipis');
    const [notes, setNotes] = useState(prefillSupply ? `Stok sisa ${prefillSupply.qty} ${prefillSupply.unit}. Mohon restok segera.` : '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!supplyId) {
            alert('Pilih perlengkapan yang ingin diajukan restok!');
            return;
        }

        const selectedSupply = suppliesList.find(s => s.id === parseInt(supplyId));
        const qtyNum = parseInt(requestQty);

        setIsSubmitting(true);
        router.post(route('inventory.supplies.restock_request', supplyId), {
            request_qty: qtyNum,
            notes: `[Prioritas: ${priority}] ${notes || '-'}`
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
                if (selectedSupply && confirm(`Pengajuan restok "${selectedSupply.name}" (${qtyNum} ${selectedSupply.unit}) BERHASIL dikirim!\n\nBuka chat WhatsApp ke Admin Toko?`)) {
                    const waMsg = `Halo Admin Toko SYP Glass,%0A%0AMeminta pengajuan RESTOK PERLENGKAPAN GUDANG:%0A• Kode: [${selectedSupply.item_code}] ${selectedSupply.name}%0A• Sisa Stok: ${selectedSupply.qty} ${selectedSupply.unit}%0A• Jumlah Pengajuan: ${qtyNum} ${selectedSupply.unit}%0A• Prioritas: ${priority}%0A• Catatan: ${notes || '-'}`;
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
                <div className="flex justify-between items-center border-b border-slate-200 pb-3.5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#242222] text-base">
                                Form Pengajuan Restok Perlengkapan
                            </h3>
                            <p className="text-xs text-slate-500 font-mono">Ajukan permintaan pembelian perlengkapan baru ke Admin Toko</p>
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
                        <label className="text-slate-700 block mb-1 font-semibold">Pilih Barang Perlengkapan:*</label>
                        <select
                            value={supplyId}
                            onChange={e => setSupplyId(e.target.value)}
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-[#1b68b0] focus:bg-white cursor-pointer"
                        >
                            <option value="">-- Pilih Barang Perlengkapan --</option>
                            {suppliesList.map(s => (
                                <option key={s.id} value={s.id}>
                                    [{s.item_code}] {s.name} (Sisa Stok: {s.qty} {s.unit} - Status: {s.status})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold">Jumlah Pengajuan Restok:*</label>
                            <input
                                type="number"
                                min="1"
                                value={requestQty}
                                onChange={e => setRequestQty(e.target.value)}
                                required
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
