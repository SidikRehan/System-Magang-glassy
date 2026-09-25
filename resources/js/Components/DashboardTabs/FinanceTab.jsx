import React from 'react';
import {
    Briefcase,
    TrendingUp,
    Package,
    Zap,
    Award,
    AlertCircle,
    Truck,
    Printer,
    Plus,
    Search,
    Filter,
    Trash2,
    Check,
    X,
    ArrowRight,
    FileText,
    CreditCard,
    CheckCircle2,
    Clock,
    Layers,
    Shield,
    Recycle,
    ExternalLink,
    DollarSign,
    Fuel,
    Users,
    Wrench,
    Building2,
    Sparkles,
    AlertTriangle
} from 'lucide-react';

export default function FinanceTab({
    userRole,
    metrics = {},
    financeTransactionsList = [],
    financeSearchTerm,
    setFinanceSearchTerm,
    financeCategoryFilter,
    setFinanceCategoryFilter,
    financeSubTab,
    setFinanceSubTab,
    scrapGlasses = [],
    handleOpenPrintModal,
    handleOpenFinanceModal,
    handleRejectClaim,
    handleApproveClaim,
    handleDrilldownOpex,
    handleDeleteFinanceTransaction,
}) {
    if (userRole !== 'owner' && userRole !== 'finance' && userRole !== 'admin_finance') {
        return null;
    }

    const totalRev = Number(metrics.totalRevenue || 0);
    const paidRev = Number(metrics.paidRevenue || 0);
    const pendingCodVal = Number(metrics.pendingCOD || 0);

    const approvedTransactions = financeTransactionsList.filter(t => t.approval_status === 'approved');

    const bahanKacaSum = approvedTransactions.filter(t => t.type === 'pembelian_bahan').reduce((a, b) => a + Number(b.amount || 0), 0);
    const aksesorisSum = approvedTransactions.filter(t => t.type === 'pembelian_aksesoris').reduce((a, b) => a + Number(b.amount || 0), 0);
    const alatSum = approvedTransactions.filter(t => t.type === 'pembelian_alat').reduce((a, b) => a + Number(b.amount || 0), 0);
    const listrikSum = approvedTransactions.filter(t => t.category === 'Listrik & Energi Pabrik').reduce((a, b) => a + Number(b.amount || 0), 0);
    const bbmSum = approvedTransactions.filter(t => t.category === 'BBM & Logistik Armada').reduce((a, b) => a + Number(b.amount || 0), 0);
    const gajiSum = approvedTransactions.filter(t => t.category === 'Gaji & Upah Lembur').reduce((a, b) => a + Number(b.amount || 0), 0);
    const servisSum = approvedTransactions.filter(t => t.category === 'Perawatan Mesin').reduce((a, b) => a + Number(b.amount || 0), 0);
    const kantorSum = approvedTransactions.filter(t => t.category === 'Operasional Kantor' || t.category === 'Biaya Sewa & Pajak').reduce((a, b) => a + Number(b.amount || 0), 0);

    const totalCogs = bahanKacaSum + aksesorisSum;
    const totalOpex = listrikSum + bbmSum + gajiSum + servisSum + alatSum + kantorSum;
    const grandTotalExpenses = totalCogs + totalOpex;
    const grossProfitVal = totalRev - totalCogs;
    const netProfitVal = totalRev - grandTotalExpenses;
    const isProfitable = netProfitVal >= 0;
    const grossMarginPct = totalRev > 0 ? ((grossProfitVal / totalRev) * 100).toFixed(1) : '0.0';
    const netMarginPct = totalRev > 0 ? ((netProfitVal / totalRev) * 100).toFixed(1) : '0.0';

    // Filter transaksi untuk tab Buku Kas
    const filteredTransactions = financeTransactionsList.filter(t => {
        const matchSearch = financeSearchTerm === '' ||
            t.title?.toLowerCase().includes(financeSearchTerm.toLowerCase()) ||
            t.transaction_code?.toLowerCase().includes(financeSearchTerm.toLowerCase()) ||
            t.supplier_name?.toLowerCase().includes(financeSearchTerm.toLowerCase()) ||
            t.invoice_number?.toLowerCase().includes(financeSearchTerm.toLowerCase());
        const matchCategory = financeCategoryFilter === 'semua' || t.type === financeCategoryFilter || t.category === financeCategoryFilter;
        return matchSearch && matchCategory;
    });

    const pendingClaims = financeTransactionsList.filter(t => t.approval_status === 'pending');

    return (
        <div className="space-y-6 animate-fade-in">
            {/* HEADER EXECUTIVE FINANCE */}
            <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-200 pb-4">
                <div>
                    <div className="flex items-center gap-2.5">
                        <Briefcase className="w-6 h-6 text-[#1b68b0]" />
                        <h2 className="text-2xl font-black text-[#242222]">
                            Executive Finance & Laba/Rugi (P&L)
                        </h2>
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-mono font-bold px-3 py-0.5 rounded-full">
                            CV Cahya Karunia Jaya
                        </span>
                    </div>
                    <p className="text-slate-500 text-xs mt-1">
                        Laporan Laba Rugi Komprehensif (P&L), Pengadaan Bahan Baku Kaca, Pengeluaran Biaya Operasional Pabrik, & Buku Kas Mutasi Usaha
                    </p>
                </div>

                {/* QUICK ACTION BUTTONS */}
                <div className="flex flex-wrap items-center gap-2.5">
                    <button
                        type="button"
                        onClick={() => handleOpenPrintModal('all')}
                        className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 text-xs flex items-center gap-2 transition cursor-pointer shadow-xs"
                    >
                        <Printer className="w-3.5 h-3.5 text-slate-500" />
                        <span>Cetak Semua Laporan</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleOpenFinanceModal('pembelian_bahan')}
                        className="px-4 py-2 bg-[#70b03c] hover:bg-[#5f9733] text-white font-bold rounded-xl text-xs flex items-center gap-2 transition cursor-pointer shadow-xs"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Catat Transaksi Finansial</span>
                    </button>
                </div>
            </div>

            {/* 5 TOP EXECUTIVE METRIC CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* CARD 1: OMSET PENJUALAN */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden group hover:shadow-sm transition">
                    <div className="flex justify-between items-start">
                        <span className="text-xs text-slate-500 font-bold">Total Omzet Penjualan</span>
                        <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1b68b0]">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-[#1b68b0] font-mono mt-2">
                        Rp {totalRev.toLocaleString('id-ID')}
                    </h3>
                    <div className="text-[11px] text-slate-500 font-mono mt-2 flex items-center gap-1.5 border-t border-slate-100 pt-2">
                        <span className="text-[#1b68b0] font-bold">{metrics.totalOrders || 0} SPO</span>
                        <span>• Terverifikasi Kasir</span>
                    </div>
                </div>

                {/* CARD 2: HPP (COGS) */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden group hover:shadow-sm transition">
                    <div className="flex justify-between items-start">
                        <span className="text-xs text-slate-500 font-bold">HPP (Bahan & Aksesoris)</span>
                        <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                            <Package className="w-4 h-4" />
                        </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-amber-600 font-mono mt-2">
                        Rp {totalCogs.toLocaleString('id-ID')}
                    </h3>
                    <div className="text-[11px] text-slate-500 font-mono mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
                        <span>Laba Kotor:</span>
                        <span className="font-bold text-amber-800">{grossMarginPct}%</span>
                    </div>
                </div>

                {/* CARD 3: BEBAN OPERASIONAL (OPEX) */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden group hover:shadow-sm transition">
                    <div className="flex justify-between items-start">
                        <span className="text-xs text-slate-500 font-bold">Beban Operasional (OPEX)</span>
                        <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                            <Zap className="w-4 h-4" />
                        </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-purple-600 font-mono mt-2">
                        Rp {totalOpex.toLocaleString('id-ID')}
                    </h3>
                    <div className="text-[11px] text-slate-500 font-mono mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
                        <span>Listrik, BBM & Gaji:</span>
                        <span className="font-bold text-purple-800">{approvedTransactions.filter(t => t.type === 'biaya_operasional').length} Pos</span>
                    </div>
                </div>

                {/* CARD 4: LABA / RUGI BERSIH (NET PROFIT / LOSS) */}
                <div className={`bg-white border-2 rounded-2xl p-5 shadow-xs relative overflow-hidden group transition ${
                    isProfitable ? 'border-emerald-300' : 'border-rose-300'
                }`}>
                    <div className="flex justify-between items-start">
                        <span className={`text-xs font-bold ${isProfitable ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {isProfitable ? 'Laba Bersih Usaha (Net)' : 'Defisit / Rugi Bersih (Net)'}
                        </span>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            isProfitable ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
                        }`}>
                            {isProfitable ? <Award className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                        </div>
                    </div>
                    <h3 className={`text-xl sm:text-2xl font-black font-mono mt-2 ${isProfitable ? 'text-emerald-600' : 'text-rose-600'}`}>
                        Rp {netProfitVal.toLocaleString('id-ID')}
                    </h3>
                    <div className="text-[11px] font-mono mt-2 flex items-center justify-between border-t border-slate-100 pt-2 text-slate-500">
                        <span>{isProfitable ? 'Net Margin:' : 'Rasio Defisit:'}</span>
                        <span className={`font-bold px-1.5 py-0.5 rounded ${
                            isProfitable ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                            {netMarginPct}% {isProfitable ? 'NET' : 'DEFISIT'}
                        </span>
                    </div>
                </div>

                {/* CARD 5: PIUTANG COD */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden group hover:shadow-sm transition">
                    <div className="flex justify-between items-start">
                        <span className="text-xs text-rose-700 font-bold">Piutang COD Driver (SJ)</span>
                        <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                            <Truck className="w-4 h-4" />
                        </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-rose-600 font-mono mt-2">
                        Rp {pendingCodVal.toLocaleString('id-ID')}
                    </h3>
                    <div className="text-[11px] text-slate-500 font-mono mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
                        <span>Kas Terkumpul:</span>
                        <span className="text-emerald-600 font-bold">Rp {paidRev.toLocaleString('id-ID')}</span>
                    </div>
                </div>
            </div>

            {/* ANTREAN PERSETUJUAN KLAIM BIAYA */}
            {pendingClaims.length > 0 && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 shadow-xs space-y-3">
                    <div className="flex flex-wrap justify-between items-center border-b border-amber-200 pb-3 gap-2">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                            <h3 className="text-sm font-bold text-amber-900 flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-amber-600" />
                                <span>Antrean Persetujuan Klaim Pengeluaran ({pendingClaims.length} Menunggu)</span>
                            </h3>
                        </div>
                        <span className="text-[11px] font-mono text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300 font-bold">
                            Otorisasi: Owner & Direksi (Verifikasi: Tim Finance)
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {pendingClaims.map(clm => (
                            <div key={clm.id} className="bg-white border border-amber-200 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-xs">
                                <div className="space-y-1">
                                    <div className="flex justify-between items-start">
                                        <span className="font-mono text-xs font-bold text-[#1b68b0] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                            {clm.transaction_code}
                                        </span>
                                        <span className="text-base font-black text-amber-700 font-mono">
                                            Rp {Number(clm.amount || 0).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-[#242222] text-sm">{clm.title}</h4>
                                    <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2 pt-1">
                                        <span className="px-2 py-0.5 rounded bg-blue-50 text-[#1b68b0] border border-blue-200 font-semibold">
                                            {clm.source_role === 'driver' ? 'Supir Armada' : 'Admin Toko'}
                                        </span>
                                        {clm.vehicle_plate && (
                                            <span className="text-slate-700 font-mono font-semibold">
                                                {clm.vehicle_plate}
                                            </span>
                                        )}
                                        <span>• {clm.transaction_date}</span>
                                        <span>• {clm.supplier_name}</span>
                                    </div>
                                    {clm.notes && (
                                        <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-200 mt-1">
                                            "{clm.notes}"
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                                    <button
                                        onClick={() => handleRejectClaim(clm.id)}
                                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                        <span>Tolak</span>
                                    </button>
                                    <button
                                        onClick={() => handleApproveClaim(clm.id)}
                                        className="px-4 py-1.5 bg-[#70b03c] hover:bg-[#5f9733] text-white font-bold rounded-lg text-xs transition shadow-xs flex items-center gap-1 cursor-pointer"
                                    >
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Setujui & Cairkan Kas</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* SUB-TAB NAVIGATION STRIP */}
            <div className="flex flex-wrap items-center gap-2 bg-slate-100 border border-slate-200 p-1.5 rounded-2xl shadow-xs text-xs font-bold">
                {[
                    { id: 'pnl', label: 'Laporan Laba / Rugi (P&L)', icon: FileText, badge: `${netMarginPct}% Net` },
                    { id: 'purchases', label: 'Pembelian Bahan Kaca', icon: Package, badge: `Rp ${(bahanKacaSum / 1000000).toFixed(1)}M` },
                    { id: 'accessories_tools', label: 'Aksesoris & Alat Kerja', icon: Wrench, badge: `Rp ${((aksesorisSum + alatSum) / 1000000).toFixed(1)}M` },
                    { id: 'opex', label: 'Biaya Operasional (OPEX)', icon: Zap, badge: `Rp ${(totalOpex / 1000000).toFixed(1)}M` },
                    { id: 'ledger', label: 'Buku Kas & Riwayat Mutasi', icon: CreditCard, badge: `${financeTransactionsList.length} Trx` },
                ].map((subTab) => {
                    const Icon = subTab.icon;
                    const isActive = financeSubTab === subTab.id;
                    return (
                        <button
                            key={subTab.id}
                            onClick={() => setFinanceSubTab(subTab.id)}
                            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                                isActive
                                    ? 'bg-white text-[#1b68b0] shadow-xs border border-slate-200 font-bold'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 font-semibold'
                            }`}
                        >
                            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#1b68b0]' : 'text-slate-400'}`} />
                            <span>{subTab.label}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                                isActive ? 'bg-blue-50 text-[#1b68b0] border border-blue-200 font-bold' : 'bg-slate-200 text-slate-600'
                            }`}>
                                {subTab.badge}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* SUB-TAB 1: LAPORAN LABA / RUGI KOMPREHENSIF (P&L) */}
            {financeSubTab === 'pnl' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* FINANCIAL STATEMENT TABLE */}
                    <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
                        <div className="border-b border-slate-200 pb-3 flex flex-wrap justify-between items-center gap-3">
                            <div>
                                <h3 className="text-base font-bold text-[#242222] flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-[#1b68b0]" />
                                    <span>Laporan Laba Rugi Eksekutif (Income Statement)</span>
                                </h3>
                                <p className="text-xs text-slate-500 font-mono">Periode: 2026 (YTD)</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleOpenPrintModal('pnl')}
                                    className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                                >
                                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Cetak Laba Rugi</span>
                                </button>
                                <span className={`text-xs px-3 py-1 rounded-full font-bold font-mono border flex items-center gap-1.5 ${
                                    isProfitable 
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                        : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}>
                                    <span>{isProfitable ? 'Status: SEHAT & PROFITABLE' : 'Status: PERINGATAN DEFISIT'}</span>
                                </span>
                            </div>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                            <table className="w-full text-xs font-mono">
                                <tbody className="divide-y divide-slate-100">
                                    {/* 1. PENDAPATAN */}
                                    <tr className="bg-slate-50 text-[#1b68b0] font-black border-b border-slate-200">
                                        <td className="py-2.5 px-3">1. PENDAPATAN USAHA (REVENUE)</td>
                                        <td className="py-2.5 px-3 text-right">JUMLAH (RP)</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50/70">
                                        <td className="py-2 px-6 text-slate-600">• Penjualan Kaca & Jasa Proses Pabrik (SPO)</td>
                                        <td className="py-2 px-3 text-right text-slate-800 font-bold">Rp {Number(totalRev - (metrics.otherRevenue || 0)).toLocaleString('id-ID')}</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50/70">
                                        <td className="py-2 px-6 text-slate-600">• Pendapatan Lain-lain (Non-SPO / Scrap Kaca)</td>
                                        <td className="py-2 px-3 text-right text-slate-600">Rp {(metrics.otherRevenue || 0).toLocaleString('id-ID')}</td>
                                    </tr>
                                    <tr className="bg-blue-50/40 font-extrabold text-[#1b68b0]">
                                        <td className="py-2.5 px-3">TOTAL PENDAPATAN BERSIH (NET REVENUE)</td>
                                        <td className="py-2.5 px-3 text-right text-sm">Rp {totalRev.toLocaleString('id-ID')}</td>
                                    </tr>

                                    {/* 2. HPP (COGS) */}
                                    <tr className="bg-slate-50 text-amber-700 font-black border-t border-b border-slate-200">
                                        <td className="py-2.5 px-3 pt-4">2. HARGA POKOK PENJUALAN (HPP / COGS)</td>
                                        <td className="py-2.5 px-3 pt-4 text-right"></td>
                                    </tr>
                                    <tr className="hover:bg-slate-50/70">
                                        <td className="py-2 px-6 text-slate-600">• Pembelian Lembaran Bahan Kaca Supplier</td>
                                        <td className="py-2 px-3 text-right text-rose-600">Rp {bahanKacaSum.toLocaleString('id-ID')}</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50/70">
                                        <td className="py-2 px-6 text-slate-600">• Pembelian Aksesoris Kaca Konsumen</td>
                                        <td className="py-2 px-3 text-right text-rose-600">Rp {aksesorisSum.toLocaleString('id-ID')}</td>
                                    </tr>
                                    <tr className="bg-amber-50/40 font-extrabold text-amber-800">
                                        <td className="py-2.5 px-3">TOTAL HPP PRODUKSI</td>
                                        <td className="py-2.5 px-3 text-right text-sm">Rp {totalCogs.toLocaleString('id-ID')}</td>
                                    </tr>

                                    {/* LABA KOTOR */}
                                    <tr className={`font-black text-sm border-t-2 border-b-2 transition ${
                                        grossProfitVal >= 0
                                            ? 'bg-emerald-50/60 text-emerald-800 border-emerald-200'
                                            : 'bg-rose-50/60 text-rose-800 border-rose-200'
                                    }`}>
                                        <td className="py-3 px-3">LABA KOTOR (GROSS PROFIT)</td>
                                        <td className="py-3 px-3 text-right">
                                            Rp {grossProfitVal.toLocaleString('id-ID')}{' '}
                                            <span className={`text-xs font-bold ${grossProfitVal >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                                                ({grossMarginPct}%)
                                            </span>
                                        </td>
                                    </tr>

                                    {/* 3. BEBAN OPERASIONAL (OPEX) */}
                                    <tr className="bg-slate-50 text-purple-700 font-black border-t-2 border-slate-200">
                                        <td className="py-3 px-3 pt-4">
                                            <div className="flex items-center justify-between">
                                                <span className="flex items-center gap-2">
                                                    <Zap className="w-4 h-4 text-purple-600" />
                                                    <span>3. BEBAN OPERASIONAL PABRIK & TOKO (OPEX)</span>
                                                </span>
                                                <span className="text-[10px] font-mono text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded font-normal">
                                                    6 Pos Biaya Operasional
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-3 pt-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => handleOpenFinanceModal('biaya_operasional')}
                                                className="text-[10px] bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-lg font-bold transition inline-flex items-center gap-1 cursor-pointer"
                                            >
                                                <Plus className="w-3 h-3" />
                                                <span>Catat Beban</span>
                                            </button>
                                        </td>
                                    </tr>

                                    {[
                                        {
                                            name: 'Beban Listrik & Daya Mesin Pabrik (PLN)',
                                            sum: listrikSum,
                                            category: 'Listrik & Energi Pabrik',
                                            budget: 15000000,
                                            icon: Zap,
                                            desc: 'Gardu Trafo 33 kVA, Oven Tempered & Mesin Gosok'
                                        },
                                        {
                                            name: 'Beban BBM Solar & Logistik Armada Truk/L300',
                                            sum: bbmSum,
                                            category: 'BBM & Logistik Armada',
                                            budget: 6000000,
                                            icon: Fuel,
                                            desc: 'Armada Truk Engkel, L300 & Klaim Operasional Supir'
                                        },
                                        {
                                            name: 'Beban Gaji Staf, Upah & Uang Lembur',
                                            sum: gajiSum,
                                            category: 'Gaji & Upah Lembur',
                                            budget: 22000000,
                                            icon: Users,
                                            desc: 'Gaji operator mesin pabrik, supir & admin toko'
                                        },
                                        {
                                            name: 'Pemeliharaan Mesin Gosok/Bevel & Servis Armada',
                                            sum: servisSum,
                                            category: 'Perawatan Mesin',
                                            budget: 4000000,
                                            icon: Wrench,
                                            desc: 'Penggantian oli spindle mesin bevel & servis armada'
                                        },
                                        {
                                            name: 'Pengadaan Alat Penunjang & Mata Bor Pabrik',
                                            sum: alatSum,
                                            category: 'Alat & Mesin',
                                            budget: 8000000,
                                            icon: Package,
                                            desc: 'Mata bor diamond, piringan poles slepan & safety suction'
                                        },
                                        {
                                            name: 'Operasional Kantor Toko, Wifi & ATK',
                                            sum: kantorSum,
                                            category: 'Operasional Kantor',
                                            budget: 2500000,
                                            icon: Building2,
                                            desc: 'Internet fiber optic, ATK surat jalan & kasir toko'
                                        },
                                    ].map((item, idx) => {
                                        const Icon = item.icon;
                                        const sharePct = totalOpex > 0 ? ((item.sum / totalOpex) * 100).toFixed(1) : '0.0';
                                        const budgetPct = Math.round((item.sum / item.budget) * 100);
                                        const isBudgetSafe = budgetPct <= 100;

                                        return (
                                            <tr key={idx} className="hover:bg-slate-50/70 transition">
                                                <td className="py-2.5 px-3">
                                                    <div className="flex items-start gap-2.5">
                                                        <Icon className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="font-bold text-slate-800">• {item.name}</span>
                                                                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-purple-50 text-purple-700 border border-purple-200 rounded">
                                                                    {sharePct}% OPEX
                                                                </span>
                                                                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                                                                    isBudgetSafe 
                                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                                                        : 'bg-rose-50 text-rose-700 border-rose-200'
                                                                }`}>
                                                                    Plafon: Rp {(item.budget / 1000000).toFixed(1)}M ({budgetPct}% {isBudgetSafe ? 'Aman' : 'Over'})
                                                                </span>
                                                            </div>
                                                            <div className="text-[10px] text-slate-500 mt-0.5">
                                                                {item.desc}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-2.5 px-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <span className="text-slate-800 font-mono font-bold">
                                                            Rp {item.sum.toLocaleString('id-ID')}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDrilldownOpex(item.category)}
                                                            title="Lihat rincian transaksi pengeluaran pos ini"
                                                            className="text-[10px] text-[#1b68b0] hover:text-[#15528c] bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded font-mono transition cursor-pointer"
                                                        >
                                                            Rincian
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    <tr className="bg-purple-50/50 font-extrabold text-purple-900 border-t border-purple-200">
                                        <td className="py-3 px-3 text-sm">TOTAL BEBAN OPERASIONAL (OPEX)</td>
                                        <td className="py-3 px-3 text-right text-base font-mono">
                                            Rp {totalOpex.toLocaleString('id-ID')}
                                        </td>
                                    </tr>

                                    {/* LABA / RUGI BERSIH */}
                                    <tr className={`font-black text-base border-t-2 transition ${
                                        isProfitable 
                                            ? 'bg-emerald-50 text-emerald-900 border-emerald-300' 
                                            : 'bg-rose-50 text-rose-900 border-rose-300'
                                    }`}>
                                        <td className="py-4 px-3">
                                            <div className="flex items-center gap-2.5">
                                                {isProfitable ? <Award className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
                                                <div>
                                                    <div className="tracking-wide">
                                                        {isProfitable ? 'LABA BERSIH USAHA (NET OPERATING PROFIT)' : 'RUGI BERSIH USAHA (NET OPERATING LOSS)'}
                                                    </div>
                                                    <div className="text-[10px] font-normal text-slate-500 font-mono mt-0.5">
                                                        {isProfitable 
                                                            ? 'Laba operasional bersih setelah dikurangi seluruh HPP dan Beban Usaha'
                                                            : 'Defisit Terjadi: Total Beban (HPP + OPEX) melampaui omzet riil berjalan'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-3 text-right font-mono">
                                            <div className="flex items-center justify-end gap-2.5">
                                                <span className="text-base sm:text-lg">
                                                    Rp {netProfitVal.toLocaleString('id-ID')}
                                                </span>
                                                <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                                                    isProfitable 
                                                        ? 'bg-emerald-600 text-white' 
                                                        : 'bg-rose-600 text-white'
                                                }`}>
                                                    {netMarginPct}% {isProfitable ? 'NET' : 'DEFISIT'}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* ALERT DEFISIT USAHA JIKA NEGATIF */}
                        {!isProfitable && (
                            <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs">
                                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <h4 className="font-bold text-rose-900">Peringatan Keuangan: Defisit Usaha Terdeteksi</h4>
                                    <p className="text-slate-600 leading-relaxed">
                                        Total beban operasional (Rp {totalOpex.toLocaleString('id-ID')}) dan HPP pengadaan bahan (Rp {totalCogs.toLocaleString('id-ID')}) melebihi pendapatan berjalan. 
                                        Rekomendasi tindakan mitigasi:
                                    </p>
                                    <ul className="list-disc list-inside text-slate-600 space-y-0.5 pt-1">
                                        <li>Percepat penagihan piutang COD supir (saat ini tercatat <strong className="text-rose-700">Rp {pendingCodVal.toLocaleString('id-ID')}</strong>).</li>
                                        <li>Tingkatkan utilisasi bahan kaca sisa rak (scrap) senilai estimasi <strong className="text-[#1b68b0]">Rp {(metrics.scrapGlassLoss || 0).toLocaleString('id-ID')}</strong> untuk menghemat HPP.</li>
                                        <li>Lakukan efisiensi pada pos beban listrik mesin dan BBM logistik armada.</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* FINANCIAL HEALTH & RATIOS SIDEBAR */}
                    <div className="space-y-4">
                        {/* RATIOS CARD */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                            <h3 className="font-bold text-[#242222] text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                                <Shield className="w-4 h-4 text-[#1b68b0]" />
                                <span>Rasio Kesehatan Finansial Usaha</span>
                            </h3>

                            <div className="space-y-3 text-xs">
                                <div>
                                    <div className="flex justify-between text-slate-700 mb-1">
                                        <span>Gross Profit Margin</span>
                                        <strong className="text-emerald-700 font-mono">{grossMarginPct}%</strong>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                        <div className="bg-[#70b03c] h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, grossMarginPct))}%` }} />
                                    </div>
                                    <span className="text-[10px] text-slate-500">Benchmark industri kaca: 30% - 45% (Sangat Baik)</span>
                                </div>

                                <div>
                                    <div className="flex justify-between text-slate-700 mb-1">
                                        <span>Net Profit Margin</span>
                                        <strong className={`font-mono ${isProfitable ? 'text-[#1b68b0]' : 'text-rose-600'}`}>
                                            {netMarginPct}%
                                        </strong>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-500 ${isProfitable ? 'bg-[#1b68b0]' : 'bg-rose-500'}`} 
                                            style={{ width: `${Math.min(100, Math.max(0, Math.abs(netMarginPct) * 1.5))}%` }} 
                                        />
                                    </div>
                                    <span className="text-[10px] text-slate-500">
                                        {isProfitable ? 'Efisiensi konversi omset menjadi laba bersih riil' : 'Terjadi defisit margin operasional'}
                                    </span>
                                </div>

                                <div>
                                    <div className="flex justify-between text-slate-700 mb-1">
                                        <span>Operating Expense Ratio (OER)</span>
                                        <strong className={`font-mono ${totalRev > 0 && (totalOpex / totalRev) <= 0.35 ? 'text-purple-700' : 'text-amber-700'}`}>
                                            {totalRev > 0 ? ((totalOpex / totalRev) * 100).toFixed(1) : 0}%
                                        </strong>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                        <div className={`h-full rounded-full ${totalRev > 0 && (totalOpex / totalRev) <= 0.35 ? 'bg-purple-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(100, (totalOpex / (totalRev || 1)) * 100)}%` }} />
                                    </div>
                                    <span className="text-[10px] text-slate-500">
                                        {totalRev > 0 && (totalOpex / totalRev) <= 0.35 ? 'Beban operasional pabrik terkontrol aman (< 35%)' : 'Rasio beban operasional terhadap omzet perlu dievaluasi'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* CASH FLOW STABILITY CARD */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
                            <h4 className="font-bold text-[#242222] text-xs flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-emerald-600" />
                                <span>Posisi Likuiditas & Arus Kas Riil</span>
                            </h4>
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs font-mono">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Total Kas Masuk Riil:</span>
                                    <strong className="text-emerald-700">Rp {paidRev.toLocaleString('id-ID')}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Total Kas Keluar Belanja:</span>
                                    <strong className="text-rose-600">Rp {grandTotalExpenses.toLocaleString('id-ID')}</strong>
                                </div>
                                <div className="flex justify-between border-t border-slate-200 pt-2">
                                    <span className="text-slate-700 font-bold">Net Saldo Kas Riil:</span>
                                    <strong className={`font-extrabold ${paidRev - grandTotalExpenses >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                                        Rp {(paidRev - grandTotalExpenses).toLocaleString('id-ID')}
                                    </strong>
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-500">
                                Piutang COD Surat Jalan Merah sebesar <strong className="text-rose-600">Rp {pendingCodVal.toLocaleString('id-ID')}</strong> dalam proses penagihan supir.
                            </p>
                        </div>

                        {/* SCRAP GLASS WASTE EFFICIENCY CARD */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
                            <h4 className="font-bold text-[#242222] text-xs flex items-center gap-2">
                                <Recycle className="w-4 h-4 text-emerald-600" />
                                <span>Efisiensi Limbah & Scrap Kaca Manufaktur</span>
                            </h4>
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs font-mono">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Total Potongan di Rak:</span>
                                    <strong className="text-purple-700">{metrics.scrapCount || scrapGlasses.length} Potongan</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Estimasi Nilai Material:</span>
                                    <strong className="text-rose-600">Rp {(metrics.scrapGlassLoss || (scrapGlasses.length * 125000)).toLocaleString('id-ID')}</strong>
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-500">
                                Divisi HT/GM/BV/Etsa diarahkan memanfaatkan sisa kaca rak untuk pesanan kecil guna menghemat pengeluaran bahan baru ke supplier.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* SUB-TAB 2: PEMBELIAN BAHAN BAKU SUPPLIER */}
            {financeSubTab === 'purchases' && (
                <div className="space-y-4">
                    <div className="flex flex-wrap justify-between items-center gap-3 bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
                        <div>
                            <h3 className="font-bold text-[#242222] text-sm flex items-center gap-2">
                                <Package className="w-4 h-4 text-[#1b68b0]" />
                                <span>Daftar Pembelian Lembaran Bahan Kaca ke Supplier</span>
                            </h3>
                            <p className="text-xs text-slate-500">
                                Rekap purchase order lembaran kaca float, cermin Asahimas, tempered, dan kaca laminated
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => handleOpenPrintModal('purchases')}
                                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                            >
                                <Printer className="w-3.5 h-3.5 text-slate-500" />
                                <span>Cetak Rekap</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleOpenFinanceModal('pembelian_bahan')}
                                className="px-4 py-2 bg-[#70b03c] hover:bg-[#5f9733] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Beli Bahan Kaca</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-slate-50 text-slate-500 font-mono font-bold uppercase border-b border-slate-200 text-[11px]">
                                    <tr>
                                        <th className="py-3 px-4">No. PO</th>
                                        <th className="py-3 px-4">Tanggal</th>
                                        <th className="py-3 px-4">Supplier / Mitra</th>
                                        <th className="py-3 px-4">Rincian Pembelian Kaca</th>
                                        <th className="py-3 px-4 text-right">Nominal (Rp)</th>
                                        <th className="py-3 px-4 text-center">Metode Bayar</th>
                                        <th className="py-3 px-4 text-center">Status</th>
                                        <th className="py-3 px-4 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                                    {financeTransactionsList.filter(t => t.type === 'pembelian_bahan').map((trx) => (
                                        <tr key={trx.id} className="hover:bg-slate-50 transition">
                                            <td className="py-3 px-4 font-bold text-[#1b68b0]">{trx.transaction_code}</td>
                                            <td className="py-3 px-4 text-slate-500">{trx.transaction_date}</td>
                                            <td className="py-3 px-4 font-sans font-bold text-[#242222]">{trx.supplier_name || '-'}</td>
                                            <td className="py-3 px-4 font-sans text-slate-600">
                                                <div className="font-semibold">{trx.title}</div>
                                                {trx.notes && <div className="text-[11px] text-slate-500">{trx.notes}</div>}
                                            </td>
                                            <td className="py-3 px-4 text-right font-black text-amber-700">
                                                Rp {Number(trx.amount).toLocaleString('id-ID')}
                                            </td>
                                            <td className="py-3 px-4 text-center text-slate-600">{trx.payment_method}</td>
                                            <td className="py-3 px-4 text-center">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${trx.payment_status === 'Lunas' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
                                                    {trx.payment_status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    onClick={() => handleDeleteFinanceTransaction(trx)}
                                                    title="Hapus Data Transaksi"
                                                    className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 cursor-pointer transition"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {financeTransactionsList.filter(t => t.type === 'pembelian_bahan').length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="text-center py-8 text-slate-500">
                                                Belum ada transaksi pembelian bahan kaca.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* SUB-TAB 3: PENGADAAN AKSESORIS & ALAT KERJA */}
            {financeSubTab === 'accessories_tools' && (
                <div className="space-y-4">
                    <div className="flex flex-wrap justify-between items-center gap-3 bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
                        <div>
                            <h3 className="font-bold text-[#242222] text-sm flex items-center gap-2">
                                <Wrench className="w-4 h-4 text-[#1b68b0]" />
                                <span>Belanja Aksesoris Kaca Konsumen & Perlengkapan Alat Pabrik</span>
                            </h3>
                            <p className="text-xs text-slate-500">
                                Handle pintu shower, floor hinge, sealant silikon, mata bor diamond, dan suction cup
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => handleOpenPrintModal('accessories_tools')}
                                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                            >
                                <Printer className="w-3.5 h-3.5 text-slate-500" />
                                <span>Cetak Rekap</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleOpenFinanceModal('pembelian_aksesoris')}
                                className="px-4 py-2 bg-[#1b68b0] hover:bg-[#15528c] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Beli Aksesoris / Alat</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-slate-50 text-slate-500 font-mono font-bold uppercase border-b border-slate-200 text-[11px]">
                                    <tr>
                                        <th className="py-3 px-4">No. PO</th>
                                        <th className="py-3 px-4">Tanggal</th>
                                        <th className="py-3 px-4">Kategori</th>
                                        <th className="py-3 px-4">Deskripsi Belanja</th>
                                        <th className="py-3 px-4">Vendor / Distributor</th>
                                        <th className="py-3 px-4 text-right">Nominal (Rp)</th>
                                        <th className="py-3 px-4 text-center">Status</th>
                                        <th className="py-3 px-4 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                                    {financeTransactionsList.filter(t => t.type === 'pembelian_aksesoris' || t.type === 'pembelian_alat').map((trx) => (
                                        <tr key={trx.id} className="hover:bg-slate-50 transition">
                                            <td className="py-3 px-4 font-bold text-[#1b68b0]">{trx.transaction_code}</td>
                                            <td className="py-3 px-4 text-slate-500">{trx.transaction_date}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${trx.type === 'pembelian_aksesoris' ? 'bg-blue-50 text-[#1b68b0] border border-blue-200' : 'bg-purple-50 text-purple-700 border border-purple-200'}`}>
                                                    {trx.category}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 font-sans font-semibold text-[#242222]">{trx.title}</td>
                                            <td className="py-3 px-4 font-sans text-slate-600">{trx.supplier_name || '-'}</td>
                                            <td className="py-3 px-4 text-right font-black text-amber-700">
                                                Rp {Number(trx.amount).toLocaleString('id-ID')}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                                    {trx.payment_status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    onClick={() => handleDeleteFinanceTransaction(trx)}
                                                    title="Hapus Data Transaksi"
                                                    className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 cursor-pointer transition"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {financeTransactionsList.filter(t => t.type === 'pembelian_aksesoris' || t.type === 'pembelian_alat').length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="text-center py-8 text-slate-500">
                                                Belum ada transaksi aksesoris atau alat.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* SUB-TAB 4: BEBAN OPERASIONAL PABRIK & TOKO (OPEX) */}
            {financeSubTab === 'opex' && (
                <div className="space-y-4">
                    {/* 4 OPEX HIGHLIGHT CARDS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                            <span className="text-xs text-slate-500 block">Listrik & Mesin Pabrik</span>
                            <h4 className="text-lg font-black text-amber-700 font-mono mt-1">Rp {listrikSum.toLocaleString('id-ID')}</h4>
                            <span className="text-[10px] text-slate-400">PLN Daya Industri 33 kVA</span>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                            <span className="text-xs text-slate-500 block">BBM Solar & Tol Armada</span>
                            <h4 className="text-lg font-black text-[#1b68b0] font-mono mt-1">Rp {bbmSum.toLocaleString('id-ID')}</h4>
                            <span className="text-[10px] text-slate-400">Truk Engkel, L300 & Blindvan</span>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                            <span className="text-xs text-slate-500 block">Gaji Pokok & Upah Lembur</span>
                            <h4 className="text-lg font-black text-purple-700 font-mono mt-1">Rp {gajiSum.toLocaleString('id-ID')}</h4>
                            <span className="text-[10px] text-slate-400">Divisi HT, GM, BV, Etsa & Supir</span>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                            <span className="text-xs text-slate-500 block">Servis Mesin & Kantor</span>
                            <h4 className="text-lg font-black text-rose-600 font-mono mt-1">Rp {(servisSum + kantorSum).toLocaleString('id-ID')}</h4>
                            <span className="text-[10px] text-slate-400">Maintenance conveyor & ATK</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-between items-center gap-3 bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
                        <div>
                            <h3 className="font-bold text-[#242222] text-sm flex items-center gap-2">
                                <Zap className="w-4 h-4 text-purple-600" />
                                <span>Rincian Beban Operasional Usaha (Operational Expenditure)</span>
                            </h3>
                            <p className="text-xs text-slate-500">Seluruh pengeluaran biaya operasional pabrik dan toko di luar bahan baku kaca</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => handleOpenPrintModal('opex')}
                                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                            >
                                <Printer className="w-3.5 h-3.5 text-slate-500" />
                                <span>Cetak Rincian</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleOpenFinanceModal('biaya_operasional')}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Catat Beban</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-slate-50 text-slate-500 font-mono font-bold uppercase border-b border-slate-200 text-[11px]">
                                    <tr>
                                        <th className="py-3 px-4">No. Bukti</th>
                                        <th className="py-3 px-4">Tanggal</th>
                                        <th className="py-3 px-4">Kategori Beban</th>
                                        <th className="py-3 px-4">Deskripsi Biaya</th>
                                        <th className="py-3 px-4">Penerima / Lembaga</th>
                                        <th className="py-3 px-4 text-right">Nominal (Rp)</th>
                                        <th className="py-3 px-4 text-center">Metode</th>
                                        <th className="py-3 px-4 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                                    {financeTransactionsList.filter(t => t.type === 'biaya_operasional').map((trx) => (
                                        <tr key={trx.id} className="hover:bg-slate-50 transition">
                                            <td className="py-3 px-4 font-bold text-purple-700">{trx.transaction_code}</td>
                                            <td className="py-3 px-4 text-slate-500">{trx.transaction_date}</td>
                                            <td className="py-3 px-4">
                                                <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded text-[10px] font-bold">
                                                    {trx.category}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 font-sans font-semibold text-[#242222]">{trx.title}</td>
                                            <td className="py-3 px-4 font-sans text-slate-600">{trx.supplier_name || '-'}</td>
                                            <td className="py-3 px-4 text-right font-black text-rose-600">
                                                Rp {Number(trx.amount).toLocaleString('id-ID')}
                                            </td>
                                            <td className="py-3 px-4 text-center text-slate-600">{trx.payment_method}</td>
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    onClick={() => handleDeleteFinanceTransaction(trx)}
                                                    title="Hapus Data Transaksi"
                                                    className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 cursor-pointer transition"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {financeTransactionsList.filter(t => t.type === 'biaya_operasional').length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="text-center py-8 text-slate-500">
                                                Belum ada data beban operasional.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* SUB-TAB 5: BUKU KAS & RIWAYAT MUTASI LENGKAP (LEDGER) */}
            {financeSubTab === 'ledger' && (
                <div className="space-y-4">
                    <div className="flex flex-wrap justify-between items-center gap-3 bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative w-64">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Cari kode, judul, supplier..."
                                    value={financeSearchTerm}
                                    onChange={e => setFinanceSearchTerm(e.target.value)}
                                    className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 font-mono w-full focus:border-[#1b68b0] focus:bg-white"
                                />
                            </div>
                            <select
                                value={financeCategoryFilter}
                                onChange={e => setFinanceCategoryFilter(e.target.value)}
                                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:border-[#1b68b0] cursor-pointer"
                            >
                                <option value="semua">Semua Kategori</option>
                                <option value="pembelian_bahan">Pembelian Bahan Kaca</option>
                                <option value="pembelian_aksesoris">Pembelian Aksesoris</option>
                                <option value="pembelian_alat">Pembelian Alat & Mesin</option>
                                <option value="biaya_operasional">Beban Operasional</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => handleOpenPrintModal('ledger')}
                                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                            >
                                <Printer className="w-3.5 h-3.5 text-slate-500" />
                                <span>Cetak Buku Kas</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleOpenFinanceModal('biaya_operasional')}
                                className="px-4 py-2 bg-[#70b03c] hover:bg-[#5f9733] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Catat Mutasi Baru</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-slate-50 text-slate-500 font-mono font-bold uppercase border-b border-slate-200 text-[11px]">
                                    <tr>
                                        <th className="py-3 px-4">No. Referensi</th>
                                        <th className="py-3 px-4">Tanggal</th>
                                        <th className="py-3 px-4">Asal & Kategori</th>
                                        <th className="py-3 px-4">Deskripsi Transaksi</th>
                                        <th className="py-3 px-4">Pihak Terkait</th>
                                        <th className="py-3 px-4">Metode Bayar</th>
                                        <th className="py-3 px-4 text-right">Keluar / Masuk (Rp)</th>
                                        <th className="py-3 px-4 text-center">Status</th>
                                        <th className="py-3 px-4 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                                    {filteredTransactions.map((trx) => (
                                        <tr key={trx.id} className="hover:bg-slate-50 transition">
                                            <td className="py-3 px-4 font-bold text-[#1b68b0]">{trx.transaction_code}</td>
                                            <td className="py-3 px-4 text-slate-500">{trx.transaction_date}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold w-fit ${
                                                        trx.type === 'pembelian_bahan' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                                                        trx.type === 'pembelian_aksesoris' ? 'bg-blue-50 text-[#1b68b0] border border-blue-200' :
                                                        trx.type === 'pembelian_alat' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                                                        'bg-slate-100 text-slate-700 border border-slate-200'
                                                    }`}>
                                                        {trx.category}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 font-sans flex items-center gap-1">
                                                        {trx.source_role === 'driver' ? 'Supir' :
                                                         trx.source_role === 'admin_gudang' ? 'Gudang' :
                                                         trx.source_role === 'admin_toko' ? 'Toko' : 'Manajemen'}
                                                        {trx.vehicle_plate && <span className="text-amber-700 font-mono">({trx.vehicle_plate.split(' ')[0]})</span>}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 font-sans font-semibold text-[#242222]">
                                                <div>{trx.title}</div>
                                                {trx.invoice_number && <div className="text-[10px] text-slate-400 font-mono">No. Faktur: {trx.invoice_number}</div>}
                                            </td>
                                            <td className="py-3 px-4 font-sans text-slate-600">{trx.supplier_name || '-'}</td>
                                            <td className="py-3 px-4 text-slate-600">{trx.payment_method}</td>
                                            <td className="py-3 px-4 text-right font-black text-rose-600">
                                                - Rp {Number(trx.amount).toLocaleString('id-ID')}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {trx.approval_status === 'pending' ? (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                                        Pending
                                                    </span>
                                                ) : trx.approval_status === 'rejected' ? (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                        Ditolak
                                                    </span>
                                                ) : (
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${trx.payment_status === 'Lunas' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
                                                        {trx.payment_status}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {trx.approval_status === 'pending' && (userRole === 'owner' || userRole === 'finance' || userRole === 'admin_finance') && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApproveClaim(trx.id)}
                                                                title="Setujui Klaim"
                                                                className="text-emerald-700 hover:text-emerald-800 p-1 rounded-lg hover:bg-emerald-50 cursor-pointer"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleRejectClaim(trx.id)}
                                                                title="Tolak Klaim"
                                                                className="text-rose-600 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 cursor-pointer"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteFinanceTransaction(trx)}
                                                        title="Hapus Data Transaksi"
                                                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 cursor-pointer transition"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredTransactions.length === 0 && (
                                        <tr>
                                            <td colSpan={9} className="text-center py-8 text-slate-500">
                                                Tidak ada data transaksi yang cocok dengan pencarian / filter.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
