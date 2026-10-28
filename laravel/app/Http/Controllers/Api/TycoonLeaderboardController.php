<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TycoonLeaderboard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TycoonLeaderboardController extends Controller
{
    public function index(): JsonResponse
    {
        $leaderboard = TycoonLeaderboard::orderByDesc('club_value')
            ->limit(100)
            ->get()
            ->map(fn (TycoonLeaderboard $entry) => $entry->toLegacyPayload())
            ->values()
            ->all();

        return response()->json([
            'success' => true,
            'data' => ['leaderboard' => $leaderboard],
            'message' => '',
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $clubName = trim((string) $request->input('clubName', ''));
        $managerName = trim((string) $request->input('managerName', ''));
        $clubValue = intval($request->input('clubValue', 0));
        $teamOvr = intval($request->input('teamOvr', 0));
        $trophies = intval($request->input('trophies', 0));
        $leagueTier = intval($request->input('leagueTier', 1));
        $leagueName = trim((string) $request->input('leagueName', 'Bölgesel Amatör Lig'));

        if (empty($clubName) || empty($managerName)) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Kulüp adı ve Menajer adı gereklidir.',
            ]);
        }

        $existing = TycoonLeaderboard::whereRaw('LOWER(club_name) = ?', [mb_strtolower($clubName)])->first();
        $now = time();

        if ($existing) {
            $newClubValue = max($existing->club_value, $clubValue);
            $newTeamOvr = max($existing->team_ovr, $teamOvr);
            $newTrophies = max($existing->trophies, $trophies);
            $newLeagueTier = max($existing->league_tier, $leagueTier);

            $payload = [
                'clubName' => $existing->club_name,
                'managerName' => $managerName,
                'clubValue' => $newClubValue,
                'teamOvr' => $newTeamOvr,
                'trophies' => $newTrophies,
                'leagueTier' => $newLeagueTier,
                'leagueName' => $leagueName,
                'updatedAt' => $now,
            ];

            $existing->update([
                'manager_name' => $managerName,
                'club_value' => $newClubValue,
                'team_ovr' => $newTeamOvr,
                'trophies' => $newTrophies,
                'league_tier' => $newLeagueTier,
                'league_name' => $leagueName,
                'updated_at_ts' => $now,
                'entry_data' => $payload,
            ]);
        } else {
            $payload = [
                'clubName' => $clubName,
                'managerName' => $managerName,
                'clubValue' => $clubValue,
                'teamOvr' => $teamOvr,
                'trophies' => $trophies,
                'leagueTier' => $leagueTier,
                'leagueName' => $leagueName,
                'updatedAt' => $now,
            ];

            TycoonLeaderboard::create([
                'club_name' => $clubName,
                'manager_name' => $managerName,
                'club_value' => $clubValue,
                'team_ovr' => $teamOvr,
                'trophies' => $trophies,
                'league_tier' => $leagueTier,
                'league_name' => $leagueName,
                'updated_at_ts' => $now,
                'entry_data' => $payload,
            ]);
        }

        $leaderboard = TycoonLeaderboard::orderByDesc('club_value')
            ->limit(100)
            ->get()
            ->map(fn (TycoonLeaderboard $entry) => $entry->toLegacyPayload())
            ->values()
            ->all();

        return response()->json([
            'success' => true,
            'data' => ['leaderboard' => $leaderboard],
            'message' => 'Sıralama başarıyla kaydedildi!',
        ]);
    }
}

