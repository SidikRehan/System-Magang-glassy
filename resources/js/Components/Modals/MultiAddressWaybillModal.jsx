import React from 'react';

export default function MultiAddressWaybillModal({
    show,
    onClose,
    tripData,
    userName
}) {
    if (!show || !tripData) return null;

    const {
        trip_code = 'TRIP-DEMO-001',
        driver_name = 'Pak Budi (Supir DC)',
        vehicle_plate = 'Engkel Box (D 8472 AB)',
        deliveries = [],
        orders = []
    } = tripData;

    const stopList = deliveries.length > 0 ? deliveries : orders.map((ord, idx) => ({
        id: ord.id,
        stop_order: idx + 1,
        order: ord,
        waybill_number: 'SJ-' + (ord.spo_number || ord.id),
        driver_name: driver_name,
        vehicle_plate: vehicle_plate,
        delivery_status: ord.status === 'selesai' ? 'Selesai Terkirim' : 'Dalam Pengiriman'
    }));

    const totalCOD = stopList.reduce((acc, d) => {
        const ord = d.order || d;
        const unpaid = (ord.payment_status !== 'Lunas');
        const sisa = unpaid ? ((ord.total_price || 0) - (ord.paid_amount || 0)) : 0;
        return acc + Math.max(0, sisa);
    }, 0);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <style>{`
                @media print {
                    body * {
                        visibility: hidden !important;
                    }
                    #printable-multi-address-waybill, #printable-multi-address-waybill * {
                        visibility: visible !important;
                    }
                    #printable-multi-address-waybill {
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
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto no-print-wrapper">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3 no-print">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">🚚</span>
                        <div>
                            <h3 className="font-extrabold text-slate-100 text-base">
                                Surat Jalan Rute Armada Multi-Alamat (Delivery Manifest)
                            </h3>
                            <p className="text-xs text-slate-400 font-mono">Kode Trip: {trip_code}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl font-bold cursor-pointer">&times;</button>
                </div>

                {/* PRINTABLE MANIFEST CONTAINER */}
                <div id="printable-multi-address-waybill" className="p-6 rounded-xl space-y-5 font-sans border-2 border-slate-800 bg-white text-slate-900 shadow-inner border-t-8 border-t-cyan-600">
                    {/* HEADER KOP DOKUMEN */}
                    <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3">
                        <div>
                            <h2 className="font-black text-xl tracking-wider text-slate-950">CV CAHYA KARUNIA JAYA</h2>
                            <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">SYP GLASS OPERATIONAL — MANIFEST SURAT JALAN RUTE ARMADA MULTI-ALAMAT</p>
                            <p className="text-[11px] text-slate-600">Jl. Raya Industri Kaca No. 88, Bandung | Telp/WA: 0812-3456-7890</p>
                        </div>
                        <div className="text-right">
                            <span className="bg-cyan-800 text-white px-3 py-1 rounded text-xs font-black tracking-widest inline-block uppercase mb-1">
                                RUTE MANIFEST MULTI-STOP
                            </span>
                            <div className="text-xs font-mono font-bold">No. Trip: {trip_code}</div>
                            <div className="text-[11px] text-slate-700">Tgl: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                        </div>
                    </div>

                    {/* RINGKASAN ARMADA & SUPIR */}
                    <div className="grid grid-cols-3 gap-3 text-xs bg-slate-100 p-3 rounded-lg border border-slate-400">
                        <div>
                            <span className="text-slate-500 font-bold block">DRIVER / SUPIR:</span>
                            <strong className="text-slate-900 text-sm font-extrabold">{driver_name}</strong>
                        </div>
                        <div>
                            <span className="text-slate-500 font-bold block">KENDARAAN & PLAT:</span>
                            <strong className="text-slate-900 text-sm font-extrabold">{vehicle_plate}</strong>
                        </div>
                        <div className="text-right">
                            <span className="text-slate-500 font-bold block">TOTAL ALAMAT TUJUAN:</span>
                            <strong className="text-cyan-800 text-sm font-extrabold">{stopList.length} Alamat Pengantaran</strong>
                            {totalCOD > 0 && (
                                <div className="text-[11px] font-bold text-rose-700 mt-0.5">
                                    Total Wajib Tagih COD: {formatCurrency(totalCOD)}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* MANIFEST LIST ALAMAT PENGIRIMAN */}
                    <div className="space-y-4">
                        <h3 className="font-extrabold text-sm text-slate-900 uppercase border-b border-slate-400 pb-1">
                            📋 Daftar Urutan Alamat Tujuan & Rincian Barang Kaca:
                        </h3>

                        {stopList.map((item, idx) => {
                            const ord = item.order || item;
                            const itemsList = Array.isArray(ord.items) && ord.items.length > 0
                                ? ord.items
                                : [{
                                    glass_type: ord.glass_type || 'Kaca Cermin 5 mm polos',
                                    length_cm: ord.length_cm || 150,
                                    width_cm: ord.width_cm || 120,
                                    thickness_mm: ord.thickness_mm || 5,
                                    qty: ord.qty || 1
                                }];

                            const isLunas = ord.payment_status === 'Lunas';
                            const sisaCOD = !isLunas ? Math.max(0, (ord.total_price || 0) - (ord.paid_amount || 0)) : 0;

                            return (
                                <div key={idx} className="border-2 border-slate-400 rounded-lg p-3 bg-white space-y-2">
                                    <div className="flex justify-between items-center border-b border-slate-300 pb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-slate-900 text-white font-black text-xs px-2.5 py-1 rounded-full">
                                                STOP #{idx + 1}
                                            </span>
                                            <span className="font-extrabold text-cyan-800 text-sm font-mono">
                                                SPO: {ord.spo_number || ord.id}
                                            </span>
                                            <span className="text-xs text-slate-500 font-mono">
                                                (SJ: {item.waybill_number || ('SJ-' + ord.spo_number)})
                                            </span>
                                        </div>
                                        <div>
                                            <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded ${isLunas ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'}`}>
                                                {isLunas ? 'LUNAS' : `TAGIH COD: ${formatCurrency(sisaCOD)}`}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div>
                                            <p className="font-bold text-slate-900">👤 Customer: {ord.customer_name}</p>
                                            <p className="text-slate-700">📞 No. Telp/WA: <span className="font-mono font-bold">{ord.customer_phone}</span></p>
                                            <p className="text-slate-800 mt-1 leading-snug">
                                                📍 <strong>Alamat Tujuan:</strong> {ord.customer_address || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 mb-1">📦 Muatan Kaca di Lokasi Ini:</p>
                                            <ul className="list-disc list-inside text-[11px] space-y-0.5 font-medium text-slate-800">
                                                {itemsList.map((it, itIdx) => (
                                                    <li key={itIdx}>
                                                        <strong>{it.qty || 1} Pcs</strong> — {it.glass_type} ({it.length_cm}x{it.width_cm} cm, {it.thickness_mm || 5}mm)
                                                    </li>
                                                ))}
                                                {Array.isArray(ord.accessories) && ord.accessories.length > 0 && (
                                                    <li className="text-slate-600 font-normal">
                                                        Aksesoris: {ord.accessories.map(a => typeof a === 'object' ? a.name : a).join(', ')}
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* BUKTI SERAH TERIMA LOKASI STOP */}
                                    <div className="flex justify-between items-center text-[10px] border-t border-dashed border-slate-300 pt-2 text-slate-600">
                                        <span>Status Kirim: <strong>{item.delivery_status || 'Dalam Pengiriman'}</strong></span>
                                        <div className="flex items-center gap-4">
                                            <span>Paraf Penerima Stop #{idx + 1}: ______________________</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* CATATAN DAN TANDA TANGAN KESELURUHAN */}
                    <div className="text-[11px] bg-amber-50 p-2.5 rounded border border-amber-300 text-amber-900">
                        <strong>Intruksi Supir:</strong> Mohon serahkan Surat Jalan 4 Warna per konsumen di masing-masing lokasi. Pastikan uang COD ditagih penuh sebelum menyerahkan barang pada lembar merah COD.
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center text-[10px] pt-2">
                        <div className="border border-slate-400 p-2 rounded bg-white">
                            <div className="font-bold mb-8">Admin Dispatcher:</div>
                            <div className="border-t border-slate-400 pt-1 font-bold">( {userName || 'Admin Toko'} )</div>
                        </div>
                        <div className="border border-slate-400 p-2 rounded bg-white">
                            <div className="font-bold mb-8">Supir / Driver Utama:</div>
                            <div className="border-t border-slate-400 pt-1 font-bold">( {driver_name} )</div>
                        </div>
                        <div className="border border-slate-400 p-2 rounded bg-white">
                            <div className="font-bold mb-8">Kepala Gudang / Pengawas Loading:</div>
                            <div className="border-t border-slate-400 pt-1 font-bold">( Supervisor Gudang )</div>
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
                        🖨️ Cetak Manifest Rute Multi-Alamat (Print)
                    </button>
                </div>
            </div>
        </div>
    );
}
