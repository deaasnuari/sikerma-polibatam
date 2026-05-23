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
        Schema::create('master_mitra', function (Blueprint $table) {
            $table->id();
            $table->string('nama_mitra', 255);
            $table->string('kategori_mitra', 80)->nullable();
            $table->string('negara', 100)->nullable();
            $table->string('website', 255)->nullable();
            $table->text('alamat')->nullable();
            $table->string('email_mitra', 255)->nullable();
            $table->string('telepon_mitra', 50)->nullable();
            $table->string('nama_kontak_utama', 200)->nullable();
            $table->string('jabatan_kontak_utama', 120)->nullable();
            $table->string('email_kontak_utama', 255)->nullable();
            $table->string('telepon_kontak_utama', 50)->nullable();
            $table->boolean('aktif')->default(true);
            $table->timestamps();

            $table->index('nama_mitra');
            $table->index('kategori_mitra');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('master_mitra');
    }
};