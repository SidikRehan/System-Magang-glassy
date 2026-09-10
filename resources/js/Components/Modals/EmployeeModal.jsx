import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';

export default function EmployeeModal({ isOpen, onClose, employeeToEdit = null, roleTitles = {} }) {
    const isEdit = Boolean(employeeToEdit && employeeToEdit.id);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        role: 'driver',
        password: '',
    });

    useEffect(() => {
        if (isOpen) {
            clearErrors();
            if (isEdit && employeeToEdit) {
                setData({
                    name: employeeToEdit.name || '',
                    email: employeeToEdit.email || '',
                    role: employeeToEdit.role || 'driver',
                    password: '',
                });
            } else {
                reset();
            }
        }
    }, [isOpen, employeeToEdit]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            post(route('users.update', employeeToEdit.id), {
                onSuccess: () => {
                    reset();
                    onClose();
                }
            });
        } else {
            post(route('users.store'), {
                onSuccess: () => {
                    reset();
                    onClose();
                }
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
            <div className="bg-slate-900 border-2 border-cyan-500/40 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* MODAL HEADER */}
                <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-5 border-b border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 text-lg font-bold">
                            {isEdit ? '✏️' : '👤'}
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-100">
                                {isEdit ? 'Edit Akun Karyawan' : 'Tambah Akun Karyawan Baru'}
                            </h3>
                            <p className="text-xs text-slate-400">
                                {isEdit ? 'Perbarui informasi / jabatan karyawan' : 'Daftarkan karyawan baru agar dapat login ke sistem'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 w-8 h-8 rounded-lg flex items-center justify-center transition"
                    >
                        ✕
                    </button>
                </div>

                {/* MODAL FORM BODY */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
                    {/* 1. NAMA LENGKAP */}
                    <div>
                        <label className="block text-slate-300 font-bold mb-1">Nama Lengkap Karyawan <span className="text-rose-400">*</span></label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            placeholder="Contoh: Sandi Kurniawan (Supir Engkel)"
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-bold focus:border-cyan-400 focus:ring-cyan-400"
                            required
                        />
                        {errors.name && <p className="text-rose-400 text-[11px] mt-1 font-semibold">{errors.name}</p>}
                    </div>

                    {/* 2. EMAIL LOGIN */}
                    <div>
                        <label className="block text-slate-300 font-bold mb-1">Email Akun Login <span className="text-rose-400">*</span></label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            placeholder="Contoh: sandi.driver@sypglass.co.id"
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono focus:border-cyan-400 focus:ring-cyan-400"
                            required
                        />
                        {errors.email && <p className="text-rose-400 text-[11px] mt-1 font-semibold">{errors.email}</p>}
                    </div>

                    {/* 3. PERAN / DIVISI */}
                    <div>
                        <label className="block text-slate-300 font-bold mb-1">Peran / Divisi Karyawan <span className="text-rose-400">*</span></label>
                        <select
                            value={data.role}
                            onChange={e => setData('role', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-bold focus:border-cyan-400 cursor-pointer"
                        >
                            <option value="driver">🚚 Supir / Driver Armada</option>
                            <option value="divisi_ht">✂️ Staff Divisi HT (Potong & Bor Kaca)</option>
                            <option value="divisi_gm">✨ Staff Divisi GM (Gosok Mesin/Slepan)</option>
                            <option value="divisi_bv">💎 Staff Divisi BV (Bevel Dekoratif)</option>
                            <option value="divisi_etsa">🌫️ Staff Divisi Etsa (Blur/Sandblasting)</option>
                            <option value="admin_gudang">🏭 Admin Gudang & Logistik</option>
                            <option value="admin_toko">🏪 Admin Toko & Sales Kasir</option>
                            <option value="owner">📈 Owner & Tim Manajemen</option>
                        </select>
                        <p className="text-[11px] text-slate-500 mt-1">Peran menentukan hak akses menu dan tugas kerja di sistem.</p>
                        {errors.role && <p className="text-rose-400 text-[11px] mt-1 font-semibold">{errors.role}</p>}
                    </div>

                    {/* 4. PASSWORD */}
                    <div>
                        <label className="block text-slate-300 font-bold mb-1">
                            {isEdit ? 'Password Baru (Kosongkan jika tidak ingin mengubah)' : 'Password Login Karyawan *'}
                        </label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={e => setData('password', e.target.value)}
                            placeholder={isEdit ? '••••••••' : 'Masukkan password awal (min. 6 karakter)'}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:border-cyan-400"
                            required={!isEdit}
                        />
                        {errors.password && <p className="text-rose-400 text-[11px] mt-1 font-semibold">{errors.password}</p>}
                    </div>

                    {/* SUBMIT ACTION BUTTONS */}
                    <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-xl transition text-xs"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black px-6 py-2 rounded-xl shadow-lg shadow-cyan-500/20 text-xs transition transform hover:scale-105"
                        >
                            {processing ? 'Menyimpan...' : (isEdit ? '💾 Simpan Perubahan' : '🚀 Buat Akun Karyawan')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
