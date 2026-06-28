<?php

namespace Tests\Unit;

use App\Models\OtpCode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OtpCodeTest extends TestCase
{
    use RefreshDatabase;

    private function buatOtp(array $override = []): OtpCode
    {
        return OtpCode::create(array_merge([
            'email'      => 'test@example.com',
            'otp'        => '123456',
            'form_data'  => ['type' => 'registration'],
            'expires_at' => now()->addMinutes(5),
            'is_used'    => false,
        ], $override));
    }

    public function test_otp_belum_kedaluwarsa_jika_waktu_masih_ada(): void
    {
        $otp = $this->buatOtp(['expires_at' => now()->addMinutes(5)]);

        $this->assertFalse($otp->isExpired());
    }

    public function test_otp_sudah_kedaluwarsa_jika_waktu_telah_lewat(): void
    {
        $otp = $this->buatOtp(['expires_at' => now()->subSeconds(1)]);

        $this->assertTrue($otp->isExpired());
    }

    public function test_otp_dapat_ditandai_sebagai_sudah_digunakan(): void
    {
        $otp = $this->buatOtp();

        $otp->update(['is_used' => true]);

        $this->assertTrue($otp->fresh()->is_used);
    }

    public function test_form_data_tersimpan_dan_dapat_dibaca_sebagai_array(): void
    {
        $formData = ['name' => 'Budi', 'email' => 'budi@example.com', 'type' => 'registration'];
        $otp = $this->buatOtp(['form_data' => $formData]);

        $this->assertIsArray($otp->fresh()->form_data);
        $this->assertEquals('Budi', $otp->fresh()->form_data['name']);
    }

    public function test_otp_terdiri_dari_6_digit(): void
    {
        $otp = $this->buatOtp(['otp' => str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT)]);

        $this->assertEquals(6, strlen($otp->otp));
        $this->assertMatchesRegularExpression('/^\d{6}$/', $otp->otp);
    }
}
