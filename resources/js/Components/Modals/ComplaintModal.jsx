import React from 'react';

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

    const orderedItems = Array.isArray(selectedExecutionOrder.items) && selectedExecutionOrder.items.length > 0
        ? selectedExecutionOrder.items
        : [{
            glass_type: selectedExecutionOrder.glass_type || 'Kaca Standard',
            width: selectedExecutionOrder.width || 0,
            height: selectedExecutionOrder.height || 0,
            thickness: selectedExecutionOrder.thickness || 5,
            quantity: selectedExecutionOrder.quantity || 1,
        }];

    const defectiveList = form.defectiveItems || [];

    const handleQtyChange = (idx, newQty, maxQty) => {
        const clamped = Math.max(0, Math.min(maxQty, parseInt(newQty) || 0));
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

        setForm({ ...form, defectiveItems: updated });
    };

    const totalDefectiveSheets = defectiveList.reduce((acc, curr) => acc + (curr.qty_defective || 0), 0);

    return (
        <div className="fixed inset-0 z-[70] bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 sm:p-7 max-w-xl w-full space-y-5 shadow-[0_0_50px_rgba(244,63,94,0.18)] relative my-auto max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3.5">
                    <div className="flex items-center gap-2.5">
                        <span className="text-2xl">⚠️</span>
                        <div>
                            <h3 className="font-extrabold text-white text-base">Laporkan Kaca Cacat / Baret</h3>
                            <p className="text-xs text-slate-400 font-mono">SPO #{selectedExecutionOrder.spo_number} — Divisi {userRole.replace('divisi_', '').toUpperCase()}</p>
                        </div>
                    </div>
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full w-8 h-8 flex items-center justify-center transition border border-slate-700 text-lg font-bold cursor-pointer"
                    >
                        &times;
                    </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-4 text-xs">

                    {/* SECTION 1: PEMILIHAN KACA BACET / CACAT PER ITEM & JUMLAH LEMBAR */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-extrabold text-rose-300 flex items-center gap-1.5">
                                <span>🔍 Pilih Kaca Bermasalah & Jumlah Lembar Rusak:</span>
                            </label>
                            <span className="text-[10px] text-slate-400 font-mono">
                                Total Cacat: <strong className="text-rose-400">{totalDefectiveSheets} Lembar</strong>
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
                                                ? 'bg-rose-950/40 border-rose-500/70 shadow-md shadow-rose-500/10' 
                                                : 'bg-slate-950/80 border-slate-800'
                                        }`}
                                    >
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                            <div>
                                                <div className="font-extrabold text-white text-xs flex items-center gap-1.5">
                                                    <span>#{idx + 1}. {item.glass_type}</span>
                                                    {isDefective && (
                                                        <span className="bg-rose-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md font-mono">
                                                            ⚠️ {qtyDef} Lembar Baret
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                                                    Ukuran: <span className="text-slate-200 font-bold">{item.width} × {item.height} cm</span> | Tebal: <span className="text-amber-300 font-bold">{item.thickness} mm</span> | Total Pesanan: <span className="text-cyan-300 font-bold">{item.quantity} Pcs</span>
                                                </div>
                                            </div>

                                            {/* STEPPER COUNTER UNTUK JUMLAH LEMBAR BARET */}
                                            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 p-1 rounded-xl self-end sm:self-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleQtyChange(idx, qtyDef - 1, item.quantity)}
                                                    className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg flex items-center justify-center transition cursor-pointer text-sm"
                                                    title="Kurangi lembar baret"
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={item.quantity}
                                                    value={qtyDef}
                                                    onChange={(e) => handleQtyChange(idx, e.target.value, item.quantity)}
                                                    className="w-12 bg-slate-950 border border-slate-800 text-amber-300 font-black font-mono text-center rounded-lg text-xs py-1 focus:outline-none focus:border-rose-400"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleQtyChange(idx, qtyDef + 1, item.quantity)}
                                                    className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg flex items-center justify-center transition cursor-pointer text-sm"
                                                    title="Tambah lembar baret"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                        <label className="text-xs font-bold text-slate-300">Pilih Alasan Kendala / Cacat Kaca:</label>
                        <select
                            value={form.reason}
                            onChange={(e) => setForm({...form, reason: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-rose-400"
                        >
                            <option value="Kaca Baret / Gores">🔍 Kaca Baret / Gores (Scratch)</option>
                            <option value="Kaca Retak / Pecah">💥 Kaca Retak / Pecah (Cracked/Broken)</option>
                            <option value="Cacat Pabrik / Gelembung">🏭 Cacat Pabrik / Gelembung / Flek</option>
                            <option value="Miskomunikasi Ukuran / Salah Potong HT">📏 Miskomunikasi Ukuran / Salah Potong HT</option>
                            <option value="Kendala Lainnya">⚠️ Kendala Lainnya</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300">Catatan & Detail Keluhan:</label>
                        <textarea
                            required
                            rows={2}
                            value={form.notes}
                            onChange={(e) => setForm({...form, notes: e.target.value})}
                            placeholder="Jelaskan detail baret/cacat atau kronologi singkat..."
                            className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 text-xs focus:border-rose-400 font-mono"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300">Foto Bukti Kaca Cacat / Baret (Opsional):</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={onPhotoChange}
                            className="w-full bg-slate-950 border border-slate-700 text-slate-300 rounded-xl p-2 text-xs file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-rose-500/20 file:text-rose-300 hover:file:bg-rose-500/30 cursor-pointer"
                        />
                        {form.photoPreview && (
                            <div className="mt-2 relative rounded-xl overflow-hidden border border-slate-700 max-h-36">
                                <img src={form.photoPreview} alt="Preview Bukti" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>

                    <div className="bg-amber-950/50 border border-amber-500/30 p-3 rounded-xl text-[11px] text-amber-200 space-y-0.5">
                        <span className="font-bold block text-amber-300">💡 Workflow Laporan Kaca Cacat ke Admin Gudang:</span>
                        <p>Laporan berisi rincian item & lembar cacat ini akan dikirim ke <strong>Admin Gudang</strong>. Status orderan berubah menjadi <strong>Pending Gudang</strong>. Jika disetujui ganti barang, orderan akan diproses ulang oleh Admin Gudang.</p>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs transition shadow-lg shadow-rose-500/20 flex items-center gap-1.5 cursor-pointer"
                        >
                            <span>📤 Kirim Laporan ke Admin Gudang</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
