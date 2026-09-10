import React, { useState } from 'react';

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
            bgColor: 'bg-white text-slate-900 border-slate-400',
            badgeBg: 'bg-slate-950 text-white',
            borderTop: 'border-t-8 border-t-slate-800'
        },
        Merah: {
            title: 'LEMBAR MERAH — TAGIHAN COD DRIVER / SUPIR',
            bgColor: 'bg-rose-50 text-slate-900 border-rose-400',
            badgeBg: 'bg-rose-800 text-white',
            borderTop: 'border-t-8 border-t-rose-600'
        },
        Kuning: {
            title: 'LEMBAR KUNING — PABRIK & ARSIP GUDANG',
            bgColor: 'bg-amber-50 text-slate-900 border-amber-400',
            badgeBg: 'bg-amber-700 text-white',
            borderTop: 'border-t-8 border-t-amber-500'
        },
        Hijau: {
            title: 'LEMBAR HIJAU — KEUANGAN & AKUNTANSI TOKO',
            bgColor: 'bg-emerald-50 text-slate-900 border-emerald-400',
            badgeBg: 'bg-emerald-800 text-white',
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto no-print-wrapper">
                {/* MODAL HEADER */}
                <div className="flex justify-between items-center border-b border-slate-800 pb-3 no-print">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🖨️</span>
                        <div>
                            <h3 className="font-extrabold text-slate-100 text-base">
                                Cetak Sekaligus (Batch Print) Seluruh Surat Jalan Trip Armada
                            </h3>
                            <p className="text-xs text-cyan-400 font-mono">
                                Trip {trip_code} — {driver_name} ({vehicle_plate}) — <strong>{orders.length} Alamat SJ</strong>
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl font-bold cursor-pointer">&times;</button>
                </div>

                {/* FILTER COMBINATION WARNA LEMBAR PENGIRIMAN (CHECKBOX MULTI-SELECT) */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 no-print">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                        <span className="text-xs text-slate-200 font-bold flex items-center gap-1.5">
                            <span>🎨</span> Centang Warna Lembar yang Ingin Dicetak Sekaligus:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                            <button
                                type="button"
                                onClick={() => selectPreset('2warna')}
                                className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold px-2.5 py-1 rounded-lg transition cursor-pointer"
                            >
                                ⚡ Centang 2 Warna (Putih + Merah COD)
                            </button>
                            <button
                                type="button"
                                onClick={() => selectPreset('4warna')}
                                className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold px-2.5 py-1 rounded-lg transition cursor-pointer"
                            >
                                🌈 Centang Semua 4 Warna
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold">
                        {[
                            { key: 'Putih', label: 'Lembar Putih (Konsumen)', bgActive: 'bg-white text-slate-950 border-slate-300' },
                            { key: 'Merah', label: 'Lembar Merah (Tagihan COD)', bgActive: 'bg-rose-600 text-white border-rose-400' },
                            { key: 'Kuning', label: 'Lembar Kuning (Arsip Gudang)', bgActive: 'bg-amber-400 text-slate-950 border-amber-300' },
                            { key: 'Hijau', label: 'Lembar Hijau (Keuangan Toko)', bgActive: 'bg-emerald-600 text-white border-emerald-400' },
                        ].map(c => {
                            const isChecked = selectedColors.includes(c.key);
                            return (
                                <div
                                    key={c.key}
                                    onClick={() => toggleColor(c.key)}
                                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition select-none ${
                                        isChecked
                                            ? c.bgActive + ' shadow-md'
                                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => {}}
                                        className="w-4 h-4 rounded text-cyan-500 focus:ring-0 bg-slate-950 border-slate-700 cursor-pointer"
                                    />
                                    <span className="text-xs font-black">{c.label}</span>
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
                                    className={`waybill-page p-6 rounded-xl space-y-4 font-sans border-2 shadow-inner ${currentConfig.bgColor} ${currentConfig.borderTop}`}
                                >
                                    {/* HEADER KOP DOKUMEN */}
                                    <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3">
                                        <div>
                                            <h2 className="font-black text-lg tracking-wider text-slate-950">CV CAHYA KARUNIA JAYA</h2>
                                            <p className="text-xs font-semibold text-slate-700">SYP GLASS OPERATIONAL — SURAT JALAN PENGIRIMAN ARMADA</p>
                                            <p className="text-[11px] text-slate-600">Jl. Raya Industri Kaca No. 88, Bandung | Telp/WA: 0812-3456-7890</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`${currentConfig.badgeBg} px-3 py-1 rounded text-xs font-black tracking-widest inline-block uppercase mb-1`}>
                                                SURAT JALAN ({colorKey.toUpperCase()}) — STOP #{ordIdx + 1}
                                            </span>
                                            <div className="text-xs font-mono font-bold">No: SJ-{ord.spo_number || ord.id}</div>
                                            <div className="text-[11px] text-slate-700">Tgl Kirim: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                        </div>
                                    </div>

                                    <div className="text-center font-black text-xs py-1 rounded border border-slate-400 bg-slate-200/60 uppercase tracking-wide">
                                        {currentConfig.title}
                                    </div>

                                    {/* DETAIL TUJUAN & KONSUMEN */}
                                    <div className="grid grid-cols-2 gap-4 text-xs bg-white/80 p-3 rounded-lg border border-slate-300">
                                        <div className="space-y-1">
                                            <div><strong>No. SPO:</strong> <span className="font-mono text-cyan-700 font-bold">{ord.spo_number || ord.id}</span></div>
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
                                                <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${isLunas ? 'bg-emerald-200 text-emerald-900 border border-emerald-400' : 'bg-rose-200 text-rose-900 border border-rose-400'}`}>
                                                    {ord.payment_status || 'DP 50%'} {colorKey === 'Merah' && !isLunas ? '— (WAJIB TAGIH COD)' : ''}
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
                                        <strong>Catatan Pengiriman:</strong> Barang kaca telah diperiksa dalam kondisi sempurna (tidak pecah/gurat) sebelum dimuat ke armada pengiriman. Mohon periksa kembali saat penerimaan di lokasi Stop #{ordIdx + 1}.
                                    </div>

                                    {/* TANDA TANGAN */}
                                    <div className="grid grid-cols-3 gap-3 text-center text-[10px] pt-2">
                                        <div className="border border-slate-400 p-2 rounded bg-white">
                                            <div className="font-bold mb-8">Penerima / Customer:</div>
                                            <div className="border-t border-slate-400 pt-1 font-bold">( {ord.customer_name} )</div>
                                        </div>
                                        <div className="border border-slate-400 p-2 rounded bg-white">
                                            <div className="font-bold mb-8">Driver Pengirim:</div>
                                            <div className="border-t border-slate-400 pt-1 font-bold">( {driver_name} )</div>
                                        </div>
                                        <div className="border border-slate-400 p-2 rounded bg-white">
                                            <div className="font-bold mb-8">Admin / Hormat Kami:</div>
                                            <div className="border-t border-slate-400 pt-1 font-bold">( {userName || 'Admin Toko'} )</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        });
                    })}
                </div>

                {/* BOTTOM ACTION BUTTONS */}
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
                        🖨️ Cetak Sekaligus ({orders.length * selectedColors.length} Lembar SJ: {selectedColors.join(' + ')})
                    </button>
                </div>
            </div>
        </div>
    );
}
