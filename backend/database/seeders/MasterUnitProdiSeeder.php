<?php

namespace Database\Seeders;

use App\Models\MasterUnitProdi;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class MasterUnitProdiSeeder extends Seeder
{
    private const JURUSAN_CODE_TO_NAME = [
        'MB' => 'Manajemen dan Bisnis',
        'EL' => 'Teknik Elektro',
        'IF' => 'Teknik Informatika',
        'TM' => 'Teknik Mesin',
    ];

    /**
     * Seed master_unit_prodi using frontend unit options and existing prodi table.
     */
    public function run(): void
    {
        $frontendJurusan = [
            'Manajemen dan Bisnis',
            'Teknik Elektro',
            'Teknik Informatika',
            'Teknik Mesin',
        ];

        $frontendUnits = [
            ['nama' => 'SHILAU (Satuan Hilirisasi Inovasi dan Layanan Usaha)', 'kode' => null],
            ['nama' => 'P4M (Pusat Penjaminan Mutu dan Pengembangan Pembelajaran)', 'kode' => null],
            ['nama' => 'P3M (Pusat Penelitian dan Pengabdian Kepada Masyarakat)', 'kode' => null],
            ['nama' => 'SPI (Satuan Pengawas Internal)', 'kode' => null],
            ['nama' => 'Akademik (Subag Akademik)', 'kode' => null],
            ['nama' => 'SBUM (Sub Bagian Umum)', 'kode' => null],
            ['nama' => 'UPA PKK (Pengembangan Karier dan Kewirausahaan)', 'kode' => null],
            ['nama' => 'UPA Perpustakaan', 'kode' => null],
            ['nama' => 'UPA PP (Perbaikan dan Perawatan)', 'kode' => null],
            ['nama' => 'UPA TIK (Teknologi Informasi dan Komunikasi)', 'kode' => null],
            ['nama' => 'Pokja OSDM (Organisasi dan SDM)', 'kode' => null],
            ['nama' => 'Pokja Perencanaan', 'kode' => null],
            ['nama' => 'Pokja Kemahasiswaan', 'kode' => null],
            ['nama' => 'Pokja BMN & Pengadaan', 'kode' => null],
            ['nama' => 'Pokja Keuangan', 'kode' => null],
            ['nama' => 'Pokja Humas dan Kerjasama', 'kode' => null],
            ['nama' => 'Polibatam Career Development Center', 'kode' => 'CDC1'],
            ['nama' => 'Kepegawaian', 'kode' => 'KPG1'],
        ];

        DB::transaction(function () use ($frontendJurusan, $frontendUnits) {
            $frontendUnitNames = array_values(array_unique(array_map(
                static fn (array $item): string => $item['nama'],
                $frontendUnits
            )));

            $validTopLevelNames = array_values(array_unique(array_merge($frontendJurusan, $frontendUnitNames)));

            // Bersihkan child prodi lama agar tidak dobel saat re-seed.
            MasterUnitProdi::query()->where('jenis_node', 'prodi')->delete();

            // Bersihkan unit root lama yang tidak termasuk daftar frontend.
            MasterUnitProdi::query()
                ->whereNull('parent_id')
                ->where('jenis_node', 'unit')
                ->whereNotIn('nama', $validTopLevelNames)
                ->delete();

            $unitIdByName = [];

            // 1) Seed jurusan parents (4 jurusan).
            foreach ($frontendJurusan as $jurusanName) {
                $jurusan = MasterUnitProdi::query()->updateOrCreate(
                    [
                        'parent_id' => null,
                        'nama' => $jurusanName,
                    ],
                    [
                        'jenis_node' => 'unit',
                        'kategori_unit' => 'jurusan',
                        'kode' => null,
                        'aktif' => true,
                    ]
                );

                $unitIdByName[$jurusan->nama] = $jurusan->id;
            }

            // 2) Seed unit kerja parents from frontend options.
            foreach ($frontendUnits as $unitItem) {
                $unitName = $unitItem['nama'];
                $unit = MasterUnitProdi::query()->updateOrCreate(
                    [
                        'parent_id' => null,
                        'nama' => $unitName,
                    ],
                    [
                        'jenis_node' => 'unit',
                        'kategori_unit' => 'unit_kerja',
                        'kode' => $unitItem['kode'],
                        'aktif' => true,
                    ]
                );

                $unitIdByName[$unit->nama] = $unit->id;
            }

            if (!Schema::hasTable('prodi')) {
                $this->command?->warn('Tabel prodi tidak ditemukan. Seeder hanya mengisi data unit frontend.');
                return;
            }

            // 3) Seed prodi children from legacy prodi table.
            $prodiRows = DB::table('prodi')
                ->select(['kode', 'nama', 'unit'])
                ->orderBy('id')
                ->get();

            $createdOrUpdated = 0;

            foreach ($prodiRows as $row) {
                $prodiName = trim((string) ($row->nama ?? ''));
                if ($prodiName === '') {
                    continue;
                }

                $legacyUnit = strtoupper(trim((string) ($row->unit ?? '')));
                $parentName = self::JURUSAN_CODE_TO_NAME[$legacyUnit] ?? trim((string) ($row->unit ?? ''));

                // Kolom prodi.unit diperlakukan sebagai jurusan.
                if (!in_array($parentName, $frontendJurusan, true)) {
                    continue;
                }

                $parentId = null;

                if ($parentName !== '') {
                    if (!isset($unitIdByName[$parentName])) {
                        $fallbackUnit = MasterUnitProdi::query()->updateOrCreate(
                            [
                                'parent_id' => null,
                                'nama' => $parentName,
                            ],
                            [
                                'jenis_node' => 'unit',
                                'kategori_unit' => 'jurusan',
                                'kode' => null,
                                'aktif' => true,
                            ]
                        );

                        $unitIdByName[$parentName] = $fallbackUnit->id;
                    }

                    $parentId = $unitIdByName[$parentName];
                }

                MasterUnitProdi::query()->updateOrCreate(
                    [
                        'parent_id' => $parentId,
                        'nama' => $prodiName,
                    ],
                    [
                        'jenis_node' => 'prodi',
                        'kategori_unit' => null,
                        'kode' => $row->kode ? trim((string) $row->kode) : null,
                        'aktif' => true,
                    ]
                );

                $createdOrUpdated++;
            }

            $this->command?->info('MasterUnitProdiSeeder selesai. Prodi diproses: ' . $createdOrUpdated);
        });
    }
}
