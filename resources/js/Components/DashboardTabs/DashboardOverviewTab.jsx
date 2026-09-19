import React, { useState } from 'react';
import { 
    BarChart3, Plus, FileText, TrendingUp, DollarSign, 
    Activity, Award, PieChart, CheckCircle2, ShieldCheck, 
    Boxes, Wrench, Scissors, Sparkles, Truck
} from 'lucide-react';
import CandlestickChart from '@/Components/Charts/CandlestickChart';

const DEFAULT_DONUT_SLICES = [
    { id: 'tempered', label: 'Kaca Tempered (8mm-12mm)', shortLabel: 'Tempered', percent: 45, color: '#1b68b0', strokeDasharray: '183.78 408.4', strokeDashoffset: '0', rp: 'Rp 57.8M', volume: '26 SPO' },
    { id: 'laminated', label: 'Kaca Laminated (5+5mm)', shortLabel: 'Laminated', percent: 25, color: '#70b03c', strokeDasharray: '102.1 408.4', strokeDashoffset: '-188.78', rp: 'Rp 32.1M', volume: '15 SPO' },
    { id: 'bevel', label: 'Kaca Bevel & Cermin Decorative', shortLabel: 'Bevel/Cermin', percent: 18, color: '#f59e0b', strokeDasharray: '73.51 408.4', strokeDashoffset: '-295.88', rp: 'Rp 23.1M', volume: '10 SPO' },
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
        <div className="space-y-6">
            {/* WELCOME BANNER & PERFORMANCE HIGHLIGHT */}
            <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs bg-blue-50 text-[#1b68b0] font-extrabold px-3 py-0.5 rounded-full border border-blue-200">
                            OPERATIONAL & SALES PERFORMANCE
                        </span>
                        <span className="text-xs text-slate-500 font-mono font-medium">Periode 2026</span>
                    </div>
                    <h2 className="text-2xl font-black text-[#242222] tracking-tight">Selamat Datang, {userName}!</h2>
                    <p className="text-slate-500 text-xs font-medium mt-1">
                        {canViewPricing
                            ? 'Monitoring Penjualan Kaca, Omset Usaha, dan Performa Divisi Pengerjaan SYP GLASS.'
                            : 'Monitoring Pengerjaan Kaca, Alur Disposisi Antar Divisi, dan Kinerja Operasional SYP GLASS.'}
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    <button
                        onClick={() => setActiveTab('orders')}
                        className="bg-[#1b68b0] hover:bg-[#15528c] text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5" /> Orderan Baru
                    </button>
                    {(userRole === 'owner' || userRole === 'admin_toko') && (
                        <button
                            onClick={() => setActiveTab('finance')}
                            className="bg-white hover:bg-slate-50 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs transition border border-slate-300 shadow-2xs flex items-center gap-1.5 cursor-pointer"
                        >
                            <FileText className="w-3.5 h-3.5 text-[#1b68b0]" /> Laporan Keuangan
                        </button>
                    )}
                </div>
            </div>

            {/* 4 SUMMARY METRIC CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border-l-4 border-l-[#1b68b0] border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
                    <span className="text-xs text-slate-500 font-semibold block">Total Volume SPO Orderan</span>
                    <h3 className="text-3xl font-black text-[#1b68b0] mt-1">{metrics.totalOrders || initialOrders.length} SPO</h3>
                    <span className="text-[11px] text-[#70b03c] font-bold mt-2 inline-flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" /> +14.3% vs Bulan Lalu
                    </span>
                </div>

                {canViewPricing ? (
                    <div className="bg-white border-l-4 border-l-[#70b03c] border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
                        <span className="text-xs text-slate-500 font-semibold block">Estimasi Omset Penjualan (Bulan Ini)</span>
                        <h3 className="text-2xl font-black text-[#70b03c] mt-1 font-mono">Rp 128.500.000</h3>
                        <span className="text-[11px] text-slate-600 font-bold mt-2 inline-flex items-center gap-1">
                            Peak Omset Tertinggi 2026
                        </span>
                    </div>
                ) : (
                    <div className="bg-white border-l-4 border-l-[#70b03c] border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
                        <span className="text-xs text-slate-500 font-semibold block">Output Pengerjaan Selesai (Bulan Ini)</span>
                        <h3 className="text-2xl font-black text-[#70b03c] mt-1 font-mono">
                            {initialOrders.filter(o => o.status === 'selesai' || o.current_division === 'QC_Ready').length > 0
                                ? `${initialOrders.filter(o => o.status === 'selesai' || o.current_division === 'QC_Ready').length} SPO Selesai`
                                : '48 SPO Selesai'}
                        </h3>
                        <span className="text-[11px] text-[#70b03c] font-bold mt-2 inline-flex items-center gap-1">
                            Kualitas & SLA On-Time 98.5%
                        </span>
                    </div>
                )}

                <div className="bg-white border-l-4 border-l-amber-500 border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
                    <span className="text-xs text-slate-500 font-semibold block">Pesanan Aktif Dalam Divisi</span>
                    <h3 className="text-3xl font-black text-amber-600 mt-1">{metrics.inProcess || initialOrders.filter(o => o.status === 'pengerjaan').length} SPO</h3>
                    <span className="text-[11px] text-slate-600 font-medium mt-2 block font-mono">
                        HT: 2 | GM: 1 | BV: 1 | Etsa: 1
                    </span>
                </div>

                <div className="bg-white border-l-4 border-l-purple-500 border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
                    <span className="text-xs text-slate-500 font-semibold block">Efisiensi Performance Perusahaan</span>
                    <h3 className="text-3xl font-black text-purple-700 mt-1">96.5%</h3>
                    <span className="text-[11px] text-purple-700 font-bold mt-2 block">
                        Target Fulfillment Terpenuhi
                    </span>
                </div>
            </div>

            {/* MAIN CHARTS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* GRAFIK 1: TREN PENJUALAN CANDLESTICK & VOLUME */}
                <div className="lg:col-span-2">
                    <CandlestickChart canViewPricing={canViewPricing} />
                </div>

                {/* GRAFIK 2: DIAGRAM DONAT / LINGKARAN KONTRIBUSI PRODUK KACA */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <div>
                                <h3 className="font-black text-[#242222] text-sm flex items-center gap-2">
                                    <PieChart className="w-4 h-4 text-[#1b68b0]" />
                                    <span>{canViewPricing ? 'Kontribusi Penjualan Per Jenis Kaca' : 'Distribusi Volume Jenis Kaca'}</span>
                                </h3>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                    {canViewPricing ? 'Distribusi omset berdasarkan jenis produk kaca utama.' : 'Distribusi proporsi pengerjaan berdasarkan jenis produk kaca.'}
                                </p>
                            </div>
                            <span className="text-[10px] font-mono bg-blue-50 text-[#1b68b0] px-2 py-0.5 rounded-md border border-blue-200 font-bold">
                                Donut Chart
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
                                                <span className="text-[10px] text-slate-700 font-bold truncate max-w-[80px] mt-1">
                                                    {hoveredDonutSegment.shortLabel}
                                                </span>
                                                <span className="text-[9px] text-slate-500 font-mono">
                                                    {canViewPricing ? hoveredDonutSegment.rp : hoveredDonutSegment.volume}
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <Boxes className="w-5 h-5 text-[#1b68b0] mb-0.5" />
                                                <span className="text-sm font-black text-[#242222] font-mono leading-none">
                                                    {canViewPricing ? 'Rp 128.5M' : '58 SPO'}
                                                </span>
                                                <span className="text-[9px] text-slate-500 mt-0.5 uppercase tracking-wider font-semibold">
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
                                                ? 'bg-blue-50/60 border-blue-300 shadow-xs'
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
                                                {canViewPricing ? (
                                                    <span className="text-[10px] text-slate-500 block font-normal">{cat.rp}</span>
                                                ) : (
                                                    <span className="text-[10px] text-slate-500 block font-normal">{cat.volume}</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* DIVISIONAL PERFORMANCE RATING */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                        <h4 className="font-bold text-xs text-[#242222] flex items-center justify-between">
                            <span>Kinerja Pengerjaan Divisi (SLA On-Time)</span>
                            <span className="text-[#70b03c] font-mono font-bold">96.5% Avg</span>
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                            <div className="bg-white p-2 rounded-lg border border-slate-200 flex justify-between">
                                <span className="text-slate-500 font-sans">Div HT</span>
                                <span className="text-[#70b03c] font-bold">98.5%</span>
                            </div>
                            <div className="bg-white p-2 rounded-lg border border-slate-200 flex justify-between">
                                <span className="text-slate-500 font-sans">Div GM</span>
                                <span className="text-[#1b68b0] font-bold">96.2%</span>
                            </div>
                            <div className="bg-white p-2 rounded-lg border border-slate-200 flex justify-between">
                                <span className="text-slate-500 font-sans">Div BV</span>
                                <span className="text-amber-600 font-bold">95.0%</span>
                            </div>
                            <div className="bg-white p-2 rounded-lg border border-slate-200 flex justify-between">
                                <span className="text-slate-500 font-sans">Driver</span>
                                <span className="text-purple-600 font-bold">97.8%</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
