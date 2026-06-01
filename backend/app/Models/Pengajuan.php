<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Casts\PgArrayCast;

class Pengajuan extends Model
{
    protected $table = 'pengajuan_v2';

    protected $fillable = [
        // Legacy schema columns
        'judul',
        'deskripsi',
        'pengusul',
        'tanggal',
        'mitra',
        'jurusan',
        'kategori',
        'ruang_lingkup',
        'status',
        'email_terverifikasi',
        'file_name',
        'file_attachments',
        'review_comment',
        'reviewed_at',
        'reviewed_by',
        'alamat_mitra',
        'negara',
        'is_from_admin',
        'source_role',
        'created_by_user_id',

        // New schema columns
        'nomor_pengajuan',
        'user_pengusul_id',
        'nama_pengusul',
        'jabatan_pengusul',
        'email_pengusul',
        'whatsapp_pengusul',
        'unit_prodi_id',
        'mitra_id',
        'judul_pengajuan',
        'deskripsi_pengajuan',
        'jenis_dokumen',
        'kategori_pengajuan',
        'ruang_lingkup_ids',
        'tanggal_mulai',
        'tanggal_berakhir',
        'status_pengajuan',
        'diajukan_pada',
        'email_terverifikasi_pada',
        'nama_mitra',
    ];

    protected $casts = [
        // Legacy schema casts
        'tanggal' => 'date',
        'ruang_lingkup' => 'array',
        'email_terverifikasi' => 'boolean',
        'file_attachments' => 'array',
        'reviewed_at' => 'date',
        'is_from_admin' => 'boolean',

        // New schema casts
        'ruang_lingkup_ids' => PgArrayCast::class,
        'tanggal_mulai' => 'date',
        'tanggal_berakhir' => 'date',
        'diajukan_pada' => 'datetime',
        'email_terverifikasi_pada' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function unitProdi(): BelongsTo
    {
        return $this->belongsTo(MasterUnitProdi::class, 'unit_prodi_id');
    }

    public function mitra(): BelongsTo
    {
        return $this->belongsTo(MasterMitra::class, 'mitra_id');
    }

    public function pengajuanFiles(): HasMany
    {
        return $this->hasMany(PengajuanFile::class, 'pengajuan_id', 'id');
    }

    public function dokumenFiles(): HasMany
    {
        // Keep legacy relation name so existing API payload still exposes "dokumen_files".
        return $this->pengajuanFiles();
    }

    public function pengajuanLogs(): HasMany
    {
        return $this->hasMany(PengajuanLog::class, 'pengajuan_id', 'id');
    }
}
