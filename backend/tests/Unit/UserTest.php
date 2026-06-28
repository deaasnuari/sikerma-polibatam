<?php

namespace Tests\Unit;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_dapat_dibuat_dengan_data_lengkap(): void
    {
        $user = User::factory()->create([
            'name'            => 'Ahmad Fauzi',
            'email'           => 'ahmad@example.com',
            'role'            => 'internal',
            'approval_status' => 'active',
        ]);

        $this->assertDatabaseHas('users', [
            'name'  => 'Ahmad Fauzi',
            'email' => 'ahmad@example.com',
            'role'  => 'internal',
        ]);
        $this->assertNotNull($user->id);
    }

    public function test_password_tidak_muncul_di_array_output(): void
    {
        $user = User::factory()->make();

        $this->assertArrayNotHasKey('password', $user->toArray());
        $this->assertArrayNotHasKey('remember_token', $user->toArray());
    }

    public function test_password_disimpan_dalam_bentuk_hash(): void
    {
        $user = User::factory()->create(['password' => Hash::make('RahasiaKu@99')]);

        $this->assertTrue(Hash::check('RahasiaKu@99', $user->password));
        $this->assertNotEquals('RahasiaKu@99', $user->password);
    }

    public function test_user_dapat_membuat_token_api(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $this->assertNotEmpty($token);
        $this->assertDatabaseHas('personal_access_tokens', [
            'tokenable_id'   => $user->id,
            'tokenable_type' => User::class,
            'name'           => 'test-token',
        ]);
    }

    public function test_factory_state_external_menghasilkan_role_external(): void
    {
        $user = User::factory()->external()->create();

        $this->assertEquals('external', $user->role);
    }

    public function test_factory_state_admin_menghasilkan_role_admin(): void
    {
        $user = User::factory()->admin()->create();

        $this->assertEquals('admin', $user->role);
    }

    public function test_email_disimpan_dalam_huruf_kecil_saat_registrasi(): void
    {
        $response = $this->postJson('/api/register', [
            'name'                  => 'Test User',
            'institution_name'      => 'PT Test',
            'negara'                => 'Indonesia',
            'username'              => 'testuser',
            'email'                 => 'TEST@EXAMPLE.COM',
            'phone'                 => '081234567890',
            'position'              => 'Staff',
            'account_type'          => 'Industri',
            'role'                  => 'external',
            'password'              => 'Password@123',
            'password_confirmation' => 'Password@123',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', ['email' => 'test@example.com']);
    }
}
