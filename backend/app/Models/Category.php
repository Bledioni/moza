<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'emri',
    ];

    public function fustane()
    {
        return $this->hasMany(Fustan::class, 'kategoria_id');
    }
}