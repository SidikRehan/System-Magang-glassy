import React from 'react';
import { router } from '@inertiajs/react';
import { roleTitles, formatIndonesianDate, checkOrderDivisi, isDateInTimeRange } from '@/Utils/dashboardHelpers';
import {
    Factory,
    Hammer,
    History,
    Scissors,
    Sparkles,
    Gem,
    Paintbrush,
    CheckCircle2,
    Layers,
    Recycle,
    Box,
    Wrench,
    AlertTriangle,
    Clock,
    Eye,
    ArrowRight,
    Search,
    Calendar,
    Phone,
    MapPin,
    AlertCircle,
    RotateCcw,
    FileText,
    BarChart3,
    Check,
    Lock,
    Scale,
    Maximize2
} from 'lucide-react';

export default function ProductionTab({
    userRole,
    isDivisionWorker,
    productionSubTab,
    setProductionSubTab,
    initialOrders = [],
    initialScrap = [],
    setActiveTab,
    setSelectedComplaintOrder,
    setShowGudangDecisionModal,
    handleOpenDispatchModal,
    handleOpenStickerModal,
    handleOpenSketchLightbox,
    handleOpenDetailModal,
    handleOpenComplaintModal,
    handleAcknowledgeRevision,
    handleStartJob,
    handleFinishJobSubmit,
    activeWorkingOrderId,
    setActiveWorkingOrderId,
    activeCardNextDiv,
    setActiveCardNextDiv,
    setShowRekapModal,
    statTimeRange,
    setStatTimeRange,
    statFilterType,
    setStatFilterType,
}) {
    const handleStartWorkstationJob = (order) => {
        if (setActiveWorkingOrderId) {
            setActiveWorkingOrderId(order.id);
        }
        const cKey = order.current_division.replace('divisi_', '').toUpperCase();
        const cStatus = (order.division_progress && order.division_progress[cKey]) ? order.division_progress[cKey] : 'Belum';
        if (cStatus !== 'Sedang Dikerjakan' && cStatus !== 'Selesai') {
            router.post(route('orders.start', order.id), {}, {
                preserveScroll: true
            });
        }
        document.getElementById('active-workstation-card')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="space-y-6">
            {/* TOP HEADER */}
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-[#242222] flex items-center gap-2.5">
                        <Factory className="w-6 h-6 text-[#1b68b0]" />
                        <span>Workstation & Disposisi Workflow Divisi Pabrik</span>
                    </h2>
                    <p className="text-slate-500 text-sm mt-0.5">Monitoring & eksekusi pengerjaan kaca per divisi (Potong HT, Gosok GM, Bevel BV, & Etsa Blur)</p>
                </div>
                <span className="text-xs text-[#1b68b0] bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200 font-bold flex items-center gap-1.5 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-[#1b68b0]"></span>
                    Role Aktif: {roleTitles[userRole] || userRole}
                </span>
            </div>

            {/* WORKSTATION DIVISION SUB-TAB FILTER */}
            {isDivisionWorker ? (
                <div className="flex flex-wrap items-center bg-slate-100 border border-slate-200 p-1.5 rounded-2xl gap-2 shadow-xs">
                    <button
                        onClick={() => setProductionSubTab(`${userRole}_active`)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                            productionSubTab === `${userRole}_active`
                                ? 'bg-white text-[#1b68b0] shadow-xs border border-slate-200'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                        }`}
                    >
                        <Hammer className="w-4 h-4 text-[#1b68b0]" />
                        <span>Active Pengerjaan {roleTitles[userRole]}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-extrabold ${
                            productionSubTab === `${userRole}_active` ? 'bg-blue-50 text-[#1b68b0] border border-blue-200' : 'bg-slate-200 text-slate-600'
                        }`}>
                            {initialOrders.filter(o => o.current_division === userRole).length}
                        </span>
                    </button>

                    <button
                        onClick={() => setProductionSubTab(`${userRole}_history`)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                            productionSubTab === `${userRole}_history`
                                ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                        }`}
                    >
                        <History className="w-4 h-4 text-emerald-600" />
                        <span>Riwayat Selesai {roleTitles[userRole]}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-extrabold ${
                            productionSubTab === `${userRole}_history` ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-200 text-slate-600'
                        }`}>
                            {(() => {
                                const code = userRole.replace('divisi_', '').toUpperCase();
                                return initialOrders.filter(o => {
                                    const p = o.division_progress || {};
                                    return o.current_division !== userRole && (p[code] === 'Selesai' || p[code.toLowerCase()] === 'Selesai');
                                }).length;
                            })()}
                        </span>
                    </button>
                </div>
            ) : (
                <div className="flex flex-wrap items-center bg-slate-100 border border-slate-200 p-1.5 rounded-2xl gap-1.5 shadow-xs">
                    {[
                        { key: 'all', label: 'Semua Active', icon: Layers, count: initialOrders.filter(o => checkOrderDivisi(o, 'all')).length },
                        { key: 'divisi_ht', label: 'Divisi Potong (HT)', icon: Scissors, count: initialOrders.filter(o => checkOrderDivisi(o, 'divisi_ht')).length },
                        { key: 'divisi_gm', label: 'Divisi GM (Gosok)', icon: Sparkles, count: initialOrders.filter(o => checkOrderDivisi(o, 'divisi_gm')).length },
                        { key: 'divisi_bv', label: 'Divisi BV (Bevel)', icon: Gem, count: initialOrders.filter(o => checkOrderDivisi(o, 'divisi_bv')).length },
                        { key: 'divisi_etsa', label: 'Divisi Etsa (Blur)', icon: Paintbrush, count: initialOrders.filter(o => checkOrderDivisi(o, 'divisi_etsa')).length },
                        { key: 'QC_Ready', label: 'Selesai (Siap Kirim QC)', icon: CheckCircle2, count: initialOrders.filter(o => checkOrderDivisi(o, 'QC_Ready')).length },
                    ].map(tab => {
                        const Icon = tab.icon;
                        const isActive = productionSubTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setProductionSubTab(tab.key)}
                                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                    isActive
                                        ? 'bg-white text-[#1b68b0] shadow-xs border border-slate-200'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                }`}
                            >
                                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#1b68b0]' : 'text-slate-400'}`} />
                                <span>{tab.label}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-extrabold ${
                                    isActive ? 'bg-blue-50 text-[#1b68b0] border border-blue-200' : 'bg-slate-200 text-slate-600'
                                }`}>
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* EFFICIENCY & SCRAP CALLOUT FOR DIVISION WORKERS */}
            {isDivisionWorker && (
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap justify-between items-center text-xs gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                            <Recycle className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="font-bold text-[#242222]">Indikator Efisiensi Bahan & Limbah Manufaktur:</span>
                            <p className="text-[11px] text-slate-500">
                                Gunakan sisa potongan kaca rak ({initialScrap.length} potongan tersedia) untuk meminimalkan scrap kaca dan menekan HPP pabrik.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setActiveTab('scrap')}
                            className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                            <Box className="w-3.5 h-3.5" />
                            <span>Cek Rak Sisa Kaca</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('tools')}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#1b68b0] border border-blue-200 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                            <Wrench className="w-3.5 h-3.5" />
                            <span>Pinjam Alat Kerja</span>
                        </button>
                    </div>
                </div>
            )}

            {/* PENDING COMPLAINT BANNER FOR ADMIN GUDANG / OWNER */}
            {initialOrders.filter(o => o.complaint_status === 'pending_gudang').length > 0 && (userRole === 'admin_gudang' || userRole === 'owner') && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 shadow-xs space-y-3">
                    <div className="flex justify-between items-center border-b border-amber-200 pb-2.5">
                        <h3 className="text-sm font-black text-amber-900 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 animate-pulse" />
                            <span>PERINGATAN KRITIS: ADA KOMPLAIN KACA CACAT / BARET MENUNGGU DECISION GUDANG ({initialOrders.filter(o => o.complaint_status === 'pending_gudang').length})</span>
                        </h3>
                        <span className="text-[10px] text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full font-mono font-bold border border-amber-300">
                            Tindakan Gudang Diperlukan
                        </span>
                    </div>
                    <div className="space-y-2.5">
                        {initialOrders.filter(o => o.complaint_status === 'pending_gudang').map(o => (
                            <div key={o.id} className="bg-white border border-amber-200 p-3.5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-xs">
                                <div className="space-y-1">
                                    <div className="font-extrabold text-amber-900 text-xs font-mono">
                                        SPO #{o.spo_number} — Pelapor: Divisi {o.complaint_data?.reporting_division?.replace('divisi_', '').toUpperCase() || ''}
                                    </div>
                                    <div className="text-slate-600 text-xs">
                                        Pelanggan: <strong className="text-[#242222]">{o.customer_name}</strong> | Kendala: <strong className="text-rose-600">{o.complaint_data?.reason || 'Kaca Cacat'}</strong>
                                    </div>
                                    {o.complaint_data?.notes && (
                                        <div className="text-slate-600 text-[11px] italic font-mono bg-amber-50/60 p-2 rounded-lg border border-amber-200">
                                            Catatan Pekerja: "{o.complaint_data.notes}"
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => { setSelectedComplaintOrder(o); setShowGudangDecisionModal(true); }}
                                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-xs whitespace-nowrap cursor-pointer flex items-center gap-1.5"
                                >
                                    <Scale className="w-3.5 h-3.5" />
                                    <span>Tinjau & Ambil Keputusan</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* SECTION A: ANTREAN DISPOSISI ADMIN GUDANG */}
            {(userRole === 'admin_gudang' || userRole === 'owner') && (productionSubTab === 'all' || productionSubTab === 'gudang') && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                        <h3 className="text-base font-bold text-[#242222] flex items-center gap-2">
                            <Factory className="w-5 h-5 text-[#1b68b0]" />
                            <span>Antrean Disposisi Admin Gudang</span>
                        </h3>
                        <span className="text-xs font-bold text-[#1b68b0] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                            {initialOrders.filter(o => o.status === 'pengerjaan' && o.current_division === 'admin_gudang').length} Order
                        </span>
                    </div>

                    {initialOrders.filter(o => o.status === 'pengerjaan' && o.current_division === 'admin_gudang').length === 0 ? (
                        <p className="text-xs text-slate-500 italic p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            Tidak ada orderan baru yang menunggu disposisi gudang saat ini.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {initialOrders.filter(o => o.status === 'pengerjaan' && o.current_division === 'admin_gudang').sort((a, b) => b.id - a.id).map(o => (
                                <div key={o.id} className="bg-slate-50/60 border border-slate-200 hover:border-blue-300 rounded-2xl p-4 space-y-3 transition shadow-xs hover:shadow-sm">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="font-extrabold text-[#1b68b0] font-mono text-base">{o.spo_number}</span>
                                            <div className="text-xs space-y-0.5 mt-1">
                                                <div className="font-bold text-[#242222]">
                                                    <span className="text-slate-500 font-normal">Nama : </span>
                                                    <span>{o.customer_name || '-'}</span>
                                                </div>
                                                <div className="text-slate-600 font-mono">
                                                    <span className="text-slate-500 font-normal font-sans">No Phone : </span>
                                                    <span>{o.customer_phone || '-'}</span>
                                                </div>
                                                <div className="text-slate-600 font-medium whitespace-pre-line leading-snug">
                                                    <span className="text-slate-500 font-normal">Alamat : </span>
                                                    <span>{o.customer_address || '-'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-xs ${
                                            o.priority_status === 'Prioritas'
                                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                : 'bg-white text-slate-600 border-slate-200'
                                        }`}>
                                            {o.priority_status === 'Prioritas' ? '🔥 PRIORITAS' : 'Biasa'}
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                                        <div className="font-bold text-[#242222]">Kaca: {o.glass_type}</div>
                                        <div className="text-slate-600 font-mono">Ukuran: {o.length_cm} x {o.width_cm} cm ({o.thickness_mm}mm)</div>
                                        <div className="text-[11px] text-[#1b68b0] font-mono pt-1.5 border-t border-slate-100 flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3 text-slate-400" />
                                            <span>Pembuatan Order: <strong>{formatIndonesianDate(o.order_date)}</strong></span>
                                        </div>
                                    </div>

                                    {o.revision_status === 'editing' && (
                                        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-rose-800 text-xs space-y-1.5 shadow-xs">
                                            <div className="font-bold text-rose-700 flex items-center justify-between text-xs">
                                                <span className="flex items-center gap-1.5">
                                                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                                                    <span>SEDANG DIREVISI OLEH ADMIN TOKO...</span>
                                                </span>
                                                <span className="bg-rose-100 text-rose-700 font-mono px-2 py-0.5 rounded text-[10px] font-bold border border-rose-200">
                                                    LOCKED
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-rose-600 leading-relaxed">
                                                Admin Toko sedang mengubah ukuran atau catatan pesanan ini. Harap tunggu hingga Admin Toko selesai menyimpan revisi sebelum melakukan disposisi bahan baku.
                                            </p>
                                        </div>
                                    )}

                                    {o.revision_status === 'pending_gudang' && (
                                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-800 text-xs space-y-2 shadow-xs">
                                            <div className="font-bold text-amber-800 flex items-center justify-between text-xs">
                                                <span className="flex items-center gap-1.5">
                                                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                                                    <span>ORDERAN TELAH DIREVISI OLEH ADMIN TOKO</span>
                                                </span>
                                                <span className="bg-amber-100 text-amber-900 font-mono font-bold px-2 py-0.5 rounded text-[10px] border border-amber-300">
                                                    REVISI DISIMPAN
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-amber-700 leading-relaxed">
                                                Admin Toko telah selesai menginput dan menyimpan revisi. Admin Gudang dapat memeriksa spesifikasi/ukuran terbaru di atas dan dapat langsung mengeklik tombol <strong>Disposisi Divisi</strong> di bawah.
                                            </p>
                                            {o.revision_notes && (
                                                <div className="bg-white p-2 rounded-lg border border-amber-200 text-[11px] text-amber-800 font-mono">
                                                    Catatan Revisi Toko: {o.revision_notes}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center pt-1">
                                        <span className="text-[11px] text-slate-500 font-mono">Deadline: {o.deadline_date || '-'}</span>
                                        {o.revision_status === 'editing' ? (
                                            <button
                                                disabled
                                                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 bg-slate-100 border border-slate-200 cursor-not-allowed flex items-center gap-1.5"
                                                title="SPO sedang di-edit oleh Admin Toko."
                                            >
                                                <Lock className="w-3 h-3 text-slate-400" />
                                                <span>Terkunci (Sedang Direvisi)</span>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleOpenDispatchModal(o)}
                                                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#1b68b0] hover:bg-[#15528c] shadow-xs hover:shadow-sm transition cursor-pointer"
                                            >
                                                <span>Disposisi Divisi</span>
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* SECTION B: WORKSTATION ACTIVE PENGERJAAN & DISPOSISI LAYOUT */}
            <div className="space-y-6">
                {/* ACTIVE MEJA KERJA WORKSTATION CARD (HT, GM, BV, ETSA) */}
                {isDivisionWorker && (() => {
                    const activeDivKey = userRole.replace('divisi_', '').toUpperCase();

                    const activeOngoingOrder = (() => {
                        if (activeWorkingOrderId) {
                            const found = initialOrders.find(o => o.id === activeWorkingOrderId);
                            if (found) return found;
                        }
                        return initialOrders.find(o => {
                            if (isDivisionWorker) {
                                return o.current_division === userRole && o.division_progress?.[activeDivKey] === 'Sedang Dikerjakan';
                            }
                            if (productionSubTab.startsWith('divisi_')) {
                                return o.current_division === productionSubTab &&
                                    ['Sedang Dikerjakan', 'Menunggu Pengerjaan', 'Belum', 'Menunggu Dispatch'].includes(o.division_progress?.[activeDivKey] || '');
                            }
                            return false;
                        }) || null;
                    })();

                    const isJobStarted = activeOngoingOrder && activeOngoingOrder.division_progress?.[activeDivKey] === 'Sedang Dikerjakan';

                    return (
                        <div id="active-workstation-card" className="transition-all duration-300">
                            {activeOngoingOrder ? (
                                <div className="relative overflow-hidden rounded-3xl border-2 border-blue-200 bg-gradient-to-br from-white via-blue-50/20 to-slate-50 p-6 sm:p-7 shadow-sm space-y-5">
                                    {/* CARD TOP HEADER */}
                                    <div className="relative z-10 flex flex-wrap justify-between items-center gap-3 border-b border-slate-200 pb-4">
                                        <div className="flex flex-wrap items-center gap-2.5">
                                            <span className="relative flex h-3 w-3">
                                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isJobStarted ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                                                <span className={`relative inline-flex rounded-full h-3 w-3 ${isJobStarted ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                            </span>
                                            <span className={`text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-1.5 ${isJobStarted ? 'text-emerald-700' : 'text-amber-700'}`}>
                                                <span>{isJobStarted ? 'PROSES SEDANG BERLANGSUNG DI MEJA KERJA' : 'ANTREAN MASUK DI MEJA KERJA (Belum Dimulai)'}</span>
                                            </span>
                                            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-50 text-[#1b68b0] border border-blue-200 font-mono shadow-xs">
                                                Workstation {roleTitles[activeOngoingOrder.current_division] || activeOngoingOrder.current_division}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {activeOngoingOrder.priority_status === 'Prioritas' ? (
                                                <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                                                    <span>🔥 PRIORITAS TINGGI</span>
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-medium px-3 py-1 rounded-full bg-white text-slate-600 border border-slate-200 shadow-xs">
                                                    Biasa
                                                </span>
                                            )}
                                            <span className="text-xs font-mono font-extrabold text-[#1b68b0] bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-xs">
                                                {activeOngoingOrder.spo_number}
                                            </span>
                                        </div>
                                    </div>

                                    {/* PERINGATAN REVISI TOKO JIKA SEDANG BERJALAN */}
                                    {activeOngoingOrder.revision_status === 'pending_division' && (
                                        <div className="relative z-10 bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 text-rose-900 text-xs space-y-2 shadow-xs">
                                            <div className="flex flex-wrap justify-between items-center gap-2 font-bold text-xs text-rose-800">
                                                <span className="flex items-center gap-2 text-sm">
                                                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                                                    <span>INTERUPSI REVISI DARI ADMIN TOKO!</span>
                                                </span>
                                                <span className="bg-rose-100 text-rose-800 font-mono px-2.5 py-0.5 rounded text-[10px] uppercase font-bold border border-rose-200">
                                                    Tindakan Mendesak
                                                </span>
                                            </div>
                                            <p className="text-xs text-rose-700 leading-relaxed">
                                                Admin Toko telah mengirimkan revisi pada SPO ini saat pengerjaan sedang berlangsung! Harap periksa perubahan ukuran/spesifikasi sebelum melanjutkan proses kaca agar tidak terjadi salah potong/proses.
                                            </p>
                                            {activeOngoingOrder.revision_notes && (
                                                <div className="bg-white p-2.5 rounded-lg border border-rose-200 text-xs text-amber-800 font-mono">
                                                    Catatan Revisi Toko: <strong>{activeOngoingOrder.revision_notes}</strong>
                                                </div>
                                            )}
                                            <div className="flex justify-end pt-1">
                                                <button
                                                    type="button"
                                                    onClick={() => handleAcknowledgeRevision(activeOngoingOrder.id)}
                                                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                                                >
                                                    <RotateCcw className="w-3.5 h-3.5" />
                                                    <span>Terima & Eksekusi Revisi SPO</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* CARD MAIN BODY GRID */}
                                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                                        <div className="md:col-span-4 bg-white border border-slate-200 rounded-2xl p-4.5 flex flex-col justify-between space-y-3 shadow-xs">
                                            <div className="space-y-2.5">
                                                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                                    <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                                        <span>Pemesan / Proyek</span>
                                                    </span>
                                                    <span className="text-[10px] font-mono bg-blue-50 text-[#1b68b0] border border-blue-200 px-2 py-0.5 rounded-full font-bold">
                                                        Order Info
                                                    </span>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <div className="font-extrabold text-base text-[#242222] tracking-tight leading-snug">
                                                        {activeOngoingOrder.customer_name || '-'}
                                                    </div>
                                                    <div className="text-slate-600 font-mono text-xs flex items-center gap-1.5">
                                                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                                                        <span className="font-semibold">{activeOngoingOrder.customer_phone || '-'}</span>
                                                    </div>
                                                    <div className="text-slate-600 text-xs flex items-start gap-1.5 leading-snug">
                                                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                                        <span className="font-medium whitespace-pre-line">{activeOngoingOrder.customer_address || '-'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-2 border-t border-slate-100 space-y-1.5 font-mono text-xs">
                                                <div className="flex items-center justify-between text-slate-600">
                                                    <span className="text-slate-400 text-[11px]">Order:</span>
                                                    <span className="text-[#242222] font-semibold">{formatIndonesianDate(activeOngoingOrder.order_date)}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-amber-800 font-bold bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl">
                                                    <span className="text-[11px] flex items-center gap-1">Deadline:</span>
                                                    <span className="text-xs">{activeOngoingOrder.deadline_date || '-'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="md:col-span-8 bg-white border border-slate-200 rounded-2xl p-4.5 space-y-3.5 shadow-xs flex flex-col justify-between">
                                            <div className="space-y-2.5">
                                                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                                    <div className="text-[11px] font-mono text-[#1b68b0] uppercase tracking-wider font-extrabold flex items-center gap-2">
                                                        <Gem className="w-3.5 h-3.5" />
                                                        <span>Spesifikasi Kaca & Dimensi</span>
                                                    </div>
                                                    {Array.isArray(activeOngoingOrder.items) && (
                                                        <span className="text-[10px] font-mono font-bold bg-blue-50 text-[#1b68b0] border border-blue-200 px-2.5 py-0.5 rounded-full">
                                                            {activeOngoingOrder.items.length} Item Kaca
                                                        </span>
                                                    )}
                                                </div>

                                                {Array.isArray(activeOngoingOrder.items) && activeOngoingOrder.items.length > 0 ? (
                                                    <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                                                        {activeOngoingOrder.items.map((it, idx) => (
                                                            <div key={idx} className="bg-slate-50/80 hover:bg-slate-50 p-3 rounded-xl border border-slate-200 transition flex flex-wrap items-center justify-between gap-2 shadow-xs">
                                                                <div className="space-y-1 flex-1 min-w-[200px]">
                                                                    <div className="font-extrabold text-[#242222] text-xs flex items-center gap-2">
                                                                        <span className="bg-blue-50 text-[#1b68b0] font-mono text-[10px] px-2 py-0.5 rounded-md border border-blue-200 font-bold">#{idx + 1}</span>
                                                                        <span>{it.glass_type}</span>
                                                                    </div>
                                                                    <div className="text-slate-600 font-mono text-xs flex flex-wrap items-center gap-2 pt-0.5">
                                                                        <span className="bg-white text-[#242222] px-2 py-0.5 rounded border border-slate-200 font-bold shadow-xs">
                                                                            {it.length_cm} × {it.width_cm} cm
                                                                        </span>
                                                                        <span className="text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                                                            Tebal: {it.thickness_mm} mm
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="shrink-0">
                                                                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl font-mono text-xs font-black shadow-xs flex items-center gap-1">
                                                                        <span>Qty:</span>
                                                                        <strong className="text-emerald-800 text-sm">{it.qty || 1}</strong>
                                                                        <span>Pcs</span>
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                                                        <div className="space-y-1">
                                                            <div className="font-extrabold text-[#242222] text-xs">
                                                                {activeOngoingOrder.glass_type}
                                                            </div>
                                                            <div className="text-slate-600 font-mono text-xs flex items-center gap-2">
                                                                <span className="bg-white text-[#242222] px-2 py-0.5 rounded border border-slate-200 font-bold shadow-xs">
                                                                    {activeOngoingOrder.length_cm} × {activeOngoingOrder.width_cm} cm
                                                                </span>
                                                                <span className="text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                                                    Tebal: {activeOngoingOrder.thickness_mm} mm
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* REKOMENDASI SCRAP RAK */}
                                            {activeOngoingOrder.used_scrap_rak && activeOngoingOrder.used_scrap_rak !== '-' && activeOngoingOrder.used_scrap_rak.trim() !== '' && (
                                                <div className="pt-1">
                                                    {activeOngoingOrder.used_scrap_rak.startsWith('❌') ? (
                                                        <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 text-xs font-mono space-y-1 shadow-xs">
                                                            <div className="font-bold text-[11px] text-rose-800 flex items-center justify-between">
                                                                <span className="flex items-center gap-1.5"><span>Rekomendasi Scrap Ditolak</span></span>
                                                                <span className="text-[9px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full border border-rose-200">Ditolak HT</span>
                                                            </div>
                                                            <div className="text-rose-700 bg-white px-2.5 py-1.5 rounded-lg border border-rose-200 font-bold text-[11px] leading-relaxed">
                                                                {activeOngoingOrder.used_scrap_rak}
                                                            </div>
                                                        </div>
                                                    ) : activeOngoingOrder.used_scrap_rak.startsWith('✅') ? (
                                                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-xs font-mono space-y-1 shadow-xs">
                                                            <div className="font-bold text-[11px] text-emerald-800 flex items-center justify-between">
                                                                <span className="flex items-center gap-1.5"><span>Rekomendasi Scrap Terpakai</span></span>
                                                                <span className="text-[9px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">Terpakai HT</span>
                                                            </div>
                                                            <div className="text-emerald-700 bg-white px-2.5 py-1.5 rounded-lg border border-emerald-200 font-bold text-[11px] leading-relaxed">
                                                                {activeOngoingOrder.used_scrap_rak}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs font-mono space-y-1.5 shadow-xs">
                                                            <div className="font-bold text-[11px] text-amber-800 flex items-center justify-between">
                                                                <span className="flex items-center gap-1.5"><span>Rekomendasi Scrap Toko</span></span>
                                                                <span className="text-[9px] bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full font-bold">Perlu Konfirmasi</span>
                                                            </div>
                                                            <div className="text-amber-800 bg-white px-2.5 py-1.5 rounded-lg border border-amber-200 font-bold text-[11px] leading-relaxed">
                                                                {activeOngoingOrder.used_scrap_rak}
                                                            </div>
                                                            <div className="text-[10px] text-amber-700 font-sans italic flex items-center gap-1">
                                                                <span>Buka "Detail Lengkap" untuk memilih [ Dipakai ] atau [ Ditolak ].</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* CARD BOTTOM ACTION FOOTER */}
                                    <div className="relative z-10 flex flex-wrap justify-between items-center gap-3 pt-3 border-t border-slate-200">
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleOpenDetailModal(activeOngoingOrder)}
                                                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition shadow-xs cursor-pointer"
                                                title="Buka Modal Detail Lengkap, Sketsa & Histori"
                                            >
                                                <Eye className="w-3.5 h-3.5 text-slate-500" />
                                                <span className="font-bold text-[11px]">Detail Lengkap</span>
                                            </button>

                                            {activeOngoingOrder.current_division !== 'divisi_ht' && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenComplaintModal(activeOngoingOrder)}
                                                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition cursor-pointer shadow-xs"
                                                >
                                                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                                                    <span>Lapor Cacat</span>
                                                </button>
                                            )}
                                        </div>

                                        {/* ACTION SELESAI / MULAI */}
                                        <div className="flex flex-wrap items-center gap-2 ml-auto">
                                            {isJobStarted ? (
                                                <>
                                                    <span className="text-xs text-slate-500 font-mono font-semibold hidden sm:inline-block">Teruskan ke:</span>
                                                    <select
                                                        value={activeCardNextDiv}
                                                        onChange={(e) => setActiveCardNextDiv(e.target.value)}
                                                        className="bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:border-[#1b68b0] font-mono shadow-xs cursor-pointer"
                                                    >
                                                        <option value="QC_Ready">Selesai & Lolos QC (Siap Kirim)</option>
                                                        <option value="divisi_ht">Teruskan ke Divisi Potong (HT & Bor)</option>
                                                        <option value="divisi_gm">Teruskan ke Divisi GM (Gosok)</option>
                                                        <option value="divisi_bv">Teruskan ke Divisi BV (Bevel)</option>
                                                        <option value="divisi_etsa">Teruskan ke Divisi Etsa (Blur)</option>
                                                    </select>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleFinishJobSubmit(activeOngoingOrder.id, activeCardNextDiv)}
                                                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-[#70b03c] hover:bg-[#5f9733] shadow-xs hover:shadow-sm transition cursor-pointer"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                        <span className="uppercase font-bold text-xs">Selesai Pengerjaan</span>
                                                        <ArrowRight className="w-3.5 h-3.5" />
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => handleStartJob(activeOngoingOrder.id)}
                                                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-[#1b68b0] hover:bg-[#15528c] shadow-xs hover:shadow-sm transition cursor-pointer"
                                                >
                                                    <Hammer className="w-4 h-4" />
                                                    <span className="uppercase font-bold text-xs">Mulai Mengerjakan</span>
                                                    <ArrowRight className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-6 sm:p-8 text-center space-y-2 shadow-xs">
                                    <Clock className="w-8 h-8 text-slate-400 mx-auto" />
                                    <h4 className="text-sm font-bold text-[#242222]">Belum Ada Pekerjaan yang Sedang Dikerjakan di Workstation</h4>
                                    <p className="text-xs text-slate-500 max-w-lg mx-auto">
                                        Silakan pilih salah satu order dari tabel antrean di bawah, kemudian klik tombol <strong className="text-[#1b68b0]">"Mulai Kerjakan"</strong> untuk memindahkan baris antrean ke card pengerjaan aktif ini dan mengaktifkan stopwatch live running timer.
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })()}

                {/* TABEL ANTREAN / RIWAYAT WORKSTATION DIVISI */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
                    <div className="flex flex-wrap justify-between items-center border-b border-slate-200 pb-3 gap-3">
                        <div>
                            <h3 className="text-base font-bold text-[#242222] flex items-center gap-2">
                                <FileText className="w-5 h-5 text-[#1b68b0]" />
                                <span>
                                    {productionSubTab.endsWith('_history') || productionSubTab === 'QC_Ready'
                                        ? 'Riwayat Orderan Selesai Divisi'
                                        : 'Tabel Antrean Workstation Divisi'}
                                </span>
                            </h3>
                            {isDivisionWorker ? (
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {productionSubTab.endsWith('_history')
                                        ? 'Daftar riwayat pekerjaan yang telah diselesaikan oleh divisi ini.'
                                        : <>Urutan antrean: <strong className="text-rose-600">INTERUPSI REVISI</strong> berada di posisi teratas, disusul <strong className="text-amber-600">PRIORITAS</strong>, kemudian antrean reguler.</>}
                                </p>
                            ) : (
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Order berstatus <strong className="text-rose-600">PRIORITAS</strong> otomatis diurutkan di paling atas.
                                </p>
                            )}
                        </div>

                        {/* STATISTIK MASUK & SELESAI */}
                        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                            {(() => {
                                const curKey = isDivisionWorker ? userRole.replace('divisi_', '').toUpperCase() : 'HT';
                                const isHistorySubTab = productionSubTab.endsWith('_history') || productionSubTab === 'QC_Ready';

                                const enteredRangeList = initialOrders.filter(o => {
                                    const ts = (o.division_timestamps && o.division_timestamps[curKey]) ? o.division_timestamps[curKey] : {};
                                    const dateToCheck = ts.started_at || ts.created_at || o.created_at || o.order_date;
                                    const matchDiv = isDivisionWorker ? (o.current_division === userRole || (o.division_progress?.[curKey] && o.division_progress?.[curKey] !== 'N/A' && o.division_progress?.[curKey] !== 'Belum')) : true;
                                    return matchDiv && isDateInTimeRange(dateToCheck, isHistorySubTab ? statTimeRange : 'today');
                                });

                                const completedRangeList = initialOrders.filter(o => {
                                    const ts = (o.division_timestamps && o.division_timestamps[curKey]) ? o.division_timestamps[curKey] : {};
                                    const dateToCheck = ts.completed_at || o.execution_completed_at;
                                    const matchDiv = (o.division_progress && o.division_progress[curKey] === 'Selesai');
                                    return matchDiv && isDateInTimeRange(dateToCheck, isHistorySubTab ? statTimeRange : 'today');
                                });

                                const rangeLabels = {
                                    today: 'Hari Ini',
                                    '2days': '2 Hari',
                                    week: '1 Minggu',
                                    month: '1 Bulan',
                                    year: '1 Tahun',
                                    all: 'Semua Waktu'
                                };

                                if (isHistorySubTab) {
                                    return (
                                        <div className="flex flex-wrap items-center gap-2">
                                            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl shadow-xs">
                                                <span className="text-slate-500 text-[11px]">Rentang:</span>
                                                <select
                                                    value={statTimeRange}
                                                    onChange={(e) => setStatTimeRange(e.target.value)}
                                                    className="bg-transparent text-[#1b68b0] font-bold text-xs focus:outline-none cursor-pointer"
                                                >
                                                    <option value="today">Hari Ini</option>
                                                    <option value="2days">2 Hari Terakhir</option>
                                                    <option value="week">1 Minggu (7 Hari)</option>
                                                    <option value="month">1 Bulan (30 Hari)</option>
                                                    <option value="year">1 Tahun Ini</option>
                                                    <option value="all">Semua Waktu</option>
                                                </select>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => setStatFilterType(prev => prev === 'entered' ? 'all' : 'entered')}
                                                className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition cursor-pointer ${
                                                    statFilterType === 'entered'
                                                        ? 'bg-[#1b68b0] text-white border-[#1b68b0] font-bold shadow-xs'
                                                        : 'bg-blue-50 hover:bg-blue-100 text-[#1b68b0] border-blue-200'
                                                }`}
                                                title={`Klik untuk memilah riwayat orderan masuk (${rangeLabels[statTimeRange]})`}
                                            >
                                                <span>Masuk ({rangeLabels[statTimeRange]}):</span>
                                                <strong className="font-bold">{enteredRangeList.length} Order</strong>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setStatFilterType(prev => prev === 'completed' ? 'all' : 'completed')}
                                                className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition cursor-pointer ${
                                                    statFilterType === 'completed'
                                                        ? 'bg-[#70b03c] text-white border-[#70b03c] font-bold shadow-xs'
                                                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                                                }`}
                                                title={`Klik untuk memilah riwayat orderan selesai (${rangeLabels[statTimeRange]})`}
                                            >
                                                <span>Selesai ({rangeLabels[statTimeRange]}):</span>
                                                <strong className="font-bold">{completedRangeList.length} Order</strong>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setShowRekapModal(true)}
                                                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                                                title="Buka Rekap Rincian Harian & Laporan Performance"
                                            >
                                                <BarChart3 className="w-3.5 h-3.5 text-[#1b68b0]" />
                                                <span>Rekap Rincian</span>
                                            </button>

                                            {statFilterType !== 'all' && (
                                                <button
                                                    type="button"
                                                    onClick={() => setStatFilterType('all')}
                                                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1 cursor-pointer text-[11px]"
                                                    title="Reset Filter Tampilan Antrean"
                                                >
                                                    <span>✕ Reset</span>
                                                </button>
                                            )}
                                        </div>
                                    );
                                }

                                return (
                                    <div className="flex flex-wrap items-center gap-2">
                                        <div className="bg-blue-50 text-[#1b68b0] border border-blue-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs">
                                            <span>Masuk Hari Ini:</span>
                                            <strong className="font-bold">{enteredRangeList.length} Order</strong>
                                        </div>
                                        <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs">
                                            <span>Selesai Hari Ini:</span>
                                            <strong className="font-bold">{completedRangeList.length} Order</strong>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>

                    {(() => {
                        const curDivKey = isDivisionWorker
                            ? userRole.replace('divisi_', '').toUpperCase()
                            : (productionSubTab.startsWith('divisi_') ? productionSubTab.replace('divisi_', '').toUpperCase() : 'HT');

                        const isHistorySubTab = productionSubTab.endsWith('_history') || productionSubTab === 'QC_Ready';

                        const rawFiltered = initialOrders.filter(o => {
                            if (isHistorySubTab) {
                                const code = userRole.replace('divisi_', '').toUpperCase();
                                const p = o.division_progress || {};
                                const isBaseHistoryMatch = isDivisionWorker
                                    ? (o.current_division !== userRole && (p[code] === 'Selesai' || p[code.toLowerCase()] === 'Selesai'))
                                    : checkOrderDivisi(o, productionSubTab);

                                if (!isBaseHistoryMatch) return false;

                                const ts = (o.division_timestamps && o.division_timestamps[curDivKey]) ? o.division_timestamps[curDivKey] : {};
                                const dateEntered = ts.started_at || ts.created_at || o.created_at || o.order_date;
                                const dateCompleted = ts.completed_at || o.execution_completed_at;

                                if (statFilterType === 'entered') {
                                    return isDateInTimeRange(dateEntered, statTimeRange);
                                } else if (statFilterType === 'completed') {
                                    return isDateInTimeRange(dateCompleted, statTimeRange);
                                } else {
                                    if (statTimeRange === 'all') return true;
                                    return isDateInTimeRange(dateCompleted || dateEntered, statTimeRange);
                                }
                            }

                            if (isDivisionWorker) {
                                return o.current_division === userRole;
                            }
                            return checkOrderDivisi(o, productionSubTab);
                        });

                        const sortedWorkstationOrders = [...rawFiltered].sort((a, b) => {
                            if (a.priority_status === 'Prioritas' && b.priority_status !== 'Prioritas') return -1;
                            if (a.priority_status !== 'Prioritas' && b.priority_status === 'Prioritas') return 1;
                            return b.id - a.id;
                        });

                        if (sortedWorkstationOrders.length === 0) {
                            return (
                                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-2">
                                    <Factory className="w-8 h-8 text-slate-400 mx-auto" />
                                    <h4 className="font-bold text-[#242222] text-base">Tidak Ada Orderan Dalam Antrean saat Ini</h4>
                                    <p className="text-xs text-slate-500">Semua orderan di workstation ini telah selesai dikerjakan atau belum didispatch oleh Gudang.</p>
                                </div>
                            );
                        }

                        const activeOngoingId = (() => {
                            if (activeWorkingOrderId) return activeWorkingOrderId;
                            const found = initialOrders.find(o => {
                                if (isDivisionWorker) {
                                    return o.current_division === userRole && o.division_progress?.[curDivKey] === 'Sedang Dikerjakan';
                                }
                                if (productionSubTab.startsWith('divisi_')) {
                                    return o.current_division === productionSubTab && o.division_progress?.[curDivKey] === 'Sedang Dikerjakan';
                                }
                                return false;
                            });
                            return found?.id || null;
                        })();

                        return (
                            <div className="overflow-x-auto rounded-xl border border-slate-200">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold">
                                        <tr>
                                            <th className="p-3">No SPO & Prioritas</th>
                                            <th className="p-3">Jenis Kaca & Ukuran & Detail</th>
                                            <th className="p-3">Progres Tahapan Divisi</th>
                                            <th className="p-3 text-right">Aksi Pengerjakan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {sortedWorkstationOrders.map(o => {
                                            const isRevision = isDivisionWorker && o.revision_status === 'pending_division';
                                            const isPriority = o.priority_status === 'Prioritas';
                                            const isCurrentlyActiveInCard = isDivisionWorker && activeOngoingId === o.id;

                                            return (
                                                <tr key={o.id} className={`transition ${
                                                    isCurrentlyActiveInCard
                                                        ? 'bg-blue-50/50 border-l-4 border-l-[#1b68b0]'
                                                        : isRevision
                                                            ? 'bg-rose-50/50 border-l-4 border-l-rose-500'
                                                            : isPriority
                                                                ? 'bg-amber-50/40 border-l-4 border-l-amber-500'
                                                                : 'hover:bg-slate-50/70'
                                                }`}>
                                                    <td className="p-3 font-mono">
                                                        <div className="font-extrabold text-[#1b68b0] text-sm flex flex-wrap items-center gap-1.5">
                                                            <span>{o.spo_number}</span>
                                                            {isRevision && (
                                                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                                                                    <span>REVISI TOKO</span>
                                                                </span>
                                                            )}
                                                            {isPriority && !isRevision && (
                                                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 shadow-xs">
                                                                    🔥 PRIORITAS
                                                                </span>
                                                            )}
                                                            {!isPriority && !isRevision && (
                                                                <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200 shadow-xs">
                                                                    Biasa
                                                                </span>
                                                            )}
                                                            {isCurrentlyActiveInCard && (
                                                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#1b68b0] border border-blue-200 font-mono">
                                                                    ● DI MEJA KERJA
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-[#242222] font-bold text-xs mt-0.5">{o.customer_name}</div>
                                                        <div className="text-[10px] text-slate-500 mt-1">Order: {formatIndonesianDate(o.order_date)}</div>
                                                        <div className="text-[10px] text-amber-800 font-bold">Deadline: {o.deadline_date || '-'}</div>
                                                        {o.revision_status === 'pending_division' && (
                                                            <div className="mt-1.5 bg-rose-50 border border-rose-200 rounded-xl p-2 text-rose-800 space-y-1 shadow-xs">
                                                                <div className="flex justify-between items-center text-[10px] font-bold">
                                                                    <span className="text-rose-700 flex items-center gap-1">PERINGATAN REVISI TOKO</span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleAcknowledgeRevision(o.id)}
                                                                        className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-2 py-0.5 rounded text-[10px] cursor-pointer shadow-xs"
                                                                    >
                                                                        Terima & Eksekusi Revisi
                                                                    </button>
                                                                </div>
                                                                {Object.values(o.division_progress || {}).includes('Sedang Dikerjakan') && (
                                                                    <div className="bg-rose-600 text-white font-bold text-[10px] p-1 rounded">
                                                                        PERINGATAN: Orderan ini SEDANG DIKERJAKAN di divisi dan ADA REVISIAN dari Admin Toko!
                                                                    </div>
                                                                )}
                                                                {o.revision_notes && (
                                                                    <div className="text-[10px] text-amber-900 font-mono bg-white p-1 rounded border border-rose-200">
                                                                        Catatan: {o.revision_notes}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        {o.complaint_status === 'pending_gudang' && (
                                                            <div className="mt-1.5 bg-amber-50 border border-amber-200 rounded-xl p-2 text-amber-800 space-y-1 shadow-xs">
                                                                <div className="flex justify-between items-center text-[10px] font-bold">
                                                                    <span className="text-amber-800 flex items-center gap-1">KOMPLAIN DARI {o.complaint_data?.reporting_division?.replace('divisi_', '').toUpperCase()}</span>
                                                                    {(userRole === 'admin_gudang' || userRole === 'owner') && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => { setSelectedComplaintOrder(o); setShowGudangDecisionModal(true); }}
                                                                            className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-2 py-0.5 rounded text-[10px] cursor-pointer shadow-xs"
                                                                        >
                                                                            Tinjau Komplain
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                <div className="text-[10px] text-amber-800 font-mono">
                                                                    Kendala: <strong>{o.complaint_data?.reason}</strong> {o.complaint_data?.notes ? `- "${o.complaint_data.notes}"` : ''}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {o.complaint_status === 're_cut_needed' && o.current_division === 'divisi_ht' && (
                                                            <div className="mt-1.5 bg-rose-50 border border-rose-200 rounded-xl p-1.5 text-rose-700 text-[10px] font-bold font-mono">
                                                                POTONG ULANG (GANTI KACA DARI DIVISI {o.complaint_data?.reporting_division?.replace('divisi_', '').toUpperCase() || ''})
                                                            </div>
                                                        )}

                                                        {o.sketch_photo_path && (
                                                            <div className="mt-1.5">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleOpenSketchLightbox(o.sketch_photo_path, o.spo_number)}
                                                                    className="w-full bg-blue-50 hover:bg-blue-100 text-[#1b68b0] border border-blue-200 rounded-lg p-1.5 flex items-center justify-between gap-2 text-xs transition shadow-xs cursor-pointer"
                                                                    title="Klik untuk memperbesar gambar sketsa pola & sambungan kaca"
                                                                >
                                                                    <div className="flex items-center gap-1.5 overflow-hidden">
                                                                        <img
                                                                            src={o.sketch_photo_path.startsWith('http') || o.sketch_photo_path.startsWith('/') ? o.sketch_photo_path : `/storage/${o.sketch_photo_path}`}
                                                                            alt="Sketsa Pola"
                                                                            className="w-7 h-7 rounded object-cover border border-blue-200 bg-white shrink-0"
                                                                        />
                                                                        <span className="font-bold text-[10px] truncate">Sketsa Sambungan Kaca</span>
                                                                    </div>
                                                                    <span className="text-[9px] bg-white text-[#1b68b0] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 border border-blue-200">Lihat</span>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>

                                                    <td className="p-3 max-w-xs space-y-1">
                                                        {Array.isArray(o.items) && o.items.length > 0 ? (
                                                            o.items.map((it, idx) => (
                                                                <div key={idx} className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-[11px] space-y-0.5">
                                                                    <div className="font-bold text-[#242222]">#{idx + 1}. {it.glass_type}</div>
                                                                    <div className="text-slate-600 font-mono">{it.length_cm} x {it.width_cm} cm ({it.thickness_mm}mm) — Qty: {it.qty || 1}</div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-[11px]">
                                                                <div className="font-bold text-[#242222]">{o.glass_type}</div>
                                                                <div className="text-slate-600 font-mono">{o.length_cm} x {o.width_cm} cm ({o.thickness_mm}mm)</div>
                                                            </div>
                                                        )}

                                                        {o.used_scrap_rak && o.used_scrap_rak !== '-' && o.used_scrap_rak.trim() !== '' && (
                                                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-2 text-[11px] font-mono space-y-0.5 shadow-xs">
                                                                <div className="font-bold text-[10px] text-amber-800 flex items-center gap-1">
                                                                    <span>Rekomendasi Scrap:</span>
                                                                </div>
                                                                <div className="text-amber-900 bg-white px-2 py-1 rounded border border-amber-200 font-bold text-[10px] whitespace-pre-wrap leading-tight">
                                                                    {o.used_scrap_rak}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </td>

                                                    <td className="p-3">
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {(() => {
                                                                const reqSet = new Set();
                                                                if (Array.isArray(o.processes)) o.processes.forEach(p => reqSet.add(String(p).toUpperCase()));
                                                                if (Array.isArray(o.items)) {
                                                                    o.items.forEach(it => {
                                                                        if (Array.isArray(it.processes)) it.processes.forEach(p => reqSet.add(String(p).toUpperCase()));
                                                                    });
                                                                }

                                                                const activeProcs = ['HT', 'GM', 'BV', 'Etsa'].filter(proc => {
                                                                    if (proc === 'HT') return true;
                                                                    const status = (o.division_progress && o.division_progress[proc]) ? o.division_progress[proc] : 'Belum';
                                                                    if (status !== 'N/A') return true;
                                                                    if (reqSet.has(proc.toUpperCase())) return true;
                                                                    return false;
                                                                });

                                                                const renderList = activeProcs.length > 0 ? activeProcs : ['HT', 'GM', 'BV', 'Etsa'];

                                                                return renderList.map(proc => {
                                                                    const status = (o.division_progress && o.division_progress[proc]) ? o.division_progress[proc] : 'Belum';
                                                                    const isDone = status === 'Selesai';
                                                                    const isWorking = status === 'Sedang Dikerjakan';
                                                                    const isNA = status === 'N/A';

                                                                    const ts = (o.division_timestamps && o.division_timestamps[proc]) ? o.division_timestamps[proc] : {};
                                                                    const timeStr = isDone && ts.completed_at
                                                                        ? formatIndonesianDate(ts.completed_at)
                                                                        : (isWorking || ts.started_at)
                                                                            ? formatIndonesianDate(ts.started_at)
                                                                            : null;

                                                                    return (
                                                                        <div key={proc} className="flex flex-col">
                                                                            <span
                                                                                className={`text-[10px] px-2 py-0.5 rounded font-bold font-mono border flex items-center gap-1 ${
                                                                                    isDone
                                                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                                        : isWorking
                                                                                            ? 'bg-blue-50 text-[#1b68b0] border-blue-300 animate-pulse'
                                                                                            : isNA
                                                                                                ? 'bg-slate-100 text-slate-400 border-slate-200'
                                                                                                : 'bg-white text-slate-500 border-slate-200'
                                                                                }`}
                                                                            >
                                                                                <span>{proc}: {status}</span>
                                                                            </span>
                                                                            {timeStr && (
                                                                                <span className="text-[9px] font-mono text-slate-500 mt-0.5 px-0.5">
                                                                                    {isDone ? '🏁 ' + timeStr : '📥 ' + timeStr}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                });
                                                            })()}
                                                        </div>
                                                    </td>

                                                    <td className="p-3 text-right">
                                                        {(() => {
                                                            const isHistoryRow = productionSubTab.endsWith('_history') ||
                                                                productionSubTab === 'QC_Ready' ||
                                                                (isDivisionWorker && o.current_division !== userRole);

                                                            if (!isDivisionWorker || isHistoryRow) {
                                                                return (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleOpenDetailModal(o)}
                                                                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs hover:shadow-sm transition cursor-pointer ml-auto"
                                                                    >
                                                                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                                                                        <span className="font-bold text-[11px]">Detail</span>
                                                                        <ArrowRight className="w-3.5 h-3.5 text-[#1b68b0]" />
                                                                    </button>
                                                                );
                                                            }

                                                            return (
                                                                <div className="flex flex-wrap items-center justify-end gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleOpenDetailModal(o)}
                                                                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition cursor-pointer"
                                                                        title="Lihat Detail Lengkap SPO, Sketsa & Riwayat"
                                                                    >
                                                                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                                                                        <span className="font-bold text-[11px]">Detail</span>
                                                                    </button>

                                                                    {isCurrentlyActiveInCard ? (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                document.getElementById('active-workstation-card')?.scrollIntoView({ behavior: 'smooth' });
                                                                            }}
                                                                            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs text-[#1b68b0] bg-blue-50 border border-blue-200 shadow-xs cursor-pointer"
                                                                            title="Sedang Dikerjakan di Card Atas"
                                                                        >
                                                                            <span className="w-2 h-2 rounded-full bg-[#1b68b0] animate-pulse"></span>
                                                                            <span className="font-mono text-[11px]">Sedang Berjalan</span>
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleStartWorkstationJob(o)}
                                                                            className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-xl font-bold text-xs text-white bg-[#1b68b0] hover:bg-[#15528c] shadow-xs hover:shadow-sm transition cursor-pointer"
                                                                            title="Mulai Pengerjaan & Pindahkan ke Card Proses di Atas"
                                                                        >
                                                                            <Hammer className="w-3 h-3" />
                                                                            <span className="font-bold text-[11px]">Mulai Kerjakan</span>
                                                                            <ArrowRight className="w-3 h-3" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            );
                                                        })()}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
}
