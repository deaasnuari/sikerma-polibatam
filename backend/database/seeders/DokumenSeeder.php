<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DokumenSeeder extends Seeder
{
    public function run(): void
    {
        $sqlFile = 'C:/Users/ASUS/Downloads/sikerma_old.sql';

        if (!file_exists($sqlFile)) {
            $this->command->error("File SQL tidak ditemukan: {$sqlFile}");
            return;
        }

        $content = file_get_contents($sqlFile);

        // Extract INSERT block for dokumen
        $startMarker = "INSERT INTO `dokumen`";
        $startPos = strpos($content, $startMarker);
        if ($startPos === false) {
            $this->command->error("INSERT INTO dokumen tidak ditemukan.");
            return;
        }

        // Find end of INSERT block (next -- separator or next CREATE TABLE)
        $endPos = strpos($content, "\n-- ---", $startPos + 100);
        if ($endPos === false) {
            $endPos = strlen($content);
        }

        $insertBlock = substr($content, $startPos, $endPos - $startPos);

        // Get all value rows: lines starting with (
        preg_match_all("/\('.*?'\)(?:,|;)/s", $insertBlock, $matches);

        if (empty($matches[0])) {
            $this->command->error("Tidak ada data yang ditemukan.");
            return;
        }

        $rows = [];
        foreach ($matches[0] as $rowStr) {
            // Remove trailing , or ;
            $rowStr = rtrim($rowStr, ',;');
            // Remove outer parentheses
            $rowStr = substr($rowStr, 1, -1);

            // Parse CSV-like values respecting single-quoted strings
            $values = $this->parseSqlRow($rowStr);

            if (count($values) !== 12) {
                continue;
            }

            $rows[] = [
                'no_dokumen'         => $this->nullify($values[0]),
                'mitra'              => $this->nullify($values[1]),
                'telepon'            => $this->nullify($values[2]),
                'negara'             => $this->nullify($values[3]),
                'kategori_institusi' => $this->nullify($values[4]),
                'jenis_ajuan'        => $this->nullify($values[5]),
                'bidang'             => $this->nullify($values[6]),
                'unit'               => $this->nullify($values[7]),
                'tahun'              => $values[8] === 'NULL' ? null : (int) $values[8],
                'tgl_mulai'          => $this->nullifyDate($values[9]),
                'tgl_akhir'          => $this->nullifyDate($values[10]),
                'file'               => $this->nullify($values[11]),
                'created_at'         => now(),
                'updated_at'         => now(),
            ];
        }

        // Chunk insert to avoid memory issues
        foreach (array_chunk($rows, 100) as $chunk) {
            DB::table('dokumen')->insert($chunk);
        }

        $this->command->info("Berhasil import " . count($rows) . " baris ke tabel dokumen.");
    }

    private function parseSqlRow(string $row): array
    {
        $values = [];
        $i = 0;
        $len = strlen($row);

        while ($i < $len) {
            // Skip whitespace and commas between values
            while ($i < $len && ($row[$i] === ',' || $row[$i] === ' ')) {
                $i++;
            }
            if ($i >= $len) break;

            if ($row[$i] === "'") {
                // Quoted string
                $i++; // skip opening quote
                $val = '';
                while ($i < $len) {
                    if ($row[$i] === "'" && ($i + 1 >= $len || $row[$i + 1] !== "'")) {
                        $i++; // skip closing quote
                        break;
                    }
                    if ($row[$i] === "'" && $i + 1 < $len && $row[$i + 1] === "'") {
                        // Escaped single quote ''
                        $val .= "'";
                        $i += 2;
                    } else {
                        $val .= $row[$i];
                        $i++;
                    }
                }
                $values[] = $val;
            } else {
                // Unquoted value (NULL or number)
                $end = $i;
                while ($end < $len && $row[$end] !== ',') {
                    $end++;
                }
                $values[] = trim(substr($row, $i, $end - $i));
                $i = $end;
            }
        }

        return $values;
    }

    private function nullify(string $val): ?string
    {
        return ($val === 'NULL' || $val === '') ? null : $val;
    }

    private function nullifyDate(string $val): ?string
    {
        if ($val === 'NULL' || $val === '' || $val === '0000-00-00') {
            return null;
        }
        // Validate date format YYYY-MM-DD
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $val)) {
            return $val;
        }
        return null;
    }
}
