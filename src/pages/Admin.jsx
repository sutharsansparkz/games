import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const TOKEN_KEY = 'gametotal-admin-token';

const inputClass =
  'w-full rounded-md border border-white/10 bg-cine/70 px-3 py-2 text-sm text-chalk placeholder:text-smoke/70 transition-colors duration-200 focus:border-signal/70';

async function api(path, options = {}, token) {
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'x-admin-token': token } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // keep the default message
    }
    throw new Error(message);
  }

  return res.json();
}

export default function Admin() {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) ?? '');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [db, setDb] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [dirtySteam, setDirtySteam] = useState(false);
  const [dirtyCustom, setDirtyCustom] = useState(false);
  const [steamQuery, setSteamQuery] = useState('');

  const dirty = dirtySteam || dirtyCustom;

  useEffect(() => {
    if (!token) return undefined;

    let cancelled = false;
    setLoading(true);
    setMessage(null);

    api('/api/admin/db', {}, token)
      .then((payload) => {
        if (cancelled) return;
        setDb(payload);
        setDirtySteam(false);
        setDirtyCustom(false);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.message === 'Unauthorized') {
          sessionStorage.removeItem(TOKEN_KEY);
          setToken('');
        } else {
          setMessage({ type: 'error', text: err.message });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!dirty) return undefined;

    function warnBeforeLeaving(event) {
      event.preventDefault();
      event.returnValue = '';
    }

    window.addEventListener('beforeunload', warnBeforeLeaving);
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
  }, [dirty]);

  const steamGames = db?.steamGames ?? [];

  const steamList = useMemo(() => {
    const needle = steamQuery.trim().toLowerCase();
    if (!needle) return steamGames;
    return steamGames.filter((game) => game.title?.toLowerCase().includes(needle));
  }, [steamGames, steamQuery]);

  async function handleLogin(event) {
    event.preventDefault();
    setAuthError('');
    try {
      await api('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
      sessionStorage.setItem(TOKEN_KEY, password);
      setToken(password);
      setPassword('');
    } catch (err) {
      setAuthError(err.message === 'Wrong password' ? 'Wrong password — try again.' : err.message);
    }
  }

  function logout() {
    if (dirty && !window.confirm('Discard your unsaved changes?')) return;
    sessionStorage.removeItem(TOKEN_KEY);
    setToken('');
    setDb(null);
    setMessage(null);
    setDirtySteam(false);
    setDirtyCustom(false);
  }

  async function save() {
    if (!db || busy) return;
    setBusy(true);
    setMessage(null);
    try {
      await api('/api/admin/db', { method: 'PUT', body: JSON.stringify(db) }, token);
      setDirtySteam(false);
      setDirtyCustom(false);
      setMessage({ type: 'ok', text: 'Saved to data/db.json. The showcase is updated.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  }

  async function syncSteam() {
    if (busy) return;
    setBusy(true);
    setMessage(null);
    try {
      const payload = await api('/api/admin/steam/sync', { method: 'POST' }, token);
      setDb((current) => (current ? { ...current, steamGames: payload.steamGames } : current));
      setDirtySteam(false);
      setMessage({
        type: 'ok',
        text: `Synced ${payload.steamGames.length} Steam games. Your visibility choices were kept.`,
      });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  }

  function updateSteam(id, patch) {
    setDb(
      (current) =>
        current && {
          ...current,
          steamGames: current.steamGames.map((game) =>
            game.id === id ? { ...game, ...patch } : game,
          ),
        },
    );
    setDirtySteam(true);
  }

  function updateCustom(id, patch) {
    setDb(
      (current) =>
        current && {
          ...current,
          customGames: current.customGames.map((game) =>
            game.id === id ? { ...game, ...patch } : game,
          ),
        },
    );
    setDirtyCustom(true);
  }

  function addCustom() {
    setDb(
      (current) =>
        current && {
          ...current,
          customGames: [
            ...current.customGames,
            {
              id: `custom-${crypto.randomUUID()}`,
              source: 'custom',
              title: 'New game',
              description: '',
              icon: '🎮',
              url: 'https://',
              visible: true,
            },
          ],
        },
    );
    setDirtyCustom(true);
  }

  function removeCustom(game) {
    if (!window.confirm(`Delete “${game.title}”? This applies when you save.`)) return;
    setDb(
      (current) =>
        current && {
          ...current,
          customGames: current.customGames.filter((entry) => entry.id !== game.id),
        },
    );
    setDirtyCustom(true);
  }

  if (!token) {
    return (
      <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-cine px-5 font-sans text-chalk">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(47,140,255,0.16),transparent_58%)]"
        />

        <form
          onSubmit={handleLogin}
          className="relative w-full max-w-sm rounded-xl border border-white/10 bg-panel/95 p-8 shadow-[0_40px_90px_-50px_rgba(0,0,0,1)]"
        >
          <p className="font-display text-2xl leading-none tracking-[0.06em] text-signal">
            SPARKZWORLDS
          </p>

          <h1 className="mt-6 font-display text-3xl uppercase tracking-wide">Admin access</h1>
          <p className="mt-2 text-sm leading-relaxed text-smoke">
            Sign in to choose which games appear on the showcase. Changes are saved to
            data/db.json.
          </p>

          <label htmlFor="admin-password" className="mt-6 block text-sm font-medium text-chalk">
            Password
          </label>
          <input
            id="admin-password"
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            className={`${inputClass} mt-2 py-2.5`}
          />

          {authError ? (
            <p role="alert" className="mt-3 text-sm text-signal">
              {authError}
            </p>
          ) : null}

          <button
            type="submit"
            className="mt-6 w-full rounded-md bg-signal-deep px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-signal-deep/90"
          >
            Sign in
          </button>

          <p className="mt-5 text-center text-xs text-smoke/80">
            <Link
              to="/"
              className="underline decoration-white/20 underline-offset-4 transition-colors duration-200 hover:text-chalk"
            >
              Back to showcase
            </Link>
          </p>
        </form>
      </div>
    );
  }

  if (!db) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-cine px-5 font-sans text-chalk">
        <p role="status" className="text-sm text-smoke">
          {loading ? 'Loading admin data…' : (message?.text ?? 'Could not load admin data.')}
        </p>
        {!loading ? (
          <button
            type="button"
            onClick={logout}
            className="rounded-md border border-white/15 px-4 py-2 text-sm font-medium text-chalk transition-colors duration-200 hover:border-signal/60 hover:text-signal"
          >
            Back to sign in
          </button>
        ) : null}
      </div>
    );
  }

  const shownSteam = db.steamGames.filter((game) => game.visible).length;
  const shownCustom = db.customGames.filter((game) => game.visible).length;

  return (
    <div className="min-h-svh bg-cine font-sans text-chalk">
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-signal-deep focus:px-4 focus:py-2 focus:font-medium focus:text-white"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-30 border-b border-white/10 bg-cine/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="font-display text-xl leading-none tracking-[0.06em] text-signal sm:text-2xl"
            >
              SPARKZWORLDS
            </Link>
            <span className="rounded border border-signal/40 bg-signal/10 px-2 py-0.5 text-[11px] font-semibold text-signal">
              Admin
            </span>
            {dirty ? (
              <span className="hidden items-center gap-1.5 text-xs text-signal sm:flex">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-signal-deep" />
                Unsaved changes
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/"
              className="rounded-md border border-white/15 px-3.5 py-1.5 text-sm font-medium text-chalk transition-colors duration-200 hover:border-signal/60 hover:text-signal"
            >
              View site
            </Link>
            <button
              type="button"
              onClick={syncSteam}
              disabled={busy}
              className="rounded-md border border-white/15 px-3.5 py-1.5 text-sm font-medium text-chalk transition-colors duration-200 hover:border-signal/60 hover:text-signal disabled:opacity-50"
            >
              Sync Steam
            </button>
            <button
              type="button"
              onClick={save}
              disabled={busy || !dirty}
              className="rounded-md bg-signal-deep px-4 py-1.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-signal-deep/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy ? 'Saving…' : 'Save changes'}
            </button>
            <button
              type="button"
              onClick={logout}
              className="px-2 py-1.5 text-sm font-medium text-smoke transition-colors duration-200 hover:text-chalk"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main id="admin-main" tabIndex={-1} className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        {message ? (
          <p
            role="status"
            className={`mb-8 rounded-lg border px-4 py-3 text-sm ${
              message.type === 'ok'
                ? 'border-lume/25 bg-lume/10 text-lume'
                : 'border-signal/30 bg-signal/10 text-signal'
            }`}
          >
            {message.text}
          </p>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-panel/60 p-4">
            <p className="text-xs text-smoke">On the showcase</p>
            <p className="mt-1 font-display text-2xl text-chalk">
              {shownSteam + shownCustom}
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-panel/60 p-4">
            <p className="text-xs text-smoke">Made by me</p>
            <p className="mt-1 font-display text-2xl text-chalk">
              {db.customGames.length}
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-panel/60 p-4">
            <p className="text-xs text-smoke">In your Steam library</p>
            <p className="mt-1 font-display text-2xl text-chalk">
              {db.steamGames.length}
            </p>
          </div>
        </div>

        <section className="mt-10">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl uppercase tracking-wide">Steam games</h2>
              <p className="mt-1 max-w-lg text-sm leading-relaxed text-smoke">
                Tick the games that should appear on the showcase, then save.
              </p>
            </div>
            <span className="text-sm text-smoke">
              {shownSteam} of {db.steamGames.length} shown
            </span>
          </div>

          {db.steamGames.length === 0 ? (
            <p className="rounded-lg border border-dashed border-white/15 bg-panel/40 p-6 text-sm text-smoke">
              No Steam games yet. Press “Sync Steam” to import your library.
            </p>
          ) : (
            <>
              {db.steamGames.length > 6 ? (
                <div className="relative mb-3 max-w-xs">
                  <label htmlFor="steam-search" className="sr-only">
                    Search your Steam library
                  </label>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-smoke"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.2-3.2" strokeLinecap="round" />
                  </svg>
                  <input
                    id="steam-search"
                    name="steam-search"
                    type="search"
                    value={steamQuery}
                    onChange={(event) => setSteamQuery(event.target.value)}
                    placeholder="Find a game in your library"
                    autoComplete="off"
                    className="search-field w-full rounded-md border border-white/10 bg-panel py-2 pl-9 pr-3 text-sm text-chalk placeholder:text-smoke/70 transition-colors duration-200 focus:border-signal/60"
                  />
                </div>
              ) : null}

              {steamList.length === 0 ? (
                <p className="rounded-lg border border-white/10 bg-panel/40 p-6 text-sm text-smoke">
                  No Steam games match “{steamQuery}”.
                </p>
              ) : (
                <ul className="grid gap-2">
                  {steamList.map((game) => (
                    <li
                      key={game.id}
                      className={`flex items-center gap-3 rounded-lg border p-3 transition-colors duration-200 sm:gap-4 ${
                        game.visible
                          ? 'border-signal/35 bg-panel-2/60'
                          : 'border-white/5 bg-panel/30 hover:border-white/15'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={game.visible}
                        onChange={(event) =>
                          updateSteam(game.id, { visible: event.target.checked })
                        }
                        aria-label={`Show ${game.title} on the showcase`}
                        className="h-4 w-4 shrink-0 accent-signal"
                      />
                      {game.imageUrl ? (
                        <img
                          src={game.imageUrl}
                          alt=""
                          width={460}
                          height={215}
                          loading="lazy"
                          className="h-11 w-[4.75rem] shrink-0 rounded border border-white/10 object-cover"
                        />
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-chalk">{game.title}</p>
                        <p className="text-xs text-smoke">
                          {game.playtimeHours > 0 ? `${game.playtimeHours}h played` : 'Not played'}
                        </p>
                      </div>
                      <a
                        href={game.url}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 text-sm text-smoke underline decoration-white/20 underline-offset-4 transition-colors duration-200 hover:text-signal"
                      >
                        Open
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>

        <section className="mt-14">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl uppercase tracking-wide">Made by me</h2>
              <p className="mt-1 max-w-lg text-sm leading-relaxed text-smoke">
                Your own games. Edit any field, then save.
              </p>
            </div>
            <button
              type="button"
              onClick={addCustom}
              className="rounded-md border border-white/15 px-4 py-2 text-sm font-medium text-chalk transition-colors duration-200 hover:border-signal/60 hover:text-signal"
            >
              Add a game
            </button>
          </div>

          {db.customGames.length === 0 ? (
            <p className="rounded-lg border border-dashed border-white/15 bg-panel/40 p-6 text-sm text-smoke">
              No games of your own yet. Add one to show it on the shelf.
            </p>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {db.customGames.map((game) => (
                <div
                  key={game.id}
                  className={`rounded-xl border p-5 transition-colors duration-200 ${
                    game.visible
                      ? 'border-white/10 bg-panel/80'
                      : 'border-white/5 bg-panel/30'
                  }`}
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-chalk">
                      <input
                        type="checkbox"
                        checked={game.visible}
                        onChange={(event) =>
                          updateCustom(game.id, { visible: event.target.checked })
                        }
                        className="h-4 w-4 accent-signal"
                      />
                      Shown on site
                    </label>

                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="grid h-8 w-8 place-items-center rounded bg-panel-2 text-lg"
                      >
                        {game.icon || '🎮'}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeCustom(game)}
                        className="text-sm text-smoke transition-colors duration-200 hover:text-signal"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <label className="grid gap-1 text-xs font-medium text-smoke">
                      Title
                      <input
                        name="title"
                        value={game.title}
                        onChange={(event) =>
                          updateCustom(game.id, { title: event.target.value })
                        }
                        autoComplete="off"
                        className={inputClass}
                      />
                    </label>

                    <label className="grid gap-1 text-xs font-medium text-smoke">
                      Description
                      <textarea
                        name="description"
                        value={game.description ?? ''}
                        onChange={(event) =>
                          updateCustom(game.id, { description: event.target.value })
                        }
                        rows={2}
                        autoComplete="off"
                        className={inputClass}
                      />
                    </label>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="grid gap-1 text-xs font-medium text-smoke">
                        Link
                        <input
                          name="url"
                          type="url"
                          value={game.url ?? ''}
                          onChange={(event) =>
                            updateCustom(game.id, { url: event.target.value })
                          }
                          placeholder="https://…"
                          autoComplete="off"
                          spellCheck={false}
                          className={inputClass}
                        />
                      </label>
                      <label className="grid gap-1 text-xs font-medium text-smoke">
                        Icon
                        <input
                          name="icon"
                          value={game.icon ?? ''}
                          onChange={(event) =>
                            updateCustom(game.id, { icon: event.target.value })
                          }
                          placeholder="🎮"
                          autoComplete="off"
                          className={inputClass}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
