import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CloseIcon, SearchIcon } from './Icons';

export default function Header({
  showCustom = true,
  showSteam = true,
  searchOpen = false,
  query = '',
  onSearchOpen,
  onSearchClose,
  onQueryChange,
}) {
  const [scrolled, setScrolled] = useState(false);
  const inputRef = useRef(null);

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

  const solid = scrolled || searchOpen;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid
          ? 'border-b border-white/10 bg-cine/95 backdrop-blur-md'
          : 'bg-linear-to-b from-cine/90 via-cine/40 to-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-5 sm:h-[4.5rem] sm:px-10">
        <a
          href="#top"
          className="shrink-0 font-display text-xl leading-none tracking-[0.06em] text-signal sm:text-[1.7rem]"
        >
          GAMETOTAL
        </a>

        <nav aria-label="Primary" className="ml-2 hidden items-center gap-5 md:flex">
          <a href="#top" className="text-sm text-chalk hover:text-white">
            Home
          </a>
          {showCustom ? (
            <a href="#row-made" className="text-sm text-chalk/70 transition-colors hover:text-chalk">
              Made by me
            </a>
          ) : null}
          {showSteam ? (
            <a
              href="#row-steam"
              className="text-sm text-chalk/70 transition-colors hover:text-chalk"
            >
              Steam library
            </a>
          ) : null}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <div
            className={`flex h-9 items-center rounded-full transition-colors duration-200 ${
              searchOpen ? 'border border-white/20 bg-cine/85' : ''
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
                placeholder="Search titles"
                autoComplete="off"
                className="search-field w-28 bg-transparent pr-3 text-sm text-chalk placeholder:text-smoke/80 focus:outline-none sm:w-56"
              />
            ) : null}
          </div>

          <span className="hidden items-center gap-1.5 text-xs text-smoke lg:flex">
            <kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-sans text-[11px] text-chalk">
              ⌥ A
            </kbd>
            admin
          </span>

          <Link
            to="/admin"
            title="Admin panel (Option + A)"
            aria-label="Admin panel"
            className={`h-9 w-9 place-items-center rounded-full bg-panel-2 text-sm font-semibold text-chalk ring-1 ring-white/15 transition-[box-shadow] duration-200 hover:ring-signal/70 ${
              searchOpen ? 'hidden sm:grid' : 'grid'
            }`}
          >
            A
          </Link>
        </div>
      </div>
    </header>
  );
}
