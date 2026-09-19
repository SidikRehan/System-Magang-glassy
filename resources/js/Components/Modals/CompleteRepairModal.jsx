import React, { useState } from 'react';
import { CheckCircle2, X, Check } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function CompleteRepairModal({
    show,
    onClose,
    selectedRepairTool,
    onSuccess
}) {
    if (!show || !selectedRepairTool) return null;

    const [form, setForm] = useState({
        condition: 'Baik',
        notes: ''
    });
    const [actionTaken, setActionTaken] = useState('');
    const [repairCost, setRepairCost] = useState('');
    const [technicianName, setTechnicianName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();

        const combinedNotes = `[Selesai Servis: ${new Date().toISOString().split('T')[0]}] Tindakan: ${actionTaken || '-'}. Teknisi: ${technicianName || '-'}. Biaya: Rp ${repairCost || 0}`;

        setIsSubmitting(true);
        router.post(route('inventory.tools.repair', selectedRepairTool.id), {
            condition: 'Baik',
            notes: combinedNotes
        }, {
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
                        <div className="w-10 h-10 rounded-2xl bg-[#70b03c]/10 flex items-center justify-center text-[#5f9733]">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#242222] text-base">
                                Form Detail Perbaikan Selesai
                            </h3>
                            <p className="text-xs text-slate-500 font-mono">{selectedRepairTool.tool_code} - {selectedRepairTool.name}</p>
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
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                        <div>
                            <label className="text-[#1b68b0] font-bold block mb-1">Tindakan Perbaikan Yang Dilakukan:*</label>
                            <textarea
                                rows="2"
                                required
                                placeholder="Contoh: Pembersihan motor rotor, penyetelan presisi & penggantian sparepart"
                                value={actionTaken}
                                onChange={e => setActionTaken(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium focus:border-[#1b68b0]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-slate-700 font-bold block mb-1">Biaya Servis / Sparepart (Rp):</label>
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="e.g. 75000"
                                    value={repairCost}
                                    onChange={e => setRepairCost(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-amber-700 font-mono font-bold focus:border-amber-500"
                                />
                            </div>
                            <div>
                                <label className="text-slate-700 font-bold block mb-1">Teknisi / Tempat Servis:</label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Bengkel Teknik Maju"
                                    value={technicianName}
                                    onChange={e => setTechnicianName(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-800 font-semibold focus:border-[#1b68b0]"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-[11px] text-emerald-900">
                        <span className="font-bold block mb-0.5">Konfirmasi Perbaikan:</span>
                        <p>Setelah disimpan, status kondisi alat akan berubah menjadi <strong>Baik</strong> dan unit siap dipinjamkan kembali.</p>
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
                            <span>{isSubmitting ? 'Menyimpan...' : 'Simpan & Siapkan Alat'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
