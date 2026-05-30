<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;

class PgArrayCast implements CastsAttributes
{
    /**
     * Cast the given value.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function get(Model $model, string $key, mixed $value, array $attributes): mixed
    {
        if ($value === null) {
            return [];
        }

        if (is_array($value)) {
            return $value;
        }

        // Parse Postgres array literal like "{1,2}"
        $value = trim($value, '{}');
        if ($value === '') {
            return [];
        }

        return array_map('intval', explode(',', $value));
    }

    /**
     * Prepare the given value for storage.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function set(Model $model, string $key, mixed $value, array $attributes): mixed
    {
        if ($value === null) {
            return '{}';
        }

        if (is_string($value)) {
            // Already formatted as pg array?
            if (str_starts_with($value, '{') && str_ends_with($value, '}')) {
                return $value;
            }
            // Maybe JSON
            $value = json_decode($value, true) ?? [];
        }

        if (!is_array($value)) {
            $value = [];
        }

        return '{' . implode(',', $value) . '}';
    }
}
