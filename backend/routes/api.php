<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\CarouselImageController;
use App\Http\Controllers\OtpController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::get('/me', [AuthController::class, 'me']);
Route::apiResource('/admin/users', AdminUserController::class)->only(['index', 'store', 'update', 'destroy']);
Route::patch('/admin/users/{user}/approval-status', [AdminUserController::class, 'update']);

Route::get('/carousel-images', [CarouselImageController::class, 'index']);
Route::post('/admin/carousel-images', [CarouselImageController::class, 'store']);
Route::patch('/admin/carousel-images/{carouselImage}', [CarouselImageController::class, 'update']);
Route::delete('/admin/carousel-images/{carouselImage}', [CarouselImageController::class, 'destroy']);

// OTP Email Verification Routes
Route::post('/otp/send', [OtpController::class, 'sendOtp']);
Route::post('/otp/verify', [OtpController::class, 'verifyOtp']);
