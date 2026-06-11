<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MasterNegara extends Model
{
    protected $table = 'master_negara';

    protected $fillable = [
        'nama_negara',
        'aktif',
    ];
}
