import { useEffect, useRef, useState } from 'react';
import { CloseIcon, SearchIcon, ShareIcon, ShuffleIcon } from './Icons';

export default function Header({
  showCustom = true,
  showSteam = true,
  showTop = false,
  searchOpen = false,
  query = '',
  onSearchOpen,
  onSearchClose,
  onQueryChange,
  onShuffle,
  onShare,
}) {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('top');
  const inputRef = useRef(null);

  const items = [
    { id: 'top', label: 'Home', href: '#top', enabled: true },
    { id: 'row-top', label: 'Top picks', href: '#row-top', enabled: showTop },
    { id: 'row-made', label: 'Originals', href: '#row-made', enabled: showCustom },
    { id: 'row-steam', label: 'Steam library', href: '#row-steam', enabled: showSteam },
  ].filter((item) => item.enabled);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const sections = items.filter((item) => item.id !== 'top');
    if (!sections.length) {
      setActive('top');
      return undefined;
    }

    let frame = 0;

    function update() {
      frame = 0;
      let current = 'top';

      for (const item of sections) {
        const element = document.getElementById(item.id);
        if (element && element.getBoundingClientRect().top <= 130) current = item.id;
      }

      setActive(current);
    }

    function onScroll() {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    }

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
    // Navigation targets only change when the visible shelves change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCustom, showSteam, showTop]);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key !== '/' || searchOpen) return;

      const target = event.target;
      const typing =
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if (typing) return;
      event.preventDefault();
      onSearchOpen?.();
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [searchOpen, onSearchOpen]);

  const solid = scrolled || searchOpen;

  return (
    <header
      className={`site-header fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-300 ${
        solid
          ? 'border-white/10 bg-cine/90 shadow-[0_20px_70px_-35px_rgba(0,0,0,1)] backdrop-blur-xl'
          : 'border-transparent bg-linear-to-b from-cine/95 via-cine/55 to-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-2 px-4 sm:h-[4.5rem] sm:gap-4 sm:px-10">
        <a
          href="#top"
          className={`${searchOpen ? 'hidden sm:flex' : 'flex'} shrink-0 items-center gap-2.5 font-display text-lg leading-none tracking-[0.08em] text-chalk sm:text-[1.7rem]`}
        >
          <span className="logo-mark" aria-hidden="true" />
          <span className="tracking-[0.02em]">
            SPARKZ<span className="text-signal">WORLDS</span>
          </span>
        </a>

        <nav
          aria-label="Primary"
          className={`ml-3 hidden min-w-0 items-center gap-4 lg:gap-6 ${searchOpen ? 'md:hidden' : 'md:flex'}`}
        >
          {items.map((item) => (
            <a
              key={item.id}
              href={item.href}
              aria-current={active === item.id ? 'location' : undefined}
              className={`nav-link pb-1 text-sm font-medium transition-colors duration-200 ${
                active === item.id ? 'is-active text-chalk' : 'text-chalk/65 hover:text-chalk'
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className={`ml-auto flex min-w-0 items-center gap-1 sm:gap-2 ${searchOpen ? 'w-full sm:w-auto' : ''}`}>
          {onShare ? (
            <button
              type="button"
              onClick={onShare}
              aria-label="Share SparkzWorlds"
              title="Share this library"
              className={`${searchOpen ? 'hidden sm:grid' : 'grid'} h-8 w-8 place-items-center rounded-full text-chalk/80 transition-[background-color,color,transform] duration-200 hover:scale-105 hover:bg-white/10 hover:text-chalk sm:h-9 sm:w-9`}
            >
              <ShareIcon className="h-[18px] w-[18px]" />
            </button>
          ) : null}

          <div
            className={`flex h-9 min-w-0 items-center rounded-full ring-1 transition-[background-color,box-shadow] duration-300 ${
              searchOpen ? 'w-full flex-1 bg-white/10 ring-white/25 focus-within:ring-beam/60 sm:w-auto sm:flex-none' : 'bg-transparent ring-transparent'
            }`}
          >
            <button
              type="button"
              aria-label={searchOpen ? 'Close search' : 'Search games'}
              aria-expanded={searchOpen}
              aria-controls={searchOpen ? 'site-search' : undefined}
              onClick={searchOpen ? onSearchClose : onSearchOpen}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-chalk/85 transition-colors hover:text-chalk"
            >
              {searchOpen ? <CloseIcon /> : <SearchIcon />}
            </button>

            {searchOpen ? (
              <>
                <label htmlFor="site-search" className="sr-only">
                  Search games
                </label>
                <input
                  ref={inputRef}
                  id="site-search"
                  name="search"
                  type="search"
                  value={query}
                  onChange={(event) => onQueryChange(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') onSearchClose();
                  }}
                  placeholder="Search titles…"
                  autoComplete="off"
                  className="search-field min-w-0 w-32 bg-transparent pr-3 text-sm text-chalk placeholder:text-smoke/80 focus:outline-none sm:w-60"
                />
              </>
            ) : null}
          </div>

          {onShuffle ? (
            <button
              type="button"
              onClick={onShuffle}
              aria-label="Open a random game"
              title="Surprise me"
              className={`${searchOpen ? 'hidden sm:grid' : 'grid'} group/shuffle h-8 w-8 place-items-center rounded-full bg-white/5 text-chalk ring-1 ring-white/15 transition-[background-color,scale] duration-200 hover:scale-105 hover:bg-white/10 hover:ring-white/30 sm:h-9 sm:w-9`}
            >
              <ShuffleIcon className="h-[18px] w-[18px] transition-transform duration-300 group-hover/shuffle:rotate-12" />
            </button>
          ) : null}
        </div>
      </div>

      <nav
        aria-label="Sections"
        className="row-scroll flex gap-2 overflow-x-auto px-5 pb-3 md:hidden"
      >
        {items.map((item) => (
          <a
            key={item.id}
            href={item.href}
            aria-current={active === item.id ? 'location' : undefined}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ring-1 transition-colors duration-200 ${
              active === item.id
                ? 'bg-chalk text-cine ring-chalk'
                : 'bg-white/5 text-chalk/70 ring-white/10 hover:bg-white/10 hover:text-chalk'
            }`}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
