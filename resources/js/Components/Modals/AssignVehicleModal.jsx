import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Truck, X, Send, MapPin, Loader2, FileText, Calendar, CheckCircle2, AlertCircle, User, Phone, Edit3 } from 'lucide-react';
import { formatIndonesianDate } from '@/Utils/dashboardHelpers';

const FLEET_VEHICLES = [
    { plate: 'Engkel Box (D 8472 AB)', defaultDriver: 'Pak Budi (Supir Utama DC)' },
    { plate: 'Truck Engkel Long (D 8011 GH)', defaultDriver: 'Pak Mulyadi (Driver Engkel)' },
    { plate: 'Pick Up L300 (D 8192 XY)', defaultDriver: 'Pak Asep (Driver L300)' },
    { plate: 'Armada Subcon (B 9920 FK)', defaultDriver: 'Pak Hendra (Driver Subcon)' },
];

export default function AssignVehicleModal({
    show,
    onClose,
    order,
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
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [isEditingAddress, setIsEditingAddress] = useState(false);

    useEffect(() => {
        if (show && order) {
            setCustomerName(order.customer_name || '');
            setCustomerPhone(order.customer_phone || '');
            setCustomerAddress(order.customer_address || '');
            setIsEditingAddress(false);
        }
    }, [show, order]);

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
                const hasActiveOrders = Array.isArray(t.orders) && t.orders.some(o => o.status !== 'selesai' && o.id !== order?.id);
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
    }, [allTrips, deliveryDate, order]);

    if (!show || !order) return null;

    const currentVehicleStatus = availabilityByVehicle[vehicle];


    return createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-800 relative">
                {/* LOADING BLUR OVERLAY FOR SMOOTH SUBMISSION */}
                {isSubmitting && (
                    <div className="absolute inset-0 bg-white/85 backdrop-blur-xs z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
                        <div className="bg-white p-5 rounded-3xl shadow-2xl border border-slate-200 flex flex-col items-center gap-3 max-w-xs">
                            <div className="w-12 h-12 rounded-2xl bg-[#1b68b0]/10 flex items-center justify-center text-[#1b68b0]">
                                <Loader2 className="w-6 h-6 animate-spin text-[#1b68b0]" />
                            </div>
                            <div>
                                <h4 className="font-bold text-[#242222] text-sm flex items-center gap-1.5 justify-center">
                                    <Truck className="w-4 h-4 text-[#1b68b0] animate-bounce" />
                                    <span>Menugaskan Armada...</span>
                                </h4>
                                <p className="text-xs text-slate-500 font-mono mt-1">
                                    Menyimpan alokasi pengiriman SPO #{order?.spo_number}.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                {/* MODAL HEADER */}
                <div className="flex justify-between items-center border-b border-slate-200 pb-3.5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-[#1b68b0]/10 flex items-center justify-center text-[#1b68b0]">
                            <Truck className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#242222] text-base">
                                Form Penugasan Mobil Armada
                            </h3>
                            <p className="text-xs text-slate-500 font-mono">Order SPO #{order.spo_number}</p>
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

                {/* ORDER INFO & EDITABLE ADDRESS CARD */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-2.5">
                    <div className="flex justify-between items-center gap-2">
                        <div className="flex items-center gap-2">
                            <span className="text-[#1b68b0] font-extrabold text-xs">
                                SPO: {order.spo_number}
                            </span>
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md font-mono border border-emerald-200">
                                {customerName || order.customer_name}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsEditingAddress(!isEditingAddress)}
                            className="text-[11px] font-bold text-[#1b68b0] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                            <Edit3 className="w-3 h-3" />
                            <span>{isEditingAddress ? 'Selesai Edit Alamat' : 'Koreksi Alamat'}</span>
                        </button>
                    </div>

                    {!isEditingAddress ? (
                        <div className="text-slate-600 flex items-start gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span>{customerAddress || 'Alamat Lokasi Pengiriman'} ({customerPhone || '-'})</span>
                        </div>
                    ) : (
                        <div className="space-y-2 pt-2 border-t border-slate-200">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-600 flex items-center gap-1 mb-0.5">
                                        <User className="w-3 h-3 text-slate-400" /> Nama Penerima:
                                    </label>
                                    <input
                                        type="text"
                                        value={customerName}
                                        onChange={e => setCustomerName(e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:border-[#1b68b0]"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-600 flex items-center gap-1 mb-0.5">
                                        <Phone className="w-3 h-3 text-slate-400" /> No. HP:
                                    </label>
                                    <input
                                        type="text"
                                        value={customerPhone}
                                        onChange={e => setCustomerPhone(e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:border-[#1b68b0]"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-600 flex items-center gap-1 mb-0.5">
                                    <MapPin className="w-3 h-3 text-slate-400" /> Alamat Tujuan Pengiriman:
                                </label>
                                <textarea
                                    rows={2}
                                    value={customerAddress}
                                    onChange={e => setCustomerAddress(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:border-[#1b68b0]"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* FORM */}
                <form 
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit(e, {
                            customer_name: customerName,
                            customer_phone: customerPhone,
                            customer_address: customerAddress
                        });
                    }} 
                    className="space-y-3.5 text-xs"
                >
                    <div>
                        <label className="text-slate-700 font-bold flex items-center gap-1.5 mb-1">
                            <Calendar className="w-3.5 h-3.5 text-[#1b68b0]" />
                            <span>Tanggal Pengiriman:</span>
                        </label>
                        <input 
                            type="date"
                            value={deliveryDate || ''} 
                            onChange={e => setDeliveryDate(e.target.value)} 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-[#1b68b0] focus:bg-white cursor-pointer"
                        />
                    </div>

                    <div>
                        <label className="text-slate-700 block mb-1 font-bold">Pilih Supir / Driver Armada:</label>
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

                    <div>
                        <label className="text-slate-700 block mb-1 font-bold">Pilih Jenis & No. Plat Mobil:</label>
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
                                        {v.plate} — {st?.isBusy ? `[TERJADWAL: ${st.totalStops} Alamat]` : '[TERSEDIA / KOSONG]'}
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
                                            <div className="font-bold">Mobil Sudah Memiliki Jadwal Jalan ({formatIndonesianDate(deliveryDate)})</div>
                                            <p className="text-[10px] mt-0.5 text-amber-700">
                                                Armada ini sudah ditugaskan untuk <strong>{currentVehicleStatus.totalStops} alamat</strong> dengan supir <strong>{currentVehicleStatus.assignedDriver}</strong>. Anda tetap bisa menggabungkan rute searah atau memilih armada lain yang tersedia.
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                        <div>
                                            <div className="font-bold">Mobil Tersedia (Standby) pada {formatIndonesianDate(deliveryDate)}</div>
                                            <p className="text-[10px] mt-0.5 text-emerald-700">
                                                Belum ada rute pengiriman aktif untuk armada ini pada tanggal yang dipilih.
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="text-slate-700 font-bold text-xs flex items-center justify-between mb-1">
                            <span className="flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-[#1b68b0]" />
                                <span>Catatan & Barang Penunjang Gudang: <span className="text-rose-500 font-black">*</span></span>
                            </span>
                            <span className="text-[10px] bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded-md font-bold">
                                WAJIB DIISI
                            </span>
                        </label>
                        <textarea 
                            rows={2}
                            required
                            value={notes} 
                            onChange={e => setNotes(e.target.value)} 
                            placeholder="cth: Dahulukan pengantaran sebelum jam 12, bawa 2 pcs Kop Kaca dari gudang B..." 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:border-[#1b68b0] focus:bg-white text-xs font-medium" 
                        />
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
                            disabled={!notes?.trim() || isSubmitting}
                            className={`px-5 py-2.5 font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition ${
                                notes?.trim() && !isSubmitting 
                                    ? 'bg-[#1b68b0] hover:bg-[#15528c] text-white cursor-pointer' 
                                    : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                            }`}
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Send className="w-3.5 h-3.5" />
                            )}
                            <span>{isSubmitting ? 'Memproses...' : 'Simpan Penugasan Mobil'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
