<?php

namespace Tests\Feature;

use App\Models\Pengajuan;
use App\Models\PengajuanAktivitas;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PengajuanAktivitasTest extends TestCase
{
    use RefreshDatabase;

    private function user(): User
    {
        return User::factory()->create(['role' => 'internal']);
    }

    private function buatPengajuan(): Pengajuan
    {
        return Pengajuan::create([
            'nama_pengusul'    => 'Dr. Test',
            'judul_pengajuan'  => 'Kerja Sama Test',
            'jenis_dokumen'    => 'MOU',
            'status_pengajuan' => 'menunggu',
            'ruang_lingkup_ids' => [],
        ]);
    }

    private function dataAktivitas(int $pengajuanId, array $override = []): array
    {
        return array_merge([
            'pengajuan_id'    => $pengajuanId,
            'judul'           => 'Workshop Kolaborasi',
            'jenis_aktivitas' => 'Workshop',
            'tanggal'         => '2026-07-01',
            'status'          => 'direncanakan',
        ], $override);
    }

    // ------------------------------------------------------------------
    // index
    // ------------------------------------------------------------------

    public function test_daftar_aktivitas_berhasil(): void
    {
        $user      = $this->user();
        $pengajuan = $this->buatPengajuan();

        PengajuanAktivitas::create($this->dataAktivitas($pengajuan->id, ['judul' => 'Aktivitas 1']));
        PengajuanAktivitas::create($this->dataAktivitas($pengajuan->id, ['judul' => 'Aktivitas 2']));

        $response = $this->actingAs($user)->getJson('/api/pengajuan-aktivitas');

        $response->assertOk()->assertJsonPath('success', true);
        $this->assertCount(2, $response->json('data'));
    }

    public function test_filter_aktivitas_by_pengajuan_id(): void
    {
        $user       = $this->user();
        $pengajuan1 = $this->buatPengajuan();
        $pengajuan2 = $this->buatPengajuan();

        PengajuanAktivitas::create($this->dataAktivitas($pengajuan1->id, ['judul' => 'Akt P1']));
        PengajuanAktivitas::create($this->dataAktivitas($pengajuan2->id, ['judul' => 'Akt P2']));

        $response = $this->actingAs($user)->getJson("/api/pengajuan-aktivitas?pengajuan_id={$pengajuan1->id}");

        $response->assertOk()->assertJsonCount(1, 'data');
        $this->assertEquals('Akt P1', $response->json('data.0.judul'));
    }

    public function test_daftar_aktivitas_tanpa_auth_ditolak(): void
    {
        $this->getJson('/api/pengajuan-aktivitas')->assertUnauthorized();
    }

    // ------------------------------------------------------------------
    // store
    // ------------------------------------------------------------------

    public function test_buat_aktivitas_berhasil(): void
    {
        $user      = $this->user();
        $pengajuan = $this->buatPengajuan();

        $response = $this->actingAs($user)->postJson('/api/pengajuan-aktivitas', $this->dataAktivitas($pengajuan->id));

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.judul', 'Workshop Kolaborasi');

        $this->assertDatabaseHas('pengajuan_aktivitas', [
            'pengajuan_id' => $pengajuan->id,
            'judul'        => 'Workshop Kolaborasi',
        ]);
    }

    public function test_buat_aktivitas_dengan_semua_field(): void
    {
        $user      = $this->user();
        $pengajuan = $this->buatPengajuan();

        $response = $this->actingAs($user)->postJson('/api/pengajuan-aktivitas', $this->dataAktivitas($pengajuan->id, [
            'jumlah_peserta' => 50,
            'deskripsi'      => 'Workshop intensif selama dua hari',
            'pic_polibatam'  => 'Dr. Budi',
            'pic_mitra'      => 'John Doe',
            'status'         => 'berlangsung',
        ]));

        $response->assertCreated();
        $this->assertEquals(50, $response->json('data.jumlah_peserta'));
        $this->assertEquals('berlangsung', $response->json('data.status'));
    }

    public function test_buat_aktivitas_gagal_pengajuan_tidak_ditemukan(): void
    {
        $user = $this->user();

        $this->actingAs($user)->postJson('/api/pengajuan-aktivitas', $this->dataAktivitas(9999))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['pengajuan_id']);
    }

    public function test_buat_aktivitas_gagal_judul_kosong(): void
    {
        $user      = $this->user();
        $pengajuan = $this->buatPengajuan();

        $this->actingAs($user)->postJson('/api/pengajuan-aktivitas', $this->dataAktivitas($pengajuan->id, ['judul' => '']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['judul']);
    }

    public function test_buat_aktivitas_gagal_status_tidak_valid(): void
    {
        $user      = $this->user();
        $pengajuan = $this->buatPengajuan();

        $this->actingAs($user)->postJson('/api/pengajuan-aktivitas', $this->dataAktivitas($pengajuan->id, ['status' => 'batal']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['status']);
    }

    public function test_buat_aktivitas_gagal_tanggal_tidak_valid(): void
    {
        $user      = $this->user();
        $pengajuan = $this->buatPengajuan();

        $this->actingAs($user)->postJson('/api/pengajuan-aktivitas', $this->dataAktivitas($pengajuan->id, ['tanggal' => 'bukan-tanggal']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['tanggal']);
    }

    // ------------------------------------------------------------------
    // update
    // ------------------------------------------------------------------

    public function test_update_aktivitas_berhasil(): void
    {
        $user      = $this->user();
        $pengajuan = $this->buatPengajuan();
        $aktivitas = PengajuanAktivitas::create($this->dataAktivitas($pengajuan->id));

        $response = $this->actingAs($user)->putJson("/api/pengajuan-aktivitas/{$aktivitas->id}", $this->dataAktivitas($pengajuan->id, [
            'judul'  => 'Workshop Diperbarui',
            'status' => 'selesai',
        ]));

        $response->assertOk()
            ->assertJsonPath('data.judul', 'Workshop Diperbarui')
            ->assertJsonPath('data.status', 'selesai');
    }

    public function test_update_aktivitas_tanpa_auth_ditolak(): void
    {
        $pengajuan = $this->buatPengajuan();
        $aktivitas = PengajuanAktivitas::create($this->dataAktivitas($pengajuan->id));

        $this->putJson("/api/pengajuan-aktivitas/{$aktivitas->id}", $this->dataAktivitas($pengajuan->id))
            ->assertUnauthorized();
    }

    // ------------------------------------------------------------------
    // destroy
    // ------------------------------------------------------------------

    public function test_hapus_aktivitas_berhasil(): void
    {
        $user      = $this->user();
        $pengajuan = $this->buatPengajuan();
        $aktivitas = PengajuanAktivitas::create($this->dataAktivitas($pengajuan->id));

        $this->actingAs($user)->deleteJson("/api/pengajuan-aktivitas/{$aktivitas->id}")
            ->assertOk()->assertJsonPath('success', true);

        $this->assertDatabaseMissing('pengajuan_aktivitas', ['id' => $aktivitas->id]);
    }

    public function test_hapus_aktivitas_tidak_ditemukan(): void
    {
        $user = $this->user();

        $this->actingAs($user)->deleteJson('/api/pengajuan-aktivitas/9999')
            ->assertNotFound();
    }
}
