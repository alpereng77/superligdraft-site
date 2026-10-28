<?php

namespace Tests\Feature;

use App\Models\NostaljiSeason;
use App\Models\Room;
use App\Models\TycoonLeaderboard;
use App\Models\TycoonSeason;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertSee('/favicon.ico');
        $response->assertSee('id="root"', false);
        $response->assertSee('resources/css/app.css');
        $response->assertSee('resources/js/app.jsx');
    }

    public function test_datasets_endpoints_return_mysql_json_format(): void
    {
        NostaljiSeason::create([
            'season_year' => '2004',
            'teams_data' => [
                [
                    'team_name' => 'Fenerbahçe SK',
                    'club_id' => '36',
                    'players' => [
                        ['name' => 'Alex de Souza', 'position' => 'MF', 'rating' => 92],
                    ],
                ],
            ],
        ]);

        TycoonSeason::create([
            'season_year' => '2005',
            'teams_data' => [
                [
                    'team_name' => 'Galatasaray SK',
                    'club_id' => '141',
                    'players' => [
                        ['name' => 'Gheorghe Hagi', 'position' => 'MF', 'rating' => 94],
                    ],
                ],
            ],
        ]);

        $nostaljiResponse = $this->get('/api/datasets/nostalji');
        $nostaljiResponse->assertStatus(200);
        $nostaljiJson = $nostaljiResponse->json();
        $this->assertArrayHasKey('2004', $nostaljiJson);
        $this->assertEquals('Fenerbahçe SK', $nostaljiJson['2004'][0]['team_name']);

        $tycoonResponse = $this->get('/api/datasets/tycoon-players');
        $tycoonResponse->assertStatus(200);
        $tycoonJson = $tycoonResponse->json();
        $this->assertArrayHasKey('2005', $tycoonJson);
        $this->assertEquals('Galatasaray SK', $tycoonJson['2005'][0]['team_name']);
    }

    public function test_room_derby_lifecycle_via_mysql(): void
    {
        // 1. Create room
        $createRes = $this->postJson('/api/rooms/create', [
            'username' => 'Alperen',
            'maxPlayers' => 2,
        ]);
        $createRes->assertStatus(200)->assertJsonPath('success', true);
        $roomCode = $createRes->json('data.roomCode');
        $this->assertNotEmpty($roomCode);

        // 2. Join room
        $joinRes = $this->postJson('/api/rooms/join', [
            'username' => 'Rakip',
            'roomCode' => $roomCode,
        ]);
        $joinRes->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.room.status', 'drafting');

        // 3. Player 1 ready
        $ready1 = $this->postJson('/api/rooms/ready', [
            'username' => 'Alperen',
            'roomCode' => $roomCode,
            'rating' => 84,
            'formation' => '4-4-2',
            'squad' => [['name' => 'Alex', 'position' => 'MF', 'rating' => 90]],
        ]);
        $ready1->assertStatus(200)->assertJsonPath('data.room.status', 'drafting');

        // 4. Player 2 ready -> triggers league simulation
        $ready2 = $this->postJson('/api/rooms/ready', [
            'username' => 'Rakip',
            'roomCode' => $roomCode,
            'rating' => 80,
            'formation' => '4-3-3',
            'squad' => [['name' => 'Hagi', 'position' => 'MF', 'rating' => 91]],
        ]);
        $ready2->assertStatus(200)
            ->assertJsonPath('data.room.status', 'finished');

        $this->assertNotEmpty($ready2->json('data.room.leagueResults.matches'));

        // 5. Get room state
        $stateRes = $this->getJson('/api/rooms/state?roomCode=' . $roomCode);
        $stateRes->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.room.status', 'finished');
    }

    public function test_tycoon_leaderboard_via_mysql(): void
    {
        $storeRes = $this->postJson('/api/tycoon/leaderboard', [
            'clubName' => 'Nostalji FK',
            'managerName' => 'Alperen',
            'clubValue' => 450000,
            'teamOvr' => 82,
            'trophies' => 3,
            'leagueTier' => 4,
            'leagueName' => 'Süper Lig',
        ]);

        $storeRes->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.leaderboard.0.clubName', 'Nostalji FK');

        $getRes = $this->getJson('/api/tycoon/leaderboard');
        $getRes->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.leaderboard.0.clubValue', 450000);
    }
}
