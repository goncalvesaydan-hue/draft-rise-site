'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

export default function ServicesCarousel({
  children,
  labels,
  gridClassName = 'services-grid',
  groupLabel = 'Escolher serviço',
  itemLabelPrefix = 'Ver serviço',
}: {
  children: ReactNode;
  labels: string[];
  gridClassName?: string;
  groupLabel?: string;
  itemLabelPrefix?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const trackId = useId();
  const [active, setActive] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  function updatePosition() {
    const track = trackRef.current;
    if (!track) return;
    const { scrollLeft, scrollWidth, clientWidth } = track;
    const maxScroll = Math.max(0, scrollWidth - clientWidth);

    setCanPrev(scrollLeft > 8);
    setCanNext(scrollLeft < maxScroll - 8);

    if (maxScroll > 0 && scrollLeft >= maxScroll - 8) {
      setActive(labels.length - 1);
      return;
    }

    const left = track.getBoundingClientRect().left;
    const distances = Array.from(track.children, card => Math.abs(card.getBoundingClientRect().left - left));
    setActive(distances.indexOf(Math.min(...distances)));
  }

  useEffect(() => {
    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, []);

  function getScrollBehavior(): ScrollBehavior {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
  }

  function showCard(index: number) {
    const track = trackRef.current;
    const card = track?.children[index] as HTMLElement | undefined;
    if (!track || !card) return;
    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
    const targetLeft =
      index === labels.length - 1
        ? maxScroll
        : Math.min(maxScroll, track.scrollLeft + card.getBoundingClientRect().left - track.getBoundingClientRect().left);

    setActive(index);
    track.scrollTo({ left: targetLeft, behavior: getScrollBehavior() });
  }

  function stepScroll(direction: -1 | 1) {
    const track = trackRef.current;
    if (!track) return;
    const cards = Array.from(track.children) as HTMLElement[];
    if (!cards.length) return;

    const trackLeft = track.getBoundingClientRect().left;
    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);

    if (direction === 1) {
      const nextCard = cards.find(card => card.getBoundingClientRect().left - trackLeft > 16);
      const targetLeft = nextCard
        ? Math.min(maxScroll, track.scrollLeft + nextCard.getBoundingClientRect().left - trackLeft)
        : maxScroll;
      track.scrollTo({ left: targetLeft, behavior: getScrollBehavior() });
    } else {
      const prevCards = cards.filter(card => card.getBoundingClientRect().left - trackLeft < -16);
      const prevCard = prevCards[prevCards.length - 1];
      const targetLeft = prevCard
        ? Math.max(0, track.scrollLeft + prevCard.getBoundingClientRect().left - trackLeft)
        : 0;
      track.scrollTo({ left: targetLeft, behavior: getScrollBehavior() });
    }
  }

  return (
    <div className={`services-carousel ${gridClassName}-carousel`}>
      <div ref={trackRef} id={trackId} className={gridClassName} onScroll={updatePosition}>
        {children}
      </div>
      <div className="services-pagination" role="group" aria-label={groupLabel}>
        <button
          type="button"
          className="services-nav-arrow"
          aria-label="Anterior"
          aria-controls={trackId}
          disabled={!canPrev}
          onClick={() => stepScroll(-1)}
        >
          <ChevronLeft size={18} />
        </button>
        <div className="services-pagination-dots">
          {labels.map((label, index) => (
            <button
              key={label}
              type="button"
              aria-label={`${itemLabelPrefix} ${index + 1}: ${label}`}
              aria-controls={trackId}
              aria-current={active === index ? 'true' : undefined}
              onClick={() => showCard(index)}
            >
              <span />
            </button>
          ))}
        </div>
        <button
          type="button"
          className="services-nav-arrow"
          aria-label="Seguinte"
          aria-controls={trackId}
          disabled={!canNext}
          onClick={() => stepScroll(1)}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

