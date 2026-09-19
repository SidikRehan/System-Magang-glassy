<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tool extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'total_qty' => 'integer',
        'available_qty' => 'integer',
    ];

    public function borrows()
    {
        return $this->hasMany(ToolBorrow::class);
    }
}
