<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('dokumen_log', function (Blueprint $table) {
            if (!Schema::hasColumn('dokumen_log', 'catatan_perpanjangan')) {
                $table->text('catatan_perpanjangan')->nullable()->after('payload_json');
            }

            if (!Schema::hasColumn('dokumen_log', 'bukti_perpanjangan')) {
                $table->string('bukti_perpanjangan', 255)->nullable()->after('catatan_perpanjangan');
            }

            if (!Schema::hasColumn('dokumen_log', 'tanggal_mulai_perpanjangan')) {
                $table->date('tanggal_mulai_perpanjangan')->nullable()->after('bukti_perpanjangan');
            }

            if (!Schema::hasColumn('dokumen_log', 'tanggal_berakhir_perpanjangan')) {
                $table->date('tanggal_berakhir_perpanjangan')->nullable()->after('tanggal_mulai_perpanjangan');
            }

            if (!Schema::hasColumn('dokumen_log', 'status_perpanjangan')) {
                $table->string('status_perpanjangan', 20)->default('menunggu')->after('tanggal_berakhir_perpanjangan');
                $table->index('status_perpanjangan', 'idx_dokumen_log_status_perpanjangan');
            }

            if (!Schema::hasColumn('dokumen_log', 'requester_role')) {
                $table->string('requester_role', 20)->nullable()->after('status_perpanjangan');
            }

            if (!Schema::hasColumn('dokumen_log', 'notification_href')) {
                $table->string('notification_href', 255)->nullable()->after('requester_role');
            }

            if (!Schema::hasColumn('dokumen_log', 'diputuskan_pada')) {
                $table->timestamp('diputuskan_pada')->nullable()->after('dibuat_pada');
            }

            if (!Schema::hasColumn('dokumen_log', 'diputuskan_oleh')) {
                $table->string('diputuskan_oleh', 100)->nullable()->after('diputuskan_pada');
            }
        });
    }

    public function down(): void
    {
        Schema::table('dokumen_log', function (Blueprint $table) {
            if (Schema::hasColumn('dokumen_log', 'diputuskan_oleh')) {
                $table->dropColumn('diputuskan_oleh');
            }

            if (Schema::hasColumn('dokumen_log', 'diputuskan_pada')) {
                $table->dropColumn('diputuskan_pada');
            }

            if (Schema::hasColumn('dokumen_log', 'notification_href')) {
                $table->dropColumn('notification_href');
            }

            if (Schema::hasColumn('dokumen_log', 'requester_role')) {
                $table->dropColumn('requester_role');
            }

            if (Schema::hasColumn('dokumen_log', 'status_perpanjangan')) {
                try {
                    $table->dropIndex('idx_dokumen_log_status_perpanjangan');
                } catch (\Throwable $e) {
                    // Ignore if index does not exist.
                }
                $table->dropColumn('status_perpanjangan');
            }

            if (Schema::hasColumn('dokumen_log', 'tanggal_berakhir_perpanjangan')) {
                $table->dropColumn('tanggal_berakhir_perpanjangan');
            }

            if (Schema::hasColumn('dokumen_log', 'tanggal_mulai_perpanjangan')) {
                $table->dropColumn('tanggal_mulai_perpanjangan');
            }

            if (Schema::hasColumn('dokumen_log', 'bukti_perpanjangan')) {
                $table->dropColumn('bukti_perpanjangan');
            }

            if (Schema::hasColumn('dokumen_log', 'catatan_perpanjangan')) {
                $table->dropColumn('catatan_perpanjangan');
            }
        });
    }
};