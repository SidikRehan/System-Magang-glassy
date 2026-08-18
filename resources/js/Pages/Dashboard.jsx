import React, { useState, useEffect } from 'react';
import { Head, useForm, router, usePage, Link } from '@inertiajs/react';

export default function Dashboard({ orders: initialOrders, scrapGlasses: initialScrap, deliveries: initialDeliveries, metrics }) {
    const { auth } = usePage().props;
    const userRole = auth.user?.role || 'admin_toko';
    const userName = auth.user?.name || 'User Syp';
    const userEmail = auth.user?.email || 'user@sypglass.co.id';
    const canViewPricing = userRole === 'admin_toko' || userRole === 'owner' || userRole === 'finance';

    const [activeTab, setActiveTab] = useState('dashboard');
    const [activeOrderCard, setActiveOrderCard] = useState('draft');
    const [searchTerm, setSearchTerm] = useState('');
    const [showNewOrderModal, setShowNewOrderModal] = useState(false);
    const [showScrapModal, setShowScrapModal] = useState(false);
    const [showWaybillModal, setShowWaybillModal] = useState(false);
    const [selectedWaybillOrder, setSelectedWaybillOrder] = useState(null);

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
    const [showRestockModal, setShowRestockModal] = useState(false);
    const [selectedStockItem, setSelectedStockItem] = useState(null);
    const [restockQtyInput, setRestockQtyInput] = useState(10);
    const [restockDateInput, setRestockDateInput] = useState(new Date().toISOString().split('T')[0]);
    const [stockSubTab, setStockSubTab] = useState('lembaran');

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

    // Accessories Management State
    const [accessoriesList, setAccessoriesList] = useState([
        { id: 1, acc_code: 'ACC-001', name: 'Lem Silikon Bening Glass Sealant', category: 'Lem & Silikon', buy_price: 25000, sell_price: 45000, qty: 85, unit: 'Pcs', status: 'Aman' },
        { id: 2, acc_code: 'ACC-002', name: 'Aksesoris Lis Alumunium U-Channel', category: 'Hardware Alumunium', buy_price: 35000, sell_price: 65000, qty: 12, unit: 'Batang', status: 'Menipis' },
        { id: 3, acc_code: 'ACC-003', name: 'Handle Pintu Kaca Stainless Pipe', category: 'Handle & Engsel', buy_price: 120000, sell_price: 220000, qty: 30, unit: 'Pasang', status: 'Aman' },
        { id: 4, acc_code: 'ACC-004', name: 'Engsel Kaca ke Tembok Stainless 304', category: 'Handle & Engsel', buy_price: 75000, sell_price: 135000, qty: 5, unit: 'Set', status: 'Menipis' },
        { id: 5, acc_code: 'ACC-005', name: 'Karet Lis Glass Gasket Heavy Duty', category: 'Fitting & Karet', buy_price: 15000, sell_price: 30000, qty: 120, unit: 'Meter', status: 'Aman' },
        { id: 6, acc_code: 'ACC-006', name: 'Spider Fitting 4 Arm Heavy Duty', category: 'Fitting & Karet', buy_price: 350000, sell_price: 580000, qty: 8, unit: 'Set', status: 'Menipis' },
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
        category: 'Lem & Silikon',
        buy_price: '',
        sell_price: '',
        qty: 0,
        unit: 'Pcs'
    });

    const [editAccForm, setEditAccForm] = useState({
        id: null,
        acc_code: '',
        name: '',
        category: '',
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
            category: newAccForm.category,
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
            category: 'Lem & Silikon',
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
            category: acc.category,
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
                    category: editAccForm.category,
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
        { id: 1, item_code: 'KCB-001', name: 'Kaca Cermin 5mm Polos', category: 'Kaca Cermin', size: '122 x 244 cm', qty: 0, unit: 'Lembar', last_restock: '-', status: 'Pengajuan Proses Restock', supplier_name: 'PT Asahimas Flat Glass Tbk (Divisi Cermin)', supplier_phone: '6281234567890', supplier_pic: 'Pak Gunawan' },
        { id: 2, item_code: 'KCB-002', name: 'Kaca Cermin Grey 5mm', category: 'Kaca Cermin', size: '152 x 213 cm', qty: 0, unit: 'Lembar', last_restock: '-', status: 'Pengajuan Proses Restock', supplier_name: 'PT Mulia Glass Float & Mirror', supplier_phone: '6281398765432', supplier_pic: 'Ibu Siska' },
        { id: 3, item_code: 'KB-001', name: 'Kaca Bening 5mm Polos', category: 'Kaca Bening', size: '122 x 244 cm', qty: 0, unit: 'Lembar', last_restock: '-', status: 'Pengajuan Proses Restock', supplier_name: 'PT Asahimas Flat Glass Tbk (Plant Ancol)', supplier_phone: '6281234567890', supplier_pic: 'Pak Bambang' },
        { id: 4, item_code: 'KB-002', name: 'Kaca Bening 8mm Polos', category: 'Kaca Bening', size: '183 x 244 cm', qty: 0, unit: 'Lembar', last_restock: '-', status: 'Pengajuan Proses Restock', supplier_name: 'PT Mulia Glass Float & Mirror', supplier_phone: '6281398765432', supplier_pic: 'Ibu Siska' },
        { id: 5, item_code: 'KT-001', name: 'Kaca 12mm Polos Tempered', category: 'Kaca Tempered', size: '214 x 305 cm', qty: 0, unit: 'Lembar', last_restock: '-', status: 'Pengajuan Proses Restock', supplier_name: 'PT Kaca Tempered Nusantara', supplier_phone: '6281908070605', supplier_pic: 'Pak Irwan' },
        { id: 6, item_code: 'KDG-001', name: 'Kaca Dark Grey 5mm', category: 'Kaca Tinted / Grey', size: '152 x 213 cm', qty: 0, unit: 'Lembar', last_restock: '-', status: 'Pengajuan Proses Restock', supplier_name: 'PT Global Tinted Glass Import', supplier_phone: '6281577889900', supplier_pic: 'Pak Budianto' },
        { id: 7, item_code: 'KF-001', name: 'Kaca Frosted Etsa Sandblast', category: 'Kaca Sandblast', size: '122 x 244 cm', qty: 0, unit: 'Lembar', last_restock: '-', status: 'Pengajuan Proses Restock', supplier_name: 'CV ArtGlass Dekoratif Etsa', supplier_phone: '6281288990011', supplier_pic: 'Pak Rudy' },
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

    const handleAddItem = () => {
        const currentItems = orderForm.items || [];
        const newItem = {
            id: Date.now() + Math.random(),
            glass_type: '',
            length_cm: '',
            width_cm: '',
            thickness_mm: '',
            qty: 0,
            processes: [],
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
        currentItems[index] = { ...currentItems[index], [field]: value };
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
        // Check if already added
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
        const l = parseFloat(it.length_cm) || 0;
        const w = parseFloat(it.width_cm) || 0;
        const q = parseInt(it.qty) || 0;
        const procs = Array.isArray(it.processes) ? it.processes : ['HT'];

        const areaM2 = (l * w) / 10000;
        const perimeterM = (2 * (l + w)) / 100;

        const baseGlassPrice = (l > 0 && w > 0) ? Math.max(250000, Math.round(areaM2 * 500000)) * q : 0;

        const feeGM = procs.includes('GM') ? Math.round(perimeterM * 10000) * q : 0;
        const feeHT = procs.includes('HT') ? Math.round(perimeterM * 1000) * q : 0;

        const bevelWidthCm = parseFloat(it.bevel_width_cm) || 1;
        const feeBV = procs.includes('BV') ? Math.round((perimeterM * 15000) + (bevelWidthCm * 10000)) * q : 0;

        const holeL = parseFloat(it.hole_length_cm) || 2;
        const holeW = parseFloat(it.hole_width_cm) || 2;
        const holeQty = parseInt(it.hole_qty) || 1;
        const holeRuasCm = 2 * (holeL + holeW);
        const feeBor = procs.includes('Bor') ? Math.round(holeRuasCm * 2500) * holeQty * q : 0;

        let feeEtsa = 0;
        let etsaAreaM2 = 0;
        if (procs.includes('Etsa')) {
            const etsaL = parseFloat(it.etsa_length_cm) || l;
            const etsaW = parseFloat(it.etsa_width_cm) || w;
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

    const calcSubtotal = calcItems.reduce((sum, it) => sum + it.subtotal, 0);
    const calcPriorityFee = orderForm.priority_status === 'Prioritas' 
        ? (parseFloat(orderForm.priority_fee) || 150000) 
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

    const handleCreateOrder = (e, targetStatus = 'pengerjaan') => {
        e.preventDefault();
        router.post(route('orders.store'), {
            ...orderForm,
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

    const handleUpdateOrderSubmit = (e, targetStatus = null) => {
        e.preventDefault();
        if (!editingOrder) return;

        const finalStatus = targetStatus || orderForm.status;

        router.post(route('orders.update', editingOrder.id), {
            ...orderForm,
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

    const handleFinishJob = (id) => {
        router.post(route('orders.finish', id));
    };

    const handleLogout = () => {
        router.post(route('logout'));
    };

    const filteredOrders = initialOrders.filter(o => {
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
        <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans">
            <Head title={`Dashboard (${roleTitles[userRole] || userRole}) - SYP GLASS`} />

            {/* TOP BAR */}
            <div className="bg-[#0c111d] border-b border-slate-800 px-6 py-2 flex justify-between items-center text-xs">
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
            <header className="bg-[#0b0f19]/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-6 py-4 flex justify-between items-center">
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
            <div className="flex min-h-[calc(100vh-80px)]">
                {/* SIDEBAR */}
                <aside className="w-64 bg-[#0c111d] border-r border-slate-800/80 p-4 space-y-2">
                    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 mb-4 space-y-1">
                        <div className="text-xs text-slate-400">User Terautentikasi:</div>
                        <h4 className="font-bold text-sm text-slate-200">{userName}</h4>
                        <span className="inline-block text-[10px] text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full border border-cyan-400/20 font-bold">
                            {roleTitles[userRole]}
                        </span>
                    </div>

                    <nav className="space-y-1">
                        <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-left transition ${activeTab === 'dashboard' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                            📊 <span>Dashboard Utama</span>
                        </button>
                        
                        {(userRole === 'admin_toko' || userRole === 'admin_gudang' || userRole === 'owner' || userRole === 'driver') && (
                            <button onClick={() => { setActiveTab('orders'); if (userRole === 'driver') setActiveOrderCard('pengiriman'); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-left transition ${activeTab === 'orders' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                                📝 <span>Orderan & Draf</span>
                            </button>
                        )}

                        {(userRole.startsWith('divisi_') || userRole === 'admin_gudang' || userRole === 'owner') && (
                            <button onClick={() => setActiveTab('production')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-left transition ${activeTab === 'production' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                                ⚙️ <span>Disposisi & Divisi</span>
                            </button>
                        )}

                        {(userRole === 'divisi_ht' || userRole === 'admin_gudang' || userRole === 'admin_toko' || userRole === 'owner') && (
                            <button onClick={() => setActiveTab('scrap')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-left transition ${activeTab === 'scrap' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                                📦 <span>Stok</span>
                            </button>
                        )}



                        {(userRole === 'admin_toko' || userRole === 'admin_gudang' || userRole === 'owner') && (
                            <button onClick={() => setActiveTab('suppliers')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-left transition ${activeTab === 'suppliers' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                                🏢 <span>Data Supplier & Mitra</span>
                            </button>
                        )}

                        {(userRole === 'admin_toko' || userRole === 'admin_gudang' || userRole === 'owner') && (
                            <button onClick={() => setActiveTab('accessories')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-left transition ${activeTab === 'accessories' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                                🔌 <span>Stok & Katalog Aksesoris</span>
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
                    
                    {/* TAB 1: DASHBOARD UTAMA */}
                    {activeTab === 'dashboard' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-extrabold text-slate-100">Selamat Datang, {userName}!</h2>
                                    <p className="text-slate-400 text-sm">Dashboard spesifik untuk role: <strong>{roleTitles[userRole]}</strong></p>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-5">
                                <div className="bg-slate-900/80 border-l-4 border-cyan-500 border border-slate-800 rounded-xl p-5 shadow-lg">
                                    <span className="text-xs text-slate-400 block">Total SPO Orderan</span>
                                    <h3 className="text-3xl font-extrabold text-cyan-400 mt-1">{metrics.totalOrders} SPO</h3>
                                </div>
                                <div className="bg-slate-900/80 border-l-4 border-amber-500 border border-slate-800 rounded-xl p-5 shadow-lg">
                                    <span className="text-xs text-slate-400 block">Sedang Diproses Divisi</span>
                                    <h3 className="text-3xl font-extrabold text-amber-400 mt-1">{metrics.inProcess} Pesanan</h3>
                                </div>
                                <div className="bg-slate-900/80 border-l-4 border-emerald-500 border border-slate-800 rounded-xl p-5 shadow-lg">
                                    <span className="text-xs text-slate-400 block">Siap Kirim (QC Selesai)</span>
                                    <h3 className="text-3xl font-extrabold text-emerald-400 mt-1">{metrics.readyShip} Pesanan</h3>
                                </div>
                                <div className="bg-slate-900/80 border-l-4 border-purple-500 border border-slate-800 rounded-xl p-5 shadow-lg">
                                    <span className="text-xs text-slate-400 block">Stok Sisa Kaca di Rak</span>
                                    <h3 className="text-3xl font-extrabold text-purple-400 mt-1">{metrics.scrapCount} Lembar</h3>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: ORDERAN SINGLE ROUTE */}
                    {activeTab === 'orders' && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h2 className="text-2xl font-extrabold text-slate-100">Menu Orderan & Draf</h2>
                                    <p className="text-slate-400 text-sm">Kelola orderan baru, draf negosiasi, dan disposisi pengerjaan</p>
                                </div>
                                {(userRole === 'admin_toko' || userRole === 'owner') && (
                                    <button 
                                        onClick={handleOpenNewOrderModal} 
                                        className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black px-5 py-2.5 rounded-xl shadow-xl shadow-emerald-500/20 text-sm flex items-center gap-2 transition transform hover:scale-105 border border-cyan-300/50"
                                    >
                                        <span className="text-base">✨</span> + Orderan Baru
                                    </button>
                                )}
                            </div>

                            {/* 5 DYNAMIC CARDS HEADER */}
                            <div className="grid grid-cols-5 gap-4">
                                {[
                                    { key: 'draft', label: 'Draf (Belum Deal)', count: initialOrders.filter(o => o.status === 'draft').length, icon: '📄' },
                                    { key: 'pengerjaan', label: 'Order Pengerjaan', count: initialOrders.filter(o => o.status === 'pengerjaan').length, icon: '⚙️' },
                                    { key: 'pengiriman', label: 'Pengiriman & Surat Jalan', count: initialOrders.filter(o => o.status === 'pengiriman').length, icon: '🚚' },
                                    { key: 'pembayaran', label: 'Pembayaran / COD', count: initialOrders.filter(o => o.payment_status !== 'Lunas').length, icon: '💵' },
                                    { key: 'selesai', label: 'Selesai', count: initialOrders.filter(o => o.status === 'selesai').length, icon: '✅' },
                                ].map(card => (
                                    <div 
                                        key={card.key}
                                        onClick={() => setActiveOrderCard(card.key)}
                                        className={`cursor-pointer border rounded-xl p-4 text-center transition ${activeOrderCard === card.key ? 'bg-cyan-500/15 border-cyan-400 text-slate-100 shadow-lg shadow-cyan-500/10' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/40'}`}
                                    >
                                        <div className="text-2xl font-black text-cyan-400">{card.count}</div>
                                        <div className="text-xs font-semibold mt-1">{card.icon} {card.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* ACTION HEADER DIRECTLY ABOVE TABLE */}
                            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
                                <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-800 pb-3">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-bold text-slate-100 text-base">
                                            📋 Tabel Orderan: <span className="text-cyan-400 uppercase tracking-wider">{activeOrderCard}</span>
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
                                        {userRole === 'admin_toko' && (
                                            <button 
                                                onClick={handleOpenNewOrderModal} 
                                                className="bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 font-black px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/20 text-xs flex items-center gap-1.5 transition transform hover:scale-105 border border-cyan-300/40"
                                            >
                                                ✨ + Orderan Baru
                                            </button>
                                        )}
                                    </div>
                                </div>

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
                                                <td className="p-3 font-bold text-cyan-400">{o.spo_number}</td>
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

                                                    {Array.isArray(o.accessories) && o.accessories.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 pt-1">
                                                            {o.accessories.map(a => (
                                                                <span key={a} className="text-[10px] bg-blue-500/20 text-blue-300 font-semibold px-1.5 py-0.5 rounded border border-blue-500/30">
                                                                    {a}
                                                                </span>
                                                            ))}
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
                                                <td className="p-3 flex items-center gap-2">
                                                    {o.status === 'draft' && (userRole === 'admin_toko' || userRole === 'owner') && (
                                                        <>
                                                            <button 
                                                                onClick={() => handleOpenEditModal(o)}
                                                                className="bg-[#2563EB] hover:bg-blue-600 text-white font-bold px-3 py-1.5 rounded text-xs transition flex items-center gap-1 shadow-md shadow-blue-500/20"
                                                            >
                                                                ✏️ Edit Draf
                                                            </button>
                                                            <button 
                                                                onClick={() => handleOpenPromoteModal(o)}
                                                                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded text-xs transition flex items-center gap-1 shadow-md shadow-emerald-500/20"
                                                            >
                                                                ✅ Setuju & DP (50%)
                                                            </button>
                                                        </>
                                                    )}

                                                    {o.status === 'pengerjaan' && o.current_division === 'admin_gudang' && (userRole === 'admin_gudang' || userRole === 'owner') && (
                                                        <button 
                                                            onClick={() => { setSelectedDispatchOrder(o); setShowDispatchModal(true); }}
                                                            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3 py-1.5 rounded text-xs transition"
                                                        >
                                                            📤 Kirim Ke Divisi
                                                        </button>
                                                    )}

                                                    {(o.status === 'pengiriman' || o.status === 'selesai') && (
                                                        <button onClick={() => { setSelectedWaybillOrder(o); setShowWaybillModal(true); }} className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded text-xs font-semibold">
                                                            🖨️ Surat Jalan
                                                        </button>
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

                    {/* TAB 3: WORKSTATION DIVISI */}
                    {activeTab === 'production' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-extrabold text-slate-100">Disposisi Admin Gudang & Workstation Divisi</h2>
                                    <span className="text-xs text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full border border-cyan-400/20 font-bold">
                                        Role Active: {roleTitles[userRole]}
                                    </span>
                                </div>
                            </div>

                            {/* SECTION A: ORDER ANTREAN ADMIN GUDANG */}
                            {(userRole === 'admin_gudang' || userRole === 'owner') && (
                                <div className="bg-slate-900/80 border-2 border-blue-500/40 rounded-xl p-6 shadow-xl space-y-4">
                                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                                        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                                            🏭 Orderan Masuk Menunggu Disposisi Admin Gudang
                                        </h3>
                                        <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/30">
                                            {initialOrders.filter(o => o.status === 'pengerjaan' && o.current_division === 'admin_gudang').length} Order Antrean
                                        </span>
                                    </div>

                                    {initialOrders.filter(o => o.status === 'pengerjaan' && o.current_division === 'admin_gudang').length === 0 ? (
                                        <p className="text-xs text-slate-400 italic">Tidak ada orderan baru yang menunggu disposisi gudang saat ini.</p>
                                    ) : (
                                        initialOrders.filter(o => o.status === 'pengerjaan' && o.current_division === 'admin_gudang').map(o => (
                                            <div key={o.id} className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 flex justify-between items-center">
                                                <div>
                                                    <h4 className="font-bold text-cyan-400 text-base">{o.spo_number} ({o.customer_name})</h4>
                                                    <p className="text-sm text-slate-300">Spesifikasi: <strong>{o.glass_type}</strong> - {o.length_cm} x {o.width_cm} cm ({o.thickness_mm}mm)</p>
                                                    {canViewPricing && <span className="text-xs text-slate-400">Status Bayar: {o.payment_status} (DP 50%)</span>}
                                                </div>
                                                <button 
                                                    onClick={() => { setSelectedDispatchOrder(o); setShowDispatchModal(true); }} 
                                                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm shadow-md"
                                                >
                                                    📤 Kirim Ke Divisi Eksekusi →
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* SECTION B: ORDER SEDANG DIKERJAKAN DIVISI */}
                            <div className="bg-slate-900/80 border-2 border-cyan-500/40 rounded-xl p-6 shadow-xl space-y-4">
                                <h3 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-3">
                                    🔨 Orderan Sedang Dikerjakan Di Divisi Pabrik
                                </h3>

                                {initialOrders.filter(o => o.status === 'pengerjaan' && o.current_division !== 'admin_gudang').map(o => (
                                    <div key={o.id} className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 flex justify-between items-center">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-cyan-400 text-base">{o.spo_number} ({o.customer_name})</h4>
                                                <span className="text-xs bg-cyan-500/20 text-cyan-300 font-bold px-2.5 py-0.5 rounded border border-cyan-500/30">
                                                    Lokasi: {roleTitles[o.current_division] || o.current_division}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-300 mt-1">Item: <strong>{o.glass_type}</strong> - {o.length_cm} x {o.width_cm} cm</p>
                                        </div>
                                        
                                        {(userRole === o.current_division || userRole === 'admin_gudang' || userRole === 'owner') && (
                                            <button onClick={() => handleFinishJob(o.id)} className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm shadow-md">
                                                ✓ Selesai Pekerjaan Divisi
                                            </button>
                                        )}
                                    </div>
                                ))}
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
                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${stockSubTab === 'lembaran' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        📦 Stok Kaca Lembaran (Baru)
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
                                                className={`cursor-pointer border rounded-xl p-4 text-center transition ${activeStockCard === card.key ? 'bg-cyan-500/15 border-cyan-400 text-slate-100 shadow-lg shadow-cyan-500/10' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/40'}`}
                                            >
                                                <div className={`text-2xl font-black ${card.key === 'aman' ? 'text-emerald-400' : card.key === 'menipis' ? 'text-amber-400' : card.key === 'pengajuan' ? 'text-rose-400' : 'text-cyan-400'}`}>{card.count}</div>
                                                <div className="text-xs font-semibold mt-1">{card.icon} {card.label}</div>
                                            </div>
                                        ))}
                                    </div>

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

                                            <div className="flex items-center gap-3">
                                                <input 
                                                    type="text" 
                                                    placeholder="🔍 Cari Kode / Nama / Jenis Kaca..." 
                                                    value={stockSearchTerm}
                                                    onChange={e => setStockSearchTerm(e.target.value)}
                                                    className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                                                />
                                                <button 
                                                    onClick={() => setShowAddStockModal(true)} 
                                                    className="bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 font-black px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/20 text-xs flex items-center gap-1.5 transition transform hover:scale-105 border border-cyan-300/40"
                                                >
                                                    ✨ + Tambah Jenis Barang Baru
                                                </button>
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
                                                        <th className="p-3">Harga Beli & Jual</th>
                                                        <th className="p-3">Quantity</th>
                                                        <th className="p-3">Aksi</th>
                                                        <th className="p-3">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-800">
                                                    {filteredSheetGlasses.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="7" className="p-6 text-center text-slate-500 text-xs italic">
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
                                                                    <div className="text-[11px] text-emerald-400 font-mono mt-0.5 flex items-center gap-1">
                                                                        <span>🏭 Supplier:</span>
                                                                        <span className="font-semibold text-slate-300">{item.supplier_name}</span>
                                                                    </div>
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
                                                                            <div className="text-slate-400">Beli: <span className="text-amber-400 font-bold">Rp {Number(item.buy_price || 0).toLocaleString()}</span></div>
                                                                            <div className="text-slate-400">Jual: <span className="text-emerald-400 font-bold">Rp {Number(item.sell_price || 0).toLocaleString()}</span></div>
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

                    {/* TAB 5: PENGIRIMAN & SURAT JALAN */}
                    {activeTab === 'deliveries' && (
                        <div className="space-y-6">
                            <div className="flex flex-wrap justify-between items-center gap-4">
                                <div>
                                    <h2 className="text-2xl font-extrabold text-slate-100">Jadwal Pengiriman & Surat Jalan 4 Warna</h2>
                                    <p className="text-slate-400 text-sm">Kelola pengiriman armada, supir, alamat tujuan, dan dokumen surat jalan</p>
                                </div>
                                <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs font-bold text-cyan-400 flex items-center gap-2">
                                    <span>🚚 Total Antrean Kirim:</span>
                                    <span className="bg-cyan-500/20 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                                        {(initialDeliveries.length > 0 ? initialDeliveries : initialOrders.filter(o => o.status === 'pengiriman' || o.status === 'selesai')).length} Pengiriman
                                    </span>
                                </div>
                            </div>

                            {/* PANEL ATAS TABEL: PENUGASAN DRIVER / KENDARAAN & 2 BUTTON PRINT (SURAT JALAN & SURAT BARANG KELUAR) */}
                            <div className="bg-slate-900/90 border-2 border-cyan-500/40 rounded-xl p-5 shadow-xl space-y-4">
                                <div className="flex flex-wrap justify-between items-center border-b border-slate-800 pb-3 gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping"></span>
                                        <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
                                            📋 Panel Penugasan Armada & Cetak Dokumen Resmi Pengiriman (Admin Toko)
                                        </h3>
                                    </div>
                                    <span className="text-xs bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/30 font-bold">
                                        Pilih Driver + Kendaraan → Print Surat Jalan / Surat Barang Keluar
                                    </span>
                                </div>

                                <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                                    {/* 1. PILIH ORDER / SPO */}
                                    <div>
                                        <label className="text-slate-400 block mb-1 font-semibold">1. Pilih Order SPO Pengiriman:</label>
                                        <select
                                            value={selectedDispatchOrderForPrint}
                                            onChange={e => setSelectedDispatchOrderForPrint(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-cyan-300 font-bold focus:border-cyan-400"
                                        >
                                            <option value="">-- Pilih SPO Pengiriman --</option>
                                            {initialOrders.filter(o => o.status === 'pengiriman' || o.status === 'selesai').map(o => (
                                                <option key={o.id} value={o.spo_number}>
                                                    {o.spo_number} — {o.customer_name} ({o.payment_status})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* 2. PILIH SUPIR / DRIVER */}
                                    <div>
                                        <label className="text-slate-400 block mb-1 font-semibold">2. Pilih Supir / Driver Armada:</label>
                                        <select
                                            value={dispatchDriverInput}
                                            onChange={e => setDispatchDriverInput(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-medium focus:border-cyan-400"
                                        >
                                            <option value="Pak Budi (Supir Utama DC)">👨‍✈️ Pak Budi (Supir Utama DC)</option>
                                            <option value="Pak Mulyadi (Driver Engkel)">👨‍✈️ Pak Mulyadi (Driver Engkel)</option>
                                            <option value="Pak Asep (Driver L300)">👨‍✈️ Pak Asep (Driver Pick Up)</option>
                                            <option value="Pak Hendra (Driver Subcon)">👨‍✈️ Pak Hendra (Driver Subcon)</option>
                                        </select>
                                    </div>

                                    {/* 3. PILIH KENDARAAN & PLAT */}
                                    <div>
                                        <label className="text-slate-400 block mb-1 font-semibold">3. Jenis & No. Plat Kendaraan:</label>
                                        <select
                                            value={dispatchVehicleInput}
                                            onChange={e => setDispatchVehicleInput(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-medium focus:border-cyan-400"
                                        >
                                            <option value="Engkel Box (D 8472 AB)">🚚 Engkel Box (D 8472 AB)</option>
                                            <option value="Pick Up L300 (D 8192 XY)">🛻 Pick Up L300 (D 8192 XY)</option>
                                            <option value="Truck Engkel Long (D 8011 GH)">🚛 Truck Engkel Long (D 8011 GH)</option>
                                            <option value="Armada Subcon (B 9920 FK)">🚚 Armada Subcon (B 9920 FK)</option>
                                        </select>
                                    </div>

                                    {/* 4. DUA TOMBOL PRINT DOKUMEN */}
                                    <div className="flex flex-col justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={handleTriggerPrintSuratJalan}
                                            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold px-3 py-2 rounded-lg text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-1.5 transition transform hover:-translate-y-0.5"
                                        >
                                            🖨️ Print Surat Jalan (4 Warna)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleTriggerPrintBarangKeluar}
                                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold px-3 py-2 rounded-lg text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition transform hover:-translate-y-0.5"
                                        >
                                            📋 Print Surat Barang Keluar (Gate Pass)
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-800/60 text-slate-400 uppercase text-xs">
                                            <tr>
                                                <th className="p-3">Nomor SPO</th>
                                                <th className="p-3">Nama Cust</th>
                                                <th className="p-3">Alamat</th>
                                                <th className="p-3">Jenis Barang Dipesan</th>
                                                <th className="p-3">Ukuran Barang</th>
                                                <th className="p-3">Quantity</th>
                                                <th className="p-3">Supir</th>
                                                <th className="p-3">Kendaraan</th>
                                                <th className="p-3">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800">
                                            {(initialDeliveries.length > 0 ? initialDeliveries : initialOrders.filter(o => o.status === 'pengiriman' || o.status === 'selesai').map(o => ({
                                                id: o.id,
                                                waybill_number: 'SJ-' + o.spo_number,
                                                order: o,
                                                driver_name: 'Pak Budi (Driver DC)',
                                                vehicle_plate: 'Engkel Box (D 8472 AB)',
                                                waybill_color: o.payment_status === 'Lunas' ? 'Putih' : 'Merah',
                                                delivery_status: o.status === 'selesai' ? 'Selesai Terkirim' : 'Dalam Pengiriman',
                                                proof_photo_path: null
                                            }))).map(d => {
                                                const ord = d.order || d;
                                                const itemsList = Array.isArray(ord.items) && ord.items.length > 0 
                                                    ? ord.items 
                                                    : [{
                                                        glass_type: ord.glass_type || 'Kaca Cermin 5 mm polos',
                                                        length_cm: ord.length_cm || 150,
                                                        width_cm: ord.width_cm || 120,
                                                        thickness_mm: ord.thickness_mm || 5,
                                                        qty: ord.qty || 1
                                                      }];

                                                return (
                                                    <tr key={d.id} className="hover:bg-slate-800/30 transition">
                                                        {/* 1. NOMOR SPO */}
                                                        <td className="p-3">
                                                            <div className="font-extrabold text-cyan-400 font-mono text-sm">
                                                                {ord.spo_number || d.spo_number || 'SPO-0129'}
                                                            </div>
                                                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                                                                SJ: <strong className="text-slate-300">{d.waybill_number || 'SJ-2026-001'}</strong>
                                                            </div>
                                                        </td>

                                                        {/* 2. NAMA CUST */}
                                                        <td className="p-3">
                                                            <div className="font-bold text-slate-100">{ord.customer_name || d.customer_name || 'Pelanggan'}</div>
                                                            <div className="text-xs text-cyan-300 font-mono mt-0.5">{ord.customer_phone || d.customer_phone || '-'}</div>
                                                        </td>

                                                        {/* 3. ALAMAT */}
                                                        <td className="p-3 max-w-xs">
                                                            <div className="text-xs text-slate-300 leading-snug line-clamp-2" title={ord.customer_address || d.customer_address}>
                                                                📍 {ord.customer_address || d.customer_address || 'Alamat lokasi pengiriman'}
                                                            </div>
                                                        </td>

                                                        {/* 4. JENIS BARANG YANG DIPESAN APA SAJA */}
                                                        <td className="p-3 space-y-1 max-w-xs">
                                                            {itemsList.map((it, idx) => (
                                                                <div key={idx} className="bg-slate-950/60 p-1.5 rounded border border-slate-800 text-xs">
                                                                    <span className="font-bold text-cyan-300">#{idx + 1}. {it.glass_type}</span>
                                                                </div>
                                                            ))}
                                                            {Array.isArray(ord.accessories) && ord.accessories.length > 0 && (
                                                                <div className="flex flex-wrap gap-1 pt-1">
                                                                    {ord.accessories.map((acc, accIdx) => (
                                                                        <span key={accIdx} className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/30">
                                                                            +{typeof acc === 'object' ? acc.name : acc}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </td>

                                                        {/* 5. UKURAN BARANG NYA BERAPA */}
                                                        <td className="p-3 space-y-1">
                                                            {itemsList.map((it, idx) => (
                                                                <div key={idx} className="font-mono text-xs font-bold text-slate-200">
                                                                    {it.length_cm} x {it.width_cm} cm <span className="text-[11px] text-slate-400">({it.thickness_mm || 5}mm)</span>
                                                                </div>
                                                            ))}
                                                        </td>

                                                        {/* 6. QUANTITY NYA BERAPA */}
                                                        <td className="p-3 space-y-1">
                                                            {itemsList.map((it, idx) => (
                                                                <div key={idx}>
                                                                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-xs font-extrabold font-mono inline-block">
                                                                        {it.qty || 1} Lembar
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </td>

                                                        {/* 7. SUPIR */}
                                                        <td className="p-3">
                                                            <div className="font-bold text-slate-100 text-xs">
                                                                👨‍✈️ {d.driver_name || 'Pak Budi (Supir DC)'}
                                                            </div>
                                                        </td>

                                                        {/* 8. KENDARAAN */}
                                                        <td className="p-3">
                                                            <div className="font-semibold text-slate-200 text-xs">
                                                                🚚 {d.vehicle_plate || 'Engkel Box (D 8472 AB)'}
                                                            </div>
                                                        </td>

                                                        {/* 9. STATUS & SURAT JALAN */}
                                                        <td className="p-3 space-y-1.5">
                                                            <span className={`text-xs px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1 border ${d.delivery_status === 'Selesai Terkirim' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-blue-500/20 text-blue-300 border-blue-500/30'}`}>
                                                                <span className={`w-2 h-2 rounded-full ${d.delivery_status === 'Selesai Terkirim' ? 'bg-emerald-400' : 'bg-blue-400 animate-ping'}`}></span>
                                                                {d.delivery_status || 'Dalam Pengiriman'}
                                                            </span>
                                                            <div>
                                                                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border ${d.waybill_color === 'Merah' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'}`}>
                                                                    Surat Jalan {d.waybill_color || 'Putih'} {d.waybill_color === 'Merah' ? '(COD)' : '(Lunas)'}
                                                                </span>
                                                            </div>
                                                            <button 
                                                                onClick={() => { setSelectedWaybillOrder(ord); setShowWaybillModal(true); }}
                                                                className="bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 px-2.5 py-1 rounded text-xs font-bold transition flex items-center gap-1 mt-1 shadow"
                                                            >
                                                                🖨️ Surat Jalan
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
                    {activeTab === 'suppliers' && (
                        <div className="space-y-6">
                            <div className="flex flex-wrap justify-between items-center gap-4">
                                <div>
                                    <h2 className="text-2xl font-extrabold text-slate-100">🏢 Data Supplier & Mitra Kaca Industri</h2>
                                    <p className="text-slate-400 text-sm">Kelola daftar perusahaan supplier kaca, kontak PIC WhatsApp, alamat pabrik, dan status kemitraan</p>
                                </div>
                                {(userRole === 'admin_toko' || userRole === 'owner') && (
                                    <button 
                                        onClick={() => setShowAddSupplierModal(true)} 
                                        className="bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 font-black px-5 py-2.5 rounded-xl shadow-xl shadow-emerald-500/20 text-sm flex items-center gap-2 transition transform hover:scale-105 border border-cyan-300/40"
                                    >
                                        ✨ + Tambah Supplier Baru
                                    </button>
                                )}
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

                    {/* TAB 8: STOK & KATALOG AKSESORIS */}
                    {activeTab === 'accessories' && (
                        <div className="space-y-6">
                            <div className="flex flex-wrap justify-between items-center gap-4">
                                <div>
                                    <h2 className="text-2xl font-extrabold text-slate-100">🔌 Stok & Katalog Aksesoris Kaca</h2>
                                    <p className="text-slate-400 text-sm">Kelola inventory aksesoris (lem sealant, lis alumunium, handle, engsel, spider fitting, & karet lis)</p>
                                </div>
                                {(userRole === 'admin_toko' || userRole === 'admin_gudang' || userRole === 'owner') && (
                                    <button 
                                        onClick={() => setShowAddAccModal(true)} 
                                        className="bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 font-black px-5 py-2.5 rounded-xl shadow-xl shadow-emerald-500/20 text-sm flex items-center gap-2 transition transform hover:scale-105 border border-cyan-300/40"
                                    >
                                        ✨ + Tambah Aksesoris Baru
                                    </button>
                                )}
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
                                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                                    <span className="text-xs text-slate-400 block">Stok Menipis / Perlu Restock</span>
                                    <h3 className="text-2xl font-black text-amber-400 mt-1">{accessoriesList.filter(a => a.status === 'Menipis' || a.status === 'Habis').length} Item</h3>
                                </div>
                                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                                    <span className="text-xs text-slate-400 block">Estimasi Nilai Inventory</span>
                                    <h3 className="text-2xl font-black text-purple-400 mt-1">Rp {Number(accessoriesList.reduce((acc, a) => acc + (a.buy_price * a.qty), 0)).toLocaleString()}</h3>
                                </div>
                            </div>

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
                                        placeholder="🔍 Cari Kode / Nama / Kategori..." 
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
                                                <th className="p-3">Kategori</th>
                                                <th className="p-3">Harga Beli & Jual</th>
                                                <th className="p-3">Stok Quantity</th>
                                                <th className="p-3">Status</th>
                                                <th className="p-3">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800">
                                            {accessoriesList.filter(a => 
                                                a.acc_code.toLowerCase().includes(accSearchTerm.toLowerCase()) ||
                                                a.name.toLowerCase().includes(accSearchTerm.toLowerCase()) ||
                                                a.category.toLowerCase().includes(accSearchTerm.toLowerCase())
                                            ).map(acc => (
                                                <tr key={acc.id} className="hover:bg-slate-800/30">
                                                    <td className="p-3 font-extrabold text-cyan-400 font-mono">
                                                        {acc.acc_code}
                                                    </td>
                                                    <td className="p-3 font-bold text-slate-100">
                                                        <div>{acc.name}</div>
                                                    </td>
                                                    <td className="p-3">
                                                        <span className="bg-slate-800 text-cyan-300 border border-slate-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                                                            {acc.category}
                                                        </span>
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
                                                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${acc.status === 'Aman' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : acc.status === 'Menipis' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'}`}>
                                                            {acc.status}
                                                        </span>
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

                </main>
            </div>

            {/* MODAL 1: ORDER BARU (ADMIN TOKO - 12 POINT SPEC) */}
            {showNewOrderModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <div>
                                <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                                    🛒 Form Order Baru (Admin Toko)
                                </h3>
                                <div className="flex items-center gap-3 text-xs mt-1">
                                    <span className="text-slate-400 font-mono">
                                        i. Tanggal: <strong className="text-cyan-400">{orderForm.order_date}</strong> (Auto Sistem)
                                    </span>
                                    <span className="text-slate-400 font-mono">
                                        ii. SPO: <strong className="text-emerald-400">Auto Generated</strong>
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => setShowNewOrderModal(false)} className="text-slate-400 hover:text-white text-2xl font-bold">&times;</button>
                        </div>

                        <form className="space-y-4 text-xs overflow-y-auto pr-2 flex-1">
                            {/* SECTION 1: PELANGGAN (iii, iv, v) */}
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                                <h4 className="font-bold text-cyan-400 text-xs border-b border-slate-800 pb-2">
                                    👤 Data Pemesan & Pelanggan
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-slate-400 block mb-1">iv. Nama Customer:</label>
                                        <input type="text" required value={orderForm.customer_name} onChange={e => setOrderForm('customer_name', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-cyan-400" placeholder="e.g. Pak Sidik" />
                                    </div>
                                    <div>
                                        <label className="text-slate-400 block mb-1">iii. Nomor Telepon / WA:</label>
                                        <input type="text" required value={orderForm.customer_phone} onChange={e => setOrderForm('customer_phone', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-cyan-400" placeholder="e.g. 0812-3456-7890" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-slate-400 block mb-1">v. Alamat Pengiriman:</label>
                                    <textarea required rows="2" value={orderForm.customer_address} onChange={e => setOrderForm('customer_address', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-cyan-400" placeholder="Alamat lengkap lokasi pengantaran kaca..." />
                                </div>
                            </div>

                            {/* SECTION 2: RINCIAN MULTI-ITEM KACA & UKURAN */}
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                                <div className="flex flex-wrap justify-between items-center border-b border-slate-800 pb-2 gap-2">
                                    <h4 className="font-bold text-cyan-400 text-xs flex items-center gap-1.5">
                                        📐 vi & vii. Rincian Item Kaca ({calcItems.length} Item Kaca)
                                    </h4>
                                    <button 
                                        type="button" 
                                        onClick={handleAddItem} 
                                        className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold px-3 py-1 rounded-lg text-[11px] border border-cyan-500/30 flex items-center gap-1 transition"
                                    >
                                        ➕ Tambah Item Kaca Lain
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {calcItems.map((item, idx) => (
                                        <div key={item.id || idx} className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-3 relative">
                                            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                                <span className="font-extrabold text-cyan-300 text-xs flex items-center gap-2">
                                                    🔷 Item Kaca #{idx + 1}
                                                    <span className="font-mono text-[10px] text-slate-400">
                                                        (Luas: {item.areaM2.toFixed(2)} m² | Subtotal: <strong className="text-emerald-400">Rp {item.subtotal.toLocaleString()}</strong>)
                                                    </span>
                                                </span>
                                                {calcItems.length > 1 && (
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleRemoveItem(idx)}
                                                        className="text-rose-400 hover:text-rose-300 text-xs font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 transition"
                                                    >
                                                        🗑️ Hapus Item
                                                    </button>
                                                )}
                                            </div>

                                            {/* ROW 1: JENIS KACA & QTY */}
                                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                                <div className="sm:col-span-3">
                                                    <label className="text-slate-400 block mb-1">Jenis Kaca Dasar:</label>
                                                    <select 
                                                        value={item.glass_type} 
                                                        onChange={e => handleItemChange(idx, 'glass_type', e.target.value)} 
                                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-cyan-400"
                                                    >
                                                        <option value="">-- Pilih Jenis Kaca Dasar --</option>
                                                        <option value="Kaca Cermin 5 mm polos">Kaca Cermin 5 mm polos</option>
                                                        <option value="Kaca Cermin Grey 5 mm">Kaca Cermin Grey 5 mm</option>
                                                        <option value="Kaca Bening 5 mm polos">Kaca Bening 5 mm polos</option>
                                                        <option value="Kaca Bening 8 mm polos">Kaca Bening 8 mm polos</option>
                                                        <option value="Kaca 12 mm Polos Tempered">Kaca 12 mm Polos Tempered</option>
                                                        <option value="Kaca Dark Grey 5 mm">Kaca Dark Grey 5 mm</option>
                                                        <option value="Kaca Frosted Etsa Sandblast">Kaca Frosted Etsa Sandblast</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-slate-400 block mb-1">Jumlah (Qty):</label>
                                                    <input 
                                                        type="number" 
                                                        min="0" 
                                                        required 
                                                        value={item.qty} 
                                                        onChange={e => handleItemChange(idx, 'qty', e.target.value)} 
                                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono font-bold focus:border-cyan-400" 
                                                    />
                                                </div>
                                            </div>

                                            {/* ROW 2: DIMENSI UKURAN */}
                                            <div className="grid grid-cols-3 gap-3">
                                                <div>
                                                    <label className="text-slate-400 block mb-1">Panjang (cm):</label>
                                                    <input 
                                                        type="number" 
                                                        required 
                                                        value={item.length_cm} 
                                                        onChange={e => handleItemChange(idx, 'length_cm', e.target.value)} 
                                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono focus:border-cyan-400" 
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-slate-400 block mb-1">Lebar (cm):</label>
                                                    <input 
                                                        type="number" 
                                                        required 
                                                        value={item.width_cm} 
                                                        onChange={e => handleItemChange(idx, 'width_cm', e.target.value)} 
                                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono focus:border-cyan-400" 
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-slate-400 block mb-1">Ketebalan (mm):</label>
                                                    <input 
                                                        type="number" 
                                                        required 
                                                        value={item.thickness_mm} 
                                                        onChange={e => handleItemChange(idx, 'thickness_mm', e.target.value)} 
                                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono focus:border-cyan-400" 
                                                    />
                                                </div>
                                            </div>

                                            {/* ROW 3: OPTIONS PROSES MANDIRI PER ITEM */}
                                            <div>
                                                <label className="text-slate-400 block mb-1 font-semibold">vii. Options Proses Item #{idx + 1}:</label>
                                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                                    {[
                                                        { id: 'HT', name: 'HT (Halus Tepi)' },
                                                        { id: 'BV', name: 'BV (Beveling)' },
                                                        { id: 'GM', name: 'GM (Gosok Mesin)' },
                                                        { id: 'Etsa', name: 'Etsa (Sandblast)' },
                                                        { id: 'Bor', name: 'Bor (Coakan)' },
                                                    ].map(proc => (
                                                        <label 
                                                            key={proc.id} 
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                toggleItemProcess(idx, proc.id);
                                                            }} 
                                                            className={`p-1.5 rounded-lg border cursor-pointer transition flex items-center justify-between text-[11px] ${(item.processes || []).includes(proc.id) ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
                                                        >
                                                            <span>{proc.name}</span>
                                                            <input type="checkbox" checked={(item.processes || []).includes(proc.id)} onChange={() => {}} className="rounded bg-slate-900 border-slate-700 text-cyan-500 w-3 h-3 pointer-events-none" />
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* CONDITIONAL PARAMETERS FOR BEVEL & BOR */}
                                            {(item.processes || []).includes('BV') && (
                                                <div className="p-2 bg-slate-950 rounded-lg border border-cyan-500/30">
                                                    <label className="text-[11px] text-cyan-300 font-semibold block mb-1">
                                                        📐 Lebar Bevel (cm): <span className="text-[10px] text-slate-400 font-mono">(Biaya: Keliling × Rp 15.000 + Lebar cm × Rp 10.000)</span>
                                                    </label>
                                                    <input 
                                                        type="number" 
                                                        step="0.5" 
                                                        value={item.bevel_width_cm || 1} 
                                                        onChange={e => handleItemChange(idx, 'bevel_width_cm', e.target.value)} 
                                                        className="w-36 bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-slate-100 font-mono font-bold focus:border-cyan-400" 
                                                    />
                                                </div>
                                            )}

                                            {(item.processes || []).includes('Bor') && (
                                                <div className="p-2 bg-slate-950 rounded-lg border border-cyan-500/30 space-y-1">
                                                    <label className="text-[11px] text-cyan-300 font-semibold block">
                                                        🔘 Dimensi Lubang Bor / Coakan: <span className="text-[10px] text-slate-400 font-mono">(Biaya: Keliling Ruas cm × Rp 2.500 × Qty Lubang)</span>
                                                    </label>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <div>
                                                            <span className="text-[10px] text-slate-400 block">Panjang Lubang (cm):</span>
                                                            <input 
                                                                type="number" 
                                                                value={item.hole_length_cm || 2} 
                                                                onChange={e => handleItemChange(idx, 'hole_length_cm', e.target.value)} 
                                                                className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-slate-100 font-mono font-bold" 
                                                            />
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] text-slate-400 block">Lebar Lubang (cm):</span>
                                                            <input 
                                                                type="number" 
                                                                value={item.hole_width_cm || 2} 
                                                                onChange={e => handleItemChange(idx, 'hole_width_cm', e.target.value)} 
                                                                className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-slate-100 font-mono font-bold" 
                                                            />
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] text-slate-400 block">Jumlah Lubang:</span>
                                                            <input 
                                                                type="number" 
                                                                value={item.hole_qty || 1} 
                                                                onChange={e => handleItemChange(idx, 'hole_qty', e.target.value)} 
                                                                className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-slate-100 font-mono font-bold" 
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {(item.processes || []).includes('Etsa') && (
                                                <div className="p-2.5 bg-slate-950 rounded-lg border border-cyan-500/30 space-y-2">
                                                    <label className="text-[11px] text-cyan-300 font-semibold flex items-center justify-between">
                                                        <span>🌫️ Dimensi Area Etsa / Sandblast:</span>
                                                        <span className="text-[10px] text-slate-400 font-mono">(Tarif: Rp 50.000 / m²)</span>
                                                    </label>
                                                    
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <div>
                                                            <span className="text-[10px] text-slate-400 block mb-0.5">Panjang Etsa (cm):</span>
                                                            <input 
                                                                type="number" 
                                                                value={item.etsa_length_cm !== undefined ? item.etsa_length_cm : (item.length_cm || '')} 
                                                                onChange={e => handleItemChange(idx, 'etsa_length_cm', e.target.value)} 
                                                                className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-slate-100 font-mono font-bold" 
                                                                placeholder={item.length_cm}
                                                            />
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] text-slate-400 block mb-0.5">Lebar Etsa (cm):</span>
                                                            <input 
                                                                type="number" 
                                                                value={item.etsa_width_cm !== undefined ? item.etsa_width_cm : (item.width_cm || '')} 
                                                                onChange={e => handleItemChange(idx, 'etsa_width_cm', e.target.value)} 
                                                                className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-slate-100 font-mono font-bold" 
                                                                placeholder={item.width_cm}
                                                            />
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] text-slate-400 block mb-0.5">Jumlah Area (Pcs):</span>
                                                            <input 
                                                                type="number" 
                                                                value={item.etsa_qty || 1} 
                                                                onChange={e => handleItemChange(idx, 'etsa_qty', e.target.value)} 
                                                                className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-slate-100 font-mono font-bold" 
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* TRANSPARENT PRICING BREAKDOWN BADGES */}
                                            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] font-mono border-t border-slate-800/80">
                                                <span className="text-slate-400 font-semibold">Rincian Harga:</span>
                                                <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                                                    Kaca: Rp {item.baseGlassPrice.toLocaleString()}
                                                </span>
                                                {item.feeGM > 0 && (
                                                    <span className="bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30 text-cyan-300 font-bold">
                                                        GM: +Rp {item.feeGM.toLocaleString()}
                                                    </span>
                                                )}
                                                {item.feeHT > 0 && (
                                                    <span className="bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30 text-cyan-300 font-bold">
                                                        HT: +Rp {item.feeHT.toLocaleString()}
                                                    </span>
                                                )}
                                                {item.feeBV > 0 && (
                                                    <span className="bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30 text-cyan-300 font-bold">
                                                        Bevel: +Rp {item.feeBV.toLocaleString()}
                                                    </span>
                                                )}
                                                {item.feeBor > 0 && (
                                                    <span className="bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30 text-cyan-300 font-bold">
                                                        Bor ({item.holeRuasCm}cm ruas): +Rp {item.feeBor.toLocaleString()}
                                                    </span>
                                                )}
                                                {item.feeEtsa > 0 && (
                                                    <span className="bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30 text-cyan-300 font-bold">
                                                        Etsa ({item.etsaAreaM2 ? (item.etsaAreaM2 * (item.etsa_qty || 1)).toFixed(2) : '0'}m²): +Rp {item.feeEtsa.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* SECTION 4: TAMBAHAN AKSESORIS TERINTEGRASI STOK GUDANG (viii) */}
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                    <h4 className="font-bold text-cyan-400 text-xs flex items-center gap-1.5">
                                        📦 viii. Tambahan Aksesoris / Hardware Proyek (Stock Integrated)
                                    </h4>
                                    <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                        ✓ Stok Terhubung Gudang
                                    </span>
                                </div>

                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                    <select
                                        className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 font-medium focus:border-cyan-400 flex-1 cursor-pointer"
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                handleAddAccessoryFromStock(e.target.value);
                                                e.target.value = '';
                                            }
                                        }}
                                    >
                                        <option value="">+ Tambah Aksesoris dari Master Stok Inventory Gudang...</option>
                                        {MASTER_ACCESSORY_STOCK.map(item => (
                                            <option key={item.id} value={item.id} disabled={item.stock <= 0}>
                                                {item.name} — Rp {item.price.toLocaleString()}/{item.unit} ({item.stock > 0 ? `Stok: ${item.stock} ${item.unit}` : 'Stok Habis'})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {Array.isArray(orderForm.accessories) && orderForm.accessories.length > 0 ? (
                                    <div className="space-y-2 pt-1">
                                        {orderForm.accessories.map((acc, accIdx) => {
                                            const isObj = typeof acc === 'object' && acc !== null;
                                            const accName = isObj ? acc.name : acc;
                                            const accPrice = isObj ? (parseFloat(acc.price) || 0) : 0;
                                            const accUnit = isObj ? (acc.unit || 'pcs') : 'pcs';
                                            const accStock = isObj ? (acc.stock || 50) : 50;
                                            const accQty = isObj ? (parseInt(acc.qty) || 1) : 1;
                                            const accTotal = accPrice * accQty;

                                            return (
                                                <div key={accIdx} className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <span className="font-bold text-slate-200">{accName}</span>
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${accStock < 10 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                                                            Stok: {accStock} {accUnit}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-[10px] text-slate-400">Jumlah Terpakai:</span>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={accQty}
                                                                onChange={e => handleAccessoryQtyChange(accIdx, e.target.value)}
                                                                className="w-16 bg-slate-950 border border-slate-700 rounded p-1 text-center text-xs font-mono font-bold text-cyan-300"
                                                            />
                                                            <span className="text-[10px] text-slate-400">{accUnit}</span>
                                                        </div>

                                                        <span className="font-mono text-cyan-300 font-bold min-w-[90px] text-right">
                                                            Rp {accTotal.toLocaleString()}
                                                        </span>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveAccessory(accIdx)}
                                                            className="text-red-400 hover:text-red-300 text-xs font-bold p-1 rounded hover:bg-red-500/10"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-3 bg-slate-900/50 rounded-lg border border-dashed border-slate-800 text-center text-slate-500 text-xs">
                                        Belum ada aksesoris ditambahkan. Pilih dari dropdown stok di atas jika proyek memerlukan hardware/fitting pendukung.
                                    </div>
                                )}
                            </div>

                            {/* SECTION 5: DESKRIPSI & SKETSA GAMBAR (ix, x) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                                    <h4 className="font-bold text-cyan-400 text-xs border-b border-slate-800 pb-2">
                                        📝 ix. Deskripsi (Penjelasan Pesanan)
                                    </h4>
                                    <textarea rows="3" value={orderForm.description} onChange={e => setOrderForm('description', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-cyan-400" placeholder="Instruksi khusus coakan, ukuran celah, dll..." />
                                </div>

                                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                                    <h4 className="font-bold text-cyan-400 text-xs border-b border-slate-800 pb-2">
                                        🖼️ x. Gambar / Sketsa Kaca (JPG/PNG)
                                    </h4>
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-slate-300 text-xs cursor-pointer" />
                                    {sketchPreview && (
                                        <div className="mt-2 flex items-center gap-2">
                                            <img src={sketchPreview} alt="Preview Sketsa" className="w-14 h-14 object-cover rounded-lg border border-cyan-500" />
                                            <span className="text-[10px] text-emerald-400 font-bold">✓ Sketsa Berhasil Di-upload</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* SECTION 6: BURU-BURU TEU? / PRIORITAS (xi) */}
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                                <h4 className="font-bold text-amber-400 text-xs border-b border-slate-800 pb-2">
                                    ⚡ xi. Buru-buru teu? Status Prioritas & Tanggal Selesai
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-slate-400 block mb-1">Status Pengerjaan:</label>
                                        <select value={orderForm.priority_status} onChange={e => setOrderForm('priority_status', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-bold focus:border-cyan-400">
                                            <option value="Biasa">Biasa (Standard)</option>
                                            <option value="Prioritas">Prioritas (Buru-buru / Fee Custom)</option>
                                        </select>
                                    </div>
                                    {orderForm.priority_status === 'Prioritas' && (
                                        <div>
                                            <label className="text-slate-400 block mb-1">Nominal Fee Prioritas (Rp):</label>
                                            <input type="number" value={orderForm.priority_fee} onChange={e => setOrderForm('priority_fee', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-amber-400 font-bold font-mono focus:border-cyan-400" placeholder="150000" />
                                        </div>
                                    )}
                                    <div>
                                        <label className="text-slate-400 block mb-1">Harus diselesaikan pada (Deadline):</label>
                                        <input type="date" value={orderForm.deadline_date} onChange={e => setOrderForm('deadline_date', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-cyan-400" />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 8: OPSI PEMBAYARAN (DP % ATAU LUNAS) */}
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                                <h4 className="font-bold text-emerald-400 text-xs border-b border-slate-800 pb-2 flex items-center justify-between">
                                    <span>💳 Opsi Pembayaran Customer (DP % / Lunas)</span>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                        Total Tagihan: <strong className="text-emerald-400">Rp {calcTotalPrice.toLocaleString()}</strong>
                                    </span>
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                    <div>
                                        <label className="text-slate-400 block mb-1 font-semibold">Tipe Pembayaran:</label>
                                        <select 
                                            value={orderForm.payment_option || 'dp'} 
                                            onChange={e => setOrderForm('payment_option', e.target.value)} 
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-bold focus:border-cyan-400"
                                        >
                                            <option value="dp">💵 DP (Uang Muka)</option>
                                            <option value="lunas">✅ Lunas Langsung (100%)</option>
                                        </select>
                                    </div>

                                    {(orderForm.payment_option || 'dp') === 'dp' && (
                                        <>
                                            <div>
                                                <label className="text-slate-400 block mb-1 font-semibold">Pilih Persentase DP (%):</label>
                                                <div className="grid grid-cols-4 gap-1">
                                                    {[20, 30, 50, 70].map(pct => (
                                                        <button 
                                                            key={pct}
                                                            type="button"
                                                            onClick={() => setOrderForm(d => ({ ...d, dp_percent: pct, custom_paid_amount: '' }))}
                                                            className={`py-1.5 rounded text-xs font-bold transition border ${parseFloat(orderForm.dp_percent) === pct && !orderForm.custom_paid_amount ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-900 text-slate-300 border-slate-700'}`}
                                                        >
                                                            {pct}%
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-slate-400 block mb-1 font-semibold">Atau Input Nominal DP (Rp):</label>
                                                <input 
                                                    type="number" 
                                                    value={orderForm.custom_paid_amount || ''} 
                                                    onChange={e => setOrderForm('custom_paid_amount', e.target.value)} 
                                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-emerald-400 font-mono font-bold focus:border-cyan-400" 
                                                    placeholder={`Default ${orderForm.dp_percent || 50}% = Rp ${Math.round(calcTotalPrice * ((orderForm.dp_percent || 50) / 100)).toLocaleString()}`} 
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center text-xs">
                                    <span className="text-slate-300 font-medium">Uang Masuk Diterima Sekarang:</span>
                                    <span className="font-mono font-extrabold text-xs text-emerald-400">
                                        {(orderForm.payment_option || 'dp') === 'lunas' 
                                            ? `Rp ${calcTotalPrice.toLocaleString()} (Lunas 100%)` 
                                            : orderForm.custom_paid_amount 
                                                ? `Rp ${parseFloat(orderForm.custom_paid_amount || 0).toLocaleString()} (DP Custom)` 
                                                : `Rp ${Math.round(calcTotalPrice * ((orderForm.dp_percent || 50) / 100)).toLocaleString()} (DP ${orderForm.dp_percent || 50}%)`
                                        }
                                    </span>
                                </div>
                            </div>

                            {/* SECTION 7: HARGA REAL-TIME (xii) */}
                            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 rounded-xl border border-cyan-500/40 space-y-3">
                                <h4 className="font-bold text-cyan-300 text-xs border-b border-slate-800 pb-2 flex justify-between items-center">
                                    <span>💰 xii. Kalkulasi Harga Sistem & Custom Admin</span>
                                    <span className="text-[10px] text-slate-400 font-mono">Luas Total: {calcItems.reduce((sum, i) => sum + i.areaM2, 0).toFixed(2)} m²</span>
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                    <div>
                                        <span className="text-slate-400 block mb-1">1. Subtotal Sistem:</span>
                                        <div className="font-mono font-bold text-cyan-300 text-sm bg-slate-900 p-2 rounded border border-slate-800">
                                            Rp {calcSubtotal.toLocaleString()}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-slate-400 block mb-1">2. Tambahan Biaya Custom Admin (Rp):</label>
                                        <input type="number" value={orderForm.custom_fee} onChange={e => setOrderForm('custom_fee', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100 font-mono font-bold focus:border-cyan-400" placeholder="0" />
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block mb-1">3. TOTAL HARGA OTOMATIS:</span>
                                        <div className="font-mono font-black text-emerald-400 text-base bg-slate-900 p-1.5 rounded border border-emerald-500/40">
                                            Rp {calcTotalPrice.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* MODAL ACTIONS */}
                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                                <button type="button" onClick={() => setShowNewOrderModal(false)} className="px-4 py-2 bg-slate-800 rounded text-slate-300 text-xs font-semibold">Batal</button>
                                <button type="button" onClick={(e) => handleCreateOrder(e, 'draft')} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 font-bold text-white rounded text-xs flex items-center gap-1">
                                    📄 Simpan Draf (Belum Deal)
                                </button>
                                <button type="button" onClick={(e) => handleCreateOrder(e, 'pengerjaan')} className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-bold text-slate-950 rounded text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20">
                                    ⚡ Simpan & Terbit Order ({orderForm.payment_option === 'lunas' ? 'Lunas' : `DP ${orderForm.dp_percent || 50}%`})
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 1B: EDIT DRAF ORDER (ADMIN TOKO) */}
            {showEditOrderModal && editingOrder && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <div>
                                <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                                    ✏️ Edit Draf Negosiasi #{editingOrder.spo_number}
                                </h3>
                                <div className="flex items-center gap-3 text-xs mt-1">
                                    <span className="text-slate-400 font-mono">
                                        Tanggal Order: <strong className="text-cyan-400">{orderForm.order_date}</strong>
                                    </span>
                                    <span className="text-slate-400 font-mono">
                                        Status: <strong className="text-amber-400 uppercase">{editingOrder.status}</strong>
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => { setShowEditOrderModal(false); setEditingOrder(null); }} className="text-slate-400 hover:text-white text-2xl font-bold">&times;</button>
                        </div>

                        <form className="space-y-4 text-xs overflow-y-auto pr-2 flex-1">
                            {/* SECTION 1: PELANGGAN (iii, iv, v) */}
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                                <h4 className="font-bold text-cyan-400 text-xs border-b border-slate-800 pb-2">
                                    👤 Data Pemesan & Pelanggan
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-slate-400 block mb-1">Nama Customer:</label>
                                        <input type="text" required value={orderForm.customer_name} onChange={e => setOrderForm('customer_name', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-cyan-400" />
                                    </div>
                                    <div>
                                        <label className="text-slate-400 block mb-1">Nomor Telepon / WA:</label>
                                        <input type="text" required value={orderForm.customer_phone} onChange={e => setOrderForm('customer_phone', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-cyan-400" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-slate-400 block mb-1">Alamat Pengiriman:</label>
                                    <textarea required rows="2" value={orderForm.customer_address} onChange={e => setOrderForm('customer_address', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-cyan-400" />
                                </div>
                            </div>

                            {/* SECTION 2: RINCIAN MULTI-ITEM KACA & UKURAN */}
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                                <div className="flex flex-wrap justify-between items-center border-b border-slate-800 pb-2 gap-2">
                                    <h4 className="font-bold text-cyan-400 text-xs flex items-center gap-1.5">
                                        📐 Rincian Item Kaca ({calcItems.length} Item Kaca)
                                    </h4>
                                    <button 
                                        type="button" 
                                        onClick={handleAddItem} 
                                        className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold px-3 py-1 rounded-lg text-[11px] border border-cyan-500/30 flex items-center gap-1 transition"
                                    >
                                        ➕ Tambah Item Kaca Lain
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {calcItems.map((item, idx) => (
                                        <div key={item.id || idx} className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-3 relative">
                                            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                                <span className="font-extrabold text-cyan-300 text-xs flex items-center gap-2">
                                                    🔷 Item Kaca #{idx + 1}
                                                    <span className="font-mono text-[10px] text-slate-400">
                                                        (Luas: {item.areaM2.toFixed(2)} m² | Subtotal: <strong className="text-emerald-400">Rp {item.subtotal.toLocaleString()}</strong>)
                                                    </span>
                                                </span>
                                                {calcItems.length > 1 && (
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleRemoveItem(idx)}
                                                        className="text-rose-400 hover:text-rose-300 text-xs font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 transition"
                                                    >
                                                        🗑️ Hapus Item
                                                    </button>
                                                )}
                                            </div>

                                            {/* ROW 1: JENIS KACA & QTY */}
                                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                                <div className="sm:col-span-3">
                                                    <label className="text-slate-400 block mb-1">Jenis Kaca Dasar:</label>
                                                    <select 
                                                        value={item.glass_type} 
                                                        onChange={e => handleItemChange(idx, 'glass_type', e.target.value)} 
                                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-cyan-400"
                                                    >
                                                        <option value="">-- Pilih Jenis Kaca Dasar --</option>
                                                        <option value="Kaca Cermin 5 mm polos">Kaca Cermin 5 mm polos</option>
                                                        <option value="Kaca Cermin Grey 5 mm">Kaca Cermin Grey 5 mm</option>
                                                        <option value="Kaca Bening 5 mm polos">Kaca Bening 5 mm polos</option>
                                                        <option value="Kaca Bening 8 mm polos">Kaca Bening 8 mm polos</option>
                                                        <option value="Kaca 12 mm Polos Tempered">Kaca 12 mm Polos Tempered</option>
                                                        <option value="Kaca Dark Grey 5 mm">Kaca Dark Grey 5 mm</option>
                                                        <option value="Kaca Frosted Etsa Sandblast">Kaca Frosted Etsa Sandblast</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-slate-400 block mb-1">Jumlah (Qty):</label>
                                                    <input 
                                                        type="number" 
                                                        min="0" 
                                                        required 
                                                        value={item.qty} 
                                                        onChange={e => handleItemChange(idx, 'qty', e.target.value)} 
                                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono font-bold focus:border-cyan-400" 
                                                    />
                                                </div>
                                            </div>

                                            {/* ROW 2: DIMENSI UKURAN */}
                                            <div className="grid grid-cols-3 gap-3">
                                                <div>
                                                    <label className="text-slate-400 block mb-1">Panjang (cm):</label>
                                                    <input 
                                                        type="number" 
                                                        required 
                                                        value={item.length_cm} 
                                                        onChange={e => handleItemChange(idx, 'length_cm', e.target.value)} 
                                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono focus:border-cyan-400" 
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-slate-400 block mb-1">Lebar (cm):</label>
                                                    <input 
                                                        type="number" 
                                                        required 
                                                        value={item.width_cm} 
                                                        onChange={e => handleItemChange(idx, 'width_cm', e.target.value)} 
                                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono focus:border-cyan-400" 
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-slate-400 block mb-1">Ketebalan (mm):</label>
                                                    <input 
                                                        type="number" 
                                                        required 
                                                        value={item.thickness_mm} 
                                                        onChange={e => handleItemChange(idx, 'thickness_mm', e.target.value)} 
                                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono focus:border-cyan-400" 
                                                    />
                                                </div>
                                            </div>

                                            {/* ROW 3: OPTIONS PROSES MANDIRI PER ITEM */}
                                            <div>
                                                <label className="text-slate-400 block mb-1 font-semibold">Options Proses Item #{idx + 1}:</label>
                                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                                    {[
                                                        { id: 'HT', name: 'HT (Halus Tepi)' },
                                                        { id: 'BV', name: 'BV (Beveling)' },
                                                        { id: 'GM', name: 'GM (Gosok Mesin)' },
                                                        { id: 'Etsa', name: 'Etsa (Sandblast)' },
                                                        { id: 'Bor', name: 'Bor (Coakan)' },
                                                    ].map(proc => (
                                                        <label 
                                                            key={proc.id} 
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                toggleItemProcess(idx, proc.id);
                                                            }} 
                                                            className={`p-1.5 rounded-lg border cursor-pointer transition flex items-center justify-between text-[11px] ${(item.processes || []).includes(proc.id) ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
                                                        >
                                                            <span>{proc.name}</span>
                                                            <input type="checkbox" checked={(item.processes || []).includes(proc.id)} onChange={() => {}} className="rounded bg-slate-900 border-slate-700 text-cyan-500 w-3 h-3 pointer-events-none" />
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* CONDITIONAL PARAMETERS FOR BEVEL & BOR */}
                                            {(item.processes || []).includes('BV') && (
                                                <div className="p-2 bg-slate-950 rounded-lg border border-cyan-500/30">
                                                    <label className="text-[11px] text-cyan-300 font-semibold block mb-1">
                                                        📐 Lebar Bevel (cm): <span className="text-[10px] text-slate-400 font-mono">(Biaya: Keliling × Rp 15.000 + Lebar cm × Rp 10.000)</span>
                                                    </label>
                                                    <input 
                                                        type="number" 
                                                        step="0.5" 
                                                        value={item.bevel_width_cm || 1} 
                                                        onChange={e => handleItemChange(idx, 'bevel_width_cm', e.target.value)} 
                                                        className="w-36 bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-slate-100 font-mono font-bold focus:border-cyan-400" 
                                                    />
                                                </div>
                                            )}

                                            {(item.processes || []).includes('Bor') && (
                                                <div className="p-2 bg-slate-950 rounded-lg border border-cyan-500/30 space-y-1">
                                                    <label className="text-[11px] text-cyan-300 font-semibold block">
                                                        🔘 Dimensi Lubang Bor / Coakan: <span className="text-[10px] text-slate-400 font-mono">(Biaya: Keliling Ruas cm × Rp 2.500 × Qty Lubang)</span>
                                                    </label>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <div>
                                                            <span className="text-[10px] text-slate-400 block">Panjang Lubang (cm):</span>
                                                            <input 
                                                                type="number" 
                                                                value={item.hole_length_cm || 2} 
                                                                onChange={e => handleItemChange(idx, 'hole_length_cm', e.target.value)} 
                                                                className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-slate-100 font-mono font-bold" 
                                                            />
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] text-slate-400 block">Lebar Lubang (cm):</span>
                                                            <input 
                                                                type="number" 
                                                                value={item.hole_width_cm || 2} 
                                                                onChange={e => handleItemChange(idx, 'hole_width_cm', e.target.value)} 
                                                                className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-slate-100 font-mono font-bold" 
                                                            />
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] text-slate-400 block">Jumlah Lubang:</span>
                                                            <input 
                                                                type="number" 
                                                                value={item.hole_qty || 1} 
                                                                onChange={e => handleItemChange(idx, 'hole_qty', e.target.value)} 
                                                                className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-slate-100 font-mono font-bold" 
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {(item.processes || []).includes('Etsa') && (
                                                <div className="p-2.5 bg-slate-950 rounded-lg border border-cyan-500/30 space-y-2">
                                                    <label className="text-[11px] text-cyan-300 font-semibold flex items-center justify-between">
                                                        <span>🌫️ Dimensi Area Etsa / Sandblast:</span>
                                                        <span className="text-[10px] text-slate-400 font-mono">(Tarif: Rp 50.000 / m²)</span>
                                                    </label>
                                                    
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <div>
                                                            <span className="text-[10px] text-slate-400 block mb-0.5">Panjang Etsa (cm):</span>
                                                            <input 
                                                                type="number" 
                                                                value={item.etsa_length_cm !== undefined ? item.etsa_length_cm : (item.length_cm || '')} 
                                                                onChange={e => handleItemChange(idx, 'etsa_length_cm', e.target.value)} 
                                                                className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-slate-100 font-mono font-bold" 
                                                                placeholder={item.length_cm}
                                                            />
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] text-slate-400 block mb-0.5">Lebar Etsa (cm):</span>
                                                            <input 
                                                                type="number" 
                                                                value={item.etsa_width_cm !== undefined ? item.etsa_width_cm : (item.width_cm || '')} 
                                                                onChange={e => handleItemChange(idx, 'etsa_width_cm', e.target.value)} 
                                                                className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-slate-100 font-mono font-bold" 
                                                                placeholder={item.width_cm}
                                                            />
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] text-slate-400 block mb-0.5">Jumlah Area (Pcs):</span>
                                                            <input 
                                                                type="number" 
                                                                value={item.etsa_qty || 1} 
                                                                onChange={e => handleItemChange(idx, 'etsa_qty', e.target.value)} 
                                                                className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-slate-100 font-mono font-bold" 
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* TRANSPARENT PRICING BREAKDOWN BADGES */}
                                            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] font-mono border-t border-slate-800/80">
                                                <span className="text-slate-400 font-semibold">Rincian Harga:</span>
                                                <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                                                    Kaca: Rp {item.baseGlassPrice.toLocaleString()}
                                                </span>
                                                {item.feeGM > 0 && (
                                                    <span className="bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30 text-cyan-300 font-bold">
                                                        GM: +Rp {item.feeGM.toLocaleString()}
                                                    </span>
                                                )}
                                                {item.feeHT > 0 && (
                                                    <span className="bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30 text-cyan-300 font-bold">
                                                        HT: +Rp {item.feeHT.toLocaleString()}
                                                    </span>
                                                )}
                                                {item.feeBV > 0 && (
                                                    <span className="bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30 text-cyan-300 font-bold">
                                                        Bevel: +Rp {item.feeBV.toLocaleString()}
                                                    </span>
                                                )}
                                                {item.feeBor > 0 && (
                                                    <span className="bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30 text-cyan-300 font-bold">
                                                        Bor ({item.holeRuasCm}cm ruas): +Rp {item.feeBor.toLocaleString()}
                                                    </span>
                                                )}
                                                {item.feeEtsa > 0 && (
                                                    <span className="bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30 text-cyan-300 font-bold">
                                                        Etsa ({item.etsaAreaM2 ? (item.etsaAreaM2 * (item.etsa_qty || 1)).toFixed(2) : '0'}m²): +Rp {item.feeEtsa.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* SECTION 4: TAMBAHAN AKSESORIS TERINTEGRASI STOK GUDANG (viii) */}
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                    <h4 className="font-bold text-cyan-400 text-xs flex items-center gap-1.5">
                                        📦 Tambahan Aksesoris / Hardware Proyek (Stock Integrated)
                                    </h4>
                                    <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                        ✓ Stok Terhubung Gudang
                                    </span>
                                </div>

                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                    <select
                                        className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 font-medium focus:border-cyan-400 flex-1 cursor-pointer"
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                handleAddAccessoryFromStock(e.target.value);
                                                e.target.value = '';
                                            }
                                        }}
                                    >
                                        <option value="">+ Tambah Aksesoris dari Master Stok Inventory Gudang...</option>
                                        {MASTER_ACCESSORY_STOCK.map(item => (
                                            <option key={item.id} value={item.id} disabled={item.stock <= 0}>
                                                {item.name} — Rp {item.price.toLocaleString()}/{item.unit} ({item.stock > 0 ? `Stok: ${item.stock} ${item.unit}` : 'Stok Habis'})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {Array.isArray(orderForm.accessories) && orderForm.accessories.length > 0 ? (
                                    <div className="space-y-2 pt-1">
                                        {orderForm.accessories.map((acc, accIdx) => {
                                            const isObj = typeof acc === 'object' && acc !== null;
                                            const accName = isObj ? acc.name : acc;
                                            const accPrice = isObj ? (parseFloat(acc.price) || 0) : 0;
                                            const accUnit = isObj ? (acc.unit || 'pcs') : 'pcs';
                                            const accStock = isObj ? (acc.stock || 50) : 50;
                                            const accQty = isObj ? (parseInt(acc.qty) || 1) : 1;
                                            const accTotal = accPrice * accQty;

                                            return (
                                                <div key={accIdx} className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <span className="font-bold text-slate-200">{accName}</span>
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${accStock < 10 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                                                            Stok: {accStock} {accUnit}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-[10px] text-slate-400">Jumlah Terpakai:</span>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={accQty}
                                                                onChange={e => handleAccessoryQtyChange(accIdx, e.target.value)}
                                                                className="w-16 bg-slate-950 border border-slate-700 rounded p-1 text-center text-xs font-mono font-bold text-cyan-300"
                                                            />
                                                            <span className="text-[10px] text-slate-400">{accUnit}</span>
                                                        </div>

                                                        <span className="font-mono text-cyan-300 font-bold min-w-[90px] text-right">
                                                            Rp {accTotal.toLocaleString()}
                                                        </span>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveAccessory(accIdx)}
                                                            className="text-red-400 hover:text-red-300 text-xs font-bold p-1 rounded hover:bg-red-500/10"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-3 bg-slate-900/50 rounded-lg border border-dashed border-slate-800 text-center text-slate-500 text-xs">
                                        Belum ada aksesoris ditambahkan. Pilih dari dropdown stok di atas jika proyek memerlukan hardware/fitting pendukung.
                                    </div>
                                )}
                            </div>

                            {/* SECTION 5: DESKRIPSI & SKETSA GAMBAR (ix, x) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                                    <h4 className="font-bold text-cyan-400 text-xs border-b border-slate-800 pb-2">
                                        📝 Deskripsi (Penjelasan Pesanan)
                                    </h4>
                                    <textarea rows="3" value={orderForm.description} onChange={e => setOrderForm('description', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-cyan-400" />
                                </div>

                                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                                    <h4 className="font-bold text-cyan-400 text-xs border-b border-slate-800 pb-2">
                                        🖼️ Gambar / Sketsa Kaca (JPG/PNG)
                                    </h4>
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-slate-300 text-xs cursor-pointer" />
                                    {sketchPreview && (
                                        <div className="mt-2 flex items-center gap-2">
                                            <img src={sketchPreview} alt="Preview Sketsa" className="w-14 h-14 object-cover rounded-lg border border-cyan-500" />
                                            <span className="text-[10px] text-emerald-400 font-bold">✓ Sketsa Berhasil Terpasang</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* SECTION 6: BURU-BURU TEU? / PRIORITAS (xi) */}
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                                <h4 className="font-bold text-amber-400 text-xs border-b border-slate-800 pb-2">
                                    ⚡ Status Prioritas & Tanggal Selesai
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-slate-400 block mb-1">Status Pengerjaan:</label>
                                        <select value={orderForm.priority_status} onChange={e => setOrderForm('priority_status', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-bold focus:border-cyan-400">
                                            <option value="Biasa">Biasa (Standard)</option>
                                            <option value="Prioritas">Prioritas (Buru-buru / Fee Custom)</option>
                                        </select>
                                    </div>
                                    {orderForm.priority_status === 'Prioritas' && (
                                        <div>
                                            <label className="text-slate-400 block mb-1">Nominal Fee Prioritas (Rp):</label>
                                            <input type="number" value={orderForm.priority_fee} onChange={e => setOrderForm('priority_fee', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-amber-400 font-bold font-mono focus:border-cyan-400" />
                                        </div>
                                    )}
                                    <div>
                                        <label className="text-slate-400 block mb-1">Harus diselesaikan pada (Deadline):</label>
                                        <input type="date" value={orderForm.deadline_date} onChange={e => setOrderForm('deadline_date', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-cyan-400" />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 8: OPSI PEMBAYARAN (DP % ATAU LUNAS) */}
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                                <h4 className="font-bold text-emerald-400 text-xs border-b border-slate-800 pb-2 flex items-center justify-between">
                                    <span>💳 Opsi Pembayaran Customer (DP % / Lunas)</span>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                        Total Tagihan: <strong className="text-emerald-400">Rp {calcTotalPrice.toLocaleString()}</strong>
                                    </span>
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                    <div>
                                        <label className="text-slate-400 block mb-1 font-semibold">Tipe Pembayaran:</label>
                                        <select 
                                            value={orderForm.payment_option || 'dp'} 
                                            onChange={e => setOrderForm('payment_option', e.target.value)} 
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-bold focus:border-cyan-400"
                                        >
                                            <option value="dp">💵 DP (Uang Muka)</option>
                                            <option value="lunas">✅ Lunas Langsung (100%)</option>
                                        </select>
                                    </div>

                                    {(orderForm.payment_option || 'dp') === 'dp' && (
                                        <>
                                            <div>
                                                <label className="text-slate-400 block mb-1 font-semibold">Pilih Persentase DP (%):</label>
                                                <div className="grid grid-cols-4 gap-1">
                                                    {[20, 30, 50, 70].map(pct => (
                                                        <button 
                                                            key={pct}
                                                            type="button"
                                                            onClick={() => setOrderForm(d => ({ ...d, dp_percent: pct, custom_paid_amount: '' }))}
                                                            className={`py-1.5 rounded text-xs font-bold transition border ${parseFloat(orderForm.dp_percent) === pct && !orderForm.custom_paid_amount ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-900 text-slate-300 border-slate-700'}`}
                                                        >
                                                            {pct}%
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-slate-400 block mb-1 font-semibold">Atau Input Nominal DP (Rp):</label>
                                                <input 
                                                    type="number" 
                                                    value={orderForm.custom_paid_amount || ''} 
                                                    onChange={e => setOrderForm('custom_paid_amount', e.target.value)} 
                                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-emerald-400 font-mono font-bold focus:border-cyan-400" 
                                                    placeholder={`Default ${orderForm.dp_percent || 50}% = Rp ${Math.round(calcTotalPrice * ((orderForm.dp_percent || 50) / 100)).toLocaleString()}`} 
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center text-xs">
                                    <span className="text-slate-300 font-medium">Uang Masuk Diterima Sekarang:</span>
                                    <span className="font-mono font-extrabold text-xs text-emerald-400">
                                        {(orderForm.payment_option || 'dp') === 'lunas' 
                                            ? `Rp ${calcTotalPrice.toLocaleString()} (Lunas 100%)` 
                                            : orderForm.custom_paid_amount 
                                                ? `Rp ${parseFloat(orderForm.custom_paid_amount || 0).toLocaleString()} (DP Custom)` 
                                                : `Rp ${Math.round(calcTotalPrice * ((orderForm.dp_percent || 50) / 100)).toLocaleString()} (DP ${orderForm.dp_percent || 50}%)`
                                        }
                                    </span>
                                </div>
                            </div>

                            {/* SECTION 7: HARGA REAL-TIME (xii) */}
                            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 rounded-xl border border-cyan-500/40 space-y-3">
                                <h4 className="font-bold text-cyan-300 text-xs border-b border-slate-800 pb-2 flex justify-between items-center">
                                    <span>💰 Kalkulasi Harga Terbaru</span>
                                    <span className="text-[10px] text-slate-400 font-mono">Luas Total: {calcItems.reduce((sum, i) => sum + i.areaM2, 0).toFixed(2)} m²</span>
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                    <div>
                                        <span className="text-slate-400 block mb-1">1. Subtotal Sistem:</span>
                                        <div className="font-mono font-bold text-cyan-300 text-sm bg-slate-900 p-2 rounded border border-slate-800">
                                            Rp {calcSubtotal.toLocaleString()}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-slate-400 block mb-1">2. Tambahan Biaya Custom Admin (Rp):</label>
                                        <input type="number" value={orderForm.custom_fee} onChange={e => setOrderForm('custom_fee', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100 font-mono font-bold focus:border-cyan-400" />
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block mb-1">3. TOTAL REVISI HARGA:</span>
                                        <div className="font-mono font-black text-emerald-400 text-base bg-slate-900 p-1.5 rounded border border-emerald-500/40">
                                            Rp {calcTotalPrice.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* MODAL ACTIONS */}
                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                                <button type="button" onClick={() => { setShowEditOrderModal(false); setEditingOrder(null); }} className="px-4 py-2 bg-slate-800 rounded text-slate-300 text-xs font-semibold">Batal</button>
                                <button type="button" onClick={(e) => handleUpdateOrderSubmit(e, 'draft')} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 font-bold text-white rounded text-xs flex items-center gap-1 shadow-md shadow-blue-600/20">
                                    💾 Simpan Perubahan Draf
                                </button>
                                <button type="button" onClick={(e) => handleUpdateOrderSubmit(e, 'pengerjaan')} className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 font-bold text-slate-950 rounded text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20">
                                    🚀 Deal & Terbit Order ({orderForm.payment_option === 'lunas' ? 'Lunas' : `DP ${orderForm.dp_percent || 50}%`})
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {showDispatchModal && selectedDispatchOrder && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                                📤 Disposisi Order Admin Gudang
                            </h3>
                            <button onClick={() => setShowDispatchModal(false)} className="text-slate-400 hover:text-white text-xl">&times;</button>
                        </div>

                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                            <div className="text-cyan-400 font-bold">{selectedDispatchOrder.spo_number} - {selectedDispatchOrder.customer_name}</div>
                            <div className="text-slate-300">Kaca: {selectedDispatchOrder.glass_type} ({selectedDispatchOrder.length_cm} x {selectedDispatchOrder.width_cm} cm)</div>
                        </div>

                        <form onSubmit={handleDispatchOrderSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="text-slate-400 block mb-1.5 font-semibold">Pilih Divisi Tujuan Eksekusi:</label>
                                <select 
                                    value={targetDivChoice} 
                                    onChange={e => setTargetDivChoice(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-semibold focus:border-cyan-400"
                                >
                                    <option value="divisi_ht">✂️ Divisi HT (Cutting & Tempering)</option>
                                    <option value="divisi_gm">✨ Divisi GM (Gosok Mesin)</option>
                                    <option value="divisi_bv">💎 Divisi BV (Beveling)</option>
                                    <option value="divisi_etsa">🌫️ Divisi Etsa (Sandblast Blur)</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                                <button type="button" onClick={() => setShowDispatchModal(false)} className="px-4 py-2 bg-slate-800 rounded text-slate-300 font-semibold">Batal</button>
                                <button type="submit" className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 font-bold text-slate-950 rounded shadow-md">
                                    Kirim Ke Divisi →
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
                                        type="number" 
                                        min="0"
                                        placeholder="e.g. 250000"
                                        value={newStockForm.buy_price}
                                        onChange={e => setNewStockForm({ ...newStockForm, buy_price: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-amber-300 font-mono font-bold focus:border-amber-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-emerald-400 block mb-1 font-semibold">Harga Jual Customer (Rp):</label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        placeholder="e.g. 450000"
                                        value={newStockForm.sell_price}
                                        onChange={e => setNewStockForm({ ...newStockForm, sell_price: e.target.value })}
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
                                <h4 className="font-bold text-slate-300">🏢 Informasi Supplier Utama (Opsional)</h4>
                                <div>
                                    <label className="text-slate-400 block mb-1 font-semibold">Nama Perusahaan Supplier:</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. PT Asahimas Flat Glass Tbk"
                                        value={newStockForm.supplier_name}
                                        onChange={e => setNewStockForm({ ...newStockForm, supplier_name: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-cyan-400"
                                    />
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
                            <div className="grid grid-cols-2 gap-3">
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
                                    <label className="text-slate-400 block mb-1 font-semibold">Kategori Aksesoris:</label>
                                    <select
                                        value={newAccForm.category}
                                        onChange={e => setNewAccForm({ ...newAccForm, category: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-medium focus:border-cyan-400"
                                    >
                                        <option value="Lem & Silikon">Lem & Silikon</option>
                                        <option value="Hardware Alumunium">Hardware Alumunium</option>
                                        <option value="Handle & Engsel">Handle & Engsel</option>
                                        <option value="Fitting & Karet">Fitting & Karet</option>
                                        <option value="Kunci & Slot">Kunci & Slot</option>
                                        <option value="Lainnya">Lainnya</option>
                                    </select>
                                </div>
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
                            <div className="grid grid-cols-2 gap-3">
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
                                    <label className="text-slate-400 block mb-1 font-semibold">Kategori Aksesoris:</label>
                                    <select
                                        value={editAccForm.category}
                                        onChange={e => setEditAccForm({ ...editAccForm, category: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-medium focus:border-cyan-400"
                                    >
                                        <option value="Lem & Silikon">Lem & Silikon</option>
                                        <option value="Hardware Alumunium">Hardware Alumunium</option>
                                        <option value="Handle & Engsel">Handle & Engsel</option>
                                        <option value="Fitting & Karet">Fitting & Karet</option>
                                        <option value="Kunci & Slot">Kunci & Slot</option>
                                        <option value="Lainnya">Lainnya</option>
                                    </select>
                                </div>
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
            {showBarangKeluarModal && selectedBarangKeluarData && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">📋</span>
                                <h3 className="font-extrabold text-slate-100 text-base">
                                    Surat Barang Keluar / Gate Pass Gudang
                                </h3>
                            </div>
                            <button onClick={() => setShowBarangKeluarModal(false)} className="text-slate-400 hover:text-white text-2xl font-bold">&times;</button>
                        </div>

                        {/* DOKUMEN CETAK DENGAN EMBEDDED PRINT LAYOUT */}
                        <div className="bg-white text-slate-900 p-6 rounded-xl space-y-4 font-sans border-2 border-slate-400">
                            {/* HEADER KOP DOKUMEN */}
                            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3">
                                <div>
                                    <h2 className="font-black text-lg tracking-wider text-slate-950">CV CAHYA KARUNIA JAYA</h2>
                                    <p className="text-xs text-slate-700">SYP GLASS OPERATIONAL - FABRIKASI & DISTRIBUSI KACA</p>
                                    <p className="text-[11px] text-slate-600">Jl. Raya Industri Kaca No. 88, Bandung | WA: 0812-3456-7890</p>
                                </div>
                                <div className="text-right">
                                    <span className="bg-slate-950 text-white px-3 py-1 rounded text-xs font-black tracking-widest block uppercase mb-1">
                                        SURAT BARANG KELUAR
                                    </span>
                                    <div className="text-xs font-mono font-bold">No: {selectedBarangKeluarData.sbk_number}</div>
                                    <div className="text-[11px] text-slate-600">Tanggal: {selectedBarangKeluarData.date}</div>
                                </div>
                            </div>

                            {/* DETAIL TUJUAN & ARMADA */}
                            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-100 p-3 rounded-lg border border-slate-300">
                                <div className="space-y-1">
                                    <div><strong>No. Referensi SPO:</strong> <span className="font-mono text-blue-700 font-bold">{selectedBarangKeluarData.order.spo_number}</span></div>
                                    <div><strong>Nama Customer:</strong> {selectedBarangKeluarData.order.customer_name} ({selectedBarangKeluarData.order.customer_phone})</div>
                                    <div><strong>Alamat Pengiriman:</strong> {selectedBarangKeluarData.order.customer_address}</div>
                                </div>
                                <div className="space-y-1 border-l border-slate-300 pl-3">
                                    <div><strong>Supir / Driver:</strong> <span className="font-bold">{selectedBarangKeluarData.driver}</span></div>
                                    <div><strong>Kendaraan & Plat:</strong> <span className="font-bold">{selectedBarangKeluarData.vehicle}</span></div>
                                    <div><strong>Status Tagihan:</strong> <span className="font-mono font-bold text-emerald-700">{selectedBarangKeluarData.order.payment_status}</span></div>
                                </div>
                            </div>

                            {/* TABEL ITEM BARANG KELUAR GUDANG */}
                            <div>
                                <h4 className="font-bold text-xs uppercase mb-1">Rincian Fisik Barang Kaca Keluar dari Pabrik/Gudang:</h4>
                                <table className="w-full text-xs text-left border-collapse border border-slate-400">
                                    <thead className="bg-slate-200 uppercase font-bold text-[11px]">
                                        <tr>
                                            <th className="border border-slate-400 p-2">No</th>
                                            <th className="border border-slate-400 p-2">Spesifikasi Kaca / Item</th>
                                            <th className="border border-slate-400 p-2 text-center">Ukuran (P x L)</th>
                                            <th className="border border-slate-400 p-2 text-center">Tebal</th>
                                            <th className="border border-slate-400 p-2 text-center">Qty</th>
                                            <th className="border border-slate-400 p-2 text-center">Status QC Gudang</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(Array.isArray(selectedBarangKeluarData.order.items) && selectedBarangKeluarData.order.items.length > 0 
                                            ? selectedBarangKeluarData.order.items 
                                            : [{
                                                glass_type: selectedBarangKeluarData.order.glass_type,
                                                length_cm: selectedBarangKeluarData.order.length_cm,
                                                width_cm: selectedBarangKeluarData.order.width_cm,
                                                thickness_mm: selectedBarangKeluarData.order.thickness_mm,
                                                qty: selectedBarangKeluarData.order.qty || 1
                                              }]
                                        ).map((it, idx) => (
                                            <tr key={idx} className="border-b border-slate-300">
                                                <td className="border border-slate-400 p-2 text-center font-mono">{idx + 1}</td>
                                                <td className="border border-slate-400 p-2 font-bold">{it.glass_type}</td>
                                                <td className="border border-slate-400 p-2 text-center font-mono font-bold">{it.length_cm} x {it.width_cm} cm</td>
                                                <td className="border border-slate-400 p-2 text-center font-mono">{it.thickness_mm || 5} mm</td>
                                                <td className="border border-slate-400 p-2 text-center font-mono font-bold text-blue-700">{it.qty || 1} Pcs/Lembar</td>
                                                <td className="border border-slate-400 p-2 text-center text-emerald-700 font-bold">✓ OK (Lolos QC)</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* 4 KOTAK TANDA TANGAN VERIFIKASI RESMI */}
                            <div className="grid grid-cols-4 gap-2 text-center text-[10px] pt-4">
                                <div className="border border-slate-400 p-2 rounded">
                                    <div className="font-bold mb-8">Disetujui Admin Toko:</div>
                                    <div className="border-t border-slate-400 pt-1 font-bold">( {userName} )</div>
                                </div>
                                <div className="border border-slate-400 p-2 rounded">
                                    <div className="font-bold mb-8">Dikeluarkan Gudang:</div>
                                    <div className="border-t border-slate-400 pt-1 font-bold">( Ka. Gudang Pabrik )</div>
                                </div>
                                <div className="border border-slate-400 p-2 rounded">
                                    <div className="font-bold mb-8">Diterima Supir/Driver:</div>
                                    <div className="border-t border-slate-400 pt-1 font-bold">( {selectedBarangKeluarData.driver} )</div>
                                </div>
                                <div className="border border-slate-400 p-2 rounded">
                                    <div className="font-bold mb-8">Verifikasi Pos Security:</div>
                                    <div className="border-t border-slate-400 pt-1 font-bold">( Petugas Satpam Gate )</div>
                                </div>
                            </div>
                        </div>

                        {/* ACTION PRINT BUTTON */}
                        <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
                            <button
                                type="button"
                                onClick={() => setShowBarangKeluarModal(false)}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-lg transition text-xs"
                            >
                                Tutup
                            </button>
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-5 py-2 rounded-lg transition shadow-lg shadow-emerald-500/20 text-xs flex items-center gap-1.5"
                            >
                                🖨️ Cetak Surat Barang Keluar (PDF/Print)
                            </button>
                        </div>
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
                                <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                                    <label className="text-slate-400 block font-semibold">Nominal DP Diterima (Rp):</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max={targetPromoteOrder.total_price}
                                        value={promoteCustomPaidAmount}
                                        onChange={e => setPromoteCustomPaidAmount(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-emerald-400 font-mono font-bold text-sm focus:border-emerald-400"
                                        placeholder="Masukkan nominal DP Rupiah"
                                    />
                                </div>
                            )}

                            {/* RINCIAN PERHITUNGAN */}
                            <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl space-y-1 text-emerald-300">
                                <div className="flex justify-between font-bold">
                                    <span>Nominal DP Diterima:</span>
                                    <span className="font-mono text-sm">Rp {Number(getPromotePaidAmount()).toLocaleString()}</span>
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
        </div>
    );
}
