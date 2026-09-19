import React from 'react';
import { isMatchSearch } from '@/Utils/dashboardHelpers';

export default function ScrapTab({
    userRole,
    canViewPricing = true,
    stockSubTab = 'lembaran',
    setStockSubTab,
    sheetGlasses = [],
    initialScrap = [],
    activeStockCard = 'all',
    setActiveStockCard,
    stockSearchTerm = '',
    setStockSearchTerm,
    showTableSupplierInfo = false,
    setShowTableSupplierInfo,
    showTablePricingInfo = false,
    setShowTablePricingInfo,
    filteredSheetGlasses: externalFilteredSheetGlasses,
    setShowAddStockModal,
    handleOpenSupplierWaModal,
    handleOpenRestockModal,
    handleOpenEditStockModal,
    handleRequestRestockStatus,
    setShowScrapModal,
}) {
    // If not passed externally, calculate internally
    const filteredSheetGlasses = externalFilteredSheetGlasses || sheetGlasses.filter(g => {
        const matchesSearch = isMatchSearch(g, stockSearchTerm) ||
            (g.item_code || '').toLowerCase().includes((stockSearchTerm || '').toLowerCase()) ||
            (g.name || '').toLowerCase().includes((stockSearchTerm || '').toLowerCase()) ||
            (g.category || '').toLowerCase().includes((stockSearchTerm || '').toLowerCase()) ||
            (g.size || '').toLowerCase().includes((stockSearchTerm || '').toLowerCase());

        if (activeStockCard === 'aman') return g.status === 'Aman' && matchesSearch;
        if (activeStockCard === 'menipis') return g.status === 'Menipis' && matchesSearch;
        if (activeStockCard === 'pengajuan') return g.status === 'Pengajuan Proses Restock' && matchesSearch;
        return matchesSearch;
    });

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-100">Manajemen Stok Inventory Kaca</h2>
                    <p className="text-slate-400 text-sm">Monitoring stok bahan kaca lembaran baru dan kaca sisa potongan rak</p>
                </div>

                {/* SUB TAB TOGGLE (Bahan Lembaran Baru vs Sisa Potongan) */}
                <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
                    <button
                        onClick={() => setStockSubTab('lembaran')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${stockSubTab === 'lembaran' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
                    >
                        <span>📦 Stok Kaca Lembaran (Baru)</span>
                        {sheetGlasses.filter(g => g.status === 'Pengajuan Proses Restock').length > 0 && (
                            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse shadow-sm">
                                {sheetGlasses.filter(g => g.status === 'Pengajuan Proses Restock').length} Restock
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setStockSubTab('sisa')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${stockSubTab === 'sisa' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
                    >
                        ♻️ Kaca Sisa Potongan Rak ({initialScrap.length})
                    </button>
                </div>
            </div>

            {stockSubTab === 'lembaran' ? (
                <div className="space-y-6">
                    {/* 4 FILTER CARDS AT THE TOP */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { key: 'all', label: 'Semua Stok Bahan', count: sheetGlasses.length, icon: '📦' },
                            { key: 'aman', label: 'Aman', count: sheetGlasses.filter(g => g.status === 'Aman').length, icon: '✅' },
                            { key: 'menipis', label: 'Menipis', count: sheetGlasses.filter(g => g.status === 'Menipis').length, icon: '⚠️' },
                            { key: 'pengajuan', label: 'Pengajuan Proses Restock', count: sheetGlasses.filter(g => g.status === 'Pengajuan Proses Restock').length, icon: '⏳' },
                        ].map(card => (
                            <div
                                key={card.key}
                                onClick={() => setActiveStockCard(card.key)}
                                className={`relative cursor-pointer border rounded-xl p-4 text-center transition ${activeStockCard === card.key ? 'bg-cyan-500/15 border-cyan-400 text-slate-100 shadow-lg shadow-cyan-500/10' : card.key === 'pengajuan' && card.count > 0 ? 'bg-rose-950/20 border-rose-500/60 text-slate-100 shadow-lg shadow-rose-500/20 animate-pulse' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/40'}`}
                            >
                                {card.key === 'pengajuan' && card.count > 0 && (
                                    <span className="absolute -top-2.5 -right-2 bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-lg border border-rose-300 animate-bounce flex items-center gap-1 font-mono">
                                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                                        🔔 Restock Gudang
                                    </span>
                                )}
                                <div className={`text-2xl font-black ${card.key === 'aman' ? 'text-emerald-400' : card.key === 'menipis' ? 'text-amber-400' : card.key === 'pengajuan' ? 'text-rose-400' : 'text-cyan-400'}`}>{card.count}</div>
                                <div className="text-xs font-semibold mt-1">{card.icon} {card.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* BUTTON TAMBAH BARANG BARU DIRECTLY BELOW CARDS */}
                    {(userRole === 'admin_toko' || userRole === 'admin_gudang' || userRole === 'owner') && (
                        <div className="flex justify-start">
                            <button
                                onClick={() => setShowAddStockModal(true)}
                                className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black px-5 py-2.5 rounded-xl shadow-xl shadow-emerald-500/20 text-sm flex items-center gap-2 transition transform hover:scale-105 border border-cyan-300/50 cursor-pointer"
                            >
                                <span className="text-base">✨</span> + Tambah Jenis Barang Baru
                            </button>
                        </div>
                    )}

                    {/* TABLE HEADER & SEARCH BAR */}
                    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
                        <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-3">
                                <h3 className="font-bold text-slate-100 text-base">
                                    📊 Tabel Bahan Stok Kaca Lembaran (Baru): <span className="text-cyan-400 uppercase tracking-wider">{activeStockCard}</span>
                                </h3>
                                <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2.5 py-1 rounded-full border border-cyan-500/20 font-mono font-bold">
                                    {filteredSheetGlasses.length} Barang
                                </span>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                <button
                                    type="button"
                                    onClick={() => setShowTableSupplierInfo(prev => !prev)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border flex items-center gap-1 cursor-pointer ${showTableSupplierInfo
                                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                                        : 'bg-slate-950 text-slate-400 border-slate-700 hover:text-white'
                                        }`}
                                    title="Klik untuk menayangkan / menyembunyikan info supplier di tabel"
                                >
                                    {showTableSupplierInfo ? '👁️ Supplier: Tampil' : '🙈 Supplier: Sembunyi'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowTablePricingInfo(prev => !prev)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border flex items-center gap-1 cursor-pointer ${showTablePricingInfo
                                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                        : 'bg-slate-950 text-slate-400 border-slate-700 hover:text-white'
                                        }`}
                                    title="Klik untuk menayangkan / menyembunyikan modal harga beli supplier di tabel"
                                >
                                    {showTablePricingInfo ? '👁️ Modal Beli: Tampil' : '🙈 Modal Beli: Sembunyi'}
                                </button>

                                <input
                                    type="text"
                                    placeholder="🔍 Cari Kode / Nama / Jenis Kaca..."
                                    value={stockSearchTerm}
                                    onChange={e => setStockSearchTerm(e.target.value)}
                                    className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-800/40 text-slate-400 uppercase text-xs">
                                    <tr>
                                        <th className="p-3">Kode Barang & Restock</th>
                                        <th className="p-3">Nama Barang</th>
                                        <th className="p-3">Jenis Barang</th>
                                        <th className="p-3">Ukuran Barang</th>
                                        <th className="p-3">Harga Jual</th>
                                        <th className="p-3">Quantity</th>
                                        <th className="p-3">Aksi</th>
                                        <th className="p-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {filteredSheetGlasses.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="p-6 text-center text-slate-500 text-xs italic">
                                                Tidak ada barang stok lembaran yang sesuai dengan filter/pencarian.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredSheetGlasses.map(item => (
                                            <tr key={item.id} className="hover:bg-slate-800/30">
                                                <td className="p-3">
                                                    <div className="font-extrabold text-cyan-400 font-mono">{item.item_code}</div>
                                                    <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                                                        <span>📅 Restock:</span>
                                                        <strong className="text-slate-300">{item.last_restock}</strong>
                                                    </div>
                                                </td>
                                                <td className="p-3 font-bold text-slate-100">
                                                    <div>{item.name}</div>
                                                    {showTableSupplierInfo && (
                                                        <div className="text-[11px] text-emerald-400 font-mono mt-0.5 flex items-center gap-1">
                                                            <span>🏭 Supplier:</span>
                                                            <span className="font-semibold text-slate-300">{item.supplier_name}</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    <span className="bg-slate-800 text-cyan-300 border border-slate-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                                                        {item.category}
                                                    </span>
                                                </td>
                                                <td className="p-3 font-mono font-bold text-slate-200">{item.size}</td>
                                                <td className="p-3 text-xs">
                                                    {canViewPricing ? (
                                                        <div className="space-y-0.5 font-mono">
                                                            <div><span className="text-emerald-400 font-extrabold text-sm">Rp {Number(item.sell_price || 0).toLocaleString()}</span> <span className="text-[10px] text-slate-400 font-sans">/lembar</span></div>
                                                            {showTablePricingInfo && (
                                                                <div className="text-slate-400 text-[11px] pt-0.5 border-t border-slate-800">Beli: <span className="text-amber-400 font-bold">Rp {Number(item.buy_price || 0).toLocaleString()}</span></div>
                                                            )}
                                                            <div className="text-[10px] text-cyan-300/90 pt-1 flex flex-wrap gap-1 border-t border-slate-800/60 font-sans">
                                                                <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 font-mono">HT: Rp {Number(item.rate_ht || 1000).toLocaleString()}</span>
                                                                <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 font-mono">GM: Rp {Number(item.rate_gm || 10000).toLocaleString()}</span>
                                                                <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 font-mono">BV: Rp {Number(item.rate_bv || 15000).toLocaleString()}</span>
                                                                <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 font-mono">Etsa: Rp {Number(item.rate_etsa || 50000).toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-500 text-xs italic">🔒 Rahasia</span>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    <span className={`font-extrabold font-mono text-sm px-2.5 py-1 rounded-lg border ${item.qty <= 5 ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : item.qty <= 10 ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
                                                        {item.qty} {item.unit || 'Lembar'}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                                        {/* JIKA ROLE ADMIN TOKO ATAU OWNER */}
                                                        {(userRole === 'admin_toko' || userRole === 'owner') && (
                                                            <>
                                                                {item.status === 'Pengajuan Proses Restock' && (
                                                                    <button
                                                                        onClick={() => handleOpenSupplierWaModal(item)}
                                                                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-3 py-1.5 rounded-lg text-xs transition shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 animate-bounce cursor-pointer"
                                                                        title="Setujui pengajuan restock dan langsung chat supplier via WhatsApp"
                                                                    >
                                                                        💬 Setujui & Chat WA Supplier
                                                                    </button>
                                                                )}

                                                                <button
                                                                    onClick={() => handleOpenRestockModal(item)}
                                                                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition shadow-md flex items-center gap-1 cursor-pointer"
                                                                >
                                                                    🔄 {item.status === 'Sedang Dipesan Supplier' ? 'Konfirmasi Terima Restock' : 'Restock Barang'}
                                                                </button>

                                                                <button
                                                                    onClick={() => handleOpenEditStockModal(item)}
                                                                    className="bg-[#2563EB] hover:bg-blue-600 text-white font-extrabold px-3 py-1.5 rounded-lg text-xs transition shadow-md shadow-blue-500/20 flex items-center gap-1 cursor-pointer"
                                                                    title="Edit Informasi & Harga Kaca Ini"
                                                                >
                                                                    ✏️ Edit
                                                                </button>
                                                            </>
                                                        )}

                                                        {/* JIKA ROLE ADMIN GUDANG ATAU DIVISI */}
                                                        {(userRole === 'admin_gudang' || userRole.startsWith('divisi_')) && (
                                                            item.status === 'Pengajuan Proses Restock' ? (
                                                                <span className="text-[11px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
                                                                    ⏳ Pengajuan Menunggu Persetujuan Toko
                                                                </span>
                                                            ) : item.status === 'Sedang Dipesan Supplier' ? (
                                                                <button
                                                                    onClick={() => handleOpenRestockModal(item)}
                                                                    className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black px-2.5 py-1.5 rounded-lg text-xs transition shadow flex items-center gap-1 cursor-pointer"
                                                                    title="Validasi kedatangan fisik lembaran kaca dari supplier ke rak gudang"
                                                                >
                                                                    📦 Terima Fisik di Gudang
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleRequestRestockStatus(item.id)}
                                                                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition shadow-md flex items-center gap-1 cursor-pointer"
                                                                    title="Ajukan kebutuhan restock barang ini ke Admin Toko"
                                                                >
                                                                    📩 Ajukan Stok
                                                                </button>
                                                            )
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    {item.status === 'Aman' && (
                                                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
                                                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                                            Aman
                                                        </span>
                                                    )}
                                                    {item.status === 'Menipis' && (
                                                        <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
                                                            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                                            Menipis
                                                        </span>
                                                    )}
                                                    {item.status === 'Pengajuan Proses Restock' && (
                                                        <div className="space-y-1">
                                                            <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
                                                                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
                                                                Pengajuan Restock Gudang
                                                            </span>
                                                        </div>
                                                    )}
                                                    {item.status === 'Sedang Dipesan Supplier' && (
                                                        <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
                                                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                                                            Sedang Dipesan (WA Supplier)
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                /* TABEL KACA SISA POTONGAN DI RAK */
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-100">✂️ Stok Kaca Sisa Potongan di Rak Storage</h3>
                        {(userRole === 'divisi_ht' || userRole === 'admin_gudang') && (
                            <button onClick={() => setShowScrapModal(true)} className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm cursor-pointer">
                                ➕ + Input Kaca Sisa Baru
                            </button>
                        )}
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-800/40 text-slate-400 uppercase text-xs">
                                <tr>
                                    <th className="p-3">Kode Sisa</th>
                                    <th className="p-3">Jenis Kaca</th>
                                    <th className="p-3">Ukuran (P x L)</th>
                                    <th className="p-3">Lokasi Rak Storage</th>
                                    <th className="p-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {initialScrap.map(s => (
                                    <tr key={s.id} className="hover:bg-slate-800/30">
                                        <td className="p-3 font-bold text-cyan-400">{s.scrap_code}</td>
                                        <td className="p-3">{s.glass_type}</td>
                                        <td className="p-3 font-bold">{s.length_cm} x {s.width_cm} cm</td>
                                        <td className="p-3"><span className="bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded-full text-xs border border-purple-500/30">{s.rak_location}</span></td>
                                        <td className="p-3"><span className="text-emerald-400 font-bold">{s.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
