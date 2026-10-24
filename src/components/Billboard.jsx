import { Parallax } from 'react-scroll-parallax';
import { heroArt, handleArtError } from '../lib/art';
import { formatHours } from '../lib/format';
import { InfoIcon, PlayIcon } from './Icons';

export default function Billboard({ game, kind, onMoreInfo }) {
  const isSteam = kind === 'steam';
  const playtime = formatHours(game.playtimeHours);
  const art = heroArt(game);
  const actionLabel = isSteam ? 'Open in Steam' : 'Play now';

  return (
    <section aria-labelledby="billboard-title" className="relative isolate overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <Parallax speed={12} className="absolute inset-x-0 -top-24 -bottom-24">
          {art ? (
            <img
              src={art}
              alt=""
              width={1920}
              height={1080}
              onError={(event) => handleArtError(event, game)}
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,75,62,0.3),transparent_60%)] bg-panel" />
          )}
        </Parallax>

        <div className="absolute inset-0 bg-linear-to-r from-cine via-cine/65 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-3/4 bg-linear-to-t from-cine via-cine/55 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-36 bg-linear-to-b from-cine/85 to-transparent" />
      </div>

      <div className="mx-auto flex min-h-[80svh] max-w-[1600px] items-end px-5 pb-24 pt-32 sm:px-10 sm:pb-28 sm:pt-36">
        <div className="rise max-w-2xl">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span
              className={`rounded px-2 py-1 font-semibold ${
                isSteam
                  ? 'bg-white/15 text-chalk ring-1 ring-white/25'
                  : 'bg-signal-deep text-white'
              }`}
            >
              {isSteam ? 'Steam library' : 'Made by me'}
            </span>
            <span className="text-chalk/80">{playtime ?? 'Not played yet'}</span>
          </div>

          <h1
            id="billboard-title"
            className="mt-3 max-w-[16ch] font-display text-[clamp(2.75rem,8vw,6rem)] uppercase leading-[0.95] tracking-[0.01em] text-chalk"
          >
            {game.title}
          </h1>

          {game.description ? (
            <p className="mt-4 line-clamp-3 max-w-xl text-sm leading-relaxed text-chalk/80 sm:text-base">
              {game.description}
            </p>
          ) : null}

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href={game.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded bg-chalk px-5 py-2.5 text-sm font-semibold text-cine transition-colors duration-200 hover:bg-white"
            >
              <PlayIcon className="h-4 w-4" />
              {actionLabel}
            </a>
            <button
              type="button"
              onClick={onMoreInfo}
              className="inline-flex items-center gap-2 rounded bg-white/15 px-5 py-2.5 text-sm font-medium text-chalk backdrop-blur transition-colors duration-200 hover:bg-white/25"
            >
              <InfoIcon className="h-4 w-4" />
              More info
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
