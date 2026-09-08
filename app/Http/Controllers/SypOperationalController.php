<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Order;
use App\Models\ScrapGlass;
use App\Models\Delivery;

class SypOperationalController extends Controller
{
    /**
     * Public Landing Page View with Glass Simulator & Cost Estimator
     */
    public function welcome()
    {
        return Inertia::render('Welcome', [
            'scrapCount' => ScrapGlass::where('status', 'Layak Pakai')->count(),
            'totalOrders' => Order::count(),
        ]);
    }

    /**
     * Syp Dashboard Utama
     */
    public function dashboard()
    {
        return Inertia::render('Dashboard', [
            'orders' => Order::latest()->get(),
            'scrapGlasses' => ScrapGlass::latest()->get(),
            'deliveries' => Delivery::with('order')->latest()->get(),
            'metrics' => [
                'totalOrders' => Order::count(),
                'inProcess' => Order::where('status', 'pengerjaan')->count(),
                'readyShip' => Order::where('status', 'pengiriman')->count(),
                'scrapCount' => ScrapGlass::count(),
                'totalRevenue' => Order::sum('total_price'),
                'pendingCOD' => Order::where('payment_status', '!=', 'Lunas')->sum('total_price'),
            ]
        ]);
    }
}
