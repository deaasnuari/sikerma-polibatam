<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pengajuan', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_pengajuan', 50);
            $table->foreignId('user_pengusul_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('nama_pengusul', 200);
            $table->string('jabatan_pengusul', 150)->nullable();
            $table->string('email_pengusul', 255)->nullable();
            $table->string('whatsapp_pengusul', 50)->nullable();
            $table->foreignId('unit_prodi_id')->nullable()->constrained('master_unit_prodi')->nullOnDelete();
            $table->foreignId('mitra_id')->nullable()->constrained('master_mitra')->nullOnDelete();
            $table->string('judul_pengajuan', 255);
            $table->text('deskripsi_pengajuan')->nullable();
            $table->string('jenis_dokumen', 20);
            $table->string('kategori_pengajuan', 20)->nullable();
            $table->json('ruang_lingkup_ids')->default('[]'); // Menggunakan JSON sebagai standar Laravel untuk array
            $table->date('tanggal_mulai')->nullable();
            $table->date('tanggal_berakhir')->nullable();
            $table->string('status_pengajuan', 20)->default('menunggu');
            $table->timestamp('diajukan_pada')->useCurrent();
            $table->timestamp('email_terverifikasi_pada')->nullable();
            $table->timestamps();
            $table->string('nama_mitra', 255)->nullable();

            $table->index(['status_pengajuan', 'diajukan_pada']);
            $table->index('user_pengusul_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengajuan');
    }
};
