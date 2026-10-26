import { DrawnTeam } from '../types';

export function formatTeamsForWhatsApp(teams: DrawnTeam[], drawMode: 'balanced' | 'random'): string {
  if (!teams || teams.length === 0) return '';

  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const totalPlayers = teams.reduce(
    (sum, t) => sum + t.players.length + t.substitutes.length,
    0
  );

  let text = `⚽ *FUTEBOL SOCIETY - TIMES SORTEADOS* ⚽\n`;
  text += `📅 ${dateStr} às ${timeStr} · ${teams.length} Times (${totalPlayers} Atletas)\n`;
  text += `⚖️ Modo: ${drawMode === 'balanced' ? 'Equilibrado por Nível Técnico' : 'Sorteio Randômico'}\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  teams.forEach((team) => {
    const starEmoji = '⭐';
    text += `${team.color.emoji} *${team.name.toUpperCase()}* (${team.averageRating}${starEmoji} · ${team.players.length} atletas)\n`;

    const goalies = team.players.filter((p) => p.position === 'GK');
    const fieldPlayers = team.players.filter((p) => p.position !== 'GK');

    if (goalies.length > 0) {
      goalies.forEach((p) => {
        text += `🧤 *Goleiro:* ${p.name} (${p.rating}⭐)\n`;
      });
    }

    if (fieldPlayers.length > 0) {
      fieldPlayers.forEach((p, idx) => {
        text += `⚽ ${idx + 1}. ${p.name} (${p.rating}⭐)\n`;
      });
    }

    if (team.substitutes && team.substitutes.length > 0) {
      text += `🔄 *Reservas:* ${team.substitutes
        .map((s) => `${s.name}${s.position === 'GK' ? ' (Goleiro)' : ''}`)
        .join(', ')}\n`;
    }

    text += `\n`;
  });

  text += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `⚽ Boa pelada a todos! Respeito e jogo limpo sempre.\n`;
  text += `Criado via FutSociety Pro`;

  return text;
}
