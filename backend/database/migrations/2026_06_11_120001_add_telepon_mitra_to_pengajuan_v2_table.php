<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('pengajuan_v2') || Schema::hasColumn('pengajuan_v2', 'telepon_mitra')) {
            return;
        }

        Schema::table('pengajuan_v2', function (Blueprint $table) {
            $table->string('telepon_mitra', 50)->nullable()->after('nama_mitra');
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('pengajuan_v2') || ! Schema::hasColumn('pengajuan_v2', 'telepon_mitra')) {
            return;
        }

        Schema::table('pengajuan_v2', function (Blueprint $table) {
            $table->dropColumn('telepon_mitra');
        });
    }
};