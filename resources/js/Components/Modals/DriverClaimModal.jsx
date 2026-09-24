import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Fuel, X, Check, Camera, Calendar, Truck, FileText, Send, Trash2, Loader2 } from 'lucide-react';

export default function DriverClaimModal({ isOpen, onClose, userName = 'Driver', defaultPlate = 'B 9482 SYP (Truk Engkel)' }) {
    if (!isOpen) return null;

    const availableCategories = [
        { id: 'BBM Armada', label: 'BBM Solar Dexlite / BioSolar', short: 'BBM Solar' },
        { id: 'Tol & Parkir', label: 'Tiket E-Toll & Parkir Proyek', short: 'E-Toll & Parkir' },
        { id: 'Perawatan Darurat', label: 'Tambal Ban & Darurat Jalan', short: 'Tambal Ban / Darurat' },
        { id: 'Operasional Lapangan', label: 'Retribusi & Kuli Bongkar', short: 'Retribusi / Bongkar' },
    ];

    const [selectedCategories, setSelectedCategories] = useState(['BBM Armada']);
    const [photos, setPhotos] = useState([]);
    const [photoPreviews, setPhotoPreviews] = useState([]);

    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'biaya_operasional',
        category: 'BBM Armada',
        title: `Klaim BBM Solar Armada (${userName})`,
        amount: '',
        supplier_name: 'SPBU Pertamina',
        invoice_number: '',
        payment_method: 'Kas Tunai (Talangan Supir)',
        payment_status: 'Lunas',
        transaction_date: new Date().toISOString().split('T')[0],
        vehicle_plate: defaultPlate,
        source_role: 'driver',
        notes: '',
        receipt_photos: [],
    });

    const [formattedAmount, setFormattedAmount] = useState('');

    const handleAmountChange = (e) => {
        const raw = e.target.value.replace(/[^0-9]/g, '');
        setData('amount', raw);
        setFormattedAmount(raw ? Number(raw).toLocaleString('id-ID') : '');
    };

    const handlePhotoAdd = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            const combinedPhotos = [...photos, ...files];
            setPhotos(combinedPhotos);

            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPhotoPreviews(prev => [...prev, ...newPreviews]);

            setData('receipt_photos', combinedPhotos);
        }
    };

    const handleRemovePhoto = (index) => {
        const updatedPhotos = photos.filter((_, i) => i !== index);
        const updatedPreviews = photoPreviews.filter((_, i) => i !== index);
        setPhotos(updatedPhotos);
        setPhotoPreviews(updatedPreviews);
        setData('receipt_photos', updatedPhotos);
    };

    const handleCategoryToggle = (catId) => {
        let updated = [];
        if (selectedCategories.includes(catId)) {
            if (selectedCategories.length > 1) {
                updated = selectedCategories.filter(c => c !== catId);
            } else {
                updated = selectedCategories;
            }
        } else {
            updated = [...selectedCategories, catId];
        }

        setSelectedCategories(updated);

        const categoryTitles = updated.map(c => {
            const match = availableCategories.find(ac => ac.id === c);
            return match ? match.short : c;
        });

        const mainCategory = updated[0] || 'BBM Armada';
        const titleText = `Klaim ${categoryTitles.join(' + ')} (${userName})`;

        setData(prev => ({
            ...prev,
            category: mainCategory,
            title: titleText,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!data.amount || parseFloat(data.amount) <= 0) {
            alert('Mohon masukkan nominal klaim biaya armada!');
            return;
        }

        post(route('finance.transactions.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setPhotos([]);
                setPhotoPreviews([]);
                setFormattedAmount('');
                setSelectedCategories(['BBM Armada']);
                onClose();
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-slate-800 relative">
                {/* LOADING OVERLAY SHIELD */}
                {processing && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-xs z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
                        <div className="bg-white p-5 rounded-3xl shadow-2xl border border-slate-200 flex flex-col items-center gap-3 max-w-xs animate-in zoom-in-95 duration-200">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                                <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
                            </div>
                            <div>
                                <strong className="block text-xs font-bold text-slate-800">Mengirimkan Klaim Armada...</strong>
                                <span className="text-[11px] text-slate-500 font-mono">Mohon tunggu sebentar</span>
                            </div>
                        </div>
                    </div>
                )}
                {/* HEADER */}
                <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                            <Fuel className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                Ajukan Klaim Biaya Armada
                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                                    Multi-Foto Struk
                                </span>
                            </h2>
                            <p className="text-xs text-slate-500">
                                Penggantian BBM Solar, E-Toll, dan darurat armada ({userName})
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* FORM BODY */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs">
                    {/* MULTI-SELECT KATEGORI PENGELUARAN ARMADA */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                            <span>Kategori Pengeluaran Armada <span className="text-rose-500">*</span></span>
                            <span className="text-[11px] text-[#1b68b0] font-mono font-bold">{selectedCategories.length} Kategori Dipilih</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                            {availableCategories.map(cat => {
                                const isChecked = selectedCategories.includes(cat.id);
                                return (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => handleCategoryToggle(cat.id)}
                                        className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between gap-2 cursor-pointer ${
                                            isChecked
                                                ? 'bg-white border-[#1b68b0] text-[#1b68b0] shadow-xs font-bold ring-1 ring-[#1b68b0]/20'
                                                : 'bg-white/60 border-slate-200 text-slate-600 hover:border-slate-300'
                                        }`}
                                    >
                                        <span className="text-xs font-semibold">{cat.label}</span>
                                        <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-bold border shrink-0 ${
                                            isChecked ? 'bg-[#1b68b0] text-white border-[#1b68b0]' : 'border-slate-300 bg-white'
                                        }`}>
                                            {isChecked ? <Check className="w-3 h-3" /> : ''}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ARMADA / PLAT NOMOR TRUK */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Armada / Nomor Polisi Truk
                        </label>
                        <select
                            value={data.vehicle_plate}
                            onChange={e => setData('vehicle_plate', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-[#1b68b0] focus:bg-white cursor-pointer font-medium"
                        >
                            <option value="B 9482 SYP (Truk Engkel)">B 9482 SYP (Truk Engkel Kaca)</option>
                            <option value="D 8102 SYP (Pikap L300)">D 8102 SYP (Pikap L300 Rak Kaca)</option>
                            <option value="D 8391 SYP (Blindvan Box)">D 8391 SYP (Blindvan Aksesoris)</option>
                            <option value="B 9102 SYP (Truk Double Box)">B 9102 SYP (Truk Double Box)</option>
                        </select>
                    </div>

                    {/* JUDUL KLAIM */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Judul / Keperluan Klaim <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={data.title}
                            onChange={e => setData('title', e.target.value)}
                            placeholder="Contoh: Isi Solar Dexlite & E-Toll Rute Pengiriman Dago"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-[#1b68b0] focus:bg-white"
                        />
                        {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
                    </div>

                    {/* NOMINAL (RUPIAH) */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Total Nominal Pengeluaran (Rp) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                                Rp
                            </span>
                            <input
                                type="text"
                                required
                                value={formattedAmount}
                                onChange={handleAmountChange}
                                placeholder="0"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-3 py-2 text-sm font-bold text-slate-900 focus:border-[#1b68b0] focus:bg-white font-mono"
                            />
                        </div>
                        {errors.amount && <p className="text-xs text-rose-500 mt-1">{errors.amount}</p>}
                    </div>

                    {/* UPLOAD MULTIPLE FOTO STRUK / BUKTI NOTA */}
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
                        <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                                <Camera className="w-3.5 h-3.5 text-[#1b68b0]" />
                                <span>Upload Foto Struk / Bukti Nota</span>
                                <span className="text-rose-500">*</span>
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                                {photos.length > 0 ? `${photos.length} Foto Diunggah` : 'Min. 1 Foto'}
                            </span>
                        </label>
                        
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            required={photos.length === 0}
                            onChange={handlePhotoAdd}
                            className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-slate-600 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#1b68b0]/10 file:text-[#1b68b0] hover:file:bg-[#1b68b0]/20 cursor-pointer"
                        />
                        {errors.receipt_photos && <p className="text-xs text-rose-500 mt-1">{errors.receipt_photos}</p>}

                        {/* PREVIEW GRID BANYAK FOTO */}
                        {photoPreviews.length > 0 && (
                            <div className="space-y-1.5 pt-1">
                                <span className="text-[10px] text-slate-500 font-bold block">Pratinjau Foto Struk:</span>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {photoPreviews.map((previewUrl, pIdx) => (
                                        <div key={pIdx} className="relative rounded-xl overflow-hidden border border-slate-200 h-24 bg-slate-100 group">
                                            <img src={previewUrl} alt={`Struk #${pIdx + 1}`} className="w-full h-full object-cover" />
                                            <div className="absolute top-1 left-1 bg-black/60 text-white text-[9px] font-mono px-1.5 py-0.5 rounded font-bold">
                                                #{pIdx + 1}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemovePhoto(pIdx)}
                                                className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow cursor-pointer"
                                                title="Hapus foto ini"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* VENDOR & NO STRUK / NOTA */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Tempat Pengeluaran (SPBU / Tol / Bengkel)
                            </label>
                            <input
                                type="text"
                                value={data.supplier_name}
                                onChange={e => setData('supplier_name', e.target.value)}
                                placeholder="SPBU Pertamina / E-Toll"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-[#1b68b0] focus:bg-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                No. Nota / Struk / Resi
                            </label>
                            <input
                                type="text"
                                value={data.invoice_number}
                                onChange={e => setData('invoice_number', e.target.value)}
                                placeholder="Contoh: NOTA-8912"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-[#1b68b0] focus:bg-white"
                            />
                        </div>
                    </div>

                    {/* TANGGAL TRANSAKSI */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Tanggal Pengeluaran
                        </label>
                        <input
                            type="date"
                            required
                            value={data.transaction_date}
                            onChange={e => setData('transaction_date', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-[#1b68b0] focus:bg-white cursor-pointer font-medium"
                        />
                    </div>

                    {/* CATATAN RUTE */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Catatan Rute / Keterangan
                        </label>
                        <textarea
                            rows="2"
                            value={data.notes}
                            onChange={e => setData('notes', e.target.value)}
                            placeholder="Catatan rute pengiriman, nomor SPO yang sedang diantar..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-[#1b68b0] focus:bg-white"
                        ></textarea>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900 flex items-start gap-2">
                        <FileText className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <span>
                            Pengajuan klaim (<strong>{selectedCategories.length} kategori</strong> & <strong>{photos.length} foto struk</strong>) akan masuk ke verifikasi Tim Finance & Akuntan.
                        </span>
                    </div>

                    {/* ACTIONS */}
                    <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 bg-slate-100 rounded-xl transition cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2.5 text-xs font-bold text-white bg-[#70b03c] hover:bg-[#5f9733] rounded-xl transition shadow-xs disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                        >
                            {processing ? (
                                <Loader2 className="w-4 h-4 animate-spin text-white" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                            <span>{processing ? 'Mengirimkan...' : 'Ajukan Klaim ke Akuntan'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
