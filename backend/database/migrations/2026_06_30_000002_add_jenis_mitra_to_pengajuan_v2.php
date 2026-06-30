<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pengajuan_v2', function (Blueprint $table) {
            $table->string('jenis_mitra', 150)->nullable()->after('nama_mitra');
            $table->string('tingkat_perusahaan', 50)->nullable()->after('jenis_mitra');
        });
    }

    public function down(): void
    {
        Schema::table('pengajuan_v2', function (Blueprint $table) {
            $table->dropColumn(['jenis_mitra', 'tingkat_perusahaan']);
        });
    }
};
