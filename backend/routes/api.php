<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Public\PublicFustanController;
use App\Http\Controllers\Public\ReservationRequestController;
use App\Http\Controllers\Staff\CategoryController;
use App\Http\Controllers\Staff\DashboardController;
use App\Http\Controllers\Staff\FustanController;
use App\Http\Controllers\Staff\ReservationController;
use App\Http\Controllers\Staff\RequestController;
use Illuminate\Support\Facades\Route;

Route::prefix('public')->group(function () {
    Route::get('/fustane', [PublicFustanController::class, 'index']);
    Route::get('/fustane/filter-options', [PublicFustanController::class, 'filterOptions']);
    Route::get('/fustane/{fustan}', [PublicFustanController::class, 'show']);
    Route::post('/reservation-requests', [ReservationRequestController::class, 'store']);
    Route::post('/reservation-requests/lookup', [ReservationRequestController::class, 'lookup']);
});

Route::prefix('staff')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);

        Route::get('/dashboard', [DashboardController::class, 'index']);

        Route::apiResource('fustane', FustanController::class);
        Route::get('/fustane/{fustan}/qr', [FustanController::class, 'qrCode']);
        Route::post('/fustane/search-by-code', [FustanController::class, 'findByCode']);

        Route::apiResource('categories', CategoryController::class);
        Route::apiResource('reservations', ReservationController::class);

        Route::get('/requests', [RequestController::class, 'index']);
        Route::post('/requests/{reservationRequest}/approve', [RequestController::class, 'approve']);
        Route::post('/requests/{reservationRequest}/reject', [RequestController::class, 'reject']);
    });
});