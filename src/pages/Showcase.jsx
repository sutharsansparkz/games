import { useEffect, useMemo, useState } from 'react';
import { ParallaxProvider } from 'react-scroll-parallax';
import { Link } from 'react-router-dom';
import Billboard from '../components/Billboard';
import GameCard from '../components/GameCard';
import GameModal from '../components/GameModal';
import GameRow from '../components/GameRow';
import Header from '../components/Header';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

function LoadingScreen() {
  return (
    <div aria-busy="true">
      <p role="status" className="sr-only">
        Loading your library…
      </p>

      <div className="relative min-h-[80svh] overflow-hidden bg-panel">
        <div className="absolute inset-0 animate-pulse bg-linear-to-t from-cine via-panel to-panel-2" />
        <div className="relative mx-auto flex min-h-[80svh] max-w-[1600px] items-end px-5 pb-24 pt-32 sm:px-10 sm:pb-28 sm:pt-36">
          <div className="w-full max-w-xl animate-pulse">
            <div className="h-5 w-28 rounded bg-white/10" />
            <div className="mt-4 h-16 w-4/5 rounded bg-white/10" />
            <div className="mt-5 h-4 w-full rounded bg-white/5" />
            <div className="mt-2 h-4 w-3/4 rounded bg-white/5" />
            <div className="mt-7 h-10 w-44 rounded bg-white/10" />
          </div>
        </div>
      </div>

      <div className="relative z-10 -mt-12 space-y-8 pb-20 sm:-mt-20">
        {[0, 1].map((row) => (
          <div key={row} className="px-5 sm:px-10">
            <div className="mb-3 h-5 w-44 animate-pulse rounded bg-white/10" />
            <div className="flex gap-2 overflow-hidden sm:gap-3">
              {[0, 1, 2, 3, 4].map((card) => (
                <div
                  key={card}
                  className="w-[230px] shrink-0 animate-pulse rounded-md bg-panel sm:w-[300px]"
                >
                  <div className="aspect-[16/9]" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorScreen({ error, onRetry }) {
  return (
    <div className="mx-auto flex min-h-[75svh] max-w-lg flex-col items-center justify-center px-5 pt-24 text-center">
      <p className="font-display text-4xl uppercase tracking-wide text-chalk sm:text-5xl">
        The shelf is offline
      </p>
      <p className="mt-4 text-sm leading-relaxed text-smoke">
        Your library couldn’t be loaded. {error}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-7 rounded bg-signal-deep px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-signal-deep/90"
      >
        Try again
      </button>
    </div>
  );
}

function EmptyScreen() {
  return (
    <div className="relative flex min-h-[78svh] items-center justify-center overflow-hidden px-5 pb-16 pt-32 text-center">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,75,62,0.18),transparent_58%)]"
      />
      <div className="relative max-w-lg">
        <h1 className="font-display text-5xl uppercase leading-none tracking-wide text-chalk sm:text-6xl">
          Your shelf is empty
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-smoke sm:text-base">
          No games are selected yet. Open the admin panel, choose what should appear, and your
          library will show up here.
        </p>
        <Link
          to="/admin"
          className="mt-7 inline-flex rounded bg-signal-deep px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-signal-deep/90"
        >
          Open the admin panel
        </Link>
      </div>
    </div>
  );
}

function SearchResults({ query, results, onClear }) {
  return (
    <section
      aria-labelledby="search-heading"
      className="mx-auto max-w-[1600px] px-5 pb-20 pt-24 sm:px-10 sm:pt-32"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1
            id="search-heading"
            className="font-display text-4xl uppercase leading-none tracking-wide text-chalk sm:text-5xl"
          >
            Search results
          </h1>
          <p aria-live="polite" className="mt-3 text-sm text-smoke">
            {results.length === 0
              ? `No games match “${query.trim()}”.`
              : `${results.length} ${results.length === 1 ? 'game' : 'games'} for “${query.trim()}”`}
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="rounded border border-white/20 px-4 py-2 text-sm text-chalk transition-colors duration-200 hover:border-signal/60 hover:text-signal"
        >
          Clear search
        </button>
      </div>

      {results.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-x-3 gap-y-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {results.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-lg border border-white/10 bg-panel/60 p-10 text-center">
          <p className="text-lg font-semibold text-chalk">Nothing matched that search</p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-smoke">
            Try a shorter title, or clear the search to browse the whole shelf.
          </p>
          <button
            type="button"
            onClick={onClear}
            className="mt-5 rounded border border-white/20 px-4 py-2 text-sm text-chalk transition-colors duration-200 hover:border-signal/60 hover:text-signal"
          >
            Clear search
          </button>
        </div>
      )}
    </section>
  );
}

export default function Showcase() {
  const [data, setData] = useState({ steamGames: [], customGames: [] });
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    let cancelled = false;

    async function loadGames() {
      try {
        const res = await fetch('/api/games');
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const payload = await res.json();
        if (cancelled) return;
        setData({
          steamGames: payload.steamGames ?? [],
          customGames: payload.customGames ?? [],
        });
        setStatus('ready');
      } catch (err) {
        if (cancelled) return;
        setError(err?.message ?? 'Could not load games.');
        setStatus('error');
      }
    }

    loadGames();
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const { steamGames, customGames } = data;

  const shelf = useMemo(
    () => [
      ...customGames.map((game) => ({ game, kind: 'custom' })),
      ...steamGames.map((game) => ({ game, kind: 'steam' })),
    ],
    [customGames, steamGames],
  );

  const featured = useMemo(() => {
    if (customGames.length > 0) return { game: customGames[0], kind: 'custom' };
    if (steamGames.length > 0) {
      const top = [...steamGames].sort(
        (a, b) => (b.playtimeHours ?? 0) - (a.playtimeHours ?? 0),
      )[0];
      return { game: top, kind: 'steam' };
    }
    return null;
  }, [customGames, steamGames]);

  const mostPlayed = useMemo(
    () =>
      shelf
        .filter(({ game }) => (game.playtimeHours ?? 0) > 0)
        .sort((a, b) => (b.game.playtimeHours ?? 0) - (a.game.playtimeHours ?? 0))
        .slice(0, 10)
        .map(({ game }) => game),
    [shelf],
  );

  const searchResults = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return shelf
      .filter(
        ({ game }) =>
          game.title?.toLowerCase().includes(needle) ||
          game.description?.toLowerCase().includes(needle),
      )
      .map(({ game }) => game);
  }, [shelf, query]);

  const searching = query.trim().length > 0;

  const rows = [
    { id: 'row-made', title: 'Made by me', games: customGames },
    { id: 'row-steam', title: 'From your Steam library', games: steamGames },
    { id: 'row-top', title: 'Most played', subtitle: 'Ranked by hours', games: mostPlayed, ranked: true },
  ].filter((row) => row.games.length > 0 && (!row.ranked || row.games.length > 1));

  function retry() {
    setStatus('loading');
    setError('');
    setAttempt((value) => value + 1);
  }

  function openSearch() {
    setSearchOpen(true);
  }

  function closeSearch() {
    setSearchOpen(false);
    setQuery('');
  }

  function openDetails() {
    if (featured) setSelected(featured);
  }

  return (
    <ParallaxProvider isDisabled={reducedMotion}>
      <div id="top" className="min-h-svh bg-cine font-sans text-chalk">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-signal focus:px-4 focus:py-2 focus:font-medium focus:text-cine"
        >
          Skip to content
        </a>

        <Header
          showCustom={customGames.length > 0}
          showSteam={steamGames.length > 0}
          searchOpen={searchOpen}
          query={query}
          onSearchOpen={openSearch}
          onSearchClose={closeSearch}
          onQueryChange={setQuery}
        />

        <main id="main" tabIndex={-1}>
          {status === 'loading' ? (
            <LoadingScreen />
          ) : status === 'error' ? (
            <ErrorScreen error={error} onRetry={retry} />
          ) : searching ? (
            <SearchResults query={query} results={searchResults} onClear={() => setQuery('')} />
          ) : (
            <>
              {featured ? (
                <Billboard
                  game={featured.game}
                  kind={featured.kind}
                  onMoreInfo={openDetails}
                />
              ) : (
                <EmptyScreen />
              )}

              {rows.length > 0 ? (
                <div id="browse" className="relative z-10 -mt-12 space-y-8 pb-16 sm:-mt-20">
                  {rows.map((row) => (
                    <GameRow key={row.id} {...row} />
                  ))}
                </div>
              ) : null}
            </>
          )}
        </main>

        <footer className="border-t border-white/10 px-5 py-10 sm:px-10">
          <div className="mx-auto flex max-w-[1600px] flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-xl tracking-[0.06em] text-signal">GAMETOTAL</p>
              <p className="mt-1 max-w-sm text-sm leading-relaxed text-smoke">
                The games I make and the ones I keep coming back to.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <Link
                to="/admin"
                className="text-smoke transition-colors duration-200 hover:text-signal"
              >
                Admin panel
              </Link>
              <p className="text-xs text-smoke/90">Option + A opens admin</p>
            </div>
          </div>
        </footer>

        {selected ? (
          <GameModal
            key={selected.game.id}
            game={selected.game}
            kind={selected.kind}
            onClose={() => setSelected(null)}
          />
        ) : null}
      </div>
    </ParallaxProvider>
  );
}
