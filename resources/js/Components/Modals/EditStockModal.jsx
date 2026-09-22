import React, { useState, useEffect } from 'react';
import { Edit3, X, Building2, Sliders, Check, Ruler, Loader2, Camera } from 'lucide-react';

export default function EditStockModal({
    show,
    onClose,
    editStockForm,
    setEditStockForm,
    handleEditStockSubmit,
    suppliersList = [],
    formatNumberDots,
    parseNumberDots
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        if (!show) {
            setIsSubmitting(false);
        } else {
            if (editStockForm.image_path) {
                const url = editStockForm.image_path.startsWith('http') || editStockForm.image_path.startsWith('/')
                    ? editStockForm.image_path
                    : `/storage/${editStockForm.image_path}`;
                setImagePreview(url);
            } else {
                setImagePreview(null);
            }
        }
    }, [show, editStockForm.image_path]);

    if (!show) return null;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditStockForm(prev => ({ ...prev, image: file }));
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const l = parseFloat(editStockForm.length_cm) || 0;
    const w = parseFloat(editStockForm.width_cm) || 0;
    const areaM2 = (l > 0 && w > 0) ? ((l * w) / 10000).toFixed(4) : '0.0000';
    const sellPrice = parseFloat(editStockForm.sell_price) || 0;
    const estSheetPrice = sellPrice > 0 && parseFloat(areaM2) > 0 
        ? Math.round(sellPrice * parseFloat(areaM2)) 
        : 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            if (handleEditStockSubmit) {
                await handleEditStockSubmit(e);
            }
        } catch (err) {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-800 relative">
                {/* LOADING OVERLAY SHIELD */}
                {isSubmitting && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-xs z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
                        <div className="bg-white p-5 rounded-3xl shadow-2xl border border-slate-200 flex flex-col items-center gap-3 max-w-xs animate-in zoom-in-95 duration-200">
                            <div className="w-12 h-12 rounded-2xl bg-[#1b68b0]/10 flex items-center justify-center text-[#1b68b0]">
                                <Loader2 className="w-6 h-6 animate-spin text-[#1b68b0]" />
                            </div>
                            <div>
                                <strong className="block text-xs font-bold text-slate-800">Memperbarui Data Kaca...</strong>
                                <span className="text-[11px] text-slate-500 font-mono">Mohon tunggu sebentar</span>
                            </div>
                        </div>
                    </div>
                )}
                {/* Header */}
                <div className="flex justify-between items-center border-b border-slate-200 pb-3.5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-[#1b68b0]/10 flex items-center justify-center text-[#1b68b0]">
                            <Edit3 className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#242222] text-base">
                                Edit Data & Harga Kaca ({editStockForm.item_code || 'KACA'})
                            </h3>
                            <p className="text-xs text-slate-500 font-mono">Ubah spesifikasi, harga dasar, & tarif proses</p>
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

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    {/* Foto Kaca */}
                    <div>
                        <label className="text-[#242222] block mb-1 font-semibold">Foto / Contoh Gambar Kaca:</label>
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
                    {/* Kode & Kategori */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold">Kode Barang:</label>
                            <input
                                type="text"
                                placeholder="e.g. KCB-003"
                                value={editStockForm.item_code || ''}
                                onChange={e => setEditStockForm({ ...editStockForm, item_code: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[#1b68b0] font-mono font-bold focus:border-[#1b68b0] focus:bg-white"
                            />
                        </div>
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold">Kategori Kaca:</label>
                            <select
                                value={editStockForm.category || 'Kaca Cermin'}
                                onChange={e => setEditStockForm({ ...editStockForm, category: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-[#1b68b0] focus:bg-white cursor-pointer"
                            >
                                <option value="Kaca Cermin">Kaca Cermin</option>
                                <option value="Kaca Bening / Clear">Kaca Bening / Clear</option>
                                <option value="Kaca Tempered">Kaca Tempered</option>
                                <option value="Kaca Tinted / Grey">Kaca Tinted / Grey</option>
                                <option value="Kaca Sandblast">Kaca Sandblast</option>
                            </select>
                        </div>
                    </div>

                    {/* Nama Barang */}
                    <div>
                        <label className="text-slate-700 block mb-1 font-semibold">Nama Barang Kaca:</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Kaca Cermin Riben 5mm"
                            value={editStockForm.name || ''}
                            onChange={e => setEditStockForm({ ...editStockForm, name: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:border-[#1b68b0] focus:bg-white"
                        />
                    </div>

                    {/* Dimensi Standard: 2 Input Angka Terpisah */}
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                            <label className="text-slate-800 font-bold block flex items-center gap-1.5">
                                <Ruler className="w-4 h-4 text-[#1b68b0]" />
                                <span>Ukuran Standard Lembaran (cm):</span>
                            </label>
                            <span className="text-[11px] font-mono text-[#1b68b0] bg-[#1b68b0]/10 px-2 py-0.5 rounded-md font-bold">
                                Luas 1 Lembar: {areaM2} m²
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-slate-600 block mb-1 font-semibold text-[11px]">Panjang Lembaran (cm):</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="10"
                                    required
                                    placeholder="e.g. 183"
                                    value={editStockForm.length_cm || ''}
                                    onChange={e => {
                                        const newLen = e.target.value;
                                        const curWid = editStockForm.width_cm || 244;
                                        setEditStockForm({
                                            ...editStockForm,
                                            length_cm: newLen,
                                            size: `${newLen} x ${curWid} cm`
                                        });
                                    }}
                                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono font-bold text-sm focus:border-[#1b68b0] focus:ring-2 focus:ring-[#1b68b0]/15"
                                />
                            </div>
                            <div>
                                <label className="text-slate-600 block mb-1 font-semibold text-[11px]">Lebar Lembaran (cm):</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="10"
                                    required
                                    placeholder="e.g. 244"
                                    value={editStockForm.width_cm || ''}
                                    onChange={e => {
                                        const newWid = e.target.value;
                                        const curLen = editStockForm.length_cm || 183;
                                        setEditStockForm({
                                            ...editStockForm,
                                            width_cm: newWid,
                                            size: `${curLen} x ${newWid} cm`
                                        });
                                    }}
                                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono font-bold text-sm focus:border-[#1b68b0] focus:ring-2 focus:ring-[#1b68b0]/15"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Jumlah Stok & Ketebalan */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold">Jumlah Stok (Qty Lembar):</label>
                            <input
                                type="number"
                                min="0"
                                required
                                value={editStockForm.qty}
                                onChange={e => setEditStockForm({ ...editStockForm, qty: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-mono font-bold focus:border-[#1b68b0] focus:bg-white"
                            />
                        </div>
                        <div>
                            <label className="text-[#1b68b0] block mb-1 font-semibold">Ketebalan (mm):</label>
                            <input
                                type="number"
                                min="1"
                                placeholder="e.g. 5"
                                value={editStockForm.thickness_mm || 5}
                                onChange={e => setEditStockForm({ ...editStockForm, thickness_mm: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[#1b68b0] font-mono font-bold focus:border-[#1b68b0] focus:bg-white"
                            />
                        </div>
                    </div>

                    {/* HARGA BELI & HARGA JUAL */}
                    <div className="grid grid-cols-2 gap-3 border-t border-slate-200 pt-3 my-1">
                        <div>
                            <label className="text-amber-800 block mb-1 font-semibold flex items-center justify-between">
                                <span>Harga Beli Supplier (Rp):</span>
                                <span className="text-[10px] text-amber-600 font-mono font-normal">per lembar</span>
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="e.g. 250.000"
                                value={formatNumberDots(editStockForm.buy_price)}
                                onChange={e => setEditStockForm({ ...editStockForm, buy_price: parseNumberDots(e.target.value) })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-amber-900 font-mono font-bold focus:border-amber-500 focus:bg-white"
                            />
                        </div>
                        <div>
                            <label className="text-[#70b03c] block mb-1 font-semibold flex items-center justify-between">
                                <span>Harga Jual Customer (Rp/m²):</span>
                                <span className="text-[10px] text-[#5f9733] font-mono font-bold">per m²</span>
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="e.g. 450.000"
                                value={formatNumberDots(editStockForm.sell_price)}
                                onChange={e => setEditStockForm({ ...editStockForm, sell_price: parseNumberDots(e.target.value) })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[#5f9733] font-mono font-bold focus:border-[#70b03c] focus:bg-white"
                            />
                            {estSheetPrice > 0 && (
                                <p className="text-[10px] text-slate-500 mt-1 font-mono">
                                    Est. nilai 1 lembar utuh: <strong className="text-slate-700 font-bold">Rp {estSheetPrice.toLocaleString('id-ID')}</strong>
                                </p>
                            )}
                        </div>
                    </div>

                    {/* TARIF PROSES KHUSUS */}
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5 my-1">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                            <label className="text-slate-800 font-bold block text-xs flex items-center gap-1.5">
                                <Sliders className="w-3.5 h-3.5 text-[#1b68b0]" />
                                <span>Tarif Proses Khusus Kaca Ini (Permeter / m²):</span>
                            </label>
                            <span className="text-[10px] text-slate-500 font-mono">*Bisa disesuaikan per jenis kaca</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div>
                                <label className="text-slate-600 block mb-1 text-[10px] font-semibold">HT (Halus Tepi) /m:</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="1.000"
                                    value={formatNumberDots(editStockForm.rate_ht)}
                                    onChange={e => setEditStockForm({ ...editStockForm, rate_ht: parseNumberDots(e.target.value) })}
                                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-[#1b68b0] font-mono font-bold text-xs focus:border-[#1b68b0]"
                                />
                            </div>
                            <div>
                                <label className="text-slate-600 block mb-1 text-[10px] font-semibold">GM (Gosok Mesin) /m:</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="10.000"
                                    value={formatNumberDots(editStockForm.rate_gm)}
                                    onChange={e => setEditStockForm({ ...editStockForm, rate_gm: parseNumberDots(e.target.value) })}
                                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-[#1b68b0] font-mono font-bold text-xs focus:border-[#1b68b0]"
                                />
                            </div>
                            <div>
                                <label className="text-slate-600 block mb-1 text-[10px] font-semibold">BV (Beveling) /m:</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="15.000"
                                    value={formatNumberDots(editStockForm.rate_bv)}
                                    onChange={e => setEditStockForm({ ...editStockForm, rate_bv: parseNumberDots(e.target.value) })}
                                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-[#1b68b0] font-mono font-bold text-xs focus:border-[#1b68b0]"
                                />
                            </div>
                            <div>
                                <label className="text-slate-600 block mb-1 text-[10px] font-semibold">Etsa (Sandblast) /m²:</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="50.000"
                                    value={formatNumberDots(editStockForm.rate_etsa)}
                                    onChange={e => setEditStockForm({ ...editStockForm, rate_etsa: parseNumberDots(e.target.value) })}
                                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-[#1b68b0] font-mono font-bold text-xs focus:border-[#1b68b0]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* INFORMASI SUPPLIER */}
                    <div className="border-t border-slate-200 pt-3 space-y-3">
                        <h4 className="font-bold text-slate-800 flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5">
                                <Building2 className="w-4 h-4 text-[#1b68b0]" />
                                <span>Informasi Supplier Utama (Opsional)</span>
                            </span>
                            <span className="text-[10px] text-[#1b68b0] font-normal">Auto-fill dari mitra</span>
                        </h4>
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold">Pilih Supplier Terdaftar:</label>
                            <select
                                value={suppliersList.some(s => s.name === editStockForm.supplier_name) ? editStockForm.supplier_name : (editStockForm.supplier_name ? 'CUSTOM' : '')}
                                onChange={e => {
                                    const val = e.target.value;
                                    if (val === 'CUSTOM') {
                                        // keep custom
                                    } else if (val) {
                                        const found = suppliersList.find(s => s.name === val);
                                        if (found) {
                                            setEditStockForm(prev => ({
                                                ...prev,
                                                supplier_name: found.name,
                                                supplier_phone: found.phone || '',
                                                supplier_pic: found.pic || ''
                                            }));
                                        }
                                    } else {
                                        setEditStockForm(prev => ({
                                            ...prev,
                                            supplier_name: '',
                                            supplier_phone: '',
                                            supplier_pic: ''
                                        }));
                                    }
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-[#1b68b0] focus:bg-white text-xs mb-2 cursor-pointer"
                            >
                                <option value="">-- Klik Untuk Pilih Supplier Terdaftar (Auto Fill) --</option>
                                {suppliersList.map(sup => (
                                    <option key={sup.id} value={sup.name}>
                                        {sup.name} (PIC: {sup.pic} - {sup.phone})
                                    </option>
                                ))}
                                <option value="CUSTOM">+ Input Manual Supplier Baru...</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-slate-700 block mb-1 font-semibold">No WhatsApp Supplier:</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 6281234567890"
                                    value={editStockForm.supplier_phone || ''}
                                    onChange={e => setEditStockForm({ ...editStockForm, supplier_phone: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 font-mono focus:border-[#1b68b0] focus:bg-white"
                                />
                            </div>
                            <div>
                                <label className="text-slate-700 block mb-1 font-semibold">Nama PIC Supplier:</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Pak Gunawan"
                                    value={editStockForm.supplier_pic || ''}
                                    onChange={e => setEditStockForm({ ...editStockForm, supplier_pic: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 focus:border-[#1b68b0] focus:bg-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
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
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin text-white" />
                            ) : (
                                <Check className="w-4 h-4" />
                            )}
                            <span>{isSubmitting ? 'Memperbarui...' : 'Simpan Perubahan'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
