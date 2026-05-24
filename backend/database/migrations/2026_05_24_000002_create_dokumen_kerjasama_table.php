<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dokumen_kerjasama', function (Blueprint $table) {
            $table->id();
            $table->string('no_permohonan');
            $table->string('no_dokumen', 100)->nullable()->unique();
            $table->string('nama_dokumen', 255);
            $table->string('jenis_dokumen', 100)->nullable();
            $table->string('file', 255);
            $table->text('keterangan')->nullable();
            $table->timestamps();

            $table->foreign('no_permohonan')
                ->references('no_permohonan')
                ->on('ajuan')
                ->cascadeOnDelete();

            $table->index('no_permohonan');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dokumen_kerjasama');
    }
};