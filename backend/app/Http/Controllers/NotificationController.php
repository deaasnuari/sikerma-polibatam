<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Mail\Message;

class NotificationController extends Controller
{
    /**
     * Kirim notifikasi email ke mitra kerjasama
     */
    public function sendEmail(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'subject' => 'required|string',
            'body' => 'required|string',
            'jenis' => 'required|string|in:reminder-3bulan,reminder-1bulan,urgent',
            'noDokumen' => 'required|string',
            'namaMitra' => 'required|string',
        ]);

        try {
            // Kirim email menggunakan Laravel Mail
            Mail::raw($validated['body'], function (Message $message) use ($validated) {
                $message
                    ->to($validated['email'])
                    ->subject($validated['subject'])
                    ->from(config('mail.from.address'), config('mail.from.name'));
            });

            return response()->json([
                'success' => true,
                'message' => 'Email notifikasi berhasil dikirim ke ' . $validated['email'],
                'data' => [
                    'email' => $validated['email'],
                    'jenis' => $validated['jenis'],
                    'noDokumen' => $validated['noDokumen'],
                    'sentAt' => now()->toIso8601String(),
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim email: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Kirim notifikasi email bulk ke multiple mitra
     */
    public function sendBulk(Request $request)
    {
        $validated = $request->validate([
            'recipients' => 'required|array',
            'recipients.*.email' => 'required|email',
            'recipients.*.nama' => 'required|string',
            'recipients.*.noDokumen' => 'required|string',
            'subject' => 'required|string',
            'body' => 'required|string',
        ]);

        $results = [];
        $failed = [];

        foreach ($validated['recipients'] as $recipient) {
            try {
                Mail::raw($validated['body'], function (Message $message) use ($recipient, $validated) {
                    $message
                        ->to($recipient['email'])
                        ->subject($validated['subject'])
                        ->from(config('mail.from.address'), config('mail.from.name'));
                });

                $results[] = [
                    'email' => $recipient['email'],
                    'status' => 'success',
                ];
            } catch (\Exception $e) {
                $failed[] = [
                    'email' => $recipient['email'],
                    'error' => $e->getMessage(),
                ];
            }
        }

        return response()->json([
            'success' => count($failed) === 0,
            'message' => 'Email notifikasi berhasil dikirim ke ' . count($results) . ' mitra',
            'results' => $results,
            'failed' => $failed,
        ], count($failed) === 0 ? 200 : 207);
    }
}
