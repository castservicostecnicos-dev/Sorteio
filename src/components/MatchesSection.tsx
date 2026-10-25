import React, { useState } from 'react';
import { DrawnTeam, Match, MatchEvent, Player } from '../types';
import {
  Trophy,
  Plus,
  Minus,
  Check,
  Flame,
  Star,
  Calendar,
  Trash2,
  Play,
  RotateCcw,
} from 'lucide-react';

interface MatchesSectionProps {
  drawnTeams: DrawnTeam[];
  matches: Match[];
  players: Player[];
  onSaveMatch: (match: Match) => void;
  onDeleteMatch: (matchId: string) => void;
}

export const MatchesSection: React.FC<MatchesSectionProps> = ({
  drawnTeams,
  matches,
  players,
  onSaveMatch,
  onDeleteMatch,
}) => {
  // If teams are available, default to team 0 and team 1
  const [teamAIdx, setTeamAIdx] = useState<number>(0);
  const [teamBIdx, setTeamBIdx] = useState<number>(drawnTeams.length > 1 ? 1 : 0);

  const [scoreA, setScoreA] = useState<number>(0);
  const [scoreB, setScoreB] = useState<number>(0);

  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [selectedMvpId, setSelectedMvpId] = useState<string>('');

  const teamA = drawnTeams[teamAIdx] || {
    id: 't_a',
    name: 'Time Verde',
    color: { hex: '#059669', name: 'Verde', emoji: '🟢' },
    players: [],
  };

  const teamB = drawnTeams[teamBIdx] || {
    id: 't_b',
    name: 'Time Vermelho',
    color: { hex: '#e11d48', name: 'Vermelho', emoji: '🔴' },
    players: [],
  };

  const allMatchPlayers = [...(teamA.players || []), ...(teamB.players || [])];

  const handleAddGoal = (teamId: string, playerId: string, playerName: string) => {
    if (teamId === teamA.id) {
      setScoreA((prev) => prev + 1);
    } else {
      setScoreB((prev) => prev + 1);
    }

    setEvents((prev) => [
      ...prev,
      {
        id: `ev_${Date.now()}_${Math.random()}`,
        type: 'goal',
        playerId,
        playerName,
        teamId,
      },
    ]);
  };

  const handleAddAssist = (teamId: string, playerId: string, playerName: string) => {
    setEvents((prev) => [
      ...prev,
      {
        id: `ev_${Date.now()}_${Math.random()}`,
        type: 'assist',
        playerId,
        playerName,
        teamId,
      },
    ]);
  };

  const handleResetCurrentMatch = () => {
    setScoreA(0);
    setScoreB(0);
    setEvents([]);
    setSelectedMvpId('');
  };

  const handleFinishMatch = () => {
    const mvpPlayer = allMatchPlayers.find((p) => p.id === selectedMvpId);

    const newMatch: Match = {
      id: `match_${Date.now()}`,
      date: new Date().toISOString(),
      teamAName: teamA.name,
      teamAColor: teamA.color.hex,
      teamAScore: scoreA,
      teamBName: teamB.name,
      teamBColor: teamB.color.hex,
      teamBScore: scoreB,
      events,
      mvpPlayerId: selectedMvpId || undefined,
      mvpPlayerName: mvpPlayer?.name || undefined,
    };

    onSaveMatch(newMatch);
    handleResetCurrentMatch();
  };

  return (
    <div className="space-y-6">
      {/* Placar ao Vivo / Registro de Jogo */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>⚽</span>
              Registrar Placar da Partida
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Contabilize gols, assistências e o craque do jogo. As pontuações atualizam o ranking geral.
            </p>
          </div>

          {/* Team selector if multiple teams exist */}
          {drawnTeams.length >= 2 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Confronto:</span>
              <select
                value={teamAIdx}
                onChange={(e) => setTeamAIdx(parseInt(e.target.value))}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold text-slate-900 dark:text-white"
              >
                {drawnTeams.map((t, idx) => (
                  <option key={t.id} value={idx}>
                    {t.color.emoji} {t.name}
                  </option>
                ))}
              </select>
              <span className="font-bold text-slate-400">x</span>
              <select
                value={teamBIdx}
                onChange={(e) => setTeamBIdx(parseInt(e.target.value))}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold text-slate-900 dark:text-white"
              >
                {drawnTeams.map((t, idx) => (
                  <option key={t.id} value={idx}>
                    {t.color.emoji} {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Big Scoreboard */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 text-white border border-slate-800 shadow-inner">
          <div className="grid grid-cols-3 items-center text-center">
            {/* Team A */}
            <div className="space-y-2">
              <span className="text-3xl block">{teamA.color.emoji}</span>
              <h3 className="font-extrabold text-sm sm:text-base tracking-tight text-white truncate px-2">
                {teamA.name}
              </h3>
              <div className="flex items-center justify-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setScoreA(Math.max(0, scoreA - 1))}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-base cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-4xl sm:text-5xl font-black font-mono tracking-tighter text-emerald-400 w-16">
                  {scoreA}
                </span>
                <button
                  type="button"
                  onClick={() => setScoreA(scoreA + 1)}
                  className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center font-bold text-base cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Middle VS */}
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
                TEMPO NORMAL
              </span>
              <div className="text-2xl font-black text-slate-500">VS</div>
              <div className="text-[11px] text-slate-400">Sociedade Pelada</div>
            </div>

            {/* Team B */}
            <div className="space-y-2">
              <span className="text-3xl block">{teamB.color.emoji}</span>
              <h3 className="font-extrabold text-sm sm:text-base tracking-tight text-white truncate px-2">
                {teamB.name}
              </h3>
              <div className="flex items-center justify-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setScoreB(Math.max(0, scoreB - 1))}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-base cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-4xl sm:text-5xl font-black font-mono tracking-tighter text-rose-400 w-16">
                  {scoreB}
                </span>
                <button
                  type="button"
                  onClick={() => setScoreB(scoreB + 1)}
                  className="w-8 h-8 rounded-full bg-rose-600 hover:bg-rose-500 flex items-center justify-center font-bold text-base cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Goal & Assist attribution by player */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Team A Roster Buttons */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{teamA.color.emoji}</span>
              Atletas de {teamA.name}
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {teamA.players && teamA.players.length > 0 ? (
                teamA.players.map((p) => (
                  <div
                    key={p.id}
                    className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {p.name}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleAddGoal(teamA.id, p.id, p.name)}
                        className="px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] cursor-pointer"
                        title="Marcar gol"
                      >
                        ⚽ Gol
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddAssist(teamA.id, p.id, p.name)}
                        className="px-2 py-1 rounded bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 font-bold text-[11px] cursor-pointer"
                        title="Marcar assistência"
                      >
                        👟 Assist
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">Nenhum jogador escalado.</p>
              )}
            </div>
          </div>

          {/* Team B Roster Buttons */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{teamB.color.emoji}</span>
              Atletas de {teamB.name}
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {teamB.players && teamB.players.length > 0 ? (
                teamB.players.map((p) => (
                  <div
                    key={p.id}
                    className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {p.name}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleAddGoal(teamB.id, p.id, p.name)}
                        className="px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] cursor-pointer"
                        title="Marcar gol"
                      >
                        ⚽ Gol
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddAssist(teamB.id, p.id, p.name)}
                        className="px-2 py-1 rounded bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 font-bold text-[11px] cursor-pointer"
                        title="Marcar assistência"
                      >
                        👟 Assist
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">Nenhum jogador escalado.</p>
              )}
            </div>
          </div>
        </div>

        {/* MVP Selector & Match Events */}
        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              Eleger o Craque da Partida (MVP):
            </label>
            <select
              value={selectedMvpId}
              onChange={(e) => setSelectedMvpId(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-amber-300/50 dark:border-amber-700/50 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
            >
              <option value="">Nenhum selecionado</option>
              {allMatchPlayers.map((p) => (
                <option key={p.id} value={p.id}>
                  ⭐ {p.name} ({p.position})
                </option>
              ))}
            </select>
          </div>

          {/* Events tags */}
          {events.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-amber-500/20">
              <span className="text-[11px] text-slate-500 font-medium">Lances:</span>
              {events.map((ev, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 flex items-center gap-1"
                >
                  <span>{ev.type === 'goal' ? '⚽' : '👟'}</span>
                  <strong>{ev.playerName}</strong>
                  <button
                    type="button"
                    onClick={() => setEvents((prev) => prev.filter((_, idx) => idx !== i))}
                    className="text-slate-400 hover:text-rose-500 ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Submit Match Result */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleResetCurrentMatch}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
          >
            Limpar Placar
          </button>
          <button
            type="button"
            onClick={handleFinishMatch}
            className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Salvar e Contabilizar Estatísticas
          </button>
        </div>
      </div>

      {/* Matches History List */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-500" />
          Histórico de Partidas Realizadas ({matches.length})
        </h3>

        {matches.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            Nenhuma partida registrada ainda. Inicie o jogo acima para registrar o placar!
          </p>
        ) : (
          <div className="space-y-3">
            {matches.map((m) => {
              const dateStr = new Date(m.date).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400 block">{dateStr}</span>
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-900 dark:text-white">
                      <span>{m.teamAName}</span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 text-white dark:bg-slate-800 font-mono text-base">
                        {m.teamAScore} - {m.teamBScore}
                      </span>
                      <span>{m.teamBName}</span>
                    </div>

                    {/* MVP pill */}
                    {m.mvpPlayerName && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500">
                        <Trophy className="w-3 h-3" />
                        Craque: {m.mvpPlayerName}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteMatch(m.id)}
                    title="Excluir partida"
                    className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
