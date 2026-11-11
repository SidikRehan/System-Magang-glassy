import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
    Truck, X, Send, Loader2, Edit3, FileText, Calendar, 
    CheckCircle2, AlertCircle, MapPin, User, Phone, ArrowRightLeft, Trash2, RotateCcw 
} from 'lucide-react';
import { formatIndonesianDate } from '@/Utils/dashboardHelpers';

const FLEET_VEHICLES = [
    { plate: 'Engkel Box (D 8472 AB)', defaultDriver: 'Pak Budi (Supir Utama DC)' },
    { plate: 'Truck Engkel Long (D 8011 GH)', defaultDriver: 'Pak Mulyadi (Driver Engkel)' },
    { plate: 'Pick Up L300 (D 8192 XY)', defaultDriver: 'Pak Asep (Driver L300)' },
    { plate: 'Armada Subcon (B 9920 FK)', defaultDriver: 'Pak Hendra (Driver Subcon)' },
];

const DRIVER_OPTIONS = [
    'Pak Budi (Supir Utama DC)',
    'Pak Mulyadi (Driver Engkel)',
    'Pak Asep (Driver L300)',
    'Pak Hendra (Driver Subcon)',
];

export default function EditTripModal({
    show,
    onClose,
    trip,
    driver,
    setDriver,
    vehicle,
    setVehicle,
    deliveryDate,
    setDeliveryDate,
    notes,
    setNotes,
    handleSubmit,
    isSubmitting = false,
    allTrips = []
}) {
    const [orderDrafts, setOrderDrafts] = useState([]);
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    const getTripDateNormalized = (t) => {
        const raw = t?.delivery_date || t?.orders?.[0]?.delivery_date || t?.deliveries?.[0]?.delivery_date;
        if (!raw) return '';
        return String(raw).split('T')[0];
    };

    useEffect(() => {
        if (show && trip && Array.isArray(trip.orders)) {
            const initDrafts = trip.orders.map(ord => ({
                id: ord.id,
                spo_number: ord.spo_number,
                payment_status: ord.payment_status,
                customer_name: ord.customer_name || '',
                customer_phone: ord.customer_phone || '',
                customer_address: ord.customer_address || '',
                action: 'keep', // 'keep' | 'move_vehicle' | 'unassign'
                target_vehicle: trip.vehicle_plate || 'Engkel Box (D 8472 AB)',
                target_driver: trip.driver_name || 'Pak Budi (Supir Utama DC)',
                target_date: getTripDateNormalized(trip) || new Date().toISOString().split('T')[0],
            }));
            setOrderDrafts(initDrafts);
            setExpandedOrderId(initDrafts.length === 1 ? initDrafts[0].id : null);
        }
    }, [show, trip]);

    const updateOrderDraft = (orderId, patch) => {
        setOrderDrafts(prev => prev.map(item => item.id === orderId ? { ...item, ...patch } : item));
    };

    const availabilityByVehicle = useMemo(() => {
        const targetDate = deliveryDate ? String(deliveryDate).split('T')[0] : '';
        const map = {};
        FLEET_VEHICLES.forEach(v => {
            const otherTripsOnDate = (allTrips || []).filter(t => {
                if (t.trip_code === trip?.trip_code) return false;
                const tDate = getTripDateNormalized(t);
                const hasActiveOrders = Array.isArray(t.orders) && t.orders.some(o => o.status !== 'selesai');
                return t.vehicle_plate === v.plate && tDate === targetDate && hasActiveOrders;
            });
            map[v.plate] = {
                isBusy: otherTripsOnDate.length > 0,
                trips: otherTripsOnDate,
                totalStops: otherTripsOnDate.reduce((acc, t) => acc + (t.orders?.length || 0), 0),
                assignedDriver: otherTripsOnDate[0]?.driver_name || v.defaultDriver
            };
        });
        return map;
    }, [allTrips, deliveryDate, trip]);

    if (!show || !trip) return null;

    const currentVehicleStatus = availabilityByVehicle[vehicle];
    const keptCount = orderDrafts.filter(d => d.action === 'keep').length;
    const movedCount = orderDrafts.filter(d => d.action === 'move_vehicle').length;
    const unassignedCount = orderDrafts.filter(d => d.action === 'unassign').length;

    const onFormSubmit = (e) => {
        e.preventDefault();
        handleSubmit(e, orderDrafts);
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-800 relative">
                {/* LOADING BLUR OVERLAY FOR SMOOTH SUBMISSION */}
                {isSubmitting && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-xs z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
                        <div className="bg-white p-5 rounded-3xl shadow-2xl border border-slate-200 flex flex-col items-center gap-3 max-w-xs">
                            <div className="w-12 h-12 rounded-2xl bg-[#1b68b0]/10 flex items-center justify-center text-[#1b68b0]">
                                <Loader2 className="w-6 h-6 animate-spin text-[#1b68b0]" />
                            </div>
                            <div>
                                <h4 className="font-bold text-[#242222] text-sm">
                                    Memperbarui Trip & Alamat Kiriman...
                                </h4>
                                <p className="text-xs text-slate-500 font-mono mt-1">
                                    Menyimpan perubahan rute, alamat tujuan, & alokasi mobil.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL HEADER */}
                <div className="flex justify-between items-center border-b border-slate-200 pb-3.5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-[#1b68b0]/10 flex items-center justify-center text-[#1b68b0]">
                            <Edit3 className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#242222] text-base flex items-center gap-2">
                                Edit Trip, Alamat Kiriman & Pindah Mobil Armada
                            </h3>
                            <p className="text-xs text-[#1b68b0] font-mono font-bold">
                                {trip.trip_code} ({orderDrafts.length} Alamat Tujuan)
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

                {/* FORM */}
                <form onSubmit={onFormSubmit} className="space-y-4 text-xs">
                    {/* SECTION 1: DAFTAR ALAMAT / SPO DALAM TRIP INI (BISA EDIT ALAMAT ATAU PINDAH MOBIL PER SPO) */}
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <div className="font-extrabold text-[#242222] text-xs flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4 text-[#1b68b0]" />
                                    <span>1. Daftar Alamat & Order SPO Dalam Trip Ini ({orderDrafts.length} Alamat):</span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    Klik <strong>"Edit Alamat / Pindah Mobil"</strong> pada alamat tertentu jika salah input alamat atau ingin memindahkan 1 alamat ke mobil lain.
                                </p>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold">
                                <span className="bg-blue-50 text-[#1b68b0] border border-blue-200 px-2 py-0.5 rounded-full">
                                    Tetap di Trip: {keptCount}
                                </span>
                                {movedCount > 0 && (
                                    <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full">
                                        Pindah Mobil: {movedCount}
                                    </span>
                                )}
                                {unassignedCount > 0 && (
                                    <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full">
                                        Keluarkan: {unassignedCount}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                            {orderDrafts.map((item, idx) => {
                                const isExpanded = expandedOrderId === item.id;
                                const isMoved = item.action === 'move_vehicle';
                                const isUnassigned = item.action === 'unassign';

                                return (
                                    <div 
                                        key={item.id || idx} 
                                        className={`rounded-xl border transition p-3 space-y-2.5 ${
                                            isUnassigned
                                                ? 'bg-rose-50/50 border-rose-300'
                                                : isMoved
                                                    ? 'bg-amber-50/60 border-amber-300'
                                                    : 'bg-white border-slate-200'
                                        }`}
                                    >
                                        {/* TOP ROW SUMMARY */}
                                        <div className="flex flex-wrap justify-between items-start gap-2">
                                            <div className="flex items-start gap-2 min-w-0 flex-1">
                                                <span className="bg-[#1b68b0]/10 text-[#1b68b0] font-mono font-black text-[10px] px-2 py-0.5 rounded-md shrink-0 mt-0.5">
                                                    STOP #{idx + 1}
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        <span className="font-extrabold text-[#242222] text-xs">
                                                            SPO: {item.spo_number} — {item.customer_name}
                                                        </span>
                                                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold shrink-0 ${
                                                            item.payment_status === 'Lunas' 
                                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                                                        }`}>
                                                            {item.payment_status === 'Lunas' ? 'LUNAS' : 'COD'}
                                                        </span>
                                                        {isMoved && (
                                                            <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.2 rounded-md flex items-center gap-1">
                                                                <ArrowRightLeft className="w-3 h-3 text-amber-700" />
                                                                <span>Dipindah ke: {item.target_vehicle}</span>
                                                            </span>
                                                        )}
                                                        {isUnassigned && (
                                                            <span className="text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.2 rounded-md">
                                                                Dikeluarkan dari Trip
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                                                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                                        <span className="truncate">{item.customer_address || '-'} ({item.customer_phone || '-'})</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => setExpandedOrderId(isExpanded ? null : item.id)}
                                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition flex items-center gap-1 cursor-pointer ${
                                                        isExpanded
                                                            ? 'bg-[#1b68b0] text-white border-[#1b68b0]'
                                                            : 'bg-slate-100 hover:bg-blue-50 text-[#1b68b0] border-slate-200'
                                                    }`}
                                                >
                                                    <Edit3 className="w-3 h-3" />
                                                    <span>{isExpanded ? 'Tutup Edit' : 'Edit Alamat / Pindah Mobil'}</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* EXPANDED EDITOR FOR THIS SPECIFIC ORDER / ADDRESS */}
                                        {isExpanded && (
                                            <div className="pt-2.5 border-t border-slate-200/80 space-y-3 bg-slate-50/80 p-3 rounded-xl">
                                                {/* SUB-SECTION A: EDIT ALAMAT, NAMA PENERIMA, NO HP */}
                                                <div className="space-y-2">
                                                    <div className="font-bold text-[#242222] text-[11px] flex items-center gap-1.5">
                                                        <MapPin className="w-3.5 h-3.5 text-[#1b68b0]" />
                                                        <span>Koreksi Alamat Pengiriman & Kontak Penerima (SPO #{item.spo_number}):</span>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        <div>
                                                            <label className="text-[10px] font-bold text-slate-600 flex items-center gap-1 mb-0.5">
                                                                <User className="w-3 h-3 text-slate-400" /> Nama Customer / Penerima:
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={item.customer_name}
                                                                onChange={e => updateOrderDraft(item.id, { customer_name: e.target.value })}
                                                                placeholder="Nama penerima..."
                                                                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:border-[#1b68b0]"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-bold text-slate-600 flex items-center gap-1 mb-0.5">
                                                                <Phone className="w-3 h-3 text-slate-400" /> Nomor HP / WhatsApp:
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={item.customer_phone}
                                                                onChange={e => updateOrderDraft(item.id, { customer_phone: e.target.value })}
                                                                placeholder="08xx-xxxx-xxxx"
                                                                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:border-[#1b68b0]"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-600 flex items-center gap-1 mb-0.5">
                                                            <MapPin className="w-3 h-3 text-slate-400" /> Alamat Lengkap Tujuan Pengiriman:
                                                        </label>
                                                        <textarea
                                                            rows={2}
                                                            value={item.customer_address}
                                                            onChange={e => updateOrderDraft(item.id, { customer_address: e.target.value })}
                                                            placeholder="Masukkan alamat lengkap tujuan pengiriman..."
                                                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:border-[#1b68b0]"
                                                        />
                                                    </div>
                                                </div>

                                                {/* SUB-SECTION B: STATUS PENUGASAN MOBIL KHUSUS ALAMAT INI */}
                                                <div className="space-y-2 pt-2 border-t border-slate-200">
                                                    <div className="font-bold text-[#242222] text-[11px] flex items-center gap-1.5">
                                                        <ArrowRightLeft className="w-3.5 h-3.5 text-[#1b68b0]" />
                                                        <span>Pengaturan Mobil Armada Khusus Alamat SPO #{item.spo_number}:</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => updateOrderDraft(item.id, { action: 'keep' })}
                                                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition flex items-center gap-1 cursor-pointer ${
                                                                item.action === 'keep'
                                                                    ? 'bg-[#1b68b0] text-white border-[#1b68b0]'
                                                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                                                            }`}
                                                        >
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            <span>Tetap di Trip Ini</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const otherFleet = FLEET_VEHICLES.find(f => f.plate !== vehicle) || FLEET_VEHICLES[0];
                                                                updateOrderDraft(item.id, {
                                                                    action: 'move_vehicle',
                                                                    target_vehicle: item.target_vehicle !== vehicle ? item.target_vehicle : otherFleet.plate,
                                                                    target_driver: item.target_vehicle !== vehicle ? item.target_driver : otherFleet.defaultDriver,
                                                                    target_date: deliveryDate || item.target_date,
                                                                });
                                                            }}
                                                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition flex items-center gap-1 cursor-pointer ${
                                                                item.action === 'move_vehicle'
                                                                    ? 'bg-amber-600 text-white border-amber-600'
                                                                    : 'bg-white text-amber-800 border-amber-300 hover:bg-amber-50'
                                                            }`}
                                                        >
                                                            <ArrowRightLeft className="w-3 h-3" />
                                                            <span>Pindahkan Alamat Ini ke Mobil Lain</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => updateOrderDraft(item.id, { action: 'unassign' })}
                                                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition flex items-center gap-1 cursor-pointer ${
                                                                item.action === 'unassign'
                                                                    ? 'bg-rose-600 text-white border-rose-600'
                                                                    : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
                                                            }`}
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                            <span>Keluarkan dari Trip (Batal Kirim)</span>
                                                        </button>
                                                    </div>

                                                    {/* TARGET VEHICLE & DRIVER SELECTOR WHEN MOVING SINGLE ORDER */}
                                                    {item.action === 'move_vehicle' && (
                                                        <div className="bg-amber-50/90 border border-amber-300 rounded-xl p-2.5 space-y-2 mt-1.5">
                                                            <div className="text-[11px] font-bold text-amber-900">
                                                                Pilih Mobil Tujuan Baru untuk SPO #{item.spo_number} ({item.customer_name}):
                                                            </div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                <div>
                                                                    <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Mobil Armada Tujuan:</label>
                                                                    <select
                                                                        value={item.target_vehicle}
                                                                        onChange={e => {
                                                                            const chosenPlate = e.target.value;
                                                                            const matched = FLEET_VEHICLES.find(f => f.plate === chosenPlate);
                                                                            updateOrderDraft(item.id, {
                                                                                target_vehicle: chosenPlate,
                                                                                target_driver: matched?.defaultDriver || item.target_driver
                                                                            });
                                                                        }}
                                                                        className="w-full bg-white border border-amber-300 rounded-lg p-1.5 text-xs text-slate-800 font-bold"
                                                                    >
                                                                        {FLEET_VEHICLES.map(v => {
                                                                            const st = availabilityByVehicle[v.plate];
                                                                            return (
                                                                                <option key={v.plate} value={v.plate}>
                                                                                    {v.plate} {st?.isBusy ? `(${st.totalStops} Alamat)` : '(Tersedia)'}
                                                                                </option>
                                                                            );
                                                                        })}
                                                                    </select>
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Supir Mobil Tujuan:</label>
                                                                    <select
                                                                        value={item.target_driver}
                                                                        onChange={e => updateOrderDraft(item.id, { target_driver: e.target.value })}
                                                                        className="w-full bg-white border border-amber-300 rounded-lg p-1.5 text-xs text-slate-800 font-bold"
                                                                    >
                                                                        {DRIVER_OPTIONS.map(drv => (
                                                                            <option key={drv} value={drv}>{drv}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <p className="text-[10px] text-amber-800">
                                                                Alamat ini akan dipindahkan ke <strong>{item.target_vehicle}</strong> ({item.target_driver}). Jika mobil tersebut sudah memiliki rute jalan di tanggal yang sama, alamat ini otomatis digabungkan ke trip mobil tersebut.
                                                            </p>
                                                        </div>
                                                    )}

                                                    {item.action === 'unassign' && (
                                                        <div className="bg-rose-50 border border-rose-200 rounded-xl p-2 text-[11px] text-rose-800 flex items-center justify-between gap-2">
                                                            <span>Order SPO #{item.spo_number} akan dikeluarkan dari trip dan kembali ke daftar <strong>Belum Dapat Supir</strong>.</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => updateOrderDraft(item.id, { action: 'keep' })}
                                                                className="bg-white border border-rose-300 text-rose-700 px-2 py-0.5 rounded font-bold text-[10px] shrink-0 flex items-center gap-1 cursor-pointer"
                                                            >
                                                                <RotateCcw className="w-2.5 h-2.5" /> Batalkan
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* SECTION 2: PENGATURAN UTAMA TRIP INI (JIKA INGIN GANTI MOBIL / SUPIR / TANGGAL UNTUK SELURUH TRIP) */}
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-3">
                        <div className="font-extrabold text-[#242222] text-xs flex items-center gap-1.5 border-b border-slate-100 pb-2">
                            <Truck className="w-4 h-4 text-[#1b68b0]" />
                            <span>2. Pengaturan Armada & Jadwal Utama untuk Trip {trip.trip_code}:</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-slate-700 font-bold flex items-center gap-1.5 mb-1">
                                    <Calendar className="w-3.5 h-3.5 text-[#1b68b0]" />
                                    <span>Tanggal Pengiriman Trip:</span>
                                </label>
                                <input 
                                    type="date"
                                    value={deliveryDate || ''} 
                                    onChange={e => setDeliveryDate(e.target.value)} 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-[#1b68b0] focus:bg-white cursor-pointer"
                                />
                            </div>

                            <div>
                                <label className="text-slate-700 block mb-1 font-bold">Driver / Supir Armada Trip:</label>
                                <select 
                                    value={driver} 
                                    onChange={e => setDriver(e.target.value)} 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-[#1b68b0] focus:bg-white cursor-pointer"
                                >
                                    <option value="Pak Budi (Supir Utama DC)">Pak Budi (Supir Utama DC)</option>
                                    <option value="Pak Mulyadi (Driver Engkel)">Pak Mulyadi (Driver Engkel)</option>
                                    <option value="Pak Asep (Driver L300)">Pak Asep (Driver Pick Up)</option>
                                    <option value="Pak Hendra (Driver Subcon)">Pak Hendra (Driver Subcon)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-slate-700 block mb-1 font-bold">Jenis & No. Plat Mobil Utama Trip Ini:</label>
                            <select 
                                value={vehicle} 
                                onChange={e => {
                                    const selectedPlate = e.target.value;
                                    setVehicle(selectedPlate);
                                    const matchedFleet = FLEET_VEHICLES.find(f => f.plate === selectedPlate);
                                    if (matchedFleet?.defaultDriver) {
                                        setDriver(matchedFleet.defaultDriver);
                                    }
                                }} 
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-[#1b68b0] focus:bg-white cursor-pointer"
                            >
                                {FLEET_VEHICLES.map(v => {
                                    const st = availabilityByVehicle[v.plate];
                                    return (
                                        <option key={v.plate} value={v.plate}>
                                            {v.plate} — {st?.isBusy ? `[TERJADWAL TRIP LAIN: ${st.totalStops} Alamat]` : '[TERSEDIA / KOSONG]'}
                                        </option>
                                    );
                                })}
                            </select>
                            {currentVehicleStatus && (
                                <div className={`mt-2 p-2.5 rounded-xl border text-[11px] flex items-start gap-2 ${
                                    currentVehicleStatus.isBusy 
                                        ? 'bg-amber-50 border-amber-200 text-amber-800' 
                                        : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                }`}>
                                    {currentVehicleStatus.isBusy ? (
                                        <>
                                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                            <div>
                                                <div className="font-bold">Mobil Memiliki Trip Lain pada {formatIndonesianDate(deliveryDate)}</div>
                                                <p className="text-[10px] mt-0.5 text-amber-700">
                                                    Armada ini juga dijadwalkan pada trip lain ({currentVehicleStatus.totalStops} alamat) dengan supir <strong>{currentVehicleStatus.assignedDriver}</strong>.
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                            <div>
                                                <div className="font-bold">Mobil Tersedia pada {formatIndonesianDate(deliveryDate)}</div>
                                                <p className="text-[10px] mt-0.5 text-emerald-700">
                                                    Tidak ada bentrok jadwal trip lain untuk armada ini pada tanggal tersebut.
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="text-slate-700 font-bold text-xs flex items-center gap-1.5 mb-1">
                                <FileText className="w-3.5 h-3.5 text-[#1b68b0]" />
                                <span>Catatan Rute & Barang Penunjang Gudang:</span>
                            </label>
                            <textarea 
                                rows={2}
                                value={notes} 
                                onChange={e => setNotes(e.target.value)} 
                                placeholder="cth: Dahulukan pengantaran sebelum jam 12, bawa 2 pcs Kop Kaca dari gudang B..." 
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:border-[#1b68b0] focus:bg-white text-xs" 
                            />
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-semibold cursor-pointer"
                        >
                            Batal
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className={`px-5 py-2.5 font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition ${
                                isSubmitting 
                                    ? 'bg-[#1b68b0]/70 text-white cursor-not-allowed' 
                                    : 'bg-[#1b68b0] hover:bg-[#15528c] text-white cursor-pointer'
                            }`}
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Send className="w-3.5 h-3.5" />
                            )}
                            <span>{isSubmitting ? 'Memproses...' : 'Simpan Perubahan Trip & Alamat'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
