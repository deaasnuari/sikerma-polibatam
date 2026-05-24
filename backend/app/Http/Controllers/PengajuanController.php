<?php

namespace App\Http\Controllers;

use App\Models\Pengajuan;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PengajuanController extends Controller
{
    private function ensureAdmin(Request $request): ?Response
    {
        $user = $request->user();
        $rawRole = (string) ($user?->role ?? '');
        $normalizedRole = strtolower(str_replace([' ', '_'], '-', trim($rawRole)));

        if (!in_array($normalizedRole, ['admin', 'admin-humas'], true)) {
            return response([
                'success' => false,
                'message' => 'Only admin can modify pengajuan',
            ], 403);
        }

        return null;
    }

    private function normalizeRuangLingkupIds(Request $request, bool $required = false): array
    {
        $rules = $required
            ? ['required', 'array']
            : ['sometimes', 'array'];

        $request->validate([
            'ruang_lingkup_ids' => $rules,
            'ruang_lingkup_ids.*' => ['integer', 'exists:master_ruang_lingkup,id'],
        ]);

        $values = $request->input('ruang_lingkup_ids');
        if ($values === null) {
            return [];
        }

        return array_values(array_unique(array_map('intval', $values)));
    }

    public function index(Request $request): Response
    {
        $query = Pengajuan::query()->with(['unitProdi:id,nama,jenis_node,kategori_unit', 'mitra:id,nama_mitra']);

        if ($request->filled('status_pengajuan')) {
            $query->where('status_pengajuan', $request->string('status_pengajuan')->toString());
        }

        if ($request->filled('jenis_dokumen')) {
            $query->where('jenis_dokumen', strtoupper($request->string('jenis_dokumen')->toString()));
        }

        if ($request->filled('search')) {
            $keyword = strtolower($request->string('search')->trim()->toString());
            $query->where(function ($builder) use ($keyword) {
                $builder
                    ->whereRaw('LOWER(nomor_pengajuan) LIKE ?', ['%' . $keyword . '%'])
                    ->orWhereRaw('LOWER(nama_pengusul) LIKE ?', ['%' . $keyword . '%'])
                    ->orWhereRaw('LOWER(judul_pengajuan) LIKE ?', ['%' . $keyword . '%']);
            });
        }

        $data = $query->orderByDesc('diajukan_pada')->paginate((int) $request->integer('per_page', 20));

        return response([
            'success' => true,
            'data' => $data,
            'message' => 'Pengajuan retrieved successfully',
        ]);
    }

    public function show(Pengajuan $pengajuan): Response
    {
        $pengajuan->load(['unitProdi:id,nama,jenis_node,kategori_unit', 'mitra:id,nama_mitra']);

        return response([
            'success' => true,
            'data' => $pengajuan,
            'message' => 'Pengajuan retrieved successfully',
        ]);
    }

    public function store(Request $request): Response
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $ruangLingkupIds = $this->normalizeRuangLingkupIds($request);

        $validated = $request->validate([
            'nomor_pengajuan' => ['required', 'string', 'max:50', 'unique:pengajuan,nomor_pengajuan'],
            'user_pengusul_id' => ['nullable', 'integer', 'exists:users,id'],
            'nama_pengusul' => ['required', 'string', 'max:200'],
            'jabatan_pengusul' => ['nullable', 'string', 'max:150'],
            'email_pengusul' => ['nullable', 'email', 'max:255'],
            'whatsapp_pengusul' => ['nullable', 'string', 'max:50'],
            'unit_prodi_id' => ['nullable', 'integer', 'exists:master_unit_prodi,id'],
            'mitra_id' => ['nullable', 'integer', 'exists:master_mitra,id'],
            'judul_pengajuan' => ['required', 'string', 'max:255'],
            'deskripsi_pengajuan' => ['nullable', 'string'],
            'jenis_dokumen' => ['required', 'in:MOU,MOA,IA'],
            'kategori_pengajuan' => ['nullable', 'in:internal,eksternal'],
            'tanggal_mulai' => ['nullable', 'date'],
            'tanggal_berakhir' => ['nullable', 'date', 'after_or_equal:tanggal_mulai'],
            'status_pengajuan' => ['nullable', 'in:menunggu,diproses,disetujui,ditolak'],
            'diajukan_pada' => ['nullable', 'date'],
            'email_terverifikasi_pada' => ['nullable', 'date'],
        ]);

        $validated['jenis_dokumen'] = strtoupper((string) $validated['jenis_dokumen']);
        $validated['ruang_lingkup_ids'] = $ruangLingkupIds;

        try {
            $pengajuan = Pengajuan::create($validated);
        } catch (QueryException $exception) {
            return response([
                'success' => false,
                'message' => 'Gagal menyimpan pengajuan.',
                'error' => $exception->getMessage(),
            ], 422);
        }

        return response([
            'success' => true,
            'data' => $pengajuan,
            'message' => 'Pengajuan created successfully',
        ], 201);
    }

    public function update(Request $request, Pengajuan $pengajuan): Response
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $ruangLingkupIds = $this->normalizeRuangLingkupIds($request);

        $validated = $request->validate([
            'nomor_pengajuan' => ['sometimes', 'required', 'string', 'max:50', 'unique:pengajuan,nomor_pengajuan,' . $pengajuan->id],
            'user_pengusul_id' => ['nullable', 'integer', 'exists:users,id'],
            'nama_pengusul' => ['sometimes', 'required', 'string', 'max:200'],
            'jabatan_pengusul' => ['nullable', 'string', 'max:150'],
            'email_pengusul' => ['nullable', 'email', 'max:255'],
            'whatsapp_pengusul' => ['nullable', 'string', 'max:50'],
            'unit_prodi_id' => ['nullable', 'integer', 'exists:master_unit_prodi,id'],
            'mitra_id' => ['nullable', 'integer', 'exists:master_mitra,id'],
            'judul_pengajuan' => ['sometimes', 'required', 'string', 'max:255'],
            'deskripsi_pengajuan' => ['nullable', 'string'],
            'jenis_dokumen' => ['sometimes', 'required', 'in:MOU,MOA,IA'],
            'kategori_pengajuan' => ['nullable', 'in:internal,eksternal'],
            'tanggal_mulai' => ['nullable', 'date'],
            'tanggal_berakhir' => ['nullable', 'date', 'after_or_equal:tanggal_mulai'],
            'status_pengajuan' => ['nullable', 'in:menunggu,diproses,disetujui,ditolak'],
            'diajukan_pada' => ['nullable', 'date'],
            'email_terverifikasi_pada' => ['nullable', 'date'],
        ]);

        if (array_key_exists('jenis_dokumen', $validated)) {
            $validated['jenis_dokumen'] = strtoupper((string) $validated['jenis_dokumen']);
        }

        if ($request->has('ruang_lingkup_ids')) {
            $validated['ruang_lingkup_ids'] = $ruangLingkupIds;
        }

        try {
            $pengajuan->update($validated);
        } catch (QueryException $exception) {
            return response([
                'success' => false,
                'message' => 'Gagal mengubah pengajuan.',
                'error' => $exception->getMessage(),
            ], 422);
        }

        return response([
            'success' => true,
            'data' => $pengajuan,
            'message' => 'Pengajuan updated successfully',
        ]);
    }

    public function destroy(Request $request, Pengajuan $pengajuan): Response
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $pengajuan->delete();

        return response([
            'success' => true,
            'data' => null,
            'message' => 'Pengajuan deleted successfully',
        ]);
    }
}
