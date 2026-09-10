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

export default function Dashboard({ orders: initialOrders = [], scrapGlasses: initialScrap = [], deliveries: initialDeliveries = [], metrics = {} }) {
    const { auth } = usePage().props;
    const userRole = auth.user?.role || 'admin_toko';
    const userName = auth.user?.name || 'User Syp';
    const userEmail = auth.user?.email || 'user@sypglass.co.id';
    const canViewPricing = userRole === 'admin_toko' || userRole === 'owner' || userRole === 'finance';

    const [activeTab, setActiveTab] = useState('dashboard');

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

    // Disposisi & Divisi Working Order & Execution Modal & Scrap Glass Popup State
    const [selectedWorkingOrder, setSelectedWorkingOrder] = useState(null);
    const [activeWorkingOrderId, setActiveWorkingOrderId] = useState(null);
    const [localStartTimes, setLocalStartTimes] = useState({});
    const [timerTick, setTimerTick] = useState(Date.now());
    const [activeCardNextDiv, setActiveCardNextDiv] = useState('QC_Ready');
    const [showExecutionModal, setShowExecutionModal] = useState(false);
    const [selectedExecutionOrder, setSelectedExecutionOrder] = useState(null);
    const [showScrapPopupModal, setShowScrapPopupModal] = useState(false);

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

    // Sketch Lightbox Modal State
    const [sketchLightbox, setSketchLightbox] = useState({ isOpen: false, url: '', title: '' });

    const handleOpenSketchLightbox = (path, title) => {
        if (!path) return;
        const fullUrl = path.startsWith('http') || path.startsWith('/') ? path : `/storage/${path}`;
        setSketchLightbox({ isOpen: true, url: fullUrl, title: title || 'Sketsa Kaca' });
    };

    const handleOpenComplaintModal = (order) => {
        setSelectedExecutionOrder(order);
        setComplaintForm({
            reason: 'Kaca Baret / Gores',
            notes: '',
            photo: null,
            photoPreview: null
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

    // Modal Tambah Jenis Barang Stok Baru State
    const [showAddStockModal, setShowAddStockModal] = useState(false);
    const [newStockForm, setNewStockForm] = useState({
        item_code: '',
        name: '',
        category: 'Kaca Cermin',
        size: '122 x 244 cm',
        thickness_mm: 5,
        buy_price: '',
        sell_price: '',
        qty: 0,
        unit: 'Lembar',
        supplier_name: 'PT Asahimas Flat Glass Tbk (Divisi Cermin)',
        supplier_phone: '6281234567890',
        supplier_pic: 'Pak Gunawan'
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
        setSupplyRestockRequests(prev => prev.map(r => {
            if (r.id === reqId) {
                return { ...r, status: 'Disetujui & Dipesan' };
            }
            return r;
        }));
        alert('✅ Pengajuan restok disetujui & status diubah menjadi Disetujui & Dipesan!');
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
            qty: 0,
            unit: 'Lembar',
            supplier_name: 'PT Asahimas Flat Glass Tbk (Divisi Cermin)',
            supplier_phone: '6281234567890',
            supplier_pic: 'Pak Gunawan'
        });
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
        }
    ]);

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

    const filteredSheetGlasses = sheetGlasses.filter(g => {
        const matchesSearch = g.item_code.toLowerCase().includes(stockSearchTerm.toLowerCase()) ||
            g.name.toLowerCase().includes(stockSearchTerm.toLowerCase()) ||
            g.category.toLowerCase().includes(stockSearchTerm.toLowerCase()) ||
            g.size.toLowerCase().includes(stockSearchTerm.toLowerCase());

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

        const itemType = (item.glass_type || '').toLowerCase();
        const itemThickness = extractThickness(item.glass_type);

        const candidates = [];
        scrapList.forEach(s => {
            if (s.status && s.status !== 'Layak Pakai') return;

            const sLen = parseFloat(s.length_cm) || 0;
            const sWid = parseFloat(s.width_cm) || 0;
            const y = calculateScrapYield(sLen, sWid, itemLen, itemWid);
            if (y <= 0) return;

            const sType = (s.glass_type || '').toLowerCase();
            const sThickness = extractThickness(s.glass_type);

            if (itemThickness && sThickness && itemThickness !== sThickness) return;

            const keywords = ['cermin', 'bening', 'riben', 'jumbo', 'es', 'tempered'];
            for (const kw of keywords) {
                if (itemType.includes(kw) && !sType.includes(kw)) return;
            }

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

        const holeL = parseDim(it.hole_length_cm) || 2;
        const holeW = parseDim(it.hole_width_cm) || 2;
        const holeQty = parseInt(it.hole_qty) || 1;
        const holeRuasCm = 2 * (holeL + holeW);
        const feeBor = procs.includes('Bor') ? Math.round(holeRuasCm * 2500) * holeQty * q : 0;

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
        divisi_ht: '✂️ Divisi HT (Potong)',
        divisi_gm: '✨ Divisi GM (Gosok)',
        divisi_bv: '💎 Divisi BV (Bevel)',
        divisi_etsa: '🌫️ Divisi Etsa (Blur)',
        driver: '🚚 Supir / Driver',
        owner: '📈 Owner & Akuntan'
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

        const divInfo = {
            'HT': { key: 'divisi_ht', code: 'HT', name: 'Divisi HT (Potong & Tempering)', icon: '✂️', bg: 'bg-rose-500/10 text-rose-300 border-rose-500/30' },
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
        const matchesSearch = o.spo_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
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
            <div className="bg-[#0c111d] border-b border-slate-800 px-6 py-2 flex justify-between items-center text-xs shrink-0">
                <div className="flex items-center gap-2">
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                        AUTHENTICATED ROLE LOGIN ACTIVE
                    </span>
                    <span className="text-slate-400">CV Cahya Karunia Jaya - Syp Operational</span>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-cyan-400 hover:underline flex items-center gap-1">🌐 Landing Page Public</Link>
                </div>
            </div>

            {/* HEADER */}
            <header className="bg-[#0b0f19]/80 backdrop-blur-md border-b border-slate-800 shrink-0 px-6 py-4 flex justify-between items-center z-40">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center text-slate-950 font-extrabold text-xl shadow-lg shadow-cyan-500/20">
                        ⚡
                    </div>
                    <div>
                        <h1 className="font-extrabold text-lg tracking-wider text-slate-100">SYP GLASS OPERATIONAL</h1>
                        <p className="text-xs text-slate-400 uppercase tracking-widest">Logged in as: {userName} ({userEmail})</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-lg text-xs font-bold text-cyan-400">
                        Role: {roleTitles[userRole] || userRole}
                    </div>
                    <button onClick={handleLogout} className="bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 font-bold px-4 py-1.5 rounded-lg text-xs transition">
                        🚪 Log out
                    </button>
                </div>
            </header>

            {/* MAIN APP CONTAINER */}
            <div className="flex flex-1 overflow-hidden">
                {/* SIDEBAR */}
                <aside className="w-64 bg-[#0c111d] border-r border-slate-800/80 p-4 space-y-2 shrink-0 overflow-y-auto">
                    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 mb-4 space-y-1">
                        <div className="text-xs text-slate-400">User Terautentikasi:</div>
                        <h4 className="font-bold text-sm text-slate-200">{userName}</h4>
                        <span className="inline-block text-[10px] text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full border border-cyan-400/20 font-bold">
                            {roleTitles[userRole]}
                        </span>
                    </div>

                    <nav className="space-y-1">
                        {userRole !== 'admin_gudang' && (
                            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-left transition ${activeTab === 'dashboard' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                                📊 <span>Dashboard Utama</span>
                            </button>
                        )}

                        {(userRole === 'admin_toko' || userRole === 'admin_gudang' || userRole === 'owner' || userRole === 'driver') && (
                            <button onClick={() => { setActiveTab('orders'); if (userRole === 'driver') setActiveOrderCard('pengiriman'); else if (userRole === 'admin_gudang') setActiveOrderCard('pengerjaan'); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-left transition ${activeTab === 'orders' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                                📝 <span>{userRole === 'admin_toko' || userRole === 'owner' ? 'Orderan & Draf' : 'Orderan Pengerjaan'}</span>
                            </button>
                        )}

                        {(userRole === 'admin_toko' || userRole === 'admin_gudang' || userRole === 'owner' || userRole === 'driver') && (
                            <button onClick={() => setActiveTab('deliveries')} className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold text-left transition ${activeTab === 'deliveries' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                                <div className="flex items-center gap-3">
                                    🚚 <span>Pengiriman Multi-Alamat</span>
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

                        {(userRole === 'admin_toko' || userRole === 'owner' || userRole === 'admin_gudang') && (
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

                        {(userRole === 'admin_gudang' || userRole === 'owner' || userRole === 'admin_toko') && (
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

                        {(userRole === 'admin_toko' || userRole === 'admin_gudang' || userRole === 'owner' || userRole.startsWith('divisi_')) && (
                            <button onClick={() => setActiveTab('tools')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-left transition ${activeTab === 'tools' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                                🛠️ <span>Alat Penunjang</span>
                            </button>
                        )}

                        {(userRole === 'owner' || userRole === 'admin_toko') && (
                            <button onClick={() => setActiveTab('finance')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-left transition ${activeTab === 'finance' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                                💰 <span>Finance & Laba/Rugi</span>
                            </button>
                        )}
                    </nav>
                </aside>

                {/* CONTENT MAIN */}
                <main className="flex-1 p-8 overflow-y-auto">

                    {/* TAB 1: DASHBOARD UTAMA - GRAFIK PENJUALAN & PERFORMANCE PERUSAHAAN */}
                    {activeTab === 'dashboard' && userRole !== 'admin_gudang' && (
                        <div className="space-y-6">
                            {/* WELCOME BANNER & PERFORMANCE HIGHLIGHT */}
                            <div className="flex flex-wrap justify-between items-center gap-4 bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 p-6 rounded-2xl border border-cyan-500/20 shadow-2xl">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs bg-cyan-500/20 text-cyan-300 font-extrabold px-3 py-1 rounded-full border border-cyan-500/30">
                                            📈 OPERATIONAL & SALES PERFORMANCE ANALYTICS
                                        </span>
                                        <span className="text-xs text-slate-400 font-mono">📅 Periode 2026</span>
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-100 tracking-tight">Selamat Datang, {userName}!</h2>
                                    <p className="text-slate-400 text-xs mt-0.5">
                                        {canViewPricing
                                            ? 'Monitoring Penjualan Kaca, Omset Usaha, dan Performa Divisi Pengerjaan SYP GLASS.'
                                            : 'Monitoring Pengerjaan Kaca, Alur Disposisi Antar Divisi, dan Kinerja Operasional SYP GLASS.'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setActiveTab('orders')}
                                        className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs transition shadow-lg shadow-cyan-500/20 flex items-center gap-2"
                                    >
                                        ✨ + Orderan Baru
                                    </button>
                                    {(userRole === 'owner' || userRole === 'admin_toko') && (
                                        <button
                                            onClick={() => setActiveTab('finance')}
                                            className="bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold px-4 py-2.5 rounded-xl text-xs transition border border-emerald-500/30 flex items-center gap-2"
                                        >
                                            💰 Laporan Keuangan
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* 4 SUMMARY METRIC CARDS */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                                <div className="bg-slate-900/80 border-l-4 border-cyan-500 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden group">
                                    <div className="absolute -right-3 -bottom-3 text-6xl opacity-10 group-hover:scale-110 transition">📊</div>
                                    <span className="text-xs text-slate-400 font-semibold block">Total Volume SPO Orderan</span>
                                    <h3 className="text-3xl font-extrabold text-cyan-400 mt-1">{metrics.totalOrders} SPO</h3>
                                    <span className="text-[11px] text-emerald-400 font-bold mt-2 inline-flex items-center gap-1">
                                        📈 +14.3% vs Bulan Lalu
                                    </span>
                                </div>

                                {canViewPricing ? (
                                    <div className="bg-slate-900/80 border-l-4 border-emerald-500 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden group">
                                        <div className="absolute -right-3 -bottom-3 text-6xl opacity-10 group-hover:scale-110 transition">💵</div>
                                        <span className="text-xs text-slate-400 font-semibold block">Estimasi Omset Penjualan (Bulan Ini)</span>
                                        <h3 className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">Rp 128.500.000</h3>
                                        <span className="text-[11px] text-emerald-400 font-bold mt-2 inline-flex items-center gap-1">
                                            🚀 Peak Omset Tertinggi 2026
                                        </span>
                                    </div>
                                ) : (
                                    <div className="bg-slate-900/80 border-l-4 border-emerald-500 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden group">
                                        <div className="absolute -right-3 -bottom-3 text-6xl opacity-10 group-hover:scale-110 transition">🛠️</div>
                                        <span className="text-xs text-slate-400 font-semibold block">Output Pengerjaan Selesai (Bulan Ini)</span>
                                        <h3 className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">
                                            {initialOrders.filter(o => o.status === 'selesai' || o.current_division === 'QC_Ready').length > 0
                                                ? `${initialOrders.filter(o => o.status === 'selesai' || o.current_division === 'QC_Ready').length} SPO Selesai`
                                                : '48 SPO Selesai'}
                                        </h3>
                                        <span className="text-[11px] text-emerald-400 font-bold mt-2 inline-flex items-center gap-1">
                                            🚀 Kualitas & SLA On-Time 98.5%
                                        </span>
                                    </div>
                                )}

                                <div className="bg-slate-900/80 border-l-4 border-amber-500 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden group">
                                    <div className="absolute -right-3 -bottom-3 text-6xl opacity-10 group-hover:scale-110 transition">⚙️</div>
                                    <span className="text-xs text-slate-400 font-semibold block">Pesanan Aktif Dalam Divisi</span>
                                    <h3 className="text-3xl font-extrabold text-amber-400 mt-1">{metrics.inProcess} SPO</h3>
                                    <span className="text-[11px] text-cyan-300 font-medium mt-2 block">
                                        HT: 2 | GM: 1 | BV: 1 | Etsa: 1
                                    </span>
                                </div>

                                <div className="bg-slate-900/80 border-l-4 border-purple-500 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden group">
                                    <div className="absolute -right-3 -bottom-3 text-6xl opacity-10 group-hover:scale-110 transition">🏆</div>
                                    <span className="text-xs text-slate-400 font-semibold block">Efisiensi Performance Perusahaan</span>
                                    <h3 className="text-3xl font-extrabold text-purple-400 mt-1">96.5%</h3>
                                    <span className="text-[11px] text-purple-300 font-bold mt-2 block">
                                        ✅ Target Fulfillment Terpenuhi
                                    </span>
                                </div>
                            </div>

                            {/* MAIN CHARTS SECTION: GRAFIK TREN PENJUALAN & PERFORMANCE PRODUK */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                                {/* GRAFIK 1: TREN PENJUALAN BULANAN (BAR & TREND VISUAL) */}
                                <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
                                    <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-800 pb-4">
                                        <div>
                                            <h3 className="font-extrabold text-slate-100 text-lg flex items-center gap-2">
                                                {canViewPricing ? '📊 Grafik Penjualan & Pertumbuhan Omset (Jan - Agu 2026)' : '📊 Tren Volume Pengerjaan & Produksi (Jan - Agu 2026)'}
                                            </h3>
                                            <p className="text-xs text-slate-400">
                                                {canViewPricing ? 'Tren penjualan bulanan kaca cermin, tempered, dan aksesoris.' : 'Tren volume bulanan pengerjaan kaca cermin, tempered, dan aksesoris.'}
                                            </p>
                                        </div>

                                        {canViewPricing && (
                                            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                                                <button
                                                    onClick={() => setDashboardChartMetric('revenue')}
                                                    className={`px-3 py-1.5 rounded-lg transition font-bold ${dashboardChartMetric === 'revenue' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
                                                >
                                                    💵 Omset (Rp)
                                                </button>
                                                <button
                                                    onClick={() => setDashboardChartMetric('orders')}
                                                    className={`px-3 py-1.5 rounded-lg transition font-bold ${dashboardChartMetric === 'orders' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
                                                >
                                                    📦 Vol SPO
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* VISUAL BAR CHART DISPLAY */}
                                    <div className="pt-4 pb-2">
                                        <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-slate-800 pb-2">
                                            {[
                                                { month: 'Jan', revenue: 48.5, spo: 22, rpText: 'Rp 48.5M', growth: '+12%' },
                                                { month: 'Feb', revenue: 59.2, spo: 28, rpText: 'Rp 59.2M', growth: '+22%' },
                                                { month: 'Mar', revenue: 67.8, spo: 32, rpText: 'Rp 67.8M', growth: '+14%' },
                                                { month: 'Apr', revenue: 61.5, spo: 26, rpText: 'Rp 61.5M', growth: '-9%' },
                                                { month: 'Mei', revenue: 84.3, spo: 39, rpText: 'Rp 84.3M', growth: '+37%' },
                                                { month: 'Jun', revenue: 96.7, spo: 44, rpText: 'Rp 96.7M', growth: '+14%' },
                                                { month: 'Jul', revenue: 112.4, spo: 51, rpText: 'Rp 112.4M', growth: '+16%' },
                                                { month: 'Agu', revenue: 128.5, spo: 58, rpText: 'Rp 128.5M', growth: '+14.3%', isPeak: true },
                                            ].map((item, idx) => {
                                                const maxRev = 140;
                                                const maxSpo = 70;
                                                const heightPct = (canViewPricing && dashboardChartMetric === 'revenue')
                                                    ? Math.round((item.revenue / maxRev) * 100)
                                                    : Math.round((item.spo / maxSpo) * 100);

                                                return (
                                                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                                                        {/* HOVER TOOLTIP */}
                                                        <div className="opacity-0 group-hover:opacity-100 transition duration-200 absolute -top-12 bg-slate-950 border border-cyan-400/50 text-slate-100 text-[11px] font-mono px-2.5 py-1.5 rounded-lg shadow-2xl z-20 pointer-events-none whitespace-nowrap text-center">
                                                            <div className="font-bold text-cyan-300">{item.month} 2026</div>
                                                            <div>{canViewPricing && dashboardChartMetric === 'revenue' ? `${item.rpText} • ` : ''}{item.spo} SPO ({item.growth})</div>
                                                        </div>

                                                        {/* VALUE LABEL ABOVE BAR */}
                                                        <span className={`text-[10px] font-mono font-bold ${item.isPeak ? 'text-cyan-300' : 'text-slate-400'}`}>
                                                            {canViewPricing && dashboardChartMetric === 'revenue' ? item.rpText : `${item.spo} SPO`}
                                                        </span>

                                                        {/* GRADIENT BAR */}
                                                        <div className="w-full bg-slate-950 rounded-t-xl overflow-hidden flex items-end h-48 p-0.5 border border-slate-800/60">
                                                            <div
                                                                style={{ height: `${heightPct}%` }}
                                                                className={`w-full rounded-t-lg transition-all duration-700 ${item.isPeak ? 'bg-gradient-to-t from-cyan-600 via-teal-400 to-emerald-300 shadow-lg shadow-cyan-500/30' : 'bg-gradient-to-t from-slate-800 via-blue-900 to-cyan-500/80 group-hover:from-cyan-700 group-hover:to-cyan-400'}`}
                                                            >
                                                                {item.isPeak && (
                                                                    <div className="text-[9px] text-slate-950 font-black text-center pt-1 animate-pulse">🔥</div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* MONTH LABEL */}
                                                        <span className={`text-xs font-bold ${item.isPeak ? 'text-cyan-400 font-extrabold' : 'text-slate-400'}`}>
                                                            {item.month}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* FOOTER STATS IN CHART CARD */}
                                    <div className="grid grid-cols-3 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
                                        <div>
                                            <span className="text-slate-400 text-[11px]">{canViewPricing ? 'Rata-rata Omset/Bulan:' : 'Rata-rata Order/Bulan:'}</span>
                                            <div className="font-extrabold text-slate-100 font-mono text-sm">{canViewPricing ? 'Rp 82.350.000' : '38.6 SPO'}</div>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 text-[11px]">{canViewPricing ? 'Bulan Tertinggi (Peak):' : 'Bulan Tersibuk (Peak):'}</span>
                                            <div className="font-extrabold text-cyan-400 font-mono text-sm">{canViewPricing ? 'Agustus (Rp 128.5M)' : 'Agustus (58 SPO)'}</div>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 text-[11px]">{canViewPricing ? 'Pertumbuhan Tahunan:' : 'Efisiensi Produksi:'}</span>
                                            <div className="font-extrabold text-emerald-400 font-mono text-sm">{canViewPricing ? '+38.5% YoY' : '+38.5% Target'}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* GRAFIK 2: DIAGRAM DONAT / LINGKARAN KONTRIBUSI PRODUK KACA */}
                                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                                            <div>
                                                <h3 className="font-extrabold text-slate-100 text-base flex items-center gap-2">
                                                    🎯 {canViewPricing ? 'Kontribusi Penjualan Per Jenis Kaca' : 'Distribusi Volume Jenis Kaca'}
                                                </h3>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    {canViewPricing ? 'Distribusi omset berdasarkan jenis produk kaca utama.' : 'Distribusi proporsi pengerjaan berdasarkan jenis produk kaca.'}
                                                </p>
                                            </div>
                                            <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-300 px-2 py-1 rounded-lg border border-cyan-500/20 font-bold">
                                                Donut Chart
                                            </span>
                                        </div>

                                        {/* DONUT CHART SVG VISUALIZATION */}
                                        <div className="flex flex-col items-center justify-center pt-4 pb-2">
                                            <div className="relative w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center">
                                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                                                    <defs>
                                                        <filter id="donut-glow" x="-20%" y="-20%" width="140%" height="140%">
                                                            <feGaussianBlur stdDeviation="3" result="blur" />
                                                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                                        </filter>
                                                    </defs>

                                                    {/* Track Background */}
                                                    <circle
                                                        cx="100"
                                                        cy="100"
                                                        r="65"
                                                        fill="transparent"
                                                        stroke="#0f172a"
                                                        strokeWidth="20"
                                                    />

                                                    {/* Donut Segments */}
                                                    {donutSlices.map((cat) => {
                                                        const isHovered = hoveredDonutSegment?.id === cat.id;
                                                        return (
                                                            <circle
                                                                key={cat.id}
                                                                cx="100"
                                                                cy="100"
                                                                r="65"
                                                                fill="transparent"
                                                                stroke={cat.color}
                                                                strokeWidth={isHovered ? 26 : 20}
                                                                strokeDasharray={cat.strokeDasharray}
                                                                strokeDashoffset={cat.strokeDashoffset}
                                                                strokeLinecap="round"
                                                                filter={isHovered ? 'url(#donut-glow)' : undefined}
                                                                opacity={hoveredDonutSegment && !isHovered ? 0.45 : 1}
                                                                className="transition-all duration-300 cursor-pointer"
                                                                onMouseEnter={() => setHoveredDonutSegment(cat)}
                                                                onMouseLeave={() => setHoveredDonutSegment(null)}
                                                            />
                                                        );
                                                    })}
                                                </svg>

                                                {/* Donut Center Hole Content */}
                                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-4">
                                                    <div className="w-24 h-24 rounded-full bg-slate-950/90 border border-slate-800 shadow-inner flex flex-col items-center justify-center p-1.5 transition-all duration-300">
                                                        {hoveredDonutSegment ? (
                                                            <>
                                                                <span className="text-xl font-black font-mono leading-none tracking-tight" style={{ color: hoveredDonutSegment.color }}>
                                                                    {hoveredDonutSegment.percent}%
                                                                </span>
                                                                <span className="text-[10px] text-slate-200 font-bold truncate max-w-[80px] mt-1">
                                                                    {hoveredDonutSegment.shortLabel}
                                                                </span>
                                                                <span className="text-[9px] text-slate-400 font-mono">
                                                                    {canViewPricing ? hoveredDonutSegment.rp : hoveredDonutSegment.volume}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="text-lg leading-none mb-0.5">🪟</span>
                                                                <span className="text-sm font-black text-slate-100 font-mono leading-none">
                                                                    {canViewPricing ? 'Rp 128.5M' : '58 SPO'}
                                                                </span>
                                                                <span className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wider font-semibold">
                                                                    {canViewPricing ? 'Total Omset' : 'Total Order'}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* DONUT LEGEND ITEMS */}
                                            <div className="w-full space-y-1.5 mt-4">
                                                {donutSlices.map((cat) => {
                                                    const isHovered = hoveredDonutSegment?.id === cat.id;
                                                    return (
                                                        <div
                                                            key={cat.id}
                                                            onMouseEnter={() => setHoveredDonutSegment(cat)}
                                                            onMouseLeave={() => setHoveredDonutSegment(null)}
                                                            className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer border ${isHovered
                                                                ? 'bg-slate-800/90 border-cyan-500/50 shadow-md scale-[1.01]'
                                                                : 'bg-slate-950/70 border-slate-800/70 hover:bg-slate-900/80 hover:border-slate-700'
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-2.5 min-w-0">
                                                                <span
                                                                    className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-transform duration-200"
                                                                    style={{
                                                                        backgroundColor: cat.color,
                                                                        boxShadow: isHovered ? `0 0 10px ${cat.color}` : 'none',
                                                                        transform: isHovered ? 'scale(1.3)' : 'scale(1)'
                                                                    }}
                                                                ></span>
                                                                <span className="text-xs text-slate-300 font-medium truncate">{cat.label}</span>
                                                            </div>
                                                            <div className="text-right flex-shrink-0 ml-2 font-mono">
                                                                <span className="font-extrabold text-xs" style={{ color: cat.color }}>{cat.percent}%</span>
                                                                {canViewPricing ? (
                                                                    <span className="text-[10px] text-slate-400 block font-normal">{cat.rp}</span>
                                                                ) : (
                                                                    <span className="text-[10px] text-slate-400 block font-normal">{cat.volume}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* DIVISIONAL PERFORMANCE RATING */}
                                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                                        <h4 className="font-bold text-xs text-amber-400 flex items-center justify-between">
                                            <span>⚡ Kinerja Pengerjaan Divisi (SLA On-Time)</span>
                                            <span className="text-emerald-400 font-mono">96.5% Avg</span>
                                        </h4>
                                        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                                            <div className="bg-slate-900 p-2 rounded border border-slate-800 flex justify-between">
                                                <span className="text-slate-400">✂️ Div HT</span>
                                                <span className="text-emerald-400 font-bold">98.5%</span>
                                            </div>
                                            <div className="bg-slate-900 p-2 rounded border border-slate-800 flex justify-between">
                                                <span className="text-slate-400">✨ Div GM</span>
                                                <span className="text-cyan-400 font-bold">96.2%</span>
                                            </div>
                                            <div className="bg-slate-900 p-2 rounded border border-slate-800 flex justify-between">
                                                <span className="text-slate-400">💎 Div BV</span>
                                                <span className="text-amber-400 font-bold">95.0%</span>
                                            </div>
                                            <div className="bg-slate-900 p-2 rounded border border-slate-800 flex justify-between">
                                                <span className="text-slate-400">🚚 Driver</span>
                                                <span className="text-purple-400 font-bold">97.8%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}

                    {/* TAB 2: ORDERAN SINGLE ROUTE */}
                    {activeTab === 'orders' && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h2 className="text-2xl font-extrabold text-slate-100">{userRole === 'admin_toko' || userRole === 'owner' ? 'Menu Orderan & Draf' : 'Menu Orderan Pengerjaan'}</h2>
                                    <p className="text-slate-400 text-sm">{userRole === 'admin_toko' || userRole === 'owner' ? 'Kelola orderan baru, draf negosiasi, dan disposisi pengerjaan' : 'Kelola orderan aktif pengerjaan, pengiriman, dan disposisi'}</p>
                                </div>
                            </div>

                            {/* DYNAMIC CARDS HEADER */}
                            <div className={`grid ${userRole === 'admin_toko' || userRole === 'owner' ? 'grid-cols-5' : 'grid-cols-4'} gap-4`}>
                                {[
                                    ...(userRole === 'admin_toko' || userRole === 'owner' ? [
                                        { key: 'draft', label: 'Draf (Belum Deal)', count: initialOrders.filter(o => o.status === 'draft').length, icon: '📄' }
                                    ] : []),
                                    { key: 'pengerjaan', label: 'Order Pengerjaan', count: initialOrders.filter(o => o.status === 'pengerjaan').length, icon: '⚙️' },
                                    { key: 'pengiriman', label: 'Pengiriman & Surat Jalan', count: initialOrders.filter(o => o.status === 'pengiriman').length, icon: '🚚' },
                                    { key: 'pembayaran', label: 'Pembayaran / COD', count: initialOrders.filter(o => o.payment_status !== 'Lunas' && (userRole === 'admin_toko' || userRole === 'owner' ? true : o.status !== 'draft')).length, icon: '💵' },
                                    { key: 'selesai', label: 'Selesai', count: initialOrders.filter(o => o.status === 'selesai').length, icon: '✅' },
                                ].map(card => (
                                    <div
                                        key={card.key}
                                        onClick={() => {
                                            if (card.key === 'pengiriman') {
                                                setActiveTab('deliveries');
                                            } else {
                                                setActiveOrderCard(card.key);
                                            }
                                        }}
                                        className={`cursor-pointer border rounded-xl p-4 text-center transition ${activeOrderCard === card.key ? 'bg-cyan-500/15 border-cyan-400 text-slate-100 shadow-lg shadow-cyan-500/10' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/40'}`}
                                    >
                                        <div className="text-2xl font-black text-cyan-400">{card.count}</div>
                                        <div className="text-xs font-semibold mt-1">{card.icon} {card.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* CREATE ORDER BUTTON DIRECTLY BELOW DRAFT CARD */}
                            {(userRole === 'admin_toko' || userRole === 'owner') && (
                                <div className="flex justify-start">
                                    <button
                                        onClick={handleOpenNewOrderModal}
                                        className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black px-5 py-2.5 rounded-xl shadow-xl shadow-emerald-500/20 text-sm flex items-center gap-2 transition transform hover:scale-105 border border-cyan-300/50"
                                    >
                                        <span className="text-base">✨</span> + Orderan Baru
                                    </button>
                                </div>
                            )}

                            {/* ACTION HEADER DIRECTLY ABOVE TABLE */}
                            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
                                <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-800 pb-3">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-bold text-slate-100 text-base">
                                            {activeOrderCard === 'draft' && '📄 Tabel Draf Orderan (Belum Deal / DP)'}
                                            {activeOrderCard === 'pengerjaan' && '⚙️ Tabel Orderan Aktif Pengerjaan Divisi Pabrik'}
                                            {activeOrderCard === 'pengiriman' && '🚚 Tabel Orderan Pengiriman Armada & Penerbitan Surat Jalan'}
                                            {activeOrderCard === 'pembayaran' && '💵 Tabel Status Pembayaran & Tagihan COD'}
                                            {activeOrderCard === 'selesai' && '✅ Tabel Arsip Orderan Selesai & Terkirim'}
                                        </h3>
                                        <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2.5 py-1 rounded-full border border-cyan-500/20 font-mono font-bold">
                                            {filteredOrders.length} Items
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <input
                                            type="text"
                                            placeholder="🔍 Cari SPO / Customer..."
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {activeOrderCard === 'pengiriman' && (
                                    <div className="bg-gradient-to-r from-cyan-950 to-blue-950 border-2 border-cyan-500/50 p-4 rounded-xl text-xs text-cyan-100 flex flex-wrap justify-between items-center gap-3 shadow-lg">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl animate-bounce">🚚</span>
                                            <div>
                                                <strong className="text-cyan-300 text-sm font-extrabold block">Fitur Baru: Penugasan Mobil Multi-Alamat & Rute Manifest</strong>
                                                <p className="text-slate-300 text-xs">Admin dapat memilih beberapa alamat tujuan konsumen sekaligus untuk diangkut 1 armada & supir, serta mencetak Rute Manifest Multi-Stop.</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setActiveTab('deliveries')}
                                            className="bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black px-4 py-2 rounded-lg transition shadow-lg shadow-cyan-400/20 flex items-center gap-1.5 cursor-pointer text-xs shrink-0"
                                        >
                                            🚀 Buka Panel Penugasan Multi-Alamat
                                        </button>
                                    </div>
                                )}

                                {activeOrderCard === 'selesai' && (
                                    <div className="bg-emerald-950/60 border border-emerald-500/40 p-3 rounded-xl text-xs text-emerald-200 flex flex-wrap justify-between items-center gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-base">✅</span>
                                            <span>
                                                <strong>Fitur Order Selesai:</strong> Seluruh orderan di tabel ini telah sukses dikirim dan dikonfirmasi diterima konsumen. Dokumen Surat Jalan dapat dicetak ulang kapan saja sebagai arsip transaksi.
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-800/40 text-slate-400 uppercase text-xs">
                                            <tr>
                                                <th className="p-3">No SPO</th>
                                                <th className="p-3">Customer</th>
                                                <th className="p-3">Spesifikasi Kaca</th>
                                                <th className="p-3">Posisi Divisi & Tracking Progres</th>
                                                <th className="p-3">Total Tagihan</th>
                                                <th className="p-3">Status Bayar</th>
                                                <th className="p-3">Aksi Alur</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800">
                                            {filteredOrders.map(o => (
                                                <tr key={o.id} className="hover:bg-slate-800/30">
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <div className="font-bold text-cyan-400 font-mono text-sm">{o.spo_number}</div>
                                                            {o.is_revised && (
                                                                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1 font-mono shadow-sm" title="Orderan ini memiliki riwayat revisi">
                                                                    🔔 Telah Direvisi ({o.revision_count || 1}x)
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="mt-1.5 space-y-1 text-[11px] font-mono">
                                                            <div className="text-slate-300 flex items-center gap-1" title="1. Tanggal Pembuatan / Input Draf (Admin Toko)">
                                                                <span className="text-cyan-400">📅 Input Toko:</span>
                                                                <span>{formatIndonesianDate(o.order_date)}</span>
                                                            </div>
                                                            {o.gudang_released_at && (
                                                                <div className="text-blue-300 flex items-center gap-1 text-[10px]" title="2. Tanggal Diturunkan / Disposisi Admin Gudang ke Divisi">
                                                                    <span>📦 Disposisi Gudang:</span>
                                                                    <span>{formatIndonesianDateTime(o.gudang_released_at)}</span>
                                                                </div>
                                                            )}
                                                            {o.execution_completed_at && (
                                                                <div className="text-emerald-300 flex items-center gap-1 text-[10px]" title="3. Tanggal Selesai Eksekusi Kaca & Lolos QC Pabrik">
                                                                    <span>⚙️ Selesai Pabrik:</span>
                                                                    <span>{formatIndonesianDateTime(o.execution_completed_at)}</span>
                                                                </div>
                                                            )}
                                                            {o.shipped_at && (
                                                                <div className="text-cyan-300 flex items-center gap-1 text-[10px]" title="4. Tanggal Mulai Pengiriman Armada / Surat Jalan">
                                                                    <span>🚚 Mulai Kirim:</span>
                                                                    <span>{formatIndonesianDateTime(o.shipped_at)}</span>
                                                                </div>
                                                            )}
                                                            {o.delivered_at && (
                                                                <div className="text-emerald-400 flex items-center gap-1 text-[10px] font-bold" title="5. Tanggal Selesai Terkirim & Diterima Konsumen">
                                                                    <span>✅ Selesai Terkirim:</span>
                                                                    <span>{formatIndonesianDateTime(o.delivered_at)}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="font-bold">{o.customer_name}</div>
                                                        <div className="text-xs text-slate-400">{o.customer_phone}</div>
                                                    </td>
                                                    <td className="p-3 space-y-1 max-w-xs">
                                                        {Array.isArray(o.items) && o.items.length > 0 ? (
                                                            <div className="space-y-1">
                                                                {o.items.map((it, idx) => (
                                                                    <div key={idx} className="bg-slate-950/60 p-2 rounded border border-slate-800 text-xs space-y-1">

                                                                        <div className="font-bold text-cyan-300">
                                                                            #{idx + 1}. {it.glass_type}
                                                                        </div>
                                                                        <div className="text-xs text-slate-100 font-mono font-bold">
                                                                            {it.length_cm} x {it.width_cm} = {it.qty || 1}
                                                                        </div>
                                                                        <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between gap-1">
                                                                            <span>{it.thickness_mm} mm</span>
                                                                            {Array.isArray(it.processes) && it.processes.length > 0 && (
                                                                                <div className="flex flex-wrap gap-1">
                                                                                    {it.processes.map(p => (
                                                                                        <span key={p} className="text-[9px] bg-cyan-500/20 text-cyan-300 font-bold px-1.5 py-0.5 rounded border border-cyan-500/30">
                                                                                            {p}
                                                                                        </span>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="font-semibold text-slate-200">{o.glass_type}</div>
                                                                <div className="text-xs text-slate-400 font-mono">
                                                                    {o.length_cm} x {o.width_cm} cm | {o.thickness_mm} mm
                                                                </div>
                                                                <div className="flex flex-wrap gap-1 pt-0.5">
                                                                    {Array.isArray(o.processes) && o.processes.map(p => (
                                                                        <span key={p} className="text-[10px] bg-cyan-500/20 text-cyan-300 font-bold px-1.5 py-0.5 rounded border border-cyan-500/30">
                                                                            {p}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </>
                                                        )}

                                                        {o.sketch_photo_path && (
                                                            <div className="mt-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleOpenSketchLightbox(o.sketch_photo_path, o.spo_number)}
                                                                    className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-lg p-1.5 flex items-center justify-between gap-2 text-xs transition shadow-sm cursor-pointer"
                                                                    title="Klik untuk memperbesar gambar sketsa pola & sambungan kaca"
                                                                >
                                                                    <div className="flex items-center gap-1.5 overflow-hidden">
                                                                        <img
                                                                            src={o.sketch_photo_path.startsWith('http') || o.sketch_photo_path.startsWith('/') ? o.sketch_photo_path : `/storage/${o.sketch_photo_path}`}
                                                                            alt="Sketsa Pola"
                                                                            className="w-8 h-8 rounded object-cover border border-cyan-400/50 bg-slate-900 shrink-0"
                                                                        />
                                                                        <span className="font-bold text-[11px] truncate">📐 Sketsa Sambungan Kaca</span>
                                                                    </div>
                                                                    <span className="text-[10px] bg-cyan-400/20 text-cyan-200 px-1.5 py-0.5 rounded font-mono font-bold shrink-0">🔍 Lihat</span>
                                                                </button>
                                                            </div>
                                                        )}

                                                        {Array.isArray(o.accessories) && o.accessories.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 pt-1">
                                                                {o.accessories.map((a, accIdx) => {
                                                                    const isObj = typeof a === 'object' && a !== null;
                                                                    const accName = isObj ? (a.name || 'Aksesoris') : a;
                                                                    const accQty = isObj && a.qty ? ` (${a.qty}x)` : '';
                                                                    return (
                                                                        <span key={accIdx} className="text-[10px] bg-blue-500/20 text-blue-300 font-semibold px-1.5 py-0.5 rounded border border-blue-500/30">
                                                                            +{accName}{accQty}
                                                                        </span>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}

                                                        {o.description && (
                                                            <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-xs">
                                                                <span className="font-bold flex items-center gap-1 text-amber-400 text-[11px] mb-0.5">
                                                                    📝 Catatan / Revisi:
                                                                </span>
                                                                <div className="text-slate-200 font-medium whitespace-pre-wrap text-[11px] leading-relaxed">
                                                                    {o.description}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-3">
                                                        {renderProgressTracker(o)}
                                                    </td>
                                                    <td className="p-3 font-bold">
                                                        {canViewPricing ? (
                                                            `Rp ${Number(o.total_price).toLocaleString()}`
                                                        ) : (
                                                            <span className="text-slate-500 text-xs italic flex items-center gap-1 font-normal">🔒 Rahasia</span>
                                                        )}
                                                    </td>
                                                    <td className="p-3">
                                                        {canViewPricing ? (
                                                            <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${o.payment_status === 'Lunas' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : o.payment_status === 'DP (50%)' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-700 text-slate-300'}`}>
                                                                {o.payment_status}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-500 text-xs italic font-normal">🔒 Terverifikasi</span>
                                                        )}
                                                    </td>
                                                    <td className="p-3 flex flex-wrap items-center gap-2">
                                                        {o.status === 'draft' && (
                                                            (userRole === 'admin_toko' || userRole === 'owner') ? (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleOpenEditModal(o)}
                                                                        className="bg-[#2563EB] hover:bg-blue-600 text-white font-bold px-3 py-1.5 rounded text-xs transition flex items-center gap-1 shadow-md shadow-blue-500/20 cursor-pointer"
                                                                    >
                                                                        ✏️ Edit Draf
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleOpenPromoteModal(o)}
                                                                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded text-xs transition flex items-center gap-1 shadow-md shadow-emerald-500/20 cursor-pointer"
                                                                    >
                                                                        ✅ Setuju & DP (50%)
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20 text-xs font-semibold flex items-center gap-1">
                                                                    <i className="bi bi-hourglass-split"></i> Draf Toko (Belum DP)
                                                                </span>
                                                            )
                                                        )}

                                                        {o.status === 'pengerjaan' && (userRole === 'admin_toko' || userRole === 'owner') && (
                                                            <button
                                                                onClick={() => handleOpenEditModal(o)}
                                                                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold px-3 py-1.5 rounded text-xs transition flex items-center gap-1 shadow-md shadow-amber-500/20 cursor-pointer"
                                                                title="Klik untuk merevisi deskripsi, foto sketsa project, atau dimensi/spesifikasi item kaca"
                                                            >
                                                                🔄 Revisi / Edit Order
                                                            </button>
                                                        )}

                                                        {o.status === 'pengerjaan' && o.current_division === 'admin_gudang' && (userRole === 'admin_gudang' || userRole === 'owner') && (
                                                            o.revision_status === 'editing' ? (
                                                                <button
                                                                    disabled
                                                                    className="bg-slate-800 text-slate-400 font-extrabold px-3 py-1.5 rounded text-xs cursor-not-allowed opacity-75 flex items-center gap-1.5 shadow-inner"
                                                                    title="Tombol terblokir sementara karena Admin Toko sedang mengedit/merevisi orderan ini"
                                                                >
                                                                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                                                                    <span>🔒 Terkunci (Sedang Direvisi Toko...)</span>
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleOpenDispatchModal(o)}
                                                                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3 py-1.5 rounded text-xs transition cursor-pointer flex items-center gap-1 shadow-md shadow-cyan-500/20"
                                                                >
                                                                    <span>📤 Kirim Ke Divisi</span>
                                                                    {o.revision_status === 'pending_gudang' && (
                                                                        <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded font-mono font-extrabold animate-pulse">
                                                                            (Revisi Baru)
                                                                        </span>
                                                                    )}
                                                                </button>
                                                            )
                                                        )}

                                                        {o.status === 'pengiriman' && (
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <button
                                                                    onClick={() => { setSelectedWaybillOrder(o); setShowWaybillModal(true); }}
                                                                    className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-sm"
                                                                    title="Cetak 4 Warna Surat Jalan Pengiriman (Putih, Merah, Kuning, Hijau)"
                                                                >
                                                                    🖨️ Surat Jalan (4 Warna)
                                                                </button>
                                                                <button
                                                                    onClick={() => handleCompleteDelivery(o.id, true)}
                                                                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-black shadow-md shadow-emerald-500/20 transition flex items-center gap-1 cursor-pointer transform hover:scale-105"
                                                                    title="Klik jika barang telah sampai dan diterima konsumen (Status otomatis berubah jadi Selesai)"
                                                                >
                                                                    ✅ Konfirmasi Selesai Terkirim
                                                                </button>
                                                            </div>
                                                        )}

                                                        {o.status === 'selesai' && (
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1">
                                                                    <span>✅</span> Selesai Terkirim
                                                                </span>
                                                                <button
                                                                    onClick={() => { setSelectedWaybillOrder(o); setShowWaybillModal(true); }}
                                                                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition flex items-center gap-1"
                                                                    title="Cetak Ulang Arsip Surat Jalan"
                                                                >
                                                                    🖨️ Surat Jalan (Arsip)
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: WORKSTATION DIVISI & DISPOSISI */}
                    {activeTab === 'production' && (
                        <div className="space-y-6">
                            <div className="flex flex-wrap justify-between items-center gap-4">
                                <div>
                                    <h2 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2.5">
                                        🏭 Workstation & Disposisi Workflow Divisi Pabrik
                                    </h2>
                                    <p className="text-slate-400 text-sm">Monitoring & eksekusi pengerjaan kaca per divisi (Potong HT, Gosok GM, Bevel BV, & Etsa Blur)</p>
                                </div>
                                <span className="text-xs text-cyan-400 bg-cyan-400/10 px-3.5 py-1.5 rounded-full border border-cyan-400/20 font-bold">
                                    Role Aktif: {roleTitles[userRole]}
                                </span>
                            </div>

                            {/* WORKSTATION DIVISION SUB-TAB FILTER */}
                            {isDivisionWorker ? (
                                <div className="flex flex-wrap items-center bg-slate-900 border border-slate-800 p-1.5 rounded-xl gap-2">
                                    <button
                                        onClick={() => setProductionSubTab(`${userRole}_active`)}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${productionSubTab === `${userRole}_active` ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                                    >
                                        <span>🔨 Active Pengerjaan {roleTitles[userRole]}</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-extrabold ${productionSubTab === `${userRole}_active` ? 'bg-slate-950/40 text-cyan-200' : 'bg-slate-800 text-slate-300'}`}>
                                            {initialOrders.filter(o => o.current_division === userRole).length}
                                        </span>
                                    </button>

                                    <button
                                        onClick={() => setProductionSubTab(`${userRole}_history`)}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${productionSubTab === `${userRole}_history` ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                                    >
                                        <span>📜 Riwayat Selesai {roleTitles[userRole]}</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-extrabold ${productionSubTab === `${userRole}_history` ? 'bg-slate-950/40 text-emerald-200' : 'bg-slate-800 text-slate-300'}`}>
                                            {(() => {
                                                const code = userRole.replace('divisi_', '').toUpperCase();
                                                return initialOrders.filter(o => {
                                                    const p = o.division_progress || {};
                                                    return o.current_division !== userRole && (p[code] === 'Selesai' || p[code.toLowerCase()] === 'Selesai');
                                                }).length;
                                            })()}
                                        </span>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-wrap items-center bg-slate-900 border border-slate-800 p-1.5 rounded-xl gap-1">
                                    {[
                                        { key: 'all', label: '⚡ Semua Active Pengerjaan', count: initialOrders.filter(o => checkOrderDivisi(o, 'all')).length },
                                        { key: 'divisi_ht', label: '✂️ Divisi HT (Potong)', count: initialOrders.filter(o => checkOrderDivisi(o, 'divisi_ht')).length },
                                        { key: 'divisi_gm', label: '✨ Divisi GM (Gosok)', count: initialOrders.filter(o => checkOrderDivisi(o, 'divisi_gm')).length },
                                        { key: 'divisi_bv', label: '💎 Divisi BV (Bevel)', count: initialOrders.filter(o => checkOrderDivisi(o, 'divisi_bv')).length },
                                        { key: 'divisi_etsa', label: '🎨 Divisi Etsa (Blur)', count: initialOrders.filter(o => checkOrderDivisi(o, 'divisi_etsa')).length },
                                        { key: 'QC_Ready', label: '✅ Selesai Dikerjakan (Siap Kirim QC)', count: initialOrders.filter(o => checkOrderDivisi(o, 'QC_Ready')).length },
                                    ].map(tab => (
                                        <button
                                            key={tab.key}
                                            onClick={() => setProductionSubTab(tab.key)}
                                            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${productionSubTab === tab.key ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                                        >
                                            <span>{tab.label}</span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-extrabold ${productionSubTab === tab.key ? 'bg-slate-950/40 text-cyan-200' : 'bg-slate-800 text-slate-300'}`}>
                                                {tab.count}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* BERSAMAAN DENGAN ANTREAN: WARNING BANNER PENDING KOMPLAIN KACA UNTUK ADMIN GUDANG */}
                            {initialOrders.filter(o => o.complaint_status === 'pending_gudang').length > 0 && (userRole === 'admin_gudang' || userRole === 'owner') && (
                                <div className="bg-amber-950/90 border-2 border-amber-500/80 rounded-2xl p-5 shadow-2xl space-y-3 animate-pulse">
                                    <div className="flex justify-between items-center border-b border-amber-500/40 pb-2.5">
                                        <h3 className="text-sm font-black text-amber-300 flex items-center gap-2">
                                            <span>⚠️ PERINGATAN KRITIS: ADA KOMPLAIN KACA CACAT / BARET MENUNGGU DECISION GUDANG ({initialOrders.filter(o => o.complaint_status === 'pending_gudang').length})</span>
                                        </h3>
                                        <span className="text-[10px] text-amber-200 bg-amber-500/20 px-2.5 py-1 rounded-full font-mono font-bold border border-amber-500/40">Tindakan Gudang Diperlukan</span>
                                    </div>
                                    <div className="space-y-2.5">
                                        {initialOrders.filter(o => o.complaint_status === 'pending_gudang').map(o => (
                                            <div key={o.id} className="bg-slate-950/90 border border-amber-500/50 p-3.5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                                <div className="space-y-1">
                                                    <div className="font-extrabold text-amber-300 text-xs font-mono">
                                                        SPO #{o.spo_number} — Pelapor: Divisi {o.complaint_data?.reporting_division?.replace('divisi_', '').toUpperCase() || ''}
                                                    </div>
                                                    <div className="text-slate-300 text-xs">
                                                        Pelanggan: <strong>{o.customer_name}</strong> | Kendala: <strong className="text-rose-400">{o.complaint_data?.reason || 'Kaca Cacat'}</strong>
                                                    </div>
                                                    {o.complaint_data?.notes && (
                                                        <div className="text-slate-400 text-[11px] italic font-mono bg-slate-900/60 p-1.5 rounded border border-slate-800">
                                                            Catatan Pekerja: "{o.complaint_data.notes}"
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => { setSelectedComplaintOrder(o); setShowGudangDecisionModal(true); }}
                                                    className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition shadow-lg shadow-amber-500/20 whitespace-nowrap cursor-pointer flex items-center gap-1.5"
                                                >
                                                    <span>⚖️ Tinjau & Ambil Keputusan</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* SECTION A: ORDER ANTREAN ADMIN GUDANG */}
                            {(userRole === 'admin_gudang' || userRole === 'owner') && (productionSubTab === 'all' || productionSubTab === 'gudang') && (
                                <div className="bg-slate-900/80 border-2 border-blue-500/40 rounded-2xl p-6 shadow-xl space-y-4">
                                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                                        <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
                                            🏭 Antrean Disposisi Admin Gudang
                                        </h3>
                                        <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/30">
                                            {initialOrders.filter(o => o.status === 'pengerjaan' && o.current_division === 'admin_gudang').length} Order
                                        </span>
                                    </div>

                                    {initialOrders.filter(o => o.status === 'pengerjaan' && o.current_division === 'admin_gudang').length === 0 ? (
                                        <p className="text-xs text-slate-500 italic p-3 text-center bg-slate-950/40 rounded-xl border border-slate-800">
                                            Tidak ada orderan baru yang menunggu disposisi gudang saat ini.
                                        </p>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {initialOrders.filter(o => o.status === 'pengerjaan' && o.current_division === 'admin_gudang').sort((a, b) => b.id - a.id).map(o => (
                                                <div key={o.id} className="bg-slate-950 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-4 space-y-3 transition">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <span className="font-extrabold text-cyan-400 font-mono text-base">{o.spo_number}</span>
                                                            <h4 className="font-bold text-slate-200 text-sm mt-0.5">{o.customer_name}</h4>
                                                        </div>
                                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${o.priority_status === 'Prioritas' ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                                                            {o.priority_status === 'Prioritas' ? '🔥 PRIORITAS' : '🔵 Biasa'}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 space-y-1">
                                                        <div className="font-semibold text-slate-200">Kaca: {o.glass_type}</div>
                                                        <div className="text-slate-400 font-mono">Ukuran: {o.length_cm} x {o.width_cm} cm ({o.thickness_mm}mm)</div>
                                                        <div className="text-[11px] text-cyan-300 font-mono pt-1.5 border-t border-slate-800/80">
                                                            📅 Pembuatan Order: <strong className="text-cyan-400">{formatIndonesianDate(o.order_date)}</strong>
                                                        </div>
                                                    </div>

                                                    {o.revision_status === 'editing' && (
                                                        <div className="bg-rose-950/90 border-2 border-rose-500 rounded-xl p-3 text-rose-200 text-xs space-y-1.5 animate-pulse shadow-lg">
                                                            <div className="font-extrabold text-rose-300 flex items-center justify-between text-xs">
                                                                <span className="flex items-center gap-1.5">
                                                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                                                                    <span>⏳ SEDANG DIREVISI OLEH ADMIN TOKO...</span>
                                                                </span>
                                                                <span className="bg-rose-500 text-white font-mono px-2 py-0.5 rounded text-[10px]">
                                                                    LOCKED EDITING
                                                                </span>
                                                            </div>
                                                            <p className="text-[11px] text-slate-200 leading-relaxed">
                                                                Admin Toko sedang mengedit/mengisi detail revisi pada SPO ini. Tombol <strong>Kirim ke Divisi</strong> diblokir sementara sampai Admin Toko selesai mengeklik simpan.
                                                            </p>
                                                        </div>
                                                    )}

                                                    {o.revision_status === 'pending_gudang' && (
                                                        <div className="bg-amber-950/80 border-2 border-amber-500 rounded-xl p-3 text-amber-200 text-xs space-y-2">
                                                            <div className="font-extrabold text-amber-300 flex items-center justify-between text-xs">
                                                                <span className="flex items-center gap-1.5">
                                                                    <span>⚠️ ORDERAN TELAH DIREVISI OLEH ADMIN TOKO</span>
                                                                </span>
                                                                <span className="bg-amber-500 text-slate-950 font-mono font-extrabold px-2 py-0.5 rounded text-[10px]">
                                                                    REVISI DISIMPAN
                                                                </span>
                                                            </div>
                                                            <p className="text-[11px] text-slate-200 leading-relaxed">
                                                                Admin Toko telah selesai menginput dan menyimpan revisi. Admin Gudang dapat memeriksa spesifikasi/ukuran terbaru di atas dan dapat langsung mengeklik tombol <strong>Disposisi Divisi</strong> di bawah.
                                                            </p>
                                                            {o.revision_notes && (
                                                                <div className="bg-slate-950/90 p-2 rounded border border-amber-500/40 text-[11px] text-amber-300 font-mono">
                                                                    📝 Catatan Revisi Toko: {o.revision_notes}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    <div className="flex justify-between items-center pt-1">
                                                        <span className="text-[11px] text-slate-400 font-mono">📅 Deadline: {o.deadline_date || '-'}</span>
                                                        {o.revision_status === 'editing' ? (
                                                            <button
                                                                disabled
                                                                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 bg-slate-800 border border-slate-700 cursor-not-allowed opacity-75 flex items-center gap-1.5"
                                                                title="SPO sedang di-edit oleh Admin Toko. Tombol akan otomatis aktif setelah revisi disimpan."
                                                            >
                                                                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                                                                <span>🔒 Terkunci (Sedang Direvisi Admin Toko...)</span>
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleOpenDispatchModal(o)}
                                                                className="group relative inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:scale-[1.03] active:scale-95 transition-all duration-200 border border-cyan-300/40 overflow-hidden cursor-pointer"
                                                            >
                                                                <span>Disposisi Divisi</span>
                                                                <span className="transition-transform group-hover:translate-x-1 duration-200">➔</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* SECTION B: WORKSTATION ACTIVE PENGERJAAN & DISPOSISI LAYOUT (SEPERTI SKETSA USER) */}
                            <div className="space-y-6">

                                {/* CARD PROSES BERJALAN: HANYA BERLAKU UNTUK DIVISI HT, BV, GM, & ETSA */}
                                {isDivisionWorker && (() => {
                                    const activeDivKey = userRole.replace('divisi_', '').toUpperCase();

                                    const activeOngoingOrder = (() => {
                                        if (activeWorkingOrderId) {
                                            const found = initialOrders.find(o => o.id === activeWorkingOrderId);
                                            if (found) return found;
                                        }
                                        return initialOrders.find(o => {
                                            if (isDivisionWorker) {
                                                return o.current_division === userRole && o.division_progress?.[activeDivKey] === 'Sedang Dikerjakan';
                                            }
                                            if (productionSubTab.startsWith('divisi_')) {
                                                return o.current_division === productionSubTab && o.division_progress?.[activeDivKey] === 'Sedang Dikerjakan';
                                            }
                                            return false;
                                        }) || null;
                                    })();

                                    return (
                                        <div id="active-workstation-card" className="transition-all duration-300">
                                            {activeOngoingOrder ? (
                                                <div className="relative overflow-hidden rounded-3xl border-2 border-cyan-500/50 bg-gradient-to-br from-slate-900 via-slate-900/95 to-cyan-950/40 p-6 sm:p-7 shadow-[0_0_40px_rgba(6,182,212,0.18)] space-y-5">
                                                    {/* Ambient subtle glow background */}
                                                    <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
                                                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

                                                    {/* CARD TOP HEADER */}
                                                    <div className="relative z-10 flex flex-wrap justify-between items-center gap-3 border-b border-cyan-500/20 pb-4">
                                                        <div className="flex flex-wrap items-center gap-2.5">
                                                            <span className="relative flex h-3 w-3">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                                            </span>
                                                            <span className="text-xs font-black uppercase tracking-wider text-emerald-300 font-mono flex items-center gap-1.5">
                                                                <span>⚡ PROSES SEDANG BERLANGSUNG DI MEJA KERJA</span>
                                                            </span>
                                                            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-mono shadow-sm">
                                                                Workstation {roleTitles[activeOngoingOrder.current_division] || activeOngoingOrder.current_division}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            {activeOngoingOrder.priority_status === 'Prioritas' ? (
                                                                <span className="text-[10px] font-black px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/50 animate-pulse flex items-center gap-1 shadow-sm">
                                                                    <span>🔥 PRIORITAS TINGGI</span>
                                                                </span>
                                                            ) : (
                                                                <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                                                                    🔵 Standar
                                                                </span>
                                                            )}
                                                            <span className="text-xs font-mono font-extrabold text-cyan-400 bg-slate-950/80 px-3 py-1 rounded-xl border border-cyan-500/30">
                                                                {activeOngoingOrder.spo_number}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* PERINGATAN INTERUPSI REVISI TOKO JIKA SEDANG BERJALAN DAN MENDAPAT REVISI */}
                                                    {activeOngoingOrder.revision_status === 'pending_division' && (
                                                        <div className="relative z-10 bg-rose-950/90 border-2 border-rose-500 rounded-2xl p-4 text-rose-200 text-xs space-y-2 animate-pulse shadow-xl shadow-rose-950/40">
                                                            <div className="flex flex-wrap justify-between items-center gap-2 font-black text-xs text-rose-300">
                                                                <span className="flex items-center gap-2 text-sm">
                                                                    <span>⚠️ INTERUPSI REVISI DARI ADMIN TOKO!</span>
                                                                </span>
                                                                <span className="bg-rose-500 text-white font-mono px-2.5 py-0.5 rounded text-[10px] uppercase font-black">
                                                                    Tindakan Mendesak
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-slate-200 leading-relaxed">
                                                                Admin Toko telah mengirimkan revisi pada SPO ini saat pengerjaan sedang berlangsung! Harap periksa perubahan ukuran/spesifikasi sebelum melanjutkan proses kaca agar tidak terjadi salah potong/proses.
                                                            </p>
                                                            {activeOngoingOrder.revision_notes && (
                                                                <div className="bg-slate-950/90 p-2.5 rounded-lg border border-rose-500/40 text-xs text-amber-300 font-mono">
                                                                    📝 Catatan Revisi Toko: <strong>{activeOngoingOrder.revision_notes}</strong>
                                                                </div>
                                                            )}
                                                            <div className="flex justify-end pt-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleAcknowledgeRevision(activeOngoingOrder.id)}
                                                                    className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition shadow-lg shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
                                                                >
                                                                    <span>🔄 Terima & Eksekusi Revisi SPO</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* CARD MAIN BODY GRID: 3 COLUMNS */}
                                                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                                                        {/* COL 1: INFO CUSTOMER & ORDER (4 Cols) */}
                                                        <div className="md:col-span-4 space-y-2">
                                                            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Pemesan / Proyek:</div>
                                                            <h3 className="text-xl font-black text-white tracking-tight leading-snug">
                                                                {activeOngoingOrder.customer_name}
                                                            </h3>
                                                            <div className="text-xs text-slate-300 space-y-1 pt-1 font-mono">
                                                                <div className="flex items-center gap-2 text-slate-400">
                                                                    <span>📅 Order:</span>
                                                                    <span className="text-slate-200">{formatIndonesianDate(activeOngoingOrder.order_date)}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-amber-300 font-bold">
                                                                    <span>⏰ Deadline:</span>
                                                                    <span>{activeOngoingOrder.deadline_date || '-'}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* COL 2: SPESIFIKASI KACA & UKURAN (4 Cols) */}
                                                        <div className="md:col-span-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-2">
                                                            <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-bold">Spesifikasi Kaca & Dimensi:</div>
                                                            {Array.isArray(activeOngoingOrder.items) && activeOngoingOrder.items.length > 0 ? (
                                                                <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                                                                    {activeOngoingOrder.items.map((it, idx) => (
                                                                        <div key={idx} className="text-xs bg-slate-900/80 p-2 rounded border border-slate-800">
                                                                            <div className="font-bold text-cyan-300">#{idx + 1}. {it.glass_type}</div>
                                                                            <div className="text-slate-300 font-mono text-[11px]">{it.length_cm} x {it.width_cm} cm ({it.thickness_mm}mm) — Qty: <strong className="text-white">{it.qty || 1}</strong></div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div className="text-xs space-y-1">
                                                                    <div className="font-bold text-cyan-300 text-sm">{activeOngoingOrder.glass_type}</div>
                                                                    <div className="text-slate-300 font-mono text-xs">{activeOngoingOrder.length_cm} x {activeOngoingOrder.width_cm} cm ({activeOngoingOrder.thickness_mm}mm)</div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* COL 3: DIGITAL RUNNING TIMER (4 Cols) */}
                                                        <div className="md:col-span-4 bg-slate-950/90 border-2 border-cyan-500/40 rounded-2xl p-4 text-center shadow-[inset_0_0_20px_rgba(6,182,212,0.1)] space-y-1 relative overflow-hidden">
                                                            <div className="text-[11px] font-black font-mono text-cyan-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
                                                                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                                                                <span>⏱️ WAKTU BERJALAN</span>
                                                            </div>
                                                            <div className="text-3xl sm:text-4xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-emerald-300 tracking-widest drop-shadow-[0_0_15px_rgba(6,182,212,0.6)] py-1">
                                                                {calculateJobElapsedTime(activeOngoingOrder, activeDivKey)}
                                                            </div>
                                                            <div className="text-[10px] text-slate-400 font-mono">
                                                                {activeOngoingOrder.division_timestamps?.[activeDivKey]?.started_at ? (
                                                                    <span>Mulai: {formatIndonesianDate(activeOngoingOrder.division_timestamps[activeDivKey].started_at)}</span>
                                                                ) : (
                                                                    <span className="text-cyan-400/80 animate-pulse">● Stopwatch Aktif</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* CARD BOTTOM ACTION FOOTER */}
                                                    <div className="relative z-10 flex flex-wrap justify-between items-center gap-3 pt-3 border-t border-cyan-500/20">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenDetailModal(activeOngoingOrder)}
                                                                className="group inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 transition shadow-sm cursor-pointer"
                                                                title="Buka Modal Detail Lengkap, Sketsa & Histori"
                                                            >
                                                                <span className="text-sm">👁️</span>
                                                                <span className="font-extrabold text-[11px]">Detail Lengkap</span>
                                                            </button>

                                                            {activeOngoingOrder.current_division !== 'divisi_ht' && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleOpenComplaintModal(activeOngoingOrder)}
                                                                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition cursor-pointer"
                                                                >
                                                                    <span>⚠️ Lapor Cacat</span>
                                                                </button>
                                                            )}
                                                        </div>

                                                        {/* ACTION SELESAI */}
                                                        <div className="flex flex-wrap items-center gap-2 ml-auto">
                                                            <span className="text-xs text-slate-400 font-mono font-semibold hidden sm:inline-block">Teruskan ke:</span>
                                                            <select
                                                                value={activeCardNextDiv}
                                                                onChange={(e) => setActiveCardNextDiv(e.target.value)}
                                                                className="bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-xs font-semibold focus:border-cyan-400 font-mono shadow-inner"
                                                            >
                                                                <option value="QC_Ready">✅ Selesai & Lolos QC (Siap Kirim)</option>
                                                                <option value="divisi_ht">✂️ Teruskan ke Divisi HT (Potong)</option>
                                                                <option value="divisi_gm">✨ Teruskan ke Divisi GM (Gosok)</option>
                                                                <option value="divisi_bv">💎 Teruskan ke Divisi BV (Bevel)</option>
                                                                <option value="divisi_etsa">🎨 Teruskan ke Divisi Etsa (Blur)</option>
                                                            </select>

                                                            <button
                                                                type="button"
                                                                onClick={() => handleFinishJobSubmit(activeOngoingOrder.id, activeCardNextDiv)}
                                                                className="group relative inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:via-teal-300 hover:to-cyan-300 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-400/40 hover:scale-[1.02] active:scale-95 transition-all duration-200 border border-emerald-300/40 cursor-pointer"
                                                            >
                                                                <span className="text-sm">✅</span>
                                                                <span className="tracking-wider uppercase font-black text-xs">Selesai Pengerjaan</span>
                                                                <span className="transition-transform group-hover:translate-x-1 duration-200">➔</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/40 p-6 sm:p-8 text-center space-y-2 shadow-inner">
                                                    <div className="text-3xl animate-bounce">⏱️</div>
                                                    <h4 className="text-sm font-extrabold text-slate-300">Belum Ada Pekerjaan yang Sedang Dikerjakan di Workstation</h4>
                                                    <p className="text-xs text-slate-500 max-w-lg mx-auto">
                                                        Silakan pilih salah satu order dari tabel antrean di bawah, kemudian klik tombol <strong className="text-cyan-400">"⚡ Mulai Kerjakan"</strong> untuk memindahkan baris antrean ke card pengerjaan aktif ini dan mengaktifkan stopwatch live running timer.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}

                                {/* TABEL ANTREAN WORKSTATION DIVISI (PRIORITAS DI PALING ATAS) */}
                                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                                    <div className="flex flex-wrap justify-between items-center border-b border-slate-800 pb-3 gap-3">
                                        <div>
                                            <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
                                                📋 Tabel Antrean Workstation Divisi
                                            </h3>
                                            {isDivisionWorker ? (
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    Urutan antrean: <strong className="text-rose-400">⚡ INTERUPSI REVISI</strong> berada di posisi teratas, disusul <strong className="text-amber-400">🔥 PRIORITAS</strong>, kemudian antrean reguler.
                                                </p>
                                            ) : (
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    Order berstatus <strong className="text-rose-400">🔥 PRIORITAS</strong> otomatis diurutkan di paling atas.
                                                </p>
                                            )}
                                        </div>

                                        {/* STATISTIK MASUK & SELESAI HARI INI */}
                                        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                                            {(() => {
                                                const todayStr = new Date().toISOString().split('T')[0];
                                                const curKey = isDivisionWorker ? userRole.replace('divisi_', '').toUpperCase() : 'HT';

                                                const enteredToday = initialOrders.filter(o => {
                                                    const ts = (o.division_timestamps && o.division_timestamps[curKey]) ? o.division_timestamps[curKey] : {};
                                                    return ts.started_at && ts.started_at.startsWith(todayStr);
                                                }).length;

                                                const completedToday = initialOrders.filter(o => {
                                                    const ts = (o.division_timestamps && o.division_timestamps[curKey]) ? o.division_timestamps[curKey] : {};
                                                    return ts.completed_at && ts.completed_at.startsWith(todayStr);
                                                }).length;

                                                return (
                                                    <>
                                                        <span className="bg-cyan-500/10 text-cyan-300 px-3 py-1.5 rounded-xl border border-cyan-500/30 flex items-center gap-1.5 shadow-sm">
                                                            <span>📥 Masuk Hari Ini:</span>
                                                            <strong className="text-white font-extrabold">{enteredToday} Order</strong>
                                                        </span>
                                                        <span className="bg-emerald-500/10 text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                                                            <span>✅ Selesai Hari Ini:</span>
                                                            <strong className="text-white font-extrabold">{completedToday} Order</strong>
                                                        </span>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    {(() => {
                                        const rawFiltered = initialOrders.filter(o => {
                                            if (isDivisionWorker) {
                                                if (productionSubTab === `${userRole}_history`) {
                                                    const code = userRole.replace('divisi_', '').toUpperCase();
                                                    const p = o.division_progress || {};
                                                    return o.current_division !== userRole && (p[code] === 'Selesai' || p[code.toLowerCase()] === 'Selesai');
                                                }
                                                return o.current_division === userRole;
                                            }
                                            return checkOrderDivisi(o, productionSubTab);
                                        });

                                        // CRITICAL REQUIREMENT FROM SKETCH: *urutan jadi prioritas + paling atas
                                        const sortedWorkstationOrders = [...rawFiltered].sort((a, b) => {
                                            if (a.priority_status === 'Prioritas' && b.priority_status !== 'Prioritas') return -1;
                                            if (a.priority_status !== 'Prioritas' && b.priority_status === 'Prioritas') return 1;
                                            return b.id - a.id;
                                        });

                                        if (sortedWorkstationOrders.length === 0) {
                                            return (
                                                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-8 text-center space-y-2">
                                                    <div className="text-3xl">⚙️</div>
                                                    <h4 className="font-extrabold text-slate-300 text-base">Tidak Ada Orderan Dalam Antrean saat Ini</h4>
                                                    <p className="text-xs text-slate-500">Semua orderan di workstation ini telah selesai dikerjakan atau belum didispatch oleh Gudang.</p>
                                                </div>
                                            );
                                        }

                                        const curDivKey = isDivisionWorker
                                            ? userRole.replace('divisi_', '').toUpperCase()
                                            : (productionSubTab.startsWith('divisi_') ? productionSubTab.replace('divisi_', '').toUpperCase() : 'HT');

                                        const activeOngoingId = (() => {
                                            if (activeWorkingOrderId) return activeWorkingOrderId;
                                            const found = initialOrders.find(o => {
                                                if (isDivisionWorker) {
                                                    return o.current_division === userRole && o.division_progress?.[curDivKey] === 'Sedang Dikerjakan';
                                                }
                                                if (productionSubTab.startsWith('divisi_')) {
                                                    return o.current_division === productionSubTab && o.division_progress?.[curDivKey] === 'Sedang Dikerjakan';
                                                }
                                                return false;
                                            });
                                            return found?.id || null;
                                        })();

                                        return (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-xs">
                                                    <thead className="bg-slate-800/40 text-slate-400 uppercase text-[11px]">
                                                        <tr>
                                                            <th className="p-3">No SPO & Prioritas</th>
                                                            <th className="p-3">Jenis Kaca & Ukuran & Detail</th>
                                                            <th className="p-3">Progres Tahapan Divisi</th>
                                                            <th className="p-3 text-right">Aksi Pengerjakan</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-800/80">
                                                        {sortedWorkstationOrders.map(o => {
                                                            const isRevision = isDivisionWorker && o.revision_status === 'pending_division';
                                                            const isPriority = o.priority_status === 'Prioritas';
                                                            const isCurrentlyActiveInCard = isDivisionWorker && activeOngoingId === o.id;

                                                            return (
                                                                <tr key={o.id} className={`transition ${isCurrentlyActiveInCard ? 'bg-cyan-950/30 border-l-4 border-l-cyan-400' : isRevision ? 'bg-rose-950/25 hover:bg-rose-950/35 border-l-4 border-l-rose-500' : isPriority ? 'bg-amber-950/15 hover:bg-amber-950/25 border-l-4 border-l-amber-500' : 'hover:bg-slate-800/30'}`}>
                                                                    <td className="p-3 font-mono">
                                                                        <div className="font-extrabold text-cyan-400 text-sm flex flex-wrap items-center gap-1.5">
                                                                            <span>{o.spo_number}</span>
                                                                            {isRevision && (
                                                                                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-rose-500/25 text-rose-300 border border-rose-500/50 animate-pulse flex items-center gap-1">
                                                                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>
                                                                                    <span>⚡ REVISI TOKO</span>
                                                                                </span>
                                                                            )}
                                                                            {isPriority && !isRevision && (
                                                                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                                                                                    🔥 PRIORITAS
                                                                                </span>
                                                                            )}
                                                                            {!isPriority && !isRevision && (
                                                                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                                                                                    🔵 Biasa
                                                                                </span>
                                                                            )}
                                                                            {isCurrentlyActiveInCard && (
                                                                                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 font-mono">
                                                                                    ● DI MEJA KERJA
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div className="text-slate-300 font-bold text-xs mt-0.5">{o.customer_name}</div>
                                                                        <div className="text-[10px] text-slate-400 mt-1">📅 Order: {formatIndonesianDate(o.order_date)}</div>
                                                                        <div className="text-[10px] text-amber-300 font-bold">📅 Deadline: {o.deadline_date || '-'}</div>
                                                                        {o.revision_status === 'pending_division' && (
                                                                            <div className="mt-1.5 bg-rose-950/90 border border-rose-500 rounded-xl p-2 text-rose-200 space-y-1 animate-pulse">
                                                                                <div className="flex justify-between items-center text-[10px] font-extrabold">
                                                                                    <span className="text-rose-300 flex items-center gap-1">⚠️ PERINGATAN REVISI TOKO</span>
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => handleAcknowledgeRevision(o.id)}
                                                                                        className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-2 py-0.5 rounded text-[10px] cursor-pointer shadow"
                                                                                    >
                                                                                        🔄 Terima & Eksekusi Revisi SPO
                                                                                    </button>
                                                                                </div>
                                                                                {Object.values(o.division_progress || {}).includes('Sedang Dikerjakan') && (
                                                                                    <div className="bg-rose-600 text-white font-extrabold text-[10px] p-1 rounded animate-bounce">
                                                                                        🚨 PERINGATAN KRITIS: Orderan ini SEDANG DIKERJAKAN di divisi dan ADA REVISIAN dari Admin Toko! (Cek Perubahan Ukuran)
                                                                                    </div>
                                                                                )}
                                                                                {o.revision_notes && (
                                                                                    <div className="text-[10px] text-amber-200 font-mono bg-slate-950/80 p-1 rounded border border-rose-500/40">
                                                                                        Catatan: {o.revision_notes}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                        {o.complaint_status === 'pending_gudang' && (
                                                                            <div className="mt-1.5 bg-amber-950/90 border border-amber-500 rounded-xl p-2 text-amber-200 space-y-1 animate-pulse">
                                                                                <div className="flex justify-between items-center text-[10px] font-extrabold">
                                                                                    <span className="text-amber-300 flex items-center gap-1">⚠️ KOMPLAIN KACA DARI {o.complaint_data?.reporting_division?.replace('divisi_', '').toUpperCase()}</span>
                                                                                    {(userRole === 'admin_gudang' || userRole === 'owner') && (
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => { setSelectedComplaintOrder(o); setShowGudangDecisionModal(true); }}
                                                                                            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-2 py-0.5 rounded text-[10px] cursor-pointer shadow"
                                                                                        >
                                                                                            ⚖️ Tinjau Komplain Kaca
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                                <div className="text-[10px] text-amber-200 font-mono">
                                                                                    Kendala: <strong>{o.complaint_data?.reason}</strong> {o.complaint_data?.notes ? `- "${o.complaint_data.notes}"` : ''}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        {o.complaint_status === 're_cut_needed' && o.current_division === 'divisi_ht' && (
                                                                            <div className="mt-1.5 bg-rose-950/90 border border-rose-500 rounded-xl p-1.5 text-rose-200 text-[10px] font-bold font-mono animate-pulse">
                                                                                🚨 POTONG ULANG (GANTI KACA DARI DIVISI {o.complaint_data?.reporting_division?.replace('divisi_', '').toUpperCase() || ''})
                                                                            </div>
                                                                        )}

                                                                        {o.sketch_photo_path && (
                                                                            <div className="mt-1.5">
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleOpenSketchLightbox(o.sketch_photo_path, o.spo_number)}
                                                                                    className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-lg p-1.5 flex items-center justify-between gap-2 text-xs transition shadow-sm cursor-pointer"
                                                                                    title="Klik untuk memperbesar gambar sketsa pola & sambungan kaca"
                                                                                >
                                                                                    <div className="flex items-center gap-1.5 overflow-hidden">
                                                                                        <img
                                                                                            src={o.sketch_photo_path.startsWith('http') || o.sketch_photo_path.startsWith('/') ? o.sketch_photo_path : `/storage/${o.sketch_photo_path}`}
                                                                                            alt="Sketsa Pola"
                                                                                            className="w-7 h-7 rounded object-cover border border-cyan-400/50 bg-slate-900 shrink-0"
                                                                                        />
                                                                                        <span className="font-bold text-[10px] truncate">📐 Sketsa Sambungan Kaca</span>
                                                                                    </div>
                                                                                    <span className="text-[9px] bg-cyan-400/20 text-cyan-200 px-1.5 py-0.5 rounded font-mono font-bold shrink-0">🔍 Lihat</span>
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </td>

                                                                    <td className="p-3 max-w-xs space-y-1">
                                                                        {Array.isArray(o.items) && o.items.length > 0 ? (
                                                                            o.items.map((it, idx) => (
                                                                                <div key={idx} className="bg-slate-950/60 p-2 rounded border border-slate-800 text-[11px] space-y-0.5">
                                                                                    <div className="font-bold text-cyan-300">#{idx + 1}. {it.glass_type}</div>
                                                                                    <div className="text-slate-300 font-mono">{it.length_cm} x {it.width_cm} cm ({it.thickness_mm}mm) — Qty: {it.qty || 1}</div>
                                                                                </div>
                                                                            ))
                                                                        ) : (
                                                                            <div className="bg-slate-950/60 p-2 rounded border border-slate-800 text-[11px]">
                                                                                <div className="font-bold text-cyan-300">{o.glass_type}</div>
                                                                                <div className="text-slate-300 font-mono">{o.length_cm} x {o.width_cm} cm ({o.thickness_mm}mm)</div>
                                                                            </div>
                                                                        )}
                                                                    </td>

                                                                    <td className="p-3">
                                                                        <div className="flex flex-wrap gap-1.5">
                                                                            {(() => {
                                                                                const reqSet = new Set();
                                                                                if (Array.isArray(o.processes)) o.processes.forEach(p => reqSet.add(String(p).toUpperCase()));
                                                                                if (Array.isArray(o.items)) {
                                                                                    o.items.forEach(it => {
                                                                                        if (Array.isArray(it.processes)) it.processes.forEach(p => reqSet.add(String(p).toUpperCase()));
                                                                                    });
                                                                                }

                                                                                const activeProcs = ['HT', 'GM', 'BV', 'Etsa'].filter(proc => {
                                                                                    if (proc === 'HT') return true;
                                                                                    const status = (o.division_progress && o.division_progress[proc]) ? o.division_progress[proc] : 'Belum';
                                                                                    if (status !== 'N/A') return true;
                                                                                    if (reqSet.has(proc.toUpperCase())) return true;
                                                                                    return false;
                                                                                });

                                                                                const renderList = activeProcs.length > 0 ? activeProcs : ['HT', 'GM', 'BV', 'Etsa'];

                                                                                return renderList.map(proc => {
                                                                                    const status = (o.division_progress && o.division_progress[proc]) ? o.division_progress[proc] : 'Belum';
                                                                                    const isDone = status === 'Selesai';
                                                                                    const isWorking = status === 'Sedang Dikerjakan';
                                                                                    const isNA = status === 'N/A';

                                                                                    const ts = (o.division_timestamps && o.division_timestamps[proc]) ? o.division_timestamps[proc] : {};
                                                                                    const timeStr = isDone && ts.completed_at
                                                                                        ? formatIndonesianDate(ts.completed_at)
                                                                                        : (isWorking || ts.started_at)
                                                                                            ? formatIndonesianDate(ts.started_at)
                                                                                            : null;

                                                                                    return (
                                                                                        <div key={proc} className="flex flex-col">
                                                                                            <span
                                                                                                className={`text-[10px] px-2 py-0.5 rounded font-bold font-mono border flex items-center gap-1 ${isDone ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : isWorking ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 animate-pulse' : isNA ? 'bg-slate-950 text-slate-600 border-slate-900' : 'bg-slate-950 text-slate-400 border-slate-800'}`}
                                                                                            >
                                                                                                <span>{proc}: {status}</span>
                                                                                            </span>
                                                                                            {timeStr && (
                                                                                                <span className="text-[9px] font-mono text-slate-400 mt-0.5 px-0.5">
                                                                                                    {isDone ? '🏁 ' + timeStr : '📥 ' + timeStr}
                                                                                                </span>
                                                                                            )}
                                                                                        </div>
                                                                                    );
                                                                                });
                                                                            })()}
                                                                        </div>
                                                                    </td>

                                                                    <td className="p-3 text-right">
                                                                        {(() => {
                                                                            const isHistoryRow = productionSubTab.endsWith('_history') ||
                                                                                productionSubTab === 'QC_Ready' ||
                                                                                (isDivisionWorker && o.current_division !== userRole);

                                                                            if (!isDivisionWorker || isHistoryRow) {
                                                                                return (
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => handleOpenDetailModal(o)}
                                                                                        className="group relative inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs text-cyan-300 bg-slate-800/90 hover:bg-slate-700 hover:text-white shadow-sm hover:scale-[1.02] active:scale-95 transition-all duration-200 border border-slate-700 hover:border-cyan-400/50 cursor-pointer ml-auto"
                                                                                    >
                                                                                        <span className="text-sm">👁️</span>
                                                                                        <span className="font-extrabold text-[11px]">Detail</span>
                                                                                        <span className="text-cyan-400 text-xs transition-transform group-hover:translate-x-0.5 duration-200">➔</span>
                                                                                    </button>
                                                                                );
                                                                            }

                                                                            return (
                                                                                <div className="flex flex-wrap items-center justify-end gap-2">
                                                                                    {/* TOMBOL DETAIL (IKON MATA + KETERANGAN DETAIL) */}
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => handleOpenDetailModal(o)}
                                                                                        className="group inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs text-slate-300 bg-slate-800/90 hover:bg-slate-700 hover:text-white border border-slate-700 hover:border-cyan-400/50 transition shadow-sm cursor-pointer"
                                                                                        title="Lihat Detail Lengkap SPO, Sketsa & Riwayat"
                                                                                    >
                                                                                        <span className="text-sm">👁️</span>
                                                                                        <span className="font-extrabold text-[11px]">Detail</span>
                                                                                    </button>

                                                                                    {/* TOMBOL MULAI KERJAKAN */}
                                                                                    {isCurrentlyActiveInCard ? (
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => {
                                                                                                document.getElementById('active-workstation-card')?.scrollIntoView({ behavior: 'smooth' });
                                                                                            }}
                                                                                            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl font-black text-xs text-cyan-300 bg-cyan-950/60 border border-cyan-500/50 shadow-md shadow-cyan-500/10 cursor-pointer"
                                                                                            title="Sedang Dikerjakan di Card Atas"
                                                                                        >
                                                                                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                                                                                            <span className="font-mono text-[11px]">Sedang Berjalan</span>
                                                                                        </button>
                                                                                    ) : (
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => handleStartWorkstationJob(o)}
                                                                                            className="group relative inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl font-black text-xs text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:via-teal-300 hover:to-emerald-300 shadow-md shadow-cyan-500/20 hover:shadow-cyan-400/30 hover:scale-[1.02] active:scale-95 transition-all duration-200 border border-cyan-300/40 cursor-pointer"
                                                                                            title="Mulai Pengerjaan & Pindahkan ke Card Proses di Atas"
                                                                                        >
                                                                                            <span className="text-xs">⚡</span>
                                                                                            <span className="font-black text-[11px] uppercase tracking-wider">Mulai Kerjakan</span>
                                                                                            <span className="text-[10px] transition-transform group-hover:translate-x-0.5 duration-200">➔</span>
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        })()}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        );
                                    })()}
                                </div>

                            </div>
                        </div>
                    )}

                    {/* TAB 4: MANAJEMEN STOK (BAHAN KACA LEMBARAN BARU & SISA) */}
                    {activeTab === 'scrap' && (
                        <div className="space-y-6">
                            <div className="flex flex-wrap justify-between items-center gap-4">
                                <div>
                                    <h2 className="text-2xl font-extrabold text-slate-100">Manajemen Stok Inventory Kaca</h2>
                                    <p className="text-slate-400 text-sm">Monitoring stok bahan kaca lembaran baru dan kaca sisa potongan rak</p>
                                </div>

                                {/* SUB TAB TOGGLE (Bahan Lembaran Baru vs Sisa Potongan) */}
                                <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
                                    <button
                                        onClick={() => setStockSubTab('lembaran')}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${stockSubTab === 'lembaran' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        <span>📦 Stok Kaca Lembaran (Baru)</span>
                                        {sheetGlasses.filter(g => g.status === 'Pengajuan Proses Restock').length > 0 && (
                                            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse shadow-sm">
                                                {sheetGlasses.filter(g => g.status === 'Pengajuan Proses Restock').length} Restock
                                            </span>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setStockSubTab('sisa')}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${stockSubTab === 'sisa' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        ♻️ Kaca Sisa Potongan Rak ({initialScrap.length})
                                    </button>
                                </div>
                            </div>

                            {stockSubTab === 'lembaran' ? (
                                <div className="space-y-6">
                                    {/* 4 FILTER CARDS AT THE TOP (SAMA SEPERTI ORDERAN) */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { key: 'all', label: 'Semua Stok Bahan', count: sheetGlasses.length, icon: '📦' },
                                            { key: 'aman', label: 'Aman', count: sheetGlasses.filter(g => g.status === 'Aman').length, icon: '✅' },
                                            { key: 'menipis', label: 'Menipis', count: sheetGlasses.filter(g => g.status === 'Menipis').length, icon: '⚠️' },
                                            { key: 'pengajuan', label: 'Pengajuan Proses Restock', count: sheetGlasses.filter(g => g.status === 'Pengajuan Proses Restock').length, icon: '⏳' },
                                        ].map(card => (
                                            <div
                                                key={card.key}
                                                onClick={() => setActiveStockCard(card.key)}
                                                className={`relative cursor-pointer border rounded-xl p-4 text-center transition ${activeStockCard === card.key ? 'bg-cyan-500/15 border-cyan-400 text-slate-100 shadow-lg shadow-cyan-500/10' : card.key === 'pengajuan' && card.count > 0 ? 'bg-rose-950/20 border-rose-500/60 text-slate-100 shadow-lg shadow-rose-500/20 animate-pulse' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/40'}`}
                                            >
                                                {card.key === 'pengajuan' && card.count > 0 && (
                                                    <span className="absolute -top-2.5 -right-2 bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-lg border border-rose-300 animate-bounce flex items-center gap-1 font-mono">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                                                        🔔 Restock Gudang
                                                    </span>
                                                )}
                                                <div className={`text-2xl font-black ${card.key === 'aman' ? 'text-emerald-400' : card.key === 'menipis' ? 'text-amber-400' : card.key === 'pengajuan' ? 'text-rose-400' : 'text-cyan-400'}`}>{card.count}</div>
                                                <div className="text-xs font-semibold mt-1">{card.icon} {card.label}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* BUTTON TAMBAH BARANG BARU DIRECTLY BELOW CARDS */}
                                    {(userRole === 'admin_toko' || userRole === 'admin_gudang' || userRole === 'owner') && (
                                        <div className="flex justify-start">
                                            <button
                                                onClick={() => setShowAddStockModal(true)}
                                                className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black px-5 py-2.5 rounded-xl shadow-xl shadow-emerald-500/20 text-sm flex items-center gap-2 transition transform hover:scale-105 border border-cyan-300/50"
                                            >
                                                <span className="text-base">✨</span> + Tambah Jenis Barang Baru
                                            </button>
                                        </div>
                                    )}

                                    {/* TABLE HEADER & SEARCH BAR */}
                                    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
                                        <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-800 pb-3">
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-bold text-slate-100 text-base">
                                                    📊 Tabel Bahan Stok Kaca Lembaran (Baru): <span className="text-cyan-400 uppercase tracking-wider">{activeStockCard}</span>
                                                </h3>
                                                <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2.5 py-1 rounded-full border border-cyan-500/20 font-mono font-bold">
                                                    {filteredSheetGlasses.length} Barang
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 flex-wrap">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowTableSupplierInfo(prev => !prev)}
                                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border flex items-center gap-1 cursor-pointer ${showTableSupplierInfo
                                                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                                                        : 'bg-slate-950 text-slate-400 border-slate-700 hover:text-white'
                                                        }`}
                                                    title="Klik untuk menayangkan / menyembunyikan info supplier di tabel"
                                                >
                                                    {showTableSupplierInfo ? '👁️ Supplier: Tampil' : '🙈 Supplier: Sembunyi'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowTablePricingInfo(prev => !prev)}
                                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border flex items-center gap-1 cursor-pointer ${showTablePricingInfo
                                                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                                        : 'bg-slate-950 text-slate-400 border-slate-700 hover:text-white'
                                                        }`}
                                                    title="Klik untuk menayangkan / menyembunyikan modal harga beli supplier di tabel"
                                                >
                                                    {showTablePricingInfo ? '👁️ Modal Beli: Tampil' : '🙈 Modal Beli: Sembunyi'}
                                                </button>

                                                <input
                                                    type="text"
                                                    placeholder="🔍 Cari Kode / Nama / Jenis Kaca..."
                                                    value={stockSearchTerm}
                                                    onChange={e => setStockSearchTerm(e.target.value)}
                                                    className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm">
                                                <thead className="bg-slate-800/40 text-slate-400 uppercase text-xs">
                                                    <tr>
                                                        <th className="p-3">Kode Barang & Restock</th>
                                                        <th className="p-3">Nama Barang</th>
                                                        <th className="p-3">Jenis Barang</th>
                                                        <th className="p-3">Ukuran Barang</th>
                                                        <th className="p-3">Harga Jual</th>
                                                        <th className="p-3">Quantity</th>
                                                        <th className="p-3">Aksi</th>
                                                        <th className="p-3">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-800">
                                                    {filteredSheetGlasses.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="8" className="p-6 text-center text-slate-500 text-xs italic">
                                                                Tidak ada barang stok lembaran yang sesuai dengan filter/pencarian.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        filteredSheetGlasses.map(item => (
                                                            <tr key={item.id} className="hover:bg-slate-800/30">
                                                                <td className="p-3">
                                                                    <div className="font-extrabold text-cyan-400 font-mono">{item.item_code}</div>
                                                                    <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                                                                        <span>📅 Restock:</span>
                                                                        <strong className="text-slate-300">{item.last_restock}</strong>
                                                                    </div>
                                                                </td>
                                                                <td className="p-3 font-bold text-slate-100">
                                                                    <div>{item.name}</div>
                                                                    {showTableSupplierInfo && (
                                                                        <div className="text-[11px] text-emerald-400 font-mono mt-0.5 flex items-center gap-1">
                                                                            <span>🏭 Supplier:</span>
                                                                            <span className="font-semibold text-slate-300">{item.supplier_name}</span>
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td className="p-3">
                                                                    <span className="bg-slate-800 text-cyan-300 border border-slate-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                                                                        {item.category}
                                                                    </span>
                                                                </td>
                                                                <td className="p-3 font-mono font-bold text-slate-200">{item.size}</td>
                                                                <td className="p-3 text-xs">
                                                                    {canViewPricing ? (
                                                                        <div className="space-y-0.5 font-mono">
                                                                            <div><span className="text-emerald-400 font-extrabold text-sm">Rp {Number(item.sell_price || 0).toLocaleString()}</span></div>
                                                                            {showTablePricingInfo && (
                                                                                <div className="text-slate-400 text-[11px] pt-0.5 border-t border-slate-800">Beli: <span className="text-amber-400 font-bold">Rp {Number(item.buy_price || 0).toLocaleString()}</span></div>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-slate-500 text-xs italic">🔒 Rahasia</span>
                                                                    )}
                                                                </td>
                                                                <td className="p-3">
                                                                    <span className={`font-extrabold font-mono text-sm px-2.5 py-1 rounded-lg border ${item.qty <= 5 ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : item.qty <= 10 ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
                                                                        {item.qty} {item.unit || 'Lembar'}
                                                                    </span>
                                                                </td>
                                                                <td className="p-3">
                                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                                                        {/* JIKA ROLE ADMIN TOKO ATAU OWNER */}
                                                                        {(userRole === 'admin_toko' || userRole === 'owner') && (
                                                                            <>
                                                                                {item.status === 'Pengajuan Proses Restock' && (
                                                                                    <button
                                                                                        onClick={() => handleOpenSupplierWaModal(item)}
                                                                                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-3 py-1.5 rounded-lg text-xs transition shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 animate-bounce"
                                                                                        title="Setujui pengajuan restock dan langsung chat supplier via WhatsApp"
                                                                                    >
                                                                                        💬 Setujui & Chat WA Supplier
                                                                                    </button>
                                                                                )}

                                                                                <button
                                                                                    onClick={() => handleOpenRestockModal(item)}
                                                                                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition shadow-md flex items-center gap-1"
                                                                                >
                                                                                    🔄 {item.status === 'Sedang Dipesan Supplier' ? 'Konfirmasi Terima Restock' : 'Restock Barang'}
                                                                                </button>
                                                                            </>
                                                                        )}

                                                                        {/* JIKA ROLE ADMIN GUDANG ATAU DIVISI */}
                                                                        {(userRole === 'admin_gudang' || userRole.startsWith('divisi_')) && (
                                                                            item.status === 'Pengajuan Proses Restock' ? (
                                                                                <span className="text-[11px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
                                                                                    ⏳ Pengajuan Menunggu Persetujuan Toko
                                                                                </span>
                                                                            ) : item.status === 'Sedang Dipesan Supplier' ? (
                                                                                <span className="text-[11px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
                                                                                    🚚 Disetujui & Dipesan ke Supplier (WA)
                                                                                </span>
                                                                            ) : (
                                                                                <button
                                                                                    onClick={() => handleRequestRestockStatus(item.id)}
                                                                                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition shadow-md flex items-center gap-1"
                                                                                    title="Ajukan kebutuhan restock barang ini ke Admin Toko"
                                                                                >
                                                                                    📩 Ajukan Stok
                                                                                </button>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="p-3">
                                                                    {item.status === 'Aman' && (
                                                                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
                                                                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                                                            Aman
                                                                        </span>
                                                                    )}
                                                                    {item.status === 'Menipis' && (
                                                                        <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
                                                                            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                                                            Menipis
                                                                        </span>
                                                                    )}
                                                                    {item.status === 'Pengajuan Proses Restock' && (
                                                                        <div className="space-y-1">
                                                                            <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
                                                                                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
                                                                                Pengajuan Restock Gudang
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                    {item.status === 'Sedang Dipesan Supplier' && (
                                                                        <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
                                                                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                                                                            Sedang Dipesan (WA Supplier)
                                                                        </span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* TABEL KACA SISA POTONGAN DI RAK */
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-bold text-slate-100">✂️ Stok Kaca Sisa Potongan di Rak Storage</h3>
                                        {(userRole === 'divisi_ht' || userRole === 'admin_gudang') && (
                                            <button onClick={() => setShowScrapModal(true)} className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm">
                                                ➕ + Input Kaca Sisa Baru
                                            </button>
                                        )}
                                    </div>

                                    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-slate-800/40 text-slate-400 uppercase text-xs">
                                                <tr>
                                                    <th className="p-3">Kode Sisa</th>
                                                    <th className="p-3">Jenis Kaca</th>
                                                    <th className="p-3">Ukuran (P x L)</th>
                                                    <th className="p-3">Lokasi Rak Storage</th>
                                                    <th className="p-3">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800">
                                                {initialScrap.map(s => (
                                                    <tr key={s.id} className="hover:bg-slate-800/30">
                                                        <td className="p-3 font-bold text-cyan-400">{s.scrap_code}</td>
                                                        <td className="p-3">{s.glass_type}</td>
                                                        <td className="p-3 font-bold">{s.length_cm} x {s.width_cm} cm</td>
                                                        <td className="p-3"><span className="bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded-full text-xs border border-purple-500/30">{s.rak_location}</span></td>
                                                        <td className="p-3"><span className="text-emerald-400 font-bold">{s.status}</span></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 5: PENGIRIMAN & SURAT JALAN MULTI-ALAMAT */}
                    {activeTab === 'deliveries' && (
                        <div className="space-y-6">
                            <div className="flex flex-wrap justify-between items-center gap-4">
                                <div>
                                    <h2 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
                                        🚚 Penugasan Pengiriman Multi-Alamat & Surat Jalan 4 Warna
                                    </h2>
                                    <p className="text-slate-400 text-sm">
                                        Admin dapat memilih beberapa alamat/SPO konsumen sekaligus untuk diangkut 1 armada & supir, serta mencetak Rute Manifest Multi-Stop.
                                    </p>
                                </div>
                                <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs font-bold text-cyan-400 flex items-center gap-2">
                                    <span>🚚 Order Siap / Sedang Kirim:</span>
                                    <span className="bg-cyan-500/20 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                                        {initialOrders.filter(o => o.status === 'pengiriman' || o.status === 'selesai' || o.status === 'pengerjaan').length} SPO
                                    </span>
                                </div>
                            </div>

                            {/* PANEL ATAS: PENUGASAN MULTI-ALAMAT ARMADA (CHECKBOX BATCH DISPATCH) */}
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

                            {/* SECTION DAFTAR TRIP MOBIL AKTIF & RUTE MANIFEST MULTI-STOP */}
                            <div className="space-y-4">
                                <div className="flex flex-wrap justify-between items-center gap-2">
                                    <h3 className="text-lg font-black text-slate-100 flex items-center gap-2">
                                        🚛 Daftar Trip Armada Mobil & Rute Alamat Tujuan Aktif
                                    </h3>
                                    <div className="flex flex-wrap gap-2 text-xs">
                                        <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                                            🏭 Admin Gudang: Siap Cetak SJ 4 Warna & Gate Pass
                                        </span>
                                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                                            🚚 Divisi Supir: Terbit di Tugas Pengiriman Driver
                                        </span>
                                    </div>
                                </div>

                                {(() => {
                                    const readyAndShipped = initialOrders.filter(o => o.status === 'pengiriman' || o.status === 'selesai' || o.assigned_driver);
                                    const deliveryList = initialDeliveries.length > 0 ? initialDeliveries : readyAndShipped.map(o => ({
                                        id: o.id,
                                        waybill_number: 'SJ-' + (o.spo_number || o.id),
                                        trip_code: o.trip_code || ('TRIP-DEMO-' + o.id),
                                        order: o,
                                        driver_name: o.assigned_driver || 'Pak Budi (Supir DC)',
                                        vehicle_plate: o.assigned_vehicle || 'Engkel Box (D 8472 AB)',
                                        waybill_color: o.payment_status === 'Lunas' ? 'Putih' : 'Merah',
                                        delivery_status: o.status === 'selesai' ? 'Selesai Terkirim' : 'Dalam Pengiriman'
                                    }));

                                    // Group by trip_code
                                    const grouped = {};
                                    deliveryList.forEach(d => {
                                        const key = d.trip_code || (d.driver_name + '_' + d.vehicle_plate);
                                        if (!grouped[key]) {
                                            grouped[key] = {
                                                trip_code: d.trip_code || key,
                                                driver_name: d.driver_name || 'Pak Budi (Supir DC)',
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

                                    const trips = Object.values(grouped);

                                    if (trips.length === 0) {
                                        return (
                                            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
                                                Belum ada trip pengiriman aktif. Silakan centang alamat pada tabel di bawah untuk menugaskan armada!
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

                            {/* TABEL PILIHAN SPO & ALAMAT PENGIRIMAN (WITH CHECKBOXES) */}
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
                                            {initialOrders.filter(o => o.status === 'pengiriman' || o.status === 'pengerjaan' || o.status === 'selesai').map(ord => {
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
                                                        {/* CHECKBOX SELECTION */}
                                                        <td className="p-3 text-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => toggleSelectOrderForBatch(ord.id)}
                                                                className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 bg-slate-950 border-slate-700 cursor-pointer"
                                                            />
                                                        </td>

                                                        {/* NOMOR SPO */}
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

                                                        {/* NAMA CUST */}
                                                        <td className="p-3">
                                                            <div className="font-bold text-slate-100">{ord.customer_name}</div>
                                                            <div className="text-xs text-cyan-300 font-mono mt-0.5">{ord.customer_phone}</div>
                                                        </td>

                                                        {/* ALAMAT */}
                                                        <td className="p-3 max-w-xs">
                                                            <div className="text-xs text-slate-200 font-medium leading-snug line-clamp-2" title={ord.customer_address}>
                                                                📍 {ord.customer_address || 'Alamat lokasi pengiriman'}
                                                            </div>
                                                        </td>

                                                        {/* SPESIFIKASI BARANG */}
                                                        <td className="p-3 space-y-1 max-w-xs">
                                                            {itemsList.map((it, idx) => (
                                                                <div key={idx} className="bg-slate-950/60 p-1.5 rounded border border-slate-800 text-xs flex justify-between gap-2">
                                                                    <span className="font-bold text-cyan-300 truncate">#{idx + 1}. {it.glass_type}</span>
                                                                    <span className="font-mono text-slate-300 text-[11px] shrink-0">{it.qty || 1} Pcs</span>
                                                                </div>
                                                            ))}
                                                        </td>

                                                        {/* SUPIR & MOBIL ASSIGNED */}
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

                                                        {/* STATUS PAYMENT */}
                                                        <td className="p-3">
                                                            <span className={`text-xs px-2.5 py-1 rounded-full font-bold inline-block ${isLunas ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
                                                                {isLunas ? 'LUNAS (Surat Jalan Putih)' : 'COD (Surat Jalan Merah)'}
                                                            </span>
                                                        </td>

                                                        {/* AKSI DOKUMEN */}
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
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 6: FINANCE */}
                    {activeTab === 'finance' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-extrabold text-slate-100">Executive Finance Dashboard</h2>
                            <div className="grid grid-cols-3 gap-5">
                                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
                                    <span className="text-xs text-slate-400">Total Omzet Pemasukan</span>
                                    <h3 className="text-3xl font-extrabold text-emerald-400 mt-1">Rp {Number(metrics.totalRevenue).toLocaleString()}</h3>
                                </div>
                                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
                                    <span className="text-xs text-slate-400">Piutang COD Surat Jalan Merah</span>
                                    <h3 className="text-3xl font-extrabold text-rose-400 mt-1">Rp {Number(metrics.pendingCOD).toLocaleString()}</h3>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 7: DATA SUPPLIER & MITRA */}
                    {activeTab === 'suppliers' && (userRole === 'admin_toko' || userRole === 'owner') && (
                        <div className="space-y-6">
                            <div className="flex flex-wrap justify-between items-center gap-4">
                                <div>
                                    <h2 className="text-2xl font-extrabold text-slate-100">🏢 Data Supplier & Mitra Kaca Industri</h2>
                                    <p className="text-slate-400 text-sm">Kelola daftar perusahaan supplier kaca, kontak PIC WhatsApp, alamat pabrik, dan status kemitraan</p>
                                </div>
                            </div>

                            {/* 4 STATS CARDS */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                                    <span className="text-xs text-slate-400 block">Total Perusahaan Supplier</span>
                                    <h3 className="text-2xl font-black text-cyan-400 mt-1">{suppliersList.length} Supplier</h3>
                                </div>
                                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                                    <span className="text-xs text-slate-400 block">Supplier Mitra Utama</span>
                                    <h3 className="text-2xl font-black text-emerald-400 mt-1">{suppliersList.filter(s => s.status === 'Mitra Utama').length} Perusahaan</h3>
                                </div>
                                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                                    <span className="text-xs text-slate-400 block">Supplier Impor / Khusus</span>
                                    <h3 className="text-2xl font-black text-purple-400 mt-1">{suppliersList.filter(s => s.status === 'Mitra Impor').length} Perusahaan</h3>
                                </div>
                                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                                    <span className="text-xs text-slate-400 block">Bahan Kaca Terhubung</span>
                                    <h3 className="text-2xl font-black text-amber-400 mt-1">{sheetGlasses.length} Jenis Kaca</h3>
                                </div>
                            </div>

                            {/* BUTTON TAMBAH SUPPLIER DIRECTLY BELOW CARDS */}
                            {(userRole === 'admin_toko' || userRole === 'owner') && (
                                <div className="flex justify-start">
                                    <button
                                        onClick={() => setShowAddSupplierModal(true)}
                                        className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black px-5 py-2.5 rounded-xl shadow-xl shadow-emerald-500/20 text-sm flex items-center gap-2 transition transform hover:scale-105 border border-cyan-300/50"
                                    >
                                        <span className="text-base">✨</span> + Tambah Supplier Baru
                                    </button>
                                </div>
                            )}

                            {/* SEARCH BAR & SUPPLIERS TABLE */}
                            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
                                <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-800 pb-3">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-bold text-slate-100 text-base">
                                            📋 Daftar Perusahaan Supplier Kaca
                                        </h3>
                                        <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2.5 py-1 rounded-full border border-cyan-500/20 font-mono font-bold">
                                            {suppliersList.length} Perusahaan
                                        </span>
                                    </div>

                                    <input
                                        type="text"
                                        placeholder="🔍 Cari Supplier / PIC / Kategori..."
                                        value={supplierSearchTerm}
                                        onChange={e => setSupplierSearchTerm(e.target.value)}
                                        className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                                    />
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-800/40 text-slate-400 uppercase text-xs">
                                            <tr>
                                                <th className="p-3">Nama Perusahaan Supplier</th>
                                                <th className="p-3">Kategori Kaca</th>
                                                <th className="p-3">PIC Kontak Person</th>
                                                <th className="p-3">No. WhatsApp</th>
                                                <th className="p-3">Alamat Pabrik / Gudang</th>
                                                <th className="p-3">Status</th>
                                                <th className="p-3">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800">
                                            {suppliersList.filter(s =>
                                                s.name.toLowerCase().includes(supplierSearchTerm.toLowerCase()) ||
                                                s.category.toLowerCase().includes(supplierSearchTerm.toLowerCase()) ||
                                                s.pic.toLowerCase().includes(supplierSearchTerm.toLowerCase())
                                            ).map(sup => (
                                                <tr key={sup.id} className="hover:bg-slate-800/30">
                                                    <td className="p-3 font-bold text-slate-100">
                                                        <div className="flex items-center gap-2">
                                                            <span>🏭</span>
                                                            <span>{sup.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        <span className="bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-2.5 py-1 rounded-full text-xs font-semibold">
                                                            {sup.category}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 font-semibold text-slate-200">
                                                        👨‍💼 {sup.pic}
                                                    </td>
                                                    <td className="p-3 font-mono font-bold text-emerald-400">
                                                        📱 +{sup.phone}
                                                    </td>
                                                    <td className="p-3 text-xs text-slate-400 max-w-xs truncate">
                                                        📍 {sup.address}
                                                    </td>
                                                    <td className="p-3">
                                                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${sup.status === 'Mitra Utama' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : sup.status === 'Mitra Impor' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-blue-500/20 text-blue-300 border-blue-500/30'}`}>
                                                            {sup.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <a
                                                                href={`https://wa.me/${sup.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Halo ${sup.name} (${sup.pic}),\n\nKami dari CV Cahya Karunia Jaya (SYP GLASS OPERATIONAL).\nIngin menanyakan katalog dan penawaran bahan kaca terbaru.\nTerima kasih!`)}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-2.5 py-1.5 rounded-lg text-xs transition flex items-center gap-1 shadow-md shadow-emerald-500/20"
                                                                title="Chat WhatsApp Direct"
                                                            >
                                                                💬 WA
                                                            </a>
                                                            {(userRole === 'admin_toko' || userRole === 'owner') && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleOpenEditSupplierModal(sup)}
                                                                        className="bg-[#2563EB] hover:bg-blue-600 text-white font-extrabold px-2.5 py-1.5 rounded-lg text-xs transition flex items-center gap-1 shadow-md shadow-blue-500/20"
                                                                        title="Edit Data Supplier"
                                                                    >
                                                                        ✏️ Edit
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteSupplier(sup.id)}
                                                                        className="bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 px-2 py-1.5 rounded-lg text-xs font-bold transition"
                                                                        title="Hapus Supplier"
                                                                    >
                                                                        🗑️
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 8: STOK AKSESORIS */}
                    {activeTab === 'accessories' && (
                        <div className="space-y-6">
                            <div className="flex flex-wrap justify-between items-center gap-4">
                                <div>
                                    <h2 className="text-2xl font-extrabold text-slate-100">🔌 Stok Aksesoris</h2>
                                    <p className="text-slate-400 text-sm">Kelola inventory aksesoris (lem sealant, lis alumunium, handle, engsel, spider fitting, & karet lis)</p>
                                </div>
                            </div>

                            {/* 4 STATS CARDS */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                                    <span className="text-xs text-slate-400 block">Total Item Aksesoris</span>
                                    <h3 className="text-2xl font-black text-cyan-400 mt-1">{accessoriesList.length} Item</h3>
                                </div>
                                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                                    <span className="text-xs text-slate-400 block">Stok Aman</span>
                                    <h3 className="text-2xl font-black text-emerald-400 mt-1">{accessoriesList.filter(a => a.status === 'Aman').length} Item</h3>
                                </div>
                                <div className={`relative border rounded-xl p-4 transition ${accessoriesList.filter(a => a.status === 'Menipis' || a.status === 'Habis' || a.status === 'Pengajuan Restock').length > 0 ? 'bg-amber-950/20 border-amber-500/60 shadow-lg shadow-amber-500/20 animate-pulse' : 'bg-slate-900/80 border-slate-800'}`}>
                                    {accessoriesList.filter(a => a.status === 'Menipis' || a.status === 'Habis' || a.status === 'Pengajuan Restock').length > 0 && (
                                        <span className="absolute -top-2.5 -right-2 bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-lg border border-amber-300 animate-bounce flex items-center gap-1 font-mono">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping"></span>
                                            🔔 Perlu Restock
                                        </span>
                                    )}
                                    <span className="text-xs text-slate-400 block">Stok Menipis / Perlu Restock</span>
                                    <h3 className="text-2xl font-black text-amber-400 mt-1">{accessoriesList.filter(a => a.status === 'Menipis' || a.status === 'Habis' || a.status === 'Pengajuan Restock').length} Item</h3>
                                </div>
                                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                                    <span className="text-xs text-slate-400 block">Estimasi Nilai Inventory</span>
                                    <h3 className="text-2xl font-black text-purple-400 mt-1">Rp {Number(accessoriesList.reduce((acc, a) => acc + (a.buy_price * a.qty), 0)).toLocaleString()}</h3>
                                </div>
                            </div>

                            {/* BUTTON TAMBAH AKSESORIS DIRECTLY BELOW CARDS */}
                            {(userRole === 'admin_toko' || userRole === 'owner') && (
                                <div className="flex justify-start">
                                    <button
                                        onClick={() => setShowAddAccModal(true)}
                                        className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black px-5 py-2.5 rounded-xl shadow-xl shadow-emerald-500/20 text-sm flex items-center gap-2 transition transform hover:scale-105 border border-cyan-300/50"
                                    >
                                        <span className="text-base">✨</span> + Tambah Aksesoris Baru
                                    </button>
                                </div>
                            )}

                            {/* SEARCH BAR & ACCESSORIES TABLE */}
                            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
                                <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-800 pb-3">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-bold text-slate-100 text-base">
                                            📋 Tabel Inventory & Harga Aksesoris Kaca
                                        </h3>
                                        <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2.5 py-1 rounded-full border border-cyan-500/20 font-mono font-bold">
                                            {accessoriesList.length} Items
                                        </span>
                                    </div>

                                    <input
                                        type="text"
                                        placeholder="🔍 Cari Kode / Nama Aksesoris..."
                                        value={accSearchTerm}
                                        onChange={e => setAccSearchTerm(e.target.value)}
                                        className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                                    />
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-800/40 text-slate-400 uppercase text-xs">
                                            <tr>
                                                <th className="p-3">Kode Barang</th>
                                                <th className="p-3">Nama Aksesoris</th>
                                                <th className="p-3">Harga Beli & Jual</th>
                                                <th className="p-3">Stok Quantity</th>
                                                <th className="p-3">Status</th>
                                                <th className="p-3">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800">
                                            {accessoriesList.filter(a =>
                                                a.acc_code.toLowerCase().includes(accSearchTerm.toLowerCase()) ||
                                                a.name.toLowerCase().includes(accSearchTerm.toLowerCase())
                                            ).map(acc => (
                                                <tr key={acc.id} className="hover:bg-slate-800/30">
                                                    <td className="p-3 font-extrabold text-cyan-400 font-mono">
                                                        {acc.acc_code}
                                                    </td>
                                                    <td className="p-3 font-bold text-slate-100">
                                                        <div>{acc.name}</div>
                                                    </td>
                                                    <td className="p-3 text-xs">
                                                        {canViewPricing ? (
                                                            <div className="space-y-0.5 font-mono">
                                                                <div className="text-slate-400">Beli: <span className="text-amber-400 font-bold">Rp {Number(acc.buy_price || 0).toLocaleString()}</span></div>
                                                                <div className="text-slate-400">Jual: <span className="text-emerald-400 font-bold">Rp {Number(acc.sell_price || 0).toLocaleString()}</span></div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-500 text-xs italic">🔒 Rahasia</span>
                                                        )}
                                                    </td>
                                                    <td className="p-3">
                                                        <span className={`font-extrabold font-mono text-sm px-2.5 py-1 rounded-lg border ${acc.qty <= 5 ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : acc.qty <= 15 ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
                                                            {acc.qty} {acc.unit || 'Pcs'}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        {acc.status === 'Aman' && (
                                                            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
                                                                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                                                Aman
                                                            </span>
                                                        )}
                                                        {acc.status === 'Menipis' && (
                                                            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
                                                                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                                                Menipis
                                                            </span>
                                                        )}
                                                        {acc.status === 'Habis' && (
                                                            <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
                                                                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                                                                Habis
                                                            </span>
                                                        )}
                                                        {acc.status === 'Pengajuan Restock' && (
                                                            <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
                                                                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
                                                                Pengajuan Restock
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <button
                                                                onClick={() => { setSelectedAccItem(acc); setAccRestockQty(10); setShowRestockAccModal(true); }}
                                                                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black px-2.5 py-1.5 rounded-lg text-xs transition shadow-md shadow-cyan-500/20"
                                                                title="Restock Aksesoris Masuk"
                                                            >
                                                                🔄 Restock
                                                            </button>
                                                            {acc.status !== 'Pengajuan Restock' && (
                                                                <button
                                                                    onClick={() => handleRequestAccRestockStatus(acc.id)}
                                                                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2.5 py-1.5 rounded-lg text-xs transition shadow-md flex items-center gap-1"
                                                                    title="Ajukan kebutuhan restock aksesoris ini"
                                                                >
                                                                    📩 Ajukan Stok
                                                                </button>
                                                            )}
                                                            {(userRole === 'admin_toko' || userRole === 'owner') && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleOpenEditAccModal(acc)}
                                                                        className="bg-[#2563EB] hover:bg-blue-600 text-white font-extrabold px-2.5 py-1.5 rounded-lg text-xs transition shadow-md shadow-blue-500/20"
                                                                        title="Edit Aksesoris"
                                                                    >
                                                                        ✏️ Edit
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteAcc(acc.id)}
                                                                        className="bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 px-2 py-1.5 rounded-lg text-xs font-bold transition"
                                                                        title="Hapus Aksesoris"
                                                                    >
                                                                        🗑️
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: PERLENGKAPAN GUDANG (BARANG HABIS PAKAI OPERASIONAL) */}
                    {activeTab === 'supplies' && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-extrabold text-slate-100">🧰 Perlengkapan & Consumables Gudang</h2>
                                <p className="text-slate-400 text-sm">Kelola inventory perlengkapan operasional gudang & pabrik yang dipakai / habis pakai (APD, sarung tangan, kacamata safety, lakban, cutter, oli mesin, dll.) serta ajukan restok ke Admin Toko.</p>
                            </div>

                            {/* STATS CARDS */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                                    <span className="text-xs text-slate-400 block">Total Jenis Perlengkapan</span>
                                    <h3 className="text-2xl font-black text-cyan-400 mt-1">{warehouseSuppliesList.length} Item</h3>
                                </div>
                                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                                    <span className="text-xs text-slate-400 block">Stok Aman</span>
                                    <h3 className="text-2xl font-black text-emerald-400 mt-1">{warehouseSuppliesList.filter(s => s.status === 'Aman').length} Item</h3>
                                </div>
                                <div className={`relative border rounded-xl p-4 transition ${warehouseSuppliesList.filter(s => s.status === 'Menipis' || s.status === 'Habis').length > 0 ? 'bg-amber-950/20 border-amber-500/60 shadow-lg shadow-amber-500/20 animate-pulse' : 'bg-slate-900/80 border-slate-800'}`}>
                                    {warehouseSuppliesList.filter(s => s.status === 'Menipis' || s.status === 'Habis').length > 0 && (
                                        <span className="absolute -top-2.5 -right-2 bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-lg border border-amber-300 animate-bounce flex items-center gap-1 font-mono">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping"></span>
                                            🔔 Perlu Restok
                                        </span>
                                    )}
                                    <span className="text-xs text-slate-400 block">Stok Menipis / Perlu Restok</span>
                                    <h3 className="text-2xl font-black text-amber-400 mt-1">{warehouseSuppliesList.filter(s => s.status === 'Menipis' || s.status === 'Habis').length} Item</h3>
                                </div>
                                <div className={`relative border rounded-xl p-4 transition ${supplyRestockRequests.filter(r => r.status !== 'Selesai Restok').length > 0 ? 'bg-purple-950/20 border-purple-500/60 shadow-lg shadow-purple-500/20 animate-pulse' : 'bg-slate-900/80 border-slate-800'}`}>
                                    {supplyRestockRequests.filter(r => r.status !== 'Selesai Restok').length > 0 && (
                                        <span className="absolute -top-2.5 -right-2 bg-purple-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-lg border border-purple-300 animate-bounce flex items-center gap-1 font-mono">
                                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                                            🔔 {supplyRestockRequests.filter(r => r.status !== 'Selesai Restok').length} Pengajuan
                                        </span>
                                    )}
                                    <span className="text-xs text-slate-400 block">Pengajuan Restok Aktif</span>
                                    <h3 className="text-2xl font-black text-purple-400 mt-1">{supplyRestockRequests.filter(r => r.status !== 'Selesai Restok').length} Pengajuan</h3>
                                </div>
                            </div>

                            {/* BUTTON ACTION & SUBTAB TOGGLE */}
                            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setSupplySubTab('katalog')}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${supplySubTab === 'katalog' ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                                    >
                                        📦 Katalog Perlengkapan ({warehouseSuppliesList.length})
                                    </button>
                                    <button
                                        onClick={() => setSupplySubTab('usage_log')}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${supplySubTab === 'usage_log' ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                                    >
                                        📋 Log Pemakaian Gudang ({supplyUsageLogs.length})
                                    </button>
                                    <button
                                        onClick={() => setSupplySubTab('restock_requests')}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${supplySubTab === 'restock_requests' ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                                    >
                                        <span>📩 Pengajuan Restok ke Admin Toko</span>
                                        {supplyRestockRequests.filter(r => r.status !== 'Selesai Restok').length > 0 && (
                                            <span className="bg-purple-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce shadow-sm font-mono">
                                                {supplyRestockRequests.filter(r => r.status !== 'Selesai Restok').length} Restok
                                            </span>
                                        )}
                                    </button>
                                </div>

                                <div className="flex items-center gap-2">
                                    {(userRole === 'admin_gudang' || userRole === 'owner') && (
                                        <>
                                            <button
                                                onClick={() => handleOpenRequestRestockModal(null)}
                                                className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition shadow-md shadow-amber-500/20"
                                            >
                                                <span>📩</span> + Ajukan Restok ke Admin Toko
                                            </button>
                                            <button
                                                onClick={() => setShowAddSupplyModal(true)}
                                                className="bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold px-4 py-2 rounded-lg border border-cyan-500/30 text-xs flex items-center gap-1.5 transition"
                                            >
                                                <span>✨</span> + Tambah Perlengkapan Baru
                                            </button>
                                            <button
                                                onClick={() => setShowUseSupplyModal(true)}
                                                className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition shadow-md shadow-cyan-500/20"
                                            >
                                                <span>📝</span> + Catat Pemakaian Barang
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* SUBTAB CONTENT 1: KATALOG PERLENGKAPAN */}
                            {supplySubTab === 'katalog' && (
                                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
                                    <div className="flex flex-wrap justify-between items-center gap-4">
                                        <h3 className="font-extrabold text-slate-200 text-base">📋 Master Inventory Perlengkapan Gudang</h3>
                                        <input
                                            type="text"
                                            placeholder="🔍 Cari Kode / Nama Perlengkapan / Kategori..."
                                            value={supplySearchTerm}
                                            onChange={e => setSupplySearchTerm(e.target.value)}
                                            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 w-64 focus:border-cyan-400"
                                        />
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs text-slate-300">
                                            <thead className="bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px]">
                                                <tr>
                                                    <th className="p-3">Kode</th>
                                                    <th className="p-3">Nama Perlengkapan Operasional</th>
                                                    <th className="p-3">Kategori</th>
                                                    <th className="p-3 text-center">Stok</th>
                                                    <th className="p-3">Lokasi Simpan</th>
                                                    <th className="p-3 text-center">Status Stok</th>
                                                    <th className="p-3 text-right">Aksi Gudang</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800">
                                                {warehouseSuppliesList
                                                    .filter(s =>
                                                        s.name.toLowerCase().includes(supplySearchTerm.toLowerCase()) ||
                                                        s.item_code.toLowerCase().includes(supplySearchTerm.toLowerCase()) ||
                                                        s.category.toLowerCase().includes(supplySearchTerm.toLowerCase())
                                                    )
                                                    .map(s => (
                                                        <tr key={s.id} className="hover:bg-slate-800/40 transition">
                                                            <td className="p-3 font-mono text-cyan-400 font-bold">{s.item_code}</td>
                                                            <td className="p-3 font-bold text-slate-100">{s.name}</td>
                                                            <td className="p-3 text-slate-400">{s.category}</td>
                                                            <td className="p-3 text-center font-extrabold text-slate-100">
                                                                {s.stock_qty} <span className="text-[10px] text-slate-400 font-normal">{s.unit}</span>
                                                            </td>
                                                            <td className="p-3 text-slate-400">{s.location}</td>
                                                            <td className="p-3 text-center">
                                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${s.status === 'Aman' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : s.status === 'Menipis' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
                                                                    {s.status}
                                                                </span>
                                                            </td>
                                                            <td className="p-3 text-right">
                                                                {(userRole === 'admin_gudang' || userRole === 'owner') && (
                                                                    <button
                                                                        onClick={() => handleOpenRequestRestockModal(s)}
                                                                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ml-auto ${s.status !== 'Aman' ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20 animate-pulse' : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30'}`}
                                                                        title="Ajukan Restok Barang ini ke Admin Toko"
                                                                    >
                                                                        <span>📩</span> Ajukan Restok
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* SUBTAB CONTENT 2: LOG PEMAKAIAN */}
                            {supplySubTab === 'usage_log' && (
                                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
                                    <h3 className="font-extrabold text-slate-200 text-base">📋 Riwayat & Log Pemakaian Perlengkapan Operasional</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs text-slate-300">
                                            <thead className="bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px]">
                                                <tr>
                                                    <th className="p-3">Tanggal</th>
                                                    <th className="p-3">Kode & Nama Perlengkapan</th>
                                                    <th className="p-3 text-center">Jumlah Dipakai</th>
                                                    <th className="p-3">Divisi Pengambil</th>
                                                    <th className="p-3">Nama Pengambil</th>
                                                    <th className="p-3">Catatan Pemakaian</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800">
                                                {supplyUsageLogs.map(log => (
                                                    <tr key={log.id} className="hover:bg-slate-800/40 transition">
                                                        <td className="p-3 text-slate-400">{log.usage_date}</td>
                                                        <td className="p-3">
                                                            <div className="font-bold text-slate-100">{log.item_name}</div>
                                                            <div className="text-[10px] font-mono text-cyan-400">{log.item_code}</div>
                                                        </td>
                                                        <td className="p-3 text-center font-extrabold text-cyan-300">
                                                            {log.used_qty} {log.unit}
                                                        </td>
                                                        <td className="p-3 font-semibold text-slate-300">{log.user_division}</td>
                                                        <td className="p-3 text-slate-300">{log.taker_name}</td>
                                                        <td className="p-3 text-slate-400 italic">{log.notes}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* SUBTAB CONTENT 3: PENGAJUAN RESTOK KE ADMIN TOKO */}
                            {supplySubTab === 'restock_requests' && (
                                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
                                    <div className="flex flex-wrap justify-between items-center gap-4">
                                        <div>
                                            <h3 className="font-extrabold text-slate-200 text-base">📩 Daftar Pengajuan Restok Perlengkapan ke Admin Toko</h3>
                                            <p className="text-xs text-slate-400">Monitoring pengajuan restok barang gudang yang diajukan Admin Gudang ke Admin Toko/Purchasing.</p>
                                        </div>
                                        {(userRole === 'admin_gudang' || userRole === 'owner') && (
                                            <button
                                                onClick={() => handleOpenRequestRestockModal(null)}
                                                className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition shadow-md shadow-amber-500/20"
                                            >
                                                <span>📩</span> + Ajukan Restok Baru
                                            </button>
                                        )}
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs text-slate-300">
                                            <thead className="bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px]">
                                                <tr>
                                                    <th className="p-3">Tanggal</th>
                                                    <th className="p-3">Kode & Nama Perlengkapan</th>
                                                    <th className="p-3 text-center">Jumlah Restok</th>
                                                    <th className="p-3">Prioritas</th>
                                                    <th className="p-3">Diajukan Oleh</th>
                                                    <th className="p-3">Catatan / Keperluan</th>
                                                    <th className="p-3 text-center">Status Pengajuan</th>
                                                    <th className="p-3 text-right">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800">
                                                {supplyRestockRequests.map(req => (
                                                    <tr key={req.id} className="hover:bg-slate-800/40 transition">
                                                        <td className="p-3 text-slate-400">{req.requested_at}</td>
                                                        <td className="p-3">
                                                            <div className="font-bold text-slate-100">{req.item_name}</div>
                                                            <div className="text-[10px] font-mono text-cyan-400">{req.item_code} (Sisa: {req.current_stock} {req.unit})</div>
                                                        </td>
                                                        <td className="p-3 text-center font-extrabold text-amber-300">
                                                            +{req.request_qty} {req.unit}
                                                        </td>
                                                        <td className="p-3">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${req.priority.includes('Mendesak') ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-800 text-slate-300'}`}>
                                                                {req.priority}
                                                            </span>
                                                        </td>
                                                        <td className="p-3 text-slate-300">{req.requested_by}</td>
                                                        <td className="p-3 text-slate-400 italic max-w-xs truncate">{req.notes}</td>
                                                        <td className="p-3 text-center">
                                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${req.status === 'Menunggu Persetujuan Admin Toko' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : req.status === 'Disetujui & Dipesan' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                                                                {req.status}
                                                            </span>
                                                        </td>
                                                        <td className="p-3 text-right">
                                                            <div className="flex justify-end gap-1.5">
                                                                {req.status === 'Menunggu Persetujuan Admin Toko' && (userRole === 'admin_toko' || userRole === 'owner') && (
                                                                    <button
                                                                        onClick={() => handleApproveRestockRequest(req.id)}
                                                                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-2.5 py-1 rounded text-[11px] transition shadow"
                                                                        title="Setujui dan pesan barang dari supplier"
                                                                    >
                                                                        ✓ Setujui & Pesan
                                                                    </button>
                                                                )}

                                                                {req.status === 'Disetujui & Dipesan' && (userRole === 'admin_gudang' || userRole === 'admin_toko' || userRole === 'owner') && (
                                                                    <button
                                                                        onClick={() => handleCompleteRestockRequest(req)}
                                                                        className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black px-2.5 py-1 rounded text-[11px] transition shadow"
                                                                        title="Konfirmasi barang dari supplier sudah tiba di gudang (stok otomatis bertambah)"
                                                                    >
                                                                        📦 Barang Datang (Selesai)
                                                                    </button>
                                                                )}

                                                                <button
                                                                    onClick={() => {
                                                                        const waMsg = `Halo Admin Toko SYP Glass,%0A%0AFollow-up Pengajuan Restok Perlengkapan Gudang:%0A• Barang: [${req.item_code}] ${req.item_name}%0A• Jumlah: ${req.request_qty} ${req.unit}%0A• Status Saat Ini: ${req.status}`;
                                                                        window.open(`https://api.whatsapp.com/send?text=${waMsg}`, '_blank');
                                                                    }}
                                                                    className="bg-slate-800 hover:bg-slate-700 text-emerald-400 px-2 py-1 rounded text-[11px] border border-emerald-500/30"
                                                                    title="Kirim pesan WhatsApp"
                                                                >
                                                                    💬 WA
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: ALAT PENUNJANG & PEMINJAMAN TEKNISI */}
                    {activeTab === 'tools' && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-extrabold text-slate-100">🛠️ Peminjaman & Inventory Alat Penunjang</h2>
                                <p className="text-slate-400 text-sm">Kelola peminjaman alat mesin (bor kaca, slepan, mata bor, vakum, tangga, obeng, mesin rumput, cangkul, dll.) oleh teknisi</p>
                            </div>

                            {/* 4 STATS CARDS */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                                    <span className="text-xs text-slate-400 block">Total Jenis Alat Penunjang</span>
                                    <h3 className="text-2xl font-black text-cyan-400 mt-1">{toolsList.length} Jenis</h3>
                                </div>
                                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                                    <span className="text-xs text-slate-400 block">Total Unit Siap Dipinjam</span>
                                    <h3 className="text-2xl font-black text-emerald-400 mt-1">{toolsList.reduce((sum, t) => sum + t.available_qty, 0)} Unit</h3>
                                </div>
                                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                                    <span className="text-xs text-slate-400 block">Alat Sedang Dipinjam</span>
                                    <h3 className="text-2xl font-black text-amber-400 mt-1">{toolBorrowings.filter(b => b.status === 'Sedang Dipinjam').length} Peminjaman</h3>
                                </div>
                                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                                    <span className="text-xs text-slate-400 block">Kondisi Perlu Maintenance</span>
                                    <h3 className="text-2xl font-black text-rose-400 mt-1">{toolsList.filter(t => t.condition !== 'Bagus').length} Alat</h3>
                                </div>
                            </div>

                            {/* BUTTON ACTION & SUBTAB TOGGLE DIRECTLY BELOW CARDS */}
                            <div className="flex flex-wrap justify-between items-center gap-4">
                                {(userRole === 'admin_toko' || userRole === 'admin_gudang' || userRole === 'owner') && (
                                    <div className="flex flex-wrap items-center gap-3">
                                        <button
                                            onClick={() => setShowAddToolModal(true)}
                                            className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black px-5 py-2.5 rounded-xl shadow-xl shadow-emerald-500/20 text-sm flex items-center gap-2 transition transform hover:scale-105 border border-cyan-300/50"
                                        >
                                            <span className="text-base">✨</span> + Tambah Alat Penunjang Baru
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (toolsList.length === 0) {
                                                    alert('Belum ada alat di katalog! Silakan tambah alat baru terlebih dahulu.');
                                                    return;
                                                }
                                                setShowBorrowToolModal(true);
                                            }}
                                            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black px-5 py-2.5 rounded-xl shadow-xl shadow-cyan-500/20 text-sm flex items-center gap-2 transition transform hover:scale-105 border border-blue-300/50"
                                        >
                                            <span className="text-base">📋</span> + Catat Peminjaman Alat
                                        </button>
                                    </div>
                                )}

                                {/* SUB TAB TOGGLE (Katalog Alat vs Log Peminjaman) MOVED HERE */}
                                <div className="flex items-center bg-slate-900 border border-slate-800 p-1.5 rounded-xl shadow-lg gap-1">
                                    <button
                                        onClick={() => setToolSubTab('katalog')}
                                        className={`px-4 py-2 rounded-lg text-xs font-extrabold transition ${toolSubTab === 'katalog' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        📦 Katalog & Inventory Alat ({toolsList.length})
                                    </button>
                                    <button
                                        onClick={() => setToolSubTab('peminjaman')}
                                        className={`px-4 py-2 rounded-lg text-xs font-extrabold transition ${toolSubTab === 'peminjaman' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        📋 Log Peminjaman Alat ({toolBorrowings.filter(b => b.status === 'Sedang Dipinjam').length} Aktif)
                                    </button>
                                    <button
                                        onClick={() => setToolSubTab('perbaikan')}
                                        className={`px-4 py-2 rounded-lg text-xs font-extrabold transition ${toolSubTab === 'perbaikan' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        🔧 Log Perbaikan & Mesin Rusak ({toolsList.filter(t => (t.damaged_qty || 0) > 0 || (t.lost_qty || 0) > 0 || t.condition !== 'Bagus').length})
                                    </button>
                                </div>
                            </div>

                            {/* SUBTAB CONTENT 1: KATALOG ALAT */}
                            {toolSubTab === 'katalog' ? (
                                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
                                    <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-800 pb-3">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-bold text-slate-100 text-base">
                                                📋 Daftar Inventory Alat Mesin & Perkakas Teknisi
                                            </h3>
                                            <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2.5 py-1 rounded-full border border-cyan-500/20 font-mono font-bold">
                                                {toolsList.length} Item Alat
                                            </span>
                                        </div>

                                        <input
                                            type="text"
                                            placeholder="🔍 Cari Kode / Nama Alat / Kategori..."
                                            value={toolSearchTerm}
                                            onChange={e => setToolSearchTerm(e.target.value)}
                                            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                                        />
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-slate-800/40 text-slate-400 uppercase text-xs">
                                                <tr>
                                                    <th className="p-3">Kode Alat</th>
                                                    <th className="p-3">Nama Alat / Mesin</th>
                                                    <th className="p-3">Kategori</th>
                                                    <th className="p-3">Lokasi Penyimpanan</th>
                                                    <th className="p-3">Total Qty</th>
                                                    <th className="p-3">Status Availability</th>
                                                    <th className="p-3">Kondisi Alat</th>
                                                    <th className="p-3">Aksi Admin & Kondisi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800">
                                                {toolsList.filter(t =>
                                                    t.tool_code.toLowerCase().includes(toolSearchTerm.toLowerCase()) ||
                                                    t.name.toLowerCase().includes(toolSearchTerm.toLowerCase()) ||
                                                    t.category.toLowerCase().includes(toolSearchTerm.toLowerCase())
                                                ).length === 0 ? (
                                                    <tr>
                                                        <td colSpan="8" className="p-6 text-center text-slate-500 text-xs italic">
                                                            Belum ada data alat penunjang. Klik tombol "+ Tambah Alat Penunjang Baru" di atas untuk menambah.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    toolsList.filter(t =>
                                                        t.tool_code.toLowerCase().includes(toolSearchTerm.toLowerCase()) ||
                                                        t.name.toLowerCase().includes(toolSearchTerm.toLowerCase()) ||
                                                        t.category.toLowerCase().includes(toolSearchTerm.toLowerCase())
                                                    ).map(t => (
                                                        <tr key={t.id} className="hover:bg-slate-800/30 transition">
                                                            <td className="p-3 font-extrabold text-cyan-400 font-mono text-sm">{t.tool_code}</td>
                                                            <td className="p-3 font-bold text-slate-100">
                                                                <div className="flex items-center gap-2">
                                                                    <span>🛠️</span>
                                                                    <span>{t.name}</span>
                                                                </div>
                                                            </td>
                                                            <td className="p-3">
                                                                <span className="bg-slate-800 text-cyan-300 border border-slate-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                                                                    {t.category}
                                                                </span>
                                                            </td>
                                                            <td className="p-3 text-xs text-slate-300 font-mono">📍 {t.location}</td>
                                                            <td className="p-3 font-mono font-bold text-slate-200">{t.total_qty} {t.unit}</td>
                                                            <td className="p-3">
                                                                <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${t.available_qty > 0 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'}`}>
                                                                    {t.available_qty > 0 ? `Tersedia (${t.available_qty} ${t.unit})` : 'Habis Dipinjam'}
                                                                </span>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="space-y-1">
                                                                    <span className={`inline-block text-xs px-2 py-0.5 rounded font-bold border ${t.condition === 'Bagus' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : t.condition === 'Hilang' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                                                        {t.condition}
                                                                    </span>
                                                                    {((t.damaged_qty || 0) > 0 || (t.lost_qty || 0) > 0) && (
                                                                        <div className="text-[10px] font-mono space-y-0.5">
                                                                            {(t.damaged_qty || 0) > 0 && <span className="text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded block border border-amber-500/20">⚠️ Rusak: {t.damaged_qty} {t.unit}</span>}
                                                                            {(t.lost_qty || 0) > 0 && <span className="text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded block border border-rose-500/20">❌ Hilang: {t.lost_qty} {t.unit}</span>}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="p-3">
                                                                {(userRole === 'admin_toko' || userRole === 'admin_gudang' || userRole === 'owner') && (
                                                                    <button
                                                                        onClick={() => handleOpenEditToolModal(t)}
                                                                        className="bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 font-bold px-3 py-1.5 rounded-lg text-xs transition border border-slate-700 flex items-center gap-1 shadow-sm"
                                                                    >
                                                                        ⚙️ Update Kondisi / Stok
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : toolSubTab === 'peminjaman' ? (
                                /* SUBTAB CONTENT 2: LOG PEMINJAMAN ALAT */
                                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
                                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                                        <h3 className="font-bold text-slate-100 text-base">
                                            📋 Log Peminjaman & Pengembalian Alat Oleh Teknisi
                                        </h3>
                                        <span className="text-xs bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full border border-amber-500/30 font-bold">
                                            {toolBorrowings.filter(b => b.status === 'Sedang Dipinjam').length} Alat Masih Dipinjam
                                        </span>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-slate-800/40 text-slate-400 uppercase text-xs">
                                                <tr>
                                                    <th className="p-3">Kode & Nama Alat</th>
                                                    <th className="p-3">Teknisi Peminjam</th>
                                                    <th className="p-3">Keperluan Pekerjaan</th>
                                                    <th className="p-3">Qty Dipinjam</th>
                                                    <th className="p-3">Tanggal Pinjam</th>
                                                    <th className="p-3">Estimasi Kembali</th>
                                                    <th className="p-3">Status Peminjaman</th>
                                                    <th className="p-3">Aksi Admin</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800">
                                                {toolBorrowings.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="8" className="p-6 text-center text-slate-500 text-xs italic">
                                                            Belum ada riwayat peminjaman alat.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    toolBorrowings.map(b => (
                                                        <tr key={b.id} className="hover:bg-slate-800/30 transition">
                                                            <td className="p-3 max-w-sm">
                                                                {Array.isArray(b.items) && b.items.length > 0 ? (
                                                                    <div className="space-y-1">
                                                                        {b.items.map((it, idx) => (
                                                                            <div key={idx} className="bg-slate-950/70 px-2 py-1 rounded border border-slate-800 flex items-center justify-between gap-2 text-xs">
                                                                                <span className="font-extrabold text-cyan-300 font-mono text-[11px]">{it.tool_code}</span>
                                                                                <span className="font-bold text-slate-100 flex-1 truncate">{it.tool_name}</span>
                                                                                <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">{it.qty} {it.unit}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <div>
                                                                        <div className="font-extrabold text-cyan-400 font-mono text-sm">{b.tool_code}</div>
                                                                        <div className="font-bold text-slate-100 text-xs">{b.tool_name}</div>
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="p-3 font-bold text-slate-200">
                                                                👨‍🔧 {b.borrower_name}
                                                            </td>
                                                            <td className="p-3 text-xs text-slate-300 max-w-xs">
                                                                📝 {b.purpose}
                                                            </td>
                                                            <td className="p-3 font-mono font-bold text-amber-400">{b.qty_borrowed} Unit</td>
                                                            <td className="p-3 text-xs font-mono text-slate-300">{b.borrow_date}</td>
                                                            <td className="p-3 text-xs font-mono text-cyan-300">{b.expected_return}</td>
                                                            <td className="p-3">
                                                                <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${b.status === 'Sedang Dipinjam' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
                                                                    {b.status}
                                                                </span>
                                                            </td>
                                                            <td className="p-3">
                                                                {b.status === 'Sedang Dipinjam' ? (
                                                                    (userRole === 'admin_toko' || userRole === 'admin_gudang' || userRole === 'owner') && (
                                                                        <button
                                                                            onClick={() => handleOpenReturnModal(b)}
                                                                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-3 py-1.5 rounded-lg text-xs transition shadow-md flex items-center gap-1"
                                                                        >
                                                                            ✅ Konfirmasi Kembalikan
                                                                        </button>
                                                                    )
                                                                ) : (
                                                                    <div className="flex flex-col items-start gap-1">
                                                                        <span className="text-xs text-emerald-400 font-bold font-mono">
                                                                            Selesai ({b.actual_return})
                                                                        </span>
                                                                        {(userRole === 'admin_toko' || userRole === 'admin_gudang' || userRole === 'owner') && (
                                                                            <button
                                                                                onClick={() => handleOpenReturnModal(b)}
                                                                                className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-semibold flex items-center gap-0.5"
                                                                            >
                                                                                ✏️ Edit Tgl Kembali
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                /* SUBTAB CONTENT 3: LOG PERBAIKAN & ALAT RUSAK / HILANG */
                                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
                                    <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-800 pb-3">
                                        <div>
                                            <h3 className="font-bold text-amber-400 text-base flex items-center gap-2">
                                                🔧 Log Catatan Perbaikan Mesin Rusak & Laporan Hilang
                                            </h3>
                                            <p className="text-xs text-slate-400">Monitoring mesin yang membutuhkan servis/sparepart serta arsip riwayat perbaikan alat operasional.</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs bg-amber-500/20 text-amber-300 px-3 py-1.5 rounded-lg border border-amber-500/30 font-bold">
                                                ⚠️ {toolsList.reduce((sum, t) => sum + (t.damaged_qty || 0), 0)} Unit Rusak/Servis
                                            </span>
                                            <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-500/30 font-bold">
                                                ✅ {toolsList.filter(t => t.repair_stage === 'Selesai' || t.repair_details).length} Riwayat Selesai
                                            </span>
                                            <span className="text-xs bg-rose-500/20 text-rose-300 px-3 py-1.5 rounded-lg border border-rose-500/30 font-bold">
                                                ❌ {toolsList.reduce((sum, t) => sum + (t.lost_qty || 0), 0)} Unit Hilang
                                            </span>
                                        </div>
                                    </div>

                                    {/* REPAIR SUB-FILTER BUTTONS */}
                                    <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-2 rounded-xl border border-slate-800 text-xs">
                                        <div className="flex items-center gap-1.5 font-bold">
                                            <span className="text-slate-400 pl-1 text-[11px]">Filter Log:</span>
                                            <button
                                                onClick={() => setRepairFilterTab('semua')}
                                                className={`px-3 py-1.5 rounded-lg transition ${repairFilterTab === 'semua' ? 'bg-cyan-500 text-slate-950 font-extrabold shadow' : 'text-slate-400 hover:text-white bg-slate-900'}`}
                                            >
                                                📋 Semua Log ({toolsList.filter(t => (t.damaged_qty || 0) > 0 || (t.lost_qty || 0) > 0 || t.repair_stage === 'Selesai' || t.repair_details || t.condition_notes).length})
                                            </button>
                                            <button
                                                onClick={() => setRepairFilterTab('aktif')}
                                                className={`px-3 py-1.5 rounded-lg transition ${repairFilterTab === 'aktif' ? 'bg-amber-500 text-slate-950 font-extrabold shadow' : 'text-amber-400 hover:text-amber-300 bg-slate-900'}`}
                                            >
                                                ⚠️ Aktif Perbaikan ({toolsList.filter(t => (t.damaged_qty || 0) > 0 || t.repair_stage === 'Sedang Dalam Perbaikan').length})
                                            </button>
                                            <button
                                                onClick={() => setRepairFilterTab('selesai')}
                                                className={`px-3 py-1.5 rounded-lg transition ${repairFilterTab === 'selesai' ? 'bg-emerald-500 text-slate-950 font-extrabold shadow' : 'text-emerald-400 hover:text-emerald-300 bg-slate-900'}`}
                                            >
                                                ✅ Riwayat Selesai ({toolsList.filter(t => t.repair_stage === 'Selesai' || t.repair_details).length})
                                            </button>
                                            <button
                                                onClick={() => setRepairFilterTab('hilang')}
                                                className={`px-3 py-1.5 rounded-lg transition ${repairFilterTab === 'hilang' ? 'bg-rose-500 text-slate-950 font-extrabold shadow' : 'text-rose-400 hover:text-rose-300 bg-slate-900'}`}
                                            >
                                                ❌ Tool Hilang ({toolsList.filter(t => (t.lost_qty || 0) > 0 || t.condition === 'Hilang').length})
                                            </button>
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-slate-800/40 text-slate-400 uppercase text-xs">
                                                <tr>
                                                    <th className="p-3">Kode & Nama Alat</th>
                                                    <th className="p-3">Kategori & Lokasi</th>
                                                    <th className="p-3">Kondisi Saat Ini</th>
                                                    <th className="p-3">Rincian Stok (Rusak / Hilang)</th>
                                                    <th className="p-3 max-w-sm">📝 Catatan Kerusakan & Kronologi Perbaikan</th>
                                                    <th className="p-3">Aksi Servis Admin</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800">
                                                {toolsList.filter(t => {
                                                    const isDamaged = (t.damaged_qty || 0) > 0 || t.repair_stage === 'Sedang Dalam Perbaikan' || t.condition === 'Rusak Ringan' || t.condition === 'Rusak Berat';
                                                    const isLost = (t.lost_qty || 0) > 0 || t.condition === 'Hilang';
                                                    const isCompleted = t.repair_stage === 'Selesai' || t.repair_details;
                                                    const hasHistory = isDamaged || isLost || isCompleted || t.condition_notes;

                                                    if (!hasHistory) return false;

                                                    if (repairFilterTab === 'aktif') return isDamaged;
                                                    if (repairFilterTab === 'selesai') return isCompleted;
                                                    if (repairFilterTab === 'hilang') return isLost;
                                                    return true; // 'semua'
                                                }).length === 0 ? (
                                                    <tr>
                                                        <td colSpan="6" className="p-8 text-center text-slate-500 text-xs italic">
                                                            Belum ada data log perbaikan atau riwayat alat untuk kategori filter ini.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    toolsList.filter(t => {
                                                        const isDamaged = (t.damaged_qty || 0) > 0 || t.repair_stage === 'Sedang Dalam Perbaikan' || t.condition === 'Rusak Ringan' || t.condition === 'Rusak Berat';
                                                        const isLost = (t.lost_qty || 0) > 0 || t.condition === 'Hilang';
                                                        const isCompleted = t.repair_stage === 'Selesai' || t.repair_details;
                                                        const hasHistory = isDamaged || isLost || isCompleted || t.condition_notes;

                                                        if (!hasHistory) return false;

                                                        if (repairFilterTab === 'aktif') return isDamaged;
                                                        if (repairFilterTab === 'selesai') return isCompleted;
                                                        if (repairFilterTab === 'hilang') return isLost;
                                                        return true; // 'semua'
                                                    }).map(t => (
                                                        <tr key={t.id} className="hover:bg-slate-800/30 transition">
                                                            <td className="p-3">
                                                                <div className="font-extrabold text-cyan-400 font-mono text-sm">{t.tool_code}</div>
                                                                <div className="font-bold text-slate-100 text-xs">{t.name}</div>
                                                            </td>
                                                            <td className="p-3 text-xs">
                                                                <span className="bg-slate-800 text-cyan-300 border border-slate-700 px-2 py-0.5 rounded text-[11px] block w-fit mb-1">{t.category}</span>
                                                                <span className="text-slate-400 font-mono text-[11px]">📍 {t.location}</span>
                                                            </td>
                                                            <td className="p-3">
                                                                <span className={`text-xs px-2.5 py-1 rounded font-bold border ${t.condition === 'Bagus' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : t.condition === 'Hilang' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                                                    {t.condition}
                                                                </span>
                                                            </td>
                                                            <td className="p-3 text-xs font-mono">
                                                                {(t.damaged_qty || 0) > 0 && (
                                                                    <div className="text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20 font-bold mb-1">
                                                                        ⚠️ Rusak: {t.damaged_qty} {t.unit}
                                                                    </div>
                                                                )}
                                                                {(t.lost_qty || 0) > 0 && (
                                                                    <div className="text-rose-400 bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20 font-bold">
                                                                        ❌ Hilang: {t.lost_qty} {t.unit}
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="p-3 max-w-sm text-xs space-y-1.5">
                                                                {t.repair_details ? (
                                                                    <div className="bg-slate-950 p-3 rounded-lg border border-emerald-500/30 space-y-1 shadow-inner text-slate-200">
                                                                        <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                                                                            <span className="font-extrabold text-emerald-400 text-[11px]">✅ Log Perbaikan Selesai</span>
                                                                            <span className="font-mono text-[10px] text-slate-400">📅 {t.repair_details.completion_date}</span>
                                                                        </div>
                                                                        {t.repair_details.damaged_part && (
                                                                            <div className="text-[11px]"><b className="text-amber-400">📌 Bagian Rusak:</b> {t.repair_details.damaged_part}</div>
                                                                        )}
                                                                        {t.repair_details.action_taken && (
                                                                            <div className="text-[11px]"><b className="text-cyan-400">🛠️ Tindakan:</b> {t.repair_details.action_taken}</div>
                                                                        )}
                                                                        {t.repair_details.replaced_components && (
                                                                            <div className="text-[11px]"><b className="text-teal-300">🔩 Komponen Diganti:</b> {t.repair_details.replaced_components}</div>
                                                                        )}
                                                                        {(t.repair_details.repair_cost || t.repair_details.technician_name) && (
                                                                            <div className="flex justify-between text-[10px] pt-1 text-slate-400 font-mono border-t border-slate-900">
                                                                                <span>👨‍🔧 {t.repair_details.technician_name || 'Servis Toko'}</span>
                                                                                {t.repair_details.repair_cost && <span className="text-amber-300 font-bold">💵 Rp {parseInt(t.repair_details.repair_cost).toLocaleString()}</span>}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : t.condition_notes ? (
                                                                    <div className="bg-slate-950 p-2.5 rounded-lg border border-amber-500/30 text-amber-200 text-xs leading-relaxed font-sans shadow-inner">
                                                                        💬 <span className="font-semibold">"{t.condition_notes}"</span>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-slate-500 italic text-xs">Belum ada catatan detail.</span>
                                                                )}
                                                            </td>
                                                            <td className="p-3 space-y-1.5">
                                                                {(userRole === 'admin_toko' || userRole === 'admin_gudang' || userRole === 'owner') && (
                                                                    <>
                                                                        {/* TAHAP 1: PERLU PERBAIKAN / BELUM DIMULAI */}
                                                                        {(!t.repair_stage || t.repair_stage === 'Perlu Perbaikan') && (t.damaged_qty || 0) > 0 && (
                                                                            <button
                                                                                onClick={() => handleStartRepair(t.id)}
                                                                                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold px-3 py-2 rounded-lg text-xs transition shadow-md flex items-center justify-center gap-1.5"
                                                                            >
                                                                                ⚙️ Mulai Perbaikan
                                                                            </button>
                                                                        )}

                                                                        {/* TAHAP 2: SEDANG DALAM PERBAIKAN */}
                                                                        {t.repair_stage === 'Sedang Dalam Perbaikan' && (
                                                                            <div className="space-y-1.5">
                                                                                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-extrabold px-2.5 py-1 rounded-lg block text-center animate-pulse">
                                                                                    🛠️ Sedang Dalam Perbaikan
                                                                                </span>
                                                                                <button
                                                                                    onClick={() => handleOpenCompleteRepairModal(t)}
                                                                                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-3 py-2 rounded-lg text-xs transition shadow-md flex items-center justify-center gap-1.5"
                                                                                >
                                                                                    ✅ Perbaikan Selesai
                                                                                </button>
                                                                            </div>
                                                                        )}

                                                                        {/* TAHAP 3: PERBAIKAN SELESAI */}
                                                                        {t.repair_stage === 'Selesai' && (
                                                                            <div className="space-y-1.5">
                                                                                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-extrabold px-2.5 py-1 rounded-lg block text-center">
                                                                                    ✅ Perbaikan Selesai
                                                                                </span>
                                                                                <button
                                                                                    onClick={() => handleOpenCompleteRepairModal(t)}
                                                                                    className="w-full bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 font-extrabold px-3 py-1.5 rounded-lg text-xs transition border border-slate-700 flex items-center justify-center gap-1"
                                                                                >
                                                                                    ✏️ Edit Detail Perbaikan
                                                                                </button>
                                                                            </div>
                                                                        )}

                                                                        <button
                                                                            onClick={() => handleOpenEditToolModal(t)}
                                                                            className="w-full bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold px-3 py-1 rounded text-[11px] transition border border-slate-800 flex items-center justify-center gap-1"
                                                                        >
                                                                            ⚙️ Edit Stok & Kondisi
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
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
                toggleItemProcess={toggleItemProcess}
                handleCreateOrder={handleCreateOrder}
                handleFileChange={handleFileChange}
                sketchPreview={sketchPreview}
                calcItems={calcItems}
                getDynamicGlassTypes={getDynamicGlassTypes}
                sheetGlasses={sheetGlasses}
                findMatchingScrapsForOrder={findMatchingScrapsForOrder}
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
                toggleItemProcess={toggleItemProcess}
                handleUpdateOrderSubmit={handleUpdateOrderSubmit}
                handleFileChange={handleFileChange}
                sketchPreview={sketchPreview}
                calcItems={calcItems}
                getDynamicGlassTypes={getDynamicGlassTypes}
                sheetGlasses={sheetGlasses}
                findMatchingScrapsForOrder={findMatchingScrapsForOrder}
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
                            <div className="grid grid-cols-3 gap-3 border-t border-b border-slate-800 py-3 my-1">
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
            {/* MODAL PRINT SURAT BARANG KELUAR (GATE PASS GUDANG) */}
            <GatePassModal
                show={showBarangKeluarModal}
                onClose={() => setShowBarangKeluarModal(false)}
                selectedBarangKeluarData={selectedBarangKeluarData}
                userName={userName}
            />

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
