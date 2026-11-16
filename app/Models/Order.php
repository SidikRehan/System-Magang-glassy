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
        'dp_proof_path',
        'payment_proof_path',
        'payment_method',
        'status',
        'assigned_driver',
        'assigned_vehicle',
        'trip_code',
        'current_division',
        'division_progress',
        'division_timestamps',
        'used_scrap_rak',
        'revision_notes',
        'gudang_released_at',
        'execution_completed_at',
        'shipped_at',
        'delivered_at',
        'is_revised',
        'revision_status',
        'revision_count',
        'revision_history',
        'complaint_status',
        'complaint_data',
        'raw_materials_used',
        'is_company_use',
        'proof_photo_path',
        'recipient_name',
        'delivery_date',
    ];

    protected $casts = [
        'order_date' => 'date',
        'gudang_released_at' => 'datetime',
        'execution_completed_at' => 'datetime',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
        'processes' => 'array',
        'accessories' => 'array',
        'items' => 'array',
        'division_progress' => 'array',
        'division_timestamps' => 'array',
        'revision_history' => 'array',
        'complaint_data' => 'array',
        'raw_materials_used' => 'array',
        'is_revised' => 'boolean',
        'is_company_use' => 'boolean',
        'revision_count' => 'integer',
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

    /**
     * Normalisasi key division_progress / division_timestamps.
     * Controller menulis key via strtoupper() sehingga Etsa tersimpan sebagai 'ETSA',
     * sedangkan default & frontend memakai 'Etsa'. Key 'ETSA' (hasil kerja divisi) diprioritaskan.
     */
    protected static function normalizeDivisionKeys(Order $order): void
    {
        foreach (['division_progress', 'division_timestamps'] as $attr) {
            $data = $order->{$attr};
            if (!is_array($data) || !array_key_exists('ETSA', $data)) {
                continue;
            }
            $new = $data['ETSA'];
            $old = $data['Etsa'] ?? null;
            if (is_array($new) && is_array($old)) {
                foreach ($old as $k => $v) {
                    if (empty($new[$k]) && !empty($v)) {
                        $new[$k] = $v;
                    }
                }
            }
            $data['Etsa'] = $new;
            unset($data['ETSA']);
            $order->{$attr} = $data;
        }
    }

    protected static function booted(): void
    {
        static::saving(function (Order $order) {
            static::normalizeDivisionKeys($order);
        });

        static::retrieved(function (Order $order) {
            static::normalizeDivisionKeys($order);
            $order->syncOriginalAttributes(['division_progress', 'division_timestamps']);
        });
    }
}
