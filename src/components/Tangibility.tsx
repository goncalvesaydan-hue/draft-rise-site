import React from 'react';
import Image from 'next/image';
import { CreditCard, Star, Smartphone } from 'lucide-react';

export default function Tangibility() {
  const touchpoints = [
    {
      title: "Placas de Avaliação",
      description: "Peça uma avaliação no momento certo e transforme satisfação em prova social — sem interromper a experiência.",
      icon: <Star className="w-6 h-6 text-primary" />,
      tag: "Prova Social",
    },
    {
      title: "Menu Online as a Service",
      description: "Informação sempre atualizada, acessível no telemóvel e pronta a responder às dúvidas antes do pedido.",
      icon: <Smartphone className="w-6 h-6 text-primary" />,
      tag: "Eficiência",
    },
    {
      title: "Pagamentos Facilitados",
      description: "Menos espera, menos passos perdidos e uma passagem mais natural entre escolher e pagar.",
      icon: <CreditCard className="w-6 h-6 text-primary" />,
      tag: "Conversão",
    },
  ];

  return (
    <section id="solucoes" className="bg-[#EDF2F8] px-5 py-24 md:px-8 md:py-32">
      <div id="tangibilidade" className="mx-auto max-w-7xl">
        <div className="mb-16 grid gap-7 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
          <p className="section-kicker font-bold text-primary">Na experiência</p>
          <div>
          <h2 className="font-heading text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.055em] text-secondary md:text-6xl">
            Pequenos pontos de contacto. Uma experiência muito mais clara.
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Tecnologia discreta no momento certo, desenhada para reduzir hesitação e tornar o próximo passo óbvio.
          </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {touchpoints.map((item, i) => (
            <article key={i} className="group min-h-[23rem] border hairline bg-white p-7 transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_18px_45px_rgba(32,43,56,0.08)] md:p-8">
              <div className="flex items-start justify-between">
                <span className="grid size-12 place-items-center rounded-full bg-primary/10">{item.icon}</span>
                <span className="text-xs font-bold text-slate-500">0{i + 1}</span>
              </div>
              <div className="mt-20">
                  <p className="mb-3 text-xs font-bold text-primary">{item.tag}</p>
                  <h3 className="text-2xl font-semibold tracking-[-0.035em] text-secondary">{item.title}</h3>
                <p className="mt-4 leading-7 text-slate-600">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* About Section: Performance over Presence */}
        <div id="contacto" className="relative mt-20 overflow-hidden rounded-[2rem] bg-secondary p-8 text-white md:mt-28 md:p-16">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/10 blur-[100px] rounded-full" />

          <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
            <div>
              <h2 className="font-heading text-4xl font-semibold leading-[1.02] tracking-[-0.055em] md:text-6xl">
                Uma presença que não fica parada.
              </h2>
              <p className="mb-8 mt-8 text-lg leading-8 text-slate-300">
                Estar online é o ponto de partida. O que importa é o que acontece a seguir.
                <br /><br />
                Desenhamos os momentos entre a pesquisa, a visita e a decisão — com design, automação e tecnologia que trabalham em conjunto.
              </p>
              <div className="flex items-center gap-6">
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-primary">100%</span>
                  <span className="text-slate-400 text-sm">Foco em resultados</span>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-primary">Ágil</span>
                  <span className="text-slate-400 text-sm">Execução com clareza</span>
                </div>
              </div>
            </div>
            <div className="relative aspect-square max-w-md mx-auto">
               <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
               <div className="relative z-10 w-full h-full rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-center p-12 text-center">
                  <div>
                    <div className="mx-auto mb-6 grid size-20 place-items-center overflow-hidden rounded-2xl bg-white p-2 shadow-lg shadow-primary/40"><Image src="/brand/draft-rise-mark.png" alt="" width={600} height={600} className="size-full object-contain" /></div>
                    <h3 className="text-2xl font-bold mb-2">O próximo nível, bem desenhado.</h3>
                    <p className="text-slate-400">Cada interação deve tornar o negócio mais fácil de escolher.</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
