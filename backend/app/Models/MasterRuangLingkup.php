<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MasterRuangLingkup extends Model
{
    protected $table = 'master_ruang_lingkup';

    protected $fillable = [
        'nama_ruang_lingkup',
        'aktif',
    ];

    protected $casts = [
        'aktif' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
