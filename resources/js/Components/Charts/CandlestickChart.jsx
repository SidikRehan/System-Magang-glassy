import React, { useState } from 'react';

export default function CandlestickChart({ canViewPricing = true }) {
    // Mode tampilan grafik: 'candlestick', 'bar', 'area'
    const [chartMode, setChartMode] = useState('candlestick');
    // Timeframe: 'monthly', 'weekly'
    const [timeframe, setTimeframe] = useState('monthly');
    const [hoveredCandle, setHoveredCandle] = useState(null);

    // Data Candlestick Bulanan (OHLC dalam Juta Rupiah & SPO Volume)
    const monthlyData = [
        { period: 'Jan', open: 43.0, high: 51.2, low: 40.0, close: 48.5, volume: 22, growth: '+12.8%', note: 'Awal tahun proyek ruko & residential' },
        { period: 'Feb', open: 48.5, high: 62.0, low: 46.5, close: 59.2, volume: 28, growth: '+22.1%', note: 'Permintaan cermin & tempered naik' },
        { period: 'Mar', open: 59.2, high: 71.5, low: 56.0, close: 67.8, volume: 32, growth: '+14.5%', note: 'Proyek partisi kantor & etsa masjid' },
        { period: 'Apr', open: 67.8, high: 69.5, low: 58.0, close: 61.5, volume: 26, growth: '-9.3%', isBearish: true, note: 'Periode libur panjang & koreksi bahan' },
        { period: 'Mei', open: 61.5, high: 87.0, low: 60.5, close: 84.3, volume: 39, growth: '+37.1%', note: 'Rebound tajam kanopi tempered & bevel' },
        { period: 'Jun', open: 84.3, high: 99.8, low: 82.0, close: 96.7, volume: 44, growth: '+14.7%', note: 'Proyek interior apartemen & hotel' },
        { period: 'Jul', open: 96.7, high: 115.5, low: 93.0, close: 112.4, volume: 51, growth: '+16.2%', note: 'Permintaan kaca shower & laminated naik' },
        { period: 'Agu', open: 112.4, high: 134.0, low: 108.5, close: 128.5, volume: 58, growth: '+14.3%', isPeak: true, note: 'Puncak rekor penjualan 2026 (All-Time High)' },
    ];

    // Data Candlestick Mingguan (Agustus - September 2026)
    const weeklyData = [
        { period: 'M1 Agu', open: 108.0, high: 116.5, low: 106.0, close: 114.2, volume: 12, growth: '+5.7%' },
        { period: 'M2 Agu', open: 114.2, high: 122.0, low: 112.0, close: 120.5, volume: 14, growth: '+5.5%' },
        { period: 'M3 Agu', open: 120.5, high: 129.0, low: 118.5, close: 125.8, volume: 15, growth: '+4.4%' },
        { period: 'M4 Agu', open: 125.8, high: 134.0, low: 123.0, close: 128.5, volume: 17, growth: '+2.1%', isPeak: true },
        { period: 'M1 Sep', open: 128.5, high: 136.5, low: 126.0, close: 133.2, volume: 16, growth: '+3.7%' },
        { period: 'M2 Sep', open: 133.2, high: 139.0, low: 130.5, close: 137.8, volume: 18, growth: '+3.5%' },
    ];

    const currentDataset = timeframe === 'monthly' ? monthlyData : weeklyData;

    // Hitung Min dan Max untuk Skala Sumbu Y
    const minVal = Math.min(...currentDataset.map(d => d.low)) * 0.85;
    const maxVal = Math.max(...currentDataset.map(d => d.high)) * 1.08;
    const maxVolume = Math.max(...currentDataset.map(d => d.volume)) * 1.2;

    // Dimensi SVG
    const svgWidth = 720;
    const svgHeight = 270;
    const chartBottom = 200; // batas bawah chart lilin
    const volumeHeight = 55; // tinggi sub-chart volume
    const paddingLeft = 55;
    const paddingRight = 25;
    const usableWidth = svgWidth - paddingLeft - paddingRight;

    const getY = (val) => chartBottom - ((val - minVal) / (maxVal - minVal)) * (chartBottom - 25);
    const getVolHeight = (vol) => (vol / maxVolume) * volumeHeight;

    const stepX = usableWidth / currentDataset.length;

    // Koordinat untuk Moving Average Line (MA-3)
    const maPoints = currentDataset.map((item, idx, arr) => {
        const start = Math.max(0, idx - 2);
        const subset = arr.slice(start, idx + 1);
        const avg = subset.reduce((acc, c) => acc + c.close, 0) / subset.length;
        const x = paddingLeft + (idx + 0.5) * stepX;
        const y = getY(avg);
        return `${x},${y}`;
    }).join(' ');

    const activeItem = hoveredCandle || currentDataset[currentDataset.length - 1];

    return (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xl relative overflow-hidden backdrop-blur-md">
            {/* AMBIENT BACKGROUND GLOW */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* HEADER CHART CONTROLS */}
            <div className="flex flex-wrap justify-between items-start gap-4 border-b border-slate-800/80 pb-4 relative z-10">
                <div>
                    <div className="flex items-center gap-2.5">
                        <span className="text-xl">🕯️</span>
                        <h3 className="font-black text-slate-100 text-lg tracking-wide">
                            {canViewPricing ? 'Grafik Candlestick Omset & Tren Penjualan' : 'Grafik Tren Produksi & Volume SPO'}
                        </h3>
                        <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-mono animate-pulse">
                            ● MARKET BULLISH (+38.5% YoY)
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                        Visualisasi instrumen finansial OHLC (Open, High, Low, Close) pergerakan omset pesanan kaca & volume produksi pabrik
                    </p>
                </div>

                {/* MODE & TIMEFRAME SWITCHERS */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                    {/* TIMEFRAME BUTTONS */}
                    <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 font-mono">
                        <button
                            onClick={() => setTimeframe('monthly')}
                            className={`px-3 py-1 rounded-lg font-bold transition ${timeframe === 'monthly' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Bulanan (2026)
                        </button>
                        <button
                            onClick={() => setTimeframe('weekly')}
                            className={`px-3 py-1 rounded-lg font-bold transition ${timeframe === 'weekly' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Mingguan (Q3)
                        </button>
                    </div>

                    {/* CHART TYPE SWITCHER */}
                    <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 font-mono">
                        <button
                            onClick={() => setChartMode('candlestick')}
                            title="Tampilan Candlestick Saham"
                            className={`px-2.5 py-1 rounded-lg font-bold transition ${chartMode === 'candlestick' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            🕯️ Candle
                        </button>
                        <button
                            onClick={() => setChartMode('bar')}
                            title="Tampilan Bar Tradisional"
                            className={`px-2.5 py-1 rounded-lg font-bold transition ${chartMode === 'bar' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            📊 Bar
                        </button>
                        <button
                            onClick={() => setChartMode('area')}
                            title="Tampilan Area Wave"
                            className={`px-2.5 py-1 rounded-lg font-bold transition ${chartMode === 'area' ? 'bg-purple-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            📈 Area
                        </button>
                    </div>
                </div>
            </div>

            {/* TICKER HUD SUMMARY STRIP */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 text-xs font-mono">
                <div>
                    <span className="text-slate-500 text-[10px] block">PERIODE</span>
                    <strong className="text-cyan-400 font-extrabold text-sm">{activeItem.period} 2026</strong>
                </div>
                <div>
                    <span className="text-slate-500 text-[10px] block">OPEN (PEMBUKA)</span>
                    <strong className="text-slate-300 font-bold">
                        {canViewPricing ? `Rp ${activeItem.open}M` : `${activeItem.open} SPO`}
                    </strong>
                </div>
                <div>
                    <span className="text-slate-500 text-[10px] block">HIGH (TERTINGGI)</span>
                    <strong className="text-emerald-400 font-bold">
                        {canViewPricing ? `Rp ${activeItem.high}M` : `${activeItem.high} SPO`}
                    </strong>
                </div>
                <div>
                    <span className="text-slate-500 text-[10px] block">LOW (TERENDAH)</span>
                    <strong className="text-rose-400 font-bold">
                        {canViewPricing ? `Rp ${activeItem.low}M` : `${activeItem.low} SPO`}
                    </strong>
                </div>
                <div>
                    <span className="text-slate-500 text-[10px] block">CLOSE (PENUTUP)</span>
                    <strong className="text-cyan-300 font-extrabold text-sm">
                        {canViewPricing ? `Rp ${activeItem.close}M` : `${activeItem.close} SPO`}
                    </strong>
                </div>
                <div>
                    <span className="text-slate-500 text-[10px] block">VOLUME ORDER</span>
                    <span className="text-amber-300 font-bold">
                        📦 {activeItem.volume} SPO ({activeItem.growth})
                    </span>
                </div>
            </div>

            {/* SVG CANDLESTICK & VOLUME VISUALIZATION */}
            <div className="w-full overflow-x-auto select-none pt-2">
                <svg
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    className="w-full h-64 sm:h-72 overflow-visible"
                >
                    <defs>
                        {/* Glow Filter untuk Candlestick & MA Line */}
                        <filter id="bullish-glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#10b981" floodOpacity="0.4" />
                        </filter>
                        <filter id="bearish-glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#f43f5e" floodOpacity="0.4" />
                        </filter>
                        <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                        </linearGradient>
                    </defs>

                    {/* HORIZONTAL GRIDLINES & Y-AXIS LABELS */}
                    {[130, 100, 70, 40].map((levelVal) => {
                        const yPos = getY(levelVal);
                        return (
                            <g key={levelVal}>
                                <line
                                    x1={paddingLeft}
                                    y1={yPos}
                                    x2={svgWidth - paddingRight}
                                    y2={yPos}
                                    stroke="#1e293b"
                                    strokeDasharray="4 4"
                                    strokeWidth="1"
                                />
                                <text
                                    x={paddingLeft - 8}
                                    y={yPos + 3}
                                    fill="#64748b"
                                    fontSize="9"
                                    fontFamily="monospace"
                                    textAnchor="end"
                                >
                                    {canViewPricing ? `${levelVal}M` : `${levelVal}`}
                                </text>
                            </g>
                        );
                    })}

                    {/* SEPARATOR LINE ANTARA CANDLE & VOLUME */}
                    <line
                        x1={paddingLeft}
                        y1={chartBottom + 2}
                        x2={svgWidth - paddingRight}
                        y2={chartBottom + 2}
                        stroke="#334155"
                        strokeWidth="1"
                    />
                    <text
                        x={paddingLeft - 8}
                        y={chartBottom + 16}
                        fill="#475569"
                        fontSize="8"
                        fontFamily="monospace"
                        textAnchor="end"
                    >
                        VOL
                    </text>

                    {/* MODE 3: AREA WAVE (JIKA DIPILIH) */}
                    {chartMode === 'area' && (
                        <g>
                            <path
                                d={`M ${paddingLeft + 0.5 * stepX},${chartBottom} ` +
                                    currentDataset.map((d, i) => `L ${paddingLeft + (i + 0.5) * stepX},${getY(d.close)}`).join(' ') +
                                    ` L ${paddingLeft + (currentDataset.length - 0.5) * stepX},${chartBottom} Z`}
                                fill="url(#area-grad)"
                            />
                            <path
                                d={`M ${paddingLeft + 0.5 * stepX},${getY(currentDataset[0].close)} ` +
                                    currentDataset.map((d, i) => `L ${paddingLeft + (i + 0.5) * stepX},${getY(d.close)}`).join(' ')}
                                fill="none"
                                stroke="#06b6d4"
                                strokeWidth="2.5"
                            />
                        </g>
                    )}

                    {/* CANDLES OR BARS */}
                    {currentDataset.map((d, idx) => {
                        const centerX = paddingLeft + (idx + 0.5) * stepX;
                        const isBullish = d.close >= d.open;
                        const candleColor = isBullish ? '#10b981' : '#f43f5e';
                        const candleStroke = isBullish ? '#34d399' : '#fb7185';

                        const highY = getY(d.high);
                        const lowY = getY(d.low);
                        const openY = getY(d.open);
                        const closeY = getY(d.close);

                        const bodyTop = Math.min(openY, closeY);
                        const bodyHeight = Math.max(4, Math.abs(closeY - openY));
                        const candleWidth = Math.min(26, stepX * 0.55);

                        const isHovered = hoveredCandle?.period === d.period;

                        return (
                            <g
                                key={d.period}
                                className="cursor-pointer transition-opacity duration-200"
                                onMouseEnter={() => setHoveredCandle(d)}
                                onMouseLeave={() => setHoveredCandle(null)}
                            >
                                {/* HOVER COLUMN HIGHLIGHT BEAM */}
                                {isHovered && (
                                    <rect
                                        x={centerX - stepX * 0.45}
                                        y={10}
                                        width={stepX * 0.9}
                                        height={svgHeight - 35}
                                        fill="#06b6d4"
                                        fillOpacity="0.08"
                                        rx="8"
                                    />
                                )}

                                {chartMode === 'candlestick' && (
                                    <g filter={isBullish ? 'url(#bullish-glow)' : 'url(#bearish-glow)'}>
                                        {/* WICK / UPPER & LOWER SHADOW LINE */}
                                        <line
                                            x1={centerX}
                                            y1={highY}
                                            x2={centerX}
                                            y2={lowY}
                                            stroke={candleStroke}
                                            strokeWidth={isHovered ? 2.5 : 1.5}
                                        />

                                        {/* CANDLE BODY */}
                                        <rect
                                            x={centerX - candleWidth / 2}
                                            y={bodyTop}
                                            width={candleWidth}
                                            height={bodyHeight}
                                            fill={candleColor}
                                            fillOpacity={isHovered ? 1 : 0.9}
                                            stroke={candleStroke}
                                            strokeWidth={isHovered ? 2 : 1}
                                            rx="3"
                                        />

                                        {/* ATH PEAK FLAME MARKER */}
                                        {d.isPeak && (
                                            <text
                                                x={centerX}
                                                y={highY - 6}
                                                textAnchor="middle"
                                                fontSize="11"
                                            >
                                                🔥
                                            </text>
                                        )}
                                    </g>
                                )}

                                {chartMode === 'bar' && (
                                    <g>
                                        <rect
                                            x={centerX - candleWidth / 2}
                                            y={closeY}
                                            width={candleWidth}
                                            height={chartBottom - closeY}
                                            fill={isBullish ? '#06b6d4' : '#64748b'}
                                            rx="4"
                                        />
                                    </g>
                                )}

                                {/* VOLUME HISTOGRAM BAR (SUB-CHART DI BAWAH) */}
                                <g>
                                    <rect
                                        x={centerX - (candleWidth * 0.7) / 2}
                                        y={svgHeight - 25 - getVolHeight(d.volume)}
                                        width={candleWidth * 0.7}
                                        height={getVolHeight(d.volume)}
                                        fill={isBullish ? '#059669' : '#e11d48'}
                                        fillOpacity={isHovered ? 0.9 : 0.55}
                                        rx="2"
                                    />
                                </g>

                                {/* X-AXIS PERIOD LABEL */}
                                <text
                                    x={centerX}
                                    y={svgHeight - 8}
                                    fill={isHovered ? '#38bdf8' : (d.isPeak ? '#22d3ee' : '#94a3b8')}
                                    fontSize="10"
                                    fontFamily="monospace"
                                    fontWeight={d.isPeak || isHovered ? 'bold' : 'normal'}
                                    textAnchor="middle"
                                >
                                    {d.period}
                                </text>
                            </g>
                        );
                    })}

                    {/* MOVING AVERAGE CURVE LINE (MA-3 CYAN) */}
                    {chartMode !== 'area' && (
                        <polyline
                            points={maPoints}
                            fill="none"
                            stroke="#38bdf8"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeDasharray="4 2"
                            opacity="0.8"
                        />
                    )}
                </svg>
            </div>

            {/* CHART FOOTER METRICS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">
                        📊
                    </div>
                    <div>
                        <span className="text-slate-400 text-[11px] block">Rata-rata Omset Bulanan:</span>
                        <strong className="text-slate-100 font-mono text-sm">
                            {canViewPricing ? 'Rp 82.350.000' : '38.6 SPO'}
                        </strong>
                    </div>
                </div>

                <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                        🚀
                    </div>
                    <div>
                        <span className="text-slate-400 text-[11px] block">Bulan Puncak (All-Time High):</span>
                        <strong className="text-emerald-400 font-mono text-sm">
                            {canViewPricing ? 'Agustus (Rp 128.5M)' : 'Agustus (58 SPO)'}
                        </strong>
                    </div>
                </div>

                <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                        ⚡
                    </div>
                    <div>
                        <span className="text-slate-400 text-[11px] block">Indikator Tren Moving Average:</span>
                        <strong className="text-purple-300 font-mono text-sm">
                            Garis MA-3 Bullish (+38.5% YoY)
                        </strong>
                    </div>
                </div>
            </div>
        </div>
    );
}
