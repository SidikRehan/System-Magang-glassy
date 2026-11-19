import React, { useState, useEffect, useMemo } from 'react';
import { router } from '@inertiajs/react';
import {
    Award, X, Calendar, TrendingUp, Package, Zap, CheckCircle2,
    FileText, Eye, Plus, ArrowLeft, Calculator, Loader2, Filter, Printer
} from 'lucide-react';

const INDONESIAN_MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const formatPeriodLabel = (ymStr) => {
    if (!ymStr || !ymStr.includes('-')) return ymStr || '-';
    const [yyyy, mm] = ymStr.split('-');
    const mIdx = parseInt(mm, 10) - 1;
    const mName = INDONESIAN_MONTHS[mIdx] || mm;
    return `${mName} ${yyyy}`;
};

export default function MonthlyNetProfitRecapModal({
    isOpen,
    onClose,
    ordersList = [],
    financeTransactionsList = [],
    sheetGlasses = [],
    accessoriesList = [],
    initialViewMode = 'list', // 'list' | 'form' | 'detail'
    activeRecapPeriod = null,
    onSelectRecapPeriod,
    inline = false,
    hideCloseButton = false,
    titleOverride = null,
}) {
    const currentYm = useMemo(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }, []);

    const [viewMode, setViewMode] = useState(initialViewMode);
    const [selectedPeriod, setSelectedPeriod] = useState(activeRecapPeriod || currentYm);
    const [selectedYear, setSelectedYear] = useState(() => currentYm.split('-')[0] || '2026');
    const [monthFilterMode, setMonthFilterMode] = useState('active'); // 'active' | 'all_12'
    const [customRevenue, setCustomRevenue] = useState('');
    const [customModalCogs, setCustomModalCogs] = useState('');
    const [customOpex, setCustomOpex] = useState('');
    const [recapNotes, setRecapNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [detailItem, setDetailItem] = useState(null);

    // Kalkulasi estimasi modal bahan & keuntungan per orderan selesai
    const estimateOrderProfit = (ord) => {
        const rev = Number(ord?.total_price || 0);
        if (!ord || ord.is_company_use || rev <= 0) {
            return { revenue: 0, modalCost: 0, profit: 0 };
        }
        const items = Array.isArray(ord.items) && ord.items.length > 0
            ? ord.items
            : [{
                glass_type: ord.glass_type || 'Kaca Polos 5mm',
                length_cm: ord.length_cm || 100,
                width_cm: ord.width_cm || 100,
                qty: ord.qty || 1,
                base_glass_price: ord.subtotal || rev,
            }];

        let glassModal = 0;
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
                glassModal += Math.round(areaM2 * modalPerM2);
            } else {
                const baseSell = Number(it.base_glass_price || 0);
                glassModal += baseSell > 0 ? Math.round(baseSell * 0.55) : Math.round(rev * 0.45);
            }
        });

        let accModal = 0;
        if (Array.isArray(ord.accessories)) {
            ord.accessories.forEach(acc => {
                if (typeof acc === 'object' && acc !== null) {
                    const aQty = Math.max(1, Number(acc.qty || 1));
                    const matchedAcc = (accessoriesList || []).find(a => a && (a.id === acc.id || a.name === acc.name));
                    const buyP = matchedAcc && Number(matchedAcc.buy_price) > 0
                        ? Number(matchedAcc.buy_price)
                        : Math.round(Number(acc.price || 0) * 0.65);
                    accModal += buyP * aQty;
                }
            });
        }

        const totalModal = Math.min(Math.round(rev * 0.85), glassModal + accModal);
        return {
            revenue: rev,
            modalCost: totalModal,
            profit: Math.max(0, rev - totalModal),
        };
    };

    // Hitung data otomatis untuk suatu bulan (YYYY-MM) dari SPO Selesai (Riwayat) dan Transaksi Finance
    const computePeriodStats = (ym) => {
        const completedOrders = (ordersList || []).filter(o => {
            if (!o || o.status !== 'selesai') return false;
            const rawDate = String(o.delivered_at || o.order_date || o.created_at || '');
            return rawDate.startsWith(ym);
        });

        const approvedTrx = (financeTransactionsList || []).filter(t => {
            if (!t || t.approval_status !== 'approved' || t.type === 'rekap_bulanan') return false;
            const rawDate = String(t.transaction_date || '');
            return rawDate.startsWith(ym);
        });

        const spoRev = completedOrders.reduce((s, o) => s + (Number(o.total_price) || 0), 0);
        const orderProfitSum = completedOrders.reduce((s, o) => s + estimateOrderProfit(o).profit, 0);
        const otherRev = approvedTrx.filter(t => t.type === 'pemasukan_lain').reduce((s, t) => s + (Number(t.amount) || 0), 0);
        const revenue = spoRev + otherRev;

        const cogsTrx = approvedTrx.filter(t => t.type === 'pembelian_bahan' || t.type === 'pembelian_aksesoris');
        const opexTrx = approvedTrx.filter(t => t.type === 'biaya_operasional' || t.type === 'pembelian_alat');

        const cogs = cogsTrx.reduce((s, t) => s + (Number(t.amount) || 0), 0);
        const opex = opexTrx.reduce((s, t) => s + (Number(t.amount) || 0), 0);
        const totalExpense = cogs + opex;
        const netProfit = revenue - totalExpense;
        const marginPct = revenue > 0 ? ((netProfit / revenue) * 100).toFixed(1) : '0.0';

        return {
            period: ym,
            periodLabel: formatPeriodLabel(ym),
            revenue,
            orderProfitSum,
            cogs,
            opex,
            totalExpense,
            netProfit,
            marginPct,
            ordersCount: completedOrders.length,
            trxCount: cogsTrx.length + opexTrx.length,
            orders: completedOrders,
            cogsTransactions: cogsTrx,
            opexTransactions: opexTrx,
        };
    };

    // Daftar tahun unik
    const availableYears = useMemo(() => {
        const ySet = new Set([currentYm.split('-')[0] || '2026']);
        (ordersList || []).forEach(o => {
            const y = String(o?.delivered_at || o?.order_date || '').slice(0, 4);
            if (/^\d{4}$/.test(y)) ySet.add(y);
        });
        (financeTransactionsList || []).forEach(t => {
            const y = String(t?.transaction_date || '').slice(0, 4);
            if (/^\d{4}$/.test(y)) ySet.add(y);
        });
        return Array.from(ySet).sort((a, b) => b.localeCompare(a));
    }, [ordersList, financeTransactionsList, currentYm]);

    // Daftar seluruh rekap bulanan (gabungan dari rekap yang sudah disimpan di DB + bulan-bulan yang memiliki transaksi / 12 bulan)
    const allMonthlyRecaps = useMemo(() => {
        const savedRecapTrx = (financeTransactionsList || []).filter(t => t && t.type === 'rekap_bulanan');
        const savedMap = {};

        savedRecapTrx.forEach(t => {
            const ym = t.category || String(t.transaction_date || '').slice(0, 7);
            let parsedMeta = {};
            try {
                if (t.notes && String(t.notes).trim().startsWith('{')) {
                    parsedMeta = JSON.parse(t.notes);
                }
            } catch {
                parsedMeta = {};
            }
            const autoStats = computePeriodStats(ym);
            const rev = parsedMeta.revenue !== undefined ? Number(parsedMeta.revenue) : autoStats.revenue;
            const cogs = parsedMeta.cogs !== undefined ? Number(parsedMeta.cogs) : autoStats.cogs;
            const opex = parsedMeta.opex !== undefined ? Number(parsedMeta.opex) : autoStats.opex;
            const totalExpense = cogs + opex;
            const netProfit = parsedMeta.netProfit !== undefined ? Number(parsedMeta.netProfit) : (rev - totalExpense);
            const marginPct = rev > 0 ? ((netProfit / rev) * 100).toFixed(1) : '0.0';

            savedMap[ym] = {
                ...autoStats,
                id: t.id,
                transaction_code: t.transaction_code,
                isSavedRecap: true,
                recappedAt: t.transaction_date,
                revenue: rev,
                cogs,
                opex,
                totalExpense,
                netProfit,
                marginPct,
                notes: parsedMeta.notes || '',
            };
        });

        const periodSet = new Set([currentYm, ...Object.keys(savedMap)]);
        if (monthFilterMode === 'all_12') {
            for (let m = 1; m <= 12; m++) {
                periodSet.add(`${selectedYear}-${String(m).padStart(2, '0')}`);
            }
        } else {
            (ordersList || []).forEach(o => {
                if (!o || o.status !== 'selesai') return;
                const ym = String(o?.delivered_at || o?.order_date || o?.created_at || '').slice(0, 7);
                if (/^\d{4}-\d{2}$/.test(ym)) periodSet.add(ym);
            });
            (financeTransactionsList || []).forEach(t => {
                if (t?.type === 'rekap_bulanan') return;
                const ym = String(t?.transaction_date || '').slice(0, 7);
                if (/^\d{4}-\d{2}$/.test(ym)) periodSet.add(ym);
            });
        }

        const sortedPeriods = Array.from(periodSet)
            .filter(ym => monthFilterMode === 'all_12' ? ym.startsWith(selectedYear) : true)
            .sort((a, b) => b.localeCompare(a));

        return sortedPeriods.map(ym => {
            if (savedMap[ym]) return savedMap[ym];
            const autoStats = computePeriodStats(ym);
            return {
                ...autoStats,
                isSavedRecap: false,
                notes: 'Kalkulasi otomatis sistem berdasarkan orderan selesai (riwayat) & transaksi keluar bulan ini',
            };
        });
    }, [ordersList, financeTransactionsList, currentYm, monthFilterMode, selectedYear]);

    // Total akumulasi dari seluruh bulan yang tampil di tabel
    const summaryTotals = useMemo(() => {
        return allMonthlyRecaps.reduce((acc, r) => {
            acc.revenue += Number(r.revenue || 0);
            acc.orderProfitSum += Number(r.orderProfitSum || 0);
            acc.cogs += Number(r.cogs || 0);
            acc.opex += Number(r.opex || 0);
            acc.totalExpense += Number(r.totalExpense || 0);
            acc.netProfit += Number(r.netProfit || 0);
            acc.ordersCount += Number(r.ordersCount || 0);
            return acc;
        }, { revenue: 0, orderProfitSum: 0, cogs: 0, opex: 0, totalExpense: 0, netProfit: 0, ordersCount: 0 });
    }, [allMonthlyRecaps]);

    useEffect(() => {
        if (isOpen) {
            setViewMode(initialViewMode || 'list');
            const targetYm = activeRecapPeriod || currentYm;
            setSelectedPeriod(targetYm);
            loadFormForPeriod(targetYm);
        }
    }, [isOpen, initialViewMode, activeRecapPeriod]);

    const loadFormForPeriod = (ym) => {
        const existing = allMonthlyRecaps.find(r => r.period === ym);
        if (existing) {
            setCustomRevenue(String(existing.revenue || 0));
            setCustomModalCogs(String(existing.cogs || 0));
            setCustomOpex(String(existing.opex || 0));
            setRecapNotes(existing.isSavedRecap ? (existing.notes || '') : '');
        } else {
            const stats = computePeriodStats(ym);
            setCustomRevenue(String(stats.revenue || 0));
            setCustomModalCogs(String(stats.cogs || 0));
            setCustomOpex(String(stats.opex || 0));
            setRecapNotes('');
        }
    };

    if (!isOpen) return null;

    const formRevNum = Number(customRevenue) || 0;
    const formCogsNum = Number(customModalCogs) || 0;
    const formOpexNum = Number(customOpex) || 0;
    const formTotalExpenseNum = formCogsNum + formOpexNum;
    const formNetProfitNum = formRevNum - formTotalExpenseNum;

    const handleSaveRecapSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payloadNotes = JSON.stringify({
            period: selectedPeriod,
            revenue: formRevNum,
            cogs: formCogsNum,
            opex: formOpexNum,
            totalExpense: formTotalExpenseNum,
            netProfit: formNetProfitNum,
            notes: recapNotes || `Rekap Laba Bersih Bulan ${formatPeriodLabel(selectedPeriod)}`,
        });

        router.post(route('finance.transactions.store'), {
            type: 'rekap_bulanan',
            category: selectedPeriod,
            title: `Rekap Laba Bersih Bulan ${formatPeriodLabel(selectedPeriod)}`,
            amount: Math.max(0, Math.abs(formNetProfitNum)),
            payment_method: 'Rekapitulasi Pembukuan Bulanan',
            payment_status: 'Lunas',
            approval_status: 'approved',
            transaction_date: `${selectedPeriod}-28`,
            notes: payloadNotes,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
                if (onSelectRecapPeriod) {
                    onSelectRecapPeriod({
                        period: selectedPeriod,
                        periodLabel: formatPeriodLabel(selectedPeriod),
                        revenue: formRevNum,
                        cogs: formCogsNum,
                        opex: formOpexNum,
                        totalExpense: formTotalExpenseNum,
                        netProfit: formNetProfitNum,
                    });
                }
                setViewMode('list');
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    };

    const handlePrintMonthlyRecap = (singleMonthItem = null) => {
        const printWin = window.open('', '_blank', 'width=1050,height=800');
        if (!printWin) {
            window.print();
            return;
        }
        const dateNowStr = new Date().toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });

        let bodyContent = '';
        if (singleMonthItem) {
            const cogsRows = [...(singleMonthItem.cogsTransactions || []), ...(singleMonthItem.opexTransactions || [])]
                .map((trx, idx) => `
                    <tr>
                        <td style="text-align:center;">${idx + 1}</td>
                        <td><strong>${trx.transaction_code || '-'}</strong></td>
                        <td>${trx.transaction_date || '-'}</td>
                        <td>${trx.type === 'pembelian_bahan' || trx.type === 'pembelian_aksesoris' ? 'Uang Modal' : 'Biaya OPEX'} — ${trx.category || '-'}</td>
                        <td>${trx.title || '-'}</td>
                        <td style="text-align:right; font-weight:bold;">Rp ${Number(trx.amount || 0).toLocaleString('id-ID')}</td>
                    </tr>
                `).join('') || `<tr><td colspan="6" style="text-align:center; padding:12px;">Tidak ada transaksi pengeluaran pada bulan ini.</td></tr>`;

            const orderRows = (singleMonthItem.orders || [])
                .map((ord, idx) => {
                    const pOrd = estimateOrderProfit(ord);
                    return `
                        <tr>
                            <td style="text-align:center;">${idx + 1}</td>
                            <td><strong>${ord.spo_number || '-'}</strong></td>
                            <td>${String(ord.delivered_at || ord.order_date || '').split('T')[0].split(' ')[0]}</td>
                            <td>${ord.customer_name || '-'}</td>
                            <td style="text-align:right;">Rp ${pOrd.revenue.toLocaleString('id-ID')}</td>
                            <td style="text-align:right;">Rp ${pOrd.modalCost.toLocaleString('id-ID')}</td>
                            <td style="text-align:right; font-weight:bold; color:#047857;">+ Rp ${pOrd.profit.toLocaleString('id-ID')}</td>
                        </tr>
                    `;
                }).join('') || `<tr><td colspan="7" style="text-align:center; padding:12px;">Tidak ada orderan SPO selesai pada bulan ini.</td></tr>`;

            bodyContent = `
                <div class="sub-header">LAPORAN RINCIAN KEUNTUNGAN & LABA BERSIH BULAN ${String(singleMonthItem.periodLabel || '').toUpperCase()}</div>
                <div class="summary-grid">
                    <div class="summary-box">
                        <div class="label">OMZET BULAN INI (${singleMonthItem.ordersCount} SPO)</div>
                        <div class="val">Rp ${Number(singleMonthItem.revenue || 0).toLocaleString('id-ID')}</div>
                    </div>
                    <div class="summary-box">
                        <div class="label">UANG MODAL (BAHAN & AKSESORIS)</div>
                        <div class="val">Rp ${Number(singleMonthItem.cogs || 0).toLocaleString('id-ID')}</div>
                    </div>
                    <div class="summary-box">
                        <div class="label">BIAYA OPERASIONAL (OPEX)</div>
                        <div class="val">Rp ${Number(singleMonthItem.opex || 0).toLocaleString('id-ID')}</div>
                    </div>
                    <div class="summary-box highlight">
                        <div class="label">KEUNTUNGAN LABA BERSIH (${singleMonthItem.marginPct}%)</div>
                        <div class="val">Rp ${Number(singleMonthItem.netProfit || 0).toLocaleString('id-ID')}</div>
                    </div>
                </div>
                <h4 style="margin:14px 0 6px; font-size:11pt;">1. Rincian Orderan Selesai (Masuk Omzet) & Keuntungan per Order (${singleMonthItem.orders?.length || 0} SPO)</h4>
                <table>
                    <thead>
                        <tr>
                            <th style="width:35px;">No</th>
                            <th>No. SPO</th>
                            <th>Tgl Selesai</th>
                            <th>Pelanggan</th>
                            <th style="text-align:right;">Omzet SPO</th>
                            <th style="text-align:right;">Estimasi Modal</th>
                            <th style="text-align:right;">Keuntungan Order</th>
                        </tr>
                    </thead>
                    <tbody>${orderRows}</tbody>
                </table>
                <h4 style="margin:16px 0 6px; font-size:11pt;">2. Rincian Pengeluaran (Uang Modal & Biaya OPEX) Bulan ${singleMonthItem.periodLabel}</h4>
                <table>
                    <thead>
                        <tr>
                            <th style="width:35px;">No</th>
                            <th>Kode Bukti</th>
                            <th>Tanggal</th>
                            <th>Jenis & Kategori</th>
                            <th>Uraian Transaksi</th>
                            <th style="text-align:right;">Nominal (Rp)</th>
                        </tr>
                    </thead>
                    <tbody>${cogsRows}</tbody>
                </table>
            `;
        } else {
            const rowsHtml = allMonthlyRecaps.map((rec, idx) => `
                <tr>
                    <td style="text-align:center;">${idx + 1}</td>
                    <td><strong>${rec.periodLabel}</strong><br/><span style="font-size:8.5pt; color:#555;">${rec.ordersCount} SPO Selesai • ${rec.trxCount} Trx Keluar</span></td>
                    <td style="text-align:right;">Rp ${Number(rec.revenue || 0).toLocaleString('id-ID')}</td>
                    <td style="text-align:right; color:#0f766e;">+ Rp ${Number(rec.orderProfitSum || 0).toLocaleString('id-ID')}</td>
                    <td style="text-align:right;">Rp ${Number(rec.cogs || 0).toLocaleString('id-ID')}</td>
                    <td style="text-align:right;">Rp ${Number(rec.opex || 0).toLocaleString('id-ID')}</td>
                    <td style="text-align:right;">Rp ${Number(rec.totalExpense || 0).toLocaleString('id-ID')}</td>
                    <td style="text-align:right; font-weight:bold; color:${rec.netProfit >= 0 ? '#047857' : '#be123c'};">Rp ${Number(rec.netProfit || 0).toLocaleString('id-ID')} (${rec.marginPct}%)</td>
                </tr>
            `).join('');

            bodyContent = `
                <div class="sub-header">LAPORAN REKAPITULASI KEUNTUNGAN & LABA BERSIH PERUSAHAAN PER BULAN</div>
                <div class="summary-grid">
                    <div class="summary-box">
                        <div class="label">TOTAL OMZET (${allMonthlyRecaps.length} BULAN)</div>
                        <div class="val">Rp ${summaryTotals.revenue.toLocaleString('id-ID')}</div>
                    </div>
                    <div class="summary-box">
                        <div class="label">TOTAL KEUNTUNGAN ORDER</div>
                        <div class="val">+ Rp ${summaryTotals.orderProfitSum.toLocaleString('id-ID')}</div>
                    </div>
                    <div class="summary-box">
                        <div class="label">TOTAL PENGELUARAN (MODAL + OPEX)</div>
                        <div class="val">Rp ${summaryTotals.totalExpense.toLocaleString('id-ID')}</div>
                    </div>
                    <div class="summary-box highlight">
                        <div class="label">TOTAL LABA BERSIH AKUMULASI</div>
                        <div class="val">Rp ${summaryTotals.netProfit.toLocaleString('id-ID')}</div>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th style="width:32px;">No</th>
                            <th>Bulan & Tahun</th>
                            <th style="text-align:right;">Omzet Bulan Ini</th>
                            <th style="text-align:right;">Keuntungan Order</th>
                            <th style="text-align:right;">Uang Modal</th>
                            <th style="text-align:right;">Biaya OPEX</th>
                            <th style="text-align:right;">Total Pengeluaran</th>
                            <th style="text-align:right;">Keuntungan Laba Bersih</th>
                        </tr>
                    </thead>
                    <tbody>${rowsHtml}</tbody>
                    <tfoot>
                        <tr style="background:#f1f5f9; font-weight:bold;">
                            <td colspan="2">TOTAL AKUMULASI (${allMonthlyRecaps.length} BULAN)</td>
                            <td style="text-align:right;">Rp ${summaryTotals.revenue.toLocaleString('id-ID')}</td>
                            <td style="text-align:right;">+ Rp ${summaryTotals.orderProfitSum.toLocaleString('id-ID')}</td>
                            <td style="text-align:right;">Rp ${summaryTotals.cogs.toLocaleString('id-ID')}</td>
                            <td style="text-align:right;">Rp ${summaryTotals.opex.toLocaleString('id-ID')}</td>
                            <td style="text-align:right;">Rp ${summaryTotals.totalExpense.toLocaleString('id-ID')}</td>
                            <td style="text-align:right;">Rp ${summaryTotals.netProfit.toLocaleString('id-ID')}</td>
                        </tr>
                    </tfoot>
                </table>
            `;
        }

        printWin.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8" />
                <title>Cetak Rekap Laba Bersih Bulanan - CV Cahya Karunia Jaya</title>
                <style>
                    @page { size: A4 landscape; margin: 12mm; }
                    body { font-family: Arial, Helvetica, sans-serif; color: #111; font-size: 9.5pt; margin: 0; padding: 0; }
                    .kop { border-bottom: 3px solid #111; padding-bottom: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; }
                    .kop h1 { margin: 0; font-size: 16pt; letter-spacing: 1px; }
                    .kop p { margin: 2px 0; font-size: 8.5pt; color: #444; }
                    .sub-header { text-align: center; font-weight: bold; font-size: 12pt; margin: 10px 0 12px; text-transform: uppercase; }
                    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 14px; }
                    .summary-box { border: 1px solid #888; border-radius: 6px; padding: 8px 10px; background: #fafafa; }
                    .summary-box.highlight { border: 2px solid #047857; background: #ecfdf5; }
                    .summary-box .label { font-size: 7.5pt; font-weight: bold; color: #555; }
                    .summary-box .val { font-size: 11.5pt; font-weight: bold; margin-top: 3px; font-family: monospace; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 9pt; }
                    th, td { border: 1px solid #999; padding: 6px 8px; }
                    th { background: #f1f5f9; text-transform: uppercase; font-size: 8pt; }
                    .sign-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; text-align: center; margin-top: 24px; font-size: 9pt; }
                    .sign-box { padding-top: 4px; }
                    .sign-space { height: 48px; }
                </style>
            </head>
            <body>
                <div class="kop">
                    <div>
                        <h1>CV CAHYA KARUNIA JAYA</h1>
                        <p>PABRIK PENGOLAHAN & DISTRIBUTOR KACA TEMPERED, BEVEL, CERMIN & HARDWARE</p>
                        <p>Jl. Sunda No. 45, Sumur Bandung, Kota Bandung, Jawa Barat • Telp: (022) 420-9988</p>
                    </div>
                    <div style="text-align:right; font-size:8.5pt;">
                        <strong>DOKUMEN RESMI FINANCE</strong><br/>
                        Tanggal Cetak: ${dateNowStr}
                    </div>
                </div>
                ${bodyContent}
                <div class="sign-grid">
                    <div class="sign-box">
                        <div>Disiapkan Oleh,</div>
                        <strong>Staff Finance & Akuntansi</strong>
                        <div class="sign-space"></div>
                        <div>( ________________________ )</div>
                    </div>
                    <div class="sign-box">
                        <div>Diperiksa Oleh,</div>
                        <strong>Kepala Operasional & Gudang</strong>
                        <div class="sign-space"></div>
                        <div>( ________________________ )</div>
                    </div>
                    <div class="sign-box">
                        <div>Disetujui & Disahkan,</div>
                        <strong>Owner / Direktur Utama</strong>
                        <div class="sign-space"></div>
                        <div>( ________________________ )</div>
                    </div>
                </div>
                <script>
                    window.onload = function() { setTimeout(function() { window.print(); }, 250); };
                </script>
            </body>
            </html>
        `);
        printWin.document.close();
    };

    return (
        <div className={inline ? 'animate-in fade-in duration-150' : 'fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150'}>
            <div className={inline ? 'bg-white border-2 border-emerald-300 rounded-2xl w-full p-5 sm:p-6 shadow-sm space-y-4 text-slate-800' : 'bg-white border border-slate-200 rounded-3xl w-full max-w-4xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-800'}>
                {/* HEADER PANEL / MODAL */}
                <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-200 pb-3.5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                            <Award className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-black text-[#242222] text-base">
                                {viewMode === 'form'
                                    ? 'Form Rekap Omzet, Pengeluaran & Keuntungan Laba Bersih Bulanan'
                                    : viewMode === 'detail' && detailItem
                                        ? `Rincian Detail Keuntungan Laba Bersih — Bulan ${detailItem.periodLabel}`
                                        : (titleOverride || 'Keuntungan & Laba Bersih Perusahaan Per Bulan')}
                            </h3>
                            <p className="text-xs text-slate-500">
                                {viewMode === 'form'
                                    ? 'Rekap omzet bulan ini, uang modal + biaya OPEX bulan ini, serta keuntungan laba bersih bulan ini'
                                    : 'Rekapitulasi Omzet Order Selesai, Keuntungan Orderan, Uang Modal, Biaya OPEX, dan Laba Bersih setiap bulannya'}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {viewMode === 'list' && (
                            <>
                                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                                    <Filter className="w-3.5 h-3.5 text-[#1b68b0]" />
                                    <select
                                        value={monthFilterMode}
                                        onChange={(e) => setMonthFilterMode(e.target.value)}
                                        className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                                    >
                                        <option value="active">Bulan Aktif Transaksi</option>
                                        <option value="all_12">12 Bulan Penuh (Jan - Des)</option>
                                    </select>
                                </div>

                                {monthFilterMode === 'all_12' && (
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                        className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#1b68b0] focus:outline-none cursor-pointer"
                                    >
                                        {availableYears.map(yr => (
                                            <option key={yr} value={yr}>Tahun {yr}</option>
                                        ))}
                                    </select>
                                )}
                            </>
                        )}

                        {viewMode !== 'list' ? (
                            <div className="flex items-center gap-2">
                                {viewMode === 'detail' && detailItem && (
                                    <button
                                        type="button"
                                        onClick={() => handlePrintMonthlyRecap(detailItem)}
                                        className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                                    >
                                        <Printer className="w-3.5 h-3.5 text-[#1b68b0]" />
                                        <span>Cetak Rincian Bulan Ini</span>
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setViewMode('list')}
                                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                    <span>Kembali ke Daftar Laba Per Bulan</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => handlePrintMonthlyRecap(null)}
                                    className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                                    title="Cetak Tabel Rekap Laba Bersih Bulanan"
                                >
                                    <Printer className="w-3.5 h-3.5 text-[#1b68b0]" />
                                    <span>Cetak Rekap Bulanan</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        loadFormForPeriod(selectedPeriod);
                                        setViewMode('form');
                                    }}
                                    className="px-3.5 py-2 bg-[#70b03c] hover:bg-[#5f9733] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>+ Rekap Laba Bersih Bulan Ini</span>
                                </button>
                            </div>
                        )}
                        {!hideCloseButton && onClose && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl p-1.5 transition cursor-pointer"
                                title="Tutup panel"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* MODE 1: DAFTAR KEUNTUNGAN LABA BERSIH SETIAP BULANNYA */}
                {viewMode === 'list' && (
                    <div className="space-y-4 text-xs">
                        {/* 4 KARTU RINGKASAN PERFORMA BULANAN */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-3.5">
                                <span className="text-[11px] font-bold text-slate-500 block">Total Omzet ({allMonthlyRecaps.length} Bulan)</span>
                                <div className="text-base font-black text-[#1b68b0] font-mono mt-1">
                                    Rp {summaryTotals.revenue.toLocaleString('id-ID')}
                                </div>
                                <span className="text-[10px] text-slate-500 font-mono">{summaryTotals.ordersCount} Orderan Selesai</span>
                            </div>
                            <div className="bg-teal-50/50 border border-teal-200 rounded-2xl p-3.5">
                                <span className="text-[11px] font-bold text-slate-500 block">Total Keuntungan Orderan</span>
                                <div className="text-base font-black text-teal-700 font-mono mt-1">
                                    + Rp {summaryTotals.orderProfitSum.toLocaleString('id-ID')}
                                </div>
                                <span className="text-[10px] text-slate-500 font-mono">Selisih jual kaca vs modal</span>
                            </div>
                            <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-3.5">
                                <span className="text-[11px] font-bold text-slate-500 block">Total Pengeluaran Bulanan</span>
                                <div className="text-base font-black text-rose-600 font-mono mt-1">
                                    Rp {summaryTotals.totalExpense.toLocaleString('id-ID')}
                                </div>
                                <span className="text-[10px] text-slate-500 font-mono">Uang Modal + Biaya OPEX</span>
                            </div>
                            <div className={`border-2 rounded-2xl p-3.5 ${summaryTotals.netProfit >= 0 ? 'bg-emerald-50/70 border-emerald-300' : 'bg-rose-50/70 border-rose-300'}`}>
                                <span className="text-[11px] font-bold text-slate-700 block">Total Keuntungan Laba Bersih</span>
                                <div className={`text-base font-black font-mono mt-1 ${summaryTotals.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                                    Rp {summaryTotals.netProfit.toLocaleString('id-ID')}
                                </div>
                                <span className="text-[10px] text-slate-600 font-mono">
                                    Rata-rata: Rp {Math.round(summaryTotals.netProfit / Math.max(1, allMonthlyRecaps.length)).toLocaleString('id-ID')}/bln
                                </span>
                            </div>
                        </div>

                        {activeRecapPeriod && (
                            <div className="flex flex-wrap items-center justify-between gap-2 bg-emerald-50/70 border border-emerald-300 rounded-2xl p-3">
                                <div className="text-slate-700">
                                    Kartu Laba Bersih utama saat ini sedang menampilkan rekap bulan: <strong className="text-emerald-800">{formatPeriodLabel(activeRecapPeriod)}</strong>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onSelectRecapPeriod && onSelectRecapPeriod(null)}
                                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-bold text-[11px] transition cursor-pointer shrink-0"
                                >
                                    Kembalikan ke Total Akumulasi (Semua Bulan)
                                </button>
                            </div>
                        )}

                        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-slate-50 text-slate-500 font-mono font-bold uppercase border-b border-slate-200 text-[11px]">
                                    <tr>
                                        <th className="py-3 px-4">Bulan & Tahun</th>
                                        <th className="py-3 px-4 text-right">Omzet Bulan Ini</th>
                                        <th className="py-3 px-4 text-right">Keuntungan Order</th>
                                        <th className="py-3 px-4 text-right">Uang Modal</th>
                                        <th className="py-3 px-4 text-right">Biaya OPEX</th>
                                        <th className="py-3 px-4 text-right">Total Pengeluaran</th>
                                        <th className="py-3 px-4 text-right">Keuntungan Laba Bersih</th>
                                        <th className="py-3 px-4 text-center">Status Rekap</th>
                                        <th className="py-3 px-4 text-center">Aksi & Rincian</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-mono">
                                    {allMonthlyRecaps.map((rec) => {
                                        const isProfit = rec.netProfit >= 0;
                                        const isCurrentlySelected = activeRecapPeriod === rec.period;
                                        return (
                                            <tr key={rec.period} className={`transition ${isCurrentlySelected ? 'bg-emerald-50/60' : 'hover:bg-slate-50'}`}>
                                                <td className="py-3 px-4 font-sans">
                                                    <div className="font-black text-[#242222] flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5 text-[#1b68b0]" />
                                                        <span>{rec.periodLabel}</span>
                                                    </div>
                                                    <span className="text-[10px] text-slate-500 font-mono">
                                                        {rec.ordersCount} Order Selesai • {rec.trxCount} Transaksi Keluar
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right font-bold text-[#1b68b0]">
                                                    Rp {Number(rec.revenue || 0).toLocaleString('id-ID')}
                                                </td>
                                                <td className="py-3 px-4 text-right font-bold text-teal-700">
                                                    + Rp {Number(rec.orderProfitSum || 0).toLocaleString('id-ID')}
                                                </td>
                                                <td className="py-3 px-4 text-right font-bold text-amber-700">
                                                    Rp {Number(rec.cogs || 0).toLocaleString('id-ID')}
                                                </td>
                                                <td className="py-3 px-4 text-right font-bold text-purple-700">
                                                    Rp {Number(rec.opex || 0).toLocaleString('id-ID')}
                                                </td>
                                                <td className="py-3 px-4 text-right font-bold text-rose-600">
                                                    Rp {Number(rec.totalExpense || 0).toLocaleString('id-ID')}
                                                </td>
                                                <td className={`py-3 px-4 text-right font-black text-sm ${isProfit ? 'text-emerald-700' : 'text-rose-600'}`}>
                                                    <div>Rp {Number(rec.netProfit || 0).toLocaleString('id-ID')}</div>
                                                    <span className="text-[10px] font-bold">Margin: {rec.marginPct || '0.0'}%</span>
                                                </td>
                                                <td className="py-3 px-4 text-center font-sans">
                                                    {rec.isSavedRecap ? (
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                                                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                                            <span>Sudah Direkap</span>
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                                            Otomatis Sistem
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-center font-sans">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setDetailItem(rec);
                                                                setViewMode('detail');
                                                            }}
                                                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#1b68b0] border border-blue-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                                                            title="Lihat Rincian Detail Pendapatan & Pengeluaran Bulan Ini"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                            <span>Rincian</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedPeriod(rec.period);
                                                                loadFormForPeriod(rec.period);
                                                                setViewMode('form');
                                                            }}
                                                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-bold transition cursor-pointer"
                                                            title="Rekap / Sesuaikan Laba Bersih Bulan Ini"
                                                        >
                                                            Rekap
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (onSelectRecapPeriod) {
                                                                    onSelectRecapPeriod(rec);
                                                                }
                                                                if (!inline && onClose) {
                                                                    onClose();
                                                                }
                                                            }}
                                                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                                                                isCurrentlySelected
                                                                    ? 'bg-emerald-600 text-white'
                                                                    : 'bg-[#70b03c] hover:bg-[#5f9733] text-white'
                                                            }`}
                                                            title="Tampilkan angka Laba Bersih bulan ini pada kartu utama Laba Bersih"
                                                        >
                                                            {isCurrentlySelected ? 'Sedang Tampil' : 'Pilih Bulan'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-mono font-black text-xs">
                                    <tr>
                                        <td className="py-3 px-4 font-sans text-[#242222]">
                                            TOTAL AKUMULASI ({allMonthlyRecaps.length} BULAN)
                                        </td>
                                        <td className="py-3 px-4 text-right text-[#1b68b0]">
                                            Rp {summaryTotals.revenue.toLocaleString('id-ID')}
                                        </td>
                                        <td className="py-3 px-4 text-right text-teal-700">
                                            + Rp {summaryTotals.orderProfitSum.toLocaleString('id-ID')}
                                        </td>
                                        <td className="py-3 px-4 text-right text-amber-700">
                                            Rp {summaryTotals.cogs.toLocaleString('id-ID')}
                                        </td>
                                        <td className="py-3 px-4 text-right text-purple-700">
                                            Rp {summaryTotals.opex.toLocaleString('id-ID')}
                                        </td>
                                        <td className="py-3 px-4 text-right text-rose-600">
                                            Rp {summaryTotals.totalExpense.toLocaleString('id-ID')}
                                        </td>
                                        <td className={`py-3 px-4 text-right text-sm ${summaryTotals.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                                            Rp {summaryTotals.netProfit.toLocaleString('id-ID')}
                                        </td>
                                        <td colSpan={2} className="py-3 px-4 text-center font-sans text-[11px] text-slate-500">
                                            Rekap Laba Bersih Bulanan
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                )}

                {/* MODE 2: FORM REKAP OMZET BULAN INI, PENGELUARAN BULAN INI & KEUNTUNGAN BERSIH BULAN INI */}
                {viewMode === 'form' && (
                    <form onSubmit={handleSaveRecapSubmit} className="space-y-4 text-xs">
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        Pilih Bulan & Tahun Rekapitulasi <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="month"
                                        required
                                        value={selectedPeriod}
                                        onChange={(e) => {
                                            setSelectedPeriod(e.target.value);
                                            loadFormForPeriod(e.target.value);
                                        }}
                                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:border-[#1b68b0] focus:outline-none cursor-pointer"
                                    />
                                </div>
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const autoStats = computePeriodStats(selectedPeriod);
                                            setCustomRevenue(String(autoStats.revenue || 0));
                                            setCustomModalCogs(String(autoStats.cogs || 0));
                                            setCustomOpex(String(autoStats.opex || 0));
                                        }}
                                        className="w-full py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-[#1b68b0] border border-blue-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                                    >
                                        <Calculator className="w-4 h-4" />
                                        <span>Hitung Otomatis dari Data Transaksi Bulan {formatPeriodLabel(selectedPeriod)}</span>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        1. Total Omzet Bulan Ini (Rp) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        value={customRevenue}
                                        onChange={(e) => setCustomRevenue(e.target.value)}
                                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-sm text-[#1b68b0] focus:border-[#1b68b0] focus:outline-none"
                                    />
                                    <span className="text-[10px] text-slate-500">Total penjualan SPO Selesai bulan ini</span>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        2. Pengeluaran Uang Modal Bulan Ini (Rp) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        value={customModalCogs}
                                        onChange={(e) => setCustomModalCogs(e.target.value)}
                                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-sm text-amber-700 focus:border-[#1b68b0] focus:outline-none"
                                    />
                                    <span className="text-[10px] text-slate-500">Belanja bahan kaca & aksesoris</span>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        3. Pengeluaran Biaya OPEX Bulan Ini (Rp) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        value={customOpex}
                                        onChange={(e) => setCustomOpex(e.target.value)}
                                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-sm text-purple-700 focus:border-[#1b68b0] focus:outline-none"
                                    />
                                    <span className="text-[10px] text-slate-500">Listrik, BBM, Gaji, Alat & Kantor</span>
                                </div>
                            </div>

                            {/* HASIL KALKULASI REKAP BULAN INI */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                <div className="bg-white border border-rose-200 rounded-2xl p-3.5">
                                    <span className="text-[11px] font-bold text-slate-500 block">Total Pengeluaran Bulan {formatPeriodLabel(selectedPeriod)} (Uang Modal + OPEX):</span>
                                    <div className="text-lg font-black text-rose-600 font-mono mt-1">
                                        Rp {formTotalExpenseNum.toLocaleString('id-ID')}
                                    </div>
                                </div>
                                <div className={`border-2 rounded-2xl p-3.5 ${formNetProfitNum >= 0 ? 'bg-emerald-50/70 border-emerald-300' : 'bg-rose-50/70 border-rose-300'}`}>
                                    <span className="text-[11px] font-bold text-slate-700 block">Keuntungan / Laba Bersih Bulan {formatPeriodLabel(selectedPeriod)}:</span>
                                    <div className={`text-xl font-black font-mono mt-1 ${formNetProfitNum >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                                        Rp {formNetProfitNum.toLocaleString('id-ID')}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Catatan Rekapitulasi Finance (Opsional)</label>
                                <input
                                    type="text"
                                    value={recapNotes}
                                    onChange={(e) => setRecapNotes(e.target.value)}
                                    placeholder="Contoh: Tutup buku bulanan sudah diverifikasi oleh Kepala Finance & Owner"
                                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:border-[#1b68b0] focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={() => setViewMode('list')}
                                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-5 py-2.5 bg-[#70b03c] hover:bg-[#5f9733] text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                <span>Simpan Rekap & Terapkan ke Kartu Laba Bersih</span>
                            </button>
                        </div>
                    </form>
                )}

                {/* MODE 3: RINCIAN / DETAIL LABA BERSIH BULAN TERTENTU */}
                {viewMode === 'detail' && detailItem && (
                    <div className="space-y-4 text-xs">
                        {/* 4 KARTU RINGKASAN BULAN TERSEBUT */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-3.5">
                                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                                    <TrendingUp className="w-3.5 h-3.5 text-[#1b68b0]" /> Omzet Bulan {detailItem.periodLabel}
                                </span>
                                <div className="text-base font-black text-[#1b68b0] font-mono mt-1">
                                    Rp {Number(detailItem.revenue || 0).toLocaleString('id-ID')}
                                </div>
                                <span className="text-[10px] text-slate-500 font-mono">
                                    {detailItem.ordersCount} Order Selesai • Laba Order: Rp {Number(detailItem.orderProfitSum || 0).toLocaleString('id-ID')}
                                </span>
                            </div>

                            <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-3.5">
                                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                                    <Package className="w-3.5 h-3.5 text-amber-600" /> Uang Modal (Bahan & Aksesoris)
                                </span>
                                <div className="text-base font-black text-amber-700 font-mono mt-1">
                                    Rp {Number(detailItem.cogs || 0).toLocaleString('id-ID')}
                                </div>
                                <span className="text-[10px] text-slate-500 font-mono">{detailItem.cogsTransactions?.length || 0} Transaksi Belanja</span>
                            </div>

                            <div className="bg-purple-50/50 border border-purple-200 rounded-2xl p-3.5">
                                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                                    <Zap className="w-3.5 h-3.5 text-purple-600" /> Biaya Operasional (OPEX)
                                </span>
                                <div className="text-base font-black text-purple-700 font-mono mt-1">
                                    Rp {Number(detailItem.opex || 0).toLocaleString('id-ID')}
                                </div>
                                <span className="text-[10px] text-slate-500 font-mono">{detailItem.opexTransactions?.length || 0} Transaksi OPEX</span>
                            </div>

                            <div className={`border-2 rounded-2xl p-3.5 ${detailItem.netProfit >= 0 ? 'bg-emerald-50/70 border-emerald-300' : 'bg-rose-50/70 border-rose-300'}`}>
                                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                                    <Award className="w-3.5 h-3.5 text-emerald-600" /> Laba Bersih {detailItem.periodLabel}
                                </span>
                                <div className={`text-base font-black font-mono mt-1 ${detailItem.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                                    Rp {Number(detailItem.netProfit || 0).toLocaleString('id-ID')}
                                </div>
                                <span className="text-[10px] text-slate-600 font-mono">
                                    Total Keluar: Rp {Number(detailItem.totalExpense || 0).toLocaleString('id-ID')}
                                </span>
                            </div>
                        </div>

                        {/* TABEL RINCIAN PENGELUARAN UANG MODAL & OPEX PADA BULAN INI */}
                        <div className="space-y-2">
                            <h4 className="font-bold text-[#242222] text-xs flex items-center gap-1.5">
                                <FileText className="w-4 h-4 text-[#1b68b0]" />
                                <span>1. Rincian Pengeluaran (Uang Modal & Biaya OPEX) Bulan {detailItem.periodLabel}</span>
                            </h4>
                            <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-52">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-mono font-bold uppercase border-b border-slate-200 text-[10px]">
                                        <tr>
                                            <th className="py-2 px-3">Kode</th>
                                            <th className="py-2 px-3">Tanggal</th>
                                            <th className="py-2 px-3">Jenis Pengeluaran</th>
                                            <th className="py-2 px-3">Uraian Transaksi</th>
                                            <th className="py-2 px-3 text-right">Nominal (Rp)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-mono">
                                        {[...(detailItem.cogsTransactions || []), ...(detailItem.opexTransactions || [])].map((trx, idx) => (
                                            <tr key={trx.id || idx} className="hover:bg-slate-50">
                                                <td className="py-2 px-3 font-bold text-[#1b68b0]">{trx.transaction_code}</td>
                                                <td className="py-2 px-3 text-slate-500">{trx.transaction_date}</td>
                                                <td className="py-2 px-3 font-sans">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                                        trx.type === 'pembelian_bahan' || trx.type === 'pembelian_aksesoris'
                                                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                                                            : 'bg-purple-50 text-purple-700 border-purple-200'
                                                    }`}>
                                                        {trx.type === 'pembelian_bahan' || trx.type === 'pembelian_aksesoris' ? 'Uang Modal' : 'Biaya OPEX'} — {trx.category}
                                                    </span>
                                                </td>
                                                <td className="py-2 px-3 font-sans font-semibold text-[#242222]">{trx.title}</td>
                                                <td className="py-2 px-3 text-right font-bold text-rose-600">
                                                    Rp {Number(trx.amount || 0).toLocaleString('id-ID')}
                                                </td>
                                            </tr>
                                        ))}
                                        {[...(detailItem.cogsTransactions || []), ...(detailItem.opexTransactions || [])].length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="text-center py-5 text-slate-400 font-sans">
                                                    Tidak ada rincian pengeluaran tercatat pada bulan ini.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* TABEL RINCIAN OMZET & KEUNTUNGAN SPO SELESAI PADA BULAN INI */}
                        <div className="space-y-2">
                            <h4 className="font-bold text-[#242222] text-xs flex items-center gap-1.5">
                                <TrendingUp className="w-4 h-4 text-[#1b68b0]" />
                                <span>2. Rincian Omzet & Keuntungan Orderan Selesai Bulan {detailItem.periodLabel} ({detailItem.orders?.length || 0} SPO)</span>
                            </h4>
                            <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-52">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-mono font-bold uppercase border-b border-slate-200 text-[10px]">
                                        <tr>
                                            <th className="py-2 px-3">No. SPO</th>
                                            <th className="py-2 px-3">Tanggal Selesai</th>
                                            <th className="py-2 px-3">Customer</th>
                                            <th className="py-2 px-3 text-right">Omzet SPO (Rp)</th>
                                            <th className="py-2 px-3 text-right">Estimasi Modal (Rp)</th>
                                            <th className="py-2 px-3 text-right">Keuntungan Order (Rp)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-mono">
                                        {(detailItem.orders || []).map((ord, idx) => {
                                            const pOrd = estimateOrderProfit(ord);
                                            return (
                                                <tr key={ord.id || idx} className="hover:bg-slate-50">
                                                    <td className="py-2 px-3 font-bold text-[#1b68b0]">{ord.spo_number}</td>
                                                    <td className="py-2 px-3 text-slate-500">{String(ord.delivered_at || ord.order_date || '').split('T')[0].split(' ')[0]}</td>
                                                    <td className="py-2 px-3 font-sans font-bold text-[#242222]">{ord.customer_name}</td>
                                                    <td className="py-2 px-3 text-right font-bold text-[#1b68b0]">
                                                        Rp {pOrd.revenue.toLocaleString('id-ID')}
                                                    </td>
                                                    <td className="py-2 px-3 text-right font-bold text-amber-700">
                                                        Rp {pOrd.modalCost.toLocaleString('id-ID')}
                                                    </td>
                                                    <td className="py-2 px-3 text-right font-black text-emerald-700">
                                                        + Rp {pOrd.profit.toLocaleString('id-ID')}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {(detailItem.orders || []).length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="text-center py-5 text-slate-400 font-sans">
                                                    Tidak ada pesanan SPO selesai pada bulan ini.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={() => {
                                    if (onSelectRecapPeriod) {
                                        onSelectRecapPeriod(detailItem);
                                    }
                                    if (!inline && onClose) {
                                        onClose();
                                    }
                                }}
                                className="px-4 py-2 bg-[#70b03c] hover:bg-[#5f9733] text-white font-bold rounded-xl text-xs cursor-pointer"
                            >
                                Tampilkan Bulan {detailItem.periodLabel} di Kartu Laba Bersih
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
