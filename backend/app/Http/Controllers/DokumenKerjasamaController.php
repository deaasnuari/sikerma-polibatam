<?php

namespace App\Http\Controllers;

use App\Models\DokumenKerjasama;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class DokumenKerjasamaController extends Controller
{
    private function ensureAdmin(Request $request): ?Response
    {
        $user = $request->user();
        $rawRole = (string) ($user?->role ?? '');
        $normalizedRole = strtolower(str_replace([' ', '_'], '-', trim($rawRole)));

        if (!in_array($normalizedRole, ['admin', 'admin-humas'], true)) {
            return response([
                'success' => false,
                'message' => 'Only admin can modify dokumen kerjasama',
            ], 403);
        }

        return null;
    }

    public function index(Request $request): Response
    {
        $query = DokumenKerjasama::query()->with([
            'pengajuan:id,nomor_pengajuan,nama_pengusul,whatsapp_pengusul',
            'unitProdi:id,nama,jenis_node,kategori_unit',
            'mitra:id,nama_mitra,negara',
        ]);

        if ($request->filled('status_siklus')) {
            $query->where('status_siklus', $request->string('status_siklus')->toString());
        }

        if ($request->filled('jenis_dokumen')) {
            $query->where('jenis_dokumen', strtoupper($request->string('jenis_dokumen')->toString()));
        }

        if ($request->filled('search')) {
            $keyword = strtolower($request->string('search')->trim()->toString());
            $query->where(function ($builder) use ($keyword) {
                $builder
                    ->whereRaw('LOWER(COALESCE(nomor_dokumen, no_dokumen, \'\')) LIKE ?', ['%' . $keyword . '%'])
                    ->orWhereRaw('LOWER(COALESCE(nama_dokumen, \'\')) LIKE ?', ['%' . $keyword . '%'])
                    ->orWhereRaw('LOWER(COALESCE(judul_dokumen, \'\')) LIKE ?', ['%' . $keyword . '%']);
            });
        }

        $data = $query->orderByDesc('updated_at')->paginate((int) $request->integer('per_page', 20));

        return response([
            'success' => true,
            'data' => $data,
            'message' => 'Dokumen kerjasama retrieved successfully',
        ]);
    }

    public function show(DokumenKerjasama $dokumen_kerjasama): Response
    {
        $dokumen_kerjasama->load([
            'pengajuan:id,nomor_pengajuan,nama_pengusul,whatsapp_pengusul',
            'unitProdi:id,nama,jenis_node,kategori_unit',
            'mitra:id,nama_mitra,negara',
        ]);

        return response([
            'success' => true,
            'data' => $dokumen_kerjasama,
            'message' => 'Dokumen kerjasama retrieved successfully',
        ]);
    }

    public function store(Request $request): Response
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $validated = $request->validate([
            'nomor_dokumen' => ['required', 'string', 'max:100', 'unique:dokumen_kerjasama,nomor_dokumen'],
            'no_permohonan' => ['required', 'string', 'exists:pengajuan_v2,nomor_pengajuan'],
            'no_dokumen' => ['nullable', 'string', 'max:100', 'unique:dokumen_kerjasama,no_dokumen'],
            'nama_dokumen' => ['required', 'string', 'max:255'],
            'jenis_dokumen' => ['required', 'in:MOU,MOA,IA'],
            'judul_dokumen' => ['nullable', 'string', 'max:255'],
            'ruang_lingkup_ids' => ['nullable', 'array'],
            'ruang_lingkup_ids.*' => ['integer', 'exists:master_ruang_lingkup,id'],
            'tanggal_mulai' => ['nullable', 'date'],
            'tanggal_berakhir' => ['nullable', 'date', 'after_or_equal:tanggal_mulai'],
            'tanggal_ttd' => ['nullable', 'date'],
            'status_siklus' => ['nullable', 'in:active,expiring,archived'],
            'diarsipkan_pada' => ['nullable', 'date'],
            'alasan_arsip' => ['nullable', 'string'],
            'sumber_pengajuan_id' => ['nullable', 'integer', 'exists:pengajuan_v2,id'],
            'unit_prodi_id' => ['nullable', 'integer', 'exists:master_unit_prodi,id'],
            'mitra_id' => ['nullable', 'integer', 'exists:master_mitra,id'],
            'dibuat_oleh_user_id' => ['nullable', 'integer', 'exists:users,id'],
            'file' => ['required', 'string', 'max:255'],
            'keterangan' => ['nullable', 'string'],
        ]);

        $validated['jenis_dokumen'] = strtoupper((string) $validated['jenis_dokumen']);

        try {
            $dokumen = DokumenKerjasama::create($validated);
        } catch (QueryException $exception) {
            return response([
                'success' => false,
                'message' => 'Gagal menyimpan dokumen kerjasama.',
                'error' => $exception->getMessage(),
            ], 422);
        }

        return response([
            'success' => true,
            'data' => $dokumen,
            'message' => 'Dokumen kerjasama created successfully',
        ], 201);
    }

    public function update(Request $request, DokumenKerjasama $dokumen_kerjasama): Response
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $validated = $request->validate([
            'nomor_dokumen' => ['sometimes', 'required', 'string', 'max:100', 'unique:dokumen_kerjasama,nomor_dokumen,' . $dokumen_kerjasama->id],
            'no_permohonan' => ['sometimes', 'required', 'string', 'exists:pengajuan_v2,nomor_pengajuan'],
            'no_dokumen' => ['nullable', 'string', 'max:100', 'unique:dokumen_kerjasama,no_dokumen,' . $dokumen_kerjasama->id],
            'nama_dokumen' => ['sometimes', 'required', 'string', 'max:255'],
            'jenis_dokumen' => ['sometimes', 'required', 'in:MOU,MOA,IA'],
            'judul_dokumen' => ['nullable', 'string', 'max:255'],
            'ruang_lingkup_ids' => ['nullable', 'array'],
            'ruang_lingkup_ids.*' => ['integer', 'exists:master_ruang_lingkup,id'],
            'tanggal_mulai' => ['nullable', 'date'],
            'tanggal_berakhir' => ['nullable', 'date', 'after_or_equal:tanggal_mulai'],
            'tanggal_ttd' => ['nullable', 'date'],
            'status_siklus' => ['nullable', 'in:active,expiring,archived'],
            'diarsipkan_pada' => ['nullable', 'date'],
            'alasan_arsip' => ['nullable', 'string'],
            'sumber_pengajuan_id' => ['nullable', 'integer', 'exists:pengajuan_v2,id'],
            'unit_prodi_id' => ['nullable', 'integer', 'exists:master_unit_prodi,id'],
            'mitra_id' => ['nullable', 'integer', 'exists:master_mitra,id'],
            'dibuat_oleh_user_id' => ['nullable', 'integer', 'exists:users,id'],
            'file' => ['sometimes', 'required', 'string', 'max:255'],
            'keterangan' => ['nullable', 'string'],
        ]);

        if (array_key_exists('jenis_dokumen', $validated)) {
            $validated['jenis_dokumen'] = strtoupper((string) $validated['jenis_dokumen']);
        }

        try {
            $dokumen_kerjasama->update($validated);
        } catch (QueryException $exception) {
            return response([
                'success' => false,
                'message' => 'Gagal mengubah dokumen kerjasama.',
                'error' => $exception->getMessage(),
            ], 422);
        }

        return response([
            'success' => true,
            'data' => $dokumen_kerjasama,
            'message' => 'Dokumen kerjasama updated successfully',
        ]);
    }

    public function destroy(Request $request, DokumenKerjasama $dokumen_kerjasama): Response
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $dokumen_kerjasama->delete();

        return response([
            'success' => true,
            'data' => null,
            'message' => 'Dokumen kerjasama deleted successfully',
        ]);
    }
}
