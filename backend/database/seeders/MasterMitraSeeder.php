<?php

namespace Database\Seeders;

use App\Models\MasterMitra;
use Illuminate\Database\Seeder;

class MasterMitraSeeder extends Seeder
{
    public function run(): void
    {
        $PT  = 'Perguruan Tinggi';
        $SEK = 'Sekolah/Institusi Pendidikan Lain';
        $PEM = 'Pemerintahan';
        $SWA = 'Swasta/Dunia Usaha dan Dunia Industri (DUDI)';
        $ORG = 'Organisasi Non-Profit / LSM';
        $NAT = 'Nasional';
        $INT = 'Internasional';
        $IDN = 'Indonesia';

        $data = [
            // A - Asosiasi / Akademi / Others
            ['A01', 'ALIANSI JURNALIS INDEPENDEN (AJI) KOTA BATAM', $ORG, $NAT, $IDN],
            ['A02', 'Aerocampus Aquitaine', $PT, $INT, null],
            ['A03', 'Akademi Komunitas Industri Manufaktur Bantaeng', $PT, $NAT, $IDN],
            ['A04', 'Akademi Komunitas Negeri (AKN) Putra Sang Fajar Blitar', $PT, $NAT, $IDN],
            ['A05', 'Akademi Melayu Dermawan', $PT, $NAT, $IDN],
            ['A06', 'Al-Ahmadi Enterpreneur Center', $SWA, $NAT, $IDN],
            ['A07', 'Apotik Mafaza', $SWA, $NAT, $IDN],
            ['A08', 'Asosiasi Logistik & Forwarder Indonesia (ALFI) DPW Jateng Dan DIY', $ORG, $NAT, $IDN],
            ['A09', 'Asosiasi Logistik & Forwarder Indonesia (ALFI) DPW Jawa Timur', $ORG, $NAT, $IDN],
            ['A10', 'Asosiasi Konsultan Pajak Publik Indonesia (AKP2I)', $ORG, $NAT, $IDN],
            ['A11', 'Asosiasi Logistik Indonesia (ALI) Chapter Batam', $ORG, $NAT, $IDN],
            ['A12', 'Asosiasi Pelaku Pariwisata Indonesia (ASPPI) DPD Kepri', $ORG, $NAT, $IDN],
            ['A13', 'Asosiasi Pendidikan Tinggi Informatika Dan Komputer', $ORG, $NAT, $IDN],
            ['A14', 'ASOSIASI PENGURUS PELAKSANA KONTRAKTOR DAN KONTRUKSI NASIONAL (APPEKNAS) DEWAN PENGURUS NASIONAL (DPN)', $ORG, $NAT, $IDN],
            ['A15', 'Asosiasi Penyelenggara Jasa Internet Indonesia (APJII)', $ORG, $NAT, $IDN],
            ['A16', 'Asosiasi Perusahaan Jasa Pengiriman Ekspres, Pos, Dan Logistik Indonesia (ASPERINDO)', $ORG, $NAT, $IDN],
            ['A17', 'Asosiasi Tenaga Ahli Kepabeanan (ATAK) Batam', $ORG, $NAT, $IDN],

            // B
            ['B1',  'Base Incubator', $SWA, $NAT, $IDN],
            ['B2',  'Batam Aero Technic', $SWA, $NAT, $IDN],
            ['B3',  'BPJS Ketenagakerjaan', $PEM, $NAT, $IDN],

            // BA - Bank
            ['BA01', 'Bank BTN Syariah', $SWA, $NAT, $IDN],
            ['BA02', 'PT Bank Negara Indonesia (Persero) Tbk', $SWA, $NAT, $IDN],
            ['BA03', 'PT Bank Mandiri (Persero) Tbk', $SWA, $NAT, $IDN],
            ['BA04', 'PT Bank Rakyat Indonesia (Persero)', $SWA, $NAT, $IDN],
            ['BA05', 'PT Bank Tabungan Negara (Persero) Tbk', $SWA, $NAT, $IDN],
            ['BA06', 'PT BPR Pekanbaru Madani (Perseroda)', $SWA, $NAT, $IDN],
            ['BA07', 'PT Bank KB Indonesia Tbk', $SWA, $NAT, $IDN],
            ['BA08', 'Bank Indonesia', $PEM, $NAT, $IDN],

            // BD - Badan
            ['BD01', 'Badan Riset dan Inovasi Nasional (BRIN)', $PEM, $NAT, $IDN],
            ['BD02', 'BADAN PELINDUNGAN PEKERJA MIGRAN INDONESIA (BP2MI)', $PEM, $NAT, $IDN],
            ['BD03', 'Badan Informasi Geospasial', $PEM, $NAT, $IDN],
            ['BD04', 'Badan Narkotika Nasional Provinsi Kepulauan Riau', $PEM, $NAT, $IDN],
            ['BD05', 'Badan Pendapatan Daerah Kota Batam', $PEM, $NAT, $IDN],
            ['BD06', 'Badan Pengawas Pemilihan Umum Provinsi Kepulauan Riau', $PEM, $NAT, $IDN],
            ['BD07', 'Badan Pengelolaan Pajak Dan Restribusi Daerah', $PEM, $NAT, $IDN],
            ['BD08', 'Badan Pengusahaan Kawasan Perdagangan Bebas Dan Pelabuhan Bebas Batam (BP Batam)', $PEM, $NAT, $IDN],
            ['BD09', 'Badan Penyelenggara Jaminan Produk Halal (BPJPH)', $PEM, $NAT, $IDN],
            ['BD10', 'Badan Pusat Statistik Provinsi Kepulauan Riau', $PEM, $NAT, $IDN],
            ['BD11', 'Badan Syber Dan Sandi Negara Republik Indonesia', $PEM, $NAT, $IDN],
            ['BD12', 'Badan Usaha Milik Desa Bersama Mahkota Bunguran Utara Abadi', $PEM, $NAT, $IDN],
            ['BD13', 'Badan Pengembangan Sumber Daya Manusia Aceh', $PEM, $NAT, $IDN],

            // BL - Balai
            ['BL01', 'BALAI JASA KONSTRUKSI WILAYAH I BANDA ACEH DIREKTORAT JENDERAL BINA KONSTRUKSI KEMENTERIAN PEKERJAAN UMUM DAN PERUMAHAN RAKYAT', $PEM, $NAT, $IDN],
            ['BL02', 'Balai Pengelolaan Pengujian Pendidikan Kementerian Pendidikan, Kebudayaan, Riset Dan Teknologi', $PEM, $NAT, $IDN],
            ['BL03', 'BALAI LABORATORIUM KESEHATAN MASYARAKAT BATAM KEMENTERIAN KESEHATAN REPUBLIK INDONESIA', $PEM, $NAT, $IDN],

            // CV
            ['CV01', 'CV Sindikat Otak Kanan', $SWA, $NAT, $IDN],
            ['CV02', 'CV Wesley Sukses Abadi', $SWA, $NAT, $IDN],
            ['CV03', 'CV Amanah Berkah Bersama', $SWA, $NAT, $IDN],
            ['CV04', 'CV Berkah Gazza Sukses', $SWA, $NAT, $IDN],
            ['CV05', 'CV Carbonex Solusi', $SWA, $NAT, $IDN],
            ['CV06', 'CV Danar Utama', $SWA, $NAT, $IDN],
            ['CV07', 'CV Ebony Karya Mandiri', $SWA, $NAT, $IDN],
            ['CV08', 'CV Multi Art Project (Senja Group)', $SWA, $NAT, $IDN],
            ['CV09', 'CV Multi Kreasindo Mandiri (Arial Studio)', $SWA, $NAT, $IDN],

            // D - Dinas / Direktorat
            ['D01', 'Dinas Pendidikan Provinsi Kepulauan Riau', $PEM, $NAT, $IDN],
            ['D02', 'Dinas Komunikasi dan Informatika Kota Batam', $PEM, $NAT, $IDN],
            ['D03', 'Dinas Pemberdayaan Perempuan, Perlindungan Anak, Pengendalian Penduduk dan KB Kota Batam (DP3AP2KB)', $PEM, $NAT, $IDN],
            ['D04', 'Dinas Energi dan Sumber Daya Mineral', $PEM, $NAT, $IDN],
            ['D05', 'Dinas Perumahan, Kawasan Permukiman Dan Pertamanan Kota Batam (Perkimtan)', $PEM, $NAT, $IDN],
            ['D06', 'Direktorat Akademik Pendidikan Tinggi Vokasi', $PEM, $NAT, $IDN],
            ['D07', 'Direktorat Pembelajaran dan Kemahasiswaan', $PEM, $NAT, $IDN],
            ['D08', 'Direktorat Jenderal Pengelolaan Pembiayaan Dan Risiko', $PEM, $NAT, $IDN],
            ['D09', 'Direktorat Jenderal Aplikasi dan Informatika, Kementerian Komunikasi dan Informatika', $PEM, $NAT, $IDN],
            ['D10', 'Direktorat Jenderal Kerjasama Asean', $PEM, $NAT, $IDN],
            ['D11', 'Direktorat Jenderal Pendidikan Vokasi', $PEM, $NAT, $IDN],
            ['D12', 'Dewan Pimpinan Daerah Forum Pengelola Lembaga Kursus & Pelatihan Provinsi Kepulauan Riau', $ORG, $NAT, $IDN],

            // E
            ['E01', 'Ekspedisi Lion Parcel Taras', $SWA, $NAT, $IDN],

            // F - Forum
            ['F01', 'Forum Human Capital Indonesia', $ORG, $NAT, $IDN],
            ['F02', 'Forum Lembaga Pelatihan Vokasi Indonesia Provinsi Kepulauan Riau', $ORG, $NAT, $IDN],

            // H - Himpunan
            ['H01', 'Himpunan Lembaga Pelatihan Seluruh Indonesia Kepulauan Riau (HILLSI)', $ORG, $NAT, $IDN],
            ['H02', 'Himpunan Pengusaha Muda Indonesia Perguruan Tinggi Kepulauan Riau', $ORG, $NAT, $IDN],
            ['H03', 'Himpunan Kawasan Industri (HKI) Kepulauan Riau', $ORG, $NAT, $IDN],

            // I - Ikatan / Institut
            ['I01', 'Ikatan Alumni Institut Teknologi Bandung', $ORG, $NAT, $IDN],
            ['I02', 'Ikatan Alumni Institut Teknologi Sepuluh Nopember Kepulauan Riau', $ORG, $NAT, $IDN],
            ['I03', 'Ikatan Alumni Universitas Diponegoro', $ORG, $NAT, $IDN],
            ['I04', 'Indonesian Diaspora Network Global (IDN-Global)', $ORG, $NAT, $IDN],
            ['I05', 'Ikatan Akuntan Indonesia Wilayah Kepulauan Riau', $ORG, $NAT, $IDN],
            ['I06', 'Institut Informatika Dan Bisnis Darmajaya', $PT, $NAT, $IDN],
            ['I07', 'Institut Teknologi Dan Bisnis Indobaru Nasional', $PT, $NAT, $IDN],
            ['I08', 'Institut Teknologi Bandung', $PT, $NAT, $IDN],
            ['I09', 'Institut Teknologi Dirgantara Adisutjipto (ITDA)', $PT, $NAT, $IDN],
            ['I10', 'Institut Teknologi Batam', $PT, $NAT, $IDN],
            ['I11', 'Institut Teknologi Perkebunan Pelalawan Indonesia (ITP2I)', $PT, $NAT, $IDN],
            ['I12', 'Institut Teknologi Sepuluh Nopember (ITS)', $PT, $NAT, $IDN],
            ['I13', 'International Talent Circulation Base (Taiwan - Indonesia)', $PT, $INT, null],
            ['I14', 'Ikatan Teknisi Rekayasa & Ahli Teknologi Rekayasa Indonesia (ITERATI)', $ORG, $NAT, $IDN],
            ['I15', 'Institut Teknologi Sumatera (ITERA)', $PT, $NAT, $IDN],

            // J
            ['J01', 'Jaringan Safe Migrant Batam', $ORG, $NAT, $IDN],

            // K
            ['K01', 'Kejaksaan Negeri Batam', $PEM, $NAT, $IDN],
            ['K02', 'Komisi Nasional Disabilitas', $PEM, $NAT, $IDN],
            ['K03', 'Komunitas Game Developer Batam', $ORG, $NAT, $IDN],
            ['K04', 'Komunitas Pengusaha Tangan Di Atas (Tda) Kota Batam', $ORG, $NAT, $IDN],
            ['K05', 'Koperasi Jasa Kreasi Dinamika Harmoni', $SWA, $NAT, $IDN],
            ['K06', 'Koperasi Konsumen Politeknik Negeri Batam', $SWA, $NAT, $IDN],
            ['K07', 'Koperasi Rumah Bungkus Radja Isha', $SWA, $NAT, $IDN],
            ['K08', 'Klinik Utama Spesialis Biostem', $SWA, $NAT, $IDN],
            ['K09', 'Kelompok Sadar Wisata (Pokdarwis) Pandang Tak Jemu', $ORG, $NAT, $IDN],

            // KA - Kantor
            ['KA01', 'Kantor Akuntan Publik Hendrawinata Hanny Erwin & Sumargo', $SWA, $NAT, $IDN],
            ['KA02', 'Kantor Bahasa Provinsi Kepulauan Riau', $PEM, $NAT, $IDN],
            ['KA03', 'Kantor Wilayah Badan Pertanahan Nasional Provinsi Kepulauan Riau', $PEM, $NAT, $IDN],
            ['KA04', 'Kantor Wilayah DJP Kepulauan Riau', $PEM, $NAT, $IDN],
            ['KA05', 'Kantor Wilayah Kementerian Agama Provinsi Kepulauan Riau', $PEM, $NAT, $IDN],
            ['KA06', 'Kantor Wilayah Kementerian Hukum Kepulauan Riau', $PEM, $NAT, $IDN],

            // L - Lembaga (domestic)
            ['L01', 'Lembaga Pengkajian Pangan, Obat-Obatan, Dan Kosmetika Majelis Ulama Indonesia (LPPOM MUI)', $ORG, $NAT, $IDN],
            ['L02', 'Lembaga Multi Kompetensi Utama', $SWA, $NAT, $IDN],
            ['L03', 'Lembaga Keterampilan Profesi Logistik Indonesia (LKP Login)', $SWA, $NAT, $IDN],
            ['L04', 'LKP Silhouette Training Centre Dan CV Silhouette Internasional', $SWA, $NAT, $IDN],
            ['L05', 'Lembaga Pelatihan Kerja Sembilan Tara Nawasena (LPK Nawasena)', $SWA, $NAT, $IDN],
            ['L06', 'Lembaga Penyiaran Publik Radio Republik Indonesia', $PEM, $NAT, $IDN],
            ['L07', 'Lembaga Penyiaran Publik TVRI Stasiun Riau', $PEM, $NAT, $IDN],
            ['L08', 'Lembaga Sertifikasi Profesi Geomatika', $ORG, $NAT, $IDN],
            ['L09', 'Lembaga Sertifikasi Profesi Otomasi Mekatronika Indonesia (OMI)', $ORG, $NAT, $IDN],
            ['L10', 'Lembaga Sertifikasi Profesi Survey Pemetaan Isi', $ORG, $NAT, $IDN],
            ['L11', 'LSP PERPAJAKAN INDONESIA', $ORG, $NAT, $IDN],

            // LA - International
            ['LA01', 'Association of Chartered Certified Accountants (ACCA)', $ORG, $INT, null],
            ['LA02', 'AERAE HOLDINGS LTD.', $SWA, $INT, null],

            // LB - International
            ['LB01', 'B2B Success. CO., Ltd', $SWA, $INT, null],
            ['LB02', 'Bharatiya Engineering Science And Technology Innovation University', $PT, $INT, null],
            ['LB03', 'Baekseok University Of Republic Of Korea', $PT, $INT, null],

            // LC - International
            ['LC01', 'Cap Advisory Group PTE. LTD .', $SWA, $INT, null],
            ['LC02', 'Catanduanes State University', $PT, $INT, null],
            ['LC03', 'Cebu Technological University', $PT, $INT, null],
            ['LC04', 'Cheng Shiu University', $PT, $INT, null],
            ['LC05', 'Chongqing College Of Electronic Engineering', $PT, $INT, null],
            ['LC06', 'Chung Yuan Christian University', $PT, $INT, null],
            ['LC07', 'City Of Glassgow College', $PT, $INT, null],

            // LG - International
            ['LG01', 'Gempacs', $SWA, $INT, null],
            ['LG02', 'Guandong Mechanical & Electrical Polytechnic', $PT, $INT, null],
            ['LG03', 'Guangxi Polytechnic Of Construction', $PT, $INT, null],

            // LH - International
            ['LH01', 'HOPE International Economic Cooperation (Wuhan) Co., Ltd.', $SWA, $INT, null],

            // LK - International
            ['LK01', 'KAMK University, Finland', $PT, $INT, null],
            ['LK02', 'Kolej Komuniti Segamat Johor, Malaysia', $PT, $INT, null],
            ['LK03', 'Kolej Komuniti Bukit Beruang', $PT, $INT, null],

            // LL - International
            ['LL01', 'Lembaga Hasil Dalam Negeri (LHDN) Malaysia', $PEM, $INT, null],
            ['LL02', 'Liuzhou Polytechnic University', $PT, $INT, null],
            ['LL03', 'Lunghwa University Of Science And Technology', $PT, $INT, null],
            ['LL04', 'PT Liugong Machinery Indonesia', $SWA, $INT, null],

            // LM - International
            ['LM01', 'Management And Science University, Malaysia', $PT, $INT, null],
            ['LM02', 'Ming Chi University Of Technology', $PT, $INT, null],
            ['LM03', 'Monash University', $PT, $INT, null],
            ['LM04', 'Med Technologies PTE LTD', $SWA, $INT, null],
            ['LM05', 'Minjiang Teachers College', $PT, $INT, null],

            // LN - International
            ['LN01', 'Nanyang Polytechnic, Singapore', $PT, $INT, null],
            ['LN02', 'National Chin-Yi University Of Technology', $PT, $INT, null],
            ['LN03', 'National Taichung University Of Education (Taiwan)', $PT, $INT, null],
            ['LN04', 'National Yunlin University Of Science And Technology', $PT, $INT, null],
            ['LN05', 'Norwegian University Of Science And Technology', $PT, $INT, null],
            ['LN06', 'Nueva Ecija University Of Science And Technology', $PT, $INT, null],

            // LP - International
            ['LP01', 'Pangasinan State University', $PT, $INT, null],
            ['LP02', 'Parallaxnet Llc', $SWA, $INT, null],
            ['LP03', 'Politeknik Sultan Salahuddin Abdul Aziz Shah', $PT, $INT, null],
            ['LP04', 'Politeknik Mersing', $PT, $INT, null],
            ['LP05', 'Politeknik Ibrahim Sultan', $PT, $INT, null],

            // LR - International
            ['LR01', 'Republic Polytechnic', $PT, $INT, null],
            ['LR02', 'Rialair Ltd', $SWA, $INT, null],

            // LS - International
            ['LS01', 'Seawig Technologies PTE LTD', $SWA, $INT, null],
            ['LS02', 'Shaanxi Polytechnic Institute', $PT, $INT, null],
            ['LS03', 'Shipload Group (PT SMPL)', $SWA, $INT, null],
            ['LS04', 'Singapore Polytechnic', $PT, $INT, null],
            ['LS05', 'Solustar Pte Ltd', $SWA, $INT, null],
            ['LS06', 'Shanxi Construction Investment Group Co., Ltd', $SWA, $INT, null],

            // LU - International
            ['LU01', 'Universitas Teknikal Malaysia Melaka', $PT, $INT, null],
            ['LU02', 'Universitas Sabah Malaysia', $PT, $INT, null],
            ['LU03', 'Universite Polytechnique Hauts-De-France (UPHF)', $PT, $INT, null],
            ['LU04', 'Universiti Poly-Tech Malaysia', $PT, $INT, null],
            ['LU05', 'Universiti Tun Hussein Onn Malaysia', $PT, $INT, null],

            // LV - International
            ['LV01', 'VICTORIA AVIATION ACADEMY', $PT, $INT, null],

            // LW - International
            ['LW01', 'Wufeng University', $PT, $INT, null],

            // M - Masyarakat / Majelis
            ['M01', 'Masyarakat Akuakultur Indonesia', $ORG, $NAT, $IDN],
            ['M02', 'Majelis Ulama Indonesia Kota Batam', $ORG, $NAT, $IDN],

            // N
            ['N01', 'NBO Bebras Indonesia', $ORG, $NAT, $IDN],
            ['N02', 'NVidia Indonesia', $SWA, $NAT, $IDN],
            ['NO01', 'Notaris dan PPAT Didik Sulistyono, SH., M.Kn', $SWA, $NAT, $IDN],

            // P - Pemerintah / Perpustakaan / Persatuan / Pengurus
            ['P01', 'Pemerintah Kabupaten Kepulauan Anambas', $PEM, $NAT, $IDN],
            ['P02', 'Pemerintah Kabupaten Lingga', $PEM, $NAT, $IDN],
            ['P03', 'Pemerintah Kota Batam', $PEM, $NAT, $IDN],
            ['P04', 'Pemerintah Kota Pekanbaru', $PEM, $NAT, $IDN],
            ['P05', 'Pemerintah Provinsi Aceh', $PEM, $NAT, $IDN],
            ['P06', 'Pemerintah Provinsi Kepulauan Riau', $PEM, $NAT, $IDN],
            ['P07', 'Pengurus Cabang Nadhatul Ulama (PCNU) Kota Batam', $ORG, $NAT, $IDN],
            ['P08', 'Perpustakaan Kantor Perwakilan Bank Indonesia Provinsi Kepulauan Riau', $PEM, $NAT, $IDN],
            ['P09', 'Perpustakaan Nasional Republik Indonesia', $PEM, $NAT, $IDN],
            ['P10', 'Perpustakaan Universitas International Batam', $PT, $NAT, $IDN],
            ['P11', 'Persatuan Insinyur Indonesia (PII)', $ORG, $NAT, $IDN],
            ['P12', 'Persatuan Insinyur Indonesia (PII) Cabang Kota Batam', $ORG, $NAT, $IDN],
            ['P13', 'Perwakilan Badan Kependudukan Dan Keluarga Berencana Nasional Provinsi Kepri', $PEM, $NAT, $IDN],

            // PL - Politeknik
            ['PL01', 'Politeknik APP Jakarta', $PT, $NAT, $IDN],
            ['PL02', 'Politeknik ATI Makassar', $PT, $NAT, $IDN],
            ['PL03', 'Politeknik Caltex Riau', $PT, $NAT, $IDN],
            ['PL04', 'Politeknik Dewantara', $PT, $NAT, $IDN],
            ['PL05', 'Politeknik Gajah Tunggal', $PT, $NAT, $IDN],
            ['PL06', 'Politeknik Industri Logam Morowali', $PT, $NAT, $IDN],
            ['PL07', 'Politeknik Industri Petrokimia Banten (PIPB)', $PT, $NAT, $IDN],
            ['PL08', 'Politeknik Jambi', $PT, $NAT, $IDN],
            ['PL09', 'Politeknik Kampar', $PT, $NAT, $IDN],
            ['PL10', 'Politeknik Manufaktur Astra', $PT, $NAT, $IDN],
            ['PL11', 'Politeknik Negeri Bandung', $PT, $NAT, $IDN],
            ['PL12', 'Politeknik Negeri Banyuwangi', $PT, $NAT, $IDN],
            ['PL13', 'Politeknik Negeri Bengkalis', $PT, $NAT, $IDN],
            ['PL14', 'Politeknik Negeri Jakarta', $PT, $NAT, $IDN],
            ['PL15', 'Politeknik Negeri Ketapang', $PT, $NAT, $IDN],
            ['PL16', 'Politeknik Negeri Lhokseumawe', $PT, $NAT, $IDN],
            ['PL17', 'Politeknik Negeri Madura', $PT, $NAT, $IDN],
            ['PL18', 'Politeknik Negeri Malang', $PT, $NAT, $IDN],
            ['PL19', 'Politeknik Negeri Medan', $PT, $NAT, $IDN],
            ['PL20', 'Politeknik Negeri Padang', $PT, $NAT, $IDN],
            ['PL21', 'Politeknik Negeri Pontianak', $PT, $NAT, $IDN],
            ['PL22', 'Politeknik Negeri Sambas', $PT, $NAT, $IDN],
            ['PL23', 'Politeknik Pariwisata Batam', $PT, $NAT, $IDN],
            ['PL24', 'Politeknik Penerbangan Palembang', $PT, $NAT, $IDN],
            ['PL25', 'Politeknik Pertanian Negeri Pangkajene', $PT, $NAT, $IDN],
            ['PL26', 'Politeknik Pertanian Negeri Payakumbuh (Politani)', $PT, $NAT, $IDN],
            ['PL27', 'Politeknik STMI Jakarta', $PT, $NAT, $IDN],
            ['PL28', 'Politeknik Negeri Sriwijaya', $PT, $NAT, $IDN],

            // PP - Pondok Pesantren
            ['PP01', 'Pondok Pesantren Baitul Quran Batam', $SEK, $NAT, $IDN],
            ['PP02', 'Pondok Pesantren Ulul Ilmi Cendekia', $SEK, $NAT, $IDN],

            // PTA
            ['PTA01', 'PT Ade Mestakung Abadi', $SWA, $NAT, $IDN],
            ['PTA02', 'PT Aero Terra Indonesia', $SWA, $NAT, $IDN],
            ['PTA03', 'PT Agry Meugah Mandiri', $SWA, $NAT, $IDN],
            ['PTA04', 'PT Agung Muda Berkarya', $SWA, $NAT, $IDN],
            ['PTA05', 'PT Amreta Teknik Internasional', $SWA, $NAT, $IDN],
            ['PTA06', 'PT Aneka Sakti Bakti (Asaba)', $SWA, $NAT, $IDN],
            ['PTA07', 'PT Anya Sumber Rezeki (Daing Mas Griya Jamu Herbal & Coffee Shop)', $SWA, $NAT, $IDN],
            ['PTA08', 'PT APINDO', $SWA, $NAT, $IDN],
            ['PTA09', 'PT Archasindo', $SWA, $NAT, $IDN],
            ['PTA10', 'PT Arunika Terang Indonesia', $SWA, $NAT, $IDN],
            ['PTA11', 'PT Asia Citra Riau Property', $SWA, $NAT, $IDN],
            ['PTA12', 'PT Asia NDT Laboratories And Supplies', $SWA, $NAT, $IDN],
            ['PTA13', 'PT Astra Group Pekanbaru', $SWA, $NAT, $IDN],

            // PTB
            ['PTB01', 'PT Bandara Internasional Batam', $SWA, $NAT, $IDN],
            ['PTB02', 'PT Barelang Glassindo', $SWA, $NAT, $IDN],
            ['PTB03', 'PT Batam Multimedia Televisi', $SWA, $NAT, $IDN],
            ['PTB04', 'PT Batamindo Investment Cakrawala', $SWA, $NAT, $IDN],
            ['PTB05', 'PT Bentera Tabang Nusantara (Beta)', $SWA, $NAT, $IDN],
            ['PTB06', 'PT Berlian Dumai Logistics (Bdl) Cabang Batam', $SWA, $NAT, $IDN],
            ['PTB07', 'PT Bintan Alumina Indonesia', $SWA, $NAT, $IDN],
            ['PTB08', 'PT Bintan Inti Industrial Estate', $SWA, $NAT, $IDN],
            ['PTB09', 'PT Bintang Sukses Globalindo', $SWA, $NAT, $IDN],
            ['PTB10', 'PT Biro Klasifikasi Indonesia (Persero)', $SWA, $NAT, $IDN],
            ['PTB11', 'PT Bizlink Technology Indonesia', $SWA, $NAT, $IDN],
            ['PTB12', 'PT Budaya Digital Indonesia', $SWA, $NAT, $IDN],
            ['PTB13', 'PT Bias Surya Teknologi', $SWA, $NAT, $IDN],
            ['PTB14', 'PT Bina Teladan Mandiri', $SWA, $NAT, $IDN],

            // PTC
            ['PTC01', 'PT Cameron Systems', $SWA, $NAT, $IDN],
            ['PTC02', 'PT Caterpillar Indonesia Batam', $SWA, $NAT, $IDN],
            ['PTC03', 'PT Ciba Vision Batam', $SWA, $NAT, $IDN],
            ['PTC04', 'PT Cicor Panatec', $SWA, $NAT, $IDN],
            ['PTC05', 'PT Cladtek Bi-Metal Manufacturing', $SWA, $NAT, $IDN],
            ['PTC06', 'PT Comac Multi Industri', $SWA, $NAT, $IDN],
            ['PTC07', 'PT Cyber Edu Inkor (CEI)', $SWA, $NAT, $IDN],
            ['PTC08', 'PT Cambridge Industrial Batam', $SWA, $NAT, $IDN],

            // PTD
            ['PTD01', 'PT Dast In', $SWA, $NAT, $IDN],
            ['PTD02', 'PT Desa Air Cargo Batam', $SWA, $NAT, $IDN],
            ['PTD03', 'PT Dok Warisan Pertama', $SWA, $NAT, $IDN],
            ['PTD04', 'PT Dora Bisnis Konsultindo', $SWA, $NAT, $IDN],
            ['PTD05', 'PT Dreams Studio Indonesia', $SWA, $NAT, $IDN],
            ['PTD06', 'PT Dredolf Indonesia', $SWA, $NAT, $IDN],
            ['PTD07', 'PT Duta Perjalanan Wisata (My Bus Batam)', $SWA, $NAT, $IDN],

            // PTE
            ['PTE01', 'PT Etowa Packaging Indonesia', $SWA, $NAT, $IDN],
            ['PTE02', 'PT Excelitas Technologies Batam', $SWA, $NAT, $IDN],
            ['PTE03', 'PT Explora Prima', $SWA, $NAT, $IDN],
            ['PTE04', 'PT ELESKA IATKI', $SWA, $NAT, $IDN],

            // PTF
            ['PTF01', 'PT Fast Precision Manufacturing Indonesia', $SWA, $NAT, $IDN],
            ['PTF02', 'PT Free The Sea', $SWA, $NAT, $IDN],
            ['PTF03', 'PT Frisidea Tech Indonesia', $SWA, $NAT, $IDN],

            // PTG
            ['PTG01', 'PT Garuda Maintenance Facility Aero Asia Tbk', $SWA, $NAT, $IDN],
            ['PTG02', 'PT GDS Indonesia Group (Day One)', $SWA, $NAT, $IDN],
            ['PTG03', 'PT Global Data Inspirasi', $SWA, $NAT, $IDN],
            ['PTG04', 'PT Golden Batam Raya', $SWA, $NAT, $IDN],
            ['PTG05', 'PT Goto Gojek Tokopedia Tbk', $SWA, $NAT, $IDN],
            ['PTG06', 'PT Galang Bumi Industri', $SWA, $NAT, $IDN],

            // PTH
            ['PTH01', 'PT Halcom Inovasi Teknologi', $SWA, $NAT, $IDN],
            ['PTH02', 'PT Hanika Indonesia Berkah', $SWA, $NAT, $IDN],
            ['PTH03', 'PT Hawila Adhi Perkasa', $SWA, $NAT, $IDN],
            ['PTH04', 'PT Hoki Surya Ningrat (Snipeyes)', $SWA, $NAT, $IDN],

            // PTI
            ['PTI01', 'PT Ilmubox Pengetahuan Internasional', $SWA, $NAT, $IDN],
            ['PTI02', 'PT Indina Industri Indonesia', $SWA, $NAT, $IDN],
            ['PTI03', 'PT Indoproff Group', $SWA, $NAT, $IDN],
            ['PTI04', 'PT Inspektindo Sinergi Persada', $SWA, $NAT, $IDN],
            ['PTI05', 'PT Inixindo Widya Iswara Nusantara', $SWA, $NAT, $IDN],
            ['PTI06', 'PT INOVASI KECERDASAN BUATAN (PLATTER)', $SWA, $NAT, $IDN],

            // PTJ
            ['PTJ01', 'PT Jasa Raharja', $PEM, $NAT, $IDN],
            ['PTJ02', 'PT Jati Bening Indonesia', $SWA, $NAT, $IDN],
            ['PTJ03', 'PT Jati Sukses Mandiri', $SWA, $NAT, $IDN],

            // PTK
            ['PTK01', 'PT Kagungan Jaya Sukses (Id.Project)', $SWA, $NAT, $IDN],
            ['PTK02', 'PT Karbon Multindo Utama', $SWA, $NAT, $IDN],
            ['PTK03', 'PT Karya Teknik Utama (KTU Shipyard)', $SWA, $NAT, $IDN],
            ['PTK04', 'PT Kemina Dunia Medika', $SWA, $NAT, $IDN],
            ['PTK05', 'PT Kinema Systrans Multimedia (Infinite Learning)', $SWA, $NAT, $IDN],
            ['PTK06', 'PT Kinobi Technologies Indonesia', $SWA, $NAT, $IDN],
            ['PTK07', 'PT Kitong Karya Inovasi', $SWA, $NAT, $IDN],
            ['PTK08', 'PT Konsultindo Artha Persada', $SWA, $NAT, $IDN],
            ['PTK09', 'PT Kriya Kreatif Anugerah (Movingthings Production)', $SWA, $NAT, $IDN],
            ['PTK10', 'PT Kuarta Powerindo Perkasa', $SWA, $NAT, $IDN],
            ['PTK11', 'PT Kumala Indonesia Shipyard', $SWA, $NAT, $IDN],
            ['PTK12', 'PT Karya Muria Niaga', $SWA, $NAT, $IDN],

            // PTL
            ['PTL01', 'PT Lancang Kuning Sukses', $SWA, $NAT, $IDN],
            ['PTL02', 'PT Laras Adhi Praya', $SWA, $NAT, $IDN],
            ['PTL03', 'PT Lentera Segara Indonesia', $SWA, $NAT, $IDN],
            ['PTL04', 'PT Lifelong Learning', $SWA, $NAT, $IDN],
            ['PTL05', 'PT Lippo Karawaci, Tbk', $SWA, $NAT, $IDN],

            // PTM
            ['PTM01', 'PT Macan Teknologi Asia', $SWA, $NAT, $IDN],
            ['PTM02', 'PT Makmur Elok Graha', $SWA, $NAT, $IDN],
            ['PTM03', 'PT Marine Propulsion Solution', $SWA, $NAT, $IDN],
            ['PTM04', 'PT Markija Berdaya Bersama', $SWA, $NAT, $IDN],
            ['PTM05', 'PT Markplus Indonesia', $SWA, $NAT, $IDN],
            ['PTM06', 'PT McDermott Indonesia', $SWA, $NAT, $IDN],
            ['PTM07', 'PT Medco Power Indonesia', $SWA, $NAT, $IDN],
            ['PTM08', 'PT Media Promosi Batam/Batam Promotion', $SWA, $NAT, $IDN],
            ['PTM09', 'PT Mekar Bersama Dua Bintang', $SWA, $NAT, $IDN],
            ['PTM10', 'PT Mes Teknologi Indonesia', $SWA, $NAT, $IDN],
            ['PTM11', 'PT Meta Citra Indonesia', $SWA, $NAT, $IDN],
            ['PTM12', 'PT Mitra Integritas Indonesia (FolxCode)', $SWA, $NAT, $IDN],
            ['PTM13', 'PT Mosha Sinalsal Solusi', $SWA, $NAT, $IDN],
            ['PTM14', 'PT Multi Mitra Guna', $SWA, $NAT, $IDN],
            ['PTM15', 'PT Multi Prima Daya Perkasa', $SWA, $NAT, $IDN],
            ['PTM16', 'PT Mitra Persada Sejati', $SWA, $NAT, $IDN],
            ['PTM17', 'PT MITRA KARYA SARANA', $SWA, $NAT, $IDN],

            // PTN
            ['PTN01', 'PT Najah Karya Muda', $SWA, $NAT, $IDN],
            ['PTN02', 'PT Nirwana Turisindo', $SWA, $NAT, $IDN],
            ['PTN03', 'PT Nusatama Properta Panbil', $SWA, $NAT, $IDN],
            ['PTN04', 'PT Negeri Seni Teknologi (SecLab Indonesia)', $SWA, $NAT, $IDN],

            // PTP
            ['PTP01', 'PT Pakartek Engineering', $SWA, $NAT, $IDN],
            ['PTP02', 'PT Panasonic Industrial Devices Batam', $SWA, $NAT, $IDN],
            ['PTP03', 'PT Panca Anugrah Sakti', $SWA, $NAT, $IDN],
            ['PTP04', 'PT Panca Prima Prestasi', $SWA, $NAT, $IDN],
            ['PTP05', 'PT Pangeran Pekanbaru Hotel', $SWA, $NAT, $IDN],
            ['PTP06', 'PT Patlite Indonesia', $SWA, $NAT, $IDN],
            ['PTP07', 'PT Patria Maritim Perkasa', $SWA, $NAT, $IDN],
            ['PTP08', 'PT PCI Elektronik Internasional', $SWA, $NAT, $IDN],
            ['PTP09', 'PT Pelayanan Energi Batam', $SWA, $NAT, $IDN],
            ['PTP10', 'PT Pelayanan Listrik Nasional Batam', $SWA, $NAT, $IDN],
            ['PTP11', 'PT Pertama Pacific Shipyard', $SWA, $NAT, $IDN],
            ['PTP12', 'PT Philips Industries Batam', $SWA, $NAT, $IDN],
            ['PTP13', 'PT Pinnacle Afa Edukasi', $SWA, $NAT, $IDN],
            ['PTP14', 'PT PJB Ubjom PLTU Tenayan (PT Pembangkitan Jawa-Bali (PJB) melalui Unit Bisnis Jasa O&M (UBJOM) PLTU Tenayan)', $SWA, $NAT, $IDN],
            ['PTP15', 'PT Pobos Pradi Jaya (Pobo Soccer)', $SWA, $NAT, $IDN],
            ['PTP16', 'PT Pratama Indomitra Konsultan', $SWA, $NAT, $IDN],
            ['PTP17', 'PT Prima Bersama Berkat (Bosshire)', $SWA, $NAT, $IDN],
            ['PTP18', 'PT Purwa Satmitra Teknologi', $SWA, $NAT, $IDN],
            ['PTP19', 'PT Pusaka Talenta Nusantara', $SWA, $NAT, $IDN],
            ['PTP20', 'PT PASIFIK ASIA SOLUSION', $SWA, $NAT, $IDN],

            // PTR
            ['PTR01', 'PT Raditya Alkademi Digital', $SWA, $NAT, $IDN],
            ['PTR02', 'PT Rahayu Agro Makmur', $SWA, $NAT, $IDN],
            ['PTR03', 'PT Rajawali Angkasa Showroom (RAM Showroom)', $SWA, $NAT, $IDN],
            ['PTR04', 'PT Resous Expet Developmen (RED)', $SWA, $NAT, $IDN],
            ['PTR05', 'PT Revolusi Cita Edukasi', $SWA, $NAT, $IDN],
            ['PTR06', 'PT RGroup Indonesia', $SWA, $NAT, $IDN],
            ['PTR07', 'PT Riau Andalan Pulp And Paper (RAPP)', $SWA, $NAT, $IDN],
            ['PTR08', 'PT Riau Media Televisi (RTV)', $SWA, $NAT, $IDN],
            ['PTR09', 'PT Riau Perkasa Energi', $SWA, $NAT, $IDN],
            ['PTR10', 'PT Rigspek Perkasa', $SWA, $NAT, $IDN],
            ['PTR11', 'PT Risea EBT Solusi', $SWA, $NAT, $IDN],
            ['PTR12', 'PT Riseal Propulsion Indonesia', $SWA, $NAT, $IDN],

            // PTS
            ['PTS01', 'PT Sago Design Engineering', $SWA, $NAT, $IDN],
            ['PTS02', 'PT Sanindo Multi Tekno', $SWA, $NAT, $IDN],
            ['PTS03', 'PT Sarana Pembangunan Pekanbaru (SPP)', $SWA, $NAT, $IDN],
            ['PTS04', 'PT Sat Nusapersada Tbk', $SWA, $NAT, $IDN],
            ['PTS05', 'PT Satukelas Adhyapana Nusantara', $SWA, $NAT, $IDN],
            ['PTS06', 'PT Schneider Electric Manufacturing Batam', $SWA, $NAT, $IDN],
            ['PTS07', 'PT Schneider Indonesia', $SWA, $NAT, $IDN],
            ['PTS08', 'PT Seacad Technologies Indonesia', $SWA, $NAT, $IDN],
            ['PTS09', 'PT Sembada Bina Pratama', $SWA, $NAT, $IDN],
            ['PTS10', 'PT Servotech Indonesia', $SWA, $NAT, $IDN],
            ['PTS11', 'PT Shimano Batam', $SWA, $NAT, $IDN],
            ['PTS12', 'PT Siix Electronics Indonesia', $SWA, $NAT, $IDN],
            ['PTS13', 'PT Simatelex Manufactory Batam', $SWA, $NAT, $IDN],
            ['PTS14', 'PT Sindo Teknologi Industri', $SWA, $NAT, $IDN],
            ['PTS15', 'PT SMOE Indonesia', $SWA, $NAT, $IDN],
            ['PTS16', 'PT Solusi Kampus Indonesia', $SWA, $NAT, $IDN],
            ['PTS17', 'PT Kawan Lama Solusi', $SWA, $NAT, $IDN],
            ['PTS18', 'PT Statistik Hasil Pencarian', $SWA, $NAT, $IDN],
            ['PTS19', 'PT Sucofindo Batam', $SWA, $NAT, $IDN],
            ['PTS20', 'PT Sumitomo Wiring Systems Batam Indonesia', $SWA, $NAT, $IDN],
            ['PTS21', 'PT Sytham Pilar Utama', $SWA, $NAT, $IDN],
            ['PTS22', 'PT Supra Teknologi Plastik', $SWA, $NAT, $IDN],
            ['PTS23', 'PT Swanten Karya Adicita (BatamTech)', $SWA, $NAT, $IDN],
            ['PTS24', 'PT Swastika Lumintu Amerta', $SWA, $NAT, $IDN],
            ['PTS25', 'PT SIDMA TEKNIK SOLUSI INDONESIA', $SWA, $NAT, $IDN],

            // PTT
            ['PTT01', 'PT Tambang Indonesia Merdeka', $SWA, $NAT, $IDN],
            ['PTT02', 'PT Tanto Berjaya Pointel', $SWA, $NAT, $IDN],
            ['PTT03', 'PT TDK Electronics Indonesia', $SWA, $NAT, $IDN],
            ['PTT04', 'PT Technomedia Interkom Cemerlang', $SWA, $NAT, $IDN],
            ['PTT05', 'PT Teknologi Adaptif Indonesia', $SWA, $NAT, $IDN],
            ['PTT06', 'PT Teknologi Data Infrastruktur (Neutra DC)', $SWA, $NAT, $IDN],
            ['PTT07', 'PT Telekomunikasi Selular (Telkomsel)', $SWA, $NAT, $IDN],
            ['PTT08', 'PT Tiga Digdaya Abadi', $SWA, $NAT, $IDN],
            ['PTT09', 'PT TJK Power', $SWA, $NAT, $IDN],
            ['PTT10', 'PT Torani Pandu Indonesia', $SWA, $NAT, $IDN],
            ['PTT11', 'PT Trans Marine Opportunity', $SWA, $NAT, $IDN],
            ['PTT12', 'PT Tri Multi Bahtera', $SWA, $NAT, $IDN],
            ['PTT13', 'PT Trimatra Daya Sarana', $SWA, $NAT, $IDN],
            ['PTT14', 'PT Tec Indonesia', $SWA, $NAT, $IDN],

            // PTU
            ['PTU01', 'PT Ultima Tekno Solusindo', $SWA, $NAT, $IDN],
            ['PTU02', 'PT United Sindo Perkasa', $SWA, $NAT, $IDN],

            // PTV
            ['PTV01', 'PT VME Process', $SWA, $NAT, $IDN],
            ['PTV02', 'PT Vortex Energy Batam', $SWA, $NAT, $IDN],
            ['PTV03', 'PT V-Tech Teknologi Indonesia', $SWA, $NAT, $IDN],
            ['PTV04', 'PT Volex Indonesia', $SWA, $NAT, $IDN],

            // PTW
            ['PTW01', 'PT Weina Light Indonesia', $SWA, $NAT, $IDN],
            ['PTW02', 'PT WIK Far East', $SWA, $NAT, $IDN],

            // PTY
            ['PTY01', 'PT Yogya Presisi Teknikatama Industri (PT YPTI)', $SWA, $NAT, $IDN],
            ['PTY02', 'PT Yageo TMSS Indonesia', $SWA, $NAT, $IDN],

            // PTZ
            ['PTZ01', 'PT Zetta Nusantara Studio (Zettamind Studio)', $SWA, $NAT, $IDN],
            ['PTZ02', 'PT Zona Asia Forwarding', $SWA, $NAT, $IDN],
            ['PTZ03', 'PT ZIERA GLOBAL TEKNIK', $SWA, $NAT, $IDN],

            // PU - Pusat
            ['PU01', 'Pusat Kolaborasi Desain Chip Indonesia', $PEM, $NAT, $IDN],
            ['PU02', 'Pusat Layanan Pembiayaan Pendidikan, Kementerian Pendidikan Dasar dan Menengah', $PEM, $NAT, $IDN],
            ['PU03', 'PUSAT PEMBIAYAAN DAN ASESMEN PENDIDIKAN TINGGI KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI', $PEM, $NAT, $IDN],
            ['PU04', 'Pusat Pengembangan Sumber Daya Manusia Perhubungan Udara Kementerian Perhubungan', $PEM, $NAT, $IDN],
            ['PU05', 'Puskesmas Baloi Permai', $PEM, $NAT, $IDN],

            // R
            ['R01', 'Rotary Club Of Batam', $ORG, $NAT, $IDN],

            // RS - Rumah Sakit
            ['RS01', 'Rumah Sakit Awal Bross Batam', $SWA, $NAT, $IDN],
            ['RS02', 'Rumah Sakit Budi Kemuliaan', $SWA, $NAT, $IDN],

            // S
            ['S01', 'SEAMOLEC', $PT, $NAT, $IDN],
            ['S02', 'Stasiun Meteorologi Kelas I Hang Nadim Batam BMKG', $PEM, $NAT, $IDN],

            // SA - Sekolah SMA
            ['SA01', 'Sekolah SMA IT Fajar Ilahi Bengkong', $SEK, $NAT, $IDN],
            ['SA02', 'Sekolah SMA Negeri 9 Batam', $SEK, $NAT, $IDN],

            // SK - Sekolah SMK
            ['SK01', 'Sekolah SMK 1 Negeri Batam', $SEK, $NAT, $IDN],
            ['SK02', 'Sekolah SMK Dirgantara Riau', $SEK, $NAT, $IDN],
            ['SK03', 'Sekolah SMK Kal-1 Surabaya', $SEK, $NAT, $IDN],
            ['SK04', 'Sekolah SMK Maarif Nu Batam', $SEK, $NAT, $IDN],
            ['SK05', 'Sekolah SMK Muhammadiyah Batam', $SEK, $NAT, $IDN],
            ['SK06', 'Sekolah SMK Multistudi High School Batam', $SEK, $NAT, $IDN],
            ['SK07', 'Sekolah SMK Negeri 1 Bintan Utara', $SEK, $NAT, $IDN],
            ['SK08', 'Sekolah SMK Negeri 1 Bunguran Timur Utara', $SEK, $NAT, $IDN],
            ['SK09', 'Sekolah SMK Negeri 1 Garut', $SEK, $NAT, $IDN],
            ['SK10', 'Sekolah SMK Negeri 1 Tanjung Pinang', $SEK, $NAT, $IDN],
            ['SK11', 'Sekolah SMK Negeri 10 Batam', $SEK, $NAT, $IDN],
            ['SK12', 'Sekolah SMK Negeri 3 Batam', $SEK, $NAT, $IDN],
            ['SK13', 'Sekolah SMK Negeri 4 Malang', $SEK, $NAT, $IDN],
            ['SK14', 'Sekolah SMK Negeri 4 Tanjung Pinang', $SEK, $NAT, $IDN],
            ['SK15', 'Sekolah SMK Negeri 5 Batam', $SEK, $NAT, $IDN],
            ['SK16', 'Sekolah SMK Negeri 6 Batam', $SEK, $NAT, $IDN],
            ['SK17', 'Sekolah SMK Negeri 7 Batam', $SEK, $NAT, $IDN],
            ['SK18', 'Sekolah SMK Negeri 9 Batam', $SEK, $NAT, $IDN],
            ['SK19', 'Sekolah SMK Negeri Kundur', $SEK, $NAT, $IDN],
            ['SK20', 'Sekolah SMK Penerbangan Batam', $SEK, $NAT, $IDN],
            ['SK21', 'Sekolah SMK Penerbangan Nasional Batam', $SEK, $NAT, $IDN],
            ['SK22', 'Sekolah SMK Penerbangan SPN Dirgantara Batam', $SEK, $NAT, $IDN],
            ['SK23', 'Sekolah SMK Pertiwi Batam', $SEK, $NAT, $IDN],
            ['SK24', 'Sekolah SMKs Aljabar Batam', $SEK, $NAT, $IDN],
            ['SK25', 'Sekolah SMKs Kartini Batam', $SEK, $NAT, $IDN],

            // SL - Sekolah Luar Biasa
            ['SL01', 'Sekolah Luar Biasa Putra Kami', $SEK, $NAT, $IDN],

            // ST - Sekolah Tinggi
            ['ST01', 'Sekolah Tinggi Ilmu Ekonomi Bentara Persada', $PT, $NAT, $IDN],

            // T
            ['T01', 'Tri Hita Karana Centre', $ORG, $NAT, $IDN],
            ['T02', 'Trust Academic Solutions', $SWA, $NAT, $IDN],

            // TT - Tour & Travel
            ['TT01', 'Tour & Travel Fuji Tour Batam', $SWA, $NAT, $IDN],
            ['TT02', 'Tour And Travel Fantastik', $SWA, $NAT, $IDN],

            // UM - Usaha Mikro
            ['UM01', 'Danara Utama Katering', $SWA, $NAT, $IDN],
            ['UM02', 'DDshop', $SWA, $NAT, $IDN],
            ['UM03', 'Itaewon K-Boba', $SWA, $NAT, $IDN],
            ['UM04', 'Jom Tea', $SWA, $NAT, $IDN],
            ['UM05', 'M3D Barbershop', $SWA, $NAT, $IDN],
            ['UM06', 'Mimishandmade', $SWA, $NAT, $IDN],
            ['UM07', 'Nada Food', $SWA, $NAT, $IDN],
            ['UM08', 'Ntj Creative', $SWA, $NAT, $IDN],
            ['UM09', 'Oxyra Water', $SWA, $NAT, $IDN],
            ['UM10', 'PSG Corp', $SWA, $NAT, $IDN],
            ['UM11', 'Resto Baabaa Kambing', $SWA, $NAT, $IDN],
            ['UM12', 'Roti Hap', $SWA, $NAT, $IDN],
            ['UM13', 'Sarrab Pizza And Burger Station', $SWA, $NAT, $IDN],
            ['UM14', 'Widi Utami Wedding Organizer', $SWA, $NAT, $IDN],
            ['UM15', 'Angkat Koper', $SWA, $NAT, $IDN],
            ['UM16', 'Applenesia - Apple Servis Center Specialist', $SWA, $NAT, $IDN],
            ['UM17', 'Avocado Muslimah Wear', $SWA, $NAT, $IDN],
            ['UM18', 'Ayam Geprek Juara Aviari', $SWA, $NAT, $IDN],

            // UN - Universitas
            ['UN01', 'Universitas Hang Tuah Pekanbaru', $PT, $NAT, $IDN],
            ['UN02', 'Universitas Ibnu Sina Batam', $PT, $NAT, $IDN],
            ['UN03', 'Universitas Indonesia', $PT, $NAT, $IDN],
            ['UN04', 'Universitas Maritim Raja Ali Haji', $PT, $NAT, $IDN],
            ['UN05', 'Universitas Batam', $PT, $NAT, $IDN],
            ['UN06', 'Universitas Brawijaya', $PT, $NAT, $IDN],
            ['UN07', 'Universitas Darussalam Gontor', $PT, $NAT, $IDN],
            ['UN08', 'Universitas Dinamika', $PT, $NAT, $IDN],
            ['UN09', 'Universitas Diponegoro', $PT, $NAT, $IDN],
            ['UN10', 'Universitas Gadjah Mada', $PT, $NAT, $IDN],
            ['UN11', 'Universitas Internasional Batam', $PT, $NAT, $IDN],
            ['UN12', 'Universitas Islam Negeri Sjech M. Djamil Djambek Bukittinggi', $PT, $NAT, $IDN],
            ['UN13', 'Universitas Jember', $PT, $NAT, $IDN],
            ['UN14', 'Universitas Negeri Malang (UM)', $PT, $NAT, $IDN],
            ['UN15', 'Universitas Negeri Padang', $PT, $NAT, $IDN],
            ['UN16', 'Universitas Putera Batam (UPB)', $PT, $NAT, $IDN],
            ['UN17', 'Universitas Riau', $PT, $NAT, $IDN],
            ['UN18', 'Universitas Riau Kepulauan', $PT, $NAT, $IDN],
            ['UN19', 'Universitas Sari Mutiara Indonesia', $PT, $NAT, $IDN],
            ['UN20', 'Universitas Tanjung Pura', $PT, $NAT, $IDN],
            ['UN21', 'Universitas Terbuka', $PT, $NAT, $IDN],
            ['UN22', 'Universitas Universal', $PT, $NAT, $IDN],
            ['UN23', 'Universitas Nusa Putra', $PT, $NAT, $IDN],
            ['UN24', 'UNIVERSITAS NEGERI MEDAN', $PT, $NAT, $IDN],
            ['UN25', 'Universitas Andalas', $PT, $NAT, $IDN],
            ['UN26', 'UNIVERSITAS MARITIM RAJA ALI HAJI (UMRAH)', $PT, $NAT, $IDN],

            // Y / YA - Yayasan / Individual
            ['Y01',  'Yuditha Prameswari, M.Psi., Psikolog', $ORG, $NAT, $IDN],
            ['YA01', 'Yayasan Bahasa Indonesia Australia/Indonesia Australia Language Foundation (Ialf)', $ORG, $NAT, $IDN],
            ['YA02', 'Yayasan Bina Teruna Indonesia Bumi Cendrawasih (Binterbusih) Semarang', $ORG, $NAT, $IDN],
            ['YA03', 'Yayasan Bintan Resort', $ORG, $NAT, $IDN],
            ['YA04', 'Yayasan Cinderella Indonesia', $ORG, $NAT, $IDN],
            ['YA05', 'Yayasan Embun Pelangi Kota Batam', $ORG, $NAT, $IDN],
            ['YA06', 'Yayasan Ikbal-M-Yos Batam', $ORG, $NAT, $IDN],
            ['YA07', 'Yayasan Logistik Indonesia', $ORG, $NAT, $IDN],
            ['YA08', 'Yayasan Prestasi Junior Gemilang Indonesia', $ORG, $NAT, $IDN],
            ['YA09', 'Yayasan Rumah Kreatif Bunda', $ORG, $NAT, $IDN],
            ['YA10', 'Yayasan Tiblat Istiqomah Al-Amin', $ORG, $NAT, $IDN],
            ['YA11', 'Yayasan Cipta Generasi Indonesia', $ORG, $NAT, $IDN],
        ];

        foreach ($data as [$kode, $nama, $kategori, $tingkat, $negara]) {
            MasterMitra::updateOrCreate(
                ['kode_mitra' => $kode],
                [
                    'nama_mitra'          => $nama,
                    'kategori_mitra'      => $kategori,
                    'tingkat_perusahaan'  => $tingkat,
                    'negara'              => $negara,
                    'aktif'               => true,
                ]
            );
        }
    }
}
