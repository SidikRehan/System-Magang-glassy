<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SypOperationalController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\OrderExecutionController;
use App\Http\Controllers\OrderRevisionController;
use App\Http\Controllers\ComplaintController;
use App\Http\Controllers\ScrapController;
use App\Http\Controllers\InventoryMasterController;
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
    Route::post('/orders/{id}/lock-revision', [SypOperationalController::class, 'lockRevisionEdit'])->name('orders.lock_revision');
    Route::post('/orders/{id}/cancel-revision-lock', [SypOperationalController::class, 'cancelRevisionLock'])->name('orders.cancel_revision_lock');
    Route::post('/orders/{id}/acknowledge-revision', [SypOperationalController::class, 'acknowledgeRevision'])->name('orders.acknowledge_revision');
    Route::post('/orders/{id}/finish-job', [SypOperationalController::class, 'finishDivisionJob'])->name('orders.finish');
    Route::post('/orders/{id}/raw-material', [SypOperationalController::class, 'recordRawMaterialUsage'])->name('orders.raw_material');
    Route::post('/orders/{id}/complete-delivery', [SypOperationalController::class, 'completeDelivery'])->name('orders.complete_delivery');
    Route::post('/orders/batch-delivery', [SypOperationalController::class, 'assignBatchDelivery'])->name('orders.batch_delivery');

    // Division Defect Complaint Operations
    Route::post('/orders/{id}/complaint', [ComplaintController::class, 'submitGlassComplaint'])->name('orders.complaint');
    Route::post('/orders/{id}/resolve-complaint', [ComplaintController::class, 'resolveGlassComplaint'])->name('orders.resolve_complaint');

    // Scrap Glass & Rejection Operations
    Route::post('/scrap', [ScrapController::class, 'storeScrap'])->name('scrap.store');
    Route::post('/scrap/{id}/update', [ScrapController::class, 'updateScrap'])->name('scrap.update');
    Route::post('/orders/{id}/use-scrap', [SypOperationalController::class, 'useScrapRecommendation'])->name('orders.use_scrap');
    Route::post('/orders/{id}/reject-scrap', [SypOperationalController::class, 'rejectScrapRecommendation'])->name('orders.reject_scrap');

    // Employee & User Account Management Operations
    Route::post('/users', [SypOperationalController::class, 'storeUser'])->name('users.store');
    Route::post('/users/{id}/update', [SypOperationalController::class, 'updateUser'])->name('users.update');
    Route::delete('/users/{id}', [SypOperationalController::class, 'destroyUser'])->name('users.destroy');

    // Finance & Accounting Operations
    Route::post('/finance/transactions', [SypOperationalController::class, 'storeFinanceTransaction'])->name('finance.transactions.store');
    Route::post('/finance/transactions/{id}/approve', [SypOperationalController::class, 'approveFinanceTransaction'])->name('finance.transactions.approve');
    Route::post('/finance/transactions/{id}/reject', [SypOperationalController::class, 'rejectFinanceTransaction'])->name('finance.transactions.reject');
    Route::delete('/finance/transactions/{id}', [SypOperationalController::class, 'destroyFinanceTransaction'])->name('finance.transactions.destroy');
    Route::post('/orders/{id}/settle-cod', [SypOperationalController::class, 'settleCodHandover'])->name('orders.settle_cod');

    // Master Inventory & Supplies Operations
    // 1. Sheet Glasses
    Route::post('/inventory/sheet-glasses', [InventoryMasterController::class, 'storeSheetGlass'])->name('inventory.sheet_glasses.store');
    Route::post('/inventory/sheet-glasses/{id}', [InventoryMasterController::class, 'updateSheetGlass'])->name('inventory.sheet_glasses.update');
    Route::post('/inventory/sheet-glasses/{id}/restock', [InventoryMasterController::class, 'restockSheetGlass'])->name('inventory.sheet_glasses.restock');
    Route::delete('/inventory/sheet-glasses/{id}', [InventoryMasterController::class, 'destroySheetGlass'])->name('inventory.sheet_glasses.destroy');

    // 2. Suppliers
    Route::post('/inventory/suppliers', [InventoryMasterController::class, 'storeSupplier'])->name('inventory.suppliers.store');
    Route::post('/inventory/suppliers/{id}', [InventoryMasterController::class, 'updateSupplier'])->name('inventory.suppliers.update');
    Route::delete('/inventory/suppliers/{id}', [InventoryMasterController::class, 'destroySupplier'])->name('inventory.suppliers.destroy');

    // 3. Accessories
    Route::post('/inventory/accessories', [InventoryMasterController::class, 'storeAccessory'])->name('inventory.accessories.store');
    Route::post('/inventory/accessories/{id}', [InventoryMasterController::class, 'updateAccessory'])->name('inventory.accessories.update');
    Route::post('/inventory/accessories/{id}/restock', [InventoryMasterController::class, 'restockAccessory'])->name('inventory.accessories.restock');
    Route::delete('/inventory/accessories/{id}', [InventoryMasterController::class, 'destroyAccessory'])->name('inventory.accessories.destroy');

    // 4. Tools & Borrows
    Route::post('/inventory/tools', [InventoryMasterController::class, 'storeTool'])->name('inventory.tools.store');
    Route::post('/inventory/tools/{id}', [InventoryMasterController::class, 'updateTool'])->name('inventory.tools.update');
    Route::post('/inventory/tools/{id}/borrow', [InventoryMasterController::class, 'borrowTool'])->name('inventory.tools.borrow');
    Route::post('/inventory/tools/borrows/{borrowId}/return', [InventoryMasterController::class, 'returnTool'])->name('inventory.tools.return');
    Route::post('/inventory/tools/{id}/repair', [InventoryMasterController::class, 'repairTool'])->name('inventory.tools.repair');
    Route::delete('/inventory/tools/{id}', [InventoryMasterController::class, 'destroyTool'])->name('inventory.tools.destroy');

    // 5. Supplies (Bahan Habis Pakai)
    Route::post('/inventory/supplies', [InventoryMasterController::class, 'storeSupply'])->name('inventory.supplies.store');
    Route::post('/inventory/supplies/{id}', [InventoryMasterController::class, 'updateSupply'])->name('inventory.supplies.update');
    Route::post('/inventory/supplies/batch-use', [InventoryMasterController::class, 'batchUseSupplies'])->name('inventory.supplies.batch_use');
    Route::post('/inventory/supplies/{id}/use', [InventoryMasterController::class, 'useSupply'])->name('inventory.supplies.use');
    Route::post('/inventory/supplies/{id}/restock-request', [InventoryMasterController::class, 'requestRestockSupply'])->name('inventory.supplies.restock_request');
    Route::post('/inventory/supplies/restocks/{restockId}/approve', [InventoryMasterController::class, 'approveRestockSupply'])->name('inventory.supplies.restock_approve');
    Route::delete('/inventory/supplies/{id}', [InventoryMasterController::class, 'destroySupply'])->name('inventory.supplies.destroy');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
