<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SypOperationalController;
use Illuminate\Support\Facades\Route;

// Public Landing Page (Awal Running -> Landing Page)
Route::get('/', [SypOperationalController::class, 'welcome'])->name('welcome');

// Protected Syp App Dashboard Route (Memerlukan Login User & Role)
Route::get('/dashboard', [SypOperationalController::class, 'dashboard'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

// Order Operations
Route::middleware(['auth'])->group(function () {
    Route::post('/orders', [SypOperationalController::class, 'storeOrder'])->name('orders.store');
    Route::post('/orders/{id}/update', [SypOperationalController::class, 'updateOrder'])->name('orders.update');
    Route::post('/orders/{id}/promote', [SypOperationalController::class, 'promoteDraftToPengerjaan'])->name('orders.promote');
    Route::post('/orders/{id}/dispatch', [SypOperationalController::class, 'dispatchOrderToDivision'])->name('orders.dispatch');
    Route::post('/orders/{id}/start-job', [SypOperationalController::class, 'startDivisionJob'])->name('orders.start');
    Route::post('/orders/{id}/revision', [SypOperationalController::class, 'submitRevision'])->name('orders.revision');
    Route::post('/orders/{id}/finish-job', [SypOperationalController::class, 'finishDivisionJob'])->name('orders.finish');

    // Scrap Glass Operations
    Route::post('/scrap', [SypOperationalController::class, 'storeScrap'])->name('scrap.store');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
