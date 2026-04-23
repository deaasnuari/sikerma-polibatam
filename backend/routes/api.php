<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminUserController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::get('/me', [AuthController::class, 'me']);
Route::apiResource('/admin/users', AdminUserController::class)->only(['index', 'store', 'update', 'destroy']);
Route::patch('/admin/users/{user}/approval-status', [AdminUserController::class, 'update']);
