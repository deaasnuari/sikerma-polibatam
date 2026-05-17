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
    Schema::create('ajuan', function (Blueprint $table) {

        $table->string('no_permohonan')->primary();
        $table->string('nama_pemohon');
        $table->string('jabatan_pemohon');
        $table->string('unit');
        $table->string('prodi');
        $table->string('email');
        $table->string('wa_pemohon');

        $table->string('nama_institusi');
        $table->string('kategori_institusi');
        $table->string('negara');

        $table->string('web_institusi');

        $table->string('nama_pic');
        $table->string('jabatan_pic');
        $table->string('wa_pic');
        $table->string('email_pic');

        $table->string('jenis_ajuan');
        $table->string('ruang_lingkup');

        $table->text('catatan')->nullable();

        $table->string('status_ajuan');

        $table->string('tgl_ajuan');
        $table->string('tgl_verifikasi');
        $table->string('tgl_disetujui');
        $table->string('tgl_selesai');

        $table->text('komentar');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ajuan');
    }
};
