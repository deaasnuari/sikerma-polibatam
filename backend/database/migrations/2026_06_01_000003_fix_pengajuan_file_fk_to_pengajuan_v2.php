<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('pengajuan_file') || ! Schema::hasTable('pengajuan_v2')) {
            return;
        }

        if (! Schema::hasTable('pengajuan_file_legacy_archive')) {
            Schema::create('pengajuan_file_legacy_archive', function (Blueprint $table) {
                $table->unsignedBigInteger('original_file_id')->primary();
                $table->unsignedBigInteger('pengajuan_id');
                $table->string('nama_file', 255);
                $table->string('path_file', 500);
                $table->string('mime_type', 120)->nullable();
                $table->unsignedBigInteger('ukuran_file_bytes')->nullable();
                $table->unsignedBigInteger('diunggah_oleh_user_id')->nullable();
                $table->timestamp('diunggah_pada')->nullable();
                $table->timestamp('created_at')->nullable();
                $table->timestamp('updated_at')->nullable();
                $table->timestamp('archived_at')->useCurrent();
            });
        }

        DB::statement(<<<'SQL'
            INSERT INTO pengajuan_file_legacy_archive (
                original_file_id,
                pengajuan_id,
                nama_file,
                path_file,
                mime_type,
                ukuran_file_bytes,
                diunggah_oleh_user_id,
                diunggah_pada,
                created_at,
                updated_at
            )
            SELECT
                f.id,
                f.pengajuan_id,
                f.nama_file,
                f.path_file,
                f.mime_type,
                f.ukuran_file_bytes,
                f.diunggah_oleh_user_id,
                f.diunggah_pada,
                f.created_at,
                f.updated_at
            FROM pengajuan_file f
            LEFT JOIN pengajuan_v2 p ON p.id = f.pengajuan_id
            WHERE p.id IS NULL
            ON CONFLICT (original_file_id) DO NOTHING
        SQL);

        DB::statement(<<<'SQL'
            DELETE FROM pengajuan_file f
            USING pengajuan_file_legacy_archive a
            WHERE a.original_file_id = f.id
        SQL);

        DB::statement('ALTER TABLE pengajuan_file DROP CONSTRAINT IF EXISTS pengajuan_file_pengajuan_id_foreign');

        Schema::table('pengajuan_file', function (Blueprint $table) {
            $table->foreign('pengajuan_id')
                ->references('id')
                ->on('pengajuan_v2')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('pengajuan_file')) {
            return;
        }

        DB::statement('ALTER TABLE pengajuan_file DROP CONSTRAINT IF EXISTS pengajuan_file_pengajuan_id_foreign');

        if (Schema::hasTable('pengajuan_file_legacy_archive')) {
            DB::statement(<<<'SQL'
                INSERT INTO pengajuan_file (
                    id,
                    pengajuan_id,
                    nama_file,
                    path_file,
                    mime_type,
                    ukuran_file_bytes,
                    diunggah_oleh_user_id,
                    diunggah_pada,
                    created_at,
                    updated_at
                )
                SELECT
                    a.original_file_id,
                    a.pengajuan_id,
                    a.nama_file,
                    a.path_file,
                    a.mime_type,
                    a.ukuran_file_bytes,
                    a.diunggah_oleh_user_id,
                    a.diunggah_pada,
                    a.created_at,
                    a.updated_at
                FROM pengajuan_file_legacy_archive a
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM pengajuan_file f
                    WHERE f.id = a.original_file_id
                )
            SQL);

            Schema::dropIfExists('pengajuan_file_legacy_archive');
        }

        if (Schema::hasTable('pengajuan')) {
            Schema::table('pengajuan_file', function (Blueprint $table) {
                $table->foreign('pengajuan_id')
                    ->references('id')
                    ->on('pengajuan')
                    ->cascadeOnDelete();
            });
        }
    }
};
