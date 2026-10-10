'use client';

import { ArrowUpRight } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';

export default function ServiceDetails({ details, tags, children }: { details: string; tags: string; children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const contentId = useId();

  return (
    <div className="service-details">
      <button type="button" aria-expanded={open} aria-controls={contentId} onClick={() => setOpen(current => !current)}>
        Explorar solução <ArrowUpRight size={19} />
      </button>
      <div id={contentId} className="disclosure-panel" data-open={open} aria-hidden={!open} inert={!open}>
        <div className="disclosure-inner">
          <div className="service-details-content">{children ?? <p>{details}</p>}<span>{tags}</span></div>
        </div>
      </div>
    </div>
  );
}
