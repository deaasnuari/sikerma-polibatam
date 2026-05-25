<?php

namespace Database\Seeders;

use App\Models\MasterUnitProdi;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MasterUnitProdiSeeder extends Seeder
{
    /**
     * Seed master_unit_prodi using frontend unit and jurusan options.
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
            $unitIdByNormalizedName = [];
            $usedProdiCodes = [];
            $nextCounterByPrefix = [];
            $legacyJurusanByCode = [
                'MB' => 'Manajemen dan Bisnis',
                'EL' => 'Teknik Elektro',
                'TI' => 'Teknik Informatika',
                'TM' => 'Teknik Mesin',
            ];
            $legacyJurusanPrefix = [
                'Manajemen dan Bisnis' => 'MB',
                'Teknik Elektro' => 'EL',
                'Teknik Informatika' => 'IF',
                'Teknik Mesin' => 'TM',
            ];
            $placeholderValues = ['-', '--', '---pilih---', 'pilih...', 'n/a', 'null'];

            $existingProdiCodes = MasterUnitProdi::query()
                ->where('jenis_node', 'prodi')
                ->whereNotNull('kode')
                ->pluck('kode')
                ->map(static fn ($value) => strtoupper(trim((string) $value)))
                ->filter()
                ->values();

            foreach ($existingProdiCodes as $code) {
                $usedProdiCodes[$code] = true;
                if (preg_match('/^([A-Z0-9]+)(\d{2})$/', $code, $matches) === 1) {
                    $prefix = $matches[1];
                    $number = (int) $matches[2];
                    $nextCounterByPrefix[$prefix] = max($nextCounterByPrefix[$prefix] ?? 0, $number);
                }
            }

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
                $unitIdByNormalizedName[strtolower(trim($jurusan->nama))] = $jurusan->id;
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
                $unitIdByNormalizedName[strtolower(trim($unit->nama))] = $unit->id;
            }

            $generateProdiCode = static function (string $prefixRaw) use (&$usedProdiCodes, &$nextCounterByPrefix): ?string {
                $prefix = strtoupper(preg_replace('/[^A-Z0-9]/', '', $prefixRaw));
                if ($prefix === '') {
                    return null;
                }

                $nextCounterByPrefix[$prefix] = $nextCounterByPrefix[$prefix] ?? 0;

                do {
                    $nextCounterByPrefix[$prefix]++;
                    $candidate = sprintf('%s%02d', $prefix, $nextCounterByPrefix[$prefix]);
                } while (isset($usedProdiCodes[$candidate]));

                $usedProdiCodes[$candidate] = true;
                return $candidate;
            };

            // 3) Seed prodi dari data legacy (ajuan) agar bukan jurusan saja.
            if (\Illuminate\Support\Facades\Schema::hasTable('ajuan')) {
                $legacyRows = DB::table('ajuan')
                    ->select(['unit', 'prodi'])
                    ->whereNotNull('prodi')
                    ->get();

                foreach ($legacyRows as $legacyRow) {
                    $legacyUnit = trim((string) ($legacyRow->unit ?? ''));
                    $legacyProdi = trim((string) ($legacyRow->prodi ?? ''));

                    if ($legacyProdi === '') {
                        continue;
                    }

                    $normalizedProdi = strtolower($legacyProdi);
                    if (in_array($normalizedProdi, $placeholderValues, true)) {
                        continue;
                    }

                    $parentId = null;

                    if ($legacyUnit !== '') {
                        $legacyUnitUpper = strtoupper($legacyUnit);
                        if (isset($legacyJurusanByCode[$legacyUnitUpper])) {
                            $mappedName = $legacyJurusanByCode[$legacyUnitUpper];
                            $parentId = $unitIdByName[$mappedName] ?? null;
                        }

                        if ($parentId === null) {
                            $parentId = $unitIdByNormalizedName[strtolower($legacyUnit)] ?? null;
                        }

                        // Jika unit legacy belum ada, buat sebagai unit_kerja agar parent prodi tetap valid.
                        if ($parentId === null && !in_array(strtolower($legacyUnit), $placeholderValues, true)) {
                            $newUnit = MasterUnitProdi::query()->updateOrCreate(
                                [
                                    'parent_id' => null,
                                    'nama' => $legacyUnit,
                                ],
                                [
                                    'jenis_node' => 'unit',
                                    'kategori_unit' => 'unit_kerja',
                                    'kode' => null,
                                    'aktif' => true,
                                ]
                            );

                            $parentId = $newUnit->id;
                            $unitIdByName[$newUnit->nama] = $newUnit->id;
                            $unitIdByNormalizedName[strtolower(trim($newUnit->nama))] = $newUnit->id;
                        }
                    }

                    if ($parentId === null) {
                        continue;
                    }

                    $existingProdi = MasterUnitProdi::query()
                        ->where('parent_id', $parentId)
                        ->where('jenis_node', 'prodi')
                        ->where('nama', $legacyProdi)
                        ->first();

                    $resolvedCode = $existingProdi?->kode;
                    if ($resolvedCode !== null && trim((string) $resolvedCode) !== '') {
                        $normalizedCode = strtoupper(trim((string) $resolvedCode));
                        $usedProdiCodes[$normalizedCode] = true;
                    } else {
                        $prefix = strtoupper(trim($legacyUnit));

                        if (isset($legacyJurusanByCode[$prefix])) {
                            $mappedJurusan = $legacyJurusanByCode[$prefix];
                            $prefix = $legacyJurusanPrefix[$mappedJurusan] ?? $prefix;
                        }

                        if (strlen($prefix) < 2) {
                            $prefix = strtoupper(preg_replace('/[^A-Z0-9]/', '', substr($legacyUnit, 0, 4)));
                        }

                        $resolvedCode = $generateProdiCode($prefix);
                    }

                    MasterUnitProdi::query()->updateOrCreate(
                        [
                            'parent_id' => $parentId,
                            'nama' => $legacyProdi,
                        ],
                        [
                            'jenis_node' => 'prodi',
                            'kategori_unit' => null,
                            'kode' => $resolvedCode,
                            'aktif' => true,
                        ]
                    );
                }
            }
        });
    }
}
