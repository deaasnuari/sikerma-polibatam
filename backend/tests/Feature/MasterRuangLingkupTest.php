<?php

namespace Tests\Feature;

use App\Models\MasterRuangLingkup;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MasterRuangLingkupTest extends TestCase
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

    private function buatRuangLingkup(string $nama = 'Pendidikan', bool $aktif = true): MasterRuangLingkup
    {
        return MasterRuangLingkup::create(['nama_ruang_lingkup' => $nama, 'aktif' => $aktif]);
    }

    // ------------------------------------------------------------------
    // index
    // ------------------------------------------------------------------

    public function test_daftar_ruang_lingkup_berhasil(): void
    {
        $admin = $this->admin();
        $this->buatRuangLingkup('Pendidikan');
        $this->buatRuangLingkup('Penelitian');

        $response = $this->actingAs($admin)->getJson('/api/master/ruang-lingkup');

        $response->assertOk()->assertJsonPath('success', true)->assertJsonCount(2, 'data');
    }

    public function test_filter_ruang_lingkup_aktif(): void
    {
        $admin = $this->admin();
        $this->buatRuangLingkup('Aktif', true);
        $this->buatRuangLingkup('Nonaktif', false);

        $response = $this->actingAs($admin)->getJson('/api/master/ruang-lingkup?aktif=1');

        $response->assertOk()->assertJsonCount(1, 'data');
        $this->assertEquals('Aktif', $response->json('data.0.nama_ruang_lingkup'));
    }

    public function test_cari_ruang_lingkup(): void
    {
        $admin = $this->admin();
        $this->buatRuangLingkup('Pendidikan');
        $this->buatRuangLingkup('Penelitian');
        $this->buatRuangLingkup('Pengabdian Masyarakat');

        $response = $this->actingAs($admin)->getJson('/api/master/ruang-lingkup?search=penelit');

        $response->assertOk()->assertJsonCount(1, 'data');
        $this->assertEquals('Penelitian', $response->json('data.0.nama_ruang_lingkup'));
    }

    // ------------------------------------------------------------------
    // store
    // ------------------------------------------------------------------

    public function test_admin_dapat_buat_ruang_lingkup(): void
    {
        $admin = $this->admin();

        $response = $this->actingAs($admin)->postJson('/api/master/ruang-lingkup', [
            'nama_ruang_lingkup' => 'Teknologi',
            'aktif'              => true,
        ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.nama_ruang_lingkup', 'Teknologi');

        $this->assertDatabaseHas('master_ruang_lingkup', ['nama_ruang_lingkup' => 'Teknologi']);
    }

    public function test_buat_ruang_lingkup_gagal_duplikat(): void
    {
        $admin = $this->admin();
        $this->buatRuangLingkup('Teknologi');

        $this->actingAs($admin)->postJson('/api/master/ruang-lingkup', ['nama_ruang_lingkup' => 'Teknologi'])
            ->assertUnprocessable();
    }

    public function test_buat_ruang_lingkup_gagal_nama_kosong(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)->postJson('/api/master/ruang-lingkup', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['nama_ruang_lingkup']);
    }

    public function test_buat_ruang_lingkup_ditolak_bukan_admin(): void
    {
        $user = $this->internal();

        $this->actingAs($user)->postJson('/api/master/ruang-lingkup', ['nama_ruang_lingkup' => 'Ekonomi'])
            ->assertForbidden();
    }

    // ------------------------------------------------------------------
    // show
    // ------------------------------------------------------------------

    public function test_tampil_ruang_lingkup_berhasil(): void
    {
        $admin = $this->admin();
        $rl    = $this->buatRuangLingkup('Kesehatan');

        $this->actingAs($admin)->getJson("/api/master/ruang-lingkup/{$rl->id}")
            ->assertOk()->assertJsonPath('data.nama_ruang_lingkup', 'Kesehatan');
    }

    // ------------------------------------------------------------------
    // update
    // ------------------------------------------------------------------

    public function test_admin_dapat_update_ruang_lingkup(): void
    {
        $admin = $this->admin();
        $rl    = $this->buatRuangLingkup('Lama');

        $response = $this->actingAs($admin)->putJson("/api/master/ruang-lingkup/{$rl->id}", [
            'nama_ruang_lingkup' => 'Baru',
        ]);

        $response->assertOk()->assertJsonPath('data.nama_ruang_lingkup', 'Baru');
        $this->assertDatabaseHas('master_ruang_lingkup', ['nama_ruang_lingkup' => 'Baru']);
    }

    public function test_update_ke_nama_yang_sama_tidak_error(): void
    {
        $admin = $this->admin();
        $rl    = $this->buatRuangLingkup('Sama');

        $this->actingAs($admin)->putJson("/api/master/ruang-lingkup/{$rl->id}", [
            'nama_ruang_lingkup' => 'Sama',
        ])->assertOk();
    }

    public function test_update_ruang_lingkup_ditolak_bukan_admin(): void
    {
        $user = $this->internal();
        $rl   = $this->buatRuangLingkup();

        $this->actingAs($user)->putJson("/api/master/ruang-lingkup/{$rl->id}", ['nama_ruang_lingkup' => 'Baru'])
            ->assertForbidden();
    }

    // ------------------------------------------------------------------
    // destroy
    // ------------------------------------------------------------------

    public function test_admin_dapat_hapus_ruang_lingkup(): void
    {
        $admin = $this->admin();
        $rl    = $this->buatRuangLingkup('Hapus');

        $this->actingAs($admin)->deleteJson("/api/master/ruang-lingkup/{$rl->id}")
            ->assertOk()->assertJsonPath('success', true);

        $this->assertDatabaseMissing('master_ruang_lingkup', ['id' => $rl->id]);
    }

    public function test_hapus_ruang_lingkup_ditolak_bukan_admin(): void
    {
        $user = $this->internal();
        $rl   = $this->buatRuangLingkup();

        $this->actingAs($user)->deleteJson("/api/master/ruang-lingkup/{$rl->id}")
            ->assertForbidden();
    }
}
