import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = 'https://superligdraft.site/api';

const NOSTALJI_CACHE_KEY = '@superligdraft_nostalji_data';
const TYCOON_PLAYERS_CACHE_KEY = '@superligdraft_tycoon_players';

export interface NostaljiPlayer {
  name: string;
  position: 'GK' | 'DF' | 'MF' | 'FW' | string;
  rating: number;
  market_value?: string;
  market_value_numeric?: number;
  image_url?: string;
  photo?: string;
}

export interface NostaljiTeam {
  team_name: string;
  club_id?: string;
  roster_url?: string;
  players: NostaljiPlayer[];
}

export type NostaljiDatabase = Record<string, NostaljiTeam[]>;

export interface Player {
  id?: string | number;
  name: string;
  club?: string;
  team?: string;
  season?: string | number;
  year?: number | string;
  position: string;
  rating: number;
  image_url?: string;
  photo?: string;
  nation?: string;
  goals?: number;
  assists?: number;
  matches?: number;
  market_value?: number;
}

export type PlayerData = Player;

export interface RoomPlayer {
  username: string;
  ready: boolean;
  rating: number;
  formation: string | null;
  squad?: any[];
}

export interface MatchEvent {
  minute: number;
  team: 'home' | 'away';
  type: 'goal' | 'miss' | 'var-cancelled' | 'phase';
  text: string;
  name?: string;
  triggerVarConfirm?: boolean;
  cancelText?: string;
  homeScore?: number;
  awayScore?: number;
}

export interface DerbyMatch {
  round: number;
  home: string;
  homeRating: number;
  away: string;
  awayRating: number;
  regularHomeScore: number;
  regularAwayScore: number;
  extraHomeScore: number;
  extraAwayScore: number;
  homeScore: number;
  awayScore: number;
  hasExtraTime: boolean;
  hasPenalties: boolean;
  penaltyResults: any | null;
  winner: 'home' | 'away';
  events: MatchEvent[];
}

export interface StandingItem {
  username: string;
  formation: string;
  rating: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface RoomData {
  roomCode: string;
  maxPlayers: number;
  status: 'waiting' | 'drafting' | 'finished';
  players: RoomPlayer[];
  lastActivity: number;
  leagueResults?: {
    standings: StandingItem[];
    matches: DerbyMatch[];
    champion: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

let cachedDatabase: NostaljiDatabase | null = null;

export const fetchNostaljiDatabase = async (): Promise<NostaljiDatabase> => {
  if (cachedDatabase && Object.keys(cachedDatabase).length > 0) {
    return cachedDatabase;
  }

  // 1. Check local asset bundle first for instant load
  try {
    const localData = require('../assets/data/nostalji_data.json');
    if (localData && Object.keys(localData).length > 0) {
      cachedDatabase = localData;
    }
  } catch {
    // ignore
  }

  // 2. Try API in background or fallback
  try {
    const res = await fetch(`${API_BASE_URL}/datasets/nostalji`, {
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        cachedDatabase = data;
        await AsyncStorage.setItem(NOSTALJI_CACHE_KEY, JSON.stringify(data));
        return data;
      }
    }
  } catch {
    // quiet
  }

  if (cachedDatabase) return cachedDatabase;

  const storageCached = await AsyncStorage.getItem(NOSTALJI_CACHE_KEY);
  if (storageCached) {
    cachedDatabase = JSON.parse(storageCached);
    return cachedDatabase!;
  }

  return {};
};

export const rollRandomTeam = (
  db: NostaljiDatabase,
): { year: string; team_name: string; players: NostaljiPlayer[] } | null => {
  const years = Object.keys(db).filter(y => parseInt(y, 10) >= 2000);
  if (years.length === 0) return null;

  const randomYear = years[Math.floor(Math.random() * years.length)];
  const teams = db[randomYear];
  if (!teams || teams.length === 0) return null;

  const randomTeam = teams[Math.floor(Math.random() * teams.length)];
  return {
    year: randomYear,
    team_name: randomTeam.team_name,
    players: randomTeam.players,
  };
};

export const fetchNostaljiDataset = async (): Promise<Player[]> => {
  const db = await fetchNostaljiDatabase();
  const all: Player[] = [];
  Object.entries(db).forEach(([yr, teams]) => {
    teams.forEach(t => {
      t.players.forEach(p => {
        all.push({
          name: p.name,
          club: t.team_name,
          season: `${yr}-${parseInt(yr, 10) + 1}`,
          position: p.position,
          rating: p.rating,
          image_url: p.image_url,
        });
      });
    });
  });
  return all.slice(0, 500);
};

export const fetchTycoonPlayers = async (): Promise<Player[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/datasets/tycoon-players`, {
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.data)) {
        await AsyncStorage.setItem(TYCOON_PLAYERS_CACHE_KEY, JSON.stringify(data.data));
        return data.data;
      }
    }
  } catch (e) {
    console.warn('API error fetching tycoon players:', e);
  }

  const cached = await AsyncStorage.getItem(TYCOON_PLAYERS_CACHE_KEY);
  if (cached) {
    return JSON.parse(cached);
  }
  return fetchNostaljiDataset();
};

/**
 * Creates a real 2-player derby room on the live Laravel server.
 */
export const createRoom = async (
  username: string,
): Promise<{ success: boolean; roomCode?: string; room?: RoomData; message?: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/rooms/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ username: username.trim(), maxPlayers: 2 }),
    });
    const json = await res.json();
    if (json.success && json.data) {
      return {
        success: true,
        roomCode: json.data.roomCode || json.data.room?.roomCode,
        room: json.data.room,
      };
    }
    return {
      success: false,
      message: json.message || 'Oda oluşturulamadı.',
    };
  } catch (err) {
    console.warn('createRoom api error:', err);
    return {
      success: false,
      message: 'Canlı sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.',
    };
  }
};

/**
 * Joins an existing room by 6-character room code on the live Laravel server.
 */
export const joinRoom = async (
  roomCode: string,
  username: string,
): Promise<{ success: boolean; room?: RoomData; message?: string }> => {
  try {
    const cleanCode = roomCode.trim().toUpperCase();
    const res = await fetch(`${API_BASE_URL}/rooms/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        roomCode: cleanCode,
        username: username.trim(),
      }),
    });
    const json = await res.json();
    if (json.success && json.data?.room) {
      return {
        success: true,
        room: json.data.room,
      };
    }
    return {
      success: false,
      message: json.message || 'Odaya katılım sağlanamadı.',
    };
  } catch (err) {
    console.warn('joinRoom api error:', err);
    return {
      success: false,
      message: 'Canlı sunucuya bağlanılamadı.',
    };
  }
};

/**
 * Polls the current room state from the live Laravel server.
 */
export const getRoomState = async (roomCode: string): Promise<RoomData | null> => {
  try {
    const cleanCode = roomCode.trim().toUpperCase();
    const res = await fetch(`${API_BASE_URL}/rooms/state?roomCode=${encodeURIComponent(cleanCode)}`, {
      headers: { Accept: 'application/json' },
    });
    const json = await res.json();
    if (json.success && json.data?.room) {
      return json.data.room;
    }
  } catch {
    // quiet polling error
  }
  return null;
};

/**
 * Submits the completed draft squad to the live Laravel server.
 * When both players have called this endpoint, the server executes simulateLeague()
 * and transitions status to 'finished', returning the full match events and score.
 */
export const setPlayerReady = async (
  username: string,
  roomCode: string,
  rating: number,
  formation: string,
  squad: any[],
): Promise<{ success: boolean; room?: RoomData; message?: string }> => {
  try {
    const cleanCode = roomCode.trim().toUpperCase();
    const res = await fetch(`${API_BASE_URL}/rooms/ready`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        username: username.trim(),
        roomCode: cleanCode,
        rating: Math.round(rating),
        formation,
        squad,
      }),
    });
    const json = await res.json();
    if (json.success && json.data?.room) {
      return {
        success: true,
        room: json.data.room,
      };
    }
    return {
      success: false,
      message: json.message || 'Kadro sunucuya gönderilemedi.',
    };
  } catch (err) {
    console.warn('setPlayerReady api error:', err);
    return {
      success: false,
      message: 'Sunucuya bağlanılamadı.',
    };
  }
};

export const ApiService = {
  fetchNostaljiDatabase,
  fetchNostaljiDataset,
  fetchTycoonPlayers,
  createRoom,
  joinRoom,
  getRoomState,
  setPlayerReady,
};
