<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SypOperationalController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\OrderExecutionController;
use App\Http\Controllers\OrderRevisionController;
use App\Http\Controllers\ComplaintController;
use App\Http\Controllers\ScrapController;
use Illuminate\Support\Facades\Route;

// Public Landing Page (Awal Running -> Landing Page)
Route::get('/', [SypOperationalController::class, 'welcome'])->name('welcome');

// Protected Syp App Dashboard Route (Memerlukan Login User & Role)
Route::get('/dashboard', [SypOperationalController::class, 'dashboard'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

// Order Operations
Route::middleware(['auth'])->group(function () {
    Route::post('/orders', [OrderController::class, 'storeOrder'])->name('orders.store');
    Route::post('/orders/{id}/update', [OrderController::class, 'updateOrder'])->name('orders.update');
    
    // Order Execution (Dispatch & Work)
    Route::post('/orders/{id}/promote', [OrderExecutionController::class, 'promoteDraftToPengerjaan'])->name('orders.promote');
    Route::post('/orders/{id}/dispatch', [OrderExecutionController::class, 'dispatchOrderToDivision'])->name('orders.dispatch');
    Route::post('/orders/{id}/start-job', [OrderExecutionController::class, 'startDivisionJob'])->name('orders.start');
    Route::post('/orders/{id}/finish-job', [OrderExecutionController::class, 'finishDivisionJob'])->name('orders.finish');
    
    // Order Revision (Admin Toko vs Gudang)
    Route::post('/orders/{id}/revision', [OrderRevisionController::class, 'submitRevision'])->name('orders.revision');
    Route::post('/orders/{id}/lock-revision', [OrderRevisionController::class, 'lockRevisionEdit'])->name('orders.lock_revision');
    Route::post('/orders/{id}/cancel-revision-lock', [OrderRevisionController::class, 'cancelRevisionLock'])->name('orders.cancel_revision_lock');
    Route::post('/orders/{id}/acknowledge-revision', [OrderRevisionController::class, 'acknowledgeRevision'])->name('orders.acknowledge_revision');

    // Division Defect Complaint Operations
    Route::post('/orders/{id}/complaint', [ComplaintController::class, 'submitGlassComplaint'])->name('orders.complaint');
    Route::post('/orders/{id}/resolve-complaint', [ComplaintController::class, 'resolveGlassComplaint'])->name('orders.resolve_complaint');

    // Scrap Glass Operations
    Route::post('/scrap', [ScrapController::class, 'storeScrap'])->name('scrap.store');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
