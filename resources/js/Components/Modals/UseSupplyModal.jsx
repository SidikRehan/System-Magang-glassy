import React, { useState } from 'react';
import { ClipboardList, X, Check, Plus, Trash2, AlertCircle } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function UseSupplyModal({
    show,
    onClose,
    suppliesList = [],
    onSubmit,
    onSuccess
}) {
    if (!show) return null;

    const [division, setDivision] = useState('HT (Potong)');
    const [userName, setUserName] = useState('');
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState([
        { supply_id: '', used_qty: 1 }
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddItem = () => {
        setItems(prev => [...prev, { supply_id: '', used_qty: 1 }]);
    };

    const handleRemoveItem = (index) => {
        if (items.length <= 1) return;
        setItems(prev => prev.filter((_, idx) => idx !== index));
    };

    const handleItemChange = (index, field, value) => {
        setItems(prev => prev.map((item, idx) => {
            if (idx === index) {
                return { ...item, [field]: value };
            }
            return item;
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!userName.trim()) {
            alert('Masukkan nama pengambil / pekerja!');
            return;
        }

        // Filter valid items
        const validItems = items.filter(it => it.supply_id !== '');
        if (validItems.length === 0) {
            alert('Pilih minimal satu barang perlengkapan!');
            return;
        }

        // Check duplicates
        const selectedIds = validItems.map(it => it.supply_id);
        const hasDuplicates = new Set(selectedIds).size !== selectedIds.length;
        if (hasDuplicates) {
            alert('Terdapat barang perlengkapan ganda dalam daftar pilihan!');
            return;
        }

        // Check stock availability
        for (const it of validItems) {
            const supplyObj = suppliesList.find(s => s.id === parseInt(it.supply_id));
            const qtyNum = parseInt(it.used_qty) || 1;
            if (supplyObj && qtyNum > supplyObj.qty) {
                alert(`Stok "${supplyObj.name}" tidak mencukupi! Sisa stok: ${supplyObj.qty} ${supplyObj.unit}`);
                return;
            }
        }

        const payload = {
            taker_name: userName,
            user_division: division,
            notes: notes,
            items: validItems.map(it => ({
                supply_id: parseInt(it.supply_id),
                used_qty: parseInt(it.used_qty) || 1
            }))
        };

        if (onSubmit) {
            onSubmit(payload);
            onClose();
            return;
        }

        // Inertia submission fallback
        setIsSubmitting(true);
        router.post(route('inventory.supplies.batch_use'), {
            user_name: userName,
            division: division,
            notes: notes || null,
            items: validItems.map(it => ({
                supply_id: parseInt(it.supply_id),
                qty: parseInt(it.used_qty) || 1
            }))
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
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-800">
                {/* HEADER */}
                <div className="flex justify-between items-center border-b border-slate-200 pb-3.5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-[#1b68b0]/10 flex items-center justify-center text-[#1b68b0]">
                            <ClipboardList className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#242222] text-base">
                                Catat Pemakaian Perlengkapan (Multi-Item)
                            </h3>
                            <p className="text-xs text-slate-500 font-mono">Dokumentasikan pemakaian beberapa barang operasional sekaligus oleh divisi</p>
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
                    {/* DIVISI & PENGAMBIL */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold">Divisi Pengambil:*</label>
                            <select
                                value={division}
                                onChange={e => setDivision(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-[#1b68b0] focus:bg-white cursor-pointer"
                            >
                                <option value="HT (Potong)">HT (Potong)</option>
                                <option value="GM (Gosok Mesin)">GM (Gosok Mesin)</option>
                                <option value="BV (Bevel)">BV (Bevel)</option>
                                <option value="Etsa">Etsa</option>
                                <option value="Admin Gudang & Pengiriman">Admin Gudang & Pengiriman</option>
                                <option value="Teknisi Lapangan">Teknisi Lapangan</option>
                                <option value="Umum & Maintenance">Umum & Maintenance</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-slate-700 block mb-1 font-semibold">Nama Pengambil / Pekerja:*</label>
                            <input
                                type="text"
                                placeholder="Contoh: Supri / Bambang"
                                value={userName}
                                onChange={e => setUserName(e.target.value)}
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:border-[#1b68b0] focus:bg-white"
                            />
                        </div>
                    </div>

                    {/* ITEMS LIST HEADER */}
                    <div className="pt-2 border-t border-slate-100">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-[#242222] text-xs flex items-center gap-1.5">
                                Daftar Item Perlengkapan Dipakai
                                <span className="bg-blue-50 text-[#1b68b0] text-[10px] font-mono px-2 py-0.5 rounded-full border border-blue-200 font-bold">
                                    {items.length} Item
                                </span>
                            </span>
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="bg-blue-50 hover:bg-blue-100 text-[#1b68b0] font-bold px-2.5 py-1 rounded-lg text-xs transition flex items-center gap-1 cursor-pointer border border-blue-200 shadow-2xs"
                            >
                                <Plus className="w-3.5 h-3.5" /> Tambah Item
                            </button>
                        </div>

                        {/* ITEMS ROWS */}
                        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                            {items.map((it, idx) => {
                                const selectedSupply = suppliesList.find(s => s.id === parseInt(it.supply_id));
                                const isOverStock = selectedSupply && parseInt(it.used_qty) > selectedSupply.qty;

                                return (
                                    <div key={idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                                                {idx + 1}
                                            </span>
                                            
                                            {/* SELECT SUPPLY */}
                                            <div className="flex-1 min-w-0">
                                                <select
                                                    value={it.supply_id}
                                                    onChange={e => handleItemChange(idx, 'supply_id', e.target.value)}
                                                    required
                                                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-800 font-medium text-xs focus:border-[#1b68b0] cursor-pointer"
                                                >
                                                    <option value="">-- Pilih Barang Perlengkapan --</option>
                                                    {suppliesList.map(s => (
                                                        <option key={s.id} value={s.id} disabled={s.qty <= 0}>
                                                            [{s.item_code}] {s.name} (Sisa Stok: {s.qty} {s.unit})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* QTY INPUT */}
                                            <div className="w-32 shrink-0 flex items-center gap-1">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={it.used_qty}
                                                    onChange={e => handleItemChange(idx, 'used_qty', e.target.value)}
                                                    required
                                                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-center text-slate-800 font-mono font-bold text-xs focus:border-[#1b68b0]"
                                                />
                                                <span className="text-[10px] text-slate-500 font-medium shrink-0 font-mono">
                                                    {selectedSupply ? selectedSupply.unit : 'Unit'}
                                                </span>
                                            </div>

                                            {/* REMOVE BUTTON */}
                                            {items.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem(idx)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0 cursor-pointer"
                                                    title="Hapus baris item"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        {/* STOCK WARNING */}
                                        {isOverStock && (
                                            <div className="flex items-center gap-1 text-[11px] text-rose-600 font-semibold bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                <span>Stok tidak cukup! Sisa stok hanya {selectedSupply.qty} {selectedSupply.unit}.</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* NOTES */}
                    <div>
                        <label className="text-slate-700 block mb-1 font-semibold">Catatan / Keperluan Pemakaian:</label>
                        <textarea
                            rows="2"
                            placeholder="Contoh: Pemakaian rutin APD & perlengkapan packing peti kayu"
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:border-[#1b68b0] focus:bg-white"
                        />
                    </div>

                    {/* FOOTER ACTION */}
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
                            disabled={isSubmitting}
                            className="bg-[#1b68b0] hover:bg-[#15528c] text-white font-bold px-5 py-2.5 rounded-xl transition shadow-xs flex items-center gap-1.5 text-xs cursor-pointer disabled:opacity-50"
                        >
                            <Check className="w-4 h-4" />
                            <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Log Pemakaian Multi-Item'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
