import React, { useState } from 'react';
import { Bell, X, CheckCircle2, MessageSquare, Layers, Calendar, User, Clock, FileText, RefreshCw, AlertTriangle } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function RevisionDetailModal({
    show,
    onClose,
    order,
    onAcknowledge
}) {
    if (!show || !order) return null;

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirmAcknowledge = () => {
        setIsSubmitting(true);

        if (onAcknowledge) {
            onAcknowledge(order.id);
            setIsSubmitting(false);
            onClose();
            return;
        }

        router.post(route('orders.acknowledge_revision', order.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
                onClose();
            },
            onError: () => {
                setIsSubmitting(false);
            }
        });
    };

    const itemsList = Array.isArray(order.items) && order.items.length > 0
        ? order.items
        : [{
            glass_type: order.glass_type || 'Kaca Cermin 5 mm polos',
            length_cm: order.length_cm || 150,
            width_cm: order.width_cm || 120,
            thickness_mm: order.thickness_mm || 5,
            qty: order.qty || 1,
            processes: Array.isArray(order.processes) ? order.processes : ['HT']
        }];

    const formatIndonesianDate = (dateStr) => {
        if (!dateStr) return '-';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-800 relative">
                
                {/* MODAL HEADER */}
                <div className="flex justify-between items-center border-b border-slate-200 pb-3.5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                            <Bell className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-[#242222] text-base">
                                    Detail Perincian Revisi SPO #{order.spo_number}
                                </h3>
                                <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono">
                                    Revisi #{order.revision_count || 1}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">
                                Pemesan: <strong>{order.customer_name || '-'}</strong> • Tanggal: {formatIndonesianDate(order.order_date)}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl p-1.5 transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* ALERT STATUS BANNER */}
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-rose-900 text-xs">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                        <span className="font-bold block text-rose-800">Permintaan Konfirmasi Revisi Admin Toko</span>
                        <p className="text-[11px] text-rose-700 mt-0.5 leading-relaxed">
                            Admin Toko memperbarui spesifikasi/ukuran pesanan ini. Harap periksa rincian di bawah ini sebelum mengonfirmasi agar tim produksi & gudang dapat bekerja sesuai ukuran terbaru.
                        </p>
                    </div>
                </div>

                {/* CATATAN REVISI DARI ADMIN TOKO (HIGHLIGHT BOX) */}
                <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-4 space-y-2 shadow-xs">
                    <div className="flex justify-between items-center border-b border-amber-200/80 pb-2">
                        <span className="font-bold text-amber-900 text-xs flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-amber-700" />
                            <span>Catatan & Alasan Revisi dari Admin Toko:</span>
                        </span>
                        <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded border border-amber-200 font-mono">
                            Admin Toko
                        </span>
                    </div>
                    <p className="text-xs text-slate-800 font-medium italic bg-white p-3 rounded-xl border border-amber-200 leading-relaxed font-mono">
                        "{order.revision_notes || 'Revisi spesifikasi / ukuran dari Admin Toko.'}"
                    </p>
                </div>

                {/* DETAIL SPESIFIKASI & UKURAN TERBARU */}
                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="font-bold text-[#242222] text-xs flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-[#1b68b0]" />
                            <span>Spesifikasi Item Kaca Hasil Revisi Terbaru:</span>
                        </span>
                        <span className="text-[10px] bg-blue-50 text-[#1b68b0] font-bold px-2 py-0.5 rounded border border-blue-200 font-mono">
                            {itemsList.length} Item Kaca
                        </span>
                    </h4>

                    <div className="space-y-2">
                        {itemsList.map((it, idx) => (
                            <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs shadow-2xs">
                                <div className="flex justify-between items-center font-bold">
                                    <span className="text-[#1b68b0] flex items-center gap-1.5 font-mono">
                                        <span className="w-4 h-4 rounded-full bg-blue-50 text-[#1b68b0] text-[10px] font-bold flex items-center justify-center border border-blue-200">
                                            {idx + 1}
                                        </span>
                                        <span>{it.glass_type}</span>
                                    </span>
                                    <span className="bg-amber-50 text-amber-800 font-mono font-bold px-2 py-0.5 rounded text-[11px] border border-amber-200">
                                        Qty: {it.qty || 1} Pcs
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-[11px] font-mono bg-slate-50 p-2 rounded-lg text-slate-700 border border-slate-200">
                                    <div><b>Panjang:</b> {it.length_cm} cm</div>
                                    <div><b>Lebar:</b> {it.width_cm} cm</div>
                                    <div><b>Tebal:</b> {it.thickness_mm} mm</div>
                                </div>
                                {Array.isArray(it.processes) && it.processes.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-1 text-[10px] pt-1">
                                        <span className="text-slate-500 font-bold">Proses:</span>
                                        {it.processes.map((proc, pIdx) => (
                                            <span key={pIdx} className="bg-blue-50 text-[#1b68b0] px-1.5 py-0.5 rounded font-bold font-mono border border-blue-200">
                                                {proc}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {order.description && (
                        <div className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
                            <b>Catatan Tambahan Orderan:</b> {order.description}
                        </div>
                    )}
                </div>

                {/* RIWAYAT LOG REVISI JIKA LEBIH DARI 1 REVISI */}
                {Array.isArray(order.revision_history) && order.revision_history.length > 0 && (
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs">
                        <h4 className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>Riwayat Log Perubahan Revisi ({order.revision_history.length}x)</span>
                        </h4>
                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                            {order.revision_history.map((rev, rIdx) => (
                                <div key={rIdx} className="bg-white p-2 rounded-lg border border-slate-200 text-[11px] space-y-1">
                                    <div className="flex justify-between items-center text-slate-500 font-mono text-[10px]">
                                        <span className="font-bold text-[#1b68b0]">Revisi #{rev.revision_number || (rIdx + 1)}</span>
                                        <span>{rev.revised_at} — oleh {rev.revised_by || 'Admin Toko'}</span>
                                    </div>
                                    <p className="text-slate-700 italic">"{rev.notes || rev.user_notes || '-'}"</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* FOOTER ACTION */}
                <div className="pt-2 flex justify-between items-center border-t border-slate-200">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl transition text-xs cursor-pointer"
                    >
                        Tutup
                    </button>

                    <button 
                        type="button" 
                        onClick={handleConfirmAcknowledge}
                        disabled={isSubmitting}
                        className="bg-[#70b03c] hover:bg-[#5e9632] text-white font-extrabold px-5 py-2.5 rounded-xl transition shadow-xs flex items-center gap-2 text-xs cursor-pointer disabled:opacity-50"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isSubmitting ? 'Mengonfirmasi...' : 'SAYA MENGERTI & TERIMA REVISI INI'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
