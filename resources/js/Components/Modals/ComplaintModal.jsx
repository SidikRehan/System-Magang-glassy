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

    return (
        <div className="fixed inset-0 z-[70] bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-5 shadow-[0_0_50px_rgba(244,63,94,0.18)] relative my-auto">
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
                        className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full w-8 h-8 flex items-center justify-center transition border border-slate-700 text-lg font-bold"
                    >
                        &times;
                    </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-4 text-xs">
                    <div className="space-y-1.5">
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
                            rows={3}
                            value={form.notes}
                            onChange={(e) => setForm({...form, notes: e.target.value})}
                            placeholder="Jelaskan lokasi baret/cacat atau kronologi singkat... (Wajib diisi, jika tidak ada ketik '-')"
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
                            <div className="mt-2 relative rounded-xl overflow-hidden border border-slate-700 max-h-40">
                                <img src={form.photoPreview} alt="Preview Bukti" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>

                    <div className="bg-amber-950/50 border border-amber-500/30 p-3 rounded-xl text-[11px] text-amber-200 space-y-0.5">
                        <span className="font-bold block text-amber-300">💡 Informasi Workflow Laporkan:</span>
                        <p>Setelah dikirim, SPO ini akan otomatis masuk ke <strong>Admin Gudang</strong> untuk peninjauan. Pengerjaan divisi dipause sementara sampai Admin Gudang memberikan instruksi lanjutan.</p>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition"
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
