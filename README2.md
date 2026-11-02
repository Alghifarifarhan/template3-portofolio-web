# 📘 Panduan Singkat Penggunaan Panel Admin Website Portofolio

Selamat datang! Dokumen ini berisi petunjuk sederhana dan mudah dipahami untuk mengelola seluruh isi teks, gambar, link, fitur pembersihan data contoh bawaan website, serta informasi seputar batasan kunjungan website Anda.

---

## 🔑 1. Cara Masuk ke Halaman Admin

1. Buka browser (Google Chrome, Safari, dll).
2. Ketikkan alamat website Anda diakhiri dengan `/admin`.
   - **Contoh Online**: `https://proyek-anda.web.app/admin`
   - **Contoh Komputer Lokal**: `http://localhost:3000/admin`
3. Masukkan **Email** dan **Password** admin Anda lalu klik **Login Admin**.

---

## 🧹 2. Cara Membersihkan Data Contoh Bawaan (Fresh Clean Slate)

Saat pertama kali website dibuka atau dihosting, website memuat data contoh (_dummy template_) seperti teks sapaan Kai, foto dummy coder, background SVG default, serta sample artikel & proyek.

Anda dapat membersihkan data contoh tersebut dengan sangat mudah:

### **Opsi A: 1-Klik Bersihkan Seluruh Data Contoh (Rekomendasi)**

1. Masuk ke halaman **Admin Panel** (`/admin`).
2. Klik tombol **`🧹 Bersihkan Data Contoh`** di bagian atas navbar admin, atau klik tombol pada **Banner Peringatan Kuning**, atau buka tab **`⚙️ System & Theme`** lalu pilih **`🧹 Bersihkan Semua Data Contoh Sekarang`**.
3. Konfirmasi popup peringatan.
4. **Hasilnya**: Seluruh teks sapaan, bio, deskripsi About, skill badges, pengalaman kerja, proyek contoh, artikel contoh, link gambar asset template terhapus bersih, dan total kunjungan direset menjadi 0.
5. Klik **`💾 Simpan Perubahan`** untuk memastikan data tersimpan permanen di cloud database.

### **Opsi B: Otomatis Bersihkan saat Menambah Proyek / Artikel / Pengalaman Baru**

- Saat Anda menekan tombol **`+ Tambah Project Baru`**, sistem secara cerdas akan langsung mengganti proyek contoh dengan proyek baru kosong milik Anda (tanpa membawa asset gambar template).
- Begitu pula saat Anda menekan **`+ Tambah Artikel Baru`** dan **`+ Tambah Experience`**.

### **Opsi C: Kosongkan Per Bagian (Per-Section)**

- Di setiap tab editor (Header & Footer, Home, About, Projects, Posts), tersedia tombol **`🧹 Kosongkan...`** untuk mengosongkan hanya bagian tertentu yang Anda inginkan.

---

## 📝 3. Cara Mengubah Teks & Konten Website

Setelah login, Anda akan melihat beberapa tab menu di bagian kiri (atau atas jika dari handphone):

1. **📊 Statistik Website**: Melihat jumlah total pengunjung, angka kunjungan per halaman, serta riwayat upload dan download.
2. **🧭 Header & Footer**: Mengubah nama website, nama author di navbar brand, menu navigasi, teks hak cipta (_copyright_), dan link akun media sosial.
3. **🏠 Home Section**: Mengubah kalimat sapaan utama (_greeting_), deskripsi singkat bio, label tombol, dan foto banner utama.
4. **👤 About & Experience**: Mengubah teks About, foto profil, daftar keahlian (_skill badges_), riwayat pengalaman kerja, serta link **Email Me**, **My Resume**, dan **My Certificate**.
5. **💼 Projects Section**: Menambah, mengedit, atau menghapus daftar proyek/portofolio karya Anda.
6. **📝 Posts & Articles**: Menambah, mengedit, atau menghapus artikel tulisan/blog beserta isi kontennya.
7. **💬 Komentar Blog**: Memantau dan menghapus komentar pengunjung pada artikel blog.
8. **⚙️ System & Theme**: Mengubah Password Admin, mengganti mode tampilan (Dark Mode / Light Mode), membersihkan data contoh (_Fresh Clean Slate_), atau mereset data ke awal template.

> 💡 **Penting**: Setiap kali selesai mengubah data, pastikan Anda menekan tombol **`💾 Simpan Perubahan`** di bagian atas panel agar data tersimpan secara permanen di database online.

---

## 🖼️ 4. Cara Menginput Gambar (Google Drive & Direct Link)

Seluruh kotak gambar di website ini sudah dilengkapi **pemotong otomatis (_auto-crop & fixed resolution_)**. Gambar yang Anda input akan otomatis menyesuaikan skala secara rapi tanpa merusak tampilan.

### **Cara Memakai Gambar dari Google Drive:**

1. Upload foto/gambar Anda ke **Google Drive**.
2. Klik kanan pada file gambar tersebut di Google Drive → pilih **Bagikan (_Share_)**.
3. Pada bagian Akses Umum (_General Access_), ubah dari _"Dibatasi"_ (_Restricted_) menjadi **`Siapa saja yang memiliki link` (_Anyone with the link_)**.
4. Klik **Salin Link (_Copy Link_)**.
5. Tempelkan (_paste_) link tersebut langsung ke kolom input gambar di Halaman Admin. **Sistem akan otomatis mengubahnya menjadi gambar yang langsung tampil di website!**

---

## 🔗 5. Cara Menginput Link (Tautan)

- **Link Email**: Bisa diisi alamat email langsung (misal: `namaanda@gmail.com`) atau format `mailto:namaanda@gmail.com`.
- **Link My Resume & My Certificate**: Tempelkan link file PDF atau link Google Drive resume/sertifikat Anda. _(Apabila link sertifikat dikosongkan, tombol sertifikat otomatis tersembunyi)_.
- **Link Proyek & Artikel**: Tempelkan URL lengkap diawali dengan `https://` (misal: `https://github.com/username/project`).

---

## 📈 6. Penjelasan Batasan Kunjungan Website (Firebase)

Website Anda menggunakan **Google Firebase Infrastructure** dengan paket **Spark Plan**. Berikut adalah kapasitas batasan yang diberikan setiap bulannya:

| Jenis Batasan                 | Kapasitas                     | Penjelasan Sederhana                                                   |
| :---------------------------- | :---------------------------- | :--------------------------------------------------------------------- |
| **Pengunjung Harian**         | **± 50.000 Kunjungan / Hari** | Sangat besar dan aman untuk trafik portofolio pribadi.                 |
| **Transfer Data (Bandwidth)** | **10 GB / Bulan**             | Jumlah total unduhan data gambar & teks oleh pengunjung dalam 1 bulan. |
| **Database Reads/Writes**     | **50.000 Pembacaan / Hari**   | Kapasitas pembaruan dan penampilan data secara realtime.               |

> 🛡️ **Apakah Kuota Ini Cukup?**  
> **Sangat Cukup!** Untuk website portofolio pribadi, kuota dari Google Firebase ini rata-rata hanya terpakai kurang dari 2-5% saja per bulan, sehingga Anda tidak perlu khawatir website akan mati atau kehabisan kuota.
