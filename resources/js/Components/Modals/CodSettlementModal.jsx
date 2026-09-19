import React from 'react';
import { useForm } from '@inertiajs/react';
import { CreditCard, X, Truck, CheckCircle2, Wallet } from 'lucide-react';

export default function CodSettlementModal({ isOpen, onClose, order = null, driverName = 'Pak Budi' }) {
    if (!isOpen || !order) return null;

    const sisaCod = Math.max(0, Number(order.total_price || 0) - Number(order.paid_amount || 0));

    const { post, processing } = useForm({
        destination: 'Kas Tunai Toko',
        notes: `Pelunasan COD Surat Jalan Merah oleh ${driverName}`
    });

    const handleConfirm = (e) => {
        e.preventDefault();
        post(route('orders.settle_cod', order.id), {
            onSuccess: () => {
                onClose();
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col text-slate-800">
                {/* HEADER */}
                <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-800">
                                Serah Terima Uang COD
                            </h2>
                            <p className="text-xs text-slate-500 font-mono">
                                Lembar Merah #{order.spo_number}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* CONTENT */}
                <div className="p-6 space-y-4 text-xs">
                    {/* COD SUMMARY CARD */}
                    <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 text-center">
                        <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block mb-1">
                            Uang Tunai COD yang Disetorkan
                        </span>
                        <div className="text-2xl font-black text-rose-600 font-mono tracking-tight">
                            Rp {sisaCod.toLocaleString('id-ID')}
                        </div>
                        <span className="text-[11px] text-slate-500 mt-1 block">
                            Total Order: Rp {Number(order.total_price || 0).toLocaleString('id-ID')}
                        </span>
                    </div>

                    {/* ORDER DETAIL INFO */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Nomor Pesanan (SPO):</span>
                            <span className="font-bold text-[#1b68b0] font-mono">#{order.spo_number}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Nama Pelanggan:</span>
                            <span className="font-bold text-slate-800">{order.customer_name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">Supir Penagih COD:</span>
                            <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                <Truck className="w-3.5 h-3.5 text-[#1b68b0]" />
                                <span>{driverName}</span>
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">Surat Jalan:</span>
                            <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[11px]">
                                Lembar Merah (COD)
                            </span>
                        </div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-900 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>
                            Setelah dikonfirmasi, status pembayaran pesanan otomatis berubah menjadi <strong>LUNAS</strong>, piutang COD di Finance terupdate, dan uang fisik tercatat ke Kas Toko.
                        </span>
                    </div>

                    {/* ACTIONS */}
                    <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 bg-slate-100 rounded-xl transition cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            disabled={processing}
                            onClick={handleConfirm}
                            className="px-5 py-2.5 text-xs font-bold text-white bg-[#70b03c] hover:bg-[#5f9733] rounded-xl transition shadow-xs disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                        >
                            <Wallet className="w-4 h-4" />
                            <span>{processing ? 'Memproses...' : 'Terima Uang & Lunaskan COD'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
