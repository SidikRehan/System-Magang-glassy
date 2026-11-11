import React from 'react';

export const roleTitles = {
    admin_toko: 'Admin Toko & Kasir',
    admin_gudang: 'Admin Gudang Manufaktur',
    divisi_ht: 'Divisi Potong (HT)',
    divisi_gm: 'Divisi GM (Gosok)',
    divisi_bv: 'Divisi BV (Bevel)',
    divisi_etsa: 'Divisi Etsa (Blur)',
    divisi_bor: 'Divisi Bor (Drilling)',
    driver: 'Armada Pengiriman (Driver)',
    satpam: 'Satpam (Keamanan Gerbang)',
    owner: 'Owner & Direksi Utama',
    hrd: 'HRD & Personalia',
    finance: 'Finance & Akuntansi',
    admin_finance: 'Finance & Akuntansi',
};

export const formatIndonesianDate = (dateStr) => {
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
    const dStr = String(driverField).trim();
    const uStr = String(targetUserName).trim();

    if (dStr.toLowerCase() === uStr.toLowerCase()) return true;

    const normalize = (s) =>
        s.toLowerCase()
            .replace(/[\(\)\[\]\-_,\.]/g, ' ')
            .replace(/\b(pak|driver|supir|utama|dc|engkel|l300|subcon|armada|pick|up)\b/gi, ' ')
            .replace(/\s+/g, ' ')
            .trim();

    const dClean = normalize(dStr);
    const uClean = normalize(uStr);

    if (dClean.length > 0 && uClean.length > 0) {
        if (dClean === uClean || dClean.includes(uClean) || uClean.includes(dClean)) {
            return true;
        }
    }

    const uTokens = uClean.split(/\s+/).filter(t => t.length >= 3);
    const dTokens = dClean.split(/\s+/).filter(t => t.length >= 3);

    return uTokens.some(token => dTokens.includes(token) || dClean.includes(token));
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

export const fixedFactoryProcessOrder = ['HT', 'GM', 'BV', 'Etsa', 'Bor'];

export const normalizeProcessCode = (p) => {
    if (!p) return '';
    const u = String(p).replace('divisi_', '').trim().toUpperCase();
    if (u === 'ETSA') return 'Etsa';
    if (u === 'BOR') return 'Bor';
    return u;
};

export const divisionInfo = {
    'HT': { key: 'divisi_ht', code: 'HT', name: 'Divisi Potong', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
    'GM': { key: 'divisi_gm', code: 'GM', name: 'Divisi GM (Gosok Mesin)', bg: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    'BV': { key: 'divisi_bv', code: 'BV', name: 'Divisi BV (Beveling)', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
    'Etsa': { key: 'divisi_etsa', code: 'Etsa', name: 'Divisi Etsa (Sandblast Blur)', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
    'Bor': { key: 'divisi_bor', code: 'Bor', name: 'Divisi Bor (Drilling)', bg: 'bg-orange-50 text-orange-700 border-orange-200' }
};

export const getOrderRelevantDivisions = (o) => {
    if (!o) return [];
    let procs = [];
    const addProc = (p) => {
        const norm = normalizeProcessCode(p);
        if (norm && !procs.includes(norm)) {
            procs.push(norm);
        }
    };
    if (Array.isArray(o.processes) && o.processes.length > 0) {
        o.processes.forEach(addProc);
    }
    if (Array.isArray(o.items)) {
        o.items.forEach(it => {
            if (Array.isArray(it.processes)) {
                it.processes.forEach(addProc);
            }
        });
    }
    if (o.division_progress && typeof o.division_progress === 'object') {
        ['HT', 'GM', 'BV', 'Etsa', 'Bor'].forEach(code => {
            const st = getDivisionProgressStatus(o, code);
            if (st && st !== 'N/A' && !procs.includes(code)) {
                procs.push(code);
            }
        });
    }
    if (procs.length === 0) procs = ['HT'];
    if (!procs.includes('HT')) procs.unshift('HT');

    procs.sort((a, b) => fixedFactoryProcessOrder.indexOf(a) - fixedFactoryProcessOrder.indexOf(b));

    return procs.map(p => divisionInfo[p]).filter(Boolean);
};

export const computeDefaultNextDiv = (ord) => {
    if (!ord) return 'QC_Ready';
    const fixedSeq = ['HT', 'GM', 'BV', 'ETSA', 'BOR'];
    const reqCodes = ['HT'];
    const addC = (p) => { 
        if (!p) return;
        const code = p.toUpperCase();
        if (['GM', 'BV', 'ETSA', 'BOR'].includes(code) && !reqCodes.includes(code)) reqCodes.push(code); 
    };
    if (Array.isArray(ord.processes)) ord.processes.forEach(addC);
    if (Array.isArray(ord.items)) {
        ord.items.forEach(it => { if (Array.isArray(it.processes)) it.processes.forEach(addC); });
    }
    reqCodes.sort((a, b) => fixedSeq.indexOf(a) - fixedSeq.indexOf(b));
    const curKey = (ord.current_division || '').replace('divisi_', '').toUpperCase();
    const curIdx = reqCodes.indexOf(curKey);
    if (curIdx >= 0 && curIdx < reqCodes.length - 1) {
        const map = { 'HT': 'divisi_ht', 'GM': 'divisi_gm', 'BV': 'divisi_bv', 'ETSA': 'divisi_etsa', 'BOR': 'divisi_bor' };
        return map[reqCodes[curIdx + 1]] || 'QC_Ready';
    }
    return 'QC_Ready';
};

export const getDivisionProgressStatus = (order, divKeyOrCode) => {
    if (!order || !order.division_progress) return 'Belum';
    const raw = String(divKeyOrCode || '').replace('divisi_', '').trim();
    if (!raw) return 'Belum';
    const upper = raw.toUpperCase();
    const title = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
    const lower = raw.toLowerCase();
    const p = order.division_progress;
    return p[title] || p[upper] || p[lower] || p[raw] || 'Belum';
};

export const getDivisionTimestampObj = (order, divKeyOrCode) => {
    if (!order || !order.division_timestamps) return {};
    const raw = String(divKeyOrCode || '').replace('divisi_', '').trim();
    if (!raw) return {};
    const upper = raw.toUpperCase();
    const title = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
    const lower = raw.toLowerCase();
    const ts = order.division_timestamps;
    return ts[title] || ts[upper] || ts[lower] || ts[raw] || {};
};

export const checkOrderDivisi = (o, divKey) => {
    if (!o) return false;
    
    // Jika order sedang disuspend menunggu admin gudang, keluarkan dari antrian divisi
    if (o.complaint_status === 'pending_gudang') return false;
    
    if (divKey === 'QC_Ready') return o.current_division === 'QC_Ready';
    if (divKey === 'all') return (o.status === 'pengerjaan' || o.current_division === 'QC_Ready') && o.current_division !== 'admin_gudang';
    if (o.current_division === divKey) return true;

    const status = getDivisionProgressStatus(o, divKey);
    return status === 'Selesai' || status === 'Sedang Dikerjakan';
};

export const isOrderExecutionFinished = (o) => {
    if (!o) return false;
    if (o.status === 'selesai' || o.status === 'pengiriman' || o.current_division === 'QC_Ready' || o.current_division === 'pengiriman' || o.current_division === 'driver') {
        return true;
    }
    if (o.status === 'draft') return false;

    // Working divisions that mean order is still actively in workstation production or internal prep
    const workingDivisions = ['admin_toko', 'admin_gudang', 'divisi_ht', 'divisi_gm', 'divisi_bv', 'divisi_etsa', 'divisi_bor'];
    if (workingDivisions.includes(o.current_division)) {
        return false;
    }

    if (o.status === 'pengerjaan') {
        return false;
    }

    const progress = o.division_progress || {};
    const relevantDivs = getOrderRelevantDivisions(o);
    if (relevantDivs.length > 0) {
        const allDone = relevantDivs.every(div => getDivisionProgressStatus(o, div.code) === 'Selesai');
        if (!allDone) return false;
    } else {
        const keys = Object.keys(progress);
        for (const k of keys) {
            if (progress[k] !== 'N/A' && getDivisionProgressStatus(o, k) !== 'Selesai') {
                return false;
            }
        }
    }

    return true;
};

