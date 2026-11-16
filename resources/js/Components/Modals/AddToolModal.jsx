import React, { useState } from 'react';
import { Wrench, X, Send, Calculator, Store } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function AddToolModal({
    show,
    onClose,
    onSuccess
}) {
    const [form, setForm] = useState({
        name: '',
        category: 'Mesin Bor & Potong',
        total_qty: 1,
        estimated_price: 250000,
        supplier_name: 'Toko Teknik & Mesin Industri',
        supplier_phone: '',
        condition: 'Baik',
        location: 'Rak Utama',
        notes: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!show) return null;

    const estimatedTotal = (parseInt(form.total_qty) || 0) * (parseFloat(form.estimated_price) || 0);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name) {
            alert('Masukkan nama alat / mesin yang ingin diajukan!');
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('category', form.category);
        formData.append('total_qty', form.total_qty);
        formData.append('estimated_price', form.estimated_price || 0);
        formData.append('supplier_name', form.supplier_name || 'Toko Teknik & Mesin Industri');
        formData.append('supplier_phone', form.supplier_phone || '');
        formData.append('condition', form.condition);
        formData.append('location', form.location);
        formData.append('notes', form.notes || '');
        if (imageFile) {
            formData.append('image', imageFile);
        }

        router.post(route('inventory.tools.store'), formData, {
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
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-800">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3.5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-[#1b68b0]/10 flex items-center justify-center text-[#1b68b0]">
                            <Wrench className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#242222] text-base">
                                Ajukan Pembelian Alat / Mesin Baru ke Finance
                            </h3>
                            <p className="text-xs text-slate-500 font-mono">Kirim pengajuan pembelian alat penunjang baru ke bagian Finance</p>
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
                        <label className="text-slate-700 block mb-1 font-semibold">Kategori Alat / Mesin:</label>
                        <select
                            value={form.category}
                            onChange={e => setForm({ ...form, category: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-[#1b68b0] focus:bg-white cursor-pointer"
                        >
                            <option value="Mesin Utama Pabrik">Mesin Utama Pabrik (CNC Cutting, Bevel Machine, Washing)</option>
                            <option value="Mesin Bor & Potong">Mesin Bor & Potong (Kaca/Mesin)</option>
                            <option value="Mata Bor & Mata Potong">Mata Bor & Mata Potong Diamond</option>
                            <option value="Mesin & Alat Vakum">Mesin Suction Cup & Vakum Kaca</option>
                            <option value="Handtool & Kunci">Handtool, Obeng & Kunci L</option>
                            <option value="Peralatan Lapangan">Peralatan Lapangan (Tangga, dsb)</option>
                            <option value="Peralatan Umum & Kebersihan">Peralatan Umum & Kebersihan (Cangkul, Rumput)</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-slate-700 block mb-1 font-semibold">Nama Alat / Mesin yang Diajukan:*</label>
                        <input
                            type="text"
                            required
                            placeholder="Contoh: Mesin Bor Kaca Portable / Tangga Alumunium 4m"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:border-[#1b68b0] focus:bg-white"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="text-slate-700 block mb-1 font-bold">Jumlah Unit Diajukan:*</label>
                            <input
                                type="number"
                                min="1"
                                required
                                value={form.total_qty}
                                onChange={e => setForm({ ...form, total_qty: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[#1b68b0] font-mono font-bold focus:border-[#1b68b0] focus:bg-white"
                            />
                        </div>
                        <div>
                            <label className="text-slate-700 block mb-1 font-bold">Estimasi Harga Satuan (Rp):</label>
                            <input
                                type="number"
                                min="0"
                                value={form.estimated_price}
                                onChange={e => setForm({ ...form, estimated_price: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-mono font-bold focus:border-[#1b68b0] focus:bg-white"
                            />
                        </div>
                    </div>

                    <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[#1b68b0] font-bold">
                            <Calculator className="w-4 h-4 shrink-0" />
                            <span>Estimasi Total Anggaran Pembelian Alat:</span>
                        </div>
                        <span className="font-mono font-black text-sm text-[#1b68b0]">
                            Rp {Number(estimatedTotal).toLocaleString('id-ID')}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="text-slate-700 block mb-1 font-bold flex items-center gap-1">
                                <Store className="w-3.5 h-3.5 text-[#1b68b0]" />
                                <span>Toko / Supplier Tujuan:</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Contoh: Toko Teknik & Mesin Industri"
                                value={form.supplier_name}
                                onChange={e => setForm({ ...form, supplier_name: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:border-[#1b68b0] focus:bg-white"
                            />
                        </div>
                        <div>
                            <label className="text-slate-700 block mb-1 font-bold">No. WhatsApp Supplier (Opsional):</label>
                            <input
                                type="text"
                                placeholder="Contoh: 6281234567890"
                                value={form.supplier_phone}
                                onChange={e => setForm({ ...form, supplier_phone: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-mono focus:border-[#1b68b0] focus:bg-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold">Rencana Lokasi Penyimpanan:</label>
                            <input
                                type="text"
                                placeholder="Contoh: Rak Alat A1 / Gudang Belakang"
                                value={form.location}
                                onChange={e => setForm({ ...form, location: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:border-[#1b68b0] focus:bg-white"
                            />
                        </div>
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold">Foto Contoh Alat (Opsional):</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 text-xs focus:border-[#1b68b0] cursor-pointer"
                            />
                        </div>
                    </div>
                    {imagePreview && (
                        <div className="relative w-24 h-24 border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                    )}

                    <div>
                        <label className="text-slate-700 block mb-1 font-semibold">Alasan Pengajuan / Spesifikasi Alat (Opsional):</label>
                        <textarea
                            rows="2"
                            placeholder="Contoh: Penambahan unit bor kaca untuk mempercepat antrean divisi bor."
                            value={form.notes}
                            onChange={e => setForm({ ...form, notes: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:border-[#1b68b0] focus:bg-white"
                        />
                    </div>

                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-[11px] text-amber-900">
                        <span className="font-bold block mb-0.5">Alur Persetujuan & Pembelian Finance:</span>
                        <p>Pengajuan alat baru ini otomatis masuk ke menu <strong>Ajuan Restok & Belanja</strong> di bagian Finance. Setelah Finance memesan ke supplier dan mengunggah <strong>Nota Bukti Pembayaran</strong>, stok alat ini otomatis aktif dan siap dipinjam.</p>
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
                            <span>{isSubmitting ? 'Mengirim Pengajuan...' : 'Kirim Pengajuan ke Finance'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
