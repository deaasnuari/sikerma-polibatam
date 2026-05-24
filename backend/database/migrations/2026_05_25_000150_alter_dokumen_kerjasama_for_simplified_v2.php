<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('dokumen_kerjasama', function (Blueprint $table) {
            if (!Schema::hasColumn('dokumen_kerjasama', 'nomor_dokumen')) {
                $table->string('nomor_dokumen', 100)->nullable()->after('id');
                $table->unique('nomor_dokumen');
            }

            if (!Schema::hasColumn('dokumen_kerjasama', 'sumber_pengajuan_id')) {
                $table->foreignId('sumber_pengajuan_id')->nullable()->after('no_permohonan')->constrained('pengajuan')->nullOnDelete();
            }

            if (!Schema::hasColumn('dokumen_kerjasama', 'unit_prodi_id')) {
                $table->foreignId('unit_prodi_id')->nullable()->after('sumber_pengajuan_id')->constrained('master_unit_prodi')->nullOnDelete();
            }

            if (!Schema::hasColumn('dokumen_kerjasama', 'mitra_id')) {
                $table->foreignId('mitra_id')->nullable()->after('unit_prodi_id')->constrained('master_mitra')->nullOnDelete();
            }

            if (!Schema::hasColumn('dokumen_kerjasama', 'judul_dokumen')) {
                $table->string('judul_dokumen', 255)->nullable()->after('jenis_dokumen');
            }

            if (!Schema::hasColumn('dokumen_kerjasama', 'ruang_lingkup_ids')) {
                $table->json('ruang_lingkup_ids')->nullable()->after('judul_dokumen');
            }

            if (!Schema::hasColumn('dokumen_kerjasama', 'tanggal_mulai')) {
                $table->date('tanggal_mulai')->nullable()->after('ruang_lingkup_ids');
            }

            if (!Schema::hasColumn('dokumen_kerjasama', 'tanggal_berakhir')) {
                $table->date('tanggal_berakhir')->nullable()->after('tanggal_mulai');
            }

            if (!Schema::hasColumn('dokumen_kerjasama', 'tanggal_ttd')) {
                $table->date('tanggal_ttd')->nullable()->after('tanggal_berakhir');
            }

            if (!Schema::hasColumn('dokumen_kerjasama', 'status_siklus')) {
                $table->string('status_siklus', 20)->default('active')->after('tanggal_ttd');
            }

            if (!Schema::hasColumn('dokumen_kerjasama', 'diarsipkan_pada')) {
                $table->timestamp('diarsipkan_pada')->nullable()->after('status_siklus');
            }

            if (!Schema::hasColumn('dokumen_kerjasama', 'alasan_arsip')) {
                $table->text('alasan_arsip')->nullable()->after('diarsipkan_pada');
            }

            if (!Schema::hasColumn('dokumen_kerjasama', 'dibuat_oleh_user_id')) {
                $table->foreignId('dibuat_oleh_user_id')->nullable()->after('alasan_arsip')->constrained('users')->nullOnDelete();
            }
        });

        Schema::table('dokumen_kerjasama', function (Blueprint $table) {
            $table->index(['status_siklus', 'tanggal_berakhir'], 'idx_dokumen_status_tanggal');
            $table->index(['unit_prodi_id', 'mitra_id'], 'idx_dokumen_unit_mitra');
        });
    }

    public function down(): void
    {
        Schema::table('dokumen_kerjasama', function (Blueprint $table) {
            $table->dropIndex('idx_dokumen_status_tanggal');
            $table->dropIndex('idx_dokumen_unit_mitra');
        });

        Schema::table('dokumen_kerjasama', function (Blueprint $table) {
            if (Schema::hasColumn('dokumen_kerjasama', 'dibuat_oleh_user_id')) {
                $table->dropConstrainedForeignId('dibuat_oleh_user_id');
            }
            if (Schema::hasColumn('dokumen_kerjasama', 'alasan_arsip')) {
                $table->dropColumn('alasan_arsip');
            }
            if (Schema::hasColumn('dokumen_kerjasama', 'diarsipkan_pada')) {
                $table->dropColumn('diarsipkan_pada');
            }
            if (Schema::hasColumn('dokumen_kerjasama', 'status_siklus')) {
                $table->dropColumn('status_siklus');
            }
            if (Schema::hasColumn('dokumen_kerjasama', 'tanggal_ttd')) {
                $table->dropColumn('tanggal_ttd');
            }
            if (Schema::hasColumn('dokumen_kerjasama', 'tanggal_berakhir')) {
                $table->dropColumn('tanggal_berakhir');
            }
            if (Schema::hasColumn('dokumen_kerjasama', 'tanggal_mulai')) {
                $table->dropColumn('tanggal_mulai');
            }
            if (Schema::hasColumn('dokumen_kerjasama', 'ruang_lingkup_ids')) {
                $table->dropColumn('ruang_lingkup_ids');
            }
            if (Schema::hasColumn('dokumen_kerjasama', 'judul_dokumen')) {
                $table->dropColumn('judul_dokumen');
            }
            if (Schema::hasColumn('dokumen_kerjasama', 'mitra_id')) {
                $table->dropConstrainedForeignId('mitra_id');
            }
            if (Schema::hasColumn('dokumen_kerjasama', 'unit_prodi_id')) {
                $table->dropConstrainedForeignId('unit_prodi_id');
            }
            if (Schema::hasColumn('dokumen_kerjasama', 'sumber_pengajuan_id')) {
                $table->dropConstrainedForeignId('sumber_pengajuan_id');
            }
            if (Schema::hasColumn('dokumen_kerjasama', 'nomor_dokumen')) {
                $table->dropUnique(['nomor_dokumen']);
                $table->dropColumn('nomor_dokumen');
            }
        });
    }
};
