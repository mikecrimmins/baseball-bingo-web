const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/** Generate a random 4-letter room code (e.g. "TQXF"). */
export function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += LETTERS[Math.floor(Math.random() * LETTERS.length)];
  }
  return code;
}

/** Generate a stable-ish client id without external deps. */
export function generatePlayerId(): string {
  const rand = () => Math.random().toString(36).slice(2, 10);
  return `p_${rand()}${rand()}`;
}
