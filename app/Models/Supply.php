<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supply extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'qty' => 'integer',
        'min_stock' => 'integer',
    ];

    public function usages()
    {
        return $this->hasMany(SupplyUsage::class);
    }

    public function restocks()
    {
        return $this->hasMany(SupplyRestock::class);
    }
}
