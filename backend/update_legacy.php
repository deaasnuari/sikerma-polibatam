<?php
$arsips = Illuminate\Support\Facades\DB::table('dokumen_kerjasama')->where('no_permohonan', 'like', 'LEGACY-ARSIP%')->get();
$count = 0;
foreach ($arsips as $arsip) {
    preg_match('/Mitra:\s*(.*?)(?:\s*\|\s*Bidang:|$)/i', $arsip->keterangan, $matches);
    if (isset($matches[1])) {
        $mitraName = trim($matches[1]);
        $mitra = Illuminate\Support\Facades\DB::table('master_mitra')->where('nama_mitra', 'ILIKE', $mitraName)->first();
        if ($mitra) {
            Illuminate\Support\Facades\DB::table('dokumen_kerjasama')->where('id', $arsip->id)->update(['mitra_id' => $mitra->id]);
            $count++;
        }
    }
}
echo "Updated $count legacy arsip mitras.\n";
