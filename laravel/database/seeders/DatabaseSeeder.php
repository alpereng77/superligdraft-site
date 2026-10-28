<?php

namespace Database\Seeders;

use App\Models\Room;
use App\Models\TycoonLeaderboard;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database from the legacy JSON files.
     */
    public function run(): void
    {
        ini_set('memory_limit', '1024M');

        $legacyRoot = dirname(base_path());

        // 1. Seed super_lig_nostalji_data.json -> nostalji_seasons
        $nostaljiPath = $legacyRoot . '/super_lig_nostalji_data.json';
        if (file_exists($nostaljiPath)) {
            $this->command?->info('super_lig_nostalji_data.json MySQL tablosuna aktarılıyor...');
            $nostaljiData = json_decode(file_get_contents($nostaljiPath), true);
            if (is_array($nostaljiData)) {
                $now = now();
                foreach ($nostaljiData as $year => $teams) {
                    DB::table('nostalji_seasons')->updateOrInsert(
                        ['season_year' => (string) $year],
                        [
                            'teams_data' => json_encode($teams, JSON_UNESCAPED_UNICODE),
                            'created_at' => $now,
                            'updated_at' => $now,
                        ]
                    );
                }
            }
        }

        // 2. Seed tycoon_players.json -> tycoon_seasons
        $tycoonPlayersPath = $legacyRoot . '/tycoon_players.json';
        if (file_exists($tycoonPlayersPath)) {
            $this->command?->info('tycoon_players.json MySQL tablosuna aktarılıyor...');
            $tycoonData = json_decode(file_get_contents($tycoonPlayersPath), true);
            if (is_array($tycoonData)) {
                $now = now();
                foreach ($tycoonData as $year => $teams) {
                    DB::table('tycoon_seasons')->updateOrInsert(
                        ['season_year' => (string) $year],
                        [
                            'teams_data' => json_encode($teams, JSON_UNESCAPED_UNICODE),
                            'created_at' => $now,
                            'updated_at' => $now,
                        ]
                    );
                }
            }
        }

        // 3. Seed tycoon_leaderboard.json -> tycoon_leaderboards
        $leaderboardPath = $legacyRoot . '/tycoon_leaderboard.json';
        if (file_exists($leaderboardPath)) {
            $this->command?->info('tycoon_leaderboard.json MySQL tablosuna aktarılıyor...');
            $lbData = json_decode(file_get_contents($leaderboardPath), true);
            if (is_array($lbData)) {
                foreach ($lbData as $entry) {
                    if (empty($entry['clubName'])) {
                        continue;
                    }
                    TycoonLeaderboard::updateOrCreate(
                        ['club_name' => $entry['clubName']],
                        [
                            'manager_name' => $entry['managerName'] ?? 'Menajer',
                            'club_value' => intval($entry['clubValue'] ?? 0),
                            'team_ovr' => intval($entry['teamOvr'] ?? 60),
                            'trophies' => intval($entry['trophies'] ?? 0),
                            'league_tier' => intval($entry['leagueTier'] ?? 1),
                            'league_name' => $entry['leagueName'] ?? 'Bölgesel Amatör Lig',
                            'updated_at_ts' => intval($entry['updatedAt'] ?? time()),
                            'entry_data' => $entry,
                        ]
                    );
                }
            }
        }

        // 4. Seed rooms/*.json -> rooms
        $roomsDir = $legacyRoot . '/rooms';
        if (is_dir($roomsDir)) {
            $this->command?->info('rooms/*.json dosyaları MySQL tablosuna aktarılıyor...');
            $files = glob($roomsDir . '/*.json');
            $batch = [];
            $now = now();

            foreach ($files as $file) {
                $content = file_get_contents($file);
                $room = json_decode($content, true);
                if (!is_array($room)) {
                    continue;
                }
                $roomCode = strtoupper($room['roomCode'] ?? pathinfo($file, PATHINFO_FILENAME));
                $room['roomCode'] = $roomCode;

                $batch[] = [
                    'room_code' => $roomCode,
                    'max_players' => intval($room['maxPlayers'] ?? 2),
                    'status' => $room['status'] ?? 'waiting',
                    'players' => json_encode($room['players'] ?? [], JSON_UNESCAPED_UNICODE),
                    'league_results' => isset($room['leagueResults']) ? json_encode($room['leagueResults'], JSON_UNESCAPED_UNICODE) : null,
                    'last_activity' => intval($room['lastActivity'] ?? time()),
                    'room_data' => json_encode($room, JSON_UNESCAPED_UNICODE),
                    'created_at' => $now,
                    'updated_at' => $now,
                ];

                if (count($batch) >= 200) {
                    DB::table('rooms')->upsert(
                        $batch,
                        ['room_code'],
                        ['max_players', 'status', 'players', 'league_results', 'last_activity', 'room_data', 'updated_at']
                    );
                    $batch = [];
                }
            }

            if (!empty($batch)) {
                DB::table('rooms')->upsert(
                    $batch,
                    ['room_code'],
                    ['max_players', 'status', 'players', 'league_results', 'last_activity', 'room_data', 'updated_at']
                );
            }
        }

        $this->command?->info('Tüm oyun verileri başarıyla MySQL veritabanına aktarıldı!');
    }
}
