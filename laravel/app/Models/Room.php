<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    protected $table = 'rooms';

    protected $fillable = [
        'room_code',
        'max_players',
        'status',
        'players',
        'league_results',
        'last_activity',
        'room_data',
    ];

    protected $casts = [
        'max_players' => 'integer',
        'players' => 'array',
        'league_results' => 'array',
        'last_activity' => 'integer',
        'room_data' => 'array',
    ];

    /**
     * Mevcut JSON formatının birebir aynı usulde döndürülmesini sağlar.
     */
    public function toLegacyPayload(): array
    {
        if (is_array($this->room_data) && !empty($this->room_data)) {
            return $this->room_data;
        }

        $payload = [
            'roomCode' => $this->room_code,
            'maxPlayers' => $this->max_players,
            'status' => $this->status,
            'players' => $this->players ?? [],
            'lastActivity' => $this->last_activity,
        ];

        if (!empty($this->league_results)) {
            $payload['leagueResults'] = $this->league_results;
        }

        return $payload;
    }

    /**
     * JSON verisini model kolonlarıyla senkronize ederek kaydeder.
     */
    public static function saveFromPayload(string $roomCode, array $data): self
    {
        $upperCode = strtoupper($roomCode);
        $data['roomCode'] = $upperCode;

        return self::updateOrCreate(
            ['room_code' => $upperCode],
            [
                'max_players' => intval($data['maxPlayers'] ?? 2),
                'status' => $data['status'] ?? 'waiting',
                'players' => $data['players'] ?? [],
                'league_results' => $data['leagueResults'] ?? null,
                'last_activity' => intval($data['lastActivity'] ?? time()),
                'room_data' => $data,
            ]
        );
    }
}

