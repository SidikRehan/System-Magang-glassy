import React, { useState } from 'react';
import { Truck, User, X, Send, MapPin, Loader2, Edit3, Package, FileText, Plus, Wrench, Check } from 'lucide-react';

export default function EditTripModal({
    show,
    onClose,
    trip,
    driver,
    setDriver,
    vehicle,
    setVehicle,
    notes,
    setNotes,
    handleSubmit,
    isSubmitting = false
}) {
    const [showNotesHelper, setShowNotesHelper] = useState(false);

    const WAREHOUSE_EQUIPMENT_PRESETS = [
        'Kop Vacuum Lifter Kaca (2 Pcs)',
        'Tangga Alumunium Lipat',
        'Lem Sealant & Gun Applicator',
        'Gabus & Corner Protector Kaca',
        'Sabuk Klem / Tali Ratchet Armada',
        'Sarung Tangan Safety Anti-Potong',
        'Siku Ukur & Meteran Lapangan',
        'Terpal Hujan & Matras Karet Bak',
        'Set Kunci & Obeng Pasang'
    ];

    if (!show || !trip) return null;

    const orders = trip.orders || [];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 text-slate-800 relative overflow-hidden">
                {/* LOADING BLUR OVERLAY FOR SMOOTH SUBMISSION */}
                {isSubmitting && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-xs z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
                        <div className="bg-white p-5 rounded-3xl shadow-2xl border border-slate-200 flex flex-col items-center gap-3 max-w-xs">
                            <div className="w-12 h-12 rounded-2xl bg-[#1b68b0]/10 flex items-center justify-center text-[#1b68b0]">
                                <Loader2 className="w-6 h-6 animate-spin text-[#1b68b0]" />
                            </div>
                            <div>
                                <h4 className="font-bold text-[#242222] text-sm">
                                    Memperbarui Trip Armada...
                                </h4>
                                <p className="text-xs text-slate-500 font-mono mt-1">
                                    Mengunggah alokasi supir & kendaraan baru.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL HEADER */}
                <div className="flex justify-between items-center border-b border-slate-200 pb-3.5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                            <Edit3 className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#242222] text-base flex items-center gap-2">
                                Edit Penugasan Trip Armada
                            </h3>
                            <p className="text-xs text-[#1b68b0] font-mono font-bold">
                                {trip.trip_code} ({orders.length} Alamat Tujuan)
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

                {/* TRIP ORDERS SUMMARY */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-2 max-h-36 overflow-y-auto">
                    <div className="font-bold text-slate-700 text-xs flex items-center justify-between">
                        <span>Daftar Order SPO Dalam Trip Ini ({orders.length}):</span>
                    </div>
                    <div className="space-y-1.5">
                        {orders.map((ord, idx) => (
                            <div key={ord.id || idx} className="flex justify-between items-center bg-white p-2 rounded-xl border border-slate-200">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="bg-[#1b68b0]/10 text-[#1b68b0] font-mono font-bold text-[10px] px-1.5 py-0.5 rounded">
                                        #{idx + 1}
                                    </span>
                                    <span className="font-bold text-[#242222] truncate text-xs">
                                        SPO-{ord.spo_number} ({ord.customer_name})
                                    </span>
                                </div>
                                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold shrink-0 ${
                                    ord.payment_status === 'Lunas' 
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}>
                                    {ord.payment_status === 'Lunas' ? 'LUNAS' : 'COD'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                    <div>
                        <label className="text-slate-700 block mb-1 font-bold">Driver / Supir Armada Baru:</label>
                        <select 
                            value={driver} 
                            onChange={e => setDriver(e.target.value)} 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-[#1b68b0] focus:bg-white cursor-pointer"
                        >
                            <option value="Pak Budi (Supir Utama DC)">Pak Budi (Supir Utama DC)</option>
                            <option value="Pak Mulyadi (Driver Engkel)">Pak Mulyadi (Driver Engkel)</option>
                            <option value="Pak Asep (Driver L300)">Pak Asep (Driver Pick Up)</option>
                            <option value="Pak Hendra (Driver Subcon)">Pak Hendra (Driver Subcon)</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-slate-700 block mb-1 font-bold">Jenis & No. Plat Mobil Baru:</label>
                        <select 
                            value={vehicle} 
                            onChange={e => setVehicle(e.target.value)} 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-[#1b68b0] focus:bg-white cursor-pointer"
                        >
                            <option value="Engkel Box (D 8472 AB)">Engkel Box (D 8472 AB)</option>
                            <option value="Pick Up L300 (D 8192 XY)">Pick Up L300 (D 8192 XY)</option>
                            <option value="Truck Engkel Long (D 8011 GH)">Truck Engkel Long (D 8011 GH)</option>
                            <option value="Armada Subcon (B 9920 FK)">Armada Subcon (B 9920 FK)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-slate-700 font-bold flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-[#1b68b0]" />
                                <span>Catatan & Alat Penunjang Gudang:</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowNotesHelper(!showNotesHelper)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                                    showNotesHelper || notes
                                        ? 'bg-[#1b68b0] text-white shadow-2xs'
                                        : 'bg-[#1b68b0]/10 hover:bg-[#1b68b0]/20 text-[#1b68b0] border border-[#1b68b0]/20'
                                }`}
                            >
                                <Plus className="w-3 h-3" />
                                <span>+ Catatan Pengiriman</span>
                            </button>
                        </div>

                        {(showNotesHelper || notes) && (
                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-2 animate-in fade-in duration-150">
                                <div className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                                    <span className="flex items-center gap-1">
                                        <Wrench className="w-3 h-3 text-[#1b68b0]" />
                                        <span>Alat Penunjang Gudang Harus Dibawa:</span>
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {WAREHOUSE_EQUIPMENT_PRESETS.map((preset, idx) => {
                                        const isAdded = (notes || '').includes(preset);
                                        return (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => {
                                                    const current = notes || '';
                                                    if (isAdded) {
                                                        const updated = current
                                                            .split(/,\s*/)
                                                            .filter(item => item !== preset && item !== `Perlu Bawa Gudang: ${preset}`)
                                                            .join(', ');
                                                        setNotes(updated);
                                                    } else {
                                                        if (!current || current.trim() === '') {
                                                            setNotes(`Perlu Bawa Gudang: ${preset}`);
                                                        } else {
                                                            setNotes(`${current}, ${preset}`);
                                                        }
                                                    }
                                                }}
                                                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer border ${
                                                    isAdded
                                                        ? 'bg-[#1b68b0] text-white border-[#1b68b0]'
                                                        : 'bg-white hover:bg-blue-50 text-slate-700 hover:text-[#1b68b0] border-slate-200'
                                                }`}
                                            >
                                                {isAdded ? <Check className="w-3 h-3 text-white" /> : <Plus className="w-3 h-3 text-slate-400" />}
                                                <span>{preset}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <textarea 
                            rows={2}
                            value={notes} 
                            onChange={e => setNotes(e.target.value)} 
                            placeholder="cth: Dahulukan pengantaran sebelum jam 12, bawa 2 pcs Kop Kaca dari gudang B..." 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:border-[#1b68b0] focus:bg-white text-xs" 
                        />
                    </div>

                    {/* ACTIONS */}
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-semibold cursor-pointer"
                        >
                            Batal
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className={`px-5 py-2.5 font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition ${
                                isSubmitting 
                                    ? 'bg-[#1b68b0]/70 text-white cursor-not-allowed' 
                                    : 'bg-[#1b68b0] hover:bg-[#15528c] text-white cursor-pointer'
                            }`}
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Send className="w-3.5 h-3.5" />
                            )}
                            <span>{isSubmitting ? 'Memproses...' : 'Simpan Perubahan Trip'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
