import { DrawnTeam, DrawSettings, Match, Player } from '../types';

const PLAYERS_KEY = 'futsociety_athletes_v3';
const SETTINGS_KEY = 'futsociety_settings_v3';
const TEAMS_KEY = 'futsociety_teams_v3';
const MATCHES_KEY = 'futsociety_matches_v3';
const THEME_KEY = 'futsociety_theme_v3';

// Actively purge any old legacy mock demo data from previous sessions
try {
  localStorage.removeItem('futsociety_players_v1');
  localStorage.removeItem('futsociety_last_teams_v1');
  localStorage.removeItem('futsociety_matches_v1');
} catch {
  // Ignore in SSR/restricted environments
}

export function getSavedPlayers(): Player[] {
  try {
    const raw = localStorage.getItem(PLAYERS_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function savePlayers(players: Player[]): void {
  try {
    localStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
  } catch (e) {
    console.error('Failed to save players to localStorage', e);
  }
}

export function clearAllPlayers(): void {
  try {
    localStorage.removeItem(PLAYERS_KEY);
    localStorage.removeItem(TEAMS_KEY);
  } catch (e) {
    console.error('Failed to clear players from localStorage', e);
  }
}

export function getSavedSettings(): DrawSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return {
        playersPerTeam: 6,
        mode: 'balanced',
        guaranteeGoalies: true,
        allowSubstitutes: true,
      };
    }
    return JSON.parse(raw);
  } catch {
    return {
      playersPerTeam: 6,
      mode: 'balanced',
      guaranteeGoalies: true,
      allowSubstitutes: true,
    };
  }
}

export function saveSettings(settings: DrawSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

export function getSavedTeams(): DrawnTeam[] | null {
  try {
    const raw = localStorage.getItem(TEAMS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

export function saveTeams(teams: DrawnTeam[]): void {
  try {
    localStorage.setItem(TEAMS_KEY, JSON.stringify(teams));
  } catch (e) {
    console.error('Failed to save teams', e);
  }
}

export function getSavedMatches(): Match[] {
  try {
    const raw = localStorage.getItem(MATCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMatches(matches: Match[]): void {
  try {
    localStorage.setItem(MATCHES_KEY, JSON.stringify(matches));
  } catch (e) {
    console.error('Failed to save matches', e);
  }
}

export function getSavedTheme(): 'dark' | 'light' {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    return raw === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function saveTheme(theme: 'dark' | 'light'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    console.error('Failed to save theme', e);
  }
}

export function exportBackupData(): string {
  const data = {
    version: '3.0',
    date: new Date().toISOString(),
    players: getSavedPlayers(),
    settings: getSavedSettings(),
    matches: getSavedMatches(),
    lastTeams: getSavedTeams(),
  };
  return JSON.stringify(data, null, 2);
}

export function importBackupData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.players && Array.isArray(data.players)) {
      savePlayers(data.players);
    }
    if (data.settings) {
      saveSettings(data.settings);
    }
    if (data.matches && Array.isArray(data.matches)) {
      saveMatches(data.matches);
    }
    if (data.lastTeams && Array.isArray(data.lastTeams)) {
      saveTeams(data.lastTeams);
    }
    return true;
  } catch (e) {
    console.error('Failed to parse backup JSON', e);
    return false;
  }
}
