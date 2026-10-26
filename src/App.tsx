import React, { useState, useEffect } from 'react';
import {
  DraftPlayer,
  DrawnTeam,
  DrawSettings,
  Match,
  Player,
  POSITIONS,
} from './types';
import {
  getSavedMatches,
  getSavedPlayers,
  getSavedSettings,
  getSavedTeams,
  getSavedTheme,
  saveMatches,
  savePlayers,
  saveSettings,
  saveTeams,
  saveTheme,
} from './utils/storage';
import { drawTeams } from './utils/drawAlgorithm';
import { Header } from './components/Header';
import { DrawSection } from './components/DrawSection';
import { TeamsDisplay } from './components/TeamsDisplay';
import { PitchView } from './components/PitchView';
import { PlayersManager } from './components/PlayersManager';
import { MatchesSection } from './components/MatchesSection';
import { StatsDashboard } from './components/StatsDashboard';
import { WhatsAppImportModal } from './components/WhatsAppImportModal';
import { ExportModal } from './components/ExportModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  Users,
  LayoutGrid,
  Trophy,
  ClipboardList,
  Flame,
  Shuffle,
} from 'lucide-react';

export default function App() {
  const [theme, setThemeState] = useState<'dark' | 'light'>(getSavedTheme);
  const [activeTab, setActiveTab] = useState<
    'draw' | 'teams' | 'pitch' | 'players' | 'matches' | 'stats'
  >('draw');

  const [savedPlayers, setSavedPlayersState] = useState<Player[]>(getSavedPlayers);
  const [settings, setSettingsState] = useState<DrawSettings>(getSavedSettings);
  const [drawnTeams, setDrawnTeamsState] = useState<DrawnTeam[]>(() => {
    return getSavedTeams() || [];
  });
  const [matches, setMatchesState] = useState<Match[]>(getSavedMatches);

  // Current draft list for next draw
  const [draftPlayers, setDraftPlayers] = useState<DraftPlayer[]>([]);

  // Modals
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Sync theme with HTML class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveTheme(theme);
  }, [theme]);

  // Sync settings
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Sync saved players and keep draft list synchronized
  const handleUpdatePlayers = (updated: Player[]) => {
    setSavedPlayersState(updated);
    savePlayers(updated);

    // Also update any matching player in the draft list
    setDraftPlayers((prevDraft) =>
      prevDraft.map((dp) => {
        const match = updated.find(
          (u) =>
            (dp.registeredPlayerId && dp.registeredPlayerId === u.id) ||
            dp.name.toLowerCase() === u.name.toLowerCase()
        );
        if (match) {
          return {
            ...dp,
            name: match.name,
            position: match.position,
            rating: match.rating,
            registeredPlayerId: match.id,
          };
        }
        return dp;
      })
    );
  };

  // Perform Draw
  const handleExecuteDraw = () => {
    if (draftPlayers.length < 2) return;
    const { teams } = drawTeams(draftPlayers, settings);
    setDrawnTeamsState(teams);
    saveTeams(teams);
    setActiveTab('teams');
  };

  // Import WhatsApp list: saves directly to Atletas and draft, then opens Atletas tab to edit levels
  const handleWhatsAppImport = (
    imported: DraftPlayer[],
    saveToFrequent: boolean
  ) => {
    // Add to draft list
    setDraftPlayers((prev) => {
      const existingNames = new Set(prev.map((p) => p.name.toLowerCase()));
      const filteredNew = imported.filter((p) => !existingNames.has(p.name.toLowerCase()));
      return [...prev, ...filteredNew];
    });

    // Automatically register all imported players into saved players database
    setSavedPlayersState((prevSaved) => {
      const newToRegister = [...prevSaved];
      imported.forEach((ip) => {
        const exists = newToRegister.some(
          (sp) => sp.name.toLowerCase() === ip.name.toLowerCase()
        );
        if (!exists) {
          const colors = [
            'bg-blue-600',
            'bg-emerald-600',
            'bg-rose-600',
            'bg-purple-600',
            'bg-amber-600',
            'bg-teal-600',
          ];
          newToRegister.push({
            id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: ip.name,
            position: ip.position,
            rating: ip.rating,
            tag: 'convidado',
            matchesPlayed: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goals: 0,
            assists: 0,
            mvpCount: 0,
            createdAt: new Date().toISOString(),
            avatarColor: colors[Math.floor(Math.random() * colors.length)],
          });
        }
      });
      savePlayers(newToRegister);
      return newToRegister;
    });

    // Take user directly to the Atletas tab so they can review and edit each player's level!
    setActiveTab('players');
  };

  // Add individual player from Frequent list to Draft
  const handleSelectFrequentForDraw = (player: Player) => {
    const exists = draftPlayers.some(
      (dp) =>
        dp.registeredPlayerId === player.id ||
        dp.name.toLowerCase() === player.name.toLowerCase()
    );

    if (!exists) {
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
      setActiveTab('draw');
    } else {
      setActiveTab('draw');
    }
  };

  // Swap two players between drawn teams
  const handleSwapPlayers = (
    teamAId: string,
    playerAId: string,
    teamBId: string,
    playerBId: string
  ) => {
    const updated = drawnTeams.map((team) => ({
      ...team,
      players: [...team.players],
    }));

    const teamA = updated.find((t) => t.id === teamAId);
    const teamB = updated.find((t) => t.id === teamBId);

    if (!teamA || !teamB) return;

    const pAIdx = teamA.players.findIndex((p) => p.id === playerAId);
    const pBIdx = teamB.players.findIndex((p) => p.id === playerBId);

    if (pAIdx === -1 || pBIdx === -1) return;

    const temp = teamA.players[pAIdx];
    teamA.players[pAIdx] = teamB.players[pBIdx];
    teamB.players[pBIdx] = temp;

    // Recalculate average ratings
    [teamA, teamB].forEach((t) => {
      const sum = t.players.reduce((acc, p) => acc + p.rating, 0);
      t.averageRating = t.players.length > 0 ? Number((sum / t.players.length).toFixed(1)) : 0;
    });

    setDrawnTeamsState(updated);
    saveTeams(updated);
  };

  // Move player between teams
  const handleMovePlayer = (
    fromTeamId: string,
    toTeamId: string,
    playerId: string
  ) => {
    const updated = drawnTeams.map((team) => ({
      ...team,
      players: [...team.players],
    }));

    const fromTeam = updated.find((t) => t.id === fromTeamId);
    const toTeam = updated.find((t) => t.id === toTeamId);

    if (!fromTeam || !toTeam) return;

    const pIdx = fromTeam.players.findIndex((p) => p.id === playerId);
    if (pIdx === -1) return;

    const [moved] = fromTeam.players.splice(pIdx, 1);
    toTeam.players.push(moved);

    [fromTeam, toTeam].forEach((t) => {
      const sum = t.players.reduce((acc, p) => acc + p.rating, 0);
      t.averageRating = t.players.length > 0 ? Number((sum / t.players.length).toFixed(1)) : 0;
    });

    setDrawnTeamsState(updated);
    saveTeams(updated);
  };

  // Save finished match and update player career metrics
  const handleSaveMatch = (newMatch: Match) => {
    const updatedMatches = [newMatch, ...matches];
    setMatchesState(updatedMatches);
    saveMatches(updatedMatches);

    // Update career player stats
    const teamA = drawnTeams.find((t) => t.name === newMatch.teamAName);
    const teamB = drawnTeams.find((t) => t.name === newMatch.teamBName);

    const isDraw = newMatch.teamAScore === newMatch.teamBScore;
    const aWon = newMatch.teamAScore > newMatch.teamBScore;

    const updatedPlayers = savedPlayers.map((player) => {
      let matchesPlayed = player.matchesPlayed;
      let wins = player.wins;
      let draws = player.draws;
      let losses = player.losses;
      let goals = player.goals;
      let assists = player.assists;
      let mvpCount = player.mvpCount;

      // Check if player was on Team A
      const onTeamA = teamA?.players.some(
        (p) => p.registeredPlayerId === player.id || p.name.toLowerCase() === player.name.toLowerCase()
      );

      // Check if player was on Team B
      const onTeamB = teamB?.players.some(
        (p) => p.registeredPlayerId === player.id || p.name.toLowerCase() === player.name.toLowerCase()
      );

      if (onTeamA) {
        matchesPlayed += 1;
        if (isDraw) draws += 1;
        else if (aWon) wins += 1;
        else losses += 1;
      } else if (onTeamB) {
        matchesPlayed += 1;
        if (isDraw) draws += 1;
        else if (!aWon) wins += 1;
        else losses += 1;
      }

      // Add goals and assists from events
      const playerGoals = newMatch.events.filter(
        (e) => e.type === 'goal' && (e.playerId === player.id || e.playerName.toLowerCase() === player.name.toLowerCase())
      ).length;
      goals += playerGoals;

      const playerAssists = newMatch.events.filter(
        (e) => e.type === 'assist' && (e.playerId === player.id || e.playerName.toLowerCase() === player.name.toLowerCase())
      ).length;
      assists += playerAssists;

      // MVP
      if (
        newMatch.mvpPlayerId === player.id ||
        (newMatch.mvpPlayerName && newMatch.mvpPlayerName.toLowerCase() === player.name.toLowerCase())
      ) {
        mvpCount += 1;
      }

      return {
        ...player,
        matchesPlayed,
        wins,
        draws,
        losses,
        goals,
        assists,
        mvpCount,
      };
    });

    handleUpdatePlayers(updatedPlayers);
    setActiveTab('stats');
  };

  // Delete match
  const handleDeleteMatch = (matchId: string) => {
    const updated = matches.filter((m) => m.id !== matchId);
    setMatchesState(updated);
    saveMatches(updated);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors pb-20 md:pb-8">
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        setTheme={setThemeState}
        onOpenWhatsAppModal={() => setIsWhatsAppModalOpen(true)}
        drawnTeamsCount={drawnTeams.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'draw' && (
          <DrawSection
            draftPlayers={draftPlayers}
            setDraftPlayers={setDraftPlayers}
            settings={settings}
            setSettings={setSettingsState}
            savedPlayers={savedPlayers}
            onDraw={handleExecuteDraw}
            onOpenWhatsAppModal={() => setIsWhatsAppModalOpen(true)}
            onGoToPlayers={() => setActiveTab('players')}
          />
        )}

        {activeTab === 'teams' && (
          <TeamsDisplay
            teams={drawnTeams}
            onRedraw={handleExecuteDraw}
            onOpenExportModal={() => setIsExportModalOpen(true)}
            onViewPitch={() => setActiveTab('pitch')}
            onStartMatch={(teamA, teamB) => {
              setActiveTab('matches');
            }}
            onSwapPlayers={handleSwapPlayers}
            onMovePlayer={handleMovePlayer}
          />
        )}

        {activeTab === 'pitch' && <PitchView teams={drawnTeams} />}

        {activeTab === 'players' && (
          <PlayersManager
            players={savedPlayers}
            onUpdatePlayers={handleUpdatePlayers}
            onSelectForDraw={handleSelectFrequentForDraw}
            onOpenWhatsAppModal={() => setIsWhatsAppModalOpen(true)}
            onGoToDraw={() => setActiveTab('draw')}
          />
        )}

        {activeTab === 'matches' && (
          <MatchesSection
            drawnTeams={drawnTeams}
            matches={matches}
            players={savedPlayers}
            onSaveMatch={handleSaveMatch}
            onDeleteMatch={handleDeleteMatch}
          />
        )}

        {activeTab === 'stats' && (
          <StatsDashboard players={savedPlayers} matches={matches} />
        )}
      </main>

      {/* Fixed Mobile Bottom Tab Bar (thumb ergonomics) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 md:hidden">
        <div className="grid grid-cols-5 items-center h-16 pb-safe px-1">
          <button
            type="button"
            onClick={() => setActiveTab('draw')}
            className={`min-h-[44px] flex flex-col items-center justify-center transition-colors ${
              activeTab === 'draw'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Shuffle className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Sorteio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('teams')}
            className={`min-h-[44px] flex flex-col items-center justify-center transition-colors relative ${
              activeTab === 'teams'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Times</span>
            {drawnTeams.length > 0 && (
              <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pitch')}
            className={`min-h-[44px] flex flex-col items-center justify-center transition-colors ${
              activeTab === 'pitch'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <span className="text-lg leading-none">🏟️</span>
            <span className="text-[10px] mt-0.5">Campo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('players')}
            className={`min-h-[44px] flex flex-col items-center justify-center transition-colors ${
              activeTab === 'players'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Atletas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stats')}
            className={`min-h-[44px] flex flex-col items-center justify-center transition-colors ${
              activeTab === 'stats'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Trophy className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Stats</span>
          </button>
        </div>
      </div>

      {/* WhatsApp Parser Modal */}
      <WhatsAppImportModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        onImport={handleWhatsAppImport}
        savedPlayers={savedPlayers}
      />

      {/* Export to WhatsApp Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        teams={drawnTeams}
        drawMode={settings.mode}
      />

      {/* Offline Mode Indicator */}
      <OfflineIndicator />
    </div>
  );
}
