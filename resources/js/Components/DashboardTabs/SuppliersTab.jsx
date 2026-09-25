import React from 'react';
import { 
    Building2, User, Phone, MapPin, MessageCircle, 
    Edit, Trash2, Plus, Search, CheckCircle2, Factory,
    Layers, ShieldCheck, ExternalLink
} from 'lucide-react';

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
    if (userRole !== 'admin_toko' && userRole !== 'owner' && userRole !== 'finance' && userRole !== 'admin_finance') {
        return null;
    }

    const filteredSuppliers = suppliersList.filter(s =>
        (s.name || '').toLowerCase().includes(supplierSearchTerm.toLowerCase()) ||
        (s.category || '').toLowerCase().includes(supplierSearchTerm.toLowerCase()) ||
        (s.pic || '').toLowerCase().includes(supplierSearchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* HEADER TAB */}
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-[#242222] flex items-center gap-2.5">
                        <Building2 className="w-6 h-6 text-[#1b68b0]" />
                        <span>Data Supplier & Mitra Kaca</span>
                    </h2>
                    <p className="text-slate-500 text-xs font-medium mt-1">
                        Kelola direktori mitra pabrik kaca, kontak PIC WhatsApp, alamat warehouse, dan status kemitraan pengadaan.
                    </p>
                </div>
            </div>

            {/* 4 STATS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                    <span className="text-xs text-slate-500 font-semibold block">Total Perusahaan Supplier</span>
                    <h3 className="text-2xl font-black text-[#1b68b0] mt-1">{suppliersList.length} Supplier</h3>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                    <span className="text-xs text-slate-500 font-semibold block">Supplier Mitra Utama</span>
                    <h3 className="text-2xl font-black text-[#70b03c] mt-1">{suppliersList.filter(s => s.status === 'Mitra Utama').length} Mitra</h3>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                    <span className="text-xs text-slate-500 font-semibold block">Supplier Impor / Khusus</span>
                    <h3 className="text-2xl font-black text-purple-600 mt-1">{suppliersList.filter(s => s.status === 'Mitra Impor').length} Perusahaan</h3>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                    <span className="text-xs text-slate-500 font-semibold block">Bahan Kaca Terhubung</span>
                    <h3 className="text-2xl font-black text-[#242222] mt-1">{sheetGlasses.length} Jenis Kaca</h3>
                </div>
            </div>

            {/* BUTTON TAMBAH SUPPLIER */}
            {(userRole === 'admin_toko' || userRole === 'owner') && (
                <div className="flex justify-start">
                    <button
                        onClick={() => setShowAddSupplierModal(true)}
                        className="bg-[#1b68b0] hover:bg-[#15528c] text-white font-bold px-4 py-2.5 rounded-xl shadow-xs text-xs flex items-center gap-2 transition cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Supplier Baru</span>
                    </button>
                </div>
            )}

            {/* SEARCH BAR & SUPPLIERS TABLE */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                        <h3 className="font-black text-[#242222] text-sm flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-[#1b68b0]" />
                            <span>Daftar Perusahaan Supplier Kaca</span>
                        </h3>
                        <span className="text-xs bg-blue-50 text-[#1b68b0] px-2.5 py-0.5 rounded-full border border-blue-200 font-mono font-bold">
                            {suppliersList.length} Perusahaan
                        </span>
                    </div>

                    <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari Supplier / PIC / Kategori..."
                            value={supplierSearchTerm}
                            onChange={e => setSupplierSearchTerm(e.target.value)}
                            className="bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#242222] focus:border-[#1b68b0] focus:ring-1 focus:ring-[#1b68b0] focus:outline-none w-64"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50/80 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-200">
                            <tr>
                                <th className="p-3">Nama Perusahaan</th>
                                <th className="p-3">Kategori Kaca</th>
                                <th className="p-3">Kontak PIC</th>
                                <th className="p-3">No. WhatsApp</th>
                                <th className="p-3">Alamat Pabrik / Gudang</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {filteredSuppliers.map(sup => (
                                <tr key={sup.id} className="hover:bg-slate-50/70 transition">
                                    <td className="p-3 font-bold text-[#242222]">
                                        <div className="flex items-center gap-2">
                                            <Factory className="w-4 h-4 text-[#1b68b0] shrink-0" />
                                            <span>{sup.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <span className="bg-blue-50 text-[#1b68b0] border border-blue-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                                            {sup.category}
                                        </span>
                                    </td>
                                    <td className="p-3 font-semibold text-slate-700">
                                        <div className="flex items-center gap-1.5">
                                            <User className="w-3.5 h-3.5 text-slate-400" />
                                            <span>{sup.pic}</span>
                                        </div>
                                    </td>
                                    <td className="p-3 font-mono font-bold text-[#70b03c]">
                                        <div className="flex items-center gap-1.5">
                                            <Phone className="w-3.5 h-3.5" />
                                            <span>+{sup.phone}</span>
                                        </div>
                                    </td>
                                    <td className="p-3 text-xs text-slate-500 max-w-xs truncate" title={sup.address}>
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                            <span className="truncate">{sup.address}</span>
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${sup.status === 'Mitra Utama' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : sup.status === 'Mitra Impor' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                            {sup.status}
                                        </span>
                                    </td>
                                    <td className="p-3 text-center">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <a
                                                href={`https://wa.me/${(sup.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Halo ${sup.name} (${sup.pic}),\n\nKami dari CV Cahya Karunia Jaya (SYP GLASS OPERATIONAL).\nIngin menanyakan katalog dan penawaran bahan kaca terbaru.\nTerima kasih!`)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold px-2.5 py-1.5 rounded-lg text-xs transition flex items-center gap-1 shadow-2xs cursor-pointer"
                                                title="Chat WhatsApp Direct"
                                            >
                                                <MessageCircle className="w-3.5 h-3.5" /> WA
                                            </a>
                                            {(userRole === 'admin_toko' || userRole === 'owner') && (
                                                <>
                                                    <button
                                                        onClick={() => handleOpenEditSupplierModal(sup)}
                                                        className="bg-blue-50 hover:bg-blue-100 text-[#1b68b0] border border-blue-200 font-bold px-2.5 py-1.5 rounded-lg text-xs transition flex items-center gap-1 shadow-2xs cursor-pointer"
                                                        title="Edit Data Supplier"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteSupplier(sup.id)}
                                                        className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 p-1.5 rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer"
                                                        title="Hapus Supplier"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredSuppliers.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-slate-400 text-xs italic">
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
