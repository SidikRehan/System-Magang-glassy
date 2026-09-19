# 🏛️ PANDUAN PENGEMBANGAN & STANDAR KODING PROYEK (ANTIGRAVITY RULES)

> **PERHATIAN KHUSUS KEPADA SELURUH AI AGENT ANTIGRAVITY:**
> Dokumen ini adalah aturan wajib (**MANDATORY RULES**) proyek repositori **System-Magang-glassy**.
> Anda WAJIB mematuhi seluruh panduan arsitektur, standar desain, dan protokol verifikasi di bawah ini sebelum membuat, mengedit, atau merefaktor kode apapun. DILARANG MELANGGAR ATURAN INI.

---

## 1. TECH STACK & KONTEKS PROYEK
- **Aplikasi**: Sistem Manajemen Operasional Pabrik & Toko Kaca (Universitas Teknologi Bandung - UTB).
- **Backend**: Laravel 11.x (PHP 8.2+)
- **Frontend**: React 18.x + Inertia.js (`@inertiajs/react`)
- **Styling**: TailwindCSS 3.x + PostCSS
- **Bundler**: Vite 7.x
- **Database**: MySQL
- **Icon Library**: `lucide-react` (HANYA gunakan icon SVG dari library ini, DILARANG memakai library lain tanpa izin)

---

## 2. STANDAR DESAIN & TEMA VISUAL (CLEAN WHITE ENTERPRISE SAAS)
Seluruh antarmuka dashboard, halaman manajemen, tabel, dan pop-up modal WAJIB menggunakan tema **Clean White Enterprise SaaS / ERP** yang profesional dan selaras dengan warna korporat UTB.

### 🎨 Palet Warna Resmi UTB
| Elemen | Nilai CSS / HEX | Keterangan & Penggunaan |
| :--- | :--- | :--- |
| **Primary Blue** | `#1b68b0` | Brand UTB, tombol utama, border fokus ring, badge aktif |
| **Primary Hover** | `#15528c` | State hover tombol biru |
| **Secondary Green** | `#70b03c` | Aksi sukses, tombol simpan/order, deal approval, status lunas |
| **Secondary Hover** | `#5f9733` | State hover tombol hijau |
| **Dark Slate Text** | `#242222` / `text-slate-800` | Teks judul, label field, nilai angka penting (WAJIB kontras tinggi) |
| **Muted Text** | `text-slate-500` / `text-slate-400` | Teks subjudul, deskripsi pembantu, timestamp |
| **Card / Container** | `bg-white border border-slate-200 shadow-sm` | Kontainer tabel, panel metrik, widget |
| **App Background** | `bg-slate-50` atau `bg-slate-100/60` | Latar belakang halaman dashboard |
| **Form Inputs** | `bg-slate-50 border-slate-200 text-slate-800` | Input teks, select box, textarea |
| **Input Focus** | `focus:bg-white focus:border-[#1b68b0] focus:ring-2 focus:ring-[#1b68b0]/15` | State aktif saat input diketik |

### 🚫 LARANGAN KERAS TAMPILAN (STRICTLY FORBIDDEN)
1. **DILARANG MENGGUNAKAN TEMA GELAP (DARK MODE)** pada dashboard internal dan pop-up modal. Jangan pernah memakai background gelap pekat seperti `bg-slate-900`, `bg-gray-900`, atau `bg-neutral-900` untuk kontainer data dan modal.
2. **DILARANG KERAS MENGGUNAKAN RAW TEXT EMOJI** pada UI tombol, judul modal, tab menu, atau badge status (misal: 📦, 🚚, ⚙️, 🚪, 🗑️, 📝, ✅, ❌, ⚠️).
   - **SOLUSI WAJIB**: Selalu import dan gunakan komponen vektor SVG dari `lucide-react` (misal: `<Package />`, `<Truck />`, `<Settings />`, `<LogOut />`, `<Trash2 />`, `<FileText />`, `<CheckCircle2 />`, dll.).
3. **DILARANG menggunakan teks abu-abu pudar / kontras rendah** pada judul tabel dan label form yang menyulitkan pengguna membaca data.

---

## 3. ARSITEKTUR KOMPONEN & ATURAN MODULARISASI (ANTI-MONOLITIK)
Salah satu penyebab utama kode rusak pada "vibe coding" adalah file monolitik ribuan baris. Anda WAJIB memecah kode menjadi komponen modular:

```text
resources/js/
├── Components/
│   ├── Modals/              <-- SEMUA pop-up modal WAJIB disimpan di folder ini!
│   │   ├── NewOrderModal.jsx
│   │   ├── EditDraftOrderModal.jsx
│   │   ├── BatchWaybillModal.jsx
│   │   └── ...
│   ├── DashboardTabs/       <-- Setiap konten tab dashboard WAJIB disimpan di folder ini!
│   │   ├── OrdersTab.jsx
│   │   ├── GlassStockTab.jsx
│   │   ├── ToolsTab.jsx
│   │   └── ...
│   ├── Modal.jsx            <-- Base Modal Dialog wrapper
│   └── ...
├── Pages/
│   ├── Dashboard.jsx        <-- HANYA sebagai orkestrator state, routing tab, & sidebar layout!
│   └── ...
```

### 📋 Aturan Pembuatan Pop-up Modal
Semua modal baru maupun editan WAJIB mengikuti standar anatomi ini:
1. **Backdrop**:
   ```jsx
   className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
   ```
2. **Kartu Kontainer**:
   ```jsx
   className="bg-white border border-slate-200 rounded-3xl w-full max-w-[md|lg|xl|2xl|4xl] p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-800"
   ```
3. **Header Modal**:
   - Harus memiliki icon badge di kiri: `w-10 h-10 rounded-2xl bg-[#1b68b0]/10 flex items-center justify-center text-[#1b68b0]`
   - Judul tebal `#242222` dan subjudul singkat `text-slate-500`
   - Tombol tutup silang di kanan atas menggunakan `<X className="w-5 h-5" />` dari `lucide-react`.

---

## 4. INTEGRITAS BACKEND, DATA BINDING, & INERTIA.JS
1. **DILARANG MENGHAPUS LOGIKA BISNIS**:
   - Jangan pernah menghapus fungsi pengiriman form (`handleSubmit`), kalkulasi harga/luas kaca, atau alur validasi.
   - Jangan pernah mengganti form yang terhubung ke backend dengan *mock dummy state* lokal.
2. **Routing & Form Submission**:
   - Selalu gunakan helper Inertia: `router.post()`, `router.put()`, `router.delete()`, atau hook `useForm()` dari `@inertiajs/react`.
   - Tampilkan pesan error validasi dari controller (`errors.<field_name>`) di bawah input field yang bersangkutan.
3. **Database & Migrations**:
   - Dilarang mengubah migration lama yang sudah dijalankan jika proyek sedang berjalan. Buat migration baru jika ingin menambah kolom.

---

## 5. PROTOKOL VERIFIKASI WAJIB (MANDATORY VERIFICATION PROTOCOL)
Setiap kali Antigravity selesai melakukan modifikasi pada file React, JSX, atau Tailwind:

1. **WAJIB jalankan build verifikasi melalui terminal:**
   ```powershell
   npm run build
   ```
2. **Kriteria Kelulusan**:
   - Output harus menghasilkan pesan `✓ built in ...s` dengan **Exit code: 0**.
   - Jika terdapat error kompilasi (misal: unclosed JSX tag, missing import, typo variable), Anda **WAJIB langsung memperbaikinya** hingga `npm run build` sukses.
3. **Batasan Subagent**:
   - Jangan menjalankan browser subagent otomatis kecuali jika pengguna secara eksplisit meminta pengujian visual browser. Utamakan inspeksi kode dan `npm run build`.

---

## 6. CARA MEMBUAT FITUR BARU (WORKFLOW CHECKLIST)
Sebelum Anda menulis kode untuk permintaan user, ikuti alur ini:
- [ ] **Langkah 1**: Periksa apakah ada komponen yang sudah ada dan bisa digunakan kembali di `resources/js/Components/`.
- [ ] **Langkah 2**: Jika membuat modal baru, buat file baru di `resources/js/Components/Modals/NamaModal.jsx`.
- [ ] **Langkah 3**: Gunakan warna UTB (`#1b68b0`, `#70b03c`, `#242222`), input `bg-slate-50`, dan icon `lucide-react`.
- [ ] **Langkah 4**: Pastikan handler form Inertia terhubung dengan benar ke rute Laravel.
- [ ] **Langkah 5**: Jalankan `npm run build` untuk memvalidasi seluruh kode bebas error.
