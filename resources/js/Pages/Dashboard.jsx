import React, { useState, useEffect } from 'react';
import { Head, useForm, router, usePage, Link } from '@inertiajs/react';
import { 
    BarChart3, FileText, Truck, Sliders, Boxes, Building2, 
    Plug, Archive, Wrench, Users, CreditCard, Search, 
    LogOut, Menu, X, AlertTriangle, Handshake, CheckCircle2, ArrowRight,
    Plus, Edit3, Layers, Download, Trash2, RotateCcw, MessageCircle, Check, Calendar
} from 'lucide-react';
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
import ConfirmDeliveryModal from '@/Components/Modals/ConfirmDeliveryModal';
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
import AddScrapModal from '@/Components/Modals/AddScrapModal';
import AddStockModal from '@/Components/Modals/AddStockModal';
import EditStockModal from '@/Components/Modals/EditStockModal';
import RestockStockModal from '@/Components/Modals/RestockStockModal';
import AddSupplierModal from '@/Components/Modals/AddSupplierModal';
import EditSupplierModal from '@/Components/Modals/EditSupplierModal';
import SupplierWaModal from '@/Components/Modals/SupplierWaModal';
import AddAccessoryModal from '@/Components/Modals/AddAccessoryModal';
import EditAccessoryModal from '@/Components/Modals/EditAccessoryModal';
import RestockAccessoryModal from '@/Components/Modals/RestockAccessoryModal';
import AddSupplyModal from '@/Components/Modals/AddSupplyModal';
import UseSupplyModal from '@/Components/Modals/UseSupplyModal';
import RequestRestockSupplyModal from '@/Components/Modals/RequestRestockSupplyModal';
import AddToolModal from '@/Components/Modals/AddToolModal';
import BorrowToolModal from '@/Components/Modals/BorrowToolModal';
import ReturnToolModal from '@/Components/Modals/ReturnToolModal';
import EditToolModal from '@/Components/Modals/EditToolModal';
import CompleteRepairModal from '@/Components/Modals/CompleteRepairModal';
import PromoteOrderModal from '@/Components/Modals/PromoteOrderModal';
import SalesRekapModal from '@/Components/Modals/SalesRekapModal';
import RevisionDetailModal from '@/Components/Modals/RevisionDetailModal';


export default function Dashboard({ 
    orders: initialOrders = [], 
    scrapGlasses: initialScrap = [], 
    deliveries: initialDeliveries = [], 
    users: initialUsersList = [], 
    activityLogs: initialActivityLogsList = [], 
    financeTransactions: initialFinanceTransactions = [], 
    sheetGlasses: initialSheetGlasses = [],
    suppliers: initialSuppliers = [],
    accessories: initialAccessories = [],
    tools: initialTools = [],
    supplies: initialSupplies = [],
    metrics = {} 
}) {
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

    // Role Integration State: Driver Claims & COD Handover & Delivery Confirmation
    const [showDriverClaimModal, setShowDriverClaimModal] = useState(false);
    const [showCodSettlementModal, setShowCodSettlementModal] = useState(false);
    const [selectedCodOrder, setSelectedCodOrder] = useState(null);

    const [showConfirmDeliveryModal, setShowConfirmDeliveryModal] = useState(false);
    const [selectedDeliveryOrder, setSelectedDeliveryOrder] = useState(null);

    const handleOpenConfirmDeliveryModal = (order) => {
        setSelectedDeliveryOrder(order);
        setShowConfirmDeliveryModal(true);
    };

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
        const cleanDateStr = typeof dateStr === 'string' ? dateStr.split('T')[0] : dateStr;
        const d = new Date(`${cleanDateStr}T00:00:00`);
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
    const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
    const [submittingAction, setSubmittingAction] = useState(null);
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

        const rawItems = Array.isArray(order.items) && order.items.length > 0
            ? order.items
            : [order];

        const initialDefectives = rawItems.map((item, idx) => ({
            item_index: idx,
            glass_type: item.glass_type || order.glass_type || 'Kaca Standard',
            width: item.width_cm ?? item.width ?? order.width_cm ?? order.width ?? 0,
            height: item.length_cm ?? item.height ?? item.length ?? order.length_cm ?? order.height ?? 0,
            thickness: item.thickness_mm ?? item.thickness ?? order.thickness_mm ?? order.thickness ?? 5,
            quantity: item.qty ?? item.quantity ?? order.qty ?? order.quantity ?? 1,
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
        length_cm: 183,
        width_cm: 244,
        size: '183 x 244 cm',
        thickness_mm: 5,
        buy_price: '',
        sell_price: '',
        rate_gm: 10000,
        rate_ht: 1000,
        rate_bv: 15000,
        rate_etsa: 50000,
        qty: 0,
        unit: 'Lembar',
        image: null,
        supplier_name: 'PT Asahimas Flat Glass Tbk (Divisi Cermin)',
        supplier_phone: '6281234567890',
        supplier_pic: 'Pak Gunawan'
    });
    const [editStockForm, setEditStockForm] = useState({
        id: null,
        item_code: '',
        name: '',
        category: 'Kaca Cermin',
        length_cm: 183,
        width_cm: 244,
        size: '183 x 244 cm',
        thickness_mm: 5,
        buy_price: '',
        sell_price: '',
        rate_gm: 10000,
        rate_ht: 1000,
        rate_bv: 15000,
        rate_etsa: 50000,
        qty: 0,
        unit: 'Lembar',
        image: null,
        image_path: null,
        supplier_name: '',
        supplier_phone: '',
        supplier_pic: ''
    });

    // Supplier Management State
    const [suppliersList, setSuppliersList] = useState(initialSuppliers?.length > 0 ? initialSuppliers : [
        { id: 1, name: 'PT Asahimas Flat Glass Tbk (Divisi Cermin)', category: 'Kaca Cermin & Bening', phone: '6281234567890', pic: 'Pak Gunawan', address: 'Kawasan Industri Ancol, Jakarta Utara', status: 'Mitra Utama' },
        { id: 2, name: 'PT Mulia Glass Float & Mirror', category: 'Kaca Float & Cermin Grey', phone: '6281398765432', pic: 'Ibu Siska', address: 'Jl. Raya Lemahabang, Cikarang', status: 'Mitra Aktif' },
        { id: 3, name: 'PT Kaca Tempered Nusantara', category: 'Kaca Tempered & Laminated', phone: '6281908070605', pic: 'Pak Irwan', address: 'Kawasan Industri Jababeka, Bekasi', status: 'Mitra Aktif' },
        { id: 4, name: 'PT Global Tinted Glass Import', category: 'Kaca Tinted & Dark Grey', phone: '6281577889900', pic: 'Pak Budianto', address: 'Kawasan Industri MM2100, Cibitung', status: 'Mitra Impor' },
        { id: 5, name: 'CV ArtGlass Dekoratif Etsa', category: 'Kaca Etsa & Sandblast', phone: '6281288990011', pic: 'Pak Rudy', address: 'Jl. Soekarno Hatta, Bandung', status: 'Mitra Lokal' },
    ]);

    useEffect(() => {
        if (initialSuppliers && initialSuppliers.length > 0) {
            setSuppliersList(initialSuppliers);
        }
    }, [initialSuppliers]);
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
            router.delete(route('inventory.suppliers.destroy', id), {
                preserveScroll: true,
                onSuccess: () => {
                    setSuppliersList(prev => prev.filter(sup => sup.id !== id));
                },
                onError: () => {
                    setSuppliersList(prev => prev.filter(sup => sup.id !== id));
                }
            });
        }
    };
    // Operational Tools & Machinery Management State (Alat Penunjang)
    const [toolsList, setToolsList] = useState(initialTools?.length > 0 ? initialTools : [
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

    useEffect(() => {
        if (initialTools && initialTools.length > 0) {
            setToolsList(initialTools);
            const extractedBorrows = initialTools.flatMap(t => (t.borrows || []).map(b => ({
                id: b.id,
                tool_id: t.id,
                tool_code: t.tool_code,
                tool_name: t.name,
                borrower_name: b.borrower_name,
                purpose: b.purpose,
                borrow_date: b.borrow_date,
                expected_return: b.expected_return,
                actual_return: b.actual_return,
                qty_borrowed: b.qty_borrowed,
                status: b.status
            })));
            if (extractedBorrows.length > 0) {
                setToolBorrowings(extractedBorrows);
            }
        }
    }, [initialTools]);

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
    const [warehouseSuppliesList, setWarehouseSuppliesList] = useState(initialSupplies?.length > 0 ? initialSupplies : [
        { id: 1, item_code: 'PLK-001', name: 'Sarung Tangan Safety Antigores / Cut Resistant', category: 'APD & Keselamatan Kerja', stock_qty: 45, min_stock: 10, unit: 'Pasang', location: 'Rak APD A1', status: 'Aman' },
        { id: 2, item_code: 'PLK-002', name: 'Kacamata Safety Bening Protective Goggles', category: 'APD & Keselamatan Kerja', stock_qty: 28, min_stock: 5, unit: 'Pcs', location: 'Rak APD A2', status: 'Aman' },
        { id: 3, item_code: 'PLK-003', name: 'Cutter Heavy Duty Operasional & Mata Pisau Refill', category: 'Perkakas Tangan Habis Pakai', stock_qty: 15, min_stock: 5, unit: 'Set', location: 'Rak Alat B1', status: 'Aman' },
        { id: 4, item_code: 'PLK-004', name: 'Lakban Bening Packaging Heavy Duty 2 Inch', category: 'Peralatan Packaging & Pengiriman', stock_qty: 60, min_stock: 15, unit: 'Roll', location: 'Gudang Packaging', status: 'Aman' },
        { id: 5, item_code: 'PLK-005', name: 'Cairan Pembersih Kaca Special Glass Cleaner 5L', category: 'Bahan Kimia & Kebersihan Kaca', stock_qty: 6, min_stock: 8, unit: 'Galon', location: 'Gudang B1', status: 'Menipis' },
        { id: 6, item_code: 'PLK-006', name: 'Amplas Kaca Halus & Sanding Pad Edge', category: 'Consumables Mesin Potong & Gosok', stock_qty: 40, min_stock: 10, unit: 'Lembar', location: 'Rak Finishing C2', status: 'Aman' },
        { id: 7, item_code: 'PLK-007', name: 'Oli Pelumas Mesin Bor & Mesin Potong (Lubricant)', category: 'Perawatan Mesin & Pelumas', stock_qty: 4, min_stock: 5, unit: 'Liter', location: 'Gudang Mesin D1', status: 'Menipis' },
        { id: 8, item_code: 'PLK-008', name: 'Masker Respirator Filter Debu Etsa & Gosok', category: 'APD & Keselamatan Kerja', stock_qty: 50, min_stock: 15, unit: 'Pcs', location: 'Rak APD A3', status: 'Aman' },
    ]);

    useEffect(() => {
        if (initialSupplies && initialSupplies.length > 0) {
            setWarehouseSuppliesList(initialSupplies);
            const extractedUsages = initialSupplies.flatMap(s => (s.usages || []).map(u => ({
                id: u.id,
                supply_id: s.id,
                item_code: s.item_code,
                item_name: s.name,
                used_qty: u.used_qty,
                unit: s.unit,
                user_division: u.user_division,
                taker_name: u.taker_name,
                usage_date: u.usage_date,
                notes: u.notes
            })));
            if (extractedUsages.length > 0) {
                setSupplyUsageLogs(extractedUsages);
            }
            const extractedRestocks = initialSupplies.flatMap(s => (s.restocks || []).map(r => ({
                id: r.id,
                supply_id: s.id,
                item_code: s.item_code,
                item_name: s.name,
                request_qty: r.request_qty,
                unit: s.unit,
                requester_name: r.requester_name,
                urgency: r.urgency,
                request_date: r.request_date,
                status: r.status,
                reason: r.reason,
                approved_date: r.approved_date,
                notes: r.notes
            })));
            if (extractedRestocks.length > 0) {
                setSupplyRestockRequests(extractedRestocks);
            }
        }
    }, [initialSupplies]);

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

    const handleUseSupplySubmit = (payload) => {
        if (!payload || !payload.taker_name || !payload.items || payload.items.length === 0) return;

        let updatedSupplies = [...warehouseSuppliesList];
        let newLogs = [];

        for (const item of payload.items) {
            const supplyObj = updatedSupplies.find(s => s.id === parseInt(item.supply_id));
            const qtyToUse = parseInt(item.used_qty) || 1;

            if (!supplyObj || qtyToUse > supplyObj.stock_qty) continue;

            updatedSupplies = updatedSupplies.map(s => {
                if (s.id === supplyObj.id) {
                    const newQty = s.stock_qty - qtyToUse;
                    let newStatus = 'Aman';
                    if (newQty <= 0) newStatus = 'Habis';
                    else if (newQty <= s.min_stock) newStatus = 'Menipis';
                    return { ...s, stock_qty: newQty, status: newStatus };
                }
                return s;
            });

            newLogs.push({
                id: Date.now() + Math.random(),
                item_code: supplyObj.item_code,
                item_name: supplyObj.name,
                used_qty: qtyToUse,
                unit: supplyObj.unit,
                user_division: payload.user_division || 'Divisi Potong (HT)',
                taker_name: payload.taker_name,
                usage_date: new Date().toISOString().split('T')[0],
                notes: payload.notes || 'Pemakaian operasional gudang/divisi'
            });
        }

        setWarehouseSuppliesList(updatedSupplies);
        setSupplyUsageLogs(prev => [...newLogs, ...prev]);
        setShowUseSupplyModal(false);
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
    const [accessoriesList, setAccessoriesList] = useState(initialAccessories?.length > 0 ? initialAccessories : [
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

    useEffect(() => {
        if (initialAccessories && initialAccessories.length > 0) {
            setAccessoriesList(initialAccessories);
        }
    }, [initialAccessories]);
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
            router.delete(route('inventory.accessories.destroy', id), {
                preserveScroll: true,
                onSuccess: () => {
                    setAccessoriesList(prev => prev.filter(acc => acc.id !== id));
                },
                onError: () => {
                    setAccessoriesList(prev => prev.filter(acc => acc.id !== id));
                }
            });
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

        const len = parseFloat(newStockForm.length_cm) || 183;
        const wid = parseFloat(newStockForm.width_cm) || 244;
        const sizeStr = `${len} x ${wid} cm`;

        const rateGM = parseFloat(newStockForm.rate_gm) || 10000;
        const rateHT = parseFloat(newStockForm.rate_ht) || 1000;
        const rateBV = parseFloat(newStockForm.rate_bv) || 15000;
        const rateEtsa = parseFloat(newStockForm.rate_etsa) || 50000;

        const payload = {
            item_code: autoCode,
            name: newStockForm.name,
            category: newStockForm.category,
            length_cm: len,
            width_cm: wid,
            thickness_mm: thickness,
            buy_price: buyPrice,
            sell_price: sellPrice,
            rate_gm: rateGM,
            rate_ht: rateHT,
            rate_bv: rateBV,
            rate_etsa: rateEtsa,
            qty: qty,
            unit: 'Lembar',
            image: newStockForm.image,
            supplier_name: newStockForm.supplier_name,
            supplier_phone: newStockForm.supplier_phone,
            supplier_pic: newStockForm.supplier_pic
        };

        router.post(route('inventory.sheet_glasses.store'), payload, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setShowAddStockModal(false);
                setNewStockForm({
                    item_code: '',
                    name: '',
                    category: 'Kaca Cermin',
                    length_cm: 183,
                    width_cm: 244,
                    size: '183 x 244 cm',
                    thickness_mm: 5,
                    buy_price: '',
                    sell_price: '',
                    rate_gm: 10000,
                    rate_ht: 1000,
                    rate_bv: 15000,
                    rate_etsa: 50000,
                    qty: 0,
                    unit: 'Lembar',
                    image: null,
                    supplier_name: 'PT Asahimas Flat Glass Tbk (Divisi Cermin)',
                    supplier_phone: '6281234567890',
                    supplier_pic: 'Pak Gunawan'
                });
            },
            onError: () => {
                const status = qty > 10 ? 'Aman' : (qty > 0 ? 'Menipis' : 'Pengajuan Proses Restock');
                const newItem = {
                    id: Date.now(),
                    ...payload,
                    size: sizeStr,
                    last_restock: new Date().toISOString().split('T')[0],
                    status: status
                };
                setSheetGlasses(prev => [newItem, ...prev]);
                setShowAddStockModal(false);
            }
        });
    };

    const handleOpenEditStockModal = (item) => {
        let len = item.length_cm;
        let wid = item.width_cm;
        if (!len || !wid) {
            const parts = (item.size || '').split('x');
            if (parts.length === 2) {
                len = parseFloat(parts[0]) || 183;
                wid = parseFloat(parts[1]) || 244;
            } else {
                len = 183;
                wid = 244;
            }
        }

        setEditStockForm({
            id: item.id,
            item_code: item.item_code || '',
            name: item.name || '',
            category: item.category || 'Kaca Cermin',
            length_cm: len,
            width_cm: wid,
            size: item.size || `${len} x ${wid} cm`,
            thickness_mm: item.thickness_mm || 5,
            buy_price: item.buy_price ?? '',
            sell_price: item.sell_price ?? '',
            rate_gm: item.rate_gm ?? 10000,
            rate_ht: item.rate_ht ?? 1000,
            rate_bv: item.rate_bv ?? 15000,
            rate_etsa: item.rate_etsa ?? 50000,
            qty: item.qty ?? 0,
            unit: item.unit || 'Lembar',
            image: null,
            image_path: item.image_path || null,
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

        const len = parseFloat(editStockForm.length_cm) || 183;
        const wid = parseFloat(editStockForm.width_cm) || 244;
        const sizeStr = `${len} x ${wid} cm`;

        const rateGM = parseFloat(editStockForm.rate_gm) || 10000;
        const rateHT = parseFloat(editStockForm.rate_ht) || 1000;
        const rateBV = parseFloat(editStockForm.rate_bv) || 15000;
        const rateEtsa = parseFloat(editStockForm.rate_etsa) || 50000;

        const payload = {
            name: editStockForm.name,
            category: editStockForm.category,
            length_cm: len,
            width_cm: wid,
            thickness_mm: thickness,
            buy_price: buyPrice,
            sell_price: sellPrice,
            rate_gm: rateGM,
            rate_ht: rateHT,
            rate_bv: rateBV,
            rate_etsa: rateEtsa,
            qty: qty,
            unit: 'Lembar',
            image: editStockForm.image,
            supplier_name: editStockForm.supplier_name,
            supplier_phone: editStockForm.supplier_phone,
            supplier_pic: editStockForm.supplier_pic
        };

        router.post(route('inventory.sheet_glasses.update', editStockForm.id), payload, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setShowEditStockModal(false);
            },
            onError: () => {
                const status = qty > 10 ? 'Aman' : (qty > 0 ? 'Menipis' : 'Pengajuan Proses Restock');
                setSheetGlasses(prev => prev.map(item => {
                    if (item.id === editStockForm.id) {
                        return {
                            ...item,
                            ...payload,
                            size: sizeStr,
                            status: status
                        };
                    }
                    return item;
                }));
                setShowEditStockModal(false);
            }
        });
    };

    const handleDeleteStockItem = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus katalog kaca ini dari inventaris?')) {
            router.delete(route('inventory.sheet_glasses.destroy', id), {
                preserveScroll: true,
                onSuccess: () => {
                    setSheetGlasses(prev => prev.filter(item => item.id !== id));
                },
                onError: () => {
                    setSheetGlasses(prev => prev.filter(item => item.id !== id));
                }
            });
        }
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

    const [sheetGlasses, setSheetGlasses] = useState(initialSheetGlasses?.length > 0 ? initialSheetGlasses : [
        {
            id: 1,
            item_code: 'BRG-001',
            name: 'Kaca Cermin Polos 5 mm Standard',
            category: 'Kaca Cermin',
            size: '183 x 244 cm',
            length_cm: 183,
            width_cm: 244,
            thickness_mm: 5,
            buy_price: 280000,
            sell_price: 380000,
            rate_gm: 10000,
            rate_ht: 1000,
            rate_bv: 15000,
            rate_etsa: 50000,
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
            length_cm: 214,
            width_cm: 305,
            thickness_mm: 8,
            buy_price: 320000,
            sell_price: 450000,
            rate_gm: 10000,
            rate_ht: 1000,
            rate_bv: 15000,
            rate_etsa: 50000,
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
            length_cm: 244,
            width_cm: 366,
            thickness_mm: 10,
            buy_price: 520000,
            sell_price: 720000,
            rate_gm: 10000,
            rate_ht: 1000,
            rate_bv: 15000,
            rate_etsa: 50000,
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
            length_cm: 244,
            width_cm: 366,
            thickness_mm: 12,
            buy_price: 680000,
            sell_price: 950000,
            rate_gm: 10000,
            rate_ht: 1000,
            rate_bv: 15000,
            rate_etsa: 50000,
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
            length_cm: 183,
            width_cm: 244,
            thickness_mm: 5,
            buy_price: 390000,
            sell_price: 540000,
            rate_gm: 10000,
            rate_ht: 1000,
            rate_bv: 15000,
            rate_etsa: 50000,
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
            length_cm: 183,
            width_cm: 244,
            thickness_mm: 5,
            buy_price: 385000,
            sell_price: 530000,
            rate_gm: 10000,
            rate_ht: 1000,
            rate_bv: 15000,
            rate_etsa: 50000,
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
            length_cm: 183,
            width_cm: 244,
            thickness_mm: 6,
            buy_price: 310000,
            sell_price: 430000,
            rate_gm: 10000,
            rate_ht: 1000,
            rate_bv: 15000,
            rate_etsa: 50000,
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
            length_cm: 183,
            width_cm: 244,
            thickness_mm: 5,
            buy_price: 350000,
            sell_price: 480000,
            rate_gm: 10000,
            rate_ht: 1000,
            rate_bv: 15000,
            rate_etsa: 50000,
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
            length_cm: 214,
            width_cm: 305,
            thickness_mm: 10,
            buy_price: 620000,
            sell_price: 850000,
            rate_gm: 10000,
            rate_ht: 1000,
            rate_bv: 15000,
            rate_etsa: 50000,
            qty: 12,
            unit: 'Lembar',
            supplier_name: 'PT Kaca Tempered Nusantara',
            supplier_phone: '6281908070605',
            last_restock: '2026-08-28',
            status: 'Aman'
        }
    ]);

    useEffect(() => {
        if (initialSheetGlasses && initialSheetGlasses.length > 0) {
            setSheetGlasses(initialSheetGlasses);
        }
    }, [initialSheetGlasses]);

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
    const handleOpenNewOrderModal = (isCompanyUse = false) => {
        resetOrder();
        setSketchPreview(null);
        setOrderForm({
            order_date: new Date().toISOString().split('T')[0],
            customer_name: isCompanyUse ? 'Penggunaan Internal Perusahaan' : '',
            customer_phone: isCompanyUse ? '-' : '',
            customer_address: isCompanyUse ? 'Internal Pabrik / Kantor UTB' : '',
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
            description: isCompanyUse ? 'Orderan internal kebutuhan perusahaan' : '',
            sketch_photo: null,
            priority_status: 'Biasa',
            priority_fee: 0,
            custom_fee: 0,
            payment_option: 'dp',
            dp_percent: 50,
            custom_paid_amount: '',
            deadline_date: '',
            used_scrap_rak: '',
            is_company_use: Boolean(isCompanyUse),
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
        if (val === null || val === undefined || val === '') return '';
        const digits = String(val).replace(/\D/g, '');
        return digits !== '' ? parseFloat(digits) : '';
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

    // Real-Time Multi Item Price Calculation (Connected to Master Sheet Glasses & Dynamic Process Rates)
    const calcItems = (orderForm.items || []).map(it => {
        const l = parseDim(it.length_cm);
        const w = parseDim(it.width_cm);
        const q = parseInt(it.qty) || 0;
        const procs = Array.isArray(it.processes) ? it.processes : ['HT'];

        const areaM2 = (l * w) / 10000;
        const perimeterM = (2 * (l + w)) / 100;

        // 1. Cari jenis kaca yang cocok di katalog master sheetGlasses
        const matchedGlass = (sheetGlasses || []).find(g => 
            (g.name && it.glass_type && (g.name.toLowerCase() === it.glass_type.toLowerCase() || it.glass_type.toLowerCase().includes(g.name.toLowerCase()) || g.name.toLowerCase().includes(it.glass_type.toLowerCase()))) ||
            (g.id && it.glass_id && g.id === it.glass_id)
        );

        // 1b. Hitung batas ukuran lembaran utuh yang tersedia (Orientasi Fleksibel: PxL atau LxP)
        let sheetLen = 244;
        let sheetWid = 183;
        if (matchedGlass && parseFloat(matchedGlass.length_cm) > 0 && parseFloat(matchedGlass.width_cm) > 0) {
            sheetLen = parseFloat(matchedGlass.length_cm);
            sheetWid = parseFloat(matchedGlass.width_cm);
        } else if (sheetGlasses && sheetGlasses.length > 0) {
            sheetLen = Math.max(...sheetGlasses.map(g => parseFloat(g.length_cm) || 183), 244);
            sheetWid = Math.max(...sheetGlasses.map(g => parseFloat(g.width_cm) || 244), 305);
        }

        const maxSheetDim = Math.max(sheetLen, sheetWid);
        const minSheetDim = Math.min(sheetLen, sheetWid);

        const itemMaxDim = Math.max(l, w);
        const itemMinDim = Math.min(l, w);

        const isExceeded = (l > 0 || w > 0) && (itemMaxDim > maxSheetDim || itemMinDim > minSheetDim);

        // 2. Tentukan harga per m2 berdasarkan master katalog
        let pricePerM2 = 380000;
        if (matchedGlass && matchedGlass.sell_price > 0) {
            pricePerM2 = parseFloat(matchedGlass.sell_price);
        } else {
            const t = parseInt(it.thickness_mm) || 5;
            if (t >= 12) pricePerM2 = 950000;
            else if (t >= 10) pricePerM2 = 720000;
            else if (t >= 8) pricePerM2 = 450000;
            else pricePerM2 = 380000;
        }

        // 3. Tarif proses kustom dari jenis kaca
        const rateGM = matchedGlass?.rate_gm ? parseFloat(matchedGlass.rate_gm) : 10000;
        const rateHT = matchedGlass?.rate_ht ? parseFloat(matchedGlass.rate_ht) : 1000;
        const rateBV = matchedGlass?.rate_bv ? parseFloat(matchedGlass.rate_bv) : 15000;
        const rateEtsa = matchedGlass?.rate_etsa ? parseFloat(matchedGlass.rate_etsa) : 50000;

        // 4. Hitung harga bahan kaca murni proporsional luas area m2 (0 jika Orderan Kosong / Dipakai Perusahaan)
        const rawBasePrice = Math.round(areaM2 * pricePerM2);
        const baseGlassPrice = orderForm.is_company_use ? 0 : ((l > 0 && w > 0) ? rawBasePrice * q : 0);

        let feeGM = procs.includes('GM') ? Math.round(perimeterM * rateGM) * q : 0;
        let feeHT = procs.includes('HT') ? Math.round(perimeterM * rateHT) * q : 0;

        const bevelWidthCm = parseDim(it.bevel_width_cm) || 1;
        let feeBV = procs.includes('BV') ? Math.round((perimeterM * rateBV) + (bevelWidthCm * 10000)) * q : 0;

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
            feeEtsa = Math.round(etsaAreaM2 * etsaQ * rateEtsa) * q;
            feeEtsa = Math.max((rateEtsa / 2) * q, feeEtsa);
        }

        // Biaya proses eksekusi otomatis 0 untuk Orderan Kosong (Dipakai Perusahaan)
        if (orderForm.is_company_use) {
            feeGM = 0;
            feeHT = 0;
            feeBV = 0;
            feeBor = 0;
            feeEtsa = 0;
        }

        const subtotal = baseGlassPrice + feeGM + feeHT + feeBV + feeBor + feeEtsa;

        return {
            ...it,
            isExceeded,
            maxSheetDim,
            minSheetDim,
            sheetLen,
            sheetWid,
            price_per_m2: pricePerM2,
            rate_gm: rateGM,
            rate_ht: rateHT,
            rate_bv: rateBV,
            rate_etsa: rateEtsa,
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
        setIsSubmittingOrder(true);
        setSubmittingAction(targetStatus);
        router.post(route('orders.store'), {
            ...orderForm,
            items: calcItems,
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
            },
            onFinish: () => {
                setIsSubmittingOrder(false);
                setSubmittingAction(null);
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
            revision_notes: '',
            sketch_photo: null,
            priority_status: order.priority_status || 'Biasa',
            priority_fee: order.priority_fee || 0,
            custom_fee: order.custom_fee || 0,
            payment_option: isLunas ? 'lunas' : 'dp',
            dp_percent: initialDpPercent,
            custom_paid_amount: order.paid_amount || '',
            deadline_date: order.deadline_date ? String(order.deadline_date).split('T')[0] : '',
            used_scrap_rak: order.used_scrap_rak || '',
            is_company_use: Boolean(order.is_company_use),
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
        setIsSubmittingOrder(true);
        setSubmittingAction(finalStatus);

        router.post(route('orders.update', editingOrder.id), {
            ...orderForm,
            items: calcItems,
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
            },
            onFinish: () => {
                setIsSubmittingOrder(false);
                setSubmittingAction(null);
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

    const [showRevisionDetailModal, setShowRevisionDetailModal] = useState(false);
    const [selectedRevisionOrder, setSelectedRevisionOrder] = useState(null);

    const handleOpenRevisionDetailModal = (order) => {
        setSelectedRevisionOrder(order);
        setShowRevisionDetailModal(true);
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
        <div className="h-screen bg-[#F8FAFC] text-[#242222] font-sans flex flex-col overflow-hidden">
            <Head title={`Dashboard (${roleTitles[userRole] || userRole}) - UTB`} />

            {/* HEADER - CERAH */}
            <header className="bg-white border-b border-slate-200 shrink-0 px-3 sm:px-6 py-3 flex flex-wrap md:flex-nowrap justify-between items-center z-40 gap-3 shadow-xs">
                <div className="flex items-center gap-2.5 sm:gap-3">
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden bg-slate-100 text-slate-700 p-2 rounded-xl border border-slate-200 text-base hover:bg-slate-200 transition focus:outline-none flex items-center justify-center shrink-0"
                        title="Buka Navigasi Menu"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                    <img 
                        src="/assets/Logo_UTB.png" 
                        alt="Logo UTB" 
                        className="h-10 w-auto object-contain shrink-0" 
                    />
                    <div>
                        <h1 className="font-black text-sm sm:text-lg tracking-wider text-[#242222]">UTB</h1>
                        <p className="text-[10px] sm:text-xs text-[#70b03c] font-extrabold uppercase tracking-widest truncate max-w-[170px] sm:max-w-none">Kerja Praktek • {userName}</p>
                    </div>
                </div>

                {/* GLOBAL SEARCH INPUT BAR */}
                <div className="flex-1 max-w-lg mx-0 md:mx-6 w-full order-3 md:order-none">
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Cari SPO, Customer, HP, Alamat, Kaca, Ukuran, Driver, Supplier..."
                            value={searchTerm}
                            onChange={e => handleSearchChange(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-9 py-2 text-xs text-[#242222] placeholder-slate-400 focus:border-[#1b68b0] focus:ring-1 focus:ring-[#1b68b0] focus:outline-none shadow-xs transition font-medium"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => handleSearchChange('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#242222] text-xs font-bold cursor-pointer"
                                title="Hapus pencarian"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {/* RIGHT HEADER - CLEAN USER PROFILE CHIP */}
                <div className="hidden sm:flex items-center gap-3">
                    <div className="text-right">
                        <div className="text-xs font-bold text-[#242222] leading-tight">{userName}</div>
                        <div className="text-[10px] text-slate-500 font-semibold">{roleTitles[userRole] || userRole}</div>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-[#1b68b0]/10 border border-[#1b68b0]/25 text-[#1b68b0] font-black flex items-center justify-center text-xs shadow-xs">
                        {userName ? userName.charAt(0).toUpperCase() : 'U'}
                    </div>
                </div>
            </header>

            {/* MOBILE TOP TAB BAR HORIZONTAL SCROLLER */}
            <div className="md:hidden bg-slate-100 border-b border-slate-200 px-3 py-2 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
                {(userRole === 'owner' || userRole === 'finance' || userRole === 'admin_finance') && (
                    <button 
                        onClick={() => setActiveTab('dashboard')} 
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${activeTab === 'dashboard' ? 'bg-[#1b68b0] text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'}`}
                    >
                        <BarChart3 className="w-3.5 h-3.5" /> Dashboard
                    </button>
                )}
                {(userRole === 'admin_toko' || userRole === 'admin_gudang' || userRole === 'owner') && (
                    <button 
                        onClick={() => { setActiveTab('orders'); if (userRole === 'admin_gudang') setActiveOrderCard('pengerjaan'); }} 
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${activeTab === 'orders' ? 'bg-[#1b68b0] text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'}`}
                    >
                        <FileText className="w-3.5 h-3.5" /> Orderan
                    </button>
                )}
                {(userRole === 'admin_toko' || userRole === 'admin_gudang' || userRole === 'owner' || userRole === 'driver') && (
                    <button 
                        onClick={() => setActiveTab('deliveries')} 
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${activeTab === 'deliveries' ? 'bg-[#1b68b0] text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'}`}
                    >
                        <Truck className="w-3.5 h-3.5" /> Pengiriman
                    </button>
                )}
                {(userRole.startsWith('divisi_') || userRole === 'admin_gudang' || userRole === 'owner') && (
                    <button 
                        onClick={() => setActiveTab('production')} 
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${activeTab === 'production' ? 'bg-[#1b68b0] text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'}`}
                    >
                        <Sliders className="w-3.5 h-3.5" /> Disposisi
                    </button>
                )}
                {(userRole === 'divisi_ht' || userRole === 'admin_gudang' || userRole === 'admin_toko' || userRole === 'owner') && (
                    <button 
                        onClick={() => setActiveTab('scrap')} 
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${activeTab === 'scrap' ? 'bg-[#1b68b0] text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'}`}
                    >
                        <Boxes className="w-3.5 h-3.5" /> Kaca
                    </button>
                )}
                {(userRole === 'admin_toko' || userRole === 'owner') && (
                    <button 
                        onClick={() => setActiveTab('suppliers')} 
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${activeTab === 'suppliers' ? 'bg-[#1b68b0] text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'}`}
                    >
                        <Building2 className="w-3.5 h-3.5" /> Supplier
                    </button>
                )}
                {(userRole === 'admin_toko' || userRole === 'owner' || userRole === 'finance' || userRole === 'admin_finance') && (
                    <button 
                        onClick={() => setActiveTab('accessories')} 
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${activeTab === 'accessories' ? 'bg-[#1b68b0] text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'}`}
                    >
                        <Plug className="w-3.5 h-3.5" /> Aksesoris
                    </button>
                )}
                {(userRole === 'admin_gudang' || userRole === 'owner' || userRole === 'admin_toko' || userRole === 'finance' || userRole === 'admin_finance') && (
                    <button 
                        onClick={() => setActiveTab('supplies')} 
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${activeTab === 'supplies' ? 'bg-[#1b68b0] text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'}`}
                    >
                        <Archive className="w-3.5 h-3.5" /> Gudang
                    </button>
                )}
                {(userRole === 'admin_toko' || userRole === 'admin_gudang' || userRole === 'owner' || userRole.startsWith('divisi_') || userRole === 'driver' || userRole === 'finance' || userRole === 'admin_finance') && (
                    <button 
                        onClick={() => setActiveTab('tools')} 
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${activeTab === 'tools' ? 'bg-[#1b68b0] text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'}`}
                    >
                        <Wrench className="w-3.5 h-3.5" /> Alat
                    </button>
                )}
                {(userRole === 'hrd' || userRole === 'admin_finance' || userRole === 'finance' || userRole === 'owner') && (
                    <button 
                        onClick={() => setActiveTab('employees')} 
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${activeTab === 'employees' ? 'bg-[#1b68b0] text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'}`}
                    >
                        <Users className="w-3.5 h-3.5" /> Karyawan
                    </button>
                )}
                {(userRole === 'owner' || userRole === 'finance' || userRole === 'admin_finance') && (
                    <button 
                        onClick={() => setActiveTab('finance')} 
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${activeTab === 'finance' ? 'bg-[#1b68b0] text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'}`}
                    >
                        <CreditCard className="w-3.5 h-3.5" /> Finance
                    </button>
                )}
            </div>

            {/* MOBILE SIDEBAR DRAWER OVERLAY */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden flex">
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)}></div>
                    <aside className="relative w-72 max-w-[80vw] bg-white border-r border-slate-200 p-4 space-y-2 overflow-y-auto z-10 flex flex-col h-full shadow-2xl">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-200 mb-2">
                            <span className="font-black text-sm text-[#1b68b0] flex items-center gap-1.5">UTB NAVIGASI</span>
                            <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-[#242222] p-1 text-sm font-bold">✕</button>
                        </div>

                        <nav className="space-y-1 flex-1">
                            {(userRole === 'owner' || userRole === 'finance' || userRole === 'admin_finance') && (
                                <button onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition ${activeTab === 'dashboard' ? 'bg-[#1b68b0]/10 text-[#1b68b0] border border-[#1b68b0]/30 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-[#242222] font-semibold'}`}>
                                    <BarChart3 className="w-4 h-4 shrink-0 text-[#1b68b0]" /> <span>Dashboard</span>
                                </button>
                            )}

                            {(userRole === 'admin_toko' || userRole === 'admin_gudang' || userRole === 'owner') && (
                                <button onClick={() => { setActiveTab('orders'); if (userRole === 'admin_gudang') setActiveOrderCard('pengerjaan'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition ${activeTab === 'orders' ? 'bg-[#1b68b0]/10 text-[#1b68b0] border border-[#1b68b0]/30 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-[#242222] font-semibold'}`}>
                                    <FileText className="w-4 h-4 shrink-0 text-[#1b68b0]" /> <span>Orderan</span>
                                </button>
                            )}

                            {(userRole === 'admin_toko' || userRole === 'admin_gudang' || userRole === 'owner' || userRole === 'driver') && (
                                <button onClick={() => { setActiveTab('deliveries'); setMobileMenuOpen(false); }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition ${activeTab === 'deliveries' ? 'bg-[#1b68b0]/10 text-[#1b68b0] border border-[#1b68b0]/30 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-[#242222] font-semibold'}`}>
                                    <div className="flex items-center gap-3">
                                        <Truck className="w-4 h-4 shrink-0 text-[#1b68b0]" /> <span>Pengiriman</span>
                                    </div>
                                    <span className="bg-blue-50 text-[#1b68b0] border border-blue-200/80 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                                        {initialOrders.filter(o => o.status === 'pengiriman').length}
                                    </span>
                                </button>
                            )}

                            {(userRole.startsWith('divisi_') || userRole === 'admin_gudang' || userRole === 'owner') && (
                                <button onClick={() => { setActiveTab('production'); setMobileMenuOpen(false); }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition ${activeTab === 'production' ? 'bg-[#1b68b0]/10 text-[#1b68b0] border border-[#1b68b0]/30 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-[#242222] font-semibold'}`}>
                                    <div className="flex items-center gap-3">
                                        <Sliders className="w-4 h-4 shrink-0 text-[#1b68b0]" /> <span>Disposisi</span>
                                    </div>
                                </button>
                            )}

                            {(userRole === 'divisi_ht' || userRole === 'admin_gudang' || userRole === 'admin_toko' || userRole === 'owner') && (
                                <button onClick={() => { setActiveTab('scrap'); setMobileMenuOpen(false); }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition ${activeTab === 'scrap' ? 'bg-[#1b68b0]/10 text-[#1b68b0] border border-[#1b68b0]/30 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-[#242222] font-semibold'}`}>
                                    <div className="flex items-center gap-3">
                                        <Boxes className="w-4 h-4 shrink-0 text-[#1b68b0]" /> <span>Kaca</span>
                                    </div>
                                </button>
                            )}

                            {(userRole === 'admin_toko' || userRole === 'owner') && (
                                <button onClick={() => { setActiveTab('suppliers'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition ${activeTab === 'suppliers' ? 'bg-[#1b68b0]/10 text-[#1b68b0] border border-[#1b68b0]/30 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-[#242222] font-semibold'}`}>
                                    <Building2 className="w-4 h-4 shrink-0 text-[#1b68b0]" /> <span>Supplier</span>
                                </button>
                            )}

                            {(userRole === 'admin_toko' || userRole === 'owner' || userRole === 'finance' || userRole === 'admin_finance') && (
                                <button onClick={() => { setActiveTab('accessories'); setMobileMenuOpen(false); }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition ${activeTab === 'accessories' ? 'bg-[#1b68b0]/10 text-[#1b68b0] border border-[#1b68b0]/30 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-[#242222] font-semibold'}`}>
                                    <div className="flex items-center gap-3">
                                        <Plug className="w-4 h-4 shrink-0 text-[#1b68b0]" /> <span>Aksesoris</span>
                                    </div>
                                </button>
                            )}

                            {(userRole === 'admin_gudang' || userRole === 'owner' || userRole === 'admin_toko' || userRole === 'finance' || userRole === 'admin_finance') && (
                                <button onClick={() => { setActiveTab('supplies'); setMobileMenuOpen(false); }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition ${activeTab === 'supplies' ? 'bg-[#1b68b0]/10 text-[#1b68b0] border border-[#1b68b0]/30 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-[#242222] font-semibold'}`}>
                                    <div className="flex items-center gap-3">
                                        <Archive className="w-4 h-4 shrink-0 text-[#1b68b0]" /> <span>Gudang</span>
                                    </div>
                                </button>
                            )}

                            {(userRole === 'admin_toko' || userRole === 'admin_gudang' || userRole === 'owner' || userRole.startsWith('divisi_') || userRole === 'driver' || userRole === 'finance' || userRole === 'admin_finance') && (
                                <button onClick={() => { setActiveTab('tools'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition ${activeTab === 'tools' ? 'bg-[#1b68b0]/10 text-[#1b68b0] border border-[#1b68b0]/30 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-[#242222] font-semibold'}`}>
                                    <Wrench className="w-4 h-4 shrink-0 text-[#1b68b0]" /> <span>Alat</span>
                                </button>
                            )}

                            {(userRole === 'hrd' || userRole === 'admin_finance' || userRole === 'finance' || userRole === 'owner') && (
                                <button onClick={() => { setActiveTab('employees'); setMobileMenuOpen(false); }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition ${activeTab === 'employees' ? 'bg-[#1b68b0]/10 text-[#1b68b0] border border-[#1b68b0]/30 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-[#242222] font-semibold'}`}>
                                    <div className="flex items-center gap-3">
                                        <Users className="w-4 h-4 shrink-0 text-[#1b68b0]" /> <span>Karyawan</span>
                                    </div>
                                    <span className="bg-blue-50 text-[#1b68b0] border border-blue-200/80 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                                        {employeesList.length}
                                    </span>
                                </button>
                            )}

                            {(userRole === 'owner' || userRole === 'finance' || userRole === 'admin_finance') && (
                                <button onClick={() => { setActiveTab('finance'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition ${activeTab === 'finance' ? 'bg-[#1b68b0]/10 text-[#1b68b0] border border-[#1b68b0]/30 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-[#242222] font-semibold'}`}>
                                    <CreditCard className="w-4 h-4 shrink-0 text-[#1b68b0]" /> <span>Finance</span>
                                </button>
                            )}
                        </nav>

                        {/* MOBILE DRAWER FOOTER */}
                        <div className="pt-3 border-t border-slate-200 bg-slate-50/80 -mx-4 -mb-4 p-4">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-9 h-9 rounded-xl bg-[#1b68b0] text-white font-black flex items-center justify-center text-xs shrink-0 shadow-xs">
                                        {userName ? userName.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-xs font-black text-[#242222] truncate">{userName}</div>
                                        <div className="text-[10px] text-[#70b03c] font-extrabold truncate">{roleTitles[userRole] || userRole}</div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition shrink-0 cursor-pointer"
                                    title="Log out"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            )}

            {/* MAIN APP CONTAINER */}
            <div className="flex flex-1 overflow-hidden">
                {/* SIDEBAR (DESKTOP) - CERAH & SAAS MODERN */}
                <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 shrink-0 h-[calc(100vh-65px)]">
                    <nav className="flex-1 p-3.5 space-y-1 overflow-y-auto">
                        {(userRole === 'owner' || userRole === 'finance' || userRole === 'admin_finance') && (
                            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all duration-150 cursor-pointer ${activeTab === 'dashboard' ? 'bg-[#1b68b0]/10 text-[#1b68b0] border border-[#1b68b0]/30 font-bold shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-[#242222]'}`}>
                                <BarChart3 className="w-4 h-4 shrink-0 text-[#1b68b0]" /> <span>Dashboard</span>
                            </button>
                        )}

                        {(userRole === 'admin_toko' || userRole === 'admin_gudang' || userRole === 'owner') && (
                            <button onClick={() => { setActiveTab('orders'); if (userRole === 'admin_gudang') setActiveOrderCard('pengerjaan'); }} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all duration-150 cursor-pointer ${activeTab === 'orders' ? 'bg-[#1b68b0]/10 text-[#1b68b0] border border-[#1b68b0]/30 font-bold shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-[#242222]'}`}>
                                <FileText className="w-4 h-4 shrink-0 text-[#1b68b0]" /> <span>Orderan</span>
                            </button>
                        )}

                        {(userRole === 'admin_toko' || userRole === 'admin_gudang' || userRole === 'owner' || userRole === 'driver') && (
                            <button onClick={() => setActiveTab('deliveries')} className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all duration-150 cursor-pointer ${activeTab === 'deliveries' ? 'bg-[#1b68b0]/10 text-[#1b68b0] border border-[#1b68b0]/30 font-bold shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-[#242222]'}`}>
                                <div className="flex items-center gap-3">
                                    <Truck className="w-4 h-4 shrink-0 text-[#1b68b0]" /> <span>Pengiriman</span>
                                </div>
                                <span className="bg-blue-50 text-[#1b68b0] border border-blue-200/80 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                                    {initialOrders.filter(o => o.status === 'pengiriman').length}
                                </span>
                            </button>
                        )}

                        {(userRole.startsWith('divisi_') || userRole === 'admin_gudang' || userRole === 'owner') && (
                            <button onClick={() => setActiveTab('production')} className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all duration-150 cursor-pointer ${activeTab === 'production' ? 'bg-[#1b68b0]/10 text-[#1b68b0] border border-[#1b68b0]/30 font-bold shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-[#242222]'}`}>
                                <div className="flex items-center gap-3">
                                    <Sliders className="w-4 h-4 shrink-0 text-[#1b68b0]" /> <span>Disposisi</span>
                                </div>
                                {(() => {
                                    if (!isDivisionWorker) return null;
                                    const pendingRevs = initialOrders.filter(o => o.current_division === userRole && o.revision_status === 'pending_division').length;

                                    if (pendingRevs > 0) {
                                        return (
                                            <span className="flex items-center gap-1 bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded-full text-[10px] font-bold" title={`${pendingRevs} order memiliki revisi yang butuh konfirmasi divisi`}>
                                                <AlertTriangle className="w-3 h-3 text-rose-500" />
                                                <span>{pendingRevs}</span>
                                            </span>
                                        );
                                    }
                                    return null;
                                })()}
                            </button>
                        )}

                        {(userRole === 'divisi_ht' || userRole === 'admin_gudang' || userRole === 'admin_toko' || userRole === 'owner') && (
                            <button onClick={() => setActiveTab('scrap')} className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all duration-150 cursor-pointer ${activeTab === 'scrap' ? 'bg-[#1b68b0]/10 text-[#1b68b0] border border-[#1b68b0]/30 font-bold shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-[#242222]'}`}>
                                <div className="flex items-center gap-3">
                                    <Boxes className="w-4 h-4 shrink-0 text-[#1b68b0]" /> <span>Kaca</span>
                                </div>
                                {sheetGlasses.filter(g => g.status === 'Pengajuan Proses Restock').length > 0 && (
                                    <span className="bg-amber-50 text-amber-700 border border-amber-200/80 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                                        {sheetGlasses.filter(g => g.status === 'Pengajuan Proses Restock').length}
                                    </span>
                                )}
                            </button>
                        )}

                        {(userRole === 'admin_toko' || userRole === 'owner') && (
                            <button onClick={() => setActiveTab('suppliers')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all duration-150 cursor-pointer ${activeTab === 'suppliers' ? 'bg-[#1b68b0]/10 text-[#1b68b0] border border-[#1b68b0]/30 font-bold shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-[#242222]'}`}>
                                <Building2 className="w-4 h-4 shrink-0 text-[#1b68b0]" /> <span>Supplier</span>
                            </button>
                        )}

                        {(userRole === 'admin_toko' || userRole === 'owner' || userRole === 'finance' || userRole === 'admin_finance') && (
                            <button onClick={() => setActiveTab('accessories')} className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all duration-150 cursor-pointer ${activeTab === 'accessories' ? 'bg-[#1b68b0]/10 text-[#1b68b0] border border-[#1b68b0]/30 font-bold shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-[#242222]'}`}>
                                <div className="flex items-center gap-3">
                                    <Plug className="w-4 h-4 shrink-0 text-[#1b68b0]" /> <span>Aksesoris</span>
                                </div>
                                {accessoriesList.filter(a => a.status === 'Menipis' || a.status === 'Habis' || a.status === 'Pengajuan Restock').length > 0 && (
                                    <span className="bg-amber-50 text-amber-700 border border-amber-200/80 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                                        {accessoriesList.filter(a => a.status === 'Menipis' || a.status === 'Habis' || a.status === 'Pengajuan Restock').length}
                                    </span>
                                )}
                            </button>
                        )}

                        {(userRole === 'admin_gudang' || userRole === 'owner' || userRole === 'admin_toko' || userRole === 'finance' || userRole === 'admin_finance') && (
                            <button onClick={() => setActiveTab('supplies')} className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all duration-150 cursor-pointer ${activeTab === 'supplies' ? 'bg-[#1b68b0]/10 text-[#1b68b0] border border-[#1b68b0]/30 font-bold shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-[#242222]'}`}>
                                <div className="flex items-center gap-3">
                                    <Archive className="w-4 h-4 shrink-0 text-[#1b68b0]" /> <span>Gudang</span>
                                </div>
                                {(supplyRestockRequests.filter(r => r.status !== 'Selesai Restok').length + warehouseSuppliesList.filter(s => s.status === 'Menipis' || s.status === 'Habis').length) > 0 && (
                                    <span className="bg-purple-50 text-purple-700 border border-purple-200/80 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping"></span>
                                        {supplyRestockRequests.filter(r => r.status !== 'Selesai Restok').length + warehouseSuppliesList.filter(s => s.status === 'Menipis' || s.status === 'Habis').length}
                                    </span>
                                )}
                            </button>
                        )}

                        {(userRole === 'admin_toko' || userRole === 'admin_gudang' || userRole === 'owner' || userRole.startsWith('divisi_') || userRole === 'driver' || userRole === 'finance' || userRole === 'admin_finance') && (
                            <button onClick={() => setActiveTab('tools')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all duration-150 cursor-pointer ${activeTab === 'tools' ? 'bg-[#1b68b0]/10 text-[#1b68b0] border border-[#1b68b0]/30 font-bold shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-[#242222]'}`}>
                                <Wrench className="w-4 h-4 shrink-0 text-[#1b68b0]" /> <span>Alat</span>
                            </button>
                        )}

                        {(userRole === 'hrd' || userRole === 'admin_finance' || userRole === 'finance' || userRole === 'owner') && (
                            <button onClick={() => setActiveTab('employees')} className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all duration-150 cursor-pointer ${activeTab === 'employees' ? 'bg-[#1b68b0]/10 text-[#1b68b0] border border-[#1b68b0]/30 font-bold shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-[#242222]'}`}>
                                <div className="flex items-center gap-3">
                                    <Users className="w-4 h-4 shrink-0 text-[#1b68b0]" /> <span>Karyawan</span>
                                </div>
                                <span className="bg-blue-50 text-[#1b68b0] border border-blue-200/80 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                                    {employeesList.length}
                                </span>
                            </button>
                        )}

                        {(userRole === 'owner' || userRole === 'finance' || userRole === 'admin_finance') && (
                            <button onClick={() => setActiveTab('finance')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all duration-150 cursor-pointer ${activeTab === 'finance' ? 'bg-[#1b68b0]/10 text-[#1b68b0] border border-[#1b68b0]/30 font-bold shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-[#242222]'}`}>
                                <CreditCard className="w-4 h-4 shrink-0 text-[#1b68b0]" /> <span>Finance</span>
                            </button>
                        )}
                    </nav>

                    {/* SIDEBAR FOOTER: USER PROFILE & LOGOUT */}
                    <div className="p-3.5 border-t border-slate-200 bg-slate-50/80 shrink-0">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-[#1b68b0] text-white font-black flex items-center justify-center text-xs shrink-0 shadow-xs">
                                    {userName ? userName.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-xs font-black text-[#242222] truncate" title={userName}>
                                        {userName}
                                    </div>
                                    <div className="text-[10px] text-[#70b03c] font-extrabold truncate">
                                        {roleTitles[userRole] || userRole}
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition shrink-0 cursor-pointer"
                                title="Log out"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </aside>

                {/* CONTENT MAIN */}
                <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto bg-[#F8FAFC] text-[#242222]">
                    <div key={activeTab} className="animate-tab-content">
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
                                handleOpenRevisionDetailModal={handleOpenRevisionDetailModal}
                                handleAcknowledgeRevision={handleAcknowledgeRevision}
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
                                handleOpenRevisionDetailModal={handleOpenRevisionDetailModal}
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
                                handleDeleteStockItem={handleDeleteStockItem}
                                handleOpenSketchLightbox={handleOpenSketchLightbox}
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
                                handleCompleteDelivery={handleCompleteDelivery}
                                handleOpenConfirmDeliveryModal={handleOpenConfirmDeliveryModal}
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
                                handleOpenSketchLightbox={handleOpenSketchLightbox}
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
                                handleOpenSketchLightbox={handleOpenSketchLightbox}
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
                                setBorrowToolForm={setBorrowToolForm}
                                handleOpenEditToolModal={handleOpenEditToolModal}
                                handleOpenReturnModal={handleOpenReturnModal}
                                handleStartRepair={handleStartRepair}
                                handleOpenCompleteRepairModal={handleOpenCompleteRepairModal}
                                handleOpenSketchLightbox={handleOpenSketchLightbox}
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
                    </div>
                </main>
            </div>

            {/* MODAL 1: ORDER BARU (ADMIN TOKO - 12 POINT SPEC) */}
            <NewOrderModal
                show={showNewOrderModal}
                onClose={() => setShowNewOrderModal(false)}
                isSubmittingOrder={isSubmittingOrder}
                submittingAction={submittingAction}
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
                isSubmittingOrder={isSubmittingOrder}
                submittingAction={submittingAction}
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
            <RestockStockModal
                show={showRestockModal}
                onClose={() => { setShowRestockModal(false); setSelectedStockItem(null); }}
                selectedStockItem={selectedStockItem}
            />

            {/* MODAL TAMBAH JENIS BARANG STOK BARU */}
            <AddStockModal
                show={showAddStockModal}
                onClose={() => setShowAddStockModal(false)}
                newStockForm={newStockForm}
                setNewStockForm={setNewStockForm}
                handleAddStockItemSubmit={handleAddStockItemSubmit}
                suppliersList={suppliersList}
                formatNumberDots={formatNumberDots}
                parseNumberDots={parseNumberDots}
            />

            {/* MODAL EDIT DATA & HARGA KACA */}
            <EditStockModal
                show={showEditStockModal}
                onClose={() => setShowEditStockModal(false)}
                editStockForm={editStockForm}
                setEditStockForm={setEditStockForm}
                handleEditStockSubmit={handleEditStockSubmit}
                suppliersList={suppliersList}
                formatNumberDots={formatNumberDots}
                parseNumberDots={parseNumberDots}
            />

            {/* MODAL TAMBAH KACA SISA POTONG (SCRAP WMS) */}
            <AddScrapModal
                show={showScrapModal}
                onClose={() => setShowScrapModal(false)}
                scrapForm={scrapForm}
                setScrapForm={setScrapForm}
                handleCreateScrap={handleCreateScrap}
                sheetGlasses={sheetGlasses}
            />

            {/* MODAL TAMBAH SUPPLIER BARU */}
            <AddSupplierModal
                show={showAddSupplierModal}
                onClose={() => setShowAddSupplierModal(false)}
            />

            {/* MODAL EDIT SUPPLIER */}
            <EditSupplierModal
                show={showEditSupplierModal}
                onClose={() => setShowEditSupplierModal(false)}
                supplier={editSupplierForm}
            />

            {/* MODAL TAMBAH AKSESORIS BARU */}
            <AddAccessoryModal
                show={showAddAccModal}
                onClose={() => setShowAddAccModal(false)}
            />

            {/* MODAL EDIT AKSESORIS */}
            <EditAccessoryModal
                show={showEditAccModal}
                onClose={() => setShowEditAccModal(false)}
                accessory={editAccForm}
            />

            {/* MODAL RESTOCK AKSESORIS */}
            <RestockAccessoryModal
                show={showRestockAccModal}
                onClose={() => { setShowRestockAccModal(false); setSelectedAccItem(null); }}
                selectedAccItem={selectedAccItem}
            />

            {/* MODAL SETUJUI RESTOCK & ORDER SUPPLIER VIA WHATSAPP */}
            <SupplierWaModal
                show={showSupplierWaModal}
                onClose={() => { setShowSupplierWaModal(false); setSelectedWaStockItem(null); }}
                selectedWaStockItem={selectedWaStockItem}
                suppliersList={suppliersList}
            />

            {/* MODAL KONFIRMASI PERSETUJUAN DEAL & PENGATURAN DP */}
            <PromoteOrderModal
                show={showPromoteModal}
                onClose={() => { setShowPromoteModal(false); setTargetPromoteOrder(null); }}
                targetPromoteOrder={targetPromoteOrder}
                onConfirmPromote={handleConfirmPromote}
            />

            {/* MODAL TAMBAH PERLENGKAPAN GUDANG BARU */}
            <AddSupplyModal
                show={showAddSupplyModal}
                onClose={() => setShowAddSupplyModal(false)}
            />

            {/* MODAL CATAT PEMAKAIAN PERLENGKAPAN OPERASIONAL */}
            <UseSupplyModal
                show={showUseSupplyModal}
                onClose={() => setShowUseSupplyModal(false)}
                suppliesList={warehouseSuppliesList}
                onSubmit={handleUseSupplySubmit}
            />

            {/* MODAL PENGAJUAN RESTOK PERLENGKAPAN GUDANG KE ADMIN TOKO */}
            <RequestRestockSupplyModal
                show={showRequestRestockModal}
                onClose={() => setShowRequestRestockModal(false)}
                suppliesList={warehouseSuppliesList}
            />

            {/* MODAL DETAIL REVISI ADMIN TOKO (BACA & KONFIRMASI) */}
            <RevisionDetailModal
                show={showRevisionDetailModal}
                onClose={() => { setShowRevisionDetailModal(false); setSelectedRevisionOrder(null); }}
                order={selectedRevisionOrder}
                onAcknowledge={(orderId) => {
                    handleAcknowledgeRevision(orderId);
                    setShowRevisionDetailModal(false);
                    setSelectedRevisionOrder(null);
                }}
            />

            {/* MODAL TAMBAH ALAT PENUNJANG BARU */}
            <AddToolModal
                show={showAddToolModal}
                onClose={() => setShowAddToolModal(false)}
            />

            {/* MODAL CATAT PEMINJAMAN ALAT */}
            <BorrowToolModal
                show={showBorrowToolModal}
                onClose={() => setShowBorrowToolModal(false)}
                toolsList={toolsList}
            />

            {/* MODAL KONFIRMASI PENGEMBALIAN ALAT */}
            <ReturnToolModal
                show={showReturnToolModal}
                onClose={() => { setShowReturnToolModal(false); setSelectedReturnBorrow(null); }}
                selectedReturnBorrow={selectedReturnBorrow}
            />

            {/* MODAL UPDATE KONDISI & STOK ALAT */}
            <EditToolModal
                show={showEditToolModal}
                onClose={() => { setShowEditToolModal(false); setSelectedToolForEdit(null); }}
                tool={selectedToolForEdit}
            />

            {/* MODAL FORM DETAIL PERBAIKAN SELESAI */}
            <CompleteRepairModal
                show={showCompleteRepairModal}
                onClose={() => { setShowCompleteRepairModal(false); setSelectedRepairTool(null); }}
                selectedRepairTool={selectedRepairTool}
            />

            {/* MODAL REKAP RINCIAN PEMILAHAN ORDERAN */}
            <SalesRekapModal
                show={showRekapModal}
                onClose={() => setShowRekapModal(false)}
                orders={orders}
                isDivisionWorker={isDivisionWorker}
                userRole={userRole}
                formatIndonesianDate={formatIndonesianDate}
                isDateInTimeRange={isDateInTimeRange}
            />

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

            {/* MODAL KONFIRMASI TERKIRIM & UPLOAD BUKTI SURAT JALAN TANDA TANGAN */}
            <ConfirmDeliveryModal
                isOpen={showConfirmDeliveryModal}
                onClose={() => { setShowConfirmDeliveryModal(false); setSelectedDeliveryOrder(null); }}
                order={selectedDeliveryOrder}
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

            {/* MODAL EKSEKUSI & DETAIL LENGKAP DIVISI OPERASIONAL */}
            <DivisionExecutionModal
                show={showExecutionModal}
                onClose={() => {
                    setShowExecutionModal(false);
                    setSelectedExecutionOrder(null);
                }}
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
                scrapGlasses={scrapGlasses}
                onRecordRawMaterialSuccess={handleRecordRawMaterialSuccess}
                onOpenStickerModal={handleOpenStickerModal}
            />

            {/* MODAL LAPOR KACA CACAT / BARET */}
            <ComplaintModal
                show={showComplaintModal}
                onClose={() => setShowComplaintModal(false)}
                selectedExecutionOrder={selectedExecutionOrder}
                userRole={userRole}
                form={complaintForm}
                setForm={setComplaintForm}
                onSubmit={handleSubmitComplaint}
                onPhotoChange={handleComplaintPhotoChange}
            />

            {/* GLOBAL SKETCH LIGHTBOX MODAL */}
            {sketchLightbox.isOpen && (
                <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
                    <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl text-slate-800">
                        <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-2xl bg-[#1b68b0]/10 flex items-center justify-center text-[#1b68b0]">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-base">
                                        Sketsa Pola & Gambar Sambungan Kaca
                                    </h3>
                                    <p className="text-xs text-slate-500 font-mono">No SPO: {sketchLightbox.title}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <a
                                    href={sketchLightbox.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    download
                                    className="bg-[#1b68b0] hover:bg-[#15528c] text-white font-bold px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Unduh Gambar</span>
                                </a>
                                <button
                                    onClick={() => setSketchLightbox({ isOpen: false, url: '', title: '' })}
                                    className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl p-1.5 transition cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 p-6 bg-slate-900 flex items-center justify-center overflow-auto">
                            <img
                                src={sketchLightbox.url}
                                alt="Detail Sketsa Kaca"
                                className="max-w-full max-h-[75vh] object-contain rounded-2xl border border-slate-700 shadow-2xl"
                            />
                        </div>
                        <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500 font-mono">
                            Acuan gambar sketsa pola fisik & posisi sambungan kaca untuk semua divisi operasional SYP Glass (Gudang, Potong, Gosok, Bevel, Etsa).
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
