import React from 'react';
import { 
    Plug, Plus, Search, RefreshCw, Send, 
    Edit, Trash2, AlertTriangle, CheckCircle2, 
    Lock, Package, AlertCircle
} from 'lucide-react';

export default function AccessoriesTab({
    userRole,
    canViewPricing = true,
    accessoriesList = [],
    accSearchTerm = '',
    setAccSearchTerm,
    setShowAddAccModal,
    setSelectedAccItem,
    setAccRestockQty,
    setShowRestockAccModal,
    handleRequestAccRestockStatus,
    handleOpenEditAccModal,
    handleDeleteAcc,
}) {
    if (userRole !== 'admin_toko' && userRole !== 'owner') {
        return null;
    }

    const filteredAccessories = accessoriesList.filter(a =>
        (a.acc_code || '').toLowerCase().includes(accSearchTerm.toLowerCase()) ||
        (a.name || '').toLowerCase().includes(accSearchTerm.toLowerCase())
    );

    const needingRestockCount = accessoriesList.filter(a => 
        a.status === 'Menipis' || a.status === 'Habis' || a.status === 'Pengajuan Restock'
    ).length;

    const estimatedInventoryValue = accessoriesList.reduce(
        (acc, a) => acc + ((Number(a.buy_price) || 0) * (Number(a.qty) || 0)), 
        0
    );

    return (
        <div className="space-y-6">
            {/* HEADER TAB */}
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-[#242222] flex items-center gap-2.5">
                        <Plug className="w-6 h-6 text-[#1b68b0]" />
                        <span>Stok Aksesoris Konsumen</span>
                    </h2>
                    <p className="text-slate-500 text-xs font-medium mt-1">
                        Kelola inventory aksesoris (sealant, lis aluminium, handle pintu, engsel patch fitting, spider fitting, & karet lis).
                    </p>
                </div>
            </div>

            {/* 4 STATS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                    <span className="text-xs text-slate-500 font-semibold block">Total Item Aksesoris</span>
                    <h3 className="text-2xl font-black text-[#1b68b0] mt-1">{accessoriesList.length} Item</h3>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                    <span className="text-xs text-slate-500 font-semibold block">Stok Aman</span>
                    <h3 className="text-2xl font-black text-[#70b03c] mt-1">{accessoriesList.filter(a => a.status === 'Aman').length} Item</h3>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                    <span className="text-xs text-slate-500 font-semibold block">Stok Menipis / Perlu Restock</span>
                    <div className="flex items-center gap-2 mt-1">
                        <h3 className={`text-2xl font-black ${needingRestockCount > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
                            {needingRestockCount} Item
                        </h3>
                        {needingRestockCount > 0 && (
                            <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                                Perlu Restock
                            </span>
                        )}
                    </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                    <span className="text-xs text-slate-500 font-semibold block">Estimasi Nilai Inventory</span>
                    <h3 className="text-2xl font-black text-[#242222] mt-1">Rp {Number(estimatedInventoryValue).toLocaleString('id-ID')}</h3>
                </div>
            </div>

            {/* BUTTON TAMBAH AKSESORIS */}
            {(userRole === 'admin_toko' || userRole === 'owner') && (
                <div className="flex justify-start">
                    <button
                        onClick={() => setShowAddAccModal(true)}
                        className="bg-[#1b68b0] hover:bg-[#15528c] text-white font-bold px-4 py-2.5 rounded-xl shadow-xs text-xs flex items-center gap-2 transition cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Aksesoris Baru</span>
                    </button>
                </div>
            )}

            {/* SEARCH BAR & ACCESSORIES TABLE */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                        <h3 className="font-black text-[#242222] text-sm flex items-center gap-2">
                            <Plug className="w-4 h-4 text-[#1b68b0]" />
                            <span>Tabel Inventory & Harga Aksesoris Kaca</span>
                        </h3>
                        <span className="text-xs bg-blue-50 text-[#1b68b0] px-2.5 py-0.5 rounded-full border border-blue-200 font-mono font-bold">
                            {accessoriesList.length} Items
                        </span>
                    </div>

                    <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari Kode / Nama Aksesoris..."
                            value={accSearchTerm}
                            onChange={e => setAccSearchTerm(e.target.value)}
                            className="bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#242222] focus:border-[#1b68b0] focus:ring-1 focus:ring-[#1b68b0] focus:outline-none w-64"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50/80 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-200">
                            <tr>
                                <th className="p-3">Kode Barang</th>
                                <th className="p-3">Nama Aksesoris</th>
                                <th className="p-3">Harga Beli & Jual</th>
                                <th className="p-3">Stok Quantity</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {filteredAccessories.map(acc => (
                                <tr key={acc.id} className="hover:bg-slate-50/70 transition">
                                    <td className="p-3 font-extrabold text-[#1b68b0] font-mono text-xs">
                                        {acc.acc_code}
                                    </td>
                                    <td className="p-3 font-bold text-[#242222]">
                                        <div className="flex items-center gap-3">
                                            {acc.image_path ? (
                                                <img 
                                                    src={acc.image_path.startsWith('http') || acc.image_path.startsWith('/') ? acc.image_path : `/storage/${acc.image_path}`} 
                                                    alt={acc.name} 
                                                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0 bg-slate-50"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-[#1b68b0] flex items-center justify-center shrink-0 font-bold shadow-2xs">
                                                    <Plug className="w-5 h-5 text-[#1b68b0]" />
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <div className="font-extrabold text-[#242222] text-xs leading-snug truncate">
                                                    {acc.name}
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-mono">
                                                    {acc.acc_code} • {acc.unit || 'Pcs'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3 text-xs">
                                        {canViewPricing ? (
                                            <div className="space-y-0.5 font-mono">
                                                <div className="text-slate-500 text-[11px]">Beli: <span className="text-amber-700 font-bold">Rp {Number(acc.buy_price || 0).toLocaleString('id-ID')}</span></div>
                                                <div className="text-slate-700 font-bold">Jual: <span className="text-emerald-700 font-black">Rp {Number(acc.sell_price || 0).toLocaleString('id-ID')}</span></div>
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 text-xs italic flex items-center gap-1">
                                                <Lock className="w-3 h-3" /> Rahasia
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        <span className={`font-extrabold font-mono text-xs px-2.5 py-1 rounded-lg border ${acc.qty <= 5 ? 'bg-rose-50 text-rose-700 border-rose-200' : acc.qty <= 15 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                                            {acc.qty} {acc.unit || 'Pcs'}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        {acc.status === 'Aman' && (
                                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                Aman
                                            </span>
                                        )}
                                        {acc.status === 'Menipis' && (
                                            <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                                Menipis
                                            </span>
                                        )}
                                        {acc.status === 'Habis' && (
                                            <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                                                Habis
                                            </span>
                                        )}
                                        {acc.status === 'Pengajuan Restock' && (
                                            <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                                                Pengajuan Restock
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-3 text-center">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <button
                                                onClick={() => { setSelectedAccItem(acc); setAccRestockQty(10); setShowRestockAccModal(true); }}
                                                className="bg-blue-50 hover:bg-blue-100 text-[#1b68b0] border border-blue-200 font-bold px-2.5 py-1.5 rounded-lg text-xs transition shadow-2xs flex items-center gap-1 cursor-pointer"
                                                title="Restock Aksesoris Masuk"
                                            >
                                                <RefreshCw className="w-3.5 h-3.5" /> Restock
                                            </button>
                                            {acc.status !== 'Pengajuan Restock' && (
                                                <button
                                                    onClick={() => handleRequestAccRestockStatus(acc.id)}
                                                    className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-bold px-2.5 py-1.5 rounded-lg text-xs transition shadow-2xs flex items-center gap-1 cursor-pointer"
                                                    title="Ajukan kebutuhan restock aksesoris ini"
                                                >
                                                    <Send className="w-3.5 h-3.5" /> Ajukan
                                                </button>
                                            )}
                                            {(userRole === 'admin_toko' || userRole === 'owner') && (
                                                <>
                                                    <button
                                                        onClick={() => handleOpenEditAccModal(acc)}
                                                        className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold px-2.5 py-1.5 rounded-lg text-xs transition shadow-2xs flex items-center gap-1 cursor-pointer"
                                                        title="Edit Aksesoris"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteAcc(acc.id)}
                                                        className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 p-1.5 rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer"
                                                        title="Hapus Aksesoris"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredAccessories.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-400 text-xs italic">
                                        Tidak ada item aksesoris yang sesuai dengan pencarian.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
