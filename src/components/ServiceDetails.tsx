'use client';

import { ArrowUpRight } from 'lucide-react';
import { useId, useState } from 'react';

export default function ServiceDetails({ details, tags }: { details: string; tags: string }) {
  const [open, setOpen] = useState(false);
  const contentId = useId();

  return (
    <div className="service-details">
      <button type="button" aria-expanded={open} aria-controls={contentId} onClick={() => setOpen(current => !current)}>
        Explorar solução <ArrowUpRight size={19} />
      </button>
      <div id={contentId} className="disclosure-panel" data-open={open} aria-hidden={!open} inert={!open}>
        <div className="disclosure-inner">
          <div className="service-details-content"><p>{details}</p><span>{tags}</span></div>
        </div>
      </div>
    </div>
  );
}
