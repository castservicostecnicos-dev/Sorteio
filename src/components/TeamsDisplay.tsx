import React, { useState } from 'react';
import {
  Shuffle,
  Share2,
  Copy,
  Check,
  ArrowRightLeft,
  Star,
  Users,
  Shield,
  Trophy,
  PlayCircle,
  ExternalLink,
} from 'lucide-react';
import { DraftPlayer, DrawnTeam, POSITIONS } from '../types';

interface TeamsDisplayProps {
  teams: DrawnTeam[];
  onRedraw: () => void;
  onOpenExportModal: () => void;
  onViewPitch: () => void;
  onStartMatch: (teamA: DrawnTeam, teamB: DrawnTeam) => void;
  onSwapPlayers: (
    teamAId: string,
    playerAId: string,
    teamBId: string,
    playerBId: string
  ) => void;
  onMovePlayer: (fromTeamId: string, toTeamId: string, playerId: string) => void;
}

export const TeamsDisplay: React.FC<TeamsDisplayProps> = ({
  teams,
  onRedraw,
  onOpenExportModal,
  onViewPitch,
  onStartMatch,
  onSwapPlayers,
  onMovePlayer,
}) => {
  const [selectedPlayerForSwap, setSelectedPlayerForSwap] = useState<{
    teamId: string;
    player: DraftPlayer;
  } | null>(null);

  if (!teams || teams.length === 0) {
    return (
      <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-8 bg-white dark:bg-slate-900">
        <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Nenhum time sorteado ainda
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-5">
          Adicione atletas na aba de sorteio e clique no botão para formar os times.
        </p>
      </div>
    );
  }

  // Calculate overall balance score
  const ratings = teams.map((t) => t.averageRating);
  const minRating = Math.min(...ratings);
  const maxRating = Math.max(...ratings);
  const ratingDelta = (maxRating - minRating).toFixed(1);
  const overallAverage = (
    ratings.reduce((sum, r) => sum + r, 0) / (ratings.length || 1)
  ).toFixed(1);

  const handlePlayerClick = (teamId: string, player: DraftPlayer) => {
    if (!selectedPlayerForSwap) {
      setSelectedPlayerForSwap({ teamId, player });
    } else {
      if (selectedPlayerForSwap.teamId === teamId) {
        // Deselect or switch
        if (selectedPlayerForSwap.player.id === player.id) {
          setSelectedPlayerForSwap(null);
        } else {
          setSelectedPlayerForSwap({ teamId, player });
        }
      } else {
        // Swap between two teams!
        onSwapPlayers(
          selectedPlayerForSwap.teamId,
          selectedPlayerForSwap.player.id,
          teamId,
          player.id
        );
        setSelectedPlayerForSwap(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Summary & Actions */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Times Formados
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {teams.length} Times
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Média Geral: <span className="font-bold text-amber-500">⭐ {overallAverage}</span> · Diferença Máxima: {ratingDelta}⭐ ({parseFloat(ratingDelta) <= 0.2 ? 'Equilíbrio Quase Perfeito' : 'Bem Equilibrado'})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onRedraw}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Shuffle className="w-4 h-4 text-emerald-500" />
            Sortear Novamente
          </button>

          <button
            type="button"
            onClick={onViewPitch}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>🏟️</span>
            Ver no Campinho
          </button>

          <button
            type="button"
            onClick={onOpenExportModal}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            Enviar WhatsApp
          </button>
        </div>
      </div>

      {/* Swap Notice Banner */}
      {selectedPlayerForSwap && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-700 dark:text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 shrink-0" />
            <span>
              Selecionado: <strong>{selectedPlayerForSwap.player.name}</strong>. Agora clique em qualquer jogador de outro time para trocar de lugar!
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedPlayerForSwap(null)}
            className="text-xs font-bold underline cursor-pointer ml-2"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Grid of Teams */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team, tIdx) => {
          return (
            <div
              key={team.id}
              className={`rounded-2xl border ${team.color.borderClass} bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md`}
            >
              {/* Team Top Header */}
              <div className={`p-4 ${team.color.bgClass} text-white flex items-center justify-between`}>
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl filter drop-shadow-xs">{team.color.emoji}</span>
                  <div>
                    <h3 className="font-extrabold text-sm tracking-tight text-white leading-tight">
                      {team.name.toUpperCase()}
                    </h3>
                    <span className="text-[11px] text-white/90 font-medium">
                      {team.players.length} Atletas {team.substitutes.length > 0 ? `(+${team.substitutes.length} suplentes)` : ''}
                    </span>
                  </div>
                </div>

                <div className="text-right bg-black/25 backdrop-blur-xs px-2.5 py-1 rounded-xl border border-white/20">
                  <span className="text-[10px] text-white/80 block uppercase tracking-wider font-semibold">
                    Força Média
                  </span>
                  <span className="text-sm font-extrabold text-amber-300 flex items-center justify-end gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-300" />
                    {team.averageRating.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Positional balance bar: only Goleiro and Jogadores */}
              <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800 text-[11px] flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span>
                  🧤 {team.players.filter((p) => p.position === 'GK').length} Goleiro · ⚽{' '}
                  {team.players.filter((p) => p.position !== 'GK').length} Jogadores
                </span>
                <span className="text-[10px] font-medium text-slate-400">
                  Toque p/ trocar
                </span>
              </div>

              {/* Players List */}
              <div className="p-3 divide-y divide-slate-100 dark:divide-slate-800/60 flex-1">
                {team.players.map((player) => {
                  const posCfg = POSITIONS[player.position];
                  const isSelected =
                    selectedPlayerForSwap?.player.id === player.id &&
                    selectedPlayerForSwap.teamId === team.id;

                  return (
                    <div
                      key={player.id}
                      onClick={() => handlePlayerClick(team.id, player)}
                      className={`py-2 px-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-amber-500/15 border border-amber-500 text-amber-900 dark:text-amber-200 font-bold scale-[1.02]'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${posCfg.badgeBg}`}
                        >
                          {posCfg.shortLabel}
                        </span>
                        <span className="text-xs font-semibold truncate">
                          {player.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 text-xs">
                        <span className="text-amber-500 font-semibold flex items-center gap-0.5 text-[11px]">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {player.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Substitutes if any */}
                {team.substitutes.length > 0 && (
                  <div className="pt-2 mt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-2 mb-1">
                      Banco de Reservas / Próximo a entrar
                    </span>
                    {team.substitutes.map((sub) => (
                      <div
                        key={sub.id}
                        onClick={() => handlePlayerClick(team.id, sub)}
                        className="py-1.5 px-2.5 rounded-lg flex items-center justify-between text-xs text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer"
                      >
                        <span className="truncate">🔄 {sub.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {POSITIONS[sub.position].shortLabel}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer: Quick Actions */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  Total de estrelas: {team.players.reduce((s, p) => s + p.rating, 0).toFixed(1)}⭐
                </span>

                {/* Quick match launcher with another team */}
                {teams.length >= 2 && (
                  <button
                    type="button"
                    onClick={() => {
                      const otherTeam = teams.find((t) => t.id !== team.id);
                      if (otherTeam) onStartMatch(team, otherTeam);
                    }}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    Iniciar Jogo
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
