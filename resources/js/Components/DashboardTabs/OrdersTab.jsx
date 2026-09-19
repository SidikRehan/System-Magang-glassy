import React from 'react';
import { formatIndonesianDate, formatIndonesianDateTime, roleTitles } from '@/Utils/dashboardHelpers';
import { 
    FileText, Sliders, Truck, CreditCard, CheckCircle2, 
    Clock, Plus, Search, Calendar, Edit3, RefreshCw, 
    Printer, Tag, Send, Eye, AlertCircle, MapPin, Lock 
} from 'lucide-react';

export default function OrdersTab({
    userRole,
    canViewPricing,
    initialOrders = [],
    filteredOrders = [],
    activeOrderCard,
    setActiveOrderCard,
    searchTerm,
    setSearchTerm,
    setActiveTab,
    handleOpenNewOrderModal,
    handleOpenEditModal,
    handleOpenPromoteModal,
    handleOpenDispatchModal,
    handleOpenStickerModal,
    handleOpenSketchLightbox,
    setSelectedWaybillOrder,
    setShowWaybillModal,
    handleCompleteDelivery,
}) {
    const renderProgressTracker = (o) => {
        const procs = Array.isArray(o.processes) && o.processes.length > 0 ? o.processes : ['HT'];
        const currentDiv = o.current_division || 'admin_gudang';
        const divProgress = o.division_progress || {};

        const divOrder = [
            { key: 'HT', divKey: 'divisi_ht', label: 'HT' },
            { key: 'GM', divKey: 'divisi_gm', label: 'GM' },
            { key: 'BV', divKey: 'divisi_bv', label: 'BV' },
            { key: 'Etsa', divKey: 'divisi_etsa', label: 'Etsa' },
        ];

        const activeIndex = divOrder.findIndex(d => d.divKey === currentDiv);

        return (
            <div className="space-y-1.5 min-w-[140px]">
                <div className="flex items-center gap-1">
                    <span className="text-[10px] text-[#1b68b0] font-bold bg-[#1b68b0]/10 px-2 py-0.5 rounded-full border border-[#1b68b0]/25 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#1b68b0]" />
                        <span>{roleTitles[currentDiv] || currentDiv}</span>
                    </span>
                </div>

                <div className="flex flex-wrap items-center gap-1 pt-0.5">
                    {divOrder.map((d, idx) => {
                        const isRequired = procs.includes(d.key);
                        const statusText = divProgress[d.key];

                        if (!isRequired && currentDiv !== d.divKey && statusText !== 'Selesai') {
                            return null;
                        }

                        let badgeStyle = "bg-slate-100 text-slate-400 border-slate-200";
                        let IconComponent = Clock;

                        if (statusText === 'Selesai' || (activeIndex > idx && activeIndex !== -1)) {
                            badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold";
                            IconComponent = CheckCircle2;
                        } else if (currentDiv === d.divKey || statusText === 'Sedang Dikerjakan' || statusText === 'Menunggu Dispatch') {
                            badgeStyle = "bg-blue-50 text-[#1b68b0] border-[#1b68b0]/30 font-extrabold shadow-2xs";
                            IconComponent = Sliders;
                        }

                        return (
                            <span
                                key={d.key}
                                className={`text-[10px] px-1.5 py-0.5 rounded-md border flex items-center gap-1 ${badgeStyle}`}
                                title={`${d.label}: ${statusText || (currentDiv === d.divKey ? 'Aktif Pengerjaan' : 'Antrean')}`}
                            >
                                <IconComponent className="w-2.5 h-2.5" />
                                <span>{d.label}</span>
                            </span>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* PAGE HEADER: TITLE (LEFT) & CTA ACTION BUTTON (RIGHT - SAAS STANDARD) */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-1">
                <div>
                    <h2 className="text-2xl font-black text-[#242222]">
                        {userRole === 'admin_toko' || userRole === 'owner' ? 'Menu Orderan & Draf' : 'Menu Orderan Pengerjaan'}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                        {userRole === 'admin_toko' || userRole === 'owner' 
                            ? 'Kelola orderan baru, draf negosiasi, dan disposisi pengerjaan pabrik' 
                            : 'Kelola orderan aktif pengerjaan, pengiriman, dan disposisi divisi'}
                    </p>
                </div>

                {/* CREATE ORDER BUTTON POSITIONED ON THE RIGHT (SAAS STANDARD) */}
                {(userRole === 'admin_toko' || userRole === 'owner') && (
                    <button
                        onClick={handleOpenNewOrderModal}
                        className="bg-[#1b68b0] hover:bg-[#15528c] text-white font-extrabold px-4 py-2.5 rounded-xl shadow-md shadow-[#1b68b0]/20 text-xs flex items-center gap-2 transition transform hover:-translate-y-0.5 cursor-pointer shrink-0"
                    >
                        <Plus className="w-4 h-4" /> Orderan Baru
                    </button>
                )}
            </div>

            {/* DYNAMIC PIPELINE CARDS HEADER - CLEAN WHITE SAAS METRIC CARDS */}
            <div className={`grid ${userRole === 'admin_toko' || userRole === 'owner' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5' : 'grid-cols-1 sm:grid-cols-3'} gap-3.5`}>
                {[
                    ...(userRole === 'admin_toko' || userRole === 'owner' ? [
                        { key: 'draft', label: 'Draf (Belum Deal)', count: initialOrders.filter(o => o.status === 'draft').length, Icon: FileText, accent: 'text-sky-600 bg-sky-50 border-sky-100', activeRing: 'ring-2 ring-sky-500/30 border-sky-500' }
                    ] : []),
                    { key: 'pengerjaan', label: 'Order Pengerjaan', count: initialOrders.filter(o => o.status === 'pengerjaan').length, Icon: Sliders, accent: 'text-[#1b68b0] bg-blue-50 border-blue-100', activeRing: 'ring-2 ring-[#1b68b0]/30 border-[#1b68b0]' },
                    { key: 'pengiriman', label: 'Pengiriman & Surat Jalan', count: initialOrders.filter(o => o.status === 'pengiriman').length, Icon: Truck, accent: 'text-amber-600 bg-amber-50 border-amber-100', activeRing: 'ring-2 ring-amber-500/30 border-amber-500' },
                    ...(userRole === 'admin_toko' || userRole === 'owner' ? [
                        { key: 'pembayaran', label: 'Pembayaran / COD', count: initialOrders.filter(o => o.payment_status !== 'Lunas').length, Icon: CreditCard, accent: 'text-yellow-600 bg-yellow-50 border-yellow-100', activeRing: 'ring-2 ring-yellow-500/30 border-yellow-500' }
                    ] : []),
                    { key: 'selesai', label: 'Selesai', count: initialOrders.filter(o => o.status === 'selesai').length, Icon: CheckCircle2, accent: 'text-[#70b03c] bg-emerald-50 border-emerald-100', activeRing: 'ring-2 ring-[#70b03c]/30 border-[#70b03c]' },
                ].map(card => {
                    const isActive = activeOrderCard === card.key;
                    const CardIcon = card.Icon;
                    return (
                        <div
                            key={card.key}
                            onClick={() => {
                                if (card.key === 'pengiriman') {
                                    setActiveTab('deliveries');
                                } else {
                                    setActiveOrderCard(card.key);
                                }
                            }}
                            className={`cursor-pointer rounded-2xl p-4 transition-all duration-200 border bg-white flex flex-col justify-between gap-3 ${
                                isActive 
                                    ? `${card.activeRing} shadow-sm bg-slate-50/50` 
                                    : 'border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-600 truncate">{card.label}</span>
                                <div className={`p-2 rounded-xl border ${card.accent}`}>
                                    <CardIcon className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="text-3xl font-black text-[#242222] tracking-tight">
                                {card.count}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ACTION HEADER & DATA TABLE - FULL CLEAN WHITE ENTERPRISE CARD */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                {/* TABLE TOOLBAR */}
                <div className="bg-slate-50/80 border-b border-slate-200 px-5 py-3.5 flex flex-wrap justify-between items-center gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-[#1b68b0]/10 text-[#1b68b0]">
                            {activeOrderCard === 'draft' && <FileText className="w-4 h-4" />}
                            {activeOrderCard === 'pengerjaan' && <Sliders className="w-4 h-4" />}
                            {activeOrderCard === 'pengiriman' && <Truck className="w-4 h-4" />}
                            {activeOrderCard === 'pembayaran' && <CreditCard className="w-4 h-4" />}
                            {activeOrderCard === 'selesai' && <CheckCircle2 className="w-4 h-4" />}
                        </div>
                        <h3 className="font-black text-[#242222] text-sm sm:text-base">
                            {activeOrderCard === 'draft' && 'Tabel Draf Orderan (Belum Deal / DP)'}
                            {activeOrderCard === 'pengerjaan' && 'Tabel Orderan Aktif Pengerjaan Divisi Pabrik'}
                            {activeOrderCard === 'pengiriman' && 'Tabel Orderan Pengiriman Armada & Surat Jalan'}
                            {activeOrderCard === 'pembayaran' && 'Tabel Status Pembayaran & Tagihan COD'}
                            {activeOrderCard === 'selesai' && 'Tabel Arsip Orderan Selesai & Terkirim'}
                        </h3>
                        <span className="text-xs bg-white text-slate-600 px-2.5 py-0.5 rounded-full border border-slate-200 font-mono font-bold shadow-2xs">
                            {filteredOrders.length} Items
                        </span>
                    </div>

                    <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Cari SPO / Customer..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#242222] placeholder-slate-400 focus:border-[#1b68b0] focus:ring-1 focus:ring-[#1b68b0] focus:outline-none shadow-2xs"
                        />
                    </div>
                </div>

                {activeOrderCard === 'pengiriman' && (
                    <div className="bg-blue-50/80 border-b border-blue-200/80 p-4 text-xs text-slate-700 flex flex-wrap justify-between items-center gap-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-xl text-[#1b68b0]">
                                <Truck className="w-5 h-5" />
                            </div>
                            <div>
                                <strong className="text-[#1b68b0] text-sm font-extrabold block">Fitur: Penugasan Mobil Multi-Alamat & Rute Manifest</strong>
                                <p className="text-slate-600 text-xs">Admin dapat memilih beberapa alamat tujuan konsumen sekaligus untuk diangkut 1 armada & supir, serta mencetak Rute Manifest Multi-Stop.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setActiveTab('deliveries')}
                            className="bg-[#1b68b0] hover:bg-[#15528c] text-white font-extrabold px-4 py-2 rounded-xl transition shadow-sm text-xs shrink-0 cursor-pointer flex items-center gap-1.5"
                        >
                            Buka Panel Pengiriman Multi-Alamat →
                        </button>
                    </div>
                )}

                {activeOrderCard === 'selesai' && (
                    <div className="bg-emerald-50/80 border-b border-emerald-200/80 p-3.5 text-xs text-emerald-800 flex flex-wrap justify-between items-center gap-2">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>
                                <strong>Orderan Selesai:</strong> Seluruh orderan di tabel ini telah sukses dikirim dan dikonfirmasi diterima konsumen. Dokumen Surat Jalan dapat dicetak ulang kapan saja sebagai arsip transaksi resmi.
                            </span>
                        </div>
                    </div>
                )}

                {/* TABLE GRID */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                            <tr>
                                <th className="p-3.5">No SPO</th>
                                <th className="p-3.5">Customer</th>
                                <th className="p-3.5">Spesifikasi Kaca</th>
                                <th className="p-3.5">Posisi Divisi & Tracking</th>
                                {canViewPricing && <th className="p-3.5">Total Tagihan</th>}
                                {canViewPricing && <th className="p-3.5">Status Bayar</th>}
                                <th className="p-3.5">Aksi Alur</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={canViewPricing ? 7 : 5} className="p-8 text-center text-slate-400 text-xs">
                                        Tidak ada data orderan untuk kategori ini.
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map(o => (
                                    <tr key={o.id} className="hover:bg-slate-50/70 transition">
                                        {/* NO SPO & DATES */}
                                        <td className="p-3.5 align-top">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="font-mono font-black text-sm text-[#1b68b0]">{o.spo_number}</span>
                                                {o.is_revised && (
                                                    <span className="text-[10px] bg-amber-50 text-amber-700 font-extrabold px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1 font-mono shadow-2xs" title="Orderan ini memiliki riwayat revisi">
                                                        <AlertCircle className="w-3 h-3 text-amber-600" />
                                                        <span>Revisi ({o.revision_count || 1}x)</span>
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mt-2 space-y-1 text-[11px]">
                                                <div className="text-slate-600 flex items-center gap-1.5" title="1. Tanggal Pembuatan / Input Draf (Admin Toko)">
                                                    <Calendar className="w-3 h-3 text-slate-400" />
                                                    <span className="text-slate-400">Input:</span>
                                                    <span className="font-medium text-[#242222]">{formatIndonesianDate(o.order_date)}</span>
                                                </div>
                                                {o.gudang_released_at && (
                                                    <div className="text-slate-600 flex items-center gap-1.5 text-[10px]" title="2. Tanggal Diturunkan / Disposisi Admin Gudang ke Divisi">
                                                        <Clock className="w-3 h-3 text-blue-500" />
                                                        <span className="text-slate-400">Disposisi:</span>
                                                        <span className="font-medium text-[#242222]">{formatIndonesianDateTime(o.gudang_released_at)}</span>
                                                    </div>
                                                )}
                                                {o.execution_completed_at && (
                                                    <div className="text-slate-600 flex items-center gap-1.5 text-[10px]" title="3. Tanggal Selesai Eksekusi Kaca & Lolos QC Pabrik">
                                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                        <span className="text-slate-400">QC Pabrik:</span>
                                                        <span className="font-medium text-[#242222]">{formatIndonesianDateTime(o.execution_completed_at)}</span>
                                                    </div>
                                                )}
                                                {o.shipped_at && (
                                                    <div className="text-slate-600 flex items-center gap-1.5 text-[10px]" title="4. Tanggal Mulai Pengiriman Armada / Surat Jalan">
                                                        <Truck className="w-3 h-3 text-amber-600" />
                                                        <span className="text-slate-400">Kirim:</span>
                                                        <span className="font-medium text-[#242222]">{formatIndonesianDateTime(o.shipped_at)}</span>
                                                    </div>
                                                )}
                                                {o.delivered_at && (
                                                    <div className="text-emerald-700 flex items-center gap-1.5 text-[10px] font-bold" title="5. Tanggal Selesai Terkirim & Diterima Konsumen">
                                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                        <span className="text-emerald-600">Terkirim:</span>
                                                        <span>{formatIndonesianDateTime(o.delivered_at)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* CUSTOMER INFO */}
                                        <td className="p-3.5 align-top text-xs space-y-1 min-w-[200px]">
                                            <div className="font-extrabold text-[#242222] text-xs">
                                                <span className="text-slate-400 font-normal">Nama : </span>
                                                <span>{o.customer_name || '-'}</span>
                                            </div>
                                            <div className="text-slate-600 font-mono text-[11px]">
                                                <span className="text-slate-400 font-normal font-sans">No Phone : </span>
                                                <span>{o.customer_phone || '-'}</span>
                                            </div>
                                            <div className="text-slate-600 font-medium whitespace-pre-line leading-relaxed text-[11px] pt-0.5">
                                                <span className="text-slate-400 font-normal">Alamat : </span>
                                                <span>{o.customer_address || '-'}</span>
                                            </div>
                                        </td>

                                        {/* SPESIFIKASI KACA */}
                                        <td className="p-3.5 align-top space-y-1 max-w-xs">
                                            {Array.isArray(o.items) && o.items.length > 0 ? (
                                                <div className="space-y-1.5">
                                                    {o.items.map((it, idx) => (
                                                        <div key={idx} className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl text-xs space-y-1 shadow-2xs">
                                                            <div className="font-bold text-[#1b68b0]">
                                                                #{idx + 1}. {it.glass_type}
                                                            </div>
                                                            <div className="text-xs text-[#242222] font-mono font-bold">
                                                                {it.length_cm} x {it.width_cm} = {it.qty || 1} lbr
                                                            </div>
                                                            <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between gap-1">
                                                                <span>{it.thickness_mm} mm</span>
                                                                {Array.isArray(it.processes) && it.processes.length > 0 && (
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {it.processes.map(p => (
                                                                            <span key={p} className="text-[9px] bg-blue-50 text-[#1b68b0] font-bold px-1.5 py-0.2 rounded border border-blue-200/80">
                                                                                {p}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="bg-slate-50 border border-slate-200/80 p-2 rounded-xl text-xs space-y-1">
                                                    <div className="font-bold text-[#1b68b0]">{o.glass_type}</div>
                                                    <div className="text-xs text-[#242222] font-mono font-bold">
                                                        {o.length_cm} x {o.width_cm} cm | {o.thickness_mm} mm
                                                    </div>
                                                    <div className="flex flex-wrap gap-1 pt-0.5">
                                                        {Array.isArray(o.processes) && o.processes.map(p => (
                                                            <span key={p} className="text-[9px] bg-blue-50 text-[#1b68b0] font-bold px-1.5 py-0.2 rounded border border-blue-200/80">
                                                                {p}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {o.sketch_photo_path && (
                                                <div className="mt-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenSketchLightbox(o.sketch_photo_path, o.spo_number)}
                                                        className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl p-1.5 flex items-center justify-between gap-2 text-xs transition shadow-2xs cursor-pointer"
                                                        title="Klik untuk memperbesar gambar sketsa pola & sambungan kaca"
                                                    >
                                                        <div className="flex items-center gap-1.5 overflow-hidden">
                                                            <img
                                                                src={o.sketch_photo_path.startsWith('http') || o.sketch_photo_path.startsWith('/') ? o.sketch_photo_path : `/storage/${o.sketch_photo_path}`}
                                                                alt="Sketsa Pola"
                                                                className="w-8 h-8 rounded-lg object-cover border border-slate-200 bg-slate-100 shrink-0"
                                                            />
                                                            <span className="font-bold text-[11px] text-[#242222] truncate">Sketsa Sambungan</span>
                                                        </div>
                                                        <span className="text-[10px] bg-blue-50 text-[#1b68b0] border border-blue-200/80 px-1.5 py-0.5 rounded-md font-mono font-bold flex items-center gap-0.5 shrink-0">
                                                            <Eye className="w-2.5 h-2.5" /> Lihat
                                                        </span>
                                                    </button>
                                                </div>
                                            )}

                                            {Array.isArray(o.accessories) && o.accessories.length > 0 && (
                                                <div className="flex flex-wrap gap-1 pt-1">
                                                    {o.accessories.map((a, accIdx) => {
                                                        const isObj = typeof a === 'object' && a !== null;
                                                        const accName = isObj ? (a.name || 'Aksesoris') : a;
                                                        const accQty = isObj && a.qty ? ` (${a.qty}x)` : '';
                                                        return (
                                                            <span key={accIdx} className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-1.5 py-0.5 rounded border border-slate-200">
                                                                +{accName}{accQty}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {o.description && (
                                                <div className="mt-2 p-2 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-900 text-xs">
                                                    <span className="font-bold flex items-center gap-1 text-amber-800 text-[11px] mb-0.5">
                                                        Catatan Order:
                                                    </span>
                                                    <div className="text-slate-700 font-medium whitespace-pre-wrap text-[11px] leading-relaxed">
                                                        {o.description}
                                                    </div>
                                                </div>
                                            )}

                                            {o.revision_notes && (
                                                <div className="mt-1.5 p-2 bg-rose-50/80 border border-rose-200 rounded-xl text-rose-900 text-xs">
                                                    <span className="font-bold flex items-center gap-1 text-rose-800 text-[11px] mb-0.5">
                                                        Catatan Revisi:
                                                    </span>
                                                    <div className="text-slate-700 font-medium whitespace-pre-wrap text-[11px] leading-relaxed font-mono">
                                                        {o.revision_notes}
                                                    </div>
                                                </div>
                                            )}
                                        </td>

                                        {/* PROGRESS TRACKER */}
                                        <td className="p-3.5 align-top">
                                            {renderProgressTracker(o)}
                                        </td>

                                        {/* TOTAL PRICE */}
                                        {canViewPricing && (
                                            <td className="p-3.5 align-top font-black text-sm text-[#242222] whitespace-nowrap">
                                                Rp {Number(o.total_price).toLocaleString()}
                                            </td>
                                        )}

                                        {/* PAYMENT STATUS */}
                                        {canViewPricing && (
                                            <td className="p-3.5 align-top whitespace-nowrap">
                                                <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                                                    o.payment_status === 'Lunas' 
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                                        : o.payment_status === 'DP (50%)' 
                                                        ? 'bg-blue-50 text-[#1b68b0] border-blue-200' 
                                                        : 'bg-slate-100 text-slate-600 border-slate-200'
                                                }`}>
                                                    {o.payment_status}
                                                </span>
                                            </td>
                                        )}

                                        {/* ACTION BUTTONS */}
                                        <td className="p-3.5 align-top">
                                            <div className="flex flex-wrap items-center gap-2 min-w-[140px]">
                                                {o.status === 'draft' && (
                                                    (userRole === 'admin_toko' || userRole === 'owner') ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleOpenEditModal(o)}
                                                                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                                                            >
                                                                <Edit3 className="w-3.5 h-3.5 text-[#1b68b0]" /> Edit Draf
                                                            </button>
                                                            <button
                                                                onClick={() => handleOpenPromoteModal(o)}
                                                                className="bg-[#70b03c] hover:bg-[#5e9632] text-white font-bold px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                                                            >
                                                                <CheckCircle2 className="w-3.5 h-3.5" /> Setuju & DP
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200 text-xs font-semibold flex items-center gap-1">
                                                            <Clock className="w-3.5 h-3.5 text-amber-600" /> Draf Toko
                                                        </span>
                                                    )
                                                )}

                                                {o.status === 'pengerjaan' && (userRole === 'admin_toko' || userRole === 'owner') && (
                                                    <button
                                                        onClick={() => handleOpenEditModal(o)}
                                                        className="bg-white hover:bg-amber-50 text-amber-800 border border-amber-300 font-bold px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                                                        title="Klik untuk merevisi deskripsi, foto sketsa, atau dimensi item kaca"
                                                    >
                                                        <RefreshCw className="w-3.5 h-3.5 text-amber-600" /> Revisi Order
                                                    </button>
                                                )}

                                                {o.status === 'pengerjaan' && o.current_division === 'admin_gudang' && (userRole === 'admin_gudang' || userRole === 'owner') && (
                                                    o.revision_status === 'editing' ? (
                                                        <button
                                                            disabled
                                                            className="bg-slate-100 text-slate-400 font-bold px-3 py-1.5 rounded-lg text-xs cursor-not-allowed border border-slate-200 flex items-center gap-1.5 shadow-2xs"
                                                            title="Tombol terblokir sementara karena Admin Toko sedang mengedit orderan ini"
                                                        >
                                                            <Lock className="w-3.5 h-3.5 text-amber-500" />
                                                            <span>Sedang Direvisi...</span>
                                                        </button>
                                                    ) : (
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <button
                                                                onClick={() => handleOpenDispatchModal(o)}
                                                                className="bg-[#1b68b0] hover:bg-[#15528c] text-white font-bold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                                                            >
                                                                <Send className="w-3.5 h-3.5" />
                                                                <span>Kirim Divisi</span>
                                                                {o.revision_status === 'pending_gudang' && (
                                                                    <span className="text-[10px] bg-amber-400 text-slate-950 px-1 rounded font-mono font-black">
                                                                        Revisi
                                                                    </span>
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={() => handleOpenStickerModal(o)}
                                                                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                                                title="Cetak Stiker Label Orderan Kaca untuk Gudang & Divisi"
                                                            >
                                                                <Tag className="w-3.5 h-3.5 text-amber-600" /> Stiker
                                                            </button>
                                                        </div>
                                                    )
                                                )}

                                                {o.status === 'pengiriman' && (
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <button
                                                            onClick={() => { setSelectedWaybillOrder(o); setShowWaybillModal(true); }}
                                                            className="bg-white hover:bg-slate-50 text-[#1b68b0] border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                                            title="Cetak 4 Warna Surat Jalan Pengiriman (Putih, Merah, Kuning, Hijau)"
                                                        >
                                                            <Printer className="w-3.5 h-3.5" /> Surat Jalan
                                                        </button>
                                                        <button
                                                            onClick={() => handleCompleteDelivery(o.id, true)}
                                                            className="bg-[#70b03c] hover:bg-[#5e9632] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                                                            title="Klik jika barang telah sampai dan diterima konsumen"
                                                        >
                                                            <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
                                                        </button>
                                                    </div>
                                                )}

                                                {o.status === 'selesai' && (
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Selesai
                                                        </span>
                                                        <button
                                                            onClick={() => { setSelectedWaybillOrder(o); setShowWaybillModal(true); }}
                                                            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition flex items-center gap-1 shadow-2xs"
                                                            title="Cetak Ulang Arsip Surat Jalan"
                                                        >
                                                            <Printer className="w-3.5 h-3.5 text-slate-500" /> Arsip
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
