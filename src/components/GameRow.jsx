import { useCallback, useEffect, useRef, useState } from 'react';
import GameCard from './GameCard';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

export default function GameRow({ id, title, subtitle, games, ranked = false }) {
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
    scroller.scrollBy({ left: direction * Math.max(280, scroller.clientWidth * 0.7) });
  }

  if (!games.length) return null;

  return (
    <section id={id} aria-labelledby={`${id}-title`} className="relative">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 sm:px-10">
        <div className="flex items-baseline gap-3">
          <h2
            id={`${id}-title`}
            className="text-base font-semibold tracking-tight text-chalk sm:text-xl"
          >
            {title}
          </h2>
          {subtitle ? <p className="text-xs text-smoke">{subtitle}</p> : null}
        </div>
      </div>

      <div className="group/row relative">
        <div
          ref={scrollerRef}
          onScroll={updateEdges}
          className="row-scroll flex gap-2 overflow-x-auto px-5 pb-8 pt-3 sm:gap-3 sm:px-10"
        >
          {games.map((game, index) =>
            ranked ? (
              <div key={game.id} className="flex shrink-0 items-end">
                <span
                  aria-hidden="true"
                  className="select-none px-1.5 pb-4 font-display text-6xl leading-none text-transparent [-webkit-text-stroke:2px_rgba(243,243,239,0.28)] sm:px-2 sm:text-7xl"
                >
                  {index + 1}
                </span>
                <GameCard game={game} className="w-[230px] shrink-0 sm:w-[300px]" />
              </div>
            ) : (
              <GameCard
                key={game.id}
                game={game}
                className="w-[230px] shrink-0 sm:w-[300px]"
              />
            ),
          )}
        </div>

        {edges.left ? (
          <button
            type="button"
            onClick={() => scrollRow(-1)}
            aria-label={`Scroll ${title} left`}
            className="absolute left-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-cine/85 text-chalk opacity-0 ring-1 ring-white/25 transition-opacity duration-200 hover:bg-panel-2 group-hover/row:opacity-100 group-focus-within/row:opacity-100 focus-visible:opacity-100 sm:grid"
          >
            <ChevronLeftIcon />
          </button>
        ) : null}

        {edges.right ? (
          <button
            type="button"
            onClick={() => scrollRow(1)}
            aria-label={`Scroll ${title} right`}
            className="absolute right-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-cine/85 text-chalk opacity-0 ring-1 ring-white/25 transition-opacity duration-200 hover:bg-panel-2 group-hover/row:opacity-100 group-focus-within/row:opacity-100 focus-visible:opacity-100 sm:grid"
          >
            <ChevronRightIcon />
          </button>
        ) : null}
      </div>
    </section>
  );
}
