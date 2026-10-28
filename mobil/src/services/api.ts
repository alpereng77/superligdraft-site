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
  squad?: Player[];
}

export interface RoomData {
  roomCode: string;
  maxPlayers: number;
  status: 'waiting' | 'drafting' | 'simulating' | 'finished';
  players: RoomPlayer[];
  lastActivity: number;
  leagueResults?: any;
}

export interface MultiplayerRoom {
  room_code: string;
  host_name: string;
  guest_name?: string;
  host_ready: boolean;
  guest_ready: boolean;
  status: 'waiting' | 'drafting' | 'playing' | 'finished';
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

export const createRoom = async (hostName: string): Promise<MultiplayerRoom> => {
  try {
    const res = await fetch(`${API_BASE_URL}/rooms/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ username: hostName, maxPlayers: 2 }),
    });
    const data = await res.json();
    if (data && data.success && data.room) {
      return {
        room_code: data.room.roomCode,
        host_name: hostName,
        host_ready: false,
        guest_ready: false,
        status: 'waiting',
      };
    }
  } catch (err) {
    console.warn('createRoom api error:', err);
  }

  const randomCode = 'TR' + Math.floor(1000 + Math.random() * 9000);
  return {
    room_code: randomCode,
    host_name: hostName,
    host_ready: false,
    guest_ready: false,
    status: 'waiting',
  };
};

export const joinRoom = async (roomCode: string, guestName: string): Promise<MultiplayerRoom> => {
  try {
    const res = await fetch(`${API_BASE_URL}/rooms/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ roomCode, username: guestName }),
    });
    const data = await res.json();
    if (data && data.success && data.room) {
      return {
        room_code: roomCode,
        host_name: data.room.players?.[0]?.username || 'Ev Sahibi',
        guest_name: guestName,
        host_ready: data.room.players?.[0]?.ready || false,
        guest_ready: false,
        status: data.room.status || 'waiting',
      };
    }
  } catch (err) {
    console.warn('joinRoom api error:', err);
  }

  return {
    room_code: roomCode,
    host_name: 'Ev Sahibi',
    guest_name: guestName,
    host_ready: true,
    guest_ready: false,
    status: 'waiting',
  };
};

export const getRoomState = async (roomCode: string): Promise<MultiplayerRoom | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/rooms/state?roomCode=${encodeURIComponent(roomCode)}`, {
      headers: { Accept: 'application/json' },
    });
    const data = await res.json();
    if (data && data.success && data.room) {
      const r = data.room;
      return {
        room_code: r.roomCode,
        host_name: r.players?.[0]?.username || 'Ev Sahibi',
        guest_name: r.players?.[1]?.username,
        host_ready: !!r.players?.[0]?.ready,
        guest_ready: !!r.players?.[1]?.ready,
        status: r.status,
      };
    }
  } catch {
    // quiet
  }
  return null;
};

export const setPlayerReady = async (
  roomCode: string,
  role: 'host' | 'guest',
  ready: boolean,
): Promise<boolean> => {
  try {
    const res = await fetch(`${API_BASE_URL}/rooms/ready`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ roomCode, ready, role }),
    });
    const data = await res.json();
    return !!data?.success;
  } catch {
    return false;
  }
};

export const ApiService = {
  fetchNostaljiDatabase,
  fetchNostaljiDataset,
  fetchTycoonPlayers,
  createRoom,
  joinRoom,
  getRoomState,
};
