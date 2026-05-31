<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$dokumens = DB::table('dokumen_kerjasama')
    ->whereNotNull('file')
    ->whereNotIn('id', function($query) {
        $query->select('dokumen_id')->from('dokumen_file');
    })
    ->get();

$migrated = 0;

foreach ($dokumens as $dok) {
    if (trim($dok->file) === '') continue;

    DB::table('dokumen_file')->insert([
        'dokumen_id' => $dok->id,
        'peran_berkas' => 'final',
        'nama_file' => $dok->file,
        'path_file' => clone_legacy_path($dok->file), // Assuming they use the same pathing for legacy files
        'diunggah_pada' => $dok->created_at ?: now(),
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $migrated++;
}

function clone_legacy_path($fileName) {
    // If the path_file is just the file name, we'll keep it as the file name, or add a prefix if needed
    // In previous dump: "nama_file": "BP Batam.pdf", "path_file": "BP Batam.pdf"
    return $fileName;
}

echo "Berhasil memigrasi $migrated file ke tabel 'dokumen_file'.\n";

