'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight, MapPin, Radio, ScanLine } from 'lucide-react';
import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern';
import { BlurFade } from '@/components/ui/blur-fade';
import { BorderBeam } from '@/components/ui/border-beam';
import { ShimmerButton } from '@/components/ui/shimmer-button';

export default function Hero() {
  const scrollToSolutions = () => {
    document.getElementById('solucoes')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden bg-background px-5 pb-12 pt-32 text-secondary md:px-8 md:pb-20 md:pt-44">
      <div aria-hidden="true" className="absolute -right-56 -top-56 size-[38rem] rounded-full bg-[#FFB39F]/25 blur-[110px]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.02fr_.98fr] lg:gap-20">
        <BlurFade delay={0.05} className="max-w-3xl">
          <div className="mb-8 flex items-center gap-3 text-sm font-semibold text-secondary/70">
            <span className="grid size-7 place-items-center rounded-full bg-primary text-white"><Radio className="size-3.5" /></span>
            Estratégia digital para negócios locais
          </div>
          <h1 className="max-w-3xl text-balance font-heading text-5xl font-semibold leading-[0.96] tracking-[-0.07em] md:text-7xl lg:text-[6.8rem]">
            O seu negócio, no lugar certo.
          </h1>
          <p className="mt-8 max-w-xl text-pretty text-lg leading-8 text-secondary/65 md:text-xl">
            Tornamos mais simples ser encontrado, escolhido e lembrado — da pesquisa no mapa ao momento dentro do espaço.
          </p>
          <div className="mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <ShimmerButton type="button" onClick={scrollToSolutions} background="#FF4D1F" shimmerColor="#FFCAA8" className="h-14 gap-3 px-7 text-base font-bold shadow-[0_18px_40px_rgba(255,77,31,0.22)]">
              Ver como funciona <ArrowUpRight className="size-5" />
            </ShimmerButton>
            <Link href="#metodologia" className="group inline-flex items-center gap-2 text-sm font-semibold text-secondary/75 transition-colors hover:text-primary">
              Conhecer o método <ArrowDown className="size-4 transition-transform group-hover:translate-y-1" />
            </Link>
          </div>
        </BlurFade>

        <BlurFade delay={0.18} direction="up" className="relative mx-auto w-full max-w-xl">
          <div className="relative overflow-hidden rounded-[2rem] bg-secondary p-3 shadow-[0_28px_80px_rgba(32,43,56,0.18)]">
            <BorderBeam size={130} duration={9} colorFrom="#FF4D1F" colorTo="#FFB39F" borderWidth={1.5} />
            <div className="relative aspect-square overflow-hidden rounded-[1.45rem] bg-[#283644] p-6 text-white sm:p-8">
              <AnimatedGridPattern width={42} height={42} numSquares={22} maxOpacity={0.12} duration={3.5} className="text-[#FFB39F] [mask-image:linear-gradient(to_bottom,white,transparent_72%)]" />
              <div className="relative flex items-center justify-between text-xs font-semibold text-white/60">
                <span>Presença local</span>
                <span className="flex items-center gap-2 text-[#FFB39F]"><span className="size-1.5 animate-pulse rounded-full bg-primary" /> Ao vivo</span>
              </div>
              <div className="absolute inset-0 grid place-items-center">
                <div className="relative grid size-44 place-items-center rounded-full border border-[#FFB39F]/25 sm:size-56">
                  <div className="absolute inset-5 rounded-full border border-[#FFB39F]/20" />
                  <div className="absolute inset-12 rounded-full border border-[#FFB39F]/20" />
                  <div className="grid size-20 place-items-center rounded-[1.5rem] bg-white p-3 shadow-2xl shadow-primary/25 sm:size-24">
                    <Image src="/brand/draft-rise-mark.png" alt="" width={600} height={600} className="size-full object-contain" />
                  </div>
                  <span className="absolute left-1 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full bg-primary text-white shadow-lg shadow-primary/30"><MapPin className="size-3.5" /></span>
                  <span className="absolute bottom-5 right-0 grid size-7 place-items-center rounded-full bg-[#FFB39F] text-secondary"><ScanLine className="size-3.5" /></span>
                </div>
              </div>
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between sm:bottom-8 sm:left-8 sm:right-8">
                <div>
                  <p className="text-xs text-white/50">O próximo passo</p>
                  <p className="mt-1 text-lg font-semibold">fica óbvio.</p>
                </div>
                <span className="grid size-10 place-items-center rounded-full border border-white/15 bg-white/10"><ArrowUpRight className="size-4" /></span>
              </div>
            </div>
          </div>
        </BlurFade>
      </div>

      <div className="relative mx-auto mt-20 grid max-w-7xl gap-5 border-t border-secondary/15 pt-5 text-sm text-secondary/60 sm:grid-cols-3 sm:gap-0">
        <div className="flex items-center gap-3 sm:border-r sm:border-secondary/15"><span className="font-semibold text-primary">01</span> Ser encontrado</div>
        <div className="flex items-center gap-3 sm:pl-6 sm:border-r sm:border-secondary/15"><span className="font-semibold text-primary">02</span> Ser escolhido</div>
        <div className="flex items-center gap-3 sm:pl-6"><span className="font-semibold text-primary">03</span> Ser lembrado</div>
      </div>
    </section>
  );
}
