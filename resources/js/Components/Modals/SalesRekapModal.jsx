import React, { useState } from 'react';
import { BarChart3, X } from 'lucide-react';

export default function SalesRekapModal({
    show,
    onClose,
    orders = [],
    isDivisionWorker = false,
    userRole = 'admin_toko',
    formatIndonesianDate,
    isDateInTimeRange
}) {
    if (!show) return null;

    const [statTimeRange, setStatTimeRange] = useState('today');

    const curKey = isDivisionWorker ? userRole.replace('divisi_', '').toUpperCase() : 'HT';

    const enteredList = orders.filter(o => {
        const ts = (o.division_timestamps && o.division_timestamps[curKey]) ? o.division_timestamps[curKey] : {};
        const dateToCheck = ts.started_at || ts.created_at || o.created_at || o.order_date;
        const matchDiv = isDivisionWorker ? (o.current_division === userRole || (o.division_progress?.[curKey] && o.division_progress?.[curKey] !== 'N/A' && o.division_progress?.[curKey] !== 'Belum')) : true;
        return matchDiv && (isDateInTimeRange ? isDateInTimeRange(dateToCheck, statTimeRange) : true);
    });

    const completedList = orders.filter(o => {
        const ts = (o.division_timestamps && o.division_timestamps[curKey]) ? o.division_timestamps[curKey] : {};
        const dateToCheck = ts.completed_at || o.execution_completed_at;
        const matchDiv = (o.division_progress && o.division_progress[curKey] === 'Selesai');
        return matchDiv && (isDateInTimeRange ? isDateInTimeRange(dateToCheck, statTimeRange) : true);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
            <div className="bg-white border border-slate-200 w-full max-w-4xl rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto text-slate-800">
                {/* MODAL HEADER */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-3.5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-[#1b68b0]/10 flex items-center justify-center text-[#1b68b0]">
                            <BarChart3 className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-[#242222]">
                                Rekapitulasi Pemilahan Orderan Masuk & Selesai
                            </h3>
                            <p className="text-xs text-slate-500 font-mono">
                                Divisi: <strong className="text-[#1b68b0]">{isDivisionWorker ? userRole.replace('divisi_', '').toUpperCase() : 'SEMUA DIVISI'}</strong>
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

                {/* RENTANG WAKTU SELECTOR BUTTONS */}
                <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-600 pl-2">Filter Rentang Waktu:</span>
                    {[
                        { key: 'today', label: 'Hari Ini' },
                        { key: '2days', label: '2 Hari' },
                        { key: 'week', label: '1 Minggu' },
                        { key: 'month', label: '1 Bulan' },
                        { key: 'year', label: '1 Tahun' },
                        { key: 'all', label: 'Semua Waktu' }
                    ].map(item => (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => setStatTimeRange(item.key)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                                statTimeRange === item.key
                                    ? 'bg-[#1b68b0] text-white shadow-xs'
                                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* STAT SUMMARY CARDS */}
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-1">
                            <span className="text-xs font-bold text-[#1b68b0] block">Total Order Masuk</span>
                            <span className="text-2xl font-mono font-bold text-slate-900">{enteredList.length} Order</span>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-1">
                            <span className="text-xs font-bold text-[#5f9733] block">Total Order Selesai</span>
                            <span className="text-2xl font-mono font-bold text-slate-900">{completedList.length} Order</span>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-1">
                            <span className="text-xs font-bold text-amber-700 block">Persentase Selesai</span>
                            <span className="text-2xl font-mono font-bold text-slate-900">{completionRate}%</span>
                        </div>
                    </div>

                    {/* TABLE RINCIAN PER HARI */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-700 font-mono flex items-center justify-between">
                            <span>Rincian Pemilihan Per-Hari ({sortedDates.length} Hari Terdeteksi):</span>
                            <span className="text-[10px] text-slate-500">Menampilkan tanggal dengan transaksi order</span>
                        </h4>

                        {sortedDates.length > 0 ? (
                            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] border-b border-slate-200 font-bold">
                                        <tr>
                                            <th className="p-3">Tanggal</th>
                                            <th className="p-3">Order Masuk</th>
                                            <th className="p-3">Order Selesai</th>
                                            <th className="p-3 text-right">Daftar SPO</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {sortedDates.map(dStr => {
                                            const group = dateGroupMap[dStr];
                                            return (
                                                <tr key={dStr} className="hover:bg-slate-50 transition">
                                                    <td className="p-3 font-bold text-slate-800">{formatIndonesianDate ? formatIndonesianDate(dStr) : dStr}</td>
                                                    <td className="p-3">
                                                        <span className="bg-blue-50 text-[#1b68b0] px-2.5 py-1 rounded-lg border border-blue-200 font-bold text-xs">
                                                            {group.entered.length} Order
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        <span className="bg-emerald-50 text-[#5f9733] px-2.5 py-1 rounded-lg border border-emerald-200 font-bold text-xs">
                                                            {group.completed.length} Order
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        <div className="flex flex-wrap items-center justify-end gap-1">
                                                            {group.entered.map(o => (
                                                                <span key={'e_' + o.id} className="text-[10px] bg-slate-50 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md font-mono">
                                                                    #{o.spo_number}
                                                                </span>
                                                            ))}
                                                            {group.completed.map(o => (
                                                                <span key={'c_' + o.id} className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-mono font-bold">
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
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center text-xs text-slate-500 font-mono">
                                Tidak ada data orderan masuk atau selesai pada rentang waktu ini.
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-200">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-xl text-xs cursor-pointer transition"
                    >
                        Tutup Rekap
                    </button>
                </div>
            </div>
        </div>
    );
}
