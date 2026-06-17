<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('dokumen_kerjasama', function (Blueprint $table) {
            if (Schema::hasColumn('dokumen_kerjasama', 'no_dokumen')) {
                $table->dropUnique(['no_dokumen']);
                $table->dropColumn('no_dokumen');
            }
        });
    }

    public function down(): void
    {
        Schema::table('dokumen_kerjasama', function (Blueprint $table) {
            $table->string('no_dokumen', 100)->nullable()->unique()->after('nomor_dokumen');
        });
    }
};
