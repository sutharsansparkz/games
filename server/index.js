import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';
import { fetchSteamLibrary } from './steam.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '..', 'data', 'db.json');
const DIST_DIR = path.join(__dirname, '..', 'dist');

const PORT = Number(process.env.PORT) || 3001;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

const app = express();
app.use(express.json());

async function readDb() {
  const raw = await fs.readFile(DATA_FILE, 'utf8');
  return JSON.parse(raw);
}

async function writeDb(db) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, `${JSON.stringify(db, null, 2)}\n`, 'utf8');
}

function requireAdmin(req, res, next) {
  if (req.get('x-admin-token') !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Public: only the games chosen in the admin panel.
app.get('/api/games', async (_req, res) => {
  try {
    const db = await readDb();
    res.json({
      steamGames: (db.steamGames ?? []).filter((g) => g.visible),
      customGames: (db.customGames ?? []).filter((g) => g.visible),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: check the password.
app.post('/api/admin/login', (req, res) => {
  if (req.body?.password === ADMIN_PASSWORD) {
    return res.json({ ok: true });
  }
  res.status(401).json({ error: 'Wrong password' });
});

// Admin: read the whole database.
app.get('/api/admin/db', requireAdmin, async (_req, res) => {
  try {
    res.json(await readDb());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: save the whole database.
app.put('/api/admin/db', requireAdmin, async (req, res) => {
  const { steamGames, customGames } = req.body ?? {};
  if (!Array.isArray(steamGames) || !Array.isArray(customGames)) {
    return res.status(400).json({ error: 'Invalid database payload.' });
  }
  try {
    await writeDb({ steamGames, customGames });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: refresh the Steam library, keeping the visibility choices you made.
app.post('/api/admin/steam/sync', requireAdmin, async (_req, res) => {
  try {
    const db = await readDb();
    const previous = new Map((db.steamGames ?? []).map((g) => [g.appId, g]));
    const steamGames = (await fetchSteamLibrary()).map((game) => ({
      ...game,
      visible: previous.get(game.appId)?.visible ?? false,
    }));
    await writeDb({ ...db, steamGames });
    res.json({ ok: true, steamGames });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// Serve the built site in production.
app.use(express.static(DIST_DIR));
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api')) return next();
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`GameTotal API running on http://localhost:${PORT}`);
});
