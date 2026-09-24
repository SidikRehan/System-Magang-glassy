import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { X, Tag, Scissors, AlertTriangle, CheckCircle2, ArrowRight, Phone, MapPin, Calendar, Clock, FileText, Layers, Box, Sparkles, Plus, Minus, Edit3, Trash2, Search, RotateCcw, Info, Check, ShieldAlert, FileCheck, Layers3, AlertCircle } from 'lucide-react';

export default function DivisionExecutionModal({
    show,
    onClose,
    selectedExecutionOrder,
    roleTitles = {},
    userRole = '',
    productionSubTab = '',
    isDivisionWorker = false,
    onAcknowledgeRevision,
    onOpenComplaintModal,
    onOpenScrapPopup,
    onFinishJobSubmit,
    formatIndonesianDate = (d) => d || '-',
    formatIndonesianDateTime = (d) => d || '-',
    onOpenSketchLightbox = () => {},
    sheetGlasses = [],
    scrapGlasses = [],
    onRecordRawMaterialSuccess = () => {},
    onOpenStickerModal = null
}) {
    if (!show || !selectedExecutionOrder) return null;

    const orderedItems = Array.isArray(selectedExecutionOrder.items) && selectedExecutionOrder.items.length > 0
        ? selectedExecutionOrder.items
        : [{ glass_type: selectedExecutionOrder.glass_type || 'Kaca Cermin 5 mm polos', qty: 1 }];

    const uniqueGlassTypes = React.useMemo(() => {
        const map = new Map();
        orderedItems.forEach(it => {
            const name = it.glass_type || selectedExecutionOrder.glass_type || 'Kaca Lembaran';
            const existing = map.get(name) || { glass_type: name, totalQty: 0, itemCount: 0 };
            existing.totalQty += (parseInt(it.qty) || 1);
            existing.itemCount += 1;
            map.set(name, existing);
        });
        return Array.from(map.values());
    }, [orderedItems, selectedExecutionOrder]);

    const initialGlassType = uniqueGlassTypes[0]?.glass_type || orderedItems[0]?.glass_type || selectedExecutionOrder.glass_type || '';

    const [rawGlassType, setRawGlassType] = useState(initialGlassType);
    const [rawSheetsUsedMap, setRawSheetsUsedMap] = useState({});

    const findStockItemForType = React.useCallback((gt) => {
        if (!gt || !Array.isArray(sheetGlasses) || sheetGlasses.length === 0) return null;
        const lowerType = gt.toLowerCase().trim();
        
        let match = sheetGlasses.find(g =>
            g?.name && (
                g.name.toLowerCase().includes(lowerType) ||
                lowerType.includes(g.name.toLowerCase())
            )
        );
        if (match) return match;

        const thickMatch = lowerType.match(/(\d+)\s*mm/);
        const thickNum = thickMatch ? thickMatch[1] : null;

        const keywords = ['cermin', 'bening', 'tempered', 'riben', 'etsa', 'laminated', 'tinted', 'bronze', 'grey', 'acryl'];
        const matchedKw = keywords.find(kw => lowerType.includes(kw));

        return sheetGlasses.find(g => {
            const gLower = (g.name || '').toLowerCase();
            const hasThick = thickNum ? (gLower.includes(`${thickNum} mm`) || gLower.includes(`${thickNum}mm`)) : true;
            const hasKw = matchedKw ? gLower.includes(matchedKw) : true;
            return hasThick && hasKw;
        }) || null;
    }, [sheetGlasses]);

    const currentStockItem = React.useMemo(() => {
        return findStockItemForType(rawGlassType);
    }, [rawGlassType, findStockItemForType]);

    const getRawSheetsForType = (gt = rawGlassType) => {
        if (!gt) return 1;
        const val = rawSheetsUsedMap[gt];
        let num = val !== undefined && val !== null ? val : 1;
        if (num === '') return '';
        
        const stockItem = gt === rawGlassType ? currentStockItem : findStockItemForType(gt);
        if (stockItem && stockItem.qty !== undefined) {
            const parsed = parseInt(num, 10);
            if (!isNaN(parsed) && parsed > stockItem.qty) {
                return stockItem.qty === 0 ? 0 : stockItem.qty;
            }
        }
        return num;
    };

    const updateRawSheetsForType = (val, gt = rawGlassType) => {
        if (!gt) return;
        if (val === '') {
            setRawSheetsUsedMap(prev => ({
                ...prev,
                [gt]: ''
            }));
            return;
        }

        let num = parseInt(val, 10);
        if (isNaN(num)) num = 1;

        const stockItem = gt === rawGlassType ? currentStockItem : findStockItemForType(gt);
        const maxStock = stockItem ? stockItem.qty : null;

        if (maxStock !== null && maxStock !== undefined) {
            const minAllowed = maxStock === 0 ? 0 : 1;
            num = Math.max(minAllowed, Math.min(num, maxStock));
        } else {
            num = Math.max(1, num);
        }

        setRawSheetsUsedMap(prev => ({
            ...prev,
            [gt]: num
        }));
    };

    const rawSheetsUsed = getRawSheetsForType();
    const [rawNotes, setRawNotes] = useState('');
    const [isSubmittingRaw, setIsSubmittingRaw] = useState(false);

    // State untuk Konfirmasi & Penolakan Kaca Sisa oleh Divisi HT
    const [isSubmittingUseScrap, setIsSubmittingUseScrap] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReasonType, setRejectReasonType] = useState('baret_cacat');
    const [rejectNotes, setRejectNotes] = useState('');
    const [resizeScrap, setResizeScrap] = useState(false);
    const [newLengthCm, setNewLengthCm] = useState('');
    const [newWidthCm, setNewWidthCm] = useState('');
    const [isSubmittingReject, setIsSubmittingReject] = useState(false);

    // State untuk Edit / Potong Ulang Kaca Sisa di Rak
    const [showEditScrapModal, setShowEditScrapModal] = useState(false);
    const [selectedScrapToEdit, setSelectedScrapToEdit] = useState(null);
    const [editScrapForm, setEditScrapForm] = useState({
        id: null,
        length_cm: '',
        width_cm: '',
        rak_location: '',
        status: 'Layak Pakai',
        notes: ''
    });
    // State penanda lembar terpotong per item (1, 2, 3 ... Qty)
    const [cutTracker, setCutTracker] = useState({});

    // Calculate recommended next division
    const computeDefaultNextDiv = React.useCallback((ord) => {
        if (!ord) return 'QC_Ready';
        const fixedSeq = ['HT', 'GM', 'BV', 'Etsa'];
        const reqCodes = ['HT'];
        const addC = (p) => { if (p && ['GM', 'BV', 'Etsa'].includes(p) && !reqCodes.includes(p)) reqCodes.push(p); };
        if (Array.isArray(ord.processes)) ord.processes.forEach(addC);
        if (Array.isArray(ord.items)) {
            ord.items.forEach(it => { if (Array.isArray(it.processes)) it.processes.forEach(addC); });
        }
        reqCodes.sort((a, b) => fixedSeq.indexOf(a) - fixedSeq.indexOf(b));
        const curKey = (ord.current_division || '').replace('divisi_', '').toUpperCase();
        const curIdx = reqCodes.indexOf(curKey);
        if (curIdx >= 0 && curIdx < reqCodes.length - 1) {
            const map = { 'HT': 'divisi_ht', 'GM': 'divisi_gm', 'BV': 'divisi_bv', 'Etsa': 'divisi_etsa' };
            return map[reqCodes[curIdx + 1]] || 'QC_Ready';
        }
        return 'QC_Ready';
    }, []);

    const [selectedNextDiv, setSelectedNextDiv] = useState(() => computeDefaultNextDiv(selectedExecutionOrder));

    React.useEffect(() => {
        setSelectedNextDiv(computeDefaultNextDiv(selectedExecutionOrder));
    }, [selectedExecutionOrder, computeDefaultNextDiv]);

    const getCutCount = (itemIdx) => {
        const itemState = cutTracker[itemIdx] || {};
        return Object.keys(itemState).filter(k => itemState[k]).length;
    };

    const updateCutCount = (itemIdx, newCount, totalQty) => {
        const val = Math.max(0, Math.min(totalQty, parseInt(newCount) || 0));
        setCutTracker(prev => {
            const newState = {};
            for (let i = 1; i <= val; i++) {
                newState[i] = true;
            }
            return {
                ...prev,
                [itemIdx]: newState
            };
        });
    };

    const toggleCutTracker = (itemIdx, pieceNum) => {
        setCutTracker(prev => {
            const itemState = prev[itemIdx] || {};
            const isDone = itemState[pieceNum];
            return {
                ...prev,
                [itemIdx]: {
                    ...itemState,
                    [pieceNum]: !isDone
                }
            };
        });
    };

    const toggleAllCutTracker = (itemIdx, totalQty) => {
        setCutTracker(prev => {
            const itemState = prev[itemIdx] || {};
            const currentCount = Object.keys(itemState).filter(k => itemState[k]).length;
            const allDone = currentCount === totalQty;
            
            const newState = {};
            if (!allDone) {
                for (let i = 1; i <= totalQty; i++) {
                    newState[i] = true;
                }
            }
            return {
                ...prev,
                [itemIdx]: newState
            };
        });
    };

    // Sub-tab switcher untuk area pencatatan bahan & sisa potong (scrap): 'raw' | 'scrap'
    const [rawSectionTab, setRawSectionTab] = useState('raw');
    const [scrapFormsMap, setScrapFormsMap] = useState({});
    const [submittingScrapType, setSubmittingScrapType] = useState(null);

    const getDefaultRakLocation = (gt = '') => {
        const lower = (gt || '').toLowerCase();
        if (lower.includes('cermin') || lower.includes('mirror')) return 'Rak A02';
        if (lower.includes('tempered') || lower.includes('bevel')) return 'Rak B01';
        if (lower.includes('etsa') || lower.includes('sandblast')) return 'Rak B02';
        return 'Rak A01';
    };

    const getScrapFormField = (gt, field) => {
        const form = scrapFormsMap[gt] || {};
        if (field === 'rak_location') {
            return form.rak_location || getDefaultRakLocation(gt);
        }
        return form[field] || '';
    };

    const updateScrapFormField = (gt, field, value) => {
        setScrapFormsMap(prev => ({
            ...prev,
            [gt]: {
                ...prev[gt],
                [field]: value
            }
        }));
    };

    const [embeddedScrapForm, setEmbeddedScrapForm] = useState({
        glass_type: initialGlassType,
        length_cm: '',
        width_cm: '',
        rak_location: 'Rak A02'
    });
    const [isSubmittingEmbeddedScrap, setIsSubmittingEmbeddedScrap] = useState(false);
    const [recentSavedScraps, setRecentSavedScraps] = useState([]);

    // State untuk inline edit ukuran sisa potong yang baru diinput
    const [editingScrapId, setEditingScrapId] = useState(null);
    const [inlineEditForm, setInlineEditForm] = useState({
        length_cm: '',
        width_cm: '',
        rak_location: 'Rak A02',
        status: 'Layak Pakai'
    });

    const handleStartEditScrap = (sc) => {
        setEditingScrapId(sc.id);
        setInlineEditForm({
            length_cm: sc.length_cm,
            width_cm: sc.width_cm,
            rak_location: sc.rak_location || 'Rak A02',
            status: sc.status || 'Layak Pakai'
        });
    };

    const handleSaveInlineEditScrap = (sc) => {
        if (!inlineEditForm.length_cm || !inlineEditForm.width_cm) {
            alert('Mohon lengkapi Ukuran Panjang (cm) dan Lebar (cm)!');
            return;
        }

        const newLen = inlineEditForm.length_cm;
        const newWid = inlineEditForm.width_cm;
        const newRak = inlineEditForm.rak_location;

        setRecentSavedScraps(prev => prev.map(item => {
            if (item.id === sc.id) {
                return {
                    ...item,
                    length_cm: newLen,
                    width_cm: newWid,
                    rak_location: newRak,
                    is_edited: true
                };
            }
            return item;
        }));

        const matchedScrap = Array.isArray(scrapGlasses) ? scrapGlasses.find(s => s.id === sc.id || (s.scrap_code && s.scrap_code === sc.scrap_code)) : null;
        const dbId = sc.db_id || (matchedScrap ? matchedScrap.id : null);

        if (dbId) {
            router.post(route('scrap.update', dbId), {
                length_cm: newLen,
                width_cm: newWid,
                rak_location: newRak,
                status: inlineEditForm.status || 'Layak Pakai',
            }, { preserveScroll: true });
        }

        setEditingScrapId(null);
    };

    const handleSaveScrapForType = (e, gt) => {
        e.preventDefault();
        const length_cm = getScrapFormField(gt, 'length_cm');
        const width_cm = getScrapFormField(gt, 'width_cm');
        const rak_location = getScrapFormField(gt, 'rak_location');

        if (!length_cm || !width_cm) {
            alert(`Mohon lengkapi Ukuran Panjang (cm) dan Lebar (cm) untuk sisa kaca ${gt}!`);
            return;
        }

        setSubmittingScrapType(gt);
        const payload = {
            glass_type: (gt || '').trim() || '-',
            length_cm: length_cm,
            width_cm: width_cm,
            rak_location: (rak_location || '').trim() || getDefaultRakLocation(gt),
            status: 'Layak Pakai'
        };

        router.post(route('scrap.store'), payload, {
            preserveScroll: true,
            onSuccess: () => {
                setSubmittingScrapType(null);

                const newScrapRecord = {
                    id: Date.now(),
                    glass_type: payload.glass_type,
                    length_cm: payload.length_cm,
                    width_cm: payload.width_cm,
                    rak_location: payload.rak_location,
                    created_at: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                };
                setRecentSavedScraps(prev => [newScrapRecord, ...prev]);

                alert(`✅ Sukses! Sisa Kaca (${payload.glass_type} — ${payload.length_cm} × ${payload.width_cm} cm) berhasil disimpan ke ${payload.rak_location}!`);

                updateScrapFormField(gt, 'length_cm', '');
                updateScrapFormField(gt, 'width_cm', '');
            },
            onError: () => {
                setSubmittingScrapType(null);
            }
        });
    };

    const handleSaveEmbeddedScrap = (e) => {
        e.preventDefault();
        if (!embeddedScrapForm.glass_type || !embeddedScrapForm.length_cm || !embeddedScrapForm.width_cm) {
            alert('Mohon lengkapi Jenis Kaca Sisa, Ukuran Panjang (cm), dan Lebar (cm)!');
            return;
        }
        setIsSubmittingEmbeddedScrap(true);
        const payload = {
            ...embeddedScrapForm,
            glass_type: (embeddedScrapForm.glass_type || '').trim() || '-',
            rak_location: (embeddedScrapForm.rak_location || '').trim() || 'Rak A02',
        };
        router.post(route('scrap.store'), payload, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmittingEmbeddedScrap(false);

                // Tambahkan ke daftar pengingat ukuran terinput
                const newScrapRecord = {
                    id: Date.now(),
                    glass_type: payload.glass_type,
                    length_cm: payload.length_cm,
                    width_cm: payload.width_cm,
                    rak_location: payload.rak_location,
                    created_at: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                };
                setRecentSavedScraps(prev => [newScrapRecord, ...prev]);

                alert(`✅ Sukses! Kaca Sisa Potong (${payload.glass_type} — ${payload.length_cm} × ${payload.width_cm} cm) berhasil disimpan ke ${payload.rak_location}!`);
                setEmbeddedScrapForm({
                    glass_type: initialGlassType,
                    length_cm: '',
                    width_cm: '',
                    rak_location: payload.rak_location || 'Rak A02'
                });
            },
            onError: () => {
                setIsSubmittingEmbeddedScrap(false);
            }
        });
    };

    const handleSelectScrapForForm = (it) => {
        setEmbeddedScrapForm(prev => ({
            ...prev,
            glass_type: it.glass_type || initialGlassType,
            length_cm: '',
            width_cm: ''
        }));
        setRawSectionTab('scrap');
    };

    React.useEffect(() => {
        if (selectedExecutionOrder) {
            const firstItem = Array.isArray(selectedExecutionOrder.items) && selectedExecutionOrder.items.length > 0
                ? selectedExecutionOrder.items[0].glass_type
                : selectedExecutionOrder.glass_type;
            setRawGlassType(firstItem || '');
            setRawSheetsUsedMap({});
        }
    }, [selectedExecutionOrder]);

    // currentStockItem is memoized at top level

    const handleRecordRawMaterial = (e) => {
        e.preventDefault();
        const currentQtyVal = getRawSheetsForType();
        const usedQty = parseInt(currentQtyVal) || 0;
        if (!rawGlassType || usedQty < 1) {
            alert('⚠️ Mohon pilih bahan kaca dan tentukan jumlah lembaran (minimal 1 lembar)!');
            return;
        }

        // VALIDASI KETAT SINKRONISASI STOK TERSEDIA
        if (currentStockItem) {
            if (usedQty > currentStockItem.qty) {
                alert(`❌ PEMAKAIAN MELEBIHI STOK AKTIF!\n\nStok kaca "${currentStockItem.name}" di Gudang saat ini hanya tersisa ${currentStockItem.qty} ${currentStockItem.unit}.\n\nAnda menginput pemakaian sebanyak ${usedQty} Lembar.\nPemakaian TIDAK DAPAT dicatat karena stok tidak mencukupi!`);
                return;
            }
        }

        setIsSubmittingRaw(true);
        router.post(route('orders.raw_material', selectedExecutionOrder.id), {
            glass_type: rawGlassType,
            sheets_used: usedQty,
            notes: rawNotes
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmittingRaw(false);
                onRecordRawMaterialSuccess(rawGlassType, usedQty);
                updateRawSheetsForType(1, rawGlassType);
                setRawNotes('');
            },
            onError: () => {
                setIsSubmittingRaw(false);
            }
        });
    };

    const handleUseScrapSubmit = () => {
        if (!selectedExecutionOrder) return;
        setIsSubmittingUseScrap(true);
        router.post(route('orders.use_scrap', selectedExecutionOrder.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmittingUseScrap(false);
                if (selectedExecutionOrder) {
                    const currentStr = selectedExecutionOrder.used_scrap_rak || '';
                    if (!currentStr.startsWith('✅')) {
                        selectedExecutionOrder.used_scrap_rak = '✅ [TERPAKAI DIVISI HT] ' + currentStr;
                    }
                }
            },
            onError: () => {
                setIsSubmittingUseScrap(false);
            }
        });
    };

    const handleRejectScrapSubmit = (e) => {
        e.preventDefault();
        setIsSubmittingReject(true);

        const matchedScrap = scrapGlasses.find(s => selectedExecutionOrder.used_scrap_rak?.includes(s.scrap_code));

        router.post(route('orders.reject_scrap', selectedExecutionOrder.id), {
            reason_type: rejectReasonType,
            notes: rejectNotes,
            resize_scrap: resizeScrap,
            new_length_cm: newLengthCm,
            new_width_cm: newWidthCm,
            scrap_id: matchedScrap ? matchedScrap.id : null,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmittingReject(false);
                setShowRejectModal(false);
                if (selectedExecutionOrder) {
                    selectedExecutionOrder.used_scrap_rak = '❌ [DITOLAK DIVISI HT] ' + rejectReasonType + (rejectNotes ? ` ("${rejectNotes}")` : '');
                }
                setRejectNotes('');
                setResizeScrap(false);
                setNewLengthCm('');
                setNewWidthCm('');
            },
            onError: () => {
                setIsSubmittingReject(false);
            }
        });
    };

    const handleOpenEditScrapModal = (scrapItem) => {
        if (!scrapItem) return;
        setSelectedScrapToEdit(scrapItem);
        setEditScrapForm({
            id: scrapItem.id,
            length_cm: scrapItem.length_cm,
            width_cm: scrapItem.width_cm,
            rak_location: scrapItem.rak_location,
            status: scrapItem.status || 'Layak Pakai',
            notes: ''
        });
        setShowEditScrapModal(true);
    };

    const handleUpdateScrapSubmit = (e) => {
        e.preventDefault();
        if (!editScrapForm.id) return;

        setIsSubmittingScrapEdit(true);
        router.post(route('scrap.update', editScrapForm.id), editScrapForm, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmittingScrapEdit(false);
                setShowEditScrapModal(false);
            },
            onError: () => {
                setIsSubmittingScrapEdit(false);
            }
        });
    };

    return (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
                    <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 lg:p-8 shadow-2xl space-y-5 sm:space-y-6 relative my-auto text-slate-800">
                        
                        {/* DEKORASI ACCENT BG */}
                        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

                        {/* MODAL HEADER BAR */}
                        <div className="flex justify-between items-start border-b border-slate-200 pb-4 relative z-10 gap-3">
                            <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="bg-[#1b68b0]/10 text-[#1b68b0] font-extrabold text-[11px] px-3 py-1 rounded-full border border-[#1b68b0]/20 flex items-center gap-1.5 shadow-xs">
                                        <span className="w-2 h-2 rounded-full bg-[#1b68b0] animate-ping"></span>
                                        <span>MODAL EKSEKUSI WORKSTATION</span>
                                    </span>
                                    <span className="font-black text-[#1b68b0] font-mono text-2xl tracking-tight">{selectedExecutionOrder.spo_number}</span>
                                    <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border shadow-xs ${selectedExecutionOrder.priority_status === 'Prioritas' ? 'bg-red-600 text-white border-red-500 font-black' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                                        {selectedExecutionOrder.priority_status === 'Prioritas' ? 'PRIORITAS TINGGI' : 'Biasa'}
                                    </span>
                                </div>
                                <h3 className="font-extrabold text-slate-900 text-xl tracking-tight mt-1">{selectedExecutionOrder.customer_name}</h3>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3">
                                {onOpenStickerModal && (
                                    <button
                                        type="button"
                                        onClick={() => onOpenStickerModal(selectedExecutionOrder)}
                                        className="bg-[#1b68b0]/10 hover:bg-[#1b68b0]/20 text-[#1b68b0] border border-[#1b68b0]/30 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                                        title="Cetak Stiker Label Orderan Kaca"
                                    >
                                        <Tag className="w-3.5 h-3.5" />
                                        <span>Cetak Stiker</span>
                                    </button>
                                )}
                                <span className="hidden sm:inline-block text-xs font-bold px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                                    Divisi: {roleTitles[selectedExecutionOrder.current_division] || selectedExecutionOrder.current_division}
                                </span>
                                <button 
                                    onClick={() => onClose()}
                                    className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl p-1.5 transition cursor-pointer"
                                    title="Tutup Modal"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* PERINGATAN REVISI BANNER IN EXECUTION MODAL */}
                        {selectedExecutionOrder.revision_status === 'pending_division' && (
                            <div className="bg-rose-950/90 border-2 border-rose-500 rounded-2xl p-4 text-rose-200 text-xs space-y-2 animate-pulse shadow-lg relative z-10">
                                <div className="font-extrabold text-rose-300 flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2">
                                        <span>⚠️ PERINGATAN REVISI ORDERAN DARI ADMIN TOKO!</span>
                                    </span>
                                    <span className="bg-rose-500 text-white font-mono px-2.5 py-0.5 rounded-full text-[10px]">
                                        REVISI PENDING
                                    </span>
                                </div>
                                <p className="text-xs text-slate-200 leading-relaxed">
                                    Admin Toko telah merevisi deskripsi, foto sketsa project, atau dimensi ukuran item kaca. <strong>Pekerja divisi wajib mengonfirmasi/menerima revisian ini terlebih dahulu</strong> sebelum melanjutkan/menyelesaikan pengerjaan.
                                </p>
                                {selectedExecutionOrder.revision_notes && (
                                    <div className="bg-slate-950/90 p-2.5 rounded-xl border border-rose-500/40 text-xs text-amber-300 font-mono">
                                        📝 Catatan Revisi Admin Toko: <strong>{selectedExecutionOrder.revision_notes}</strong>
                                    </div>
                                )}
                                <div className="flex justify-end pt-1">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onAcknowledgeRevision(selectedExecutionOrder.id);
                                            onClose();
                                        }}
                                        className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5 shadow-xl shadow-amber-500/30 cursor-pointer"
                                    >
                                        🔄 Terima & Eksekusi Revisi SPO
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* WATERMARK BADGE FOR COMPLETED & REVISED ORDERS */}
                        {selectedExecutionOrder.is_revised && (
                            <div className="border-2 border-dashed border-amber-500/60 bg-amber-500/10 p-3.5 rounded-2xl text-center shadow-lg relative overflow-hidden my-2 z-10">
                                <div className="text-xl sm:text-2xl font-black text-amber-400 tracking-widest uppercase rotate-[-1deg] drop-shadow">
                                    🏆 ORDERAN SELESAI & SUDAH DIREVISI
                                </div>
                                <p className="text-[11px] text-amber-200/90 font-mono mt-1">
                                    SPO-{selectedExecutionOrder.spo_number} telah berhasil diproses & diselesaikan dengan penyesuaian revisi dari Admin Toko ({selectedExecutionOrder.revision_count || 1}x Revisi).
                                </p>
                            </div>
                        )}

                        {/* REVISION HISTORY TIMELINE FOR ADMIN GUDANG & OPERATORS */}
                        {Array.isArray(selectedExecutionOrder.revision_history) && selectedExecutionOrder.revision_history.length > 0 && (
                            <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-4 space-y-2 text-xs">
                                <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
                                    <span className="font-extrabold text-amber-300 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                                        📜 Riwayat & Perincian Perubahan Revisi ({selectedExecutionOrder.revision_history.length}x Revisi)
                                    </span>
                                </div>
                                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                    {selectedExecutionOrder.revision_history.map((rev, rIdx) => (
                                        <div key={rIdx} className="bg-slate-950/80 p-3 rounded-xl border border-amber-500/30 space-y-1">
                                            <div className="flex justify-between items-center text-[11px] font-mono">
                                                <span className="font-bold text-amber-400">Revisi #{rev.revision_number || (rIdx + 1)} — oleh {rev.revised_by || 'Admin Toko'}</span>
                                                <span className="text-slate-400">{rev.revised_at || '-'}</span>
                                            </div>
                                            <p className="text-slate-100 font-bold text-xs whitespace-pre-line leading-relaxed">
                                                {rev.notes || rev.user_notes || '-'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* CUSTOMER & ORDER INFO GRID PANEL */}
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-800 shadow-xs">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span className="text-slate-500 w-24">Telepon:</span>
                                    <strong className="text-slate-800 font-mono font-bold">{selectedExecutionOrder.customer_phone}</strong>
                                </div>
                                <div className="flex items-start gap-2">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                    <span className="text-slate-500 w-24 shrink-0">Alamat Kirim:</span>
                                    <span className="text-slate-700 font-semibold">{selectedExecutionOrder.customer_address}</span>
                                </div>
                            </div>

                            <div className="space-y-2 md:border-l md:border-slate-200 md:pl-5">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span className="text-slate-500 w-28">Target Deadline:</span>
                                    <strong className="text-[#1b68b0] font-mono font-extrabold">{formatIndonesianDate(selectedExecutionOrder.deadline_date)}</strong>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span className="text-slate-500 w-28">Posisi Divisi:</span>
                                    <span className="text-[#70b03c] font-bold">{roleTitles[selectedExecutionOrder.current_division] || selectedExecutionOrder.current_division}</span>
                                </div>
                            </div>
                        </div>

                        {/* LAMPIRAN SKETSA POLA & GAMBAR SAMBUNGAN KACA */}
                        {selectedExecutionOrder.sketch_photo_path && (
                            <div className="bg-slate-50 border border-slate-200 p-4 sm:p-5 rounded-2xl space-y-3 relative z-10 shadow-xs text-slate-800">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-xs font-black text-[#1b68b0] uppercase tracking-wider flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-[#1b68b0]" />
                                        <span>SKETSA POLA & GAMBAR SAMBUNGAN KACA (ACUAN PEKERJA DIVISI)</span>
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={() => onOpenSketchLightbox(selectedExecutionOrder.sketch_photo_path, selectedExecutionOrder.spo_number)}
                                        className="bg-[#1b68b0]/10 hover:bg-[#1b68b0] text-[#1b68b0] hover:text-white border border-[#1b68b0]/30 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                                    >
                                        <Search className="w-3.5 h-3.5" />
                                        <span>Perbesar Gambar Sketsa</span>
                                    </button>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div 
                                        onClick={() => onOpenSketchLightbox(selectedExecutionOrder.sketch_photo_path, selectedExecutionOrder.spo_number)}
                                        className="relative group cursor-pointer w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-2 border-slate-200 bg-white shrink-0 shadow-xs"
                                    >
                                        <img 
                                            src={selectedExecutionOrder.sketch_photo_path.startsWith('http') || selectedExecutionOrder.sketch_photo_path.startsWith('/') ? selectedExecutionOrder.sketch_photo_path : `/storage/${selectedExecutionOrder.sketch_photo_path}`}
                                            alt="Sketsa Pola Kaca"
                                            className="w-full h-full object-contain transition transform group-hover:scale-105 p-1"
                                        />
                                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white text-xs font-bold gap-1">
                                            <Search className="w-4 h-4" />
                                            <span>Klik Perbesar</span>
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-600 space-y-1.5">
                                        <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                                            <Tag className="w-4 h-4 text-[#1b68b0]" />
                                            <span>Acuan Pemotongan & Sambungan Pola Kaca</span>
                                        </div>
                                        <p className="text-slate-500 text-[11px] leading-relaxed">
                                            Admin Gudang dan Pekerja Divisi (Potong/HT, Gosok/GM, Bevel/BV, Etsa) wajib melihat sketsa ini sebagai acuan pola fisik, arah sambungan gambar/cermin, dan ukuran pemotongan kaca.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TIMELINE TANGGAL LIFECYCLE ORDER */}
                        <div className="space-y-2">
                            <h4 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <span>Lifecycle Timeline Tanggal Track:</span>
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                                    <span className="text-slate-500 text-[10px] block font-bold">Pembuatan Order (Toko):</span>
                                    <strong className="text-[#1b68b0] font-bold block text-xs">{formatIndonesianDate(selectedExecutionOrder.order_date)}</strong>
                                </div>
                                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                                    <span className="text-slate-500 text-[10px] block font-bold">Diturunkan Gudang:</span>
                                    <strong className="text-slate-800 font-bold block text-xs">{selectedExecutionOrder.gudang_released_at ? formatIndonesianDateTime(selectedExecutionOrder.gudang_released_at) : 'Belum Diturunkan'}</strong>
                                </div>
                                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                                    <span className="text-slate-500 text-[10px] block font-bold">Selesai Eksekusi:</span>
                                    <strong className="text-[#70b03c] font-bold block text-xs">{selectedExecutionOrder.execution_completed_at ? formatIndonesianDateTime(selectedExecutionOrder.execution_completed_at) : 'Sedang Eksekusi'}</strong>
                                </div>
                            </div>
                        </div>

                        {/* BANNER NOTIFIKASI ORDERAN REPLACEMENT / GANTI KACA CACAT DARI ADMIN GUDANG */}
                        {selectedExecutionOrder.complaint_status === 're_cut_needed' && (
                            <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 space-y-2.5 shadow-xs">
                                <div className="flex items-center justify-between border-b border-rose-200 pb-2">
                                    <span className="font-extrabold text-xs text-rose-800 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                                        <span>PERINTAH GANTI BARANG KACA CACAT (ORDERAN ULANG DARI GUDANG)</span>
                                    </span>
                                    <span className="bg-rose-600 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full font-mono uppercase">
                                        Instruksi Gudang
                                    </span>
                                </div>
                                <div className="text-xs text-slate-800 space-y-1.5 font-mono">
                                    <p className="text-rose-900 text-xs">
                                        Divisi <strong>{selectedExecutionOrder.complaint_data?.reporting_division?.replace('divisi_', '').toUpperCase() || ''}</strong> melaporkan kendala: <strong className="text-rose-700">{selectedExecutionOrder.complaint_data?.reason || 'Kaca Baret / Cacat'}</strong>
                                    </p>
                                    {selectedExecutionOrder.complaint_data?.notes && (
                                        <p className="text-[11px] text-slate-700 italic bg-white p-2 rounded-xl border border-rose-200">
                                            Catatan: "{selectedExecutionOrder.complaint_data.notes}"
                                        </p>
                                    )}

                                    {Array.isArray(selectedExecutionOrder.complaint_data?.defective_items) && selectedExecutionOrder.complaint_data.defective_items.length > 0 && (
                                        <div className="bg-white p-3 rounded-xl border border-rose-200 space-y-1.5 text-[11px] mt-1 shadow-xs">
                                            <span className="font-bold text-rose-800 flex items-center gap-1.5">
                                                <Search className="w-3.5 h-3.5 text-rose-600" />
                                                <span>Item Kaca Pengganti Yang Harus Dipotong Ulang:</span>
                                            </span>
                                            <div className="space-y-1">
                                                {selectedExecutionOrder.complaint_data.defective_items.map((def, i) => (
                                                    <div key={i} className="text-slate-800 flex justify-between items-center bg-rose-50/50 p-2 rounded-lg border border-rose-200">
                                                        <span>#{def.item_index + 1}. <strong>{def.glass_type}</strong> ({def.width} × {def.height} cm, {def.thickness}mm)</span>
                                                        <strong className="text-rose-700 font-extrabold bg-rose-100 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                                                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                                                            <span>{def.qty_defective} Lembar Ganti</span>
                                                        </strong>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* REKOMENDASI ALOKASI KACA SISA RAK (DARI ADMIN TOKO) */}
                        {selectedExecutionOrder.used_scrap_rak && selectedExecutionOrder.used_scrap_rak !== '-' && selectedExecutionOrder.used_scrap_rak.trim() !== '' && (
                            selectedExecutionOrder.used_scrap_rak.startsWith('❌') ? (
                                <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4 space-y-2 shadow-xs">
                                    <div className="flex items-center justify-between gap-2 border-b border-rose-200 pb-2">
                                        <div className="flex items-center gap-2 font-extrabold text-xs text-rose-800 uppercase tracking-wider">
                                            <AlertTriangle className="w-4 h-4 text-rose-600" />
                                            <span>STATUS REKOMENDASI KACA SISA: DITOLAK DIVISI HT</span>
                                        </div>
                                        <span className="bg-rose-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase">
                                            Penolakan Di-Log Ke System
                                        </span>
                                    </div>
                                    <div className="text-xs font-mono font-extrabold text-rose-900 bg-white p-3 rounded-xl border border-rose-200 leading-relaxed shadow-xs">
                                        {selectedExecutionOrder.used_scrap_rak}
                                    </div>
                                    <p className="text-[10px] text-rose-700 font-mono flex items-center gap-1">
                                        <Info className="w-3 h-3 text-rose-600" />
                                        <span>Divisi Potong (HT) wajib memotong dari bahan kaca lembaran baru di bawah karena rekomendasi kaca sisa telah ditolak (baret/cacat/ukuran kurang).</span>
                                    </p>
                                </div>
                            ) : selectedExecutionOrder.used_scrap_rak.startsWith('✅') ? (
                                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 space-y-2 shadow-xs">
                                    <div className="flex items-center justify-between gap-2 border-b border-emerald-200 pb-2">
                                        <div className="flex items-center gap-2 font-extrabold text-xs text-emerald-800 uppercase tracking-wider">
                                            <CheckCircle2 className="w-4 h-4 text-[#70b03c]" />
                                            <span>REKOMENDASI KACA SISA: TERPAKAI UNTUK ORDERAN INI</span>
                                        </div>
                                        <span className="bg-[#70b03c] text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase">
                                            Stok Sisa Di-Update
                                        </span>
                                    </div>
                                    <div className="text-xs font-mono font-extrabold text-emerald-900 bg-white p-3 rounded-xl border border-emerald-200 leading-relaxed shadow-xs">
                                        {selectedExecutionOrder.used_scrap_rak}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 space-y-3 shadow-xs">
                                    <div className="flex items-center justify-between gap-2 border-b border-amber-200 pb-2">
                                        <div className="flex items-center gap-2 font-extrabold text-xs text-amber-900 uppercase tracking-wider">
                                            <Layers className="w-4 h-4 text-amber-600" />
                                            <span>REKOMENDASI / ALOKASI KACA SISA RAK DARI TOKO</span>
                                        </div>
                                        <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase">
                                            Konfirmasi Pemakaian
                                        </span>
                                    </div>
                                    <div className="text-xs sm:text-sm font-mono font-extrabold text-amber-950 bg-white p-3 rounded-xl border border-amber-200 leading-relaxed shadow-xs">
                                        {selectedExecutionOrder.used_scrap_rak}
                                    </div>

                                    {/* DUA BUTTON ACTION UTAMA KHUSUS DIVISI POTONG (HT): [ DIPAKAI ] & [ DITOLAK ] */}
                                    {(selectedExecutionOrder.current_division === 'divisi_ht' || userRole === 'admin_gudang' || userRole === 'owner') && (
                                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-amber-200">
                                            <p className="text-[10px] text-amber-900 font-mono flex-1 min-w-[180px] flex items-center gap-1">
                                                <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                                <span>Periksa fisik kaca di rak storage. Klik <strong>Dipakai</strong> jika kaca sesuai, atau <strong>Ditolak</strong> jika baret/ukuran tidak sesuai.</span>
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    disabled={isSubmittingUseScrap}
                                                    onClick={handleUseScrapSubmit}
                                                    className="bg-[#70b03c] hover:bg-[#5f9733] text-white font-extrabold px-4 py-2 rounded-xl text-xs transition border border-[#5f9733] flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    <span>{isSubmittingUseScrap ? 'Processing...' : 'Dipakai'}</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => setShowRejectModal(true)}
                                                    className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs transition border border-rose-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
                                                >
                                                    <X className="w-4 h-4" />
                                                    <span>Ditolak</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        )}

                        {/* RINCIAN ITEM SPESIFIKASI KACA DETAIL & TOMBOL [+ SISA POTONG] */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-[#1b68b0]" />
                                    <span>Detail Spesifikasi Item Kaca:</span>
                                </h4>
                                <span className="text-[11px] text-slate-500 font-mono">Gunakan penanda angka untuk mencatat lembar terpotong</span>
                            </div>

                            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                                {(Array.isArray(selectedExecutionOrder.items) && selectedExecutionOrder.items.length > 0 
                                    ? selectedExecutionOrder.items 
                                    : [{
                                        glass_type: selectedExecutionOrder.glass_type,
                                        length_cm: selectedExecutionOrder.length_cm,
                                        width_cm: selectedExecutionOrder.width_cm,
                                        thickness_mm: selectedExecutionOrder.thickness_mm,
                                        qty: 1,
                                        processes: selectedExecutionOrder.processes || ['HT']
                                    }]).map((it, idx) => (
                                    <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-[#1b68b0]/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition shadow-xs text-slate-800">
                                        {/* Rincian Spesifikasi Kaca (Sebelah Kiri) */}
                                        <div className="space-y-1.5 flex-1 min-w-0">
                                            <div className="font-extrabold text-[#1b68b0] text-sm flex flex-wrap items-center gap-2">
                                                <span>Item #{idx + 1}: {it.glass_type}</span>
                                                <span className="text-xs bg-[#70b03c]/15 text-[#70b03c] border border-[#70b03c]/30 px-2.5 py-0.5 rounded-full font-mono font-bold">Qty: {it.qty || 1} Pcs</span>
                                            </div>
                                            <div className="text-slate-700 font-mono text-xs flex flex-wrap items-center gap-2">
                                                <span>Ukuran: <strong className="text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 font-bold">{it.length_cm} cm × {it.width_cm} cm</strong></span>
                                                <span>Tebal: <strong className="text-amber-800 font-bold">{it.thickness_mm} mm</strong></span>
                                            </div>
                                            {Array.isArray(it.processes) && (
                                                <div className="text-xs text-slate-500 pt-0.5">
                                                    Proses Divisi: <span className="text-[#1b68b0] font-mono font-bold">{it.processes.join(', ')}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* PENANDA STEPPER LEMBAR TERPOTONG (Sebelah Kanan) */}
                                        {selectedExecutionOrder.current_division === 'divisi_ht' && (
                                            <div className="w-full md:w-auto md:min-w-[180px] space-y-1.5 md:border-l md:border-slate-200 md:pl-4 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200 shrink-0">
                                                <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
                                                    <span className="text-slate-600 font-bold flex items-center gap-1.5">
                                                        <Scissors className="w-3.5 h-3.5 text-slate-500" />
                                                        <span>Potong (HT):</span>
                                                        <span className={`font-extrabold font-sans px-2 py-0.5 rounded border text-[10px] ${
                                                            getCutCount(idx) === (it.qty || 1)
                                                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                                                : getCutCount(idx) > 0
                                                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                                                : 'bg-white text-slate-600 border-slate-200'
                                                        }`}>
                                                            {getCutCount(idx) === (it.qty || 1) ? '✓ Selesai' : `${getCutCount(idx)} / ${it.qty || 1}`}
                                                        </span>
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => updateCutCount(idx, it.qty || 1, it.qty || 1)}
                                                            className="text-[10px] text-[#1b68b0] hover:underline font-bold cursor-pointer shrink-0"
                                                            title="Tandai semua terpotong"
                                                        >
                                                            ✓ Max
                                                        </button>
                                                        {getCutCount(idx) > 0 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => updateCutCount(idx, 0, it.qty || 1)}
                                                                className="text-[10px] text-rose-600 hover:underline font-bold cursor-pointer shrink-0"
                                                                title="Reset hitungan ke 0"
                                                            >
                                                                ↺ Reset
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* STEPPER COUNTER CONTROL (1 KOTAK ANGKA + TOMBOL - / +) */}
                                                <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1.5 rounded-xl shadow-xs">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateCutCount(idx, getCutCount(idx) - 1, it.qty || 1)}
                                                        disabled={getCutCount(idx) <= 0}
                                                        className="w-8 h-8 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-black flex items-center justify-center cursor-pointer border border-slate-200 text-base transition active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                                                        title="Kurangi 1 lembar"
                                                    >
                                                        -
                                                    </button>

                                                    <div className="relative flex-1 min-w-[60px] max-w-[90px]">
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            max={it.qty || 1}
                                                            value={getCutCount(idx)}
                                                            onChange={(e) => updateCutCount(idx, e.target.value, it.qty || 1)}
                                                            className="w-full bg-slate-50 text-center font-mono font-black text-sm text-[#1b68b0] border border-slate-200 rounded-lg px-1.5 py-1 focus:border-[#1b68b0] focus:bg-white focus:outline-none"
                                                        />
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => updateCutCount(idx, getCutCount(idx) + 1, it.qty || 1)}
                                                        disabled={getCutCount(idx) >= (it.qty || 1)}
                                                        className="w-8 h-8 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-black flex items-center justify-center cursor-pointer border border-slate-200 text-base transition active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                                                        title="Tambah 1 lembar"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* PENCATATAN PEMAKAIAN KACA LEMBARAN BARU & INPUT SISA POTONG (KHUSUS DIVISI POTONG / HT / GUDANG) */}
                        {(selectedExecutionOrder.current_division === 'divisi_ht' || userRole === 'admin_gudang' || userRole === 'owner') && (
                            <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3 relative z-10 shadow-xs text-slate-800">
                                {/* SUB-TAB NAVIGASI MODUL BARENG: PEMAKAIAN BAHAN vs SISA POTONG */}
                                <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-200 pb-2.5">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setRawSectionTab('raw')}
                                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                                rawSectionTab === 'raw'
                                                    ? 'bg-[#1b68b0] text-white shadow-xs font-extrabold'
                                                    : 'bg-white text-slate-600 hover:text-slate-800 border border-slate-200'
                                            }`}
                                        >
                                            <FileText className="w-3.5 h-3.5" />
                                            <span>1. Pemakaian Kaca Lembaran Baru</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setRawSectionTab('scrap')}
                                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                                rawSectionTab === 'scrap'
                                                    ? 'bg-[#70b03c] text-white shadow-xs font-extrabold'
                                                    : 'bg-white text-slate-600 hover:text-slate-800 border border-slate-200'
                                            }`}
                                        >
                                            <Scissors className="w-3.5 h-3.5" />
                                            <span>2. Simpan Kaca Sisa Potong (Scrap ke Rak)</span>
                                        </button>
                                    </div>

                                    <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                                        {rawSectionTab === 'raw' ? 'Potong stok master lembaran baru' : 'Simpan sisa potong layak pakai ke rak'}
                                    </span>
                                </div>

                                {selectedExecutionOrder.used_scrap_rak && selectedExecutionOrder.used_scrap_rak !== '-' && selectedExecutionOrder.used_scrap_rak.trim() !== '' && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs font-mono text-amber-900 flex items-center justify-between gap-2 shadow-xs">
                                        <span className="flex items-center gap-1.5">
                                            <Layers className="w-3.5 h-3.5 text-amber-600" />
                                            <span>Rekomendasi Scrap Toko: <strong>{selectedExecutionOrder.used_scrap_rak}</strong></span>
                                        </span>
                                        <span className="text-[10px] text-amber-700 font-sans shrink-0">(Kurangi catat lembar baru jika pakai scrap)</span>
                                    </div>
                                )}

                                {/* FORM 1: CATAT PEMAKAIAN KACA LEMBARAN BARU */}
                                {rawSectionTab === 'raw' && (
                                    <form onSubmit={handleRecordRawMaterial} className="space-y-3.5 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                                        {/* PILIH BAHAN KACA (OTOMATIS TERPILIH SESUAI ORDER SPO) */}
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                                                    <FileText className="w-3.5 h-3.5 text-[#1b68b0]" />
                                                    <span>Bahan Kaca Lembaran Orderan Ini:</span>
                                                    <span className="bg-[#70b03c]/15 text-[#70b03c] border border-[#70b03c]/30 text-[9px] px-2 py-0.5 rounded-full font-sans font-bold">
                                                        ✓ Otomatis Terpilih Sesuai Order
                                                    </span>
                                                </label>
                                                <span className="text-[10px] text-slate-500 font-mono">
                                                    Pilih item order di atas jika ada lebih dari 1 jenis kaca
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2">
                                                {/* QUICK UNIQUE GLASS TYPE BADGES FROM SPO ORDER */}
                                                {uniqueGlassTypes.map((gt, idx) => {
                                                    const isSelected = rawGlassType === gt.glass_type;
                                                    const typedQty = rawSheetsUsedMap[gt.glass_type];
                                                    return (
                                                        <button
                                                            key={'u_gt_' + idx}
                                                            type="button"
                                                            onClick={() => setRawGlassType(gt.glass_type)}
                                                            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 cursor-pointer border ${
                                                                isSelected
                                                                    ? 'bg-[#1b68b0] text-white border-[#15528c] shadow-xs font-black'
                                                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                                            }`}
                                                        >
                                                            <Sparkles className="w-3.5 h-3.5" />
                                                            <span>{gt.glass_type}</span>
                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-sans font-bold ${
                                                                isSelected ? 'bg-white/20 text-white' : 'bg-white text-slate-700 border border-slate-200'
                                                            }`}>
                                                                Total: {gt.totalQty} Pcs ({gt.itemCount} Ukuran)
                                                            </span>
                                                            {typedQty !== undefined && typedQty !== null && typedQty !== '' && (
                                                                <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-md shadow-xs ${
                                                                    isSelected ? 'bg-white text-[#1b68b0]' : 'bg-[#1b68b0] text-white'
                                                                }`}>
                                                                    {typedQty} Lembar
                                                                </span>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* INPUT JUMLAH LEMBAR DIPAKAI (DIRECT INPUT + STEPPER) */}
                                        <div className="pt-2 border-t border-slate-200 space-y-2">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                                                    <Box className="w-3.5 h-3.5 text-[#1b68b0]" />
                                                    <span>Input Jumlah Lembar Kaca Bahan Yang Dipakai ({rawGlassType}):</span>
                                                </label>
                                                <span className="text-[10px] text-amber-800 font-mono font-bold">
                                                    💡 Masukkan angka pemakaian khusus bahan ini (sekian lembar)
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-3">
                                                {/* STEP CONTROLS (- / +) & INPUT NUMBER FIELD */}
                                                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-1.5 rounded-xl shadow-xs">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const cur = parseInt(getRawSheetsForType()) || 1;
                                                            updateRawSheetsForType(cur - 1);
                                                        }}
                                                        disabled={(parseInt(getRawSheetsForType()) || 0) <= (currentStockItem?.qty === 0 ? 0 : 1)}
                                                        className="w-8 h-8 bg-white hover:bg-slate-100 text-slate-800 rounded-lg font-black flex items-center justify-center cursor-pointer border border-slate-200 text-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
                                                        title="Kurangi 1 Lembar"
                                                    >
                                                        -
                                                    </button>
                                                    <div className="flex items-center gap-1 px-2">
                                                        <input
                                                            type="number"
                                                            min={currentStockItem?.qty === 0 ? 0 : 1}
                                                            max={currentStockItem ? currentStockItem.qty : undefined}
                                                            value={getRawSheetsForType()}
                                                            onChange={(e) => updateRawSheetsForType(e.target.value)}
                                                            onBlur={() => {
                                                                const curVal = getRawSheetsForType();
                                                                if (curVal === '') {
                                                                    updateRawSheetsForType(1);
                                                                }
                                                            }}
                                                            className="w-16 bg-white text-center text-sm font-mono font-black text-[#1b68b0] border border-slate-200 rounded-lg py-1 focus:outline-none focus:border-[#1b68b0]"
                                                            placeholder="1"
                                                        />
                                                        <span className="text-xs font-mono text-slate-500 font-bold">Lembar</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const cur = parseInt(getRawSheetsForType()) || 0;
                                                            updateRawSheetsForType(cur + 1);
                                                        }}
                                                        disabled={currentStockItem ? (parseInt(getRawSheetsForType()) || 0) >= currentStockItem.qty : false}
                                                        className="w-8 h-8 bg-white hover:bg-slate-100 text-slate-800 rounded-lg font-black flex items-center justify-center cursor-pointer border border-slate-200 text-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
                                                        title={currentStockItem && (parseInt(getRawSheetsForType()) || 0) >= currentStockItem.qty ? `Stok Maksimal Terpenuhi (${currentStockItem.qty} Lembar)` : "Tambah 1 Lembar"}
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                {/* SUBMIT BUTTON */}
                                                <button
                                                    type="submit"
                                                    disabled={isSubmittingRaw || (currentStockItem && (parseInt(getRawSheetsForType()) || 0) > currentStockItem.qty)}
                                                    className={`ml-auto font-extrabold px-5 py-2.5 rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1.5 h-[42px] ${
                                                        currentStockItem && (parseInt(getRawSheetsForType()) || 0) > currentStockItem.qty
                                                            ? 'bg-rose-100 text-rose-800 border border-rose-300 cursor-not-allowed opacity-90'
                                                            : 'bg-[#70b03c] hover:bg-[#5f9733] text-white border border-[#5f9733] cursor-pointer disabled:opacity-50'
                                                    }`}
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    <span>
                                                        {isSubmittingRaw
                                                            ? 'Menyimpan...'
                                                            : (currentStockItem && (parseInt(getRawSheetsForType()) || 0) > currentStockItem.qty)
                                                                ? `Stok Tidak Cukup (Sisa ${currentStockItem.qty} Lembar)`
                                                                : `+ Catat (${parseInt(getRawSheetsForType()) || 1} Lembar ${rawGlassType})`
                                                        }
                                                    </span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* LIVE INDIKATOR SISA STOK MASTER GUDANG */}
                                        {currentStockItem ? (
                                            <div className={`text-[11px] border rounded-xl p-3 font-mono flex flex-wrap items-center justify-between gap-2.5 ${
                                                currentStockItem.qty - (parseInt(rawSheetsUsed) || 0) >= 0
                                                    ? 'bg-white border-slate-200 text-slate-800 shadow-xs'
                                                    : 'bg-rose-50 border-2 border-rose-300 text-rose-800 shadow-xs'
                                            }`}>
                                                <span className="flex items-center gap-1.5">
                                                    <Box className="w-3.5 h-3.5 text-slate-400" />
                                                    <span>Stok Master Gudang:</span>
                                                    <strong className="text-[#1b68b0] font-extrabold">{currentStockItem.name}</strong>
                                                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-800 border border-slate-200 font-bold">
                                                        Sisa {currentStockItem.qty} {currentStockItem.unit}
                                                    </span>
                                                </span>
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${
                                                    currentStockItem.qty - (parseInt(rawSheetsUsed) || 0) >= 0
                                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                                        : 'bg-rose-600 text-white border border-rose-700 uppercase tracking-wide'
                                                }`}>
                                                    {currentStockItem.qty - (parseInt(rawSheetsUsed) || 0) >= 0
                                                        ? `Sisa Stok Setelah Dipotong: ${currentStockItem.qty - (parseInt(rawSheetsUsed) || 0)} ${currentStockItem.unit}`
                                                        : `STOK TIDAK CUKUP! Stok (${currentStockItem.qty} Lembar) < Pemakaian (${parseInt(rawSheetsUsed) || 0} Lembar)`}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 p-2.5 rounded-xl font-mono flex items-center gap-2">
                                                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                                <span>Kategori/Bahan kaca <strong>"{rawGlassType}"</strong> tidak ditemukan stok masternya di Katalog Gudang.</span>
                                            </div>
                                        )}
                                    </form>
                                )}

                                 {/* FORM 2: SIMPAN KACA SISA POTONG (SCRAP KE RAK) */}
                                {rawSectionTab === 'scrap' && (
                                    <div className="space-y-3.5 animate-in fade-in duration-200">
                                        <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 shadow-xs">
                                            <div className="flex items-center gap-2">
                                                <Scissors className="w-4 h-4 text-[#70b03c]" />
                                                <div>
                                                    <h4 className="text-xs font-bold text-slate-800">Form Input Kaca Sisa Potong Per Jenis Kaca (Order SPO Ini)</h4>
                                                    <p className="text-[10px] text-slate-500 font-mono">Terdapat {uniqueGlassTypes.length} jenis kaca dalam orderan ini. Input ukuran sisa potongan masing-masing di bawah:</p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-emerald-800 font-mono bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 font-bold">
                                                Status: Layak Pakai
                                            </span>
                                        </div>

                                        {/* FORM INPUT TERSENDIRI UNTUK SETIAP JENIS KACA DALAM ORDER SPO */}
                                        <div className="space-y-3">
                                            {uniqueGlassTypes.map((gt, idx) => {
                                                const lenVal = getScrapFormField(gt.glass_type, 'length_cm');
                                                const widVal = getScrapFormField(gt.glass_type, 'width_cm');
                                                const rakVal = getScrapFormField(gt.glass_type, 'rak_location');

                                                return (
                                                    <form
                                                        key={'scr_form_gt_' + idx}
                                                        onSubmit={(e) => handleSaveScrapForType(e, gt.glass_type)}
                                                        className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3 shadow-xs text-slate-800"
                                                    >
                                                        <div className="text-xs font-bold text-slate-800 flex flex-wrap items-center justify-between border-b border-slate-200 pb-2 gap-2">
                                                            <span className="flex items-center gap-2 font-mono">
                                                                <span className="bg-[#1b68b0] text-white px-2 py-0.5 rounded text-[10px] font-black">Jenis Kaca #{idx + 1}</span>
                                                                <strong className="text-slate-800 text-xs">{gt.glass_type}</strong>
                                                            </span>
                                                            <span className="text-[10px] text-slate-700 font-mono bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                                                                Total Order SPO: {gt.totalQty} Pcs ({gt.itemCount} Ukuran)
                                                            </span>
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                                                            <div className="space-y-1">
                                                                <label className="text-[11px] font-bold text-slate-700 block">Panjang Sisa (cm):</label>
                                                                <input
                                                                    type="number"
                                                                    step="0.1"
                                                                    min="1"
                                                                    required
                                                                    placeholder="cth: 120"
                                                                    value={lenVal}
                                                                    onChange={(e) => updateScrapFormField(gt.glass_type, 'length_cm', e.target.value)}
                                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-[#1b68b0] font-mono font-bold text-center"
                                                                />
                                                            </div>

                                                            <div className="space-y-1">
                                                                <label className="text-[11px] font-bold text-slate-700 block">Lebar Sisa (cm):</label>
                                                                <input
                                                                    type="number"
                                                                    step="0.1"
                                                                    min="1"
                                                                    required
                                                                    placeholder="cth: 45"
                                                                    value={widVal}
                                                                    onChange={(e) => updateScrapFormField(gt.glass_type, 'width_cm', e.target.value)}
                                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-[#1b68b0] font-mono font-bold text-center"
                                                                />
                                                            </div>

                                                            <div className="space-y-1">
                                                                <label className="text-[11px] font-bold text-slate-700 block">Pilih Lokasi Rak Storage Sisa:</label>
                                                                <select
                                                                    value={rakVal}
                                                                    onChange={(e) => updateScrapFormField(gt.glass_type, 'rak_location', e.target.value)}
                                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-[#1b68b0] font-mono font-bold cursor-pointer"
                                                                >
                                                                    <option value="Rak A01">Rak A01 (Kaca Polos / Float)</option>
                                                                    <option value="Rak A02">Rak A02 (Kaca Cermin / Mirror)</option>
                                                                    <option value="Rak B01">Rak B01 (Kaca Tempered & Bevel)</option>
                                                                    <option value="Rak B02">Rak B02 (Kaca Etsa / Sandblast)</option>
                                                                    <option value="Rak C01">Rak C01 (Kaca Khusus Sisa Besar)</option>
                                                                </select>
                                                            </div>

                                                            <div>
                                                                <button
                                                                    type="submit"
                                                                    disabled={submittingScrapType === gt.glass_type}
                                                                    className="w-full bg-[#70b03c] hover:bg-[#5f9733] text-white font-extrabold px-4 py-2 rounded-xl text-xs transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 h-[38px]"
                                                                >
                                                                    <Scissors className="w-3.5 h-3.5" />
                                                                    <span>{submittingScrapType === gt.glass_type ? 'Menyimpan...' : `+ Simpan Sisa ${gt.glass_type}`}</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </form>
                                                );
                                            })}
                                        </div>

                                        {/* OPTIONAL EXPANDABLE FALLBACK UNTUK KACA NON-SPO */}
                                        <div className="pt-1">
                                            <details className="bg-white rounded-xl border border-slate-200 p-3 group shadow-xs">
                                                <summary className="text-xs font-bold text-slate-700 cursor-pointer hover:text-slate-900 flex items-center justify-between font-mono">
                                                    <span className="flex items-center gap-1.5">
                                                        <Plus className="w-3.5 h-3.5 text-[#1b68b0]" />
                                                        <span>Input Sisa Potong Jenis Kaca Lain (Di luar Order SPO)</span>
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 group-open:rotate-180 transition-transform">▼</span>
                                                </summary>
                                                <form onSubmit={handleSaveEmbeddedScrap} className="mt-3 pt-3 border-t border-slate-200 space-y-3">
                                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                                        <div className="sm:col-span-2 space-y-1">
                                                            <label className="text-[11px] font-bold text-slate-700 block">Pilih Kaca dari Katalog Gudang:</label>
                                                            <select
                                                                value={embeddedScrapForm.glass_type}
                                                                onChange={(e) => setEmbeddedScrapForm({ ...embeddedScrapForm, glass_type: e.target.value })}
                                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-[#1b68b0] font-mono font-bold cursor-pointer"
                                                            >
                                                                {sheetGlasses.map((g) => (
                                                                    <option key={'scr_sheet_extra_' + g.id} value={g.name}>
                                                                        [{g.item_code}] {g.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[11px] font-bold text-slate-700 block">Panjang (cm):</label>
                                                            <input
                                                                type="number"
                                                                step="0.1"
                                                                min="1"
                                                                required
                                                                placeholder="cth: 120"
                                                                value={embeddedScrapForm.length_cm}
                                                                onChange={(e) => setEmbeddedScrapForm({ ...embeddedScrapForm, length_cm: e.target.value })}
                                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-[#1b68b0] font-mono font-bold text-center"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[11px] font-bold text-slate-700 block">Lebar (cm):</label>
                                                            <input
                                                                type="number"
                                                                step="0.1"
                                                                min="1"
                                                                required
                                                                placeholder="cth: 45"
                                                                value={embeddedScrapForm.width_cm}
                                                                onChange={(e) => setEmbeddedScrapForm({ ...embeddedScrapForm, width_cm: e.target.value })}
                                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-[#1b68b0] font-mono font-bold text-center"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                                                        <div className="sm:col-span-2 space-y-1">
                                                            <label className="text-[11px] font-bold text-slate-700 block">Pilih Lokasi Rak Storage Sisa:</label>
                                                            <select
                                                                value={embeddedScrapForm.rak_location}
                                                                onChange={(e) => setEmbeddedScrapForm({ ...embeddedScrapForm, rak_location: e.target.value })}
                                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-[#1b68b0] font-mono font-bold cursor-pointer"
                                                            >
                                                                <option value="Rak A01">Rak A01 (Kaca Polos / Float)</option>
                                                                <option value="Rak A02">Rak A02 (Kaca Cermin / Mirror)</option>
                                                                <option value="Rak B01">Rak B01 (Kaca Tempered & Bevel)</option>
                                                                <option value="Rak B02">Rak B02 (Kaca Etsa / Sandblast)</option>
                                                                <option value="Rak C01">Rak C01 (Kaca Khusus Sisa Besar)</option>
                                                            </select>
                                                        </div>
                                                        <div className="sm:col-span-2">
                                                            <button
                                                                type="submit"
                                                                disabled={isSubmittingEmbeddedScrap}
                                                                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2 rounded-xl text-xs transition border border-slate-200 cursor-pointer flex items-center justify-center gap-1.5 h-[38px]"
                                                            >
                                                                <Plus className="w-3.5 h-3.5" />
                                                                <span>Simpan Kaca Sisa Ekstra</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </form>
                                            </details>
                                        </div>

                                        {/* PENGINGAT UKURAN TERINPUT AGAR TIDAK DOUBLE ENTRY */}
                                        <div className="bg-white border border-slate-200 p-3.5 rounded-xl space-y-2 shadow-xs">
                                            <div className="flex flex-wrap items-center justify-between text-xs font-extrabold text-slate-800 border-b border-slate-200 pb-1.5 gap-2">
                                                <span className="flex items-center gap-1.5 font-mono">
                                                    <Tag className="w-3.5 h-3.5 text-[#1b68b0]" />
                                                    <span>Ukuran Kaca Sisa Potong Tersimpan ({recentSavedScraps.length}):</span>
                                                </span>
                                                <span className="text-[10px] text-slate-500 font-mono italic">
                                                    💡 Pengingat agar tidak terinput 2 kali
                                                </span>
                                            </div>

                                            {recentSavedScraps.length > 0 ? (
                                                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                                                    {recentSavedScraps.map((sc, scIdx) => {
                                                        const isEditing = editingScrapId === sc.id;
                                                        return (
                                                            <div key={'sc_saved_' + (sc.id || scIdx)} className="bg-slate-50 hover:bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-mono shadow-xs transition-all animate-in fade-in text-slate-800">
                                                                {!isEditing ? (
                                                                    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5">
                                                                        {/* LEFT: INFORMATION BADGES */}
                                                                        <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
                                                                            <span className="bg-[#70b03c]/15 text-[#70b03c] border border-[#70b03c]/30 px-2 py-0.5 rounded-lg text-[10px] font-bold shrink-0">
                                                                                {sc.rak_location}
                                                                            </span>

                                                                            <strong className="text-slate-800 text-xs truncate max-w-[200px]" title={sc.glass_type}>
                                                                                {sc.glass_type}
                                                                            </strong>

                                                                            <span className="bg-[#1b68b0]/10 text-[#1b68b0] border border-[#1b68b0]/30 px-2.5 py-0.5 rounded-lg font-extrabold text-xs shrink-0 flex items-center gap-1">
                                                                                <span>{sc.length_cm} × {sc.width_cm} cm</span>
                                                                            </span>

                                                                            <span className="text-[10px] text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full font-sans font-semibold shrink-0">
                                                                                ✓ Diinput {sc.created_at}
                                                                            </span>

                                                                            {sc.is_edited && (
                                                                                <span className="text-[9px] text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded font-sans shrink-0">
                                                                                    Edited
                                                                                </span>
                                                                            )}
                                                                        </div>

                                                                        {/* RIGHT: ACTIONS */}
                                                                        <div className="flex items-center gap-1.5 shrink-0 ml-auto sm:ml-0">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleStartEditScrap(sc)}
                                                                                className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                                                                title="Koreksi/Edit ukuran"
                                                                            >
                                                                                <Edit3 className="w-3 h-3 text-[#1b68b0]" />
                                                                                <span>Edit</span>
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    if (confirm(`Hapus catat sisa ${sc.glass_type} (${sc.length_cm} × ${sc.width_cm} cm) dari daftar pengingat?`)) {
                                                                                        setRecentSavedScraps(prev => prev.filter(i => i.id !== sc.id));
                                                                                    }
                                                                                }}
                                                                                className="bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 px-2 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                                                                title="Hapus dari daftar pengingat"
                                                                            >
                                                                                <Trash2 className="w-3 h-3 text-rose-600" />
                                                                                <span>Hapus</span>
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    /* FORM INLINE EDIT UKURAN KACA SISA POTONG */
                                                                    <div className="bg-white border-2 border-[#1b68b0] p-3 rounded-lg space-y-2.5 animate-in fade-in">
                                                                        <div className="flex justify-between items-center text-[#1b68b0] font-bold border-b border-slate-200 pb-1 text-[11px]">
                                                                            <span>Form Koreksi/Edit Ukuran Sisa Potong ({sc.glass_type})</span>
                                                                            <span className="text-[10px] text-amber-800 font-mono">💡 Perbaiki salah ketik dimensi</span>
                                                                        </div>
                                                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                                            <div>
                                                                                <label className="text-[10px] text-slate-600 block font-sans font-bold">Panjang Sisa (cm):</label>
                                                                                <input
                                                                                    type="number"
                                                                                    step="0.1"
                                                                                    value={inlineEditForm.length_cm}
                                                                                    onChange={(e) => setInlineEditForm({ ...inlineEditForm, length_cm: e.target.value })}
                                                                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-mono font-bold text-center focus:border-[#1b68b0] focus:bg-white"
                                                                                />
                                                                            </div>
                                                                            <div>
                                                                                <label className="text-[10px] text-slate-600 block font-sans font-bold">Lebar Sisa (cm):</label>
                                                                                <input
                                                                                    type="number"
                                                                                    step="0.1"
                                                                                    value={inlineEditForm.width_cm}
                                                                                    onChange={(e) => setInlineEditForm({ ...inlineEditForm, width_cm: e.target.value })}
                                                                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-mono font-bold text-center focus:border-[#1b68b0] focus:bg-white"
                                                                                />
                                                                            </div>
                                                                            <div>
                                                                                <label className="text-[10px] text-slate-600 block font-sans font-bold">Lokasi Rak Storage:</label>
                                                                                <select
                                                                                    value={inlineEditForm.rak_location}
                                                                                    onChange={(e) => setInlineEditForm({ ...inlineEditForm, rak_location: e.target.value })}
                                                                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-mono font-bold focus:border-[#1b68b0] focus:bg-white cursor-pointer"
                                                                                >
                                                                                    <option value="Rak A01">Rak A01 (Kaca Polos / Float)</option>
                                                                                    <option value="Rak A02">Rak A02 (Kaca Cermin / Mirror)</option>
                                                                                    <option value="Rak B01">Rak B01 (Kaca Tempered & Bevel)</option>
                                                                                    <option value="Rak B02">Rak B02 (Kaca Etsa / Sandblast)</option>
                                                                                    <option value="Rak C01">Rak C01 (Kaca Khusus Sisa Besar)</option>
                                                                                </select>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex justify-end gap-2 pt-1">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => setEditingScrapId(null)}
                                                                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer"
                                                                            >
                                                                                Batal
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleSaveInlineEditScrap(sc)}
                                                                                className="bg-[#70b03c] hover:bg-[#5f9733] text-white px-4 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
                                                                            >
                                                                                <span>Simpan Perubahan</span>
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="text-[11px] text-slate-500 font-mono italic bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
                                                    Belum ada ukuran sisa potong yang diinput pada sesi ini. Masukkan ukuran (Panjang × Lebar) di atas lalu klik simpan.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* RIWAYAT PENCATATAN PEMAKAIAN BAHAN UNTUK SPO INI */}
                                {Array.isArray(selectedExecutionOrder.raw_materials_used) && selectedExecutionOrder.raw_materials_used.length > 0 && (
                                    <div className="pt-2 border-t border-slate-200 space-y-1.5">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                            Riwayat Bahan Kaca Lembaran Terpakai ({selectedExecutionOrder.raw_materials_used.length}x Input):
                                        </span>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedExecutionOrder.raw_materials_used.map((rm, rmIdx) => (
                                                <div key={rmIdx} className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 font-mono shadow-xs text-slate-800">
                                                    <span className="text-[#1b68b0] font-bold">📄 {rm.glass_type}</span>
                                                    <span className="bg-[#70b03c]/15 text-[#70b03c] px-2 py-0.5 rounded text-[10px] font-black">
                                                        {rm.sheets_used} Lembar
                                                    </span>
                                                    <span className="text-[10px] text-slate-500">({rm.recorded_by})</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* KETERANGAN & POTONGAN RAK */}
                        {selectedExecutionOrder.description && (
                            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-700 italic flex items-center gap-2 shadow-xs">
                                <FileText className="w-4 h-4 text-[#1b68b0] shrink-0" />
                                <span>Catatan Order:</span>
                                <strong className="text-slate-900 font-semibold">{selectedExecutionOrder.description}</strong>
                            </div>
                        )}

                        {/* ACTION FOOTER MODAL BAR */}
                        <div className="pt-4 border-t border-slate-200 flex flex-wrap justify-between items-center gap-4 relative z-10">
                            <button 
                                type="button" 
                                onClick={() => onClose()}
                                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition border border-slate-200 cursor-pointer"
                            >
                                Tutup Modal
                            </button>

                            <div className="flex flex-wrap items-center gap-2">
                                {(() => {
                                    const isHistoryOrder = (isDivisionWorker && selectedExecutionOrder.current_division !== userRole) || 
                                                           selectedExecutionOrder.current_division === 'QC_Ready' || 
                                                           selectedExecutionOrder.status === 'selesai' ||
                                                           productionSubTab.endsWith('_history');

                                    if (isHistoryOrder) {
                                        return (
                                            <div className="flex items-center gap-2">
                                                {selectedExecutionOrder.is_revised && (
                                                    <span className="text-xs font-black text-amber-800 bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-300 font-mono">
                                                        🏆 SELESAI & SUDAH DIREVISI
                                                    </span>
                                                )}
                                                <span className="text-xs font-bold text-[#70b03c] bg-[#70b03c]/10 px-4 py-2 rounded-xl border border-[#70b03c]/30 flex items-center gap-1.5 shadow-xs font-mono">
                                                    <CheckCircle2 className="w-4 h-4 text-[#70b03c]" />
                                                    <span>Order Selesai Dikerjakan</span>
                                                </span>
                                            </div>
                                        );
                                    }

                                    if (selectedExecutionOrder.complaint_status === 'pending_gudang') {
                                        return (
                                            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-4 py-2 rounded-xl border border-amber-300 flex items-center gap-1.5 font-mono shadow-xs">
                                                <Clock className="w-4 h-4 text-amber-600" />
                                                <span>MENUNGGU DECISION ADMIN GUDANG (TERKUNCI)</span>
                                            </span>
                                        );
                                    }

                                    if (selectedExecutionOrder.revision_status === 'pending_division') {
                                        return (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    onAcknowledgeRevision(selectedExecutionOrder.id);
                                                    onClose();
                                                }}
                                                className="bg-[#1b68b0] hover:bg-[#15528c] text-white font-extrabold px-5 py-2.5 rounded-xl text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                                <span>Terima & Eksekusi Revisi SPO</span>
                                            </button>
                                        );
                                    }

                                    return (
                                        <>
                                            {/* BUTTON LAPORKAN KACA CACAT / BARET */}
                                            <button
                                                type="button"
                                                onClick={() => onOpenComplaintModal && onOpenComplaintModal(selectedExecutionOrder)}
                                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold px-4 py-2.5 rounded-xl text-xs transition border border-rose-200 whitespace-nowrap flex items-center gap-1.5 shadow-xs cursor-pointer"
                                            >
                                                <AlertTriangle className="w-4 h-4 text-rose-600" />
                                                <span>Laporkan Kaca Cacat / Baret</span>
                                            </button>

                                            <select 
                                                value={selectedNextDiv}
                                                onChange={(e) => setSelectedNextDiv(e.target.value)}
                                                className="bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-[#1b68b0] focus:bg-white font-mono shadow-xs cursor-pointer"
                                            >
                                                <option value="QC_Ready">Selesai & Lolos QC (Siap Kirim)</option>
                                                <option value="divisi_ht">Teruskan ke Divisi Potong (HT & Bor)</option>
                                                <option value="divisi_gm">Teruskan ke Divisi GM (Gosok Mesin)</option>
                                                <option value="divisi_bv">Teruskan ke Divisi BV (Beveling)</option>
                                                <option value="divisi_etsa">Teruskan ke Divisi Etsa (Sandblast Blur)</option>
                                            </select>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    onFinishJobSubmit(selectedExecutionOrder.id, selectedNextDiv);
                                                }}
                                                className="bg-[#70b03c] hover:bg-[#5f9733] text-white font-black px-6 py-2.5 rounded-xl text-xs transition shadow-xs flex items-center gap-2 cursor-pointer"
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span>Selesai & Teruskan Pekerjaan</span>
                                            </button>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* MODAL POPUP SUB-FORM PENOLAKAN KACA SISA (DIVISI HT) */}
                        {showRejectModal && (
                            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[70] flex items-center justify-center p-4 overflow-y-auto">
                                <div className="bg-white border border-rose-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 relative my-auto text-slate-800">
                                    <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
                                                <AlertTriangle className="w-4 h-4" />
                                            </div>
                                            <h3 className="font-bold text-sm text-slate-800">
                                                Form Penolakan Kaca Sisa (Divisi HT)
                                            </h3>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowRejectModal(false)}
                                            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl p-1 transition cursor-pointer"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleRejectScrapSubmit} className="space-y-4 text-xs">
                                        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
                                            <span className="text-[10px] text-slate-400 font-mono block">Order SPO #: {selectedExecutionOrder.spo_number}</span>
                                            <div className="font-bold text-slate-800">{selectedExecutionOrder.customer_name}</div>
                                            <div className="text-[11px] text-amber-800 font-mono bg-amber-50 p-2 rounded-xl border border-amber-200">
                                                {selectedExecutionOrder.used_scrap_rak}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-slate-700 font-bold block">Pilih Alasan Utama Penolakan:</label>
                                            <div className="space-y-1.5 font-mono text-[11px]">
                                                {[
                                                    { id: 'baret_cacat', label: 'Kaca Baret / Cacat / Retak Fisik' },
                                                    { id: 'ukuran_kurang', label: 'Ukuran Fisik Kaca Sisa Tidak Cukup' },
                                                    { id: 'tidak_ditemukan', label: 'Kaca Tidak Ditemukan di Rak Storage' },
                                                    { id: 'alasan_lain', label: 'Alasan Lainnya (Input Teks)' },
                                                ].map(opt => (
                                                    <label key={opt.id} className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${rejectReasonType === opt.id ? 'bg-rose-50 border-rose-400 text-rose-800 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                                                        <input
                                                            type="radio"
                                                            name="rejectReasonType"
                                                            value={opt.id}
                                                            checked={rejectReasonType === opt.id}
                                                            onChange={e => setRejectReasonType(e.target.value)}
                                                            className="text-rose-600 focus:ring-rose-500"
                                                        />
                                                        <span>{opt.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-slate-700 font-bold block">Catatan Penolakan (Detail Penjelasan Baret / Cacat):</label>
                                            <textarea
                                                rows={2}
                                                placeholder="cth: Kaca baret di bagian tepi 40cm, retak pada sudut kanan..."
                                                value={rejectNotes}
                                                onChange={e => setRejectNotes(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:border-rose-400 text-xs"
                                            ></textarea>
                                        </div>

                                        {/* SECTION INPUT POTONG ULANG UKURAN SISA UTUH */}
                                        <div className="bg-amber-50/70 border border-amber-200 p-3.5 rounded-2xl space-y-2">
                                            <label className="flex items-center gap-2 text-amber-900 font-bold cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={resizeScrap}
                                                    onChange={e => {
                                                        const isChecked = e.target.checked;
                                                        setResizeScrap(isChecked);
                                                        if (isChecked && !newLengthCm) {
                                                            const foundScrap = scrapGlasses.find(s => selectedExecutionOrder.used_scrap_rak?.includes(s.scrap_code));
                                                            if (foundScrap) {
                                                                setNewLengthCm(foundScrap.length_cm);
                                                                setNewWidthCm(foundScrap.width_cm);
                                                            }
                                                        }
                                                    }}
                                                    className="rounded text-amber-600 focus:ring-amber-500"
                                                />
                                                <span>Potong Ulang Sisa Kaca Utuh yang Masih Bisa Dipakai</span>
                                            </label>

                                            {resizeScrap && (
                                                <div className="space-y-2 pt-1 border-t border-amber-200">
                                                    <p className="text-[10px] text-amber-800 leading-relaxed font-mono">
                                                        Masukkan ukuran baru setelah bagian baret dipotong (misal dari 150×80 cm menjadi 100×50 cm) agar stok sisa di rak tetap tersimpan akurat.
                                                    </p>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <label className="text-[10px] text-slate-600 block font-bold">Panjang Baru (cm):</label>
                                                            <input
                                                                type="number"
                                                                step="0.1"
                                                                min="1"
                                                                placeholder="Panjang cm"
                                                                value={newLengthCm}
                                                                onChange={e => setNewLengthCm(e.target.value)}
                                                                className="w-full bg-white border border-amber-300 rounded-xl px-2.5 py-1.5 text-xs text-amber-900 font-mono font-bold"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-slate-600 block font-bold">Lebar Baru (cm):</label>
                                                            <input
                                                                type="number"
                                                                step="0.1"
                                                                min="1"
                                                                placeholder="Lebar cm"
                                                                value={newWidthCm}
                                                                onChange={e => setNewWidthCm(e.target.value)}
                                                                className="w-full bg-white border border-amber-300 rounded-xl px-2.5 py-1.5 text-xs text-amber-900 font-mono font-bold"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                                            <button
                                                type="button"
                                                onClick={() => setShowRejectModal(false)}
                                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                                            >Batal</button>
                                            <button
                                                type="submit"
                                                disabled={isSubmittingReject}
                                                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                                            >
                                                <span>{isSubmittingReject ? 'Menyimpan...' : 'Submit Penolakan & Update Scrap'}</span>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* MODAL POPUP FORM POTONG ULANG / EDIT UKURAN KACA SISA DI RAK */}
                        {showEditScrapModal && (
                            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[70] flex items-center justify-center p-4 overflow-y-auto">
                                <div className="bg-white border border-amber-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 relative my-auto text-slate-800">
                                    <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                                                <Scissors className="w-4 h-4" />
                                            </div>
                                            <h3 className="font-bold text-sm text-slate-800">
                                                Potong Ulang & Edit Ukuran Scrap (Rak)
                                            </h3>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowEditScrapModal(false)}
                                            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl p-1 transition cursor-pointer"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleUpdateScrapSubmit} className="space-y-4 text-xs">
                                        {Array.isArray(scrapGlasses) && scrapGlasses.length > 0 && (
                                            <div className="space-y-1">
                                                <label className="text-slate-700 font-bold block">Pilih Kaca Sisa yang Dipotong Ulang:</label>
                                                <select
                                                    value={editScrapForm.id || ''}
                                                    onChange={(e) => {
                                                        const found = scrapGlasses.find(s => String(s.id) === String(e.target.value));
                                                        if (found) handleOpenEditScrapModal(found);
                                                    }}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-mono font-bold cursor-pointer"
                                                >
                                                    {scrapGlasses.map(s => (
                                                        <option key={s.id} value={s.id}>
                                                            [{s.scrap_code}] {s.glass_type} ({s.length_cm}x{s.width_cm} cm) — {s.rak_location} ({s.status})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-slate-700 font-bold block">Panjang Baru (cm):</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    required
                                                    value={editScrapForm.length_cm}
                                                    onChange={e => setEditScrapForm(f => ({ ...f, length_cm: e.target.value }))}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-mono font-bold"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-slate-700 font-bold block">Lebar Baru (cm):</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    required
                                                    value={editScrapForm.width_cm}
                                                    onChange={e => setEditScrapForm(f => ({ ...f, width_cm: e.target.value }))}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-mono font-bold"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-slate-700 font-bold block">Lokasi Rak Storage:</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={editScrapForm.rak_location}
                                                    onChange={e => setEditScrapForm(f => ({ ...f, rak_location: e.target.value }))}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-mono font-bold"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-slate-700 font-bold block">Status Kondisi Kaca:</label>
                                                <select
                                                    value={editScrapForm.status}
                                                    onChange={e => setEditScrapForm(f => ({ ...f, status: e.target.value }))}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold cursor-pointer"
                                                >
                                                    <option value="Layak Pakai">Layak Pakai</option>
                                                    <option value="Baret/Cacat">Baret / Cacat</option>
                                                    <option value="Afval/Pecah">Afval / Pecah</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-slate-700 font-bold block">Catatan Pemotongan Ulang:</label>
                                            <input
                                                type="text"
                                                placeholder="cth: Dipotong ulang karena baret pinggir..."
                                                value={editScrapForm.notes || ''}
                                                onChange={e => setEditScrapForm(f => ({ ...f, notes: e.target.value }))}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                                            />
                                        </div>

                                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                                            <button
                                                type="button"
                                                onClick={() => setShowEditScrapModal(false)}
                                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                                            >Batal</button>
                                            <button
                                                type="submit"
                                                disabled={isSubmittingScrapEdit}
                                                className="px-5 py-2 bg-[#70b03c] hover:bg-[#5f9733] text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                                            >
                                                <span>{isSubmittingScrapEdit ? 'Menyimpan...' : 'Simpan Perubahan & Log Aktivitas'}</span>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
    );
}
