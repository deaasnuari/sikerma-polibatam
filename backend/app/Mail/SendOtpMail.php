<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SendOtpMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(public string $otp) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Kode Verifikasi Registrasi SIKERMA Polibatam',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            htmlString: $this->buildHtml(),
        );
    }

    private function buildHtml(): string
    {
        return <<<HTML
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <title>Kode OTP SIKERMA</title>
        </head>
        <body style="margin:0;padding:0;background-color:#f1f5f9;font-family:Arial,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 0;">
                <tr>
                    <td align="center">
                        <table width="520" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                            <!-- Header -->
                            <tr>
                                <td style="background-color:#173B82;padding:28px 32px;text-align:center;">
                                    <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">
                                        SIKERMA Polibatam
                                    </p>
                                    <p style="margin:6px 0 0;font-size:13px;color:#93c5fd;">
                                        Sistem Informasi Kerja Sama Politeknik Batam
                                    </p>
                                </td>
                            </tr>
                            <!-- Body -->
                            <tr>
                                <td style="padding:36px 32px;">
                                    <p style="margin:0 0 12px;font-size:15px;color:#334155;">Halo,</p>
                                    <p style="margin:0 0 24px;font-size:15px;color:#334155;line-height:1.6;">
                                        Kami menerima permintaan registrasi akun mitra di SIKERMA Polibatam.
                                        Gunakan kode OTP berikut untuk menyelesaikan proses pendaftaran Anda:
                                    </p>
                                    <!-- OTP Box -->
                                    <div style="background-color:#f0f4ff;border:2px dashed #173B82;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
                                        <p style="margin:0 0 6px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Kode Verifikasi Anda</p>
                                        <p style="margin:0;font-size:40px;font-weight:800;color:#173B82;letter-spacing:10px;">{$this->otp}</p>
                                    </div>
                                    <p style="margin:0 0 8px;font-size:13px;color:#ef4444;font-weight:600;">
                                        ⚠️ Kode ini hanya berlaku selama <strong>5 menit</strong>.
                                    </p>
                                    <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;">
                                        Jika Anda tidak merasa melakukan pendaftaran ini, abaikan email ini.
                                        Kode tidak akan aktif jika tidak digunakan.
                                    </p>
                                </td>
                            </tr>
                            <!-- Footer -->
                            <tr>
                                <td style="background-color:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 32px;text-align:center;">
                                    <p style="margin:0;font-size:12px;color:#94a3b8;">
                                        Email ini dikirim secara otomatis oleh sistem SIKERMA Polibatam.<br/>
                                        Harap jangan membalas email ini.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        HTML;
    }
}
