import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { CreditCard, X, CheckCircle2, Wallet, User, Camera, Check, Loader2 } from 'lucide-react';

export default function CodSettlementModal({ isOpen, onClose, order = null, onSettled = null }) {
    const [photoPreview, setPhotoPreview] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        payment_proof: null,
        payment_method: 'Transfer Bank / QRIS',
        notes: ''
    });

    useEffect(() => {
        if (order) {
            setPhotoPreview(order.payment_proof_path ? `/storage/${order.payment_proof_path}` : null);
            setData({
                payment_proof: null,
                payment_method: order.payment_method || 'Transfer Bank / QRIS',
                notes: `Konfirmasi Pelunasan Order #${order.spo_number || ''} oleh Admin Toko`
            });
        }
    }, [order, isOpen]);

    if (!isOpen || !order) return null;

    const sisaCod = Math.max(0, Number(order.total_price || 0) - Number(order.paid_amount || 0));
    const paidAmount = Number(order.paid_amount || 0);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('payment_proof', file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleModalClose = () => {
        reset();
        setPhotoPreview(null);
        onClose();
    };

    const handleConfirm = (e) => {
        e.preventDefault();
        if (!data.payment_proof && !order.payment_proof_path) {
            alert('Mohon unggah foto bukti pembayaran / struk transfer pelunasan customer terlebih dahulu!');
            return;
        }

        post(route('orders.settle_cod', order.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                if (onSettled) {
                    onSettled(order);
                }
                handleModalClose();
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-slate-800 relative">
                {/* LOADING OVERLAY */}
                {processing && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-xs z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
                        <div className="bg-white p-5 rounded-3xl shadow-2xl border border-slate-200 flex flex-col items-center gap-3 max-w-xs">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                            </div>
                            <div>
                                <strong className="block text-xs font-bold text-slate-800">Menyimpan Pelunasan...</strong>
                                <span className="text-[11px] text-slate-500 font-mono">Mengunggah bukti pembayaran customer</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* HEADER */}
                <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#1b68b0]/10 border border-[#1b68b0]/20 flex items-center justify-center text-[#1b68b0]">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-[#242222]">
                                Konfirmasi Pelunasan & Bukti Bayar
                            </h2>
                            <p className="text-xs text-slate-500 font-mono">
                                SPO #{order.spo_number} — Admin Toko
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleModalClose}
                        className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* CONTENT */}
                <form onSubmit={handleConfirm} className="p-6 space-y-4 overflow-y-auto text-xs">
                    {/* PELUNASAN SUMMARY CARD */}
                    <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 text-center">
                        <span className="text-xs font-bold text-[#1b68b0] uppercase tracking-wider block mb-1">
                            Nominal Pelunasan Customer
                        </span>
                        <div className="text-2xl font-black text-[#1b68b0] font-mono tracking-tight">
                            Rp {sisaCod.toLocaleString('id-ID')}
                        </div>
                        <div className="flex items-center justify-center gap-3 text-[11px] text-slate-500 mt-1.5">
                            <span>Total Order: <strong>Rp {Number(order.total_price || 0).toLocaleString('id-ID')}</strong></span>
                            <span>•</span>
                            <span>Sudah Masuk (DP): <strong>Rp {paidAmount.toLocaleString('id-ID')}</strong></span>
                        </div>
                    </div>

                    {/* ORDER DETAIL INFO */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Nomor Pesanan (SPO):</span>
                            <span className="font-bold text-[#1b68b0] font-mono">#{order.spo_number}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">Nama Pelanggan:</span>
                            <span className="font-bold text-slate-800 flex items-center gap-1">
                                <User className="w-3.5 h-3.5 text-slate-500" />
                                <span>{order.customer_name}</span>
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">Status Saat Ini:</span>
                            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[11px]">
                                {order.payment_status || 'Belum Lunas'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">Perubahan Status:</span>
                            <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px] flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-[#70b03c]" />
                                <span>LUNAS (100%)</span>
                            </span>
                        </div>
                    </div>

                    {/* METODE PEMBAYARAN */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Metode Pembayaran Pelunasan
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {['Transfer Bank / QRIS', 'Tunai di Toko', 'EDC / Debit'].map((method) => (
                                <button
                                    key={method}
                                    type="button"
                                    onClick={() => setData('payment_method', method)}
                                    className={`py-2 px-2 rounded-xl border text-[11px] font-bold transition cursor-pointer ${data.payment_method === method
                                            ? 'bg-[#1b68b0] text-white border-[#1b68b0] shadow-xs'
                                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                        }`}
                                >
                                    {method}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* UPLOAD BUKTI PEMBAYARAN CUSTOMER (WAJIB) */}
                    <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl space-y-3">
                        <label className="block text-xs font-bold text-amber-900 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                                <Camera className="w-4 h-4 text-amber-700" />
                                <span>Bukti Pembayaran Customer (Struk / Transfer / Nota) <span className="text-rose-500">*</span></span>
                            </span>
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-300">
                                WAJIB BUKTI BAYAR
                            </span>
                        </label>

                        <p className="text-[11px] text-amber-800 leading-relaxed">
                            Unggah foto atau tangkapan layar (screenshot) <strong>bukti transfer, QRIS, atau nota kuitansi lunas</strong> dari customer sebagai arsip sah pelunasan.
                        </p>

                        <input
                            type="file"
                            accept="image/*"
                            required={!order.payment_proof_path}
                            onChange={handlePhotoChange}
                            className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs text-slate-700 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#1b68b0] file:text-white hover:file:bg-[#15528c] cursor-pointer"
                        />
                        {errors.payment_proof && (
                            <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                                {errors.payment_proof}
                            </p>
                        )}

                        {photoPreview && (
                            <div className="space-y-1.5 pt-1">
                                <span className="text-[10px] text-slate-600 font-bold block">
                                    Pratinjau Bukti Pembayaran Customer:
                                </span>
                                <div className="relative rounded-2xl overflow-hidden border border-slate-300 max-h-52 bg-slate-100 shadow-xs">
                                    <img src={photoPreview} alt="Bukti Pembayaran Customer" className="w-full h-52 object-contain mx-auto" />
                                    <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow">
                                        <Check className="w-3 h-3 text-white" /> {data.payment_proof ? 'Bukti Siap Diunggah' : 'Bukti Tersimpan'}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ACTIONS */}
                    <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={handleModalClose}
                            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 bg-slate-100 rounded-xl transition cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2.5 text-xs font-bold text-white bg-[#70b03c] hover:bg-[#5f9733] rounded-xl transition shadow-xs disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                        >
                            <Wallet className="w-4 h-4" />
                            <span>{processing ? 'Memproses...' : 'Simpan Bukti & Ubah Jadi Lunas'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
