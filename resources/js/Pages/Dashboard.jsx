import React, { useState, useEffect } from 'react';
import { Head, useForm, router, usePage, Link } from '@inertiajs/react';
import NewOrderModal from '@/Components/Modals/NewOrderModal';
import EditDraftOrderModal from '@/Components/Modals/EditDraftOrderModal';
import DispatchModal from '@/Components/Modals/DispatchModal';
import ComplaintModal from '@/Components/Modals/ComplaintModal';
import ScrapPopupModal from '@/Components/Modals/ScrapPopupModal';
import GudangDecisionModal from '@/Components/Modals/GudangDecisionModal';
import GatePassModal from '@/Components/Modals/GatePassModal';
import DivisionExecutionModal from '@/Components/Modals/DivisionExecutionModal';
import WaybillModal from '@/Components/Modals/WaybillModal';
import MultiAddressWaybillModal from '@/Components/Modals/MultiAddressWaybillModal';
import BatchWaybillModal from '@/Components/Modals/BatchWaybillModal';
import EmployeeModal from '@/Components/Modals/EmployeeModal';
import CandlestickChart from '@/Components/Charts/CandlestickChart';
import FinanceTransactionModal from '@/Components/Modals/FinanceTransactionModal';
import DriverClaimModal from '@/Components/Modals/DriverClaimModal';
import CodSettlementModal from '@/Components/Modals/CodSettlementModal';
import PrintFinancialReportModal from '@/Components/Modals/PrintFinancialReportModal';
import GlassStickerModal from '@/Components/Modals/GlassStickerModal';
import DashboardOverviewTab from '@/Components/DashboardTabs/DashboardOverviewTab';
import OrdersTab from '@/Components/DashboardTabs/OrdersTab';
import ProductionTab from '@/Components/DashboardTabs/ProductionTab';
import ScrapTab from '@/Components/DashboardTabs/ScrapTab';
import DeliveriesTab from '@/Components/DashboardTabs/DeliveriesTab';
import FinanceTab from '@/Components/DashboardTabs/FinanceTab';
import SuppliersTab from '@/Components/DashboardTabs/SuppliersTab';
import AccessoriesTab from '@/Components/DashboardTabs/AccessoriesTab';
import WarehouseSuppliesTab from '@/Components/DashboardTabs/WarehouseSuppliesTab';
import ToolsTab from '@/Components/DashboardTabs/ToolsTab';
import EmployeesTab from '@/Components/DashboardTabs/EmployeesTab';


export default function Dashboard({ orders: initialOrders = [], scrapGlasses: initialScrap = [], deliveries: initialDeliveries = [], users: initialUsersList = [], activityLogs: initialActivityLogsList = [], financeTransactions: initialFinanceTransactions = [], metrics = {} }) {
    const scrapGlasses = initialScrap;
    const orders = initialOrders;
    const { auth = {} } = usePage().props;
    const userRole = auth.user?.role || 'admin_toko';
    const userName = auth.user?.name || 'User Syp';
    const userEmail = auth.user?.email || 'user@sypglass.co.id';
    const canViewPricing = userRole === 'admin_toko' || userRole === 'owner' || userRole === 'finance' || userRole === 'admin_finance';

    // Finance & Accounting State (Owner, Akuntan, Admin Toko, Driver, Gudang)
    const [financeTransactionsList, setFinanceTransactionsList] = useState(initialFinanceTransactions);
    const [showFinanceModal, setShowFinanceModal] = useState(false);
    const [financeModalPrefill, setFinanceModalPrefill] = useState('biaya_operasional');
    const [financeModalPrefillData, setFinanceModalPrefillData] = useState(null);
    const [financeSubTab, setFinanceSubTab] = useState('pnl');
    const [financeSearchTerm, setFinanceSearchTerm] = useState('');
    const [financeCategoryFilter, setFinanceCategoryFilter] = useState('semua');
    const [financePeriodFilter, setFinancePeriodFilter] = useState('all');

    // Official Corporate Print Modal State (All or Individual)
    const [showPrintReportModal, setShowPrintReportModal] = useState(false);
    const [printReportType, setPrintReportType] = useState('all');

    const handleOpenPrintModal = (type = 'all') => {
        setPrintReportType(type);
        setShowPrintReportModal(true);
    };

    const handleDrilldownOpex = (categoryName) => {
        setFinanceCategoryFilter(categoryName);
        setFinanceSubTab('ledger');
    };

    // Role Integration State: Driver Claims & COD Handover
    const [showDriverClaimModal, setShowDriverClaimModal] = useState(false);
    const [showCodSettlementModal, setShowCodSettlementModal] = useState(false);
    const [selectedCodOrder, setSelectedCodOrder] = useState(null);

    useEffect(() => {
        setFinanceTransactionsList(initialFinanceTransactions);
    }, [initialFinanceTransactions]);

    const handleDeleteFinanceTransaction = (trx) => {
        if (confirm(`Apakah Anda yakin ingin menghapus data transaksi ${trx.transaction_code} (${trx.title})?`)) {
            router.delete(route('finance.transactions.destroy', trx.id), {
                preserveScroll: true
            });
        }
    };

    const handleOpenFinanceModal = (type = 'biaya_operasional', prefillData = null) => {
        setFinanceModalPrefill(type);
        setFinanceModalPrefillData(prefillData);
        setShowFinanceModal(true);
    };

    const handleApproveClaim = (id) => {
        router.post(route('finance.transactions.approve', id), {}, {
            preserveScroll: true
        });
    };

    const handleRejectClaim = (id) => {
        const reason = prompt('Masukkan alasan penolakan klaim:');
        if (reason) {
            router.post(route('finance.transactions.reject', id), {
                rejection_reason: reason
            }, {
                preserveScroll: true
            });
        }
    };

    const handleOpenCodModal = (order) => {
        setSelectedCodOrder(order);
        setShowCodSettlementModal(true);
    };

    const [activeTab, setActiveTab] = useState(
        userRole === 'driver' ? 'deliveries' :
        userRole.startsWith('divisi_') ? 'production' :
        (userRole === 'admin_gudang' || userRole === 'admin_toko') ? 'orders' :
        userRole === 'hrd' ? 'employees' :
        (userRole === 'owner' || userRole === 'finance' || userRole === 'admin_finance') ? 'dashboard' : 'orders'
    );

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const formatIndonesianDate = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatIndonesianDateTime = (dateTimeStr) => {
        if (!dateTimeStr) return '-';
        const d = new Date(dateTimeStr);
        if (isNaN(d.getTime())) return dateTimeStr;
        const datePart = d.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        const timePart = d.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });
        return `${datePart}, ${timePart} WIB`;
    };
    const [activeOrderCard, setActiveOrderCard] = useState(userRole === 'admin_gudang' || userRole.startsWith('divisi_') || userRole === 'driver' ? 'pengerjaan' : 'draft');
    const [searchTerm, setSearchTerm] = useState('');
    const [showNewOrderModal, setShowNewOrderModal] = useState(false);
    const [showScrapModal, setShowScrapModal] = useState(false);
    const [showWaybillModal, setShowWaybillModal] = useState(false);
    const [selectedWaybillOrder, setSelectedWaybillOrder] = useState(null);

    // Employee & Staff Accounts State
    const [employeesList, setEmployeesList] = useState(initialUsersList);
    const [activityLogsList, setActivityLogsList] = useState(initialActivityLogsList);
    const [employeeSubTab, setEmployeeSubTab] = useState('karyawan');
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    const [selectedEmployeeForEdit, setSelectedEmployeeForEdit] = useState(null);
    const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
    const [employeeRoleFilter, setEmployeeRoleFilter] = useState('semua');

    useEffect(() => {
        setEmployeesList(initialUsersList);
    }, [initialUsersList]);

    useEffect(() => {
        setActivityLogsList(initialActivityLogsList);
    }, [initialActivityLogsList]);

    const handleDeleteEmployee = (user) => {
        if (auth.user?.id === user.id) {
            alert('Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan!');
            return;
        }
        if (confirm(`Apakah Anda yakin ingin menghapus/menonaktifkan akun karyawan "${user.name}" (${user.email})?`)) {
            router.delete(route('users.destroy', user.id), {
                preserveScroll: true
            });
        }
    };

    const donutSlices = [
        { id: 'tempered', label: 'Kaca Tempered (8mm-12mm)', shortLabel: 'Tempered', percent: 45, color: '#06b6d4', strokeDasharray: '183.78 408.4', strokeDashoffset: '0', rp: 'Rp 57.8M', volume: '26 SPO' },
        { id: 'laminated', label: 'Kaca Laminated (5+5mm)', shortLabel: 'Laminated', percent: 25, color: '#3b82f6', strokeDasharray: '102.1 408.4', strokeDashoffset: '-188.78', rp: 'Rp 32.1M', volume: '15 SPO' },
        { id: 'bevel', label: 'Kaca Bevel & Cermin Decorative', shortLabel: 'Bevel/Cermin', percent: 18, color: '#10b981', strokeDasharray: '73.51 408.4', strokeDashoffset: '-295.88', rp: 'Rp 23.1M', volume: '10 SPO' },
        { id: 'float', label: 'Kaca Polos / Float Standard', shortLabel: 'Float', percent: 12, color: '#8b5cf6', strokeDasharray: '49.0 408.4', strokeDashoffset: '-374.39', rp: 'Rp 15.5M', volume: '7 SPO' },
    ];

    // Admin Gudang Dispatch Modal State
    const [showDispatchModal, setShowDispatchModal] = useState(false);
    const [selectedDispatchOrder, setSelectedDispatchOrder] = useState(null);
    const [targetDivChoice, setTargetDivChoice] = useState('divisi_ht');

    // Edit Draft Order Modal state
    const [showEditOrderModal, setShowEditOrderModal] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);

    // Promote Draft (Deal & DP 50%) Confirmation Modal State
    const [showPromoteModal, setShowPromoteModal] = useState(false);
    const [targetPromoteOrder, setTargetPromoteOrder] = useState(null);
    const [promotePaymentOption, setPromotePaymentOption] = useState('dp');
    const [promoteDpPercent, setPromoteDpPercent] = useState(50);
    const [promoteCustomPaidAmount, setPromoteCustomPaidAmount] = useState('');

    // Stock Management (Bahan Kaca Lembaran Baru & Sisa) State
    const [activeStockCard, setActiveStockCard] = useState('all');
    const [stockSearchTerm, setStockSearchTerm] = useState('');
    const [showTableSupplierInfo, setShowTableSupplierInfo] = useState(false);
    const [showTablePricingInfo, setShowTablePricingInfo] = useState(false);
    const [showRestockModal, setShowRestockModal] = useState(false);
    const [selectedStockItem, setSelectedStockItem] = useState(null);
    const [restockQtyInput, setRestockQtyInput] = useState(10);
    const [restockDateInput, setRestockDateInput] = useState(new Date().toISOString().split('T')[0]);
    const isDivisionWorker = userRole.startsWith('divisi_');
    const [stockSubTab, setStockSubTab] = useState('lembaran');
    const [productionSubTab, setProductionSubTab] = useState(isDivisionWorker ? `${userRole}_active` : 'all');

    // Filter Stat Pemilahan Order (Masuk & Selesai) berdasarkan Rentang Waktu (Hari Ini, 2 Hari, Seminggu, Sebulan, Setahun)
    const [statTimeRange, setStatTimeRange] = useState('today'); // 'today' | '2days' | 'week' | 'month' | 'year' | 'all'
    const [statFilterType, setStatFilterType] = useState('all'); // 'all' | 'entered' | 'completed'
    const [showRekapModal, setShowRekapModal] = useState(false);

    const isDriverMatch = (driverField, targetUserName) => {
        if (!driverField || !targetUserName) return false;
        const dStr = String(driverField).toLowerCase();
        const uStr = String(targetUserName).toLowerCase();

        const normalize = (s) => s.replace(/\b(pak|driver|supir|utama|dc|engkel|l300|subcon|armada|pick|up)\b/gi, '').trim();
        
        const dClean = normalize(dStr);
        const uClean = normalize(uStr);

        if (dClean.length > 0 && uClean.length > 0) {
            if (dStr.includes(uClean) || uStr.includes(dClean) || dClean.includes(uClean) || uClean.includes(dClean)) {
                return true;
            }
        }

        const uTokens = uStr.split(/\s+/).filter(t => !['pak', 'driver', 'supir', 'utama', 'dc', 'armada'].includes(t.toLowerCase()) && t.length >= 3);
        return uTokens.some(token => dStr.includes(token));
    };

    const isDateInTimeRange = (dateStr, rangeKey) => {
        if (!dateStr) return false;
        const target = new Date(dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T'));
        if (isNaN(target.getTime())) return false;

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (rangeKey === 'today') {
            return target >= todayStart;
        }
        if (rangeKey === '2days') {
            const d = new Date(todayStart);
            d.setDate(d.getDate() - 1);
            return target >= d;
        }
        if (rangeKey === 'week') {
            const d = new Date(todayStart);
            d.setDate(d.getDate() - 6);
            return target >= d;
        }
        if (rangeKey === 'month') {
            const d = new Date(todayStart);
            d.setDate(d.getDate() - 29);
            return target >= d;
        }
        if (rangeKey === 'year') {
            const yearStart = new Date(now.getFullYear(), 0, 1);
            return target >= yearStart;
        }
        if (rangeKey === 'all') {
            return true;
        }
        return false;
    };

    // Disposisi & Divisi Working Order & Execution Modal & Scrap Glass Popup State
    const [selectedWorkingOrder, setSelectedWorkingOrder] = useState(null);
    const [activeWorkingOrderId, setActiveWorkingOrderId] = useState(null);
    const [localStartTimes, setLocalStartTimes] = useState({});
    const [timerTick, setTimerTick] = useState(Date.now());
    const [activeCardNextDiv, setActiveCardNextDiv] = useState('QC_Ready');
    const [showExecutionModal, setShowExecutionModal] = useState(false);
    const [selectedExecutionOrder, setSelectedExecutionOrder] = useState(null);
    const [showScrapPopupModal, setShowScrapPopupModal] = useState(false);

    // Sync selectedExecutionOrder dengan data terbaru dari props.orders setelah update/refresh
    useEffect(() => {
        if (selectedExecutionOrder && Array.isArray(orders)) {
            const fresh = orders.find(o => o.id === selectedExecutionOrder.id);
            if (fresh) {
                setSelectedExecutionOrder(fresh);
            }
        }
    }, [orders]);

    // Live running timer ticker (updates every 1 second)
    useEffect(() => {
        const interval = setInterval(() => {
            setTimerTick(Date.now());
        }, 1000);
        return () => clearInterval(interval);
    }, []);
    const [scrapPopupForm, setScrapPopupForm] = useState({
        glass_type: '',
        length_cm: '',
        width_cm: '',
        rak_location: 'Rak A02'
    });

    // Glass Defect Complaint States & Handlers
    const [showComplaintModal, setShowComplaintModal] = useState(false);
    const [complaintForm, setComplaintForm] = useState({
        reason: 'Kaca Baret / Gores',
        notes: '',
        photo: null,
        photoPreview: null
    });
    const [showGudangDecisionModal, setShowGudangDecisionModal] = useState(false);
    const [selectedComplaintOrder, setSelectedComplaintOrder] = useState(null);

    // Glass Sticker Label Modal State
    const [showStickerModal, setShowStickerModal] = useState(false);
    const [selectedStickerOrder, setSelectedStickerOrder] = useState(null);

    const handleOpenStickerModal = (order) => {
        if (!order) return;
        setSelectedStickerOrder(order);
        setShowStickerModal(true);
    };

    // Sketch Lightbox Modal State
    const [sketchLightbox, setSketchLightbox] = useState({ isOpen: false, url: '', title: '' });

    const handleOpenSketchLightbox = (path, title) => {
        if (!path) return;
        const fullUrl = path.startsWith('http') || path.startsWith('/') ? path : `/storage/${path}`;
        setSketchLightbox({ isOpen: true, url: fullUrl, title: title || 'Sketsa Kaca' });
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

    const handleOpenComplaintModal = (order) => {
        setSelectedExecutionOrder(order);

        const itemsList = Array.isArray(order.items) && order.items.length > 0
            ? order.items
            : [{
                glass_type: order.glass_type || 'Kaca Standard',
                width: order.width || 0,
                height: order.height || 0,
                thickness: order.thickness || 5,
                quantity: order.quantity || 1,
            }];

        const initialDefectives = itemsList.map((item, idx) => ({
            item_index: idx,
            glass_type: item.glass_type || 'Kaca Standard',
            width: item.width || 0,
            height: item.height || 0,
            thickness: item.thickness || 5,
            quantity: item.quantity || 1,
            qty_defective: 0,
        }));

        setComplaintForm({
            reason: 'Kaca Baret / Gores',
            notes: '',
            photo: null,
            photoPreview: null,
            defectiveItems: initialDefectives,
        });
        setShowComplaintModal(true);
    };

    const handleComplaintPhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setComplaintForm(prev => ({
                ...prev,
                photo: file,
                photoPreview: URL.createObjectURL(file)
            }));
        }
    };

    const handleSubmitComplaint = (e) => {
        e.preventDefault();
        if (!selectedExecutionOrder) return;

        const rawNotes = (complaintForm.notes || '').trim();
        const formData = new FormData();
        formData.append('reason', complaintForm.reason);
        formData.append('notes', rawNotes === '' ? '-' : rawNotes);

        const activeDefectives = (complaintForm.defectiveItems || []).filter(item => item.qty_defective > 0);
        formData.append('defective_items', JSON.stringify(activeDefectives));

        if (complaintForm.photo) {
            formData.append('photo', complaintForm.photo);
        }

        router.post(route('orders.complaint', selectedExecutionOrder.id), formData, {
            preserveScroll: true,
            onSuccess: () => {
                setShowComplaintModal(false);
                setShowExecutionModal(false);
            }
        });
    };

    const handleResolveComplaint = (orderId, actionType) => {
        router.post(route('orders.resolve_complaint', orderId), { action: actionType }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowGudangDecisionModal(false);
                setSelectedComplaintOrder(null);
            }
        });
    };

    const handleOpenDetailModal = (order) => {
        setSelectedExecutionOrder(order);
        setShowExecutionModal(true);
    };

    const handleStartWorkstationJob = (order) => {
        setActiveWorkingOrderId(order.id);
        const cKey = order.current_division.replace('divisi_', '').toUpperCase();
        const cStatus = (order.division_progress && order.division_progress[cKey]) ? order.division_progress[cKey] : 'Belum';
        if (cStatus !== 'Sedang Dikerjakan' && cStatus !== 'Selesai') {
            router.post(route('orders.start', order.id), {}, {
                preserveScroll: true,
                onSuccess: () => {
                    setLocalStartTimes(prev => ({ ...prev, [order.id]: Date.now() }));
                }
            });
        }
        setTimeout(() => {
            document.getElementById('active-workstation-card')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleOpenExecutionModal = (order) => {
        handleOpenDetailModal(order);
    };

    const handleFinishJobSubmit = (orderId, targetDiv) => {
        router.post(route('orders.finish', orderId), { next_division: targetDiv }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowExecutionModal(false);
                setSelectedExecutionOrder(null);
                if (activeWorkingOrderId === orderId) {
                    setActiveWorkingOrderId(null);
                }
            }
        });
    };

    const calculateJobElapsedTime = (order, divKey) => {
        if (!order) return '00:00:00';
        const ts = (order.division_timestamps && order.division_timestamps[divKey]) ? order.division_timestamps[divKey] : {};
        const startedAtStr = ts.started_at;
        let startMs = null;
        if (startedAtStr) {
            startMs = new Date(startedAtStr.replace(' ', 'T')).getTime();
        } else if (localStartTimes[order.id]) {
            startMs = localStartTimes[order.id];
        }
        if (!startMs || isNaN(startMs)) return '00:00:00';
        const diffMs = Math.max(0, Date.now() - startMs);
        const totalSecs = Math.floor(diffMs / 1000);
        const hrs = String(Math.floor(totalSecs / 3600)).padStart(2, '0');
        const mins = String(Math.floor((totalSecs % 3600) / 60)).padStart(2, '0');
        const secs = String(totalSecs % 60).padStart(2, '0');
        return `${hrs}:${mins}:${secs}`;
    };

    const handleOpenScrapPopup = (glassItem) => {
        setScrapPopupForm({
            glass_type: glassItem?.glass_type || 'Kaca Cermin 5 mm polos',
            length_cm: '',
            width_cm: '',
            rak_location: 'Rak A02'
        });
        setShowScrapPopupModal(true);
    };

    const handleSaveScrapFromPopup = (e) => {
        e.preventDefault();
        const payload = {
            ...scrapPopupForm,
            glass_type: (scrapPopupForm.glass_type || '').trim() || '-',
            rak_location: (scrapPopupForm.rak_location || '').trim() || '-',
        };
        router.post(route('scrap.store'), payload, {
            onSuccess: () => {
                setShowScrapPopupModal(false);
                setScrapPopupForm({ glass_type: '', length_cm: '', width_cm: '', rak_location: 'Rak A02' });
            }
        });
    };

    const checkOrderDivisi = (o, divKey) => {
        if (!o) return false;
        if (divKey === 'QC_Ready') return o.current_division === 'QC_Ready';
        if (divKey === 'all') return (o.status === 'pengerjaan' || o.current_division === 'QC_Ready') && o.current_division !== 'admin_gudang';
        if (o.current_division === divKey) return true;

        const code = divKey.replace('divisi_', '').toUpperCase();
        const p = o.division_progress || {};
        return p[code] === 'Selesai' || p[code] === 'Sedang Dikerjakan';
    };

    // WhatsApp Supplier Restock Modal State
    const [showSupplierWaModal, setShowSupplierWaModal] = useState(false);
    const [selectedWaStockItem, setSelectedWaStockItem] = useState(null);
    const [waOrderQty, setWaOrderQty] = useState(20);
    const [supplierName, setSupplierName] = useState('PT Asahimas Flat Glass (Supplier Utama)');
    const [supplierPhone, setSupplierPhone] = useState('6281234567890');

    // Modal Tambah & Edit Jenis Barang Stok Baru State
    const [showAddStockModal, setShowAddStockModal] = useState(false);
    const [showEditStockModal, setShowEditStockModal] = useState(false);
    const [newStockForm, setNewStockForm] = useState({
        item_code: '',
        name: '',
        category: 'Kaca Cermin',
        size: '122 x 244 cm',
        thickness_mm: 5,
        buy_price: '',
        sell_price: '',
        rate_gm: 10000,
        rate_ht: 1000,
        rate_bv: 15000,
        rate_etsa: 50000,
        qty: 0,
        unit: 'Lembar',
        supplier_name: 'PT Asahimas Flat Glass Tbk (Divisi Cermin)',
        supplier_phone: '6281234567890',
        supplier_pic: 'Pak Gunawan'
    });
    const [editStockForm, setEditStockForm] = useState({
        id: null,
        item_code: '',
        name: '',
        category: 'Kaca Cermin',
        size: '122 x 244 cm',
        thickness_mm: 5,
        buy_price: '',
        sell_price: '',
        rate_gm: 10000,
        rate_ht: 1000,
        rate_bv: 15000,
        rate_etsa: 50000,
        qty: 0,
        unit: 'Lembar',
        supplier_name: '',
        supplier_phone: '',
        supplier_pic: ''
    });

    // Supplier Management State
    const [suppliersList, setSuppliersList] = useState([
        { id: 1, name: 'PT Asahimas Flat Glass Tbk (Divisi Cermin)', category: 'Kaca Cermin & Bening', phone: '6281234567890', pic: 'Pak Gunawan', address: 'Kawasan Industri Ancol, Jakarta Utara', status: 'Mitra Utama' },
        { id: 2, name: 'PT Mulia Glass Float & Mirror', category: 'Kaca Float & Cermin Grey', phone: '6281398765432', pic: 'Ibu Siska', address: 'Jl. Raya Lemahabang, Cikarang', status: 'Mitra Aktif' },
        { id: 3, name: 'PT Kaca Tempered Nusantara', category: 'Kaca Tempered & Laminated', phone: '6281908070605', pic: 'Pak Irwan', address: 'Kawasan Industri Jababeka, Bekasi', status: 'Mitra Aktif' },
        { id: 4, name: 'PT Global Tinted Glass Import', category: 'Kaca Tinted & Dark Grey', phone: '6281577889900', pic: 'Pak Budianto', address: 'Kawasan Industri MM2100, Cibitung', status: 'Mitra Impor' },
        { id: 5, name: 'CV ArtGlass Dekoratif Etsa', category: 'Kaca Etsa & Sandblast', phone: '6281288990011', pic: 'Pak Rudy', address: 'Jl. Soekarno Hatta, Bandung', status: 'Mitra Lokal' },
    ]);
    const [supplierSearchTerm, setSupplierSearchTerm] = useState('');
    const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
    const [newSupplierForm, setNewSupplierForm] = useState({
        name: '',
        category: 'Kaca Cermin & Bening',
        phone: '6281234567890',
        pic: '',
        address: '',
        status: 'Mitra Aktif'
    });

    const handleAddSupplierSubmit = (e) => {
        e.preventDefault();
        if (!newSupplierForm.name) return;

        const newSup = {
            id: Date.now(),
            name: newSupplierForm.name,
            category: newSupplierForm.category,
            phone: newSupplierForm.phone,
            pic: newSupplierForm.pic,
            address: newSupplierForm.address,
            status: newSupplierForm.status || 'Mitra Aktif'
        };

        setSuppliersList(prev => [newSup, ...prev]);
        setShowAddSupplierModal(false);
        setNewSupplierForm({
            name: '',
            category: 'Kaca Cermin & Bening',
            phone: '6281234567890',
            pic: '',
            address: '',
            status: 'Mitra Aktif'
        });
    };

    // Modal Edit Supplier State
    const [showEditSupplierModal, setShowEditSupplierModal] = useState(false);
    const [editSupplierForm, setEditSupplierForm] = useState({
        id: null,
        name: '',
        category: '',
        phone: '',
        pic: '',
        address: '',
        status: 'Mitra Aktif'
    });

    const handleOpenEditSupplierModal = (sup) => {
        setEditSupplierForm({
            id: sup.id,
            name: sup.name || '',
            category: sup.category || '',
            phone: sup.phone || '',
            pic: sup.pic || '',
            address: sup.address || '',
            status: sup.status || 'Mitra Aktif'
        });
        setShowEditSupplierModal(true);
    };

    const handleEditSupplierSubmit = (e) => {
        e.preventDefault();
        if (!editSupplierForm.name) return;

        setSuppliersList(prev => prev.map(sup => {
            if (sup.id === editSupplierForm.id) {
                return {
                    ...sup,
                    name: editSupplierForm.name,
                    category: editSupplierForm.category,
                    phone: editSupplierForm.phone,
                    pic: editSupplierForm.pic,
                    address: editSupplierForm.address,
                    status: editSupplierForm.status
                };
            }
            return sup;
        }));

        setShowEditSupplierModal(false);
    };

    const handleDeleteSupplier = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus data supplier ini?')) {
            setSuppliersList(prev => prev.filter(sup => sup.id !== id));
        }
    };
    // Operational Tools & Machinery Management State (Alat Penunjang)
    const [toolsList, setToolsList] = useState([
        { id: 1, tool_code: 'ALT-001', name: 'Mesin Bor Kaca Portable Heavy Duty', category: 'Mesin Bor & Potong', total_qty: 3, available_qty: 2, unit: 'Unit', condition: 'Bagus', location: 'Rak Alat A1' },
        { id: 2, tool_code: 'ALT-002', name: 'Mesin Slepan / Hand Grinder Edge Polish', category: 'Mesin Bor & Potong', total_qty: 4, available_qty: 3, unit: 'Unit', condition: 'Bagus', location: 'Rak Alat A2' },
        { id: 3, tool_code: 'ALT-003', name: 'Set Mata Bor Kaca Diamond Coated (6-50mm)', category: 'Mata Bor & Mata Potong', total_qty: 10, available_qty: 8, unit: 'Set', condition: 'Bagus', location: 'Kotak Perkakas B1' },
        { id: 4, tool_code: 'ALT-004', name: 'Mesin Suction Cup Vakum Ganda Pengepas Kaca', category: 'Mesin & Alat Vakum', total_qty: 5, available_qty: 4, unit: 'Pcs', condition: 'Bagus', location: 'Rak Alat C1' },
        { id: 5, tool_code: 'ALT-005', name: 'Tangga Alumunium Lipat Multi-Fungsi 4.7 Meter', category: 'Peralatan Lapangan', total_qty: 2, available_qty: 1, unit: 'Unit', condition: 'Bagus', location: 'Gudang Belakang' },
        { id: 6, tool_code: 'ALT-006', name: 'Set Obeng Presisi & Kunci L Heavy Duty', category: 'Handtool & Kunci', total_qty: 6, available_qty: 6, unit: 'Set', condition: 'Bagus', location: 'Toolbox Teknisi 1' },
        { id: 7, tool_code: 'ALT-007', name: 'Mesin Potong Rumput Area Pabrik', category: 'Peralatan Umum & Kebersihan', total_qty: 1, available_qty: 1, unit: 'Unit', condition: 'Bagus', location: 'Gudang Kebersihan' },
        { id: 8, tool_code: 'ALT-008', name: 'Cangkul & Sekop Heavy Duty Operasional', category: 'Peralatan Umum & Kebersihan', total_qty: 3, available_qty: 3, unit: 'Set', condition: 'Bagus', location: 'Gudang Kebersihan' },
        { id: 9, tool_code: 'ALT-009', name: 'Suction Cup Vakum Heavy Duty (Pengangkat Kaca Driver)', category: 'Mesin & Alat Vakum', total_qty: 8, available_qty: 6, unit: 'Pcs', condition: 'Bagus', location: 'Rak Armada Supir' },
        { id: 10, tool_code: 'ALT-010', name: 'Helm Safety & Kacamata Anti-Pecah Kaca', category: 'Peralatan Lapangan', total_qty: 10, available_qty: 10, unit: 'Set', condition: 'Bagus', location: 'Loker Supir' },
        { id: 11, tool_code: 'ALT-011', name: 'Sarung Tangan Cut-Resistant / Anti Gores', category: 'Peralatan Lapangan', total_qty: 15, available_qty: 12, unit: 'Pasang', condition: 'Bagus', location: 'Loker Supir' },
        { id: 12, tool_code: 'ALT-012', name: 'Tali Webbing Ratchet Tie Down 5 Ton (Pengikat Kaca)', category: 'Peralatan Lapangan', total_qty: 12, available_qty: 10, unit: 'Set', condition: 'Bagus', location: 'Gudang Logistik Mobil' },
        { id: 13, tool_code: 'ALT-013', name: 'Matras Busa Pelindung Kaca Armada', category: 'Peralatan Lapangan', total_qty: 6, available_qty: 4, unit: 'Pcs', condition: 'Bagus', location: 'Gudang Logistik Mobil' },
    ]);

    const [toolBorrowings, setToolBorrowings] = useState([
        {
            id: 1,
            tool_id: 1,
            tool_code: 'ALT-001',
            tool_name: 'Mesin Bor Kaca Portable Heavy Duty',
            borrower_name: 'Teknisi Asep',
            purpose: 'Pengerjaan bor lubang engsel sekat kaca Dago (SPO-0129)',
            borrow_date: '2026-08-20',
            expected_return: '2026-08-21',
            actual_return: null,
            qty_borrowed: 1,
            status: 'Sedang Dipinjam'
        },
        {
            id: 2,
            tool_id: 5,
            tool_code: 'ALT-005',
            tool_name: 'Tangga Alumunium Lipat Multi-Fungsi 4.7 Meter',
            borrower_name: 'Teknisi Budi',
            purpose: 'Pemasangan kanopi kaca tempered Gedung Wisma',
            borrow_date: '2026-08-20',
            expected_return: '2026-08-22',
            actual_return: null,
            qty_borrowed: 1,
            status: 'Sedang Dipinjam'
        }
    ]);

    const [toolSearchTerm, setToolSearchTerm] = useState('');
    const [toolSubTab, setToolSubTab] = useState('katalog');
    const [repairFilterTab, setRepairFilterTab] = useState('semua');
    const [dashboardChartMetric, setDashboardChartMetric] = useState(canViewPricing ? 'revenue' : 'orders');
    const [hoveredDonutSegment, setHoveredDonutSegment] = useState(null);
    const [showAddToolModal, setShowAddToolModal] = useState(false);
    const [showBorrowToolModal, setShowBorrowToolModal] = useState(false);

    const [showCompleteRepairModal, setShowCompleteRepairModal] = useState(false);
    const [selectedRepairTool, setSelectedRepairTool] = useState(null);
    const [repairForm, setRepairForm] = useState({
        damaged_part: '',
        action_taken: '',
        replaced_components: '',
        repair_cost: '',
        technician_name: '',
        completion_date: new Date().toISOString().split('T')[0]
    });

    const [newToolForm, setNewToolForm] = useState({
        tool_code: '',
        name: '',
        category: 'Mesin Bor & Potong',
        total_qty: 1,
        unit: 'Unit',
        condition: 'Bagus',
        location: 'Rak Utama'
    });

    const [borrowToolForm, setBorrowToolForm] = useState({
        borrower_name: '',
        purpose: '',
        borrow_date: new Date().toISOString().split('T')[0],
        expected_return: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        selected_items: [{ tool_id: '', qty: 1 }]
    });

    const handleAddBorrowItemRow = () => {
        setBorrowToolForm(prev => ({
            ...prev,
            selected_items: [...prev.selected_items, { tool_id: '', qty: 1 }]
        }));
    };

    const handleRemoveBorrowItemRow = (index) => {
        setBorrowToolForm(prev => ({
            ...prev,
            selected_items: prev.selected_items.filter((_, idx) => idx !== index)
        }));
    };

    const handleBorrowItemChange = (index, field, value) => {
        setBorrowToolForm(prev => {
            const updated = [...prev.selected_items];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, selected_items: updated };
        });
    };

    const handleAddToolSubmit = (e) => {
        e.preventDefault();
        if (!newToolForm.name) return;

        const autoCode = newToolForm.tool_code || ('ALT-00' + (toolsList.length + 1));
        const totalQty = parseInt(newToolForm.total_qty) || 1;

        const newTool = {
            id: Date.now(),
            tool_code: autoCode,
            name: newToolForm.name,
            category: newToolForm.category,
            total_qty: totalQty,
            available_qty: totalQty,
            unit: newToolForm.unit || 'Unit',
            condition: newToolForm.condition || 'Bagus',
            location: newToolForm.location || 'Gudang Utama'
        };

        setToolsList(prev => [newTool, ...prev]);
        setShowAddToolModal(false);
        setNewToolForm({
            tool_code: '',
            name: '',
            category: 'Mesin Bor & Potong',
            total_qty: 1,
            unit: 'Unit',
            condition: 'Bagus',
            location: 'Rak Utama'
        });
    };

    const handleBorrowToolSubmit = (e) => {
        e.preventDefault();
        if (!borrowToolForm.borrower_name) return;

        const validItems = borrowToolForm.selected_items.filter(it => it.tool_id !== '');
        if (validItems.length === 0) {
            alert('Pilih setidaknya 1 alat untuk dipinjam!');
            return;
        }

        // Validate availability for each tool
        for (const item of validItems) {
            const toolObj = toolsList.find(t => t.id === parseInt(item.tool_id));
            const qtyBorrow = parseInt(item.qty) || 1;
            if (!toolObj || qtyBorrow > toolObj.available_qty) {
                alert(`Alat "${toolObj ? toolObj.name : 'Terpilih'}" hanya memiliki stok ${toolObj ? toolObj.available_qty : 0} unit!`);
                return;
            }
        }

        const itemsList = validItems.map(item => {
            const toolObj = toolsList.find(t => t.id === parseInt(item.tool_id));
            return {
                tool_id: toolObj.id,
                tool_code: toolObj.tool_code,
                tool_name: toolObj.name,
                unit: toolObj.unit,
                qty: parseInt(item.qty) || 1
            };
        });

        setToolsList(prev => prev.map(t => {
            const foundItem = itemsList.find(it => it.tool_id === t.id);
            if (foundItem) {
                return { ...t, available_qty: t.available_qty - foundItem.qty };
            }
            return t;
        }));

        const newBorrow = {
            id: Date.now(),
            items: itemsList,
            tool_code: itemsList.map(i => i.tool_code).join(', '),
            tool_name: itemsList.map(i => `${i.tool_name} (${i.qty} ${i.unit})`).join(', '),
            borrower_name: borrowToolForm.borrower_name,
            purpose: borrowToolForm.purpose || 'Keperluan Pekerjaan Teknisi',
            borrow_date: borrowToolForm.borrow_date,
            expected_return: borrowToolForm.expected_return,
            actual_return: null,
            qty_borrowed: itemsList.reduce((sum, i) => sum + i.qty, 0),
            status: 'Sedang Dipinjam'
        };

        setToolBorrowings(prev => [newBorrow, ...prev]);
        setShowBorrowToolModal(false);
        setBorrowToolForm({
            borrower_name: '',
            purpose: '',
            borrow_date: new Date().toISOString().split('T')[0],
            expected_return: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
            selected_items: [{ tool_id: '', qty: 1 }]
        });
    };

    // Warehouse Operational Supplies State (Perlengkapan Gudang - Habis Pakai)
    const [warehouseSuppliesList, setWarehouseSuppliesList] = useState([
        { id: 1, item_code: 'PLK-001', name: 'Sarung Tangan Safety Antigores / Cut Resistant', category: 'APD & Keselamatan Kerja', stock_qty: 45, min_stock: 10, unit: 'Pasang', location: 'Rak APD A1', status: 'Aman' },
        { id: 2, item_code: 'PLK-002', name: 'Kacamata Safety Bening Protective Goggles', category: 'APD & Keselamatan Kerja', stock_qty: 28, min_stock: 5, unit: 'Pcs', location: 'Rak APD A2', status: 'Aman' },
        { id: 3, item_code: 'PLK-003', name: 'Cutter Heavy Duty Operasional & Mata Pisau Refill', category: 'Perkakas Tangan Habis Pakai', stock_qty: 15, min_stock: 5, unit: 'Set', location: 'Rak Alat B1', status: 'Aman' },
        { id: 4, item_code: 'PLK-004', name: 'Lakban Bening Packaging Heavy Duty 2 Inch', category: 'Peralatan Packaging & Pengiriman', stock_qty: 60, min_stock: 15, unit: 'Roll', location: 'Gudang Packaging', status: 'Aman' },
        { id: 5, item_code: 'PLK-005', name: 'Cairan Pembersih Kaca Special Glass Cleaner 5L', category: 'Bahan Kimia & Kebersihan Kaca', stock_qty: 6, min_stock: 8, unit: 'Galon', location: 'Gudang B1', status: 'Menipis' },
        { id: 6, item_code: 'PLK-006', name: 'Amplas Kaca Halus & Sanding Pad Edge', category: 'Consumables Mesin Potong & Gosok', stock_qty: 40, min_stock: 10, unit: 'Lembar', location: 'Rak Finishing C2', status: 'Aman' },
        { id: 7, item_code: 'PLK-007', name: 'Oli Pelumas Mesin Bor & Mesin Potong (Lubricant)', category: 'Perawatan Mesin & Pelumas', stock_qty: 4, min_stock: 5, unit: 'Liter', location: 'Gudang Mesin D1', status: 'Menipis' },
        { id: 8, item_code: 'PLK-008', name: 'Masker Respirator Filter Debu Etsa & Gosok', category: 'APD & Keselamatan Kerja', stock_qty: 50, min_stock: 15, unit: 'Pcs', location: 'Rak APD A3', status: 'Aman' },
    ]);

    const [supplyUsageLogs, setSupplyUsageLogs] = useState([
        { id: 1, item_code: 'PLK-001', item_name: 'Sarung Tangan Safety Antigores / Cut Resistant', used_qty: 5, unit: 'Pasang', user_division: 'Divisi Potong (HT)', taker_name: 'Pekerja Supri', usage_date: '2026-09-04', notes: 'Penggantian sarung tangan kerja tim potong kaca cermin' },
        { id: 2, item_code: 'PLK-004', item_name: 'Lakban Bening Packaging Heavy Duty 2 Inch', used_qty: 12, unit: 'Roll', user_division: 'Admin Gudang / Pengiriman', taker_name: 'Driver Agus', usage_date: '2026-09-05', notes: 'Packing peti kayu kaca cermin pesanan proyek SPO-0128' },
        { id: 3, item_code: 'PLK-005', item_name: 'Cairan Pembersih Kaca Special Glass Cleaner 5L', used_qty: 2, unit: 'Galon', user_division: 'Divisi Gosok (GM)', taker_name: 'Pekerja Bambang', usage_date: '2026-09-06', notes: 'Pembersihan sisa residu polishing kaca beveling' },
    ]);

    const [supplySearchTerm, setSupplySearchTerm] = useState('');
    const [supplySubTab, setSupplySubTab] = useState('katalog');
    const [showAddSupplyModal, setShowAddSupplyModal] = useState(false);
    const [showUseSupplyModal, setShowUseSupplyModal] = useState(false);

    const [newSupplyForm, setNewSupplyForm] = useState({
        item_code: '',
        name: '',
        category: 'APD & Keselamatan Kerja',
        stock_qty: 10,
        min_stock: 5,
        unit: 'Pcs',
        location: 'Gudang Utama'
    });

    const [useSupplyForm, setUseSupplyForm] = useState({
        supply_id: '',
        used_qty: 1,
        user_division: 'Divisi Potong (HT)',
        taker_name: '',
        usage_date: new Date().toISOString().split('T')[0],
        notes: ''
    });

    const handleAddSupplySubmit = (e) => {
        e.preventDefault();
        if (!newSupplyForm.name) return;

        const autoCode = newSupplyForm.item_code || ('PLK-00' + (warehouseSuppliesList.length + 1));
        const stockQty = parseInt(newSupplyForm.stock_qty) || 0;
        const minStock = parseInt(newSupplyForm.min_stock) || 5;

        let status = 'Aman';
        if (stockQty <= 0) status = 'Habis';
        else if (stockQty <= minStock) status = 'Menipis';

        const newItem = {
            id: Date.now(),
            item_code: autoCode,
            name: newSupplyForm.name,
            category: newSupplyForm.category,
            stock_qty: stockQty,
            min_stock: minStock,
            unit: newSupplyForm.unit || 'Pcs',
            location: newSupplyForm.location || 'Gudang Utama',
            status: status
        };

        setWarehouseSuppliesList(prev => [newItem, ...prev]);
        setShowAddSupplyModal(false);
        setNewSupplyForm({
            item_code: '',
            name: '',
            category: 'APD & Keselamatan Kerja',
            stock_qty: 10,
            min_stock: 5,
            unit: 'Pcs',
            location: 'Gudang Utama'
        });
    };

    const handleUseSupplySubmit = (e) => {
        e.preventDefault();
        if (!useSupplyForm.supply_id || !useSupplyForm.taker_name) {
            alert('Pilih barang perlengkapan dan isi nama pengambil!');
            return;
        }

        const supplyObj = warehouseSuppliesList.find(s => s.id === parseInt(useSupplyForm.supply_id));
        const qtyToUse = parseInt(useSupplyForm.used_qty) || 1;

        if (!supplyObj || qtyToUse > supplyObj.stock_qty) {
            alert(`Stok "${supplyObj ? supplyObj.name : 'Perlengkapan'}" tidak mencukupi! Sisa stok saat ini: ${supplyObj ? supplyObj.stock_qty : 0} ${supplyObj ? supplyObj.unit : ''}.`);
            return;
        }

        setWarehouseSuppliesList(prev => prev.map(s => {
            if (s.id === supplyObj.id) {
                const newQty = s.stock_qty - qtyToUse;
                let newStatus = 'Aman';
                if (newQty <= 0) newStatus = 'Habis';
                else if (newQty <= s.min_stock) newStatus = 'Menipis';
                return { ...s, stock_qty: newQty, status: newStatus };
            }
            return s;
        }));

        const newLog = {
            id: Date.now(),
            item_code: supplyObj.item_code,
            item_name: supplyObj.name,
            used_qty: qtyToUse,
            unit: supplyObj.unit,
            user_division: useSupplyForm.user_division,
            taker_name: useSupplyForm.taker_name,
            usage_date: useSupplyForm.usage_date || new Date().toISOString().split('T')[0],
            notes: useSupplyForm.notes || 'Pemakaian operasional gudang/divisi'
        };

        setSupplyUsageLogs(prev => [newLog, ...prev]);
        setShowUseSupplyModal(false);
        setUseSupplyForm({
            supply_id: '',
            used_qty: 1,
            user_division: 'Divisi Potong (HT)',
            taker_name: '',
            usage_date: new Date().toISOString().split('T')[0],
            notes: ''
        });
    };

    // Warehouse Supply Restock Requests to Admin Toko State
    const [supplyRestockRequests, setSupplyRestockRequests] = useState([
        {
            id: 1,
            supply_id: 5,
            item_code: 'PLK-005',
            item_name: 'Cairan Pembersih Kaca Special Glass Cleaner 5L',
            current_stock: 6,
            request_qty: 10,
            unit: 'Galon',
            priority: 'Mendesak / Stok Menipis',
            notes: 'Stok sisa 6 galon di gudang B1, dibutuhkan untuk proses finishing beveling minggu depan.',
            requested_by: 'Admin Gudang (Joko)',
            requested_at: '2026-09-06',
            status: 'Menunggu Persetujuan Admin Toko'
        },
        {
            id: 2,
            supply_id: 7,
            item_code: 'PLK-007',
            item_name: 'Oli Pelumas Mesin Bor & Mesin Potong (Lubricant)',
            current_stock: 4,
            request_qty: 12,
            unit: 'Liter',
            priority: 'Biasa',
            notes: 'Stok mendekati batas minimum 5L, mohon dipesankan ke supplier pelumas.',
            requested_by: 'Admin Gudang (Joko)',
            requested_at: '2026-09-05',
            status: 'Disetujui & Dipesan'
        }
    ]);

    const [showRequestRestockModal, setShowRequestRestockModal] = useState(false);
    const [requestRestockForm, setRequestRestockForm] = useState({
        supply_id: '',
        request_qty: 10,
        priority: 'Mendesak / Stok Menipis',
        notes: ''
    });

    const handleOpenRequestRestockModal = (supplyItem = null) => {
        if (supplyItem) {
            setRequestRestockForm({
                supply_id: supplyItem.id,
                request_qty: Math.max(10, supplyItem.min_stock * 2),
                priority: supplyItem.status === 'Habis' ? 'Mendesak / Stok Habis' : 'Mendesak / Stok Menipis',
                notes: `Stok sisa ${supplyItem.stock_qty} ${supplyItem.unit} (lokasi: ${supplyItem.location}). Mohon restok ke Admin Toko.`
            });
        } else {
            setRequestRestockForm({
                supply_id: '',
                request_qty: 10,
                priority: 'Mendesak / Stok Menipis',
                notes: ''
            });
        }
        setShowRequestRestockModal(true);
    };

    const handleRequestRestockSubmit = (e) => {
        e.preventDefault();
        if (!requestRestockForm.supply_id) {
            alert('Pilih perlengkapan yang ingin diajukan restok!');
            return;
        }

        const supplyObj = warehouseSuppliesList.find(s => s.id === parseInt(requestRestockForm.supply_id));
        if (!supplyObj) return;

        const reqQty = parseInt(requestRestockForm.request_qty) || 1;

        const newReq = {
            id: Date.now(),
            supply_id: supplyObj.id,
            item_code: supplyObj.item_code,
            item_name: supplyObj.name,
            current_stock: supplyObj.stock_qty,
            request_qty: reqQty,
            unit: supplyObj.unit,
            priority: requestRestockForm.priority || 'Biasa',
            notes: requestRestockForm.notes || 'Pengajuan restok dari Admin Gudang',
            requested_by: userName || 'Admin Gudang',
            requested_at: new Date().toISOString().split('T')[0],
            status: 'Menunggu Persetujuan Admin Toko'
        };

        setSupplyRestockRequests(prev => [newReq, ...prev]);
        setShowRequestRestockModal(false);

        const waMsg = `Halo Admin Toko SYP Glass,%0A%0AMeminta pengajuan RESTOK PERLENGKAPAN GUDANG:%0A• Kode & Barang: [${supplyObj.item_code}] ${supplyObj.name}%0A• Sisa Stok Gudang: ${supplyObj.stock_qty} ${supplyObj.unit}%0A• Jumlah Pengajuan Restok: ${reqQty} ${supplyObj.unit}%0A• Prioritas: ${requestRestockForm.priority}%0A• Catatan: ${requestRestockForm.notes || '-'}`;

        if (confirm(`✅ Pengajuan restok "${supplyObj.name}" (${reqQty} ${supplyObj.unit}) BERHASIL dikirim ke Admin Toko!\n\nApakah Anda ingin membuka kirim pesan WhatsApp otomatis ke Admin Toko?`)) {
            window.open(`https://api.whatsapp.com/send?text=${waMsg}`, '_blank');
        }
    };

    const handleApproveRestockRequest = (reqId) => {
        const targetReq = supplyRestockRequests.find(r => r.id === reqId);
        setSupplyRestockRequests(prev => prev.map(r => {
            if (r.id === reqId) {
                return { ...r, status: 'Disetujui & Dipesan (Didanai Finance)' };
            }
            return r;
        }));

        if (targetReq && confirm(`✅ Pengajuan restok "${targetReq.item_name}" BERHASIL disetujui!\n\nApakah Anda ingin langsung mencatat pembiayaan pengadaan alat ini ke Modul Finance?`)) {
            handleOpenFinanceModal('pembelian_alat', {
                type: 'pembelian_alat',
                category: 'Alat & Mesin',
                title: `Pengadaan Alat/Perlengkapan: ${targetReq.item_name} (+${targetReq.request_qty} ${targetReq.unit})`,
                amount: (targetReq.request_qty || 1) * 350000,
                supplier_name: 'Toko Teknik Industri Jaya Sentosa',
                notes: `Didanai untuk kebutuhan Gudang & Pabrik (Kode: ${targetReq.item_code})`
            });
        } else {
            alert('✅ Pengajuan restok disetujui & status diubah menjadi Disetujui & Dipesan (Didanai Finance)!');
        }
    };

    const handleCompleteRestockRequest = (req) => {
        setSupplyRestockRequests(prev => prev.map(r => {
            if (r.id === req.id) {
                return { ...r, status: 'Selesai Restok' };
            }
            return r;
        }));

        setWarehouseSuppliesList(prev => prev.map(s => {
            if (s.id === req.supply_id || s.item_code === req.item_code) {
                const newQty = s.stock_qty + req.request_qty;
                let newStatus = 'Aman';
                if (newQty <= 0) newStatus = 'Habis';
                else if (newQty <= s.min_stock) newStatus = 'Menipis';
                return { ...s, stock_qty: newQty, status: newStatus };
            }
            return s;
        }));

        alert(`🎉 Restok "${req.item_name}" sejumlah +${req.request_qty} ${req.unit} SELESAI & STOK GUDANG BERHASIL DITAMBAHKAN!`);
    };

    // Return Tool Modal State
    const [showReturnToolModal, setShowReturnToolModal] = useState(false);
    const [selectedReturnBorrow, setSelectedReturnBorrow] = useState(null);
    const [actualReturnDate, setActualReturnDate] = useState('');
    const [returnNotes, setReturnNotes] = useState('');
    const [returnConditionStatus, setReturnConditionStatus] = useState('Baik');
    const [returnDamagedQty, setReturnDamagedQty] = useState(0);
    const [returnLostQty, setReturnLostQty] = useState(0);

    // Edit Tool Condition & Damage/Loss State (Katalog)
    const [showEditToolModal, setShowEditToolModal] = useState(false);
    const [selectedToolForEdit, setSelectedToolForEdit] = useState(null);
    const [toolEditForm, setToolEditForm] = useState({
        total_qty: 1,
        condition: 'Bagus',
        damaged_qty: 0,
        lost_qty: 0,
        condition_notes: '',
        location: ''
    });

    const handleOpenEditToolModal = (tool) => {
        setSelectedToolForEdit(tool);
        setToolEditForm({
            total_qty: tool.total_qty || 1,
            condition: tool.condition || 'Bagus',
            damaged_qty: tool.damaged_qty || 0,
            lost_qty: tool.lost_qty || 0,
            condition_notes: tool.condition_notes || '',
            location: tool.location || ''
        });
        setShowEditToolModal(true);
    };

    const handleSaveToolEditSubmit = (e) => {
        e.preventDefault();
        if (!selectedToolForEdit) return;

        const tot = Math.max(0, parseInt(toolEditForm.total_qty) || 1);
        const dmg = Math.max(0, parseInt(toolEditForm.damaged_qty) || 0);
        const lst = Math.max(0, parseInt(toolEditForm.lost_qty) || 0);

        const currentlyBorrowed = (selectedToolForEdit.total_qty - selectedToolForEdit.available_qty - (selectedToolForEdit.damaged_qty || 0) - (selectedToolForEdit.lost_qty || 0));
        const safeBorrowed = Math.max(0, currentlyBorrowed);

        const newAvailable = Math.max(0, tot - safeBorrowed - dmg - lst);

        setToolsList(prev => prev.map(t => {
            if (t.id === selectedToolForEdit.id) {
                return {
                    ...t,
                    total_qty: tot,
                    damaged_qty: dmg,
                    lost_qty: lst,
                    available_qty: newAvailable,
                    condition: toolEditForm.condition,
                    condition_notes: toolEditForm.condition_notes,
                    location: toolEditForm.location
                };
            }
            return t;
        }));

        setShowEditToolModal(false);
        setSelectedToolForEdit(null);
    };

    const handleStartRepair = (toolId) => {
        setToolsList(prev => prev.map(t => {
            if (t.id === toolId) {
                return {
                    ...t,
                    repair_stage: 'Sedang Dalam Perbaikan',
                    condition: 'Rusak Ringan'
                };
            }
            return t;
        }));
    };

    const handleOpenCompleteRepairModal = (tool) => {
        setSelectedRepairTool(tool);
        const today = new Date().toISOString().split('T')[0];
        setRepairForm({
            damaged_part: tool.repair_details?.damaged_part || tool.condition_notes || '',
            action_taken: tool.repair_details?.action_taken || '',
            replaced_components: tool.repair_details?.replaced_components || '',
            repair_cost: tool.repair_details?.repair_cost || '',
            technician_name: tool.repair_details?.technician_name || '',
            completion_date: tool.repair_details?.completion_date || today
        });
        setShowCompleteRepairModal(true);
    };

    const handleSaveCompleteRepairSubmit = (e) => {
        e.preventDefault();
        if (!selectedRepairTool) return;

        setToolsList(prev => prev.map(t => {
            if (t.id === selectedRepairTool.id) {
                const restoredAvailable = t.available_qty + (t.damaged_qty || 0);
                return {
                    ...t,
                    damaged_qty: 0,
                    available_qty: restoredAvailable,
                    condition: (t.lost_qty || 0) > 0 ? 'Hilang' : 'Bagus',
                    repair_stage: 'Selesai',
                    repair_details: { ...repairForm },
                    condition_notes: `[Selesai ${repairForm.completion_date}] ${repairForm.damaged_part || 'Perbaikan Selesai'}`
                };
            }
            return t;
        }));

        setShowCompleteRepairModal(false);
        setSelectedRepairTool(null);
    };

    const handleOpenReturnModal = (borrowLog) => {
        setSelectedReturnBorrow(borrowLog);
        const today = new Date().toISOString().split('T')[0];
        setActualReturnDate(borrowLog.actual_return || today);
        setReturnNotes(borrowLog.return_notes || '');
        setReturnConditionStatus(borrowLog.return_condition_status || 'Baik');
        setReturnDamagedQty(borrowLog.return_damaged_qty || 0);
        setReturnLostQty(borrowLog.return_lost_qty || 0);
        setShowReturnToolModal(true);
    };

    const handleConfirmReturnSubmit = (e) => {
        e.preventDefault();
        if (!selectedReturnBorrow) return;

        const isNewReturn = selectedReturnBorrow.status !== 'Sudah Dikembalikan';

        const dmgQty = parseInt(returnDamagedQty) || 0;
        const lstQty = parseInt(returnLostQty) || 0;

        if (isNewReturn) {
            setToolsList(prev => prev.map(t => {
                let returnedQtyForItem = 0;
                if (Array.isArray(selectedReturnBorrow.items)) {
                    const found = selectedReturnBorrow.items.find(it => it.tool_id === t.id);
                    if (found) returnedQtyForItem = found.qty;
                } else if (t.id === selectedReturnBorrow.tool_id) {
                    returnedQtyForItem = selectedReturnBorrow.qty_borrowed;
                }

                if (returnedQtyForItem > 0) {
                    const netGoodReturned = Math.max(0, returnedQtyForItem - dmgQty - lstQty);
                    const updatedDamaged = (t.damaged_qty || 0) + dmgQty;
                    const updatedLost = (t.lost_qty || 0) + lstQty;

                    return {
                        ...t,
                        available_qty: t.available_qty + netGoodReturned,
                        damaged_qty: updatedDamaged,
                        lost_qty: updatedLost,
                        condition: (updatedLost > 0 && updatedLost >= t.total_qty) ? 'Hilang' : (updatedDamaged > 0) ? 'Rusak Ringan' : t.condition
                    };
                }
                return t;
            }));
        }

        setToolBorrowings(prev => prev.map(b => {
            if (b.id === selectedReturnBorrow.id) {
                return {
                    ...b,
                    status: 'Sudah Dikembalikan',
                    actual_return: actualReturnDate || new Date().toISOString().split('T')[0],
                    return_notes: returnNotes,
                    return_condition_status: returnConditionStatus,
                    return_damaged_qty: dmgQty,
                    return_lost_qty: lstQty
                };
            }
            return b;
        }));

        setShowReturnToolModal(false);
        setSelectedReturnBorrow(null);
    };

    // Accessories Management State
    const [accessoriesList, setAccessoriesList] = useState([
        {
            id: 1,
            acc_code: 'ACC-001',
            name: 'Handle Pintu Stainless Steel Tubular 30cm (Set)',
            buy_price: 150000,
            sell_price: 250000,
            qty: 35,
            unit: 'Pcs',
            status: 'Aman'
        },
        {
            id: 2,
            acc_code: 'ACC-002',
            name: 'Engsel Shower Kaca ke Tembok 90 Derajat Heavy Duty',
            buy_price: 180000,
            sell_price: 280000,
            qty: 24,
            unit: 'Pcs',
            status: 'Aman'
        },
        {
            id: 3,
            acc_code: 'ACC-003',
            name: 'Lem Silicone Sealant Neutral Bening (Tabung 300ml)',
            buy_price: 25000,
            sell_price: 35000,
            qty: 60,
            unit: 'Pcs',
            status: 'Aman'
        },
        {
            id: 4,
            acc_code: 'ACC-004',
            name: 'Spigot Alumunium Fitting Sekat Kaca Tempered 12mm',
            buy_price: 120000,
            sell_price: 180000,
            qty: 12,
            unit: 'Pcs',
            status: 'Menipis'
        },
        {
            id: 5,
            acc_code: 'ACC-005',
            name: 'Karet Seal Lis Gasket U-Channel Kaca 5mm (Roll 10m)',
            buy_price: 45000,
            sell_price: 75000,
            qty: 18,
            unit: 'Roll',
            status: 'Aman'
        },
        {
            id: 6,
            acc_code: 'ACC-006',
            name: 'Pen Cermin Chrome Stainless Fastener (Set 4 Pcs)',
            buy_price: 30000,
            sell_price: 50000,
            qty: 40,
            unit: 'Set',
            status: 'Aman'
        },
        {
            id: 7,
            acc_code: 'ACC-007',
            name: 'Floor Hinge Patch Fitting Set Pintu Tempered',
            buy_price: 450000,
            sell_price: 680000,
            qty: 4,
            unit: 'Set',
            status: 'Menipis'
        }
    ]);
    const [accSearchTerm, setAccSearchTerm] = useState('');
    const [showAddAccModal, setShowAddAccModal] = useState(false);
    const [showEditAccModal, setShowEditAccModal] = useState(false);
    const [showRestockAccModal, setShowRestockAccModal] = useState(false);
    const [selectedAccItem, setSelectedAccItem] = useState(null);
    const [accRestockQty, setAccRestockQty] = useState(10);

    const [newAccForm, setNewAccForm] = useState({
        acc_code: '',
        name: '',
        buy_price: '',
        sell_price: '',
        qty: 0,
        unit: 'Pcs'
    });

    const [editAccForm, setEditAccForm] = useState({
        id: null,
        acc_code: '',
        name: '',
        buy_price: '',
        sell_price: '',
        qty: 0,
        unit: 'Pcs'
    });

    const handleAddAccSubmit = (e) => {
        e.preventDefault();
        if (!newAccForm.name) return;

        const autoCode = newAccForm.acc_code || ('ACC-00' + (accessoriesList.length + 1));
        const qty = parseInt(newAccForm.qty) || 0;
        const status = qty > 15 ? 'Aman' : (qty > 0 ? 'Menipis' : 'Habis');

        const newAcc = {
            id: Date.now(),
            acc_code: autoCode,
            name: newAccForm.name,
            buy_price: parseFloat(newAccForm.buy_price) || 0,
            sell_price: parseFloat(newAccForm.sell_price) || 0,
            qty: qty,
            unit: newAccForm.unit || 'Pcs',
            status: status
        };

        setAccessoriesList(prev => [newAcc, ...prev]);
        setShowAddAccModal(false);
        setNewAccForm({
            acc_code: '',
            name: '',
            buy_price: '',
            sell_price: '',
            qty: 0,
            unit: 'Pcs'
        });
    };

    const handleOpenEditAccModal = (acc) => {
        setEditAccForm({
            id: acc.id,
            acc_code: acc.acc_code,
            name: acc.name,
            buy_price: acc.buy_price,
            sell_price: acc.sell_price,
            qty: acc.qty,
            unit: acc.unit
        });
        setShowEditAccModal(true);
    };

    const handleEditAccSubmit = (e) => {
        e.preventDefault();
        if (!editAccForm.name) return;

        setAccessoriesList(prev => prev.map(acc => {
            if (acc.id === editAccForm.id) {
                const qty = parseInt(editAccForm.qty) || 0;
                const status = qty > 15 ? 'Aman' : (qty > 0 ? 'Menipis' : 'Habis');
                return {
                    ...acc,
                    acc_code: editAccForm.acc_code,
                    name: editAccForm.name,
                    buy_price: parseFloat(editAccForm.buy_price) || 0,
                    sell_price: parseFloat(editAccForm.sell_price) || 0,
                    qty: qty,
                    unit: editAccForm.unit,
                    status: status
                };
            }
            return acc;
        }));

        setShowEditAccModal(false);
    };

    const handleDeleteAcc = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus aksesoris ini?')) {
            setAccessoriesList(prev => prev.filter(acc => acc.id !== id));
        }
    };

    const handleConfirmAccRestock = (e) => {
        e.preventDefault();
        if (!selectedAccItem) return;

        const addQty = parseInt(accRestockQty) || 0;
        setAccessoriesList(prev => prev.map(acc => {
            if (acc.id === selectedAccItem.id) {
                const newQty = acc.qty + addQty;
                const status = newQty > 15 ? 'Aman' : (newQty > 0 ? 'Menipis' : 'Habis');
                return {
                    ...acc,
                    qty: newQty,
                    status: status
                };
            }
            return acc;
        }));

        setShowRestockAccModal(false);
        setSelectedAccItem(null);
    };

    const handleRequestAccRestockStatus = (accId) => {
        setAccessoriesList(prev => prev.map(acc => {
            if (acc.id === accId) {
                return {
                    ...acc,
                    status: 'Pengajuan Restock'
                };
            }
            return acc;
        }));
    };

    const handleAddStockItemSubmit = (e) => {
        e.preventDefault();
        if (!newStockForm.name) return;

        const autoCode = newStockForm.item_code || ('BRG-00' + (sheetGlasses.length + 1));
        const qty = parseInt(newStockForm.qty) || 0;
        const buyPrice = parseFloat(newStockForm.buy_price) || 0;
        const sellPrice = parseFloat(newStockForm.sell_price) || 0;
        const thickness = parseInt(newStockForm.thickness_mm) || 5;

        const rateGM = parseFloat(newStockForm.rate_gm) || 10000;
        const rateHT = parseFloat(newStockForm.rate_ht) || 1000;
        const rateBV = parseFloat(newStockForm.rate_bv) || 15000;
        const rateEtsa = parseFloat(newStockForm.rate_etsa) || 50000;

        const status = qty > 10 ? 'Aman' : (qty > 0 ? 'Menipis' : 'Pengajuan Proses Restock');

        const newItem = {
            id: Date.now(),
            item_code: autoCode,
            name: newStockForm.name,
            category: newStockForm.category,
            size: newStockForm.size,
            thickness_mm: thickness,
            buy_price: buyPrice,
            sell_price: sellPrice,
            rate_gm: rateGM,
            rate_ht: rateHT,
            rate_bv: rateBV,
            rate_etsa: rateEtsa,
            qty: qty,
            unit: 'Lembar',
            last_restock: new Date().toISOString().split('T')[0],
            status: status,
            supplier_name: newStockForm.supplier_name,
            supplier_phone: newStockForm.supplier_phone,
            supplier_pic: newStockForm.supplier_pic
        };

        setSheetGlasses(prev => [newItem, ...prev]);
        setShowAddStockModal(false);
        setNewStockForm({
            item_code: '',
            name: '',
            category: 'Kaca Cermin',
            size: '122 x 244 cm',
            thickness_mm: 5,
            buy_price: '',
            sell_price: '',
            rate_gm: 10000,
            rate_ht: 1000,
            rate_bv: 15000,
            rate_etsa: 50000,
            qty: 0,
            unit: 'Lembar',
            supplier_name: 'PT Asahimas Flat Glass Tbk (Divisi Cermin)',
            supplier_phone: '6281234567890',
            supplier_pic: 'Pak Gunawan'
        });
    };

    const handleOpenEditStockModal = (item) => {
        setEditStockForm({
            id: item.id,
            item_code: item.item_code || '',
            name: item.name || '',
            category: item.category || 'Kaca Cermin',
            size: item.size || '122 x 244 cm',
            thickness_mm: item.thickness_mm || 5,
            buy_price: item.buy_price ?? '',
            sell_price: item.sell_price ?? '',
            rate_gm: item.rate_gm ?? 10000,
            rate_ht: item.rate_ht ?? 1000,
            rate_bv: item.rate_bv ?? 15000,
            rate_etsa: item.rate_etsa ?? 50000,
            qty: item.qty ?? 0,
            unit: item.unit || 'Lembar',
            supplier_name: item.supplier_name || '',
            supplier_phone: item.supplier_phone || '',
            supplier_pic: item.supplier_pic || ''
        });
        setShowEditStockModal(true);
    };

    const handleEditStockSubmit = (e) => {
        e.preventDefault();
        if (!editStockForm.name) return;

        const qty = parseInt(editStockForm.qty) || 0;
        const buyPrice = parseFloat(editStockForm.buy_price) || 0;
        const sellPrice = parseFloat(editStockForm.sell_price) || 0;
        const thickness = parseInt(editStockForm.thickness_mm) || 5;

        const rateGM = parseFloat(editStockForm.rate_gm) || 10000;
        const rateHT = parseFloat(editStockForm.rate_ht) || 1000;
        const rateBV = parseFloat(editStockForm.rate_bv) || 15000;
        const rateEtsa = parseFloat(editStockForm.rate_etsa) || 50000;

        const status = qty > 10 ? 'Aman' : (qty > 0 ? 'Menipis' : 'Pengajuan Proses Restock');

        setSheetGlasses(prev => prev.map(item => {
            if (item.id === editStockForm.id) {
                return {
                    ...item,
                    item_code: editStockForm.item_code,
                    name: editStockForm.name,
                    category: editStockForm.category,
                    size: editStockForm.size,
                    thickness_mm: thickness,
                    buy_price: buyPrice,
                    sell_price: sellPrice,
                    rate_gm: rateGM,
                    rate_ht: rateHT,
                    rate_bv: rateBV,
                    rate_etsa: rateEtsa,
                    qty: qty,
                    status: status,
                    supplier_name: editStockForm.supplier_name,
                    supplier_phone: editStockForm.supplier_phone,
                    supplier_pic: editStockForm.supplier_pic
                };
            }
            return item;
        }));

        setShowEditStockModal(false);
    };

    // Print Panel & Dispatch State for Pengiriman
    const [selectedDispatchOrderForPrint, setSelectedDispatchOrderForPrint] = useState('');
    const [dispatchDriverInput, setDispatchDriverInput] = useState('Pak Budi (Supir DC)');
    const [dispatchVehicleInput, setDispatchVehicleInput] = useState('Engkel Box (D 8472 AB)');
    const [dispatchWaybillColor, setDispatchWaybillColor] = useState('Putih');

    const [showBarangKeluarModal, setShowBarangKeluarModal] = useState(false);
    const [selectedBarangKeluarData, setSelectedBarangKeluarData] = useState(null);

    // Multi-Address Delivery Dispatch States
    const [selectedBatchOrderIds, setSelectedBatchOrderIds] = useState([]);
    const [showMultiAddressModal, setShowMultiAddressModal] = useState(false);
    const [selectedTripDataForModal, setSelectedTripDataForModal] = useState(null);
    const [showBatchWaybillModal, setShowBatchWaybillModal] = useState(false);
    const [selectedBatchWaybillTrip, setSelectedBatchWaybillTrip] = useState(null);
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

    const handleTriggerPrintSuratJalan = (e) => {
        e.preventDefault();
        const orderList = initialDeliveries.length > 0 ? initialDeliveries : initialOrders;
        const found = orderList.find(d =>
            (d.order?.spo_number === selectedDispatchOrderForPrint) ||
            (d.spo_number === selectedDispatchOrderForPrint)
        ) || orderList[0];

        const targetOrder = found.order || found;
        setSelectedWaybillOrder({
            ...targetOrder,
            assigned_driver: dispatchDriverInput,
            assigned_vehicle: dispatchVehicleInput,
            waybill_color: dispatchWaybillColor
        });
        setShowWaybillModal(true);
    };

    const handleTriggerPrintBarangKeluar = (e) => {
        e.preventDefault();
        const orderList = initialDeliveries.length > 0 ? initialDeliveries : initialOrders;
        const found = orderList.find(d =>
            (d.order?.spo_number === selectedDispatchOrderForPrint) ||
            (d.spo_number === selectedDispatchOrderForPrint)
        ) || orderList[0];

        const targetOrder = found.order || found;
        setSelectedBarangKeluarData({
            order: targetOrder,
            sbk_number: 'SBK/2026/08/' + Math.floor(1000 + Math.random() * 9000),
            driver: dispatchDriverInput,
            vehicle: dispatchVehicleInput,
            waybill_color: dispatchWaybillColor,
            date: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
        });
        setShowBarangKeluarModal(true);
    };

    const [sheetGlasses, setSheetGlasses] = useState([
        {
            id: 1,
            item_code: 'BRG-001',
            name: 'Kaca Cermin Polos 5 mm Standard',
            category: 'Kaca Cermin',
            size: '183 x 244 cm',
            buy_price: 280000,
            sell_price: 380000,
            qty: 25,
            unit: 'Lembar',
            supplier_name: 'PT Asahimas Flat Glass Tbk (Divisi Cermin)',
            supplier_phone: '6281234567890',
            last_restock: '2026-08-25',
            status: 'Aman'
        },
        {
            id: 2,
            item_code: 'BRG-002',
            name: 'Kaca Bening Polos 8 mm Float Glass',
            category: 'Kaca Bening / Clear',
            size: '214 x 305 cm',
            buy_price: 320000,
            sell_price: 450000,
            qty: 18,
            unit: 'Lembar',
            supplier_name: 'PT Mulia Glass Float & Mirror',
            supplier_phone: '6281398765432',
            last_restock: '2026-08-22',
            status: 'Aman'
        },
        {
            id: 3,
            item_code: 'BRG-003',
            name: 'Kaca Bening Polos 10 mm Tempered Raw',
            category: 'Kaca Tempered',
            size: '244 x 366 cm',
            buy_price: 520000,
            sell_price: 720000,
            qty: 8,
            unit: 'Lembar',
            supplier_name: 'PT Kaca Tempered Nusantara',
            supplier_phone: '6281908070605',
            last_restock: '2026-08-18',
            status: 'Menipis'
        },
        {
            id: 4,
            item_code: 'BRG-004',
            name: 'Kaca Bening Polos 12 mm Architectural',
            category: 'Kaca Tempered',
            size: '244 x 366 cm',
            buy_price: 680000,
            sell_price: 950000,
            qty: 4,
            unit: 'Lembar',
            supplier_name: 'PT Kaca Tempered Nusantara',
            supplier_phone: '6281908070605',
            last_restock: '2026-08-15',
            status: 'Pengajuan Proses Restock'
        },
        {
            id: 5,
            item_code: 'BRG-005',
            name: 'Kaca Cermin Bronze 5 mm Luxury',
            category: 'Kaca Cermin',
            size: '183 x 244 cm',
            buy_price: 390000,
            sell_price: 540000,
            qty: 15,
            unit: 'Lembar',
            supplier_name: 'PT Asahimas Flat Glass Tbk (Divisi Cermin)',
            supplier_phone: '6281234567890',
            last_restock: '2026-08-26',
            status: 'Aman'
        },
        {
            id: 6,
            item_code: 'BRG-006',
            name: 'Kaca Cermin Grey 5 mm Modern',
            category: 'Kaca Cermin',
            size: '183 x 244 cm',
            buy_price: 385000,
            sell_price: 530000,
            qty: 12,
            unit: 'Lembar',
            supplier_name: 'PT Asahimas Flat Glass Tbk (Divisi Cermin)',
            supplier_phone: '6281234567890',
            last_restock: '2026-08-20',
            status: 'Aman'
        },
        {
            id: 7,
            item_code: 'BRG-007',
            name: 'Kaca Riben / Tinted Dark Grey 6 mm',
            category: 'Kaca Tinted / Riben',
            size: '183 x 244 cm',
            buy_price: 310000,
            sell_price: 430000,
            qty: 6,
            unit: 'Lembar',
            supplier_name: 'PT Global Tinted Glass Import',
            supplier_phone: '6281577889900',
            last_restock: '2026-08-10',
            status: 'Menipis'
        },
        {
            id: 8,
            item_code: 'BRG-008',
            name: 'Kaca Acid Etsa Frosted 5 mm',
            category: 'Kaca Etsa / Sandblast',
            size: '183 x 244 cm',
            buy_price: 350000,
            sell_price: 480000,
            qty: 20,
            unit: 'Lembar',
            supplier_name: 'CV ArtGlass Dekoratif Etsa',
            supplier_phone: '6281288990011',
            last_restock: '2026-08-24',
            status: 'Aman'
        },
        {
            id: 9,
            item_code: 'BRG-009',
            name: 'Kaca Laminated 5+5 mm Bening Safety',
            category: 'Kaca Laminated',
            size: '214 x 305 cm',
            buy_price: 620000,
            sell_price: 850000,
            qty: 12,
            unit: 'Lembar',
            supplier_name: 'PT Kaca Tempered Nusantara',
            supplier_phone: '6281908070605',
            last_restock: '2026-08-28',
            status: 'Aman'
        }
    ]);

    const handleRecordRawMaterialSuccess = (glassTypeName, sheetsUsed) => {
        setSheetGlasses(prev => prev.map(item => {
            const matchName = item.name.toLowerCase().includes(glassTypeName.toLowerCase()) || glassTypeName.toLowerCase().includes(item.name.toLowerCase());
            if (matchName) {
                const newQty = Math.max(0, item.qty - sheetsUsed);
                const newStatus = newQty > 10 ? 'Aman' : (newQty > 0 ? 'Menipis' : 'Pengajuan Proses Restock');
                return {
                    ...item,
                    qty: newQty,
                    status: newStatus
                };
            }
            return item;
        }));
    };

    const MASTER_SUPPLIERS = [
        { id: 1, name: 'PT Asahimas Flat Glass Tbk (Divisi Cermin)', phone: '6281234567890', pic: 'Pak Gunawan' },
        { id: 2, name: 'PT Mulia Glass Float & Mirror', phone: '6281398765432', pic: 'Ibu Siska' },
        { id: 3, name: 'PT Kaca Tempered Nusantara', phone: '6281908070605', pic: 'Pak Irwan' },
        { id: 4, name: 'PT Global Tinted Glass Import', phone: '6281577889900', pic: 'Pak Budianto' },
        { id: 5, name: 'CV ArtGlass Dekoratif Etsa', phone: '6281288990011', pic: 'Pak Rudy' },
    ];

    const handleOpenRestockModal = (item) => {
        setSelectedStockItem(item);
        setRestockQtyInput(10);
        setRestockDateInput(new Date().toISOString().split('T')[0]);
        setShowRestockModal(true);
    };

    const handleOpenSupplierWaModal = (item) => {
        setSelectedWaStockItem(item);
        setWaOrderQty(20);
        setSupplierName(item.supplier_name || 'PT Asahimas Flat Glass Tbk');
        setSupplierPhone(item.supplier_phone || '6281234567890');
        setShowSupplierWaModal(true);
    };

    const handleSendWaOrder = (e) => {
        e.preventDefault();
        if (!selectedWaStockItem) return;

        // Update status in system to "Sedang Dipesan Supplier"
        setSheetGlasses(prev => prev.map(item => {
            if (item.id === selectedWaStockItem.id) {
                return {
                    ...item,
                    status: 'Sedang Dipesan Supplier',
                    ordered_qty: waOrderQty,
                    ordered_at: new Date().toISOString().split('T')[0]
                };
            }
            return item;
        }));

        const cleanPhone = supplierPhone.replace(/[^0-9]/g, '');
        const message = `Halo ${supplierName},\n\nKami dari CV Cahya Karunia Jaya (SYP GLASS OPERATIONAL).\nKami ingin memesan/restock bahan kaca berikut:\n\n• Barang: ${selectedWaStockItem.name} (${selectedWaStockItem.item_code})\n• Jenis Kaca: ${selectedWaStockItem.category}\n• Ukuran Standard: ${selectedWaStockItem.size}\n• Jumlah Pemesanan: ${waOrderQty} Lembar\n• Status: Pengajuan Restock Gudang (Disetujui Admin Toko)\n\nMohon informasi ketersediaan, estimasi waktu pengiriman, dan invoice total harga. Terima kasih!`;

        const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');

        setShowSupplierWaModal(false);
        setSelectedWaStockItem(null);
    };

    const handleConfirmRestock = (e) => {
        e.preventDefault();
        if (!selectedStockItem) return;
        const addQty = parseInt(restockQtyInput) || 0;
        const newQty = selectedStockItem.qty + addQty;
        const newStatus = newQty > 10 ? 'Aman' : (newQty > 0 ? 'Menipis' : 'Pengajuan Proses Restock');

        setSheetGlasses(prev => prev.map(item => {
            if (item.id === selectedStockItem.id) {
                return {
                    ...item,
                    qty: newQty,
                    last_restock: restockDateInput,
                    status: newStatus
                };
            }
            return item;
        }));

        setShowRestockModal(false);
        setSelectedStockItem(null);
    };

    const handleRequestRestockStatus = (itemId) => {
        setSheetGlasses(prev => prev.map(item => {
            if (item.id === itemId) {
                return {
                    ...item,
                    status: 'Pengajuan Proses Restock'
                };
            }
            return item;
        }));
    };

    const handleSearchChange = (val) => {
        setSearchTerm(val);
        setStockSearchTerm(val);
        setSupplierSearchTerm(val);
        setAccessorySearchTerm(val);
        setSupplySearchTerm(val);
        setToolSearchTerm(val);
        setEmployeeSearchTerm(val);
    };

    const isMatchSearch = (item, customTerm = null) => {
        const term = (customTerm !== null && typeof customTerm === 'string') ? customTerm : (typeof customTerm === 'object' && customTerm !== null ? searchTerm : (customTerm || searchTerm));
        const q = String(term || '').toLowerCase().trim();
        if (!q) return true;

        if (typeof item === 'object' && item !== null) {
            const textValues = [
                item.spo_number,
                item.customer_name,
                item.customer_phone,
                item.customer_address,
                item.glass_type,
                item.type,
                item.description,
                item.revision_notes,
                item.item_name,
                item.item_code,
                item.code,
                item.trip_code,
                item.driver_name,
                item.vehicle_plate,
                item.waybill_number,
                item.name,
                item.email,
                item.role,
                item.notes,
                item.rak_location,
                item.rak,
                item.category,
                item.details,
                item.used_scrap_rak,
                item.user_name,
                item.action,
                item.priority_status,
                item.payment_status,
                item.status,
                item.supplier_name,
                item.pic_name,
                item.pic_phone,
            ];

            for (const val of textValues) {
                if (val && String(val).toLowerCase().includes(q)) return true;
            }

            if (item.length_cm && String(item.length_cm).includes(q)) return true;
            if (item.width_cm && String(item.width_cm).includes(q)) return true;
            if (item.len && String(item.len).includes(q)) return true;
            if (item.wid && String(item.wid).includes(q)) return true;
            if (item.thickness_mm && String(item.thickness_mm).includes(q)) return true;

            if (Array.isArray(item.items)) {
                for (const it of item.items) {
                    if (it.glass_type && String(it.glass_type).toLowerCase().includes(q)) return true;
                    if (it.length_cm && String(it.length_cm).includes(q)) return true;
                    if (it.width_cm && String(it.width_cm).includes(q)) return true;
                    if (Array.isArray(it.processes) && it.processes.some(p => String(p).toLowerCase().includes(q))) return true;
                }
            }

            if (Array.isArray(item.processes)) {
                if (item.processes.some(p => String(p).toLowerCase().includes(q))) return true;
            }

            if (Array.isArray(item.accessories)) {
                if (item.accessories.some(a => (typeof a === 'string' ? a : (a.name || '')).toLowerCase().includes(q))) return true;
            }

            if (Array.isArray(item.revision_history)) {
                if (item.revision_history.some(r => (r.notes || '').toLowerCase().includes(q))) return true;
            }
        } else if (typeof item === 'string') {
            return item.toLowerCase().includes(q);
        }

        return false;
    };

    const filteredSheetGlasses = sheetGlasses.filter(g => {
        const matchesSearch = isMatchSearch(g, stockSearchTerm) ||
            (g.item_code || '').toLowerCase().includes((stockSearchTerm || '').toLowerCase()) ||
            (g.name || '').toLowerCase().includes((stockSearchTerm || '').toLowerCase()) ||
            (g.category || '').toLowerCase().includes((stockSearchTerm || '').toLowerCase()) ||
            (g.size || '').toLowerCase().includes((stockSearchTerm || '').toLowerCase());

        if (activeStockCard === 'aman') return g.status === 'Aman' && matchesSearch;
        if (activeStockCard === 'menipis') return g.status === 'Menipis' && matchesSearch;
        if (activeStockCard === 'pengajuan') return g.status === 'Pengajuan Proses Restock' && matchesSearch;
        return matchesSearch;
    });

    // Auto set default active tab based on user's role
    useEffect(() => {
        if (userRole.startsWith('divisi_')) setActiveTab('production');
        else if (userRole === 'driver') setActiveTab('deliveries');
        else if (userRole === 'owner') setActiveTab('finance');
        else if (userRole === 'admin_gudang') setActiveTab('orders');
        else setActiveTab('orders');
    }, [userRole]);

    // Sketch photo preview state
    const [sketchPreview, setSketchPreview] = useState(null);

    // Form Hooks (Inertia) - Multi Item Kaca Support
    const { data: orderForm, setData: setOrderForm, reset: resetOrder } = useForm({
        order_date: new Date().toISOString().split('T')[0],
        customer_name: '',
        customer_phone: '',
        customer_address: '',
        items: [
            {
                id: 1,
                glass_type: '',
                length_cm: '',
                width_cm: '',
                thickness_mm: '',
                qty: 0,
                processes: []
            }
        ],
        accessories: [], // Lem pcs, Aksesoris alumunium, Handle pintu, Tambahan proses (ditempat lain)
        description: '',
        sketch_photo: null,
        priority_status: 'Biasa',
        priority_fee: 0,
        custom_fee: 0,
        payment_option: 'dp',
        dp_percent: 50,
        custom_paid_amount: '',
        deadline_date: '',
        used_scrap_rak: '',
        status: 'pengerjaan'
    });

    // Multi Item Actions
    const handleOpenNewOrderModal = () => {
        resetOrder();
        setSketchPreview(null);
        setOrderForm({
            order_date: new Date().toISOString().split('T')[0],
            customer_name: '',
            customer_phone: '',
            customer_address: '',
            items: [
                {
                    id: Date.now(),
                    group_id: 'grp_' + Date.now(),
                    glass_type: '',
                    length_cm: '',
                    width_cm: '',
                    thickness_mm: '',
                    qty: 0,
                    processes: []
                }
            ],
            accessories: [],
            description: '',
            sketch_photo: null,
            priority_status: 'Biasa',
            priority_fee: 0,
            custom_fee: 0,
            payment_option: 'dp',
            dp_percent: 50,
            custom_paid_amount: '',
            deadline_date: '',
            used_scrap_rak: '',
            status: 'pengerjaan'
        });
        setShowNewOrderModal(true);
    };

    const extractThickness = (glassTypeStr) => {
        if (!glassTypeStr) return 5;
        const match = glassTypeStr.match(/(\d+)\s*(?:mm|mili)/i);
        return match ? parseInt(match[1]) : 5;
    };

    const parseDim = (val) => {
        if (val === null || val === undefined || val === '') return 0;
        const str = String(val).replace(',', '.').replace(/[^0-9.]/g, '');
        return parseFloat(str) || 0;
    };

    const formatRupiahInput = (val) => {
        if (val === null || val === undefined || val === '') return '';
        const digits = String(val).replace(/\D/g, '');
        if (!digits) return '';
        return Number(digits).toLocaleString('id-ID');
    };

    const parseRupiahInput = (val) => {
        if (val === null || val === undefined || val === '') return 0;
        const digits = String(val).replace(/\D/g, '');
        return parseFloat(digits) || 0;
    };

    const sanitizeCustomerName = (val) => {
        if (val === null || val === undefined) return '';
        // Allow letters, spaces, apostrophes, dots, and hyphens (stripping numbers & symbols)
        return String(val).replace(/[^a-zA-Z\s'.`-]/g, '');
    };

    const sanitizeCustomerPhone = (val) => {
        if (val === null || val === undefined) return '';
        // Allow digits, plus sign, hyphens, and spaces (stripping non-phone characters)
        return String(val).replace(/[^0-9+\-\s]/g, '');
    };

    const getDynamicGlassTypes = (stockList) => {
        const defaultTypes = [
            'Kaca Cermin 5 mm polos',
            'Kaca Cermin Grey 5 mm',
            'Kaca Bening 5 mm polos',
            'Kaca Bening 8 mm polos',
            'Kaca Bening 10 mm polos',
            'Kaca Jumbo Polos 12 mm',
            'Kaca Dark Grey 5 mm',
            'Kaca Frosted Etsa Sandblast 5 mm',
            'Kaca 12 mm Polos Tempered'
        ];

        const stockTypes = (stockList || []).map(g => g.name || g.glass_type).filter(Boolean);
        return Array.from(new Set([...defaultTypes, ...stockTypes]));
    };

    const formatNumberDots = (val) => {
        if (val === null || val === undefined || val === '') return '';
        const cleanNum = String(val).replace(/[^0-9]/g, '');
        if (!cleanNum) return '';
        return Number(cleanNum).toLocaleString('id-ID');
    };

    const parseNumberDots = (val) => {
        if (!val) return '';
        return String(val).replace(/[^0-9]/g, '');
    };

    const [customScrapQtyMap, setCustomScrapQtyMap] = useState({});

    const parseSelectedScrapsFromForm = (usedScrapStr) => {
        if (!usedScrapStr || typeof usedScrapStr !== 'string') return [];
        const regex = /([A-Z0-9-]+)\s*\(([^,]+),\s*([^=]+)=\s*(\d+)\s*lbr\)/g;
        const matches = [];
        let match;
        while ((match = regex.exec(usedScrapStr)) !== null) {
            matches.push({
                code: match[1].trim(),
                rak: match[2].trim(),
                size: match[3].trim(),
                qty: parseInt(match[4]) || 1
            });
        }
        return matches;
    };

    const handleToggleIndividualScrap = (m, chosenQty, itemQty) => {
        const code = m.scrap.scrap_code;
        const rak = m.scrap.rak_location;
        const size = `${m.scrap.length_cm}x${m.scrap.width_cm}cm`;

        const currentSelected = parseSelectedScrapsFromForm(orderForm.used_scrap_rak);
        const existingIdx = currentSelected.findIndex(s => s.code === code);

        let updatedList = [];
        if (existingIdx >= 0) {
            updatedList = currentSelected.filter(s => s.code !== code);
        } else {
            updatedList = [...currentSelected, { code, rak, size, qty: chosenQty }];
        }

        if (updatedList.length === 0) {
            setOrderForm(d => ({ ...d, used_scrap_rak: '' }));
            return;
        }

        const totalScrapQty = updatedList.reduce((sum, s) => sum + s.qty, 0);
        const neededNewGlass = Math.max(0, itemQty - totalScrapQty);

        const formattedScrapStr = updatedList.map(s => `${s.code} (${s.rak}, ${s.size} = ${s.qty} lbr)`).join(', ')
            + (neededNewGlass > 0 ? ` + ${neededNewGlass} lbr bahan baru` : '');

        setOrderForm(d => ({ ...d, used_scrap_rak: formattedScrapStr }));
    };

    const handleUpdateIndividualScrapQty = (m, newQty, itemQty) => {
        const code = m.scrap.scrap_code;
        const rak = m.scrap.rak_location;
        const size = `${m.scrap.length_cm}x${m.scrap.width_cm}cm`;

        setCustomScrapQtyMap(prev => ({ ...prev, [code]: newQty }));

        const currentSelected = parseSelectedScrapsFromForm(orderForm.used_scrap_rak);
        const existingIdx = currentSelected.findIndex(s => s.code === code);

        if (existingIdx >= 0) {
            const updatedList = currentSelected.map(s => s.code === code ? { ...s, qty: newQty } : s);
            const totalScrapQty = updatedList.reduce((sum, s) => sum + s.qty, 0);
            const neededNewGlass = Math.max(0, itemQty - totalScrapQty);

            const formattedScrapStr = updatedList.map(s => `${s.code} (${s.rak}, ${s.size} = ${s.qty} lbr)`).join(', ')
                + (neededNewGlass > 0 ? ` + ${neededNewGlass} lbr bahan baru` : '');

            setOrderForm(d => ({ ...d, used_scrap_rak: formattedScrapStr }));
        }
    };

    const isGlassTypeCompatible = (itemGlassType, scrapGlassType) => {
        if (!itemGlassType || !scrapGlassType) return false;

        // 1. Thickness must match
        const itemThickness = extractThickness(itemGlassType);
        const scrapThickness = extractThickness(scrapGlassType);
        if (itemThickness && scrapThickness && itemThickness !== scrapThickness) {
            return false;
        }

        const itemType = itemGlassType.toLowerCase();
        const sType = scrapGlassType.toLowerCase();

        // 2. Strict category check for special glass types
        const specialKeywords = ['cermin', 'riben', 'es', 'tempered', 'laminated', 'oneside', 'tinted', 'reflective', 'akrilik'];
        for (const kw of specialKeywords) {
            if (itemType.includes(kw) !== sType.includes(kw)) {
                return false;
            }
        }

        // 3. For bening / polos (clear float glass)
        const isItemBening = itemType.includes('bening') || itemType.includes('polos');
        const isScrapBening = sType.includes('bening') || sType.includes('polos');
        if (isItemBening || isScrapBening) {
            if (isItemBening !== isScrapBening) return false;
        }

        return true;
    };

    const calculateScrapYield = (scrapLen, scrapWid, itemLen, itemWid) => {
        if (scrapLen <= 0 || scrapWid <= 0 || itemLen <= 0 || itemWid <= 0) return 0;
        const yieldLenNorm = Math.floor(scrapLen / itemLen);
        const yieldWidNorm = Math.floor(scrapWid / itemWid);
        const yieldNorm = yieldLenNorm * yieldWidNorm;

        const yieldLenRot = Math.floor(scrapLen / itemWid);
        const yieldWidRot = Math.floor(scrapWid / itemLen);
        const yieldRot = yieldLenRot * yieldWidRot;

        return Math.max(yieldNorm, yieldRot);
    };

    const findMatchingScrapsForOrder = (item, scrapList) => {
        if (!item || !Array.isArray(scrapList) || scrapList.length === 0) return null;
        const rawItemLen = parseDim(item.length_cm);
        const rawItemWid = parseDim(item.width_cm);
        const itemQty = Math.max(1, parseInt(item.qty) || 1);
        if (rawItemLen <= 0 || rawItemWid <= 0) return null;

        // Check if Gosok Mesin (GM) process is required (only GM consumes +1 cm margin)
        const processes = item.processes || [];
        const hasEdgeGrinding = processes.includes('GM');
        const edgeMarginCm = hasEdgeGrinding ? 1.0 : 0.0;

        // Effective dimensions required for raw cut (adding +1 cm margin if GM)
        const itemLen = rawItemLen + edgeMarginCm;
        const itemWid = rawItemWid + edgeMarginCm;

        const candidates = [];
        scrapList.forEach(s => {
            if (s.status && s.status !== 'Layak Pakai') return;
            if (!isGlassTypeCompatible(item.glass_type, s.glass_type)) return;

            const sLen = parseFloat(s.length_cm) || 0;
            const sWid = parseFloat(s.width_cm) || 0;
            const y = calculateScrapYield(sLen, sWid, itemLen, itemWid);
            if (y <= 0) return;

            candidates.push({
                scrap: s,
                yieldPerSheet: y,
                scrapArea: sLen * sWid
            });
        });

        if (candidates.length === 0) return null;

        candidates.sort((a, b) => a.scrapArea - b.scrapArea);

        let remainingNeeded = itemQty;
        let totalScrapCovered = 0;
        const matchedScraps = [];

        for (const cand of candidates) {
            if (remainingNeeded <= 0) break;
            const takeFromThisScrap = Math.min(remainingNeeded, cand.yieldPerSheet);
            totalScrapCovered += takeFromThisScrap;
            remainingNeeded -= takeFromThisScrap;
            matchedScraps.push({
                ...cand,
                usedQty: takeFromThisScrap
            });
        }

        const neededNewGlass = Math.max(0, itemQty - totalScrapCovered);

        return {
            totalScrapCovered,
            neededNewGlass,
            itemQty,
            hasEdgeGrinding,
            edgeMarginCm,
            matchedScraps
        };
    };

    const handleAddItem = () => {
        const currentItems = orderForm.items || [];
        const newItem = {
            id: Date.now() + Math.random(),
            glass_type: 'Kaca Cermin 5 mm polos',
            length_cm: '',
            width_cm: '',
            thickness_mm: 5,
            qty: 1,
            processes: ['HT'],
            bevel_width_cm: 1,
            hole_length_cm: 2,
            hole_width_cm: 2,
            hole_qty: 1
        };
        setOrderForm('items', [...currentItems, newItem]);
    };

    const handleDuplicateItem = (index) => {
        const currentItems = orderForm.items || [];
        if (!currentItems[index]) return;
        const sourceItem = currentItems[index];
        const newItem = {
            ...JSON.parse(JSON.stringify(sourceItem)),
            id: Date.now() + Math.random()
        };
        const newItems = [...currentItems];
        newItems.splice(index + 1, 0, newItem);
        setOrderForm('items', newItems);
    };

    const handleAddItemWithGlassType = (groupId, glassType = '', insertAfterIndex = null) => {
        const currentItems = orderForm.items || [];
        
        let insertIndex = currentItems.length;
        if (insertAfterIndex !== null && insertAfterIndex !== undefined && insertAfterIndex >= 0) {
            insertIndex = insertAfterIndex + 1;
        } else if (groupId) {
            const lastInGroupIdx = currentItems
                .map((item, idx) => ({ item, idx }))
                .filter(({ item }) => item.group_id === groupId || (glassType && item.glass_type === glassType))
                .pop()?.idx;
            if (lastInGroupIdx !== undefined) {
                insertIndex = lastInGroupIdx + 1;
            }
        }

        const lastMatching = [...currentItems].reverse().find(i => (i.group_id === groupId || (glassType && i.glass_type === glassType)));
        const targetType = glassType || (lastMatching?.glass_type || '');
        const newItem = {
            id: Date.now() + Math.random(),
            group_id: groupId || ('grp_' + Date.now() + '_' + Math.random()),
            glass_type: targetType,
            length_cm: '',
            width_cm: '',
            thickness_mm: targetType ? extractThickness(targetType) : 5,
            qty: 1,
            processes: lastMatching?.processes ? [...lastMatching.processes] : ['HT'],
            bevel_width_cm: 1,
            hole_length_cm: 2,
            hole_width_cm: 2,
            hole_qty: 1
        };

        const newItems = [...currentItems];
        newItems.splice(insertIndex, 0, newItem);
        setOrderForm('items', newItems);
    };

    const handleAddNewGlassGroup = () => {
        const currentItems = orderForm.items || [];
        const newGroupId = 'grp_' + Date.now() + '_' + Math.random();
        const newItem = {
            id: Date.now() + Math.random(),
            group_id: newGroupId,
            glass_type: '',
            length_cm: '',
            width_cm: '',
            thickness_mm: 5,
            qty: 1,
            processes: ['HT'],
            bevel_width_cm: 1,
            hole_length_cm: 2,
            hole_width_cm: 2,
            hole_qty: 1
        };
        setOrderForm('items', [...currentItems, newItem]);
    };

    const handleGroupGlassTypeChange = (groupId, newGlassType) => {
        const currentItems = (orderForm.items || []).map((item, i) => {
            const itemGrp = item.group_id || ('grp_' + (item.glass_type ? item.glass_type.replace(/\s+/g, '_') : i));
            if (itemGrp === groupId) {
                return {
                    ...item,
                    glass_type: newGlassType,
                    thickness_mm: extractThickness(newGlassType)
                };
            }
            return item;
        });
        setOrderForm('items', currentItems);
    };

    const handleRemoveItem = (index) => {
        const currentItems = orderForm.items || [];
        if (currentItems.length <= 1) return;
        setOrderForm('items', currentItems.filter((_, i) => i !== index));
    };

    const handleItemChange = (index, field, value) => {
        const currentItems = [...(orderForm.items || [])];
        const updatedItem = { ...currentItems[index], [field]: value };
        if (field === 'glass_type') {
            updatedItem.thickness_mm = extractThickness(value);
        }
        currentItems[index] = updatedItem;
        setOrderForm('items', currentItems);
    };

    const handleAddHoleSpec = (itemIndex) => {
        const currentItems = [...(orderForm.items || [])];
        const item = currentItems[itemIndex];
        if (!item) return;

        const currentHoles = Array.isArray(item.holes) && item.holes.length > 0
            ? item.holes.map(h => ({ ...h }))
            : [{ hole_length_cm: item.hole_length_cm || 2, hole_width_cm: item.hole_width_cm || 2, hole_qty: item.hole_qty || 1 }];

        currentHoles.push({ hole_length_cm: 2, hole_width_cm: 2, hole_qty: 1 });

        currentItems[itemIndex] = {
            ...item,
            holes: currentHoles,
            hole_length_cm: currentHoles[0].hole_length_cm,
            hole_width_cm: currentHoles[0].hole_width_cm,
            hole_qty: currentHoles[0].hole_qty
        };
        setOrderForm('items', currentItems);
    };

    const handleHoleSpecChange = (itemIndex, holeIndex, field, value) => {
        const currentItems = [...(orderForm.items || [])];
        const item = currentItems[itemIndex];
        if (!item) return;

        const currentHoles = Array.isArray(item.holes) && item.holes.length > 0
            ? item.holes.map(h => ({ ...h }))
            : [{ hole_length_cm: item.hole_length_cm || 2, hole_width_cm: item.hole_width_cm || 2, hole_qty: item.hole_qty || 1 }];

        if (currentHoles[holeIndex]) {
            currentHoles[holeIndex][field] = value;
        }

        currentItems[itemIndex] = {
            ...item,
            holes: currentHoles,
            hole_length_cm: currentHoles[0].hole_length_cm,
            hole_width_cm: currentHoles[0].hole_width_cm,
            hole_qty: currentHoles[0].hole_qty
        };
        setOrderForm('items', currentItems);
    };

    const handleRemoveHoleSpec = (itemIndex, holeIndex) => {
        const currentItems = [...(orderForm.items || [])];
        const item = currentItems[itemIndex];
        if (!item) return;

        let currentHoles = Array.isArray(item.holes) && item.holes.length > 0
            ? item.holes.map(h => ({ ...h }))
            : [{ hole_length_cm: item.hole_length_cm || 2, hole_width_cm: item.hole_width_cm || 2, hole_qty: item.hole_qty || 1 }];

        if (currentHoles.length <= 1) return;
        currentHoles = currentHoles.filter((_, i) => i !== holeIndex);

        currentItems[itemIndex] = {
            ...item,
            holes: currentHoles,
            hole_length_cm: currentHoles[0].hole_length_cm,
            hole_width_cm: currentHoles[0].hole_width_cm,
            hole_qty: currentHoles[0].hole_qty
        };
        setOrderForm('items', currentItems);
    };

    const toggleItemProcess = (itemIndex, procId) => {
        const currentItems = [...(orderForm.items || [])];
        const item = currentItems[itemIndex];
        if (!item) return;

        const existingProcs = Array.isArray(item.processes) ? [...item.processes] : [];
        const procIndex = existingProcs.indexOf(procId);

        if (procIndex >= 0) {
            existingProcs.splice(procIndex, 1);
        } else {
            existingProcs.push(procId);
        }

        currentItems[itemIndex] = {
            ...item,
            processes: existingProcs
        };
        setOrderForm('items', currentItems);
    };

    const MASTER_ACCESSORY_STOCK = [
        { id: 'spigot_304', name: 'Spigot Stainless 304 (Kanopi/Balkon)', price: 185000, unit: 'pcs', stock: 48, status: 'Aman' },
        { id: 'hinge_gtg', name: 'Engsel Glass-to-Glass Heavy Duty', price: 240000, unit: 'set', stock: 24, status: 'Aman' },
        { id: 'bracket_clamp', name: 'Bracket Clamp Stainless Steel', price: 65000, unit: 'pcs', stock: 60, status: 'Aman' },
        { id: 'sealant_neutral', name: 'Silicone Sealant Neutral High Grade', price: 45000, unit: 'tube', stock: 15, status: 'Aman' },
        { id: 'handle_tubular', name: 'Handle Pintu Stainless Tubular 40cm', price: 320000, unit: 'pasang', stock: 12, status: 'Aman' },
        { id: 'floor_hinge_d', name: 'Floor Hinge Heavy Duty Dorma Style', price: 850000, unit: 'unit', stock: 5, status: 'Menipis' },
        { id: 'lock_glass', name: 'Slot Kunci Kaca Stainless', price: 145000, unit: 'pcs', stock: 18, status: 'Aman' },
        { id: 'alum_u_channel', name: 'List Alumunium U-Channel Profile', price: 110000, unit: 'batang', stock: 35, status: 'Aman' },
        { id: 'gasket_weather', name: 'Karet Lis Gasket Weatherstrip', price: 15000, unit: 'meter', stock: 100, status: 'Aman' },
        { id: 'patch_fitting', name: 'Patch Fitting Door Lock Set', price: 550000, unit: 'set', stock: 0, status: 'Habis' }
    ];

    const handleAddAccessoryFromStock = (stockItemId) => {
        if (!stockItemId) return;
        const masterItem = MASTER_ACCESSORY_STOCK.find(item => item.id === stockItemId);
        if (!masterItem) return;

        const currentAccs = Array.isArray(orderForm.accessories) ? [...orderForm.accessories] : [];
        const existingIdx = currentAccs.findIndex(a => typeof a === 'object' && a.id === masterItem.id);
        if (existingIdx >= 0) {
            currentAccs[existingIdx].qty += 1;
        } else {
            currentAccs.push({
                id: masterItem.id,
                name: masterItem.name,
                price: masterItem.price,
                unit: masterItem.unit,
                stock: masterItem.stock,
                qty: 1
            });
        }
        setOrderForm('accessories', currentAccs);
    };

    const handleRemoveAccessory = (index) => {
        const currentAccs = Array.isArray(orderForm.accessories) ? [...orderForm.accessories] : [];
        setOrderForm('accessories', currentAccs.filter((_, i) => i !== index));
    };

    const handleAccessoryQtyChange = (index, qty) => {
        const currentAccs = Array.isArray(orderForm.accessories) ? [...orderForm.accessories] : [];
        if (currentAccs[index] && typeof currentAccs[index] === 'object') {
            currentAccs[index].qty = Math.max(1, parseInt(qty) || 1);
            setOrderForm('accessories', currentAccs);
        }
    };

    // Real-Time Multi Item Price Calculation (With GM, HT, Bevel, Bor, Etsa Formulas)
    const calcItems = (orderForm.items || []).map(it => {
        const l = parseDim(it.length_cm);
        const w = parseDim(it.width_cm);
        const q = parseInt(it.qty) || 0;
        const procs = Array.isArray(it.processes) ? it.processes : ['HT'];

        const areaM2 = (l * w) / 10000;
        const perimeterM = (2 * (l + w)) / 100;

        const baseGlassPrice = (l > 0 && w > 0) ? Math.max(250000, Math.round(areaM2 * 500000)) * q : 0;

        const feeGM = procs.includes('GM') ? Math.round(perimeterM * 10000) * q : 0;
        const feeHT = procs.includes('HT') ? Math.round(perimeterM * 1000) * q : 0;

        const bevelWidthCm = parseDim(it.bevel_width_cm) || 1;
        const feeBV = procs.includes('BV') ? Math.round((perimeterM * 15000) + (bevelWidthCm * 10000)) * q : 0;

        let feeBor = 0;
        let holeRuasCm = 0;
        if (procs.includes('Bor')) {
            const holes = Array.isArray(it.holes) && it.holes.length > 0 
                ? it.holes 
                : [{ hole_length_cm: it.hole_length_cm || 2, hole_width_cm: it.hole_width_cm || 2, hole_qty: it.hole_qty || 1 }];
            
            holes.forEach(h => {
                const hL = parseDim(h.hole_length_cm) || 2;
                const hW = parseDim(h.hole_width_cm) || 2;
                const hQ = parseInt(h.hole_qty) || 1;
                const ruas = 2 * (hL + hW);
                holeRuasCm += ruas * hQ;
                feeBor += Math.round(ruas * 2500) * hQ * q;
            });
        }

        let feeEtsa = 0;
        let etsaAreaM2 = 0;
        if (procs.includes('Etsa')) {
            const etsaL = parseDim(it.etsa_length_cm) || l;
            const etsaW = parseDim(it.etsa_width_cm) || w;
            const etsaQ = parseInt(it.etsa_qty) || 1;
            etsaAreaM2 = (etsaL * etsaW) / 10000;
            feeEtsa = Math.round(etsaAreaM2 * etsaQ * 50000) * q;
            feeEtsa = Math.max(25000 * q, feeEtsa);
        }

        const subtotal = baseGlassPrice + feeGM + feeHT + feeBV + feeBor + feeEtsa;

        return {
            ...it,
            areaM2,
            perimeterM,
            baseGlassPrice,
            feeGM,
            feeHT,
            feeBV,
            feeBor,
            feeEtsa,
            holeRuasCm,
            subtotal
        };
    });

    const calcTotalGlassBasePrice = calcItems.reduce((sum, it) => sum + (it.baseGlassPrice || 0), 0);
    const calcTotalProcessFees = calcItems.reduce((sum, it) => sum + ((it.feeGM || 0) + (it.feeHT || 0) + (it.feeBV || 0) + (it.feeBor || 0) + (it.feeEtsa || 0)), 0);
    const calcTotalAccessoryFees = (orderForm.accessories || []).reduce((sum, acc) => sum + (typeof acc === 'object' ? (acc.price || 0) * (acc.qty || 1) : 0), 0);
    const calcSubtotal = calcTotalGlassBasePrice + calcTotalProcessFees + calcTotalAccessoryFees;
    const calcPriorityFee = orderForm.priority_status === 'Prioritas'
        ? (parseFloat(orderForm.priority_fee) || 0)
        : 0;
    const calcCustomFee = parseFloat(orderForm.custom_fee) || 0;
    const calcTotalPrice = calcSubtotal + calcPriorityFee + calcCustomFee;

    const toggleAccessory = (acc) => {
        const current = orderForm.accessories || [];
        setOrderForm('accessories', current.includes(acc) ? current.filter(a => a !== acc) : [...current, acc]);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setOrderForm('sketch_photo', file);
            setSketchPreview(URL.createObjectURL(file));
        }
    };

    const { data: scrapForm, setData: setScrapForm, post: postScrap, reset: resetScrap } = useForm({
        glass_type: 'Kaca Cermin 5mm Polos',
        length_cm: 30,
        width_cm: 40,
        rak_location: 'Rak F7'
    });

    const roleTitles = {
        admin_toko: '🏪 Admin Toko',
        admin_gudang: '🏭 Admin Gudang',
        divisi_ht: '✂️ Divisi Potong (HT)',
        divisi_gm: '✨ Divisi GM (Gosok)',
        divisi_bv: '💎 Divisi BV (Bevel)',
        divisi_etsa: '🌫️ Divisi Etsa (Blur)',
        driver: '🚚 Supir / Driver',
        owner: '📈 Owner & Direksi',
        hrd: '👔 HRD (Personalia & SDM)',
        admin_finance: '💳 Admin Finance',
        finance: '💰 Finance & Akuntan'
    };

    const sanitizeField = (val) => {
        if (val === null || val === undefined) return '-';
        const s = String(val).trim();
        return s === '' ? '-' : s;
    };

    const handleCreateOrder = (e, targetStatus = 'pengerjaan') => {
        e.preventDefault();
        router.post(route('orders.store'), {
            ...orderForm,
            customer_name: sanitizeField(orderForm.customer_name),
            customer_phone: sanitizeField(orderForm.customer_phone),
            customer_address: sanitizeField(orderForm.customer_address),
            description: sanitizeField(orderForm.description),
            used_scrap_rak: sanitizeField(orderForm.used_scrap_rak),
            subtotal: calcSubtotal,
            priority_fee: calcPriorityFee,
            custom_fee: calcCustomFee,
            total_price: calcTotalPrice,
            status: targetStatus
        }, {
            forceFormData: true,
            onSuccess: () => {
                setShowNewOrderModal(false);
                setSketchPreview(null);
                resetOrder();
            }
        });
    };

    const handleOpenEditModal = (order) => {
        setEditingOrder(order);
        if (order.status === 'pengerjaan') {
            router.post(route('orders.lock_revision', order.id), {}, { preserveScroll: true });
        }
        let itemsList = Array.isArray(order.items) && order.items.length > 0
            ? order.items.map((it, idx) => ({
                id: idx + 1,
                glass_type: it.glass_type || 'Kaca Cermin 5 mm polos',
                length_cm: it.length_cm || 150,
                width_cm: it.width_cm || 120,
                thickness_mm: it.thickness_mm || 5,
                qty: it.qty || 1,
                processes: Array.isArray(it.processes) ? it.processes : ['HT']
            }))
            : [{
                id: 1,
                glass_type: order.glass_type || 'Kaca Cermin 5 mm polos',
                length_cm: order.length_cm || 150,
                width_cm: order.width_cm || 120,
                thickness_mm: order.thickness_mm || 5,
                qty: 1,
                processes: Array.isArray(order.processes) ? order.processes : ['HT']
            }];

        const isLunas = order.payment_status === 'Lunas';
        let initialDpPercent = 50;
        if (order.payment_status && order.payment_status.includes('DP')) {
            const match = order.payment_status.match(/\d+/);
            if (match) initialDpPercent = parseInt(match[0]);
        }

        setOrderForm({
            order_date: order.order_date || new Date().toISOString().split('T')[0],
            customer_name: order.customer_name || '',
            customer_phone: order.customer_phone || '',
            customer_address: order.customer_address || '',
            items: itemsList,
            accessories: Array.isArray(order.accessories) ? order.accessories : [],
            description: order.description || '',
            revision_notes: order.revision_notes || '',
            sketch_photo: null,
            priority_status: order.priority_status || 'Biasa',
            priority_fee: order.priority_fee || 0,
            custom_fee: order.custom_fee || 0,
            payment_option: isLunas ? 'lunas' : 'dp',
            dp_percent: initialDpPercent,
            custom_paid_amount: order.paid_amount || '',
            deadline_date: order.deadline_date || '',
            used_scrap_rak: order.used_scrap_rak || '',
            status: order.status || 'draft'
        });
        setSketchPreview(order.sketch_photo_path ? '/storage/' + order.sketch_photo_path : null);
        setShowEditOrderModal(true);
    };

    const handleCloseEditModal = () => {
        if (editingOrder && editingOrder.status === 'pengerjaan') {
            router.post(route('orders.cancel_revision_lock', editingOrder.id), {}, { preserveScroll: true });
        }
        setShowEditOrderModal(false);
        setEditingOrder(null);
        setSketchPreview(null);
    };

    const handleUpdateOrderSubmit = (e, targetStatus = null) => {
        e.preventDefault();
        if (!editingOrder) return;

        const finalStatus = targetStatus || orderForm.status;

        router.post(route('orders.update', editingOrder.id), {
            ...orderForm,
            customer_name: sanitizeField(orderForm.customer_name),
            customer_phone: sanitizeField(orderForm.customer_phone),
            customer_address: sanitizeField(orderForm.customer_address),
            description: sanitizeField(orderForm.description),
            revision_notes: sanitizeField(orderForm.revision_notes),
            used_scrap_rak: sanitizeField(orderForm.used_scrap_rak),
            subtotal: calcSubtotal,
            priority_fee: calcPriorityFee,
            custom_fee: calcCustomFee,
            total_price: calcTotalPrice,
            status: finalStatus
        }, {
            forceFormData: true,
            onSuccess: () => {
                setShowEditOrderModal(false);
                setEditingOrder(null);
                setSketchPreview(null);
                resetOrder();
            }
        });
    };

    const handleOpenPromoteModal = (order) => {
        setTargetPromoteOrder(order);
        setPromotePaymentOption('dp');
        setPromoteDpPercent(50);
        setPromoteCustomPaidAmount(Math.round(order.total_price * 0.5));
        setShowPromoteModal(true);
    };

    const handleConfirmPromote = (e) => {
        if (e) e.preventDefault();
        if (!targetPromoteOrder) return;
        router.post(route('orders.promote', targetPromoteOrder.id), {
            payment_option: promotePaymentOption,
            dp_percent: promoteDpPercent,
            custom_paid_amount: promotePaymentOption === 'custom' ? promoteCustomPaidAmount : null
        }, {
            onSuccess: () => {
                setShowPromoteModal(false);
                setTargetPromoteOrder(null);
            }
        });
    };

    const getPromotePaidAmount = () => {
        if (!targetPromoteOrder) return 0;
        const total = targetPromoteOrder.total_price || 0;
        if (promotePaymentOption === 'lunas') return total;
        if (promotePaymentOption === 'custom') return parseFloat(promoteCustomPaidAmount) || 0;
        return Math.round((total * promoteDpPercent) / 100);
    };

    const handleAcknowledgeRevision = (orderId) => {
        router.post(route('orders.acknowledge_revision', orderId), {}, {
            preserveScroll: true
        });
    };

    const renderProgressTracker = (o) => {
        const procs = Array.isArray(o.processes) && o.processes.length > 0 ? o.processes : ['HT'];
        const currentDiv = o.current_division || 'admin_gudang';
        const divProgress = o.division_progress || {};

        const divOrder = [
            { key: 'HT', divKey: 'divisi_ht', label: 'HT' },
            { key: 'GM', divKey: 'divisi_gm', label: 'GM' },
            { key: 'BV', divKey: 'divisi_bv', label: 'BV' },
            { key: 'Etsa', divKey: 'divisi_etsa', label: 'Etsa' },
        ];

        const activeIndex = divOrder.findIndex(d => d.divKey === currentDiv);

        return (
            <div className="space-y-1.5 min-w-[140px]">
                <div className="flex items-center gap-1">
                    <span className="text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                        📍 {roleTitles[currentDiv] || currentDiv}
                    </span>
                </div>

                <div className="flex flex-wrap items-center gap-1 pt-0.5">
                    {divOrder.map((d, idx) => {
                        const isRequired = procs.includes(d.key);
                        const statusText = divProgress[d.key];

                        let badgeStyle = "bg-slate-900/60 text-slate-500 border-slate-800 opacity-50";
                        let statusIcon = "⚪";

                        if (!isRequired && currentDiv !== d.divKey && statusText !== 'Selesai') {
                            return null;
                        }

                        if (statusText === 'Selesai' || (activeIndex > idx && activeIndex !== -1)) {
                            badgeStyle = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold";
                            statusIcon = "✅";
                        } else if (currentDiv === d.divKey || statusText === 'Sedang Dikerjakan' || statusText === 'Menunggu Dispatch') {
                            badgeStyle = "bg-cyan-500/25 text-cyan-300 border-cyan-400 font-extrabold animate-pulse shadow-sm shadow-cyan-500/20";
                            statusIcon = "⚙️";
                        }

                        return (
                            <span
                                key={d.key}
                                className={`text-[10px] px-1.5 py-0.5 rounded border flex items-center gap-1 ${badgeStyle}`}
                                title={`${d.label}: ${statusText || (currentDiv === d.divKey ? 'Aktif Pengerjaan' : 'Antrean')}`}
                            >
                                <span>{statusIcon}</span>
                                <span>{d.label}</span>
                            </span>
                        );
                    })}
                </div>
            </div>
        );
    };

    const getOrderRelevantDivisions = (o) => {
        if (!o) return [];
        let procs = [];
        if (Array.isArray(o.processes) && o.processes.length > 0) {
            procs = [...o.processes];
        }
        if (Array.isArray(o.items)) {
            o.items.forEach(it => {
                if (Array.isArray(it.processes)) {
                    it.processes.forEach(p => {
                        if (!procs.includes(p)) procs.push(p);
                    });
                }
            });
        }
        if (procs.length === 0) procs = ['HT'];
        if (!procs.includes('HT')) procs.unshift('HT');

        // Always sort procs according to physical factory sequence: HT (Potong) -> GM -> BV -> Etsa
        const fixedOrder = ['HT', 'GM', 'BV', 'Etsa'];
        procs.sort((a, b) => fixedOrder.indexOf(a) - fixedOrder.indexOf(b));

        const divInfo = {
            'HT': { key: 'divisi_ht', code: 'HT', name: 'Divisi Potong (HT & Bor)', icon: '✂️', bg: 'bg-rose-500/10 text-rose-300 border-rose-500/30' },
            'GM': { key: 'divisi_gm', code: 'GM', name: 'Divisi GM (Gosok Mesin)', icon: '✨', bg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' },
            'BV': { key: 'divisi_bv', code: 'BV', name: 'Divisi BV (Beveling)', icon: '💎', bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30' },
            'Etsa': { key: 'divisi_etsa', code: 'Etsa', name: 'Divisi Etsa (Sandblast Blur)', icon: '🌫️', bg: 'bg-purple-500/10 text-purple-300 border-purple-500/30' }
        };

        return procs.map(p => divInfo[p]).filter(Boolean);
    };

    const handleOpenDispatchModal = (order) => {
        setSelectedDispatchOrder(order);
        const rels = getOrderRelevantDivisions(order);
        if (rels.length > 0) {
            setTargetDivChoice(rels[0].key);
        } else {
            setTargetDivChoice('divisi_ht');
        }
        setShowDispatchModal(true);
    };

    const handleDispatchOrderSubmit = (e) => {
        e.preventDefault();
        if (!selectedDispatchOrder) return;
        router.post(route('orders.dispatch', selectedDispatchOrder.id), {
            target_division: targetDivChoice
        }, {
            onSuccess: () => {
                setShowDispatchModal(false);
                setSelectedDispatchOrder(null);
            }
        });
    };

    const handleCreateScrap = (e) => {
        e.preventDefault();
        postScrap(route('scrap.store'), {
            onSuccess: () => {
                setShowScrapModal(false);
                resetScrap();
            }
        });
    };

    const handleStartJob = (id) => {
        router.post(route('orders.start', id));
    };

    const handleFinishJob = (id, nextDiv = 'QC_Ready') => {
        router.post(route('orders.finish', id), {
            next_division: nextDiv
        });
    };

    const handleCompleteDelivery = (id, markLunas = false) => {
        router.post(route('orders.complete_delivery', id), {
            mark_lunas: markLunas
        });
    };

    const handleLogout = () => {
        router.post(route('logout'));
    };

    const filteredOrders = initialOrders.filter(o => {
        if (o.status === 'draft' && userRole !== 'admin_toko' && userRole !== 'owner') {
            return false;
        }
        const matchesSearch = isMatchSearch(o);
        if (activeOrderCard === 'draft') return o.status === 'draft' && matchesSearch;
        if (activeOrderCard === 'pengerjaan') return o.status === 'pengerjaan' && matchesSearch;
        if (activeOrderCard === 'pengiriman') return o.status === 'pengiriman' && matchesSearch;
        if (activeOrderCard === 'pembayaran') return o.payment_status !== 'Lunas' && matchesSearch;
        if (activeOrderCard === 'selesai') return o.status === 'selesai' && matchesSearch;
        return matchesSearch;
    });

    return (
        <div className="h-screen bg-[#090d16] text-slate-100 font-sans flex flex-col overflow-hidden">
            <Head title={`Dashboard (${roleTitles[userRole] || userRole}) - SYP GLASS`} />

            {/* TOP BAR */}
            <div className="bg-[#0c111d] border-b border-slate-800 px-3 sm:px-6 py-2 flex flex-wrap justify-between items-center text-[11px] sm:text-xs shrink-0 gap-2">
                <div className="flex items-center gap-2">
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                        AUTHENTICATED ROLE LOGIN ACTIVE
                    </span>
                    <span className="text-slate-400 hidden sm:inline">CV Cahya Karunia Jaya - Syp Operational</span>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold">🌐 Landing Page Public</Link>
                </div>
            </div>

            {/* HEADER */}
            <header className="bg-[#0b0f19]/80 backdrop-blur-md border-b border-slate-800 shrink-0 px-3 sm:px-6 py-3 flex flex-wrap md:flex-nowrap justify-between items-center z-40 gap-3">
                <div className="flex items-center gap-2.5 sm:gap-3">
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden bg-slate-900 text-cyan-400 p-2 rounded-xl border border-slate-800 text-base hover:bg-slate-800 transition focus:outline-none flex items-center justify-center shrink-0"
                        title="Buka Navigasi Menu"
                    >
                        {mobileMenuOpen ? '✕' : '☰'}
                    </button>
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center text-slate-950 font-extrabold text-lg sm:text-xl shadow-lg shadow-cyan-500/20 shrink-0">
                        ⚡
                    </div>
                    <div>
                        <h1 className="font-extrabold text-sm sm:text-lg tracking-wider text-slate-100">SYP GLASS OPERATIONAL</h1>
                        <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-widest truncate max-w-[170px] sm:max-w-none">Logged in as: {userName}</p>
                    </div>
                </div>

                {/* GLOBAL SEARCH INPUT BAR */}
                <div className="flex-1 max-w-lg mx-0 md:mx-6 w-full order-3 md:order-none">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="🔍 Cari global (SPO, Customer, HP, Alamat, Kaca, Ukuran, Driver, Supplier)..."
                            value={searchTerm}
                            onChange={e => handleSearchChange(e.target.value)}
                            className="w-full bg-slate-950/90 border border-cyan-500/30 rounded-xl px-3.5 py-1.5 sm:py-2 text-xs text-slate-100 placeholder-slate-400 focus:border-cyan-400 focus:outline-none shadow-inner transition font-medium"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => handleSearchChange('')}
                                className="absolute right-3 top-2 text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
                                title="Hapus pencarian"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4 ml-auto md:ml-0">
                    <div className="bg-slate-900 border border-slate-800 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold text-cyan-400 whitespace-nowrap">
                        Role: {roleTitles[userRole] || userRole}
                    </div>
                    <button onClick={handleLogout} className="bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 font-bold px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs transition whitespace-nowrap">
                        🚪 Log out
                    </button>
                </div>
            </header>

            {/* MOBILE TOP TAB BAR HORIZONTAL SCROLLER */}
            <div className="md:hidden bg-[#0c111d] border-b border-slate-800/80 px-3 py-2 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
                {(userRole === 'owner' || userRole === 'finance' || userRole === 'admin_finance') && (
                    <button 
                        onClick={() => setActiveTab('dashboard')} 
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${activeTab === 'dashboard' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}
                    >
                        📊 Dashboard
                    </button>
                )}
                {(userRole === 'admin_toko' || userRole === 'admin_gudang' || userRole === 'owner') && (
                    <button 
                        onClick={() => { setActiveTab('orders'); if (userRole === 'admin_gudang') setActiveOrderCard('pengerjaan'); }} 
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${activeTab === 'orders' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}
                    >
                        📝 Orderan
                    </button>
                )}
                {(userRole === 'admin_toko' || userRole === 'admin_gudang' || userRole === 'owner' || userRole === 'driver') && (
                    <button 
                        onClick={() => setActiveTab('deliveries')} 
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${activeTab === 'deliveries' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}
                    >
                        🚚 Pengiriman ({initialOrders.filter(o => o.status === 'pengiriman').length})
                    </button>
                )}
                {(userRole.startsWith('divisi_') || userRole === 'admin_gudang' || userRole === 'owner') && (
                    <button 
                        onClick={() => setActiveTab('production')} 
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${activeTab === 'production' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}
                    >
                        ⚙️ Disposisi
                    </button>
                )}
                {(userRole === 'divisi_ht' || userRole === 'admin_gudang' || userRole === 'admin_toko' || userRole === 'owner') && (
                    <button 
                        onClick={() => setActiveTab('scrap')} 
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${activeTab === 'scrap' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}
                    >
                        📦 Stok Kaca
                    </button>
                )}
                {(userRole === 'admin_toko' || userRole === 'owner') && (
                    <button 
                        onClick={() => setActiveTab('suppliers')} 
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${activeTab === 'suppliers' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}
                    >
                        🏢 Supplier
                    </button>
                )}
                {(userRole === 'admin_toko' || userRole === 'owner' || userRole === 'finance' || userRole === 'admin_finance') && (
                    <button 
                        onClick={() => setActiveTab('accessories')} 
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${activeTab === 'accessories' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}
                    >
                        🔌 Aksesoris
                    </button>
                )}
                {(userRole === 'admin_gudang' || userRole === 'owner' || userRole === 'admin_toko' || userRole === 'finance' || userRole === 'admin_finance') && (
                    <button 
                        onClick={() => setActiveTab('supplies')} 
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${activeTab === 'supplies' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}
                    >
                        🧰 Perlengkapan
                    </button>
                )}
                {(userRole === 'admin_toko' || userRole === 'admin_gudang' || userRole === 'owner' || userRole.startsWith('divisi_') || userRole === 'driver' || userRole === 'finance' || userRole === 'admin_finance') && (
                    <button 
                        onClick={() => setActiveTab('tools')} 
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${activeTab === 'tools' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}
                    >
                        🛠️ Penunjang
                    </button>
                )}
                {(userRole === 'hrd' || userRole === 'admin_finance' || userRole === 'finance' || userRole === 'owner') && (
                    <button 
                        onClick={() => setActiveTab('employees')} 
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${activeTab === 'employees' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}
                    >
                        👥 Karyawan
                    </button>
                )}
                {(userRole === 'owner' || userRole === 'finance' || userRole === 'admin_finance') && (
                    <button 
                        onClick={() => setActiveTab('finance')} 
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${activeTab === 'finance' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}
                    >
                        💰 Finance
                    </button>
                )}
            </div>

            {/* MOBILE SIDEBAR DRAWER OVERLAY */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden flex">
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
                    <aside className="relative w-72 max-w-[80vw] bg-[#0c111d] border-r border-slate-800 p-4 space-y-2 overflow-y-auto z-10 flex flex-col h-full shadow-2xl">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-2">
                            <span className="font-extrabold text-sm text-cyan-400 flex items-center gap-1.5">⚡ NAVIGASI SYP</span>
                            <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white p-1 text-sm font-bold">✕</button>
                        </div>
                        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 mb-2 space-y-1">
                            <div className="text-[10px] text-slate-400">User Terautentikasi:</div>
                            <h4 className="font-bold text-xs text-slate-200">{userName}</h4>
                            <span className="inline-block text-[9px] text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full border border-cyan-400/20 font-bold">
                                {roleTitles[userRole]}
                            </span>
                        </div>

                        <nav className="space-y-1 flex-1">
                            {(userRole === 'owner' || userRole === 'finance' || userRole === 'admin_finance') && (
                                <button onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-left transition ${activeTab === 'dashboard' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                                    📊 <span>Dashboard Utama</span>
                                </button>
                            )}

                            {(userRole === 'admin_toko' || userRole === 'admin_gudang' || userRole === 'owner') && (
                                <button onClick={() => { setActiveTab('orders'); if (userRole === 'admin_gudang') setActiveOrderCard('pengerjaan'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-left transition ${activeTab === 'orders' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                                    📝 <span>{userRole === 'admin_toko' || userRole === 'owner' ? 'Orderan & Draf' : 'Orderan Pengerjaan'}</span>
                                </button>
                            )}

                            {(userRole === 'admin_toko' || userRole === 'admin_gudang' || userRole === 'owner' || userRole === 'driver') && (
                                <button onClick={() => { setActiveTab('deliveries'); setMobileMenuOpen(false); }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-left transition ${activeTab === 'deliveries' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                                    <div className="flex items-center gap-3">
                                        🚚 <span>{userRole === 'driver' ? 'Pengiriman Saya' : 'Pengiriman Multi-Alamat'}</span>
                                    </div>
                                    <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-cyan-500/30 font-mono">
                                        {initialOrders.filter(o => o.status === 'pengiriman').length}
                                    </span>
                                </button>
                            )}

                            {(userRole.startsWith('divisi_') || userRole === 'admin_gudang' || userRole === 'owner') && (
                                <button onClick={() => { setActiveTab('production'); setMobileMenuOpen(false); }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-left transition ${activeTab === 'production' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                                    <div className="flex items-center gap-3">
                                        ⚙️ <span>Disposisi & Divisi</span>
                                    </div>
                                </button>
                            )}

                            {(userRole === 'divisi_ht' || userRole === 'admin_gudang' || userRole === 'admin_toko' || userRole === 'owner') && (
                                <button onClick={() => { setActiveTab('scrap'); setMobileMenuOpen(false); }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-left transition ${activeTab === 'scrap' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                                    <div className="flex items-center gap-3">
                                        📦 <span>Stok Kaca</span>
                                    </div>
                                </button>
                            )}

                            {(userRole === 'admin_toko' || userRole === 'owner') && (
                                <button onClick={() => { setActiveTab('suppliers'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-left transition ${activeTab === 'suppliers' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                                    🏢 <span>Data Supplier</span>
                                </button>
                            )}

                            {(userRole === 'admin_toko' || userRole === 'owner' || userRole === 'finance' || userRole === 'admin_finance') && (
                                <button onClick={() => { setActiveTab('accessories'); setMobileMenuOpen(false); }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-left transition ${activeTab === 'accessories' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                                    <div className="flex items-center gap-3">
                                        🔌 <span>Aksesoris Konsumen</span>
                                    </div>
                                </button>
                            )}

                            {(userRole === 'admin_gudang' || userRole === 'owner' || userRole === 'admin_toko' || userRole === 'finance' || userRole === 'admin_finance') && (
                                <button onClick={() => { setActiveTab('supplies'); setMobileMenuOpen(false); }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-left transition ${activeTab === 'supplies' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                                    <div className="flex items-center gap-3">
                                        🧰 <span>Perlengkapan</span>
                                    </div>
                                </button>
                            )}

                            {(userRole === 'admin_toko' || userRole === 'admin_gudang' || userRole === 'owner' || userRole.startsWith('divisi_') || userRole === 'driver' || userRole === 'finance' || userRole === 'admin_finance') && (
                                <button onClick={() => { setActiveTab('tools'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-left transition ${activeTab === 'tools' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                                    🛠️ <span>Alat Penunjang</span>
                                </button>
                            )}

                            {(userRole === 'hrd' || userRole === 'admin_finance' || userRole === 'finance' || userRole === 'owner') && (
                                <button onClick={() => { setActiveTab('employees'); setMobileMenuOpen(false); }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-left transition ${activeTab === 'employees' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                                    <div className="flex items-center gap-3">
                                        👥 <span>Pengelolaan Karyawan</span>
                                    </div>
                                </button>
                            )}

                            {(userRole === 'owner' || userRole === 'finance' || userRole === 'admin_finance') && (
                                <button onClick={() => { setActiveTab('finance'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-left transition ${activeTab === 'finance' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                                    💰 <span>Finance & Laba/Rugi</span>
                                </button>
                            )}
                        </nav>
                    </aside>
                </div>
            )}

            {/* MAIN APP CONTAINER */}
            <div className="flex flex-1 overflow-hidden">
                {/* SIDEBAR (DESKTOP) */}
                <aside className="hidden md:block w-64 bg-[#0c111d] border-r border-slate-800/80 p-4 space-y-2 shrink-0 overflow-y-auto">
                    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 mb-4 space-y-1">
                        <div className="text-xs text-slate-400">User Terautentikasi:</div>
                        <h4 className="font-bold text-sm text-slate-200">{userName}</h4>
                        <span className="inline-block text-[10px] text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full border border-cyan-400/20 font-bold">
                            {roleTitles[userRole]}
                        </span>
                    </div>

                    <nav className="space-y-1">
                        {(userRole === 'owner' || userRole === 'finance' || userRole === 'admin_finance') && (
                            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-left transition ${activeTab === 'dashboard' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                                📊 <span>Dashboard Utama</span>
                            </button>
                        )}

                        {(userRole === 'admin_toko' || userRole === 'admin_gudang' || userRole === 'owner') && (
                            <button onClick={() => { setActiveTab('orders'); if (userRole === 'admin_gudang') setActiveOrderCard('pengerjaan'); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-left transition ${activeTab === 'orders' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                                📝 <span>{userRole === 'admin_toko' || userRole === 'owner' ? 'Orderan & Draf' : 'Orderan Pengerjaan'}</span>
                            </button>
                        )}

                        {(userRole === 'admin_toko' || userRole === 'admin_gudang' || userRole === 'owner' || userRole === 'driver') && (
                            <button onClick={() => setActiveTab('deliveries')} className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold text-left transition ${activeTab === 'deliveries' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                                <div className="flex items-center gap-3">
                                    🚚 <span>{userRole === 'driver' ? 'Pengiriman Saya' : 'Pengiriman Multi-Alamat'}</span>
                                </div>
                                <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-cyan-500/30 font-mono">
                                    {initialOrders.filter(o => o.status === 'pengiriman').length} Siap
                                </span>
                            </button>
                        )}

                        {(userRole.startsWith('divisi_') || userRole === 'admin_gudang' || userRole === 'owner') && (
                            <button onClick={() => setActiveTab('production')} className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold text-left transition ${activeTab === 'production' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                                <div className="flex items-center gap-3">
                                    ⚙️ <span>Disposisi & Divisi</span>
                                </div>
                                {(() => {
                                    if (!isDivisionWorker) return null;
                                    const pendingRevs = initialOrders.filter(o => o.current_division === userRole && o.revision_status === 'pending_division').length;

                                    if (pendingRevs > 0) {
                                        return (
                                            <span className="flex items-center gap-1 bg-rose-500/20 text-rose-300 border border-rose-500/50 px-2 py-0.5 rounded-full text-[10px] font-black animate-pulse" title={`${pendingRevs} order memiliki revisi yang butuh konfirmasi divisi`}>
                                                <span>⚠️</span>
                                                <span>{pendingRevs}</span>
                                            </span>
                                        );
                                    }
                                    return null;
                                })()}
                            </button>
                        )}

                        {(userRole === 'divisi_ht' || userRole === 'admin_gudang' || userRole === 'admin_toko' || userRole === 'owner') && (
                            <button onClick={() => setActiveTab('scrap')} className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold text-left transition ${activeTab === 'scrap' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                                <div className="flex items-center gap-3">
                                    📦 <span>Stok Kaca</span>
                                </div>
                                {sheetGlasses.filter(g => g.status === 'Pengajuan Proses Restock').length > 0 && (
                                    <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce shadow-md shadow-amber-400/30 flex items-center gap-1 border border-amber-300 font-mono">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping"></span>
                                        {sheetGlasses.filter(g => g.status === 'Pengajuan Proses Restock').length} Restock
                                    </span>
                                )}
                            </button>
                        )}

                        {(userRole === 'admin_toko' || userRole === 'owner') && (
                            <button onClick={() => setActiveTab('suppliers')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-left transition ${activeTab === 'suppliers' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                                🏢 <span>Data Supplier & Mitra</span>
                            </button>
                        )}

                        {(userRole === 'admin_toko' || userRole === 'owner' || userRole === 'finance' || userRole === 'admin_finance') && (
                            <button onClick={() => setActiveTab('accessories')} className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold text-left transition ${activeTab === 'accessories' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                                <div className="flex items-center gap-3">
                                    🔌 <span>Aksesoris Konsumen</span>
                                </div>
                                {accessoriesList.filter(a => a.status === 'Menipis' || a.status === 'Habis' || a.status === 'Pengajuan Restock').length > 0 && (
                                    <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce shadow-md shadow-amber-400/30 flex items-center gap-1 border border-amber-300 font-mono">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping"></span>
                                        {accessoriesList.filter(a => a.status === 'Menipis' || a.status === 'Habis' || a.status === 'Pengajuan Restock').length} Restock
                                    </span>
                                )}
                            </button>
                        )}

                        {(userRole === 'admin_gudang' || userRole === 'owner' || userRole === 'admin_toko' || userRole === 'finance' || userRole === 'admin_finance') && (
                            <button onClick={() => setActiveTab('supplies')} className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold text-left transition ${activeTab === 'supplies' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                                <div className="flex items-center gap-3">
                                    🧰 <span>Perlengkapan Gudang</span>
                                </div>
                                {(supplyRestockRequests.filter(r => r.status !== 'Selesai Restok').length + warehouseSuppliesList.filter(s => s.status === 'Menipis' || s.status === 'Habis').length) > 0 && (
                                    <span className="bg-purple-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce shadow-md shadow-purple-500/30 border border-purple-400 flex items-center gap-1 font-mono">
                                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                                        {supplyRestockRequests.filter(r => r.status !== 'Selesai Restok').length + warehouseSuppliesList.filter(s => s.status === 'Menipis' || s.status === 'Habis').length} Restock
                                    </span>
                                )}
                            </button>
                        )}

                        {(userRole === 'admin_toko' || userRole === 'admin_gudang' || userRole === 'owner' || userRole.startsWith('divisi_') || userRole === 'driver' || userRole === 'finance' || userRole === 'admin_finance') && (
                            <button onClick={() => setActiveTab('tools')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-left transition ${activeTab === 'tools' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                                🛠️ <span>Alat Penunjang</span>
                            </button>
                        )}

                        {(userRole === 'hrd' || userRole === 'admin_finance' || userRole === 'finance' || userRole === 'owner') && (
                            <button onClick={() => setActiveTab('employees')} className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold text-left transition ${activeTab === 'employees' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                                <div className="flex items-center gap-3">
                                    👥 <span>Pengelolaan Karyawan</span>
                                </div>
                                <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-cyan-500/30 font-mono">
                                    {employeesList.length} Staff
                                </span>
                            </button>
                        )}

                        {(userRole === 'owner' || userRole === 'finance' || userRole === 'admin_finance') && (
                            <button onClick={() => setActiveTab('finance')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-left transition ${activeTab === 'finance' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                                💰 <span>Finance & Laba/Rugi</span>
                            </button>
                        )}
                    </nav>
                </aside>

                {/* CONTENT MAIN */}
                <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto">

                    {/* TAB 1: DASHBOARD UTAMA - GRAFIK PENJUALAN & PERFORMANCE PERUSAHAAN */}
                    {activeTab === 'dashboard' && (userRole === 'owner' || userRole === 'finance' || userRole === 'admin_finance') && (
                        <DashboardOverviewTab
                            userRole={userRole}
                            userName={userName}
                            canViewPricing={canViewPricing}
                            setActiveTab={setActiveTab}
                            metrics={metrics}
                            initialOrders={initialOrders}
                            donutSlices={donutSlices}
                        />
                    )}

                    {/* TAB 2: ORDERAN SINGLE ROUTE */}
                    {activeTab === 'orders' && (
                        <OrdersTab
                            userRole={userRole}
                            canViewPricing={canViewPricing}
                            initialOrders={initialOrders}
                            filteredOrders={filteredOrders}
                            activeOrderCard={activeOrderCard}
                            setActiveOrderCard={setActiveOrderCard}
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            setActiveTab={setActiveTab}
                            handleOpenNewOrderModal={handleOpenNewOrderModal}
                            handleOpenEditModal={handleOpenEditModal}
                            handleOpenPromoteModal={handleOpenPromoteModal}
                            handleOpenDispatchModal={handleOpenDispatchModal}
                            handleOpenStickerModal={handleOpenStickerModal}
                            handleOpenSketchLightbox={handleOpenSketchLightbox}
                            setSelectedWaybillOrder={setSelectedWaybillOrder}
                            setShowWaybillModal={setShowWaybillModal}
                            handleCompleteDelivery={handleCompleteDelivery}
                        />
                    )}

                    {/* TAB 3: WORKSTATION DIVISI & DISPOSISI */}
                    {activeTab === 'production' && (
                        <ProductionTab
                            userRole={userRole}
                            isDivisionWorker={isDivisionWorker}
                            productionSubTab={productionSubTab}
                            setProductionSubTab={setProductionSubTab}
                            initialOrders={initialOrders}
                            initialScrap={initialScrap}
                            setActiveTab={setActiveTab}
                            setSelectedComplaintOrder={setSelectedComplaintOrder}
                            setShowGudangDecisionModal={setShowGudangDecisionModal}
                            handleOpenDispatchModal={handleOpenDispatchModal}
                            handleOpenStickerModal={handleOpenStickerModal}
                            handleOpenSketchLightbox={handleOpenSketchLightbox}
                            handleOpenDetailModal={handleOpenDetailModal}
                            handleOpenComplaintModal={handleOpenComplaintModal}
                            handleAcknowledgeRevision={handleAcknowledgeRevision}
                            handleStartJob={handleStartJob}
                            handleFinishJobSubmit={handleFinishJobSubmit}
                            activeWorkingOrderId={activeWorkingOrderId}
                            setActiveWorkingOrderId={setActiveWorkingOrderId}
                            activeCardNextDiv={activeCardNextDiv}
                            setActiveCardNextDiv={setActiveCardNextDiv}
                            setShowRekapModal={setShowRekapModal}
                            statTimeRange={statTimeRange}
                            setStatTimeRange={setStatTimeRange}
                            statFilterType={statFilterType}
                            setStatFilterType={setStatFilterType}
                        />
                    )}

                    {/* TAB 4: MANAJEMEN STOK (BAHAN KACA LEMBARAN BARU & SISA) */}
                    {activeTab === 'scrap' && (
                        <ScrapTab
                            userRole={userRole}
                            canViewPricing={canViewPricing}
                            stockSubTab={stockSubTab}
                            setStockSubTab={setStockSubTab}
                            sheetGlasses={sheetGlasses}
                            initialScrap={initialScrap}
                            activeStockCard={activeStockCard}
                            setActiveStockCard={setActiveStockCard}
                            stockSearchTerm={stockSearchTerm}
                            setStockSearchTerm={setStockSearchTerm}
                            showTableSupplierInfo={showTableSupplierInfo}
                            setShowTableSupplierInfo={setShowTableSupplierInfo}
                            showTablePricingInfo={showTablePricingInfo}
                            setShowTablePricingInfo={setShowTablePricingInfo}
                            filteredSheetGlasses={filteredSheetGlasses}
                            setShowAddStockModal={setShowAddStockModal}
                            handleOpenSupplierWaModal={handleOpenSupplierWaModal}
                            handleOpenRestockModal={handleOpenRestockModal}
                            handleOpenEditStockModal={handleOpenEditStockModal}
                            handleRequestRestockStatus={handleRequestRestockStatus}
                            setShowScrapModal={setShowScrapModal}
                        />
                    )}

                    {/* TAB 5: PENGIRIMAN & SURAT JALAN MULTI-ALAMAT / PENGIRIMAN SAYA */}
                    {activeTab === 'deliveries' && (
                        <DeliveriesTab
                            userRole={userRole}
                            userName={userName}
                            auth={auth}
                            initialOrders={initialOrders}
                            initialDeliveries={initialDeliveries}
                            financeTransactionsList={financeTransactionsList}
                            handleOpenCodModal={handleOpenCodModal}
                            setShowDriverClaimModal={setShowDriverClaimModal}
                            handleOpenSketchLightbox={handleOpenSketchLightbox}
                            setSelectedBatchWaybillTrip={setSelectedBatchWaybillTrip}
                            setShowBatchWaybillModal={setShowBatchWaybillModal}
                            setSelectedTripDataForModal={setSelectedTripDataForModal}
                            setShowMultiAddressModal={setShowMultiAddressModal}
                            setSelectedBarangKeluarData={setSelectedBarangKeluarData}
                            setShowBarangKeluarModal={setShowBarangKeluarModal}
                            setSelectedWaybillOrder={setSelectedWaybillOrder}
                            setShowWaybillModal={setShowWaybillModal}
                        />
                    )}

                    {/* TAB 6: FINANCE & LABA RUGI KOMPREHENSIF (EXECUTIVE COMMAND CENTER) */}
                    {activeTab === 'finance' && (userRole === 'owner' || userRole === 'finance' || userRole === 'admin_finance') && (
                        <FinanceTab
                            userRole={userRole}
                            metrics={metrics}
                            financeTransactionsList={financeTransactionsList}
                            financeSearchTerm={financeSearchTerm}
                            setFinanceSearchTerm={setFinanceSearchTerm}
                            financeCategoryFilter={financeCategoryFilter}
                            setFinanceCategoryFilter={setFinanceCategoryFilter}
                            financeSubTab={financeSubTab}
                            setFinanceSubTab={setFinanceSubTab}
                            scrapGlasses={scrapGlasses}
                            handleOpenPrintModal={handleOpenPrintModal}
                            handleOpenFinanceModal={handleOpenFinanceModal}
                            handleRejectClaim={handleRejectClaim}
                            handleApproveClaim={handleApproveClaim}
                            handleDrilldownOpex={handleDrilldownOpex}
                            handleDeleteFinanceTransaction={handleDeleteFinanceTransaction}
                        />
                    )}

                    {/* TAB 7: DATA SUPPLIER & MITRA */}
                    {activeTab === 'suppliers' && (userRole === 'admin_toko' || userRole === 'owner') && (
                        <SuppliersTab
                            userRole={userRole}
                            suppliersList={suppliersList}
                            sheetGlasses={sheetGlasses}
                            supplierSearchTerm={supplierSearchTerm}
                            setSupplierSearchTerm={setSupplierSearchTerm}
                            setShowAddSupplierModal={setShowAddSupplierModal}
                            handleOpenEditSupplierModal={handleOpenEditSupplierModal}
                            handleDeleteSupplier={handleDeleteSupplier}
                        />
                    )}

                    {/* TAB 8: STOK AKSESORIS (KHUSUS ADMIN TOKO & OWNER) */}
                    {activeTab === 'accessories' && (userRole === 'admin_toko' || userRole === 'owner') && (
                        <AccessoriesTab
                            userRole={userRole}
                            canViewPricing={canViewPricing}
                            accessoriesList={accessoriesList}
                            accSearchTerm={accSearchTerm}
                            setAccSearchTerm={setAccSearchTerm}
                            setShowAddAccModal={setShowAddAccModal}
                            setSelectedAccItem={setSelectedAccItem}
                            setAccRestockQty={setAccRestockQty}
                            setShowRestockAccModal={setShowRestockAccModal}
                            handleRequestAccRestockStatus={handleRequestAccRestockStatus}
                            handleOpenEditAccModal={handleOpenEditAccModal}
                            handleDeleteAcc={handleDeleteAcc}
                        />
                    )}

                    {/* TAB: PERLENGKAPAN GUDANG (BARANG HABIS PAKAI OPERASIONAL) */}
                    {activeTab === 'supplies' && (
                        <WarehouseSuppliesTab
                            userRole={userRole}
                            warehouseSuppliesList={warehouseSuppliesList}
                            supplyRestockRequests={supplyRestockRequests}
                            supplyUsageLogs={supplyUsageLogs}
                            supplySubTab={supplySubTab}
                            setSupplySubTab={setSupplySubTab}
                            supplySearchTerm={supplySearchTerm}
                            setSupplySearchTerm={setSupplySearchTerm}
                            handleOpenRequestRestockModal={handleOpenRequestRestockModal}
                            setShowAddSupplyModal={setShowAddSupplyModal}
                            setShowUseSupplyModal={setShowUseSupplyModal}
                            handleApproveRestockRequest={handleApproveRestockRequest}
                            handleCompleteRestockRequest={handleCompleteRestockRequest}
                        />
                    )}

                    {/* TAB: ALAT PENUNJANG & PEMINJAMAN TEKNISI */}
                    {activeTab === 'tools' && (
                        <ToolsTab
                            userRole={userRole}
                            userName={userName}
                            toolsList={toolsList}
                            toolBorrowings={toolBorrowings}
                            toolSubTab={toolSubTab}
                            setToolSubTab={setToolSubTab}
                            toolSearchTerm={toolSearchTerm}
                            setToolSearchTerm={setToolSearchTerm}
                            repairFilterTab={repairFilterTab}
                            setRepairFilterTab={setRepairFilterTab}
                            setShowAddToolModal={setShowAddToolModal}
                            setShowBorrowToolModal={setShowBorrowToolModal}
                            setNewBorrowForm={setNewBorrowForm}
                            handleOpenEditToolModal={handleOpenEditToolModal}
                            handleOpenReturnModal={handleOpenReturnModal}
                            handleStartRepair={handleStartRepair}
                            handleOpenCompleteRepairModal={handleOpenCompleteRepairModal}
                        />
                    )}

                    {/* TAB: PENGELOLAAN KARYAWAN & AKUN STAFF (KHUSUS HRD, FINANCE & OWNER) */}
                    {activeTab === 'employees' && (userRole === 'hrd' || userRole === 'admin_finance' || userRole === 'finance' || userRole === 'owner') && (
                        <EmployeesTab
                            userRole={userRole}
                            auth={auth}
                            employeesList={employeesList}
                            activityLogsList={activityLogsList}
                            employeeSubTab={employeeSubTab}
                            setEmployeeSubTab={setEmployeeSubTab}
                            employeeSearchTerm={employeeSearchTerm}
                            setEmployeeSearchTerm={setEmployeeSearchTerm}
                            employeeRoleFilter={employeeRoleFilter}
                            setEmployeeRoleFilter={setEmployeeRoleFilter}
                            setSelectedEmployeeForEdit={setSelectedEmployeeForEdit}
                            setShowEmployeeModal={setShowEmployeeModal}
                            handleDeleteEmployee={handleDeleteEmployee}
                        />
                    )}

                </main>
            </div>

            {/* MODAL 1: ORDER BARU (ADMIN TOKO - 12 POINT SPEC) */}
            {/* MODAL 1: ORDER BARU (ADMIN TOKO - 12 POINT SPEC) */}
            <NewOrderModal
                show={showNewOrderModal}
                onClose={() => setShowNewOrderModal(false)}
                orderForm={orderForm}
                setOrderForm={setOrderForm}
                formatIndonesianDate={formatIndonesianDate}
                sanitizeCustomerName={sanitizeCustomerName}
                sanitizeCustomerPhone={sanitizeCustomerPhone}
                handleItemChange={handleItemChange}
                handleAddItem={handleAddItem}
                handleRemoveItem={handleRemoveItem}
                handleDuplicateItem={handleDuplicateItem}
                handleAddItemWithGlassType={handleAddItemWithGlassType}
                handleAddNewGlassGroup={handleAddNewGlassGroup}
                handleGroupGlassTypeChange={handleGroupGlassTypeChange}
                handleAddHoleSpec={handleAddHoleSpec}
                handleHoleSpecChange={handleHoleSpecChange}
                handleRemoveHoleSpec={handleRemoveHoleSpec}
                toggleItemProcess={toggleItemProcess}
                handleCreateOrder={handleCreateOrder}
                handleFileChange={handleFileChange}
                sketchPreview={sketchPreview}
                calcItems={calcItems}
                getDynamicGlassTypes={getDynamicGlassTypes}
                sheetGlasses={sheetGlasses}
                findMatchingScrapsForOrder={findMatchingScrapsForOrder}
                isGlassTypeCompatible={isGlassTypeCompatible}
                initialScrap={initialScrap}
                extractThickness={extractThickness}
                calculateScrapYield={calculateScrapYield}
                parseDim={parseDim}
                customScrapQtyMap={customScrapQtyMap}
                handleUpdateIndividualScrapQty={handleUpdateIndividualScrapQty}
                handleToggleIndividualScrap={handleToggleIndividualScrap}
                handleAddAccessoryFromStock={handleAddAccessoryFromStock}
                MASTER_ACCESSORY_STOCK={MASTER_ACCESSORY_STOCK}
                handleAccessoryQtyChange={handleAccessoryQtyChange}
                handleRemoveAccessory={handleRemoveAccessory}
                formatRupiahInput={formatRupiahInput}
                parseRupiahInput={parseRupiahInput}
                calcTotalAccessoryFees={calcTotalAccessoryFees}
                calcTotalGlassBasePrice={calcTotalGlassBasePrice}
                calcTotalProcessFees={calcTotalProcessFees}
                calcPriorityFee={calcPriorityFee}
                calcTotalPrice={calcTotalPrice}
            />

            {/* MODAL 1B: EDIT DRAF ORDER (ADMIN TOKO) */}
            <EditDraftOrderModal
                show={showEditOrderModal}
                onClose={handleCloseEditModal}
                handleCloseEditModal={handleCloseEditModal}
                editingOrder={editingOrder}
                orderForm={orderForm}
                setOrderForm={setOrderForm}
                formatIndonesianDate={formatIndonesianDate}
                sanitizeCustomerName={sanitizeCustomerName}
                sanitizeCustomerPhone={sanitizeCustomerPhone}
                handleItemChange={handleItemChange}
                handleAddItem={handleAddItem}
                handleRemoveItem={handleRemoveItem}
                handleDuplicateItem={handleDuplicateItem}
                handleAddItemWithGlassType={handleAddItemWithGlassType}
                handleAddNewGlassGroup={handleAddNewGlassGroup}
                handleGroupGlassTypeChange={handleGroupGlassTypeChange}
                handleAddHoleSpec={handleAddHoleSpec}
                handleHoleSpecChange={handleHoleSpecChange}
                handleRemoveHoleSpec={handleRemoveHoleSpec}
                toggleItemProcess={toggleItemProcess}
                handleUpdateOrderSubmit={handleUpdateOrderSubmit}
                handleFileChange={handleFileChange}
                sketchPreview={sketchPreview}
                calcItems={calcItems}
                getDynamicGlassTypes={getDynamicGlassTypes}
                sheetGlasses={sheetGlasses}
                findMatchingScrapsForOrder={findMatchingScrapsForOrder}
                isGlassTypeCompatible={isGlassTypeCompatible}
                initialScrap={initialScrap}
                extractThickness={extractThickness}
                calculateScrapYield={calculateScrapYield}
                parseDim={parseDim}
                customScrapQtyMap={customScrapQtyMap}
                handleUpdateIndividualScrapQty={handleUpdateIndividualScrapQty}
                handleToggleIndividualScrap={handleToggleIndividualScrap}
                handleAddAccessoryFromStock={handleAddAccessoryFromStock}
                MASTER_ACCESSORY_STOCK={MASTER_ACCESSORY_STOCK}
                handleAccessoryQtyChange={handleAccessoryQtyChange}
                handleRemoveAccessory={handleRemoveAccessory}
                formatRupiahInput={formatRupiahInput}
                parseRupiahInput={parseRupiahInput}
                calcTotalAccessoryFees={calcTotalAccessoryFees}
                calcTotalGlassBasePrice={calcTotalGlassBasePrice}
                calcTotalProcessFees={calcTotalProcessFees}
                calcPriorityFee={calcPriorityFee}
                calcTotalPrice={calcTotalPrice}
            />

            {/* MODAL DISPATCH GUDANG */}
            <DispatchModal
                show={showDispatchModal}
                onClose={() => setShowDispatchModal(false)}
                selectedDispatchOrder={selectedDispatchOrder}
                targetDivChoice={targetDivChoice}
                setTargetDivChoice={setTargetDivChoice}
                relevantDivisions={getOrderRelevantDivisions(selectedDispatchOrder)}
                handleDispatchOrderSubmit={handleDispatchOrderSubmit}
            />
            {/* MODAL RESTOCK BARANG LEMBARAN */}
            {showRestockModal && selectedStockItem && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                                🔄 Restock Kaca Lembaran
                            </h3>
                            <button onClick={() => setShowRestockModal(false)} className="text-slate-400 hover:text-white text-2xl font-bold">&times;</button>
                        </div>

                        <form onSubmit={handleConfirmRestock} className="space-y-4 text-xs">
                            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Kode Barang:</span>
                                    <strong className="text-cyan-400 font-mono">{selectedStockItem.item_code}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Nama Barang:</span>
                                    <strong className="text-slate-200">{selectedStockItem.name}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Ukuran Standard:</span>
                                    <strong className="text-slate-200 font-mono">{selectedStockItem.size}</strong>
                                </div>
                                <div className="flex justify-between border-t border-slate-800 pt-2">
                                    <span className="text-slate-400">Stok Saat Ini:</span>
                                    <strong className="text-emerald-400 font-mono">{selectedStockItem.qty} {selectedStockItem.unit || 'Lembar'}</strong>
                                </div>
                            </div>

                            <div>
                                <label className="text-slate-400 block mb-1 font-semibold">Jumlah Lembar Masuk / Restock (+):</label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    value={restockQtyInput}
                                    onChange={e => setRestockQtyInput(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-cyan-300 font-mono font-bold focus:border-cyan-400"
                                    placeholder="e.g. 10"
                                />
                            </div>

                            <div>
                                <label className="text-slate-400 block mb-1 font-semibold">Tanggal Restock Terakhir:</label>
                                <input
                                    type="date"
                                    required
                                    value={restockDateInput}
                                    onChange={e => setRestockDateInput(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono focus:border-cyan-400"
                                />
                            </div>

                            <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowRestockModal(false)}
                                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-lg transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold px-5 py-2 rounded-lg transition shadow-lg shadow-cyan-500/20"
                                >
                                    ✓ Simpan Restock
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL TAMBAH JENIS BARANG STOK BARU */}
            {showAddStockModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-cyan-400"></span>
                                <h3 className="font-extrabold text-slate-100 text-base">
                                    ➕ Tambah Jenis Barang / Kaca Lembaran Baru
                                </h3>
                            </div>
                            <button onClick={() => setShowAddStockModal(false)} className="text-slate-400 hover:text-white text-2xl font-bold">&times;</button>
                        </div>

                        <form onSubmit={handleAddStockItemSubmit} className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-slate-400 block mb-1 font-semibold">Kode Barang (Opsional):</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. KCB-003"
                                        value={newStockForm.item_code}
                                        onChange={e => setNewStockForm({ ...newStockForm, item_code: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-cyan-300 font-mono font-bold focus:border-cyan-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-slate-400 block mb-1 font-semibold">Kategori Kaca:</label>
                                    <select
                                        value={newStockForm.category}
                                        onChange={e => setNewStockForm({ ...newStockForm, category: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-medium focus:border-cyan-400"
                                    >
                                        <option value="Kaca Cermin">Kaca Cermin</option>
                                        <option value="Kaca Bening">Kaca Bening</option>
                                        <option value="Kaca Tempered">Kaca Tempered</option>
                                        <option value="Kaca Tinted / Grey">Kaca Tinted / Grey</option>
                                        <option value="Kaca Sandblast">Kaca Sandblast</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-slate-400 block mb-1 font-semibold">Nama Barang Kaca Baru:</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Kaca Cermin Riben 5mm"
                                    value={newStockForm.name}
                                    onChange={e => setNewStockForm({ ...newStockForm, name: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-bold focus:border-cyan-400"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-slate-400 block mb-1 font-semibold">Ukuran Standard (cm):</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. 152 x 213 cm"
                                        value={newStockForm.size}
                                        onChange={e => setNewStockForm({ ...newStockForm, size: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono focus:border-cyan-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-slate-400 block mb-1 font-semibold">Stok Awal (Qty Lembar):</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={newStockForm.qty}
                                        onChange={e => setNewStockForm({ ...newStockForm, qty: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono font-bold focus:border-cyan-400"
                                    />
                                </div>
                            </div>

                            {/* HARGA BELI, HARGA JUAL & KETEBALAN */}
                            <div className="grid grid-cols-3 gap-3 border-t border-slate-800 pt-3 my-1">
                                <div>
                                    <label className="text-amber-400 block mb-1 font-semibold">Harga Beli Supplier (Rp):</label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="e.g. 250.000"
                                        value={formatNumberDots(newStockForm.buy_price)}
                                        onChange={e => setNewStockForm({ ...newStockForm, buy_price: parseNumberDots(e.target.value) })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-amber-300 font-mono font-bold focus:border-amber-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-emerald-400 block mb-1 font-semibold">Harga Jual Customer (Rp):</label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="e.g. 450.000"
                                        value={formatNumberDots(newStockForm.sell_price)}
                                        onChange={e => setNewStockForm({ ...newStockForm, sell_price: parseNumberDots(e.target.value) })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-emerald-300 font-mono font-bold focus:border-emerald-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-cyan-400 block mb-1 font-semibold">Ketebalan (mm):</label>
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="e.g. 5"
                                        value={newStockForm.thickness_mm}
                                        onChange={e => setNewStockForm({ ...newStockForm, thickness_mm: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-cyan-300 font-mono font-bold focus:border-cyan-400"
                                    />
                                </div>
                            </div>

                            {/* TARIF PROSES KHUSUS JENIS KACA INI */}
                            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2 border-b my-1">
                                <div className="flex items-center justify-between flex-wrap gap-1">
                                    <label className="text-cyan-300 font-bold block text-xs flex items-center gap-1.5">
                                        ⚙️ Tarif Proses Khusus Kaca Ini (Permeter / m²):
                                    </label>
                                    <span className="text-[10px] text-slate-400 font-mono">*Bisa disesuaikan per jenis kaca</span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    <div>
                                        <label className="text-slate-400 block mb-1 text-[10px] font-semibold">HT (Halus Tepi) /m:</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="1.000"
                                            value={formatNumberDots(newStockForm.rate_ht)}
                                            onChange={e => setNewStockForm({ ...newStockForm, rate_ht: parseNumberDots(e.target.value) })}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-cyan-300 font-mono font-bold text-xs focus:border-cyan-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-slate-400 block mb-1 text-[10px] font-semibold">GM (Gosok Mesin) /m:</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="10.000"
                                            value={formatNumberDots(newStockForm.rate_gm)}
                                            onChange={e => setNewStockForm({ ...newStockForm, rate_gm: parseNumberDots(e.target.value) })}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-cyan-300 font-mono font-bold text-xs focus:border-cyan-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-slate-400 block mb-1 text-[10px] font-semibold">BV (Beveling) /m:</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="15.000"
                                            value={formatNumberDots(newStockForm.rate_bv)}
                                            onChange={e => setNewStockForm({ ...newStockForm, rate_bv: parseNumberDots(e.target.value) })}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-cyan-300 font-mono font-bold text-xs focus:border-cyan-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-slate-400 block mb-1 text-[10px] font-semibold">Etsa (Sandblast) /m²:</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="50.000"
                                            value={formatNumberDots(newStockForm.rate_etsa)}
                                            onChange={e => setNewStockForm({ ...newStockForm, rate_etsa: parseNumberDots(e.target.value) })}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-cyan-300 font-mono font-bold text-xs focus:border-cyan-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-slate-800 pt-3 space-y-3">
                                <h4 className="font-bold text-slate-300 flex items-center justify-between">
                                    <span>🏢 Informasi Supplier Utama (Opsional)</span>
                                    <span className="text-[10px] text-cyan-400 font-normal">✨ Klik pilihan supplier untuk otomatis isi data</span>
                                </h4>
                                <div>
                                    <label className="text-slate-400 block mb-1 font-semibold">Pilih Supplier Terdaftar (Otomatis Terisi):</label>
                                    <select
                                        value={suppliersList.some(s => s.name === newStockForm.supplier_name) ? newStockForm.supplier_name : (newStockForm.supplier_name ? 'CUSTOM' : '')}
                                        onChange={e => {
                                            const val = e.target.value;
                                            if (val === 'CUSTOM') {
                                                // keep custom input
                                            } else if (val) {
                                                const found = suppliersList.find(s => s.name === val);
                                                if (found) {
                                                    setNewStockForm(prev => ({
                                                        ...prev,
                                                        supplier_name: found.name,
                                                        supplier_phone: found.phone || '',
                                                        supplier_pic: found.pic || ''
                                                    }));
                                                }
                                            } else {
                                                setNewStockForm(prev => ({
                                                    ...prev,
                                                    supplier_name: '',
                                                    supplier_phone: '',
                                                    supplier_pic: ''
                                                }));
                                            }
                                        }}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-bold focus:border-cyan-400 text-xs mb-2 cursor-pointer"
                                    >
                                        <option value="">-- Klik Untuk Pilih Supplier Terdaftar (Auto Fill) --</option>
                                        {suppliersList.map(sup => (
                                            <option key={sup.id} value={sup.name}>
                                                🏢 {sup.name} (PIC: {sup.pic} - {sup.phone})
                                            </option>
                                        ))}
                                        <option value="CUSTOM">➕ Input Manual Supplier Baru...</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-slate-400 block mb-1 font-semibold">No WhatsApp Supplier:</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 6281234567890"
                                            value={newStockForm.supplier_phone}
                                            onChange={e => setNewStockForm({ ...newStockForm, supplier_phone: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono focus:border-cyan-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-slate-400 block mb-1 font-semibold">Nama PIC Supplier:</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Pak Gunawan"
                                            value={newStockForm.supplier_pic}
                                            onChange={e => setNewStockForm({ ...newStockForm, supplier_pic: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-cyan-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowAddStockModal(false)}
                                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-lg transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 font-black px-5 py-2 rounded-xl transition shadow-lg shadow-emerald-500/20"
                                >
                                    ✓ Simpan Jenis Barang Baru
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL EDIT JENIS BARANG KACA STOK */}
            {showEditStockModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-blue-400"></span>
                                <h3 className="font-extrabold text-slate-100 text-base">
                                    ✏️ Edit Data & Harga Kaca ({editStockForm.item_code || 'KACA'})
                                </h3>
                            </div>
                            <button onClick={() => setShowEditStockModal(false)} className="text-slate-400 hover:text-white text-2xl font-bold">&times;</button>
                        </div>

                        <form onSubmit={handleEditStockSubmit} className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-slate-400 block mb-1 font-semibold">Kode Barang:</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. KCB-003"
                                        value={editStockForm.item_code}
                                        onChange={e => setEditStockForm({ ...editStockForm, item_code: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-cyan-300 font-mono font-bold focus:border-cyan-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-slate-400 block mb-1 font-semibold">Kategori Kaca:</label>
                                    <select
                                        value={editStockForm.category}
                                        onChange={e => setEditStockForm({ ...editStockForm, category: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-medium focus:border-cyan-400"
                                    >
                                        <option value="Kaca Cermin">Kaca Cermin</option>
                                        <option value="Kaca Bening">Kaca Bening</option>
                                        <option value="Kaca Tempered">Kaca Tempered</option>
                                        <option value="Kaca Tinted / Grey">Kaca Tinted / Grey</option>
                                        <option value="Kaca Sandblast">Kaca Sandblast</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-slate-400 block mb-1 font-semibold">Nama Barang Kaca:</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Kaca Cermin Riben 5mm"
                                    value={editStockForm.name}
                                    onChange={e => setEditStockForm({ ...editStockForm, name: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-bold focus:border-cyan-400"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-slate-400 block mb-1 font-semibold">Ukuran Standard (cm):</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. 152 x 213 cm"
                                        value={editStockForm.size}
                                        onChange={e => setEditStockForm({ ...editStockForm, size: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono focus:border-cyan-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-slate-400 block mb-1 font-semibold">Jumlah Stok (Qty Lembar):</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={editStockForm.qty}
                                        onChange={e => setEditStockForm({ ...editStockForm, qty: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono font-bold focus:border-cyan-400"
                                    />
                                </div>
                            </div>

                            {/* HARGA BELI, HARGA JUAL & KETEBALAN */}
                            <div className="grid grid-cols-3 gap-3 border-t border-slate-800 pt-3 my-1">
                                <div>
                                    <label className="text-amber-400 block mb-1 font-semibold">Harga Beli Supplier (Rp):</label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="e.g. 250.000"
                                        value={formatNumberDots(editStockForm.buy_price)}
                                        onChange={e => setEditStockForm({ ...editStockForm, buy_price: parseNumberDots(e.target.value) })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-amber-300 font-mono font-bold focus:border-amber-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-emerald-400 block mb-1 font-semibold">Harga Jual Customer (Rp):</label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="e.g. 450.000"
                                        value={formatNumberDots(editStockForm.sell_price)}
                                        onChange={e => setEditStockForm({ ...editStockForm, sell_price: parseNumberDots(e.target.value) })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-emerald-300 font-mono font-bold focus:border-emerald-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-cyan-400 block mb-1 font-semibold">Ketebalan (mm):</label>
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="e.g. 5"
                                        value={editStockForm.thickness_mm}
                                        onChange={e => setEditStockForm({ ...editStockForm, thickness_mm: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-cyan-300 font-mono font-bold focus:border-cyan-400"
                                    />
                                </div>
                            </div>

                            {/* TARIF PROSES KHUSUS JENIS KACA INI */}
                            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2 border-b my-1">
                                <div className="flex items-center justify-between flex-wrap gap-1">
                                    <label className="text-cyan-300 font-bold block text-xs flex items-center gap-1.5">
                                        ⚙️ Tarif Proses Khusus Kaca Ini (Permeter / m²):
                                    </label>
                                    <span className="text-[10px] text-slate-400 font-mono">*Bisa disesuaikan per jenis kaca</span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    <div>
                                        <label className="text-slate-400 block mb-1 text-[10px] font-semibold">HT (Halus Tepi) /m:</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="1.000"
                                            value={formatNumberDots(editStockForm.rate_ht)}
                                            onChange={e => setEditStockForm({ ...editStockForm, rate_ht: parseNumberDots(e.target.value) })}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-cyan-300 font-mono font-bold text-xs focus:border-cyan-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-slate-400 block mb-1 text-[10px] font-semibold">GM (Gosok Mesin) /m:</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="10.000"
                                            value={formatNumberDots(editStockForm.rate_gm)}
                                            onChange={e => setEditStockForm({ ...editStockForm, rate_gm: parseNumberDots(e.target.value) })}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-cyan-300 font-mono font-bold text-xs focus:border-cyan-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-slate-400 block mb-1 text-[10px] font-semibold">BV (Beveling) /m:</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="15.000"
                                            value={formatNumberDots(editStockForm.rate_bv)}
                                            onChange={e => setEditStockForm({ ...editStockForm, rate_bv: parseNumberDots(e.target.value) })}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-cyan-300 font-mono font-bold text-xs focus:border-cyan-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-slate-400 block mb-1 text-[10px] font-semibold">Etsa (Sandblast) /m²:</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="50.000"
                                            value={formatNumberDots(editStockForm.rate_etsa)}
                                            onChange={e => setEditStockForm({ ...editStockForm, rate_etsa: parseNumberDots(e.target.value) })}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-cyan-300 font-mono font-bold text-xs focus:border-cyan-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-slate-800 pt-3 space-y-3">
                                <h4 className="font-bold text-slate-300 flex items-center justify-between">
                                    <span>🏢 Informasi Supplier Utama</span>
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-slate-400 block mb-1 font-semibold">Nama Supplier:</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. PT Asahimas Flat Glass Tbk"
                                            value={editStockForm.supplier_name}
                                            onChange={e => setEditStockForm({ ...editStockForm, supplier_name: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-cyan-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-slate-400 block mb-1 font-semibold">No WA Supplier:</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 6281234567890"
                                            value={editStockForm.supplier_phone}
                                            onChange={e => setEditStockForm({ ...editStockForm, supplier_phone: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono focus:border-cyan-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowEditStockModal(false)}
                                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-lg transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-black px-5 py-2 rounded-xl transition shadow-lg shadow-blue-500/20"
                                >
                                    ✓ Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL TAMBAH SUPPLIER BARU */}
            {showAddSupplierModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                                <h3 className="font-extrabold text-slate-100 text-base">
                                    🏭 Tambah Perusahaan Supplier & Mitra Baru
                                </h3>
                            </div>
                            <button onClick={() => setShowAddSupplierModal(false)} className="text-slate-400 hover:text-white text-2xl font-bold">&times;</button>
                        </div>

                        <form onSubmit={handleAddSupplierSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="text-slate-400 block mb-1 font-semibold">Nama Perusahaan Supplier / Fabrikator:</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. PT Asahimas Flat Glass Tbk"
                                    value={newSupplierForm.name}
                                    onChange={e => setNewSupplierForm({ ...newSupplierForm, name: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-bold focus:border-cyan-400"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-slate-400 block mb-1 font-semibold">Spesialisasi Kategori Kaca:</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Kaca Cermin & Bening"
                                        value={newSupplierForm.category}
                                        onChange={e => setNewSupplierForm({ ...newSupplierForm, category: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:border-cyan-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-slate-400 block mb-1 font-semibold">Status Kemitraan:</label>
                                    <select
                                        value={newSupplierForm.status}
                                        onChange={e => setNewSupplierForm({ ...newSupplierForm, status: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-medium focus:border-cyan-400"
                                    >
                                        <option value="Mitra Utama">Mitra Utama</option>
                                        <option value="Mitra Aktif">Mitra Aktif</option>
                                        <option value="Mitra Impor">Mitra Impor</option>
                                        <option value="Mitra Lokal">Mitra Lokal</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-slate-400 block mb-1 font-semibold">Nama PIC / Contact Person:</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Pak Gunawan"
                                        value={newSupplierForm.pic}
                                        onChange={e => setNewSupplierForm({ ...newSupplierForm, pic: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:border-cyan-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-slate-400 block mb-1 font-semibold">No. WhatsApp (Format 62...):</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. 6281234567890"
                                        value={newSupplierForm.phone}
                                        onChange={e => setNewSupplierForm({ ...newSupplierForm, phone: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-emerald-300 font-mono font-bold focus:border-cyan-400"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-slate-400 block mb-1 font-semibold">Alamat Pabrik / Gudang Supplier:</label>
                                <textarea
                                    rows="2"
                                    placeholder="e.g. Kawasan Industri Ancol, Jl. Ancol IX No. 5, Jakarta Utara"
                                    value={newSupplierForm.address}
                                    onChange={e => setNewSupplierForm({ ...newSupplierForm, address: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:border-cyan-400"
                                />
                            </div>

                            <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowAddSupplierModal(false)}
                                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-lg transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 font-black px-5 py-2 rounded-xl transition shadow-lg shadow-emerald-500/20"
                                >
                                    ✓ Simpan Data Supplier
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL EDIT SUPPLIER */}
            {showEditSupplierModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-blue-400"></span>
                                <h3 className="font-extrabold text-slate-100 text-base">
                                    ✏️ Edit Data Perusahaan Supplier & Mitra
                                </h3>
                            </div>
                            <button onClick={() => setShowEditSupplierModal(false)} className="text-slate-400 hover:text-white text-2xl font-bold">&times;</button>
                        </div>

                        <form onSubmit={handleEditSupplierSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="text-slate-400 block mb-1 font-semibold">Nama Perusahaan Supplier / Fabrikator:</label>
                                <input
                                    type="text"
                                    required
                                    value={editSupplierForm.name}
                                    onChange={e => setEditSupplierForm({ ...editSupplierForm, name: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-bold focus:border-cyan-400"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-slate-400 block mb-1 font-semibold">Spesialisasi Kategori Kaca:</label>
                                    <input
                                        type="text"
                                        required
                                        value={editSupplierForm.category}
                                        onChange={e => setEditSupplierForm({ ...editSupplierForm, category: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:border-cyan-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-slate-400 block mb-1 font-semibold">Status Kemitraan:</label>
                                    <select
                                        value={editSupplierForm.status}
                                        onChange={e => setEditSupplierForm({ ...editSupplierForm, status: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-medium focus:border-cyan-400"
                                    >
                                        <option value="Mitra Utama">Mitra Utama</option>
                                        <option value="Mitra Aktif">Mitra Aktif</option>
                                        <option value="Mitra Impor">Mitra Impor</option>
                                        <option value="Mitra Lokal">Mitra Lokal</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-slate-400 block mb-1 font-semibold">Nama PIC / Contact Person:</label>
                                    <input
                                        type="text"
                                        required
                                        value={editSupplierForm.pic}
                                        onChange={e => setEditSupplierForm({ ...editSupplierForm, pic: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:border-cyan-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-slate-400 block mb-1 font-semibold">No. WhatsApp (Format 62...):</label>
                                    <input
                                        type="text"
                                        required
                                        value={editSupplierForm.phone}
                                        onChange={e => setEditSupplierForm({ ...editSupplierForm, phone: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-emerald-300 font-mono font-bold focus:border-cyan-400"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-slate-400 block mb-1 font-semibold">Alamat Pabrik / Gudang Supplier:</label>
                                <textarea
                                    rows="2"
                                    value={editSupplierForm.address}
                                    onChange={e => setEditSupplierForm({ ...editSupplierForm, address: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:border-cyan-400"
                                />
                            </div>

                            <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowEditSupplierModal(false)}
                                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-lg transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-5 py-2 rounded-xl transition shadow-lg shadow-blue-500/20"
                                >
                                    ✓ Simpan Perubahan Supplier
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL TAMBAH AKSESORIS BARU */}
            {showAddAccModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-cyan-400"></span>
                                <h3 className="font-extrabold text-slate-100 text-base">
                                    🔌 Tambah Aksesoris / Hardware Kaca Baru
                                </h3>
                            </div>
                            <button onClick={() => setShowAddAccModal(false)} className="text-slate-400 hover:text-white text-2xl font-bold">&times;</button>
                        </div>

                        <form onSubmit={handleAddAccSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="text-slate-400 block mb-1 font-semibold">Kode Barang (Opsional):</label>
                                <input
                                    type="text"
                                    placeholder="e.g. ACC-007"
                                    value={newAccForm.acc_code}
                                    onChange={e => setNewAccForm({ ...newAccForm, acc_code: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-cyan-300 font-mono font-bold focus:border-cyan-400"
                                />
                            </div>

                            <div>
                                <label className="text-slate-400 block mb-1 font-semibold">Nama Aksesoris Kaca Baru:</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Lem Silikon Bening Glass Sealant"
                                    value={newAccForm.name}
                                    onChange={e => setNewAccForm({ ...newAccForm, name: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-bold focus:border-cyan-400"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-amber-400 block mb-1 font-semibold">Harga Beli Supplier (Rp):</label>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="e.g. 25000"
                                        value={newAccForm.buy_price}
                                        onChange={e => setNewAccForm({ ...newAccForm, buy_price: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-amber-300 font-mono font-bold focus:border-amber-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-emerald-400 block mb-1 font-semibold">Harga Jual Customer (Rp):</label>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="e.g. 45000"
                                        value={newAccForm.sell_price}
                                        onChange={e => setNewAccForm({ ...newAccForm, sell_price: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-emerald-300 font-mono font-bold focus:border-emerald-400"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-slate-400 block mb-1 font-semibold">Stok Awal (Qty):</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={newAccForm.qty}
                                        onChange={e => setNewAccForm({ ...newAccForm, qty: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono font-bold focus:border-cyan-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-slate-400 block mb-1 font-semibold">Satuan Unit:</label>
                                    <select
                                        value={newAccForm.unit}
                                        onChange={e => setNewAccForm({ ...newAccForm, unit: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-medium focus:border-cyan-400"
                                    >
                                        <option value="Pcs">Pcs</option>
                                        <option value="Set">Set</option>
                                        <option value="Pasang">Pasang</option>
                                        <option value="Batang">Batang</option>
                                        <option value="Meter">Meter</option>
                                        <option value="Box">Box</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowAddAccModal(false)}
                                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-lg transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 font-black px-5 py-2 rounded-xl transition shadow-lg shadow-emerald-500/20"
                                >
                                    ✓ Simpan Aksesoris Baru
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL EDIT AKSESORIS */}
            {showEditAccModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-blue-400"></span>
                                <h3 className="font-extrabold text-slate-100 text-base">
                                    ✏️ Edit Data Aksesoris / Hardware
                                </h3>
                            </div>
                            <button onClick={() => setShowEditAccModal(false)} className="text-slate-400 hover:text-white text-2xl font-bold">&times;</button>
                        </div>

                        <form onSubmit={handleEditAccSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="text-slate-400 block mb-1 font-semibold">Kode Barang:</label>
                                <input
                                    type="text"
                                    required
                                    value={editAccForm.acc_code}
                                    onChange={e => setEditAccForm({ ...editAccForm, acc_code: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-cyan-300 font-mono font-bold focus:border-cyan-400"
                                />
                            </div>

                            <div>
                                <label className="text-slate-400 block mb-1 font-semibold">Nama Aksesoris Kaca:</label>
                                <input
                                    type="text"
                                    required
                                    value={editAccForm.name}
                                    onChange={e => setEditAccForm({ ...editAccForm, name: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-bold focus:border-cyan-400"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-amber-400 block mb-1 font-semibold">Harga Beli Supplier (Rp):</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={editAccForm.buy_price}
                                        onChange={e => setEditAccForm({ ...editAccForm, buy_price: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-amber-300 font-mono font-bold focus:border-amber-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-emerald-400 block mb-1 font-semibold">Harga Jual Customer (Rp):</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={editAccForm.sell_price}
                                        onChange={e => setEditAccForm({ ...editAccForm, sell_price: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-emerald-300 font-mono font-bold focus:border-emerald-400"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-slate-400 block mb-1 font-semibold">Stok Quantity:</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={editAccForm.qty}
                                        onChange={e => setEditAccForm({ ...editAccForm, qty: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono font-bold focus:border-cyan-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-slate-400 block mb-1 font-semibold">Satuan Unit:</label>
                                    <select
                                        value={editAccForm.unit}
                                        onChange={e => setEditAccForm({ ...editAccForm, unit: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-medium focus:border-cyan-400"
                                    >
                                        <option value="Pcs">Pcs</option>
                                        <option value="Set">Set</option>
                                        <option value="Pasang">Pasang</option>
                                        <option value="Batang">Batang</option>
                                        <option value="Meter">Meter</option>
                                        <option value="Box">Box</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowEditAccModal(false)}
                                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-lg transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-5 py-2 rounded-xl transition shadow-lg shadow-blue-500/20"
                                >
                                    ✓ Simpan Perubahan Aksesoris
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL RESTOCK AKSESORIS */}
            {showRestockAccModal && selectedAccItem && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-cyan-400"></span>
                                <h3 className="font-extrabold text-slate-100 text-base">
                                    🔄 Restock Aksesoris Masuk
                                </h3>
                            </div>
                            <button onClick={() => setShowRestockAccModal(false)} className="text-slate-400 hover:text-white text-2xl font-bold">&times;</button>
                        </div>

                        <form onSubmit={handleConfirmAccRestock} className="space-y-4 text-xs">
                            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Kode Aksesoris:</span>
                                    <strong className="text-cyan-400 font-mono">{selectedAccItem.acc_code}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Nama Aksesoris:</span>
                                    <strong className="text-slate-200">{selectedAccItem.name}</strong>
                                </div>
                                <div className="flex justify-between border-t border-slate-800 pt-2">
                                    <span className="text-slate-400">Stok saat ini:</span>
                                    <strong className="text-emerald-400 font-mono">{selectedAccItem.qty} {selectedAccItem.unit || 'Pcs'}</strong>
                                </div>
                            </div>

                            <div>
                                <label className="text-slate-400 block mb-1 font-semibold">Jumlah Restock Masuk (+):</label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    value={accRestockQty}
                                    onChange={e => setAccRestockQty(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-cyan-300 font-mono font-bold focus:border-cyan-400"
                                    placeholder="e.g. 10"
                                />
                            </div>

                            <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowRestockAccModal(false)}
                                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-lg transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold px-5 py-2 rounded-lg transition shadow-lg shadow-cyan-500/20"
                                >
                                    ✓ Simpan Restock Aksesoris
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL SETUJUI RESTOCK & ORDER SUPPLIER VIA WHATSAPP */}
            {showSupplierWaModal && selectedWaStockItem && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
                                <h3 className="font-extrabold text-slate-100 text-base">
                                    💬 Setujui Ajuan Restock & Chat Supplier (WhatsApp)
                                </h3>
                            </div>
                            <button onClick={() => setShowSupplierWaModal(false)} className="text-slate-400 hover:text-white text-2xl font-bold">&times;</button>
                        </div>

                        <form onSubmit={handleSendWaOrder} className="space-y-4 text-xs">
                            {/* NOTICE AJUAN GUDANG */}
                            <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl flex items-center gap-2">
                                <span className="text-xl">📩</span>
                                <div>
                                    <div className="font-bold text-rose-300">Pengajuan Masuk Dari Admin Gudang</div>
                                    <div className="text-[11px] text-slate-400">Gudang telah mendeteksi stok bahan kaca ini perlu segera di-restock.</div>
                                </div>
                            </div>

                            {/* ITEM DETAIL */}
                            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Kode Barang:</span>
                                    <strong className="text-cyan-400 font-mono">{selectedWaStockItem.item_code}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Nama Barang:</span>
                                    <strong className="text-slate-200">{selectedWaStockItem.name}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Jenis & Ukuran:</span>
                                    <strong className="text-slate-200 font-mono">{selectedWaStockItem.category} | {selectedWaStockItem.size}</strong>
                                </div>
                                <div className="flex justify-between border-t border-slate-800 pt-2">
                                    <span className="text-slate-400">Sisa Stok di Gudang:</span>
                                    <strong className="text-rose-400 font-mono">{selectedWaStockItem.qty} {selectedWaStockItem.unit || 'Lembar'} (Perlu Restock)</strong>
                                </div>
                            </div>

                            {/* SUPPLIER DETAILS */}
                            <div className="space-y-3">
                                <div className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl flex items-center justify-between text-xs">
                                    <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                                        <span>⚡ Supplier Otomatis Terhubung:</span>
                                    </span>
                                    <span className="font-bold text-slate-100 bg-slate-900 px-2.5 py-1 rounded border border-slate-700">
                                        {selectedWaStockItem.supplier_name}
                                    </span>
                                </div>

                                <div>
                                    <label className="text-slate-400 block mb-1 font-semibold flex items-center justify-between">
                                        <span>Nama Supplier / Distributor Kaca:</span>
                                        <span className="text-[10px] text-cyan-400 font-mono">Pilih atau ubah distributor</span>
                                    </label>
                                    <select
                                        value={supplierName}
                                        onChange={e => {
                                            const name = e.target.value;
                                            setSupplierName(name);
                                            const foundSup = MASTER_SUPPLIERS.find(s => s.name === name);
                                            if (foundSup) setSupplierPhone(foundSup.phone);
                                        }}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-cyan-300 font-bold focus:border-cyan-400"
                                    >
                                        {MASTER_SUPPLIERS.map(sup => (
                                            <option key={sup.id} value={sup.name}>
                                                {sup.name} ({sup.pic})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-slate-400 block mb-1 font-semibold">No. WhatsApp Supplier:</label>
                                        <input
                                            type="text"
                                            required
                                            value={supplierPhone}
                                            onChange={e => setSupplierPhone(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-emerald-400 font-mono font-bold focus:border-cyan-400"
                                            placeholder="6281234567890"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-slate-400 block mb-1 font-semibold">Jumlah Lembar Dipesan (Qty):</label>
                                        <input
                                            type="number"
                                            min="1"
                                            required
                                            value={waOrderQty}
                                            onChange={e => setWaOrderQty(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-cyan-300 font-mono font-bold focus:border-cyan-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* LIVE PREVIEW WHATSAPP MESSAGE */}
                            <div>
                                <label className="text-slate-400 block mb-1 font-semibold flex items-center justify-between">
                                    <span>💬 Draft Pesan WhatsApp Ke Supplier:</span>
                                    <span className="text-[10px] text-emerald-400 font-mono">Auto-generated</span>
                                </label>
                                <div className="bg-[#0b141a] border border-emerald-500/30 p-3 rounded-xl font-mono text-[11px] text-slate-200 whitespace-pre-wrap leading-relaxed">
                                    {`Halo ${supplierName},

Kami dari CV Cahya Karunia Jaya (SYP GLASS OPERATIONAL).
Kami ingin memesan/restock bahan kaca berikut:

• Barang: ${selectedWaStockItem.name} (${selectedWaStockItem.item_code})
• Jenis Kaca: ${selectedWaStockItem.category}
• Ukuran Standard: ${selectedWaStockItem.size}
• Jumlah Pemesanan: ${waOrderQty} Lembar
• Status: Pengajuan Restock Gudang (Disetujui Admin Toko)

Mohon informasi ketersediaan, estimasi waktu pengiriman, dan invoice total harga. Terima kasih!`}
                                </div>
                            </div>

                            {/* ACTION BUTTONS */}
                            <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowSupplierWaModal(false)}
                                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-lg transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold px-5 py-2 rounded-lg transition shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
                                >
                                    📱 Setujui & Buka Chat WhatsApp Supplier →
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL KONFIRMASI PERSETUJUAN DEAL & PENGATURAN DP */}
            {showPromoteModal && targetPromoteOrder && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                                🤝 Persetujuan Deal & Pengaturan DP
                            </h3>
                            <button onClick={() => { setShowPromoteModal(false); setTargetPromoteOrder(null); }} className="text-slate-400 hover:text-white text-2xl font-bold">&times;</button>
                        </div>

                        <form onSubmit={handleConfirmPromote} className="space-y-4 text-xs">
                            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">No. SPO:</span>
                                    <strong className="text-cyan-400 font-mono">{targetPromoteOrder.spo_number}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Customer:</span>
                                    <strong className="text-slate-200">{targetPromoteOrder.customer_name} {targetPromoteOrder.customer_phone ? `(${targetPromoteOrder.customer_phone})` : ''}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Total Tagihan Order:</span>
                                    <strong className="text-slate-100 font-mono text-sm">Rp {Number(targetPromoteOrder.total_price).toLocaleString()}</strong>
                                </div>
                            </div>

                            {/* PILIHAN SKEMA PEMBAYARAN / DP */}
                            <div className="space-y-2">
                                <label className="text-slate-300 font-bold block">Pilih Skema Pembayaran / DP Customer:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setPromotePaymentOption('dp')}
                                        className={`py-2 px-2.5 rounded-lg border font-bold text-xs transition ${promotePaymentOption === 'dp' ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'}`}
                                    >
                                        DP Persentase
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPromotePaymentOption('custom')}
                                        className={`py-2 px-2.5 rounded-lg border font-bold text-xs transition ${promotePaymentOption === 'custom' ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'}`}
                                    >
                                        Nominal Custom
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPromotePaymentOption('lunas')}
                                        className={`py-2 px-2.5 rounded-lg border font-bold text-xs transition ${promotePaymentOption === 'lunas' ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'}`}
                                    >
                                        Lunas (100%)
                                    </button>
                                </div>
                            </div>

                            {/* DETAIL INPUT SESUAI OPSI */}
                            {promotePaymentOption === 'dp' && (
                                <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                                    <label className="text-slate-400 block font-semibold">Pilih Persentase DP:</label>
                                    <div className="flex gap-2">
                                        {[20, 30, 50, 70].map(pct => (
                                            <button
                                                key={pct}
                                                type="button"
                                                onClick={() => setPromoteDpPercent(pct)}
                                                className={`flex-1 py-1.5 rounded-lg border text-xs font-bold font-mono transition ${promoteDpPercent === pct ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'}`}
                                            >
                                                {pct}%
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {promotePaymentOption === 'custom' && (
                                <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                                    <label className="text-slate-400 block font-semibold">Nominal DP Diterima (Rp):</label>
                                    <input
                                        type="number"
                                        step="10000"
                                        min="0"
                                        max={targetPromoteOrder.total_price}
                                        value={promoteCustomPaidAmount}
                                        onChange={e => setPromoteCustomPaidAmount(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-emerald-400 font-mono font-bold text-sm focus:border-emerald-400"
                                        placeholder="Masukkan nominal DP Rupiah"
                                    />
                                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                        <span className="text-[10px] text-slate-400">Preset:</span>
                                        {[
                                            { label: 'Rp 100rb', val: 100000 },
                                            { label: 'Rp 200rb', val: 200000 },
                                            { label: 'Rp 500rb', val: 500000 },
                                            { label: 'Rp 1 Jt', val: 1000000 },
                                            { label: '50%', val: Math.round(targetPromoteOrder.total_price * 0.5) }
                                        ].map((preset, pIdx) => (
                                            <button
                                                key={pIdx}
                                                type="button"
                                                onClick={() => setPromoteCustomPaidAmount(preset.val)}
                                                className="px-2 py-0.5 bg-slate-900 hover:bg-cyan-500/20 hover:text-cyan-300 border border-slate-700 rounded text-[10px] font-mono text-slate-300 transition"
                                            >
                                                {preset.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* RINCIAN PERHITUNGAN */}
                            <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl space-y-1 text-emerald-300">
                                <div className="flex justify-between font-bold">
                                    <span>Nominal DP Diterima:</span>
                                    <span className="font-mono text-sm">
                                        Rp {Number(getPromotePaidAmount()).toLocaleString()}
                                        <span className="text-[11px] ml-1 opacity-80">
                                            ({targetPromoteOrder.total_price > 0 ? Math.round((getPromotePaidAmount() / targetPromoteOrder.total_price) * 100) : 0}%)
                                        </span>
                                    </span>
                                </div>
                                <div className="flex justify-between text-[11px] text-emerald-400/80">
                                    <span>Sisa Tagihan Pelunasan (COD):</span>
                                    <span className="font-mono">Rp {Number(Math.max(0, targetPromoteOrder.total_price - getPromotePaidAmount())).toLocaleString()}</span>
                                </div>
                            </div>

                            <p className="text-[11px] text-slate-400 italic">
                                *Mengubah status draf menjadi <strong>Order Pengerjaan</strong> dan memicu antrean produksi ke Admin Gudang.
                            </p>

                            <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => { setShowPromoteModal(false); setTargetPromoteOrder(null); }}
                                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-lg transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-5 py-2 rounded-lg transition shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
                                >
                                    🚀 Confirm Deal & Kirim ke Gudang
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: TAMBAH PERLENGKAPAN GUDANG BARU */}
            {showAddSupplyModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <h3 className="font-extrabold text-slate-100 text-lg flex items-center gap-2">
                                🧰 Tambah Perlengkapan Gudang Baru
                            </h3>
                            <button onClick={() => setShowAddSupplyModal(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
                        </div>

                        <form onSubmit={handleAddSupplySubmit} className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-slate-400 block mb-1 font-semibold">Kode Barang (Opsional):</label>
                                    <input
                                        type="text"
                                        placeholder="Otomatis jika kosong"
                                        value={newSupplyForm.item_code}
                                        onChange={e => setNewSupplyForm({ ...newSupplyForm, item_code: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-cyan-300 font-mono focus:border-cyan-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-slate-400 block mb-1 font-semibold">Kategori Perlengkapan:</label>
                                    <select
                                        value={newSupplyForm.category}
                                        onChange={e => setNewSupplyForm({ ...newSupplyForm, category: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-cyan-400"
                                    >
                                        <option value="APD & Keselamatan Kerja">APD & Keselamatan Kerja (Sarung Tangan, Kacamata)</option>
                                        <option value="Perkakas Tangan Habis Pakai">Perkakas Tangan Habis Pakai (Cutter, Pisau)</option>
                                        <option value="Peralatan Packaging & Pengiriman">Packaging & Pengiriman (Lakban, Plastik)</option>
                                        <option value="Bahan Kimia & Kebersihan Kaca">Bahan Kimia & Cleaning (Pembersih Kaca, Spiritus)</option>
                                        <option value="Consumables Mesin Potong & Gosok">Consumables Mesin (Amplas, Pad)</option>
                                        <option value="Perawatan Mesin & Pelumas">Pelumas & Maintenance (Oli, Penetran)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-slate-400 block mb-1 font-semibold">Nama Perlengkapan / Barang Habis Pakai:*</label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Sarung Tangan Safety Antigores / Cutter Blade Refill"
                                    value={newSupplyForm.name}
                                    onChange={e => setNewSupplyForm({ ...newSupplyForm, name: e.target.value })}
                                    required
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-cyan-400"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-slate-400 block mb-1 font-semibold">Stok Awal:*</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={newSupplyForm.stock_qty}
                                        onChange={e => setNewSupplyForm({ ...newSupplyForm, stock_qty: e.target.value })}
                                        required
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-cyan-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-slate-400 block mb-1 font-semibold">Min. Stok (Alert):</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={newSupplyForm.min_stock}
                                        onChange={e => setNewSupplyForm({ ...newSupplyForm, min_stock: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-cyan-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-slate-400 block mb-1 font-semibold">Satuan Unit:</label>
                                    <input
                                        type="text"
                                        placeholder="Pcs/Pasang/Roll/Box"
                                        value={newSupplyForm.unit}
                                        onChange={e => setNewSupplyForm({ ...newSupplyForm, unit: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-cyan-400"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-slate-400 block mb-1 font-semibold">Lokasi Simpan di Gudang:</label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Rak APD A1 / Gudang Packaging"
                                    value={newSupplyForm.location}
                                    onChange={e => setNewSupplyForm({ ...newSupplyForm, location: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-cyan-400"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                                <button type="button" onClick={() => setShowAddSupplyModal(false)} className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700">Batal</button>
                                <button type="submit" className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black">✨ Simpan Barang Baru</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: CATAT PEMAKAIAN PERLENGKAPAN OPERASIONAL */}
            {showUseSupplyModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <h3 className="font-extrabold text-slate-100 text-lg flex items-center gap-2">
                                📝 Catat Pemakaian Perlengkapan Operasional
                            </h3>
                            <button onClick={() => setShowUseSupplyModal(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
                        </div>

                        <form onSubmit={handleUseSupplySubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="text-slate-400 block mb-1 font-semibold">Pilih Barang Perlengkapan:*</label>
                                <select
                                    value={useSupplyForm.supply_id}
                                    onChange={e => setUseSupplyForm({ ...useSupplyForm, supply_id: e.target.value })}
                                    required
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-cyan-400"
                                >
                                    <option value="">-- Pilih Barang Perlengkapan --</option>
                                    {warehouseSuppliesList.map(s => (
                                        <option key={s.id} value={s.id} disabled={s.stock_qty <= 0}>
                                            [{s.item_code}] {s.name} (Sisa Stok: {s.stock_qty} {s.unit})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-slate-400 block mb-1 font-semibold">Jumlah Dipakai:*</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={useSupplyForm.used_qty}
                                        onChange={e => setUseSupplyForm({ ...useSupplyForm, used_qty: e.target.value })}
                                        required
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-cyan-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-slate-400 block mb-1 font-semibold">Tanggal Pemakaian:</label>
                                    <input
                                        type="date"
                                        value={useSupplyForm.usage_date}
                                        onChange={e => setUseSupplyForm({ ...useSupplyForm, usage_date: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-cyan-400"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-slate-400 block mb-1 font-semibold">Divisi Pengambil:*</label>
                                    <select
                                        value={useSupplyForm.user_division}
                                        onChange={e => setUseSupplyForm({ ...useSupplyForm, user_division: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-cyan-400"
                                    >
                                        <option value="Divisi Potong (HT)">Divisi Potong (HT)</option>
                                        <option value="Divisi Gosok (GM)">Divisi Gosok (GM)</option>
                                        <option value="Divisi Bevel (BV)">Divisi Bevel (BV)</option>
                                        <option value="Divisi Etsa">Divisi Etsa</option>
                                        <option value="Admin Gudang / Pengiriman">Admin Gudang & Pengiriman</option>
                                        <option value="Teknisi Lapangan">Teknisi Lapangan</option>
                                        <option value="Umum & Maintenance">Umum & Maintenance</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-slate-400 block mb-1 font-semibold">Nama Pengambil/Pekerja:*</label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: Supri / Bambang"
                                        value={useSupplyForm.taker_name}
                                        onChange={e => setUseSupplyForm({ ...useSupplyForm, taker_name: e.target.value })}
                                        required
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-cyan-400"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-slate-400 block mb-1 font-semibold">Catatan / Keperluan Pemakaian:</label>
                                <textarea
                                    rows="2"
                                    placeholder="Contoh: Penggantian APD bulanan / packing peti kayu SPO-0129"
                                    value={useSupplyForm.notes}
                                    onChange={e => setUseSupplyForm({ ...useSupplyForm, notes: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-cyan-400"
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                                <button type="button" onClick={() => setShowUseSupplyModal(false)} className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700">Batal</button>
                                <button type="submit" className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black">✓ Simpan Log Pemakaian</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: PENGAJUAN RESTOK PERLENGKAPAN GUDANG KE ADMIN TOKO */}
            {showRequestRestockModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <h3 className="font-extrabold text-amber-400 text-lg flex items-center gap-2">
                                📩 Form Pengajuan Restok Perlengkapan ke Admin Toko
                            </h3>
                            <button onClick={() => setShowRequestRestockModal(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
                        </div>

                        <form onSubmit={handleRequestRestockSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="text-slate-300 block mb-1 font-bold">Pilih Barang Perlengkapan:*</label>
                                <select
                                    value={requestRestockForm.supply_id}
                                    onChange={e => setRequestRestockForm({ ...requestRestockForm, supply_id: e.target.value })}
                                    required
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-amber-400"
                                >
                                    <option value="">-- Pilih Barang Perlengkapan --</option>
                                    {warehouseSuppliesList.map(s => (
                                        <option key={s.id} value={s.id}>
                                            [{s.item_code}] {s.name} (Sisa Stok: {s.stock_qty} {s.unit} - Status: {s.status})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-slate-300 block mb-1 font-bold">Jumlah Pengajuan Restok:*</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={requestRestockForm.request_qty}
                                        onChange={e => setRequestRestockForm({ ...requestRestockForm, request_qty: e.target.value })}
                                        required
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-amber-300 font-extrabold focus:border-amber-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-slate-300 block mb-1 font-bold">Tingkat Prioritas:</label>
                                    <select
                                        value={requestRestockForm.priority}
                                        onChange={e => setRequestRestockForm({ ...requestRestockForm, priority: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-amber-400"
                                    >
                                        <option value="Biasa">Biasa (Persediaan Rutin)</option>
                                        <option value="Mendesak / Stok Menipis">Mendesak / Stok Menipis</option>
                                        <option value="Mendesak / Stok Habis">🚨 CRITICAL: Stok Sudah Habis!</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-slate-300 block mb-1 font-bold">Catatan & Alasan Pengajuan ke Admin Toko:</label>
                                <textarea
                                    rows="3"
                                    placeholder="Contoh: Stok sisa 6 galon di gudang B1, dibutuhkan untuk pengerjaan finishing beveling proyek minggu depan."
                                    value={requestRestockForm.notes}
                                    onChange={e => setRequestRestockForm({ ...requestRestockForm, notes: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-amber-400"
                                ></textarea>
                            </div>

                            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
                                <span className="text-cyan-400 font-bold block">💡 Info Pengajuan Restok:</span>
                                <p>Pengajuan akan dikirim ke dashboard Admin Toko & tersedia tombol pintas WhatsApp pesan otomatis ke Admin Toko / Purchasing.</p>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                                <button type="button" onClick={() => setShowRequestRestockModal(false)} className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700">Batal</button>
                                <button type="submit" className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black flex items-center gap-1.5 shadow-lg shadow-amber-500/20">
                                    <span>🚀</span> Kirim Pengajuan (+ Kirim WA)
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: TAMBAH ALAT PENUNJANG BARU */}
            {showAddToolModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <h3 className="font-extrabold text-slate-100 text-lg flex items-center gap-2">
                                🛠️ Form Tambah Alat Penunjang / Mesin Baru
                            </h3>
                            <button onClick={() => setShowAddToolModal(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
                        </div>

                        <form onSubmit={handleAddToolSubmit} className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-slate-400 block mb-1 font-semibold">Kode Alat (Opsional):</label>
                                    <input
                                        type="text"
                                        placeholder="Otomatis jika kosong"
                                        value={newToolForm.tool_code}
                                        onChange={e => setNewToolForm({ ...newToolForm, tool_code: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-cyan-300 font-mono focus:border-cyan-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-slate-400 block mb-1 font-semibold">Kategori Alat / Mesin:</label>
                                    <select
                                        value={newToolForm.category}
                                        onChange={e => setNewToolForm({ ...newToolForm, category: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-cyan-400"
                                    >
                                        <option value="Mesin Bor & Potong">Mesin Bor & Potong (Kaca/Mesin)</option>
                                        <option value="Mata Bor & Mata Potong">Mata Bor & Mata Potong Diamond</option>
                                        <option value="Mesin & Alat Vakum">Mesin Suction Cup & Vakum Kaca</option>
                                        <option value="Handtool & Kunci">Handtool, Obeng & Kunci L</option>
                                        <option value="Peralatan Lapangan">Peralatan Lapangan (Tangga, dsb)</option>
                                        <option value="Peralatan Umum & Kebersihan">Peralatan Umum & Kebersihan (Cangkul, Rumput)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-slate-400 block mb-1 font-semibold">Nama Alat / Mesin Penunjang:*</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Mesin Bor Kaca Portable / Tangga Alumunium 4m"
                                    value={newToolForm.name}
                                    onChange={e => setNewToolForm({ ...newToolForm, name: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-bold focus:border-cyan-400"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-slate-400 block mb-1 font-semibold">Total Jumlah Unit:*</label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={newToolForm.total_qty}
                                        onChange={e => setNewToolForm({ ...newToolForm, total_qty: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-emerald-400 font-mono font-bold focus:border-cyan-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-slate-400 block mb-1 font-semibold">Satuan Unit:</label>
                                    <input
                                        type="text"
                                        value={newToolForm.unit}
                                        onChange={e => setNewToolForm({ ...newToolForm, unit: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-cyan-400"
                                        placeholder="Unit / Set / Pcs"
                                    />
                                </div>
                                <div>
                                    <label className="text-slate-400 block mb-1 font-semibold">Kondisi Alat:</label>
                                    <select
                                        value={newToolForm.condition}
                                        onChange={e => setNewToolForm({ ...newToolForm, condition: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-cyan-400"
                                    >
                                        <option value="Bagus">Bagus & Ready</option>
                                        <option value="Perlu Maintenance">Perlu Maintenance</option>
                                        <option value="Rusak">Rusak (Butuh Servis)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-slate-400 block mb-1 font-semibold">Lokasi Penyimpanan / Rak Storage:</label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Rak Alat A1 / Gudang Belakang"
                                    value={newToolForm.location}
                                    onChange={e => setNewToolForm({ ...newToolForm, location: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-cyan-400"
                                />
                            </div>

                            <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                                <button type="button" onClick={() => setShowAddToolModal(false)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-lg transition">Batal</button>
                                <button type="submit" className="bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 font-black px-5 py-2 rounded-lg transition shadow-lg">✨ Simpan Alat Ke Catalog</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: CATAT PEMINJAMAN ALAT TEKNISI (MULTI-ITEM TOOL BORROWING) */}
            {showBorrowToolModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col overflow-y-auto">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <h3 className="font-extrabold text-slate-100 text-lg flex items-center gap-2">
                                📋 Form Pencatatan Peminjaman Alat Oleh Admin
                            </h3>
                            <button onClick={() => setShowBorrowToolModal(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
                        </div>

                        <form onSubmit={handleBorrowToolSubmit} className="space-y-4 text-xs">
                            {/* DYNAMIC MULTI-TOOL SELECTION ROWS */}
                            <div className="space-y-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                    <label className="text-slate-200 font-extrabold text-xs flex items-center gap-1.5">
                                        🛠️ Daftar Alat / Mesin Yang Dipinjam ({borrowToolForm.selected_items.length} Alat):
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleAddBorrowItemRow}
                                        className="bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 border border-cyan-500/40 px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow"
                                    >
                                        ➕ Tambah Alat Lain
                                    </button>
                                </div>

                                {borrowToolForm.selected_items.map((item, idx) => (
                                    <div key={idx} className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                                        <span className="font-mono text-xs text-cyan-400 font-bold px-1">#{idx + 1}</span>
                                        <div className="flex-1 min-w-[200px]">
                                            <select
                                                required
                                                value={item.tool_id}
                                                onChange={e => handleBorrowItemChange(idx, 'tool_id', e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-cyan-300 font-bold focus:border-cyan-400 text-xs"
                                            >
                                                <option value="">-- Pilih Alat Dari Inventory --</option>
                                                {toolsList.map(t => (
                                                    <option key={t.id} value={t.id} disabled={t.available_qty <= 0}>
                                                        {t.tool_code} - {t.name} (Tersedia: {t.available_qty} {t.unit})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="w-28">
                                            <input
                                                type="number"
                                                min="1"
                                                required
                                                value={item.qty}
                                                onChange={e => handleBorrowItemChange(idx, 'qty', e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-amber-400 font-mono font-bold focus:border-cyan-400 text-xs text-center"
                                                placeholder="Qty Unit"
                                            />
                                        </div>
                                        {borrowToolForm.selected_items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveBorrowItemRow(idx)}
                                                className="bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white px-2.5 py-2 rounded-lg text-xs font-bold transition"
                                                title="Hapus item ini"
                                            >
                                                🗑️
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div>
                                <label className="text-slate-400 block mb-1 font-semibold">Nama Peminjam / Teknisi:*</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Teknisi Asep / Pak Mulyadi"
                                    value={borrowToolForm.borrower_name}
                                    onChange={e => setBorrowToolForm({ ...borrowToolForm, borrower_name: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-bold focus:border-cyan-400"
                                />
                            </div>

                            <div>
                                <label className="text-slate-400 block mb-1 font-semibold">Keperluan Pekerjaan / Project:*</label>
                                <textarea
                                    required
                                    rows="2"
                                    placeholder="Contoh: Pengeboran engsel sekat kaca tempered SPO-0129 Dago Pakar"
                                    value={borrowToolForm.purpose}
                                    onChange={e => setBorrowToolForm({ ...borrowToolForm, purpose: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-cyan-400"
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-slate-400 block mb-1 font-semibold">Tanggal Pinjam:</label>
                                    <input
                                        type="date"
                                        value={borrowToolForm.borrow_date}
                                        onChange={e => setBorrowToolForm({ ...borrowToolForm, borrow_date: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono focus:border-cyan-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-slate-400 block mb-1 font-semibold">Estimasi Tanggal Kembali:</label>
                                    <input
                                        type="date"
                                        value={borrowToolForm.expected_return}
                                        onChange={e => setBorrowToolForm({ ...borrowToolForm, expected_return: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono focus:border-cyan-400"
                                    />
                                </div>
                            </div>

                            <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                                <button type="button" onClick={() => setShowBorrowToolModal(false)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-lg transition">Batal</button>
                                <button type="submit" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black px-5 py-2 rounded-lg transition shadow-lg">📋 Catat Peminjaman Alat</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL KONFIRMASI / EDIT PENGEMBALIAN ALAT */}
            {showReturnToolModal && selectedReturnBorrow && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
                                ↩️ Konfirmasi & Edit Tanggal Pengembalian Alat
                            </h3>
                            <button onClick={() => setShowReturnToolModal(false)} className="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
                        </div>

                        <form onSubmit={handleConfirmReturnSubmit} className="space-y-4">
                            {/* BORROWER INFO SUMMARY */}
                            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 font-semibold">Peminjam / Teknisi:</span>
                                    <span className="font-extrabold text-cyan-300">👨‍🔧 {selectedReturnBorrow.borrower_name}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 font-semibold">Keperluan / Proyek:</span>
                                    <span className="text-slate-200">📝 {selectedReturnBorrow.purpose}</span>
                                </div>
                                <div className="flex justify-between items-center border-t border-slate-800/60 pt-1.5">
                                    <span className="text-slate-400">Tanggal Dipinjam:</span>
                                    <span className="font-mono text-amber-400 font-bold">{selectedReturnBorrow.borrow_date}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Estimasi Rencana Kembali:</span>
                                    <span className="font-mono text-cyan-400 font-bold">{selectedReturnBorrow.expected_return}</span>
                                </div>

                                {/* ITEMS LIST */}
                                <div className="border-t border-slate-800/60 pt-2 space-y-1">
                                    <span className="text-slate-400 block font-semibold text-[11px]">Daftar Alat Dipinjam:</span>
                                    {Array.isArray(selectedReturnBorrow.items) && selectedReturnBorrow.items.length > 0 ? (
                                        selectedReturnBorrow.items.map((it, idx) => (
                                            <div key={idx} className="bg-slate-900 px-2 py-1 rounded border border-slate-800 flex justify-between text-[11px]">
                                                <span className="text-slate-200 font-bold">{it.tool_name} ({it.tool_code})</span>
                                                <span className="text-amber-400 font-mono font-bold">{it.qty} {it.unit}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="bg-slate-900 px-2 py-1 rounded border border-slate-800 flex justify-between text-[11px]">
                                            <span className="text-slate-200 font-bold">{selectedReturnBorrow.tool_name}</span>
                                            <span className="text-amber-400 font-mono font-bold">{selectedReturnBorrow.qty_borrowed} Unit</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* EDITABLE ACTUAL RETURN DATE INPUT */}
                            <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 space-y-2">
                                <label className="text-xs font-extrabold text-emerald-400 block flex justify-between items-center">
                                    <span>📅 Tanggal Pengembalian Sebenarnya:</span>
                                    <span className="text-[10px] text-slate-400 font-normal">(Bisa diedit lebih cepat/lebih lama)</span>
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={actualReturnDate}
                                    onChange={e => setActualReturnDate(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono font-bold focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                                />

                                {/* DYNAMIC TIME DIFFERENCE BADGE */}
                                {actualReturnDate && selectedReturnBorrow.expected_return && (
                                    <div className="text-[11px] font-mono pt-1">
                                        {actualReturnDate > selectedReturnBorrow.expected_return ? (
                                            <span className="text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20 font-bold block">
                                                ⚠️ Pengembalian Lebih Lama / Terlambat dari estimasi ({selectedReturnBorrow.expected_return})
                                            </span>
                                        ) : actualReturnDate < selectedReturnBorrow.expected_return ? (
                                            <span className="text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20 font-bold block">
                                                ⚡ Pengembalian Lebih Cepat dari estimasi ({selectedReturnBorrow.expected_return})
                                            </span>
                                        ) : (
                                            <span className="text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 font-bold block">
                                                ✅ Tepat Waktu Sesuai Estimasi ({selectedReturnBorrow.expected_return})
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* LAPORAN KONDISI / KEHILANGAN SAAT PENGEMBALIAN */}
                            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                                <label className="text-xs font-bold text-slate-300 block">
                                    ⚙️ Status Kondisi Fisik Alat Saat Dikembalikan:
                                </label>
                                <select
                                    value={returnConditionStatus}
                                    onChange={e => setReturnConditionStatus(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 font-bold focus:border-cyan-400"
                                >
                                    <option value="Baik">✅ Dikembalikan Dalam Kondisi Baik & Lengkap</option>
                                    <option value="Ada Rusak">⚠️ Ada Unit Yang Rusak (Perlu Perbaikan / Patah)</option>
                                    <option value="Ada Hilang">❌ Ada Unit Yang Hilang / Tertinggal</option>
                                </select>

                                {returnConditionStatus === 'Ada Rusak' && (
                                    <div className="pt-2 grid grid-cols-2 gap-3 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                                        <div>
                                            <label className="text-[11px] text-amber-300 font-bold block mb-1">Jumlah Unit Rusak:</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={returnDamagedQty}
                                                onChange={e => setReturnDamagedQty(e.target.value)}
                                                className="w-full bg-slate-950 border border-amber-500/40 rounded p-1.5 text-xs text-amber-300 font-mono font-bold"
                                            />
                                        </div>
                                        <div className="text-[10px] text-slate-400 self-center">
                                            ⚠️ Stok alat di katalog akan otomatis bertambah pada kategori <b className="text-amber-300">Rusak/Servis</b>.
                                        </div>
                                    </div>
                                )}

                                {returnConditionStatus === 'Ada Hilang' && (
                                    <div className="pt-2 grid grid-cols-2 gap-3 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
                                        <div>
                                            <label className="text-[11px] text-rose-300 font-bold block mb-1">Jumlah Unit Hilang:</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={returnLostQty}
                                                onChange={e => setReturnLostQty(e.target.value)}
                                                className="w-full bg-slate-950 border border-rose-500/40 rounded p-1.5 text-xs text-rose-300 font-mono font-bold"
                                            />
                                        </div>
                                        <div className="text-[10px] text-slate-400 self-center">
                                            ❌ Stok alat di katalog akan otomatis bertambah pada kategori <b className="text-rose-300">Hilang</b>.
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* OPTIONAL NOTES */}
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Catatan Pengembalian / Kondisi Alat (Opsional):</label>
                                <input
                                    type="text"
                                    value={returnNotes}
                                    onChange={e => setReturnNotes(e.target.value)}
                                    placeholder="Contoh: Alat dikembalikan dalam kondisi lengkap & bersih."
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:border-cyan-400"
                                />
                            </div>

                            {/* MODAL ACTIONS */}
                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowReturnToolModal(false)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-xs font-semibold transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 font-extrabold text-slate-950 rounded-lg text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition"
                                >
                                    ✓ Konfirmasi & Simpan Pengembalian
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL UPDATE KONDISI & LAPORKAN RUSAK/HILANG (KATALOG) */}
            {showEditToolModal && selectedToolForEdit && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <div>
                                <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
                                    ⚙️ Update Kondisi & Stok Alat ({selectedToolForEdit.tool_code})
                                </h3>
                                <p className="text-xs text-slate-400">{selectedToolForEdit.name}</p>
                            </div>
                            <button onClick={() => setShowEditToolModal(false)} className="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
                        </div>

                        <form onSubmit={handleSaveToolEditSubmit} className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                                <div>
                                    <label className="text-slate-400 font-semibold block mb-1">Total Unit Dimiliki:</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={toolEditForm.total_qty}
                                        onChange={e => setToolEditForm({ ...toolEditForm, total_qty: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono font-bold focus:border-cyan-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-slate-400 font-semibold block mb-1">Status Utama Alat:</label>
                                    <select
                                        value={toolEditForm.condition}
                                        onChange={e => setToolEditForm({ ...toolEditForm, condition: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-bold focus:border-cyan-400"
                                    >
                                        <option value="Bagus">✅ Bagus (100% Layak Operasional)</option>
                                        <option value="Rusak Ringan">⚠️ Rusak Ringan (Perlu Servis Kecil)</option>
                                        <option value="Rusak Berat">❌ Rusak Berat (Tidak Bisa Digunakan)</option>
                                        <option value="Hilang">❗ Hilang (Unit Rusak/Hilang Total)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                                <div>
                                    <label className="text-amber-400 font-bold block mb-1">Jumlah Unit Rusak (Perlu Servis):</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={toolEditForm.damaged_qty}
                                        onChange={e => setToolEditForm({ ...toolEditForm, damaged_qty: e.target.value })}
                                        className="w-full bg-slate-900 border border-amber-500/40 rounded-lg p-2 text-amber-300 font-mono font-bold focus:border-amber-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-rose-400 font-bold block mb-1">Jumlah Unit Hilang:</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={toolEditForm.lost_qty}
                                        onChange={e => setToolEditForm({ ...toolEditForm, lost_qty: e.target.value })}
                                        className="w-full bg-slate-900 border border-rose-500/40 rounded-lg p-2 text-rose-300 font-mono font-bold focus:border-rose-400"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-slate-300 font-semibold block mb-1">Catatan Perbaikan / Kronologi Kerusakan / Hilang:</label>
                                <textarea
                                    rows="2"
                                    placeholder="Contoh: 1 unit mata bor diamond patah saat pengerjaan sekat kaca tempered SPO-0129 Dago."
                                    value={toolEditForm.condition_notes}
                                    onChange={e => setToolEditForm({ ...toolEditForm, condition_notes: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:border-cyan-400"
                                ></textarea>
                            </div>

                            <div>
                                <label className="text-slate-300 font-semibold block mb-1">Lokasi Penyimpanan Alat:</label>
                                <input
                                    type="text"
                                    value={toolEditForm.location}
                                    onChange={e => setToolEditForm({ ...toolEditForm, location: e.target.value })}
                                    placeholder="Contoh: Rak Alat A1 / Gudang Belakang"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:border-cyan-400 font-mono"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowEditToolModal(false)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-xs font-semibold transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-extrabold text-slate-950 rounded-lg text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition"
                                >
                                    ✓ Simpan Perubahan Kondisi Alat
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL FORM DETAIL PERBAIKAN SELESAI / EDIT DETAIL PERBAIKAN */}
            {showCompleteRepairModal && selectedRepairTool && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <div>
                                <h3 className="font-extrabold text-base text-emerald-400 flex items-center gap-2">
                                    🔧 Form Detail Perbaikan Selesai ({selectedRepairTool.tool_code})
                                </h3>
                                <p className="text-xs text-slate-400">{selectedRepairTool.name}</p>
                            </div>
                            <button onClick={() => setShowCompleteRepairModal(false)} className="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
                        </div>

                        <form onSubmit={handleSaveCompleteRepairSubmit} className="space-y-4 text-xs">
                            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-3">
                                <div>
                                    <label className="text-amber-400 font-extrabold block mb-1">📌 Bagian Mesin / Alat Yang Rusak:</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Contoh: Mata bor diamond retak & motor carbon brush aus"
                                        value={repairForm.damaged_part}
                                        onChange={e => setRepairForm({ ...repairForm, damaged_part: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-semibold focus:border-emerald-400"
                                    />
                                </div>

                                <div>
                                    <label className="text-cyan-400 font-extrabold block mb-1">🛠️ Tindakan Perbaikan Yang Dilakukan:</label>
                                    <textarea
                                        rows="2"
                                        required
                                        placeholder="Contoh: Pembersihan motor rotor, penyetelan presisi & penggantian sparepart aus"
                                        value={repairForm.action_taken}
                                        onChange={e => setRepairForm({ ...repairForm, action_taken: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-medium focus:border-emerald-400"
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="text-teal-300 font-extrabold block mb-1">🔩 Komponen / Sparepart Yang Diganti (Opsional):</label>
                                    <textarea
                                        rows="2"
                                        placeholder="Contoh: Carbon Brush Heavy Duty 2 pcs, Bearing SKF 608 1 pc"
                                        value={repairForm.replaced_components}
                                        onChange={e => setRepairForm({ ...repairForm, replaced_components: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-medium focus:border-emerald-400"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                                <div>
                                    <label className="text-slate-300 font-bold block mb-1">💵 Biaya Servis / Sparepart (Rp):</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 75000"
                                        value={repairForm.repair_cost}
                                        onChange={e => setRepairForm({ ...repairForm, repair_cost: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-amber-300 font-mono font-bold focus:border-emerald-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-slate-300 font-bold block mb-1">📅 Tanggal Selesai:</label>
                                    <input
                                        type="date"
                                        required
                                        value={repairForm.completion_date}
                                        onChange={e => setRepairForm({ ...repairForm, completion_date: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono font-bold focus:border-emerald-400"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-slate-300 font-bold block mb-1">👨‍🔧 Teknisi / Tempat Perbaikan (Servis):</label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Bengkel Teknik Maju / Servis Internal Toko"
                                    value={repairForm.technician_name}
                                    onChange={e => setRepairForm({ ...repairForm, technician_name: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 font-semibold focus:border-emerald-400"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowCompleteRepairModal(false)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-xs font-semibold transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 font-extrabold text-slate-950 rounded-lg text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition"
                                >
                                    ✓ Simpan Detail Perbaikan & Kembalikan Ke Stok
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL POPUP DETAIL EKSEKUSI PENGERJAAN ORDER (PREMIUM REDESIGN) */}
            <DivisionExecutionModal
                show={showExecutionModal}
                onClose={() => { setShowExecutionModal(false); setSelectedExecutionOrder(null); }}
                selectedExecutionOrder={selectedExecutionOrder}
                roleTitles={roleTitles}
                userRole={userRole}
                productionSubTab={productionSubTab}
                isDivisionWorker={isDivisionWorker}
                onAcknowledgeRevision={handleAcknowledgeRevision}
                onOpenComplaintModal={handleOpenComplaintModal}
                onOpenScrapPopup={handleOpenScrapPopup}
                onFinishJobSubmit={handleFinishJobSubmit}
                formatIndonesianDate={formatIndonesianDate}
                formatIndonesianDateTime={formatIndonesianDateTime}
                onOpenSketchLightbox={handleOpenSketchLightbox}
                sheetGlasses={sheetGlasses}
                scrapGlasses={initialScrap}
                onRecordRawMaterialSuccess={handleRecordRawMaterialSuccess}
                onOpenStickerModal={handleOpenStickerModal}
            />

            {/* MODAL POPUP FORM SISA UNTUK POTONG (INPUT SCRAP GLASS - REDESIGN) */}
            <ScrapPopupModal
                show={showScrapPopupModal}
                onClose={() => setShowScrapPopupModal(false)}
                form={scrapPopupForm}
                setForm={setScrapPopupForm}
                onSubmit={handleSaveScrapFromPopup}
            />

            {/* MODAL POPUP LAPORKAN KACA CACAT / BARET */}
            <ComplaintModal
                show={showComplaintModal}
                onClose={() => setShowComplaintModal(false)}
                form={complaintForm}
                setForm={setComplaintForm}
                onSubmit={handleSubmitComplaint}
                onPhotoChange={handleComplaintPhotoChange}
                selectedExecutionOrder={selectedExecutionOrder}
                userRole={userRole}
            />

            {/* MODAL REKAP RINCIAN PEMILAHAN ORDERAN (MASUK & SELESAI) */}
            {showRekapModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
                    <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl p-5 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        {/* MODAL HEADER */}
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">📊</span>
                                <div>
                                    <h3 className="text-sm font-black text-slate-100 uppercase tracking-wide">
                                        Rekapitulasi Pemilihan Orderan Masuk & Selesai
                                    </h3>
                                    <p className="text-[11px] text-slate-400 font-mono">
                                        Divisi: <strong className="text-cyan-300">{isDivisionWorker ? userRole.replace('divisi_', '').toUpperCase() : 'SEMUA DIVISI'}</strong>
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowRekapModal(false)}
                                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center text-sm cursor-pointer transition"
                            >
                                ✕
                            </button>
                        </div>

                        {/* RENTANG WAKTU SELECTOR BUTTONS */}
                        <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                            <span className="text-xs font-mono font-bold text-slate-400 pl-1">Filter Rentang Waktu:</span>
                            {[
                                { key: 'today', label: '📅 Hari Ini' },
                                { key: '2days', label: '📆 2 Hari' },
                                { key: 'week', label: '🗓️ 1 Minggu' },
                                { key: 'month', label: '📊 1 Bulan' },
                                { key: 'year', label: '🗓️ 1 Tahun' },
                                { key: 'all', label: '🌐 Semua Waktu' }
                            ].map(item => (
                                <button
                                    key={item.key}
                                    type="button"
                                    onClick={() => setStatTimeRange(item.key)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                                        statTimeRange === item.key
                                            ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        {/* STAT SUMMARY CARDS */}
                        {(() => {
                            const curKey = isDivisionWorker ? userRole.replace('divisi_', '').toUpperCase() : 'HT';

                            const enteredList = initialOrders.filter(o => {
                                const ts = (o.division_timestamps && o.division_timestamps[curKey]) ? o.division_timestamps[curKey] : {};
                                const dateToCheck = ts.started_at || ts.created_at || o.created_at || o.order_date;
                                const matchDiv = isDivisionWorker ? (o.current_division === userRole || (o.division_progress?.[curKey] && o.division_progress?.[curKey] !== 'N/A' && o.division_progress?.[curKey] !== 'Belum')) : true;
                                return matchDiv && isDateInTimeRange(dateToCheck, statTimeRange);
                            });

                            const completedList = initialOrders.filter(o => {
                                const ts = (o.division_timestamps && o.division_timestamps[curKey]) ? o.division_timestamps[curKey] : {};
                                const dateToCheck = ts.completed_at || o.execution_completed_at;
                                const matchDiv = (o.division_progress && o.division_progress[curKey] === 'Selesai');
                                return matchDiv && isDateInTimeRange(dateToCheck, statTimeRange);
                            });

                            const completionRate = enteredList.length > 0 ? Math.round((completedList.length / enteredList.length) * 100) : (completedList.length > 0 ? 100 : 0);

                            // Group by date YYYY-MM-DD
                            const dateGroupMap = {};
                            enteredList.forEach(o => {
                                const ts = (o.division_timestamps && o.division_timestamps[curKey]) ? o.division_timestamps[curKey] : {};
                                const dStr = (ts.started_at || ts.created_at || o.created_at || o.order_date || '').split('T')[0].split(' ')[0];
                                if (dStr) {
                                    if (!dateGroupMap[dStr]) dateGroupMap[dStr] = { date: dStr, entered: [], completed: [] };
                                    dateGroupMap[dStr].entered.push(o);
                                }
                            });
                            completedList.forEach(o => {
                                const ts = (o.division_timestamps && o.division_timestamps[curKey]) ? o.division_timestamps[curKey] : {};
                                const dStr = (ts.completed_at || o.execution_completed_at || '').split('T')[0].split(' ')[0];
                                if (dStr) {
                                    if (!dateGroupMap[dStr]) dateGroupMap[dStr] = { date: dStr, entered: [], completed: [] };
                                    if (!dateGroupMap[dStr].completed.some(item => item.id === o.id)) {
                                        dateGroupMap[dStr].completed.push(o);
                                    }
                                }
                            });

                            const sortedDates = Object.keys(dateGroupMap).sort().reverse();

                            return (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="bg-slate-950 p-3.5 rounded-xl border border-cyan-500/30 text-center space-y-1">
                                            <span className="text-[11px] font-mono text-cyan-400 font-bold block">📥 Total Order Masuk</span>
                                            <span className="text-2xl font-mono font-black text-cyan-300">{enteredList.length} Order</span>
                                        </div>
                                        <div className="bg-slate-950 p-3.5 rounded-xl border border-emerald-500/30 text-center space-y-1">
                                            <span className="text-[11px] font-mono text-emerald-400 font-bold block">✅ Total Order Selesai</span>
                                            <span className="text-2xl font-mono font-black text-emerald-300">{completedList.length} Order</span>
                                        </div>
                                        <div className="bg-slate-950 p-3.5 rounded-xl border border-amber-500/30 text-center space-y-1">
                                            <span className="text-[11px] font-mono text-amber-400 font-bold block">📈 Persentase Selesai</span>
                                            <span className="text-2xl font-mono font-black text-amber-300">{completionRate}%</span>
                                        </div>
                                    </div>

                                    {/* TABLE RINCIAN PER HARI */}
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-bold text-slate-300 font-mono flex items-center justify-between">
                                            <span>📅 Rincian Pemilihan Per-Hari ({sortedDates.length} Hari Terdeteksi):</span>
                                            <span className="text-[10px] text-slate-500">Menampilkan tanggal dengan transaksi order</span>
                                        </h4>

                                        {sortedDates.length > 0 ? (
                                            <div className="border border-slate-800 rounded-xl overflow-hidden">
                                                <table className="w-full text-left text-xs font-mono">
                                                    <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                                                        <tr>
                                                            <th className="p-2.5">Tanggal</th>
                                                            <th className="p-2.5">📥 Order Masuk</th>
                                                            <th className="p-2.5">✅ Order Selesai</th>
                                                            <th className="p-2.5 text-right">Daftar SPO</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                                                        {sortedDates.map(dStr => {
                                                            const group = dateGroupMap[dStr];
                                                            return (
                                                                <tr key={dStr} className="hover:bg-slate-800/50">
                                                                    <td className="p-2.5 font-bold text-amber-300">{formatIndonesianDate(dStr)}</td>
                                                                    <td className="p-2.5">
                                                                        <span className="bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30 font-extrabold">
                                                                            {group.entered.length} Order
                                                                        </span>
                                                                    </td>
                                                                    <td className="p-2.5">
                                                                        <span className="bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-extrabold">
                                                                            {group.completed.length} Order
                                                                        </span>
                                                                    </td>
                                                                    <td className="p-2.5 text-right">
                                                                        <div className="flex flex-wrap items-center justify-end gap-1">
                                                                            {group.entered.map(o => (
                                                                                <span key={'e_' + o.id} className="text-[9px] bg-slate-950 text-cyan-400 border border-slate-800 px-1.5 py-0.5 rounded">
                                                                                    #{o.spo_number}
                                                                                </span>
                                                                            ))}
                                                                            {group.completed.map(o => (
                                                                                <span key={'c_' + o.id} className="text-[9px] bg-slate-950 text-emerald-400 border border-slate-800 px-1.5 py-0.5 rounded">
                                                                                    ✓ #{o.spo_number}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center text-xs text-slate-500 font-mono">
                                                Tidak ada data orderan masuk atau selesai pada rentang waktu ini.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}

                        <div className="flex justify-end pt-2 border-t border-slate-800">
                            <button
                                type="button"
                                onClick={() => setShowRekapModal(false)}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer transition"
                            >
                                Tutup Rekap
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DECISION ADMIN GUDANG UNTUK KOMPLAIN KACA */}
            <GudangDecisionModal
                show={showGudangDecisionModal}
                onClose={() => { setShowGudangDecisionModal(false); setSelectedComplaintOrder(null); }}
                selectedComplaintOrder={selectedComplaintOrder}
                onResolveComplaint={handleResolveComplaint}
            />

            {/* MODAL SURAT JALAN / WAYBILL PRINT (4-COLOR COPY) */}
            <WaybillModal
                show={showWaybillModal}
                onClose={() => { setShowWaybillModal(false); setSelectedWaybillOrder(null); }}
                selectedWaybillOrder={selectedWaybillOrder}
                order={selectedWaybillOrder}
                userName={userName}
                onOpenStickerModal={handleOpenStickerModal}
            />

            {/* MODAL PRINT STIKER LABEL ORDERAN KACA (ADMIN GUDANG & DIVISI) */}
            <GlassStickerModal
                show={showStickerModal}
                onClose={() => { setShowStickerModal(false); setSelectedStickerOrder(null); }}
                selectedOrder={selectedStickerOrder}
                userName={userName}
            />

            {/* MODAL SURAT JALAN RUTE MULTI-ALAMAT (DELIVERY MANIFEST) */}
            <MultiAddressWaybillModal
                show={showMultiAddressModal}
                onClose={() => { setShowMultiAddressModal(false); setSelectedTripDataForModal(null); }}
                tripData={selectedTripDataForModal}
                userName={userName}
            />

            {/* MODAL SURAT BARANG KELUAR / GATE PASS GUDANG */}
            <GatePassModal
                show={showBarangKeluarModal}
                onClose={() => { setShowBarangKeluarModal(false); setSelectedBarangKeluarData(null); }}
                selectedBarangKeluarData={selectedBarangKeluarData}
                userName={userName}
            />

            {/* MODAL CETAK SEKALIGUS (BATCH PRINT) SURAT JALAN SELURUH TRIP */}
            <BatchWaybillModal
                show={showBatchWaybillModal}
                onClose={() => { setShowBatchWaybillModal(false); setSelectedBatchWaybillTrip(null); }}
                tripData={selectedBatchWaybillTrip}
                userName={userName}
            />

            {/* MODAL KELOLA KARYAWAN & AKUN STAFF */}
            <EmployeeModal
                isOpen={showEmployeeModal}
                onClose={() => { setShowEmployeeModal(false); setSelectedEmployeeForEdit(null); }}
                employeeToEdit={selectedEmployeeForEdit}
                roleTitles={roleTitles}
            />

            {/* MODAL CATAT TRANSAKSI KEUANGAN & PEMBELIAN (OWNER & AKUNTAN) */}
            <FinanceTransactionModal
                isOpen={showFinanceModal}
                onClose={() => { setShowFinanceModal(false); setFinanceModalPrefillData(null); }}
                suppliersList={suppliersList}
                prefillType={financeModalPrefill}
                prefillData={financeModalPrefillData}
            />

            {/* MODAL KLAIM BIAYA ARMADA SUPIR (BBM SOLAR, TOL, PARKIR) */}
            <DriverClaimModal
                isOpen={showDriverClaimModal}
                onClose={() => setShowDriverClaimModal(false)}
                userName={userName}
            />

            {/* MODAL SERAH TERIMA UANG COD SURAT JALAN MERAH */}
            <CodSettlementModal
                isOpen={showCodSettlementModal}
                onClose={() => { setShowCodSettlementModal(false); setSelectedCodOrder(null); }}
                order={selectedCodOrder}
                driverName={userName}
            />

            {/* MODAL CETAK RESMI LAPORAN KEUANGAN PERUSAHAAN (PDF / PRINTER) */}
            <PrintFinancialReportModal
                isOpen={showPrintReportModal}
                onClose={() => setShowPrintReportModal(false)}
                initialReportType={printReportType}
                metrics={metrics}
                financeTransactionsList={financeTransactionsList}
                ordersList={initialOrders}
                currentUserName={userName}
            />

            {/* GLOBAL SKETCH LIGHTBOX MODAL */}
            {sketchLightbox.isOpen && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-cyan-500/50 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_80px_rgba(6,182,212,0.25)]">
                        <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">📐</span>
                                <div>
                                    <h3 className="font-black text-cyan-400 text-base">
                                        Sketsa Pola & Gambar Sambungan Kaca
                                    </h3>
                                    <p className="text-xs text-slate-400 font-mono">No SPO: {sketchLightbox.title}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <a
                                    href={sketchLightbox.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    download
                                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black px-4 py-1.5 rounded-xl text-xs transition flex items-center gap-1 shadow-lg shadow-cyan-500/20"
                                >
                                    ⬇️ Unduh Gambar
                                </a>
                                <button
                                    onClick={() => setSketchLightbox({ isOpen: false, url: '', title: '' })}
                                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition cursor-pointer"
                                >&times;</button>
                            </div>
                        </div>
                        <div className="flex-1 p-6 bg-black/95 flex items-center justify-center overflow-auto">
                            <img
                                src={sketchLightbox.url}
                                alt="Detail Sketsa Kaca"
                                className="max-w-full max-h-[75vh] object-contain rounded-xl border border-slate-800 shadow-2xl"
                            />
                        </div>
                        <div className="p-3.5 bg-slate-950 border-t border-slate-800 text-center text-xs text-slate-400 font-mono">
                            💡 Acuan gambar sketsa pola fisik & posisi sambungan kaca untuk semua divisi operasional SYP Glass (Gudang, Potong, Gosok, Bevel, Etsa).
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
