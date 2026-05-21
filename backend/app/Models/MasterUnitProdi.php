<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MasterUnitProdi extends Model
{
    protected $table = 'master_unit_prodi';

    protected $fillable = [
        'parent_id',
        'jenis_node',
        'kategori_unit',
        'kode',
        'nama',
        'aktif',
    ];

    protected $casts = [
        'aktif' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relasi self-referencing untuk parent unit/prodi
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(MasterUnitProdi::class, 'parent_id');
    }

    /**
     * Relasi self-referencing untuk child unit/prodi
     */
    public function children(): HasMany
    {
        return $this->hasMany(MasterUnitProdi::class, 'parent_id');
    }

    /**
     * Scope untuk filter hanya unit
     */
    public function scopeOnlyUnit($query)
    {
        return $query->where('jenis_node', 'unit');
    }

    /**
     * Scope untuk filter unit kategori jurusan
     */
    public function scopeOnlyJurusan($query)
    {
        return $query->where('jenis_node', 'unit')->where('kategori_unit', 'jurusan');
    }

    /**
     * Scope untuk filter unit kategori unit kerja
     */
    public function scopeOnlyUnitKerja($query)
    {
        return $query->where('jenis_node', 'unit')->where('kategori_unit', 'unit_kerja');
    }

    /**
     * Scope untuk filter hanya prodi
     */
    public function scopeOnlyProdi($query)
    {
        return $query->where('jenis_node', 'prodi');
    }

    /**
     * Scope untuk filter yang aktif
     */
    public function scopeAktif($query)
    {
        return $query->where('aktif', true);
    }

    /**
     * Get full hierarchy path
     */
    public function getHierarchyPath(): string
    {
        $path = [$this->nama];
        $parent = $this->parent;

        while ($parent) {
            array_unshift($path, $parent->nama);
            $parent = $parent->parent;
        }

        return implode(' > ', $path);
    }
}
