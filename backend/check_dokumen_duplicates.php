<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$dokumens = DB::table('dokumen')->get();
$duplicates = 0;
$missing = 0;

foreach ($dokumens as $dokumen) {
    if (!$dokumen->no_dokumen) {
        $missing++;
        continue;
    }
    $exists = DB::table('dokumen_kerjasama')->where('no_dokumen', $dokumen->no_dokumen)->exists();
    if ($exists) {
        $duplicates++;
    } else {
        $missing++;
    }
}

echo "Duplicates: $duplicates\n";
echo "Missing: $missing\n";
