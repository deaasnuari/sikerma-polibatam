# Pengujian Black-Box SIKERMA 2.0
## Sistem Informasi Kerjasama — Politeknik Negeri Batam

**Metode Pengujian:** Black-Box Testing (Equivalence Partitioning & Boundary Value Analysis)
**Tanggal:** 15 Juni 2026
**Versi Sistem:** SIKERMA 2.0 (Laravel 13 + Next.js 16)

---

## Keterangan Status
| Status | Keterangan |
|--------|-----------|
| ✅ Berhasil | Output sesuai dengan yang diharapkan |
| ❌ Gagal | Output tidak sesuai dengan yang diharapkan |
| - | Belum diuji |

---

## 1. Modul Autentikasi

### 1.1 Login

| No | ID Uji | Skenario | Data Input | Output yang Diharapkan | Status |
|----|--------|----------|-----------|------------------------|--------|
| 1 | TC-AUTH-01 | Login valid sebagai Admin menggunakan email | Email: `admin@polibatam.ac.id`, Password: `Admin@123`, Role: `admin` | Login berhasil, mendapat token, diarahkan ke dashboard admin | - |
| 2 | TC-AUTH-02 | Login valid menggunakan username | Username: `admin_polibatam`, Password: `Admin@123`, Role: `admin` | Login berhasil, mendapat token | - |
| 3 | TC-AUTH-03 | Login valid sebagai Internal | Email: `internal@polibatam.ac.id`, Password: `Pass@123`, Role: `internal` | Login berhasil, diarahkan ke halaman internal | - |
| 4 | TC-AUTH-04 | Login valid sebagai Pimpinan | Email: `pimpinan@polibatam.ac.id`, Password: `Pass@123`, Role: `pimpinan` | Login berhasil, diarahkan ke halaman pimpinan | - |
| 5 | TC-AUTH-05 | Login valid sebagai Eksternal | Email: `mitra@company.com`, Password: `Pass@123`, Role: `external` | Login berhasil, diarahkan ke halaman eksternal | - |
| 6 | TC-AUTH-06 | Login dengan password salah | Email: `admin@polibatam.ac.id`, Password: `salah123`, Role: `admin` | Login gagal, pesan error "Email atau password salah" | - |
| 7 | TC-AUTH-07 | Login dengan email tidak terdaftar | Email: `tidakada@test.com`, Password: `Pass@123`, Role: `admin` | Login gagal, pesan error kredensial tidak ditemukan | - |
| 8 | TC-AUTH-08 | Login dengan role tidak sesuai | Email: `admin@polibatam.ac.id`, Password: `Admin@123`, Role: `external` | Login gagal, pesan error role tidak cocok | - |
| 9 | TC-AUTH-09 | Login dengan field email kosong | Email: *(kosong)*, Password: `Pass@123`, Role: `admin` | Validasi gagal, pesan "email wajib diisi" | - |
| 10 | TC-AUTH-10 | Login dengan field password kosong | Email: `admin@polibatam.ac.id`, Password: *(kosong)*, Role: `admin` | Validasi gagal, pesan "password wajib diisi" | - |
| 11 | TC-AUTH-11 | Login akun eksternal yang ditolak (rejected) | Email: `rejected@company.com`, Password: `Pass@123`, Role: `external` | Login gagal, pesan akun telah ditolak | - |
| 12 | TC-AUTH-12 | Login tanpa memilih role | Email: `admin@polibatam.ac.id`, Password: `Admin@123`, Role: *(kosong)* | Validasi gagal, pesan "role wajib dipilih" | - |

---

### 1.2 Registrasi (Akun Eksternal)

| No | ID Uji | Skenario | Data Input | Output yang Diharapkan | Status |
|----|--------|----------|-----------|------------------------|--------|
| 13 | TC-REG-01 | Registrasi dengan data lengkap dan valid | Nama: `PT Mitra Jaya`, Username: `mitra_jaya`, Email: `mitra@jaya.com`, Password: `Mitra@123`, dll. | Registrasi berhasil, status pending, muncul di daftar user | - |
| 14 | TC-REG-02 | Registrasi dengan email sudah terdaftar | Email: `mitra@jaya.com` (sudah ada) | Gagal, pesan "Email sudah digunakan" | - |
| 15 | TC-REG-03 | Registrasi dengan username sudah terdaftar | Username: `mitra_jaya` (sudah ada) | Gagal, pesan "Username sudah digunakan" | - |
| 16 | TC-REG-04 | Registrasi dengan username terlalu pendek | Username: `ab` (kurang dari 4 karakter) | Validasi gagal, pesan "Username minimal 4 karakter" | - |
| 17 | TC-REG-05 | Registrasi dengan username karakter spesial tidak valid | Username: `mitra jaya!` (ada spasi dan tanda seru) | Validasi gagal, hanya boleh huruf, angka, underscore, dash | - |
| 18 | TC-REG-06 | Registrasi dengan password terlalu pendek | Password: `Ab1!` (kurang dari 8 karakter) | Validasi gagal, pesan "Password minimal 8 karakter" | - |
| 19 | TC-REG-07 | Registrasi dengan password tanpa huruf besar | Password: `mitra@123` | Validasi gagal, password harus mengandung huruf besar | - |
| 20 | TC-REG-08 | Registrasi dengan password tanpa angka | Password: `MitraJaya!` | Validasi gagal, password harus mengandung angka | - |
| 21 | TC-REG-09 | Registrasi dengan password tanpa simbol | Password: `MitraJaya123` | Validasi gagal, password harus mengandung simbol | - |
| 22 | TC-REG-10 | Registrasi dengan konfirmasi password tidak cocok | Password: `Mitra@123`, Konfirmasi: `Mitra@456` | Validasi gagal, pesan "Konfirmasi password tidak cocok" | - |
| 23 | TC-REG-11 | Registrasi dengan field nama kosong | Nama: *(kosong)* | Validasi gagal, pesan "Nama wajib diisi" | - |
| 24 | TC-REG-12 | Registrasi dengan email format tidak valid | Email: `bukanemailvalid` | Validasi gagal, pesan "Format email tidak valid" | - |

---

### 1.3 Logout

| No | ID Uji | Skenario | Data Input | Output yang Diharapkan | Status |
|----|--------|----------|-----------|------------------------|--------|
| 25 | TC-AUTH-13 | Logout dari sesi yang aktif | Token Sanctum valid | Logout berhasil, token dihapus, diarahkan ke halaman login | - |
| 26 | TC-AUTH-14 | Akses endpoint terproteksi setelah logout | Token yang sudah di-logout | Response 401 Unauthorized | - |

---

## 2. Modul OTP

| No | ID Uji | Skenario | Data Input | Output yang Diharapkan | Status |
|----|--------|----------|-----------|------------------------|--------|
| 27 | TC-OTP-01 | Kirim OTP ke email terdaftar | Email: `mitra@jaya.com` | OTP terkirim ke email, response sukses | - |
| 28 | TC-OTP-02 | Kirim OTP ke email tidak terdaftar | Email: `tidakada@test.com` | Gagal atau response error email tidak ditemukan | - |
| 29 | TC-OTP-03 | Verifikasi OTP dengan kode benar | Email: `mitra@jaya.com`, OTP: `123456` (kode benar) | Verifikasi berhasil, email terverifikasi | - |
| 30 | TC-OTP-04 | Verifikasi OTP dengan kode salah | Email: `mitra@jaya.com`, OTP: `000000` (kode salah) | Gagal, pesan "Kode OTP tidak valid" | - |
| 31 | TC-OTP-05 | Verifikasi OTP yang sudah kedaluwarsa | OTP: kode lama yang sudah expired | Gagal, pesan "Kode OTP sudah kedaluwarsa" | - |

---

## 3. Modul Manajemen Pengguna (Admin)

| No | ID Uji | Skenario | Data Input | Output yang Diharapkan | Status |
|----|--------|----------|-----------|------------------------|--------|
| 32 | TC-USR-01 | Lihat daftar semua pengguna (Admin) | Token admin | Daftar pengguna tampil lengkap dengan status dan role | - |
| 33 | TC-USR-02 | Tambah pengguna baru dengan data valid | Nama, username, email, role, password baru | Pengguna berhasil dibuat, muncul di daftar | - |
| 34 | TC-USR-03 | Tambah pengguna dengan email duplikat | Email yang sudah ada | Gagal, pesan "Email sudah digunakan" | - |
| 35 | TC-USR-04 | Edit data pengguna (nama, posisi, dll.) | User ID valid, data baru | Data pengguna berhasil diperbarui | - |
| 36 | TC-USR-05 | Edit role pengguna menjadi admin | User ID, role: `admin` | Role berhasil diubah menjadi admin | - |
| 37 | TC-USR-06 | Hapus pengguna yang bukan admin terakhir | User ID pengguna biasa | Pengguna berhasil dihapus | - |
| 38 | TC-USR-07 | Hapus admin terakhir dalam sistem | User ID satu-satunya admin | Gagal, pesan "Tidak dapat menghapus admin terakhir" | - |
| 39 | TC-USR-08 | Update status persetujuan: pending → active | User ID pending, status: `active` | Status berhasil diubah menjadi aktif | - |
| 40 | TC-USR-09 | Update status persetujuan: pending → rejected | User ID pending, status: `rejected` | Status berhasil ditolak | - |
| 41 | TC-USR-10 | Akses manajemen pengguna tanpa role admin | Token non-admin (internal/external) | Response 403 Forbidden | - |

---

## 4. Master Data — Negara

| No | ID Uji | Skenario | Data Input | Output yang Diharapkan | Status |
|----|--------|----------|-----------|------------------------|--------|
| 42 | TC-NEG-01 | Lihat daftar negara | Token valid | Daftar negara tampil | - |
| 43 | TC-NEG-02 | Tambah negara dengan nama valid | Nama: `Jepang`, Kode: `JP` | Negara berhasil ditambahkan | - |
| 44 | TC-NEG-03 | Tambah negara dengan nama kosong | Nama: *(kosong)* | Validasi gagal, "nama negara wajib diisi" | - |
| 45 | TC-NEG-04 | Edit negara yang ada | ID negara valid, nama baru | Data negara berhasil diperbarui | - |
| 46 | TC-NEG-05 | Hapus negara yang tidak digunakan | ID negara valid (tidak terhubung data lain) | Negara berhasil dihapus | - |
| 47 | TC-NEG-06 | Hapus negara dengan ID tidak ada | ID: `99999` | Response 404 Not Found | - |

---

## 5. Master Data — Mitra

| No | ID Uji | Skenario | Data Input | Output yang Diharapkan | Status |
|----|--------|----------|-----------|------------------------|--------|
| 48 | TC-MIT-01 | Lihat daftar mitra | Token valid | Daftar mitra tampil | - |
| 49 | TC-MIT-02 | Tambah mitra dengan data valid | Nama institusi, negara, dll. | Mitra berhasil ditambahkan | - |
| 50 | TC-MIT-03 | Tambah mitra dengan nama kosong | Nama: *(kosong)* | Validasi gagal, "nama mitra wajib diisi" | - |
| 51 | TC-MIT-04 | Lihat detail mitra berdasarkan ID | ID mitra valid | Detail mitra tampil lengkap | - |
| 52 | TC-MIT-05 | Edit data mitra | ID mitra valid, data baru | Data mitra berhasil diperbarui | - |
| 53 | TC-MIT-06 | Hapus mitra yang ada | ID mitra valid | Mitra berhasil dihapus | - |

---

## 6. Master Data — Unit/Prodi

| No | ID Uji | Skenario | Data Input | Output yang Diharapkan | Status |
|----|--------|----------|-----------|------------------------|--------|
| 54 | TC-UNT-01 | Lihat struktur unit/prodi (tree) | Token valid | Struktur hierarki unit tampil | - |
| 55 | TC-UNT-02 | Tambah unit baru (jenis: unit) | Jenis: `unit`, Kategori: `jurusan`, Nama: `Teknik Informatika` | Unit berhasil ditambahkan | - |
| 56 | TC-UNT-03 | Tambah prodi baru dengan parent unit | Jenis: `prodi`, Parent ID: ID unit yang ada, Nama: `D4 Teknik Informatika` | Prodi berhasil ditambahkan dalam unit | - |
| 57 | TC-UNT-04 | Tambah unit dengan jenis tidak valid | Jenis: `fakultas` | Validasi gagal, jenis harus `unit` atau `prodi` | - |
| 58 | TC-UNT-05 | Tambah unit dengan nama kosong | Nama: *(kosong)* | Validasi gagal, "nama wajib diisi" | - |
| 59 | TC-UNT-06 | Edit unit yang ada | ID unit valid, nama baru | Data unit berhasil diperbarui | - |
| 60 | TC-UNT-07 | Hapus unit yang ada | ID unit valid | Unit berhasil dihapus | - |
| 61 | TC-UNT-08 | Akses daftar unit/prodi publik (tanpa login) | Tanpa token | Daftar unit tampil (endpoint publik) | - |

---

## 7. Master Data — Ruang Lingkup

| No | ID Uji | Skenario | Data Input | Output yang Diharapkan | Status |
|----|--------|----------|-----------|------------------------|--------|
| 62 | TC-RLS-01 | Lihat daftar ruang lingkup | Token valid | Daftar ruang lingkup tampil | - |
| 63 | TC-RLS-02 | Tambah ruang lingkup baru | Nama: `Penelitian Bersama` | Ruang lingkup berhasil ditambahkan | - |
| 64 | TC-RLS-03 | Tambah ruang lingkup dengan nama kosong | Nama: *(kosong)* | Validasi gagal | - |
| 65 | TC-RLS-04 | Edit ruang lingkup | ID valid, nama baru | Data berhasil diperbarui | - |
| 66 | TC-RLS-05 | Hapus ruang lingkup | ID valid | Ruang lingkup berhasil dihapus | - |

---

## 8. Modul Pengajuan Kerjasama

### 8.1 CRUD Pengajuan

| No | ID Uji | Skenario | Data Input | Output yang Diharapkan | Status |
|----|--------|----------|-----------|------------------------|--------|
| 67 | TC-PGJ-01 | Buat pengajuan baru dengan data lengkap | Nama pengusul, judul, jenis dokumen `MOU`, tanggal mulai/berakhir valid, dll. | Pengajuan berhasil dibuat, status `menunggu`, muncul di daftar | - |
| 68 | TC-PGJ-02 | Buat pengajuan dengan judul kosong (field wajib) | Judul: *(kosong)* | Validasi gagal, "judul pengajuan wajib diisi" | - |
| 69 | TC-PGJ-03 | Buat pengajuan dengan nama pengusul kosong | Nama pengusul: *(kosong)* | Validasi gagal, "nama pengusul wajib diisi" | - |
| 70 | TC-PGJ-04 | Buat pengajuan dengan jenis dokumen tidak valid | Jenis dokumen: `PKS` | Validasi gagal, harus `MOU`, `MOA`, `IA`, atau `LAINNYA` | - |
| 71 | TC-PGJ-05 | Buat pengajuan dengan tanggal berakhir sebelum tanggal mulai | Mulai: `2026-12-01`, Berakhir: `2026-01-01` | Validasi gagal, "tanggal berakhir harus setelah tanggal mulai" | - |
| 72 | TC-PGJ-06 | Buat pengajuan dengan nomor pengajuan duplikat | Nomor pengajuan yang sudah ada | Validasi gagal, "nomor pengajuan sudah digunakan" | - |
| 73 | TC-PGJ-07 | Lihat daftar semua pengajuan | Token valid | Daftar pengajuan tampil dengan status masing-masing | - |
| 74 | TC-PGJ-08 | Lihat detail pengajuan berdasarkan ID valid | ID pengajuan yang ada | Detail pengajuan tampil lengkap | - |
| 75 | TC-PGJ-09 | Lihat detail pengajuan dengan ID tidak ada | ID: `99999` | Response 404 Not Found | - |
| 76 | TC-PGJ-10 | Edit data pengajuan yang ada | ID valid, judul baru | Data pengajuan berhasil diperbarui | - |
| 77 | TC-PGJ-11 | Hapus pengajuan yang ada | ID valid | Pengajuan berhasil dihapus | - |

---

### 8.2 Alur Status Pengajuan

| No | ID Uji | Skenario | Data Input | Output yang Diharapkan | Status |
|----|--------|----------|-----------|------------------------|--------|
| 78 | TC-PGJ-12 | Update status: `menunggu` → `diproses` | ID pengajuan, status: `diproses` | Status berhasil berubah menjadi diproses | - |
| 79 | TC-PGJ-13 | Update status: `diproses` → `revisi` dengan catatan | Status: `revisi`, catatan_revisi: "Tolong lengkapi dokumen" | Status berubah, catatan revisi tersimpan | - |
| 80 | TC-PGJ-14 | Update status: `diproses` → `disetujui_internal` | Status: `disetujui_internal`, acc_actor: `internal` | Status berhasil diubah | - |
| 81 | TC-PGJ-15 | Update status: `disetujui_internal` → `disetujui_mitra` | Status: `disetujui_mitra`, acc_actor: `mitra` | Status berhasil diubah | - |
| 82 | TC-PGJ-16 | Update status menjadi `final_approved` | Status: `final_approved` | Status final berhasil, pengajuan selesai | - |
| 83 | TC-PGJ-17 | Update status: `diproses` → `ditolak` | Status: `ditolak`, keputusan: "Tidak memenuhi syarat" | Pengajuan ditolak, keputusan tersimpan | - |
| 84 | TC-PGJ-18 | Update status dengan nilai tidak valid | Status: `selesai` | Validasi gagal, status tidak dikenali | - |

---

### 8.3 Tahapan Pengajuan

| No | ID Uji | Skenario | Data Input | Output yang Diharapkan | Status |
|----|--------|----------|-----------|------------------------|--------|
| 85 | TC-THP-01 | Update tahapan: group `todo` | Stage: `Persiapan Dokumen`, Group: `todo` | Tahapan berhasil diperbarui | - |
| 86 | TC-THP-02 | Update tahapan: group `in_progress` | Stage: `Proses Review`, Group: `in_progress` | Tahapan berhasil diperbarui | - |
| 87 | TC-THP-03 | Update tahapan: group `complete` | Stage: `Selesai`, Group: `complete` | Tahapan berhasil diperbarui, riwayat tersimpan | - |
| 88 | TC-THP-04 | Update tahapan dengan group tidak valid | Group: `done` | Validasi gagal, group harus `todo`, `in_progress`, atau `complete` | - |
| 89 | TC-THP-05 | Update tahapan tanpa field stage | Stage: *(kosong)* | Validasi gagal, "stage wajib diisi" | - |

---

## 9. Modul Aktivitas Pengajuan

| No | ID Uji | Skenario | Data Input | Output yang Diharapkan | Status |
|----|--------|----------|-----------|------------------------|--------|
| 90 | TC-AKT-01 | Tambah aktivitas baru pada pengajuan | Pengajuan ID valid, Judul: `Rapat Koordinasi`, Jenis: `Rapat`, Tanggal: `2026-07-01`, Status: `direncanakan` | Aktivitas berhasil ditambahkan | - |
| 91 | TC-AKT-02 | Tambah aktivitas dengan judul kosong | Judul: *(kosong)* | Validasi gagal, "judul wajib diisi" | - |
| 92 | TC-AKT-03 | Tambah aktivitas dengan status tidak valid | Status: `pending` | Validasi gagal, harus `direncanakan`, `berlangsung`, atau `selesai` | - |
| 93 | TC-AKT-04 | Tambah aktivitas dengan jumlah peserta negatif | Jumlah peserta: `-5` | Validasi gagal, "jumlah peserta tidak boleh negatif" | - |
| 94 | TC-AKT-05 | Tambah aktivitas dengan ID pengajuan tidak ada | Pengajuan ID: `99999` | Validasi gagal, "pengajuan tidak ditemukan" | - |
| 95 | TC-AKT-06 | Edit aktivitas yang ada | ID aktivitas valid, data baru | Aktivitas berhasil diperbarui | - |
| 96 | TC-AKT-07 | Hapus aktivitas yang ada | ID aktivitas valid | Aktivitas berhasil dihapus | - |

---

## 10. Modul Catatan Admin

| No | ID Uji | Skenario | Data Input | Output yang Diharapkan | Status |
|----|--------|----------|-----------|------------------------|--------|
| 97 | TC-CAT-01 | Tambah catatan admin baru | Konten catatan valid | Catatan berhasil disimpan | - |
| 98 | TC-CAT-02 | Lihat daftar catatan admin | Token admin | Daftar catatan tampil | - |
| 99 | TC-CAT-03 | Edit catatan yang ada | ID catatan valid, konten baru | Catatan berhasil diperbarui | - |
| 100 | TC-CAT-04 | Hapus catatan yang ada | ID catatan valid | Catatan berhasil dihapus | - |
| 101 | TC-CAT-05 | Akses catatan admin oleh non-admin | Token non-admin | Response 403 Forbidden | - |

---

## 11. Modul Dokumen Kerjasama

### 11.1 CRUD Dokumen

| No | ID Uji | Skenario | Data Input | Output yang Diharapkan | Status |
|----|--------|----------|-----------|------------------------|--------|
| 102 | TC-DOK-01 | Tambah dokumen kerjasama dengan data lengkap | Nomor dokumen unik, nama dokumen, jenis `MOU`, tanggal valid, nomor permohonan dari pengajuan yang ada, file path | Dokumen berhasil ditambahkan | - |
| 103 | TC-DOK-02 | Tambah dokumen dengan nomor dokumen kosong | Nomor dokumen: *(kosong)* | Validasi gagal, "nomor dokumen wajib diisi" | - |
| 104 | TC-DOK-03 | Tambah dokumen dengan nomor dokumen duplikat | Nomor dokumen yang sudah ada | Validasi gagal, "nomor dokumen sudah digunakan" | - |
| 105 | TC-DOK-04 | Tambah dokumen dengan no_permohonan tidak ada | No permohonan: `PGJ-XXXXX` (tidak ada) | Validasi gagal, "nomor permohonan tidak ditemukan" | - |
| 106 | TC-DOK-05 | Tambah dokumen dengan tanggal berakhir sebelum tanggal mulai | Mulai: `2026-12-01`, Berakhir: `2026-06-01` | Validasi gagal, "tanggal berakhir harus setelah tanggal mulai" | - |
| 107 | TC-DOK-06 | Lihat daftar dokumen kerjasama | Token valid | Daftar dokumen tampil | - |
| 108 | TC-DOK-07 | Lihat detail dokumen berdasarkan ID valid | ID dokumen valid | Detail dokumen tampil lengkap | - |
| 109 | TC-DOK-08 | Lihat detail dokumen dengan ID tidak ada | ID: `99999` | Response 404 Not Found | - |
| 110 | TC-DOK-09 | Edit data dokumen | ID dokumen valid, data baru | Data berhasil diperbarui | - |
| 111 | TC-DOK-10 | Hapus dokumen yang ada | ID dokumen valid | Dokumen berhasil dihapus | - |

---

### 11.2 Upload File Dokumen

| No | ID Uji | Skenario | Data Input | Output yang Diharapkan | Status |
|----|--------|----------|-----------|------------------------|--------|
| 112 | TC-DOK-11 | Upload file PDF valid (ukuran < 10MB) | File: `dokumen.pdf`, Ukuran: `2MB` | File berhasil diupload, path tersimpan | - |
| 113 | TC-DOK-12 | Upload file PDF mendekati batas maksimal | File: `dokumen.pdf`, Ukuran: `9.9MB` | File berhasil diupload | - |
| 114 | TC-DOK-13 | Upload file bukan format PDF | File: `dokumen.docx` | Validasi gagal, "file harus dalam format PDF" | - |
| 115 | TC-DOK-14 | Upload file melebihi ukuran 10MB | File: `dokumen.pdf`, Ukuran: `11MB` | Validasi gagal, "ukuran file maksimal 10MB" | - |
| 116 | TC-DOK-15 | Upload tanpa memilih file | File: *(kosong)* | Validasi gagal, "file wajib diunggah" | - |
| 117 | TC-DOK-16 | Upload file dengan ID dokumen tidak ada | ID dokumen: `99999`, file valid | Response 404 Not Found | - |

---

### 11.3 Status Siklus Dokumen

| No | ID Uji | Skenario | Data Input | Output yang Diharapkan | Status |
|----|--------|----------|-----------|------------------------|--------|
| 118 | TC-DOK-17 | Update status siklus menjadi `active` | ID dokumen, status_siklus: `active` | Status berhasil diubah menjadi aktif | - |
| 119 | TC-DOK-18 | Update status siklus menjadi `expiring` | ID dokumen, status_siklus: `expiring` | Status berhasil diubah (hampir berakhir) | - |
| 120 | TC-DOK-19 | Arsipkan dokumen dengan alasan | Status_siklus: `archived`, alasan_arsip: `Kerjasama telah selesai`, diarsipkan_pada: `2026-06-15` | Dokumen berhasil diarsipkan | - |
| 121 | TC-DOK-20 | Update status siklus dengan nilai tidak valid | Status_siklus: `expired` | Validasi gagal, harus `active`, `expiring`, atau `archived` | - |

---

## 12. Modul Perpanjangan Dokumen

| No | ID Uji | Skenario | Data Input | Output yang Diharapkan | Status |
|----|--------|----------|-----------|------------------------|--------|
| 122 | TC-PRP-01 | Ajukan perpanjangan dokumen dengan data lengkap | ID dokumen valid, tanggal mulai baru, tanggal berakhir baru, catatan perpanjangan | Permintaan perpanjangan berhasil diajukan | - |
| 123 | TC-PRP-02 | Ajukan perpanjangan dengan tanggal berakhir sebelum tanggal mulai | Tanggal mulai: `2027-01-01`, Tanggal berakhir: `2026-01-01` | Validasi gagal, "tanggal berakhir harus setelah tanggal mulai" | - |
| 124 | TC-PRP-03 | Ajukan perpanjangan tanpa catatan (field wajib) | Catatan: *(kosong)* | Validasi gagal, "catatan perpanjangan wajib diisi" | - |
| 125 | TC-PRP-04 | Ajukan perpanjangan tanpa tanggal mulai baru | Tanggal mulai baru: *(kosong)* | Validasi gagal, "tanggal mulai baru wajib diisi" | - |
| 126 | TC-PRP-05 | Lihat daftar permintaan perpanjangan | Token valid | Daftar permintaan perpanjangan tampil | - |
| 127 | TC-PRP-06 | Admin menyetujui permintaan perpanjangan | ID log perpanjangan, status: `disetujui`, diputuskan_oleh: `Admin Polibatam` | Perpanjangan disetujui, tanggal dokumen diperbarui | - |
| 128 | TC-PRP-07 | Admin menolak permintaan perpanjangan | ID log perpanjangan, status: `ditolak` | Perpanjangan ditolak | - |
| 129 | TC-PRP-08 | Update status perpanjangan dengan nilai tidak valid | Status: `pending` | Validasi gagal, harus `disetujui` atau `ditolak` | - |
| 130 | TC-PRP-09 | Update perpanjangan dengan ID log tidak ada | ID log: `99999` | Response 404 Not Found | - |

---

## 13. Fitur Publik (Tanpa Autentikasi)

| No | ID Uji | Skenario | Data Input | Output yang Diharapkan | Status |
|----|--------|----------|-----------|------------------------|--------|
| 131 | TC-PUB-01 | Akses statistik kerjasama publik tanpa login | GET `/api/public/stats` (tanpa token) | Data statistik tampil (jumlah MoU, MoA, IA aktif, dll.) | - |
| 132 | TC-PUB-02 | Akses daftar kerjasama publik tanpa login | GET `/api/public/kerjasama` (tanpa token) | Daftar kerjasama aktif tampil | - |
| 133 | TC-PUB-03 | Akses daftar unit/prodi publik tanpa login | GET `/api/public/unit-prodi` (tanpa token) | Daftar unit/prodi tampil | - |
| 134 | TC-PUB-04 | Akses endpoint proteksi tanpa token | GET `/api/pengajuan` (tanpa token) | Response 401 Unauthorized | - |

---

## 14. Modul Monitoring & Notifikasi

| No | ID Uji | Skenario | Data Input | Output yang Diharapkan | Status |
|----|--------|----------|-----------|------------------------|--------|
| 135 | TC-MON-01 | Kirim notifikasi email ke satu penerima | Email tujuan, subjek, pesan | Email terkirim, response sukses | - |
| 136 | TC-MON-02 | Kirim notifikasi bulk ke banyak penerima | Daftar email, subjek, pesan | Semua email terkirim, response sukses | - |
| 137 | TC-MON-03 | Lihat dashboard monitoring dokumen hampir berakhir | Token admin/pimpinan | Daftar dokumen dengan status `expiring` tampil | - |
| 138 | TC-MON-04 | Sistem otomatis mendeteksi dokumen mendekati kadaluarsa | Dokumen dengan tanggal berakhir ≤ 90 hari | Status dokumen berubah ke `expiring`, notifikasi terkirim | - |

---

## 15. Carousel / Beranda Publik

| No | ID Uji | Skenario | Data Input | Output yang Diharapkan | Status |
|----|--------|----------|-----------|------------------------|--------|
| 139 | TC-CAR-01 | Lihat daftar gambar carousel | Tanpa token (publik) | Daftar gambar carousel tampil | - |
| 140 | TC-CAR-02 | Tambah gambar carousel baru (Admin) | File gambar, judul, deskripsi | Gambar carousel berhasil ditambahkan | - |
| 141 | TC-CAR-03 | Edit gambar carousel (Admin) | ID carousel valid, data baru | Data carousel berhasil diperbarui | - |
| 142 | TC-CAR-04 | Hapus gambar carousel (Admin) | ID carousel valid | Gambar carousel berhasil dihapus | - |

---

## 16. Pengujian Keamanan Dasar

| No | ID Uji | Skenario | Data Input | Output yang Diharapkan | Status |
|----|--------|----------|-----------|------------------------|--------|
| 143 | TC-SEC-01 | Akses endpoint admin oleh user `internal` | Token internal, GET `/api/admin/users` | Response 403 Forbidden | - |
| 144 | TC-SEC-02 | Akses endpoint admin oleh user `external` | Token external, GET `/api/admin/users` | Response 403 Forbidden | - |
| 145 | TC-SEC-03 | Akses endpoint admin oleh user `pimpinan` | Token pimpinan, GET `/api/admin/users` | Response 403 Forbidden (jika hanya admin) | - |
| 146 | TC-SEC-04 | Mengakses data user lain tanpa izin | Token user A, GET `/api/admin/users/{id_user_B}` | Response 403 atau hanya data yang diizinkan | - |
| 147 | TC-SEC-05 | Request dengan token tidak valid/palsu | Token: `Bearer token_palsu_123` | Response 401 Unauthorized | - |
| 148 | TC-SEC-06 | Request dengan token kedaluwarsa | Token lama (sudah expired) | Response 401 Unauthorized | - |

---

## Ringkasan Pengujian

| Modul | Total TC | Berhasil | Gagal | Belum Diuji |
|-------|----------|----------|-------|-------------|
| Autentikasi (Login) | 12 | - | - | 12 |
| Registrasi | 12 | - | - | 12 |
| OTP | 5 | - | - | 5 |
| Manajemen Pengguna | 10 | - | - | 10 |
| Master Negara | 6 | - | - | 6 |
| Master Mitra | 6 | - | - | 6 |
| Master Unit/Prodi | 8 | - | - | 8 |
| Master Ruang Lingkup | 5 | - | - | 5 |
| Pengajuan (CRUD) | 11 | - | - | 11 |
| Status Pengajuan | 7 | - | - | 7 |
| Tahapan Pengajuan | 5 | - | - | 5 |
| Aktivitas Pengajuan | 7 | - | - | 7 |
| Catatan Admin | 5 | - | - | 5 |
| Dokumen Kerjasama (CRUD) | 10 | - | - | 10 |
| Upload File | 6 | - | - | 6 |
| Status Siklus Dokumen | 4 | - | - | 4 |
| Perpanjangan Dokumen | 9 | - | - | 9 |
| Fitur Publik | 4 | - | - | 4 |
| Monitoring & Notifikasi | 4 | - | - | 4 |
| Carousel | 4 | - | - | 4 |
| Keamanan Dasar | 6 | - | - | 6 |
| **TOTAL** | **148** | **-** | **-** | **148** |

---

*Dokumen ini dibuat secara otomatis berdasarkan analisis kode sumber SIKERMA 2.0*
*Harap isi kolom Status setelah melakukan pengujian secara langsung pada sistem*
