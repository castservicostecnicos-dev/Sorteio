import React, { useState } from 'react';
import { Player, Match, POSITIONS } from '../types';
import {
  Trophy,
  Flame,
  Award,
  Star,
  Users,
  Target,
  Activity,
  ArrowUpDown,
  TrendingUp,
  Shield,
} from 'lucide-react';

interface StatsDashboardProps {
  players: Player[];
  matches: Match[];
}

type SortField = 'points' | 'goals' | 'assists' | 'mvp' | 'winRate' | 'rating';

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  players,
  matches,
}) => {
  const [sortField, setSortField] = useState<SortField>('points');

  // Compute calculated metrics for each player
  const playersWithMetrics = players.map((p) => {
    const points = p.wins * 3 + p.draws * 1;
    const winRate =
      p.matchesPlayed > 0 ? Math.round((p.wins / p.matchesPlayed) * 100) : 0;
    return {
      ...p,
      points,
      winRate,
    };
  });

  // Sort according to current field
  const sortedPlayers = [...playersWithMetrics].sort((a, b) => {
    switch (sortField) {
      case 'points':
        return b.points !== a.points ? b.points - a.points : b.wins - a.wins;
      case 'goals':
        return b.goals !== a.goals ? b.goals - a.goals : b.matchesPlayed - a.matchesPlayed;
      case 'assists':
        return b.assists - a.assists;
      case 'mvp':
        return b.mvpCount - a.mvpCount;
      case 'winRate':
        return b.winRate !== a.winRate ? b.winRate - a.winRate : b.matchesPlayed - a.matchesPlayed;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  // Top performers
  const topScorer = [...players].sort((a, b) => b.goals - a.goals)[0];
  const topAssister = [...players].sort((a, b) => b.assists - a.assists)[0];
  const topMvp = [...players].sort((a, b) => b.mvpCount - a.mvpCount)[0];
  const totalGoals = players.reduce((sum, p) => sum + p.goals, 0);

  return (
    <div className="space-y-6">
      {/* Top Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Classificação & Estatísticas Visuais
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pontuação competitiva: 3 pts por vitória, 1 por empate. Medição contínua de desempenho.
          </p>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-medium">Ordenar por:</span>
          {(
            [
              { id: 'points', label: 'Pontos' },
              { id: 'goals', label: 'Gols' },
              { id: 'assists', label: 'Assistências' },
              { id: 'winRate', label: 'Aproveitamento' },
              { id: 'mvp', label: 'Craque' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => setSortField(item.id)}
              className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-colors ${
                sortField === item.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Top Scorer Card */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold text-lg shrink-0">
            🔥
          </div>
          <div className="truncate">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Artilheiro Máximo
            </span>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {topScorer?.name || '-'}
            </h4>
            <span className="text-sm font-extrabold text-rose-600 dark:text-rose-400 font-mono">
              {topScorer?.goals || 0} Gols
            </span>
          </div>
        </div>

        {/* Top Assister */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold text-lg shrink-0">
            🎯
          </div>
          <div className="truncate">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Líder de Passes
            </span>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {topAssister?.name || '-'}
            </h4>
            <span className="text-sm font-extrabold text-sky-600 dark:text-sky-400 font-mono">
              {topAssister?.assists || 0} Assistências
            </span>
          </div>
        </div>

        {/* Top MVP */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-lg shrink-0">
            🏆
          </div>
          <div className="truncate">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Craque da Pelada
            </span>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {topMvp?.name || '-'}
            </h4>
            <span className="text-sm font-extrabold text-amber-500 font-mono">
              {topMvp?.mvpCount || 0}x MVP
            </span>
          </div>
        </div>

        {/* Overall Matches & Goals */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-lg shrink-0">
            ⚽
          </div>
          <div className="truncate">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Gols Totais Registrados
            </span>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              {matches.length} Partidas
            </h4>
            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              {totalGoals} Gols
            </span>
          </div>
        </div>
      </div>

      {/* Main Table: Ranking Geral */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Tabela de Classificação e Desempenho
          </h3>
          <span className="text-xs text-slate-400">
            {sortedPlayers.length} atletas listados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                <th className="py-3 px-3 text-center w-10">#</th>
                <th className="py-3 px-3">Atleta</th>
                <th className="py-3 px-3 text-center">Posição</th>
                <th className="py-3 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                  PTS
                </th>
                <th className="py-3 px-3 text-center">J</th>
                <th className="py-3 px-3 text-center text-emerald-600 dark:text-emerald-400">V</th>
                <th className="py-3 px-3 text-center text-slate-400">E</th>
                <th className="py-3 px-3 text-center text-rose-500">D</th>
                <th className="py-3 px-3 text-center font-bold text-rose-600 dark:text-rose-400">G</th>
                <th className="py-3 px-3 text-center text-sky-500">A</th>
                <th className="py-3 px-3 text-center text-amber-500">🏆</th>
                <th className="py-3 px-3 text-center w-36">Aproveitamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedPlayers.map((player, index) => {
                const posCfg = POSITIONS[player.position];
                return (
                  <tr
                    key={player.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-400">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}°`}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {player.name}
                        </span>
                        {player.nickname && (
                          <span className="text-[11px] text-slate-400 hidden sm:inline">
                            "{player.nickname}"
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${posCfg.badgeBg}`}
                      >
                        {posCfg.shortLabel}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-black text-sm text-emerald-600 dark:text-emerald-400">
                      {player.points}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-medium">
                      {player.matchesPlayed}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {player.wins}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-400">
                      {player.draws}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-rose-500">
                      {player.losses}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-rose-600 dark:text-rose-400">
                      {player.goals}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-medium text-sky-600 dark:text-sky-400">
                      {player.assists}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-amber-500">
                      {player.mvpCount > 0 ? player.mvpCount : '-'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${player.winRate}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-[11px] text-slate-700 dark:text-slate-300 w-8 text-right">
                          {player.winRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
