<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OtpCode extends Model
{
    protected $fillable = [
        'email',
        'otp',
        'form_data',
        'expires_at',
        'is_used',
    ];

    protected $casts = [
        'form_data'  => 'array',
        'expires_at' => 'datetime',
        'is_used'    => 'boolean',
    ];

    /**
     * Cek apakah OTP sudah kedaluwarsa.
     */
    public function isExpired(): bool
    {
        return now()->isAfter($this->expires_at);
    }
}
