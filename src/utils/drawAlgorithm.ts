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

  const totalMainSlots = numTeams * settings.playersPerTeam;
  const pool = shuffle([...players]);

  // Separate goalkeepers and field players
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

  // Step 1: Distribute Goalkeepers
  if (settings.guaranteeGoalies && goalies.length > 0) {
    // Distribute at most 1 goalie per team first
    for (let i = 0; i < Math.min(goalies.length, numTeams); i++) {
      teams[i].players.push(goalies[i]);
    }
    // If extra goalies exist, append to field pool as players
    for (let i = numTeams; i < goalies.length; i++) {
      fieldPlayers.push(goalies[i]);
    }
  } else {
    // Treat goalies as part of general pool
    fieldPlayers.push(...goalies);
    if (settings.mode === 'balanced') {
      fieldPlayers.sort((a, b) => b.rating - a.rating);
    }
  }

  // Step 2: Distribute remaining positions
  if (settings.mode === 'balanced') {
    // Group remaining players by position: DEF, MID, ATT
    const byPosition: Record<Position, DraftPlayer[]> = {
      GK: [],
      DEF: [],
      MID: [],
      ATT: [],
    };

    for (const p of fieldPlayers) {
      byPosition[p.position].push(p);
    }

    // Sort each position by rating
    (Object.keys(byPosition) as Position[]).forEach((pos) => {
      byPosition[pos].sort((a, b) => b.rating - a.rating + (Math.random() * 0.1 - 0.05));
    });

    // Helper to calculate current team total rating
    const getTeamScore = (t: DrawnTeam) =>
      t.players.reduce((sum, pl) => sum + pl.rating, 0);

    // Distribute sequentially by position group: DEF first, then MID, then ATT, then any left
    const distributionOrder: Position[] = ['DEF', 'MID', 'ATT', 'GK'];

    for (const pos of distributionOrder) {
      const list = byPosition[pos];
      while (list.length > 0) {
        // Find team with lowest current score that still has room for main lineup
        const eligibleTeams = teams
          .filter((t) => t.players.length < settings.playersPerTeam)
          .sort((a, b) => {
            // Priority to team with fewer players, then lower score
            if (a.players.length !== b.players.length) {
              return a.players.length - b.players.length;
            }
            return getTeamScore(a) - getTeamScore(b);
          });

        if (eligibleTeams.length === 0) break;

        const bestPlayer = list.shift()!;
        eligibleTeams[0].players.push(bestPlayer);
      }
    }

    // Put remaining players who didn't fit in main lineup into eligible teams or substitutes
    const leftovers: DraftPlayer[] = [];
    Object.values(byPosition).forEach((arr) => leftovers.push(...arr));

    if (settings.allowSubstitutes) {
      // Distribute leftovers evenly as substitutes
      let teamIdx = 0;
      for (const p of leftovers) {
        teams[teamIdx % numTeams].substitutes.push(p);
        teamIdx++;
      }
    } else {
      // Just keep as remaining
      // If teams are not full yet, fill them
      for (const p of leftovers) {
        const teamWithRoom = teams.find((t) => t.players.length < settings.playersPerTeam);
        if (teamWithRoom) {
          teamWithRoom.players.push(p);
        } else {
          teams[teams.length - 1].substitutes.push(p);
        }
      }
    }

    // Optimization passes: fine-tune balance by swapping players of same category between highest and lowest rated teams
    for (let pass = 0; pass < 20; pass++) {
      teams.sort((a, b) => getTeamScore(b) - getTeamScore(a));
      const strongest = teams[0];
      const weakest = teams[teams.length - 1];
      const diff = getTeamScore(strongest) - getTeamScore(weakest);

      if (diff <= 0.3) break; // Already balanced!

      let bestSwap: { strongIdx: number; weakIdx: number; improvement: number } | null = null;

      for (let sIdx = 0; sIdx < strongest.players.length; sIdx++) {
        const pStrong = strongest.players[sIdx];
        if (pStrong.position === 'GK') continue; // Don't move goalie

        for (let wIdx = 0; wIdx < weakest.players.length; wIdx++) {
          const pWeak = weakest.players[wIdx];
          if (pWeak.position === 'GK') continue;

          // Prefer swapping players in same or compatible position
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
    // Random mode: purely distribute round-robin
    let teamIdx = 0;
    for (const p of fieldPlayers) {
      if (teams[teamIdx % numTeams].players.length < settings.playersPerTeam) {
        teams[teamIdx % numTeams].players.push(p);
        teamIdx++;
      } else {
        // Put in substitutes
        teams[teamIdx % numTeams].substitutes.push(p);
        teamIdx++;
      }
    }
  }

  // Calculate final average ratings and organize players: GK first, then DEF, MID, ATT
  const positionSortWeight: Record<Position, number> = {
    GK: 1,
    DEF: 2,
    MID: 3,
    ATT: 4,
  };

  for (const team of teams) {
    team.players.sort((a, b) => {
      const posDiff = positionSortWeight[a.position] - positionSortWeight[b.position];
      if (posDiff !== 0) return posDiff;
      return b.rating - a.rating;
    });

    const total = team.players.reduce((sum, p) => sum + p.rating, 0);
    team.averageRating = team.players.length > 0 ? Number((total / team.players.length).toFixed(1)) : 0;
  }

  const remainingPlayers: DraftPlayer[] = [];
  return { teams, remainingPlayers };
}
