import React from 'react';
import { useForm } from '@inertiajs/react';

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-[#0f172a] border border-rose-500/40 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl shadow-rose-500/20 flex flex-col">
                {/* HEADER */}
                <div className="bg-gradient-to-r from-rose-950/60 via-slate-900 to-slate-900 border-b border-rose-500/30 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-xl shadow-inner">
                            🔴
                        </div>
                        <div>
                            <h2 className="text-base font-black text-slate-100 flex items-center gap-2">
                                Serah Terima Uang COD
                            </h2>
                            <p className="text-xs text-rose-300/80 font-mono">
                                Surat Jalan Merah #{order.spo_number}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
                    >
                        ✕
                    </button>
                </div>

                {/* CONTENT */}
                <div className="p-6 space-y-4">
                    {/* COD SUMMARY CARD */}
                    <div className="bg-rose-950/30 border border-rose-500/30 rounded-xl p-4 text-center">
                        <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider block mb-1">
                            Uang Tunai COD yang Disetorkan
                        </span>
                        <div className="text-2xl font-black text-rose-400 font-mono tracking-tight">
                            Rp {sisaCod.toLocaleString('id-ID')}
                        </div>
                        <span className="text-[11px] text-slate-400 mt-1 block">
                            Total Order: Rp {Number(order.total_price || 0).toLocaleString('id-ID')}
                        </span>
                    </div>

                    {/* ORDER DETAIL INFO */}
                    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-xs space-y-2">
                        <div className="flex justify-between">
                            <span className="text-slate-400">Nomor Pesanan (SPO):</span>
                            <span className="font-bold text-slate-200 font-mono">#{order.spo_number}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Nama Pelanggan:</span>
                            <span className="font-bold text-slate-200">{order.customer_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Supir Penagih COD:</span>
                            <span className="font-bold text-emerald-400 flex items-center gap-1">
                                🚚 {driverName}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Surat Jalan:</span>
                            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                                Merah (Tagihan Tunai Lokasi)
                            </span>
                        </div>
                    </div>

                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-300/90 flex items-start gap-2">
                        <span>✅</span>
                        <span>
                            Setelah dikonfirmasi, status pembayaran pesanan akan otomatis berubah menjadi <strong>LUNAS</strong>, piutang COD di Finance akan berkurang, dan uang kas fisik tercatat masuk ke Kas Toko / Akuntan.
                        </span>
                    </div>

                    {/* ACTIONS */}
                    <div className="pt-2 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 rounded-lg transition"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            disabled={processing}
                            onClick={handleConfirm}
                            className="px-5 py-2.5 text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-lg transition shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-1.5"
                        >
                            {processing ? 'Memproses...' : '💵 Terima Uang & Lunaskan COD'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
