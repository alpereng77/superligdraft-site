<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    private function respond(bool $success, mixed $data = [], string $message = ''): JsonResponse
    {
        return response()->json([
            'success' => $success,
            'data' => $data,
            'message' => $message,
        ]);
    }

    private function generateRoomCode(): string
    {
        $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        do {
            $code = '';
            for ($i = 0; $i < 6; $i++) {
                $code .= $chars[rand(0, strlen($chars) - 1)];
            }
        } while (Room::where('room_code', $code)->exists());

        return $code;
    }

    private function getRandomGoalsPoisson(float $lambda): int
    {
        $L = exp(-$lambda);
        $k = 0;
        $p = 1.0;
        do {
            $k++;
            $p *= (mt_rand() / mt_getrandmax());
        } while ($p > $L);

        return max(0, $k - 1);
    }

    private function simulateMatch(int|float $ovr1, int|float $ovr2): array
    {
        $diff = $ovr1 - $ovr2;
        $lambda1 = max(0.4, 1.3 + $diff * 0.05);
        $lambda2 = max(0.4, 1.3 - $diff * 0.05);

        return [
            'score1' => $this->getRandomGoalsPoisson($lambda1),
            'score2' => $this->getRandomGoalsPoisson($lambda2),
        ];
    }

    private function simulatePenaltyShootout(int|float $ovr1, int|float $ovr2): array
    {
        $pHomeScore = 0;
        $pAwayScore = 0;
        $homeKicks = [];
        $awayKicks = [];

        for ($round = 0; $round < 15; $round++) {
            $prob1 = min(0.95, max(0.40, 0.75 + ($ovr1 - $ovr2) * 0.003));
            $successHome = (mt_rand() / mt_getrandmax()) < $prob1;
            $homeKicks[] = $successHome;
            if ($successHome) {
                $pHomeScore++;
            }

            $prob2 = min(0.95, max(0.40, 0.75 + ($ovr2 - $ovr1) * 0.003));
            $successAway = (mt_rand() / mt_getrandmax()) < $prob2;
            $awayKicks[] = $successAway;
            if ($successAway) {
                $pAwayScore++;
            }

            $hRemaining = max(0, 5 - count($homeKicks));
            $aRemaining = max(0, 5 - count($awayKicks));

            if (count($homeKicks) >= 5 && count($awayKicks) >= 5) {
                if ($pHomeScore !== $pAwayScore) {
                    break;
                }
            } else {
                if ($pHomeScore > $pAwayScore + $aRemaining) {
                    break;
                }
                if ($pAwayScore > $pHomeScore + $hRemaining) {
                    break;
                }
            }
        }

        return [
            'pHomeScore' => $pHomeScore,
            'pAwayScore' => $pAwayScore,
            'homeKicks' => $homeKicks,
            'awayKicks' => $awayKicks,
            'winner' => $pHomeScore > $pAwayScore ? 'home' : 'away',
        ];
    }

    private function simulateExtraTime(int $ovr1, int $ovr2): array
    {
        $base = 0.40;
        $diff = ($ovr1 - $ovr2) / 100.0;
        $lambda1 = max(0.12, $base + ($diff * 0.35));
        $lambda2 = max(0.12, $base - ($diff * 0.35));

        return [
            'score1' => $this->getRandomGoalsPoisson($lambda1),
            'score2' => $this->getRandomGoalsPoisson($lambda2),
        ];
    }

    private function distributeMultiplayerEvents(array $match, array $room): array
    {
        $events = [];

        $getScorer = function ($username) use ($room) {
            foreach ($room['players'] as $p) {
                if ($p['username'] === $username) {
                    $squad = $p['squad'] ?? [];
                    $attackers = array_filter($squad, fn ($x) => !empty($x) && in_array($x['position'] ?? '', ['FW', 'MF']));
                    if (!empty($attackers)) {
                        $attackers = array_values($attackers);
                        return $attackers[mt_rand(0, count($attackers) - 1)];
                    }
                    $valid = array_filter($squad, fn ($x) => !empty($x));
                    if (!empty($valid)) {
                        $valid = array_values($valid);
                        return $valid[0];
                    }
                }
            }
            return ['name' => 'Oyuncu'];
        };

        $getDefender = function ($username) use ($room) {
            foreach ($room['players'] as $p) {
                if ($p['username'] === $username) {
                    $squad = $p['squad'] ?? [];
                    $defs = array_filter($squad, fn ($x) => !empty($x) && in_array($x['position'] ?? '', ['DF', 'GK']));
                    if (!empty($defs)) {
                        $defs = array_values($defs);
                        return $defs[mt_rand(0, count($defs) - 1)];
                    }
                    $valid = array_filter($squad, fn ($x) => !empty($x));
                    if (!empty($valid)) {
                        $valid = array_values($valid);
                        return $valid[0];
                    }
                }
            }
            return ['name' => 'Savunma'];
        };

        $usedMinutes = [];
        $pickMinute = function (int $minM, int $maxM) use (&$usedMinutes) {
            for ($attempt = 0; $attempt < 60; $attempt++) {
                $min = mt_rand($minM, $maxM);
                if (!isset($usedMinutes[$min])) {
                    $usedMinutes[$min] = true;
                    return $min;
                }
            }
            return mt_rand($minM, $maxM);
        };

        $regHome = $match['regularHomeScore'] ?? $match['homeScore'];
        $regAway = $match['regularAwayScore'] ?? $match['awayScore'];
        $hasET = !empty($match['hasExtraTime']);
        $extraHome = $match['extraHomeScore'] ?? 0;
        $extraAway = $match['extraAwayScore'] ?? 0;

        // Normal time goals (Home)
        for ($i = 0; $i < $regHome; $i++) {
            $scorer = $getScorer($match['home']);
            $assist = $getScorer($match['home']);
            $minute = $pickMinute(4, 88);
            $isPen = (mt_rand(1, 100) <= 15);
            $triggerVar = (mt_rand(1, 100) <= 12);

            if ($isPen) {
                $text = "PENALTI GOLÜ! {$scorer['name']} beyaz noktadan soğukkanlı bir vuruşla topu ağlara yolluyor!";
            } else {
                $texts = [
                    "GOOOOL! {$scorer['name']} kaleciyle karşı karşıya kaldı ve köşeyi gördü!",
                    "GOOOOOL! {$assist['name']}'in harika pasında {$scorer['name']} gelişine sert vurdu!",
                    "GOL! Ceza sahasındaki karambolde {$scorer['name']} topu ağlara gönderdi!",
                    "MÜTHİŞ GOL! {$scorer['name']} uzaktan harika bir füze çıkardı!",
                ];
                $text = $texts[mt_rand(0, count($texts) - 1)];
            }

            $events[] = [
                'minute' => $minute,
                'team' => 'home',
                'type' => 'goal',
                'text' => $text,
                'name' => $match['home'],
                'triggerVarConfirm' => $triggerVar,
            ];
        }

        // Normal time goals (Away)
        for ($i = 0; $i < $regAway; $i++) {
            $scorer = $getScorer($match['away']);
            $assist = $getScorer($match['away']);
            $minute = $pickMinute(4, 88);
            $isPen = (mt_rand(1, 100) <= 15);
            $triggerVar = (mt_rand(1, 100) <= 12);

            if ($isPen) {
                $text = "PENALTI GOLÜ! {$scorer['name']} penaltı vuruşunda kaleciyi ters köşeye yatırarak golü buluyor!";
            } else {
                $texts = [
                    "GOL! {$scorer['name']} savunmanın arkasına sarkıp golü attı.",
                    "GOOOOL! {$assist['name']}'in ortasında {$scorer['name']} şık bir kafa vuruşuyla ağları buldu!",
                    "GOL! Savunmanın hatasını affetmeyen {$scorer['name']} topu ağlara yolladı.",
                ];
                $text = $texts[mt_rand(0, count($texts) - 1)];
            }

            $events[] = [
                'minute' => $minute,
                'team' => 'away',
                'type' => 'goal',
                'text' => $text,
                'name' => $match['away'],
                'triggerVarConfirm' => $triggerVar,
            ];
        }

        // Misses in normal time
        $numMisses = mt_rand(3, 5);
        for ($i = 0; $i < $numMisses; $i++) {
            $isHome = (mt_rand(1, 100) <= 50);
            $attacker = $getScorer($isHome ? $match['home'] : $match['away']);
            $defender = $getDefender($isHome ? $match['away'] : $match['home']);
            $minute = $pickMinute(3, 88);

            if (mt_rand(1, 100) <= 15) {
                $text = "PENALTI KAÇTI! {$attacker['name']} penaltı vuruşunda topu direğe nişanlıyor, inanılmaz şanssızlık!";
            } else {
                $texts = [
                    "{$attacker['name']} çok sert vurdu ancak {$defender['name']} harika çeliyor!",
                    "{$attacker['name']} kaleciyle karşı karşıya topu dışarı vurdu! Net fırsat kaçtı!",
                    "{$attacker['name']} uzaktan denedi, top direği sıyırarak auta çıktı.",
                ];
                $text = $texts[mt_rand(0, count($texts) - 1)];
            }

            $events[] = [
                'minute' => $minute,
                'team' => $isHome ? 'home' : 'away',
                'type' => 'miss',
                'text' => $text,
            ];
        }

        // Cosmetic VAR cancelled in normal time
        if (mt_rand(1, 100) <= 30) {
            $isHome = (mt_rand(1, 100) <= 50);
            $scorer = $getScorer($isHome ? $match['home'] : $match['away']);
            $minute = $pickMinute(12, 85);
            $events[] = [
                'minute' => $minute,
                'team' => $isHome ? 'home' : 'away',
                'type' => 'var-cancelled',
                'text' => "GOL! {$scorer['name']} topu filelere gönderdi! Tribünler coşuyor!",
                'cancelText' => 'VAR KARARI: GOL İPTAL! Pozisyon öncesi faul tespit edildi. Gol geçersiz sayıldı!',
            ];
        }

        // Extra Time Events (if match went into extra time)
        if ($hasET) {
            $events[] = [
                'minute' => 90,
                'type' => 'phase',
                'text' => "Normal süre {$regHome} - {$regAway} eşitlikle tamamlandı! Kazananı belirlemek için maç 30 dakikalık uzatmalara gidiyor.",
            ];

            // Extra time goals (Home)
            for ($i = 0; $i < $extraHome; $i++) {
                $scorer = $getScorer($match['home']);
                $minute = $pickMinute(92, 118);
                $events[] = [
                    'minute' => $minute,
                    'team' => 'home',
                    'type' => 'goal',
                    'text' => "UZATMALARDA KRİTİK GOL! {$scorer['name']} sahneye çıkıyor ve takımını öne geçiriyor!",
                    'name' => $match['home'],
                    'triggerVarConfirm' => false,
                ];
            }

            // Extra time goals (Away)
            for ($i = 0; $i < $extraAway; $i++) {
                $scorer = $getScorer($match['away']);
                $minute = $pickMinute(92, 118);
                $events[] = [
                    'minute' => $minute,
                    'team' => 'away',
                    'type' => 'goal',
                    'text' => "UZATMA DAKİKALARINDA İNANILMAZ GOL! {$scorer['name']} ağları havalandırıyor!",
                    'name' => $match['away'],
                    'triggerVarConfirm' => false,
                ];
            }

            // Halftime of extra time
            $events[] = [
                'minute' => 105,
                'type' => 'phase',
                'text' => "Uzatma devresinin ilk 15 dakikası sona erdi (105'). İkinci uzatma devresi başlıyor!",
            ];

            // Miss in extra time
            $isHome = (mt_rand(1, 100) <= 50);
            $attacker = $getScorer($isHome ? $match['home'] : $match['away']);
            $events[] = [
                'minute' => $pickMinute(93, 118),
                'team' => $isHome ? 'home' : 'away',
                'type' => 'miss',
                'text' => "Uzatma dakikalarında büyük tehlike! {$attacker['name']} net fırsatı değerlendiremedi!",
            ];

            // End of extra time
            if (!empty($match['hasPenalties'])) {
                $events[] = [
                    'minute' => 120,
                    'type' => 'phase',
                    'text' => "120 dakika sonunda eşitlik bozulmadı ({$match['homeScore']} - {$match['awayScore']})! Şampiyonu belirlemek için seri penaltı atışlarına geçiliyor...",
                ];
            } else {
                $wName = ($match['winner'] === 'home') ? $match['home'] : $match['away'];
                $events[] = [
                    'minute' => 120,
                    'type' => 'phase',
                    'text' => "120 dakikalık nefes kesen uzatma sona erdi! Derbinin galibi: {$wName} ({$match['homeScore']} - {$match['awayScore']})",
                ];
            }
        }

        // Sort events chronologically
        usort($events, function ($a, $b) {
            if ($a['minute'] === $b['minute']) {
                $orderA = ($a['type'] === 'phase') ? 0 : 1;
                $orderB = ($b['type'] === 'phase') ? 0 : 1;
                return $orderA - $orderB;
            }
            return $a['minute'] - $b['minute'];
        });

        // Stamp running cumulative scores on every single event for 100% determinism
        $runningHome = 0;
        $runningAway = 0;
        foreach ($events as &$ev) {
            if ($ev['type'] === 'goal') {
                if ($ev['team'] === 'home') {
                    $runningHome++;
                } else {
                    $runningAway++;
                }
            }
            $ev['homeScore'] = $runningHome;
            $ev['awayScore'] = $runningAway;
        }
        unset($ev);

        return $events;
    }

    private function simulateLeague(array &$room): void
    {
        $players = $room['players'];
        $standings = [];
        $matches = [];

        foreach ($players as $p) {
            $standings[$p['username']] = [
                'username' => $p['username'],
                'formation' => $p['formation'],
                'rating' => $p['rating'],
                'played' => 0,
                'won' => 0,
                'drawn' => 0,
                'lost' => 0,
                'goalsFor' => 0,
                'goalsAgainst' => 0,
                'points' => 0,
            ];
        }

        if (count($players) === 2) {
            // 2 Oyuncu Derbi Modu: Tek Maç (Uzatma & Penaltı destekli)
            $p1 = $players[0];
            $p2 = $players[1];

            $result = $this->simulateMatch($p1['rating'], $p2['rating']);
            $s1 = $result['score1'];
            $s2 = $result['score2'];

            $hasExtraTime = false;
            $hasPenalties = false;
            $e1 = 0;
            $e2 = 0;
            $penResult = null;

            if ($s1 === $s2) {
                // Normal sürede beraberlik -> 30 dk Uzatmalar (90' - 120')
                $hasExtraTime = true;
                $extraResult = $this->simulateExtraTime($p1['rating'], $p2['rating']);
                $e1 = $extraResult['score1'];
                $e2 = $extraResult['score2'];

                $finalS1 = $s1 + $e1;
                $finalS2 = $s2 + $e2;

                if ($finalS1 === $finalS2) {
                    // 120 dk sonunda hala beraberlik -> Seri Penaltı Atışları
                    $hasPenalties = true;
                    $penResult = $this->simulatePenaltyShootout($p1['rating'], $p2['rating']);
                    $winner = $penResult['winner']; // 'home' veya 'away'
                } else {
                    // Uzatmalarda kazanan belli oldu
                    $winner = ($finalS1 > $finalS2) ? 'home' : 'away';
                }
            } else {
                // Normal sürede kazanan belli oldu
                $finalS1 = $s1;
                $finalS2 = $s2;
                $winner = ($s1 > $s2) ? 'home' : 'away';
            }

            $singleMatch = [
                'round' => 1,
                'home' => $p1['username'],
                'homeRating' => $p1['rating'],
                'away' => $p2['username'],
                'awayRating' => $p2['rating'],
                'regularHomeScore' => $s1,
                'regularAwayScore' => $s2,
                'extraHomeScore' => $e1,
                'extraAwayScore' => $e2,
                'homeScore' => $finalS1,
                'awayScore' => $finalS2,
                'hasExtraTime' => $hasExtraTime,
                'hasPenalties' => $hasPenalties,
                'penaltyResults' => $penResult,
                'winner' => $winner,
            ];
            $singleMatch['events'] = $this->distributeMultiplayerEvents($singleMatch, $room);
            $matches[] = $singleMatch;

            $standings[$p1['username']]['played'] = 1;
            $standings[$p2['username']]['played'] = 1;
            $standings[$p1['username']]['goalsFor'] = $finalS1;
            $standings[$p1['username']]['goalsAgainst'] = $finalS2;
            $standings[$p2['username']]['goalsFor'] = $finalS2;
            $standings[$p2['username']]['goalsAgainst'] = $finalS1;

            if ($winner === 'home') {
                $standings[$p1['username']]['won'] = 1;
                $standings[$p1['username']]['points'] = 3;
                $standings[$p2['username']]['lost'] = 1;
                $standings[$p2['username']]['points'] = 0;
            } else {
                $standings[$p2['username']]['won'] = 1;
                $standings[$p2['username']]['points'] = 3;
                $standings[$p1['username']]['lost'] = 1;
                $standings[$p1['username']]['points'] = 0;
            }
        } else {
            // 4 Oyuncu Lig Modu: 3 Hafta, Her Hafta 2 Maç = Toplam 6 Maç
            $rounds = [
                [['home' => 0, 'away' => 1], ['home' => 2, 'away' => 3]],
                [['home' => 0, 'away' => 2], ['home' => 1, 'away' => 3]],
                [['home' => 0, 'away' => 3], ['home' => 1, 'away' => 2]],
            ];

            foreach ($rounds as $roundIndex => $pairings) {
                $roundNum = $roundIndex + 1;
                foreach ($pairings as $pair) {
                    if (!isset($players[$pair['home']]) || !isset($players[$pair['away']])) {
                        continue;
                    }
                    $p1 = $players[$pair['home']];
                    $p2 = $players[$pair['away']];

                    $result = $this->simulateMatch($p1['rating'], $p2['rating']);
                    $s1 = $result['score1'];
                    $s2 = $result['score2'];

                    $leagueMatch = [
                        'round' => $roundNum,
                        'home' => $p1['username'],
                        'homeRating' => $p1['rating'],
                        'away' => $p2['username'],
                        'awayRating' => $p2['rating'],
                        'homeScore' => $s1,
                        'awayScore' => $s2,
                    ];
                    $leagueMatch['events'] = $this->distributeMultiplayerEvents($leagueMatch, $room);
                    $matches[] = $leagueMatch;

                    $standings[$p1['username']]['played']++;
                    $standings[$p2['username']]['played']++;
                    $standings[$p1['username']]['goalsFor'] += $s1;
                    $standings[$p1['username']]['goalsAgainst'] += $s2;
                    $standings[$p2['username']]['goalsFor'] += $s2;
                    $standings[$p2['username']]['goalsAgainst'] += $s1;

                    if ($s1 > $s2) {
                        $standings[$p1['username']]['won']++;
                        $standings[$p1['username']]['points'] += 3;
                        $standings[$p2['username']]['lost']++;
                    } elseif ($s1 < $s2) {
                        $standings[$p2['username']]['won']++;
                        $standings[$p2['username']]['points'] += 3;
                        $standings[$p1['username']]['lost']++;
                    } else {
                        $standings[$p1['username']]['drawn']++;
                        $standings[$p2['username']]['drawn']++;
                        $standings[$p1['username']]['points'] += 1;
                        $standings[$p2['username']]['points'] += 1;
                    }
                }
            }
        }

        usort($standings, function ($a, $b) {
            if ($b['points'] !== $a['points']) {
                return $b['points'] - $a['points'];
            }
            $gdA = $a['goalsFor'] - $a['goalsAgainst'];
            $gdB = $b['goalsFor'] - $b['goalsAgainst'];
            if ($gdB !== $gdA) {
                return $gdB - $gdA;
            }
            if ($b['goalsFor'] !== $a['goalsFor']) {
                return $b['goalsFor'] - $a['goalsFor'];
            }
            return $b['won'] - $a['won'];
        });

        $room['leagueResults'] = [
            'standings' => $standings,
            'matches' => $matches,
            'champion' => $standings[0]['username'],
        ];
        $room['status'] = 'finished';
    }

    public function show(Request $request): JsonResponse
    {
        $roomCode = strtoupper(trim((string) $request->query('roomCode', '')));
        if (empty($roomCode)) {
            return $this->respond(false, null, 'Oda kodu eksik.');
        }

        $roomModel = Room::where('room_code', $roomCode)->first();
        if (!$roomModel) {
            return $this->respond(false, null, 'Oda silinmiş veya geçersiz.');
        }

        return $this->respond(true, ['room' => $roomModel->toLegacyPayload()]);
    }

    public function create(Request $request): JsonResponse
    {
        $username = trim((string) $request->input('username', ''));
        $maxPlayers = intval($request->input('maxPlayers', 2));

        if (empty($username)) {
            return $this->respond(false, null, 'Kullanıcı adı gerekli.');
        }
        if ($maxPlayers !== 2) {
            return $this->respond(false, null, 'Yalnızca 2 kişilik derbi odaları destekleniyor.');
        }

        $roomCode = $this->generateRoomCode();
        $room = [
            'roomCode' => $roomCode,
            'maxPlayers' => $maxPlayers,
            'status' => 'waiting',
            'players' => [
                [
                    'username' => $username,
                    'ready' => false,
                    'rating' => 0,
                    'formation' => null,
                ],
            ],
            'lastActivity' => time(),
        ];

        Room::saveFromPayload($roomCode, $room);

        return $this->respond(true, ['roomCode' => $roomCode, 'room' => $room]);
    }

    public function join(Request $request): JsonResponse
    {
        $username = trim((string) $request->input('username', ''));
        $roomCode = strtoupper(trim((string) $request->input('roomCode', '')));

        if (empty($username) || empty($roomCode)) {
            return $this->respond(false, null, 'Eksik bilgi.');
        }

        $roomModel = Room::where('room_code', $roomCode)->first();
        if (!$roomModel) {
            return $this->respond(false, null, 'Oda bulunamadı.');
        }

        $room = $roomModel->toLegacyPayload();

        if (($room['maxPlayers'] ?? 0) !== 2) {
            return $this->respond(false, null, 'Bu oda artık desteklenmiyor.');
        }
        if (($room['status'] ?? '') !== 'waiting') {
            return $this->respond(false, null, 'Bu oda oyuna başlamış.');
        }
        if (count($room['players'] ?? []) >= $room['maxPlayers']) {
            return $this->respond(false, null, 'Bu oda dolu.');
        }

        foreach ($room['players'] as $p) {
            if ($p['username'] === $username) {
                return $this->respond(false, null, 'Bu kullanıcı adı zaten odada var.');
            }
        }

        $room['players'][] = [
            'username' => $username,
            'ready' => false,
            'rating' => 0,
            'formation' => null,
        ];

        if (count($room['players']) === $room['maxPlayers']) {
            $room['status'] = 'drafting';
        }

        $room['lastActivity'] = time();
        Room::saveFromPayload($roomCode, $room);

        return $this->respond(true, ['room' => $room]);
    }

    public function setReady(Request $request): JsonResponse
    {
        $username = trim((string) $request->input('username', ''));
        $roomCode = strtoupper(trim((string) $request->input('roomCode', '')));
        $rating = intval($request->input('rating', 0));
        $formation = (string) $request->input('formation', '');
        $squad = $request->input('squad', []);

        $roomModel = Room::where('room_code', $roomCode)->first();
        if (!$roomModel) {
            return $this->respond(false, null, 'Oda bulunamadı.');
        }

        $room = $roomModel->toLegacyPayload();

        $allReady = true;
        foreach ($room['players'] as &$p) {
            if ($p['username'] === $username) {
                $p['ready'] = true;
                $p['rating'] = $rating;
                $p['formation'] = $formation;
                $p['squad'] = $squad;
            }
            if (!$p['ready']) {
                $allReady = false;
            }
        }
        unset($p);

        if ($allReady && ($room['status'] ?? '') === 'drafting') {
            $this->simulateLeague($room);
        }

        $room['lastActivity'] = time();
        Room::saveFromPayload($roomCode, $room);

        return $this->respond(true, ['room' => $room]);
    }
}

