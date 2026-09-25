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
    // 1. Total Unit Fisik & Jenis Alat
    const totalKindsCount = toolsList.length;
    const totalAllUnits = toolsList.reduce((sum, t) => sum + (Number(t.total_qty) || 0), 0);

    // 2. Total Unit Siap Dipinjam
    const totalReadyUnits = toolsList.reduce((sum, t) => sum + Math.max(0, Number(t.available_qty) || 0), 0);

    // 3. Unit Sedang Dipinjam (dari active borrowings atau item borrows)
    const activeBorrowingsList = toolBorrowings.filter(b => b.status === 'Sedang Dipinjam');
    const activeBorrowingsCount = activeBorrowingsList.length;
    const totalBorrowedUnits = activeBorrowingsList.reduce((sum, b) => {
        if (Array.isArray(b.items) && b.items.length > 0) {
            return sum + b.items.reduce((s, it) => s + (Number(it.qty) || 1), 0);
        }
        return sum + (Number(b.qty_borrowed) || Number(b.qty) || 1);
    }, 0);

    // 4. Alat Terkonfirmasi Perlu Perbaikan atau Rusak
    const needingMaintenanceUnits = toolsList.reduce((sum, t) => {
        const dmg = Number(t.damaged_qty) || 0;
        if (dmg > 0) return sum + dmg;
        const isDamagedCond = t.condition === 'Perlu Servis' || t.condition === 'Rusak' || t.condition === 'Rusak Ringan' || t.condition === 'Rusak Berat' || t.repair_stage === 'Sedang Dalam Perbaikan' || t.repair_stage === 'Perlu Perbaikan';
        if (isDamagedCond) {
            return sum + (Number(t.total_qty) || 1);
        }
        return sum;
    }, 0);

    const needingMaintenanceKinds = toolsList.filter(t => {
        const dmg = Number(t.damaged_qty) || 0;
        if (dmg > 0) return true;
        return t.condition === 'Perlu Servis' || t.condition === 'Rusak' || t.condition === 'Rusak Ringan' || t.condition === 'Rusak Berat' || t.repair_stage === 'Sedang Dalam Perbaikan' || t.repair_stage === 'Perlu Perbaikan';
    }).length;

    const filteredTools = toolsList.filter(t =>
        (t.tool_code || '').toLowerCase().includes(toolSearchTerm.toLowerCase()) ||
        (t.name || '').toLowerCase().includes(toolSearchTerm.toLowerCase()) ||
        (t.category || '').toLowerCase().includes(toolSearchTerm.toLowerCase()) ||
        (t.location || '').toLowerCase().includes(toolSearchTerm.toLowerCase())
    );

    const repairLogTools = toolsList.filter(t => {
        const isDamaged = (Number(t.damaged_qty) || 0) > 0 || t.repair_stage === 'Sedang Dalam Perbaikan' || t.condition === 'Rusak Ringan' || t.condition === 'Rusak Berat' || t.condition === 'Perlu Servis' || t.condition === 'Rusak';
        const isLost = (Number(t.lost_qty) || 0) > 0 || t.condition === 'Hilang';
        const isCompleted = t.repair_stage === 'Selesai' || t.repair_details;
        const hasHistory = isDamaged || isLost || isCompleted || t.condition_notes;

        if (!hasHistory) return false;

        if (repairFilterTab === 'aktif') return isDamaged;
        if (repairFilterTab === 'selesai') return isCompleted;
        if (repairFilterTab === 'hilang') return isLost;
        return true; // 'semua'
    });

    return (
        <div className="space-y-5 sm:space-y-6">
            {/* HEADER TAB */}
            <div className="flex flex-wrap justify-between items-center gap-3">
                <div>
                    <h2 className="text-xl sm:text-2xl font-black text-[#242222] flex items-center gap-2.5">
                        <Wrench className="w-6 h-6 text-[#1b68b0] shrink-0" />
                        <span>Peminjaman & Inventory Alat Penunjang</span>
                    </h2>
                    <p className="text-slate-500 text-xs font-medium mt-1">
                        Kelola peminjaman alat mesin (bor kaca, slepan, mata bor, vakum, tangga, obeng) oleh teknisi serta riwayat servis kerusakan.
                    </p>
                </div>
            </div>

            {/* 4 STATS CARDS - REAL-TIME SYNCED & MOBILE 2-COLS GRID */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col justify-between">
                    <div>
                        <span className="text-[11px] sm:text-xs text-slate-500 font-semibold block">Total Unit & Jenis Alat</span>
                        <h3 className="text-xl sm:text-2xl font-black text-[#1b68b0] mt-1">{totalAllUnits} <span className="text-xs sm:text-sm font-bold text-slate-600">Unit</span></h3>
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-mono text-slate-500 font-bold mt-2">
                        {totalKindsCount} Jenis Alat
                    </span>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col justify-between">
                    <div>
                        <span className="text-[11px] sm:text-xs text-slate-500 font-semibold block">Unit Siap Dipinjam</span>
                        <h3 className="text-xl sm:text-2xl font-black text-[#70b03c] mt-1">{totalReadyUnits} <span className="text-xs sm:text-sm font-bold text-slate-600">Unit</span></h3>
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-mono text-emerald-700 font-bold mt-2 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[#70b03c]" /> Siap Digunakan
                    </span>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col justify-between">
                    <div>
                        <span className="text-[11px] sm:text-xs text-slate-500 font-semibold block">Alat Sedang Dipinjam</span>
                        <h3 className="text-xl sm:text-2xl font-black text-amber-600 mt-1">{totalBorrowedUnits} <span className="text-xs sm:text-sm font-bold text-slate-600">Unit</span></h3>
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-mono text-amber-700 font-bold mt-2">
                        {activeBorrowingsCount} Transaksi Aktif
                    </span>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col justify-between">
                    <div>
                        <span className="text-[11px] sm:text-xs text-slate-500 font-semibold block">Perlu Servis / Rusak</span>
                        <div className="flex items-center gap-2 mt-1">
                            <h3 className={`text-xl sm:text-2xl font-black ${needingMaintenanceUnits > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                                {needingMaintenanceUnits} <span className="text-xs sm:text-sm font-bold text-slate-600">Unit</span>
                            </h3>
                            {needingMaintenanceUnits > 0 && (
                                <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-200 shrink-0">
                                    Servis
                                </span>
                            )}
                        </div>
                    </div>
                    <span className={`text-[10px] sm:text-[11px] font-mono font-bold mt-2 ${needingMaintenanceKinds > 0 ? 'text-rose-700' : 'text-slate-500'}`}>
                        {needingMaintenanceKinds} Jenis Alat Terkonfirmasi
                    </span>
                </div>
            </div>

            {/* BUTTON ACTION & SUBTAB TOGGLE */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-white border border-slate-200 p-3 rounded-2xl shadow-xs">
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
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto scrollbar-none">
                    <button
                        onClick={() => setToolSubTab('katalog')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                            toolSubTab === 'katalog' 
                                ? 'bg-white text-[#1b68b0] shadow-xs border border-slate-200' 
                                : 'text-slate-600 hover:text-[#242222]'
                        }`}
                    >
                        <Wrench className="w-3.5 h-3.5 shrink-0" />
                        <span>Katalog Alat ({toolsList.length})</span>
                    </button>
                    <button
                        onClick={() => setToolSubTab('peminjaman')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                            toolSubTab === 'peminjaman' 
                                ? 'bg-white text-[#1b68b0] shadow-xs border border-slate-200' 
                                : 'text-slate-600 hover:text-[#242222]'
                        }`}
                    >
                        <ClipboardList className="w-3.5 h-3.5 shrink-0" />
                        <span>Log Peminjaman ({activeBorrowingsCount})</span>
                    </button>
                    <button
                        onClick={() => setToolSubTab('perbaikan')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                            toolSubTab === 'perbaikan' 
                                ? 'bg-white text-[#1b68b0] shadow-xs border border-slate-200' 
                                : 'text-slate-600 hover:text-[#242222]'
                        }`}
                    >
                        <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                        <span>Log Perbaikan ({repairLogTools.length})</span>
                    </button>
                </div>
            </div>

            {/* SUBTAB CONTENT 1: KATALOG ALAT */}
            <div key={toolSubTab} className="animate-subtab-content">
            {toolSubTab === 'katalog' ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2.5">
                            <h3 className="font-black text-[#242222] text-sm flex items-center gap-2">
                                <Wrench className="w-4 h-4 text-[#1b68b0]" />
                                <span>Daftar Inventory Alat Mesin & Perkakas</span>
                            </h3>
                            <span className="text-xs bg-blue-50 text-[#1b68b0] px-2.5 py-0.5 rounded-full border border-blue-200 font-mono font-bold">
                                {toolsList.length} Items
                            </span>
                        </div>

                        <div className="relative w-full sm:w-64">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari Kode / Nama / Kategori..."
                                value={toolSearchTerm}
                                onChange={e => setToolSearchTerm(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#242222] focus:border-[#1b68b0] focus:ring-1 focus:ring-[#1b68b0] focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* MOBILE CARD VIEW (TAMPIL DI LAYAR HP < MD TANPA OVERLAP & TOUCH-FRIENDLY) */}
                    <div className="block md:hidden space-y-3">
                        {filteredTools.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-xs italic bg-slate-50/50 rounded-xl border border-slate-200">
                                Belum ada data alat penunjang yang cocok dengan filter / pencarian.
                            </div>
                        ) : (
                            filteredTools.map(t => (
                                <div key={t.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
                                    <div className="flex items-start gap-3">
                                        {t.image_path ? (
                                            <div 
                                                onClick={() => handleOpenSketchLightbox && handleOpenSketchLightbox('/storage/' + t.image_path, t.name, {
                                                    type: 'tool',
                                                    subtitle: `Kode Alat: ${t.tool_code || '-'} • ${t.name}`,
                                                    badge: 'Inventaris Alat & Mesin',
                                                    description: `Foto dokumentasi fisik unit mesin/alat kerja teknisi pabrik (${t.name}). Digunakan untuk identifikasi inventaris, inspeksi kondisi fisik (${t.condition || 'Baik'}), dan pemantauan riwayat peminjaman/servis.`,
                                                    itemCode: t.tool_code,
                                                    condition: t.condition,
                                                    location: t.storage_location,
                                                })}
                                                className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 shadow-2xs shrink-0 cursor-pointer bg-white"
                                                title="Klik untuk memperbesar foto sample mesin / alat"
                                            >
                                                <img src={'/storage/' + t.image_path} alt={t.name} className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="w-14 h-14 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 text-amber-600">
                                                <Wrench className="w-6 h-6 text-amber-600" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-1">
                                                <span className="font-extrabold text-[#1b68b0] font-mono text-xs">{t.tool_code}</span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                                                    t.condition === 'Bagus' || t.condition === 'Baik' 
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                                        : t.condition === 'Hilang' 
                                                        ? 'bg-rose-50 text-rose-700 border-rose-200' 
                                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                                }`}>
                                                    {t.condition}
                                                </span>
                                            </div>
                                            <h4 className="font-extrabold text-[#242222] text-sm mt-0.5 leading-snug line-clamp-2" title={t.name}>{t.name}</h4>
                                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                                <span className="bg-blue-50 text-[#1b68b0] border border-blue-200 px-2 py-0.5 rounded text-[10px] font-semibold">
                                                    {t.category}
                                                </span>
                                                <span className="text-slate-500 text-[10px] flex items-center gap-1">
                                                    <MapPin className="w-3 h-3 text-slate-400" /> {t.location}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mobile Stock Metrics */}
                                    <div className="grid grid-cols-2 gap-2 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 text-xs">
                                        <div>
                                            <span className="text-[10px] text-slate-400 font-medium block">Total Stok</span>
                                            <span className="font-mono font-bold text-[#242222]">{t.total_qty} {t.unit}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-slate-400 font-medium block">Ketersediaan</span>
                                            <span className={`font-mono font-bold text-xs ${t.available_qty > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                                                {t.available_qty > 0 ? `${t.available_qty} ${t.unit} Siap` : 'Habis Dipinjam'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Troubled stock notification */}
                                    {((Number(t.damaged_qty) || 0) > 0 || (Number(t.lost_qty) || 0) > 0) && (
                                        <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-2.5 text-xs space-y-1">
                                            {(Number(t.damaged_qty) || 0) > 0 && (
                                                <div className="flex items-center justify-between text-amber-800 font-bold text-[11px]">
                                                    <span>⚠️ {t.condition === 'Perlu Servis' ? 'Perlu Servis' : 'Rusak'}:</span>
                                                    <span className="font-mono">{t.damaged_qty} {t.unit || 'Unit'}</span>
                                                </div>
                                            )}
                                            {(Number(t.lost_qty) || 0) > 0 && (
                                                <div className="flex items-center justify-between text-rose-700 font-bold text-[11px]">
                                                    <span>Hilang:</span>
                                                    <span className="font-mono">{t.lost_qty} {t.unit || 'Unit'}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {(userRole === 'admin_gudang' || userRole === 'owner') && (
                                        <button
                                            onClick={() => handleOpenEditToolModal(t)}
                                            className="w-full bg-white hover:bg-slate-50 text-[#1b68b0] border border-[#1b68b0]/30 font-bold py-2 px-3 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                                        >
                                            <Edit className="w-3.5 h-3.5 text-[#1b68b0]" /> Update Data & Kondisi Alat
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* DESKTOP TABLE VIEW (TAMPIL DI LAYAR DESKTOP MD+) */}
                    <div className="hidden md:block overflow-x-auto border border-slate-200 rounded-xl">
                        <table className="w-full text-left text-xs min-w-[760px]">
                            <thead className="bg-slate-50/80 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200">
                                <tr>
                                    <th className="p-3 w-16 text-center">Foto Sample</th>
                                    <th className="p-3">Kode Alat</th>
                                    <th className="p-3 max-w-[220px]">Nama Alat / Mesin</th>
                                    <th className="p-3">Kategori</th>
                                    <th className="p-3 max-w-[140px]">Lokasi Simpan</th>
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
                                                        onClick={() => handleOpenSketchLightbox && handleOpenSketchLightbox('/storage/' + t.image_path, t.name, {
                                                            type: 'tool',
                                                            subtitle: `Kode Alat: ${t.tool_code || '-'} • ${t.name}`,
                                                            badge: 'Inventaris Alat & Mesin',
                                                            description: `Foto dokumentasi fisik unit mesin/alat kerja teknisi pabrik (${t.name}). Digunakan untuk identifikasi inventaris, inspeksi kondisi fisik (${t.condition || 'Baik'}), dan pemantauan riwayat peminjaman/servis.`,
                                                            itemCode: t.tool_code,
                                                            condition: t.condition,
                                                            location: t.storage_location,
                                                        })}
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
                                            <td className="p-3 font-bold text-[#242222] max-w-[220px]">
                                                <div className="flex items-center gap-1.5" title={t.name}>
                                                    <PenTool className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span className="truncate">{t.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <span className="bg-blue-50 text-[#1b68b0] border border-blue-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                                                    {t.category}
                                                </span>
                                            </td>
                                            <td className="p-3 text-xs text-slate-500 font-medium max-w-[140px]">
                                                <div className="flex items-center gap-1" title={t.location}>
                                                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                                    <span className="truncate">{t.location}</span>
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
                                                    <span className={`inline-block text-[10px] px-2 py-0.5 rounded-md font-bold border ${
                                                        t.condition === 'Bagus' || t.condition === 'Baik' 
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                                            : t.condition === 'Hilang' 
                                                            ? 'bg-rose-50 text-rose-700 border-rose-200' 
                                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                                    }`}>
                                                        {t.condition}
                                                    </span>
                                                    {((Number(t.damaged_qty) || 0) > 0 || (Number(t.lost_qty) || 0) > 0) && (
                                                        <div className="text-[10px] font-mono space-y-0.5">
                                                            {(Number(t.damaged_qty) || 0) > 0 && (
                                                                <span className="text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 block whitespace-nowrap">
                                                                    {t.condition === 'Perlu Servis' ? 'Perlu Servis' : 'Rusak'}: {t.damaged_qty} {t.unit || 'Unit'}
                                                                </span>
                                                            )}
                                                            {(Number(t.lost_qty) || 0) > 0 && (
                                                                <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 block whitespace-nowrap">
                                                                    Hilang: {t.lost_qty} {t.unit || 'Unit'}
                                                                </span>
                                                            )}
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
                <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border-b border-slate-100 pb-3">
                        <h3 className="font-black text-[#242222] text-sm flex items-center gap-2">
                            <ClipboardList className="w-4 h-4 text-[#1b68b0]" />
                            <span>Log Peminjaman & Pengembalian Alat Oleh Teknisi</span>
                        </h3>
                        <span className="text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-200 font-bold w-fit">
                            {activeBorrowingsCount} Alat Masih Dipinjam
                        </span>
                    </div>

                    {/* MOBILE CARD VIEW LOG PEMINJAMAN */}
                    <div className="block md:hidden space-y-3">
                        {toolBorrowings.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-xs italic bg-slate-50/50 rounded-xl border border-slate-200">
                                Belum ada riwayat peminjaman alat.
                            </div>
                        ) : (
                            toolBorrowings.map(b => (
                                <div key={b.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
                                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#1b68b0] flex items-center justify-center font-black text-xs">
                                                <User className="w-4 h-4 text-[#1b68b0]" />
                                            </div>
                                            <span className="font-extrabold text-[#242222] text-xs">{b.borrower_name}</span>
                                        </div>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${b.status === 'Sedang Dipinjam' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                                            {b.status}
                                        </span>
                                    </div>

                                    {/* Items List */}
                                    <div className="space-y-1.5">
                                        {Array.isArray(b.items) && b.items.length > 0 ? (
                                            b.items.map((it, idx) => (
                                                <div key={idx} className="bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2 text-xs">
                                                    <span className="font-extrabold text-[#1b68b0] font-mono text-[11px]">{it.tool_code}</span>
                                                    <span className="font-bold text-[#242222] flex-1 truncate">{it.tool_name}</span>
                                                    <span className="font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">{it.qty} {it.unit}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200/80 text-xs">
                                                <span className="font-extrabold text-[#1b68b0] font-mono text-xs mr-2">{b.tool_code}</span>
                                                <span className="font-bold text-[#242222]">{b.tool_name}</span>
                                                <span className="font-mono font-bold text-amber-700 ml-2">({b.qty_borrowed} Unit)</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Purpose & Dates */}
                                    <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 text-xs space-y-1.5">
                                        <div className="text-slate-600 line-clamp-2 hover:line-clamp-none cursor-pointer" title={b.purpose}>
                                            <span className="text-slate-400 font-semibold mr-1">Tujuan:</span>
                                            <span>{b.purpose || '-'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-200/60">
                                            <span>Pinjam: {b.borrow_date}</span>
                                            <span className="text-[#1b68b0] font-bold">Est: {b.expected_return}</span>
                                        </div>
                                    </div>

                                    {b.status === 'Sedang Dipinjam' ? (
                                        (userRole === 'admin_gudang' || userRole === 'owner') && (
                                            <button
                                                onClick={() => handleOpenReturnModal(b)}
                                                className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold py-2 px-3 rounded-xl text-xs transition shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                                            >
                                                <Check className="w-3.5 h-3.5" /> Konfirmasi Pengembalian Alat
                                            </button>
                                        )
                                    ) : (
                                        <div className="flex items-center justify-between text-xs pt-1">
                                            <span className="text-emerald-700 font-bold font-mono">
                                                Selesai ({b.actual_return})
                                            </span>
                                            {(userRole === 'admin_gudang' || userRole === 'owner') && (
                                                <button
                                                    onClick={() => handleOpenReturnModal(b)}
                                                    className="text-[11px] text-[#1b68b0] hover:underline font-semibold cursor-pointer"
                                                >
                                                    Edit Tgl
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* DESKTOP TABLE LOG PEMINJAMAN */}
                    <div className="hidden md:block overflow-x-auto border border-slate-200 rounded-xl">
                        <table className="w-full text-left text-xs min-w-[760px]">
                            <thead className="bg-slate-50/80 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200">
                                <tr>
                                    <th className="p-3">Kode & Nama Alat</th>
                                    <th className="p-3">Teknisi Peminjam</th>
                                    <th className="p-3 max-w-[240px]">Keperluan Pekerjaan</th>
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
                                                    <div className="max-h-24 overflow-y-auto pr-1 space-y-1">
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
                                            <td className="p-3 text-xs text-slate-600 max-w-[240px]">
                                                <div 
                                                    className="line-clamp-2 hover:line-clamp-none transition-all duration-200 cursor-pointer bg-slate-50/70 hover:bg-white p-1.5 rounded-lg border border-slate-100 hover:border-[#1b68b0]/30"
                                                    title={b.purpose}
                                                >
                                                    {b.purpose}
                                                </div>
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
                <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-slate-100 pb-3">
                        <div>
                            <h3 className="font-black text-[#242222] text-sm flex items-center gap-2">
                                <RefreshCw className="w-4 h-4 text-amber-600" />
                                <span>Log Catatan Perbaikan Mesin Rusak & Laporan Hilang</span>
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">Monitoring mesin yang membutuhkan servis / sparepart serta riwayat perbaikan alat.</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-200 font-bold">
                                {needingMaintenanceUnits} Unit Rusak
                            </span>
                            <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200 font-bold">
                                {toolsList.filter(t => t.repair_stage === 'Selesai' || t.repair_details).length} Selesai
                            </span>
                            <span className="text-xs bg-rose-50 text-rose-700 px-3 py-1 rounded-full border border-rose-200 font-bold">
                                {toolsList.reduce((sum, t) => sum + (Number(t.lost_qty) || 0), 0)} Hilang
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
                            Semua Log ({toolsList.filter(t => (Number(t.damaged_qty) || 0) > 0 || (Number(t.lost_qty) || 0) > 0 || t.repair_stage === 'Selesai' || t.repair_details || t.condition_notes).length})
                        </button>
                        <button
                            onClick={() => setRepairFilterTab('aktif')}
                            className={`px-3 py-1 rounded-lg transition cursor-pointer font-bold ${repairFilterTab === 'aktif' ? 'bg-white text-amber-700 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-[#242222]'}`}
                        >
                            Aktif Perbaikan ({toolsList.filter(t => (Number(t.damaged_qty) || 0) > 0 || t.repair_stage === 'Sedang Dalam Perbaikan').length})
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
                            Tool Hilang ({toolsList.filter(t => (Number(t.lost_qty) || 0) > 0 || t.condition === 'Hilang').length})
                        </button>
                    </div>

                    {/* MOBILE CARD VIEW LOG PERBAIKAN */}
                    <div className="block md:hidden space-y-3">
                        {repairLogTools.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-xs italic bg-slate-50/50 rounded-xl border border-slate-200">
                                Belum ada data log perbaikan atau riwayat alat untuk kategori filter ini.
                            </div>
                        ) : (
                            repairLogTools.map(t => (
                                <div key={t.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
                                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                                        <div>
                                            <span className="font-extrabold text-[#1b68b0] font-mono text-xs">{t.tool_code}</span>
                                            <h4 className="font-extrabold text-[#242222] text-sm leading-snug">{t.name}</h4>
                                            <div className="text-[11px] text-slate-500 mt-0.5">{t.category} • {t.location}</div>
                                        </div>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border shrink-0 ${t.condition === 'Bagus' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : t.condition === 'Hilang' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                            {t.condition}
                                        </span>
                                    </div>

                                    {/* Breakdown stock */}
                                    <div className="flex flex-wrap gap-2 text-xs font-mono">
                                        {(Number(t.damaged_qty) || 0) > 0 && (
                                            <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 font-bold">
                                                Rusak: {t.damaged_qty} {t.unit}
                                            </span>
                                        )}
                                        {(Number(t.lost_qty) || 0) > 0 && (
                                            <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200 font-bold">
                                                Hilang: {t.lost_qty} {t.unit}
                                            </span>
                                        )}
                                    </div>

                                    {/* Repair details */}
                                    {t.repair_details ? (
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-slate-700 text-xs">
                                            <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                                                <span className="font-bold text-emerald-700 text-[11px] flex items-center gap-1">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Selesai Diservis
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
                                        <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-900 text-xs leading-relaxed" title={t.condition_notes}>
                                            <span className="font-bold block text-[11px] mb-0.5">Catatan Kerusakan:</span>
                                            <span className="line-clamp-2 hover:line-clamp-none cursor-pointer">"{t.condition_notes}"</span>
                                        </div>
                                    ) : (
                                        <span className="text-slate-400 italic text-xs block">Belum ada catatan perbaikan detail.</span>
                                    )}

                                    {/* Action Buttons for Mobile */}
                                    {(userRole === 'admin_gudang' || userRole === 'owner') && (
                                        <div className="pt-1 space-y-2">
                                            {(!t.repair_stage || t.repair_stage === 'Perlu Perbaikan') && (Number(t.damaged_qty) || 0) > 0 && (
                                                <button
                                                    onClick={() => handleStartRepair(t.id)}
                                                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-3 rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                                                >
                                                    <RefreshCw className="w-3.5 h-3.5" /> Mulai Servis Mesin
                                                </button>
                                            )}

                                            {t.repair_stage === 'Sedang Dalam Perbaikan' && (
                                                <button
                                                    onClick={() => handleOpenCompleteRepairModal(t)}
                                                    className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold py-2 px-3 rounded-xl text-xs transition shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                                                >
                                                    <Check className="w-3.5 h-3.5" /> Konfirmasi Selesai Servis
                                                </button>
                                            )}

                                            {t.repair_stage === 'Selesai' && (
                                                <button
                                                    onClick={() => handleOpenCompleteRepairModal(t)}
                                                    className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-1.5 px-3 rounded-xl text-xs transition border border-slate-200 flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                                                >
                                                    <Edit className="w-3.5 h-3.5" /> Edit Rincian Servis
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handleOpenEditToolModal(t)}
                                                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold py-1.5 px-3 rounded-xl text-xs transition border border-slate-200 flex items-center justify-center gap-1 cursor-pointer"
                                            >
                                                Edit Stok / Kondisi Alat
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* DESKTOP TABLE LOG PERBAIKAN */}
                    <div className="hidden md:block overflow-x-auto border border-slate-200 rounded-xl">
                        <table className="w-full text-left text-xs min-w-[760px]">
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
                                                <div className="font-bold text-[#242222] text-xs max-w-[180px] truncate" title={t.name}>{t.name}</div>
                                            </td>
                                            <td className="p-3 text-xs">
                                                <span className="bg-blue-50 text-[#1b68b0] border border-blue-200 px-2 py-0.5 rounded text-[11px] block w-fit mb-1 font-semibold">{t.category}</span>
                                                <span className="text-slate-500 text-[11px] max-w-[130px] truncate block" title={t.location}>{t.location}</span>
                                            </td>
                                            <td className="p-3">
                                                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${t.condition === 'Bagus' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : t.condition === 'Hilang' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                                    {t.condition}
                                                </span>
                                            </td>
                                            <td className="p-3 text-xs font-mono">
                                                {(Number(t.damaged_qty) || 0) > 0 && (
                                                    <div className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold mb-1 whitespace-nowrap">
                                                        Rusak: {t.damaged_qty} {t.unit}
                                                    </div>
                                                )}
                                                {(Number(t.lost_qty) || 0) > 0 && (
                                                    <div className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-bold whitespace-nowrap">
                                                        Hilang: {t.lost_qty} {t.unit}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-3 max-w-sm text-xs space-y-1.5">
                                                {t.repair_details ? (
                                                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1 text-slate-700">
                                                        <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                                                            <span className="font-bold text-emerald-700 text-[11px] flex items-center gap-1">
                                                                <CheckCircle2 className="w-3.5 h-3.5" /> Log Selesai Servis
                                                            </span>
                                                            <span className="font-mono text-[10px] text-slate-400">{t.repair_details.completion_date}</span>
                                                        </div>
                                                        {t.repair_details.damaged_part && (
                                                            <div className="text-[11px] line-clamp-2 hover:line-clamp-none cursor-pointer" title={t.repair_details.damaged_part}>
                                                                <b>Bagian Rusak:</b> {t.repair_details.damaged_part}
                                                            </div>
                                                        )}
                                                        {t.repair_details.action_taken && (
                                                            <div className="text-[11px] line-clamp-2 hover:line-clamp-none cursor-pointer" title={t.repair_details.action_taken}>
                                                                <b>Tindakan:</b> {t.repair_details.action_taken}
                                                            </div>
                                                        )}
                                                        {t.repair_details.replaced_components && (
                                                            <div className="text-[11px] line-clamp-2 hover:line-clamp-none cursor-pointer" title={t.repair_details.replaced_components}>
                                                                <b>Komponen:</b> {t.repair_details.replaced_components}
                                                            </div>
                                                        )}
                                                        {(t.repair_details.repair_cost || t.repair_details.technician_name) && (
                                                            <div className="flex justify-between text-[10px] pt-1 text-slate-500 font-mono border-t border-slate-200">
                                                                <span>Teknisi: {t.repair_details.technician_name || 'Servis Toko'}</span>
                                                                {t.repair_details.repair_cost && <span className="text-amber-700 font-bold">Biaya: Rp {parseInt(t.repair_details.repair_cost).toLocaleString('id-ID')}</span>}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : t.condition_notes ? (
                                                    <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-900 text-xs leading-relaxed" title={t.condition_notes}>
                                                        <span className="line-clamp-2 hover:line-clamp-none cursor-pointer">"{t.condition_notes}"</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 italic text-xs">Belum ada catatan detail.</span>
                                                )}
                                            </td>
                                            <td className="p-3 text-right space-y-1.5">
                                                {(userRole === 'admin_gudang' || userRole === 'owner') && (
                                                    <>
                                                        {/* TAHAP 1: PERLU PERBAIKAN */}
                                                        {(!t.repair_stage || t.repair_stage === 'Perlu Perbaikan') && (Number(t.damaged_qty) || 0) > 0 && (
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
