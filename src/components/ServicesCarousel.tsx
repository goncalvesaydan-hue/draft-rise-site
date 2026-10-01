'use client';

import { useId, useRef, useState, type ReactNode } from 'react';

export default function ServicesCarousel({ children, labels }: { children: ReactNode; labels: string[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const trackId = useId();
  const [active, setActive] = useState(0);

  function updatePosition() {
    const track = trackRef.current;
    if (!track) return;
    const left = track.getBoundingClientRect().left;
    const distances = Array.from(track.children, card => Math.abs(card.getBoundingClientRect().left - left));
    setActive(distances.indexOf(Math.min(...distances)));
  }

  function showCard(index: number) {
    const track = trackRef.current;
    const card = track?.children[index];
    if (!track || !card) return;
    track.scrollTo({ left: track.scrollLeft + card.getBoundingClientRect().left - track.getBoundingClientRect().left, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }

  return (
    <div className="services-carousel">
      <div ref={trackRef} id={trackId} className="services-grid" onScroll={updatePosition}>{children}</div>
      <div className="services-pagination" role="group" aria-label="Escolher serviço">
        {labels.map((label, index) => (
          <button key={label} type="button" aria-label={`Ver serviço ${index + 1}: ${label}`} aria-controls={trackId} aria-current={active === index ? 'true' : undefined} onClick={() => showCard(index)}><span /></button>
        ))}
      </div>
    </div>
  );
}
