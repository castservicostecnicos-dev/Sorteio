import React, { useState, useMemo } from 'react';
import { X, Check, ClipboardPaste } from 'lucide-react';
import { DraftPlayer, Player, POSITIONS } from '../types';
import { parseWhatsAppList } from '../utils/whatsappParser';

interface WhatsAppImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (players: DraftPlayer[], saveToFrequent: boolean) => void;
  savedPlayers: Player[];
}

export const WhatsAppImportModal: React.FC<WhatsAppImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  savedPlayers,
}) => {
  const [text, setText] = useState('');
  const [saveToFrequent, setSaveToFrequent] = useState(true);

  const { players } = useMemo(() => {
    return parseWhatsAppList(text, savedPlayers);
  }, [text, savedPlayers]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (players.length === 0) return;
    onImport(players, saveToFrequent);
    setText('');
    onClose();
  };

  const goalieCount = players.filter((p) => p.position === 'GK').length;
  const fieldCount = players.filter((p) => p.position === 'FIELD').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-lg">
              📋
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Importar Lista do WhatsApp
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cole a mensagem com a lista de nomes do grupo da pelada.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Cole a lista de participantes:
            </label>

            <textarea
              rows={8}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Exemplo de lista copiada do WhatsApp:&#10;1. Carlos (Goleiro)&#10;2. Marcelo&#10;3. Bruno&#10;4. Lucas&#10;5. Diego&#10;6. André&#10;7. Rafael&#10;8. Rodrigo"
              className="w-full px-3.5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono transition-all"
            />
          </div>

          {/* Live Preview Stats */}
          {players.length > 0 && (
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white">
                <span>{players.length} atleta{players.length !== 1 ? 's' : ''} identificado{players.length !== 1 ? 's' : ''}</span>
                <span className="text-slate-500 font-normal">
                  Serão cadastrados para edição de nível
                </span>
              </div>

              {/* Positional count row: Goleiros and Jogadores */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {goalieCount > 0 && (
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold flex items-center gap-1">
                    🧤 {goalieCount} Goleiro{goalieCount !== 1 ? 's' : ''}
                  </span>
                )}
                {fieldCount > 0 && (
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1">
                    ⚽ {fieldCount} Jogador{fieldCount !== 1 ? 'es' : ''}
                  </span>
                )}
              </div>

              {/* Sample parsed chips */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {players.map((p, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    <span className="font-semibold">{p.name}</span>
                    <span className="text-[10px] text-slate-500">
                      {p.position === 'GK' ? '🧤 Goleiro' : '⚽ Jogador'}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Option: Save new players to frequent directory */}
          <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300 select-none">
            <input
              type="checkbox"
              checked={saveToFrequent}
              onChange={(e) => setSaveToFrequent(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>Cadastrar na aba de Atletas para editar os níveis e notas</span>
          </label>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={players.length === 0}
            onClick={handleConfirm}
            className={`px-5 py-2 text-xs font-bold text-white rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
              players.length > 0
                ? 'bg-emerald-600 hover:bg-emerald-500 active:scale-95'
                : 'bg-slate-400 dark:bg-slate-700 opacity-60 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4" />
            Importar {players.length} Atleta{players.length !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
};
