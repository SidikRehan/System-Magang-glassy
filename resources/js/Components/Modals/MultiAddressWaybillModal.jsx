import React from 'react';
import { Truck, Printer, X, ClipboardList, MapPin, User, Phone, Package } from 'lucide-react';

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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
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
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto no-print-wrapper text-slate-800">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3.5 no-print">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-[#1b68b0]/10 flex items-center justify-center text-[#1b68b0]">
                            <Truck className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-base">
                                Surat Jalan Rute Armada Multi-Alamat (Delivery Manifest)
                            </h3>
                            <p className="text-xs text-slate-500 font-mono">Kode Trip: {trip_code}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl p-1.5 transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* PRINTABLE MANIFEST CONTAINER */}
                <div id="printable-multi-address-waybill" className="p-6 rounded-2xl space-y-5 font-sans border border-slate-300 bg-white text-slate-900 shadow-xs border-t-8 border-t-[#1b68b0]">
                    {/* HEADER KOP DOKUMEN */}
                    <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3">
                        <div>
                            <h2 className="font-black text-xl tracking-wider text-slate-950">CV CAHYA KARUNIA JAYA</h2>
                            <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">SYP GLASS OPERATIONAL — MANIFEST SURAT JALAN RUTE ARMADA MULTI-ALAMAT</p>
                            <p className="text-[11px] text-slate-600">Jl. Raya Industri Kaca No. 88, Bandung | Telp/WA: 0812-3456-7890</p>
                        </div>
                        <div className="text-right">
                            <span className="bg-[#1b68b0] text-white px-3 py-1 rounded-md text-xs font-bold tracking-widest inline-block uppercase mb-1">
                                RUTE MANIFEST MULTI-STOP
                            </span>
                            <div className="text-xs font-mono font-bold">No. Trip: {trip_code}</div>
                            <div className="text-[11px] text-slate-700">Tgl: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                        </div>
                    </div>

                    {/* RINGKASAN ARMADA & SUPIR */}
                    <div className="grid grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <div>
                            <span className="text-slate-500 font-bold block text-[11px]">DRIVER / SUPIR:</span>
                            <strong className="text-slate-900 text-sm font-bold">{driver_name}</strong>
                        </div>
                        <div>
                            <span className="text-slate-500 font-bold block text-[11px]">KENDARAAN & PLAT:</span>
                            <strong className="text-slate-900 text-sm font-bold">{vehicle_plate}</strong>
                        </div>
                        <div className="text-right">
                            <span className="text-slate-500 font-bold block text-[11px]">TOTAL ALAMAT TUJUAN:</span>
                            <strong className="text-[#1b68b0] text-sm font-bold">{stopList.length} Alamat Pengantaran</strong>
                            {totalCOD > 0 && (
                                <div className="text-[11px] font-bold text-rose-600 mt-0.5">
                                    Total Wajib Tagih COD: {formatCurrency(totalCOD)}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* MANIFEST LIST ALAMAT PENGIRIMAN */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-sm text-slate-800 uppercase border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                            <ClipboardList className="w-4 h-4 text-[#1b68b0]" />
                            <span>Daftar Urutan Alamat Tujuan & Rincian Barang Kaca:</span>
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
                                <div key={idx} className="border border-slate-300 rounded-xl p-3.5 bg-white space-y-2.5 shadow-2xs">
                                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-slate-900 text-white font-bold text-xs px-2.5 py-0.5 rounded-full">
                                                STOP #{idx + 1}
                                            </span>
                                            <span className="font-bold text-[#1b68b0] text-sm font-mono">
                                                SPO: {ord.spo_number || ord.id}
                                            </span>
                                            <span className="text-xs text-slate-500 font-mono">
                                                (SJ: {item.waybill_number || ('SJ-' + ord.spo_number)})
                                            </span>
                                        </div>
                                        <div>
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${isLunas ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'}`}>
                                                {isLunas ? 'LUNAS' : `TAGIH COD: ${formatCurrency(sisaCOD)}`}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div className="space-y-1">
                                            <p className="font-bold text-slate-800 flex items-center gap-1">
                                                <User className="w-3.5 h-3.5 text-slate-500" />
                                                <span>Customer: {ord.customer_name}</span>
                                            </p>
                                            <p className="text-slate-600 flex items-center gap-1">
                                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                                <span>No. Telp/WA: <span className="font-mono font-bold text-slate-800">{ord.customer_phone}</span></span>
                                            </p>
                                            <p className="text-slate-700 leading-snug flex items-start gap-1">
                                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                                <span>Alamat Tujuan: {ord.customer_address || '-'}</span>
                                            </p>
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 mb-1 flex items-center gap-1">
                                                <Package className="w-3.5 h-3.5 text-[#1b68b0]" />
                                                <span>Muatan Kaca di Lokasi Ini:</span>
                                            </p>
                                            <ul className="list-disc list-inside text-[11px] space-y-0.5 font-medium text-slate-700 pl-1">
                                                {itemsList.map((it, itIdx) => (
                                                    <li key={itIdx}>
                                                        <strong>{it.qty || 1} Pcs</strong> — {it.glass_type} ({it.length_cm}x{it.width_cm} cm, {it.thickness_mm || 5}mm)
                                                    </li>
                                                ))}
                                                {Array.isArray(ord.accessories) && ord.accessories.length > 0 && (
                                                    <li className="text-slate-500 font-normal">
                                                        Aksesoris: {ord.accessories.map(a => typeof a === 'object' ? a.name : a).join(', ')}
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* BUKTI SERAH TERIMA LOKASI STOP */}
                                    <div className="flex justify-between items-center text-[10px] border-t border-dashed border-slate-200 pt-2 text-slate-500">
                                        <span>Status Kirim: <strong className="text-slate-700">{item.delivery_status || 'Dalam Pengiriman'}</strong></span>
                                        <div className="flex items-center gap-4">
                                            <span>Paraf Penerima Stop #{idx + 1}: ______________________</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* CATATAN DAN TANDA TANGAN KESELURUHAN */}
                    <div className="text-[11px] bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900">
                        <strong>Instruksi Supir:</strong> Mohon serahkan Surat Jalan 4 Warna per konsumen di masing-masing lokasi. Pastikan uang COD ditagih penuh sebelum menyerahkan barang pada lembar merah COD.
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center text-[10px] pt-2">
                        <div className="border border-slate-300 p-2.5 rounded-xl bg-white">
                            <div className="font-bold mb-8 text-slate-700">Admin Dispatcher:</div>
                            <div className="border-t border-slate-300 pt-1 font-bold">( {userName || 'Admin Toko'} )</div>
                        </div>
                        <div className="border border-slate-300 p-2.5 rounded-xl bg-white">
                            <div className="font-bold mb-8 text-slate-700">Supir / Driver Utama:</div>
                            <div className="border-t border-slate-300 pt-1 font-bold">( {driver_name} )</div>
                        </div>
                        <div className="border border-slate-300 p-2.5 rounded-xl bg-white">
                            <div className="font-bold mb-8 text-slate-700">Kepala Gudang / Pengawas Loading:</div>
                            <div className="border-t border-slate-300 pt-1 font-bold">( Supervisor Gudang )</div>
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
                        <span>Cetak Manifest Rute Multi-Alamat (Print)</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
