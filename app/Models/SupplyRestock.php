<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SupplyRestock extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'request_qty' => 'integer',
    ];

    public function supply()
    {
        return $this->belongsTo(Supply::class);
    }
}
