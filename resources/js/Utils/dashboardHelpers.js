import React from 'react';

export const roleTitles = {
    admin_toko: '🏪 Admin Toko',
    admin_gudang: '🏭 Admin Gudang',
    divisi_ht: '✂️ Divisi Potong (HT)',
    divisi_gm: '✨ Divisi GM (Gosok)',
    divisi_bv: '💎 Divisi BV (Bevel)',
    divisi_etsa: '🌫️ Divisi Etsa',
    driver: '🚚 Supir / Driver',
    owner: '📈 Owner & Akuntan',
    hrd: '👥 HRD & Personalia',
    finance: '💰 Finance & Akuntansi',
    admin_finance: '💰 Finance & Akuntansi',
};

export const formatIndonesianDate = (dateStr) => {
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

export const formatIndonesianDateTime = (dateTimeStr) => {
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

export const isDriverMatch = (driverField, targetUserName) => {
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

export const isDateInTimeRange = (dateStr, rangeKey) => {
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

export const isMatchSearch = (item, customTerm = null, fallbackTerm = '') => {
    const term = (customTerm !== null && typeof customTerm === 'string') ? customTerm : (typeof customTerm === 'object' && customTerm !== null ? fallbackTerm : (customTerm || fallbackTerm));
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
                if (it.thickness_mm && String(it.thickness_mm).includes(q)) return true;
            }
        }
    }
    return false;
};

export const fixedFactoryProcessOrder = ['HT', 'GM', 'BV', 'Etsa'];

export const divisionInfo = {
    'HT': { key: 'divisi_ht', code: 'HT', name: 'Divisi Potong (HT & Bor)', icon: '✂️', bg: 'bg-rose-500/10 text-rose-300 border-rose-500/30' },
    'GM': { key: 'divisi_gm', code: 'GM', name: 'Divisi GM (Gosok Mesin)', icon: '✨', bg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' },
    'BV': { key: 'divisi_bv', code: 'BV', name: 'Divisi BV (Beveling)', icon: '💎', bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30' },
    'Etsa': { key: 'divisi_etsa', code: 'Etsa', name: 'Divisi Etsa (Sandblast Blur)', icon: '🌫️', bg: 'bg-purple-500/10 text-purple-300 border-purple-500/30' }
};

export const getOrderRelevantDivisions = (o) => {
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

    procs.sort((a, b) => fixedFactoryProcessOrder.indexOf(a) - fixedFactoryProcessOrder.indexOf(b));

    return procs.map(p => divisionInfo[p]).filter(Boolean);
};

export const checkOrderDivisi = (o, divKey) => {
    if (!o) return false;
    if (divKey === 'QC_Ready') return o.current_division === 'QC_Ready';
    if (divKey === 'all') return (o.status === 'pengerjaan' || o.current_division === 'QC_Ready') && o.current_division !== 'admin_gudang';
    if (o.current_division === divKey) return true;

    const code = divKey.replace('divisi_', '').toUpperCase();
    const p = o.division_progress || {};
    return p[code] === 'Selesai' || p[code] === 'Sedang Dikerjakan';
};

export const isOrderExecutionFinished = (o) => {
    if (!o) return false;
    if (o.status === 'selesai') return true;
    if (o.status === 'draft') return false;

    // Working divisions that mean order is still actively in workstation production or internal prep
    const workingDivisions = ['admin_toko', 'admin_gudang', 'divisi_ht', 'divisi_gm', 'divisi_bv', 'divisi_etsa'];
    if (workingDivisions.includes(o.current_division)) {
        return false;
    }

    if (o.status === 'pengerjaan') {
        return false;
    }

    const progress = o.division_progress || {};
    const relevantDivs = getOrderRelevantDivisions(o);
    if (relevantDivs.length > 0) {
        const allDone = relevantDivs.every(div => progress[div.code] === 'Selesai');
        if (!allDone) return false;
    } else {
        const keys = Object.keys(progress);
        for (const k of keys) {
            if (progress[k] !== 'N/A' && progress[k] !== 'Selesai') {
                return false;
            }
        }
    }

    return o.status === 'pengiriman' || o.current_division === 'QC_Ready' || o.current_division === 'pengiriman';
};

