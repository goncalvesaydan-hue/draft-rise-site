import React from 'react';
import { Search, Zap, MessageSquare, Smartphone } from 'lucide-react';

export default function Methodology() {
  return (
    <section id="metodologia" className="bg-background px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-7xl">

        {/* Section 1: The Pain (Connection) */}
        <div className="mb-20 grid gap-8 border-b border-slate-200 pb-16 lg:grid-cols-[.78fr_1.22fr] lg:items-end">
          <p className="text-sm font-bold text-primary">O que muda</p>
          <div>
          <h2 className="font-heading text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.055em] text-secondary md:text-6xl">
            Um bom negócio merece ser encontrado no momento certo.
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Transformamos pontos soltos da presença digital num caminho coerente, desde a descoberta até à experiência no estabelecimento.
          </p>
          </div>
        </div>

        <div className="grid gap-px overflow-hidden border border-slate-200 bg-slate-200 md:grid-cols-2">
          <div className="bg-white p-8 md:p-10">
            <div className="mb-8 grid size-12 place-items-center rounded-full bg-slate-100 text-secondary">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-semibold tracking-tight text-secondary">Invisível no mapa</h3>
            <p className="mt-3 max-w-md leading-7 text-slate-600">
              O seu cliente potencial pesquisa pelo seu serviço, mas encontra o seu concorrente. Se não domina o Google Business, você não existe para o novo cliente.
            </p>
          </div>

          <div className="bg-white p-8 md:p-10">
            <div className="mb-8 grid size-12 place-items-center rounded-full bg-slate-100 text-secondary">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-semibold tracking-tight text-secondary">Sobrecarga manual</h3>
            <p className="mt-3 max-w-md leading-7 text-slate-600">
              Perder horas a responder as mesmas perguntas no WhatsApp ou a gerir marcações manualmente. A falta de automação rouba o seu tempo de gestão.
            </p>
          </div>
        </div>

        {/* Section 2: The Methodology (Draft -> Rise) */}
        <div className="mt-28">
          <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2 className="font-heading text-4xl font-semibold tracking-[-0.05em] text-secondary md:text-5xl">
              Draft → Rise
            </h2>
            <p className="max-w-sm text-base leading-7 text-slate-600">Uma sequência pensada para criar presença antes de acelerar conversão.</p>
          </div>

          <div className="grid overflow-hidden rounded-[2rem] border border-slate-200 lg:grid-cols-2">

            {/* DRAFT - Visibilidade */}
            <div className="flex flex-col justify-between bg-secondary p-9 text-white md:p-14">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold tracking-wide">01</span>
                  <h3 className="font-heading text-4xl font-semibold tracking-[-0.05em]">Draft</h3>
                </div>
                <p className="mb-8 text-lg leading-8 text-slate-300">
                  O foco é a <strong>Visibilidade</strong>. Tornamos o seu negócio irresistível e visível para quem procura.
                </p>
                <ul className="space-y-4">
                  {[
                    { icon: <Search className="w-5 h-5" />, text: "Otimização Estratégica de Google Business" },
                    { icon: <Smartphone className="w-5 h-5" />, text: "Website Design Premium focado em Conversão" },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-300">
                      <span className="rounded-md bg-primary/20 p-1 text-primary">{item.icon}</span>
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 border-t border-white/10 pt-5 text-sm italic text-slate-400">
                &ldquo;Ser a primeira e melhor opção nas buscas locais.&rdquo;
              </div>
            </div>

            {/* RISE - Conversão */}
            <div className="relative flex flex-col justify-between bg-[#f6f7f9] p-9 text-secondary md:p-14">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <Zap className="w-24 h-24 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold tracking-wide text-primary">02</span>
                  <h3 className="font-heading text-4xl font-semibold tracking-[-0.05em] text-secondary">Rise</h3>
                </div>
                <p className="mb-8 text-lg leading-8 text-slate-600">
                  O foco é a <strong>Conversão</strong>. Maximizamos a experiência do cliente e a eficiência operacional.
                </p>
                <ul className="space-y-4">
                  {[
                    { icon: <Zap className="w-5 h-5" />, text: "Menu Online as a Service (SaaS)" },
                    { icon: <MessageSquare className="w-5 h-5" />, text: "WhatsApp Bot para Automação de Marcações" },
                    { icon: <Smartphone className="w-5 h-5" />, text: "Touchpoints Inteligentes (Placas NFC/QR)" },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-600">
                      <span className="rounded-md bg-primary/10 p-1 text-primary">{item.icon}</span>
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 border-t border-slate-200 pt-5 text-sm italic text-slate-500">
                &ldquo;Tornar o negócio invisível para a concorrência e irresistível para o cliente.&rdquo;
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
