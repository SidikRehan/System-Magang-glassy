import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';

export default function DriverClaimModal({ isOpen, onClose, userName = 'Driver', defaultPlate = 'B 9482 SYP (Truk Engkel)' }) {
    if (!isOpen) return null;

    const availableCategories = [
        { id: 'BBM Armada', label: '⛽ BBM Solar Dexlite / BioSolar', short: 'BBM Solar' },
        { id: 'Tol & Parkir', label: '🛣️ Tiket E-Toll & Parkir Proyek', short: 'E-Toll & Parkir' },
        { id: 'Perawatan Darurat', label: '🔧 Tambal Ban & Darurat Jalan', short: 'Tambal Ban / Darurat' },
        { id: 'Operasional Lapangan', label: '📦 Retribusi & Kuli Bongkar', short: 'Retribusi / Bongkar' },
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

    const handlePhotosChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const combinedPhotos = [...photos, ...files];
            const combinedPreviews = combinedPhotos.map(file => URL.createObjectURL(file));
            setPhotos(combinedPhotos);
            setPhotoPreviews(combinedPreviews);
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

        const combinedCategory = updated.join(', ');

        const shortLabels = updated.map(cId => {
            const found = availableCategories.find(a => a.id === cId);
            return found ? found.short : cId;
        });
        const autoTitle = `Klaim ${shortLabels.join(' + ')} (${userName})`;

        setData(d => ({
            ...d,
            category: combinedCategory,
            title: autoTitle,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('finance.transactions.store'), {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setFormattedAmount('');
                setPhotos([]);
                setPhotoPreviews([]);
                setSelectedCategories(['BBM Armada']);
                onClose();
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-[#0f172a] border border-amber-500/30 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl shadow-amber-500/10 flex flex-col max-h-[90vh]">
                {/* HEADER */}
                <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border-b border-amber-500/20 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-xl shadow-inner">
                            ⛽
                        </div>
                        <div>
                            <h2 className="text-base font-black text-slate-100 flex items-center gap-2">
                                Ajukan Klaim Biaya Armada Supir
                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                    Multi-Foto Struk
                                </span>
                            </h2>
                            <p className="text-xs text-slate-400">
                                Penggantian biaya BBM Solar, E-Toll, dan darurat armada ({userName})
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                {/* FORM BODY */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">

                    {/* MULTI-SELECT KATEGORI PENGELUARAN ARMADA */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                            <span>Kategori Pengeluaran Armada (Pilih Lebih Dari Satu) <span className="text-rose-400">*</span></span>
                            <span className="text-[10px] text-amber-300 font-mono font-bold">{selectedCategories.length} Kategori Dipilih</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                            {availableCategories.map(cat => {
                                const isChecked = selectedCategories.includes(cat.id);
                                return (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => handleCategoryToggle(cat.id)}
                                        className={`p-2.5 rounded-lg border text-left transition flex items-center justify-between gap-2 cursor-pointer ${
                                            isChecked
                                                ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-sm font-bold'
                                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                                        }`}
                                    >
                                        <span className="text-xs">{cat.label}</span>
                                        <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-extrabold border shrink-0 ${
                                            isChecked ? 'bg-amber-400 text-slate-950 border-amber-400' : 'border-slate-700 bg-slate-950'
                                        }`}>
                                            {isChecked ? '✓' : ''}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ARMADA / PLAT NOMOR TRUK */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            Armada / Nomor Polisi Truk
                        </label>
                        <select
                            value={data.vehicle_plate}
                            onChange={e => setData('vehicle_plate', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400 cursor-pointer"
                        >
                            <option value="B 9482 SYP (Truk Engkel)">B 9482 SYP (Truk Engkel Kaca)</option>
                            <option value="D 8102 SYP (Pikap L300)">D 8102 SYP (Pikap L300 Rak Kaca)</option>
                            <option value="D 8391 SYP (Blindvan Box)">D 8391 SYP (Blindvan Aksesoris)</option>
                            <option value="B 9102 SYP (Truk Double Box)">B 9102 SYP (Truk Double Box)</option>
                        </select>
                    </div>

                    {/* JUDUL KLAIM */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            Judul / Keperluan Klaim <span className="text-rose-400">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={data.title}
                            onChange={e => setData('title', e.target.value)}
                            placeholder="Contoh: Isi Solar Dexlite & E-Toll Rute Pengiriman Dago"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
                        />
                        {errors.title && <p className="text-xs text-rose-400 mt-1">{errors.title}</p>}
                    </div>

                    {/* NOMINAL (RUPIAH) */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            Total Nominal Pengeluaran (Rp) <span className="text-rose-400">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-amber-400">
                                Rp
                            </span>
                            <input
                                type="text"
                                required
                                value={formattedAmount}
                                onChange={handleAmountChange}
                                placeholder="0"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-3 py-2 text-base font-black text-amber-300 focus:outline-none focus:border-amber-400"
                            />
                        </div>
                        {errors.amount && <p className="text-xs text-rose-400 mt-1">{errors.amount}</p>}
                    </div>

                    {/* UPLOAD MULTIPLE FOTO STRUK / BUKTI NOTA */}
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                        <label className="block text-xs font-bold text-amber-300 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                                <span>📷 Upload Foto Struk / Bukti Nota (Bisa Beberapa Foto)</span>
                                <span className="text-rose-400">*</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono font-normal">
                                {photos.length > 0 ? `${photos.length} Foto Diunggah` : 'Wajib Unggah Min. 1 Foto'}
                            </span>
                        </label>
                        
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            required={photos.length === 0}
                            onChange={handlePhotosChange}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-300 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-amber-500/20 file:text-amber-300 hover:file:bg-amber-500/30 cursor-pointer"
                        />
                        {errors.receipt_photos && <p className="text-xs text-rose-400 mt-1">{errors.receipt_photos}</p>}

                        {/* PREVIEW GRID BANYAK FOTO */}
                        {photoPreviews.length > 0 && (
                            <div className="space-y-1.5 pt-1">
                                <span className="text-[10px] text-slate-400 font-bold block">Pratinjau Foto Struk Diunggah:</span>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {photoPreviews.map((previewUrl, pIdx) => (
                                        <div key={pIdx} className="relative rounded-xl overflow-hidden border border-amber-500/40 h-24 bg-slate-900 group">
                                            <img src={previewUrl} alt={`Struk #${pIdx + 1}`} className="w-full h-full object-cover" />
                                            <div className="absolute top-1 left-1 bg-slate-950/80 text-amber-300 text-[9px] font-mono px-1.5 py-0.5 rounded border border-amber-500/30 font-bold">
                                                #{pIdx + 1}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemovePhoto(pIdx)}
                                                className="absolute top-1 right-1 bg-rose-500 hover:bg-rose-400 text-slate-950 font-black rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow cursor-pointer"
                                                title="Hapus foto ini"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* VENDOR & NO STRUK / NOTA */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                Tempat Pengeluaran (SPBU / Tol / Bengkel)
                            </label>
                            <input
                                type="text"
                                value={data.supplier_name}
                                onChange={e => setData('supplier_name', e.target.value)}
                                placeholder="SPBU Pertamina Pasteur / E-Toll"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                No. Nota / Struk / Transaksi
                            </label>
                            <input
                                type="text"
                                value={data.invoice_number}
                                onChange={e => setData('invoice_number', e.target.value)}
                                placeholder="Contoh: NOTA-8912 atau Resi Struk"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
                            />
                        </div>
                    </div>

                    {/* TANGGAL TRANSAKSI */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            Tanggal Pengeluaran
                        </label>
                        <input
                            type="date"
                            required
                            value={data.transaction_date}
                            onChange={e => setData('transaction_date', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
                        />
                    </div>

                    {/* CATATAN RUTE */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            Catatan Rute / Keterangan Tambahan
                        </label>
                        <textarea
                            rows="2"
                            value={data.notes}
                            onChange={e => setData('notes', e.target.value)}
                            placeholder="Catatan rute pengiriman, nomor SPO yang sedang diantar, atau alasan pengeluaran..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
                        ></textarea>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200/90 flex items-start gap-2">
                        <span>ℹ️</span>
                        <span>
                            Pengajuan klaim (<strong>{selectedCategories.length} kategori</strong> & <strong>{photos.length} foto struk</strong>) akan masuk ke persetujuan Tim Akuntan & Owner.
                        </span>
                    </div>

                    {/* ACTIONS */}
                    <div className="pt-2 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 rounded-lg transition cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2 text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition shadow-lg shadow-amber-400/20 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                        >
                            {processing ? 'Mengirimkan...' : '🚀 Ajukan Klaim ke Akuntan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
