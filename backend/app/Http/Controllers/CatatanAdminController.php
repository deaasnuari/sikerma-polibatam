<?php

namespace App\Http\Controllers;

use App\Models\CatatanAdmin;
use App\Models\Pengajuan;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class CatatanAdminController extends Controller
{
    public function index(Request $request): Response
    {
        $request->validate([
            'pengajuan_id' => ['required', 'integer', Rule::exists((new Pengajuan)->getTable(), 'id')],
        ]);

        $catatan = CatatanAdmin::with('dibuatOleh:id,name')
            ->where('pengajuan_id', (int) $request->input('pengajuan_id'))
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($c) => [
                'id'                  => $c->id,
                'pengajuan_id'        => $c->pengajuan_id,
                'teks'                => $c->teks,
                'dibuat_oleh'         => $c->dibuatOleh?->name ?? 'Admin',
                'dibuat_oleh_user_id' => $c->dibuat_oleh_user_id,
                'created_at'          => $c->created_at?->toISOString(),
                'updated_at'          => $c->updated_at?->toISOString(),
            ]);

        return response([
            'success' => true,
            'data'    => $catatan,
            'message' => 'Catatan admin berhasil diambil',
        ]);
    }

    public function store(Request $request): Response
    {
        $validated = $request->validate([
            'pengajuan_id' => ['required', 'integer', Rule::exists((new Pengajuan)->getTable(), 'id')],
            'teks'         => ['required', 'string', 'max:2000'],
        ]);

        $catatan = CatatanAdmin::create([
            'pengajuan_id'        => $validated['pengajuan_id'],
            'teks'                => $validated['teks'],
            'dibuat_oleh_user_id' => $request->user()?->id,
        ]);

        $catatan->load('dibuatOleh:id,name');

        return response([
            'success' => true,
            'data'    => [
                'id'                  => $catatan->id,
                'pengajuan_id'        => $catatan->pengajuan_id,
                'teks'                => $catatan->teks,
                'dibuat_oleh'         => $catatan->dibuatOleh?->name ?? 'Admin',
                'dibuat_oleh_user_id' => $catatan->dibuat_oleh_user_id,
                'created_at'          => $catatan->created_at?->toISOString(),
                'updated_at'          => $catatan->updated_at?->toISOString(),
            ],
            'message' => 'Catatan berhasil ditambahkan',
        ], 201);
    }

    public function update(Request $request, CatatanAdmin $catatan_admin): Response
    {
        $validated = $request->validate([
            'teks' => ['required', 'string', 'max:2000'],
        ]);

        $catatan_admin->update(['teks' => $validated['teks']]);
        $catatan_admin->load('dibuatOleh:id,name');

        return response([
            'success' => true,
            'data'    => [
                'id'                  => $catatan_admin->id,
                'pengajuan_id'        => $catatan_admin->pengajuan_id,
                'teks'                => $catatan_admin->teks,
                'dibuat_oleh'         => $catatan_admin->dibuatOleh?->name ?? 'Admin',
                'dibuat_oleh_user_id' => $catatan_admin->dibuat_oleh_user_id,
                'created_at'          => $catatan_admin->created_at?->toISOString(),
                'updated_at'          => $catatan_admin->updated_at?->toISOString(),
            ],
            'message' => 'Catatan berhasil diperbarui',
        ]);
    }

    public function destroy(CatatanAdmin $catatan_admin): Response
    {
        $catatan_admin->delete();

        return response([
            'success' => true,
            'data'    => null,
            'message' => 'Catatan berhasil dihapus',
        ]);
    }
}
