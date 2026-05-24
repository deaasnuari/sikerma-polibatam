<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::dropIfExists('prodi');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('prodi', function ($table) {
            $table->id();
            $table->string('kode', 20);
            $table->string('nama', 100);
            $table->string('unit', 50);
            $table->timestamps();
        });
    }
};
