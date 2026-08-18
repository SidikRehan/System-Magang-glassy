<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_date',
        'spo_number',
        'customer_name',
        'customer_phone',
        'customer_address',
        'glass_type',
        'length_cm',
        'width_cm',
        'thickness_mm',
        'processes',
        'accessories',
        'items',
        'description',
        'sketch_photo_path',
        'priority_status',
        'deadline_date',
        'subtotal',
        'priority_fee',
        'custom_fee',
        'total_price',
        'paid_amount',
        'payment_status',
        'status',
        'current_division',
        'division_progress',
        'used_scrap_rak',
        'revision_notes',
    ];

    protected $casts = [
        'order_date' => 'date',
        'processes' => 'array',
        'accessories' => 'array',
        'items' => 'array',
        'division_progress' => 'array',
        'deadline_date' => 'date',
        'length_cm' => 'float',
        'width_cm' => 'float',
        'subtotal' => 'float',
        'priority_fee' => 'float',
        'custom_fee' => 'float',
        'total_price' => 'float',
        'paid_amount' => 'float',
    ];

    public function deliveries()
    {
        return $this->hasMany(Delivery::class);
    }
}
