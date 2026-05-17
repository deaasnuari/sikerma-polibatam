<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('monitoring', function (Blueprint $table) {
            $table->id();
            $table->string('nomor', 50);
            $table->string('mitra')->nullable();
            $table->string('telepon', 30)->nullable();
            $table->string('tgl_mulai', 20)->nullable();
            $table->string('tgl_berakhir', 20)->nullable();
            $table->string('unit', 50)->nullable();
            $table->text('lingkup')->nullable();
            $table->string('tingkat', 100)->nullable();
            $table->string('periode', 100)->nullable();
            $table->text('judul')->nullable();
            $table->text('manfaat')->nullable();
            $table->string('bukti', 50)->nullable();
            $table->string('status', 50)->nullable();
            $table->string('pic', 100)->nullable();
            $table->string('tgl_monitoring', 20)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('monitoring');
    }
};
