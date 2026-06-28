<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        if (! Schema::hasTable('dokumen_kerjasama')) {
            return;
        }

        DB::statement('ALTER TABLE dokumen_kerjasama DROP CONSTRAINT IF EXISTS dokumen_kerjasama_no_permohonan_foreign');
    }

    public function down(): void
    {
        if (! Schema::hasTable('dokumen_kerjasama') || ! Schema::hasTable('ajuan')) {
            return;
        }

        DB::statement(<<<'SQL'
            ALTER TABLE dokumen_kerjasama
            ADD CONSTRAINT dokumen_kerjasama_no_permohonan_foreign
            FOREIGN KEY (no_permohonan)
            REFERENCES ajuan (no_permohonan)
            ON DELETE CASCADE
        SQL);
    }
};
