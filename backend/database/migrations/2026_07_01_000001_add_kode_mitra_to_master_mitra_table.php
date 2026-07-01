<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('master_mitra', function (Blueprint $table) {
            $table->string('kode_mitra', 20)->nullable()->unique()->after('id');
            $table->index('kode_mitra');
        });
    }

    public function down(): void
    {
        Schema::table('master_mitra', function (Blueprint $table) {
            $table->dropIndex(['kode_mitra']);
            $table->dropUnique(['kode_mitra']);
            $table->dropColumn('kode_mitra');
        });
    }
};
