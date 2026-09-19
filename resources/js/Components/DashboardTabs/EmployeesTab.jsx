import React from 'react';
import { roleTitles, formatIndonesianDate, formatIndonesianDateTime } from '@/Utils/dashboardHelpers';

export default function EmployeesTab({
    userRole,
    auth = {},
    employeesList = [],
    activityLogsList = [],
    employeeSubTab = 'karyawan',
    setEmployeeSubTab,
    employeeSearchTerm = '',
    setEmployeeSearchTerm,
    employeeRoleFilter = 'semua',
    setEmployeeRoleFilter,
    setSelectedEmployeeForEdit,
    setShowEmployeeModal,
    handleDeleteEmployee,
}) {
    if (userRole !== 'hrd' && userRole !== 'admin_finance' && userRole !== 'finance' && userRole !== 'owner') {
        return null;
    }

    const filteredEmployees = employeesList.filter(emp => {
        const matchSearch = (emp.name || '').toLowerCase().includes(employeeSearchTerm.toLowerCase()) || 
            (emp.email || '').toLowerCase().includes(employeeSearchTerm.toLowerCase());
        const matchRole = employeeRoleFilter === 'semua' || emp.role === employeeRoleFilter;
        return matchSearch && matchRole;
    });

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
                        👥 Sistem Pengelolaan Karyawan & Audit Log Admin
                    </h2>
                    <p className="text-slate-400 text-sm">
                        Kelola pendaftaran karyawan baru, rotasi pergantian supir & teknisi, serta audit trail riwayat aktivitas admin.
                    </p>
                </div>
                <button
                    onClick={() => { setSelectedEmployeeForEdit(null); setShowEmployeeModal(true); }}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black px-5 py-2.5 rounded-xl shadow-xl shadow-cyan-500/20 text-xs flex items-center gap-2 transition transform hover:scale-105 cursor-pointer"
                >
                    <span className="text-base">➕</span> Tambah Karyawan Baru
                </button>
            </div>

            {/* 4 STATS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                    <span className="text-xs text-slate-400 block font-semibold">Total Akun Terdaftar</span>
                    <h3 className="text-2xl font-black text-cyan-400 mt-1">{employeesList.length} Karyawan</h3>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                    <span className="text-xs text-slate-400 block font-semibold">Supir & Armada Logistik</span>
                    <h3 className="text-2xl font-black text-emerald-400 mt-1">{employeesList.filter(u => u.role === 'driver').length} Supir</h3>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                    <span className="text-xs text-slate-400 block font-semibold">Staff Divisi Manufaktur</span>
                    <h3 className="text-2xl font-black text-amber-400 mt-1">{employeesList.filter(u => (u.role || '').startsWith('divisi_')).length} Teknisi</h3>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                    <span className="text-xs text-slate-400 block font-semibold">Total Audit Log Aktivitas</span>
                    <h3 className="text-2xl font-black text-purple-400 mt-1">{activityLogsList.length} Catatan</h3>
                </div>
            </div>

            {/* SUB TAB TOGGLE (DAFTAR KARYAWAN VS LOG AKTIVITAS ADMIN) */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center bg-slate-900 border border-slate-800 p-1.5 rounded-xl shadow-lg gap-1">
                    <button
                        onClick={() => setEmployeeSubTab('karyawan')}
                        className={`px-4 py-2 rounded-lg text-xs font-extrabold transition cursor-pointer ${employeeSubTab === 'karyawan' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
                    >
                        👥 Daftar Akun Karyawan ({employeesList.length})
                    </button>
                    <button
                        onClick={() => setEmployeeSubTab('log')}
                        className={`px-4 py-2 rounded-lg text-xs font-extrabold transition cursor-pointer ${employeeSubTab === 'log' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
                    >
                        📜 Riwayat Aktivitas Admin ({activityLogsList.length})
                    </button>
                </div>
            </div>

            {/* SUB TAB 1: DAFTAR AKUN KARYAWAN */}
            {employeeSubTab === 'karyawan' && (
                <div className="space-y-4">
                    {/* FILTER & SEARCH BAR */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap justify-between items-center gap-4">
                        <div className="flex-1 min-w-[240px]">
                            <input
                                type="text"
                                placeholder="🔍 Cari nama karyawan / email login..."
                                value={employeeSearchTerm}
                                onChange={e => setEmployeeSearchTerm(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-200 focus:border-cyan-400"
                            />
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-400 font-bold">Filter Divisi:</span>
                            <select
                                value={employeeRoleFilter}
                                onChange={e => setEmployeeRoleFilter(e.target.value)}
                                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-bold focus:border-cyan-400 cursor-pointer"
                            >
                                <option value="semua">🌐 Semua Peran ({employeesList.length})</option>
                                <option value="driver">🚚 Supir / Driver ({employeesList.filter(u => u.role === 'driver').length})</option>
                                <option value="divisi_ht">✂️ Divisi HT ({employeesList.filter(u => u.role === 'divisi_ht').length})</option>
                                <option value="divisi_gm">✨ Divisi GM ({employeesList.filter(u => u.role === 'divisi_gm').length})</option>
                                <option value="divisi_bv">💎 Divisi BV ({employeesList.filter(u => u.role === 'divisi_bv').length})</option>
                                <option value="divisi_etsa">🌫️ Divisi Etsa ({employeesList.filter(u => u.role === 'divisi_etsa').length})</option>
                                <option value="admin_gudang">🏭 Admin Gudang ({employeesList.filter(u => u.role === 'admin_gudang').length})</option>
                                <option value="admin_toko">🏪 Admin Toko ({employeesList.filter(u => u.role === 'admin_toko').length})</option>
                                <option value="hrd">👔 HRD Personalia ({employeesList.filter(u => u.role === 'hrd').length})</option>
                                <option value="admin_finance">💳 Admin Finance ({employeesList.filter(u => u.role === 'admin_finance' || u.role === 'finance').length})</option>
                                <option value="owner">📈 Owner ({employeesList.filter(u => u.role === 'owner').length})</option>
                            </select>
                        </div>
                    </div>

                    {/* EMPLOYEES TABLE */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-slate-300">
                                <thead className="bg-slate-950/80 text-cyan-400 font-bold uppercase tracking-wider border-b border-slate-800">
                                    <tr>
                                        <th className="p-4">Karyawan / Staff</th>
                                        <th className="p-4">Email Login</th>
                                        <th className="p-4">Peran / Divisi</th>
                                        <th className="p-4">Tanggal Terdaftar</th>
                                        <th className="p-4 text-center">Aksi / Tindakan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60 font-medium">
                                    {filteredEmployees.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="p-8 text-center text-slate-500">
                                                Tidak ditemukan data karyawan sesuai pencarian/filter.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredEmployees.map(emp => {
                                            const roleBadgeColor = 
                                                emp.role === 'driver' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' :
                                                (emp.role || '').startsWith('divisi_') ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                                                emp.role === 'admin_gudang' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                                                emp.role === 'owner' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                                                'bg-blue-500/20 text-blue-300 border-blue-500/30';

                                            return (
                                                <tr key={emp.id} className="hover:bg-slate-800/40 transition">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-cyan-300 text-sm shrink-0">
                                                                {(emp.name || 'U').charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <span className="font-extrabold text-slate-100 block text-sm">{emp.name}</span>
                                                                {auth.user?.id === emp.id && (
                                                                    <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-500/30 font-bold">
                                                                        (Akun Anda)
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 font-mono text-slate-300">
                                                        {emp.email}
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${roleBadgeColor}`}>
                                                            {roleTitles[emp.role] || emp.role}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-slate-400">
                                                        {formatIndonesianDate(emp.created_at)}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => { setSelectedEmployeeForEdit(emp); setShowEmployeeModal(true); }}
                                                                className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                                                title="Edit Data / Reset Password"
                                                            >
                                                                ✏️ Edit / Reset Pass
                                                            </button>
                                                            {auth.user?.id !== emp.id && (
                                                                <button
                                                                    onClick={() => handleDeleteEmployee(emp)}
                                                                    className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                                                    title="Hapus / Non-aktifkan Akun"
                                                                >
                                                                    🗑️ Hapus
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* SUB TAB 2: RIWAYAT AKTIVITAS ADMIN & AUDIT LOG */}
            {employeeSubTab === 'log' && (
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl space-y-4 p-5">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                        <div>
                            <h3 className="font-extrabold text-slate-100 text-base flex items-center gap-2">
                                📜 Audit Log - Catatan Riwayat Aktivitas Admin
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Pencatatan otomatis seluruh pembuatan akun baru, edit profil, reset password, dan penghapusan karyawan.
                            </p>
                        </div>
                        <span className="bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold px-3 py-1 rounded-full border border-cyan-500/30">
                            Total {activityLogsList.length} Log Aktivitas
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-300">
                            <thead className="bg-slate-950/80 text-cyan-400 font-bold uppercase tracking-wider border-b border-slate-800">
                                <tr>
                                    <th className="p-4">Waktu Log</th>
                                    <th className="p-4">Admin Eksekutor</th>
                                    <th className="p-4">Jenis Action</th>
                                    <th className="p-4">Target Karyawan</th>
                                    <th className="p-4">Detail Deskripsi Log</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 font-medium">
                                {activityLogsList.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-slate-500">
                                            Belum ada catatan aktivitas admin yang terekam di sistem.
                                        </td>
                                    </tr>
                                ) : (
                                    activityLogsList.map(log => {
                                        const badgeStyle = 
                                            log.action_type === 'BUAT_AKUN' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                                            log.action_type === 'RESET_PASSWORD' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                                            log.action_type === 'HAPUS_AKUN' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                                            log.action_type === 'TOLAK_SCRAP' ? 'bg-rose-500/20 text-rose-300 border-rose-500/50' :
                                            log.action_type === 'EDIT_SCRAP' ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' :
                                            log.action_type === 'INPUT_SCRAP' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' :
                                            log.action_type === 'CATAT_BAHAN_KACA' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' :
                                            'bg-blue-500/20 text-blue-300 border-blue-500/40';

                                        const actionIcon = 
                                            log.action_type === 'BUAT_AKUN' ? '🟢 BUAT AKUN' :
                                            log.action_type === 'RESET_PASSWORD' ? '🔑 RESET PASSWORD' :
                                            log.action_type === 'HAPUS_AKUN' ? '🔴 HAPUS AKUN' :
                                            log.action_type === 'TOLAK_SCRAP' ? '❌ TOLAK SCRAP' :
                                            log.action_type === 'EDIT_SCRAP' ? '✂️ EDIT SCRAP' :
                                            log.action_type === 'INPUT_SCRAP' ? '🧩 INPUT SCRAP' :
                                            log.action_type === 'CATAT_BAHAN_KACA' ? '📄 CATAT BAHAN' :
                                            '🔵 EDIT AKUN';

                                        return (
                                            <tr key={log.id} className="hover:bg-slate-800/40 transition">
                                                <td className="p-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                                                    {formatIndonesianDateTime(log.created_at)}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-cyan-400 text-xs shrink-0">
                                                            👮
                                                        </span>
                                                        <span className="font-extrabold text-slate-200">{log.admin_name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 whitespace-nowrap">
                                                    <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-black border ${badgeStyle}`}>
                                                        {actionIcon}
                                                    </span>
                                                </td>
                                                <td className="p-4 font-bold text-slate-200">
                                                    {log.target_user_name || '-'}
                                                </td>
                                                <td className="p-4 text-slate-300 font-sans">
                                                    {log.description}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
