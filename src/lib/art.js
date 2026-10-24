const STEAM_CDN = 'https://cdn.cloudflare.steamstatic.com/steam/apps';

/** Wide 3:1 art for the billboard. Falls back to the stored header image. */
export function heroArt(game) {
  if (game?.source === 'steam' && game.appId) {
    return `${STEAM_CDN}/${game.appId}/library_hero.jpg`;
  }
  return game?.imageUrl ?? null;
}

/** 16:9 capsule art for row tiles. Falls back to the stored header image. */
export function cardArt(game) {
  if (game?.source === 'steam' && game.appId) {
    return `${STEAM_CDN}/${game.appId}/capsule_616x353.jpg`;
  }
  return game?.imageUrl ?? null;
}

/** If high-res Steam art is missing, swap in the header image once. */
export function handleArtError(event, game) {
  const image = event.currentTarget;
  if (!image.dataset.fallback && game?.imageUrl) {
    image.dataset.fallback = 'true';
    image.src = game.imageUrl;
  }
}
