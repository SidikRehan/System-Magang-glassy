import React, { useState, useEffect } from 'react';
import { Printer, FileText } from 'lucide-react';

export default function PrintFinancialReportModal({
    isOpen,
    onClose,
    initialReportType = 'all',
    metrics = {},
    financeTransactionsList = [],
    ordersList = [],
    sheetGlasses = [],
    accessoriesList = [],
    toolsList = [],
    warehouseSuppliesList = [],
    scrapGlasses = [],
    currentUserName = 'Tim Finance & Akuntansi'
}) {
    const [selectedReportType, setSelectedReportType] = useState(initialReportType);

    useEffect(() => {
        if (isOpen) {
            setSelectedReportType(initialReportType);
        }
    }, [initialReportType, isOpen]);

    if (!isOpen) return null;

    const totalRev = Number(metrics.totalRevenue || 0);
    const otherRev = Number(metrics.otherRevenue || 0);
    const spoRev = totalRev - otherRev;
    const paidRev = Number(metrics.paidRevenue || 0);
    const pendingCodVal = Number(metrics.pendingCOD || 0);

    const approvedTransactions = financeTransactionsList.filter(t => t.approval_status === 'approved' && t.type !== 'rekap_bulanan');

    const bahanKacaTrx = approvedTransactions.filter(t => t.type === 'pembelian_bahan');
    const aksesorisTrx = approvedTransactions.filter(t => t.type === 'pembelian_aksesoris');
    const alatTrx = approvedTransactions.filter(t => t.type === 'pembelian_alat');
    const opexTrx = approvedTransactions.filter(t => t.type === 'biaya_operasional');

    const bahanKacaSum = bahanKacaTrx.reduce((a, b) => a + Number(b.amount || 0), 0);
    const aksesorisSum = aksesorisTrx.reduce((a, b) => a + Number(b.amount || 0), 0);
    const alatSum = alatTrx.reduce((a, b) => a + Number(b.amount || 0), 0);
    
    const listrikSum = approvedTransactions.filter(t => t.category === 'Listrik & Energi Pabrik').reduce((a, b) => a + Number(b.amount || 0), 0);
    const bbmSum = approvedTransactions.filter(t => t.category === 'BBM & Logistik Armada' || t.category === 'BBM Armada').reduce((a, b) => a + Number(b.amount || 0), 0);
    const gajiSum = approvedTransactions.filter(t => t.category === 'Gaji & Upah Lembur').reduce((a, b) => a + Number(b.amount || 0), 0);
    const servisSum = approvedTransactions.filter(t => t.category === 'Perawatan Mesin').reduce((a, b) => a + Number(b.amount || 0), 0);
    const kantorSum = approvedTransactions.filter(t => t.category === 'Operasional Kantor' || t.category === 'Biaya Sewa & Pajak').reduce((a, b) => a + Number(b.amount || 0), 0);
    const otherOpexSum = approvedTransactions.filter(t => t.type === 'biaya_operasional' && !['Listrik & Energi Pabrik', 'BBM & Logistik Armada', 'BBM Armada', 'Gaji & Upah Lembur', 'Perawatan Mesin', 'Operasional Kantor', 'Biaya Sewa & Pajak'].includes(t.category)).reduce((a, b) => a + Number(b.amount || 0), 0);

    const totalCogs = approvedTransactions.filter(t => t.type === 'pembelian_bahan' || t.type === 'pembelian_aksesoris').reduce((a, b) => a + Number(b.amount || 0), 0);
    const totalOpex = approvedTransactions.filter(t => t.type === 'biaya_operasional' || t.type === 'pembelian_alat').reduce((a, b) => a + Number(b.amount || 0), 0);
    const grandTotalExpenses = totalCogs + totalOpex;
    const grossProfitVal = totalRev - totalCogs;
    const netProfitVal = totalRev - grandTotalExpenses;
    const isProfitable = netProfitVal >= 0;
    const grossMarginPct = totalRev > 0 ? ((grossProfitVal / totalRev) * 100).toFixed(1) : '0.0';
    const netMarginPct = totalRev > 0 ? ((netProfitVal / totalRev) * 100).toFixed(1) : '0.0';
    const netOperatingCash = paidRev - grandTotalExpenses;

    // Kalkulasi Valuasi Total Keseluruhan Aset Perusahaan untuk Laporan Cetak
    const getToolUnitPrice = (tool) => {
        if (Number(tool.buy_price) > 0) return Number(tool.buy_price);
        if (Number(tool.estimated_price) > 0) return Number(tool.estimated_price);
        const cat = String(tool.category || '').toLowerCase();
        if (cat.includes('mesin utama')) return 15000000;
        if (cat.includes('bor') || cat.includes('potong')) return 1250000;
        if (cat.includes('vakum')) return 450000;
        if (cat.includes('mata bor')) return 185000;
        if (cat.includes('lapangan')) return 650000;
        return 250000;
    };

    const getSupplyUnitPrice = (sup) => {
        if (Number(sup.buy_price) > 0) return Number(sup.buy_price);
        if (Number(sup.estimated_price) > 0) return Number(sup.estimated_price);
        const cat = String(sup.category || '').toLowerCase();
        if (cat.includes('kimia') || cat.includes('oli') || cat.includes('pelumas')) return 85000;
        if (cat.includes('apd') || cat.includes('keselamatan')) return 35000;
        if (cat.includes('packaging')) return 25000;
        return 45000;
    };

    const totalGlassAssetValue = (sheetGlasses || []).reduce((sum, g) => sum + ((Number(g.qty) || 0) * (Number(g.buy_price) || 0)), 0);
    const totalAccAssetValue = (accessoriesList || []).reduce((sum, a) => sum + ((Number(a.qty) || 0) * (Number(a.buy_price) || 0)), 0);
    const totalToolsAssetValue = (toolsList || []).reduce((sum, t) => sum + ((Number(t.total_qty) || 0) * getToolUnitPrice(t)), 0);
    const totalSuppliesAssetValue = (warehouseSuppliesList || []).reduce((sum, s) => sum + ((Number(s.qty ?? s.stock_qty) || 0) * getSupplyUnitPrice(s)), 0);
    const totalScrapAssetValue = Number(metrics.scrapGlassLoss || ((scrapGlasses || []).length * 125000));
    const netCashBalance = Math.max(0, netOperatingCash);
    const totalPhysicalInventoryValue = totalGlassAssetValue + totalAccAssetValue + totalToolsAssetValue + totalSuppliesAssetValue + totalScrapAssetValue;
    const grandTotalCompanyAssets = totalPhysicalInventoryValue + netCashBalance + pendingCodVal;

    const reportOptions = [
        { id: 'all', label: 'Semua Laporan (Lengkap)', title: 'LAPORAN KEUANGAN KONSOLIDASI & RINGKASAN EKSEKUTIF USAHA', desc: 'P&L, Total Aset Perusahaan, Pengadaan Bahan, OPEX, Arus Kas & Pengesahan Resmi' },
        { id: 'pnl', label: 'Laporan Laba / Rugi (P&L)', title: 'LAPORAN LABA RUGI KOMPREHENSIF (STATEMENT OF PROFIT OR LOSS)', desc: 'Laporan Pendapatan, HPP, Beban Usaha & Laba Bersih Komprehensif' },
        { id: 'assets_valuation', label: 'Total Aset Perusahaan', title: 'LAPORAN NERACA KEKAYAAN & VALUASI TOTAL KESELURUHAN ASET PERUSAHAAN', desc: 'Rekapitulasi 7 Pos Aset Perusahaan & Rincian Valuasi Kaca, Aksesoris, Alat/Mesin, Peralatan Gudang & Scrap' },
        { id: 'purchases', label: 'Pengadaan Bahan Baku Kaca', title: 'LAPORAN REKAPITULASI PENGADAAN BAHAN BAKU KACA SUPPLIER', desc: 'Faktur PO Pengadaan Kaca Float, Asahimas, Mulia, Tempered & Laminated' },
        { id: 'accessories_tools', label: 'Aksesoris & Alat Kerja', title: 'LAPORAN PEMBELIAN AKSESORIS KACA & ALAT KERJA PABRIK', desc: 'Belanja Hardware Dekkson, Dorma, Sealant Silikon & Mata Bor Pabrik' },
        { id: 'opex', label: 'Realisasi Beban OPEX', title: 'LAPORAN REALISASI BIAYA OPERASIONAL (OPEX) VS PLAFON ANGGARAN', desc: 'Evaluasi Biaya Listrik PLN, BBM Solar Armada, Gaji Staf, Servis Mesin & Kantor' },
        { id: 'ledger', label: 'Buku Kas & Riwayat Mutasi', title: 'LAPORAN BUKU KAS & REKONSILIASI ARUS MUTASI KEUANGAN', desc: 'Rekapitulasi Arus Kas Masuk, Kas Keluar, Saldo Operasional & Ledger Transaksi' },
    ];

    const currentOption = reportOptions.find(o => o.id === selectedReportType) || reportOptions[0];

    const printDateFormatted = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    const printTimeFormatted = new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
    });

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[110] flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150 modal-backdrop">
            <style>{`
                @page {
                    size: A4 portrait;
                    margin: 12mm 15mm 12mm 15mm;
                }
                @media print {
                    html, body {
                        background: #ffffff !important;
                        color: #000000 !important;
                        height: auto !important;
                        overflow: visible !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    body * {
                        visibility: hidden !important;
                    }
                    #printable-corporate-financial-report, #printable-corporate-financial-report * {
                        visibility: visible !important;
                    }
                    #printable-corporate-financial-report {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                        border: none !important;
                        background: #ffffff !important;
                        color: #000000 !important;
                        overflow: visible !important;
                    }
                    .modal-backdrop, .modal-scroll-wrapper, .modal-card {
                        position: static !important;
                        overflow: visible !important;
                        height: auto !important;
                        max-height: none !important;
                        background: transparent !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .page-break {
                        page-break-after: always !important;
                        break-after: page !important;
                    }
                    table {
                        page-break-inside: auto !important;
                    }
                    tr {
                        page-break-inside: avoid !important;
                        page-break-after: auto !important;
                    }
                }
            `}</style>

            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden modal-card text-slate-800">
                {/* MODAL CONTROL HEADER (NO-PRINT) */}
                <div className="p-4 sm:p-5 border-b border-slate-200 bg-white flex flex-wrap justify-between items-center gap-3 no-print">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#1b68b0]/10 border border-[#1b68b0]/20 flex items-center justify-center text-[#1b68b0]">
                            <Printer className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-slate-800">
                                    Pratinjau Cetak Laporan Keuangan Resmi (PDF / Print)
                                </h3>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1b68b0]/10 text-[#1b68b0] border border-[#1b68b0]/20">
                                    Standar Korporat
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                                CV Cahya Karunia Jaya • Format Kop Surat Resmi, Tabel Akuntansi, & Lembar Otorisasi 3 Pihak
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition cursor-pointer"
                        >
                            Tutup
                        </button>
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="px-5 py-2.5 bg-[#1b68b0] hover:bg-[#15528c] text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Cetak / Simpan PDF</span>
                        </button>
                    </div>
                </div>

                {/* REPORT TYPE SELECTION STRIP (NO-PRINT) */}
                <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2 overflow-x-auto no-print">
                    <span className="text-xs text-slate-500 font-bold whitespace-nowrap mr-1 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>Pilihan Laporan:</span>
                    </span>
                    {reportOptions.map(opt => (
                        <button
                            key={opt.id}
                            type="button"
                            onClick={() => setSelectedReportType(opt.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                                selectedReportType === opt.id
                                    ? 'bg-[#1b68b0] text-white shadow-xs font-bold ring-2 ring-[#1b68b0]/20'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                        >
                            <span>{opt.label}</span>
                        </button>
                    ))}
                </div>

                {/* SCROLLABLE DOCUMENT PREVIEW WRAPPER */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100/70 flex justify-center items-start modal-scroll-wrapper">
                    {/* DOCUMENT CONTAINER (THIS WILL BE PRINTED) */}
                    <div
                        id="printable-corporate-financial-report"
                        className="w-full max-w-4xl bg-white text-slate-900 p-8 sm:p-12 shadow-2xl rounded-sm font-sans h-fit flex-shrink-0"
                    >
                        {/* 1. OFFICIAL CORPORATE LETTERHEAD (KOP SURAT RESMI STANDAR KORPORAT) */}
                        <div className="border-b-[3px] border-slate-900 pb-3 mb-1">
                            <div className="flex items-center justify-between gap-5">
                                {/* LOGO & BADGE SYP */}
                                <div className="w-20 h-20 rounded-xl border-2 border-slate-900 bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col items-center justify-center shrink-0 shadow-sm">
                                    <span className="font-sans font-black text-2xl tracking-widest text-cyan-400 leading-none">SYP</span>
                                    <span className="font-sans font-bold text-[9px] uppercase tracking-tighter text-slate-300 mt-1">GLASS</span>
                                    <span className="text-[7px] text-slate-400 font-mono tracking-widest mt-0.5">FABRICATION</span>
                                </div>

                                {/* COMPANY DETAILS */}
                                <div className="text-center flex-1">
                                    <h1 className="text-xl sm:text-2xl font-black tracking-wider uppercase text-slate-950 font-serif">
                                        CV CAHYA KARUNIA JAYA
                                    </h1>
                                    <h2 className="text-xs font-bold uppercase tracking-wide text-slate-800 mt-0.5">
                                        PABRIK PENGOLAHAN & DISTRIBUTOR KACA TEMPERED, BEVEL, CERMIN & HARDWARE
                                    </h2>
                                    <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                                        Alamat Kantor & Pabrik: Jl. Sunda No. 45, Sumur Bandung, Kota Bandung, Jawa Barat 40112<br />
                                        Telepon: (022) 420-9988 | Hotline Sales: 0812-3456-7890 | Email: finance@sypglass.co.id<br />
                                        <strong>NPWP:</strong> 01.384.921.4-428.000 | <strong>NIB:</strong> 9120003418291 | <strong>IUI:</strong> 503/029/IUI/DPMPTSP
                                    </p>
                                </div>

                                {/* OFFICIAL DOCUMENT BADGE */}
                                <div className="text-right font-sans text-[10px] text-slate-600 shrink-0 hidden sm:block">
                                    <div className="border border-slate-400 p-2 rounded bg-slate-50 text-center min-w-[130px]">
                                        <div className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">DOKUMEN RESMI</div>
                                        <div className="font-mono text-slate-700 text-[10px] mt-0.5">No: CKJ-FIN/2026/09</div>
                                        <div className="text-[9px] text-slate-500 mt-0.5 border-t border-slate-300 pt-0.5">SALINAN OTENTIK</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* SECONDARY THIN LINE UNDER LETTERHEAD (DOUBLE BORDER EFFECT) */}
                        <div className="border-b border-slate-800 mb-5"></div>

                        {/* 2. REPORT TITLE & METADATA BANNER */}
                        <div className="text-center mb-6">
                            <h2 className="text-base sm:text-lg font-black uppercase tracking-wide text-slate-950 font-serif">
                                {currentOption.title}
                            </h2>
                            <p className="text-xs text-slate-600 font-sans mt-0.5">
                                Periode Pembukuan: <strong>Tahun Anggaran 2026 (01 Januari s/d 30 September 2026 / YTD)</strong>
                            </p>
                        </div>

                        {/* DOCUMENT METADATA STRIP */}
                        <div className="mb-6 bg-slate-50 border border-slate-300 p-3 rounded text-xs flex flex-wrap justify-between items-center gap-2">
                            <div>
                                <span className="text-slate-500">Klasifikasi Dokumen: </span>
                                <strong className="text-slate-900 uppercase">Internal Korporat & Audit</strong>
                            </div>
                            <div>
                                <span className="text-slate-500">Mata Uang: </span>
                                <strong className="text-slate-900 font-mono">IDR (Rupiah Indonesia)</strong>
                            </div>
                            <div>
                                <span className="text-slate-500">Waktu Cetak: </span>
                                <span className="font-mono text-slate-800 font-semibold">{printDateFormatted}, {printTimeFormatted} WIB</span>
                            </div>
                        </div>

                        {/* 3. EXECUTIVE KPI METRIC CARDS (FOR 'all' OR 'pnl') */}
                        {(selectedReportType === 'all' || selectedReportType === 'pnl') && (
                            <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                                <div className="border border-slate-300 p-3 rounded bg-slate-50">
                                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Omzet Penjualan</div>
                                    <div className="font-extrabold font-mono text-slate-900 text-sm mt-1">Rp {totalRev.toLocaleString('id-ID')}</div>
                                    <div className="text-[9px] text-slate-500 mt-0.5">{metrics.totalOrders || ordersList.length || 0} Faktur SPO (Deal)</div>
                                </div>
                                <div className="border border-slate-300 p-3 rounded bg-slate-50">
                                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Uang Modal (Bahan & Aksesoris)</div>
                                    <div className="font-extrabold font-mono text-slate-900 text-sm mt-1">Rp {totalCogs.toLocaleString('id-ID')}</div>
                                    <div className="text-[9px] text-slate-500 mt-0.5">Laba Kotor: {grossMarginPct}%</div>
                                </div>
                                <div className="border border-slate-300 p-3 rounded bg-slate-50">
                                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Beban Operasional (OPEX)</div>
                                    <div className="font-extrabold font-mono text-slate-900 text-sm mt-1">Rp {totalOpex.toLocaleString('id-ID')}</div>
                                    <div className="text-[9px] text-slate-500 mt-0.5">Listrik, BBM, Gaji, Kantor</div>
                                </div>
                                <div className={`border p-3 rounded ${isProfitable ? 'bg-emerald-50 border-emerald-400 text-emerald-950' : 'bg-rose-50 border-rose-400 text-rose-950'}`}>
                                    <div className="text-[10px] uppercase font-black tracking-wider">
                                        {isProfitable ? 'Laba Bersih Usaha (Net)' : 'Defisit / Rugi Bersih (Net)'}
                                    </div>
                                    <div className="font-black font-mono text-sm mt-1">
                                        Rp {netProfitVal.toLocaleString('id-ID')}
                                    </div>
                                    <div className="text-[9px] font-bold mt-0.5">
                                        Net Margin: {netMarginPct}%
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SECTION 1: LAPORAN LABA RUGI KOMPREHENSIF (INCOME STATEMENT) */}
                        {(selectedReportType === 'all' || selectedReportType === 'pnl') && (
                            <div className="mb-8">
                                <div className="border-b-2 border-slate-900 pb-1 mb-3 flex justify-between items-baseline">
                                    <h3 className="font-black text-sm uppercase text-slate-950 tracking-wide font-serif">
                                        I. Laporan Laba Rugi Komprehensif (Income Statement)
                                    </h3>
                                    <span className="text-[11px] text-slate-600 font-mono">Standar SAK ETAP / Audited</span>
                                </div>

                                <table className="w-full text-xs font-mono border border-slate-400 border-collapse mb-4">
                                    <tbody>
                                        {/* 1. PENDAPATAN */}
                                        <tr className="bg-slate-100 font-black text-slate-900 border-b border-slate-300">
                                            <td className="p-2 pl-3">1. PENDAPATAN USAHA (REVENUE)</td>
                                            <td className="p-2 pr-3 text-right">NOMINAL (RP)</td>
                                        </tr>
                                        <tr className="border-b border-slate-200">
                                            <td className="p-1.5 pl-6 text-slate-700">• Penjualan Kaca & Jasa Proses Pabrik (Faktur Pesanan SPO)</td>
                                            <td className="p-1.5 pr-3 text-right text-slate-900 font-semibold">Rp {spoRev.toLocaleString('id-ID')}</td>
                                        </tr>
                                        <tr className="border-b border-slate-200">
                                            <td className="p-1.5 pl-6 text-slate-700">• Pendapatan Lain-lain (Non-SPO / Scrap Kaca Sisa Rak)</td>
                                            <td className="p-1.5 pr-3 text-right text-slate-900 font-semibold">Rp {otherRev.toLocaleString('id-ID')}</td>
                                        </tr>
                                        <tr className="bg-slate-50 font-bold text-slate-950 border-b-2 border-slate-400">
                                            <td className="p-2 pl-3">TOTAL PENDAPATAN BERSIH (NET REVENUE)</td>
                                            <td className="p-2 pr-3 text-right text-slate-950">Rp {totalRev.toLocaleString('id-ID')}</td>
                                        </tr>

                                        {/* 2. UANG MODAL */}
                                        <tr className="bg-slate-100 font-black text-slate-900 border-b border-slate-300">
                                            <td className="p-2 pl-3 pt-3">2. UANG MODAL (PEMBELIAN BAHAN & AKSESORIS)</td>
                                            <td className="p-2 pr-3 pt-3 text-right"></td>
                                        </tr>
                                        <tr className="border-b border-slate-200">
                                            <td className="p-1.5 pl-6 text-slate-700">• Pembelian Lembaran Bahan Baku Kaca Supplier (Asahimas, Mulia, dll)</td>
                                            <td className="p-1.5 pr-3 text-right text-slate-900 font-semibold">Rp {bahanKacaSum.toLocaleString('id-ID')}</td>
                                        </tr>
                                        <tr className="border-b border-slate-200">
                                            <td className="p-1.5 pl-6 text-slate-700">• Pembelian Aksesoris Kaca Konsumen (Dekkson, Dorma, Sealant)</td>
                                            <td className="p-1.5 pr-3 text-right text-slate-900 font-semibold">Rp {aksesorisSum.toLocaleString('id-ID')}</td>
                                        </tr>
                                        <tr className="bg-slate-50 font-bold text-slate-950 border-b-2 border-slate-400">
                                            <td className="p-2 pl-3">TOTAL UANG MODAL PRODUKSI</td>
                                            <td className="p-2 pr-3 text-right text-slate-950">Rp {totalCogs.toLocaleString('id-ID')}</td>
                                        </tr>

                                        {/* LABA KOTOR */}
                                        <tr className="bg-slate-200/90 font-black text-slate-950 border-b-2 border-slate-800 text-xs">
                                            <td className="p-2.5 pl-3">LABA KOTOR USAHA (GROSS PROFIT)</td>
                                            <td className="p-2.5 pr-3 text-right font-black">
                                                Rp {grossProfitVal.toLocaleString('id-ID')}{' '}
                                                <span className="text-[10px] font-sans font-bold bg-white px-1.5 py-0.5 rounded border border-slate-300 ml-1">
                                                    {grossMarginPct}% MARGIN
                                                </span>
                                            </td>
                                        </tr>

                                        {/* 3. OPEX */}
                                        <tr className="bg-slate-100 font-black text-slate-900 border-b border-slate-300">
                                            <td className="p-2 pl-3 pt-3">3. BEBAN OPERASIONAL PABRIK & TOKO (OPEX)</td>
                                            <td className="p-2 pr-3 pt-3 text-right"></td>
                                        </tr>
                                        <tr className="border-b border-slate-200">
                                            <td className="p-1.5 pl-6 text-slate-700">• Beban Listrik & Daya Mesin Pabrik (PLN Industri 33 kVA)</td>
                                            <td className="p-1.5 pr-3 text-right text-slate-900 font-semibold">Rp {listrikSum.toLocaleString('id-ID')}</td>
                                        </tr>
                                        <tr className="border-b border-slate-200">
                                            <td className="p-1.5 pl-6 text-slate-700">• Beban BBM Solar & Logistik Armada Truk/L300 (Reimburse Supir)</td>
                                            <td className="p-1.5 pr-3 text-right text-slate-900 font-semibold">Rp {bbmSum.toLocaleString('id-ID')}</td>
                                        </tr>
                                        <tr className="border-b border-slate-200">
                                            <td className="p-1.5 pl-6 text-slate-700">• Beban Gaji Staf Toko, Upah Operator Pabrik & Uang Lembur</td>
                                            <td className="p-1.5 pr-3 text-right text-slate-900 font-semibold">Rp {gajiSum.toLocaleString('id-ID')}</td>
                                        </tr>
                                        <tr className="border-b border-slate-200">
                                            <td className="p-1.5 pl-6 text-slate-700">• Pemeliharaan Mesin Gosok/Bevel & Servis Rutin Armada</td>
                                            <td className="p-1.5 pr-3 text-right text-slate-900 font-semibold">Rp {servisSum.toLocaleString('id-ID')}</td>
                                        </tr>
                                        <tr className="border-b border-slate-200">
                                            <td className="p-1.5 pl-6 text-slate-700">• Pengadaan Alat Penunjang & Perlengkapan Pabrik</td>
                                            <td className="p-1.5 pr-3 text-right text-slate-900 font-semibold">Rp {alatSum.toLocaleString('id-ID')}</td>
                                        </tr>
                                        <tr className="border-b border-slate-200">
                                            <td className="p-1.5 pl-6 text-slate-700">• Operasional Kantor Toko, Internet Wifi, Pajak & ATK</td>
                                            <td className="p-1.5 pr-3 text-right text-slate-900 font-semibold">Rp {kantorSum.toLocaleString('id-ID')}</td>
                                        </tr>
                                        {otherOpexSum > 0 && (
                                            <tr className="border-b border-slate-200">
                                                <td className="p-1.5 pl-6 text-slate-700">• Beban Operasional Lainnya & Penyesuaian Kas</td>
                                                <td className="p-1.5 pr-3 text-right text-slate-900 font-semibold">Rp {otherOpexSum.toLocaleString('id-ID')}</td>
                                            </tr>
                                        )}
                                        <tr className="bg-slate-50 font-bold text-slate-950 border-b-2 border-slate-400">
                                            <td className="p-2 pl-3">TOTAL BEBAN OPERASIONAL (TOTAL OPEX)</td>
                                            <td className="p-2 pr-3 text-right text-slate-950">Rp {totalOpex.toLocaleString('id-ID')}</td>
                                        </tr>

                                        {/* LABA / RUGI BERSIH (NET OPERATING PROFIT / LOSS) */}
                                        <tr className={`border-b-4 border-double border-slate-950 font-black text-xs ${isProfitable ? 'bg-slate-900 text-white' : 'bg-rose-100 text-rose-950'}`}>
                                            <td className="p-3 pl-3 text-sm">
                                                {isProfitable ? 'LABA BERSIH USAHA (NET OPERATING PROFIT)' : 'DEFISIT / RUGI BERSIH USAHA (NET OPERATING LOSS)'}
                                            </td>
                                            <td className="p-3 pr-3 text-right text-sm font-mono font-black">
                                                Rp {netProfitVal.toLocaleString('id-ID')}{' '}
                                                <span className={`text-[11px] font-sans font-bold px-2 py-0.5 rounded ml-1 ${isProfitable ? 'bg-white/20 text-white' : 'bg-rose-200 text-rose-950'}`}>
                                                    {netMarginPct}% NET
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* FINANCIAL RATIOS HIGHLIGHT */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-300 rounded text-xs">
                                    <div>
                                        <span className="text-slate-500 font-bold">Gross Profit Margin (GPM): </span>
                                        <span className="font-mono font-black text-slate-900">{grossMarginPct}%</span>
                                        <div className="text-[10px] text-slate-500">Benchmark Sehat: &gt; 30.0%</div>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 font-bold">Operating Expense Ratio (OER): </span>
                                        <span className="font-mono font-black text-slate-900">{totalRev > 0 ? ((totalOpex / totalRev) * 100).toFixed(1) : '0.0'}%</span>
                                        <div className="text-[10px] text-slate-500">Batas Aman Anggaran: &lt; 35.0%</div>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 font-bold">Net Profit Margin (NPM): </span>
                                        <span className={`font-mono font-black ${isProfitable ? 'text-emerald-700' : 'text-rose-700'}`}>{netMarginPct}%</span>
                                        <div className="text-[10px] text-slate-500">{isProfitable ? 'Kondisi Finansial Prima' : 'Evaluasi Efisiensi Beban'}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SECTION ASET PERUSAHAAN: TOTAL KESELURUHAN ASET PERUSAHAAN & RINCIAN DETAILNYA */}
                        {(selectedReportType === 'all' || selectedReportType === 'assets_valuation') && (
                            <div className="mb-8 space-y-5">
                                <div className="border-b-2 border-slate-900 pb-1 mb-3 flex justify-between items-baseline">
                                    <h3 className="font-black text-sm uppercase text-slate-950 tracking-wide font-serif">
                                        {selectedReportType === 'all' ? 'II. ' : ''}Rekapitulasi Total Keseluruhan Aset Perusahaan & Valuasi Inventaris
                                    </h3>
                                    <span className="text-[11px] text-slate-600 font-mono">Valuasi Aset Likuid, Tetap & Persediaan</span>
                                </div>

                                {/* 3 KARTU RINGKASAN TOTAL ASET CETAK */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                                    <div className="border-2 border-slate-900 p-3 rounded bg-slate-100">
                                        <div className="text-[10px] font-sans uppercase font-black text-slate-700">Grand Total Seluruh Aset Perusahaan</div>
                                        <div className="font-black text-slate-950 text-base mt-1">Rp {Number(grandTotalCompanyAssets).toLocaleString('id-ID')}</div>
                                        <div className="text-[9px] font-sans text-slate-600 mt-0.5">Total Kekayaan (Fisik + Kas + Piutang)</div>
                                    </div>
                                    <div className="border border-slate-300 p-3 rounded bg-slate-50">
                                        <div className="text-[10px] font-sans uppercase font-bold text-slate-500">Total Aset Fisik (Stok & Mesin)</div>
                                        <div className="font-black text-slate-900 text-sm mt-1">Rp {Number(totalPhysicalInventoryValue).toLocaleString('id-ID')}</div>
                                        <div className="text-[9px] font-sans text-slate-500 mt-0.5">Kaca, Aksesoris, Alat, Gudang & Scrap</div>
                                    </div>
                                    <div className="border border-slate-300 p-3 rounded bg-slate-50">
                                        <div className="text-[10px] font-sans uppercase font-bold text-slate-500">Total Aset Kas Likuid & Piutang</div>
                                        <div className="font-black text-slate-900 text-sm mt-1">Rp {Number(netCashBalance + pendingCodVal).toLocaleString('id-ID')}</div>
                                        <div className="text-[9px] font-sans text-slate-500 mt-0.5">Kas Bersih + Piutang COD Surat Jalan</div>
                                    </div>
                                </div>

                                {/* TABEL 7 POS KOMPOSISI ASET PERUSAHAAN */}
                                <table className="w-full text-xs font-mono border border-slate-400 border-collapse">
                                    <thead>
                                        <tr className="bg-slate-100 text-slate-900 font-black border-b-2 border-slate-400 text-left">
                                            <th className="p-2 text-center">No</th>
                                            <th className="p-2">Kelompok & Kategori Aset Perusahaan</th>
                                            <th className="p-2">Klasifikasi</th>
                                            <th className="p-2">Volume / Keterangan Fisik</th>
                                            <th className="p-2 text-center">Porsi (%)</th>
                                            <th className="p-2 text-right">Nilai Valuasi (Rp)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-300">
                                        {[
                                            {
                                                no: 1,
                                                name: 'Aset Persediaan Bahan Baku Kaca Lembaran',
                                                type: 'Aset Lancar (Inventory)',
                                                vol: `${(sheetGlasses || []).reduce((s, g) => s + (Number(g.qty) || 0), 0)} Lembar (${sheetGlasses?.length || 0} Jenis)`,
                                                val: totalGlassAssetValue,
                                            },
                                            {
                                                no: 2,
                                                name: 'Aset Persediaan Aksesoris & Fitting Kaca',
                                                type: 'Aset Lancar (Inventory)',
                                                vol: `${(accessoriesList || []).reduce((s, a) => s + (Number(a.qty) || 0), 0)} Unit (${accessoriesList?.length || 0} Jenis)`,
                                                val: totalAccAssetValue,
                                            },
                                            {
                                                no: 3,
                                                name: 'Aset Tetap Alat Kerja & Mesin Produksi Pabrik',
                                                type: 'Aset Tetap (Fixed Assets)',
                                                vol: `${(toolsList || []).reduce((s, t) => s + (Number(t.total_qty) || 0), 0)} Unit (${toolsList?.length || 0} Jenis)`,
                                                val: totalToolsAssetValue,
                                            },
                                            {
                                                no: 4,
                                                name: 'Aset Peralatan, Sparepart & Consumables Gudang',
                                                type: 'Aset Operasional Gudang',
                                                vol: `${(warehouseSuppliesList || []).reduce((s, sup) => s + (Number(sup.qty ?? sup.stock_qty) || 0), 0)} Unit (${warehouseSuppliesList?.length || 0} Jenis)`,
                                                val: totalSuppliesAssetValue,
                                            },
                                            {
                                                no: 5,
                                                name: 'Aset Material Kaca Sisa Rak (Scrap Layak Pakai)',
                                                type: 'Aset Material Efisiensi',
                                                vol: `${scrapGlasses?.length || 0} Potongan Kaca Sisa Produksi`,
                                                val: totalScrapAssetValue,
                                            },
                                            {
                                                no: 6,
                                                name: 'Aset Likuid Saldo Kas Bersih & Bank Perusahaan',
                                                type: 'Aset Likuid (Cash)',
                                                vol: 'Saldo Kas Operasional Riil Tersedia',
                                                val: netCashBalance,
                                            },
                                            {
                                                no: 7,
                                                name: 'Aset Piutang Penjualan COD Surat Jalan Merah',
                                                type: 'Aset Piutang Usaha',
                                                vol: 'Tagihan SPO Deal Proses Pelunasan',
                                                val: pendingCodVal,
                                            },
                                        ].map(row => {
                                            const pct = grandTotalCompanyAssets > 0 ? ((row.val / grandTotalCompanyAssets) * 100).toFixed(1) : '0.0';
                                            return (
                                                <tr key={row.no}>
                                                    <td className="p-2 text-center font-bold text-slate-700">{row.no}</td>
                                                    <td className="p-2 font-sans font-bold text-slate-900">{row.name}</td>
                                                    <td className="p-2 font-sans text-slate-700">{row.type}</td>
                                                    <td className="p-2 text-slate-700">{row.vol}</td>
                                                    <td className="p-2 text-center font-bold">{pct}%</td>
                                                    <td className="p-2 text-right font-black text-slate-900 whitespace-nowrap">
                                                        Rp {Number(row.val || 0).toLocaleString('id-ID')}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        <tr className="bg-slate-200 font-black text-slate-950 border-t-2 border-slate-900">
                                            <td colSpan="4" className="p-2.5 text-left uppercase">
                                                GRAND TOTAL KESELURUHAN ASET PERUSAHAAN
                                            </td>
                                            <td className="p-2.5 text-center">100.0%</td>
                                            <td className="p-2.5 text-right text-sm whitespace-nowrap">
                                                Rp {Number(grandTotalCompanyAssets).toLocaleString('id-ID')}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* RINCIAN DETAIL SETIAP KATEGORI ASET FISIK */}
                                {selectedReportType === 'assets_valuation' && (
                                    <div className="space-y-5 pt-2">
                                        {/* 1. Rincian Kaca Lembaran */}
                                        <div>
                                            <h4 className="font-bold text-xs uppercase text-slate-900 border-b border-slate-400 pb-1 mb-2 flex justify-between">
                                                <span>1. Rincian Aset Persediaan Bahan Baku Kaca Lembaran</span>
                                                <span className="font-mono">Subtotal: Rp {Number(totalGlassAssetValue).toLocaleString('id-ID')}</span>
                                            </h4>
                                            <table className="w-full text-[11px] font-mono border border-slate-300 border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300 text-left">
                                                        <th className="p-1.5">Kode</th>
                                                        <th className="p-1.5">Nama & Jenis Kaca</th>
                                                        <th className="p-1.5">Ukuran</th>
                                                        <th className="p-1.5 text-center">Stok</th>
                                                        <th className="p-1.5 text-right">Harga Beli / Lbr</th>
                                                        <th className="p-1.5 text-right">Total Nilai Aset</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200">
                                                    {(sheetGlasses || []).map((g, idx) => (
                                                        <tr key={g.id || idx}>
                                                            <td className="p-1.5 font-bold text-slate-900">{g.item_code}</td>
                                                            <td className="p-1.5 font-sans font-semibold text-slate-900">{g.name}</td>
                                                            <td className="p-1.5 text-slate-700">{g.size || `${g.length_cm}x${g.width_cm} cm`}</td>
                                                            <td className="p-1.5 text-center font-bold">{g.qty} {g.unit || 'Lembar'}</td>
                                                            <td className="p-1.5 text-right">Rp {Number(g.buy_price || 0).toLocaleString('id-ID')}</td>
                                                            <td className="p-1.5 text-right font-bold text-slate-900">
                                                                Rp {((Number(g.qty) || 0) * (Number(g.buy_price) || 0)).toLocaleString('id-ID')}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* 2. Rincian Aksesoris Kaca */}
                                        <div>
                                            <h4 className="font-bold text-xs uppercase text-slate-900 border-b border-slate-400 pb-1 mb-2 flex justify-between">
                                                <span>2. Rincian Aset Persediaan Aksesoris & Fitting Kaca</span>
                                                <span className="font-mono">Subtotal: Rp {Number(totalAccAssetValue).toLocaleString('id-ID')}</span>
                                            </h4>
                                            <table className="w-full text-[11px] font-mono border border-slate-300 border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300 text-left">
                                                        <th className="p-1.5">Kode</th>
                                                        <th className="p-1.5">Nama Aksesoris</th>
                                                        <th className="p-1.5 text-center">Stok</th>
                                                        <th className="p-1.5 text-right">Harga Beli Satuan</th>
                                                        <th className="p-1.5 text-right">Total Nilai Aset</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200">
                                                    {(accessoriesList || []).map((a, idx) => (
                                                        <tr key={a.id || idx}>
                                                            <td className="p-1.5 font-bold text-slate-900">{a.acc_code}</td>
                                                            <td className="p-1.5 font-sans font-semibold text-slate-900">{a.name}</td>
                                                            <td className="p-1.5 text-center font-bold">{a.qty} {a.unit || 'Pcs'}</td>
                                                            <td className="p-1.5 text-right">Rp {Number(a.buy_price || 0).toLocaleString('id-ID')}</td>
                                                            <td className="p-1.5 text-right font-bold text-slate-900">
                                                                Rp {((Number(a.qty) || 0) * (Number(a.buy_price) || 0)).toLocaleString('id-ID')}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* 3. Rincian Alat & Mesin Produksi */}
                                        <div>
                                            <h4 className="font-bold text-xs uppercase text-slate-900 border-b border-slate-400 pb-1 mb-2 flex justify-between">
                                                <span>3. Rincian Aset Tetap Alat Kerja & Mesin Produksi</span>
                                                <span className="font-mono">Subtotal: Rp {Number(totalToolsAssetValue).toLocaleString('id-ID')}</span>
                                            </h4>
                                            <table className="w-full text-[11px] font-mono border border-slate-300 border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300 text-left">
                                                        <th className="p-1.5">Kode</th>
                                                        <th className="p-1.5">Nama Alat / Mesin</th>
                                                        <th className="p-1.5">Kategori</th>
                                                        <th className="p-1.5 text-center">Unit</th>
                                                        <th className="p-1.5 text-center">Kondisi</th>
                                                        <th className="p-1.5 text-right">Harga Satuan</th>
                                                        <th className="p-1.5 text-right">Total Nilai Aset</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200">
                                                    {(toolsList || []).map((t, idx) => {
                                                        const uPrice = getToolUnitPrice(t);
                                                        return (
                                                            <tr key={t.id || idx}>
                                                                <td className="p-1.5 font-bold text-slate-900">{t.tool_code}</td>
                                                                <td className="p-1.5 font-sans font-semibold text-slate-900">{t.name}</td>
                                                                <td className="p-1.5 font-sans text-slate-700">{t.category}</td>
                                                                <td className="p-1.5 text-center font-bold">{t.total_qty} {t.unit || 'Unit'}</td>
                                                                <td className="p-1.5 text-center">{t.condition}</td>
                                                                <td className="p-1.5 text-right">Rp {Number(uPrice).toLocaleString('id-ID')}</td>
                                                                <td className="p-1.5 text-right font-bold text-slate-900">
                                                                    Rp {((Number(t.total_qty) || 0) * uPrice).toLocaleString('id-ID')}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* 4. Rincian Peralatan Gudang */}
                                        <div>
                                            <h4 className="font-bold text-xs uppercase text-slate-900 border-b border-slate-400 pb-1 mb-2 flex justify-between">
                                                <span>4. Rincian Aset Peralatan, Sparepart & Consumables Gudang</span>
                                                <span className="font-mono">Subtotal: Rp {Number(totalSuppliesAssetValue).toLocaleString('id-ID')}</span>
                                            </h4>
                                            <table className="w-full text-[11px] font-mono border border-slate-300 border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300 text-left">
                                                        <th className="p-1.5">Kode</th>
                                                        <th className="p-1.5">Nama Peralatan Gudang</th>
                                                        <th className="p-1.5">Kategori</th>
                                                        <th className="p-1.5 text-center">Stok</th>
                                                        <th className="p-1.5 text-right">Harga Satuan</th>
                                                        <th className="p-1.5 text-right">Total Nilai Aset</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200">
                                                    {(warehouseSuppliesList || []).map((s, idx) => {
                                                        const qty = Number(s.qty ?? s.stock_qty) || 0;
                                                        const uPrice = getSupplyUnitPrice(s);
                                                        return (
                                                            <tr key={s.id || idx}>
                                                                <td className="p-1.5 font-bold text-slate-900">{s.item_code}</td>
                                                                <td className="p-1.5 font-sans font-semibold text-slate-900">{s.name}</td>
                                                                <td className="p-1.5 font-sans text-slate-700">{s.category}</td>
                                                                <td className="p-1.5 text-center font-bold">{qty} {s.unit || 'Pcs'}</td>
                                                                <td className="p-1.5 text-right">Rp {Number(uPrice).toLocaleString('id-ID')}</td>
                                                                <td className="p-1.5 text-right font-bold text-slate-900">
                                                                    Rp {(qty * uPrice).toLocaleString('id-ID')}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* SECTION 2: REKAPITULASI PENGADAAN BAHAN BAKU KACA */}
                        {(selectedReportType === 'all' || selectedReportType === 'purchases') && (
                            <div className="mb-8">
                                <div className="border-b-2 border-slate-900 pb-1 mb-3 flex justify-between items-baseline">
                                    <h3 className="font-black text-sm uppercase text-slate-950 tracking-wide font-serif">
                                        {selectedReportType === 'all' ? 'II. ' : ''}Rekapitulasi Pengadaan Bahan Baku Kaca Supplier
                                    </h3>
                                    <span className="text-[11px] text-slate-600 font-mono">{bahanKacaTrx.length} Transaksi Faktur PO</span>
                                </div>

                                <table className="w-full text-xs font-mono border border-slate-400 border-collapse mb-2">
                                    <thead>
                                        <tr className="bg-slate-100 text-slate-900 font-black border-b-2 border-slate-400 text-left">
                                            <th className="p-2">No. PO</th>
                                            <th className="p-2">Tanggal</th>
                                            <th className="p-2">Supplier Rekanan</th>
                                            <th className="p-2">Deskripsi Kaca Lembaran</th>
                                            <th className="p-2 text-center">Status</th>
                                            <th className="p-2 text-right">Nominal (Rp)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-300">
                                        {bahanKacaTrx.map((trx, idx) => (
                                            <tr key={trx.id || idx} className="hover:bg-slate-50">
                                                <td className="p-2 font-black text-slate-900">{trx.transaction_code}</td>
                                                <td className="p-2 text-slate-700 whitespace-nowrap">{trx.transaction_date}</td>
                                                <td className="p-2 font-sans font-bold text-slate-900">{trx.supplier_name || '-'}</td>
                                                <td className="p-2 font-sans text-slate-800">{trx.title}</td>
                                                <td className="p-2 text-center">
                                                    <span className="px-1.5 py-0.5 text-[10px] bg-slate-100 border border-slate-300 rounded font-bold text-slate-800">
                                                        {trx.payment_status}
                                                    </span>
                                                </td>
                                                <td className="p-2 text-right font-black text-slate-900 whitespace-nowrap">
                                                    Rp {Number(trx.amount || 0).toLocaleString('id-ID')}
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className="bg-slate-100 font-black text-slate-950 border-t-2 border-slate-900">
                                            <td colSpan="5" className="p-2 text-right uppercase">TOTAL PENGADAAN BAHAN BAKU KACA</td>
                                            <td className="p-2 text-right font-black whitespace-nowrap">
                                                Rp {bahanKacaSum.toLocaleString('id-ID')}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* SECTION 3: REKAPITULASI AKSESORIS & ALAT KERJA */}
                        {(selectedReportType === 'all' || selectedReportType === 'accessories_tools') && (
                            <div className="mb-8">
                                <div className="border-b-2 border-slate-900 pb-1 mb-3 flex justify-between items-baseline">
                                    <h3 className="font-black text-sm uppercase text-slate-950 tracking-wide font-serif">
                                        {selectedReportType === 'all' ? 'III. ' : ''}Rekapitulasi Pembelian Aksesoris Kaca & Alat Kerja Pabrik
                                    </h3>
                                    <span className="text-[11px] text-slate-600 font-mono">{aksesorisTrx.length + alatTrx.length} Transaksi Belanja</span>
                                </div>

                                <table className="w-full text-xs font-mono border border-slate-400 border-collapse mb-2">
                                    <thead>
                                        <tr className="bg-slate-100 text-slate-900 font-black border-b-2 border-slate-400 text-left">
                                            <th className="p-2">No. PO</th>
                                            <th className="p-2">Kategori</th>
                                            <th className="p-2">Distributor / Vendor</th>
                                            <th className="p-2">Rincian Item Aksesoris / Alat</th>
                                            <th className="p-2 text-center">Status</th>
                                            <th className="p-2 text-right">Nominal (Rp)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-300">
                                        {[...aksesorisTrx, ...alatTrx].map((trx, idx) => (
                                            <tr key={trx.id || idx} className="hover:bg-slate-50">
                                                <td className="p-2 font-black text-slate-900">{trx.transaction_code}</td>
                                                <td className="p-2 text-slate-700 whitespace-nowrap">
                                                    {trx.type === 'pembelian_aksesoris' ? 'Aksesoris Kaca' : 'Alat Penunjang'}
                                                </td>
                                                <td className="p-2 font-sans font-bold text-slate-900">{trx.supplier_name || '-'}</td>
                                                <td className="p-2 font-sans text-slate-800">{trx.title}</td>
                                                <td className="p-2 text-center">
                                                    <span className="px-1.5 py-0.5 text-[10px] bg-slate-100 border border-slate-300 rounded font-bold text-slate-800">
                                                        {trx.payment_status}
                                                    </span>
                                                </td>
                                                <td className="p-2 text-right font-black text-slate-900 whitespace-nowrap">
                                                    Rp {Number(trx.amount || 0).toLocaleString('id-ID')}
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className="bg-slate-100 font-black text-slate-950 border-t-2 border-slate-900">
                                            <td colSpan="5" className="p-2 text-right uppercase">TOTAL AKSESORIS & ALAT PENUNJANG PABRIK</td>
                                            <td className="p-2 text-right font-black whitespace-nowrap">
                                                Rp {(aksesorisSum + alatSum).toLocaleString('id-ID')}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* SECTION 4: REALISASI OPEX VS ANGGARAN */}
                        {(selectedReportType === 'all' || selectedReportType === 'opex') && (
                            <div className="mb-8">
                                <div className="border-b-2 border-slate-900 pb-1 mb-3 flex justify-between items-baseline">
                                    <h3 className="font-black text-sm uppercase text-slate-950 tracking-wide font-serif">
                                        {selectedReportType === 'all' ? 'IV. ' : ''}Laporan Realisasi Biaya Operasional (OPEX) vs Plafon Anggaran
                                    </h3>
                                    <span className="text-[11px] text-slate-600 font-mono">Plafon Anggaran & Utilisasi</span>
                                </div>

                                <table className="w-full text-xs font-mono border border-slate-400 border-collapse mb-4">
                                    <thead>
                                        <tr className="bg-slate-100 text-slate-900 font-black border-b-2 border-slate-400 text-left">
                                            <th className="p-2">Pos Biaya Operasional</th>
                                            <th className="p-2 text-right">Plafon Anggaran</th>
                                            <th className="p-2 text-right">Realisasi Beban</th>
                                            <th className="p-2 text-center">% Utilisasi</th>
                                            <th className="p-2 text-center">% Porsi OPEX</th>
                                            <th className="p-2 text-center">Status Anggaran</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-300">
                                        {[
                                            { name: 'Listrik & Daya Mesin Pabrik (PLN 33 kVA)', budget: 15000000, actual: listrikSum },
                                            { name: 'BBM Solar & Logistik Armada Truk/L300', budget: 6000000, actual: bbmSum },
                                            { name: 'Gaji Staf Toko, Upah Operator & Lembur', budget: 22000000, actual: gajiSum },
                                            { name: 'Pemeliharaan Mesin Gosok/Bevel & Servis Armada', budget: 4000000, actual: servisSum },
                                            { name: 'Pengadaan Alat Penunjang & Perlengkapan Pabrik', budget: 8000000, actual: alatSum },
                                            { name: 'Operasional Kantor Toko, Wifi, Pajak & ATK', budget: 2500000, actual: kantorSum },
                                            ...(otherOpexSum > 0 ? [{ name: 'Beban Operasional Lainnya & Penyesuaian Kas', budget: otherOpexSum, actual: otherOpexSum }] : [])
                                        ].map((pos, idx) => {
                                            const utilPct = pos.budget > 0 ? Math.round((pos.actual / pos.budget) * 100) : 0;
                                            const sharePct = totalOpex > 0 ? ((pos.actual / totalOpex) * 100).toFixed(1) : '0.0';
                                            const isSafe = utilPct <= 100;

                                            return (
                                                <tr key={idx} className="hover:bg-slate-50">
                                                    <td className="p-2 font-bold text-slate-900">• {pos.name}</td>
                                                    <td className="p-2 text-right text-slate-700">Rp {pos.budget.toLocaleString('id-ID')}</td>
                                                    <td className="p-2 text-right font-black text-slate-900">Rp {pos.actual.toLocaleString('id-ID')}</td>
                                                    <td className="p-2 text-center font-bold">{utilPct}%</td>
                                                    <td className="p-2 text-center">{sharePct}%</td>
                                                    <td className="p-2 text-center">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isSafe ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-rose-100 text-rose-900 border border-rose-300'}`}>
                                                            {isSafe ? 'TERKENDALI (AMAN)' : 'MELEBIHI PLAFON'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        <tr className="bg-slate-100 font-black text-slate-950 border-t-2 border-slate-900">
                                            <td className="p-2 text-left uppercase">TOTAL BEBAN OPERASIONAL (OPEX)</td>
                                            <td className="p-2 text-right">Rp {(57500000 + (otherOpexSum > 0 ? otherOpexSum : 0)).toLocaleString('id-ID')}</td>
                                            <td className="p-2 text-right font-black">Rp {totalOpex.toLocaleString('id-ID')}</td>
                                            <td className="p-2 text-center font-bold">{Math.round((totalOpex / (57500000 + (otherOpexSum > 0 ? otherOpexSum : 0))) * 100)}%</td>
                                            <td className="p-2 text-center">100.0%</td>
                                            <td className="p-2 text-center text-emerald-900 font-bold">
                                                {totalOpex <= (57500000 + (otherOpexSum > 0 ? otherOpexSum : 0)) ? 'AMAN & SEHAT' : 'PERHATIAN'}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* RINCIAN TRANSAKSI BEBAN OPERASIONAL */}
                                {selectedReportType === 'opex' && (
                                    <div className="mt-6">
                                        <h4 className="font-bold text-xs uppercase text-slate-800 border-b border-slate-300 pb-1 mb-2">
                                            Daftar Transaksi Beban Operasional Pabrik & Toko
                                        </h4>
                                        <table className="w-full text-xs font-mono border border-slate-300 border-collapse mb-2">
                                            <thead>
                                                <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300 text-left">
                                                    <th className="p-2">No. Bukti</th>
                                                    <th className="p-2">Tanggal</th>
                                                    <th className="p-2">Kategori</th>
                                                    <th className="p-2">Deskripsi Biaya</th>
                                                    <th className="p-2">Penerima / Vendor</th>
                                                    <th className="p-2 text-right">Nominal (Rp)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200">
                                                {opexTrx.map((trx, idx) => (
                                                    <tr key={trx.id || idx}>
                                                        <td className="p-1.5 font-bold text-slate-900">{trx.transaction_code}</td>
                                                        <td className="p-1.5 text-slate-700 whitespace-nowrap">{trx.transaction_date}</td>
                                                        <td className="p-1.5 text-slate-800">{trx.category}</td>
                                                        <td className="p-1.5 text-slate-700">{trx.title}</td>
                                                        <td className="p-1.5 text-slate-900">{trx.supplier_name || '-'}</td>
                                                        <td className="p-1.5 text-right font-bold text-slate-900 whitespace-nowrap">
                                                            Rp {Number(trx.amount || 0).toLocaleString('id-ID')}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* SECTION 5: BUKU KAS & REKONSILIASI ARUS KAS */}
                        {(selectedReportType === 'all' || selectedReportType === 'ledger') && (
                            <div className="mb-8">
                                <div className="border-b-2 border-slate-900 pb-1 mb-3 flex justify-between items-baseline">
                                    <h3 className="font-black text-sm uppercase text-slate-950 tracking-wide font-serif">
                                        {selectedReportType === 'all' ? 'V. ' : ''}Posisi Arus Kas Riil & Rekonsiliasi Buku Besar
                                    </h3>
                                    <span className="text-[11px] text-slate-600 font-mono">Arus Kas Tunai & Bank</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 text-xs font-mono">
                                    <div className="border border-slate-300 p-3 rounded bg-slate-50">
                                        <div className="text-slate-500 font-sans text-[10px] uppercase font-bold">Total Kas Masuk Terkumpul</div>
                                        <div className="font-black text-slate-900 text-sm mt-1">Rp {paidRev.toLocaleString('id-ID')}</div>
                                        <div className="text-[9px] text-slate-500 mt-0.5">Penjualan Lunas & DP Klien</div>
                                    </div>
                                    <div className="border border-slate-300 p-3 rounded bg-slate-50">
                                        <div className="text-slate-500 font-sans text-[10px] uppercase font-bold">Total Kas Keluar Belanja</div>
                                        <div className="font-black text-slate-900 text-sm mt-1">Rp {grandTotalExpenses.toLocaleString('id-ID')}</div>
                                        <div className="text-[9px] text-slate-500 mt-0.5">HPP Kaca + OPEX Operasional</div>
                                    </div>
                                    <div className={`border p-3 rounded ${netOperatingCash >= 0 ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-rose-50 border-rose-300 text-rose-950'}`}>
                                        <div className="font-sans text-[10px] uppercase font-black">Saldo Kas Operasional Bersih</div>
                                        <div className="font-black text-sm mt-1">
                                            Rp {netOperatingCash.toLocaleString('id-ID')}
                                        </div>
                                        <div className="text-[9px] mt-0.5">
                                            Piutang COD Berjalan: Rp {pendingCodVal.toLocaleString('id-ID')}
                                        </div>
                                    </div>
                                </div>

                                <table className="w-full text-xs font-mono border border-slate-400 border-collapse mb-2">
                                    <thead>
                                        <tr className="bg-slate-100 text-slate-900 font-black border-b-2 border-slate-400 text-left">
                                            <th className="p-2">No. Bukti</th>
                                            <th className="p-2">Tanggal</th>
                                            <th className="p-2">Kategori Pos</th>
                                            <th className="p-2">Uraian Transaksi Mutasi</th>
                                            <th className="p-2">Pihak Terkait</th>
                                            <th className="p-2 text-right">Nominal (Rp)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-300">
                                        {approvedTransactions.slice(0, selectedReportType === 'ledger' ? 50 : 12).map((trx, idx) => (
                                            <tr key={trx.id || idx} className="hover:bg-slate-50">
                                                <td className="p-1.5 font-bold text-slate-900">{trx.transaction_code}</td>
                                                <td className="p-1.5 text-slate-700 whitespace-nowrap">{trx.transaction_date}</td>
                                                <td className="p-1.5 text-slate-800">{trx.category}</td>
                                                <td className="p-1.5 text-slate-700">{trx.title}</td>
                                                <td className="p-1.5 text-slate-900 font-sans">{trx.supplier_name || '-'}</td>
                                                <td className="p-1.5 text-right font-black text-slate-900 whitespace-nowrap">
                                                    Rp {Number(trx.amount || 0).toLocaleString('id-ID')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {selectedReportType !== 'ledger' && approvedTransactions.length > 12 && (
                                    <div className="text-[10px] text-slate-500 text-center italic mt-1 font-sans">
                                        * Menampilkan 12 transaksi representatif dari total {approvedTransactions.length} transaksi approved. Buka Laporan Buku Kas untuk rincian menyeluruh.
                                    </div>
                                )}
                            </div>
                        )}

                        {/* SECTION 6: CATATAN ATAS LAPORAN KEUANGAN (CALK) & LEMBAR PENGESAHAN */}
                        <div className="mt-8 pt-4 border-t-2 border-slate-900 font-sans text-xs">
                            <div className="bg-slate-50 border border-slate-200 p-3 rounded mb-6">
                                <h4 className="font-black text-slate-900 uppercase text-[11px] mb-1">
                                    Catatan Ringkas Manajemen & Akuntan (Notes to Financial Report):
                                </h4>
                                <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5 leading-relaxed">
                                    <li>Laporan keuangan ini disusun berdasarkan pencatatan transaksi nyata sistem operasional CV Cahya Karunia Jaya.</li>
                                    <li>Seluruh pengadaan bahan kaca, aksesoris, dan biaya operasional telah melalui verifikasi dan otorisasi manajemen.</li>
                                    <li>Piutang COD Surat Jalan Merah supir sebesar <strong className="text-slate-900 font-mono">Rp {pendingCodVal.toLocaleString('id-ID')}</strong> dalam proses penyelesaian kas masuk.</li>
                                </ul>
                            </div>

                            {/* OFFICIAL EXECUTIVE SIGN-OFF & OTORISASI (LEMBAR PENGESAHAN) */}
                            <div className="text-center font-black uppercase tracking-wider text-slate-950 mb-6 font-serif text-sm">
                                LEMBAR PENGESAHAN & OTORISASI LAPORAN KEUANGAN
                            </div>

                            <div className="grid grid-cols-3 gap-6 text-center">
                                {/* KOLOM 1: STAFF FINANCE & AKUNTANSI */}
                                <div>
                                    <div className="text-slate-500 text-[11px] mb-1">Disiapkan Oleh:</div>
                                    <div className="font-bold text-slate-900 text-xs">Staff Finance & Akuntansi</div>
                                    <div className="h-16 flex items-center justify-center">
                                        <div className="text-slate-300 font-mono text-[10px] italic">[ Tanda Tangan ]</div>
                                    </div>
                                    <div className="font-bold text-slate-900 border-t-2 border-slate-800 pt-1 inline-block min-w-[150px] font-mono text-xs">
                                        (&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)
                                    </div>
                                    <div className="text-[10px] text-slate-500 mt-0.5">Finance & Accounting Staff</div>
                                </div>

                                {/* KOLOM 2: OPERASIONAL / GUDANG */}
                                <div>
                                    <div className="text-slate-500 text-[11px] mb-1">Diperiksa Oleh:</div>
                                    <div className="font-bold text-slate-900 text-xs">Admin Gudang & Operasional</div>
                                    <div className="h-16 flex items-center justify-center">
                                        <div className="text-slate-300 font-mono text-[10px] italic">[ Tanda Tangan ]</div>
                                    </div>
                                    <div className="font-bold text-slate-900 border-t-2 border-slate-800 pt-1 inline-block min-w-[150px] font-mono text-xs">
                                        (&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)
                                    </div>
                                    <div className="text-[10px] text-slate-500 mt-0.5">Head of Warehouse & Operations</div>
                                </div>

                                {/* KOLOM 3: OWNER / DIREKTUR PERUSAHAAN */}
                                <div>
                                    <div className="text-slate-500 text-[11px] mb-1">Disetujui & Disahkan:</div>
                                    <div className="font-bold text-slate-900 text-xs">Owner & Pimpinan Perusahaan</div>
                                    <div className="h-16 flex items-center justify-center relative">
                                        {/* CIRCULAR OFFICIAL STAMP */}
                                        <div className="w-16 h-16 rounded-full border-2 border-rose-700 text-rose-700 flex flex-col items-center justify-center text-[7.5px] font-black uppercase rotate-[-10deg] tracking-tight shadow-sm bg-rose-50/20">
                                            <span>CV CAHYA</span>
                                            <span className="text-[10px] font-mono leading-none my-0.5">★ SAH ★</span>
                                            <span>KARUNIA</span>
                                        </div>
                                    </div>
                                    <div className="font-bold text-slate-900 border-t-2 border-slate-800 pt-1 inline-block min-w-[150px] font-mono text-xs">
                                        (&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)
                                    </div>
                                    <div className="text-[10px] text-slate-500 mt-0.5">Owner / Direktur Utama</div>
                                </div>
                            </div>

                            {/* FOOTER AUDIT NOTE & VERIFICATION CODE */}
                            <div className="mt-8 pt-3 border-t border-slate-300 text-[10px] text-slate-500 flex flex-wrap justify-between items-center">
                                <span>Dokumen resmi terverifikasi sistem enterprise SYP GLASS CV Cahya Karunia Jaya.</span>
                                <span className="font-mono">Audit ID: CKJ-FIN-2026-X98B • Dicetak: {printDateFormatted}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
