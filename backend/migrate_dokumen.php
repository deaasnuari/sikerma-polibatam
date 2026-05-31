<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

$dokumens = DB::table('dokumen')->get();
$migrated = 0;
$skipped = 0;

foreach ($dokumens as $dokumen) {
    $noDokumen = trim($dokumen->no_dokumen);
    if (empty($noDokumen)) {
        $noDokumen = 'LEGACY-DOKUMEN-' . $dokumen->id;
    }

    // Check if already migrated
    $exists = DB::table('dokumen_kerjasama')->where('no_permohonan', 'LEGACY-DOKUMEN-' . $dokumen->id)->exists();
    if ($exists) {
        $skipped++;
        continue;
    }

    // Check if no_dokumen already exists
    $existsNoDok = DB::table('dokumen_kerjasama')->where('no_dokumen', $noDokumen)->exists();
    if ($existsNoDok) {
        // We can append -LEGACY-{id} to make it unique, or just skip. 
        // We'll append suffix so no document is lost
        $noDokumen = $noDokumen . '-L' . $dokumen->id;
    }

    // Map Unit Prodi
    $unitProdiId = null;
    if ($dokumen->unit) {
        $unit = DB::table('master_unit_prodi')->where('nama', 'ilike', '%' . $dokumen->unit . '%')->first();
        if ($unit) {
            $unitProdiId = $unit->id;
        }
    }

    // Map Mitra
    $mitraId = null;
    if ($dokumen->mitra) {
        $mitra = DB::table('master_mitra')->where('nama_mitra', 'ilike', '%' . $dokumen->mitra . '%')->first();
        if ($mitra) {
            $mitraId = $mitra->id;
        } else {
            // Create new Mitra
            $mitraId = DB::table('master_mitra')->insertGetId([
                'nama_mitra' => $dokumen->mitra,
                'kategori_mitra' => $dokumen->kategori_institusi,
                'negara' => $dokumen->negara,
                'telepon_kontak_utama' => $dokumen->telepon,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    // Status siklus
    $statusSiklus = 'active';
    if ($dokumen->tgl_akhir) {
        try {
            $endDate = Carbon::parse($dokumen->tgl_akhir);
            if ($endDate->isPast()) {
                $statusSiklus = 'archived';
            }
        } catch (\Exception $e) {
            // ignore parsing error
        }
    }

    // Ruang Lingkup
    $ruangLingkupIds = [];
    if ($dokumen->bidang) {
        $bidangs = array_map('trim', explode(',', $dokumen->bidang));
        foreach ($bidangs as $bidang) {
            $rl = DB::table('master_ruang_lingkup')->where('nama_ruang_lingkup', 'ilike', '%' . $bidang . '%')->first();
            if ($rl) {
                $ruangLingkupIds[] = $rl->id;
            }
        }
    }

    // Ensure valid dates
    $tglMulai = null;
    if ($dokumen->tgl_mulai && strtotime($dokumen->tgl_mulai)) {
        $tglMulai = $dokumen->tgl_mulai;
    }
    
    $tglAkhir = null;
    if ($dokumen->tgl_akhir && strtotime($dokumen->tgl_akhir)) {
        $tglAkhir = $dokumen->tgl_akhir;
    }

    try {
        DB::table('dokumen_kerjasama')->insert([
            'no_permohonan' => 'LEGACY-DOKUMEN-' . $dokumen->id,
            'no_dokumen' => $noDokumen,
            'nama_dokumen' => 'Dokumen ' . $noDokumen,
            'jenis_dokumen' => strtoupper($dokumen->jenis_ajuan) ?: 'MOU',
            'judul_dokumen' => $dokumen->bidang ?: 'Migrasi Dokumen',
            'ruang_lingkup_ids' => json_encode($ruangLingkupIds),
            'tanggal_mulai' => $tglMulai,
            'tanggal_berakhir' => $tglAkhir,
            'status_siklus' => $statusSiklus,
            'diarsipkan_pada' => $statusSiklus === 'archived' ? now() : null,
            'alasan_arsip' => $statusSiklus === 'archived' ? 'Masa berlaku telah habis (migrasi)' : null,
            'unit_prodi_id' => $unitProdiId,
            'mitra_id' => $mitraId,
            'file' => $dokumen->file,
            'keterangan' => 'Migrasi dari tabel dokumen',
            'created_at' => $dokumen->created_at ?: now(),
            'updated_at' => $dokumen->updated_at ?: now(),
        ]);
        $migrated++;
    } catch (\Exception $e) {
        // log or ignore
        echo "Error on ID {$dokumen->id}: " . $e->getMessage() . "\n";
    }
}

echo "Berhasil memigrasi $migrated data dari tabel 'dokumen' ke 'dokumen_kerjasama'.\n";
echo "Skipped (already migrated earlier): $skipped\n";

