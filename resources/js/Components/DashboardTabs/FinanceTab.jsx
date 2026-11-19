import React, { useState, useMemo } from 'react';
import {
    Briefcase,
    TrendingUp,
    Package,
    Zap,
    Award,
    Truck,
    Printer,
    Plus,
    Search,
    Filter,
    Trash2,
    Check,
    X,
    FileText,
    CreditCard,
    Clock,
    Shield,
    Recycle,
    DollarSign,
    Fuel,
    Users,
    Wrench,
    Building2,
    AlertTriangle,
    Eye,
    MessageSquare,
    Send,
    Plug,
    Archive,
    CheckCircle2,
    Boxes,
    Calendar,
    BarChart3,
    ArrowRight
} from 'lucide-react';
import MonthlyNetProfitRecapModal, { formatPeriodLabel } from '@/Components/Modals/MonthlyNetProfitRecapModal';
import OrderOmzetDetailModal from '@/Components/Modals/OrderOmzetDetailModal';

export default function FinanceTab({
    userRole,
    metrics = {},
    ordersList = [],
    financeTransactionsList = [],
    sheetGlasses = [],
    accessoriesList = [],
    toolsList = [],
    warehouseSuppliesList = [],
    supplyRestockRequests = [],
    financeSearchTerm,
    setFinanceSearchTerm,
    financeCategoryFilter,
    setFinanceCategoryFilter,
    financeSubTab,
    setFinanceSubTab,
    scrapGlasses = [],
    handleOpenPrintModal,
    handleOpenFinanceModal,
    handleRejectClaim,
    handleApproveClaim,
    handleDrilldownOpex,
    handleDeleteFinanceTransaction,
    handleOpenSketchLightbox = () => {},
}) {
    const [assetCategoryTab, setAssetCategoryTab] = useState('all'); // 'all' | 'glass' | 'accessories' | 'tools' | 'supplies'
    const [assetSearchTerm, setAssetSearchTerm] = useState('');
    const [ledgerItemFilter, setLedgerItemFilter] = useState('semua');
    const [opexCategoryFilter, setOpexCategoryFilter] = useState('semua');
    const [opexSearchTerm, setOpexSearchTerm] = useState('');

    // State Panel Aktif di Bawah 5 Kartu Utama ('pnl' | 'omzet' | 'modal' | 'opex_card' | 'net_profit' | 'piutang')
    const [activePnlCardPanel, setActivePnlCardPanel] = useState('pnl');
    const [monthlyRecapModalView, setMonthlyRecapModalView] = useState('list');
    const [selectedMonthlyRecap, setSelectedMonthlyRecap] = useState(null);
    const [selectedOmzetDetailOrder, setSelectedOmzetDetailOrder] = useState(null);
    const [omzetSearchTerm, setOmzetSearchTerm] = useState('');
    const [piutangSearchTerm, setPiutangSearchTerm] = useState('');

    // Filter Rentang Bulan Omzet (Range: Dari Bulan X s/d Bulan Y)
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // 1 - 12
    const [omzetStartMonth, setOmzetStartMonth] = useState(1); // Default Bulan 1
    const [omzetEndMonth, setOmzetEndMonth] = useState(12); // Default Bulan 12
    const [omzetYearFilter, setOmzetYearFilter] = useState(String(currentYear)); // 'semua' | '2026'..
    const [omzetViewMode, setOmzetViewMode] = useState('detail'); // 'detail' | 'rekap_12_bulan'

    // Filter Rentang Bulan Beban Operasional (OPEX)
    const [opexStartMonth, setOpexStartMonth] = useState(1);
    const [opexEndMonth, setOpexEndMonth] = useState(12);
    const [opexYearFilter, setOpexYearFilter] = useState(String(currentYear));

    // Filter Rentang Bulan Piutang (Berdasarkan Bulan Order)
    const [piutangStartMonth, setPiutangStartMonth] = useState(1);
    const [piutangEndMonth, setPiutangEndMonth] = useState(12);
    const [piutangYearFilter, setPiutangYearFilter] = useState(String(currentYear));

    const MONTH_OPTIONS = [
        { num: 1, name: 'Januari', short: 'Jan' },
        { num: 2, name: 'Februari', short: 'Feb' },
        { num: 3, name: 'Maret', short: 'Mar' },
        { num: 4, name: 'April', short: 'Apr' },
        { num: 5, name: 'Mei', short: 'Mei' },
        { num: 6, name: 'Juni', short: 'Jun' },
        { num: 7, name: 'Juli', short: 'Jul' },
        { num: 8, name: 'Agustus', short: 'Agu' },
        { num: 9, name: 'September', short: 'Sep' },
        { num: 10, name: 'Oktober', short: 'Okt' },
        { num: 11, name: 'November', short: 'Nov' },
        { num: 12, name: 'Desember', short: 'Des' },
    ];

    const minM = Math.min(Number(omzetStartMonth) || 1, Number(omzetEndMonth) || 12);
    const maxM = Math.max(Number(omzetStartMonth) || 1, Number(omzetEndMonth) || 12);

    const handleStartMonthChange = (val) => {
        const s = parseInt(val, 10);
        setOmzetStartMonth(s);
        if (s > omzetEndMonth) {
            setOmzetEndMonth(s);
        }
    };

    const handleEndMonthChange = (val) => {
        const e = parseInt(val, 10);
        setOmzetEndMonth(e);
        if (e < omzetStartMonth) {
            setOmzetStartMonth(e);
        }
    };

    const handleSetOmzetRangePreset = (startM, endM) => {
        setOmzetStartMonth(startM);
        setOmzetEndMonth(endM);
        setOmzetViewMode('detail');
    };

    // Handlers Rentang Bulan OPEX
    const opexMinM = Math.min(Number(opexStartMonth) || 1, Number(opexEndMonth) || 12);
    const opexMaxM = Math.max(Number(opexStartMonth) || 1, Number(opexEndMonth) || 12);

    const handleOpexStartMonthChange = (val) => {
        const s = parseInt(val, 10);
        setOpexStartMonth(s);
        if (s > opexEndMonth) setOpexEndMonth(s);
    };

    const handleOpexEndMonthChange = (val) => {
        const e = parseInt(val, 10);
        setOpexEndMonth(e);
        if (e < opexStartMonth) setOpexStartMonth(e);
    };

    // Handlers Rentang Bulan Piutang
    const piutangMinM = Math.min(Number(piutangStartMonth) || 1, Number(piutangEndMonth) || 12);
    const piutangMaxM = Math.max(Number(piutangStartMonth) || 1, Number(piutangEndMonth) || 12);

    const handlePiutangStartMonthChange = (val) => {
        const s = parseInt(val, 10);
        setPiutangStartMonth(s);
        if (s > piutangEndMonth) setPiutangEndMonth(s);
    };

    const handlePiutangEndMonthChange = (val) => {
        const e = parseInt(val, 10);
        setPiutangEndMonth(e);
        if (e < piutangStartMonth) setPiutangStartMonth(e);
    };

    // Daftar orderan yang sudah Selesai (Masuk Riwayat & Omzet) beserta kalkulasi Biaya Modal & Keuntungan per Orderan
    const completedOrdersList = (ordersList || []).filter(o => o && o.status === 'selesai');

    const calculateOrderProfitBreakdown = (ord) => {
        const totalRevenueOrd = Number(ord.total_price || 0);
        if (ord.is_company_use || totalRevenueOrd <= 0) {
            return { revenue: 0, modalCost: 0, processFee: 0, profit: 0, marginPct: '0.0' };
        }

        const items = Array.isArray(ord.items) && ord.items.length > 0
            ? ord.items
            : [{
                glass_type: ord.glass_type || 'Kaca Polos 5mm',
                length_cm: ord.length_cm || 100,
                width_cm: ord.width_cm || 100,
                qty: ord.qty || 1,
                base_glass_price: ord.subtotal || totalRevenueOrd,
            }];

        let estimatedGlassModalCost = 0;
        let totalProcessFee = 0;

        items.forEach(it => {
            const qty = Math.max(1, Number(it.qty || 1));
            const areaM2 = ((Number(it.length_cm || 0) * Number(it.width_cm || 0)) / 10000) * qty;
            const gName = String(it.glass_type || '').toLowerCase();
            const matchedSheet = (sheetGlasses || []).find(g =>
                g && g.name && (g.name.toLowerCase() === gName || gName.includes(g.name.toLowerCase()) || g.name.toLowerCase().includes(gName))
            );

            if (matchedSheet && Number(matchedSheet.buy_price) > 0) {
                const sheetAreaM2 = Math.max(1, ((Number(matchedSheet.length_cm || 244) * Number(matchedSheet.width_cm || 183)) / 10000));
                const modalPerM2 = Number(matchedSheet.buy_price) / sheetAreaM2;
                estimatedGlassModalCost += Math.round(areaM2 * modalPerM2);
            } else {
                const baseSell = Number(it.base_glass_price || 0);
                estimatedGlassModalCost += baseSell > 0 ? Math.round(baseSell * 0.55) : Math.round(totalRevenueOrd * 0.45);
            }

            totalProcessFee +=
                Number(it.fee_gm || 0) +
                Number(it.fee_ht || 0) +
                Number(it.fee_bv || 0) +
                Number(it.fee_bor || 0) +
                Number(it.fee_etsa || 0);
        });

        let estimatedAccModalCost = 0;
        if (Array.isArray(ord.accessories)) {
            ord.accessories.forEach(acc => {
                if (typeof acc === 'object' && acc !== null) {
                    const aQty = Math.max(1, Number(acc.qty || 1));
                    const matchedAcc = (accessoriesList || []).find(a => a && (a.id === acc.id || a.name === acc.name));
                    const buyP = matchedAcc && Number(matchedAcc.buy_price) > 0
                        ? Number(matchedAcc.buy_price)
                        : Math.round(Number(acc.price || 0) * 0.65);
                    estimatedAccModalCost += buyP * aQty;
                }
            });
        }

        const totalModalOrder = Math.min(Math.round(totalRevenueOrd * 0.85), estimatedGlassModalCost + estimatedAccModalCost);
        const orderProfit = Math.max(0, totalRevenueOrd - totalModalOrder);
        const marginPct = totalRevenueOrd > 0 ? ((orderProfit / totalRevenueOrd) * 100).toFixed(1) : '0.0';

        return {
            revenue: totalRevenueOrd,
            modalCost: totalModalOrder,
            processFee: totalProcessFee,
            profit: orderProfit,
            marginPct,
        };
    };

    const completedOrdersWithProfit = useMemo(() => {
        return completedOrdersList.map(o => {
            const rawDate = o.delivered_at || o.order_date || o.created_at || '';
            const datePart = String(rawDate).split('T')[0].split(' ')[0];
            const parts = datePart ? datePart.split('-') : [];
            const orderYear = parts.length >= 1 ? parseInt(parts[0], 10) : null;
            const orderMonth = parts.length >= 2 ? parseInt(parts[1], 10) : null;

            return {
                ...o,
                orderYear,
                orderMonth,
                orderDateFormatted: datePart,
                profitInfo: calculateOrderProfitBreakdown(o),
            };
        });
    }, [completedOrdersList, sheetGlasses, accessoriesList]);

    const totalCompletedOrdersProfit = useMemo(() => {
        return completedOrdersWithProfit.reduce((s, o) => s + (o.profitInfo?.profit || 0), 0);
    }, [completedOrdersWithProfit]);

    const availableOmzetYears = useMemo(() => {
        const yearsSet = new Set([currentYear]);
        completedOrdersWithProfit.forEach(o => {
            if (o.orderYear) yearsSet.add(o.orderYear);
        });
        return Array.from(yearsSet).sort((a, b) => b - a);
    }, [completedOrdersWithProfit, currentYear]);

    // Rekapitulasi Omzet 12 Bulan (Bulan 1 sampai Bulan 12)
    const monthlyOmzetBreakdown12 = useMemo(() => {
        const targetYear = omzetYearFilter === 'semua' ? null : parseInt(omzetYearFilter, 10);

        return MONTH_OPTIONS.map(m => {
            const matchingOrders = completedOrdersWithProfit.filter(o => {
                if (o.orderMonth !== m.num) return false;
                if (targetYear !== null && o.orderYear !== targetYear) return false;
                return true;
            });

            const totalRevMonth = matchingOrders.reduce((s, o) => s + (o.profitInfo?.revenue || 0), 0);
            const totalModalMonth = matchingOrders.reduce((s, o) => s + (o.profitInfo?.modalCost || 0), 0);
            const totalProfitMonth = matchingOrders.reduce((s, o) => s + (o.profitInfo?.profit || 0), 0);
            const marginPctMonth = totalRevMonth > 0 ? ((totalProfitMonth / totalRevMonth) * 100).toFixed(1) : '0.0';

            return {
                monthNum: m.num,
                monthName: m.name,
                monthShort: m.short,
                ordersCount: matchingOrders.length,
                totalRevenue: totalRevMonth,
                totalModal: totalModalMonth,
                totalProfit: totalProfitMonth,
                marginPct: marginPctMonth,
                orders: matchingOrders,
            };
        });
    }, [completedOrdersWithProfit, omzetYearFilter]);

    const filteredOmzetOrders = useMemo(() => {
        return completedOrdersWithProfit.filter(o => {
            // Filter Tahun
            if (omzetYearFilter !== 'semua') {
                const targetYear = parseInt(omzetYearFilter, 10);
                if (o.orderYear !== targetYear) return false;
            }

            // Filter Range Bulan (minM s/d maxM)
            if (o.orderMonth !== null && o.orderMonth !== undefined) {
                if (o.orderMonth < minM || o.orderMonth > maxM) return false;
            }

            // Filter Search
            if (omzetSearchTerm) {
                const q = omzetSearchTerm.toLowerCase();
                return (
                    String(o.spo_number || '').toLowerCase().includes(q) ||
                    String(o.customer_name || '').toLowerCase().includes(q) ||
                    String(o.glass_type || '').toLowerCase().includes(q)
                );
            }

            return true;
        });
    }, [completedOrdersWithProfit, minM, maxM, omzetYearFilter, omzetSearchTerm]);

    const filteredOmzetTotalRev = useMemo(() => {
        return filteredOmzetOrders.reduce((s, o) => s + (o.profitInfo?.revenue || 0), 0);
    }, [filteredOmzetOrders]);

    const filteredOmzetTotalProfit = useMemo(() => {
        return filteredOmzetOrders.reduce((s, o) => s + (o.profitInfo?.profit || 0), 0);
    }, [filteredOmzetOrders]);

    const filteredOmzetTotalModal = useMemo(() => {
        return filteredOmzetOrders.reduce((s, o) => s + (o.profitInfo?.modalCost || 0), 0);
    }, [filteredOmzetOrders]);

    const filteredOmzetMarginPct = filteredOmzetTotalRev > 0
        ? ((filteredOmzetTotalProfit / filteredOmzetTotalRev) * 100).toFixed(1)
        : '0.0';

    // Daftar orderan yang belum lunas (Piutang)
    const unpaidOrdersList = useMemo(() => {
        return (ordersList || []).filter(o =>
            o &&
            o.status !== 'draft' &&
            o.payment_status !== 'Lunas' &&
            (Number(o.total_price || 0) - Number(o.paid_amount || 0)) > 0
        ).map(o => {
            const rawDate = o.order_date || o.created_at || '';
            const datePart = String(rawDate).split('T')[0].split(' ')[0];
            const parts = datePart ? datePart.split('-') : [];
            const ordYear = parts.length >= 1 ? parseInt(parts[0], 10) : null;
            const ordMonth = parts.length >= 2 ? parseInt(parts[1], 10) : null;
            return {
                ...o,
                ordYear,
                ordMonth,
                orderDateFormatted: datePart,
            };
        });
    }, [ordersList]);

    const availablePiutangYears = useMemo(() => {
        const yearsSet = new Set([currentYear]);
        unpaidOrdersList.forEach(o => {
            if (o.ordYear) yearsSet.add(o.ordYear);
        });
        return Array.from(yearsSet).sort((a, b) => b - a);
    }, [unpaidOrdersList, currentYear]);

    const filteredUnpaidOrders = useMemo(() => {
        return unpaidOrdersList.filter(o => {
            // Filter Tahun
            if (piutangYearFilter !== 'semua' && o.ordYear !== null) {
                if (o.ordYear !== parseInt(piutangYearFilter, 10)) return false;
            }

            // Filter Rentang Bulan
            if (o.ordMonth !== null) {
                if (o.ordMonth < piutangMinM || o.ordMonth > piutangMaxM) return false;
            }

            // Filter Pencarian
            if (!piutangSearchTerm) return true;
            const q = piutangSearchTerm.toLowerCase();
            return (
                String(o.spo_number || '').toLowerCase().includes(q) ||
                String(o.customer_name || '').toLowerCase().includes(q) ||
                String(o.customer_phone || '').toLowerCase().includes(q) ||
                String(o.customer_address || '').toLowerCase().includes(q)
            );
        });
    }, [unpaidOrdersList, piutangYearFilter, piutangMinM, piutangMaxM, piutangSearchTerm]);

    const filteredUnpaidTotalPiutang = useMemo(() => {
        return filteredUnpaidOrders.reduce((sum, o) => {
            const total = Number(o.total_price || 0);
            const paid = Number(o.paid_amount || 0);
            return sum + Math.max(0, total - paid);
        }, 0);
    }, [filteredUnpaidOrders]);

    if (userRole !== 'owner' && userRole !== 'finance' && userRole !== 'admin_finance') {
        return null;
    }

    // Jika ada rekap bulanan yang sudah disimpan di DB dan user belum memilih manual, gunakan rekap bulanan terbaru pada kartu Laba Bersih
    const latestSavedRecapTrx = (financeTransactionsList || [])
        .filter(t => t && t.type === 'rekap_bulanan')
        .sort((a, b) => String(b.category || '').localeCompare(String(a.category || '')))[0];

    let activeRecapData = selectedMonthlyRecap;
    if (!activeRecapData && latestSavedRecapTrx) {
        try {
            const parsed = latestSavedRecapTrx.notes ? JSON.parse(latestSavedRecapTrx.notes) : null;
            if (parsed && parsed.period) {
                activeRecapData = {
                    period: parsed.period,
                    periodLabel: formatPeriodLabel(parsed.period),
                    revenue: Number(parsed.revenue || 0),
                    cogs: Number(parsed.cogs || 0),
                    opex: Number(parsed.opex || 0),
                    totalExpense: Number(parsed.totalExpense || 0),
                    netProfit: Number(parsed.netProfit || 0),
                };
            }
        } catch {
            activeRecapData = null;
        }
    }

    const totalRev = Number(metrics.totalRevenue || 0);
    const paidRev = Number(metrics.paidRevenue || 0);
    const pendingCodVal = Number(metrics.pendingCOD || 0);

    const approvedTransactions = financeTransactionsList.filter(t => t.approval_status === 'approved');

    const bahanKacaSum = approvedTransactions.filter(t => t.type === 'pembelian_bahan').reduce((a, b) => a + Number(b.amount || 0), 0);
    const aksesorisSum = approvedTransactions.filter(t => t.type === 'pembelian_aksesoris').reduce((a, b) => a + Number(b.amount || 0), 0);
    const alatSum = approvedTransactions.filter(t => t.type === 'pembelian_alat').reduce((a, b) => a + Number(b.amount || 0), 0);
    const listrikSum = approvedTransactions.filter(t => t.category === 'Listrik & Energi Pabrik').reduce((a, b) => a + Number(b.amount || 0), 0);
    const bbmSum = approvedTransactions.filter(t => t.category === 'BBM & Logistik Armada' || t.category === 'BBM Armada').reduce((a, b) => a + Number(b.amount || 0), 0);
    const gajiSum = approvedTransactions.filter(t => t.category === 'Gaji & Upah Lembur').reduce((a, b) => a + Number(b.amount || 0), 0);
    const servisSum = approvedTransactions.filter(t => t.category === 'Perawatan Mesin').reduce((a, b) => a + Number(b.amount || 0), 0);
    const kantorSum = approvedTransactions.filter(t => t.category === 'Operasional Kantor' || t.category === 'Biaya Sewa & Pajak').reduce((a, b) => a + Number(b.amount || 0), 0);
    const otherOpexSum = approvedTransactions.filter(t => t.type === 'biaya_operasional' && !['Listrik & Energi Pabrik', 'BBM & Logistik Armada', 'BBM Armada', 'Gaji & Upah Lembur', 'Perawatan Mesin', 'Operasional Kantor', 'Biaya Sewa & Pajak'].includes(t.category)).reduce((a, b) => a + Number(b.amount || 0), 0);

    const totalCogs = approvedTransactions.filter(t => t.type === 'pembelian_bahan' || t.type === 'pembelian_aksesoris').reduce((a, b) => a + Number(b.amount || 0), 0);
    const totalOpex = approvedTransactions.filter(t => t.type === 'biaya_operasional' || t.type === 'pembelian_alat').reduce((a, b) => a + Number(b.amount || 0), 0);
    const grandTotalExpenses = totalCogs + totalOpex;
    const grossProfitVal = totalRev - totalCogs;
    const netProfitVal = totalRev - grandTotalExpenses;
    const isProfitable = netProfitVal >= 0;
    const grossMarginPct = totalRev > 0 ? ((grossProfitVal / totalRev) * 100).toFixed(1) : '0.0';
    const netMarginPct = totalRev > 0 ? ((netProfitVal / totalRev) * 100).toFixed(1) : '0.0';
    const opexPosCount = [listrikSum, bbmSum, gajiSum, servisSum, alatSum, kantorSum, otherOpexSum].filter(s => s > 0).length;

    // Filter transaksi untuk tab Buku Kas & Riwayat Mutasi Terpadu
    const filteredTransactions = financeTransactionsList.filter(t => {
        if (t?.type === 'rekap_bulanan') return false;
        const cleanNotesStr = String(t.notes || '').replace(/\[RESTOCK_[^\]]+\]\s*/g, '');
        const matchSearch = !financeSearchTerm ||
            t.title?.toLowerCase().includes(financeSearchTerm.toLowerCase()) ||
            t.transaction_code?.toLowerCase().includes(financeSearchTerm.toLowerCase()) ||
            t.supplier_name?.toLowerCase().includes(financeSearchTerm.toLowerCase()) ||
            t.invoice_number?.toLowerCase().includes(financeSearchTerm.toLowerCase()) ||
            cleanNotesStr.toLowerCase().includes(financeSearchTerm.toLowerCase());

        const matchCategory =
            financeCategoryFilter === 'semua' ||
            t.type === financeCategoryFilter ||
            t.category === financeCategoryFilter;

        let matchSpecificItem = true;
        if (ledgerItemFilter && ledgerItemFilter !== 'semua') {
            const targetItemLower = ledgerItemFilter.toLowerCase();
            const fullText = `${t.title || ''} ${t.notes || ''} ${t.category || ''}`.toLowerCase();
            matchSpecificItem = fullText.includes(targetItemLower);
        }

        return matchSearch && matchCategory && matchSpecificItem;
    });

    const filteredLedgerTotal = filteredTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);

    // Filter transaksi khusus untuk tab Biaya Operasional (OPEX)
    const opexTransactionsAll = useMemo(() => {
        return (financeTransactionsList || []).filter(t => t.type === 'biaya_operasional').map(t => {
            const rawDate = t.transaction_date || t.created_at || '';
            const datePart = String(rawDate).split('T')[0].split(' ')[0];
            const parts = datePart ? datePart.split('-') : [];
            const trxYear = parts.length >= 1 ? parseInt(parts[0], 10) : null;
            const trxMonth = parts.length >= 2 ? parseInt(parts[1], 10) : null;
            return {
                ...t,
                trxYear,
                trxMonth,
                trxDateFormatted: datePart,
            };
        });
    }, [financeTransactionsList]);

    const availableOpexYears = useMemo(() => {
        const yearsSet = new Set([currentYear]);
        opexTransactionsAll.forEach(t => {
            if (t.trxYear) yearsSet.add(t.trxYear);
        });
        return Array.from(yearsSet).sort((a, b) => b - a);
    }, [opexTransactionsAll, currentYear]);

    const filteredOpexTransactions = useMemo(() => {
        return opexTransactionsAll.filter(t => {
            // Filter Tahun
            if (opexYearFilter !== 'semua' && t.trxYear !== null) {
                if (t.trxYear !== parseInt(opexYearFilter, 10)) return false;
            }

            // Filter Rentang Bulan
            if (t.trxMonth !== null) {
                if (t.trxMonth < opexMinM || t.trxMonth > opexMaxM) return false;
            }

            const cleanNotesStr = String(t.notes || '').replace(/\[RESTOCK_[^\]]+\]\s*/g, '');
            const matchSearch = !opexSearchTerm ||
                t.title?.toLowerCase().includes(opexSearchTerm.toLowerCase()) ||
                t.transaction_code?.toLowerCase().includes(opexSearchTerm.toLowerCase()) ||
                t.supplier_name?.toLowerCase().includes(opexSearchTerm.toLowerCase()) ||
                t.category?.toLowerCase().includes(opexSearchTerm.toLowerCase()) ||
                cleanNotesStr.toLowerCase().includes(opexSearchTerm.toLowerCase());

            let matchCat = true;
            if (opexCategoryFilter !== 'semua') {
                if (opexCategoryFilter === 'BBM & Logistik Armada') {
                    matchCat = t.category === 'BBM & Logistik Armada' || t.category === 'BBM Armada';
                } else if (opexCategoryFilter === 'Servis & Kantor') {
                    matchCat = t.category === 'Perawatan Mesin' || t.category === 'Operasional Kantor' || t.category === 'Biaya Sewa & Pajak';
                } else {
                    matchCat = t.category === opexCategoryFilter;
                }
            }

            return matchSearch && matchCat;
        });
    }, [opexTransactionsAll, opexYearFilter, opexMinM, opexMaxM, opexSearchTerm, opexCategoryFilter]);

    const filteredOpexTotal = useMemo(() => {
        return filteredOpexTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
    }, [filteredOpexTransactions]);

    // Daftar pilihan spesifik barang A / B berdasarkan kategori yang sedang dipilih di Buku Kas
    const getSpecificItemOptions = () => {
        if (financeCategoryFilter === 'pembelian_bahan') {
            return (sheetGlasses || []).map(g => ({
                value: g.name,
                label: `[${g.item_code}] ${g.name} (${g.size || `${g.length_cm}x${g.width_cm}cm`})`
            }));
        }
        if (financeCategoryFilter === 'pembelian_aksesoris') {
            return (accessoriesList || []).map(a => ({
                value: a.name,
                label: `[${a.acc_code}] ${a.name}`
            }));
        }
        if (financeCategoryFilter === 'pembelian_alat') {
            const toolOpts = (toolsList || []).map(t => ({
                value: t.name,
                label: `[Alat: ${t.tool_code}] ${t.name}`
            }));
            const supOpts = (warehouseSuppliesList || []).map(s => ({
                value: s.name,
                label: `[Gudang: ${s.item_code}] ${s.name}`
            }));
            return [...toolOpts, ...supOpts];
        }
        if (financeCategoryFilter === 'biaya_operasional') {
            return [
                { value: 'Listrik & Energi Pabrik', label: 'Pos: Listrik & Energi Pabrik' },
                { value: 'BBM & Logistik Armada', label: 'Pos: BBM Solar & Tol Armada' },
                { value: 'Gaji & Upah Lembur', label: 'Pos: Gaji Pokok & Upah Lembur' },
                { value: 'Perawatan Mesin', label: 'Pos: Servis & Perawatan Mesin' },
                { value: 'Operasional Kantor', label: 'Pos: Operasional Kantor & ATK' },
            ];
        }
        // Jika 'semua', gabungkan semua barang dari kaca, aksesoris, alat, dan gudang
        return [
            ...(sheetGlasses || []).map(g => ({ value: g.name, label: `[Bahan Kaca] ${g.name}` })),
            ...(accessoriesList || []).map(a => ({ value: a.name, label: `[Aksesoris] ${a.name}` })),
            ...(toolsList || []).map(t => ({ value: t.name, label: `[Alat Kerja] ${t.name}` })),
            ...(warehouseSuppliesList || []).map(s => ({ value: s.name, label: `[Peralatan Gudang] ${s.name}` })),
        ];
    };

    const specificItemOptions = getSpecificItemOptions();

    const pendingClaims = financeTransactionsList.filter(t => t.approval_status === 'pending');

    // Gabungkan seluruh pengajuan restok dari:
    // 1. Transaksi Finance berstatus pending (PO-BB, PO-ACC, PO-ALT)
    // 2. Kaca Lembaran berstatus 'Pengajuan Proses Restock' yang belum memiliki PO pending
    // 3. Aksesoris berstatus 'Pengajuan Restock' yang belum memiliki PO pending
    // 4. Pengajuan Perlengkapan/Sparepart (SupplyRestock) yang belum Selesai Restok dan belum memiliki PO pending
    const pendingRestockTrx = pendingClaims.filter(clm =>
        clm.type === 'pembelian_bahan' ||
        clm.type === 'pembelian_aksesoris' ||
        clm.type === 'pembelian_alat' ||
        String(clm.notes || '').includes('[RESTOCK_') ||
        String(clm.title || '').toLowerCase().includes('restok') ||
        String(clm.title || '').toLowerCase().includes('pengajuan')
    );

    const glassRequestsWithoutTrx = (sheetGlasses || []).filter(g =>
        g.status === 'Pengajuan Proses Restock' &&
        !pendingRestockTrx.some(t => String(t.notes || '').includes(`[RESTOCK_GLASS_ID:${g.id}|`) || String(t.title || '').toLowerCase().includes(String(g.name || '').toLowerCase()))
    );

    const accRequestsWithoutTrx = (accessoriesList || []).filter(a =>
        a.status === 'Pengajuan Restock' &&
        !pendingRestockTrx.some(t => String(t.notes || '').includes(`[RESTOCK_ACC_ID:${a.id}|`) || String(t.title || '').toLowerCase().includes(String(a.name || '').toLowerCase()))
    );

    const supplyRequestsWithoutTrx = (supplyRestockRequests || []).filter(r =>
        r.status !== 'Selesai Restok' &&
        r.status !== 'Ditolak Finance' &&
        !pendingRestockTrx.some(t => String(t.notes || '').includes(`|REQ_ID:${r.id}|`) || String(t.title || '').toLowerCase().includes(String(r.item_name || '').toLowerCase()))
    );

    const totalRestockQueueCount =
        pendingRestockTrx.length +
        glassRequestsWithoutTrx.length +
        accRequestsWithoutTrx.length +
        supplyRequestsWithoutTrx.length;

    // Kalkulasi Valuasi Harga Seluruh Aset yang Tersedia (Kaca, Aksesoris, Alat, Peralatan Gudang)
    const getToolUnitPrice = (tool) => {
        if (Number(tool.buy_price) > 0) return Number(tool.buy_price);
        if (Number(tool.estimated_price) > 0) return Number(tool.estimated_price);
        const cat = String(tool.category || '').toLowerCase();
        if (cat.includes('mesin utama')) return 15000000;
        if (cat.includes('bor') || cat.includes('potong')) return 1250000;
        if (cat.includes('vakum')) return 450000;
        if (cat.includes('mata bor')) return 185000;
        if (cat.includes('lapangan')) return 650000;
        return 250000;
    };

    const getSupplyUnitPrice = (sup) => {
        if (Number(sup.buy_price) > 0) return Number(sup.buy_price);
        if (Number(sup.estimated_price) > 0) return Number(sup.estimated_price);
        const cat = String(sup.category || '').toLowerCase();
        if (cat.includes('kimia') || cat.includes('oli') || cat.includes('pelumas')) return 85000;
        if (cat.includes('apd') || cat.includes('keselamatan')) return 35000;
        if (cat.includes('packaging')) return 25000;
        return 45000;
    };

    const totalGlassAssetValue = (sheetGlasses || []).reduce(
        (sum, g) => sum + ((Number(g.qty) || 0) * (Number(g.buy_price) || 0)),
        0
    );
    const totalAccAssetValue = (accessoriesList || []).reduce(
        (sum, a) => sum + ((Number(a.qty) || 0) * (Number(a.buy_price) || 0)),
        0
    );
    const totalToolsAssetValue = (toolsList || []).reduce(
        (sum, t) => sum + ((Number(t.total_qty) || 0) * getToolUnitPrice(t)),
        0
    );
    const totalSuppliesAssetValue = (warehouseSuppliesList || []).reduce(
        (sum, s) => sum + ((Number(s.qty ?? s.stock_qty) || 0) * getSupplyUnitPrice(s)),
        0
    );
    const totalScrapAssetValue = Number(metrics.scrapGlassLoss || (scrapGlasses.length * 125000));
    const netCashBalance = Math.max(0, paidRev - grandTotalExpenses);
    const totalPhysicalInventoryValue =
        totalGlassAssetValue +
        totalAccAssetValue +
        totalToolsAssetValue +
        totalSuppliesAssetValue +
        totalScrapAssetValue;
    const grandTotalCompanyAssets =
        totalPhysicalInventoryValue +
        netCashBalance +
        pendingCodVal;
    const grandTotalAssetsValue = totalPhysicalInventoryValue;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* HEADER EXECUTIVE FINANCE */}
            <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-200 pb-4">
                <div>
                    <div className="flex items-center gap-2.5">
                        <Briefcase className="w-6 h-6 text-[#1b68b0]" />
                        <h2 className="text-2xl font-black text-[#242222]">
                            Executive Finance & Laba/Rugi (P&L)
                        </h2>
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-mono font-bold px-3 py-0.5 rounded-full">
                            CV Cahya Karunia Jaya
                        </span>
                    </div>
                    <p className="text-slate-500 text-xs mt-1">
                        Laporan Laba Rugi Komprehensif (P&L), Pengadaan Bahan Baku Kaca, Pengeluaran Biaya Operasional Pabrik, & Buku Kas Mutasi Usaha
                    </p>
                </div>

                {/* QUICK ACTION BUTTONS */}
                <div className="flex flex-wrap items-center gap-2.5">
                    <button
                        type="button"
                        onClick={() => {
                            setMonthlyRecapModalView('form');
                            setActivePnlCardPanel('net_profit');
                        }}
                        className="px-4 py-2 bg-[#1b68b0] hover:bg-[#15528c] text-white font-bold rounded-xl text-xs flex items-center gap-2 transition cursor-pointer shadow-xs"
                        title="Rekap Omzet Bulan Ini, Pengeluaran Bulan Ini & Keuntungan Bersih Bulan Ini"
                    >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Rekap Laba Bersih Bulan Ini</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleOpenPrintModal('all')}
                        className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 text-xs flex items-center gap-2 transition cursor-pointer shadow-xs"
                    >
                        <Printer className="w-3.5 h-3.5 text-slate-500" />
                        <span>Cetak Semua Laporan</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleOpenFinanceModal('pembelian_bahan')}
                        className="px-4 py-2 bg-[#70b03c] hover:bg-[#5f9733] text-white font-bold rounded-xl text-xs flex items-center gap-2 transition cursor-pointer shadow-xs"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Catat Transaksi Finansial</span>
                    </button>
                </div>
            </div>

            {/* 4 TOP EXECUTIVE METRIC CARDS (KLIK SALAH SATU KOTAK UNTUK MENGGANTI KONTEN DI BAWAHNYA) */}
            {financeSubTab === 'pnl' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* CARD 1: OMSET PENJUALAN */}
                <div
                    onClick={() => {
                        setActivePnlCardPanel(prev => prev === 'omzet' ? 'pnl' : 'omzet');
                    }}
                    title="Klik untuk melihat riwayat orderan selesai yang masuk ke Omzet beserta keuntungan tiap orderan di bawah kartu ini"
                    className={`bg-white border-2 rounded-2xl p-5 shadow-xs relative overflow-hidden group hover:shadow-md transition cursor-pointer ${
                        activePnlCardPanel === 'omzet'
                            ? 'border-[#1b68b0] ring-2 ring-[#1b68b0]/20 bg-blue-50/20'
                            : 'border-slate-200 hover:border-blue-300'
                    }`}
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-xs text-slate-500 font-bold block">
                                {minM === 1 && maxM === 12 && omzetYearFilter === 'semua'
                                    ? (activeRecapData ? `Omzet (${activeRecapData.periodLabel})` : 'Total Omzet Penjualan')
                                    : minM === maxM
                                        ? `Omzet Bulan ${MONTH_OPTIONS[minM - 1]?.name || minM} ${omzetYearFilter !== 'semua' ? omzetYearFilter : ''}`
                                        : `Omzet (Bulan ${minM} - ${maxM} ${omzetYearFilter !== 'semua' ? omzetYearFilter : ''})`}
                            </span>
                            <span className="text-[10px] text-[#1b68b0] font-bold underline">
                                Klik: Riwayat & Laba per Order
                            </span>
                        </div>
                        <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1b68b0] shrink-0">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-[#1b68b0] font-mono mt-1.5">
                        Rp {(minM === 1 && maxM === 12 && omzetYearFilter === 'semua' && activeRecapData ? activeRecapData.revenue : filteredOmzetTotalRev).toLocaleString('id-ID')}
                    </h3>
                    <div className="text-[11px] text-slate-500 font-mono mt-2 flex items-center justify-between border-t border-slate-100 pt-2 flex-wrap gap-1">
                        <div className="flex items-center gap-1">
                            <span className="text-[#1b68b0] font-bold">
                                {filteredOmzetOrders.length} SPO Selesai
                            </span>
                        </div>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded border border-emerald-200" title="Total Keuntungan orderan selesai">
                            Laba Order: Rp {filteredOmzetTotalProfit.toLocaleString('id-ID')}
                        </span>
                    </div>
                </div>

                {/* CARD 2: BEBAN OPERASIONAL (OPEX) */}
                <div
                    onClick={() => {
                        setActivePnlCardPanel(prev => prev === 'opex_card' ? 'pnl' : 'opex_card');
                    }}
                    title="Klik untuk melihat rincian pengeluaran Beban Operasional (OPEX) di bawah kartu ini"
                    className={`bg-white border-2 rounded-2xl p-5 shadow-xs relative overflow-hidden group hover:shadow-md transition cursor-pointer ${
                        activePnlCardPanel === 'opex_card'
                            ? 'border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/20'
                            : 'border-slate-200 hover:border-purple-300'
                    }`}
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-xs text-slate-500 font-bold block">
                                {opexMinM === 1 && opexMaxM === 12 && opexYearFilter === 'semua'
                                    ? (activeRecapData ? `Beban OPEX (${activeRecapData.periodLabel})` : 'Beban Operasional (OPEX)')
                                    : opexMinM === opexMaxM
                                        ? `OPEX Bulan ${MONTH_OPTIONS[opexMinM - 1]?.name || opexMinM} ${opexYearFilter !== 'semua' ? opexYearFilter : ''}`
                                        : `OPEX (Bulan ${opexMinM} - ${opexMaxM} ${opexYearFilter !== 'semua' ? opexYearFilter : ''})`}
                            </span>
                            <span className="text-[10px] text-purple-700 font-bold underline">
                                Klik: Rincian Biaya OPEX
                            </span>
                        </div>
                        <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
                            <Zap className="w-4 h-4" />
                        </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-purple-600 font-mono mt-1.5">
                        Rp {(activeRecapData && opexMinM === 1 && opexMaxM === 12 && opexYearFilter === 'semua' ? activeRecapData.opex : filteredOpexTotal).toLocaleString('id-ID')}
                    </h3>
                    <div className="text-[11px] text-slate-500 font-mono mt-2 flex items-center justify-between border-t border-slate-100 pt-2 flex-wrap gap-1">
                        <span className="font-bold text-purple-800">{filteredOpexTransactions.length} Transaksi Terpilih</span>
                        <span className="text-slate-500">{opexPosCount} Pos Beban</span>
                    </div>
                </div>

                {/* CARD 4: LABA / RUGI BERSIH */}
                {(() => {
                    const displayedNetVal = activeRecapData ? activeRecapData.netProfit : netProfitVal;
                    const displayedRevVal = activeRecapData ? activeRecapData.revenue : totalRev;
                    const displayedProfitable = displayedNetVal >= 0;
                    const displayedMarginPct = displayedRevVal > 0 ? ((displayedNetVal / displayedRevVal) * 100).toFixed(1) : '0.0';

                    return (
                        <div
                            onClick={() => {
                                if (activePnlCardPanel === 'net_profit' && monthlyRecapModalView === 'list') {
                                    setActivePnlCardPanel('pnl');
                                } else {
                                    setMonthlyRecapModalView('list');
                                    setActivePnlCardPanel('net_profit');
                                }
                            }}
                            title="Klik untuk menampilkan daftar Laba Bersih setiap bulan beserta rincian detailnya di bawah kartu ini"
                            className={`bg-white border-2 rounded-2xl p-5 shadow-xs relative overflow-hidden group transition cursor-pointer hover:shadow-md ${
                                activePnlCardPanel === 'net_profit'
                                    ? 'border-[#1b68b0] ring-2 ring-[#1b68b0]/20 bg-blue-50/20'
                                    : displayedProfitable ? 'border-emerald-300 hover:border-emerald-500' : 'border-rose-300 hover:border-rose-500'
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className={`text-xs font-bold block ${displayedProfitable ? 'text-emerald-700' : 'text-rose-700'}`}>
                                        {activeRecapData
                                            ? `Laba Bersih (${activeRecapData.periodLabel})`
                                            : (displayedProfitable ? 'Laba Bersih Usaha (Net)' : 'Defisit / Rugi Bersih (Net)')}
                                    </span>
                                    <span className="text-[10px] text-[#1b68b0] font-bold underline">
                                        Klik: Daftar Rekap per Bulan
                                    </span>
                                </div>
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                    displayedProfitable ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
                                }`}>
                                    {displayedProfitable ? <Award className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                                </div>
                            </div>
                            <h3 className={`text-xl sm:text-2xl font-black font-mono mt-1.5 ${displayedProfitable ? 'text-emerald-600' : 'text-rose-600'}`}>
                                Rp {Number(displayedNetVal).toLocaleString('id-ID')}
                            </h3>
                            <div className="text-[11px] font-mono mt-2 flex items-center justify-between border-t border-slate-100 pt-2 text-slate-500">
                                <span>{activeRecapData ? 'Hasil Rekap:' : (displayedProfitable ? 'Net Margin:' : 'Rasio Defisit:')}</span>
                                <span className={`font-bold px-1.5 py-0.5 rounded ${
                                    displayedProfitable ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}>
                                    {displayedMarginPct}% {displayedProfitable ? 'NET' : 'DEFISIT'}
                                </span>
                            </div>
                        </div>
                    );
                })()}

                {/* CARD 4: PIUTANG */}
                <div
                    onClick={() => {
                        setActivePnlCardPanel(prev => prev === 'piutang' ? 'pnl' : 'piutang');
                    }}
                    title="Klik untuk melihat daftar orderan siapa saja yang belum lunas di bawah kartu ini"
                    className={`bg-white border-2 rounded-2xl p-5 shadow-xs relative overflow-hidden group hover:shadow-md transition cursor-pointer ${
                        activePnlCardPanel === 'piutang'
                            ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20'
                            : 'border-slate-200 hover:border-rose-300'
                    }`}
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-xs text-rose-700 font-bold block">
                                {piutangMinM === 1 && piutangMaxM === 12 && piutangYearFilter === 'semua'
                                    ? 'Total Piutang'
                                    : piutangMinM === piutangMaxM
                                        ? `Piutang Bulan ${MONTH_OPTIONS[piutangMinM - 1]?.name || piutangMinM} ${piutangYearFilter !== 'semua' ? piutangYearFilter : ''}`
                                        : `Piutang (Bulan ${piutangMinM} - ${piutangMaxM} ${piutangYearFilter !== 'semua' ? piutangYearFilter : ''})`}
                            </span>
                            <span className="text-[10px] text-[#1b68b0] font-bold underline">
                                Klik: {filteredUnpaidOrders.length} Order Belum Lunas
                            </span>
                        </div>
                        <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                            <CreditCard className="w-4 h-4" />
                        </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-rose-600 font-mono mt-1.5">
                        Rp {filteredUnpaidTotalPiutang.toLocaleString('id-ID')}
                    </h3>
                    <div className="text-[11px] text-slate-500 font-mono mt-2 flex items-center justify-between border-t border-slate-100 pt-2 flex-wrap gap-1">
                        <span>Kas Terkumpul:</span>
                        <span className="text-emerald-600 font-bold">Rp {paidRev.toLocaleString('id-ID')}</span>
                    </div>
                </div>
            </div>
            )}

            {/* PANEL 1: DAFTAR OMZET & KEUNTUNGAN PER ORDERAN SELESAI (MUNCUL SAAT KOTAK 1 DIKLIK) */}
            {financeSubTab === 'pnl' && activePnlCardPanel === 'omzet' && (
                <div className="bg-white border-2 border-[#1b68b0] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 animate-in fade-in duration-150 text-xs">
                    {/* HEADER PANEL OMZET */}
                    <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-200 pb-3.5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1b68b0] shrink-0">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-black text-[#242222] text-base">
                                    Riwayat Orderan Selesai (Masuk Omzet) & Rincian Keuntungan per Order
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Pilih periode omzet dari Bulan 1 s/d Bulan 12 untuk memantau performa penjualan dan kalkulasi keuntungan order secara real-time
                                </p>
                            </div>
                        </div>

                        {/* TOGGLE VIEW MODE & TOMBOL TUTUP */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setOmzetViewMode('detail')}
                                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition flex items-center gap-1.5 cursor-pointer ${
                                        omzetViewMode === 'detail'
                                            ? 'bg-white text-[#1b68b0] shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>Rincian Order ({filteredOmzetOrders.length})</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setOmzetViewMode('rekap_12_bulan')}
                                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition flex items-center gap-1.5 cursor-pointer ${
                                        omzetViewMode === 'rekap_12_bulan'
                                            ? 'bg-white text-[#1b68b0] shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    <BarChart3 className="w-3.5 h-3.5" />
                                    <span>Rekap Omzet 12 Bulan</span>
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => setActivePnlCardPanel('pnl')}
                                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1"
                                title="Tutup panel riwayat omzet"
                            >
                                <X className="w-4 h-4" />
                                <span>Tutup</span>
                            </button>
                        </div>
                    </div>

                    {/* BARIS KONTROL RANGE BULAN OMZET (SIMPEL, BERSIH & INTUITIF) */}
                    <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            {/* RANGE SELECTOR: DARI BULAN X S/D BULAN Y */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4 text-[#1b68b0]" />
                                    <span>Rentang Bulan Omzet:</span>
                                </span>

                                {/* DARI BULAN */}
                                <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
                                    <span className="text-[11px] text-slate-500 font-semibold">Dari:</span>
                                    <select
                                        value={omzetStartMonth}
                                        onChange={(e) => handleStartMonthChange(e.target.value)}
                                        className="font-bold text-slate-800 text-xs bg-transparent border-none focus:outline-none cursor-pointer"
                                    >
                                        {MONTH_OPTIONS.map((m) => (
                                            <option key={m.num} value={m.num}>
                                                Bulan {m.num} ({m.name})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <span className="text-slate-400 font-bold text-xs">s/d</span>

                                {/* SAMPAI BULAN */}
                                <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
                                    <span className="text-[11px] text-slate-500 font-semibold">Sampai:</span>
                                    <select
                                        value={omzetEndMonth}
                                        onChange={(e) => handleEndMonthChange(e.target.value)}
                                        className="font-bold text-slate-800 text-xs bg-transparent border-none focus:outline-none cursor-pointer"
                                    >
                                        {MONTH_OPTIONS.map((m) => (
                                            <option key={m.num} value={m.num}>
                                                Bulan {m.num} ({m.name})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* PILIH TAHUN */}
                                <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
                                    <span className="text-[11px] text-slate-500 font-semibold">Tahun:</span>
                                    <select
                                        value={omzetYearFilter}
                                        onChange={(e) => setOmzetYearFilter(e.target.value)}
                                        className="font-bold text-slate-800 text-xs bg-transparent border-none focus:outline-none cursor-pointer"
                                    >
                                        <option value="semua">Semua Tahun</option>
                                        {availableOmzetYears.map((yr) => (
                                            <option key={yr} value={String(yr)}>
                                                {yr}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* PENCARIAN ORDER */}
                            <div className="relative w-full sm:w-60">
                                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={omzetSearchTerm}
                                    onChange={(e) => setOmzetSearchTerm(e.target.value)}
                                    placeholder="Cari SPO, pelanggan, jenis kaca..."
                                    className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:border-[#1b68b0] focus:ring-1 focus:ring-[#1b68b0]/15 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* METRIC BADGE BAR HASIL FILTER RENTANG BULAN */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-blue-50/50 p-3.5 rounded-2xl border border-blue-100">
                        <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase block">Rentang Periode:</span>
                            <span className="font-extrabold text-[#1b68b0] text-xs">
                                {minM === 1 && maxM === 12
                                    ? `Semua Bulan 1 - 12 (${omzetYearFilter !== 'semua' ? 'Tahun ' + omzetYearFilter : 'Sepanjang Waktu'})`
                                    : minM === maxM
                                        ? `Bulan ${minM} (${MONTH_OPTIONS[minM - 1]?.name || minM} ${omzetYearFilter !== 'semua' ? omzetYearFilter : ''})`
                                        : `Bulan ${minM} (${MONTH_OPTIONS[minM - 1]?.short || minM}) s/d Bulan ${maxM} (${MONTH_OPTIONS[maxM - 1]?.short || maxM}) ${omzetYearFilter !== 'semua' ? 'Tahun ' + omzetYearFilter : ''}`}
                            </span>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase block">Nilai Omzet Periode Ini:</span>
                            <span className="font-black text-slate-900 text-sm font-mono">
                                Rp {filteredOmzetTotalRev.toLocaleString('id-ID')}
                            </span>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Keuntungan Order:</span>
                            <span className="font-black text-emerald-700 text-sm font-mono">
                                + Rp {filteredOmzetTotalProfit.toLocaleString('id-ID')}
                            </span>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase block">Rasio Margin / Order:</span>
                            <span className="font-black text-slate-900 text-xs font-mono flex items-center gap-1.5">
                                <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-[10px]">
                                    {filteredOmzetMarginPct}% NET
                                </span>
                                <span className="text-slate-500 font-normal">({filteredOmzetOrders.length} SPO)</span>
                            </span>
                        </div>
                    </div>

                    {/* MODE 1: TABEL DETAIL RINCIAN ORDER SPO */}
                    {omzetViewMode === 'detail' && (
                        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-slate-50 text-slate-500 font-mono font-bold uppercase border-b border-slate-200 text-[11px]">
                                    <tr>
                                        <th className="py-3 px-4">No. SPO</th>
                                        <th className="py-3 px-4">Tgl Selesai</th>
                                        <th className="py-3 px-4">Bulan</th>
                                        <th className="py-3 px-4">Pelanggan</th>
                                        <th className="py-3 px-4">Rincian Kaca & Proses</th>
                                        <th className="py-3 px-4 text-right">Nilai Omzet Order (Rp)</th>
                                        <th className="py-3 px-4 text-right">Estimasi Modal Bahan (Rp)</th>
                                        <th className="py-3 px-4 text-right">Keuntungan Orderan Ini (Rp)</th>
                                        <th className="py-3 px-4 text-center">Margin (%)</th>
                                        <th className="py-3 px-4 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-mono">
                                    {filteredOmzetOrders.map((ord) => {
                                        const pInfo = ord.profitInfo || { revenue: 0, modalCost: 0, profit: 0, marginPct: '0.0' };
                                        const itemsSummary = Array.isArray(ord.items) && ord.items.length > 0
                                            ? ord.items.map(it => `${it.glass_type} (${it.length_cm}x${it.width_cm}cm × ${it.qty || 1}${it.position_code ? ` [Kode: ${it.position_code}]` : ''})`).join(', ')
                                            : `${ord.glass_type || '-'} (${ord.length_cm || 0}x${ord.width_cm || 0}cm)`;

                                        const monthName = ord.orderMonth ? (MONTH_OPTIONS.find(m => m.num === ord.orderMonth)?.name || `Bln ${ord.orderMonth}`) : '-';

                                        return (
                                            <tr
                                                key={ord.id}
                                                onClick={() => setSelectedOmzetDetailOrder(ord)}
                                                className="hover:bg-blue-50/50 transition cursor-pointer group"
                                                title="Klik untuk melihat rincian detail order & omzet"
                                            >
                                                <td className="py-3 px-4 font-black text-[#1b68b0]">
                                                    <div className="group-hover:underline">{ord.spo_number}</div>
                                                    <span className="text-[10px] font-sans font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                                                        Selesai (Riwayat)
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                                                    {ord.orderDateFormatted || '-'}
                                                </td>
                                                <td className="py-3 px-4 whitespace-nowrap font-sans">
                                                    <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-lg text-[10px] border border-slate-200">
                                                        Bln {ord.orderMonth || '-'}: {monthName}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 font-sans">
                                                    <div className="font-bold text-[#242222]">{ord.customer_name}</div>
                                                    <div className="text-[10px] text-slate-500 font-mono">{ord.payment_status}</div>
                                                </td>
                                                <td className="py-3 px-4 font-sans text-slate-700 max-w-xs">
                                                    <div className="line-clamp-2 font-semibold">{itemsSummary}</div>
                                                </td>
                                                <td className="py-3 px-4 text-right font-bold text-[#1b68b0]">
                                                    Rp {pInfo.revenue.toLocaleString('id-ID')}
                                                </td>
                                                <td className="py-3 px-4 text-right font-bold text-amber-700">
                                                    Rp {pInfo.modalCost.toLocaleString('id-ID')}
                                                </td>
                                                <td className="py-3 px-4 text-right font-black text-emerald-700 text-sm">
                                                    + Rp {pInfo.profit.toLocaleString('id-ID')}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                                        {pInfo.marginPct}%
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedOmzetDetailOrder(ord);
                                                        }}
                                                        className="px-2.5 py-1 bg-blue-50 hover:bg-[#1b68b0] text-[#1b68b0] hover:text-white border border-blue-200 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1 mx-auto shadow-2xs"
                                                        title="Buka rincian lengkap orderan & kalkulasi laba"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        <span>Detail</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {filteredOmzetOrders.length === 0 && (
                                        <tr>
                                            <td colSpan={10} className="text-center py-10 text-slate-500 font-sans space-y-2">
                                                <div className="font-bold text-slate-700">
                                                    Tidak ada orderan selesai pada {minM === 1 && maxM === 12 ? 'periode ini' : minM === maxM ? `Bulan ${minM} (${MONTH_OPTIONS[minM - 1]?.name || minM})` : `Rentang Bulan ${minM} s/d Bulan ${maxM}`}.
                                                </div>
                                                <p className="text-xs text-slate-400">
                                                    Coba sesuaikan rentang bulan atau klik tombol di bawah untuk melihat seluruh bulan.
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => handleSetOmzetRangePreset(1, 12)}
                                                    className="px-3.5 py-1.5 bg-[#1b68b0] hover:bg-[#15528c] text-white font-bold rounded-xl text-xs transition cursor-pointer"
                                                >
                                                    Tampilkan 1 Tahun Penuh (Bulan 1 - 12)
                                                </button>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                {filteredOmzetOrders.length > 0 && (
                                    <tfoot className="bg-slate-50 font-mono font-black border-t-2 border-slate-200 text-slate-800">
                                        <tr>
                                            <td colSpan={5} className="py-3 px-4 font-bold text-slate-700 uppercase">
                                                Total Omzet Terpilih ({filteredOmzetOrders.length} SPO):
                                            </td>
                                            <td className="py-3 px-4 text-right text-[#1b68b0] font-black text-sm">
                                                Rp {filteredOmzetTotalRev.toLocaleString('id-ID')}
                                            </td>
                                            <td className="py-3 px-4 text-right text-amber-700 font-bold">
                                                Rp {filteredOmzetTotalModal.toLocaleString('id-ID')}
                                            </td>
                                            <td className="py-3 px-4 text-right text-emerald-700 font-black text-sm">
                                                + Rp {filteredOmzetTotalProfit.toLocaleString('id-ID')}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px]">
                                                    {filteredOmzetMarginPct}%
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center text-slate-400 font-normal">
                                                -
                                            </td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    )}

                    {/* MODE 2: TABEL RINGKASAN REKAPITULASI OMZET 12 BULAN (KOMPARASI LENGKAP BULAN 1 - 12) */}
                    {omzetViewMode === 'rekap_12_bulan' && (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs px-1 flex-wrap gap-2">
                                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                                    <BarChart3 className="w-4 h-4 text-[#1b68b0]" />
                                    <span>Tabel Rekapitulasi Omzet 12 Bulan (Tahun {omzetYearFilter !== 'semua' ? omzetYearFilter : 'Semua Tahun'})</span>
                                </span>
                                <span className="text-slate-500 font-mono text-[11px]">
                                    Klik tombol "Lihat Order" pada bulan manapun untuk membuka rincian SPO bulan tersebut
                                </span>
                            </div>

                            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-mono font-bold uppercase border-b border-slate-200 text-[11px]">
                                        <tr>
                                            <th className="py-3 px-4 text-center">Bulan</th>
                                            <th className="py-3 px-4">Nama Bulan</th>
                                            <th className="py-3 px-4 text-center">Order Selesai</th>
                                            <th className="py-3 px-4 text-right">Nilai Omzet (Rp)</th>
                                            <th className="py-3 px-4 text-right">Estimasi Modal (Rp)</th>
                                            <th className="py-3 px-4 text-right">Keuntungan Order (Rp)</th>
                                            <th className="py-3 px-4 text-center">Margin (%)</th>
                                            <th className="py-3 px-4 text-center">Aksi / Rincian</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-mono">
                                        {monthlyOmzetBreakdown12.map((item) => {
                                            const isCurrentSelected = item.monthNum >= minM && item.monthNum <= maxM;

                                            return (
                                                <tr
                                                    key={item.monthNum}
                                                    className={`transition ${
                                                        isCurrentSelected ? 'bg-blue-50/70 font-bold border-l-4 border-l-[#1b68b0]' : item.ordersCount > 0 ? 'hover:bg-slate-50' : 'opacity-65 hover:opacity-100'
                                                    }`}
                                                >
                                                    <td className="py-3 px-4 text-center">
                                                        <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold mx-auto text-xs ${
                                                            isCurrentSelected
                                                                ? 'bg-[#1b68b0] text-white'
                                                                : item.ordersCount > 0
                                                                    ? 'bg-blue-50 text-[#1b68b0] border border-blue-200'
                                                                    : 'bg-slate-100 text-slate-400'
                                                        }`}>
                                                            {item.monthNum}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 font-sans font-bold text-slate-800">
                                                        <div>Bulan {item.monthNum} — {item.monthName}</div>
                                                        <span className="text-[10px] text-slate-400 font-normal">
                                                            {omzetYearFilter !== 'semua' ? `Tahun ${omzetYearFilter}` : ''}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-center font-bold">
                                                        {item.ordersCount > 0 ? (
                                                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-xl text-xs">
                                                                {item.ordersCount} SPO
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400 font-normal">-</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-extrabold text-[#1b68b0]">
                                                        {item.totalRevenue > 0 ? `Rp ${item.totalRevenue.toLocaleString('id-ID')}` : '-'}
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-bold text-amber-700">
                                                        {item.totalModal > 0 ? `Rp ${item.totalModal.toLocaleString('id-ID')}` : '-'}
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-black text-emerald-700">
                                                        {item.totalProfit > 0 ? `+ Rp ${item.totalProfit.toLocaleString('id-ID')}` : '-'}
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        {item.totalRevenue > 0 ? (
                                                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                                                {item.marginPct}%
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        {item.ordersCount > 0 ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleSetOmzetRangePreset(item.monthNum, item.monthNum)}
                                                                className="px-2.5 py-1 bg-white hover:bg-[#1b68b0] text-[#1b68b0] hover:text-white border border-[#1b68b0] rounded-xl font-bold text-[11px] transition cursor-pointer flex items-center gap-1 mx-auto"
                                                            >
                                                                <span>Lihat Order</span>
                                                                <ArrowRight className="w-3 h-3" />
                                                            </button>
                                                        ) : (
                                                            <span className="text-slate-400 text-[11px] italic">Nihil</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot className="bg-slate-50 font-mono font-black border-t-2 border-slate-200 text-slate-900">
                                        <tr>
                                            <td colSpan={2} className="py-3.5 px-4 font-bold text-slate-800 uppercase">
                                                Total Akumulasi 12 Bulan:
                                            </td>
                                            <td className="py-3.5 px-4 text-center text-slate-900 font-black">
                                                {monthlyOmzetBreakdown12.reduce((s, m) => s + m.ordersCount, 0)} SPO
                                            </td>
                                            <td className="py-3.5 px-4 text-right text-[#1b68b0] font-black text-sm">
                                                Rp {monthlyOmzetBreakdown12.reduce((s, m) => s + m.totalRevenue, 0).toLocaleString('id-ID')}
                                            </td>
                                            <td className="py-3.5 px-4 text-right text-amber-700 font-bold">
                                                Rp {monthlyOmzetBreakdown12.reduce((s, m) => s + m.totalModal, 0).toLocaleString('id-ID')}
                                            </td>
                                            <td className="py-3.5 px-4 text-right text-emerald-700 font-black text-sm">
                                                + Rp {monthlyOmzetBreakdown12.reduce((s, m) => s + m.totalProfit, 0).toLocaleString('id-ID')}
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                {(() => {
                                                    const totRev = monthlyOmzetBreakdown12.reduce((s, m) => s + m.totalRevenue, 0);
                                                    const totProf = monthlyOmzetBreakdown12.reduce((s, m) => s + m.totalProfit, 0);
                                                    const totMarg = totRev > 0 ? ((totProf / totRev) * 100).toFixed(1) : '0.0';
                                                    return (
                                                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px]">
                                                            {totMarg}%
                                                        </span>
                                                    );
                                                })()}
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleSetOmzetRangePreset(1, 12)}
                                                    className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[10px] font-bold transition cursor-pointer"
                                                >
                                                    Semua Order (1 - 12)
                                                </button>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* PANEL 2: RINCIAN BEBAN OPERASIONAL (OPEX) — MUNCUL SAAT KOTAK OPEX DIKLIK */}
            {financeSubTab === 'pnl' && activePnlCardPanel === 'opex_card' && (
                <div className="bg-white border-2 border-purple-400 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 animate-in fade-in duration-150 text-xs">
                    {/* HEADER PANEL OPEX */}
                    <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-200 pb-3.5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
                                <Zap className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-black text-[#242222] text-base">
                                    Rincian Pengeluaran Beban Operasional (OPEX) ({filteredOpexTransactions.length} Transaksi)
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Pilih rentang bulan OPEX untuk memfilter pengeluaran listrik, BBM armada, gaji karyawan, servis mesin, dan operasional kantor
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setActivePnlCardPanel('pnl')}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1"
                            title="Tutup panel OPEX"
                        >
                            <X className="w-4 h-4" />
                            <span>Tutup</span>
                        </button>
                    </div>

                    {/* BARIS KONTROL RANGE BULAN OPEX (SIMPEL & BERSIH) */}
                    <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4 text-purple-600" />
                                    <span>Rentang Bulan OPEX:</span>
                                </span>

                                {/* DARI BULAN */}
                                <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
                                    <span className="text-[11px] text-slate-500 font-semibold">Dari:</span>
                                    <select
                                        value={opexStartMonth}
                                        onChange={(e) => handleOpexStartMonthChange(e.target.value)}
                                        className="font-bold text-slate-800 text-xs bg-transparent border-none focus:outline-none cursor-pointer"
                                    >
                                        {MONTH_OPTIONS.map((m) => (
                                            <option key={m.num} value={m.num}>
                                                Bulan {m.num} ({m.name})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <span className="text-slate-400 font-bold text-xs">s/d</span>

                                {/* SAMPAI BULAN */}
                                <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
                                    <span className="text-[11px] text-slate-500 font-semibold">Sampai:</span>
                                    <select
                                        value={opexEndMonth}
                                        onChange={(e) => handleOpexEndMonthChange(e.target.value)}
                                        className="font-bold text-slate-800 text-xs bg-transparent border-none focus:outline-none cursor-pointer"
                                    >
                                        {MONTH_OPTIONS.map((m) => (
                                            <option key={m.num} value={m.num}>
                                                Bulan {m.num} ({m.name})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* PILIH TAHUN */}
                                <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
                                    <span className="text-[11px] text-slate-500 font-semibold">Tahun:</span>
                                    <select
                                        value={opexYearFilter}
                                        onChange={(e) => setOpexYearFilter(e.target.value)}
                                        className="font-bold text-slate-800 text-xs bg-transparent border-none focus:outline-none cursor-pointer"
                                    >
                                        <option value="semua">Semua Tahun</option>
                                        {availableOpexYears.map((yr) => (
                                            <option key={yr} value={String(yr)}>
                                                {yr}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* PILIH KATEGORI OPEX */}
                                <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
                                    <span className="text-[11px] text-slate-500 font-semibold">Kategori:</span>
                                    <select
                                        value={opexCategoryFilter}
                                        onChange={(e) => setOpexCategoryFilter(e.target.value)}
                                        className="font-bold text-slate-800 text-xs bg-transparent border-none focus:outline-none cursor-pointer"
                                    >
                                        <option value="semua">Semua Kategori</option>
                                        <option value="Listrik & Energi Pabrik">Listrik & Energi Pabrik</option>
                                        <option value="BBM & Logistik Armada">BBM Solar & Logistik Armada</option>
                                        <option value="Gaji & Upah Lembur">Gaji Pokok & Upah Lembur</option>
                                        <option value="Perawatan Mesin">Perawatan Mesin</option>
                                        <option value="Operasional Kantor">Operasional Kantor & ATK</option>
                                    </select>
                                </div>
                            </div>

                            {/* PENCARIAN BIAYA OPEX */}
                            <div className="relative w-full sm:w-60">
                                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={opexSearchTerm}
                                    onChange={(e) => setOpexSearchTerm(e.target.value)}
                                    placeholder="Cari biaya, kode, vendor..."
                                    className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:border-[#1b68b0] focus:ring-1 focus:ring-[#1b68b0]/15 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* METRIC BADGE BAR HASIL FILTER OPEX */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-purple-50/50 p-3.5 rounded-2xl border border-purple-100">
                        <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase block">Rentang Periode:</span>
                            <span className="font-extrabold text-purple-700 text-xs">
                                {opexMinM === 1 && opexMaxM === 12
                                    ? `Semua Bulan 1 - 12 (${opexYearFilter !== 'semua' ? 'Tahun ' + opexYearFilter : 'Sepanjang Waktu'})`
                                    : opexMinM === opexMaxM
                                        ? `Bulan ${opexMinM} (${MONTH_OPTIONS[opexMinM - 1]?.name || opexMinM} ${opexYearFilter !== 'semua' ? opexYearFilter : ''})`
                                        : `Bulan ${opexMinM} (${MONTH_OPTIONS[opexMinM - 1]?.short || opexMinM}) s/d Bulan ${opexMaxM} (${MONTH_OPTIONS[opexMaxM - 1]?.short || opexMaxM}) ${opexYearFilter !== 'semua' ? 'Tahun ' + opexYearFilter : ''}`}
                            </span>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Beban OPEX Terpilih:</span>
                            <span className="font-black text-purple-800 text-sm font-mono">
                                Rp {filteredOpexTotal.toLocaleString('id-ID')}
                            </span>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase block">Jumlah Transaksi:</span>
                            <span className="font-black text-slate-800 text-sm font-mono">
                                {filteredOpexTransactions.length} Transaksi
                            </span>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase block">Kategori Filter:</span>
                            <span className="font-bold text-purple-700 text-xs">
                                {opexCategoryFilter === 'semua' ? 'Semua Pos Biaya' : opexCategoryFilter}
                            </span>
                        </div>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-slate-50 text-slate-500 font-mono font-bold uppercase border-b border-slate-200 text-[11px]">
                                <tr>
                                    <th className="py-3 px-4">No. Bukti</th>
                                    <th className="py-3 px-4">Tanggal</th>
                                    <th className="py-3 px-4">Bulan</th>
                                    <th className="py-3 px-4">Kategori Beban</th>
                                    <th className="py-3 px-4">Deskripsi Biaya Operasional</th>
                                    <th className="py-3 px-4">Penerima / Vendor</th>
                                    <th className="py-3 px-4 text-right">Nominal OPEX (Rp)</th>
                                    <th className="py-3 px-4 text-center">Bukti Nota</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-mono">
                                {filteredOpexTransactions.map((trx) => {
                                    const mName = trx.trxMonth ? (MONTH_OPTIONS.find(m => m.num === trx.trxMonth)?.name || `Bln ${trx.trxMonth}`) : '-';
                                    return (
                                        <tr key={trx.id} className="hover:bg-slate-50 transition">
                                            <td className="py-3 px-4 font-bold text-purple-700">{trx.transaction_code}</td>
                                            <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{trx.transaction_date}</td>
                                            <td className="py-3 px-4 whitespace-nowrap font-sans">
                                                <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-lg text-[10px] border border-slate-200">
                                                    Bln {trx.trxMonth || '-'}: {mName}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 font-sans">
                                                <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded text-[10px] font-bold">
                                                    {trx.category}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 font-sans font-semibold text-[#242222]">
                                                <div>{trx.title}</div>
                                                {trx.notes && (
                                                    <div className="text-[11px] text-slate-500 font-normal mt-0.5">{trx.notes}</div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 font-sans text-slate-600">{trx.supplier_name || '-'}</td>
                                            <td className="py-3 px-4 text-right font-black text-rose-600 text-sm">
                                                Rp {Number(trx.amount || 0).toLocaleString('id-ID')}
                                            </td>
                                            <td className="py-3 px-4 text-center font-sans">
                                                {trx.receipt_photo_path ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenSketchLightbox(trx.receipt_photo_path, `Nota OPEX: ${trx.title}`, {
                                                            type: 'payment',
                                                            badge: 'Nota Biaya Operasional',
                                                            subtitle: `${trx.transaction_code} • ${trx.category} • Rp ${Number(trx.amount || 0).toLocaleString('id-ID')}`,
                                                            description: trx.notes || trx.title,
                                                        })}
                                                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#1b68b0] border border-blue-200 font-bold rounded-lg text-[10px] inline-flex items-center gap-1 transition cursor-pointer"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        <span>Nota</span>
                                                    </button>
                                                ) : (
                                                    <span className="text-[10px] text-slate-400">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredOpexTransactions.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="text-center py-8 text-slate-500 font-sans space-y-1">
                                            <div className="font-bold text-slate-700">
                                                Tidak ada transaksi Beban Operasional pada rentang periode yang dipilih.
                                            </div>
                                            <p className="text-xs text-slate-400">
                                                Coba ubah rentang bulan atau ganti kategori biaya OPEX.
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            {filteredOpexTransactions.length > 0 && (
                                <tfoot className="bg-slate-50 font-mono font-black border-t-2 border-slate-200 text-slate-900">
                                    <tr>
                                        <td colSpan={6} className="py-3.5 px-4 font-bold text-slate-800 uppercase">
                                            Total Pengeluaran OPEX Terpilih ({filteredOpexTransactions.length} Transaksi):
                                        </td>
                                        <td className="py-3.5 px-4 text-right text-rose-600 font-black text-sm">
                                            Rp {filteredOpexTotal.toLocaleString('id-ID')}
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>
            )}

            {/* PANEL 4: REKAP LABA BERSIH PER BULAN (MUNCUL SAAT KOTAK 4 DIKLIK) */}
            {financeSubTab === 'pnl' && activePnlCardPanel === 'net_profit' && (
                <MonthlyNetProfitRecapModal
                    isOpen={true}
                    onClose={() => setActivePnlCardPanel('pnl')}
                    ordersList={ordersList}
                    financeTransactionsList={financeTransactionsList}
                    sheetGlasses={sheetGlasses}
                    accessoriesList={accessoriesList}
                    initialViewMode={monthlyRecapModalView}
                    activeRecapPeriod={activeRecapData?.period || null}
                    onSelectRecapPeriod={(recObj) => setSelectedMonthlyRecap(recObj)}
                    inline={true}
                />
            )}

            {/* SUB-TAB KHUSUS: KEUNTUNGAN LABA BERSIH PER BULAN */}
            {financeSubTab === 'monthly_profit' && (
                <MonthlyNetProfitRecapModal
                    isOpen={true}
                    onClose={() => setFinanceSubTab && setFinanceSubTab('pnl')}
                    ordersList={ordersList}
                    financeTransactionsList={financeTransactionsList}
                    sheetGlasses={sheetGlasses}
                    accessoriesList={accessoriesList}
                    initialViewMode="list"
                    activeRecapPeriod={activeRecapData?.period || null}
                    onSelectRecapPeriod={(recObj) => setSelectedMonthlyRecap(recObj)}
                    inline={true}
                    hideCloseButton={true}
                    titleOverride="Laporan Keuntungan & Laba Bersih Perusahaan Per Bulan"
                />
            )}

            {/* PANEL 5: DAFTAR PIUTANG (MUNCUL SAAT KOTAK PIUTANG DIKLIK) */}
            {financeSubTab === 'pnl' && activePnlCardPanel === 'piutang' && (
                <div className="bg-white border-2 border-rose-300 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 animate-in fade-in duration-150 text-xs">
                    {/* HEADER PANEL PIUTANG */}
                    <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-200 pb-3.5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-black text-[#242222] text-base">
                                    Daftar Piutang — Orderan Pelanggan yang Belum Lunas ({filteredUnpaidOrders.length} Order)
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Pilih rentang bulan order untuk memantau sisa tagihan piutang dan pembayaran DP yang belum lunas
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setActivePnlCardPanel('pnl')}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1"
                            title="Tutup panel piutang"
                        >
                            <X className="w-4 h-4" />
                            <span>Tutup</span>
                        </button>
                    </div>

                    {/* BARIS KONTROL RANGE BULAN PIUTANG (SIMPEL & BERSIH) */}
                    <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4 text-rose-600" />
                                    <span>Rentang Bulan Order:</span>
                                </span>

                                {/* DARI BULAN */}
                                <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
                                    <span className="text-[11px] text-slate-500 font-semibold">Dari:</span>
                                    <select
                                        value={piutangStartMonth}
                                        onChange={(e) => handlePiutangStartMonthChange(e.target.value)}
                                        className="font-bold text-slate-800 text-xs bg-transparent border-none focus:outline-none cursor-pointer"
                                    >
                                        {MONTH_OPTIONS.map((m) => (
                                            <option key={m.num} value={m.num}>
                                                Bulan {m.num} ({m.name})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <span className="text-slate-400 font-bold text-xs">s/d</span>

                                {/* SAMPAI BULAN */}
                                <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
                                    <span className="text-[11px] text-slate-500 font-semibold">Sampai:</span>
                                    <select
                                        value={piutangEndMonth}
                                        onChange={(e) => handlePiutangEndMonthChange(e.target.value)}
                                        className="font-bold text-slate-800 text-xs bg-transparent border-none focus:outline-none cursor-pointer"
                                    >
                                        {MONTH_OPTIONS.map((m) => (
                                            <option key={m.num} value={m.num}>
                                                Bulan {m.num} ({m.name})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* PILIH TAHUN */}
                                <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
                                    <span className="text-[11px] text-slate-500 font-semibold">Tahun:</span>
                                    <select
                                        value={piutangYearFilter}
                                        onChange={(e) => setPiutangYearFilter(e.target.value)}
                                        className="font-bold text-slate-800 text-xs bg-transparent border-none focus:outline-none cursor-pointer"
                                    >
                                        <option value="semua">Semua Tahun</option>
                                        {availablePiutangYears.map((yr) => (
                                            <option key={yr} value={String(yr)}>
                                                {yr}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* PENCARIAN ORDER PIUTANG */}
                            <div className="relative w-full sm:w-60">
                                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={piutangSearchTerm}
                                    onChange={(e) => setPiutangSearchTerm(e.target.value)}
                                    placeholder="Cari SPO, nama pelanggan, no. HP..."
                                    className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:border-[#1b68b0] focus:ring-1 focus:ring-[#1b68b0]/15 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* METRIC BADGE BAR HASIL FILTER PIUTANG */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-rose-50/50 p-3.5 rounded-2xl border border-rose-100">
                        <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase block">Rentang Periode Order:</span>
                            <span className="font-extrabold text-rose-700 text-xs">
                                {piutangMinM === 1 && piutangMaxM === 12
                                    ? `Semua Bulan 1 - 12 (${piutangYearFilter !== 'semua' ? 'Tahun ' + piutangYearFilter : 'Sepanjang Waktu'})`
                                    : piutangMinM === piutangMaxM
                                        ? `Bulan ${piutangMinM} (${MONTH_OPTIONS[piutangMinM - 1]?.name || piutangMinM} ${piutangYearFilter !== 'semua' ? piutangYearFilter : ''})`
                                        : `Bulan ${piutangMinM} (${MONTH_OPTIONS[piutangMinM - 1]?.short || piutangMinM}) s/d Bulan ${piutangMaxM} (${MONTH_OPTIONS[piutangMaxM - 1]?.short || piutangMaxM}) ${piutangYearFilter !== 'semua' ? 'Tahun ' + piutangYearFilter : ''}`}
                            </span>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Piutang Belum Lunas:</span>
                            <span className="font-black text-rose-700 text-sm font-mono">
                                Rp {filteredUnpaidTotalPiutang.toLocaleString('id-ID')}
                            </span>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase block">Jumlah Order Belum Lunas:</span>
                            <span className="font-black text-slate-800 text-sm font-mono">
                                {filteredUnpaidOrders.length} SPO
                            </span>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase block">Status Piutang:</span>
                            <span className="font-bold text-amber-700 text-xs">
                                Menunggu Pelunasan / COD
                            </span>
                        </div>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-slate-50 text-slate-500 font-mono font-bold uppercase border-b border-slate-200 text-[11px]">
                                <tr>
                                    <th className="py-3 px-4">No. SPO</th>
                                    <th className="py-3 px-4">Tanggal Order</th>
                                    <th className="py-3 px-4">Bulan</th>
                                    <th className="py-3 px-4">Nama Pelanggan & Kontak</th>
                                    <th className="py-3 px-4">Rincian Pesanan Kaca</th>
                                    <th className="py-3 px-4 text-center">Status Bayar</th>
                                    <th className="py-3 px-4 text-right">Total Tagihan (Rp)</th>
                                    <th className="py-3 px-4 text-right">Sudah Dibayar / DP (Rp)</th>
                                    <th className="py-3 px-4 text-right">Sisa Piutang Belum Lunas (Rp)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-mono">
                                {filteredUnpaidOrders.map((ord) => {
                                    const totalTagihan = Number(ord.total_price || 0);
                                    const sudahBayar = Number(ord.paid_amount || 0);
                                    const sisaPiutang = Math.max(0, totalTagihan - sudahBayar);
                                    const itemsSummary = Array.isArray(ord.items) && ord.items.length > 0
                                        ? ord.items.map(it => `${it.glass_type} (${it.qty || 1}x)`).join(', ')
                                        : (ord.glass_type || '-');

                                    const mName = ord.ordMonth ? (MONTH_OPTIONS.find(m => m.num === ord.ordMonth)?.name || `Bln ${ord.ordMonth}`) : '-';

                                    return (
                                        <tr key={ord.id} className="hover:bg-slate-50 transition">
                                            <td className="py-3 px-4 font-black text-[#1b68b0]">
                                                <div>{ord.spo_number}</div>
                                                <span className="text-[10px] font-sans font-bold text-slate-500">
                                                    Status: {ord.status === 'pengiriman' ? 'Pengiriman' : ord.status === 'selesai' ? 'Terkirim' : 'Pengerjaan'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                                                {ord.orderDateFormatted || String(ord.order_date || '').split('T')[0]}
                                            </td>
                                            <td className="py-3 px-4 whitespace-nowrap font-sans">
                                                <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-lg text-[10px] border border-slate-200">
                                                    Bln {ord.ordMonth || '-'}: {mName}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 font-sans">
                                                <div className="font-bold text-[#242222]">{ord.customer_name}</div>
                                                <div className="text-[11px] text-slate-500 font-mono">{ord.customer_phone || '-'}</div>
                                                {ord.customer_address && (
                                                    <div className="text-[10px] text-slate-400 truncate max-w-[200px]" title={ord.customer_address}>
                                                        {ord.customer_address}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 font-sans text-slate-700 max-w-xs">
                                                <div className="line-clamp-2 font-semibold">{itemsSummary}</div>
                                            </td>
                                            <td className="py-3 px-4 text-center font-sans">
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                                    {ord.payment_status || 'Belum Lunas'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right font-bold text-slate-800">
                                                Rp {totalTagihan.toLocaleString('id-ID')}
                                            </td>
                                            <td className="py-3 px-4 text-right font-bold text-emerald-700">
                                                Rp {sudahBayar.toLocaleString('id-ID')}
                                            </td>
                                            <td className="py-3 px-4 text-right font-black text-rose-600 text-sm">
                                                Rp {sisaPiutang.toLocaleString('id-ID')}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredUnpaidOrders.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="text-center py-8 text-slate-500 font-sans space-y-1">
                                            <div className="font-bold text-slate-700">
                                                Tidak ada orderan piutang (belum lunas) pada rentang periode yang dipilih.
                                            </div>
                                            <p className="text-xs text-slate-400">
                                                Seluruh pesanan pada periode ini telah lunas atau coba sesuaikan rentang bulan.
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            {filteredUnpaidOrders.length > 0 && (
                                <tfoot className="bg-slate-50 font-mono font-black border-t-2 border-slate-200 text-slate-900">
                                    <tr>
                                        <td colSpan={6} className="py-3.5 px-4 font-bold text-slate-800 uppercase">
                                            Total Sisa Piutang Terpilih ({filteredUnpaidOrders.length} SPO):
                                        </td>
                                        <td className="py-3.5 px-4 text-right text-slate-800 font-bold">
                                            Rp {filteredUnpaidOrders.reduce((s, o) => s + Number(o.total_price || 0), 0).toLocaleString('id-ID')}
                                        </td>
                                        <td className="py-3.5 px-4 text-right text-emerald-700 font-bold">
                                            Rp {filteredUnpaidOrders.reduce((s, o) => s + Number(o.paid_amount || 0), 0).toLocaleString('id-ID')}
                                        </td>
                                        <td className="py-3.5 px-4 text-right text-rose-600 font-black text-sm">
                                            Rp {filteredUnpaidTotalPiutang.toLocaleString('id-ID')}
                                        </td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>
            )}

            {/* SUB-TAB TOTAL KESELURUHAN ASET PERUSAHAAN & RINCIAN DETAILNYA */}
            {financeSubTab === 'assets_valuation' && (
                <div className="space-y-5">
                    {/* BANNER UTAMA: REKAPITULASI TOTAL KESELURUHAN ASET PERUSAHAAN (LIKUID + FISIK INVENTARIS) */}
                    <div className="bg-white border-2 border-[#1b68b0]/30 rounded-2xl p-5 shadow-xs space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                            <div>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-[#1b68b0] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                                    Neraca Kekayaan & Valuasi Aset Perusahaan
                                </span>
                                <h3 className="text-lg sm:text-xl font-black text-[#242222] mt-2 flex items-center gap-2">
                                    <Boxes className="w-5 h-5 text-[#1b68b0]" />
                                    <span>Total Keseluruhan Aset Perusahaan (CV Cahya Karunia Jaya)</span>
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Akumulasi seluruh nilai kekayaan perusahaan yang terdiri dari Aset Kas Likuid, Piutang Usaha, Persediaan Bahan Baku Kaca, Aksesoris, Mesin/Alat Kerja, Peralatan Gudang, & Kaca Sisa Layak Pakai.
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleOpenPrintModal('assets_valuation')}
                                    className="px-4 py-2 bg-[#1b68b0] hover:bg-[#15528c] text-white font-bold rounded-xl text-xs flex items-center gap-2 transition cursor-pointer shadow-xs"
                                    title="Cetak Laporan Total Keseluruhan Aset Perusahaan & Rincian Valuasinya"
                                >
                                    <Printer className="w-4 h-4" />
                                    <span>Cetak Laporan Total Aset Perusahaan</span>
                                </button>
                                <div className="bg-blue-50/70 border border-[#1b68b0]/30 rounded-2xl px-5 py-3 text-right">
                                    <span className="text-[11px] font-bold text-slate-500 block">Grand Total Nilai Seluruh Aset Perusahaan</span>
                                    <div className="text-2xl sm:text-3xl font-black text-[#1b68b0] font-mono mt-0.5">
                                        Rp {Number(grandTotalCompanyAssets).toLocaleString('id-ID')}
                                    </div>
                                    <span className="text-[10px] font-mono text-emerald-700 font-bold">
                                        Aset Fisik Stok & Alat: Rp {Number(totalPhysicalInventoryValue).toLocaleString('id-ID')} • Kas & Piutang: Rp {Number(netCashBalance + pendingCodVal).toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* TABEL RINGKASAN KOMPOSISI 7 POS ASET PERUSAHAAN */}
                        <div className="overflow-x-auto border border-slate-200 rounded-xl">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-slate-50 text-slate-500 font-mono font-bold uppercase border-b border-slate-200 text-[11px]">
                                    <tr>
                                        <th className="py-2.5 px-4">No</th>
                                        <th className="py-2.5 px-4">Kelompok & Kategori Aset Perusahaan</th>
                                        <th className="py-2.5 px-4">Keterangan / Volume Fisik</th>
                                        <th className="py-2.5 px-4 text-center">Proporsi (%)</th>
                                        <th className="py-2.5 px-4 text-right">Nilai Valuasi Aset (Rp)</th>
                                        <th className="py-2.5 px-4 text-center">Detail</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {[
                                        {
                                            no: 1,
                                            name: 'Aset Persediaan Bahan Baku Kaca Lembaran',
                                            type: 'Aset Lancar (Inventory)',
                                            vol: `${(sheetGlasses || []).reduce((s, g) => s + (Number(g.qty) || 0), 0)} Lembar (${sheetGlasses?.length || 0} Jenis Kaca)`,
                                            val: totalGlassAssetValue,
                                            tabId: 'glass',
                                            badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                                        },
                                        {
                                            no: 2,
                                            name: 'Aset Persediaan Aksesoris & Fitting Kaca',
                                            type: 'Aset Lancar (Inventory)',
                                            vol: `${(accessoriesList || []).reduce((s, a) => s + (Number(a.qty) || 0), 0)} Unit (${accessoriesList?.length || 0} Jenis Aksesoris)`,
                                            val: totalAccAssetValue,
                                            tabId: 'accessories',
                                            badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
                                        },
                                        {
                                            no: 3,
                                            name: 'Aset Tetap Alat Kerja & Mesin Produksi Pabrik',
                                            type: 'Aset Tetap (Fixed Assets)',
                                            vol: `${(toolsList || []).reduce((s, t) => s + (Number(t.total_qty) || 0), 0)} Unit (${toolsList?.length || 0} Jenis Alat/Mesin)`,
                                            val: totalToolsAssetValue,
                                            tabId: 'tools',
                                            badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
                                        },
                                        {
                                            no: 4,
                                            name: 'Aset Peralatan, Sparepart & Consumables Gudang',
                                            type: 'Aset Operasional Gudang',
                                            vol: `${(warehouseSuppliesList || []).reduce((s, sup) => s + (Number(sup.qty ?? sup.stock_qty) || 0), 0)} Unit (${warehouseSuppliesList?.length || 0} Jenis Barang)`,
                                            val: totalSuppliesAssetValue,
                                            tabId: 'supplies',
                                            badgeClass: 'bg-blue-50 text-[#1b68b0] border-blue-200',
                                        },
                                        {
                                            no: 5,
                                            name: 'Aset Material Kaca Sisa Rak (Scrap Layak Pakai)',
                                            type: 'Aset Material Efisiensi',
                                            vol: `${scrapGlasses?.length || 0} Potongan Kaca Sisa Produksi di Rak`,
                                            val: totalScrapAssetValue,
                                            tabId: 'scrap',
                                            badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
                                        },
                                        {
                                            no: 6,
                                            name: 'Aset Likuid Saldo Kas Bersih & Bank Perusahaan',
                                            type: 'Aset Likuid (Cash on Hand)',
                                            vol: `Kas Masuk Riil (Rp ${paidRev.toLocaleString('id-ID')}) - Belanja (Rp ${grandTotalExpenses.toLocaleString('id-ID')})`,
                                            val: netCashBalance,
                                            tabId: 'all',
                                            badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                                        },
                                        {
                                            no: 7,
                                            name: 'Aset Piutang Penjualan Pelanggan (Belum Lunas)',
                                            type: 'Aset Piutang (Receivables)',
                                            vol: `${unpaidOrdersList.length} Orderan SPO Deal dalam proses pelunasan`,
                                            val: pendingCodVal,
                                            tabId: 'all',
                                            badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
                                        },
                                    ].map((row) => {
                                        const pct = grandTotalCompanyAssets > 0 ? ((row.val / grandTotalCompanyAssets) * 100).toFixed(1) : '0.0';
                                        return (
                                            <tr key={row.no} className="hover:bg-slate-50 transition">
                                                <td className="py-2.5 px-4 font-mono font-bold text-slate-500">{row.no}</td>
                                                <td className="py-2.5 px-4">
                                                    <div className="font-bold text-[#242222]">{row.name}</div>
                                                    <span className={`inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded border ${row.badgeClass}`}>
                                                        {row.type}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 px-4 font-mono text-slate-600">{row.vol}</td>
                                                <td className="py-2.5 px-4 text-center font-mono font-bold text-slate-700">{pct}%</td>
                                                <td className="py-2.5 px-4 text-right font-mono font-black text-[#242222]">
                                                    Rp {Number(row.val || 0).toLocaleString('id-ID')}
                                                </td>
                                                <td className="py-2.5 px-4 text-center">
                                                    {row.tabId !== 'all' ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => setAssetCategoryTab(row.tabId)}
                                                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#1b68b0] border border-blue-200 rounded-lg text-[10px] font-bold transition cursor-pointer"
                                                        >
                                                            Lihat Rincian
                                                        </button>
                                                    ) : (
                                                        <span className="text-[10px] text-slate-400 font-mono">Tercatat di P&L</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    <tr className="bg-blue-50/60 font-black text-[#1b68b0] border-t-2 border-blue-200">
                                        <td colSpan={3} className="py-3 px-4 text-xs uppercase">
                                            TOTAL KESELURUHAN ASET PERUSAHAAN (INVENTARIS FISIK + ALAT MESIN + KAS & PIUTANG)
                                        </td>
                                        <td className="py-3 px-4 text-center font-mono">100%</td>
                                        <td className="py-3 px-4 text-right font-mono text-sm">
                                            Rp {Number(grandTotalCompanyAssets).toLocaleString('id-ID')}
                                        </td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* RINGKASAN 6 KARTU NILAI ASET FISIK & INVENTARIS (KLIK UNTUK FILTER TABEL DETAIL) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
                        <div
                            onClick={() => setAssetCategoryTab('all')}
                            className={`bg-white border-2 rounded-2xl p-4 shadow-xs cursor-pointer transition ${
                                assetCategoryTab === 'all' ? 'border-[#1b68b0] bg-blue-50/30' : 'border-slate-200 hover:border-slate-300'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500">Total Aset Fisik & Stok</span>
                                <Boxes className="w-4 h-4 text-[#1b68b0]" />
                            </div>
                            <h3 className="text-base sm:text-lg font-black text-[#1b68b0] font-mono mt-1.5">
                                Rp {Number(grandTotalAssetsValue).toLocaleString('id-ID')}
                            </h3>
                            <span className="text-[10px] text-slate-500 font-mono block mt-1">
                                {(sheetGlasses?.length || 0) + (accessoriesList?.length || 0) + (toolsList?.length || 0) + (warehouseSuppliesList?.length || 0) + (scrapGlasses?.length || 0)} Item Fisik Terdaftar
                            </span>
                        </div>

                        <div
                            onClick={() => setAssetCategoryTab('glass')}
                            className={`bg-white border rounded-2xl p-4 shadow-xs cursor-pointer transition ${
                                assetCategoryTab === 'glass' ? 'border-2 border-[#1b68b0] bg-blue-50/30' : 'border-slate-200 hover:border-slate-300'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500">Aset Kaca Lembaran</span>
                                <Package className="w-4 h-4 text-emerald-600" />
                            </div>
                            <h3 className="text-base sm:text-lg font-black text-emerald-700 font-mono mt-1.5">
                                Rp {Number(totalGlassAssetValue).toLocaleString('id-ID')}
                            </h3>
                            <span className="text-[10px] text-slate-500 font-mono block mt-1">
                                {(sheetGlasses || []).reduce((s, g) => s + (Number(g.qty) || 0), 0)} Lembar ({sheetGlasses?.length || 0} Jenis)
                            </span>
                        </div>

                        <div
                            onClick={() => setAssetCategoryTab('accessories')}
                            className={`bg-white border rounded-2xl p-4 shadow-xs cursor-pointer transition ${
                                assetCategoryTab === 'accessories' ? 'border-2 border-[#1b68b0] bg-blue-50/30' : 'border-slate-200 hover:border-slate-300'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500">Aset Aksesoris Kaca</span>
                                <Plug className="w-4 h-4 text-amber-600" />
                            </div>
                            <h3 className="text-base sm:text-lg font-black text-amber-700 font-mono mt-1.5">
                                Rp {Number(totalAccAssetValue).toLocaleString('id-ID')}
                            </h3>
                            <span className="text-[10px] text-slate-500 font-mono block mt-1">
                                {(accessoriesList || []).reduce((s, a) => s + (Number(a.qty) || 0), 0)} Unit ({accessoriesList?.length || 0} Jenis)
                            </span>
                        </div>

                        <div
                            onClick={() => setAssetCategoryTab('tools')}
                            className={`bg-white border rounded-2xl p-4 shadow-xs cursor-pointer transition ${
                                assetCategoryTab === 'tools' ? 'border-2 border-[#1b68b0] bg-blue-50/30' : 'border-slate-200 hover:border-slate-300'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500">Aset Alat & Mesin</span>
                                <Wrench className="w-4 h-4 text-purple-600" />
                            </div>
                            <h3 className="text-base sm:text-lg font-black text-purple-700 font-mono mt-1.5">
                                Rp {Number(totalToolsAssetValue).toLocaleString('id-ID')}
                            </h3>
                            <span className="text-[10px] text-slate-500 font-mono block mt-1">
                                {(toolsList || []).reduce((s, t) => s + (Number(t.total_qty) || 0), 0)} Unit ({toolsList?.length || 0} Jenis)
                            </span>
                        </div>

                        <div
                            onClick={() => setAssetCategoryTab('supplies')}
                            className={`bg-white border rounded-2xl p-4 shadow-xs cursor-pointer transition ${
                                assetCategoryTab === 'supplies' ? 'border-2 border-[#1b68b0] bg-blue-50/30' : 'border-slate-200 hover:border-slate-300'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500">Peralatan Gudang</span>
                                <Archive className="w-4 h-4 text-[#1b68b0]" />
                            </div>
                            <h3 className="text-base sm:text-lg font-black text-[#242222] font-mono mt-1.5">
                                Rp {Number(totalSuppliesAssetValue).toLocaleString('id-ID')}
                            </h3>
                            <span className="text-[10px] text-slate-500 font-mono block mt-1">
                                {(warehouseSuppliesList || []).reduce((s, sup) => s + (Number(sup.qty ?? sup.stock_qty) || 0), 0)} Unit ({warehouseSuppliesList?.length || 0} Jenis)
                            </span>
                        </div>

                        <div
                            onClick={() => setAssetCategoryTab('scrap')}
                            className={`bg-white border rounded-2xl p-4 shadow-xs cursor-pointer transition ${
                                assetCategoryTab === 'scrap' ? 'border-2 border-[#1b68b0] bg-blue-50/30' : 'border-slate-200 hover:border-slate-300'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500">Aset Kaca Sisa Rak</span>
                                <Recycle className="w-4 h-4 text-teal-600" />
                            </div>
                            <h3 className="text-base sm:text-lg font-black text-teal-700 font-mono mt-1.5">
                                Rp {Number(totalScrapAssetValue).toLocaleString('id-ID')}
                            </h3>
                            <span className="text-[10px] text-slate-500 font-mono block mt-1">
                                {scrapGlasses?.length || 0} Potongan Layak Pakai
                            </span>
                        </div>
                    </div>

                    {/* FILTER KATEGORI & PENCARIAN ASET */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                            {[
                                { id: 'all', label: 'Semua Rincian Aset' },
                                { id: 'glass', label: `Kaca Lembaran (${sheetGlasses?.length || 0})` },
                                { id: 'accessories', label: `Aksesoris (${accessoriesList?.length || 0})` },
                                { id: 'tools', label: `Alat & Mesin (${toolsList?.length || 0})` },
                                { id: 'supplies', label: `Peralatan Gudang (${warehouseSuppliesList?.length || 0})` },
                                { id: 'scrap', label: `Kaca Sisa Rak (${scrapGlasses?.length || 0})` },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setAssetCategoryTab(tab.id)}
                                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                                        assetCategoryTab === tab.id
                                            ? 'bg-white text-[#1b68b0] shadow-xs border border-slate-200 font-bold'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full sm:w-72">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Cari kode, nama kaca, aksesoris, alat..."
                                value={assetSearchTerm}
                                onChange={e => setAssetSearchTerm(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:border-[#1b68b0] focus:bg-white focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* 1. TABEL DATA HARGA & STOK ASET KACA LEMBARAN */}
                    {(assetCategoryTab === 'all' || assetCategoryTab === 'glass') && (
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                <div>
                                    <h4 className="font-black text-[#242222] text-sm flex items-center gap-2">
                                        <Boxes className="w-4 h-4 text-[#1b68b0]" />
                                        <span>1. Data Harga & Valuasi Stok Kaca Lembaran (Bahan Produksi)</span>
                                    </h4>
                                    <p className="text-xs text-slate-500">Daftar harga beli modal per lembar, harga jual per m², stok tersedia, dan total nilai aset kaca di gudang.</p>
                                </div>
                                <span className="font-mono text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
                                    Subtotal Aset Kaca: Rp {Number(totalGlassAssetValue).toLocaleString('id-ID')}
                                </span>
                            </div>

                            <div className="overflow-x-auto border border-slate-200 rounded-xl">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-mono font-bold uppercase border-b border-slate-200 text-[11px]">
                                        <tr>
                                            <th className="py-3 px-4">Kode</th>
                                            <th className="py-3 px-4">Nama & Jenis Kaca</th>
                                            <th className="py-3 px-4">Ukuran</th>
                                            <th className="py-3 px-4">Supplier</th>
                                            <th className="py-3 px-4 text-center">Stok Tersedia</th>
                                            <th className="py-3 px-4 text-right">Harga Beli / Lembar</th>
                                            <th className="py-3 px-4 text-right">Harga Jual / m²</th>
                                            <th className="py-3 px-4 text-right">Total Nilai Aset (Rp)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {(sheetGlasses || [])
                                            .filter(g => !assetSearchTerm || `${g.item_code} ${g.name} ${g.category} ${g.supplier_name}`.toLowerCase().includes(assetSearchTerm.toLowerCase()))
                                            .map(g => {
                                                const totalVal = (Number(g.qty) || 0) * (Number(g.buy_price) || 0);
                                                return (
                                                    <tr key={g.id} className="hover:bg-slate-50 transition">
                                                        <td className="py-3 px-4 font-mono font-bold text-[#1b68b0]">{g.item_code}</td>
                                                        <td className="py-3 px-4">
                                                            <div className="font-bold text-[#242222]">{g.name}</div>
                                                            <span className="text-[10px] text-slate-500">{g.category}</span>
                                                        </td>
                                                        <td className="py-3 px-4 font-mono text-slate-700">{g.size || `${g.length_cm} x ${g.width_cm} cm`}</td>
                                                        <td className="py-3 px-4 text-slate-600">{g.supplier_name || '-'}</td>
                                                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                                                            {g.qty} {g.unit || 'Lembar'}
                                                        </td>
                                                        <td className="py-3 px-4 text-right font-mono font-bold text-amber-700">
                                                            Rp {Number(g.buy_price || 0).toLocaleString('id-ID')}
                                                        </td>
                                                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                                                            Rp {Number(g.sell_price || 0).toLocaleString('id-ID')}
                                                        </td>
                                                        <td className="py-3 px-4 text-right font-mono font-black text-[#242222]">
                                                            Rp {Number(totalVal).toLocaleString('id-ID')}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* 2. TABEL DATA HARGA & STOK AKSESORIS KACA */}
                    {(assetCategoryTab === 'all' || assetCategoryTab === 'accessories') && (
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                <div>
                                    <h4 className="font-black text-[#242222] text-sm flex items-center gap-2">
                                        <Plug className="w-4 h-4 text-[#1b68b0]" />
                                        <span>2. Data Harga & Valuasi Stok Aksesoris Kaca Konsumen</span>
                                    </h4>
                                    <p className="text-xs text-slate-500">Daftar harga beli modal, harga jual konsumen, stok tersedia, dan nilai buku inventaris aksesoris.</p>
                                </div>
                                <span className="font-mono text-xs font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl">
                                    Subtotal Aset Aksesoris: Rp {Number(totalAccAssetValue).toLocaleString('id-ID')}
                                </span>
                            </div>

                            <div className="overflow-x-auto border border-slate-200 rounded-xl">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-mono font-bold uppercase border-b border-slate-200 text-[11px]">
                                        <tr>
                                            <th className="py-3 px-4">Kode</th>
                                            <th className="py-3 px-4">Nama Aksesoris</th>
                                            <th className="py-3 px-4 text-center">Stok Tersedia</th>
                                            <th className="py-3 px-4 text-right">Harga Beli Satuan</th>
                                            <th className="py-3 px-4 text-right">Harga Jual Satuan</th>
                                            <th className="py-3 px-4 text-right">Total Nilai Aset (Rp)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {(accessoriesList || [])
                                            .filter(a => !assetSearchTerm || `${a.acc_code} ${a.name}`.toLowerCase().includes(assetSearchTerm.toLowerCase()))
                                            .map(a => {
                                                const totalVal = (Number(a.qty) || 0) * (Number(a.buy_price) || 0);
                                                return (
                                                    <tr key={a.id} className="hover:bg-slate-50 transition">
                                                        <td className="py-3 px-4 font-mono font-bold text-[#1b68b0]">{a.acc_code}</td>
                                                        <td className="py-3 px-4 font-bold text-[#242222]">{a.name}</td>
                                                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                                                            {a.qty} {a.unit || 'Pcs'}
                                                        </td>
                                                        <td className="py-3 px-4 text-right font-mono font-bold text-amber-700">
                                                            Rp {Number(a.buy_price || 0).toLocaleString('id-ID')}
                                                        </td>
                                                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                                                            Rp {Number(a.sell_price || 0).toLocaleString('id-ID')}
                                                        </td>
                                                        <td className="py-3 px-4 text-right font-mono font-black text-[#242222]">
                                                            Rp {Number(totalVal).toLocaleString('id-ID')}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* 3. TABEL DATA HARGA & INVENTARIS ALAT & MESIN KERJA */}
                    {(assetCategoryTab === 'all' || assetCategoryTab === 'tools') && (
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                <div>
                                    <h4 className="font-black text-[#242222] text-sm flex items-center gap-2">
                                        <Wrench className="w-4 h-4 text-[#1b68b0]" />
                                        <span>3. Data Harga & Valuasi Aset Alat Penunjang & Mesin Produksi</span>
                                    </h4>
                                    <p className="text-xs text-slate-500">Valuasi harga satuan alat/mesin, jumlah unit dimiliki, ketersediaan, serta kondisi fisik alat.</p>
                                </div>
                                <span className="font-mono text-xs font-extrabold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-xl">
                                    Subtotal Aset Alat & Mesin: Rp {Number(totalToolsAssetValue).toLocaleString('id-ID')}
                                </span>
                            </div>

                            <div className="overflow-x-auto border border-slate-200 rounded-xl">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-mono font-bold uppercase border-b border-slate-200 text-[11px]">
                                        <tr>
                                            <th className="py-3 px-4">Kode Alat</th>
                                            <th className="py-3 px-4">Nama Alat / Mesin</th>
                                            <th className="py-3 px-4">Kategori & Lokasi</th>
                                            <th className="py-3 px-4 text-center">Total Unit</th>
                                            <th className="py-3 px-4 text-center">Kondisi</th>
                                            <th className="py-3 px-4 text-right">Harga Satuan (Rp)</th>
                                            <th className="py-3 px-4 text-right">Total Nilai Aset (Rp)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {(toolsList || [])
                                            .filter(t => !assetSearchTerm || `${t.tool_code} ${t.name} ${t.category} ${t.location}`.toLowerCase().includes(assetSearchTerm.toLowerCase()))
                                            .map(t => {
                                                const unitPrice = getToolUnitPrice(t);
                                                const totalVal = (Number(t.total_qty) || 0) * unitPrice;
                                                return (
                                                    <tr key={t.id} className="hover:bg-slate-50 transition">
                                                        <td className="py-3 px-4 font-mono font-bold text-[#1b68b0]">{t.tool_code}</td>
                                                        <td className="py-3 px-4 font-bold text-[#242222]">{t.name}</td>
                                                        <td className="py-3 px-4 text-slate-600">
                                                            <div>{t.category}</div>
                                                            <span className="text-[10px] text-slate-400">{t.location}</span>
                                                        </td>
                                                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                                                            {t.total_qty} {t.unit || 'Unit'} <span className="text-[10px] text-emerald-700">({t.available_qty} Siap)</span>
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                                                t.condition === 'Baik' || t.condition === 'Bagus'
                                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                                            }`}>
                                                                {t.condition}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-right font-mono font-bold text-purple-700">
                                                            Rp {Number(unitPrice).toLocaleString('id-ID')}
                                                        </td>
                                                        <td className="py-3 px-4 text-right font-mono font-black text-[#242222]">
                                                            Rp {Number(totalVal).toLocaleString('id-ID')}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* 4. TABEL DATA HARGA & STOK PERALATAN / PERLENGKAPAN GUDANG */}
                    {(assetCategoryTab === 'all' || assetCategoryTab === 'supplies') && (
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                <div>
                                    <h4 className="font-black text-[#242222] text-sm flex items-center gap-2">
                                        <Archive className="w-4 h-4 text-[#1b68b0]" />
                                        <span>4. Data Harga & Valuasi Stok Peralatan / Perlengkapan Gudang (Consumables & Sparepart)</span>
                                    </h4>
                                    <p className="text-xs text-slate-500">Daftar harga satuan peralatan/perlengkapan gudang, sisa stok tersedia, dan total nilai persediaan.</p>
                                </div>
                                <span className="font-mono text-xs font-extrabold text-[#1b68b0] bg-blue-50 border border-blue-200 px-3 py-1 rounded-xl">
                                    Subtotal Peralatan Gudang: Rp {Number(totalSuppliesAssetValue).toLocaleString('id-ID')}
                                </span>
                            </div>

                            <div className="overflow-x-auto border border-slate-200 rounded-xl">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-mono font-bold uppercase border-b border-slate-200 text-[11px]">
                                        <tr>
                                            <th className="py-3 px-4">Kode</th>
                                            <th className="py-3 px-4">Nama Peralatan / Perlengkapan Gudang</th>
                                            <th className="py-3 px-4">Kategori</th>
                                            <th className="py-3 px-4 text-center">Stok Tersedia</th>
                                            <th className="py-3 px-4 text-center">Status</th>
                                            <th className="py-3 px-4 text-right">Harga Satuan (Rp)</th>
                                            <th className="py-3 px-4 text-right">Total Nilai Aset (Rp)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {(warehouseSuppliesList || [])
                                            .filter(s => !assetSearchTerm || `${s.item_code} ${s.name} ${s.category}`.toLowerCase().includes(assetSearchTerm.toLowerCase()))
                                            .map(s => {
                                                const qty = Number(s.qty ?? s.stock_qty) || 0;
                                                const unitPrice = getSupplyUnitPrice(s);
                                                const totalVal = qty * unitPrice;
                                                return (
                                                    <tr key={s.id} className="hover:bg-slate-50 transition">
                                                        <td className="py-3 px-4 font-mono font-bold text-[#1b68b0]">{s.item_code}</td>
                                                        <td className="py-3 px-4 font-bold text-[#242222]">{s.name}</td>
                                                        <td className="py-3 px-4 text-slate-600">{s.category}</td>
                                                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                                                            {qty} {s.unit || 'Pcs'}
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                                                s.status === 'Aman'
                                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                                            }`}>
                                                                {s.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-right font-mono font-bold text-[#1b68b0]">
                                                            Rp {Number(unitPrice).toLocaleString('id-ID')}
                                                        </td>
                                                        <td className="py-3 px-4 text-right font-mono font-black text-[#242222]">
                                                            Rp {Number(totalVal).toLocaleString('id-ID')}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* 5. TABEL DATA HARGA & VALUASI KACA SISA RAK (SCRAP GLASS LAYAK PAKAI) */}
                    {(assetCategoryTab === 'all' || assetCategoryTab === 'scrap') && (
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                <div>
                                    <h4 className="font-black text-[#242222] text-sm flex items-center gap-2">
                                        <Recycle className="w-4 h-4 text-teal-600" />
                                        <span>5. Data Valuasi Aset Material Kaca Sisa Rak (Scrap Layak Pakai)</span>
                                    </h4>
                                    <p className="text-xs text-slate-500">Daftar potongan kaca sisa produksi di rak penyimpanan yang masih layak pakai untuk pesanan ukuran kecil.</p>
                                </div>
                                <span className="font-mono text-xs font-extrabold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-xl">
                                    Subtotal Aset Kaca Sisa Rak: Rp {Number(totalScrapAssetValue).toLocaleString('id-ID')}
                                </span>
                            </div>

                            <div className="overflow-x-auto border border-slate-200 rounded-xl">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-mono font-bold uppercase border-b border-slate-200 text-[11px]">
                                        <tr>
                                            <th className="py-3 px-4">Kode Rak</th>
                                            <th className="py-3 px-4">Jenis & Ketebalan Kaca</th>
                                            <th className="py-3 px-4">Dimensi Potongan</th>
                                            <th className="py-3 px-4 text-center">Luas (m²)</th>
                                            <th className="py-3 px-4 text-center">Status</th>
                                            <th className="py-3 px-4 text-right">Estimasi Nilai Material (Rp)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {(scrapGlasses || [])
                                            .filter(sc => !assetSearchTerm || `${sc.rack_code} ${sc.glass_type} ${sc.status}`.toLowerCase().includes(assetSearchTerm.toLowerCase()))
                                            .map((sc, idx) => {
                                                const areaM2 = ((Number(sc.length_cm || 0) * Number(sc.width_cm || 0)) / 10000);
                                                const estValue = Math.round(areaM2 * 380000) || 125000;
                                                return (
                                                    <tr key={sc.id || idx} className="hover:bg-slate-50 transition">
                                                        <td className="py-3 px-4 font-mono font-bold text-teal-700">{sc.rack_code || `RAK-${idx + 1}`}</td>
                                                        <td className="py-3 px-4 font-bold text-[#242222]">
                                                            {sc.glass_type} {sc.thickness_mm ? `(${sc.thickness_mm} mm)` : ''}
                                                        </td>
                                                        <td className="py-3 px-4 font-mono text-slate-700">
                                                            {sc.length_cm} x {sc.width_cm} cm
                                                        </td>
                                                        <td className="py-3 px-4 text-center font-mono text-slate-700">
                                                            {areaM2.toFixed(2)} m²
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                                {sc.status || 'Layak Pakai'}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-right font-mono font-black text-[#242222]">
                                                            Rp {Number(estValue).toLocaleString('id-ID')}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        {(scrapGlasses || []).length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="text-center py-6 text-slate-500">
                                                    Tidak ada potongan kaca sisa di rak saat ini.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* SUB-TAB BARU: PENGAJUAN RESTOK BARANG PRODUKSI, SPAREPART & INVENTARIS DARI ADMIN */}
            {financeSubTab === 'restock_requests' && (
                <div className="space-y-5">
                    <div className="flex flex-wrap justify-between items-center gap-3 bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
                        <div>
                            <h3 className="font-black text-[#242222] text-base flex items-center gap-2">
                                <Send className="w-5 h-5 text-[#1b68b0]" />
                                <span>Daftar Pengajuan Pembelian Bahan Produksi, Sparepart & Inventaris (Dari Admin Toko / Gudang)</span>
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Bagian Finance meninjau pengajuan restok barang produksi, memesan barang ke supplier, serta menyetujui & menginput nota bukti pembayaran.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-xl text-xs font-bold font-mono">
                                {totalRestockQueueCount} Pengajuan Aktif
                            </span>
                        </div>
                    </div>

                    {/* 1. DAFTAR PENGAJUAN YANG SUDAH MASUK ANTREAN PO FINANCE */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h4 className="font-bold text-[#242222] text-sm flex items-center gap-2">
                                <Clock className="w-4 h-4 text-amber-600" />
                                <span>Antrean Pengajuan Menunggu Persetujuan & Pemesanan Finance ({pendingRestockTrx.length})</span>
                            </h4>
                        </div>

                        {pendingRestockTrx.length === 0 ? (
                            <div className="p-6 text-center text-slate-400 text-xs italic bg-slate-50/60 rounded-xl border border-slate-200">
                                Belum ada nomor PO pengajuan berstatus pending di tabel transaksi Finance.
                            </div>
                        ) : (
                            <div className="overflow-x-auto border border-slate-200 rounded-xl">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-mono font-bold uppercase border-b border-slate-200 text-[11px]">
                                        <tr>
                                            <th className="py-3 px-4">No. Pengajuan</th>
                                            <th className="py-3 px-4">Tanggal & Pengaju</th>
                                            <th className="py-3 px-4">Jenis Barang</th>
                                            <th className="py-3 px-4">Nama Barang & Rincian</th>
                                            <th className="py-3 px-4">Supplier Tujuan</th>
                                            <th className="py-3 px-4 text-right">Estimasi Biaya</th>
                                            <th className="py-3 px-4 text-center">Aksi Finance (Pesan & Setujui)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {pendingRestockTrx.map(clm => {
                                            const cleanNotes = String(clm.notes || '').replace(/\[RESTOCK_[^\]]+\]\s*/g, '');
                                            const phoneMatch = String(clm.notes || '').match(/\|PHONE:([^\]]*)\]/);
                                            const supPhone = phoneMatch ? (phoneMatch[1] || '').replace(/\D/g, '') : '';

                                            let jenisLabel = 'Aksesoris Konsumen';
                                            let jenisCls = 'bg-blue-50 text-[#1b68b0] border-blue-200';
                                            if (clm.type === 'pembelian_bahan' || String(clm.notes || '').includes('[RESTOCK_GLASS_ID:')) {
                                                jenisLabel = 'Bahan Produksi (Kaca)';
                                                jenisCls = 'bg-amber-50 text-amber-800 border-amber-200';
                                            } else if (String(clm.notes || '').includes('[RESTOCK_TOOL_ID:')) {
                                                jenisLabel = 'Pembelian Alat Baru';
                                                jenisCls = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                                            } else if (clm.type === 'pembelian_alat' || String(clm.notes || '').includes('[RESTOCK_SUPPLY_ID:')) {
                                                jenisLabel = 'Sparepart & Inventaris';
                                                jenisCls = 'bg-purple-50 text-purple-700 border-purple-200';
                                            }

                                            const handleOrderWa = () => {
                                                const msg = `Halo ${clm.supplier_name || 'Mitra Supplier'},%0A%0AKami dari bagian Finance & Purchasing CV Cahya Karunia Jaya (SYP Glass).%0AKami ingin memesan barang sesuai pengajuan berikut:%0A%0A• No. PO: ${clm.transaction_code}%0A• Rincian: ${clm.title}%0A• Estimasi Nilai: Rp ${Number(clm.amount || 0).toLocaleString('id-ID')}%0A%0AMohon konfirmasi ketersediaan stok dan faktur tagihan. Terima kasih!`;
                                                const url = supPhone
                                                    ? `https://api.whatsapp.com/send?phone=${supPhone}&text=${msg}`
                                                    : `https://api.whatsapp.com/send?text=${msg}`;
                                                window.open(url, '_blank');
                                            };

                                            return (
                                                <tr key={clm.id} className="hover:bg-slate-50 transition">
                                                    <td className="py-3 px-4 font-mono font-bold text-[#1b68b0]">{clm.transaction_code}</td>
                                                    <td className="py-3 px-4">
                                                        <div className="font-mono text-slate-600">{clm.transaction_date}</div>
                                                        <span className="inline-block mt-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                                                            {clm.source_role === 'admin_gudang' ? 'Admin Gudang' : 'Admin Toko'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${jenisCls}`}>
                                                            {jenisLabel}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="font-bold text-[#242222]">{clm.title}</div>
                                                        {cleanNotes && <div className="text-[11px] text-slate-500 mt-0.5">{cleanNotes}</div>}
                                                    </td>
                                                    <td className="py-3 px-4 font-semibold text-slate-700">{clm.supplier_name || '-'}</td>
                                                    <td className="py-3 px-4 text-right font-mono font-black text-amber-700">
                                                        Rp {Number(clm.amount || 0).toLocaleString('id-ID')}
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                                            <button
                                                                type="button"
                                                                onClick={handleOrderWa}
                                                                className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                                                                title="Pesan Barang ke Supplier via WhatsApp"
                                                            >
                                                                <MessageSquare className="w-3.5 h-3.5" />
                                                                <span>Pesan WA</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleApproveClaim(clm)}
                                                                className="px-3 py-1.5 bg-[#70b03c] hover:bg-[#5f9733] text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition cursor-pointer shadow-2xs"
                                                                title="Setujui Restok & Upload Nota Bukti Pembayaran"
                                                            >
                                                                <Check className="w-3.5 h-3.5" />
                                                                <span>Setujui & Input Nota</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRejectClaim(clm.id)}
                                                                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                                                            >
                                                                <X className="w-3.5 h-3.5" />
                                                                <span>Tolak</span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* 2. PENGAJUAN LANGSUNG DARI KATALOG KACA PRODUKSI / SPAREPART / AKSESORIS */}
                    {(glassRequestsWithoutTrx.length > 0 || supplyRequestsWithoutTrx.length > 0 || accRequestsWithoutTrx.length > 0) && (
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                            <div className="border-b border-slate-100 pb-3">
                                <h4 className="font-bold text-[#242222] text-sm flex items-center gap-2">
                                    <Package className="w-4 h-4 text-[#1b68b0]" />
                                    <span>Pengajuan Barang Produksi, Sparepart & Inventaris dari Admin Toko / Gudang</span>
                                </h4>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Daftar item yang statusnya sedang diajukan restok dan menunggu Finance untuk memesan & membukukan nota pembelian.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* Bahan Kaca Produksi */}
                                {glassRequestsWithoutTrx.map(g => (
                                    <div key={`glass-${g.id}`} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full">
                                                    Bahan Produksi (Kaca Lembaran)
                                                </span>
                                                <span className="font-mono text-xs font-bold text-[#1b68b0]">{g.item_code}</span>
                                            </div>
                                            <h5 className="font-bold text-[#242222] text-sm pt-1">{g.name}</h5>
                                            <div className="text-xs text-slate-600 font-mono">
                                                Ukuran: <strong>{g.size}</strong> • Sisa Stok: <strong className="text-rose-600">{g.qty} {g.unit || 'Lembar'}</strong>
                                            </div>
                                            <div className="text-[11px] text-slate-500">
                                                Supplier: <strong>{g.supplier_name || '-'}</strong> • Harga Beli: <strong>Rp {Number(g.buy_price || 0).toLocaleString('id-ID')}/lembar</strong>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-200">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const cleanPhone = (g.supplier_phone || '').replace(/\D/g, '');
                                                    const msg = `Halo ${g.supplier_name || 'Supplier Kaca'},%0A%0AKami dari Finance & Purchasing CV Cahya Karunia Jaya ingin memesan bahan kaca produksi:%0A• Barang: [${g.item_code}] ${g.name}%0A• Ukuran: ${g.size}%0A%0AMohon info ketersediaan dan invoice pembayaran. Terima kasih!`;
                                                    window.open(cleanPhone ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${msg}` : `https://api.whatsapp.com/send?text=${msg}`, '_blank');
                                                }}
                                                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                                            >
                                                <MessageSquare className="w-3.5 h-3.5" />
                                                <span>Pesan ke Supplier</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleApproveClaim({
                                                    is_direct_catalog_item: true,
                                                    transaction_code: `PO-BB-AUTO`,
                                                    type: 'pembelian_bahan',
                                                    category: 'Bahan Baku Kaca Lembaran',
                                                    title: `Restok Bahan Produksi: ${g.name} (+10 ${g.unit || 'Lembar'})`,
                                                    amount: (Number(g.buy_price) || 300000) * 10,
                                                    unit_buy_price: Number(g.buy_price) || 300000,
                                                    supplier_name: g.supplier_name || 'PT Asahimas Flat Glass Tbk',
                                                    source_role: 'admin_gudang',
                                                    notes: `[RESTOCK_GLASS_ID:${g.id}|QTY:10|CODE:${g.item_code}|PHONE:${g.supplier_phone || ''}] Realisasi pengajuan restok bahan kaca produksi (${g.size}) oleh Finance.`
                                                })}
                                                className="px-3.5 py-1.5 bg-[#70b03c] hover:bg-[#5f9733] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                <span>Setujui & Input Nota Pembelian</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* Sparepart & Perlengkapan Gudang */}
                                {supplyRequestsWithoutTrx.map(req => (
                                    <div key={`sup-${req.id}`} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                                    <Archive className="w-3 h-3" /> Sparepart & Inventaris Produksi
                                                </span>
                                                <span className="font-mono text-xs font-bold text-[#1b68b0]">{req.item_code}</span>
                                            </div>
                                            <h5 className="font-bold text-[#242222] text-sm pt-1">
                                                {req.item_name} <span className="text-amber-700 font-mono">(+{req.request_qty} {req.unit})</span>
                                            </h5>
                                            <div className="text-xs text-slate-600">
                                                Diajukan oleh: <strong>{req.requested_by || 'Admin'}</strong> • Prioritas: <strong className="text-rose-600">{req.priority || 'Mendesak'}</strong>
                                            </div>
                                            {req.notes && (
                                                <p className="text-[11px] text-slate-500 italic">"{req.notes}"</p>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-200">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const msg = `Halo Mitra Supplier Sparepart,%0A%0AKami dari Finance CV Cahya Karunia Jaya ingin memesan sparepart/perlengkapan produksi:%0A• Barang: [${req.item_code}] ${req.item_name}%0A• Jumlah: ${req.request_qty} ${req.unit}%0A%0AMohon informasi ketersediaan dan nota tagihan. Terima kasih!`;
                                                    window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
                                                }}
                                                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                                            >
                                                <MessageSquare className="w-3.5 h-3.5" />
                                                <span>Pesan ke Supplier</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleApproveClaim({
                                                    is_direct_catalog_item: true,
                                                    transaction_code: `PO-ALT-AUTO`,
                                                    type: 'pembelian_alat',
                                                    category: 'Sparepart & Perlengkapan Produksi',
                                                    title: `Pembelian Sparepart/Inventaris: ${req.item_name} (+${req.request_qty} ${req.unit})`,
                                                    amount: (Number(req.request_qty) || 1) * 50000,
                                                    unit_buy_price: 50000,
                                                    supplier_name: 'Toko Teknik & Sparepart Pabrik',
                                                    source_role: 'admin_gudang',
                                                    notes: `[RESTOCK_SUPPLY_ID:${req.supply_id}|QTY:${req.request_qty}|REQ_ID:${req.id}|CODE:${req.item_code}] ${req.notes || 'Realisasi pembelian sparepart/perlengkapan oleh Finance.'}`
                                                })}
                                                className="px-3.5 py-1.5 bg-[#70b03c] hover:bg-[#5f9733] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                <span>Setujui & Input Nota Pembelian</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* Aksesoris Kaca */}
                                {accRequestsWithoutTrx.map(acc => (
                                    <div key={`acc-${acc.id}`} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold bg-blue-50 text-[#1b68b0] border border-blue-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                                    <Plug className="w-3 h-3" /> Aksesoris & Hardware
                                                </span>
                                                <span className="font-mono text-xs font-bold text-[#1b68b0]">{acc.acc_code}</span>
                                            </div>
                                            <h5 className="font-bold text-[#242222] text-sm pt-1">{acc.name}</h5>
                                            <div className="text-xs text-slate-600 font-mono">
                                                Sisa Stok: <strong className="text-rose-600">{acc.qty} {acc.unit || 'Pcs'}</strong> • Harga Beli: <strong>Rp {Number(acc.buy_price || 0).toLocaleString('id-ID')}</strong>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-200">
                                            <button
                                                type="button"
                                                onClick={() => handleApproveClaim({
                                                    is_direct_catalog_item: true,
                                                    transaction_code: `PO-ACC-AUTO`,
                                                    type: 'pembelian_aksesoris',
                                                    category: 'Restock Aksesoris & Hardware',
                                                    title: `Restok Aksesoris: ${acc.name} (+10 ${acc.unit || 'Pcs'})`,
                                                    amount: (Number(acc.buy_price) || 25000) * 10,
                                                    unit_buy_price: Number(acc.buy_price) || 25000,
                                                    supplier_name: 'Toko Hardware & Aksesoris Kaca',
                                                    source_role: 'admin_toko',
                                                    notes: `[RESTOCK_ACC_ID:${acc.id}|QTY:10|CODE:${acc.acc_code}] Realisasi pengajuan restok aksesoris oleh Finance.`
                                                })}
                                                className="px-3.5 py-1.5 bg-[#70b03c] hover:bg-[#5f9733] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                <span>Setujui & Input Nota Pembelian</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 3. KLAIM OPERASIONAL ARMADA / LAINNYA DI MENU AJUAN */}
                    {pendingClaims.filter(c => !pendingRestockTrx.some(r => r.id === c.id)).length > 0 && (
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                            <div className="border-b border-slate-100 pb-3">
                                <h4 className="font-bold text-[#242222] text-sm flex items-center gap-2">
                                    <Truck className="w-4 h-4 text-[#1b68b0]" />
                                    <span>Pengajuan Klaim Biaya Operasional Armada / Lainnya</span>
                                </h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {pendingClaims.filter(c => !pendingRestockTrx.some(r => r.id === c.id)).map(clm => (
                                    <div key={`clm-${clm.id}`} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className="font-mono text-xs font-bold text-[#1b68b0]">{clm.transaction_code}</span>
                                                <span className="font-mono font-black text-amber-700">Rp {Number(clm.amount || 0).toLocaleString('id-ID')}</span>
                                            </div>
                                            <h5 className="font-bold text-[#242222] text-sm">{clm.title}</h5>
                                            {clm.notes && <p className="text-[11px] text-slate-500 italic">"{clm.notes}"</p>}
                                        </div>
                                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                                            <button
                                                type="button"
                                                onClick={() => handleRejectClaim(clm.id)}
                                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                                <span>Tolak</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleApproveClaim(clm)}
                                                className="px-3.5 py-1.5 bg-[#70b03c] hover:bg-[#5f9733] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                                            >
                                                <Check className="w-3.5 h-3.5" />
                                                <span>Setujui & Input Bukti Transfer</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* SUB-TAB 1: LAPORAN LABA / RUGI KOMPREHENSIF (P&L) — TAMPIL SAAT TIDAK ADA KOTAK KARTU YANG SEDANG DIBUKA */}
            {financeSubTab === 'pnl' && activePnlCardPanel === 'pnl' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* FINANCIAL STATEMENT TABLE */}
                    <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
                        <div className="border-b border-slate-200 pb-3 flex flex-wrap justify-between items-center gap-3">
                            <div>
                                <h3 className="text-base font-bold text-[#242222] flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-[#1b68b0]" />
                                    <span>Laporan Laba Rugi Eksekutif (Income Statement)</span>
                                </h3>
                                <p className="text-xs text-slate-500 font-mono">Periode: 2026 (YTD)</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleOpenPrintModal('pnl')}
                                    className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                                >
                                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Cetak Laba Rugi</span>
                                </button>
                                <span className={`text-xs px-3 py-1 rounded-full font-bold font-mono border flex items-center gap-1.5 ${
                                    isProfitable 
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                        : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}>
                                    <span>{isProfitable ? 'Status: SEHAT & PROFITABLE' : 'Status: PERINGATAN DEFISIT'}</span>
                                </span>
                            </div>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                            <table className="w-full text-xs font-mono">
                                <tbody className="divide-y divide-slate-100">
                                    {/* 1. PENDAPATAN */}
                                    <tr className="bg-slate-50 text-[#1b68b0] font-black border-b border-slate-200">
                                        <td className="py-2.5 px-3">1. PENDAPATAN USAHA (REVENUE)</td>
                                        <td className="py-2.5 px-3 text-right">JUMLAH (RP)</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50/70">
                                        <td className="py-2 px-6 text-slate-600">• Penjualan Kaca & Jasa Proses Pabrik (SPO)</td>
                                        <td className="py-2 px-3 text-right text-slate-800 font-bold">Rp {Number(totalRev - (metrics.otherRevenue || 0)).toLocaleString('id-ID')}</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50/70">
                                        <td className="py-2 px-6 text-slate-600">• Pendapatan Lain-lain (Non-SPO / Scrap Kaca)</td>
                                        <td className="py-2 px-3 text-right text-slate-600">Rp {(metrics.otherRevenue || 0).toLocaleString('id-ID')}</td>
                                    </tr>
                                    <tr className="bg-blue-50/40 font-extrabold text-[#1b68b0]">
                                        <td className="py-2.5 px-3">TOTAL PENDAPATAN BERSIH (NET REVENUE)</td>
                                        <td className="py-2.5 px-3 text-right text-sm">Rp {totalRev.toLocaleString('id-ID')}</td>
                                    </tr>

                                    {/* 2. UANG MODAL */}
                                    <tr className="bg-slate-50 text-amber-700 font-black border-t border-b border-slate-200">
                                        <td className="py-2.5 px-3 pt-4">2. UANG MODAL (PEMBELIAN BAHAN & AKSESORIS)</td>
                                        <td className="py-2.5 px-3 pt-4 text-right"></td>
                                    </tr>
                                    <tr className="hover:bg-slate-50/70">
                                        <td className="py-2 px-6 text-slate-600">• Pembelian Lembaran Bahan Kaca Supplier</td>
                                        <td className="py-2 px-3 text-right text-rose-600">Rp {bahanKacaSum.toLocaleString('id-ID')}</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50/70">
                                        <td className="py-2 px-6 text-slate-600">• Pembelian Aksesoris Kaca Konsumen</td>
                                        <td className="py-2 px-3 text-right text-rose-600">Rp {aksesorisSum.toLocaleString('id-ID')}</td>
                                    </tr>
                                    <tr className="bg-amber-50/40 font-extrabold text-amber-800">
                                        <td className="py-2.5 px-3">TOTAL UANG MODAL PRODUKSI</td>
                                        <td className="py-2.5 px-3 text-right text-sm">Rp {totalCogs.toLocaleString('id-ID')}</td>
                                    </tr>

                                    {/* LABA KOTOR */}
                                    <tr className={`font-black text-sm border-t-2 border-b-2 transition ${
                                        grossProfitVal >= 0
                                            ? 'bg-emerald-50/60 text-emerald-800 border-emerald-200'
                                            : 'bg-rose-50/60 text-rose-800 border-rose-200'
                                    }`}>
                                        <td className="py-3 px-3">LABA KOTOR (GROSS PROFIT)</td>
                                        <td className="py-3 px-3 text-right">
                                            Rp {grossProfitVal.toLocaleString('id-ID')}{' '}
                                            <span className={`text-xs font-bold ${grossProfitVal >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                                                ({grossMarginPct}%)
                                            </span>
                                        </td>
                                    </tr>

                                    {/* 3. BEBAN OPERASIONAL (OPEX) */}
                                    <tr className="bg-slate-50 text-purple-700 font-black border-t-2 border-slate-200">
                                        <td className="py-3 px-3 pt-4">
                                            <div className="flex items-center justify-between">
                                                <span className="flex items-center gap-2">
                                                    <Zap className="w-4 h-4 text-purple-600" />
                                                    <span>3. BEBAN OPERASIONAL PABRIK & TOKO (OPEX)</span>
                                                </span>
                                                <span className="text-[10px] font-mono text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded font-normal">
                                                    {opexPosCount} Pos Biaya Operasional
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-3 pt-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => handleOpenFinanceModal('biaya_operasional')}
                                                className="text-[10px] bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-lg font-bold transition inline-flex items-center gap-1 cursor-pointer"
                                            >
                                                <Plus className="w-3 h-3" />
                                                <span>Catat Beban</span>
                                            </button>
                                        </td>
                                    </tr>

                                    {[
                                        {
                                            name: 'Beban Listrik & Daya Mesin Pabrik (PLN)',
                                            sum: listrikSum,
                                            category: 'Listrik & Energi Pabrik',
                                            budget: 15000000,
                                            icon: Zap,
                                            desc: 'Gardu Trafo 33 kVA, Oven Tempered & Mesin Gosok'
                                        },
                                        {
                                            name: 'Beban BBM Solar & Logistik Armada Truk/L300',
                                            sum: bbmSum,
                                            category: 'BBM & Logistik Armada',
                                            budget: 6000000,
                                            icon: Fuel,
                                            desc: 'Armada Truk Engkel, L300 & Klaim Operasional Supir'
                                        },
                                        {
                                            name: 'Beban Gaji Staf, Upah & Uang Lembur',
                                            sum: gajiSum,
                                            category: 'Gaji & Upah Lembur',
                                            budget: 22000000,
                                            icon: Users,
                                            desc: 'Gaji operator mesin pabrik, supir & admin toko'
                                        },
                                        {
                                            name: 'Pemeliharaan Mesin Gosok/Bevel & Servis Armada',
                                            sum: servisSum,
                                            category: 'Perawatan Mesin',
                                            budget: 4000000,
                                            icon: Wrench,
                                            desc: 'Penggantian oli spindle mesin bevel & servis armada'
                                        },
                                        {
                                            name: 'Pengadaan Alat Penunjang & Mata Bor Pabrik',
                                            sum: alatSum,
                                            category: 'Alat & Mesin',
                                            budget: 8000000,
                                            icon: Package,
                                            desc: 'Mata bor diamond, piringan poles slepan & safety suction'
                                        },
                                        {
                                            name: 'Operasional Kantor Toko, Wifi & ATK',
                                            sum: kantorSum,
                                            category: 'Operasional Kantor',
                                            budget: 2500000,
                                            icon: Building2,
                                            desc: 'Internet fiber optic, ATK surat jalan & kasir toko'
                                        },
                                        ...(otherOpexSum > 0 ? [{
                                            name: 'Beban Operasional Lainnya & Penyesuaian Kas',
                                            sum: otherOpexSum,
                                            category: 'semua',
                                            budget: otherOpexSum,
                                            icon: CreditCard,
                                            desc: 'Biaya operasional lainnya yang tercatat di pembukuan'
                                        }] : [])
                                    ].map((item, idx) => {
                                        const Icon = item.icon;
                                        const sharePct = totalOpex > 0 ? ((item.sum / totalOpex) * 100).toFixed(1) : '0.0';
                                        const budgetPct = Math.round((item.sum / item.budget) * 100);
                                        const isBudgetSafe = budgetPct <= 100;

                                        return (
                                            <tr key={idx} className="hover:bg-slate-50/70 transition">
                                                <td className="py-2.5 px-3">
                                                    <div className="flex items-start gap-2.5">
                                                        <Icon className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="font-bold text-slate-800">• {item.name}</span>
                                                                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-purple-50 text-purple-700 border border-purple-200 rounded">
                                                                    {sharePct}% OPEX
                                                                </span>
                                                                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                                                                    isBudgetSafe 
                                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                                                        : 'bg-rose-50 text-rose-700 border-rose-200'
                                                                }`}>
                                                                    Plafon: Rp {(item.budget / 1000000).toFixed(1)}M ({budgetPct}% {isBudgetSafe ? 'Aman' : 'Over'})
                                                                </span>
                                                            </div>
                                                            <div className="text-[10px] text-slate-500 mt-0.5">
                                                                {item.desc}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-2.5 px-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <span className="text-slate-800 font-mono font-bold">
                                                            Rp {item.sum.toLocaleString('id-ID')}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDrilldownOpex(item.category)}
                                                            title="Lihat rincian transaksi pengeluaran pos ini"
                                                            className="text-[10px] text-[#1b68b0] hover:text-[#15528c] bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded font-mono transition cursor-pointer"
                                                        >
                                                            Rincian
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    <tr className="bg-purple-50/50 font-extrabold text-purple-900 border-t border-purple-200">
                                        <td className="py-3 px-3 text-sm">TOTAL BEBAN OPERASIONAL (OPEX)</td>
                                        <td className="py-3 px-3 text-right text-base font-mono">
                                            Rp {totalOpex.toLocaleString('id-ID')}
                                        </td>
                                    </tr>

                                    {/* LABA / RUGI BERSIH */}
                                    <tr className={`font-black text-base border-t-2 transition ${
                                        isProfitable 
                                            ? 'bg-emerald-50 text-emerald-900 border-emerald-300' 
                                            : 'bg-rose-50 text-rose-900 border-rose-300'
                                    }`}>
                                        <td className="py-4 px-3">
                                            <div className="flex items-center gap-2.5">
                                                {isProfitable ? <Award className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
                                                <div>
                                                    <div className="tracking-wide">
                                                        {isProfitable ? 'LABA BERSIH USAHA (NET OPERATING PROFIT)' : 'RUGI BERSIH USAHA (NET OPERATING LOSS)'}
                                                    </div>
                                                    <div className="text-[10px] font-normal text-slate-500 font-mono mt-0.5">
                                                        {isProfitable 
                                                            ? 'Laba operasional bersih setelah dikurangi seluruh Uang Modal dan Beban Usaha'
                                                            : 'Defisit Terjadi: Total Beban (Uang Modal + OPEX) melampaui omzet riil berjalan'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-3 text-right font-mono">
                                            <div className="flex items-center justify-end gap-2.5">
                                                <span className="text-base sm:text-lg">
                                                    Rp {netProfitVal.toLocaleString('id-ID')}
                                                </span>
                                                <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                                                    isProfitable 
                                                        ? 'bg-emerald-600 text-white' 
                                                        : 'bg-rose-600 text-white'
                                                }`}>
                                                    {netMarginPct}% {isProfitable ? 'NET' : 'DEFISIT'}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* ALERT DEFISIT USAHA JIKA NEGATIF */}
                        {!isProfitable && (
                            <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs">
                                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <h4 className="font-bold text-rose-900">Peringatan Keuangan: Defisit Usaha Terdeteksi</h4>
                                    <p className="text-slate-600 leading-relaxed">
                                        Total beban operasional (Rp {totalOpex.toLocaleString('id-ID')}) dan HPP pengadaan bahan (Rp {totalCogs.toLocaleString('id-ID')}) melebihi pendapatan berjalan. 
                                        Rekomendasi tindakan mitigasi:
                                    </p>
                                    <ul className="list-disc list-inside text-slate-600 space-y-0.5 pt-1">
                                        <li>Percepat penagihan piutang COD supir (saat ini tercatat <strong className="text-rose-700">Rp {pendingCodVal.toLocaleString('id-ID')}</strong>).</li>
                                        <li>Tingkatkan utilisasi bahan kaca sisa rak (scrap) senilai estimasi <strong className="text-[#1b68b0]">Rp {(metrics.scrapGlassLoss || 0).toLocaleString('id-ID')}</strong> untuk menghemat HPP.</li>
                                        <li>Lakukan efisiensi pada pos beban listrik mesin dan BBM logistik armada.</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* FINANCIAL HEALTH & RATIOS SIDEBAR */}
                    <div className="space-y-4">
                        {/* RATIOS CARD */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                            <h3 className="font-bold text-[#242222] text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                                <Shield className="w-4 h-4 text-[#1b68b0]" />
                                <span>Rasio Kesehatan Finansial Usaha</span>
                            </h3>

                            <div className="space-y-3 text-xs">
                                <div>
                                    <div className="flex justify-between text-slate-700 mb-1">
                                        <span>Gross Profit Margin</span>
                                        <strong className="text-emerald-700 font-mono">{grossMarginPct}%</strong>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                        <div className="bg-[#70b03c] h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, grossMarginPct))}%` }} />
                                    </div>
                                    <span className="text-[10px] text-slate-500">Benchmark industri kaca: 30% - 45% (Sangat Baik)</span>
                                </div>

                                <div>
                                    <div className="flex justify-between text-slate-700 mb-1">
                                        <span>Net Profit Margin</span>
                                        <strong className={`font-mono ${isProfitable ? 'text-[#1b68b0]' : 'text-rose-600'}`}>
                                            {netMarginPct}%
                                        </strong>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-500 ${isProfitable ? 'bg-[#1b68b0]' : 'bg-rose-500'}`} 
                                            style={{ width: `${Math.min(100, Math.max(0, Math.abs(netMarginPct) * 1.5))}%` }} 
                                        />
                                    </div>
                                    <span className="text-[10px] text-slate-500">
                                        {isProfitable ? 'Efisiensi konversi omset menjadi laba bersih riil' : 'Terjadi defisit margin operasional'}
                                    </span>
                                </div>

                                <div>
                                    <div className="flex justify-between text-slate-700 mb-1">
                                        <span>Operating Expense Ratio (OER)</span>
                                        <strong className={`font-mono ${totalRev > 0 && (totalOpex / totalRev) <= 0.35 ? 'text-purple-700' : 'text-amber-700'}`}>
                                            {totalRev > 0 ? ((totalOpex / totalRev) * 100).toFixed(1) : 0}%
                                        </strong>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                        <div className={`h-full rounded-full ${totalRev > 0 && (totalOpex / totalRev) <= 0.35 ? 'bg-purple-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(100, (totalOpex / (totalRev || 1)) * 100)}%` }} />
                                    </div>
                                    <span className="text-[10px] text-slate-500">
                                        {totalRev > 0 && (totalOpex / totalRev) <= 0.35 ? 'Beban operasional pabrik terkontrol aman (< 35%)' : 'Rasio beban operasional terhadap omzet perlu dievaluasi'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* CASH FLOW STABILITY CARD */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
                            <h4 className="font-bold text-[#242222] text-xs flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-emerald-600" />
                                <span>Posisi Likuiditas & Arus Kas Riil</span>
                            </h4>
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs font-mono">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Total Kas Masuk Riil:</span>
                                    <strong className="text-emerald-700">Rp {paidRev.toLocaleString('id-ID')}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Total Kas Keluar Belanja:</span>
                                    <strong className="text-rose-600">Rp {grandTotalExpenses.toLocaleString('id-ID')}</strong>
                                </div>
                                <div className="flex justify-between border-t border-slate-200 pt-2">
                                    <span className="text-slate-700 font-bold">Net Saldo Kas Riil:</span>
                                    <strong className={`font-extrabold ${paidRev - grandTotalExpenses >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                                        Rp {(paidRev - grandTotalExpenses).toLocaleString('id-ID')}
                                    </strong>
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-500">
                                Total Piutang Pelanggan sebesar <strong className="text-rose-600">Rp {pendingCodVal.toLocaleString('id-ID')}</strong> dalam proses pelunasan.
                            </p>
                        </div>

                        {/* SCRAP GLASS WASTE EFFICIENCY CARD */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
                            <h4 className="font-bold text-[#242222] text-xs flex items-center gap-2">
                                <Recycle className="w-4 h-4 text-emerald-600" />
                                <span>Efisiensi Limbah & Scrap Kaca Manufaktur</span>
                            </h4>
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs font-mono">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Total Potongan di Rak:</span>
                                    <strong className="text-purple-700">{metrics.scrapCount || scrapGlasses.length} Potongan</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Estimasi Nilai Material:</span>
                                    <strong className="text-rose-600">Rp {(metrics.scrapGlassLoss || (scrapGlasses.length * 125000)).toLocaleString('id-ID')}</strong>
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-500">
                                Divisi HT/GM/BV/Etsa diarahkan memanfaatkan sisa kaca rak untuk pesanan kecil guna menghemat pengeluaran bahan baru ke supplier.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* SUB-TAB 4: BEBAN OPERASIONAL PABRIK & TOKO (OPEX) */}
            {financeSubTab === 'opex' && (
                <div className="space-y-4">
                    {/* KARTU FILTER CEPAT KATEGORI OPEX (KLIK UNTUK FILTER) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                        {[
                            {
                                id: 'semua',
                                label: 'Semua Beban OPEX',
                                sum: listrikSum + bbmSum + gajiSum + servisSum + kantorSum + otherOpexSum,
                                sub: `${opexTransactionsAll.length} Transaksi Operasional`,
                                color: 'text-purple-700',
                                count: opexTransactionsAll.length,
                            },
                            {
                                id: 'Listrik & Energi Pabrik',
                                label: 'Listrik & Mesin Pabrik',
                                sum: listrikSum,
                                sub: 'PLN Daya Industri 33 kVA',
                                color: 'text-amber-700',
                                count: opexTransactionsAll.filter(t => t.category === 'Listrik & Energi Pabrik').length,
                            },
                            {
                                id: 'BBM & Logistik Armada',
                                label: 'BBM Solar & Tol Armada',
                                sum: bbmSum,
                                sub: 'Truk Engkel, L300 & Blindvan',
                                color: 'text-[#1b68b0]',
                                count: opexTransactionsAll.filter(t => t.category === 'BBM & Logistik Armada' || t.category === 'BBM Armada').length,
                            },
                            {
                                id: 'Gaji & Upah Lembur',
                                label: 'Gaji Pokok & Upah Lembur',
                                sum: gajiSum,
                                sub: 'Divisi HT, GM, BV, Etsa & Supir',
                                color: 'text-purple-700',
                                count: opexTransactionsAll.filter(t => t.category === 'Gaji & Upah Lembur').length,
                            },
                            {
                                id: 'Servis & Kantor',
                                label: 'Servis Mesin & Kantor',
                                sum: servisSum + kantorSum,
                                sub: 'Maintenance conveyor & ATK',
                                color: 'text-rose-600',
                                count: opexTransactionsAll.filter(t => t.category === 'Perawatan Mesin' || t.category === 'Operasional Kantor' || t.category === 'Biaya Sewa & Pajak').length,
                            },
                        ].map((card) => {
                            const isSelected = opexCategoryFilter === card.id;
                            return (
                                <button
                                    key={card.id}
                                    type="button"
                                    onClick={() => setOpexCategoryFilter(card.id)}
                                    className={`text-left bg-white rounded-2xl p-4 shadow-xs transition cursor-pointer ${
                                        isSelected
                                            ? 'border-2 border-[#1b68b0] bg-blue-50/30'
                                            : 'border border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-1">
                                        <span className="text-xs font-bold text-slate-500 truncate">{card.label}</span>
                                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
                                            {card.count} Trx
                                        </span>
                                    </div>
                                    <h4 className={`text-lg font-black font-mono mt-1 ${card.color}`}>
                                        Rp {Number(card.sum || 0).toLocaleString('id-ID')}
                                    </h4>
                                    <span className="text-[10px] text-slate-400 block mt-0.5">{card.sub}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* PANEL FILTER KATEGORI & PENCARIAN BEBAN OPERASIONAL (OPEX) */}
                    <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs space-y-3">
                        <div className="flex flex-wrap justify-between items-center gap-3">
                            <div>
                                <h3 className="font-bold text-[#242222] text-sm flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-purple-600" />
                                    <span>Rincian Beban Operasional Usaha (Operational Expenditure)</span>
                                </h3>
                                <p className="text-xs text-slate-500">Filter dan cari pengeluaran biaya operasional pabrik & toko berdasarkan kategori beban</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleOpenPrintModal('opex')}
                                    className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                                >
                                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Cetak Rincian</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleOpenFinanceModal('biaya_operasional')}
                                    className="px-4 py-2 bg-[#70b03c] hover:bg-[#5f9733] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Catat Beban OPEX</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100">
                            <div className="flex items-center gap-1.5">
                                <Filter className="w-4 h-4 text-[#1b68b0] shrink-0" />
                                <select
                                    value={opexCategoryFilter}
                                    onChange={(e) => setOpexCategoryFilter(e.target.value)}
                                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:border-[#1b68b0] focus:bg-white cursor-pointer"
                                >
                                    <option value="semua">Semua Kategori Beban OPEX</option>
                                    <option value="Listrik & Energi Pabrik">Kategori: Listrik & Energi Pabrik</option>
                                    <option value="BBM & Logistik Armada">Kategori: BBM Solar & Logistik Armada</option>
                                    <option value="Gaji & Upah Lembur">Kategori: Gaji Pokok & Upah Lembur</option>
                                    <option value="Perawatan Mesin">Kategori: Perawatan & Servis Mesin</option>
                                    <option value="Operasional Kantor">Kategori: Operasional Kantor & ATK</option>
                                    <option value="Biaya Sewa & Pajak">Kategori: Biaya Sewa & Pajak</option>
                                    <option value="Servis & Kantor">Gabungan: Servis Mesin & Kantor</option>
                                </select>
                            </div>

                            <div className="relative flex-1 min-w-[220px]">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Cari deskripsi beban, no. bukti, penerima, atau catatan..."
                                    value={opexSearchTerm}
                                    onChange={(e) => setOpexSearchTerm(e.target.value)}
                                    className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 font-mono w-full focus:border-[#1b68b0] focus:bg-white focus:outline-none"
                                />
                            </div>

                            {(opexCategoryFilter !== 'semua' || opexSearchTerm !== '') && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setOpexCategoryFilter('semua');
                                        setOpexSearchTerm('');
                                    }}
                                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
                                >
                                    <X className="w-3.5 h-3.5" />
                                    <span>Reset Filter</span>
                                </button>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                            <div className="text-slate-600">
                                Menampilkan <strong className="text-[#1b68b0] font-mono">{filteredOpexTransactions.length}</strong> transaksi beban operasional
                                {opexCategoryFilter !== 'semua' && (
                                    <span> pada kategori: <strong className="text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">{opexCategoryFilter}</strong></span>
                                )}
                            </div>
                            <div className="font-mono text-xs">
                                Total Nominal Filter OPEX: <strong className="text-rose-600 font-black">Rp {Number(filteredOpexTotal).toLocaleString('id-ID')}</strong>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-slate-50 text-slate-500 font-mono font-bold uppercase border-b border-slate-200 text-[11px]">
                                    <tr>
                                        <th className="py-3 px-4">No. Bukti</th>
                                        <th className="py-3 px-4">Tanggal</th>
                                        <th className="py-3 px-4">Kategori Beban</th>
                                        <th className="py-3 px-4">Deskripsi Biaya</th>
                                        <th className="py-3 px-4">Penerima / Lembaga</th>
                                        <th className="py-3 px-4 text-right">Nominal (Rp)</th>
                                        <th className="py-3 px-4 text-center">Metode</th>
                                        <th className="py-3 px-4 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                                    {filteredOpexTransactions.map((trx) => (
                                        <tr key={trx.id} className="hover:bg-slate-50 transition">
                                            <td className="py-3 px-4 font-bold text-purple-700">{trx.transaction_code}</td>
                                            <td className="py-3 px-4 text-slate-500">{trx.transaction_date}</td>
                                            <td className="py-3 px-4">
                                                <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded text-[10px] font-bold">
                                                    {trx.category}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 font-sans font-semibold text-[#242222]">
                                                <div>{trx.title}</div>
                                                {trx.notes && (
                                                    <div className="text-[11px] text-slate-500 font-normal mt-0.5">{trx.notes}</div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 font-sans text-slate-600">{trx.supplier_name || '-'}</td>
                                            <td className="py-3 px-4 text-right font-black text-rose-600">
                                                Rp {Number(trx.amount).toLocaleString('id-ID')}
                                            </td>
                                            <td className="py-3 px-4 text-center text-slate-600">{trx.payment_method}</td>
                                            <td className="py-3 px-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {trx.receipt_photo_path && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenSketchLightbox(trx.receipt_photo_path, `Nota OPEX: ${trx.title}`, {
                                                                type: 'payment',
                                                                badge: 'Nota Bukti Biaya Operasional',
                                                                subtitle: `${trx.transaction_code} • ${trx.category} • Rp ${Number(trx.amount || 0).toLocaleString('id-ID')}`,
                                                                description: trx.notes || trx.title,
                                                            })}
                                                            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-[#1b68b0] border border-blue-200 font-sans font-bold rounded-lg text-[10px] flex items-center gap-1 transition cursor-pointer"
                                                            title="Lihat Nota Bukti Pembayaran"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                            <span>Nota</span>
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteFinanceTransaction(trx)}
                                                        title="Hapus Data Transaksi"
                                                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 cursor-pointer transition"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredOpexTransactions.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="text-center py-8 text-slate-500 font-sans">
                                                Tidak ada data beban operasional yang cocok dengan kategori / pencarian yang dipilih.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* SUB-TAB 5: BUKU KAS & RIWAYAT MUTASI LENGKAP (LEDGER TERPADU) */}
            {financeSubTab === 'ledger' && (
                <div className="space-y-4">
                    {/* RINGKASAN CEPAT PER KATEGORI MUTASI (KLIK UNTUK FILTER) */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {[
                            { id: 'semua', label: 'Semua Riwayat Mutasi', sum: grandTotalExpenses, count: financeTransactionsList.length, color: 'text-[#1b68b0]' },
                            { id: 'pembelian_bahan', label: 'Pembelian Bahan Kaca', sum: bahanKacaSum, count: financeTransactionsList.filter(t => t.type === 'pembelian_bahan').length, color: 'text-amber-700' },
                            { id: 'pembelian_aksesoris', label: 'Pembelian Aksesoris', sum: aksesorisSum, count: financeTransactionsList.filter(t => t.type === 'pembelian_aksesoris').length, color: 'text-[#1b68b0]' },
                            { id: 'pembelian_alat', label: 'Alat, Mesin & Sparepart', sum: alatSum, count: financeTransactionsList.filter(t => t.type === 'pembelian_alat').length, color: 'text-purple-700' },
                            { id: 'biaya_operasional', label: 'Beban Operasional (OPEX)', sum: totalOpex - alatSum, count: financeTransactionsList.filter(t => t.type === 'biaya_operasional').length, color: 'text-rose-600' },
                        ].map(card => {
                            const isSelected = financeCategoryFilter === card.id;
                            return (
                                <button
                                    key={card.id}
                                    type="button"
                                    onClick={() => {
                                        setFinanceCategoryFilter(card.id);
                                        setLedgerItemFilter('semua');
                                    }}
                                    className={`text-left p-3.5 rounded-2xl border transition cursor-pointer shadow-2xs ${
                                        isSelected
                                            ? 'bg-blue-50/50 border-2 border-[#1b68b0]'
                                            : 'bg-white border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-1">
                                        <span className="text-[11px] font-bold text-slate-500 truncate">{card.label}</span>
                                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
                                            {card.count} Trx
                                        </span>
                                    </div>
                                    <div className={`text-sm sm:text-base font-black font-mono mt-1 ${card.color}`}>
                                        Rp {Number(card.sum || 0).toLocaleString('id-ID')}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* PANEL PENCARIAN & FILTER BERDASARKAN KATEGORI DAN SPESIFIK BARANG A / B */}
                    <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs space-y-3">
                        <div className="flex flex-wrap justify-between items-center gap-3">
                            <div className="flex flex-wrap items-center gap-2.5 flex-1">
                                {/* 1. Pilih Kategori Utama */}
                                <div className="flex items-center gap-1.5">
                                    <Filter className="w-4 h-4 text-[#1b68b0] shrink-0" />
                                    <select
                                        value={financeCategoryFilter}
                                        onChange={e => {
                                            setFinanceCategoryFilter(e.target.value);
                                            setLedgerItemFilter('semua');
                                        }}
                                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:border-[#1b68b0] focus:bg-white cursor-pointer"
                                    >
                                        <option value="semua">Semua Kategori Riwayat</option>
                                        <option value="pembelian_bahan">Kategori: Pembelian Bahan Baku Kaca</option>
                                        <option value="pembelian_aksesoris">Kategori: Pembelian Aksesoris Kaca</option>
                                        <option value="pembelian_alat">Kategori: Pembelian Alat, Mesin & Sparepart</option>
                                        <option value="biaya_operasional">Kategori: Beban Operasional (OPEX)</option>
                                    </select>
                                </div>

                                {/* 2. Pilih Spesifik Jenis Barang / Bahan Baku A atau B */}
                                <select
                                    value={ledgerItemFilter}
                                    onChange={e => setLedgerItemFilter(e.target.value)}
                                    className="bg-blue-50/50 border border-blue-200 rounded-xl px-3 py-2 text-xs text-[#1b68b0] font-bold focus:border-[#1b68b0] focus:bg-white cursor-pointer max-w-xs"
                                    title="Filter khusus untuk menampilkan riwayat barang A saja atau barang B saja"
                                >
                                    <option value="semua">
                                        {financeCategoryFilter === 'pembelian_bahan'
                                            ? '-- Semua Jenis Bahan Baku Kaca --'
                                            : financeCategoryFilter === 'pembelian_aksesoris'
                                                ? '-- Semua Jenis Aksesoris --'
                                                : financeCategoryFilter === 'pembelian_alat'
                                                    ? '-- Semua Alat & Peralatan Gudang --'
                                                    : '-- Pilih Spesifik Barang / Bahan (Semua) --'}
                                    </option>
                                    {specificItemOptions.map((opt, idx) => (
                                        <option key={`${opt.value}-${idx}`} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>

                                {/* 3. Input Pencarian Bebas */}
                                <div className="relative flex-1 min-w-[200px]">
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Ketik nama bahan baku, kode PO, nama supplier, atau no faktur..."
                                        value={financeSearchTerm}
                                        onChange={e => setFinanceSearchTerm(e.target.value)}
                                        className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 font-mono w-full focus:border-[#1b68b0] focus:bg-white focus:outline-none"
                                    />
                                </div>

                                {(financeCategoryFilter !== 'semua' || ledgerItemFilter !== 'semua' || financeSearchTerm !== '') && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFinanceCategoryFilter('semua');
                                            setLedgerItemFilter('semua');
                                            setFinanceSearchTerm('');
                                        }}
                                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                        <span>Reset Filter</span>
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleOpenPrintModal('ledger')}
                                    className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                                >
                                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Cetak Buku Kas</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleOpenFinanceModal(financeCategoryFilter !== 'semua' ? financeCategoryFilter : 'pembelian_bahan')}
                                    className="px-4 py-2 bg-[#70b03c] hover:bg-[#5f9733] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Catat Transaksi Baru</span>
                                </button>
                            </div>
                        </div>

                        {/* INFO HASIL FILTER SPESIFIK BARANG */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                            <div className="text-slate-600">
                                Menampilkan <strong className="text-[#1b68b0] font-mono">{filteredTransactions.length}</strong> transaksi
                                {ledgerItemFilter !== 'semua' && (
                                    <span> untuk barang/item: <strong className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{ledgerItemFilter}</strong></span>
                                )}
                            </div>
                            <div className="font-mono text-xs">
                                Total Nominal Hasil Filter: <strong className="text-rose-600 font-black">Rp {Number(filteredLedgerTotal).toLocaleString('id-ID')}</strong>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-slate-50 text-slate-500 font-mono font-bold uppercase border-b border-slate-200 text-[11px]">
                                    <tr>
                                        <th className="py-3 px-4">No. Referensi</th>
                                        <th className="py-3 px-4">Tanggal</th>
                                        <th className="py-3 px-4">Asal & Kategori</th>
                                        <th className="py-3 px-4">Deskripsi Transaksi</th>
                                        <th className="py-3 px-4">Pihak Terkait</th>
                                        <th className="py-3 px-4">Metode Bayar</th>
                                        <th className="py-3 px-4 text-right">Keluar / Masuk (Rp)</th>
                                        <th className="py-3 px-4 text-center">Status</th>
                                        <th className="py-3 px-4 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                                    {filteredTransactions.map((trx) => (
                                        <tr key={trx.id} className="hover:bg-slate-50 transition">
                                            <td className="py-3 px-4 font-bold text-[#1b68b0]">{trx.transaction_code}</td>
                                            <td className="py-3 px-4 text-slate-500">{trx.transaction_date}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold w-fit ${
                                                        trx.type === 'pembelian_bahan' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                                                        trx.type === 'pembelian_aksesoris' ? 'bg-blue-50 text-[#1b68b0] border border-blue-200' :
                                                        trx.type === 'pembelian_alat' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                                                        'bg-slate-100 text-slate-700 border border-slate-200'
                                                    }`}>
                                                        {trx.category}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 font-sans flex items-center gap-1">
                                                        {trx.source_role === 'driver' ? 'Supir' :
                                                         trx.source_role === 'admin_gudang' ? 'Gudang' :
                                                         trx.source_role === 'admin_toko' ? 'Toko' : 'Manajemen'}
                                                        {trx.vehicle_plate && <span className="text-amber-700 font-mono">({trx.vehicle_plate.split(' ')[0]})</span>}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 font-sans font-semibold text-[#242222]">
                                                <div>{trx.title}</div>
                                                {String(trx.notes || '').replace(/\[RESTOCK_[^\]]+\]\s*/g, '') && (
                                                    <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                                                        {String(trx.notes || '').replace(/\[RESTOCK_[^\]]+\]\s*/g, '')}
                                                    </div>
                                                )}
                                                {trx.invoice_number && <div className="text-[10px] text-slate-400 font-mono mt-0.5">No. Faktur: {trx.invoice_number}</div>}
                                            </td>
                                            <td className="py-3 px-4 font-sans text-slate-600">{trx.supplier_name || '-'}</td>
                                            <td className="py-3 px-4 text-slate-600">{trx.payment_method}</td>
                                            <td className="py-3 px-4 text-right font-black text-rose-600">
                                                - Rp {Number(trx.amount).toLocaleString('id-ID')}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {trx.approval_status === 'pending' ? (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                                        Pending
                                                    </span>
                                                ) : trx.approval_status === 'rejected' ? (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                        Ditolak
                                                    </span>
                                                ) : (
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${trx.payment_status === 'Lunas' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
                                                        {trx.payment_status}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {trx.receipt_photo_path && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenSketchLightbox(trx.receipt_photo_path, `Nota Pembayaran: ${trx.title}`, {
                                                                type: 'payment',
                                                                badge: 'Nota Bukti Pembayaran Finance',
                                                                subtitle: `${trx.transaction_code} • ${trx.supplier_name || '-'} • Rp ${Number(trx.amount || 0).toLocaleString('id-ID')}`,
                                                                description: String(trx.notes || '').replace(/\[RESTOCK_[^\]]+\]\s*/g, '') || trx.title,
                                                            })}
                                                            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-[#1b68b0] border border-blue-200 font-sans font-bold rounded-lg text-[10px] flex items-center gap-1 transition cursor-pointer"
                                                            title="Lihat Nota Bukti Pembayaran"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                            <span>Nota</span>
                                                        </button>
                                                    )}
                                                    {trx.approval_status === 'pending' && (userRole === 'owner' || userRole === 'finance' || userRole === 'admin_finance') && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApproveClaim(trx)}
                                                                title="Setujui & Input Nota Pembayaran"
                                                                className="text-emerald-700 hover:text-emerald-800 p-1 rounded-lg hover:bg-emerald-50 cursor-pointer"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleRejectClaim(trx.id)}
                                                                title="Tolak Pengajuan"
                                                                className="text-rose-600 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 cursor-pointer"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteFinanceTransaction(trx)}
                                                        title="Hapus Data Transaksi"
                                                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 cursor-pointer transition"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredTransactions.length === 0 && (
                                        <tr>
                                            <td colSpan={9} className="text-center py-8 text-slate-500">
                                                Tidak ada data transaksi yang cocok dengan pencarian / filter.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL RINCIAN DETAIL ORDER OMZET (MUNCUL SAAT BARIS OMZET DIKLIK) */}
            <OrderOmzetDetailModal
                show={Boolean(selectedOmzetDetailOrder)}
                onClose={() => setSelectedOmzetDetailOrder(null)}
                order={selectedOmzetDetailOrder}
            />
        </div>
    );
}
