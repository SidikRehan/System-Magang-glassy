import React from 'react';
import {
    Edit3,
    Calendar,
    User,
    Phone,
    MapPin,
    Layers,
    Plus,
    Copy,
    Trash2,
    Check,
    AlertTriangle,
    CreditCard,
    FileText,
    Sparkles,
    Upload,
    Clock,
    X,
    ArrowRight,
    HelpCircle,
    CheckCircle2,
    Package,
    RotateCcw,
    Bell,
    Loader2,
    Building2,
    Scissors,
    Search
} from 'lucide-react';
import SearchableSelect from '@/Components/SearchableSelect';

export default function EditDraftOrderModal({
    show,
    onClose,
    handleCloseEditModal,
    isSubmittingOrder = false,
    submittingAction = null,
    editingOrder,
    orderForm,
    setOrderForm,
    formatIndonesianDate,
    sanitizeCustomerName,
    sanitizeCustomerPhone,
    handleItemChange,
    handleAddItem,
    handleRemoveItem,
    handleDuplicateItem = () => {},
    handleAddItemWithGlassType = () => {},
    handleAddNewGlassGroup = () => {},
    handleGroupGlassTypeChange = () => {},
    handleAddHoleSpec = () => {},
    handleHoleSpecChange = () => {},
    handleRemoveHoleSpec = () => {},
    toggleItemProcess = () => {},
    handleUpdateOrderSubmit,
    handleFileChange = () => {},
    sketchPreview = null,
    calcItems = [],
    getDynamicGlassTypes = () => [],
    sheetGlasses = [],
    findMatchingScrapsForOrder = () => null,
    isGlassTypeCompatible = () => false,
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

    const formatAreaDisplay = (val) => {
        const num = parseFloat(val) || 0;
        if (num <= 0) return '0.00';
        if (num < 0.01) return num.toFixed(4);
        if (num < 0.1) return num.toFixed(3);
        return num.toFixed(2);
    };

    const [attemptedSubmit, setAttemptedSubmit] = React.useState(false);
    const [shakeKey, setShakeKey] = React.useState(0);

    // Scrap Glass Picker State
    const [showScrapPickerModal, setShowScrapPickerModal] = React.useState(false);
    const [targetScrapGroupId, setTargetScrapGroupId] = React.useState(null);
    const [scrapPickerSearch, setScrapPickerSearch] = React.useState('');
    const [selectedScrapId, setSelectedScrapId] = React.useState(null);

    // Form Validation Checks
    const selectedScrapCodes = orderForm.used_scrap_rak 
        ? Array.from(new Set(orderForm.used_scrap_rak.match(/SCR-[A-Za-z0-9\-]+/g) || []))
        : [];
    const selectedScraps = (initialScrap || []).filter(s => selectedScrapCodes.includes(s.scrap_code));

    const checkItemExceedsScrap = (item) => {
        if (selectedScraps.length === 0) return false;
        const rawLen = parseFloat(item.length_cm) || 0;
        const rawWid = parseFloat(item.width_cm) || 0;
        if (rawLen === 0 || rawWid === 0) return false;
        
        const isEdgeGrinding = (item.processes || []).includes('GM');
        const finalLen = isEdgeGrinding ? rawLen + 1 : rawLen;
        const finalWid = isEdgeGrinding ? rawWid + 1 : rawWid;

        const maxOrderDim = Math.max(finalLen, finalWid);
        const minOrderDim = Math.min(finalLen, finalWid);

        return selectedScraps.every(scrap => {
            const maxScrapDim = Math.max(parseFloat(scrap.length_cm) || 0, parseFloat(scrap.width_cm) || 0);
            const minScrapDim = Math.min(parseFloat(scrap.length_cm) || 0, parseFloat(scrap.width_cm) || 0);
            return maxOrderDim > maxScrapDim || minOrderDim > minScrapDim;
        });
    };

    const hasScrapSizeError = calcItems.some(item => checkItemExceedsScrap(item));

    const isCustomerNameValid = Boolean(orderForm.customer_name && orderForm.customer_name.trim().length > 0);
    const isCustomerPhoneValid = Boolean(orderForm.customer_phone && orderForm.customer_phone.trim().length > 0);
    const isCustomerAddressValid = Boolean(orderForm.customer_address && orderForm.customer_address.trim().length > 0);
    const isDescriptionValid = Boolean(orderForm.description && orderForm.description.trim().length > 0);
    const isOrderDateValid = Boolean(orderForm.order_date && String(orderForm.order_date).trim().length > 0);

    const isItemsValid = Boolean(
        calcItems && 
        calcItems.length > 0 && 
        calcItems.every(item => 
            Boolean(item.glass_type && String(item.glass_type).trim().length > 0) &&
            (parseFloat(item.length_cm) || 0) > 0 &&
            (parseFloat(item.width_cm) || 0) > 0 &&
            (parseInt(item.qty) || 0) > 0 &&
            !item.isExceeded &&
            !checkItemExceedsScrap(item)
        )
    );

    const isPriorityValid = Boolean(orderForm.priority_status && orderForm.priority_status.trim().length > 0) && (orderForm.priority_status !== 'Prioritas' || (parseFloat(orderForm.priority_fee) || 0) >= 0);
    const isDeadlineDateValid = Boolean(orderForm.deadline_date && String(orderForm.deadline_date).trim().length > 0);

    // Catatan revisi wajib diisi jika orderan sedang direvisi (status pengerjaan)
    const isRevisionNotesValid = Boolean(
        editingOrder?.status !== 'pengerjaan' || 
        (orderForm.revision_notes && String(orderForm.revision_notes).trim().length > 0)
    );

    const isFormValid = isCustomerNameValid && 
        isCustomerPhoneValid && 
        isCustomerAddressValid && 
        isDescriptionValid && 
        isOrderDateValid && 
        isDeadlineDateValid &&
        isItemsValid && 
        isPriorityValid && 
        isRevisionNotesValid;

    const getFieldClass = (isValid, baseClass = "w-full bg-white border rounded-xl p-2.5 text-slate-800 shadow-xs transition") => {
        if (!isValid && attemptedSubmit) {
            return `${baseClass} border-rose-500 bg-rose-50/70 ring-2 ring-rose-500/30 text-rose-900 animate-shake form-invalid-input`;
        }
        return `${baseClass} border-slate-200 focus:border-[#1b68b0]`;
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] flex flex-col my-auto text-slate-800 relative overflow-hidden">
                {/* LOADING BLUR OVERLAY FOR SMOOTH SUBMISSION */}
                {isSubmittingOrder && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-xs z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
                        <div className="bg-white p-6 rounded-3xl shadow-2xl border border-slate-200 flex flex-col items-center gap-3.5 max-w-xs animate-in zoom-in-95 duration-200">
                            <div className="w-14 h-14 rounded-2xl bg-[#1b68b0]/10 flex items-center justify-center text-[#1b68b0]">
                                <Loader2 className="w-7 h-7 animate-spin text-[#1b68b0]" />
                            </div>
                            <div>
                                <h4 className="font-bold text-[#242222] text-sm">
                                    Memperbarui SPO Orderan...
                                </h4>
                                <p className="text-xs text-slate-500 font-mono mt-1 leading-relaxed">
                                    Mohon tunggu sebentar, sistem sedang memproses revisi dan memperbarui data.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL HEADER */}
                <div className="flex justify-between items-center border-b border-slate-200 pb-3.5">
                    <div>
                        <h3 className="font-bold text-lg text-[#242222] flex items-center gap-2">
                            {editingOrder.status === 'pengerjaan' ? (
                                <>
                                    <RotateCcw className="w-5 h-5 text-[#1b68b0]" />
                                    <span>Revisi & Edit Orderan Pengerjaan #{editingOrder.spo_number}</span>
                                </>
                            ) : (
                                <>
                                    <Edit3 className="w-5 h-5 text-[#1b68b0]" />
                                    <span>Edit Draf Negosiasi #{editingOrder.spo_number}</span>
                                </>
                            )}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-xs mt-1">
                            <div className="flex items-center gap-1.5 text-slate-500 font-mono">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>Tanggal Order:</span>
                                <input 
                                    type="date" 
                                    required 
                                    value={orderForm.order_date || ''} 
                                    onChange={e => setOrderForm('order_date', e.target.value)} 
                                    className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 text-xs text-[#1b68b0] font-mono font-bold focus:border-[#1b68b0] cursor-pointer"
                                />
                                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                    {formatIndonesianDate(orderForm.order_date)}
                                </span>
                            </div>
                            <span className="text-slate-500 font-mono">
                                Status: <strong className="text-amber-700 uppercase">{editingOrder.status}</strong>
                            </span>
                        </div>
                    </div>
                    <button 
                        onClick={closeHandler} 
                        className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl p-1.5 transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form className="space-y-4 text-xs overflow-y-auto pr-1 flex-1">
                    {/* CATATAN REVISI JIKA EDITING ORDER */}
                    {editingOrder && (
                        <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 shadow-xs transition ${
                            !isRevisionNotesValid && attemptedSubmit
                                ? 'bg-rose-50/90 border-rose-300 ring-2 ring-rose-500/20'
                                : 'bg-amber-50/70 border-amber-200'
                        }`}>
                            <h4 className="font-bold text-amber-900 text-xs flex items-center justify-between border-b border-amber-200/80 pb-2">
                                <span className="flex items-center gap-2">
                                    <Bell className="w-4 h-4 text-amber-600" />
                                    <span>Catatan / Alasan Perubahan Revisi (Untuk Divisi Produksi & Gudang)</span>
                                </span>
                                {editingOrder.status === 'pengerjaan' && (
                                    <span className="text-[10px] bg-rose-100 text-rose-700 px-2.5 py-0.5 rounded-full font-bold border border-rose-200 shadow-2xs">
                                        *Wajib Diisi
                                    </span>
                                )}
                            </h4>

                            {/* TAMPILKAN CATATAN REVISI SEBELUMNYA SEBAGAI REFERENSI (BACA SAJA) */}
                            {editingOrder.revision_notes && (
                                <div className="bg-white/80 border border-amber-200 rounded-xl p-3 text-xs text-slate-800 space-y-1">
                                    <span className="font-bold text-amber-900 text-[11px] block">
                                        📜 Catatan Revisi Sebelumnya ({editingOrder.revision_count || 1}x Revisi):
                                    </span>
                                    <p className="text-slate-700 italic font-mono text-[11px] bg-amber-50/60 p-2 rounded-lg border border-amber-100/80">
                                        "{editingOrder.revision_notes}"
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="text-slate-700 block mb-1 font-semibold flex items-center justify-between">
                                    <span>Catatan Alasan Perubahan Revisi Terbaru:</span>
                                    {editingOrder.status === 'pengerjaan' && <span className="text-rose-600 font-extrabold text-[11px]">* Wajib Diisi Untuk Revisi Baru</span>}
                                </label>
                                <textarea 
                                    key={`revision_notes_${shakeKey}`}
                                    rows="2" 
                                    placeholder="Masukkan catatan/alasan revisi TERBARU di sini... (Contoh: Konsumen minta ubah ukuran kaca dari 100x50 cm ke 100x60 cm)"
                                    value={orderForm.revision_notes || ''} 
                                    onChange={e => setOrderForm('revision_notes', e.target.value)} 
                                    className={getFieldClass(isRevisionNotesValid, "w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-800 text-xs focus:border-amber-500 font-medium shadow-xs")}
                                />
                                {!isRevisionNotesValid && attemptedSubmit ? (
                                    <div className="flex items-center gap-1.5 mt-1.5 text-rose-600 text-xs font-bold animate-pulse">
                                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                                        <span>Harus diisi field ini! (Catatan revisi terbaru wajib diisi untuk menginfokan divisi produksi & gudang)</span>
                                    </div>
                                ) : (
                                    <span className="text-[10px] text-amber-800 block mt-1">
                                        *Catatan revisi ini khusus untuk mencatat alasan perubahan terbaru dari konsumen dan akan dikirimkan ke Admin Gudang & Divisi Produksi.
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* SECTION 1: PELANGGAN */}
                    <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
                        <h4 className="font-bold text-[#242222] text-xs border-b border-slate-200 pb-2 flex items-center gap-2">
                            <User className="w-4 h-4 text-[#1b68b0]" />
                            <span>Data Pemesan & Pelanggan</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-slate-600 block mb-1 font-semibold">Nama Customer (Khusus Huruf):</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={orderForm.customer_name} 
                                    onChange={e => setOrderForm('customer_name', sanitizeCustomerName(e.target.value))} 
                                    className={getFieldClass(isCustomerNameValid, "w-full bg-white border rounded-xl p-2.5 text-slate-800 font-medium shadow-xs transition")} 
                                    placeholder="cth: Budi Karunia" 
                                />
                                <span className="text-[10px] text-slate-400 block mt-1">*Hanya huruf & spasi (angka/simbol otomatis difilter)</span>
                            </div>
                            <div>
                                <label className="text-slate-600 block mb-1 font-semibold">Nomor Telepon / WA (Khusus Angka):</label>
                                <input 
                                    type="text" 
                                    inputMode="numeric"
                                    required 
                                    value={orderForm.customer_phone} 
                                    onChange={e => setOrderForm('customer_phone', sanitizeCustomerPhone(e.target.value))} 
                                    className={getFieldClass(isCustomerPhoneValid, "w-full bg-white border rounded-xl p-2.5 text-slate-800 font-mono shadow-xs transition")} 
                                    placeholder="cth: 081234567890" 
                                />
                                <span className="text-[10px] text-slate-400 block mt-1">*Hanya digit angka nomor hp</span>
                            </div>
                        </div>
                        <div>
                            <label className="text-slate-600 block mb-1 font-semibold">Alamat Pengiriman (Bebas Huruf, Angka & Simbol):</label>
                            <textarea 
                                required 
                                rows="2" 
                                value={orderForm.customer_address} 
                                onChange={e => setOrderForm('customer_address', e.target.value)} 
                                className={getFieldClass(isCustomerAddressValid, "w-full bg-white border rounded-xl p-2.5 text-slate-800 shadow-xs transition")} 
                                placeholder="Alamat lengkap lokasi pengantaran kaca..." 
                            />
                        </div>

                        {/* BANNER OPTION: ORDERAN KOSONG (DIPAKAI PERUSAHAAN / FREE KACA) */}
                        <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setOrderForm('is_company_use', !orderForm.is_company_use)}
                                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs ${
                                        orderForm.is_company_use
                                            ? 'bg-[#1b68b0] text-white border border-[#15528c] shadow-md ring-2 ring-[#1b68b0]/20'
                                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 hover:border-slate-400'
                                    }`}
                                >
                                    <Building2 className="w-4 h-4" />
                                    <span>Orderan Kosong</span>
                                    {orderForm.is_company_use && (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-300 ml-0.5" />
                                    )}
                                </button>
                                <span className="text-[11px] text-slate-500 italic font-sans">
                                    {orderForm.is_company_use 
                                        ? '✓ Aktif: Dipakai Perusahaan (Free Kaca Rp 0 & Tetap Masuk Laporan / Performance)' 
                                        : 'Klik jika orderan untuk kebutuhan internal perusahaan (Free Kaca)'}
                                </span>
                            </div>
                            {orderForm.is_company_use && (
                                <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-xs font-sans">
                                    <Building2 className="w-3.5 h-3.5 text-amber-700" />
                                    <span>Free Kaca (Orderan Kosong)</span>
                                </span>
                            )}
                        </div>
                    </div>

                    {/* SECTION 2: RINCIAN MULTI-ITEM KACA */}
                    <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
                        <div className="flex flex-wrap justify-between items-center border-b border-slate-200 pb-3 gap-2">
                            <div>
                                <h4 className="font-bold text-[#242222] text-xs flex items-center gap-1.5">
                                    <Layers className="w-4 h-4 text-[#1b68b0]" />
                                    <span>Rincian Item Kaca ({calcItems.length} Item Kaca Ukuran)</span>
                                </h4>
                                <span className="text-[10px] text-slate-500 block mt-0.5">
                                    Item terkelompok berdasarkan Jenis Kaca. Pilih jenis kaca sekali, lalu tambahkan variasi ukuran & opsi proses di bawahnya.
                                </span>
                            </div>
                            <button 
                                type="button" 
                                onClick={handleAddNewGlassGroup} 
                                className="bg-blue-50 hover:bg-blue-100 text-[#1b68b0] font-bold px-3 py-1.5 rounded-xl text-xs border border-blue-200 flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Tambah Jenis Kaca Berbeda Lainnya</span>
                            </button>
                        </div>

                        {(() => {
                            const groupsMap = new Map();
                            const groups = [];

                            (calcItems || []).forEach((item, originalIndex) => {
                                const grpId = item.group_id || ('grp_' + (item.glass_type ? item.glass_type.replace(/\s+/g, '_') : originalIndex));
                                if (!groupsMap.has(grpId)) {
                                    const grp = {
                                        group_id: grpId,
                                        glass_type: item.glass_type || '',
                                        items: [],
                                        totalArea: 0,
                                        totalSubtotal: 0
                                    };
                                    groupsMap.set(grpId, grp);
                                    groups.push(grp);
                                }
                                const grp = groupsMap.get(grpId);
                                grp.items.push({ item, idx: originalIndex });
                                grp.totalArea += (item.areaM2 || 0) * (parseInt(item.qty) || 1);
                                grp.totalSubtotal += (item.subtotal || 0);
                            });

                            return (
                                <div className="space-y-4">
                                    {groups.map((grp, gIdx) => (
                                        <div key={grp.group_id || gIdx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs relative">
                                            {/* GROUP HEADER */}
                                            <div className="bg-slate-50 p-3.5 sm:p-4 border-b border-slate-200 space-y-3">
                                                {/* BARIS 1: JUDUL GROUP, METRIK & BUTTON TAMBAH UKURAN */}
                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 pb-2.5 border-b border-slate-200/80">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-black text-[#1b68b0] text-xs sm:text-sm flex items-center gap-1.5 uppercase tracking-wide">
                                                            <Layers className="w-4 h-4 text-[#1b68b0]" /> Group Kaca #{gIdx + 1}
                                                        </span>
                                                        <span className="bg-blue-50 text-[#1b68b0] px-2.5 py-0.5 rounded-full text-[11px] font-mono border border-blue-200 font-bold">
                                                            {grp.items.length} Variasi Ukuran
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-3 text-xs self-end sm:self-center flex-wrap sm:flex-nowrap">
                                                        <div className="text-right">
                                                            <span className="text-[10px] text-slate-400 block font-mono">Total Luas Group:</span>
                                                            <span className="font-mono text-[#1b68b0] font-bold text-xs">{formatAreaDisplay(grp.totalArea)} m²</span>
                                                        </div>
                                                        <div className="text-right bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 shadow-2xs">
                                                            <span className="text-[10px] text-emerald-700 block font-mono font-medium">Subtotal Group:</span>
                                                            <span className="font-mono text-emerald-800 font-extrabold text-xs sm:text-sm">Rp {grp.totalSubtotal.toLocaleString()}</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAddItemWithGlassType(grp.group_id, grp.glass_type)}
                                                            className="bg-white hover:bg-blue-50 text-[#1b68b0] font-bold px-3 py-1.5 rounded-xl text-xs border border-blue-200 flex items-center gap-1.5 transition shadow-2xs whitespace-nowrap cursor-pointer hover:border-[#1b68b0]"
                                                            title="Tambah variasi ukuran baru untuk jenis kaca ini"
                                                        >
                                                            <Plus className="w-3.5 h-3.5" />
                                                            <span>Tambah Ukuran</span>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* BARIS 2: PILIHAN JENIS KACA DASAR & TOMBOL GUNAKAN KACA SISA */}
                                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                                                    <label className="text-slate-700 text-xs font-bold whitespace-nowrap shrink-0 flex items-center gap-1.5">
                                                        <span>Jenis Kaca Dasar:</span>
                                                    </label>
                                                    <div className="flex-1 min-w-[200px]">
                                                        <SearchableSelect
                                                            value={grp.glass_type}
                                                            onChange={val => handleGroupGlassTypeChange(grp.group_id, val)}
                                                            options={getDynamicGlassTypes(sheetGlasses)}
                                                            sheetGlasses={sheetGlasses}
                                                            placeholder="-- Ketik atau Cari Jenis Kaca Bahan Lembaran --"
                                                            invalid={attemptedSubmit && (!grp.glass_type || grp.glass_type.trim().length === 0)}
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setTargetScrapGroupId(grp.group_id);
                                                            setScrapPickerSearch('');
                                                            setShowScrapPickerModal(true);
                                                        }}
                                                        className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold px-3 py-2 rounded-xl text-xs border border-purple-200 flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer shrink-0"
                                                        title="Pilih dari stok kaca sisa potongan di rak storage"
                                                    >
                                                        <Scissors className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                                        <span>Gunakan Kaca Sisa</span>
                                                    </button>
                                                </div>

                                                {/* BARIS 3: KACA SISA TERPASANG (JIKA MEMILIH KACA SISA) */}
                                                {(() => {
                                                    const groupScraps = selectedScraps.filter(scrap => scrap.glass_type === grp.glass_type);
                                                    if (groupScraps.length === 0) return null;
                                                    
                                                    return (
                                                        <div className="bg-purple-50/90 border border-purple-200 rounded-xl p-3 flex flex-col sm:flex-row items-start justify-between gap-3 text-xs text-purple-900 shadow-2xs animate-in fade-in duration-150">
                                                            <div className="flex flex-col gap-2.5 flex-1 w-full">
                                                                <div className="bg-purple-600 text-white font-mono font-bold px-2.5 py-1 rounded-lg text-[10px] flex items-center gap-1.5 self-start shadow-xs">
                                                                    <Scissors className="w-3.5 h-3.5" /> Kaca Sisa Terpasang:
                                                                </div>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {groupScraps.map((scrap, index) => (
                                                                        <div key={index} className="bg-white border border-purple-200 shadow-sm rounded-xl pl-3 pr-1 py-1 text-xs text-purple-900 font-mono font-semibold flex items-center gap-2 hover:border-purple-300 transition-colors group">
                                                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                                                            <div className="flex flex-col">
                                                                                <span className="text-[#1b68b0]">{scrap.scrap_code}</span>
                                                                                <span className="text-[10px] text-slate-500 font-sans leading-none mt-0.5">
                                                                                    {scrap.glass_type} ({scrap.length_cm}x{scrap.width_cm}cm = 1 lbr di {scrap.rak_location})
                                                                                </span>
                                                                            </div>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    if (handleToggleIndividualScrap) {
                                                                                        handleToggleIndividualScrap({ scrap }, 1, 0);
                                                                                    } else {
                                                                                        // Fallback manual rebuild
                                                                                        setOrderForm(prev => {
                                                                                            if (!prev.used_scrap_rak) return prev;
                                                                                            const updated = prev.used_scrap_rak
                                                                                                .replace(new RegExp(`${scrap.scrap_code}[^,]*((,\\s*(?=SCR))|$)`, 'g'), '')
                                                                                                .replace(/,\s*$/, '')
                                                                                                .trim();
                                                                                            return { ...prev, used_scrap_rak: updated };
                                                                                        });
                                                                                    }
                                                                                }}
                                                                                className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer ml-1"
                                                                                title={`Batal gunakan ${scrap.scrap_code}`}
                                                                            >
                                                                                <X className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setOrderForm(prev => {
                                                                        if (!prev.used_scrap_rak) return prev;
                                                                        let updated = prev.used_scrap_rak;
                                                                        groupScraps.forEach(scrap => {
                                                                            updated = updated.replace(new RegExp(`${scrap.scrap_code}[^,]*((,\\s*(?=SCR))|$)`, 'g'), '');
                                                                        });
                                                                        updated = updated.replace(/,\s*$/, '').trim();
                                                                        return { ...prev, used_scrap_rak: updated };
                                                                    });
                                                                }}
                                                                className="bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer shrink-0 self-start sm:mt-0"
                                                                title="Lepas semua penggunaan kaca sisa pada pesanan ini"
                                                            >
                                                                <X className="w-3.5 h-3.5" />
                                                                <span>Lepas Kaca Sisa</span>
                                                            </button>
                                                        </div>
                                                    );
                                                })()}
                                            </div>

                                            {/* SUB-ITEMS LIST */}
                                            <div className="divide-y divide-slate-100">
                                                {grp.items.map(({ item, idx }, subIdx) => (
                                                    <div key={item.id || idx} className="p-3.5 sm:p-4 space-y-3 relative hover:bg-slate-50/40 transition">
                                                        <div className="flex justify-between items-center border-b border-slate-100 pb-2 flex-wrap gap-2">
                                                            <span className="font-bold text-[#242222] text-xs flex items-center gap-2">
                                                                <span>Ukuran #{subIdx + 1}</span>
                                                                <span className="font-mono text-[10px] text-slate-500 font-normal">
                                                                    (Luas: {formatAreaDisplay(item.areaM2)} m²{parseInt(item.qty) > 1 ? ` × ${item.qty} = ${formatAreaDisplay((item.areaM2 || 0) * item.qty)} m²` : ''} | Subtotal: <strong className="text-emerald-700 font-bold">Rp {item.subtotal.toLocaleString()}</strong>)
                                                                </span>
                                                            </span>
                                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                                <button 
                                                                    type="button" 
                                                                    onClick={() => handleDuplicateItem(idx)}
                                                                    className="text-slate-600 hover:text-slate-900 text-[11px] font-bold bg-slate-50 hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 transition flex items-center gap-1 cursor-pointer"
                                                                    title="Duplikat baris ukuran & proses ini"
                                                                >
                                                                    <Copy className="w-3 h-3 text-slate-400" />
                                                                    <span>Duplikat</span>
                                                                </button>
                                                                {calcItems.length > 1 && (
                                                                    <button 
                                                                        type="button" 
                                                                        onClick={() => handleRemoveItem(idx)}
                                                                        className="text-rose-600 hover:text-rose-700 text-[11px] font-bold bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-200 transition flex items-center gap-1 cursor-pointer"
                                                                        title="Hapus baris ini"
                                                                    >
                                                                        <Trash2 className="w-3 h-3 text-rose-500" />
                                                                        <span>Hapus</span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* ROW DIMENSI & QTY */}
                                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                            <div>
                                                                <label className="text-slate-600 block mb-1 text-[11px] font-semibold">Panjang (cm):</label>
                                                                <input 
                                                                    type="text" 
                                                                    inputMode="decimal"
                                                                    required 
                                                                    placeholder="cth: 24,3 atau 150"
                                                                    value={item.length_cm ?? ''} 
                                                                    onChange={e => handleItemChange(idx, 'length_cm', e.target.value)} 
                                                                    onFocus={e => e.target.select()}
                                                                    className={getFieldClass((parseFloat(item.length_cm) || 0) > 0 && !item.isExceeded, "w-full bg-slate-50 border rounded-xl p-2 text-slate-800 font-mono text-xs focus:bg-white")} 
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-slate-600 block mb-1 text-[11px] font-semibold">Lebar (cm):</label>
                                                                <input 
                                                                    type="text" 
                                                                    inputMode="decimal"
                                                                    required 
                                                                    placeholder="cth: 160,5 atau 120"
                                                                    value={item.width_cm ?? ''} 
                                                                    onChange={e => handleItemChange(idx, 'width_cm', e.target.value)} 
                                                                    onFocus={e => e.target.select()}
                                                                    className={getFieldClass((parseFloat(item.width_cm) || 0) > 0 && !item.isExceeded, "w-full bg-slate-50 border rounded-xl p-2 text-slate-800 font-mono text-xs focus:bg-white")} 
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-slate-600 block mb-1 text-[11px] font-semibold">Jumlah (Qty):</label>
                                                                <input 
                                                                    type="text" 
                                                                    inputMode="numeric"
                                                                    min="0" 
                                                                    required 
                                                                    value={item.qty ?? ''} 
                                                                    onChange={e => handleItemChange(idx, 'qty', e.target.value)} 
                                                                    onFocus={e => e.target.select()}
                                                                    className={getFieldClass((parseInt(item.qty) || 0) > 0, "w-full bg-slate-50 border rounded-xl p-2 text-slate-800 font-mono font-bold text-xs focus:bg-white")} 
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* WARNING MELEBIHI UKURAN KACA LEMBARAN */}
                                                        {item.isExceeded && (
                                                            <div className="p-3 rounded-2xl border bg-rose-50 border-rose-200 text-rose-800 text-xs space-y-1 shadow-xs animate-in fade-in duration-150">
                                                                <div className="font-bold flex items-center gap-1.5 text-rose-700">
                                                                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                                                                    <span>Ukuran Input Melebihi Lembaran Kaca yang Tersedia!</span>
                                                                </div>
                                                                <p className="text-[11px] text-slate-600 leading-relaxed pl-5.5">
                                                                    Ukuran potongan <strong>{item.length_cm} x {item.width_cm} cm</strong> melebihi batas maksimal lembaran stok <strong>{item.glass_type || 'Kaca'}</strong> di gudang (Maksimal Lembaran: <strong>{item.maxSheetDim} x {item.minSheetDim} cm</strong>). Ukuran pesanan potongan kaca tidak boleh melebihi lembaran utuh.
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* WARNING MELEBIHI KACA SISA */}
                                                        {checkItemExceedsScrap(item) && (
                                                            <div className="p-3 rounded-2xl border bg-rose-50 border-rose-200 text-rose-800 text-xs space-y-1 shadow-xs animate-in fade-in duration-150 mt-3">
                                                                <div className="font-bold flex items-center gap-1.5 text-rose-700">
                                                                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                                                                    <span>Ukuran Melebihi Kaca Sisa yang Dipilih!</span>
                                                                </div>
                                                                <p className="text-[11px] text-slate-600 leading-relaxed pl-5.5">
                                                                    Ukuran potongan pesanan melebihi batas maksimal dari semua kaca sisa yang Anda pilih saat ini. Kaca pesanan tidak bisa dipotong dari sisa tersebut. Silakan hapus penggunaan kaca sisa, pilih kaca sisa lain yang ukurannya lebih besar, atau perkecil ukuran pesanan.
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* SCRAP RECOMMENDATION BANNER */}
                                                        {(() => {
                                                            const scrapMatch = findMatchingScrapsForOrder(item, initialScrap);
                                                            const isEdgeGrinding = (item.processes || []).includes('GM');
                                                            const exactScrapBlockedByGrinding = isEdgeGrinding
                                                                ? initialScrap?.find(s => {
                                                                    if (s.status && s.status !== 'Layak Pakai') return false;
                                                                    if (!isGlassTypeCompatible(item.glass_type, s.glass_type)) return false;

                                                                    const sLen = parseFloat(s.length_cm) || 0;
                                                                    const sWid = parseFloat(s.width_cm) || 0;
                                                                    const rawLen = parseDim(item.length_cm);
                                                                    const rawWid = parseDim(item.width_cm);

                                                                    const yieldWithoutGM = calculateScrapYield(sLen, sWid, rawLen, rawWid);
                                                                    const yieldWithGM = calculateScrapYield(sLen, sWid, rawLen + 1.0, rawWid + 1.0);

                                                                    return yieldWithoutGM > 0 && yieldWithGM <= 0;
                                                                })
                                                                : null;

                                                            if (exactScrapBlockedByGrinding) {
                                                                return (
                                                                    <div className="p-3 rounded-xl border bg-rose-50 border-rose-200 text-rose-800 text-xs space-y-1 shadow-xs">
                                                                        <div className="font-bold flex items-center gap-1.5 text-rose-700">
                                                                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                                                                            <span>Kaca Sisa di {exactScrapBlockedByGrinding.rak_location} ({exactScrapBlockedByGrinding.scrap_code}) Tidak Bisa Dipakai</span>
                                                                            <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded text-[10px] border border-rose-200 font-mono font-bold">Aturan GM</span>
                                                                        </div>
                                                                        <div className="text-[11px] text-slate-600 leading-relaxed">
                                                                            Stok kaca sisa ukuran <strong>{exactScrapBlockedByGrinding.length_cm} x {exactScrapBlockedByGrinding.width_cm} cm</strong> tidak bisa digunakan untuk orderan ini karena memilih proses <strong>Gosok Mesin (GM)</strong> yang memerlukan toleransi <strong>+1 cm ({parseDim(item.length_cm) + 1} x {parseDim(item.width_cm) + 1} cm)</strong>.
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
                                                                <div className={`p-3.5 rounded-2xl border flex flex-col items-start justify-between gap-3 transition shadow-xs ${
                                                                    isAnySelected ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-amber-50/70 border-amber-200 text-amber-900'
                                                                }`}>
                                                                    <div className="flex items-start gap-2.5 flex-1 w-full">
                                                                        <div className="text-xs space-y-1.5 w-full">
                                                                            <div className="font-bold flex items-center justify-between gap-1.5 flex-wrap">
                                                                                <span className="text-sm">
                                                                                    {isFullCover 
                                                                                        ? matchedScraps.length === 1 
                                                                                            ? `Rekomendasi Kaca Sisa di ${primaryScrap.rak_location} (${primaryScrap.scrap_code})`
                                                                                            : `Rekomendasi Kaca Sisa (${matchedScraps.length} Rak Terpakai)`
                                                                                        : `Rekomendasi: ${totalScrapCovered} Lembar Scrap + ${neededNewGlass} Lembar Bahan Baru`
                                                                                    }
                                                                                </span>
                                                                                <div className="flex items-center gap-1.5">
                                                                                    {isAnySelected && <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] border border-emerald-200 font-mono font-bold">Terpasang</span>}
                                                                                    {hasEdgeGrinding && <span className="bg-blue-100 text-[#1b68b0] px-2 py-0.5 rounded-full text-[10px] border border-blue-200 font-mono font-bold">+1 cm Margin GM</span>}
                                                                                </div>
                                                                            </div>

                                                                            <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-2 text-[11px] shadow-xs">
                                                                                <div className="font-semibold text-slate-700 border-b border-slate-100 pb-1 flex justify-between items-center flex-wrap gap-1">
                                                                                    <span>Pilih Kaca Sisa & Jumlah Lembar (Kebutuhan: {itemQty} Lembar):</span>
                                                                                    <span className="font-mono text-[#1b68b0] font-bold">{totalScrapCovered} / {itemQty} Lembar Maks.</span>
                                                                                </div>

                                                                                <ul className="space-y-2 pt-0.5">
                                                                                    {matchedScraps.map((m, mIdx) => {
                                                                                        const scrapCode = m.scrap.scrap_code;
                                                                                        const maxQty = m.usedQty;
                                                                                        const isThisSelected = orderForm.used_scrap_rak && orderForm.used_scrap_rak.includes(scrapCode);
                                                                                        const currentQty = customScrapQtyMap[scrapCode] !== undefined ? customScrapQtyMap[scrapCode] : maxQty;

                                                                                        return (
                                                                                            <li key={mIdx} className={`p-2.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 transition ${
                                                                                                isThisSelected ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'
                                                                                            }`}>
                                                                                                <div className="space-y-0.5">
                                                                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                                                                        <span className="text-amber-800 font-mono font-bold">▪ {scrapCode}</span>
                                                                                                        <span className="text-slate-500 font-mono">({m.scrap.rak_location})</span>
                                                                                                        <span className="bg-white text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-200">
                                                                                                            Ukuran {m.scrap.length_cm} x {m.scrap.width_cm} cm
                                                                                                        </span>
                                                                                                    </div>
                                                                                                    <div className="font-mono text-slate-500 text-[10px]">
                                                                                                        Potongan Sisa Tersedia: <strong className="text-[#1b68b0] font-bold">{maxQty} lembar</strong>
                                                                                                    </div>
                                                                                                </div>

                                                                                                <div className="flex items-center gap-2 flex-wrap self-end sm:self-center">
                                                                                                    <div className="flex items-center gap-1">
                                                                                                        <label className="text-[10px] text-slate-500 whitespace-nowrap">Pakai:</label>
                                                                                                        <select
                                                                                                            value={currentQty}
                                                                                                            onChange={(e) => {
                                                                                                                const val = Math.max(1, Math.min(maxQty, parseInt(e.target.value) || 1));
                                                                                                                handleUpdateIndividualScrapQty(m, val, itemQty);
                                                                                                            }}
                                                                                                            className="bg-white border border-slate-300 rounded-lg px-1.5 py-0.5 text-xs text-slate-800 font-mono font-bold focus:border-[#1b68b0] cursor-pointer"
                                                                                                        >
                                                                                                            {Array.from({ length: maxQty }, (_, i) => i + 1).map(n => (
                                                                                                                <option key={n} value={n}>{n} lbr</option>
                                                                                                            ))}
                                                                                                        </select>
                                                                                                    </div>

                                                                                                    <button
                                                                                                        type="button"
                                                                                                        onClick={() => handleToggleIndividualScrap(m, currentQty, itemQty)}
                                                                                                        className={`px-3 py-1 rounded-lg font-bold text-xs transition shadow-xs whitespace-nowrap cursor-pointer ${
                                                                                                            isThisSelected 
                                                                                                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200' 
                                                                                                                : 'bg-[#70b03c] hover:bg-[#5f9733] text-white'
                                                                                                        }`}
                                                                                                    >
                                                                                                        {isThisSelected ? `✓ ${currentQty} lbr (Batal)` : `+ Gunakan ${currentQty} lbr`}
                                                                                                    </button>
                                                                                                </div>
                                                                                            </li>
                                                                                        );
                                                                                    })}

                                                                                    {neededNewGlass > 0 && (
                                                                                        <li className="flex items-center justify-between text-[#1b68b0] font-sans border-t border-slate-100 pt-1.5 flex-wrap gap-1">
                                                                                            <span className="font-bold">▪ Kaca Bahan Lembaran Baru</span>
                                                                                            <span className="font-mono font-bold">
                                                                                                Sisa Diambil dari Bahan Baru: <strong className="text-[#1b68b0] text-xs">{neededNewGlass} lembar</strong>
                                                                                            </span>
                                                                                        </li>
                                                                                    )}
                                                                                </ul>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })()}

                                                        {/* OPTIONS PROSES PER ITEM */}
                                                        <div>
                                                            <label className="text-slate-600 block mb-1.5 font-semibold text-[11px]">Options Proses Ukuran #{subIdx + 1}:</label>
                                                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                                                {[
                                                                    { id: 'HT', name: 'HT (Halus Tepi)' },
                                                                    { id: 'BV', name: 'BV (Beveling)' },
                                                                    { id: 'GM', name: 'GM (Gosok Mesin)' },
                                                                    { id: 'Etsa', name: 'Etsa (Sandblast)' },
                                                                    { id: 'Bor', name: 'Bor (Coakan)' },
                                                                ].map(proc => {
                                                                    const isChecked = (item.processes || []).includes(proc.id);
                                                                    return (
                                                                        <label 
                                                                            key={proc.id} 
                                                                            onClick={(e) => {
                                                                                e.preventDefault();
                                                                                toggleItemProcess(idx, proc.id);
                                                                            }} 
                                                                            className={`p-2 rounded-xl border cursor-pointer transition flex items-center justify-between text-[11px] shadow-xs ${
                                                                                isChecked 
                                                                                    ? 'bg-blue-50 border-[#1b68b0] text-[#1b68b0] font-bold' 
                                                                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                                                            }`}
                                                                        >
                                                                            <span>{proc.name}</span>
                                                                            <input 
                                                                                type="checkbox" 
                                                                                checked={isChecked} 
                                                                                onChange={() => {}} 
                                                                                className="rounded border-slate-300 text-[#1b68b0] w-3.5 h-3.5 pointer-events-none" 
                                                                            />
                                                                        </label>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>

                                                        {/* CONDITIONAL PARAMETERS FOR BEVEL & BOR */}
                                                        {(item.processes || []).includes('BV') && (
                                                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                                                                <label className="text-[11px] text-slate-700 font-semibold block">
                                                                    Lebar Bevel (cm): <span className="text-[10px] text-slate-500 font-mono">(Biaya: Keliling × Rp 15.000 + Lebar cm × Rp 10.000)</span>
                                                                </label>
                                                                <input 
                                                                    type="text" 
                                                                    inputMode="decimal"
                                                                    value={item.bevel_width_cm ?? ''} 
                                                                    onChange={e => handleItemChange(idx, 'bevel_width_cm', e.target.value)} 
                                                                    onFocus={e => e.target.select()}
                                                                    className="w-36 bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800 font-mono font-bold focus:border-[#1b68b0]" 
                                                                />
                                                            </div>
                                                        )}

                                                        {(item.processes || []).includes('Bor') && (
                                                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                                                                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200 pb-2">
                                                                    <div>
                                                                        <label className="text-xs text-[#242222] font-bold">
                                                                            Dimensi Lubang Bor / Coakan
                                                                        </label>
                                                                        <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                                                                            *Biaya: Keliling Ruas cm × Rp 2.500 × Qty Lubang
                                                                        </span>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleAddHoleSpec(idx)}
                                                                        className="text-[#1b68b0] hover:text-[#15528c] text-xs font-bold bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition flex items-center gap-1 shadow-xs cursor-pointer"
                                                                    >
                                                                        <Plus className="w-3 h-3" />
                                                                        <span>Tambah Lubang</span>
                                                                    </button>
                                                                </div>

                                                                <div className="space-y-2">
                                                                    {(item.holes && item.holes.length > 0 ? item.holes : [
                                                                        { hole_length_cm: item.hole_length_cm || 2, hole_width_cm: item.hole_width_cm || 2, hole_qty: item.hole_qty || 1 }
                                                                    ]).map((hSpec, hIdx) => (
                                                                        <div key={hIdx} className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-2 shadow-xs">
                                                                            <div className="flex justify-between items-center text-[11px] font-bold text-slate-700">
                                                                                <span className="flex items-center gap-1.5">
                                                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#1b68b0]"></span>
                                                                                    Lubang #{hIdx + 1}
                                                                                </span>
                                                                                {((item.holes ? item.holes.length : 1) > 1) && (
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => handleRemoveHoleSpec(idx, hIdx)}
                                                                                        className="text-rose-600 hover:text-rose-700 text-[10px] font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 transition cursor-pointer"
                                                                                    >
                                                                                        Hapus
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                                                <div>
                                                                                    <span className="text-[10px] text-slate-500 block mb-0.5">Panjang Lubang (cm):</span>
                                                                                    <input 
                                                                                        type="text" 
                                                                                        inputMode="decimal"
                                                                                        value={hSpec.hole_length_cm ?? ''} 
                                                                                        onChange={e => handleHoleSpecChange(idx, hIdx, 'hole_length_cm', e.target.value)} 
                                                                                        onFocus={e => e.target.select()}
                                                                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800 font-mono font-bold focus:border-[#1b68b0]" 
                                                                                    />
                                                                                </div>
                                                                                <div>
                                                                                    <span className="text-[10px] text-slate-500 block mb-0.5">Lebar Lubang (cm):</span>
                                                                                    <input 
                                                                                        type="text" 
                                                                                        inputMode="decimal"
                                                                                        value={hSpec.hole_width_cm ?? ''} 
                                                                                        onChange={e => handleHoleSpecChange(idx, hIdx, 'hole_width_cm', e.target.value)} 
                                                                                        onFocus={e => e.target.select()}
                                                                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800 font-mono font-bold focus:border-[#1b68b0]" 
                                                                                        />
                                                                                </div>
                                                                                <div>
                                                                                    <span className="text-[10px] text-slate-500 block mb-0.5">Jumlah Lubang (Qty):</span>
                                                                                    <input 
                                                                                        type="text" 
                                                                                        inputMode="numeric"
                                                                                        value={hSpec.hole_qty ?? ''} 
                                                                                        onChange={e => handleHoleSpecChange(idx, hIdx, 'hole_qty', e.target.value)} 
                                                                                        onFocus={e => e.target.select()}
                                                                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800 font-mono font-bold focus:border-[#1b68b0]" 
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {(item.processes || []).includes('Etsa') && (
                                                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                                                                <label className="text-[11px] text-slate-700 font-semibold flex items-center justify-between">
                                                                    <span>Dimensi Area Etsa / Sandblast:</span>
                                                                    <span className="text-[10px] text-slate-500 font-mono">(Tarif: Rp 50.000 / m²)</span>
                                                                </label>
                                                                <div className="grid grid-cols-3 gap-2">
                                                                    <div>
                                                                        <span className="text-[10px] text-slate-500 block mb-0.5">Panjang (cm):</span>
                                                                        <input 
                                                                            type="text" 
                                                                            inputMode="decimal"
                                                                            value={item.etsa_length_cm ?? ''} 
                                                                            onChange={e => handleItemChange(idx, 'etsa_length_cm', e.target.value)} 
                                                                            onFocus={e => e.target.select()}
                                                                            className="w-full bg-white border border-slate-200 rounded-lg p-1 text-xs text-slate-800 font-mono font-bold focus:border-[#1b68b0]" 
                                                                            placeholder={item.length_cm}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-[10px] text-slate-500 block mb-0.5">Lebar (cm):</span>
                                                                        <input 
                                                                            type="text" 
                                                                            inputMode="decimal"
                                                                            value={item.etsa_width_cm ?? ''} 
                                                                            onChange={e => handleItemChange(idx, 'etsa_width_cm', e.target.value)} 
                                                                            onFocus={e => e.target.select()}
                                                                            className="w-full bg-white border border-slate-200 rounded-lg p-1 text-xs text-slate-800 font-mono font-bold focus:border-[#1b68b0]" 
                                                                            placeholder={item.width_cm}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-[10px] text-slate-500 block mb-0.5">Jumlah Area (Pcs):</span>
                                                                        <input 
                                                                            type="text" 
                                                                            inputMode="numeric"
                                                                            value={item.etsa_qty ?? ''} 
                                                                            onChange={e => handleItemChange(idx, 'etsa_qty', e.target.value)} 
                                                                            onFocus={e => e.target.select()}
                                                                            className="w-full bg-white border border-slate-200 rounded-lg p-1 text-xs text-slate-800 font-mono font-bold focus:border-[#1b68b0]" 
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* PRICING BREAKDOWN BADGES */}
                                                        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] font-mono border-t border-slate-100">
                                                            <span className="text-slate-400 font-semibold">Rincian:</span>
                                                            <span className="bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 text-slate-700">
                                                                Kaca: Rp {item.baseGlassPrice.toLocaleString()}
                                                            </span>
                                                            {item.feeGM > 0 && (
                                                                <span className="bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 text-[#1b68b0] font-bold">
                                                                    GM: +Rp {item.feeGM.toLocaleString()}
                                                                </span>
                                                            )}
                                                            {item.feeHT > 0 && (
                                                                <span className="bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 text-[#1b68b0] font-bold">
                                                                    HT: +Rp {item.feeHT.toLocaleString()}
                                                                </span>
                                                            )}
                                                            {item.feeBV > 0 && (
                                                                <span className="bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 text-[#1b68b0] font-bold">
                                                                    Bevel: +Rp {item.feeBV.toLocaleString()}
                                                                </span>
                                                            )}
                                                            {item.feeBor > 0 && (
                                                                <span className="bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 text-[#1b68b0] font-bold">
                                                                    Bor: +Rp {item.feeBor.toLocaleString()}
                                                                </span>
                                                            )}
                                                            {item.feeEtsa > 0 && (
                                                                <span className="bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 text-[#1b68b0] font-bold">
                                                                    Etsa: +Rp {item.feeEtsa.toLocaleString()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </div>

                    {/* SECTION 4: AKSESORIS */}
                    <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                            <h4 className="font-bold text-[#242222] text-xs flex items-center gap-1.5">
                                <Package className="w-4 h-4 text-[#1b68b0]" />
                                <span>Tambahan Aksesoris / Hardware Proyek</span>
                            </h4>
                            <span className="text-[10px] text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                Stok Terhubung Gudang
                            </span>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <select
                                className="bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium focus:border-[#1b68b0] flex-1 shadow-xs cursor-pointer"
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
                                    const masterAcc = (MASTER_ACCESSORY_STOCK || []).find(m => isObj && (m.id === acc.id || m.name === acc.name));
                                    const accStock = masterAcc && masterAcc.stock !== undefined ? parseInt(masterAcc.stock) : (isObj && acc.stock !== undefined ? parseInt(acc.stock) : 99999);
                                    const accQty = isObj ? (parseInt(acc.qty) || 1) : 1;
                                    const isExceedingStock = accStock > 0 && accQty >= accStock;
                                    const accTotal = accPrice * accQty;

                                    return (
                                        <div key={accIdx} className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs shadow-xs">
                                            <div className="flex items-center gap-2 flex-wrap flex-1">
                                                <span className="font-bold text-slate-800">{accName}</span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                                                    accStock < 10 ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                }`}>
                                                    Stok: {accStock} {accUnit}
                                                </span>
                                                {isExceedingStock && (
                                                    <span className="text-[10px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full font-bold border border-rose-200 flex items-center gap-1">
                                                        <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                                                        Maks. Stok Terpenuhi ({accStock} {accUnit})
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-3 w-full sm:w-auto justify-between">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[10px] text-slate-500">Jumlah:</span>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        value={accQty ?? ''}
                                                        onChange={e => {
                                                            const val = parseInt(e.target.value) || 0;
                                                            if (accStock > 0 && val > accStock) {
                                                                handleAccessoryQtyChange(accIdx, accStock);
                                                            } else {
                                                                handleAccessoryQtyChange(accIdx, e.target.value);
                                                            }
                                                        }}
                                                        onFocus={e => e.target.select()}
                                                        className={`w-16 bg-slate-50 border rounded-lg p-1 text-center text-xs font-mono font-bold text-slate-800 focus:bg-white ${
                                                            isExceedingStock ? 'border-amber-400 focus:border-amber-500' : 'border-slate-200 focus:border-[#1b68b0]'
                                                        }`}
                                                    />
                                                    <span className="text-[10px] text-slate-500">{accUnit}</span>
                                                </div>

                                                <span className="font-mono text-[#1b68b0] font-bold min-w-[90px] text-right">
                                                    Rp {accTotal.toLocaleString()}
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveAccessory(accIdx)}
                                                    className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-3 bg-white rounded-xl border border-dashed border-slate-200 text-center text-slate-500 text-xs">
                                Belum ada aksesoris ditambahkan. Pilih dari dropdown stok di atas jika proyek memerlukan hardware/fitting pendukung.
                            </div>
                        )}
                    </div>

                    {/* SECTION 5: DESKRIPSI & SKETSA GAMBAR */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-2">
                            <h4 className="font-bold text-[#242222] text-xs border-b border-slate-200 pb-2 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-[#1b68b0]" />
                                <span>Catatan Order / Penjelasan Kaca</span>
                            </h4>
                            <textarea 
                                required 
                                rows="3" 
                                value={orderForm.description} 
                                onChange={e => setOrderForm('description', e.target.value)} 
                                className={getFieldClass(isDescriptionValid, "w-full bg-white border rounded-xl p-2.5 text-slate-800 text-xs shadow-xs transition")} 
                                placeholder="Penjelasan mengenai pengerjaan kaca (cth: iya di coak di proyek, celah 2mm, instruksi khusus)... (Wajib diisi, jika tidak ada ketik '-')" 
                            />
                        </div>

                        <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-2">
                            <h4 className="font-bold text-[#242222] text-xs border-b border-slate-200 pb-2 flex items-center gap-2">
                                <Upload className="w-4 h-4 text-[#1b68b0]" />
                                <span>Gambar / Sketsa Kaca (JPG/PNG)</span>
                            </h4>
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileChange} 
                                className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-700 text-xs cursor-pointer shadow-xs" 
                            />
                            {sketchPreview && (
                                <div className="mt-2 flex items-center gap-2.5 bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
                                    <img src={sketchPreview} alt="Preview Sketsa" className="w-12 h-12 object-cover rounded-lg border border-slate-200" />
                                    <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>Sketsa Berhasil Di-upload</span>
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SECTION 6: PRIORITAS & DEADLINE */}
                    <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
                        <h4 className="font-bold text-[#242222] text-xs border-b border-slate-200 pb-2 flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-amber-600" />
                                <span>Status Prioritas & Tanggal Selesai</span>
                            </span>
                            {orderForm.priority_status === 'Prioritas' && (
                                <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full font-mono">
                                    🔥 Order Prioritas / Express
                                </span>
                            )}
                        </h4>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                            {/* 1. STATUS PENGERJAAN */}
                            <div className={orderForm.priority_status === 'Prioritas' ? 'lg:col-span-4' : 'lg:col-span-6'}>
                                <label className="text-slate-700 block mb-1.5 text-xs font-bold">Status Pengerjaan:</label>
                                <select 
                                    value={orderForm.priority_status} 
                                    onChange={e => {
                                        const val = e.target.value;
                                        setOrderForm(d => ({
                                            ...d,
                                            priority_status: val,
                                            priority_fee: val === 'Prioritas' ? (d.priority_fee ?? 0) : 0
                                        }));
                                    }} 
                                    className={getFieldClass(Boolean(orderForm.priority_status), "w-full bg-white border rounded-xl p-2.5 text-slate-800 font-bold focus:ring-2 focus:ring-[#1b68b0]/15 shadow-xs cursor-pointer text-xs transition")}
                                >
                                    <option value="" disabled>-- Pilih Status --</option>
                                    <option value="Biasa">Biasa (Standard)</option>
                                    <option value="Prioritas">🔥 Prioritas (Buru-buru / Express)</option>
                                </select>
                            </div>

                            {/* 2. HARUS DISELESAIKAN PADA (DEADLINE) */}
                            <div className={orderForm.priority_status === 'Prioritas' ? 'lg:col-span-3' : 'lg:col-span-6'}>
                                <label className="text-slate-700 block mb-1.5 text-xs font-bold">Harus Selesai (Deadline):</label>
                                <input 
                                    type="date" 
                                    value={orderForm.deadline_date} 
                                    onChange={e => setOrderForm('deadline_date', e.target.value)} 
                                    className={getFieldClass(isDeadlineDateValid, "w-full bg-white border rounded-xl p-2.5 text-slate-800 font-semibold focus:ring-2 focus:ring-[#1b68b0]/15 shadow-xs text-xs transition")}
                                />
                            </div>

                            {/* 3. NOMINAL FEE PRIORITAS (HANYA MUNCUL JIKA PRIORITAS) */}
                            {orderForm.priority_status === 'Prioritas' && (
                                <div className="lg:col-span-5 space-y-1.5 bg-amber-50/60 p-3 rounded-xl border border-amber-200/80">
                                    <label className="text-amber-900 block font-bold text-xs">Nominal Fee Prioritas (Rp):</label>
                                    <input 
                                        type="text" 
                                        inputMode="numeric"
                                        value={formatRupiahInput(orderForm.priority_fee)} 
                                        onChange={e => setOrderForm('priority_fee', parseRupiahInput(e.target.value))} 
                                        onFocus={e => e.target.select()}
                                        className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-amber-900 font-black font-mono shadow-xs transition focus:border-[#1b68b0] text-xs" 
                                        placeholder="0 (Free / Gratis)" 
                                    />
                                    
                                    {/* PILIH CEPAT NOMINAL */}
                                    <div className="flex flex-wrap items-center gap-1 pt-0.5">
                                        <span className="text-[10px] text-slate-600 font-bold mr-0.5">Pilih Cepat:</span>
                                        <button
                                            type="button"
                                            onClick={() => setOrderForm('priority_fee', 0)}
                                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                                                (parseFloat(orderForm.priority_fee) || 0) === 0
                                                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                            }`}
                                        >
                                            Rp 0 (Free)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setOrderForm('priority_fee', 50000)}
                                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                                                (parseFloat(orderForm.priority_fee) || 0) === 50000
                                                    ? 'bg-[#1b68b0] text-white border-[#15528c] shadow-xs'
                                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                            }`}
                                        >
                                            Rp 50.000
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setOrderForm('priority_fee', 100000)}
                                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                                                (parseFloat(orderForm.priority_fee) || 0) === 100000
                                                    ? 'bg-[#1b68b0] text-white border-[#15528c] shadow-xs'
                                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                            }`}
                                        >
                                            Rp 100.000
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setOrderForm('priority_fee', 150000)}
                                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                                                (parseFloat(orderForm.priority_fee) || 0) === 150000
                                                    ? 'bg-[#1b68b0] text-white border-[#15528c] shadow-xs'
                                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                            }`}
                                        >
                                            Rp 150.000
                                        </button>
                                    </div>
                                    <span className="text-[10px] text-amber-800 block font-mono leading-tight pt-0.5">
                                        💡 *Default Rp 0 (Free/Gratis tanpa charge). Isi nominal jika ada charge ekspress.
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SECTION 8: METODE & OPSI PEMBAYARAN */}
                    <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
                        <h4 className="font-bold text-[#242222] text-xs border-b border-slate-200 pb-2 flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-[#1b68b0]" />
                                <span>Metode & Opsi Pembayaran Customer</span>
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                                Total: <strong className="text-emerald-700 font-extrabold text-sm">Rp {calcTotalPrice.toLocaleString()}</strong>
                            </span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                                <label className="text-slate-600 block mb-1 font-semibold">Metode Pembayaran Customer:</label>
                                <select 
                                    value={orderForm.payment_method || 'cash'} 
                                    onChange={e => setOrderForm('payment_method', e.target.value)} 
                                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:border-[#1b68b0] shadow-xs cursor-pointer"
                                >
                                    <option value="cash">Cash / Tunai</option>
                                    <option value="transfer">Transfer Bank (BCA/Mandiri/BRI)</option>
                                    <option value="qris">QRIS (Scan Barcode)</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-slate-600 block mb-1 font-semibold">Jumlah Uang Diterima / Dibayar (Rp):</label>
                                <input 
                                    type="text" 
                                    inputMode="numeric"
                                    value={formatRupiahInput(orderForm.custom_paid_amount)} 
                                    onChange={e => {
                                        let num = parseRupiahInput(e.target.value);
                                        if (Number(num || 0) > calcTotalPrice) {
                                            num = calcTotalPrice.toString();
                                        }
                                        const pct = calcTotalPrice > 0 ? Math.round((Number(num || 0) / calcTotalPrice) * 100) : 50;
                                        setOrderForm(d => ({ ...d, custom_paid_amount: num, dp_percent: pct }));
                                    }} 
                                    onFocus={e => e.target.select()}
                                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-emerald-700 font-mono font-bold text-sm focus:border-[#1b68b0] shadow-xs" 
                                    placeholder="cth: 500.000 atau 1.000.000" 
                                />
                            </div>
                        </div>

                        <div className="space-y-1 pt-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[11px] text-slate-500 font-semibold">Tombol Cepat Bayar:</span>
                                {[
                                    { label: '50% (DP 50%)', val: Math.round(calcTotalPrice * 0.5), pct: 50 },
                                    { label: '100% (Bayar Lunas / Full)', val: calcTotalPrice, pct: 100 }
                                ].map((preset, pIdx) => {
                                    const currentPaid = orderForm.custom_paid_amount !== '' && orderForm.custom_paid_amount !== null && orderForm.custom_paid_amount !== undefined
                                        ? parseFloat(orderForm.custom_paid_amount) || 0
                                        : Math.round(calcTotalPrice * ((orderForm.dp_percent || 50) / 100));
                                    const isActive = preset.pct === 100 
                                        ? (currentPaid >= calcTotalPrice && calcTotalPrice > 0)
                                        : (currentPaid === preset.val || (currentPaid > 0 && currentPaid < calcTotalPrice));

                                    return (
                                        <button 
                                            key={pIdx}
                                            type="button"
                                            onClick={() => {
                                                const targetVal = preset.pct === 100 ? calcTotalPrice : Math.round(calcTotalPrice * 0.5);
                                                setOrderForm(d => ({ ...d, custom_paid_amount: targetVal, dp_percent: preset.pct }));
                                            }}
                                            className={`px-3 py-1.5 border rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                                                isActive 
                                                    ? 'bg-[#1b68b0] text-white border-[#1b68b0]' 
                                                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                                            }`}
                                        >
                                            {preset.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* SISA PELUNASAN (COD) */}
                        <div className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center text-xs shadow-xs">
                            <span className="text-slate-500 text-[11px] font-semibold">Sisa Pelunasan (COD):</span>
                            <span className="font-mono font-bold text-slate-800">
                                {(() => {
                                    const paid = orderForm.custom_paid_amount !== '' && orderForm.custom_paid_amount !== null && orderForm.custom_paid_amount !== undefined
                                        ? (parseFloat(orderForm.custom_paid_amount) || 0)
                                        : Math.round(calcTotalPrice * ((orderForm.dp_percent || 50) / 100));
                                    const sisa = Math.max(0, calcTotalPrice - paid);
                                    return sisa === 0 ? <span className="text-emerald-700 font-extrabold">Rp 0 (LUNAS)</span> : `Rp ${sisa.toLocaleString()}`;
                                })()}
                            </span>
                        </div>
                    </div>

                    {/* SECTION 7: RINCIAN STRUK ORDERAN */}
                    <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3 font-mono">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                            <h4 className="font-bold text-[#242222] text-xs flex items-center gap-1.5 font-sans">
                                <FileText className="w-4 h-4 text-[#1b68b0]" />
                                <span>Rincian Struk Orderan & Kalkulasi Harga</span>
                            </h4>
                            <span className="text-[10px] text-slate-500">
                                Luas Total: <strong className="text-[#1b68b0]">{formatAreaDisplay(calcItems.reduce((sum, i) => sum + ((i.areaM2 || 0) * (parseInt(i.qty) || 1)), 0))} m²</strong>
                            </span>
                        </div>

                        {/* LIST ITEM KACA RECEIPT LINES */}
                        <div className="space-y-3 text-xs">
                            {calcItems.map((it, iIdx) => {
                                const processFeeSum = (it.feeGM || 0) + (it.feeHT || 0) + (it.feeBV || 0) + (it.feeBor || 0) + (it.feeEtsa || 0);
                                return (
                                    <div key={iIdx} className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2 shadow-xs">
                                        <div className="flex justify-between text-slate-800 font-bold border-b border-slate-100 pb-1.5">
                                            <span>
                                                #{iIdx + 1}. {it.glass_type || 'Kaca Dasar'} ({it.length_cm || 0} x {it.width_cm || 0} cm)
                                            </span>
                                            <span className="text-[#1b68b0] font-mono">
                                                {it.qty} Unit (Total {formatAreaDisplay((it.areaM2 || 0) * (parseInt(it.qty) || 1))} m²)
                                            </span>
                                        </div>

                                        <div className="space-y-1 text-[11px] text-slate-600 pl-1">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">1. Harga Kaca (Bahan):</span>
                                                <strong className="text-slate-800">Rp {it.baseGlassPrice.toLocaleString()}</strong>
                                            </div>

                                            <div className="space-y-0.5 pl-2 border-l-2 border-slate-200 my-1">
                                                <div className="text-[10px] text-[#1b68b0] font-semibold">2. Rincian Biaya Eksekusi / Proses Kaca:</div>
                                                {it.processes && it.processes.includes('HT') && (
                                                    <div className="flex justify-between text-[10px] text-slate-500">
                                                        <span>• Potong & Halus Tepi (HT)</span>
                                                        <span>+ Rp {(it.feeHT || 0).toLocaleString()}</span>
                                                    </div>
                                                )}
                                                {it.processes && it.processes.includes('GM') && (
                                                    <div className="flex justify-between text-[10px] text-slate-500">
                                                        <span>• Gosok Mesin (GM)</span>
                                                        <span>+ Rp {(it.feeGM || 0).toLocaleString()}</span>
                                                    </div>
                                                )}
                                                {it.processes && it.processes.includes('BV') && (
                                                    <div className="flex justify-between text-[10px] text-slate-500">
                                                        <span>• Beveling (BV {it.bevel_width_cm || 1} cm)</span>
                                                        <span>+ Rp {(it.feeBV || 0).toLocaleString()}</span>
                                                    </div>
                                                )}
                                                {it.processes && it.processes.includes('Bor') && (
                                                    <div className="flex justify-between text-[10px] text-slate-500">
                                                        <span>• Bor Coakan Lubang ({it.hole_qty || 1} lubang)</span>
                                                        <span>+ Rp {(it.feeBor || 0).toLocaleString()}</span>
                                                    </div>
                                                )}
                                                {it.processes && it.processes.includes('Etsa') && (
                                                    <div className="flex justify-between text-[10px] text-slate-500">
                                                        <span>• Etsa Sandblast</span>
                                                        <span>+ Rp {(it.feeEtsa || 0).toLocaleString()}</span>
                                                    </div>
                                                )}
                                                {(!it.processes || it.processes.length === 0) && (
                                                    <div className="text-[10px] text-slate-400 italic">• Polos (Tanpa Proses Lanjutan)</div>
                                                )}
                                            </div>

                                            <div className="flex justify-between text-[11px] text-slate-700 font-semibold pt-0.5">
                                                <span className="text-slate-500">• Total Biaya Eksekusi:</span>
                                                <strong className="text-[#1b68b0]">+ Rp {processFeeSum.toLocaleString()}</strong>
                                            </div>
                                        </div>

                                        <div className="text-right text-xs font-bold text-slate-800 border-t border-slate-100 pt-1.5">
                                            Subtotal Item #{iIdx + 1}: <span className="text-emerald-700 font-black">Rp {it.subtotal.toLocaleString()}</span>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* AKSESORIS TAMBAHAN */}
                            {orderForm.accessories && orderForm.accessories.length > 0 && (
                                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1 shadow-xs">
                                    <div className="font-bold text-slate-800 text-xs flex justify-between border-b border-slate-100 pb-1">
                                        <span>Aksesoris & Hardware Tambahan:</span>
                                        <span className="text-[#1b68b0]">Rp {calcTotalAccessoryFees.toLocaleString()}</span>
                                    </div>
                                    {orderForm.accessories.map((acc, aIdx) => {
                                        const price = typeof acc === 'object' ? (acc.price || 0) : 0;
                                        const qty = typeof acc === 'object' ? (acc.qty || 1) : 1;
                                        const name = typeof acc === 'object' ? (acc.name || 'Aksesoris') : acc;
                                        return (
                                            <div key={aIdx} className="flex justify-between text-[11px] text-slate-600 pl-1">
                                                <span>- {name} ({qty} {acc.unit || 'pcs'})</span>
                                                <strong className="text-slate-800">Rp {(price * qty).toLocaleString()}</strong>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* GARIS PEMBATAS STRUK */}
                        <div className="border-t border-dashed border-slate-200 my-2"></div>

                        {/* FINAL CALCULATION SUMMARY */}
                        <div className="space-y-1.5 text-xs font-sans">
                            <div className="flex justify-between text-slate-600">
                                <span>Total Harga Kaca Dibeli (Bahan):</span>
                                {orderForm.is_company_use ? (
                                    <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px] flex items-center gap-1">
                                        <Building2 className="w-3 h-3 text-emerald-600" />
                                        Rp 0 (Free Kaca - Orderan Kosong)
                                    </span>
                                ) : (
                                    <strong className="font-mono text-slate-800">Rp {calcTotalGlassBasePrice.toLocaleString()}</strong>
                                )}
                            </div>

                            <div className="flex justify-between text-slate-600">
                                <span>Total Biaya Eksekusi / Proses Kaca:</span>
                                {orderForm.is_company_use ? (
                                    <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px] flex items-center gap-1">
                                        <Building2 className="w-3 h-3 text-emerald-600" />
                                        + Rp 0 (Free Proses - Orderan Kosong)
                                    </span>
                                ) : (
                                    <strong className="font-mono text-[#1b68b0]">+ Rp {calcTotalProcessFees.toLocaleString()}</strong>
                                )}
                            </div>

                            {calcTotalAccessoryFees > 0 && (
                                <div className="flex justify-between text-slate-600">
                                    <span>Total Aksesoris & Hardware:</span>
                                    <strong className="font-mono text-slate-800">+ Rp {calcTotalAccessoryFees.toLocaleString()}</strong>
                                </div>
                            )}

                            {/* BIAYA PRIORITAS */}
                            <div className="flex justify-between items-center bg-amber-50/60 p-2.5 rounded-xl border border-amber-200">
                                <span className="text-amber-900 font-bold flex items-center gap-1">
                                    Biaya Prioritas Pengerjaan (Buru-buru):
                                    {orderForm.priority_status !== 'Prioritas' && <span className="text-[10px] text-slate-500 font-normal ml-1">(Status: Biasa)</span>}
                                </span>
                                {calcPriorityFee === 0 ? (
                                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-mono">
                                        + Rp 0 (Free / Gratis)
                                    </span>
                                ) : (
                                    <strong className="font-mono text-amber-800 font-extrabold text-sm">
                                        + Rp {calcPriorityFee.toLocaleString('id-ID')}
                                    </strong>
                                )}
                            </div>

                            {/* BIAYA CUSTOM ADMIN */}
                            <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
                                <label className="text-slate-700 font-medium">
                                    Biaya Tambahan / Custom Admin (Rp):
                                </label>
                                <input 
                                    type="text" 
                                    inputMode="numeric"
                                    value={formatRupiahInput(orderForm.custom_fee)} 
                                    onChange={e => setOrderForm('custom_fee', parseRupiahInput(e.target.value))} 
                                    onFocus={e => e.target.select()}
                                    className="w-36 bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-800 font-mono font-bold text-xs text-right focus:border-[#1b68b0] focus:bg-white" 
                                    placeholder="0" 
                                />
                            </div>

                            <div className="border-t border-dashed border-emerald-300 pt-2 flex justify-between items-center bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200 mt-2">
                                <div>
                                    <span className="text-emerald-900 block font-bold text-xs">GRAND TOTAL HARGA ORDER:</span>
                                    <span className="text-[10px] text-emerald-700 font-mono">Bahan + Eksekusi + Prioritas + Custom</span>
                                </div>
                                <span className="font-mono font-black text-emerald-800 text-lg sm:text-xl">
                                    Rp {calcTotalPrice.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* WARNING BANNER BILA BELUM LENGKAP */}
                    {!isFormValid && (
                        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-3.5 text-xs space-y-1.5 shadow-xs">
                            <div className="font-bold flex items-center gap-1.5 text-amber-800">
                                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                <span>Lengkapi Field Wajib Sebelum Menerbitkan Orderan:</span>
                            </div>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-amber-800/90 pl-5 list-disc font-medium">
                                {!isCustomerNameValid && <li>Nama Customer belum diisi</li>}
                                {!isCustomerPhoneValid && <li>Nomor Telepon / WA belum diisi</li>}
                                {!isCustomerAddressValid && <li>Alamat Pengiriman belum diisi</li>}
                                {!isDescriptionValid && <li>Catatan Order / Penjelasan Kaca belum diisi</li>}
                                {!isOrderDateValid && <li>Tanggal Order belum diisi</li>}
                                {!isItemsValid && <li>Item Kaca belum lengkap (Jenis Kaca, Panjang, Lebar, Qty)</li>}
                                {!isPriorityValid && <li>Nominal Fee Prioritas wajib diisi (&gt; 0)</li>}
                                {!isRevisionNotesValid && <li>Catatan Alasan Perubahan Revisi wajib diisi</li>}
                            </ul>
                        </div>
                    )}

                    {/* MODAL ACTIONS */}
                    <div className="flex flex-wrap justify-end gap-2.5 pt-3 border-t border-slate-200">
                        <button 
                            type="button" 
                            onClick={closeHandler} 
                            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-semibold transition cursor-pointer shadow-xs"
                        >
                            Batal
                        </button>
                        {editingOrder.status === 'pengerjaan' ? (
                            <button 
                                type="button" 
                                disabled={isSubmittingOrder}
                                onClick={(e) => {
                                    if (isSubmittingOrder) return;
                                    setAttemptedSubmit(true);
                                    setShakeKey(prev => prev + 1);
                                    if (!isFormValid) {
                                        setTimeout(() => {
                                            const firstInvalid = document.querySelector('.form-invalid-input');
                                            if (firstInvalid) {
                                                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                firstInvalid.focus();
                                            }
                                        }, 50);
                                        return;
                                    }
                                    handleUpdateOrderSubmit(e, 'pengerjaan');
                                }} 
                                className={`px-5 py-2.5 font-bold text-white rounded-xl text-xs flex items-center gap-2 shadow-xs transition ${
                                    isSubmittingOrder ? 'opacity-70 cursor-not-allowed bg-amber-500' :
                                    isFormValid 
                                        ? 'bg-amber-500 hover:bg-amber-600 cursor-pointer' 
                                        : 'bg-rose-600 hover:bg-rose-700 cursor-pointer'
                                }`}
                            >
                                {isSubmittingOrder && submittingAction === 'pengerjaan' ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <RotateCcw className="w-3.5 h-3.5" />
                                )}
                                <span>{isSubmittingOrder && submittingAction === 'pengerjaan' ? 'Memproses Revisi...' : 'Simpan Revisi & Kirim Peringatan Divisi'}</span>
                            </button>
                        ) : (
                            <>
                                <button 
                                    type="button" 
                                    disabled={isSubmittingOrder}
                                    onClick={(e) => {
                                        if (isSubmittingOrder) return;
                                        setAttemptedSubmit(true);
                                        setShakeKey(prev => prev + 1);
                                        if (!isCustomerNameValid) {
                                            setTimeout(() => {
                                                const firstInvalid = document.querySelector('.form-invalid-input');
                                                if (firstInvalid) {
                                                    firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                    firstInvalid.focus();
                                                }
                                            }, 50);
                                            return;
                                        }
                                        handleUpdateOrderSubmit(e, 'draft');
                                    }} 
                                    className={`px-4 py-2 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition ${
                                        isSubmittingOrder ? 'opacity-70 cursor-not-allowed bg-[#1b68b0] text-white' :
                                        isCustomerNameValid 
                                            ? 'bg-[#1b68b0] hover:bg-[#15528c] text-white cursor-pointer' 
                                            : 'bg-slate-100 border border-slate-200 text-slate-500 cursor-pointer'
                                    }`}
                                >
                                    {isSubmittingOrder && submittingAction === 'draft' ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                                    ) : (
                                        <FileText className="w-3.5 h-3.5" />
                                    )}
                                    <span>{isSubmittingOrder && submittingAction === 'draft' ? 'Memproses Perubahan...' : 'Simpan Perubahan Draf'}</span>
                                </button>
                                <button 
                                    type="button" 
                                    disabled={isSubmittingOrder}
                                    onClick={(e) => {
                                        if (isSubmittingOrder) return;
                                        setAttemptedSubmit(true);
                                        setShakeKey(prev => prev + 1);
                                        if (!isFormValid) {
                                            setTimeout(() => {
                                                const firstInvalid = document.querySelector('.form-invalid-input');
                                                if (firstInvalid) {
                                                    firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                    firstInvalid.focus();
                                                }
                                            }, 50);
                                            return;
                                        }
                                        handleUpdateOrderSubmit(e, 'pengerjaan');
                                    }} 
                                    title={!isFormValid ? "Mohon lengkapi seluruh field wajib (field kosong akan geter, berwarna merah & otomatis diarahkan)" : "Deal & Terbit Orderan"}
                                    className={`px-5 py-2.5 font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition ${
                                        isSubmittingOrder ? 'opacity-70 cursor-not-allowed bg-[#70b03c] text-white' :
                                        isFormValid 
                                            ? 'bg-[#70b03c] hover:bg-[#5f9733] text-white cursor-pointer' 
                                            : 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
                                    }`}
                                >
                                    <span>{isSubmittingOrder && submittingAction === 'pengerjaan' ? 'Memproses Order...' : `Deal & Terbit Order (${orderForm.payment_option === 'lunas' ? 'Lunas' : `DP ${orderForm.dp_percent || 50}%`})`}</span>
                                    {isSubmittingOrder && submittingAction === 'pengerjaan' ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                                    ) : (
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </form>
            </div>

            {/* MODAL PICKER KACA SISA POTONGAN */}
            {showScrapPickerModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-60 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
                    <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto text-slate-800">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
                                    <Scissors className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-[#242222] text-sm sm:text-base">Pilih Kaca Sisa Potongan di Rak Storage</h3>
                                    <p className="text-slate-500 text-xs">Pilih kaca sisa yang tersedia untuk digunakan sebagai jenis kaca pesanan ini.</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowScrapPickerModal(false)}
                                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* SEARCH INPUT */}
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                value={scrapPickerSearch}
                                onChange={e => setScrapPickerSearch(e.target.value)}
                                placeholder="Cari kode sisa (SCRAP-...), jenis kaca, ukuran cm, rak storage..."
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl pl-9 pr-8 py-2.5 focus:bg-white focus:border-[#1b68b0] focus:ring-2 focus:ring-[#1b68b0]/15 shadow-xs font-medium"
                            />
                            {scrapPickerSearch && (
                                <button
                                    type="button"
                                    onClick={() => setScrapPickerSearch('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full cursor-pointer"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* LIST OF SCRAP GLASSES */}
                        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                            {(() => {
                                const filtered = (initialScrap || []).filter(s => {
                                    if (!scrapPickerSearch.trim()) return true;
                                    const q = scrapPickerSearch.toLowerCase().trim();
                                    return (
                                        (s.scrap_code || '').toLowerCase().includes(q) ||
                                        (s.glass_type || '').toLowerCase().includes(q) ||
                                        (s.rak_location || '').toLowerCase().includes(q) ||
                                        (s.status || '').toLowerCase().includes(q) ||
                                        `${s.length_cm || ''} x ${s.width_cm || ''}`.toLowerCase().includes(q) ||
                                        `${s.length_cm || ''}`.includes(q) ||
                                        `${s.width_cm || ''}`.includes(q)
                                    );
                                });

                                if (filtered.length === 0) {
                                    return (
                                        <div className="p-8 text-center text-slate-400 text-xs italic bg-slate-50 rounded-2xl border border-slate-200">
                                            Tidak ada data kaca sisa potongan yang cocok.
                                        </div>
                                    );
                                }

                                return filtered.map((s) => {
                                    const isAlreadySelected = orderForm.used_scrap_rak && orderForm.used_scrap_rak.includes(s.scrap_code);
                                    const isSelected = isAlreadySelected || selectedScrapId === s.id;
                                    
                                    return (
                                        <div
                                            key={s.id}
                                            className={`p-3 bg-white border rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all duration-300 shadow-xs ${
                                                isSelected 
                                                    ? 'border-emerald-500 bg-emerald-50/50 scale-[1.02] shadow-md ring-2 ring-emerald-500/20 z-10 relative' 
                                                    : 'border-slate-200 hover:border-purple-300 hover:bg-purple-50/40'
                                            }`}
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-mono font-extrabold text-[#1b68b0] text-xs">{s.scrap_code}</span>
                                                    <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-purple-200">
                                                        {s.rak_location}
                                                    </span>
                                                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                                        {s.status || 'Layak Pakai'}
                                                    </span>
                                                </div>
                                                <div className="font-bold text-slate-800 text-xs">{s.glass_type}</div>
                                                <div className="font-mono text-slate-500 text-[11px]">
                                                    Ukuran: <strong>{s.length_cm} x {s.width_cm} cm</strong>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (isAlreadySelected) {
                                                        setOrderForm(prev => {
                                                            const current = prev.used_scrap_rak ? prev.used_scrap_rak.trim() : '';
                                                            const entries = current.split('), ').map(e => e.endsWith(')') ? e : e + ')');
                                                            const filtered = entries.filter(e => !e.includes(s.scrap_code));
                                                            return { ...prev, used_scrap_rak: filtered.join(', ') };
                                                        });
                                                    } else {
                                                        setSelectedScrapId(s.id);
                                                        setTimeout(() => {
                                                            const scrapEntry = `${s.scrap_code} (${s.rak_location}, ${s.length_cm}x${s.width_cm}cm = 1 lbr)`;
                                                            setOrderForm(prev => {
                                                                const current = prev.used_scrap_rak ? prev.used_scrap_rak.trim() : '';
                                                                if (!current.includes(s.scrap_code)) {
                                                                    const updated = current ? `${current}, ${scrapEntry}` : scrapEntry;
                                                                    return { ...prev, used_scrap_rak: updated };
                                                                }
                                                                return prev;
                                                            });

                                                            const targetGroup = orderForm.glass_groups?.find(g => g.group_id === targetScrapGroupId);
                                                            if (targetScrapGroupId !== null && (!targetGroup || !targetGroup.glass_type)) {
                                                                handleGroupGlassTypeChange(targetScrapGroupId, s.glass_type);
                                                            }
                                                            
                                                            setSelectedScrapId(null);
                                                        }, 200);
                                                    }
                                                }}
                                                className={`font-bold px-3.5 py-1.5 rounded-xl text-xs transition-all duration-300 shadow-xs cursor-pointer whitespace-nowrap self-end sm:self-center flex items-center justify-center gap-1.5 ${
                                                    isSelected
                                                        ? 'bg-emerald-500 hover:bg-rose-500 hover:ring-rose-500/30 text-white scale-105 ring-2 ring-emerald-500/30 group'
                                                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                                                }`}
                                            >
                                                {isSelected ? (
                                                    <>
                                                        <CheckCircle2 className="w-4 h-4 animate-in zoom-in group-hover:hidden" />
                                                        <X className="w-4 h-4 hidden group-hover:block" />
                                                        <span className="group-hover:hidden">Terpilih!</span>
                                                        <span className="hidden group-hover:inline">Batal</span>
                                                    </>
                                                ) : (
                                                    "Pilih Kaca Sisa Ini"
                                                )}
                                            </button>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
