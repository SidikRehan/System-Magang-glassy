import React from 'react';

export default function SuppliersTab({
    userRole,
    suppliersList = [],
    sheetGlasses = [],
    supplierSearchTerm = '',
    setSupplierSearchTerm,
    setShowAddSupplierModal,
    handleOpenEditSupplierModal,
    handleDeleteSupplier,
}) {
    if (userRole !== 'admin_toko' && userRole !== 'owner') {
        return null;
    }

    const filteredSuppliers = suppliersList.filter(s =>
        (s.name || '').toLowerCase().includes(supplierSearchTerm.toLowerCase()) ||
        (s.category || '').toLowerCase().includes(supplierSearchTerm.toLowerCase()) ||
        (s.pic || '').toLowerCase().includes(supplierSearchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-100">🏢 Data Supplier & Mitra Kaca Industri</h2>
                    <p className="text-slate-400 text-sm">Kelola daftar perusahaan supplier kaca, kontak PIC WhatsApp, alamat pabrik, dan status kemitraan</p>
                </div>
            </div>

            {/* 4 STATS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                    <span className="text-xs text-slate-400 block">Total Perusahaan Supplier</span>
                    <h3 className="text-2xl font-black text-cyan-400 mt-1">{suppliersList.length} Supplier</h3>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                    <span className="text-xs text-slate-400 block">Supplier Mitra Utama</span>
                    <h3 className="text-2xl font-black text-emerald-400 mt-1">{suppliersList.filter(s => s.status === 'Mitra Utama').length} Perusahaan</h3>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                    <span className="text-xs text-slate-400 block">Supplier Impor / Khusus</span>
                    <h3 className="text-2xl font-black text-purple-400 mt-1">{suppliersList.filter(s => s.status === 'Mitra Impor').length} Perusahaan</h3>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                    <span className="text-xs text-slate-400 block">Bahan Kaca Terhubung</span>
                    <h3 className="text-2xl font-black text-amber-400 mt-1">{sheetGlasses.length} Jenis Kaca</h3>
                </div>
            </div>

            {/* BUTTON TAMBAH SUPPLIER DIRECTLY BELOW CARDS */}
            {(userRole === 'admin_toko' || userRole === 'owner') && (
                <div className="flex justify-start">
                    <button
                        onClick={() => setShowAddSupplierModal(true)}
                        className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black px-5 py-2.5 rounded-xl shadow-xl shadow-emerald-500/20 text-sm flex items-center gap-2 transition transform hover:scale-105 border border-cyan-300/50 cursor-pointer"
                    >
                        <span className="text-base">✨</span> + Tambah Supplier Baru
                    </button>
                </div>
            )}

            {/* SEARCH BAR & SUPPLIERS TABLE */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                        <h3 className="font-bold text-slate-100 text-base">
                            📋 Daftar Perusahaan Supplier Kaca
                        </h3>
                        <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2.5 py-1 rounded-full border border-cyan-500/20 font-mono font-bold">
                            {suppliersList.length} Perusahaan
                        </span>
                    </div>

                    <input
                        type="text"
                        placeholder="🔍 Cari Supplier / PIC / Kategori..."
                        value={supplierSearchTerm}
                        onChange={e => setSupplierSearchTerm(e.target.value)}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-800/40 text-slate-400 uppercase text-xs">
                            <tr>
                                <th className="p-3">Nama Perusahaan Supplier</th>
                                <th className="p-3">Kategori Kaca</th>
                                <th className="p-3">PIC Kontak Person</th>
                                <th className="p-3">No. WhatsApp</th>
                                <th className="p-3">Alamat Pabrik / Gudang</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {filteredSuppliers.map(sup => (
                                <tr key={sup.id} className="hover:bg-slate-800/30">
                                    <td className="p-3 font-bold text-slate-100">
                                        <div className="flex items-center gap-2">
                                            <span>🏭</span>
                                            <span>{sup.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <span className="bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-2.5 py-1 rounded-full text-xs font-semibold">
                                            {sup.category}
                                        </span>
                                    </td>
                                    <td className="p-3 font-semibold text-slate-200">
                                        👨‍💼 {sup.pic}
                                    </td>
                                    <td className="p-3 font-mono font-bold text-emerald-400">
                                        📱 +{sup.phone}
                                    </td>
                                    <td className="p-3 text-xs text-slate-400 max-w-xs truncate">
                                        📍 {sup.address}
                                    </td>
                                    <td className="p-3">
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${sup.status === 'Mitra Utama' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : sup.status === 'Mitra Impor' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-blue-500/20 text-blue-300 border-blue-500/30'}`}>
                                            {sup.status}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <a
                                                href={`https://wa.me/${(sup.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Halo ${sup.name} (${sup.pic}),\n\nKami dari CV Cahya Karunia Jaya (SYP GLASS OPERATIONAL).\nIngin menanyakan katalog dan penawaran bahan kaca terbaru.\nTerima kasih!`)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-2.5 py-1.5 rounded-lg text-xs transition flex items-center gap-1 shadow-md shadow-emerald-500/20"
                                                title="Chat WhatsApp Direct"
                                            >
                                                💬 WA
                                            </a>
                                            {(userRole === 'admin_toko' || userRole === 'owner') && (
                                                <>
                                                    <button
                                                        onClick={() => handleOpenEditSupplierModal(sup)}
                                                        className="bg-[#2563EB] hover:bg-blue-600 text-white font-extrabold px-2.5 py-1.5 rounded-lg text-xs transition flex items-center gap-1 shadow-md shadow-blue-500/20 cursor-pointer"
                                                        title="Edit Data Supplier"
                                                    >
                                                        ✏️ Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteSupplier(sup.id)}
                                                        className="bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 px-2 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                                                        title="Hapus Supplier"
                                                    >
                                                        🗑️
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredSuppliers.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="p-6 text-center text-slate-500 text-xs italic">
                                        Tidak ada data supplier yang sesuai pencarian.
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
