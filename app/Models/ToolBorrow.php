<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ToolBorrow extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'borrow_date' => 'datetime',
        'return_date' => 'datetime',
        'qty' => 'integer',
    ];

    public function tool()
    {
        return $this->belongsTo(Tool::class);
    }
}
