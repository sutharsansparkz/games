import { useEffect, useRef, useState } from 'react';
import { Parallax } from 'react-scroll-parallax';
import { heroArt, handleArtError } from '../lib/art';
import { formatHours } from '../lib/format';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  InfoIcon,
  PauseIcon,
  PlayIcon,
} from './Icons';

const ROTATE_MS = 8000;

export default function Billboard({ slides, onMoreInfo }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [hovered, setHovered] = useState(false);
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const heroRef = useRef(null);
  const boundsRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();

  const count = slides.length;
  const safeIndex = count > 0 ? index % count : 0;
  const current = slides[safeIndex];
  const autoplay = count > 1 && !reducedMotion && !hovered && !manuallyPaused;

  useEffect(() => {
    if (!autoplay) return undefined;

    const timer = window.setTimeout(() => {
      setDirection(1);
      setIndex((value) => (value + 1) % count);
    }, ROTATE_MS);

    return () => window.clearTimeout(timer);
  }, [autoplay, count, safeIndex]);

  function goTo(next, nextDirection) {
    if (count === 0) return;
    setDirection(nextDirection);
    setIndex(((next % count) + count) % count);
  }

  function handleHeroPointerEnter(event) {
    if (event.pointerType === 'mouse') {
      boundsRef.current = event.currentTarget.getBoundingClientRect();
    }
  }

  function handleHeroPointerMove(event) {
    if (reducedMotion || event.pointerType !== 'mouse') return;

    const hero = heroRef.current;
    const bounds = boundsRef.current;
    if (!hero || !bounds) return;

    const px = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    const py = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;

    hero.style.setProperty('--hx', px.toFixed(3));
    hero.style.setProperty('--hy', py.toFixed(3));
  }

  function resetHeroPointer() {
    boundsRef.current = null;
    const hero = heroRef.current;
    if (!hero) return;
    hero.style.removeProperty('--hx');
    hero.style.removeProperty('--hy');
  }

  if (!current) return null;

  const isSteam = current.kind === 'steam';
  const playtime = formatHours(current.game.playtimeHours);
  const actionLabel = isSteam ? 'Open in Steam' : 'Play now';

  return (
    <section
      ref={heroRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured games"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        resetHeroPointer();
      }}
      onPointerEnter={handleHeroPointerEnter}
      onPointerMove={handleHeroPointerMove}
      className="group/hero relative isolate aspect-[1920/620] min-h-[700px] overflow-hidden bg-cine sm:min-h-[620px] xl:min-h-[560px]"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        {slides.map((slide, slideIndex) => (
          <div
            key={slide.game.id}
            className={`hero-slide absolute inset-0 transition-opacity duration-700 ease-out ${
              slideIndex === safeIndex ? 'is-active opacity-100' : 'opacity-0'
            }`}
          >
            <Parallax speed={12} className="absolute inset-0">
              {heroArt(slide.game) ? (
                <>
                  <img
                    src={heroArt(slide.game)}
                    alt=""
                    width={1920}
                    height={620}
                    loading={slideIndex === 0 ? 'eager' : 'lazy'}
                    fetchPriority={slideIndex === 0 ? 'high' : 'auto'}
                    onError={(event) => handleArtError(event, slide.game)}
                    className="hero-art-fill absolute inset-0 h-full w-full object-cover"
                  />
                  <img
                    src={heroArt(slide.game)}
                    alt=""
                    width={1920}
                    height={620}
                    loading={slideIndex === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    onError={(event) => handleArtError(event, slide.game)}
                    className="hero-art relative h-full w-full object-contain"
                  />
                </>
              ) : (
                <div className="h-full w-full bg-[radial-gradient(circle_at_30%_30%,rgba(47,140,255,0.32),transparent_60%)] bg-panel" />
              )}
            </Parallax>
          </div>
        ))}

        <div className="absolute inset-0 bg-linear-to-r from-cine via-cine/75 via-45% to-cine/15" />
        <div className="absolute inset-0 bg-linear-to-t from-cine via-cine/20 via-35% to-cine/10" />
        <div className="absolute inset-x-0 top-0 h-36 bg-linear-to-b from-cine/75 to-transparent" />
        <div className="hero-ambient absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-beam/10 blur-[130px]" />
      </div>

      <div className="mx-auto flex min-h-[700px] max-w-[1600px] items-end px-5 pb-24 pt-36 sm:min-h-[620px] sm:px-10 sm:pb-28 sm:pt-40 xl:min-h-[560px]">
        <div
          key={`${current.game.id}-${safeIndex}`}
          data-direction={direction > 0 ? 'next' : 'prev'}
          className="hero-copy max-w-2xl [text-wrap:balance]"
        >
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-chalk/70">
            <span
              aria-hidden="true"
              className="inline-block h-1.5 w-1.5 rounded-full bg-signal shadow-[0_0_12px_rgba(47,140,255,0.9)]"
            />
            Featured on SparkzWorlds
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span
              className={`rounded px-2 py-1 font-semibold ${
                isSteam ? 'bg-white/15 text-chalk ring-1 ring-white/25' : 'bg-signal-deep text-white'
              }`}
            >
              {isSteam ? 'Steam library' : 'SparkzWorlds Original'}
            </span>
            {playtime ? <span className="text-chalk/75">{playtime}</span> : null}
            <span className="text-chalk/45" aria-hidden="true">
              •
            </span>
            <span className="text-chalk/70">Curated for you</span>
          </div>

          <h1
            id="billboard-title"
            className="mt-3 max-w-[18ch] font-display text-[clamp(2.8rem,8.5vw,6.5rem)] uppercase leading-[0.88] tracking-[0.01em] text-chalk drop-shadow-[0_10px_36px_rgba(0,0,0,0.75)]"
          >
            {current.game.title}
          </h1>

          {current.game.description ? (
            <p className="mt-4 line-clamp-3 max-w-xl text-sm leading-relaxed text-chalk/75 sm:text-base">
              {current.game.description}
            </p>
          ) : null}

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href={current.game.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-md bg-chalk px-5 py-3 text-sm font-bold text-cine transition-colors duration-200 hover:bg-white"
            >
              <span className="grid h-6 w-6 place-items-center rounded-full bg-cine text-chalk">
                <PlayIcon className="h-3 w-3 translate-x-px" />
              </span>
              {actionLabel}
            </a>
            <button
              type="button"
              onClick={() => onMoreInfo(current)}
              className="btn-shine inline-flex items-center gap-2 rounded-md bg-white/10 px-5 py-3 text-sm font-semibold text-chalk ring-1 ring-white/20 backdrop-blur transition-colors duration-200 hover:bg-white/20"
            >
              <InfoIcon className="h-4 w-4" />
              More info
            </button>
          </div>
        </div>
      </div>

      {count > 1 ? (
        <>
          <button
            type="button"
            onClick={() => goTo(safeIndex - 1, -1)}
            aria-label="Previous featured game"
            className="absolute left-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-cine/60 text-chalk opacity-0 ring-1 ring-white/20 backdrop-blur transition-[opacity,background-color,scale] duration-200 hover:scale-110 hover:bg-cine/90 focus-visible:opacity-100 group-hover/hero:opacity-100 sm:left-4 sm:grid"
          >
            <ChevronLeftIcon />
          </button>
          <button
            type="button"
            onClick={() => goTo(safeIndex + 1, 1)}
            aria-label="Next featured game"
            className="absolute right-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-cine/60 text-chalk opacity-0 ring-1 ring-white/20 backdrop-blur transition-[opacity,background-color,scale] duration-200 hover:scale-110 hover:bg-cine/90 focus-visible:opacity-100 group-hover/hero:opacity-100 sm:right-4 sm:grid"
          >
            <ChevronRightIcon />
          </button>
        </>
      ) : null}

      <div className="absolute inset-x-5 bottom-5 flex items-center justify-between gap-4 sm:inset-x-10 sm:bottom-7">
        <p className="text-xs font-medium tabular-nums text-chalk/60" aria-hidden="true">
          {String(safeIndex + 1).padStart(2, '0')}
          <span className="mx-1 text-chalk/30">/</span>
          {String(count).padStart(2, '0')}
        </p>

        <div className="flex items-center gap-4">
          {count > 1 ? (
            <button
              type="button"
              onClick={() => setManuallyPaused((value) => !value)}
              aria-label={manuallyPaused ? 'Resume slideshow' : 'Pause slideshow'}
              aria-pressed={manuallyPaused}
              className="grid h-9 w-9 place-items-center rounded-full bg-cine/60 text-chalk ring-1 ring-white/20 backdrop-blur transition-colors duration-200 hover:bg-cine/90"
            >
              {manuallyPaused ? (
                <PlayIcon className="h-3.5 w-3.5 translate-x-px" />
              ) : (
                <PauseIcon className="h-3.5 w-3.5" />
              )}
            </button>
          ) : null}

          <div role="group" aria-label="Choose featured game" className="flex items-center">
            {slides.map((slide, slideIndex) => (
              <button
                key={slide.game.id}
                type="button"
                onClick={() => goTo(slideIndex, slideIndex > safeIndex ? 1 : -1)}
                aria-label={`Show ${slide.game.title}`}
                aria-current={slideIndex === safeIndex ? 'true' : undefined}
                className={`hero-dot ${slideIndex === safeIndex ? 'is-active' : ''}`}
              >
                <span className="hero-dot-bar" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {count > 1 && !reducedMotion && autoplay ? (
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 bg-white/10">
          <span key={safeIndex} className="hero-progress block h-full bg-signal" />
        </div>
      ) : null}
    </section>
  );
}
