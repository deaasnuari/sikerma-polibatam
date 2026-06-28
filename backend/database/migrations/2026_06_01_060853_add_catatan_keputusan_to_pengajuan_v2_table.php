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
        Schema::table('pengajuan_v2', function (Blueprint $table) {
            if (! Schema::hasColumn('pengajuan_v2', 'catatan')) {
                $table->text('catatan')->nullable()->after('status_pengajuan');
            }
            if (! Schema::hasColumn('pengajuan_v2', 'keputusan')) {
                $table->string('keputusan')->nullable()->after('catatan');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pengajuan_v2', function (Blueprint $table) {
            $table->dropColumn(['catatan', 'keputusan']);
        });
    }
};
