<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ScrapGlass extends Model
{
    use HasFactory;

    protected $fillable = [
        'scrap_code',
        'glass_type',
        'length_cm',
        'width_cm',
        'rak_location',
        'status',
    ];
}
