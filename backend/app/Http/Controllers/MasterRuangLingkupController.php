<?php

namespace App\Http\Controllers;

use App\Models\MasterRuangLingkup;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class MasterRuangLingkupController extends Controller
{
    private function ensureAdmin(Request $request): ?Response
    {
        $user = $request->user();
        $rawRole = (string) ($user?->role ?? '');
        $normalizedRole = strtolower(str_replace([' ', '_'], '-', trim($rawRole)));

        if (!in_array($normalizedRole, ['admin', 'admin-humas'], true)) {
            return response([
                'success' => false,
                'message' => 'Only admin can modify master ruang lingkup',
            ], 403);
        }

        return null;
    }

    public function index(Request $request): Response
    {
        $query = MasterRuangLingkup::query();

        if ($request->has('aktif')) {
            $query->where('aktif', $request->boolean('aktif'));
        }

        if ($request->filled('search')) {
            $keyword = strtolower($request->string('search')->trim()->toString());
            $query->whereRaw('LOWER(nama_ruang_lingkup) LIKE ?', ['%' . $keyword . '%']);
        }

        return response([
            'success' => true,
            'data' => $query->orderBy('nama_ruang_lingkup')->get(),
            'message' => 'Master ruang lingkup retrieved successfully',
        ]);
    }

    public function store(Request $request): Response
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $validated = $request->validate([
            'nama_ruang_lingkup' => ['required', 'string', 'max:150', 'unique:master_ruang_lingkup,nama_ruang_lingkup'],
            'aktif' => ['boolean'],
        ]);

        try {
            $ruangLingkup = MasterRuangLingkup::create($validated);
        } catch (QueryException $exception) {
            return response([
                'success' => false,
                'message' => 'Gagal menyimpan master ruang lingkup.',
                'error' => $exception->getMessage(),
            ], 422);
        }

        return response([
            'success' => true,
            'data' => $ruangLingkup,
            'message' => 'Master ruang lingkup created successfully',
        ], 201);
    }

    public function show(MasterRuangLingkup $ruang_lingkup): Response
    {
        return response([
            'success' => true,
            'data' => $ruang_lingkup,
            'message' => 'Master ruang lingkup retrieved successfully',
        ]);
    }

    public function update(Request $request, MasterRuangLingkup $ruang_lingkup): Response
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $validated = $request->validate([
            'nama_ruang_lingkup' => [
                'sometimes',
                'required',
                'string',
                'max:150',
                Rule::unique('master_ruang_lingkup', 'nama_ruang_lingkup')->ignore($ruang_lingkup->id),
            ],
            'aktif' => ['boolean'],
        ]);

        try {
            $ruang_lingkup->update($validated);
        } catch (QueryException $exception) {
            return response([
                'success' => false,
                'message' => 'Gagal mengubah master ruang lingkup.',
                'error' => $exception->getMessage(),
            ], 422);
        }

        return response([
            'success' => true,
            'data' => $ruang_lingkup,
            'message' => 'Master ruang lingkup updated successfully',
        ]);
    }

    public function destroy(Request $request, MasterRuangLingkup $ruang_lingkup): Response
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $ruang_lingkup->delete();

        return response([
            'success' => true,
            'data' => null,
            'message' => 'Master ruang lingkup deleted successfully',
        ]);
    }
}
