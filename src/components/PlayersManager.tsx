import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Star,
  Edit2,
  Trash2,
  Download,
  Upload,
  Check,
  X,
  ClipboardPaste,
  Table,
  LayoutGrid,
  AlertTriangle,
} from 'lucide-react';
import { Player, Position, POSITIONS } from '../types';
import { exportBackupData, importBackupData } from '../utils/storage';

interface PlayersManagerProps {
  players: Player[];
  onUpdatePlayers: (players: Player[]) => void;
  onSelectForDraw: (player: Player) => void;
  onOpenWhatsAppModal: () => void;
  onGoToDraw?: () => void;
}

export const PlayersManager: React.FC<PlayersManagerProps> = ({
  players,
  onUpdatePlayers,
  onSelectForDraw,
  onOpenWhatsAppModal,
  onGoToDraw,
}) => {
  const [search, setSearch] = useState('');
  const [posFilter, setPosFilter] = useState<'ALL' | Position>('ALL');
  const [tagFilter, setTagFilter] = useState<'ALL' | 'mensalista' | 'diarista' | 'convidado'>('ALL');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modal / Form state for Add or Edit
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditId, setCurrentEditId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formNickname, setFormNickname] = useState('');
  const [formPosition, setFormPosition] = useState<Position>('FIELD');
  const [formRating, setFormRating] = useState<number>(3.5);
  const [formTag, setFormTag] = useState<'mensalista' | 'diarista' | 'convidado'>('mensalista');

  // IN-APP CONFIRMATION MODALS (Replaces window.confirm which fails inside iframes!)
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const openAddModal = () => {
    setCurrentEditId(null);
    setFormName('');
    setFormNickname('');
    setFormPosition('FIELD');
    setFormRating(3.5);
    setFormTag('mensalista');
    setIsEditing(true);
  };

  const openEditModal = (player: Player) => {
    setCurrentEditId(player.id);
    setFormName(player.name);
    setFormNickname(player.nickname || '');
    setFormPosition(player.position === 'GK' ? 'GK' : 'FIELD');
    setFormRating(player.rating);
    setFormTag(player.tag || 'mensalista');
    setIsEditing(true);
  };

  // Instant level/rating updater without opening modal
  const handleQuickRatingChange = (playerId: string, newRating: number) => {
    const clamped = Math.max(1, Math.min(5, Math.round(newRating * 10) / 10));
    const updated = players.map((p) => {
      if (p.id === playerId) {
        return { ...p, rating: clamped };
      }
      return p;
    });
    onUpdatePlayers(updated);
  };

  // Instant goalie toggle updater
  const handleToggleGoalie = (playerId: string) => {
    const updated = players.map((p) => {
      if (p.id === playerId) {
        const nextPos: Position = p.position === 'GK' ? 'FIELD' : 'GK';
        return { ...p, position: nextPos };
      }
      return p;
    });
    onUpdatePlayers(updated);
  };

  const handleSavePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (currentEditId) {
      // Update
      const updated = players.map((p) => {
        if (p.id === currentEditId) {
          return {
            ...p,
            name: formName.trim(),
            nickname: formNickname.trim() || undefined,
            position: formPosition,
            rating: formRating,
            tag: formTag,
          };
        }
        return p;
      });
      onUpdatePlayers(updated);
      showToast('Perfil do atleta atualizado com sucesso!');
    } else {
      // Create new
      const colors = [
        'bg-blue-600',
        'bg-emerald-600',
        'bg-rose-600',
        'bg-purple-600',
        'bg-amber-600',
        'bg-teal-600',
      ];
      const newPlayer: Player = {
        id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: formName.trim(),
        nickname: formNickname.trim() || undefined,
        position: formPosition,
        rating: formRating,
        tag: formTag,
        matchesPlayed: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goals: 0,
        assists: 0,
        mvpCount: 0,
        createdAt: new Date().toISOString(),
        avatarColor: colors[Math.floor(Math.random() * colors.length)],
      };
      onUpdatePlayers([...players, newPlayer]);
      showToast('Novo atleta cadastrado com sucesso!');
    }

    setIsEditing(false);
  };

  // Confirm delete of single player
  const handleConfirmDelete = () => {
    if (!playerToDelete) return;
    const athleteName = playerToDelete.name;
    const remaining = players.filter((p) => p.id !== playerToDelete.id);
    onUpdatePlayers(remaining);
    setPlayerToDelete(null);
    showToast(`Atleta "${athleteName}" excluído com sucesso!`);
  };

  // Confirm clear all athletes
  const handleConfirmClearAll = () => {
    onUpdatePlayers([]);
    setShowClearAllModal(false);
    showToast('Banco de dados de atletas zerado com sucesso!');
  };

  const handleExportBackup = () => {
    const dataStr = exportBackupData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `futsociety_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Backup exportado!');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importBackupData(content);
        if (success) {
          showToast('Dados restaurados com sucesso!');
          window.location.reload();
        } else {
          showToast('Arquivo de backup inválido.');
        }
      }
    };
    reader.readAsText(file);
  };

  // Filter list
  const filteredPlayers = players.filter((p) => {
    const searchMatch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.nickname && p.nickname.toLowerCase().includes(search.toLowerCase()));
    const posMatch = posFilter === 'ALL' || p.position === posFilter;
    const tagMatch = tagFilter === 'ALL' || p.tag === tagFilter;
    return searchMatch && posMatch && tagMatch;
  });

  const totalGoalies = players.filter((p) => p.position === 'GK').length;
  const totalField = players.filter((p) => p.position !== 'GK').length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-50 bg-slate-900 text-white dark:bg-emerald-600 px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400 dark:text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Management Actions */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" />
              Gestão de Atletas & Níveis
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {players.length} Atleta{players.length !== 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Defina o nível de cada jogador (estrelas) e marque com o tick quem é goleiro.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* WhatsApp Import CTA */}
          <button
            type="button"
            onClick={onOpenWhatsAppModal}
            className="px-4 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
          >
            <ClipboardPaste className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Colar Lista do WhatsApp</span>
          </button>

          {/* Add Athlete CTA */}
          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Atleta</span>
          </button>

          {/* View mode toggle */}
          {players.length > 0 && (
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                title="Modo Cards"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                title="Modo Tabela de Edição Rápida"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                <Table className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Backup buttons */}
          <button
            type="button"
            onClick={handleExportBackup}
            title="Exportar backup completo em JSON"
            className="p-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
          >
            <Download className="w-4 h-4 text-slate-500" />
          </button>

          <label
            title="Restaurar backup JSON"
            className="p-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>

          {/* Clear all athletes button */}
          {players.length > 0 && (
            <button
              type="button"
              onClick={() => setShowClearAllModal(true)}
              title="Excluir todos os atletas do banco"
              className="px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-900/60 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              <span>Limpar Todos</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      {players.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou apelido..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Position filters: ONLY Todos, Goleiros, Jogadores */}
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setPosFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                posFilter === 'ALL'
                  ? 'bg-slate-900 text-white dark:bg-emerald-600'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Todos ({players.length})
            </button>
            <button
              onClick={() => setPosFilter('GK')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1 ${
                posFilter === 'GK'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <span>🧤</span>
              <span>Goleiros ({totalGoalies})</span>
            </button>
            <button
              onClick={() => setPosFilter('FIELD')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1 ${
                posFilter === 'FIELD'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <span>⚽</span>
              <span>Jogadores ({totalField})</span>
            </button>
          </div>

          {/* Tag filters */}
          <div className="flex items-center gap-1 text-xs">
            {(['ALL', 'mensalista', 'diarista', 'convidado'] as const).map((tag) => (
              <button
                key={tag}
                onClick={() => setTagFilter(tag)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors capitalize ${
                  tagFilter === tag
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {tag === 'ALL' ? 'Todos Vínculos' : tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty State when zero players */}
      {players.length === 0 && (
        <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-8 bg-white dark:bg-slate-900 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-2xl mx-auto">
            📋
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Nenhum atleta cadastrado no banco de dados
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            O aplicativo está limpo. Cole a lista de participantes do seu grupo de WhatsApp ou cadastre os atletas manualmente.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onOpenWhatsAppModal}
              className="px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
            >
              <ClipboardPaste className="w-4 h-4" />
              Colar Lista do WhatsApp Agora
            </button>
            <button
              type="button"
              onClick={openAddModal}
              className="px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
            >
              Cadastrar Manualmente
            </button>
          </div>
        </div>
      )}

      {/* QUICK TABLE MODE */}
      {viewMode === 'table' && filteredPlayers.length > 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
          <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Edição Rápida ({filteredPlayers.length} atletas)
            </span>
            <span className="text-slate-400">
              Clique no botão de Goleiro ou nas estrelas para ajustar na hora
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold bg-white dark:bg-slate-900">
                  <th className="py-2.5 px-3 w-8">#</th>
                  <th className="py-2.5 px-3 min-w-[160px]">Nome do Atleta</th>
                  <th className="py-2.5 px-3 min-w-[130px]">Goleiro?</th>
                  <th className="py-2.5 px-3 min-w-[180px]">Nível / Estrelas</th>
                  <th className="py-2.5 px-3 min-w-[100px]">Vínculo</th>
                  <th className="py-2.5 px-3 text-right w-24">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredPlayers.map((player, idx) => {
                  const isGoalie = player.position === 'GK';
                  return (
                    <tr
                      key={player.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-2.5 px-3 font-mono text-slate-400 text-center">
                        {idx + 1}
                      </td>

                      <td className="py-2.5 px-3">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {player.name}
                        </span>
                        {player.nickname && (
                          <span className="text-[10px] text-slate-400">
                            "{player.nickname}"
                          </span>
                        )}
                      </td>

                      {/* Goleiro Tick / Toggle Button */}
                      <td className="py-2.5 px-3">
                        <button
                          type="button"
                          onClick={() => handleToggleGoalie(player.id)}
                          className={`px-3 py-1.5 text-xs rounded-xl font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                            isGoalie
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 ring-1 ring-amber-400/50'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-900'
                          }`}
                          title="Clique para marcar ou desmarcar como Goleiro"
                        >
                          <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] font-bold border ${
                            isGoalie ? 'bg-amber-500 text-slate-950 border-amber-600' : 'border-slate-400'
                          }`}>
                            {isGoalie ? '✓' : ''}
                          </span>
                          <span>{isGoalie ? '🧤 Goleiro' : '⚽ Jogador'}</span>
                        </button>
                      </td>

                      {/* Instant Star Rating Clicker */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((starVal) => {
                              const isFilled = player.rating >= starVal;
                              return (
                                <button
                                  key={starVal}
                                  type="button"
                                  onClick={() => handleQuickRatingChange(player.id, starVal)}
                                  title={`Definir nota ${starVal}.0`}
                                  className="p-0.5 text-slate-300 hover:text-amber-400 cursor-pointer transition-colors"
                                >
                                  <Star
                                    className={`w-4 h-4 ${
                                      isFilled
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-slate-300 dark:text-slate-600'
                                    }`}
                                  />
                                </button>
                              );
                            })}
                          </div>

                          <div className="flex items-center gap-1 ml-1">
                            <button
                              type="button"
                              onClick={() =>
                                handleQuickRatingChange(player.id, player.rating - 0.5)
                              }
                              className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-xs hover:bg-slate-200 cursor-pointer"
                            >
                              -
                            </button>
                            <span className="font-mono font-bold text-amber-500 w-7 text-center">
                              {player.rating.toFixed(1)}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleQuickRatingChange(player.id, player.rating + 0.5)
                              }
                              className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-xs hover:bg-slate-200 cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <span className="capitalize text-slate-500 text-[11px]">
                          {player.tag || 'mensalista'}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(player)}
                            title="Editar completo"
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPlayerToDelete(player)}
                            title="Excluir atleta"
                            className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CARDS MODE */}
      {viewMode === 'cards' && filteredPlayers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlayers.map((player) => {
            const isGoalie = player.position === 'GK';

            return (
              <div
                key={player.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-white text-base shadow-xs shrink-0 ${
                          player.avatarColor || 'bg-slate-700'
                        }`}
                      >
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {player.name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className={`font-semibold ${isGoalie ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {isGoalie ? '🧤 Goleiro' : '⚽ Jogador'}
                          </span>
                          {player.tag && (
                            <>
                              <span>·</span>
                              <span className="capitalize">{player.tag}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(player)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        title="Editar Atleta"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPlayerToDelete(player)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                        title="Excluir Atleta"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Level Slider / Clicker right on the card */}
                  <div className="mt-3.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        Nível Técnico:
                      </span>
                      <span className="text-amber-500 font-extrabold flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {player.rating.toFixed(1)} Estrelas
                      </span>
                    </div>

                    {/* Direct clickable star bar */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((starVal) => {
                          const isFilled = player.rating >= starVal;
                          return (
                            <button
                              key={starVal}
                              type="button"
                              onClick={() => handleQuickRatingChange(player.id, starVal)}
                              className="p-0.5 text-slate-300 hover:scale-125 transition-transform cursor-pointer"
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  isFilled
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-300 dark:text-slate-700'
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            handleQuickRatingChange(player.id, player.rating - 0.5)
                          }
                          className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 cursor-pointer"
                        >
                          -0.5
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleQuickRatingChange(player.id, player.rating + 0.5)
                          }
                          className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 cursor-pointer"
                        >
                          +0.5
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Tick / Toggle Goleiro on card */}
                  <button
                    type="button"
                    onClick={() => handleToggleGoalie(player.id)}
                    className={`w-full py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center justify-between mt-2.5 ${
                      isGoalie
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400 ring-1 ring-amber-400/50 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className={`w-4 h-4 rounded flex items-center justify-center text-xs font-bold border ${
                        isGoalie ? 'bg-amber-500 text-slate-950 border-amber-600' : 'border-slate-400'
                      }`}>
                        {isGoalie ? '✓' : ''}
                      </span>
                      <span>🧤 É Goleiro?</span>
                    </span>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider">
                      {isGoalie ? 'Sim (Goleiro)' : 'Não (Jogador)'}
                    </span>
                  </button>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => onSelectForDraw(player)}
                    className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    + Incluir no Sorteio
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(player)}
                      className="px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlayerToDelete(player)}
                      className="px-2.5 py-1 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* IN-APP CONFIRMATION MODAL FOR SINGLE PLAYER DELETION */}
      {playerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Excluir Atleta
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Deseja remover <strong>{playerToDelete.name}</strong> do cadastro?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setPlayerToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg cursor-pointer shadow-xs active:scale-95"
              >
                Sim, Excluir Atleta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IN-APP CONFIRMATION MODAL FOR CLEARING ALL ATHLETES */}
      {showClearAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Zerar Banco de Atletas
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Tem certeza de que deseja apagar <strong>todos os {players.length} atletas</strong> cadastrados? Esta ação deixará o app sem atletas.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowClearAllModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmClearAll}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg cursor-pointer shadow-xs active:scale-95"
              >
                Sim, Apagar Todos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Athlete Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {currentEditId ? 'Editar Perfil e Nível do Atleta' : 'Novo Atleta'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlayer} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Carlos Eduardo"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Apelido de Pelada (Opcional)
                </label>
                <input
                  type="text"
                  value={formNickname}
                  onChange={(e) => setFormNickname(e.target.value)}
                  placeholder="Ex: Muralha, Camisa 10, Flecha"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              {/* Tick Goleiro Checkbox */}
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 cursor-pointer transition-colors hover:bg-slate-100 dark:hover:bg-slate-900">
                <input
                  type="checkbox"
                  checked={formPosition === 'GK'}
                  onChange={(e) => setFormPosition(e.target.checked ? 'GK' : 'FIELD')}
                  className="w-5 h-5 rounded text-amber-500 focus:ring-amber-400 accent-amber-500 cursor-pointer shrink-0"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    🧤 É Goleiro?
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    {formPosition === 'GK'
                      ? 'Marcado como Goleiro (sorteado 1 por time)'
                      : 'Jogador de linha normal'}
                  </span>
                </div>
              </label>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Tipo de Vínculo
                </label>
                <select
                  value={formTag}
                  onChange={(e) => setFormTag(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white capitalize"
                >
                  <option value="mensalista">Mensalista</option>
                  <option value="diarista">Diarista</option>
                  <option value="convidado">Convidado</option>
                </select>
              </div>

              {/* Rating Editor */}
              <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-700 dark:text-amber-300">
                    Nível / Estrelas: {formRating.toFixed(1)} ⭐
                  </label>
                  <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                    {formRating >= 4.5
                      ? 'Craque Nato'
                      : formRating >= 3.5
                      ? 'Muito Bom / Bom'
                      : formRating >= 2.5
                      ? 'Regular'
                      : 'Inexperiente'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1.0"
                    max="5.0"
                    step="0.5"
                    value={formRating}
                    onChange={(e) => setFormRating(parseFloat(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div className="flex items-center justify-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setFormRating(val)}
                      className={`px-2 py-1 rounded text-xs font-bold border transition-colors cursor-pointer ${
                        Math.round(formRating) === val
                          ? 'bg-amber-500 border-amber-600 text-slate-950 shadow-xs'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {val} ⭐
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg cursor-pointer shadow-xs"
                >
                  Salvar Perfil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
