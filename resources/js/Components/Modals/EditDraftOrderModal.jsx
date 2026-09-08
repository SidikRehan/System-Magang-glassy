import React from 'react';

export default function EditDraftOrderModal({
    show,
    onClose,
    handleCloseEditModal,
    editingOrder,
    orderForm,
    setOrderForm,
    formatIndonesianDate,
    sanitizeCustomerName,
    sanitizeCustomerPhone,
    handleItemChange,
    handleAddItem,
    handleRemoveItem,
    toggleItemProcess = () => {},
    handleUpdateOrderSubmit,
    handleFileChange = () => {},
    sketchPreview = null,
    calcItems = [],
    getDynamicGlassTypes = () => [],
    sheetGlasses = [],
    findMatchingScrapsForOrder = () => null,
    initialScrap = [],
    extractThickness = () => 5,
    calculateScrapYield = () => 0,
    parseDim = (v) => parseFloat(v) || 0,
    customScrapQtyMap = {},
    handleUpdateIndividualScrapQty = () => {},
    handleToggleIndividualScrap = () => {},
    handleAddAccessoryFromStock = () => {},
    MASTER_ACCESSORY_STOCK = [],
    handleAccessoryQtyChange = () => {},
    handleRemoveAccessory = () => {},
    formatRupiahInput = (v) => v,
    parseRupiahInput = (v) => v,
    calcTotalAccessoryFees = 0,
    calcTotalGlassBasePrice = 0,
    calcTotalProcessFees = 0,
    calcPriorityFee = 0,
    calcTotalPrice = 0
}) {
    const closeHandler = onClose || handleCloseEditModal || (() => {});
    if (!show || !editingOrder) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <div>
                                <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                                    {editingOrder.status === 'pengerjaan' ? `🔄 Revisi & Edit Orderan Pengerjaan #${editingOrder.spo_number}` : `✏️ Edit Draf Negosiasi #${editingOrder.spo_number}`}
                                </h3>
                                <div className="flex flex-wrap items-center gap-3 text-xs mt-1">
                                    <div className="flex items-center gap-1.5 text-slate-400 font-mono">
                                        <span>📅 Tanggal Order:</span>
                                        <input 
                                            type="date" 
                                            required 
                                            value={orderForm.order_date || ''} 
                                            onChange={e => setOrderForm('order_date', e.target.value)} 
                                            className="bg-slate-950 border border-cyan-500/50 rounded px-2 py-0.5 text-xs text-cyan-300 font-mono font-bold focus:border-cyan-400 cursor-pointer"
                                        />
                                        <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                            {formatIndonesianDate(orderForm.order_date)}
                                        </span>
                                    </div>
                                    <span className="text-slate-400 font-mono">
                                        Status: <strong className="text-amber-400 uppercase">{editingOrder.status}</strong>
                                    </span>
                                </div>
                            </div>
                            <button onClick={closeHandler} className="text-slate-400 hover:text-white text-2xl font-bold">&times;</button>
                        </div>

                        <form className="space-y-4 text-xs overflow-y-auto pr-2 flex-1">
                            {editingOrder.status === 'pengerjaan' && (
                                <div className="bg-amber-950/40 p-4 rounded-xl border border-amber-500/40 space-y-2">
                                    <h4 className="font-bold text-amber-300 text-xs flex items-center gap-1.5 border-b border-amber-500/30 pb-2">
                                        <span>📝 Catatan Detail Perubahan Revisi Untuk Divisi Produksi</span>
                                    </h4>
                                    <div>
                                        <label className="text-slate-300 block mb-1">Keterangan / Catatan Revisi:</label>
                                        <textarea 
                                            required
                                            rows="2" 
                                            placeholder="Contoh: Ukuran sekat kaca cermin diperkecil dari 150x120 cm menjadi 140x110 cm. (Wajib diisi, jika tidak ada ketik '-')"
                                            value={orderForm.revision_notes || ''} 
                                            onChange={e => setOrderForm('revision_notes', e.target.value)} 
                                            className="w-full bg-slate-900 border border-amber-500/50 rounded-lg p-2.5 text-slate-100 text-xs focus:border-amber-400 font-medium"
                                        />
                                        <span className="text-[10px] text-amber-400/80 block mt-1">
                                            *Mengisi catatan revisi ini akan mengirimkan peringatan otomatis ke Admin Gudang & seluruh Divisi Produksi.
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* SECTION 1: PELANGGAN (iii, iv, v) */}
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                                <h4 className="font-bold text-cyan-400 text-xs border-b border-slate-800 pb-2">
                                    👤 Data Pemesan & Pelanggan
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-slate-400 block mb-1">Nama Customer (Khusus Huruf):</label>
                                        <input 
                                            type="text" 
                                            required 
                                            value={orderForm.customer_name} 
                                            onChange={e => setOrderForm('customer_name', sanitizeCustomerName(e.target.value))} 
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-cyan-400 font-medium" 
                                        />
                                        <span className="text-[10px] text-slate-500 block mt-0.5">*Hanya huruf & spasi (angka/simbol otomatis difilter)</span>
                                    </div>
                                    <div>
                                        <label className="text-slate-400 block mb-1">Nomor Telepon / WA (Khusus Angka):</label>
                                        <input 
                                            type="text" 
                                            inputMode="numeric"
                                            required 
                                            value={orderForm.customer_phone} 
                                            onChange={e => setOrderForm('customer_phone', sanitizeCustomerPhone(e.target.value))} 
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-cyan-400 font-mono" 
                                        />
                                        <span className="text-[10px] text-slate-500 block mt-0.5">*Hanya digit angka nomor hp</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-slate-400 block mb-1">Alamat Pengiriman (Bebas Huruf, Angka & Simbol):</label>
                                    <textarea required rows="2" value={orderForm.customer_address} onChange={e => setOrderForm('customer_address', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-cyan-400" />
                                </div>
                            </div>

                            {/* SECTION 2: RINCIAN MULTI-ITEM KACA & UKURAN */}
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                                <div className="flex flex-wrap justify-between items-center border-b border-slate-800 pb-2 gap-2">
                                    <h4 className="font-bold text-cyan-400 text-xs flex items-center gap-1.5">
                                        📐 Rincian Item Kaca ({calcItems.length} Item Kaca)
                                    </h4>
                                    <button 
                                        type="button" 
                                        onClick={handleAddItem} 
                                        className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold px-3 py-1 rounded-lg text-[11px] border border-cyan-500/30 flex items-center gap-1 transition"
                                    >
                                        ➕ Tambah Item Kaca Lain
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {calcItems.map((item, idx) => (
                                        <div key={item.id || idx} className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-3 relative">
                                            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                                <span className="font-extrabold text-cyan-300 text-xs flex items-center gap-2">
                                                    🔷 Item Kaca #{idx + 1}
                                                    <span className="font-mono text-[10px] text-slate-400">
                                                        (Luas: {item.areaM2.toFixed(2)} m² | Subtotal: <strong className="text-emerald-400">Rp {item.subtotal.toLocaleString()}</strong>)
                                                    </span>
                                                </span>
                                                {calcItems.length > 1 && (
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleRemoveItem(idx)}
                                                        className="text-rose-400 hover:text-rose-300 text-xs font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 transition"
                                                    >
                                                        🗑️ Hapus Item
                                                    </button>
                                                )}
                                            </div>

                                            {/* ROW 1: JENIS KACA & QTY */}
                                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                                <div className="sm:col-span-3">
                                                    <label className="text-slate-400 block mb-1">Jenis Kaca Dasar:</label>
                                                    <select 
                                                        value={item.glass_type} 
                                                        onChange={e => handleItemChange(idx, 'glass_type', e.target.value)} 
                                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-cyan-400"
                                                    >
                                                        <option value="">-- Pilih Jenis Kaca Dasar --</option>
                                                        {getDynamicGlassTypes(sheetGlasses).map((gt, gIdx) => (
                                                            <option key={gIdx} value={gt}>{gt}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-slate-400 block mb-1">Jumlah (Qty):</label>
                                                    <input 
                                                        type="number" 
                                                        min="0" 
                                                        required 
                                                        value={item.qty} 
                                                        onChange={e => handleItemChange(idx, 'qty', e.target.value)} 
                                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono font-bold focus:border-cyan-400" 
                                                    />
                                                </div>
                                            </div>

                                            {/* ROW 2: DIMENSI UKURAN */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-slate-400 block mb-1">Panjang (cm):</label>
                                                    <input 
                                                        type="text" 
                                                        inputMode="decimal"
                                                        required 
                                                        placeholder="cth: 24,3 atau 150"
                                                        value={item.length_cm} 
                                                        onChange={e => handleItemChange(idx, 'length_cm', e.target.value)} 
                                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono focus:border-cyan-400" 
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-slate-400 block mb-1">Lebar (cm):</label>
                                                    <input 
                                                        type="text" 
                                                        inputMode="decimal"
                                                        required 
                                                        placeholder="cth: 160,5 atau 120"
                                                        value={item.width_cm} 
                                                        onChange={e => handleItemChange(idx, 'width_cm', e.target.value)} 
                                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono focus:border-cyan-400" 
                                                    />
                                                </div>
                                            </div>

                                            {/* SMART SCRAP GLASS RECOMMENDATION BANNER (WITH QUANTITY & +1CM GM EDGE MARGIN RULE) */}
                                            {(() => {
                                                const scrapMatch = findMatchingScrapsForOrder(item, initialScrap);
                                                
                                                // Check if scrap exists without margin, but failed due to +1 cm GM margin rule
                                                const isEdgeGrinding = (item.processes || []).includes('GM');
                                                const exactScrapBlockedByGrinding = (!scrapMatch || scrapMatch.totalScrapCovered <= 0) && isEdgeGrinding
                                                    ? initialScrap?.find(s => {
                                                        if (s.status && s.status !== 'Layak Pakai') return false;
                                                        if (extractThickness(s.glass_type) !== extractThickness(item.glass_type)) return false;
                                                        return calculateScrapYield(parseFloat(s.length_cm), parseFloat(s.width_cm), parseDim(item.length_cm), parseDim(item.width_cm)) > 0;
                                                    })
                                                    : null;

                                                if (exactScrapBlockedByGrinding) {
                                                    return (
                                                        <div className="p-3 rounded-xl border bg-rose-500/10 border-rose-500/40 text-rose-300 text-xs space-y-1">
                                                            <div className="font-bold flex items-center gap-1.5">
                                                                <span>⚠️ Kaca Sisa di {exactScrapBlockedByGrinding.rak_location} ({exactScrapBlockedByGrinding.scrap_code}) Tidak Bisa Dipakai</span>
                                                                <span className="bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded text-[10px] border border-rose-500/30 font-mono font-bold">Aturan Gosok Mesin (GM)</span>
                                                            </div>
                                                            <div className="text-[11px] text-slate-300 leading-relaxed">
                                                                Stok kaca sisa ukuran <strong>{exactScrapBlockedByGrinding.length_cm} x {exactScrapBlockedByGrinding.width_cm} cm</strong> tidak bisa digunakan untuk orderan ini ({parseDim(item.length_cm)} x {parseDim(item.width_cm)} cm) karena memilih proses <strong>Gosok Mesin (GM)</strong>. Mesin penggosok batu memerlukan bahan kaca minimal <strong>+1 cm lebih besar ({parseDim(item.length_cm) + 1} x {parseDim(item.width_cm) + 1} cm)</strong> agar pinggiran kaca tidak tergerus menjadi kekecilan.
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                if (!scrapMatch || scrapMatch.totalScrapCovered <= 0) return null;

                                                const { totalScrapCovered, neededNewGlass, itemQty, matchedScraps, hasEdgeGrinding } = scrapMatch;
                                                const primaryScrap = matchedScraps[0]?.scrap;
                                                const isFullCover = neededNewGlass === 0;

                                                const isAnySelected = Boolean(orderForm.used_scrap_rak);

                                                return (
                                                    <div className={`p-3.5 rounded-xl border flex flex-col items-start justify-between gap-3 transition ${isAnySelected ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'bg-amber-500/10 border-amber-500/40 text-amber-300'}`}>
                                                        <div className="flex items-start gap-2.5 flex-1 w-full">
                                                            <span className="text-xl mt-0.5">💡</span>
                                                            <div className="text-xs space-y-1.5 w-full">
                                                                <div className="font-bold flex items-center justify-between gap-1.5 flex-wrap">
                                                                    <span>
                                                                        {isFullCover 
                                                                            ? matchedScraps.length === 1 
                                                                                ? `Rekomendasi Kaca Sisa di ${primaryScrap.rak_location} (${primaryScrap.scrap_code})`
                                                                                : `Rekomendasi Kaca Sisa (${matchedScraps.length} Rak Terpakai)`
                                                                            : `Rekomendasi Kombinasi: ${totalScrapCovered} Lembar Scrap + ${neededNewGlass} Lembar Bahan Baru`
                                                                        }
                                                                    </span>
                                                                    <div className="flex items-center gap-1.5">
                                                                        {isAnySelected && <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] border border-emerald-500/30 font-mono font-bold">✓ Terpasang ke Form</span>}
                                                                        {hasEdgeGrinding && <span className="bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded text-[10px] border border-cyan-500/30 font-mono font-bold">+1 cm Margin GM</span>}
                                                                    </div>
                                                                </div>

                                                                {/* ITEMIZED SCRAP BREAKDOWN BOX WITH PER-SCRAP QUANTITY SELECTOR & TOGGLE */}
                                                                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 space-y-2 text-[11px]">
                                                                    <div className="font-semibold text-slate-300 border-b border-slate-800/80 pb-1 flex justify-between items-center flex-wrap gap-1">
                                                                        <span>📦 Pilih Kaca Sisa & Jumlah Lembar yang Ingin Dipakai (Kebutuhan: {itemQty} Lembar):</span>
                                                                        <span className="font-mono text-cyan-400 font-bold">{totalScrapCovered} / {itemQty} Lembar Maks. Scrap</span>
                                                                    </div>

                                                                    <ul className="space-y-2 pt-0.5">
                                                                        {matchedScraps.map((m, mIdx) => {
                                                                            const scrapCode = m.scrap.scrap_code;
                                                                            const maxQty = m.usedQty;
                                                                            const isThisSelected = orderForm.used_scrap_rak && orderForm.used_scrap_rak.includes(scrapCode);
                                                                            const currentQty = customScrapQtyMap[scrapCode] !== undefined ? customScrapQtyMap[scrapCode] : maxQty;

                                                                            return (
                                                                                <li key={mIdx} className={`p-2 rounded-md border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 transition ${isThisSelected ? 'bg-emerald-950/40 border-emerald-500/50' : 'bg-slate-900/80 border-slate-800'}`}>
                                                                                    <div className="space-y-0.5">
                                                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                                                            <span className="text-amber-400 font-mono font-bold">▪ {scrapCode}</span>
                                                                                            <span className="text-slate-400 font-mono">({m.scrap.rak_location})</span>
                                                                                            <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-700">
                                                                                                Ukuran {m.scrap.length_cm} x {m.scrap.width_cm} cm
                                                                                            </span>
                                                                                        </div>
                                                                                        <div className="font-mono text-slate-400 text-[10px]">
                                                                                            Maksimal Potongan Sisa Tersedia: <strong className="text-cyan-300 font-bold">{maxQty} lembar</strong> <span className="text-slate-500">(potong {m.yieldPerSheet} lbr/sheet)</span>
                                                                                        </div>
                                                                                    </div>

                                                                                    {/* ACTION CONTROLS: QTY SELECTOR + TOGGLE BUTTON */}
                                                                                    <div className="flex items-center gap-2 flex-wrap self-end sm:self-center">
                                                                                        <div className="flex items-center gap-1">
                                                                                            <label className="text-[10px] text-slate-400 whitespace-nowrap">Pakai:</label>
                                                                                            <select
                                                                                                value={currentQty}
                                                                                                onChange={(e) => {
                                                                                                    const val = Math.max(1, Math.min(maxQty, parseInt(e.target.value) || 1));
                                                                                                    handleUpdateIndividualScrapQty(m, val, itemQty);
                                                                                                }}
                                                                                                className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-amber-300 font-mono font-bold focus:border-cyan-400 cursor-pointer"
                                                                                            >
                                                                                                {Array.from({ length: maxQty }, (_, i) => i + 1).map(n => (
                                                                                                    <option key={n} value={n}>{n} lbr</option>
                                                                                                ))}
                                                                                            </select>
                                                                                        </div>

                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => handleToggleIndividualScrap(m, currentQty, itemQty)}
                                                                                            className={`px-2.5 py-1 rounded-md font-extrabold text-xs transition shadow-sm whitespace-nowrap ${
                                                                                                isThisSelected 
                                                                                                    ? 'bg-emerald-500 text-slate-950 hover:bg-rose-500 hover:text-white' 
                                                                                                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                                                                                            }`}
                                                                                            title={`Klik untuk memilih / membatalkan penggunaan ${scrapCode}`}
                                                                                        >
                                                                                            {isThisSelected 
                                                                                                ? `✓ ${currentQty} lbr Terpasang (Batal)` 
                                                                                                : `+ Gunakan ${currentQty} lbr Scrap Ini`
                                                                                            }
                                                                                        </button>
                                                                                    </div>
                                                                                </li>
                                                                            );
                                                                        })}

                                                                        {neededNewGlass > 0 && (
                                                                            <li className="flex items-center justify-between text-cyan-300 font-sans border-t border-slate-900 pt-1.5 flex-wrap gap-1">
                                                                                <div className="flex items-center gap-1.5">
                                                                                    <span className="text-cyan-400 font-mono font-bold">▪ Kaca Bahan Lembaran Baru</span>
                                                                                </div>
                                                                                <div className="font-mono text-cyan-300 font-bold">
                                                                                    ➔ Sisa Diambil dari Bahan Baru: <strong className="text-cyan-400 text-xs">{neededNewGlass} lembar</strong>
                                                                                </div>
                                                                            </li>
                                                                        )}
                                                                    </ul>
                                                                </div>

                                                                {hasEdgeGrinding && <div className="text-[10px] text-cyan-300/80 font-mono mt-0.5">*Ukuran scrap mencukupi batas aman margin +1 cm untuk penggosokan mesin (GM).</div>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}

                                            {/* ROW 3: OPTIONS PROSES MANDIRI PER ITEM */}
                                            <div>
                                                <label className="text-slate-400 block mb-1 font-semibold">Options Proses Item #{idx + 1}:</label>
                                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                                    {[
                                                        { id: 'HT', name: 'HT (Halus Tepi)' },
                                                        { id: 'BV', name: 'BV (Beveling)' },
                                                        { id: 'GM', name: 'GM (Gosok Mesin)' },
                                                        { id: 'Etsa', name: 'Etsa (Sandblast)' },
                                                        { id: 'Bor', name: 'Bor (Coakan)' },
                                                    ].map(proc => (
                                                        <label 
                                                            key={proc.id} 
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                toggleItemProcess(idx, proc.id);
                                                            }} 
                                                            className={`p-1.5 rounded-lg border cursor-pointer transition flex items-center justify-between text-[11px] ${(item.processes || []).includes(proc.id) ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
                                                        >
                                                            <span>{proc.name}</span>
                                                            <input type="checkbox" checked={(item.processes || []).includes(proc.id)} onChange={() => {}} className="rounded bg-slate-900 border-slate-700 text-cyan-500 w-3 h-3 pointer-events-none" />
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* CONDITIONAL PARAMETERS FOR BEVEL & BOR */}
                                            {(item.processes || []).includes('BV') && (
                                                <div className="p-2 bg-slate-950 rounded-lg border border-cyan-500/30">
                                                    <label className="text-[11px] text-cyan-300 font-semibold block mb-1">
                                                        📐 Lebar Bevel (cm): <span className="text-[10px] text-slate-400 font-mono">(Biaya: Keliling × Rp 15.000 + Lebar cm × Rp 10.000)</span>
                                                    </label>
                                                    <input 
                                                        type="number" 
                                                        step="0.5" 
                                                        value={item.bevel_width_cm || 1} 
                                                        onChange={e => handleItemChange(idx, 'bevel_width_cm', e.target.value)} 
                                                        className="w-36 bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-slate-100 font-mono font-bold focus:border-cyan-400" 
                                                    />
                                                </div>
                                            )}

                                            {(item.processes || []).includes('Bor') && (
                                                <div className="p-2 bg-slate-950 rounded-lg border border-cyan-500/30 space-y-1">
                                                    <label className="text-[11px] text-cyan-300 font-semibold block">
                                                        🔘 Dimensi Lubang Bor / Coakan: <span className="text-[10px] text-slate-400 font-mono">(Biaya: Keliling Ruas cm × Rp 2.500 × Qty Lubang)</span>
                                                    </label>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <div>
                                                            <span className="text-[10px] text-slate-400 block">Panjang Lubang (cm):</span>
                                                            <input 
                                                                type="number" 
                                                                value={item.hole_length_cm || 2} 
                                                                onChange={e => handleItemChange(idx, 'hole_length_cm', e.target.value)} 
                                                                className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-slate-100 font-mono font-bold" 
                                                            />
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] text-slate-400 block">Lebar Lubang (cm):</span>
                                                            <input 
                                                                type="number" 
                                                                value={item.hole_width_cm || 2} 
                                                                onChange={e => handleItemChange(idx, 'hole_width_cm', e.target.value)} 
                                                                className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-slate-100 font-mono font-bold" 
                                                            />
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] text-slate-400 block">Jumlah Lubang:</span>
                                                            <input 
                                                                type="number" 
                                                                value={item.hole_qty || 1} 
                                                                onChange={e => handleItemChange(idx, 'hole_qty', e.target.value)} 
                                                                className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-slate-100 font-mono font-bold" 
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {(item.processes || []).includes('Etsa') && (
                                                <div className="p-2.5 bg-slate-950 rounded-lg border border-cyan-500/30 space-y-2">
                                                    <label className="text-[11px] text-cyan-300 font-semibold flex items-center justify-between">
                                                        <span>🌫️ Dimensi Area Etsa / Sandblast:</span>
                                                        <span className="text-[10px] text-slate-400 font-mono">(Tarif: Rp 50.000 / m²)</span>
                                                    </label>
                                                    
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <div>
                                                            <span className="text-[10px] text-slate-400 block mb-0.5">Panjang Etsa (cm):</span>
                                                            <input 
                                                                type="number" 
                                                                value={item.etsa_length_cm !== undefined ? item.etsa_length_cm : (item.length_cm || '')} 
                                                                onChange={e => handleItemChange(idx, 'etsa_length_cm', e.target.value)} 
                                                                className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-slate-100 font-mono font-bold" 
                                                                placeholder={item.length_cm}
                                                            />
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] text-slate-400 block mb-0.5">Lebar Etsa (cm):</span>
                                                            <input 
                                                                type="number" 
                                                                value={item.etsa_width_cm !== undefined ? item.etsa_width_cm : (item.width_cm || '')} 
                                                                onChange={e => handleItemChange(idx, 'etsa_width_cm', e.target.value)} 
                                                                className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-slate-100 font-mono font-bold" 
                                                                placeholder={item.width_cm}
                                                            />
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] text-slate-400 block mb-0.5">Jumlah Area (Pcs):</span>
                                                            <input 
                                                                type="number" 
                                                                value={item.etsa_qty || 1} 
                                                                onChange={e => handleItemChange(idx, 'etsa_qty', e.target.value)} 
                                                                className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-slate-100 font-mono font-bold" 
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* TRANSPARENT PRICING BREAKDOWN BADGES */}
                                            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] font-mono border-t border-slate-800/80">
                                                <span className="text-slate-400 font-semibold">Rincian Harga:</span>
                                                <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                                                    Kaca: Rp {item.baseGlassPrice.toLocaleString()}
                                                </span>
                                                {item.feeGM > 0 && (
                                                    <span className="bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30 text-cyan-300 font-bold">
                                                        GM: +Rp {item.feeGM.toLocaleString()}
                                                    </span>
                                                )}
                                                {item.feeHT > 0 && (
                                                    <span className="bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30 text-cyan-300 font-bold">
                                                        HT: +Rp {item.feeHT.toLocaleString()}
                                                    </span>
                                                )}
                                                {item.feeBV > 0 && (
                                                    <span className="bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30 text-cyan-300 font-bold">
                                                        Bevel: +Rp {item.feeBV.toLocaleString()}
                                                    </span>
                                                )}
                                                {item.feeBor > 0 && (
                                                    <span className="bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30 text-cyan-300 font-bold">
                                                        Bor ({item.holeRuasCm}cm ruas): +Rp {item.feeBor.toLocaleString()}
                                                    </span>
                                                )}
                                                {item.feeEtsa > 0 && (
                                                    <span className="bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30 text-cyan-300 font-bold">
                                                        Etsa ({item.etsaAreaM2 ? (item.etsaAreaM2 * (item.etsa_qty || 1)).toFixed(2) : '0'}m²): +Rp {item.feeEtsa.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* SECTION 4: TAMBAHAN AKSESORIS TERINTEGRASI STOK GUDANG (viii) */}
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                    <h4 className="font-bold text-cyan-400 text-xs flex items-center gap-1.5">
                                        📦 Tambahan Aksesoris / Hardware Proyek (Stock Integrated)
                                    </h4>
                                    <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                        ✓ Stok Terhubung Gudang
                                    </span>
                                </div>

                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                    <select
                                        className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 font-medium focus:border-cyan-400 flex-1 cursor-pointer"
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                handleAddAccessoryFromStock(e.target.value);
                                                e.target.value = '';
                                            }
                                        }}
                                    >
                                        <option value="">+ Tambah Aksesoris dari Master Stok Inventory Gudang...</option>
                                        {MASTER_ACCESSORY_STOCK.map(item => (
                                            <option key={item.id} value={item.id} disabled={item.stock <= 0}>
                                                {item.name} — Rp {item.price.toLocaleString()}/{item.unit} ({item.stock > 0 ? `Stok: ${item.stock} ${item.unit}` : 'Stok Habis'})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {Array.isArray(orderForm.accessories) && orderForm.accessories.length > 0 ? (
                                    <div className="space-y-2 pt-1">
                                        {orderForm.accessories.map((acc, accIdx) => {
                                            const isObj = typeof acc === 'object' && acc !== null;
                                            const accName = isObj ? acc.name : acc;
                                            const accPrice = isObj ? (parseFloat(acc.price) || 0) : 0;
                                            const accUnit = isObj ? (acc.unit || 'pcs') : 'pcs';
                                            const accStock = isObj ? (acc.stock || 50) : 50;
                                            const accQty = isObj ? (parseInt(acc.qty) || 1) : 1;
                                            const accTotal = accPrice * accQty;

                                            return (
                                                <div key={accIdx} className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <span className="font-bold text-slate-200">{accName}</span>
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${accStock < 10 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                                                            Stok: {accStock} {accUnit}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-[10px] text-slate-400">Jumlah Terpakai:</span>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={accQty}
                                                                onChange={e => handleAccessoryQtyChange(accIdx, e.target.value)}
                                                                className="w-16 bg-slate-950 border border-slate-700 rounded p-1 text-center text-xs font-mono font-bold text-cyan-300"
                                                            />
                                                            <span className="text-[10px] text-slate-400">{accUnit}</span>
                                                        </div>

                                                        <span className="font-mono text-cyan-300 font-bold min-w-[90px] text-right">
                                                            Rp {accTotal.toLocaleString()}
                                                        </span>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveAccessory(accIdx)}
                                                            className="text-red-400 hover:text-red-300 text-xs font-bold p-1 rounded hover:bg-red-500/10"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-3 bg-slate-900/50 rounded-lg border border-dashed border-slate-800 text-center text-slate-500 text-xs">
                                        Belum ada aksesoris ditambahkan. Pilih dari dropdown stok di atas jika proyek memerlukan hardware/fitting pendukung.
                                    </div>
                                )}
                            </div>

                            {/* SECTION 5: DESKRIPSI & SKETSA GAMBAR (ix, x) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                                    <h4 className="font-bold text-cyan-400 text-xs border-b border-slate-800 pb-2">
                                        📝 Deskripsi (Penjelasan Pesanan)
                                    </h4>
                                    <textarea rows="3" value={orderForm.description} onChange={e => setOrderForm('description', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-cyan-400" />
                                </div>

                                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                                    <h4 className="font-bold text-cyan-400 text-xs border-b border-slate-800 pb-2">
                                        🖼️ Gambar / Sketsa Kaca (JPG/PNG)
                                    </h4>
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-slate-300 text-xs cursor-pointer" />
                                    {sketchPreview && (
                                        <div className="mt-2 flex items-center gap-2">
                                            <img src={sketchPreview} alt="Preview Sketsa" className="w-14 h-14 object-cover rounded-lg border border-cyan-500" />
                                            <span className="text-[10px] text-emerald-400 font-bold">✓ Sketsa Berhasil Terpasang</span>
                                        </div>
                                    )}
                                </div>
                            </div>


                            {/* SECTION 6: BURU-BURU TEU? / PRIORITAS (xi) */}
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                                <h4 className="font-bold text-amber-400 text-xs border-b border-slate-800 pb-2">
                                    ⚡ Status Prioritas & Tanggal Selesai
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-slate-400 block mb-1 font-semibold">Status Pengerjaan:</label>
                                        <select 
                                            value={orderForm.priority_status} 
                                            onChange={e => {
                                                const val = e.target.value;
                                                setOrderForm(d => ({
                                                    ...d,
                                                    priority_status: val,
                                                    priority_fee: val === 'Prioritas' ? (d.priority_fee || '') : 0
                                                }));
                                            }} 
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-bold focus:border-cyan-400"
                                        >
                                            <option value="Biasa">Biasa (Standard)</option>
                                            <option value="Prioritas">Prioritas (Buru-buru / Fee Custom)</option>
                                        </select>
                                    </div>
                                    {orderForm.priority_status === 'Prioritas' && (
                                        <div>
                                            <label className="text-slate-400 block mb-1 font-semibold">Nominal Fee Prioritas (Rp):</label>
                                            <input 
                                                type="text" 
                                                inputMode="numeric"
                                                value={formatRupiahInput(orderForm.priority_fee)} 
                                                onChange={e => setOrderForm('priority_fee', parseRupiahInput(e.target.value))} 
                                                className="w-full bg-slate-900 border border-amber-500/40 rounded-lg p-2 text-amber-400 font-bold font-mono focus:border-amber-400" 
                                                placeholder="cth: 150.000 atau 200.000" 
                                            />
                                            <span className="text-[10px] text-amber-400/80 block mt-1">*Admin isi manual (bisa ketik koma/titik)</span>
                                        </div>
                                    )}
                                    <div>
                                        <label className="text-slate-400 block mb-1 font-semibold">Harus diselesaikan pada (Deadline):</label>
                                        <input type="date" value={orderForm.deadline_date} onChange={e => setOrderForm('deadline_date', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-cyan-400" />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 8: METODE & OPSI PEMBAYARAN CUSTOMER */}
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                                <h4 className="font-bold text-emerald-400 text-xs border-b border-slate-800 pb-2 flex items-center justify-between">
                                    <span>💳 Metode & Opsi Pembayaran Customer</span>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                        Total Tagihan: <strong className="text-emerald-400 font-extrabold text-sm">Rp {calcTotalPrice.toLocaleString()}</strong>
                                    </span>
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                    <div>
                                        <label className="text-slate-400 block mb-1 font-semibold">Metode Pembayaran Customer:</label>
                                        <select 
                                            value={orderForm.payment_method || 'cash'} 
                                            onChange={e => setOrderForm('payment_method', e.target.value)} 
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-bold focus:border-cyan-400"
                                        >
                                            <option value="cash">💵 Cash / Tunai</option>
                                            <option value="transfer">🏦 Transfer Bank (BCA/Mandiri/BRI)</option>
                                            <option value="qris">📱 QRIS (Scan Barcode)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-slate-400 block mb-1 font-semibold">Jumlah Uang Diterima / Dibayar (Rp):</label>
                                        <input 
                                            type="text" 
                                            inputMode="numeric"
                                            value={formatRupiahInput(orderForm.custom_paid_amount)} 
                                            onChange={e => {
                                                const num = parseRupiahInput(e.target.value);
                                                const pct = calcTotalPrice > 0 ? Math.round((num / calcTotalPrice) * 100) : 50;
                                                setOrderForm(d => ({ ...d, custom_paid_amount: num, dp_percent: pct }));
                                            }} 
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-emerald-400 font-mono font-bold text-sm focus:border-cyan-400" 
                                            placeholder="cth: 500.000 atau 1.000.000" 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-[11px] text-slate-400">Tombol Cepat Bayar:</span>
                                        {[
                                            { label: 'Rp 100rb', val: 100000 },
                                            { label: 'Rp 200rb', val: 200000 },
                                            { label: 'Rp 300rb', val: 300000 },
                                            { label: 'Rp 500rb', val: 500000 },
                                            { label: '50% (DP Half)', val: Math.round(calcTotalPrice * 0.5) },
                                            { label: '⚡ Bayar Full / Lunas (100%)', val: calcTotalPrice }
                                        ].map((preset, pIdx) => (
                                            <button 
                                                key={pIdx}
                                                type="button"
                                                onClick={() => {
                                                    const pct = calcTotalPrice > 0 ? Math.round((preset.val / calcTotalPrice) * 100) : 50;
                                                    setOrderForm(d => ({ ...d, custom_paid_amount: preset.val, dp_percent: pct }));
                                                }}
                                                className={`px-2.5 py-1 border rounded text-[11px] font-mono transition ${preset.val === calcTotalPrice && calcTotalPrice > 0 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 font-bold' : 'bg-slate-900 hover:bg-cyan-500/20 text-slate-300 border-slate-700'}`}
                                            >
                                                {preset.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* OTOMATIS PENENTUAN STATUS (DP VS LUNAS) */}
                                <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs">
                                    <div>
                                        <span className="text-slate-400 block text-[11px]">Otomatis Penentuan Status Pembayaran:</span>
                                        <span className="font-mono font-extrabold text-sm">
                                            {(() => {
                                                const paid = orderForm.custom_paid_amount !== '' && orderForm.custom_paid_amount !== null && orderForm.custom_paid_amount !== undefined
                                                    ? (parseFloat(orderForm.custom_paid_amount) || 0)
                                                    : Math.round(calcTotalPrice * ((orderForm.dp_percent || 50) / 100));
                                                const pct = calcTotalPrice > 0 ? Math.round((paid / calcTotalPrice) * 100) : (orderForm.dp_percent || 50);
                                                const methodText = (orderForm.payment_method || 'cash').toUpperCase();
                                                
                                                if (paid >= calcTotalPrice && calcTotalPrice > 0) {
                                                    return <span className="text-emerald-400">✅ Lunas Langsung (100%) — {methodText}</span>;
                                                } else if (paid > 0) {
                                                    return <span className="text-amber-300">💵 Uang Muka / DP Rp {paid.toLocaleString()} ({pct}% dari Total) — {methodText}</span>;
                                                } else {
                                                    return <span className="text-slate-400">⚪ Belum Ada Pembayaran (DP 0%)</span>;
                                                }
                                            })()}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-slate-400 block text-[11px]">Sisa Pelunasan (COD):</span>
                                        <span className="font-mono font-bold text-slate-200">
                                            {(() => {
                                                const paid = orderForm.custom_paid_amount !== '' && orderForm.custom_paid_amount !== null && orderForm.custom_paid_amount !== undefined
                                                    ? (parseFloat(orderForm.custom_paid_amount) || 0)
                                                    : Math.round(calcTotalPrice * ((orderForm.dp_percent || 50) / 100));
                                                const sisa = Math.max(0, calcTotalPrice - paid);
                                                return sisa === 0 ? <span className="text-emerald-400 font-extrabold">Rp 0 (LUNAS)</span> : `Rp ${sisa.toLocaleString()}`;
                                            })()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 7: RINCIAN STRUK ORDERAN & KALKULASI HARGA (xii) */}
                            <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/40 space-y-3 font-mono">
                                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                    <h4 className="font-bold text-cyan-300 text-xs flex items-center gap-1.5 font-sans">
                                        🧾 Rincian Struk Orderan & Kalkulasi Harga
                                    </h4>
                                    <span className="text-[10px] text-slate-400">
                                        Luas Total Kaca: <strong className="text-cyan-400">{calcItems.reduce((sum, i) => sum + i.areaM2, 0).toFixed(2)} m²</strong>
                                    </span>
                                </div>

                                {/* LIST ITEM KACA RECEIPT LINES */}
                                <div className="space-y-3 text-xs">
                                    {calcItems.map((it, iIdx) => {
                                        const processFeeSum = (it.feeGM || 0) + (it.feeHT || 0) + (it.feeBV || 0) + (it.feeBor || 0) + (it.feeEtsa || 0);
                                        return (
                                            <div key={iIdx} className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-2">
                                                <div className="flex justify-between text-slate-100 font-bold border-b border-slate-800 pb-1.5">
                                                    <span>
                                                        #{iIdx + 1}. {it.glass_type || 'Kaca Dasar'} ({it.length_cm || 0} x {it.width_cm || 0} cm)
                                                    </span>
                                                    <span className="text-cyan-400 font-mono">
                                                        {it.qty} Unit (Total {it.areaM2.toFixed(2)} m²)
                                                    </span>
                                                </div>

                                                {/* RINCIAN HARGA BAHAN KACA DIBELI */}
                                                <div className="space-y-1 text-[11px] text-slate-300 pl-1">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-400">1. Harga Kaca yang Dibeli (Bahan):</span>
                                                        <strong className="text-slate-200">Rp {it.baseGlassPrice.toLocaleString()}</strong>
                                                    </div>

                                                    {/* RINCIAN BIAYA EKSEKUSI KACA */}
                                                    <div className="space-y-0.5 pl-2 border-l-2 border-slate-700/60 my-1">
                                                        <div className="text-[10px] text-cyan-400/90 font-semibold">2. Rincian Biaya Eksekusi / Proses Kaca:</div>
                                                        {it.processes && it.processes.includes('HT') && (
                                                            <div className="flex justify-between text-[10px] text-slate-400">
                                                                <span>• Potong & Halus Tepi (HT)</span>
                                                                <span>+ Rp {(it.feeHT || 0).toLocaleString()}</span>
                                                            </div>
                                                        )}
                                                        {it.processes && it.processes.includes('GM') && (
                                                            <div className="flex justify-between text-[10px] text-slate-400">
                                                                <span>• Gosok Mesin (GM)</span>
                                                                <span>+ Rp {(it.feeGM || 0).toLocaleString()}</span>
                                                            </div>
                                                        )}
                                                        {it.processes && it.processes.includes('BV') && (
                                                            <div className="flex justify-between text-[10px] text-slate-400">
                                                                <span>• Beveling (BV {it.bevel_width_cm || 1} cm)</span>
                                                                <span>+ Rp {(it.feeBV || 0).toLocaleString()}</span>
                                                            </div>
                                                        )}
                                                        {it.processes && it.processes.includes('Bor') && (
                                                            <div className="flex justify-between text-[10px] text-slate-400">
                                                                <span>• Bor Coakan Lubang ({it.hole_qty || 1} lubang)</span>
                                                                <span>+ Rp {(it.feeBor || 0).toLocaleString()}</span>
                                                            </div>
                                                        )}
                                                        {it.processes && it.processes.includes('Etsa') && (
                                                            <div className="flex justify-between text-[10px] text-slate-400">
                                                                <span>• Etsa Sandblast</span>
                                                                <span>+ Rp {(it.feeEtsa || 0).toLocaleString()}</span>
                                                            </div>
                                                        )}
                                                        {(!it.processes || it.processes.length === 0) && (
                                                            <div className="text-[10px] text-slate-500 italic">• Polos (Tanpa Proses Lanjutan)</div>
                                                        )}
                                                    </div>

                                                    <div className="flex justify-between text-[11px] text-slate-300 font-semibold pt-0.5">
                                                        <span className="text-slate-400">• Total Biaya Eksekusi Item Ini:</span>
                                                        <strong className="text-cyan-300">+ Rp {processFeeSum.toLocaleString()}</strong>
                                                    </div>
                                                </div>

                                                <div className="text-right text-xs font-extrabold text-slate-100 border-t border-slate-800 pt-1.5">
                                                    Subtotal Item Kaca #{iIdx + 1}: <span className="text-emerald-400">Rp {it.subtotal.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* AKSESORIS TAMBAHAN JIKA ADA */}
                                    {orderForm.accessories && orderForm.accessories.length > 0 && (
                                        <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
                                            <div className="font-bold text-slate-200 text-xs flex justify-between border-b border-slate-800 pb-1">
                                                <span>🛠️ Aksesoris & Hardware Tambahan:</span>
                                                <span className="text-cyan-400">Rp {calcTotalAccessoryFees.toLocaleString()}</span>
                                            </div>
                                            {orderForm.accessories.map((acc, aIdx) => {
                                                const price = typeof acc === 'object' ? (acc.price || 0) : 0;
                                                const qty = typeof acc === 'object' ? (acc.qty || 1) : 1;
                                                const name = typeof acc === 'object' ? (acc.name || 'Aksesoris') : acc;
                                                return (
                                                    <div key={aIdx} className="flex justify-between text-[11px] text-slate-300 pl-1">
                                                        <span>- {name} ({qty} {acc.unit || 'pcs'})</span>
                                                        <strong className="text-slate-200">Rp {(price * qty).toLocaleString()}</strong>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* GARIS PEMBATAS STRUK (DASHED BORDER) */}
                                <div className="border-t border-dashed border-slate-700 my-2"></div>

                                {/* RINCIAN AKHIR SUB-TOTAL, BIAYA PRIORITAS & GRAND TOTAL */}
                                <div className="space-y-1.5 text-xs font-sans">
                                    <div className="flex justify-between text-slate-300">
                                        <span>• Total Harga Kaca Dibeli (Bahan):</span>
                                        <strong className="font-mono text-slate-200">Rp {calcTotalGlassBasePrice.toLocaleString()}</strong>
                                    </div>

                                    <div className="flex justify-between text-slate-300">
                                        <span>• Total Biaya Eksekusi / Proses Kaca:</span>
                                        <strong className="font-mono text-cyan-300">+ Rp {calcTotalProcessFees.toLocaleString()}</strong>
                                    </div>

                                    {calcTotalAccessoryFees > 0 && (
                                        <div className="flex justify-between text-slate-300">
                                            <span>• Total Aksesoris & Hardware:</span>
                                            <strong className="font-mono text-slate-200">+ Rp {calcTotalAccessoryFees.toLocaleString()}</strong>
                                        </div>
                                    )}

                                    {/* BIAYA PRIORITAS PENGERJAAN */}
                                    <div className="flex justify-between items-center bg-slate-900/80 p-2 rounded-lg border border-amber-500/30">
                                        <span className="text-amber-300 font-bold flex items-center gap-1">
                                            ⚡ Biaya Prioritas Pengerjaan (Buru-buru):
                                            {orderForm.priority_status !== 'Prioritas' && <span className="text-[10px] text-slate-400 font-normal ml-1">(Status: Biasa)</span>}
                                        </span>
                                        <strong className="font-mono text-amber-400 font-extrabold text-sm">
                                            + Rp {calcPriorityFee.toLocaleString()}
                                        </strong>
                                    </div>

                                    {/* BIAYA CUSTOM ADMIN */}
                                    <div className="flex justify-between items-center bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                                        <label className="text-slate-300 font-medium">
                                            ➕ Biaya Tambahan / Custom Admin (Rp):
                                        </label>
                                        <input 
                                            type="text" 
                                            inputMode="numeric"
                                            value={formatRupiahInput(orderForm.custom_fee)} 
                                            onChange={e => setOrderForm('custom_fee', parseRupiahInput(e.target.value))} 
                                            className="w-36 bg-slate-950 border border-slate-700 rounded p-1 text-slate-100 font-mono font-bold text-xs text-right focus:border-cyan-400" 
                                            placeholder="0" 
                                        />
                                    </div>

                                    <div className="border-t border-dashed border-slate-700 pt-2 flex justify-between items-center bg-emerald-950/40 p-3 rounded-xl border border-emerald-500/40">
                                        <div>
                                            <span className="text-slate-200 block font-bold text-xs">GRAND TOTAL HARGA ORDER:</span>
                                            <span className="text-[10px] text-slate-400 font-mono">Bahan + Eksekusi + Prioritas + Custom</span>
                                        </div>
                                        <span className="font-mono font-black text-emerald-400 text-lg">
                                            Rp {calcTotalPrice.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* MODAL ACTIONS */}
                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                                <button type="button" onClick={closeHandler} className="px-4 py-2 bg-slate-800 rounded text-slate-300 text-xs font-semibold cursor-pointer">Batal</button>
                                {editingOrder.status === 'pengerjaan' ? (
                                    <button type="button" onClick={(e) => handleUpdateOrderSubmit(e, 'pengerjaan')} className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 font-extrabold text-slate-950 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer">
                                        🚀 Simpan Revisi & Kirim Peringatan Divisi
                                    </button>
                                ) : (
                                    <>
                                        <button type="button" onClick={(e) => handleUpdateOrderSubmit(e, 'draft')} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 font-bold text-white rounded text-xs flex items-center gap-1 shadow-md shadow-blue-600/20 cursor-pointer">
                                            💾 Simpan Perubahan Draf
                                        </button>
                                        <button type="button" onClick={(e) => handleUpdateOrderSubmit(e, 'pengerjaan')} className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 font-bold text-slate-950 rounded text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer">
                                            🚀 Deal & Terbit Order ({orderForm.payment_option === 'lunas' ? 'Lunas' : `DP ${orderForm.dp_percent || 50}%`})
                                        </button>
                                    </>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
    );
}

