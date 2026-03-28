// Zentrix Esports — Supported Games (Locked to 4)
export const GAMES = [
  { id: 'bgmi',      name: 'BGMI',       shortCode: 'BG',  color: '#FFD700', format: 'Squad' },
  { id: 'valorant',  name: 'Valorant',   shortCode: 'VLT', color: '#FF4655', format: '5v5'   },
  { id: 'freefire',  name: 'Free Fire',  shortCode: 'FF',  color: '#FF6F00', format: 'Squad' },
  { id: 'codm',      name: 'CODM',       shortCode: 'COD', color: '#4CAF50', format: 'Squad' },
];

export const GAME_NAMES = GAMES.map(g => g.name);
export const getGameByName = (name) => GAMES.find(g => g.name === name) || GAMES[0];
export const getGameColor = (name) => getGameByName(name).color;
export const getGameShortCode = (name) => getGameByName(name).shortCode;
