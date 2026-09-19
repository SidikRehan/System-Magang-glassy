import React from 'react';
import { Plus, X, Building2, Sliders, Check, Ruler, Info } from 'lucide-react';

export default function AddStockModal({
    show,
    onClose,
    newStockForm,
    setNewStockForm,
    handleAddStockItemSubmit,
    suppliersList = [],
    formatNumberDots,
    parseNumberDots
}) {
    if (!show) return null;

    const l = parseFloat(newStockForm.length_cm) || 0;
    const w = parseFloat(newStockForm.width_cm) || 0;
    const areaM2 = (l > 0 && w > 0) ? ((l * w) / 10000).toFixed(4) : '0.0000';
    const sellPrice = parseFloat(newStockForm.sell_price) || 0;
    const estSheetPrice = sellPrice > 0 && parseFloat(areaM2) > 0 
        ? Math.round(sellPrice * parseFloat(areaM2)) 
        : 0;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-800">
                {/* Header */}
                <div className="flex justify-between items-center border-b border-slate-200 pb-3.5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-[#1b68b0]/10 flex items-center justify-center text-[#1b68b0]">
                            <Plus className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#242222] text-base">
                                Tambah Jenis Barang / Kaca Lembaran Baru
                            </h3>
                            <p className="text-xs text-slate-500 font-mono">Master Katalog Kaca Pabrik & Toko</p>
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

                <form onSubmit={handleAddStockItemSubmit} className="space-y-4 text-xs">
                    {/* Kode & Kategori */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold">Kode Barang (Opsional):</label>
                            <input
                                type="text"
                                placeholder="e.g. KCB-003"
                                value={newStockForm.item_code || ''}
                                onChange={e => setNewStockForm({ ...newStockForm, item_code: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[#1b68b0] font-mono font-bold focus:border-[#1b68b0] focus:bg-white"
                            />
                        </div>
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold">Kategori Kaca:</label>
                            <select
                                value={newStockForm.category || 'Kaca Cermin'}
                                onChange={e => setNewStockForm({ ...newStockForm, category: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-[#1b68b0] focus:bg-white cursor-pointer"
                            >
                                <option value="Kaca Cermin">Kaca Cermin</option>
                                <option value="Kaca Bening / Clear">Kaca Bening / Clear</option>
                                <option value="Kaca Tempered">Kaca Tempered</option>
                                <option value="Kaca Tinted / Grey">Kaca Tinted / Grey</option>
                                <option value="Kaca Sandblast">Kaca Sandblast</option>
                            </select>
                        </div>
                    </div>

                    {/* Nama Barang */}
                    <div>
                        <label className="text-slate-700 block mb-1 font-semibold">Nama Barang Kaca Baru:</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Kaca Cermin Riben 5mm Standard"
                            value={newStockForm.name || ''}
                            onChange={e => setNewStockForm({ ...newStockForm, name: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:border-[#1b68b0] focus:bg-white"
                        />
                    </div>

                    {/* Dimensi Standard: 2 Input Angka Terpisah (Panjang & Lebar) */}
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                            <label className="text-slate-800 font-bold block flex items-center gap-1.5">
                                <Ruler className="w-4 h-4 text-[#1b68b0]" />
                                <span>Ukuran Standard Lembaran (cm):</span>
                            </label>
                            <span className="text-[11px] font-mono text-[#1b68b0] bg-[#1b68b0]/10 px-2 py-0.5 rounded-md font-bold">
                                Luas 1 Lembar: {areaM2} m²
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-slate-600 block mb-1 font-semibold text-[11px]">Panjang Lembaran (cm):</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="10"
                                    required
                                    placeholder="e.g. 183"
                                    value={newStockForm.length_cm || ''}
                                    onChange={e => {
                                        const newLen = e.target.value;
                                        const curWid = newStockForm.width_cm || 244;
                                        setNewStockForm({
                                            ...newStockForm,
                                            length_cm: newLen,
                                            size: `${newLen} x ${curWid} cm`
                                        });
                                    }}
                                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono font-bold text-sm focus:border-[#1b68b0] focus:ring-2 focus:ring-[#1b68b0]/15"
                                />
                            </div>
                            <div>
                                <label className="text-slate-600 block mb-1 font-semibold text-[11px]">Lebar Lembaran (cm):</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="10"
                                    required
                                    placeholder="e.g. 244"
                                    value={newStockForm.width_cm || ''}
                                    onChange={e => {
                                        const newWid = e.target.value;
                                        const curLen = newStockForm.length_cm || 183;
                                        setNewStockForm({
                                            ...newStockForm,
                                            width_cm: newWid,
                                            size: `${curLen} x ${newWid} cm`
                                        });
                                    }}
                                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono font-bold text-sm focus:border-[#1b68b0] focus:ring-2 focus:ring-[#1b68b0]/15"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Stok Awal & Ketebalan */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold">Stok Awal (Qty Lembar):</label>
                            <input
                                type="number"
                                min="0"
                                required
                                value={newStockForm.qty}
                                onChange={e => setNewStockForm({ ...newStockForm, qty: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-mono font-bold focus:border-[#1b68b0] focus:bg-white"
                            />
                        </div>
                        <div>
                            <label className="text-[#1b68b0] block mb-1 font-semibold">Ketebalan (mm):</label>
                            <input
                                type="number"
                                min="1"
                                placeholder="e.g. 5"
                                value={newStockForm.thickness_mm || 5}
                                onChange={e => setNewStockForm({ ...newStockForm, thickness_mm: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[#1b68b0] font-mono font-bold focus:border-[#1b68b0] focus:bg-white"
                            />
                        </div>
                    </div>

                    {/* HARGA BELI & HARGA JUAL */}
                    <div className="grid grid-cols-2 gap-3 border-t border-slate-200 pt-3 my-1">
                        <div>
                            <label className="text-amber-800 block mb-1 font-semibold flex items-center justify-between">
                                <span>Harga Beli Supplier (Rp):</span>
                                <span className="text-[10px] text-amber-600 font-mono font-normal">per lembar</span>
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="e.g. 280.000"
                                value={formatNumberDots(newStockForm.buy_price)}
                                onChange={e => setNewStockForm({ ...newStockForm, buy_price: parseNumberDots(e.target.value) })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-amber-900 font-mono font-bold focus:border-amber-500 focus:bg-white"
                            />
                        </div>
                        <div>
                            <label className="text-[#70b03c] block mb-1 font-semibold flex items-center justify-between">
                                <span>Harga Jual Customer (Rp/m²):</span>
                                <span className="text-[10px] text-[#5f9733] font-mono font-bold">per m²</span>
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="e.g. 380.000"
                                value={formatNumberDots(newStockForm.sell_price)}
                                onChange={e => setNewStockForm({ ...newStockForm, sell_price: parseNumberDots(e.target.value) })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[#5f9733] font-mono font-bold focus:border-[#70b03c] focus:bg-white"
                            />
                            {estSheetPrice > 0 && (
                                <p className="text-[10px] text-slate-500 mt-1 font-mono">
                                    Est. nilai 1 lembar utuh: <strong className="text-slate-700 font-bold">Rp {estSheetPrice.toLocaleString('id-ID')}</strong>
                                </p>
                            )}
                        </div>
                    </div>

                    {/* TARIF PROSES KHUSUS JENIS KACA INI */}
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5 my-1">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                            <label className="text-slate-800 font-bold block text-xs flex items-center gap-1.5">
                                <Sliders className="w-3.5 h-3.5 text-[#1b68b0]" />
                                <span>Tarif Proses Khusus Kaca Ini (Permeter / m²):</span>
                            </label>
                            <span className="text-[10px] text-slate-500 font-mono">*Bisa disesuaikan per jenis kaca</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div>
                                <label className="text-slate-600 block mb-1 text-[10px] font-semibold">HT (Halus Tepi) /m:</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="1.000"
                                    value={formatNumberDots(newStockForm.rate_ht)}
                                    onChange={e => setNewStockForm({ ...newStockForm, rate_ht: parseNumberDots(e.target.value) })}
                                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-[#1b68b0] font-mono font-bold text-xs focus:border-[#1b68b0]"
                                />
                            </div>
                            <div>
                                <label className="text-slate-600 block mb-1 text-[10px] font-semibold">GM (Gosok Mesin) /m:</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="10.000"
                                    value={formatNumberDots(newStockForm.rate_gm)}
                                    onChange={e => setNewStockForm({ ...newStockForm, rate_gm: parseNumberDots(e.target.value) })}
                                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-[#1b68b0] font-mono font-bold text-xs focus:border-[#1b68b0]"
                                />
                            </div>
                            <div>
                                <label className="text-slate-600 block mb-1 text-[10px] font-semibold">BV (Beveling) /m:</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="15.000"
                                    value={formatNumberDots(newStockForm.rate_bv)}
                                    onChange={e => setNewStockForm({ ...newStockForm, rate_bv: parseNumberDots(e.target.value) })}
                                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-[#1b68b0] font-mono font-bold text-xs focus:border-[#1b68b0]"
                                />
                            </div>
                            <div>
                                <label className="text-slate-600 block mb-1 text-[10px] font-semibold">Etsa (Sandblast) /m²:</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="50.000"
                                    value={formatNumberDots(newStockForm.rate_etsa)}
                                    onChange={e => setNewStockForm({ ...newStockForm, rate_etsa: parseNumberDots(e.target.value) })}
                                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-[#1b68b0] font-mono font-bold text-xs focus:border-[#1b68b0]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* INFORMASI SUPPLIER */}
                    <div className="border-t border-slate-200 pt-3 space-y-3">
                        <h4 className="font-bold text-slate-800 flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5">
                                <Building2 className="w-4 h-4 text-[#1b68b0]" />
                                <span>Informasi Supplier Utama (Opsional)</span>
                            </span>
                            <span className="text-[10px] text-[#1b68b0] font-normal">Auto-fill dari mitra</span>
                        </h4>
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold">Pilih Supplier Terdaftar (Otomatis Terisi):</label>
                            <select
                                value={suppliersList.some(s => s.name === newStockForm.supplier_name) ? newStockForm.supplier_name : (newStockForm.supplier_name ? 'CUSTOM' : '')}
                                onChange={e => {
                                    const val = e.target.value;
                                    if (val === 'CUSTOM') {
                                        // keep custom input
                                    } else if (val) {
                                        const found = suppliersList.find(s => s.name === val);
                                        if (found) {
                                            setNewStockForm(prev => ({
                                                ...prev,
                                                supplier_name: found.name,
                                                supplier_phone: found.phone || '',
                                                supplier_pic: found.pic || ''
                                            }));
                                        }
                                    } else {
                                        setNewStockForm(prev => ({
                                            ...prev,
                                            supplier_name: '',
                                            supplier_phone: '',
                                            supplier_pic: ''
                                        }));
                                    }
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-[#1b68b0] focus:bg-white text-xs mb-2 cursor-pointer"
                            >
                                <option value="">-- Klik Untuk Pilih Supplier Terdaftar (Auto Fill) --</option>
                                {suppliersList.map(sup => (
                                    <option key={sup.id} value={sup.name}>
                                        {sup.name} (PIC: {sup.pic} - {sup.phone})
                                    </option>
                                ))}
                                <option value="CUSTOM">+ Input Manual Supplier Baru...</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-slate-700 block mb-1 font-semibold">No WhatsApp Supplier:</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 6281234567890"
                                    value={newStockForm.supplier_phone || ''}
                                    onChange={e => setNewStockForm({ ...newStockForm, supplier_phone: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 font-mono focus:border-[#1b68b0] focus:bg-white"
                                />
                            </div>
                            <div>
                                <label className="text-slate-700 block mb-1 font-semibold">Nama PIC Supplier:</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Pak Gunawan"
                                    value={newStockForm.supplier_pic || ''}
                                    onChange={e => setNewStockForm({ ...newStockForm, supplier_pic: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 focus:border-[#1b68b0] focus:bg-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex justify-end gap-2.5 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl transition text-xs cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="bg-[#70b03c] hover:bg-[#5f9733] text-white font-bold px-5 py-2.5 rounded-xl transition shadow-xs flex items-center gap-1.5 text-xs cursor-pointer"
                        >
                            <Check className="w-4 h-4" />
                            <span>Simpan Jenis Barang Baru</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
