<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('room_code', 16)->unique();
            $table->integer('max_players')->default(2);
            $table->string('status', 32)->default('waiting')->index();
            $table->json('players');
            $table->json('league_results')->nullable();
            $table->unsignedBigInteger('last_activity')->default(0);
            $table->json('room_data');
            $table->timestamps();
        });

        Schema::create('tycoon_leaderboards', function (Blueprint $table) {
            $table->id();
            $table->string('club_name', 120)->unique();
            $table->string('manager_name', 120);
            $table->bigInteger('club_value')->default(0)->index();
            $table->integer('team_ovr')->default(60);
            $table->integer('trophies')->default(0);
            $table->integer('league_tier')->default(1);
            $table->string('league_name', 120)->default('Bölgesel Amatör Lig');
            $table->unsignedBigInteger('updated_at_ts')->default(0);
            $table->json('entry_data');
            $table->timestamps();
        });

        Schema::create('nostalji_seasons', function (Blueprint $table) {
            $table->id();
            $table->string('season_year', 16)->unique();
            $table->longText('teams_data');
            $table->timestamps();
        });

        Schema::create('tycoon_seasons', function (Blueprint $table) {
            $table->id();
            $table->string('season_year', 16)->unique();
            $table->longText('teams_data');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tycoon_seasons');
        Schema::dropIfExists('nostalji_seasons');
        Schema::dropIfExists('tycoon_leaderboards');
        Schema::dropIfExists('rooms');
    }
};

