'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowDownRight, MapPin, Radio, ScanLine } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern';
import { BlurFade } from '@/components/ui/blur-fade';
import { BorderBeam } from '@/components/ui/border-beam';
import { ShimmerButton } from '@/components/ui/shimmer-button';

export default function Hero() {
  const scrollToSolutions = () => {
    document.getElementById('tangibilidade')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative isolate overflow-hidden bg-secondary px-5 pb-10 pt-32 text-white md:px-8 md:pb-16 md:pt-44">
      <AnimatedGridPattern
        width={44}
        height={44}
        numSquares={28}
        maxOpacity={0.12}
        duration={3}
        className="text-[#FFB39F] [mask-image:linear-gradient(to_bottom,white,transparent_82%)]"
      />
      <div aria-hidden="true" className="absolute -right-48 top-24 size-[36rem] rounded-full bg-primary/20 blur-[130px]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.08fr_.92fr] lg:gap-20">
        <BlurFade className="max-w-3xl" delay={0.05}>
          <p className="section-kicker mb-7 flex items-center gap-3 font-semibold text-accent"><span className="grid size-6 place-items-center rounded-full border border-primary/40 bg-primary/15"><span className="size-2 rounded-full bg-primary" /></span> Presença local com intenção</p>
          <h1 className="font-heading text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.065em] text-white sm:text-6xl md:text-7xl lg:text-[5.5rem]">
            O seu negócio local, escolhido antes de ser visitado.
          </h1>
          <p className="mt-8 max-w-xl text-pretty text-lg leading-8 text-slate-300 md:text-xl">
            Tornamos mais fácil encontrar o que já faz bem — e mais natural dar o próximo passo.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ShimmerButton type="button" onClick={scrollToSolutions} background="#FF4D1F" shimmerColor="#FFCAA8" className="h-14 gap-2 px-7 text-base font-bold shadow-[0_16px_40px_rgba(255,77,31,0.24)]">
              Ver as soluções <ArrowDownRight className="size-5" />
            </ShimmerButton>
          <Link href="#metodologia" className={buttonVariants({ variant: 'outline', size: 'lg', className: 'h-14 rounded-full border-white/20 bg-white/[0.03] px-7 text-base text-white hover:bg-white/10 hover:text-white' })}>
              Como trabalhamos
          </Link>
        </div>
        </BlurFade>

        <BlurFade className="relative mx-auto w-full max-w-xl" delay={0.2} direction="up">
          <div role="img" aria-label="Painel que representa a ligação entre presença local e experiência digital" className="relative rounded-[2rem] border border-white/15 bg-[#2D3A49] p-3 shadow-[0_30px_100px_rgba(32,43,56,0.35)]">
          <BorderBeam size={120} duration={8} colorFrom="#FF4D1F" colorTo="#FFB39F" borderWidth={1.5} />
          <div className="relative aspect-[1.08] overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#202B38] p-5 sm:p-7">
            <div aria-hidden="true" className="absolute inset-0 opacity-40 map-grid" />
            <div aria-hidden="true" className="absolute left-[14%] top-[24%] h-px w-[72%] signal-line opacity-80" />
            <div aria-hidden="true" className="absolute left-[14%] top-[24%] h-[52%] w-[72%] rounded-[50%] border border-primary/20" />
            <div aria-hidden="true" className="absolute left-[23%] top-[33%] h-[34%] w-[54%] rounded-[50%] border border-primary/15" />
            <div className="relative flex items-center justify-between text-xs font-semibold text-slate-300"><span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">Mapa de presença</span><Radio className="size-4 text-primary" /></div>
            <div className="relative mt-10 max-w-[15rem] rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur">
              <div className="flex items-center gap-2 text-sm font-semibold"><span className="grid size-8 place-items-center overflow-hidden rounded-full bg-white p-0.5"><Image src="/brand/draft-rise-mark.png" alt="" width={600} height={600} className="size-full object-contain" /></span> O seu negócio</div>
              <div className="mt-3 h-2 rounded-full bg-white/10"><div className="h-full w-2/3 rounded-full bg-primary" /></div>
              <p className="mt-3 text-xs leading-5 text-slate-300">Encontrar. Confiar. Escolher.</p>
            </div>
            <div className="absolute bottom-6 right-6 grid size-24 place-items-center rounded-2xl border border-primary/40 bg-primary/15 text-primary shadow-[0_0_40px_rgba(255,79,0,0.2)]"><ScanLine className="size-10" /></div>
            <span className="absolute left-[61%] top-[40%] size-3 rounded-full bg-primary ring-8 ring-primary/15" />
            <span className="absolute bottom-[29%] left-[26%] size-2 rounded-full bg-white ring-8 ring-white/10" />
            <div className="absolute bottom-7 left-7 flex items-center gap-2 text-xs text-slate-300"><MapPin className="size-4 text-primary" /> Da rua ao ecrã, sem fricção.</div>
          </div>
        </div>
        </BlurFade>
      </div>
      <div className="relative mx-auto mt-16 grid max-w-7xl grid-cols-1 border-t border-white/10 pt-6 text-sm text-slate-400 sm:grid-cols-3">
        <div className="flex items-center gap-3 py-3 sm:border-r sm:border-white/10"><span className="text-primary">01</span> Ser encontrado</div>
        <div className="flex items-center gap-3 py-3 sm:pl-6 sm:border-r sm:border-white/10"><span className="text-primary">02</span> Ser escolhido</div>
        <div className="flex items-center gap-3 py-3 sm:pl-6"><span className="text-primary">03</span> Ser lembrado</div>
      </div>
    </section>
  );
}
