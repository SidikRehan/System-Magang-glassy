import React, { useState } from 'react';
import { Printer, Tag, X } from 'lucide-react';

export default function WaybillModal({
    show,
    onClose,
    selectedWaybillOrder,
    order,
    selectedOrder,
    userName,
    onOpenStickerModal
}) {
    const waybillOrder = selectedWaybillOrder || order || selectedOrder;

    if (!show || !waybillOrder) return null;

    const [activeColor, setActiveColor] = useState(waybillOrder.waybill_color || 'Putih');

    const colorConfig = {
        Putih: {
            title: 'LEMBAR PUTIH — KONSUMEN (LUNAS)',
            bgColor: 'bg-white text-slate-900 border-slate-300',
            headerBg: 'bg-slate-900 text-white',
            badgeBg: 'bg-slate-900 text-white',
            borderTop: 'border-t-8 border-t-slate-800'
        },
        Merah: {
            title: 'LEMBAR MERAH — TAGIHAN COD DRIVER / SUPIR',
            bgColor: 'bg-rose-50/70 text-slate-900 border-rose-300',
            headerBg: 'bg-rose-700 text-white',
            badgeBg: 'bg-rose-700 text-white',
            borderTop: 'border-t-8 border-t-rose-600'
        },
        Kuning: {
            title: 'LEMBAR KUNING — PABRIK & ARSIP GUDANG',
            bgColor: 'bg-amber-50/70 text-slate-900 border-amber-300',
            headerBg: 'bg-amber-600 text-white',
            badgeBg: 'bg-amber-600 text-white',
            borderTop: 'border-t-8 border-t-amber-500'
        },
        Hijau: {
            title: 'LEMBAR HIJAU — KEUANGAN & AKUNTANSI TOKO',
            bgColor: 'bg-emerald-50/70 text-slate-900 border-emerald-300',
            headerBg: 'bg-emerald-700 text-white',
            badgeBg: 'bg-emerald-700 text-white',
            borderTop: 'border-t-8 border-t-emerald-600'
        }
    };

    const currentConfig = colorConfig[activeColor] || colorConfig.Putih;
    const isLunas = waybillOrder.payment_status === 'Lunas';
    const itemsList = Array.isArray(waybillOrder.items) && waybillOrder.items.length > 0
        ? waybillOrder.items
        : [{
            glass_type: waybillOrder.glass_type || 'Kaca Cermin 5 mm polos',
            length_cm: waybillOrder.length_cm || 150,
            width_cm: waybillOrder.width_cm || 120,
            thickness_mm: waybillOrder.thickness_mm || 5,
            qty: waybillOrder.qty || 1
        }];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
            <style>{`
                @media print {
                    body * {
                        visibility: hidden !important;
                    }
                    #printable-waybill, #printable-waybill * {
                        visibility: visible !important;
                    }
                    #printable-waybill {
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 15px !important;
                        box-shadow: none !important;
                        background-color: #fff !important;
                        color: #000 !important;
                        border: 2px solid #000 !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto no-print-wrapper text-slate-800">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3.5 no-print">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-[#1b68b0]/10 flex items-center justify-center text-[#1b68b0]">
                            <Printer className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-base">
                                Dokumen Resmi Surat Jalan (4 Warna)
                            </h3>
                            <p className="text-xs text-slate-500 font-mono">SPO: {waybillOrder.spo_number || waybillOrder.id}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {onOpenStickerModal && (
                            <button
                                type="button"
                                onClick={() => onOpenStickerModal(waybillOrder)}
                                className="bg-[#1b68b0]/10 hover:bg-[#1b68b0]/20 text-[#1b68b0] border border-[#1b68b0]/30 px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                                title="Cetak Stiker Label Orderan Kaca untuk Admin Gudang & Divisi"
                            >
                                <Tag className="w-3.5 h-3.5" />
                                <span>Cetak Stiker Label</span>
                            </button>
                        )}
                        <button 
                            onClick={onClose} 
                            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl p-1.5 transition cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* PILIHAN WARNA SURAT JALAN */}
                <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 no-print">
                    <span className="text-xs text-slate-700 font-bold">Pilih Lembar Warna Surat Jalan:</span>
                    <div className="flex flex-wrap gap-2">
                        {['Putih', 'Merah', 'Kuning', 'Hijau'].map(c => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setActiveColor(c)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                                    activeColor === c
                                        ? c === 'Merah' ? 'bg-rose-50 text-rose-800 border-rose-300 ring-2 ring-rose-500/20 shadow-xs'
                                        : c === 'Kuning' ? 'bg-amber-50 text-amber-900 border-amber-300 ring-2 ring-amber-500/20 shadow-xs'
                                        : c === 'Hijau' ? 'bg-emerald-50 text-emerald-900 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                                        : 'bg-white text-slate-900 border-slate-300 ring-2 ring-[#1b68b0]/20 shadow-xs'
                                        : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                Lembar {c}
                            </button>
                        ))}
                    </div>
                </div>

                {/* PRINTABLE DOKUMEN CONTAINER */}
                <div id="printable-waybill" className={`p-6 rounded-2xl space-y-4 font-sans border shadow-xs ${currentConfig.bgColor} ${currentConfig.borderTop}`}>
                    {/* HEADER KOP DOKUMEN */}
                    <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3">
                        <div>
                            <h2 className="font-black text-lg tracking-wider text-slate-950">CV CAHYA KARUNIA JAYA</h2>
                            <p className="text-xs font-semibold text-slate-700">SYP GLASS OPERATIONAL - SURAT JALAN PENGIRIMAN ARMADA</p>
                            <p className="text-[11px] text-slate-600">Jl. Raya Industri Kaca No. 88, Bandung | Telp/WA: 0812-3456-7890</p>
                        </div>
                        <div className="text-right">
                            <span className={`${currentConfig.badgeBg} px-3 py-1 rounded-md text-xs font-bold tracking-widest inline-block uppercase mb-1`}>
                                SURAT JALAN ({activeColor.toUpperCase()})
                            </span>
                            <div className="text-xs font-mono font-bold">No: SJ-{waybillOrder.spo_number || waybillOrder.id}</div>
                            <div className="text-[11px] text-slate-700">Tgl Kirim: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                        </div>
                    </div>

                    <div className="text-center font-bold text-xs py-1.5 rounded-lg border border-slate-300 bg-white/70 uppercase tracking-wide">
                        {currentConfig.title}
                    </div>

                    {/* DETAIL TUJUAN & KONSUMEN */}
                    <div className="grid grid-cols-2 gap-4 text-xs bg-white/90 p-3.5 rounded-xl border border-slate-300">
                        <div className="space-y-1">
                            <div><strong>No. SPO:</strong> <span className="font-mono text-[#1b68b0] font-bold">{waybillOrder.spo_number || waybillOrder.id}</span></div>
                            <div><strong>Penerima / Customer:</strong> <span className="font-bold">{waybillOrder.customer_name}</span></div>
                            <div><strong>No. Telepon:</strong> {waybillOrder.customer_phone}</div>
                            <div><strong>Alamat Tujuan:</strong> {waybillOrder.customer_address || '-'}</div>
                        </div>
                        <div className="space-y-1 border-l border-slate-300 pl-3">
                            <div><strong>Pengirim:</strong> CV Cahya Karunia Jaya (SYP Glass)</div>
                            <div><strong>Driver / Supir:</strong> <span className="font-bold">{waybillOrder.assigned_driver || 'Pak Budi (Supir DC)'}</span></div>
                            <div><strong>Kendaraan / Plat:</strong> {waybillOrder.assigned_vehicle || 'Engkel Box (D 8472 AB)'}</div>
                            <div>
                                <strong>Status Pembayaran:</strong>{' '}
                                <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${isLunas ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'}`}>
                                    {waybillOrder.payment_status || 'DP 50%'} {activeColor === 'Merah' && !isLunas ? '— (WAJIB TAGIH COD)' : ''}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* TABEL RINCIAN KACA */}
                    <div>
                        <table className="w-full text-xs text-left border-collapse border border-slate-300 bg-white rounded-lg overflow-hidden">
                            <thead className="bg-slate-100 uppercase font-bold text-[11px] text-slate-700">
                                <tr>
                                    <th className="border border-slate-300 p-2 text-center">No</th>
                                    <th className="border border-slate-300 p-2">Spesifikasi Kaca & Jenis Pengerjaan</th>
                                    <th className="border border-slate-300 p-2 text-center">Ukuran (P x L)</th>
                                    <th className="border border-slate-300 p-2 text-center">Tebal</th>
                                    <th className="border border-slate-300 p-2 text-center">Qty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {itemsList.map((it, idx) => (
                                    <tr key={idx} className="border-b border-slate-200">
                                        <td className="border border-slate-300 p-2 text-center font-mono">{idx + 1}</td>
                                        <td className="border border-slate-300 p-2 font-bold">
                                            {it.glass_type}
                                            {Array.isArray(it.processes) && it.processes.length > 0 && (
                                                <div className="text-[10px] text-slate-600 font-normal">
                                                    Proses: {it.processes.join(', ')}
                                                </div>
                                            )}
                                        </td>
                                        <td className="border border-slate-300 p-2 text-center font-mono font-bold">{it.length_cm} x {it.width_cm} cm</td>
                                        <td className="border border-slate-300 p-2 text-center font-mono">{it.thickness_mm || 5} mm</td>
                                        <td className="border border-slate-300 p-2 text-center font-mono font-bold text-slate-950">{it.qty || 1} Lembar</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* CATATAN PENGIRIMAN */}
                    <div className="text-[11px] bg-white/70 p-2.5 rounded-xl border border-slate-300 text-slate-700">
                        <strong>Catatan Pengiriman:</strong> Barang kaca telah diperiksa dalam kondisi sempurna (tidak pecah/gurat) sebelum dimuat ke armada pengiriman. Mohon periksa kembali saat penerimaan.
                    </div>

                    {/* TANDA TANGAN */}
                    <div className="grid grid-cols-3 gap-3 text-center text-[10px] pt-2">
                        <div className="border border-slate-300 p-2 rounded-xl bg-white">
                            <div className="font-bold mb-8 text-slate-700">Penerima / Customer:</div>
                            <div className="border-t border-slate-300 pt-1 font-bold">( {waybillOrder.customer_name} )</div>
                        </div>
                        <div className="border border-slate-300 p-2 rounded-xl bg-white">
                            <div className="font-bold mb-8 text-slate-700">Driver Pengirim:</div>
                            <div className="border-t border-slate-300 pt-1 font-bold">( {waybillOrder.assigned_driver || 'Supir Armada'} )</div>
                        </div>
                        <div className="border border-slate-300 p-2 rounded-xl bg-white">
                            <div className="font-bold mb-8 text-slate-700">Admin / Hormat Kami:</div>
                            <div className="border-t border-slate-300 pt-1 font-bold">( {userName || 'Admin Toko'} )</div>
                        </div>
                    </div>
                </div>

                {/* BOTTOM ACTION BUTTONS */}
                <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 no-print">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl transition text-xs cursor-pointer"
                    >
                        Tutup
                    </button>
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="bg-[#1b68b0] hover:bg-[#15528c] text-white font-bold px-5 py-2.5 rounded-xl transition shadow-xs text-xs flex items-center gap-2 cursor-pointer"
                    >
                        <Printer className="w-4 h-4" />
                        <span>Cetak Surat Jalan Lembar {activeColor}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
