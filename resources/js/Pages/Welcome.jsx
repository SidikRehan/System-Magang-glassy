import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { 
    Shield, 
    Layers, 
    Wrench, 
    Package, 
    Truck, 
    Calculator, 
    Activity, 
    ArrowRight, 
    CheckCircle2, 
    Sparkles, 
    Database, 
    BarChart3, 
    HelpCircle, 
    FileText, 
    ChevronDown, 
    Check, 
    Settings, 
    Flame, 
    Maximize2, 
    Boxes, 
    Factory, 
    ArrowUpRight,
    Lock,
    Menu,
    X,
    ShieldCheck
} from 'lucide-react';

export default function Welcome({ scrapCount = 14, totalOrders = 86 }) {
    const { auth } = usePage().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Visualizer State
    const [glassType, setGlassType] = useState('clear');
    const [thickness, setThickness] = useState(8);
    const [activeProcesses, setActiveProcesses] = useState({
        ht: true,
        gm: true,
        bv: false,
        etsa: false
    });

    // Calculator State
    const [calcLength, setCalcLength] = useState(150);
    const [calcWidth, setCalcWidth] = useState(120);
    const [calcGlassType, setCalcGlassType] = useState('clear');
    const [calcThickness, setCalcThickness] = useState(8);
    const [selectedProcesses, setSelectedProcesses] = useState(['gm', 'ht']);
    const [selectedAccessories, setSelectedAccessories] = useState(['spigot']);
    const [calcEtsaLength, setCalcEtsaLength] = useState(150);
    const [calcEtsaWidth, setCalcEtsaWidth] = useState(120);
    const [calcEtsaQty, setCalcEtsaQty] = useState(1);
    const [faqOpen, setFaqOpen] = useState(0);

    // Glass Specification Data
    const glassOptions = {
        clear: { name: 'Clear Float (Bening Standard)', basePrice: 450000, style: 'bg-blue-50/80 border-blue-300 text-slate-800 shadow-sm' },
        optiwhite: { name: 'Extra Clear OptiWhite (Super Jernih)', basePrice: 680000, style: 'bg-cyan-50/90 border-cyan-400 text-slate-900 shadow-md ring-2 ring-cyan-200' },
        tinted_dark: { name: 'Tinted Dark Grey / Black', basePrice: 520000, style: 'bg-slate-800 border-slate-700 text-slate-100 backdrop-brightness-75' },
        frosted: { name: 'Frosted Glass / Etsa Sandblast', basePrice: 580000, style: 'bg-slate-200/90 backdrop-blur-md border-slate-400 text-slate-800' },
        bronze_mirror: { name: 'Bronze Mirror / Reflektif Cermin', basePrice: 620000, style: 'bg-amber-100/90 border-amber-400 text-amber-950' }
    };

    const processCatalog = [
        { id: 'ht', name: 'Halus Tepi (HT)', rateArea: 120000, ratePerim: 0, desc: 'Pemotongan & pengasahan tepi kaca presisi' },
        { id: 'gm', name: 'Gosok Mesin Halus (GM)', rateArea: 0, ratePerim: 35000, desc: 'Finishing tepi kaca aman & halus' },
        { id: 'bv', name: 'Bevel Edge Artistic (BV 2cm)', rateArea: 0, ratePerim: 65000, desc: 'Lekukan artistik kemewahan interior' },
        { id: 'etsa', name: 'Sandblast / Etsa Pattern', rateArea: 95000, ratePerim: 0, desc: 'Tekstur buram ornamen custom' }
    ];

    const accessoryCatalog = [
        { id: 'spigot', name: 'Spigot Stainless 304 (Kanopi/Balkon)', price: 185000, unit: 'pcs', stock: 48, status: 'Stok Ready' },
        { id: 'hinge', name: 'Engsel Glass-to-Glass Heavy Duty', price: 240000, unit: 'set', stock: 24, status: 'Stok Ready' },
        { id: 'bracket', name: 'Bracket Clamp Stainless Steel', price: 65000, unit: 'pcs', stock: 60, status: 'Stok Ready' },
        { id: 'sealant', name: 'Silicone Sealant Neutral High Grade', price: 45000, unit: 'tube', stock: 15, status: 'Stok Ready' },
        { id: 'handle', name: 'Handle Pintu Stainless Tubular 40cm', price: 320000, unit: 'pasang', stock: 12, status: 'Stok Ready' },
        { id: 'floor_hinge', name: 'Floor Hinge Heavy Duty Dorma Style', price: 850000, unit: 'unit', stock: 5, status: 'Menipis' },
        { id: 'slot_kunci', name: 'Slot Kunci Kaca Stainless', price: 145000, unit: 'pcs', stock: 18, status: 'Stok Ready' },
        { id: 'alum_u', name: 'List Alumunium U-Channel Profile', price: 110000, unit: 'batang', stock: 35, status: 'Stok Ready' }
    ];

    // Calculation Formulas
    const areaM2 = (calcLength * calcWidth) / 10000;
    const perimeterM = (2 * (parseFloat(calcLength) + parseFloat(calcWidth))) / 100;
    const thicknessMultiplier = 1 + (calcThickness - 5) * 0.08;
    const baseGlassCost = Math.round(areaM2 * glassOptions[calcGlassType].basePrice * thicknessMultiplier);

    const processCost = selectedProcesses.reduce((acc, procId) => {
        if (procId === 'etsa') {
            const eL = parseFloat(calcEtsaLength) || calcLength;
            const eW = parseFloat(calcEtsaWidth) || calcWidth;
            const eQ = parseInt(calcEtsaQty) || 1;
            const etsaAreaM2 = (eL * eW) / 10000;
            const etsaFee = Math.round(etsaAreaM2 * eQ * 50000);
            return acc + Math.max(25000, etsaFee);
        }
        const proc = processCatalog.find(p => p.id === procId);
        if (!proc) return acc;
        return acc + (proc.rateArea * areaM2) + (proc.ratePerim * perimeterM);
    }, 0);

    const accessoryCost = selectedAccessories.reduce((acc, accId) => {
        const item = accessoryCatalog.find(a => a.id === accId);
        return acc + (item ? item.price : 0);
    }, 0);

    const rawTotal = baseGlassCost + processCost + accessoryCost;
    const estimatedTotal = Math.max(250000, Math.round(rawTotal));
    const dpAmount = Math.round(estimatedTotal * 0.5);

    const toggleProcessSelection = (id) => {
        setSelectedProcesses(prev => 
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const toggleAccessorySelection = (id) => {
        setSelectedAccessories(prev => 
            prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
        );
    };

    const faqs = [
        {
            q: 'Bagaimana alur kerja pembuatan SPO (Surat Pesanan Order) hingga pengiriman?',
            a: 'Order diawali oleh Admin Toko yang menginput spesifikasi kaca dan menerbitkan DP 50%. Selanjutnya order dikirim ke Divisi HT (Pemotongan & Oven Tempering), lalu dilanjutkan ke Divisi GM/BV/Etsa untuk finishing. Setelah lulus Quality Control (QC), barang disiapkan untuk pengiriman dengan 4 rangkap Surat Jalan (Putih, Merah, Kuning, Hijau) serta pelunasan sisa COD.'
        },
        {
            q: 'Apa itu fitur Manajemen Rak Scrap WMS (Kaca Sisa Potongan)?',
            a: 'Fitur WMS Rak Scrap memungkinkan Divisi HT mencatat potongan kaca sisa potongan yang masih layak pakai lengkap dengan lokasi rak (misal: Rak A1, Rak B2). Ketika ada order berukuran kecil, sistem secara otomatis merekomendasikan penggunaan kaca scrap ini, menghemat konsumsi lembaran kaca baru dan menekan biaya produksi.'
        },
        {
            q: 'Apakah kalkulasi harga di simulator landing page ini sudah presisi?',
            a: 'Simulator ini menggunakan rumus yang sama persis dengan modul Admin Toko SYP Glass (menghitung Luas m², Keliling Finishing Tepi, Faktor Ketebalan, Jenis Kaca, & Aksesoris). Nilai estimasi dapat langsung dijadikan patokan awal pesanan.'
        },
        {
            q: 'Mengapa Surat Jalan menggunakan sistem 4 warna (Putih, Merah, Kuning, Hijau)?',
            a: 'Sistem 4 rangkap menjamin akuntabilitas operasional: Lembar Putih untuk Arsip Admin/Keuangan, Merah untuk Tagihan & Pelunasan Customer, Kuning untuk Divisi Produksi & Gudang, serta Hijau sebagai bukti tanda terima pihak Kurir / Logistik.'
        }
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans selection:bg-[#2563EB] selection:text-white overflow-x-hidden">
            <Head title="SYP GLASS - Industrial Glass Manufacturing & Enterprise WMS Platform" />

            {/* TOP STATUS BAR - SLEEK ENTERPRISE BANNER */}
            <div className="bg-[#0B1329] text-slate-300 border-b border-slate-800/80 px-4 md:px-8 py-2 text-xs">
                <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-3">
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="bg-[#1E3A8A]/80 text-[#60A5FA] border border-[#2563EB]/40 px-3 py-0.5 rounded-full font-bold flex items-center gap-2 shadow-xs text-[11px] tracking-wide">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            SYSTEM OPERASIONAL ENTERPRISE v2.4
                        </span>
                        <span className="hidden md:inline-flex items-center gap-1.5 text-slate-300 text-[11px]">
                            <Database className="w-3.5 h-3.5 text-[#60A5FA]" />
                            Rak Scrap WMS: <strong className="text-white font-semibold">{scrapCount} Lembar Ready</strong>
                        </span>
                    </div>

                    <div className="flex items-center gap-4 text-slate-300 text-[11px] font-medium">
                        <span className="hidden sm:inline-flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            ISO 9001 Certified Factory
                        </span>
                        <span className="text-slate-500 hidden sm:inline">•</span>
                        <span className="text-slate-400">PT Sinar Yaung Perkasa</span>
                    </div>
                </div>
            </div>

            {/* ENTERPRISE NAVBAR */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/90 px-4 md:px-8 py-3.5 shadow-xs transition-all">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    {/* BRAND LOGO */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#3B82F6] rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20 border border-blue-400/30 transform group-hover:scale-105 transition-transform duration-200">
                            <Layers className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <span className="font-black text-xl tracking-tight text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                                    SYP<span className="text-[#2563EB]">GLASS</span>
                                </span>
                                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded tracking-wider uppercase shadow-xs">
                                    PRO
                                </span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-medium tracking-wide block uppercase">
                                Glass Manufacturing & WMS
                            </span>
                        </div>
                    </Link>

                    {/* DESKTOP NAVIGATION */}
                    <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-700">
                        <a href="#visualizer" className="hover:text-[#2563EB] transition-colors py-1 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-[#2563EB]" /> Simulator Kaca
                        </a>
                        <a href="#kalkulator" className="hover:text-[#2563EB] transition-colors py-1 flex items-center gap-1.5">
                            <Calculator className="w-4 h-4 text-[#2563EB]" /> Kalkulator Biaya
                        </a>
                        <a href="#workflow" className="hover:text-[#2563EB] transition-colors py-1 flex items-center gap-1.5">
                            <Layers className="w-4 h-4 text-[#2563EB]" /> Alur Operasional
                        </a>
                        <a href="#wms-scrap" className="hover:text-[#2563EB] transition-colors py-1 flex items-center gap-1.5">
                            <Boxes className="w-4 h-4 text-[#2563EB]" /> WMS Scrap Rak
                        </a>
                        <a href="#faq" className="hover:text-[#2563EB] transition-colors py-1 flex items-center gap-1.5">
                            <HelpCircle className="w-4 h-4 text-[#2563EB]" /> FAQ
                        </a>
                    </nav>

                    {/* CTA ACTION & MOBILE TOGGLE */}
                    <div className="flex items-center gap-3">
                        {auth.user ? (
                            <Link href="/dashboard" className="bg-[#0F172A] hover:bg-[#1E3A8A] text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm flex items-center gap-2 transition duration-200">
                                <Activity className="w-4 h-4 text-[#60A5FA]" />
                                Buka Dashboard
                            </Link>
                        ) : (
                            <Link href={route('login')} className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-md shadow-blue-500/20 transition transform hover:-translate-y-0.5 flex items-center gap-2">
                                Login Akses Karyawan <ArrowRight className="w-4 h-4" />
                            </Link>
                        )}

                        {/* Mobile Menu Button */}
                        <button 
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 transition"
                            aria-label="Toggle Navigation Menu"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* MOBILE NAVIGATION DRAWER */}
                {mobileMenuOpen && (
                    <div className="lg:hidden mt-3 pt-3 border-t border-slate-200 space-y-2 pb-2 px-2 animate-in slide-in-from-top-2 duration-200">
                        <a 
                            href="#visualizer" 
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-2 p-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#2563EB] transition"
                        >
                            <Sparkles className="w-4 h-4 text-[#2563EB]" /> Simulator Kaca
                        </a>
                        <a 
                            href="#kalkulator" 
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-2 p-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#2563EB] transition"
                        >
                            <Calculator className="w-4 h-4 text-[#2563EB]" /> Kalkulator Biaya
                        </a>
                        <a 
                            href="#workflow" 
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-2 p-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#2563EB] transition"
                        >
                            <Layers className="w-4 h-4 text-[#2563EB]" /> Alur Operasional
                        </a>
                        <a 
                            href="#wms-scrap" 
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-2 p-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#2563EB] transition"
                        >
                            <Boxes className="w-4 h-4 text-[#2563EB]" /> WMS Scrap Rak
                        </a>
                        <a 
                            href="#faq" 
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-2 p-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#2563EB] transition"
                        >
                            <HelpCircle className="w-4 h-4 text-[#2563EB]" /> FAQ
                        </a>
                    </div>
                )}
            </header>

            {/* HERO SECTION */}
            <section className="relative px-4 md:px-8 pt-12 pb-16 md:pt-20 md:pb-24 max-w-7xl mx-auto">
                {/* AMBIENT BACKGROUND LIGHT GLOWS */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[450px] bg-gradient-to-tr from-blue-400/10 via-cyan-400/15 to-indigo-400/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    {/* LEFT COLUMN: HERO TEXT & ACTIONS */}
                    <div className="lg:col-span-7 space-y-7">
                        {/* BADGE */}
                        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200/80 text-[#1E3A8A] px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-xs">
                            <Factory className="w-4 h-4 text-[#2563EB]" />
                            <span>Platform Terintegrasi Manufaktur & Operasional Kaca</span>
                        </div>

                        {/* HEADLINE */}
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] text-[#0F172A]">
                            Sistem Operasional & <br />
                            <span className="bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#3B82F6] bg-clip-text text-transparent">
                                Manufaktur Kaca Enterprise
                            </span>
                        </h1>

                        {/* DESCRIPTION */}
                        <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
                            Solusi digitalisasi terpadu industri kaca: Otomasi Surat Pesanan Order (SPO), disosiasi pemrosesan multi-divisi (<strong className="text-[#1E3A8A]">HT / GM / BV / Etsa</strong>), manajemen sisa kaca di rak (<strong className="text-[#1E3A8A]">WMS Scrap Storage</strong>), cetak <strong className="text-[#1E3A8A]">Surat Jalan 4 Rangkap</strong>, serta akuntansi pelunasan DP & COD.
                        </p>

                        {/* ACTION BUTTONS */}
                        <div className="flex flex-wrap items-center gap-4 pt-2">
                            {auth.user ? (
                                <Link href="/dashboard" className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black px-7 py-3.5 rounded-xl shadow-lg shadow-blue-600/25 text-sm flex items-center gap-2.5 transition transform hover:-translate-y-0.5">
                                    <Activity className="w-5 h-5" /> Buka Dashboard Operasional →
                                </Link>
                            ) : (
                                <a href="#kalkulator" className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black px-7 py-3.5 rounded-xl shadow-lg shadow-blue-600/25 text-sm flex items-center gap-2.5 transition transform hover:-translate-y-0.5">
                                    <Calculator className="w-5 h-5" /> Hitung Estimasi Order →
                                </a>
                            )}
                            <a href="#visualizer" className="bg-white border border-slate-300 hover:border-[#2563EB] hover:bg-slate-50 text-[#0F172A] font-bold px-6 py-3.5 rounded-xl text-sm transition flex items-center gap-2 shadow-xs">
                                <Sparkles className="w-4 h-4 text-[#2563EB]" /> Coba Visualizer Kaca
                            </a>
                        </div>

                        {/* LIVE METRICS GRID */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-6 border-t border-slate-200/80">
                            <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs hover:shadow-md hover:border-blue-300 transition group">
                                <div className="flex items-center justify-between text-slate-400 mb-1">
                                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total SPO</span>
                                    <FileText className="w-4 h-4 text-[#2563EB] group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="text-2xl font-black text-[#0F172A] flex items-baseline gap-1">
                                    {totalOrders} <span className="text-xs text-[#2563EB] font-bold">Order</span>
                                </div>
                            </div>

                            <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs hover:shadow-md hover:border-blue-300 transition group">
                                <div className="flex items-center justify-between text-slate-400 mb-1">
                                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Scrap WMS</span>
                                    <Boxes className="w-4 h-4 text-[#1E3A8A] group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="text-2xl font-black text-[#1E3A8A] flex items-baseline gap-1">
                                    {scrapCount} <span className="text-xs text-[#2563EB] font-bold">Rak Ready</span>
                                </div>
                            </div>

                            <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs hover:shadow-md hover:border-blue-300 transition group">
                                <div className="flex items-center justify-between text-slate-400 mb-1">
                                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Akurasi</span>
                                    <ShieldCheck className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="text-2xl font-black text-[#2563EB]">99.8%</div>
                            </div>

                            <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs hover:shadow-md hover:border-blue-300 transition group">
                                <div className="flex items-center justify-between text-slate-400 mb-1">
                                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Surat Jalan</span>
                                    <Truck className="w-4 h-4 text-[#1E3A8A] group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="text-2xl font-black text-[#1E3A8A]">4 Rangkap</div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: HERO CONTROL CENTER DEMO CARD */}
                    <div className="lg:col-span-5">
                        <div className="relative bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xl space-y-5">
                            {/* DEMO BADGE */}
                            <div className="absolute -top-3 right-6 bg-[#2563EB] text-white font-black text-[10px] uppercase px-3 py-1 rounded-full tracking-widest shadow-md flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                                Live Engine Control
                            </div>

                            {/* CARD HEADER */}
                            <div className="flex justify-between items-center border-b border-slate-100 pb-3.5">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#2563EB] animate-ping"></div>
                                    <h3 className="font-extrabold text-[#0F172A] text-base">SYP Operational Pipeline</h3>
                                </div>
                                <span className="text-[11px] font-mono bg-blue-50 text-[#1E3A8A] px-2.5 py-1 rounded-md border border-blue-200/60 font-semibold">
                                    4 Divisi Active
                                </span>
                            </div>

                            {/* WORKFLOW PROGRESS BADGES */}
                            <div className="space-y-2">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Status Alur Produksi SPO:</span>
                                <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                                    <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl flex items-center gap-2 text-slate-700">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                        <span className="truncate">1. Admin Toko (DP 50%)</span>
                                    </div>
                                    <div className="bg-[#1E3A8A] border border-[#1E3A8A] p-2.5 rounded-xl flex items-center gap-2 text-white shadow-xs">
                                        <Flame className="w-4 h-4 text-[#60A5FA] animate-pulse shrink-0" />
                                        <span className="truncate">2. Divisi HT (Cutting)</span>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl flex items-center gap-2 text-slate-700">
                                        <Wrench className="w-4 h-4 text-[#2563EB] shrink-0" />
                                        <span className="truncate">3. Divisi GM/BV/Etsa</span>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl flex items-center gap-2 text-slate-700">
                                        <Truck className="w-4 h-4 text-[#1E3A8A] shrink-0" />
                                        <span className="truncate">4. QC & Kirim 4 Color</span>
                                    </div>
                                </div>
                            </div>

                            {/* SCRAP GLASS RACK DEMO WIDGET */}
                            <div className="bg-[#0B1329] text-white rounded-2xl p-4 space-y-3 shadow-md border border-slate-800">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                                        <Boxes className="w-3.5 h-3.5 text-[#60A5FA]" /> WMS Scrap Glass Storage:
                                    </span>
                                    <span className="text-[#60A5FA] font-bold bg-[#1E3A8A] px-2 py-0.5 rounded text-[10px] border border-[#2563EB]/40">
                                        Smart Recommendation
                                    </span>
                                </div>
                                <div className="flex items-center justify-between bg-[#1E3A8A]/40 p-3 rounded-xl border border-white/10 text-xs">
                                    <div>
                                        <span className="font-bold text-white block">SCRAP-004 (Rak A1)</span>
                                        <span className="text-slate-300 text-[11px]">Clear Float 8mm • 140 x 110 cm</span>
                                    </div>
                                    <span className="bg-[#2563EB] text-white font-extrabold px-2.5 py-1 rounded text-[11px] shadow-xs">
                                        Siap Pakai
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 2: INTERACTIVE GLASS VISUALIZER & SIMULATOR */}
            <section id="visualizer" className="py-20 px-4 md:px-8 bg-slate-100/70 border-y border-slate-200 relative">
                <div className="max-w-7xl mx-auto space-y-12">
                    <div className="text-center space-y-3 max-w-3xl mx-auto">
                        <span className="bg-[#2563EB]/10 border border-[#2563EB]/30 text-[#1E3A8A] text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                            ✨ Dynamic Physics Engine
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-black text-[#0F172A]">
                            Simulator & <span className="text-[#2563EB]">Visualizer Kaca Real-Time</span>
                        </h2>
                        <p className="text-slate-600 text-sm sm:text-base">
                            Simulasikan karakteristik fisik material kaca, indeks ketebalan, serta finishing permukaan secara langsung.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                        {/* CONTROLS SIDE PANEL */}
                        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
                            <h3 className="font-bold text-lg text-[#0F172A] flex items-center gap-2 border-b border-slate-200 pb-3">
                                <Settings className="w-5 h-5 text-[#2563EB]" /> Parameter Spesifikasi Kaca
                            </h3>

                            {/* GLASS TYPE SELECTOR */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-700 block">1. Pilih Material & Warna Kaca:</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {Object.entries(glassOptions).map(([key, item]) => (
                                        <button
                                            key={key}
                                            onClick={() => setGlassType(key)}
                                            className={`p-3 rounded-xl border text-left text-xs font-semibold transition flex justify-between items-center ${
                                                glassType === key 
                                                    ? 'border-[#2563EB] bg-[#2563EB]/10 text-[#1E3A8A] shadow-sm' 
                                                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                                            }`}
                                        >
                                            <span>{item.name}</span>
                                            {glassType === key && <Check className="w-4 h-4 text-[#2563EB]" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* THICKNESS SLIDER */}
                            <div className="space-y-3 pt-2">
                                <div className="flex justify-between items-center text-xs">
                                    <label className="font-semibold text-slate-700">2. Ketebalan Kaca:</label>
                                    <span className="font-mono font-bold text-[#1E3A8A] bg-blue-50 px-2.5 py-1 rounded border border-[#2563EB]/30">
                                        {thickness} mm
                                    </span>
                                </div>
                                <input 
                                    type="range" 
                                    min="3" 
                                    max="19" 
                                    value={thickness}
                                    onChange={(e) => setThickness(parseInt(e.target.value))}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
                                />
                                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                                    <span>3mm (Biasa)</span>
                                    <span>8mm (Standard)</span>
                                    <span>12mm (Sekat)</span>
                                    <span>19mm (Heavy)</span>
                                </div>
                            </div>

                            {/* PROCESS TOGGLES */}
                            <div className="space-y-2 pt-2">
                                <label className="text-xs font-semibold text-slate-700 block">3. Opsi Finishing & Proses:</label>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <button 
                                        onClick={() => setActiveProcesses(p => ({ ...p, ht: !p.ht }))}
                                        className={`p-2.5 rounded-xl border font-semibold flex items-center justify-between ${
                                            activeProcesses.ht ? 'bg-[#2563EB]/15 border-[#2563EB] text-[#1E3A8A]' : 'bg-slate-50 border-slate-200 text-slate-600'
                                        }`}
                                    >
                                        <span>Halus Tepi (HT)</span>
                                        {activeProcesses.ht && <Flame className="w-3.5 h-3.5 text-[#2563EB]" />}
                                    </button>

                                    <button 
                                        onClick={() => setActiveProcesses(p => ({ ...p, gm: !p.gm }))}
                                        className={`p-2.5 rounded-xl border font-semibold flex items-center justify-between ${
                                            activeProcesses.gm ? 'bg-[#2563EB]/15 border-[#2563EB] text-[#1E3A8A]' : 'bg-slate-50 border-slate-200 text-slate-600'
                                        }`}
                                    >
                                        <span>Gosok Mesin (GM)</span>
                                        {activeProcesses.gm && <Wrench className="w-3.5 h-3.5 text-[#2563EB]" />}
                                    </button>

                                    <button 
                                        onClick={() => setActiveProcesses(p => ({ ...p, bv: !p.bv }))}
                                        className={`p-2.5 rounded-xl border font-semibold flex items-center justify-between ${
                                            activeProcesses.bv ? 'bg-[#2563EB]/15 border-[#2563EB] text-[#1E3A8A]' : 'bg-slate-50 border-slate-200 text-slate-600'
                                        }`}
                                    >
                                        <span>Beveling (BV)</span>
                                        {activeProcesses.bv && <Maximize2 className="w-3.5 h-3.5 text-[#2563EB]" />}
                                    </button>

                                    <button 
                                        onClick={() => setActiveProcesses(p => ({ ...p, etsa: !p.etsa }))}
                                        className={`p-2.5 rounded-xl border font-semibold flex items-center justify-between ${
                                            activeProcesses.etsa ? 'bg-[#2563EB]/15 border-[#2563EB] text-[#1E3A8A]' : 'bg-slate-50 border-slate-200 text-slate-600'
                                        }`}
                                    >
                                        <span>Sandblast / Etsa</span>
                                        {activeProcesses.etsa && <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* VISUALIZER DISPLAY PANEL */}
                        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 relative overflow-hidden shadow-md">
                            <div className="flex justify-between items-center text-xs border-b border-slate-200 pb-3">
                                <span className="text-slate-500 font-mono">Render Simulation Output</span>
                                <div className="flex items-center gap-2">
                                    {activeProcesses.ht && <span className="bg-[#2563EB]/10 text-[#1E3A8A] border border-[#2563EB]/30 px-2 py-0.5 rounded text-[10px] font-bold">HALUS TEPI HT</span>}
                                    {activeProcesses.bv && <span className="bg-amber-500/10 text-amber-800 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-bold">BEVEL 2CM</span>}
                                    {activeProcesses.etsa && <span className="bg-blue-500/10 text-blue-800 border border-blue-500/30 px-2 py-0.5 rounded text-[10px] font-bold">ETSA SANDBLAST</span>}
                                </div>
                            </div>

                            {/* MAIN SIMULATED GLASS SLAB */}
                            <div className="relative min-h-[300px] sm:min-h-[360px] rounded-2xl flex items-center justify-center p-8 transition-all duration-500 overflow-hidden shadow-xl border border-slate-300 group bg-slate-100">
                                
                                {/* DYNAMIC GLASS TEXTURE EFFECT */}
                                <div 
                                    className={`absolute inset-0 transition-all duration-500 rounded-2xl ${glassOptions[glassType].style}`}
                                    style={{
                                        borderWidth: `${Math.min(10, Math.max(2, thickness / 2))}px`,
                                        backdropFilter: glassType === 'frosted' || activeProcesses.etsa ? 'blur(16px)' : 'blur(4px)'
                                    }}
                                ></div>

                                {/* LIGHT SHEEN SHINE EFFECT */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-70 rounded-2xl pointer-events-none group-hover:translate-x-10 transition duration-700"></div>

                                {/* CONTENT OVERLAY */}
                                <div className="relative z-10 text-center space-y-4 max-w-md">
                                    <div className="w-16 h-16 mx-auto rounded-2xl bg-white border border-[#2563EB]/40 flex items-center justify-center text-[#2563EB] shadow-md">
                                        <Sparkles className="w-8 h-8 animate-pulse" />
                                    </div>

                                    <div>
                                        <h4 className="text-xl font-black text-[#0F172A] tracking-wide">
                                            {glassOptions[glassType].name}
                                        </h4>
                                        <p className="text-xs text-slate-600 font-mono mt-1 font-medium">
                                            Ketebalan: {thickness} mm • Spec Presisi Manufaktur SYP
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap justify-center gap-2 text-[11px] pt-2">
                                        <span className="bg-white/90 px-3 py-1 rounded-full border border-slate-300 text-slate-700 font-mono shadow-sm">
                                            Refraksi: 1.52 n
                                        </span>
                                        <span className="bg-white/90 px-3 py-1 rounded-full border border-slate-300 text-[#1E3A8A] font-mono font-bold shadow-sm">
                                            Kepadatan: {(thickness * 2.5).toFixed(1)} kg/m²
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 flex flex-wrap justify-between items-center gap-2">
                                <span>Estimasi Mutu Fisik: Standard Industri SNI / ISO Glass 2026</span>
                                <a href="#kalkulator" className="text-[#2563EB] hover:underline font-bold flex items-center gap-1">
                                    Hitung Biaya Kaca Ini <ArrowUpRight className="w-3.5 h-3.5" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 3: SMART COST ESTIMATOR & CALCULATOR */}
            <section id="kalkulator" className="py-20 px-4 md:px-8 max-w-7xl mx-auto space-y-12">
                <div className="text-center space-y-3 max-w-3xl mx-auto">
                    <span className="bg-[#2563EB]/10 border border-[#2563EB]/30 text-[#1E3A8A] text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                        🧮 Smart Pricing Matrix
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-black text-[#0F172A]">
                        Kalkulator <span className="text-[#2563EB]">Estimasi Biaya Order Kaca</span>
                    </h2>
                    <p className="text-slate-600 text-sm sm:text-base">
                        Simulasikan biaya pembuatan kaca berdasarkan dimensi, ketebalan, variasi proses finishing, dan aksesoris.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* CALCULATOR INPUT FORM */}
                    <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
                        <h3 className="font-bold text-lg text-[#0F172A] flex items-center gap-2 border-b border-slate-200 pb-3">
                            <Calculator className="w-5 h-5 text-[#2563EB]" /> Form Spesifikasi Dimension & Fitur
                        </h3>

                        {/* DIMENSIONS */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700 block">Panjang Kaca (cm):</label>
                                <input 
                                    type="number" 
                                    min="10"
                                    max="500"
                                    value={calcLength} 
                                    onChange={(e) => setCalcLength(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-[#0F172A] text-sm font-mono focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 focus:outline-none" 
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700 block">Lebar Kaca (cm):</label>
                                <input 
                                    type="number" 
                                    min="10"
                                    max="500"
                                    value={calcWidth} 
                                    onChange={(e) => setCalcWidth(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-[#0F172A] text-sm font-mono focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 focus:outline-none" 
                                />
                            </div>
                        </div>

                        {/* MATERIAL & THICKNESS */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700 block">Jenis Kaca Dasar:</label>
                                <select 
                                    value={calcGlassType} 
                                    onChange={(e) => setCalcGlassType(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-[#0F172A] text-xs font-semibold focus:border-[#2563EB] focus:outline-none"
                                >
                                    {Object.entries(glassOptions).map(([key, item]) => (
                                        <option key={key} value={key}>{item.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700 block">Ketebalan Kaca:</label>
                                <select 
                                    value={calcThickness} 
                                    onChange={(e) => setCalcThickness(parseInt(e.target.value))}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-[#0F172A] text-xs font-semibold focus:border-[#2563EB] focus:outline-none"
                                >
                                    <option value={5}>5 mm (Standard Bening)</option>
                                    <option value={8}>8 mm (Pintu/Sekat Kaca)</option>
                                    <option value={10}>10 mm (Kanopi & Balustrade)</option>
                                    <option value={12}>12 mm (Tempered Heavy)</option>
                                    <option value={15}>15 mm (Kaca Khusus Industri)</option>
                                </select>
                            </div>
                        </div>

                        {/* PROCESS SELECTION */}
                        <div className="space-y-2 pt-2">
                            <label className="text-xs font-semibold text-slate-700 block">Pilih Proses Finishing Kaca:</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                {processCatalog.map(proc => (
                                    <button 
                                        key={proc.id}
                                        onClick={() => toggleProcessSelection(proc.id)}
                                        className={`p-3 rounded-xl border text-left transition flex justify-between items-center ${
                                            selectedProcesses.includes(proc.id)
                                                ? 'bg-[#2563EB]/10 border-[#2563EB] text-[#1E3A8A] font-semibold'
                                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                                        }`}
                                    >
                                        <div>
                                            <span className="block">{proc.name}</span>
                                            <span className="text-[10px] text-slate-500 block">{proc.desc}</span>
                                        </div>
                                        {selectedProcesses.includes(proc.id) && <Check className="w-4 h-4 text-[#2563EB] shrink-0 ml-2" />}
                                    </button>
                                ))}
                            </div>

                            {/* DYNAMIC ETSA MODE CONFIGURATION BOX */}
                            {selectedProcesses.includes('etsa') && (
                                <div className="mt-3 bg-[#2563EB]/5 border border-[#2563EB]/30 rounded-2xl p-4 space-y-3 animate-in fade-in duration-200">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-[#1E3A8A] flex items-center gap-1.5">
                                            <Sparkles className="w-4 h-4 text-[#2563EB]" /> Konfigurasi Tipe Pengerjaan Etsa:
                                        </span>
                                        <span className="text-[10px] font-semibold bg-blue-100 text-[#1E3A8A] px-2 py-0.5 rounded">
                                            Akurat Presisi Area
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 pt-1">
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-600 block mb-1">Panjang Etsa (cm):</label>
                                            <input 
                                                type="number" 
                                                value={calcEtsaLength} 
                                                onChange={(e) => setCalcEtsaLength(Math.max(1, parseFloat(e.target.value) || 0))}
                                                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold"
                                                placeholder={calcLength}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-600 block mb-1">Lebar Etsa (cm):</label>
                                            <input 
                                                type="number" 
                                                value={calcEtsaWidth} 
                                                onChange={(e) => setCalcEtsaWidth(Math.max(1, parseFloat(e.target.value) || 0))}
                                                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold"
                                                placeholder={calcWidth}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-600 block mb-1">Jumlah Area (Pcs):</label>
                                            <input 
                                                type="number" 
                                                value={calcEtsaQty} 
                                                onChange={(e) => setCalcEtsaQty(Math.max(1, parseInt(e.target.value) || 1))}
                                                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ACCESSORIES SELECTION */}
                        <div className="space-y-2 pt-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-slate-700 block">Katalog Hardware & Aksesoris Stok SYP Glass:</label>
                                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold">✓ Stok Terintegrasi Gudang</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                {accessoryCatalog.map(acc => (
                                    <button 
                                        key={acc.id}
                                        onClick={() => toggleAccessorySelection(acc.id)}
                                        className={`p-3 rounded-xl border text-left transition flex justify-between items-center ${
                                            selectedAccessories.includes(acc.id)
                                                ? 'bg-[#2563EB]/10 border-[#2563EB] text-[#1E3A8A] font-semibold shadow-xs'
                                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <span className="block">{acc.name}</span>
                                                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${acc.status === 'Menipis' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                                    {acc.stock} {acc.unit}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-[#2563EB] font-semibold block">Rp {acc.price.toLocaleString()} / {acc.unit}</span>
                                        </div>
                                        {selectedAccessories.includes(acc.id) && <Check className="w-4 h-4 text-[#2563EB] shrink-0 ml-2" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ESTIMATION SUMMARY SIDEBAR (NAVY #0F172A & DEEP BLUE #1E3A8A) */}
                    <div className="lg:col-span-5 bg-gradient-to-b from-[#0F172A] to-[#1E3A8A] text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative border border-[#1E3A8A]">
                        <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                            <span className="text-xs text-slate-300 font-mono">Invoice Line Item Breakdown</span>
                            <span className="bg-[#2563EB] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                                Live Calculation
                            </span>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="flex justify-between text-slate-200">
                                <span>Luas Area Kaca:</span>
                                <span className="font-mono font-bold text-white">{areaM2.toFixed(2)} m²</span>
                            </div>
                            <div className="flex justify-between text-slate-200">
                                <span>Keliling Finishing:</span>
                                <span className="font-mono font-bold text-white">{perimeterM.toFixed(2)} meter</span>
                            </div>
                            <div className="flex justify-between text-slate-200">
                                <span>Harga Bahan Kaca Dasar:</span>
                                <span className="font-mono text-[#60A5FA]">Rp {baseGlassCost.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-slate-200">
                                <span>Biaya Finishing & Proses:</span>
                                <span className="font-mono text-[#60A5FA]">Rp {processCost.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-slate-200">
                                <span>Biaya Aksesoris Tambahan:</span>
                                <span className="font-mono text-[#60A5FA]">Rp {accessoryCost.toLocaleString()}</span>
                            </div>

                            <div className="border-t border-slate-700 pt-3 space-y-2">
                                <div className="flex justify-between text-slate-300">
                                    <span>DP Awal (50% Syarat Order):</span>
                                    <span className="font-mono font-bold text-amber-300">Rp {dpAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-slate-300">
                                    <span>Pelunasan Sisa COD (50%):</span>
                                    <span className="font-mono font-bold text-[#60A5FA]">Rp {(estimatedTotal - dpAmount).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* TOTAL HIGHLIGHT */}
                        <div className="bg-[#0F172A]/80 p-5 rounded-2xl border border-white/10 text-center space-y-1 shadow-inner">
                            <span className="text-xs text-slate-300 uppercase tracking-widest font-semibold block">Total Estimasi Keseluruhan</span>
                            <div className="text-3xl sm:text-4xl font-black text-[#60A5FA]">
                                Rp {estimatedTotal.toLocaleString()}
                            </div>
                            <span className="text-[10px] text-slate-400 block pt-1">
                                *Sudah termasuk PPN 11% & Jaminan Garansi Manufaktur
                            </span>
                        </div>

                        {auth.user ? (
                            <Link 
                                href="/dashboard" 
                                className="w-full bg-[#2563EB] hover:bg-blue-600 text-white font-black py-4 rounded-xl text-center text-sm shadow-xl transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                            >
                                <FileText className="w-4 h-4" /> Input Pesanan Ke System SYP →
                            </Link>
                        ) : (
                            <a 
                                href="#visualizer" 
                                className="w-full bg-[#1E3A8A] hover:bg-[#0F172A] text-white font-bold py-4 rounded-xl text-center text-sm shadow-md transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                            >
                                <Sparkles className="w-4 h-4 text-[#60A5FA]" /> Coba Simulator Visualizer →
                            </a>
                        )}
                    </div>
                </div>
            </section>

            {/* SECTION 4: MULTI-DIVISION OPERATIONAL WORKFLOW */}
            <section id="workflow" className="py-20 px-4 md:px-8 bg-slate-100/70 border-t border-slate-200">
                <div className="max-w-7xl mx-auto space-y-12">
                    <div className="text-center space-y-3 max-w-3xl mx-auto">
                        <span className="bg-[#2563EB]/10 border border-[#2563EB]/30 text-[#1E3A8A] text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                            ⚙️ End-to-End Enterprise Standard
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-black text-[#0F172A]">
                            Alur Operasional <span className="text-[#2563EB]">4 Divisi SYP Glass</span>
                        </h2>
                        <p className="text-slate-600 text-sm sm:text-base">
                            Setiap pesanan diproses secara transparan melalui 4 divisi terspesialisasi dengan pelacakan hak akses tersinkronisasi.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* STEP 1 */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 hover:border-[#2563EB] transition duration-300 shadow-md relative group">
                            <div className="w-12 h-12 bg-[#1E3A8A] text-[#60A5FA] rounded-2xl flex items-center justify-center font-black text-xl shadow-md">
                                01
                            </div>
                            <h3 className="font-bold text-lg text-[#0F172A]">Admin Toko & Sales</h3>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Membuat SPO (Surat Pesanan Order), menentukan dimensi & proses, serta mengonfirmasi pembayaran DP 50% sebelum rilis ke pabrik.
                            </p>
                            <ul className="text-xs text-slate-700 space-y-1.5 pt-2">
                                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#2563EB]" /> Penerbitan SPO-01XX</li>
                                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#2563EB]" /> Verifikasi DP 50%</li>
                            </ul>
                        </div>

                        {/* STEP 2 */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 hover:border-[#2563EB] transition duration-300 shadow-md relative group">
                            <div className="w-12 h-12 bg-[#2563EB] text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-md">
                                02
                            </div>
                            <h3 className="font-bold text-lg text-[#0F172A]">Divisi HT (Cutting)</h3>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Pemotongan lembar kaca presisi, mengalokasikan sisa sisa potongan ke Rak Scrap WMS, serta pemanasan di oven tempering.
                            </p>
                            <ul className="text-xs text-slate-700 space-y-1.5 pt-2">
                                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#2563EB]" /> Potong Presisi CNC</li>
                                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#2563EB]" /> Input WMS Scrap Rak</li>
                            </ul>
                        </div>

                        {/* STEP 3 */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 hover:border-[#2563EB] transition duration-300 shadow-md relative group">
                            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-md">
                                03
                            </div>
                            <h3 className="font-bold text-lg text-[#0F172A]">Divisi GM / BV / Etsa</h3>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Pemrosesan finishing tepi kaca (Gosok Mesin Halus), pembentukan Bevel 2cm artistik, dan sandblasting / ukiran etsa.
                            </p>
                            <ul className="text-xs text-slate-700 space-y-1.5 pt-2">
                                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#2563EB]" /> Edgework GM & Bevel</li>
                                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#2563EB]" /> Ukiran Custom Etsa</li>
                            </ul>
                        </div>

                        {/* STEP 4 */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 hover:border-[#2563EB] transition duration-300 shadow-md relative group">
                            <div className="w-12 h-12 bg-[#0F172A] text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-md">
                                04
                            </div>
                            <h3 className="font-bold text-lg text-[#0F172A]">QC & Pengiriman 4 Warna</h3>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Quality Control akhir, pencetakan Surat Jalan 4 Warna (Putih, Merah, Kuning, Hijau), armada kurir, serta pelunasan COD.
                            </p>
                            <ul className="text-xs text-slate-700 space-y-1.5 pt-2">
                                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#2563EB]" /> Surat Jalan 4 Rangkap</li>
                                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#2563EB]" /> Pelunasan Sisa COD</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 5: WMS SCRAP GLASS SPOTLIGHT */}
            <section id="wms-scrap" className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="bg-gradient-to-r from-[#0F172A] via-[#1E3A8A] to-[#0F172A] text-white rounded-3xl p-8 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-2xl relative overflow-hidden">
                    <div className="lg:col-span-7 space-y-6">
                        <span className="bg-[#2563EB]/20 border border-[#60A5FA]/40 text-[#60A5FA] text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                            🌱 Zero-Waste Manufacturing Innovation
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-black">
                            Manajemen Smart WMS <span className="text-[#60A5FA]">Rak Kaca Sisa Potongan</span>
                        </h2>
                        <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                            Pabrik kami tidak membuang sisa potongan kaca. Melalui sistem WMS Rak Scrap, potongan kaca bernilai tinggi langsung dicatat oleh Divisi HT dan dialokasikan untuk order kecil mendatang. Hasilnya? Penghematan konsumsi bahan baku dan biaya produksi yang lebih terjangkau bagi konsumen.
                        </p>
                        <div className="flex flex-wrap gap-4 pt-2">
                            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/20 text-xs font-mono">
                                <span className="text-slate-300 block">Stok Scrap Layak Pakai:</span>
                                <span className="text-[#60A5FA] font-bold text-lg">{scrapCount} Lembar Tersedia</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/20 text-xs font-mono">
                                <span className="text-slate-300 block">Efisiensi Bahan Kaca:</span>
                                <span className="text-white font-bold text-lg">+34% Cost Savings</span>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5 bg-[#0F172A]/90 border border-white/10 rounded-2xl p-6 space-y-3 shadow-lg">
                        <div className="flex justify-between items-center border-b border-slate-700 pb-3 text-xs">
                            <span className="font-bold text-white">Katalog Rak WMS Monitoring</span>
                            <span className="text-[#60A5FA] font-mono text-[11px]">Real-Time Sync</span>
                        </div>
                        <div className="space-y-2 text-xs">
                            <div className="p-3 bg-[#1E3A8A]/60 rounded-xl border border-white/10 flex justify-between items-center">
                                <div>
                                    <span className="font-bold text-white block">Rak A-01 (Kaca Bening)</span>
                                    <span className="text-slate-300 text-[11px]">Clear Float 8mm • 120 x 85 cm</span>
                                </div>
                                <span className="bg-[#2563EB] text-white font-bold px-2 py-1 rounded text-[10px]">
                                    READY
                                </span>
                            </div>
                            <div className="p-3 bg-[#1E3A8A]/60 rounded-xl border border-white/10 flex justify-between items-center">
                                <div>
                                    <span className="font-bold text-white block">Rak B-03 (Dark Grey)</span>
                                    <span className="text-slate-300 text-[11px]">Tinted Grey 10mm • 90 x 60 cm</span>
                                </div>
                                <span className="bg-[#2563EB] text-white font-bold px-2 py-1 rounded text-[10px]">
                                    READY
                                </span>
                            </div>
                            <div className="p-3 bg-[#1E3A8A]/60 rounded-xl border border-white/10 flex justify-between items-center">
                                <div>
                                    <span className="font-bold text-white block">Rak C-02 (Bronze Mirror)</span>
                                    <span className="text-slate-300 text-[11px]">Reflektif 6mm • 150 x 50 cm</span>
                                </div>
                                <span className="bg-[#2563EB] text-white font-bold px-2 py-1 rounded text-[10px]">
                                    READY
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 6: FAQ ACCORDION */}
            <section id="faq" className="py-20 px-4 md:px-8 max-w-5xl mx-auto space-y-10">
                <div className="text-center space-y-3">
                    <span className="bg-[#2563EB]/10 border border-[#2563EB]/30 text-[#1E3A8A] text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                        ❓ Pertanyaan Umum
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-black text-[#0F172A]">
                        Pertanyaan & <span className="text-[#2563EB]">Jawaban Operasional</span>
                    </h2>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <div 
                            key={idx} 
                            className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition ${
                                faqOpen === idx ? 'border-[#2563EB] ring-2 ring-[#2563EB]/10' : 'border-slate-200'
                            }`}
                        >
                            <button 
                                onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                                className="w-full p-6 text-left font-bold text-[#0F172A] text-sm sm:text-base flex justify-between items-center gap-4 hover:text-[#2563EB] transition"
                            >
                                <span>{faq.q}</span>
                                <ChevronDown className={`w-5 h-5 text-[#2563EB] shrink-0 transition transform ${faqOpen === idx ? 'rotate-180' : ''}`} />
                            </button>

                            {faqOpen === idx && (
                                <div className="px-6 pb-6 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* ENTERPRISE FOOTER (NAVY #0F172A) */}
            <footer className="bg-[#0F172A] text-white border-t border-slate-800 pt-16 pb-12 px-4 md:px-8">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#60A5FA] rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md">
                                ⚡
                            </div>
                            <span className="font-black text-xl tracking-wider text-white">SYP GLASS</span>
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed max-w-sm">
                            PT Sinar Yaung Perkasa — Platform Operasional Enterprise & WMS Manufaktur Kaca Terintegrasi. Mengelola alur pemesanan toko, pemrosesan multi-divisi, pelacakan sisa kaca, dan pengiriman 4 rangkap.
                        </p>
                        <div className="flex items-center gap-3 text-xs text-slate-300 pt-2">
                            <span className="bg-[#1E3A8A] border border-blue-800 px-3 py-1 rounded-full text-slate-200">Laravel 11</span>
                            <span className="bg-[#1E3A8A] border border-blue-800 px-3 py-1 rounded-full text-slate-200">Inertia React</span>
                            <span className="bg-[#1E3A8A] border border-blue-800 px-3 py-1 rounded-full text-slate-200">Tailwind CSS</span>
                        </div>
                    </div>

                    <div className="space-y-3 text-xs">
                        <h4 className="font-bold text-white uppercase tracking-wider">Navigasi Utama</h4>
                        <ul className="space-y-2 text-slate-300">
                            <li><a href="#visualizer" className="hover:text-[#60A5FA] transition">Simulator Visualizer</a></li>
                            <li><a href="#kalkulator" className="hover:text-[#60A5FA] transition">Kalkulator Biaya Kaca</a></li>
                            <li><a href="#workflow" className="hover:text-[#60A5FA] transition">Alur 4 Divisi Produksi</a></li>
                            <li><a href="#wms-scrap" className="hover:text-[#60A5FA] transition">WMS Rak Scrap Glass</a></li>
                        </ul>
                    </div>

                    <div className="space-y-3 text-xs">
                        <h4 className="font-bold text-white uppercase tracking-wider">Divisi Operasional</h4>
                        <ul className="space-y-2 text-slate-300">
                            <li><span className="text-[#60A5FA] font-semibold">Admin Toko</span> — Transaksi SPO & DP</li>
                            <li><span className="text-[#60A5FA] font-semibold">Divisi HT</span> — Cutting & Tempering</li>
                            <li><span className="text-[#60A5FA] font-semibold">Divisi GM/BV/Etsa</span> — Finishing Edge</li>
                            <li><span className="text-[#60A5FA] font-semibold">QC & Logistics</span> — Surat Jalan 4 Warna</li>
                        </ul>
                    </div>

                    <div className="space-y-3 text-xs">
                        <h4 className="font-bold text-white uppercase tracking-wider">Akses Karyawan</h4>
                        <p className="text-slate-300">
                            Masuk menggunakan kredensial role karyawan untuk mengakses dashboard operasional.
                        </p>
                        {auth.user ? (
                            <Link href="/dashboard" className="inline-block bg-[#2563EB] text-white font-bold px-4 py-2 rounded-lg text-xs shadow-md">
                                Buka Dashboard ({auth.user.name})
                            </Link>
                        ) : (
                            <p className="text-slate-400 text-xs italic">Akses sistem internal khusus karyawan terdaftar.</p>
                        )}
                    </div>
                </div>

                <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-400 gap-4">
                    <p>© 2026 PT Sinar Yaung Perkasa (SYP Glass). All rights reserved.</p>
                    <div className="flex gap-6">
                        <span className="hover:text-slate-200">Privacy Policy</span>
                        <span className="hover:text-slate-200">Terms of Operational Standard</span>
                        <span className="hover:text-slate-200">System Security</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
