<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Exception;
use Illuminate\Support\Str;

class MigrateLegacyData extends Command
{
    protected $signature = 'migrate:legacy-data {--fresh : Truncate new tables before migration}';
    protected $description = 'Migrates data from old tables (ajuan, dokumen, dll) to the new PostgreSQL schema (pengajuan_v2, dll)';

    public function handle()
    {
        $this->info('Starting legacy data migration...');

        if ($this->option('fresh')) {
            $this->warn('Truncating new tables...');
            DB::statement('SET session_replication_role = replica;');
            $tables = [
                'dokumen_log', 'dokumen_file', 'dokumen_kerjasama',
                'pengajuan_log', 'pengajuan_file', 'pengajuan',
                'master_mitra', 'master_ruang_lingkup', 'master_unit_prodi'
            ];
            foreach ($tables as $table) {
                if (Schema::hasTable($table)) {
                    DB::table($table)->truncate();
                }
            }
            DB::statement('SET session_replication_role = DEFAULT;');
            $this->info('Tables truncated.');
        }

        DB::beginTransaction();

        try {
            $this->migrateMasterUnitProdi();
            $this->migrateMasterMitra();
            $this->migratePengajuanV2();
            $this->migrateDokumenKerjasama();

            DB::commit();
            $this->info('Migration completed successfully!');
        } catch (Exception $e) {
            DB::rollBack();
            $this->error('Migration failed: ' . $e->getMessage());
            $this->error($e->getTraceAsString());
            return 1;
        }

        return 0;
    }

    protected function migrateMasterUnitProdi()
    {
        $this->info('Migrating prodi and unit to master_unit_prodi...');
        if (!Schema::hasTable('ajuan')) return;
        
        $ajuans = DB::table('ajuan')->get();
        
        $units = $ajuans->pluck('unit')->unique()->filter();
        $unitMap = [];

        foreach ($units as $unitName) {
            $unitName = trim($unitName);
            if (empty($unitName)) continue;
            
            $existing = DB::table('master_unit_prodi')->where('nama', $unitName)->where('jenis_node', 'unit')->first();
            if (!$existing) {
                $id = DB::table('master_unit_prodi')->insertGetId([
                    'nama' => $unitName,
                    'jenis_node' => 'unit',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $unitMap[$unitName] = $id;
            } else {
                $unitMap[$unitName] = $existing->id;
            }
        }

        $prodis = $ajuans->map(function($item) {
            return ['unit' => trim($item->unit ?? ''), 'prodi' => trim($item->prodi ?? '')];
        })->unique('prodi')->filter(function($item) {
            return !empty($item['prodi']);
        });

        foreach ($prodis as $prodi) {
            $parentId = isset($unitMap[$prodi['unit']]) ? $unitMap[$prodi['unit']] : null;
            
            $existing = DB::table('master_unit_prodi')->where('nama', $prodi['prodi'])->where('jenis_node', 'prodi')->first();
            if (!$existing) {
                DB::table('master_unit_prodi')->insert([
                    'nama' => $prodi['prodi'],
                    'jenis_node' => 'prodi',
                    'parent_id' => $parentId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
        $this->info('Migrated master_unit_prodi.');
    }
    
    protected function migrateMasterMitra()
    {
        $this->info('Migrating institusi to master_mitra...');
        if (!Schema::hasTable('ajuan')) return;
        
        $ajuans = DB::table('ajuan')->get();
        
        $mitras = $ajuans->unique('nama_institusi')->filter(function($item) {
            return !empty(trim($item->nama_institusi ?? ''));
        });
        
        foreach ($mitras as $mitra) {
            $nama = trim($mitra->nama_institusi ?? '');
            $existing = DB::table('master_mitra')->where('nama_mitra', $nama)->first();
            if (!$existing) {
                DB::table('master_mitra')->insert([
                    'nama_mitra' => $nama,
                    'kategori_mitra' => $mitra->kategori_institusi ?? null,
                    'negara' => $mitra->negara ?? null,
                    'website' => $mitra->web_institusi ?? null,
                    'nama_kontak_utama' => $mitra->nama_pic ?? null,
                    'jabatan_kontak_utama' => $mitra->jabatan_pic ?? null,
                    'email_kontak_utama' => $mitra->email_pic ?? null,
                    'telepon_kontak_utama' => $mitra->wa_pic ?? null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
        $this->info('Migrated master_mitra.');
    }

    protected function migratePengajuanV2()
    {
        $this->info('Migrating ajuan to pengajuan_v2...');
        if (!Schema::hasTable('ajuan')) return;

        $ajuans = DB::table('ajuan')->get();
        
        // Load Maps
        $prodiMap = DB::table('master_unit_prodi')->where('jenis_node', 'prodi')->pluck('id', 'nama')->toArray();
        $unitMap = DB::table('master_unit_prodi')->where('jenis_node', 'unit')->pluck('id', 'nama')->toArray();
        $mitraMap = DB::table('master_mitra')->pluck('id', 'nama_mitra')->toArray();

        foreach ($ajuans as $ajuan) {
            $tanggal = null;
            if ($ajuan->tgl_ajuan && strtotime($ajuan->tgl_ajuan)) {
                $tanggal = date('Y-m-d', strtotime($ajuan->tgl_ajuan));
            }

            $unitName = trim($ajuan->prodi ?? '');
            if (empty($unitName)) {
                $unitName = trim($ajuan->unit ?? '');
                $unitProdiId = $unitMap[$unitName] ?? null;
            } else {
                $unitProdiId = $prodiMap[$unitName] ?? null;
            }
            
            $mitraId = $mitraMap[trim($ajuan->nama_institusi ?? '')] ?? null;
            
            $status = strtolower($ajuan->status_ajuan ?? 'menunggu');
            if ($status === 'selesai' || $status === 'disetujui' || str_contains($status, 'setuju')) {
                $status = 'disetujui';
            } elseif (str_contains($status, 'proses') || str_contains($status, 'revisi') || $status === 'diproses') {
                $status = 'diproses';
            } elseif (str_contains($status, 'tolak') || $status === 'ditolak') {
                $status = 'ditolak';
            } else {
                $status = 'menunggu';
            }

            $pengajuanId = DB::table('pengajuan_v2')->insertGetId([
                'nomor_pengajuan' => $ajuan->no_permohonan,
                'nama_pengusul' => $ajuan->nama_pemohon ?? 'Unknown',
                'jabatan_pengusul' => $ajuan->jabatan_pemohon ?? null,
                'email_pengusul' => $ajuan->email ?? null,
                'whatsapp_pengusul' => $ajuan->wa_pemohon ?? null,
                'unit_prodi_id' => $unitProdiId,
                'mitra_id' => $mitraId,
                'nama_mitra' => $ajuan->nama_institusi ?? null,
                'judul_pengajuan' => 'Pengajuan ' . $ajuan->no_permohonan,
                'deskripsi_pengajuan' => $ajuan->catatan ?? null,
                'jenis_dokumen' => $ajuan->jenis_ajuan ?? 'MOU',
                'kategori_pengajuan' => 'eksternal', // Default
                'ruang_lingkup_ids' => '[]',
                'tanggal_mulai' => $tanggal,
                'tanggal_berakhir' => null,
                'status_pengajuan' => $status,
                'catatan' => $ajuan->komentar ?? null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            if (Schema::hasTable('progres')) {
                $logs = DB::table('progres')->where('no_permohonan', $ajuan->no_permohonan)->get();
                foreach ($logs as $log) {
                    DB::table('pengajuan_log')->insert([
                        'pengajuan_id' => $pengajuanId,
                        'tipe_log' => 'status',
                        'status_baru' => 'menunggu',
                        'isi_log' => $log->catatan ?? null,
                        'dibuat_pada' => $log->created_at ?? now(),
                    ]);
                }
            }
        }
        $this->info('Migrated pengajuan_v2 and pengajuan_log.');
    }

    protected function migrateDokumenKerjasama()
    {
        $this->info('Migrating dokumen to dokumen_kerjasama...');
        if (!Schema::hasTable('dokumen')) return;

        if (!DB::table('ajuan')->where('no_permohonan', 'MIGRATED')->exists()) {
            DB::table('ajuan')->insert([
                'no_permohonan' => 'MIGRATED',
                'nama_pemohon' => 'System',
                'jabatan_pemohon' => '-',
                'unit' => '-',
                'prodi' => '-',
                'email' => '-',
                'wa_pemohon' => '-',
                'nama_institusi' => '-',
                'kategori_institusi' => '-',
                'negara' => '-',
                'web_institusi' => '-',
                'nama_pic' => '-',
                'jabatan_pic' => '-',
                'wa_pic' => '-',
                'email_pic' => '-',
                'jenis_ajuan' => '-',
                'ruang_lingkup' => '-',
                'status_ajuan' => 'selesai',
                'tgl_ajuan' => now()->toDateString(),
                'tgl_verifikasi' => now()->toDateString(),
                'tgl_disetujui' => now()->toDateString(),
                'tgl_selesai' => now()->toDateString(),
                'komentar' => 'Dummy for migration'
            ]);
        }

        $dokumens = DB::table('dokumen')->get();
        $prodiMap = DB::table('master_unit_prodi')->where('jenis_node', 'prodi')->pluck('id', 'nama')->toArray();
        $unitMap = DB::table('master_unit_prodi')->where('jenis_node', 'unit')->pluck('id', 'nama')->toArray();
        $mitraMap = DB::table('master_mitra')->pluck('id', 'nama_mitra')->toArray();

        foreach ($dokumens as $dok) {
            $unitName = trim($dok->unit ?? '');
            $unitProdiId = $prodiMap[$unitName] ?? ($unitMap[$unitName] ?? null);
            $mitraId = $mitraMap[trim($dok->mitra ?? '')] ?? null;
            
            $dokumenId = DB::table('dokumen_kerjasama')->insertGetId([
                'nomor_dokumen' => (!empty($dok->no_dokumen) ? $dok->no_dokumen . '-' . uniqid() : ('DOK-' . uniqid())),
                'no_permohonan' => 'MIGRATED',
                'no_dokumen' => (!empty($dok->no_dokumen) ? $dok->no_dokumen . '-' . uniqid() : null),
                'nama_dokumen' => $dok->nama_dokumen ?? 'Dokumen',
                'file' => $dok->file ?? 'no_file',
                'sumber_pengajuan_id' => null,
                'unit_prodi_id' => $unitProdiId,
                'mitra_id' => $mitraId,
                'jenis_dokumen' => $dok->jenis_ajuan ?? 'MOU',
                'judul_dokumen' => 'Dokumen ' . ($dok->no_dokumen ?? uniqid()),
                'ruang_lingkup_ids' => '[]',
                'tanggal_mulai' => $dok->tgl_mulai ?? now(),
                'tanggal_berakhir' => $dok->tgl_akhir ?? now()->addYear(),
                'status_siklus' => 'active',
                'keterangan' => $dok->bidang ?? null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            if (!empty($dok->file)) {
                DB::table('dokumen_file')->insert([
                    'dokumen_id' => $dokumenId,
                    'peran_berkas' => 'lampiran',
                    'nama_file' => 'File Dokumen',
                    'path_file' => $dok->file,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        if (Schema::hasTable('rekap')) {
            $rekaps = DB::table('rekap')->get();
            
            // Map PIC and Institusi to Mitra logic could be complex for Rekap, we'll keep it simple
            foreach ($rekaps as $rekap) {
                $dokumenId = DB::table('dokumen_kerjasama')->insertGetId([
                    'nomor_dokumen' => (!empty($rekap->no_dokumen) ? $rekap->no_dokumen . '-' . uniqid() : ('REKAP-' . uniqid())),
                    'no_permohonan' => 'MIGRATED',
                    'no_dokumen' => (!empty($rekap->no_dokumen) ? $rekap->no_dokumen . '-' . uniqid() : null),
                    'nama_dokumen' => 'Rekap ' . ($rekap->no_dokumen ?? uniqid()),
                    'file' => $rekap->file ?? 'no_file',
                    'judul_dokumen' => 'Rekap ' . ($rekap->no_dokumen ?? uniqid()),
                    'jenis_dokumen' => $rekap->jenis_dokumen ?? 'MOU',
                    'ruang_lingkup_ids' => '[]',
                    'tanggal_mulai' => $rekap->tgl_awal ?? now(),
                    'tanggal_berakhir' => $rekap->tgl_ahir ?? now()->addYear(),
                    'status_siklus' => 'active',
                    'created_at' => $rekap->created_at ?? now(),
                    'updated_at' => $rekap->updated_at ?? now(),
                ]);

                if (!empty($rekap->file)) {
                    DB::table('dokumen_file')->insert([
                        'dokumen_id' => $dokumenId,
                        'peran_berkas' => 'lampiran',
                        'nama_file' => 'File Rekap',
                        'path_file' => $rekap->file,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
                }
            }
        }

        if (Schema::hasTable('arsip')) {
            $arsips = DB::table('arsip')->get();
            foreach ($arsips as $arsip) {
                $dokumenId = DB::table('dokumen_kerjasama')->insertGetId([
                    'nomor_dokumen' => 'ARSIP-' . $arsip->id . '-' . uniqid(),
                    'no_permohonan' => 'MIGRATED',
                    'no_dokumen' => null,
                    'nama_dokumen' => $arsip->nama_file ?? 'Arsip ' . $arsip->id,
                    'file' => $arsip->nama_file ?? 'no_file',
                    'judul_dokumen' => 'Arsip ' . ($arsip->nama_file ?? uniqid()),
                    'jenis_dokumen' => $arsip->jenis ?? 'MOU',
                    'ruang_lingkup_ids' => '[]',
                    'tanggal_mulai' => now(),
                    'tanggal_berakhir' => now()->subDay(),
                    'status_siklus' => 'archived',
                    'alasan_arsip' => $arsip->catatan ?? null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                if (!empty($arsip->nama_file)) {
                    DB::table('dokumen_file')->insert([
                        'dokumen_id' => $dokumenId,
                        'peran_berkas' => 'lampiran',
                        'nama_file' => 'Bukti Arsip',
                        'path_file' => $arsip->nama_file,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }

        $this->info('Migrated dokumen_kerjasama and related.');
    }
}
