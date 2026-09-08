import React from 'react';
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
    onOpenSketchLightbox = () => {}
}) {
    if (!show || !selectedExecutionOrder) return null;
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

                    </div>
                </div>
    );
}
