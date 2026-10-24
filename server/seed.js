import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';
import { fetchSteamLibrary, hasSteamCredentials } from './steam.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '..', 'data', 'db.json');

const customGames = [
  {
    id: 'custom-neon-drift',
    source: 'custom',
    title: 'Neon Drift',
    description: 'A synthwave arcade racer about mastering neon-soaked highways at 200mph.',
    icon: '🏎️',
    url: 'https://neondrift.game',
    badge: 'Custom',
    visible: true,
  },
  {
    id: 'custom-echoes-of-the-deep',
    source: 'custom',
    title: 'Echoes of the Deep',
    description: 'A meditative puzzle adventure exploring the ruins beneath the ocean floor.',
    icon: '🌊',
    url: 'https://echoesdeep.game',
    badge: 'Custom',
    visible: true,
  },
  {
    id: 'custom-pixel-forge-tactics',
    source: 'custom',
    title: 'Pixel Forge Tactics',
    description: 'A turn-based strategy game where every pixel you place changes the battle.',
    icon: '⚔️',
    url: 'https://pixelforge.game',
    badge: 'Custom',
    visible: true,
  },
];

async function main() {
  let steamGames = [];

  if (hasSteamCredentials()) {
    try {
      console.log('Fetching Steam library…');
      steamGames = (await fetchSteamLibrary()).map((game) => ({
        ...game,
        visible: false,
      }));
      console.log(`Fetched ${steamGames.length} Steam games.`);
    } catch (err) {
      console.warn(`Steam sync failed: ${err.message}. Seeding custom games only.`);
    }
  } else {
    console.warn('No Steam credentials found — seeding custom games only.');
  }

  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(
    DATA_FILE,
    `${JSON.stringify({ steamGames, customGames }, null, 2)}\n`,
    'utf8'
  );
  console.log(`Wrote data/db.json (${steamGames.length} Steam, ${customGames.length} custom).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
