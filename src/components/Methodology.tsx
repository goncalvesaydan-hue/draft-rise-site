import { ArrowUpRight, MessageSquare, Search, Smartphone, Zap } from 'lucide-react';
import { BlurFade } from '@/components/ui/blur-fade';

const phases = [
  {
    number: '01',
    title: 'Draft',
    label: 'Ser encontrado',
    description: 'Organizamos os sinais que fazem alguém parar, confiar e visitar.',
    items: ['Google Business otimizado', 'Website desenhado para conversão'],
    icon: Search,
  },
  {
    number: '02',
    title: 'Rise',
    label: 'Ser escolhido',
    description: 'Tiramos fricção do caminho entre a intenção e a ação.',
    items: ['Menu online sempre atualizado', 'Marcações e respostas automáticas'],
    icon: Zap,
  },
];

export default function Methodology() {
  return (
    <section id="metodologia" className="bg-white px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-7xl">
        <BlurFade className="grid gap-8 border-b border-secondary/15 pb-16 lg:grid-cols-[.7fr_1.3fr] lg:items-end">
          <p className="text-sm font-semibold text-primary">O ponto de partida</p>
          <div>
            <h2 className="max-w-4xl text-balance font-heading text-4xl font-semibold leading-[1.02] tracking-[-0.06em] text-secondary md:text-6xl">
              O melhor trabalho do mundo não ajuda se ninguém o encontra.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-secondary/60">
              A presença digital não é uma montra. É o caminho que leva alguém da dúvida ao primeiro passo.
            </p>
          </div>
        </BlurFade>

        <div className="mt-20 grid gap-12 lg:grid-cols-[.72fr_1.28fr] lg:gap-20">
          <BlurFade delay={0.05} className="lg:pt-3">
            <p className="max-w-sm text-2xl font-medium leading-tight tracking-[-0.04em] text-secondary md:text-3xl">
              Quando tudo comunica a mesma coisa, escolher fica natural.
            </p>
            <div className="mt-10 flex items-center gap-4 text-sm text-secondary/55">
              <span className="grid size-10 place-items-center rounded-full bg-[#EDF2F8] text-secondary"><MessageSquare className="size-4" /></span>
              Menos ruído. Mais próximos passos.
            </div>
          </BlurFade>

          <div className="divide-y divide-secondary/15 border-y border-secondary/15">
            {phases.map((phase, index) => {
              const Icon = phase.icon;
              return (
                <BlurFade key={phase.number} delay={0.1 + index * 0.08} className="group grid gap-7 py-9 md:grid-cols-[5rem_1fr_auto] md:items-start md:gap-8">
                  <span className="text-sm font-semibold text-primary">{phase.number}</span>
                  <div>
                    <div className="flex items-center gap-3">
                      <Icon className="size-5 text-primary" />
                      <h3 className="text-3xl font-semibold tracking-[-0.05em] text-secondary">{phase.title}</h3>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-secondary/50">{phase.label}</p>
                    <p className="mt-4 max-w-lg leading-7 text-secondary/65">{phase.description}</p>
                    <ul className="mt-5 grid gap-2 text-sm text-secondary/70 sm:grid-cols-2">
                      {phase.items.map((item) => <li key={item} className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-primary" />{item}</li>)}
                    </ul>
                  </div>
                  <ArrowUpRight className="hidden size-5 text-secondary/30 transition-colors group-hover:text-primary md:block" />
                </BlurFade>
              );
            })}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-5 border-t border-secondary/15 pt-6 text-sm text-secondary/55 sm:flex-row sm:items-center sm:justify-between">
          <span>Da rua ao ecrã, sem fricção.</span>
          <span className="flex items-center gap-2"><Smartphone className="size-4 text-primary" /> Pensado para o momento certo.</span>
        </div>
      </div>
    </section>
  );
}
