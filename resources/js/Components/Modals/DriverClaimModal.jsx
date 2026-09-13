import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';

export default function DriverClaimModal({ isOpen, onClose, userName = 'Driver', defaultPlate = 'B 9482 SYP (Truk Engkel)' }) {
    if (!isOpen) return null;

    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'biaya_operasional',
        category: 'BBM Armada',
        title: '',
        amount: '',
        supplier_name: 'SPBU Pertamina',
        invoice_number: '',
        payment_method: 'Kas Tunai (Talangan Supir)',
        payment_status: 'Lunas',
        transaction_date: new Date().toISOString().split('T')[0],
        vehicle_plate: defaultPlate,
        source_role: 'driver',
        notes: '',
    });

    const [formattedAmount, setFormattedAmount] = useState('');

    const handleAmountChange = (e) => {
        const raw = e.target.value.replace(/[^0-9]/g, '');
        setData('amount', raw);
        setFormattedAmount(raw ? Number(raw).toLocaleString('id-ID') : '');
    };

    const handleCategoryChange = (e) => {
        const cat = e.target.value;
        let defaultTitle = '';
        let defSupplier = 'SPBU Pertamina';
        if (cat === 'BBM Armada') {
            defaultTitle = `Klaim Solar Dexlite Armada (${userName})`;
            defSupplier = 'SPBU Pertamina';
        } else if (cat === 'Tol & Parkir') {
            defaultTitle = `Klaim E-Toll & Parkir Lapangan Proyek (${userName})`;
            defSupplier = 'Gerbang Tol / Pengelola Parkir';
        } else if (cat === 'Perawatan Darurat') {
            defaultTitle = `Tambal Ban & Perbaikan Darurat Jalan (${userName})`;
            defSupplier = 'Bengkel / Tambal Ban Lapangan';
        } else {
            defaultTitle = `Biaya Operasional Lapangan Supir (${userName})`;
            defSupplier = 'Pihak Ketiga Lapangan';
        }
        setData(d => ({
            ...d,
            category: cat,
            title: defaultTitle,
            supplier_name: defSupplier,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('finance.transactions.store'), {
            onSuccess: () => {
                reset();
                setFormattedAmount('');
                onClose();
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-[#0f172a] border border-amber-500/30 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl shadow-amber-500/10 flex flex-col">
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
                                    Perlu Approval
                                </span>
                            </h2>
                            <p className="text-xs text-slate-400">
                                Penggantian biaya BBM Solar, E-Toll, dan darurat armada ({userName})
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
                    >
                        ✕
                    </button>
                </div>

                {/* FORM BODY */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
                    {/* CATEGORY & VEHICLE PLATE */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                Kategori Pengeluaran Armada
                            </label>
                            <select
                                value={data.category}
                                onChange={handleCategoryChange}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
                            >
                                <option value="BBM Armada">⛽ BBM Solar Dexlite / BioSolar</option>
                                <option value="Tol & Parkir">🛣️ Tiket E-Toll & Parkir Proyek</option>
                                <option value="Perawatan Darurat">🔧 Tambal Ban & Darurat Jalan</option>
                                <option value="Operasional Lapangan">📦 Retribusi & Kuli Bongkar Proyek</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                Armada / Nomor Polisi Truk
                            </label>
                            <select
                                value={data.vehicle_plate}
                                onChange={e => setData('vehicle_plate', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
                            >
                                <option value="B 9482 SYP (Truk Engkel)">B 9482 SYP (Truk Engkel Kaca)</option>
                                <option value="D 8102 SYP (Pikap L300)">D 8102 SYP (Pikap L300 Rak Kaca)</option>
                                <option value="D 8391 SYP (Blindvan Box)">D 8391 SYP (Blindvan Aksesoris)</option>
                                <option value="B 9102 SYP (Truk Double Box)">B 9102 SYP (Truk Double Box)</option>
                            </select>
                        </div>
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
                            placeholder="Contoh: Isi Solar Dexlite Rute Pengiriman Dago & Antapani"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
                        />
                        {errors.title && <p className="text-xs text-rose-400 mt-1">{errors.title}</p>}
                    </div>

                    {/* NOMINAL (RUPIAH) */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            Nominal Pengeluaran Riil (Rp) <span className="text-rose-400">*</span>
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

                    {/* VENDOR & NO STRUK / NOTA */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                Tempat Pengeluaran (SPBU / Tol)
                            </label>
                            <input
                                type="text"
                                value={data.supplier_name}
                                onChange={e => setData('supplier_name', e.target.value)}
                                placeholder="SPBU Pertamina Pasteur"
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
                            placeholder="Catatan rute pengiriman, nomor SPO yang sedang diantar, atau alasan tambal ban..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
                        ></textarea>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200/90 flex items-start gap-2">
                        <span>ℹ️</span>
                        <span>
                            Pengajuan klaim ini akan masuk ke antrean persetujuan Tim Akuntan & Owner. Setelah disetujui, dana penggantian akan dicairkan dari kas toko dan langsung dibukukan ke biaya operasional armada.
                        </span>
                    </div>

                    {/* ACTIONS */}
                    <div className="pt-2 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 rounded-lg transition"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2 text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition shadow-lg shadow-amber-400/20 disabled:opacity-50 flex items-center gap-1.5"
                        >
                            {processing ? 'Mengirimkan...' : '🚀 Ajukan Klaim ke Akuntan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
