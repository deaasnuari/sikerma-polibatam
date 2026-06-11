<?php

namespace App\Http\Controllers;

use App\Models\MasterNegara;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class MasterNegaraController extends Controller
{
    private function ensureAdmin(Request $request): ?Response
    {
        $user = $request->user();
        $rawRole = (string) ($user?->role ?? '');
        $normalizedRole = strtolower(str_replace([' ', '_'], '-', trim($rawRole)));

        if (!in_array($normalizedRole, ['admin', 'admin-humas'], true)) {
            return response([
                'success' => false,
                'message' => 'Only admin can modify master negara',
            ], 403);
        }

        return null;
    }

    public function index(Request $request): Response
    {
        $query = MasterNegara::query();

        if ($request->has('aktif')) {
            $query->where('aktif', $request->boolean('aktif'));
        }

        if ($request->filled('search')) {
            $keyword = strtolower($request->string('search')->trim()->toString());
            $query->whereRaw('LOWER(nama_negara) LIKE ?', ['%' . $keyword . '%']);
        }

        return response([
            'success' => true,
            'data' => $query->orderBy('nama_negara')->get(),
            'message' => 'Master negara retrieved successfully',
        ]);
    }

    public function store(Request $request): Response
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $validated = $request->validate([
            'nama_negara' => ['required', 'string', 'max:150', 'unique:master_negara,nama_negara'],
            'aktif' => ['boolean'],
        ]);

        try {
            $negara = MasterNegara::create($validated);
        } catch (QueryException $exception) {
            return response([
                'success' => false,
                'message' => 'Gagal menyimpan master negara.',
                'error' => $exception->getMessage(),
            ], 422);
        }

        return response([
            'success' => true,
            'data' => $negara,
            'message' => 'Master negara created successfully',
        ], 201);
    }

    public function show(MasterNegara $negara): Response
    {
        return response([
            'success' => true,
            'data' => $negara,
            'message' => 'Master negara retrieved successfully',
        ]);
    }

    public function update(Request $request, MasterNegara $negara): Response
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $validated = $request->validate([
            'nama_negara' => [
                'sometimes',
                'required',
                'string',
                'max:150',
                Rule::unique('master_negara', 'nama_negara')->ignore($negara->id),
            ],
            'aktif' => ['boolean'],
        ]);

        try {
            $negara->update($validated);
        } catch (QueryException $exception) {
            return response([
                'success' => false,
                'message' => 'Gagal mengubah master negara.',
                'error' => $exception->getMessage(),
            ], 422);
        }

        return response([
            'success' => true,
            'data' => $negara,
            'message' => 'Master negara updated successfully',
        ]);
    }

    public function destroy(Request $request, MasterNegara $negara): Response
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $negara->delete();

        return response([
            'success' => true,
            'data' => null,
            'message' => 'Master negara deleted successfully',
        ]);
    }
}
