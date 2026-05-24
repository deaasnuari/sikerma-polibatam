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
        Schema::create('pengajuan', function (Blueprint $table) {
            $table->id();
            $table->string('judul', 255);
            $table->text('deskripsi')->nullable();
            $table->string('pengusul', 200);
            $table->date('tanggal');
            $table->string('mitra', 255);
            $table->string('jenis_dokumen', 20);
            $table->string('jurusan', 150);
            $table->string('kategori', 20)->nullable();
            $table->date('tanggal_mulai')->nullable();
            $table->date('tanggal_berakhir')->nullable();
            $table->string('email_pengusul', 255)->nullable();
            $table->string('whatsapp_pengusul', 50)->nullable();
            $table->text('alamat_mitra')->nullable();
            $table->string('negara', 100)->nullable();
            $table->boolean('email_terverifikasi')->default(false);
            $table->json('ruang_lingkup')->nullable();
            $table->string('status', 20)->default('menunggu');
            $table->string('file_name', 500)->nullable();
            $table->json('file_attachments')->nullable();
            $table->text('review_comment')->nullable();
            $table->date('reviewed_at')->nullable();
            $table->string('reviewed_by', 200)->nullable();
            $table->boolean('is_from_admin')->default(false);
            $table->string('source_role', 50)->nullable();
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['status', 'tanggal']);
            $table->index(['kategori', 'is_from_admin']);
            $table->index('created_by_user_id');
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
