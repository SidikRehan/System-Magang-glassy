import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { CreditCard, Wallet, X, FileText, CheckCircle2, Save, Package, Wrench, Zap, Loader2 } from 'lucide-react';

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
    }, [isOpen, prefillData, prefillType]);

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
        setFormattedAmount(raw ? Number(raw).toLocaleString('id-ID') : '');
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-800 relative">
                {/* LOADING OVERLAY SHIELD */}
                {processing && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-xs z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
                        <div className="bg-white p-5 rounded-3xl shadow-2xl border border-slate-200 flex flex-col items-center gap-3 max-w-xs animate-in zoom-in-95 duration-200">
                            <div className="w-12 h-12 rounded-2xl bg-[#70b03c]/10 flex items-center justify-center text-[#70b03c]">
                                <Loader2 className="w-6 h-6 animate-spin text-[#70b03c]" />
                            </div>
                            <div>
                                <strong className="block text-xs font-bold text-slate-800">Menyimpan Transaksi Keuangan...</strong>
                                <span className="text-[11px] text-slate-500 font-mono">Mohon tunggu sebentar, membukukan jurnal</span>
                            </div>
                        </div>
                    </div>
                )}
                {/* MODAL HEADER */}
                <div className="p-5 border-b border-slate-200 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#1b68b0]/10 border border-[#1b68b0]/20 flex items-center justify-center text-[#1b68b0]">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-800">
                                Catat Transaksi Keuangan & Belanja Usaha
                            </h3>
                            <p className="text-xs text-slate-500">
                                Input pengeluaran operasional, pembelian bahan baku ke supplier, aksesoris, atau alat kerja
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-xl transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* MODAL BODY */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
                    {/* TIPE TRANSAKSI (TABS PILLS) */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-2">
                            Pilih Tipe Transaksi Keuangan:
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                                { id: 'pembelian_bahan', label: 'Bahan Kaca', desc: 'Lembaran kaca ke supplier' },
                                { id: 'pembelian_aksesoris', label: 'Aksesoris', desc: 'Handle, engsel, sealant' },
                                { id: 'pembelian_alat', label: 'Alat & Mesin', desc: 'Mata bor, mesin, suction' },
                                { id: 'biaya_operasional', label: 'Biaya Ops (OPEX)', desc: 'Listrik, BBM, gaji, servis' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => handleTypeChange(tab.id)}
                                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${data.type === tab.id
                                        ? 'bg-[#1b68b0]/10 border-[#1b68b0] text-[#1b68b0] shadow-xs font-bold ring-1 ring-[#1b68b0]/20'
                                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                                    }`}
                                >
                                    <span className="font-bold text-xs block">{tab.label}</span>
                                    <span className="text-[11px] text-slate-500 line-clamp-1">{tab.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* DUA KOLOM: KATEGORI & NOMINAL */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Kategori Transaksi <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={data.category}
                                onChange={e => setData('category', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:border-[#1b68b0] focus:bg-white cursor-pointer"
                            >
                                {getCategoriesForType(data.type).map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Nominal Transaksi (Rp) <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">Rp</span>
                                <input
                                    type="text"
                                    required
                                    placeholder="0"
                                    value={formattedAmount}
                                    onChange={handleAmountChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-11 pr-3 text-sm text-slate-900 font-mono font-bold focus:border-[#1b68b0] focus:bg-white"
                                />
                            </div>
                            {errors.amount && <p className="text-rose-500 text-[11px] mt-1">{errors.amount}</p>}
                        </div>
                    </div>

                    {/* JUDUL / DESKRIPSI TRANSAKSI */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Judul / Deskripsi Pembelian / Pengeluaran <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="Contoh: Pembelian 15 Lembar Kaca Tempered 10mm Clear Mulia"
                            value={data.title}
                            onChange={e => setData('title', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:border-[#1b68b0] focus:bg-white"
                        />
                        {errors.title && <p className="text-rose-500 text-[11px] mt-1">{errors.title}</p>}
                    </div>

                    {/* SUPPLIER / PENERIMA & NOMOR FAKTUR */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Supplier / Vendor / Penerima:
                            </label>
                            <input
                                type="text"
                                list="supplier-datalist"
                                placeholder="Pilih atau ketik nama supplier..."
                                value={data.supplier_name}
                                onChange={e => setData('supplier_name', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:border-[#1b68b0] focus:bg-white"
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
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                No. Faktur / Invoice / Nota Pembelian:
                            </label>
                            <input
                                type="text"
                                placeholder="cth: INV-2026/08/910"
                                value={data.invoice_number}
                                onChange={e => setData('invoice_number', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-mono focus:border-[#1b68b0] focus:bg-white"
                            />
                        </div>
                    </div>

                    {/* METODE & STATUS PEMBAYARAN */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Metode Pembayaran:
                            </label>
                            <select
                                value={data.payment_method}
                                onChange={e => setData('payment_method', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:border-[#1b68b0] focus:bg-white cursor-pointer"
                            >
                                <option value="Transfer Bank BCA">Transfer Bank BCA</option>
                                <option value="Kas Tunai">Kas Tunai Toko</option>
                                <option value="Tempo 30 Hari">Tempo 30 Hari (Hutang Usaha)</option>
                                <option value="COD Driver">COD Driver</option>
                                <option value="Giro / Cek">Giro / Cek Mundur</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Status Pembayaran:
                            </label>
                            <select
                                value={data.payment_status}
                                onChange={e => setData('payment_status', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:border-[#1b68b0] focus:bg-white cursor-pointer"
                            >
                                <option value="Lunas">Lunas</option>
                                <option value="Tempo">Tempo (Belum Lunas)</option>
                                <option value="DP">DP (Uang Muka)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Tanggal Transaksi:
                            </label>
                            <input
                                type="date"
                                required
                                value={data.transaction_date}
                                onChange={e => setData('transaction_date', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 font-mono focus:border-[#1b68b0] focus:bg-white cursor-pointer font-medium"
                            />
                        </div>
                    </div>

                    {/* CATATAN TAMBAHAN */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Catatan Tambahan (Opsional):
                        </label>
                        <input
                            type="text"
                            placeholder="cth: Pengiriman via armada supplier langsung ke gudang bahan..."
                            value={data.notes}
                            onChange={e => setData('notes', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:border-[#1b68b0] focus:bg-white"
                        />
                    </div>

                    {/* MODAL ACTIONS */}
                    <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition cursor-pointer text-xs"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2.5 bg-[#70b03c] hover:bg-[#5f9733] text-white font-bold rounded-xl shadow-xs flex items-center gap-2 transition cursor-pointer text-xs disabled:opacity-50"
                        >
                            {processing ? (
                                <Loader2 className="w-4 h-4 animate-spin text-white" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            <span>{processing ? 'Menyimpan...' : 'Simpan Transaksi Keuangan'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
