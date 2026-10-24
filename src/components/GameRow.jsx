import { useCallback, useEffect, useRef, useState } from 'react';
import GameCard from './GameCard';
import Reveal from './Reveal';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

export default function GameRow({ id, title, subtitle, games, ranked = false, onSelect }) {
  const scrollerRef = useRef(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  const updateEdges = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    setEdges({
      left: scroller.scrollLeft > 8,
      right: scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - 8,
    });
  }, []);

  useEffect(() => {
    updateEdges();
    const scroller = scrollerRef.current;
    if (!scroller) return undefined;

    const observer = new ResizeObserver(updateEdges);
    observer.observe(scroller);
    window.addEventListener('resize', updateEdges);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateEdges);
    };
  }, [games, updateEdges]);

  function scrollRow(direction) {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollBy({ left: direction * Math.max(300, scroller.clientWidth * 0.7) });
  }

  if (!games.length) return null;

  return (
    <Reveal>
      <section id={id} aria-labelledby={`${id}-title`} className="relative">
        <div className="mb-3 flex items-end justify-between gap-4 px-5 sm:px-10">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="h-6 w-1 rounded-full bg-signal shadow-[0_0_14px_rgba(47,140,255,0.75)]"
            />
            <div>
              <h2
                id={`${id}-title`}
                className="text-lg font-semibold tracking-tight text-chalk sm:text-2xl"
              >
                {title}
              </h2>
              {subtitle ? <p className="mt-0.5 text-xs text-smoke sm:text-sm">{subtitle}</p> : null}
            </div>
          </div>

          <p className="shrink-0 pb-0.5 text-[10px] uppercase tracking-[0.18em] text-smoke/80 sm:text-[11px]">
            {games.length} {games.length === 1 ? 'title' : 'titles'}
          </p>
        </div>

        <div className="group/row relative">
          <div
            ref={scrollerRef}
            onScroll={updateEdges}
            className="row-scroll flex snap-x gap-2 overflow-x-auto px-5 pb-8 pt-3 scroll-px-5 sm:gap-3 sm:px-10 sm:scroll-px-10"
          >
            {games.map((game, index) =>
              ranked ? (
                <div key={game.id} className="flex shrink-0 snap-start items-end">
                  <span
                    aria-hidden="true"
                    className="rank-number select-none pr-2 pb-3 sm:pr-3"
                  >
                    {index + 1}
                  </span>
                  <GameCard
                    game={game}
                    onSelect={() => onSelect?.({ game, kind: game.source === 'steam' ? 'steam' : 'custom' })}
                    style={{ '--card-index': Math.min(index, 7) }}
                    className="w-[250px] shrink-0 sm:w-[320px]"
                  />
                </div>
              ) : (
                <GameCard
                  key={game.id}
                  game={game}
                  onSelect={() => onSelect?.({ game, kind: game.source === 'steam' ? 'steam' : 'custom' })}
                  style={{ '--card-index': Math.min(index, 7) }}
                  className="w-[250px] shrink-0 snap-start sm:w-[320px]"
                />
              ),
            )}
          </div>

          {edges.left ? (
            <button
              type="button"
              onClick={() => scrollRow(-1)}
              aria-label={`Scroll ${title} left`}
              className="absolute left-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-cine/85 text-chalk opacity-0 ring-1 ring-white/20 backdrop-blur transition-[opacity,background-color,scale] duration-200 hover:scale-110 hover:bg-panel-2 group-hover/row:opacity-100 group-focus-within/row:opacity-100 focus-visible:opacity-100 sm:grid"
            >
              <ChevronLeftIcon />
            </button>
          ) : null}

          {edges.right ? (
            <button
              type="button"
              onClick={() => scrollRow(1)}
              aria-label={`Scroll ${title} right`}
              className="absolute right-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-cine/85 text-chalk opacity-0 ring-1 ring-white/20 backdrop-blur transition-[opacity,background-color,scale] duration-200 hover:scale-110 hover:bg-panel-2 group-hover/row:opacity-100 group-focus-within/row:opacity-100 focus-visible:opacity-100 sm:grid"
            >
              <ChevronRightIcon />
            </button>
          ) : null}
        </div>
      </section>
    </Reveal>
  );
}
