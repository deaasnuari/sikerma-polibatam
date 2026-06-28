<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        if (! Schema::hasTable('dokumen_kerjasama') || ! Schema::hasTable('pengajuan_v2')) {
            return;
        }

        DB::statement(<<<'SQL'
            UPDATE dokumen_kerjasama d
            SET sumber_pengajuan_id = NULL
            WHERE sumber_pengajuan_id IS NOT NULL
              AND NOT EXISTS (
                  SELECT 1
                  FROM pengajuan_v2 p
                  WHERE p.id = d.sumber_pengajuan_id
              )
        SQL);

        DB::statement('ALTER TABLE dokumen_kerjasama DROP CONSTRAINT IF EXISTS dokumen_kerjasama_sumber_pengajuan_id_foreign');

        Schema::table('dokumen_kerjasama', function (Blueprint $table) {
            $table->foreign('sumber_pengajuan_id')
                ->references('id')
                ->on('pengajuan_v2')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('dokumen_kerjasama')) {
            return;
        }

        DB::statement('ALTER TABLE dokumen_kerjasama DROP CONSTRAINT IF EXISTS dokumen_kerjasama_sumber_pengajuan_id_foreign');

        if (Schema::hasTable('pengajuan')) {
            Schema::table('dokumen_kerjasama', function (Blueprint $table) {
                $table->foreign('sumber_pengajuan_id')
                    ->references('id')
                    ->on('pengajuan')
                    ->nullOnDelete();
            });
        }
    }
};
