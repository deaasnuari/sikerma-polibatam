<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pengajuan extends Model
{
    protected $table = 'pengajuan';

    protected $fillable = [
        'judul',
        'deskripsi',
        'pengusul',
        'tanggal',
        'mitra',
        'jenis_dokumen',
        'jurusan',
        'kategori',
        'tanggal_mulai',
        'tanggal_berakhir',
        'email_pengusul',
        'whatsapp_pengusul',
        'alamat_mitra',
        'negara',
        'email_terverifikasi',
        'ruang_lingkup',
        'status',
        'file_name',
        'file_attachments',
        'review_comment',
        'reviewed_at',
        'reviewed_by',
        'is_from_admin',
        'source_role',
        'created_by_user_id',
    ];

    protected $casts = [
        'tanggal' => 'date:Y-m-d',
        'tanggal_mulai' => 'date:Y-m-d',
        'tanggal_berakhir' => 'date:Y-m-d',
        'reviewed_at' => 'date:Y-m-d',
        'email_terverifikasi' => 'boolean',
        'is_from_admin' => 'boolean',
        'ruang_lingkup' => 'array',
        'file_attachments' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
