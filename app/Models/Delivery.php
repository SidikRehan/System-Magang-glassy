<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Delivery extends Model
{
    use HasFactory;

    protected $fillable = [
        'waybill_number',
        'order_id',
        'driver_name',
        'vehicle_plate',
        'waybill_color',
        'delivery_status',
        'proof_photo_path',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
