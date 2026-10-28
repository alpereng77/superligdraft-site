<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NostaljiSeason;
use App\Models\TycoonSeason;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class DatasetController extends Controller
{
    /**
     * super_lig_nostalji_data.json verisini MySQL üzerinden birebir aynı JSON yapısında döndürür.
     */
    public function nostalji(): Response
    {
        $rows = DB::table('nostalji_seasons')
            ->orderBy('season_year')
            ->get(['season_year', 'teams_data']);

        $parts = [];
        foreach ($rows as $row) {
            $yearKey = json_encode((string) $row->season_year, JSON_UNESCAPED_UNICODE);
            $parts[] = $yearKey . ':' . $row->teams_data;
        }

        $json = '{' . implode(',', $parts) . '}';

        return response($json, 200, [
            'Content-Type' => 'application/json; charset=utf-8',
        ]);
    }

    /**
     * tycoon_players.json verisini MySQL üzerinden birebir aynı JSON yapısında döndürür.
     */
    public function tycoonPlayers(): Response
    {
        $rows = DB::table('tycoon_seasons')
            ->orderBy('season_year')
            ->get(['season_year', 'teams_data']);

        $parts = [];
        foreach ($rows as $row) {
            $yearKey = json_encode((string) $row->season_year, JSON_UNESCAPED_UNICODE);
            $parts[] = $yearKey . ':' . $row->teams_data;
        }

        $json = '{' . implode(',', $parts) . '}';

        return response($json, 200, [
            'Content-Type' => 'application/json; charset=utf-8',
        ]);
    }
}

