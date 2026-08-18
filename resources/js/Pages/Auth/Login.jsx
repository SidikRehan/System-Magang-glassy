import React, { useEffect } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    // Quick Login Demo Helper Accounts
    const demoAccounts = [
        { label: '🏪 Admin Toko', email: 'toko@sypglass.co.id' },
        { label: '🏭 Admin Gudang', email: 'gudang@sypglass.co.id' },
        { label: '✂️ Divisi HT (Potong)', email: 'ht@sypglass.co.id' },
        { label: '✨ Divisi GM (Gosok)', email: 'gm@sypglass.co.id' },
        { label: '💎 Divisi BV (Bevel)', email: 'bv@sypglass.co.id' },
        { label: '🌫️ Divisi Etsa (Blur)', email: 'etsa@sypglass.co.id' },
        { label: '🚚 Driver / Supir', email: 'driver@sypglass.co.id' },
        { label: '📈 Owner & Akuntan', email: 'owner@sypglass.co.id' },
    ];

    const quickFill = (email) => {
        setData({
            email: email,
            password: 'password',
            remember: true,
        });
    };

    return (
        <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
            <Head title="Log in - SYP GLASS Operational System" />

            {/* Glowing Ambient Background */}
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 backdrop-blur-xl p-8 rounded-2xl shadow-2xl space-y-6">
                <div className="text-center space-y-2">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center text-slate-950 font-extrabold text-xl shadow-lg shadow-cyan-500/20">
                            ⚡
                        </div>
                        <span className="font-extrabold text-xl text-slate-100 tracking-wide">SYP GLASS</span>
                    </Link>
                    <h2 className="text-xl font-bold text-slate-200">Masuk Ke System Operasional</h2>
                    <p className="text-xs text-slate-400">Silakan login sesuai akun role masing-masing</p>
                </div>

                {status && <div className="mb-4 text-xs font-semibold text-emerald-400 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">{status}</div>}

                {/* QUICK LOGIN DEMO ACCOUNT SELECTOR */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 block">⚡ Quick Demo Login Role (Pilih 1-Click):</span>
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                        {demoAccounts.map((acc, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => quickFill(acc.email)}
                                className={`text-left p-1.5 rounded transition border text-[11px] font-semibold ${data.email === acc.email ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'}`}
                            >
                                {acc.label}
                            </button>
                        ))}
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <InputLabel htmlFor="email" value="Email Role" className="text-slate-300 text-xs font-bold" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full bg-slate-800/80 border-slate-700 text-slate-100 focus:border-cyan-400 focus:ring-cyan-400 rounded-lg text-sm"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        <InputError message={errors.email} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="password" value="Password" className="text-slate-300 text-xs font-bold" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full bg-slate-800/80 border-slate-700 text-slate-100 focus:border-cyan-400 focus:ring-cyan-400 rounded-lg text-sm"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <InputError message={errors.password} className="mt-1" />
                    </div>

                    <div className="block">
                        <label className="flex items-center">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="bg-slate-800 border-slate-700 text-cyan-400 focus:ring-cyan-400"
                            />
                            <span className="ms-2 text-xs text-slate-400">Ingat Saya</span>
                        </label>
                    </div>

                    <div className="pt-2">
                        <PrimaryButton className="w-full justify-center bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold py-3 text-sm rounded-xl shadow-lg shadow-cyan-500/20" disabled={processing}>
                            <i className="fa-solid fa-right-to-bracket me-2"></i> Log in Ke Dashboard Role
                        </PrimaryButton>
                    </div>
                </form>

                <div className="text-center pt-2">
                    <Link href="/" className="text-xs text-slate-400 hover:text-cyan-400">
                        ← Kembali ke Landing Page
                    </Link>
                </div>
            </div>
        </div>
    );
}
