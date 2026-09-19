import React, { useState, useEffect } from 'react';
import { MessageCircle, X, AlertTriangle } from 'lucide-react';

export default function SupplierWaModal({
    show,
    onClose,
    selectedWaStockItem,
    suppliersList = [],
    onApproveSuccess
}) {
    if (!show || !selectedWaStockItem) return null;

    const [supplierName, setSupplierName] = useState(selectedWaStockItem.supplier_name || 'PT Asahimas Flat Glass (Supplier Utama)');
    const [supplierPhone, setSupplierPhone] = useState(selectedWaStockItem.supplier_phone || '6281234567890');
    const [waOrderQty, setWaOrderQty] = useState(20);

    useEffect(() => {
        if (selectedWaStockItem) {
            setSupplierName(selectedWaStockItem.supplier_name || (suppliersList[0]?.name || 'Supplier Utama'));
            setSupplierPhone(selectedWaStockItem.supplier_phone || (suppliersList[0]?.phone || '6281234567890'));
        }
    }, [selectedWaStockItem, suppliersList]);

    const handleSendWaOrder = (e) => {
        e.preventDefault();
        const safePhone = (supplierPhone || '').replace(/\D/g, '');
        const messageText = `Halo ${supplierName},%0A%0AKami dari CV Cahya Karunia Jaya (SYP GLASS OPERATIONAL).%0AKami ingin memesan/restock bahan kaca berikut:%0A%0A• Barang: ${selectedWaStockItem.name} (${selectedWaStockItem.item_code})%0A• Jenis Kaca: ${selectedWaStockItem.category}%0A• Ukuran Standard: ${selectedWaStockItem.size || `${selectedWaStockItem.length_cm} x ${selectedWaStockItem.width_cm} cm`}%0A• Jumlah Pemesanan: ${waOrderQty} Lembar%0A• Status: Pengajuan Restock Gudang (Disetujui Admin Toko)%0A%0AMohon informasi ketersediaan, estimasi waktu pengiriman, dan invoice total harga. Terima kasih!`;

        window.open(`https://api.whatsapp.com/send?phone=${safePhone}&text=${messageText}`, '_blank');
        if (onApproveSuccess) onApproveSuccess(selectedWaStockItem.id);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-800">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3.5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-[#70b03c]/10 flex items-center justify-center text-[#5f9733]">
                            <MessageCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#242222] text-base">
                                Setujui Ajuan & Chat WhatsApp Supplier
                            </h3>
                            <p className="text-xs text-slate-500 font-mono">Verifikasi pesanan restok dan buka obrolan WhatsApp</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl p-1.5 transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSendWaOrder} className="space-y-4 text-xs">
                    <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                        <div>
                            <div className="font-bold text-amber-900">Pengajuan Masuk Dari Admin Gudang</div>
                            <div className="text-[11px] text-amber-700">Gudang mendeteksi persediaan bahan kaca ini telah menipis dan perlu segera di-restock.</div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">Kode Barang:</span>
                            <strong className="text-[#1b68b0] font-mono font-bold">{selectedWaStockItem.item_code}</strong>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">Nama Barang:</span>
                            <strong className="text-slate-800 font-semibold">{selectedWaStockItem.name}</strong>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">Jenis & Ukuran:</span>
                            <strong className="text-slate-700 font-mono">{selectedWaStockItem.category} | {selectedWaStockItem.size || `${selectedWaStockItem.length_cm} x ${selectedWaStockItem.width_cm} cm`}</strong>
                        </div>
                        <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                            <span className="text-slate-500">Sisa Stok di Gudang:</span>
                            <strong className="text-rose-600 font-mono font-bold">{selectedWaStockItem.qty} {selectedWaStockItem.unit || 'Lembar'} (Perlu Restock)</strong>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center justify-between text-xs">
                            <span className="font-bold text-emerald-800">Supplier Terhubung:</span>
                            <span className="font-bold text-slate-800 bg-white px-2.5 py-1 rounded-xl border border-emerald-200 shadow-xs">
                                {selectedWaStockItem.supplier_name || 'Mitra Supplier'}
                            </span>
                        </div>

                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold flex items-center justify-between">
                                <span>Pilih Distributor Supplier:</span>
                            </label>
                            <select
                                value={supplierName}
                                onChange={e => {
                                    const name = e.target.value;
                                    setSupplierName(name);
                                    const found = suppliersList.find(s => s.name === name);
                                    if (found) setSupplierPhone(found.phone);
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:border-[#1b68b0] focus:bg-white cursor-pointer"
                            >
                                {suppliersList.map(sup => (
                                    <option key={sup.id} value={sup.name}>
                                        {sup.name} {sup.pic ? `(${sup.pic})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-slate-700 block mb-1 font-semibold">No. WhatsApp Supplier:</label>
                                <input
                                    type="text"
                                    required
                                    value={supplierPhone}
                                    onChange={e => setSupplierPhone(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[#5f9733] font-mono font-bold focus:border-[#70b03c] focus:bg-white"
                                    placeholder="6281234567890"
                                />
                            </div>
                            <div>
                                <label className="text-slate-700 block mb-1 font-semibold">Jumlah Lembar Dipesan (Qty):</label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    value={waOrderQty}
                                    onChange={e => setWaOrderQty(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[#1b68b0] font-mono font-bold focus:border-[#1b68b0] focus:bg-white"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-slate-700 block mb-1 font-semibold flex items-center justify-between">
                            <span>Draft Pesan WhatsApp Otomatis:</span>
                            <span className="text-[10px] text-emerald-600 font-mono">Auto Format</span>
                        </label>
                        <div className="bg-emerald-50/50 border border-emerald-200 p-3.5 rounded-2xl font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
{`Halo ${supplierName},

Kami dari CV Cahya Karunia Jaya (SYP GLASS OPERATIONAL).
Kami ingin memesan/restock bahan kaca berikut:

• Barang: ${selectedWaStockItem.name} (${selectedWaStockItem.item_code})
• Jenis Kaca: ${selectedWaStockItem.category}
• Ukuran Standard: ${selectedWaStockItem.size || `${selectedWaStockItem.length_cm} x ${selectedWaStockItem.width_cm} cm`}
• Jumlah Pemesanan: ${waOrderQty} Lembar
• Status: Pengajuan Restock Gudang (Disetujui Admin Toko)

Mohon informasi ketersediaan, estimasi waktu pengiriman, dan invoice total harga. Terima kasih!`}
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
                            className="bg-[#70b03c] hover:bg-[#5f9733] text-white font-bold px-5 py-2.5 rounded-xl transition shadow-xs flex items-center gap-2 text-xs cursor-pointer"
                        >
                            <MessageCircle className="w-4 h-4" />
                            <span>Setujui & Buka Chat WhatsApp Supplier</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
