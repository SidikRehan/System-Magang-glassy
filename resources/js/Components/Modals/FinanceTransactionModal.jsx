import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';

export default function FinanceTransactionModal({
    isOpen,
    onClose,
    suppliersList = [],
    prefillType = 'biaya_operasional',
    prefillData = null,
}) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        type: prefillType || 'biaya_operasional',
        category: 'Listrik & Energi Pabrik',
        title: '',
        amount: '',
        supplier_name: '',
        invoice_number: '',
        payment_method: 'Transfer Bank BCA',
        payment_status: 'Lunas',
        transaction_date: new Date().toISOString().split('T')[0],
        due_date: '',
        notes: '',
        source_role: 'admin_toko',
    });

    const [formattedAmount, setFormattedAmount] = useState('');

    useEffect(() => {
        if (isOpen) {
            clearErrors();
            const targetType = prefillData?.type || prefillType || 'biaya_operasional';
            const targetCat = prefillData?.category || getCategoriesForType(targetType)[0] || 'Biaya Operasional Umum';
            const targetAmount = prefillData?.amount ? String(prefillData.amount) : '';

            setData(prev => ({
                ...prev,
                type: targetType,
                category: targetCat,
                title: prefillData?.title || '',
                amount: targetAmount,
                supplier_name: prefillData?.supplier_name || '',
                invoice_number: prefillData?.invoice_number || '',
                payment_method: prefillData?.payment_method || 'Transfer Bank BCA',
                payment_status: prefillData?.payment_status || 'Lunas',
                notes: prefillData?.notes || '',
                source_role: prefillData?.source_role || 'admin_toko',
            }));

            if (targetAmount) {
                setFormattedAmount(Number(targetAmount).toLocaleString('id-ID'));
            } else {
                setFormattedAmount('');
            }
        }
    }, [isOpen, prefillType, prefillData]);

    const getCategoriesForType = (t) => {
        switch (t) {
            case 'pembelian_bahan':
                return ['Bahan Kaca Lembaran', 'Kaca Tempered Lembaran', 'Kaca Cermin Lembaran', 'Kaca Laminated'];
            case 'pembelian_aksesoris':
                return ['Aksesoris Kaca', 'Handle Pintu Kaca', 'Engsel & Floor Hinge', 'Sealant Silikon & Lis Alumunium', 'Bracket & Fitting Spider'];
            case 'pembelian_alat':
                return ['Alat & Mesin', 'Mata Bor & Mata Potong', 'Piringan Polishing/Slepan', 'Alat Vakum Suction Cup', 'Perlengkapan Safety Pabrik'];
            case 'biaya_operasional':
                return ['Listrik & Energi Pabrik', 'BBM & Logistik Armada', 'Gaji & Upah Lembur', 'Perawatan Mesin', 'Operasional Kantor', 'Biaya Sewa & Pajak'];
            case 'pemasukan_lain':
                return ['Pendapatan Non-SPO', 'Penjualan Limbah / Afval Kaca', 'Jasa Konsultasi / Desain'];
            default:
                return ['Umum'];
        }
    };

    const handleTypeChange = (newType) => {
        const cats = getCategoriesForType(newType);
        setData(prev => ({
            ...prev,
            type: newType,
            category: cats[0] || 'Umum',
        }));
    };

    const handleAmountChange = (e) => {
        const raw = e.target.value.replace(/[^0-9]/g, '');
        setData('amount', raw);
        if (raw) {
            setFormattedAmount(Number(raw).toLocaleString('id-ID'));
        } else {
            setFormattedAmount('');
        }
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
            <div className="bg-slate-900 border-2 border-cyan-500/40 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
                {/* MODAL HEADER */}
                <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-5 border-b border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 text-lg font-bold">
                            💰
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-100">
                                Catat Transaksi Keuangan & Belanja Usaha
                            </h3>
                            <p className="text-xs text-slate-400">
                                Input pengeluaran operasional, pembelian bahan baku ke supplier, aksesoris, atau alat kerja
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-lg transition cursor-pointer"
                    >
                        &times;
                    </button>
                </div>

                {/* MODAL BODY */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs text-slate-200">
                    {/* TIPE TRANSAKSI (TABS PILLS) */}
                    <div>
                        <label className="block text-xs font-bold text-slate-300 mb-2">
                            Pilih Tipe Transaksi Keuangan:
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                                { id: 'pembelian_bahan', label: '📦 Bahan Kaca', desc: 'Beli lembaran kaca ke supplier' },
                                { id: 'pembelian_aksesoris', label: '💎 Aksesoris', desc: 'Handle, engsel, sealant' },
                                { id: 'pembelian_alat', label: '⚙️ Alat & Mesin', desc: 'Mata bor, mesin, suction' },
                                { id: 'biaya_operasional', label: '⚡ Biaya Ops (OPEX)', desc: 'Listrik, BBM, gaji, servis' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => handleTypeChange(tab.id)}
                                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${data.type === tab.id
                                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/10'
                                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                                    }`}
                                >
                                    <span className="font-extrabold text-xs block">{tab.label}</span>
                                    <span className="text-[10px] text-slate-500 line-clamp-1">{tab.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* DUA KOLOM: KATEGORI & NOMINAL */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">
                                Kategori Transaksi: <span className="text-rose-400">*</span>
                            </label>
                            <select
                                value={data.category}
                                onChange={e => setData('category', e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 font-bold focus:border-cyan-400 cursor-pointer"
                            >
                                {getCategoriesForType(data.type).map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">
                                Nominal Transaksi (Rp): <span className="text-rose-400">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 font-mono font-bold text-cyan-400">Rp</span>
                                <input
                                    type="text"
                                    required
                                    placeholder="0"
                                    value={formattedAmount}
                                    onChange={handleAmountChange}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-10 pr-3 text-sm text-cyan-300 font-mono font-black focus:border-cyan-400"
                                />
                            </div>
                            {errors.amount && <p className="text-rose-400 text-[11px] mt-1">{errors.amount}</p>}
                        </div>
                    </div>

                    {/* JUDUL / DESKRIPSI TRANSAKSI */}
                    <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                            Judul / Deskripsi Pembelian / Pengeluaran: <span className="text-rose-400">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="Contoh: Pembelian 15 Lembar Kaca Tempered 10mm Clear Mulia"
                            value={data.title}
                            onChange={e => setData('title', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:border-cyan-400"
                        />
                        {errors.title && <p className="text-rose-400 text-[11px] mt-1">{errors.title}</p>}
                    </div>

                    {/* SUPPLIER / PENERIMA & NOMOR FAKTUR */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">
                                Supplier / Vendor / Penerima:
                            </label>
                            <input
                                type="text"
                                list="supplier-datalist"
                                placeholder="Pilih atau ketik nama supplier..."
                                value={data.supplier_name}
                                onChange={e => setData('supplier_name', e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:border-cyan-400"
                            />
                            <datalist id="supplier-datalist">
                                {suppliersList.map(s => (
                                    <option key={s.id} value={s.name} />
                                ))}
                                <option value="PT PLN (Persero) Rayon Industri" />
                                <option value="SPBU Pertamina Pasti Pas" />
                                <option value="Distributor Hardware Dekkson Mandiri" />
                                <option value="Toko Teknik Industri Jaya Sentosa" />
                            </datalist>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">
                                No. Faktur / Invoice / Nota Pembelian:
                            </label>
                            <input
                                type="text"
                                placeholder="cth: INV-2026/08/910"
                                value={data.invoice_number}
                                onChange={e => setData('invoice_number', e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 font-mono focus:border-cyan-400"
                            />
                        </div>
                    </div>

                    {/* METODE & STATUS PEMBAYARAN */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">
                                Metode Pembayaran:
                            </label>
                            <select
                                value={data.payment_method}
                                onChange={e => setData('payment_method', e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 font-semibold focus:border-cyan-400 cursor-pointer"
                            >
                                <option value="Transfer Bank BCA">Transfer Bank BCA</option>
                                <option value="Kas Tunai">Kas Tunai Toko</option>
                                <option value="Tempo 30 Hari">Tempo 30 Hari (Hutang Usaha)</option>
                                <option value="COD Driver">COD Driver</option>
                                <option value="Giro / Cek">Giro / Cek Mundur</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">
                                Status Pembayaran:
                            </label>
                            <select
                                value={data.payment_status}
                                onChange={e => setData('payment_status', e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 font-semibold focus:border-cyan-400 cursor-pointer"
                            >
                                <option value="Lunas">✅ Lunas</option>
                                <option value="Tempo">⏳ Tempo (Belum Lunas)</option>
                                <option value="DP">🟡 DP (Uang Muka)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">
                                Tanggal Transaksi:
                            </label>
                            <input
                                type="date"
                                required
                                value={data.transaction_date}
                                onChange={e => setData('transaction_date', e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-slate-100 font-mono focus:border-cyan-400 cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* CATATAN TAMBAHAN */}
                    <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                            Catatan Tambahan (Opsional):
                        </label>
                        <input
                            type="text"
                            placeholder="cth: Pengiriman via armada supplier langsung ke gudang bahan..."
                            value={data.notes}
                            onChange={e => setData('notes', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:border-cyan-400"
                        />
                    </div>

                    {/* MODAL ACTIONS */}
                    <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition cursor-pointer"
                        >
                            <span>{processing ? '⏳ Menyimpan...' : '💾 Simpan Transaksi Keuangan'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
