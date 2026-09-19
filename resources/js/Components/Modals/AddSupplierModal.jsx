import React, { useState } from 'react';
import { Building2, X, Check } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function AddSupplierModal({
    show,
    onClose,
    onSuccess
}) {
    if (!show) return null;

    const [form, setForm] = useState({
        name: '',
        category: 'Kaca Cermin & Bening',
        phone: '6281234567890',
        pic: '',
        address: '',
        status: 'Mitra Aktif'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name || !form.phone || !form.pic) {
            alert('Lengkapi nama supplier, PIC, dan nomor WhatsApp!');
            return;
        }

        setIsSubmitting(true);
        router.post(route('inventory.suppliers.store'), form, {
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
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#242222] text-base">
                                Tambah Perusahaan Supplier & Mitra Baru
                            </h3>
                            <p className="text-xs text-slate-500 font-mono">Daftar mitra pabrikasi / importir kaca</p>
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
                        <label className="text-slate-700 block mb-1 font-semibold">Nama Perusahaan Supplier / Fabrikator:*</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. PT Asahimas Flat Glass Tbk"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:border-[#1b68b0] focus:bg-white"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold">Spesialisasi Kategori Kaca:</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Kaca Cermin & Bening"
                                value={form.category}
                                onChange={e => setForm({ ...form, category: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:border-[#1b68b0] focus:bg-white"
                            />
                        </div>
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold">Status Kemitraan:</label>
                            <select
                                value={form.status}
                                onChange={e => setForm({ ...form, status: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-[#1b68b0] focus:bg-white cursor-pointer"
                            >
                                <option value="Mitra Utama">Mitra Utama</option>
                                <option value="Mitra Aktif">Mitra Aktif</option>
                                <option value="Mitra Impor">Mitra Impor</option>
                                <option value="Mitra Lokal">Mitra Lokal</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold">Nama PIC / Contact Person:*</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Pak Gunawan"
                                value={form.pic}
                                onChange={e => setForm({ ...form, pic: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:border-[#1b68b0] focus:bg-white"
                            />
                        </div>
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold">No. WhatsApp (Format 62...):*</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. 6281234567890"
                                value={form.phone}
                                onChange={e => setForm({ ...form, phone: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[#5f9733] font-mono font-bold focus:border-[#70b03c] focus:bg-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-slate-700 block mb-1 font-semibold">Alamat Pabrik / Gudang Supplier:</label>
                        <textarea
                            rows="2"
                            placeholder="e.g. Kawasan Industri Ancol, Jl. Ancol IX No. 5, Jakarta Utara"
                            value={form.address}
                            onChange={e => setForm({ ...form, address: e.target.value })}
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
                            className="bg-[#70b03c] hover:bg-[#5f9733] text-white font-bold px-5 py-2.5 rounded-xl transition shadow-xs flex items-center gap-1.5 text-xs cursor-pointer disabled:opacity-50"
                        >
                            <Check className="w-4 h-4" />
                            <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Data Supplier'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
