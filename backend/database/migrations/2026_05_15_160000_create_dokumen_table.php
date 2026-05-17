<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dokumen', function (Blueprint $table) {
            $table->id();
            $table->string('no_dokumen', 30)->nullable();
            $table->string('mitra', 100)->nullable();
            $table->string('telepon', 30)->nullable();
            $table->string('negara', 50)->nullable();
            $table->string('kategori_institusi')->nullable();
            $table->string('jenis_ajuan')->nullable();
            $table->text('bidang')->nullable();
            $table->string('unit', 100)->nullable();
            $table->integer('tahun')->nullable();
            $table->date('tgl_mulai')->nullable();
            $table->date('tgl_akhir')->nullable();
            $table->string('file')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dokumen');
    }
};
