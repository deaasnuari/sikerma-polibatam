<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

Route::get('/', function () {
    return view('welcome');
});
// db migration dari mysql lama ke postgre baru
Route::get('/test-old-db', function () {

    $data = DB::connection('mysql_old')
                ->table('users')
                ->get();

    return $data;
});
// db ajuan migration dari mysql lama ke postgre baru
Route::get('/migrate-ajuan', function () {

    $data = DB::connection('mysql_old')
                ->table('ajuan')
                ->get();

    foreach ($data as $item) {

    DB::table('ajuan')->updateOrInsert(

        ['no_permohonan' => $item->no_permohonan],

        [
            'nama_pemohon' => $item->nama_pemohon,
            'jabatan_pemohon' => $item->jabatan_pemohon,
            'unit' => $item->unit,
            'prodi' => $item->prodi,
            'email' => $item->email,
            'wa_pemohon' => $item->wa_pemohon,

            'nama_institusi' => $item->nama_institusi,
            'kategori_institusi' => $item->kategori_institusi,
            'negara' => $item->negara,

            'web_institusi' => $item->web_institusi,

            'nama_pic' => $item->nama_pic,
            'jabatan_pic' => $item->jabatan_pic,
            'wa_pic' => $item->wa_pic,
            'email_pic' => $item->email_pic,

            'jenis_ajuan' => $item->jenis_ajuan,
            'ruang_lingkup' => $item->ruang_lingkup,

            'catatan' => $item->catatan,

            'status_ajuan' => $item->status_ajuan,

            'tgl_ajuan' => $item->tgl_ajuan,
            'tgl_verifikasi' => $item->tgl_verifikasi,
            'tgl_disetujui' => $item->tgl_disetujui,
            'tgl_selesai' => $item->tgl_selesai,

            'komentar' => $item->komentar,
        ]
    );
}
    return 'Data ajuan berhasil dipindahkan';
});

// db arsip migration dari mysql lama ke postgre baru
Route::get('/migrate-arsip', function () {

    $data = DB::connection('mysql_old')
                ->table('arsip')
                ->get();

    foreach ($data as $item) {

        DB::table('arsip')->insert([

            'nama_file' => $item->file,
            'jenis' => $item->lingkup,
            'catatan' => $item->mitra,

        ]);
    }

    return 'Data arsip berhasil dipindahkan';
});

// db dokumen dokumen migration dari mysql lama ke postgre baru
Route::get('/migrate-dokumen', function () {

    $data = DB::connection('mysql_old')
                ->table('dokumen')
                ->get();

    foreach ($data as $item) {

        DB::table('dokumen')->updateOrInsert(

            ['no_dokumen' => $item->no_dokumen],

            [
                'mitra'              => $item->mitra,
                'telepon'            => $item->telepon,
                'negara'             => $item->negara,
                'kategori_institusi' => $item->kategori_institusi,
                'jenis_ajuan'        => $item->jenis_ajuan,
                'bidang'             => $item->bidang,
                'unit'               => $item->unit,
                'tahun'              => $item->tahun,
                'tgl_mulai'          => $item->tgl_mulai ?: null,
                'tgl_akhir'          => $item->tgl_akhir ?: null,
                'file'               => $item->file,
            ]
        );
    }

    return 'Data dokumen berhasil dipindahkan: ' . count($data) . ' baris';
});

// db kerjasamapemohon migration dari mysql lama ke postgre baru
Route::get('/migrate-kerjasamapemohon', function () {

    $data = DB::connection('mysql_old')
                ->table('kerjasamapemohon')
                ->get();

    foreach ($data as $item) {

        DB::table('kerjasamapemohon')->updateOrInsert(

            ['Id_Pemohon' => $item->Id_Pemohon],

            [
                'Nama_Pemohon'         => $item->Nama_Pemohon,
                'Jabatan_Pemohon'      => $item->Jabatan_Pemohon,
                'Email_Pemohon'        => $item->Email_Pemohon,
                'Unit_Jurusan_Pemohon' => $item->Unit_Jurusan_Pemohon,
                'No_Wa_Pemohon'        => $item->No_Wa_Pemohon,
                'id_ajuan'             => $item->id_ajuan,
            ]
        );
    }

    return 'Data kerjasamapemohon berhasil dipindahkan: ' . count($data) . ' baris';
});

// db monitoring migration dari mysql lama ke postgre baru
Route::get('/migrate-monitoring', function () {

    $data = DB::connection('mysql_old')
                ->table('monitoring')
                ->get();

    // Truncate dulu karena nomor tidak unique (satu nomor bisa banyak baris)
    DB::table('monitoring')->truncate();

    foreach ($data as $item) {

        DB::table('monitoring')->insert([
            'nomor'          => $item->nomor,
            'mitra'          => $item->mitra,
            'telepon'        => $item->telepon,
            'tgl_mulai'      => $item->tgl_mulai ?: null,
            'tgl_berakhir'   => $item->tgl_berakhir ?: null,
            'unit'           => $item->unit,
            'lingkup'        => $item->lingkup,
            'tingkat'        => $item->tingkat,
            'periode'        => $item->periode,
            'judul'          => $item->judul,
            'manfaat'        => $item->manfaat,
            'bukti'          => $item->bukti,
            'status'         => $item->status,
            'pic'            => $item->pic,
            'tgl_monitoring' => $item->tgl_monitoring,
        ]);
    }

    return 'Data monitoring berhasil dipindahkan: ' . count($data) . ' baris';
});

// db monitoring_unit migration dari mysql lama ke postgre baru
Route::get('/migrate-monitoring-unit', function () {

    $data = DB::connection('mysql_old')
                ->table('monitoring_unit')
                ->get();

    // Truncate dulu karena no_dokumen tidak unique
    DB::table('monitoring_unit')->truncate();

    foreach ($data as $item) {

        DB::table('monitoring_unit')->insert([
            'no_dokumen' => $item->no_dokumen,
            'mitra'      => $item->mitra,
            'telepon'    => $item->telepon,
            'unit'       => $item->unit,
            'judul'      => $item->judul,
            'manfaat'    => $item->manfaat,
            'bukti'      => $item->bukti,
            'tanggal'    => $item->tanggal ?: null,
        ]);
    }

    return 'Data monitoring_unit berhasil dipindahkan: ' . count($data) . ' baris';
});

// db m_moa migration dari mysql lama ke postgre baru
Route::get('/migrate-m-moa', function () {

    $data = DB::connection('mysql_old')
                ->table('m_moa')
                ->get();

    foreach ($data as $item) {

        DB::table('m_moa')->updateOrInsert(

            ['nomor' => $item->nomor],

            [
                'mitra'             => $item->mitra,
                'telepon'           => $item->telepon,
                'lingkup'           => $item->lingkup,
                'tingkat'           => $item->tingkat,
                'judul_kegiatan'    => $item->judul_kegiatan,
                'manfaat'           => $item->manfaat,
                'tgl_mulai'         => $item->tgl_mulai ?: null,
                'tgl_berakhir'      => $item->tgl_berakhir ?: null,
                'unit'              => $item->unit,
                'pic'               => $item->pic,
                'periode'           => $item->periode,
                'status'            => $item->status,
                'tgl_monitoring'    => $item->tgl_monitoring ?: null,
            ]
        );
    }

    return 'Data m_moa berhasil dipindahkan: ' . count($data) . ' baris';
});

// db prodi migration dari mysql lama ke postgre baru
Route::get('/migrate-prodi', function () {

    $data = DB::connection('mysql_old')
                ->table('prodi')
                ->get();

    foreach ($data as $item) {

        DB::table('prodi')->updateOrInsert(

            ['kode' => $item->kode],

            [
                'nama'  => $item->nama,
                'unit'  => $item->unit,
            ]
        );
    }

    return 'Data prodi berhasil dipindahkan: ' . count($data) . ' baris';
});

// db progres migration dari mysql lama ke postgre baru
Route::get('/migrate-progres', function () {

    $data = DB::connection('mysql_old')
                ->table('progres')
                ->get();

    foreach ($data as $item) {

        DB::table('progres')->insert([
            'no_permohonan'  => $item->no_permohonan,
            'status'         => $item->status,
            'tgl'            => $item->tgl,
            'komentar'       => $item->komentar,
        ]);
    }

    return 'Data progres berhasil dipindahkan: ' . count($data) . ' baris';
});

// db rekap migration dari mysql lama ke postgre baru
Route::get('/migrate-rekap', function () {

    $data = DB::connection('mysql_old')
                ->table('rekap')
                ->get();

    foreach ($data as $item) {

        DB::table('rekap')->updateOrInsert(

            ['no_dokumen' => $item->no_dokumen],

            [
                'no_permohonan' => $item->no_permohonan,
                'tahun'         => $item->tahun,
                'tgl_awal'      => $item->tgl_awal,
                'tgl_ahir'      => $item->tgl_ahir,
                'file'          => $item->file,
            ]
        );
    }

    return 'Data rekap berhasil dipindahkan: ' . count($data) . ' baris';
});

// db users migration dari mysql lama ke postgre baru
Route::get('/migrate-users', function () {

    $data = DB::connection('mysql_old')
                ->table('users')
                ->get();

    foreach ($data as $item) {

        DB::table('users')->updateOrInsert(

            ['username' => $item->Username],

            [
                'name'             => $item->Nama,
                'username'         => $item->Username,
                'email'            => strtolower($item->Username) . '@migrated.local',
                'password'         => $item->Password,
                'role'             => strtolower($item->Role),
                'institution_name' => $item->Unit,
                'account_type'     => 'internal',
                'approval_status'  => 'active',
            ]
        );
    }

    return 'Data users berhasil dipindahkan: ' . count($data) . ' baris';
});

// cek tabel mysql yang belum ada di postgre
Route::get('/check-missing-tables', function () {

    $mysqlTables = collect(DB::connection('mysql_old')->select('SHOW TABLES'))
        ->map(fn ($row) => strtolower(array_values((array) $row)[0]))
        ->values();

    $pgsqlTables = collect(DB::connection('pgsql')->select("SELECT table_name FROM information_schema.tables WHERE table_schema='public'"))
        ->pluck('table_name')
        ->map(fn ($name) => strtolower($name))
        ->values();

    $missingInPgsql = $mysqlTables->diff($pgsqlTables)->values();

    return response()->json([
        'mysql_tables' => $mysqlTables,
        'pgsql_tables' => $pgsqlTables,
        'missing_in_pgsql' => $missingInPgsql,
        'missing_count' => $missingInPgsql->count(),
    ]);
});
