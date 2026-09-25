import React, { useState, useEffect, useRef } from 'react';
import {
    X,
    Download,
    ZoomIn,
    ZoomOut,
    RotateCw,
    RefreshCw,
    Sun,
    Moon,
    ExternalLink,
    FileText,
    Layers,
    Boxes,
    Sparkles,
    Package,
    Wrench,
    FileCheck,
    Receipt,
    AlertTriangle,
    Info,
    Tag,
    Maximize2,
    Calendar,
    User,
    Truck,
    MapPin,
    Hash,
    CheckCircle2
} from 'lucide-react';

// Konfigurasi Keterangan & Identitas Berdasarkan Jenis Tabel / Sumber Gambar
export const LIGHTBOX_TYPE_CONFIG = {
    order: {
        badge: 'Sketsa Pesanan SPO',
        badgeColor: 'bg-blue-50 text-[#1b68b0] border-blue-200',
        iconBg: 'bg-[#1b68b0]/10 text-[#1b68b0] border-[#1b68b0]/20',
        icon: FileText,
        defaultTitle: 'Sketsa Pola & Gambar Sambungan Kaca',
        titlePrefix: 'No. SPO',
        defaultDescription: 'Acuan gambar sketsa pola fisik, spesifikasi potongan, dan posisi sambungan kaca pesanan pelanggan. Menjadi patokan utama bagi tim Gudang dan Pabrik untuk memproses pesanan sesuai instruksi Surat Perintah Order (SPO).',
        tableLabel: 'Tabel Pemesanan Kaca (SPO)',
    },
    production: {
        badge: 'Sketsa Produksi SPK',
        badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        iconBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        icon: Layers,
        defaultTitle: 'Gambar Kerja & Panduan Divisi Pabrik',
        titlePrefix: 'No. SPO',
        defaultDescription: 'Acuan teknis pengerjaan pola pemotongan, posisi sambungan kaca, dan toleransi pengerjaan bagi operator divisi (Potong/HT, Gosok/GM, Bevel/BV, Etsa). Operator divisi wajib memverifikasi dimensi fisik kaca sebelum proses eksekusi.',
        tableLabel: 'Tabel Antrean & Eksekusi Divisi Produksi',
    },
    stock: {
        badge: 'Stok Kaca Lembaran',
        badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: Boxes,
        defaultTitle: 'Foto Fisik Stok Lembaran Bahan Kaca',
        titlePrefix: 'Nama Kaca',
        defaultDescription: 'Dokumentasi visual fisik lembaran bahan kaca di rak penyimpanan gudang utama. Digunakan untuk memeriksa ketebalan, warna/corak kaca, kebersihan permukaan, dan kesesuaian fisik stok sebelum dipotong ke mesin potong.',
        tableLabel: 'Tabel Stok Kaca Lembaran & Gudang',
    },
    accessory: {
        badge: 'Katalog Aksesoris & Hardware',
        badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
        iconBg: 'bg-purple-50 text-purple-700 border-purple-200',
        icon: Sparkles,
        defaultTitle: 'Foto Sampel Aksesoris & Hardware Kaca',
        titlePrefix: 'Aksesoris',
        defaultDescription: 'Foto sampel katalog fisik aksesoris dan hardware pemasangan kaca (handle pintu, engsel shower, patch fitting, spider fitting, sealant). Digunakan untuk memastikan kecocokan tipe part, merk, finishing, dan kelengkapan set.',
        tableLabel: 'Tabel Stok Aksesoris & Hardware Toko',
    },
    supply: {
        badge: 'Bahan Pembantu Gudang',
        badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
        iconBg: 'bg-sky-50 text-sky-700 border-sky-200',
        icon: Package,
        defaultTitle: 'Foto Fisik Perlengkapan & Bahan Pembantu',
        titlePrefix: 'Barang',
        defaultDescription: 'Dokumentasi visual barang habis pakai operasional pabrik (mata potong toyo, lem silikon kaca, amplas gosok, lakban, minyak potong). Digunakan untuk identifikasi spesifikasi produk saat restock dan pengambilan harian.',
        tableLabel: 'Tabel Perlengkapan & Consumables Pabrik',
    },
    tool: {
        badge: 'Inventaris Alat & Mesin',
        badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
        iconBg: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: Wrench,
        defaultTitle: 'Foto Fisik Alat Kerja & Mesin Penunjang',
        titlePrefix: 'Nama Alat',
        defaultDescription: 'Foto dokumentasi fisik unit mesin dan peralatan kerja teknisi pabrik. Digunakan untuk identifikasi unit inventaris, inspeksi kondisi fisik, pencatatan peminjaman teknisi, serta riwayat pemeliharaan/servis.',
        tableLabel: 'Tabel Master Alat Penunjang & Teknisi',
    },
    delivery_proof: {
        badge: 'Bukti Serah Terima Surat Jalan',
        badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: FileCheck,
        defaultTitle: 'Foto Bukti Fisik Surat Jalan Tanda Tangan',
        titlePrefix: 'No. SPO',
        defaultDescription: 'Dokumentasi foto fisik lembar surat jalan yang telah ditandatangani dan/atau distempel oleh pihak penerima/pelanggan di alamat pengantaran. Berfungsi sebagai bukti sah serah terima barang pesanan telah tuntas.',
        tableLabel: 'Tabel Pengiriman & Surat Jalan Driver',
    },
    receipt: {
        badge: 'Struk Klaim Operasional Armada',
        badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
        iconBg: 'bg-teal-50 text-teal-700 border-teal-200',
        icon: Receipt,
        defaultTitle: 'Foto Struk / Nota Kuitansi Pengeluaran Driver',
        titlePrefix: 'No. Transaksi',
        defaultDescription: 'Foto bukti fisik struk kuitansi resmi (BBM, Tol, Parkir, Tambal Ban) yang dilampirkan oleh driver armada pengiriman untuk verifikasi dan validasi pencairan klaim kas operasional oleh bagian Keuangan.',
        tableLabel: 'Tabel Klaim Operasional Pengemudi',
    },
    complaint: {
        badge: 'Laporan Kaca Cacat / Baret',
        badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
        iconBg: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: AlertTriangle,
        defaultTitle: 'Foto Bukti Kerusakan / Cacat Kaca Produksi',
        titlePrefix: 'No. SPO',
        defaultDescription: 'Dokumentasi visual cacat fisik atau goresan pada kaca yang dilaporkan saat proses produksi. Menjadi dasar pertimbangan bagi Admin Gudang untuk menentukan disposisi (Potong Ulang, Ganti Kaca Baru, atau Lanjut).',
        tableLabel: 'Laporan Kendala Kaca Cacat Divisi',
    },
};

export const resolveLightboxType = (type, title = '', url = '') => {
    if (type && LIGHTBOX_TYPE_CONFIG[type]) return type;
    const lowerTitle = (title || '').toLowerCase();
    const lowerUrl = (url || '').toLowerCase();

    if (lowerTitle.includes('struk') || lowerTitle.includes('nota') || lowerTitle.includes('klaim') || lowerUrl.includes('receipt')) {
        return 'receipt';
    }
    if (lowerTitle.includes('surat jalan') || lowerTitle.includes('ttd') || lowerTitle.includes('penerima') || lowerUrl.includes('proof')) {
        return 'delivery_proof';
    }
    if (lowerTitle.includes('cacat') || lowerTitle.includes('baret') || lowerTitle.includes('pecah') || lowerUrl.includes('complaint')) {
        return 'complaint';
    }
    if (lowerTitle.includes('alat') || lowerTitle.includes('mesin') || lowerUrl.includes('tool')) {
        return 'tool';
    }
    if (lowerTitle.includes('perlengkapan') || lowerTitle.includes('habis pakai') || lowerUrl.includes('suppl')) {
        return 'supply';
    }
    if (lowerTitle.includes('aksesoris') || lowerTitle.includes('fitting') || lowerTitle.includes('hardware') || lowerUrl.includes('acc')) {
        return 'accessory';
    }
    if (lowerTitle.includes('kaca lembaran') || lowerTitle.includes('bahan kaca') || lowerTitle.includes('scrap') || lowerTitle.includes('sisa') || lowerUrl.includes('stock')) {
        return 'stock';
    }
    if (lowerTitle.includes('spk') || lowerTitle.includes('produksi') || lowerTitle.includes('divisi')) {
        return 'production';
    }
    return 'order';
};

export default function ImageLightboxModal({
    isOpen,
    onClose,
    url,
    title,
    type,
    subtitle,
    description,
    badge,
    metadata = {}
}) {
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [isDarkCanvas, setIsDarkCanvas] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

    // Reset controls saat gambar baru dibuka
    useEffect(() => {
        if (isOpen) {
            setZoom(1);
            setRotation(0);
            setPosition({ x: 0, y: 0 });
            setImageLoaded(false);
            setImageError(false);
        }
    }, [isOpen, url]);

    // Keyboard shortcuts (Escape, Zoom, Rotate, Reset)
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === '+' || e.key === '=') {
                e.preventDefault();
                setZoom(prev => Math.min(3.5, Math.round((prev + 0.25) * 100) / 100));
            } else if (e.key === '-' || e.key === '_') {
                e.preventDefault();
                setZoom(prev => Math.max(0.5, Math.round((prev - 0.25) * 100) / 100));
            } else if (e.key.toLowerCase() === 'r') {
                e.preventDefault();
                setRotation(prev => (prev + 90) % 360);
            } else if (e.key === '0') {
                e.preventDefault();
                setZoom(1);
                setRotation(0);
                setPosition({ x: 0, y: 0 });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen || !url) return null;

    const resolvedType = resolveLightboxType(type, title, url);
    const config = LIGHTBOX_TYPE_CONFIG[resolvedType] || LIGHTBOX_TYPE_CONFIG.order;
    const IconComponent = config.icon;

    // Subtitle formatted
    const cleanTitle = (title || '').replace(/^Sample\s+/i, '').trim();
    const displaySubtitle = subtitle || (cleanTitle ? `${config.titlePrefix}: ${cleanTitle}` : config.tableLabel);
    const displayDescription = description || config.defaultDescription;
    const displayBadge = badge || config.badge;

    // Zoom handlers
    const handleZoomIn = () => setZoom(prev => Math.min(3.5, Math.round((prev + 0.25) * 100) / 100));
    const handleZoomOut = () => setZoom(prev => Math.max(0.5, Math.round((prev - 0.25) * 100) / 100));
    const handleRotate = () => setRotation(prev => (prev + 90) % 360);
    const handleReset = () => {
        setZoom(1);
        setRotation(0);
        setPosition({ x: 0, y: 0 });
    };

    // Pan / Drag handlers when zoomed
    const handleMouseDown = (e) => {
        if (zoom <= 1) return;
        setIsDragging(true);
        dragStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            posX: position.x,
            posY: position.y
        };
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        setPosition({
            x: dragStartRef.current.posX + dx,
            y: dragStartRef.current.posY + dy
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const fileName = url.split('/').pop() || 'gambar';

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-xs z-[120] flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150"
            onClick={onClose}
        >
            <div
                className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden text-slate-800 animate-in zoom-in-95 duration-150"
                onClick={e => e.stopPropagation()}
            >
                {/* 1. HEADER MODAL (Clean White Enterprise SaaS / ERP) */}
                <div className="p-3.5 sm:p-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${config.iconBg}`}>
                            <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider font-mono border ${config.badgeColor}`}>
                                    {displayBadge}
                                </span>
                                <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">•</span>
                                <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                                    {config.tableLabel}
                                </span>
                            </div>
                            <h3 className="font-extrabold text-[#242222] text-sm sm:text-base leading-tight mt-0.5 truncate max-w-sm sm:max-w-lg">
                                {config.defaultTitle}
                            </h3>
                            <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">
                                {displaySubtitle}
                            </p>
                        </div>
                    </div>

                    {/* Toolbar Aksi Header */}
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        {/* Download button */}
                        <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            download={fileName}
                            className="bg-[#1b68b0] hover:bg-[#15528c] text-white font-bold px-3 py-1.5 rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                            title="Unduh file gambar ke komputer"
                        >
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Unduh</span>
                        </a>

                        {/* Open Original in New Tab */}
                        <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-600 hover:text-[#1b68b0] hover:bg-blue-50 border border-slate-200 rounded-xl p-2 transition cursor-pointer"
                            title="Buka gambar ukuran penuh di tab baru"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </a>

                        {/* Close Button */}
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl p-2 transition cursor-pointer"
                            title="Tutup (Esc)"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* 2. CANVAS / AREA PENAMPIL GAMBAR */}
                <div 
                    className={`flex-1 relative overflow-hidden flex items-center justify-center select-none transition-colors duration-200 min-h-[360px] max-h-[62vh] ${
                        isDarkCanvas 
                            ? 'bg-slate-950 text-white' 
                            : 'bg-slate-100/90 text-slate-800'
                    } ${isDragging ? 'cursor-grabbing' : zoom > 1 ? 'cursor-grab' : 'cursor-default'}`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    style={{
                        backgroundImage: isDarkCanvas
                            ? 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)'
                            : 'radial-gradient(rgba(0, 0, 0, 0.08) 1px, transparent 1px)',
                        backgroundSize: '18px 18px',
                    }}
                >
                    {/* Floating Controls Bar On-Screen */}
                    <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl p-1 shadow-lg text-slate-700">
                        {/* Canvas Dark/Light Toggle */}
                        <button
                            type="button"
                            onClick={() => setIsDarkCanvas(prev => !prev)}
                            className="p-1.5 rounded-xl hover:bg-slate-100 transition text-slate-600 cursor-pointer"
                            title={isDarkCanvas ? 'Ganti ke latar terang' : 'Ganti ke latar gelap (kontras kaca/sketsa)'}
                        >
                            {isDarkCanvas ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-700" />}
                        </button>

                        <div className="w-[1px] h-4 bg-slate-200 mx-0.5" />

                        {/* Zoom Out */}
                        <button
                            type="button"
                            onClick={handleZoomOut}
                            disabled={zoom <= 0.5}
                            className="p-1.5 rounded-xl hover:bg-slate-100 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="Perkecil (-)"
                        >
                            <ZoomOut className="w-4 h-4" />
                        </button>

                        {/* Current Zoom Percentage */}
                        <button
                            type="button"
                            onClick={handleReset}
                            className="px-2 py-0.5 rounded-lg hover:bg-slate-100 font-mono text-[11px] font-bold text-slate-700 transition cursor-pointer"
                            title="Klik untuk reset zoom ke 100%"
                        >
                            {Math.round(zoom * 100)}%
                        </button>

                        {/* Zoom In */}
                        <button
                            type="button"
                            onClick={handleZoomIn}
                            disabled={zoom >= 3.5}
                            className="p-1.5 rounded-xl hover:bg-slate-100 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="Perbesar (+)"
                        >
                            <ZoomIn className="w-4 h-4" />
                        </button>

                        <div className="w-[1px] h-4 bg-slate-200 mx-0.5" />

                        {/* Rotate Clockwise */}
                        <button
                            type="button"
                            onClick={handleRotate}
                            className="p-1.5 rounded-xl hover:bg-slate-100 transition text-slate-700 cursor-pointer"
                            title="Putar 90° Searah Jarum Jam (R)"
                        >
                            <RotateCw className="w-4 h-4" />
                        </button>

                        {/* Reset All */}
                        <button
                            type="button"
                            onClick={handleReset}
                            className="p-1.5 rounded-xl hover:bg-slate-100 transition text-slate-700 cursor-pointer"
                            title="Reset Tampilan (0)"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Hint Pan Saat Zoom */}
                    {zoom > 1 && (
                        <div className="absolute bottom-3 left-3 z-20 bg-slate-900/75 backdrop-blur-xs text-white text-[10px] font-medium px-2.5 py-1 rounded-xl shadow-md pointer-events-none flex items-center gap-1.5 animate-in fade-in">
                            <Maximize2 className="w-3 h-3 text-sky-400" />
                            <span>Tahan & geser mouse untuk menggeser gambar</span>
                        </div>
                    )}

                    {/* Image Element with Transform */}
                    {imageError ? (
                        <div className="p-8 text-center space-y-2 max-w-sm">
                            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <h4 className="font-bold text-slate-800 text-sm">Gagal Memuat Gambar</h4>
                            <p className="text-xs text-slate-500">
                                File gambar lampiran tidak ditemukan atau format file tidak didukung oleh browser.
                            </p>
                            <a
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-block mt-2 text-xs font-bold text-[#1b68b0] hover:underline"
                            >
                                Coba buka langsung via URL
                            </a>
                        </div>
                    ) : (
                        <div
                            className="transition-transform duration-100 ease-out will-change-transform flex items-center justify-center"
                            style={{
                                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                            }}
                        >
                            <img
                                src={url}
                                alt={displaySubtitle}
                                onLoad={() => setImageLoaded(true)}
                                onError={() => setImageError(true)}
                                className={`max-w-full max-h-[56vh] object-contain rounded-xl transition-opacity duration-200 ${
                                    isDarkCanvas ? 'shadow-2xl' : 'shadow-lg border border-slate-200/80 bg-white'
                                } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                                draggable={false}
                            />
                        </div>
                    )}
                </div>

                {/* 3. FOOTER KETERANGAN KHUSUS JENIS TABEL */}
                <div className="bg-slate-50 border-t border-slate-200 p-3.5 sm:p-4 space-y-2.5 shrink-0 text-slate-700">
                    {/* Teks Keterangan Dinamis */}
                    <div className="flex items-start gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-blue-100 text-[#1b68b0] flex items-center justify-center shrink-0 mt-0.5">
                            <Info className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-[#242222] text-xs">
                                    Keterangan Lampiran {displayBadge}:
                                </span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                                {displayDescription}
                            </p>
                        </div>
                    </div>

                    {/* Metadata Chips Dinamis Berdasarkan Konteks */}
                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between flex-wrap gap-2 text-[11px] font-mono">
                        <div className="flex items-center gap-2 flex-wrap text-slate-600">
                            {/* Render Specific Metadata Chips */}
                            {metadata.customerName && (
                                <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1 text-slate-700">
                                    <User className="w-3 h-3 text-[#1b68b0]" /> Pelanggan: <strong>{metadata.customerName}</strong>
                                </span>
                            )}
                            {metadata.itemCode && (
                                <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1 text-[#1b68b0] font-bold">
                                    <Hash className="w-3 h-3" /> {metadata.itemCode}
                                </span>
                            )}
                            {metadata.category && (
                                <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1 text-slate-700">
                                    <Tag className="w-3 h-3 text-emerald-600" /> {metadata.category}
                                </span>
                            )}
                            {metadata.dimensions && (
                                <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1 text-slate-700">
                                    <span>Dimensi:</span> <strong>{metadata.dimensions}</strong>
                                </span>
                            )}
                            {metadata.location && (
                                <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1 text-slate-700">
                                    <MapPin className="w-3 h-3 text-rose-500" /> {metadata.location}
                                </span>
                            )}
                            {metadata.condition && (
                                <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1 text-slate-700">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Kondisi: <strong>{metadata.condition}</strong>
                                </span>
                            )}
                            {metadata.recipientName && (
                                <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1 text-emerald-700 font-bold">
                                    <CheckCircle2 className="w-3 h-3" /> Diterima Oleh: {metadata.recipientName}
                                </span>
                            )}
                            {metadata.vehiclePlate && (
                                <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1 text-slate-700">
                                    <Truck className="w-3 h-3 text-[#1b68b0]" /> {metadata.vehiclePlate}
                                </span>
                            )}
                            {metadata.amount && (
                                <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded-md font-bold">
                                    Rp {Number(metadata.amount || 0).toLocaleString('id-ID')}
                                </span>
                            )}
                            {metadata.deliveredAt && (
                                <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1 text-slate-500">
                                    <Calendar className="w-3 h-3" /> {metadata.deliveredAt}
                                </span>
                            )}
                        </div>

                        {/* Status Zoom & Rotasi */}
                        <div className="flex items-center gap-2 text-slate-400 text-[10px] shrink-0 ml-auto">
                            <span>Zoom: {Math.round(zoom * 100)}%</span>
                            {rotation !== 0 && <span>• Rotasi: {rotation}°</span>}
                            <span>• Esc untuk tutup</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
