import { Player, PlayerData } from '../services/api';

export interface Team {
  name: string;
  players: Player[];
  rating: number;
  chemistry?: number;
  formation?: string;
}

export interface MatchEvent {
  minute: number;
  text?: string;
  description?: string;
  type: 'goal' | 'card' | 'whistle' | 'normal' | 'save' | 'woodwork' | 'penalty';
  team: 'home' | 'away';
  scorer?: string;
  player?: string;
  assister?: string;
}

export interface MatchResult {
  homeTeam: { name: string; rating?: number; chemistry?: number } | any;
  awayTeam: { name: string; rating?: number; chemistry?: number } | any;
  homeScore: number;
  awayScore: number;
  events: MatchEvent[];
  timeline: MatchEvent[];
  homeRating: number;
  awayRating: number;
  mvp: Player;
  hasExtraTime?: boolean;
  hasPenalties?: boolean;
  penaltyShootout?: {
    homeScore: number;
    awayScore: number;
    winner: 'home' | 'away';
  };
  winner: 'home' | 'away' | 'draw';
}

export function calculateTeamRating(squad: (PlayerData | null)[]): { ovr: number; atk: number; def: number } {
  const valid = squad.filter((p): p is PlayerData => p !== null && p !== undefined);
  if (valid.length === 0) return { ovr: 75, atk: 75, def: 75 };

  const ovr = Math.round(valid.reduce((acc, p) => acc + (p.rating || 75), 0) / valid.length);
  const fwMf = valid.filter(p => ['FW', 'MF', 'ST', 'LW', 'RW', 'CAM', 'CM', 'RM', 'LM', 'SNT', 'OS'].some(pos => (p.position || '').includes(pos)));
  const atk = fwMf.length > 0 ? Math.round(fwMf.reduce((acc, p) => acc + (p.rating || 75), 0) / fwMf.length) : ovr;

  const dfGk = valid.filter(p => ['GK', 'DF', 'CB', 'LB', 'RB', 'DM', 'KL', 'STP'].some(pos => (p.position || '').includes(pos)));
  const def = dfGk.length > 0 ? Math.round(dfGk.reduce((acc, p) => acc + (p.rating || 75), 0) / dfGk.length) : ovr;

  return { ovr, atk, def };
}

export function generateAiSquad(dataset: Player[], targetRating = 80): Player[] {
  if (!dataset || dataset.length === 0) return [];
  const shuffled = [...dataset].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 11);
}

export function simulateFullMatch(homeTeam: Team, awayTeam: Team): MatchResult {
  const homeRating = homeTeam.rating || 80;
  const awayRating = awayTeam.rating || 80;

  const diff = (homeRating - awayRating) / 10;
  let homeGoals = Math.max(0, Math.round(1.5 + diff * 0.5 + (Math.random() * 2 - 1)));
  let awayGoals = Math.max(0, Math.round(1.1 - diff * 0.4 + (Math.random() * 2 - 1)));

  const timeline: MatchEvent[] = [];

  // Kickoff
  timeline.push({
    minute: 1,
    type: 'whistle',
    team: 'home',
    player: 'Hakem',
    description: 'Dev derbi başladı!',
  });

  const allPlayersHome = homeTeam.players.length > 0 ? homeTeam.players : [{ name: 'Hakan Şükür', club: 'Galatasaray', rating: 89, position: 'SNT' }];
  const allPlayersAway = awayTeam.players.length > 0 ? awayTeam.players : [{ name: 'Alex de Souza', club: 'Fenerbahçe', rating: 92, position: 'OOS' }];

  // Distribute home goals
  for (let i = 0; i < homeGoals; i++) {
    const min = Math.floor(Math.random() * 88) + 2;
    const scorer = allPlayersHome[Math.floor(Math.random() * allPlayersHome.length)];
    timeline.push({
      minute: min,
      type: 'goal',
      team: 'home',
      player: scorer.name,
      description: `GOOOLL! ${scorer.name} harika bir vuruşla ağları havalandırdı!`,
    });
  }

  // Distribute away goals
  for (let i = 0; i < awayGoals; i++) {
    const min = Math.floor(Math.random() * 88) + 2;
    const scorer = allPlayersAway[Math.floor(Math.random() * allPlayersAway.length)];
    timeline.push({
      minute: min,
      type: 'goal',
      team: 'away',
      player: scorer.name,
      description: `GOL! ${scorer.name} ceza sahası dışından sert bir şutla golü buldu.`,
    });
  }

  // Add random excitement events (saves, woodwork, yellow cards)
  const excitementMinutes = [18, 34, 52, 68, 77, 85];
  excitementMinutes.forEach(min => {
    const isHome = Math.random() > 0.5;
    const teamKey = isHome ? 'home' : 'away';
    const playerPool = isHome ? allPlayersHome : allPlayersAway;
    const p = playerPool[Math.floor(Math.random() * playerPool.length)];

    const r = Math.random();
    if (r < 0.35) {
      timeline.push({
        minute: min,
        type: 'save',
        team: teamKey,
        player: p.name,
        description: `${p.name} vurdu, kaleci köşeden müthiş uzandı!`,
      });
    } else if (r < 0.65) {
      timeline.push({
        minute: min,
        type: 'woodwork',
        team: teamKey,
        player: p.name,
        description: `${p.name} sert vurdu, top direkte patladı!`,
      });
    } else {
      timeline.push({
        minute: min,
        type: 'card',
        team: teamKey,
        player: p.name,
        description: `${p.name} sert müdahalesi sonucu sarı kart gördü.`,
      });
    }
  });

  // Sort timeline by minute
  timeline.sort((a, b) => a.minute - b.minute);

  // Match MVP
  const pool = homeGoals >= awayGoals ? allPlayersHome : allPlayersAway;
  const mvp = pool.reduce((prev, curr) => (curr.rating || 0) > (prev.rating || 0) ? curr : prev, pool[0]);

  let penaltyShootout: { homeScore: number; awayScore: number; winner: 'home' | 'away' } | undefined = undefined;
  let winner: 'home' | 'away' | 'draw' = homeGoals > awayGoals ? 'home' : homeGoals < awayGoals ? 'away' : 'draw';

  return {
    homeTeam,
    awayTeam,
    homeScore: homeGoals,
    awayScore: awayGoals,
    events: timeline,
    timeline,
    homeRating,
    awayRating,
    mvp,
    winner,
    penaltyShootout,
  };
}

export function simulateMatch(
  homeName: string,
  homeSquad: PlayerData[],
  awayName: string,
  awaySquad: PlayerData[],
  allowDraw = true,
): MatchResult {
  const homeTeam: Team = { name: homeName, players: homeSquad, rating: calculateTeamRating(homeSquad).ovr };
  const awayTeam: Team = { name: awayName, players: awaySquad, rating: calculateTeamRating(awaySquad).ovr };
  return simulateFullMatch(homeTeam, awayTeam);
}
