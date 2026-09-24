import React from 'react';
import { 
    Wrench, User, Calendar, MapPin, CheckCircle2, 
    Clock, AlertTriangle, Search, Plus, ClipboardList, 
    Check, Edit, RefreshCw, XCircle, ShieldAlert, 
    Layers, ArrowRightLeft, PenTool, Info
} from 'lucide-react';

export default function ToolsTab({
    userRole,
    userName,
    toolsList = [],
    toolBorrowings = [],
    toolSubTab = 'katalog',
    setToolSubTab,
    toolSearchTerm = '',
    setToolSearchTerm,
    repairFilterTab = 'semua',
    setRepairFilterTab,
    setShowAddToolModal,
    setShowBorrowToolModal,
    setBorrowToolForm,
    handleOpenEditToolModal,
    handleOpenReturnModal,
    handleStartRepair,
    handleOpenCompleteRepairModal,
    handleOpenSketchLightbox,
}) {
    const totalReadyUnits = toolsList.reduce((sum, t) => sum + (t.available_qty || 0), 0);
    const activeBorrowingsCount = toolBorrowings.filter(b => b.status === 'Sedang Dipinjam').length;
    const needingMaintenanceCount = toolsList.filter(t => t.condition !== 'Bagus').length;

    const filteredTools = toolsList.filter(t =>
        (t.tool_code || '').toLowerCase().includes(toolSearchTerm.toLowerCase()) ||
        (t.name || '').toLowerCase().includes(toolSearchTerm.toLowerCase()) ||
        (t.category || '').toLowerCase().includes(toolSearchTerm.toLowerCase())
    );

    const repairLogTools = toolsList.filter(t => {
        const isDamaged = (t.damaged_qty || 0) > 0 || t.repair_stage === 'Sedang Dalam Perbaikan' || t.condition === 'Rusak Ringan' || t.condition === 'Rusak Berat';
        const isLost = (t.lost_qty || 0) > 0 || t.condition === 'Hilang';
        const isCompleted = t.repair_stage === 'Selesai' || t.repair_details;
        const hasHistory = isDamaged || isLost || isCompleted || t.condition_notes;

        if (!hasHistory) return false;

        if (repairFilterTab === 'aktif') return isDamaged;
        if (repairFilterTab === 'selesai') return isCompleted;
        if (repairFilterTab === 'hilang') return isLost;
        return true; // 'semua'
    });

    return (
        <div className="space-y-6">
            {/* HEADER TAB */}
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-[#242222] flex items-center gap-2.5">
                        <Wrench className="w-6 h-6 text-[#1b68b0]" />
                        <span>Peminjaman & Inventory Alat Penunjang</span>
                    </h2>
                    <p className="text-slate-500 text-xs font-medium mt-1">
                        Kelola peminjaman alat mesin (bor kaca, slepan, mata bor, vakum, tangga, obeng) oleh teknisi serta riwayat servis kerusakan.
                    </p>
                </div>
            </div>

            {/* 4 STATS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                    <span className="text-xs text-slate-500 font-semibold block">Total Jenis Alat Penunjang</span>
                    <h3 className="text-2xl font-black text-[#1b68b0] mt-1">{toolsList.length} Jenis</h3>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                    <span className="text-xs text-slate-500 font-semibold block">Total Unit Siap Dipinjam</span>
                    <h3 className="text-2xl font-black text-[#70b03c] mt-1">{totalReadyUnits} Unit</h3>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                    <span className="text-xs text-slate-500 font-semibold block">Alat Sedang Dipinjam</span>
                    <h3 className="text-2xl font-black text-amber-600 mt-1">{activeBorrowingsCount} Pinjaman</h3>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                    <span className="text-xs text-slate-500 font-semibold block">Kondisi Perlu Maintenance</span>
                    <div className="flex items-center gap-2 mt-1">
                        <h3 className={`text-2xl font-black ${needingMaintenanceCount > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                            {needingMaintenanceCount} Alat
                        </h3>
                        {needingMaintenanceCount > 0 && (
                            <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-200">
                                Servis
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* BUTTON ACTION & SUBTAB TOGGLE */}
            <div className="flex flex-wrap justify-between items-center gap-4 bg-white border border-slate-200 p-3 rounded-2xl shadow-xs">
                {(userRole === 'admin_gudang' || userRole === 'owner' || userRole === 'driver') && (
                    <div className="flex flex-wrap items-center gap-2">
                        {(userRole === 'admin_gudang' || userRole === 'owner') && (
                            <button
                                onClick={() => setShowAddToolModal(true)}
                                className="bg-[#1b68b0] hover:bg-[#15528c] text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Tambah Alat Baru</span>
                            </button>
                        )}
                        <button
                            onClick={() => {
                                if (toolsList.length === 0) {
                                    alert('Belum ada alat di katalog! Silakan tambah alat baru terlebih dahulu.');
                                    return;
                                }
                                if (userRole === 'driver' && setBorrowToolForm) {
                                    setBorrowToolForm(prev => ({
                                        ...prev,
                                        borrower_name: userName,
                                        purpose: 'Operasional Pengiriman Armada Supir (' + userName + ')'
                                    }));
                                }
                                setShowBorrowToolModal(true);
                            }}
                            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                        >
                            <ClipboardList className="w-3.5 h-3.5 text-[#1b68b0]" />
                            <span>{userRole === 'driver' ? 'Pinjam Alat Supir' : 'Catat Peminjaman Alat'}</span>
                        </button>
                    </div>
                )}
                {userRole === 'admin_toko' && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                        <Info className="w-4 h-4 text-[#1b68b0] shrink-0" />
                        <span>Akses Lihat-Saja (Pencatatan & peminjaman alat khusus dikelola oleh Admin Gudang)</span>
                    </div>
                )}

                {/* SUB TAB PILLS */}
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                        onClick={() => setToolSubTab('katalog')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            toolSubTab === 'katalog' 
                                ? 'bg-white text-[#1b68b0] shadow-xs border border-slate-200' 
                                : 'text-slate-600 hover:text-[#242222]'
                        }`}
                    >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Katalog Alat ({toolsList.length})</span>
                    </button>
                    <button
                        onClick={() => setToolSubTab('peminjaman')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            toolSubTab === 'peminjaman' 
                                ? 'bg-white text-[#1b68b0] shadow-xs border border-slate-200' 
                                : 'text-slate-600 hover:text-[#242222]'
                        }`}
                    >
                        <ClipboardList className="w-3.5 h-3.5" />
                        <span>Log Peminjaman ({activeBorrowingsCount})</span>
                    </button>
                    <button
                        onClick={() => setToolSubTab('perbaikan')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            toolSubTab === 'perbaikan' 
                                ? 'bg-white text-[#1b68b0] shadow-xs border border-slate-200' 
                                : 'text-slate-600 hover:text-[#242222]'
                        }`}
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Log Perbaikan ({toolsList.filter(t => (t.damaged_qty || 0) > 0 || (t.lost_qty || 0) > 0 || t.condition !== 'Bagus').length})</span>
                    </button>
                </div>
            </div>

            {/* SUBTAB CONTENT 1: KATALOG ALAT */}
            <div key={toolSubTab} className="animate-subtab-content">
            {toolSubTab === 'katalog' ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                    <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                            <h3 className="font-black text-[#242222] text-sm flex items-center gap-2">
                                <Wrench className="w-4 h-4 text-[#1b68b0]" />
                                <span>Daftar Inventory Alat Mesin & Perkakas Teknisi</span>
                            </h3>
                            <span className="text-xs bg-blue-50 text-[#1b68b0] px-2.5 py-0.5 rounded-full border border-blue-200 font-mono font-bold">
                                {toolsList.length} Items
                            </span>
                        </div>

                        <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari Kode / Nama / Kategori..."
                                value={toolSearchTerm}
                                onChange={e => setToolSearchTerm(e.target.value)}
                                className="bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#242222] focus:border-[#1b68b0] focus:ring-1 focus:ring-[#1b68b0] focus:outline-none w-64"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50/80 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200">
                                <tr>
                                    <th className="p-3 w-16 text-center">Foto Sample</th>
                                    <th className="p-3">Kode Alat</th>
                                    <th className="p-3">Nama Alat / Mesin</th>
                                    <th className="p-3">Kategori</th>
                                    <th className="p-3">Lokasi Simpan</th>
                                    <th className="p-3 text-center">Total Qty</th>
                                    <th className="p-3 text-center">Availability</th>
                                    <th className="p-3">Kondisi</th>
                                    <th className="p-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredTools.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="p-8 text-center text-slate-400 text-xs italic">
                                            Belum ada data alat penunjang yang cocok dengan filter / pencarian.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTools.map(t => (
                                        <tr key={t.id} className="hover:bg-slate-50/70 transition">
                                            <td className="p-2 text-center">
                                                {t.image_path ? (
                                                    <div 
                                                        onClick={() => handleOpenSketchLightbox && handleOpenSketchLightbox('/storage/' + t.image_path, 'Sample ' + t.name)}
                                                        className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 shadow-2xs mx-auto cursor-pointer group relative bg-white"
                                                        title="Klik untuk memperbesar foto sample mesin / alat"
                                                    >
                                                        <img src={'/storage/' + t.image_path} alt={t.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-200" />
                                                    </div>
                                                ) : (
                                                    <div className="w-10 h-10 rounded-xl bg-amber-50/80 border border-amber-100 flex items-center justify-center mx-auto text-amber-600 shadow-2xs">
                                                        <Wrench className="w-5 h-5 text-amber-600" />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-3 font-extrabold text-[#1b68b0] font-mono text-xs">{t.tool_code}</td>
                                            <td className="p-3 font-bold text-[#242222]">
                                                <div className="flex items-center gap-1.5">
                                                    <PenTool className="w-3.5 h-3.5 text-slate-400" />
                                                    <span>{t.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <span className="bg-blue-50 text-[#1b68b0] border border-blue-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                                                    {t.category}
                                                </span>
                                            </td>
                                            <td className="p-3 text-xs text-slate-500 font-medium">
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3 text-slate-400" />
                                                    <span>{t.location}</span>
                                                </div>
                                            </td>
                                            <td className="p-3 text-center font-mono font-bold text-[#242222]">{t.total_qty} {t.unit}</td>
                                            <td className="p-3 text-center">
                                                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${t.available_qty > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                                                    {t.available_qty > 0 ? `Tersedia (${t.available_qty} ${t.unit})` : 'Habis Dipinjam'}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <div className="space-y-1">
                                                    <span className={`inline-block text-[10px] px-2 py-0.5 rounded-md font-bold border ${t.condition === 'Bagus' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : t.condition === 'Hilang' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                                        {t.condition}
                                                    </span>
                                                    {((t.damaged_qty || 0) > 0 || (t.lost_qty || 0) > 0) && (
                                                        <div className="text-[10px] font-mono space-y-0.5">
                                                            {(t.damaged_qty || 0) > 0 && <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 block">Rusak: {t.damaged_qty} {t.unit}</span>}
                                                            {(t.lost_qty || 0) > 0 && <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 block">Hilang: {t.lost_qty} {t.unit}</span>}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-3 text-right">
                                                {(userRole === 'admin_gudang' || userRole === 'owner') && (
                                                    <button
                                                        onClick={() => handleOpenEditToolModal(t)}
                                                        className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold px-2.5 py-1.5 rounded-lg text-xs transition flex items-center gap-1 shadow-2xs ml-auto cursor-pointer"
                                                    >
                                                        <Edit className="w-3.5 h-3.5 text-[#1b68b0]" /> Update
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : toolSubTab === 'peminjaman' ? (
                /* SUBTAB CONTENT 2: LOG PEMINJAMAN ALAT */
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <h3 className="font-black text-[#242222] text-sm flex items-center gap-2">
                            <ClipboardList className="w-4 h-4 text-[#1b68b0]" />
                            <span>Log Peminjaman & Pengembalian Alat Oleh Teknisi</span>
                        </h3>
                        <span className="text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-200 font-bold">
                            {activeBorrowingsCount} Alat Masih Dipinjam
                        </span>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50/80 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200">
                                <tr>
                                    <th className="p-3">Kode & Nama Alat</th>
                                    <th className="p-3">Teknisi Peminjam</th>
                                    <th className="p-3">Keperluan Pekerjaan</th>
                                    <th className="p-3 text-center">Qty</th>
                                    <th className="p-3">Tanggal Pinjam</th>
                                    <th className="p-3">Estimasi Kembali</th>
                                    <th className="p-3 text-center">Status</th>
                                    <th className="p-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {toolBorrowings.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="p-8 text-center text-slate-400 text-xs italic">
                                            Belum ada riwayat peminjaman alat.
                                        </td>
                                    </tr>
                                ) : (
                                    toolBorrowings.map(b => (
                                        <tr key={b.id} className="hover:bg-slate-50/70 transition">
                                            <td className="p-3 max-w-sm">
                                                {Array.isArray(b.items) && b.items.length > 0 ? (
                                                    <div className="space-y-1">
                                                        {b.items.map((it, idx) => (
                                                            <div key={idx} className="bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 flex items-center justify-between gap-2 text-xs">
                                                                <span className="font-extrabold text-[#1b68b0] font-mono text-[11px]">{it.tool_code}</span>
                                                                <span className="font-bold text-[#242222] flex-1 truncate">{it.tool_name}</span>
                                                                <span className="font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">{it.qty} {it.unit}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <div className="font-extrabold text-[#1b68b0] font-mono text-xs">{b.tool_code}</div>
                                                        <div className="font-bold text-[#242222] text-xs">{b.tool_name}</div>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-3 font-bold text-slate-800">
                                                <div className="flex items-center gap-1.5">
                                                    <User className="w-3.5 h-3.5 text-slate-400" />
                                                    <span>{b.borrower_name}</span>
                                                </div>
                                            </td>
                                            <td className="p-3 text-xs text-slate-500 max-w-xs">
                                                {b.purpose}
                                            </td>
                                            <td className="p-3 text-center font-mono font-bold text-amber-700">{b.qty_borrowed} Unit</td>
                                            <td className="p-3 text-xs text-slate-500 font-mono">{b.borrow_date}</td>
                                            <td className="p-3 text-xs font-mono text-[#1b68b0] font-bold">{b.expected_return}</td>
                                            <td className="p-3 text-center">
                                                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${b.status === 'Sedang Dipinjam' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                                                    {b.status}
                                                </span>
                                            </td>
                                            <td className="p-3 text-right">
                                                {b.status === 'Sedang Dipinjam' ? (
                                                    (userRole === 'admin_gudang' || userRole === 'owner') && (
                                                        <button
                                                            onClick={() => handleOpenReturnModal(b)}
                                                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold px-2.5 py-1.5 rounded-lg text-xs transition shadow-2xs ml-auto flex items-center gap-1 cursor-pointer"
                                                        >
                                                            <Check className="w-3.5 h-3.5" /> Kembalikan
                                                        </button>
                                                    )
                                                ) : (
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className="text-xs text-emerald-700 font-bold font-mono">
                                                            Selesai ({b.actual_return})
                                                        </span>
                                                        {(userRole === 'admin_gudang' || userRole === 'owner') && (
                                                            <button
                                                                onClick={() => handleOpenReturnModal(b)}
                                                                className="text-[10px] text-[#1b68b0] hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                                                            >
                                                                Edit Tgl
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* SUBTAB CONTENT 3: LOG PERBAIKAN & ALAT RUSAK / HILANG */
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                    <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-100 pb-3">
                        <div>
                            <h3 className="font-black text-[#242222] text-sm flex items-center gap-2">
                                <RefreshCw className="w-4 h-4 text-amber-600" />
                                <span>Log Catatan Perbaikan Mesin Rusak & Laporan Hilang</span>
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">Monitoring mesin yang membutuhkan servis / sparepart serta riwayat perbaikan alat.</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-200 font-bold">
                                {toolsList.reduce((sum, t) => sum + (t.damaged_qty || 0), 0)} Unit Rusak
                            </span>
                            <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200 font-bold">
                                {toolsList.filter(t => t.repair_stage === 'Selesai' || t.repair_details).length} Selesai
                            </span>
                            <span className="text-xs bg-rose-50 text-rose-700 px-3 py-1 rounded-full border border-rose-200 font-bold">
                                {toolsList.reduce((sum, t) => sum + (t.lost_qty || 0), 0)} Hilang
                            </span>
                        </div>
                    </div>

                    {/* REPAIR SUB-FILTER BUTTONS */}
                    <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                        <span className="text-slate-500 font-bold px-2">Filter Log:</span>
                        <button
                            onClick={() => setRepairFilterTab('semua')}
                            className={`px-3 py-1 rounded-lg transition cursor-pointer font-bold ${repairFilterTab === 'semua' ? 'bg-white text-[#1b68b0] shadow-xs border border-slate-200' : 'text-slate-600 hover:text-[#242222]'}`}
                        >
                            Semua Log ({toolsList.filter(t => (t.damaged_qty || 0) > 0 || (t.lost_qty || 0) > 0 || t.repair_stage === 'Selesai' || t.repair_details || t.condition_notes).length})
                        </button>
                        <button
                            onClick={() => setRepairFilterTab('aktif')}
                            className={`px-3 py-1 rounded-lg transition cursor-pointer font-bold ${repairFilterTab === 'aktif' ? 'bg-white text-amber-700 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-[#242222]'}`}
                        >
                            Aktif Perbaikan ({toolsList.filter(t => (t.damaged_qty || 0) > 0 || t.repair_stage === 'Sedang Dalam Perbaikan').length})
                        </button>
                        <button
                            onClick={() => setRepairFilterTab('selesai')}
                            className={`px-3 py-1 rounded-lg transition cursor-pointer font-bold ${repairFilterTab === 'selesai' ? 'bg-white text-emerald-700 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-[#242222]'}`}
                        >
                            Riwayat Selesai ({toolsList.filter(t => t.repair_stage === 'Selesai' || t.repair_details).length})
                        </button>
                        <button
                            onClick={() => setRepairFilterTab('hilang')}
                            className={`px-3 py-1 rounded-lg transition cursor-pointer font-bold ${repairFilterTab === 'hilang' ? 'bg-white text-rose-700 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-[#242222]'}`}
                        >
                            Tool Hilang ({toolsList.filter(t => (t.lost_qty || 0) > 0 || t.condition === 'Hilang').length})
                        </button>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50/80 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200">
                                <tr>
                                    <th className="p-3">Kode & Nama Alat</th>
                                    <th className="p-3">Kategori & Lokasi</th>
                                    <th className="p-3">Kondisi</th>
                                    <th className="p-3">Rincian Stok</th>
                                    <th className="p-3 max-w-sm">Catatan Kerusakan & Kronologi</th>
                                    <th className="p-3 text-right">Aksi Servis</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {repairLogTools.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-slate-400 text-xs italic">
                                            Belum ada data log perbaikan atau riwayat alat untuk kategori filter ini.
                                        </td>
                                    </tr>
                                ) : (
                                    repairLogTools.map(t => (
                                        <tr key={t.id} className="hover:bg-slate-50/70 transition">
                                            <td className="p-3">
                                                <div className="font-extrabold text-[#1b68b0] font-mono text-xs">{t.tool_code}</div>
                                                <div className="font-bold text-[#242222] text-xs">{t.name}</div>
                                            </td>
                                            <td className="p-3 text-xs">
                                                <span className="bg-blue-50 text-[#1b68b0] border border-blue-200 px-2 py-0.5 rounded text-[11px] block w-fit mb-1 font-semibold">{t.category}</span>
                                                <span className="text-slate-500 text-[11px]">{t.location}</span>
                                            </td>
                                            <td className="p-3">
                                                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${t.condition === 'Bagus' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : t.condition === 'Hilang' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                                    {t.condition}
                                                </span>
                                            </td>
                                            <td className="p-3 text-xs font-mono">
                                                {(t.damaged_qty || 0) > 0 && (
                                                    <div className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold mb-1">
                                                        Rusak: {t.damaged_qty} {t.unit}
                                                    </div>
                                                )}
                                                {(t.lost_qty || 0) > 0 && (
                                                    <div className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-bold">
                                                        Hilang: {t.lost_qty} {t.unit}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-3 max-w-sm text-xs space-y-1.5">
                                                {t.repair_details ? (
                                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-slate-700">
                                                        <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                                                            <span className="font-bold text-emerald-700 text-[11px] flex items-center gap-1">
                                                                <CheckCircle2 className="w-3.5 h-3.5" /> Log Perbaikan Selesai
                                                            </span>
                                                            <span className="font-mono text-[10px] text-slate-400">{t.repair_details.completion_date}</span>
                                                        </div>
                                                        {t.repair_details.damaged_part && (
                                                            <div className="text-[11px]"><b>Bagian Rusak:</b> {t.repair_details.damaged_part}</div>
                                                        )}
                                                        {t.repair_details.action_taken && (
                                                            <div className="text-[11px]"><b>Tindakan:</b> {t.repair_details.action_taken}</div>
                                                        )}
                                                        {t.repair_details.replaced_components && (
                                                            <div className="text-[11px]"><b>Komponen Diganti:</b> {t.repair_details.replaced_components}</div>
                                                        )}
                                                        {(t.repair_details.repair_cost || t.repair_details.technician_name) && (
                                                            <div className="flex justify-between text-[10px] pt-1 text-slate-500 font-mono border-t border-slate-200">
                                                                <span>Teknisi: {t.repair_details.technician_name || 'Servis Toko'}</span>
                                                                {t.repair_details.repair_cost && <span className="text-amber-700 font-bold">Biaya: Rp {parseInt(t.repair_details.repair_cost).toLocaleString('id-ID')}</span>}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : t.condition_notes ? (
                                                    <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-900 text-xs leading-relaxed">
                                                        <span>"{t.condition_notes}"</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 italic text-xs">Belum ada catatan detail.</span>
                                                )}
                                            </td>
                                            <td className="p-3 text-right space-y-1.5">
                                                {(userRole === 'admin_gudang' || userRole === 'owner') && (
                                                    <>
                                                        {/* TAHAP 1: PERLU PERBAIKAN */}
                                                        {(!t.repair_stage || t.repair_stage === 'Perlu Perbaikan') && (t.damaged_qty || 0) > 0 && (
                                                            <button
                                                                onClick={() => handleStartRepair(t.id)}
                                                                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                                                            >
                                                                <RefreshCw className="w-3.5 h-3.5" /> Mulai Servis
                                                            </button>
                                                        )}

                                                        {/* TAHAP 2: SEDANG DALAM PERBAIKAN */}
                                                        {t.repair_stage === 'Sedang Dalam Perbaikan' && (
                                                            <div className="space-y-1.5">
                                                                <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-md block text-center">
                                                                    Sedang Servis
                                                                </span>
                                                                <button
                                                                    onClick={() => handleOpenCompleteRepairModal(t)}
                                                                    className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold px-3 py-1.5 rounded-lg text-xs transition shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                                                                >
                                                                    <Check className="w-3.5 h-3.5" /> Selesai Servis
                                                                </button>
                                                            </div>
                                                        )}

                                                        {/* TAHAP 3: PERBAIKAN SELESAI */}
                                                        {t.repair_stage === 'Selesai' && (
                                                            <div className="space-y-1.5">
                                                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md block text-center">
                                                                    Selesai
                                                                </span>
                                                                <button
                                                                    onClick={() => handleOpenCompleteRepairModal(t)}
                                                                    className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold px-3 py-1 rounded-lg text-xs transition border border-slate-200 flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                                                                >
                                                                    <Edit className="w-3.5 h-3.5" /> Edit Servis
                                                                </button>
                                                            </div>
                                                        )}

                                                        <button
                                                            onClick={() => handleOpenEditToolModal(t)}
                                                            className="w-full bg-white hover:bg-slate-50 text-slate-600 font-semibold px-2.5 py-1 rounded-lg text-[11px] transition border border-slate-200 flex items-center justify-center gap-1 cursor-pointer"
                                                        >
                                                            Edit Stok / Kondisi
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}
