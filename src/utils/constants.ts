import { Player, TeamColor } from '../types';

export const TEAM_COLORS: TeamColor[] = [
  {
    name: 'Colete Verde',
    bgClass: 'bg-emerald-600',
    borderClass: 'border-emerald-500',
    textClass: 'text-emerald-400',
    badgeClass: 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60',
    hex: '#059669',
    emoji: '🟢',
  },
  {
    name: 'Colete Vermelho',
    bgClass: 'bg-rose-600',
    borderClass: 'border-rose-500',
    textClass: 'text-rose-400',
    badgeClass: 'bg-rose-950/60 text-rose-300 border border-rose-800/60',
    hex: '#e11d48',
    emoji: '🔴',
  },
  {
    name: 'Colete Azul',
    bgClass: 'bg-sky-600',
    borderClass: 'border-sky-500',
    textClass: 'text-sky-400',
    badgeClass: 'bg-sky-950/60 text-sky-300 border border-sky-800/60',
    hex: '#0284c7',
    emoji: '🔵',
  },
  {
    name: 'Colete Preto',
    bgClass: 'bg-zinc-800',
    borderClass: 'border-zinc-700',
    textClass: 'text-zinc-300',
    badgeClass: 'bg-zinc-900 text-zinc-200 border border-zinc-700',
    hex: '#27272a',
    emoji: '⚫',
  },
  {
    name: 'Colete Amarelo',
    bgClass: 'bg-amber-500',
    borderClass: 'border-amber-400',
    textClass: 'text-amber-400',
    badgeClass: 'bg-amber-950/60 text-amber-300 border border-amber-800/60',
    hex: '#d97706',
    emoji: '🟡',
  },
  {
    name: 'Colete Laranja',
    bgClass: 'bg-orange-600',
    borderClass: 'border-orange-500',
    textClass: 'text-orange-400',
    badgeClass: 'bg-orange-950/60 text-orange-300 border border-orange-800/60',
    hex: '#ea580c',
    emoji: '🟠',
  },
  {
    name: 'Colete Branco',
    bgClass: 'bg-slate-100',
    borderClass: 'border-slate-300',
    textClass: 'text-slate-200',
    badgeClass: 'bg-white/10 text-slate-100 border border-slate-600',
    hex: '#f8fafc',
    emoji: '⚪',
  },
  {
    name: 'Colete Roxo',
    bgClass: 'bg-purple-600',
    borderClass: 'border-purple-500',
    textClass: 'text-purple-400',
    badgeClass: 'bg-purple-950/60 text-purple-300 border border-purple-800/60',
    hex: '#9333ea',
    emoji: '🟣',
  },
];

// Completely empty by default: zero demo athletes in the database
export const INITIAL_PLAYERS: Player[] = [];
