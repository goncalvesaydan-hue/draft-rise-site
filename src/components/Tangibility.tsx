import { ArrowUpRight, CreditCard, Smartphone, Star } from 'lucide-react';
import { BlurFade } from '@/components/ui/blur-fade';

const touchpoints = [
  { title: 'Placas de avaliação', description: 'Peça uma avaliação no momento certo e transforme satisfação em prova social.', icon: Star, tag: 'Confiança' },
  { title: 'Menu online', description: 'Informação atualizada, acessível no telemóvel e pronta a responder antes do pedido.', icon: Smartphone, tag: 'Clareza' },
  { title: 'Pagamentos facilitados', description: 'Menos espera e uma passagem mais natural entre escolher e pagar.', icon: CreditCard, tag: 'Fluidez' },
];

export default function Tangibility() {
  return (
    <section id="solucoes" className="bg-[#EDF2F8] px-5 py-24 md:px-8 md:py-32">
      <div id="tangibilidade" className="mx-auto max-w-7xl">
        <BlurFade className="grid gap-7 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
          <p className="text-sm font-semibold text-primary">Na experiência</p>
          <div>
            <h2 className="max-w-4xl text-balance font-heading text-4xl font-semibold leading-[1.02] tracking-[-0.06em] text-secondary md:text-6xl">
              Pequenos pontos de contacto. Uma experiência muito mais clara.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-secondary/60">
              Tecnologia discreta no momento certo, desenhada para reduzir hesitação e tornar o próximo passo óbvio.
            </p>
          </div>
        </BlurFade>

        <div className="mt-16 border-y border-secondary/15">
          {touchpoints.map((item, index) => {
            const Icon = item.icon;
            return (
              <BlurFade key={item.title} delay={0.06 + index * 0.06} className="group grid gap-5 border-b border-secondary/15 py-8 last:border-b-0 md:grid-cols-[5rem_1fr_1fr_auto] md:items-center md:gap-8">
                <span className="text-sm font-semibold text-primary">0{index + 1}</span>
                <div className="flex items-center gap-4">
                  <span className="grid size-11 place-items-center rounded-full bg-white text-primary shadow-sm"><Icon className="size-5" /></span>
                  <div>
                    <p className="text-xs font-semibold text-secondary/45">{item.tag}</p>
                    <h3 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-secondary">{item.title}</h3>
                  </div>
                </div>
                <p className="max-w-md leading-7 text-secondary/60 md:pl-3">{item.description}</p>
                <ArrowUpRight className="hidden size-5 text-secondary/30 transition-colors group-hover:text-primary md:block" />
              </BlurFade>
            );
          })}
        </div>

        <div id="contacto" className="mt-24">
          <BlurFade className="relative overflow-hidden rounded-[2rem] bg-secondary p-8 text-white md:p-16">
            <div aria-hidden="true" className="absolute -right-24 -top-24 size-72 rounded-full bg-primary/25 blur-[90px]" />
            <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-sm font-semibold text-[#FFB39F]">Próximo passo</p>
                <h2 className="mt-5 max-w-3xl text-balance font-heading text-4xl font-semibold leading-[1.02] tracking-[-0.06em] md:text-6xl">
                  O digital feito para elevar o que já funciona.
                </h2>
                <p className="mt-6 max-w-xl text-lg leading-8 text-white/60">Estratégia, experiência e tecnologia para tornar o seu negócio mais fácil de escolher.</p>
              </div>
              <a href="mailto:ola@draftrise.pt" className="inline-flex h-14 items-center justify-center gap-3 rounded-full bg-primary px-7 text-base font-semibold text-white transition-colors hover:bg-[#FF704C]">Falar connosco <ArrowUpRight className="size-5" /></a>
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  );
}
