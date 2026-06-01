<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $tables = [
            'ajuan',
            'arsip',
            'dokumen',
            'kerjasamapemohon',
            'monitoring',
            'monitoring_unit',
            'm_moa',
            'prodi',
            'progres',
            'rekap',
            'pengajuan',
        ];

        foreach ($tables as $table) {
            Schema::dropIfExists($table);
        }
    }

    public function down(): void
    {
        // Legacy tables are intentionally not recreated here.
    }
};
