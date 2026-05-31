<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$monitoringRecords = DB::table('monitoring')->get();
$migrated = 0;
$notFound = 0;

foreach ($monitoringRecords as $mon) {
    // Cari dokumen by no_dokumen atau nomor_dokumen
    $dok = DB::table('dokumen_kerjasama')
        ->where('no_dokumen', $mon->nomor)
        ->orWhere('nomor_dokumen', $mon->nomor)
        ->first();

    // Jika tidak ketemu berdasarkan nomor, coba cari berdasarkan nama mitra dan tanggal
    if (!$dok) {
        $dok = DB::table('dokumen_kerjasama')
            ->where('tanggal_mulai', $mon->tgl_mulai)
            ->whereExists(function ($query) use ($mon) {
                $query->select(DB::raw(1))
                      ->from('master_mitra')
                      ->whereColumn('master_mitra.id', 'dokumen_kerjasama.mitra_id')
                      ->where('master_mitra.nama_mitra', 'LIKE', '%' . $mon->mitra . '%');
            })
            ->first();
    }

    if ($dok) {
        // Parse tgl_monitoring if valid
        $dibuatPada = null;
        if (!empty($mon->tgl_monitoring)) {
            $parsed = strtotime($mon->tgl_monitoring);
            if ($parsed) {
                $dibuatPada = date('Y-m-d H:i:s', $parsed);
            }
        }

        DB::table('dokumen_log')->insert([
            'dokumen_id' => $dok->id,
            'tipe_log' => 'monitoring_legacy',
            'judul_log' => trim($mon->judul) ?: 'Monitoring (Legacy)',
            'isi_log' => trim($mon->manfaat) ?: 'Hasil monitoring dokumen lama.',
            'payload_json' => json_encode($mon),
            'dibuat_oleh_user_id' => null,
            'dibuat_pada' => $dibuatPada ?: now()
        ]);
        $migrated++;
    } else {
        // Jika benar-benar tidak ketemu dokumennya, simpan ke dokumen_id NULL atau log info
        // wait, dokumen_id mungkin tidak boleh null?
        $notFound++;
    }
}

echo "Berhasil memigrasi $migrated data monitoring. Tidak ketemu pasangannya: $notFound\n";
