<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
   
     */
    public function up(): void
    {
        Schema::table('pengajuan_v2', function (Blueprint $table) {
            if (!Schema::hasColumn('pengajuan_v2', 'catatan_revisi')) {
                $table->text('catatan_revisi')->nullable()->after('catatan');
            }

            if (!Schema::hasColumn('pengajuan_v2', 'acc_internal_at')) {
                $table->timestamp('acc_internal_at')->nullable()->after('catatan_revisi');
            }

            if (!Schema::hasColumn('pengajuan_v2', 'acc_mitra_at')) {
                $table->timestamp('acc_mitra_at')->nullable()->after('acc_internal_at');
            }

            if (!Schema::hasColumn('pengajuan_v2', 'final_approved_at')) {
                $table->timestamp('final_approved_at')->nullable()->after('acc_mitra_at');
            }

            if (!Schema::hasColumn('pengajuan_v2', 'final_file_name')) {
                $table->string('final_file_name', 500)->nullable()->after('final_approved_at');
            }

            if (!Schema::hasColumn('pengajuan_v2', 'final_file_path')) {
                $table->string('final_file_path', 1000)->nullable()->after('final_file_name');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pengajuan_v2', function (Blueprint $table) {
            $columns = [
                'catatan_revisi',
                'acc_internal_at',
                'acc_mitra_at',
                'final_approved_at',
                'final_file_name',
                'final_file_path',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('pengajuan_v2', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
