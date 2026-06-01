<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PengajuanLog extends Model
{
    protected $table = 'pengajuan_log';

    public $timestamps = false;

    protected $fillable = [
        'pengajuan_id',
        'tipe_log',
        'status_lama',
        'status_baru',
        'judul_log',
        'isi_log',
        'payload_json',
        'dibuat_oleh_user_id',
    ];

    protected $casts = [
        'payload_json' => 'array',
        'dibuat_pada'  => 'datetime',
    ];
}
