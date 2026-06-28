<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('pengajuan_v2')) {
            return;
        }

        Schema::create('pengajuan_v2', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_pengajuan', 50)->nullable();
            $table->foreignId('user_pengusul_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('nama_pengusul', 200)->nullable();
            $table->string('jabatan_pengusul', 150)->nullable();
            $table->string('email_pengusul', 255)->nullable();
            $table->string('whatsapp_pengusul', 50)->nullable();
            $table->foreignId('unit_prodi_id')->nullable()->constrained('master_unit_prodi')->nullOnDelete();
            $table->foreignId('mitra_id')->nullable()->constrained('master_mitra')->nullOnDelete();
            $table->string('judul_pengajuan', 255)->nullable();
            $table->text('deskripsi_pengajuan')->nullable();
            $table->string('jenis_dokumen', 20)->nullable();
            $table->string('kategori_pengajuan', 20)->nullable();
            $table->json('ruang_lingkup_ids')->default('[]');
            $table->date('tanggal_mulai')->nullable();
            $table->date('tanggal_berakhir')->nullable();
            $table->string('status_pengajuan', 20)->default('menunggu');
            $table->timestamp('diajukan_pada')->useCurrent();
            $table->timestamp('email_terverifikasi_pada')->nullable();
            $table->string('nama_mitra', 255)->nullable();
            $table->string('telepon_mitra', 50)->nullable();
            $table->text('catatan')->nullable();
            $table->string('keputusan', 20)->nullable();
            $table->text('catatan_revisi')->nullable();
            $table->timestamp('acc_internal_at')->nullable();
            $table->timestamp('acc_mitra_at')->nullable();
            $table->timestamp('final_approved_at')->nullable();
            $table->string('final_file_name', 500)->nullable();
            $table->string('final_file_path', 1000)->nullable();
            $table->string('tahapan_stage', 50)->nullable();
            $table->string('tahapan_group', 50)->nullable();
            $table->json('tahapan_riwayat')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pengajuan_v2');
    }
};
