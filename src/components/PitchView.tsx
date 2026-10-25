import React, { useState } from 'react';
import { DrawnTeam, POSITIONS } from '../types';
import { Star, Users, ArrowRightLeft } from 'lucide-react';

interface PitchViewProps {
  teams: DrawnTeam[];
}

export const PitchView: React.FC<PitchViewProps> = ({ teams }) => {
  const [selectedTeamIdx, setSelectedTeamIdx] = useState(0);
  const [viewMode, setViewMode] = useState<'single' | 'clash'>('clash');

  if (!teams || teams.length === 0) {
    return (
      <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-8 bg-white dark:bg-slate-900">
        <span className="text-4xl block mb-2">🏟️</span>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Nenhum time disponível para o campinho
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Faça o sorteio na aba principal para visualizar os times posicionados no gramado society.
        </p>
      </div>
    );
  }

  const teamA = teams[selectedTeamIdx % teams.length];
  const teamB = teams[(selectedTeamIdx + 1) % teams.length];

  return (
    <div className="space-y-6">
      {/* Pitch Header & Controls */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>🏟️</span>
            Campinho Tático Society
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Visualização das formações táticas no gramado sintético society.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setViewMode('clash')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                viewMode === 'clash'
                  ? 'bg-white dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Confronto 2 Times
            </button>
            <button
              onClick={() => setViewMode('single')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                viewMode === 'single'
                  ? 'bg-white dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Time Individual
            </button>
          </div>

          {/* Select team */}
          <div className="flex items-center gap-1">
            {teams.map((t, idx) => (
              <button
                key={t.id}
                onClick={() => setSelectedTeamIdx(idx)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  selectedTeamIdx === idx
                    ? 'ring-2 ring-emerald-500 shadow-xs'
                    : 'opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: t.color.hex, color: t.color.name.includes('Branco') ? '#0f172a' : '#ffffff' }}
              >
                <span>{t.color.emoji}</span>
                <span className="hidden sm:inline">{t.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Society Pitch Canvas Container */}
      <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-emerald-950 bg-emerald-900 text-white select-none">
        {/* Synthetic Turf Grass Pattern */}
        <div className="relative w-full aspect-16/10 sm:aspect-16/9 min-h-[460px] bg-gradient-to-b from-emerald-800 to-emerald-900 pitch-stripes flex items-center justify-center p-4 sm:p-8 overflow-hidden">
          {/* Pitch Markings (SVG overlay) */}
          <div className="absolute inset-4 sm:inset-8 border-2 border-white/40 rounded-sm pointer-events-none">
            {/* Center Line */}
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/40 -translate-x-1/2" />
            {/* Center Circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 sm:w-36 sm:h-36 rounded-full border-2 border-white/40 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-white/60" />
            </div>

            {/* Left Penalty Box */}
            <div className="absolute top-1/4 bottom-1/4 left-0 w-24 sm:w-36 border-r-2 border-y-2 border-white/40 rounded-r-xl">
              {/* Penalty Spot */}
              <div className="absolute top-1/2 right-4 -translate-y-1/2 w-2 h-2 rounded-full bg-white/60" />
            </div>
            {/* Left Goal */}
            <div className="absolute top-[35%] bottom-[35%] -left-3.5 w-3.5 border-2 border-white/60 bg-white/10 rounded-l-xs" />

            {/* Right Penalty Box */}
            <div className="absolute top-1/4 bottom-1/4 right-0 w-24 sm:w-36 border-l-2 border-y-2 border-white/40 rounded-l-xl">
              {/* Penalty Spot */}
              <div className="absolute top-1/2 left-4 -translate-y-1/2 w-2 h-2 rounded-full bg-white/60" />
            </div>
            {/* Right Goal */}
            <div className="absolute top-[35%] bottom-[35%] -right-3.5 w-3.5 border-2 border-white/60 bg-white/10 rounded-r-xs" />

            {/* Corner Arcs */}
            <div className="absolute top-0 left-0 w-4 h-4 border-r-2 border-b-2 border-white/40 rounded-br-full" />
            <div className="absolute top-0 right-0 w-4 h-4 border-l-2 border-b-2 border-white/40 rounded-bl-full" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-r-2 border-t-2 border-white/40 rounded-tr-full" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-l-2 border-t-2 border-white/40 rounded-tl-full" />
          </div>

          {/* Player Formations Rendering */}
          {viewMode === 'clash' && teams.length >= 2 ? (
            <div className="relative z-10 w-full h-full grid grid-cols-2 gap-4">
              {/* Team A (Left Half - Attacks Right) */}
              <div className="relative w-full h-full">
                <div className="absolute top-2 left-2 z-20 px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-xs text-xs font-bold border border-white/10 flex items-center gap-1.5">
                  <span>{teamA.color.emoji}</span>
                  <span>{teamA.name}</span>
                  <span className="text-amber-300">({teamA.averageRating}⭐)</span>
                </div>
                {renderTeamHalf(teamA, 'left')}
              </div>

              {/* Team B (Right Half - Attacks Left) */}
              <div className="relative w-full h-full">
                <div className="absolute top-2 right-2 z-20 px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-xs text-xs font-bold border border-white/10 flex items-center gap-1.5">
                  <span className="text-amber-300">({teamB.averageRating}⭐)</span>
                  <span>{teamB.name}</span>
                  <span>{teamB.color.emoji}</span>
                </div>
                {renderTeamHalf(teamB, 'right')}
              </div>
            </div>
          ) : (
            /* Single Team Tactical View across whole pitch */
            <div className="relative z-10 w-full h-full">
              <div className="absolute top-2 left-2 z-20 px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-xs text-sm font-bold border border-white/10 flex items-center gap-2">
                <span className="text-lg">{teamA.color.emoji}</span>
                <span>{teamA.name}</span>
                <span className="text-amber-300 font-extrabold">({teamA.averageRating}⭐)</span>
                <span className="text-xs font-normal opacity-75">· {teamA.players.length} atletas</span>
              </div>
              {renderFullPitchTeam(teamA)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper to render half-pitch formation (clash mode)
function renderTeamHalf(team: DrawnTeam, side: 'left' | 'right') {
  const goalies = team.players.filter((p) => p.position === 'GK');
  const defenders = team.players.filter((p) => p.position === 'DEF');
  const midfielders = team.players.filter((p) => p.position === 'MID');
  const attackers = team.players.filter((p) => p.position === 'ATT');

  // If no goalie, take first player
  const effectiveGoalie = goalies.length > 0 ? goalies[0] : team.players[0];
  const fieldSquad = team.players.filter((p) => p.id !== effectiveGoalie?.id);

  // Re-split field squad
  const defs = fieldSquad.filter((p) => p.position === 'DEF');
  const mids = fieldSquad.filter((p) => p.position === 'MID');
  const atts = fieldSquad.filter((p) => p.position === 'ATT' || p.position === 'GK');

  // If one category is empty, redistribute for visual balance
  const cols = side === 'left' ? [defs, mids, atts] : [atts, mids, defs];

  return (
    <div className="w-full h-full flex items-center justify-between px-2 sm:px-6">
      {/* Goalkeeper */}
      {side === 'left' && (
        <div className="shrink-0 flex items-center justify-center">
          {effectiveGoalie && renderPlayerToken(effectiveGoalie, team, true)}
        </div>
      )}

      {/* Field Lines */}
      {cols.map((group, colIdx) => (
        <div
          key={colIdx}
          className="flex flex-col items-center justify-around h-full py-6 flex-1 gap-2"
        >
          {group.map((player) => renderPlayerToken(player, team, false))}
        </div>
      ))}

      {/* Goalkeeper (if right side) */}
      {side === 'right' && (
        <div className="shrink-0 flex items-center justify-center">
          {effectiveGoalie && renderPlayerToken(effectiveGoalie, team, true)}
        </div>
      )}
    </div>
  );
}

// Helper to render full-pitch lineup
function renderFullPitchTeam(team: DrawnTeam) {
  const goalies = team.players.filter((p) => p.position === 'GK');
  const defenders = team.players.filter((p) => p.position === 'DEF');
  const midfielders = team.players.filter((p) => p.position === 'MID');
  const attackers = team.players.filter((p) => p.position === 'ATT');

  const goalie = goalies[0] || team.players[0];
  const otherPlayers = team.players.filter((p) => p.id !== goalie?.id);

  const defs = otherPlayers.filter((p) => p.position === 'DEF');
  const mids = otherPlayers.filter((p) => p.position === 'MID');
  const atts = otherPlayers.filter((p) => p.position === 'ATT' || p.position === 'GK');

  return (
    <div className="w-full h-full flex items-center justify-between px-4 sm:px-12 py-8">
      {/* Goalie Column */}
      <div className="flex items-center justify-center">
        {goalie && renderPlayerToken(goalie, team, true)}
      </div>

      {/* Defenders */}
      <div className="flex flex-col items-center justify-around h-full py-4">
        {defs.map((p) => renderPlayerToken(p, team, false))}
      </div>

      {/* Midfielders */}
      <div className="flex flex-col items-center justify-around h-full py-2">
        {mids.map((p) => renderPlayerToken(p, team, false))}
      </div>

      {/* Attackers */}
      <div className="flex flex-col items-center justify-around h-full py-6">
        {atts.map((p) => renderPlayerToken(p, team, false))}
      </div>
    </div>
  );
}

function renderPlayerToken(
  player: { name: string; position: string; rating: number },
  team: DrawnTeam,
  isGoalie: boolean
) {
  return (
    <div
      key={player.name}
      className="flex flex-col items-center group cursor-pointer transition-transform hover:scale-110"
      title={`${player.name} (${player.position}) - ${player.rating}⭐`}
    >
      <div
        className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-extrabold text-xs sm:text-sm shadow-md border-2 ${
          isGoalie
            ? 'bg-amber-500 border-amber-300 text-slate-950'
            : 'border-white text-white'
        }`}
        style={!isGoalie ? { backgroundColor: team.color.hex } : undefined}
      >
        {isGoalie ? '🧤' : POSITIONS[player.position as keyof typeof POSITIONS]?.shortLabel || 'J'}
      </div>
      <div className="mt-1 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] sm:text-xs font-bold text-white text-center whitespace-nowrap max-w-[80px] sm:max-w-[110px] truncate shadow-xs">
        {player.name.split(' ')[0]}
      </div>
      <div className="text-[9px] text-amber-300 font-bold flex items-center gap-0.5">
        ★{player.rating.toFixed(1)}
      </div>
    </div>
  );
}
