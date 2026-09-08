import React, { useState } from 'react';

export default function WaybillModal({
    show,
    onClose,
    selectedWaybillOrder,
    order,
    selectedOrder,
    userName
}) {
    const waybillOrder = selectedWaybillOrder || order || selectedOrder;

    if (!show || !waybillOrder) return null;

    const [activeColor, setActiveColor] = useState(waybillOrder.waybill_color || 'Putih');

    const colorConfig = {
        Putih: {
            title: 'LEMBAR PUTIH — KONSUMEN (LUNAS)',
            bgColor: 'bg-white text-slate-900 border-slate-400',
            headerBg: 'bg-slate-900 text-white',
            badgeBg: 'bg-slate-950 text-white',
            borderTop: 'border-t-8 border-t-slate-800'
        },
        Merah: {
            title: 'LEMBAR MERAH — TAGIHAN COD DRIVER / SUPIR',
            bgColor: 'bg-rose-50 text-slate-900 border-rose-400',
            headerBg: 'bg-rose-700 text-white',
            badgeBg: 'bg-rose-800 text-white',
            borderTop: 'border-t-8 border-t-rose-600'
        },
        Kuning: {
            title: 'LEMBAR KUNING — PABRIK & ARSIP GUDANG',
            bgColor: 'bg-amber-50 text-slate-900 border-amber-400',
            headerBg: 'bg-amber-600 text-white',
            badgeBg: 'bg-amber-700 text-white',
            borderTop: 'border-t-8 border-t-amber-500'
        },
        Hijau: {
            title: 'LEMBAR HIJAU — KEUANGAN & AKUNTANSI TOKO',
            bgColor: 'bg-emerald-50 text-slate-900 border-emerald-400',
            headerBg: 'bg-emerald-700 text-white',
            badgeBg: 'bg-emerald-800 text-white',
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto no-print-wrapper">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3 no-print">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">🖨️</span>
                        <div>
                            <h3 className="font-extrabold text-slate-100 text-base">
                                Dokumen Resmi Surat Jalan (4 Warna)
                            </h3>
                            <p className="text-xs text-slate-400 font-mono">SPO: {waybillOrder.spo_number || waybillOrder.id}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl font-bold cursor-pointer">&times;</button>
                </div>

                {/* PILIHAN WARNA SURAT JALAN */}
                <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 no-print">
                    <span className="text-xs text-slate-300 font-bold">Pilih Lembar Warna Surat Jalan:</span>
                    <div className="flex flex-wrap gap-2">
                        {['Putih', 'Merah', 'Kuning', 'Hijau'].map(c => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setActiveColor(c)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-black transition border cursor-pointer ${
                                    activeColor === c
                                        ? c === 'Merah' ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/20'
                                        : c === 'Kuning' ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-400/20'
                                        : c === 'Hijau' ? 'bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/20'
                                        : 'bg-white text-slate-950 border-slate-300 shadow-md'
                                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                                }`}
                            >
                                Lembar {c}
                            </button>
                        ))}
                    </div>
                </div>

                {/* PRINTABLE DOKUMEN CONTAINER */}
                <div id="printable-waybill" className={`p-6 rounded-xl space-y-4 font-sans border-2 shadow-inner ${currentConfig.bgColor} ${currentConfig.borderTop}`}>
                    {/* HEADER KOP DOKUMEN */}
                    <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3">
                        <div>
                            <h2 className="font-black text-lg tracking-wider text-slate-950">CV CAHYA KARUNIA JAYA</h2>
                            <p className="text-xs font-semibold text-slate-700">SYP GLASS OPERATIONAL - SURAT JALAN PENGIRIMAN ARMADA</p>
                            <p className="text-[11px] text-slate-600">Jl. Raya Industri Kaca No. 88, Bandung | Telp/WA: 0812-3456-7890</p>
                        </div>
                        <div className="text-right">
                            <span className={`${currentConfig.badgeBg} px-3 py-1 rounded text-xs font-black tracking-widest inline-block uppercase mb-1`}>
                                SURAT JALAN ({activeColor.toUpperCase()})
                            </span>
                            <div className="text-xs font-mono font-bold">No: SJ-{waybillOrder.spo_number || waybillOrder.id}</div>
                            <div className="text-[11px] text-slate-700">Tgl Kirim: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                        </div>
                    </div>

                    <div className="text-center font-black text-xs py-1 rounded border border-slate-400 bg-slate-200/60 uppercase tracking-wide">
                        {currentConfig.title}
                    </div>

                    {/* DETAIL TUJUAN & KONSUMEN */}
                    <div className="grid grid-cols-2 gap-4 text-xs bg-white/80 p-3 rounded-lg border border-slate-300">
                        <div className="space-y-1">
                            <div><strong>No. SPO:</strong> <span className="font-mono text-cyan-700 font-bold">{waybillOrder.spo_number || waybillOrder.id}</span></div>
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
                                <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${isLunas ? 'bg-emerald-200 text-emerald-900 border border-emerald-400' : 'bg-rose-200 text-rose-900 border border-rose-400'}`}>
                                    {waybillOrder.payment_status || 'DP 50%'} {activeColor === 'Merah' && !isLunas ? '— (WAJIB TAGIH COD)' : ''}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* TABEL RINCIAN KACA */}
                    <div>
                        <table className="w-full text-xs text-left border-collapse border border-slate-400 bg-white">
                            <thead className="bg-slate-200 uppercase font-bold text-[11px]">
                                <tr>
                                    <th className="border border-slate-400 p-2 text-center">No</th>
                                    <th className="border border-slate-400 p-2">Spesifikasi Kaca & Jenis Pengerjaan</th>
                                    <th className="border border-slate-400 p-2 text-center">Ukuran (P x L)</th>
                                    <th className="border border-slate-400 p-2 text-center">Tebal</th>
                                    <th className="border border-slate-400 p-2 text-center">Qty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {itemsList.map((it, idx) => (
                                    <tr key={idx} className="border-b border-slate-300">
                                        <td className="border border-slate-400 p-2 text-center font-mono">{idx + 1}</td>
                                        <td className="border border-slate-400 p-2 font-bold">
                                            {it.glass_type}
                                            {Array.isArray(it.processes) && it.processes.length > 0 && (
                                                <div className="text-[10px] text-slate-600 font-normal">
                                                    Proses: {it.processes.join(', ')}
                                                </div>
                                            )}
                                        </td>
                                        <td className="border border-slate-400 p-2 text-center font-mono font-bold">{it.length_cm} x {it.width_cm} cm</td>
                                        <td className="border border-slate-400 p-2 text-center font-mono">{it.thickness_mm || 5} mm</td>
                                        <td className="border border-slate-400 p-2 text-center font-mono font-bold text-slate-950">{it.qty || 1} Lembar</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* CATATAN PENGIRIMAN */}
                    <div className="text-[11px] bg-white/60 p-2 rounded border border-slate-300">
                        <strong>Catatan Pengiriman:</strong> Barang kaca telah diperiksa dalam kondisi sempurna (tidak pecah/gurat) sebelum dimuat ke armada pengiriman. Mohon periksa kembali saat penerimaan.
                    </div>

                    {/* TANDA TANGAN */}
                    <div className="grid grid-cols-3 gap-3 text-center text-[10px] pt-2">
                        <div className="border border-slate-400 p-2 rounded bg-white">
                            <div className="font-bold mb-8">Penerima / Customer:</div>
                            <div className="border-t border-slate-400 pt-1 font-bold">( {waybillOrder.customer_name} )</div>
                        </div>
                        <div className="border border-slate-400 p-2 rounded bg-white">
                            <div className="font-bold mb-8">Driver Pengirim:</div>
                            <div className="border-t border-slate-400 pt-1 font-bold">( {waybillOrder.assigned_driver || 'Supir Armada'} )</div>
                        </div>
                        <div className="border border-slate-400 p-2 rounded bg-white">
                            <div className="font-bold mb-8">Admin / Hormat Kami:</div>
                            <div className="border-t border-slate-400 pt-1 font-bold">( {userName || 'Admin Toko'} )</div>
                        </div>
                    </div>
                </div>

                {/* BOTTON ACTION BUTTONS */}
                <div className="flex justify-end gap-3 pt-2 border-t border-slate-800 no-print">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-lg transition text-xs cursor-pointer"
                    >
                        Tutup
                    </button>
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold px-5 py-2 rounded-lg transition shadow-lg shadow-cyan-500/20 text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                        🖨️ Cetak Surat Jalan Lembar {activeColor} (Print)
                    </button>
                </div>
            </div>
        </div>
    );
}
