import React from 'react';

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
    setNewBorrowForm,
    handleOpenEditToolModal,
    handleOpenReturnModal,
    handleStartRepair,
    handleOpenCompleteRepairModal,
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
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-2xl font-extrabold text-slate-100">🛠️ Peminjaman & Inventory Alat Penunjang</h2>
                <p className="text-slate-400 text-sm">Kelola peminjaman alat mesin (bor kaca, slepan, mata bor, vakum, tangga, obeng, mesin rumput, cangkul, dll.) oleh teknisi</p>
            </div>

            {/* 4 STATS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                    <span className="text-xs text-slate-400 block">Total Jenis Alat Penunjang</span>
                    <h3 className="text-2xl font-black text-cyan-400 mt-1">{toolsList.length} Jenis</h3>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                    <span className="text-xs text-slate-400 block">Total Unit Siap Dipinjam</span>
                    <h3 className="text-2xl font-black text-emerald-400 mt-1">{totalReadyUnits} Unit</h3>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                    <span className="text-xs text-slate-400 block">Alat Sedang Dipinjam</span>
                    <h3 className="text-2xl font-black text-amber-400 mt-1">{activeBorrowingsCount} Peminjaman</h3>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                    <span className="text-xs text-slate-400 block">Kondisi Perlu Maintenance</span>
                    <h3 className="text-2xl font-black text-rose-400 mt-1">{needingMaintenanceCount} Alat</h3>
                </div>
            </div>

            {/* BUTTON ACTION & SUBTAB TOGGLE DIRECTLY BELOW CARDS */}
            <div className="flex flex-wrap justify-between items-center gap-4">
                {(userRole === 'admin_toko' || userRole === 'admin_gudang' || userRole === 'owner' || userRole === 'driver') && (
                    <div className="flex flex-wrap items-center gap-3">
                        {(userRole === 'admin_toko' || userRole === 'admin_gudang' || userRole === 'owner') && (
                            <button
                                onClick={() => setShowAddToolModal(true)}
                                className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black px-5 py-2.5 rounded-xl shadow-xl shadow-emerald-500/20 text-sm flex items-center gap-2 transition transform hover:scale-105 border border-cyan-300/50 cursor-pointer"
                            >
                                <span className="text-base">✨</span> + Tambah Alat Penunjang Baru
                            </button>
                        )}
                        <button
                            onClick={() => {
                                if (toolsList.length === 0) {
                                    alert('Belum ada alat di katalog! Silakan tambah alat baru terlebih dahulu.');
                                    return;
                                }
                                if (userRole === 'driver' && setNewBorrowForm) {
                                    setNewBorrowForm(prev => ({
                                        ...prev,
                                        borrower_name: userName,
                                        purpose: 'Operasional Pengiriman Armada Supir (' + userName + ')'
                                    }));
                                }
                                setShowBorrowToolModal(true);
                            }}
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black px-5 py-2.5 rounded-xl shadow-xl shadow-cyan-500/20 text-sm flex items-center gap-2 transition transform hover:scale-105 border border-blue-300/50 cursor-pointer"
                        >
                            <span className="text-base">📋</span> {userRole === 'driver' ? '🛠️ + Pinjam Alat Penunjang Supir' : '📋 + Catat Peminjaman Alat'}
                        </button>
                    </div>
                )}

                {/* SUB TAB TOGGLE (Katalog Alat vs Log Peminjaman vs Log Perbaikan) */}
                <div className="flex flex-wrap items-center bg-slate-900 border border-slate-800 p-1.5 rounded-xl shadow-lg gap-1">
                    <button
                        onClick={() => setToolSubTab('katalog')}
                        className={`px-4 py-2 rounded-lg text-xs font-extrabold transition cursor-pointer ${toolSubTab === 'katalog' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
                    >
                        📦 Katalog & Inventory Alat ({toolsList.length})
                    </button>
                    <button
                        onClick={() => setToolSubTab('peminjaman')}
                        className={`px-4 py-2 rounded-lg text-xs font-extrabold transition cursor-pointer ${toolSubTab === 'peminjaman' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
                    >
                        📋 Log Peminjaman Alat ({activeBorrowingsCount} Aktif)
                    </button>
                    <button
                        onClick={() => setToolSubTab('perbaikan')}
                        className={`px-4 py-2 rounded-lg text-xs font-extrabold transition cursor-pointer ${toolSubTab === 'perbaikan' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
                    >
                        🔧 Log Perbaikan & Mesin Rusak ({toolsList.filter(t => (t.damaged_qty || 0) > 0 || (t.lost_qty || 0) > 0 || t.condition !== 'Bagus').length})
                    </button>
                </div>
            </div>

            {/* SUBTAB CONTENT 1: KATALOG ALAT */}
            {toolSubTab === 'katalog' ? (
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
                    <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-3">
                            <h3 className="font-bold text-slate-100 text-base">
                                📋 Daftar Inventory Alat Mesin & Perkakas Teknisi
                            </h3>
                            <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2.5 py-1 rounded-full border border-cyan-500/20 font-mono font-bold">
                                {toolsList.length} Item Alat
                            </span>
                        </div>

                        <input
                            type="text"
                            placeholder="🔍 Cari Kode / Nama Alat / Kategori..."
                            value={toolSearchTerm}
                            onChange={e => setToolSearchTerm(e.target.value)}
                            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-800/40 text-slate-400 uppercase text-xs">
                                <tr>
                                    <th className="p-3">Kode Alat</th>
                                    <th className="p-3">Nama Alat / Mesin</th>
                                    <th className="p-3">Kategori</th>
                                    <th className="p-3">Lokasi Penyimpanan</th>
                                    <th className="p-3">Total Qty</th>
                                    <th className="p-3">Status Availability</th>
                                    <th className="p-3">Kondisi Alat</th>
                                    <th className="p-3">Aksi Admin & Kondisi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {filteredTools.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="p-6 text-center text-slate-500 text-xs italic">
                                            Belum ada data alat penunjang yang cocok dengan filter / pencarian.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTools.map(t => (
                                        <tr key={t.id} className="hover:bg-slate-800/30 transition">
                                            <td className="p-3 font-extrabold text-cyan-400 font-mono text-sm">{t.tool_code}</td>
                                            <td className="p-3 font-bold text-slate-100">
                                                <div className="flex items-center gap-2">
                                                    <span>🛠️</span>
                                                    <span>{t.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <span className="bg-slate-800 text-cyan-300 border border-slate-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                                                    {t.category}
                                                </span>
                                            </td>
                                            <td className="p-3 text-xs text-slate-300 font-mono">📍 {t.location}</td>
                                            <td className="p-3 font-mono font-bold text-slate-200">{t.total_qty} {t.unit}</td>
                                            <td className="p-3">
                                                <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${t.available_qty > 0 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'}`}>
                                                    {t.available_qty > 0 ? `Tersedia (${t.available_qty} ${t.unit})` : 'Habis Dipinjam'}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <div className="space-y-1">
                                                    <span className={`inline-block text-xs px-2 py-0.5 rounded font-bold border ${t.condition === 'Bagus' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : t.condition === 'Hilang' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                                        {t.condition}
                                                    </span>
                                                    {((t.damaged_qty || 0) > 0 || (t.lost_qty || 0) > 0) && (
                                                        <div className="text-[10px] font-mono space-y-0.5">
                                                            {(t.damaged_qty || 0) > 0 && <span className="text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded block border border-amber-500/20">⚠️ Rusak: {t.damaged_qty} {t.unit}</span>}
                                                            {(t.lost_qty || 0) > 0 && <span className="text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded block border border-rose-500/20">❌ Hilang: {t.lost_qty} {t.unit}</span>}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                {(userRole === 'admin_toko' || userRole === 'admin_gudang' || userRole === 'owner') && (
                                                    <button
                                                        onClick={() => handleOpenEditToolModal(t)}
                                                        className="bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 font-bold px-3 py-1.5 rounded-lg text-xs transition border border-slate-700 flex items-center gap-1 shadow-sm cursor-pointer"
                                                    >
                                                        ⚙️ Update Kondisi / Stok
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
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                        <h3 className="font-bold text-slate-100 text-base">
                            📋 Log Peminjaman & Pengembalian Alat Oleh Teknisi
                        </h3>
                        <span className="text-xs bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full border border-amber-500/30 font-bold">
                            {activeBorrowingsCount} Alat Masih Dipinjam
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-800/40 text-slate-400 uppercase text-xs">
                                <tr>
                                    <th className="p-3">Kode & Nama Alat</th>
                                    <th className="p-3">Teknisi Peminjam</th>
                                    <th className="p-3">Keperluan Pekerjaan</th>
                                    <th className="p-3">Qty Dipinjam</th>
                                    <th className="p-3">Tanggal Pinjam</th>
                                    <th className="p-3">Estimasi Kembali</th>
                                    <th className="p-3">Status Peminjaman</th>
                                    <th className="p-3">Aksi Admin</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {toolBorrowings.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="p-6 text-center text-slate-500 text-xs italic">
                                            Belum ada riwayat peminjaman alat.
                                        </td>
                                    </tr>
                                ) : (
                                    toolBorrowings.map(b => (
                                        <tr key={b.id} className="hover:bg-slate-800/30 transition">
                                            <td className="p-3 max-w-sm">
                                                {Array.isArray(b.items) && b.items.length > 0 ? (
                                                    <div className="space-y-1">
                                                        {b.items.map((it, idx) => (
                                                            <div key={idx} className="bg-slate-950/70 px-2 py-1 rounded border border-slate-800 flex items-center justify-between gap-2 text-xs">
                                                                <span className="font-extrabold text-cyan-300 font-mono text-[11px]">{it.tool_code}</span>
                                                                <span className="font-bold text-slate-100 flex-1 truncate">{it.tool_name}</span>
                                                                <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">{it.qty} {it.unit}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <div className="font-extrabold text-cyan-400 font-mono text-sm">{b.tool_code}</div>
                                                        <div className="font-bold text-slate-100 text-xs">{b.tool_name}</div>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-3 font-bold text-slate-200">
                                                👨‍🔧 {b.borrower_name}
                                            </td>
                                            <td className="p-3 text-xs text-slate-300 max-w-xs">
                                                📝 {b.purpose}
                                            </td>
                                            <td className="p-3 font-mono font-bold text-amber-400">{b.qty_borrowed} Unit</td>
                                            <td className="p-3 text-xs font-mono text-slate-300">{b.borrow_date}</td>
                                            <td className="p-3 text-xs font-mono text-cyan-300">{b.expected_return}</td>
                                            <td className="p-3">
                                                <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${b.status === 'Sedang Dipinjam' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
                                                    {b.status}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                {b.status === 'Sedang Dipinjam' ? (
                                                    (userRole === 'admin_toko' || userRole === 'admin_gudang' || userRole === 'owner') && (
                                                        <button
                                                            onClick={() => handleOpenReturnModal(b)}
                                                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-3 py-1.5 rounded-lg text-xs transition shadow-md flex items-center gap-1 cursor-pointer"
                                                        >
                                                            ✅ Konfirmasi Kembalikan
                                                        </button>
                                                    )
                                                ) : (
                                                    <div className="flex flex-col items-start gap-1">
                                                        <span className="text-xs text-emerald-400 font-bold font-mono">
                                                            Selesai ({b.actual_return})
                                                        </span>
                                                        {(userRole === 'admin_toko' || userRole === 'admin_gudang' || userRole === 'owner') && (
                                                            <button
                                                                onClick={() => handleOpenReturnModal(b)}
                                                                className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-semibold flex items-center gap-0.5 cursor-pointer"
                                                            >
                                                                ✏️ Edit Tgl Kembali
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
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
                    <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-800 pb-3">
                        <div>
                            <h3 className="font-bold text-amber-400 text-base flex items-center gap-2">
                                🔧 Log Catatan Perbaikan Mesin Rusak & Laporan Hilang
                            </h3>
                            <p className="text-xs text-slate-400">Monitoring mesin yang membutuhkan servis/sparepart serta arsip riwayat perbaikan alat operasional.</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs bg-amber-500/20 text-amber-300 px-3 py-1.5 rounded-lg border border-amber-500/30 font-bold">
                                ⚠️ {toolsList.reduce((sum, t) => sum + (t.damaged_qty || 0), 0)} Unit Rusak/Servis
                            </span>
                            <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-500/30 font-bold">
                                ✅ {toolsList.filter(t => t.repair_stage === 'Selesai' || t.repair_details).length} Riwayat Selesai
                            </span>
                            <span className="text-xs bg-rose-500/20 text-rose-300 px-3 py-1.5 rounded-lg border border-rose-500/30 font-bold">
                                ❌ {toolsList.reduce((sum, t) => sum + (t.lost_qty || 0), 0)} Unit Hilang
                            </span>
                        </div>
                    </div>

                    {/* REPAIR SUB-FILTER BUTTONS */}
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-2 rounded-xl border border-slate-800 text-xs">
                        <div className="flex flex-wrap items-center gap-1.5 font-bold">
                            <span className="text-slate-400 pl-1 text-[11px]">Filter Log:</span>
                            <button
                                onClick={() => setRepairFilterTab('semua')}
                                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${repairFilterTab === 'semua' ? 'bg-cyan-500 text-slate-950 font-extrabold shadow' : 'text-slate-400 hover:text-white bg-slate-900'}`}
                            >
                                📋 Semua Log ({toolsList.filter(t => (t.damaged_qty || 0) > 0 || (t.lost_qty || 0) > 0 || t.repair_stage === 'Selesai' || t.repair_details || t.condition_notes).length})
                            </button>
                            <button
                                onClick={() => setRepairFilterTab('aktif')}
                                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${repairFilterTab === 'aktif' ? 'bg-amber-500 text-slate-950 font-extrabold shadow' : 'text-amber-400 hover:text-amber-300 bg-slate-900'}`}
                            >
                                ⚠️ Aktif Perbaikan ({toolsList.filter(t => (t.damaged_qty || 0) > 0 || t.repair_stage === 'Sedang Dalam Perbaikan').length})
                            </button>
                            <button
                                onClick={() => setRepairFilterTab('selesai')}
                                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${repairFilterTab === 'selesai' ? 'bg-emerald-500 text-slate-950 font-extrabold shadow' : 'text-emerald-400 hover:text-emerald-300 bg-slate-900'}`}
                            >
                                ✅ Riwayat Selesai ({toolsList.filter(t => t.repair_stage === 'Selesai' || t.repair_details).length})
                            </button>
                            <button
                                onClick={() => setRepairFilterTab('hilang')}
                                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${repairFilterTab === 'hilang' ? 'bg-rose-500 text-slate-950 font-extrabold shadow' : 'text-rose-400 hover:text-rose-300 bg-slate-900'}`}
                            >
                                ❌ Tool Hilang ({toolsList.filter(t => (t.lost_qty || 0) > 0 || t.condition === 'Hilang').length})
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-800/40 text-slate-400 uppercase text-xs">
                                <tr>
                                    <th className="p-3">Kode & Nama Alat</th>
                                    <th className="p-3">Kategori & Lokasi</th>
                                    <th className="p-3">Kondisi Saat Ini</th>
                                    <th className="p-3">Rincian Stok (Rusak / Hilang)</th>
                                    <th className="p-3 max-w-sm">📝 Catatan Kerusakan & Kronologi Perbaikan</th>
                                    <th className="p-3">Aksi Servis Admin</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {repairLogTools.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-slate-500 text-xs italic">
                                            Belum ada data log perbaikan atau riwayat alat untuk kategori filter ini.
                                        </td>
                                    </tr>
                                ) : (
                                    repairLogTools.map(t => (
                                        <tr key={t.id} className="hover:bg-slate-800/30 transition">
                                            <td className="p-3">
                                                <div className="font-extrabold text-cyan-400 font-mono text-sm">{t.tool_code}</div>
                                                <div className="font-bold text-slate-100 text-xs">{t.name}</div>
                                            </td>
                                            <td className="p-3 text-xs">
                                                <span className="bg-slate-800 text-cyan-300 border border-slate-700 px-2 py-0.5 rounded text-[11px] block w-fit mb-1">{t.category}</span>
                                                <span className="text-slate-400 font-mono text-[11px]">📍 {t.location}</span>
                                            </td>
                                            <td className="p-3">
                                                <span className={`text-xs px-2.5 py-1 rounded font-bold border ${t.condition === 'Bagus' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : t.condition === 'Hilang' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                                    {t.condition}
                                                </span>
                                            </td>
                                            <td className="p-3 text-xs font-mono">
                                                {(t.damaged_qty || 0) > 0 && (
                                                    <div className="text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20 font-bold mb-1">
                                                        ⚠️ Rusak: {t.damaged_qty} {t.unit}
                                                    </div>
                                                )}
                                                {(t.lost_qty || 0) > 0 && (
                                                    <div className="text-rose-400 bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20 font-bold">
                                                        ❌ Hilang: {t.lost_qty} {t.unit}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-3 max-w-sm text-xs space-y-1.5">
                                                {t.repair_details ? (
                                                    <div className="bg-slate-950 p-3 rounded-lg border border-emerald-500/30 space-y-1 shadow-inner text-slate-200">
                                                        <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                                                            <span className="font-extrabold text-emerald-400 text-[11px]">✅ Log Perbaikan Selesai</span>
                                                            <span className="font-mono text-[10px] text-slate-400">📅 {t.repair_details.completion_date}</span>
                                                        </div>
                                                        {t.repair_details.damaged_part && (
                                                            <div className="text-[11px]"><b className="text-amber-400">📌 Bagian Rusak:</b> {t.repair_details.damaged_part}</div>
                                                        )}
                                                        {t.repair_details.action_taken && (
                                                            <div className="text-[11px]"><b className="text-cyan-400">🛠️ Tindakan:</b> {t.repair_details.action_taken}</div>
                                                        )}
                                                        {t.repair_details.replaced_components && (
                                                            <div className="text-[11px]"><b className="text-teal-300">🔩 Komponen Diganti:</b> {t.repair_details.replaced_components}</div>
                                                        )}
                                                        {(t.repair_details.repair_cost || t.repair_details.technician_name) && (
                                                            <div className="flex justify-between text-[10px] pt-1 text-slate-400 font-mono border-t border-slate-900">
                                                                <span>👨‍🔧 {t.repair_details.technician_name || 'Servis Toko'}</span>
                                                                {t.repair_details.repair_cost && <span className="text-amber-300 font-bold">💵 Rp {parseInt(t.repair_details.repair_cost).toLocaleString()}</span>}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : t.condition_notes ? (
                                                    <div className="bg-slate-950 p-2.5 rounded-lg border border-amber-500/30 text-amber-200 text-xs leading-relaxed font-sans shadow-inner">
                                                        💬 <span className="font-semibold">"{t.condition_notes}"</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-500 italic text-xs">Belum ada catatan detail.</span>
                                                )}
                                            </td>
                                            <td className="p-3 space-y-1.5">
                                                {(userRole === 'admin_toko' || userRole === 'admin_gudang' || userRole === 'owner') && (
                                                    <>
                                                        {/* TAHAP 1: PERLU PERBAIKAN / BELUM DIMULAI */}
                                                        {(!t.repair_stage || t.repair_stage === 'Perlu Perbaikan') && (t.damaged_qty || 0) > 0 && (
                                                            <button
                                                                onClick={() => handleStartRepair(t.id)}
                                                                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold px-3 py-2 rounded-lg text-xs transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                                                            >
                                                                ⚙️ Mulai Perbaikan
                                                            </button>
                                                        )}

                                                        {/* TAHAP 2: SEDANG DALAM PERBAIKAN */}
                                                        {t.repair_stage === 'Sedang Dalam Perbaikan' && (
                                                            <div className="space-y-1.5">
                                                                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-extrabold px-2.5 py-1 rounded-lg block text-center animate-pulse">
                                                                    🛠️ Sedang Dalam Perbaikan
                                                                </span>
                                                                <button
                                                                    onClick={() => handleOpenCompleteRepairModal(t)}
                                                                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-3 py-2 rounded-lg text-xs transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                                                                >
                                                                    ✅ Perbaikan Selesai
                                                                </button>
                                                            </div>
                                                        )}

                                                        {/* TAHAP 3: PERBAIKAN SELESAI */}
                                                        {t.repair_stage === 'Selesai' && (
                                                            <div className="space-y-1.5">
                                                                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-extrabold px-2.5 py-1 rounded-lg block text-center">
                                                                    ✅ Perbaikan Selesai
                                                                </span>
                                                                <button
                                                                    onClick={() => handleOpenCompleteRepairModal(t)}
                                                                    className="w-full bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 font-extrabold px-3 py-1.5 rounded-lg text-xs transition border border-slate-700 flex items-center justify-center gap-1 cursor-pointer"
                                                                >
                                                                    ✏️ Edit Detail Perbaikan
                                                                </button>
                                                            </div>
                                                        )}

                                                        <button
                                                            onClick={() => handleOpenEditToolModal(t)}
                                                            className="w-full bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold px-3 py-1 rounded text-[11px] transition border border-slate-800 flex items-center justify-center gap-1 cursor-pointer"
                                                        >
                                                            ⚙️ Edit Stok & Kondisi
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
    );
}
