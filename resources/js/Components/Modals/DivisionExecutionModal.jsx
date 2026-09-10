import React, { useState } from 'react';
import { router } from '@inertiajs/react';

export default function DivisionExecutionModal({
    show,
    onClose,
    selectedExecutionOrder,
    roleTitles = {},
    userRole = '',
    productionSubTab = '',
    isDivisionWorker = false,
    onAcknowledgeRevision,
    onOpenComplaintModal,
    onOpenScrapPopup,
    onFinishJobSubmit,
    formatIndonesianDate = (d) => d || '-',
    formatIndonesianDateTime = (d) => d || '-',
    onOpenSketchLightbox = () => {},
    sheetGlasses = [],
    scrapGlasses = [],
    onRecordRawMaterialSuccess = () => {}
}) {
    if (!show || !selectedExecutionOrder) return null;

    const orderedItems = Array.isArray(selectedExecutionOrder.items) && selectedExecutionOrder.items.length > 0
        ? selectedExecutionOrder.items
        : [{ glass_type: selectedExecutionOrder.glass_type || 'Kaca Cermin 5 mm polos', qty: 1 }];

    const initialGlassType = orderedItems[0]?.glass_type || selectedExecutionOrder.glass_type || '';

    const [rawGlassType, setRawGlassType] = useState(initialGlassType);
    const [rawSheetsUsed, setRawSheetsUsed] = useState(1);
    const [rawNotes, setRawNotes] = useState('');
    const [isSubmittingRaw, setIsSubmittingRaw] = useState(false);

    // State untuk Penolakan Kaca Sisa oleh Divisi HT
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReasonType, setRejectReasonType] = useState('baret_cacat');
    const [rejectNotes, setRejectNotes] = useState('');
    const [isSubmittingReject, setIsSubmittingReject] = useState(false);

    // State untuk Edit / Potong Ulang Kaca Sisa di Rak
    const [showEditScrapModal, setShowEditScrapModal] = useState(false);
    const [selectedScrapToEdit, setSelectedScrapToEdit] = useState(null);
    const [editScrapForm, setEditScrapForm] = useState({
        id: null,
        length_cm: '',
        width_cm: '',
        rak_location: '',
        status: 'Layak Pakai',
        notes: ''
    });
    const [isSubmittingScrapEdit, setIsSubmittingScrapEdit] = useState(false);

    React.useEffect(() => {
        if (selectedExecutionOrder) {
            const firstItem = Array.isArray(selectedExecutionOrder.items) && selectedExecutionOrder.items.length > 0
                ? selectedExecutionOrder.items[0].glass_type
                : selectedExecutionOrder.glass_type;
            setRawGlassType(firstItem || '');
            setRawSheetsUsed(1);
        }
    }, [selectedExecutionOrder]);

    const currentStockItem = sheetGlasses.find(g =>
        g.name.toLowerCase().includes(rawGlassType.toLowerCase()) ||
        rawGlassType.toLowerCase().includes(g.name.toLowerCase())
    );

    const handleRecordRawMaterial = (e) => {
        e.preventDefault();
        if (!rawGlassType || rawSheetsUsed < 1) return;

        setIsSubmittingRaw(true);
        router.post(route('orders.raw_material', selectedExecutionOrder.id), {
            glass_type: rawGlassType,
            sheets_used: rawSheetsUsed,
            notes: rawNotes
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmittingRaw(false);
                onRecordRawMaterialSuccess(rawGlassType, parseInt(rawSheetsUsed) || 1);
                setRawSheetsUsed(1);
                setRawNotes('');
            },
        });
    };

    const handleRejectScrapSubmit = (e) => {
        e.preventDefault();
        setIsSubmittingReject(true);
        router.post(route('orders.reject_scrap', selectedExecutionOrder.id), {
            reason_type: rejectReasonType,
            notes: rejectNotes
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmittingReject(false);
                setShowRejectModal(false);
                setRejectNotes('');
            },
            onError: () => {
                setIsSubmittingReject(false);
            }
        });
    };

    const handleOpenEditScrapModal = (scrapItem) => {
        if (!scrapItem) return;
        setSelectedScrapToEdit(scrapItem);
        setEditScrapForm({
            id: scrapItem.id,
            length_cm: scrapItem.length_cm,
            width_cm: scrapItem.width_cm,
            rak_location: scrapItem.rak_location,
            status: scrapItem.status || 'Layak Pakai',
            notes: ''
        });
        setShowEditScrapModal(true);
    };

    const handleUpdateScrapSubmit = (e) => {
        e.preventDefault();
        if (!editScrapForm.id) return;

        setIsSubmittingScrapEdit(true);
        router.post(route('scrap.update', editScrapForm.id), editScrapForm, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmittingScrapEdit(false);
                setShowEditScrapModal(false);
            },
            onError: () => {
                setIsSubmittingScrapEdit(false);
            }
        });
    };

    return (
                <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xl z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
                    <div className="bg-slate-900/95 border border-cyan-500/30 rounded-3xl w-full max-w-4xl p-6 sm:p-8 shadow-[0_0_60px_rgba(6,182,212,0.15)] space-y-6 relative my-auto overflow-hidden">
                        
                        {/* DEKORASI ACCENT BG */}
                        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

                        {/* MODAL HEADER BAR */}
                        <div className="flex justify-between items-start border-b border-slate-800/90 pb-4 relative z-10 gap-3">
                            <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="bg-cyan-500/10 text-cyan-300 font-extrabold text-[11px] px-3 py-1 rounded-full border border-cyan-500/30 flex items-center gap-1.5 shadow-sm">
                                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                                        <span>MODAL EKSEKUSI WORKSTATION</span>
                                    </span>
                                    <span className="font-black text-cyan-400 font-mono text-2xl tracking-tight">{selectedExecutionOrder.spo_number}</span>
                                    <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border shadow-sm ${selectedExecutionOrder.priority_status === 'Prioritas' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse' : 'bg-slate-800/80 text-slate-400 border-slate-700'}`}>
                                        {selectedExecutionOrder.priority_status === 'Prioritas' ? '🔥 PRIORITAS TINGGI' : '🔵 Standar / Biasa'}
                                    </span>
                                </div>
                                <h3 className="font-extrabold text-slate-100 text-xl tracking-tight mt-1">{selectedExecutionOrder.customer_name}</h3>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="hidden sm:inline-block text-xs font-bold px-3.5 py-1.5 rounded-xl bg-slate-950 text-cyan-300 border border-slate-800 font-mono shadow-inner">
                                    Divisi: {roleTitles[selectedExecutionOrder.current_division] || selectedExecutionOrder.current_division}
                                </span>
                                <button 
                                    onClick={() => onClose()}
                                    className="bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full w-9 h-9 flex items-center justify-center transition border border-slate-700 text-lg font-bold"
                                    title="Tutup Modal"
                                >&times;</button>
                            </div>
                        </div>

                        {/* PERINGATAN REVISI BANNER IN EXECUTION MODAL */}
                        {selectedExecutionOrder.revision_status === 'pending_division' && (
                            <div className="bg-rose-950/90 border-2 border-rose-500 rounded-2xl p-4 text-rose-200 text-xs space-y-2 animate-pulse shadow-lg relative z-10">
                                <div className="font-extrabold text-rose-300 flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2">
                                        <span>⚠️ PERINGATAN REVISI ORDERAN DARI ADMIN TOKO!</span>
                                    </span>
                                    <span className="bg-rose-500 text-white font-mono px-2.5 py-0.5 rounded-full text-[10px]">
                                        REVISI PENDING
                                    </span>
                                </div>
                                <p className="text-xs text-slate-200 leading-relaxed">
                                    Admin Toko telah merevisi deskripsi, foto sketsa project, atau dimensi ukuran item kaca. <strong>Pekerja divisi wajib mengonfirmasi/menerima revisian ini terlebih dahulu</strong> sebelum melanjutkan/menyelesaikan pengerjaan.
                                </p>
                                {selectedExecutionOrder.revision_notes && (
                                    <div className="bg-slate-950/90 p-2.5 rounded-xl border border-rose-500/40 text-xs text-amber-300 font-mono">
                                        📝 Catatan Revisi Admin Toko: <strong>{selectedExecutionOrder.revision_notes}</strong>
                                    </div>
                                )}
                                <div className="flex justify-end pt-1">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onAcknowledgeRevision(selectedExecutionOrder.id);
                                            onClose();
                                        }}
                                        className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5 shadow-xl shadow-amber-500/30 cursor-pointer"
                                    >
                                        🔄 Terima & Eksekusi Revisi SPO
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* WATERMARK BADGE FOR COMPLETED & REVISED ORDERS */}
                        {selectedExecutionOrder.is_revised && (
                            <div className="border-2 border-dashed border-amber-500/60 bg-amber-500/10 p-3.5 rounded-2xl text-center shadow-lg relative overflow-hidden my-2 z-10">
                                <div className="text-xl sm:text-2xl font-black text-amber-400 tracking-widest uppercase rotate-[-1deg] drop-shadow">
                                    🏆 ORDERAN SELESAI & SUDAH DIREVISI
                                </div>
                                <p className="text-[11px] text-amber-200/90 font-mono mt-1">
                                    SPO-{selectedExecutionOrder.spo_number} telah berhasil diproses & diselesaikan dengan penyesuaian revisi dari Admin Toko ({selectedExecutionOrder.revision_count || 1}x Revisi).
                                </p>
                            </div>
                        )}

                        {/* CUSTOMER & ORDER INFO GRID PANEL */}
                        <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-slate-300">
                                    <span className="text-slate-500 w-24">📞 Telepon:</span>
                                    <strong className="text-slate-200 font-mono">{selectedExecutionOrder.customer_phone}</strong>
                                </div>
                                <div className="flex items-start gap-2 text-slate-300">
                                    <span className="text-slate-500 w-24 shrink-0">📍 Alamat Kirim:</span>
                                    <span className="text-slate-300">{selectedExecutionOrder.customer_address}</span>
                                </div>
                            </div>

                            <div className="space-y-2 md:border-l md:border-slate-800/80 md:pl-5">
                                <div className="flex items-center gap-2 text-slate-300">
                                    <span className="text-slate-500 w-28">📅 Target Deadline:</span>
                                    <strong className="text-amber-300 font-mono font-bold">{selectedExecutionOrder.deadline_date || '-'}</strong>
                                </div>
                                <div className="flex items-center gap-2 text-slate-300">
                                    <span className="text-slate-500 w-28">📍 Posisi Divisi:</span>
                                    <span className="text-cyan-300 font-semibold">{roleTitles[selectedExecutionOrder.current_division] || selectedExecutionOrder.current_division}</span>
                                </div>
                            </div>
                        </div>

                        {/* REKOMENDASI ALOKASI KACA SISA RAK (DARI ADMIN TOKO) */}
                        {selectedExecutionOrder.used_scrap_rak && selectedExecutionOrder.used_scrap_rak !== '-' && selectedExecutionOrder.used_scrap_rak.trim() !== '' && (
                            selectedExecutionOrder.used_scrap_rak.startsWith('❌') ? (
                                <div className="bg-rose-950/80 border-2 border-rose-500/80 rounded-2xl p-4 space-y-2 shadow-xl shadow-rose-950/30">
                                    <div className="flex items-center justify-between gap-2 border-b border-rose-500/30 pb-2">
                                        <div className="flex items-center gap-2 font-black text-xs text-rose-300 uppercase tracking-wider">
                                            <span className="text-base">🚨</span>
                                            <span>STATUS REKOMENDASI KACA SISA: DITOLAK DIVISI HT</span>
                                        </div>
                                        <span className="bg-rose-500 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase">
                                            Penolakan Di-Log Ke System
                                        </span>
                                    </div>
                                    <div className="text-xs font-mono font-extrabold text-rose-200 bg-slate-950 p-3 rounded-xl border border-rose-500/40 leading-relaxed">
                                        {selectedExecutionOrder.used_scrap_rak}
                                    </div>
                                    <p className="text-[10px] text-rose-300/90 font-mono">
                                        ℹ️ Divisi Potong (HT) wajib memotong dari bahan kaca lembaran baru di bawah karena rekomendasi kaca sisa telah ditolak (baret/cacat/ukuran kurang).
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-gradient-to-r from-amber-950/90 via-amber-900/60 to-slate-950 border-2 border-amber-500/60 rounded-2xl p-4 space-y-3 shadow-xl shadow-amber-950/30">
                                    <div className="flex items-center justify-between gap-2 border-b border-amber-500/30 pb-2">
                                        <div className="flex items-center gap-2 font-black text-xs text-amber-300 uppercase tracking-wider">
                                            <span className="text-base">🧩</span>
                                            <span>REKOMENDASI / ALOKASI KACA SISA RAK DARI TOKO</span>
                                        </div>
                                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase">
                                            Ambil & Potong Dari Scrap Dulu
                                        </span>
                                    </div>
                                    <div className="text-xs sm:text-sm font-mono font-extrabold text-amber-200 bg-slate-950 p-3 rounded-xl border border-amber-500/40 leading-relaxed shadow-inner">
                                        {selectedExecutionOrder.used_scrap_rak}
                                    </div>

                                    {/* ACTION BUTTONS KHUSUS DIVISI POTONG (HT) */}
                                    {(selectedExecutionOrder.current_division === 'divisi_ht' || userRole === 'admin_gudang' || userRole === 'owner') && (
                                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-amber-500/20">
                                            <p className="text-[10px] text-amber-300/90 font-mono flex-1 min-w-[180px]">
                                                💡 Periksa fisik kaca di rak storage sebelum dipotong.
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const foundScrap = scrapGlasses.find(s => selectedExecutionOrder.used_scrap_rak.includes(s.scrap_code));
                                                        if (foundScrap) {
                                                            handleOpenEditScrapModal(foundScrap);
                                                        } else {
                                                            handleOpenEditScrapModal({
                                                                id: scrapGlasses[0]?.id || 1,
                                                                scrap_code: 'SCRAP-X',
                                                                glass_type: selectedExecutionOrder.glass_type || 'Kaca',
                                                                length_cm: selectedExecutionOrder.length_cm || 50,
                                                                width_cm: selectedExecutionOrder.width_cm || 50,
                                                                rak_location: 'Rak Storage',
                                                                status: 'Layak Pakai'
                                                            });
                                                        }
                                                    }}
                                                    className="bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-extrabold px-3 py-1.5 rounded-xl text-xs transition border border-amber-500/40 flex items-center gap-1 cursor-pointer"
                                                >
                                                    <span>✂️ Potong Ulang / Edit Scrap</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => setShowRejectModal(true)}
                                                    className="bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white font-extrabold px-3 py-1.5 rounded-xl text-xs transition border border-rose-500/40 flex items-center gap-1 cursor-pointer shadow"
                                                >
                                                    <span>❌ Tolak Kaca Sisa (Baret / Ukuran Kurang)</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        )}

                        {/* LAMPIRAN SKETSA POLA & GAMBAR SAMBUNGAN KACA */}
                        {selectedExecutionOrder.sketch_photo_path && (
                            <div className="bg-gradient-to-r from-slate-950 via-cyan-950/30 to-slate-950 border border-cyan-500/40 p-4 rounded-2xl space-y-3 relative z-10 shadow-lg">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-xs font-black text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                                        <span>📐 SKETSA POLA & GAMBAR SAMBUNGAN KACA (ACUAN PEKERJA DIVISI)</span>
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={() => onOpenSketchLightbox(selectedExecutionOrder.sketch_photo_path, selectedExecutionOrder.spo_number)}
                                        className="bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-500/40 px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1 cursor-pointer"
                                    >
                                        🔍 Perbesar Gambar Sketsa
                                    </button>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div 
                                        onClick={() => onOpenSketchLightbox(selectedExecutionOrder.sketch_photo_path, selectedExecutionOrder.spo_number)}
                                        className="relative group cursor-pointer w-28 h-28 sm:w-36 sm:h-36 rounded-xl overflow-hidden border-2 border-cyan-400/50 bg-black shrink-0 shadow-lg"
                                    >
                                        <img 
                                            src={selectedExecutionOrder.sketch_photo_path.startsWith('http') || selectedExecutionOrder.sketch_photo_path.startsWith('/') ? selectedExecutionOrder.sketch_photo_path : `/storage/${selectedExecutionOrder.sketch_photo_path}`}
                                            alt="Sketsa Pola Kaca"
                                            className="w-full h-full object-contain transition transform group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white text-xs font-bold gap-1">
                                            🔍 Klik Perbesar
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-300 space-y-1.5">
                                        <div className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                                            <span>📌 Acuan Pemotongan & Sambungan Pola Kaca</span>
                                        </div>
                                        <p className="text-slate-400 text-[11px] leading-relaxed">
                                            Admin Gudang dan Pekerja Divisi (Potong/HT, Gosok/GM, Bevel/BV, Etsa) wajib melihat sketsa ini sebagai acuan pola fisik, arah sambungan gambar/cermin, dan ukuran pemotongan kaca.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TIMELINE TANGGAL LIFECYCLE ORDER */}
                        <div className="space-y-2">
                            <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <span>📅 Lifecycle Timeline Tanggal Track:</span>
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                                <div className="bg-slate-950/90 p-3 rounded-2xl border border-cyan-500/20 space-y-1">
                                    <span className="text-slate-500 text-[10px] block">📅 Pembuatan Order (Toko):</span>
                                    <strong className="text-cyan-400 font-bold block text-xs">{formatIndonesianDate(selectedExecutionOrder.order_date)}</strong>
                                </div>
                                <div className="bg-slate-950/90 p-3 rounded-2xl border border-blue-500/20 space-y-1">
                                    <span className="text-slate-500 text-[10px] block">📦 Diturunkan Gudang:</span>
                                    <strong className="text-blue-300 font-bold block text-xs">{selectedExecutionOrder.gudang_released_at ? formatIndonesianDateTime(selectedExecutionOrder.gudang_released_at) : 'Belum Diturunkan'}</strong>
                                </div>
                                <div className="bg-slate-950/90 p-3 rounded-2xl border border-emerald-500/20 space-y-1">
                                    <span className="text-slate-500 text-[10px] block">✅ Selesai Eksekusi:</span>
                                    <strong className="text-emerald-400 font-bold block text-xs">{selectedExecutionOrder.execution_completed_at ? formatIndonesianDateTime(selectedExecutionOrder.execution_completed_at) : 'Sedang Eksekusi'}</strong>
                                </div>
                            </div>
                        </div>

                        {/* TAHAPAN PROGRES WORKFLOW PIPELINE DENGAN TANGGAL MASUK & SELESAI PER DIVISI */}
                        <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 space-y-3">
                            <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex justify-between items-center">
                                <span>📋 Track Tanggal Pengerjakan Per Divisi:</span>
                                <span className="text-[10px] text-slate-500 font-mono">Diperbarui Otomatis Per Transisi Divisi</span>
                            </div>
                            {(() => {
                                const allProcs = [
                                    { code: 'HT', name: 'Potong & Bor (HT)' },
                                    { code: 'GM', name: 'Gosok Mesin (GM)' },
                                    { code: 'BV', name: 'Bevel (BV)' },
                                    { code: 'Etsa', name: 'Etsa Blur (Etsa)' }
                                ];

                                const reqSet = new Set();
                                if (Array.isArray(selectedExecutionOrder.processes)) {
                                    selectedExecutionOrder.processes.forEach(p => reqSet.add(String(p).toUpperCase()));
                                }
                                if (Array.isArray(selectedExecutionOrder.items)) {
                                    selectedExecutionOrder.items.forEach(it => {
                                        if (Array.isArray(it.processes)) {
                                            it.processes.forEach(p => reqSet.add(String(p).toUpperCase()));
                                        }
                                    });
                                }

                                const activeProcs = allProcs.filter(proc => {
                                    // HT (Potong) is ALWAYS mandatory for every glass order
                                    if (proc.code === 'HT') return true;
                                    const status = (selectedExecutionOrder.division_progress && selectedExecutionOrder.division_progress[proc.code]) 
                                        ? selectedExecutionOrder.division_progress[proc.code] 
                                        : 'Belum';
                                    if (status !== 'N/A') return true;
                                    if (reqSet.has(proc.code.toUpperCase())) return true;
                                    return false;
                                });

                                const renderList = activeProcs.length > 0 ? activeProcs : allProcs;

                                return (
                                    <div className={`grid grid-cols-1 ${renderList.length === 1 ? 'sm:grid-cols-1' : renderList.length === 2 ? 'sm:grid-cols-2' : renderList.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2 md:grid-cols-4'} gap-3`}>
                                        {renderList.map(proc => {
                                            const status = (selectedExecutionOrder.division_progress && selectedExecutionOrder.division_progress[proc.code]) ? selectedExecutionOrder.division_progress[proc.code] : 'Belum';
                                            const isDone = status === 'Selesai';
                                            const isWorking = status === 'Sedang Dikerjakan';
                                            const isNA = status === 'N/A';

                                            const ts = (selectedExecutionOrder.division_timestamps && selectedExecutionOrder.division_timestamps[proc.code]) 
                                                ? selectedExecutionOrder.division_timestamps[proc.code] 
                                                : {};
                                            const startedAt = ts.started_at;
                                            const completedAt = ts.completed_at;

                                            return (
                                                <div 
                                                    key={proc.code} 
                                                    className={`p-3.5 rounded-2xl border flex flex-col justify-between space-y-2 transition ${isDone ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : isWorking ? 'bg-cyan-500/10 text-cyan-300 border-cyan-400 animate-pulse shadow-md shadow-cyan-500/10' : isNA ? 'bg-slate-900/40 text-slate-600 border-slate-800' : 'bg-slate-900/60 text-slate-400 border-slate-800'}`}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div className="text-[11px] font-extrabold font-mono">{proc.code}: {proc.name}</div>
                                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${isDone ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : isWorking ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400' : isNA ? 'bg-slate-950 text-slate-600 border-slate-900' : 'bg-slate-950 text-slate-500 border-slate-800'}`}>
                                                            {isDone ? '✅ Selesai' : isWorking ? '⚙️ Dikerjakan' : isNA ? '⚪ N/A' : '⏳ Belum'}
                                                        </span>
                                                    </div>

                                                    <div className="space-y-1 text-[10px] font-mono pt-2 border-t border-slate-800/80">
                                                        <div className="flex flex-col">
                                                            <span className="text-slate-500">📥 Tgl Masuk / Mulai:</span>
                                                            <strong className={startedAt ? 'text-cyan-300' : 'text-slate-600'}>
                                                                {startedAt ? formatIndonesianDateTime(startedAt) : '-'}
                                                            </strong>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-slate-500">🏁 Tgl Selesai Eksekusi:</span>
                                                            <strong className={completedAt ? 'text-emerald-300' : 'text-slate-600'}>
                                                                {completedAt ? formatIndonesianDateTime(completedAt) : '-'}
                                                            </strong>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })()}
                        </div>

                        {/* RINCIAN ITEM SPESIFIKASI KACA DETAIL & TOMBOL [+ SISA POTONG] */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                                    <span>📋 Detail Spesifikasi Item Kaca:</span>
                                </h4>
                                <span className="text-[11px] text-slate-400 font-mono">Klik "+ Input Sisa Potong" untuk mencatat scrap ke rak</span>
                            </div>

                            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                                {(Array.isArray(selectedExecutionOrder.items) && selectedExecutionOrder.items.length > 0 
                                    ? selectedExecutionOrder.items 
                                    : [{
                                        glass_type: selectedExecutionOrder.glass_type,
                                        length_cm: selectedExecutionOrder.length_cm,
                                        width_cm: selectedExecutionOrder.width_cm,
                                        thickness_mm: selectedExecutionOrder.thickness_mm,
                                        qty: 1,
                                        processes: selectedExecutionOrder.processes || ['HT']
                                    }]).map((it, idx) => (
                                    <div key={idx} className="bg-slate-950 p-4 rounded-2xl border border-slate-800/90 hover:border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition shadow-md">
                                        <div className="space-y-1.5 flex-1">
                                            <div className="font-extrabold text-cyan-300 text-sm flex items-center gap-2">
                                                <span>Item #{idx + 1}: {it.glass_type}</span>
                                                <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-mono font-bold">Qty: {it.qty || 1} Pcs</span>
                                            </div>
                                            <div className="text-slate-300 font-mono text-xs flex flex-wrap items-center gap-2">
                                                <span>Ukuran: <strong className="text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{it.length_cm} cm × {it.width_cm} cm</strong></span>
                                                <span>Tebal: <strong className="text-amber-300">{it.thickness_mm} mm</strong></span>
                                            </div>
                                            {Array.isArray(it.processes) && (
                                                <div className="text-xs text-slate-400 pt-0.5">
                                                    Proses Divisi: <span className="text-cyan-200 font-mono font-bold">{it.processes.join(', ')}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* TOMBOL POPUP INPUT SISA (KHUSUS DIVISI POTONG / HT) */}
                                        {selectedExecutionOrder.current_division === 'divisi_ht' && (
                                            <button
                                                type="button"
                                                onClick={() => onOpenScrapPopup(it)}
                                                className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500 hover:to-orange-500 text-amber-300 hover:text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs transition border border-amber-500/40 whitespace-nowrap flex items-center gap-1.5 shadow-lg shadow-amber-500/10"
                                            >
                                                <span>🧩 + Input Sisa Potong</span>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* PENCATATAN PEMAKAIAN KACA LEMBARAN BARU (KHUSUS DIVISI POTONG / HT / GUDANG) */}
                        {(selectedExecutionOrder.current_division === 'divisi_ht' || userRole === 'admin_gudang' || userRole === 'owner') && (
                            <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 space-y-3 relative z-10 shadow-lg">
                                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                    <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                                        <span>📄 PENCATATAN PEMAKAIAN BAHAN KACA LEMBARAN BARU (DIVISI HT POTONG)</span>
                                    </h4>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                        Pekerja Divisi HT mencatat jumlah lembaran baru yang diambil dari stok
                                    </span>
                                </div>

                                {selectedExecutionOrder.used_scrap_rak && selectedExecutionOrder.used_scrap_rak !== '-' && selectedExecutionOrder.used_scrap_rak.trim() !== '' && (
                                    <div className="bg-amber-950/60 border border-amber-500/40 rounded-xl p-2 text-xs font-mono text-amber-300 flex items-center justify-between gap-2">
                                        <span>🧩 Rekomendasi Scrap Toko: <strong>{selectedExecutionOrder.used_scrap_rak}</strong></span>
                                        <span className="text-[10px] text-amber-400/80 font-sans shrink-0">(Kurangi catat lembar baru jika pakai scrap)</span>
                                    </div>
                                )}

                                <form onSubmit={handleRecordRawMaterial} className="space-y-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                                        <div className="sm:col-span-2 space-y-1">
                                            <label className="text-[11px] font-bold text-slate-300 block">Pilih Bahan Kaca Lembaran Baru:</label>
                                            <select
                                                value={rawGlassType}
                                                onChange={(e) => setRawGlassType(e.target.value)}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-amber-400 font-mono font-bold cursor-pointer"
                                            >
                                                <optgroup label="✨ Spesifikasi Kaca yang Dipesan pada SPO Ini">
                                                    {orderedItems.map((it, idx) => (
                                                        <option key={'spo_' + idx} value={it.glass_type}>
                                                            {it.glass_type} (Order SPO: {it.qty || 1} Pcs)
                                                        </option>
                                                    ))}
                                                </optgroup>
                                                <optgroup label="📦 Katalog Master Stok Bahan Kaca Gudang">
                                                    {sheetGlasses.map((g) => (
                                                        <option key={'cat_' + g.id} value={g.name}>
                                                            [{g.item_code}] {g.name} — (Stok Tersedia: {g.qty} {g.unit})
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            </select>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[11px] font-bold text-slate-300 block">Jumlah Lembar Dipakai:</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={rawSheetsUsed}
                                                onChange={(e) => setRawSheetsUsed(e.target.value)}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-amber-400 font-mono font-black text-center"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmittingRaw}
                                            className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 h-[38px]"
                                        >
                                            <span>📉</span>
                                            <span>{isSubmittingRaw ? 'Menyimpan...' : '+ Catat & Potong Stok'}</span>
                                        </button>
                                    </div>

                                    {/* LIVE INDIKATOR SISA STOK MASTER GUDANG */}
                                    {currentStockItem ? (
                                        <div className="text-[11px] bg-slate-900 border border-cyan-500/30 rounded-xl p-2.5 font-mono flex flex-wrap items-center justify-between gap-2 text-slate-200">
                                            <span className="flex items-center gap-1.5">
                                                <span>📦 Stok Master Gudang saat Ini:</span>
                                                <strong className="text-cyan-300 font-extrabold">{currentStockItem.name}</strong>
                                                <span className="bg-slate-950 px-2 py-0.5 rounded text-cyan-400 border border-slate-800">
                                                    {currentStockItem.qty} {currentStockItem.unit}
                                                </span>
                                            </span>
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${currentStockItem.qty - (parseInt(rawSheetsUsed) || 1) >= 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'}`}>
                                                {currentStockItem.qty - (parseInt(rawSheetsUsed) || 1) >= 0
                                                    ? `Sisa Stok Setelah Dipotong: ${currentStockItem.qty - (parseInt(rawSheetsUsed) || 1)} ${currentStockItem.unit}`
                                                    : `⚠️ Stok Kurang! (Sisa sisa: ${currentStockItem.qty - (parseInt(rawSheetsUsed) || 1)} ${currentStockItem.unit})`}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 p-2 rounded-xl font-mono flex items-center gap-2">
                                            <span>⚠️ Bahan kaca <strong>"{rawGlassType}"</strong> belum terdaftar langsung di Katalog Master. Memotong stok berdasarkan nama item terdaftar.</span>
                                        </div>
                                    )}
                                </form>

                                {/* RIWAYAT PENCATATAN PEMAKAIAN BAHAN UNTUK SPO INI */}
                                {Array.isArray(selectedExecutionOrder.raw_materials_used) && selectedExecutionOrder.raw_materials_used.length > 0 && (
                                    <div className="pt-2 border-t border-slate-900 space-y-1.5">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                            Riwayat Bahan Kaca Lembaran Terpakai ({selectedExecutionOrder.raw_materials_used.length}x Input):
                                        </span>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedExecutionOrder.raw_materials_used.map((rm, rmIdx) => (
                                                <div key={rmIdx} className="bg-slate-900 border border-amber-500/20 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 font-mono">
                                                    <span className="text-amber-400 font-bold">📄 {rm.glass_type}</span>
                                                    <span className="bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded text-[10px] font-black">
                                                        {rm.sheets_used} Lembar
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">({rm.recorded_by})</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* KETERANGAN & POTONGAN RAK */}
                        {selectedExecutionOrder.description && (
                            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs text-slate-300 italic flex items-center gap-2">
                                <span>📝 Catatan Order:</span>
                                <strong>{selectedExecutionOrder.description}</strong>
                            </div>
                        )}

                        {/* ACTION FOOTER MODAL BAR */}
                        <div className="pt-4 border-t border-slate-800 flex flex-wrap justify-between items-center gap-4 relative z-10">
                            <button 
                                type="button" 
                                onClick={() => onClose()}
                                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition border border-slate-700"
                            >
                                ✕ Tutup Modal
                            </button>

                            <div className="flex flex-wrap items-center gap-2">
                                {(() => {
                                    const isHistoryOrder = (isDivisionWorker && selectedExecutionOrder.current_division !== userRole) || 
                                                           selectedExecutionOrder.current_division === 'QC_Ready' || 
                                                           selectedExecutionOrder.status === 'selesai' ||
                                                           productionSubTab.endsWith('_history');

                                    if (isHistoryOrder) {
                                        return (
                                            <div className="flex items-center gap-2">
                                                {selectedExecutionOrder.is_revised && (
                                                    <span className="text-xs font-black text-amber-300 bg-amber-500/20 px-3 py-1.5 rounded-xl border border-amber-500/40 font-mono">
                                                        🏆 SELESAI & SUDAH DIREVISI
                                                    </span>
                                                )}
                                                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/30 flex items-center gap-1.5 shadow-sm font-mono">
                                                    <span>✅ Order Selesai Dikerjakan</span>
                                                </span>
                                            </div>
                                        );
                                    }

                                    if (selectedExecutionOrder.complaint_status === 'pending_gudang') {
                                        return (
                                            <span className="text-xs font-bold text-amber-300 bg-amber-500/20 px-4 py-2 rounded-xl border border-amber-500/40 flex items-center gap-1.5 font-mono shadow-sm">
                                                <span>⏳ MENUNGGU DECISION ADMIN GUDANG (TERKUNCI)</span>
                                            </span>
                                        );
                                    }

                                    if (selectedExecutionOrder.revision_status === 'pending_division') {
                                        return (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    onAcknowledgeRevision(selectedExecutionOrder.id);
                                                    onClose();
                                                }}
                                                className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs transition shadow-lg shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
                                            >
                                                🔄 Terima & Eksekusi Revisi SPO
                                            </button>
                                        );
                                    }

                                    return (
                                        <>
                                            {/* BUTTON LAPORKAN KACA CACAT / BARET UNTUK DIVISI SELAIN HT */}
                                            {selectedExecutionOrder.current_division !== 'divisi_ht' && (
                                                <button
                                                    type="button"
                                                    onClick={() => onOpenComplaintModal(selectedExecutionOrder)}
                                                    className="bg-gradient-to-r from-rose-500/20 to-amber-500/20 hover:from-rose-500 hover:to-amber-500 text-rose-300 hover:text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs transition border border-rose-500/40 whitespace-nowrap flex items-center gap-1.5 shadow-lg shadow-rose-500/10 cursor-pointer"
                                                >
                                                    <span>⚠️ Laporkan Kaca Cacat / Baret</span>
                                                </button>
                                            )}

                                            <select 
                                                id={`exec_modal_next_div_${selectedExecutionOrder.id}`}
                                                defaultValue="QC_Ready"
                                                className="bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-cyan-400 font-mono shadow-inner"
                                            >
                                                <option value="QC_Ready">✅ Selesai & Lolos QC (Siap Kirim)</option>
                                                <option value="divisi_ht">✂️ Teruskan ke Divisi HT (Potong)</option>
                                                <option value="divisi_gm">✨ Teruskan ke Divisi GM (Gosok)</option>
                                                <option value="divisi_bv">💎 Teruskan ke Divisi BV (Bevel)</option>
                                                <option value="divisi_etsa">🎨 Teruskan ke Divisi Etsa (Blur)</option>
                                            </select>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const sel = document.getElementById(`exec_modal_next_div_${selectedExecutionOrder.id}`);
                                                    const nextVal = sel ? sel.value : 'QC_Ready';
                                                    onFinishJobSubmit(selectedExecutionOrder.id, nextVal);
                                                }}
                                                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs transition shadow-xl shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
                                            >
                                                <span>✅ Selesai & Teruskan Pekerjaan</span>
                                            </button>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* MODAL POPUP SUB-FORM PENOLAKAN KACA SISA (DIVISI HT) */}
                        {showRejectModal && (
                            <div className="fixed inset-0 bg-black/85 backdrop-blur-xl z-[70] flex items-center justify-center p-4 overflow-y-auto">
                                <div className="bg-slate-900 border border-rose-500/50 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 relative my-auto">
                                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                                        <h3 className="font-extrabold text-sm text-rose-400 flex items-center gap-2">
                                            <span>❌ Form Penolakan Kaca Sisa (Divisi HT)</span>
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => setShowRejectModal(false)}
                                            className="text-slate-400 hover:text-white text-xl font-bold"
                                        >&times;</button>
                                    </div>

                                    <form onSubmit={handleRejectScrapSubmit} className="space-y-4 text-xs">
                                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                                            <span className="text-[10px] text-slate-400 font-mono block">Order SPO #: {selectedExecutionOrder.spo_number}</span>
                                            <div className="font-bold text-cyan-300">{selectedExecutionOrder.customer_name}</div>
                                            <div className="text-[11px] text-amber-300 font-mono bg-slate-900 p-2 rounded border border-amber-500/30">
                                                {selectedExecutionOrder.used_scrap_rak}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-slate-300 font-bold block">Pilih Alasan Utama Penolakan:</label>
                                            <div className="space-y-1.5 font-mono text-[11px]">
                                                {[
                                                    { id: 'baret_cacat', label: '⚠️ Kaca Baret / Cacat / Retak Fisik' },
                                                    { id: 'ukuran_kurang', label: '📐 Ukuran Fisik Kaca Sisa Tidak Cukup' },
                                                    { id: 'tidak_ditemukan', label: '🔍 Kaca Tidak Ditemukan di Rak Storage' },
                                                    { id: 'alasan_lain', label: '💬 Alasan Lainnya (Input Teks)' },
                                                ].map(opt => (
                                                    <label key={opt.id} className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition ${rejectReasonType === opt.id ? 'bg-rose-950/60 border-rose-500 text-rose-200' : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'}`}>
                                                        <input
                                                            type="radio"
                                                            name="rejectReasonType"
                                                            value={opt.id}
                                                            checked={rejectReasonType === opt.id}
                                                            onChange={e => setRejectReasonType(e.target.value)}
                                                            className="text-rose-500 focus:ring-rose-400"
                                                        />
                                                        <span>{opt.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-slate-300 font-bold block">Catatan Penolakan (Opsional / Detail Baret):</label>
                                            <textarea
                                                rows={2}
                                                placeholder="cth: Baret di bagian tengah kaca, retak pada sudut..."
                                                value={rejectNotes}
                                                onChange={e => setRejectNotes(e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:border-rose-400 text-xs"
                                            ></textarea>
                                        </div>

                                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                                            <button
                                                type="button"
                                                onClick={() => setShowRejectModal(false)}
                                                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold cursor-pointer"
                                            >Batal</button>
                                            <button
                                                type="submit"
                                                disabled={isSubmittingReject}
                                                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer"
                                            >
                                                <span>{isSubmittingReject ? '⏳ Menyimpan...' : '❌ Tolak Kaca Sisa & Log Aktivitas'}</span>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* MODAL POPUP FORM POTONG ULANG / EDIT UKURAN KACA SISA DI RAK */}
                        {showEditScrapModal && (
                            <div className="fixed inset-0 bg-black/85 backdrop-blur-xl z-[70] flex items-center justify-center p-4 overflow-y-auto">
                                <div className="bg-slate-900 border border-amber-500/50 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 relative my-auto">
                                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                                        <h3 className="font-extrabold text-sm text-amber-400 flex items-center gap-2">
                                            <span>✂️ Potong Ulang & Edit Ukuran Scrap (Rak)</span>
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => setShowEditScrapModal(false)}
                                            className="text-slate-400 hover:text-white text-xl font-bold cursor-pointer"
                                        >&times;</button>
                                    </div>

                                    <form onSubmit={handleUpdateScrapSubmit} className="space-y-4 text-xs">
                                        {Array.isArray(scrapGlasses) && scrapGlasses.length > 0 && (
                                            <div className="space-y-1">
                                                <label className="text-slate-300 font-bold block">Pilih Kaca Sisa yang Dipotong Ulang:</label>
                                                <select
                                                    value={editScrapForm.id || ''}
                                                    onChange={(e) => {
                                                        const found = scrapGlasses.find(s => String(s.id) === String(e.target.value));
                                                        if (found) handleOpenEditScrapModal(found);
                                                    }}
                                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-amber-300 font-mono font-bold cursor-pointer"
                                                >
                                                    {scrapGlasses.map(s => (
                                                        <option key={s.id} value={s.id}>
                                                            [{s.scrap_code}] {s.glass_type} ({s.length_cm}x{s.width_cm} cm) — {s.rak_location} ({s.status})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-slate-300 font-bold block">Panjang Baru (cm):</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    required
                                                    value={editScrapForm.length_cm}
                                                    onChange={e => setEditScrapForm(f => ({ ...f, length_cm: e.target.value }))}
                                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-amber-300 font-mono font-bold"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-slate-300 font-bold block">Lebar Baru (cm):</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    required
                                                    value={editScrapForm.width_cm}
                                                    onChange={e => setEditScrapForm(f => ({ ...f, width_cm: e.target.value }))}
                                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-amber-300 font-mono font-bold"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-slate-300 font-bold block">Lokasi Rak Storage:</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={editScrapForm.rak_location}
                                                    onChange={e => setEditScrapForm(f => ({ ...f, rak_location: e.target.value }))}
                                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-mono font-bold"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-slate-300 font-bold block">Status Kondisi Kaca:</label>
                                                <select
                                                    value={editScrapForm.status}
                                                    onChange={e => setEditScrapForm(f => ({ ...f, status: e.target.value }))}
                                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-bold cursor-pointer"
                                                >
                                                    <option value="Layak Pakai">✅ Layak Pakai</option>
                                                    <option value="Baret/Cacat">⚠️ Baret / Cacat</option>
                                                    <option value="Afval/Pecah">🔴 Afval / Pecah</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-slate-300 font-bold block">Catatan Pemotongan Ulang:</label>
                                            <input
                                                type="text"
                                                placeholder="cth: Dipotong ulang karena baret pinggir..."
                                                value={editScrapForm.notes || ''}
                                                onChange={e => setEditScrapForm(f => ({ ...f, notes: e.target.value }))}
                                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                                            />
                                        </div>

                                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                                            <button
                                                type="button"
                                                onClick={() => setShowEditScrapModal(false)}
                                                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold cursor-pointer"
                                            >Batal</button>
                                            <button
                                                type="submit"
                                                disabled={isSubmittingScrapEdit}
                                                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer"
                                            >
                                                <span>{isSubmittingScrapEdit ? '⏳ Menyimpan...' : '💾 Simpan Perubahan & Log Aktivitas'}</span>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
    );
}
