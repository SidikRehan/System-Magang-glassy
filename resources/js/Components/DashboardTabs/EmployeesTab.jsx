import React from 'react';
import { 
    Users, Plus, Search, ShieldCheck, UserCheck, 
    FileText, Trash2, Edit, Clock, Calendar, 
    Truck, Wrench, Shield, CheckCircle2, Lock
} from 'lucide-react';
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
    if (userRole !== 'hrd' && userRole !== 'owner') {
        return null;
    }

    const filteredEmployees = employeesList.filter(emp => {
        const matchSearch = (emp.name || '').toLowerCase().includes(employeeSearchTerm.toLowerCase()) || 
            (emp.email || '').toLowerCase().includes(employeeSearchTerm.toLowerCase());
        const matchRole = employeeRoleFilter === 'semua' || 
            emp.role === employeeRoleFilter ||
            (employeeRoleFilter === 'admin_finance' && (emp.role === 'admin_finance' || emp.role === 'finance')) ||
            (employeeRoleFilter === 'finance' && (emp.role === 'admin_finance' || emp.role === 'finance'));
        return matchSearch && matchRole;
    });

    return (
        <div className="space-y-6">
            {/* HEADER TAB */}
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-[#242222] flex items-center gap-2.5">
                        <Users className="w-6 h-6 text-[#1b68b0]" />
                        <span>Pengelolaan Karyawan & Audit Log</span>
                    </h2>
                    <p className="text-slate-500 text-xs font-medium mt-1">
                        Kelola pendaftaran karyawan baru, penugasan hak akses role, serta audit trail riwayat aktivitas akun.
                    </p>
                </div>
                <button
                    onClick={() => { setSelectedEmployeeForEdit(null); setShowEmployeeModal(true); }}
                    className="bg-[#1b68b0] hover:bg-[#15528c] text-white font-bold px-4 py-2.5 rounded-xl shadow-xs text-xs flex items-center gap-2 transition cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Karyawan Baru</span>
                </button>
            </div>

            {/* 4 STATS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                    <span className="text-xs text-slate-500 font-semibold block">Total Akun Terdaftar</span>
                    <h3 className="text-2xl font-black text-[#1b68b0] mt-1">{employeesList.length} Karyawan</h3>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                    <span className="text-xs text-slate-500 font-semibold block">Supir & Armada Logistik</span>
                    <h3 className="text-2xl font-black text-[#70b03c] mt-1">{employeesList.filter(u => u.role === 'driver').length} Supir</h3>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                    <span className="text-xs text-slate-500 font-semibold block">Staff Divisi Manufaktur</span>
                    <h3 className="text-2xl font-black text-amber-600 mt-1">{employeesList.filter(u => (u.role || '').startsWith('divisi_')).length} Teknisi</h3>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                    <span className="text-xs text-slate-500 font-semibold block">Total Audit Log Aktivitas</span>
                    <h3 className="text-2xl font-black text-purple-600 mt-1">{activityLogsList.length} Catatan</h3>
                </div>
            </div>

            {/* SUB TAB TOGGLE */}
            <div className="flex items-center justify-between flex-wrap gap-4 bg-white border border-slate-200 p-2 rounded-2xl shadow-xs">
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1">
                    <button
                        onClick={() => setEmployeeSubTab('karyawan')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            employeeSubTab === 'karyawan' 
                                ? 'bg-white text-[#1b68b0] shadow-xs border border-slate-200' 
                                : 'text-slate-600 hover:text-[#242222]'
                        }`}
                    >
                        <Users className="w-3.5 h-3.5" />
                        <span>Daftar Akun Karyawan ({employeesList.length})</span>
                    </button>
                    <button
                        onClick={() => setEmployeeSubTab('log')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            employeeSubTab === 'log' 
                                ? 'bg-white text-[#1b68b0] shadow-xs border border-slate-200' 
                                : 'text-slate-600 hover:text-[#242222]'
                        }`}
                    >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Riwayat Aktivitas Admin ({activityLogsList.length})</span>
                    </button>
                </div>
            </div>

            {/* SUB TAB 1: DAFTAR AKUN KARYAWAN */}
            {employeeSubTab === 'karyawan' && (
                <div className="space-y-4">
                    {/* FILTER & SEARCH BAR */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap justify-between items-center gap-4 shadow-xs">
                        <div className="flex-1 min-w-[240px] relative">
                            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari nama karyawan / email login..."
                                value={employeeSearchTerm}
                                onChange={e => setEmployeeSearchTerm(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs text-[#242222] focus:border-[#1b68b0] focus:ring-1 focus:ring-[#1b68b0] focus:outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-500 font-bold">Filter Divisi:</span>
                            <select
                                value={employeeRoleFilter}
                                onChange={e => setEmployeeRoleFilter(e.target.value)}
                                className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:border-[#1b68b0] focus:ring-1 focus:ring-[#1b68b0] cursor-pointer"
                            >
                                <option value="semua">Semua Peran ({employeesList.length})</option>
                                <option value="driver">Supir / Driver ({employeesList.filter(u => u.role === 'driver').length})</option>
                                <option value="divisi_ht">Divisi HT ({employeesList.filter(u => u.role === 'divisi_ht').length})</option>
                                <option value="divisi_gm">Divisi GM ({employeesList.filter(u => u.role === 'divisi_gm').length})</option>
                                <option value="divisi_bv">Divisi BV ({employeesList.filter(u => u.role === 'divisi_bv').length})</option>
                                <option value="divisi_etsa">Divisi Etsa ({employeesList.filter(u => u.role === 'divisi_etsa').length})</option>
                                <option value="admin_gudang">Admin Gudang ({employeesList.filter(u => u.role === 'admin_gudang').length})</option>
                                <option value="admin_toko">Admin Toko ({employeesList.filter(u => u.role === 'admin_toko').length})</option>
                                <option value="hrd">HRD Personalia ({employeesList.filter(u => u.role === 'hrd').length})</option>
                                <option value="admin_finance">Finance & Akuntansi ({employeesList.filter(u => u.role === 'admin_finance' || u.role === 'finance').length})</option>
                                <option value="owner">Owner & Direksi ({employeesList.filter(u => u.role === 'owner').length})</option>
                            </select>
                        </div>
                    </div>

                    {/* EMPLOYEES LIST - DUAL VIEW (MOBILE CARDS & DESKTOP TABLE) */}
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs p-4 sm:p-5 space-y-4">
                        {/* MOBILE CARDS FOR EMPLOYEES */}
                        <div className="block md:hidden space-y-3">
                            {filteredEmployees.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-xs italic bg-slate-50/50 rounded-xl border border-slate-200">
                                    Tidak ditemukan data karyawan sesuai pencarian/filter.
                                </div>
                            ) : (
                                filteredEmployees.map(emp => {
                                    const roleBadgeColor = 
                                        emp.role === 'driver' ? 'bg-cyan-50 text-cyan-700 border-cyan-200' :
                                        (emp.role || '').startsWith('divisi_') ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                        emp.role === 'admin_gudang' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                        emp.role === 'owner' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                        'bg-blue-50 text-blue-700 border-blue-200';

                                    return (
                                        <div key={emp.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center font-black text-[#1b68b0] text-sm shrink-0">
                                                        {(emp.name || 'U').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-extrabold text-[#242222] text-sm leading-tight flex items-center gap-1.5 flex-wrap">
                                                            <span>{emp.name}</span>
                                                            {auth.user?.id === emp.id && (
                                                                <span className="text-[10px] bg-blue-50 text-[#1b68b0] px-1.5 py-0.2 rounded border border-blue-200 font-bold">
                                                                    (Akun Anda)
                                                                </span>
                                                            )}
                                                        </h4>
                                                        <span className="text-xs text-slate-500 font-mono block mt-0.5 truncate max-w-[200px]">{emp.email}</span>
                                                    </div>
                                                </div>
                                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${roleBadgeColor}`}>
                                                    {roleTitles[emp.role] || emp.role}
                                                </span>
                                            </div>

                                            <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                                                <span>Terdaftar:</span>
                                                <span className="font-bold text-[#242222]">{formatIndonesianDate(emp.created_at)}</span>
                                            </div>

                                            <div className="flex items-center gap-2 pt-1">
                                                <button
                                                    onClick={() => { setSelectedEmployeeForEdit(emp); setShowEmployeeModal(true); }}
                                                    className="flex-1 bg-blue-50 hover:bg-blue-100 text-[#1b68b0] border border-blue-200 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                                                    title="Edit Data / Reset Password"
                                                >
                                                    <Edit className="w-3.5 h-3.5" /> Edit / Reset Pass
                                                </button>
                                                {auth.user?.id !== emp.id && (
                                                    <button
                                                        onClick={() => handleDeleteEmployee(emp)}
                                                        className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
                                                        title="Hapus / Non-aktifkan Akun"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* DESKTOP TABLE FOR EMPLOYEES */}
                        <div className="hidden md:block overflow-x-auto border border-slate-200 rounded-xl">
                            <table className="w-full text-left text-xs min-w-[650px]">
                                <thead className="bg-slate-50/80 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200">
                                    <tr>
                                        <th className="p-4">Karyawan / Staff</th>
                                        <th className="p-4">Email Login</th>
                                        <th className="p-4">Peran / Divisi</th>
                                        <th className="p-4">Tanggal Terdaftar</th>
                                        <th className="p-4 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredEmployees.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="p-8 text-center text-slate-400">
                                                Tidak ditemukan data karyawan sesuai pencarian/filter.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredEmployees.map(emp => {
                                            const roleBadgeColor = 
                                                emp.role === 'driver' ? 'bg-cyan-50 text-cyan-700 border-cyan-200' :
                                                (emp.role || '').startsWith('divisi_') ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                emp.role === 'admin_gudang' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                emp.role === 'owner' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                'bg-blue-50 text-blue-700 border-blue-200';

                                            return (
                                                <tr key={emp.id} className="hover:bg-slate-50/70 transition">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center font-black text-[#1b68b0] text-sm shrink-0">
                                                                {(emp.name || 'U').charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <span className="font-extrabold text-[#242222] block text-sm">{emp.name}</span>
                                                                {auth.user?.id === emp.id && (
                                                                    <span className="text-[10px] bg-blue-50 text-[#1b68b0] px-1.5 py-0.2 rounded border border-blue-200 font-bold">
                                                                        (Akun Anda)
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 font-mono text-slate-600">
                                                        {emp.email}
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${roleBadgeColor}`}>
                                                            {roleTitles[emp.role] || emp.role}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-slate-500 font-mono">
                                                        {formatIndonesianDate(emp.created_at)}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => { setSelectedEmployeeForEdit(emp); setShowEmployeeModal(true); }}
                                                                className="bg-blue-50 hover:bg-blue-100 text-[#1b68b0] border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                                                title="Edit Data / Reset Password"
                                                            >
                                                                <Edit className="w-3.5 h-3.5" /> Edit / Reset Pass
                                                            </button>
                                                            {auth.user?.id !== emp.id && (
                                                                <button
                                                                    onClick={() => handleDeleteEmployee(emp)}
                                                                    className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                                                    title="Hapus / Non-aktifkan Akun"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" /> Hapus
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
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs space-y-4 p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border-b border-slate-100 pb-3">
                        <div>
                            <h3 className="font-black text-[#242222] text-sm flex items-center gap-2">
                                <FileText className="w-4 h-4 text-[#1b68b0]" />
                                <span>Audit Log - Catatan Riwayat Aktivitas Admin</span>
                            </h3>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                                Pencatatan otomatis seluruh pembuatan akun baru, edit profil, reset password, dan penghapusan karyawan.
                            </p>
                        </div>
                        <span className="bg-blue-50 text-[#1b68b0] text-xs font-mono font-bold px-3 py-1 rounded-full border border-blue-200 w-fit">
                            Total {activityLogsList.length} Log
                        </span>
                    </div>

                    {/* MOBILE CARDS FOR AUDIT LOG */}
                    <div className="block md:hidden space-y-3">
                        {activityLogsList.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-xs italic bg-slate-50/50 rounded-xl border border-slate-200">
                                Belum ada catatan aktivitas admin yang terekam di sistem.
                            </div>
                        ) : (
                            activityLogsList.map(log => {
                                const badgeStyle = 
                                    log.action_type === 'BUAT_AKUN' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                    log.action_type === 'RESET_PASSWORD' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                    log.action_type === 'HAPUS_AKUN' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                    log.action_type === 'TOLAK_SCRAP' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                    log.action_type === 'EDIT_SCRAP' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                    log.action_type === 'INPUT_SCRAP' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                    log.action_type === 'CATAT_BAHAN_KACA' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                    'bg-blue-50 text-blue-700 border-blue-200';

                                return (
                                    <div key={log.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-2.5 text-xs">
                                        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                                            <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${badgeStyle}`}>
                                                {log.action_type}
                                            </span>
                                            <span className="text-slate-400 font-mono text-[10px]">
                                                {formatIndonesianDateTime(log.created_at)}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center text-xs">
                                            <div className="flex items-center gap-1.5">
                                                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="text-slate-500 font-medium">Oleh:</span>
                                                <span className="font-extrabold text-[#242222]">{log.admin_name}</span>
                                            </div>
                                            {log.target_user_name && (
                                                <div className="text-slate-600 font-bold">
                                                    Target: <span className="text-[#1b68b0]">{log.target_user_name}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div 
                                            className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 text-slate-700 text-xs leading-relaxed line-clamp-2 hover:line-clamp-none cursor-pointer"
                                            title={log.description}
                                        >
                                            {log.description}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* DESKTOP TABLE FOR AUDIT LOG */}
                    <div className="hidden md:block overflow-x-auto border border-slate-200 rounded-xl">
                        <table className="w-full text-left text-xs min-w-[700px]">
                            <thead className="bg-slate-50/80 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200">
                                <tr>
                                    <th className="p-4">Waktu Log</th>
                                    <th className="p-4">Admin Eksekutor</th>
                                    <th className="p-4">Jenis Action</th>
                                    <th className="p-4">Target Karyawan</th>
                                    <th className="p-4 max-w-md">Detail Deskripsi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                                {activityLogsList.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-slate-400">
                                            Belum ada catatan aktivitas admin yang terekam di sistem.
                                        </td>
                                    </tr>
                                ) : (
                                    activityLogsList.map(log => {
                                        const badgeStyle = 
                                            log.action_type === 'BUAT_AKUN' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                            log.action_type === 'RESET_PASSWORD' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                            log.action_type === 'HAPUS_AKUN' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                            log.action_type === 'TOLAK_SCRAP' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                            log.action_type === 'EDIT_SCRAP' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                            log.action_type === 'INPUT_SCRAP' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                            log.action_type === 'CATAT_BAHAN_KACA' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                            'bg-blue-50 text-blue-700 border-blue-200';

                                        return (
                                            <tr key={log.id} className="hover:bg-slate-50/70 transition">
                                                <td className="p-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                                                    {formatIndonesianDateTime(log.created_at)}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                                                            <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                                                        </div>
                                                        <span className="font-extrabold text-[#242222]">{log.admin_name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 whitespace-nowrap">
                                                    <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${badgeStyle}`}>
                                                        {log.action_type}
                                                    </span>
                                                </td>
                                                <td className="p-4 font-bold text-slate-700">
                                                    {log.target_user_name || '-'}
                                                </td>
                                                <td className="p-4 text-slate-600 max-w-md">
                                                    <div 
                                                        className="line-clamp-2 hover:line-clamp-none transition-all duration-200 cursor-pointer bg-slate-50/70 hover:bg-white p-2 rounded-lg border border-transparent hover:border-slate-200 text-xs leading-relaxed" 
                                                        title={log.description}
                                                    >
                                                        {log.description}
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
            )}
        </div>
    );
}
