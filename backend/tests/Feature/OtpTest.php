<?php

namespace Tests\Feature;

use App\Models\OtpCode;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class OtpTest extends TestCase
{
    use RefreshDatabase;

    // -------------------------------------------------------------------------
    // Helper
    // -------------------------------------------------------------------------

    private function dataOtp(array $override = []): array
    {
        return array_merge([
            'name'                  => 'Sari Dewi',
            'institution_name'      => 'CV Berkah Jaya',
            'negara'                => 'Indonesia',
            'username'              => 'saridewi',
            'email'                 => 'sari@example.com',
            'phone'                 => '082345678901',
            'position'              => 'Manajer',
            'account_type'          => 'Industri',
            'password'              => 'Password@123',
            'password_confirmation' => 'Password@123',
        ], $override);
    }

    private function kirimOtp(): string
    {
        Mail::fake();
        $this->postJson('/api/otp/send', $this->dataOtp());

        return OtpCode::where('email', 'sari@example.com')->value('otp');
    }

    // -------------------------------------------------------------------------
    // Send OTP
    // -------------------------------------------------------------------------

    public function test_kirim_otp_berhasil_dan_tersimpan_di_database(): void
    {
        Mail::fake();

        $response = $this->postJson('/api/otp/send', $this->dataOtp());

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Kode OTP berhasil dikirim ke email Anda. Berlaku selama 5 menit.');

        $this->assertDatabaseHas('otp_codes', [
            'email'   => 'sari@example.com',
            'is_used' => false,
        ]);
    }

    public function test_kirim_otp_gagal_jika_email_sudah_terdaftar(): void
    {
        Mail::fake();
        User::factory()->create(['email' => 'sari@example.com']);

        $response = $this->postJson('/api/otp/send', $this->dataOtp());

        $response->assertStatus(422);
    }

    public function test_kirim_otp_gagal_jika_username_sudah_dipakai(): void
    {
        Mail::fake();
        User::factory()->create(['username' => 'saridewi']);

        $response = $this->postJson('/api/otp/send', $this->dataOtp());

        $response->assertStatus(422);
    }

    public function test_kirim_otp_gagal_jika_field_wajib_kosong(): void
    {
        $response = $this->postJson('/api/otp/send', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'username', 'password']);
    }

    public function test_kirim_otp_kedua_menggantikan_otp_lama(): void
    {
        Mail::fake();

        $this->postJson('/api/otp/send', $this->dataOtp());
        $otpPertama = OtpCode::where('email', 'sari@example.com')->value('otp');

        $this->postJson('/api/otp/send', $this->dataOtp());

        $this->assertDatabaseCount('otp_codes', 1);
        $otpBaru = OtpCode::where('email', 'sari@example.com')->value('otp');
        $this->assertNotNull($otpBaru);
    }

    // -------------------------------------------------------------------------
    // Verify OTP
    // -------------------------------------------------------------------------

    public function test_verifikasi_otp_berhasil_dan_akun_dibuat(): void
    {
        $otp = $this->kirimOtp();

        $response = $this->postJson('/api/otp/verify', [
            'email' => 'sari@example.com',
            'otp'   => $otp,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('user.email', 'sari@example.com')
            ->assertJsonPath('user.role', 'external')
            ->assertJsonPath('user.approval_status', 'active')
            ->assertJsonStructure(['message', 'user' => ['id', 'name', 'email', 'role']]);

        $this->assertDatabaseHas('users', [
            'email' => 'sari@example.com',
            'role'  => 'external',
        ]);
    }

    public function test_verifikasi_otp_menandai_otp_sebagai_sudah_digunakan(): void
    {
        $otp = $this->kirimOtp();

        $this->postJson('/api/otp/verify', [
            'email' => 'sari@example.com',
            'otp'   => $otp,
        ]);

        $this->assertDatabaseHas('otp_codes', [
            'email'   => 'sari@example.com',
            'is_used' => true,
        ]);
    }

    public function test_verifikasi_otp_gagal_jika_kode_salah(): void
    {
        $this->kirimOtp();

        $response = $this->postJson('/api/otp/verify', [
            'email' => 'sari@example.com',
            'otp'   => '000000',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['otp']);
    }

    public function test_verifikasi_otp_gagal_jika_sudah_kedaluwarsa(): void
    {
        $otp = $this->kirimOtp();

        OtpCode::where('email', 'sari@example.com')
            ->update(['expires_at' => now()->subMinutes(10)]);

        $response = $this->postJson('/api/otp/verify', [
            'email' => 'sari@example.com',
            'otp'   => $otp,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['otp']);
    }

    public function test_verifikasi_otp_gagal_jika_digunakan_dua_kali(): void
    {
        $otp = $this->kirimOtp();

        $this->postJson('/api/otp/verify', [
            'email' => 'sari@example.com',
            'otp'   => $otp,
        ]);

        $response = $this->postJson('/api/otp/verify', [
            'email' => 'sari@example.com',
            'otp'   => $otp,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['otp']);
    }
}
