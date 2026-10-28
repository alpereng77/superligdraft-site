export interface FormationSlot {
  id: number;
  index: number;
  label: string;
  role: string;
  type: 'GK' | 'DF' | 'MF' | 'FW';
  top: string;
  left: string;
  x: number;
  y: number;
}

export type FormationPosition = FormationSlot;

export interface FormationDefinition {
  name: string;
  positions: FormationPosition[];
}

export const FORMATIONS: Record<string, FormationDefinition> = {
  '4-4-2': {
    name: '4-4-2',
    positions: [
      { id: 0, index: 0, label: 'GK', role: 'KL', type: 'GK', top: '82%', left: '50%', x: 50, y: 84 },
      { id: 1, index: 1, label: 'LB', role: 'SLB', type: 'DF', top: '65%', left: '16%', x: 16, y: 66 },
      { id: 2, index: 2, label: 'CB', role: 'STP', type: 'DF', top: '68%', left: '38%', x: 38, y: 70 },
      { id: 3, index: 3, label: 'CB', role: 'STP', type: 'DF', top: '68%', left: '62%', x: 62, y: 70 },
      { id: 4, index: 4, label: 'RB', role: 'SĞB', type: 'DF', top: '65%', left: '84%', x: 84, y: 66 },
      { id: 5, index: 5, label: 'LM', role: 'SLO', type: 'MF', top: '44%', left: '14%', x: 16, y: 46 },
      { id: 6, index: 6, label: 'CM', role: 'OS', type: 'MF', top: '46%', left: '38%', x: 38, y: 48 },
      { id: 7, index: 7, label: 'CM', role: 'OS', type: 'MF', top: '46%', left: '62%', x: 62, y: 48 },
      { id: 8, index: 8, label: 'RM', role: 'SĞO', type: 'MF', top: '44%', left: '86%', x: 84, y: 46 },
      { id: 9, index: 9, label: 'ST', role: 'SNT', type: 'FW', top: '20%', left: '35%', x: 36, y: 22 },
      { id: 10, index: 10, label: 'ST', role: 'SNT', type: 'FW', top: '20%', left: '65%', x: 64, y: 22 },
    ],
  },
  '4-3-3': {
    name: '4-3-3',
    positions: [
      { id: 0, index: 0, label: 'GK', role: 'KL', type: 'GK', top: '82%', left: '50%', x: 50, y: 84 },
      { id: 1, index: 1, label: 'LB', role: 'SLB', type: 'DF', top: '65%', left: '16%', x: 16, y: 66 },
      { id: 2, index: 2, label: 'CB', role: 'STP', type: 'DF', top: '68%', left: '38%', x: 38, y: 70 },
      { id: 3, index: 3, label: 'CB', role: 'STP', type: 'DF', top: '68%', left: '62%', x: 62, y: 70 },
      { id: 4, index: 4, label: 'RB', role: 'SĞB', type: 'DF', top: '65%', left: '84%', x: 84, y: 66 },
      { id: 5, index: 5, label: 'CM', role: 'OS', type: 'MF', top: '48%', left: '26%', x: 26, y: 48 },
      { id: 6, index: 6, label: 'DM', role: 'DOS', type: 'MF', top: '53%', left: '50%', x: 50, y: 54 },
      { id: 7, index: 7, label: 'CM', role: 'OS', type: 'MF', top: '48%', left: '74%', x: 74, y: 48 },
      { id: 8, index: 8, label: 'LW', role: 'SLK', type: 'FW', top: '22%', left: '18%', x: 18, y: 24 },
      { id: 9, index: 9, label: 'ST', role: 'SNT', type: 'FW', top: '18%', left: '50%', x: 50, y: 18 },
      { id: 10, index: 10, label: 'RW', role: 'SĞK', type: 'FW', top: '22%', left: '82%', x: 82, y: 24 },
    ],
  },
  '4-2-3-1': {
    name: '4-2-3-1',
    positions: [
      { id: 0, index: 0, label: 'GK', role: 'KL', type: 'GK', top: '82%', left: '50%', x: 50, y: 84 },
      { id: 1, index: 1, label: 'LB', role: 'SLB', type: 'DF', top: '65%', left: '16%', x: 16, y: 66 },
      { id: 2, index: 2, label: 'CB', role: 'STP', type: 'DF', top: '68%', left: '38%', x: 38, y: 70 },
      { id: 3, index: 3, label: 'CB', role: 'STP', type: 'DF', top: '68%', left: '62%', x: 62, y: 70 },
      { id: 4, index: 4, label: 'RB', role: 'SĞB', type: 'DF', top: '65%', left: '84%', x: 84, y: 66 },
      { id: 5, index: 5, label: 'DM', role: 'DOS', type: 'MF', top: '53%', left: '35%', x: 35, y: 55 },
      { id: 6, index: 6, label: 'DM', role: 'DOS', type: 'MF', top: '53%', left: '65%', x: 65, y: 55 },
      { id: 7, index: 7, label: 'LAM', role: 'SLO', type: 'MF', top: '34%', left: '22%', x: 20, y: 36 },
      { id: 8, index: 8, label: 'CAM', role: 'OOS', type: 'MF', top: '32%', left: '50%', x: 50, y: 34 },
      { id: 9, index: 9, label: 'RAM', role: 'SĞO', type: 'MF', top: '34%', left: '78%', x: 80, y: 36 },
      { id: 10, index: 10, label: 'ST', role: 'SNT', type: 'FW', top: '18%', left: '50%', x: 50, y: 18 },
    ],
  },
  '3-5-2': {
    name: '3-5-2',
    positions: [
      { id: 0, index: 0, label: 'GK', role: 'KL', type: 'GK', top: '82%', left: '50%', x: 50, y: 84 },
      { id: 1, index: 1, label: 'CB', role: 'STP', type: 'DF', top: '68%', left: '25%', x: 26, y: 68 },
      { id: 2, index: 2, label: 'CB', role: 'STP', type: 'DF', top: '70%', left: '50%', x: 50, y: 71 },
      { id: 3, index: 3, label: 'CB', role: 'STP', type: 'DF', top: '68%', left: '75%', x: 74, y: 68 },
      { id: 4, index: 4, label: 'LWB', role: 'SLK', type: 'MF', top: '48%', left: '12%', x: 14, y: 48 },
      { id: 5, index: 5, label: 'DM', role: 'DOS', type: 'MF', top: '54%', left: '50%', x: 50, y: 54 },
      { id: 6, index: 6, label: 'CM', role: 'OS', type: 'MF', top: '42%', left: '35%', x: 35, y: 42 },
      { id: 7, index: 7, label: 'CM', role: 'OS', type: 'MF', top: '42%', left: '65%', x: 65, y: 42 },
      { id: 8, index: 8, label: 'RWB', role: 'SĞK', type: 'MF', top: '48%', left: '88%', x: 86, y: 48 },
      { id: 9, index: 9, label: 'ST', role: 'SNT', type: 'FW', top: '20%', left: '35%', x: 36, y: 22 },
      { id: 10, index: 10, label: 'ST', role: 'SNT', type: 'FW', top: '20%', left: '65%', x: 64, y: 22 },
    ],
  },
};

export const formationConfigs: Record<string, FormationSlot[]> = {
  '4-4-2': FORMATIONS['4-4-2'].positions,
  '4-3-3': FORMATIONS['4-3-3'].positions,
  '4-2-3-1': FORMATIONS['4-2-3-1'].positions,
  '3-5-2': FORMATIONS['3-5-2'].positions,
};
