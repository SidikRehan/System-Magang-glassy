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
    const isDivisionWorker = userRole.startsWith('divisi_');
    const [stockSubTab, setStockSubTab] = useState('lembaran');
    const [productionSubTab, setProductionSubTab] = useState(isDivisionWorker ? `${userRole}_active` : 'all');

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
    const [dashboardChartMetric, setDashboardChartMetric] = useState('revenue');
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

    const handleStartJob = (id) => {
        router.post(route('orders.start', id));
    };

    const handleFinishJob = (id, nextDiv = 'QC_Ready') => {
        router.post(route('orders.finish', id), {
            next_division: nextDiv
        });
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
                                📦 <span>Stok Kaca</span>
                            </button>
                        )}

                        {(userRole === 'admin_toko' || userRole === 'admin_gudang' || userRole === 'owner') && (
                            <button onClick={() => setActiveTab('suppliers')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-left transition ${activeTab === 'suppliers' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                                🏢 <span>Data Supplier & Mitra</span>
                            </button>
                        )}

                        {(userRole === 'admin_toko' || userRole === 'admin_gudang' || userRole === 'owner') && (
                            <button onClick={() => setActiveTab('accessories')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-left transition ${activeTab === 'accessories' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                                🔌 <span>Stok Aksesoris</span>
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
                    {activeTab === 'dashboard' && (
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
                                    <p className="text-slate-400 text-xs mt-0.5">Monitoring Penjualan Kaca, Omset Usaha, dan Performa Divisi Pengerjaan SYP GLASS.</p>
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

                                <div className="bg-slate-900/80 border-l-4 border-emerald-500 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden group">
                                    <div className="absolute -right-3 -bottom-3 text-6xl opacity-10 group-hover:scale-110 transition">💵</div>
                                    <span className="text-xs text-slate-400 font-semibold block">Estimasi Omset Penjualan (Bulan Ini)</span>
                                    <h3 className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">Rp 128.500.000</h3>
                                    <span className="text-[11px] text-emerald-400 font-bold mt-2 inline-flex items-center gap-1">
                                        🚀 Peak Omset Tertinggi 2026
                                    </span>
                                </div>

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
                                                📊 Grafik Penjualan & Pertumbuhan Omset (Jan - Agu 2026)
                                            </h3>
                                            <p className="text-xs text-slate-400">Tren penjualan bulanan kaca cermin, tempered, dan aksesoris.</p>
                                        </div>

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
                                                const heightPct = dashboardChartMetric === 'revenue' 
                                                    ? Math.round((item.revenue / maxRev) * 100)
                                                    : Math.round((item.spo / maxSpo) * 100);

                                                return (
                                                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                                                        {/* HOVER TOOLTIP */}
                                                        <div className="opacity-0 group-hover:opacity-100 transition duration-200 absolute -top-12 bg-slate-950 border border-cyan-400/50 text-slate-100 text-[11px] font-mono px-2.5 py-1.5 rounded-lg shadow-2xl z-20 pointer-events-none whitespace-nowrap text-center">
                                                            <div className="font-bold text-cyan-300">{item.month} 2026</div>
                                                            <div>{item.rpText} • {item.spo} SPO ({item.growth})</div>
                                                        </div>

                                                        {/* VALUE LABEL ABOVE BAR */}
                                                        <span className={`text-[10px] font-mono font-bold ${item.isPeak ? 'text-cyan-300' : 'text-slate-400'}`}>
                                                            {dashboardChartMetric === 'revenue' ? item.rpText : `${item.spo} SPO`}
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
                                            <span className="text-slate-400 text-[11px]">Rata-rata Omset/Bulan:</span>
                                            <div className="font-extrabold text-slate-100 font-mono text-sm">Rp 82.350.000</div>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 text-[11px]">Bulan Tertinggi (Peak):</span>
                                            <div className="font-extrabold text-cyan-400 font-mono text-sm">Agustus (Rp 128.5M)</div>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 text-[11px]">Pertumbuhan Tahunan:</span>
                                            <div className="font-extrabold text-emerald-400 font-mono text-sm">+38.5% YoY</div>
                                        </div>
                                    </div>
                                </div>

                                {/* GRAFIK 2: PERFORMANCE KATEGORI PRODUK & KINERJA DIVISI */}
                                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-extrabold text-slate-100 text-base flex items-center gap-2 border-b border-slate-800 pb-3">
                                            🎯 Kontribusi Penjualan Per Jenis Kaca
                                        </h3>
                                        <p className="text-xs text-slate-400 mt-1">Distribusi omset berdasarkan jenis produk kaca utama.</p>

                                        {/* PROGRESS BARS PER CATEGORY */}
                                        <div className="space-y-4 mt-4">
                                            {[
                                                { label: 'Kaca Cermin Grey & Polos 5mm', percent: 38, rp: 'Rp 48.830.000', gradient: 'from-cyan-500 to-blue-600' },
                                                { label: 'Kaca Tempered 8mm - 12mm', percent: 32, rp: 'Rp 41.120.000', gradient: 'from-emerald-500 to-teal-600' },
                                                { label: 'Kaca Tinted & Dark Grey', percent: 18, rp: 'Rp 23.130.000', gradient: 'from-amber-500 to-orange-600' },
                                                { label: 'Kaca Laminated & Etsa Blur', percent: 12, rp: 'Rp 15.420.000', gradient: 'from-purple-500 to-indigo-600' },
                                            ].map((cat, idx) => (
                                                <div key={idx} className="space-y-1">
                                                    <div className="flex justify-between text-xs font-semibold">
                                                        <span className="text-slate-200">{cat.label}</span>
                                                        <span className="font-mono text-cyan-300">{cat.percent}% ({cat.rp})</span>
                                                    </div>
                                                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
                                                        <div
                                                            style={{ width: `${cat.percent}%` }}
                                                            className={`h-full rounded-full bg-gradient-to-r ${cat.gradient} transition-all duration-500`}
                                                        ></div>
                                                    </div>
                                                </div>
                                            ))}
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
                                    <h2 className="text-2xl font-extrabold text-slate-100">Menu Orderan & Draf</h2>
                                    <p className="text-slate-400 text-sm">Kelola orderan baru, draf negosiasi, dan disposisi pengerjaan</p>
                                </div>
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
                                            {initialOrders.filter(o => o.status === 'pengerjaan' && o.current_division === 'admin_gudang').map(o => (
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
                                                    </div>
                                                    <div className="flex justify-between items-center pt-1">
                                                        <span className="text-[11px] text-slate-400 font-mono">📅 Deadline: {o.deadline_date || '-'}</span>
                                                        <button 
                                                            onClick={() => { setSelectedDispatchOrder(o); setShowDispatchModal(true); }} 
                                                            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold px-3.5 py-1.5 rounded-lg text-xs shadow-md transition flex items-center gap-1"
                                                        >
                                                            📤 Disposisi Divisi →
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* SECTION B: WORKSTATION ACTIVE PENGERJAAN CARDS */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                                    <h3 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
                                        🔨 Pengerjaan Workstation Divisi Pabrik
                                    </h3>
                                </div>

                                {(() => {
                                    const filteredWorkstationOrders = initialOrders.filter(o => {
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

                                    if (filteredWorkstationOrders.length === 0) {
                                        return (
                                            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center space-y-2">
                                                <div className="text-3xl">⚙️</div>
                                                <h4 className="font-extrabold text-slate-300 text-base">Tidak Ada Pengerjaan di Divisi Ini Saat Ini</h4>
                                                <p className="text-xs text-slate-500">Semua orderan di workstation ini telah selesai dikerjakan atau belum didispatch oleh Gudang.</p>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                            {filteredWorkstationOrders.map(o => {
                                                const isQC = o.current_division === 'QC_Ready';
                                                const isMyDiv = (userRole === o.current_division || userRole === 'admin_gudang' || userRole === 'owner');

                                                return (
                                                    <div 
                                                        key={o.id} 
                                                        className={`border rounded-2xl p-5 space-y-4 shadow-xl transition relative overflow-hidden ${isQC ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-slate-900/90 border-slate-800 hover:border-cyan-500/40'}`}
                                                    >
                                                        {/* CARD TOP HEADER */}
                                                        <div className="flex justify-between items-start border-b border-slate-800/80 pb-3">
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-black text-cyan-400 font-mono text-lg">{o.spo_number}</span>
                                                                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${o.priority_status === 'Prioritas' ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                                                                        {o.priority_status === 'Prioritas' ? '🔥 PRIORITAS' : '🔵 Biasa'}
                                                                    </span>
                                                                </div>
                                                                <h4 className="font-extrabold text-slate-100 text-base mt-1">{o.customer_name}</h4>
                                                                <p className="text-xs text-slate-400 font-mono mt-0.5">📞 {o.customer_phone} — 📍 {o.customer_address}</p>
                                                            </div>

                                                            <div className="text-right space-y-1">
                                                                <span className={`inline-block text-xs font-black px-3 py-1 rounded-full border ${isQC ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'}`}>
                                                                    {isQC ? '✅ QC Ready (Siap Kirim)' : (roleTitles[o.current_division] || o.current_division)}
                                                                </span>
                                                                <div className="text-[11px] text-amber-300 font-mono font-bold">
                                                                    📅 Deadline: {o.deadline_date || '-'}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* PROGRES CHECKLIST BADGES */}
                                                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-2">
                                                            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex justify-between">
                                                                <span>Tahapan Progres Pengerjaan Divisi:</span>
                                                            </div>
                                                            <div className="flex flex-wrap gap-2">
                                                                {['HT', 'GM', 'BV', 'Etsa'].map(proc => {
                                                                    const status = (o.division_progress && o.division_progress[proc]) ? o.division_progress[proc] : 'Belum';
                                                                    const isDone = status === 'Selesai';
                                                                    const isWorking = status === 'Sedang Dikerjakan';
                                                                    const isNA = status === 'N/A';

                                                                    return (
                                                                        <span 
                                                                            key={proc} 
                                                                            className={`text-xs px-2.5 py-1 rounded-lg font-bold font-mono border flex items-center gap-1 ${isDone ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : isWorking ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 animate-pulse' : isNA ? 'bg-slate-900 text-slate-600 border-slate-800' : 'bg-slate-900 text-slate-400 border-slate-800'}`}
                                                                        >
                                                                            <span>{proc}:</span>
                                                                            <strong>{status}</strong>
                                                                        </span>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>

                                                        {/* ITEM SPESIFIKASI KACA DETAIL */}
                                                        <div className="space-y-2">
                                                            <h5 className="text-xs font-bold text-slate-300">Spesifikasi Item Kaca:</h5>
                                                            {Array.isArray(o.items) && o.items.length > 0 ? (
                                                                o.items.map((it, idx) => (
                                                                    <div key={idx} className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                                                                        <div className="font-extrabold text-cyan-300 flex justify-between">
                                                                            <span>Item #{idx + 1}: {it.glass_type}</span>
                                                                            <span className="font-mono text-emerald-400">Qty: {it.qty || 1} Pcs</span>
                                                                        </div>
                                                                        <div className="text-slate-400 font-mono">
                                                                            Ukuran: <strong>{it.length_cm} cm</strong> x <strong>{it.width_cm} cm</strong> (Tebal {it.thickness_mm}mm)
                                                                        </div>
                                                                        {Array.isArray(it.processes) && (
                                                                            <div className="text-[11px] text-slate-300">
                                                                                Proses: <span className="text-amber-300 font-mono">{it.processes.join(', ')}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs">
                                                                    <div className="font-bold text-cyan-300">{o.glass_type}</div>
                                                                    <div className="text-slate-400 font-mono">Ukuran: {o.length_cm} x {o.width_cm} cm ({o.thickness_mm}mm)</div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* CATATAN & RAK SISA */}
                                                        <div className="flex flex-wrap justify-between items-center gap-2 text-xs pt-1">
                                                            {o.used_scrap_rak ? (
                                                                <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-lg font-mono font-bold flex items-center gap-1">
                                                                    ♻️ Potongan Kaca Rak: <strong>{o.used_scrap_rak}</strong>
                                                                </span>
                                                            ) : <span></span>}

                                                            {o.description && (
                                                                <span className="text-slate-300 italic text-[11px]">
                                                                    📝 {o.description}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* ACTION BUTTON FOOTER - TWO STEP WORKFLOW & DIVISION HISTORY */}
                                                        <div className="pt-3 border-t border-slate-800 flex flex-wrap justify-between items-center gap-3">
                                                            {(() => {
                                                                const divCode = isDivisionWorker ? userRole.replace('divisi_', '').toUpperCase() : productionSubTab.replace('divisi_', '').toUpperCase();
                                                                const pStatusInDiv = (o.division_progress && o.division_progress[divCode]) ? o.division_progress[divCode] : '';
                                                                const isFinishedInThisDiv = (o.current_division !== userRole && pStatusInDiv === 'Selesai');

                                                                if (isQC) {
                                                                    return (
                                                                        <div className="w-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 p-2.5 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2">
                                                                            <span>✅ Selesai Dikerjakan Divisi & Siap Diterbitkan Surat Jalan oleh Driver</span>
                                                                        </div>
                                                                    );
                                                                }

                                                                if (isFinishedInThisDiv && (isDivisionWorker || productionSubTab.startsWith('divisi_'))) {
                                                                    return (
                                                                        <div className="w-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 p-2.5 rounded-xl text-xs font-bold flex flex-wrap justify-between items-center gap-2">
                                                                            <span className="flex items-center gap-1.5">
                                                                                ✅ Riwayat: Telah Selesai Dikerjakan oleh Divisi Ini ({divCode})
                                                                            </span>
                                                                            <span className="text-[11px] bg-slate-900 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 font-mono">
                                                                                📍 Lokasi Sekarang: {roleTitles[o.current_division] || o.current_division}
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                }

                                                                const cKey = o.current_division.replace('divisi_', '').toUpperCase();
                                                                const cStatus = (o.division_progress && o.division_progress[cKey]) ? o.division_progress[cKey] : 'Belum';
                                                                const isWorking = cStatus === 'Sedang Dikerjakan';

                                                                return (
                                                                    <div className="w-full flex flex-wrap justify-between items-center gap-3">
                                                                        <div className="text-xs text-slate-400 italic">
                                                                            Petugas: <strong className="text-slate-200">{roleTitles[o.current_division] || o.current_division}</strong>
                                                                        </div>

                                                                        {isMyDiv ? (
                                                                            !isWorking && cStatus !== 'Selesai' ? (
                                                                                <button
                                                                                    onClick={() => handleStartJob(o.id)}
                                                                                    className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold px-5 py-2 rounded-xl text-xs transition shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 animate-pulse"
                                                                                >
                                                                                    ▶️ Mulai Kerjakan (Proses Sekarang)
                                                                                </button>
                                                                            ) : (
                                                                                <div className="flex items-center gap-2">
                                                                                    {/* SELECTOR TRANSFER KE DIVISI LAIN ATAU LANGSUNG QC */}
                                                                                    <select 
                                                                                        id={`next_div_select_${o.id}`}
                                                                                        defaultValue="QC_Ready"
                                                                                        className="bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs font-semibold focus:border-cyan-400"
                                                                                    >
                                                                                        <option value="QC_Ready">✅ Selesai & Lolos QC (Siap Kirim)</option>
                                                                                        <option value="divisi_ht">✂️ Teruskan ke Divisi HT (Potong)</option>
                                                                                        <option value="divisi_gm">✨ Teruskan ke Divisi GM (Gosok)</option>
                                                                                        <option value="divisi_bv">💎 Teruskan ke Divisi BV (Bevel)</option>
                                                                                        <option value="divisi_etsa">🎨 Teruskan ke Divisi Etsa (Blur)</option>
                                                                                    </select>

                                                                                    <button 
                                                                                        onClick={() => {
                                                                                            const sel = document.getElementById(`next_div_select_${o.id}`);
                                                                                            const nextVal = sel ? sel.value : 'QC_Ready';
                                                                                            handleFinishJob(o.id, nextVal);
                                                                                        }} 
                                                                                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-1.5 rounded-lg text-xs transition shadow-lg shadow-emerald-500/20 flex items-center gap-1"
                                                                                    >
                                                                                        ✓ Selesai & Teruskan Pekerjaan
                                                                                    </button>
                                                                                </div>
                                                                            )
                                                                        ) : (
                                                                            <span className="text-[11px] bg-slate-950 text-slate-400 border border-slate-800 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5" title="Orderan ini sedang dikerjakan di divisi lain. Anda dapat memantau progresnya, tetapi tombol eksekusi hanya dapat diakses oleh petugas divisi terkait.">
                                                                                🔒 Mode Monitoring (Eksekusi: {roleTitles[o.current_division] || o.current_division})
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })()}
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

                                            <div className="flex items-center gap-3">
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
                                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                                    <span className="text-xs text-slate-400 block">Stok Menipis / Perlu Restock</span>
                                    <h3 className="text-2xl font-black text-amber-400 mt-1">{accessoriesList.filter(a => a.status === 'Menipis' || a.status === 'Habis').length} Item</h3>
                                </div>
                                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                                    <span className="text-xs text-slate-400 block">Estimasi Nilai Inventory</span>
                                    <h3 className="text-2xl font-black text-purple-400 mt-1">Rp {Number(accessoriesList.reduce((acc, a) => acc + (a.buy_price * a.qty), 0)).toLocaleString()}</h3>
                                </div>
                            </div>

                            {/* BUTTON TAMBAH AKSESORIS DIRECTLY BELOW CARDS */}
                            {(userRole === 'admin_toko' || userRole === 'admin_gudang' || userRole === 'owner') && (
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
                                                        <option value="Kaca Bening 10 mm polos">Kaca Bening 10 mm polos</option>
                                                        <option value="Kaca Jumbo Polos 12 mm">Kaca Jumbo Polos 12 mm</option>
                                                        <option value="Kaca Dark Grey 5 mm">Kaca Dark Grey 5 mm</option>
                                                        <option value="Kaca Frosted Etsa Sandblast 5 mm">Kaca Frosted Etsa Sandblast 5 mm</option>
                                                        <option value="Kaca 12 mm Polos Tempered">Kaca 12 mm Polos Tempered</option>
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
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-slate-400 block mb-1">Panjang (cm):</label>
                                                    <input 
                                                        type="text" 
                                                        inputMode="decimal"
                                                        required 
                                                        placeholder="cth: 24,3 atau 150"
                                                        value={item.length_cm} 
                                                        onChange={e => handleItemChange(idx, 'length_cm', e.target.value)} 
                                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono focus:border-cyan-400" 
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-slate-400 block mb-1">Lebar (cm):</label>
                                                    <input 
                                                        type="text" 
                                                        inputMode="decimal"
                                                        required 
                                                        placeholder="cth: 160,5 atau 120"
                                                        value={item.width_cm} 
                                                        onChange={e => handleItemChange(idx, 'width_cm', e.target.value)} 
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
                                        <label className="text-slate-400 block mb-1 font-semibold">Status Pengerjaan:</label>
                                        <select 
                                            value={orderForm.priority_status} 
                                            onChange={e => {
                                                const val = e.target.value;
                                                setOrderForm(d => ({
                                                    ...d,
                                                    priority_status: val,
                                                    priority_fee: val === 'Prioritas' ? (d.priority_fee || '') : 0
                                                }));
                                            }} 
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-bold focus:border-cyan-400"
                                        >
                                            <option value="Biasa">Biasa (Standard)</option>
                                            <option value="Prioritas">Prioritas (Buru-buru / Fee Custom)</option>
                                        </select>
                                    </div>
                                    {orderForm.priority_status === 'Prioritas' && (
                                        <div>
                                            <label className="text-slate-400 block mb-1 font-semibold">Nominal Fee Prioritas (Rp):</label>
                                            <input 
                                                type="text"
                                                inputMode="numeric"
                                                value={formatRupiahInput(orderForm.priority_fee)} 
                                                onChange={e => setOrderForm('priority_fee', parseRupiahInput(e.target.value))} 
                                                className="w-full bg-slate-900 border border-amber-500/40 rounded-lg p-2 text-amber-400 font-bold font-mono focus:border-amber-400" 
                                                placeholder="cth: 150.000 atau 200.000" 
                                            />
                                            <span className="text-[10px] text-amber-400/80 block mt-1">*Admin isi manual (bisa ketik koma/titik)</span>
                                        </div>
                                    )}
                                    <div>
                                        <label className="text-slate-400 block mb-1 font-semibold">Harus diselesaikan pada (Deadline):</label>
                                        <input type="date" value={orderForm.deadline_date} onChange={e => setOrderForm('deadline_date', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-cyan-400" />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 8: METODE & OPSI PEMBAYARAN CUSTOMER */}
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                                <h4 className="font-bold text-emerald-400 text-xs border-b border-slate-800 pb-2 flex items-center justify-between">
                                    <span>💳 Metode & Opsi Pembayaran Customer</span>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                        Total Tagihan: <strong className="text-emerald-400 font-extrabold text-sm">Rp {calcTotalPrice.toLocaleString()}</strong>
                                    </span>
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                    <div>
                                        <label className="text-slate-400 block mb-1 font-semibold">Metode Pembayaran Customer:</label>
                                        <select 
                                            value={orderForm.payment_method || 'cash'} 
                                            onChange={e => setOrderForm('payment_method', e.target.value)} 
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-bold focus:border-cyan-400"
                                        >
                                            <option value="cash">💵 Cash / Tunai</option>
                                            <option value="transfer">🏦 Transfer Bank (BCA/Mandiri/BRI)</option>
                                            <option value="qris">📱 QRIS (Scan Barcode)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-slate-400 block mb-1 font-semibold">Jumlah Uang Diterima / Dibayar (Rp):</label>
                                        <input 
                                            type="text" 
                                            inputMode="numeric"
                                            value={formatRupiahInput(orderForm.custom_paid_amount)} 
                                            onChange={e => {
                                                const num = parseRupiahInput(e.target.value);
                                                const pct = calcTotalPrice > 0 ? Math.round((num / calcTotalPrice) * 100) : 50;
                                                setOrderForm(d => ({ ...d, custom_paid_amount: num, dp_percent: pct }));
                                            }} 
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-emerald-400 font-mono font-bold text-sm focus:border-cyan-400" 
                                            placeholder="cth: 500.000 atau 1.000.000" 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-[11px] text-slate-400">Tombol Cepat Bayar:</span>
                                        {[
                                            { label: 'Rp 100rb', val: 100000 },
                                            { label: 'Rp 200rb', val: 200000 },
                                            { label: 'Rp 300rb', val: 300000 },
                                            { label: 'Rp 500rb', val: 500000 },
                                            { label: '50% (DP Half)', val: Math.round(calcTotalPrice * 0.5) },
                                            { label: '⚡ Bayar Full / Lunas (100%)', val: calcTotalPrice }
                                        ].map((preset, pIdx) => (
                                            <button 
                                                key={pIdx}
                                                type="button"
                                                onClick={() => {
                                                    const pct = calcTotalPrice > 0 ? Math.round((preset.val / calcTotalPrice) * 100) : 50;
                                                    setOrderForm(d => ({ ...d, custom_paid_amount: preset.val, dp_percent: pct }));
                                                }}
                                                className={`px-2.5 py-1 border rounded text-[11px] font-mono transition ${preset.val === calcTotalPrice && calcTotalPrice > 0 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 font-bold' : 'bg-slate-900 hover:bg-cyan-500/20 text-slate-300 border-slate-700'}`}
                                            >
                                                {preset.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* OTOMATIS PENENTUAN STATUS (DP VS LUNAS) */}
                                <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs">
                                    <div>
                                        <span className="text-slate-400 block text-[11px]">Otomatis Penentuan Status Pembayaran:</span>
                                        <span className="font-mono font-extrabold text-sm">
                                            {(() => {
                                                const paid = orderForm.custom_paid_amount !== '' && orderForm.custom_paid_amount !== null && orderForm.custom_paid_amount !== undefined
                                                    ? (parseFloat(orderForm.custom_paid_amount) || 0)
                                                    : Math.round(calcTotalPrice * ((orderForm.dp_percent || 50) / 100));
                                                const pct = calcTotalPrice > 0 ? Math.round((paid / calcTotalPrice) * 100) : (orderForm.dp_percent || 50);
                                                const methodText = (orderForm.payment_method || 'cash').toUpperCase();
                                                
                                                if (paid >= calcTotalPrice && calcTotalPrice > 0) {
                                                    return <span className="text-emerald-400">✅ Lunas Langsung (100%) — {methodText}</span>;
                                                } else if (paid > 0) {
                                                    return <span className="text-amber-300">💵 Uang Muka / DP Rp {paid.toLocaleString()} ({pct}% dari Total) — {methodText}</span>;
                                                } else {
                                                    return <span className="text-slate-400">⚪ Belum Ada Pembayaran (DP 0%)</span>;
                                                }
                                            })()}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-slate-400 block text-[11px]">Sisa Pelunasan (COD):</span>
                                        <span className="font-mono font-bold text-slate-200">
                                            {(() => {
                                                const paid = orderForm.custom_paid_amount !== '' && orderForm.custom_paid_amount !== null && orderForm.custom_paid_amount !== undefined
                                                    ? (parseFloat(orderForm.custom_paid_amount) || 0)
                                                    : Math.round(calcTotalPrice * ((orderForm.dp_percent || 50) / 100));
                                                const sisa = Math.max(0, calcTotalPrice - paid);
                                                return sisa === 0 ? <span className="text-emerald-400 font-extrabold">Rp 0 (LUNAS)</span> : `Rp ${sisa.toLocaleString()}`;
                                            })()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 7: RINCIAN STRUK ORDERAN & KALKULASI HARGA (xii) */}
                            <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/40 space-y-3 font-mono">
                                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                    <h4 className="font-bold text-cyan-300 text-xs flex items-center gap-1.5 font-sans">
                                        🧾 Rincian Struk Orderan & Kalkulasi Harga
                                    </h4>
                                    <span className="text-[10px] text-slate-400">
                                        Luas Total Kaca: <strong className="text-cyan-400">{calcItems.reduce((sum, i) => sum + i.areaM2, 0).toFixed(2)} m²</strong>
                                    </span>
                                </div>

                                {/* LIST ITEM KACA RECEIPT LINES */}
                                <div className="space-y-3 text-xs">
                                    {calcItems.map((it, iIdx) => {
                                        const processFeeSum = (it.feeGM || 0) + (it.feeHT || 0) + (it.feeBV || 0) + (it.feeBor || 0) + (it.feeEtsa || 0);
                                        return (
                                            <div key={iIdx} className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-2">
                                                <div className="flex justify-between text-slate-100 font-bold border-b border-slate-800 pb-1.5">
                                                    <span>
                                                        #{iIdx + 1}. {it.glass_type || 'Kaca Dasar'} ({it.length_cm || 0} x {it.width_cm || 0} cm)
                                                    </span>
                                                    <span className="text-cyan-400 font-mono">
                                                        {it.qty} Unit (Total {it.areaM2.toFixed(2)} m²)
                                                    </span>
                                                </div>

                                                {/* RINCIAN HARGA BAHAN KACA DIBELI */}
                                                <div className="space-y-1 text-[11px] text-slate-300 pl-1">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-400">1. Harga Kaca yang Dibeli (Bahan):</span>
                                                        <strong className="text-slate-200">Rp {it.baseGlassPrice.toLocaleString()}</strong>
                                                    </div>

                                                    {/* RINCIAN BIAYA EKSEKUSI KACA */}
                                                    <div className="space-y-0.5 pl-2 border-l-2 border-slate-700/60 my-1">
                                                        <div className="text-[10px] text-cyan-400/90 font-semibold">2. Rincian Biaya Eksekusi / Proses Kaca:</div>
                                                        {it.processes && it.processes.includes('HT') && (
                                                            <div className="flex justify-between text-[10px] text-slate-400">
                                                                <span>• Potong & Halus Tepi (HT)</span>
                                                                <span>+ Rp {(it.feeHT || 0).toLocaleString()}</span>
                                                            </div>
                                                        )}
                                                        {it.processes && it.processes.includes('GM') && (
                                                            <div className="flex justify-between text-[10px] text-slate-400">
                                                                <span>• Gosok Mesin (GM)</span>
                                                                <span>+ Rp {(it.feeGM || 0).toLocaleString()}</span>
                                                            </div>
                                                        )}
                                                        {it.processes && it.processes.includes('BV') && (
                                                            <div className="flex justify-between text-[10px] text-slate-400">
                                                                <span>• Beveling (BV {it.bevel_width_cm || 1} cm)</span>
                                                                <span>+ Rp {(it.feeBV || 0).toLocaleString()}</span>
                                                            </div>
                                                        )}
                                                        {it.processes && it.processes.includes('Bor') && (
                                                            <div className="flex justify-between text-[10px] text-slate-400">
                                                                <span>• Bor Coakan Lubang ({it.hole_qty || 1} lubang)</span>
                                                                <span>+ Rp {(it.feeBor || 0).toLocaleString()}</span>
                                                            </div>
                                                        )}
                                                        {it.processes && it.processes.includes('Etsa') && (
                                                            <div className="flex justify-between text-[10px] text-slate-400">
                                                                <span>• Etsa Sandblast</span>
                                                                <span>+ Rp {(it.feeEtsa || 0).toLocaleString()}</span>
                                                            </div>
                                                        )}
                                                        {(!it.processes || it.processes.length === 0) && (
                                                            <div className="text-[10px] text-slate-500 italic">• Polos (Tanpa Proses Lanjutan)</div>
                                                        )}
                                                    </div>

                                                    <div className="flex justify-between text-[11px] text-slate-300 font-semibold pt-0.5">
                                                        <span className="text-slate-400">• Total Biaya Eksekusi Item Ini:</span>
                                                        <strong className="text-cyan-300">+ Rp {processFeeSum.toLocaleString()}</strong>
                                                    </div>
                                                </div>

                                                <div className="text-right text-xs font-extrabold text-slate-100 border-t border-slate-800 pt-1.5">
                                                    Subtotal Item Kaca #{iIdx + 1}: <span className="text-emerald-400">Rp {it.subtotal.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* AKSESORIS TAMBAHAN JIKA ADA */}
                                    {orderForm.accessories && orderForm.accessories.length > 0 && (
                                        <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
                                            <div className="font-bold text-slate-200 text-xs flex justify-between border-b border-slate-800 pb-1">
                                                <span>🛠️ Aksesoris & Hardware Tambahan:</span>
                                                <span className="text-cyan-400">Rp {calcTotalAccessoryFees.toLocaleString()}</span>
                                            </div>
                                            {orderForm.accessories.map((acc, aIdx) => {
                                                const price = typeof acc === 'object' ? (acc.price || 0) : 0;
                                                const qty = typeof acc === 'object' ? (acc.qty || 1) : 1;
                                                const name = typeof acc === 'object' ? (acc.name || 'Aksesoris') : acc;
                                                return (
                                                    <div key={aIdx} className="flex justify-between text-[11px] text-slate-300 pl-1">
                                                        <span>- {name} ({qty} {acc.unit || 'pcs'})</span>
                                                        <strong className="text-slate-200">Rp {(price * qty).toLocaleString()}</strong>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* GARIS PEMBATAS STRUK (DASHED BORDER) */}
                                <div className="border-t border-dashed border-slate-700 my-2"></div>

                                {/* RINCIAN AKHIR SUB-TOTAL, BIAYA PRIORITAS & GRAND TOTAL */}
                                <div className="space-y-1.5 text-xs font-sans">
                                    <div className="flex justify-between text-slate-300">
                                        <span>• Total Harga Kaca Dibeli (Bahan):</span>
                                        <strong className="font-mono text-slate-200">Rp {calcTotalGlassBasePrice.toLocaleString()}</strong>
                                    </div>

                                    <div className="flex justify-between text-slate-300">
                                        <span>• Total Biaya Eksekusi / Proses Kaca:</span>
                                        <strong className="font-mono text-cyan-300">+ Rp {calcTotalProcessFees.toLocaleString()}</strong>
                                    </div>

                                    {calcTotalAccessoryFees > 0 && (
                                        <div className="flex justify-between text-slate-300">
                                            <span>• Total Aksesoris & Hardware:</span>
                                            <strong className="font-mono text-slate-200">+ Rp {calcTotalAccessoryFees.toLocaleString()}</strong>
                                        </div>
                                    )}

                                    {/* BIAYA PRIORITAS PENGERJAAN */}
                                    <div className="flex justify-between items-center bg-slate-900/80 p-2 rounded-lg border border-amber-500/30">
                                        <span className="text-amber-300 font-bold flex items-center gap-1">
                                            ⚡ Biaya Prioritas Pengerjaan (Buru-buru):
                                            {orderForm.priority_status !== 'Prioritas' && <span className="text-[10px] text-slate-400 font-normal ml-1">(Status: Biasa)</span>}
                                        </span>
                                        <strong className="font-mono text-amber-400 font-extrabold text-sm">
                                            + Rp {calcPriorityFee.toLocaleString()}
                                        </strong>
                                    </div>

                                    {/* BIAYA CUSTOM ADMIN */}
                                    <div className="flex justify-between items-center bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                                        <label className="text-slate-300 font-medium">
                                            ➕ Biaya Tambahan / Custom Admin (Rp):
                                        </label>
                                        <input 
                                            type="text" 
                                            inputMode="numeric"
                                            value={formatRupiahInput(orderForm.custom_fee)} 
                                            onChange={e => setOrderForm('custom_fee', parseRupiahInput(e.target.value))} 
                                            className="w-36 bg-slate-950 border border-slate-700 rounded p-1 text-slate-100 font-mono font-bold text-xs text-right focus:border-cyan-400" 
                                            placeholder="0" 
                                        />
                                    </div>

                                    <div className="border-t border-dashed border-slate-700 pt-2 flex justify-between items-center bg-emerald-950/40 p-3 rounded-xl border border-emerald-500/40">
                                        <div>
                                            <span className="text-slate-200 block font-bold text-xs">GRAND TOTAL HARGA ORDER:</span>
                                            <span className="text-[10px] text-slate-400 font-mono">Bahan + Eksekusi + Prioritas + Custom</span>
                                        </div>
                                        <span className="font-mono font-black text-emerald-400 text-lg">
                                            Rp {calcTotalPrice.toLocaleString()}
                                        </span>
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
                                                        <option value="Kaca Bening 10 mm polos">Kaca Bening 10 mm polos</option>
                                                        <option value="Kaca Jumbo Polos 12 mm">Kaca Jumbo Polos 12 mm</option>
                                                        <option value="Kaca Dark Grey 5 mm">Kaca Dark Grey 5 mm</option>
                                                        <option value="Kaca Frosted Etsa Sandblast 5 mm">Kaca Frosted Etsa Sandblast 5 mm</option>
                                                        <option value="Kaca 12 mm Polos Tempered">Kaca 12 mm Polos Tempered</option>
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
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-slate-400 block mb-1">Panjang (cm):</label>
                                                    <input 
                                                        type="text" 
                                                        inputMode="decimal"
                                                        required 
                                                        placeholder="cth: 24,3 atau 150"
                                                        value={item.length_cm} 
                                                        onChange={e => handleItemChange(idx, 'length_cm', e.target.value)} 
                                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono focus:border-cyan-400" 
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-slate-400 block mb-1">Lebar (cm):</label>
                                                    <input 
                                                        type="text" 
                                                        inputMode="decimal"
                                                        required 
                                                        placeholder="cth: 160,5 atau 120"
                                                        value={item.width_cm} 
                                                        onChange={e => handleItemChange(idx, 'width_cm', e.target.value)} 
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
                                        <label className="text-slate-400 block mb-1 font-semibold">Status Pengerjaan:</label>
                                        <select 
                                            value={orderForm.priority_status} 
                                            onChange={e => {
                                                const val = e.target.value;
                                                setOrderForm(d => ({
                                                    ...d,
                                                    priority_status: val,
                                                    priority_fee: val === 'Prioritas' ? (d.priority_fee || '') : 0
                                                }));
                                            }} 
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-bold focus:border-cyan-400"
                                        >
                                            <option value="Biasa">Biasa (Standard)</option>
                                            <option value="Prioritas">Prioritas (Buru-buru / Fee Custom)</option>
                                        </select>
                                    </div>
                                    {orderForm.priority_status === 'Prioritas' && (
                                        <div>
                                            <label className="text-slate-400 block mb-1 font-semibold">Nominal Fee Prioritas (Rp):</label>
                                            <input 
                                                type="text" 
                                                inputMode="numeric"
                                                value={formatRupiahInput(orderForm.priority_fee)} 
                                                onChange={e => setOrderForm('priority_fee', parseRupiahInput(e.target.value))} 
                                                className="w-full bg-slate-900 border border-amber-500/40 rounded-lg p-2 text-amber-400 font-bold font-mono focus:border-amber-400" 
                                                placeholder="cth: 150.000 atau 200.000" 
                                            />
                                            <span className="text-[10px] text-amber-400/80 block mt-1">*Admin isi manual (bisa ketik koma/titik)</span>
                                        </div>
                                    )}
                                    <div>
                                        <label className="text-slate-400 block mb-1 font-semibold">Harus diselesaikan pada (Deadline):</label>
                                        <input type="date" value={orderForm.deadline_date} onChange={e => setOrderForm('deadline_date', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-cyan-400" />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 8: METODE & OPSI PEMBAYARAN CUSTOMER */}
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                                <h4 className="font-bold text-emerald-400 text-xs border-b border-slate-800 pb-2 flex items-center justify-between">
                                    <span>💳 Metode & Opsi Pembayaran Customer</span>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                        Total Tagihan: <strong className="text-emerald-400 font-extrabold text-sm">Rp {calcTotalPrice.toLocaleString()}</strong>
                                    </span>
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                    <div>
                                        <label className="text-slate-400 block mb-1 font-semibold">Metode Pembayaran Customer:</label>
                                        <select 
                                            value={orderForm.payment_method || 'cash'} 
                                            onChange={e => setOrderForm('payment_method', e.target.value)} 
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-bold focus:border-cyan-400"
                                        >
                                            <option value="cash">💵 Cash / Tunai</option>
                                            <option value="transfer">🏦 Transfer Bank (BCA/Mandiri/BRI)</option>
                                            <option value="qris">📱 QRIS (Scan Barcode)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-slate-400 block mb-1 font-semibold">Jumlah Uang Diterima / Dibayar (Rp):</label>
                                        <input 
                                            type="text" 
                                            inputMode="numeric"
                                            value={formatRupiahInput(orderForm.custom_paid_amount)} 
                                            onChange={e => {
                                                const num = parseRupiahInput(e.target.value);
                                                const pct = calcTotalPrice > 0 ? Math.round((num / calcTotalPrice) * 100) : 50;
                                                setOrderForm(d => ({ ...d, custom_paid_amount: num, dp_percent: pct }));
                                            }} 
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-emerald-400 font-mono font-bold text-sm focus:border-cyan-400" 
                                            placeholder="cth: 500.000 atau 1.000.000" 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-[11px] text-slate-400">Tombol Cepat Bayar:</span>
                                        {[
                                            { label: 'Rp 100rb', val: 100000 },
                                            { label: 'Rp 200rb', val: 200000 },
                                            { label: 'Rp 300rb', val: 300000 },
                                            { label: 'Rp 500rb', val: 500000 },
                                            { label: '50% (DP Half)', val: Math.round(calcTotalPrice * 0.5) },
                                            { label: '⚡ Bayar Full / Lunas (100%)', val: calcTotalPrice }
                                        ].map((preset, pIdx) => (
                                            <button 
                                                key={pIdx}
                                                type="button"
                                                onClick={() => {
                                                    const pct = calcTotalPrice > 0 ? Math.round((preset.val / calcTotalPrice) * 100) : 50;
                                                    setOrderForm(d => ({ ...d, custom_paid_amount: preset.val, dp_percent: pct }));
                                                }}
                                                className={`px-2.5 py-1 border rounded text-[11px] font-mono transition ${preset.val === calcTotalPrice && calcTotalPrice > 0 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 font-bold' : 'bg-slate-900 hover:bg-cyan-500/20 text-slate-300 border-slate-700'}`}
                                            >
                                                {preset.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* OTOMATIS PENENTUAN STATUS (DP VS LUNAS) */}
                                <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs">
                                    <div>
                                        <span className="text-slate-400 block text-[11px]">Otomatis Penentuan Status Pembayaran:</span>
                                        <span className="font-mono font-extrabold text-sm">
                                            {(() => {
                                                const paid = orderForm.custom_paid_amount !== '' && orderForm.custom_paid_amount !== null && orderForm.custom_paid_amount !== undefined
                                                    ? (parseFloat(orderForm.custom_paid_amount) || 0)
                                                    : Math.round(calcTotalPrice * ((orderForm.dp_percent || 50) / 100));
                                                const pct = calcTotalPrice > 0 ? Math.round((paid / calcTotalPrice) * 100) : (orderForm.dp_percent || 50);
                                                const methodText = (orderForm.payment_method || 'cash').toUpperCase();
                                                
                                                if (paid >= calcTotalPrice && calcTotalPrice > 0) {
                                                    return <span className="text-emerald-400">✅ Lunas Langsung (100%) — {methodText}</span>;
                                                } else if (paid > 0) {
                                                    return <span className="text-amber-300">💵 Uang Muka / DP Rp {paid.toLocaleString()} ({pct}% dari Total) — {methodText}</span>;
                                                } else {
                                                    return <span className="text-slate-400">⚪ Belum Ada Pembayaran (DP 0%)</span>;
                                                }
                                            })()}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-slate-400 block text-[11px]">Sisa Pelunasan (COD):</span>
                                        <span className="font-mono font-bold text-slate-200">
                                            {(() => {
                                                const paid = orderForm.custom_paid_amount !== '' && orderForm.custom_paid_amount !== null && orderForm.custom_paid_amount !== undefined
                                                    ? (parseFloat(orderForm.custom_paid_amount) || 0)
                                                    : Math.round(calcTotalPrice * ((orderForm.dp_percent || 50) / 100));
                                                const sisa = Math.max(0, calcTotalPrice - paid);
                                                return sisa === 0 ? <span className="text-emerald-400 font-extrabold">Rp 0 (LUNAS)</span> : `Rp ${sisa.toLocaleString()}`;
                                            })()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 7: RINCIAN STRUK ORDERAN & KALKULASI HARGA (xii) */}
                            <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/40 space-y-3 font-mono">
                                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                    <h4 className="font-bold text-cyan-300 text-xs flex items-center gap-1.5 font-sans">
                                        🧾 Rincian Struk Orderan & Kalkulasi Harga
                                    </h4>
                                    <span className="text-[10px] text-slate-400">
                                        Luas Total Kaca: <strong className="text-cyan-400">{calcItems.reduce((sum, i) => sum + i.areaM2, 0).toFixed(2)} m²</strong>
                                    </span>
                                </div>

                                {/* LIST ITEM KACA RECEIPT LINES */}
                                <div className="space-y-3 text-xs">
                                    {calcItems.map((it, iIdx) => {
                                        const processFeeSum = (it.feeGM || 0) + (it.feeHT || 0) + (it.feeBV || 0) + (it.feeBor || 0) + (it.feeEtsa || 0);
                                        return (
                                            <div key={iIdx} className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-2">
                                                <div className="flex justify-between text-slate-100 font-bold border-b border-slate-800 pb-1.5">
                                                    <span>
                                                        #{iIdx + 1}. {it.glass_type || 'Kaca Dasar'} ({it.length_cm || 0} x {it.width_cm || 0} cm)
                                                    </span>
                                                    <span className="text-cyan-400 font-mono">
                                                        {it.qty} Unit (Total {it.areaM2.toFixed(2)} m²)
                                                    </span>
                                                </div>

                                                {/* RINCIAN HARGA BAHAN KACA DIBELI */}
                                                <div className="space-y-1 text-[11px] text-slate-300 pl-1">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-400">1. Harga Kaca yang Dibeli (Bahan):</span>
                                                        <strong className="text-slate-200">Rp {it.baseGlassPrice.toLocaleString()}</strong>
                                                    </div>

                                                    {/* RINCIAN BIAYA EKSEKUSI KACA */}
                                                    <div className="space-y-0.5 pl-2 border-l-2 border-slate-700/60 my-1">
                                                        <div className="text-[10px] text-cyan-400/90 font-semibold">2. Rincian Biaya Eksekusi / Proses Kaca:</div>
                                                        {it.processes && it.processes.includes('HT') && (
                                                            <div className="flex justify-between text-[10px] text-slate-400">
                                                                <span>• Potong & Halus Tepi (HT)</span>
                                                                <span>+ Rp {(it.feeHT || 0).toLocaleString()}</span>
                                                            </div>
                                                        )}
                                                        {it.processes && it.processes.includes('GM') && (
                                                            <div className="flex justify-between text-[10px] text-slate-400">
                                                                <span>• Gosok Mesin (GM)</span>
                                                                <span>+ Rp {(it.feeGM || 0).toLocaleString()}</span>
                                                            </div>
                                                        )}
                                                        {it.processes && it.processes.includes('BV') && (
                                                            <div className="flex justify-between text-[10px] text-slate-400">
                                                                <span>• Beveling (BV {it.bevel_width_cm || 1} cm)</span>
                                                                <span>+ Rp {(it.feeBV || 0).toLocaleString()}</span>
                                                            </div>
                                                        )}
                                                        {it.processes && it.processes.includes('Bor') && (
                                                            <div className="flex justify-between text-[10px] text-slate-400">
                                                                <span>• Bor Coakan Lubang ({it.hole_qty || 1} lubang)</span>
                                                                <span>+ Rp {(it.feeBor || 0).toLocaleString()}</span>
                                                            </div>
                                                        )}
                                                        {it.processes && it.processes.includes('Etsa') && (
                                                            <div className="flex justify-between text-[10px] text-slate-400">
                                                                <span>• Etsa Sandblast</span>
                                                                <span>+ Rp {(it.feeEtsa || 0).toLocaleString()}</span>
                                                            </div>
                                                        )}
                                                        {(!it.processes || it.processes.length === 0) && (
                                                            <div className="text-[10px] text-slate-500 italic">• Polos (Tanpa Proses Lanjutan)</div>
                                                        )}
                                                    </div>

                                                    <div className="flex justify-between text-[11px] text-slate-300 font-semibold pt-0.5">
                                                        <span className="text-slate-400">• Total Biaya Eksekusi Item Ini:</span>
                                                        <strong className="text-cyan-300">+ Rp {processFeeSum.toLocaleString()}</strong>
                                                    </div>
                                                </div>

                                                <div className="text-right text-xs font-extrabold text-slate-100 border-t border-slate-800 pt-1.5">
                                                    Subtotal Item Kaca #{iIdx + 1}: <span className="text-emerald-400">Rp {it.subtotal.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* AKSESORIS TAMBAHAN JIKA ADA */}
                                    {orderForm.accessories && orderForm.accessories.length > 0 && (
                                        <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
                                            <div className="font-bold text-slate-200 text-xs flex justify-between border-b border-slate-800 pb-1">
                                                <span>🛠️ Aksesoris & Hardware Tambahan:</span>
                                                <span className="text-cyan-400">Rp {calcTotalAccessoryFees.toLocaleString()}</span>
                                            </div>
                                            {orderForm.accessories.map((acc, aIdx) => {
                                                const price = typeof acc === 'object' ? (acc.price || 0) : 0;
                                                const qty = typeof acc === 'object' ? (acc.qty || 1) : 1;
                                                const name = typeof acc === 'object' ? (acc.name || 'Aksesoris') : acc;
                                                return (
                                                    <div key={aIdx} className="flex justify-between text-[11px] text-slate-300 pl-1">
                                                        <span>- {name} ({qty} {acc.unit || 'pcs'})</span>
                                                        <strong className="text-slate-200">Rp {(price * qty).toLocaleString()}</strong>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* GARIS PEMBATAS STRUK (DASHED BORDER) */}
                                <div className="border-t border-dashed border-slate-700 my-2"></div>

                                {/* RINCIAN AKHIR SUB-TOTAL, BIAYA PRIORITAS & GRAND TOTAL */}
                                <div className="space-y-1.5 text-xs font-sans">
                                    <div className="flex justify-between text-slate-300">
                                        <span>• Total Harga Kaca Dibeli (Bahan):</span>
                                        <strong className="font-mono text-slate-200">Rp {calcTotalGlassBasePrice.toLocaleString()}</strong>
                                    </div>

                                    <div className="flex justify-between text-slate-300">
                                        <span>• Total Biaya Eksekusi / Proses Kaca:</span>
                                        <strong className="font-mono text-cyan-300">+ Rp {calcTotalProcessFees.toLocaleString()}</strong>
                                    </div>

                                    {calcTotalAccessoryFees > 0 && (
                                        <div className="flex justify-between text-slate-300">
                                            <span>• Total Aksesoris & Hardware:</span>
                                            <strong className="font-mono text-slate-200">+ Rp {calcTotalAccessoryFees.toLocaleString()}</strong>
                                        </div>
                                    )}

                                    {/* BIAYA PRIORITAS PENGERJAAN */}
                                    <div className="flex justify-between items-center bg-slate-900/80 p-2 rounded-lg border border-amber-500/30">
                                        <span className="text-amber-300 font-bold flex items-center gap-1">
                                            ⚡ Biaya Prioritas Pengerjaan (Buru-buru):
                                            {orderForm.priority_status !== 'Prioritas' && <span className="text-[10px] text-slate-400 font-normal ml-1">(Status: Biasa)</span>}
                                        </span>
                                        <strong className="font-mono text-amber-400 font-extrabold text-sm">
                                            + Rp {calcPriorityFee.toLocaleString()}
                                        </strong>
                                    </div>

                                    {/* BIAYA CUSTOM ADMIN */}
                                    <div className="flex justify-between items-center bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                                        <label className="text-slate-300 font-medium">
                                            ➕ Biaya Tambahan / Custom Admin (Rp):
                                        </label>
                                        <input 
                                            type="text" 
                                            inputMode="numeric"
                                            value={formatRupiahInput(orderForm.custom_fee)} 
                                            onChange={e => setOrderForm('custom_fee', parseRupiahInput(e.target.value))} 
                                            className="w-36 bg-slate-950 border border-slate-700 rounded p-1 text-slate-100 font-mono font-bold text-xs text-right focus:border-cyan-400" 
                                            placeholder="0" 
                                        />
                                    </div>

                                    <div className="border-t border-dashed border-slate-700 pt-2 flex justify-between items-center bg-emerald-950/40 p-3 rounded-xl border border-emerald-500/40">
                                        <div>
                                            <span className="text-slate-200 block font-bold text-xs">GRAND TOTAL HARGA ORDER:</span>
                                            <span className="text-[10px] text-slate-400 font-mono">Bahan + Eksekusi + Prioritas + Custom</span>
                                        </div>
                                        <span className="font-mono font-black text-emerald-400 text-lg">
                                            Rp {calcTotalPrice.toLocaleString()}
                                        </span>
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

                                    <label className="text-slate-400 block mb-1 font-semibold">Nama Perusahaan Supplier:</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. PT Asahimas Flat Glass Tbk"
                                        value={newStockForm.supplier_name}
                                        onChange={e => setNewStockForm({ ...newStockForm, supplier_name: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-cyan-400 font-medium"
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
        </div>
    );
}
