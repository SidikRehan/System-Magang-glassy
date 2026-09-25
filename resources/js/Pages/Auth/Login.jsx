import React, { useEffect } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    Store, 
    Warehouse, 
    Scissors, 
    Sparkles, 
    Gem, 
    Wind, 
    Truck, 
    TrendingUp, 
    Users, 
    CreditCard, 
    Zap 
} from 'lucide-react';

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
        { label: 'Admin Toko', email: 'toko@sypglass.co.id', icon: Store, iconColor: 'text-[#1b68b0]' },
        { label: 'Admin Gudang', email: 'gudang@sypglass.co.id', icon: Warehouse, iconColor: 'text-slate-600' },
        { label: 'Divisi HT', email: 'ht@sypglass.co.id', icon: Scissors, iconColor: 'text-amber-600' },
        { label: 'Divisi GM', email: 'gm@sypglass.co.id', icon: Sparkles, iconColor: 'text-blue-500' },
        { label: 'Divisi BV', email: 'bv@sypglass.co.id', icon: Gem, iconColor: 'text-indigo-500' },
        { label: 'Divisi Etsa', email: 'etsa@sypglass.co.id', icon: Wind, iconColor: 'text-cyan-600' },
        { label: 'Supir 1 (Pak Budi)', email: 'driver@sypglass.co.id', icon: Truck, iconColor: 'text-emerald-600' },
        { label: 'Supir 2 (Pak Mulyadi)', email: 'mulyadi.driver@sypglass.co.id', icon: Truck, iconColor: 'text-emerald-600' },
        { label: 'Supir 3 (Pak Asep)', email: 'asep.driver@sypglass.co.id', icon: Truck, iconColor: 'text-emerald-600' },
        { label: 'Supir 4 (Pak Hendra)', email: 'hendra.driver@sypglass.co.id', icon: Truck, iconColor: 'text-emerald-600' },
        { label: 'HRD Personalia', email: 'hrd@sypglass.co.id', icon: Users, iconColor: 'text-rose-600' },
        { label: 'Finance & Akuntan', email: 'finance@sypglass.co.id', icon: CreditCard, iconColor: 'text-[#70b03c]' },
        { label: 'Owner & Direksi', email: 'owner@sypglass.co.id', icon: TrendingUp, iconColor: 'text-[#1b68b0]' },
    ];

    const quickFill = (email) => {
        setData({
            email: email,
            password: 'password',
            remember: true,
        });
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-[#242222] font-sans flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
            <Head title="Masuk - UTB" />

            {/* Subtle Ambient Background */}
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#1b68b0]/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#70b03c]/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-2xl shadow-xl space-y-6 relative z-10">
                <div className="text-center space-y-2">
                    <Link href="/" className="inline-flex flex-col items-center group">
                        <img 
                            src="/assets/Logo_UTB.png" 
                            alt="Logo UTB" 
                            className="h-16 w-auto object-contain transform group-hover:scale-105 transition duration-200" 
                        />
                    </Link>
                    <h2 className="text-lg font-extrabold text-[#242222] pt-1">Masuk Ke Sistem Operasional</h2>
                </div>

                {status && <div className="mb-4 text-xs font-semibold text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-200">{status}</div>}

                {/* QUICK LOGIN DEMO ACCOUNT SELECTOR */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#1b68b0] flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-[#1b68b0]" /> Quick Demo Login Role (Pilih 1-Click):
                    </span>
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                        {demoAccounts.map((acc, idx) => {
                            const Icon = acc.icon;
                            const isOwner = acc.email === 'owner@sypglass.co.id';
                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => quickFill(acc.email)}
                                    className={`flex items-center gap-2 text-left p-2 rounded-lg transition border text-[11px] font-semibold cursor-pointer ${
                                        isOwner ? 'col-span-2 justify-center py-2.5 bg-blue-50/70 border-blue-200 text-slate-800 hover:bg-blue-100/70 hover:border-blue-300' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                                    } ${data.email === acc.email ? '!bg-[#1b68b0]/15 !border-[#1b68b0] !text-[#1b68b0] font-bold' : ''}`}
                                >
                                    <Icon className={`w-3.5 h-3.5 shrink-0 ${acc.iconColor}`} />
                                    <span className="truncate">{acc.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <InputLabel htmlFor="email" value="Email" className="text-[#242222] text-xs font-bold" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full bg-slate-50 border-slate-300 text-[#242222] focus:border-[#1b68b0] focus:ring-[#1b68b0] rounded-lg text-sm"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        <InputError message={errors.email} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="password" value="Password" className="text-[#242222] text-xs font-bold" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full bg-slate-50 border-slate-300 text-[#242222] focus:border-[#1b68b0] focus:ring-[#1b68b0] rounded-lg text-sm"
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
                                className="rounded border-slate-300 text-[#1b68b0] shadow-sm focus:ring-[#1b68b0]"
                            />
                            <span className="ms-2 text-xs text-slate-600 font-medium">Ingat Saya</span>
                        </label>
                    </div>

                    <div className="pt-2">
                        <PrimaryButton className="w-full justify-center bg-[#1b68b0] hover:bg-[#15528c] text-white font-extrabold py-3 text-sm rounded-xl shadow-lg shadow-[#1b68b0]/20 transition" disabled={processing}>
                            Masuk
                        </PrimaryButton>
                    </div>
                </form>

                <div className="text-center pt-2">
                    <Link href="/" className="text-xs text-slate-500 hover:text-[#1b68b0] font-medium transition">
                        ← Kembali ke Landing Page
                    </Link>
                </div>
            </div>
        </div>
    );
}
