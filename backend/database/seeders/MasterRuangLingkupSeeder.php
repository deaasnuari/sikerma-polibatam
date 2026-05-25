<?php

namespace Database\Seeders;

use App\Models\MasterRuangLingkup;
use Illuminate\Database\Seeder;

class MasterRuangLingkupSeeder extends Seeder
{
    /**
     * Seed the master ruang lingkup table with canonical options.
     */
    public function run(): void
    {
        $ruangLingkupList = [
            'Penelitian',
            'Pengabdian Masyarakat',
            'Magang',
            'Pertukaran Mahasiswa',
            'Pelatihan',
            'Workshop',
            'Sertifikasi',
            'Joint Program',
        ];

        foreach ($ruangLingkupList as $namaRuangLingkup) {
            MasterRuangLingkup::query()->updateOrCreate(
                ['nama_ruang_lingkup' => $namaRuangLingkup],
                ['aktif' => true],
            );
        }
    }
}
