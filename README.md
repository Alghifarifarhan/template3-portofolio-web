# 🚀 Dynamic Portfolio & Blog CMS Template 3 (Next.js & Firebase)

Website portofolio modern, dinamis, dan responsif yang dibangun menggunakan **Next.js**, **TypeScript**, **Tailwind CSS**, dan **Google Firebase**. Dilengkapi dengan **Panel Admin Interaktif (`/admin`)** berbasis cloud untuk mengelola seluruh konten profil, portofolio proyek, artikel blog, sistem komentar, serta analitik statistik pengunjung secara _realtime_ tanpa perlu mengubah kode sumber.

---

## 📌 Informasi & Atribusi Proyek (Project Modification Notice)

> **Catatan Penting mengenai Modifikasi:**  
> Proyek ini merupakan **versi modifikasi mendalam** dari template portofolio statis asli karya **[tomcomtang](https://github.com/tomcomtang)** yang didistribusikan oleh **[ThemeWagon](https://themewagon.com/)** di bawah lisensi **ISC**.
>
> Hak cipta desain dan kode awal tetap diakui dan tercantum permanen pada **footer website**:
> ```
> All rights reserved by tomcomtang Distributed by ThemeWagon.
> ```
> **Pengembangan & Fitur Baru yang Ditambahkan pada Versi Ini:**
> - Integrasi **Google Firebase Authentication** untuk pengamanan halaman panel admin.
> - Integrasi **Cloud Firestore Database** sebagai CMS dinamis realtime.
> - **Interactive Admin Dashboard (`/admin`)** dengan tab manajemen konten, gambar, teks, resume, dan password.
> - Sistem blog interaktif dengan dukungan **Markdown**, syntax highlighter, dan **Komentar Realtime**.
> - **Visitor & Page View Analytics** otomatis.
> - Fitur cerdas **Google Drive Image Direct-Link Converter & Auto-Crop**.
> - Fitur **Fresh Clean Slate (1-Klik Bersihkan Data Dummy)** untuk mempermudah pengguna baru.

---

## 🛠️ Framework & Teknologi yang Digunakan

| Kategori | Teknologi | Deskripsi / Penggunaan |
| :--- | :--- | :--- |
| **Core Framework** | [Next.js](https://nextjs.org/) (v14+) | Framework React dengan App Router, SSR, dan Static Export |
| **Library UI** | [React](https://react.dev/) (v18) | Library JavaScript untuk antarmuka pengguna berbasis komponen |
| **Bahasa** | [TypeScript](https://www.typescriptlang.org/) | Pengetikan statis untuk keandalan dan skalabilitas kode |
| **Styling & CSS** | [Tailwind CSS](https://tailwindcss.com/) | Framework utility-first CSS untuk desain modern & responsif |
| **Typography & Animation** | `@tailwindcss/typography`, `tailwindcss-animate` | Tipografi artikel blog dan transisi UI yang halus |
| **Backend & Cloud** | [Google Firebase JS SDK](https://firebase.google.com/) (v12) | Layanan cloud serverless untuk Auth & Firestore Database |
| **Autentikasi** | Firebase Authentication | Mengamankan login panel admin menggunakan email & password |
| **Database** | Cloud Firestore | Menyimpan data profil, riwayat kerja, proyek, artikel, & komentar |
| **Komponen UI** | [Radix UI](https://www.radix-ui.com/) | Komponen UI aksesibel seperti Dropdown Menu dan Slot |
| **Icons** | [Lucide React](https://lucide.dev/) | Kumpulan ikon vektor modern dan ringan |
| **Theme Management** | `next-themes` | Manajemen tema Dark Mode dan Light Mode yang mulus |
| **Markdown Engine** | `react-markdown`, `remark-gfm`, `marked` | Parsing dan rendering teks artikel blog berbasis format Markdown |
| **Code Highlighting** | `react-syntax-highlighter` | Penyorotan sintaks kode blok pada artikel blog |
| **Utilitas Tambahan** | `date-fns`, `clsx`, `tailwind-merge` | Format tanggal dan penggabungan class Tailwind kondisional |

---

## ✨ Fitur-Fitur Utama

1. **🧭 Dynamic Content Management (Admin Panel)**
   - Akses dasbor melalui URL `/admin`.
   - Ubah nama, foto banner, bio, deskripsi, tautan sosial media, dan copyright langsung dari browser.
2. **💼 Showcase Portofolio Proyek**
   - Tambah, ubah urutan, edit detail, serta hapus proyek karya Anda.
   - Modal pop-up interaktif untuk melihat deskripsi lengkap dan screenshot proyek.
3. **📝 Blog & Commenting System**
   - Tulis artikel menggunakan format Markdown lengkap dengan gambar dan blok kode.
   - Fitur komentar publik bagi pengunjung dengan kemampuan moderasi/hapus komentar oleh admin.
4. **📊 Statistik Kunjungan (Visitor Analytics)**
   - Penghitung otomatis total kunjungan website dan pembacaan artikel.
5. **🖼️ Google Drive Direct Image Converter**
   - Cukup salin tautan berbagi publik Google Drive, sistem akan otomatis mengonversinya menjadi URL gambar langsung dengan skala rasio rapi (*auto-crop*).
6. **🧹 1-Klik Bersihkan Data Contoh (Clean Slate)**
   - Tombol instan untuk menghapus semua data dummy bawaan template dan mereset portofolio menjadi kosong siap pakai.
7. **🌓 Dark Mode & Light Mode**
   - Tampilan adaptif sesuai preferensi sistem pengguna atau diubah manual melalui tombol toggle tema.

---

## 📁 Struktur Folder Proyek

```text
├── public/                 # Asset statis publik (gambar, favicon, icon)
├── scripts/                # Script pembantu (generate-posts.js)
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── about/          # Halaman About & Experience
│   │   ├── admin/          # Dasbor Admin CMS (/admin)
│   │   ├── posts/          # Halaman Blog & detail artikel ([slug])
│   │   ├── projects/       # Halaman daftar Portofolio Proyek
│   │   ├── globals.css     # Konfigurasi Tailwind & Global CSS
│   │   ├── layout.tsx      # Root Layout & Provider
│   │   └── page.tsx        # Halaman Beranda (Home)
│   ├── components/         # Komponen UI (Navbar, Footer, Modal, Cards, dll)
│   ├── config/             # Konfigurasi default & metadata konten
│   ├── context/            # Context Provider (SiteDataContext untuk Firestore)
│   ├── lib/
│   │   └── firebase.ts     # Inisialisasi Firebase SDK & helper Google Drive
│   └── types/              # Deklarasi tipe data TypeScript
├── .env.example            # Template variabel lingkungan (Environment Variables)
├── firebase.json           # Konfigurasi deploy Firebase Hosting
├── package.json            # Daftar dependensi dan scripts npm
├── README.md               # Dokumentasi utama proyek
└── README2.md              # Buku panduan lengkap penggunaan Panel Admin
```

---

## 📋 Prasyarat Sistem (Prerequisites)

Sebelum menjalankan proyek ini, pastikan Anda telah memasang:
- **Node.js**: Versi `18.x` atau lebih baru ([Unduh Node.js](https://nodejs.org/)).
- **npm** (bawaan Node.js), **pnpm**, atau **yarn**.
- **Akun Google Firebase**: Akun gratis (*Spark Plan*) di [Firebase Console](https://console.firebase.google.com/).

---

## ⚙️ Panduan Setup Firebase

Website ini membutuhkan konfigurasi Firebase untuk mengaktifkan fitur Admin Panel dan Database.

### 1. Buat Proyek Firebase Baru
1. Buka [Firebase Console](https://console.firebase.google.com/) dan buat proyek baru.
2. Daftarkan aplikasi Web (**Web App `</>`**) dan salin objek konfigurasi `firebaseConfig`.

### 2. Aktifkan Firebase Authentication
1. Di Firebase Console, masuk ke menu **Build** > **Authentication**.
2. Klik **Get Started** dan aktifkan metode **Email/Password**.
3. Buka tab **Users** lalu klik **Add user** untuk membuat akun email dan password pertama Anda (digunakan untuk login ke `/admin`).

### 3. Aktifkan Cloud Firestore Database
1. Masuk ke menu **Build** > **Firestore Database**, klik **Create Database**.
2. Pilih lokasi server database terdekat (misal: `asia-southeast2` Jakarta).
3. Di tab **Rules**, pastikan aturan keamanan Firestore mengizinkan pembacaan publik dan penulisan oleh user terotentikasi:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Pengunjung dapat membaca data profil, komentar, dan post
       // Hanya admin yang sudah login yang dapat menulis/mengubah data website
       match /site_content/{document=**} {
         allow read: if true;
         allow write: if request.auth != null;
       }
       match /comments/{commentId} {
         allow read: if true;
         allow create: if true;
         allow update, delete: if request.auth != null;
       }
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

---

## 💻 Cara Mengkloning & Menjalankan Proyek Secara Lokal

Ikuti langkah-langkah di bawah ini:

### 1. Kloning Repository
Buka terminal Anda dan jalankan perintah:
```bash
git clone https://github.com/USERNAME_GITHUB_ANDA/NAMA_REPOSITORY.git
cd NAMA_REPOSITORY
```

### 2. Install Dependensi
Pasang seluruh paket pustaka yang dibutuhkan:
```bash
npm install
```

### 3. Konfigurasi Firebase SDK

Tersedia **2 opsi** untuk memasukkan konfigurasi Firebase:

#### Opsi A: Menggunakan File `.env.local` (Direkomendasikan)
Salin file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```
Buka `.env.local` dan isi nilainya dengan data dari Firebase Console Anda:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=proyek-anda.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=proyek-anda
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=proyek-anda.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

#### Opsi B: Mengisi Langsung di `src/lib/firebase.ts`
Anda juga dapat membuka file [`src/lib/firebase.ts`](src/lib/firebase.ts) dan mengganti template konfigurasi `firebaseConfig` dengan nilai dari Firebase SDK Anda.

### 4. Jalankan Development Server
Mulai server pengembangan lokal:
```bash
npm run dev
```

Buka browser dan kunjungi:
- **Halaman Utama**: [http://localhost:3000](http://localhost:3000)
- **Halaman Admin**: [http://localhost:3000/admin](http://localhost:3000/admin) (masuk dengan akun Firebase Auth yang telah Anda buat sebelumnya).

> 💡 **Panduan Penggunaan Admin Panel**:  
> Silakan baca file [`README2.md`](README2.md) untuk petunjuk lengkap langkah demi langkah pengelolaan konten melalui panel admin.

---

## 📄 Lisensi (License)

- **Desain & Kode Asli Template**: Copyright &copy; [tomcomtang](https://github.com/tomcomtang) & Didistribusikan oleh [ThemeWagon](https://themewagon.com/) di bawah lisensi **[ISC License](LICENSE)**.
- **Modifikasi & Fitur CMS Tambahan**: Didistribusikan di bawah lisensi terbuka yang sama.
- Seluruh atribusi template asli dipertahankan secara utuh pada footer website.
