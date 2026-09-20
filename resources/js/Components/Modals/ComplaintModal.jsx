import React from 'react';
import { AlertTriangle, X, Minus, Plus, Send } from 'lucide-react';

export default function ComplaintModal({
    show,
    onClose,
    selectedExecutionOrder,
    userRole,
    form,
    setForm,
    onSubmit,
    onPhotoChange
}) {
    if (!show || !selectedExecutionOrder) return null;

    const rawItems = Array.isArray(selectedExecutionOrder.items) && selectedExecutionOrder.items.length > 0
        ? selectedExecutionOrder.items
        : [selectedExecutionOrder];

    const orderedItems = rawItems.map(it => ({
        glass_type: it.glass_type || selectedExecutionOrder.glass_type || 'Kaca Standard',
        width: it.width_cm ?? it.width ?? selectedExecutionOrder.width_cm ?? selectedExecutionOrder.width ?? 0,
        height: it.length_cm ?? it.height ?? it.length ?? selectedExecutionOrder.length_cm ?? selectedExecutionOrder.height ?? 0,
        thickness: it.thickness_mm ?? it.thickness ?? selectedExecutionOrder.thickness_mm ?? selectedExecutionOrder.thickness ?? 5,
        quantity: it.qty ?? it.quantity ?? selectedExecutionOrder.qty ?? selectedExecutionOrder.quantity ?? 1,
    }));

    const defectiveList = form.defectiveItems || [];

    const handleQtyChange = (idx, newQty, maxQty) => {
        const itemMax = parseInt(maxQty) > 0 ? parseInt(maxQty) : 9999;
        const parsed = parseInt(newQty);
        const clamped = isNaN(parsed) ? 0 : Math.max(0, Math.min(itemMax, parsed));

        const updated = [...defectiveList];
        const item = orderedItems[idx] || {};

        updated[idx] = {
            item_index: idx,
            glass_type: item.glass_type || 'Kaca Standard',
            width: item.width || 0,
            height: item.height || 0,
            thickness: item.thickness || 5,
            quantity: item.quantity || 1,
            qty_defective: clamped,
        };

        setForm(prev => ({ ...prev, defectiveItems: updated }));
    };

    const totalDefectiveSheets = defectiveList.reduce((acc, curr) => acc + (curr?.qty_defective || 0), 0);

    return (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 max-w-xl w-full space-y-4 shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto text-slate-800">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3.5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-base">Laporkan Kaca Cacat / Baret</h3>
                            <p className="text-xs text-slate-500 font-mono">SPO #{selectedExecutionOrder.spo_number} — Divisi {(userRole || '').replace('divisi_', '').toUpperCase()}</p>
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

                <form onSubmit={onSubmit} className="space-y-4 text-xs">
                    {/* SECTION 1: PEMILIHAN KACA BACET / CACAT PER ITEM & JUMLAH LEMBAR */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>Pilih Kaca Bermasalah & Jumlah Lembar Rusak:</span>
                            </label>
                            <span className="text-[11px] text-slate-500 font-mono">
                                Total Cacat: <strong className="text-rose-600 font-bold">{totalDefectiveSheets} Lembar</strong>
                            </span>
                        </div>

                        <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                            {orderedItems.map((item, idx) => {
                                const currentDef = defectiveList[idx] || { qty_defective: 0 };
                                const qtyDef = currentDef.qty_defective || 0;
                                const isDefective = qtyDef > 0;

                                return (
                                    <div 
                                        key={idx}
                                        className={`p-3 rounded-2xl border transition space-y-2 ${
                                            isDefective 
                                                ? 'bg-rose-50/70 border-rose-300 shadow-xs' 
                                                : 'bg-slate-50 border-slate-200'
                                        }`}
                                    >
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                            <div>
                                                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                                    <span>#{idx + 1}. {item.glass_type}</span>
                                                    {isDefective && (
                                                        <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md font-mono">
                                                            {qtyDef} Lembar Baret
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                                                    Ukuran: <span className="text-slate-800 font-bold">{item.height} × {item.width} cm</span> | Tebal: <span className="text-amber-700 font-bold">{item.thickness} mm</span> | Total Pesanan: <span className="text-[#1b68b0] font-bold">{item.quantity} Pcs</span>
                                                </div>
                                            </div>

                                            {/* STEPPER COUNTER UNTUK JUMLAH LEMBAR BARET */}
                                            <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl self-end sm:self-center shadow-xs">
                                                <button
                                                    type="button"
                                                    onClick={() => handleQtyChange(idx, qtyDef - 1, item.quantity)}
                                                    className="w-7 h-7 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold rounded-lg flex items-center justify-center transition cursor-pointer select-none"
                                                    title="Kurangi lembar baret"
                                                >
                                                    <Minus className="w-3.5 h-3.5 text-slate-600" />
                                                </button>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={item.quantity}
                                                    value={qtyDef}
                                                    onChange={(e) => handleQtyChange(idx, e.target.value, item.quantity)}
                                                    className="w-10 bg-slate-50 border border-slate-200 text-rose-700 font-black font-mono text-center rounded-lg text-xs py-1 focus:outline-none focus:border-rose-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleQtyChange(idx, qtyDef + 1, item.quantity)}
                                                    className="w-7 h-7 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold rounded-lg flex items-center justify-center transition cursor-pointer select-none"
                                                    title="Tambah lembar baret"
                                                >
                                                    <Plus className="w-3.5 h-3.5 text-slate-600" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                        <label className="text-xs font-bold text-slate-700">Pilih Alasan Kendala / Cacat Kaca:</label>
                        <select
                            value={form.reason}
                            onChange={(e) => setForm({...form, reason: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-rose-400 focus:bg-white"
                        >
                            <option value="Kaca Baret / Gores">Kaca Baret / Gores (Scratch)</option>
                            <option value="Kaca Retak / Pecah">Kaca Retak / Pecah (Cracked/Broken)</option>
                            <option value="Cacat Pabrik / Gelembung">Cacat Pabrik / Gelembung / Flek</option>
                            <option value="Miskomunikasi Ukuran / Salah Potong HT">Miskomunikasi Ukuran / Salah Potong HT</option>
                            <option value="Kendala Lainnya">Kendala Lainnya</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Catatan & Detail Keluhan:</label>
                        <textarea
                            required
                            rows={2}
                            value={form.notes}
                            onChange={(e) => setForm({...form, notes: e.target.value})}
                            placeholder="Jelaskan detail baret/cacat atau kronologi singkat..."
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-3 text-xs focus:border-rose-400 focus:bg-white font-mono"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Foto Bukti Kaca Cacat / Baret (Opsional):</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={onPhotoChange}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl p-2 text-xs file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-rose-100 file:text-rose-700 hover:file:bg-rose-200 cursor-pointer"
                        />
                        {form.photoPreview && (
                            <div className="mt-2 relative rounded-2xl overflow-hidden border border-slate-200 max-h-36">
                                <img src={form.photoPreview} alt="Preview Bukti" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>

                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-[11px] text-amber-900 space-y-0.5">
                        <span className="font-bold block text-amber-800">Workflow Laporan Kaca Cacat ke Admin Gudang:</span>
                        <p>Laporan berisi rincian item & lembar cacat ini akan dikirim ke <strong>Admin Gudang</strong>. Status orderan berubah menjadi <strong>Pending Gudang</strong>. Jika disetujui ganti barang, orderan akan diproses ulang oleh Admin Gudang.</p>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition cursor-pointer text-xs"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center gap-2 cursor-pointer"
                        >
                            <Send className="w-4 h-4" />
                            <span>Kirim Laporan ke Admin Gudang</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
