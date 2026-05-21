<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('master_unit_prodi', function (Blueprint $table) {
            if (!Schema::hasColumn('master_unit_prodi', 'kategori_unit')) {
                $table->enum('kategori_unit', ['jurusan', 'unit_kerja'])->nullable()->after('jenis_node');
                $table->index('kategori_unit');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('master_unit_prodi', function (Blueprint $table) {
            if (Schema::hasColumn('master_unit_prodi', 'kategori_unit')) {
                $table->dropIndex(['kategori_unit']);
                $table->dropColumn('kategori_unit');
            }
        });
    }
};
