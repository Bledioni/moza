<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Fustan extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'emri',
        'madhesia',
        'ngjyra',
        'kategoria_id',
        'cmimi_qirase',
        'sasia',
        'foto',
    ];

    protected $appends = ['foto_url'];

    protected static function boot()
    {
        parent::boot();

        static::creating(function (Fustan $fustan) {
            if (empty($fustan->code)) {
                $fustan->code = static::generateNextCode();
            }
        });
    }

    public static function generateNextCode(): string
    {
        $lastNumber = static::query()
            ->whereNotNull('code')
            ->selectRaw("MAX(CAST(SUBSTRING(code, 3) AS UNSIGNED)) as max_number")
            ->value('max_number');

        $nextNumber = ($lastNumber ?? 0) + 1;

        return 'F-' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
    }

    public function getFotoUrlAttribute(): ?string
    {
        return $this->foto ? asset('storage/' . $this->foto) : null;
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'kategoria_id');
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class, 'fustan_id');
    }
}