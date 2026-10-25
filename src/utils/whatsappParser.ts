import { DraftPlayer, Player, Position } from '../types';

export function parseWhatsAppList(
  text: string,
  savedPlayers: Player[] = []
): { players: DraftPlayer[]; ignoredLines: string[] } {
  const lines = text.split(/\r?\n/);
  const players: DraftPlayer[] = [];
  const ignoredLines: string[] = [];

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    // Check if line looks like header, title, date, or divider
    const lower = trimmed.toLowerCase();
    if (
      lower.includes('lista') ||
      lower.includes('futebol') ||
      lower.includes('pelada') ||
      lower.includes('society') ||
      lower.includes('quinta') ||
      lower.includes('sexta') ||
      lower.includes('sábado') ||
      lower.includes('sabado') ||
      lower.includes('domingo') ||
      lower.includes('terça') ||
      lower.includes('segunda') ||
      lower.includes('quarta') ||
      lower.includes('horário') ||
      lower.includes('horario') ||
      lower.includes('local:') ||
      lower.includes('pix:') ||
      lower.includes('valor:') ||
      lower.startsWith('---') ||
      lower.startsWith('===')
    ) {
      ignoredLines.push(trimmed);
      continue;
    }

    // Attempt to extract position hints
    let position: Position = 'MID'; // default
    if (
      lower.includes('(g)') ||
      lower.includes('[g]') ||
      lower.includes('goleiro') ||
      lower.includes('gol') ||
      lower.includes('🧤') ||
      lower.includes('luva')
    ) {
      position = 'GK';
    } else if (
      lower.includes('(z)') ||
      lower.includes('[z]') ||
      lower.includes('(d)') ||
      lower.includes('[d]') ||
      lower.includes('zagueiro') ||
      lower.includes('zaga') ||
      lower.includes('fixo') ||
      lower.includes('defesa') ||
      lower.includes('defensor') ||
      lower.includes('lateral') ||
      lower.includes('🛡️')
    ) {
      position = 'DEF';
    } else if (
      lower.includes('(a)') ||
      lower.includes('[a]') ||
      lower.includes('(ata)') ||
      lower.includes('atacante') ||
      lower.includes('ataque') ||
      lower.includes('pivô') ||
      lower.includes('pivo') ||
      lower.includes('centroavante') ||
      lower.includes('ponta') ||
      lower.includes('⚡') ||
      lower.includes('🔥')
    ) {
      position = 'ATT';
    } else if (
      lower.includes('(m)') ||
      lower.includes('[m]') ||
      lower.includes('(mei)') ||
      lower.includes('meio') ||
      lower.includes('meia') ||
      lower.includes('ala') ||
      lower.includes('volante') ||
      lower.includes('🎯')
    ) {
      position = 'MID';
    }

    // Extract rating hint if present (e.g. ⭐⭐⭐⭐ or 4.5 or 4/5)
    let rating = 3.5; // reasonable default
    const starMatches = trimmed.match(/⭐/g);
    if (starMatches && starMatches.length > 0) {
      rating = Math.min(5, Math.max(1, starMatches.length));
    } else {
      const ratingMatch = trimmed.match(/(?:nota\s*|estrelas?\s*|rating\s*|[-–:]\s*)([1-5](?:\.[0-9])?)\s*(?:\/5)?(?:\s|$)/i);
      if (ratingMatch && ratingMatch[1]) {
        const parsedNum = parseFloat(ratingMatch[1]);
        if (!isNaN(parsedNum) && parsedNum >= 1 && parsedNum <= 5) {
          rating = parsedNum;
        }
      }
    }

    // Clean name: remove leading numbers, punctuation, emojis, and position tags
    let cleanName = trimmed
      // remove leading numbers like "1.", "1 -", "01)", "1 "
      .replace(/^[0-9]{1,2}[\.\-\)\s:]+\s*/, '')
      // remove leading bullet points or emojis
      .replace(/^[\s•\-\*⚽🧤🛡️🎯⚡🔥]+\s*/, '')
      // remove trailing or parenthesized position notes like "(Goleiro)", "(G)", "[Z]", "- Meio"
      .replace(/\s*[\(\[](?:goleiro|gol|g|zagueiro|zaga|fixo|defesa|lateral|meio|meia|volante|ala|atacante|ataque|pivô|pivo|ponta)[\)\]]/gi, '')
      .replace(/[-–]\s*(?:goleiro|gol|zagueiro|zaga|fixo|defesa|lateral|meio|meia|volante|ala|atacante|ataque|pivô|pivo|ponta)\b/gi, '')
      // remove trailing rating strings like "⭐⭐⭐⭐" or "- 4.5" or "/5"
      .replace(/⭐+/g, '')
      .replace(/(?:[-–:]?\s*(?:nota\s*)?[1-5](?:\.[0-9])?(?:\/5)?)$/i, '')
      .trim();

    // Check if name is non-empty and has letters
    if (cleanName.length < 2 || !/[a-zA-ZÀ-ÿ]/.test(cleanName)) {
      ignoredLines.push(trimmed);
      continue;
    }

    // Cross reference with saved frequent players for best match!
    const matchedPlayer = savedPlayers.find((p) => {
      const pName = p.name.toLowerCase();
      const cName = cleanName.toLowerCase();
      return (
        pName === cName ||
        pName.startsWith(cName) ||
        cName.startsWith(pName) ||
        (p.nickname && p.nickname.toLowerCase() === cName)
      );
    });

    if (matchedPlayer) {
      players.push({
        id: `draft_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: matchedPlayer.name,
        position: matchedPlayer.position,
        rating: matchedPlayer.rating,
        isRegistered: true,
        registeredPlayerId: matchedPlayer.id,
      });
    } else {
      players.push({
        id: `draft_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: cleanName,
        position,
        rating,
        isRegistered: false,
      });
    }
  }

  return { players, ignoredLines };
}
