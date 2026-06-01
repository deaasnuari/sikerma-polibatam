<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pengajuan_log', function (Blueprint $table) {
            // Drop the FK that references the (legacy) pengajuan table.
            // The active data lives in pengajuan_v2, so we drop the constraint
            // instead of moving it to avoid breaking the 192 existing log rows
            // that already reference IDs from the pengajuan table.
            $table->dropForeign(['pengajuan_id']);
        });
    }

    public function down(): void
    {
        Schema::table('pengajuan_log', function (Blueprint $table) {
            $table->foreign('pengajuan_id')
                ->references('id')
                ->on('pengajuan')
                ->cascadeOnDelete();
        });
    }
};
