<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('monitoring_unit', function (Blueprint $table) {
            $table->id();
            $table->string('no_dokumen', 30)->nullable();
            $table->string('mitra', 100)->nullable();
            $table->string('telepon', 30)->nullable();
            $table->string('unit', 100)->nullable();
            $table->string('judul')->nullable();
            $table->text('manfaat')->nullable();
            $table->string('bukti')->nullable();
            $table->date('tanggal')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('monitoring_unit');
    }
};
