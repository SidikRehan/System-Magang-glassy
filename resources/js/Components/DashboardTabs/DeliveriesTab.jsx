import React, { useState, useMemo } from 'react';
import { router } from '@inertiajs/react';
import { 
    Truck, User, Calendar, MapPin, ClipboardList, 
    Printer, Fuel, CreditCard, CheckSquare, XSquare, 
    Plus, AlertCircle, FileText, CheckCircle2, Phone, 
    ShieldCheck, Sparkles, Send, Clock, Camera, Edit3,
    Search, Lock, X, Layers, Filter, Check, History, Wrench, Loader2
} from 'lucide-react';
import { isDriverMatch, isOrderExecutionFinished, getOrderRelevantDivisions, formatIndonesianDate, formatIndonesianDateTime } from '@/Utils/dashboardHelpers';
import AssignVehicleModal from '@/Components/Modals/AssignVehicleModal';
import EditTripModal from '@/Components/Modals/EditTripModal';

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
    handleCompleteDelivery,
    handleOpenConfirmDeliveryModal,
}) {
    const [driverSubTab, setDriverSubTab] = useState('active'); // 'active' | 'history' | 'expenses'
    const [selectedBatchOrderIds, setSelectedBatchOrderIds] = useState([]);
    const [dispatchDriverInput, setDispatchDriverInput] = useState('Pak Budi (Supir Utama DC)');
    const [dispatchVehicleInput, setDispatchVehicleInput] = useState('Engkel Box (D 8472 AB)');
    const [dispatchDateInput, setDispatchDateInput] = useState(() => new Date().toISOString().split('T')[0]);
    const [dispatchNotesInput, setDispatchNotesInput] = useState('');
    const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);


    const [deliverySearchQuery, setDeliverySearchQuery] = useState('');
    const [deliveryFilterTab, setDeliveryFilterTab] = useState('all'); // 'all', 'unassigned', 'assigned', 'in_production'

    const [showAssignVehicleModal, setShowAssignVehicleModal] = useState(false);
    const [selectedAssignOrder, setSelectedAssignOrder] = useState(null);
    const [assignDriver, setAssignDriver] = useState('Pak Budi (Supir Utama DC)');
    const [assignVehicle, setAssignVehicle] = useState('Engkel Box (D 8472 AB)');
    const [assignDate, setAssignDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [assignNotes, setAssignNotes] = useState('');
    const [isSubmittingVehicle, setIsSubmittingVehicle] = useState(false);

    const safeUserName = String(userName || auth?.user?.name || 'User');
    const safeOrders = useMemo(() => Array.isArray(initialOrders) ? initialOrders : [], [initialOrders]);
    const safeDeliveries = useMemo(() => Array.isArray(initialDeliveries) ? initialDeliveries : [], [initialDeliveries]);
    const safeFinanceTransactions = useMemo(() => Array.isArray(financeTransactionsList) ? financeTransactionsList : [], [financeTransactionsList]);

    // Group all safeOrders and safeDeliveries into unified Trip objects
    const allGroupedTrips = useMemo(() => {
        const grouped = {};
        const ordersMap = {};

        safeOrders.forEach(o => {
            if (o && o.id) ordersMap[o.id] = o;
        });

        // 1. Process safeOrders that are explicitly assigned to drivers/vehicles or have a trip code
        safeOrders.forEach(o => {
            if (!o) return;
            const isAssigned = Boolean(
                (o.assigned_driver && o.assigned_driver !== 'Belum Ditugaskan') ||
                (o.assigned_vehicle && o.assigned_vehicle !== 'Belum Ditugaskan') ||
                (o.trip_code && o.trip_code !== '')
            );
            if (!isAssigned) return;

            const tripCode = o.trip_code || `TRIP-${o.id}`;
            if (!grouped[tripCode]) {
                grouped[tripCode] = {
                    trip_code: tripCode,
                    driver_name: o.assigned_driver || o.driver_name || 'Belum Ditugaskan',
                    vehicle_plate: o.assigned_vehicle || 'Engkel Box (D 8472 AB)',
                    delivery_date: o.delivery_date || (o.shipped_at ? String(o.shipped_at).split('T')[0] : null),
                    notes: o.delivery_notes || o.notes || '',
                    orders: [],
                    deliveries: [],
                };
            }

            if (o.assigned_driver) grouped[tripCode].driver_name = o.assigned_driver;
            if (o.assigned_vehicle) grouped[tripCode].vehicle_plate = o.assigned_vehicle;
            if (o.delivery_date) grouped[tripCode].delivery_date = o.delivery_date;
            if ((o.delivery_notes || o.notes) && !grouped[tripCode].notes) {
                grouped[tripCode].notes = o.delivery_notes || o.notes;
            }

            if (!grouped[tripCode].orders.some(existing => existing.id === o.id)) {
                grouped[tripCode].orders.push(o);
            }
        });

        // 2. Process safeDeliveries records from database
        safeDeliveries.forEach(d => {
            if (!d) return;
            const assocOrder = d.order || ordersMap[d.order_id];
            const isAssigned = Boolean(
                d.trip_code ||
                (assocOrder && (
                    (assocOrder.assigned_driver && assocOrder.assigned_driver !== 'Belum Ditugaskan') ||
                    (assocOrder.assigned_vehicle && assocOrder.assigned_vehicle !== 'Belum Ditugaskan') ||
                    assocOrder.trip_code
                ))
            );
            if (!isAssigned) return;

            const tripCode = d.trip_code || assocOrder?.trip_code || `TRIP-${d.order_id || d.id}`;

            if (!grouped[tripCode]) {
                grouped[tripCode] = {
                    trip_code: tripCode,
                    driver_name: d.driver_name || assocOrder?.assigned_driver || 'Belum Ditugaskan',
                    vehicle_plate: d.vehicle_plate || assocOrder?.assigned_vehicle || 'Engkel Box (D 8472 AB)',
                    delivery_date: d.delivery_date || assocOrder?.delivery_date || null,
                    notes: d.notes || assocOrder?.delivery_notes || assocOrder?.notes || '',
                    orders: [],
                    deliveries: [],
                };
            }

            if (d.driver_name && grouped[tripCode].driver_name === 'Belum Ditugaskan') {
                grouped[tripCode].driver_name = d.driver_name;
            }
            if (d.vehicle_plate && (!grouped[tripCode].vehicle_plate || grouped[tripCode].vehicle_plate === 'Engkel Box (D 8472 AB)')) {
                grouped[tripCode].vehicle_plate = d.vehicle_plate;
            }
            if (d.delivery_date) {
                grouped[tripCode].delivery_date = d.delivery_date;
            }
            if (d.notes && (!grouped[tripCode].notes || grouped[tripCode].notes === '')) {
                grouped[tripCode].notes = d.notes;
            }

            if (!grouped[tripCode].deliveries.some(existing => existing.id === d.id)) {
                grouped[tripCode].deliveries.push(d);
            }

            if (assocOrder && assocOrder.id) {
                if (!grouped[tripCode].orders.some(existing => existing.id === assocOrder.id)) {
                    grouped[tripCode].orders.push(assocOrder);
                }
            }
        });

        return Object.values(grouped).filter(t => t && Array.isArray(t.orders) && t.orders.length > 0);
    }, [safeOrders, safeDeliveries]);

    const allDriverTrips = useMemo(() => {
        return allGroupedTrips.filter(t => isDriverMatch(t.driver_name, safeUserName));
    }, [allGroupedTrips, safeUserName]);

    const activeDriverTrips = useMemo(() => {
        return allDriverTrips.filter(t => t.orders.some(o => o.status !== 'selesai'));
    }, [allDriverTrips]);

    const historyDriverTrips = useMemo(() => {
        return allDriverTrips.filter(t => t.orders.some(o => o.status === 'selesai'));
    }, [allDriverTrips]);

    const activeAdminTrips = useMemo(() => {
        return allGroupedTrips.filter(t => t.orders.some(o => o.status !== 'selesai'));
    }, [allGroupedTrips]);

    // Categorize orders based on division execution completion
    const finishedOrders = useMemo(() => {
        return safeOrders.filter(o => o && isOrderExecutionFinished(o));
    }, [safeOrders]);

    const unassignedOrders = useMemo(() => {
        return finishedOrders.filter(o => o && !o.assigned_driver && !o.assigned_vehicle);
    }, [finishedOrders]);

    const assignedOrders = useMemo(() => {
        return finishedOrders.filter(o => o && (o.assigned_driver || o.assigned_vehicle));
    }, [finishedOrders]);

    const inProductionOrders = useMemo(() => {
        return safeOrders.filter(o => o && !isOrderExecutionFinished(o) && o.status !== 'draft');
    }, [safeOrders]);

    // Active base list for the current filter tab
    const baseOrdersList = useMemo(() => {
        if (deliveryFilterTab === 'unassigned') return unassignedOrders;
        if (deliveryFilterTab === 'assigned') return assignedOrders;
        if (deliveryFilterTab === 'in_production') return inProductionOrders;
        return finishedOrders; // 'all'
    }, [deliveryFilterTab, finishedOrders, unassignedOrders, assignedOrders, inProductionOrders]);

    // Apply real-time search query
    const filteredOrders = useMemo(() => {
        if (!deliverySearchQuery.trim()) return baseOrdersList;
        const q = deliverySearchQuery.toLowerCase().trim();
        return baseOrdersList.filter(o => {
            const matchBasic = (
                (o.spo_number && o.spo_number.toLowerCase().includes(q)) ||
                (o.customer_name && o.customer_name.toLowerCase().includes(q)) ||
                (o.customer_phone && o.customer_phone.toLowerCase().includes(q)) ||
                (o.customer_address && o.customer_address.toLowerCase().includes(q)) ||
                (o.assigned_driver && o.assigned_driver.toLowerCase().includes(q)) ||
                (o.assigned_vehicle && o.assigned_vehicle.toLowerCase().includes(q)) ||
                (o.trip_code && o.trip_code.toLowerCase().includes(q))
            );
            if (matchBasic) return true;

            if (Array.isArray(o.items)) {
                return o.items.some(it =>
                    (it.glass_type && it.glass_type.toLowerCase().includes(q)) ||
                    (it.description && it.description.toLowerCase().includes(q))
                );
            }
            return false;
        });
    }, [baseOrdersList, deliverySearchQuery]);

    const handleOpenAssignVehicleModal = (order) => {
        if (!isOrderExecutionFinished(order)) {
            alert(`⚠️ Orderan SPO #${order.spo_number} belum selesai dieksekusi oleh divisi terakhir! Silakan tunggu sampai proses produksi selesai (Lolos QC).`);
            return;
        }
        setSelectedAssignOrder(order);
        if (order.assigned_driver) setAssignDriver(order.assigned_driver);
        if (order.assigned_vehicle) setAssignVehicle(order.assigned_vehicle);
        setAssignDate(order.delivery_date || new Date().toISOString().split('T')[0]);
        setAssignNotes(order.delivery_notes || '');
        setShowAssignVehicleModal(true);
    };

    const handleSingleAssignSubmit = (e) => {
        e.preventDefault();
        if (!selectedAssignOrder) return;
        if (!isOrderExecutionFinished(selectedAssignOrder)) {
            alert(`⚠️ Orderan SPO #${selectedAssignOrder.spo_number} belum selesai dieksekusi oleh divisi terakhir!`);
            return;
        }
        setIsSubmittingVehicle(true);

        router.post('/orders/batch-delivery', {
            order_ids: [selectedAssignOrder.id],
            driver_name: assignDriver,
            vehicle_plate: assignVehicle,
            delivery_date: assignDate,
            notes: assignNotes
        }, {
            onSuccess: () => {
                setShowAssignVehicleModal(false);
                setSelectedAssignOrder(null);
                setAssignNotes('');
            },
            onFinish: () => {
                setIsSubmittingVehicle(false);
            }
        });
    };

    const [showEditTripModal, setShowEditTripModal] = useState(false);
    const [editingTripData, setEditingTripData] = useState(null);
    const [editTripDriver, setEditTripDriver] = useState('Pak Budi (Supir Utama DC)');
    const [editTripVehicle, setEditTripVehicle] = useState('Engkel Box (D 8472 AB)');
    const [editTripDate, setEditTripDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [editTripNotes, setEditTripNotes] = useState('');
    const [isSubmittingEditTrip, setIsSubmittingEditTrip] = useState(false);

    const handleOpenEditTripModal = (trip) => {
        setEditingTripData(trip);
        setEditTripDriver(trip.driver_name || 'Pak Budi (Supir Utama DC)');
        setEditTripVehicle(trip.vehicle_plate || 'Engkel Box (D 8472 AB)');
        setEditTripDate(trip.delivery_date || trip.orders?.[0]?.delivery_date || trip.deliveries?.[0]?.delivery_date || new Date().toISOString().split('T')[0]);
        const firstOrderNotes = trip.orders?.[0]?.delivery_notes || trip.deliveries?.[0]?.notes || '';
        setEditTripNotes(firstOrderNotes);
        setShowEditTripModal(true);
    };

    const handleEditTripSubmit = (e) => {
        e.preventDefault();
        if (!editingTripData) return;
        setIsSubmittingEditTrip(true);

        const orderIds = editingTripData.orders ? editingTripData.orders.map(o => o.id) : [];

        router.post('/orders/batch-delivery', {
            order_ids: orderIds,
            driver_name: editTripDriver,
            vehicle_plate: editTripVehicle,
            delivery_date: editTripDate,
            notes: editTripNotes,
            trip_code: editingTripData.trip_code
        }, {
            onSuccess: () => {
                setShowEditTripModal(false);
                setEditingTripData(null);
            },
            onFinish: () => {
                setIsSubmittingEditTrip(false);
            }
        });
    };

    const toggleSelectOrderForBatch = (orderId) => {
        const order = safeOrders.find(o => o.id === orderId);
        if (!order) return;
        if (!isOrderExecutionFinished(order)) {
            alert(`⚠️ Orderan SPO #${order.spo_number} belum selesai dieksekusi oleh divisi terakhir dan belum dapat dijadwalkan pengirimannya.`);
            return;
        }
        if (order.assigned_driver || order.assigned_vehicle) {
            alert(`⚠️ Orderan SPO #${order.spo_number} sudah memiliki penugasan armada (${order.assigned_driver || 'Supir Armada'}). Untuk mengganti supir/mobil, gunakan tombol "Ubah Mobil" pada kolom Armada.`);
            return;
        }
        setSelectedBatchOrderIds(prev =>
            prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
        );
    };

    const toggleSelectAllReadyOrders = () => {
        const unassignedSelectable = filteredOrders.filter(o => isOrderExecutionFinished(o) && !o.assigned_driver && !o.assigned_vehicle);
        if (unassignedSelectable.length === 0) {
            alert('ℹ️ Tidak ada orderan siap kirim yang belum memiliki supir/armada!');
            return;
        }

        const targetIds = unassignedSelectable.map(o => o.id);

        if (selectedBatchOrderIds.length === targetIds.length) {
            setSelectedBatchOrderIds([]);
        } else {
            setSelectedBatchOrderIds(targetIds);
        }
    };

    const handleAssignBatchDeliverySubmit = (e) => {
        e.preventDefault();
        if (selectedBatchOrderIds.length === 0) {
            alert('Silakan pilih (centang) minimal 1 SPO / Alamat pengiriman terlebih dahulu!');
            return;
        }

        if (!dispatchNotesInput || !dispatchNotesInput.trim()) {
            alert('⚠️ Catatan Rute & Barang Penunjang Gudang WAJIB diisi terlebih dahulu sebelum menugaskan mobil armada!');
            return;
        }

        const unreadyOrders = safeOrders.filter(o => selectedBatchOrderIds.includes(o.id) && !isOrderExecutionFinished(o));
        if (unreadyOrders.length > 0) {
            alert('⚠️ Gagal: Orderan ' + unreadyOrders.map(o => '#' + o.spo_number).join(', ') + ' belum selesai dieksekusi sampai divisi terakhir! Hilangkan centang pada orderan tersebut.');
            return;
        }

        setIsSubmittingBatch(true);

        router.post('/orders/batch-delivery', {
            order_ids: selectedBatchOrderIds,
            driver_name: dispatchDriverInput,
            vehicle_plate: dispatchVehicleInput,
            delivery_date: dispatchDateInput,
            notes: dispatchNotesInput
        }, {
            onSuccess: () => {
                setSelectedBatchOrderIds([]);
                setDispatchNotesInput('');
            },
            onFinish: () => {
                setIsSubmittingBatch(false);
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
                        <span>{userRole === 'driver' ? `Pengiriman Saya (${safeUserName})` : 'Penugasan Pengiriman Multi-Alamat & Surat Jalan'}</span>
                    </h2>
                    <p className="text-slate-500 text-xs font-medium mt-1">
                        {userRole === 'driver' 
                            ? `Daftar penugasan trip & manifest pengiriman alamat konsumen khusus untuk akun supir Anda (${safeUserName}).`
                            : 'Kelola alokasi armada multi-stop, cetak rute manifest surat jalan 4 warna, dan pantau pengiriman.'}
                    </p>
                </div>
                <div className="bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold text-[#242222] flex items-center gap-2 shadow-xs">
                    <Truck className="w-4 h-4 text-[#1b68b0]" />
                    <span className="text-slate-600">Order Siap / Kirim:</span>
                    <span className="bg-blue-50 text-[#1b68b0] px-2 py-0.5 rounded-full font-mono font-black border border-blue-200">
                        {userRole === 'driver'
                            ? safeOrders.filter(o => o && isDriverMatch(o.assigned_driver || o.driver_name, safeUserName) && (o.status === 'pengiriman' || o.status === 'selesai')).length
                            : finishedOrders.length} SPO
                    </span>
                </div>
            </div>

            {/* DRIVER ROLE SPECIFIC VIEW (KHUSUS ROLE SUPIR: DAFTAR PENUGASAN, RIWAYAT & BIAYA ARMADA) */}
            {userRole === 'driver' ? (
                <div className="space-y-6">
                    {(() => {
                        const myClaims = safeFinanceTransactions.filter(t => 
                            t && t.source_role === 'driver' && 
                            (t.user_id === auth?.user?.id || (t.title && t.title.toLowerCase().includes(safeUserName.toLowerCase())) || (t.notes && t.notes.toLowerCase().includes(safeUserName.toLowerCase())))
                        );

                        return (
                            <div className="space-y-5">
                                {/* SUB-TAB NAVIGATION BUTTONS FOR DRIVER */}
                                <div className="flex flex-wrap items-center bg-slate-100 border border-slate-200 p-1.5 rounded-2xl gap-1.5 shadow-xs">
                                    <button
                                        type="button"
                                        onClick={() => setDriverSubTab('active')}
                                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                                            driverSubTab === 'active'
                                                ? 'bg-white text-[#1b68b0] shadow-xs border border-slate-200'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                        }`}
                                    >
                                        <Truck className="w-4 h-4 text-[#1b68b0]" />
                                        <span>Daftar Pengiriman Saya (Aktif)</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-extrabold ${
                                            driverSubTab === 'active' ? 'bg-blue-50 text-[#1b68b0] border border-blue-200' : 'bg-slate-200 text-slate-600'
                                        }`}>
                                            {activeDriverTrips.length} Trip
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setDriverSubTab('history')}
                                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                                            driverSubTab === 'history'
                                                ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                        }`}
                                    >
                                        <History className="w-4 h-4 text-emerald-600" />
                                        <span>Riwayat Pengiriman Selesai</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-extrabold ${
                                            driverSubTab === 'history' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-200 text-slate-600'
                                        }`}>
                                            {historyDriverTrips.length} Trip
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setDriverSubTab('expenses')}
                                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                                            driverSubTab === 'expenses'
                                                ? 'bg-white text-amber-700 shadow-xs border border-slate-200'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                        }`}
                                    >
                                        <Fuel className="w-4 h-4 text-amber-600" />
                                        <span>Klaim Biaya Armada Logistik</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-extrabold ${
                                            driverSubTab === 'expenses' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-200 text-slate-600'
                                        }`}>
                                            {myClaims.length} Klaim
                                        </span>
                                    </button>
                                </div>

                                {/* SUB-TAB 1: DAFTAR PENGIRIMAN SAYA (AKTIF HARI INI) */}
                                {driverSubTab === 'active' && (
                                    <div className="space-y-4">
                                        <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-200 pb-3">
                                            <h3 className="text-base font-black text-[#242222] flex items-center gap-2">
                                                <Truck className="w-5 h-5 text-[#1b68b0]" />
                                                <span>Daftar Penugasan Trip & Alamat Tujuan Pengiriman (Aktif)</span>
                                            </h3>
                                            <span className="bg-blue-50 text-[#1b68b0] border border-blue-200 px-3 py-1 rounded-full font-bold text-xs flex items-center gap-1.5">
                                                <User className="w-3.5 h-3.5" /> Akun Supir: {userName}
                                            </span>
                                        </div>

                                        {activeDriverTrips.length === 0 ? (
                                            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 shadow-xs space-y-3">
                                                <div className="w-12 h-12 bg-blue-50 text-[#1b68b0] rounded-2xl flex items-center justify-center mx-auto border border-blue-100">
                                                    <Truck className="w-6 h-6" />
                                                </div>
                                                <div className="font-extrabold text-[#242222] text-sm">Belum Ada Penugasan Pengiriman Aktif Hari Ini</div>
                                                <p className="text-xs text-slate-400 max-w-md mx-auto">
                                                    Belum ada rute trip pengiriman aktif yang dialokasikan oleh Admin Gudang / WMS untuk akun supir <strong className="text-slate-700">{userName}</strong>.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                {activeDriverTrips.map((trip, idx) => (
                                                    <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 relative">
                                                        <div className="flex flex-wrap justify-between items-start border-b border-slate-100 pb-3 gap-2">
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="bg-blue-50 text-[#1b68b0] font-mono font-black text-xs px-2.5 py-0.5 rounded-md border border-blue-200">
                                                                        {trip.trip_code}
                                                                    </span>
                                                                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs px-2.5 py-0.5 rounded-md flex items-center gap-1">
                                                                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                                                                        <span>{formatIndonesianDate(trip.delivery_date || trip.orders?.[0]?.delivery_date || trip.deliveries?.[0]?.delivery_date)}</span>
                                                                    </span>
                                                                    <h4 className="font-extrabold text-[#242222] text-sm flex items-center gap-1.5">
                                                                        <User className="w-3.5 h-3.5 text-slate-500" />
                                                                        <span>{trip.driver_name}</span>
                                                                    </h4>
                                                                </div>
                                                                <p className="text-xs text-slate-500 mt-1">
                                                                    {trip.vehicle_plate} — <strong className="text-[#1b68b0]">{trip.orders.filter(o => o.status !== 'selesai').length} Alamat Belum Selesai</strong>
                                                                </p>
                                                                {(trip.notes || trip.deliveries?.[0]?.notes || trip.orders?.[0]?.delivery_notes || trip.orders?.[0]?.notes) && (
                                                                    <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-2.5 mt-2 text-xs text-slate-800 space-y-0.5">
                                                                        <span className="font-bold text-amber-900 flex items-center gap-1.5 text-[11px]">
                                                                            <FileText className="w-3.5 h-3.5 text-amber-700" />
                                                                            <span>Catatan Rute & Barang Penunjang Gudang:</span>
                                                                        </span>
                                                                        <p className="font-semibold text-slate-800 whitespace-pre-line pl-5 text-[11px]">
                                                                            {trip.notes || trip.deliveries?.[0]?.notes || trip.orders?.[0]?.delivery_notes || trip.orders?.[0]?.notes}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-wrap gap-1.5 justify-end">
                                                                <button
                                                                    onClick={() => handleOpenEditTripModal(trip)}
                                                                    className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                                                    title="Edit Penugasan Supir & Mobil Trip Ini"
                                                                >
                                                                    <Edit3 className="w-3.5 h-3.5 text-amber-600" /> Edit Trip
                                                                </button>
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
                                                            </div>
                                                        </div>

                                                        {/* TIMELINE STOP DESTINATIONS */}
                                                        <div className="space-y-2 text-xs">
                                                            {trip.orders.map((ord, stopIdx) => {
                                                                const isLunas = ord.payment_status === 'Lunas';
                                                                const isFinished = ord.status === 'selesai';
                                                                const sisaCod = Math.max(0, Number(ord.total_price || 0) - Number(ord.paid_amount || 0));
                                                                return (
                                                                    <div key={ord.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl border ${isFinished ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50/80 border-slate-200'}`}>
                                                                        <div className="flex items-start gap-2.5 min-w-0">
                                                                            <span className={`border text-[10px] font-black px-2 py-0.5 rounded-md shrink-0 mt-0.5 ${isFinished ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-[#1b68b0]/10 text-[#1b68b0] border-[#1b68b0]/20'}`}>
                                                                                STOP #{stopIdx + 1}
                                                                            </span>
                                                                            <div className="min-w-0">
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="font-bold text-[#242222] truncate">
                                                                                        SPO: {ord.spo_number} — {ord.customer_name}
                                                                                    </span>
                                                                                    {isFinished ? (
                                                                                        <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold shrink-0 bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                                                                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> TERKIRIM
                                                                                        </span>
                                                                                    ) : (
                                                                                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold shrink-0 ${isLunas ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                                                                                            {isLunas ? 'LUNAS' : `COD (Rp ${sisaCod.toLocaleString('id-ID')})`}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                                <p className="text-slate-500 text-[11px] truncate mt-0.5 flex items-center gap-1">
                                                                                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                                                                    <span>{ord.customer_address || '-'} ({ord.customer_phone})</span>
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex flex-wrap items-center gap-1.5 shrink-0 self-end sm:self-center">
                                                                            {!isLunas && !isFinished && (
                                                                                <button
                                                                                    onClick={() => handleOpenCodModal(ord)}
                                                                                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                                                                                    title="Setor Hasil Penagihan COD ke Kasir"
                                                                                >
                                                                                    <CreditCard className="w-3 h-3" /> Setor COD
                                                                                </button>
                                                                            )}
                                                                            {!isFinished ? (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        if (handleOpenConfirmDeliveryModal) {
                                                                                            handleOpenConfirmDeliveryModal(ord);
                                                                                        } else if (handleCompleteDelivery) {
                                                                                            handleCompleteDelivery(ord.id);
                                                                                        } else {
                                                                                            router.post(`/orders/${ord.id}/complete-delivery`);
                                                                                        }
                                                                                    }}
                                                                                    className="bg-[#70b03c] hover:bg-[#5f9733] text-white px-2.5 py-1 rounded-lg text-[11px] font-bold transition shadow-xs flex items-center gap-1 cursor-pointer"
                                                                                    title="Ambil foto Surat Jalan & konfirmasi terkirim"
                                                                                >
                                                                                    <Camera className="w-3.5 h-3.5" /> Foto & Konfirmasi Terkirim
                                                                                </button>
                                                                            ) : (
                                                                                ord.proof_photo_path ? (
                                                                                    <div className="flex items-center gap-1">
                                                                                        {handleOpenSketchLightbox && (
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => handleOpenSketchLightbox('/storage/' + ord.proof_photo_path, ord.spo_number || ord.id, {
                                                                                                    type: 'delivery_proof',
                                                                                                    subtitle: `No. SPO: ${ord.spo_number || ord.id} • Penerima: ${ord.recipient_name || ord.customer_name || 'Pelanggan'}`,
                                                                                                    badge: 'Bukti Serah Terima Surat Jalan',
                                                                                                    description: `Dokumentasi foto fisik lembar surat jalan yang telah ditandatangani oleh penerima di lokasi pengantaran.`,
                                                                                                    recipientName: ord.recipient_name || ord.customer_name,
                                                                                                    customerName: ord.customer_name,
                                                                                                    deliveredAt: ord.delivered_at,
                                                                                                })}
                                                                                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-lg text-[11px] font-bold transition shadow-2xs flex items-center gap-1 cursor-pointer"
                                                                                                title="Lihat Foto Bukti Surat Jalan"
                                                                                            >
                                                                                                <Camera className="w-3.5 h-3.5 text-emerald-600" /> Bukti SJ
                                                                                            </button>
                                                                                        )}
                                                                                        {handleOpenConfirmDeliveryModal && (
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => handleOpenConfirmDeliveryModal(ord)}
                                                                                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-2 py-1 rounded-lg text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer"
                                                                                                title="Ambil ulang / ganti foto Surat Jalan"
                                                                                            >
                                                                                                <Camera className="w-3 h-3 text-slate-500" /> Foto Ulang
                                                                                            </button>
                                                                                        )}
                                                                                    </div>
                                                                                ) : (
                                                                                    handleOpenConfirmDeliveryModal && (
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => handleOpenConfirmDeliveryModal(ord)}
                                                                                            className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-1 rounded-lg text-[11px] font-bold transition shadow-2xs flex items-center gap-1 cursor-pointer"
                                                                                            title="Ambil foto Surat Jalan bertanda tangan"
                                                                                        >
                                                                                            <Camera className="w-3.5 h-3.5 text-amber-600" /> + Foto Bukti SJ
                                                                                        </button>
                                                                                    )
                                                                                )
                                                                            )}
                                                                            <button
                                                                                onClick={() => { setSelectedWaybillOrder(ord); setShowWaybillModal(true); }}
                                                                                className="bg-white hover:bg-slate-100 text-[#1b68b0] border border-slate-200 px-2.5 py-1 rounded-lg text-[11px] font-bold transition shadow-2xs flex items-center gap-1 cursor-pointer"
                                                                                title="Cetak Surat Jalan khusus Alamat Ini"
                                                                            >
                                                                                <Printer className="w-3 h-3" /> SJ
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* SUB-TAB 2: RIWAYAT PENGIRIMAN SELESAI */}
                                {driverSubTab === 'history' && (
                                    <div className="space-y-4">
                                        <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-200 pb-3">
                                            <h3 className="text-base font-black text-[#242222] flex items-center gap-2">
                                                <History className="w-5 h-5 text-emerald-600" />
                                                <span>Riwayat Pengiriman Selesai ({historyDriverTrips.length} Trip)</span>
                                            </h3>
                                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full font-bold text-xs flex items-center gap-1.5">
                                                <ShieldCheck className="w-3.5 h-3.5" /> Histori Supir: {userName}
                                            </span>
                                        </div>

                                        {historyDriverTrips.length === 0 ? (
                                            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 shadow-xs space-y-3">
                                                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
                                                    <History className="w-6 h-6" />
                                                </div>
                                                <div className="font-extrabold text-[#242222] text-sm">Belum Ada Riwayat Pengiriman Selesai</div>
                                                <p className="text-xs text-slate-400 max-w-md mx-auto">
                                                    Daftar trip pengiriman yang telah selesai dikonfirmasi terkirim akan muncul di sini.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                {historyDriverTrips.map((trip, idx) => (
                                                    <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 relative">
                                                        <div className="flex flex-wrap justify-between items-start border-b border-slate-100 pb-3 gap-2">
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="bg-emerald-50 text-emerald-800 font-mono font-black text-xs px-2.5 py-0.5 rounded-md border border-emerald-200">
                                                                        {trip.trip_code}
                                                                    </span>
                                                                    <h4 className="font-extrabold text-[#242222] text-sm flex items-center gap-1.5">
                                                                        <User className="w-3.5 h-3.5 text-slate-500" />
                                                                        <span>{trip.driver_name}</span>
                                                                    </h4>
                                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> SELESAI TERKIRIM
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-slate-500 mt-1">
                                                                    {trip.vehicle_plate} — <strong className="text-emerald-700">{trip.orders.filter(o => o.status === 'selesai').length} Alamat Selesai</strong>
                                                                </p>
                                                                {(trip.notes || trip.deliveries?.[0]?.notes || trip.orders?.[0]?.delivery_notes || trip.orders?.[0]?.notes) && (
                                                                    <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-2.5 mt-2 text-xs text-slate-800 space-y-0.5">
                                                                        <span className="font-bold text-emerald-900 flex items-center gap-1.5 text-[11px]">
                                                                            <FileText className="w-3.5 h-3.5 text-emerald-700" />
                                                                            <span>Catatan Rute & Barang Penunjang Gudang:</span>
                                                                        </span>
                                                                        <p className="font-semibold text-slate-800 whitespace-pre-line pl-5 text-[11px]">
                                                                            {trip.notes || trip.deliveries?.[0]?.notes || trip.orders?.[0]?.delivery_notes || trip.orders?.[0]?.notes}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-wrap gap-1.5 justify-end">
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedBatchWaybillTrip(trip);
                                                                        setShowBatchWaybillModal(true);
                                                                    }}
                                                                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                                                >
                                                                    <Printer className="w-3.5 h-3.5 text-[#1b68b0]" /> Surat Jalan
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedTripDataForModal(trip);
                                                                        setShowMultiAddressModal(true);
                                                                    }}
                                                                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                                                >
                                                                    <FileText className="w-3.5 h-3.5 text-cyan-600" /> Manifest
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* TIMELINE STOP DESTINATIONS */}
                                                        <div className="space-y-2 text-xs">
                                                            {trip.orders.filter(o => o.status === 'selesai').map((ord, stopIdx) => {
                                                                return (
                                                                    <div key={ord.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-emerald-50/40 p-3 rounded-xl border border-emerald-200/80">
                                                                        <div className="flex items-start gap-2.5 min-w-0">
                                                                            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-md shrink-0 mt-0.5">
                                                                                STOP #{stopIdx + 1}
                                                                            </span>
                                                                            <div className="min-w-0">
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="font-bold text-[#242222] truncate">
                                                                                        SPO: {ord.spo_number} — {ord.customer_name}
                                                                                    </span>
                                                                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold shrink-0 bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                                                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Lunas & Terkirim
                                                                                    </span>
                                                                                </div>
                                                                                <p className="text-slate-500 text-[11px] truncate mt-0.5 flex items-center gap-1">
                                                                                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                                                                    <span>{ord.customer_address || '-'} ({ord.customer_phone})</span>
                                                                                </p>
                                                                                {ord.delivered_at && (
                                                                                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                                                                                        Terkirim pada: {formatIndonesianDateTime(ord.delivered_at)}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                                                                            {ord.proof_photo_path ? (
                                                                                <div className="flex items-center gap-1">
                                                                                    {handleOpenSketchLightbox && (
                                                                                        <button
                                                                                            onClick={() => handleOpenSketchLightbox('/storage/' + ord.proof_photo_path, ord.spo_number || ord.id, {
                                                                                                type: 'delivery_proof',
                                                                                                subtitle: `No. SPO: ${ord.spo_number || ord.id} • Penerima: ${ord.recipient_name || ord.customer_name || 'Pelanggan'}`,
                                                                                                badge: 'Bukti Serah Terima Surat Jalan',
                                                                                                description: `Dokumentasi foto fisik lembar surat jalan yang telah ditandatangani dan/atau distempel oleh pihak penerima/pelanggan di alamat pengantaran. Berfungsi sebagai bukti sah serah terima barang telah tuntas.`,
                                                                                                recipientName: ord.recipient_name || ord.customer_name,
                                                                                                customerName: ord.customer_name,
                                                                                                deliveredAt: ord.delivered_at,
                                                                                            })}
                                                                                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg text-[11px] font-bold transition shadow-2xs flex items-center gap-1 cursor-pointer"
                                                                                            title="Lihat Foto Surat Jalan Tanda Tangan Penerima"
                                                                                        >
                                                                                            <Camera className="w-3.5 h-3.5 text-emerald-600" /> Bukti SJ
                                                                                        </button>
                                                                                    )}
                                                                                    {handleOpenConfirmDeliveryModal && (
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => handleOpenConfirmDeliveryModal(ord)}
                                                                                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-2 py-1 rounded-lg text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer"
                                                                                            title="Ambil ulang / ganti foto Surat Jalan"
                                                                                        >
                                                                                            <Camera className="w-3 h-3 text-slate-500" /> Foto Ulang
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            ) : (
                                                                                handleOpenConfirmDeliveryModal && (
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => handleOpenConfirmDeliveryModal(ord)}
                                                                                        className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-1 rounded-lg text-[11px] font-bold transition shadow-2xs flex items-center gap-1 cursor-pointer"
                                                                                        title="Ambil / Upload Bukti Foto Surat Jalan"
                                                                                    >
                                                                                        <Camera className="w-3.5 h-3.5 text-amber-600" /> + Ambil Foto SJ
                                                                                    </button>
                                                                                )
                                                                            )}
                                                                            <button
                                                                                onClick={() => { setSelectedWaybillOrder(ord); setShowWaybillModal(true); }}
                                                                                className="bg-white hover:bg-slate-100 text-[#1b68b0] border border-slate-200 px-2.5 py-1 rounded-lg text-[11px] font-bold transition shadow-2xs flex items-center gap-1 cursor-pointer"
                                                                                title="Lihat / Cetak Surat Jalan"
                                                                            >
                                                                                <Printer className="w-3 h-3" /> Lihat SJ
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* SUB-TAB 3: KLAIM BIAYA ARMADA LOGISTIK */}
                                {driverSubTab === 'expenses' && (
                                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                                        <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-100 pb-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
                                                    <Fuel className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-extrabold text-[#242222] flex items-center gap-2">
                                                        Form & Riwayat Ajukan Biaya Armada Logistik
                                                    </h3>
                                                    <p className="text-xs text-slate-500">
                                                        Pengajuan klaim penggantian BBM Solar, E-Toll, parkir, dan darurat armada ({userName}).
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setShowDriverClaimModal(true)}
                                                className="px-4 py-2 bg-[#70b03c] hover:bg-[#5f9733] text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center gap-2 cursor-pointer"
                                            >
                                                <Plus className="w-4 h-4" />
                                                <span>Ajukan Biaya Armada Baru</span>
                                            </button>
                                        </div>

                                        {/* RIWAYAT PENGAJUAN KLAIM BIAYA ARMADA */}
                                        {myClaims.length === 0 ? (
                                            <div className="bg-slate-50/60 border border-slate-200 rounded-xl p-6 text-center text-slate-400 text-xs space-y-2">
                                                <Fuel className="w-8 h-8 text-slate-300 mx-auto" />
                                                <p className="font-semibold text-slate-600">Belum Ada Riwayat Pengajuan Biaya Armada</p>
                                                <p>Klik tombol <strong className="text-[#70b03c]">"Ajukan Biaya Armada Baru"</strong> di atas untuk mengajukan klaim BBM Solar atau E-Toll.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3 text-xs">
                                                <div className="flex justify-between items-center text-slate-500 font-bold px-1">
                                                    <span>Daftar Pengajuan Klaim Saya ({myClaims.length})</span>
                                                    <span>Total: <strong className="text-[#242222] font-mono">Rp {myClaims.reduce((acc, c) => acc + Number(c.amount || 0), 0).toLocaleString('id-ID')}</strong></span>
                                                </div>
                                                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                                                    {myClaims.map(clm => (
                                                        <div key={clm.id} className="p-3.5 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                            <div className="space-y-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-bold text-[#242222] text-xs">{clm.title}</span>
                                                                    <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                                                                        {clm.category || 'Biaya Armada'}
                                                                    </span>
                                                                </div>
                                                                <div className="text-[11px] text-slate-500 font-mono flex flex-wrap items-center gap-2">
                                                                    <span className="text-[#1b68b0] font-black text-xs">Rp {Number(clm.amount || 0).toLocaleString('id-ID')}</span>
                                                                    <span>• Armada: {clm.vehicle_plate || 'Engkel Box'}</span>
                                                                    <span>• Tgl: {clm.transaction_date}</span>
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
                                                                                    onClick={() => handleOpenSketchLightbox(p, clm.transaction_code, {
                                                                                        type: 'receipt',
                                                                                        subtitle: `No. Transaksi: #${clm.transaction_code} • Struk ${pIdx + 1} dari ${pList.length}`,
                                                                                        badge: 'Struk Klaim Operasional',
                                                                                        description: `Foto bukti fisik struk / nota kuitansi resmi (${clm.expense_category || 'Pengeluaran Driver'} - ${clm.vehicle_plate || 'Armada'}) yang dilampirkan oleh driver untuk validasi klaim kas operasional oleh tim Keuangan.`,
                                                                                        vehiclePlate: clm.vehicle_plate,
                                                                                        amount: clm.amount,
                                                                                        category: clm.expense_category,
                                                                                    })}
                                                                                    className="text-[10px] bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-2 py-0.5 rounded-lg font-mono font-bold flex items-center gap-1 cursor-pointer"
                                                                                >
                                                                                    <Camera className="w-3 h-3 text-[#1b68b0]" />
                                                                                    <span>Foto Struk #{pIdx + 1}</span>
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    );
                                                                })()}
                                                            </div>
                                                            <div className="shrink-0 self-end sm:self-center">
                                                                {clm.approval_status === 'pending' && (
                                                                    <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold flex items-center gap-1">
                                                                        <Clock className="w-3.5 h-3.5" /> Menunggu Verifikasi
                                                                    </span>
                                                                )}
                                                                {clm.approval_status === 'approved' && (
                                                                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Disetujui Finance
                                                                    </span>
                                                                )}
                                                                {clm.approval_status === 'rejected' && (
                                                                    <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                                                                        ✕ Ditolak
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </div>
            ) : (
                /* NON-DRIVER ADMIN & WMS VIEW (ADMIN TOKO / GUDANG / OWNER / FINANCE) */
                <>
                    {/* SECTION DAFTAR TRIP MOBIL AKTIF & RUTE MANIFEST MULTI-STOP */}
                    <div className="space-y-4">
                        <div className="flex flex-wrap justify-between items-center gap-2">
                            <h3 className="text-base font-black text-[#242222] flex items-center gap-2">
                                <Truck className="w-5 h-5 text-[#1b68b0]" />
                                <span>Daftar Trip Armada Mobil & Rute Alamat Tujuan Aktif</span>
                            </h3>
                            <div className="flex flex-wrap gap-2 text-xs">
                                <span className="bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                                    Admin Gudang: Siap Cetak SJ & Gate Pass
                                </span>
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                                    Divisi Supir: Terbit di Tugas Driver
                                </span>
                            </div>
                        </div>

                        {(() => {
                            const trips = activeAdminTrips;

                            if (trips.length === 0) {
                                return (
                                    <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 shadow-xs">
                                        Belum ada trip pengiriman aktif. Silakan centang alamat pada tabel di bawah untuk menugaskan armada!
                                    </div>
                                );
                            }

                            return (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {trips.map((trip, idx) => (
                                        <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 relative">
                                            <div className="flex flex-wrap justify-between items-start border-b border-slate-100 pb-3 gap-2">
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="bg-blue-50 text-[#1b68b0] font-mono font-black text-xs px-2.5 py-0.5 rounded-md border border-blue-200">
                                                            {trip.trip_code}
                                                        </span>
                                                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs px-2.5 py-0.5 rounded-md flex items-center gap-1">
                                                            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                                                            <span>{formatIndonesianDate(trip.delivery_date || trip.orders?.[0]?.delivery_date || trip.deliveries?.[0]?.delivery_date)}</span>
                                                        </span>
                                                        <h4 className="font-extrabold text-[#242222] text-sm flex items-center gap-1.5">
                                                            <User className="w-3.5 h-3.5 text-slate-500" />
                                                            <span>{trip.driver_name}</span>
                                                        </h4>
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        {trip.vehicle_plate} — <strong className="text-[#1b68b0]">{trip.orders.length} Alamat Tujuan</strong>
                                                    </p>
                                                    {(trip.notes || trip.deliveries?.[0]?.notes || trip.orders?.[0]?.delivery_notes || trip.orders?.[0]?.notes) && (
                                                        <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-2.5 mt-2 text-xs text-slate-800 space-y-0.5">
                                                            <span className="font-bold text-amber-900 flex items-center gap-1.5 text-[11px]">
                                                                <FileText className="w-3.5 h-3.5 text-amber-700" />
                                                                <span>Catatan Rute & Barang Penunjang Gudang:</span>
                                                            </span>
                                                            <p className="font-semibold text-slate-800 whitespace-pre-line pl-5 text-[11px]">
                                                                {trip.notes || trip.deliveries?.[0]?.notes || trip.orders?.[0]?.delivery_notes || trip.orders?.[0]?.notes}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-1.5 justify-end">
                                                    {userRole !== 'satpam' && (
                                                        <button
                                                            onClick={() => handleOpenEditTripModal(trip)}
                                                            className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                                            title="Edit Penugasan Supir & Mobil Trip Ini"
                                                        >
                                                            <Edit3 className="w-3.5 h-3.5 text-amber-600" /> Edit Trip
                                                        </button>
                                                    )}
                                                    {userRole !== 'satpam' && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedBatchWaybillTrip(trip);
                                                                setShowBatchWaybillModal(true);
                                                            }}
                                                            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                                        >
                                                            <Printer className="w-3.5 h-3.5 text-[#1b68b0]" /> Cetak Semua SJ
                                                        </button>
                                                    )}
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
                                                                notes: trip.notes || trip.deliveries?.[0]?.notes || trip.orders?.[0]?.delivery_notes || trip.orders?.[0]?.notes,
                                                                date: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
                                                            });
                                                            setShowBarangKeluarModal(true);
                                                        }}
                                                        className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                                    >
                                                        <ClipboardList className="w-3.5 h-3.5 text-[#70b03c]" /> Gate Pass
                                                    </button>
                                                    {(userRole === 'satpam' || userRole === 'owner') && (
                                                        <button
                                                            onClick={() => {
                                                                if(confirm('Apakah Anda yakin jumlah fisik barang & kaca di armada sudah sesuai dengan Surat Gate Pass?')) {
                                                                    router.post(`/deliveries/${trip.trip_code}/gate-check`, {}, { preserveScroll: true });
                                                                }
                                                            }}
                                                            disabled={trip.deliveries?.[0]?.delivery_status === 'Dalam Pengiriman' || trip.deliveries?.[0]?.delivery_status === 'Terkirim'}
                                                            className="bg-[#70b03c] hover:bg-[#5f9733] text-white border border-[#70b03c] px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <ShieldCheck className="w-3.5 h-3.5 text-white" /> 
                                                            {trip.deliveries?.[0]?.delivery_status === 'Dalam Pengiriman' || trip.deliveries?.[0]?.delivery_status === 'Terkirim' ? 'Telah Keluar Gerbang' : 'Validasi Keluar'}
                                                        </button>
                                                    )}
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

                    {/* TABEL PILIHAN SPO & ALAMAT PENGIRIMAN DENGAN FORM PENUGASAN MOBIL TERPADU */}
                    {userRole !== 'satpam' && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                        {/* HEADER TABEL & PENCARIAN */}
                        <div className="flex flex-wrap justify-between items-start gap-4 border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="text-base font-black text-[#242222] flex items-center gap-2">
                                    <Truck className="w-5 h-5 text-[#1b68b0]" />
                                    <span>Tabel Pengiriman Armada & Alokasi Supir</span>
                                </h3>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                    Kelola penugasan supir dan mobil armada untuk orderan yang telah selesai dieksekusi oleh divisi pabrik (Lolos QC).
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={toggleSelectAllReadyOrders}
                                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs flex items-center gap-1.5 shrink-0"
                            >
                                {selectedBatchOrderIds.length > 0 ? (
                                    <>
                                        <XSquare className="w-4 h-4 text-rose-500" /> Batal Pilih Semua
                                    </>
                                ) : (
                                    <>
                                        <CheckSquare className="w-4 h-4 text-[#1b68b0]" /> Pilih Semua Order
                                    </>
                                )}
                            </button>
                        </div>

                        {/* CONTROLS: FILTER TABS & SEARCH INPUT */}
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50/70 border border-slate-200 p-3 rounded-2xl">
                            {/* FILTER PILLS */}
                            <div className="flex flex-wrap items-center gap-1.5 text-xs">
                                <button
                                    type="button"
                                    onClick={() => setDeliveryFilterTab('all')}
                                    className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                        deliveryFilterTab === 'all'
                                            ? 'bg-white text-[#1b68b0] border border-slate-200 shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                    }`}
                                >
                                    <Layers className="w-3.5 h-3.5 text-[#1b68b0]" />
                                    <span>Semua Siap Kirim</span>
                                    <span className="bg-blue-50 text-[#1b68b0] border border-blue-200 text-[10px] font-mono font-black px-1.5 py-0.2 rounded-full">
                                        {finishedOrders.length}
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setDeliveryFilterTab('unassigned')}
                                    className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                        deliveryFilterTab === 'unassigned'
                                            ? 'bg-white text-amber-800 border border-amber-200 shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                    }`}
                                >
                                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                                    <span>Belum Dapat Supir</span>
                                    <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-mono font-black px-1.5 py-0.2 rounded-full">
                                        {unassignedOrders.length}
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setDeliveryFilterTab('assigned')}
                                    className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                        deliveryFilterTab === 'assigned'
                                            ? 'bg-white text-emerald-800 border border-emerald-200 shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                    }`}
                                >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#70b03c]" />
                                    <span>Sudah Dapat Supir</span>
                                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-black px-1.5 py-0.2 rounded-full">
                                        {assignedOrders.length}
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setDeliveryFilterTab('in_production')}
                                    className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                        deliveryFilterTab === 'in_production'
                                            ? 'bg-white text-slate-800 border border-slate-300 shadow-xs'
                                            : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
                                    }`}
                                    title="Orderan yang masih dalam pengerjaan divisi pabrik (belum siap kirim)"
                                >
                                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Sedang Dikerjakan Divisi</span>
                                    <span className="bg-slate-200 text-slate-700 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full">
                                        {inProductionOrders.length}
                                    </span>
                                </button>
                            </div>

                            {/* SEARCH INPUT */}
                            <div className="relative w-full lg:w-72">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="text"
                                    value={deliverySearchQuery}
                                    onChange={e => setDeliverySearchQuery(e.target.value)}
                                    placeholder="Cari SPO, customer, supir..."
                                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-8 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-[#1b68b0] focus:ring-2 focus:ring-[#1b68b0]/15"
                                />
                                {deliverySearchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setDeliverySearchQuery('')}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
                                        title="Hapus pencarian"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* FORM PENUGASAN MOBIL ARMADA BATCH (DALAM CONTAINER TABEL) */}
                        <div className="bg-slate-50/90 border border-slate-200 rounded-xl p-4 space-y-3 relative overflow-hidden">
                            {/* LOADING OVERLAY WHEN SUBMITTING BATCH ASSIGNMENT */}
                            {isSubmittingBatch && (
                                <div className="absolute inset-0 bg-white/90 backdrop-blur-xs z-30 rounded-xl flex flex-col items-center justify-center p-4 text-center animate-in fade-in duration-200">
                                    <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-200 flex flex-col items-center gap-2.5 max-w-xs">
                                        <div className="w-10 h-10 rounded-xl bg-[#1b68b0]/10 flex items-center justify-center text-[#1b68b0] border border-[#1b68b0]/20">
                                            <Loader2 className="w-5 h-5 animate-spin text-[#1b68b0]" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[#242222] text-xs flex items-center gap-1.5 justify-center">
                                                <Truck className="w-4 h-4 text-[#1b68b0] animate-bounce" />
                                                <span>Menugaskan Armada Pengiriman...</span>
                                            </h4>
                                            <p className="text-[11px] text-slate-500 mt-1 font-medium">
                                                Memproses {selectedBatchOrderIds.length} order SPO terpilih.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
                                <div className="flex items-center gap-2">
                                    <Truck className="w-4 h-4 text-[#1b68b0]" />
                                    <h4 className="text-xs font-bold text-[#242222]">Form Penugasan Mobil Armada (Batch / Multi-Order)</h4>
                                </div>
                                <span className="text-[11px] bg-blue-50 text-[#1b68b0] px-2.5 py-0.5 rounded-full border border-blue-200 font-bold">
                                    {selectedBatchOrderIds.length} Order SPO Terpilih
                                </span>
                            </div>

                            <form onSubmit={handleAssignBatchDeliverySubmit} className="space-y-3 text-xs">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                    <div>
                                        <label className="text-slate-700 block mb-1 font-bold">Tanggal Pengiriman:</label>
                                        <input
                                            type="date"
                                            value={dispatchDateInput}
                                            onChange={e => setDispatchDateInput(e.target.value)}
                                            className="w-full bg-white border border-slate-300 rounded-xl p-2 text-slate-800 font-semibold focus:border-[#1b68b0] focus:ring-1 focus:ring-[#1b68b0] cursor-pointer"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-slate-700 block mb-1 font-bold">Supir / Driver Armada:</label>
                                        <select
                                            value={dispatchDriverInput}
                                            onChange={e => setDispatchDriverInput(e.target.value)}
                                            className="w-full bg-white border border-slate-300 rounded-xl p-2 text-slate-800 font-semibold focus:border-[#1b68b0] focus:ring-1 focus:ring-[#1b68b0] cursor-pointer"
                                        >
                                            <option value="Pak Budi (Supir Utama DC)">Pak Budi (Supir Utama DC)</option>
                                            <option value="Pak Mulyadi (Driver Engkel)">Pak Mulyadi (Driver Engkel)</option>
                                            <option value="Pak Asep (Driver L300)">Pak Asep (Driver Pick Up)</option>
                                            <option value="Pak Hendra (Driver Subcon)">Pak Hendra (Driver Subcon)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-slate-700 block mb-1 font-bold">Jenis & No. Plat Mobil:</label>
                                        <select
                                            value={dispatchVehicleInput}
                                            onChange={e => setDispatchVehicleInput(e.target.value)}
                                            className="w-full bg-white border border-slate-300 rounded-xl p-2 text-slate-800 font-semibold focus:border-[#1b68b0] focus:ring-1 focus:ring-[#1b68b0] cursor-pointer"
                                        >
                                            <option value="Engkel Box (D 8472 AB)">Engkel Box (D 8472 AB)</option>
                                            <option value="Pick Up L300 (D 8192 XY)">Pick Up L300 (D 8192 XY)</option>
                                            <option value="Truck Engkel Long (D 8011 GH)">Truck Engkel Long (D 8011 GH)</option>
                                            <option value="Armada Subcon (B 9920 FK)">Armada Subcon (B 9920 FK)</option>
                                        </select>
                                    </div>

                                    <div className="flex flex-col justify-end">
                                        <button
                                            type="submit"
                                            disabled={selectedBatchOrderIds.length === 0 || !dispatchNotesInput.trim() || isSubmittingBatch}
                                            className={`w-full font-bold px-3 py-2.5 rounded-xl text-xs shadow-xs flex items-center justify-center gap-1.5 transition ${
                                                selectedBatchOrderIds.length > 0 && dispatchNotesInput.trim() && !isSubmittingBatch
                                                    ? 'bg-[#1b68b0] hover:bg-[#15528c] text-white cursor-pointer'
                                                    : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                                            }`}
                                        >
                                            {isSubmittingBatch ? (
                                                <>
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    <span>Memproses...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-3.5 h-3.5" />
                                                    <span>Tugaskan Mobil Armada ({selectedBatchOrderIds.length} Order)</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* SECTION CATATAN PENGIRIMAN & BARANG PENUNJANG GUDANG */}
                                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                                    <label className="text-slate-800 font-bold text-xs flex items-center justify-between">
                                        <span className="flex items-center gap-1.5">
                                            <FileText className="w-3.5 h-3.5 text-[#1b68b0]" />
                                            <span>Catatan Rute & Barang Penunjang Gudang: <span className="text-rose-500 font-black">*</span></span>
                                        </span>
                                        <span className="text-[10px] bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded-md font-bold">
                                            WAJIB DIISI SEBELUM TUGASKAN
                                        </span>
                                    </label>

                                    <textarea
                                        rows={2}
                                        required
                                        value={dispatchNotesInput}
                                        onChange={e => setDispatchNotesInput(e.target.value)}
                                        placeholder="Tuliskan instruksi pengiriman atau daftar tambahan barang dari gudang (cth: Bawa 2 stang suction cup dari gudang B, tangga lipat, dll)..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#1b68b0] focus:ring-2 focus:ring-[#1b68b0]/15 font-medium"
                                    />
                                </div>
                            </form>
                        </div>

                        {/* TABEL DATA PENGIRIMAN */}
                        <div className="overflow-x-auto border border-slate-200 rounded-xl">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50/80 text-slate-600 uppercase text-[11px] font-bold border-b border-slate-200">
                                    <tr>
                                        <th className="p-3 w-10 text-center">Pilih</th>
                                        <th className="p-3">Nomor SPO</th>
                                        <th className="p-3">Customer & Telp</th>
                                        <th className="p-3">Alamat Tujuan Pengiriman</th>
                                        <th className="p-3">Spesifikasi Barang Kaca</th>
                                        <th className="p-3">Tahapan Divisi (QC)</th>
                                        <th className="p-3">Supir & Mobil</th>
                                        <th className="p-3">Status Pembayaran</th>
                                        <th className="p-3 text-center">Dokumen</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs">
                                    {(() => {
                                        if (filteredOrders.length === 0) {
                                            return (
                                                <tr>
                                                    <td colSpan="9" className="p-8 text-center text-slate-400 space-y-2">
                                                        <Search className="w-8 h-8 text-slate-300 mx-auto" />
                                                        <p className="font-semibold text-slate-600">
                                                            {deliverySearchQuery
                                                                ? `Tidak ditemukan order yang cocok dengan kata kunci "${deliverySearchQuery}".`
                                                                : 'Belum ada data order pada kategori ini.'}
                                                        </p>
                                                        {deliverySearchQuery && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setDeliverySearchQuery('')}
                                                                className="text-xs text-[#1b68b0] hover:underline font-bold cursor-pointer"
                                                            >
                                                                Reset Pencarian
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        }

                                        const renderOrderRow = (ord) => {
                                            if (!ord) return null;
                                            const isReady = isOrderExecutionFinished(ord);
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
                                             const relevantDivs = getOrderRelevantDivisions(ord);
                                             const divProgress = ord.division_progress || {};
                                             const isAssigned = Boolean(ord.assigned_driver || ord.assigned_vehicle);
                                             const isSelectable = isReady && !isAssigned;

                                             return (
                                                 <tr
                                                     key={ord.id}
                                                     className={`transition ${
                                                         isSelected 
                                                             ? 'bg-blue-50/60 border-l-4 border-l-[#1b68b0]' 
                                                             : !isReady 
                                                                 ? 'bg-slate-50/50 hover:bg-slate-50/80 opacity-90' 
                                                                 : isAssigned
                                                                     ? 'bg-emerald-50/20 hover:bg-emerald-50/40'
                                                                     : 'hover:bg-slate-50/70'
                                                     }`}
                                                 >
                                                     <td className="p-3 text-center">
                                                         {isSelectable ? (
                                                             <input
                                                                 type="checkbox"
                                                                 checked={isSelected}
                                                                 onChange={() => toggleSelectOrderForBatch(ord.id)}
                                                                 className="w-4 h-4 rounded text-[#1b68b0] focus:ring-[#1b68b0] border-slate-300 cursor-pointer"
                                                             />
                                                         ) : isAssigned ? (
                                                             <input
                                                                 type="checkbox"
                                                                 disabled
                                                                 checked={false}
                                                                 className="w-4 h-4 rounded text-slate-300 bg-slate-100 border-slate-300 cursor-not-allowed opacity-40"
                                                                 title={`Order SPO #${ord.spo_number} sudah memiliki armada (${ord.assigned_driver}). Gunakan tombol 'Ubah Mobil' pada kolom Armada jika ingin mengubah penugasan.`}
                                                             />
                                                         ) : (
                                                             <input
                                                                 type="checkbox"
                                                                 disabled
                                                                 checked={false}
                                                                 className="w-4 h-4 rounded text-slate-300 bg-slate-100 border-slate-300 cursor-not-allowed opacity-40"
                                                                 title="Order belum selesai dieksekusi oleh divisi terakhir"
                                                             />
                                                         )}
                                                     </td>

                                                    <td className="p-3">
                                                        <div className="font-extrabold text-[#1b68b0] font-mono text-xs flex items-center gap-1.5">
                                                            <span>{ord.spo_number}</span>
                                                            {ord.priority_status === 'Prioritas' && (
                                                                <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[9px] font-black px-1.5 py-0.2 rounded">
                                                                    PRIORITAS
                                                                </span>
                                                            )}
                                                        </div>
                                                        {ord.trip_code ? (
                                                            <div className="text-[10px] text-slate-500 font-mono mt-0.5 space-y-0.5">
                                                                <div>Trip: <strong className="text-slate-700">{ord.trip_code}</strong></div>
                                                                {ord.delivery_date && (
                                                                    <div className="text-emerald-700 font-bold flex items-center gap-1">
                                                                        <Calendar className="w-3 h-3 text-emerald-600 shrink-0" />
                                                                        <span>{formatIndonesianDate(ord.delivery_date)}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                                                Belum Ada Trip
                                                            </div>
                                                        )}
                                                    </td>

                                                    <td className="p-3">
                                                        <div className="font-bold text-[#242222]">{ord.customer_name}</div>
                                                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">{ord.customer_phone || '-'}</div>
                                                    </td>

                                                    <td className="p-3 max-w-xs">
                                                        <div className="text-xs text-slate-600 font-medium leading-snug line-clamp-2" title={ord.customer_address}>
                                                            {ord.customer_address || 'Alamat lokasi pengiriman'}
                                                        </div>
                                                    </td>

                                                    <td className="p-3 space-y-1 min-w-[200px] max-w-sm">
                                                        {itemsList.map((it, idx) => (
                                                            <div key={idx} className="bg-slate-50 p-1.5 rounded-lg border border-slate-200 text-xs flex justify-between gap-2">
                                                                <span className="font-semibold text-slate-700 break-words">#{idx + 1}. {it.glass_type}</span>
                                                                <span className="font-mono text-[#242222] font-bold text-[11px] shrink-0">{it.qty || 1} Pcs</span>
                                                            </div>
                                                        ))}
                                                    </td>

                                                    {/* TAHAPAN DIVISI & STATUS QC */}
                                                    <td className="p-3 space-y-1.5 min-w-[130px]">
                                                        <div className="flex flex-wrap gap-1">
                                                            {relevantDivs.map(div => {
                                                                const st = divProgress[div.code] || 'Belum';
                                                                const isDone = st === 'Selesai';
                                                                const isWorking = st === 'Sedang Dikerjakan';
                                                                return (
                                                                    <span
                                                                        key={div.code}
                                                                        title={`${div.name}: ${st}`}
                                                                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                                                                            isDone
                                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                                : isWorking
                                                                                    ? 'bg-blue-50 text-[#1b68b0] border-blue-200 animate-pulse'
                                                                                    : 'bg-slate-100 text-slate-500 border-slate-200'
                                                                        }`}
                                                                    >
                                                                        {div.code}: {isDone ? '✓' : isWorking ? '...' : '-'}
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                        {isReady ? (
                                                            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-[#70b03c] shrink-0" />
                                                                <span>Lolos QC & Siap Kirim</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700">
                                                                <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                                                <span>Sedang di {ord.current_division ? ord.current_division.replace('divisi_', '').toUpperCase() : 'Divisi'}</span>
                                                            </div>
                                                        )}
                                                    </td>

                                                    <td className="p-3">
                                                        {isReady ? (
                                                            ord.assigned_driver ? (
                                                                <div className="space-y-1">
                                                                    <div className="font-bold text-[#242222] text-xs">
                                                                        {ord.assigned_driver}
                                                                    </div>
                                                                    <div className="text-[11px] text-slate-500 font-medium">
                                                                        {ord.assigned_vehicle}
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleOpenAssignVehicleModal(ord)}
                                                                        className="text-[10px] text-[#1b68b0] hover:underline font-bold flex items-center gap-1 mt-0.5 cursor-pointer"
                                                                    >
                                                                        <Truck className="w-3 h-3" /> Ubah Mobil
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-1.5">
                                                                    <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-bold inline-block">
                                                                        Belum Ditugaskan
                                                                    </span>
                                                                    <div>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleOpenAssignVehicleModal(ord)}
                                                                            className="bg-[#1b68b0] hover:bg-[#15528c] text-white px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition shadow-2xs cursor-pointer"
                                                                        >
                                                                            <Truck className="w-3 h-3" /> Tugaskan Mobil
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )
                                                        ) : (
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-1 text-slate-500 bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg text-[10px] font-bold">
                                                                    <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                                                                    <span>Terkunci (Belum Selesai Divisi)</span>
                                                                </div>
                                                                <p className="text-[10px] text-slate-400 italic">
                                                                    Tunggu QC Divisi Terakhir
                                                                </p>
                                                            </div>
                                                        )}
                                                    </td>

                                                    <td className="p-3">
                                                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold inline-block ${isLunas ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                                                            {isLunas ? 'LUNAS (SJ Putih)' : 'COD (SJ Merah)'}
                                                        </span>
                                                    </td>

                                                    <td className="p-3 text-center">
                                                        {isReady ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => { setSelectedWaybillOrder(ord); setShowWaybillModal(true); }}
                                                                className="bg-blue-50 hover:bg-blue-100 text-[#1b68b0] border border-blue-200 px-2.5 py-1 rounded-lg text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                                                            >
                                                                <Printer className="w-3.5 h-3.5" /> Cetak SJ
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                disabled
                                                                className="bg-slate-100 text-slate-400 border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-bold transition inline-flex items-center gap-1 cursor-not-allowed opacity-60"
                                                                title="Surat Jalan hanya dapat dicetak setelah lolos QC divisi terakhir"
                                                            >
                                                                <Printer className="w-3.5 h-3.5" /> Cetak SJ
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        };

                                        // If 'all' filter is active and not searching, show clear grouped sections
                                        if (deliveryFilterTab === 'all' && !deliverySearchQuery.trim()) {
                                            const readyUnassigned = filteredOrders.filter(o => !o.assigned_driver && !o.assigned_vehicle);
                                            const readyAssigned = filteredOrders.filter(o => o.assigned_driver || o.assigned_vehicle);

                                            return (
                                                <>
                                                    {readyUnassigned.length > 0 && (
                                                        <>
                                                            <tr className="bg-amber-100/80 border-y-2 border-amber-300">
                                                                <td colSpan="9" className="p-2.5 px-4 font-black text-amber-900 text-xs">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="flex items-center gap-2">
                                                                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                                                                            <span>ORDER SPO BELUM DITUGASKAN MOBIL ARMADA ({readyUnassigned.length} SPO SIAP DITUGASKAN)</span>
                                                                        </span>
                                                                        <span className="text-[10px] bg-white text-amber-800 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-300 shadow-2xs">
                                                                            Prioritas Penugasan (Paling Atas)
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            {readyUnassigned.map(renderOrderRow)}
                                                        </>
                                                    )}

                                                    {readyAssigned.length > 0 && (
                                                        <>
                                                            <tr className="bg-slate-100/90 border-y-2 border-slate-300">
                                                                <td colSpan="9" className="p-2.5 px-4 font-black text-slate-700 text-xs">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="flex items-center gap-2">
                                                                            <CheckCircle2 className="w-4 h-4 text-[#70b03c] shrink-0" />
                                                                            <span>ORDER SPO SUDAH DITUGASKAN & PUNYA MOBIL ARMADA ({readyAssigned.length} SPO AKTIF TRIP)</span>
                                                                        </span>
                                                                        <span className="text-[10px] bg-white text-slate-600 font-extrabold px-2.5 py-0.5 rounded-full border border-slate-300 shadow-2xs">
                                                                            Telah Ditugaskan
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            {readyAssigned.map(renderOrderRow)}
                                                        </>
                                                    )}
                                                </>
                                            );
                                        }

                                        // For specific filter tabs or active search:
                                        return (
                                            <>
                                                {deliveryFilterTab === 'unassigned' && (
                                                    <tr className="bg-amber-100/80 border-y-2 border-amber-300">
                                                        <td colSpan="9" className="p-2.5 px-4 font-black text-amber-900 text-xs">
                                                            <div className="flex items-center justify-between">
                                                                <span className="flex items-center gap-2">
                                                                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                                                                    <span>DAFTAR ORDER SELESAI BELUM MENDAPATKAN SUPIR ({filteredOrders.length} SPO)</span>
                                                                </span>
                                                                <span className="text-[10px] bg-white text-amber-800 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-300 shadow-2xs">
                                                                    Perlu Dialokasikan
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}

                                                {deliveryFilterTab === 'assigned' && (
                                                    <tr className="bg-emerald-100/70 border-y-2 border-emerald-300">
                                                        <td colSpan="9" className="p-2.5 px-4 font-black text-emerald-900 text-xs">
                                                            <div className="flex items-center justify-between">
                                                                <span className="flex items-center gap-2">
                                                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                                                    <span>DAFTAR ORDER SELESAI SUDAH MENDAPATKAN SUPIR ({filteredOrders.length} SPO)</span>
                                                                </span>
                                                                <span className="text-[10px] bg-white text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-300 shadow-2xs">
                                                                    Aktif Pengiriman
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}

                                                {deliveryFilterTab === 'in_production' && (
                                                    <tr className="bg-slate-100/90 border-y-2 border-slate-300">
                                                        <td colSpan="9" className="p-2.5 px-4 font-black text-slate-700 text-xs">
                                                            <div className="flex items-center justify-between">
                                                                <span className="flex items-center gap-2">
                                                                    <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                                                                    <span>ORDER MASIH AKTIF DALAM PENGERJAAN DIVISI PABRIK ({filteredOrders.length} SPO — BELUM BISA DIKIRIM)</span>
                                                                </span>
                                                                <span className="text-[10px] bg-white text-slate-600 font-extrabold px-2.5 py-0.5 rounded-full border border-slate-300 shadow-2xs">
                                                                    Terkunci dari Pengiriman
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}

                                                {filteredOrders.map(renderOrderRow)}
                                            </>
                                        );
                                    })()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    )}

                    {/* MODAL PENUGASAN MOBIL PER SPO ORDER */}
                    <AssignVehicleModal
                        show={showAssignVehicleModal}
                        onClose={() => setShowAssignVehicleModal(false)}
                        order={selectedAssignOrder}
                        driver={assignDriver}
                        setDriver={setAssignDriver}
                        vehicle={assignVehicle}
                        setVehicle={setAssignVehicle}
                        deliveryDate={assignDate}
                        setDeliveryDate={setAssignDate}
                        notes={assignNotes}
                        setNotes={setAssignNotes}
                        handleSubmit={handleSingleAssignSubmit}
                        isSubmitting={isSubmittingVehicle}
                    />

                    {/* MODAL EDIT PENUGASAN TRIP ARMADA MOBIL */}
                    <EditTripModal
                        show={showEditTripModal}
                        onClose={() => setShowEditTripModal(false)}
                        trip={editingTripData}
                        driver={editTripDriver}
                        setDriver={setEditTripDriver}
                        vehicle={editTripVehicle}
                        setVehicle={setEditTripVehicle}
                        deliveryDate={editTripDate}
                        setDeliveryDate={setEditTripDate}
                        notes={editTripNotes}
                        setNotes={setEditTripNotes}
                        handleSubmit={handleEditTripSubmit}
                        isSubmitting={isSubmittingEditTrip}
                    />
                </>
            )}
        </div>
    );
}
