<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kerjasamapemohon', function (Blueprint $table) {
            $table->id();
            $table->string('Id_Pemohon', 64)->nullable();
            $table->string('Nama_Pemohon', 32)->nullable();
            $table->string('Jabatan_Pemohon', 32)->nullable();
            $table->string('Email_Pemohon', 24)->nullable();
            $table->string('Unit_Jurusan_Pemohon', 32)->nullable();
            $table->string('No_Wa_Pemohon', 16)->nullable();
            $table->string('id_ajuan', 64)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kerjasamapemohon');
    }
};
