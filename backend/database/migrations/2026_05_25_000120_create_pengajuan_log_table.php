<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pengajuan_log', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pengajuan_id')->constrained('pengajuan')->cascadeOnDelete();
            $table->string('tipe_log', 20);
            $table->string('status_lama', 20)->nullable();
            $table->string('status_baru', 20)->nullable();
            $table->string('judul_log', 255)->nullable();
            $table->text('isi_log')->nullable();
            $table->json('payload_json')->nullable();
            $table->foreignId('dibuat_oleh_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('dibuat_pada')->useCurrent();

            $table->index(['pengajuan_id', 'dibuat_pada']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pengajuan_log');
    }
};
