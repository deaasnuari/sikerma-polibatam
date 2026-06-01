<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('dokumen_kerjasama') || !Schema::hasTable('dokumen_log') || !Schema::hasTable('pengajuan_v2')) {
            return;
        }

        DB::table('dokumen_kerjasama')
            ->whereNotNull('sumber_pengajuan_id')
            ->orderBy('id')
            ->chunkById(200, function ($dokumens): void {
                foreach ($dokumens as $dokumen) {
                    $alreadyExists = DB::table('dokumen_log')
                        ->where('dokumen_id', $dokumen->id)
                        ->where('tipe_log', 'pengajuan_awal')
                        ->exists();

                    if ($alreadyExists) {
                        continue;
                    }

                    $pengajuan = DB::table('pengajuan_v2')->where('id', $dokumen->sumber_pengajuan_id)->first();
                    if (!$pengajuan) {
                        continue;
                    }

                    $unitNama = null;
                    if (!empty($pengajuan->unit_prodi_id)) {
                        $unitNama = DB::table('master_unit_prodi')
                            ->where('id', $pengajuan->unit_prodi_id)
                            ->value('nama');
                    }

                    $mitraNama = trim((string) ($pengajuan->nama_mitra ?? ''));
                    if ($mitraNama === '' && !empty($pengajuan->mitra_id)) {
                        $mitraNama = (string) (DB::table('master_mitra')->where('id', $pengajuan->mitra_id)->value('nama_mitra') ?? '');
                    }

                    $lingkup = $this->resolveLingkupLabel($pengajuan->ruang_lingkup_ids ?? null);

                    DB::table('dokumen_log')->insert([
                        'dokumen_id' => $dokumen->id,
                        'tipe_log' => 'pengajuan_awal',
                        'judul_log' => 'Data awal pengajuan disalin ke dokumen',
                        'isi_log' => 'Backfill data pengajuan awal untuk dokumen lama.',
                        'payload_json' => null,
                        'nomor' => $dokumen->nomor_dokumen ?: $dokumen->no_dokumen,
                        'mitra' => $mitraNama !== '' ? $mitraNama : null,
                        'telepon' => $pengajuan->whatsapp_pengusul,
                        'tgl_mulai' => $pengajuan->tanggal_mulai,
                        'tgl_berakhir' => $pengajuan->tanggal_berakhir,
                        'unit' => $unitNama,
                        'lingkup' => $lingkup,
                        'tingkat' => strtolower((string) ($pengajuan->kategori_pengajuan ?? '')) === 'eksternal'
                            ? 'lokal/wilayah'
                            : 'internal',
                        'periode' => null,
                        'judul' => $pengajuan->judul_pengajuan,
                        'manfaat' => $pengajuan->deskripsi_pengajuan,
                        'bukti' => $dokumen->file,
                        'status' => 'aktif',
                        'pic' => $pengajuan->nama_pengusul,
                        'tgl_monitoring' => now()->toDateString(),
                        'dibuat_oleh_user_id' => $dokumen->dibuat_oleh_user_id,
                        'dibuat_pada' => now(),
                    ]);
                }
            });
    }

    public function down(): void
    {
        if (!Schema::hasTable('dokumen_log')) {
            return;
        }

        DB::table('dokumen_log')
            ->where('tipe_log', 'pengajuan_awal')
            ->where('isi_log', 'Backfill data pengajuan awal untuk dokumen lama.')
            ->delete();
    }

    private function resolveLingkupLabel($ruangLingkupIds): ?string
    {
        $ids = [];

        if (is_string($ruangLingkupIds) && trim($ruangLingkupIds) !== '') {
            $decoded = json_decode($ruangLingkupIds, true);
            if (is_array($decoded)) {
                $ids = $decoded;
            } else {
                $clean = trim($ruangLingkupIds, '{}');
                if ($clean !== '') {
                    $ids = explode(',', $clean);
                }
            }
        } elseif (is_array($ruangLingkupIds)) {
            $ids = $ruangLingkupIds;
        }

        $normalizedIds = array_values(array_unique(array_filter(array_map(static function ($id) {
            if (is_numeric($id)) {
                return (int) $id;
            }

            return null;
        }, $ids))));

        if (empty($normalizedIds)) {
            return null;
        }

        $labels = DB::table('master_ruang_lingkup')
            ->whereIn('id', $normalizedIds)
            ->pluck('nama_ruang_lingkup')
            ->filter()
            ->values()
            ->all();

        return empty($labels) ? null : implode(', ', $labels);
    }
};