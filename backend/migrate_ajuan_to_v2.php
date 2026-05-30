<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\MasterMitra;

$ajuans = DB::table('ajuan')->get();

foreach ($ajuans as $ajuan) {
    $p2 = DB::table('pengajuan_v2')->where('nomor_pengajuan', $ajuan->no_permohonan)->first();
    
    if (!$p2) continue;

    // Fix Dates (DD-MM-YYYY -> YYYY-MM-DD)
    $tglAjuan = null;
    if ($ajuan->tgl_ajuan && preg_match('/^\d{2}-\d{2}-\d{4}$/', $ajuan->tgl_ajuan)) {
        $tglAjuan = \Carbon\Carbon::createFromFormat('d-m-Y', $ajuan->tgl_ajuan)->format('Y-m-d H:i:s');
    }

    $tglDisetujui = null;
    if ($ajuan->tgl_disetujui && preg_match('/^\d{2}-\d{2}-\d{4}$/', $ajuan->tgl_disetujui)) {
        $tglDisetujui = \Carbon\Carbon::createFromFormat('d-m-Y', $ajuan->tgl_disetujui)->format('Y-m-d H:i:s');
    }

    $tglSelesai = null;
    if ($ajuan->tgl_selesai && preg_match('/^\d{2}-\d{2}-\d{4}$/', $ajuan->tgl_selesai)) {
        $tglSelesai = \Carbon\Carbon::createFromFormat('d-m-Y', $ajuan->tgl_selesai)->format('Y-m-d H:i:s');
    }

    // Update MasterMitra
    $mitraId = $p2->mitra_id;
    if ($mitraId) {
        DB::table('master_mitra')->where('id', $mitraId)->update([
            'kategori_mitra' => $ajuan->kategori_institusi ?: null,
            'negara' => $ajuan->negara ?: null,
            'website' => $ajuan->web_institusi ?: null,
            'nama_kontak_utama' => $ajuan->nama_pic ?: null,
            'jabatan_kontak_utama' => $ajuan->jabatan_pic ?: null,
            'email_kontak_utama' => $ajuan->email_pic ?: null,
            'telepon_kontak_utama' => $ajuan->wa_pic ?: null,
        ]);
    }

    // Update Pengajuan V2
    DB::table('pengajuan_v2')->where('id', $p2->id)->update([
        'nama_pengusul' => $ajuan->nama_pemohon ?: $p2->nama_pengusul,
        'jabatan_pengusul' => $ajuan->jabatan_pemohon ?: $p2->jabatan_pengusul,
        'email_pengusul' => $ajuan->email ?: $p2->email_pengusul,
        'whatsapp_pengusul' => $ajuan->wa_pemohon ?: $p2->whatsapp_pengusul,
        'jenis_dokumen' => $ajuan->jenis_ajuan ?: $p2->jenis_dokumen,
        'status_pengajuan' => strtolower($ajuan->status_ajuan) ?: $p2->status_pengajuan,
        'diajukan_pada' => $tglAjuan ?: $p2->diajukan_pada,
        'email_terverifikasi_pada' => $tglDisetujui ?: $p2->email_terverifikasi_pada,
        'tanggal_mulai' => $tglDisetujui ?: $p2->tanggal_mulai, // usually starts when approved
        'tanggal_berakhir' => $tglSelesai ?: $p2->tanggal_berakhir,
        'deskripsi_pengajuan' => $ajuan->komentar ?: $ajuan->catatan ?: $p2->deskripsi_pengajuan,
        // Optional: you can store unit_prodi_id if missing, but we assume it's already mapped
    ]);
}

echo "Data detailed from 'ajuan' has been migrated to 'pengajuan_v2' and 'master_mitra'.\n";

