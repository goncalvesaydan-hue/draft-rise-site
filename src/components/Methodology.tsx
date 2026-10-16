'use client';

import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, Check, MapPin, Search, Star, Heart, Clock3, Coffee, Phone } from 'lucide-react';
import { useState } from 'react';

const phases = [
  { title: 'Subir no ranking e ser encontrado.', text: 'Posicionamos a sua empresa no topo do Google com SEO local técnico e copywriting estratégico. Quando um cliente pesquisa pelo que faz na sua zona, é o seu negócio que aparece em destaque.', tags: ['Google Business & Ranking', 'SEO Local & Copywriting'], label: 'Da pesquisa no Google ao primeiro clique', icon: Search },
  { title: 'Impressionar e converter na hora.', text: 'Recebemos o cliente com um website empresarial rápido e persuasivo ou com um menu online pensado ao detalhe para abrir o apetite e facilitar a escolha no telemóvel.', tags: ['Websites para Empresas', 'Menus Online para Restaurantes'], label: 'Do clique à decisão de compra', icon: MapPin },
  { title: 'Atender 24/7 e fidelizar clientes.', text: 'Garantimos resposta imediata no WhatsApp através de automação inteligente e acompanhamos as avaliações do espaço para que cada cliente satisfeito traga o próximo.', tags: ['Automação de WhatsApp Bot', 'Avaliações & Reputação'], label: 'Do atendimento automático à fidelização', icon: Heart },
];

export default function Methodology() {
  const [active, setActive] = useState(0);
  const [expanded, setExpanded] = useState(true);
  const reduced = useReducedMotion();
  const phase = phases[active];
  return (
    <section id="metodologia" className="method section-shell" aria-labelledby="method-title">
      <div className="section-heading"><p className="section-label"><span /> O nosso método</p><h2 id="method-title">Não é só estar online.<br />É fazer parte da vida.</h2><p>Ligamos o que acontece no ecrã<br className="desktop-break" /> ao que faz o seu negócio especial.</p></div>
      <div className="method-grid">
        <div className="method-steps">
          {phases.map((item, index) => (
            <div key={item.title} className={`method-step ${expanded && index === active ? 'is-active' : ''}`}>
              <h3><button aria-expanded={expanded && index === active} aria-controls={`phase-content-${index}`} onClick={() => { setExpanded(current => index === active ? !current : true); setActive(index); }}><span className="step-number">0{index + 1}</span><span>{item.title}</span><span className="step-toggle" aria-hidden="true" /></button></h3>
              <div id={`phase-content-${index}`} className="disclosure-panel" data-open={expanded && active === index} aria-hidden={!expanded || active !== index} inert={!expanded || active !== index}><div className="disclosure-inner"><div className="step-content"><p>{item.text}</p><div className="tags">{item.tags.map(tag => <span key={tag}>{tag}</span>)}</div></div></div></div>
            </div>
          ))}
          <a href="#contacto" className="text-link">Encontre o seu ponto de partida <ArrowUpRight size={18} /></a>
        </div>
        <div className={`method-preview preview-${active}`}>
          <div className="preview-top"><span className="status-dot" /><span>{phase.label}</span><span className="preview-counter">0{active + 1} / 03</span></div>
          <div className="preview-stage">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={active} className="demo-card" initial={reduced ? false : { opacity: 0, y: 14, rotate: -2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} exit={reduced ? { opacity: 0 } : { opacity: 0, y: -10, rotate: 2 }} transition={{ duration: reduced ? 0 : 0.24 }}>
                {active === 0 && <><div className="demo-search"><Search size={17} /><span>Um bom café perto de mim</span></div><div className="demo-image"><Image src="/images/neighbourhood-cafe.webp" alt="" fill sizes="360px" /><span><MapPin size={13} /> Mesmo aqui ao lado</span></div><div className="demo-info"><div><strong>O café da esquina</strong><p>Café de bairro · Pequenos-almoços</p></div><span className="demo-arrow"><ArrowUpRight /></span></div><div className="demo-profile-facts"><span><Clock3 size={13} aria-hidden="true" /> Seg–sáb · 08h–18h</span><span><Coffee size={13} aria-hidden="true" /> Café e esplanada</span><span><Phone size={13} aria-hidden="true" /> Contacto à mão</span></div></>}
                {active === 1 && <><div className="demo-brand">O café da esquina<span>Est. hoje</span></div><div className="demo-image"><Image src="/images/neighbourhood-cafe.webp" alt="" fill sizes="360px" /></div><div className="demo-info"><div><strong>Há sempre lugar<br />para mais um.</strong><p>Bom café. Boas conversas.</p></div></div><div className="demo-action"><span>Uma mesa à sua espera</span><Check size={18} /></div></>}
                {active === 2 && <div className="review-demo"><span className="review-heart"><Heart size={38} /></span><div className="demo-stars" aria-label="Cinco estrelas">{Array.from({ length: 5 }, (_, i) => <Star key={i} size={22} fill="currentColor" />)}</div><strong>Daqueles lugares<br />a que apetece voltar.</strong><p>Uma boa experiência merece<br />ser partilhada.</p><div className="demo-action"><span>A próxima visita começa aqui</span><Heart size={17} /></div></div>}
              </motion.div>
            </AnimatePresence>
            <span className="preview-orbit orbit-one" aria-hidden="true" /><span className="preview-orbit orbit-two" aria-hidden="true" />
          </div>
          <p className="demo-disclaimer">Exemplo ilustrativo de uma experiência local.</p>
        </div>
      </div>
    </section>
  );
}
