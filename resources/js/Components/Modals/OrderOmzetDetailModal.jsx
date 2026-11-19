import React from 'react';
import {
    X,
    Eye,
    TrendingUp,
    Package,
    Calendar,
    User,
    Phone,
    MapPin,
    CreditCard,
    DollarSign,
    Layers,
    Tag,
    Printer,
    CheckCircle2
} from 'lucide-react';

export default function OrderOmzetDetailModal({
    show = false,
    isOpen = false,
    onClose,
    order = null,
}) {
    const isVisible = Boolean(show || isOpen) && Boolean(order);

    if (!isVisible || !order) return null;

    const pInfo = order.profitInfo || {
        revenue: Number(order.total_price || 0),
        modalCost: 0,
        processFee: 0,
        profit: Number(order.total_price || 0),
        marginPct: '0.0',
    };

    const items = Array.isArray(order.items) && order.items.length > 0
        ? order.items
        : [{
            glass_type: order.glass_type || 'Kaca',
            length_cm: order.length_cm || 0,
            width_cm: order.width_cm || 0,
            thickness_mm: order.thickness_mm || 5,
            qty: order.qty || 1,
            position_code: order.position_code || '',
            processes: order.processes || '',
            subtotal: order.total_price || 0,
            fee_gm: order.fee_gm || 0,
            fee_ht: order.fee_ht || 0,
            fee_bv: order.fee_bv || 0,
            fee_bor: order.fee_bor || 0,
            fee_etsa: order.fee_etsa || 0,
        }];

    const accessories = Array.isArray(order.accessories) ? order.accessories : [];

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl p-5 sm:p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto text-slate-800">
                
                {/* HEADER MODAL */}
                <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#1b68b0]/10 flex items-center justify-center text-[#1b68b0] shrink-0">
                            <Eye className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-lg font-black text-[#242222]">
                                    Detail Rincian Order & Omzet
                                </h3>
                                <span className="bg-blue-50 text-[#1b68b0] border border-blue-200 px-2.5 py-0.5 rounded-full text-xs font-mono font-black">
                                    {order.spo_number}
                                </span>
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Selesai (Masuk Omzet)</span>
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Rincian lengkap finansial orderan, estimasi modal bahan, dan kalkulasi laba bersih penjualan
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                        title="Tutup"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* HIGHLIGHT KARTU FINANSIAL OMZET */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* NILAI OMZET */}
                    <div className="bg-blue-50/40 border border-blue-100 rounded-2xl p-3.5 space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-500 uppercase">Nilai Omzet (Gross)</span>
                            <DollarSign className="w-4 h-4 text-[#1b68b0]" />
                        </div>
                        <div className="text-lg font-black text-[#1b68b0] font-mono">
                            Rp {Number(pInfo.revenue || 0).toLocaleString('id-ID')}
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold block">
                            Total harga jual order
                        </span>
                    </div>

                    {/* MODAL BAHAN & AKSESORIS */}
                    <div className="bg-amber-50/40 border border-amber-100 rounded-2xl p-3.5 space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-500 uppercase">Estimasi Modal</span>
                            <Package className="w-4 h-4 text-amber-600" />
                        </div>
                        <div className="text-lg font-black text-amber-700 font-mono">
                            Rp {Number(pInfo.modalCost || 0).toLocaleString('id-ID')}
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold block">
                            Biaya bahan kaca & aksesoris
                        </span>
                    </div>

                    {/* KEUNTUNGAN ORDER */}
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-3.5 space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-500 uppercase">Keuntungan Bersih</span>
                            <TrendingUp className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="text-lg font-black text-emerald-700 font-mono">
                            + Rp {Number(pInfo.profit || 0).toLocaleString('id-ID')}
                        </div>
                        <span className="text-[10px] text-emerald-600 font-semibold block">
                            Omzet dikurangi modal bahan
                        </span>
                    </div>

                    {/* MARGIN KEUNTUNGAN */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-500 uppercase">Margin Laba</span>
                            <span className="text-xs font-mono font-bold text-slate-500">%</span>
                        </div>
                        <div className="text-lg font-black text-slate-800 font-mono flex items-center gap-1.5">
                            <span>{pInfo.marginPct}%</span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-sans font-bold">
                                NET
                            </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold block">
                            Rasio profitabilitas order
                        </span>
                    </div>
                </div>

                {/* INFORMASI PELANGGAN & PENGIRIMAN */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                        <User className="w-4 h-4 text-[#1b68b0]" />
                        <span>Informasi Pelanggan & Transaksi</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div className="bg-white p-3 rounded-xl border border-slate-200">
                            <span className="text-slate-400 text-[11px] block">Nama Pelanggan:</span>
                            <span className="font-bold text-[#242222] text-sm block mt-0.5">
                                {order.customer_name || '-'}
                            </span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-200">
                            <span className="text-slate-400 text-[11px] block">No. Telepon / WA:</span>
                            <span className="font-bold text-slate-700 flex items-center gap-1.5 mt-0.5">
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                {order.customer_phone || '-'}
                            </span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-200">
                            <span className="text-slate-400 text-[11px] block">Tanggal Selesai / Kirim:</span>
                            <span className="font-bold text-slate-700 flex items-center gap-1.5 mt-0.5">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                {order.orderDateFormatted || order.delivered_at || order.order_date || '-'}
                            </span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-200">
                            <span className="text-slate-400 text-[11px] block">Status Pembayaran:</span>
                            <div className="mt-0.5 flex items-center gap-1.5">
                                <CreditCard className="w-3.5 h-3.5 text-[#1b68b0]" />
                                <span className={`font-bold uppercase text-xs ${
                                    String(order.payment_status).toLowerCase().includes('lunas')
                                        ? 'text-emerald-700'
                                        : 'text-amber-600'
                                }`}>
                                    {order.payment_status || 'Lunas'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {order.customer_address && (
                        <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <div>
                                <span className="text-slate-400 text-[11px] block">Alamat Pengiriman:</span>
                                <span className="font-semibold text-slate-700">{order.customer_address}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* TABEL RINCIAN SPESIFIKASI KACA & PROSES */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                            <Layers className="w-4 h-4 text-[#1b68b0]" />
                            <span>Rincian Spesifikasi Kaca & Jasa Proses ({items.length} Item)</span>
                        </h4>
                        <span className="text-[11px] text-slate-400">
                            Termasuk Kode Posisi / Ruangan Penempatan Kaca
                        </span>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-slate-50 text-slate-500 font-mono font-bold uppercase border-b border-slate-200 text-[10px]">
                                <tr>
                                    <th className="py-2.5 px-3 text-center w-10">No</th>
                                    <th className="py-2.5 px-3">Jenis Kaca</th>
                                    <th className="py-2.5 px-3 text-center">Ukuran (P x L)</th>
                                    <th className="py-2.5 px-3 text-center">Luas (m²)</th>
                                    <th className="py-2.5 px-3 text-center">Qty</th>
                                    <th className="py-2.5 px-3">Kode Posisi / Ruangan</th>
                                    <th className="py-2.5 px-3">Proses Tambahan</th>
                                    <th className="py-2.5 px-3 text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                                {items.map((it, idx) => {
                                    const lengthCm = Number(it.length_cm || 0);
                                    const widthCm = Number(it.width_cm || 0);
                                    const qty = Number(it.qty || 1);
                                    const areaSingleM2 = ((lengthCm * widthCm) / 10000);
                                    const areaTotalM2 = (areaSingleM2 * qty).toFixed(2);

                                    // Kumpulkan rincian proses
                                    const procList = [];
                                    if (Number(it.fee_gm) > 0) procList.push(`Gosok Mesin (Rp ${Number(it.fee_gm).toLocaleString('id-ID')})`);
                                    if (Number(it.fee_bv) > 0) procList.push(`Bevel (Rp ${Number(it.fee_bv).toLocaleString('id-ID')})`);
                                    if (Number(it.fee_ht) > 0) procList.push(`Tempering (Rp ${Number(it.fee_ht).toLocaleString('id-ID')})`);
                                    if (Number(it.fee_bor) > 0) procList.push(`Bor / Lubang (Rp ${Number(it.fee_bor).toLocaleString('id-ID')})`);
                                    if (Number(it.fee_etsa) > 0) procList.push(`Etsa / Sandblast (Rp ${Number(it.fee_etsa).toLocaleString('id-ID')})`);
                                    if (procList.length === 0 && it.processes) {
                                        procList.push(String(it.processes));
                                    }

                                    return (
                                        <tr key={idx} className="hover:bg-slate-50 transition">
                                            <td className="py-2.5 px-3 text-center font-bold text-slate-400">
                                                {idx + 1}
                                            </td>
                                            <td className="py-2.5 px-3 font-sans font-bold text-slate-800">
                                                <div>{it.glass_type}</div>
                                                {it.thickness_mm && (
                                                    <span className="text-[10px] text-slate-400 font-normal">
                                                        Tebal: {it.thickness_mm} mm
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-2.5 px-3 text-center whitespace-nowrap font-bold text-slate-700">
                                                {lengthCm} × {widthCm} cm
                                            </td>
                                            <td className="py-2.5 px-3 text-center text-slate-500">
                                                {areaTotalM2} m²
                                            </td>
                                            <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                                                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                                                    {qty} lbr
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-3 font-sans">
                                                {it.position_code ? (
                                                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-lg font-mono font-bold text-[10px]">
                                                        <Tag className="w-3 h-3 text-amber-600" />
                                                        <span>{it.position_code}</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 italic text-[10px]">-</span>
                                                )}
                                            </td>
                                            <td className="py-2.5 px-3 font-sans text-slate-600 max-w-xs">
                                                {procList.length > 0 ? (
                                                    <div className="space-y-0.5">
                                                        {procList.map((p, pIdx) => (
                                                            <div key={pIdx} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded inline-block mr-1">
                                                                {p}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 text-[10px]">Standar Potong</span>
                                                )}
                                            </td>
                                            <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                                                {Number(it.subtotal || 0) > 0 ? (
                                                    `Rp ${Number(it.subtotal).toLocaleString('id-ID')}`
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* TABEL AKSESORIS (JIKA ADA) */}
                {accessories.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                            <Package className="w-4 h-4 text-emerald-600" />
                            <span>Aksesoris & Perlengkapan Terpasang ({accessories.length})</span>
                        </h4>
                        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-slate-50 text-slate-500 font-mono font-bold uppercase border-b border-slate-200 text-[10px]">
                                    <tr>
                                        <th className="py-2.5 px-3 text-center w-10">No</th>
                                        <th className="py-2.5 px-3">Nama Aksesoris</th>
                                        <th className="py-2.5 px-3 text-center">Jumlah (Qty)</th>
                                        <th className="py-2.5 px-3 text-right">Harga Satuan</th>
                                        <th className="py-2.5 px-3 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                                    {accessories.map((acc, aIdx) => {
                                        const aQty = Number(acc.qty || 1);
                                        const aPrice = Number(acc.price || 0);
                                        const aSubtotal = aQty * aPrice;
                                        return (
                                            <tr key={aIdx} className="hover:bg-slate-50 transition">
                                                <td className="py-2.5 px-3 text-center font-bold text-slate-400">
                                                    {aIdx + 1}
                                                </td>
                                                <td className="py-2.5 px-3 font-sans font-bold text-slate-800">
                                                    {acc.name || acc.item_name || 'Aksesoris'}
                                                </td>
                                                <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                                                    {aQty} unit/set
                                                </td>
                                                <td className="py-2.5 px-3 text-right text-slate-600">
                                                    Rp {aPrice.toLocaleString('id-ID')}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                                                    Rp {aSubtotal.toLocaleString('id-ID')}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* CATATAN TAMBAHAN ORDER */}
                {order.notes && (
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
                        <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                            Catatan Khusus Order:
                        </span>
                        <p className="text-slate-700 italic font-sans whitespace-pre-line">
                            {order.notes}
                        </p>
                    </div>
                )}

                {/* FOOTER TOMBOL AKSI */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200 flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={handlePrint}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                    >
                        <Printer className="w-4 h-4 text-[#1b68b0]" />
                        <span>Cetak Rincian SPO</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2 bg-[#1b68b0] hover:bg-[#15528c] text-white rounded-xl font-bold text-xs transition cursor-pointer shadow-sm"
                        >
                            Tutup Rincian
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

