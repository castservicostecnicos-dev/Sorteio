import React from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';
import { useAppUpdate } from '../hooks/useAppUpdate';

export const UpdateNotification: React.FC = () => {
  const { needRefresh, isUpdating, triggerUpdate } = useAppUpdate();

  if (!needRefresh) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full animate-bounce-short">
      <div className="bg-emerald-600 text-white rounded-xl shadow-xl p-4 flex items-center justify-between gap-3 border border-emerald-500/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-emerald-100" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">Nova versão disponível!</p>
            <p className="text-xs text-emerald-100 mt-0.5">
              {isUpdating ? 'Aplicando mudanças...' : 'Atualização pronta para carregar'}
            </p>
          </div>
        </div>
        <button
          onClick={triggerUpdate}
          disabled={isUpdating}
          className="px-3 py-1.5 bg-white text-emerald-800 text-xs font-bold rounded-lg shadow-sm hover:bg-emerald-50 active:scale-95 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-75"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
          {isUpdating ? 'Atualizando...' : 'Atualizar'}
        </button>
      </div>
    </div>
  );
};
