# 📘 SIKERMA 2.0

### Sistem Informasi Kerjasama Politeknik Negeri Batam

---

## 👤 Identitas Proyek

* 📌 Kode Proyek: IF-4MA-09
* 👩‍💻 Ketua: Dea Asnuari (3312411001)
* 👩‍💻 Anggota: Syahnaz Dwi Pawestri (3312411014)
* 🏫 Institusi: Politeknik Negeri Batam
* 📚 Program Studi: Teknik Informatika
* 📅 Tahun: 2026

---

## 🌐 Link Penting

* 🔗 Repository:https://github.com/deaasnuari/sikerma-polibatam
* 📄 Laporan: https://docs.google.com/document/d/1QS-k2jZFqldICti1kPClhsECcS3cQVT66ZkDTYDFylI/edit?usp=sharing
* 📄 LINK DOKUMEN PENDUKUNG: https://drive.google.com/drive/folders/1dFuGZH6FeIqrPVPVeCMZq0mXI50oAI_n?usp=sharing
* 🎥 LINK YOUTUBE: https://youtu.be/B-XkPpAVX58?si=qERjljIDkDyH-j8F
* 🎨 LINK FIGMA: https://www.figma.com/design/bY44yx8V1jxzrcXmjJ40kS/SIKERMA?node-id=0-1&t=4wge3MLy3dB70Eo5-1
* 🎨 LINK PROTOTIPE: https://www.figma.com/proto/bY44yx8V1jxzrcXmjJ40kS/SIKERMA?node-id=0-1&t=4wge3MLy3dB70Eo5-1


---

## 📌 Deskripsi Proyek

**SIKERMA 2.0 (Sistem Informasi Kerjasama)** merupakan sistem berbasis web yang dikembangkan untuk mengelola data kerja sama di Politeknik Negeri Batam.

Sistem ini dibuat sebagai solusi dari sistem lama berbasis ASP.NET yang sudah tidak optimal, sering error, dan belum mampu mendukung kebutuhan monitoring kerja sama secara efektif.

Dengan SIKERMA 2.0, seluruh proses kerja sama seperti pengajuan, pengelolaan dokumen, hingga monitoring dapat dilakukan secara **terintegrasi, real-time, dan terdigitalisasi**.

---

## ❗ Permasalahan yang Diselesaikan

* Sistem lama tidak aktif dan sering error
* Data kerja sama tidak terintegrasi
* Duplikasi data mitra
* Monitoring masa berlaku dokumen masih manual
* Tidak ada dashboard untuk analisis data

---

## 🎯 Tujuan

* Membangun sistem kerja sama berbasis web yang terintegrasi
* Mengurangi duplikasi data
* Menyediakan monitoring masa berlaku dokumen otomatis
* Menyediakan dashboard analitik untuk pengambilan keputusan

---

## 👥 Aktor Sistem

* 🛠️ Admin/Humas
* 🏢 Unit Internal
* 🌐 Mitra Eksternal
* 👨‍💼 Pimpinan

---

## ⚙️ Fitur Utama

* 🔐 Login & Role-Based Access Control
* 📄 Pengajuan Kerja Sama
* 📂 Upload Dokumen (MoU, MoA, IA)
* 📊 Monitoring Status Kerja Sama
* ⏰ Notifikasi Masa Berlaku Dokumen
* 📈 Dashboard & Statistik
* 📝 Audit Trail (riwayat aktivitas)
* 🗃️ Arsip Dokumen

---

## 🏗️ Arsitektur Sistem

Sistem menggunakan arsitektur **client-server** dengan pemisahan frontend dan backend:

* Frontend: Next.js
* Backend: Laravel
* Database: PostgreSQL
* API: REST API

---

## 🛠️ Teknologi yang Digunakan

* ⚙️ Laravel (Backend)
* ⚛️ Next.js (Frontend)
* 🗄️ PostgreSQL (Database)
* 🎨 Tailwind CSS
* 🔗 REST API

---

## 🔄 Metode Pengembangan

Menggunakan:

* **CDIO (Conceive, Design, Implement, Operate)**
* **Agile Scrum** (iterasi berbasis sprint)

---

## 🗂️ Fitur Sistem Berdasarkan Use Case

* Login & Logout
* Registrasi Mitra
* Pengajuan Kerja Sama
* Upload Dokumen
* Verifikasi Pengajuan
* Monitoring Status
* Manajemen Mitra
* Dashboard Statistik

---

## 🚀 Cara Menjalankan Project

1. Clone repository

```bash id="a1"
git clone https://github.com/deaasnuari/sikerma-polibatam.git
```

2. Masuk ke folder project

```bash id="a2"
cd sikerma-polibatam
```

3. Install dependency

```bash id="a3"
composer install
npm install
```

4. Copy file environment

```bash id="a4"
cp .env.example .env
```

5. Konfigurasi database di `.env`

6. Generate key

```bash id="a5"
php artisan key:generate
```

7. Migrasi database

```bash id="a6"
php artisan migrate
```

8. Jalankan server

```bash id="a7"
php artisan serve
```

---

## 📊 Hasil

SIKERMA 2.0 berhasil:

* Mengintegrasikan data kerja sama
* Mempermudah pengajuan dan monitoring
* Menyediakan dashboard untuk analisis
* Mengurangi proses manual

---

## 🧪 Pengujian

Pengujian dilakukan menggunakan:

* Functional Testing
* Blackbox Testing

Hasil menunjukkan sistem berjalan sesuai dengan kebutuhan pengguna.

---

## 📝 Kesimpulan

SIKERMA 2.0 mampu meningkatkan efisiensi pengelolaan kerja sama di Politeknik Negeri Batam dengan sistem yang lebih terstruktur, transparan, dan terintegrasi.

---

---

## 🙌 Penutup

Terima kasih telah mengunjungi proyek ini 🙏
