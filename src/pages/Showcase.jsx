import { useEffect, useMemo, useState } from 'react';
import { ParallaxProvider } from 'react-scroll-parallax';
import Billboard from '../components/Billboard';
import GameCard from '../components/GameCard';
import GameModal from '../components/GameModal';
import GameRow from '../components/GameRow';
import Header from '../components/Header';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import { heroArt } from '../lib/art';

function LoadingScreen() {
  return (
    <div aria-busy="true">
      <p role="status" className="sr-only">
        Loading your library…
      </p>

      <div className="relative min-h-[82svh] overflow-hidden">
        <div className="skeleton absolute inset-0 opacity-40" />
        <div className="absolute inset-0 bg-linear-to-r from-cine via-cine/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-3/4 bg-linear-to-t from-cine via-cine/60 to-transparent" />

        <div className="relative mx-auto flex min-h-[82svh] max-w-[1600px] items-end px-5 pb-24 pt-32 sm:px-10 sm:pb-28 sm:pt-36">
          <div className="w-full max-w-xl">
            <div className="skeleton h-3 w-36 rounded-full" />
            <div className="mt-4 flex gap-2">
              <div className="skeleton h-6 w-24 rounded" />
              <div className="skeleton h-6 w-16 rounded" />
            </div>
            <div className="skeleton mt-5 h-16 w-4/5 rounded-lg sm:h-20" />
            <div className="skeleton mt-4 h-4 w-full rounded" />
            <div className="skeleton mt-2 h-4 w-3/4 rounded" />
            <div className="mt-7 flex gap-3">
              <div className="skeleton h-11 w-40 rounded-md" />
              <div className="skeleton h-11 w-32 rounded-md" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-7 right-10 hidden items-center gap-2 sm:flex">
          <div className="skeleton h-2 w-16 rounded-full" />
          <div className="skeleton h-2 w-2 rounded-full" />
          <div className="skeleton h-2 w-2 rounded-full" />
        </div>
      </div>

      <div className="relative z-10 -mt-12 space-y-10 pb-20 sm:-mt-20 sm:space-y-12">
        {[0, 1].map((row) => (
          <div key={row} className="px-5 sm:px-10">
            <div className="mb-4 flex items-center gap-3">
              <div className="skeleton h-6 w-1 rounded-full" />
              <div className="skeleton h-6 w-48 rounded" />
            </div>
            <div className="flex gap-3 overflow-hidden">
              {[0, 1, 2, 3, 4].map((card) => (
                <div
                  key={card}
                  className="skeleton aspect-[16/9] w-[250px] shrink-0 rounded-lg sm:w-[320px]"
                />
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
    <div className="relative flex min-h-[80svh] items-center justify-center overflow-hidden px-5 pb-16 pt-32 text-center">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal/10 blur-[120px]"
      />
      <div className="relative max-w-lg rise">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-signal">
          Connection lost
        </p>
        <p className="mt-3 font-display text-4xl uppercase leading-none tracking-wide text-chalk sm:text-5xl">
          The shelf is offline
        </p>
        <p className="mt-4 text-sm leading-relaxed text-smoke">
          Your library couldn’t be loaded. {error}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-7 rounded-md bg-chalk px-5 py-2.5 text-sm font-semibold text-cine transition-colors duration-200 hover:bg-white"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

function EmptyScreen() {
  return (
    <div className="relative flex min-h-[84svh] items-center justify-center overflow-hidden px-5 pb-16 pt-32 text-center">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-beam/10 blur-[130px]"
      />
      <div className="relative max-w-lg rise">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-beam">SPARKZWORLDS</p>
        <h1 className="mt-3 font-display text-5xl uppercase leading-none tracking-wide text-chalk sm:text-6xl">
          Your shelf is empty
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-smoke sm:text-base">
          No games are on the shelf yet. Check back soon for the latest picks.
        </p>
      </div>
    </div>
  );
}

export default function Showcase() {
  const [data, setData] = useState({ steamGames: [], customGames: [] });
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [selected, setSelected] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [shareMessage, setShareMessage] = useState('');
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

  const heroSlides = useMemo(() => {
    const custom = customGames.map((game) => ({ game, kind: 'custom' }));
    const steam = [...steamGames]
      .sort((a, b) => (b.playtimeHours ?? 0) - (a.playtimeHours ?? 0))
      .map((game) => ({ game, kind: 'steam' }));

    const slides = [...custom, ...steam];
    return slides
      .toSorted((a, b) => Number(Boolean(heroArt(b.game))) - Number(Boolean(heroArt(a.game))))
      .slice(0, 6);
  }, [customGames, steamGames]);

  const mostPlayed = useMemo(
    () =>
      shelf
        .filter(({ game }) => (game.playtimeHours ?? 0) > 0)
        .sort((a, b) => (b.game.playtimeHours ?? 0) - (a.game.playtimeHours ?? 0))
        .slice(0, 5)
        .map(({ game }) => game),
    [shelf],
  );

  const rows = [
    {
      id: 'row-top',
      title: 'Top 5 in your library',
      navLabel: 'Top picks',
      subtitle: 'Ranked by hours played and in your Steam library',
      games: mostPlayed,
      ranked: true,
    },
    {
      id: 'row-made',
      title: 'SparkzWorlds Originals',
      navLabel: 'Originals',
      subtitle: 'Games built from scratch',
      games: customGames,
    },
    {
      id: 'row-steam',
      title: 'In your Steam library',
      navLabel: 'Steam library',
      subtitle: 'Pulled straight from your collection',
      games: steamGames,
    },
  ].filter((row) => row.games.length > 0);

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const searchResults = normalizedQuery
    ? shelf.filter(({ game }) =>
        `${game.title ?? ''} ${game.description ?? ''} ${game.genres?.join(' ') ?? ''}`
          .toLocaleLowerCase()
          .includes(normalizedQuery),
      )
    : [];

  function retry() {
    setStatus('loading');
    setError('');
    setAttempt((value) => value + 1);
  }

  function openDetails(slide) {
    if (slide) setSelected(slide);
  }

  function closeSearch() {
    setSearchOpen(false);
    setQuery('');
  }

  function shuffleGame() {
    if (!shelf.length) return;
    openDetails(shelf[Math.floor(Math.random() * shelf.length)]);
  }

  async function shareShowcase() {
    const shareData = {
      title: 'SparkzWorlds',
      text: 'Explore my game collection on SparkzWorlds.',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareMessage('Thanks for sharing SparkzWorlds.');
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareData.url);
        setShareMessage('Link copied. Share SparkzWorlds with a friend.');
      } else {
        setShareMessage('Copy this page link to share SparkzWorlds.');
      }
    } catch (error) {
      if (error?.name !== 'AbortError') setShareMessage('Could not share the link. Try copying it from your address bar.');
    }
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
          showTop={mostPlayed.length > 0}
          showCustom={customGames.length > 0}
          showSteam={steamGames.length > 0}
          searchOpen={searchOpen}
          query={query}
          onSearchOpen={() => setSearchOpen(true)}
          onSearchClose={closeSearch}
          onQueryChange={setQuery}
          onShuffle={shuffleGame}
          onShare={shareShowcase}
        />

        <main id="main" tabIndex={-1}>
          {status === 'loading' ? (
            <LoadingScreen />
          ) : status === 'error' ? (
            <ErrorScreen error={error} onRetry={retry} />
          ) : (
            <>
              {!normalizedQuery && heroSlides.length > 0 ? (
                <Billboard slides={heroSlides} onMoreInfo={openDetails} />
              ) : null}
              {!normalizedQuery && heroSlides.length === 0 ? <EmptyScreen /> : null}

              <div id="browse" className="relative z-10 space-y-10 pb-20 pt-8 sm:space-y-12 sm:pt-10">
                {normalizedQuery ? (
                  <section aria-labelledby="search-results-title" className="mx-auto max-w-[1520px] px-5 sm:px-10">
                    <h1 id="search-results-title" className="font-display text-3xl uppercase text-chalk sm:text-4xl">Search results</h1>
                    <p className="mt-2 text-sm text-smoke" aria-live="polite">
                      {searchResults.length} {searchResults.length === 1 ? 'game' : 'games'} for “{query.trim()}”
                    </p>
                    {searchResults.length > 0 ? (
                      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {searchResults.map((item, index) => (
                          <GameCard
                            key={item.game.id}
                            game={item.game}
                            onSelect={() => openDetails(item)}
                            style={{ '--card-index': Math.min(index, 7) }}
                            className="w-full"
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="mt-6 rounded-xl border border-white/10 bg-panel/60 p-8 text-sm text-smoke">
                        No games match that search. Try another title or description.
                      </p>
                    )}
                  </section>
                ) : rows.map((row) => <GameRow key={row.id} {...row} onSelect={openDetails} />)}
              </div>
            </>
          )}
        </main>

        {shareMessage ? (
          <p
            role="status"
            aria-live="polite"
            className="fixed inset-x-4 bottom-5 z-[70] mx-auto max-w-md rounded-xl border border-white/10 bg-panel/95 px-4 py-3 text-center text-sm text-chalk shadow-2xl backdrop-blur-xl"
          >
            {shareMessage}
          </p>
        ) : null}

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
