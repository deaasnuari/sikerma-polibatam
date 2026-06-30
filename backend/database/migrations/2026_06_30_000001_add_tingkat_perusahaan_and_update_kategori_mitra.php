<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('master_mitra', function (Blueprint $table) {
            $table->string('tingkat_perusahaan', 50)->nullable()->after('kategori_mitra');
            $table->index('tingkat_perusahaan');
        });

        // Mapping nilai kategori_mitra lama ke nilai baru
        DB::table('master_mitra')
            ->where('kategori_mitra', 'Instansi Pemerintah')
            ->update(['kategori_mitra' => 'Pemerintahan']);

        DB::table('master_mitra')
            ->where('kategori_mitra', 'Industri')
            ->update(['kategori_mitra' => 'Swasta/Dunia Usaha dan Dunia Industri (DUDI)']);

        DB::table('master_mitra')
            ->where('kategori_mitra', 'Komunitas')
            ->update(['kategori_mitra' => 'Organisasi Non-Profit / LSM']);
    }

    public function down(): void
    {
        // Kembalikan nilai lama
        DB::table('master_mitra')
            ->where('kategori_mitra', 'Pemerintahan')
            ->update(['kategori_mitra' => 'Instansi Pemerintah']);

        DB::table('master_mitra')
            ->where('kategori_mitra', 'Swasta/Dunia Usaha dan Dunia Industri (DUDI)')
            ->update(['kategori_mitra' => 'Industri']);

        DB::table('master_mitra')
            ->where('kategori_mitra', 'Organisasi Non-Profit / LSM')
            ->update(['kategori_mitra' => 'Komunitas']);

        Schema::table('master_mitra', function (Blueprint $table) {
            $table->dropIndex(['tingkat_perusahaan']);
            $table->dropColumn('tingkat_perusahaan');
        });
    }
};
