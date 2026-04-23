<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class AdminUserController extends Controller
{
    private function allowedRoles(): array
    {
        return ['admin', 'pimpinan', 'internal', 'external'];
    }

    public function index(): JsonResponse
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

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'institution_name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'min:4', 'max:50', 'alpha_dash', 'unique:users,username'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['required', 'string', 'max:30'],
            'position' => ['nullable', 'string', 'max:100'],
            'account_type' => ['nullable', 'string', 'max:100'],
            'approval_status' => ['required', 'string', Rule::in(['active', 'pending', 'rejected'])],
            'role' => ['required', 'string', Rule::in($this->allowedRoles())],
            'password' => ['required', 'string', Password::min(8)],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'institution_name' => $validated['institution_name'],
            'username' => Str::lower($validated['username']),
            'email' => Str::lower($validated['email']),
            'phone' => $validated['phone'],
            'position' => $validated['position'] ?? null,
            'role' => $validated['role'],
            'account_type' => $validated['account_type'] ?? null,
            'approval_status' => $validated['approval_status'],
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'message' => 'User berhasil dibuat.',
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

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'institution_name' => ['sometimes', 'required', 'string', 'max:255'],
            'username' => [
                'sometimes',
                'required',
                'string',
                'min:4',
                'max:50',
                'alpha_dash',
                Rule::unique('users', 'username')->ignore($user->id),
            ],
            'email' => ['sometimes', 'required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => ['sometimes', 'required', 'string', 'max:30'],
            'position' => ['sometimes', 'nullable', 'string', 'max:100'],
            'account_type' => ['sometimes', 'nullable', 'string', 'max:100'],
            'approval_status' => ['sometimes', 'required', 'string', Rule::in(['active', 'pending', 'rejected'])],
            'role' => ['sometimes', 'required', 'string', Rule::in($this->allowedRoles())],
            'password' => ['sometimes', 'required', 'string', Password::min(8)],
        ]);

        if (array_key_exists('username', $validated)) {
            $validated['username'] = Str::lower($validated['username']);
        }

        if (array_key_exists('email', $validated)) {
            $validated['email'] = Str::lower($validated['email']);
        }

        if (array_key_exists('password', $validated)) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'User berhasil diperbarui.',
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

    public function destroy(User $user): JsonResponse
    {
        $user->delete();

        return response()->json([
            'message' => 'User berhasil dihapus.',
        ]);
    }
}
