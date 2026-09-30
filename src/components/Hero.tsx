import Image from 'next/image';
import { ArrowDown, ArrowUpRight, MapPin, MousePointer2 } from 'lucide-react';

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="hero-intro"><span className="status-dot" /> Grandes ideias. Negócios locais.</p>
        <h1 id="hero-title">O próximo<br />grande lugar<br />é o seu<span className="hero-period">.</span></h1>
        <p className="hero-description">O seu negócio já tem alma.<br />Damos-lhe uma presença digital à altura.</p>
        <a className="button button-dark" href="#contacto">Vamos dar o próximo passo <span><ArrowUpRight size={21} /></span></a>
        <a className="hero-explore" href="#metodologia"><ArrowDown size={17} /> Descubra como ligamos os pontos</a>
      </div>
      <div className="hero-visual">
        <div className="hero-photo"><Image src="/images/neighbourhood-cafe.webp" alt="Esplanada de um café de bairro, com portas azuis e luz de fim de tarde — imagem conceptual" fill sizes="(max-width: 760px) 100vw, 50vw" preload /></div>
        <div className="hero-sticker" aria-hidden="true"><span>Da rua</span><ArrowUpRight strokeWidth={1.5} /><span>ao ecrã.</span></div>
        <div className="location-card"><span className="location-icon"><MapPin size={24} /></span><div><span className="location-label">O seu próximo cliente</span><strong>está mais perto do que pensa.</strong></div><span className="location-dot" /></div>
        <span className="cursor-note" aria-hidden="true"><MousePointer2 size={24} fill="currentColor" /><span>O seu negócio, em destaque</span></span>
        <span className="image-caption">Uma ideia do que podemos construir juntos.</span>
      </div>
      <div className="hero-bottom"><span>Estratégia que se vê. Resultados que se sentem.</span><div><span>Presença digital</span><span>Experiência local</span><span>Crescimento</span></div></div>
    </section>
  );
}
