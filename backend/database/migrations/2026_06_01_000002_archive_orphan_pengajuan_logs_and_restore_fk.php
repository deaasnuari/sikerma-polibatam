<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('pengajuan_log_legacy_archive')) {
            Schema::create('pengajuan_log_legacy_archive', function (Blueprint $table) {
                $table->unsignedBigInteger('original_log_id')->primary();
                $table->unsignedBigInteger('pengajuan_id');
                $table->string('tipe_log', 20);
                $table->string('status_lama', 20)->nullable();
                $table->string('status_baru', 20)->nullable();
                $table->string('judul_log', 255)->nullable();
                $table->text('isi_log')->nullable();
                $table->json('payload_json')->nullable();
                $table->unsignedBigInteger('dibuat_oleh_user_id')->nullable();
                $table->timestamp('dibuat_pada')->nullable();
                $table->timestamp('archived_at')->useCurrent();
            });
        }

        DB::statement(<<<'SQL'
            INSERT INTO pengajuan_log_legacy_archive (
                original_log_id,
                pengajuan_id,
                tipe_log,
                status_lama,
                status_baru,
                judul_log,
                isi_log,
                payload_json,
                dibuat_oleh_user_id,
                dibuat_pada
            )
            SELECT
                l.id,
                l.pengajuan_id,
                l.tipe_log,
                l.status_lama,
                l.status_baru,
                l.judul_log,
                l.isi_log,
                l.payload_json,
                l.dibuat_oleh_user_id,
                l.dibuat_pada
            FROM pengajuan_log l
            LEFT JOIN pengajuan_v2 p ON p.id = l.pengajuan_id
            WHERE p.id IS NULL
            ON CONFLICT (original_log_id) DO NOTHING
        SQL);

        DB::statement(<<<'SQL'
            DELETE FROM pengajuan_log l
            USING pengajuan_log_legacy_archive a
            WHERE a.original_log_id = l.id
        SQL);

        Schema::table('pengajuan_log', function (Blueprint $table) {
            $table->foreign('pengajuan_id')
                ->references('id')
                ->on('pengajuan_v2')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('pengajuan_log', function (Blueprint $table) {
            $table->dropForeign(['pengajuan_id']);
        });

        DB::statement(<<<'SQL'
            INSERT INTO pengajuan_log (
                id,
                pengajuan_id,
                tipe_log,
                status_lama,
                status_baru,
                judul_log,
                isi_log,
                payload_json,
                dibuat_oleh_user_id,
                dibuat_pada
            )
            SELECT
                a.original_log_id,
                a.pengajuan_id,
                a.tipe_log,
                a.status_lama,
                a.status_baru,
                a.judul_log,
                a.isi_log,
                a.payload_json,
                a.dibuat_oleh_user_id,
                a.dibuat_pada
            FROM pengajuan_log_legacy_archive a
            WHERE NOT EXISTS (
                SELECT 1
                FROM pengajuan_log l
                WHERE l.id = a.original_log_id
            )
        SQL);

        Schema::dropIfExists('pengajuan_log_legacy_archive');
    }
};