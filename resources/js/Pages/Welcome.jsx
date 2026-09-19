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
    ShieldCheck,
    LogOut,
    Cpu,
    TrendingUp,
    Sliders,
    Eye,
    Clock,
    CreditCard,
    Building2,
    Users,
    QrCode,
    ChevronRight,
    Award,
    CheckCircle
} from 'lucide-react';

export default function Welcome({ scrapCount = 14, totalOrders = 86 }) {
    const { auth } = usePage().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [interactiveTab, setInteractiveTab] = useState('visualizer'); // 'visualizer' | 'calculator'

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
            a: 'Order diawali oleh Admin Toko yang menginput spesifikasi kaca dan menerbitkan DP 50%. Selanjutnya order diteruskan ke Divisi HT (Pemotongan & Oven Tempering), lalu dilanjutkan ke Divisi GM/BV/Etsa untuk finishing tepi atau sandblast. Setelah lulus Quality Control (QC), barang disiapkan untuk pengiriman dengan 4 rangkap Surat Jalan (Putih, Merah, Kuning, Hijau) serta pelunasan sisa COD kasir.'
        },
        {
            q: 'Apa fungsi dari fitur Manajemen Rak Scrap WMS (Kaca Sisa Potongan)?',
            a: 'Fitur WMS Rak Scrap memungkinkan Divisi HT mencatat potongan kaca sisa yang masih berkualitas layak pakai lengkap dengan lokasi rak (misal: Rak A1, Rak B2). Ketika ada pesanan berukuran kecil, sistem secara cerdas merekomendasikan penggunaan kaca scrap ini sehingga menghemat konsumsi lembaran kaca baru dan menekan biaya bahan.'
        },
        {
            q: 'Apakah perhitungan di kalkulator estimasi ini akurat?',
            a: 'Kalkulator ini menggunakan formula matematika dan matriks tarif yang sinkron dengan sistem Admin Toko SYP Glass (menghitung Luas m², Keliling Finishing Tepi, Indeks Ketebalan, Jenis Kaca Dasar, dan Aksesoris). Estimasi biaya dapat langsung dijadikan acuan draf pesanan nyata.'
        },
        {
            q: 'Mengapa Surat Jalan menggunakan sistem 4 rangkap (Warna)?',
            a: 'Sistem 4 rangkap menjamin akuntabilitas operasional dan meminimalisir perselisihan barang: Lembar Putih untuk Arsip Admin/Keuangan, Lembar Merah untuk Tagihan & Pelunasan Pelanggan, Lembar Kuning untuk Divisi Gudang/Pabrik, serta Lembar Hijau sebagai bukti tanda terima pihak Driver / Ekspedisi.'
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-[#1b68b0] selection:text-white overflow-x-hidden">
            <Head title="UTB - Sistem Operasional Pabrik & Toko Kaca" />

            {/* 1. TOP NAVBAR */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 md:px-8 py-3 shadow-xs">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    {/* BRAND LOGO */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <img 
                            src="/assets/Logo_UTB.png" 
                            alt="Logo UTB" 
                            className="h-10 w-auto object-contain transform group-hover:scale-105 transition-transform duration-200" 
                        />
                        <div>
                            <div className="flex items-center gap-1.5">
                                <span className="font-black text-xl tracking-tight text-[#242222] group-hover:text-[#1b68b0] transition-colors">
                                    UTB
                                </span>
                            </div>
                            <span className="text-[10px] text-[#70b03c] font-extrabold tracking-wider block uppercase">
                                Kerja Praktek Mahasiswa
                            </span>
                        </div>
                    </Link>

                    {/* DESKTOP NAVIGATION LINKS */}
                    <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-600">
                        <a href="#features" className="hover:text-[#1b68b0] transition-colors py-1">
                            Keuntungan
                        </a>
                        <a href="#interactive-lab" className="hover:text-[#1b68b0] transition-colors py-1 flex items-center gap-1">
                             Material
                        </a>
                        <a href="#workflow" className="hover:text-[#1b68b0] transition-colors py-1">
                            Kemudahan
                        </a>
                        <a href="#wms-scrap" className="hover:text-[#1b68b0] transition-colors py-1">
                            Efisiensi
                        </a>
                        <a href="#faq" className="hover:text-[#1b68b0] transition-colors py-1">
                            Pertanyaan
                        </a>
                    </nav>

                    {/* CTA ACTION & MOBILE TOGGLE */}
                    <div className="flex items-center gap-3">
                        {auth.user ? (
                            <Link 
                                href="/dashboard" 
                                className="bg-[#70b03c] hover:bg-[#5f9733] text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-xs flex items-center gap-2 transition duration-200"
                            >
                                <Activity className="w-4 h-4 text-white" />
                                <span>Buka Dashboard ({auth.user.name})</span>
                            </Link>
                        ) : (
                            <Link 
                                href={route('login')} 
                                className="bg-[#1b68b0] hover:bg-[#15528c] text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md shadow-[#1b68b0]/20 transition flex items-center gap-1.5"
                            >
                                <span>Masuk ke Sistem</span>
                                <ArrowRight className="w-3.5 h-3.5" />
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
                    <div className="lg:hidden mt-3 pt-3 border-t border-slate-200 space-y-1.5 pb-2 px-2 animate-in slide-in-from-top-2 duration-150">
                        <a 
                            href="#features" 
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-[#1b68b0] transition"
                        >
                            <Layers className="w-4 h-4 text-[#1b68b0]" /> Modul Terintegrasi
                        </a>
                        <a 
                            href="#interactive-lab" 
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-[#1b68b0] transition"
                        >
                            <Sparkles className="w-4 h-4 text-[#70b03c]" /> Interactive Lab (Simulator & Kalkulator)
                        </a>
                        <a 
                            href="#workflow" 
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-[#1b68b0] transition"
                        >
                            <Factory className="w-4 h-4 text-[#1b68b0]" /> Alur 4 Divisi Produksi
                        </a>
                        <a 
                            href="#wms-scrap" 
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-[#1b68b0] transition"
                        >
                            <Boxes className="w-4 h-4 text-[#1b68b0]" /> WMS Scrap Rak
                        </a>
                        <a 
                            href="#faq" 
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-[#1b68b0] transition"
                        >
                            <HelpCircle className="w-4 h-4 text-[#1b68b0]" /> FAQ
                        </a>
                    </div>
                )}
            </header>

            {/* 2. HERO SECTION (CLEAN WHITE B2B SAAS SHOWCASE) */}
            <section className="relative px-4 md:px-8 pt-12 pb-16 md:pt-20 md:pb-24 max-w-7xl mx-auto">
                {/* AMBIENT GLOW */}
                <div className="absolute top-12 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[320px] bg-gradient-to-tr from-[#1b68b0]/10 via-[#70b03c]/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10"></div>

                <div className="text-center max-w-3xl mx-auto space-y-6">

                    {/* HERO HEADLINE */}
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] text-[#242222]">
                        Satu Platform Terpadu <span className="text-[#1b68b0]">Pabrik & Toko Kaca</span>
                    </h1>

                    {/* SUBHEADLINE */}
                    <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-normal max-w-2xl mx-auto">
                        Eleminasi salah potong dan miskomunikasi antar toko dan pabrik. Satu platform terintegrasi untuk mengotomasi alur Pesanan, pengerjaan 4 divisi presisi, inventaris, hingga distribusi Surat Jalan dan pelunasan COD.
                    </p>

                    {/* DUAL ACTION BUTTONS */}
                    <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
                        {auth.user ? (
                            <Link 
                                href="/dashboard" 
                                className="bg-[#1b68b0] hover:bg-[#15528c] text-white font-extrabold px-8 py-3.5 rounded-2xl shadow-xl shadow-[#1b68b0]/25 text-sm flex items-center gap-2.5 transition transform hover:-translate-y-0.5"
                            >
                                <Activity className="w-4 h-4" /> Buka Dashboard Operasional
                            </Link>
                        ) : (
                            <Link 
                                href={route('login')} 
                                className="bg-[#1b68b0] hover:bg-[#15528c] text-white font-extrabold px-8 py-3.5 rounded-2xl shadow-xl shadow-[#1b68b0]/25 text-sm flex items-center gap-2.5 transition transform hover:-translate-y-0.5"
                            >
                                <span>Mulai Sekarang</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        )}
                        <a 
                            href="#interactive-lab" 
                            className="bg-white hover:bg-slate-50 text-slate-800 font-bold px-6 py-3.5 rounded-2xl border border-slate-200 text-sm transition flex items-center gap-2 shadow-xs hover:border-[#1b68b0]"
                        >
                            <Sliders className="w-4 h-4 text-[#70b03c]" /> Coba Demo Interaktif
                        </a>
                    </div>
                </div>

                {/* 3. HERO SHOWCASE: MODERN APP PREVIEW CARD */}
                <div className="mt-14 max-w-5xl mx-auto">
                    <div className="relative rounded-3xl border border-slate-200/90 bg-white shadow-2xl overflow-hidden">
                        {/* WINDOW BAR */}
                        <div className="bg-slate-50/90 border-b border-slate-200/80 px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                                <span className="ml-2 text-[11px] font-mono font-medium text-slate-500">
                                    https://kerjapraktek.utb.ac.id/dashboard/orders
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Production Active
                                </span>
                            </div>
                        </div>

                        {/* PREVIEW CONTENT */}
                        <div className="p-5 sm:p-7 space-y-6 bg-slate-50/50">
                            {/* MINI TOP BAR */}
                            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
                                <div>
                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                                        Overview Operasional Pabrik & Toko
                                    </span>
                                    <h3 className="text-xl font-black text-[#242222]">
                                        Monitoring Alur Kerja & Pipeline Produksi
                                    </h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-white border border-slate-200 px-3 py-1 rounded-xl text-xs font-bold text-[#1b68b0] shadow-xs">
                                        Total {totalOrders} SPO Masuk
                                    </span>
                                    <span className="bg-[#70b03c]/10 border border-[#70b03c]/30 px-3 py-1 rounded-xl text-xs font-bold text-[#5f9733]">
                                        {scrapCount} Rak WMS Siap
                                    </span>
                                </div>
                            </div>

                            {/* 4 STAGE PRODUCTION PIPELINE SHOWCASE */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                                    <div className="flex items-center justify-between text-slate-400 mb-2">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Tahap 1</span>
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    <h4 className="font-bold text-sm text-[#242222]">Admin Toko & DP</h4>
                                    <p className="text-[11px] text-slate-500 mt-0.5">Input order SPO, validasi DP 50%, & draf negosiasi.</p>
                                </div>

                                <div className="bg-white p-3.5 rounded-2xl border-2 border-[#1b68b0] shadow-sm">
                                    <div className="flex items-center justify-between text-slate-400 mb-2">
                                        <span className="text-[10px] font-bold text-[#1b68b0] uppercase">Tahap 2</span>
                                        <Flame className="w-4 h-4 text-[#1b68b0]" />
                                    </div>
                                    <h4 className="font-bold text-sm text-[#242222]">Divisi HT (Cutting)</h4>
                                    <p className="text-[11px] text-slate-500 mt-0.5">Potong presisi lembaran kaca & alokasi sisa ke Rak Scrap.</p>
                                </div>

                                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                                    <div className="flex items-center justify-between text-slate-400 mb-2">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Tahap 3</span>
                                        <Wrench className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <h4 className="font-bold text-sm text-[#242222]">Divisi GM / BV / Etsa</h4>
                                    <p className="text-[11px] text-slate-500 mt-0.5">Gosok mesin halus, bevel artistik, & sandblast custom.</p>
                                </div>

                                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                                    <div className="flex items-center justify-between text-slate-400 mb-2">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Tahap 4</span>
                                        <Truck className="w-4 h-4 text-[#70b03c]" />
                                    </div>
                                    <h4 className="font-bold text-sm text-[#242222]">QC & Surat Jalan 4W</h4>
                                    <p className="text-[11px] text-slate-500 mt-0.5">Inspeksi akhir, surat jalan 4 warna, & setoran COD sopir.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. KEY METRICS & TRUST STRIP */}
            <section className="bg-white border-y border-slate-200 py-10 px-4 md:px-8">
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <div className="space-y-1">
                        <div className="text-3xl sm:text-4xl font-black text-[#1b68b0]">100%</div>
                        <div className="text-xs font-bold text-slate-700">Digitalisasi SPO & Draf</div>
                        <p className="text-[11px] text-slate-500">Tanpa formulir kertas manual</p>
                    </div>
                    <div className="space-y-1">
                        <div className="text-3xl sm:text-4xl font-black text-[#70b03c]">4 Divisi</div>
                        <div className="text-xs font-bold text-slate-700">Siklus Produksi Presisi</div>
                        <p className="text-[11px] text-slate-500">HT, GM, BV, dan Etsa Pattern</p>
                    </div>
                    <div className="space-y-1">
                        <div className="text-3xl sm:text-4xl font-black text-[#1b68b0]">34%</div>
                        <div className="text-xs font-bold text-slate-700">Efisiensi Bahan Kaca</div>
                        <p className="text-[11px] text-slate-500">Melalui optimasi WMS Rak Scrap</p>
                    </div>
                    <div className="space-y-1">
                        <div className="text-3xl sm:text-4xl font-black text-[#70b03c]">4 Rangkap</div>
                        <div className="text-xs font-bold text-slate-700">Surat Jalan Berwarna</div>
                        <p className="text-[11px] text-slate-500">Akuntabilitas ekspedisi & kasir</p>
                    </div>
                </div>
            </section>

            {/* 5. CORE CAPABILITIES (BENTO GRID - 4 PILAR MODUL) */}
            <section id="features" className="py-20 px-4 md:px-8 max-w-7xl mx-auto space-y-12">
                <div className="text-center space-y-3 max-w-2xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl font-black text-[#242222]">
                        Dirancang untuk Menjawab Kebutuhan Operasional Nyata
                    </h2>
                    <p className="text-slate-600 text-sm sm:text-base">
                        Setiap modul saling terhubung secara otomatis, menghilangkan miskomunikasi antar toko, pabrik, gudang, dan armada pengiriman.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* MODUL 1: ADMIN TOKO */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm hover:shadow-md transition">
                        <div className="w-12 h-12 rounded-2xl bg-[#1b68b0]/10 flex items-center justify-center text-[#1b68b0]">
                            <FileText className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-[#242222]">1. Admin Toko & Manajemen SPO</h3>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                            Menerbitkan Surat Pesanan Order (SPO) secara otomatis dengan perhitungan luas m², keliling gosok, aksesoris, dan verifikasi syarat DP minimal 50% sebelum diteruskan ke lantai produksi.
                        </p>
                        <div className="flex flex-wrap gap-2 pt-2">
                            <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-3 py-1 rounded-lg">Kalkulasi Otomatis</span>
                            <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-3 py-1 rounded-lg">Draf Negosiasi</span>
                            <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-3 py-1 rounded-lg">Validasi DP 50%</span>
                        </div>
                    </div>

                    {/* MODUL 2: MULTI-DIVISI PABRIK */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm hover:shadow-md transition">
                        <div className="w-12 h-12 rounded-2xl bg-[#70b03c]/10 flex items-center justify-center text-[#70b03c]">
                            <Factory className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-[#242222]">2. Disposisi Produksi 4 Divisi</h3>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                            Pelacakan pengerjaan bertahap dari Divisi HT (Pemotongan & Tempering), Divisi GM (Gosok Mesin), Divisi BV (Beveling 2cm), dan Divisi Etsa Sandblast dengan pencatatan waktu pengerjaan presisi.
                        </p>
                        <div className="flex flex-wrap gap-2 pt-2">
                            <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-3 py-1 rounded-lg">Potong Lembaran</span>
                            <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-3 py-1 rounded-lg">Finishing Bevel/GM</span>
                            <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-3 py-1 rounded-lg">QC Pemeriksaan</span>
                        </div>
                    </div>

                    {/* MODUL 3: SMART WMS SCRAP */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm hover:shadow-md transition">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                            <Boxes className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-[#242222]">3. Zero-Waste WMS Scrap Storage</h3>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                            Inovasi pengelolaan sisa potongan kaca yang masih layak pakai. Divisi HT mencatat lokasi rak (Rak A1, B2) dan sistem merekomendasikan penggunaan sisa kaca untuk pesanan ukuran kecil.
                        </p>
                        <div className="flex flex-wrap gap-2 pt-2">
                            <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-3 py-1 rounded-lg">Katalog Rak A1-B2</span>
                            <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-3 py-1 rounded-lg">Smart Recommendation</span>
                            <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-3 py-1 rounded-lg">Hemat Bahan Baku</span>
                        </div>
                    </div>

                    {/* MODUL 4: LOGISTIK & COD */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm hover:shadow-md transition">
                        <div className="w-12 h-12 rounded-2xl bg-[#1b68b0]/10 flex items-center justify-center text-[#1b68b0]">
                            <Truck className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-[#242222]">4. Ekspedisi Surat Jalan & Rekonsiliasi COD</h3>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                            Pencetakan Surat Jalan 4 Rangkap resmi, penugasan driver armada, pencatatan klaim operasional (bensin/tol), dan validasi pelunasan uang tunai COD kasir saat barang tiba.
                        </p>
                        <div className="flex flex-wrap gap-2 pt-2">
                            <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-3 py-1 rounded-lg">Surat Jalan 4 Rangkap</span>
                            <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-3 py-1 rounded-lg">Klaim Operasional Driver</span>
                            <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-3 py-1 rounded-lg">Kasir Pelunasan COD</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. UNIFIED INTERACTIVE LAB (SIMULATOR + KALKULATOR DALAM SATU WADAH ELEGAN) */}
            <section id="interactive-lab" className="py-20 px-4 md:px-8 bg-slate-100/70 border-y border-slate-200">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* SECTION TITLE */}
                    <div className="text-center space-y-3 max-w-2xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl font-black text-[#242222]">
                            Uji Karakteristik Material & Estimasi Biaya
                        </h2>
                        <p className="text-slate-600 text-xs sm:text-sm">
                            Pilih modul simulasi di bawah ini untuk melihat rendering visual kaca atau menghitung estimasi biaya riil orderan.
                        </p>

                        {/* TAB SWITCHER */}
                        <div className="inline-flex p-1.5 bg-white border border-slate-200 rounded-2xl shadow-xs mt-4">
                            <button
                                onClick={() => setInteractiveTab('visualizer')}
                                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                                    interactiveTab === 'visualizer'
                                        ? 'bg-[#1b68b0] text-white shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <Sparkles className="w-3.5 h-3.5" /> Simulator & Visualizer Kaca
                            </button>
                            <button
                                onClick={() => setInteractiveTab('calculator')}
                                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                                    interactiveTab === 'calculator'
                                        ? 'bg-[#1b68b0] text-white shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <Calculator className="w-3.5 h-3.5" /> Kalkulator Estimasi Biaya
                            </button>
                        </div>
                    </div>

                    {/* TAB CONTENT 1: VISUALIZER */}
                    {interactiveTab === 'visualizer' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch animate-in fade-in duration-200">
                            {/* CONTROLS SIDE PANEL */}
                            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                                <h3 className="font-bold text-base text-[#242222] flex items-center gap-2 border-b border-slate-200 pb-3">
                                    <Settings className="w-4 h-4 text-[#1b68b0]" /> Parameter Karakteristik Material
                                </h3>

                                {/* MATERIAL SELECTOR */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 block">1. Pilih Jenis Kaca:</label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {Object.entries(glassOptions).map(([key, item]) => (
                                            <button
                                                key={key}
                                                onClick={() => setGlassType(key)}
                                                className={`p-3 rounded-xl border text-left text-xs font-semibold transition flex justify-between items-center cursor-pointer ${
                                                    glassType === key 
                                                        ? 'border-[#1b68b0] bg-[#1b68b0]/10 text-[#1b68b0] shadow-xs' 
                                                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                                                }`}
                                            >
                                                <span>{item.name}</span>
                                                {glassType === key && <Check className="w-4 h-4 text-[#1b68b0]" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* THICKNESS SLIDER */}
                                <div className="space-y-2.5 pt-1">
                                    <div className="flex justify-between items-center text-xs">
                                        <label className="font-bold text-slate-700">2. Ketebalan Lembaran:</label>
                                        <span className="font-mono font-bold text-[#1b68b0] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                                            {thickness} mm
                                        </span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="3" 
                                        max="19" 
                                        value={thickness}
                                        onChange={(e) => setThickness(parseInt(e.target.value))}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1b68b0]"
                                    />
                                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                                        <span>3mm (Tipis)</span>
                                        <span>8mm (Standard)</span>
                                        <span>12mm (Partisi)</span>
                                        <span>19mm (Heavy)</span>
                                    </div>
                                </div>

                                {/* PROCESS TOGGLES */}
                                <div className="space-y-2 pt-1">
                                    <label className="text-xs font-bold text-slate-700 block">3. Opsi Proses Finishing:</label>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <button 
                                            onClick={() => setActiveProcesses(p => ({ ...p, ht: !p.ht }))}
                                            className={`p-2.5 rounded-xl border font-semibold flex items-center justify-between cursor-pointer ${
                                                activeProcesses.ht ? 'bg-[#1b68b0]/15 border-[#1b68b0] text-[#1b68b0]' : 'bg-slate-50 border-slate-200 text-slate-600'
                                            }`}
                                        >
                                            <span>Halus Tepi (HT)</span>
                                            {activeProcesses.ht && <Flame className="w-3.5 h-3.5 text-[#1b68b0]" />}
                                        </button>

                                        <button 
                                            onClick={() => setActiveProcesses(p => ({ ...p, gm: !p.gm }))}
                                            className={`p-2.5 rounded-xl border font-semibold flex items-center justify-between cursor-pointer ${
                                                activeProcesses.gm ? 'bg-[#1b68b0]/15 border-[#1b68b0] text-[#1b68b0]' : 'bg-slate-50 border-slate-200 text-slate-600'
                                            }`}
                                        >
                                            <span>Gosok Mesin (GM)</span>
                                            {activeProcesses.gm && <Wrench className="w-3.5 h-3.5 text-[#1b68b0]" />}
                                        </button>

                                        <button 
                                            onClick={() => setActiveProcesses(p => ({ ...p, bv: !p.bv }))}
                                            className={`p-2.5 rounded-xl border font-semibold flex items-center justify-between cursor-pointer ${
                                                activeProcesses.bv ? 'bg-[#1b68b0]/15 border-[#1b68b0] text-[#1b68b0]' : 'bg-slate-50 border-slate-200 text-slate-600'
                                            }`}
                                        >
                                            <span>Beveling (BV)</span>
                                            {activeProcesses.bv && <Maximize2 className="w-3.5 h-3.5 text-[#1b68b0]" />}
                                        </button>

                                        <button 
                                            onClick={() => setActiveProcesses(p => ({ ...p, etsa: !p.etsa }))}
                                            className={`p-2.5 rounded-xl border font-semibold flex items-center justify-between cursor-pointer ${
                                                activeProcesses.etsa ? 'bg-[#1b68b0]/15 border-[#1b68b0] text-[#1b68b0]' : 'bg-slate-50 border-slate-200 text-slate-600'
                                            }`}
                                        >
                                            <span>Sandblast / Etsa</span>
                                            {activeProcesses.etsa && <Sparkles className="w-3.5 h-3.5 text-[#1b68b0]" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* VISUALIZER DISPLAY PANEL */}
                            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-sm">
                                <div className="flex justify-between items-center text-xs border-b border-slate-200 pb-3">
                                    <span className="text-slate-500 font-mono">Render Simulasi Fisik Kaca</span>
                                    <div className="flex items-center gap-1.5">
                                        {activeProcesses.ht && <span className="bg-blue-50 text-[#1b68b0] border border-blue-200 px-2 py-0.5 rounded text-[10px] font-bold">HALUS TEPI HT</span>}
                                        {activeProcesses.bv && <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold">BEVEL 2CM</span>}
                                        {activeProcesses.etsa && <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded text-[10px] font-bold">ETSA SANDBLAST</span>}
                                    </div>
                                </div>

                                {/* GLASS SLAB RENDER */}
                                <div className="relative min-h-[300px] sm:min-h-[340px] rounded-2xl flex items-center justify-center p-8 transition-all duration-300 overflow-hidden shadow-inner border border-slate-200 bg-slate-100">
                                    <div 
                                        className={`absolute inset-4 transition-all duration-300 rounded-2xl ${glassOptions[glassType].style}`}
                                        style={{
                                            borderWidth: `${Math.min(10, Math.max(2, thickness / 2))}px`,
                                            backdropFilter: glassType === 'frosted' || activeProcesses.etsa ? 'blur(16px)' : 'blur(4px)'
                                        }}
                                    ></div>

                                    {/* LIGHT SHEEN */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-60 rounded-2xl pointer-events-none"></div>

                                    {/* SPEC INFO OVERLAY */}
                                    <div className="relative z-10 text-center space-y-3 max-w-sm">
                                        <div className="w-14 h-14 mx-auto rounded-2xl bg-white border border-[#1b68b0]/30 flex items-center justify-center text-[#1b68b0] shadow-sm">
                                            <Sparkles className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-[#242222]">
                                                {glassOptions[glassType].name}
                                            </h4>
                                            <p className="text-xs text-slate-600 font-mono mt-0.5">
                                                Ketebalan: {thickness} mm • Standar Manufaktur Presisi
                                            </p>
                                        </div>
                                        <div className="flex justify-center gap-2 text-[11px] pt-1">
                                            <span className="bg-white px-3 py-1 rounded-full border border-slate-200 text-slate-700 font-mono shadow-xs">
                                                Refraksi: 1.52 n
                                            </span>
                                            <span className="bg-white px-3 py-1 rounded-full border border-slate-200 text-[#1b68b0] font-mono font-bold shadow-xs">
                                                Massa: {(thickness * 2.5).toFixed(1)} kg/m²
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 flex flex-wrap justify-between items-center gap-2">
                                    <span>Standar Mutu Manufaktur: SNI / ISO Glass 2026</span>
                                    <button 
                                        onClick={() => setInteractiveTab('calculator')}
                                        className="text-[#1b68b0] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                                    >
                                        Buka Kalkulator Biaya Kaca Ini →
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB CONTENT 2: CALCULATOR */}
                    {interactiveTab === 'calculator' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-200">
                            {/* FORM SPECIFICATION */}
                            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
                                <h3 className="font-bold text-base text-[#242222] flex items-center gap-2 border-b border-slate-200 pb-3">
                                    <Calculator className="w-4 h-4 text-[#1b68b0]" /> Spesifikasi Dimensi & Kebutuhan
                                </h3>

                                {/* DIMENSIONS */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-700 block">Panjang Kaca (cm):</label>
                                        <input 
                                            type="number" 
                                            min="10"
                                            max="500"
                                            value={calcLength} 
                                            onChange={(e) => setCalcLength(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs font-mono focus:bg-white focus:border-[#1b68b0]" 
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-700 block">Lebar Kaca (cm):</label>
                                        <input 
                                            type="number" 
                                            min="10"
                                            max="500"
                                            value={calcWidth} 
                                            onChange={(e) => setCalcWidth(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs font-mono focus:bg-white focus:border-[#1b68b0]" 
                                        />
                                    </div>
                                </div>

                                {/* MATERIAL & THICKNESS */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-700 block">Jenis Kaca Dasar:</label>
                                        <select 
                                            value={calcGlassType} 
                                            onChange={(e) => setCalcGlassType(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs font-semibold focus:bg-white focus:border-[#1b68b0]"
                                        >
                                            {Object.entries(glassOptions).map(([key, item]) => (
                                                <option key={key} value={key}>{item.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-700 block">Ketebalan Kaca:</label>
                                        <select 
                                            value={calcThickness} 
                                            onChange={(e) => setCalcThickness(parseInt(e.target.value))}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs font-semibold focus:bg-white focus:border-[#1b68b0]"
                                        >
                                            <option value={5}>5 mm (Standard Bening)</option>
                                            <option value={8}>8 mm (Pintu/Partisi Kaca)</option>
                                            <option value={10}>10 mm (Kanopi & Balustrade)</option>
                                            <option value={12}>12 mm (Tempered Heavy)</option>
                                            <option value={15}>15 mm (Kaca Khusus Industri)</option>
                                        </select>
                                    </div>
                                </div>

                                {/* PROCESS SELECTION */}
                                <div className="space-y-2 pt-1">
                                    <label className="text-xs font-bold text-slate-700 block">Proses Finishing Kaca:</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                        {processCatalog.map(proc => (
                                            <button 
                                                key={proc.id}
                                                onClick={() => toggleProcessSelection(proc.id)}
                                                className={`p-3 rounded-xl border text-left transition flex justify-between items-center cursor-pointer ${
                                                    selectedProcesses.includes(proc.id)
                                                        ? 'bg-[#1b68b0]/10 border-[#1b68b0] text-[#1b68b0] font-semibold'
                                                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                                                }`}
                                            >
                                                <div>
                                                    <span className="block">{proc.name}</span>
                                                    <span className="text-[10px] text-slate-500 block">{proc.desc}</span>
                                                </div>
                                                {selectedProcesses.includes(proc.id) && <Check className="w-4 h-4 text-[#1b68b0] shrink-0 ml-2" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* ACCESSORY SELECTION */}
                                <div className="space-y-2 pt-1">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-slate-700 block">Aksesoris & Hardware Stok:</label>
                                        <span className="text-[10px] text-[#70b03c] font-bold">✓ Stok Terintegrasi</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                        {accessoryCatalog.slice(0, 6).map(acc => (
                                            <button 
                                                key={acc.id}
                                                onClick={() => toggleAccessorySelection(acc.id)}
                                                className={`p-2.5 rounded-xl border text-left transition flex justify-between items-center cursor-pointer ${
                                                    selectedAccessories.includes(acc.id)
                                                        ? 'bg-[#1b68b0]/10 border-[#1b68b0] text-[#1b68b0] font-semibold'
                                                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                                                }`}
                                            >
                                                <div className="truncate pr-2">
                                                    <span className="block truncate">{acc.name}</span>
                                                    <span className="text-[10px] text-[#1b68b0] font-semibold">Rp {acc.price.toLocaleString()}</span>
                                                </div>
                                                {selectedAccessories.includes(acc.id) && <Check className="w-4 h-4 text-[#1b68b0] shrink-0" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* COST BREAKDOWN CARD */}
                            <div className="lg:col-span-5 bg-white border border-slate-200 text-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
                                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Rincian Estimasi Biaya</span>
                                    <span className="bg-[#1b68b0]/10 text-[#1b68b0] text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                                        Kalkulasi Real-Time
                                    </span>
                                </div>

                                <div className="space-y-2.5 text-xs">
                                    <div className="flex justify-between text-slate-600">
                                        <span>Luas Area:</span>
                                        <span className="font-mono font-bold text-slate-800">{areaM2.toFixed(2)} m²</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span>Keliling Finishing:</span>
                                        <span className="font-mono font-bold text-slate-800">{perimeterM.toFixed(2)} meter</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span>Bahan Kaca Dasar:</span>
                                        <span className="font-mono font-semibold text-slate-800">Rp {baseGlassCost.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span>Finishing & Proses:</span>
                                        <span className="font-mono font-semibold text-slate-800">Rp {processCost.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span>Aksesoris Tambahan:</span>
                                        <span className="font-mono font-semibold text-slate-800">Rp {accessoryCost.toLocaleString()}</span>
                                    </div>

                                    <div className="border-t border-slate-200 pt-2.5 space-y-1.5">
                                        <div className="flex justify-between text-slate-700 font-semibold">
                                            <span>Syarat DP 50% (Awal):</span>
                                            <span className="font-mono text-amber-600 font-bold">Rp {dpAmount.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-slate-700 font-semibold">
                                            <span>Pelunasan Sisa COD (50%):</span>
                                            <span className="font-mono text-[#1b68b0] font-bold">Rp {(estimatedTotal - dpAmount).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* TOTAL HIGHLIGHT */}
                                <div className="bg-[#1b68b0]/10 p-4 rounded-2xl border border-[#1b68b0]/20 text-center space-y-1">
                                    <span className="text-[10px] text-slate-600 uppercase tracking-wider font-extrabold block">Total Estimasi Keseluruhan</span>
                                    <div className="text-3xl font-black text-[#1b68b0]">
                                        Rp {estimatedTotal.toLocaleString()}
                                    </div>
                                    <span className="text-[10px] text-slate-500 block">
                                        *Termasuk estimasi PPN 11% & Jaminan Garansi Manufaktur
                                    </span>
                                </div>

                                {auth.user ? (
                                    <Link 
                                        href="/dashboard" 
                                        className="w-full bg-[#70b03c] hover:bg-[#5f9733] text-white font-extrabold py-3 rounded-xl text-center text-xs shadow-md transition flex items-center justify-center gap-2"
                                    >
                                        <FileText className="w-4 h-4" /> Buka Dashboard & Buat SPO Resmi
                                    </Link>
                                ) : (
                                    <Link 
                                        href={route('login')} 
                                        className="w-full bg-[#1b68b0] hover:bg-[#15528c] text-white font-extrabold py-3 rounded-xl text-center text-xs shadow-md transition flex items-center justify-center gap-2"
                                    >
                                        <span>Masuk untuk Buat Pesanan SPO</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* 7. WORKFLOW ALUR 4 DIVISI PRODUKSI */}
            <section id="workflow" className="py-20 px-4 md:px-8 max-w-7xl mx-auto space-y-12">
                <div className="text-center space-y-3 max-w-2xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl font-black text-[#242222]">
                        4 Tahapan Transparan dari Draf Sampai Pengiriman
                    </h2>
                    <p className="text-slate-600 text-sm">
                        Setiap pesanan terpantau secara real-time melalui 4 divisi dengan batasan role dan akuntabilitas jelas.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 shadow-sm hover:shadow-md transition">
                        <div className="w-10 h-10 rounded-xl bg-[#1b68b0]/10 text-[#1b68b0] flex items-center justify-center font-black text-sm">
                            01
                        </div>
                        <h3 className="font-bold text-base text-[#242222]">Admin Toko & Sales</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Menerima kebutuhan customer, menerbitkan nomor SPO, dan mengonfirmasi pelunasan DP 50% sebelum mengirimkan instruksi potong.
                        </p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 shadow-sm hover:shadow-md transition">
                        <div className="w-10 h-10 rounded-xl bg-[#1b68b0] text-white flex items-center justify-center font-black text-sm">
                            02
                        </div>
                        <h3 className="font-bold text-base text-[#242222]">Divisi HT (Cutting)</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Pemotongan lembaran kaca secara presisi. Sisa potongan layak pakai langsung dialokasikan ke Rak Scrap WMS, lalu masuk ke oven tempering.
                        </p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 shadow-sm hover:shadow-md transition">
                        <div className="w-10 h-10 rounded-xl bg-[#70b03c]/10 text-[#70b03c] flex items-center justify-center font-black text-sm">
                            03
                        </div>
                        <h3 className="font-bold text-base text-[#242222]">Divisi GM / BV / Etsa</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Finishing tepi kaca dengan Gosok Mesin (GM), lekukan Bevel 2cm artistik, dan ornamen ukiran sandblast etsa custom sesuai spesifikasi.
                        </p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 shadow-sm hover:shadow-md transition">
                        <div className="w-10 h-10 rounded-xl bg-[#70b03c] text-white flex items-center justify-center font-black text-sm">
                            04
                        </div>
                        <h3 className="font-bold text-base text-[#242222]">QC & Surat Jalan 4W</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Pemeriksaan cacat fisik (QC), pencetakan 4 lembar Surat Jalan resmi, armada logistik, dan verifikasi pelunasan COD kasir.
                        </p>
                    </div>
                </div>
            </section>

            {/* 8. WMS SCRAP GLASS SPOTLIGHT */}
            <section id="wms-scrap" className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="bg-gradient-to-r from-[#1b68b0] to-[#15528c] text-white rounded-3xl p-8 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-xl">
                    <div className="lg:col-span-7 space-y-5">
                        <h2 className="text-3xl sm:text-4xl font-black">
                            Manajemen Smart WMS Rak Kaca Sisa Potongan
                        </h2>
                        <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
                            Pabrik mengeliminasi pembuangan sisa potongan kaca bernilai tinggi. Melalui sistem WMS Rak Scrap, potongan kaca dicatat oleh Divisi HT dan secara otomatis direkomendasikan saat ada order kaca kecil.
                        </p>
                        <div className="flex flex-wrap gap-4 pt-2">
                            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-xs font-mono">
                                <span className="text-blue-200 block text-[11px]">Stok Scrap Ready:</span>
                                <span className="text-white font-bold text-lg">{scrapCount} Lembar Terdata</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-xs font-mono">
                                <span className="text-blue-200 block text-[11px]">Efisiensi Bahan Kaca:</span>
                                <span className="text-white font-bold text-lg">+34% Penghematan</span>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5 bg-white text-slate-800 rounded-2xl p-5 space-y-3 shadow-lg">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-2.5 text-xs">
                            <span className="font-extrabold text-[#242222]">Contoh Rak WMS Monitoring</span>
                            <span className="text-[#1b68b0] font-mono text-[10px] font-bold">Sinkronisasi Pabrik</span>
                        </div>
                        <div className="space-y-2 text-xs">
                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                                <div>
                                    <span className="font-bold text-[#242222] block">Rak A-01 (Kaca Bening)</span>
                                    <span className="text-slate-500 text-[10px]">Clear Float 8mm • 120 x 85 cm</span>
                                </div>
                                <span className="bg-[#70b03c] text-white font-bold px-2 py-0.5 rounded text-[10px]">
                                    SIAP PAKAI
                                </span>
                            </div>
                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                                <div>
                                    <span className="font-bold text-[#242222] block">Rak B-03 (Dark Grey)</span>
                                    <span className="text-slate-500 text-[10px]">Tinted Grey 10mm • 90 x 60 cm</span>
                                </div>
                                <span className="bg-[#70b03c] text-white font-bold px-2 py-0.5 rounded text-[10px]">
                                    SIAP PAKAI
                                </span>
                            </div>
                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                                <div>
                                    <span className="font-bold text-[#242222] block">Rak C-02 (Bronze Mirror)</span>
                                    <span className="text-slate-500 text-[10px]">Reflektif 6mm • 150 x 50 cm</span>
                                </div>
                                <span className="bg-[#70b03c] text-white font-bold px-2 py-0.5 rounded text-[10px]">
                                    SIAP PAKAI
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 9. FAQ SECTION */}
            <section id="faq" className="py-20 px-4 md:px-8 max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-3">
                    <h2 className="text-3xl sm:text-4xl font-black text-[#242222]">
                        Pertanyaan & Jawaban Seputar Sistem
                    </h2>
                </div>

                <div className="space-y-3">
                    {faqs.map((faq, idx) => (
                        <div 
                            key={idx} 
                            className={`bg-white border rounded-2xl overflow-hidden shadow-xs transition ${
                                faqOpen === idx ? 'border-[#1b68b0] ring-2 ring-[#1b68b0]/15' : 'border-slate-200'
                            }`}
                        >
                            <button 
                                onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                                className="w-full p-5 text-left font-bold text-[#242222] text-sm sm:text-base flex justify-between items-center gap-4 hover:text-[#1b68b0] transition cursor-pointer"
                            >
                                <span>{faq.q}</span>
                                <ChevronDown className={`w-5 h-5 text-[#1b68b0] shrink-0 transition transform ${faqOpen === idx ? 'rotate-180' : ''}`} />
                            </button>

                            {faqOpen === idx && (
                                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* 10. BOTTOM CTA BANNER */}
            <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 text-center space-y-6 shadow-xl">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-[#1b68b0]/10 text-[#1b68b0] flex items-center justify-center">
                        <Activity className="w-7 h-7" />
                    </div>
                    <div className="space-y-2 max-w-xl mx-auto">
                        <h3 className="text-2xl sm:text-3xl font-black text-[#242222]">
                            Siap Meningkatkan keuntungan Perusahaan?
                        </h3>
                        <p className="text-slate-600 text-xs sm:text-sm">
                            Masuk menggunakan akun staf atau karyawan Anda untuk mengelola orderan toko, alur pengerjaan divisi, stok inventaris, dan pengiriman.
                        </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 pt-2">
                        {auth.user ? (
                            <Link 
                                href="/dashboard" 
                                className="bg-[#70b03c] hover:bg-[#5f9733] text-white font-extrabold px-8 py-3.5 rounded-2xl text-xs shadow-md transition"
                            >
                                Buka Dashboard ({auth.user.name})
                            </Link>
                        ) : (
                            <Link 
                                href={route('login')} 
                                className="bg-[#1b68b0] hover:bg-[#15528c] text-white font-extrabold px-8 py-3.5 rounded-2xl text-xs shadow-md transition flex items-center gap-2"
                            >
                                <span>Mulai Sekarang</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* 11. ENTERPRISE FOOTER */}
            <footer className="bg-white text-slate-700 border-t border-slate-200 pt-14 pb-10 px-4 md:px-8">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-slate-200">
                    <div className="lg:col-span-2 space-y-3">
                        <div className="flex items-center gap-3">
                            <img src="/assets/Logo_UTB.png" alt="Logo UTB" className="h-9 w-auto object-contain" />
                            <div>
                                <span className="font-black text-lg tracking-wider text-[#242222] block">UTB</span>
                                <span className="text-[10px] text-[#70b03c] font-extrabold uppercase tracking-wider block">Kerja Praktek</span>
                            </div>
                        </div>
                        <p className="text-slate-500 text-xs leading-relaxed max-w-sm">
                            Universitas Teknologi Bandung (UTB) — Sistem Informasi Manajemen Operasional Pabrik & Toko Kaca Terintegrasi. Menghubungkan front-office toko, pemrosesan 4 divisi presisi, optimalisasi sisa bahan kaca, dan logistik 4 rangkap.
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                            <span className="bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md font-semibold">Sidik</span>
                            <span className="bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md font-semibold">Hendri</span>
                            <span className="bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md font-semibold">Rizky</span>
                        </div>
                    </div>

                    <div className="space-y-2.5 text-xs">
                        <h4 className="font-bold text-[#242222] uppercase tracking-wider">Navigasi Utama</h4>
                        <ul className="space-y-1.5 text-slate-600">
                            <li><a href="#features" className="hover:text-[#1b68b0] transition">Modul Terintegrasi</a></li>
                            <li><a href="#interactive-lab" className="hover:text-[#1b68b0] transition">Interactive Lab</a></li>
                            <li><a href="#workflow" className="hover:text-[#1b68b0] transition">Alur 4 Divisi Produksi</a></li>
                            <li><a href="#wms-scrap" className="hover:text-[#1b68b0] transition">WMS Rak Scrap Glass</a></li>
                        </ul>
                    </div>

                    <div className="space-y-2.5 text-xs">
                        <h4 className="font-bold text-[#242222] uppercase tracking-wider">Divisi Pabrik</h4>
                        <ul className="space-y-1.5 text-slate-600">
                            <li><span className="text-[#1b68b0] font-semibold">Admin Toko</span> — Transaksi SPO & DP</li>
                            <li><span className="text-[#1b68b0] font-semibold">Divisi HT</span> — Cutting & Tempering</li>
                            <li><span className="text-[#1b68b0] font-semibold">Divisi GM/BV/Etsa</span> — Finishing Edge</li>
                            <li><span className="text-[#70b03c] font-semibold">QC & Logistics</span> — Surat Jalan 4 Warna</li>
                        </ul>
                    </div>

                    <div className="space-y-2.5 text-xs">
                        <h4 className="font-bold text-[#242222] uppercase tracking-wider">Akses Karyawan</h4>
                        <p className="text-slate-500 text-[11px]">
                            Gunakan kredensial akun terdaftar untuk masuk ke dashboard operasional.
                        </p>
                        {auth.user ? (
                            <Link href="/dashboard" className="inline-block bg-[#70b03c] hover:bg-[#5f9733] text-white font-bold px-3.5 py-1.5 rounded-lg text-xs shadow-xs">
                                Dashboard ({auth.user.name})
                            </Link>
                        ) : (
                            <Link href={route('login')} className="inline-block bg-[#1b68b0] hover:bg-[#15528c] text-white font-bold px-3.5 py-1.5 rounded-lg text-xs shadow-xs">
                                Masuk ke Sistem
                            </Link>
                        )}
                    </div>
                </div>

                <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-500 gap-3">
                    <p>© 2026 Universitas Teknologi Bandung (UTB) — Proyek Kerja Praktek Sistem Informasi Manufaktur Kaca. All rights reserved.</p>
                    <div className="flex gap-4">
                        <span className="hover:text-[#1b68b0]">Standard Operating Procedure</span>
                        <span className="hover:text-[#1b68b0]">System Security</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
