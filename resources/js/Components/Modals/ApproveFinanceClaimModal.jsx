import React, { useState, useEffect } from 'react';
import { CheckCircle2, X, Camera, FileText, CreditCard, Store, AlertTriangle, Package, MessageSquare } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function ApproveFinanceClaimModal({
    isOpen,
    onClose,
    claim
}) {
    const [receiptFile, setReceiptFile] = useState(null);
    const [receiptPreview, setReceiptPreview] = useState(null);
    const [amount, setAmount] = useState('');
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [supplierName, setSupplierName] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Transfer Bank BCA');
    const [notes, setNotes] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmedRestockQty, setConfirmedRestockQty] = useState(10);

    useEffect(() => {
        if (claim && isOpen) {
            setReceiptFile(null);
            setReceiptPreview(null);
            setAmount(claim.amount ?? '');
            setInvoiceNumber(claim.invoice_number || '');
            setSupplierName(claim.supplier_name || '');
            setPaymentMethod(
                claim.payment_method && claim.payment_method !== 'Menunggu Realisasi Finance'
                    ? claim.payment_method
                    : 'Transfer Bank BCA'
            );
            setNotes('');
            setErrorMsg('');
            setIsSubmitting(false);
            const m = String(claim.notes || '').match(/\[RESTOCK_(?:ACC|GLASS|SUPPLY|TOOL)_ID:(\d+)\|QTY:(\d+)/);
            setConfirmedRestockQty(m ? parseInt(m[2], 10) : 10);
        }
    }, [claim, isOpen]);

    if (!isOpen || !claim) return null;

    const getExistingPhotoList = (pathStr) => {
        if (!pathStr) return [];
        if (typeof pathStr === 'string' && pathStr.trim().startsWith('[')) {
            try {
                return JSON.parse(pathStr);
            } catch {
                return [pathStr];
            }
        }
        return [pathStr];
    };
    const driverStrukList = getExistingPhotoList(claim.receipt_photo_path);

    const isRestockRequest = claim.type === 'pembelian_aksesoris'
        || claim.type === 'pembelian_bahan'
        || claim.type === 'pembelian_alat'
        || String(claim.notes || '').includes('[RESTOCK_')
        || String(claim.title || '').toLowerCase().includes('restok')
        || String(claim.title || '').toLowerCase().includes('pengajuan');

    // Parse restock info if present in notes
    let parsedRestockQty = null;
    let parsedAccCode = null;
    let parsedSupplierPhone = null;
    const match = String(claim.notes || '').match(/\[RESTOCK_(?:ACC|GLASS|SUPPLY|TOOL)_ID:(\d+)\|QTY:(\d+)(?:\|REQ_ID:\d+)?(?:\|CODE:([^\]|]+))?(?:\|PHONE:([^\]]*))?\]/);
    if (match) {
        parsedRestockQty = parseInt(match[2], 10);
        parsedAccCode = match[3] || null;
        parsedSupplierPhone = match[4] || null;
    }

    const cleanDisplayNotes = String(claim.notes || '').replace(/\[RESTOCK_[^\]]+\]\s*/g, '');

    const handleOrderViaWhatsApp = () => {
        const cleanPhone = (parsedSupplierPhone || '').replace(/\D/g, '');
        const waMsg = `Halo ${supplierName || claim.supplier_name || 'Mitra Supplier'},%0A%0AKami dari bagian Finance & Purchasing CV Cahya Karunia Jaya (SYP Glass).%0AKami ingin memesan barang sesuai pengajuan produksi berikut:%0A%0A• No. PO: ${claim.transaction_code}%0A• Rincian: ${claim.title}%0A• Estimasi Nilai: Rp ${Number(amount || claim.amount || 0).toLocaleString('id-ID')}%0A%0AMohon konfirmasi ketersediaan stok dan nomor rekening / faktur tagihan. Terima kasih!`;
        const url = cleanPhone
            ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${waMsg}`
            : `https://api.whatsapp.com/send?text=${waMsg}`;
        window.open(url, '_blank');
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setReceiptFile(file);
            setReceiptPreview(URL.createObjectURL(file));
            setErrorMsg('');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!receiptFile) {
            setErrorMsg(
                isRestockRequest
                    ? 'Wajib mengunggah foto Nota / Bukti Transfer Pembayaran terlebih dahulu sebelum menyetujui pengajuan restok!'
                    : 'Wajib mengunggah foto Bukti Transfer / Pencairan Kas Finance terlebih dahulu sebelum menyetujui klaim ini!'
            );
            return;
        }

        setIsSubmitting(true);
        setErrorMsg('');

        // Jika ini item langsung dari katalog (is_direct_catalog_item), simpan via finance.transactions.store beserta tag RESTOCK_
        if (claim.is_direct_catalog_item) {
            const updatedTagNotes = String(claim.notes || '').replace(
                /\|QTY:\d+/,
                `|QTY:${Math.max(1, parseInt(confirmedRestockQty) || 10)}`
            );
            const finalTitle = String(claim.title || '').replace(
                /\(\+\d+\s/,
                `(+${Math.max(1, parseInt(confirmedRestockQty) || 10)} `
            );

            router.post(route('finance.transactions.store'), {
                type: claim.type || 'pembelian_bahan',
                category: claim.category || 'Bahan Baku Kaca Lembaran',
                title: finalTitle,
                amount: parseFloat(amount) || 0,
                supplier_name: supplierName || claim.supplier_name || 'Mitra Supplier',
                invoice_number: invoiceNumber || null,
                payment_method: paymentMethod || 'Transfer Bank BCA',
                payment_status: 'Lunas',
                approval_status: 'approved',
                transaction_date: new Date().toISOString().split('T')[0],
                notes: `${updatedTagNotes}${notes ? ' | Catatan Finance: ' + notes : ''}`,
                receipt_photo: receiptFile,
            }, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    setIsSubmitting(false);
                    onClose();
                },
                onError: (errors) => {
                    setIsSubmitting(false);
                    if (errors?.receipt_photo) {
                        setErrorMsg(errors.receipt_photo);
                    } else {
                        setErrorMsg('Gagal menyimpan nota pembayaran. Pastikan file foto bukti pembayaran valid.');
                    }
                }
            });
            return;
        }

        router.post(route('finance.transactions.approve', claim.id), {
            receipt_photo: receiptFile,
            restock_qty: parsedRestockQty ? (parseInt(confirmedRestockQty) || parsedRestockQty) : null,
            amount: parseFloat(amount) || 0,
            invoice_number: invoiceNumber || null,
            supplier_name: supplierName || null,
            payment_method: paymentMethod || 'Transfer Bank BCA',
            notes: notes || null,
        }, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
                onClose();
            },
            onError: (errors) => {
                setIsSubmitting(false);
                if (errors?.receipt_photo) {
                    setErrorMsg(errors.receipt_photo);
                } else {
                    setErrorMsg('Gagal menyetujui transaksi. Pastikan file nota bukti pembayaran valid.');
                }
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-800">
                {/* HEADER MODAL */}
                <div className="flex justify-between items-center border-b border-slate-200 pb-3.5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-[#1b68b0]/10 flex items-center justify-center text-[#1b68b0]">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#242222] text-base">
                                {isRestockRequest ? 'Setujui Restok & Input Nota Pembayaran' : 'Setujui Klaim & Bukti Pencairan Kas'}
                            </h3>
                            <p className="text-xs text-slate-500">
                                {isRestockRequest
                                    ? 'Upload nota bukti pembayaran agar stok barang otomatis bertambah'
                                    : 'Verifikasi realisasi pembayaran dan lampirkan bukti kas keluar'}
                            </p>
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

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    {/* RINGKASAN PENGAJUAN */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="font-mono text-[11px] font-bold text-[#1b68b0] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                                {claim.transaction_code}
                            </span>
                            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                                {claim.source_role === 'driver' ? 'Pengajuan Supir' : 'Pengajuan Admin Toko'}
                            </span>
                        </div>
                        <div className="font-bold text-[#242222] text-sm pt-1 flex items-center gap-2">
                            <Package className="w-4 h-4 text-[#1b68b0] shrink-0" />
                            <span>{claim.title}</span>
                        </div>
                        {parsedRestockQty && (
                            <div className="flex items-center justify-between bg-emerald-50/80 border border-emerald-200 rounded-xl px-3 py-2 text-emerald-800 font-bold gap-2">
                                <span>Jumlah Unit Dipesan / Direstok (+):</span>
                                <div className="flex items-center gap-1.5">
                                    <input
                                        type="number"
                                        min="1"
                                        value={confirmedRestockQty}
                                        onChange={e => {
                                            const newQ = Math.max(1, parseInt(e.target.value) || 1);
                                            setConfirmedRestockQty(newQ);
                                            if (claim.unit_buy_price && Number(claim.unit_buy_price) > 0) {
                                                setAmount(newQ * Number(claim.unit_buy_price));
                                            }
                                        }}
                                        className="w-20 bg-white border border-emerald-300 rounded-lg px-2 py-1 text-center font-mono text-xs font-extrabold text-emerald-900 focus:border-[#1b68b0] focus:outline-none"
                                    />
                                    <span className="font-mono text-xs">
                                        Unit {parsedAccCode ? `(${parsedAccCode})` : ''}
                                    </span>
                                </div>
                            </div>
                        )}
                        {cleanDisplayNotes && (
                            <p className="text-[11px] text-slate-600 italic bg-white p-2.5 rounded-xl border border-slate-200">
                                "{cleanDisplayNotes}"
                            </p>
                        )}
                        {driverStrukList.length > 0 && (
                            <div className="pt-1 space-y-1.5">
                                <span className="text-[10px] font-bold text-slate-500 block">
                                    Lampiran Struk Pengajuan Awal (Dari {claim.source_role === 'driver' ? 'Supir' : 'Pemohon'}):
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {driverStrukList.map((p, idx) => {
                                        const imgUrl = p.startsWith('http') || p.startsWith('/') ? p : `/storage/${p}`;
                                        return (
                                            <a
                                                key={idx}
                                                href={imgUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="block border border-slate-200 rounded-xl overflow-hidden bg-white p-1 hover:border-[#1b68b0] transition"
                                                title="Klik untuk melihat foto struk dari pemohon"
                                            >
                                                <img src={imgUrl} alt={`Struk ${idx + 1}`} className="h-14 w-auto object-contain rounded" />
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        {isRestockRequest && (
                            <div className="pt-1 flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleOrderViaWhatsApp}
                                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold px-3 py-1.5 rounded-xl text-[11px] flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                                    title="Pesan barang ini ke Supplier via WhatsApp"
                                >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    <span>Pesan Barang ke Supplier via WhatsApp</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* UPLOAD NOTA / BUKTI TRANSFER PEMBAYARAN FINANCE (WAJIB) */}
                    <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-4 space-y-2.5">
                        <div className="flex items-center justify-between">
                            <label className="text-slate-800 font-bold flex items-center gap-1.5">
                                <Camera className="w-4 h-4 text-[#1b68b0]" />
                                <span>
                                    {isRestockRequest
                                        ? 'Upload Nota / Bukti Transfer Pembayaran'
                                        : 'Upload Bukti Transfer / Pencairan Kas Finance'}{' '}
                                    <span className="text-rose-500">*</span>
                                </span>
                            </label>
                            <span className="text-[10px] font-bold bg-[#1b68b0] text-white px-2 py-0.5 rounded-full">
                                WAJIB BUKTI TRANSFER
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                            {isRestockRequest
                                ? 'Wajib unggah foto bukti transfer bank atau nota pembayaran pembelian barang ke supplier dari bagian Finance (JPG, PNG, WEBP maks 5 MB).'
                                : 'Wajib unggah foto bukti transfer bank / bukti pencairan uang kas dari bagian Finance kepada pemohon klaim (JPG, PNG, WEBP maks 5 MB).'}
                        </p>
                        <input
                            type="file"
                            accept="image/*"
                            required
                            onChange={handleFileChange}
                            className="w-full text-xs text-slate-700 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#1b68b0] file:text-white hover:file:bg-[#15528c] file:cursor-pointer bg-white border border-slate-200 rounded-xl p-1.5"
                        />
                        {receiptPreview && (
                            <div className="mt-2 relative rounded-xl overflow-hidden border border-slate-200 bg-white p-2">
                                <span className="text-[10px] font-bold text-emerald-700 block mb-1">
                                    Pratinjau Bukti Transfer / Nota Pembayaran Finance:
                                </span>
                                <img
                                    src={receiptPreview}
                                    alt="Preview Bukti Transfer Finance"
                                    className="max-h-44 w-auto mx-auto rounded-lg object-contain"
                                />
                            </div>
                        )}
                    </div>

                    {/* DETAIL REALISASI PEMBAYARAN */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="text-slate-700 block mb-1 font-bold">
                                Total Realisasi Bayar (Rp) <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                required
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm text-slate-800 font-mono font-bold focus:border-[#1b68b0] focus:bg-white focus:outline-none"
                                placeholder="0"
                            />
                        </div>

                        <div>
                            <label className="text-slate-700 block mb-1 font-bold flex items-center gap-1">
                                <CreditCard className="w-3.5 h-3.5 text-[#1b68b0]" />
                                <span>Metode Pembayaran</span>
                            </label>
                            <select
                                value={paymentMethod}
                                onChange={e => setPaymentMethod(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:border-[#1b68b0] focus:bg-white focus:outline-none cursor-pointer"
                            >
                                <option value="Transfer Bank BCA">Transfer Bank BCA</option>
                                <option value="Transfer Bank Mandiri">Transfer Bank Mandiri</option>
                                <option value="QRIS / E-Wallet">QRIS / E-Wallet</option>
                                <option value="Kas Tunai Operasional">Kas Tunai Operasional</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="text-slate-700 block mb-1 font-bold flex items-center gap-1">
                                <FileText className="w-3.5 h-3.5 text-[#1b68b0]" />
                                <span>Nomor Nota / Faktur</span>
                            </label>
                            <input
                                type="text"
                                value={invoiceNumber}
                                onChange={e => setInvoiceNumber(e.target.value)}
                                placeholder="Contoh: INV/2026/11/089"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-mono focus:border-[#1b68b0] focus:bg-white focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-slate-700 block mb-1 font-bold flex items-center gap-1">
                                <Store className="w-3.5 h-3.5 text-[#1b68b0]" />
                                <span>Nama Toko / Supplier</span>
                            </label>
                            <input
                                type="text"
                                value={supplierName}
                                onChange={e => setSupplierName(e.target.value)}
                                placeholder="Nama toko / vendor"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:border-[#1b68b0] focus:bg-white focus:outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-slate-700 block mb-1 font-bold">Catatan Verifikasi Finance (Opsional)</label>
                        <input
                            type="text"
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Contoh: Lunas via transfer BCA, barang sudah diterima gudang"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:border-[#1b68b0] focus:bg-white focus:outline-none"
                        />
                    </div>

                    {errorMsg && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3 text-xs font-bold flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

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
                            className="bg-[#70b03c] hover:bg-[#5f9733] text-white font-bold px-5 py-2.5 rounded-xl transition shadow-xs flex items-center gap-1.5 text-xs cursor-pointer disabled:opacity-50"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>
                                {isSubmitting
                                    ? 'Menyimpan & Menyetujui...'
                                    : isRestockRequest
                                        ? 'Setujui Restok & Simpan Nota'
                                        : 'Setujui & Cairkan Kas'}
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

