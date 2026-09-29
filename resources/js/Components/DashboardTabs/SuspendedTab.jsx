import React, { useState } from "react";
import { roleTitles } from "@/Utils/dashboardHelpers";
import {
    PauseCircle, AlertTriangle, CheckCircle2,
    User, Clock, Camera, FileText,
    ChevronDown, ChevronUp, RefreshCw,
    ArrowRight, Package, Ruler, Info,
} from "lucide-react";

export default function SuspendedTab({
    userRole,
    initialOrders = [],
    setSelectedComplaintOrder,
    setShowGudangDecisionModal,
    handleOpenSketchLightbox,
}) {
    const [expandedId, setExpandedId] = useState(null);

    const suspendedOrders = initialOrders.filter(
        (o) => o && o.complaint_status === "pending_gudang"
    );

    const isAdminGudang = userRole === "admin_gudang" || userRole === "owner";

    const handleOpenDecisionModal = (order) => {
        if (setSelectedComplaintOrder) setSelectedComplaintOrder(order);
        if (setShowGudangDecisionModal) setShowGudangDecisionModal(true);
    };

    const formatDateTime = (dtStr) => {
        if (!dtStr) return "-";
        const d = new Date(dtStr.includes("T") ? dtStr : dtStr.replace(" ", "T"));
        if (isNaN(d.getTime())) return dtStr;
        return d.toLocaleDateString("id-ID", {
            day: "numeric", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-[#242222] flex items-center gap-2.5">
                        <PauseCircle className="w-6 h-6 text-amber-500" />
                        <span>Orderan Ter-Suspend</span>
                        <span className="text-sm font-bold bg-amber-100 text-amber-700 border border-amber-300 px-2.5 py-0.5 rounded-full">
                            {suspendedOrders.length} Orderan
                        </span>
                    </h2>
                    <p className="text-slate-500 text-sm mt-0.5">
                        Orderan yang di-suspend karena laporan kaca cacat/baret dari divisi produksi, menunggu keputusan Admin Gudang.
                    </p>
                </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                    <span className="font-bold">Alur Suspend: </span>
                    Divisi produksi melaporkan kaca cacat. Orderan otomatis di-suspend masuk ke halaman ini.
                    Admin Gudang memberikan keputusan:
                    <span className="font-bold"> Lanjutkan</span> (kembali ke divisi pelapor) atau
                    <span className="font-bold"> Ganti Kaca</span> (dikembalikan ke Divisi Potong HT untuk potong ulang).
                </div>
            </div>

            {suspendedOrders.length === 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-bold text-[#242222] mb-1">Tidak Ada Orderan Ter-Suspend</h3>
                    <p className="text-slate-500 text-sm">Semua orderan produksi berjalan lancar. Tidak ada laporan kaca cacat yang menunggu keputusan.</p>
                </div>
            )}

            <div className="space-y-4">
                {suspendedOrders.map((order) => {
                    const complaint = order.complaint_data || {};
                    const reportingDiv = complaint.reporting_division || order.current_division || "-";
                    const reportingDivLabel = roleTitles[reportingDiv] || reportingDiv.replace("divisi_", "Divisi ").toUpperCase();
                    const isExpanded = expandedId === order.id;
                    const defectiveItems = Array.isArray(complaint.defective_items) ? complaint.defective_items : [];
                    const totalDefective = defectiveItems.reduce((acc, it) => acc + (parseInt(it.qty) || 1), 0);

                    return (
                        <div key={order.id} className="bg-white border-2 border-amber-300 rounded-2xl shadow-sm overflow-hidden">
                            <div className="bg-amber-50 border-b border-amber-200 p-4 flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
                                        <PauseCircle className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-[#242222] text-sm">{order.spo_number}</span>
                                            <span className="text-[10px] bg-amber-200 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-300">SUSPEND</span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5">{order.customer_name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setExpandedId(isExpanded ? null : order.id)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:border-slate-300 transition cursor-pointer"
                                    >
                                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                        {isExpanded ? "Tutup" : "Lihat Detail"}
                                    </button>
                                    {isAdminGudang && (
                                        <button
                                            type="button"
                                            onClick={() => handleOpenDecisionModal(order)}
                                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-black text-white bg-[#1b68b0] hover:bg-[#15528c] transition shadow-xs cursor-pointer"
                                        >
                                            <RefreshCw className="w-3.5 h-3.5" />
                                            Beri Keputusan
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                <div className="flex items-start gap-2">
                                    <User className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                                    <div>
                                        <div className="text-slate-500 font-semibold">Dilaporkan oleh</div>
                                        <div className="font-bold text-[#242222]">{reportingDivLabel}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
                                    <div>
                                        <div className="text-slate-500 font-semibold">Alasan Komplain</div>
                                        <div className="font-bold text-rose-700">{complaint.reason || "Kaca Cacat / Baret"}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                                    <div>
                                        <div className="text-slate-500 font-semibold">Waktu Laporan</div>
                                        <div className="font-bold text-[#242222]">{formatDateTime(complaint.reported_at)}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Package className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                                    <div>
                                        <div className="text-slate-500 font-semibold">Jumlah Item Cacat</div>
                                        <div className="font-bold text-[#242222]">{totalDefective > 0 ? totalDefective + " Lembar" : "-"}</div>
                                    </div>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="border-t border-slate-100 p-4 space-y-4 bg-slate-50/50">
                                    {complaint.notes && complaint.notes !== "-" && (
                                        <div className="bg-white border border-slate-200 rounded-xl p-3.5">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <FileText className="w-4 h-4 text-slate-400" />
                                                <span className="text-xs font-bold text-slate-700">Catatan Penjelasan:</span>
                                            </div>
                                            <p className="text-xs text-slate-600 leading-relaxed">{complaint.notes}</p>
                                        </div>
                                    )}

                                    {defectiveItems.length > 0 && (
                                        <div className="bg-white border border-slate-200 rounded-xl p-3.5">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Ruler className="w-4 h-4 text-slate-400" />
                                                <span className="text-xs font-bold text-slate-700">Rincian Item Kaca Cacat / Baret:</span>
                                            </div>
                                            <div className="space-y-1.5">
                                                {defectiveItems.map((item, idx) => (
                                                    <div key={idx} className="text-xs flex flex-wrap items-center gap-2 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                                                        <span className="font-black text-rose-700">{item.qty || 1} Lembar</span>
                                                        <span className="text-rose-600 font-semibold">{item.glass_type || "-"}</span>
                                                        {item.length_cm && item.width_cm && (
                                                            <span className="text-rose-500">{item.length_cm} x {item.width_cm} cm</span>
                                                        )}
                                                        {item.thickness_mm && (
                                                            <span className="text-rose-400">({item.thickness_mm} mm)</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {complaint.photo_path && (
                                        <div className="bg-white border border-slate-200 rounded-xl p-3.5">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Camera className="w-4 h-4 text-slate-400" />
                                                <span className="text-xs font-bold text-slate-700">Foto Bukti Kaca Cacat:</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleOpenSketchLightbox && handleOpenSketchLightbox({
                                                    url: "/storage/" + complaint.photo_path,
                                                    title: "Foto Bukti Kaca Cacat " + order.spo_number,
                                                    badge: "Laporan Kaca Cacat / Baret",
                                                    subtitle: reportingDivLabel,
                                                    type: "complaint",
                                                })}
                                                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#1b68b0] bg-blue-50 border border-blue-200 hover:bg-blue-100 transition cursor-pointer"
                                            >
                                                <Camera className="w-3.5 h-3.5" />
                                                Lihat Foto Bukti
                                            </button>
                                        </div>
                                    )}

                                    {!isAdminGudang ? (
                                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center gap-3 text-xs text-amber-800">
                                            <Clock className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
                                            <span className="font-semibold">Menunggu keputusan dari <strong>Admin Gudang</strong>. Orderan ini tidak dapat dikerjakan hingga Admin Gudang memberikan konfirmasi.</span>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => handleOpenDecisionModal(order)}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-white bg-[#1b68b0] hover:bg-[#15528c] transition shadow-sm cursor-pointer"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            Beri Keputusan (Lanjutkan / Ganti Kaca)
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
