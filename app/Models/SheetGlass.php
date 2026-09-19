<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SheetGlass extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'length_cm' => 'float',
        'width_cm' => 'float',
        'thickness_mm' => 'integer',
        'buy_price' => 'float',
        'sell_price' => 'float',
        'rate_gm' => 'float',
        'rate_ht' => 'float',
        'rate_bv' => 'float',
        'rate_etsa' => 'float',
        'qty' => 'integer',
        'last_restock' => 'date',
    ];
}
