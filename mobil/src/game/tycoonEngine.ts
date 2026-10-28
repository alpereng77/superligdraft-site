import { Player } from '../services/api';

export interface Building {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  costToUpgrade: number;
  revenuePerWeek: number;
  description: string;
  icon: string;
}

export interface TycoonClub {
  name: string;
  budget: number;
  reputation: number;
  fanCount: number;
  week: number;
  buildings: Building[];
  squad: Player[];
}

export const INITIAL_BUILDINGS: Building[] = [
  {
    id: 'stadium',
    name: 'Kulüp Stadyumu',
    level: 1,
    maxLevel: 5,
    costToUpgrade: 250000,
    revenuePerWeek: 45000,
    description: 'Bilet ve maç günü hasılatını doğrudan artırır.',
    icon: '🏟️',
  },
  {
    id: 'training',
    name: 'Antrenman Tesisleri',
    level: 1,
    maxLevel: 5,
    costToUpgrade: 180000,
    revenuePerWeek: 15000,
    description: 'Oyuncu gelişimini ve kondisyonunu hızlandırır.',
    icon: '⚽',
  },
  {
    id: 'academy',
    name: 'Gençlik Akademisi',
    level: 1,
    maxLevel: 5,
    costToUpgrade: 200000,
    revenuePerWeek: 20000,
    description: 'Altyapıdan her ay yeni yerli yıldız adayı çıkarır.',
    icon: '🎓',
  },
  {
    id: 'fanshop',
    name: 'Taraftar Mağazası',
    level: 1,
    maxLevel: 5,
    costToUpgrade: 120000,
    revenuePerWeek: 35000,
    description: 'Forma, atkı ve retro ürün satış gelirlerini artırır.',
    icon: '👕',
  },
  {
    id: 'medical',
    name: 'Sağlık & Fizik Tedavi',
    level: 1,
    maxLevel: 5,
    costToUpgrade: 140000,
    revenuePerWeek: 10000,
    description: 'Sakatlık riskini ve tedavi sürelerini azaltır.',
    icon: '🏥',
  },
  {
    id: 'hotel',
    name: 'Kulüp Oteli & Konaklama',
    level: 1,
    maxLevel: 5,
    costToUpgrade: 220000,
    revenuePerWeek: 30000,
    description: 'Kamp maliyetlerini düşürür ve turizm geliri sağlar.',
    icon: '🏨',
  },
];

export function createInitialTycoonClub(clubName = 'Anadolu Kaplanları'): TycoonClub {
  return {
    name: clubName,
    budget: 500000,
    reputation: 60,
    fanCount: 25000,
    week: 1,
    buildings: [...INITIAL_BUILDINGS],
    squad: [],
  };
}

export function upgradeBuilding(
  club: TycoonClub,
  buildingId: string,
): { success: boolean; error?: string } {
  const building = club.buildings.find(b => b.id === buildingId);
  if (!building) {
    return { success: false, error: 'Tesis bulunamadı.' };
  }
  if (building.level >= building.maxLevel) {
    return { success: false, error: 'Bu tesis zaten maksimum seviyede.' };
  }
  if (club.budget < building.costToUpgrade) {
    return { success: false, error: 'Yetersiz bütçe!' };
  }

  club.budget -= building.costToUpgrade;
  building.level += 1;
  building.costToUpgrade = Math.round(building.costToUpgrade * 1.6);
  building.revenuePerWeek = Math.round(building.revenuePerWeek * 1.5);
  club.reputation = Math.min(100, club.reputation + 3);
  club.fanCount += 5000;

  return { success: true };
}

export function calculateFinances(club: TycoonClub): {
  weeklyRevenue: number;
  weeklyExpense: number;
  weeklyNet: number;
} {
  const weeklyRevenue = club.buildings.reduce(
    (acc, b) => acc + b.revenuePerWeek * b.level,
    0,
  );
  // Wage cost per player
  const weeklyExpense = club.squad.length * 8000 + 15000;
  const weeklyNet = weeklyRevenue - weeklyExpense;

  return {
    weeklyRevenue,
    weeklyExpense,
    weeklyNet,
  };
}

export function playTycoonMatchday(club: TycoonClub): {
  homeScore: number;
  awayScore: number;
  gateRevenue: number;
  netWeeklyIncome: number;
} {
  const stadium = club.buildings.find(b => b.id === 'stadium') || { level: 1 };
  const gateRevenue = Math.round((club.fanCount * 0.4) * (20 + stadium.level * 10));

  const finances = calculateFinances(club);
  const netWeeklyIncome = finances.weeklyNet + gateRevenue;

  club.budget += netWeeklyIncome;
  club.week += 1;
  club.fanCount += Math.floor(Math.random() * 2000) + 1000;

  const homeScore = Math.floor(Math.random() * 4);
  const awayScore = Math.floor(Math.random() * 3);

  return {
    homeScore,
    awayScore,
    gateRevenue,
    netWeeklyIncome,
  };
}
