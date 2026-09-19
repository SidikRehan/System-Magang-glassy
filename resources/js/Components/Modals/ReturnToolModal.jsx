import React, { useState } from 'react';
import { RotateCcw, X, Check } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function ReturnToolModal({
    show,
    onClose,
    selectedReturnBorrow,
    onSuccess
}) {
    if (!show || !selectedReturnBorrow) return null;

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();

        setIsSubmitting(true);
        router.post(route('inventory.tools.return', selectedReturnBorrow.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
                if (onSuccess) onSuccess();
                onClose();
            },
            onError: () => {
                setIsSubmitting(false);
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-800">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3.5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-[#1b68b0]/10 flex items-center justify-center text-[#1b68b0]">
                            <RotateCcw className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#242222] text-base">
                                Konfirmasi Pengembalian Alat
                            </h3>
                            <p className="text-xs text-slate-500 font-mono">Verifikasi alat yang telah dikembalikan oleh teknisi</p>
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
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-medium">Peminjam / Teknisi:</span>
                            <span className="font-bold text-[#1b68b0]">{selectedReturnBorrow.borrower_name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-medium">Nama Alat:</span>
                            <span className="font-bold text-slate-800">{selectedReturnBorrow.tool?.name || selectedReturnBorrow.tool_name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-medium">Jumlah Dipinjam:</span>
                            <span className="font-mono text-amber-700 font-bold">{selectedReturnBorrow.qty} Unit</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                            <span className="text-slate-500">Tanggal Pinjam:</span>
                            <span className="font-mono text-slate-700">{selectedReturnBorrow.borrow_date ? new Date(selectedReturnBorrow.borrow_date).toLocaleDateString('id-ID') : '-'}</span>
                        </div>
                        {selectedReturnBorrow.notes && (
                            <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                                <span className="text-slate-500">Catatan:</span>
                                <span className="text-slate-700">{selectedReturnBorrow.notes}</span>
                            </div>
                        )}
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl text-[11px] text-emerald-900">
                        <span className="font-bold block mb-0.5">Konfirmasi Pengembalian:</span>
                        <p>Setelah diverifikasi, ketersediaan unit alat di katalog akan bertambah kembali secara otomatis.</p>
                    </div>

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
                </form>
            </div>
        </div>
    );
}
