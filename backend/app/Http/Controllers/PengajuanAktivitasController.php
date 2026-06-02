<?php

namespace App\Http\Controllers;

use App\Models\Pengajuan;
use App\Models\PengajuanAktivitas;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class PengajuanAktivitasController extends Controller
{
    private function baseValidationRules(): array
    {
        return [
            'pengajuan_id' => ['required', 'integer', Rule::exists((new Pengajuan)->getTable(), 'id')],
            'judul' => ['required', 'string', 'max:255'],
            'jenis_aktivitas' => ['required', 'string', 'max:120'],
            'tanggal' => ['required', 'date'],
            'jumlah_peserta' => ['nullable', 'integer', 'min:0'],
            'deskripsi' => ['nullable', 'string'],
            'pic_polibatam' => ['nullable', 'string', 'max:200'],
            'pic_mitra' => ['nullable', 'string', 'max:200'],
            'status' => ['required', Rule::in(['direncanakan', 'berlangsung', 'selesai'])],
        ];
    }

    public function index(Request $request): Response
    {
        $query = PengajuanAktivitas::query()->orderByDesc('tanggal')->orderByDesc('id');

        if ($request->filled('pengajuan_id')) {
            $query->where('pengajuan_id', (int) $request->input('pengajuan_id'));
        }

        return response([
            'success' => true,
            'data' => $query->get(),
            'message' => 'Data aktivitas berhasil diambil',
        ]);
    }

    public function store(Request $request): Response
    {
        $validated = $request->validate($this->baseValidationRules());
        $validated['jumlah_peserta'] = (int) ($validated['jumlah_peserta'] ?? 0);
        $validated['dibuat_oleh_user_id'] = $request->user()?->id;

        $aktivitas = PengajuanAktivitas::create($validated);

        return response([
            'success' => true,
            'data' => $aktivitas,
            'message' => 'Aktivitas berhasil ditambahkan',
        ], 201);
    }

    public function update(Request $request, PengajuanAktivitas $pengajuan_aktivitas): Response
    {
        $validated = $request->validate($this->baseValidationRules());
        $validated['jumlah_peserta'] = (int) ($validated['jumlah_peserta'] ?? 0);

        $pengajuan_aktivitas->update($validated);

        return response([
            'success' => true,
            'data' => $pengajuan_aktivitas,
            'message' => 'Aktivitas berhasil diperbarui',
        ]);
    }

    public function destroy(PengajuanAktivitas $pengajuan_aktivitas): Response
    {
        $pengajuan_aktivitas->delete();

        return response([
            'success' => true,
            'data' => null,
            'message' => 'Aktivitas berhasil dihapus',
        ]);
    }
}
