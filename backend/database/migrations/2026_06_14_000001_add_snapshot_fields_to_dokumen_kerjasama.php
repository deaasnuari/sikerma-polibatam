<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('dokumen_kerjasama', function (Blueprint $table) {
            // Snapshot data dari pengajuan saat disetujui.
            // Kolom ini memastikan Rekap Data tetap lengkap meskipun record Pengajuan dihapus.
            if (!Schema::hasColumn('dokumen_kerjasama', 'snap_nama_mitra')) {
                $table->string('snap_nama_mitra', 255)->nullable()->after('mitra_id');
            }

            if (!Schema::hasColumn('dokumen_kerjasama', 'snap_whatsapp_pengusul')) {
                $table->string('snap_whatsapp_pengusul', 50)->nullable()->after('snap_nama_mitra');
            }

            if (!Schema::hasColumn('dokumen_kerjasama', 'snap_nama_pengusul')) {
                $table->string('snap_nama_pengusul', 255)->nullable()->after('snap_whatsapp_pengusul');
            }

            if (!Schema::hasColumn('dokumen_kerjasama', 'snap_email_pengusul')) {
                $table->string('snap_email_pengusul', 255)->nullable()->after('snap_nama_pengusul');
            }
        });
    }

    public function down(): void
    {
        Schema::table('dokumen_kerjasama', function (Blueprint $table) {
            $columns = ['snap_nama_mitra', 'snap_whatsapp_pengusul', 'snap_nama_pengusul', 'snap_email_pengusul'];

            foreach ($columns as $column) {
                if (Schema::hasColumn('dokumen_kerjasama', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
