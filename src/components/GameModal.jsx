import { useEffect, useRef } from 'react';
import { heroArt, handleArtError } from '../lib/art';
import { formatHours, formatPlayedDate } from '../lib/format';
import { CloseIcon, PlayIcon } from './Icons';

export default function GameModal({ game, kind, onClose }) {
  const dialogRef = useRef(null);
  const isSteam = kind === 'steam';
  const playtime = formatHours(game.playtimeHours);
  const art = heroArt(game);
  const lastPlayed = formatPlayedDate(game.lastPlayedAt);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    dialog?.showModal();

    return () => {
      document.body.style.overflow = previousOverflow;
      if (dialog?.open) dialog.close();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="game-modal-title"
      aria-describedby="game-modal-description"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      className="m-auto max-h-[90svh] w-[min(92vw,52rem)] max-w-none overflow-y-auto rounded-2xl border border-white/10 bg-panel p-0 text-chalk shadow-[0_50px_140px_-45px_rgba(0,0,0,1)]"
    >
      <div className="relative">
        {art ? (
          <img
            src={art}
            alt=""
            width={1920}
            height={1080}
            onError={(event) => handleArtError(event, game)}
            className="aspect-[16/9] w-full bg-panel-2 object-contain"
          />
        ) : (
          <div className="grid aspect-[16/9] w-full place-items-center bg-[radial-gradient(circle_at_30%_25%,rgba(47,140,255,0.32),transparent_65%)] bg-panel-2 text-6xl">
            <span aria-hidden="true">{game.icon ?? '🎮'}</span>
          </div>
        )}

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-panel via-panel/25 to-transparent"
        />

        <button
          type="button"
          onClick={onClose}
          aria-label="Close details"
          className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-cine/70 text-chalk ring-1 ring-white/25 backdrop-blur transition-colors duration-200 hover:bg-cine"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span
            className={`rounded px-2 py-1 font-semibold ${
              isSteam ? 'bg-white/15 text-chalk ring-1 ring-white/25' : 'bg-signal-deep text-white'
            }`}
          >
            {isSteam ? 'Steam library' : 'SparkzWorlds Original'}
          </span>
          {playtime ? (
            <span className="rounded bg-white/5 px-2 py-1 text-chalk/75 ring-1 ring-white/10">
              {playtime}
            </span>
          ) : (
            <span className="text-smoke">Not played yet</span>
          )}
        </div>

        <h2
          id="game-modal-title"
          className="mt-3 font-display text-3xl uppercase leading-none tracking-wide text-chalk sm:text-4xl"
        >
          {game.title}
        </h2>

        <p
          id="game-modal-description"
          className="mt-3 max-h-52 overflow-y-auto text-sm leading-relaxed text-smoke"
        >
          {game.description || 'No description has been added for this game yet.'}
        </p>

        <dl className="mt-5 grid grid-cols-2 gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm">
          <div><dt className="text-xs text-smoke">Library</dt><dd className="mt-1 font-medium">{isSteam ? 'In your Steam library' : 'SparkzWorlds Original'}</dd></div>
          <div><dt className="text-xs text-smoke">Total playtime</dt><dd className="mt-1 font-medium">{playtime ?? 'Not played yet'}</dd></div>
          {game.releaseDate ? <div><dt className="text-xs text-smoke">Released</dt><dd className="mt-1 font-medium">{game.releaseDate}</dd></div> : null}
          {lastPlayed ? <div><dt className="text-xs text-smoke">Last played</dt><dd className="mt-1 font-medium">{lastPlayed}</dd></div> : null}
          {game.developer ? <div><dt className="text-xs text-smoke">Developer</dt><dd className="mt-1 font-medium">{game.developer}</dd></div> : null}
          {game.publisher ? <div><dt className="text-xs text-smoke">Publisher</dt><dd className="mt-1 font-medium">{game.publisher}</dd></div> : null}
          {isSteam ? <div className="col-span-2 text-xs leading-relaxed text-smoke">Steam’s library data doesn’t include the date this game was acquired.</div> : null}
        </dl>

        {game.genres?.length > 0 ? (
          <ul aria-label="Game genres" className="mt-4 flex flex-wrap gap-2">
            {game.genres.map((genre) => (
              <li key={genre} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-chalk/75">{genre}</li>
            ))}
          </ul>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a
            href={game.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-chalk px-5 py-2.5 text-sm font-bold text-cine transition-colors duration-200 hover:bg-white"
          >
            <PlayIcon className="h-4 w-4" />
            {isSteam ? 'Open in Steam' : 'Play now'}
          </a>
          <button
            type="button"
            onClick={onClose}
            className="btn-shine rounded-md border border-white/20 px-5 py-2.5 text-sm font-medium text-chalk transition-colors duration-200 hover:border-signal/60 hover:text-signal"
          >
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
}
