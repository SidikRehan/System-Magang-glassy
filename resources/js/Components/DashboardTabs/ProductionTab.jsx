import React from 'react';
import { router } from '@inertiajs/react';
import { roleTitles, formatIndonesianDate, checkOrderDivisi, isDateInTimeRange } from '@/Utils/dashboardHelpers';

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
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2.5">
                        🏭 Workstation & Disposisi Workflow Divisi Pabrik
                    </h2>
                    <p className="text-slate-400 text-sm">Monitoring & eksekusi pengerjaan kaca per divisi (Potong HT, Gosok GM, Bevel BV, & Etsa Blur)</p>
                </div>
                <span className="text-xs text-cyan-400 bg-cyan-400/10 px-3.5 py-1.5 rounded-full border border-cyan-400/20 font-bold">
                    Role Aktif: {roleTitles[userRole]}
                </span>
            </div>

            {/* WORKSTATION DIVISION SUB-TAB FILTER */}
            {isDivisionWorker ? (
                <div className="flex flex-wrap items-center bg-slate-900 border border-slate-800 p-1.5 rounded-xl gap-2">
                    <button
                        onClick={() => setProductionSubTab(`${userRole}_active`)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${productionSubTab === `${userRole}_active` ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                    >
                        <span>🔨 Active Pengerjaan {roleTitles[userRole]}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-extrabold ${productionSubTab === `${userRole}_active` ? 'bg-slate-950/40 text-cyan-200' : 'bg-slate-800 text-slate-300'}`}>
                            {initialOrders.filter(o => o.current_division === userRole).length}
                        </span>
                    </button>

                    <button
                        onClick={() => setProductionSubTab(`${userRole}_history`)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${productionSubTab === `${userRole}_history` ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                    >
                        <span>📜 Riwayat Selesai {roleTitles[userRole]}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-extrabold ${productionSubTab === `${userRole}_history` ? 'bg-slate-950/40 text-emerald-200' : 'bg-slate-800 text-slate-300'}`}>
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
                <div className="flex flex-wrap items-center bg-slate-900 border border-slate-800 p-1.5 rounded-xl gap-1">
                    {[
                        { key: 'all', label: '⚡ Semua Active Pengerjaan', count: initialOrders.filter(o => checkOrderDivisi(o, 'all')).length },
                        { key: 'divisi_ht', label: '✂️ Divisi Potong (HT)', count: initialOrders.filter(o => checkOrderDivisi(o, 'divisi_ht')).length },
                        { key: 'divisi_gm', label: '✨ Divisi GM (Gosok)', count: initialOrders.filter(o => checkOrderDivisi(o, 'divisi_gm')).length },
                        { key: 'divisi_bv', label: '💎 Divisi BV (Bevel)', count: initialOrders.filter(o => checkOrderDivisi(o, 'divisi_bv')).length },
                        { key: 'divisi_etsa', label: '🎨 Divisi Etsa (Blur)', count: initialOrders.filter(o => checkOrderDivisi(o, 'divisi_etsa')).length },
                        { key: 'QC_Ready', label: '✅ Selesai Dikerjakan (Siap Kirim QC)', count: initialOrders.filter(o => checkOrderDivisi(o, 'QC_Ready')).length },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setProductionSubTab(tab.key)}
                            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${productionSubTab === tab.key ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                        >
                            <span>{tab.label}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-extrabold ${productionSubTab === tab.key ? 'bg-slate-950/40 text-cyan-200' : 'bg-slate-800 text-slate-300'}`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {isDivisionWorker && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-wrap justify-between items-center text-xs gap-3">
                    <div className="flex items-center gap-2.5">
                        <span className="text-lg">♻️</span>
                        <div>
                            <span className="font-bold text-slate-200">Indikator Efisiensi Bahan & Limbah Manufaktur:</span>
                            <p className="text-[11px] text-slate-400">
                                Gunakan sisa potongan kaca rak ({initialScrap.length} potongan tersedia) untuk meminimalkan scrap kaca dan menekan HPP pabrik.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setActiveTab('scrap')}
                            className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                            📦 Cek Rak Sisa Kaca
                        </button>
                        <button
                            onClick={() => setActiveTab('tools')}
                            className="px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                            🛠️ Pinjam Alat Kerja
                        </button>
                    </div>
                </div>
            )}

            {/* BERSAMAAN DENGAN ANTREAN: WARNING BANNER PENDING KOMPLAIN KACA UNTUK ADMIN GUDANG */}
            {initialOrders.filter(o => o.complaint_status === 'pending_gudang').length > 0 && (userRole === 'admin_gudang' || userRole === 'owner') && (
                <div className="bg-amber-950/90 border-2 border-amber-500/80 rounded-2xl p-5 shadow-2xl space-y-3 animate-pulse">
                    <div className="flex justify-between items-center border-b border-amber-500/40 pb-2.5">
                        <h3 className="text-sm font-black text-amber-300 flex items-center gap-2">
                            <span>⚠️ PERINGATAN KRITIS: ADA KOMPLAIN KACA CACAT / BARET MENUNGGU DECISION GUDANG ({initialOrders.filter(o => o.complaint_status === 'pending_gudang').length})</span>
                        </h3>
                        <span className="text-[10px] text-amber-200 bg-amber-500/20 px-2.5 py-1 rounded-full font-mono font-bold border border-amber-500/40">Tindakan Gudang Diperlukan</span>
                    </div>
                    <div className="space-y-2.5">
                        {initialOrders.filter(o => o.complaint_status === 'pending_gudang').map(o => (
                            <div key={o.id} className="bg-slate-950/90 border border-amber-500/50 p-3.5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div className="space-y-1">
                                    <div className="font-extrabold text-amber-300 text-xs font-mono">
                                        SPO #{o.spo_number} — Pelapor: Divisi {o.complaint_data?.reporting_division?.replace('divisi_', '').toUpperCase() || ''}
                                    </div>
                                    <div className="text-slate-300 text-xs">
                                        Pelanggan: <strong>{o.customer_name}</strong> | Kendala: <strong className="text-rose-400">{o.complaint_data?.reason || 'Kaca Cacat'}</strong>
                                    </div>
                                    {o.complaint_data?.notes && (
                                        <div className="text-slate-400 text-[11px] italic font-mono bg-slate-900/60 p-1.5 rounded border border-slate-800">
                                            Catatan Pekerja: "{o.complaint_data.notes}"
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => { setSelectedComplaintOrder(o); setShowGudangDecisionModal(true); }}
                                    className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition shadow-lg shadow-amber-500/20 whitespace-nowrap cursor-pointer flex items-center gap-1.5"
                                >
                                    <span>⚖️ Tinjau & Ambil Keputusan</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* SECTION A: ORDER ANTREAN ADMIN GUDANG */}
            {(userRole === 'admin_gudang' || userRole === 'owner') && (productionSubTab === 'all' || productionSubTab === 'gudang') && (
                <div className="bg-slate-900/80 border-2 border-blue-500/40 rounded-2xl p-6 shadow-xl space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                        <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
                            🏭 Antrean Disposisi Admin Gudang
                        </h3>
                        <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/30">
                            {initialOrders.filter(o => o.status === 'pengerjaan' && o.current_division === 'admin_gudang').length} Order
                        </span>
                    </div>

                    {initialOrders.filter(o => o.status === 'pengerjaan' && o.current_division === 'admin_gudang').length === 0 ? (
                        <p className="text-xs text-slate-500 italic p-3 text-center bg-slate-950/40 rounded-xl border border-slate-800">
                            Tidak ada orderan baru yang menunggu disposisi gudang saat ini.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {initialOrders.filter(o => o.status === 'pengerjaan' && o.current_division === 'admin_gudang').sort((a, b) => b.id - a.id).map(o => (
                                <div key={o.id} className="bg-slate-950 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-4 space-y-3 transition">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="font-extrabold text-cyan-400 font-mono text-base">{o.spo_number}</span>
                                            <div className="text-xs space-y-0.5 mt-1">
                                                <div className="font-bold text-slate-100">
                                                    <span className="text-slate-400 font-normal">Nama : </span>
                                                    <span>{o.customer_name || '-'}</span>
                                                </div>
                                                <div className="text-slate-300 font-mono">
                                                    <span className="text-slate-400 font-normal font-sans">No Phone : </span>
                                                    <span>{o.customer_phone || '-'}</span>
                                                </div>
                                                <div className="text-cyan-300 font-medium whitespace-pre-line leading-snug">
                                                    <span className="text-slate-400 font-normal">Alamat : </span>
                                                    <span>{o.customer_address || '-'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border shadow-sm ${o.priority_status === 'Prioritas' ? 'bg-red-600 text-white border-red-500 shadow-red-600/30 animate-pulse font-black' : 'bg-white text-slate-950 border-slate-200'}`}>
                                            {o.priority_status === 'Prioritas' ? '🔥 PRIORITAS' : '⚪ Biasa'}
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 space-y-1">
                                        <div className="font-semibold text-slate-200">Kaca: {o.glass_type}</div>
                                        <div className="text-slate-400 font-mono">Ukuran: {o.length_cm} x {o.width_cm} cm ({o.thickness_mm}mm)</div>
                                        <div className="text-[11px] text-cyan-300 font-mono pt-1.5 border-t border-slate-800/80">
                                            📅 Pembuatan Order: <strong className="text-cyan-400">{formatIndonesianDate(o.order_date)}</strong>
                                        </div>
                                    </div>

                                    {o.revision_status === 'editing' && (
                                        <div className="bg-rose-950/90 border-2 border-rose-500 rounded-xl p-3 text-rose-200 text-xs space-y-1.5 animate-pulse shadow-lg">
                                            <div className="font-extrabold text-rose-300 flex items-center justify-between text-xs">
                                                <span className="flex items-center gap-1.5">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                                                    <span>⏳ SEDANG DIREVISI OLEH ADMIN TOKO...</span>
                                                </span>
                                                <span className="bg-rose-500 text-white font-mono px-2 py-0.5 rounded text-[10px]">
                                                    LOCKED
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-rose-300 leading-relaxed">
                                                Admin Toko sedang mengubah ukuran atau catatan pesanan ini. Harap tunggu hingga Admin Toko selesai menyimpan revisi sebelum melakukan disposisi bahan baku.
                                            </p>
                                        </div>
                                    )}

                                    {o.revision_status === 'pending_gudang' && (
                                        <div className="bg-amber-950/80 border-2 border-amber-500 rounded-xl p-3 text-amber-200 text-xs space-y-2">
                                            <div className="font-extrabold text-amber-300 flex items-center justify-between text-xs">
                                                <span className="flex items-center gap-1.5">
                                                    <span>⚠️ ORDERAN TELAH DIREVISI OLEH ADMIN TOKO</span>
                                                </span>
                                                <span className="bg-amber-500 text-slate-950 font-mono font-extrabold px-2 py-0.5 rounded text-[10px]">
                                                    REVISI DISIMPAN
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-200 leading-relaxed">
                                                Admin Toko telah selesai menginput dan menyimpan revisi. Admin Gudang dapat memeriksa spesifikasi/ukuran terbaru di atas dan dapat langsung mengeklik tombol <strong>Disposisi Divisi</strong> di bawah.
                                            </p>
                                            {o.revision_notes && (
                                                <div className="bg-slate-950/90 p-2 rounded border border-amber-500/40 text-[11px] text-amber-300 font-mono">
                                                    📝 Catatan Revisi Toko: {o.revision_notes}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center pt-1">
                                        <span className="text-[11px] text-slate-400 font-mono">📅 Deadline: {o.deadline_date || '-'}</span>
                                        {o.revision_status === 'editing' ? (
                                            <button
                                                disabled
                                                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 bg-slate-800 border border-slate-700 cursor-not-allowed opacity-75 flex items-center gap-1.5"
                                                title="SPO sedang di-edit oleh Admin Toko. Tombol akan otomatis aktif setelah revisi disimpan."
                                            >
                                                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                                                <span>🔒 Terkunci (Sedang Direvisi Admin Toko...)</span>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleOpenDispatchModal(o)}
                                                className="group relative inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:scale-[1.03] active:scale-95 transition-all duration-200 border border-cyan-300/40 overflow-hidden cursor-pointer"
                                            >
                                                <span>Disposisi Divisi</span>
                                                <span className="transition-transform group-hover:translate-x-1 duration-200">➔</span>
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
                {/* CARD PROSES BERJALAN: HANYA BERLAKU UNTUK DIVISI HT, BV, GM, & ETSA */}
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
                                <div className="relative overflow-hidden rounded-3xl border-2 border-cyan-500/50 bg-gradient-to-br from-slate-900 via-slate-900/95 to-cyan-950/40 p-6 sm:p-7 shadow-[0_0_40px_rgba(6,182,212,0.18)] space-y-5">
                                    <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
                                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

                                    {/* CARD TOP HEADER */}
                                    <div className="relative z-10 flex flex-wrap justify-between items-center gap-3 border-b border-cyan-500/20 pb-4">
                                        <div className="flex flex-wrap items-center gap-2.5">
                                            <span className="relative flex h-3 w-3">
                                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isJobStarted ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                                                <span className={`relative inline-flex rounded-full h-3 w-3 ${isJobStarted ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                            </span>
                                            <span className={`text-xs font-black uppercase tracking-wider font-mono flex items-center gap-1.5 ${isJobStarted ? 'text-emerald-300' : 'text-amber-300'}`}>
                                                <span>{isJobStarted ? '⚡ PROSES SEDANG BERLANGSUNG DI MEJA KERJA' : '📋 ANTREAN MASUK DI MEJA KERJA (Belum Dimulai)'}</span>
                                            </span>
                                            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-mono shadow-sm">
                                                Workstation {roleTitles[activeOngoingOrder.current_division] || activeOngoingOrder.current_division}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {activeOngoingOrder.priority_status === 'Prioritas' ? (
                                                <span className="text-[10px] font-black px-3 py-1 rounded-full bg-red-600 text-white border border-red-500 animate-pulse flex items-center gap-1 shadow-sm shadow-red-600/30">
                                                    <span>🔥 PRIORITAS TINGGI</span>
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-white text-slate-950 border border-slate-200 shadow-sm">
                                                    ⚪ Biasa
                                                </span>
                                            )}
                                            <span className="text-xs font-mono font-extrabold text-cyan-400 bg-slate-950/80 px-3 py-1 rounded-xl border border-cyan-500/30">
                                                {activeOngoingOrder.spo_number}
                                            </span>
                                        </div>
                                    </div>

                                    {/* PERINGATAN REVISI TOKO JIKA SEDANG BERJALAN */}
                                    {activeOngoingOrder.revision_status === 'pending_division' && (
                                        <div className="relative z-10 bg-rose-950/90 border-2 border-rose-500 rounded-2xl p-4 text-rose-200 text-xs space-y-2 animate-pulse shadow-xl shadow-rose-950/40">
                                            <div className="flex flex-wrap justify-between items-center gap-2 font-black text-xs text-rose-300">
                                                <span className="flex items-center gap-2 text-sm">
                                                    <span>⚠️ INTERUPSI REVISI DARI ADMIN TOKO!</span>
                                                </span>
                                                <span className="bg-rose-500 text-white font-mono px-2.5 py-0.5 rounded text-[10px] uppercase font-black">
                                                    Tindakan Mendesak
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-200 leading-relaxed">
                                                Admin Toko telah mengirimkan revisi pada SPO ini saat pengerjaan sedang berlangsung! Harap periksa perubahan ukuran/spesifikasi sebelum melanjutkan proses kaca agar tidak terjadi salah potong/proses.
                                            </p>
                                            {activeOngoingOrder.revision_notes && (
                                                <div className="bg-slate-950/90 p-2.5 rounded-lg border border-rose-500/40 text-xs text-amber-300 font-mono">
                                                    📝 Catatan Revisi Toko: <strong>{activeOngoingOrder.revision_notes}</strong>
                                                </div>
                                            )}
                                            <div className="flex justify-end pt-1">
                                                <button
                                                    type="button"
                                                    onClick={() => handleAcknowledgeRevision(activeOngoingOrder.id)}
                                                    className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition shadow-lg shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
                                                >
                                                    <span>🔄 Terima & Eksekusi Revisi SPO</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* CARD MAIN BODY GRID */}
                                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                                        <div className="md:col-span-4 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-md">
                                            <div className="space-y-2.5">
                                                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                                                    <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                        <span>👤 Pemesan / Proyek</span>
                                                    </span>
                                                    <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-bold">
                                                        Order Info
                                                    </span>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <div className="font-extrabold text-base text-white tracking-tight leading-snug">
                                                        {activeOngoingOrder.customer_name || '-'}
                                                    </div>
                                                    <div className="text-slate-300 font-mono text-xs flex items-center gap-1.5">
                                                        <span className="text-slate-500">📞</span>
                                                        <span className="font-semibold">{activeOngoingOrder.customer_phone || '-'}</span>
                                                    </div>
                                                    <div className="text-cyan-300 text-xs flex items-start gap-1.5 leading-snug">
                                                        <span className="text-slate-500 shrink-0">📍</span>
                                                        <span className="font-medium whitespace-pre-line">{activeOngoingOrder.customer_address || '-'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-2 border-t border-slate-800/80 space-y-1.5 font-mono text-xs">
                                                <div className="flex items-center justify-between text-slate-300">
                                                    <span className="text-slate-400 text-[11px]">📅 Order:</span>
                                                    <span className="text-slate-100 font-semibold">{formatIndonesianDate(activeOngoingOrder.order_date)}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-amber-300 font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-xl">
                                                    <span className="text-[11px] flex items-center gap-1">⏰ Deadline:</span>
                                                    <span className="text-xs">{activeOngoingOrder.deadline_date || '-'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="md:col-span-8 bg-slate-950/80 border border-cyan-500/30 rounded-2xl p-4.5 space-y-3.5 shadow-lg flex flex-col justify-between">
                                            <div className="space-y-2.5">
                                                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                                    <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-extrabold flex items-center gap-2">
                                                        <span className="text-sm">💎</span>
                                                        <span>Spesifikasi Kaca & Dimensi</span>
                                                    </div>
                                                    {Array.isArray(activeOngoingOrder.items) && (
                                                        <span className="text-[10px] font-mono font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2.5 py-0.5 rounded-full">
                                                            {activeOngoingOrder.items.length} Item Kaca
                                                        </span>
                                                    )}
                                                </div>

                                                {Array.isArray(activeOngoingOrder.items) && activeOngoingOrder.items.length > 0 ? (
                                                    <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                                                        {activeOngoingOrder.items.map((it, idx) => (
                                                            <div key={idx} className="bg-slate-900/90 hover:bg-slate-900 p-3 rounded-xl border border-slate-800/90 hover:border-cyan-500/40 transition flex flex-wrap items-center justify-between gap-2 shadow-sm">
                                                                <div className="space-y-1 flex-1 min-w-[200px]">
                                                                    <div className="font-extrabold text-cyan-300 text-xs flex items-center gap-2">
                                                                        <span className="bg-cyan-500/20 text-cyan-300 font-mono text-[10px] px-2 py-0.5 rounded-md border border-cyan-500/30">#{idx + 1}</span>
                                                                        <span>{it.glass_type}</span>
                                                                    </div>
                                                                    <div className="text-slate-300 font-mono text-xs flex flex-wrap items-center gap-2 pt-0.5">
                                                                        <span className="bg-slate-950 text-white px-2 py-0.5 rounded border border-slate-800 font-bold">
                                                                            📐 {it.length_cm} × {it.width_cm} cm
                                                                        </span>
                                                                        <span className="text-amber-300 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                                                            Tebal: {it.thickness_mm} mm
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="shrink-0">
                                                                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-xl font-mono text-xs font-black shadow-sm flex items-center gap-1">
                                                                        <span>Qty:</span>
                                                                        <strong className="text-white text-sm">{it.qty || 1}</strong>
                                                                        <span>Pcs</span>
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-2">
                                                        <div className="space-y-1">
                                                            <div className="font-extrabold text-cyan-300 text-xs">
                                                                {activeOngoingOrder.glass_type}
                                                            </div>
                                                            <div className="text-slate-300 font-mono text-xs flex items-center gap-2">
                                                                <span className="bg-slate-950 text-white px-2 py-0.5 rounded border border-slate-800 font-bold">
                                                                    📐 {activeOngoingOrder.length_cm} × {activeOngoingOrder.width_cm} cm
                                                                </span>
                                                                <span className="text-amber-300 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                                                    Tebal: {activeOngoingOrder.thickness_mm} mm
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* ALOKASI / REKOMENDASI KACA SISA (SCRAP) */}
                                            {activeOngoingOrder.used_scrap_rak && activeOngoingOrder.used_scrap_rak !== '-' && activeOngoingOrder.used_scrap_rak.trim() !== '' && (
                                                <div className="pt-1">
                                                    {activeOngoingOrder.used_scrap_rak.startsWith('❌') ? (
                                                        <div className="bg-rose-950/80 border border-rose-500/60 rounded-xl p-2.5 text-xs font-mono space-y-1 shadow-md">
                                                            <div className="font-extrabold text-[11px] text-rose-300 flex items-center justify-between">
                                                                <span className="flex items-center gap-1.5">🚨 <span>Rekomendasi Scrap Ditolak</span></span>
                                                                <span className="text-[9px] bg-rose-500 text-white font-black px-2 py-0.5 rounded-full uppercase">Ditolak HT</span>
                                                            </div>
                                                            <div className="text-rose-200 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-rose-500/30 font-bold text-[11px] leading-relaxed">
                                                                {activeOngoingOrder.used_scrap_rak}
                                                            </div>
                                                        </div>
                                                    ) : activeOngoingOrder.used_scrap_rak.startsWith('✅') ? (
                                                        <div className="bg-emerald-950/80 border border-emerald-500/60 rounded-xl p-2.5 text-xs font-mono space-y-1 shadow-md">
                                                            <div className="font-extrabold text-[11px] text-emerald-300 flex items-center justify-between">
                                                                <span className="flex items-center gap-1.5">✅ <span>Rekomendasi Scrap Terpakai</span></span>
                                                                <span className="text-[9px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">Terpakai HT</span>
                                                            </div>
                                                            <div className="text-emerald-200 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-emerald-500/30 font-bold text-[11px] leading-relaxed">
                                                                {activeOngoingOrder.used_scrap_rak}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="bg-amber-950/90 border border-amber-500/60 rounded-xl p-2.5 text-xs font-mono space-y-1.5 shadow-md">
                                                            <div className="font-extrabold text-[11px] text-amber-400 flex items-center justify-between">
                                                                <span className="flex items-center gap-1.5">🧩 <span>Rekomendasi Scrap Toko</span></span>
                                                                <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-black uppercase">Perlu Konfirmasi</span>
                                                            </div>
                                                            <div className="text-amber-200 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-amber-500/30 font-bold text-[11px] leading-relaxed">
                                                                {activeOngoingOrder.used_scrap_rak}
                                                            </div>
                                                            <div className="text-[10px] text-amber-300/90 font-sans italic flex items-center gap-1">
                                                                <span>💡 Buka "Detail Lengkap" untuk memilih [ ✅ Dipakai ] atau [ ❌ Ditolak ].</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* CARD BOTTOM ACTION FOOTER */}
                                    <div className="relative z-10 flex flex-wrap justify-between items-center gap-3 pt-3 border-t border-cyan-500/20">
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleOpenDetailModal(activeOngoingOrder)}
                                                className="group inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 transition shadow-sm cursor-pointer"
                                                title="Buka Modal Detail Lengkap, Sketsa & Histori"
                                            >
                                                <span className="text-sm">👁️</span>
                                                <span className="font-extrabold text-[11px]">Detail Lengkap</span>
                                            </button>

                                            {activeOngoingOrder.current_division !== 'divisi_ht' && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenComplaintModal(activeOngoingOrder)}
                                                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition cursor-pointer"
                                                >
                                                    <span>⚠️ Lapor Cacat</span>
                                                </button>
                                            )}
                                        </div>

                                        {/* ACTION SELESAI / MULAI */}
                                        <div className="flex flex-wrap items-center gap-2 ml-auto">
                                            {isJobStarted ? (
                                                <>
                                                    <span className="text-xs text-slate-400 font-mono font-semibold hidden sm:inline-block">Teruskan ke:</span>
                                                    <select
                                                        value={activeCardNextDiv}
                                                        onChange={(e) => setActiveCardNextDiv(e.target.value)}
                                                        className="bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-xs font-semibold focus:border-cyan-400 font-mono shadow-inner cursor-pointer"
                                                    >
                                                        <option value="QC_Ready">✅ Selesai & Lolos QC (Siap Kirim)</option>
                                                        <option value="divisi_ht">✂️ Teruskan ke Divisi Potong (HT & Bor)</option>
                                                        <option value="divisi_gm">✨ Teruskan ke Divisi GM (Gosok)</option>
                                                        <option value="divisi_bv">💎 Teruskan ke Divisi BV (Bevel)</option>
                                                        <option value="divisi_etsa">🎨 Teruskan ke Divisi Etsa (Blur)</option>
                                                    </select>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleFinishJobSubmit(activeOngoingOrder.id, activeCardNextDiv)}
                                                        className="group relative inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:via-teal-300 hover:to-cyan-300 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-400/40 hover:scale-[1.02] active:scale-95 transition-all duration-200 border border-emerald-300/40 cursor-pointer"
                                                    >
                                                        <span className="text-sm">✅</span>
                                                        <span className="tracking-wider uppercase font-black text-xs">Selesai Pengerjaan</span>
                                                        <span className="transition-transform group-hover:translate-x-1 duration-200">➔</span>
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => handleStartJob(activeOngoingOrder.id)}
                                                    className="group relative inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:via-teal-300 hover:to-emerald-300 shadow-xl shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:scale-[1.02] active:scale-95 transition-all duration-200 border border-cyan-300/40 cursor-pointer"
                                                >
                                                    <span className="text-sm">⚡</span>
                                                    <span className="tracking-wider uppercase font-black text-xs">Mulai Mengerjakan</span>
                                                    <span className="transition-transform group-hover:translate-x-1 duration-200">➔</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/40 p-6 sm:p-8 text-center space-y-2 shadow-inner">
                                    <div className="text-3xl animate-bounce">⏱️</div>
                                    <h4 className="text-sm font-extrabold text-slate-300">Belum Ada Pekerjaan yang Sedang Dikerjakan di Workstation</h4>
                                    <p className="text-xs text-slate-500 max-w-lg mx-auto">
                                        Silakan pilih salah satu order dari tabel antrean di bawah, kemudian klik tombol <strong className="text-cyan-400">"⚡ Mulai Kerjakan"</strong> untuk memindahkan baris antrean ke card pengerjaan aktif ini dan mengaktifkan stopwatch live running timer.
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })()}

                {/* TABEL ANTREAN / RIWAYAT WORKSTATION DIVISI */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                    <div className="flex flex-wrap justify-between items-center border-b border-slate-800 pb-3 gap-3">
                        <div>
                            <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
                                {productionSubTab.endsWith('_history') || productionSubTab === 'QC_Ready'
                                    ? '📜 Riwayat Orderan Selesai Divisi'
                                    : '📋 Tabel Antrean Workstation Divisi'}
                            </h3>
                            {isDivisionWorker ? (
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {productionSubTab.endsWith('_history')
                                        ? 'Daftar riwayat pekerjaan yang telah diselesaikan oleh divisi ini.'
                                        : <>Urutan antrean: <strong className="text-rose-400">⚡ INTERUPSI REVISI</strong> berada di posisi teratas, disusul <strong className="text-amber-400">🔥 PRIORITAS</strong>, kemudian antrean reguler.</>}
                                </p>
                            ) : (
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Order berstatus <strong className="text-rose-400">🔥 PRIORITAS</strong> otomatis diurutkan di paling atas.
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
                                            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 px-2.5 py-1.5 rounded-xl shadow-inner">
                                                <span className="text-slate-400 text-[11px]">⏳ Rentang Waktu:</span>
                                                <select
                                                    value={statTimeRange}
                                                    onChange={(e) => setStatTimeRange(e.target.value)}
                                                    className="bg-transparent text-amber-300 font-bold text-xs focus:outline-none cursor-pointer"
                                                >
                                                    <option value="today" className="bg-slate-900 text-slate-100">📅 Hari Ini</option>
                                                    <option value="2days" className="bg-slate-900 text-slate-100">📆 2 Hari Terakhir</option>
                                                    <option value="week" className="bg-slate-900 text-slate-100">🗓️ 1 Minggu (7 Hari)</option>
                                                    <option value="month" className="bg-slate-900 text-slate-100">📊 1 Bulan (30 Hari)</option>
                                                    <option value="year" className="bg-slate-900 text-slate-100">🗓️ 1 Tahun Ini</option>
                                                    <option value="all" className="bg-slate-900 text-slate-100">🌐 Semua Waktu</option>
                                                </select>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => setStatFilterType(prev => prev === 'entered' ? 'all' : 'entered')}
                                                className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition cursor-pointer ${
                                                    statFilterType === 'entered'
                                                        ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-extrabold shadow-md shadow-cyan-500/20'
                                                        : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                                                }`}
                                                title={`Klik untuk memilah riwayat orderan masuk (${rangeLabels[statTimeRange]})`}
                                            >
                                                <span>📥 Masuk ({rangeLabels[statTimeRange]}):</span>
                                                <strong className={`font-extrabold ${statFilterType === 'entered' ? 'text-slate-950' : 'text-white'}`}>{enteredRangeList.length} Order</strong>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setStatFilterType(prev => prev === 'completed' ? 'all' : 'completed')}
                                                className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition cursor-pointer ${
                                                    statFilterType === 'completed'
                                                        ? 'bg-emerald-500 text-slate-950 border-emerald-300 font-extrabold shadow-md shadow-emerald-500/20'
                                                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                                }`}
                                                title={`Klik untuk memilah riwayat orderan selesai (${rangeLabels[statTimeRange]})`}
                                            >
                                                <span>✅ Selesai ({rangeLabels[statTimeRange]}):</span>
                                                <strong className={`font-extrabold ${statFilterType === 'completed' ? 'text-slate-950' : 'text-white'}`}>{completedRangeList.length} Order</strong>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setShowRekapModal(true)}
                                                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1 cursor-pointer"
                                                title="Buka Rekap Rincian Harian & Laporan Performance"
                                            >
                                                <span>📊 Rekap Rincian</span>
                                            </button>

                                            {statFilterType !== 'all' && (
                                                <button
                                                    type="button"
                                                    onClick={() => setStatFilterType('all')}
                                                    className="bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 px-2 py-1.5 rounded-xl font-bold transition flex items-center gap-1 cursor-pointer text-[11px]"
                                                    title="Reset Filter Tampilan Antrean"
                                                >
                                                    <span>✕ Reset Pilah</span>
                                                </button>
                                            )}
                                        </div>
                                    );
                                }

                                return (
                                    <div className="flex flex-wrap items-center gap-2">
                                        <div className="bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                                            <span>📥 Masuk Hari Ini:</span>
                                            <strong className="text-white font-extrabold">{enteredRangeList.length} Order</strong>
                                        </div>
                                        <div className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                                            <span>✅ Selesai Hari Ini:</span>
                                            <strong className="text-white font-extrabold">{completedRangeList.length} Order</strong>
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
                                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-8 text-center space-y-2">
                                    <div className="text-3xl">⚙️</div>
                                    <h4 className="font-extrabold text-slate-300 text-base">Tidak Ada Orderan Dalam Antrean saat Ini</h4>
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
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-800/40 text-slate-400 uppercase text-[11px]">
                                        <tr>
                                            <th className="p-3">No SPO & Prioritas</th>
                                            <th className="p-3">Jenis Kaca & Ukuran & Detail</th>
                                            <th className="p-3">Progres Tahapan Divisi</th>
                                            <th className="p-3 text-right">Aksi Pengerjakan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/80">
                                        {sortedWorkstationOrders.map(o => {
                                            const isRevision = isDivisionWorker && o.revision_status === 'pending_division';
                                            const isPriority = o.priority_status === 'Prioritas';
                                            const isCurrentlyActiveInCard = isDivisionWorker && activeOngoingId === o.id;

                                            return (
                                                <tr key={o.id} className={`transition ${isCurrentlyActiveInCard ? 'bg-cyan-950/30 border-l-4 border-l-cyan-400' : isRevision ? 'bg-rose-950/25 hover:bg-rose-950/35 border-l-4 border-l-rose-500' : isPriority ? 'bg-amber-950/15 hover:bg-amber-950/25 border-l-4 border-l-amber-500' : 'hover:bg-slate-800/30'}`}>
                                                    <td className="p-3 font-mono">
                                                        <div className="font-extrabold text-cyan-400 text-sm flex flex-wrap items-center gap-1.5">
                                                            <span>{o.spo_number}</span>
                                                            {isRevision && (
                                                                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-rose-500/25 text-rose-300 border border-rose-500/50 animate-pulse flex items-center gap-1">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>
                                                                    <span>⚡ REVISI TOKO</span>
                                                                </span>
                                                            )}
                                                            {isPriority && !isRevision && (
                                                                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-red-600 text-white border border-red-400 animate-pulse shadow-sm shadow-red-600/30">
                                                                    🔥 PRIORITAS
                                                                </span>
                                                            )}
                                                            {!isPriority && !isRevision && (
                                                                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-white text-slate-950 border border-slate-200 shadow-sm">
                                                                    ⚪ Biasa
                                                                </span>
                                                            )}
                                                            {isCurrentlyActiveInCard && (
                                                                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 font-mono">
                                                                    ● DI MEJA KERJA
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-slate-300 font-bold text-xs mt-0.5">{o.customer_name}</div>
                                                        <div className="text-[10px] text-slate-400 mt-1">📅 Order: {formatIndonesianDate(o.order_date)}</div>
                                                        <div className="text-[10px] text-amber-300 font-bold">📅 Deadline: {o.deadline_date || '-'}</div>
                                                        {o.revision_status === 'pending_division' && (
                                                            <div className="mt-1.5 bg-rose-950/90 border border-rose-500 rounded-xl p-2 text-rose-200 space-y-1 animate-pulse">
                                                                <div className="flex justify-between items-center text-[10px] font-extrabold">
                                                                    <span className="text-rose-300 flex items-center gap-1">⚠️ PERINGATAN REVISI TOKO</span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleAcknowledgeRevision(o.id)}
                                                                        className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-2 py-0.5 rounded text-[10px] cursor-pointer shadow"
                                                                    >
                                                                        🔄 Terima & Eksekusi Revisi SPO
                                                                    </button>
                                                                </div>
                                                                {Object.values(o.division_progress || {}).includes('Sedang Dikerjakan') && (
                                                                    <div className="bg-rose-600 text-white font-extrabold text-[10px] p-1 rounded animate-bounce">
                                                                        🚨 PERINGATAN KRITIS: Orderan ini SEDANG DIKERJAKAN di divisi dan ADA REVISIAN dari Admin Toko! (Cek Perubahan Ukuran)
                                                                    </div>
                                                                )}
                                                                {o.revision_notes && (
                                                                    <div className="text-[10px] text-amber-200 font-mono bg-slate-950/80 p-1 rounded border border-rose-500/40">
                                                                        Catatan: {o.revision_notes}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        {o.complaint_status === 'pending_gudang' && (
                                                            <div className="mt-1.5 bg-amber-950/90 border border-amber-500 rounded-xl p-2 text-amber-200 space-y-1 animate-pulse">
                                                                <div className="flex justify-between items-center text-[10px] font-extrabold">
                                                                    <span className="text-amber-300 flex items-center gap-1">⚠️ KOMPLAIN KACA DARI {o.complaint_data?.reporting_division?.replace('divisi_', '').toUpperCase()}</span>
                                                                    {(userRole === 'admin_gudang' || userRole === 'owner') && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => { setSelectedComplaintOrder(o); setShowGudangDecisionModal(true); }}
                                                                            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-2 py-0.5 rounded text-[10px] cursor-pointer shadow"
                                                                        >
                                                                            ⚖️ Tinjau Komplain Kaca
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                <div className="text-[10px] text-amber-200 font-mono">
                                                                    Kendala: <strong>{o.complaint_data?.reason}</strong> {o.complaint_data?.notes ? `- "${o.complaint_data.notes}"` : ''}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {o.complaint_status === 're_cut_needed' && o.current_division === 'divisi_ht' && (
                                                            <div className="mt-1.5 bg-rose-950/90 border border-rose-500 rounded-xl p-1.5 text-rose-200 text-[10px] font-bold font-mono animate-pulse">
                                                                🚨 POTONG ULANG (GANTI KACA DARI DIVISI {o.complaint_data?.reporting_division?.replace('divisi_', '').toUpperCase() || ''})
                                                            </div>
                                                        )}

                                                        {o.sketch_photo_path && (
                                                            <div className="mt-1.5">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleOpenSketchLightbox(o.sketch_photo_path, o.spo_number)}
                                                                    className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-lg p-1.5 flex items-center justify-between gap-2 text-xs transition shadow-sm cursor-pointer"
                                                                    title="Klik untuk memperbesar gambar sketsa pola & sambungan kaca"
                                                                >
                                                                    <div className="flex items-center gap-1.5 overflow-hidden">
                                                                        <img
                                                                            src={o.sketch_photo_path.startsWith('http') || o.sketch_photo_path.startsWith('/') ? o.sketch_photo_path : `/storage/${o.sketch_photo_path}`}
                                                                            alt="Sketsa Pola"
                                                                            className="w-7 h-7 rounded object-cover border border-cyan-400/50 bg-slate-900 shrink-0"
                                                                        />
                                                                        <span className="font-bold text-[10px] truncate">📐 Sketsa Sambungan Kaca</span>
                                                                    </div>
                                                                    <span className="text-[9px] bg-cyan-400/20 text-cyan-200 px-1.5 py-0.5 rounded font-mono font-bold shrink-0">🔍 Lihat</span>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>

                                                    <td className="p-3 max-w-xs space-y-1">
                                                        {Array.isArray(o.items) && o.items.length > 0 ? (
                                                            o.items.map((it, idx) => (
                                                                <div key={idx} className="bg-slate-950/60 p-2 rounded border border-slate-800 text-[11px] space-y-0.5">
                                                                    <div className="font-bold text-cyan-300">#{idx + 1}. {it.glass_type}</div>
                                                                    <div className="text-slate-300 font-mono">{it.length_cm} x {it.width_cm} cm ({it.thickness_mm}mm) — Qty: {it.qty || 1}</div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="bg-slate-950/60 p-2 rounded border border-slate-800 text-[11px]">
                                                                <div className="font-bold text-cyan-300">{o.glass_type}</div>
                                                                <div className="text-slate-300 font-mono">{o.length_cm} x {o.width_cm} cm ({o.thickness_mm}mm)</div>
                                                            </div>
                                                        )}

                                                        {o.used_scrap_rak && o.used_scrap_rak !== '-' && o.used_scrap_rak.trim() !== '' && (
                                                            <div className="bg-amber-950/90 border border-amber-500/70 rounded-xl p-2 text-[11px] font-mono space-y-0.5 shadow-md">
                                                                <div className="font-extrabold text-[10px] text-amber-400 flex items-center gap-1">
                                                                    <span>🧩 Rekomendasi Scrap Toko:</span>
                                                                </div>
                                                                <div className="text-amber-200 bg-slate-950 px-2 py-1 rounded border border-amber-500/30 font-bold text-[10px] whitespace-pre-wrap leading-tight">
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
                                                                                className={`text-[10px] px-2 py-0.5 rounded font-bold font-mono border flex items-center gap-1 ${isDone ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : isWorking ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 animate-pulse' : isNA ? 'bg-slate-950 text-slate-600 border-slate-900' : 'bg-slate-950 text-slate-400 border-slate-800'}`}
                                                                            >
                                                                                <span>{proc}: {status}</span>
                                                                            </span>
                                                                            {timeStr && (
                                                                                <span className="text-[9px] font-mono text-slate-400 mt-0.5 px-0.5">
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
                                                                        className="group relative inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs text-cyan-300 bg-slate-800/90 hover:bg-slate-700 hover:text-white shadow-sm hover:scale-[1.02] active:scale-95 transition-all duration-200 border border-slate-700 hover:border-cyan-400/50 cursor-pointer ml-auto"
                                                                    >
                                                                        <span className="text-sm">👁️</span>
                                                                        <span className="font-extrabold text-[11px]">Detail</span>
                                                                        <span className="text-cyan-400 text-xs transition-transform group-hover:translate-x-0.5 duration-200">➔</span>
                                                                    </button>
                                                                );
                                                            }

                                                            return (
                                                                <div className="flex flex-wrap items-center justify-end gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleOpenDetailModal(o)}
                                                                        className="group inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs text-slate-300 bg-slate-800/90 hover:bg-slate-700 hover:text-white border border-slate-700 hover:border-cyan-400/50 transition shadow-sm cursor-pointer"
                                                                        title="Lihat Detail Lengkap SPO, Sketsa & Riwayat"
                                                                    >
                                                                        <span className="text-sm">👁️</span>
                                                                        <span className="font-extrabold text-[11px]">Detail</span>
                                                                    </button>

                                                                    {isCurrentlyActiveInCard ? (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                document.getElementById('active-workstation-card')?.scrollIntoView({ behavior: 'smooth' });
                                                                            }}
                                                                            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl font-black text-xs text-cyan-300 bg-cyan-950/60 border border-cyan-500/50 shadow-md shadow-cyan-500/10 cursor-pointer"
                                                                            title="Sedang Dikerjakan di Card Atas"
                                                                        >
                                                                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                                                                            <span className="font-mono text-[11px]">Sedang Berjalan</span>
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleStartWorkstationJob(o)}
                                                                            className="group relative inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl font-black text-xs text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:via-teal-300 hover:to-emerald-300 shadow-md shadow-cyan-500/20 hover:shadow-cyan-400/30 hover:scale-[1.02] active:scale-95 transition-all duration-200 border border-cyan-300/40 cursor-pointer"
                                                                            title="Mulai Pengerjaan & Pindahkan ke Card Proses di Atas"
                                                                        >
                                                                            <span className="text-xs">⚡</span>
                                                                            <span className="font-black text-[11px] uppercase tracking-wider">Mulai Kerjakan</span>
                                                                            <span className="text-[10px] transition-transform group-hover:translate-x-0.5 duration-200">➔</span>
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
