-- SIKERMA v2 Simplified Schema (PostgreSQL)
-- Versi ringkas: 9 tabel domain inti
-- Tidak melakukan migrasi data lama

-- =========================
-- ENUMS
-- =========================

DO $$ BEGIN
    CREATE TYPE jenis_node_unit_prodi_enum AS ENUM ('unit', 'prodi');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE status_pengajuan_enum AS ENUM ('menunggu', 'diproses', 'disetujui', 'ditolak');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE jenis_dokumen_enum AS ENUM ('MOU', 'MOA', 'IA');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE status_siklus_dokumen_enum AS ENUM ('active', 'expiring', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE tipe_log_pengajuan_enum AS ENUM ('status', 'komentar', 'verifikasi');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE tipe_log_dokumen_enum AS ENUM ('aktivitas', 'notifikasi', 'perpanjangan', 'status', 'arsip');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =========================
-- PRASYARAT MINIMAL
-- =========================

-- Script ini memakai FK ke users. Jika menjalankan pada database kosong,
-- buat tabel users minimal agar FK valid.
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    role VARCHAR(50),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- =========================
-- 1) MASTER UNIT + PRODI (SELF-REFERENCE)
-- =========================

CREATE TABLE IF NOT EXISTS master_unit_prodi (
    id BIGSERIAL PRIMARY KEY,
    parent_id BIGINT REFERENCES master_unit_prodi(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    jenis_node jenis_node_unit_prodi_enum NOT NULL,
    kode VARCHAR(30),
    nama VARCHAR(150) NOT NULL,
    aktif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_master_unit_prodi_parent_nama UNIQUE (parent_id, nama)
);

CREATE INDEX IF NOT EXISTS idx_master_unit_prodi_parent_id ON master_unit_prodi(parent_id);
CREATE INDEX IF NOT EXISTS idx_master_unit_prodi_jenis_node ON master_unit_prodi(jenis_node);

-- =========================
-- 2) MASTER MITRA (WITH PRIMARY CONTACT)
-- =========================

CREATE TABLE IF NOT EXISTS master_mitra (
    id BIGSERIAL PRIMARY KEY,
    nama_mitra VARCHAR(255) NOT NULL,
    kategori_mitra VARCHAR(80),
    negara VARCHAR(100),
    website VARCHAR(255),
    alamat TEXT,
    email_mitra VARCHAR(255),
    telepon_mitra VARCHAR(50),

    nama_kontak_utama VARCHAR(200),
    jabatan_kontak_utama VARCHAR(120),
    email_kontak_utama VARCHAR(255),
    telepon_kontak_utama VARCHAR(50),

    aktif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_master_mitra_nama ON master_mitra(nama_mitra);
CREATE INDEX IF NOT EXISTS idx_master_mitra_kategori ON master_mitra(kategori_mitra);

-- =========================
-- 3) MASTER RUANG LINGKUP
-- =========================

CREATE TABLE IF NOT EXISTS master_ruang_lingkup (
    id BIGSERIAL PRIMARY KEY,
    nama_ruang_lingkup VARCHAR(150) NOT NULL UNIQUE,
    aktif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- =========================
-- 4) PENGAJUAN
-- =========================

CREATE TABLE IF NOT EXISTS pengajuan (
    id BIGSERIAL PRIMARY KEY,
    nomor_pengajuan VARCHAR(50) NOT NULL UNIQUE,

    user_pengusul_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    nama_pengusul VARCHAR(200) NOT NULL,
    jabatan_pengusul VARCHAR(150),
    email_pengusul VARCHAR(255),
    whatsapp_pengusul VARCHAR(50),

    unit_prodi_id BIGINT REFERENCES master_unit_prodi(id) ON UPDATE CASCADE ON DELETE SET NULL,
    mitra_id BIGINT REFERENCES master_mitra(id) ON UPDATE CASCADE ON DELETE SET NULL,

    judul_pengajuan VARCHAR(255) NOT NULL,
    deskripsi_pengajuan TEXT,

    jenis_dokumen jenis_dokumen_enum NOT NULL,
    kategori_pengajuan VARCHAR(20) CHECK (kategori_pengajuan IN ('internal', 'eksternal')),

    ruang_lingkup_ids BIGINT[] NOT NULL DEFAULT '{}',

    tanggal_mulai DATE,
    tanggal_berakhir DATE,

    status_pengajuan status_pengajuan_enum NOT NULL DEFAULT 'menunggu',

    diajukan_pada TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    email_terverifikasi_pada TIMESTAMP WITHOUT TIME ZONE,

    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pengajuan_status_diajukan ON pengajuan(status_pengajuan, diajukan_pada);
CREATE INDEX IF NOT EXISTS idx_pengajuan_unit_prodi_mitra ON pengajuan(unit_prodi_id, mitra_id);
CREATE INDEX IF NOT EXISTS idx_pengajuan_tanggal ON pengajuan(tanggal_mulai, tanggal_berakhir);
CREATE INDEX IF NOT EXISTS idx_pengajuan_ruang_lingkup_gin ON pengajuan USING GIN (ruang_lingkup_ids);

-- =========================
-- 5) PENGAJUAN FILE
-- =========================

CREATE TABLE IF NOT EXISTS pengajuan_file (
    id BIGSERIAL PRIMARY KEY,
    pengajuan_id BIGINT NOT NULL REFERENCES pengajuan(id) ON UPDATE CASCADE ON DELETE CASCADE,
    nama_file VARCHAR(255) NOT NULL,
    path_file VARCHAR(500) NOT NULL,
    mime_type VARCHAR(120),
    ukuran_file_bytes BIGINT,
    diunggah_oleh_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    diunggah_pada TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pengajuan_file_pengajuan_id ON pengajuan_file(pengajuan_id);

-- =========================
-- 6) PENGAJUAN LOG
-- =========================

CREATE TABLE IF NOT EXISTS pengajuan_log (
    id BIGSERIAL PRIMARY KEY,
    pengajuan_id BIGINT NOT NULL REFERENCES pengajuan(id) ON UPDATE CASCADE ON DELETE CASCADE,
    tipe_log tipe_log_pengajuan_enum NOT NULL,
    status_lama status_pengajuan_enum,
    status_baru status_pengajuan_enum,
    judul_log VARCHAR(255),
    isi_log TEXT,
    payload_json JSONB,
    dibuat_oleh_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    dibuat_pada TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pengajuan_log_pengajuan_id_pada ON pengajuan_log(pengajuan_id, dibuat_pada);

-- =========================
-- 7) DOKUMEN KERJASAMA
-- =========================

CREATE TABLE IF NOT EXISTS dokumen_kerjasama (
    id BIGSERIAL PRIMARY KEY,
    nomor_dokumen VARCHAR(100) NOT NULL UNIQUE,

    sumber_pengajuan_id BIGINT REFERENCES pengajuan(id) ON UPDATE CASCADE ON DELETE SET NULL,
    unit_prodi_id BIGINT REFERENCES master_unit_prodi(id) ON UPDATE CASCADE ON DELETE SET NULL,
    mitra_id BIGINT REFERENCES master_mitra(id) ON UPDATE CASCADE ON DELETE SET NULL,

    jenis_dokumen jenis_dokumen_enum NOT NULL,
    judul_dokumen VARCHAR(255),

    ruang_lingkup_ids BIGINT[] NOT NULL DEFAULT '{}',

    tanggal_mulai DATE NOT NULL,
    tanggal_berakhir DATE NOT NULL,
    tanggal_ttd DATE,

    status_siklus status_siklus_dokumen_enum NOT NULL DEFAULT 'active',
    diarsipkan_pada TIMESTAMP WITHOUT TIME ZONE,
    alasan_arsip TEXT,

    dibuat_oleh_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_dokumen_tanggal_range CHECK (tanggal_berakhir >= tanggal_mulai)
);

CREATE INDEX IF NOT EXISTS idx_dokumen_status_tanggal ON dokumen_kerjasama(status_siklus, tanggal_berakhir);
CREATE INDEX IF NOT EXISTS idx_dokumen_unit_mitra ON dokumen_kerjasama(unit_prodi_id, mitra_id);
CREATE INDEX IF NOT EXISTS idx_dokumen_ruang_lingkup_gin ON dokumen_kerjasama USING GIN (ruang_lingkup_ids);

-- =========================
-- 8) DOKUMEN FILE
-- =========================

CREATE TABLE IF NOT EXISTS dokumen_file (
    id BIGSERIAL PRIMARY KEY,
    dokumen_id BIGINT NOT NULL REFERENCES dokumen_kerjasama(id) ON UPDATE CASCADE ON DELETE CASCADE,
    peran_berkas VARCHAR(30) NOT NULL DEFAULT 'lampiran',
    nama_file VARCHAR(255) NOT NULL,
    path_file VARCHAR(500) NOT NULL,
    mime_type VARCHAR(120),
    ukuran_file_bytes BIGINT,
    diunggah_oleh_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    diunggah_pada TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dokumen_file_dokumen_id ON dokumen_file(dokumen_id);

-- =========================
-- 9) DOKUMEN LOG (AKTIVITAS + NOTIFIKASI + PERPANJANGAN + EVENT)
-- =========================

CREATE TABLE IF NOT EXISTS dokumen_log (
    id BIGSERIAL PRIMARY KEY,
    dokumen_id BIGINT NOT NULL REFERENCES dokumen_kerjasama(id) ON UPDATE CASCADE ON DELETE CASCADE,
    tipe_log tipe_log_dokumen_enum NOT NULL,
    judul_log VARCHAR(255),
    isi_log TEXT,
    payload_json JSONB,
    nomor VARCHAR(100),
    mitra VARCHAR(255),
    telepon VARCHAR(50),
    tgl_mulai DATE,
    tgl_berakhir DATE,
    unit VARCHAR(150),
    lingkup TEXT,
    tingkat VARCHAR(100),
    periode VARCHAR(100),
    judul VARCHAR(255),
    manfaat TEXT,
    bukti VARCHAR(255),
    status VARCHAR(50),
    pic VARCHAR(150),
    tgl_monitoring DATE,
    catatan_perpanjangan TEXT,
    bukti_perpanjangan VARCHAR(255),
    tanggal_mulai_perpanjangan DATE,
    tanggal_berakhir_perpanjangan DATE,
    status_perpanjangan VARCHAR(20),
    requester_role VARCHAR(20),
    notification_href VARCHAR(255),
    diputuskan_pada TIMESTAMP WITHOUT TIME ZONE,
    diputuskan_oleh VARCHAR(100),
    dibuat_oleh_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    dibuat_pada TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dokumen_log_dokumen_id_pada ON dokumen_log(dokumen_id, dibuat_pada);
CREATE INDEX IF NOT EXISTS idx_dokumen_log_tipe ON dokumen_log(tipe_log);

-- =========================
-- VIEW KOMPATIBILITAS ARSIP
-- =========================

CREATE OR REPLACE VIEW v_arsip_dokumen_kerjasama AS
SELECT
    dk.id,
    dk.nomor_dokumen,
    dk.jenis_dokumen,
    dk.unit_prodi_id,
    dk.mitra_id,
    dk.tanggal_mulai,
    dk.tanggal_berakhir,
    COALESCE(dk.diarsipkan_pada, CASE WHEN dk.tanggal_berakhir < CURRENT_DATE THEN NOW() ELSE NULL END) AS efektif_diarsipkan_pada,
    dk.alasan_arsip
FROM dokumen_kerjasama dk
WHERE dk.status_siklus = 'archived'
   OR dk.tanggal_berakhir < CURRENT_DATE;

-- =========================
-- OPTIONAL TRIGGER LIFECYCLE DOKUMEN
-- =========================

CREATE OR REPLACE FUNCTION fn_set_status_siklus_dokumen()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.tanggal_berakhir < CURRENT_DATE THEN
        NEW.status_siklus := 'archived';
        IF NEW.diarsipkan_pada IS NULL THEN
            NEW.diarsipkan_pada := NOW();
        END IF;
    ELSIF NEW.tanggal_berakhir <= (CURRENT_DATE + INTERVAL '90 days') THEN
        IF NEW.status_siklus <> 'archived' THEN
            NEW.status_siklus := 'expiring';
        END IF;
    ELSE
        IF NEW.status_siklus <> 'archived' THEN
            NEW.status_siklus := 'active';
        END IF;
    END IF;

    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_status_siklus_dokumen ON dokumen_kerjasama;

CREATE TRIGGER trg_set_status_siklus_dokumen
BEFORE INSERT OR UPDATE OF tanggal_berakhir, status_siklus
ON dokumen_kerjasama
FOR EACH ROW
EXECUTE FUNCTION fn_set_status_siklus_dokumen();
