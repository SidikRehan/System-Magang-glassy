import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { X, CheckCircle2, Camera, User, MapPin, FileText, CreditCard, Loader2, Check } from 'lucide-react';

export default function ConfirmDeliveryModal({
    isOpen,
    onClose,
    order,
}) {
    if (!isOpen || !order) return null;

    const isLunas = order.payment_status === 'Lunas';
    const sisaCod = Math.max(0, Number(order.total_price || 0) - Number(order.paid_amount || 0));

    const [photoPreview, setPhotoPreview] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        proof_photo: null,
        recipient_name: '',
        mark_lunas: isLunas ? true : false,
    });

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('proof_photo', file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleModalClose = () => {
        reset();
        setPhotoPreview(null);
        onClose();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!data.proof_photo) {
            alert('Mohon ambil/upload foto Surat Jalan yang telah ditandatangani penerima terlebih dahulu!');
            return;
        }

        post(route('orders.complete_delivery', order.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                handleModalClose();
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-slate-800 relative">
                {/* LOADING OVERLAY SHIELD */}
                {processing && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-xs z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
                        <div className="bg-white p-5 rounded-3xl shadow-2xl border border-slate-200 flex flex-col items-center gap-3 max-w-xs animate-in zoom-in-95 duration-200">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                            </div>
                            <div>
                                <strong className="block text-xs font-bold text-slate-800">Mengonfirmasi Terkirim...</strong>
                                <span className="text-[11px] text-slate-500 font-mono">Mengunggah bukti foto Surat Jalan</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* HEADER MODAL */}
                <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#70b03c]/10 border border-[#70b03c]/20 flex items-center justify-center text-[#70b03c]">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-[#242222] flex items-center gap-2">
                                Konfirmasi Terkirim & Bukti SJ
                            </h2>
                            <p className="text-xs text-slate-500">
                                Upload foto Surat Jalan bertanda tangan penerima
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

                {/* FORM BODY */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs">
                    {/* INFO BOX SPO & KONSUMEN */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="font-mono font-black text-xs text-[#1b68b0] bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                                SPO: {order.spo_number}
                            </span>
                            <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold ${
                                isLunas 
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                                {isLunas ? 'STATUS: LUNAS' : `COD: Rp ${sisaCod.toLocaleString('id-ID')}`}
                            </span>
                        </div>

                        <div className="space-y-1">
                            <div className="font-extrabold text-[#242222] text-sm flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-slate-500" />
                                <span>{order.customer_name}</span>
                            </div>
                            <p className="text-slate-600 text-xs flex items-start gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                <span>{order.customer_address || '-'} ({order.customer_phone})</span>
                            </p>
                        </div>
                    </div>

                    {/* UPLOAD FOTO SURAT JALAN TANDA TANGAN (WAJIB) */}
                    <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl space-y-3">
                        <label className="block text-xs font-bold text-amber-900 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                                <Camera className="w-4 h-4 text-amber-700" />
                                <span>Foto Surat Jalan Tanda Tangan Penerima <span className="text-rose-500">*</span></span>
                            </span>
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-300">
                                WAJIB FOTO SJ
                            </span>
                        </label>

                        <p className="text-[11px] text-amber-800 leading-relaxed">
                            Ambil foto lembaran <strong>Surat Jalan</strong> asli yang sudah ditandatangani dan diberi nama jelas oleh penerima di lokasi pengiriman.
                        </p>

                        <input
                            type="file"
                            accept="image/*"
                            required
                            onChange={handlePhotoChange}
                            className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs text-slate-700 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#1b68b0] file:text-white hover:file:bg-[#15528c] cursor-pointer"
                        />
                        {errors.proof_photo && (
                            <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                                {errors.proof_photo}
                            </p>
                        )}

                        {/* PREVIEW FOTO */}
                        {photoPreview && (
                            <div className="space-y-1.5 pt-1">
                                <span className="text-[10px] text-slate-600 font-bold block">Pratinjau Foto Bukti SJ:</span>
                                <div className="relative rounded-2xl overflow-hidden border border-slate-300 max-h-52 bg-slate-900 shadow-md">
                                    <img src={photoPreview} alt="Bukti Surat Jalan" className="w-full h-52 object-contain mx-auto" />
                                    <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow">
                                        <Check className="w-3 h-3 text-white" /> Foto SJ Siap Diunggah
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* NAMA PENERIMA / PIHAK PENERIMA */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Nama Terang Penerima Barang / Penandatangan SJ
                        </label>
                        <input
                            type="text"
                            value={data.recipient_name}
                            onChange={e => setData('recipient_name', e.target.value)}
                            placeholder="Contoh: Pak Herman (Pemilik) / Pak Yanto (Mandor / Satpam)"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-[#1b68b0] focus:bg-white"
                        />
                    </div>

                    {/* STATUS PELUNASAN COD (JIKA BELUM LUNAS) */}
                    {!isLunas && (
                        <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-rose-900 text-xs flex items-center gap-1.5">
                                    <CreditCard className="w-4 h-4 text-rose-700" />
                                    <span>Penagihan COD di Lokasi (Rp {sisaCod.toLocaleString('id-ID')})</span>
                                </span>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer pt-1">
                                <input
                                    type="checkbox"
                                    checked={data.mark_lunas}
                                    onChange={e => setData('mark_lunas', e.target.checked)}
                                    className="w-4 h-4 rounded text-[#70b03c] focus:ring-[#70b03c]"
                                />
                                <span className="text-xs font-bold text-slate-800">
                                    Telah menerima uang pelunasan COD dari konsumen di lokasi
                                </span>
                            </label>
                        </div>
                    )}

                    {/* ACTION BUTTONS */}
                    <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
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
                            {processing ? (
                                <Loader2 className="w-4 h-4 animate-spin text-white" />
                            ) : (
                                <CheckCircle2 className="w-4 h-4" />
                            )}
                            <span>{processing ? 'Menyimpan...' : 'Simpan & Konfirmasi Terkirim'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
