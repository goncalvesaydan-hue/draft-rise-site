import React from 'react';
import Link from 'next/link';
import { ArrowDownRight, MapPin, Radio, ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-secondary px-5 pb-16 pt-32 text-white md:px-8 md:pb-24 md:pt-44">
      <div aria-hidden="true" className="absolute inset-0 hero-grid opacity-35" />
      <div aria-hidden="true" className="absolute -right-48 top-24 size-[36rem] rounded-full bg-primary/20 blur-[130px]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.02fr_.98fr] lg:gap-20">
        <div className="max-w-3xl">
          <p className="mb-7 flex items-center gap-2 text-sm font-semibold text-accent"><span className="size-2 rounded-full bg-primary" /> Digitalização para negócios locais</p>
          <h1 className="font-heading text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.065em] text-white sm:text-6xl md:text-7xl lg:text-[5.5rem]">
            Faça do seu espaço físico uma presença impossível de ignorar.
          </h1>
          <p className="mt-8 max-w-xl text-pretty text-lg leading-8 text-slate-300 md:text-xl">
            Ligamos descoberta, experiência e pagamento num percurso digital claro para quem já faz um trabalho excelente no mundo real.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="#tangibilidade">
            <Button size="lg" className="h-14 rounded-full bg-primary px-7 text-base font-bold text-white shadow-[0_16px_40px_rgba(255,79,0,0.24)] transition-transform hover:scale-[1.02] hover:bg-primary/90 focus-visible:ring-primary">
              Ver as soluções <ArrowDownRight className="size-5" />
            </Button>
          </Link>
          <Link href="#metodologia">
            <Button size="lg" variant="outline" className="h-14 rounded-full border-white/20 bg-white/[0.03] px-7 text-base text-white hover:bg-white/10 hover:text-white">
              Como trabalhamos
            </Button>
          </Link>
        </div>
        </div>

        <div aria-label="Painel que representa a ligação entre presença local e experiência digital" className="relative mx-auto w-full max-w-xl rounded-[2rem] border border-white/15 bg-[#102440] p-3 shadow-[0_30px_100px_rgba(0,0,0,0.35)]">
          <div className="relative aspect-[1.08] overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0b1d36] p-5 sm:p-7">
            <div aria-hidden="true" className="absolute inset-0 opacity-40 map-grid" />
            <div className="relative flex items-center justify-between text-xs font-semibold text-slate-300"><span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">Ponto de presença</span><Radio className="size-4 text-primary" /></div>
            <div className="relative mt-10 max-w-[15rem] rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur">
              <div className="flex items-center gap-2 text-sm font-semibold"><span className="grid size-8 place-items-center rounded-full bg-primary text-xs">D&amp;R</span> O seu negócio</div>
              <div className="mt-3 h-2 rounded-full bg-white/10"><div className="h-full w-2/3 rounded-full bg-primary" /></div>
              <p className="mt-3 text-xs leading-5 text-slate-300">Visibilidade, serviço e uma próxima ação simples.</p>
            </div>
            <div className="absolute bottom-6 right-6 grid size-24 place-items-center rounded-2xl border border-primary/40 bg-primary/15 text-primary shadow-[0_0_40px_rgba(255,79,0,0.2)]"><ScanLine className="size-10" /></div>
            <span className="absolute left-[61%] top-[40%] size-3 rounded-full bg-primary ring-8 ring-primary/15" />
            <span className="absolute bottom-[29%] left-[26%] size-2 rounded-full bg-white ring-8 ring-white/10" />
            <div className="absolute bottom-7 left-7 flex items-center gap-2 text-xs text-slate-300"><MapPin className="size-4 text-primary" /> Da rua ao ecrã, sem fricção.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
