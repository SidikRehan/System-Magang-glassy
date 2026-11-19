import React, { useState } from 'react';
import { Plug, X, Send, Camera, Calculator, Store } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function AddAccessoryModal({
    show,
    onClose,
    onSuccess
}) {
    const [form, setForm] = useState({
        name: '',
        qty: 10,
        unit: 'Pcs',
        buy_price: '',
        sell_price: '',
        supplier_name: '',
        notes: '',
        image: null
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!show) return null;

    const requestedQty = parseInt(form.qty) || 0;
    const buyPrice = parseFloat(form.buy_price) || 0;
    const sellPrice = parseFloat(form.sell_price) || 0;
    const totalEstimatedExpense = requestedQty * buyPrice;
    const marginPerUnit = sellPrice - buyPrice;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setForm(prev => ({ ...prev, image: file }));
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name || form.sell_price === '') {
            alert('Lengkapi nama aksesoris dan harga jual!');
            return;
        }

        if (requestedQty <= 0) {
            alert('Jumlah pengajuan (Berapa banyak) minimal 1 unit!');
            return;
        }

        setIsSubmitting(true);
        router.post(route('inventory.accessories.store'), form, {
            forceFormData: true,
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
                {/* HEADER */}
                <div className="flex justify-between items-center border-b border-slate-200 pb-3.5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-[#1b68b0]/10 flex items-center justify-center text-[#1b68b0]">
                            <Plug className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#242222] text-base">
                                Ajukan Penambahan Aksesoris Baru
                            </h3>
                            <p className="text-xs text-slate-500 font-mono">Pengajuan item baru ke Finance (Berapa banyak, Harga Beli, & Harga Jual)</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl p-1.5 transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* INFO BANNER */}
                <div className="bg-blue-50/80 border border-blue-200 p-3 rounded-2xl text-[11px] text-blue-900 leading-relaxed">
                    <span className="font-bold block mb-0.5 text-[#1b68b0]">Alur Persetujuan Tim Finance:</span>
                    <p>Item baru ini akan tercatat di bagian Finance pada menu <strong>Ajuan Restok & Belanja</strong> sebagai rencana pengeluaran kas sebesar Total Anggaran (Qty × Harga Beli). Setelah disetujui & dibayar oleh Finance, stok aksesoris akan otomatis aktif.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    <div>
                        <label className="text-slate-700 block mb-1 font-semibold">Foto / Contoh Sampel Aksesoris (Opsional):</label>
                        <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                            {imagePreview ? (
                                <img 
                                    src={imagePreview} 
                                    alt="Preview" 
                                    className="w-12 h-12 rounded-xl object-cover border border-slate-300 shadow-2xs shrink-0" 
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-xl bg-slate-200/80 border border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
                                    <Camera className="w-5 h-5" />
                                </div>
                            )}
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleImageChange}
                                className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#1b68b0]/10 file:text-[#1b68b0] hover:file:bg-[#1b68b0]/20 cursor-pointer"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-slate-700 block mb-1 font-semibold">Nama Aksesoris Kaca Baru:*</label>
                        <input
                            type="text"
                            required
                            placeholder="Contoh: Lem Silikon Bening Glass Sealant / Engsel Shower Kaca 90°"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:border-[#1b68b0] focus:bg-white"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold">Berapa Banyak (Qty Diajukan):*</label>
                            <input
                                type="number"
                                min="1"
                                required
                                placeholder="Contoh: 10"
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

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold">Harga Beli Supplier (Rp):*</label>
                            <input
                                type="number"
                                min="0"
                                required
                                placeholder="Contoh: 25000"
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
                                placeholder="Contoh: 45000"
                                value={form.sell_price}
                                onChange={e => setForm({ ...form, sell_price: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[#5f9733] font-mono font-bold focus:border-[#70b03c] focus:bg-white"
                            />
                        </div>
                    </div>

                    {/* ESTIMASI ANGGARAN & MARGIN */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                                <Calculator className="w-4 h-4 text-[#1b68b0]" />
                                <span>Total Pengeluaran Kas (Anggaran Finance):</span>
                            </div>
                            <span className="font-mono font-black text-sm text-[#1b68b0]">
                                Rp {Number(totalEstimatedExpense).toLocaleString('id-ID')}
                            </span>
                        </div>
                        {buyPrice > 0 && sellPrice > 0 && (
                            <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200 text-slate-600">
                                <span>Estimasi Margin Laba Kotor per Satuan:</span>
                                <span className={`font-mono font-bold ${marginPerUnit >= 0 ? 'text-[#70b03c]' : 'text-rose-600'}`}>
                                    {marginPerUnit >= 0 ? '+' : ''}Rp {Number(marginPerUnit).toLocaleString('id-ID')} ({((marginPerUnit / sellPrice) * 100).toFixed(1)}%)
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold flex items-center gap-1">
                                <Store className="w-3.5 h-3.5 text-[#1b68b0]" />
                                <span>Supplier / Toko Aksesoris (Opsional):</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Contoh: CV Mitra Hardware / Toko Kaca Jaya"
                                value={form.supplier_name}
                                onChange={e => setForm({ ...form, supplier_name: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:border-[#1b68b0] focus:bg-white"
                            />
                        </div>
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold">Catatan Pengajuan (Opsional):</label>
                            <input
                                type="text"
                                placeholder="Contoh: Kebutuhan fitting shower kaca proyek"
                                value={form.notes}
                                onChange={e => setForm({ ...form, notes: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:border-[#1b68b0] focus:bg-white"
                            />
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
                            className="bg-[#1b68b0] hover:bg-[#15528c] text-white font-bold px-5 py-2.5 rounded-xl transition shadow-xs flex items-center gap-1.5 text-xs cursor-pointer disabled:opacity-50"
                        >
                            <Send className="w-4 h-4" />
                            <span>{isSubmitting ? 'Mengirim Ajuan...' : 'Kirim Ajuan ke Finance'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
