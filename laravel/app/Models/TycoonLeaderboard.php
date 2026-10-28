<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TycoonLeaderboard extends Model
{
    protected $table = 'tycoon_leaderboards';

    protected $fillable = [
        'club_name',
        'manager_name',
        'club_value',
        'team_ovr',
        'trophies',
        'league_tier',
        'league_name',
        'updated_at_ts',
        'entry_data',
    ];

    protected $casts = [
        'club_value' => 'integer',
        'team_ovr' => 'integer',
        'trophies' => 'integer',
        'league_tier' => 'integer',
        'updated_at_ts' => 'integer',
        'entry_data' => 'array',
    ];

    public function toLegacyPayload(): array
    {
        if (is_array($this->entry_data) && !empty($this->entry_data)) {
            return $this->entry_data;
        }

        return [
            'clubName' => $this->club_name,
            'managerName' => $this->manager_name,
            'clubValue' => $this->club_value,
            'teamOvr' => $this->team_ovr,
            'trophies' => $this->trophies,
            'leagueTier' => $this->league_tier,
            'leagueName' => $this->league_name,
            'updatedAt' => $this->updated_at_ts,
        ];
    }
}

