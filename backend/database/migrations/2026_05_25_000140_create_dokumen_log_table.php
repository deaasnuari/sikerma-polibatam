<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dokumen_log', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dokumen_id')->constrained('dokumen_kerjasama')->cascadeOnDelete();
            $table->string('tipe_log', 30);
            $table->string('judul_log', 255)->nullable();
            $table->text('isi_log')->nullable();
            $table->json('payload_json')->nullable();
            $table->foreignId('dibuat_oleh_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('dibuat_pada')->useCurrent();

            $table->index(['dokumen_id', 'dibuat_pada']);
            $table->index('tipe_log');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dokumen_log');
    }
};
