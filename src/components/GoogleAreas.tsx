'use client';

import { Plus } from 'lucide-react';
import { useEffect, useRef } from 'react';

type Area = { title: string; text: string };

export default function GoogleAreas({ areas }: { areas: Area[] }) {
  const firstRef = useRef<HTMLDetailsElement>(null);

  // Desktop keeps the first item open to balance the two-column layout.
  // On mobile we start with everything closed so the list stays short.
  useEffect(() => {
    if (window.matchMedia('(max-width: 760px)').matches) {
      firstRef.current?.removeAttribute('open');
    }
  }, []);

  return (
    <div className="google-presence-areas">
      <p className="google-presence-caption">Como fazemos o seu perfil subir e converter</p>
      {areas.map((area, index) => (
        <details
          className="google-presence-detail"
          key={area.title}
          ref={index === 0 ? firstRef : undefined}
          open={index === 0}
        >
          <summary>{area.title}<Plus size={18} aria-hidden="true" /></summary>
          <p>{area.text}</p>
        </details>
      ))}
    </div>
  );
}

