import React, { useState, useEffect } from 'react';
import { Archive, X, Check, Loader2, Camera } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function EditSupplyModal({
    show,
    onClose,
    supply,
    onSuccess
}) {
    if (!show || !supply) return null;

    const [form, setForm] = useState({
        name: supply.name || '',
        category: supply.category || 'APD & Keselamatan Kerja',
        qty: supply.stock_qty ?? supply.qty ?? 0,
        min_stock: supply.min_stock ?? 5,
        unit: supply.unit || 'Pcs'
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(supply.image_path ? `/storage/${supply.image_path}` : null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (supply) {
            setForm({
                name: supply.name || '',
                category: supply.category || 'APD & Keselamatan Kerja',
                qty: supply.stock_qty ?? supply.qty ?? 0,
                min_stock: supply.min_stock ?? 5,
                unit: supply.unit || 'Pcs'
            });
            setImagePreview(supply.image_path ? `/storage/${supply.image_path}` : null);
            setImageFile(null);
        }
    }, [supply]);

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
            alert('Masukkan nama perlengkapan / sparepart!');
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('category', form.category);
        formData.append('qty', form.qty);
        formData.append('min_stock', form.min_stock);
        formData.append('unit', form.unit);
        if (imageFile) {
            formData.append('image', imageFile);
        }

        router.post(route('inventory.supplies.update', supply.id), formData, {
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
                            <Archive className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#242222] text-base">
                                Edit Perlengkapan Gudang
                            </h3>
                            <p className="text-xs text-slate-500 font-mono">Kode Item: {supply.item_code}</p>
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
                        <label className="text-slate-700 block mb-1 font-semibold">Nama Perlengkapan / Barang:</label>
                        <input
                            type="text"
                            required
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            placeholder="cth: Sarung Tangan Karet Tebal, Lakban Bening 2 Inch"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-[#1b68b0] focus:bg-white"
                        />
                    </div>

                    <div>
                        <label className="text-slate-700 block mb-1 font-semibold">Kategori Perlengkapan:</label>
                        <select
                            value={form.category}
                            onChange={e => setForm({ ...form, category: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-[#1b68b0] focus:bg-white cursor-pointer"
                        >
                            <option value="Sparepart & Komponen Mesin">Sparepart & Komponen Mesin (Mata Bor, Carbon Brush, V-Belt, Bearing)</option>
                            <option value="APD & Keselamatan Kerja">APD & Keselamatan Kerja (Sarung Tangan, Kacamata)</option>
                            <option value="Perkakas Tangan Habis Pakai">Perkakas Tangan Habis Pakai (Cutter, Pisau)</option>
                            <option value="Peralatan Packaging & Pengiriman">Packaging & Pengiriman (Lakban, Plastik)</option>
                            <option value="Bahan Kimia & Kebersihan Kaca">Bahan Kimia & Cleaning (Pembersih Kaca, Spiritus)</option>
                            <option value="Consumables Mesin Potong & Gosok">Consumables Mesin (Amplas, Pad)</option>
                            <option value="Perawatan Mesin & Pelumas">Pelumas & Maintenance (Oli, Penetran)</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold">Jumlah Stok:</label>
                            <input
                                type="number"
                                min="0"
                                required
                                value={form.qty}
                                onChange={e => setForm({ ...form, qty: parseInt(e.target.value) || 0 })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:border-[#1b68b0] focus:bg-white"
                            />
                        </div>
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold">Batas Minimum:</label>
                            <input
                                type="number"
                                min="1"
                                required
                                value={form.min_stock}
                                onChange={e => setForm({ ...form, min_stock: parseInt(e.target.value) || 1 })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:border-[#1b68b0] focus:bg-white"
                            />
                        </div>
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold">Satuan (Unit):</label>
                            <input
                                type="text"
                                required
                                value={form.unit}
                                onChange={e => setForm({ ...form, unit: e.target.value })}
                                placeholder="cth: Pcs, Box, Roll"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-[#1b68b0] focus:bg-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-slate-700 block mb-1 font-semibold flex items-center gap-1.5">
                            <Camera className="w-3.5 h-3.5 text-[#1b68b0]" />
                            <span>Foto Sampel Perlengkapan (Opsional):</span>
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-700 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#1b68b0] file:text-white hover:file:bg-[#15528c] cursor-pointer"
                        />
                        {imagePreview && (
                            <div className="mt-2 relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2.5 rounded-xl bg-[#70b03c] hover:bg-[#5f9733] text-white font-bold transition flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4" />
                                    <span>Simpan Perubahan</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
