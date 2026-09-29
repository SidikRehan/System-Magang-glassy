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
    public function setGlassTypeAttribute($value)
    {
        if ($value) {
            $value = preg_replace('/(\d+)\s*mm/i', '$1 mm', $value);
            $value = preg_replace('/\s+/', ' ', $value);
            $value = trim($value);
        }
        $this->attributes['glass_type'] = $value;
    }
}
