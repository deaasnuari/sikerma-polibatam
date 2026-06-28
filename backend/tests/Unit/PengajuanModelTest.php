<?php

namespace Tests\Unit;

use App\Models\CatatanAdmin;
use App\Models\MasterMitra;
use App\Models\MasterUnitProdi;
use App\Models\Pengajuan;
use App\Models\PengajuanAktivitas;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PengajuanModelTest extends TestCase
{
    use RefreshDatabase;

    private function buatPengajuan(array $override = []): Pengajuan
    {
        return Pengajuan::create(array_merge([
            'nama_pengusul'    => 'Dr. Andi',
            'judul_pengajuan'  => 'Kerja Sama Penelitian',
            'jenis_dokumen'    => 'MOU',
            'status_pengajuan' => 'menunggu',
            'ruang_lingkup_ids' => [],
        ], $override));
    }

    public function test_pengajuan_dapat_dibuat(): void
    {
        $pengajuan = $this->buatPengajuan();

        $this->assertDatabaseHas('pengajuan_v2', [
            'nama_pengusul'   => 'Dr. Andi',
            'jenis_dokumen'   => 'MOU',
            'status_pengajuan' => 'menunggu',
        ]);
        $this->assertNotNull($pengajuan->id);
    }

    public function test_status_default_adalah_menunggu(): void
    {
        $pengajuan = $this->buatPengajuan();

        $this->assertEquals('menunggu', $pengajuan->status_pengajuan);
    }

    public function test_pengajuan_dapat_update_status(): void
    {
        $pengajuan = $this->buatPengajuan();
        $pengajuan->update(['status_pengajuan' => 'diproses']);

        $this->assertEquals('diproses', $pengajuan->fresh()->status_pengajuan);
    }

    public function test_ruang_lingkup_ids_disimpan_sebagai_array(): void
    {
        $pengajuan = $this->buatPengajuan(['ruang_lingkup_ids' => [1, 2, 3]]);

        $fresh = $pengajuan->fresh();
        $this->assertIsArray($fresh->ruang_lingkup_ids);
        $this->assertCount(3, $fresh->ruang_lingkup_ids);
    }

    public function test_relasi_ke_unit_prodi(): void
    {
        $unit = MasterUnitProdi::create([
            'jenis_node' => 'unit',
            'kategori_unit' => 'jurusan',
            'nama' => 'Teknik Informatika',
            'aktif' => true,
        ]);

        $pengajuan = $this->buatPengajuan(['unit_prodi_id' => $unit->id]);

        $this->assertEquals('Teknik Informatika', $pengajuan->unitProdi->nama);
    }

    public function test_relasi_ke_master_mitra(): void
    {
        $mitra = MasterMitra::create([
            'nama_mitra' => 'PT Teknologi',
            'aktif' => true,
        ]);

        $pengajuan = $this->buatPengajuan(['mitra_id' => $mitra->id]);

        $this->assertEquals('PT Teknologi', $pengajuan->mitra->nama_mitra);
    }

    public function test_relasi_aktivitas(): void
    {
        $pengajuan = $this->buatPengajuan();

        PengajuanAktivitas::create([
            'pengajuan_id'    => $pengajuan->id,
            'judul'           => 'Workshop Kolaborasi',
            'jenis_aktivitas' => 'Workshop',
            'tanggal'         => '2026-06-01',
            'status'          => 'direncanakan',
        ]);

        $this->assertCount(1, $pengajuan->aktivitas);
    }

    public function test_relasi_catatan_admin(): void
    {
        $user      = User::factory()->admin()->create();
        $pengajuan = $this->buatPengajuan();

        CatatanAdmin::create([
            'pengajuan_id'        => $pengajuan->id,
            'teks'                => 'Perlu dilengkapi',
            'dibuat_oleh_user_id' => $user->id,
        ]);

        $this->assertCount(1, CatatanAdmin::where('pengajuan_id', $pengajuan->id)->get());
    }

    public function test_nomor_pengajuan_dapat_diset(): void
    {
        $pengajuan = $this->buatPengajuan(['nomor_pengajuan' => 'PMH-001']);

        $this->assertEquals('PMH-001', $pengajuan->nomor_pengajuan);
    }

    public function test_tahapan_riwayat_disimpan_sebagai_array(): void
    {
        $riwayat = [
            ['stage' => 'Pengajuan Awal', 'group' => 'todo', 'changed_at' => now()->toISOString()],
        ];

        $pengajuan = $this->buatPengajuan(['tahapan_riwayat' => $riwayat]);

        $this->assertIsArray($pengajuan->fresh()->tahapan_riwayat);
        $this->assertEquals('Pengajuan Awal', $pengajuan->fresh()->tahapan_riwayat[0]['stage']);
    }
}
