import React, { useState } from 'react';
import { X, Copy, Check, Share2, Smartphone } from 'lucide-react';
import { DrawnTeam } from '../types';
import { formatTeamsForWhatsApp } from '../utils/whatsappExporter';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: DrawnTeam[];
  drawMode: 'balanced' | 'random';
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  teams,
  drawMode,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const formattedText = formatTeamsForWhatsApp(teams, drawMode);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = formattedText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Times Sorteados - FutSociety Pro',
          text: formattedText,
        });
      } catch (err) {
        console.log('Share dismissed or cancelled', err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-lg">
              📲
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Exportar para WhatsApp
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Texto formatado com emojis, notas e posições para envio direto aos grupos.
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
          <div className="relative">
            <pre className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
              {formattedText}
            </pre>
          </div>

          {copied && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>Lista copiada com sucesso! Cole no seu grupo do WhatsApp.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Fechar
          </button>

          <div className="flex items-center gap-2">
            {'share' in navigator && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                Compartilhar
              </button>
            )}

            <button
              type="button"
              onClick={handleCopy}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado!' : 'Copiar Texto WhatsApp'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
