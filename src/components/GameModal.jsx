import { useEffect, useRef } from 'react';
import { heroArt, handleArtError } from '../lib/art';
import { formatHours } from '../lib/format';
import { CloseIcon, PlayIcon } from './Icons';

export default function GameModal({ game, kind, onClose }) {
  const dialogRef = useRef(null);
  const isSteam = kind === 'steam';
  const playtime = formatHours(game.playtimeHours);
  const art = heroArt(game);

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
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      className="m-auto max-h-[90svh] w-[min(92vw,46rem)] max-w-none overflow-y-auto rounded-xl border border-white/10 bg-panel p-0 text-chalk shadow-[0_40px_120px_-40px_rgba(0,0,0,1)]"
    >
      <div className="relative">
        {art ? (
          <img
            src={art}
            alt=""
            width={1920}
            height={1080}
            onError={(event) => handleArtError(event, game)}
            className="aspect-[16/9] w-full object-cover"
          />
        ) : (
          <div className="grid aspect-[16/9] w-full place-items-center bg-[radial-gradient(circle_at_30%_25%,rgba(255,75,62,0.3),transparent_65%)] bg-panel-2 text-6xl">
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
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-cine/80 text-chalk ring-1 ring-white/25 transition-colors duration-200 hover:bg-cine"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span
            className={`rounded px-2 py-1 font-semibold ${
              isSteam ? 'bg-white/15 text-chalk ring-1 ring-white/25' : 'bg-signal-deep text-white'
            }`}
          >
            {isSteam ? 'Steam library' : 'Made by me'}
          </span>
          <span className="text-smoke">{playtime ?? 'Not played yet'}</span>
        </div>

        <h2
          id="game-modal-title"
          className="mt-3 font-display text-3xl uppercase leading-none tracking-wide text-chalk sm:text-4xl"
        >
          {game.title}
        </h2>

        <p className="mt-3 max-h-52 overflow-y-auto text-sm leading-relaxed text-smoke">
          {game.description || 'No description has been added for this game yet.'}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a
            href={game.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded bg-chalk px-5 py-2.5 text-sm font-semibold text-cine transition-colors duration-200 hover:bg-white"
          >
            <PlayIcon className="h-4 w-4" />
            {isSteam ? 'Open in Steam' : 'Play now'}
          </a>
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-white/20 px-5 py-2.5 text-sm font-medium text-chalk transition-colors duration-200 hover:border-signal/60 hover:text-signal"
          >
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
}
