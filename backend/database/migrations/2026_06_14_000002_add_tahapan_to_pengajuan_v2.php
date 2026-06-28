<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pengajuan_v2', function (Blueprint $table) {
            if (! Schema::hasColumn('pengajuan_v2', 'tahapan_stage')) {
                $table->string('tahapan_stage', 100)->nullable()->after('catatan_revisi');
            }
            if (! Schema::hasColumn('pengajuan_v2', 'tahapan_group')) {
                $table->string('tahapan_group', 30)->nullable()->after('tahapan_stage');
            }
            if (! Schema::hasColumn('pengajuan_v2', 'tahapan_riwayat')) {
                $table->json('tahapan_riwayat')->nullable()->after('tahapan_group');
            }
        });

        // Set semua pengajuan yang belum punya tahapan ke "Pengajuan Awal"
        \DB::table('pengajuan_v2')
            ->whereNull('tahapan_stage')
            ->update([
                'tahapan_stage' => 'Pengajuan Awal',
                'tahapan_group' => 'todo',
                'tahapan_riwayat' => json_encode([[
                    'stage'      => 'Pengajuan Awal',
                    'group'      => 'todo',
                    'changed_at' => now()->toISOString(),
                    'changed_by' => 'Sistem (migrasi awal)',
                ]]),
            ]);
    }

    public function down(): void
    {
        Schema::table('pengajuan_v2', function (Blueprint $table) {
            $table->dropColumn(['tahapan_stage', 'tahapan_group', 'tahapan_riwayat']);
        });
    }
};
