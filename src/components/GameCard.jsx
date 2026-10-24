import { cardArt, handleArtError } from '../lib/art';
import { formatHours } from '../lib/format';
import { PlayIcon } from './Icons';

export default function GameCard({ game, className = '' }) {
  const { title, icon, url, playtimeHours, source } = game;
  const art = cardArt(game);
  const playtime = formatHours(playtimeHours);
  const isSteam = source === 'steam';

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative block overflow-hidden rounded-md bg-panel ring-1 ring-white/10 transition-[transform,box-shadow] duration-300 hover:z-20 hover:scale-[1.03] hover:shadow-[0_18px_45px_-18px_rgba(0,0,0,0.95)] hover:ring-white/25 focus-visible:scale-[1.03] ${className}`}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        {art ? (
          <img
            src={art}
            alt=""
            width={616}
            height={353}
            loading="lazy"
            onError={(event) => handleArtError(event, game)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_25%,rgba(255,75,62,0.28),transparent_65%)] bg-panel-2 text-5xl"
          >
            {icon ?? '🎮'}
          </span>
        )}

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-cine via-cine/15 to-transparent opacity-95"
        />

        <span
          aria-hidden="true"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-chalk text-cine opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          <PlayIcon className="h-4 w-4 translate-x-px" />
        </span>

        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="line-clamp-1 text-sm font-semibold leading-snug text-chalk">{title}</p>
          <div className="mt-1 flex items-center gap-2 text-[11px] text-smoke">
            <span>{isSteam ? 'Steam' : 'Made by me'}</span>
            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-smoke/50" />
            <span>{playtime ?? 'Not played yet'}</span>
          </div>
        </div>
      </div>
    </a>
  );
}
