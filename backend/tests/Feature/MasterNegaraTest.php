<?php

namespace Tests\Feature;

use App\Models\MasterNegara;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MasterNegaraTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->admin()->create();
    }

    private function internal(): User
    {
        return User::factory()->create(['role' => 'internal']);
    }

    private function buatNegara(string $nama = 'Indonesia', bool $aktif = true): MasterNegara
    {
        return MasterNegara::create(['nama_negara' => $nama, 'aktif' => $aktif]);
    }

    // ------------------------------------------------------------------
    // index
    // ------------------------------------------------------------------

    public function test_daftar_negara_berhasil(): void
    {
        $admin = $this->admin();
        $this->buatNegara('Indonesia');
        $this->buatNegara('Jepang');

        $response = $this->actingAs($admin)->getJson('/api/master/negara');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(2, 'data');
    }

    public function test_filter_negara_aktif(): void
    {
        $admin = $this->admin();
        $this->buatNegara('Indonesia', true);
        $this->buatNegara('Jepang', false);

        $response = $this->actingAs($admin)->getJson('/api/master/negara?aktif=1');

        $response->assertOk()->assertJsonCount(1, 'data');
        $this->assertEquals('Indonesia', $response->json('data.0.nama_negara'));
    }

    public function test_cari_negara_berhasil(): void
    {
        $admin = $this->admin();
        $this->buatNegara('Indonesia');
        $this->buatNegara('Inggris');
        $this->buatNegara('Malaysia');

        $response = $this->actingAs($admin)->getJson('/api/master/negara?search=indo');

        $response->assertOk()->assertJsonCount(1, 'data');
        $this->assertEquals('Indonesia', $response->json('data.0.nama_negara'));
    }

    // ------------------------------------------------------------------
    // store
    // ------------------------------------------------------------------

    public function test_admin_dapat_buat_negara(): void
    {
        $admin = $this->admin();

        $response = $this->actingAs($admin)->postJson('/api/master/negara', [
            'nama_negara' => 'Thailand',
            'aktif'       => true,
        ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.nama_negara', 'Thailand');

        $this->assertDatabaseHas('master_negara', ['nama_negara' => 'Thailand']);
    }

    public function test_buat_negara_gagal_duplikat(): void
    {
        $admin = $this->admin();
        $this->buatNegara('Thailand');

        $this->actingAs($admin)->postJson('/api/master/negara', ['nama_negara' => 'Thailand'])
            ->assertUnprocessable();
    }

    public function test_buat_negara_gagal_nama_kosong(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)->postJson('/api/master/negara', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['nama_negara']);
    }

    public function test_buat_negara_ditolak_bukan_admin(): void
    {
        $user = $this->internal();

        $this->actingAs($user)->postJson('/api/master/negara', ['nama_negara' => 'Vietnam'])
            ->assertForbidden();
    }

    // ------------------------------------------------------------------
    // show
    // ------------------------------------------------------------------

    public function test_tampil_negara_berhasil(): void
    {
        $admin  = $this->admin();
        $negara = $this->buatNegara('Filipina');

        $this->actingAs($admin)->getJson("/api/master/negara/{$negara->id}")
            ->assertOk()
            ->assertJsonPath('data.nama_negara', 'Filipina');
    }

    public function test_tampil_negara_tidak_ditemukan(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)->getJson('/api/master/negara/9999')
            ->assertNotFound();
    }

    // ------------------------------------------------------------------
    // update
    // ------------------------------------------------------------------

    public function test_admin_dapat_update_negara(): void
    {
        $admin  = $this->admin();
        $negara = $this->buatNegara('Korea');

        $response = $this->actingAs($admin)->putJson("/api/master/negara/{$negara->id}", [
            'nama_negara' => 'Korea Selatan',
        ]);

        $response->assertOk()->assertJsonPath('data.nama_negara', 'Korea Selatan');
        $this->assertDatabaseHas('master_negara', ['nama_negara' => 'Korea Selatan']);
    }

    public function test_update_negara_ditolak_bukan_admin(): void
    {
        $user   = $this->internal();
        $negara = $this->buatNegara('Korea');

        $this->actingAs($user)->putJson("/api/master/negara/{$negara->id}", ['nama_negara' => 'Korea Selatan'])
            ->assertForbidden();
    }

    // ------------------------------------------------------------------
    // destroy
    // ------------------------------------------------------------------

    public function test_admin_dapat_hapus_negara(): void
    {
        $admin  = $this->admin();
        $negara = $this->buatNegara('Laos');

        $this->actingAs($admin)->deleteJson("/api/master/negara/{$negara->id}")
            ->assertOk()->assertJsonPath('success', true);

        $this->assertDatabaseMissing('master_negara', ['id' => $negara->id]);
    }

    public function test_hapus_negara_ditolak_bukan_admin(): void
    {
        $user   = $this->internal();
        $negara = $this->buatNegara('Laos');

        $this->actingAs($user)->deleteJson("/api/master/negara/{$negara->id}")
            ->assertForbidden();
    }

    public function test_tanpa_auth_ditolak(): void
    {
        $this->postJson('/api/master/negara', ['nama_negara' => 'Vietnam'])
            ->assertUnauthorized();
    }
}
