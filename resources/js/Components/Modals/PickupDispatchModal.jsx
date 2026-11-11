import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { router } from '@inertiajs/react';
import {
    Truck, X, Send, Loader2, FileText, Calendar, CheckCircle2,
    AlertCircle, MapPin, User, Phone, Package, Plus, Trash2, ClipboardList
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

export default function PickupDispatchModal({
    show,
    onClose,
    initialVehicle = 'Engkel Box (D 8472 AB)',
    initialDriver = 'Pak Budi (Supir Utama DC)',
    initialDate = '',
    allTrips = []
}) {
    const [deliveryDate, setDeliveryDate] = useState(() => initialDate || new Date().toISOString().split('T')[0]);
    const [vehicle, setVehicle] = useState(initialVehicle);
    const [driver, setDriver] = useState(initialDriver);
    const [notes, setNotes] = useState('');
    const [mergeExistingTrip, setMergeExistingTrip] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [stops, setStops] = useState([
        {
            location_name: '',
            contact_phone: '',
            address: '',
            item_description: '',
            qty: 1,
            unit: 'Lembar / Pcs'
        }
    ]);

    useEffect(() => {
        if (show) {
            if (initialVehicle) setVehicle(initialVehicle);
            if (initialDriver) setDriver(initialDriver);
            if (initialDate) setDeliveryDate(String(initialDate).split('T')[0]);
            setStops([
                {
                    location_name: '',
                    contact_phone: '',
                    address: '',
                    item_description: '',
                    qty: 1,
                    unit: 'Lembar / Pcs'
                }
            ]);
            setNotes('');
        }
    }, [show, initialVehicle, initialDriver, initialDate]);

    const getTripDateNormalized = (t) => {
        const raw = t?.delivery_date || t?.orders?.[0]?.delivery_date || t?.deliveries?.[0]?.delivery_date;
        if (!raw) return '';
        return String(raw).split('T')[0];
    };

    const availabilityByVehicle = useMemo(() => {
        const targetDate = deliveryDate ? String(deliveryDate).split('T')[0] : '';
        const map = {};
        FLEET_VEHICLES.forEach(v => {
            const tripsOnDate = (allTrips || []).filter(t => {
                const tDate = getTripDateNormalized(t);
                const hasActiveOrders = Array.isArray(t.orders) && t.orders.some(o => o.status !== 'selesai');
                return t.vehicle_plate === v.plate && tDate === targetDate && hasActiveOrders;
            });
            map[v.plate] = {
                isBusy: tripsOnDate.length > 0,
                trips: tripsOnDate,
                totalStops: tripsOnDate.reduce((acc, t) => acc + (t.orders?.length || 0), 0),
                assignedDriver: tripsOnDate[0]?.driver_name || v.defaultDriver
            };
        });
        return map;
    }, [allTrips, deliveryDate]);

    if (!show) return null;

    const currentVehicleStatus = availabilityByVehicle[vehicle];

    const handleAddStop = () => {
        setStops(prev => [
            ...prev,
            {
                location_name: '',
                contact_phone: '',
                address: '',
                item_description: '',
                qty: 1,
                unit: 'Lembar / Pcs'
            }
        ]);
    };

    const handleRemoveStop = (index) => {
        if (stops.length <= 1) return;
        setStops(prev => prev.filter((_, idx) => idx !== index));
    };

    const handleStopChange = (index, field, value) => {
        setStops(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const invalidStop = stops.some(s => !s.location_name.trim() || !s.address.trim() || !s.item_description.trim());
        if (invalidStop) {
            alert('Mohon lengkapi Nama Tempat/Supplier, Alamat Lokasi Pengambilan, dan Rincian Barang yang akan diambil!');
            return;
        }

        setIsSubmitting(true);

        router.post('/deliveries/pickup-order', {
            driver_name: driver,
            vehicle_plate: vehicle,
            delivery_date: deliveryDate,
            notes: notes || 'Perintah pengambilan barang / material ke gudang pabrik.',
            merge_existing_trip: Boolean(currentVehicleStatus?.isBusy && mergeExistingTrip),
            stops: stops
        }, {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
            },
            onError: (errs) => {
                const msg = Object.values(errs || {}).flat().join('\n') || 'Gagal menerbitkan Surat Perintah Pengambilan Barang.';
                alert(msg);
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-800 relative">
                {/* LOADING OVERLAY */}
                {isSubmitting && (
                    <div className="absolute inset-0 bg-white/85 backdrop-blur-xs z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
                        <div className="bg-white p-5 rounded-3xl shadow-2xl border border-slate-200 flex flex-col items-center gap-3 max-w-xs">
                            <div className="w-12 h-12 rounded-2xl bg-[#1b68b0]/10 flex items-center justify-center text-[#1b68b0]">
                                <Loader2 className="w-6 h-6 animate-spin text-[#1b68b0]" />
                            </div>
                            <div>
                                <h4 className="font-bold text-[#242222] text-sm">
                                    Menerbitkan Surat Perintah...
                                </h4>
                                <p className="text-xs text-slate-500 font-mono mt-1">
                                    Menjadwalkan armada untuk tugas pengambilan barang.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* HEADER MODAL */}
                <div className="flex justify-between items-center border-b border-slate-200 pb-3.5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-[#1b68b0]/10 flex items-center justify-center text-[#1b68b0]">
                            <ClipboardList className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#242222] text-base">
                                Buat Surat Perintah Pengambilan Barang (Mobil Kosong / Ambil Barang)
                            </h3>
                            <p className="text-xs text-slate-500">
                                Tugaskan armada menganggur/standby untuk mengambil barang dari Alamat A, Supplier, atau Lokasi Proyek.
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

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    {/* SECTION 1: PILIH MOBIL & SUPIR YANG DITUGASKAN */}
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                        <div className="font-extrabold text-[#242222] text-xs flex items-center gap-1.5">
                            <Truck className="w-4 h-4 text-[#1b68b0]" />
                            <span>1. Pilih Armada Mobil & Supir Pelaksana:</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="text-slate-700 font-bold flex items-center gap-1 mb-1">
                                    <Calendar className="w-3.5 h-3.5 text-[#1b68b0]" />
                                    <span>Tanggal Jalan:</span>
                                </label>
                                <input
                                    type="date"
                                    value={deliveryDate}
                                    onChange={e => setDeliveryDate(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-800 font-semibold focus:border-[#1b68b0] cursor-pointer"
                                />
                            </div>

                            <div>
                                <label className="text-slate-700 block mb-1 font-bold">Pilih Mobil Armada:</label>
                                <select
                                    value={vehicle}
                                    onChange={e => {
                                        const selectedPlate = e.target.value;
                                        setVehicle(selectedPlate);
                                        const matched = FLEET_VEHICLES.find(f => f.plate === selectedPlate);
                                        if (matched?.defaultDriver) {
                                            setDriver(matched.defaultDriver);
                                        }
                                    }}
                                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-800 font-semibold focus:border-[#1b68b0] cursor-pointer"
                                >
                                    {FLEET_VEHICLES.map(v => {
                                        const st = availabilityByVehicle[v.plate];
                                        return (
                                            <option key={v.plate} value={v.plate}>
                                                {v.plate} — {st?.isBusy ? `[JALAN: ${st.totalStops} Stop]` : '[STANDBY / NGANGGUR]'}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            <div>
                                <label className="text-slate-700 block mb-1 font-bold">Pilih Supir / Driver:</label>
                                <select
                                    value={driver}
                                    onChange={e => setDriver(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-800 font-semibold focus:border-[#1b68b0] cursor-pointer"
                                >
                                    {DRIVER_OPTIONS.map(drv => (
                                        <option key={drv} value={drv}>{drv}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {currentVehicleStatus && (
                            <div className={`p-2.5 rounded-xl border text-[11px] flex items-start justify-between gap-2 ${
                                currentVehicleStatus.isBusy
                                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            }`}>
                                <div className="flex items-start gap-2">
                                    {currentVehicleStatus.isBusy ? (
                                        <>
                                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                            <div>
                                                <div className="font-bold">Mobil Memiliki Rute Aktif pada {formatIndonesianDate(deliveryDate)}</div>
                                                <p className="text-[10px] mt-0.5 text-amber-700">
                                                    Anda bisa menggabungkan perintah ambil barang ini ke rute jalan mobil tersebut (sekalian jalan pulang) atau membuat trip terpisah.
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-4 h-4 text-[#70b03c] shrink-0 mt-0.5" />
                                            <div>
                                                <div className="font-bold">Mobil Kosong / Standby pada {formatIndonesianDate(deliveryDate)}</div>
                                                <p className="text-[10px] mt-0.5 text-emerald-700">
                                                    Armada ini sedang tidak ada jadwal kirim dan siap diberangkatkan untuk mengambil barang.
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                                {currentVehicleStatus.isBusy && (
                                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-amber-900 bg-white px-2.5 py-1 rounded-lg border border-amber-300 shrink-0 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={mergeExistingTrip}
                                            onChange={e => setMergeExistingTrip(e.target.checked)}
                                            className="rounded text-[#1b68b0] focus:ring-[#1b68b0]"
                                        />
                                        <span>Gabung Rute Aktif</span>
                                    </label>
                                )}
                            </div>
                        )}
                    </div>

                    {/* SECTION 2: DAFTAR ALAMAT PENGAMBILAN BARANG (BISA MULTI-ALAMAT: ALAMAT A, ALAMAT C, DST) */}
                    <div className="space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <div className="font-extrabold text-[#242222] text-xs flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4 text-[#1b68b0]" />
                                    <span>2. Daftar Alamat Tujuan Pengambilan & Rincian Barang ({stops.length} Lokasi):</span>
                                </div>
                                <p className="text-[11px] text-slate-500">
                                    Masukkan alamat tempat mengambil barang (bisa tambah lebih dari 1 lokasi, misal ke Alamat A lalu ke Alamat C).
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddStop}
                                className="bg-blue-50 hover:bg-blue-100 text-[#1b68b0] border border-blue-200 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>+ Tambah Alamat Pengambilan</span>
                            </button>
                        </div>

                        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                            {stops.map((stop, idx) => (
                                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5">
                                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                        <span className="bg-[#1b68b0] text-white text-[10px] font-mono font-black px-2.5 py-0.5 rounded-md">
                                            LOKASI PENGAMBILAN #{idx + 1}
                                        </span>
                                        {stops.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveStop(idx)}
                                                className="text-rose-600 hover:bg-rose-50 px-2 py-0.5 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                                            >
                                                <Trash2 className="w-3 h-3" /> Hapus Lokasi
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        <div>
                                            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1 mb-1">
                                                <User className="w-3 h-3 text-[#1b68b0]" />
                                                <span>Nama Tempat / Supplier / PIC Lokasi: <span className="text-rose-500">*</span></span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={stop.location_name}
                                                onChange={e => handleStopChange(idx, 'location_name', e.target.value)}
                                                placeholder="cth: Gudang Supplier PT Asahimas / Toko Kaca Jaya..."
                                                className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-800 font-semibold focus:border-[#1b68b0]"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1 mb-1">
                                                <Phone className="w-3 h-3 text-[#1b68b0]" />
                                                <span>No. Telepon / Kontak PIC Lokasi:</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={stop.contact_phone}
                                                onChange={e => handleStopChange(idx, 'contact_phone', e.target.value)}
                                                placeholder="cth: 0812-xxxx-xxxx"
                                                className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-800 font-semibold focus:border-[#1b68b0]"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1 mb-1">
                                            <MapPin className="w-3 h-3 text-[#1b68b0]" />
                                            <span>Alamat Lengkap Lokasi Pengambilan Barang: <span className="text-rose-500">*</span></span>
                                        </label>
                                        <textarea
                                            rows={2}
                                            required
                                            value={stop.address}
                                            onChange={e => handleStopChange(idx, 'address', e.target.value)}
                                            placeholder="cth: Jl. Soekarno Hatta No. 450, Bandung..."
                                            className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-800 font-semibold focus:border-[#1b68b0]"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-1">
                                        <div className="sm:col-span-7">
                                            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1 mb-1">
                                                <Package className="w-3 h-3 text-[#70b03c]" />
                                                <span>Nama / Jenis Barang yang Diambil: <span className="text-rose-500">*</span></span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={stop.item_description}
                                                onChange={e => handleStopChange(idx, 'item_description', e.target.value)}
                                                placeholder="cth: Kaca Lembaran 10mm / Retur Kaca Proyek / Aksesoris..."
                                                className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-800 font-semibold focus:border-[#1b68b0]"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="text-[11px] font-bold text-slate-700 block mb-1">Jumlah (Qty):</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={stop.qty}
                                                onChange={e => handleStopChange(idx, 'qty', e.target.value)}
                                                className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-800 font-bold text-center focus:border-[#1b68b0]"
                                            />
                                        </div>
                                        <div className="sm:col-span-3">
                                            <label className="text-[11px] font-bold text-slate-700 block mb-1">Satuan:</label>
                                            <input
                                                type="text"
                                                value={stop.unit}
                                                onChange={e => handleStopChange(idx, 'unit', e.target.value)}
                                                placeholder="Lembar / Box / Pcs"
                                                className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-800 font-semibold focus:border-[#1b68b0]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SECTION 3: INSTRUKSI / CATATAN SURAT PERINTAH */}
                    <div>
                        <label className="text-slate-700 font-bold text-xs flex items-center gap-1.5 mb-1">
                            <FileText className="w-3.5 h-3.5 text-[#1b68b0]" />
                            <span>Instruksi Khusus untuk Supir & Petugas Gudang:</span>
                        </label>
                        <textarea
                            rows={2}
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="cth: Bawa tali webbing & busa pelindung, minta nota tanda terima dari supplier, langsung bongkar di Gudang A..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:border-[#1b68b0] focus:bg-white text-xs font-medium"
                        />
                    </div>

                    {/* FOOTER ACTIONS */}
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
                            className="px-5 py-2.5 bg-[#70b03c] hover:bg-[#5f9733] text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Send className="w-3.5 h-3.5" />
                            )}
                            <span>{isSubmitting ? 'Memproses...' : 'Terbitkan Surat Perintah Pengambilan Barang'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}

