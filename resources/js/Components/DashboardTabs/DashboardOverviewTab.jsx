import React, { useState } from 'react';
import CandlestickChart from '@/Components/Charts/CandlestickChart';

const DEFAULT_DONUT_SLICES = [
    { id: 'tempered', label: 'Kaca Tempered (8mm-12mm)', shortLabel: 'Tempered', percent: 45, color: '#06b6d4', strokeDasharray: '183.78 408.4', strokeDashoffset: '0', rp: 'Rp 57.8M', volume: '26 SPO' },
    { id: 'laminated', label: 'Kaca Laminated (5+5mm)', shortLabel: 'Laminated', percent: 25, color: '#3b82f6', strokeDasharray: '102.1 408.4', strokeDashoffset: '-188.78', rp: 'Rp 32.1M', volume: '15 SPO' },
    { id: 'bevel', label: 'Kaca Bevel & Cermin Decorative', shortLabel: 'Bevel/Cermin', percent: 18, color: '#10b981', strokeDasharray: '73.51 408.4', strokeDashoffset: '-295.88', rp: 'Rp 23.1M', volume: '10 SPO' },
    { id: 'float', label: 'Kaca Polos / Float Standard', shortLabel: 'Float', percent: 12, color: '#8b5cf6', strokeDasharray: '49.0 408.4', strokeDashoffset: '-374.39', rp: 'Rp 15.5M', volume: '7 SPO' },
];

export default function DashboardOverviewTab({
    userRole,
    userName,
    canViewPricing = true,
    setActiveTab,
    metrics = {},
    initialOrders = [],
    donutSlices = DEFAULT_DONUT_SLICES,
}) {
    const [hoveredDonutSegment, setHoveredDonutSegment] = useState(null);

    if (userRole !== 'owner' && userRole !== 'finance' && userRole !== 'admin_finance') {
        return null;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* WELCOME BANNER & PERFORMANCE HIGHLIGHT */}
            <div className="flex flex-wrap justify-between items-center gap-4 bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 p-6 rounded-2xl border border-cyan-500/20 shadow-2xl">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs bg-cyan-500/20 text-cyan-300 font-extrabold px-3 py-1 rounded-full border border-cyan-500/30">
                            📈 OPERATIONAL & SALES PERFORMANCE ANALYTICS
                        </span>
                        <span className="text-xs text-slate-400 font-mono">📅 Periode 2026</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-100 tracking-tight">Selamat Datang, {userName}!</h2>
                    <p className="text-slate-400 text-xs mt-0.5">
                        {canViewPricing
                            ? 'Monitoring Penjualan Kaca, Omset Usaha, dan Performa Divisi Pengerjaan SYP GLASS.'
                            : 'Monitoring Pengerjaan Kaca, Alur Disposisi Antar Divisi, dan Kinerja Operasional SYP GLASS.'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setActiveTab('orders')}
                        className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs transition shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer"
                    >
                        ✨ + Orderan Baru
                    </button>
                    {(userRole === 'owner' || userRole === 'admin_toko') && (
                        <button
                            onClick={() => setActiveTab('finance')}
                            className="bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold px-4 py-2.5 rounded-xl text-xs transition border border-emerald-500/30 flex items-center gap-2 cursor-pointer"
                        >
                            💰 Laporan Keuangan
                        </button>
                    )}
                </div>
            </div>

            {/* 4 SUMMARY METRIC CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-slate-900/80 border-l-4 border-cyan-500 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden group">
                    <div className="absolute -right-3 -bottom-3 text-6xl opacity-10 group-hover:scale-110 transition">📊</div>
                    <span className="text-xs text-slate-400 font-semibold block">Total Volume SPO Orderan</span>
                    <h3 className="text-3xl font-extrabold text-cyan-400 mt-1">{metrics.totalOrders} SPO</h3>
                    <span className="text-[11px] text-emerald-400 font-bold mt-2 inline-flex items-center gap-1">
                        📈 +14.3% vs Bulan Lalu
                    </span>
                </div>

                {canViewPricing ? (
                    <div className="bg-slate-900/80 border-l-4 border-emerald-500 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden group">
                        <div className="absolute -right-3 -bottom-3 text-6xl opacity-10 group-hover:scale-110 transition">💵</div>
                        <span className="text-xs text-slate-400 font-semibold block">Estimasi Omset Penjualan (Bulan Ini)</span>
                        <h3 className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">Rp 128.500.000</h3>
                        <span className="text-[11px] text-emerald-400 font-bold mt-2 inline-flex items-center gap-1">
                            🚀 Peak Omset Tertinggi 2026
                        </span>
                    </div>
                ) : (
                    <div className="bg-slate-900/80 border-l-4 border-emerald-500 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden group">
                        <div className="absolute -right-3 -bottom-3 text-6xl opacity-10 group-hover:scale-110 transition">🛠️</div>
                        <span className="text-xs text-slate-400 font-semibold block">Output Pengerjaan Selesai (Bulan Ini)</span>
                        <h3 className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">
                            {initialOrders.filter(o => o.status === 'selesai' || o.current_division === 'QC_Ready').length > 0
                                ? `${initialOrders.filter(o => o.status === 'selesai' || o.current_division === 'QC_Ready').length} SPO Selesai`
                                : '48 SPO Selesai'}
                        </h3>
                        <span className="text-[11px] text-emerald-400 font-bold mt-2 inline-flex items-center gap-1">
                            🚀 Kualitas & SLA On-Time 98.5%
                        </span>
                    </div>
                )}

                <div className="bg-slate-900/80 border-l-4 border-amber-500 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden group">
                    <div className="absolute -right-3 -bottom-3 text-6xl opacity-10 group-hover:scale-110 transition">⚙️</div>
                    <span className="text-xs text-slate-400 font-semibold block">Pesanan Aktif Dalam Divisi</span>
                    <h3 className="text-3xl font-extrabold text-amber-400 mt-1">{metrics.inProcess} SPO</h3>
                    <span className="text-[11px] text-cyan-300 font-medium mt-2 block">
                        HT: 2 | GM: 1 | BV: 1 | Etsa: 1
                    </span>
                </div>

                <div className="bg-slate-900/80 border-l-4 border-purple-500 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden group">
                    <div className="absolute -right-3 -bottom-3 text-6xl opacity-10 group-hover:scale-110 transition">🏆</div>
                    <span className="text-xs text-slate-400 font-semibold block">Efisiensi Performance Perusahaan</span>
                    <h3 className="text-3xl font-extrabold text-purple-400 mt-1">96.5%</h3>
                    <span className="text-[11px] text-purple-300 font-bold mt-2 block">
                        ✅ Target Fulfillment Terpenuhi
                    </span>
                </div>
            </div>

            {/* MAIN CHARTS SECTION: GRAFIK TREN PENJUALAN & PERFORMANCE PRODUK */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* GRAFIK 1: TREN PENJUALAN CANDLESTICK SAHAM FINANSIAL (OHLC & VOLUME TRADING VIEW) */}
                <div className="lg:col-span-2">
                    <CandlestickChart canViewPricing={canViewPricing} />
                </div>

                {/* GRAFIK 2: DIAGRAM DONAT / LINGKARAN KONTRIBUSI PRODUK KACA */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <div>
                                <h3 className="font-extrabold text-slate-100 text-base flex items-center gap-2">
                                    🎯 {canViewPricing ? 'Kontribusi Penjualan Per Jenis Kaca' : 'Distribusi Volume Jenis Kaca'}
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {canViewPricing ? 'Distribusi omset berdasarkan jenis produk kaca utama.' : 'Distribusi proporsi pengerjaan berdasarkan jenis produk kaca.'}
                                </p>
                            </div>
                            <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-300 px-2 py-1 rounded-lg border border-cyan-500/20 font-bold">
                                Donut Chart
                            </span>
                        </div>

                        {/* DONUT CHART SVG VISUALIZATION */}
                        <div className="flex flex-col items-center justify-center pt-4 pb-2">
                            <div className="relative w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                                    <defs>
                                        <filter id="donut-glow" x="-20%" y="-20%" width="140%" height="140%">
                                            <feGaussianBlur stdDeviation="3" result="blur" />
                                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                        </filter>
                                    </defs>

                                    {/* Track Background */}
                                    <circle
                                        cx="100"
                                        cy="100"
                                        r="65"
                                        fill="transparent"
                                        stroke="#0f172a"
                                        strokeWidth="20"
                                    />

                                    {/* Donut Segments */}
                                    {donutSlices.map((cat) => {
                                        const isHovered = hoveredDonutSegment?.id === cat.id;
                                        return (
                                            <circle
                                                key={cat.id}
                                                cx="100"
                                                cy="100"
                                                r="65"
                                                fill="transparent"
                                                stroke={cat.color}
                                                strokeWidth={isHovered ? 26 : 20}
                                                strokeDasharray={cat.strokeDasharray}
                                                strokeDashoffset={cat.strokeDashoffset}
                                                strokeLinecap="round"
                                                filter={isHovered ? 'url(#donut-glow)' : undefined}
                                                opacity={hoveredDonutSegment && !isHovered ? 0.45 : 1}
                                                className="transition-all duration-300 cursor-pointer"
                                                onMouseEnter={() => setHoveredDonutSegment(cat)}
                                                onMouseLeave={() => setHoveredDonutSegment(null)}
                                            />
                                        );
                                    })}
                                </svg>

                                {/* Donut Center Hole Content */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-4">
                                    <div className="w-24 h-24 rounded-full bg-slate-950/90 border border-slate-800 shadow-inner flex flex-col items-center justify-center p-1.5 transition-all duration-300">
                                        {hoveredDonutSegment ? (
                                            <>
                                                <span className="text-xl font-black font-mono leading-none tracking-tight" style={{ color: hoveredDonutSegment.color }}>
                                                    {hoveredDonutSegment.percent}%
                                                </span>
                                                <span className="text-[10px] text-slate-200 font-bold truncate max-w-[80px] mt-1">
                                                    {hoveredDonutSegment.shortLabel}
                                                </span>
                                                <span className="text-[9px] text-slate-400 font-mono">
                                                    {canViewPricing ? hoveredDonutSegment.rp : hoveredDonutSegment.volume}
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-lg leading-none mb-0.5">🪟</span>
                                                <span className="text-sm font-black text-slate-100 font-mono leading-none">
                                                    {canViewPricing ? 'Rp 128.5M' : '58 SPO'}
                                                </span>
                                                <span className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wider font-semibold">
                                                    {canViewPricing ? 'Total Omset' : 'Total Order'}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* DONUT LEGEND ITEMS */}
                            <div className="w-full space-y-1.5 mt-4">
                                {donutSlices.map((cat) => {
                                    const isHovered = hoveredDonutSegment?.id === cat.id;
                                    return (
                                        <div
                                            key={cat.id}
                                            onMouseEnter={() => setHoveredDonutSegment(cat)}
                                            onMouseLeave={() => setHoveredDonutSegment(null)}
                                            className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer border ${isHovered
                                                ? 'bg-slate-800/90 border-cyan-500/50 shadow-md scale-[1.01]'
                                                : 'bg-slate-950/70 border-slate-800/70 hover:bg-slate-900/80 hover:border-slate-700'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <span
                                                    className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-transform duration-200"
                                                    style={{
                                                        backgroundColor: cat.color,
                                                        boxShadow: isHovered ? `0 0 10px ${cat.color}` : 'none',
                                                        transform: isHovered ? 'scale(1.3)' : 'scale(1)'
                                                    }}
                                                ></span>
                                                <span className="text-xs text-slate-300 font-medium truncate">{cat.label}</span>
                                            </div>
                                            <div className="text-right flex-shrink-0 ml-2 font-mono">
                                                <span className="font-extrabold text-xs" style={{ color: cat.color }}>{cat.percent}%</span>
                                                {canViewPricing ? (
                                                    <span className="text-[10px] text-slate-400 block font-normal">{cat.rp}</span>
                                                ) : (
                                                    <span className="text-[10px] text-slate-400 block font-normal">{cat.volume}</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* DIVISIONAL PERFORMANCE RATING */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                        <h4 className="font-bold text-xs text-amber-400 flex items-center justify-between">
                            <span>⚡ Kinerja Pengerjaan Divisi (SLA On-Time)</span>
                            <span className="text-emerald-400 font-mono">96.5% Avg</span>
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                            <div className="bg-slate-900 p-2 rounded border border-slate-800 flex justify-between">
                                <span className="text-slate-400">✂️ Div HT</span>
                                <span className="text-emerald-400 font-bold">98.5%</span>
                            </div>
                            <div className="bg-slate-900 p-2 rounded border border-slate-800 flex justify-between">
                                <span className="text-slate-400">✨ Div GM</span>
                                <span className="text-cyan-400 font-bold">96.2%</span>
                            </div>
                            <div className="bg-slate-900 p-2 rounded border border-slate-800 flex justify-between">
                                <span className="text-slate-400">💎 Div BV</span>
                                <span className="text-amber-400 font-bold">95.0%</span>
                            </div>
                            <div className="bg-slate-900 p-2 rounded border border-slate-800 flex justify-between">
                                <span className="text-slate-400">🚚 Driver</span>
                                <span className="text-purple-400 font-bold">97.8%</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
