/* ==========================================================================
   SYP GLASS OPERATIONAL SYSTEM & LANDING PAGE - FULL JAVASCRIPT LOGIC
   ========================================================================== */

// STATE MANAGEMENT SYSTEM
const store = {
    currentRole: 'admin_toko',
    currentMainView: 'landing',
    activeOrderTab: 'draft',
    activeAppTab: 'dashboard',

    // Sample Orders State (PRD Alur SPO)
    orders: [
        {
            id: 'SPO-0128',
            customerName: 'Pak Sidik',
            phone: '0812-3456-7890',
            address: 'Jl. Sunda No. 45, Bandung',
            date: '2026-08-10',
            items: [
                {
                    glassType: 'Kaca Cermin 5 mm polos',
                    length: 150.5,
                    width: 120,
                    thick: 5,
                    qty: 1,
                    processes: ['HT', 'GM', 'BV'],
                    acc: 'Aksesoris Aluminium Set'
                }
            ],
            priority: 'Biasa',
            deadline: '2026-08-15',
            subtotal: 950000,
            priorityFee: 0,
            totalPrice: 950000,
            paidAmount: 500000, // DP
            paymentStatus: 'DP (50%)', // 'Belum Lunas', 'DP (50%)', 'Lunas'
            status: 'pengerjaan', // 'draft', 'pengerjaan', 'pengiriman', 'pembayaran', 'selesai'
            currentDivision: 'divisi_gm',
            divisionProgress: {
                HT: 'Selesai',
                GM: 'Sedang Dikerjakan',
                BV: 'Belum',
                Etsa: 'N/A'
            },
            revisionStatus: null, // e.g. { division: 'HT', status: 'Proses', text: '...' }
            usedScrapRak: 'F7'
        },
        {
            id: 'SPO-0129',
            customerName: 'Ibu Ratna (Villa Dago)',
            phone: '0813-9876-5432',
            address: 'Jl. Dago Pakar No. 88, Bandung',
            date: '2026-08-10',
            items: [
                {
                    glassType: 'Kaca 12 mm Polos',
                    length: 300,
                    width: 200,
                    thick: 12,
                    qty: 2,
                    processes: ['HT', 'GM'],
                    acc: 'Handle Pintu Stainless'
                }
            ],
            priority: 'Prioritas',
            deadline: '2026-08-12',
            subtotal: 2800000,
            priorityFee: 150000,
            totalPrice: 2950000,
            paidAmount: 2950000,
            paymentStatus: 'Lunas',
            status: 'pengiriman',
            currentDivision: 'QC_Ready',
            divisionProgress: {
                HT: 'Selesai',
                GM: 'Selesai',
                BV: 'N/A',
                Etsa: 'N/A'
            },
            revisionStatus: null,
            usedScrapRak: null
        },
        {
            id: 'SPO-0130',
            customerName: 'PT Arsitek Indonesia',
            phone: '0811-2233-4455',
            address: 'Gedung Wisma Millenium Lt. 4, Jakarta',
            date: '2026-08-10',
            items: [
                {
                    glassType: 'Kaca Cermin Grey 5 mm',
                    length: 120,
                    width: 100,
                    thick: 5,
                    qty: 5,
                    processes: ['HT', 'BV'],
                    acc: 'Lem Silicone Pcs'
                }
            ],
            priority: 'Biasa',
            deadline: '2026-08-18',
            subtotal: 1450000,
            priorityFee: 0,
            totalPrice: 1450000,
            paidAmount: 0,
            paymentStatus: 'Belum Lunas',
            status: 'draft',
            currentDivision: 'N/A',
            divisionProgress: {
                HT: 'Belum',
                GM: 'N/A',
                BV: 'Belum',
                Etsa: 'N/A'
            },
            revisionStatus: null,
            usedScrapRak: null
        }
    ],

    // Scrap Glass Stock (Stok Kaca Sisa)
    scrapStock: [
        { id: 'SCRAP-001', type: 'Kaca Cermin 5mm Polos', length: 30, width: 40, rak: 'Rak A09', date: '2026-08-09', status: 'Layak Pakai' },
        { id: 'SCRAP-002', type: 'Kaca Cermin 5mm Polos', length: 155, width: 125, rak: 'Rak F7', date: '2026-08-10', status: 'Layak Pakai' },
        { id: 'SCRAP-003', type: 'Kaca 12mm Polos', length: 50, width: 60, rak: 'Rak B03', date: '2026-08-08', status: 'Layak Pakai' }
    ],

    // Master Stock Items
    masterStock: [
        { id: 'STK-01', category: 'Kaca Baru', name: 'Kaca Cermin 5mm Polos', size: '152 x 122 cm', qty: 45, rak: 'Gudang A1', status: 'Aman' },
        { id: 'STK-02', category: 'Kaca Baru', name: 'Kaca 12mm Polos', size: '304 x 214 cm', qty: 3, rak: 'Gudang B2', status: 'Menipis' },
        { id: 'STK-03', category: 'Aksesoris', name: 'Lem Silicone High Grade', size: '300 ml', qty: 0, rak: 'Toko C1', status: 'Kosong' },
        { id: 'STK-04', category: 'Aksesoris', name: 'Handle Pintu Stainless', size: 'Custom Set', qty: 18, rak: 'Toko C2', status: 'Aman' }
    ],

    // Deliveries State
    deliveries: [
        {
            id: 'SJ-2026-001',
            orderId: 'SPO-0129',
            driverName: 'Pak Budi (Supir DC)',
            vehicle: 'Engkel Box (D 8472 AB)',
            paymentStatus: 'Lunas',
            waybillColor: 'Putih',
            status: 'Selesai Terkirim',
            photoProof: '✓ Ter-upload (TTD Konsumen)'
        }
    ],

    // Activity Feed Logs
    activityLogs: [
        { time: '22:04', text: 'System Realtime Socket Gateway Initialized.' },
        { time: '22:05', text: 'Admin Toko membuat Order Baru #SPO-0128 (Kaca Cermin 5mm).' },
        { time: '22:06', text: 'Divisi HT menyelesaikan pemotongan #SPO-0128 & menginput sisa kaca ke Rak F7.' }
    ]
};

// INITIALIZATION ON DOM LOADED
document.addEventListener('DOMContentLoaded', () => {
    updateGlassSimulator();
    calculatePublicEstimate();
    renderOrdersTable();
    renderDashboardMetrics();
    renderActivityFeed();
    renderDivisionWorkstation();
    renderScrapTable();
    renderDeliveriesTable();
    renderMasterStockTable();
    renderFinanceTable();
});

// MAIN VIEW SWITCHER (Landing vs App)
function switchMainView(view) {
    store.currentMainView = view;
    document.getElementById('landingView').style.display = view === 'landing' ? 'block' : 'none';
    document.getElementById('appView').style.display = view === 'app' ? 'block' : 'none';
    document.getElementById('publicNav').style.display = view === 'landing' ? 'flex' : 'none';
    document.getElementById('appNavActions').style.display = view === 'app' ? 'flex' : 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ROLE SWITCHER LOGIC
function changeRole(newRole) {
    store.currentRole = newRole;
    const roleTitles = {
        admin_toko: 'Admin Toko',
        admin_gudang: 'Admin Gudang',
        divisi_ht: 'Divisi HT (Potong)',
        divisi_gm: 'Divisi GM (Gosok Mesin)',
        divisi_bv: 'Divisi BV (Bevel)',
        divisi_etsa: 'Divisi Etsa (Blur)',
        driver: 'Supir / Driver',
        owner: 'Owner & Akuntan'
    };

    const roleAvatars = {
        admin_toko: '🏪',
        admin_gudang: '🏭',
        divisi_ht: '✂️',
        divisi_gm: '✨',
        divisi_bv: '💎',
        divisi_etsa: '🌫️',
        driver: '🚚',
        owner: '📈'
    };

    document.getElementById('roleTitle').innerText = roleTitles[newRole];
    document.getElementById('roleAvatar').innerText = roleAvatars[newRole];
    document.getElementById('activeDivisionBadge').innerText = roleTitles[newRole];

    logSocketEvent(`User switched active role to: ${roleTitles[newRole]}`);
    
    // Auto switch relevant tab
    if (newRole.startsWith('divisi_')) {
        switchTab('production');
    } else if (newRole === 'driver') {
        switchTab('deliveries');
    } else if (newRole === 'owner') {
        switchTab('finance');
    } else {
        switchTab('orders');
    }
}

// TAB SWITCHER WITHIN APP DASHBOARD
function switchTab(tabId) {
    store.activeAppTab = tabId;
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    const activeEl = document.getElementById('tab' + tabId.charAt(0).toUpperCase() + tabId.slice(1));
    if (activeEl) activeEl.classList.add('active');

    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => item.classList.remove('active'));
}

// DYNAMIC SINGLE ROUTE ORDER DASHBOARD (PRD HALAMAN 5)
function filterOrderTab(status) {
    store.activeOrderTab = status;

    // Update active class on cards
    const cards = document.querySelectorAll('.status-filter-card');
    cards.forEach(c => c.classList.remove('active'));
    document.getElementById('card' + status.charAt(0).toUpperCase() + status.slice(1)).classList.add('active');

    renderOrdersTable();
}

function renderOrdersTable() {
    const tableHead = document.getElementById('ordersTableHead');
    const tableBody = document.getElementById('ordersTableBody');
    const currentTab = store.activeOrderTab;
    const searchVal = document.getElementById('orderSearch').value.toLowerCase();

    // Dynamically adjust table headers based on PRD Halaman 5
    if (currentTab === 'draft') {
        tableHead.innerHTML = `
            <th>ID Draf</th>
            <th>No SPO</th>
            <th>Tanggal Draf</th>
            <th>Nama Pemilik Pesanan</th>
            <th>Alamat</th>
            <th>Status Pembayaran</th>
            <th>Aksi</th>
        `;
    } else if (currentTab === 'pengerjaan') {
        tableHead.innerHTML = `
            <th>No SPO</th>
            <th>Nama Customer</th>
            <th>Detail Item & Ukuran</th>
            <th>Prioritas Deadline</th>
            <th>Progress Divisi</th>
            <th>Status Revisi</th>
            <th>Aksi Admin</th>
        `;
    } else {
        tableHead.innerHTML = `
            <th>No SPO</th>
            <th>Customer</th>
            <th>Tanggal Order</th>
            <th>Total Tagihan</th>
            <th>Status Pembayaran</th>
            <th>Status Order</th>
            <th>Aksi</th>
        `;
    }

    // Filter orders
    let filtered = store.orders.filter(o => {
        const matchesSearch = o.id.toLowerCase().includes(searchVal) || 
                              o.customerName.toLowerCase().includes(searchVal);
        if (currentTab === 'draft') return o.status === 'draft' && matchesSearch;
        if (currentTab === 'pengerjaan') return o.status === 'pengerjaan' && matchesSearch;
        if (currentTab === 'pengiriman') return o.status === 'pengiriman' && matchesSearch;
        if (currentTab === 'pembayaran') return (o.paymentStatus !== 'Lunas') && matchesSearch;
        if (currentTab === 'selesai') return o.status === 'selesai' && matchesSearch;
        return matchesSearch;
    });

    tableBody.innerHTML = '';
    if (filtered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">Tidak ada data orderan untuk kategori ini.</td></tr>`;
        return;
    }

    filtered.forEach(o => {
        const row = document.createElement('tr');
        if (currentTab === 'draft') {
            row.innerHTML = `
                <td><strong>#DRF-${o.id.split('-')[1]}</strong></td>
                <td><span class="badge-role">${o.id}</span></td>
                <td>${o.date}</td>
                <td><strong>${o.customerName}</strong><br><small class="text-muted">${o.phone}</small></td>
                <td>${o.address}</td>
                <td><span class="badge-status-progress">${o.paymentStatus}</span></td>
                <td>
                    <button class="btn-primary-sm" onclick="sendDraftToGudang('${o.id}')"><i class="fa-solid fa-paper-plane"></i> Kirim Gudang</button>
                    <button class="btn-secondary-sm" onclick="deleteOrder('${o.id}')"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
        } else if (currentTab === 'pengerjaan') {
            const revBadge = o.revisionStatus ? 
                `<span class="badge-status-progress text-danger"><i class="fa-solid fa-triangle-exclamation"></i> Revisi ${o.revisionStatus.division} [${o.revisionStatus.status}]</span>` : 
                `<span class="text-muted">Tidak Ada</span>`;

            row.innerHTML = `
                <td><strong>${o.id}</strong></td>
                <td><strong>${o.customerName}</strong></td>
                <td>${o.items[0].glassType} (${o.items[0].length}x${o.items[0].width}cm)</td>
                <td><span class="${o.priority === 'Prioritas' ? 'text-danger fw-bold' : ''}">${o.priority} (${o.deadline})</span></td>
                <td>
                    <small>HT: ${o.divisionProgress.HT} | GM: ${o.divisionProgress.GM} | BV: ${o.divisionProgress.BV}</small>
                </td>
                <td>${revBadge}</td>
                <td>
                    <button class="btn-secondary-sm text-warning" onclick="openRevisionModal('${o.id}')"><i class="fa-solid fa-pen-to-square"></i> Revisi</button>
                </td>
            `;
        } else {
            row.innerHTML = `
                <td><strong>${o.id}</strong></td>
                <td>${o.customerName}</td>
                <td>${o.date}</td>
                <td><strong>Rp ${o.totalPrice.toLocaleString()}</strong></td>
                <td><span class="${o.paymentStatus === 'Lunas' ? 'badge-status-success' : 'badge-status-progress'}">${o.paymentStatus}</span></td>
                <td><span class="badge-role">${o.status}</span></td>
                <td>
                    <button class="btn-secondary-sm" onclick="viewOrderDetail('${o.id}')"><i class="fa-solid fa-eye"></i> Detail</button>
                </td>
            `;
        }
        tableBody.appendChild(row);
    });
}

// REALTIME SOCKET EVENT EMITTER SIMULATION
function logSocketEvent(message) {
    const time = new Date().toTimeString().split(' ')[0].substring(0, 5);
    store.activityLogs.unshift({ time, text: message });
    renderActivityFeed();
}

function renderActivityFeed() {
    const container = document.getElementById('activityFeed');
    if (!container) return;
    container.innerHTML = store.activityLogs.slice(0, 8).map(log => `
        <div class="activity-item py-1">
            <small class="text-muted">[${log.time}]</small> <span>${log.text}</span>
        </div>
    `).join('');
}

function clearEventLogs() {
    store.activityLogs = [];
    renderActivityFeed();
}

// METRICS & DASHBOARD DATA RENDERER
function renderDashboardMetrics() {
    document.getElementById('dashTotalOrders').innerText = store.orders.length + ' SPO';
    document.getElementById('dashInProcess').innerText = store.orders.filter(o => o.status === 'pengerjaan').length + ' Pesanan';
    document.getElementById('dashReadyShip').innerText = store.orders.filter(o => o.status === 'pengiriman').length + ' Pesanan';
    document.getElementById('dashScrapCount').innerText = store.scrapStock.length + ' Lembar';

    document.getElementById('cntDraft').innerText = store.orders.filter(o => o.status === 'draft').length;
    document.getElementById('cntPengerjaan').innerText = store.orders.filter(o => o.status === 'pengerjaan').length;
    document.getElementById('cntPengiriman').innerText = store.orders.filter(o => o.status === 'pengiriman').length;
    document.getElementById('cntPembayaran').innerText = store.orders.filter(o => o.paymentStatus !== 'Lunas').length;
    document.getElementById('cntSelesai').innerText = store.orders.filter(o => o.status === 'selesai').length;
}

// WORKSTATION DIVISI PENGRAJIN (HT, GM, BV, ETSA)
function renderDivisionWorkstation() {
    const body = document.getElementById('activeWorkBody');
    const queue = document.getElementById('divisionQueueBody');
    if (!body || !queue) return;

    // Active working order mock
    const activeOrder = store.orders.find(o => o.status === 'pengerjaan');
    if (activeOrder) {
        body.innerHTML = `
            <div class="work-card-detail">
                <h4>Orderan Aktif: <strong class="text-primary">${activeOrder.id}</strong> (${activeOrder.customerName})</h4>
                <p class="mb-2">Item Kaca: <strong>${activeOrder.items[0].glassType}</strong> - Ukuran: <strong>${activeOrder.items[0].length} x ${activeOrder.items[0].width} cm</strong> (T: ${activeOrder.items[0].thick}mm)</p>
                <div class="checkbox-group my-2">
                    <label><input type="checkbox" checked disabled> Sub-Proses Potong (HT)</label> &nbsp;
                    <label><input type="checkbox" checked> Sub-Proses Gosok Halus (GM)</label> &nbsp;
                    <label><input type="checkbox"> Sub-Proses Bevel (BV)</label>
                </div>
                <div class="action-btn-row mt-3">
                    <button class="btn-primary" onclick="finishDivisionJob('${activeOrder.id}')"><i class="fa-solid fa-circle-check"></i> Selesai Pekerjaan Divisi Ini</button>
                    <button class="btn-secondary" onclick="openInputScrapModal()"><i class="fa-solid fa-recycle"></i> + Input Sisa Potongan Kaca</button>
                    <button class="btn-secondary text-danger" onclick="reportDamagedGlass('${activeOrder.id}')"><i class="fa-solid fa-circle-exclamation"></i> Laporkan Kaca Cacat/Retak</button>
                </div>
            </div>
        `;
    }

    queue.innerHTML = store.orders.filter(o => o.status === 'pengerjaan').map(o => `
        <tr>
            <td><strong>${o.id}</strong></td>
            <td>${o.items[0].glassType} (${o.items[0].length}x${o.items[0].width}cm)</td>
            <td><span class="badge-status-progress">${o.priority}</span></td>
            <td>${o.items[0].processes.join(' + ')}</td>
            <td>
                <button class="btn-primary-sm" onclick="startDivisionJob('${o.id}')"><i class="fa-solid fa-play"></i> Mulai Kerjakan</button>
            </td>
        </tr>
    `).join('');
}

function startDivisionJob(id) {
    logSocketEvent(`Divisi HT/GM mulai mengerjakan ${id}`);
    renderDivisionWorkstation();
}

function finishDivisionJob(id) {
    const order = store.orders.find(o => o.id === id);
    if (order) {
        order.divisionProgress.GM = 'Selesai';
        order.status = 'pengiriman';
        logSocketEvent(`Order ${id} selesai di divisi GM $\\rightarrow$ Siap Kirim ke Gudang/QC!`);
        renderOrdersTable();
        renderDashboardMetrics();
        renderDivisionWorkstation();
        renderDeliveriesTable();
    }
}

function reportDamagedGlass(id) {
    alert(`Laporan kaca cacat untuk orderan ${id} telah dikirim ke Admin Gudang. Sistem akan otomatis memasukkan biaya kerugian ke Laporan Finance.`);
    logSocketEvent(`ALERT: Kaca cacat dilaporkan pada order ${id}. Butuh ganti bahan baru.`);
}

// SCRAP GLASS MANAGEMENT (STOK KACA SISA RAK)
function renderScrapTable() {
    const body = document.getElementById('scrapTableBody');
    if (!body) return;
    body.innerHTML = store.scrapStock.map(s => `
        <tr>
            <td><strong>${s.id}</strong></td>
            <td>${s.type}</td>
            <td><strong>${s.length} x ${s.width} cm</strong></td>
            <td><span class="badge-role">${s.rak}</span></td>
            <td><span class="badge-status-success">${s.status}</span></td>
            <td>${s.date}</td>
            <td>
                <button class="btn-secondary-sm" onclick="useScrapInOrder('${s.id}')"><i class="fa-solid fa-check"></i> Pakai di Order</button>
            </td>
        </tr>
    `).join('');
}

function saveScrapGlass(e) {
    e.preventDefault();
    const type = document.getElementById('scrapType').value;
    const l = document.getElementById('scrapLength').value;
    const w = document.getElementById('scrapWidth').value;
    const rakZone = document.getElementById('scrapRakZone').value;
    const rakNum = document.getElementById('scrapRakNum').value;

    const newScrap = {
        id: `SCRAP-00${store.scrapStock.length + 1}`,
        type: type,
        length: parseFloat(l),
        width: parseFloat(w),
        rak: `Rak ${rakZone}${rakNum}`,
        date: new Date().toISOString().split('T')[0],
        status: 'Layak Pakai'
    };

    store.scrapStock.unshift(newScrap);
    logSocketEvent(`Kaca Sisa Baru Ter-input: ${type} (${l}x${w}cm) di Rak ${rakZone}${rakNum}`);
    closeModal('modalInputScrap');
    renderScrapTable();
    renderDashboardMetrics();
}

// DELIVERIES & 4-COLOR WAYBILL SYSTEM
function renderDeliveriesTable() {
    const readyBody = document.getElementById('readyShipBody');
    const historyBody = document.getElementById('deliveryHistoryBody');
    if (!readyBody || !historyBody) return;

    readyBody.innerHTML = store.orders.filter(o => o.status === 'pengiriman').map(o => {
        const waybillColor = o.paymentStatus === 'Lunas' ? 'Putih' : 'Merah';
        const colorBadgeClass = waybillColor === 'Putih' ? 'badge-status-success' : 'badge-status-progress text-danger';

        return `
            <tr>
                <td><input type="checkbox" value="${o.id}"></td>
                <td><strong>${o.id}</strong></td>
                <td><strong>${o.customerName}</strong><br><small class="text-muted">${o.address}</small></td>
                <td>${o.items[0].glassType} (${o.items[0].length}x${o.items[0].width}cm)</td>
                <td><span class="${colorBadgeClass}">${o.paymentStatus}</span></td>
                <td><strong class="${waybillColor === 'Merah' ? 'text-danger' : 'text-success'}">Surat Jalan ${waybillColor}</strong></td>
                <td>
                    <button class="btn-primary-sm" onclick="openWaybillModal('${o.id}')"><i class="fa-solid fa-print"></i> Cetak Surat Jalan</button>
                </td>
            </tr>
        `;
    }).join('');

    historyBody.innerHTML = store.deliveries.map(d => `
        <tr>
            <td><strong>${d.id}</strong></td>
            <td>2026-08-10 22:15</td>
            <td>${d.driverName} <br><small class="text-muted">${d.vehicle}</small></td>
            <td><span class="badge-status-success">${d.status}</span></td>
            <td><span class="text-success">${d.photoProof}</span></td>
        </tr>
    `).join('');
}

function openWaybillModal(orderId) {
    const order = store.orders.find(o => o.id === orderId);
    if (!order) return;

    const isLunas = order.paymentStatus === 'Lunas';
    const waybillColor = isLunas ? 'Putih' : 'Merah';
    const sisaTagihan = order.totalPrice - order.paidAmount;

    const printable = document.getElementById('printableWaybillArea');
    printable.innerHTML = `
        <div class="waybill-sheet ${waybillColor.toLowerCase()}">
            <div class="waybill-header">
                <div>
                    <h2>SYP GLASS MANUFACTURING</h2>
                    <p>Jl. Industri Kaca No. 108, Bandung | WA: 0812-3456-7890</p>
                </div>
                <div class="text-right">
                    <h3>SURAT JALAN PENGIRIMAN</h3>
                    <p><strong>NO. SJ: SJ-2026-${order.id.split('-')[1]}</strong></p>
                    <span class="badge-role" style="font-size: 14px; padding: 4px 10px;">LEMBAR ${waybillColor.toUpperCase()} (${isLunas ? 'KONSUMEN LUNAS' : 'TAGIHAN COD DRIVER'})</span>
                </div>
            </div>

            <div class="waybill-grid">
                <div>
                    <p><strong>Tujuan Pengiriman (Konsumen):</strong></p>
                    <p>${order.customerName}</p>
                    <p>${order.address}</p>
                    <p>Telp: ${order.phone}</p>
                </div>
                <div>
                    <p><strong>Info Ekspedisi / Driver:</strong></p>
                    <p>Supir: Pak Budi (Driver DC)</p>
                    <p>Kendaraan: Engkel Box (D 8472 AB)</p>
                    <p>Tgl Kirim: 10 Agustus 2026</p>
                </div>
            </div>

            <table class="waybill-table">
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Deskripsi Barang & Ukuran</th>
                        <th>Sub-Proses</th>
                        <th>Qty</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>1</td>
                        <td>${order.items[0].glassType} (${order.items[0].length} x ${order.items[0].width} cm)</td>
                        <td>${order.items[0].processes.join(', ')}</td>
                        <td>${order.items[0].qty} lembar</td>
                    </tr>
                </tbody>
            </table>

            ${!isLunas ? `
                <div style="background: #ffe5e5; border: 2px solid #ff3333; padding: 12px; margin-bottom: 16px; border-radius: 4px;">
                    <strong style="color: #cc0000; font-size: 16px;">⚠️ PERHATIAN DRIVER (SURAT JALAN MERAH):</strong>
                    <p style="color: #cc0000; margin-top: 4px;">Status Pembayaran: <strong>BELUM LUNAS</strong>. Driver wajib menagih Sisa Pembayaran COD sebesar: <strong style="font-size: 18px;">Rp ${sisaTagihan.toLocaleString()}</strong> sebelum menyerahkan barang!</p>
                </div>
            ` : ''}

            <div class="waybill-signatures">
                <div class="sig-box">
                    <p>Pengirim / Admin Toko</p>
                    <br><br>
                    <p>( ........................... )</p>
                </div>
                <div class="sig-box">
                    <p>Supir / Driver</p>
                    <br><br>
                    <p>( Pak Budi )</p>
                </div>
                <div class="sig-box">
                    <p>Penerima / Konsumen</p>
                    <br><br>
                    <p>( ${order.customerName} )</p>
                </div>
            </div>
        </div>
    `;

    document.getElementById('modalWaybill').style.display = 'flex';
}

function confirmPrintWaybill() {
    alert("Surat Jalan 4 Lembar berhasil dicetak! Data pengiriman telah masuk ke daftar supir.");
    closeModal('modalWaybill');
}

// MASTER STOCK TABLE RENDERER
function renderMasterStockTable() {
    const body = document.getElementById('masterStockBody');
    if (!body) return;

    body.innerHTML = store.masterStock.map(s => {
        let badgeClass = 'badge-status-success';
        if (s.status === 'Menipis') badgeClass = 'badge-status-progress';
        if (s.status === 'Kosong') badgeClass = 'badge-status-progress text-danger';

        return `
            <tr>
                <td><span class="badge-role">${s.category}</span></td>
                <td><strong>${s.name}</strong></td>
                <td>${s.size}</td>
                <td><strong>${s.qty} Pcs/Lbr</strong></td>
                <td>${s.rak}</td>
                <td><span class="${badgeClass}">${s.status}</span></td>
                <td>
                    <button class="btn-primary-sm" onclick="requestRestock('${s.id}')"><i class="fa-solid fa-boxes-stacked"></i> Restock</button>
                </td>
            </tr>
        `;
    }).join('');
}

function requestRestock(id) {
    alert(`Pengajuan restock untuk item ${id} telah dibuat oleh Admin Gudang dan dikirim ke Admin Toko!`);
    logSocketEvent(`Admin Gudang mengajukan Restock untuk item ${id}`);
}

// FINANCE TABLE RENDERER
function renderFinanceTable() {
    const body = document.getElementById('financeTableBody');
    if (!body) return;

    body.innerHTML = store.orders.map(o => {
        const estHPP = o.subtotal * 0.55;
        const profit = o.totalPrice - estHPP;

        return `
            <tr>
                <td><strong>${o.id}</strong></td>
                <td>${o.customerName}</td>
                <td><strong>Rp ${o.totalPrice.toLocaleString()}</strong></td>
                <td>Rp ${estHPP.toLocaleString()}</td>
                <td>Rp ${o.priorityFee.toLocaleString()}</td>
                <td><strong class="text-success">Rp ${profit.toLocaleString()}</strong></td>
            </tr>
        `;
    }).join('');
}

// CALCULATOR LOGIC IN LANDING PAGE & MODAL
function calculatePublicEstimate() {
    const l = parseFloat(document.getElementById('calcLength').value) || 0;
    const w = parseFloat(document.getElementById('calcWidth').value) || 0;
    const area = (l * w) / 10000; // m2
    const rate = parseFloat(document.getElementById('calcGlassType').value) || 0;

    let optionsTotal = 0;
    document.querySelectorAll('.calc-opt:checked').forEach(chk => {
        optionsTotal += parseFloat(chk.value);
    });

    const acc = parseFloat(document.getElementById('calcAcc').value) || 0;
    const priority = document.getElementById('calcPriority').checked ? 150000 : 0;

    const total = (area * rate) + (optionsTotal * area) + acc + priority;

    document.getElementById('resArea').innerText = area.toFixed(2) + ' m²';
    document.getElementById('resTotal').innerText = Math.round(total).toLocaleString();
}

function sendWAQuote() {
    const l = document.getElementById('calcLength').value;
    const w = document.getElementById('calcWidth').value;
    const total = document.getElementById('resTotal').innerText;
    const msg = `Halo Syp Glass, saya ingin berkonsultasi pemesanan kaca custom ukuran ${l}x${w} cm dengan estimasi total Rp ${total}. Mohon dibantu.`;
    window.open(`https://wa.me/6281234567890?text=${encodeURIComponent(msg)}`, '_blank');
}

function calculateOrderPrice() {
    const l = parseFloat(document.getElementById('orderLength').value) || 0;
    const w = parseFloat(document.getElementById('orderWidth').value) || 0;
    const area = (l * w) / 10000;

    let subtotal = area * 500000; // base rate
    if (subtotal < 250000) subtotal = 250000;

    const isPriority = document.getElementById('orderPriority').value === 'Prioritas';
    const priorityFee = isPriority ? 150000 : 0;
    const total = subtotal + priorityFee;

    document.getElementById('lblSubtotal').innerText = 'Rp ' + Math.round(subtotal).toLocaleString();
    document.getElementById('lblPriorityFee').innerText = 'Rp ' + priorityFee.toLocaleString();
    document.getElementById('lblTotalOrder').innerText = 'Rp ' + Math.round(total).toLocaleString();
}

// GLASS SIMULATOR EFFECTS
function updateGlassSimulator() {
    const type = document.getElementById('simType').value;
    const thick = document.getElementById('simThick').value;
    document.getElementById('simThickVal').innerText = thick + ' mm';

    const viewport = document.getElementById('glassViewport');
    const bevelOverlay = document.getElementById('glassBevelOverlay');

    if (type === 'clear') {
        viewport.style.background = `rgba(255, 255, 255, ${0.1 + (thick * 0.01)})`;
        viewport.style.backdropFilter = `blur(${thick * 0.2}px)`;
        document.getElementById('simStatLight').innerText = (92 - thick) + '%';
        document.getElementById('simStatPrivacy').innerText = 'Low (Transparan)';
    } else if (type === 'frosted') {
        viewport.style.background = 'rgba(230, 240, 255, 0.6)';
        viewport.style.backdropFilter = 'blur(16px)';
        document.getElementById('simStatLight').innerText = '45%';
        document.getElementById('simStatPrivacy').innerText = 'High (Kabut Blur)';
    } else if (type === 'tinted') {
        viewport.style.background = 'rgba(40, 30, 20, 0.7)';
        viewport.style.backdropFilter = 'blur(4px)';
        document.getElementById('simStatLight').innerText = '25%';
        document.getElementById('simStatPrivacy').innerText = 'Medium (Gelap)';
    } else {
        viewport.style.background = 'linear-gradient(135deg, rgba(200,220,255,0.8), rgba(255,255,255,0.4))';
        document.getElementById('simStatLight').innerText = '85% Reflective';
        document.getElementById('simStatPrivacy').innerText = 'Full Mirror';
    }

    document.getElementById('simStatWeight').innerText = (thick * 2.5).toFixed(1) + ' kg/m²';
}

// MODAL UTILITIES
function openNewOrderModal() {
    document.getElementById('modalNewOrder').style.display = 'flex';
    calculateOrderPrice();
}

function openInputScrapModal() {
    document.getElementById('modalInputScrap').style.display = 'flex';
}

function openRevisionModal(id) {
    document.getElementById('modalRevision').style.display = 'flex';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

function saveNewOrder(e) {
    e.preventDefault();
    const cust = document.getElementById('orderCustName').value;
    const phone = document.getElementById('orderCustPhone').value;
    const address = document.getElementById('orderCustAddress').value;
    const glassType = document.getElementById('orderGlassType').value;
    const l = parseFloat(document.getElementById('orderLength').value);
    const w = parseFloat(document.getElementById('orderWidth').value);
    const priority = document.getElementById('orderPriority').value;
    const deadline = document.getElementById('orderDeadline').value;

    const newOrder = {
        id: `SPO-01${store.orders.length + 28}`,
        customerName: cust,
        phone: phone,
        address: address,
        date: new Date().toISOString().split('T')[0],
        items: [
            {
                glassType: glassType,
                length: l,
                width: w,
                thick: 5,
                qty: 1,
                processes: ['HT', 'GM'],
                acc: document.getElementById('orderAcc').value
            }
        ],
        priority: priority,
        deadline: deadline,
        subtotal: 450000,
        priorityFee: priority === 'Prioritas' ? 150000 : 0,
        totalPrice: priority === 'Prioritas' ? 600000 : 450000,
        paidAmount: 300000,
        paymentStatus: 'DP (50%)',
        status: 'pengerjaan',
        currentDivision: 'divisi_ht',
        divisionProgress: { HT: 'Sedang Dikerjakan', GM: 'Belum', BV: 'N/A', Etsa: 'N/A' },
        revisionStatus: null,
        usedScrapRak: document.getElementById('chkUseScrap').checked ? 'F7' : null
    };

    store.orders.unshift(newOrder);
    logSocketEvent(`Admin Toko membuat SPO Baru #${newOrder.id} (${cust}) $\\rightarrow$ Langsung masuk Divisi HT!`);
    closeModal('modalNewOrder');
    renderOrdersTable();
    renderDashboardMetrics();
    renderDivisionWorkstation();
}

function saveOrderAsDraft() {
    alert("Orderan berhasil disimpan di tab DRAF!");
    closeModal('modalNewOrder');
}

function sendDraftToGudang(id) {
    const order = store.orders.find(o => o.id === id);
    if (order) {
        order.status = 'pengerjaan';
        logSocketEvent(`Draf #${id} telah dikirim ke Gudang untuk disosiasi divisi.`);
        renderOrdersTable();
        renderDashboardMetrics();
    }
}

function submitOrderRevision() {
    const notes = document.getElementById('revNotes').value;
    alert(`Revisi telah dikirim! Status orderan berubah menjadi "Revisi HT [Proses]" dan notifikasi prioritas dikirim ke Divisi HT.`);
    logSocketEvent(`REVISI PRIORITAS SUBMITTED: ${notes}`);
    closeModal('modalRevision');
}
