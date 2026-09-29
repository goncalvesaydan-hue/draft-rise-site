import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-secondary px-5 pb-8 pt-16 text-white md:px-8 md:pt-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-10 border-b border-white/15 pb-16 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center overflow-hidden rounded-full bg-white p-1"><Image src="/brand/draft-rise-mark.png" alt="" width={600} height={600} className="size-full object-contain" /></span>
              <span className="font-heading text-lg font-semibold tracking-[-0.04em]">Draft <span className="text-primary">&amp;</span> Rise</span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/55">Presença digital com intenção: menos ruído, mais próximos passos.</p>
          </div>
          <a href="mailto:ola@draftrise.pt" className="group inline-flex items-center gap-2 text-sm font-semibold text-[#FFB39F] transition-colors hover:text-white">ola@draftrise.pt <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></a>
        </div>
        <div className="flex flex-col gap-4 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Draft &amp; Rise. Todos os direitos reservados.</span>
          <span>Estratégia · Experiência · Presença</span>
        </div>
      </div>
    </footer>
  );
}
