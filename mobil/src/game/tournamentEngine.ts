export interface TournamentMatch {
  id: string;
  round: number; // 16, 8, 4, 2
  roundName: string;
  homeTeam: { name: string; year?: string; ovr?: number };
  awayTeam: { name: string; year?: string; ovr?: number };
  homeScore?: number;
  awayScore?: number;
  winner?: string;
  isPlayed: boolean;
}

export interface TournamentState {
  id: string;
  userTeamName: string;
  currentRound: number; // 16, 8, 4, 2
  matches: TournamentMatch[];
  isFinished: boolean;
  champion?: string;
}

export const HISTORICAL_TEAMS = [
  { name: 'Galatasaray (99-00)', year: '1999-00', ovr: 88 },
  { name: 'Fenerbahçe (07-08)', year: '2007-08', ovr: 87 },
  { name: 'Beşiktaş (02-03)', year: '2002-03', ovr: 86 },
  { name: 'Trabzonspor (10-11)', year: '2010-11', ovr: 84 },
  { name: 'Bursaspor (09-10)', year: '2009-10', ovr: 82 },
  { name: 'Gençlerbirliği (02-03)', year: '2002-03', ovr: 80 },
  { name: 'Gaziantepspor (00-01)', year: '2000-01', ovr: 81 },
  { name: 'Kayserispor (07-08)', year: '2007-08', ovr: 79 },
  { name: 'Sivasspor (08-09)', year: '2008-09', ovr: 81 },
  { name: 'Denizlispor (02-03)', year: '2002-03', ovr: 78 },
  { name: 'Kocaelispor (01-02)', year: '2001-02', ovr: 77 },
  { name: 'Ankaragücü (00-01)', year: '2000-01', ovr: 78 },
  { name: 'Göztepe (01-02)', year: '2001-02', ovr: 76 },
  { name: 'Malatyaspor (02-03)', year: '2002-03', ovr: 77 },
  { name: 'Antalyaspor (99-00)', year: '1999-00', ovr: 76 },
];

export function create16TeamTournament(userName = 'Senin Efsanelerin'): TournamentState {
  const shuffled = [...HISTORICAL_TEAMS].sort(() => 0.5 - Math.random());
  const round16Teams = [
    { name: userName, year: '2026', ovr: 84 },
    ...shuffled.slice(0, 15),
  ];

  const matches: TournamentMatch[] = [];
  for (let i = 0; i < 8; i++) {
    matches.push({
      id: `m-16-${i}`,
      round: 16,
      roundName: 'Son 16 Turu',
      homeTeam: round16Teams[i * 2],
      awayTeam: round16Teams[i * 2 + 1],
      isPlayed: false,
    });
  }

  return {
    id: `tour-${Date.now()}`,
    userTeamName: userName,
    currentRound: 16,
    matches,
    isFinished: false,
  };
}

export function advanceTournamentMatch(
  state: TournamentState,
  matchId: string,
  winner: string,
): TournamentState {
  const match = state.matches.find(m => m.id === matchId);
  if (match) {
    match.winner = winner;
    match.isPlayed = true;
    match.homeScore = winner === match.homeTeam.name ? 2 : 1;
    match.awayScore = winner === match.awayTeam.name ? 2 : 1;
  }

  // Check if all matches in this round are completed
  const currentMatches = state.matches.filter(m => m.round === state.currentRound);
  const allDone = currentMatches.every(m => m.isPlayed);

  if (allDone) {
    const winners = currentMatches.map(m => m.winner || m.homeTeam.name);
    if (state.currentRound === 16) {
      state.currentRound = 8;
      for (let i = 0; i < 4; i++) {
        state.matches.push({
          id: `m-8-${i}`,
          round: 8,
          roundName: 'Çeyrek Final',
          homeTeam: { name: winners[i * 2] },
          awayTeam: { name: winners[i * 2 + 1] },
          isPlayed: false,
        });
      }
    } else if (state.currentRound === 8) {
      state.currentRound = 4;
      for (let i = 0; i < 2; i++) {
        state.matches.push({
          id: `m-4-${i}`,
          round: 4,
          roundName: 'Yarı Final',
          homeTeam: { name: winners[i * 2] },
          awayTeam: { name: winners[i * 2 + 1] },
          isPlayed: false,
        });
      }
    } else if (state.currentRound === 4) {
      state.currentRound = 2;
      state.matches.push({
        id: `m-2-0`,
        round: 2,
        roundName: 'Büyük Final',
        homeTeam: { name: winners[0] },
        awayTeam: { name: winners[1] },
        isPlayed: false,
      });
    } else if (state.currentRound === 2) {
      state.isFinished = true;
      state.champion = winner;
    }
  }

  return { ...state };
}

export function simulateAiMatchesForRound(
  state: TournamentState,
  round: number,
): TournamentState {
  const unplayedAiMatches = state.matches.filter(
    m =>
      m.round === round &&
      !m.isPlayed &&
      m.homeTeam.name !== state.userTeamName &&
      m.awayTeam.name !== state.userTeamName,
  );

  unplayedAiMatches.forEach(m => {
    const homeWins = Math.random() > 0.48;
    m.winner = homeWins ? m.homeTeam.name : m.awayTeam.name;
    m.homeScore = homeWins ? 2 : 1;
    m.awayScore = homeWins ? 1 : 2;
    m.isPlayed = true;
  });

  return { ...state };
}
