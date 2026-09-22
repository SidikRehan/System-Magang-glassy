import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { UserPlus, Edit3, User, Mail, Shield, Lock, X, Save, Loader2 } from 'lucide-react';

export default function EmployeeModal({ isOpen, onClose, employeeToEdit = null, roleTitles = {}, userRole = 'hrd' }) {
    const isEdit = Boolean(employeeToEdit && employeeToEdit.id);
    const isOwner = userRole === 'owner';

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-800 relative">
                {/* LOADING OVERLAY SHIELD */}
                {processing && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-xs z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
                        <div className="bg-white p-5 rounded-3xl shadow-2xl border border-slate-200 flex flex-col items-center gap-3 max-w-xs animate-in zoom-in-95 duration-200">
                            <div className="w-12 h-12 rounded-2xl bg-[#1b68b0]/10 flex items-center justify-center text-[#1b68b0]">
                                <Loader2 className="w-6 h-6 animate-spin text-[#1b68b0]" />
                            </div>
                            <div>
                                <strong className="block text-xs font-bold text-slate-800">
                                    {isEdit ? 'Memperbarui Akun Karyawan...' : 'Membuat Akun Karyawan Baru...'}
                                </strong>
                                <span className="text-[11px] text-slate-500 font-mono">Mohon tunggu sebentar</span>
                            </div>
                        </div>
                    </div>
                )}
                {/* MODAL HEADER */}
                <div className="p-5 border-b border-slate-200 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#1b68b0]/10 border border-[#1b68b0]/20 flex items-center justify-center text-[#1b68b0]">
                            {isEdit ? <Edit3 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-800">
                                {isEdit ? 'Edit Akun Karyawan' : 'Tambah Akun Karyawan Baru'}
                            </h3>
                            <p className="text-xs text-slate-500">
                                {isEdit ? 'Perbarui informasi dan jabatan karyawan' : 'Daftarkan karyawan baru agar dapat login ke sistem'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-xl transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* MODAL FORM BODY */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
                    {/* 1. NAMA LENGKAP */}
                    <div>
                        <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>Nama Lengkap Karyawan <span className="text-rose-500">*</span></span>
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            placeholder="Contoh: Sandi Kurniawan"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-[#1b68b0] focus:bg-white"
                            required
                        />
                        {errors.name && <p className="text-rose-500 text-[11px] mt-1 font-semibold">{errors.name}</p>}
                    </div>

                    {/* 2. EMAIL LOGIN */}
                    <div>
                        <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>Email Akun Login <span className="text-rose-500">*</span></span>
                        </label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            placeholder="Contoh: sandi.driver@sypglass.co.id"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-mono focus:border-[#1b68b0] focus:bg-white"
                            required
                        />
                        {errors.email && <p className="text-rose-500 text-[11px] mt-1 font-semibold">{errors.email}</p>}
                    </div>

                    {/* 3. PERAN / DIVISI */}
                    <div>
                        <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-slate-400" />
                            <span>Peran / Divisi Karyawan <span className="text-rose-500">*</span></span>
                        </label>
                        <select
                            value={data.role}
                            onChange={e => setData('role', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-[#1b68b0] focus:bg-white cursor-pointer"
                        >
                            <option value="driver">Supir / Driver Armada</option>
                            <option value="divisi_ht">Staff Divisi HT (Potong & Bor)</option>
                            <option value="divisi_gm">Staff Divisi GM (Gosok Mesin/Slepan)</option>
                            <option value="divisi_bv">Staff Divisi BV (Bevel Dekoratif)</option>
                            <option value="divisi_etsa">Staff Divisi Etsa (Blur/Sandblasting)</option>
                            <option value="admin_gudang">Admin Gudang & Logistik</option>
                            <option value="admin_toko">Admin Toko & Kasir</option>
                            {isOwner && (
                                <>
                                    <option value="hrd">Staff HRD & Personalia</option>
                                    <option value="finance">Admin Finance & Akuntansi</option>
                                    <option value="owner">Owner & Tim Manajemen</option>
                                </>
                            )}
                        </select>
                        <p className="text-[11px] text-slate-500 mt-1">
                            {isOwner 
                                ? 'Sebagai Owner, Anda dapat mendaftarkan seluruh peran termasuk HRD, Finance, dan Owner.' 
                                : 'Sebagai HRD, Anda dapat mendaftarkan akun staf operasional, divisi teknis, dan driver.'}
                        </p>
                        {errors.role && <p className="text-rose-500 text-[11px] mt-1 font-semibold">{errors.role}</p>}
                    </div>

                    {/* 4. PASSWORD */}
                    <div>
                        <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{isEdit ? 'Password Baru (Kosongkan jika tidak diubah)' : 'Password Login Karyawan *'}</span>
                        </label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={e => setData('password', e.target.value)}
                            placeholder={isEdit ? '••••••••' : 'Masukkan password awal (min. 6 karakter)'}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:border-[#1b68b0] focus:bg-white"
                            required={!isEdit}
                        />
                        {errors.password && <p className="text-rose-500 text-[11px] mt-1 font-semibold">{errors.password}</p>}
                    </div>

                    {/* SUBMIT ACTION BUTTONS */}
                    <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-xl transition text-xs cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-[#70b03c] hover:bg-[#5f9733] text-white font-bold px-5 py-2 rounded-xl shadow-xs text-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {processing ? (
                                <Loader2 className="w-4 h-4 animate-spin text-white" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            <span>{processing ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Buat Akun Karyawan')}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
