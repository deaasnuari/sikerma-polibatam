<?php

namespace App\Http\Controllers;

use App\Models\CarouselImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class CarouselImageController extends Controller
{
    private const MAX_IMAGES = 7;

    public function index(): JsonResponse
    {
        $images = CarouselImage::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (CarouselImage $image) => [
                'id' => $image->id,
                'title' => $image->title,
                'image_path' => $image->image_path,
                'image_url' => Storage::disk('public')->url($image->image_path),
                'sort_order' => $image->sort_order,
                'is_active' => $image->is_active,
            ]);

        return response()->json([
            'data' => $images,
            'max_images' => self::MAX_IMAGES,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $currentCount = CarouselImage::query()->where('is_active', true)->count();

        if ($currentCount >= self::MAX_IMAGES) {
            throw ValidationException::withMessages([
                'image' => ['Maksimal 7 gambar carousel aktif. Hapus salah satu gambar terlebih dahulu.'],
            ]);
        }

        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $storedPath = $request->file('image')->store('carousel', 'public');

        $image = CarouselImage::create([
            'title' => $validated['title'] ?? null,
            'image_path' => $storedPath,
            'sort_order' => $validated['sort_order'] ?? $currentCount,
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'Gambar carousel berhasil diupload.',
            'data' => [
                'id' => $image->id,
                'title' => $image->title,
                'image_path' => $image->image_path,
                'image_url' => Storage::disk('public')->url($image->image_path),
                'sort_order' => $image->sort_order,
                'is_active' => $image->is_active,
            ],
        ], 201);
    }

    public function update(Request $request, CarouselImage $carouselImage): JsonResponse
    {
        $validated = $request->validate([
            'sort_order' => ['required', 'integer', 'min:0', 'max:9999'],
        ]);

        $carouselImage->update(['sort_order' => $validated['sort_order']]);

        return response()->json(['message' => 'Urutan carousel diperbarui.']);
    }

    public function destroy(CarouselImage $carouselImage): JsonResponse
    {
        if ($carouselImage->image_path && Storage::disk('public')->exists($carouselImage->image_path)) {
            Storage::disk('public')->delete($carouselImage->image_path);
        }

        $carouselImage->delete();

        return response()->json([
            'message' => 'Gambar carousel berhasil dihapus.',
        ]);
    }
}
