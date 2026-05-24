<?php

namespace App\Http\Controllers;

use App\Models\Pengajuan;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PengajuanController extends Controller
{
    private const ADMIN_ROLES = ['admin', 'admin-humas'];

    private const VALID_STATUSES = ['menunggu', 'diproses', 'disetujui', 'ditolak'];

    private const VALID_KATEGORI = ['Internal', 'Eksternal'];

    private function normalizeRole(?string $role): string
    {
        return strtolower(str_replace([' ', '_'], '-', trim((string) $role)));
    }

    private function isAdmin(Request $request): bool
    {
        return in_array($this->normalizeRole($request->user()?->role), self::ADMIN_ROLES, true);
    }

    private function canModify(Request $request, Pengajuan $pengajuan): bool
    {
        if ($this->isAdmin($request)) {
            return true;
        }

        $user = $request->user();

        return $user && $pengajuan->created_by_user_id === $user->id;
    }

    private function toResponsePayload(Pengajuan $pengajuan): array
    {
        return [
            'id' => $pengajuan->id,
            'judul' => $pengajuan->judul,
            'deskripsi' => $pengajuan->deskripsi,
            'pengusul' => $pengajuan->pengusul,
            'tanggal' => $pengajuan->tanggal ? (string) $pengajuan->tanggal : null,
            'mitra' => $pengajuan->mitra,
            'jenis_dokumen' => $pengajuan->jenis_dokumen,
            'jurusan' => $pengajuan->jurusan,
            'kategori' => $pengajuan->kategori,
            'tanggal_mulai' => $pengajuan->tanggal_mulai ? (string) $pengajuan->tanggal_mulai : null,
            'tanggal_berakhir' => $pengajuan->tanggal_berakhir ? (string) $pengajuan->tanggal_berakhir : null,
            'email_pengusul' => $pengajuan->email_pengusul,
            'whatsapp_pengusul' => $pengajuan->whatsapp_pengusul,
            'alamat_mitra' => $pengajuan->alamat_mitra,
            'negara' => $pengajuan->negara,
            'email_terverifikasi' => (bool) $pengajuan->email_terverifikasi,
            'ruang_lingkup' => $pengajuan->ruang_lingkup ?? [],
            'status' => $pengajuan->status,
            'file_name' => $pengajuan->file_name,
            'file_attachments' => $pengajuan->file_attachments ?? [],
            'review_comment' => $pengajuan->review_comment,
            'reviewed_at' => $pengajuan->reviewed_at ? (string) $pengajuan->reviewed_at : null,
            'reviewed_by' => $pengajuan->reviewed_by,
            'is_from_admin' => (bool) $pengajuan->is_from_admin,
            'source_role' => $pengajuan->source_role,
            'created_by_user_id' => $pengajuan->created_by_user_id,
            'created_at' => $pengajuan->created_at?->toISOString(),
            'updated_at' => $pengajuan->updated_at?->toISOString(),
        ];
    }

    public function index(Request $request): Response
    {
        $query = Pengajuan::query()->orderByDesc('id');

        if ($request->filled('status')) {
            $status = strtolower($request->string('status')->toString());
            if (in_array($status, self::VALID_STATUSES, true)) {
                $query->where('status', $status);
            }
        }

        if ($request->filled('kategori')) {
            $kategori = ucfirst(strtolower($request->string('kategori')->toString()));
            if (in_array($kategori, self::VALID_KATEGORI, true)) {
                $query->where('kategori', $kategori);
            }
        }

        if ($request->boolean('exclude_admin')) {
            $query->where('is_from_admin', false);
        }

        $keyword = trim((string) $request->string('search', ''));
        if ($keyword !== '') {
            $keywordLower = strtolower($keyword);
            $query->where(function ($builder) use ($keywordLower) {
                $builder
                    ->whereRaw('LOWER(judul) LIKE ?', ['%' . $keywordLower . '%'])
                    ->orWhereRaw('LOWER(mitra) LIKE ?', ['%' . $keywordLower . '%'])
                    ->orWhereRaw('LOWER(pengusul) LIKE ?', ['%' . $keywordLower . '%'])
                    ->orWhereRaw('LOWER(jurusan) LIKE ?', ['%' . $keywordLower . '%'])
                    ->orWhereRaw('LOWER(jenis_dokumen) LIKE ?', ['%' . $keywordLower . '%']);
            });
        }

        return response([
            'success' => true,
            'data' => $query->get()->map(fn (Pengajuan $item) => $this->toResponsePayload($item))->values(),
            'message' => 'Pengajuan retrieved successfully',
        ]);
    }

    public function store(Request $request): Response
    {
        $validated = $request->validate([
            'judul' => ['required', 'string', 'max:255'],
            'deskripsi' => ['nullable', 'string'],
            'pengusul' => ['required', 'string', 'max:200'],
            'tanggal' => ['nullable', 'date'],
            'mitra' => ['required', 'string', 'max:255'],
            'jenis_dokumen' => ['required', 'string', 'max:20'],
            'jurusan' => ['required', 'string', 'max:150'],
            'kategori' => ['nullable', 'in:Internal,Eksternal'],
            'tanggal_mulai' => ['nullable', 'date'],
            'tanggal_berakhir' => ['nullable', 'date'],
            'email_pengusul' => ['nullable', 'email', 'max:255'],
            'whatsapp_pengusul' => ['nullable', 'string', 'max:50'],
            'alamat_mitra' => ['nullable', 'string'],
            'negara' => ['nullable', 'string', 'max:100'],
            'email_terverifikasi' => ['boolean'],
            'ruang_lingkup' => ['nullable', 'array'],
            'ruang_lingkup.*' => ['string', 'max:150'],
            'status' => ['nullable', 'in:menunggu,diproses,disetujui,ditolak'],
            'file_name' => ['nullable', 'string', 'max:500'],
            'file_attachments' => ['nullable', 'array'],
            'review_comment' => ['nullable', 'string'],
            'reviewed_at' => ['nullable', 'date'],
            'reviewed_by' => ['nullable', 'string', 'max:200'],
            'is_from_admin' => ['boolean'],
            'source_role' => ['nullable', 'string', 'max:50'],
        ]);

        if (empty($validated['tanggal'])) {
            $validated['tanggal'] = now()->toDateString();
        }

        if (empty($validated['status'])) {
            $validated['status'] = 'menunggu';
        }

        $validated['created_by_user_id'] = $request->user()?->id;

        $pengajuan = Pengajuan::create($validated);

        return response([
            'success' => true,
            'data' => $this->toResponsePayload($pengajuan),
            'message' => 'Pengajuan created successfully',
        ], 201);
    }

    public function update(Request $request, Pengajuan $pengajuan): Response
    {
        if (! $this->canModify($request, $pengajuan)) {
            return response([
                'success' => false,
                'message' => 'Akses ditolak untuk mengubah pengajuan ini.',
            ], 403);
        }

        $validated = $request->validate([
            'judul' => ['sometimes', 'required', 'string', 'max:255'],
            'deskripsi' => ['nullable', 'string'],
            'pengusul' => ['sometimes', 'required', 'string', 'max:200'],
            'tanggal' => ['sometimes', 'nullable', 'date'],
            'mitra' => ['sometimes', 'required', 'string', 'max:255'],
            'jenis_dokumen' => ['sometimes', 'required', 'string', 'max:20'],
            'jurusan' => ['sometimes', 'required', 'string', 'max:150'],
            'kategori' => ['nullable', 'in:Internal,Eksternal'],
            'tanggal_mulai' => ['nullable', 'date'],
            'tanggal_berakhir' => ['nullable', 'date'],
            'email_pengusul' => ['nullable', 'email', 'max:255'],
            'whatsapp_pengusul' => ['nullable', 'string', 'max:50'],
            'alamat_mitra' => ['nullable', 'string'],
            'negara' => ['nullable', 'string', 'max:100'],
            'email_terverifikasi' => ['boolean'],
            'ruang_lingkup' => ['nullable', 'array'],
            'ruang_lingkup.*' => ['string', 'max:150'],
            'status' => ['sometimes', 'nullable', 'in:menunggu,diproses,disetujui,ditolak'],
            'file_name' => ['nullable', 'string', 'max:500'],
            'file_attachments' => ['nullable', 'array'],
            'review_comment' => ['nullable', 'string'],
            'reviewed_at' => ['nullable', 'date'],
            'reviewed_by' => ['nullable', 'string', 'max:200'],
            'is_from_admin' => ['boolean'],
            'source_role' => ['nullable', 'string', 'max:50'],
        ]);

        $pengajuan->update($validated);

        return response([
            'success' => true,
            'data' => $this->toResponsePayload($pengajuan->fresh()),
            'message' => 'Pengajuan updated successfully',
        ]);
    }

    public function updateStatus(Request $request, Pengajuan $pengajuan): Response
    {
        if (! $this->isAdmin($request)) {
            return response([
                'success' => false,
                'message' => 'Hanya admin yang dapat mengubah status pengajuan.',
            ], 403);
        }

        $validated = $request->validate([
            'status' => ['required', 'in:menunggu,diproses,disetujui,ditolak'],
            'review_comment' => ['nullable', 'string'],
            'reviewed_at' => ['nullable', 'date'],
            'reviewed_by' => ['nullable', 'string', 'max:200'],
        ]);

        $pengajuan->update([
            'status' => $validated['status'],
            'review_comment' => $validated['review_comment'] ?? null,
            'reviewed_at' => $validated['reviewed_at'] ?? now()->toDateString(),
            'reviewed_by' => $validated['reviewed_by'] ?? ($request->user()?->name ?? 'Admin SIKERMA'),
        ]);

        return response([
            'success' => true,
            'data' => $this->toResponsePayload($pengajuan->fresh()),
            'message' => 'Status pengajuan updated successfully',
        ]);
    }

    public function destroy(Request $request, Pengajuan $pengajuan): Response
    {
        if (! $this->canModify($request, $pengajuan)) {
            return response([
                'success' => false,
                'message' => 'Akses ditolak untuk menghapus pengajuan ini.',
            ], 403);
        }

        $pengajuan->delete();

        return response([
            'success' => true,
            'data' => null,
            'message' => 'Pengajuan deleted successfully',
        ]);
    }
}
