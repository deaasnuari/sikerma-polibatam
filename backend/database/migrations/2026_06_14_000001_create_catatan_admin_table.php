<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('catatan_admin', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('pengajuan_id');
            $table->text('teks');
            $table->unsignedBigInteger('dibuat_oleh_user_id')->nullable();
            $table->timestamps();

            $table->foreign('pengajuan_id')
                ->references('id')
                ->on('pengajuan_v2')
                ->onDelete('cascade');

            $table->foreign('dibuat_oleh_user_id')
                ->references('id')
                ->on('users')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('catatan_admin');
    }
};
