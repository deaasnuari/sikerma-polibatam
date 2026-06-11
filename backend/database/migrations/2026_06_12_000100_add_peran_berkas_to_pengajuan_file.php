<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pengajuan_file', function (Blueprint $table) {
            if (! Schema::hasColumn('pengajuan_file', 'peran_berkas')) {
                $table->string('peran_berkas', 30)->default('pengajuan_awal')->after('pengajuan_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('pengajuan_file', function (Blueprint $table) {
            if (Schema::hasColumn('pengajuan_file', 'peran_berkas')) {
                $table->dropColumn('peran_berkas');
            }
        });
    }
};
