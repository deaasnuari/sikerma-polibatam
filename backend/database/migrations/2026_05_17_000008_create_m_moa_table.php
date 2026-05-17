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
        Schema::create('m_moa', function (Blueprint $table) {
            $table->id();
            $table->string('nomor', 100);
            $table->string('mitra', 200);
            $table->string('telepon', 20);
            $table->string('lingkup', 255);
            $table->string('tingkat', 100);
            $table->text('judul_kegiatan');
            $table->text('manfaat');
            $table->string('tgl_mulai', 50)->nullable();
            $table->string('tgl_berakhir', 50)->nullable();
            $table->string('unit', 50);
            $table->string('pic', 100);
            $table->string('periode', 100);
            $table->string('status', 50);
            $table->string('tgl_monitoring', 20)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('m_moa');
    }
};
