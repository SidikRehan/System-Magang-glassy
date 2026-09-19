import React from 'react';

export default function WarehouseSuppliesTab({
    userRole,
    warehouseSuppliesList = [],
    supplyRestockRequests = [],
    supplyUsageLogs = [],
    supplySubTab = 'katalog',
    setSupplySubTab,
    supplySearchTerm = '',
    setSupplySearchTerm,
    handleOpenRequestRestockModal,
    setShowAddSupplyModal,
    setShowUseSupplyModal,
    handleApproveRestockRequest,
    handleCompleteRestockRequest,
}) {
    const needingRestockSupplies = warehouseSuppliesList.filter(s => s.status === 'Menipis' || s.status === 'Habis').length;
    const activeRestockRequests = supplyRestockRequests.filter(r => r.status !== 'Selesai Restok').length;

    const filteredSupplies = warehouseSuppliesList.filter(s =>
        (s.name || '').toLowerCase().includes(supplySearchTerm.toLowerCase()) ||
        (s.item_code || '').toLowerCase().includes(supplySearchTerm.toLowerCase()) ||
        (s.category || '').toLowerCase().includes(supplySearchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-2xl font-extrabold text-slate-100">🧰 Perlengkapan & Consumables Gudang</h2>
                <p className="text-slate-400 text-sm">Kelola inventory perlengkapan operasional gudang & pabrik yang dipakai / habis pakai (APD, sarung tangan, kacamata safety, lakban, cutter, oli mesin, dll.) serta ajukan restok ke Admin Toko.</p>
            </div>

            {/* STATS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                    <span className="text-xs text-slate-400 block">Total Jenis Perlengkapan</span>
                    <h3 className="text-2xl font-black text-cyan-400 mt-1">{warehouseSuppliesList.length} Item</h3>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                    <span className="text-xs text-slate-400 block">Stok Aman</span>
                    <h3 className="text-2xl font-black text-emerald-400 mt-1">{warehouseSuppliesList.filter(s => s.status === 'Aman').length} Item</h3>
                </div>
                <div className={`relative border rounded-xl p-4 transition ${needingRestockSupplies > 0 ? 'bg-amber-950/20 border-amber-500/60 shadow-lg shadow-amber-500/20 animate-pulse' : 'bg-slate-900/80 border-slate-800'}`}>
                    {needingRestockSupplies > 0 && (
                        <span className="absolute -top-2.5 -right-2 bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-lg border border-amber-300 animate-bounce flex items-center gap-1 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping"></span>
                            🔔 Perlu Restok
                        </span>
                    )}
                    <span className="text-xs text-slate-400 block">Stok Menipis / Perlu Restok</span>
                    <h3 className="text-2xl font-black text-amber-400 mt-1">{needingRestockSupplies} Item</h3>
                </div>
                <div className={`relative border rounded-xl p-4 transition ${activeRestockRequests > 0 ? 'bg-purple-950/20 border-purple-500/60 shadow-lg shadow-purple-500/20 animate-pulse' : 'bg-slate-900/80 border-slate-800'}`}>
                    {activeRestockRequests > 0 && (
                        <span className="absolute -top-2.5 -right-2 bg-purple-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-lg border border-purple-300 animate-bounce flex items-center gap-1 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                            🔔 {activeRestockRequests} Pengajuan
                        </span>
                    )}
                    <span className="text-xs text-slate-400 block">Pengajuan Restok Aktif</span>
                    <h3 className="text-2xl font-black text-purple-400 mt-1">{activeRestockRequests} Pengajuan</h3>
                </div>
            </div>

            {/* BUTTON ACTION & SUBTAB TOGGLE */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => setSupplySubTab('katalog')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${supplySubTab === 'katalog' ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                    >
                        📦 Katalog Perlengkapan ({warehouseSuppliesList.length})
                    </button>
                    <button
                        onClick={() => setSupplySubTab('usage_log')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${supplySubTab === 'usage_log' ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                    >
                        📋 Log Pemakaian Gudang ({supplyUsageLogs.length})
                    </button>
                    <button
                        onClick={() => setSupplySubTab('restock_requests')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${supplySubTab === 'restock_requests' ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                    >
                        <span>📩 Pengajuan Restok ke Admin Toko</span>
                        {activeRestockRequests > 0 && (
                            <span className="bg-purple-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce shadow-sm font-mono">
                                {activeRestockRequests} Restok
                            </span>
                        )}
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {(userRole === 'admin_gudang' || userRole === 'owner') && (
                        <>
                            <button
                                onClick={() => handleOpenRequestRestockModal(null)}
                                className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition shadow-md shadow-amber-500/20 cursor-pointer"
                            >
                                <span>📩</span> + Ajukan Restok ke Admin Toko
                            </button>
                            <button
                                onClick={() => setShowAddSupplyModal(true)}
                                className="bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold px-4 py-2 rounded-lg border border-cyan-500/30 text-xs flex items-center gap-1.5 transition cursor-pointer"
                            >
                                <span>✨</span> + Tambah Perlengkapan Baru
                            </button>
                            <button
                                onClick={() => setShowUseSupplyModal(true)}
                                className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition shadow-md shadow-cyan-500/20 cursor-pointer"
                            >
                                <span>📝</span> + Catat Pemakaian Barang
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* SUBTAB CONTENT 1: KATALOG PERLENGKAPAN */}
            {supplySubTab === 'katalog' && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <h3 className="font-extrabold text-slate-200 text-base">📋 Master Inventory Perlengkapan Gudang</h3>
                        <input
                            type="text"
                            placeholder="🔍 Cari Kode / Nama Perlengkapan / Kategori..."
                            value={supplySearchTerm}
                            onChange={e => setSupplySearchTerm(e.target.value)}
                            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 w-64 focus:border-cyan-400"
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-300">
                            <thead className="bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px]">
                                <tr>
                                    <th className="p-3">Kode</th>
                                    <th className="p-3">Nama Perlengkapan Operasional</th>
                                    <th className="p-3">Kategori</th>
                                    <th className="p-3 text-center">Stok</th>
                                    <th className="p-3">Lokasi Simpan</th>
                                    <th className="p-3 text-center">Status Stok</th>
                                    <th className="p-3 text-right">Aksi Gudang</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {filteredSupplies.map(s => (
                                    <tr key={s.id} className="hover:bg-slate-800/40 transition">
                                        <td className="p-3 font-mono text-cyan-400 font-bold">{s.item_code}</td>
                                        <td className="p-3 font-bold text-slate-100">{s.name}</td>
                                        <td className="p-3 text-slate-400">{s.category}</td>
                                        <td className="p-3 text-center font-extrabold text-slate-100">
                                            {s.stock_qty} <span className="text-[10px] text-slate-400 font-normal">{s.unit}</span>
                                        </td>
                                        <td className="p-3 text-slate-400">{s.location}</td>
                                        <td className="p-3 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${s.status === 'Aman' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : s.status === 'Menipis' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
                                                {s.status}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right">
                                            {(userRole === 'admin_gudang' || userRole === 'owner') && (
                                                <button
                                                    onClick={() => handleOpenRequestRestockModal(s)}
                                                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ml-auto cursor-pointer ${s.status !== 'Aman' ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20 animate-pulse' : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30'}`}
                                                    title="Ajukan Restok Barang ini ke Admin Toko"
                                                >
                                                    <span>📩</span> Ajukan Restok
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filteredSupplies.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="p-6 text-center text-slate-500 text-xs italic">
                                            Tidak ada perlengkapan yang sesuai dengan pencarian.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* SUBTAB CONTENT 2: LOG PEMAKAIAN */}
            {supplySubTab === 'usage_log' && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
                    <h3 className="font-extrabold text-slate-200 text-base">📋 Riwayat & Log Pemakaian Perlengkapan Operasional</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-300">
                            <thead className="bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px]">
                                <tr>
                                    <th className="p-3">Tanggal</th>
                                    <th className="p-3">Kode & Nama Perlengkapan</th>
                                    <th className="p-3 text-center">Jumlah Dipakai</th>
                                    <th className="p-3">Divisi Pengambil</th>
                                    <th className="p-3">Nama Pengambil</th>
                                    <th className="p-3">Catatan Pemakaian</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {supplyUsageLogs.map(log => (
                                    <tr key={log.id} className="hover:bg-slate-800/40 transition">
                                        <td className="p-3 text-slate-400">{log.usage_date}</td>
                                        <td className="p-3">
                                            <div className="font-bold text-slate-100">{log.item_name}</div>
                                            <div className="text-[10px] font-mono text-cyan-400">{log.item_code}</div>
                                        </td>
                                        <td className="p-3 text-center font-extrabold text-cyan-300">
                                            {log.used_qty} {log.unit}
                                        </td>
                                        <td className="p-3 font-semibold text-slate-300">{log.user_division}</td>
                                        <td className="p-3 text-slate-300">{log.taker_name}</td>
                                        <td className="p-3 text-slate-400 italic">{log.notes}</td>
                                    </tr>
                                ))}
                                {supplyUsageLogs.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="p-6 text-center text-slate-500 text-xs italic">
                                            Belum ada log pemakaian perlengkapan gudang.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* SUBTAB CONTENT 3: PENGAJUAN RESTOK KE ADMIN TOKO */}
            {supplySubTab === 'restock_requests' && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <h3 className="font-extrabold text-slate-200 text-base">📩 Daftar Pengajuan Restok Perlengkapan ke Admin Toko</h3>
                            <p className="text-xs text-slate-400">Monitoring pengajuan restok barang gudang yang diajukan Admin Gudang ke Admin Toko/Purchasing.</p>
                        </div>
                        {(userRole === 'admin_gudang' || userRole === 'owner') && (
                            <button
                                onClick={() => handleOpenRequestRestockModal(null)}
                                className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition shadow-md shadow-amber-500/20 cursor-pointer"
                            >
                                <span>📩</span> + Ajukan Restok Baru
                            </button>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-300">
                            <thead className="bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px]">
                                <tr>
                                    <th className="p-3">Tanggal</th>
                                    <th className="p-3">Kode & Nama Perlengkapan</th>
                                    <th className="p-3 text-center">Jumlah Restok</th>
                                    <th className="p-3">Prioritas</th>
                                    <th className="p-3">Diajukan Oleh</th>
                                    <th className="p-3">Catatan / Keperluan</th>
                                    <th className="p-3 text-center">Status Pengajuan</th>
                                    <th className="p-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {supplyRestockRequests.map(req => (
                                    <tr key={req.id} className="hover:bg-slate-800/40 transition">
                                        <td className="p-3 text-slate-400">{req.requested_at}</td>
                                        <td className="p-3">
                                            <div className="font-bold text-slate-100">{req.item_name}</div>
                                            <div className="text-[10px] font-mono text-cyan-400">{req.item_code} (Sisa: {req.current_stock} {req.unit})</div>
                                        </td>
                                        <td className="p-3 text-center font-extrabold text-amber-300">
                                            +{req.request_qty} {req.unit}
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${req.priority.includes('Mendesak') ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-800 text-slate-300'}`}>
                                                {req.priority}
                                            </span>
                                        </td>
                                        <td className="p-3 text-slate-300">{req.requested_by}</td>
                                        <td className="p-3 text-slate-400 italic max-w-xs truncate">{req.notes}</td>
                                        <td className="p-3 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${req.status === 'Menunggu Persetujuan Admin Toko' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : req.status === 'Disetujui & Dipesan' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right">
                                            <div className="flex justify-end gap-1.5">
                                                {req.status === 'Menunggu Persetujuan Admin Toko' && (userRole === 'admin_toko' || userRole === 'owner') && (
                                                    <button
                                                        onClick={() => handleApproveRestockRequest(req.id)}
                                                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-2.5 py-1 rounded text-[11px] transition shadow cursor-pointer"
                                                        title="Setujui dan pesan barang dari supplier"
                                                    >
                                                        ✓ Setujui & Pesan
                                                    </button>
                                                )}

                                                {req.status === 'Disetujui & Dipesan' && (userRole === 'admin_gudang' || userRole === 'admin_toko' || userRole === 'owner') && (
                                                    <button
                                                        onClick={() => handleCompleteRestockRequest(req)}
                                                        className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black px-2.5 py-1 rounded text-[11px] transition shadow cursor-pointer"
                                                        title="Konfirmasi barang dari supplier sudah tiba di gudang (stok otomatis bertambah)"
                                                    >
                                                        📦 Barang Datang (Selesai)
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => {
                                                        const waMsg = `Halo Admin Toko SYP Glass,%0A%0AFollow-up Pengajuan Restok Perlengkapan Gudang:%0A• Barang: [${req.item_code}] ${req.item_name}%0A• Jumlah: ${req.request_qty} ${req.unit}%0A• Status Saat Ini: ${req.status}`;
                                                        window.open(`https://api.whatsapp.com/send?text=${waMsg}`, '_blank');
                                                    }}
                                                    className="bg-slate-800 hover:bg-slate-700 text-emerald-400 px-2 py-1 rounded text-[11px] border border-emerald-500/30 cursor-pointer"
                                                    title="Kirim pesan WhatsApp"
                                                >
                                                    💬 WA
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {supplyRestockRequests.length === 0 && (
                                    <tr>
                                        <td colSpan="8" className="p-6 text-center text-slate-500 text-xs italic">
                                            Belum ada data pengajuan restok.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
