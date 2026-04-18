<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    private function allowedRoles(): array
    {
        return ['admin', 'pimpinan', 'internal', 'external'];
    }

    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'institution_name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'min:4', 'max:50', 'alpha_dash', 'unique:users,username'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['required', 'string', 'max:30'],
            'position' => ['required', 'string', 'max:100'],
            'account_type' => ['required', 'string', 'max:100'],
            'role' => ['nullable', 'string', Rule::in(['external'])],
            'password' => ['required', 'string', 'confirmed', Password::min(8)->letters()->mixedCase()->numbers()->symbols()],
        ]);

        $existingUser = User::query()
            ->where('email', Str::lower($validated['email']))
            ->orWhere('username', Str::lower($validated['username']))
            ->first();

        if ($existingUser) {
            throw ValidationException::withMessages([
                'email' => ['Email atau username sudah terdaftar dan tidak bisa dipakai lagi.'],
            ]);
        }

        $user = User::create([
            'name' => $validated['name'],
            'institution_name' => $validated['institution_name'],
            'username' => Str::lower($validated['username']),
            'email' => Str::lower($validated['email']),
            'phone' => $validated['phone'],
            'position' => $validated['position'],
            'role' => 'external',
            'account_type' => $validated['account_type'],
            'approval_status' => 'active',
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'message' => 'Registrasi mitra berhasil. Akun Anda sudah aktif dan bisa langsung login.',
            'user' => [
                'id' => (string) $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'phone' => $user->phone,
                'position' => $user->position,
                'institution_name' => $user->institution_name,
                'account_type' => $user->account_type,
                'approval_status' => $user->approval_status,
                'role' => $user->role,
            ],
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string'],
            'password' => ['required', 'string'],
            'role' => ['required', 'string', Rule::in($this->allowedRoles())],
        ]);

        $identifier = Str::lower(trim($validated['email']));

        $user = User::query()
            ->whereRaw('LOWER(email) = ?', [$identifier])
            ->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Kredensial login tidak valid.'],
            ]);
        }

        if ($validated['role'] !== $user->role) {
            throw ValidationException::withMessages([
                'role' => ['Role yang dipilih tidak sesuai dengan akun ini.'],
            ]);
        }

        if ($user->role === 'external' && $user->approval_status === 'rejected') {
            throw ValidationException::withMessages([
                'email' => ['Akun mitra Anda ditolak. Silakan hubungi admin kampus.'],
            ]);
        }

        return response()->json([
            'message' => 'Login berhasil.',
            'user' => [
                'id' => (string) $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'phone' => $user->phone,
                'position' => $user->position,
                'institution_name' => $user->institution_name,
                'account_type' => $user->account_type,
                'approval_status' => $user->approval_status,
                'role' => $user->role,
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $email = $request->query('email');

        if (! $email) {
            return response()->json([
                'message' => 'Parameter email diperlukan.',
            ], 422);
        }

        $user = User::query()
            ->whereRaw('LOWER(email) = ?', [Str::lower($email)])
            ->first();

        if (! $user) {
            return response()->json([
                'message' => 'User tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'user' => [
                'id' => (string) $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'phone' => $user->phone,
                'position' => $user->position,
                'institution_name' => $user->institution_name,
                'account_type' => $user->account_type,
                'approval_status' => $user->approval_status,
                'role' => $user->role,
            ],
        ]);
    }

    public function users(): JsonResponse
    {
        $users = User::query()
            ->latest('id')
            ->get()
            ->map(fn (User $user) => [
                'id' => (string) $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'phone' => $user->phone,
                'position' => $user->position,
                'institution_name' => $user->institution_name,
                'account_type' => $user->account_type,
                'approval_status' => $user->approval_status,
                'role' => $user->role,
            ]);

        return response()->json([
            'data' => $users,
        ]);
    }

    public function updateApprovalStatus(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'approval_status' => ['required', 'string', Rule::in(['active', 'pending', 'rejected'])],
        ]);

        $user->update([
            'approval_status' => $validated['approval_status'],
        ]);

        return response()->json([
            'message' => 'Status persetujuan akun berhasil diperbarui.',
            'user' => [
                'id' => (string) $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'approval_status' => $user->approval_status,
                'role' => $user->role,
            ],
        ]);
    }

    public function logout(): JsonResponse
    {
        return response()->json([
            'message' => 'Logout berhasil.',
        ]);
    }
}
