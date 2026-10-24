import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { parsed: fileEnv = {} } = dotenv.config({ path: path.join(__dirname, '..', '.env') });

const STEAM_API_KEY = process.env.STEAM_API_KEY?.trim() || fileEnv.STEAM_API_KEY?.trim() || '';
const STEAM_ID = process.env.STEAM_ID?.trim() || fileEnv.STEAM_ID?.trim() || '';

export function hasSteamCredentials() {
  return Boolean(STEAM_API_KEY && STEAM_ID);
}

function toGame(appid, details, minutes, lastPlayed) {
  return {
    id: `steam-${appid}`,
    appId: appid,
    source: 'steam',
    title: details?.name ?? `Game #${appid}`,
    description: details?.short_description ?? '',
    genres: details?.genres?.map((genre) => genre.description).filter(Boolean) ?? [],
    developer: details?.developers?.[0] ?? null,
    publisher: details?.publishers?.[0] ?? null,
    imageUrl:
      details?.header_image ??
      `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`,
    url: `https://store.steampowered.com/app/${appid}/`,
    playtimeHours: Math.round(((minutes ?? 0) / 60) * 10) / 10,
    lastPlayedAt: lastPlayed || null,
    releaseDate: details?.release_date?.date ?? null,
  };
}

async function getAppDetails(appId) {
  try {
    const res = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.[String(appId)]?.data ?? null;
  } catch {
    return null;
  }
}

export async function fetchSteamLibrary() {
  if (!hasSteamCredentials()) {
    throw new Error('Steam credentials are not configured on the server.');
  }

  const res = await fetch(
    `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${STEAM_API_KEY}&steamid=${STEAM_ID}&include_appinfo=true&include_played_free_games=true&format=json`
  );
  if (!res.ok) throw new Error(`Steam API error (${res.status})`);

  const data = await res.json();
  const owned = data?.response?.games ?? [];
  console.log(data,"owned")

  return Promise.all(
    owned.map(async (g) => {
      const details = await getAppDetails(g.appid);
      return toGame(g.appid, details, g.playtime_forever, g.rtime_last_played);
    })
  );
}
