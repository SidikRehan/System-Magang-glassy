import React, { useState } from 'react';
import { FileText, X, Check } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function UseSupplyModal({
    show,
    onClose,
    suppliesList = [],
    onSuccess
}) {
    if (!show) return null;

    const [form, setForm] = useState({
        supply_id: '',
        used_qty: 1,
        division: 'Divisi Potong (HT)',
        user_name: '',
        notes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.supply_id || !form.user_name) {
            alert('Pilih barang perlengkapan dan isi nama pengambil!');
            return;
        }

        const selectedItem = suppliesList.find(s => s.id === parseInt(form.supply_id));
        const qtyNum = parseInt(form.used_qty);
        if (selectedItem && qtyNum > selectedItem.qty) {
            alert(`Stok tidak mencukupi! Sisa stok: ${selectedItem.qty} ${selectedItem.unit}`);
            return;
        }

        setIsSubmitting(true);
        router.post(route('inventory.supplies.use', form.supply_id), {
            user_name: form.user_name,
            qty: qtyNum,
            division: form.division,
            notes: form.notes || null
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
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#242222] text-base">
                                Catat Pemakaian Perlengkapan
                            </h3>
                            <p className="text-xs text-slate-500 font-mono">Dokumentasikan pemakaian barang operasional oleh divisi</p>
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
                            value={form.supply_id}
                            onChange={e => setForm({ ...form, supply_id: e.target.value })}
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-[#1b68b0] focus:bg-white cursor-pointer"
                        >
                            <option value="">-- Pilih Barang Perlengkapan --</option>
                            {suppliesList.map(s => (
                                <option key={s.id} value={s.id} disabled={s.qty <= 0}>
                                    [{s.item_code}] {s.name} (Sisa Stok: {s.qty} {s.unit})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold">Jumlah Dipakai:*</label>
                            <input
                                type="number"
                                min="1"
                                value={form.used_qty}
                                onChange={e => setForm({ ...form, used_qty: e.target.value })}
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-mono font-bold focus:border-[#1b68b0] focus:bg-white"
                            />
                        </div>
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold">Divisi Pengambil:*</label>
                            <select
                                value={form.division}
                                onChange={e => setForm({ ...form, division: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-[#1b68b0] focus:bg-white cursor-pointer"
                            >
                                <option value="HT (Potong)">HT (Potong)</option>
                                <option value="GM (Gosok Mesin)">GM (Gosok Mesin)</option>
                                <option value="BV (Bevel)">BV (Bevel)</option>
                                <option value="Etsa">Etsa</option>
                                <option value="Admin Gudang & Pengiriman">Admin Gudang & Pengiriman</option>
                                <option value="Teknisi Lapangan">Teknisi Lapangan</option>
                                <option value="Umum & Maintenance">Umum & Maintenance</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-slate-700 block mb-1 font-semibold">Nama Pengambil / Pekerja:*</label>
                        <input
                            type="text"
                            placeholder="Contoh: Supri / Bambang"
                            value={form.user_name}
                            onChange={e => setForm({ ...form, user_name: e.target.value })}
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:border-[#1b68b0] focus:bg-white"
                        />
                    </div>

                    <div>
                        <label className="text-slate-700 block mb-1 font-semibold">Catatan / Keperluan Pemakaian:</label>
                        <textarea
                            rows="2"
                            placeholder="Contoh: Penggantian APD bulanan / packing peti kayu"
                            value={form.notes}
                            onChange={e => setForm({ ...form, notes: e.target.value })}
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
                            <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Log Pemakaian'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
