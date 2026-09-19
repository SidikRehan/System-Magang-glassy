import React, { useState, useEffect } from 'react';
import { Tag, Printer, Copy, Check, X, SlidersHorizontal, Eye } from 'lucide-react';

export default function GlassStickerModal({
    show,
    onClose,
    order,
    selectedOrder,
    userName
}) {
    const activeOrder = order || selectedOrder;

    if (!show || !activeOrder) return null;

    // Config options
    const [layoutMode, setLayoutMode] = useState('a4_grid'); // 'a4_grid' (3 cols x N rows) or 'thermal_single' (100x75mm roll)
    const [expandByQty, setExpandByQty] = useState(true); // Generate individual label for each Qty
    const [stickerItems, setStickerItems] = useState([]);
    const [copiedNotification, setCopiedNotification] = useState(false);

    // Helper to build process shorthand like in the PDF reference: "20 X 302,5 GMKLL", "210 X 20,7 GMKLL+BVKLL 1 CM", "41X108.5 HT"
    const buildProcessShorthand = (item) => {
        const procs = Array.isArray(item.processes) ? item.processes : [];
        const procCodes = [];

        // Check GM / Gosok
        const hasGM = procs.some(p => typeof p === 'string' ? p.toUpperCase().includes('GM') || p.toUpperCase().includes('GOSOK') : (p.id === 'GM' || p.code === 'GM'));
        const hasBV = procs.some(p => typeof p === 'string' ? p.toUpperCase().includes('BV') || p.toUpperCase().includes('BEVEL') : (p.id === 'BV' || p.code === 'BV'));
        const hasHT = procs.some(p => typeof p === 'string' ? p.toUpperCase().includes('HT') || p.toUpperCase().includes('TEMPER') : (p.id === 'HT' || p.code === 'HT'));
        const hasBor = procs.some(p => typeof p === 'string' ? p.toUpperCase().includes('BOR') : (p.id === 'BOR' || p.code === 'BOR'));
        const hasEtsa = procs.some(p => typeof p === 'string' ? p.toUpperCase().includes('ETSA') || p.toUpperCase().includes('BLUR') : (p.id === 'ETSA' || p.code === 'ETSA'));

        if (hasGM) procCodes.push('GMKLL');
        if (hasBV) {
            const widthCm = item.bevel_width_cm || 1;
            procCodes.push(`+BVKLL ${widthCm} CM`);
        }
        if (hasHT) procCodes.push('HT');
        if (hasBor) procCodes.push('BOR');
        if (hasEtsa) procCodes.push('ETSA');

        // If custom raw process string is attached
        if (procCodes.length === 0 && item.process_notes) {
            return item.process_notes.toUpperCase();
        }

        return procCodes.join('');
    };

    // Initialize sticker items from activeOrder
    useEffect(() => {
        if (!activeOrder) return;

        const rawItems = Array.isArray(activeOrder.items) && activeOrder.items.length > 0
            ? activeOrder.items
            : [{
                glass_type: activeOrder.glass_type || 'KACA POLOS',
                length_cm: activeOrder.length_cm || 100,
                width_cm: activeOrder.width_cm || 50,
                thickness_mm: activeOrder.thickness_mm || 5,
                qty: activeOrder.qty || 1,
                processes: activeOrder.processes || []
            }];

        const generated = [];

        rawItems.forEach((it, idx) => {
            const qty = Math.max(1, parseInt(it.qty) || 1);
            const loops = expandByQty ? qty : 1;

            const glassTypeStr = (it.glass_type || `${it.thickness_mm || 5}MM POLOS`).toUpperCase();
            const procShorthand = buildProcessShorthand(it);
            
            // Dimensions string e.g. "20 X 302,5"
            const lenStr = String(it.length_cm || 0).replace('.', ',');
            const widStr = String(it.width_cm || 0).replace('.', ',');
            const dimProcStr = `${lenStr} X ${widStr} ${procShorthand}`.trim();

            const codeLocationStr = (it.position_code || it.notes || activeOrder.description || '').toUpperCase();

            for (let i = 0; i < loops; i++) {
                generated.push({
                    id: `${idx}-${i}`,
                    itemIndex: idx + 1,
                    pieceIndex: i + 1,
                    totalPiece: qty,
                    customerName: (activeOrder.customer_name || 'PEMESAN KACA').toUpperCase(),
                    location: (activeOrder.customer_address || activeOrder.city || '').toUpperCase(),
                    glassType: glassTypeStr,
                    dimAndProcess: dimProcStr,
                    codeLocation: codeLocationStr ? (codeLocationStr.startsWith('KODE:') || codeLocationStr.startsWith('(') ? codeLocationStr : `KODE: ${codeLocationStr}`) : ''
                });
            }
        });

        setStickerItems(generated);
    }, [activeOrder, expandByQty]);

    const handleUpdateStickerItem = (index, field, value) => {
        setStickerItems(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    // Print logic using direct Pop-up Window for 100% reliable printing on Windows Chrome/Edge/Firefox
    const handlePrint = () => {
        const cardsHtml = stickerItems.map(stk => `
            <div class="sticker-card">
                <div class="sticker-text-customer">${stk.customerName || ''}</div>
                ${stk.location ? `<div class="sticker-text-location">${stk.location}</div>` : ''}
                <div class="sticker-text-glasstype">${stk.glassType || ''}</div>
                <div class="sticker-text-dimproc">${stk.dimAndProcess || ''}</div>
                ${stk.codeLocation ? `<div class="sticker-text-codeloc">${stk.codeLocation}</div>` : ''}
            </div>
        `).join('');

        const printWindow = window.open('', '_blank', 'width=950,height=750');
        
        if (!printWindow) {
            // Fallback if popup blocker is active
            window.print();
            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Cetak Stiker Label - ${activeOrder.spo_number || activeOrder.id}</title>
                <style>
                    @page {
                        size: ${layoutMode === 'a4_grid' ? 'A4 portrait' : '100mm 75mm'};
                        margin: ${layoutMode === 'a4_grid' ? '8mm 6mm' : '2mm'};
                    }
                    * {
                        box-sizing: border-box;
                        margin: 0;
                        padding: 0;
                    }
                    body {
                        font-family: Arial, Helvetica, sans-serif;
                        background: #ffffff;
                        color: #000000;
                        padding: 6px;
                    }
                    .sticker-grid {
                        display: grid;
                        grid-template-columns: ${layoutMode === 'a4_grid' ? 'repeat(3, 1fr)' : '1fr'};
                        gap: ${layoutMode === 'a4_grid' ? '14px 10px' : '0'};
                        width: 100%;
                    }
                    .sticker-card {
                        border: 1px dashed #444444;
                        padding: 12px 8px;
                        min-height: ${layoutMode === 'a4_grid' ? '135px' : 'auto'};
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        text-align: center;
                        page-break-inside: avoid;
                        break-inside: avoid;
                        background: #ffffff;
                    }
                    .sticker-text-customer {
                        font-weight: 800;
                        font-size: 13pt;
                        line-height: 1.25;
                        text-transform: uppercase;
                        color: #000000;
                    }
                    .sticker-text-location {
                        font-weight: 800;
                        font-size: 11pt;
                        line-height: 1.2;
                        text-transform: uppercase;
                        color: #000000;
                        margin-bottom: 2px;
                    }
                    .sticker-text-glasstype {
                        font-weight: 800;
                        font-size: 11.5pt;
                        line-height: 1.2;
                        text-transform: uppercase;
                        color: #000000;
                        margin-bottom: 2px;
                    }
                    .sticker-text-dimproc {
                        font-weight: 800;
                        font-size: 12pt;
                        line-height: 1.25;
                        text-transform: uppercase;
                        color: #000000;
                    }
                    .sticker-text-codeloc {
                        font-weight: 800;
                        font-size: 10.5pt;
                        line-height: 1.2;
                        text-transform: uppercase;
                        color: #000000;
                        margin-top: 2px;
                    }
                </style>
            </head>
            <body>
                <div class="sticker-grid">
                    ${cardsHtml}
                </div>
                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                        }, 250);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    // Copy text template option to clipboard as extra backup
    const handleCopyToClipboard = () => {
        const textLines = stickerItems.map(s => {
            let lines = [s.customerName];
            if (s.location) lines.push(s.location);
            lines.push(s.glassType);
            lines.push(s.dimAndProcess);
            if (s.codeLocation) lines.push(s.codeLocation);
            return lines.join('\n');
        }).join('\n\n---\n\n');

        navigator.clipboard.writeText(textLines);
        setCopiedNotification(true);
        setTimeout(() => setCopiedNotification(false), 3000);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150">
            {/* PRINT CSS STYLES FOR IN-PAGE FALLBACK */}
            <style>{`
                @media print {
                    @page {
                        size: ${layoutMode === 'a4_grid' ? 'A4 portrait' : '100mm 75mm'};
                        margin: ${layoutMode === 'a4_grid' ? '8mm 6mm' : '2mm'};
                    }

                    body * {
                        visibility: hidden !important;
                    }

                    .no-print, .no-print-wrapper {
                        display: none !important;
                    }

                    #printable-sticker-container, #printable-sticker-container * {
                        visibility: visible !important;
                    }

                    #printable-sticker-container {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #ffffff !important;
                        color: #000000 !important;
                    }

                    .sticker-grid {
                        display: grid !important;
                        grid-template-columns: ${layoutMode === 'a4_grid' ? 'repeat(3, 1fr)' : '1fr'} !important;
                        gap: ${layoutMode === 'a4_grid' ? '14px 10px' : '0'} !important;
                        width: 100% !important;
                    }

                    .sticker-card {
                        box-sizing: border-box !important;
                        border: 1px dashed #444 !important;
                        padding: 10px 8px !important;
                        min-height: ${layoutMode === 'a4_grid' ? '135px' : 'auto'} !important;
                        display: flex !important;
                        flex-direction: column !important;
                        align-items: center !important;
                        justify-content: center !important;
                        text-align: center !important;
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                        background-color: #ffffff !important;
                    }

                    .sticker-text-customer {
                        font-family: Arial, Helvetica, sans-serif !important;
                        font-weight: 800 !important;
                        font-size: 13pt !important;
                        line-height: 1.25 !important;
                        color: #000000 !important;
                        text-transform: uppercase !important;
                    }

                    .sticker-text-location {
                        font-family: Arial, Helvetica, sans-serif !important;
                        font-weight: 800 !important;
                        font-size: 11pt !important;
                        line-height: 1.2 !important;
                        color: #000000 !important;
                        text-transform: uppercase !important;
                        margin-bottom: 2px !important;
                    }

                    .sticker-text-glasstype {
                        font-family: Arial, Helvetica, sans-serif !important;
                        font-weight: 800 !important;
                        font-size: 11.5pt !important;
                        line-height: 1.2 !important;
                        color: #000000 !important;
                        text-transform: uppercase !important;
                        margin-bottom: 2px !important;
                    }

                    .sticker-text-dimproc {
                        font-family: Arial, Helvetica, sans-serif !important;
                        font-weight: 800 !important;
                        font-size: 12pt !important;
                        line-height: 1.25 !important;
                        color: #000000 !important;
                        text-transform: uppercase !important;
                    }

                    .sticker-text-codeloc {
                        font-family: Arial, Helvetica, sans-serif !important;
                        font-weight: 800 !important;
                        font-size: 10.5pt !important;
                        line-height: 1.2 !important;
                        color: #000000 !important;
                        text-transform: uppercase !important;
                        margin-top: 2px !important;
                    }
                }
            `}</style>

            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] flex flex-col no-print-wrapper text-slate-800">
                {/* MODAL HEADER */}
                <div className="flex justify-between items-center border-b border-slate-200 pb-3.5 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-[#1b68b0]/10 flex items-center justify-center text-[#1b68b0]">
                            <Tag className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-base">
                                Cetak Stiker Label Orderan Kaca (Admin Gudang)
                            </h3>
                            <p className="text-xs text-slate-500 font-mono">
                                SPO: {activeOrder.spo_number || activeOrder.id} — {activeOrder.customer_name} ({stickerItems.length} Stiker Kaca)
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl p-1.5 transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* CONTROLS & PRINT FORMAT SELECTION */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3.5 shrink-0 text-xs">
                    <div>
                        <label className="text-slate-600 font-bold block mb-1">Format Layout Cetak Label:</label>
                        <select
                            value={layoutMode}
                            onChange={e => setLayoutMode(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl text-slate-800 px-3 py-2 font-semibold focus:border-[#1b68b0] focus:outline-none"
                        >
                            <option value="a4_grid">Lembar A4 Grid (3 Kolom x N Baris)</option>
                            <option value="thermal_single">Roll Thermal Printer (100mm x 75mm)</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-slate-600 font-bold block mb-1">Jumlah Stiker Kaca:</label>
                        <select
                            value={expandByQty ? 'true' : 'false'}
                            onChange={e => setExpandByQty(e.target.value === 'true')}
                            className="w-full bg-white border border-slate-200 rounded-xl text-slate-800 px-3 py-2 font-semibold focus:border-[#1b68b0] focus:outline-none"
                        >
                            <option value="true">1 Stiker per Lembar Kaca (Sesuai Qty)</option>
                            <option value="false">1 Stiker per Baris Spesifikasi Item</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="w-full bg-[#1b68b0] hover:bg-[#15528c] text-white font-bold px-4 py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Cetak Stiker ({stickerItems.length})</span>
                        </button>
                    </div>
                </div>

                {/* PREVIEW CONTAINER */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                    <div className="flex justify-between items-center px-1 flex-wrap gap-2">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5 text-[#1b68b0]" />
                            <span>Preview Stiker ({layoutMode === 'a4_grid' ? '3-Kolom A4' : '1-Kolom Thermal Roll'})</span>
                        </span>
                        <div className="flex items-center gap-2">
                            {copiedNotification && (
                                <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    <span>Tersalin ke Clipboard!</span>
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={handleCopyToClipboard}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition flex items-center gap-1.5"
                                title="Salin teks template stiker ke clipboard"
                            >
                                <Copy className="w-3.5 h-3.5 text-slate-500" />
                                <span>Salin Template</span>
                            </button>
                        </div>
                    </div>

                    {/* PRINTABLE AREA CONTAINER */}
                    <div id="printable-sticker-container" className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200 text-slate-900">
                        <div className={`grid ${layoutMode === 'a4_grid' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' : 'grid-cols-1 max-w-sm mx-auto'} gap-3.5 sticker-grid`}>
                            {stickerItems.map((stk, idx) => (
                                <div
                                    key={stk.id}
                                    className="sticker-card border border-dashed border-slate-300 p-4 rounded-xl bg-white flex flex-col items-center justify-center text-center shadow-2xs relative group hover:border-[#1b68b0] transition"
                                >
                                    {/* Piece counter badge for reference */}
                                    {stk.totalPiece > 1 && (
                                        <span className="no-print absolute top-2 right-2 text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md">
                                            #{stk.pieceIndex}/{stk.totalPiece}
                                        </span>
                                    )}

                                    {/* Line 1: Customer Name */}
                                    <input
                                        type="text"
                                        value={stk.customerName}
                                        onChange={e => handleUpdateStickerItem(idx, 'customerName', e.target.value)}
                                        className="sticker-text-customer text-center w-full font-black border-none focus:bg-slate-50 focus:ring-1 focus:ring-[#1b68b0] rounded p-0 text-slate-950 uppercase"
                                    />

                                    {/* Line 2: Location / Address / City */}
                                    {stk.location !== undefined && (
                                        <input
                                            type="text"
                                            value={stk.location}
                                            placeholder="LOKASI / KOTA (OPSIONAL)"
                                            onChange={e => handleUpdateStickerItem(idx, 'location', e.target.value)}
                                            className="sticker-text-location text-center w-full font-bold border-none focus:bg-slate-50 focus:ring-1 focus:ring-[#1b68b0] rounded p-0 text-slate-800 uppercase"
                                        />
                                    )}

                                    {/* Line 3: Glass Type & Thickness */}
                                    <input
                                        type="text"
                                        value={stk.glassType}
                                        onChange={e => handleUpdateStickerItem(idx, 'glassType', e.target.value)}
                                        className="sticker-text-glasstype text-center w-full font-bold border-none focus:bg-slate-50 focus:ring-1 focus:ring-[#1b68b0] rounded p-0 text-slate-800 uppercase"
                                    />

                                    {/* Line 4: Dimensions & Process Code (e.g. 20 X 302,5 GMKLL) */}
                                    <input
                                        type="text"
                                        value={stk.dimAndProcess}
                                        onChange={e => handleUpdateStickerItem(idx, 'dimAndProcess', e.target.value)}
                                        className="sticker-text-dimproc text-center w-full font-black border-none focus:bg-slate-50 focus:ring-1 focus:ring-[#1b68b0] rounded p-0 text-slate-950 uppercase"
                                    />

                                    {/* Line 5: Code / Position / Notes */}
                                    <input
                                        type="text"
                                        value={stk.codeLocation}
                                        placeholder="KODE / CATATAN POSISI (OPSIONAL)"
                                        onChange={e => handleUpdateStickerItem(idx, 'codeLocation', e.target.value)}
                                        className="sticker-text-codeloc text-center w-full font-bold border-none focus:bg-slate-50 focus:ring-1 focus:ring-[#1b68b0] rounded p-0 text-slate-700 uppercase"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* FOOTER ACTIONS */}
                <div className="flex justify-between items-center border-t border-slate-200 pt-3 shrink-0 no-print flex-wrap gap-2">
                    <span className="text-xs text-slate-500">
                        Stiker label siap cetak langsung tanpa perlu format manual di dokumen eksternal.
                    </span>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer"
                        >
                            Tutup
                        </button>
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="bg-[#1b68b0] hover:bg-[#15528c] text-white font-bold px-5 py-2.5 rounded-xl text-xs transition flex items-center gap-2 shadow-xs cursor-pointer"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Cetak Stiker Sekarang</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
