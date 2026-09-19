<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Accessory extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'buy_price' => 'float',
        'sell_price' => 'float',
        'qty' => 'integer',
    ];
}
