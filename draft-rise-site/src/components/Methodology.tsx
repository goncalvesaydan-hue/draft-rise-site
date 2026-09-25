import React from 'react';
import { ArrowRight, Search, Zap, MessageSquare, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Methodology() {
  return (
    <section className="py-24 px-6 bg-background">
      <div className="container max-w-6xl mx-auto">

        {/* Section 1: The Pain (Connection) */}
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-secondary mb-6 tracking-tight">
            O problema não é o seu produto, <br />
            <span className="text-primary">é a sua visibilidade.</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Muitos negócios locais são excelentes no que fazem, mas permanecem invisíveis para quem mais importa: o cliente que está a procurar agora mesmo no Google.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-32">
          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 group hover:border-primary/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-slate-200 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-secondary mb-3">Invisível no Mapa</h3>
            <p className="text-gray-600 leading-relaxed">
              O seu cliente potencial pesquisa pelo seu serviço, mas encontra o seu concorrente. Se não domina o Google Business, você não existe para o novo cliente.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 group hover:border-primary/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-slate-200 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-secondary mb-3">Sobrecarga Manual</h3>
            <p className="text-gray-600 leading-relaxed">
              Perder horas a responder as mesmas perguntas no WhatsApp ou a gerir marcações manualmente. A falta de automação rouba o seu tempo de gestão.
            </p>
          </div>
        </div>

        {/* Section 2: The Methodology (Draft -> Rise) */}
        <div className="relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-secondary mb-4">
              A Metodologia Draft <span className="text-primary">→</span> Rise
            </h2>
            <p className="text-gray-600 text-lg">Uma jornada estratégica de crescimento digital.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-0 rounded-[40px] overflow-hidden border border-slate-200 shadow-2xl">

            {/* DRAFT - Visibilidade */}
            <div className="p-10 md:p-16 bg-secondary text-white flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-widest border border-white/20">Fase 01</span>
                  <h3 className="text-4xl font-heading font-extrabold">Draft</h3>
                </div>
                <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                  O foco é a <strong>Visibilidade</strong>. Tornamos o seu negócio irresistível e visível para quem procura.
                </p>
                <ul className="space-y-4">
                  {[
                    { icon: <Search className="w-5 h-5" />, text: "Otimização Estratégica de Google Business" },
                    { icon: <Smartphone className="w-5 h-5" />, text: "Website Design Premium focado em Conversão" },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-300">
                      <span className="p-1 rounded-md bg-primary/20 text-primary">{item.icon}</span>
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10 italic text-gray-400 text-sm">
                "Ser a primeira e melhor opção nas buscas locais."
              </div>
            </div>

            {/* RISE - Conversão */}
            <div className="p-10 md:p-16 bg-white text-secondary flex flex-col justify-between relative">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <Zap className="w-24 h-24 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20">Fase 02</span>
                  <h3 className="text-4xl font-heading font-extrabold text-secondary">Rise</h3>
                </div>
                <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                  O foco é a <strong>Conversão</strong>. Maximizamos a experiência do cliente e a eficiência operacional.
                </p>
                <ul className="space-y-4">
                  {[
                    { icon: <Zap className="w-5 h-5" />, text: "Menu Online as a Service (SaaS)" },
                    { icon: <MessageSquare className="w-5 h-5" />, text: "WhatsApp Bot para Automação de Marcações" },
                    { icon: <Smartphone className="w-5 h-5" />, text: "Touchpoints Inteligentes (Placas NFC/QR)" },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-600">
                      <span className="p-1 rounded-md bg-primary/10 text-primary">{item.icon}</span>
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 p-6 rounded-2xl bg-slate-50 border border-slate-100 italic text-gray-500 text-sm">
                "Tornar o negócio invisível para a concorrência e irresistível para o cliente."
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}