import Image from 'next/image';
import { ArrowDown, ArrowUpRight, MapPin, MousePointer2 } from 'lucide-react';

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="hero-intro"><span className="status-dot" /> Grandes ideias. Negócios locais.</p>
        <h1 id="hero-title">O próximo<br />grande lugar<br />é o seu<span className="hero-period">.</span></h1>
        <p className="hero-description">Websites para empresas, subida no ranking do Google,<br className="desktop-break" /> automação de WhatsApp e menus online que fazem o seu negócio crescer.</p>
        <a className="button button-dark" href="#contacto">Vamos dar o próximo passo <span><ArrowUpRight size={21} /></span></a>
        <a className="hero-explore" href="#solucoes"><ArrowDown size={17} /> Conheça os nossos serviços principais</a>
      </div>
      <div className="hero-visual">
        <div className="hero-photo"><Image src="/images/neighbourhood-cafe.webp" alt="Esplanada de um café de bairro, com portas azuis e luz de fim de tarde — imagem conceptual" fill sizes="(max-width: 760px) 100vw, 50vw" preload /></div>
        <div className="hero-sticker" aria-hidden="true"><span>Mais ranking.</span><ArrowUpRight strokeWidth={1.5} /><span>Mais clientes.</span></div>
        <div className="location-card"><span className="location-icon"><MapPin size={24} /></span><div><span className="location-label">Top 1 nas pesquisas locais</span><strong>SEO, Copywriting &amp; Conversão.</strong></div><span className="location-dot" /></div>
        <span className="cursor-note" aria-hidden="true"><MousePointer2 size={24} fill="currentColor" /><span>O seu negócio no topo</span></span>
        <span className="image-caption">Uma ideia do que podemos construir juntos.</span>
      </div>
      <div className="hero-bottom"><span>Estratégia que se vê. Resultados que se sentem.</span><div><span>Websites Empresariais</span><span>Google Business &amp; SEO</span><span>WhatsApp Bot</span><span>Menus Online</span></div></div>
    </section>
  );
}
