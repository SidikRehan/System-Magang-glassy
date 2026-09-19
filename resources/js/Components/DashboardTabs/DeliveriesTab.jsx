import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { 
    Truck, User, Calendar, MapPin, ClipboardList, 
    Printer, Fuel, CreditCard, CheckSquare, XSquare, 
    Plus, AlertCircle, FileText, CheckCircle2, Phone, 
    ShieldCheck, Sparkles, Send, Clock, Camera
} from 'lucide-react';
import { isDriverMatch } from '@/Utils/dashboardHelpers';

export default function DeliveriesTab({
    userRole,
    userName,
    auth,
    initialOrders = [],
    initialDeliveries = [],
    financeTransactionsList = [],
    handleOpenCodModal,
    setShowDriverClaimModal,
    handleOpenSketchLightbox,
    setSelectedBatchWaybillTrip,
    setShowBatchWaybillModal,
    setSelectedTripDataForModal,
    setShowMultiAddressModal,
    setSelectedBarangKeluarData,
    setShowBarangKeluarModal,
    setSelectedWaybillOrder,
    setShowWaybillModal,
}) {
    const [selectedBatchOrderIds, setSelectedBatchOrderIds] = useState([]);
    const [dispatchDriverInput, setDispatchDriverInput] = useState('Pak Budi (Supir Utama DC)');
    const [dispatchVehicleInput, setDispatchVehicleInput] = useState('Engkel Box (D 8472 AB)');
    const [dispatchNotesInput, setDispatchNotesInput] = useState('');

    const toggleSelectOrderForBatch = (orderId) => {
        setSelectedBatchOrderIds(prev =>
            prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
        );
    };

    const toggleSelectAllReadyOrders = () => {
        const readyOrders = initialOrders.filter(o => o.status === 'pengiriman' || o.status === 'pengerjaan');
        const readyIds = readyOrders.map(o => o.id);
        if (selectedBatchOrderIds.length === readyIds.length) {
            setSelectedBatchOrderIds([]);
        } else {
            setSelectedBatchOrderIds(readyIds);
        }
    };

    const handleAssignBatchDeliverySubmit = (e) => {
        e.preventDefault();
        if (selectedBatchOrderIds.length === 0) {
            alert('Silakan pilih (centang) minimal 1 SPO / Alamat pengiriman terlebih dahulu!');
            return;
        }

        router.post('/orders/batch-delivery', {
            order_ids: selectedBatchOrderIds,
            driver_name: dispatchDriverInput,
            vehicle_plate: dispatchVehicleInput,
            notes: dispatchNotesInput
        }, {
            onSuccess: () => {
                setSelectedBatchOrderIds([]);
                setDispatchNotesInput('');
            }
        });
    };

    const getPhotoList = (pathStr) => {
        if (!pathStr) return [];
        if (typeof pathStr === 'string' && pathStr.trim().startsWith('[')) {
            try {
                return JSON.parse(pathStr);
            } catch (e) {
                return [pathStr];
            }
        }
        return [pathStr];
    };

    return (
        <div className="space-y-6">
            {/* HEADER TAB */}
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-[#242222] flex items-center gap-2.5">
                        <Truck className="w-6 h-6 text-[#1b68b0]" />
                        <span>{userRole === 'driver' ? `Pengiriman Saya (${userName})` : 'Penugasan Pengiriman Multi-Alamat & Surat Jalan'}</span>
                    </h2>
                    <p className="text-slate-500 text-xs font-medium mt-1">
                        {userRole === 'driver' 
                            ? `Daftar penugasan trip & manifest pengiriman alamat konsumen khusus untuk akun supir Anda (${userName}).`
                            : 'Kelola alokasi armada multi-stop, cetak rute manifest surat jalan 4 warna, dan pantau pengiriman.'}
                    </p>
                </div>
                <div className="bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold text-[#242222] flex items-center gap-2 shadow-xs">
                    <Truck className="w-4 h-4 text-[#1b68b0]" />
                    <span className="text-slate-600">Order Siap / Kirim:</span>
                    <span className="bg-blue-50 text-[#1b68b0] px-2 py-0.5 rounded-full font-mono font-black border border-blue-200">
                        {userRole === 'driver'
                            ? initialOrders.filter(o => isDriverMatch(o.assigned_driver || o.driver_name, userName) && (o.status === 'pengiriman' || o.status === 'selesai' || o.status === 'pengerjaan')).length
                            : initialOrders.filter(o => o.status === 'pengiriman' || o.status === 'selesai' || o.status === 'pengerjaan').length} SPO
                    </span>
                </div>
            </div>

            {/* DRIVER FINANCIAL & OPERATIONAL HUB (KHUSUS SUPIR ARMADA) */}
            {userRole === 'driver' && (() => {
                const myCodOrders = initialOrders.filter(o => 
                    o.payment_status !== 'Lunas' && 
                    isDriverMatch(o.assigned_driver || o.driver_name, userName)
                );
                const myClaims = financeTransactionsList.filter(t => 
                    t.source_role === 'driver' && 
                    (t.user_id === auth?.user?.id || t.title?.toLowerCase().includes(userName.toLowerCase()) || t.notes?.toLowerCase().includes(userName.toLowerCase()))
                );
                const totalPendingCod = myCodOrders.reduce((acc, o) => acc + Math.max(0, Number(o.total_price || 0) - Number(o.paid_amount || 0)), 0);

                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* WIDGET 1: SERAH TERIMA UANG COD SURAT JALAN MERAH */}
                        <div className="bg-white border border-rose-200 rounded-2xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                                        <h3 className="font-extrabold text-[#242222] text-sm flex items-center gap-1.5">
                                            <CreditCard className="w-4 h-4 text-rose-600" /> Tagihan COD Surat Jalan Merah
                                        </h3>
                                    </div>
                                    <span className="text-[11px] font-mono bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full font-bold">
                                        {myCodOrders.length} Order COD
                                    </span>
                                </div>

                                <div>
                                    <span className="text-xs text-slate-500 font-medium">Total Uang COD Ditagih di Lapangan:</span>
                                    <div className="text-2xl font-black text-rose-600 font-mono mt-0.5">
                                        Rp {totalPendingCod.toLocaleString('id-ID')}
                                    </div>
                                </div>

                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                    {myCodOrders.length === 0 ? (
                                        <p className="text-xs text-slate-400 italic py-3 text-center">Tidak ada tagihan COD aktif untuk rute supir Anda saat ini.</p>
                                    ) : (
                                        myCodOrders.map(ord => {
                                            const sisa = Math.max(0, Number(ord.total_price || 0) - Number(ord.paid_amount || 0));
                                            return (
                                                <div key={ord.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex justify-between items-center text-xs">
                                                    <div>
                                                        <div className="font-black text-[#242222]">#{ord.spo_number} - {ord.customer_name}</div>
                                                        <div className="text-rose-600 font-mono font-bold mt-0.5">Tagihan: Rp {sisa.toLocaleString('id-ID')}</div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleOpenCodModal(ord)}
                                                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer text-xs"
                                                    >
                                                        <CreditCard className="w-3.5 h-3.5" /> Setor Kas ke Kasir
                                                    </button>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                            <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2.5 mt-3 flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>Serahkan uang tunai pelunasan ke Kasir Toko agar surat jalan merah ditutup dan status order lunas.</span>
                            </div>
                        </div>

                        {/* WIDGET 2: KLAIM BIAYA ARMADA (BBM SOLAR / TOL / PARKIR) */}
                        <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                    <div className="flex items-center gap-2">
                                        <Fuel className="w-4 h-4 text-amber-600" />
                                        <h3 className="font-extrabold text-[#242222] text-sm">
                                            Klaim Biaya Armada (BBM Solar & Tol)
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => setShowDriverClaimModal(true)}
                                        className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Ajukan Klaim
                                    </button>
                                </div>

                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                    {myClaims.length === 0 ? (
                                        <p className="text-xs text-slate-400 italic py-3 text-center">Belum ada pengajuan klaim BBM / Tol untuk akun Anda.</p>
                                    ) : (
                                        myClaims.map(clm => (
                                            <div key={clm.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex justify-between items-center text-xs">
                                                <div>
                                                    <div className="font-bold text-[#242222]">{clm.title}</div>
                                                    <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex flex-wrap items-center gap-2">
                                                        <span className="text-amber-700 font-black">Rp {Number(clm.amount || 0).toLocaleString('id-ID')}</span>
                                                        <span>• {clm.vehicle_plate || 'Armada'}</span>
                                                        <span>• {clm.transaction_date}</span>
                                                    </div>
                                                    {clm.receipt_photo_path && (() => {
                                                        const pList = getPhotoList(clm.receipt_photo_path);
                                                        if (pList.length === 0) return null;
                                                        return (
                                                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                                                {pList.map((p, pIdx) => (
                                                                    <button
                                                                        key={pIdx}
                                                                        type="button"
                                                                        onClick={() => handleOpenSketchLightbox(p, `Struk Nota #${clm.transaction_code} (${pIdx + 1}/${pList.length})`)}
                                                                        className="text-[10px] bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-2 py-0.5 rounded-lg font-mono font-bold flex items-center gap-1 cursor-pointer"
                                                                    >
                                                                        <Camera className="w-3 h-3 text-slate-500" />
                                                                        <span>Struk #{pIdx + 1}</span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                                <div>
                                                    {clm.approval_status === 'pending' && (
                                                        <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> Menunggu
                                                        </span>
                                                    )}
                                                    {clm.approval_status === 'approved' && (
                                                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                                                            <CheckCircle2 className="w-3 h-3" /> Disetujui
                                                        </span>
                                                    )}
                                                    {clm.approval_status === 'rejected' && (
                                                        <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                                                            ✕ Ditolak
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                            <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2.5 mt-3 flex justify-between items-center">
                                <span>Total Klaim: <strong className="text-[#242222]">{myClaims.length} Pengajuan</strong></span>
                                <button
                                    onClick={() => setShowDriverClaimModal(true)}
                                    className="text-[#1b68b0] hover:underline font-bold cursor-pointer"
                                >
                                    + Klaim BBM / Parkir
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* PANEL ATAS: PENUGASAN MULTI-ALAMAT ARMADA (KHUSUS ADMIN TOKO / WMS LOGISTICS, BUKAN DRIVER) */}
            {userRole !== 'driver' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                    <div className="flex flex-wrap justify-between items-center border-b border-slate-100 pb-3 gap-2">
                        <div className="flex items-center gap-2">
                            <ClipboardList className="w-5 h-5 text-[#1b68b0]" />
                            <h3 className="text-sm font-black text-[#242222]">
                                Form Penugasan Rute Mobil Multi-Alamat (WMS Logistics)
                            </h3>
                        </div>
                        <span className="text-xs bg-blue-50 text-[#1b68b0] px-3 py-1 rounded-full border border-blue-200 font-bold">
                            {selectedBatchOrderIds.length} Alamat Dipilih
                        </span>
                    </div>

                    <form onSubmit={handleAssignBatchDeliverySubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                        {/* 1. PILIH SUPIR / DRIVER */}
                        <div>
                            <label className="text-slate-700 block mb-1.5 font-bold">1. Supir / Driver Armada:</label>
                            <select
                                value={dispatchDriverInput}
                                onChange={e => setDispatchDriverInput(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-[#1b68b0] focus:ring-1 focus:ring-[#1b68b0] cursor-pointer"
                            >
                                <option value="Pak Budi (Supir Utama DC)">Pak Budi (Supir Utama DC)</option>
                                <option value="Pak Mulyadi (Driver Engkel)">Pak Mulyadi (Driver Engkel)</option>
                                <option value="Pak Asep (Driver L300)">Pak Asep (Driver Pick Up)</option>
                                <option value="Pak Hendra (Driver Subcon)">Pak Hendra (Driver Subcon)</option>
                            </select>
                        </div>

                        {/* 2. PILIH KENDARAAN & PLAT */}
                        <div>
                            <label className="text-slate-700 block mb-1.5 font-bold">2. Jenis & No. Plat Mobil:</label>
                            <select
                                value={dispatchVehicleInput}
                                onChange={e => setDispatchVehicleInput(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-[#1b68b0] focus:ring-1 focus:ring-[#1b68b0] cursor-pointer"
                            >
                                <option value="Engkel Box (D 8472 AB)">Engkel Box (D 8472 AB)</option>
                                <option value="Pick Up L300 (D 8192 XY)">Pick Up L300 (D 8192 XY)</option>
                                <option value="Truck Engkel Long (D 8011 GH)">Truck Engkel Long (D 8011 GH)</option>
                                <option value="Armada Subcon (B 9920 FK)">Armada Subcon (B 9920 FK)</option>
                            </select>
                        </div>

                        {/* 3. CATATAN INTRO PENGIRIMAN */}
                        <div>
                            <label className="text-slate-700 block mb-1.5 font-bold">3. Catatan Rute / Instruksi Supir:</label>
                            <input
                                type="text"
                                value={dispatchNotesInput}
                                onChange={e => setDispatchNotesInput(e.target.value)}
                                placeholder="Contoh: Dahulukan Alamat Antapani sebelum jam 12..."
                                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:border-[#1b68b0] focus:ring-1 focus:ring-[#1b68b0]"
                            />
                        </div>

                        {/* 4. SUBMIT BATCH ASSIGNMENT */}
                        <div className="flex flex-col justify-end">
                            <button
                                type="submit"
                                disabled={selectedBatchOrderIds.length === 0}
                                className={`w-full font-bold px-4 py-2.5 rounded-xl text-xs shadow-xs flex items-center justify-center gap-2 transition ${
                                    selectedBatchOrderIds.length > 0
                                        ? 'bg-[#1b68b0] hover:bg-[#15528c] text-white cursor-pointer'
                                        : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                }`}
                            >
                                <Send className="w-3.5 h-3.5" />
                                <span>Tugaskan Mobil ({selectedBatchOrderIds.length} Alamat)</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* SECTION DAFTAR TRIP MOBIL AKTIF & RUTE MANIFEST MULTI-STOP */}
            <div className="space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-2">
                    <h3 className="text-base font-black text-[#242222] flex items-center gap-2">
                        <Truck className="w-5 h-5 text-[#1b68b0]" />
                        <span>{userRole === 'driver' ? `Daftar Penugasan Trip Akun Supir: ${userName}` : 'Daftar Trip Armada Mobil & Rute Alamat Tujuan Aktif'}</span>
                    </h3>
                    <div className="flex flex-wrap gap-2 text-xs">
                        {userRole === 'driver' ? (
                            <span className="bg-blue-50 text-[#1b68b0] border border-blue-200 px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5" /> Akun Supir: {userName}
                            </span>
                        ) : (
                            <>
                                <span className="bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                                    Admin Gudang: Siap Cetak SJ & Gate Pass
                                </span>
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                                    Divisi Supir: Terbit di Tugas Driver
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {(() => {
                    const readyAndShipped = initialOrders.filter(o => o.status === 'pengiriman' || o.status === 'selesai' || o.assigned_driver);
                    const deliveryList = initialDeliveries.length > 0 ? initialDeliveries : readyAndShipped.map(o => ({
                        id: o.id,
                        waybill_number: 'SJ-' + (o.spo_number || o.id),
                        trip_code: o.trip_code || ('TRIP-DEMO-' + o.id),
                        order: o,
                        driver_name: o.assigned_driver || o.driver_name || '',
                        vehicle_plate: o.assigned_vehicle || 'Engkel Box (D 8472 AB)',
                        waybill_color: o.payment_status === 'Lunas' ? 'Putih' : 'Merah',
                        delivery_status: o.status === 'selesai' ? 'Selesai Terkirim' : 'Dalam Pengiriman'
                    }));

                    const grouped = {};
                    deliveryList.forEach(d => {
                        const key = d.trip_code || ((d.driver_name || 'Unassigned') + '_' + (d.vehicle_plate || 'Armada'));
                        if (!grouped[key]) {
                            grouped[key] = {
                                trip_code: d.trip_code || key,
                                driver_name: d.driver_name || 'Belum Ditugaskan',
                                vehicle_plate: d.vehicle_plate || 'Engkel Box (D 8472 AB)',
                                deliveries: [],
                                orders: []
                            };
                        }
                        grouped[key].deliveries.push(d);
                        const ord = d.order || d;
                        if (ord && !grouped[key].orders.find(o => o.id === ord.id)) {
                            grouped[key].orders.push(ord);
                        }
                    });

                    let trips = Object.values(grouped);

                    if (userRole === 'driver') {
                        trips = trips.filter(t => isDriverMatch(t.driver_name, userName));
                    }

                    if (trips.length === 0) {
                        return (
                            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 shadow-xs">
                                {userRole === 'driver' 
                                    ? `Belum ada trip pengiriman yang ditugaskan untuk ${userName}. Silakan konfirmasi ke Admin Gudang.`
                                    : 'Belum ada trip pengiriman aktif. Silakan centang alamat pada tabel di bawah untuk menugaskan armada!'}
                            </div>
                        );
                    }

                    return (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {trips.map((trip, idx) => (
                                <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 relative">
                                    <div className="flex flex-wrap justify-between items-start border-b border-slate-100 pb-3 gap-2">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="bg-blue-50 text-[#1b68b0] font-mono font-black text-xs px-2.5 py-0.5 rounded-md border border-blue-200">
                                                    {trip.trip_code}
                                                </span>
                                                <h4 className="font-extrabold text-[#242222] text-sm flex items-center gap-1.5">
                                                    <User className="w-3.5 h-3.5 text-slate-500" />
                                                    <span>{trip.driver_name}</span>
                                                </h4>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {trip.vehicle_plate} — <strong className="text-[#1b68b0]">{trip.orders.length} Alamat Tujuan</strong>
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 justify-end">
                                            <button
                                                onClick={() => {
                                                    setSelectedBatchWaybillTrip(trip);
                                                    setShowBatchWaybillModal(true);
                                                }}
                                                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                            >
                                                <Printer className="w-3.5 h-3.5 text-[#1b68b0]" /> Cetak Semua SJ
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedTripDataForModal(trip);
                                                    setShowMultiAddressModal(true);
                                                }}
                                                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                            >
                                                <FileText className="w-3.5 h-3.5 text-cyan-600" /> Manifest Rute
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedBarangKeluarData({
                                                        orders: trip.orders,
                                                        sbk_number: 'SBK/' + (trip.trip_code.replace('TRIP-', '')),
                                                        driver: trip.driver_name,
                                                        vehicle: trip.vehicle_plate,
                                                        trip_code: trip.trip_code,
                                                        date: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
                                                    });
                                                    setShowBarangKeluarModal(true);
                                                }}
                                                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                            >
                                                <ClipboardList className="w-3.5 h-3.5 text-[#70b03c]" /> Gate Pass
                                            </button>
                                        </div>
                                    </div>

                                    {/* TIMELINE STOP DESTINATIONS */}
                                    <div className="space-y-2 text-xs">
                                        {trip.orders.map((ord, stopIdx) => {
                                            const isLunas = ord.payment_status === 'Lunas';
                                            return (
                                                <div key={ord.id} className="flex items-start gap-2.5 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
                                                    <span className="bg-[#1b68b0]/10 text-[#1b68b0] border border-[#1b68b0]/20 text-[10px] font-black px-2 py-0.5 rounded-md shrink-0 mt-0.5">
                                                        STOP #{stopIdx + 1}
                                                    </span>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-center gap-2">
                                                            <span className="font-bold text-[#242222] truncate">
                                                                SPO: {ord.spo_number} — {ord.customer_name}
                                                            </span>
                                                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold shrink-0 ${isLunas ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                                                                {isLunas ? 'LUNAS' : 'COD'}
                                                            </span>
                                                        </div>
                                                        <p className="text-slate-500 text-[11px] truncate mt-1 flex items-center gap-1">
                                                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                                            <span>{ord.customer_address || '-'} ({ord.customer_phone})</span>
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => { setSelectedWaybillOrder(ord); setShowWaybillModal(true); }}
                                                        className="bg-white hover:bg-slate-100 text-[#1b68b0] border border-slate-200 px-2.5 py-1 rounded-lg text-[11px] font-bold transition shrink-0 cursor-pointer shadow-2xs flex items-center gap-1"
                                                        title="Cetak Surat Jalan khusus Alamat Ini"
                                                    >
                                                        <Printer className="w-3 h-3" /> SJ
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                })()}
            </div>

            {/* TABEL PILIHAN SPO & ALAMAT PENGIRIMAN */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-100 pb-3">
                    <div>
                        <h3 className="text-sm font-black text-[#242222]">
                            Daftar Order SPO Siap Kirim & Pilihan Alamat Tujuan
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">Centang kotak pada sebelah kiri nomor SPO untuk memilih beberapa alamat sekaligus yang akan dikirim armada.</p>
                    </div>
                    <button
                        type="button"
                        onClick={toggleSelectAllReadyOrders}
                        className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shadow-2xs flex items-center gap-1.5"
                    >
                        {selectedBatchOrderIds.length > 0 ? (
                            <>
                                <XSquare className="w-3.5 h-3.5 text-rose-500" /> Batal Pilih Semua
                            </>
                        ) : (
                            <>
                                <CheckSquare className="w-3.5 h-3.5 text-[#1b68b0]" /> Pilih Semua Order
                            </>
                        )}
                    </button>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50/80 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-200">
                            <tr>
                                <th className="p-3 w-10 text-center">Pilih</th>
                                <th className="p-3">Nomor SPO</th>
                                <th className="p-3">Customer & Telp</th>
                                <th className="p-3">Alamat Tujuan Pengiriman</th>
                                <th className="p-3">Spesifikasi Barang Kaca</th>
                                <th className="p-3">Supir & Mobil</th>
                                <th className="p-3">Status Pembayaran</th>
                                <th className="p-3 text-center">Dokumen</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {(() => {
                                const tableOrders = initialOrders
                                    .filter(o => o.status === 'pengiriman' || o.status === 'pengerjaan' || o.status === 'selesai')
                                    .filter(o => userRole !== 'driver' || isDriverMatch(o.assigned_driver || o.driver_name, userName));

                                if (tableOrders.length === 0) {
                                    return (
                                        <tr>
                                            <td colSpan="8" className="p-8 text-center text-slate-400 italic">
                                                {userRole === 'driver'
                                                    ? `Belum ada order pengiriman yang ditugaskan oleh Admin Toko untuk supir ${userName}.`
                                                    : 'Belum ada order SPO yang siap kirim.'}
                                            </td>
                                        </tr>
                                    );
                                }

                                return tableOrders.map(ord => {
                                    const isSelected = selectedBatchOrderIds.includes(ord.id);
                                    const itemsList = Array.isArray(ord.items) && ord.items.length > 0
                                        ? ord.items
                                        : [{
                                            glass_type: ord.glass_type || 'Kaca Cermin 5 mm',
                                            length_cm: ord.length_cm || 150,
                                            width_cm: ord.width_cm || 120,
                                            thickness_mm: ord.thickness_mm || 5,
                                            qty: ord.qty || 1
                                        }];

                                    const isLunas = ord.payment_status === 'Lunas';

                                    return (
                                        <tr key={ord.id} className={`transition ${isSelected ? 'bg-blue-50/60 border-l-4 border-l-[#1b68b0]' : 'hover:bg-slate-50/70'}`}>
                                            <td className="p-3 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelectOrderForBatch(ord.id)}
                                                    className="w-4 h-4 rounded text-[#1b68b0] focus:ring-[#1b68b0] border-slate-300 cursor-pointer"
                                                />
                                            </td>

                                            <td className="p-3">
                                                <div className="font-extrabold text-[#1b68b0] font-mono text-xs">
                                                    {ord.spo_number}
                                                </div>
                                                {ord.trip_code && (
                                                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                                        Trip: {ord.trip_code}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="p-3">
                                                <div className="font-bold text-[#242222]">{ord.customer_name}</div>
                                                <div className="text-[11px] text-slate-500 font-mono mt-0.5">{ord.customer_phone}</div>
                                            </td>

                                            <td className="p-3 max-w-xs">
                                                <div className="text-xs text-slate-600 font-medium leading-snug line-clamp-2" title={ord.customer_address}>
                                                    {ord.customer_address || 'Alamat lokasi pengiriman'}
                                                </div>
                                            </td>

                                            <td className="p-3 space-y-1 max-w-xs">
                                                {itemsList.map((it, idx) => (
                                                    <div key={idx} className="bg-slate-50 p-1.5 rounded-lg border border-slate-200 text-xs flex justify-between gap-2">
                                                        <span className="font-semibold text-slate-700 truncate">#{idx + 1}. {it.glass_type}</span>
                                                        <span className="font-mono text-[#242222] font-bold text-[11px] shrink-0">{it.qty || 1} Pcs</span>
                                                    </div>
                                                ))}
                                            </td>

                                            <td className="p-3">
                                                {ord.assigned_driver ? (
                                                    <>
                                                        <div className="font-bold text-[#242222] text-xs">
                                                            {ord.assigned_driver}
                                                        </div>
                                                        <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                                                            {ord.assigned_vehicle}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-bold inline-block">
                                                        Belum Ditugaskan
                                                    </span>
                                                )}
                                            </td>

                                            <td className="p-3">
                                                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold inline-block ${isLunas ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                                                    {isLunas ? 'LUNAS (SJ Putih)' : 'COD (SJ Merah)'}
                                                </span>
                                            </td>

                                            <td className="p-3 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => { setSelectedWaybillOrder(ord); setShowWaybillModal(true); }}
                                                    className="bg-blue-50 hover:bg-blue-100 text-[#1b68b0] border border-blue-200 px-2.5 py-1 rounded-lg text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                                                >
                                                    <Printer className="w-3.5 h-3.5" /> Cetak SJ
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                });
                            })()}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
