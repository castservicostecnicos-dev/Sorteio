import React, { useState } from 'react';
import { DrawnTeam } from '../types';

interface PitchViewProps {
  teams: DrawnTeam[];
}

export const PitchView: React.FC<PitchViewProps> = ({ teams }) => {
  const [teamTopIdx, setTeamTopIdx] = useState(0);
  const [teamBottomIdx, setTeamBottomIdx] = useState(teams.length > 1 ? 1 : 0);
  const [viewMode, setViewMode] = useState<'clash' | 'single'>('clash');

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

  const teamTop = teams[teamTopIdx % teams.length];
  const teamBottom = teams[teamBottomIdx % teams.length];

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
            Campo dividido horizontalmente: time de cima contra time de baixo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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
              Confronto (Cima x Baixo)
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

          {/* Select teams for clash */}
          {viewMode === 'clash' && teams.length >= 2 ? (
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-slate-400 font-medium">⬆️ Cima:</span>
                <select
                  value={teamTopIdx}
                  onChange={(e) => setTeamTopIdx(parseInt(e.target.value))}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold text-slate-900 dark:text-white text-xs cursor-pointer"
                >
                  {teams.map((t, idx) => (
                    <option key={t.id} value={idx}>
                      {t.color.emoji} {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <span className="text-slate-400 font-bold">x</span>

              <div className="flex items-center gap-1">
                <span className="text-slate-400 font-medium">⬇️ Baixo:</span>
                <select
                  value={teamBottomIdx}
                  onChange={(e) => setTeamBottomIdx(parseInt(e.target.value))}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold text-slate-900 dark:text-white text-xs cursor-pointer"
                >
                  {teams.map((t, idx) => (
                    <option key={t.id} value={idx}>
                      {t.color.emoji} {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              {teams.map((t, idx) => (
                <button
                  key={t.id}
                  onClick={() => setTeamTopIdx(idx)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    teamTopIdx === idx
                      ? 'ring-2 ring-emerald-500 shadow-xs'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: t.color.hex,
                    color: t.color.name.includes('Branco') ? '#0f172a' : '#ffffff',
                  }}
                >
                  <span>{t.color.emoji}</span>
                  <span className="hidden sm:inline">{t.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Society Pitch Canvas Container: Vertical pitch orientation with horizontal division */}
      <div className="max-w-2xl mx-auto w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-emerald-950 bg-emerald-900 text-white select-none">
        {/* Synthetic Turf Grass Pattern */}
        <div className="relative w-full aspect-[3/4] sm:aspect-[4/5] min-h-[580px] sm:min-h-[660px] bg-gradient-to-b from-emerald-800 to-emerald-900 pitch-stripes flex flex-col justify-between p-4 sm:p-6 overflow-hidden">
          
          {/* Pitch Markings (SVG/CSS overlay - Horizontal Division) */}
          <div className="absolute inset-4 sm:inset-6 border-2 border-white/50 rounded-sm pointer-events-none">
            {/* Horizontal Center Line (Divisão Horizontal) */}
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-white/50 -translate-y-1/2" />
            
            {/* Center Circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-32 sm:h-32 rounded-full border-2 border-white/50 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-white/70" />
            </div>

            {/* TOP GOAL & PENALTY BOX (Time de Cima) */}
            <div className="absolute -top-3 left-[32%] right-[32%] h-3 border-2 border-white/70 bg-white/15 rounded-t-sm" />
            <div className="absolute top-0 left-[22%] right-[22%] h-20 sm:h-28 border-b-2 border-x-2 border-white/50 rounded-b-xl">
              {/* Penalty spot */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/70" />
            </div>
            {/* Small goal box */}
            <div className="absolute top-0 left-[34%] right-[34%] h-9 sm:h-12 border-b-2 border-x-2 border-white/40" />

            {/* BOTTOM GOAL & PENALTY BOX (Time de Baixo) */}
            <div className="absolute -bottom-3 left-[32%] right-[32%] h-3 border-2 border-white/70 bg-white/15 rounded-b-sm" />
            <div className="absolute bottom-0 left-[22%] right-[22%] h-20 sm:h-28 border-t-2 border-x-2 border-white/50 rounded-t-xl">
              {/* Penalty spot */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/70" />
            </div>
            {/* Small goal box */}
            <div className="absolute bottom-0 left-[34%] right-[34%] h-9 sm:h-12 border-t-2 border-x-2 border-white/40" />

            {/* Corner Arcs */}
            <div className="absolute top-0 left-0 w-4 h-4 border-r-2 border-b-2 border-white/50 rounded-br-full" />
            <div className="absolute top-0 right-0 w-4 h-4 border-l-2 border-b-2 border-white/50 rounded-bl-full" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-r-2 border-t-2 border-white/50 rounded-tr-full" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-l-2 border-t-2 border-white/50 rounded-tl-full" />
          </div>

          {/* Player Formations Rendering */}
          {viewMode === 'clash' && teams.length >= 2 ? (
            <div className="relative z-10 w-full h-full grid grid-rows-2 gap-2">
              {/* TOP HALF: Time de Cima */}
              <div className="relative w-full h-full flex flex-col justify-between">
                {/* Team Top Badge Pill */}
                <div className="absolute top-1 left-1 z-20 px-2.5 py-1 rounded-xl bg-black/55 backdrop-blur-md text-xs font-bold border border-white/20 flex items-center gap-1.5 shadow-sm">
                  <span>{teamTop.color.emoji}</span>
                  <span>{teamTop.name} (Cima)</span>
                  <span className="text-amber-300">({teamTop.averageRating}⭐)</span>
                </div>
                {renderHorizontalHalf(teamTop, 'top')}
              </div>

              {/* BOTTOM HALF: Time de Baixo */}
              <div className="relative w-full h-full flex flex-col justify-between">
                {/* Team Bottom Badge Pill */}
                <div className="absolute bottom-1 right-1 z-20 px-2.5 py-1 rounded-xl bg-black/55 backdrop-blur-md text-xs font-bold border border-white/20 flex items-center gap-1.5 shadow-sm">
                  <span className="text-amber-300">({teamBottom.averageRating}⭐)</span>
                  <span>{teamBottom.name} (Baixo)</span>
                  <span>{teamBottom.color.emoji}</span>
                </div>
                {renderHorizontalHalf(teamBottom, 'bottom')}
              </div>
            </div>
          ) : (
            /* Single Team Tactical View: Distributed from defense to attack across full vertical pitch */
            <div className="relative z-10 w-full h-full flex flex-col justify-between">
              <div className="absolute top-1 left-1 z-20 px-3 py-1.5 rounded-xl bg-black/55 backdrop-blur-md text-sm font-bold border border-white/20 flex items-center gap-2 shadow-sm">
                <span className="text-lg">{teamTop.color.emoji}</span>
                <span>{teamTop.name}</span>
                <span className="text-amber-300 font-extrabold">({teamTop.averageRating}⭐)</span>
                <span className="text-xs font-normal opacity-80">· {teamTop.players.length} atletas</span>
              </div>
              {renderFullVerticalPitchTeam(teamTop)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper to render half-pitch formation with horizontal division (top or bottom)
function renderHorizontalHalf(team: DrawnTeam, position: 'top' | 'bottom') {
  const goalies = team.players.filter((p) => p.position === 'GK');
  const fieldSquad = team.players.filter((p) => p.position !== 'GK');

  // If no designated goalie, pick the first player
  const effectiveGoalie = goalies.length > 0 ? goalies[0] : fieldSquad[0];
  const outfield = team.players.filter((p) => p.id !== effectiveGoalie?.id);

  // Divide outfield players into 2 horizontal rows: backline (closer to goal) and frontline (closer to center line)
  const mid = Math.ceil(outfield.length / 2);
  const backLine = outfield.slice(0, mid);
  const frontLine = outfield.slice(mid);

  if (position === 'top') {
    // TOP HALF:
    // Row 1: Goalkeeper at the top in front of goal
    // Row 2: Backline defenders
    // Row 3: Frontline attackers near midline
    return (
      <div className="w-full h-full flex flex-col justify-around py-3 px-3 sm:px-6">
        {/* Goalkeeper Row */}
        <div className="flex justify-center items-center w-full pt-1">
          {effectiveGoalie && renderPlayerToken(effectiveGoalie, team, true)}
        </div>

        {/* Backline Row */}
        {backLine.length > 0 && (
          <div className="flex justify-around items-center w-full px-2">
            {backLine.map((player) => renderPlayerToken(player, team, false))}
          </div>
        )}

        {/* Frontline Row (near center line) */}
        {frontLine.length > 0 && (
          <div className="flex justify-around items-center w-full px-2">
            {frontLine.map((player) => renderPlayerToken(player, team, false))}
          </div>
        )}
      </div>
    );
  } else {
    // BOTTOM HALF:
    // Row 1: Frontline attackers near midline
    // Row 2: Backline defenders
    // Row 3: Goalkeeper at the bottom in front of goal
    return (
      <div className="w-full h-full flex flex-col justify-around py-3 px-3 sm:px-6">
        {/* Frontline Row (near center line) */}
        {frontLine.length > 0 && (
          <div className="flex justify-around items-center w-full px-2">
            {frontLine.map((player) => renderPlayerToken(player, team, false))}
          </div>
        )}

        {/* Backline Row */}
        {backLine.length > 0 && (
          <div className="flex justify-around items-center w-full px-2">
            {backLine.map((player) => renderPlayerToken(player, team, false))}
          </div>
        )}

        {/* Goalkeeper Row */}
        <div className="flex justify-center items-center w-full pb-1">
          {effectiveGoalie && renderPlayerToken(effectiveGoalie, team, true)}
        </div>
      </div>
    );
  }
}

// Helper to render full vertical pitch team
function renderFullVerticalPitchTeam(team: DrawnTeam) {
  const goalies = team.players.filter((p) => p.position === 'GK');
  const fieldSquad = team.players.filter((p) => p.position !== 'GK');

  const goalie = goalies[0] || fieldSquad[0];
  const outfield = team.players.filter((p) => p.id !== goalie?.id);

  // Split outfield into 3 vertical tiers: defense, midfield, attack
  const chunkSize = Math.ceil(outfield.length / 3) || 1;
  const defs = outfield.slice(0, chunkSize);
  const mids = outfield.slice(chunkSize, chunkSize * 2);
  const atts = outfield.slice(chunkSize * 2);

  return (
    <div className="w-full h-full flex flex-col justify-around py-6 px-4 sm:px-8">
      {/* Attackers at opponent side */}
      {atts.length > 0 && (
        <div className="flex justify-around items-center w-full pt-4">
          {atts.map((p) => renderPlayerToken(p, team, false))}
        </div>
      )}

      {/* Midfielders */}
      {mids.length > 0 && (
        <div className="flex justify-around items-center w-full">
          {mids.map((p) => renderPlayerToken(p, team, false))}
        </div>
      )}

      {/* Defenders */}
      {defs.length > 0 && (
        <div className="flex justify-around items-center w-full">
          {defs.map((p) => renderPlayerToken(p, team, false))}
        </div>
      )}

      {/* Goalkeeper at bottom goal */}
      <div className="flex justify-center items-center w-full pb-2">
        {goalie && renderPlayerToken(goalie, team, true)}
      </div>
    </div>
  );
}

function renderPlayerToken(
  player: { name: string; position: string; rating: number },
  team: DrawnTeam,
  isGoalie: boolean
) {
  const roleLabel = isGoalie ? 'Goleiro' : 'Jogador';

  return (
    <div
      key={player.name}
      className="flex flex-col items-center group cursor-pointer transition-transform hover:scale-110 select-none"
      title={`${player.name} (${roleLabel}) - ${player.rating}⭐`}
    >
      <div
        className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-extrabold text-xs sm:text-sm shadow-md border-2 transition-transform ${
          isGoalie
            ? 'bg-amber-500 border-amber-300 text-slate-950 ring-2 ring-amber-400/40'
            : 'border-white text-white'
        }`}
        style={!isGoalie ? { backgroundColor: team.color.hex } : undefined}
      >
        {isGoalie ? '🧤' : '⚽'}
      </div>
      <div className="mt-1 px-1.5 py-0.5 rounded-md bg-black/65 backdrop-blur-xs text-[10px] sm:text-xs font-bold text-white text-center whitespace-nowrap max-w-[76px] sm:max-w-[96px] truncate shadow-xs">
        {player.name.split(' ')[0]}
      </div>
      <div className="text-[9px] text-amber-300 font-bold flex items-center justify-center gap-0.5">
        ★{player.rating.toFixed(1)}
      </div>
    </div>
  );
}
