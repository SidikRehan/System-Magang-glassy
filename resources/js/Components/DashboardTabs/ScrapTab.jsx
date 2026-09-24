import React from 'react';
import { 
    Boxes, Plus, Search, Eye, EyeOff, RefreshCw, 
    MessageSquare, Edit, Trash2, Calendar, Scissors, 
    Layers, CheckCircle2, AlertTriangle, Clock, ShieldCheck, 
    Lock, Check, Package, Send, ZoomIn
} from 'lucide-react';
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
    handleDeleteStockItem,
    handleOpenSketchLightbox = () => {},
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
        <div className="space-y-6">
            {/* HEADER TAB */}
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-[#242222] flex items-center gap-2.5">
                        <Boxes className="w-6 h-6 text-[#1b68b0]" />
                        <span>Manajemen Stok Inventory Kaca</span>
                    </h2>
                    <p className="text-slate-500 text-xs font-medium mt-1">
                        Monitoring ketersediaan bahan kaca lembaran baru dan inventaris sisa potongan kaca di rak storage.
                    </p>
                </div>

                {/* SUB TAB TOGGLE (Bahan Lembaran Baru vs Sisa Potongan) */}
                <div className="flex items-center bg-slate-100 border border-slate-200 p-1 rounded-xl gap-1">
                    <button
                        onClick={() => setStockSubTab('lembaran')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                            stockSubTab === 'lembaran' 
                                ? 'bg-white text-[#1b68b0] shadow-xs border border-slate-200' 
                                : 'text-slate-600 hover:text-[#242222]'
                        }`}
                    >
                        <Boxes className="w-3.5 h-3.5" />
                        <span>Kaca Lembaran (Baru)</span>
                        {sheetGlasses.filter(g => g.status === 'Pengajuan Proses Restock').length > 0 && (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full font-mono">
                                {sheetGlasses.filter(g => g.status === 'Pengajuan Proses Restock').length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setStockSubTab('sisa')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            stockSubTab === 'sisa' 
                                ? 'bg-white text-[#1b68b0] shadow-xs border border-slate-200' 
                                : 'text-slate-600 hover:text-[#242222]'
                        }`}
                    >
                        <Scissors className="w-3.5 h-3.5" />
                        <span>Kaca Sisa Potongan ({initialScrap.length})</span>
                    </button>
                </div>
            </div>

            <div key={stockSubTab} className="animate-subtab-content">
                {stockSubTab === 'lembaran' ? (
                    <div className="space-y-6">
                        {/* 4 FILTER CARDS AT THE TOP */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { key: 'all', label: 'Semua Stok Bahan', count: sheetGlasses.length, icon: Boxes, color: 'text-[#1b68b0]' },
                            { key: 'aman', label: 'Stok Aman', count: sheetGlasses.filter(g => g.status === 'Aman').length, icon: CheckCircle2, color: 'text-[#70b03c]' },
                            { key: 'menipis', label: 'Stok Menipis', count: sheetGlasses.filter(g => g.status === 'Menipis').length, icon: AlertTriangle, color: 'text-amber-600' },
                            { key: 'pengajuan', label: 'Pengajuan Restock', count: sheetGlasses.filter(g => g.status === 'Pengajuan Proses Restock').length, icon: Clock, color: 'text-rose-600' },
                        ].map(card => {
                            const IconComponent = card.icon;
                            const isActive = activeStockCard === card.key;
                            return (
                                <div
                                    key={card.key}
                                    onClick={() => setActiveStockCard(card.key)}
                                    className={`relative cursor-pointer border rounded-2xl p-4 transition shadow-xs ${
                                        isActive 
                                            ? 'bg-blue-50/50 border-2 border-[#1b68b0]' 
                                            : 'bg-white border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    {card.key === 'pengajuan' && card.count > 0 && (
                                        <span className="absolute -top-2.5 -right-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                                            Perlu Restock
                                        </span>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-slate-500">{card.label}</span>
                                        <IconComponent className={`w-4 h-4 ${card.color}`} />
                                    </div>
                                    <div className={`text-2xl font-black mt-1 ${card.color}`}>{card.count}</div>
                                </div>
                            );
                        })}
                    </div>

                    {/* BUTTON TAMBAH BARANG BARU */}
                    {(userRole === 'admin_toko' || userRole === 'admin_gudang' || userRole === 'owner') && (
                        <div className="flex justify-start">
                            <button
                                onClick={() => setShowAddStockModal(true)}
                                className="bg-[#1b68b0] hover:bg-[#15528c] text-white font-bold px-4 py-2.5 rounded-xl shadow-xs text-xs flex items-center gap-2 transition cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Tambah Jenis Barang Baru</span>
                            </button>
                        </div>
                    )}

                    {/* TABLE HEADER & SEARCH BAR */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                        <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-3">
                                <h3 className="font-black text-[#242222] text-sm flex items-center gap-2">
                                    <Boxes className="w-4 h-4 text-[#1b68b0]" />
                                    <span>Tabel Kaca Lembaran: <span className="text-[#1b68b0] uppercase">{activeStockCard}</span></span>
                                </h3>
                                <span className="text-xs bg-blue-50 text-[#1b68b0] px-2.5 py-0.5 rounded-full border border-blue-200 font-mono font-bold">
                                    {filteredSheetGlasses.length} Barang
                                </span>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                <button
                                    type="button"
                                    onClick={() => setShowTableSupplierInfo(prev => !prev)}
                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition border flex items-center gap-1.5 cursor-pointer ${
                                        showTableSupplierInfo
                                            ? 'bg-blue-50 text-[#1b68b0] border-blue-200'
                                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                    }`}
                                    title="Tampilkan / sembunyikan info supplier di tabel"
                                >
                                    {showTableSupplierInfo ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                    <span>Supplier: {showTableSupplierInfo ? 'Tampil' : 'Sembunyi'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowTablePricingInfo(prev => !prev)}
                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition border flex items-center gap-1.5 cursor-pointer ${
                                        showTablePricingInfo
                                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                    }`}
                                    title="Tampilkan / sembunyikan modal harga beli supplier di tabel"
                                >
                                    {showTablePricingInfo ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                    <span>Modal Beli: {showTablePricingInfo ? 'Tampil' : 'Sembunyi'}</span>
                                </button>

                                <div className="relative">
                                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Cari Kode / Nama / Jenis Kaca..."
                                        value={stockSearchTerm}
                                        onChange={e => setStockSearchTerm(e.target.value)}
                                        className="bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#242222] focus:border-[#1b68b0] focus:ring-1 focus:ring-[#1b68b0] focus:outline-none w-56"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto border border-slate-200 rounded-xl">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50/80 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200">
                                    <tr>
                                        <th className="p-3">Kode & Restock</th>
                                        <th className="p-3">Nama Barang</th>
                                        <th className="p-3">Jenis Kaca</th>
                                        <th className="p-3">Ukuran Barang</th>
                                        <th className="p-3">Harga Jual & Jasa</th>
                                        <th className="p-3 text-center">Quantity</th>
                                        <th className="p-3 text-center">Status</th>
                                        <th className="p-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredSheetGlasses.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="p-8 text-center text-slate-400 text-xs italic">
                                                Tidak ada barang stok lembaran yang sesuai dengan filter / pencarian.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredSheetGlasses.map(item => (
                                            <tr key={item.id} className="hover:bg-slate-50/70 transition">
                                                <td className="p-3">
                                                    <div className="font-extrabold text-[#1b68b0] font-mono text-xs">{item.item_code}</div>
                                                    <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                                                        <Calendar className="w-3 h-3 text-slate-400" />
                                                        <span>{item.last_restock}</span>
                                                    </div>
                                                </td>
                                                <td className="p-3 font-bold text-[#242222]">
                                                    <div className="flex items-center gap-3">
                                                        {item.image_path ? (
                                                            <div 
                                                                className="relative group cursor-pointer shrink-0 overflow-hidden rounded-xl"
                                                                onClick={() => handleOpenSketchLightbox(item.image_path, `${item.name} (${item.item_code || 'Kaca'})`)}
                                                                title="Klik untuk memperbesar / melihat foto kaca"
                                                            >
                                                                <img 
                                                                    src={item.image_path.startsWith('http') || item.image_path.startsWith('/') ? item.image_path : `/storage/${item.image_path}`} 
                                                                    alt={item.name} 
                                                                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs group-hover:opacity-85 transition group-hover:scale-105 bg-slate-50"
                                                                />
                                                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                                                                    <ZoomIn className="w-4 h-4" />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-[#1b68b0] flex items-center justify-center shrink-0 font-bold shadow-2xs">
                                                                <Boxes className="w-5 h-5 text-[#1b68b0]" />
                                                            </div>
                                                        )}
                                                        <div className="min-w-0">
                                                            <div className="font-extrabold text-[#242222] text-xs leading-snug truncate">
                                                                {item.name}
                                                            </div>
                                                            {showTableSupplierInfo && (
                                                                <div className="text-[11px] text-[#70b03c] font-medium mt-0.5">
                                                                    Supplier: <span className="text-slate-700">{item.supplier_name || '-'}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <span className="bg-blue-50 text-[#1b68b0] border border-blue-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                                                        {item.category}
                                                    </span>
                                                </td>
                                                <td className="p-3 font-mono font-bold text-slate-700">{item.size}</td>
                                                <td className="p-3 text-xs">
                                                    {canViewPricing ? (
                                                        <div className="space-y-0.5 font-mono">
                                                            <div>
                                                                <span className="text-emerald-700 font-black text-xs">Rp {Number(item.sell_price || 0).toLocaleString('id-ID')}</span>
                                                                <span className="text-[10px] text-slate-400 font-sans"> /lbr</span>
                                                            </div>
                                                            {showTablePricingInfo && (
                                                                <div className="text-slate-500 text-[11px] pt-0.5 border-t border-slate-100">
                                                                    Beli: <span className="text-amber-700 font-bold">Rp {Number(item.buy_price || 0).toLocaleString('id-ID')}</span>
                                                                </div>
                                                            )}
                                                            <div className="text-[10px] text-slate-500 pt-1 flex flex-wrap gap-1 border-t border-slate-100 font-sans">
                                                                <span className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 font-mono">HT: {Number(item.rate_ht || 1000).toLocaleString('id-ID')}</span>
                                                                <span className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 font-mono">GM: {Number(item.rate_gm || 10000).toLocaleString('id-ID')}</span>
                                                                <span className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 font-mono">BV: {Number(item.rate_bv || 15000).toLocaleString('id-ID')}</span>
                                                                <span className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 font-mono">Etsa: {Number(item.rate_etsa || 50000).toLocaleString('id-ID')}</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 text-xs italic flex items-center gap-1">
                                                            <Lock className="w-3 h-3" /> Rahasia
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-3 text-center">
                                                    <span className={`font-extrabold font-mono text-xs px-2.5 py-1 rounded-lg border ${item.qty <= 5 ? 'bg-rose-50 text-rose-700 border-rose-200' : item.qty <= 10 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                                                        {item.qty} {item.unit || 'Lembar'}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-center">
                                                    {item.status === 'Aman' && (
                                                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                            Aman
                                                        </span>
                                                    )}
                                                    {item.status === 'Menipis' && (
                                                        <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                                            Menipis
                                                        </span>
                                                    )}
                                                    {item.status === 'Pengajuan Proses Restock' && (
                                                        <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                                                            Pengajuan Restock
                                                        </span>
                                                    )}
                                                    {item.status === 'Sedang Dipesan Supplier' && (
                                                        <span className="bg-blue-50 text-[#1b68b0] border border-blue-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-[#1b68b0] animate-ping"></span>
                                                            Sedang Dipesan
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-3 text-right">
                                                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                                                        {(userRole === 'admin_toko' || userRole === 'owner') && (
                                                            <>
                                                                {item.status === 'Pengajuan Proses Restock' && (
                                                                    <button
                                                                        onClick={() => handleOpenSupplierWaModal(item)}
                                                                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold px-2.5 py-1.5 rounded-lg text-xs transition flex items-center gap-1 cursor-pointer shadow-2xs"
                                                                        title="Setujui dan chat WA supplier"
                                                                    >
                                                                        <MessageSquare className="w-3.5 h-3.5" /> WA Supplier
                                                                    </button>
                                                                )}

                                                                <button
                                                                    onClick={() => handleOpenRestockModal(item)}
                                                                    className="bg-blue-50 hover:bg-blue-100 text-[#1b68b0] border border-blue-200 font-bold px-2.5 py-1.5 rounded-lg text-xs transition flex items-center gap-1 cursor-pointer shadow-2xs"
                                                                >
                                                                    <RefreshCw className="w-3.5 h-3.5" /> Restock
                                                                </button>

                                                                <button
                                                                    onClick={() => handleOpenEditStockModal(item)}
                                                                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold px-2.5 py-1.5 rounded-lg text-xs transition flex items-center gap-1 cursor-pointer shadow-2xs"
                                                                    title="Edit Informasi Kaca"
                                                                >
                                                                    <Edit className="w-3.5 h-3.5" /> Edit
                                                                </button>

                                                                {handleDeleteStockItem && (
                                                                    <button
                                                                        onClick={() => handleDeleteStockItem(item.id)}
                                                                        className="bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 font-bold p-1.5 rounded-lg text-xs transition flex items-center justify-center cursor-pointer shadow-2xs"
                                                                        title="Hapus Kaca"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}

                                                        {(userRole === 'admin_gudang' || userRole.startsWith('divisi_')) && (
                                                            item.status === 'Pengajuan Proses Restock' ? (
                                                                <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-1 rounded-md font-bold">
                                                                    Menunggu Toko
                                                                </span>
                                                            ) : item.status === 'Sedang Dipesan Supplier' ? (
                                                                <button
                                                                    onClick={() => handleOpenRestockModal(item)}
                                                                    className="bg-blue-50 hover:bg-blue-100 text-[#1b68b0] border border-blue-200 font-bold px-2.5 py-1.5 rounded-lg text-xs transition shadow-2xs flex items-center gap-1 cursor-pointer"
                                                                    title="Validasi kedatangan fisik lembaran kaca"
                                                                >
                                                                    <Package className="w-3.5 h-3.5" /> Terima Fisik
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleRequestRestockStatus(item.id)}
                                                                    className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-bold px-2.5 py-1.5 rounded-lg text-xs transition shadow-2xs flex items-center gap-1 cursor-pointer"
                                                                    title="Ajukan kebutuhan restock barang ini"
                                                                >
                                                                    <Send className="w-3.5 h-3.5" /> Ajukan Stok
                                                                </button>
                                                            )
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
            ) : (
                /* TABEL KACA SISA POTONGAN DI RAK */
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-base font-black text-[#242222] flex items-center gap-2">
                            <Scissors className="w-4 h-4 text-[#1b68b0]" />
                            <span>Stok Kaca Sisa Potongan di Rak Storage</span>
                        </h3>
                        {(userRole === 'divisi_ht' || userRole === 'admin_gudang' || userRole === 'owner' || userRole === 'admin_toko') && (
                            <button 
                                onClick={() => setShowScrapModal(true)} 
                                className="bg-[#1b68b0] hover:bg-[#15528c] text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Input Kaca Sisa Baru</span>
                            </button>
                        )}
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                        <div className="overflow-x-auto border border-slate-200 rounded-xl">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50/80 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200">
                                    <tr>
                                        <th className="p-3">Kode Sisa</th>
                                        <th className="p-3">Jenis Kaca</th>
                                        <th className="p-3">Ukuran (P x L)</th>
                                        <th className="p-3">Lokasi Rak Storage</th>
                                        <th className="p-3 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {initialScrap.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="p-8 text-center text-slate-400 text-xs italic">
                                                Belum ada data kaca sisa potongan di rak storage.
                                            </td>
                                        </tr>
                                    ) : (
                                        initialScrap.map(s => (
                                            <tr key={s.id} className="hover:bg-slate-50/70 transition">
                                                <td className="p-3 font-mono font-extrabold text-[#1b68b0]">{s.scrap_code}</td>
                                                <td className="p-3 font-bold text-[#242222]">{s.glass_type}</td>
                                                <td className="p-3 font-mono font-bold text-slate-700">{s.length_cm} x {s.width_cm} cm</td>
                                                <td className="p-3">
                                                    <span className="bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-purple-200">
                                                        {s.rak_location}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-center">
                                                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                                                        {s.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}
