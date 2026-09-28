import React from 'react';
import { CreditCard, Star, Smartphone } from 'lucide-react';

export default function Tangibility() {
  const touchpoints = [
    {
      title: "Placas de Avaliação",
      description: "Transforme cada cliente satisfeito em uma estrela no Google instantaneamente. Aumente a sua prova social com um toque.",
      icon: <Star className="w-6 h-6 text-primary" />,
      tag: "Prova Social",
    },
    {
      title: "Menu Online as a Service",
      description: "Elimine custos de impressão e erros de pedido. Atualizações em tempo real para a melhor experiência do cliente.",
      icon: <Smartphone className="w-6 h-6 text-primary" />,
      tag: "Eficiência",
    },
    {
      title: "Pagamentos Facilitados",
      description: "Reduza a fricção no checkout. O cliente acessa, pede e paga via NFC sem esperas desnecessárias.",
      icon: <CreditCard className="w-6 h-6 text-primary" />,
      tag: "Conversão",
    },
  ];

  return (
    <section id="solucoes" className="bg-[#f6f7f9] px-5 py-24 md:px-8 md:py-32">
      <div id="tangibilidade" className="mx-auto max-w-7xl">
        <div className="mb-16 grid gap-7 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
          <p className="text-sm font-bold text-primary">Na prática</p>
          <div>
          <h2 className="font-heading text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.055em] text-secondary md:text-6xl">
            A ponte entre o balcão e o telemóvel.
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Tecnologia visível no momento certo, desenhada para reduzir hesitação e tornar o próximo passo óbvio.
          </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {touchpoints.map((item, i) => (
            <article key={i} className="group min-h-[23rem] border border-slate-200 bg-white p-7 transition-colors hover:border-primary/40 md:p-8">
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
        <div className="relative mt-20 overflow-hidden rounded-[2rem] bg-secondary p-8 text-white md:mt-28 md:p-16">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/10 blur-[100px] rounded-full" />

          <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
            <div>
              <h2 className="font-heading text-4xl font-semibold leading-[1.02] tracking-[-0.055em] md:text-6xl">
                Presença que faz o trabalho avançar.
              </h2>
              <p className="mb-8 mt-8 text-lg leading-8 text-slate-300">
                Na Draft & Rise, acreditamos que estar online não é suficiente. O que importa é a <strong>Performance</strong>.
                <br /><br />
                Não construímos apenas sites; criamos máquinas de conversão. A nossa missão é eliminar cada ponto de fricção entre o seu cliente e o seu lucro, utilizando a tecnologia mais moderna de NFC, automação e design estratégico.
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
                    <div className="mx-auto mb-6 grid size-20 place-items-center rounded-2xl bg-primary text-3xl font-black shadow-lg shadow-primary/40">D&amp;R</div>
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
