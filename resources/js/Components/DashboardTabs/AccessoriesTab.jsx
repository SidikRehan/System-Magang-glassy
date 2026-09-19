import React from 'react';

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
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-100">🔌 Stok Aksesoris</h2>
                    <p className="text-slate-400 text-sm">Kelola inventory aksesoris (lem sealant, lis alumunium, handle, engsel, spider fitting, & karet lis)</p>
                </div>
            </div>

            {/* 4 STATS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                    <span className="text-xs text-slate-400 block">Total Item Aksesoris</span>
                    <h3 className="text-2xl font-black text-cyan-400 mt-1">{accessoriesList.length} Item</h3>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                    <span className="text-xs text-slate-400 block">Stok Aman</span>
                    <h3 className="text-2xl font-black text-emerald-400 mt-1">{accessoriesList.filter(a => a.status === 'Aman').length} Item</h3>
                </div>
                <div className={`relative border rounded-xl p-4 transition ${needingRestockCount > 0 ? 'bg-amber-950/20 border-amber-500/60 shadow-lg shadow-amber-500/20 animate-pulse' : 'bg-slate-900/80 border-slate-800'}`}>
                    {needingRestockCount > 0 && (
                        <span className="absolute -top-2.5 -right-2 bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-lg border border-amber-300 animate-bounce flex items-center gap-1 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping"></span>
                            🔔 Perlu Restock
                        </span>
                    )}
                    <span className="text-xs text-slate-400 block">Stok Menipis / Perlu Restock</span>
                    <h3 className="text-2xl font-black text-amber-400 mt-1">{needingRestockCount} Item</h3>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                    <span className="text-xs text-slate-400 block">Estimasi Nilai Inventory</span>
                    <h3 className="text-2xl font-black text-purple-400 mt-1">Rp {Number(estimatedInventoryValue).toLocaleString()}</h3>
                </div>
            </div>

            {/* BUTTON TAMBAH AKSESORIS DIRECTLY BELOW CARDS */}
            {(userRole === 'admin_toko' || userRole === 'owner') && (
                <div className="flex justify-start">
                    <button
                        onClick={() => setShowAddAccModal(true)}
                        className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black px-5 py-2.5 rounded-xl shadow-xl shadow-emerald-500/20 text-sm flex items-center gap-2 transition transform hover:scale-105 border border-cyan-300/50 cursor-pointer"
                    >
                        <span className="text-base">✨</span> + Tambah Aksesoris Baru
                    </button>
                </div>
            )}

            {/* SEARCH BAR & ACCESSORIES TABLE */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                        <h3 className="font-bold text-slate-100 text-base">
                            📋 Tabel Inventory & Harga Aksesoris Kaca
                        </h3>
                        <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2.5 py-1 rounded-full border border-cyan-500/20 font-mono font-bold">
                            {accessoriesList.length} Items
                        </span>
                    </div>

                    <input
                        type="text"
                        placeholder="🔍 Cari Kode / Nama Aksesoris..."
                        value={accSearchTerm}
                        onChange={e => setAccSearchTerm(e.target.value)}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-800/40 text-slate-400 uppercase text-xs">
                            <tr>
                                <th className="p-3">Kode Barang</th>
                                <th className="p-3">Nama Aksesoris</th>
                                <th className="p-3">Harga Beli & Jual</th>
                                <th className="p-3">Stok Quantity</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {filteredAccessories.map(acc => (
                                <tr key={acc.id} className="hover:bg-slate-800/30">
                                    <td className="p-3 font-extrabold text-cyan-400 font-mono">
                                        {acc.acc_code}
                                    </td>
                                    <td className="p-3 font-bold text-slate-100">
                                        <div>{acc.name}</div>
                                    </td>
                                    <td className="p-3 text-xs">
                                        {canViewPricing ? (
                                            <div className="space-y-0.5 font-mono">
                                                <div className="text-slate-400">Beli: <span className="text-amber-400 font-bold">Rp {Number(acc.buy_price || 0).toLocaleString()}</span></div>
                                                <div className="text-slate-400">Jual: <span className="text-emerald-400 font-bold">Rp {Number(acc.sell_price || 0).toLocaleString()}</span></div>
                                            </div>
                                        ) : (
                                            <span className="text-slate-500 text-xs italic">🔒 Rahasia</span>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        <span className={`font-extrabold font-mono text-sm px-2.5 py-1 rounded-lg border ${acc.qty <= 5 ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : acc.qty <= 15 ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
                                            {acc.qty} {acc.unit || 'Pcs'}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        {acc.status === 'Aman' && (
                                            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                                Aman
                                            </span>
                                        )}
                                        {acc.status === 'Menipis' && (
                                            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                                Menipis
                                            </span>
                                        )}
                                        {acc.status === 'Habis' && (
                                            <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                                                Habis
                                            </span>
                                        )}
                                        {acc.status === 'Pengajuan Restock' && (
                                            <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
                                                Pengajuan Restock
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <button
                                                onClick={() => { setSelectedAccItem(acc); setAccRestockQty(10); setShowRestockAccModal(true); }}
                                                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black px-2.5 py-1.5 rounded-lg text-xs transition shadow-md shadow-cyan-500/20 cursor-pointer"
                                                title="Restock Aksesoris Masuk"
                                            >
                                                🔄 Restock
                                            </button>
                                            {acc.status !== 'Pengajuan Restock' && (
                                                <button
                                                    onClick={() => handleRequestAccRestockStatus(acc.id)}
                                                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2.5 py-1.5 rounded-lg text-xs transition shadow-md flex items-center gap-1 cursor-pointer"
                                                    title="Ajukan kebutuhan restock aksesoris ini"
                                                >
                                                    📩 Ajukan Stok
                                                </button>
                                            )}
                                            {(userRole === 'admin_toko' || userRole === 'owner') && (
                                                <>
                                                    <button
                                                        onClick={() => handleOpenEditAccModal(acc)}
                                                        className="bg-[#2563EB] hover:bg-blue-600 text-white font-extrabold px-2.5 py-1.5 rounded-lg text-xs transition shadow-md shadow-blue-500/20 cursor-pointer"
                                                        title="Edit Aksesoris"
                                                    >
                                                        ✏️ Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteAcc(acc.id)}
                                                        className="bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 px-2 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                                                        title="Hapus Aksesoris"
                                                    >
                                                        🗑️
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredAccessories.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="p-6 text-center text-slate-500 text-xs italic">
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
