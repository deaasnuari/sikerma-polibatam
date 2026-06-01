<?php

use Carbon\Carbon;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('dokumen_log')) {
            return;
        }

        DB::table('dokumen_log')
            ->whereNotNull('payload_json')
            ->orderBy('id')
            ->chunkById(200, function ($rows): void {
                foreach ($rows as $row) {
                    $payload = $this->toPayloadArray($row->payload_json ?? null);
                    if (empty($payload)) {
                        continue;
                    }

                    $update = [
                        'nomor' => $this->pickFirstString($row->nomor ?? null, $payload, ['nomor', 'no_dokumen', 'nomor_dokumen']),
                        'mitra' => $this->pickFirstString($row->mitra ?? null, $payload, ['mitra', 'nama_mitra', 'namaMitra']),
                        'telepon' => $this->pickFirstString($row->telepon ?? null, $payload, ['telepon', 'wa', 'whatsapp', 'whatsapp_pengusul']),
                        'tgl_mulai' => $this->pickDate($row->tgl_mulai ?? null, $payload, ['tgl_mulai', 'tanggal_mulai', 'tanggalMulai']),
                        'tgl_berakhir' => $this->pickDate($row->tgl_berakhir ?? null, $payload, ['tgl_berakhir', 'tanggal_berakhir', 'tanggalBerakhir']),
                        'unit' => $this->pickFirstString($row->unit ?? null, $payload, ['unit', 'unit_pelaksana', 'unitPelaksana']),
                        'lingkup' => $this->pickFirstStringOrArray($row->lingkup ?? null, $payload, ['lingkup', 'ruang_lingkup', 'ruangLingkup']),
                        'tingkat' => $this->pickFirstString($row->tingkat ?? null, $payload, ['tingkat']),
                        'periode' => $this->pickFirstString($row->periode ?? null, $payload, ['periode']),
                        'judul' => $this->pickFirstString($row->judul ?? null, $payload, ['judul', 'judul_kegiatan', 'judulKerjasama']),
                        'manfaat' => $this->pickFirstString($row->manfaat ?? null, $payload, ['manfaat', 'catatan', 'catatan_perpanjangan', 'catatanPerpanjangan']),
                        'bukti' => $this->pickFirstString($row->bukti ?? null, $payload, ['bukti', 'bukti_perpanjangan', 'buktiPerpanjangan']),
                        'status' => $this->pickFirstString($row->status ?? null, $payload, ['status', 'status_perpanjangan', 'statusPerpanjangan']),
                        'pic' => $this->pickFirstString($row->pic ?? null, $payload, ['pic', 'nama_pic', 'namaPic']),
                        'tgl_monitoring' => $this->pickDate($row->tgl_monitoring ?? null, $payload, ['tgl_monitoring', 'tanggal_monitoring', 'tanggalMonitoring', 'requestedAt']),
                    ];

                    DB::table('dokumen_log')
                        ->where('id', $row->id)
                        ->update($update);
                }
            });
    }

    public function down(): void
    {
        // Backfill data migration: no destructive rollback.
    }

    private function toPayloadArray($payload): array
    {
        if (is_array($payload)) {
            return $payload;
        }

        if (is_object($payload)) {
            return (array) $payload;
        }

        if (!is_string($payload) || trim($payload) === '') {
            return [];
        }

        $decoded = json_decode($payload, true);
        return is_array($decoded) ? $decoded : [];
    }

    private function pickFirstString($existingValue, array $payload, array $keys): ?string
    {
        if (is_string($existingValue) && trim($existingValue) !== '') {
            return trim($existingValue);
        }

        foreach ($keys as $key) {
            if (!array_key_exists($key, $payload)) {
                continue;
            }

            $value = $payload[$key];
            if (is_string($value) && trim($value) !== '') {
                return trim($value);
            }
            if (is_numeric($value)) {
                return (string) $value;
            }
        }

        return null;
    }

    private function pickFirstStringOrArray($existingValue, array $payload, array $keys): ?string
    {
        if (is_string($existingValue) && trim($existingValue) !== '') {
            return trim($existingValue);
        }

        foreach ($keys as $key) {
            if (!array_key_exists($key, $payload)) {
                continue;
            }

            $value = $payload[$key];
            if (is_string($value) && trim($value) !== '') {
                return trim($value);
            }

            if (is_array($value)) {
                $parts = array_values(array_filter(array_map(static function ($item) {
                    if (is_string($item)) {
                        return trim($item);
                    }
                    if (is_numeric($item)) {
                        return (string) $item;
                    }

                    return null;
                }, $value)));

                if (!empty($parts)) {
                    return implode(', ', $parts);
                }
            }
        }

        return null;
    }

    private function pickDate($existingValue, array $payload, array $keys): ?string
    {
        $existing = $this->normalizeDateToYmd($existingValue);
        if ($existing !== null) {
            return $existing;
        }

        foreach ($keys as $key) {
            if (!array_key_exists($key, $payload)) {
                continue;
            }

            $normalized = $this->normalizeDateToYmd($payload[$key]);
            if ($normalized !== null) {
                return $normalized;
            }
        }

        return null;
    }

    private function normalizeDateToYmd($value): ?string
    {
        if ($value instanceof \DateTimeInterface) {
            return $value->format('Y-m-d');
        }

        if (!is_string($value)) {
            return null;
        }

        $raw = trim($value);
        if ($raw === '' || $raw === '-') {
            return null;
        }

        $formats = ['Y-m-d', 'd-m-Y', 'd/m/Y', 'Y/m/d'];
        foreach ($formats as $format) {
            try {
                $date = Carbon::createFromFormat($format, $raw);
                if ($date !== false) {
                    return $date->format('Y-m-d');
                }
            } catch (\Throwable $e) {
                // Try next format.
            }
        }

        try {
            return Carbon::parse($raw)->format('Y-m-d');
        } catch (\Throwable $e) {
            return null;
        }
    }
};