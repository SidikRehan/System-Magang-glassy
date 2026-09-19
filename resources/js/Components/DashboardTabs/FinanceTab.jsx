import React from 'react';

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
            <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-800 pb-4">
                <div>
                    <div className="flex items-center gap-2.5">
                        <span className="text-2xl">💼</span>
                        <h2 className="text-2xl font-black text-slate-100">
                            Executive Finance & Laba/Rugi (P&L)
                        </h2>
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono font-black px-3 py-0.5 rounded-full">
                            CV Cahya Karunia Jaya
                        </span>
                    </div>
                    <p className="text-slate-400 text-xs mt-1">
                        Laporan Laba Rugi Komprehensif (P&L), Pengadaan Bahan Baku Kaca, Pengeluaran Biaya Operasional Pabrik, & Buku Kas Mutasi Usaha
                    </p>
                </div>

                {/* QUICK ACTION BUTTONS */}
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={() => handleOpenPrintModal('all')}
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold rounded-xl border border-cyan-500/30 hover:border-cyan-500/60 text-xs flex items-center gap-2 transition cursor-pointer shadow-md"
                    >
                        <span>🖨️</span> Cetak Semua Laporan (Lengkap)
                    </button>

                    <button
                        type="button"
                        onClick={() => handleOpenFinanceModal('pembelian_bahan')}
                        className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black rounded-xl shadow-lg shadow-emerald-500/20 text-xs flex items-center gap-2 transition cursor-pointer"
                    >
                        <span>➕</span> Catat Transaksi Finansial
                    </button>
                </div>
            </div>

            {/* 5 TOP EXECUTIVE METRIC CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* CARD 1: OMSET PENJUALAN */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 relative overflow-hidden group shadow-xl">
                    <div className="flex justify-between items-start">
                        <span className="text-xs text-slate-400 font-bold">Total Omzet Penjualan</span>
                        <span className="text-base">📈</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-cyan-400 font-mono mt-2">
                        Rp {totalRev.toLocaleString('id-ID')}
                    </h3>
                    <div className="text-[11px] text-slate-400 font-mono mt-2 flex items-center gap-1.5 border-t border-slate-800/80 pt-2">
                        <span className="text-cyan-300 font-bold">📦 {metrics.totalOrders || 0} SPO</span>
                        <span>• Terverifikasi Kasir</span>
                    </div>
                </div>

                {/* CARD 2: HPP (COGS) */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 relative overflow-hidden group shadow-xl">
                    <div className="flex justify-between items-start">
                        <span className="text-xs text-slate-400 font-bold">HPP (Bahan & Aksesoris)</span>
                        <span className="text-base">📦</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-amber-400 font-mono mt-2">
                        Rp {totalCogs.toLocaleString('id-ID')}
                    </h3>
                    <div className="text-[11px] text-amber-300/90 font-mono mt-2 flex items-center justify-between border-t border-slate-800/80 pt-2">
                        <span>Laba Kotor:</span>
                        <span className="font-bold">{grossMarginPct}%</span>
                    </div>
                </div>

                {/* CARD 3: BEBAN OPERASIONAL (OPEX) */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 relative overflow-hidden group shadow-xl">
                    <div className="flex justify-between items-start">
                        <span className="text-xs text-slate-400 font-bold">Beban Operasional (OPEX)</span>
                        <span className="text-base">⚡</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-purple-400 font-mono mt-2">
                        Rp {totalOpex.toLocaleString('id-ID')}
                    </h3>
                    <div className="text-[11px] text-purple-300/90 font-mono mt-2 flex items-center justify-between border-t border-slate-800/80 pt-2">
                        <span>Listrik, BBM & Gaji</span>
                        <span className="font-bold">{approvedTransactions.filter(t => t.type === 'biaya_operasional').length} Pos</span>
                    </div>
                </div>

                {/* CARD 4: LABA / RUGI BERSIH (NET PROFIT / LOSS) */}
                <div className={`bg-slate-900/90 border-2 rounded-2xl p-4 relative overflow-hidden group shadow-2xl transition ${
                    isProfitable 
                        ? 'border-emerald-500/40 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40' 
                        : 'border-rose-500/50 bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/40'
                }`}>
                    <div className="flex justify-between items-start">
                        <span className={`text-xs font-extrabold ${isProfitable ? 'text-emerald-300' : 'text-rose-300'}`}>
                            {isProfitable ? 'Laba Bersih Usaha (Net)' : 'Defisit / Rugi Bersih (Net)'}
                        </span>
                        <span className="text-base">{isProfitable ? '🏆' : '⚠️'}</span>
                    </div>
                    <h3 className={`text-xl sm:text-2xl font-black font-mono mt-2 ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                        Rp {netProfitVal.toLocaleString('id-ID')}
                    </h3>
                    <div className={`text-[11px] font-mono mt-2 flex items-center justify-between border-t pt-2 ${
                        isProfitable ? 'text-emerald-300 border-emerald-500/20' : 'text-rose-300 border-rose-500/20'
                    }`}>
                        <span>{isProfitable ? 'Net Margin:' : 'Rasio Defisit:'}</span>
                        <span className={`font-black px-1.5 py-0.5 rounded ${
                            isProfitable ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                            {netMarginPct}% {isProfitable ? 'NET' : 'DEFISIT'}
                        </span>
                    </div>
                </div>

                {/* CARD 5: PIUTANG COD */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 relative overflow-hidden group shadow-xl">
                    <div className="flex justify-between items-start">
                        <span className="text-xs text-rose-300 font-bold">Piutang COD Driver (SJ)</span>
                        <span className="text-base">🚚</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-rose-400 font-mono mt-2">
                        Rp {pendingCodVal.toLocaleString('id-ID')}
                    </h3>
                    <div className="text-[11px] text-slate-400 font-mono mt-2 flex items-center justify-between border-t border-slate-800/80 pt-2">
                        <span>Kas Terkumpul:</span>
                        <span className="text-emerald-400 font-bold">Rp {paidRev.toLocaleString('id-ID')}</span>
                    </div>
                </div>
            </div>

            {/* ANTREAN PERSETUJUAN KLAIM BIAYA (DRIVER ARMADA & TOKO) */}
            {pendingClaims.length > 0 && (
                <div className="bg-amber-950/30 border-2 border-amber-500/50 rounded-2xl p-5 shadow-2xl shadow-amber-500/10 space-y-3 relative overflow-hidden">
                    <div className="flex flex-wrap justify-between items-center border-b border-amber-500/20 pb-3 gap-2">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping"></span>
                            <h3 className="text-sm font-black text-amber-300 flex items-center gap-1.5">
                                ⏳ Antrean Persetujuan Klaim Pengeluaran ({pendingClaims.length} Menunggu)
                            </h3>
                        </div>
                        <span className="text-[11px] font-mono text-amber-200 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30 font-bold">
                            Otorisasi: Owner & Tim Akuntan
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {pendingClaims.map(clm => (
                            <div key={clm.id} className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between space-y-3">
                                <div className="space-y-1">
                                    <div className="flex justify-between items-start">
                                        <span className="font-mono text-xs font-bold text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                                            {clm.transaction_code}
                                        </span>
                                        <span className="text-base font-black text-amber-300 font-mono">
                                            Rp {Number(clm.amount || 0).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-slate-100 text-sm">{clm.title}</h4>
                                    <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2 pt-1">
                                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-semibold">
                                            {clm.source_role === 'driver' ? '🚚 Supir Armada' : '🛒 Admin Toko'}
                                        </span>
                                        {clm.vehicle_plate && (
                                            <span className="text-slate-300 font-mono font-semibold">
                                                {clm.vehicle_plate}
                                            </span>
                                        )}
                                        <span>• {clm.transaction_date}</span>
                                        <span>• {clm.supplier_name}</span>
                                    </div>
                                    {clm.notes && (
                                        <p className="text-xs text-slate-400 italic bg-slate-950/50 p-2 rounded border border-slate-800/80 mt-1">
                                            "{clm.notes}"
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                                    <button
                                        onClick={() => handleRejectClaim(clm.id)}
                                        className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 rounded-lg text-xs font-bold transition cursor-pointer"
                                    >
                                        ✕ Tolak
                                    </button>
                                    <button
                                        onClick={() => handleApproveClaim(clm.id)}
                                        className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-lg text-xs transition shadow-lg shadow-emerald-500/20 flex items-center gap-1 cursor-pointer"
                                    >
                                        ✓ Setujui & Cairkan Kas
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* SUB-TAB NAVIGATION STRIP */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3 text-xs font-bold font-mono">
                {[
                    { id: 'pnl', label: '📊 Laporan Laba / Rugi (P&L)', badge: `${netMarginPct}% Net` },
                    { id: 'purchases', label: '📦 Pembelian Bahan Kaca', badge: `Rp ${(bahanKacaSum / 1000000).toFixed(1)}M` },
                    { id: 'accessories_tools', label: '💎 Aksesoris & Alat Kerja', badge: `Rp ${((aksesorisSum + alatSum) / 1000000).toFixed(1)}M` },
                    { id: 'opex', label: '⚡ Biaya Operasional (OPEX)', badge: `Rp ${(totalOpex / 1000000).toFixed(1)}M` },
                    { id: 'ledger', label: '📑 Buku Kas & Riwayat Mutasi', badge: `${financeTransactionsList.length} Trx` },
                ].map((subTab) => (
                    <button
                        key={subTab.id}
                        onClick={() => setFinanceSubTab(subTab.id)}
                        className={`px-4 py-2.5 rounded-xl border transition flex items-center gap-2 cursor-pointer ${financeSubTab === subTab.id
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-lg shadow-cyan-500/10'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                    >
                        <span>{subTab.label}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${financeSubTab === subTab.id ? 'bg-cyan-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'}`}>
                            {subTab.badge}
                        </span>
                    </button>
                ))}
            </div>

            {/* SUB-TAB 1: LAPORAN LABA / RUGI KOMPREHENSIF (P&L) */}
            {financeSubTab === 'pnl' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* FINANCIAL STATEMENT TABLE */}
                    <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
                        <div className="border-b border-slate-800 pb-3 flex flex-wrap justify-between items-center gap-3">
                            <div>
                                <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
                                    <span>📑</span> Laporan Laba Rugi Eksekutif (Income Statement)
                                </h3>
                                <p className="text-xs text-slate-400 font-mono">Periode: Januari - September 2026 (YTD)</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleOpenPrintModal('pnl')}
                                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow"
                                >
                                    <span>🖨️</span> Cetak Laba Rugi (P&L)
                                </button>
                                <span className={`text-xs px-3 py-1 rounded-full font-bold font-mono border flex items-center gap-1.5 ${
                                    isProfitable 
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                }`}>
                                    <span>{isProfitable ? '✅' : '⚠️'}</span>
                                    <span>Status: {isProfitable ? 'SEHAT & PROFITABLE' : 'PERINGATAN: DEFISIT USAHA'}</span>
                                </span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-xs font-mono">
                                <tbody className="divide-y divide-slate-800/80">
                                    {/* 1. PENDAPATAN */}
                                    <tr className="bg-slate-950/60 text-cyan-400 font-black">
                                        <td className="py-2.5 px-3">1. PENDAPATAN USAHA (REVENUE)</td>
                                        <td className="py-2.5 px-3 text-right">JUMLAH (RP)</td>
                                    </tr>
                                    <tr className="hover:bg-slate-800/30">
                                        <td className="py-2 px-6 text-slate-300">• Penjualan Kaca & Jasa Proses Pabrik (SPO)</td>
                                        <td className="py-2 px-3 text-right text-slate-200 font-bold">Rp {Number(metrics.totalRevenue - (metrics.otherRevenue || 0)).toLocaleString('id-ID')}</td>
                                    </tr>
                                    <tr className="hover:bg-slate-800/30">
                                        <td className="py-2 px-6 text-slate-300">• Pendapatan Lain-lain (Non-SPO / Scrap Kaca)</td>
                                        <td className="py-2 px-3 text-right text-slate-300">Rp {(metrics.otherRevenue || 0).toLocaleString('id-ID')}</td>
                                    </tr>
                                    <tr className="bg-slate-900/80 font-extrabold text-cyan-300">
                                        <td className="py-2.5 px-3">TOTAL PENDAPATAN BERSIH (NET REVENUE)</td>
                                        <td className="py-2.5 px-3 text-right text-sm">Rp {totalRev.toLocaleString('id-ID')}</td>
                                    </tr>

                                    {/* 2. HPP (COGS) */}
                                    <tr className="bg-slate-950/60 text-amber-400 font-black">
                                        <td className="py-2.5 px-3 pt-4">2. HARGA POKOK PENJUALAN (HPP / COGS)</td>
                                        <td className="py-2.5 px-3 pt-4 text-right"></td>
                                    </tr>
                                    <tr className="hover:bg-slate-800/30">
                                        <td className="py-2 px-6 text-slate-300">• Pembelian Lembaran Bahan Kaca Supplier</td>
                                        <td className="py-2 px-3 text-right text-rose-300">Rp {bahanKacaSum.toLocaleString('id-ID')}</td>
                                    </tr>
                                    <tr className="hover:bg-slate-800/30">
                                        <td className="py-2 px-6 text-slate-300">• Pembelian Aksesoris Kaca Konsumen</td>
                                        <td className="py-2 px-3 text-right text-rose-300">Rp {aksesorisSum.toLocaleString('id-ID')}</td>
                                    </tr>
                                    <tr className="bg-slate-900/80 font-extrabold text-amber-300">
                                        <td className="py-2.5 px-3">TOTAL HPP PRODUKSI</td>
                                        <td className="py-2.5 px-3 text-right text-sm">Rp {totalCogs.toLocaleString('id-ID')}</td>
                                    </tr>

                                    {/* LABA KOTOR */}
                                    <tr className={`font-black text-sm border-t-2 border-b-2 transition ${
                                        grossProfitVal >= 0
                                            ? 'bg-slate-950/90 text-emerald-300 border-emerald-500/30'
                                            : 'bg-slate-950/90 text-rose-300 border-rose-500/30'
                                    }`}>
                                        <td className="py-3 px-3">LABA KOTOR (GROSS PROFIT)</td>
                                        <td className="py-3 px-3 text-right">
                                            Rp {grossProfitVal.toLocaleString('id-ID')}{' '}
                                            <span className={`text-xs font-bold ${grossProfitVal >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                ({grossMarginPct}%)
                                            </span>
                                        </td>
                                    </tr>

                                    {/* 3. BEBAN OPERASIONAL PABRIK & TOKO (OPEX) */}
                                    <tr className="bg-slate-950/80 text-purple-400 font-black border-t-2 border-purple-500/30">
                                        <td className="py-3 px-3 pt-4">
                                            <div className="flex items-center justify-between">
                                                <span className="flex items-center gap-2">
                                                    <span>⚡</span> 3. BEBAN OPERASIONAL PABRIK & TOKO (OPEX)
                                                </span>
                                                <span className="text-[10px] font-mono text-purple-300/80 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded font-normal">
                                                    6 Pos Biaya Operasional
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-3 pt-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => handleOpenFinanceModal('biaya_operasional')}
                                                className="text-[10px] bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 px-2.5 py-1 rounded-lg font-bold transition inline-flex items-center gap-1 cursor-pointer"
                                            >
                                                <span>➕</span> Catat Beban
                                            </button>
                                        </td>
                                    </tr>

                                    {[
                                        {
                                            name: 'Beban Listrik & Daya Mesin Pabrik (PLN)',
                                            sum: listrikSum,
                                            category: 'Listrik & Energi Pabrik',
                                            budget: 15000000,
                                            icon: '⚡',
                                            desc: 'Gardu Trafo 33 kVA, Oven Tempered & Mesin Gosok'
                                        },
                                        {
                                            name: 'Beban BBM Solar & Logistik Armada Truk/L300',
                                            sum: bbmSum,
                                            category: 'BBM & Logistik Armada',
                                            budget: 6000000,
                                            icon: '⛽',
                                            desc: 'Armada Truk Engkel, L300 & Klaim Operasional Supir'
                                        },
                                        {
                                            name: 'Beban Gaji Staf, Upah & Uang Lembur',
                                            sum: gajiSum,
                                            category: 'Gaji & Upah Lembur',
                                            budget: 22000000,
                                            icon: '👥',
                                            desc: 'Gaji operator mesin pabrik, supir & admin toko'
                                        },
                                        {
                                            name: 'Pemeliharaan Mesin Gosok/Bevel & Servis Armada',
                                            sum: servisSum,
                                            category: 'Perawatan Mesin',
                                            budget: 4000000,
                                            icon: '🔧',
                                            desc: 'Penggantian oli spindle mesin bevel & servis armada'
                                        },
                                        {
                                            name: 'Pengadaan Alat Penunjang & Mata Bor Pabrik',
                                            sum: alatSum,
                                            category: 'Alat & Mesin',
                                            budget: 8000000,
                                            icon: '🛠️',
                                            desc: 'Mata bor diamond, piringan poles slepan & safety suction'
                                        },
                                        {
                                            name: 'Operasional Kantor Toko, Wifi & ATK',
                                            sum: kantorSum,
                                            category: 'Operasional Kantor',
                                            budget: 2500000,
                                            icon: '🏢',
                                            desc: 'Internet fiber optic, ATK surat jalan & kasir toko'
                                        },
                                    ].map((item, idx) => {
                                        const sharePct = totalOpex > 0 ? ((item.sum / totalOpex) * 100).toFixed(1) : '0.0';
                                        const budgetPct = Math.round((item.sum / item.budget) * 100);
                                        const isBudgetSafe = budgetPct <= 100;

                                        return (
                                            <tr key={idx} className="hover:bg-slate-800/40 transition group">
                                                <td className="py-2.5 px-3">
                                                    <div className="flex items-start gap-2.5">
                                                        <span className="text-sm mt-0.5">{item.icon}</span>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="font-bold text-slate-200">• {item.name}</span>
                                                                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded">
                                                                    {sharePct}% OPEX
                                                                </span>
                                                                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                                                                    isBudgetSafe 
                                                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                                                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                                                }`}>
                                                                    Plafon: Rp {(item.budget / 1000000).toFixed(1)}M ({budgetPct}% {isBudgetSafe ? 'Aman' : 'Over'})
                                                                </span>
                                                            </div>
                                                            <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                                                                <span>{item.desc}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-2.5 px-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <span className="text-slate-200 font-mono font-bold">
                                                            Rp {item.sum.toLocaleString('id-ID')}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDrilldownOpex(item.category)}
                                                            title="Lihat rincian transaksi pengeluaran pos ini"
                                                            className="text-[10px] text-cyan-400 hover:text-cyan-200 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 px-2 py-0.5 rounded font-mono transition cursor-pointer"
                                                        >
                                                            🔍 Rincian
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    <tr className="bg-slate-900/90 font-extrabold text-purple-300 border-t border-purple-500/30">
                                        <td className="py-3 px-3 text-sm">TOTAL BEBAN OPERASIONAL (OPEX)</td>
                                        <td className="py-3 px-3 text-right text-base font-mono">
                                            Rp {totalOpex.toLocaleString('id-ID')}
                                        </td>
                                    </tr>

                                    {/* LABA / RUGI BERSIH */}
                                    <tr className={`font-black text-base border-t-2 transition ${
                                        isProfitable 
                                            ? 'bg-emerald-950/70 text-emerald-400 border-emerald-500/50' 
                                            : 'bg-rose-950/70 text-rose-400 border-rose-500/60'
                                    }`}>
                                        <td className="py-4 px-3">
                                            <div className="flex items-center gap-2.5">
                                                <span className="text-xl">{isProfitable ? '🏆' : '⚠️'}</span>
                                                <div>
                                                    <div className="tracking-wide">
                                                        {isProfitable ? 'LABA BERSIH USAHA (NET OPERATING PROFIT)' : 'RUGI BERSIH USAHA (NET OPERATING LOSS)'}
                                                    </div>
                                                    <div className="text-[10px] font-normal text-slate-400 font-mono mt-0.5">
                                                        {isProfitable 
                                                            ? '✓ Laba operasional bersih setelah dikurangi seluruh HPP dan Beban Usaha'
                                                            : '⚠️ Defisit Terjadi: Total Beban (HPP + OPEX) melampaui omzet riil berjalan'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-3 text-right font-mono">
                                            <div className="flex items-center justify-end gap-2.5">
                                                <span className="text-base sm:text-lg">
                                                    Rp {netProfitVal.toLocaleString('id-ID')}
                                                </span>
                                                <span className={`text-xs px-2.5 py-1 rounded-full font-black ${
                                                    isProfitable 
                                                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30' 
                                                        : 'bg-rose-500 text-white shadow-md shadow-rose-500/30 animate-pulse'
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
                            <div className="mt-4 p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-start gap-3 text-xs">
                                <span className="text-xl">⚠️</span>
                                <div className="space-y-1">
                                    <h4 className="font-extrabold text-rose-300">Peringatan Keuangan: Defisit Usaha Terdeteksi</h4>
                                    <p className="text-slate-300 leading-relaxed">
                                        Total beban operasional (Rp {totalOpex.toLocaleString('id-ID')}) dan HPP pengadaan bahan (Rp {totalCogs.toLocaleString('id-ID')}) melebihi pendapatan berjalan. 
                                        Rekomendasi tindakan mitigasi:
                                    </p>
                                    <ul className="list-disc list-inside text-slate-400 space-y-0.5 pt-1">
                                        <li>Percepat penagihan piutang COD supir (saat ini tercatat <strong className="text-rose-300">Rp {pendingCodVal.toLocaleString('id-ID')}</strong>).</li>
                                        <li>Tingkatkan utilisasi bahan kaca sisa rak (scrap) senilai estimasi <strong className="text-cyan-300">Rp {(metrics.scrapGlassLoss || 0).toLocaleString('id-ID')}</strong> untuk menghemat HPP.</li>
                                        <li>Lakukan efisiensi pada pos beban listrik mesin dan BBM logistik armada.</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* FINANCIAL HEALTH & RATIOS SIDEBAR */}
                    <div className="space-y-4">
                        {/* RATIOS CARD */}
                        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                            <h3 className="font-extrabold text-slate-100 text-sm flex items-center gap-2 border-b border-slate-800 pb-3">
                                <span>🎯</span> Rasio Kesehatan Finansial Usaha
                            </h3>

                            <div className="space-y-3 text-xs">
                                <div>
                                    <div className="flex justify-between text-slate-300 mb-1">
                                        <span>Gross Profit Margin</span>
                                        <strong className="text-emerald-400 font-mono">{grossMarginPct}%</strong>
                                    </div>
                                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, grossMarginPct))}%` }} />
                                    </div>
                                    <span className="text-[10px] text-slate-500">Benchmark industri kaca: 30% - 45% (Sangat Baik)</span>
                                </div>

                                <div>
                                    <div className="flex justify-between text-slate-300 mb-1">
                                        <span>Net Profit Margin</span>
                                        <strong className={`font-mono ${isProfitable ? 'text-cyan-400' : 'text-rose-400'}`}>
                                            {netMarginPct}%
                                        </strong>
                                    </div>
                                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-500 ${isProfitable ? 'bg-cyan-500' : 'bg-rose-500'}`} 
                                            style={{ width: `${Math.min(100, Math.max(0, Math.abs(netMarginPct) * 1.5))}%` }} 
                                        />
                                    </div>
                                    <span className="text-[10px] text-slate-500">
                                        {isProfitable ? 'Efisiensi konversi omset menjadi laba bersih riil' : '⚠️ Terjadi defisit margin operasional'}
                                    </span>
                                </div>

                                <div>
                                    <div className="flex justify-between text-slate-300 mb-1">
                                        <span>Operating Expense Ratio (OER)</span>
                                        <strong className={`font-mono ${totalRev > 0 && (totalOpex / totalRev) <= 0.35 ? 'text-purple-400' : 'text-amber-400'}`}>
                                            {totalRev > 0 ? ((totalOpex / totalRev) * 100).toFixed(1) : 0}%
                                        </strong>
                                    </div>
                                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                                        <div className={`h-full rounded-full ${totalRev > 0 && (totalOpex / totalRev) <= 0.35 ? 'bg-purple-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(100, (totalOpex / (totalRev || 1)) * 100)}%` }} />
                                    </div>
                                    <span className="text-[10px] text-slate-500">
                                        {totalRev > 0 && (totalOpex / totalRev) <= 0.35 ? 'Beban operasional pabrik terkontrol aman (< 35%)' : '⚠️ Rasio beban operasional terhadap omzet perlu dievaluasi'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* CASH FLOW STABILITY CARD */}
                        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
                            <h4 className="font-bold text-slate-200 text-xs flex items-center gap-2">
                                <span>🛡️</span> Posisi Likuiditas & Arus Kas Riil
                            </h4>
                            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-2 text-xs font-mono">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Total Kas Masuk Riil:</span>
                                    <strong className="text-emerald-400">Rp {paidRev.toLocaleString('id-ID')}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Total Kas Keluar Belanja:</span>
                                    <strong className="text-rose-400">Rp {grandTotalExpenses.toLocaleString('id-ID')}</strong>
                                </div>
                                <div className="flex justify-between border-t border-slate-800 pt-2">
                                    <span className="text-slate-300 font-bold">Net Saldo Kas Riil:</span>
                                    <strong className={`font-extrabold ${paidRev - grandTotalExpenses >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        Rp {(paidRev - grandTotalExpenses).toLocaleString('id-ID')}
                                    </strong>
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-400">
                                💡 Piutang COD Surat Jalan Merah sebesar <strong className="text-rose-400">Rp {pendingCodVal.toLocaleString('id-ID')}</strong> dalam proses penagihan supir untuk memperkuat kas toko.
                            </p>
                        </div>

                        {/* SCRAP GLASS WASTE EFFICIENCY CARD */}
                        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
                            <h4 className="font-bold text-slate-200 text-xs flex items-center gap-2">
                                <span>♻️</span> Efisiensi Limbah & Scrap Kaca Manufaktur
                            </h4>
                            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-2 text-xs font-mono">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Total Potongan Scrap di Rak:</span>
                                    <strong className="text-purple-300">{metrics.scrapCount || scrapGlasses.length} Potongan</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Estimasi Nilai Material Scrap:</span>
                                    <strong className="text-rose-400">Rp {(metrics.scrapGlassLoss || (scrapGlasses.length * 125000)).toLocaleString('id-ID')}</strong>
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-400">
                                💡 Divisi HT/GM/BV/Etsa diarahkan memanfaatkan sisa kaca rak untuk pesanan kecil guna menghemat pengeluaran bahan baru ke supplier.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* SUB-TAB 2: PEMBELIAN BAHAN BAKU SUPPLIER */}
            {financeSubTab === 'purchases' && (
                <div className="space-y-4">
                    <div className="flex flex-wrap justify-between items-center gap-3 bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                        <div>
                            <h3 className="font-extrabold text-slate-100 text-sm flex items-center gap-2">
                                <span>📦</span> Daftar Pembelian Lembaran Bahan Kaca ke Supplier
                            </h3>
                            <p className="text-xs text-slate-400">
                                Rekap purchase order lembaran kaca float, cermin Asahimas, tempered, dan kaca laminated
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => handleOpenPrintModal('purchases')}
                                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                            >
                                <span>🖨️</span> Cetak Rekap Pengadaan
                            </button>
                            <button
                                type="button"
                                onClick={() => handleOpenFinanceModal('pembelian_bahan')}
                                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 transition cursor-pointer"
                            >
                                <span>➕</span> Beli Bahan Kaca Baru
                            </button>
                        </div>
                    </div>

                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-slate-950 text-slate-400 font-mono font-bold uppercase border-b border-slate-800">
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
                                <tbody className="divide-y divide-slate-800 text-slate-200 font-mono">
                                    {financeTransactionsList.filter(t => t.type === 'pembelian_bahan').map((trx) => (
                                        <tr key={trx.id} className="hover:bg-slate-800/40 transition">
                                            <td className="py-3 px-4 font-bold text-cyan-400">{trx.transaction_code}</td>
                                            <td className="py-3 px-4 text-slate-400">{trx.transaction_date}</td>
                                            <td className="py-3 px-4 font-sans font-bold text-slate-100">{trx.supplier_name || '-'}</td>
                                            <td className="py-3 px-4 font-sans text-slate-300">
                                                <div className="font-semibold">{trx.title}</div>
                                                {trx.notes && <div className="text-[11px] text-slate-500">{trx.notes}</div>}
                                            </td>
                                            <td className="py-3 px-4 text-right font-black text-amber-400">
                                                Rp {Number(trx.amount).toLocaleString('id-ID')}
                                            </td>
                                            <td className="py-3 px-4 text-center text-slate-300">{trx.payment_method}</td>
                                            <td className="py-3 px-4 text-center">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${trx.payment_status === 'Lunas' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                                                    {trx.payment_status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    onClick={() => handleDeleteFinanceTransaction(trx)}
                                                    title="Hapus Data Transaksi"
                                                    className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-500/10 cursor-pointer transition"
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* SUB-TAB 3: PENGADAAN AKSESORIS & ALAT KERJA */}
            {financeSubTab === 'accessories_tools' && (
                <div className="space-y-4">
                    <div className="flex flex-wrap justify-between items-center gap-3 bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                        <div>
                            <h3 className="font-extrabold text-slate-100 text-sm flex items-center gap-2">
                                <span>💎</span> Belanja Aksesoris Kaca Konsumen & Perlengkapan Alat Pabrik
                            </h3>
                            <p className="text-xs text-slate-400">
                                Handle pintu shower, floor hinge, sealant silikon, mata bor diamond, dan suction cup
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => handleOpenPrintModal('accessories_tools')}
                                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                            >
                                <span>🖨️</span> Cetak Rekap Aksesoris & Alat
                            </button>
                            <button
                                type="button"
                                onClick={() => handleOpenFinanceModal('pembelian_aksesoris')}
                                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 transition cursor-pointer"
                            >
                                <span>➕</span> Beli Aksesoris / Alat
                            </button>
                        </div>
                    </div>

                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-slate-950 text-slate-400 font-mono font-bold uppercase border-b border-slate-800">
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
                                <tbody className="divide-y divide-slate-800 text-slate-200 font-mono">
                                    {financeTransactionsList.filter(t => t.type === 'pembelian_aksesoris' || t.type === 'pembelian_alat').map((trx) => (
                                        <tr key={trx.id} className="hover:bg-slate-800/40 transition">
                                            <td className="py-3 px-4 font-bold text-cyan-400">{trx.transaction_code}</td>
                                            <td className="py-3 px-4 text-slate-400">{trx.transaction_date}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${trx.type === 'pembelian_aksesoris' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-purple-500/20 text-purple-300'}`}>
                                                    {trx.category}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 font-sans font-semibold text-slate-100">{trx.title}</td>
                                            <td className="py-3 px-4 font-sans text-slate-300">{trx.supplier_name || '-'}</td>
                                            <td className="py-3 px-4 text-right font-black text-amber-300">
                                                Rp {Number(trx.amount).toLocaleString('id-ID')}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                                    {trx.payment_status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    onClick={() => handleDeleteFinanceTransaction(trx)}
                                                    title="Hapus Data Transaksi"
                                                    className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-500/10 cursor-pointer transition"
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
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
                        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
                            <span className="text-xs text-slate-400 block">⚡ Listrik & Mesin Pabrik</span>
                            <h4 className="text-lg font-black text-amber-400 font-mono mt-1">Rp {listrikSum.toLocaleString('id-ID')}</h4>
                            <span className="text-[10px] text-slate-500">PLN Daya Industri 33 kVA</span>
                        </div>
                        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
                            <span className="text-xs text-slate-400 block">🚚 BBM Solar & Tol Armada</span>
                            <h4 className="text-lg font-black text-cyan-400 font-mono mt-1">Rp {bbmSum.toLocaleString('id-ID')}</h4>
                            <span className="text-[10px] text-slate-500">Truk Engkel, L300 & Blindvan</span>
                        </div>
                        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
                            <span className="text-xs text-slate-400 block">👥 Gaji Pokok & Upah Lembur</span>
                            <h4 className="text-lg font-black text-purple-400 font-mono mt-1">Rp {gajiSum.toLocaleString('id-ID')}</h4>
                            <span className="text-[10px] text-slate-500">Divisi HT, GM, BV, Etsa & Supir</span>
                        </div>
                        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
                            <span className="text-xs text-slate-400 block">🛠️ Servis Mesin & Kantor</span>
                            <h4 className="text-lg font-black text-rose-400 font-mono mt-1">Rp {(servisSum + kantorSum).toLocaleString('id-ID')}</h4>
                            <span className="text-[10px] text-slate-500">Maintenance conveyor & ATK</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-between items-center gap-3 bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                        <div>
                            <h3 className="font-extrabold text-slate-100 text-sm flex items-center gap-2">
                                <span>⚡</span> Rincian Beban Operasional Usaha (Operational Expenditure)
                            </h3>
                            <p className="text-xs text-slate-400">Seluruh pengeluaran biaya operasional pabrik dan toko di luar bahan baku kaca</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => handleOpenPrintModal('opex')}
                                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                            >
                                <span>🖨️</span> Cetak Rincian OPEX
                            </button>
                            <button
                                type="button"
                                onClick={() => handleOpenFinanceModal('biaya_operasional')}
                                className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 transition cursor-pointer"
                            >
                                <span>➕</span> Catat Beban Operasional
                            </button>
                        </div>
                    </div>

                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-slate-950 text-slate-400 font-mono font-bold uppercase border-b border-slate-800">
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
                                <tbody className="divide-y divide-slate-800 text-slate-200 font-mono">
                                    {financeTransactionsList.filter(t => t.type === 'biaya_operasional').map((trx) => (
                                        <tr key={trx.id} className="hover:bg-slate-800/40 transition">
                                            <td className="py-3 px-4 font-bold text-purple-400">{trx.transaction_code}</td>
                                            <td className="py-3 px-4 text-slate-400">{trx.transaction_date}</td>
                                            <td className="py-3 px-4">
                                                <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-[10px] font-bold">
                                                    {trx.category}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 font-sans font-semibold text-slate-100">{trx.title}</td>
                                            <td className="py-3 px-4 font-sans text-slate-300">{trx.supplier_name || '-'}</td>
                                            <td className="py-3 px-4 text-right font-black text-rose-400">
                                                Rp {Number(trx.amount).toLocaleString('id-ID')}
                                            </td>
                                            <td className="py-3 px-4 text-center text-slate-300">{trx.payment_method}</td>
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    onClick={() => handleDeleteFinanceTransaction(trx)}
                                                    title="Hapus Data Transaksi"
                                                    className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-500/10 cursor-pointer transition"
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* SUB-TAB 5: BUKU KAS & RIWAYAT MUTASI LENGKAP (LEDGER) */}
            {financeSubTab === 'ledger' && (
                <div className="space-y-4">
                    <div className="flex flex-wrap justify-between items-center gap-3 bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                        <div className="flex flex-wrap items-center gap-3">
                            <input
                                type="text"
                                placeholder="🔍 Cari kode, judul, atau supplier..."
                                value={financeSearchTerm}
                                onChange={e => setFinanceSearchTerm(e.target.value)}
                                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono w-64 focus:border-cyan-400"
                            />
                            <select
                                value={financeCategoryFilter}
                                onChange={e => setFinanceCategoryFilter(e.target.value)}
                                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-bold focus:border-cyan-400 cursor-pointer"
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
                                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                            >
                                <span>🖨️</span> Cetak Buku Kas / Mutasi
                            </button>
                            <button
                                type="button"
                                onClick={() => handleOpenFinanceModal('biaya_operasional')}
                                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 transition cursor-pointer"
                            >
                                <span>➕</span> Catat Mutasi Baru
                            </button>
                        </div>
                    </div>

                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-slate-950 text-slate-400 font-mono font-bold uppercase border-b border-slate-800">
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
                                <tbody className="divide-y divide-slate-800 text-slate-200 font-mono">
                                    {filteredTransactions.map((trx) => (
                                        <tr key={trx.id} className="hover:bg-slate-800/40 transition">
                                            <td className="py-3 px-4 font-bold text-cyan-400">{trx.transaction_code}</td>
                                            <td className="py-3 px-4 text-slate-400">{trx.transaction_date}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold w-fit ${
                                                        trx.type === 'pembelian_bahan' ? 'bg-amber-500/20 text-amber-300' :
                                                        trx.type === 'pembelian_aksesoris' ? 'bg-cyan-500/20 text-cyan-300' :
                                                        trx.type === 'pembelian_alat' ? 'bg-blue-500/20 text-blue-300' :
                                                        'bg-purple-500/20 text-purple-300'
                                                    }`}>
                                                        {trx.category}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-sans flex items-center gap-1">
                                                        {trx.source_role === 'driver' ? '🚚 Supir' :
                                                         trx.source_role === 'admin_gudang' ? '🏭 Gudang' :
                                                         trx.source_role === 'admin_toko' ? '🛒 Toko' : '💼 Manajemen'}
                                                        {trx.vehicle_plate && <span className="text-amber-400/80 font-mono">({trx.vehicle_plate.split(' ')[0]})</span>}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 font-sans font-semibold text-slate-100">
                                                <div>{trx.title}</div>
                                                {trx.invoice_number && <div className="text-[10px] text-slate-500 font-mono">No. Faktur: {trx.invoice_number}</div>}
                                            </td>
                                            <td className="py-3 px-4 font-sans text-slate-300">{trx.supplier_name || '-'}</td>
                                            <td className="py-3 px-4 text-slate-300">{trx.payment_method}</td>
                                            <td className="py-3 px-4 text-right font-black text-rose-400">
                                                - Rp {Number(trx.amount).toLocaleString('id-ID')}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {trx.approval_status === 'pending' ? (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                                                        ⏳ Pending
                                                    </span>
                                                ) : trx.approval_status === 'rejected' ? (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                                        ✕ Ditolak
                                                    </span>
                                                ) : (
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${trx.payment_status === 'Lunas' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                                        {trx.payment_status}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {trx.approval_status === 'pending' && (userRole === 'owner' || userRole === 'admin_toko') && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApproveClaim(trx.id)}
                                                                title="Setujui Klaim"
                                                                className="text-emerald-400 hover:text-emerald-300 p-1 rounded hover:bg-emerald-500/10 cursor-pointer"
                                                            >
                                                                ✓
                                                            </button>
                                                            <button
                                                                onClick={() => handleRejectClaim(trx.id)}
                                                                title="Tolak Klaim"
                                                                className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-500/10 cursor-pointer"
                                                            >
                                                                ✕
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteFinanceTransaction(trx)}
                                                        title="Hapus Data Transaksi"
                                                        className="text-slate-400 hover:text-rose-400 p-1 rounded hover:bg-rose-500/10 cursor-pointer transition"
                                                    >
                                                        🗑️
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
