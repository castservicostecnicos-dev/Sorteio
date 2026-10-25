export type Position = 'GK' | 'DEF' | 'MID' | 'ATT';

export interface PositionConfig {
  code: Position;
  label: string;
  shortLabel: string;
  iconName: string;
  colorClass: string;
  badgeBg: string;
}

export const POSITIONS: Record<Position, PositionConfig> = {
  GK: {
    code: 'GK',
    label: 'Goleiro',
    shortLabel: 'GOL',
    iconName: 'Shield',
    colorClass: 'text-amber-500',
    badgeBg: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
  DEF: {
    code: 'DEF',
    label: 'Zagueiro / Fixo',
    shortLabel: 'ZAG',
    iconName: 'ShieldCheck',
    colorClass: 'text-blue-500',
    badgeBg: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  },
  MID: {
    code: 'MID',
    label: 'Meio / Ala',
    shortLabel: 'MEI',
    iconName: 'Activity',
    colorClass: 'text-emerald-500',
    badgeBg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  },
  ATT: {
    code: 'ATT',
    label: 'Atacante / Pivô',
    shortLabel: 'ATA',
    iconName: 'Flame',
    colorClass: 'text-rose-500',
    badgeBg: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  },
};

export interface Player {
  id: string;
  name: string;
  nickname?: string;
  position: Position;
  rating: number; // 1.0 to 5.0
  tag?: 'mensalista' | 'diarista' | 'convidado';
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goals: number;
  assists: number;
  mvpCount: number;
  createdAt: string;
  avatarColor?: string;
}

export interface DraftPlayer {
  id: string;
  name: string;
  position: Position;
  rating: number;
  isRegistered?: boolean;
  registeredPlayerId?: string;
}

export interface TeamColor {
  name: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  badgeClass: string;
  hex: string;
  emoji: string;
}

export interface DrawnTeam {
  id: string;
  name: string;
  color: TeamColor;
  players: DraftPlayer[];
  averageRating: number;
  substitutes: DraftPlayer[];
}

export interface MatchEvent {
  id: string;
  type: 'goal' | 'assist';
  playerId: string;
  playerName: string;
  teamId: string;
}

export interface Match {
  id: string;
  date: string;
  teamAName: string;
  teamAColor: string;
  teamAScore: number;
  teamBName: string;
  teamBColor: string;
  teamBScore: number;
  events: MatchEvent[];
  mvpPlayerId?: string;
  mvpPlayerName?: string;
}

export interface DrawSettings {
  playersPerTeam: number;
  mode: 'balanced' | 'random';
  guaranteeGoalies: boolean;
  allowSubstitutes: boolean;
}
