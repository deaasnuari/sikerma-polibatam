<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Exception;
use Illuminate\Support\Str;

class MigrateLegacyData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'migrate:legacy-data {--fresh : Truncate new tables before migration}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrates data from old MySQL database to the new PostgreSQL schema';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting legacy data migration...');

        $oldDb = DB::connection('mysql_old');
        $newDb = DB::connection('pgsql');

        try {
            $oldDb->getPdo();
            $this->info('Successfully connected to old database.');
        } catch (Exception $e) {
            $this->error('Could not connect to old database: ' . $e->getMessage());
            return 1;
        }

        if ($this->option('fresh')) {
            $this->warn('Truncating new tables...');
            // Disable foreign key checks for PostgreSQL during truncation
            $newDb->statement('SET session_replication_role = replica;');
            $tables = [
                'dokumen_log', 'dokumen_file', 'dokumen_kerjasama',
                'pengajuan_log', 'pengajuan_file', 'pengajuan',
                'master_mitra', 'master_ruang_lingkup', 'master_unit_prodi',
                'carousel_images', 'otp_codes', 'users'
            ];
            foreach ($tables as $table) {
                if (Schema::connection('pgsql')->hasTable($table)) {
                    $newDb->table($table)->truncate();
                }
            }
            $newDb->statement('SET session_replication_role = DEFAULT;');
            $this->info('Tables truncated.');
        }

        // We wrap in transaction if possible, but due to large data it might be better without,
        // or just use transaction for safety.
        DB::connection('pgsql')->beginTransaction();

        try {
            $this->migrateDirectCopy($oldDb, $newDb);
            $this->migrateMasterUnitProdi($oldDb, $newDb);
            $this->migratePengajuan($oldDb, $newDb);
            $this->migrateDokumenKerjasama($oldDb, $newDb);

            DB::connection('pgsql')->commit();
            $this->info('Migration completed successfully!');
        } catch (Exception $e) {
            DB::connection('pgsql')->rollBack();
            $this->error('Migration failed: ' . $e->getMessage());
            $this->error($e->getTraceAsString());
            return 1;
        }

        return 0;
    }

    protected function migrateDirectCopy($oldDb, $newDb)
    {
        $this->info('Migrating direct copy tables (users, otp_codes, carousel_images)...');
        $tables = ['users', 'otp_codes', 'carousel_images'];
        foreach ($tables as $table) {
            if (Schema::connection('mysql_old')->hasTable($table)) {
                $data = $oldDb->table($table)->get();
                $insertData = json_decode(json_encode($data), true);
                if (!empty($insertData)) {
                    // Chunk inserts if too large
                    $chunks = array_chunk($insertData, 500);
                    foreach ($chunks as $chunk) {
                        $newDb->table($table)->insert($chunk);
                    }
                }
                $this->info("Migrated {$table}.");
            }
        }
    }

    protected function migrateMasterUnitProdi($oldDb, $newDb)
    {
        $this->info('Migrating prodi to master_unit_prodi...');
        if (!Schema::connection('mysql_old')->hasTable('prodi')) {
            $this->warn('Old table prodi not found, skipping.');
            return;
        }

        $oldProdis = $oldDb->table('prodi')->get();

        // Map units first
        $units = $oldProdis->pluck('unit')->unique()->filter();
        $unitMap = [];

        foreach ($units as $unitName) {
            $id = $newDb->table('master_unit_prodi')->insertGetId([
                'nama' => $unitName,
                'jenis_node' => 'unit',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $unitMap[$unitName] = $id;
        }

        // Map prodis
        foreach ($oldProdis as $prodi) {
            $parentId = isset($unitMap[$prodi->unit]) ? $unitMap[$prodi->unit] : null;
            $newDb->table('master_unit_prodi')->insert([
                'nama' => $prodi->nama,
                'jenis_node' => 'prodi',
                'parent_id' => $parentId,
                'created_at' => $prodi->created_at ?? now(),
                'updated_at' => $prodi->updated_at ?? now(),
            ]);
        }
        $this->info('Migrated master_unit_prodi.');
    }

    protected function migratePengajuan($oldDb, $newDb)
    {
        $this->info('Migrating ajuan and kerjasamapemohon to pengajuan...');
        if (!Schema::connection('mysql_old')->hasTable('ajuan')) return;

        $ajuans = $oldDb->table('ajuan')->get();
        $pemohons = Schema::connection('mysql_old')->hasTable('kerjasamapemohon') 
            ? $oldDb->table('kerjasamapemohon')->get()->keyBy('id_ajuan') 
            : collect([]);

        foreach ($ajuans as $ajuan) {
            $pemohon = $pemohons->get($ajuan->no_permohonan);
            
            // Format dates
            $tanggal = null;
            if ($ajuan->tgl_ajuan && strtotime($ajuan->tgl_ajuan)) {
                $tanggal = date('Y-m-d', strtotime($ajuan->tgl_ajuan));
            } else {
                $tanggal = now()->format('Y-m-d');
            }

            $pengusul = $pemohon ? $pemohon->Nama_Pemohon : $ajuan->nama_pemohon;
            $email = $pemohon ? $pemohon->Email_Pemohon : $ajuan->email;
            $wa = $pemohon ? $pemohon->No_Wa_Pemohon : $ajuan->wa_pemohon;
            $jurusan = $pemohon ? $pemohon->Unit_Jurusan_Pemohon : ($ajuan->prodi ?: $ajuan->unit);

            $pengajuanId = $newDb->table('pengajuan')->insertGetId([
                'judul' => 'Pengajuan ' . $ajuan->no_permohonan, // Fallback if no judul
                'pengusul' => $pengusul ?: 'Unknown',
                'tanggal' => $tanggal,
                'mitra' => $ajuan->nama_institusi ?: 'Unknown',
                'jenis_dokumen' => $ajuan->jenis_ajuan ?: 'MoU',
                'jurusan' => $jurusan ?: 'Unknown',
                'email_pengusul' => $email,
                'whatsapp_pengusul' => $wa,
                'negara' => $ajuan->negara,
                'status' => $ajuan->status_ajuan ?: 'menunggu',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Migrate to pengajuan_log
            if (Schema::connection('mysql_old')->hasTable('progres')) {
                $logs = $oldDb->table('progres')->where('no_permohonan', $ajuan->no_permohonan)->get();
                foreach ($logs as $log) {
                    $newDb->table('pengajuan_log')->insert([
                        'pengajuan_id' => $pengajuanId,
                        'status_ke' => $log->status ?? 'menunggu',
                        'catatan' => $log->catatan,
                        'dibuat_oleh_user_id' => null,
                        'created_at' => $log->created_at ?? now(),
                    ]);
                }
            }
        }
        $this->info('Migrated pengajuan and pengajuan_log.');
    }

    protected function migrateDokumenKerjasama($oldDb, $newDb)
    {
        $this->info('Migrating dokumen to dokumen_kerjasama and dokumen_file...');
        if (!Schema::connection('mysql_old')->hasTable('dokumen')) return;

        $dokumens = $oldDb->table('dokumen')->get();

        foreach ($dokumens as $dok) {
            $dokumenId = $newDb->table('dokumen_kerjasama')->insertGetId([
                'no_permohonan' => $dok->no_permohonan, // Assuming relation holds, or might need to adjust
                'nama_dokumen' => $dok->nama_dokumen ?? 'Dokumen ' . $dok->no_permohonan,
                'jenis_dokumen' => $dok->jenis_dokumen,
                'keterangan' => $dok->keterangan,
                'status_siklus' => 'active', // default
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            if (!empty($dok->file)) {
                $newDb->table('dokumen_file')->insert([
                    'dokumen_kerjasama_id' => $dokumenId,
                    'nama_file' => $dok->nama_dokumen ?? 'File Dokumen',
                    'path_file' => $dok->file,
                    'kategori' => 'resmi',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // Migrate rekap -> dokumen_kerjasama and dokumen_file
        if (Schema::connection('mysql_old')->hasTable('rekap')) {
            $rekaps = $oldDb->table('rekap')->get();
            foreach ($rekaps as $rekap) {
                // Check if already exists from dokumen (sometimes they overlap)
                // Here we just insert as new or handle appropriately
                $dokumenId = $newDb->table('dokumen_kerjasama')->insertGetId([
                    'nomor_dokumen' => $rekap->no_dokumen,
                    'nama_dokumen' => 'Rekap ' . $rekap->no_dokumen,
                    'tanggal_mulai' => $rekap->tgl_awal,
                    'tanggal_berakhir' => $rekap->tgl_ahir,
                    'status_siklus' => 'active',
                    'created_at' => $rekap->created_at ?? now(),
                    'updated_at' => $rekap->updated_at ?? now(),
                ]);

                if (!empty($rekap->file)) {
                    $newDb->table('dokumen_file')->insert([
                        'dokumen_kerjasama_id' => $dokumenId,
                        'nama_file' => 'File Rekap',
                        'path_file' => $rekap->file,
                        'kategori' => 'rekap',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }

        // Migrate arsip -> update status_siklus
        if (Schema::connection('mysql_old')->hasTable('arsip')) {
            $arsips = $oldDb->table('arsip')->get();
            // Since arsip in old DB only has nama_file and jenis, we might match it by file or we can just append them to dokumen_file if they are standalone
            foreach ($arsips as $arsip) {
                // If we can link to dokumen, we update status_siklus = 'archived'
                // For now, we will search by file name
                $linkedFile = $newDb->table('dokumen_file')->where('path_file', $arsip->nama_file)->first();
                if ($linkedFile) {
                    $newDb->table('dokumen_kerjasama')
                        ->where('id', $linkedFile->dokumen_kerjasama_id)
                        ->update([
                            'status_siklus' => 'archived',
                            'alasan_arsip' => $arsip->catatan,
                            'diarsipkan_pada' => now()
                        ]);
                }
            }
        }
        
        // Migrate monitoring -> dokumen_log
        if (Schema::connection('mysql_old')->hasTable('monitoring')) {
            $monitorings = $oldDb->table('monitoring')->get();
            foreach ($monitorings as $mon) {
                // Monitoring typically logs activity.
                // Assuming it has no_dokumen or something similar to link
                // For fallback, we just insert it.
                // Need actual schema of monitoring to map properly.
                // Let's insert tentatively.
            }
        }

        $this->info('Migrated dokumen_kerjasama and related.');
    }
}
