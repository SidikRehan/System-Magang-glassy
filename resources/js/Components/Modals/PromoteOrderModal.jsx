import React, { useState } from 'react';
import { Handshake, X, CheckCircle2 } from 'lucide-react';

export default function PromoteOrderModal({
    show,
    onClose,
    targetPromoteOrder,
    onConfirmPromote
}) {
    if (!show || !targetPromoteOrder) return null;

    const [promotePaymentOption, setPromotePaymentOption] = useState('dp');
    const [promoteDpPercent, setPromoteDpPercent] = useState(50);
    const [promoteCustomPaidAmount, setPromoteCustomPaidAmount] = useState('');

    const getPromotePaidAmount = () => {
        if (!targetPromoteOrder) return 0;
        const total = parseFloat(targetPromoteOrder.total_price) || 0;
        if (promotePaymentOption === 'lunas') return total;
        if (promotePaymentOption === 'dp') return Math.round((total * promoteDpPercent) / 100);
        if (promotePaymentOption === 'custom') return Math.min(total, Math.max(0, parseFloat(promoteCustomPaidAmount) || 0));
        return 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const paidAmount = getPromotePaidAmount();
        onConfirmPromote(e, targetPromoteOrder, paidAmount);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-800">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3.5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-[#1b68b0]/10 flex items-center justify-center text-[#1b68b0]">
                            <Handshake className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#242222] text-base">
                                Persetujuan Deal & Pengaturan DP
                            </h3>
                            <p className="text-xs text-slate-500 font-mono">SPO: {targetPromoteOrder.spo_number}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl p-1.5 transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-slate-500">No. SPO:</span>
                            <strong className="text-[#1b68b0] font-mono">{targetPromoteOrder.spo_number}</strong>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Customer:</span>
                            <strong className="text-slate-800">{targetPromoteOrder.customer_name} {targetPromoteOrder.customer_phone ? `(${targetPromoteOrder.customer_phone})` : ''}</strong>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Total Tagihan Order:</span>
                            <strong className="text-slate-900 font-mono text-sm font-bold">Rp {Number(targetPromoteOrder.total_price).toLocaleString()}</strong>
                        </div>
                    </div>

                    {/* PILIHAN SKEMA PEMBAYARAN / DP */}
                    <div className="space-y-2">
                        <label className="text-slate-700 font-bold block">Pilih Skema Pembayaran / DP Customer:</label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => setPromotePaymentOption('dp')}
                                className={`py-2 px-2.5 rounded-xl border font-bold text-xs transition cursor-pointer ${promotePaymentOption === 'dp' ? 'bg-[#1b68b0] border-[#1b68b0] text-white shadow-xs' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                            >
                                DP Persentase
                            </button>
                            <button
                                type="button"
                                onClick={() => setPromotePaymentOption('custom')}
                                className={`py-2 px-2.5 rounded-xl border font-bold text-xs transition cursor-pointer ${promotePaymentOption === 'custom' ? 'bg-[#1b68b0] border-[#1b68b0] text-white shadow-xs' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                            >
                                Nominal Custom
                            </button>
                            <button
                                type="button"
                                onClick={() => setPromotePaymentOption('lunas')}
                                className={`py-2 px-2.5 rounded-xl border font-bold text-xs transition cursor-pointer ${promotePaymentOption === 'lunas' ? 'bg-[#1b68b0] border-[#1b68b0] text-white shadow-xs' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                            >
                                Lunas (100%)
                            </button>
                        </div>
                    </div>

                    {/* DETAIL INPUT SESUAI OPSI */}
                    {promotePaymentOption === 'dp' && (
                        <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                            <label className="text-slate-600 block font-semibold">Pilih Persentase DP:</label>
                            <div className="flex gap-2">
                                {[20, 30, 50, 70].map(pct => (
                                    <button
                                        key={pct}
                                        type="button"
                                        onClick={() => setPromoteDpPercent(pct)}
                                        className={`flex-1 py-1.5 rounded-xl border text-xs font-bold font-mono transition cursor-pointer ${promoteDpPercent === pct ? 'bg-[#1b68b0] text-white border-[#1b68b0] shadow-xs' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'}`}
                                    >
                                        {pct}%
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {promotePaymentOption === 'custom' && (
                        <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                            <label className="text-slate-600 block font-semibold">Nominal DP Diterima (Rp):</label>
                            <input
                                type="number"
                                step="10000"
                                min="0"
                                max={targetPromoteOrder.total_price}
                                value={promoteCustomPaidAmount}
                                onChange={e => setPromoteCustomPaidAmount(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-bold text-sm focus:border-[#1b68b0]"
                                placeholder="Masukkan nominal DP Rupiah"
                            />
                            <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                <span className="text-[10px] text-slate-500">Preset:</span>
                                {[
                                    { label: 'Rp 100rb', val: 100000 },
                                    { label: 'Rp 200rb', val: 200000 },
                                    { label: 'Rp 500rb', val: 500000 },
                                    { label: 'Rp 1 Jt', val: 1000000 },
                                    { label: '50%', val: Math.round(targetPromoteOrder.total_price * 0.5) }
                                ].map((preset, pIdx) => (
                                    <button
                                        key={pIdx}
                                        type="button"
                                        onClick={() => setPromoteCustomPaidAmount(preset.val)}
                                        className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono text-slate-700 transition cursor-pointer"
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* RINCIAN PERHITUNGAN */}
                    <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl space-y-1 text-emerald-900">
                        <div className="flex justify-between font-bold">
                            <span>Nominal DP Diterima:</span>
                            <span className="font-mono text-sm text-emerald-800">
                                Rp {Number(getPromotePaidAmount()).toLocaleString()}
                                <span className="text-xs ml-1 font-semibold text-emerald-700">
                                    ({targetPromoteOrder.total_price > 0 ? Math.round((getPromotePaidAmount() / targetPromoteOrder.total_price) * 100) : 0}%)
                                </span>
                            </span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-600">
                            <span>Sisa Tagihan Pelunasan (COD):</span>
                            <span className="font-mono font-bold text-slate-800">Rp {Number(Math.max(0, targetPromoteOrder.total_price - getPromotePaidAmount())).toLocaleString()}</span>
                        </div>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-normal">
                        *Mengubah status draf menjadi <strong>Order Pengerjaan</strong> dan memicu antrean produksi ke Admin Gudang.
                    </p>

                    <div className="pt-2 flex justify-end gap-3 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl transition text-xs cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="bg-[#70b03c] hover:bg-[#5f9733] text-white font-bold px-5 py-2.5 rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer text-xs"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Confirm Deal & Kirim ke Gudang</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
