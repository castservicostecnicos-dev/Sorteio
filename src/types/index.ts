export type Position = 'GK' | 'FIELD';

export interface PositionConfig {
  code: Position;
  label: string;
  shortLabel: string;
  emoji: string;
  badgeBg: string;
}

export const POSITIONS: Record<Position, PositionConfig> = {
  GK: {
    code: 'GK',
    label: 'Goleiro',
    shortLabel: 'GOL',
    emoji: '🧤',
    badgeBg: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
  FIELD: {
    code: 'FIELD',
    label: 'Jogador',
    shortLabel: 'JOG',
    emoji: '⚽',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
};

export interface Player {
  id: string;
  name: string;
  nickname?: string;
  position: Position; // 'GK' or 'FIELD'
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
