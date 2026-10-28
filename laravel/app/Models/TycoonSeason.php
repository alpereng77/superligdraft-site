<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TycoonSeason extends Model
{
    protected $table = 'tycoon_seasons';

    protected $fillable = [
        'season_year',
        'teams_data',
    ];

    protected $casts = [
        'teams_data' => 'array',
    ];
}

