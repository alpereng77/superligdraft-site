<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

// Yardımcı fonksiyonlar
function respond($success, $data = [], $message = '') {
    echo json_encode(['success' => $success, 'data' => $data, 'message' => $message]);
    exit;
}

function getRoomFilePath($roomCode) {
    return __DIR__ . '/rooms/' . strtoupper($roomCode) . '.json';
}

function readRoom($roomCode) {
    $file = getRoomFilePath($roomCode);
    if (!file_exists($file)) return null;
    $content = file_get_contents($file);
    return json_decode($content, true);
}

function writeRoom($roomCode, $data) {
    $file = getRoomFilePath($roomCode);
    file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
}

function generateRoomCode() {
    $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    $code = '';
    for ($i = 0; $i < 6; $i++) {
        $code .= $chars[rand(0, strlen($chars) - 1)];
    }
    if (file_exists(getRoomFilePath($code))) {
        return generateRoomCode();
    }
    return $code;
}

function getRandomGoalsPoisson($lambda) {
    $L = exp(-$lambda);
    $k = 0;
    $p = 1.0;
    do {
        $k++;
        $p *= (mt_rand() / mt_getrandmax());
    } while ($p > $L);
    return max(0, $k - 1);
}

function simulatePenaltyShootout($ovr1, $ovr2) {
    $pHomeScore = 0;
    $pAwayScore = 0;
    $homeKicks = [];
    $awayKicks = [];

    for ($round = 0; $round < 15; $round++) {
        $prob1 = min(0.95, max(0.40, 0.75 + ($ovr1 - $ovr2) * 0.003));
        $successHome = (mt_rand() / mt_getrandmax()) < $prob1;
        $homeKicks[] = $successHome;
        if ($successHome) $pHomeScore++;

        $prob2 = min(0.95, max(0.40, 0.75 + ($ovr2 - $ovr1) * 0.003));
        $successAway = (mt_rand() / mt_getrandmax()) < $prob2;
        $awayKicks[] = $successAway;
        if ($successAway) $pAwayScore++;

        $hRemaining = max(0, 5 - count($homeKicks));
        $aRemaining = max(0, 5 - count($awayKicks));

        if (count($homeKicks) >= 5 && count($awayKicks) >= 5) {
            if ($pHomeScore !== $pAwayScore) break;
        } else {
            if ($pHomeScore > $pAwayScore + $aRemaining) break;
            if ($pAwayScore > $pHomeScore + $hRemaining) break;
        }
    }

    return [
        'pHomeScore' => $pHomeScore,
        'pAwayScore' => $pAwayScore,
        'homeKicks' => $homeKicks,
        'awayKicks' => $awayKicks,
        'winner' => $pHomeScore > $pAwayScore ? 'home' : 'away'
    ];
}

function simulateLeague(&$room) {
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
            'points' => 0
        ];
    }
    
    if (count($players) === 2) {
        // 2 Oyuncu Derbi Modu: Tek Maç
        $p1 = $players[0];
        $p2 = $players[1];
        
        $result = simulateMatch($p1['rating'], $p2['rating']);
        $s1 = $result['score1'];
        $s2 = $result['score2'];
        $penResult = simulatePenaltyShootout($p1['rating'], $p2['rating']);
        
        $matches[] = [
            'round' => 1,
            'home' => $p1['username'],
            'homeRating' => $p1['rating'],
            'away' => $p2['username'],
            'awayRating' => $p2['rating'],
            'homeScore' => $s1,
            'awayScore' => $s2,
            'penaltyResults' => $penResult
        ];
        
        $standings[$p1['username']]['played'] = 1;
        $standings[$p2['username']]['played'] = 1;
        $standings[$p1['username']]['goalsFor'] = $s1;
        $standings[$p1['username']]['goalsAgainst'] = $s2;
        $standings[$p2['username']]['goalsFor'] = $s2;
        $standings[$p2['username']]['goalsAgainst'] = $s1;
        
        if ($s1 > $s2) {
            $standings[$p1['username']]['won'] = 1;
            $standings[$p1['username']]['points'] = 3;
            $standings[$p2['username']]['lost'] = 1;
        } elseif ($s1 < $s2) {
            $standings[$p2['username']]['won'] = 1;
            $standings[$p2['username']]['points'] = 3;
            $standings[$p1['username']]['lost'] = 1;
        } else {
            $standings[$p1['username']]['drawn'] = 1;
            $standings[$p2['username']]['drawn'] = 1;
            $standings[$p1['username']]['points'] = 1;
            $standings[$p2['username']]['points'] = 1;
        }
    } else {
        // 4 Oyuncu Lig Modu: 3 Hafta, Her Hafta 2 Maç = Toplam 6 Maç
        $rounds = [
            [['home' => 0, 'away' => 1], ['home' => 2, 'away' => 3]],
            [['home' => 0, 'away' => 2], ['home' => 1, 'away' => 3]],
            [['home' => 0, 'away' => 3], ['home' => 1, 'away' => 2]]
        ];
        
        foreach ($rounds as $roundIndex => $pairings) {
            $roundNum = $roundIndex + 1;
            foreach ($pairings as $pair) {
                if (!isset($players[$pair['home']]) || !isset($players[$pair['away']])) continue;
                $p1 = $players[$pair['home']];
                $p2 = $players[$pair['away']];
                
                $result = simulateMatch($p1['rating'], $p2['rating']);
                $s1 = $result['score1'];
                $s2 = $result['score2'];
                
                $matches[] = [
                    'round' => $roundNum,
                    'home' => $p1['username'],
                    'homeRating' => $p1['rating'],
                    'away' => $p2['username'],
                    'awayRating' => $p2['rating'],
                    'homeScore' => $s1,
                    'awayScore' => $s2
                ];
                
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
    
    usort($standings, function($a, $b) {
        if ($b['points'] !== $a['points']) return $b['points'] - $a['points'];
        $gdA = $a['goalsFor'] - $a['goalsAgainst'];
        $gdB = $b['goalsFor'] - $b['goalsAgainst'];
        if ($gdB !== $gdA) return $gdB - $gdA;
        if ($b['goalsFor'] !== $a['goalsFor']) return $b['goalsFor'] - $a['goalsFor'];
        return $b['won'] - $a['won'];
    });
    
    $room['leagueResults'] = [
        'standings' => $standings,
        'matches' => $matches,
        'champion' => $standings[0]['username']
    ];
    $room['status'] = 'finished';
}

// Ana Routing
$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if ($action === 'create_room') {
        $username = $input['username'] ?? '';
        $maxPlayers = intval($input['maxPlayers'] ?? 2);
        
        if (empty($username)) respond(false, null, 'Kullanıcı adı gerekli.');
        if ($maxPlayers !== 2) respond(false, null, 'Yalnızca 2 kişilik derbi odaları destekleniyor.');
        
        $roomCode = generateRoomCode();
        $room = [
            'roomCode' => $roomCode,
            'maxPlayers' => $maxPlayers,
            'status' => 'waiting', // waiting, drafting, finished
            'players' => [
                [
                    'username' => $username,
                    'ready' => false,
                    'rating' => 0,
                    'formation' => null
                ]
            ],
            'lastActivity' => time()
        ];
        
        writeRoom($roomCode, $room);
        respond(true, ['roomCode' => $roomCode, 'room' => $room]);
        
    } elseif ($action === 'join_room') {
        $username = $input['username'] ?? '';
        $roomCode = strtoupper($input['roomCode'] ?? '');
        
        if (empty($username) || empty($roomCode)) respond(false, null, 'Eksik bilgi.');
        
        $room = readRoom($roomCode);
        if (!$room) respond(false, null, 'Oda bulunamadı.');
        if (($room['maxPlayers'] ?? 0) !== 2) respond(false, null, 'Bu oda artık desteklenmiyor.');
        if ($room['status'] !== 'waiting') respond(false, null, 'Bu oda oyuna başlamış.');
        if (count($room['players']) >= $room['maxPlayers']) respond(false, null, 'Bu oda dolu.');
        
        foreach ($room['players'] as $p) {
            if ($p['username'] === $username) respond(false, null, 'Bu kullanıcı adı zaten odada var.');
        }
        
        $room['players'][] = [
            'username' => $username,
            'ready' => false,
            'rating' => 0,
            'formation' => null
        ];
        
        if (count($room['players']) === $room['maxPlayers']) {
            $room['status'] = 'drafting';
        }
        
        $room['lastActivity'] = time();
        writeRoom($roomCode, $room);
        respond(true, ['room' => $room]);

    } elseif ($action === 'set_ready') {
        $username = $input['username'] ?? '';
        $roomCode = strtoupper($input['roomCode'] ?? '');
        $rating = intval($input['rating'] ?? 0);
        $formation = $input['formation'] ?? '';
        $squad = $input['squad'] ?? [];
        
        $room = readRoom($roomCode);
        if (!$room) respond(false, null, 'Oda bulunamadı.');
        
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
        
        if ($allReady && $room['status'] === 'drafting') {
            simulateLeague($room);
        }
        
        $room['lastActivity'] = time();
        writeRoom($roomCode, $room);
        respond(true, ['room' => $room]);

    } elseif ($action === 'save_tycoon_rank') {
        $clubName = trim($input['clubName'] ?? '');
        $managerName = trim($input['managerName'] ?? '');
        $clubValue = intval($input['clubValue'] ?? 0);
        $teamOvr = intval($input['teamOvr'] ?? 0);
        $trophies = intval($input['trophies'] ?? 0);
        $leagueTier = intval($input['leagueTier'] ?? 1);
        $leagueName = trim($input['leagueName'] ?? 'Bölgesel Amatör Lig');

        if (empty($clubName) || empty($managerName)) {
            respond(false, null, 'Kulüp adı ve Menajer adı gereklidir.');
        }

        $lbFile = __DIR__ . '/tycoon_leaderboard.json';
        $leaderboard = file_exists($lbFile) ? json_decode(file_get_contents($lbFile), true) : [];
        if (!is_array($leaderboard)) $leaderboard = [];

        $found = false;
        foreach ($leaderboard as &$entry) {
            if (strcasecmp($entry['clubName'], $clubName) === 0) {
                // Güncelle
                $entry['managerName'] = $managerName;
                $entry['clubValue'] = max($entry['clubValue'] ?? 0, $clubValue);
                $entry['teamOvr'] = max($entry['teamOvr'] ?? 0, $teamOvr);
                $entry['trophies'] = max($entry['trophies'] ?? 0, $trophies);
                $entry['leagueTier'] = max($entry['leagueTier'] ?? 1, $leagueTier);
                $entry['leagueName'] = $leagueName;
                $entry['updatedAt'] = time();
                $found = true;
                break;
            }
        }
        if (!$found) {
            $leaderboard[] = [
                'clubName' => $clubName,
                'managerName' => $managerName,
                'clubValue' => $clubValue,
                'teamOvr' => $teamOvr,
                'trophies' => $trophies,
                'leagueTier' => $leagueTier,
                'leagueName' => $leagueName,
                'updatedAt' => time()
            ];
        }

        // Kulüp değerine göre sırala ve ilk 100'ü tut
        usort($leaderboard, function($a, $b) {
            return ($b['clubValue'] ?? 0) <=> ($a['clubValue'] ?? 0);
        });
        $leaderboard = array_slice($leaderboard, 0, 100);

        file_put_contents($lbFile, json_encode($leaderboard, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        respond(true, ['leaderboard' => $leaderboard], 'Sıralama başarıyla kaydedildi!');
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'get_room_state') {
        $roomCode = strtoupper($_GET['roomCode'] ?? '');
        if (empty($roomCode)) respond(false, null, 'Oda kodu eksik.');
        
        $room = readRoom($roomCode);
        if (!$room) respond(false, null, 'Oda silinmiş veya geçersiz.');
        
        respond(true, ['room' => $room]);
    } elseif ($action === 'get_tycoon_leaderboard') {
        $lbFile = __DIR__ . '/tycoon_leaderboard.json';
        $leaderboard = file_exists($lbFile) ? json_decode(file_get_contents($lbFile), true) : [];
        if (!is_array($leaderboard)) $leaderboard = [];

        // Kulüp değerine göre sırala
        usort($leaderboard, function($a, $b) {
            return ($b['clubValue'] ?? 0) <=> ($a['clubValue'] ?? 0);
        });

        respond(true, ['leaderboard' => $leaderboard]);
    }
}

respond(false, null, 'Geçersiz işlem.');
