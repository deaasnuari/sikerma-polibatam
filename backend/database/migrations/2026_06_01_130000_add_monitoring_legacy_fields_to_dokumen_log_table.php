<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('dokumen_log', function (Blueprint $table) {
            if (!Schema::hasColumn('dokumen_log', 'nomor')) {
                $table->string('nomor', 100)->nullable()->after('payload_json');
            }

            if (!Schema::hasColumn('dokumen_log', 'mitra')) {
                $table->string('mitra', 255)->nullable()->after('nomor');
            }

            if (!Schema::hasColumn('dokumen_log', 'telepon')) {
                $table->string('telepon', 50)->nullable()->after('mitra');
            }

            if (!Schema::hasColumn('dokumen_log', 'tgl_mulai')) {
                $table->date('tgl_mulai')->nullable()->after('telepon');
            }

            if (!Schema::hasColumn('dokumen_log', 'tgl_berakhir')) {
                $table->date('tgl_berakhir')->nullable()->after('tgl_mulai');
            }

            if (!Schema::hasColumn('dokumen_log', 'unit')) {
                $table->string('unit', 150)->nullable()->after('tgl_berakhir');
            }

            if (!Schema::hasColumn('dokumen_log', 'lingkup')) {
                $table->text('lingkup')->nullable()->after('unit');
            }

            if (!Schema::hasColumn('dokumen_log', 'tingkat')) {
                $table->string('tingkat', 100)->nullable()->after('lingkup');
            }

            if (!Schema::hasColumn('dokumen_log', 'periode')) {
                $table->string('periode', 100)->nullable()->after('tingkat');
            }

            if (!Schema::hasColumn('dokumen_log', 'judul')) {
                $table->string('judul', 255)->nullable()->after('periode');
            }

            if (!Schema::hasColumn('dokumen_log', 'manfaat')) {
                $table->text('manfaat')->nullable()->after('judul');
            }

            if (!Schema::hasColumn('dokumen_log', 'bukti')) {
                $table->string('bukti', 255)->nullable()->after('manfaat');
            }

            if (!Schema::hasColumn('dokumen_log', 'status')) {
                $table->string('status', 50)->nullable()->after('bukti');
            }

            if (!Schema::hasColumn('dokumen_log', 'pic')) {
                $table->string('pic', 150)->nullable()->after('status');
            }

            if (!Schema::hasColumn('dokumen_log', 'tgl_monitoring')) {
                $table->date('tgl_monitoring')->nullable()->after('pic');
            }
        });
    }

    public function down(): void
    {
        Schema::table('dokumen_log', function (Blueprint $table) {
            foreach ([
                'tgl_monitoring',
                'pic',
                'status',
                'bukti',
                'manfaat',
                'judul',
                'periode',
                'tingkat',
                'lingkup',
                'unit',
                'tgl_berakhir',
                'tgl_mulai',
                'telepon',
                'mitra',
                'nomor',
            ] as $column) {
                if (Schema::hasColumn('dokumen_log', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};