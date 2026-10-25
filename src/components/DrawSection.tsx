import React, { useState } from 'react';
import {
  Users,
  Shuffle,
  Plus,
  Trash2,
  Shield,
  Star,
  CheckCircle2,
  Sparkles,
  ClipboardPaste,
  ArrowRight,
} from 'lucide-react';
import { DraftPlayer, DrawSettings, Player, Position, POSITIONS } from '../types';

interface DrawSectionProps {
  draftPlayers: DraftPlayer[];
  setDraftPlayers: React.Dispatch<React.SetStateAction<DraftPlayer[]>>;
  settings: DrawSettings;
  setSettings: React.Dispatch<React.SetStateAction<DrawSettings>>;
  savedPlayers: Player[];
  onDraw: () => void;
  onOpenWhatsAppModal: () => void;
  onGoToPlayers?: () => void;
}

export const DrawSection: React.FC<DrawSectionProps> = ({
  draftPlayers,
  setDraftPlayers,
  settings,
  setSettings,
  savedPlayers,
  onDraw,
  onOpenWhatsAppModal,
  onGoToPlayers,
}) => {
  // Single player input state
  const [newName, setNewName] = useState('');
  const [newPosition, setNewPosition] = useState<Position>('MID');
  const [newRating, setNewRating] = useState<number>(3.5);

  // Quick picker drawer toggle
  const [showFrequentPicker, setShowFrequentPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerPosFilter, setPickerPosFilter] = useState<'ALL' | Position>('ALL');

  const handleAddSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const matchedSaved = savedPlayers.find(
      (p) => p.name.toLowerCase() === newName.trim().toLowerCase()
    );

    const newP: DraftPlayer = {
      id: `draft_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: newName.trim(),
      position: matchedSaved ? matchedSaved.position : newPosition,
      rating: matchedSaved ? matchedSaved.rating : newRating,
      isRegistered: !!matchedSaved,
      registeredPlayerId: matchedSaved?.id,
    };

    setDraftPlayers((prev) => [...prev, newP]);
    setNewName('');
  };

  const handleRemoveDraftPlayer = (id: string) => {
    setDraftPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  const handleClearAll = () => {
    setDraftPlayers([]);
  };

  const handleQuickDraftRatingChange = (id: string, delta: number) => {
    setDraftPlayers((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newR = Math.max(1, Math.min(5, Math.round((p.rating + delta) * 10) / 10));
          return { ...p, rating: newR };
        }
        return p;
      })
    );
  };

  const handleQuickDraftPositionChange = (id: string, pos: Position) => {
    setDraftPlayers((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return { ...p, position: pos };
        }
        return p;
      })
    );
  };

  const handleToggleFrequentPlayer = (player: Player) => {
    const isAlreadyIn = draftPlayers.some(
      (dp) => dp.registeredPlayerId === player.id || dp.name.toLowerCase() === player.name.toLowerCase()
    );

    if (isAlreadyIn) {
      setDraftPlayers((prev) =>
        prev.filter(
          (dp) => dp.registeredPlayerId !== player.id && dp.name.toLowerCase() !== player.name.toLowerCase()
        )
      );
    } else {
      setDraftPlayers((prev) => [
        ...prev,
        {
          id: `draft_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: player.name,
          position: player.position,
          rating: player.rating,
          isRegistered: true,
          registeredPlayerId: player.id,
        },
      ]);
    }
  };

  const handleAddAllFrequent = () => {
    const newItems: DraftPlayer[] = [];
    savedPlayers.forEach((p) => {
      const exists = draftPlayers.some(
        (dp) => dp.registeredPlayerId === p.id || dp.name.toLowerCase() === p.name.toLowerCase()
      );
      if (!exists) {
        newItems.push({
          id: `draft_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: p.name,
          position: p.position,
          rating: p.rating,
          isRegistered: true,
          registeredPlayerId: p.id,
        });
      }
    });
    setDraftPlayers((prev) => [...prev, ...newItems]);
  };

  // Positional breakdowns
  const goalies = draftPlayers.filter((p) => p.position === 'GK');
  const defenders = draftPlayers.filter((p) => p.position === 'DEF');
  const midfielders = draftPlayers.filter((p) => p.position === 'MID');
  const attackers = draftPlayers.filter((p) => p.position === 'ATT');

  // Math for teams
  const estimatedTeams = Math.max(2, Math.floor(draftPlayers.length / settings.playersPerTeam));
  const estimatedPlayersPerTeam = settings.playersPerTeam;
  const estimatedSubstitutes = draftPlayers.length % settings.playersPerTeam;

  // Filtered frequent list for picker
  const filteredFrequent = savedPlayers.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(pickerSearch.toLowerCase());
    const matchesPos = pickerPosFilter === 'ALL' || p.position === pickerPosFilter;
    return matchesSearch && matchesPos;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 text-white shadow-lg">
        <div className="absolute inset-0 z-0 opacity-25">
          <img
            src="/src/assets/images/society_pitch_arena_1792931155801.jpg"
            alt="Gramado Society"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10 px-6 py-8 sm:px-10 sm:py-10 max-w-3xl">
          <span className="text-xs font-bold tracking-wider text-emerald-400 uppercase">
            Futebol Society · Sorteio Inteligente
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mt-1 text-white">
            Monte times equilibrados em segundos.
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-xl">
            Cole a lista do grupo do WhatsApp para puxar todos os nomes. Depois, você pode editar os níveis de cada atleta na aba de Atletas para garantir o equilíbrio perfeito.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              type="button"
              onClick={onOpenWhatsAppModal}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
            >
              <ClipboardPaste className="w-4 h-4" />
              Colar Lista do WhatsApp
            </button>

            {savedPlayers.length > 0 && (
              <button
                type="button"
                onClick={() => setShowFrequentPicker(!showFrequentPicker)}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <Users className="w-4 h-4" />
                {showFrequentPicker ? 'Ocultar Atletas Cadastrados' : `Atletas Cadastrados (${savedPlayers.length})`}
              </button>
            )}

            {onGoToPlayers && (
              <button
                type="button"
                onClick={onGoToPlayers}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Aba de Atletas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Frequent Players Quick Checklist Drawer (if opened) */}
      {showFrequentPicker && savedPlayers.length > 0 && (
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-500" />
                Marcar Presença dos Atletas Cadastrados
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Selecione os jogadores presentes para o sorteio de hoje.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddAllFrequent}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Selecionar Todos ({savedPlayers.length})
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              placeholder="Buscar atleta..."
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
            />
            <div className="flex items-center gap-1 overflow-x-auto text-xs">
              {(['ALL', 'GK', 'DEF', 'MID', 'ATT'] as const).map((pos) => (
                <button
                  key={pos}
                  onClick={() => setPickerPosFilter(pos)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                    pickerPosFilter === pos
                      ? 'bg-slate-900 text-white dark:bg-emerald-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {pos === 'ALL' ? 'Todos' : POSITIONS[pos].shortLabel}
                </button>
              ))}
            </div>
          </div>

          {/* Grid of players */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto pt-1">
            {filteredFrequent.map((player) => {
              const isSelected = draftPlayers.some(
                (dp) => dp.registeredPlayerId === player.id || dp.name.toLowerCase() === player.name.toLowerCase()
              );
              return (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => handleToggleFrequentPlayer(player)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="truncate">
                    <p className="text-xs font-bold truncate">{player.name}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                      <span>{POSITIONS[player.position].shortLabel}</span>
                      <span>·</span>
                      <span className="text-amber-500">⭐{player.rating}</span>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                      isSelected
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 dark:border-slate-700 text-transparent'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Grid: Controls + Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols): Settings & Single Input */}
        <div className="lg:col-span-5 space-y-5">
          {/* Sorteio Settings Card */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              Configurações do Sorteio Society
            </h2>

            {/* Players per Team Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Número de Jogadores por Time:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 6, 7, 8].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setSettings((prev) => ({ ...prev, playersPerTeam: num }))}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      settings.playersPerTeam === num
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {num} x {num}
                    <span className="block text-[10px] font-normal opacity-80">
                      {num === 5 ? 'Futsal' : num === 6 ? 'Society' : num === 7 ? 'Oficial' : 'Society +'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Balancing Mode */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Modo de Sorteio:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSettings((prev) => ({ ...prev, mode: 'balanced' }))}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    settings.mode === 'balanced'
                      ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold flex items-center justify-between">
                    <span>Equilibrado</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                      Top
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Equilibra média de estrelas e posições.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSettings((prev) => ({ ...prev, mode: 'random' }))}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    settings.mode === 'random'
                      ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold">100% Randômico</div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Sorteio no chapéu sem levar em conta nível.
                  </p>
                </button>
              </div>
            </div>

            {/* Checkbox toggles */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={settings.guaranteeGoalies}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, guaranteeGoalies: e.target.checked }))
                  }
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Distribuir 1 goleiro por time primeiro</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={settings.allowSubstitutes}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, allowSubstitutes: e.target.checked }))
                  }
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Alocar jogadores excedentes como reservas / suplentes</span>
              </label>
            </div>
          </div>

          {/* Quick Single Add Card */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Adicionar Jogador Individualmente
            </h3>

            <form onSubmit={handleAddSingle} className="space-y-3">
              <div>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nome do atleta (ex: João Silva)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                    Posição
                  </label>
                  <select
                    value={newPosition}
                    onChange={(e) => setNewPosition(e.target.value as Position)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs"
                  >
                    <option value="GK">🧤 Goleiro</option>
                    <option value="DEF">🛡️ Zagueiro</option>
                    <option value="MID">🎯 Meio-Campo</option>
                    <option value="ATT">⚡ Atacante</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                    Nível / Estrelas
                  </label>
                  <select
                    value={newRating}
                    onChange={(e) => setNewRating(parseFloat(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs"
                  >
                    <option value={5.0}>⭐⭐⭐⭐⭐ (5.0 - Craque)</option>
                    <option value={4.5}>⭐⭐⭐⭐½ (4.5 - Muito Bom)</option>
                    <option value={4.0}>⭐⭐⭐⭐ (4.0 - Bom)</option>
                    <option value={3.5}>⭐⭐⭐½ (3.5 - Regular +)</option>
                    <option value={3.0}>⭐⭐⭐ (3.0 - Regular)</option>
                    <option value={2.5}>⭐⭐½ (2.5 - Peladeiro)</option>
                    <option value={1.5}>⭐½ (1.5 - Inexperiente)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={!newName.trim()}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  newName.trim()
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-slate-400 dark:bg-slate-800 opacity-60 cursor-not-allowed'
                }`}
              >
                <Plus className="w-4 h-4" />
                Adicionar à Lista
              </button>
            </form>
          </div>
        </div>

        {/* Right Column (7 cols): Draft Roster & Draw Execution */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            {/* Header of Roster */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Lista de Atletas do Sorteio
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {draftPlayers.length} atletas
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {draftPlayers.length >= 2
                    ? `Formará ${estimatedTeams} times de ${estimatedPlayersPerTeam} jogadores ${
                        estimatedSubstitutes > 0 ? `(+ ${estimatedSubstitutes} reservas)` : ''
                      }`
                    : 'Adicione atletas pela lista do WhatsApp ou individualmente'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenWhatsAppModal}
                  className="px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ClipboardPaste className="w-3.5 h-3.5" />
                  Colar Lista
                </button>

                {draftPlayers.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="px-2.5 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Limpar
                  </button>
                )}
              </div>
            </div>

            {/* Position Summary Bar */}
            {draftPlayers.length > 0 && (
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/50">
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-semibold">
                    Goleiros
                  </span>
                  <span className="text-sm font-bold text-amber-700 dark:text-amber-300">
                    🧤 {goalies.length}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-900/50">
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 block font-semibold">
                    Defensores
                  </span>
                  <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                    🛡️ {defenders.length}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-900/50">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-semibold">
                    Meio-Campo
                  </span>
                  <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                    🎯 {midfielders.length}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/50 dark:border-rose-900/50">
                  <span className="text-[10px] text-rose-600 dark:text-rose-400 block font-semibold">
                    Atacantes
                  </span>
                  <span className="text-sm font-bold text-rose-700 dark:text-rose-300">
                    ⚡ {attackers.length}
                  </span>
                </div>
              </div>
            )}

            {/* Empty state */}
            {draftPlayers.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Nenhum jogador na lista ainda
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                  Cole a lista do WhatsApp do seu grupo para carregar todos os jogadores e formar os times.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                  <button
                    type="button"
                    onClick={onOpenWhatsAppModal}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-2"
                  >
                    <ClipboardPaste className="w-4 h-4" />
                    Colar Lista do WhatsApp
                  </button>
                  {onGoToPlayers && (
                    <button
                      type="button"
                      onClick={onGoToPlayers}
                      className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                    >
                      Aba de Atletas
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Players Table / List */
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-96 overflow-y-auto pr-1">
                {draftPlayers.map((player, index) => {
                  const posCfg = POSITIONS[player.position];
                  return (
                    <div
                      key={player.id}
                      className="py-2.5 px-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-mono text-slate-400 w-5 text-right shrink-0">
                          {index + 1}.
                        </span>
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {player.name}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {posCfg.label}
                            </span>
                            <span>·</span>
                            <span className="text-amber-500 flex items-center gap-0.5 font-bold">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {player.rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Quick level increment buttons */}
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => handleQuickDraftRatingChange(player.id, -0.5)}
                            className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center hover:bg-slate-200"
                            title="Diminuir nível"
                          >
                            -
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickDraftRatingChange(player.id, 0.5)}
                            className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center hover:bg-slate-200"
                            title="Aumentar nível"
                          >
                            +
                          </button>
                        </div>

                        {/* Position select */}
                        <select
                          value={player.position}
                          onChange={(e) =>
                            handleQuickDraftPositionChange(player.id, e.target.value as Position)
                          }
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${posCfg.badgeBg} cursor-pointer`}
                        >
                          <option value="GK">GOL</option>
                          <option value="DEF">ZAG</option>
                          <option value="MID">MEI</option>
                          <option value="ATT">ATA</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleRemoveDraftPlayer(player.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer opacity-70 group-hover:opacity-100"
                          title="Remover"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Draw CTA Button */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                disabled={draftPlayers.length < 2}
                onClick={onDraw}
                className={`w-full py-3.5 px-4 rounded-xl text-sm font-extrabold text-white flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                  draftPlayers.length >= 2
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 shadow-emerald-600/20'
                    : 'bg-slate-400 dark:bg-slate-800 opacity-60 cursor-not-allowed shadow-none'
                }`}
              >
                <Shuffle className="w-5 h-5 animate-pulse" />
                SORTEAR TIMES AGORA ({draftPlayers.length} ATLETAS)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
