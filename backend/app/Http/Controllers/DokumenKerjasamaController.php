<?php

namespace App\Http\Controllers;

use App\Models\DokumenLog;
use App\Models\DokumenKerjasama;
use Carbon\Carbon;
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

    public function renewalRequests(Request $request): Response
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $logs = DokumenLog::query()
            ->with(['dokumen:id,nomor_dokumen,no_dokumen,mitra_id', 'dokumen.mitra:id,nama_mitra'])
            ->where('tipe_log', 'perpanjangan')
            ->orderByDesc('dibuat_pada')
            ->get();

        return response([
            'success' => true,
            'data' => $logs->map(fn (DokumenLog $log) => $this->mapRenewalLogToResponse($log))->values(),
            'message' => 'Renewal requests retrieved successfully',
        ]);
    }

    public function submitRenewalRequest(Request $request, DokumenKerjasama $dokumen_kerjasama): Response
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $validated = $request->validate([
            'tanggal_mulai_baru' => ['required', 'date'],
            'tanggal_berakhir_baru' => ['required', 'date', 'after_or_equal:tanggal_mulai_baru'],
            'catatan_perpanjangan' => ['required', 'string'],
            'bukti_perpanjangan' => ['nullable', 'string', 'max:255'],
            'requester_role' => ['nullable', 'in:admin,internal,eksternal,pimpinan'],
            'notification_href' => ['nullable', 'string', 'max:255'],
        ]);

        $dokumen_kerjasama->loadMissing(['mitra:id,nama_mitra', 'unitProdi:id,nama', 'pengajuan:id,whatsapp_pengusul']);

        $nomorDokumen = $dokumen_kerjasama->nomor_dokumen ?: $dokumen_kerjasama->no_dokumen;
        $namaMitra = $dokumen_kerjasama->mitra?->nama_mitra ?: $dokumen_kerjasama->nama_dokumen;
        $nomorTelepon = $dokumen_kerjasama->pengajuan?->whatsapp_pengusul;
        $unitNama = $dokumen_kerjasama->unitProdi?->nama;
        $lingkup = is_array($dokumen_kerjasama->ruang_lingkup_ids)
            ? implode(', ', array_map(static fn ($id) => (string) $id, $dokumen_kerjasama->ruang_lingkup_ids))
            : null;

        $startRenewal = Carbon::parse($validated['tanggal_mulai_baru']);
        $month = (int) $startRenewal->format('n');
        $quarter = (int) floor(($month - 1) / 3) + 1;
        $quarterLabels = [1 => 'Jan-Mar', 2 => 'Apr-Jun', 3 => 'Jul-Sep', 4 => 'Okt-Des'];
        $periodeLabel = sprintf('Triwulan %d(%s)', $quarter, $quarterLabels[$quarter] ?? 'Jan-Mar');

        $log = DokumenLog::create([
            'dokumen_id' => $dokumen_kerjasama->id,
            'tipe_log' => 'perpanjangan',
            'judul_log' => 'Pengajuan perpanjangan dokumen',
            'isi_log' => 'Permintaan perpanjangan diajukan dari modul Monitoring Kerjasama.',
            // Simpan field perpanjangan di kolom terpisah, bukan digabung ke payload_json.
            'payload_json' => null,
            // Struktur lama JSON monitoring dipisah ke kolom tabel dokumen_log.
            'nomor' => $nomorDokumen,
            'mitra' => $namaMitra,
            'telepon' => $nomorTelepon,
            'tgl_mulai' => $dokumen_kerjasama->tanggal_mulai,
            'tgl_berakhir' => $dokumen_kerjasama->tanggal_berakhir,
            'unit' => $unitNama,
            'lingkup' => $lingkup,
            'tingkat' => 'lokal/wilayah',
            'periode' => $periodeLabel,
            'judul' => $dokumen_kerjasama->judul_dokumen,
            'manfaat' => $validated['catatan_perpanjangan'],
            'bukti' => $validated['bukti_perpanjangan'] ?? null,
            'status' => 'aktif',
            'pic' => null,
            'tgl_monitoring' => Carbon::today(),
            'catatan_perpanjangan' => $validated['catatan_perpanjangan'],
            'bukti_perpanjangan' => $validated['bukti_perpanjangan'] ?? null,
            'tanggal_mulai_perpanjangan' => $validated['tanggal_mulai_baru'],
            'tanggal_berakhir_perpanjangan' => $validated['tanggal_berakhir_baru'],
            'status_perpanjangan' => 'menunggu',
            'requester_role' => $validated['requester_role'] ?? 'admin',
            'notification_href' => $validated['notification_href'] ?? '/admin/monitoring/perpanjangan',
            'dibuat_oleh_user_id' => $request->user()?->id,
        ]);

        $log->load(['dokumen:id,nomor_dokumen,no_dokumen,mitra_id', 'dokumen.mitra:id,nama_mitra']);

        return response([
            'success' => true,
            'data' => $this->mapRenewalLogToResponse($log),
            'message' => 'Renewal request created successfully',
        ], 201);
    }

    public function decideRenewalRequest(Request $request, DokumenLog $dokumen_log): Response
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $validated = $request->validate([
            'status' => ['required', 'in:disetujui,ditolak'],
            'diputuskan_oleh' => ['nullable', 'string', 'max:100'],
        ]);

        if ($dokumen_log->tipe_log !== 'perpanjangan') {
            return response([
                'success' => false,
                'message' => 'Log yang dipilih bukan log perpanjangan.',
            ], 422);
        }

        $dokumen_log->status_perpanjangan = $validated['status'];
        $dokumen_log->diputuskan_pada = Carbon::now();
        $dokumen_log->diputuskan_oleh = $validated['diputuskan_oleh']
            ?? (string) ($request->user()?->name ?: 'Admin SIKERMA');
        $dokumen_log->save();

        if ($validated['status'] === 'disetujui') {
            $dokumen = $dokumen_log->dokumen;

            if ($dokumen) {
                $dokumen->tanggal_mulai = $dokumen_log->tanggal_mulai_perpanjangan;
                $dokumen->tanggal_berakhir = $dokumen_log->tanggal_berakhir_perpanjangan;
                $dokumen->status_siklus = 'active';
                $dokumen->save();
            }
        }

        $dokumen_log->load(['dokumen:id,nomor_dokumen,no_dokumen,mitra_id', 'dokumen.mitra:id,nama_mitra']);

        return response([
            'success' => true,
            'data' => $this->mapRenewalLogToResponse($dokumen_log),
            'message' => 'Renewal request updated successfully',
        ]);
    }

    private function mapRenewalLogToResponse(DokumenLog $log): array
    {
        $dokumen = $log->dokumen;
        $namaMitra = $dokumen?->mitra?->nama_mitra
            ?? $dokumen?->nama_dokumen
            ?? '-';
        $noDokumen = $dokumen?->nomor_dokumen
            ?? $dokumen?->no_dokumen
            ?? '-';

        return [
            'id' => (int) $log->id,
            'kerjasamaId' => (int) $log->dokumen_id,
            'namaMitra' => $namaMitra,
            'noDokumen' => $noDokumen,
            'monitoringFields' => [
                'nomor' => $log->nomor,
                'mitra' => $log->mitra,
                'telepon' => $log->telepon,
                'tgl_mulai' => $log->tgl_mulai?->format('Y-m-d'),
                'tgl_berakhir' => $log->tgl_berakhir?->format('Y-m-d'),
                'unit' => $log->unit,
                'lingkup' => $log->lingkup,
                'tingkat' => $log->tingkat,
                'periode' => $log->periode,
                'judul' => $log->judul,
                'manfaat' => $log->manfaat,
                'bukti' => $log->bukti,
                'status' => $log->status,
                'pic' => $log->pic,
                'tgl_monitoring' => $log->tgl_monitoring?->format('d-m-Y'),
            ],
            'tanggalMulaiBaru' => $log->tanggal_mulai_perpanjangan?->format('Y-m-d') ?? null,
            'tanggalBerakhirBaru' => $log->tanggal_berakhir_perpanjangan?->format('Y-m-d') ?? null,
            'catatan' => $log->catatan_perpanjangan,
            'buktiPerpanjangan' => $log->bukti_perpanjangan,
            'status' => $log->status_perpanjangan ?: 'menunggu',
            'requestedAt' => optional($log->dibuat_pada)->toIso8601String(),
            'requesterRole' => $log->requester_role ?: 'admin',
            'notificationHref' => $log->notification_href ?: '/admin/monitoring/perpanjangan',
            'decidedAt' => optional($log->diputuskan_pada)->toIso8601String(),
            'decidedBy' => $log->diputuskan_oleh,
        ];
    }
}
