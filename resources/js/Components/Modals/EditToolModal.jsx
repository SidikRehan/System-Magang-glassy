import React, { useState, useEffect } from 'react';
import { Wrench, X, Check, Trash2, AlertTriangle, CheckCircle2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function EditToolModal({
    show,
    onClose,
    tool,
    onSuccess
}) {
    if (!show || !tool) return null;

    const [form, setForm] = useState({
        name: '',
        category: 'Mesin Bor & Potong',
        total_qty: 1,
        condition: 'Baik',
        damaged_qty: 1,
        location: '',
        notes: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
        if (tool) {
            const isTroubled = tool.condition === 'Perlu Servis' || tool.condition === 'Rusak';
            const initialDamaged = tool.damaged_qty && tool.damaged_qty > 0 
                ? tool.damaged_qty 
                : (isTroubled ? 1 : 0);

            setForm({
                name: tool.name || '',
                category: tool.category || 'Mesin Bor & Potong',
                total_qty: Number(tool.total_qty) || 1,
                condition: tool.condition || 'Baik',
                damaged_qty: initialDamaged > 0 ? initialDamaged : 1,
                location: tool.location || '',
                notes: tool.notes || ''
            });
            setImageFile(null);
            setImagePreview(tool.image_path ? '/storage/' + tool.image_path : null);
            setErrorMessage(null);
        }
    }, [tool]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleTotalQtyChange = (val) => {
        const newTotal = Math.max(1, parseInt(val) || 1);
        setForm(prev => ({
            ...prev,
            total_qty: newTotal,
            damaged_qty: Math.min(prev.damaged_qty || 1, newTotal)
        }));
    };

    const handleConditionChange = (newCondition) => {
        setForm(prev => {
            const isTroubled = newCondition === 'Perlu Servis' || newCondition === 'Rusak';
            return {
                ...prev,
                condition: newCondition,
                damaged_qty: isTroubled 
                    ? (prev.damaged_qty && prev.damaged_qty > 0 ? Math.min(prev.damaged_qty, prev.total_qty) : 1)
                    : 0
            };
        });
    };

    const isTroubledCondition = form.condition === 'Perlu Servis' || form.condition === 'Rusak';
    const safeDamagedQty = isTroubledCondition ? Math.min(Math.max(1, form.damaged_qty || 1), form.total_qty) : 0;
    const goodUnitsCount = Math.max(0, form.total_qty - safeDamagedQty);

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMessage(null);

        if (!form.name.trim()) {
            setErrorMessage('Silakan isi nama alat terlebih dahulu!');
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('name', form.name.trim());
        formData.append('category', form.category || tool.category || 'Mesin Bor & Potong');
        formData.append('total_qty', form.total_qty);
        formData.append('condition', form.condition);
        formData.append('damaged_qty', safeDamagedQty);
        formData.append('location', form.location ? form.location.trim() : '');
        formData.append('notes', form.notes ? form.notes.trim() : '');
        
        if (imageFile) {
            formData.append('image', imageFile);
        }

        router.post(route('inventory.tools.update', tool.id), formData, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setIsSubmitting(false);
                if (onSuccess) {
                    onSuccess({
                        name: form.name.trim(),
                        category: form.category || tool.category,
                        total_qty: form.total_qty,
                        condition: form.condition,
                        damaged_qty: safeDamagedQty,
                        available_qty: Math.max(0, form.total_qty - safeDamagedQty),
                        location: form.location ? form.location.trim() : '',
                        notes: form.notes ? form.notes.trim() : ''
                    });
                }
                onClose();
            },
            onError: (errs) => {
                setIsSubmitting(false);
                const firstError = Object.values(errs || {})[0];
                setErrorMessage(firstError || 'Terjadi kesalahan saat menyimpan perubahan data alat.');
            }
        });
    };

    const handleDelete = () => {
        if (!confirm(`Apakah Anda yakin ingin menghapus alat "${tool.name}" dari sistem?`)) return;
        setIsSubmitting(true);
        router.delete(route('inventory.tools.destroy', tool.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
                if (onSuccess) onSuccess();
                onClose();
            },
            onError: (errs) => {
                setIsSubmitting(false);
                const firstError = Object.values(errs || {})[0];
                setErrorMessage(firstError || 'Gagal menghapus alat.');
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-800">
                {/* HEADER MODAL */}
                <div className="flex justify-between items-center border-b border-slate-200 pb-3.5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-[#1b68b0]/10 flex items-center justify-center text-[#1b68b0]">
                            <Wrench className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#242222] text-base">
                                Update Data & Kondisi Alat
                            </h3>
                            <p className="text-xs text-slate-500 font-mono">{tool.tool_code} • {tool.name}</p>
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

                {/* ERROR ALERT BANNER */}
                {errorMessage && (
                    <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                        <span>{errorMessage}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    {/* NAMA ALAT & KATEGORI */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                            <label className="text-slate-700 font-semibold block mb-1">Nama Alat / Mesin:*</label>
                            <input
                                type="text"
                                required
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                placeholder="Contoh: Mesin Bor Duduk 16mm"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:border-[#1b68b0] focus:bg-white focus:ring-2 focus:ring-[#1b68b0]/15"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="text-slate-700 font-semibold block mb-1">Kategori Alat:</label>
                            <select
                                value={form.category}
                                onChange={e => setForm({ ...form, category: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium focus:border-[#1b68b0] focus:bg-white cursor-pointer"
                            >
                                <option value="Mesin Utama Pabrik">Mesin Utama Pabrik (CNC Cutting, Bevel Machine, Washing)</option>
                                <option value="Mesin Bor & Potong">Mesin Bor & Potong (Kaca/Mesin)</option>
                                <option value="Mata Bor & Mata Potong">Mata Bor & Mata Potong Diamond</option>
                                <option value="Mesin & Alat Vakum">Mesin Suction Cup & Vakum Kaca</option>
                                <option value="Handtool & Kunci">Handtool, Obeng & Kunci L</option>
                                <option value="Peralatan Lapangan">Peralatan Lapangan (Tangga, dsb)</option>
                                <option value="Peralatan Umum & Kebersihan">Peralatan Umum & Kebersihan (Cangkul, Rumput)</option>
                                <option value="Lainnya">Lainnya</option>
                            </select>
                        </div>
                    </div>

                    {/* FOTO ALAT */}
                    <div>
                        <label className="text-slate-700 font-semibold block mb-1">Foto Sample Alat (Opsional):</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 text-xs focus:border-[#1b68b0] cursor-pointer"
                            />
                            {imagePreview && (
                                <div className="relative w-14 h-14 border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white shrink-0">
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">Format: JPG, PNG, WEBP (Maksimal 5 MB)</p>
                    </div>

                    {/* TOTAL UNIT & KONDISI FISIK */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-slate-700 font-semibold block mb-1">Total Unit Dimiliki (Stok):*</label>
                            <input
                                type="number"
                                min="1"
                                required
                                value={form.total_qty}
                                onChange={e => handleTotalQtyChange(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 font-mono font-bold focus:border-[#1b68b0] focus:bg-white"
                            />
                            <span className="text-[10px] text-slate-400 mt-0.5 block">Ubah angka ini jika ingin menambah stok</span>
                        </div>
                        <div>
                            <label className="text-slate-700 font-semibold block mb-1">Kondisi Keseluruhan Alat:*</label>
                            <select
                                value={form.condition}
                                onChange={e => handleConditionChange(e.target.value)}
                                className={`w-full border rounded-xl p-2 font-bold cursor-pointer transition ${
                                    form.condition === 'Baik' 
                                        ? 'bg-emerald-50/50 border-emerald-300 text-emerald-800' 
                                        : form.condition === 'Perlu Servis' 
                                        ? 'bg-amber-50/50 border-amber-300 text-amber-800' 
                                        : 'bg-rose-50/50 border-rose-300 text-rose-800'
                                }`}
                            >
                                <option value="Baik">Baik (Semua Siap Pakai)</option>
                                <option value="Perlu Servis">Perlu Servis / Maintenance</option>
                                <option value="Rusak">Rusak</option>
                            </select>
                        </div>
                    </div>

                    {/* OPSI PILIHAN JUMLAH BARANG RUSAK / PERLU SERVIS: HANYA MUNCUL JIKA KONDISI PERLU SERVIS ATAU RUSAK */}
                    {isTroubledCondition ? (
                        <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2.5 animate-in fade-in duration-200">
                            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                <span>Pilihan Unit yang {form.condition === 'Rusak' ? 'Rusak' : 'Perlu Diservis'}</span>
                            </div>

                            <div>
                                <label className="text-slate-700 font-semibold block mb-1">
                                    Berapa unit yang {form.condition === 'Rusak' ? 'rusak' : 'perlu servis'} dari total {form.total_qty} unit?
                                </label>
                                
                                {form.total_qty <= 10 ? (
                                    /* PILIHAN DROPDOWN CEPAT JIKA UNIT <= 10 */
                                    <select
                                        value={safeDamagedQty}
                                        onChange={e => setForm({ ...form, damaged_qty: parseInt(e.target.value) || 1 })}
                                        className="w-full bg-white border border-amber-300 rounded-xl p-2 text-slate-800 font-bold font-mono focus:border-[#1b68b0] cursor-pointer"
                                    >
                                        {Array.from({ length: form.total_qty }, (_, i) => i + 1).map(num => (
                                            <option key={num} value={num}>
                                                {num} Unit {num === form.total_qty ? '(Semua Unit)' : `(dari ${form.total_qty} Unit)`}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    /* INPUT NUMBER DENGAN MIN & MAX JIKA UNIT BANYAK */
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="1"
                                            max={form.total_qty}
                                            value={safeDamagedQty}
                                            onChange={e => setForm({ ...form, damaged_qty: Math.min(Math.max(1, parseInt(e.target.value) || 1), form.total_qty) })}
                                            className="w-32 bg-white border border-amber-300 rounded-xl p-2 text-slate-800 font-mono font-bold focus:border-[#1b68b0]"
                                        />
                                        <span className="text-slate-500 font-medium">Unit dari total {form.total_qty} unit</span>
                                    </div>
                                )}
                            </div>

                            {/* RINGKASAN PEMILAHAN KONDISI */}
                            <div className="pt-2 border-t border-amber-200/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                                <span className="text-amber-800 font-medium">
                                    • {form.condition}: <strong className="font-mono">{safeDamagedQty} Unit</strong>
                                </span>
                                <span className="text-emerald-800 font-medium">
                                    • Kondisi Baik (Siap Pakai): <strong className="font-mono">{goodUnitsCount} Unit</strong>
                                </span>
                            </div>
                        </div>
                    ) : (
                        /* INFO JIKA HANYA INGIN MENAMBAH STOK & SEMUA BAIK */
                        <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800">
                            <CheckCircle2 className="w-4 h-4 text-[#70b03c] shrink-0" />
                            <span>Seluruh <strong>{form.total_qty} unit</strong> alat berstatus Baik dan siap digunakan untuk pekerjaan operasional.</span>
                        </div>
                    )}

                    {/* LOKASI PENYIMPANAN */}
                    <div>
                        <label className="text-slate-700 font-semibold block mb-1">Lokasi Penyimpanan Alat:</label>
                        <input
                            type="text"
                            value={form.location}
                            onChange={e => setForm({ ...form, location: e.target.value })}
                            placeholder="Contoh: Rak Alat A1 / Gudang Belakang"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:border-[#1b68b0] focus:bg-white font-mono"
                        />
                    </div>

                    {/* CATATAN TAMBAHAN */}
                    <div>
                        <label className="text-slate-700 font-semibold block mb-1">Catatan / Keterangan Kondisi:</label>
                        <textarea
                            rows="2"
                            placeholder="Catatan kendala, servis berkala, atau kelengkapan alat"
                            value={form.notes}
                            onChange={e => setForm({ ...form, notes: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:border-[#1b68b0] focus:bg-white"
                        />
                    </div>

                    {/* FOOTER ACTIONS */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isSubmitting}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold px-3.5 py-2.5 rounded-xl transition text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus Alat</span>
                        </button>
                        <div className="flex gap-2.5">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl transition text-xs cursor-pointer disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-[#1b68b0] hover:bg-[#15528c] text-white font-bold px-5 py-2.5 rounded-xl transition shadow-xs flex items-center gap-1.5 text-xs cursor-pointer disabled:opacity-50"
                            >
                                <Check className="w-4 h-4" />
                                <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
