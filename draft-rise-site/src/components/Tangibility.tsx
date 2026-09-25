import React from 'react';
import { CheckCircle2, CreditCard, Star, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Tangibility() {
  const touchpoints = [
    {
      title: "Placas de Avaliação",
      description: "Transforme cada cliente satisfeito em uma estrela no Google instantaneamente. Aumente a sua prova social com um toque.",
      icon: <Star className="w-6 h-6 text-primary" />,
      tag: "Prova Social",
      imagePlaceholder: "Mockup Placa Estrelas Google"
    },
    {
      title: "Menu Online as a Service",
      description: "Elimine custos de impressão e erros de pedido. Atualizações em tempo real para a melhor experiência do cliente.",
      icon: <Smartphone className="w-6 h-6 text-primary" />,
      tag: "Eficiência",
      imagePlaceholder: "Mockup Placa Menu QR"
    },
    {
      title: "Pagamentos Facilitados",
      description: "Reduza a fricção no checkout. O cliente acessa, pede e paga via NFC sem esperas desnecessárias.",
      icon: <CreditCard className="w-6 h-6 text-primary" />,
      tag: "Conversão",
      imagePlaceholder: "Mockup Placa Pagamento NFC"
    },
  ];

  return (
    <section className="py-24 px-6 bg-slate-50">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-secondary mb-6 tracking-tight">
            A ponte entre o físico <br />
            <span className="text-primary">e o digital.</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Não entregamos apenas software. Entregamos touchpoints inteligentes que transformam a experiência no seu estabelecimento.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-32">
          {touchpoints.map((item, i) => (
            <div key={i} className="group bg-white rounded-[32px] p-2 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="aspect-square rounded-[24px] bg-slate-100 mb-6 overflow-hidden relative flex items-center justify-center">
                <div className="text-center p-8 opacity-40 group-hover:opacity-100 transition-opacity">
                  <p className="text-slate-400 text-sm italic">{item.imagePlaceholder}</p>
                </div>
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm text-secondary text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                  {item.tag}
                </div>
              </div>
              <div className="p-6 pt-0">
                <div className="flex items-center gap-3 mb-3">
                  {item.icon}
                  <h3 className="text-xl font-bold text-secondary">{item.title}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {item.description}
                </p>
                <div className="flex items-center gap-2 text-primary font-bold text-sm group-hover:gap-3 transition-all cursor-pointer">
                  Saiba mais <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* About Section: Performance over Presence */}
        <div className="bg-secondary rounded-[40px] p-10 md:p-20 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/10 blur-[100px] rounded-full" />

          <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
            <div>
              <h2 className="text-3xl md:text-5xl font-heading font-extrabold mb-8 leading-tight">
                Performance <br />
                <span className="text-primary">over Presence.</span>
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                Na Draft & Rise, acreditamos que estar online não é suficiente. O que importa é a <strong>Performance</strong>.
                <br /><br />
                Não construímos apenas sites; criamos máquinas de conversão. A nossa missão é eliminar cada ponto de fricção entre o seu cliente e o seu lucro, utilizando a tecnologia mais moderna de NFC, automação e design estratégico.
              </p>
              <div className="flex items-center gap-6">
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-primary">100%</span>
                  <span className="text-gray-400 text-sm">Foco em Resultados</span>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-primary">Fast</span>
                  <span className="text-gray-400 text-sm">Execução Ágil</span>
                </div>
              </div>
            </div>
            <div className="relative aspect-square max-w-md mx-auto">
               <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
               <div className="relative z-10 w-full h-full rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-center p-12 text-center">
                  <div>
                    <div className="w-20 h-20 bg-primary rounded-2xl mx-auto mb-6 flex items-center justify-center text-3xl shadow-lg shadow-primary/40">🚀</div>
                    <h4 className="text-2xl font-bold mb-2">Prontos para o Salto?</h4>
                    <p className="text-gray-400">Elevamos o seu negócio ao nível profissional.</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}