import React, { useState, useMemo } from 'react';
import { 
    BarChart3, Plus, FileText, TrendingUp, DollarSign, 
    Activity, Award, PieChart, CheckCircle2, ShieldCheck, 
    Boxes, Wrench, Scissors, Sparkles, Truck, Clock,
    AlertTriangle, ChevronRight, ArrowRight, CreditCard,
    Check, Users, Layers
} from 'lucide-react';
import CandlestickChart from '@/Components/Charts/CandlestickChart';

export default function DashboardOverviewTab({
    userRole,
    userName,
    canViewPricing = true,
    setActiveTab,
    metrics = {},
    initialOrders = [],
}) {
    const [hoveredDonutSegment, setHoveredDonutSegment] = useState(null);

    if (userRole !== 'owner') {
        return null;
    }

    // Ekstraksi Nilai Finansial & Operasional Riil
    const totalRev = Number(metrics.totalRevenue || 0);
    const paidRev = Number(metrics.paidRevenue || 0);
    const pendingCodVal = Number(metrics.pendingCOD || 0);
    const netProfitVal = Number(metrics.netProfit || 0);
    const cogsVal = Number(metrics.cogsPurchases || 0);
    const opexVal = Number(metrics.opexExpenses || 0);
    const isProfitable = netProfitVal >= 0;
    const netMarginPct = totalRev > 0 ? ((netProfitVal / totalRev) * 100).toFixed(1) : '0.0';
    const paidPct = totalRev > 0 ? Math.round((paidRev / totalRev) * 100) : 0;

    const totalConfirmedOrders = Number(metrics.totalOrders || initialOrders.filter(o => o.status !== 'draft').length);
    const draftCount = Number(metrics.draftOrdersCount || 0);
    const draftTotal = Number(metrics.draftOrdersTotal || 0);
    const pendingApprovalCount = Number(metrics.pendingApprovalCount || 0);

    // Filter Pesanan Aktif dalam Divisi Pabrik
    const inProcessOrders = initialOrders.filter(o => o.status === 'pengerjaan');
    const divHtCount = inProcessOrders.filter(o => o.current_division === 'divisi_ht').length;
    const gudangCount = inProcessOrders.filter(o => o.current_division === 'admin_gudang').length;
    const divBvCount = inProcessOrders.filter(o => o.current_division === 'divisi_bv').length;
    const divGmCount = inProcessOrders.filter(o => o.current_division === 'divisi_gm').length;
    const divEtsaCount = inProcessOrders.filter(o => o.current_division === 'divisi_etsa').length;

    // Kalkulasi Dinamis Proporsi Kategori Kaca dari Pesanan Riil
    const dynamicDonutSlices = useMemo(() => {
        const categories = [
            {
                id: 'tempered',
                label: 'Kaca Tempered (8mm-12mm)',
                shortLabel: 'Tempered',
                color: '#1b68b0',
                matcher: (txt) => /tempered/i.test(txt),
            },
            {
                id: 'laminated',
                label: 'Kaca Laminated (5+5mm Safety)',
                shortLabel: 'Laminated',
                color: '#70b03c',
                matcher: (txt) => /laminated/i.test(txt),
            },
            {
                id: 'cermin_bevel',
                label: 'Cermin & Bevel Dekoratif',
                shortLabel: 'Cermin/Bevel',
                color: '#f59e0b',
                matcher: (txt) => /cermin|bevel/i.test(txt),
            },
            {
                id: 'etsa',
                label: 'Kaca Frosting & Etsa Sandblast',
                shortLabel: 'Frosting/Etsa',
                color: '#8b5cf6',
                matcher: (txt) => /frosting|etsa|sandblast/i.test(txt),
            },
            {
                id: 'float_riben',
                label: 'Kaca Polos Float & Riben Dark',
                shortLabel: 'Polos/Riben',
                color: '#06b6d4',
                matcher: (txt) => /bening|polos|riben|float/i.test(txt),
            },
        ];

        // Kelompokkan data order
        const buckets = categories.map(cat => ({
            ...cat,
            orders: [],
            totalRp: 0,
            count: 0
        }));

        let otherTotalRp = 0;
        let otherCount = 0;

        initialOrders.forEach(o => {
            const combinedText = `${o.glass_type || ''} ${o.description || ''}`;
            const matchedCat = buckets.find(b => b.matcher(combinedText));
            const price = Number(o.total_price || 0);

            if (matchedCat) {
                matchedCat.orders.push(o);
                matchedCat.totalRp += price;
                matchedCat.count += 1;
            } else {
                otherTotalRp += price;
                otherCount += 1;
            }
        });

        if (otherCount > 0) {
            buckets.push({
                id: 'lainnya',
                label: 'Pesanan Kaca Kustom / Lainnya',
                shortLabel: 'Lainnya',
                color: '#64748b',
                totalRp: otherTotalRp,
                count: otherCount
            });
        }

        const grandSum = buckets.reduce((acc, b) => acc + b.totalRp, 0) || 1;
        const CIRCUMFERENCE = 408.4; // 2 * PI * 65

        let cumulativeOffset = 0;

        return buckets.map(b => {
            const pct = Math.round((b.totalRp / grandSum) * 100) || 0;
            const strokeDash = (pct / 100) * CIRCUMFERENCE;
            const currentOffset = cumulativeOffset;
            cumulativeOffset -= strokeDash;

            const rpFormatted = b.totalRp >= 1000000000
                ? `Rp ${(b.totalRp / 1000000000).toFixed(2)}M`
                : `Rp ${(b.totalRp / 1000000).toFixed(1)} Jt`;

            return {
                id: b.id,
                label: b.label,
                shortLabel: b.shortLabel,
                percent: pct,
                color: b.color,
                strokeDasharray: `${strokeDash} ${CIRCUMFERENCE}`,
                strokeDashoffset: `${currentOffset}`,
                rp: rpFormatted,
                rawRp: b.totalRp,
                volume: `${b.count} SPO`
            };
        });
    }, [initialOrders]);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* WELCOME BANNER & PERFORMANCE HIGHLIGHT */}
            <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs bg-[#1b68b0]/10 text-[#1b68b0] font-extrabold px-3 py-0.5 rounded-full border border-[#1b68b0]/25">
                            EXECUTIVE DIRECTORS DASHBOARD
                        </span>
                        <span className="text-xs text-slate-500 font-mono font-medium">CV Cahya Karunia Jaya • Tahun 2026</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-[#242222] tracking-tight">
                        Selamat Datang, {userName}!
                    </h2>
                    <p className="text-slate-500 text-xs font-medium mt-1">
                        Monitoring terpadu performa penjualan pabrik kaca, kepatuhan SLA divisi pengerjaan, dan realisasi profitabilitas usaha.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                    <button
                        type="button"
                        onClick={() => setActiveTab('orders')}
                        className="bg-[#1b68b0] hover:bg-[#15528c] text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Orderan Baru</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('finance')}
                        className="bg-[#70b03c] hover:bg-[#5f9733] text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                        <DollarSign className="w-4 h-4" />
                        <span>Laporan Laba/Rugi (P&L)</span>
                    </button>
                </div>
            </div>

            {/* PUSAT PERHATIAN & OTORISASI CEPAT DIREKSI (EXECUTIVE ACTION STRIP) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* 1. Otorisasi Klaim & Biaya */}
                <div 
                    onClick={() => setActiveTab('finance')}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                        pendingApprovalCount > 0 
                            ? 'bg-amber-50/80 border-amber-200 hover:border-amber-300 shadow-xs' 
                            : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                pendingApprovalCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                            }`}>
                                <Clock className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-slate-700">Otorisasi Biaya</span>
                        </div>
                        {pendingApprovalCount > 0 && (
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                        )}
                    </div>
                    <div className="mt-3">
                        <div className="text-base font-black text-[#242222]">
                            {pendingApprovalCount > 0 ? `${pendingApprovalCount} Klaim Menunggu` : 'Semua Terotorisasi'}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                            {pendingApprovalCount > 0 ? 'BBM supir / beban operasional butuh persetujuan' : 'Tidak ada tagihan tertunda'}
                        </p>
                    </div>
                    <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#1b68b0] font-bold">
                        <span>Buka Finance</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                </div>

                {/* 2. Draf Penawaran / Quotation Pipeline */}
                <div 
                    onClick={() => setActiveTab('orders')}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                        draftCount > 0 
                            ? 'bg-blue-50/70 border-blue-200 hover:border-blue-300 shadow-xs' 
                            : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#1b68b0] flex items-center justify-center">
                                <FileText className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-slate-700">Draf Nego Konsumen</span>
                        </div>
                        {draftCount > 0 && (
                            <span className="text-[10px] font-mono font-bold bg-[#1b68b0] text-white px-2 py-0.5 rounded-full">
                                {draftCount} Draf
                            </span>
                        )}
                    </div>
                    <div className="mt-3">
                        <div className="text-base font-black text-[#242222]">
                            {draftCount > 0 ? `Rp ${(draftTotal / 1000000).toFixed(1)}M Potensi` : 'Semua Deal SPK'}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                            {draftCount > 0 ? `${draftCount} penawaran belum bayar DP / masih negosiasi` : 'Tidak ada antrean negosiasi'}
                        </p>
                    </div>
                    <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#1b68b0] font-bold">
                        <span>Lihat Draf Orderan</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                </div>

                {/* 3. Armada Pengiriman & Piutang COD */}
                <div 
                    onClick={() => setActiveTab('deliveries')}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white transition cursor-pointer flex flex-col justify-between"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center">
                                <Truck className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-slate-700">Logistik & COD</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                            {metrics.readyShip || 0} Di Jalan
                        </span>
                    </div>
                    <div className="mt-3">
                        <div className="text-base font-black text-purple-700 font-mono">
                            Rp {pendingCodVal.toLocaleString('id-ID')}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                            Piutang COD surat jalan dibawa driver aktif
                        </p>
                    </div>
                    <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#1b68b0] font-bold">
                        <span>Pantau Armada</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                </div>

                {/* 4. Pemanfaatan Sisa Kaca (Scrap Rak) */}
                <div 
                    onClick={() => setActiveTab('scrap')}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white transition cursor-pointer flex flex-col justify-between"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                                <Boxes className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-slate-700">Sisa Kaca Layak Pakai</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            {metrics.scrapCount || 0} Rak
                        </span>
                    </div>
                    <div className="mt-3">
                        <div className="text-base font-black text-[#242222]">
                            ~Rp {Number(metrics.scrapGlassLoss || 0).toLocaleString('id-ID')}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                            Potensi penghematan biaya potong bahan baru
                        </p>
                    </div>
                    <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#1b68b0] font-bold">
                        <span>Buka Rak Kaca</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                </div>
            </div>

            {/* 4 SUMMARY METRIC CARDS (REAL DATA & FULLY RECONCILED) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* CARD 1: VOLUME SPO DEAL */}
                <div className="bg-white border-l-4 border-l-[#1b68b0] border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
                    <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">
                        Volume SPO Terkonfirmasi
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-[#1b68b0] mt-1 font-mono">
                        {totalConfirmedOrders} SPO
                    </h3>
                    <div className="text-[11px] text-slate-600 font-medium mt-2 flex items-center gap-1.5 border-t border-slate-100 pt-2">
                        <span className="text-[#1b68b0] font-bold">{totalConfirmedOrders} Pesanan SPK</span>
                        {draftCount > 0 && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded border border-slate-200">
                                +{draftCount} Draf Nego
                            </span>
                        )}
                    </div>
                </div>

                {/* CARD 2: REAL TOTAL REVENUE (OMZET) */}
                <div className="bg-white border-l-4 border-l-[#70b03c] border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
                    <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">
                        Total Omzet Usaha (Deal)
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-[#70b03c] mt-1 font-mono truncate" title={`Rp ${totalRev.toLocaleString('id-ID')}`}>
                        Rp {totalRev.toLocaleString('id-ID')}
                    </h3>
                    <div className="text-[11px] text-slate-600 font-medium mt-2 flex items-center justify-between border-t border-slate-100 pt-2 font-mono">
                        <span>Kas Masuk:</span>
                        <span className="text-emerald-700 font-bold">
                            Rp {paidRev.toLocaleString('id-ID')} ({paidPct}%)
                        </span>
                    </div>
                </div>

                {/* CARD 3: PESANAN AKTIF DALAM DIVISI PABRIK */}
                <div className="bg-white border-l-4 border-l-amber-500 border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
                    <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">
                        Pesanan Sedang Dikerjakan
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-amber-600 mt-1 font-mono">
                        {inProcessOrders.length} SPO
                    </h3>
                    <div className="text-[11px] text-slate-600 font-mono font-medium mt-2 border-t border-slate-100 pt-2 truncate" title={`HT: ${divHtCount} | Gudang: ${gudangCount} | BV: ${divBvCount} | GM: ${divGmCount}`}>
                        HT: <strong className="text-slate-800">{divHtCount}</strong> | Gudang: <strong className="text-slate-800">{gudangCount}</strong> | BV: <strong className="text-slate-800">{divBvCount}</strong>
                    </div>
                </div>

                {/* CARD 4: LABA BERSIH EKSEKUTIF (NET PROFIT) */}
                <div className={`bg-white border-l-4 border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden ${
                    isProfitable ? 'border-l-emerald-600' : 'border-l-rose-600'
                }`}>
                    <span className={`text-xs font-bold block uppercase tracking-wider ${
                        isProfitable ? 'text-emerald-800' : 'text-rose-800'
                    }`}>
                        {isProfitable ? 'Laba Bersih Usaha (Net)' : 'Defisit Bersih (Net)'}
                    </span>
                    <h3 className={`text-xl sm:text-2xl font-black mt-1 font-mono truncate ${
                        isProfitable ? 'text-emerald-600' : 'text-rose-600'
                    }`} title={`Rp ${netProfitVal.toLocaleString('id-ID')}`}>
                        Rp {netProfitVal.toLocaleString('id-ID')}
                    </h3>
                    <div className="text-[11px] font-mono mt-2 flex items-center justify-between border-t border-slate-100 pt-2 text-slate-500">
                        <span>Margin Laba:</span>
                        <span className={`font-bold px-1.5 py-0.5 rounded ${
                            isProfitable ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}>
                            {netMarginPct}% {isProfitable ? 'NET' : 'DEFISIT'}
                        </span>
                    </div>
                </div>
            </div>

            {/* MAIN CHARTS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* GRAFIK 1: TREN PENJUALAN CANDLESTICK & VOLUME */}
                <div className="lg:col-span-2">
                    <CandlestickChart canViewPricing={canViewPricing} />
                </div>

                {/* GRAFIK 2: DIAGRAM DONAT KONTRIBUSI PRODUK KACA (100% DINAMIS DARI PESANAN RIIL) */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <div>
                                <h3 className="font-black text-[#242222] text-sm flex items-center gap-2">
                                    <PieChart className="w-4 h-4 text-[#1b68b0]" />
                                    <span>Kontribusi Penjualan Per Jenis Kaca</span>
                                </h3>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                    Proporsi omzet produk kaca utama CV Cahya Karunia Jaya
                                </p>
                            </div>
                            <span className="text-[10px] font-mono bg-blue-50 text-[#1b68b0] px-2.5 py-0.5 rounded-full border border-blue-200 font-bold">
                                Realtime Donut
                            </span>
                        </div>

                        {/* DONUT CHART SVG VISUALIZATION */}
                        <div className="flex flex-col items-center justify-center pt-4 pb-2">
                            <div className="relative w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                                    {/* Track Background */}
                                    <circle
                                        cx="100"
                                        cy="100"
                                        r="65"
                                        fill="transparent"
                                        stroke="#f1f5f9"
                                        strokeWidth="20"
                                    />

                                    {/* Donut Segments */}
                                    {dynamicDonutSlices.map((cat) => {
                                        const isHovered = hoveredDonutSegment?.id === cat.id;
                                        return (
                                            <circle
                                                key={cat.id}
                                                cx="100"
                                                cy="100"
                                                r="65"
                                                fill="transparent"
                                                stroke={cat.color}
                                                strokeWidth={isHovered ? 24 : 18}
                                                strokeDasharray={cat.strokeDasharray}
                                                strokeDashoffset={cat.strokeDashoffset}
                                                strokeLinecap="round"
                                                opacity={hoveredDonutSegment && !isHovered ? 0.35 : 1}
                                                className="transition-all duration-300 cursor-pointer"
                                                onMouseEnter={() => setHoveredDonutSegment(cat)}
                                                onMouseLeave={() => setHoveredDonutSegment(null)}
                                            />
                                        );
                                    })}
                                </svg>

                                {/* Donut Center Hole Content */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-4">
                                    <div className="w-24 h-24 rounded-full bg-slate-50 border border-slate-200 shadow-inner flex flex-col items-center justify-center p-1.5 transition-all duration-300">
                                        {hoveredDonutSegment ? (
                                            <>
                                                <span className="text-xl font-black font-mono leading-none tracking-tight" style={{ color: hoveredDonutSegment.color }}>
                                                    {hoveredDonutSegment.percent}%
                                                </span>
                                                <span className="text-[10px] text-slate-800 font-bold truncate max-w-[85px] mt-1">
                                                    {hoveredDonutSegment.shortLabel}
                                                </span>
                                                <span className="text-[9px] text-slate-500 font-mono">
                                                    {hoveredDonutSegment.rp}
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <Boxes className="w-5 h-5 text-[#1b68b0] mb-0.5" />
                                                <span className="text-sm font-black text-[#242222] font-mono leading-none">
                                                    Rp {(totalRev / 1000000).toFixed(1)}M
                                                </span>
                                                <span className="text-[9px] text-slate-500 mt-0.5 uppercase tracking-wider font-bold">
                                                    {totalConfirmedOrders} SPO Deal
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* DONUT LEGEND ITEMS */}
                            <div className="w-full space-y-1.5 mt-4">
                                {dynamicDonutSlices.map((cat) => {
                                    const isHovered = hoveredDonutSegment?.id === cat.id;
                                    return (
                                        <div
                                            key={cat.id}
                                            onMouseEnter={() => setHoveredDonutSegment(cat)}
                                            onMouseLeave={() => setHoveredDonutSegment(null)}
                                            className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer border ${isHovered
                                                ? 'bg-blue-50/70 border-blue-300 shadow-xs'
                                                : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <span
                                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                                    style={{ backgroundColor: cat.color }}
                                                ></span>
                                                <span className="text-xs text-slate-700 font-medium truncate">{cat.label}</span>
                                            </div>
                                            <div className="text-right shrink-0 ml-2 font-mono">
                                                <span className="font-black text-xs" style={{ color: cat.color }}>{cat.percent}%</span>
                                                <span className="text-[10px] text-slate-500 block font-normal">{cat.rp}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* DIVISIONAL PERFORMANCE & REAL WORKLOAD RATING */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                        <h4 className="font-bold text-xs text-[#242222] flex items-center justify-between">
                            <span>Status Beban Kerja Divisi Pabrik</span>
                            <span className="text-[#1b68b0] font-mono font-bold">{inProcessOrders.length} Order Aktif</span>
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                            <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex justify-between items-center shadow-2xs">
                                <span className="text-slate-600 font-sans font-medium">Divisi HT</span>
                                <span className="bg-blue-50 text-[#1b68b0] border border-blue-200 px-2 py-0.5 rounded-full font-bold">
                                    {divHtCount} SPO
                                </span>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex justify-between items-center shadow-2xs">
                                <span className="text-slate-600 font-sans font-medium">Gudang & QC</span>
                                <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                                    {gudangCount} SPO
                                </span>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex justify-between items-center shadow-2xs">
                                <span className="text-slate-600 font-sans font-medium">Divisi Bevel</span>
                                <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-bold">
                                    {divBvCount} SPO
                                </span>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex justify-between items-center shadow-2xs">
                                <span className="text-slate-600 font-sans font-medium">Armada Truk</span>
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                                    {metrics.readyShip || 0} Kirim
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
