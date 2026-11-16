import React, { useState, useEffect } from 'react';
import { RotateCcw, X, Check, CheckCircle2, AlertTriangle, XCircle, FileText, Wrench } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function ReturnToolModal({
    show,
    onClose,
    selectedReturnBorrow,
    onSuccess
}) {
    const [returnCondition, setReturnCondition] = useState('Baik');
    const [damagedQty, setDamagedQty] = useState(0);
    const [lostQty, setLostQty] = useState(0);
    const [returnNotes, setReturnNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (selectedReturnBorrow && show) {
            const totalBorrowed = Math.max(1, Number(selectedReturnBorrow.qty ?? selectedReturnBorrow.qty_borrowed ?? 1));
            const initialCond = selectedReturnBorrow.return_condition || 'Baik';
            const initialDmg = Number(selectedReturnBorrow.damaged_qty) || 0;
            const initialLost = Number(selectedReturnBorrow.lost_qty) || 0;

            setReturnCondition(initialCond);
            setDamagedQty(initialDmg > 0 ? initialDmg : (initialCond === 'Rusak' || initialCond === 'Perlu Servis' ? totalBorrowed : 0));
            setLostQty(initialLost > 0 ? initialLost : (initialCond === 'Hilang' ? totalBorrowed : 0));
            setReturnNotes(selectedReturnBorrow.return_notes || '');
            setErrorMsg('');
            setIsSubmitting(false);
        }
    }, [selectedReturnBorrow, show]);

    if (!show || !selectedReturnBorrow) return null;

    const isAlreadyReturned = selectedReturnBorrow.status === 'Dikembalikan' || selectedReturnBorrow.status === 'Sudah Dikembalikan';
    const totalBorrowedQty = Math.max(1, Number(selectedReturnBorrow.qty ?? selectedReturnBorrow.qty_borrowed ?? 1));

    const handleConditionSelect = (cond) => {
        setReturnCondition(cond);
        setErrorMsg('');
        if (cond === 'Baik') {
            setDamagedQty(0);
            setLostQty(0);
        } else if (cond === 'Rusak' || cond === 'Perlu Servis') {
            setDamagedQty(prev => (prev > 0 && prev <= totalBorrowedQty ? prev : 1));
            setLostQty(0);
        } else if (cond === 'Hilang') {
            setLostQty(prev => (prev > 0 && prev <= totalBorrowedQty ? prev : 1));
            setDamagedQty(0);
        }
    };

    const handleDamagedChange = (val) => {
        const num = Math.max(0, Math.min(totalBorrowedQty, parseInt(val) || 0));
        setDamagedQty(num);
        if (num + lostQty > totalBorrowedQty) {
            setLostQty(Math.max(0, totalBorrowedQty - num));
        }
    };

    const handleLostChange = (val) => {
        const num = Math.max(0, Math.min(totalBorrowedQty, parseInt(val) || 0));
        setLostQty(num);
        if (damagedQty + num > totalBorrowedQty) {
            setDamagedQty(Math.max(0, totalBorrowedQty - num));
        }
    };

    const effectiveDamaged = returnCondition === 'Baik' ? 0 : damagedQty;
    const effectiveLost = returnCondition === 'Baik' ? 0 : lostQty;
    const goodReturnedQty = Math.max(0, totalBorrowedQty - effectiveDamaged - effectiveLost);
    const hasProblem = returnCondition !== 'Baik' || effectiveDamaged > 0 || effectiveLost > 0;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isAlreadyReturned) {
            onClose();
            return;
        }

        if (hasProblem && !returnNotes.trim()) {
            setErrorMsg('Mohon isi catatan kronologi kerusakan atau kehilangan alat sebagai arsip riwayat!');
            return;
        }

        setIsSubmitting(true);
        setErrorMsg('');

        router.post(route('inventory.tools.return', selectedReturnBorrow.id), {
            return_condition: returnCondition,
            damaged_qty: effectiveDamaged,
            lost_qty: effectiveLost,
            return_notes: returnNotes.trim() || null,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
                if (onSuccess) onSuccess();
                onClose();
            },
            onError: () => {
                setIsSubmitting(false);
                setErrorMsg('Gagal memproses pengembalian alat. Silakan periksa kembali data input.');
            }
        });
    };

    const formatDisplayDate = (dateVal) => {
        if (!dateVal) return '-';
        const d = new Date(dateVal);
        return isNaN(d.getTime()) ? String(dateVal) : d.toLocaleDateString('id-ID');
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-800">
                {/* HEADER MODAL */}
                <div className="flex justify-between items-center border-b border-slate-200 pb-3.5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-[#1b68b0]/10 flex items-center justify-center text-[#1b68b0]">
                            <RotateCcw className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#242222] text-base">
                                {isAlreadyReturned ? 'Detail Riwayat Pengembalian Alat' : 'Konfirmasi Pengembalian Alat'}
                            </h3>
                            <p className="text-xs text-slate-500 font-mono">
                                {isAlreadyReturned
                                    ? 'Arsip kondisi fisik & catatan pengembalian alat teknisi'
                                    : 'Verifikasi kondisi fisik alat yang dikembalikan oleh teknisi'}
                            </p>
                        </div>
                    </div>
                    <button 
                        type="button"
                        onClick={onClose} 
                        className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl p-1.5 transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    {/* INFO PEMINJAMAN */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-medium">Peminjam / Teknisi:</span>
                            <span className="font-bold text-[#1b68b0]">{selectedReturnBorrow.borrower_name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-medium">Nama Alat:</span>
                            <span className="font-bold text-slate-800 text-right">{selectedReturnBorrow.tool?.name || selectedReturnBorrow.tool_name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-medium">Jumlah Dipinjam:</span>
                            <span className="font-mono text-amber-700 font-bold">{totalBorrowedQty} Unit</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                            <span className="text-slate-500">Tanggal Pinjam:</span>
                            <span className="font-mono text-slate-700">{formatDisplayDate(selectedReturnBorrow.borrow_date)}</span>
                        </div>
                        {isAlreadyReturned && (
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Tanggal Dikembalikan:</span>
                                <span className="font-mono font-bold text-emerald-700">{formatDisplayDate(selectedReturnBorrow.return_date || selectedReturnBorrow.actual_return)}</span>
                            </div>
                        )}
                        {(selectedReturnBorrow.notes || selectedReturnBorrow.purpose) && (
                            <div className="flex justify-between items-start gap-3 border-t border-slate-200 pt-2">
                                <span className="text-slate-500 shrink-0">Catatan Pinjam:</span>
                                <span className="text-slate-700 text-right">{selectedReturnBorrow.notes || selectedReturnBorrow.purpose}</span>
                            </div>
                        )}
                    </div>

                    {isAlreadyReturned ? (
                        /* TAMPILAN RIWAYAT JIKA SUDAH DIKEMBALIKAN */
                        <div className="space-y-3">
                            <div className={`p-4 rounded-2xl border space-y-2 ${
                                selectedReturnBorrow.return_condition === 'Hilang' || (Number(selectedReturnBorrow.lost_qty) || 0) > 0
                                    ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                                    : selectedReturnBorrow.return_condition === 'Rusak' || selectedReturnBorrow.return_condition === 'Perlu Servis' || (Number(selectedReturnBorrow.damaged_qty) || 0) > 0
                                        ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                                        : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                            }`}>
                                <div className="flex items-center justify-between">
                                    <span className="font-bold">Status Kondisi Saat Dikembalikan:</span>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                        selectedReturnBorrow.return_condition === 'Hilang'
                                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                                            : selectedReturnBorrow.return_condition === 'Rusak' || selectedReturnBorrow.return_condition === 'Perlu Servis'
                                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    }`}>
                                        {selectedReturnBorrow.return_condition || 'Baik'}
                                    </span>
                                </div>
                                {((Number(selectedReturnBorrow.damaged_qty) || 0) > 0 || (Number(selectedReturnBorrow.lost_qty) || 0) > 0) && (
                                    <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
                                        {(Number(selectedReturnBorrow.damaged_qty) || 0) > 0 && (
                                            <span className="bg-white/80 px-2.5 py-1 rounded-lg border border-amber-300 font-bold text-amber-800">
                                                Unit Rusak / Servis: {selectedReturnBorrow.damaged_qty} Unit
                                            </span>
                                        )}
                                        {(Number(selectedReturnBorrow.lost_qty) || 0) > 0 && (
                                            <span className="bg-white/80 px-2.5 py-1 rounded-lg border border-rose-300 font-bold text-rose-700">
                                                Unit Hilang: {selectedReturnBorrow.lost_qty} Unit
                                            </span>
                                        )}
                                    </div>
                                )}
                                {selectedReturnBorrow.return_notes && (
                                    <div className="pt-2 border-t border-black/10 text-xs">
                                        <span className="font-bold block mb-0.5">Kronologi / Catatan Pengembalian:</span>
                                        <p className="italic">"{selectedReturnBorrow.return_notes}"</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end pt-2 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="bg-[#1b68b0] hover:bg-[#15528c] text-white font-bold px-5 py-2.5 rounded-xl transition text-xs cursor-pointer"
                                >
                                    Tutup Detail
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* FORM INPUT KONDISI PENGEMBALIAN BARU */
                        <>
                            <div>
                                <label className="text-slate-700 font-bold block mb-2">
                                    Kondisi Fisik Alat Saat Dikembalikan: <span className="text-rose-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {[
                                        { id: 'Baik', label: 'Baik / Normal', icon: CheckCircle2, activeCls: 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/15' },
                                        { id: 'Perlu Servis', label: 'Perlu Servis', icon: Wrench, activeCls: 'bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-500/15' },
                                        { id: 'Rusak', label: 'Rusak', icon: AlertTriangle, activeCls: 'bg-orange-50 border-orange-500 text-orange-800 ring-2 ring-orange-500/15' },
                                        { id: 'Hilang', label: 'Hilang', icon: XCircle, activeCls: 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-500/15' },
                                    ].map(opt => {
                                        const Icon = opt.icon;
                                        const isSelected = returnCondition === opt.id;
                                        return (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => handleConditionSelect(opt.id)}
                                                className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                                                    isSelected
                                                        ? `${opt.activeCls} font-bold`
                                                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold'
                                                }`}
                                            >
                                                <Icon className="w-4 h-4" />
                                                <span className="text-[11px] leading-tight">{opt.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* RINCIAN JUMLAH UNIT RUSAK / HILANG JIKA TIDAK BAIK */}
                            {returnCondition !== 'Baik' && (
                                <div className={`p-3.5 rounded-2xl border space-y-3 animate-in fade-in duration-150 ${
                                    returnCondition === 'Hilang' ? 'bg-rose-50/70 border-rose-200' : 'bg-amber-50/80 border-amber-200'
                                }`}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {(returnCondition === 'Rusak' || returnCondition === 'Perlu Servis') && (
                                            <div>
                                                <label className="text-slate-700 font-bold block mb-1">
                                                    Jumlah Unit {returnCondition}:
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={totalBorrowedQty}
                                                    value={damagedQty}
                                                    onChange={e => handleDamagedChange(e.target.value)}
                                                    className="w-full bg-white border border-amber-300 rounded-xl p-2 text-slate-800 font-mono font-bold focus:border-[#1b68b0] focus:outline-none"
                                                />
                                            </div>
                                        )}

                                        {returnCondition === 'Hilang' && (
                                            <div>
                                                <label className="text-slate-700 font-bold block mb-1">
                                                    Jumlah Unit Hilang:
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={totalBorrowedQty}
                                                    value={lostQty}
                                                    onChange={e => handleLostChange(e.target.value)}
                                                    className="w-full bg-white border border-rose-300 rounded-xl p-2 text-slate-800 font-mono font-bold focus:border-[#1b68b0] focus:outline-none"
                                                />
                                            </div>
                                        )}

                                        <div className="flex flex-col justify-center bg-white/80 p-2.5 rounded-xl border border-slate-200/80 text-[11px] space-y-1 font-mono">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Kembali Baik (Siap Pakai):</span>
                                                <strong className="text-emerald-700">{goodReturnedQty} Unit</strong>
                                            </div>
                                            {effectiveDamaged > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-amber-700">Masuk Log {returnCondition}:</span>
                                                    <strong className="text-amber-800">{effectiveDamaged} Unit</strong>
                                                </div>
                                            )}
                                            {effectiveLost > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-rose-600">Tercatat Hilang:</span>
                                                    <strong className="text-rose-700">{effectiveLost} Unit</strong>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* CATATAN KRONOLOGI PENGEMBALIAN / KERUSAKAN / KEHILANGAN */}
                            <div>
                                <label className="text-slate-700 font-bold block mb-1 flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5 text-[#1b68b0]" />
                                    <span>
                                        {hasProblem
                                            ? 'Kronologi Kerusakan / Kehilangan Alat (Wajib Diisi): *'
                                            : 'Catatan Kondisi Pengembalian (Opsional):'}
                                    </span>
                                </label>
                                <textarea
                                    rows="2"
                                    required={hasProblem}
                                    value={returnNotes}
                                    onChange={e => { setReturnNotes(e.target.value); setErrorMsg(''); }}
                                    placeholder={
                                        hasProblem
                                            ? 'Contoh: Mata bor patah saat pengeboran kaca tempered 12mm / Alat tertinggal di lokasi proyek Dago'
                                            : 'Contoh: Dikembalikan lengkap dalam kondisi bersih dan berfungsi normal'
                                    }
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:border-[#1b68b0] focus:bg-white focus:outline-none"
                                />
                            </div>

                            {/* INFO BOX OTOMATIS UPDATE KATALOG & LOG PERBAIKAN */}
                            <div className={`p-3.5 rounded-2xl border text-[11px] ${
                                hasProblem
                                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                            }`}>
                                <span className="font-bold block mb-0.5">
                                    {hasProblem ? 'Update Otomatis Kondisi & Riwayat Alat:' : 'Konfirmasi Pengembalian Normal:'}
                                </span>
                                <p>
                                    {hasProblem
                                        ? `Status kondisi alat di Katalog akan langsung diperbarui menjadi "${returnCondition}" dan kronologi ini otomatis masuk ke tab Log Perbaikan & Hilang.`
                                        : 'Setelah diverifikasi, ketersediaan unit alat di katalog akan bertambah kembali secara otomatis.'}
                                </p>
                            </div>

                            {errorMsg && (
                                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                                    <span>{errorMsg}</span>
                                </div>
                            )}

                            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl transition text-xs cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-[#70b03c] hover:bg-[#5f9733] text-white font-bold px-5 py-2.5 rounded-xl transition shadow-xs flex items-center gap-1.5 text-xs cursor-pointer disabled:opacity-50"
                                >
                                    <Check className="w-4 h-4" />
                                    <span>{isSubmitting ? 'Memproses...' : 'Konfirmasi Pengembalian'}</span>
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
}
