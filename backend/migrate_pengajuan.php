<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\MasterMitra;
use App\Models\MasterUnitProdi;
use App\Models\MasterRuangLingkup;

$oldRows = DB::table('pengajuan')->get();

foreach ($oldRows as $row) {
    // Check if it already exists in pengajuan_v2 by some logic?
    // Maybe we just insert all of them.
    // Wait, the new table uses "nomor_pengajuan" (e.g. "PMH001") which comes from "id"?
    // In old table, no "nomor_pengajuan" exists, but we can generate one.
    
    $nomor = 'LEGACY-' . str_pad($row->id, 4, '0', STR_PAD_LEFT);
    
    // Map Jurusan
    $unitProdiId = null;
    if ($row->jurusan) {
        $unit = MasterUnitProdi::where('nama', 'ilike', '%' . $row->jurusan . '%')->first();
        if ($unit) {
            $unitProdiId = $unit->id;
        }
    }
    
    // Map Mitra
    $mitraId = null;
    $namaMitra = $row->mitra;
    if ($row->mitra) {
        $mitra = MasterMitra::where('nama_mitra', 'ilike', '%' . $row->mitra . '%')->first();
        if ($mitra) {
            $mitraId = $mitra->id;
            $namaMitra = null;
        }
    }
    
    // Map Ruang Lingkup
    $ruangLingkupIds = [];
    if ($row->ruang_lingkup) {
        $names = json_decode($row->ruang_lingkup, true);
        if (is_array($names)) {
            foreach ($names as $name) {
                $rl = MasterRuangLingkup::where('nama_ruang_lingkup', 'ilike', '%' . trim($name) . '%')->first();
                if ($rl) {
                    $ruangLingkupIds[] = $rl->id;
                }
            }
        }
    }
    
    // Map Kategori
    $kategori = 'eksternal'; // default
    if (strtolower(trim($row->kategori)) === 'internal') {
        $kategori = 'internal';
    }

    // Tanggal
    $tanggalMulai = $row->tanggal_mulai ?: $row->tanggal;
    
    DB::table('pengajuan_v2')->insert([
        'nomor_pengajuan' => $nomor,
        'user_pengusul_id' => $row->created_by_user_id,
        'nama_pengusul' => $row->pengusul ?: '-',
        'jabatan_pengusul' => '-',
        'email_pengusul' => $row->email_pengusul,
        'whatsapp_pengusul' => $row->whatsapp_pengusul ?: '-',
        'unit_prodi_id' => $unitProdiId,
        'mitra_id' => $mitraId,
        'nama_mitra' => $namaMitra,
        'judul_pengajuan' => $row->judul ?: 'Pengajuan Legacy',
        'deskripsi_pengajuan' => $row->deskripsi,
        'jenis_dokumen' => $row->jenis_dokumen ?: 'MOU',
        'kategori_pengajuan' => $kategori,
        'ruang_lingkup_ids' => '{' . implode(',', $ruangLingkupIds) . '}',
        'tanggal_mulai' => $tanggalMulai,
        'tanggal_berakhir' => $row->tanggal_berakhir,
        'status_pengajuan' => $row->status ?: 'diproses',
        'diajukan_pada' => $row->tanggal ?: $row->created_at,
        'email_terverifikasi_pada' => $row->email_terverifikasi ? $row->created_at : null,
        'created_at' => $row->created_at,
        'updated_at' => $row->updated_at,
    ]);
}
echo "Migrated " . count($oldRows) . " rows.\n";

