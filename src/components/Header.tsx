import React from 'react';
import { Sun, Moon, Share2, ClipboardList, Users, Trophy, LayoutGrid, ShieldAlert } from 'lucide-react';

import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  activeTab: 'draw' | 'teams' | 'pitch' | 'players' | 'matches' | 'stats';
  setActiveTab: (tab: 'draw' | 'teams' | 'pitch' | 'players' | 'matches' | 'stats') => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  onOpenWhatsAppModal: () => void;
  drawnTeamsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  theme,
  setTheme,
  onOpenWhatsAppModal,
  drawnTeamsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('draw')}
              className="text-left group flex items-center gap-2.5 focus:outline-none cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                ⚽
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap block leading-tight">
                  FutSociety Pro
                </span>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block -mt-0.5">
                  Sorteio & Gestão
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation tabs */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => setActiveTab('draw')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'draw'
                  ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              Sorteio
            </button>

            <button
              onClick={() => setActiveTab('teams')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'teams'
                  ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Times Sorteados
              {drawnTeamsCount > 0 && (
                <span className="text-xs px-1.5 py-0.2 bg-emerald-500 text-white rounded-full font-bold ml-0.5">
                  {drawnTeamsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('pitch')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'pitch'
                  ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>🏟️</span>
              Campinho
            </button>

            <button
              onClick={() => setActiveTab('players')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'players'
                  ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              Atletas Frequentes
            </button>

            <button
              onClick={() => setActiveTab('matches')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'matches'
                  ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>⚽</span>
              Partidas
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'stats'
                  ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Trophy className="w-4 h-4" />
              Ranking & Stats
            </button>
          </nav>

          {/* Zone 3: Actions (PWA install + WhatsApp import + Theme toggle) */}
          <div className="flex items-center gap-2 shrink-0">
            <PWAInstallButton />

            <button
              onClick={onOpenWhatsAppModal}
              title="Colar Lista do WhatsApp"
              className="px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs"
            >
              <span className="text-sm">📋</span>
              <span className="hidden sm:inline">Colar Lista WhatsApp</span>
              <span className="sm:hidden">Lista</span>
            </button>

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
              aria-label="Alternar tema"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
