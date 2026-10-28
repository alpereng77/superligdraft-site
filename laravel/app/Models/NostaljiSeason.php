<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NostaljiSeason extends Model
{
    protected $table = 'nostalji_seasons';

    protected $fillable = [
        'season_year',
        'teams_data',
    ];

    protected $casts = [
        'teams_data' => 'array',
    ];
}

