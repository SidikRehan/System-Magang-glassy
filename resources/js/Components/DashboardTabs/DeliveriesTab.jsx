import React, { useState } from 'react';
import { router } from '@inertiajs/react';
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
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
                        🚚 {userRole === 'driver' ? `Pengiriman Saya (${userName})` : 'Penugasan Pengiriman Multi-Alamat & Surat Jalan 4 Warna'}
                    </h2>
                    <p className="text-slate-400 text-sm">
                        {userRole === 'driver' 
                            ? `Daftar penugasan trip & manifest pengiriman alamat konsumen yang ditugaskan khusus untuk akun supir Anda (${userName}).`
                            : 'Admin dapat memilih beberapa alamat/SPO konsumen sekaligus untuk diangkut 1 armada & supir, serta mencetak Rute Manifest Multi-Stop.'}
                    </p>
                </div>
                <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs font-bold text-cyan-400 flex items-center gap-2">
                    <span>🚚 Order Siap / Sedang Kirim:</span>
                    <span className="bg-cyan-500/20 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
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
                        <div className="bg-slate-900/90 border border-rose-500/40 rounded-2xl p-5 shadow-xl relative overflow-hidden flex flex-col justify-between">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
                                        <h3 className="font-extrabold text-slate-100 text-sm flex items-center gap-1.5">
                                            🔴 Tagihan COD Surat Jalan Merah Anda
                                        </h3>
                                    </div>
                                    <span className="text-[11px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-bold">
                                        {myCodOrders.length} Order COD
                                    </span>
                                </div>

                                <div>
                                    <span className="text-xs text-slate-400">Total Uang COD Ditagih di Lapangan:</span>
                                    <div className="text-2xl font-black text-rose-400 font-mono mt-0.5">
                                        Rp {totalPendingCod.toLocaleString('id-ID')}
                                    </div>
                                </div>

                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                    {myCodOrders.length === 0 ? (
                                        <p className="text-xs text-slate-500 italic py-2">Tidak ada tagihan COD aktif untuk rute supir Anda saat ini.</p>
                                    ) : (
                                        myCodOrders.map(ord => {
                                            const sisa = Math.max(0, Number(ord.total_price || 0) - Number(ord.paid_amount || 0));
                                            return (
                                                <div key={ord.id} className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex justify-between items-center text-xs">
                                                    <div>
                                                        <div className="font-bold text-slate-200">#{ord.spo_number} - {ord.customer_name}</div>
                                                        <div className="text-rose-400 font-mono font-bold mt-0.5">Tagihan: Rp {sisa.toLocaleString('id-ID')}</div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleOpenCodModal(ord)}
                                                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition shadow-md flex items-center gap-1 cursor-pointer"
                                                    >
                                                        💵 Setor Kas ke Kasir
                                                    </button>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                            <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-2 mt-3">
                                💡 Serahkan uang tunai pelunasan ke Kasir Toko agar surat jalan merah ditutup dan status order lunas.
                            </div>
                        </div>

                        {/* WIDGET 2: KLAIM BIAYA ARMADA (BBM SOLAR / TOL / PARKIR) */}
                        <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-5 shadow-xl relative overflow-hidden flex flex-col justify-between">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-base">⛽</span>
                                        <h3 className="font-extrabold text-slate-100 text-sm">
                                            Klaim Biaya Armada (BBM Solar & Tol)
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => setShowDriverClaimModal(true)}
                                        className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg text-xs transition shadow-md shadow-amber-400/20 flex items-center gap-1 cursor-pointer"
                                    >
                                        ➕ Ajukan Klaim Baru
                                    </button>
                                </div>

                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                    {myClaims.length === 0 ? (
                                        <p className="text-xs text-slate-500 italic py-2">Belum ada pengajuan klaim BBM / Tol untuk akun Anda.</p>
                                    ) : (
                                        myClaims.map(clm => (
                                            <div key={clm.id} className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex justify-between items-center text-xs">
                                                <div>
                                                    <div className="font-bold text-slate-200">{clm.title}</div>
                                                    <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex flex-wrap items-center gap-2">
                                                        <span className="text-amber-300 font-bold">Rp {Number(clm.amount || 0).toLocaleString('id-ID')}</span>
                                                        <span>• {clm.vehicle_plate || 'Armada'}</span>
                                                        <span>• {clm.transaction_date}</span>
                                                    </div>
                                                    {clm.receipt_photo_path && (() => {
                                                        const pList = getPhotoList(clm.receipt_photo_path);
                                                        if (pList.length === 0) return null;
                                                        return (
                                                            <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                                                {pList.map((p, pIdx) => (
                                                                    <button
                                                                        key={pIdx}
                                                                        type="button"
                                                                        onClick={() => handleOpenSketchLightbox(p, `Struk Nota #${clm.transaction_code} (${pIdx + 1}/${pList.length})`)}
                                                                        className="text-[10px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1 cursor-pointer"
                                                                    >
                                                                        <span>📷 Struk #{pIdx + 1}</span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                                <div>
                                                    {clm.approval_status === 'pending' && (
                                                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                                                            ⏳ Menunggu
                                                        </span>
                                                    )}
                                                    {clm.approval_status === 'approved' && (
                                                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                                                            ✅ Disetujui
                                                        </span>
                                                    )}
                                                    {clm.approval_status === 'rejected' && (
                                                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                                                            ✕ Ditolak
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                            <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-2 mt-3 flex justify-between items-center">
                                <span>Total Klaim Saya: <strong className="text-amber-300">{myClaims.length} Pengajuan</strong></span>
                                <button
                                    onClick={() => setShowDriverClaimModal(true)}
                                    className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                                >
                                    Klaim BBM / Parkir
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* PANEL ATAS: PENUGASAN MULTI-ALAMAT ARMADA (KHUSUS ADMIN TOKO / WMS LOGISTICS, BUKAN DRIVER) */}
            {userRole !== 'driver' && (
                <div className="bg-slate-900/90 border-2 border-cyan-500/40 rounded-2xl p-5 shadow-2xl space-y-4">
                    <div className="flex flex-wrap justify-between items-center border-b border-slate-800 pb-3 gap-2">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping"></span>
                            <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
                                📋 Form Penugasan Rute Mobil Multi-Alamat (Admin Toko / WMS Logistics)
                            </h3>
                        </div>
                        <span className="text-xs bg-cyan-500/10 text-cyan-300 px-3 py-1 rounded-full border border-cyan-500/30 font-bold">
                            Pilih {selectedBatchOrderIds.length} Alamat → Tetapkan Supir & Mobil
                        </span>
                    </div>

                    <form onSubmit={handleAssignBatchDeliverySubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                        {/* 1. PILIH SUPIR / DRIVER */}
                        <div>
                            <label className="text-slate-300 block mb-1 font-bold">1. Pilih Supir / Driver Armada:</label>
                            <select
                                value={dispatchDriverInput}
                                onChange={e => setDispatchDriverInput(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-bold focus:border-cyan-400 cursor-pointer"
                            >
                                <option value="Pak Budi (Supir Utama DC)">👨‍✈️ Pak Budi (Supir Utama DC)</option>
                                <option value="Pak Mulyadi (Driver Engkel)">👨‍✈️ Pak Mulyadi (Driver Engkel)</option>
                                <option value="Pak Asep (Driver L300)">👨‍✈️ Pak Asep (Driver Pick Up)</option>
                                <option value="Pak Hendra (Driver Subcon)">👨‍✈️ Pak Hendra (Driver Subcon)</option>
                            </select>
                        </div>

                        {/* 2. PILIH KENDARAAN & PLAT */}
                        <div>
                            <label className="text-slate-300 block mb-1 font-bold">2. Jenis & No. Plat Mobil:</label>
                            <select
                                value={dispatchVehicleInput}
                                onChange={e => setDispatchVehicleInput(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-bold focus:border-cyan-400 cursor-pointer"
                            >
                                <option value="Engkel Box (D 8472 AB)">🚚 Engkel Box (D 8472 AB)</option>
                                <option value="Pick Up L300 (D 8192 XY)">🛻 Pick Up L300 (D 8192 XY)</option>
                                <option value="Truck Engkel Long (D 8011 GH)">🚛 Truck Engkel Long (D 8011 GH)</option>
                                <option value="Armada Subcon (B 9920 FK)">🚚 Armada Subcon (B 9920 FK)</option>
                            </select>
                        </div>

                        {/* 3. CATATAN INTRO PENGIRIMAN */}
                        <div>
                            <label className="text-slate-300 block mb-1 font-bold">3. Catatan Rute / Instruksi Supir:</label>
                            <input
                                type="text"
                                value={dispatchNotesInput}
                                onChange={e => setDispatchNotesInput(e.target.value)}
                                placeholder="Contoh: Dahulukan Alamat Antapani sebelum jam 12..."
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-cyan-400"
                            />
                        </div>

                        {/* 4. SUBMIT BATCH ASSIGNMENT */}
                        <div className="flex flex-col justify-end">
                            <button
                                type="submit"
                                disabled={selectedBatchOrderIds.length === 0}
                                className={`w-full font-extrabold px-4 py-2.5 rounded-lg text-xs shadow-lg flex items-center justify-center gap-2 transition ${
                                    selectedBatchOrderIds.length > 0
                                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-500/20 cursor-pointer transform hover:-translate-y-0.5'
                                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                                }`}
                            >
                                🚀 Tugaskan Mobil ke {selectedBatchOrderIds.length} Alamat Terpilih
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* SECTION DAFTAR TRIP MOBIL AKTIF & RUTE MANIFEST MULTI-STOP */}
            <div className="space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-2">
                    <h3 className="text-lg font-black text-slate-100 flex items-center gap-2">
                        🚛 {userRole === 'driver' ? `Daftar Penugasan Trip Akun Supir: ${userName}` : 'Daftar Trip Armada Mobil & Rute Alamat Tujuan Aktif'}
                    </h3>
                    <div className="flex flex-wrap gap-2 text-xs">
                        {userRole === 'driver' ? (
                            <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                                👤 Akun Supir Aktif: {userName}
                            </span>
                        ) : (
                            <>
                                <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                                    🏭 Admin Gudang: Siap Cetak SJ 4 Warna & Gate Pass
                                </span>
                                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                                    🚚 Divisi Supir: Terbit di Tugas Pengiriman Driver
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
                            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
                                {userRole === 'driver' 
                                    ? `Belum ada trip pengiriman yang ditugaskan untuk ${userName}. Silakan konfirmasi ke Admin Gudang.`
                                    : 'Belum ada trip pengiriman aktif. Silakan centang alamat pada tabel di bawah untuk menugaskan armada!'}
                            </div>
                        );
                    }

                    return (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {trips.map((trip, idx) => (
                                <div key={idx} className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-5 shadow-xl space-y-3 relative">
                                    <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="bg-cyan-500/20 text-cyan-300 font-mono font-extrabold text-xs px-2.5 py-0.5 rounded border border-cyan-500/30">
                                                    {trip.trip_code}
                                                </span>
                                                <h4 className="font-extrabold text-slate-100 text-sm">
                                                    👨‍✈️ {trip.driver_name}
                                                </h4>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                🚚 {trip.vehicle_plate} — <strong className="text-cyan-400">{trip.orders.length} Alamat Tujuan</strong>
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 justify-end">
                                            <button
                                                onClick={() => {
                                                    setSelectedBatchWaybillTrip(trip);
                                                    setShowBatchWaybillModal(true);
                                                }}
                                                className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                            >
                                                🖨️ Cetak Semua SJ Trip
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedTripDataForModal(trip);
                                                    setShowMultiAddressModal(true);
                                                }}
                                                className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                            >
                                                🖨️ Manifest Rute Multi-Alamat
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
                                                className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                            >
                                                📋 Gate Pass Mobil
                                            </button>
                                        </div>
                                    </div>

                                    {/* TIMELINE STOP DESTINATIONS */}
                                    <div className="space-y-2 text-xs">
                                        {trip.orders.map((ord, stopIdx) => {
                                            const isLunas = ord.payment_status === 'Lunas';
                                            return (
                                                <div key={ord.id} className="flex items-start gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                                                    <span className="bg-cyan-950 text-cyan-300 border border-cyan-700/50 text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 mt-0.5">
                                                        STOP #{stopIdx + 1}
                                                    </span>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-center gap-2">
                                                            <span className="font-extrabold text-slate-200 truncate">
                                                                SPO: {ord.spo_number} — {ord.customer_name}
                                                            </span>
                                                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded shrink-0 font-bold ${isLunas ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                                                                {isLunas ? 'LUNAS' : 'COD'}
                                                            </span>
                                                        </div>
                                                        <p className="text-slate-400 text-[11px] truncate mt-0.5">
                                                            📍 {ord.customer_address || '-'} ({ord.customer_phone})
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => { setSelectedWaybillOrder(ord); setShowWaybillModal(true); }}
                                                        className="bg-slate-800 hover:bg-slate-700 text-cyan-300 px-2 py-1 rounded text-[11px] font-bold transition shrink-0 cursor-pointer"
                                                        title="Cetak Surat Jalan 4 Warna khusus Alamat Ini"
                                                    >
                                                        🖨️ SJ
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
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-800 pb-3">
                    <div>
                        <h3 className="text-base font-extrabold text-slate-100">
                            📦 Daftar Order SPO Siap Kirim & Pilihan Alamat Tujuan
                        </h3>
                        <p className="text-xs text-slate-400">Centang kotak pada sebelah kiri nomor SPO untuk memilih beberapa alamat sekaligus yang akan dikirim mobil.</p>
                    </div>
                    <button
                        type="button"
                        onClick={toggleSelectAllReadyOrders}
                        className="bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                        {selectedBatchOrderIds.length > 0 ? '❌ Batal Pilih Semua' : '☑️ Pilih Semua Order'}
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-800/60 text-slate-400 uppercase text-xs">
                            <tr>
                                <th className="p-3 w-10 text-center">Pilih</th>
                                <th className="p-3">Nomor SPO</th>
                                <th className="p-3">Nama Cust & Telp</th>
                                <th className="p-3">Alamat Tujuan Pengiriman</th>
                                <th className="p-3">Spesifikasi Barang Kaca</th>
                                <th className="p-3">Supir & Mobil Assigned</th>
                                <th className="p-3">Status Payment</th>
                                <th className="p-3 text-center">Aksi Dokumen</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {(() => {
                                const tableOrders = initialOrders
                                    .filter(o => o.status === 'pengiriman' || o.status === 'pengerjaan' || o.status === 'selesai')
                                    .filter(o => userRole !== 'driver' || isDriverMatch(o.assigned_driver || o.driver_name, userName));

                                if (tableOrders.length === 0) {
                                    return (
                                        <tr>
                                            <td colSpan="8" className="p-8 text-center text-slate-500 italic">
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
                                        <tr key={ord.id} className={`transition ${isSelected ? 'bg-cyan-950/40 border-l-4 border-l-cyan-400' : 'hover:bg-slate-800/30'}`}>
                                            <td className="p-3 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelectOrderForBatch(ord.id)}
                                                    className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 bg-slate-950 border-slate-700 cursor-pointer"
                                                />
                                            </td>

                                            <td className="p-3">
                                                <div className="font-extrabold text-cyan-400 font-mono text-sm">
                                                    {ord.spo_number}
                                                </div>
                                                {ord.trip_code && (
                                                    <div className="text-[10px] text-cyan-300 font-mono mt-0.5">
                                                        Trip: {ord.trip_code}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="p-3">
                                                <div className="font-bold text-slate-100">{ord.customer_name}</div>
                                                <div className="text-xs text-cyan-300 font-mono mt-0.5">{ord.customer_phone}</div>
                                            </td>

                                            <td className="p-3 max-w-xs">
                                                <div className="text-xs text-slate-200 font-medium leading-snug line-clamp-2" title={ord.customer_address}>
                                                    📍 {ord.customer_address || 'Alamat lokasi pengiriman'}
                                                </div>
                                            </td>

                                            <td className="p-3 space-y-1 max-w-xs">
                                                {itemsList.map((it, idx) => (
                                                    <div key={idx} className="bg-slate-950/60 p-1.5 rounded border border-slate-800 text-xs flex justify-between gap-2">
                                                        <span className="font-bold text-cyan-300 truncate">#{idx + 1}. {it.glass_type}</span>
                                                        <span className="font-mono text-slate-300 text-[11px] shrink-0">{it.qty || 1} Pcs</span>
                                                    </div>
                                                ))}
                                            </td>

                                            <td className="p-3">
                                                {ord.assigned_driver ? (
                                                    <>
                                                        <div className="font-bold text-slate-100 text-xs">
                                                            👨‍✈️ {ord.assigned_driver}
                                                        </div>
                                                        <div className="text-[11px] text-cyan-300 font-semibold mt-0.5">
                                                            🚚 {ord.assigned_vehicle}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <span className="text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded font-bold inline-block">
                                                        ⏳ Belum Ditugaskan
                                                    </span>
                                                )}
                                            </td>

                                            <td className="p-3">
                                                <span className={`text-xs px-2.5 py-1 rounded-full font-bold inline-block ${isLunas ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
                                                    {isLunas ? 'LUNAS (Surat Jalan Putih)' : 'COD (Surat Jalan Merah)'}
                                                </span>
                                            </td>

                                            <td className="p-3 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => { setSelectedWaybillOrder(ord); setShowWaybillModal(true); }}
                                                    className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-3 py-1.5 rounded-lg text-xs font-extrabold transition inline-flex items-center gap-1 shadow cursor-pointer"
                                                >
                                                    🖨️ Cetak SJ 4 Warna
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
