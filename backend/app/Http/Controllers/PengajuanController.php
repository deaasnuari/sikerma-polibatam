<?php

namespace App\Http\Controllers;

use App\Models\Pengajuan;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Schema;

class PengajuanController extends Controller
{
    private static array $pengajuanColumnCache = [];
    private static ?bool $pengajuanFileTableExists = null;

    private function hasPengajuanColumn(string $column): bool
    {
        if (array_key_exists($column, self::$pengajuanColumnCache)) {
            return self::$pengajuanColumnCache[$column];
        }

        self::$pengajuanColumnCache[$column] = Schema::hasColumn((new Pengajuan)->getTable(), $column);

        return self::$pengajuanColumnCache[$column];
    }

    private function useNewPengajuanSchema(): bool
    {
        return $this->hasPengajuanColumn('nomor_pengajuan');
    }

    private function hasPengajuanFileTable(): bool
    {
        if (self::$pengajuanFileTableExists !== null) {
            return self::$pengajuanFileTableExists;
        }

        self::$pengajuanFileTableExists = Schema::hasTable('pengajuan_file');

        return self::$pengajuanFileTableExists;
    }

    private function normalizeAttachmentPath(array $row): string
    {
        $rawPath = trim((string) ($row['path'] ?? $row['path_file'] ?? ''));
        if ($rawPath !== '') {
            return $rawPath;
        }

        $rawUrl = trim((string) ($row['url'] ?? ''));
        if ($rawUrl !== '' && !str_starts_with($rawUrl, 'data:')) {
            return $rawUrl;
        }

        return trim((string) ($row['name'] ?? $row['nama_file'] ?? 'lampiran'));
    }

    private static ?bool $pengajuanLogTableExists = null;

    private function hasPengajuanLogTable(): bool
    {
        if (self::$pengajuanLogTableExists !== null) {
            return self::$pengajuanLogTableExists;
        }

        self::$pengajuanLogTableExists = Schema::hasTable('pengajuan_log');

        return self::$pengajuanLogTableExists;
    }

    private function writeReviewLog(
        Pengajuan $pengajuan,
        string $statusLama,
        string $statusBaru,
        ?string $comment,
        ?int $userId
    ): void {
        if (! $this->hasPengajuanLogTable()) {
            return;
        }

        $labelMap = [
            'menunggu'  => 'Menunggu',
            'diproses'  => 'Diproses',
            'disetujui' => 'Disetujui',
            'ditolak'   => 'Ditolak',
        ];

        $judul = 'Status diperbarui: '
            . ($labelMap[$statusLama] ?? $statusLama)
            . ' → '
            . ($labelMap[$statusBaru] ?? $statusBaru);

        $isiParts = [];
        if ($comment !== null && trim($comment) !== '') {
            $isiParts[] = 'Komentar: ' . trim($comment);
        }
        $isi = implode("\n", $isiParts) ?: null;

        $pengajuan->pengajuanLogs()->create([
            'tipe_log'           => 'status',
            'status_lama'        => $statusLama,
            'status_baru'        => $statusBaru,
            'judul_log'          => $judul,
            'isi_log'            => $isi,
            'payload_json'       => [
                'review_comment' => $comment,
                'updated_by'     => $userId,
            ],
            'dibuat_oleh_user_id' => $userId,
        ]);
    }

    private function syncPengajuanFiles(Pengajuan $pengajuan, Request $request): void
    {
        if (! $this->hasPengajuanFileTable()) {
            return;
        }

        if (! $request->has('file_attachments')) {
            return;
        }

        $attachments = $request->input('file_attachments');
        if (! is_array($attachments)) {
            return;
        }

        $payload = [];
        foreach ($attachments as $attachment) {
            if (! is_array($attachment)) {
                continue;
            }

            $name = trim((string) ($attachment['name'] ?? $attachment['nama_file'] ?? ''));
            if ($name === '') {
                continue;
            }

            $path = $this->normalizeAttachmentPath($attachment);

            $payload[] = [
                'nama_file' => $name,
                'path_file' => $path,
                'mime_type' => isset($attachment['type']) && is_string($attachment['type']) ? $attachment['type'] : null,
                'ukuran_file_bytes' => isset($attachment['size']) && is_numeric($attachment['size']) ? (int) $attachment['size'] : null,
                'diunggah_oleh_user_id' => $request->user()?->id,
            ];
        }

        $pengajuan->pengajuanFiles()->delete();

        if (! empty($payload)) {
            $pengajuan->pengajuanFiles()->createMany($payload);
        }
    }

    private function shouldLoadPengajuanRelations(): bool
    {
        return $this->hasPengajuanColumn('unit_prodi_id') && $this->hasPengajuanColumn('mitra_id');
    }

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

    private function normalizeLegacyStatus(string $status): string
    {
        return strtolower(trim($status));
    }

    private function normalizeLegacyKategori(?string $kategori): ?string
    {
        if ($kategori === null || trim($kategori) === '') {
            return null;
        }

        return strtolower(trim($kategori)) === 'eksternal' ? 'Eksternal' : 'Internal';
    }

    private function validateLegacyStore(Request $request): array
    {
        $validated = $request->validate([
            'judul' => ['required', 'string', 'max:255'],
            'deskripsi' => ['nullable', 'string'],
            'pengusul' => ['required', 'string', 'max:200'],
            'tanggal' => ['nullable', 'date'],
            'mitra' => ['required', 'string', 'max:255'],
            'jenis_dokumen' => ['required', 'in:MOU,MOA,IA'],
            'jurusan' => ['nullable', 'string', 'max:150'],
            'kategori' => ['nullable', 'string', 'in:Internal,Eksternal'],
            'tanggal_mulai' => ['nullable', 'date'],
            'tanggal_berakhir' => ['nullable', 'date', 'after_or_equal:tanggal_mulai'],
            'email_pengusul' => ['nullable', 'email', 'max:255'],
            'whatsapp_pengusul' => ['nullable', 'string', 'max:50'],
            'ruang_lingkup' => ['nullable', 'array'],
            'status' => ['nullable', 'in:menunggu,diproses,disetujui,ditolak'],
            'is_from_admin' => ['nullable', 'boolean'],
            'source_role' => ['nullable', 'string', 'max:50'],
            'created_by_user_id' => ['nullable', 'integer', 'exists:users,id'],
            'review_comment' => ['nullable', 'string'],
            'reviewed_at' => ['nullable', 'date'],
            'reviewed_by' => ['nullable', 'string', 'max:200'],
            'file_name' => ['nullable', 'string', 'max:500'],
            'file_attachments' => ['nullable', 'array'],
            'alamat_mitra' => ['nullable', 'string'],
            'negara' => ['nullable', 'string', 'max:100'],
            'email_terverifikasi' => ['nullable', 'boolean'],
        ]);

        $validated['jenis_dokumen'] = strtoupper((string) $validated['jenis_dokumen']);
        $validated['tanggal'] = $validated['tanggal'] ?? now()->toDateString();
        $validated['status'] = $this->normalizeLegacyStatus((string) ($validated['status'] ?? 'menunggu'));
        $validated['kategori'] = $this->normalizeLegacyKategori($validated['kategori'] ?? null);
        $validated['email_terverifikasi'] = (bool) ($validated['email_terverifikasi'] ?? false);

        return $validated;
    }

    private function validateLegacyUpdate(Request $request): array
    {
        $validated = $request->validate([
            'judul' => ['sometimes', 'required', 'string', 'max:255'],
            'deskripsi' => ['nullable', 'string'],
            'pengusul' => ['sometimes', 'required', 'string', 'max:200'],
            'tanggal' => ['nullable', 'date'],
            'mitra' => ['sometimes', 'required', 'string', 'max:255'],
            'jenis_dokumen' => ['sometimes', 'required', 'in:MOU,MOA,IA'],
            'jurusan' => ['nullable', 'string', 'max:150'],
            'kategori' => ['nullable', 'string', 'in:Internal,Eksternal'],
            'tanggal_mulai' => ['nullable', 'date'],
            'tanggal_berakhir' => ['nullable', 'date', 'after_or_equal:tanggal_mulai'],
            'email_pengusul' => ['nullable', 'email', 'max:255'],
            'whatsapp_pengusul' => ['nullable', 'string', 'max:50'],
            'ruang_lingkup' => ['nullable', 'array'],
            'status' => ['nullable', 'in:menunggu,diproses,disetujui,ditolak'],
            'is_from_admin' => ['nullable', 'boolean'],
            'source_role' => ['nullable', 'string', 'max:50'],
            'created_by_user_id' => ['nullable', 'integer', 'exists:users,id'],
            'review_comment' => ['nullable', 'string'],
            'reviewed_at' => ['nullable', 'date'],
            'reviewed_by' => ['nullable', 'string', 'max:200'],
            'file_name' => ['nullable', 'string', 'max:500'],
            'file_attachments' => ['nullable', 'array'],
            'alamat_mitra' => ['nullable', 'string'],
            'negara' => ['nullable', 'string', 'max:100'],
            'email_terverifikasi' => ['nullable', 'boolean'],
        ]);

        if (array_key_exists('jenis_dokumen', $validated)) {
            $validated['jenis_dokumen'] = strtoupper((string) $validated['jenis_dokumen']);
        }

        if (array_key_exists('status', $validated)) {
            $validated['status'] = $this->normalizeLegacyStatus((string) $validated['status']);
        }

        if (array_key_exists('kategori', $validated)) {
            $validated['kategori'] = $this->normalizeLegacyKategori($validated['kategori']);
        }

        if (array_key_exists('email_terverifikasi', $validated)) {
            $validated['email_terverifikasi'] = (bool) $validated['email_terverifikasi'];
        }

        return $validated;
    }

    private function legacyPayloadFromRequest(Request $request): array
    {
        $currentUser = $request->user();
        $defaultSourceRole = $currentUser?->role ? (string) $currentUser->role : 'internal';

        $legacyPayload = [
            'status' => $request->input('status_pengajuan', $request->input('status', 'menunggu')),
            'review_comment' => $request->input('review_comment', null),
            'reviewed_at' => $request->input('reviewed_at', null),
            'reviewed_by' => $request->input('reviewed_by', null),
            'is_from_admin' => $request->input('is_from_admin', false),
            'source_role' => $request->input('source_role', $defaultSourceRole),
            'created_by_user_id' => $request->input('created_by_user_id', $currentUser?->id),
            'email_terverifikasi' => $request->filled('email_terverifikasi_pada')
                ? true
                : $request->input('email_terverifikasi', false),
        ];

        $conditionalFields = [
            'judul' => 'judul_pengajuan',
            'deskripsi' => 'deskripsi_pengajuan',
            'pengusul' => 'nama_pengusul',
            'tanggal' => 'diajukan_pada',
            'mitra' => 'mitra',
            'jenis_dokumen' => 'jenis_dokumen',
            'jurusan' => 'jurusan',
            'kategori' => 'kategori',
            'tanggal_mulai' => 'tanggal_mulai',
            'tanggal_berakhir' => 'tanggal_berakhir',
            'email_pengusul' => 'email_pengusul',
            'whatsapp_pengusul' => 'whatsapp_pengusul',
            'ruang_lingkup' => 'ruang_lingkup',
            'file_name' => 'file_name',
            'file_attachments' => 'file_attachments',
            'alamat_mitra' => 'alamat_mitra',
            'negara' => 'negara',
        ];

        foreach ($conditionalFields as $legacyKey => $requestKey) {
            if ($request->has($requestKey)) {
                $legacyPayload[$legacyKey] = $request->input($requestKey);
            }
        }

        if (array_key_exists('tanggal', $legacyPayload)) {
            if (is_string($legacyPayload['tanggal']) && trim($legacyPayload['tanggal']) !== '') {
                $legacyPayload['tanggal'] = trim($legacyPayload['tanggal']);
            } else {
                $legacyPayload['tanggal'] = null;
            }
        }

        return $legacyPayload;
    }

    public function index(Request $request): Response
    {
        $query = Pengajuan::query();

        if ($this->shouldLoadPengajuanRelations()) {
            $query->with(['unitProdi:id,nama,jenis_node,kategori_unit', 'mitra:id,nama_mitra,kategori_mitra,negara,alamat,email_mitra,telepon_mitra', 'dokumenFiles']);
        }

        if ($request->filled('status_pengajuan')) {
            $statusColumn = $this->hasPengajuanColumn('status_pengajuan') ? 'status_pengajuan' : 'status';
            $query->where($statusColumn, $request->string('status_pengajuan')->toString());
        }

        if ($request->filled('jenis_dokumen')) {
            $query->where('jenis_dokumen', strtoupper($request->string('jenis_dokumen')->toString()));
        }

        if ($request->filled('search')) {
            $keyword = strtolower($request->string('search')->trim()->toString());
            $nomorColumn = $this->hasPengajuanColumn('nomor_pengajuan') ? 'nomor_pengajuan' : null;
            $namaColumn = $this->hasPengajuanColumn('nama_pengusul') ? 'nama_pengusul' : 'pengusul';
            $judulColumn = $this->hasPengajuanColumn('judul_pengajuan') ? 'judul_pengajuan' : 'judul';

            $query->where(function ($builder) use ($keyword, $nomorColumn, $namaColumn, $judulColumn) {
                if ($nomorColumn) {
                    $builder->whereRaw("LOWER({$nomorColumn}) LIKE ?", ['%' . $keyword . '%']);
                }

                $builder
                    ->orWhereRaw("LOWER({$namaColumn}) LIKE ?", ['%' . $keyword . '%'])
                    ->orWhereRaw("LOWER({$judulColumn}) LIKE ?", ['%' . $keyword . '%']);
            });
        }

        $orderColumn = $this->hasPengajuanColumn('diajukan_pada')
            ? 'diajukan_pada'
            : ($this->hasPengajuanColumn('tanggal') ? 'tanggal' : 'created_at');

        $data = $query->orderByDesc($orderColumn)->paginate((int) $request->integer('per_page', 20));

        return response([
            'success' => true,
            'data' => $data,
            'message' => 'Pengajuan retrieved successfully',
        ]);
    }

    public function show(Pengajuan $pengajuan): Response
    {
        if ($this->shouldLoadPengajuanRelations()) {
            $pengajuan->load(['unitProdi:id,nama,jenis_node,kategori_unit', 'mitra:id,nama_mitra,kategori_mitra,negara,alamat,email_mitra,telepon_mitra']);
        }

        return response([
            'success' => true,
            'data' => $pengajuan,
            'message' => 'Pengajuan retrieved successfully',
        ]);
    }

    public function store(Request $request): Response
    {
        if (! $this->useNewPengajuanSchema()) {
            $legacyRequest = new Request($this->legacyPayloadFromRequest($request));
            $legacyRequest->setUserResolver(fn () => $request->user());
            $validated = $this->validateLegacyStore($legacyRequest);

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

        $ruangLingkupIds = $this->normalizeRuangLingkupIds($request);

        $validated = $request->validate([
            'nomor_pengajuan' => ['required', 'string', 'max:50', 'unique:pengajuan_v2,nomor_pengajuan'],
            'user_pengusul_id' => ['nullable', 'integer', 'exists:users,id'],
            'nama_pengusul' => ['required', 'string', 'max:200'],
            'jabatan_pengusul' => ['nullable', 'string', 'max:150'],
            'email_pengusul' => ['nullable', 'email', 'max:255'],
            'whatsapp_pengusul' => ['nullable', 'string', 'max:50'],
            'unit_prodi_id' => ['nullable', 'integer', 'exists:master_unit_prodi,id'],
            'mitra_id' => ['nullable', 'integer', 'exists:master_mitra,id'],
            'nama_mitra' => ['nullable', 'string', 'max:255'],
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

        if ($this->hasPengajuanColumn('file_name') && $request->has('file_name')) {
            $validated['file_name'] = (string) $request->input('file_name', '');
        }

        if ($this->hasPengajuanColumn('file_attachments') && $request->has('file_attachments')) {
            $validated['file_attachments'] = $request->input('file_attachments');
        }

        try {
            $pengajuan = Pengajuan::create($validated);

            try {
                $this->syncPengajuanFiles($pengajuan, $request);
            } catch (\Throwable $ignored) {
                // Do not fail main pengajuan creation when optional attachment sync is incompatible.
            }
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

        if (! $this->useNewPengajuanSchema()) {
            $legacyRequest = new Request($this->legacyPayloadFromRequest($request));
            $legacyRequest->setUserResolver(fn () => $request->user());
            $validated = $this->validateLegacyUpdate($legacyRequest);

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

        $ruangLingkupIds = $this->normalizeRuangLingkupIds($request);

        $validated = $request->validate([
            'nomor_pengajuan' => ['sometimes', 'required', 'string', 'max:50', 'unique:pengajuan_v2,nomor_pengajuan,' . $pengajuan->id],
            'user_pengusul_id' => ['nullable', 'integer', 'exists:users,id'],
            'nama_pengusul' => ['sometimes', 'required', 'string', 'max:200'],
            'jabatan_pengusul' => ['nullable', 'string', 'max:150'],
            'email_pengusul' => ['nullable', 'email', 'max:255'],
            'whatsapp_pengusul' => ['nullable', 'string', 'max:50'],
            'unit_prodi_id' => ['nullable', 'integer', 'exists:master_unit_prodi,id'],
            'mitra_id' => ['nullable', 'integer', 'exists:master_mitra,id'],
            'nama_mitra' => ['nullable', 'string', 'max:255'],
            'judul_pengajuan' => ['sometimes', 'required', 'string', 'max:255'],
            'deskripsi_pengajuan' => ['nullable', 'string'],
            'jenis_dokumen' => ['sometimes', 'required', 'in:MOU,MOA,IA'],
            'kategori_pengajuan' => ['nullable', 'in:internal,eksternal'],
            'tanggal_mulai' => ['nullable', 'date'],
            'tanggal_berakhir' => ['nullable', 'date', 'after_or_equal:tanggal_mulai'],
            'status_pengajuan' => ['nullable', 'in:menunggu,diproses,disetujui,ditolak'],
            'catatan' => ['nullable', 'string'],
            'keputusan' => ['nullable', 'string'],
            'diajukan_pada' => ['nullable', 'date'],
            'email_terverifikasi_pada' => ['nullable', 'date'],
        ]);

        if (array_key_exists('jenis_dokumen', $validated)) {
            $validated['jenis_dokumen'] = strtoupper((string) $validated['jenis_dokumen']);
        }

        if ($request->has('ruang_lingkup_ids')) {
            $validated['ruang_lingkup_ids'] = $ruangLingkupIds;
        }

        if ($this->hasPengajuanColumn('file_name') && $request->has('file_name')) {
            $validated['file_name'] = (string) $request->input('file_name', '');
        }

        if ($this->hasPengajuanColumn('file_attachments') && $request->has('file_attachments')) {
            $validated['file_attachments'] = $request->input('file_attachments');
        }

        $statusColumn = $this->hasPengajuanColumn('status_pengajuan') ? 'status_pengajuan' : 'status';
        $statusLama = (string) ($pengajuan->{$statusColumn} ?? 'menunggu');
        $statusBaru = (string) ($validated[$statusColumn] ?? $statusLama);

        try {
            $pengajuan->update($validated);

            // Write to pengajuan_log when status changes.
            if ($statusBaru !== $statusLama) {
                try {
                    $this->writeReviewLog(
                        $pengajuan,
                        $statusLama,
                        $statusBaru,
                        $request->input('review_comment') ?? $request->input('catatan'),
                        $request->user()?->id
                    );
                } catch (\Throwable $exception) {
                    report($exception);
                }
            }

            try {
                $this->syncPengajuanFiles($pengajuan, $request);
            } catch (\Throwable $ignored) {
                // Do not fail main pengajuan update when optional attachment sync is incompatible.
            }
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
