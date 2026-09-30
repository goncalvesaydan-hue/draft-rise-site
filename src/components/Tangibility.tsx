import { ArrowUpRight, Globe2, MapPin, MessageCircle, Smartphone, Star, Zap } from 'lucide-react';
import Contact from './Contact';
import ServiceDetails from './ServiceDetails';

const services = [
  { title: 'Uma presença que abre portas.', description: 'Websites e presença no Google que mostram quem é e tornam mais fácil chegar até si.', icon: Globe2, className: 'service-web', tags: 'Web design · Google Business · SEO local', details: 'Estrutura, conteúdo e design pensados para telemóvel. Informação útil, contactos à mão e uma identidade que se reconhece do primeiro clique à porta do espaço.' },
  { title: 'Menos passos. Mais encontros.', description: 'Menus digitais, marcações e respostas que tornam o dia mais simples para todos.', icon: Smartphone, className: 'service-experience', tags: 'Menus digitais · Marcações · Automação', details: 'Identificamos as tarefas que se repetem e os pontos onde os clientes hesitam. Desenhamos caminhos mais curtos para consultar, marcar ou pedir informação.' },
  { title: 'Boas experiências circulam.', description: 'Pontos de contacto no espaço que transformam uma visita numa relação.', icon: Star, className: 'service-reputation', tags: 'Avaliações · QR & NFC · Reputação', details: 'Ligamos o espaço físico ao digital com suportes de avaliação e acesso rápido à informação. Um convite à partilha, no momento em que faz sentido.' },
];

export default function Tangibility() {
  return (
    <>
      <section id="solucoes" className="solutions section-shell" aria-labelledby="solutions-title">
        <div className="solutions-heading"><div><p className="section-label"><span /> O que fazemos</p><h2 id="solutions-title">Digital com os pés<br />no seu negócio.</h2></div><p>As ferramentas certas, a trabalhar juntas.<br />Sem complicar o que deve ser simples.</p></div>
        <div className="services-grid">{services.map((service, index) => {
          const Icon = service.icon;
          return <article className={`service-card ${service.className}`} key={service.title}>
            <div className="service-art" aria-hidden="true">
              {index === 0 && <div className="mini-browser"><div className="browser-chrome"><i /><i /><i /><span>O seu negócio</span></div><div className="browser-body"><Globe2 size={34} strokeWidth={1.3} /><span>Um lugar.<br />Mil possibilidades.</span><div className="browser-button"><ArrowUpRight size={17} /></div></div><div className="map-tag"><MapPin size={15} /> É mesmo aqui.</div></div>}
              {index === 1 && <div className="appointment-art"><span className="appointment-zap"><Zap size={25} /></span><span className="appointment-title">Até já!</span><div className="appointment-line"><span>O próximo encontro</span><CheckMark /></div><div className="appointment-message"><MessageCircle size={18} /><span>Tudo tratado.<br /><strong>Só falta aparecer.</strong></span></div></div>}
              {index === 2 && <div className="reputation-art"><span className="reputation-star"><Star size={72} strokeWidth={1.2} /></span><span className="reputation-note">Vale a pena<br />partilhar.</span><span className="reputation-rating">{[1,2,3,4,5].map(i => <Star key={i} size={16} fill="currentColor" />)}</span></div>}
            </div>
            <div className="service-content"><Icon className="service-icon" size={21} /><h3>{service.title}</h3><p>{service.description}</p><ServiceDetails details={service.details} tags={service.tags} /></div>
          </article>;
        })}</div>
      </section>
      <section className="manifesto section-shell"><span className="manifesto-symbol" aria-hidden="true">&</span><div><p>O que nos move</p><h2>Por trás de cada negócio,<br />há alguém que acredita.<br />Nós também.</h2></div><p className="manifesto-copy">Trabalhamos perto de quem faz acontecer. Ouvimos primeiro, desenhamos com intenção e ligamos cada ideia ao dia a dia do seu negócio.</p></section>
      <Contact />
    </>
  );
}

function CheckMark() { return <span className="appointment-check">✓</span>; }
