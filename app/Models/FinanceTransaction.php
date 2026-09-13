<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinanceTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_code',
        'type',
        'category',
        'title',
        'amount',
        'supplier_name',
        'invoice_number',
        'payment_method',
        'payment_status',
        'approval_status',
        'source_role',
        'vehicle_plate',
        'transaction_date',
        'due_date',
        'notes',
        'receipt_photo_path',
        'user_id',
        'approved_by_user_id',
        'approved_at',
        'rejection_reason',
    ];

    protected $casts = [
        'amount' => 'float',
        'transaction_date' => 'date',
        'due_date' => 'date',
        'approved_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by_user_id');
    }

    public function scopeApproved($query)
    {
        return $query->where('approval_status', 'approved');
    }

    public function scopePending($query)
    {
        return $query->where('approval_status', 'pending');
    }
}

