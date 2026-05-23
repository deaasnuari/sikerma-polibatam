<?php

namespace App\Http\Controllers;

use App\Models\MasterMitra;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    private function toUserPayload(User $user): array
    {
        return [
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
        ];
    }

    private function allowedRoles(): array
    {
        return ['admin', 'pimpinan', 'internal', 'external'];
    }

    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'institution_name' => ['required', 'string', 'max:255'],
            'negara' => ['required', 'string', 'max:100'],
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

        $user = DB::transaction(function () use ($validated) {
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

            MasterMitra::updateOrCreate(
                ['nama_mitra' => $validated['institution_name']],
                [
                    'kategori_mitra' => $validated['account_type'],
                    'negara' => $validated['negara'],
                    'website' => null,
                    'alamat' => null,
                    'email_mitra' => Str::lower($validated['email']),
                    'telepon_mitra' => $validated['phone'],
                    'nama_kontak_utama' => $validated['name'],
                    'jabatan_kontak_utama' => $validated['position'],
                    'email_kontak_utama' => Str::lower($validated['email']),
                    'telepon_kontak_utama' => $validated['phone'],
                    'aktif' => true,
                ]
            );

            return $user;
        });

        return response()->json([
            'message' => 'Registrasi mitra berhasil. Akun Anda sudah aktif dan bisa langsung login.',
            'user' => $this->toUserPayload($user),
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
            ->orWhereRaw('LOWER(username) = ?', [$identifier])
            ->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'email' => ['Email atau username tidak terdaftar.'],
            ]);
        }

        if ($validated['role'] !== $user->role) {
            throw ValidationException::withMessages([
                'role' => ['Role yang dipilih tidak sesuai dengan akun ini.'],
            ]);
        }

        if (! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'password' => ['Password yang Anda masukkan salah.'],
            ]);
        }

        if ($user->role === 'external' && $user->approval_status === 'rejected') {
            throw ValidationException::withMessages([
                'email' => ['Akun mitra Anda ditolak. Silakan hubungi admin kampus.'],
            ]);
        }

        $token = $user->createToken('web-login')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil.',
            'token_type' => 'Bearer',
            'access_token' => $token,
            'user' => $this->toUserPayload($user),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'user' => $this->toUserPayload($user),
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

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user && $user->currentAccessToken()) {
            $user->currentAccessToken()->delete();
        }

        return response()->json([
            'message' => 'Logout berhasil.',
        ]);
    }
}
