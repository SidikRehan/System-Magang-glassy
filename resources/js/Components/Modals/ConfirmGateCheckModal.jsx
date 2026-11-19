import React from 'react';
import { ShieldCheck, X, CheckCircle2, Truck, ClipboardList, Loader2 } from 'lucide-react';

export default function ConfirmGateCheckModal({
    show,
    onClose,
    confirmData,
    onConfirm,
    isSubmitting = false,
}) {
    if (!show || !confirmData) return null;

    const isTripMode = confirmData.mode === 'trip';
    const orderObj = confirmData.order;
    const tripObj = confirmData.trip;
    const itemsList = Array.isArray(confirmData.items) ? confirmData.items : [];
    const totalQty = confirmData.totalQty || 0;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-800">
                {/* HEADER MODAL */}
                <div className="flex justify-between items-start border-b border-slate-100 pb-3.5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#1b68b0]/10 flex items-center justify-center text-[#1b68b0] shrink-0">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-black text-[#242222] text-base leading-tight">
                                Konfirmasi Verifikasi Barang Satpam
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Pemeriksaan Kesesuaian Fisik Muatan Mobil Armada
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl p-1.5 transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* BODY NOTIFIKASI KONFIRMASI */}
                <div className="space-y-3 text-xs">
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-center space-y-1">
                        <div className="font-black text-[#242222] text-sm">
                            Apakah Anda yakin jumlah fisik barang di mobil sudah sesuai?
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">
                            {isTripMode
                                ? `Seluruh muatan order pada mobil ${tripObj?.vehicle_plate || ''} (${tripObj?.driver_name || ''}) akan ditandai Sudah Dicek Satpam (Sesuai) dan siap keluar mengirim.`
                                : `Order #${orderObj?.spo_number || ''} (${orderObj?.customer_name || ''}) pada mobil ${orderObj?.assigned_vehicle || tripObj?.vehicle_plate || ''} akan ditandai Sudah Dicek Satpam (Sesuai).`}
                        </p>
                    </div>

                    {/* RINGKASAN INFO MOBIL & BARANG YANG DICEK */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5">
                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                            <span className="text-slate-500 font-bold flex items-center gap-1.5">
                                <Truck className="w-3.5 h-3.5 text-[#1b68b0]" />
                                <span>Armada & Supir:</span>
                            </span>
                            <span className="font-bold text-[#242222]">
                                {tripObj?.vehicle_plate || orderObj?.assigned_vehicle || '-'} • {tripObj?.driver_name || orderObj?.assigned_driver || '-'}
                            </span>
                        </div>

                        {!isTripMode && orderObj && (
                            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                                <span className="text-slate-500 font-bold">Nomor Order & Tujuan:</span>
                                <span className="font-mono font-black text-[#1b68b0]">
                                    {orderObj.spo_number} — {orderObj.customer_name}
                                </span>
                            </div>
                        )}

                        {itemsList.length > 0 && (
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                                    <span className="flex items-center gap-1">
                                        <ClipboardList className="w-3.5 h-3.5 text-[#1b68b0]" />
                                        <span>Rincian Barang yang Diverifikasi:</span>
                                    </span>
                                    <span className="font-mono font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                                        Total: {totalQty} Pcs/Lbr
                                    </span>
                                </div>
                                <div className="max-h-36 overflow-y-auto space-y-1 pr-0.5">
                                    {itemsList.map((it, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-white border border-slate-200 px-2.5 py-1.5 rounded-xl text-[11px]">
                                            <span className="font-bold text-[#242222] truncate">
                                                #{idx + 1}. {it.spo_number ? `[${it.spo_number}] ` : ''}{it.glass_type}
                                                {Number(it.length_cm) > 0 ? ` (${it.length_cm}x${it.width_cm} cm)` : ''}
                                            </span>
                                            <span className="font-mono font-black text-[#1b68b0] shrink-0 ml-2">
                                                {it.qty || 1} {it.unit || 'Pcs'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* TOMBOL AKSI: TIDAK / YA, SUDAH SESUAI */}
                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                    >
                        Tidak (Batal)
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isSubmitting}
                        className="px-5 py-2.5 rounded-xl bg-[#70b03c] hover:bg-[#5f9733] text-white font-extrabold text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Memverifikasi...</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Ya, Sudah Sesuai</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

