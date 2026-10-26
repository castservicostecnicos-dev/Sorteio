import { DraftPlayer, DrawnTeam, DrawSettings, Position } from '../types';
import { TEAM_COLORS } from './constants';

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function drawTeams(
  players: DraftPlayer[],
  settings: DrawSettings,
  forcedTeamCount?: number
): { teams: DrawnTeam[]; remainingPlayers: DraftPlayer[] } {
  if (players.length < 2) {
    return { teams: [], remainingPlayers: [...players] };
  }

  // Determine number of teams
  let numTeams = forcedTeamCount || Math.max(2, Math.floor(players.length / settings.playersPerTeam));
  // Guarantee we don't have more teams than half the players
  numTeams = Math.max(2, Math.min(numTeams, Math.floor(players.length / 2), TEAM_COLORS.length));

  const pool = shuffle([...players]);

  // Separate goalkeepers and field players (only two roles in the app)
  const goalies: DraftPlayer[] = [];
  const fieldPlayers: DraftPlayer[] = [];

  for (const p of pool) {
    if (p.position === 'GK') {
      goalies.push(p);
    } else {
      fieldPlayers.push(p);
    }
  }

  // Sort by rating descending for balancing
  if (settings.mode === 'balanced') {
    goalies.sort((a, b) => b.rating - a.rating + (Math.random() * 0.2 - 0.1));
    fieldPlayers.sort((a, b) => b.rating - a.rating + (Math.random() * 0.2 - 0.1));
  }

  // Initialize teams
  const teams: DrawnTeam[] = Array.from({ length: numTeams }, (_, i) => ({
    id: `team_${i + 1}`,
    name: `Time ${TEAM_COLORS[i % TEAM_COLORS.length].name.replace('Colete ', '')}`,
    color: TEAM_COLORS[i % TEAM_COLORS.length],
    players: [],
    averageRating: 0,
    substitutes: [],
  }));

  // Helper to calculate current team total rating
  const getTeamScore = (t: DrawnTeam) =>
    t.players.reduce((sum, pl) => sum + pl.rating, 0);

  // Step 1: Distribute Goalkeepers (1 per team)
  if (settings.guaranteeGoalies && goalies.length > 0) {
    for (let i = 0; i < Math.min(goalies.length, numTeams); i++) {
      teams[i].players.push(goalies[i]);
    }
    // If extra goalies exist beyond team count, add them to field pool
    for (let i = numTeams; i < goalies.length; i++) {
      fieldPlayers.push(goalies[i]);
    }
  } else {
    fieldPlayers.push(...goalies);
  }

  // Step 2: Distribute Field Players
  if (settings.mode === 'balanced') {
    fieldPlayers.sort((a, b) => b.rating - a.rating + (Math.random() * 0.1 - 0.05));

    const unallocated: DraftPlayer[] = [];

    for (const p of fieldPlayers) {
      // Find team with room that has lowest total score
      const eligibleTeams = teams
        .filter((t) => t.players.length < settings.playersPerTeam)
        .sort((a, b) => {
          if (a.players.length !== b.players.length) {
            return a.players.length - b.players.length;
          }
          return getTeamScore(a) - getTeamScore(b);
        });

      if (eligibleTeams.length > 0) {
        eligibleTeams[0].players.push(p);
      } else {
        unallocated.push(p);
      }
    }

    // Allocate substitutes / extras
    if (settings.allowSubstitutes && unallocated.length > 0) {
      let teamIdx = 0;
      for (const p of unallocated) {
        teams[teamIdx % numTeams].substitutes.push(p);
        teamIdx++;
      }
    }

    // Optimization passes: fine-tune balance by swapping field players
    for (let pass = 0; pass < 25; pass++) {
      teams.sort((a, b) => getTeamScore(b) - getTeamScore(a));
      const strongest = teams[0];
      const weakest = teams[teams.length - 1];
      const diff = getTeamScore(strongest) - getTeamScore(weakest);

      if (diff <= 0.25) break; // Already balanced!

      let bestSwap: { strongIdx: number; weakIdx: number; improvement: number } | null = null;

      for (let sIdx = 0; sIdx < strongest.players.length; sIdx++) {
        const pStrong = strongest.players[sIdx];
        if (pStrong.position === 'GK') continue; // Do not swap goalie

        for (let wIdx = 0; wIdx < weakest.players.length; wIdx++) {
          const pWeak = weakest.players[wIdx];
          if (pWeak.position === 'GK') continue; // Do not swap goalie

          const ratingDelta = pStrong.rating - pWeak.rating;
          if (ratingDelta > 0 && ratingDelta < diff) {
            const newDiff = Math.abs(diff - 2 * ratingDelta);
            if (newDiff < diff) {
              const improvement = diff - newDiff;
              if (!bestSwap || improvement > bestSwap.improvement) {
                bestSwap = { strongIdx: sIdx, weakIdx: wIdx, improvement };
              }
            }
          }
        }
      }

      if (bestSwap) {
        const temp = strongest.players[bestSwap.strongIdx];
        strongest.players[bestSwap.strongIdx] = weakest.players[bestSwap.weakIdx];
        weakest.players[bestSwap.weakIdx] = temp;
      } else {
        break;
      }
    }
  } else {
    // Purely random distribution
    let teamIdx = 0;
    for (const p of fieldPlayers) {
      if (teams[teamIdx % numTeams].players.length < settings.playersPerTeam) {
        teams[teamIdx % numTeams].players.push(p);
        teamIdx++;
      } else if (settings.allowSubstitutes) {
        teams[teamIdx % numTeams].substitutes.push(p);
        teamIdx++;
      }
    }
  }

  // Calculate final average ratings and organize: GK first, then FIELD (by rating desc)
  for (const team of teams) {
    team.players.sort((a, b) => {
      if (a.position === 'GK' && b.position !== 'GK') return -1;
      if (a.position !== 'GK' && b.position === 'GK') return 1;
      return b.rating - a.rating;
    });

    const total = team.players.reduce((sum, p) => sum + p.rating, 0);
    team.averageRating = team.players.length > 0 ? Number((total / team.players.length).toFixed(1)) : 0;
  }

  return { teams, remainingPlayers: [] };
}
