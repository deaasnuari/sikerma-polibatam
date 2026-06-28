<?php

namespace Tests\Feature;

use App\Models\CatatanAdmin;
use App\Models\Pengajuan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CatatanAdminTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->admin()->create();
    }

    private function buatPengajuan(): Pengajuan
    {
        return Pengajuan::create([
            'nama_pengusul'    => 'Dr. Test',
            'judul_pengajuan'  => 'Test Pengajuan',
            'jenis_dokumen'    => 'MOU',
            'status_pengajuan' => 'menunggu',
            'ruang_lingkup_ids' => [],
        ]);
    }

    private function buatCatatan(int $pengajuanId, int $userId, string $teks = 'Catatan test'): CatatanAdmin
    {
        return CatatanAdmin::create([
            'pengajuan_id'        => $pengajuanId,
            'teks'                => $teks,
            'dibuat_oleh_user_id' => $userId,
        ]);
    }

    // ------------------------------------------------------------------
    // index
    // ------------------------------------------------------------------

    public function test_daftar_catatan_berhasil_dengan_pengajuan_id(): void
    {
        $admin     = $this->admin();
        $pengajuan = $this->buatPengajuan();
        $this->buatCatatan($pengajuan->id, $admin->id, 'Catatan Pertama');
        $this->buatCatatan($pengajuan->id, $admin->id, 'Catatan Kedua');

        $response = $this->actingAs($admin)->getJson("/api/catatan-admin?pengajuan_id={$pengajuan->id}");

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(2, 'data');
    }

    public function test_daftar_catatan_gagal_tanpa_pengajuan_id(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)->getJson('/api/catatan-admin')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['pengajuan_id']);
    }

    public function test_daftar_catatan_gagal_pengajuan_tidak_ada(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)->getJson('/api/catatan-admin?pengajuan_id=9999')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['pengajuan_id']);
    }

    public function test_daftar_catatan_hanya_untuk_pengajuan_dimaksud(): void
    {
        $admin     = $this->admin();
        $pengajuan1 = $this->buatPengajuan();
        $pengajuan2 = $this->buatPengajuan();

        $this->buatCatatan($pengajuan1->id, $admin->id, 'Catatan P1');
        $this->buatCatatan($pengajuan2->id, $admin->id, 'Catatan P2');

        $response = $this->actingAs($admin)->getJson("/api/catatan-admin?pengajuan_id={$pengajuan1->id}");

        $response->assertOk()->assertJsonCount(1, 'data');
        $this->assertEquals('Catatan P1', $response->json('data.0.teks'));
    }

    public function test_daftar_catatan_tanpa_auth_ditolak(): void
    {
        $this->getJson('/api/catatan-admin?pengajuan_id=1')->assertUnauthorized();
    }

    // ------------------------------------------------------------------
    // store
    // ------------------------------------------------------------------

    public function test_buat_catatan_berhasil(): void
    {
        $admin     = $this->admin();
        $pengajuan = $this->buatPengajuan();

        $response = $this->actingAs($admin)->postJson('/api/catatan-admin', [
            'pengajuan_id' => $pengajuan->id,
            'teks'         => 'Dokumen perlu dilengkapi lampiran A',
        ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.teks', 'Dokumen perlu dilengkapi lampiran A')
            ->assertJsonPath('data.pengajuan_id', $pengajuan->id);

        $this->assertDatabaseHas('catatan_admin', [
            'pengajuan_id' => $pengajuan->id,
            'teks'         => 'Dokumen perlu dilengkapi lampiran A',
        ]);
    }

    public function test_buat_catatan_menyimpan_user_pembuat(): void
    {
        $admin     = $this->admin();
        $pengajuan = $this->buatPengajuan();

        $response = $this->actingAs($admin)->postJson('/api/catatan-admin', [
            'pengajuan_id' => $pengajuan->id,
            'teks'         => 'Catatan dari admin',
        ]);

        $response->assertCreated();
        $this->assertEquals($admin->id, $response->json('data.dibuat_oleh_user_id'));
        $this->assertEquals($admin->name, $response->json('data.dibuat_oleh'));
    }

    public function test_buat_catatan_gagal_teks_kosong(): void
    {
        $admin     = $this->admin();
        $pengajuan = $this->buatPengajuan();

        $this->actingAs($admin)->postJson('/api/catatan-admin', [
            'pengajuan_id' => $pengajuan->id,
            'teks'         => '',
        ])->assertUnprocessable()->assertJsonValidationErrors(['teks']);
    }

    public function test_buat_catatan_gagal_teks_terlalu_panjang(): void
    {
        $admin     = $this->admin();
        $pengajuan = $this->buatPengajuan();

        $this->actingAs($admin)->postJson('/api/catatan-admin', [
            'pengajuan_id' => $pengajuan->id,
            'teks'         => str_repeat('x', 2001),
        ])->assertUnprocessable()->assertJsonValidationErrors(['teks']);
    }

    public function test_buat_catatan_gagal_pengajuan_tidak_ada(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)->postJson('/api/catatan-admin', [
            'pengajuan_id' => 9999,
            'teks'         => 'Catatan test',
        ])->assertUnprocessable()->assertJsonValidationErrors(['pengajuan_id']);
    }

    public function test_buat_catatan_tanpa_auth_ditolak(): void
    {
        $this->postJson('/api/catatan-admin', ['pengajuan_id' => 1, 'teks' => 'test'])
            ->assertUnauthorized();
    }

    // ------------------------------------------------------------------
    // update
    // ------------------------------------------------------------------

    public function test_update_catatan_berhasil(): void
    {
        $admin     = $this->admin();
        $pengajuan = $this->buatPengajuan();
        $catatan   = $this->buatCatatan($pengajuan->id, $admin->id, 'Catatan Lama');

        $response = $this->actingAs($admin)->putJson("/api/catatan-admin/{$catatan->id}", [
            'teks' => 'Catatan Diperbarui',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.teks', 'Catatan Diperbarui');

        $this->assertDatabaseHas('catatan_admin', ['id' => $catatan->id, 'teks' => 'Catatan Diperbarui']);
    }

    public function test_update_catatan_gagal_teks_kosong(): void
    {
        $admin     = $this->admin();
        $pengajuan = $this->buatPengajuan();
        $catatan   = $this->buatCatatan($pengajuan->id, $admin->id);

        $this->actingAs($admin)->putJson("/api/catatan-admin/{$catatan->id}", ['teks' => ''])
            ->assertUnprocessable()->assertJsonValidationErrors(['teks']);
    }

    // ------------------------------------------------------------------
    // destroy
    // ------------------------------------------------------------------

    public function test_hapus_catatan_berhasil(): void
    {
        $admin     = $this->admin();
        $pengajuan = $this->buatPengajuan();
        $catatan   = $this->buatCatatan($pengajuan->id, $admin->id, 'Catatan Hapus');

        $this->actingAs($admin)->deleteJson("/api/catatan-admin/{$catatan->id}")
            ->assertOk()->assertJsonPath('success', true);

        $this->assertDatabaseMissing('catatan_admin', ['id' => $catatan->id]);
    }

    public function test_hapus_catatan_tidak_ditemukan(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)->deleteJson('/api/catatan-admin/9999')
            ->assertNotFound();
    }
}
