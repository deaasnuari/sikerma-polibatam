<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PengajuanAktivitas extends Model
{
    protected $table = 'pengajuan_aktivitas';

    protected $fillable = [
        'pengajuan_id',
        'judul',
        'jenis_aktivitas',
        'tanggal',
        'jumlah_peserta',
        'deskripsi',
        'pic_polibatam',
        'pic_mitra',
        'status',
        'dibuat_oleh_user_id',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'jumlah_peserta' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function pengajuan(): BelongsTo
    {
        return $this->belongsTo(Pengajuan::class, 'pengajuan_id');
    }
}
