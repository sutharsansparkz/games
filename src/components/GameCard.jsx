import { useRef } from 'react';
import { cardArt, handleArtError } from '../lib/art';
import { formatHours, formatPlayedDate } from '../lib/format';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import { PlayIcon } from './Icons';

const TILT_DEGREES = 6;
const PARALLAX_VARS = ['--px', '--py', '--tilt-x', '--tilt-y', '--mx', '--my'];

export default function GameCard({ game, className = '', style, onSelect }) {
  const { icon, playtimeHours, source } = game;
  const art = cardArt(game);
  const playtime = formatHours(playtimeHours);
  const isSteam = source === 'steam';

  const cardRef = useRef(null);
  const boundsRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();

  function handlePointerEnter(event) {
    boundsRef.current = event.currentTarget.getBoundingClientRect();
  }

  function handlePointerMove(event) {
    if (reducedMotion || event.pointerType !== 'mouse') return;

    const card = cardRef.current;
    const bounds = boundsRef.current;
    if (!card || !bounds) return;

    // −1…1 from the card centre, so layers can move in opposite directions.
    const px = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    const py = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;

    card.style.setProperty('--px', px.toFixed(3));
    card.style.setProperty('--py', py.toFixed(3));
    card.style.setProperty('--tilt-x', `${(-py * TILT_DEGREES).toFixed(2)}deg`);
    card.style.setProperty('--tilt-y', `${(px * TILT_DEGREES).toFixed(2)}deg`);
    card.style.setProperty('--mx', `${((px + 1) * 50).toFixed(2)}%`);
    card.style.setProperty('--my', `${((py + 1) * 50).toFixed(2)}%`);
  }

  function resetPointer() {
    boundsRef.current = null;
    const card = cardRef.current;
    if (!card) return;
    PARALLAX_VARS.forEach((property) => card.style.removeProperty(property));
  }

  return (
    <button
      ref={cardRef}
      type="button"
      onClick={onSelect}
      style={style}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      onPointerCancel={resetPointer}
      className={`card-parallax group relative block overflow-hidden rounded-lg bg-panel ring-1 ring-white/10 text-left transition-[transform,box-shadow] duration-300 hover:z-20 hover:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.95)] hover:ring-white/25 ${className}`}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        {art ? (
          <img
            src={art}
            alt=""
            width={616}
            height={353}
            loading="lazy"
            decoding="async"
            onError={(event) => handleArtError(event, game)}
            className="card-art h-full w-full bg-panel-2 object-contain"
          />
        ) : (
          <span
            aria-hidden="true"
            className="card-art flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_25%,rgba(47,140,255,0.3),transparent_65%)] bg-panel-2 text-5xl"
          >
            {icon ?? '🎮'}
          </span>
        )}

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-cine via-cine/20 to-transparent"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-cine/90 via-cine/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
        />

        <div aria-hidden="true" className="card-glare pointer-events-none absolute inset-0" />

        <span className="absolute left-2.5 top-2.5 rounded bg-cine/70 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-chalk/85 ring-1 ring-white/15 backdrop-blur">
          {isSteam ? 'Steam' : 'Original'}
        </span>

        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 grid place-items-center"
        >
          <span className="card-play grid h-12 w-12 place-items-center rounded-full bg-chalk/95 text-cine shadow-[0_12px_34px_rgba(0,0,0,0.65)] ring-1 ring-white/60">
            <PlayIcon className="h-5 w-5 translate-x-px" />
          </span>
        </span>

        <div className="card-copy absolute inset-x-0 bottom-0 p-3 text-left">
          <p className="truncate text-sm font-semibold text-chalk">{game.title}</p>
          <p className="mt-1 text-[11px] text-smoke">{playtime ?? 'Not played yet'}{formatPlayedDate(game.lastPlayedAt) ? ` · Last played ${formatPlayedDate(game.lastPlayedAt)}` : ''}</p>
        </div>
      </div>
    </button>
  );
}
