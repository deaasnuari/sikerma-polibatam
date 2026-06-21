# Pengujian Performa SIKERMA 2.0
## Sistem Informasi Kerjasama — Politeknik Negeri Batam

**Metode Pengujian:** Performance Testing (Load, Stress, dan Spike Testing)
**Tool:** Apache JMeter 5.6.3
**Tanggal:** Juni 2026
**Versi Sistem:** SIKERMA 2.0 (Laravel 13 + Next.js 16)
**Base URL Backend:** `http://localhost:8000/api`

---

## Keterangan Status

| Status | Keterangan |
|--------|-----------|
| ✅ Lulus | Response time dan error rate memenuhi target |
| ❌ Gagal | Response time melebihi batas atau error rate > 1% |
| - | Belum diuji |

---

## Kriteria Keberhasilan (Acceptance Criteria)

| Metrik | Target |
|--------|--------|
| Average Response Time | ≤ 1.000 ms |
| 90th Percentile (P90) | ≤ 2.000 ms |
| 95th Percentile (P95) | ≤ 3.000 ms |
| Error Rate | < 1% |
| Throughput | ≥ 10 request/detik |
| Upload File (10MB) | ≤ 15.000 ms |

---

## Struktur JMeter Test Plan

```
Test Plan: SIKERMA 2.0 Performance Test
│
├── Config Element
│   ├── HTTP Header Manager         → Bearer Token auth
│   ├── HTTP Cookie Manager         → Session handling
│   └── CSV Data Set Config         → Data user dari file CSV
│
├── [Skenario 1] Load Test — Login
├── [Skenario 2] Load Test — Halaman Publik
├── [Skenario 3] Load Test — Daftar Pengajuan
├── [Skenario 4] Load Test — Detail Pengajuan
├── [Skenario 5] Stress Test — Batas Maksimum Server
├── [Skenario 6] Spike Test — Lonjakan User
├── [Skenario 7] Load Test — Upload File
└── [Skenario 8] Load Test — Bulk Notifikasi
    │
    └── Listeners (pada setiap skenario)
        ├── View Results Tree
        ├── Summary Report
        ├── Aggregate Report
        └── Response Time Graph
```

---

## Skenario & Konfigurasi JMeter

### Skenario 1 — Load Test: Login

**Endpoint:** `POST /api/login`
**Konfigurasi Thread Group JMeter:**
| Parameter | Nilai |
|-----------|-------|
| Number of Threads (Users) | 50 |
| Ramp-Up Period | 30 detik |
| Loop Count | 3 |
| Duration | 90 detik |

**HTTP Request Sampler:**
```
Method  : POST
Path    : /api/login
Body    : { "login": "admin@polibatam.ac.id", "password": "Admin@123", "role": "admin" }
Header  : Content-Type: application/json
```

**Test Case:**

| No | ID Uji | Skenario | Jumlah User | Ramp-Up | Target Avg RT | Target Error | Status |
|----|--------|----------|-------------|---------|---------------|--------------|--------|
| 1 | TC-PERF-01 | 50 user login serentak sebagai admin | 50 | 30 detik | ≤ 1.000 ms | < 1% | - |
| 2 | TC-PERF-02 | 100 user login serentak campuran role | 100 | 60 detik | ≤ 1.500 ms | < 1% | - |
| 3 | TC-PERF-03 | 200 user login serentak (beban puncak) | 200 | 60 detik | ≤ 2.000 ms | < 2% | - |

---

### Skenario 2 — Load Test: Halaman Publik (Tanpa Login)

**Endpoint:** `GET /api/public/stats` dan `GET /api/public/kerjasama`
**Konfigurasi Thread Group JMeter:**
| Parameter | Nilai |
|-----------|-------|
| Number of Threads (Users) | 100 |
| Ramp-Up Period | 30 detik |
| Loop Count | 5 |
| Duration | 120 detik |

**HTTP Request Sampler:**
```
Method  : GET
Path    : /api/public/stats
Header  : Content-Type: application/json
(tidak butuh token)
```

**Test Case:**

| No | ID Uji | Skenario | Jumlah User | Ramp-Up | Target Avg RT | Target Error | Status |
|----|--------|----------|-------------|---------|---------------|--------------|--------|
| 4 | TC-PERF-04 | 100 user akses statistik publik bersamaan | 100 | 30 detik | ≤ 800 ms | < 1% | - |
| 5 | TC-PERF-05 | 200 user akses daftar kerjasama publik | 200 | 60 detik | ≤ 1.000 ms | < 1% | - |
| 6 | TC-PERF-06 | 300 user akses halaman publik bersamaan (stress) | 300 | 60 detik | ≤ 2.000 ms | < 2% | - |
| 7 | TC-PERF-07 | 100 user akses daftar unit/prodi publik | 100 | 30 detik | ≤ 800 ms | < 1% | - |

---

### Skenario 3 — Load Test: Daftar Pengajuan (Perlu Login)

**Endpoint:** `GET /api/pengajuan`
**Konfigurasi Thread Group JMeter:**
| Parameter | Nilai |
|-----------|-------|
| Number of Threads (Users) | 50 |
| Ramp-Up Period | 30 detik |
| Loop Count | 5 |
| Duration | 120 detik |

**HTTP Request Sampler:**
```
Method  : GET
Path    : /api/pengajuan
Header  : Authorization: Bearer ${token}
          Content-Type: application/json
```

> **Catatan JMeter:** Tambahkan `HTTP Header Manager` dengan nilai token dari hasil login. Gunakan `Regular Expression Extractor` untuk mengambil token otomatis dari response login.

**Test Case:**

| No | ID Uji | Skenario | Jumlah User | Ramp-Up | Target Avg RT | Target Error | Status |
|----|--------|----------|-------------|---------|---------------|--------------|--------|
| 8 | TC-PERF-08 | 50 user ambil daftar pengajuan bersamaan | 50 | 30 detik | ≤ 1.000 ms | < 1% | - |
| 9 | TC-PERF-09 | 100 user ambil daftar pengajuan bersamaan | 100 | 60 detik | ≤ 1.500 ms | < 1% | - |
| 10 | TC-PERF-10 | Akses daftar pengajuan berulang 5x per user (50 user) | 50 | 30 detik | ≤ 1.000 ms | < 1% | - |

---

### Skenario 4 — Load Test: Detail Pengajuan

**Endpoint:** `GET /api/pengajuan/{id}`
**Konfigurasi Thread Group JMeter:**
| Parameter | Nilai |
|-----------|-------|
| Number of Threads (Users) | 50 |
| Ramp-Up Period | 30 detik |
| Loop Count | 3 |
| Duration | 90 detik |

**HTTP Request Sampler:**
```
Method  : GET
Path    : /api/pengajuan/1
Header  : Authorization: Bearer ${token}
```

**Test Case:**

| No | ID Uji | Skenario | Jumlah User | Ramp-Up | Target Avg RT | Target Error | Status |
|----|--------|----------|-------------|---------|---------------|--------------|--------|
| 11 | TC-PERF-11 | 50 user akses detail pengajuan yang sama | 50 | 30 detik | ≤ 1.000 ms | < 1% | - |
| 12 | TC-PERF-12 | 50 user akses detail pengajuan berbeda-beda | 50 | 30 detik | ≤ 1.200 ms | < 1% | - |

> **Catatan JMeter:** Gunakan `CSV Data Set Config` untuk membaca daftar ID pengajuan yang valid dari file CSV, sehingga tiap user mengakses data berbeda.

---

### Skenario 5 — Stress Test: Batas Maksimum Server

**Tujuan:** Menemukan titik di mana sistem mulai gagal atau sangat lambat.
**Endpoint:** `POST /api/login` + `GET /api/pengajuan`

**Konfigurasi Thread Group JMeter (Stepping Thread Group / Ultimate Thread Group):**
| Tahap | Jumlah User | Durasi per Tahap |
|-------|-------------|-----------------|
| Tahap 1 | 50 user | 2 menit |
| Tahap 2 | 100 user | 2 menit |
| Tahap 3 | 200 user | 2 menit |
| Tahap 4 | 300 user | 2 menit |
| Tahap 5 | 400 user | 2 menit |
| Tahap 6 | 500 user | 2 menit |

**Test Case:**

| No | ID Uji | Skenario | Jumlah User | Target | Pengamatan | Status |
|----|--------|----------|-------------|--------|------------|--------|
| 13 | TC-PERF-13 | Naikkan beban bertahap hingga 500 user | 50→500 | Catat di tahap mana error mulai muncul | Titik jenuh (breaking point) | - |
| 14 | TC-PERF-14 | Server recovery setelah stress | Turunkan ke 50 user | Server kembali normal < 30 detik | Kemampuan pemulihan | - |
| 15 | TC-PERF-15 | Amati memory dan CPU saat 300 user | 300 | Error rate < 5% | Stabilitas di beban tinggi | - |

---

### Skenario 6 — Spike Test: Lonjakan User Tiba-Tiba

**Tujuan:** Uji reaksi sistem saat ada lonjakan user mendadak.
**Endpoint:** `GET /api/public/stats`

**Konfigurasi Thread Group JMeter:**
| Fase | Jumlah User | Durasi |
|------|-------------|--------|
| Normal | 10 user | 1 menit |
| Spike (lonjakan) | 300 user | 30 detik |
| Kembali normal | 10 user | 1 menit |

**Test Case:**

| No | ID Uji | Skenario | Jumlah User | Target Avg RT | Target Error | Status |
|----|--------|----------|-------------|---------------|--------------|--------|
| 16 | TC-PERF-16 | Lonjakan dari 10 → 300 user dalam 30 detik | 10→300 | ≤ 3.000 ms saat spike | < 5% saat spike | - |
| 17 | TC-PERF-17 | Server recovery setelah spike turun ke 10 user | 300→10 | Kembali ≤ 1.000 ms | < 1% | - |

---

### Skenario 7 — Load Test: Upload File Dokumen

**Endpoint:** `POST /api/dokumen-kerjasama/{id}/upload-file`
**Konfigurasi Thread Group JMeter:**
| Parameter | Nilai |
|-----------|-------|
| Number of Threads (Users) | 10 |
| Ramp-Up Period | 30 detik |
| Loop Count | 2 |

**HTTP Request Sampler:**
```
Method      : POST
Path        : /api/dokumen-kerjasama/1/upload-file
Content-Type: multipart/form-data
File Field  : file (pilih file PDF dari lokal)
Header      : Authorization: Bearer ${token}
```

> **Catatan JMeter:** Gunakan tab `Files Upload` di HTTP Request Sampler untuk lampirkan file PDF. Pastikan file test tersedia di komputer yang menjalankan JMeter.

**Test Case:**

| No | ID Uji | Skenario | Jumlah User | Ukuran File | Target RT | Target Error | Status |
|----|--------|----------|-------------|-------------|-----------|--------------|--------|
| 18 | TC-PERF-18 | 5 user upload PDF 1MB bersamaan | 5 | 1 MB | ≤ 5.000 ms | < 1% | - |
| 19 | TC-PERF-19 | 10 user upload PDF 5MB bersamaan | 10 | 5 MB | ≤ 10.000 ms | < 1% | - |
| 20 | TC-PERF-20 | 10 user upload PDF 9.9MB bersamaan (batas max) | 10 | 9.9 MB | ≤ 15.000 ms | < 1% | - |
| 21 | TC-PERF-21 | 20 user upload PDF 5MB bersamaan (beban tinggi) | 20 | 5 MB | ≤ 12.000 ms | < 2% | - |

---

### Skenario 8 — Load Test: Bulk Notifikasi Email

**Endpoint:** `POST /api/notifications/send-bulk`
**Konfigurasi Thread Group JMeter:**
| Parameter | Nilai |
|-----------|-------|
| Number of Threads (Users) | 5 |
| Ramp-Up Period | 10 detik |
| Loop Count | 3 |

**HTTP Request Sampler:**
```
Method  : POST
Path    : /api/notifications/send-bulk
Body    : {
            "emails": ["a@test.com", "b@test.com", ...],
            "subject": "Test Notifikasi",
            "message": "Pesan pengujian performa"
          }
Header  : Authorization: Bearer ${token}
          Content-Type: application/json
```

**Test Case:**

| No | ID Uji | Skenario | Jumlah User | Jumlah Email/Request | Target RT | Target Error | Status |
|----|--------|----------|-------------|---------------------|-----------|--------------|--------|
| 22 | TC-PERF-22 | 5 admin kirim bulk email ke 10 penerima bersamaan | 5 | 10 email | ≤ 5.000 ms | < 1% | - |
| 23 | TC-PERF-23 | 5 admin kirim bulk email ke 50 penerima bersamaan | 5 | 50 email | ≤ 10.000 ms | < 2% | - |
| 24 | TC-PERF-24 | 3 admin kirim bulk email ke 100 penerima bersamaan | 3 | 100 email | ≤ 15.000 ms | < 2% | - |

---

### Skenario 9 — Load Test: Alur Lengkap (End-to-End)

**Tujuan:** Simulasi user nyata yang melakukan beberapa aksi secara berurutan.

**Alur di JMeter (Transaction Controller):**
```
1. POST /api/login              → Dapat token
2. GET  /api/pengajuan          → Lihat daftar
3. GET  /api/pengajuan/{id}     → Lihat detail
4. GET  /api/dokumen-kerjasama  → Lihat dokumen
5. GET  /api/public/stats       → Lihat statistik
6. POST /api/logout             → Logout
```

**Konfigurasi Thread Group JMeter:**
| Parameter | Nilai |
|-----------|-------|
| Number of Threads (Users) | 50 |
| Ramp-Up Period | 60 detik |
| Loop Count | 1 |
| Think Time (Timer) | 1–3 detik antar request |

**Test Case:**

| No | ID Uji | Skenario | Jumlah User | Target Avg RT per Step | Target Error | Status |
|----|--------|----------|-------------|------------------------|--------------|--------|
| 25 | TC-PERF-25 | 50 user jalankan alur lengkap end-to-end | 50 | ≤ 1.000 ms | < 1% | - |
| 26 | TC-PERF-26 | 100 user jalankan alur lengkap end-to-end | 100 | ≤ 1.500 ms | < 1% | - |

---

## Konfigurasi JMeter — Komponen yang Digunakan

### A. Komponen Wajib di Setiap Skenario

| Komponen JMeter | Fungsi | Lokasi |
|-----------------|--------|--------|
| **Thread Group** | Mengatur jumlah user, ramp-up, dan durasi | Klik kanan Test Plan → Add → Threads → Thread Group |
| **HTTP Request Sampler** | Mendefinisikan endpoint yang dihit | Klik kanan Thread Group → Add → Sampler → HTTP Request |
| **HTTP Header Manager** | Menambahkan header (Authorization, Content-Type) | Klik kanan Thread Group → Add → Config Element |
| **HTTP Cookie Manager** | Mengelola session/cookie otomatis | Klik kanan Thread Group → Add → Config Element |

### B. Komponen untuk Ekstrak Token Login

| Komponen | Fungsi | Cara |
|----------|--------|------|
| **Regular Expression Extractor** | Ambil token dari response login | Klik kanan HTTP Request Login → Add → Post Processors → Regular Expression Extractor |
| Referensi Variable: | | Field Name: `token`, Regex: `"token":"(.+?)"`, Match No: 1 |

### C. Komponen untuk Data Dinamis

| Komponen | Fungsi | Cara |
|----------|--------|------|
| **CSV Data Set Config** | Baca username/password/ID dari file CSV | Klik kanan Thread Group → Add → Config Element |
| Contoh file CSV: | `email,password,role` | `admin@polibatam.ac.id,Admin@123,admin` |

### D. Listeners (Pengumpul Hasil)

| Listener | Fungsi |
|----------|--------|
| **View Results Tree** | Lihat detail tiap request/response (untuk debug) |
| **Summary Report** | Ringkasan: avg RT, min, max, throughput, error% |
| **Aggregate Report** | Statistik lengkap termasuk P90, P95, P99 |
| **Response Time Graph** | Grafik response time sepanjang waktu |
| **Active Threads Over Time** | Grafik jumlah user aktif (butuh plugin JMeter Extras) |

> **Catatan:** Nonaktifkan `View Results Tree` saat stress test dengan banyak user karena bisa memperlambat JMeter itu sendiri.

---

## Cara Menjalankan Test di JMeter

### Langkah 1 — Persiapan

```
1. Download Apache JMeter di https://jmeter.apache.org/download_jmeter.cgi
2. Jalankan: bin/jmeter.bat (Windows)
3. Pastikan backend Laravel sudah berjalan: php artisan serve
4. Siapkan file CSV berisi data user test
5. Siapkan file PDF sample untuk test upload (1MB, 5MB, 9.9MB)
```

### Langkah 2 — Buat Test Plan

```
1. File → New → beri nama "SIKERMA 2.0 Performance Test"
2. Tambahkan Thread Group sesuai skenario
3. Tambahkan HTTP Request Sampler di tiap Thread Group
4. Tambahkan Header Manager dengan token
5. Tambahkan Listeners di bawah setiap Thread Group
```

### Langkah 3 — Jalankan dan Baca Hasil

```
1. Run → Start (Ctrl+R)
2. Buka Aggregate Report untuk lihat hasil
3. Cek kolom: Average, 90% Line, 95% Line, Error%
4. Simpan hasil: File → Save (format .jmx) dan export CSV
```

---

## Ringkasan Test Case Performance Testing

| No | Skenario | Modul | Jumlah TC | Target User Maks | Status |
|----|----------|-------|-----------|-----------------|--------|
| 1 | Load Test — Login | Autentikasi | 3 | 200 user | - |
| 2 | Load Test — Halaman Publik | Publik | 4 | 300 user | - |
| 3 | Load Test — Daftar Pengajuan | Pengajuan | 3 | 100 user | - |
| 4 | Load Test — Detail Pengajuan | Pengajuan | 2 | 50 user | - |
| 5 | Stress Test — Batas Maksimum | Semua | 3 | 500 user | - |
| 6 | Spike Test — Lonjakan User | Publik | 2 | 300 user (spike) | - |
| 7 | Load Test — Upload File | Dokumen | 4 | 20 user | - |
| 8 | Load Test — Bulk Notifikasi | Notifikasi | 3 | 5 user | - |
| 9 | End-to-End Alur Lengkap | Semua | 2 | 100 user | - |
| | **TOTAL** | | **26** | | |

---

## Tabel Hasil Pengujian (Diisi Setelah Pengujian)

| No | ID Uji | Avg RT (ms) | P90 (ms) | P95 (ms) | Error % | Throughput (req/s) | Status |
|----|--------|-------------|----------|----------|---------|--------------------|--------|
| 1 | TC-PERF-01 | - | - | - | - | - | - |
| 2 | TC-PERF-02 | - | - | - | - | - | - |
| 3 | TC-PERF-03 | - | - | - | - | - | - |
| 4 | TC-PERF-04 | - | - | - | - | - | - |
| 5 | TC-PERF-05 | - | - | - | - | - | - |
| 6 | TC-PERF-06 | - | - | - | - | - | - |
| 7 | TC-PERF-07 | - | - | - | - | - | - |
| 8 | TC-PERF-08 | - | - | - | - | - | - |
| 9 | TC-PERF-09 | - | - | - | - | - | - |
| 10 | TC-PERF-10 | - | - | - | - | - | - |
| 11 | TC-PERF-11 | - | - | - | - | - | - |
| 12 | TC-PERF-12 | - | - | - | - | - | - |
| 13 | TC-PERF-13 | - | - | - | - | - | - |
| 14 | TC-PERF-14 | - | - | - | - | - | - |
| 15 | TC-PERF-15 | - | - | - | - | - | - |
| 16 | TC-PERF-16 | - | - | - | - | - | - |
| 17 | TC-PERF-17 | - | - | - | - | - | - |
| 18 | TC-PERF-18 | - | - | - | - | - | - |
| 19 | TC-PERF-19 | - | - | - | - | - | - |
| 20 | TC-PERF-20 | - | - | - | - | - | - |
| 21 | TC-PERF-21 | - | - | - | - | - | - |
| 22 | TC-PERF-22 | - | - | - | - | - | - |
| 23 | TC-PERF-23 | - | - | - | - | - | - |
| 24 | TC-PERF-24 | - | - | - | - | - | - |
| 25 | TC-PERF-25 | - | - | - | - | - | - |
| 26 | TC-PERF-26 | - | - | - | - | - | - |

---

*Dokumen ini dibuat sebagai panduan pengujian performa SIKERMA 2.0 menggunakan Apache JMeter*
*Isi kolom hasil setelah menjalankan pengujian pada sistem yang berjalan*
