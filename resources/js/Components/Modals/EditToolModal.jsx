import React, { useState, useEffect } from 'react';
import { Wrench, X, Check, Trash2 } from 'lucide-react';
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
        category: '',
        total_qty: 1,
        condition: 'Baik',
        location: '',
        notes: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (tool) {
            setForm({
                name: tool.name || '',
                category: tool.category || 'Mesin Bor & Potong',
                total_qty: tool.total_qty || 1,
                condition: tool.condition || 'Baik',
                location: tool.location || '',
                notes: tool.notes || ''
            });
            setImageFile(null);
            setImagePreview(tool.image_path ? '/storage/' + tool.image_path : null);
        }
    }, [tool]);

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
            alert('Masukkan nama alat!');
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('category', form.category);
        formData.append('total_qty', form.total_qty);
        formData.append('condition', form.condition);
        formData.append('location', form.location || '');
        formData.append('notes', form.notes || '');
        if (imageFile) {
            formData.append('image', imageFile);
        }

        router.post(route('inventory.tools.update', tool.id), formData, {
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

    const handleDelete = () => {
        if (!confirm(`Apakah Anda yakin ingin menghapus alat "${tool.name}"?`)) return;
        setIsSubmitting(true);
        router.delete(route('inventory.tools.destroy', tool.id), {
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
                            <Wrench className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#242222] text-base">
                                Update Data & Kondisi Alat
                            </h3>
                            <p className="text-xs text-slate-500 font-mono">{tool.tool_code} - {tool.name}</p>
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
                        <label className="text-slate-700 font-semibold block mb-1">Nama Alat:*</label>
                        <input
                            type="text"
                            required
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:border-[#1b68b0] focus:bg-white"
                        />
                    </div>

                    <div>
                        <label className="text-slate-700 font-semibold block mb-1">Update Foto Contoh Alat / Mesin Penunjang:</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 text-xs focus:border-[#1b68b0] cursor-pointer"
                        />
                        {imagePreview && (
                            <div className="mt-2 relative w-24 h-24 border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white">
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-slate-700 font-semibold block mb-1">Total Unit Dimiliki:*</label>
                            <input
                                type="number"
                                min="1"
                                required
                                value={form.total_qty}
                                onChange={e => setForm({ ...form, total_qty: e.target.value })}
                                className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-800 font-mono font-bold focus:border-[#1b68b0]"
                            />
                        </div>
                        <div>
                            <label className="text-slate-700 font-semibold block mb-1">Kondisi Fisik Alat:</label>
                            <select
                                value={form.condition}
                                onChange={e => setForm({ ...form, condition: e.target.value })}
                                className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-800 font-bold focus:border-[#1b68b0] cursor-pointer"
                            >
                                <option value="Baik">Baik (Siap Pakai)</option>
                                <option value="Perlu Servis">Perlu Servis</option>
                                <option value="Rusak">Rusak</option>
                            </select>
                        </div>
                    </div>

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

                    <div>
                        <label className="text-slate-700 font-semibold block mb-1">Catatan / Keterangan Tambahan:</label>
                        <textarea
                            rows="2"
                            placeholder="Catatan kondisi atau kelengkapan alat"
                            value={form.notes}
                            onChange={e => setForm({ ...form, notes: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:border-[#1b68b0] focus:bg-white"
                        />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isSubmitting}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold px-3.5 py-2 rounded-xl transition text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus Alat</span>
                        </button>
                        <div className="flex gap-2.5">
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
                                <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
