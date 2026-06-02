<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('pengajuan_aktivitas')) {
            return;
        }

        Schema::create('pengajuan_aktivitas', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('pengajuan_id');
            $table->string('judul', 255);
            $table->string('jenis_aktivitas', 120);
            $table->date('tanggal');
            $table->unsignedInteger('jumlah_peserta')->default(0);
            $table->text('deskripsi')->nullable();
            $table->string('pic_polibatam', 200)->nullable();
            $table->string('pic_mitra', 200)->nullable();
            $table->string('status', 20)->default('direncanakan');
            $table->foreignId('dibuat_oleh_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['pengajuan_id', 'tanggal']);
            $table->index('status');
        });

        $targetPengajuanTable = Schema::hasTable('pengajuan_v2') ? 'pengajuan_v2' : 'pengajuan';

        if (Schema::hasTable($targetPengajuanTable)) {
            Schema::table('pengajuan_aktivitas', function (Blueprint $table) use ($targetPengajuanTable) {
                $table
                    ->foreign('pengajuan_id', 'pengajuan_aktivitas_pengajuan_id_foreign')
                    ->references('id')
                    ->on($targetPengajuanTable)
                    ->cascadeOnDelete();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('pengajuan_aktivitas');
    }
};
