import React, { useState } from 'react';
import { Printer, X, Check, Layers, Sparkles } from 'lucide-react';

export default function BatchWaybillModal({
    show,
    onClose,
    tripData,
    userName
}) {
    if (!show || !tripData) return null;

    // Multi-select color checkboxes array: e.g. ['Putih', 'Merah']
    const [selectedColors, setSelectedColors] = useState(['Putih', 'Merah']);

    const {
        trip_code = 'TRIP-20260909-001',
        driver_name = 'Pak Budi (Supir DC)',
        vehicle_plate = 'Engkel Box (D 8472 AB)',
        orders = []
    } = tripData;

    const colorConfig = {
        Putih: {
            title: 'LEMBAR PUTIH — KONSUMEN (LUNAS)',
            bgColor: 'bg-white text-slate-900 border-slate-300',
            badgeBg: 'bg-slate-900 text-white',
            borderTop: 'border-t-8 border-t-slate-800'
        },
        Merah: {
            title: 'LEMBAR MERAH — TAGIHAN COD DRIVER / SUPIR',
            bgColor: 'bg-rose-50/70 text-slate-900 border-rose-300',
            badgeBg: 'bg-rose-700 text-white',
            borderTop: 'border-t-8 border-t-rose-600'
        },
        Kuning: {
            title: 'LEMBAR KUNING — PABRIK & ARSIP GUDANG',
            bgColor: 'bg-amber-50/70 text-slate-900 border-amber-300',
            badgeBg: 'bg-amber-600 text-white',
            borderTop: 'border-t-8 border-t-amber-500'
        },
        Hijau: {
            title: 'LEMBAR HIJAU — KEUANGAN & AKUNTANSI TOKO',
            bgColor: 'bg-emerald-50/70 text-slate-900 border-emerald-300',
            badgeBg: 'bg-emerald-700 text-white',
            borderTop: 'border-t-8 border-t-emerald-600'
        }
    };

    const toggleColor = (colorKey) => {
        setSelectedColors(prev => {
            if (prev.includes(colorKey)) {
                if (prev.length === 1) return prev; // Keep at least 1 checked
                return prev.filter(c => c !== colorKey);
            } else {
                return [...prev, colorKey];
            }
        });
    };

    const selectPreset = (preset) => {
        if (preset === '2warna') {
            setSelectedColors(['Putih', 'Merah']);
        } else if (preset === '4warna') {
            setSelectedColors(['Putih', 'Merah', 'Kuning', 'Hijau']);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
            <style>{`
                @media print {
                    body * {
                        visibility: hidden !important;
                    }
                    #printable-batch-waybills, #printable-batch-waybills * {
                        visibility: visible !important;
                    }
                    #printable-batch-waybills {
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 10px !important;
                        box-shadow: none !important;
                        background-color: #fff !important;
                        color: #000 !important;
                    }
                    .waybill-page {
                        page-break-after: always !important;
                        margin-bottom: 20px !important;
                        border: 2px solid #000 !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto no-print-wrapper text-slate-800">
                {/* MODAL HEADER */}
                <div className="flex justify-between items-center border-b border-slate-200 pb-3.5 no-print">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-[#1b68b0]/10 flex items-center justify-center text-[#1b68b0]">
                            <Printer className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-base">
                                Cetak Sekaligus (Batch Print) Seluruh Surat Jalan Trip Armada
                            </h3>
                            <p className="text-xs text-[#1b68b0] font-mono">
                                Trip {trip_code} — {driver_name} ({vehicle_plate}) — <strong>{orders.length} Alamat SJ</strong>
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

                {/* FILTER COMBINATION WARNA LEMBAR PENGIRIMAN (CHECKBOX MULTI-SELECT) */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 no-print">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                        <span className="text-xs text-slate-700 font-bold flex items-center gap-1.5">
                            <Layers className="w-4 h-4 text-[#1b68b0]" />
                            <span>Centang Warna Lembar yang Ingin Dicetak Sekaligus:</span>
                        </span>
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => selectPreset('2warna')}
                                className="bg-[#1b68b0]/10 hover:bg-[#1b68b0]/20 text-[#1b68b0] border border-[#1b68b0]/30 text-xs font-semibold px-3 py-1 rounded-xl transition cursor-pointer"
                            >
                                2 Warna (Putih + Merah COD)
                            </button>
                            <button
                                type="button"
                                onClick={() => selectPreset('4warna')}
                                className="bg-[#70b03c]/10 hover:bg-[#70b03c]/20 text-[#70b03c] border border-[#70b03c]/30 text-xs font-semibold px-3 py-1 rounded-xl transition cursor-pointer"
                            >
                                Semua 4 Warna
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-medium">
                        {[
                            { key: 'Putih', label: 'Lembar Putih (Konsumen)', bgActive: 'bg-white text-slate-900 border-slate-300 ring-2 ring-[#1b68b0]/20' },
                            { key: 'Merah', label: 'Lembar Merah (Tagihan COD)', bgActive: 'bg-rose-50 text-rose-800 border-rose-300 ring-2 ring-rose-500/20' },
                            { key: 'Kuning', label: 'Lembar Kuning (Arsip Gudang)', bgActive: 'bg-amber-50 text-amber-900 border-amber-300 ring-2 ring-amber-500/20' },
                            { key: 'Hijau', label: 'Lembar Hijau (Keuangan Toko)', bgActive: 'bg-emerald-50 text-emerald-900 border-emerald-300 ring-2 ring-emerald-500/20' },
                        ].map(c => {
                            const isChecked = selectedColors.includes(c.key);
                            return (
                                <div
                                    key={c.key}
                                    onClick={() => toggleColor(c.key)}
                                    className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition select-none ${
                                        isChecked
                                            ? c.bgActive + ' shadow-xs'
                                            : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => {}}
                                        className="w-4 h-4 rounded text-[#1b68b0] focus:ring-0 border-slate-300 cursor-pointer"
                                    />
                                    <span className="text-xs font-semibold">{c.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* PRINTABLE BATCH CONTAINER */}
                <div id="printable-batch-waybills" className="space-y-6">
                    {orders.map((ord, ordIdx) => {
                        return selectedColors.map((colorKey) => {
                            const currentConfig = colorConfig[colorKey] || colorConfig.Putih;
                            const isLunas = ord.payment_status === 'Lunas';
                            const itemsList = Array.isArray(ord.items) && ord.items.length > 0
                                ? ord.items
                                : [{
                                    glass_type: ord.glass_type || 'Kaca Cermin 5 mm polos',
                                    length_cm: ord.length_cm || 150,
                                    width_cm: ord.width_cm || 120,
                                    thickness_mm: ord.thickness_mm || 5,
                                    qty: ord.qty || 1
                                }];

                            return (
                                <div
                                    key={`${ord.id}-${colorKey}`}
                                    className={`waybill-page p-6 rounded-2xl space-y-4 font-sans border shadow-xs ${currentConfig.bgColor} ${currentConfig.borderTop}`}
                                >
                                    {/* HEADER KOP DOKUMEN */}
                                    <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3">
                                        <div>
                                            <h2 className="font-black text-lg tracking-wider text-slate-950">CV CAHYA KARUNIA JAYA</h2>
                                            <p className="text-xs font-semibold text-slate-700">SYP GLASS OPERATIONAL — SURAT JALAN PENGIRIMAN ARMADA</p>
                                            <p className="text-[11px] text-slate-600">Jl. Raya Industri Kaca No. 88, Bandung | Telp/WA: 0812-3456-7890</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`${currentConfig.badgeBg} px-3 py-1 rounded-md text-xs font-bold tracking-widest inline-block uppercase mb-1`}>
                                                SURAT JALAN ({colorKey.toUpperCase()}) — STOP #{ordIdx + 1}
                                            </span>
                                            <div className="text-xs font-mono font-bold">No: SJ-{ord.spo_number || ord.id}</div>
                                            <div className="text-[11px] text-slate-700">Tgl Kirim: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                        </div>
                                    </div>

                                    <div className="text-center font-bold text-xs py-1.5 rounded-lg border border-slate-300 bg-white/60 uppercase tracking-wide">
                                        {currentConfig.title}
                                    </div>

                                    {/* DETAIL TUJUAN & KONSUMEN */}
                                    <div className="grid grid-cols-2 gap-4 text-xs bg-white/90 p-3.5 rounded-xl border border-slate-300">
                                        <div className="space-y-1">
                                            <div><strong>No. SPO:</strong> <span className="font-mono text-[#1b68b0] font-bold">{ord.spo_number || ord.id}</span></div>
                                            <div><strong>Penerima / Customer:</strong> <span className="font-bold">{ord.customer_name}</span></div>
                                            <div><strong>No. Telepon:</strong> {ord.customer_phone}</div>
                                            <div><strong>Alamat Tujuan:</strong> {ord.customer_address || '-'}</div>
                                        </div>
                                        <div className="space-y-1 border-l border-slate-300 pl-3">
                                            <div><strong>Pengirim:</strong> CV Cahya Karunia Jaya (SYP Glass)</div>
                                            <div><strong>Driver / Supir:</strong> <span className="font-bold">{driver_name}</span></div>
                                            <div><strong>Kendaraan / Plat:</strong> {vehicle_plate}</div>
                                            <div>
                                                <strong>Status Pembayaran:</strong>{' '}
                                                <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${isLunas ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'}`}>
                                                    {ord.payment_status || 'DP 50%'} {colorKey === 'Merah' && !isLunas ? '— (WAJIB TAGIH COD)' : ''}
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
                                        <strong>Catatan Pengiriman:</strong> Barang kaca telah diperiksa dalam kondisi sempurna (tidak pecah/gurat) sebelum dimuat ke armada pengiriman. Mohon periksa kembali saat penerimaan di lokasi Stop #{ordIdx + 1}.
                                    </div>

                                    {/* TANDA TANGAN */}
                                    <div className="grid grid-cols-3 gap-3 text-center text-[10px] pt-2">
                                        <div className="border border-slate-300 p-2 rounded-xl bg-white">
                                            <div className="font-bold mb-8 text-slate-700">Penerima / Customer:</div>
                                            <div className="border-t border-slate-300 pt-1 font-bold">( {ord.customer_name} )</div>
                                        </div>
                                        <div className="border border-slate-300 p-2 rounded-xl bg-white">
                                            <div className="font-bold mb-8 text-slate-700">Driver Pengirim:</div>
                                            <div className="border-t border-slate-300 pt-1 font-bold">( {driver_name} )</div>
                                        </div>
                                        <div className="border border-slate-300 p-2 rounded-xl bg-white">
                                            <div className="font-bold mb-8 text-slate-700">Admin / Hormat Kami:</div>
                                            <div className="border-t border-slate-300 pt-1 font-bold">( {userName || 'Admin Toko'} )</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        });
                    })}
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
                        <span>Cetak Sekaligus ({orders.length * selectedColors.length} Lembar SJ: {selectedColors.join(' + ')})</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
