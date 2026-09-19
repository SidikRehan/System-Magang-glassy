import React from 'react';
import { 
    Archive, Plus, Search, CheckCircle2, AlertTriangle, 
    ClipboardList, Send, FileText, Check, Clock, 
    Box, MessageSquare, Package, User, Calendar
} from 'lucide-react';

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
        <div className="space-y-6">
            {/* HEADER TAB */}
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-[#242222] flex items-center gap-2.5">
                        <Archive className="w-6 h-6 text-[#1b68b0]" />
                        <span>Perlengkapan & Consumables Gudang</span>
                    </h2>
                    <p className="text-slate-500 text-xs font-medium mt-1">
                        Monitoring inventory operasional gudang (APD, lakban, cutter, oli mesin potong) serta alur pengajuan restok ke Admin Toko.
                    </p>
                </div>
            </div>

            {/* 4 STATS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                    <span className="text-xs text-slate-500 font-semibold block">Total Jenis Perlengkapan</span>
                    <h3 className="text-2xl font-black text-[#1b68b0] mt-1">{warehouseSuppliesList.length} Item</h3>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                    <span className="text-xs text-slate-500 font-semibold block">Stok Aman</span>
                    <h3 className="text-2xl font-black text-[#70b03c] mt-1">{warehouseSuppliesList.filter(s => s.status === 'Aman').length} Item</h3>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                    <span className="text-xs text-slate-500 font-semibold block">Stok Menipis / Perlu Restok</span>
                    <div className="flex items-center gap-2 mt-1">
                        <h3 className={`text-2xl font-black ${needingRestockSupplies > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
                            {needingRestockSupplies} Item
                        </h3>
                        {needingRestockSupplies > 0 && (
                            <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                                Perlu Restok
                            </span>
                        )}
                    </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                    <span className="text-xs text-slate-500 font-semibold block">Pengajuan Restok Aktif</span>
                    <div className="flex items-center gap-2 mt-1">
                        <h3 className={`text-2xl font-black ${activeRestockRequests > 0 ? 'text-purple-600' : 'text-slate-700'}`}>
                            {activeRestockRequests} Pengajuan
                        </h3>
                        {activeRestockRequests > 0 && (
                            <span className="bg-purple-50 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-200">
                                Aktif
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* BUTTON ACTION & SUBTAB TOGGLE */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 p-3 rounded-2xl shadow-xs">
                {/* SUBTAB PILLS */}
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                        onClick={() => setSupplySubTab('katalog')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            supplySubTab === 'katalog' 
                                ? 'bg-white text-[#1b68b0] shadow-xs border border-slate-200' 
                                : 'text-slate-600 hover:text-[#242222]'
                        }`}
                    >
                        <Box className="w-3.5 h-3.5" />
                        <span>Katalog Perlengkapan ({warehouseSuppliesList.length})</span>
                    </button>
                    <button
                        onClick={() => setSupplySubTab('usage_log')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            supplySubTab === 'usage_log' 
                                ? 'bg-white text-[#1b68b0] shadow-xs border border-slate-200' 
                                : 'text-slate-600 hover:text-[#242222]'
                        }`}
                    >
                        <ClipboardList className="w-3.5 h-3.5" />
                        <span>Log Pemakaian ({supplyUsageLogs.length})</span>
                    </button>
                    <button
                        onClick={() => setSupplySubTab('restock_requests')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            supplySubTab === 'restock_requests' 
                                ? 'bg-white text-[#1b68b0] shadow-xs border border-slate-200' 
                                : 'text-slate-600 hover:text-[#242222]'
                        }`}
                    >
                        <Send className="w-3.5 h-3.5" />
                        <span>Pengajuan Restok</span>
                        {activeRestockRequests > 0 && (
                            <span className="bg-purple-100 text-purple-700 text-[10px] font-black px-2 py-0.5 rounded-full font-mono">
                                {activeRestockRequests}
                            </span>
                        )}
                    </button>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex flex-wrap items-center gap-2">
                    {(userRole === 'admin_gudang' || userRole === 'owner') && (
                        <>
                            <button
                                onClick={() => handleOpenRequestRestockModal(null)}
                                className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                            >
                                <Send className="w-3.5 h-3.5" />
                                <span>Ajukan Restok</span>
                            </button>
                            <button
                                onClick={() => setShowAddSupplyModal(true)}
                                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5 text-[#1b68b0]" />
                                <span>Tambah Item</span>
                            </button>
                            <button
                                onClick={() => setShowUseSupplyModal(true)}
                                className="bg-[#1b68b0] hover:bg-[#15528c] text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                            >
                                <ClipboardList className="w-3.5 h-3.5" />
                                <span>Catat Pemakaian</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* SUBTAB CONTENT 1: KATALOG PERLENGKAPAN */}
            {supplySubTab === 'katalog' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                    <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                            <h3 className="font-black text-[#242222] text-sm flex items-center gap-2">
                                <Box className="w-4 h-4 text-[#1b68b0]" />
                                <span>Master Inventory Perlengkapan Gudang</span>
                            </h3>
                            <span className="text-xs bg-blue-50 text-[#1b68b0] px-2.5 py-0.5 rounded-full border border-blue-200 font-mono font-bold">
                                {filteredSupplies.length} Items
                            </span>
                        </div>

                        <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari Kode / Nama / Kategori..."
                                value={supplySearchTerm}
                                onChange={e => setSupplySearchTerm(e.target.value)}
                                className="bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#242222] focus:border-[#1b68b0] focus:ring-1 focus:ring-[#1b68b0] focus:outline-none w-64"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50/80 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200">
                                <tr>
                                    <th className="p-3">Kode</th>
                                    <th className="p-3">Nama Perlengkapan Operasional</th>
                                    <th className="p-3">Kategori</th>
                                    <th className="p-3 text-center">Stok</th>
                                    <th className="p-3">Lokasi Simpan</th>
                                    <th className="p-3 text-center">Status</th>
                                    <th className="p-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredSupplies.map(s => (
                                    <tr key={s.id} className="hover:bg-slate-50/70 transition">
                                        <td className="p-3 font-mono text-[#1b68b0] font-bold">{s.item_code}</td>
                                        <td className="p-3 font-bold text-[#242222]">{s.name}</td>
                                        <td className="p-3 text-slate-500">{s.category}</td>
                                        <td className="p-3 text-center font-extrabold text-[#242222]">
                                            {s.stock_qty} <span className="text-[10px] text-slate-400 font-normal">{s.unit}</span>
                                        </td>
                                        <td className="p-3 text-slate-500">{s.location}</td>
                                        <td className="p-3 text-center">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${s.status === 'Aman' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : s.status === 'Menipis' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                                                {s.status}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right">
                                            {(userRole === 'admin_gudang' || userRole === 'owner') && (
                                                <button
                                                    onClick={() => handleOpenRequestRestockModal(s)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ml-auto cursor-pointer ${s.status !== 'Aman' ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs'}`}
                                                    title="Ajukan Restok Barang ini ke Admin Toko"
                                                >
                                                    <Send className="w-3.5 h-3.5" /> Ajukan Restok
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filteredSupplies.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="p-8 text-center text-slate-400 text-xs italic">
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
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <ClipboardList className="w-4 h-4 text-[#1b68b0]" />
                        <h3 className="font-black text-[#242222] text-sm">Riwayat & Log Pemakaian Perlengkapan Operasional</h3>
                    </div>
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50/80 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200">
                                <tr>
                                    <th className="p-3">Tanggal</th>
                                    <th className="p-3">Kode & Nama Perlengkapan</th>
                                    <th className="p-3 text-center">Jumlah Dipakai</th>
                                    <th className="p-3">Divisi Pengambil</th>
                                    <th className="p-3">Nama Pengambil</th>
                                    <th className="p-3">Catatan Pemakaian</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {supplyUsageLogs.map(log => (
                                    <tr key={log.id} className="hover:bg-slate-50/70 transition">
                                        <td className="p-3 text-slate-500 flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                            <span>{log.usage_date}</span>
                                        </td>
                                        <td className="p-3">
                                            <div className="font-bold text-[#242222]">{log.item_name}</div>
                                            <div className="text-[10px] font-mono text-[#1b68b0]">{log.item_code}</div>
                                        </td>
                                        <td className="p-3 text-center font-black text-[#1b68b0]">
                                            {log.used_qty} {log.unit}
                                        </td>
                                        <td className="p-3 font-semibold text-slate-700">{log.user_division}</td>
                                        <td className="p-3 text-slate-700">
                                            <div className="flex items-center gap-1">
                                                <User className="w-3.5 h-3.5 text-slate-400" />
                                                <span>{log.taker_name}</span>
                                            </div>
                                        </td>
                                        <td className="p-3 text-slate-500 italic">{log.notes || '-'}</td>
                                    </tr>
                                ))}
                                {supplyUsageLogs.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-slate-400 text-xs italic">
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
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                    <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-100 pb-3">
                        <div>
                            <h3 className="font-black text-[#242222] text-sm flex items-center gap-2">
                                <Send className="w-4 h-4 text-[#1b68b0]" />
                                <span>Daftar Pengajuan Restok Perlengkapan ke Admin Toko</span>
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">Monitoring pengajuan restok barang gudang yang diajukan ke Admin Toko / Purchasing.</p>
                        </div>
                        {(userRole === 'admin_gudang' || userRole === 'owner') && (
                            <button
                                onClick={() => handleOpenRequestRestockModal(null)}
                                className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" /> Ajukan Restok Baru
                            </button>
                        )}
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50/80 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200">
                                <tr>
                                    <th className="p-3">Tanggal</th>
                                    <th className="p-3">Kode & Nama Perlengkapan</th>
                                    <th className="p-3 text-center">Jumlah Restok</th>
                                    <th className="p-3">Prioritas</th>
                                    <th className="p-3">Diajukan Oleh</th>
                                    <th className="p-3">Catatan / Keperluan</th>
                                    <th className="p-3 text-center">Status</th>
                                    <th className="p-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {supplyRestockRequests.map(req => (
                                    <tr key={req.id} className="hover:bg-slate-50/70 transition">
                                        <td className="p-3 text-slate-500">{req.requested_at}</td>
                                        <td className="p-3">
                                            <div className="font-bold text-[#242222]">{req.item_name}</div>
                                            <div className="text-[10px] font-mono text-[#1b68b0]">{req.item_code} (Sisa: {req.current_stock} {req.unit})</div>
                                        </td>
                                        <td className="p-3 text-center font-black text-amber-700">
                                            +{req.request_qty} {req.unit}
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${req.priority.includes('Mendesak') ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700'}`}>
                                                {req.priority}
                                            </span>
                                        </td>
                                        <td className="p-3 text-slate-700">{req.requested_by}</td>
                                        <td className="p-3 text-slate-500 italic max-w-xs truncate">{req.notes || '-'}</td>
                                        <td className="p-3 text-center">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${req.status === 'Menunggu Persetujuan Admin Toko' ? 'bg-amber-50 text-amber-700 border border-amber-200' : req.status === 'Disetujui & Dipesan' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right">
                                            <div className="flex justify-end gap-1.5">
                                                {req.status === 'Menunggu Persetujuan Admin Toko' && (userRole === 'admin_toko' || userRole === 'owner') && (
                                                    <button
                                                        onClick={() => handleApproveRestockRequest(req.id)}
                                                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold px-2.5 py-1.5 rounded-lg text-xs transition shadow-2xs cursor-pointer flex items-center gap-1"
                                                        title="Setujui dan pesan barang dari supplier"
                                                    >
                                                        <Check className="w-3.5 h-3.5" /> Setujui
                                                    </button>
                                                )}

                                                {req.status === 'Disetujui & Dipesan' && (userRole === 'admin_gudang' || userRole === 'admin_toko' || userRole === 'owner') && (
                                                    <button
                                                        onClick={() => handleCompleteRestockRequest(req)}
                                                        className="bg-blue-50 hover:bg-blue-100 text-[#1b68b0] border border-blue-200 font-bold px-2.5 py-1.5 rounded-lg text-xs transition shadow-2xs cursor-pointer flex items-center gap-1"
                                                        title="Konfirmasi barang sudah tiba di gudang"
                                                    >
                                                        <Box className="w-3.5 h-3.5" /> Tiba
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => {
                                                        const waMsg = `Halo Admin Toko SYP Glass,%0A%0AFollow-up Pengajuan Restok Perlengkapan Gudang:%0A• Barang: [${req.item_code}] ${req.item_name}%0A• Jumlah: ${req.request_qty} ${req.unit}%0A• Status Saat Ini: ${req.status}`;
                                                        window.open(`https://api.whatsapp.com/send?text=${waMsg}`, '_blank');
                                                    }}
                                                    className="bg-white hover:bg-slate-50 text-emerald-700 border border-slate-200 px-2 py-1.5 rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer flex items-center gap-1"
                                                    title="Kirim pesan WhatsApp"
                                                >
                                                    <MessageSquare className="w-3.5 h-3.5" /> WA
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {supplyRestockRequests.length === 0 && (
                                    <tr>
                                        <td colSpan="8" className="p-8 text-center text-slate-400 text-xs italic">
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
