<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::get('/me', [AuthController::class, 'me']);
Route::get('/admin/users', [AuthController::class, 'users']);
Route::patch('/admin/users/{user}/approval-status', [AuthController::class, 'updateApprovalStatus']);
