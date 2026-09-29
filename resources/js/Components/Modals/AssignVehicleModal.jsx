import React, { useState } from 'react';
import { Truck, User, X, Send, MapPin, Loader2, FileText, Calendar } from 'lucide-react';

export default function AssignVehicleModal({
    show,
    onClose,
    order,
    driver,
    setDriver,
    vehicle,
    setVehicle,
    deliveryDate,
    setDeliveryDate,
    notes,
    setNotes,
    handleSubmit,
    isSubmitting = false
}) {

    if (!show || !order) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl space-y-4 text-slate-800 relative overflow-hidden">
                {/* LOADING BLUR OVERLAY FOR SMOOTH SUBMISSION */}
                {isSubmitting && (
                    <div className="absolute inset-0 bg-white/85 backdrop-blur-xs z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
                        <div className="bg-white p-5 rounded-3xl shadow-2xl border border-slate-200 flex flex-col items-center gap-3 max-w-xs">
                            <div className="w-12 h-12 rounded-2xl bg-[#1b68b0]/10 flex items-center justify-center text-[#1b68b0]">
                                <Loader2 className="w-6 h-6 animate-spin text-[#1b68b0]" />
                            </div>
                            <div>
                                <h4 className="font-bold text-[#242222] text-sm flex items-center gap-1.5 justify-center">
                                    <Truck className="w-4 h-4 text-[#1b68b0] animate-bounce" />
                                    <span>Menugaskan Armada...</span>
                                </h4>
                                <p className="text-xs text-slate-500 font-mono mt-1">
                                    Menyimpan alokasi pengiriman SPO #{order?.spo_number}.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                {/* MODAL HEADER */}
                <div className="flex justify-between items-center border-b border-slate-200 pb-3.5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-[#1b68b0]/10 flex items-center justify-center text-[#1b68b0]">
                            <Truck className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#242222] text-base">
                                Form Penugasan Mobil Armada
                            </h3>
                            <p className="text-xs text-slate-500 font-mono">Order SPO #{order.spo_number}</p>
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

                {/* ORDER INFO CARD */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-2">
                    <div className="flex justify-between items-start">
                        <div className="text-[#1b68b0] font-extrabold text-xs">
                            SPO: {order.spo_number}
                        </div>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md font-mono border border-emerald-200">
                            {order.customer_name}
                        </span>
                    </div>

                    <div className="text-slate-600 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{order.customer_address || 'Alamat Lokasi Pengiriman'}</span>
                    </div>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                    <div>
                        <label className="text-slate-700 font-bold flex items-center gap-1.5 mb-1">
                            <Calendar className="w-3.5 h-3.5 text-[#1b68b0]" />
                            <span>Tanggal Pengiriman:</span>
                        </label>
                        <input 
                            type="date"
                            value={deliveryDate || ''} 
                            onChange={e => setDeliveryDate(e.target.value)} 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-[#1b68b0] focus:bg-white cursor-pointer"
                        />
                    </div>

                    <div>
                        <label className="text-slate-700 block mb-1 font-bold">Pilih Supir / Driver Armada:</label>
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
                        <label className="text-slate-700 block mb-1 font-bold">Pilih Jenis & No. Plat Mobil:</label>
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

                    <div>
                        <label className="text-slate-700 font-bold text-xs flex items-center justify-between mb-1">
                            <span className="flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-[#1b68b0]" />
                                <span>Catatan & Barang Penunjang Gudang: <span className="text-rose-500 font-black">*</span></span>
                            </span>
                            <span className="text-[10px] bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded-md font-bold">
                                WAJIB DIISI
                            </span>
                        </label>
                        <textarea 
                            rows={2}
                            required
                            value={notes} 
                            onChange={e => setNotes(e.target.value)} 
                            placeholder="cth: Dahulukan pengantaran sebelum jam 12, bawa 2 pcs Kop Kaca dari gudang B..." 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:border-[#1b68b0] focus:bg-white text-xs font-medium" 
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
                            disabled={!notes?.trim() || isSubmitting}
                            className={`px-5 py-2.5 font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition ${
                                notes?.trim() && !isSubmitting 
                                    ? 'bg-[#1b68b0] hover:bg-[#15528c] text-white cursor-pointer' 
                                    : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                            }`}
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Send className="w-3.5 h-3.5" />
                            )}
                            <span>{isSubmitting ? 'Memproses...' : 'Simpan Penugasan Mobil'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
