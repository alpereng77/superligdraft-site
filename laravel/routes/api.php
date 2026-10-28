<?php

use App\Http\Controllers\Api\DatasetController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\TycoonLeaderboardController;
use Illuminate\Support\Facades\Route;

Route::prefix('datasets')->group(function () {
    Route::get('/nostalji', [DatasetController::class, 'nostalji']);
    Route::get('/tycoon-players', [DatasetController::class, 'tycoonPlayers']);
});

Route::prefix('rooms')->group(function () {
    Route::get('/state', [RoomController::class, 'show']);
    Route::post('/create', [RoomController::class, 'create']);
    Route::post('/join', [RoomController::class, 'join']);
    Route::post('/ready', [RoomController::class, 'setReady']);
});

Route::prefix('tycoon')->group(function () {
    Route::get('/leaderboard', [TycoonLeaderboardController::class, 'index']);
    Route::post('/leaderboard', [TycoonLeaderboardController::class, 'store']);
});

