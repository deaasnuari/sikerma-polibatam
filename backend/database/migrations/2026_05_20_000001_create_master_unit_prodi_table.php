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
        Schema::create('master_unit_prodi', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->enum('jenis_node', ['unit', 'prodi'])->default('unit');
            $table->enum('kategori_unit', ['jurusan', 'unit_kerja'])->nullable();
            $table->string('kode', 30)->nullable();
            $table->string('nama', 150);
            $table->boolean('aktif')->default(true);
            $table->timestamps();

            // Foreign key for self-reference (parent_id)
            $table->foreign('parent_id')
                ->references('id')
                ->on('master_unit_prodi')
                ->onUpdate('cascade')
                ->onDelete('restrict');

            // Unique constraint on parent_id + nama
            $table->unique(['parent_id', 'nama']);

            // Indexes
            $table->index('parent_id');
            $table->index('jenis_node');
            $table->index('kategori_unit');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('master_unit_prodi');
    }
};
