<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Throwable;

class DokumenKerjasamaSeeder extends Seeder
{
    public function run(): void
    {
        if (!Schema::hasTable('dokumen_kerjasama')) {
            $this->command?->error('Tabel dokumen_kerjasama belum ada. Jalankan migration dulu.');
            return;
        }

        if (!Schema::hasTable('ajuan')) {
            $this->command?->error('Tabel ajuan belum ada. Seeder dibatalkan agar FK tetap aman.');
            return;
        }

        try {
            $oldConnection = DB::connection('mysql_old');

            if (!$oldConnection->getSchemaBuilder()->hasTable('rekap')) {
                $this->command?->error('Tabel rekap tidak ditemukan di koneksi mysql_old.');
                return;
            }
        } catch (Throwable $exception) {
            $this->command?->error('Koneksi mysql_old gagal: ' . $exception->getMessage());
            return;
        }

        $dokumenLookup = collect();
        if ($oldConnection->getSchemaBuilder()->hasTable('dokumen')) {
            $dokumenLookup = $oldConnection
                ->table('dokumen')
                ->select(['no_dokumen', 'jenis_ajuan', 'mitra', 'bidang', 'file'])
                ->whereNotNull('no_dokumen')
                ->get()
                ->keyBy(static fn ($row) => trim((string) $row->no_dokumen));
        }

        $ajuanNumbers = DB::table('ajuan')->pluck('no_permohonan')->map(
            static fn ($noPermohonan) => trim((string) $noPermohonan)
        )->flip();

        $processed = 0;
        $insertedOrUpdated = 0;
        $skippedMissingPermohonan = 0;
        $skippedMissingFile = 0;

        $oldConnection->table('rekap')
            ->select(['no_permohonan', 'no_dokumen', 'file'])
            ->orderBy('id')
            ->chunk(500, function ($rows) use (
                $dokumenLookup,
                $ajuanNumbers,
                &$processed,
                &$insertedOrUpdated,
                &$skippedMissingPermohonan,
                &$skippedMissingFile
            ) {
                foreach ($rows as $row) {
                    $processed++;

                    $noPermohonan = trim((string) ($row->no_permohonan ?? ''));
                    if ($noPermohonan === '' || !$ajuanNumbers->has($noPermohonan)) {
                        $skippedMissingPermohonan++;
                        continue;
                    }

                    $noDokumenRaw = trim((string) ($row->no_dokumen ?? ''));
                    $noDokumen = $noDokumenRaw === '' ? null : $noDokumenRaw;
                    $legacyDokumen = $noDokumen ? $dokumenLookup->get($noDokumen) : null;

                    $file = trim((string) ($row->file ?? ''));
                    if ($file === '' && $legacyDokumen) {
                        $file = trim((string) ($legacyDokumen->file ?? ''));
                    }

                    if ($file === '') {
                        $skippedMissingFile++;
                        continue;
                    }

                    $jenisDokumen = $legacyDokumen ? trim((string) ($legacyDokumen->jenis_ajuan ?? '')) : '';
                    $namaDokumen = $jenisDokumen !== ''
                        ? 'Dokumen ' . $jenisDokumen
                        : ($noDokumen ? 'Dokumen Kerjasama ' . $noDokumen : 'Dokumen Kerjasama ' . $noPermohonan);

                    $keteranganParts = ['Migrasi data lama'];
                    if ($legacyDokumen && trim((string) ($legacyDokumen->mitra ?? '')) !== '') {
                        $keteranganParts[] = 'Mitra: ' . trim((string) $legacyDokumen->mitra);
                    }
                    if ($legacyDokumen && trim((string) ($legacyDokumen->bidang ?? '')) !== '') {
                        $keteranganParts[] = 'Bidang: ' . trim((string) $legacyDokumen->bidang);
                    }

                    $payload = [
                        'no_permohonan' => $noPermohonan,
                        'no_dokumen' => $noDokumen,
                        'nama_dokumen' => $namaDokumen,
                        'jenis_dokumen' => $jenisDokumen !== '' ? $jenisDokumen : null,
                        'file' => $file,
                        'keterangan' => implode(' | ', $keteranganParts),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];

                    if ($noDokumen) {
                        DB::table('dokumen_kerjasama')->updateOrInsert(
                            ['no_dokumen' => $noDokumen],
                            $payload
                        );
                    } else {
                        DB::table('dokumen_kerjasama')->updateOrInsert(
                            [
                                'no_permohonan' => $noPermohonan,
                                'file' => $file,
                            ],
                            $payload
                        );
                    }

                    $insertedOrUpdated++;
                }
            });

        $this->command?->info('DokumenKerjasamaSeeder selesai.');
        $this->command?->line('Total baris rekap diproses: ' . $processed);
        $this->command?->line('Berhasil insert/update: ' . $insertedOrUpdated);
        $this->command?->line('Skip no_permohonan tidak valid/ tidak ada di ajuan: ' . $skippedMissingPermohonan);
        $this->command?->line('Skip karena file kosong: ' . $skippedMissingFile);
    }
}