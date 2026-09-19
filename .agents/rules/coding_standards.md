---
description: Aturan resmi proyek System-Magang-glassy untuk standar UI Clean White UTB, arsitektur modular, dan larangan raw emoji.
trigger: always_on
---

# Aturan Proyek System-Magang-glassy (Antigravity Rules)

1. **Tema UI**: WAJIB Clean White Enterprise SaaS / ERP.
   - Primary Blue: `#1b68b0`
   - Secondary Green: `#70b03c`
   - Dark Slate Text: `#242222` / `text-slate-800`
   - Form Inputs: `bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#1b68b0]`
   - DILARANG menggunakan tema gelap / dark mode di dashboard operasional dan modal.

2. **Ikonografi**:
   - DILARANG menggunakan RAW TEXT EMOJI (📦, 🚚, ⚙️, 🚪, 🗑️, 📝, ✅, dll.) pada tombol, judul, atau badge status.
   - WAJIB gunakan SVG icon dari `lucide-react`.

3. **Struktur Komponen (Anti-Monolitik)**:
   - SEMUA Pop-up Modal WAJIB dibuat terpisah di `resources/js/Components/Modals/`.
   - SEMUA Tab Konten Dashboard WAJIB dibuat terpisah di `resources/js/Components/DashboardTabs/`.
   - `Dashboard.jsx` HANYA berfungsi sebagai pengatur state, sidebar, dan perutean tab.

4. **Integritas Bisnis**:
   - Dilarang menghapus handler form submission atau mengganti endpoint Inertia dengan data palsu.
   - Gunakan `useForm()` atau `router` dari `@inertiajs/react`.

5. **Protokol Verifikasi Wajib**:
   - Setelah selesai mengedit file React/Tailwind/JSX, AI Agent WAJIB menjalankan `npm run build` di terminal dan memastikan exit code 0 tanpa error.
