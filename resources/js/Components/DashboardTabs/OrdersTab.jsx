import React from 'react';
import { formatIndonesianDate, formatIndonesianDateTime, roleTitles } from '@/Utils/dashboardHelpers';

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
                    <span className="text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                        📍 {roleTitles[currentDiv] || currentDiv}
                    </span>
                </div>

                <div className="flex flex-wrap items-center gap-1 pt-0.5">
                    {divOrder.map((d, idx) => {
                        const isRequired = procs.includes(d.key);
                        const statusText = divProgress[d.key];

                        let badgeStyle = "bg-slate-900/60 text-slate-500 border-slate-800 opacity-50";
                        let statusIcon = "⚪";

                        if (!isRequired && currentDiv !== d.divKey && statusText !== 'Selesai') {
                            return null;
                        }

                        if (statusText === 'Selesai' || (activeIndex > idx && activeIndex !== -1)) {
                            badgeStyle = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold";
                            statusIcon = "✅";
                        } else if (currentDiv === d.divKey || statusText === 'Sedang Dikerjakan' || statusText === 'Menunggu Dispatch') {
                            badgeStyle = "bg-cyan-500/25 text-cyan-300 border-cyan-400 font-extrabold animate-pulse shadow-sm shadow-cyan-500/20";
                            statusIcon = "⚙️";
                        }

                        return (
                            <span
                                key={d.key}
                                className={`text-[10px] px-1.5 py-0.5 rounded border flex items-center gap-1 ${badgeStyle}`}
                                title={`${d.label}: ${statusText || (currentDiv === d.divKey ? 'Aktif Pengerjaan' : 'Antrean')}`}
                            >
                                <span>{statusIcon}</span>
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-100">{userRole === 'admin_toko' || userRole === 'owner' ? 'Menu Orderan & Draf' : 'Menu Orderan Pengerjaan'}</h2>
                    <p className="text-slate-400 text-sm">{userRole === 'admin_toko' || userRole === 'owner' ? 'Kelola orderan baru, draf negosiasi, dan disposisi pengerjaan' : 'Kelola orderan aktif pengerjaan, pengiriman, dan disposisi'}</p>
                </div>
            </div>

            {/* DYNAMIC CARDS HEADER */}
            <div className={`grid ${userRole === 'admin_toko' || userRole === 'owner' ? 'grid-cols-5' : 'grid-cols-3'} gap-4`}>
                {[
                    ...(userRole === 'admin_toko' || userRole === 'owner' ? [
                        { key: 'draft', label: 'Draf (Belum Deal)', count: initialOrders.filter(o => o.status === 'draft').length, icon: '📄' }
                    ] : []),
                    { key: 'pengerjaan', label: 'Order Pengerjaan', count: initialOrders.filter(o => o.status === 'pengerjaan').length, icon: '⚙️' },
                    { key: 'pengiriman', label: 'Pengiriman & Surat Jalan', count: initialOrders.filter(o => o.status === 'pengiriman').length, icon: '🚚' },
                    ...(userRole === 'admin_toko' || userRole === 'owner' ? [
                        { key: 'pembayaran', label: 'Pembayaran / COD', count: initialOrders.filter(o => o.payment_status !== 'Lunas').length, icon: '💵' }
                    ] : []),
                    { key: 'selesai', label: 'Selesai', count: initialOrders.filter(o => o.status === 'selesai').length, icon: '✅' },
                ].map(card => (
                    <div
                        key={card.key}
                        onClick={() => {
                            if (card.key === 'pengiriman') {
                                setActiveTab('deliveries');
                            } else {
                                setActiveOrderCard(card.key);
                            }
                        }}
                        className={`cursor-pointer border rounded-xl p-4 text-center transition ${activeOrderCard === card.key ? 'bg-cyan-500/15 border-cyan-400 text-slate-100 shadow-lg shadow-cyan-500/10' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/40'}`}
                    >
                        <div className="text-2xl font-black text-cyan-400">{card.count}</div>
                        <div className="text-xs font-semibold mt-1">{card.icon} {card.label}</div>
                    </div>
                ))}
            </div>

            {/* CREATE ORDER BUTTON DIRECTLY BELOW DRAFT CARD */}
            {(userRole === 'admin_toko' || userRole === 'owner') && (
                <div className="flex justify-start">
                    <button
                        onClick={handleOpenNewOrderModal}
                        className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black px-5 py-2.5 rounded-xl shadow-xl shadow-emerald-500/20 text-sm flex items-center gap-2 transition transform hover:scale-105 border border-cyan-300/50 cursor-pointer"
                    >
                        <span className="text-base">✨</span> + Orderan Baru
                    </button>
                </div>
            )}

            {/* ACTION HEADER DIRECTLY ABOVE TABLE */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                        <h3 className="font-bold text-slate-100 text-base">
                            {activeOrderCard === 'draft' && '📄 Tabel Draf Orderan (Belum Deal / DP)'}
                            {activeOrderCard === 'pengerjaan' && '⚙️ Tabel Orderan Aktif Pengerjaan Divisi Pabrik'}
                            {activeOrderCard === 'pengiriman' && '🚚 Tabel Orderan Pengiriman Armada & Penerbitan Surat Jalan'}
                            {activeOrderCard === 'pembayaran' && '💵 Tabel Status Pembayaran & Tagihan COD'}
                            {activeOrderCard === 'selesai' && '✅ Tabel Arsip Orderan Selesai & Terkirim'}
                        </h3>
                        <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2.5 py-1 rounded-full border border-cyan-500/20 font-mono font-bold">
                            {filteredOrders.length} Items
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            placeholder="🔍 Cari SPO / Customer..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                        />
                    </div>
                </div>

                {activeOrderCard === 'pengiriman' && (
                    <div className="bg-gradient-to-r from-cyan-950 to-blue-950 border-2 border-cyan-500/50 p-4 rounded-xl text-xs text-cyan-100 flex flex-wrap justify-between items-center gap-3 shadow-lg">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl animate-bounce">🚚</span>
                            <div>
                                <strong className="text-cyan-300 text-sm font-extrabold block">Fitur Baru: Penugasan Mobil Multi-Alamat & Rute Manifest</strong>
                                <p className="text-slate-300 text-xs">Admin dapat memilih beberapa alamat tujuan konsumen sekaligus untuk diangkut 1 armada & supir, serta mencetak Rute Manifest Multi-Stop.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setActiveTab('deliveries')}
                            className="bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black px-4 py-2 rounded-lg transition shadow-lg shadow-cyan-400/20 flex items-center gap-1.5 cursor-pointer text-xs shrink-0"
                        >
                            🚀 Buka Panel Penugasan Multi-Alamat
                        </button>
                    </div>
                )}

                {activeOrderCard === 'selesai' && (
                    <div className="bg-emerald-950/60 border border-emerald-500/40 p-3 rounded-xl text-xs text-emerald-200 flex flex-wrap justify-between items-center gap-2">
                        <div className="flex items-center gap-2">
                            <span className="text-base">✅</span>
                            <span>
                                <strong>Fitur Order Selesai:</strong> Seluruh orderan di tabel ini telah sukses dikirim dan dikonfirmasi diterima konsumen. Dokumen Surat Jalan dapat dicetak ulang kapan saja sebagai arsip transaksi.
                            </span>
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-800/40 text-slate-400 uppercase text-xs">
                            <tr>
                                <th className="p-3">No SPO</th>
                                <th className="p-3">Customer</th>
                                <th className="p-3">Spesifikasi Kaca</th>
                                <th className="p-3">Posisi Divisi & Tracking Progres</th>
                                {canViewPricing && <th className="p-3">Total Tagihan</th>}
                                {canViewPricing && <th className="p-3">Status Bayar</th>}
                                <th className="p-3">Aksi Alur</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {filteredOrders.map(o => (
                                <tr key={o.id} className="hover:bg-slate-800/30">
                                    <td className="p-3">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <div className="font-bold text-cyan-400 font-mono text-sm">{o.spo_number}</div>
                                            {o.is_revised && (
                                                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1 font-mono shadow-sm" title="Orderan ini memiliki riwayat revisi">
                                                    🔔 Telah Direvisi ({o.revision_count || 1}x)
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-1.5 space-y-1 text-[11px] font-mono">
                                            <div className="text-slate-300 flex items-center gap-1" title="1. Tanggal Pembuatan / Input Draf (Admin Toko)">
                                                <span className="text-cyan-400">📅 Input Toko:</span>
                                                <span>{formatIndonesianDate(o.order_date)}</span>
                                            </div>
                                            {o.gudang_released_at && (
                                                <div className="text-blue-300 flex items-center gap-1 text-[10px]" title="2. Tanggal Diturunkan / Disposisi Admin Gudang ke Divisi">
                                                    <span>📦 Disposisi Gudang:</span>
                                                    <span>{formatIndonesianDateTime(o.gudang_released_at)}</span>
                                                </div>
                                            )}
                                            {o.execution_completed_at && (
                                                <div className="text-emerald-300 flex items-center gap-1 text-[10px]" title="3. Tanggal Selesai Eksekusi Kaca & Lolos QC Pabrik">
                                                    <span>⚙️ Selesai Pabrik:</span>
                                                    <span>{formatIndonesianDateTime(o.execution_completed_at)}</span>
                                                </div>
                                            )}
                                            {o.shipped_at && (
                                                <div className="text-cyan-300 flex items-center gap-1 text-[10px]" title="4. Tanggal Mulai Pengiriman Armada / Surat Jalan">
                                                    <span>🚚 Mulai Kirim:</span>
                                                    <span>{formatIndonesianDateTime(o.shipped_at)}</span>
                                                </div>
                                            )}
                                            {o.delivered_at && (
                                                <div className="text-emerald-400 flex items-center gap-1 text-[10px] font-bold" title="5. Tanggal Selesai Terkirim & Diterima Konsumen">
                                                    <span>✅ Selesai Terkirim:</span>
                                                    <span>{formatIndonesianDateTime(o.delivered_at)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-3 text-xs space-y-1 min-w-[210px]">
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
                                    </td>
                                    <td className="p-3 space-y-1 max-w-xs">
                                        {Array.isArray(o.items) && o.items.length > 0 ? (
                                            <div className="space-y-1">
                                                {o.items.map((it, idx) => (
                                                    <div key={idx} className="bg-slate-950/60 p-2 rounded border border-slate-800 text-xs space-y-1">
                                                        <div className="font-bold text-cyan-300">
                                                            #{idx + 1}. {it.glass_type}
                                                        </div>
                                                        <div className="text-xs text-slate-100 font-mono font-bold">
                                                            {it.length_cm} x {it.width_cm} = {it.qty || 1}
                                                        </div>
                                                        <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between gap-1">
                                                            <span>{it.thickness_mm} mm</span>
                                                            {Array.isArray(it.processes) && it.processes.length > 0 && (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {it.processes.map(p => (
                                                                        <span key={p} className="text-[9px] bg-cyan-500/20 text-cyan-300 font-bold px-1.5 py-0.5 rounded border border-cyan-500/30">
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
                                            <>
                                                <div className="font-semibold text-slate-200">{o.glass_type}</div>
                                                <div className="text-xs text-slate-400 font-mono">
                                                    {o.length_cm} x {o.width_cm} cm | {o.thickness_mm} mm
                                                </div>
                                                <div className="flex flex-wrap gap-1 pt-0.5">
                                                    {Array.isArray(o.processes) && o.processes.map(p => (
                                                        <span key={p} className="text-[10px] bg-cyan-500/20 text-cyan-300 font-bold px-1.5 py-0.5 rounded border border-cyan-500/30">
                                                            {p}
                                                        </span>
                                                    ))}
                                                </div>
                                            </>
                                        )}

                                        {o.sketch_photo_path && (
                                            <div className="mt-2">
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
                                                            className="w-8 h-8 rounded object-cover border border-cyan-400/50 bg-slate-900 shrink-0"
                                                        />
                                                        <span className="font-bold text-[11px] truncate">📐 Sketsa Sambungan Kaca</span>
                                                    </div>
                                                    <span className="text-[10px] bg-cyan-400/20 text-cyan-200 px-1.5 py-0.5 rounded font-mono font-bold shrink-0">🔍 Lihat</span>
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
                                                        <span key={accIdx} className="text-[10px] bg-blue-500/20 text-blue-300 font-semibold px-1.5 py-0.5 rounded border border-blue-500/30">
                                                            +{accName}{accQty}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {o.description && (
                                            <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-xs">
                                                <span className="font-bold flex items-center gap-1 text-amber-400 text-[11px] mb-0.5">
                                                    📝 Catatan Order (Penjelasan Kaca):
                                                </span>
                                                <div className="text-slate-200 font-medium whitespace-pre-wrap text-[11px] leading-relaxed">
                                                    {o.description}
                                                </div>
                                            </div>
                                        )}

                                        {o.revision_notes && (
                                            <div className="mt-1.5 p-2 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs">
                                                <span className="font-bold flex items-center gap-1 text-rose-400 text-[11px] mb-0.5">
                                                    🔔 Catatan Revisi Toko:
                                                </span>
                                                <div className="text-slate-200 font-medium whitespace-pre-wrap text-[11px] leading-relaxed font-mono">
                                                    {o.revision_notes}
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        {renderProgressTracker(o)}
                                    </td>
                                    {canViewPricing && (
                                        <td className="p-3 font-bold">
                                            Rp {Number(o.total_price).toLocaleString()}
                                        </td>
                                    )}
                                    {canViewPricing && (
                                        <td className="p-3">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${o.payment_status === 'Lunas' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : o.payment_status === 'DP (50%)' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-700 text-slate-300'}`}>
                                                {o.payment_status}
                                            </span>
                                        </td>
                                    )}
                                    <td className="p-3 flex flex-wrap items-center gap-2">
                                        {o.status === 'draft' && (
                                            (userRole === 'admin_toko' || userRole === 'owner') ? (
                                                <>
                                                    <button
                                                        onClick={() => handleOpenEditModal(o)}
                                                        className="bg-[#2563EB] hover:bg-blue-600 text-white font-bold px-3 py-1.5 rounded text-xs transition flex items-center gap-1 shadow-md shadow-blue-500/20 cursor-pointer"
                                                    >
                                                        ✏️ Edit Draf
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenPromoteModal(o)}
                                                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded text-xs transition flex items-center gap-1 shadow-md shadow-emerald-500/20 cursor-pointer"
                                                    >
                                                        ✅ Setuju & DP (50%)
                                                    </button>
                                                </>
                                            ) : (
                                                <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20 text-xs font-semibold flex items-center gap-1">
                                                    <i className="bi bi-hourglass-split"></i> Draf Toko (Belum DP)
                                                </span>
                                            )
                                        )}

                                        {o.status === 'pengerjaan' && (userRole === 'admin_toko' || userRole === 'owner') && (
                                            <button
                                                onClick={() => handleOpenEditModal(o)}
                                                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold px-3 py-1.5 rounded text-xs transition flex items-center gap-1 shadow-md shadow-amber-500/20 cursor-pointer"
                                                title="Klik untuk merevisi deskripsi, foto sketsa project, atau dimensi/spesifikasi item kaca"
                                            >
                                                🔄 Revisi / Edit Order
                                            </button>
                                        )}

                                        {o.status === 'pengerjaan' && o.current_division === 'admin_gudang' && (userRole === 'admin_gudang' || userRole === 'owner') && (
                                            o.revision_status === 'editing' ? (
                                                <button
                                                    disabled
                                                    className="bg-slate-800 text-slate-400 font-extrabold px-3 py-1.5 rounded text-xs cursor-not-allowed opacity-75 flex items-center gap-1.5 shadow-inner"
                                                    title="Tombol terblokir sementara karena Admin Toko sedang mengedit/merevisi orderan ini"
                                                >
                                                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                                                    <span>🔒 Terkunci (Sedang Direvisi Toko...)</span>
                                                </button>
                                            ) : (
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <button
                                                        onClick={() => handleOpenDispatchModal(o)}
                                                        className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3 py-1.5 rounded text-xs transition cursor-pointer flex items-center gap-1 shadow-md shadow-cyan-500/20"
                                                    >
                                                        <span>📤 Kirim Ke Divisi</span>
                                                        {o.revision_status === 'pending_gudang' && (
                                                            <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded font-mono font-extrabold animate-pulse">
                                                                (Revisi Baru)
                                                            </span>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenStickerModal(o)}
                                                        className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-2.5 py-1.5 rounded text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-sm"
                                                        title="Cetak Stiker Label Orderan Kaca untuk Admin Gudang & Divisi"
                                                    >
                                                        🏷️ Stiker Label
                                                    </button>
                                                </div>
                                            )
                                        )}

                                        {o.status === 'pengiriman' && (
                                            <div className="flex flex-wrap items-center gap-2">
                                                <button
                                                    onClick={() => { setSelectedWaybillOrder(o); setShowWaybillModal(true); }}
                                                    className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-sm"
                                                    title="Cetak 4 Warna Surat Jalan Pengiriman (Putih, Merah, Kuning, Hijau)"
                                                >
                                                    🖨️ Surat Jalan (4 Warna)
                                                </button>
                                                <button
                                                    onClick={() => handleCompleteDelivery(o.id, true)}
                                                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-black shadow-md shadow-emerald-500/20 transition flex items-center gap-1 cursor-pointer transform hover:scale-105"
                                                    title="Klik jika barang telah sampai dan diterima konsumen (Status otomatis berubah jadi Selesai)"
                                                >
                                                    ✅ Konfirmasi Selesai Terkirim
                                                </button>
                                            </div>
                                        )}

                                        {o.status === 'selesai' && (
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1">
                                                    <span>✅</span> Selesai Terkirim
                                                </span>
                                                <button
                                                    onClick={() => { setSelectedWaybillOrder(o); setShowWaybillModal(true); }}
                                                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition flex items-center gap-1"
                                                    title="Cetak Ulang Arsip Surat Jalan"
                                                >
                                                    🖨️ Surat Jalan (Arsip)
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
