# GameTotal — Game Showcase

A personal game showcase built with **React + Vite + Tailwind CSS**. It shows
games you built yourself plus hand-picked games from your Steam library.

## Stack

- React 19 + Vite
- Tailwind CSS v4
- Express API backed by a JSON file (`data/db.json`)

## Getting started

```bash
npm install
cp .env.example .env   # add your Steam key, Steam ID, and admin password
npm run seed           # import your Steam library into data/db.json
npm run dev            # API (port 3001) + Vite (port 5173)
```

Open:

- Showcase: http://localhost:5173
- Admin: http://localhost:5173/admin

## The database

`data/db.json` is the whole database:

```json
{
  "steamGames": [{ "id": "steam-203160", "title": "…", "visible": false }],
  "customGames": [{ "id": "custom-neon-drift", "title": "…", "visible": true }]
}
```

Only entries with `"visible": true` appear on the public showcase.

## Admin panel

Open `/admin` and sign in with `ADMIN_PASSWORD` from `.env`. You can also press
**Option + A** (**Alt + A** on Windows/Linux) anywhere on the site to jump
straight to the admin panel.

- Tick the Steam games that should appear
- Add, edit, or delete custom games
- **Save changes** writes to `data/db.json`
- **Sync Steam** refreshes your library (your visibility choices are kept)

## Scripts

| Script            | What it does                                        |
| ----------------- | --------------------------------------------------- |
| `npm run dev`     | Runs the API and the frontend together              |
| `npm run server`  | API only — also serves `dist/` in production        |
| `npm run build`   | Production build                                    |
| `npm run seed`    | Rebuilds `data/db.json` from your Steam library     |
| `npm run lint`    | Runs oxlint                                         |

## Environment

| Variable         | Description                                  |
| ---------------- | -------------------------------------------- |
| `STEAM_API_KEY`  | Steam Web API key                            |
| `STEAM_ID`       | Your 64-bit Steam ID                         |
| `ADMIN_PASSWORD` | Password for the admin panel                 |
| `PORT`           | API port (default `3001`)                    |
