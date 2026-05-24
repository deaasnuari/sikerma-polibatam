<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pengajuan_file', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pengajuan_id')->constrained('pengajuan')->cascadeOnDelete();
            $table->string('nama_file', 255);
            $table->string('path_file', 500);
            $table->string('mime_type', 120)->nullable();
            $table->unsignedBigInteger('ukuran_file_bytes')->nullable();
            $table->foreignId('diunggah_oleh_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('diunggah_pada')->useCurrent();
            $table->timestamps();

            $table->index('pengajuan_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pengajuan_file');
    }
};
